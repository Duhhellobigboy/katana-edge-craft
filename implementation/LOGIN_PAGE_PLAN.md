# Implementation Plan: Admin Login Page

This plan details the setup and creation of a simple, secure `/login` page for the Katana Edge website, allowing a single admin client/business owner to log in and access a protected `/admin` area. 

Customers will continue to checkout as guests, and no public user accounts or auth tables will be created.

---

## 1. Current Project Inspection

- **Framework**: TanStack Start (Vite 7 + Nitro engine with Vercel deployment preset).
- **Routing System**: TanStack Router file-based routing inside `src/routes/`.
- **Server/API Route Style**: Serverless API routes defined using `createFileRoute("/route")` with `server.handlers` and server-side RPC functions using `createServerFn`.
- **Existing Env Loading**: Public environment variables prefix with `VITE_` (for client). Secrets loaded inside server functions and API endpoints using Node's `process.env`.
- **Auth Status**: E-commerce checkouts and application flows are entirely guest-only. No custom user databases or auth profiles tables exist.

---

## 2. Login Architecture

### A. The `/login` Page View
- Created at `src/routes/login.tsx`.
- **Style**: Premium, dark luxury aesthetic matching the Katana Edge design system (using HSL colors, gold borders, Oswald headings, and centered dark card layout).
- **UI Components**:
  - Centered auth card with title "Admin Login".
  - Password-only input field (no username, email, signup links, or forgot password hooks).
  - "Log In" button with dynamic spinner states.
  - Form error alert for validation failures.

### B. Session and Verification Flow
1. **Submit**: Form submits the password to `POST /api/admin/login` (or a server function).
2. **Server-Side Validation**:
   - The password is compared to the server-only `ADMIN_PASSWORD` env variable.
   - If incorrect, returns an HTTP `401 Unauthorized` with a clean error message.
3. **Cookie Creation**:
   - If correct, the server generates a cryptographically signed HMAC token: `admin:<expiry>:<signature>`.
   - The signature is hashed using `ADMIN_SESSION_SECRET` as the HMAC key.
   - The token is set in the client browser via an HTTP `Set-Cookie` header.
4. **Cookie Security Parameters**:
   - `HttpOnly`: Protects the token from being read by client-side browser JavaScript (mitigating XSS).
   - `Secure`: Ensures the cookie is only transmitted over HTTPS (always active in production).
   - `SameSite=Strict`: Prevents the cookie from being sent on cross-site requests (mitigating CSRF).
   - `Max-Age`: Configured for a 30-day session lifespan.
5. **Session Verification (`beforeLoad`)**:
   - The `/admin` route will implement a `beforeLoad` hook that calls a server-side check.
   - The server parses the cookie header, verifies the HMAC signature using `ADMIN_SESSION_SECRET`, checks if the timestamp is expired, and returns the verification status.
   - If verification fails, the router throws a redirect to `/login`.
6. **Logout Flow**:
   - Navigating to or calling `POST /api/admin/logout` returns a `Set-Cookie` header with `Max-Age=0` and an expired timestamp, instructing the browser to immediately delete the cookie.

---

## 3. Environment Variables Needed

Add the following variables to `.env` (without the `VITE_` prefix to ensure they never ship to the client):

```env
# ADMIN AUTH
ADMIN_PASSWORD=your_secure_admin_password_here
ADMIN_SESSION_SECRET=your_32_character_hex_session_secret_here
```

---

## 4. Files to Create and Modify

### New Files to Create

1. **`src/lib/admin.server.ts`**
   - Implements `generateSessionToken(secret)` and `verifySessionToken(token, secret)` using Node's native `crypto` module.
   - Exposes `checkAdminAuth` logic used by routes to validate the cookie.

2. **`src/routes/login.tsx`**
   - The `/login` route containing the password form, states, and redirect logic if already authenticated.

3. **`src/routes/api/admin/login.ts`**
   - POST handler verifying the password and setting the HTTP-only cookie.

4. **`src/routes/api/admin/logout.ts`**
   - POST/GET handler clearing the `admin_session` cookie.

5. **`src/routes/admin.tsx`**
   - Protected layout wrapper route at `/admin` checking session credentials via `beforeLoad` and redirecting unauthorized visitors.

### Existing Files to Modify

1. **`.env`**
   - Append empty configurations for `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET`.

---

## 5. Security Checklist

- [ ] **No `VITE_ADMIN_PASSWORD`**: The password key must not have the VITE prefix.
- [ ] **Server-Only Checks**: The actual password validation takes place exclusively in Nitro server handlers.
- [ ] **HTTP-Only Cookie**: `HttpOnly` is set on the cookie to block client-side access.
- [ ] **Secure Attribute**: `Secure` is active in production environments.
- [ ] **SameSite Configuration**: Cookie has `SameSite=Strict` header enabled.
- [ ] **HMAC Token Signature**: Session token includes a timestamp and signature hashed with `ADMIN_SESSION_SECRET`.
- [ ] **Logout Invalidation**: The logout route successfully updates cookie expiration to force removal.

---

## 6. Testing Checklist

- [ ] **Route Rendering**: Hitting `/login` loads the dark luxury login interface.
- [ ] **Failure Handling**: Submitting an incorrect password displays a clean "Invalid credentials" error banner.
- [ ] **Session Creation**: Submitting the correct password redirects to `/admin` and sets the `admin_session` cookie.
- [ ] **Access Guard**: Hitting `/admin` directly when not logged in redirects to `/login`.
- [ ] **Access Allow**: Hitting `/admin` directly when logged in loads the page successfully.
- [ ] **Logout Hook**: Clicking logout clears the session cookie and redirects back to `/login`.
- [ ] **Compilation**: Project builds without errors (`npm run build` compiles routes and presets).
- [ ] **Side Effects**: Guest checkouts, product views, and contact flows function correctly and are not affected.

---

## 7. Deployment Checklist

1. Log into your hosting platform dashboard (e.g. Vercel).
2. Go to project settings → **Environment Variables**.
3. Add the following keys:
   - `ADMIN_PASSWORD` (set to a secure production secret)
   - `ADMIN_SESSION_SECRET` (set to a long, random secure token)
4. Trigger a new deployment/redeploy of the branch.
5. Verify access to `/login` and `/admin` on the live domain.

---

## 8. Future Admin Editor Connection

Once this login system is authenticated, the `/admin` route will act as the protected portal where the store owner can edit site content:
- **Copywriting / text content** (headings, taglines, short descriptions)
- **Product database entries** (prices, specs, features)
- **Image URLs**
- **FAQ lists & reviews**
- **SEO fields**
The admin page will query and write updates directly to the Supabase database using the service role key, bypassing standard client RLS policies for administrative management.
