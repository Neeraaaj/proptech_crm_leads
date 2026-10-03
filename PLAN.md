# Lead CRM: Project Plan & Status

A mini CRM for real-estate lead management, built for the Full Stack Developer assignment.

**Stack:** Next.js 16 (App Router) · Express 5 · TypeScript · PostgreSQL · Drizzle ORM · TanStack Query · Tailwind v4
**Deployment:** Neon (database) · Render (API) · Vercel (frontend)

---

## Assignment requirements: status

| Requirement | Where it lives | Status |
| --- | --- | --- |
| Lead capture with all fields | `LeadForm.tsx`, `POST /api/leads` | ✅ |
| Form validation (client + server) | `leadFormSchema.ts`, `lead.schema.ts` | ✅ |
| Lead listing table | `app/leads/page.tsx`, `LeadTable.tsx` | ✅ |
| Search by name / phone | `listLeads` (`ILIKE`) | ✅ |
| Filter by source / status (multi-select) | `FilterPanel.tsx`, `listLeads` (`IN`) | ✅ |
| Sort by date / budget | Column headers + sort menu | ✅ |
| Lead detail view | `app/leads/[id]/page.tsx`, `GET /api/leads/:id` | ✅ |
| Notes / comments | Notes tab, `POST /api/leads/:id/notes` | ✅ |
| Status update (New → Contacted → Site Visit → Closed) | Status transitions, `PATCH /api/leads/:id/status` | ✅ |
| Dashboard: total, by source, conversion rate, status distribution | `app/page.tsx`, `GET /api/dashboard/stats` | ✅ |
| REST API with full CRUD | `server/src/modules/leads/*` | ✅ |
| Frontend ↔ backend integration | Next.js rewrite `/api/*` → Express | ✅ |
| Error handling | `errorHandler.ts`, `api/client.ts`, `ErrorState.tsx` | ✅ |
| Clean code structure | routes → validation → controller → service | ✅ |
| README with setup instructions | `README.md` | 🔲 Final pass (live links + screenshots) |

---

## What's built

### Backend (Express + Drizzle)
- Layered modules: **routes → `validate()` → controller → service → DB**
- Zod validation on body, params and query; enums shared with the DB schema
- One response envelope `{ data, meta }`, and one error format `{ error: { code, message, details } }`
- Postgres errors mapped to HTTP codes (FK violation → 404, unique → 409, bad input → 400)
- Phone numbers stored as 10 digits, so search works however the number was typed
- Dashboard numbers computed in SQL (`COUNT`, `GROUP BY`, `SUM`), with all queries run in parallel
- Environment variables validated at startup; graceful shutdown

### Frontend (Next.js + TanStack Query)
- **Leads page:** filter panel (search + multi-select checkboxes), sortable columns, row selection, pagination, "Create Lead" slide-in panel
- **Lead detail page:** record header (Call / Email / Delete), status transitions, inline edit for each field, notes tab
- **Dashboard:** headline pipeline value, status pills, top lead, conversion card, "needs attention" list, recent leads, leads by source
- Query invalidation keeps the list, detail page and dashboard in sync after every change
- Loading placeholders, empty states, error banners

### Infrastructure
- Local: Docker Compose Postgres on port **5434**, chosen to avoid clashing with a Postgres installed directly on Windows
- Migrations: `schema.ts` → `drizzle-kit generate` → `drizzle/*.sql` → `drizzle-kit migrate`
- Production: Neon (`lead_crm` database) · Render API: https://proptech-crm-leads.onrender.com

---

## Remaining before submission

- [ ] **Vercel deploy** with `API_ORIGIN=https://proptech-crm-leads.onrender.com`, root directory `client`
- [ ] Set `CORS_ORIGIN` on Render to the Vercel URL
- [ ] **README:** live demo link at the top, screenshots (dashboard, leads, detail), API table, Windows port note
- [ ] Code cleanup: remove leftover `TODO` / `🚧` / `STEP` comments
  ```bash
  grep -rn "TODO\|🚧\|STEP" server/src client/src
  ```
- [ ] Set the defaults to 5434 in `docker-compose.yml` and `server/.env.example`
- [ ] Remove the unused `recharts` dependency
- [ ] `npm run typecheck && npm run build` pass
- [ ] Fresh-clone test: follow the README from scratch in a new folder

---

## Next improvements (post-submission)

| Improvement | Why |
| --- | --- |
| "Add lead" on dashboard opens the create panel directly (`/leads?new=1`) | Saves a click |
| Filters synced to the URL (`useSearchParams`) | Filtered views can be shared and bookmarked |
| Toasts on save / delete | Clearer feedback |
| Bulk actions on selected rows (change status, delete) | Uses the existing row selection |
| Activity timeline: automatic note on status change, written in a DB transaction | Lead history for free |
| API tests (Vitest + Supertest; `app.ts` is already importable) | Regression safety |
| Duplicate-lead warning on matching phone number | A common CRM problem |
| `pg_trgm` GIN index for search | `ILIKE '%term%'` can't use a regular index at scale |
| Auth + lead owners | Multi-agent teams |
| Uptime ping on `/api/health` | Avoids Render free-tier cold starts |

---

## Design decisions

- **Express API separate from Next.js:** the brief asks for REST APIs, and keeping the backend independent means it can be deployed and tested on its own.
- **Drizzle over Prisma:** pure TypeScript, SQL-like queries, no engine binaries to download.
- **Validation in both places:** Zod on the client gives instant feedback, and Zod on the server is the guarantee. Server field errors are mapped back onto the form.
- **Counting done in the database:** the dashboard never loads every lead into Node.
- **Conversion rate** = Closed ÷ total leads. A future version could split Closed into *won* and *lost*.
