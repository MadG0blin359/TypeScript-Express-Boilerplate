# 🚀 TypeScript + Express + Supabase Boilerplate

A production-ready, highly extensible REST API boilerplate built with **TypeScript**, **Express**, and **Supabase** (Database, Authentication, and Storage).

---

## ✨ Features

- **TypeScript (ESM / NodeNext)**: Strict type checking, modern ECMAScript Modules, and fast development with `tsx`.
- **Supabase Integration**:
  - **Database (PostgreSQL)**: Fully typed CRUD repository pattern with pagination, filtering, search, and sorting.
  - **Authentication**: JWT token verification middleware (`requireAuth` / `optionalAuth`) using Supabase Auth.
  - **Storage**: Built-in file upload (via Multer), download, signed URLs, and file deletion.
  - **Row Level Security (RLS)**: Client factory supporting user-scoped authentication so RLS is enforced at the database level.
- **Request Validation**: Schema-based validation using **Zod** for `body`, `query`, and `params`.
- **Interactive Documentation**: **Swagger UI** / OpenAPI 3.0 specification available at `/docs`.
- **Security & Best Practices**:
  - **CSRF Protection**: Stateless Double Submit Cookie pattern using `csrf-csrf` and `cookie-parser`.
  - Security headers powered by **Helmet**
  - **CORS** configuration
  - Rate limiting via **express-rate-limit**
  - **Node.js 24 & Native Env**: Uses Node 24 native `process.loadEnvFile()` — zero external `dotenv` dependency needed.
- **Observability & Reliability**:
  - Centralized error handling (`AppError` with operational vs programmer error detection)
  - HTTP logging with **Morgan** and custom structured logger
  - Health & readiness probes (`/health`, `/ready`) checking Supabase connectivity
  - Graceful shutdown (`SIGTERM`, `SIGINT`, unhandled exceptions/rejections)

---

## 📁 Project Structure

```text
├── .env.example              # Environment variables template
├── .gitignore
├── LICENSE
├── package.json              # Project scripts & dependencies
├── tsconfig.json             # TypeScript compiler settings
└── src/
    ├── config/
    │   ├── env.ts            # Type-safe Zod-validated environment config
    │   ├── schema.sql        # Ready-to-run Supabase tables, RLS & Storage SQL
    │   └── supabase.ts       # Supabase standard, admin, and user-scoped clients
    ├── controllers/
    │   ├── auth.controller.ts    # Authentication handlers (signup, login, profile, etc.)
    │   ├── health.controller.ts  # Health check & readiness probes
    │   ├── item.controller.ts    # Sample CRUD resource controller
    │   └── storage.controller.ts # File upload & Supabase Storage controller
    ├── middlewares/
    │   ├── auth.middleware.ts    # Supabase Bearer token verification
    │   ├── csrf.middleware.ts    # Double Submit Cookie CSRF protection
    │   ├── error.handler.ts      # Global centralized error handler
    │   ├── rate-limit.middleware.ts # Rate limiting policies
    │   └── validate.middleware.ts   # Zod request validation middleware
    ├── routes/
    │   ├── auth.routes.ts        # /api/auth/*
    │   ├── health.routes.ts      # /health, /ready
    │   ├── item.routes.ts        # /api/items/*
    │   ├── storage.routes.ts     # /api/storage/*
    │   └── index.ts              # Main router aggregator
    ├── services/
    │   ├── auth.service.ts       # Supabase Auth logic
    │   ├── item.service.ts       # Supabase Database queries & operations
    │   └── storage.service.ts    # Supabase Storage operations
    ├── types/
    │   ├── express.d.ts          # Express Request augmentation (req.user, req.token)
    │   └── index.ts              # API interfaces & shared types
    ├── utils/
    │   ├── app-error.ts          # Operational AppError class
    │   ├── logger.ts             # Formatted logger utility
    │   └── swagger.ts            # OpenAPI specification & Swagger UI mounting
    ├── validators/
    │   ├── auth.validator.ts     # Auth Zod schemas
    │   └── item.validator.ts     # Item CRUD Zod schemas
    ├── app.ts                    # Express application setup
    └── server.ts                 # Server entry point & graceful shutdown
```

---

## 🏁 Quickstart

