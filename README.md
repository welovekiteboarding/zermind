<a href="https://zermind.ai/">
  <img alt="Zermind – Open Source Multi-LLM Chat App" src="https://zermind.ai/opengraph-image.png">
  <h1 align="center">Zermind – Open Source Multi-LLM Chat App</h1>
</a>

<p align="center">
  <a href="https://zermind.ai/privacy"><strong>Privacy Policy</strong></a> ·
  <a href="https://zermind.ai/terms"><strong>Terms of Use</strong></a> ·
  <a href="https://zermind.ai/imprint"><strong>Imprint</strong></a> ·
</p>
<br/>

Zermind is a modern, open-source AI chat app built for the [Cloneathon 2025](https://cloneathon.t3.chat) hackathon.  
It supports multiple language models, user authentication, chat history sync, and **BYOK (Bring Your Own Key)** functionality for using your own API credits securely.

---

## Tech Stack

| Layer    | Tool                      |
| -------- | ------------------------- |
| Frontend | Next.js 15 (App Router)   |
| UI       | Tailwind CSS + shadcn/ui  |
| Auth     | Supabase Auth             |
| DB       | Supabase Postgres         |
| ORM      | Prisma                    |
| LLM API  | Vercel AI SDK             |
| BYOK     | Open Router               |
| Optional | Redis (resumable streams) |

---

## Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/yourusername/zermind.git
cd chat
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install

```

### 3. Environment Setup

Copy `.env.example` to `.env.local` and add your configuration:

```bash
cp .env.example .env.local
```

Required environment variables:

- `DATABASE_URL` and `DIRECT_URL` - Supabase database URLs
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase config
- `OPENROUTER_API_KEY` - Open Router key
- `API_KEY_ENCRYPTION_SECRET` - Strong secret for encrypting user API keys (32+ chars)

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### 5. Run project

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

---

## BYOK (Bring Your Own Key)

Zermind supports secure storage of your own API keys for various AI providers:

- **OpenRouter** - Access to multiple AI models
- **OpenAI** - GPT models
- **Anthropic** - Claude models
- **Meta** - Llama models
- **Google** - Gemini models

### Security Features

- AES-256-GCM encryption for all stored keys
- Keys encrypted with your own secret
- Only you can access your keys
- HTTPS-only transmission
- Key previews (never full keys in UI)

See [docs/byok-implementation.md](docs/byok-implementation.md) for detailed security information.

## License

MIT – use it freely, contribute back if you like.
Zermind was built with ❤️ for the [Cloneathon 2025](https://cloneathon.t3.chat) challenge.
