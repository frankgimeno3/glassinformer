# app/APP-ROUTER.md — Hub: pages, layouts, root app files

**When to open**: Changing a page, layout, or any root app file (layout.tsx, apiClient.js, globals.css, not-found, GlassInformerSpecificData). For API routes or server logic → [app/api/API-ROUTES.md](api/API-ROUTES.md) and [app/server/BACKEND.md](server/BACKEND.md).

---

## What this doc contains

- Ownership (what this hub owns and what it does not).
- Contract (public/protected, root layout, apiClient, portal).
- Where things are (root files, route groups, general_components, contents).
- If you change X → open Y (within app scope).
- Decisions (links to sections).
- How to test / validate.
- Gotchas.

---

## Where things are (paths)

| Where | Path | Content |
|-------|------|---------|
| **Root app files** | `app/layout.tsx`, `app/apiClient.js`, `app/globals.css`, `app/not-found.tsx`, `app/GlassInformerSpecificData.js`, `app/favicon.ico` | Layout, HTTP client, global styles, 404, portal data, favicon. |
| **(main)** | `app/(main)/` | Public pages: home, publications, directory, events, articles, mediakit, search, legal. Layout: TopBanner, AppNav, RightBanner, Footer. |
| **auth** | `app/auth/` | Login, signup, confirm, forgot (unauthenticated). After confirm → POST /api/v1/users to create profile. |
| **logged** | `app/logged/` | Protected area: dashboard, companies, profiles, settings. Requires session (proxy). |
| **general_components** | `app/general_components/` | Navs (AppNav, UnloggedNav), Footer, TopBanner, RightBanner, MidBanner, BasicButton. |
| **contents** | `app/contents/` | Static JSON (magazinesAvailable.json, usersData.json). No doc. |
| **api** | `app/api/` | API routes → see [app/api/API-ROUTES.md](api/API-ROUTES.md). |
| **server** | `app/server/` | Backend → see [app/server/BACKEND.md](server/BACKEND.md). |

---

## If you change X → open Y

| You are changing… | Open / do |
|-------------------|-----------|
| Root layout, fonts, globals.css, not-found, GlassInformerSpecificData, favicon | This doc (Root files) and the file in `app/`. |
| Page or layout of (main), auth or logged | This doc (Route groups) and the corresponding folder. |
| Shared navs, banners, buttons | general_components; nav links must match public paths in proxy.js. |
| New public or protected route | [AGENTS.md](../../AGENTS.md) / proxy.js; update list in proxy. |
| API route or service logic | [app/api/API-ROUTES.md](api/API-ROUTES.md), [app/server/BACKEND.md](server/BACKEND.md). |
| Client service that calls the API | [apiClient/API-CLIENT.md](../../apiClient/API-CLIENT.md). |

---

## Key contracts / invariants

