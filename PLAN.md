# Build Plan — Lead CRM

**Mental model:** the scaffold is a house with plumbing and wiring already run through every room. The **create + list** room is finished. The other rooms have pipes that end in a capped valve: the endpoint exists and returns `501 NOT_IMPLEMENTED`, and the UI hook is already connected. Each step uncaps one valve. When you implement the service function, the UI behind it starts working.

Search the repo for `TODO(step N)` to find each spot.

---

## Step 0 — Run it (15 min)

Follow the README setup. Then check:

- [ ] http://localhost:3000/leads shows 15 seeded leads, and sorting by budget/date works
- [ ] "+ Add lead" with an empty form shows inline errors, and a valid submit adds a row
- [ ] Clicking a row shows the amber "🚧 Not implemented yet" banner. This is expected.

Before writing any code, read one request end to end: `LeadForm` → `useCreateLead` → `api/leads.ts` → **Next rewrite** (`next.config.ts`) → `lead.routes.ts` → `validate()` → `lead.controller.ts` → `lead.service.ts` → DB. Every later step follows the same path.

## Step 1 — Search + filter (30 min) · `server/.../lead.service.ts → listLeads`

The client already sends `search`, `source`, and `status`, and the server ignores them. Build the `conditions[]` array.

- Search: `or(ilike(name), ilike(phone))`. Think about why the phone was normalized on insert.
- ✅ Done when typing "pri" narrows the table and ticking Status / Lead Source checkboxes in the filter panel filters it (multi-select arrives as an array → use `inArray`).
- 🤔 Interview angle: why `ilike` with `%term%` can't use a B-tree index, and what you'd use at scale (`pg_trgm` GIN index).

## Step 2 — Lead detail (30 min) · `getLeadById`

- Use `db.query.leads.findFirst({ with: { notes } })`. The relations are already defined in `schema.ts`.
- Throw `ApiError.notFound` when nothing comes back.
- ✅ Done when clicking a row shows the full info card, and a random UUID in the URL gives a 404 message.

## Step 3 — Status update + notes (1–1.5 h) · server + detail page

Server: `updateLeadStatus` and `addNote` (FK violations already map to 404).

Client (`app/leads/[id]/page.tsx`): build `<StatusSelect>` and `<NotesPanel>`. The hooks `useUpdateStatus` and `useAddNote` already exist.

- ✅ Done when changing status updates the badge here *and* in the list (thanks to query invalidation), and a note appears at the top of the list.
- ⭐ Stretch: an optimistic status update (`onMutate`, rollback in `onError`).
- 🤔 Decision: should a status change also auto-write a note ("Status: New → Contacted")? That makes an activity timeline cheaply, and reviewers notice that kind of thing.

## Step 4 — Complete CRUD (30 min) · `updateLead`, `deleteLead`

The brief lists "CRUD operations" as a requirement. An edit form can reuse `LeadForm` with `defaultValues`. Add a delete button with a confirm step.

## Step 5 — Dashboard (1–1.5 h) · `dashboard.routes.ts` + `app/page.tsx`

- Server: 3 queries in `Promise.all` (`count()`, `groupBy(source)`, `groupBy(status)`). Postgres does the aggregation.
- Fill missing groups with 0 so the charts always show every source and status.
- Client: 4 stat cards + a bar chart (by source) + a donut or bars (by status) with Recharts.
- ✅ Done when adding a lead or closing one updates the dashboard. `useCreateLead` already invalidates `stats`.

## Step 6 — Polish for submission (1–2 h)

- [ ] Loading skeletons and empty states on every page
- [ ] Sync filters to the URL (`useSearchParams`) so a filtered view can be shared or bookmarked
- [ ] Toasts on success and failure
- [ ] README: add screenshots and a "what I'd do next" section
- [ ] Remove all `🚧` / `TODO` markers. `grep -rn "TODO\|🚧" server/src client/src` should return nothing.

## Step 6.5 — Next.js-specific upgrades (optional, good interview material)

- **Server Component for the detail page.** Fetch the lead on the server (``fetch(`${process.env.API_ORIGIN}/api/leads/${id}`)``) and pass it as `initialData` to `useLead`, so the first paint already has data. In Next 16, `params` is a Promise in server pages: `const { id } = await params`.
- **`loading.tsx` / `error.tsx`** per route segment for built-in skeletons and error boundaries.
- **`generateMetadata`** so the browser tab shows the lead's name.
- 🤔 Interview angle: why the list page stays client-rendered (filters change on every keystroke) while the detail page benefits from server rendering.

## Step 7 — Bonus (pick 1–2; reviewers notice these)

| Bonus | Why it stands out |
| --- | --- |
| API tests with Vitest + Supertest (`app.ts` is already importable) | Proves "proper API structure" |
| Duplicate-lead warning on phone match | Real CRM pain point |
| Deploy: Neon/Supabase (DB) + Render/Railway (Express) + Vercel (Next, set `API_ORIGIN`) | A live link is better than "clone and run" |
| CSV export of the filtered list | Easy to build, very useful |
| Dockerfile for the API + `docker compose up` runs everything | Setup in one command |

---

## Time budget

| Day | Steps |
| --- | --- |
| Day 1 | 0 → 3 (core features working) |
| Day 2 | 4 → 6 (CRUD, dashboard, polish, README) |
| Day 3 (optional) | 1 bonus + deploy |

## Brief → where it lives

| Requirement | Location | Status |
| --- | --- | --- |
| Lead capture + form validation | `LeadForm.tsx`, `lead.schema.ts` | ✅ |
| Listing table | `app/leads/page.tsx`, `LeadTable.tsx` | ✅ |
| Sort by date/budget | `listLeads` | ✅ |
| Search / filter | `listLeads` | Step 1 |
| Detail view | `getLeadById`, `app/leads/[id]/page.tsx` | Step 2 |
| Notes + status update | service + detail page | Step 3 |
| CRUD | `updateLead`, `deleteLead` | Step 4 |
| Dashboard metrics | `dashboard.routes.ts`, `app/page.tsx` | Step 5 |
| Error handling | `errorHandler.ts`, `api/client.ts`, `ErrorState.tsx` | ✅ |
| README | `README.md` | ✅ (add screenshots at the end) |
