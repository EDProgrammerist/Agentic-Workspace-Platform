# Outpost — Agentic Workspace

![Next.js](https://img.shields.io/badge/-Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/-React-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/-TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Clerk](https://img.shields.io/badge/-Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)
![Supabase](https://img.shields.io/badge/-Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Prisma](https://img.shields.io/badge/-Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Google Gemini](https://img.shields.io/badge/-Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)
![Cloudflare Workers](https://img.shields.io/badge/-Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)
![Vercel](https://img.shields.io/badge/-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

Outpost is an agentic workspace: chat with an AI agent that draws on a canvas and writes docs, while your team works alongside it in real time.

---

## Features

- **Two-Surface AI Agent** – Ask for "a database schema, documented" and it draws the ERD on the canvas and writes the spec in the doc. Name a surface ("just the doc") and it sticks to it.
- **Canvas** – tldraw with a custom ERD table shape: editable columns, primary and foreign key badges, and arrows that snap to rows.
- **Collaborative Docs** – BlockNote with live cursors and edits merged by Yjs over Supabase Realtime.
- **Real-Time Canvas Collaboration** – Live cursors via tldraw sync.
- **Teams** – Clerk Organizations: everyone in an org can open any of its workspaces.
- **Dashboard** – Describe what you want to plan (typed or by voice) and land in a new workspace with the agent already working.
- **Kanban Board** – All workspaces with drag and drop.
- **Sharing** – Public read-only links, plus PDF export of the doc and canvas.
- **Subscription Management** – Clerk Billing with per-seat team plans, usage tracking, and plan limits.

---

## Tech Stack

- Framework: Next.js (App Router, Server Actions).
- Language: TypeScript.
- Auth, Orgs & Billing: Clerk (Organizations and Clerk Billing).
- Database & Realtime: Supabase (Postgres and Realtime).
- ORM: Prisma.
- AI Service: Vercel AI SDK with Google Gemini.
- Canvas: tldraw and tldraw sync.
- Docs: BlockNote and Yjs.
- UI: Tailwind CSS and shadcn/ui.
- Hosting: Vercel (app) + Cloudflare Workers (canvas sync server).

---

## Quick Start

### Prerequisites

- Node.js 22 or later
- Clerk account (Authentication, Organizations, Billing)
- Supabase project (Database and Realtime)
- Google AI Studio API key (Gemini)

### Installations

**Clone the repository**
```bash
git clone <this-repo-url> outpost
cd outpost
```
**Install Dependencies** (also generates the Prisma client)
```bash
npm install
```
**Environment setup**
```bash
cp .env.example .env
```
**Update .env with your configuration** (see [Environment Variables](#environment-variables)).

**Create the database tables**
```bash
npx prisma migrate deploy
```
**Clerk setup** – see [Clerk Setup](#clerk-setup).

**Supabase Realtime** – doc collaboration uses **public** broadcast channels. In your Supabase project's Realtime settings, make sure public (non-private) channels are allowed.

**Development**
```bash
npm run dev
```
Visit: http://localhost:3000

To try collaboration, sign in with two different accounts in two browser windows (for example a normal and a private window).

---

## Repository Structure
```bash
/outpost
├── app
│   ├── page.tsx                  # Landing page
│   ├── (main)/dashboard/         # Prompt box and recent workspaces
│   ├── (main)/workspaces/        # Kanban board of all workspaces
│   ├── (main)/workspace/[id]/    # The workspace: doc, canvas and agent
│   ├── shared/[token]/           # Public read-only view
│   └── api/agent/                # The agent: Gemini, tools and prompt limits
├── actions/                      # Server Actions (workspaces, docs, canvas, usage)
├── components/                   # Shared UI (page-specific ones live in _components/)
│   └── EntityTable/              # Custom ERD table shape for tldraw
├── hooks/                        # Agent chat, collaborative doc and more
├── lib/
│   ├── agent-tools.ts            # Every agent tool's description and schema
│   ├── agent-canvas.ts           # Canvas tools, run in the browser
│   ├── agent-doc.ts              # Doc tools, run in the browser
│   ├── billing.ts                # Plan lookup from Clerk and prompt usage
│   ├── plan-limits.ts            # Free limits and upgrade messages
│   └── supabase-yjs-provider.ts  # Syncs the doc over Supabase Realtime
├── prisma/                       # Database schema and migrations
├── tldraw-sync/                  # Canvas sync server (Cloudflare Worker)
└── README.md
```

---

## Architecture Overview

**Frontend**
- Next.js App Router with Clerk for auth and organizations
- tldraw (canvas) and BlockNote (doc) editors, synced through tldraw sync and Yjs over Supabase Realtime

**Backend**
- Server Actions for workspaces, docs, canvas, and usage
- `/api/agent` streams Gemini responses and enforces prompt limits
- Prisma on Supabase Postgres

**How the agent works**
- The agent's tools have no server-side implementation.
- Gemini decides which tool to call, and the browser runs it against the live canvas and doc editors, so collaborators see changes appear in real time.
- Every request sends a compact summary of both surfaces, so the agent can edit what's already there.

---

## Environment Variables

| Variable | Where it comes from |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Clerk dashboard → API keys |
| `DATABASE_URL` | Supabase → Connect: **pooled** connection string (port 6543), with `?pgbouncer=true` |
| `DIRECT_URL` | Supabase → Connect: **direct/session** connection string (port 5432), used for migrations |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI Studio → API keys |
| `NEXT_PUBLIC_TLDRAW_SYNC_URL` | URL printed when you deploy `tldraw-sync` |
| `NEXT_PUBLIC_TLDRAW_LICENSE_KEY` | Optional in development (see [Deployment](#deployment)) |

---

## Clerk Setup

In the [Clerk dashboard](https://dashboard.clerk.com):

1. **Organizations:** enable them, with **Membership optional**, so people can also work in a personal account.
2. **Billing:** enable billing for **users** and **organizations**, and choose the **Clerk development gateway** (test payments, no Stripe account needed).
3. **Features** (Billing → Subscription plans → Features). The code checks these keys, so use them exactly:

| Key | Purpose |
|---|---|
| `unlimited_workspaces` | Removes the 3-workspace limit |
| `public_sharing` | Public read-only links |
| `pdf_export` | PDF export |
| `agent_prompts_500` | 500 agent prompts per seat per month |
| `agent_prompts_2000` | 2,000 agent prompts per seat per month |

You can add display-only features too (like "Voice input"). The code ignores keys it doesn't know. **Never attach the five keys above to a Free plan.**

4. **Plans** (monthly):

| Plan | Type | Key | Price | Features |
|---|---|---|---|---|
| Free | user and org (default) | | $0 | none of the five above |
| Pro | user | `pro` | $12 / month | the first four |
| Team | organization, seat-based | `team` | $12 per member / month | the first four |
| Enterprise | organization, seat-based | `enterprise` | $25 per member / month | the first three, plus `agent_prompts_2000` |

Free plans are limited to 20 agent prompts a month and 3 workspaces. These numbers live in `lib/plan-limits.ts`.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Lint with ESLint |
| `npm run seed -- you@email.com [org_id]` | Add demo workspaces (sign in once first) |

After changing `prisma/schema.prisma`, create and apply a migration, run `npx prisma generate`, and restart the dev server.

---

## Scaling Up

Outpost runs on free tiers out of the box.

| Today | To scale up |
|---|---|
| Doc collaboration uses **public** Supabase Realtime channels. | Use private channels with Supabase Realtime Authorization, and connect Clerk to Supabase so clients join with their Clerk session. |
| **PDF export** runs in the browser. | Move export to the server if you want it enforced server-side too. |
| Billing uses Clerk's **development gateway**. | Connect your own Stripe account in Clerk before taking real payments. |
| Clerk Billing is in public beta, and its components are **experimental**. | `@clerk/nextjs` and `@clerk/ui` are pinned to exact versions. Keep them pinned, and test before upgrading. |

---

## Deployment

| Component | Platform | Notes |
|---|---|---|
| App | Vercel | Add the same environment variables |
| Canvas sync | Cloudflare Workers | Free, no domain needed |
| Database | Supabase | Postgres + Realtime |
| Payments | Clerk Billing | Connect Stripe for real payments |

**1. Deploy the canvas sync server** and set `NEXT_PUBLIC_TLDRAW_SYNC_URL` to the URL it prints:
```bash
cd tldraw-sync
npm install
npx wrangler login
npm run deploy
```
**2. Deploy to Vercel** and add the same environment variables.

**3. Add a tldraw license.** Get a free **hobby license** from [tldraw.dev](https://tldraw.dev/pricing) and set `NEXT_PUBLIC_TLDRAW_LICENSE_KEY`. Without a key, tldraw shows a "Get a license for production" watermark.

**4. For real payments,** connect Stripe in Clerk Billing.

---

## Contributing

We welcome contributions from developers who want to improve Outpost!

1. **Fork the Repository:** Click the Fork button on GitHub to create your copy.
2. **Clone Your Fork:**
   ```bash
   git clone https://github.com/<your-username>/outpost.git
   ```
3. **Create a Feature Branch:**
   ```bash
   git checkout -b feat/your-feature-name
   ```
4. **Set Up the Environment:** Follow [Quick Start](#quick-start).
5. **Follow Code Style:**
   ```bash
   npm run lint
   ```
6. **Use Clear Commit Messages:**
   - `feat:` – new feature
   - `fix:` – bug fix
   - `docs:` – documentation update
   - `refactor:` – code restructuring
7. **Submit a Pull Request (PR):** Include a description of changes, issue references (e.g., Closes #12), and screenshots if applicable.
8. **Participate in Code Review:** Be collaborative and responsive.

---

## Code of Conduct

- Be respectful, kind, and patient
- Welcome feedback constructively
- Avoid offensive or discriminatory language
- Focus on collaboration
- Credit contributors appropriately
- Report concerns privately

---

## License

See the LICENSE file for details.
