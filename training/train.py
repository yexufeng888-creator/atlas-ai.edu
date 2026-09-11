import subprocess
import sys


def main() -> None:
    command = [
        sys.executable,
        "-m",
        "mlx_lm.lora",
        "--model",
        "training/models/qwen2.5-7b-instruct",
        "--data",
        "training/data",
        "--train",
        "--fine-tune-type",
        "lora",
        "--num-layers",
        "16",
        "--batch-size",
        "1",
        "--iters",
        "600",
        "--val-batches",
        "25",
        "--learning-rate",
        "1e-5",
        "--steps-per-report",
        "10",
        "--steps-per-eval",
        "100",
        "--save-every",
        "100",
        "--adapter-path",
        "training/adapters/atlas-qwen7b",
        "--seed",
        "42",
    ]
    subprocess.run(command, check=True)


if __name__ == "__main__":
    main()
