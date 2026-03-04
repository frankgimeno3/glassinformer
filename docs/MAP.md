# docs/MAP.md — Project map

**Single entry for "where do I look?".** Read it after AGENTS.md when you need domain layout and routing. Optimised for 1–2 jumps to the right doc or code.

---

## What this doc contains

- Architecture by domain (table: domain, location, what it owns).
- "If you touch X → open Y" table.
- Routes to folders (folder → hub doc → content).
- Global decisions (prescriptive).
- How to validate that the map is up to date.
- **Bar for local docs**: what a local doc must have to deserve to exist.

---

## Where things are (paths)

| Domain | Location | Owns |
|--------|----------|------|
| **App Router** (pages, layouts, root files) | `app/` | Routes, groups (main), auth, logged, root layout, apiClient.js, globals.css, not-found, GlassInformerSpecificData. Does *not* own server logic or API handler implementation. |
| **Backend** (DB, features, API plumbing) | `app/server/` | createEndpoint, errorHandler, DB singleton, models, associations, per-domain features. |
| **API routes** (HTTP handlers) | `app/api/` | validate-token, v1/*. All v1 use createEndpoint except validate-token. |
| **Client API** (browser → app API) | `apiClient/` | Services that call the app API via `app/apiClient.js`; Auth is Cognito direct (AuthenticationService). |
| **Auth and protection** | Root `proxy.js`, `env.js` | Public vs protected paths; Cognito cookie validation and refresh; token cache. |

---

## If you change X → open Y

| You are changing… | Open first | Then (if needed) |
|-------------------|------------|-------------------|
| **Page**, **layout** or **route** under app | [app/APP-ROUTER.md](../app/APP-ROUTER.md) | Code in that route folder |
| **API route** (new endpoint, method, handler) | [app/api/API-ROUTES.md](../app/api/API-ROUTES.md) | createEndpoint usage, then [app/server/BACKEND.md](../app/server/BACKEND.md) for the service |
| **Server feature** (model, service, error type) | [app/server/BACKEND.md](../app/server/BACKEND.md) | Folder under `app/server/features/` |
| **Client API call** (method or service) | [apiClient/API-CLIENT.md](../apiClient/API-CLIENT.md) | API route and server feature |
| **Auth** (who can access, cookies, tokens) | [AGENTS.md](../AGENTS.md) (proxy, env) + [app/server/BACKEND.md](../app/server/BACKEND.md) (createEndpoint, authentication) | proxy.js, createEndpoint.js |
| **Database** (model, association, migration) | [app/server/BACKEND.md](../app/server/BACKEND.md) | database/models.js, associations.js |
| **Root config** (next, ts, env, middleware) | [AGENTS.md](../AGENTS.md) (Root config) | Corresponding root file |

---

## Routes to folders

| Folder | Hub doc | Content |
|--------|---------|---------|
| `app/` | [app/APP-ROUTER.md](../app/APP-ROUTER.md) | Root layout, apiClient.js, globals.css, not-found, GlassInformerSpecificData; groups: (main), auth, logged; general_components; contents (static). |
| `app/server/` | [app/server/BACKEND.md](../app/server/BACKEND.md) | createEndpoint, errorHandler, database, features (one table). |
| `app/api/` | [app/api/API-ROUTES.md](../app/api/API-ROUTES.md) | validate-token, v1 resource table (route → method, service, schema). |
| `apiClient/` | [apiClient/API-CLIENT.md](../apiClient/API-CLIENT.md) | Client services; shared axios from app/apiClient.js. |

---

## Key contracts / global invariants

- **Language**: All docs and user-facing strings in **English**. Identifiers in English. When touching code that is still in Spanish (createEndpoint, errorHandler, apiClient, login), move it to English.
- **Protected API**: Use **createEndpoint(callback, schema, isProtected, roles)** for all v1 routes that need validation and/or auth. Standalone only for validate-token.
- **Errors**: Throw domain errors (e.g. TimeLogNotFound); **errorHandler.js** maps them to HTTP. Add new error types in errorHandler when adding domains.
- **Public paths**: Defined **only in proxy.js**. New public path → update matcher and list in proxy; do not duplicate the list elsewhere.
- **Portal data**: **app/GlassInformerSpecificData.js** is the only file to change for another portal (name, description, portal_id).
- **404**: **app/not-found.tsx** redirects to `/`; no custom 404 UI.
- **DB**: Single Sequelize instance; models in **database/models.js**; associations in **database/associations.js**. New feature → model init + association (if any) + service; register in BACKEND table.

---

## Decisions (links to sections)

| Decision | Section in this doc |
|----------|----------------------|
| Where each domain lives | [Where things are](#where-things-are-paths) |
| "X → Y" routing | [If you change X → open Y](#if-you-change-x--open-y) |
| Prescriptive rules (createEndpoint, proxy, DB, portal, 404) | [Key contracts](#key-contracts--global-invariants) |

---

## How to test / validate

- **Build**: `npm run build` — if it fails due to DB or env, check instrumentation-node and MAP (DB decision).
- **Public paths**: You added a public path → verify it is in `proxy.js` and the app allows access without a cookie.
- **New API route**: Must use createEndpoint (except validate-token) and be in the table in [app/api/API-ROUTES.md](../app/api/API-ROUTES.md).
- **New feature**: Model in models.js, association if applicable, branch in errorHandler if there is a domain error; row in BACKEND table.

---

## Bar for local docs (with teeth)

A **local doc** (e.g. in a feature or route folder) **should only exist** if it can fill at least most of the following. If it only "describes" and does not "prescribe", it is not worth it; do not create it or merge it into the hub.

| Section | Required |
|---------|----------|
| **Purpose and ownership** | What this module does and what it does not. |
| **Contract** | Inputs/outputs, side effects, limits. |
| **Flow** | States and transitions (if applicable). |
| **Invariants** | Things that must not break. |
| **Danger points / gotchas** | Traps, edge cases, recurring bugs. |
| **How to change it without breaking** | Extension guide, migrations, extension points. |
| **Relevant tests and how to run them** | If there are no tests, state how to validate the area manually. |

If a local doc cannot fill this, **it does not deserve to exist**; the information should live in the hub or in the code.

---

## When to update this file

- You add or remove a **domain** or **top-level folder** that the agent must route to.
- You change a **global decision** (createEndpoint contract, public path policy, etc.).
- You rename or add a **hub**; keep links and tables correct.
