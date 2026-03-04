# app/server/BACKEND.md — Hub: createEndpoint, errorHandler, database, features

**When to open**: Changing API plumbing (createEndpoint, errorHandler), the database (models, associations), or any server feature (model, service, error type). For API route handlers → [app/api/API-ROUTES.md](../api/API-ROUTES.md).

---

## What this doc contains

- Contract for createEndpoint, errorHandler and DB.
- "How to add a feature" guide (flow without breaking).
- Where things are (server/ root files, database/, features).
- If you change X → open Y.
- Key contracts / invariants.
- Decisions (links to sections).
- How to test / validate.
- Features table and gotchas.

---

## Where things are (paths)

| Where | Path | Content |
|-------|------|---------|
| **Plumbing** | `app/server/createEndpoint.js`, `app/server/errorHandler.js` | Handler factory, Joi validation, Cognito auth, error-to-HTTP mapping. |
| **Database** | `app/server/database/database.js`, `models.js`, `associations.js` | Sequelize singleton, model registration, associations. |
| **Features** | `app/server/features/<name>/` | Per domain: Model, Service, optionally Error and Enums. Models are inited in database/models.js. |

---

## If you change X → open Y

| You are changing… | Open / do |
|-------------------|-----------|
| createEndpoint (signature, validation, auth, cookies) | This doc (Contract) and createEndpoint.js. Keep errorHandler and proxy in sync if error codes or auth change. |
| errorHandler (new error type, new status) | This doc (Contract), errorHandler.js. The domain service must throw that error. |
| Model or association | database/models.js, database/associations.js; add row in [Features](#features-one-table). |
| A feature's service | Feature folder under `app/server/features/`; API route that uses it (see API-ROUTES.md). |
| New API route that uses a service | [app/api/API-ROUTES.md](../api/API-ROUTES.md) (add row) and the route handler. |

---

## Key contracts / invariants

- **createEndpoint(callback, schema, isProtected, roles)**  
  Validates request (Joi: GET→searchParams, POST→JSON or multipart), optionally verifies/refreshes Cognito cookies, optionally enforces roles, runs callback(request, body, context). Sets refreshed cookies on response when refresh occurred. Handler receives request.email, request.sub when protected. All protected v1 use it; validate-token is standalone.

- **errorHandler(error)**  
  Maps thrown errors to NextResponse: TimeLogNotFound / message includes 'not found' → 404; InvalidPasswordException, InvalidParameterException, UsernameExistsException → 400; else → 500 (requestId; prod message still in Spanish in code → move to English when touching). **When adding a domain error**: throw it from the service and add a branch in errorHandler.

- **Database**  
  Single Sequelize instance (database.js). Models registered in **database/models.js**; associations in **database/associations.js**. Startup: instrumentation-node.js calls getInstance().connect() and sync(). Env: DATABASE_NAME, USER, PASSWORD, HOST, PORT; optional SSL (certs/rds-ca.pem). Build skips validation when env is missing. **When adding a model**: init in models.js, association in associations.js if applicable, then row in the features table.

---

## Decisions (links to sections)

| Decision | Section in this doc |
|----------|----------------------|
| createEndpoint and errorHandler signature and behaviour | [Key contracts](#key-contracts--invariants) |
| How to add a feature without breaking | [How to add a feature](#how-to-add-a-feature-guide) |
| List of features and which API uses them | [Features (one table)](#features-one-table) |
| Gotchas (UserSerivce, TimeLogTypeEnum, Spanish) | [Gotchas](#gotchas) |

---

## How to test / validate

- **Build**: `npm run build` — DB connects/syncs in Node; if it fails due to env, check instrumentation-node and DATABASE_*.
- **API route using createEndpoint**: Call with invalid body/query → 400; no cookie on protected route → 401/403 per proxy/createEndpoint; with valid cookie → 200 or whatever status the handler returns.
- **New domain error**: Throw it from the service and verify errorHandler returns the expected status (404, 400, etc.).
- **New model**: After init and association, start the app and hit an endpoint that uses that model (or a script that uses getSequelize()).

---

## How to add a feature (guide)

1. Add **Model** in `server/features/<name>/` and init in **database/models.js** (tableName, indexes).
2. If the model relates to another, add association in **database/associations.js** (hasMany/belongsTo).
3. Add **Service** in the same feature folder; API routes call it (via createEndpoint).
4. If the feature has domain errors (e.g. NotFound), add an Error class and a branch in **errorHandler.js**.
5. Add a row to the **Features** table below and wire the API route (see API-ROUTES.md).

---

## Root files (server/)

| File | Spec |
|------|------|
| **createEndpoint.js** | Exports createEndpoint(callback, schema, isProtected, roles). Uses env.js COGNITO; AuthenticationService (verifyIdToken, verifyAccessToken, fetchNewTokens); AuthorizationService getUserRoles; errorHandler. validate(): GET→searchParams, application/json→body, multipart→formData. checkTokens(): reads Cognito cookies, verifies/refreshes, returns [username, email, sub, ...]. Some throw messages in Spanish → move to English. |
| **errorHandler.js** | Exports errorHandler(error). 404 for not-found/TimeLogNotFound; 400 for Cognito Invalid*; 500 else. Add new error types here when introducing domains. |

---

## Database (server/database/)

| File | Spec |
|------|------|
| **database.js** | Class Database (singleton). getInstance(), getSequelize(). Env DATABASE_*; SSL certs/rds-ca.pem. connect(): authenticate(); sync(): sequelize.sync(). |
| **models.js** | Imports Database, getSequelize(), every *Model and enums; Model.init(...); defineAssociations(). Exports all models. |
| **associations.js** | defineAssociations(): TimeLog hasMany Modification; Company hasMany Product; Article hasMany Comment; UserProfile hasMany Comment (and corresponding belongsTo). Idempotent guard. |

---

## Features (one table)

| Feature | Model | Service | Errors / enums | Used by API |
|---------|-------|---------|----------------|-------------|
| authentication | — | AuthenticationService (verifyIdToken, verifyAccessToken, fetchNewTokens) | — | createEndpoint, proxy |
| authorization | — | AuthorizationService (getUserRoles) | — | createEndpoint |
| user | — | UserSerivce (admin CRUD; **typo in name**) | — | admin/user |
| userProfile | UserProfileModel | UserProfileService | — | v1/users |
| article | ArticleModel | ArticleService | — | v1/articles |
| comment | CommentModel | CommentService | — | v1/articles/…/comments |
| company | CompanyModel | CompanyService | — | v1/companies |
| product | ProductModel | ProductService | — | v1/products |
| publication | PublicationModel | PublicationService | — | v1/publications |
| content | ContentModel | ContentService | — | v1/contents |
| event | EventModel | EventService | — | v1/events |
| banner | BannerModel | BannerService | — | v1/banners |
| timeLog | TimeLogModel | TimeLogService | TimeLogError (TimeLogNotFound), **TimeLogTypeEnum (key "salid" = salida; typo)** | v1/time-log, v1/time-logs |
| modification | ModificationModel | ModificationService | ModificationError (ModificationNotFound), ModificationStatusEnum | v1/time-log/modification |

---

## Gotchas

- **UserSerivce**: Typo in filename and class name (server and apiClient). When touching, consider renaming to UserService and updating imports.
- **TimeLogTypeEnum**: The key for "salida" is `salid` in code; fix when touching.
- **Spanish strings**: createEndpoint and errorHandler still have Spanish messages ("Solicitud incorrecta", "Falta cookie", "Error interno del servidor"). Move to English when editing.
- **Ownership**: This module owns DB, features and API plumbing. It does not own route handlers (they live under app/api/ and call createEndpoint + services).
