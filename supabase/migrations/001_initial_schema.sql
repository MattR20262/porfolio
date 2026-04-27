-- ─────────────────────────────────────────────────────────────
-- PHOTOGRAPHER STUDIO — INITIAL SCHEMA
-- Run this in Supabase SQL Editor or via Supabase CLI
-- ─────────────────────────────────────────────────────────────

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── COLLECTIONS ───────────────────────────────────────────────
create table public.collections (
  id                    uuid primary key default uuid_generate_v4(),
  name                  text not null,
  slug                  text not null unique,
  description           text,
  cover_image           text,
  cover_image_public_id text,
  featured              boolean not null default false,
  visible               boolean not null default true,
  sort_order            integer not null default 0,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ── PROJECTS ──────────────────────────────────────────────────
create table public.projects (
  id                    uuid primary key default uuid_generate_v4(),
  title                 text not null,
  slug                  text not null unique,
  short_description     text,
  full_description      text,
  category              text not null default 'portraits',
  collection_id         uuid references public.collections(id) on delete set null,
  cover_image           text,
  cover_image_public_id text,
  featured              boolean not null default false,
  published             boolean not null default false,
  location              text,
  shoot_date            date,
  client_name           text,
  seo_title             text,
  seo_description       text,
  sort_order            integer not null default 0,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ── PROJECT MEDIA ─────────────────────────────────────────────
create table public.project_media (
  id           uuid primary key default uuid_generate_v4(),
  project_id   uuid not null references public.projects(id) on delete cascade,
  media_type   text not null check (media_type in ('image', 'video')),
  url          text not null,
  public_id    text not null,
  alt_text     text,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);

-- ── MEDIA LIBRARY ─────────────────────────────────────────────
create table public.media_assets (
  id            uuid primary key default uuid_generate_v4(),
  filename      text not null,
  url           text not null,
  public_id     text not null unique,
  resource_type text not null default 'image' check (resource_type in ('image', 'video')),
  format        text not null,
  size          bigint not null default 0,
  width         integer,
  height        integer,
  alt_text      text,
  project_id    uuid references public.projects(id) on delete set null,
  created_at    timestamptz not null default now()
);

-- ── BOOKINGS ──────────────────────────────────────────────────
create table public.bookings (
  id           uuid primary key default uuid_generate_v4(),
  full_name    text not null,
  email        text not null,
  phone        text,
  service_type text not null,
  event_date   date,
  location     text,
  budget       text,
  message      text not null,
  status       text not null default 'new' check (status in ('new','pending','confirmed','completed','archived')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── CONTACT MESSAGES ──────────────────────────────────────────
create table public.contact_messages (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  email      text not null,
  subject    text,
  message    text not null,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── TESTIMONIALS ──────────────────────────────────────────────
create table public.testimonials (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  role_or_event text,
  quote        text not null,
  image        text,
  featured     boolean not null default false,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);

-- ── SITE CONTENT (CMS) ────────────────────────────────────────
create table public.site_content (
  id         uuid primary key default uuid_generate_v4(),
  key        text not null unique,
  value      text not null default '',
  type       text not null default 'text' check (type in ('text','html','url')),
  updated_at timestamptz not null default now()
);

-- ── SEED SITE CONTENT ─────────────────────────────────────────
insert into public.site_content (key, value, type) values
  ('hero_eyebrow',      'Visual Storyteller · New York · Available Worldwide', 'text'),
  ('hero_title',        'Capturing Moments That Last Forever', 'text'),
  ('hero_subtitle',     'Luxury photography for weddings, portraits, fashion, and editorial — crafted with intention.', 'text'),
  ('hero_cta_primary',  'View Portfolio', 'text'),
  ('hero_cta_secondary','Book a Session', 'text'),
  ('brand_statement',   'Every frame is a decision. Every light is intentional. Every moment — irreplaceable.', 'text'),
  ('about_name',        'Matthew Ashford', 'text'),
  ('about_tagline',     'Photographer · Director · Visual Artist', 'text'),
  ('about_bio_1',       'Based in New York City, Matthew Ashford is a luxury photographer with over a decade of experience crafting cinematic imagery for weddings, editorial, and commercial clients across the globe.', 'text'),
  ('about_bio_2',       'His work has appeared in Vogue, Harper''s Bazaar, and The New York Times. He believes photography is not about capturing what exists — it is about revealing what feels true.', 'text'),
  ('contact_email',     'hello@mattstudio.com', 'text'),
  ('contact_phone',     '+1 (917) 555-0142', 'text'),
  ('contact_location',  'New York City, NY — Available Worldwide', 'text'),
  ('social_instagram',  'https://instagram.com/mattstudio', 'url'),
  ('social_tiktok',     'https://tiktok.com/@mattstudio', 'url'),
  ('social_pinterest',  '', 'url'),
  ('social_linkedin',   '', 'url'),
  ('seo_title',         'Matt Ashford — Luxury Photographer | New York', 'text'),
  ('seo_description',   'Award-winning luxury photographer based in New York. Specializing in weddings, portraits, fashion, and editorial photography worldwide.', 'text');

-- ── SEED TESTIMONIALS ─────────────────────────────────────────
insert into public.testimonials (name, role_or_event, quote, featured, sort_order) values
  ('Sofia & Marco', 'Wedding — Santorini, 2025', 'Matthew captured every emotion with such grace. Our wedding album is a work of art. We cry happy tears every time we look at it.', true, 1),
  ('Lena Torres', 'Portrait Session — NYC, 2025', 'I came in nervous and left feeling like a model. His ability to make you feel completely at ease in front of the camera is unmatched.', true, 2),
  ('Remy Dufour', 'Vogue Editorial — Paris, 2024', 'Working with Matthew was effortless. He understands light and mood in a way very few photographers do. Absolutely world-class.', true, 3);

-- ── SEED COLLECTIONS ─────────────────────────────────────────
insert into public.collections (name, slug, description, featured, visible, sort_order) values
  ('Signature Weddings', 'weddings', 'Cinematic full-day coverage for intimate and grand celebrations alike.', true, true, 1),
  ('Editorial & Fashion', 'fashion', 'High-concept editorial for agencies, brands, and publications.', true, true, 2),
  ('Intimate Portraits', 'portraits', 'Personal, honest, and quietly cinematic portrait sessions.', false, true, 3),
  ('Street & Documentary', 'street', 'Commissioned documentary and street photography projects.', false, true, 4),
  ('Events & Galas', 'events', 'Corporate galas, launches, celebrations, and private events.', false, true, 5),
  ('Destinations', 'destinations', 'Luxury destination shoots across 28 countries.', true, true, 6);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────
-- Public can read published projects, collections, testimonials, content
alter table public.projects        enable row level security;
alter table public.project_media   enable row level security;
alter table public.collections     enable row level security;
alter table public.media_assets    enable row level security;
alter table public.bookings        enable row level security;
alter table public.contact_messages enable row level security;
alter table public.testimonials    enable row level security;
alter table public.site_content    enable row level security;

-- Public read policies
create policy "Public can read published projects" on public.projects
  for select using (published = true);

create policy "Public can read project media" on public.project_media
  for select using (true);

create policy "Public can read visible collections" on public.collections
  for select using (visible = true);

create policy "Public can read testimonials" on public.testimonials
  for select using (true);

create policy "Public can read site content" on public.site_content
  for select using (true);

-- Anyone can insert bookings and messages (public forms)
create policy "Anyone can submit booking" on public.bookings
  for insert with check (true);

create policy "Anyone can submit message" on public.contact_messages
  for insert with check (true);

-- Authenticated admin full access
create policy "Admin full access to projects" on public.projects
  for all using (auth.role() = 'authenticated');

create policy "Admin full access to project_media" on public.project_media
  for all using (auth.role() = 'authenticated');

create policy "Admin full access to collections" on public.collections
  for all using (auth.role() = 'authenticated');

create policy "Admin full access to media_assets" on public.media_assets
  for all using (auth.role() = 'authenticated');

create policy "Admin full access to bookings" on public.bookings
  for all using (auth.role() = 'authenticated');

create policy "Admin full access to messages" on public.contact_messages
  for all using (auth.role() = 'authenticated');

create policy "Admin full access to testimonials" on public.testimonials
  for all using (auth.role() = 'authenticated');

create policy "Admin full access to site_content" on public.site_content
  for all using (auth.role() = 'authenticated');

-- ── UPDATED_AT TRIGGER ────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on public.projects
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.collections
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.bookings
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.site_content
  for each row execute function public.handle_updated_at();
