# MaveFlow 🚀
**Automate Your Google Workspace with AI**

MaveFlow is a highly sophisticated, multi-tenant AI automation platform that bridges the gap between your Google Workspace and intelligent automations. Using the local or remote **OpenClaw AI Engine**, it provides a real-time, ChatGPT-like assistant and background automation capabilities to supercharge your productivity.

## ✨ Features
- **Visual Workflow Builder:** Drag-and-drop React Flow canvas to build complex logic (Triggers, Conditions, Actions).
- **Google Workspace Integrated:** Deep API bindings for Gmail, Drive, Calendar, Tasks, and Sheets.
- **AI Powered:** Driven by OpenClaw Engine to understand intents, extract data from unstructured emails, and execute complex workflows.
- **Enterprise-Grade Security:** AES-256-GCM encryption for all OAuth tokens. Secure webhook signature validation.
- **High Performance:** Background job processing via Redis-backed BullMQ.
- **Real-time Observability:** Built-in Server-Sent Events (SSE) for live dashboard updates, Push notifications, and detailed structured logging (Pino).

## 🛠 Tech Stack
- **Framework:** Next.js 14 App Router
- **Language:** TypeScript
- **Database:** PostgreSQL (via Prisma ORM v5)
- **Queuing & Cache:** Redis (BullMQ, Upstash)
- **Styling:** Tailwind CSS + shadcn/ui + Framer Motion
- **Authentication:** NextAuth.js v5 (Google OAuth Provider)
- **Observability:** Sentry, Pino

---

## 💻 Local Development Setup

### 1. Prerequisites
- Node.js v22+
- PostgreSQL Server (Local or Neon DB)
- Redis Server (Local or Upstash)
- Google Cloud Console Account (for OAuth Credentials)

### 2. Environment Variables
Copy the example environment file and fill in your secrets.
\`\`\`bash
cp .env.example .env.local
\`\`\`
Ensure your \`DATABASE_URL\` is correct. You **must** generate a strong 64-character hex string for the \`ENCRYPTION_KEY\` to secure tokens.

### 3. Database Initialization
Install dependencies and initialize Prisma:
\`\`\`bash
npm install
npx prisma generate
npx prisma db push
npx prisma db seed # Injects dummy user and workflows for testing
\`\`\`

### 4. Run the Development Server
\`\`\`bash
npm run dev
\`\`\`
Navigate to \`http://localhost:3000\`.

## 🧪 Testing

We use Vitest for unit tests and Playwright for E2E tests.
\`\`\`bash
# Run unit tests
npm run test:unit

# Run End-to-End tests
npm run test:e2e
\`\`\`

## 🚀 Deployment (Vercel)
MaveFlow is optimized for Vercel. Connect your repository to Vercel and set the following:
1. Override Build Command: \`prisma generate && next build\`
2. Add all environment variables from \`.env.local\`.
3. Link your Vercel project to Postgres (e.g., Neon DB) and Redis (Upstash) via Vercel Integrations.

*Note: For BullMQ workers, Next.js Serverless Functions have execution limits. In a true production environment, consider deploying the worker processes on a persistent container service like Railway or Render.*
