# app/api/API-ROUTES.md — Hub: validate-token, v1

**When to open**: Adding, changing or removing an API route or its handler. For server features (model, service) → [app/server/BACKEND.md](../server/BACKEND.md). For client callers → [apiClient/API-CLIENT.md](../../apiClient/API-CLIENT.md).

---

## What this doc contains

- Contract (validate-token standalone; v1 with createEndpoint; runtime).
- Where things are (segment and method table).
- If you change X → open Y.
- Key contracts / invariants.
- Decisions (links to sections).
- How to test / validate.
- Full route table (segment → method, handler, service).

---

## Where things are (paths)

| Where | Path | Content |
|-------|------|---------|
| **validate-token** | `app/api/validate-token/route.js` | POST: validate Cognito id/access tokens from cookies. Standalone handler (no createEndpoint). |
| **v1** | `app/api/v1/<resource>/route.js`, `[id]/route.js`, etc. | Each resource (articles, companies, …) has one or more route.js. Most use createEndpoint. |

Full table is in [Route table](#route-table).

---

## If you change X → open Y

| You are changing… | Open / do |
|-------------------|-----------|
| Add or remove a route, or change method/handler/service | This doc: update [Route table](#route-table). Implement handler with createEndpoint + service. If a client service uses it, update [apiClient/API-CLIENT.md](../../apiClient/API-CLIENT.md). |
| Validation schema (Joi) or auth (isProtected, roles) for a route | The corresponding route.js; respect createEndpoint contract in [app/server/BACKEND.md](../server/BACKEND.md). Update the row in the table if the service or method changes. |
| Service or model implementation | [app/server/BACKEND.md](../server/BACKEND.md) and the feature folder. |
| Client that calls this route | [apiClient/API-CLIENT.md](../../apiClient/API-CLIENT.md). |

---

## Key contracts / invariants

- **validate-token**: Standalone (POST; validates Cognito cookies). Does not use createEndpoint.
- **v1**: All routes that need validation or auth use **createEndpoint** from [app/server/createEndpoint.js](../server/createEndpoint.js). Body/query validated with Joi (GET→searchParams, POST JSON→body, multipart→formData). Schema and handler are defined in each route file.
- **Runtime**: Routes that use the DB have `export const runtime = "nodejs"`.

---

## Decisions (links to sections)

| Decision | Section in this doc |
|----------|----------------------|
| Which route uses which handler and service | [Route table](#route-table) |
| validate-token vs v1 and runtime rules | [Key contracts](#key-contracts--invariants) |

---

## How to test / validate

- **validate-token**: POST with valid session cookies → 200 (or whatever body it returns). No cookies or invalid → error per implementation.
- **v1 route with createEndpoint**:  
  - Invalid body/query → 400.  
  - Protected route without cookie or invalid token → 401/403.  
  - With valid cookie and valid body → handler response (200, 404, etc.).  
- **New route**: Add row to table, implement handler, run request (browser or curl) and check status and body. If a client calls it, test from the UI or the service in apiClient.

---

## Route table

| Segment | Method | Handler | Service / notes |
|---------|--------|---------|-----------------|
| **validate-token** | POST | Standalone | Validates id/access tokens from cookies. |
| **v1/articles** | GET, POST | createEndpoint | ArticleService: list, create. |
| **v1/articles/[id]** | GET, PUT, DELETE | createEndpoint | ArticleService: get, update, delete. |
| **v1/articles/[id]/comments** | GET, POST | createEndpoint | CommentService: list, create. |
| **v1/articles/[id]/comments/[id_comment]** | DELETE | createEndpoint | CommentService: delete. |
| **v1/companies** | GET, POST | createEndpoint | CompanyService: list, create. |
| **v1/companies/[id]** | GET, PUT | createEndpoint | CompanyService: get, update. |
| **v1/companies/request** | POST | createEndpoint | CompanyService: request creation. |
| **v1/contents** | GET, POST | createEndpoint | ContentService: list, create. |
| **v1/contents/[id]** | GET, PUT, DELETE | createEndpoint | ContentService: get, update, delete. |
| **v1/events** | GET | createEndpoint | EventService: list. |
| **v1/events/[id]** | GET | createEndpoint | EventService: get. |
| **v1/products** | GET, POST | createEndpoint | ProductService: list, create. |
| **v1/products/[id]** | GET, PUT, DELETE | createEndpoint | ProductService: get, update, delete. |
| **v1/publications** | GET, POST | createEndpoint | PublicationService: list, create. |
| **v1/publications/[id]** | GET, PUT, DELETE | createEndpoint | PublicationService: get, update, delete. |
| **v1/banners** | GET | createEndpoint | BannerService: list. |
| **v1/users** | POST | createEndpoint | UserProfileService: create (e.g. after signup). |
| **v1/users/[id]** | GET, PUT | createEndpoint | UserProfileService: get, update. |
| **v1/users/me** | GET, PUT | createEndpoint | UserProfileService: current user. |
| **v1/time-log** | POST | createEndpoint | TimeLogService: create. |
| **v1/time-log/modification** | POST | createEndpoint | ModificationService: create. |
| **v1/time-logs** | GET | createEndpoint | TimeLogService: getUserTimeLogs (current user, query afterTime/beforeTime). |

Admin routes (e.g. admin/user, admin/modifications, admin/time-logs) may live under additional segments; apiClient references them. When adding a route: add row here, implement handler with createEndpoint + service, update API-CLIENT.md if a client service uses it.
