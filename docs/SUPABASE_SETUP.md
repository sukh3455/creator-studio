# Supabase Database & Auth Setup Guide

Creator Studio uses Supabase for storing project metadata, scene configurations, asset catalogs, and asynchronous render job tracking.

---

## 1. Create a Free Supabase Project

1. Visit [https://supabase.com/dashboard](https://supabase.com/dashboard) and sign in or create an account.
2. Click **New Project**.
3. Choose an Organization, set a Project Name (e.g., `creator-studio`), set a Database Password, and select your preferred AWS/GCP region.
4. Click **Create new project** and wait ~1 minute for provisioning.

---

## 2. Run Database Migrations

1. In your Supabase project dashboard, navigate to the **SQL Editor** tab on the left sidebar.
2. Click **New Query**.
3. Open [`supabase/migrations/20261026000000_creator_studio_schema.sql`](../supabase/migrations/20261026000000_creator_studio_schema.sql) in this repository.
4. Copy the entire file contents and paste them into the SQL Editor.
5. Click **Run** (or press `Cmd/Ctrl + Enter`).
6. You will see:
   - `public.projects` created with indexes.
   - `public.assets` created with foreign key constraints.
   - `public.render_jobs` created with status constraints.
   - Row Level Security (RLS) policies enabled.

---

## 3. Retrieve API Credentials

1. Navigate to **Project Settings** > **API**.
2. Locate:
   - **Project URL**: `https://<project-ref>.supabase.co`
   - **Project API Keys**: Copy the **`anon` (public)** key.
3. Add these to Creator Studio via the **Settings Modal > Supabase DB** or `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   ```
