# Llama (Local LLM) Setup

This project can use **local Llama models** via an **OpenAI-compatible** HTTP server.

Supported options:

1) **llama.cpp** (recommended for a single GGUF model)
2) **Ollama** (recommended for quick model downloads + management)

The app uses OpenAI-compatible endpoints:

- `POST /v1/chat/completions`

You can configure the app with either set of env vars:

- `OPENAI_BASE_URL`, `OPENAI_MODEL`, `OPENAI_API_KEY`
- or the admin equivalents: `LLM_BASE_URL`, `LLM_MODEL`, `LLM_API_KEY`

## Option A: llama.cpp (llama-server)

From the llama.cpp repo/build, run:

```bash
llama-server -m /path/to/model.gguf --port 8080
```

llama-server exposes:

- Chat UI: `http://localhost:8080`
- Chat completions: `http://localhost:8080/v1/chat/completions`

Reference: llama.cpp README (llama-server section).

### App env example

```bash
OPENAI_BASE_URL=http://localhost:8080/v1
OPENAI_MODEL=your-model-name
OPENAI_API_KEY=local
```

## Option B: Ollama (OpenAI compatibility)

Pull a model:

```bash
ollama pull llama3.2
```

Then run your app with:

```bash
OPENAI_BASE_URL=http://localhost:11434/v1
OPENAI_MODEL=llama3.2
OPENAI_API_KEY=ollama
```

Ollama’s OpenAI-compatible base_url example is documented in the Ollama OpenAI compatibility docs.

## Deployment notes

If you deploy the Next.js app to a hosted platform (e.g. Vercel), it **cannot** call `localhost` on your laptop.
For production you must either:

- Host your Llama server on a reachable machine in the same network/VPC, and set `OPENAI_BASE_URL` to that host.
- Or run the full app stack on the same server (app + llama server).
