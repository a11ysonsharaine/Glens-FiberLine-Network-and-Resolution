Supabase setup & project run instructions
======================================

This project is configured to use Supabase (hosted Postgres). The repository includes SQL migrations in `supabase/migrations/` and a Supabase-backed storage adapter in `src/lib/storage.supabase.ts`.

Quick checklist
- Ensure `.env` at project root contains:

```
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
VITE_USE_SUPABASE=true
```

Apply database migrations (two ways)
- Option A — Supabase SQL editor (recommended for quick testing):
  1. Open your Supabase project → SQL Editor.
  2. Run the migrations in order:
     - `supabase/migrations/001_init.sql` (creates tables and `add_sale` RPC)
     - `supabase/migrations/002_seed.sql` (optional: seeds sample data)
     - `supabase/migrations/003_policies.sql` (RLS policies; note: RPC now requires authenticated users)
     - `supabase/migrations/004_views.sql` (dashboard view)

- Option B — Supabase CLI (recommended for repeatable deployments):
  1. Install Supabase CLI: https://supabase.com/docs/guides/cli
  2. Authenticate and link project:
     ```powershell
     supabase login
     supabase link --project-ref <your-project-ref>
     ```
  3. Push migrations (place `supabase/migrations` in a migrations folder recognized by the CLI) or use `supabase db push` according to CLI docs.

Notes on security
- The `add_sale` RPC is marked `SECURITY DEFINER` and execution is granted to the `authenticated` role in `003_policies.sql`. That means:
  - Clients must be authenticated (signed in) to call the RPC.
  - The RPC runs with the function owner's privileges and performs the stock decrement + insert atomically.
- Keep your Supabase `service_role` key secret. Only the anon publishable key (`VITE_SUPABASE_PUBLISHABLE_KEY`) should be used in client-side code.

Run the frontend (dev)
1. Install deps and start Vite in the project root:
```powershell
npm install
npm start
# or
npm run dev
```
2. Open `http://localhost:5173`.

Testing flow to verify Supabase integration
1. Sign in (if you set up Auth) or use the anon key if you left public policies for read access.
2. Open Products page — seeded products should appear if you ran the seed SQL.
3. Record a sale — the frontend calls the `add_sale` RPC. If successful, the product quantity will decrement and the sale will be visible in Sales.
4. Query the dashboard: client can select from the `dashboard_stats` view.

If something fails
- Check Supabase logs → Database → Logs for SQL / function errors.
- Verify the anon publishable key and `VITE_SUPABASE_URL` are correct in `.env` and that you restarted Vite after editing `.env`.

Next improvements you may want
- Limit `SELECT` on `sales` to administrators instead of authenticated users.
- Add server-side API (Django/FastAPI) if you need more complex business logic or private operations.
- Add CI scripts to push migrations automatically using Supabase CLI.

If you want, I can:
- Run a TypeScript/ESLint check on the repo (static).  
- Scaffold a small Django or FastAPI server that talks to Supabase (useful if you want Python-based logic).  
- Add a migration runner script for local usage.
