-- ==============================================================================
-- CREATOR STUDIO — SUPABASE POSTGRESQL DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Projects Table
create table if not exists public.projects (
  id text primary key default ('proj_' || replace(uuid_generate_v4()::text, '-', '')),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  title text not null,
  prompt text not null,
  description text default '',
  duration integer not null default 15,
  aspect_ratio text not null default '9:16' check (aspect_ratio in ('9:16', '16:9', '1:1')),
  style_preset text not null default 'festive',
  brand_kit jsonb not null default '{}'::jsonb,
  scenes jsonb not null default '[]'::jsonb,
  status text not null default 'planned' check (status in ('draft', 'planning', 'planned', 'approved', 'rendering', 'completed', 'failed')),
  approved_at timestamptz,
  approved_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Assets Table
create table if not exists public.assets (
  id text primary key default ('asset_' || replace(uuid_generate_v4()::text, '-', '')),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  project_id text references public.projects(id) on delete cascade,
  name text not null,
  type text not null check (type in ('image', 'video', 'audio', 'logo', 'screenshot', 'recording')),
  url text not null,
  mime_type text not null,
  size bigint not null default 0,
  dimensions jsonb default '{"width": 0, "height": 0}'::jsonb,
  duration numeric default 0,
  trim jsonb default '{"start": 0, "end": 0}'::jsonb,
  crop jsonb default '{"x": 0, "y": 0, "width": 0, "height": 0, "fit": "cover"}'::jsonb,
  source text not null default 'user_upload' check (source in ('user_upload', 'web_capture', 'stock', 'generated')),
  license jsonb not null default '{"type": "Free Commercial"}'::jsonb,
  created_at timestamptz not null default now()
);

-- 3. Render Jobs Table
create table if not exists public.render_jobs (
  id text primary key default ('job_' || replace(uuid_generate_v4()::text, '-', '')),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  project_id text references public.projects(id) on delete cascade,
  target text not null default 'github_actions' check (target in ('browser', 'cloud_run', 'github_actions')),
  status text not null default 'pending' check (status in ('pending', 'rendering', 'completed', 'failed', 'cancelled')),
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  output_url text,
  format text not null default 'mp4' check (format in ('mp4', 'webm')),
  resolution jsonb not null default '{"width": 720, "height": 1280}'::jsonb,
  fps integer not null default 60,
  duration numeric not null default 15,
  retries integer not null default 0,
  logs text[] default array[]::text[],
  error text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- Indexes for performance
create index if not exists idx_projects_user_id on public.projects(user_id);
create index if not exists idx_projects_updated_at on public.projects(updated_at desc);
create index if not exists idx_assets_project_id on public.assets(project_id);
create index if not exists idx_render_jobs_project_id on public.render_jobs(project_id);
create index if not exists idx_render_jobs_status on public.render_jobs(status);

-- Enable Row Level Security (RLS)
alter table public.projects enable row level security;
alter table public.assets enable row level security;
alter table public.render_jobs enable row level security;

-- Policies for Projects
create policy "Users can read own projects or public demo projects" 
  on public.projects for select 
  using (auth.uid() = user_id or user_id is null);

create policy "Users can insert own projects" 
  on public.projects for insert 
  with check (auth.uid() = user_id or user_id is null);

create policy "Users can update own projects" 
  on public.projects for update 
  using (auth.uid() = user_id or user_id is null);

create policy "Users can delete own projects" 
  on public.projects for delete 
  using (auth.uid() = user_id or user_id is null);

-- Policies for Assets
create policy "Users can read own assets" 
  on public.assets for select 
  using (auth.uid() = user_id or user_id is null);

create policy "Users can insert own assets" 
  on public.assets for insert 
  with check (auth.uid() = user_id or user_id is null);

create policy "Users can update own assets" 
  on public.assets for update 
  using (auth.uid() = user_id or user_id is null);

create policy "Users can delete own assets" 
  on public.assets for delete 
  using (auth.uid() = user_id or user_id is null);

-- Policies for Render Jobs
create policy "Users can read own render jobs" 
  on public.render_jobs for select 
  using (auth.uid() = user_id or user_id is null);

create policy "Users can insert own render jobs" 
  on public.render_jobs for insert 
  with check (auth.uid() = user_id or user_id is null);

create policy "Users can update own render jobs" 
  on public.render_jobs for update 
  using (auth.uid() = user_id or user_id is null);