- **Public vs protected routes**: Defined **only in proxy.js**. (main) and auth/* are public; logged/* protected. New public path → update proxy.js.
- **Root layout**: Every page is wrapped by `app/layout.tsx`; route groups add their own layout. No auth or nav in root layout.
- **Client API**: All browser calls use **app/apiClient.js** (same origin, withCredentials). See [apiClient/API-CLIENT.md](../../apiClient/API-CLIENT.md).
- **Portal**: Only **GlassInformerSpecificData.js** has name, description and portal_id. For another portal, change only this file.

---

## Decisions (links to sections)

| Decision | Section in this doc |
|----------|----------------------|
| What the hub owns and what it does not | [Ownership](#ownership-mental-model) |
| Route, layout and portal rules | [Key contracts](#key-contracts--invariants) |
| Spec for each root file | [Root files](#root-files-spec) |
| What each route group does | [Route groups](#route-groups) |
| Known gotchas | [Gotchas](#gotchas) |

---

## How to test / validate

- **Build**: `npm run build` — must complete (layout and routes load).
- **Public routes**: Without login, access `/`, `/auth/login`, `/publications`, `/articles`, etc. They must not redirect to login.
- **Protected route**: Without login, `/logged` must redirect; with login, it must load.
- **404**: Any unknown route must redirect to `/` (not-found.tsx).
- **Portal**: Change something in GlassInformerSpecificData and check that nav/layout/ArticleService reflect the change.

---

## Ownership (mental model)

| This hub owns | It does not own |
|---------------|-----------------|
| Route segments, layouts, root files (layout, apiClient.js, globals.css, not-found, favicon, GlassInformerSpecificData) | API handler implementation (see API-ROUTES, BACKEND) |
| Groups (main), auth, logged | Server features, createEndpoint, errorHandler |
| general_components (navs, banners, buttons) | apiClient service implementation (see API-CLIENT) |
| contents/ (static JSON) | Database or feature logic |

---

## Contract

- **Public vs protected**: Public paths only in root **proxy.js**. (main), auth/* public; logged/* protected. New public path → update proxy.js.
- **Root layout**: Every page wrapped by `app/layout.tsx`; route groups add their own layout. No auth or nav in root layout.
- **Client API**: All browser API calls use **app/apiClient.js** (same origin, withCredentials). See [apiClient/API-CLIENT.md](../../apiClient/API-CLIENT.md).
- **Portal config**: Only **GlassInformerSpecificData.js** holds portal name, description, portal_id. Change only this file for another portal.

---

## Root files (spec)

| File | Spec |
|------|------|
| **layout.tsx** | Geist fonts, `./globals.css`, metadata (title "Glassinformer"); single flex column wrapper. No auth/nav here. |
| **apiClient.js** | `axios.create({ baseURL: window.location.origin })`, `withCredentials: true`; response interceptor throws `{ status, message, data }`. Some error copy still in Spanish → move to English when touching. |
| **favicon.ico** | Binary asset; Next.js serves at `/favicon.ico`. Replace file to change icon. |
| **GlassInformerSpecificData.js** | Exports `PortalName`, `companyDescription`, `portal_id`. Used by navs, logged layout, ArticleService (fallback). |
| **globals.css** | `@import "tailwindcss";`; `:root` (--background, --foreground); `@theme inline` (fonts, --radius-xs); body; `.article-body` and children. |
| **not-found.tsx** | `NotFound()` calls `redirect("/")`. No custom 404 UI. |

---

## Route groups

| Group | Path | Purpose |
|-------|------|--------|
| **(main)** | `app/(main)/` | Public: home, publications, directory, events, articles, mediakit, search, legal. Layout: TopBanner, AppNav, RightBanner, Footer. |
| **auth** | `app/auth/` | Login, signup, confirm, forgot (unauthenticated). Uses apiClient/AuthenticationService; after confirm, create profile via POST /api/v1/users. |
| **logged** | `app/logged/` | Protected: dashboard, companies, profiles, settings. Requires valid session (proxy). |

### `app/(main)/` shell

| Path | Role |
|------|------|
| `_components/MainLayoutClient.tsx` | Client shell for the (main) group: full portal chrome **except** on `/publications/flipbook`, where it renders children only. |

### `app/(main)/publications/` layout

| Path | Role |
|------|------|
| `page.tsx`, `layout.tsx`, `loading.tsx` | `/publications` list (server + Suspense). `layout` wraps with `PublicationsLayoutClient`. |
| `publications_components/PublicationsLayoutClient.tsx` | Appends `MidBanner` except on `/publications/flipbook`. |
| `informer/page.tsx` | Re-exports the list for `/publications/informer` (same UI). |
| `informer/[id]/` | Informer reader for one publication. |
| `publications_components/list/` | List UI: cards, filter, modal, flipbook thumbnail, loading skeleton, `publicationListUtils`. |
| `publications_components/` (shared) | `InvalidPublicationUrl`, `PublicationViewer`. |
| `_lib/getPublicationForPage.ts` | Shared cached publication fetch (list, informer route, flipbook route). |
| `informer/informer_components/` | `InformerPhaseFlow`. |
| `informer/informer_lib/` | `mockInformerData` (informer UI; also imported by flipbook bridge). |
| `flipbook/` | Routes under `/publications/flipbook/...`. |
| `flipbook/flipbook_components/` | `FlipbookView`, `FlipbookNav`. |
| `flipbook/flipbook_lib/` | `flipbook-data`, spread cache, mocks, `loadFlipbookModel`, `informerToFlipbook`. |
| `flipbook/flipbook_types/` | Flipbook TypeScript types. |

---

## Gotchas

- **not-found**: Always redirects to `/`; no custom 404 page.
- **apiClient.js** and server **createEndpoint** / **errorHandler**: Some user- or server-facing strings still in Spanish; move to English when editing.
- **GlassInformerSpecificData**: Single source for portal branding; server ArticleService uses `portal_id` for fallback articles.
