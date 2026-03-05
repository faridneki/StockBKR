<!-- Copilot / AI agent instructions for contributors -->
# Project snapshot — quick context

- Framework: Next.js (App Router) using the `app/` directory. Most pages and UI live under `app/` and components under `app/components/`.
- Database: Prisma + SQLite. Schema: `prisma/schema.prisma`. Client wrapper: `lib/prisma.ts` (singleton pattern).
- Auth: `@clerk/nextjs` is installed (look for auth wrappers in pages/components).
- File uploads: saved to `public/uploads` via `app/api/upload/route.ts`.

# Where to make common changes

- Server-side business logic / DB access: `app/actions.ts` — contains most create/read/update/delete flows (e.g. `createProduct`, `replenishStockWithTransaction`). Edit here for core domain logic.
- API for file uploads: `app/api/upload/route.ts` — writes to `public/uploads` and returns a public path.
- Prisma schema and migrations: `prisma/schema.prisma` and `prisma/migrations/*`. After schema changes run Prisma migrate/generate.
- Prisma client usage: `lib/prisma.ts` ensures a single `PrismaClient` in dev and production.

# Key patterns and conventions

- App Router / Server Actions: server code uses `"use server"` and exports functions from `app/actions.ts`. Components import these functions directly; prefer updating these server actions for DB-related changes.
- Error handling: functions generally catch and `console.error` errors and often return `undefined` or empty arrays. Be careful: calling code may not receive propagated errors — decide whether to throw or return explicit error objects when changing behavior.
- File storage: images are served from `public/uploads`. Uploaded filenames are randomized in the upload route; to change that behavior edit `app/api/upload/route.ts`.
- Associations: multi-tenant-ish model keyed by an association `email` — many queries first call `getAssociation(email)` and then scope operations by `associationId`. Keep that pattern to avoid cross-association leaks.

# Build / run / common commands

- Start dev (with Turbopack):

```
npm run dev
```

- Build / start:

```
npm run build
npm run start
```

- Prisma (if you change `prisma/schema.prisma`):

```
npx prisma generate
npx prisma migrate dev --name descriptive_name
```

# Quick examples (where to change behavior)

- To change how products are created/validated: edit `app/actions.ts` -> `createProduct`.
- To change upload handling or allowed extensions: edit `app/api/upload/route.ts`.
- To add a new page or route: add a folder/file under `app/` (App Router conventions apply). For client-only UI add `"use client"` at the top of the component file.

# Integration points and external deps

- Prisma: `prisma/schema.prisma` (SQLite via `env("DATABASE_URL")`). Ensure env var is set in local env or `.env`.
- Clerk: authentication flows rely on `@clerk/nextjs`. Look for Clerk wrappers in layout or sign-in components under `app/sign-in` and `app/sign-up`.
- Frontend libs: Tailwind (`globals.css`), `recharts` for charts, `react-toastify` for notifications.

# Short editing guidance for AI agents

- Prefer changing server actions in `app/actions.ts` rather than sprinkling DB logic across components.
- Keep association scoping (`associationId`) consistent: queries commonly filter by association id retrieved from an email.
- When editing DB models, update `prisma/schema.prisma` then run `prisma generate` and the migrate command above.
- Respect App Router rules: server components by default; add `use client` only when you need browser APIs or state.

# If something's unclear

- Ask for examples of a flow to change (e.g., product import, a specific API contract) and I will provide a focused patch.
