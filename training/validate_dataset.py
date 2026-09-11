import json
from pathlib import Path


REQUIRED_ROLES = {"user", "assistant"}


def validate_file(path: Path) -> int:
    count = 0
    with path.open(encoding="utf-8") as stream:
        for line_number, line in enumerate(stream, 1):
            try:
                item = json.loads(line)
            except json.JSONDecodeError as exc:
                raise ValueError(f"{path}:{line_number}: invalid JSON: {exc}") from exc

            messages = item.get("messages")
            if not isinstance(messages, list) or not messages:
                raise ValueError(f"{path}:{line_number}: messages must be a non-empty list")

            roles = {message.get("role") for message in messages}
            if not REQUIRED_ROLES.issubset(roles):
                raise ValueError(f"{path}:{line_number}: requires user and assistant messages")

            for message in messages:
                if message.get("role") not in {"system", "user", "assistant"}:
                    raise ValueError(f"{path}:{line_number}: unsupported message role")
                if not isinstance(message.get("content"), str) or not message["content"].strip():
                    raise ValueError(f"{path}:{line_number}: message content cannot be empty")
            count += 1
    return count


def main() -> None:
    data_dir = Path("training/data")
    train_count = validate_file(data_dir / "train.jsonl")
    valid_count = validate_file(data_dir / "valid.jsonl")
    print(f"Dataset valid: {train_count} training examples, {valid_count} validation examples")


if __name__ == "__main__":
    main()