### 1. Prerequisites
- **Node.js**: v24.0.0 or higher (uses built-in native `.env` loading, no `dotenv` required)
- **npm** / **yarn** / **pnpm**
- A [Supabase](https://supabase.com) account & project

### 2. Installation
```bash
git clone <your-repo-url>
cd TypeScript-Express-Boilerplate
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your credentials inside `.env`:
```env
PORT=3000
NODE_ENV=development

# Supabase Project URL & Keys (from Project Settings > API)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key

# Storage Bucket
SUPABASE_BUCKET_NAME=uploads

# Security
CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### 4. Supabase Database & Storage Setup
1. Open your Supabase Dashboard -> **SQL Editor**.
2. Copy the contents of [`src/config/schema.sql`](src/config/schema.sql) and execute it.
   - This creates the `items` table, sets up automatic `updated_at` timestamps, applies Row Level Security (RLS) policies, and creates the `uploads` storage bucket.

### 5. Running the Application

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts server in watch mode with `tsx` (hot reload) |
| `npm run build` | Compiles TypeScript files into `dist/` |
| `npm start` | Runs the compiled production code from `dist/server.js` |
| `npm run typecheck` | Checks TypeScript types without emitting files |

---

## 📖 API Documentation & Endpoints

Interactive Swagger UI documentation is available at:
👉 **`http://localhost:3000/docs`**

### Summary of Endpoints

#### Health Checks
- `GET /health`: Liveness probe (uptime, status).
- `GET /ready`: Readiness probe (verifies Supabase DB connectivity).

#### Authentication (`/api/auth`)
- `POST /api/auth/signup`: Create a user with email & password (`{ email, password, fullName }`).
- `POST /api/auth/login`: Authenticate and receive a JWT access token & session (`{ email, password }`).
- `GET /api/auth/profile`: Get current user profile (Requires `Authorization: Bearer <token>`).
- `POST /api/auth/logout`: Sign out and revoke session (Requires `Authorization: Bearer <token>`).
- `POST /api/auth/forgot-password`: Send password reset email (`{ email }`).

#### Resource CRUD Example (`/api/items`)
- `GET /api/items`: List items with pagination, search, and sorting (Optional Auth).
  - Query parameters: `?page=1&limit=10&search=keyword&completed=true&sortBy=created_at&sortOrder=desc`
- `GET /api/items/:id`: Fetch item by UUID (Optional Auth).
- `POST /api/items`: Create item (Requires `Authorization: Bearer <token>`).
- `PATCH /api/items/:id`: Update item (Requires `Authorization: Bearer <token>`).
- `DELETE /api/items/:id`: Delete item (Requires `Authorization: Bearer <token>`).

#### Supabase Storage (`/api/storage`)
- `POST /api/storage/upload`: Multipart file upload using `file` field (Requires Auth).
- `POST /api/storage/signed-url`: Generate temporary signed download URL for private files (`{ path, expiresIn }`).
- `GET /api/storage/files`: List files in a bucket folder (`?folder=uploads`).
- `DELETE /api/storage/files`: Delete files (`{ paths: ["uploads/file.png"] }`).

---

## 🔒 Row Level Security (RLS) & Client Scoping

This boilerplate provides two Supabase clients and a scoped client generator:
- **`supabase`**: Uses the public anon key. Enforces anonymous/public RLS policies.
- **`supabaseAdmin`**: Uses the service role key. Bypasses RLS for internal server operations.
- **`createScopedClient(token)`**: Creates an authenticated client on the fly with the user's JWT. All PostgREST queries sent with this client automatically enforce user-specific RLS policies (`auth.uid() = user_id`).

```typescript
import { createScopedClient } from "./config/supabase.js";

// Inside an authenticated route:
const userClient = createScopedClient(req.token!);
const { data } = await userClient.from("items").select("*");
```

---

## 🛡️ CSRF Protection

This boilerplate implements stateless **Double Submit Cookie** CSRF protection powered by `csrf-csrf` and `cookie-parser`:

1. **Get CSRF Token**:
   Frontends (React, Vue, Next.js, mobile web) request a CSRF token:
   ```bash
   GET /api/csrf-token
   ```
   This returns `{ success: true, csrfToken: "..." }` and sets a secure `x-csrf-token` cookie.

2. **Send Mutating Requests**:
   Include the token in the `x-csrf-token` request header for `POST`, `PUT`, `PATCH`, and `DELETE` requests:
   ```bash
   curl -X POST http://localhost:3000/api/items \
     -H "Content-Type: application/json" \
     -H "x-csrf-token: <your-token>" \
     -H "Cookie: x-csrf-token=<cookie-value>" \
     -d '{"title": "New Item"}'
   ```

> **API Clients Note**: Pure API requests with an `Authorization: Bearer <jwt>` header that do not use cookies (such as Swagger UI, mobile apps, or backend microservices) are automatically permitted since CSRF attacks specifically exploit browser-managed cookies.

---

## 🛡️ Error Handling & Validation

- **`AppError`**: Thrown for operational errors (`new AppError(statusCode, message)`).
- **Zod Validation**: Apply `validate({ body, query, params })` to routes. Request parameters will be validated and typed automatically before reaching the controller.
- **Centralized Handler**: Development mode includes stack traces, while production returns clean, sanitized JSON error responses.

---

## 📄 License

This boilerplate is licensed under the [MIT License](LICENSE).