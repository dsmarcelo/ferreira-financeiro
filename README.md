# Ferreira Financeiro

A production-ready financial management app built with Next.js 15 (App Router), TypeScript, Drizzle ORM, PostgreSQL, and Auth.js (NextAuth) credentials login. It tracks incomes, cash register, expenses (personal, store, and product purchases), recurring/parcelled payments, and generates PDFs.

## Highlights

- 📊 Dashboard and summaries (by period)
- 🔐 Auth.js credentials login + route protection middleware
- 💵 Cash register and incomes with profit margin
- 🧾 Expenses: one-time, parcelled, and recurring with occurrence handling
- 🗂️ Categories with drag-and-drop ordering
- 📄 PDF exports (cash register, expenses, purchases, summary)
- 🎨 Modern UI using shadcn/ui and Tailwind CSS 4

## Tech Stack

- Next.js 15 (App Router) + React 19
- TypeScript
- Drizzle ORM (PostgreSQL)
- Auth.js (NextAuth v5 beta) credentials provider
- shadcn/ui + Tailwind CSS

## Getting Started

### 1) Install

```bash
pnpm install
```

### 2) Environment variables

Create `.env.local` at the project root with at least:

   ```env
# Database
DATABASE_URL="postgres://user:password@host:5432/dbname"

# Auth.js (NextAuth)
AUTH_SECRET="a-strong-random-secret"

# Admin page password (for creating accounts at /admin/criar-conta)
ADMIN_PASSWORD="change-me"

# Client defaults
NEXT_PUBLIC_DEFAULT_PROFIT_MARGIN="28"
```

All variables are validated via `src/env.js` using `@t3-oss/env-nextjs`.

### 3) Database

Run migrations to create the schema (Drizzle):

```bash
pnpm db:push
# Optional workflow
pnpm db:generate
pnpm db:migrate
```

Migrations are emitted to `supabase/migrations/` and configured via `drizzle.config.ts`.

### 4) Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## How the app is organized

High-level flow:

UI (pages/components in `src/app`) → Server Actions (in `src/actions` or page `actions.ts`) → Query layer (`src/server/queries`) → Database (`src/server/db/schema`) via Drizzle.

### Key directories

```text
src/
├─ app/                      Next.js App Router routes and UI
│  ├─ login/                 Login page and actions
│  ├─ admin/criar-conta/     Admin-only account creation (password protected)
│  ├─ caixa/                 Cash register pages
│  ├─ despesas-pessoais/     Personal expenses pages
│  ├─ despesas-loja/         Store expenses pages
│  ├─ compras-produtos/      Product purchase expenses pages
│  ├─ categorias/            Category management pages
│  ├─ _components/           Shared UI: forms, dialogs, lists, sheets
│  └─ api/                   Route handlers (e.g. category order update)
│
├─ actions/                  Server actions for forms (expense, income, cash)
├─ server/
│  ├─ db/                    Drizzle config and tables
│  │  ├─ schema/             Table definitions (expenses, incomes, users, etc.)
│  │  └─ index.ts            DB client and schema export
│  └─ queries/               Query/command functions used by actions
│
├─ components/ui/            shadcn/ui components
├─ lib/                      Utilities (PDF generation, helpers)
├─ hooks/                    Client hooks (viewport/keyboard helpers)
├─ utils/                    Generic utilities (auth, error translations)
└─ styles/                   Global CSS
```

### Authentication & route protection

- Config: `src/auth.ts` uses Auth.js (NextAuth) Credentials provider to authenticate against Drizzle `auth_users` table.
- Middleware: `src/middleware.ts` protects all non-public routes, redirecting unauthenticated users to `/login`.
- API: `src/app/api/auth/[...nextauth]/route.ts` exposes Auth.js handlers.
- Account creation: `/admin/criar-conta` validates `ADMIN_PASSWORD` and writes users into `auth_users`.
- Change password: `/alterar-senha` updates the hashed password for the authenticated user.

### Data model (Drizzle)

Important tables in `src/server/db/schema/`:

- `expense` with support for types: `one_time`, `installment`, `recurring`, `recurring_occurrence`; sources: `personal`, `store`, `product_purchase`; recurrence metadata, grouping, and category.
- `expense_category` with `sortOrder`, color, emoji; includes a `DEFAULT_CATEGORY` fallback in code.
- `incomes` storing value, `profitMargin`, and `dateTime`.
- `cash_register` storing daily values.
- Auth tables: `auth_users`, `auth_accounts`, `auth_sessions`, `auth_verification_tokens`.

