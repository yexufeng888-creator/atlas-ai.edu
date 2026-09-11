#!/usr/bin/env python3
"""
创建繁体中文版本的所有页面
使用 OpenCC 进行简繁转换
"""

import os
import re
from pathlib import Path

BASE_DIR = Path(__file__).parent

# 简繁转换映射（常用词汇）
CONV_MAP = {
    '中国大陆': '中國大陸',
    '简体中文': '簡體中文',
    '繁体中文': '繁體中文',
    '地区': '地區',
    '亚太地区': '亞太地區',
    '其他地区': '其他地區',
    '首页': '首頁',
    '工作台': '工作台',
    '询问': '詢問',
    '记忆': '記憶',
    '生活': '生活',
    '智能体': '智能體',
    '设置': '設置',
    '你的生活': '你的生活',
    '智能化管理': '智能化管理',
    '将信息转化为智能': '將信息轉化為智能',
    '将决策转化为行动': '將決策轉化為行動',
    '是你的': '是你的',
    '驱动的生活操作系统': '驅動的生活操作系統',
    '免费开始': '免費開始',
    '了解更多': '了解更多',
    '功能特性': '功能特性',
    '为你的成功而设计': '為你的成功而設計',
    '你需要的一切': '你需要的一切',
    '让你保持井井有条': '讓你保持井井有條',
    '高效和掌控全局': '高效和掌控全局',
    '智能记忆': '智能記憶',
    '在你需要的时候': '在你需要的時候',
    '记住你需要的一切': '記住你需要的一切',
    '你的个人知识图谱与你一起成长': '你的個人知識圖譜與你一起成長',
    '智能任务管理': '智能任務管理',
    '驱动的优先级排序': '驅動的優先級排序',
    '适应你的工作风格': '適應你的工作風格',
    '帮助你专注于重要的事情': '幫助你專注於重要的事情',
    '专业智能体自动处理从旅行规划到邮件管理的所有事务': '專業智能體自動處理從旅行規劃到郵件管理的所有事務',
    '生活分析': '生活分析',
    '美观的仪表板可视化你的生产力': '美觀的儀表板可視化你的生產力',
    '健康和习惯': '健康和習慣',
    '隐私优先': '隱私優先',
    '你的数据属于你': '你的數據屬於你',
    '端到端加密和透明的': '端到端加密和透明的',
    '操作': '操作',
    '闪电般快速': '閃電般快速',
    '原生性能': '原生性能',
    '即时搜索和跨设备实时同步': '即時搜索和跨設備實時同步',
    '活跃用户': '活躍用戶',
    '已完成任务': '已完成任務',
    '在线时间': '在線時間',
    '用户评分': '用戶評分',
    '由创新者打造': '由創新者打造',
    '为创新者服务': '為創新者服務',
    '是一支由设计师': '是一支由設計師',
    '工程师和': '工程師和',
    '研究人员组成的团队': '研究人員組成的團隊',
    '致力于创造赋能你成就更多的工具': '致力於創造賦能你成就更多的工具',
    '认识团队': '認識團隊',
    '准备好改变你的生活了吗': '準備好改變你的生活了嗎',
    '加入数千名使用': '加入數千名使用',
    '保持井井有条和高效的用户': '保持井井有條和高效的用戶',
    '开始免费试用': '開始免費試用',
    '查看定价': '查看定價',
    '产品': '產品',
    '功能': '功能',
    '定价': '定價',
    '公司': '公司',
    '关于': '關於',
    '博客': '博客',
    '法律': '法律',
    '隐私': '隱私',
    '条款': '條款',
    '保留所有权利': '保留所有權利',
}

def convert_to_traditional(text):
    """简单的简繁转换"""
    for simp, trad in CONV_MAP.items():
        text = text.replace(simp, trad)
    return text

def create_traditional_version(source_file, target_suffix):
    """创建繁体版本"""
    print(f"处理: {source_file.name}")

    with open(source_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 转换为繁体
    content_trad = convert_to_traditional(content)

    # 修改语言标签
    content_trad = content_trad.replace('lang="zh-CN"', f'lang="zh-{target_suffix.upper()}"')

    # 创建目标文件名
    target_name = source_file.name.replace('.html', f'-{target_suffix}.html')
    target_file = BASE_DIR / target_name

    with open(target_file, 'w', encoding='utf-8') as f:
        f.write(content_trad)

    print(f"  ✅ 创建: {target_name}")
    return target_file

def main():
    print("=" * 60)
    print("创建繁体中文版本")
    print("=" * 60)
    print()

    # 首页
    print("创建繁体首页...")
    if (BASE_DIR / 'index.html').exists():
        create_traditional_version(BASE_DIR / 'index.html', 'hk')
        create_traditional_version(BASE_DIR / 'index.html', 'tw')

    print()
    print("=" * 60)
    print("✅ 完成！")
    print("=" * 60)
    print()
    print("已创建:")
    print("  - index-hk.html (繁體中文-香港)")
    print("  - index-tw.html (繁體中文-台灣)")
    print()

if __name__ == '__main__':
    main()
