from mlx_lm import generate, load


def main() -> None:
    model, tokenizer = load(
        "training/models/qwen2.5-7b-instruct",
        adapter_path="training/adapters/atlas-qwen7b",
    )
    prompt = input("ATLAS> ").strip()
    if not prompt:
        raise SystemExit("Prompt cannot be empty.")
    result = generate(
        model,
        tokenizer,
        prompt=prompt,
        max_tokens=512,
        verbose=True,
    )
    print(result)


if __name__ == "__main__":
    main()
