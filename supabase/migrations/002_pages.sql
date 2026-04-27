-- ── CUSTOM PAGES ──────────────────────────────────────────────
create table public.pages (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  slug            text not null unique,
  content         text not null default '',
  published       boolean not null default false,
  show_in_nav     boolean not null default false,
  seo_title       text,
  seo_description text,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Public can read published pages
alter table public.pages enable row level security;

create policy "Public can read published pages" on public.pages
  for select using (published = true);

create policy "Admin full access to pages" on public.pages
  for all using (auth.role() = 'authenticated');

-- Auto-update updated_at
create trigger set_updated_at before update on public.pages
  for each row execute function public.handle_updated_at();
