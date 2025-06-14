# 🧠 Zermind – Enhanced Product Requirements Document (PRD)

## 🧾 Overview

**Zermind** is an open-source AI conversation platform that revolutionizes how users interact with multiple LLM providers through **dual interaction modes**: traditional chat and groundbreaking **conversational mind maps**. It's the first platform where AI conversations themselves become the visual structure, enabling users to explore ideas through branching dialogues, multi-model debates, and resumable conversation trees.

Zermind transforms AI interaction from linear chat into **visual thinking**, making it the definitive tool for complex ideation, collaborative brainstorming, and knowledge exploration.

Zermind is built for the [Cloneathon 2025](https://cloneathon.t3.chat) and follows permissive open-source principles (MIT license).

---

## 🎯 Goals

### Core Objectives
- **Dual-Mode Innovation**: Seamlessly switch between traditional chat and revolutionary Mind Mode
- **Multi-LLM Conversations**: Enable different AI models to participate in the same conversation tree
- **Visual AI Interaction**: Transform conversations into explorable, shareable mind maps
- Support multiple LLM providers (OpenAI, Anthropic, Meta, etc.) across both modes
- Allow users to authenticate, manage sessions, and sync conversation history
- Stream LLM responses in real time in both chat and mind map modes
- Keep the codebase clean, documented, and open source
- Deliver a complete MVP within 7 days

### Bonus Objectives
- **Conversational Branching**: "What if I asked Claude instead of GPT-4?" visualized
- **Resumable Conversation Nodes**: Pick up any conversation thread from any point
- Share mind map conversations via public URLs
- Multi-user collaborative mind mapping sessions
- Ensure mobile responsiveness and performance across both modes

---

## 🏆 Cloneathon Requirements

### Core Requirements - The minimum to qualify for a prize

**Required:**
- **Chat with Various LLMs** ✅ - Implement support for multiple language models in both modes
- **Authentication & Sync** ✅ - User authentication with conversation history synchronization  
- **Browser Friendly** ✅ - Responsive web application with mind map visualization
- **Mobile Friendly** ✅ - Touch-optimized mind map interface for mobile devices
- **Easy to Try** ✅ - Instant demo mode showcasing both chat and mind map features
- **Open Source** ✅ - Submissions must be open source with MIT license on GitHub

### Bonus Requirements - **Zermind's Unique Advantages**

**Revolutionary Features:**
- **Mind Map Mode** 🔥 - First-ever conversational mind mapping with AI
- **Multi-Model Branching** 🔥 - Visual comparison of different LLM responses  
- **Resumable Conversation Trees** 🔥 - Continue any conversation thread from any node
- **Chat Sharing** ✅ - Share both linear chats and visual mind maps
- **Bring Your Own Key** ✅ - Use your own API keys (OpenRouter supported)
- **Real-time Collaboration** 🔥 - Collaborative mind mapping sessions
- **Conversation Export** 🔥 - Export mind maps as interactive formats

---

## 🛠 Architecture

| Layer          | Technology             | Notes                                 |
|----------------|------------------------|---------------------------------------|
| Frontend       | Next.js 15 (App Router)| SSR + React Server Components         |
| Mind Map UI    | React Flow + D3.js     | Interactive conversation visualization |
| Styling        | Tailwind CSS + shadcn/ui | Responsive UI components            |
| Auth           | Supabase Auth          | Email & OAuth (JWT-based sessions)    |
| Database       | Supabase Postgres      | Users, chats, messages, conversation trees |
| ORM            | Prisma                 | Enhanced schema for branching support  |
| LLM Interface  | Vercel AI SDK          | Unified API for multi-model LLMs      |
| BYOK           | Open Router            | Unified Interface for LLMs            |
| Streaming      | Server-Sent Events     | Token-by-token LLM responses          |
| State Management| Zustand               | Conversation tree state management     |
| Layout Engine  | elkjs                  | Auto-layout for mind map positioning  |
| Optional       | Upstash Redis          | Resumable stream storage              |
| Hosting        | Vercel                 | Free tier friendly                    |

---

## 👤 User Personas

### 1. Visual Thinkers
- Want to see how their ideas connect and evolve
- Prefer exploring concepts through branching rather than linear chat
- Love the ability to compare different AI perspectives visually

### 2. Collaborative Teams
- Need to brainstorm complex ideas with AI assistance
- Want to see how different team members' conversations branch
- Value the ability to resume conversations from any point

### 3. Researchers & Writers
- Explore topics through multi-faceted AI conversations
- Need to organize complex research into visual knowledge trees
- Want to compare how different models approach the same question

### 4. Developers / Hackers
- Interested in open-source alternatives to traditional AI chat
- Want to understand and fork the conversation visualization codebase
- Excited by the technical innovation of conversation trees

### 5. Curious Experimenters
- Want to try different LLMs side-by-side in visual format
- Love exploring "what if" scenarios through conversation branching
- Enjoy sharing interesting conversation trees with others

---

## 🔑 Core Features

### 🎭 **Dual-Mode Interface**
- **Chat Mode**: Traditional linear conversation interface (existing)
- **Mind Mode**: Revolutionary conversational mind mapping (new)
- **Seamless Switching**: Convert any chat to mind map with one click
- **Mode-Specific UI**: Optimized interfaces for each interaction style

### 🗺️ **Mind Mode - Conversational Visualization**
- **Node-Based Conversations**: Each mind map node represents a conversation point
- **Multi-Model Branching**: Ask the same question to different LLMs visually
- **Resumable Nodes**: Click any node to continue that conversation thread
- **Visual Flow**: See conversation logic and idea progression at a glance
- **Smart Auto-Layout**: Automatic positioning using elkjs for clean visualization

### 🤖 **Enhanced Multi-LLM Support**
- **Model Selection per Branch**: Choose different models for different conversation paths
- **Side-by-Side Responses**: Visual comparison of how models approach problems
- **Model Personas**: Assign roles to different models (e.g., "Critic", "Supporter", "Analyst")
- **Conversation Handoffs**: Seamlessly pass conversation context between models

### 🔄 **Advanced Conversation Management**
- **Branching Logic**: "What if I asked this differently?" becomes a visual branch
- **Merge Conversations**: Combine insights from different branches
- **Conversation Templates**: Start with pre-built conversation tree templates
- **Context Preservation**: Each node maintains full conversation context

### 👥 **Collaborative Features**
- **Real-time Collaboration**: Multiple users editing the same mind map
- **Conversation Ownership**: Track who created which branches
- **Comment System**: Add notes and annotations to conversation nodes
- **Team Workspaces**: Shared spaces for collaborative AI exploration

### ✅ **Enhanced Core Features** (from original PRD)
- **User Authentication**: Supabase email/password + social logins
- **Conversation Persistence**: Both chat and mind map conversations saved
- **Streaming Responses**: Real-time streaming in both modes
- **Shareable Content**: Public URLs for both chats and mind maps

---

## ✨ **Revolutionary Bonus Features**

### 🌳 **Advanced Mind Mapping**
- **Conversation Tree Export**: Export as interactive HTML, PDF, or image
- **Template Library**: Pre-built conversation trees for common use cases
- **Search & Discovery**: Find conversations by topic, model, or outcome
- **Conversation Analytics**: Insights into conversation patterns and effectiveness

### 🔁 **Resumable Everything**
- **Node-Level Resumption**: Resume any conversation from any point in the tree
- **Session Recovery**: Restore interrupted collaborative sessions
- **Cross-Device Sync**: Continue conversations seamlessly across devices

### 🔗 **Enhanced Sharing**
- **Interactive Mind Map Links**: Share live, explorable conversation trees
- **Embedded Mind Maps**: Embed conversation trees in other websites
- **Conversation Highlights**: Share specific branches or insights
- **Community Gallery**: Discover and remix public conversation trees

### 🧠 **Smart Features**
- **Conversation Suggestions**: AI suggests next questions based on conversation flow
- **Duplicate Detection**: Identify similar conversation branches
- **Auto-Branching**: Automatically suggest alternative conversation paths
- **Insight Extraction**: Summarize key insights from conversation trees

---

## 🗃 **Enhanced Database Schema**

```sql
-- Core Tables (Enhanced)
Table: users        -- Supabase Auth managed
Table: chats
- id UUID
- user_id UUID
- mode ENUM ('chat', 'mind') -- NEW: Track interaction mode
- created_at TIMESTAMP
- title TEXT
- share_id TEXT (nullable)
- is_collaborative BOOLEAN DEFAULT false -- NEW: For real-time collab
- template_id UUID (nullable) -- NEW: Reference to conversation templates

-- Enhanced Messages Table for Branching Support
Table: messages
- id UUID
- chat_id UUID
- parent_id UUID (nullable) -- NEW: For conversation branching
- branch_name TEXT (nullable) -- NEW: User-defined branch labels
- role TEXT ('user' or 'assistant')
- content TEXT
- model TEXT (nullable) -- Track which model generated response
- created_at TIMESTAMP
- x_position FLOAT DEFAULT 0 -- NEW: Mind map coordinates
- y_position FLOAT DEFAULT 0 -- NEW: Mind map coordinates
- node_type ENUM ('conversation', 'branching_point', 'insight') -- NEW
- is_collapsed BOOLEAN DEFAULT false -- NEW: For mind map UI state

-- New Tables for Advanced Features
Table: conversation_templates
- id UUID
- name TEXT
- description TEXT
- creator_id UUID
- structure JSONB -- Template conversation tree structure
- is_public BOOLEAN DEFAULT false
- created_at TIMESTAMP

Table: collaboration_sessions
- id UUID
- chat_id UUID
- participants JSONB -- Array of user IDs
- active_since TIMESTAMP
- last_activity TIMESTAMP

Table: conversation_insights
- id UUID
- chat_id UUID
- message_id UUID
- insight_type TEXT
- content TEXT
- created_at TIMESTAMP

-- Indexes for Performance
CREATE INDEX messages_parent_id_idx ON messages(parent_id);
CREATE INDEX messages_chat_id_created_at_idx ON messages(chat_id, created_at);
CREATE INDEX chats_mode_idx ON chats(mode);
CREATE INDEX messages_model_idx ON messages(model);
```

---

## 🚀 **7-Day Implementation Plan**

### **Day 1-2: Foundation & Core Chat** (Existing)
- Set up Next.js 15 + Tailwind + Supabase
- Implement basic chat interface with multi-LLM support
- Database schema and authentication

### **Day 3-4: Mind Mode Core**
- Add React Flow for mind map visualization
- Implement conversation branching in database
- Basic node creation and conversation resumption
- Mode switching functionality

### **Day 5-6: Advanced Mind Features**
- Multi-model branching visualization
- Real-time collaboration basics
- Mobile-responsive mind map interface
- Mind map export functionality (optional)

### **Day 7: Polish & Deploy**
- Performance optimization
- Demo content and onboarding
- Final testing and deployment
- Documentation and README

---

## 🎯 **Unique Value Propositions**

### **Category Creation**
Zermind doesn't just use AI to create mind maps - **it turns AI conversations into mind maps**. We're creating the "Conversational AI Visualization" category.

### **First-Mover Advantages**
- **First multi-LLM conversation visualization platform**
- **First resumable conversation node system**
- **First collaborative AI mind mapping tool**

### **Network Effects**
- Shared conversation trees become valuable knowledge assets
- Community-driven conversation templates
- Viral sharing of interesting AI interaction patterns

### **Technical Innovation**
- Advanced conversation state management
- Real-time collaborative AI interaction
- Visual representation of AI model differences

---

## 🏆 **Why Zermind Wins the Cloneathon**

### **Complete Innovation**
While others build ChatGPT clones, Zermind **redefines AI interaction**. Judges will immediately see this isn't just another chat app.

### **Visual Impact**
Mind map demos will be instantly compelling - showing conversation trees exploring complex topics with multiple AI models.

### **Technical Excellence**
Complex conversation state management, real-time collaboration, and multi-model orchestration demonstrate serious engineering skill.

### **Practical Value**
Solves real problems for researchers, writers, teams, and anyone doing complex thinking with AI.

---

## 💡 **Demo Script for Judges**

1. **"Traditional AI chat is limited..."** - Show linear ChatGPT-style conversation
2. **"What if conversations could branch?"** - Switch to Mind Mode, show branching
3. **"What if different AIs could debate?"** - Create branches with GPT-4 vs Claude
4. **"What if you could resume any conversation?"** - Click any node, continue chatting
5. **"What if teams could collaborate?"** - Show real-time collaborative mind mapping
6. **"This is the future of AI interaction."** - Zoom out to show full conversation tree

---

## 🔍 **Success Metrics**

- **User Engagement**: Time spent in Mind Mode vs Chat Mode
- **Conversation Depth**: Average nodes per conversation tree
- **Model Diversity**: Usage across different LLM providers
- **Sharing Activity**: Public mind map creation and views
- **Collaboration**: Multi-user session frequency
- **Template Usage**: Adoption of conversation templates

---

## 📱 **Mobile Considerations**

- **Touch-Optimized**: Pinch-to-zoom, tap-to-expand mind map nodes
- **Responsive Layout**: Automatic layout adjustment for mobile screens
- **Simplified Mode**: Mobile-specific mind map view with essential features
- **Offline Support**: View cached conversation trees without internet

---

## 🔧 **Technical Challenges & Solutions**

### **Challenge**: Real-time collaborative mind mapping
**Solution**: WebSocket-based state synchronization with conflict resolution

### **Challenge**: Complex conversation state management  
**Solution**: Zustand for client state + PostgreSQL for persistence with careful indexing

### **Challenge**: Performant mind map rendering
**Solution**: React Flow with virtualization for large conversation trees

### **Challenge**: Multi-model API rate limiting
**Solution**: Intelligent request queuing and fallback model selection

---

This enhanced PRD positions Zermind as a **category-defining innovation** rather than an incremental improvement. The dual-mode approach allows you to deliver both familiar chat functionality and revolutionary mind mapping within the 7-day timeframe, creating maximum impact for the competition judges. 