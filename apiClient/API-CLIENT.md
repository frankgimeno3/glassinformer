# apiClient/API-CLIENT.md — Hub: client-side services calling app API

**When to open**: Adding, changing or removing a front-end API call or service. For API route implementation → [app/api/API-ROUTES.md](../app/api/API-ROUTES.md). For server features → [app/server/BACKEND.md](../app/server/BACKEND.md).

---

## What this doc contains

- Contract (single axios, direct Auth, static methods).
- Ownership and gotchas.
- Where things are (shared dependency apiClient.js + service list).
- If you change X → open Y.
- Key contracts / invariants.
- Decisions (links to sections).
- How to test / validate.
- Per-service spec (Skill + Spec + Related).

---

## Where things are (paths)

| Where | Path | Content |
|-------|------|---------|
| **HTTP client** | `app/apiClient.js` (outside this folder) | Single axios instance; same origin, withCredentials; error interceptor. See [Shared dependency](#shared-dependency-appapiclientjs). |
| **Services** | `apiClient/*Service.js` | ArticleService, AuthenticationService, CommentService, CompanyService, ContentService, EventService, ModificationService, ProductService, ProfileUserService, PublicationService, TimeLogService, UserSerivce. Each: static methods → routes in app/api/v1/... |

---

## If you change X → open Y

| You are changing… | Open / do |
|-------------------|-----------|
| Add or remove a service, or a method that calls a route | This doc: [Services](#services-skill--spec-per-file) and "When to update". Implement in *Service.js. If the API route is new, [app/api/API-ROUTES.md](../app/api/API-ROUTES.md). |
| Change the route or HTTP method a service uses | This doc (service spec), *Service.js, and if the API changed [app/api/API-ROUTES.md](../app/api/API-ROUTES.md). |
| Axios instance (baseURL, credentials, errors) | [app/APP-ROUTER.md](../app/APP-ROUTER.md) (root files: apiClient.js). |
| API route handler or server service | [app/api/API-ROUTES.md](../app/api/API-ROUTES.md), [app/server/BACKEND.md](../app/server/BACKEND.md). |

---

## Key contracts / invariants

- **Single axios**: All services except AuthenticationService use `apiClient` from `app/apiClient.js` (same origin, withCredentials). Errors → throw `{ status, message, data }`.
- **AuthenticationService**: Does not use apiClient; calls Cognito (Amplify) directly. Tokens in cookies; proxy validates on the server.
- **Methods**: Static; return API response payload or throw. No direct env usage except AuthenticationService (NEXT_PUBLIC_USER_POOL_*).

---

## Decisions (links to sections)

| Decision | Section in this doc |
|----------|----------------------|
| Client and Auth rules | [Key contracts](#key-contracts--invariants), [Contract](#contract) |
| What this module owns | [Ownership](#ownership) |
| Per-service spec (inputs/outputs, route) | [Services (skill + spec per file)](#services-skill--spec-per-file) |
| Gotchas | [Gotchas](#gotchas) |

---

## How to test / validate

- **Call from UI**: Run the flow that uses the service (e.g. article list, login, create company). Check that the request hits the expected route (network tab) and that errors (4xx/5xx) are turned into a throw with `status`, `message`.
- **New service or method**: Add spec here, implement, call from a page or component and validate response and errors. There is no automated test suite; validate the touched area manually.
- **Auth**: Login → cookies set; navigate to /logged → no redirect. Logout → access to /logged redirects.

---

## Contract

- **Single axios instance**: All services (except AuthenticationService) use `apiClient` from `app/apiClient.js` (same origin, `withCredentials: true`). Errors thrown as `{ status, message, data }`.
- **AuthenticationService**: Does **not** use apiClient; calls Cognito (Amplify) directly. Cookie storage for tokens; proxy validates cookies server-side.
- **Methods**: Static; return API response payload or throw. No direct env usage except AuthenticationService (NEXT_PUBLIC_USER_POOL_*).

## Ownership

This module owns: client-side API service methods and their mapping to app API routes. It does not own: app/apiClient.js (see app/APP-ROUTER.md), API route handlers, or server features.

## Gotchas

- **UserSerivce**: Filename typo (same on server). ProfileUserService.js = create RDS user after signup; UserSerivce.js = admin CRUD.
- **CompanyService / ProductService**: List methods normalize response to array via internal `toArray()`.
- **EventService**: Parameter `idFair` is historical; it is the event id.
- **Spanish strings**: AuthenticationService (and others) may still have user-facing Spanish; move to English when touching.

---

## Shared dependency: app/apiClient.js

Not in this folder but used by every service here.

| | Description |
|--|-------------|
| **Skill** | Single axios instance for the app: same origin, `withCredentials: true`, and a response interceptor that normalizes errors (status, message, data). *Definition of done*: All browser-originated API calls go through this client; errors are thrown as objects with `status`, `message`, and optional `data`. |
| **Spec** | `axios.create({ baseURL: window.location.origin })`, request interceptor sets `withCredentials: true`, response interceptor maps HTTP errors to a thrown object. Used by every service in `apiClient/`. |

**Related**: All `apiClient/*Service.js` files import it. Root **env.js** is not used here; Cognito is used via **apiClient/AuthenticationService.js** (Amplify) and server-side **proxy.js** / **app/server** for cookies and tokens.

---

## Services (skill + spec per file)

---

### ArticleService.js

| | Description |
|--|-------------|
| **Skill** | CRUD for **articles**: list all, get by id, create, update, delete. Used by article list/detail pages and any UI that manages articles. *Definition of done*: All article API calls from the client go through this service; response shape is whatever the API returns. |
| **Spec** | Class with static methods: `getAllArticles()` → GET `/api/v1/articles`, `getArticleById(idArticle)` → GET `/api/v1/articles/:id`, `createArticle(articleData)` → POST, `updateArticle(idArticle, articleData)` → PUT, `deleteArticle(idArticle)` → DELETE. Uses `apiClient` from `../app/apiClient.js`. |

**Related**: `app/api/v1/articles/route.js`, `app/api/v1/articles/[id]/route.js`, `app/server/features/article/ArticleService.js` (server).

---

### AuthenticationService.js

| | Description |
|--|-------------|
| **Skill** | **Cognito auth from the browser**: login, logout, sign up, confirm sign up, reset password, confirm reset password. Configures Amplify once with `NEXT_PUBLIC_USER_POOL_ID` and `NEXT_PUBLIC_USER_POOL_CLIENT_ID`; uses cookie storage for tokens. Optional new-password challenge on first login. *Definition of done*: Users can sign in/out and complete registration and password reset from the client; session is stored in cookies for the middleware to validate. |
| **Spec** | Default export class. Uses `aws-amplify` (Auth, Cognito, CookieStorage, decodeJWT, fetchAuthSession). `configureAmplify()` runs once; methods: `login(username, password)`, `isAuthenticated()`, `logout()`, `signUp(email, password)`, `confirmSignUp(email, confirmationCode)`, `resetPassword(username)`, `confirmResetPassword(username, confirmationCode, newPassword)`. Reads `process.env.NEXT_PUBLIC_USER_POOL_*`; no use of `apiClient` (Cognito is called directly). Some user-facing strings are still in Spanish; when touching this file, move them to English per project constraints. |

**Related**: `env.js` (conceptually; this file uses raw env), `proxy.js` (validates cookies set after login), `app/server/features/authentication/AuthenticationService.js` (server: token verification, refresh). Not the same class as the server AuthenticationService.

---

### CommentService.js

| | Description |
|--|-------------|
| **Skill** | **Article comments**: get paginated comments for an article, create a comment, delete a comment. Used by article detail pages and comment UI. *Definition of done*: All comment API calls from the client go through this service. |
| **Spec** | Class with static methods: `getComments(idArticle, params)` → GET `/api/v1/articles/:id/comments` with optional `limit`/`offset`; returns `{ comments, total }`. `createComment(idArticle, comment_content)` → POST. `deleteComment(idArticle, idComment)` → DELETE. Uses `apiClient`. |

**Related**: `app/api/v1/articles/[id]/comments/route.js`, `app/api/v1/articles/[id]/comments/[id_comment]/route.js`, `app/server/features/comment/CommentService.js`.

---

### CompanyService.js

| | Description |
|--|-------------|
| **Skill** | **Companies**: list all (normalized to array), get by id, create company, request company creation (workflow). Used by directory and company management UI. *Definition of done*: All company API calls from the client go through this service; list responses are always returned as an array. |
| **Spec** | Class with static methods: `getAllCompanies()` → GET `/api/v1/companies`, uses internal `toArray()` to normalize response; `getCompanyById(idCompany)` → GET `/api/v1/companies/:id`; `createCompany(data)` → POST `/api/v1/companies`; `requestCompanyCreation(data)` → POST `/api/v1/companies/request`. Uses `apiClient`. |

**Related**: `app/api/v1/companies/route.js`, `app/api/v1/companies/[id]/route.js`, `app/api/v1/companies/request/route.js`, `app/server/features/company/CompanyService.js`.

---

### ContentService.js

| | Description |
|--|-------------|
| **Skill** | CRUD for **contents** (e.g. magazine/content items): list all, get by id, create, update, delete. Used by content management and mediakit-related UI. *Definition of done*: All content API calls from the client go through this service. |
| **Spec** | Class with static methods: `getAllContents()` → GET `/api/v1/contents`, `getContentById(contentId)` → GET `/api/v1/contents/:id`, `createContent(contentData)` → POST, `updateContent(contentId, contentData)` → PUT, `deleteContent(contentId)` → DELETE. Uses `apiClient`. |

**Related**: `app/api/v1/contents/route.js`, `app/api/v1/contents/[id]/route.js`, `app/server/features/content/ContentService.js`.

---

### EventService.js

| | Description |
|--|-------------|
| **Skill** | **Events** (e.g. fairs): list all, get by id. Read-only from the client. Used by events list and event detail pages. *Definition of done*: All event API calls from the client go through this service. |
| **Spec** | Class with static methods: `getAllEvents()` → GET `/api/v1/events`, `getEventById(idFair)` → GET `/api/v1/events/:id`. Uses `apiClient`. Parameter name `idFair` is historical; it is the event id. |

**Related**: `app/api/v1/events/route.js`, `app/api/v1/events/[id]/route.js`, `app/server/features/event/EventService.js`.

---

### ModificationService.js

| | Description |
|--|-------------|
| **Skill** | **Time-log modifications**: create a modification request (logId, newType, newDate, comment); list modifications by status (admin); set modification status (admin). Used by time-log and admin UIs. *Definition of done*: All modification API calls from the client go through this service. |
| **Spec** | Class with static methods: `createModification(logId, newType, newDate, comment)` → POST `/api/v1/time-log/modification`; `getUsersModifications(status)` → GET `/api/v1/admin/modifications?status=...`; `setModificationStatus(id, newStatus)` → PATCH `/api/v1/admin/modification` with body `{ id, newStatus }`. Uses `apiClient`. |

**Related**: `app/api/v1/time-log/modification/route.js`, admin routes if present, `app/server/features/modification/ModificationService.js`.

---

### ProductService.js

| | Description |
|--|-------------|
| **Skill** | **Products**: list all (normalized to array), get by id, create. Used by directory and product UI. *Definition of done*: All product API calls from the client go through this service; list responses are always an array. |
| **Spec** | Class with static methods: `getAllProducts()` → GET `/api/v1/products` (with `toArray()`); `getProductById(idProduct)` → GET `/api/v1/products/:id`; `createProduct(data)` → POST `/api/v1/products`. Uses `apiClient`. |

**Related**: `app/api/v1/products/route.js`, `app/api/v1/products/[id]/route.js`, `app/server/features/product/ProductService.js`.

---

### ProfileUserService.js

| | Description |
|--|-------------|
| **Skill** | **Create profile user** in RDS (users table) after Cognito sign-up: single method that posts `id_user` (email) to create the backend user record. *Definition of done*: Registration flow calls this once after confirmSignUp so the app has a matching user row. |
| **Spec** | Not a class; exports async function `createProfileUser(id_user)` → POST `/api/v1/users` with body `{ id_user }`. Uses `apiClient`. |

**Related**: `app/api/v1/users/route.js`, `app/server/features/userProfile/UserProfileService.js`, signup/confirm flow in the app.

---

### PublicationService.js

| | Description |
|--|-------------|
| **Skill** | CRUD for **publications**: list all, get by id, create, update, delete. Used by publications list/detail and management UI. *Definition of done*: All publication API calls from the client go through this service. |
| **Spec** | Class with static methods: `getAllPublications()` → GET `/api/v1/publications`, `getPublicationById(idPublication)` → GET `/api/v1/publications/:id`, `createPublication(publicationData)` → POST, `updatePublication(idPublication, publicationData)` → PUT, `deletePublication(idPublication)` → DELETE. Uses `apiClient`. |

**Related**: `app/api/v1/publications/route.js`, `app/api/v1/publications/[id]/route.js`, `app/server/features/publication/PublicationService.js`.

---

### TimeLogService.js

| | Description |
|--|-------------|
| **Skill** | **Time logs**: create a time log (type, comment); get current user's time logs in a time range; get multiple users' time logs (admin); get time logs as CSV (admin). Used by time-tracking and admin UIs. *Definition of done*: All time-log API calls from the client go through this service. |
| **Spec** | Class with static methods: `createTimeLog(type, comment)` → POST `/api/v1/time-log`; `getUserTimeLogs(afterTime, beforeTime)` → GET `/api/v1/time-logs`; `getUsersTimeLogs(afterTime, beforeTime, users)` → GET `/api/v1/admin/time-logs`; `getUsersTimeLogsInCsv(afterTime, beforeTime, users)` → GET `/api/v1/admin/time-logs/csv`. Uses `apiClient`. |

**Related**: `app/api/v1/time-log/route.js`, `app/api/v1/time-logs/route.js`, admin CSV route if present, `app/server/features/timeLog/TimeLogService.js`.

---

### UserSerivce.js

| | Description |
|--|-------------|
| **Skill** | **Admin user management**: list all users, update user (username, name, email, password, enabled), create user. Used by admin-only UI. *Definition of done*: All admin user API calls from the client go through this service. |
| **Spec** | Default export class (filename typo: `UserSerivce`). Static methods: `getAllUsers()` → GET `/api/v1/admin/user`; `updateUser(username, name, email, password, enabled)` → PUT `/api/v1/admin/user`; `createUser(name, email, password)` → POST `/api/v1/admin/user`. Uses `apiClient`. When adding or changing admin user endpoints, consider renaming the file to `UserService.js` and update imports; document the change here. |

**Related**: Admin API routes for users, `app/server/features/user/UserSerivce.js` (same typo on server). Not to be confused with profile creation: **ProfileUserService.js** creates the RDS user after signup; this service is for admin CRUD.

---

## When to update this file

- Add, remove or rename a service file in `apiClient/`.
- Add or remove methods or change which API route a method uses.
- Change the meaning of a service (e.g. AuthenticationService starts using apiClient). Keep skill/spec in English and in sync with the code.
