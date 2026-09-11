# ATLAS 7B LoRA 微调

这套训练流程面向 Apple Silicon，默认使用 `Qwen/Qwen2.5-7B-Instruct` 和 MLX
进行 LoRA 微调。它不会从零训练模型，而是在通用 7B 基座上学习 ATLAS 的语气、
产品知识和工作流。

## 1. 安装环境

建议使用 Python 3.11 或更新版本：

```bash
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r training/requirements.txt
```

## 2. 准备数据

训练数据必须是 JSONL，每行一条对话，格式如下：

```json
{"messages":[{"role":"system","content":"你是 ATLAS，回答简洁、可靠。"},{"role":"user","content":"帮我安排今天的工作"},{"role":"assistant","content":"先根据截止时间和精力，把任务分成今天必须完成、可以延后两组。"}]}
```

将数据保存为 `training/data/train.jsonl`。至少准备 200 条高质量样本，
并另外准备 `training/data/valid.jsonl` 做验证。不要放入密码、API Key、
身份证号、私密聊天记录或其他个人敏感信息。

## 3. 下载基座并训练

```bash
source .venv/bin/activate
python training/download_model.py
python training/validate_dataset.py
python training/train.py
```

默认配置适合 24GB Apple Silicon 内存：LoRA、4-bit 权重、较小 batch。
首次下载模型需要较多磁盘空间，训练时间取决于数据量。

## 4. 测试适配器

```bash
python training/chat.py
```

训练结果位于 `training/adapters/atlas-qwen7b`。这是适配器，不是完整模型；
部署时需要同时保留基座模型。

## 5. 接入网站

训练完成后，可用 MLX server 或 OpenAI-compatible 本地服务暴露模型，再将
`ask.html` 的请求改为后端代理。不要把 Hugging Face Token 或任何 API Key
写入浏览器 `localStorage`。
