from pathlib import Path

from huggingface_hub import snapshot_download


MODEL = "Qwen/Qwen2.5-7B-Instruct"
TARGET = Path("training/models/qwen2.5-7b-instruct")


def main() -> None:
    TARGET.mkdir(parents=True, exist_ok=True)
    snapshot_download(
        repo_id=MODEL,
        local_dir=str(TARGET),
        local_dir_use_symlinks=False,
    )
    print(f"Model downloaded to {TARGET}")


if __name__ == "__main__":
    main()
