# currency-converter

Astro 7 SSR app deployed to Cloudflare Workers. Fetches USD exchange rates from DuckDuckGo and caches them in Workers KV. UI copy is Spanish.

## Commands

Use `pnpm` (lockfile: `pnpm-lock.yaml`). Dependencies are pinned exactly; install or update with `pnpm add -E` / `pnpm add -D -E`.

- `pnpm dev` — Astro dev server running in `workerd` via the Cloudflare Vite plugin; KV bindings are emulated locally.
- `pnpm build` — builds to `dist/client` (assets) and `dist/server` (worker). This is the de facto verification step.
- `pnpm preview` — build, then `astro preview` against the built worker.
- `pnpm deploy` — build, then `wrangler deploy` (needs Cloudflare credentials).
- `pnpm cf-typegen` — regenerates `worker-configuration.d.ts` after changing `wrangler.jsonc`. The file is generated but tracked; do not hand-edit it.

There are no test, lint, format, or typecheck scripts, and `@astrojs/check` is not installed. Do not assume `pnpm test`, `pnpm lint`, or `astro check` work.

## Architecture

- `src/pages/index.astro` renders `Layout.astro` + `Table.astro`. All client logic lives in the `is:inline` script in `Table.astro`, so Vite/Astro do not process it as a module. Conversion UI, selects, and the quote board all derive from `currencyMetadata` in that script.
- `src/pages/api/currency/[id].ts` — `GET /api/currency/{CODE}?amount=1&force=true`. Calls `https://duckduckgo.com/js/spice/currency_convert/{amount}/USD/{CODE}`, reads `to[0].mid`, and caches the result in the `CURRENCIES` KV namespace with a 60s TTL. `force=true` skips the cache.
- KV bindings are imported directly with `import { env } from "cloudflare:workers"`. `wrangler.jsonc` holds the bindings; local state lives in `.wrangler/`, production uses the committed KV namespace ID.
- `output: "server"` and `session: false` in `astro.config.mjs`. `wrangler.jsonc` `main` points at `@astrojs/cloudflare/entrypoints/server`, not a built file. The adapter uses `imageService: "passthrough"` because the app uses no Astro image optimization.
- Fonts are self-hosted via `@fontsource-variable/archivo` and `@fontsource-variable/fraunces`, imported in `src/layouts/Layout.astro`. Do not add Google Fonts CDN links. Fraunces uses `full.css` because the heading sets its SOFT/WONK axes; the default export only ships the weight axis.

## Gotchas

- Adding a currency only requires an entry in `currencyMetadata` in `Table.astro`; the selects, board, and conversion derive from it. The API accepts any code.
- Client fetch URLs are relative (`api/currency/...`, no leading slash), so they only resolve from `/`. Use `/api/...` if you add nested pages.
- `pnpm-workspace.yaml` only allows the `esbuild` and `workerd` install scripts. Keep it, or clean installs will skip required postinstall builds.
- Tailwind is v4 via `@tailwindcss/vite` plus `@import "tailwindcss"` in `src/styles/global.css`; there is no `tailwind.config.js` and none is needed.
- `dist/` and `.astro/` are gitignored build output. `worker-configuration.d.ts` is generated but tracked.
