# Pingly

WhatsApp message scheduling SaaS — schedule reminders, birthday wishes, and follow-ups automatically.

| Service   | Stack                          | Hosting   |
|-----------|--------------------------------|-----------|
| Frontend  | Next.js 16, Clerk, Tailwind    | Vercel    |
| Backend   | Express, Baileys, Supabase     | Render    |
| Database  | Supabase (PostgreSQL)          | Supabase  |
| Auth      | Clerk                          | Clerk     |

---

## Project structure

```
Pingly/
├── Frontend/          # Next.js app  → deploy to Vercel
├── Backend/           # Express API  → deploy to Render
├── render.yaml        # Render blueprint (optional)
└── README.md
```

---

## Local development

### Prerequisites

- Node.js 20+
- Supabase project (run `Backend/supabase_schema.sql` in SQL Editor)
- Clerk application (development keys are fine)

### 1. Backend

```bash
cd Backend
cp .env.example .env        # fill in your keys
npm install
npm run dev                 # http://localhost:3001
```

### 2. Frontend

```bash
cd Frontend
cp .env.example .env.local  # fill in your keys
npm install
npm run dev                 # http://localhost:3000
```

### Local environment variables

**Backend `.env`**

| Variable | Example |
|----------|---------|
| `PORT` | `3001` |
| `SUPABASE_URL` | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (service_role key) |
| `CLERK_SECRET_KEY` | `sk_test_...` |
| `CLERK_WEBHOOK_SECRET` | `whsec_...` (optional for local — users auto-sync on first API call) |
| `FRONTEND_URL` | `http://localhost:3000` (optional locally — localhost is allowed by default) |

**Frontend `.env.local`**

| Variable | Example |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_test_...` |
| `CLERK_SECRET_KEY` | `sk_test_...` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL` | `/dashboard` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL` | `/dashboard` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | `/dashboard` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | `/dashboard` |

---

## Deployment

### Step 1 — Supabase (database)

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor** → paste and run `Backend/supabase_schema.sql`
3. Copy **Project URL** and **service_role key** from **Settings → API**

---

### Step 2 — Backend on Render

#### Option A: Blueprint (recommended)

1. Push this repo to GitHub
2. [Render Dashboard](https://dashboard.render.com) → **New → Blueprint**
3. Connect your repo — Render reads `render.yaml` automatically
4. Fill in secret env vars when prompted

#### Option B: Manual web service

1. **New → Web Service** → connect your GitHub repo
2. Configure:

| Setting | Value |
|---------|-------|
| **Root Directory** | `Backend` |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Health Check Path** | `/health` |

3. Add environment variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `SUPABASE_URL` | your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | your service_role key |
| `CLERK_SECRET_KEY` | `sk_live_...` or `sk_test_...` |
| `CLERK_WEBHOOK_SECRET` | from Clerk webhook setup (see below) |
| `FRONTEND_URL` | `https://your-app.vercel.app` (set after Vercel deploy) |

4. Deploy — note your Render URL, e.g. `https://pingly-backend.onrender.com`

> **Note:** Render free tier spins down after inactivity. First request may take ~30s. WhatsApp sessions require the service to stay running for reliable message delivery.

---

### Step 3 — Frontend on Vercel

1. [Vercel Dashboard](https://vercel.com) → **Add New Project** → import your GitHub repo
2. Configure:

| Setting | Value |
|---------|-------|
| **Root Directory** | `Frontend` |
| **Framework Preset** | Next.js (auto-detected) |
| **Build Command** | `npm run build` (default) |
| **Output Directory** | `.next` (default) |

3. Add environment variables:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://pingly-backend.onrender.com` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_...` or `pk_test_...` |
| `CLERK_SECRET_KEY` | same Clerk secret key as backend |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL` | `/dashboard` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL` | `/dashboard` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | `/dashboard` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | `/dashboard` |

4. Deploy — note your Vercel URL, e.g. `https://pingly.vercel.app`

5. Go back to **Render** → update `FRONTEND_URL` to your Vercel URL → redeploy backend

---

### Step 4 — Clerk configuration

In [Clerk Dashboard](https://dashboard.clerk.com):

#### Paths (configure → paths)

| Setting | Value |
|---------|-------|
| Sign-in URL | `/sign-in` |
| Sign-up URL | `/sign-up` |
| After sign-in URL | `/dashboard` |
| After sign-up URL | `/dashboard` |

#### Allowed origins (configure → domains)

Add your Vercel production URL:
```
https://your-app.vercel.app
```

#### Webhook (optional but recommended for production)

1. **Webhooks → Add Endpoint**
2. URL: `https://pingly-backend.onrender.com/webhook/clerk`
3. Subscribe to: `user.created`, `user.deleted`
4. Copy the **Signing Secret** → set as `CLERK_WEBHOOK_SECRET` on Render

> Without the webhook, users are still auto-created in Supabase on their first API call. The webhook is recommended for production reliability.

---

## API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | No | Health check |
| `POST` | `/webhook/clerk` | Svix signature | Clerk user sync |
| `GET` | `/messages` | Clerk JWT | List scheduled messages |
| `POST` | `/messages` | Clerk JWT | Create scheduled message |
| `DELETE` | `/messages/:id` | Clerk JWT | Delete scheduled message |
| `GET` | `/whatsapp/status` | Clerk JWT | WhatsApp connection status |
| `GET` | `/whatsapp/qr` | Clerk JWT | SSE stream for QR code |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS error in browser | Set `FRONTEND_URL` on Render to your exact Vercel URL (no trailing slash) |
| `Invalid API key` from Supabase | Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are from the same project |
| `table not found` | Run `Backend/supabase_schema.sql` in Supabase SQL Editor |
| Clerk redirect loop | Check Clerk env vars use `FORCE_REDIRECT` / `FALLBACK_REDIRECT` names (not `AFTER_SIGN_IN`) |
| Backend slow on first request | Render free tier cold start — upgrade or use a keep-alive ping |
| `node_modules` on GitHub | Run `git rm -r --cached Backend/node_modules Frontend/node_modules` and commit |

---

## Scripts reference

**Backend**
```bash
npm run dev    # development with hot reload
npm run build  # compile TypeScript → dist/
npm start      # production (uses dist/)
```

**Frontend**
```bash
npm run dev    # development server
npm run build  # production build
npm start      # serve production build
```
