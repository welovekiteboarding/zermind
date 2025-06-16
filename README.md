<a href="https://zermind.ai/">
  <img alt="Zermind – Open Source AI Conversation Platform" src="https://zermind.ai/opengraph-image.png">
  <h1 align="center">Zermind – Open Source AI Conversation Platform</h1>
</a>

<p align="center">
  <a href="https://zermind.ai/privacy"><strong>Privacy Policy</strong></a> ·
  <a href="https://zermind.ai/terms"><strong>Terms of Use</strong></a> ·
  <a href="https://zermind.ai/imprint"><strong>Imprint</strong></a> ·
</p>
<br/>

**Zermind** is an open-source AI conversation platform that revolutionizes how you interact with multiple LLM providers through **dual interaction modes**: traditional chat and groundbreaking **conversational mind maps**.

**Transform linear conversations into visual thinking** – Where AI conversations themselves become explorable mind maps, enabling branching dialogues, multi-model debates, and resumable conversation trees.

---

## Features

### **Dual-Mode Innovation**

- **Chat Mode**: Traditional linear conversation interface
- **Mind Mode**: Revolutionary conversational mind mapping
- **Seamless Switching**: Convert any chat to mind map with one click

### **Conversational Mind Maps**

- **Node-Based Conversations**: Each mind map node represents a conversation point
- **Multi-Model Branching**: Ask the same question to different LLMs visually
- **Resumable Nodes**: Click any node to continue that conversation thread
- **Visual Flow**: See conversation logic and idea progression at a glance
- **Smart Auto-Layout**: Automatic positioning for clean visualization

### **Enhanced Multi-LLM Support**

- **Model Selection per Branch**: Choose different models for different conversation paths
- **Side-by-Side Responses**: Visual comparison of how models approach problems
- **Conversation Handoffs**: Seamlessly pass conversation context between models

### **Real-time Collaboration**

- **Collaborative Mind Maps**: Multiple users editing the same conversation tree
- **Conversation Ownership**: Track who created which branches

### **BYOK (Bring Your Own Key)**

- **Multi-Provider Support**: OpenRouter, OpenAI, Anthropic, Meta, Google
- **Smart Fallbacks**: Automatic OpenRouter fallback when no user keys exist
- **Key Previews**: Never display full keys in UI

---

## 🛠 Tech Stack

| Layer            | Technology               | Purpose                                  |
| ---------------- | ------------------------ | ---------------------------------------- |
| Frontend         | Next.js 15 (App Router)  | SSR + React Server Components            |
| Mind Map UI      | React Flow               | Interactive conversation visualization   |
| Styling          | Tailwind CSS + shadcn/ui | Responsive UI components                 |
| Auth             | Supabase Auth            | Email & OAuth authentication             |
| Database         | Supabase Postgres        | Conversation trees, users, collaboration |
| ORM              | Prisma                   | Enhanced schema for branching support    |
| LLM Interface    | Vercel AI SDK            | Unified API for multi-model LLMs         |
| BYOK             | Open Router              | Unified interface + secure key storage   |
| Collaboration    | Supabase Realtime        | Real-time collaboration and sessions     |
| State Management | Zustand                  | Conversation tree state management       |

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/zermind.git
cd zermind
```

### 2. Install Dependencies

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

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

**Required environment variables:**

```bash
# Database (Supabase)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# BYOK Encryption (REQUIRED - Generate with: openssl rand -base64 32)
API_KEY_ENCRYPTION_SECRET="your-very-strong-encryption-secret-here"

# Fallback API Key (Required - Works with ALL models)
OPENROUTER_API_KEY="sk-or-v1-your-openrouter-key"

# NODE ENV
NODE_ENV=development

# SEO
NEXT_PUBLIC_SITE_URL=your-production-url
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### 5. Launch Zermind

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) and experience the future of AI interaction!

---

## What Makes Zermind Revolutionary

### **Category Creation**

Zermind doesn't just use AI to create mind maps – **it turns AI conversations into mind maps**. We're creating the "Conversational AI Visualization" category.

### **Visual Thinking**

Transform complex ideas from linear chat limitations into explorable, shareable knowledge trees that reveal conversation logic and enable true multi-perspective AI collaboration.

### **"What If" Scenarios Made Visual**

- "What if I asked Claude instead of GPT-4?" → Create a branch and see both responses
- "What if we approached this differently?" → Branch from any conversation point
- "What would multiple AIs think?" → Multi-model debates in visual format

---

### Supported Providers

- **OpenRouter** - Access to 100+ AI models (fallback for all users)
- **OpenAI** - GPT models with your credits
- **Anthropic** - Claude models with your credits
- **Meta** - Llama models with your credits
- **Google** - Gemini models with your credits

See [docs/byok.md](docs/byok.md) for detailed security implementation.

---

## Open Source & Community

Zermind is proudly **MIT licensed** – use it freely, contribute back if you like.

### Contributing

We welcome contributions! Whether it's:

- New mind map visualization features
- Additional LLM provider integrations
- Mobile experience improvements
- Performance optimizations
- Documentation and examples

## Support Zermind

Zermind is an innovative open-source project built solo with passion and limited resources.

If you find it valuable or want to support development:

👉 [GitHub Sponsors – okikeSolutions](https://github.com/sponsors/okikeSolutions)

Your support helps us:

- Cover API costs for the demo environment
- Add new LLM providers and features
- Improve performance and scalability
- Build the future of AI interaction

---

## Documentation

- [BYOK Implementation](docs/byok.md) - Security details for API key management
- [Environment Setup](docs/env-setup.md) - Complete configuration guide
- [OpenRouter Integration](docs/openrouter.md) - Multi-model API setup

---

## License

MIT – use it freely, contribute back if you like.

**Zermind** was built to revolutionize how we think with AI.
