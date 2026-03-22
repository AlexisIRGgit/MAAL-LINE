# AGENTS.md — MAAL LINE E-commerce Orchestration

> This file follows the [agents.md](https://agents.md/) open specification.
> It guides AI coding agents working on the MAAL LINE streetwear e-commerce platform.

---

## Project Identity

- **Name**: MAAL LINE
- **Type**: E-commerce platform (streetwear oversize)
- **Audience**: 18-30, Mexico/LATAM, mobile-first (70%+ mobile)
- **Domain**: maalline.com
- **Language**: Spanish (UI/routes) / English (code)

---

## Setup Commands

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Start dev server
npm run dev

# Sync schema to database
npx prisma db push

# Visual DB browser
npx prisma studio

# Production build
npm run build
```

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 14.2.0 |
| UI Library | React | 18.x |
| Language | TypeScript (strict) | 5.x |
| Styling | Tailwind CSS | 3.4.x |
| ORM | Prisma + Neon Serverless Adapter | 7.3.0 |
| Database | Neon PostgreSQL | Serverless |
| Auth | NextAuth v5 beta | 5.0.0-beta.30 |
| State | Zustand | 4.5.x |
| Animations | Framer Motion | 12.x |
| Payments | Stripe + MercadoPago | Latest |
| Icons | Lucide React | 0.563.x |
| Charts | Recharts | 3.7.x |
| Toasts | Sileo (gooey SVG) | 0.1.4 |

---

## Architecture Overview

```
app/                    → Next.js App Router (pages + API routes)
├── (auth)/             → Customer login/register (route group)
├── (admin-auth)/       → Admin login (route group)
├── admin/              → Admin dashboard + management
├── api/                → 31 REST API endpoints
├── producto/[slug]/    → Product detail
├── categoria/[slug]/   → Category listing
├── coleccion/[slug]/   → Collection pages
├── checkout/           → Checkout flow
├── cuenta/             → User account (profile, addresses, orders)
└── wishlist/           → Saved items

components/             → React components
├── admin/              → Admin-specific (dashboard, forms, sidebar)
├── cart/               → Shopping cart modal
├── navigation/         → Navbar, footer, promo bar
├── product/            → Product card, quick-view modal
├── ui/                 → Base components (button, badge)
├── providers/          → Session, toast providers
└── common/             → Logo, shared elements

lib/                    → Business logic
├── auth.ts             → NextAuth config (server-only, uses Prisma)
├── auth.config.ts      → Auth config (Edge-safe, NO Prisma/bcrypt)
├── auth-utils.ts       → requireAuth(), requireAdmin(), requirePermission()
├── db.ts               → Prisma client (Neon serverless adapter)
├── permissions.ts      → RBAC system (30+ permissions, role hierarchy)
├── stripe.ts           → Stripe client
├── mercadopago.ts      → MercadoPago client
├── queries/            → Prisma query functions (one file per domain)
├── store/              → Zustand stores (cart, filters, quick-view)
├── transformers/       → Prisma → component data transformers
├── utils/              → cn(), formatters
└── analytics/          → Event tracking

prisma/
├── schema.prisma       → 42 models, 15 modules (1382 lines)
└── migrations/         → Database migrations

types/                  → TypeScript definitions (367 lines)
hooks/                  → Custom React hooks
scripts/                → Utility scripts (seed, set-owner)
```

---

## Code Style & Conventions

- **TypeScript strict mode** — no `any` types, ever
- **Path alias**: `@/*` for all imports
- **Route naming**: Spanish for user-facing (`producto`, `categoria`, `cuenta`)
- **Code naming**: English for everything (variables, functions, components, comments)
- **Server-first**: Prefer server components; `'use client'` only when necessary
- **ISR**: `revalidate = 300` (5 min cache) on homepage
- **Class merging**: Always use `cn()` from `@/lib/utils/cn`
- **Fonts**: Space Grotesk (headings), Inter (body)
- **Border radius**: Minimal (sm: 2px, md: 6px, lg: 8px) — street aesthetic

---

## Critical Architecture Rules

### Auth (Edge Runtime Safety)
- `lib/auth.config.ts` is Edge-safe — NEVER import Prisma or bcrypt here
- `lib/auth.ts` is server-only — contains Prisma adapter and bcrypt
- Two separate login flows: `/login` (customers) vs `/admin/login` (staff)
- Role hierarchy: `customer < viewer < employee < manager < admin < owner`

### Database
- ALWAYS use `lib/db.ts` for Prisma client — it configures the Neon adapter
- Query functions go in `lib/queries/` — one file per domain (products, orders, etc.)
- Data transformers in `lib/transformers/` — convert Prisma types before sending to components
- NEVER call Prisma directly in components — use query functions

### State Management
- Zustand stores in `lib/store/` — cart (localStorage), filters (URL sync), quick-view (ephemeral)
- Cart persistence: Zustand + localStorage middleware
- Filters: Synced with URL query params via `useFilterUrlSync()`

### API Routes
- All under `app/api/`
- Auth checks: `requireAuth()`, `requireAdmin()`, `requirePermission(code)`
- Return: `NextResponse.json()` with proper HTTP status codes
- Payment webhooks: dedicated routes for Stripe and MercadoPago

### Design System
- Theme: Street Dark (BG #0A0A0A, accent #FF3D00 fire orange)
- Z-index stack: dropdown(100), sticky(200), drawer(300), modal(400), toast(500), tooltip(600)
- Badges: new, restock, bestseller, sale, limited, soldout
- Sizes: XS, S, M, L, XL, XXL, 3XL
- Full spec in `MAAL-LINE-DESIGN-SYSTEM.md`

---

## Security Rules

- NEVER commit `.env` files — use `.env.example` as template
- Auth secrets: 32+ characters in production
- Always validate user input at API boundaries
- Use `requirePermission()` for granular access control
- Security events are logged to `SecurityEvent` model
- Admin routes protected by middleware + API-level checks

---

## Testing

```bash
npm run lint          # ESLint check
```

- Test payment flows with Stripe test mode keys
- Verify webhook handling with Stripe CLI (`stripe listen --forward-to`)

---

## Deployment

- **Platform**: Vercel
- **Database**: Neon PostgreSQL (serverless)
- **Build**: `prisma generate && next build`
- **Required env vars**: DATABASE_URL, AUTH_SECRET, NEXTAUTH_URL, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, MERCADOPAGO_ACCESS_TOKEN, NEXT_PUBLIC_APP_URL

---

## Agent Orchestration Model

### Roles

| Role | Responsibility | When to Invoke |
|------|---------------|----------------|
| **Architect (Jarvis)** | System design, orchestration, planning | Before any multi-file change |
| **Proposer** | Generates implementation proposals with diffs | When Architect approves a plan |
| **Implementer** | Executes approved proposals, writes code | After Proposer's plan is reviewed |
| **Explorer** | Codebase research, file discovery, impact analysis | When context is needed |
| **Reviewer** | Code review, security audit, performance check | After implementation |

### Workflow

1. **User assigns task** → Architect analyzes scope and impact
2. **Architect plans** → Breaks into subtasks, identifies files, assigns roles
3. **Explorer researches** → Gathers context on affected code
4. **Proposer drafts** → Creates implementation plan with specific changes
5. **User approves** → Reviews proposal before any code changes
6. **Implementer executes** → Writes code following the approved plan
7. **Reviewer validates** → Checks quality, security, performance

### Constraints

- **No cowboy coding** — every change goes through the orchestration pipeline
- **User approval required** — before any code modification
- **Memory-first** — check Engram memory before starting any task
- **Docs stay current** — update PROJECT_CONTEXT.md after significant changes

---

## Installed Agent Templates

### Specialist Agents (`.claude/agents/`)
- `expert-nextjs-developer` — Next.js 14 App Router expert
- `expert-react-frontend-engineer` — React component architecture
- `nextjs-architecture-expert` — System design and patterns
- `react-performance-optimizer` — Performance profiling and fixes
- `seo-analyzer` — SEO audit and optimization

### Skills (`.claude/skills/`)
- `nextjs-best-practices` — Next.js patterns and conventions
- `react-best-practices` — 40+ React performance rules
- `prisma-expert` — Prisma ORM patterns
- `typescript-expert` — TypeScript cheatsheet and utility types
- `stripe-integration` — Stripe payment integration
- `senior-fullstack` — Architecture patterns, tech stack guide
- `frontend-dev-guidelines` — 10 resource files (patterns, routing, data fetching, etc.)

---

## Documentation Map

| File | Contents |
|------|----------|
| `CLAUDE.md` | Claude Code rules and project conventions |
| `AGENTS.md` | This file — agent orchestration spec |
| `MAAL-LINE-DESIGN-SYSTEM.md` | Complete visual design system |
| `docs/PROJECT_CONTEXT.md` | Stack, structure, env vars, current state |
| `docs/MAAL-LINE-DATABASE-FINAL.md` | Database architecture (42 models, 15 modules) |
