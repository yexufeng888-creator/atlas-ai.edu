#!/usr/bin/env python3
"""Authenticated, quota-limited Personal Intelligence OS API for ATLAS."""

import json
import logging
import os
import re
import sqlite3
import threading
import uuid
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, urlsplit
from urllib.request import Request, urlopen


API_HOST = os.environ.get("ATLAS_API_HOST", "127.0.0.1")
API_PORT = int(os.environ.get("ATLAS_API_PORT", "8787"))
SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_PUBLISHABLE_KEY = os.environ.get("SUPABASE_PUBLISHABLE_KEY", "")
OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://127.0.0.1:11434").rstrip("/")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "qwen2.5:1.5b")
DAILY_LIMIT = int(os.environ.get("ATLAS_DAILY_LIMIT", "20"))
DATABASE_PATH = os.environ.get("ATLAS_QUOTA_DB", "/var/lib/atlas-api/usage.sqlite3")
ALLOWED_ORIGINS = frozenset(
    origin.strip()
    for origin in os.environ.get(
        "ATLAS_ALLOWED_ORIGINS",
        "https://wwwatlasai.com,http://localhost:8000,http://127.0.0.1:8000,http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
)
MAX_REQUEST_BYTES = 32 * 1024
MAX_MESSAGES = 6
MAX_MESSAGE_CHARS = 1000
SYSTEM_PROMPT = (
    "你的名字是 ATLAS，是一位友好、可靠的中文 AI 助手。"
    "回答清晰实用；用户问候或询问身份时，简洁自然地介绍自己。"
    "不要每次回答都重复自我介绍；不确定时坦诚说明，不要编造。"
)
VALID_MEMORY_CATEGORIES = frozenset({"personal", "preferences", "work", "relationships"})
VALID_TASK_STATUSES = frozenset({"todo", "in_progress", "done"})
VALID_TASK_PRIORITIES = frozenset({"high", "medium", "low"})
INFERENCE_SLOT = threading.BoundedSemaphore(1)
LOGGER = logging.getLogger("atlas-api")


class SupabaseUnavailable(Exception):
    pass


def now_iso():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def utc_day():
    return datetime.now(timezone.utc).date().isoformat()


def initialize_database(database_path=DATABASE_PATH):
    os.makedirs(os.path.dirname(os.path.abspath(database_path)), mode=0o750, exist_ok=True)
    with sqlite3.connect(database_path, timeout=10) as database:
        database.execute(
            """
            CREATE TABLE IF NOT EXISTS daily_usage (
                user_id TEXT NOT NULL,
                usage_day TEXT NOT NULL,
                request_count INTEGER NOT NULL,
                PRIMARY KEY (user_id, usage_day)
            )
            """
        )
        database.execute(
            """
            CREATE TABLE IF NOT EXISTS memories (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                category TEXT NOT NULL,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                tags_json TEXT NOT NULL DEFAULT '[]',
                confidence REAL NOT NULL DEFAULT 0.95,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        database.execute(
            "CREATE INDEX IF NOT EXISTS idx_memories_user ON memories (user_id, updated_at DESC)"
        )
        database.execute(
            """
            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                title TEXT NOT NULL,
                notes TEXT NOT NULL DEFAULT '',
                status TEXT NOT NULL DEFAULT 'todo',
                priority TEXT NOT NULL DEFAULT 'medium',
                due_date TEXT NOT NULL DEFAULT '',
                project TEXT NOT NULL DEFAULT '个人工作台',
                source TEXT NOT NULL DEFAULT 'manual',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        database.execute(
            "CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks (user_id, updated_at DESC)"
        )
        database.execute(
            """
            CREATE TABLE IF NOT EXISTS inbox_items (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                text TEXT NOT NULL,
                parsed_type TEXT NOT NULL DEFAULT 'note',
                status TEXT NOT NULL DEFAULT 'pending',
                created_at TEXT NOT NULL
            )
            """
        )
        database.execute(
            "CREATE INDEX IF NOT EXISTS idx_inbox_user ON inbox_items (user_id, created_at DESC)"
        )
        database.execute(
            """
            CREATE TABLE IF NOT EXISTS agent_actions (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                agent_name TEXT NOT NULL,
                title TEXT NOT NULL,
                summary TEXT NOT NULL,
                action_type TEXT NOT NULL DEFAULT 'task_plan',
                payload_json TEXT NOT NULL DEFAULT '{}',
                status TEXT NOT NULL DEFAULT 'pending',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        database.execute(
            "CREATE INDEX IF NOT EXISTS idx_agent_actions_user ON agent_actions (user_id, updated_at DESC)"
        )


def ensure_user_seed_data(user_id, database_path=DATABASE_PATH):
    """Populate initial Personal OS context if a user has no data yet."""
    initialize_database(database_path)
    timestamp = now_iso()
    with sqlite3.connect(database_path, timeout=10) as database:
        has_memories = database.execute(
            "SELECT 1 FROM memories WHERE user_id = ? LIMIT 1", (user_id,)
        ).fetchone()
        has_tasks = database.execute(
            "SELECT 1 FROM tasks WHERE user_id = ? LIMIT 1", (user_id,)
        ).fetchone()
        has_actions = database.execute(
            "SELECT 1 FROM agent_actions WHERE user_id = ? LIMIT 1", (user_id,)
        ).fetchone()

        if not has_memories:
            seed_memories = [
                (
                    f"mem-{uuid.uuid4().hex[:10]}",
                    user_id,
                    "work",
                    "正在推进 ATLAS V2 产品架构评审",
                    "核心目标是打通长期记忆、今日工作台与智能体动作确认闭环。",
                    json.dumps(["产品评审", "架构", "V2"], ensure_ascii=False),
                    0.98,
                    timestamp,
                    timestamp,
                ),
                (
                    f"mem-{uuid.uuid4().hex[:10]}",
                    user_id,
                    "preferences",
                    "偏好结构化、结论先行的沟通方式",
                    "汇报与方案整理时优先列出核心结论、风险点与可执行的下一步。",
                    json.dumps(["沟通偏好", "效率", "工作流"], ensure_ascii=False),
                    0.96,
                    timestamp,
                    timestamp,
                ),
                (
                    f"mem-{uuid.uuid4().hex[:10]}",
                    user_id,
                    "relationships",
                    "产品评审核心协作人：林峰（设计）、陈晨（研发）",
                    "周五下午评审前需与林峰确认交互终稿，与陈晨对齐接口配额策略。",
                    json.dumps(["团队协作", "设计", "研发"], ensure_ascii=False),
                    0.94,
                    timestamp,
                    timestamp,
                ),
                (
                    f"mem-{uuid.uuid4().hex[:10]}",
                    user_id,
                    "personal",
                    "深度工作时段集中在上午 09:30 - 11:30",
                    "重要架构设计与核心文档撰写优先排在上午，下午处理会议与协作。",
                    json.dumps(["时间管理", "习惯"], ensure_ascii=False),
                    0.95,
                    timestamp,
                    timestamp,
                ),
            ]
            database.executemany(
                """
                INSERT INTO memories (id, user_id, category, title, content, tags_json, confidence, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                seed_memories,
            )

        if not has_tasks:
            seed_tasks = [
                (
                    f"task-{uuid.uuid4().hex[:10]}",
                    user_id,
                    "确认 ATLAS V2 用户核心流程与评审材料",
                    "结合最近 3 次用户访谈纪要，收敛首屏工作台与智能体确认交互。",
                    "in_progress",
                    "high",
                    "周五 14:00",
                    "产品评审",
                    "system_seed",
                    timestamp,
                    timestamp,
                ),
                (
                    f"task-{uuid.uuid4().hex[:10]}",
                    user_id,
                    "复核知识图谱节点关联与隐私边界说明",
                    "确保所有记忆条目支持按分类筛选、实时增删与来源回溯。",
                    "todo",
                    "medium",
                    "本周内",
                    "智能记忆",
                    "system_seed",
                    timestamp,
                    timestamp,
                ),
                (
                    f"task-{uuid.uuid4().hex[:10]}",
                    user_id,
                    "完成 ECS Ollama 接口压测与每日配额验证",
                    "验证 20 次/日限额与上下文注入稳定性。",
                    "done",
                    "medium",
                    "已完成",
                    "后端架构",
                    "system_seed",
                    timestamp,
                    timestamp,
                ),
            ]
            database.executemany(
                """
                INSERT INTO tasks (id, user_id, title, notes, status, priority, due_date, project, source, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                seed_tasks,
            )

        if not has_actions:
            seed_actions = [
                (
                    f"act-{uuid.uuid4().hex[:10]}",
                    user_id,
                    "规划智能体 · Planner",
                    "生成周五产品评审会前准备清单",
                    "根据记忆中的协作人（林峰、陈晨）与当前重点任务，自动拆解 1 项高优会前同步任务。",
                    "create_task",
                    json.dumps(
                        {
                            "title": "会前与林峰、陈晨同步 V2 评审定稿与接口方案",
                            "priority": "high",
                            "due_date": "周五 11:00",
                            "project": "产品评审",
                        },
                        ensure_ascii=False,
                    ),
                    "pending",
                    timestamp,
                    timestamp,
                ),
                (
                    f"act-{uuid.uuid4().hex[:10]}",
                    user_id,
                    "记忆整理智能体 · Curator",
                    "归档本周用户访谈关键结论到长期记忆",
                    "将访谈中高频出现的“希望直接在首页体验动态拆解”提炼为产品工作记忆。",
                    "create_memory",
                    json.dumps(
                        {
                            "category": "work",
                            "title": "用户访谈洞察：首屏即时交互显著提升信任感",
                            "content": "受访用户普遍希望无需繁琐配置即可在工作台体验任务拆解与记忆关联。",
                            "tags": ["用户访谈", "产品洞察", "转化率"],
                        },
                        ensure_ascii=False,
                    ),
                    "pending",
                    timestamp,
                    timestamp,
                ),
            ]
            database.executemany(
                """
                INSERT INTO agent_actions (id, user_id, agent_name, title, summary, action_type, payload_json, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                seed_actions,
            )


def get_daily_usage(user_id, database_path=DATABASE_PATH):
    with sqlite3.connect(database_path, timeout=10) as database:
        row = database.execute(
            "SELECT request_count FROM daily_usage WHERE user_id = ? AND usage_day = ?",
            (user_id, utc_day()),
        ).fetchone()
    return row[0] if row else 0


def reserve_daily_usage(user_id, database_path=DATABASE_PATH, daily_limit=DAILY_LIMIT):
    day = utc_day()
    with sqlite3.connect(database_path, timeout=10, isolation_level=None) as database:
        database.execute("BEGIN IMMEDIATE")
        row = database.execute(
            "SELECT request_count FROM daily_usage WHERE user_id = ? AND usage_day = ?",
            (user_id, day),
        ).fetchone()
        used = row[0] if row else 0
        if used >= daily_limit:
            database.rollback()
            return None
        if row:
            database.execute(
                "UPDATE daily_usage SET request_count = ? WHERE user_id = ? AND usage_day = ?",
                (used + 1, user_id, day),
            )
        else:
            database.execute(
                "INSERT INTO daily_usage (user_id, usage_day, request_count) VALUES (?, ?, 1)",
                (user_id, day),
            )
        database.commit()
    return used + 1


def list_memories(user_id, category=None, database_path=DATABASE_PATH):
    ensure_user_seed_data(user_id, database_path)
    query = (
        "SELECT id, category, title, content, tags_json, confidence, created_at, updated_at "
        "FROM memories WHERE user_id = ?"
    )
    params = [user_id]
    if category and category in VALID_MEMORY_CATEGORIES:
        query += " AND category = ?"
        params.append(category)
    query += " ORDER BY updated_at DESC"
    with sqlite3.connect(database_path, timeout=10) as database:
        rows = database.execute(query, params).fetchall()
    return [
        {
            "id": row[0],
            "category": row[1],
            "title": row[2],
            "content": row[3],
            "tags": json.loads(row[4] or "[]"),
            "confidence": row[5],
            "created_at": row[6],
            "updated_at": row[7],
        }
        for row in rows
    ]


def create_memory(user_id, data, database_path=DATABASE_PATH):
    ensure_user_seed_data(user_id, database_path)
    if not isinstance(data, dict):
        raise ValueError("Invalid memory payload")
    category = str(data.get("category") or "personal").strip().lower()
    if category not in VALID_MEMORY_CATEGORIES:
        raise ValueError("category must be one of personal, preferences, work, relationships")
    title = str(data.get("title") or "").strip()
    content = str(data.get("content") or "").strip()
    if not title or len(title) > 160:
        raise ValueError("title must contain 1 to 160 characters")
    if not content or len(content) > 1000:
        raise ValueError("content must contain 1 to 1000 characters")
    raw_tags = data.get("tags") or []
    tags = [str(t).strip()[:32] for t in raw_tags if str(t).strip()][:8] if isinstance(raw_tags, list) else []
    mem_id = f"mem-{uuid.uuid4().hex[:10]}"
    timestamp = now_iso()
    with sqlite3.connect(database_path, timeout=10) as database:
        database.execute(
            """
            INSERT INTO memories (id, user_id, category, title, content, tags_json, confidence, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (mem_id, user_id, category, title, content, json.dumps(tags, ensure_ascii=False), 0.96, timestamp, timestamp),
        )
    return {
        "id": mem_id,
        "category": category,
        "title": title,
        "content": content,
        "tags": tags,
        "confidence": 0.96,
        "created_at": timestamp,
        "updated_at": timestamp,
    }


def delete_memory(user_id, memory_id, database_path=DATABASE_PATH):
    with sqlite3.connect(database_path, timeout=10) as database:
        cursor = database.execute(
            "DELETE FROM memories WHERE id = ? AND user_id = ?", (memory_id, user_id)
        )
        return cursor.rowcount > 0


def list_tasks(user_id, database_path=DATABASE_PATH):
    ensure_user_seed_data(user_id, database_path)
    with sqlite3.connect(database_path, timeout=10) as database:
        rows = database.execute(
            """
            SELECT id, title, notes, status, priority, due_date, project, source, created_at, updated_at
            FROM tasks WHERE user_id = ?
            ORDER BY CASE status WHEN 'in_progress' THEN 0 WHEN 'todo' THEN 1 ELSE 2 END, updated_at DESC
            """,
            (user_id,),
        ).fetchall()
    return [
        {
            "id": row[0],
            "title": row[1],
            "notes": row[2],
            "status": row[3],
            "priority": row[4],
            "due_date": row[5],
            "project": row[6],
            "source": row[7],
            "created_at": row[8],
            "updated_at": row[9],
        }
        for row in rows
    ]


def create_task(user_id, data, database_path=DATABASE_PATH):
    ensure_user_seed_data(user_id, database_path)
    if not isinstance(data, dict):
        raise ValueError("Invalid task payload")
    title = str(data.get("title") or "").strip()
    if not title or len(title) > 200:
        raise ValueError("title must contain 1 to 200 characters")
    notes = str(data.get("notes") or "").strip()[:800]
    status = str(data.get("status") or "todo").strip().lower()
    if status not in VALID_TASK_STATUSES:
        status = "todo"
    priority = str(data.get("priority") or "medium").strip().lower()
    if priority not in VALID_TASK_PRIORITIES:
        priority = "medium"
    due_date = str(data.get("due_date") or "待排期").strip()[:64]
    project = str(data.get("project") or "个人工作台").strip()[:64]
    source = str(data.get("source") or "manual").strip()[:32]
    task_id = f"task-{uuid.uuid4().hex[:10]}"
    timestamp = now_iso()
    with sqlite3.connect(database_path, timeout=10) as database:
        database.execute(
            """
            INSERT INTO tasks (id, user_id, title, notes, status, priority, due_date, project, source, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (task_id, user_id, title, notes, status, priority, due_date, project, source, timestamp, timestamp),
        )
    return {
        "id": task_id,
        "title": title,
        "notes": notes,
        "status": status,
        "priority": priority,
        "due_date": due_date,
        "project": project,
        "source": source,
        "created_at": timestamp,
        "updated_at": timestamp,
    }


def update_task(user_id, task_id, data, database_path=DATABASE_PATH):
    if not isinstance(data, dict):
        raise ValueError("Invalid task update payload")
    with sqlite3.connect(database_path, timeout=10) as database:
        row = database.execute(
            "SELECT title, notes, status, priority, due_date, project, source, created_at FROM tasks WHERE id = ? AND user_id = ?",
            (task_id, user_id),
        ).fetchone()
        if not row:
            return None
        title = str(data.get("title", row[0])).strip() or row[0]
        notes = str(data.get("notes", row[1])).strip()[:800]
        status = str(data.get("status", row[2])).strip().lower()
        if status not in VALID_TASK_STATUSES:
            status = row[2]
        priority = str(data.get("priority", row[3])).strip().lower()
        if priority not in VALID_TASK_PRIORITIES:
            priority = row[3]
        due_date = str(data.get("due_date", row[4])).strip()[:64]
        project = str(data.get("project", row[5])).strip()[:64]
        timestamp = now_iso()
        database.execute(
            """
            UPDATE tasks
            SET title = ?, notes = ?, status = ?, priority = ?, due_date = ?, project = ?, updated_at = ?
            WHERE id = ? AND user_id = ?
            """,
            (title, notes, status, priority, due_date, project, timestamp, task_id, user_id),
        )
    return {
        "id": task_id,
        "title": title,
        "notes": notes,
        "status": status,
        "priority": priority,
        "due_date": due_date,
        "project": project,
        "source": row[6],
        "created_at": row[7],
        "updated_at": timestamp,
    }


def delete_task(user_id, task_id, database_path=DATABASE_PATH):
    with sqlite3.connect(database_path, timeout=10) as database:
        cursor = database.execute(
            "DELETE FROM tasks WHERE id = ? AND user_id = ?", (task_id, user_id)
        )
        return cursor.rowcount > 0


def list_inbox(user_id, database_path=DATABASE_PATH):
    ensure_user_seed_data(user_id, database_path)
    with sqlite3.connect(database_path, timeout=10) as database:
        rows = database.execute(
            "SELECT id, text, parsed_type, status, created_at FROM inbox_items WHERE user_id = ? ORDER BY created_at DESC",
            (user_id,),
        ).fetchall()
    return [
        {
            "id": row[0],
            "text": row[1],
            "parsed_type": row[2],
            "status": row[3],
            "created_at": row[4],
        }
        for row in rows
    ]


def analyze_natural_input(raw_text, memories=None):
    """Parse natural language thought into task, schedule, memory tags, and suggested action."""
    text = str(raw_text or "").strip()
    if not text or len(text) > 500:
        raise ValueError("text must contain 1 to 500 characters")

    schedule_match = re.search(
        r"(今天|明天|后天|本周[一二三四五六日天]?|下周[一二三四五六日天]?|周[一二三四五六日天]|\d{1,2}月\d{1,2}日|\d{1,2}:\d{2}|(?:上午|下午|晚上)\s*\d{1,2}\s*[点:：]\d{0,2})",
        text,
    )
    due_date = schedule_match.group(0) if schedule_match else "今日待办"

    is_high_priority = any(k in text for k in ("紧急", "高优", "评审", "截止", "马上", "立刻", "重要", "上线"))
    priority = "high" if is_high_priority else "medium"

    if any(k in text for k in ("偏好", "习惯", "喜欢", "原则", "记住")):
        intent = "memory"
        category = "preferences"
    elif any(k in text for k in ("会议", "评审", "约", "讨论", "同步", "林峰", "陈晨", "团队")):
        intent = "collaborative_task"
        category = "work"
    else:
        intent = "task"
        category = "work"

    project = "产品评审" if "评审" in text or "V2" in text.upper() else "个人工作台"

    matched_memories = []
    if memories:
        for mem in memories:
            if any(tag in text for tag in mem.get("tags", [])) or any(
                keyword in text for keyword in ("评审", "流程", "访谈", "架构") if keyword in mem.get("title", "")
            ):
                matched_memories.append({"id": mem["id"], "title": mem["title"], "category": mem["category"]})
    if not matched_memories:
        matched_memories = [
            {"id": "ctx-default-1", "title": "正在推进 ATLAS V2 产品架构评审", "category": "work"},
            {"id": "ctx-default-2", "title": "偏好结构化、结论先行的沟通方式", "category": "preferences"},
        ]

    return {
        "raw_text": text,
        "intent": intent,
        "extracted_task": {
            "title": text[:80],
            "priority": priority,
            "due_date": due_date,
            "project": project,
        },
        "extracted_memory": {
            "category": category,
            "title": f"上下文记录：{text[:36]}",
            "tags": [project, due_date],
        },
        "related_memories": matched_memories[:3],
        "suggested_action": {
            "agent_name": "规划智能体 · Planner",
            "title": f"将「{text[:24]}」加入 {project} 并关联 {due_date} 日程",
            "summary": f"已识别时间节点（{due_date}）与优先级（{'高优' if priority == 'high' else '常规'}），确认后自动写入工作台任务队列。",
        },
    }


def create_inbox_item(user_id, data, database_path=DATABASE_PATH):
    ensure_user_seed_data(user_id, database_path)
    if not isinstance(data, dict):
        raise ValueError("Invalid inbox payload")
    text = str(data.get("text") or "").strip()
    if not text or len(text) > 240:
        raise ValueError("text must contain 1 to 240 characters")
    parsed = analyze_natural_input(text)
    item_id = f"inb-{uuid.uuid4().hex[:10]}"
    timestamp = now_iso()
    with sqlite3.connect(database_path, timeout=10) as database:
        database.execute(
            """
            INSERT INTO inbox_items (id, user_id, text, parsed_type, status, created_at)
            VALUES (?, ?, ?, ?, 'pending', ?)
            """,
            (item_id, user_id, text, parsed["intent"], timestamp),
        )
    return {
        "id": item_id,
        "text": text,
        "parsed_type": parsed["intent"],
        "status": "pending",
        "created_at": timestamp,
        "analysis": parsed,
    }


def promote_inbox_item(user_id, item_id, database_path=DATABASE_PATH):
    with sqlite3.connect(database_path, timeout=10) as database:
        row = database.execute(
            "SELECT text, status FROM inbox_items WHERE id = ? AND user_id = ?",
            (item_id, user_id),
        ).fetchone()
        if not row:
            return None
        text = row[0]
        database.execute(
            "UPDATE inbox_items SET status = 'promoted' WHERE id = ? AND user_id = ?",
            (item_id, user_id),
        )
    parsed = analyze_natural_input(text)
    task = create_task(
        user_id,
        {
            "title": parsed["extracted_task"]["title"],
            "notes": f"由随手收集箱自动结构化升级（原记录：{text}）",
            "priority": parsed["extracted_task"]["priority"],
            "due_date": parsed["extracted_task"]["due_date"],
            "project": parsed["extracted_task"]["project"],
            "source": "inbox_promoted",
        },
        database_path=database_path,
    )
    return {"inbox_id": item_id, "status": "promoted", "task": task}


def delete_inbox_item(user_id, item_id, database_path=DATABASE_PATH):
    with sqlite3.connect(database_path, timeout=10) as database:
        cursor = database.execute(
            "DELETE FROM inbox_items WHERE id = ? AND user_id = ?", (item_id, user_id)
        )
        return cursor.rowcount > 0


def list_agent_actions(user_id, database_path=DATABASE_PATH):
    ensure_user_seed_data(user_id, database_path)
    with sqlite3.connect(database_path, timeout=10) as database:
        rows = database.execute(
            """
            SELECT id, agent_name, title, summary, action_type, payload_json, status, created_at, updated_at
            FROM agent_actions WHERE user_id = ?
            ORDER BY CASE status WHEN 'pending' THEN 0 WHEN 'executed' THEN 1 ELSE 2 END, updated_at DESC
            """,
            (user_id,),
        ).fetchall()
    return [
        {
            "id": row[0],
            "agent_name": row[1],
            "title": row[2],
            "summary": row[3],
            "action_type": row[4],
            "payload": json.loads(row[5] or "{}"),
            "status": row[6],
            "created_at": row[7],
            "updated_at": row[8],
        }
        for row in rows
    ]


def create_agent_action(user_id, data, database_path=DATABASE_PATH):
    ensure_user_seed_data(user_id, database_path)
    if not isinstance(data, dict):
        raise ValueError("Invalid agent action payload")
    goal = str(data.get("goal") or data.get("title") or "").strip()
    if not goal or len(goal) > 240:
        raise ValueError("goal must contain 1 to 240 characters")
    user_memories = list_memories(user_id, database_path=database_path)
    parsed = analyze_natural_input(goal, memories=user_memories)
    action_id = f"act-{uuid.uuid4().hex[:10]}"
    timestamp = now_iso()
    is_mem = parsed["intent"] == "memory"
    agent_name = "记忆整理智能体 · Curator" if is_mem else "规划智能体 · Planner"
    action_type = "create_memory" if is_mem else "create_task"
    title = parsed["suggested_action"]["title"]
    summary = parsed["suggested_action"]["summary"]
    payload_obj = parsed["extracted_memory"] if is_mem else parsed["extracted_task"]
    with sqlite3.connect(database_path, timeout=10) as database:
        database.execute(
            """
            INSERT INTO agent_actions (id, user_id, agent_name, title, summary, action_type, payload_json, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
            """,
            (action_id, user_id, agent_name, title, summary, action_type, json.dumps(payload_obj, ensure_ascii=False), timestamp, timestamp),
        )
    return {
        "id": action_id,
        "agent_name": agent_name,
        "title": title,
        "summary": summary,
        "action_type": action_type,
        "payload": payload_obj,
        "status": "pending",
        "created_at": timestamp,
        "updated_at": timestamp,
    }


def decide_agent_action(user_id, action_id, decision, database_path=DATABASE_PATH):
    if decision not in ("approve", "defer"):
        raise ValueError("decision must be approve or defer")
    with sqlite3.connect(database_path, timeout=10) as database:
        row = database.execute(
            "SELECT agent_name, title, summary, action_type, payload_json, status, created_at FROM agent_actions WHERE id = ? AND user_id = ?",
            (action_id, user_id),
        ).fetchone()
        if not row:
            return None
        action_type = row[3]
        payload = json.loads(row[4] or "{}")
        new_status = "executed" if decision == "approve" else "deferred"
        timestamp = now_iso()
        database.execute(
            "UPDATE agent_actions SET status = ?, updated_at = ? WHERE id = ? AND user_id = ?",
            (new_status, timestamp, action_id, user_id),
        )

    created_entity = None
    if decision == "approve":
        if action_type == "create_task":
            created_entity = create_task(
                user_id,
                {
                    "title": payload.get("title") or row[1],
                    "notes": f"由 {row[0]} 建议并经用户确认执行",
                    "priority": payload.get("priority", "high"),
                    "due_date": payload.get("due_date", "待排期"),
                    "project": payload.get("project", "智能体协同"),
                    "source": "agent_approved",
                },
                database_path=database_path,
            )
        elif action_type == "create_memory":
            created_entity = create_memory(
                user_id,
                {
                    "category": payload.get("category", "work"),
                    "title": payload.get("title") or row[1],
                    "content": payload.get("content") or row[2],
                    "tags": payload.get("tags", ["智能体归档"]),
                },
                database_path=database_path,
            )

    return {
        "id": action_id,
        "agent_name": row[0],
        "title": row[1],
        "summary": row[2],
        "action_type": action_type,
        "payload": payload,
        "status": new_status,
        "created_at": row[6],
        "updated_at": timestamp,
        "created_entity": created_entity,
    }


def build_context_system_prompt(user_id, database_path=DATABASE_PATH):
    """Build a personal context block from the user's stored memories and active tasks."""
    memories = list_memories(user_id, database_path=database_path)[:6]
    tasks = [t for t in list_tasks(user_id, database_path=database_path) if t["status"] != "done"][:5]
    context_refs = []
    lines = [SYSTEM_PROMPT]

    if memories or tasks:
        lines.append("\n以下是当前用户的个人上下文（请在回答相关问题时自然引用，切勿生硬背诵）：")
    if memories:
        lines.append("【长期记忆】")
        for mem in memories:
            lines.append(f"- ({mem['category']}) {mem['title']}：{mem['content']}")
            context_refs.append({"type": "memory", "id": mem["id"], "title": mem["title"]})
    if tasks:
        lines.append("【当前待办与重点任务】")
        for task in tasks:
            lines.append(f"- [{task['priority'].upper()} / {task['due_date']}] {task['title']}")
            context_refs.append({"type": "task", "id": task["id"], "title": task["title"]})

    return "\n".join(lines), context_refs


def validate_messages(value, system_prompt=SYSTEM_PROMPT):
    if not isinstance(value, list) or not value or len(value) > MAX_MESSAGES:
        raise ValueError(f"messages must contain between 1 and {MAX_MESSAGES} items")

    messages = []
    for item in value:
        if not isinstance(item, dict) or item.get("role") not in ("user", "assistant"):
            raise ValueError("messages may contain only user and assistant roles")
        content = item.get("content")
        if not isinstance(content, str) or not content.strip() or len(content) > MAX_MESSAGE_CHARS:
            raise ValueError(f"each message must contain 1 to {MAX_MESSAGE_CHARS} characters")
        messages.append({"role": item["role"], "content": content.strip()})

    if messages[-1]["role"] != "user":
        raise ValueError("the latest message must be from the user")
    return [{"role": "system", "content": system_prompt}, *messages]


def verify_supabase_user(access_token):
    if not SUPABASE_URL or not SUPABASE_PUBLISHABLE_KEY:
        raise SupabaseUnavailable("Supabase auth is not configured")

    request = Request(
        f"{SUPABASE_URL}/auth/v1/user",
        headers={
            "apikey": SUPABASE_PUBLISHABLE_KEY,
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json",
        },
        method="GET",
    )
    try:
        with urlopen(request, timeout=10) as response:
            user = json.loads(response.read())
    except HTTPError as error:
        if error.code in (401, 403):
            return None
        raise SupabaseUnavailable(f"Supabase returned HTTP {error.code}") from error
    except (URLError, TimeoutError, json.JSONDecodeError) as error:
        raise SupabaseUnavailable("Could not verify the Supabase session") from error

    user_id = user.get("id") if isinstance(user, dict) else None
    try:
        return str(uuid.UUID(user_id))
    except (ValueError, TypeError, AttributeError):
        return None


def call_ollama(messages):
    request_body = json.dumps(
        {
            "model": OLLAMA_MODEL,
            "messages": messages,
            "stream": False,
            "options": {"num_ctx": 4096, "num_predict": 512, "temperature": 0.7},
        }
    ).encode("utf-8")
    request = Request(
        f"{OLLAMA_URL}/api/chat",
        data=request_body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urlopen(request, timeout=240) as response:
            result = json.loads(response.read())
    except HTTPError as error:
        raise RuntimeError(f"Ollama returned HTTP {error.code}") from error
    except (URLError, TimeoutError, json.JSONDecodeError) as error:
        raise RuntimeError("Could not get a valid response from Ollama") from error

    answer = result.get("message", {}).get("content") if isinstance(result, dict) else None
    if not isinstance(answer, str) or not answer.strip():
        raise RuntimeError("Ollama returned an empty response")
    return answer.strip()


class AtlasAPIHandler(BaseHTTPRequestHandler):
    server_version = "ATLASAPI/2.0"

    def log_message(self, format_string, *args):
        LOGGER.info("%s - %s", self.client_address[0], format_string % args)

    def send_json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        origin = self.headers.get("Origin")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        if origin in ALLOWED_ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
        self.end_headers()
        self.wfile.write(body)

    def reject_disallowed_origin(self):
        origin = self.headers.get("Origin")
        if origin and origin not in ALLOWED_ORIGINS:
            self.send_json(403, {"error": "This website origin is not allowed."})
            return True
        return False

    def read_json_body(self):
        if self.headers.get_content_type() != "application/json":
            self.send_json(415, {"error": "Content-Type must be application/json"})
            return None
        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self.send_json(400, {"error": "Invalid Content-Length"})
            return None
        if content_length <= 0 or content_length > MAX_REQUEST_BYTES:
            self.send_json(413, {"error": "Request body is empty or too large"})
            return None
        try:
            return json.loads(self.rfile.read(content_length))
        except (json.JSONDecodeError, UnicodeDecodeError):
            self.send_json(400, {"error": "Malformed JSON request body"})
            return None

    def do_OPTIONS(self):
        origin = self.headers.get("Origin")
        if not origin or origin not in ALLOWED_ORIGINS:
            self.send_json(403, {"error": "This website origin is not allowed."})
            return
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", origin)
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Authorization, Content-Type")
        self.send_header("Access-Control-Max-Age", "600")
        self.send_header("Vary", "Origin")
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self):
        if self.reject_disallowed_origin():
            return
        parsed_url = urlsplit(self.path)
        path = parsed_url.path
        query = parse_qs(parsed_url.query)

        if path == "/health":
            try:
                with urlopen(f"{OLLAMA_URL}/api/version", timeout=3):
                    pass
            except (HTTPError, URLError, TimeoutError):
                self.send_json(503, {"status": "unavailable"})
                return
            self.send_json(200, {"status": "ok"})
            return

        if path not in ("/api/usage", "/api/state", "/api/memories", "/api/tasks", "/api/inbox", "/api/agents/actions"):
            self.send_json(404, {"error": "Not found"})
            return

        user_id = self.authenticated_user()
        if not user_id:
            return

        if path == "/api/usage":
            used = get_daily_usage(user_id)
            self.send_json(
                200,
                {"limit": DAILY_LIMIT, "used": used, "remaining": max(0, DAILY_LIMIT - used)},
            )
            return

        if path == "/api/state":
            memories = list_memories(user_id)
            tasks = list_tasks(user_id)
            inbox = list_inbox(user_id)
            actions = list_agent_actions(user_id)
            used = get_daily_usage(user_id)
            self.send_json(
                200,
                {
                    "memories": memories,
                    "tasks": tasks,
                    "inbox": inbox,
                    "agent_actions": actions,
                    "usage": {"limit": DAILY_LIMIT, "used": used, "remaining": max(0, DAILY_LIMIT - used)},
                    "summary": {
                        "total_memories": len(memories),
                        "active_tasks": sum(1 for t in tasks if t["status"] != "done"),
                        "completed_tasks": sum(1 for t in tasks if t["status"] == "done"),
                        "pending_inbox": sum(1 for i in inbox if i["status"] == "pending"),
                        "pending_actions": sum(1 for a in actions if a["status"] == "pending"),
                    },
                },
            )
            return

        if path == "/api/memories":
            category = query.get("category", [None])[0]
            self.send_json(200, {"memories": list_memories(user_id, category=category)})
            return

        if path == "/api/tasks":
            self.send_json(200, {"tasks": list_tasks(user_id)})
            return

        if path == "/api/inbox":
            self.send_json(200, {"inbox": list_inbox(user_id)})
            return

        if path == "/api/agents/actions":
            self.send_json(200, {"agent_actions": list_agent_actions(user_id)})
            return

    def do_POST(self):
        if self.reject_disallowed_origin():
            return
        path = urlsplit(self.path).path

        # Public intelligent analyzer endpoint (works both signed-in and on marketing landing page)
        if path == "/api/analyze":
            payload = self.read_json_body()
            if payload is None:
                return
            try:
                analysis = analyze_natural_input(payload.get("text") if isinstance(payload, dict) else "")
            except ValueError as error:
                self.send_json(400, {"error": str(error)})
                return
            self.send_json(200, {"analysis": analysis})
            return

        promote_match = re.fullmatch(r"/api/inbox/([A-Za-z0-9_-]+)/promote", path)
        decision_match = re.fullmatch(r"/api/agents/actions/([A-Za-z0-9_-]+)/decision", path)

        if (
            path not in ("/api/chat", "/api/memories", "/api/tasks", "/api/inbox", "/api/agents/actions")
            and not promote_match
            and not decision_match
        ):
            self.send_json(404, {"error": "Not found"})
            return

        user_id = self.authenticated_user()
        if not user_id:
            return

        payload = self.read_json_body()
        if payload is None:
            return

        if path == "/api/agents/actions":
            try:
                action = create_agent_action(user_id, payload)
            except ValueError as error:
                self.send_json(400, {"error": str(error)})
                return
            self.send_json(201, {"action": action})
            return

        if path == "/api/memories":
            try:
                memory = create_memory(user_id, payload)
            except ValueError as error:
                self.send_json(400, {"error": str(error)})
                return
            self.send_json(201, {"memory": memory})
            return

        if path == "/api/tasks":
            try:
                task = create_task(user_id, payload)
            except ValueError as error:
                self.send_json(400, {"error": str(error)})
                return
            self.send_json(201, {"task": task})
            return

        if path == "/api/inbox":
            try:
                item = create_inbox_item(user_id, payload)
            except ValueError as error:
                self.send_json(400, {"error": str(error)})
                return
            self.send_json(201, {"item": item})
            return

        if promote_match:
            result = promote_inbox_item(user_id, promote_match.group(1))
            if not result:
                self.send_json(404, {"error": "Inbox item not found"})
                return
            self.send_json(200, result)
            return

        if decision_match:
            try:
                decision = str(payload.get("decision") or "").strip().lower() if isinstance(payload, dict) else ""
                result = decide_agent_action(user_id, decision_match.group(1), decision)
            except ValueError as error:
                self.send_json(400, {"error": str(error)})
                return
            if not result:
                self.send_json(404, {"error": "Agent action not found"})
                return
            self.send_json(200, {"action": result})
            return

        # /api/chat
        include_context = bool(isinstance(payload, dict) and payload.get("include_context"))
        context_refs = []
        system_prompt = SYSTEM_PROMPT
        if include_context:
            system_prompt, context_refs = build_context_system_prompt(user_id)

        try:
            messages = validate_messages(
                payload.get("messages") if isinstance(payload, dict) else None,
                system_prompt=system_prompt,
            )
        except ValueError as error:
            self.send_json(400, {"error": str(error)})
            return

        if not INFERENCE_SLOT.acquire(blocking=False):
            self.send_json(503, {"error": "ATLAS is busy. Please try again shortly."})
            return
        try:
            used = reserve_daily_usage(user_id)
            if used is None:
                self.send_json(
                    429,
                    {
                        "error": f"Daily limit reached ({DAILY_LIMIT} requests). Try again after UTC midnight.",
                        "limit": DAILY_LIMIT,
                        "used": DAILY_LIMIT,
                        "remaining": 0,
                    },
                )
                return
            answer = call_ollama(messages)
        except sqlite3.Error:
            LOGGER.exception("Unable to update daily usage")
            self.send_json(503, {"error": "Usage tracking is temporarily unavailable."})
            return
        except RuntimeError:
            LOGGER.exception("Ollama request failed")
            self.send_json(502, {"error": "The local model could not complete this request."})
            return
        finally:
            INFERENCE_SLOT.release()

        response_payload = {
            "message": {"role": "assistant", "content": answer},
            "usage": {
                "limit": DAILY_LIMIT,
                "used": used,
                "remaining": max(0, DAILY_LIMIT - used),
            },
        }
        if include_context:
            response_payload["context_refs"] = context_refs
        self.send_json(200, response_payload)

    def do_PATCH(self):
        if self.reject_disallowed_origin():
            return
        path = urlsplit(self.path).path
        task_match = re.fullmatch(r"/api/tasks/([A-Za-z0-9_-]+)", path)
        if not task_match:
            self.send_json(404, {"error": "Not found"})
            return

        user_id = self.authenticated_user()
        if not user_id:
            return

        payload = self.read_json_body()
        if payload is None:
            return
        try:
            updated = update_task(user_id, task_match.group(1), payload)
        except ValueError as error:
            self.send_json(400, {"error": str(error)})
            return
        if not updated:
            self.send_json(404, {"error": "Task not found"})
            return
        self.send_json(200, {"task": updated})

    def do_DELETE(self):
        if self.reject_disallowed_origin():
            return
        path = urlsplit(self.path).path
        mem_match = re.fullmatch(r"/api/memories/([A-Za-z0-9_-]+)", path)
        task_match = re.fullmatch(r"/api/tasks/([A-Za-z0-9_-]+)", path)
        inbox_match = re.fullmatch(r"/api/inbox/([A-Za-z0-9_-]+)", path)

        if not (mem_match or task_match or inbox_match):
            self.send_json(404, {"error": "Not found"})
            return

        user_id = self.authenticated_user()
        if not user_id:
            return

        if mem_match:
            deleted = delete_memory(user_id, mem_match.group(1))
        elif task_match:
            deleted = delete_task(user_id, task_match.group(1))
        else:
            deleted = delete_inbox_item(user_id, inbox_match.group(1))

        if not deleted:
            self.send_json(404, {"error": "Item not found"})
            return
        self.send_json(200, {"deleted": True})

    def authenticated_user(self):
        authorization = self.headers.get("Authorization", "")
        scheme, separator, token = authorization.partition(" ")
        if scheme.lower() != "bearer" or not separator or not token.strip() or len(token) > 8192:
            self.send_json(401, {"error": "Please sign in to use ATLAS."})
            return None
        try:
            user_id = verify_supabase_user(token.strip())
        except SupabaseUnavailable:
            LOGGER.exception("Supabase session verification failed")
            self.send_json(503, {"error": "Authentication service is temporarily unavailable."})
            return None
        if not user_id:
            self.send_json(401, {"error": "Your session is invalid or expired. Please sign in again."})
            return None
        return user_id


def main():
    if DAILY_LIMIT < 1:
        raise RuntimeError("ATLAS_DAILY_LIMIT must be a positive integer")
    if not SUPABASE_URL or not SUPABASE_PUBLISHABLE_KEY:
        raise RuntimeError("Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY before starting the API")
    ollama_endpoint = urlsplit(OLLAMA_URL)
    ollama_host = ollama_endpoint.hostname
    if (
        ollama_endpoint.scheme != "http"
        or ollama_host not in ("127.0.0.1", "localhost")
        or ollama_endpoint.path not in ("", "/")
        or ollama_endpoint.username
        or ollama_endpoint.password
        or ollama_endpoint.query
        or ollama_endpoint.fragment
    ):
        raise RuntimeError("OLLAMA_URL must point to the local Ollama service")
    if API_HOST != "127.0.0.1":
        raise RuntimeError("ATLAS_API_HOST must be loopback; expose it through HTTPS Nginx instead")
    initialize_database()
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    server = ThreadingHTTPServer((API_HOST, API_PORT), AtlasAPIHandler)
    server.daemon_threads = True
    LOGGER.info("ATLAS API listening on %s:%s", API_HOST, API_PORT)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
