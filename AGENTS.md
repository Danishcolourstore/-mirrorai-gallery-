# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

MirrorAI is a premium photo gallery and delivery platform for professional photographers, built as a React SPA with Supabase as the backend (BaaS). The repository uses npm workspaces with a `client/` workspace for the Vite + React frontend. There is no `server/` workspace implemented yet.

### Dev server

- `npm run dev` from the repo root runs the client dev server on `http://localhost:8080`.
- Alternatively, `cd client && npx vite` does the same thing.
- The dev server binds to `0.0.0.0:8080` (configured in `client/vite.config.ts`).

### Lint / Type-check / Build

- **TypeScript check:** `cd client && npx tsc --noEmit`
- **Build:** `cd client && npx vite build`
- There is no ESLint config; the lint check is TypeScript only (`npm run lint -w client`).

### Key caveats

- **Supabase credentials:** The app requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables for real backend connectivity. Without them, the Supabase client uses placeholder values and all data-fetching calls will fail silently. The landing page renders fully without Supabase; authenticated routes (`/dashboard`, `/events`, `/event/:id`) redirect to `/` when no session exists.
- **No login route:** The `LandingNavbar` "Login" button navigates to `/login`, which is not a defined route — it hits the 404 catch-all. Authentication flows would need Supabase Auth integration.
- **Import alias:** `@/` maps to `client/src/` via both Vite (`resolve.alias`) and TypeScript (`paths`). All shadcn/ui components live under `client/src/components/ui/`.
- **Tailwind warning:** Build produces a harmless warning about `duration-[1200ms]` ambiguity in GiftBoxAnimation — can be ignored.
- **Public assets:** Fonts are in `client/public/fonts/`, icons/images in `client/public/`.
- **StorybookEditor:** The carousel builder at `/event/:id/storybook` works without Supabase using sample Unsplash photos. With a real Supabase connection, it fetches photos from the `photos` table for the given event. Export uses `html-to-image` to rasterize slides at 1080×1080 to PNG, zipped via `jszip`.