DB entry point: `src/server/db/index.ts` creates the Drizzle client from `DATABASE_URL`.

### Query layer

Reusable server-side functions (called by server actions):

- Expenses: `src/server/queries/expense-queries.ts`
  - Filtering by period, expanding recurring series into occurrences,
    CRUD helpers, and sums.
- Incomes: `src/server/queries/income-queries.ts`
  - CRUD, list by date range, and profit calculations.
- Cash register: `src/server/queries/cash-register-queries.ts`
  - CRUD, list by date range, and sums.
- Categories: `src/server/queries/expense-category-queries.ts`
  - CRUD and ordering.
- Summary: `src/server/queries/summary-queries.ts`
  - Combined sums and profit.

### Server actions

Form submissions call server actions which validate inputs (Zod), call the query layer, and revalidate pages:

- Expenses: `src/actions/expense-actions.ts`
  - Add one-time, parcelled, recurring; update/delete; toggle `isPaid` with recurring occurrence handling.
- Incomes: `src/actions/income-actions.ts`
- Cash register: `src/actions/cash-register-actions.ts`
- Categories: `src/server/actions/category-actions.ts` (page-specific flow under categories)
- Page-specific actions also live alongside pages (e.g., `src/app/login/actions.ts`).

### UI and forms

- Core pages in `src/app/*/page.tsx`.
- Shared forms in `src/app/_components/forms/*` (e.g., `add-expense-form.tsx` with tabs for one-time/parcelled/recurring).
- Shared input components in `src/app/_components/inputs/*`:
  - `currency-input.tsx` - Currency input with formatting and validation
  - `discount-select.tsx` - Discount selector with percentage or fixed value modes
- Responsive drawers/sheets: `src/app/_components/responsive-sheet.tsx` and `mobile-drawer.tsx`.
- Lists and item components render entities and actions.

### API routes

- Category order update: `src/app/api/categorias/update-order/route.ts` (accepts a list of IDs; updates `sortOrder`).

### PDF generation

`src/lib/pdf/` contains self-contained builders for PDF exports:

- `cash-register-pdf.ts`, `expenses-pdf.ts`, `product-purchases-pdf.ts`, `summary-pdf.ts`.

## Adding or modifying features

Most features follow this pattern:

1) Data: add/modify a table in `src/server/db/schema/` and run migrations.
2) Queries: create functions in `src/server/queries/<feature>-queries.ts`.
3) Actions: expose server actions in `src/actions/<feature>-actions.ts` or a page `actions.ts`.
4) UI: build or update pages/components in `src/app/**` and wire up forms to actions.
5) Revalidation: ensure affected routes call `revalidatePath()` after writes.

Minimal examples:

```ts
// src/server/queries/my-entity-queries.ts
"use server";
import { db } from "@/server/db";
import { myEntity } from "@/server/db/schema/my-entity";
import { eq } from "drizzle-orm";

export async function createMyEntity(data: typeof myEntity.$inferInsert) {
  const [row] = await db.insert(myEntity).values(data).returning();
  return row;
}

export async function listMyEntities() {
  return db.select().from(myEntity);
}
```

```ts
// src/actions/my-entity-actions.ts
"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createMyEntity } from "@/server/queries/my-entity-queries";

const schema = z.object({ name: z.string().min(1) });

export async function actionCreateMyEntity(_: unknown, formData: FormData) {
  const parsed = schema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { success: false, message: "Corrija os erros" };
  await createMyEntity(parsed.data);
  revalidatePath("/");
  return { success: true, message: "Criado!" };
}
```

Hook up a form in a page/component and use a server action as the form `action`.

## Common tweaks

- Default profit margin: change `NEXT_PUBLIC_DEFAULT_PROFIT_MARGIN` in `.env.local`.
- Currency/locale formatting: see helpers in `src/lib/utils.ts`.
- Category ordering: POST to `/api/categorias/update-order` with `order: number[]`.

## Scripts

- `pnpm dev` – start app in dev mode
- `pnpm build` – production build
- `pnpm preview` – build then start
- `pnpm typecheck` – TypeScript
- `pnpm lint` / `pnpm lint:fix` – ESLint
- `pnpm db:push` / `db:generate` / `db:migrate` / `db:studio` – Drizzle

## Deployment

Works well on Vercel. Set the same environment variables there (`DATABASE_URL`, `AUTH_SECRET`, `ADMIN_PASSWORD`, `NEXT_PUBLIC_DEFAULT_PROFIT_MARGIN`). Ensure your database is accessible from the deployment environment.
