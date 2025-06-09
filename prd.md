# 🧠 Zermind – Product Requirements Document (PRD)

## 🧾 Overview

**Zermind** is an open-source AI chat application that enables users to interact with multiple LLM providers through a fast, modern, and privacy-conscious interface. It focuses on core essentials — multi-model AI chat, synced history, and seamless UX — while remaining extensible and developer-friendly.

Zermind is built for the [Cloneathon 2025](https://cloneathon.t3.chat) and follows permissive open-source principles (MIT license).

---

## 🎯 Goals

### Core Objectives
- Support multiple LLM providers (OpenAI, Anthropic, Mistral, etc.)
- Allow users to authenticate, manage sessions, and sync chat history
- Stream LLM responses in real time
- Keep the codebase clean, documented, and open source
- Deliver a complete MVP within 1 week

### Bonus Objectives
- Support resumable streams (recover interrupted chats)
- Share chats via public URLs
- Ensure mobile responsiveness and performance

---

## 🏆 Cloneathon Requirements

### Core Requirements - The minimum to qualify for a prize

**Required:**
- **Chat with Various LLMs** - Implement support for multiple language models and providers
- **Authentication & Sync** - User authentication with chat history synchronization
- **Browser Friendly** - As much as we'd like to, we can't realistically get everyone's native apps set up
- **Mobile Friendly** - Why not ship mobile and web?
- **Easy to Try** - We need an easy way to try out what you've built!
- **Open Source** - Submissions must be open source with a permissive license (MIT, Apache, BSD etc.) and hosted on GitHub

### Bonus Requirements

**Preferred:**
- **Resumable Streams** - Continue generation after page refresh
- **Chat Sharing** - Share conversations with others
- **Bring Your Own Key** - Use your own API keys
- **Anything Else** - Get creative - we love unique ideas

---

## 🛠 Architecture

| Layer          | Technology             | Notes                                 |
|----------------|------------------------|---------------------------------------|
| Frontend       | Next.js 15 (App Router)| SSR + React Server Components         |
| Styling        | Tailwind CSS + shadcn/ui | Responsive UI components            |
| Auth           | Supabase Auth          | Email & OAuth (JWT-based sessions)    |
| Database       | Supabase Postgres      | Users, chats, messages, share IDs     |
| ORM            | Prisma                 |                                       |
| LLM Interface  | Vercel AI SDK          | Unified API for multi-model LLMs      |
| Streaming      | Server-Sent Events     | Token-by-token LLM responses          |
| Optional       | Upstash Redis          | Resumable stream storage              |
| Hosting        | Vercel                 | Free tier friendly                    |

---

## 👤 User Personas

### 1. Curious Users
- Want to try different LLMs side-by-side
- Prefer clean UX over advanced prompts

### 2. Developers / Hackers
- Interested in open-source alternatives to ChatGPT
- Want to self-host or fork the codebase

### 3. Technical Creatives
- Use AI to brainstorm, generate code, or write content
- Want to return to past chats or share sessions

---

## 🔑 Core Features

### ✅ 1. Multi-LLM Chat Interface
- Select from multiple models (e.g. GPT-4, Claude 3)
- Dynamic routing based on provider
- Optional system prompt per session

### ✅ 2. User Authentication
- Supabase email/password + social logins
- User session stored in JWT
- Authenticated access to chats

### ✅ 3. Chat History Persistence
- Messages stored in `messages` table
- Grouped by `chat_id` linked to user
- History visible and navigable on dashboard

### ✅ 4. Streaming Responses
- Serverless API via Vercel AI SDK
- Responses streamed to UI using ReadableStream
- Cancel + scroll + auto-scroll support

---

## ✨ Bonus Features

### 🔁 Resumable Streams
- Cache stream chunks in Redis
- Rehydrate progress if browser/tab refreshes

### 🔗 Shareable Chats
- Generate `/share/[id]` links
- Public read-only view of selected conversation

### 🧠 Syntax Highlighting
- Markdown + code block rendering
- Highlight with `rehype-prism` or `shiki`

---

## 🗃 Database Schema (simplified)

```sql
Table: users        -- Supabase Auth managed
Table: chats
- id UUID
- user_id UUID
- created_at TIMESTAMP
- title TEXT
- share_id TEXT (nullable)

Table: messages
- id UUID
- chat_id UUID
- role TEXT ('user' or 'assistant')
- content TEXT
- created_at TIMESTAMP

## FAQ

Inference is expensive, can I require bringing your own key?
- Absolutely fine - just make sure that OpenRouter is one of the BYOK options (makes testing much easier for us)