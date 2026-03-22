# MAAL LINE - Claude Code Rules

## Project Overview
MAAL LINE is a streetwear oversize e-commerce platform. Dark theme public store + light theme admin panel.
Target audience: 18-30, mobile-first (70%+ mobile traffic).

## Stack
- **Framework**: Next.js 14 (App Router) + React 18 + TypeScript 5 (strict)
- **Styling**: Tailwind CSS 3.4 (Street Dark theme: BG #0A0A0A, Accent #FF3D00)
- **Database**: Prisma 7.3 + Neon PostgreSQL (serverless adapter)
- **Auth**: NextAuth v5 beta (credentials + Google OAuth)
- **State**: Zustand (cart, filters, quick-view)
- **Animations**: Framer Motion 12
- **Payments**: Stripe (international) + MercadoPago (LATAM/Mexico)
- **Icons**: Lucide React
- **Toasts**: Sileo (gooey SVG)
- **Charts**: Recharts (admin)

## Setup Commands
```bash
npm install
npx prisma generate
npm run dev          # http://localhost:3000
npx prisma db push   # sync schema to DB
npx prisma studio    # visual DB browser
```

## Architecture Rules

### File Organization
- `app/` - Next.js App Router pages and API routes
- `components/` - React components (admin/, cart/, navigation/, product/, ui/, providers/, common/)
- `lib/` - Business logic (auth, db, queries, store, utils, transformers, analytics)
- `prisma/` - Schema and migrations
- `types/` - TypeScript type definitions
- `hooks/` - Custom React hooks
- `scripts/` - Utility scripts (seed, set-owner)

### Auth Architecture
- Split config: `lib/auth.config.ts` (Edge-safe) + `lib/auth.ts` (server-only with Prisma)
- Separate login flows: `/login` (customers) vs `/admin/login` (staff)
- RBAC: customer < viewer < employee < manager < admin < owner
- 30+ granular permissions in `lib/permissions.ts`
- NEVER import Prisma or bcrypt in Edge Runtime files

### Database
- Always use `lib/db.ts` for Prisma client (uses Neon serverless adapter)
- Query functions live in `lib/queries/` - one file per domain
- Data transformers in `lib/transformers/` convert Prisma types to component-friendly formats
- Schema: 42 models across 15 modules (see `prisma/schema.prisma`)

### State Management
- Zustand stores in `lib/store/` - cart, filters, quick-view
- Cart persisted to localStorage
- Filter store syncs with URL query params

### API Routes
- All API routes under `app/api/`
- Use `requireAuth()` / `requireAdmin()` / `requirePermission()` from `lib/auth-utils.ts`
- Return `NextResponse.json()` with proper status codes
- Webhooks (Stripe/MercadoPago) have dedicated routes

### Styling
- Use `cn()` from `lib/utils/cn.ts` for conditional Tailwind classes
- Follow design system in `MAAL-LINE-DESIGN-SYSTEM.md`
- Fonts: Space Grotesk (headings), Inter (body)
- Z-index stack: dropdown(100), sticky(200), drawer(300), modal(400), toast(500), tooltip(600)
- Minimal border radius (sm:2px, md:6px, lg:8px)

### Components
- Product cards use `transformProductForCard()` from `lib/transformers/product.ts`
- Admin components use `<PermissionGate>` for role-based UI
- Badges: new, restock, bestseller, sale, limited, soldout
- Sizes: XS, S, M, L, XL, XXL, 3XL

## Code Style
- TypeScript strict mode - no `any` types
- Use path alias `@/*` for imports
- Spanish for user-facing routes and text (producto, categoria, cuenta, pedidos)
- English for code (variables, functions, components, comments)
- Prefer server components; use `'use client'` only when needed
- ISR with `revalidate = 300` (5 min) on homepage

## Security
- NEVER commit `.env` files
- Auth secrets must be 32+ chars in production
- Always validate user input at API boundaries
- Use `requirePermission()` for granular access control
- Security events logged to `SecurityEvent` table

## Testing
- Run `npm run lint` before committing
- Test payment flows with Stripe test mode keys

## Deployment
- Platform: Vercel
- Database: Neon PostgreSQL
- Run `prisma generate && next build` for production builds
- Required env vars: DATABASE_URL, AUTH_SECRET, NEXTAUTH_URL, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, MERCADOPAGO_ACCESS_TOKEN, NEXT_PUBLIC_APP_URL
