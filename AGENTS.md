# AGENTS.md — Constitution and index

**Entry point for the agent.** Read this first. User prompt overrides existing docs when adding/removing features: implement in code first, then update docs.

---

## What this doc contains

- Agent workflow (steps 1–5).
- Global constraints (language, doc updates).
- Documentation index (MAP + hubs) and when to open each.
- Quick reference for root config files.
- How to validate that the project follows the rules.

---

## Where things are (paths)

| Doc / area | Path | Content |
|------------|------|---------|
| **MAP** | [docs/MAP.md](docs/MAP.md) | Architecture by domain, "if you touch X → open Y", global decisions. |
| **App Router** | [app/APP-ROUTER.md](app/APP-ROUTER.md) | Pages, layouts, route groups, root app files. |
| **Backend** | [app/server/BACKEND.md](app/server/BACKEND.md) | createEndpoint, errorHandler, DB, features. |
| **API routes** | [app/api/API-ROUTES.md](app/api/API-ROUTES.md) | validate-token, v1 (route → method, service table). |
| **API client** | [apiClient/API-CLIENT.md](apiClient/API-CLIENT.md) | Client services that call the app API. |

---

## If you change X → open Y

| You are changing… | Open first | Then (if needed) |
|-------------------|------------|-------------------|
| Page, layout or route under app | [app/APP-ROUTER.md](app/APP-ROUTER.md) | Code in that folder |
| API route (endpoint, method, handler) | [app/api/API-ROUTES.md](app/api/API-ROUTES.md) | [app/server/BACKEND.md](app/server/BACKEND.md) for the service |
| Server feature (model, service, error) | [app/server/BACKEND.md](app/server/BACKEND.md) | Folder under `app/server/features/` |
| Client API call | [apiClient/API-CLIENT.md](apiClient/API-CLIENT.md) | API route and server feature |
| Auth (who can access, cookies, tokens) | This doc (proxy, env) + [BACKEND](app/server/BACKEND.md) (createEndpoint) | proxy.js, createEndpoint.js |
| Database (model, association) | [app/server/BACKEND.md](app/server/BACKEND.md) | database/models.js, associations.js |
| Root config (next, ts, env, middleware) | This doc (Root config below) | Corresponding root file |

---

## Key contracts / global invariants

- **Language**: All documentation and user-facing copy in **English**. Code identifiers in English.
- **Docs**: When you change behaviour, add/remove features or relationships, **update the relevant .md** (and MAP if routing changes).
- **Change order**: If the user prompt adds/removes a component or feature → **implement first**, then update this file and the hub/MAP so there are no contradictions.

---

## Decisions (links to sections)

| Decision | Where it lives |
|----------|----------------|
| Public vs protected routes | [docs/MAP.md § Key contracts](docs/MAP.md#key-contracts--global-invariants), [app/APP-ROUTER.md § Contract](app/APP-ROUTER.md#contract) |
| createEndpoint for all v1 API | [docs/MAP.md § Key contracts](docs/MAP.md#key-contracts--global-invariants), [app/server/BACKEND.md § Contract](app/server/BACKEND.md#contract) |
| Single axios for client | [app/APP-ROUTER.md § Root files](app/APP-ROUTER.md#root-files-spec), [apiClient/API-CLIENT.md § Contract](apiClient/API-CLIENT.md#contract) |
| Portal: single file | [docs/MAP.md § Key contracts](docs/MAP.md#key-contracts--global-invariants), [app/APP-ROUTER.md § Contract](app/APP-ROUTER.md#contract) |

---

## How to test / validate

- **Lint**: `npm run lint` — must pass with no errors.
- **Build**: `npm run build` — builds and connects DB at build time if env is present.
- **App**: `npm run dev` — starts the app; check public routes (/, /auth/login, /publications…), login, and a protected route (e.g. /logged).
- **Consistency**: After changing code that affects contracts (proxy, createEndpoint, new route, new feature), update the relevant hub and MAP if applicable. There is no automated test suite; validate the touched flow manually.

---

## Workflow

| Step | Action |
|------|--------|
| 1 | Read **AGENTS.md** (this file) for workflow and index. |
| 2 | Open **docs/MAP.md** for "if you touch X → open Y" and global decisions. |
| 3 | Open the **hub** for the area you are changing (APP-ROUTER, BACKEND, API-ROUTES, API-CLIENT). |
| 4 | After changing behaviour or structure, **update the relevant .md** (and MAP if routing changes). |
| 5 | If the **user prompt** adds/removes a component or feature: **implement first**, then update this file and the hub/MAP. |

---

## Root config (quick reference)

| File | Purpose |
|------|---------|
| **env.js** | Cognito (COGNITO); used by proxy, createEndpoint, server auth. |
| **proxy.js** | Auth middleware: public vs protected paths; token validation and refresh; must be invoked from root middleware. |
| **instrumentation.js** | Next.js instrumentation; loads instrumentation-node.js when runtime is Node. |
| **instrumentation-node.js** | DB connection and sync; model registration. |
| **next.config.ts** | Standalone, sequelize external, images, security. |
| **package.json** | Scripts, dependencies. |
| **tsconfig.json** | Paths, strictness. |
| **eslint.config.mjs** | Lint config. |
| **postcss.config.mjs** | Tailwind. |

Behaviour details (public paths in proxy, createEndpoint contract) are in **docs/MAP.md** and **app/server/BACKEND.md**.

---

## When to update this file

- You add or remove a **hub** or change its path: update the index and the "If you change X → open Y" table.
- You change **workflow** or **global constraints**.
- You add a **root config file** the agent must know about: add one line to Root config.
