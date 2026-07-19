# Supabase Setup Guide

## Step 1 — Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Choose a name (e.g. `hoody`), set a database password, pick a region close to your users
4. Wait ~2 minutes for the project to provision

---

## Step 2 — Run the Schema Migration

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste it into the editor and click **Run**

This creates all 8 tables: `profiles`, `categories`, `products`, `cart_items`, `wishlist_items`, `orders`, `order_items`, `reviews` — plus all indexes, RLS policies, and triggers.

---

## Step 3 — Seed the Database (50 Products)

1. In the SQL Editor, click **New Query**
2. Copy the entire contents of `supabase/seed.sql`
3. Paste it and click **Run**

This inserts:
- **5 categories**: Shirts, Pants, Hoodies, Shoes, Jackets
- **50 products**: 10 per category with full details, images, sizes, colors, and ratings

---

## Step 4 — Get Your API Keys

1. Go to **Project Settings → API**
2. Copy the following values:

| Key | Used In |
|---|---|
| **Project URL** | `VITE_SUPABASE_URL` (Cloudflare) + `SUPABASE_URL` (Railway) |
| **anon / public** key | `VITE_SUPABASE_PUBLISHABLE_KEY` (Cloudflare) |
| **service_role** secret | `SUPABASE_SECRET_KEY` (Railway only — never expose client-side) |

---

## Step 5 — Configure Environment Variables

### Cloudflare Pages (Dashboard → Settings → Environment Variables)

```
VITE_SUPABASE_URL          = https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL               = https://hoody-production-4b02.up.railway.app
NODE_VERSION               = 20
SKIP_DEPENDENCY_INSTALL    = 1
```

### Railway (Dashboard → Variables)

```
SUPABASE_URL        = https://xxxxxxxxxxxx.supabase.co
SUPABASE_SECRET_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NODE_ENV            = production
CLOUDFLARE_URL      = https://hoody-rin.pages.dev
PORT                = 3001
```

---

## Step 6 — Enable Auth Providers (Optional)

1. Go to **Authentication → Providers**
2. Enable **Email** (enabled by default)
3. Optionally enable **Google**, **GitHub**, or other OAuth providers

---

## Database Schema Overview

```
auth.users (managed by Supabase Auth)
    │
    └── profiles          (auto-created on signup via trigger)

categories ──┐
             │
products ────┤
             │
             ├── cart_items      (user × product × size × color)
             ├── wishlist_items  (user × product)
             ├── order_items     (order × product)
             └── reviews         (user × product, one per user)

orders ──── order_items
```

## Row Level Security

All tables have RLS enabled:
- **products / categories**: Public read, no write from clients
- **profiles / cart / wishlist / orders**: Users can only access their own data
- **reviews**: Public read, authenticated write (one per user per product)
- The Railway backend uses the **service role key** to bypass RLS when needed
