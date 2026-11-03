
-- ============================================================
-- BLUE TEAM | WAT RATCHABOPHIT
-- Supabase Database Schema
-- ============================================================

-- 1. EXTENSIONS

create extension if not exists pgcrypto;


-- ============================================================
-- 2. CREATE TABLES
-- ============================================================

create table if not exists public.sports (
  id text primary key,
  name text not null,
  category text not null
    check (category in (
      'team',
      'individual',
      'athletics',
      'aquatics'
    )),
  icon text default 'medal',
  note text default '',
  divisions jsonb not null default '[]'::jsonb,
  line_url text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.athletes (
  id uuid primary key default gen_random_uuid(),
  sport_id text not null
    references public.sports(id)
    on update cascade
    on delete restrict,
  name text not null
    check (char_length(name) between 1 and 100),
  grade text not null,
  room text default '',
  event_label text default '',
  note text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key
    references auth.users(id)
    on delete cascade,
  created_at timestamptz not null default now()
);


-- ============================================================
-- 3. API PERMISSIONS
-- ============================================================

grant usage on schema public
to anon, authenticated;

-- Public reading permissions
grant select on public.sports
to anon, authenticated;

grant select on public.athletes
to anon, authenticated;

-- Authenticated write permissions
-- RLS determines who can actually write.
grant insert, update, delete
on public.sports
to authenticated;

grant insert, update, delete
on public.athletes
to authenticated;

-- Admin permission lookup
grant select on public.admin_users
to authenticated;

-- Prevent direct client-side changes to admin accounts
revoke all on public.admin_users from anon;

revoke insert, update, delete
on public.admin_users from authenticated;


-- ============================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ============================================================

alter table public.sports
enable row level security;

alter table public.athletes
enable row level security;

alter table public.admin_users
enable row level security;


-- ============================================================
-- 5. ADMIN USERS POLICIES
-- ============================================================

drop policy if exists
  "Admins read own admin record"
on public.admin_users;

create policy "Admins read own admin record"
on public.admin_users
for select
to authenticated
using (
  user_id = (select auth.uid())
);


-- ============================================================
-- 6. SPORTS POLICIES
-- ============================================================

-- Public users can read active sports.
-- Admins can also read inactive sports.

drop policy if exists
  "Public read active sports"
on public.sports;

create policy "Public read active sports"
on public.sports
for select
to anon, authenticated
using (
  active = true
  or exists (
    select 1
    from public.admin_users au
    where au.user_id = (select auth.uid())
  )
);

-- Only admins can create, update, and delete sports.

drop policy if exists
  "Admins manage sports"
on public.sports;

create policy "Admins manage sports"
on public.sports
for all
to authenticated
using (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = (select auth.uid())
  )
);


-- ============================================================
-- 7. ATHLETES POLICIES
-- ============================================================

-- Public users can read athletes belonging to active sports.
-- Admins can also read athletes of inactive sports.

drop policy if exists
  "Public read athletes"
on public.athletes;

create policy "Public read athletes"
on public.athletes
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.sports s
    where s.id = sport_id
      and s.active = true
  )
);

-- Only admins can manage athlete records.

drop policy if exists
  "Admins manage athletes"
on public.athletes;

create policy "Admins manage athletes"
on public.athletes
for all
to authenticated
using (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = (select auth.uid())
  )
);


-- ============================================================
-- 8. AUTOMATIC UPDATED_AT
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists
  trg_sports_updated_at
on public.sports;

create trigger trg_sports_updated_at
before update on public.sports
for each row
execute function public.set_updated_at();

drop trigger if exists
  trg_athletes_updated_at
on public.athletes;

create trigger trg_athletes_updated_at
before update on public.athletes
for each row
execute function public.set_updated_at();


-- ============================================================
-- 9. SEED SPORTS DATA (16 SPORTS)
-- ============================================================

insert into public.sports (
  id,
  name,
  category,
  icon,
  note,
  divisions,
  sort_order
)
values

(
  'football',
  'ฟุตบอล',
  'team',
  'circle-dot',
  'รอประกาศรายละเอียดรุ่นการแข่งขัน',
  '["ม.1","ม.2-3","ม.4-5"]',
  1
),

(
  'basketball',
  'บาสเกตบอล',
  'team',
  'circle-dot',
  'ม.1 ไม่สามารถลงแข่งขันได้',
  '["ม.2-3","ม.4-5"]',
  2
),

(
  'takraw',
  'เซปักตะกร้อ',
  'team',
  'circle-dot',
  'ม.1 ไม่สามารถลงแข่งขันได้',
  '["ม.2-3","ม.4-5"]',
  3
),

(
  'volleyball',
  'วอลเลย์บอล',
  'team',
  'circle-dot',
  'รวมทุกระดับ ไม่มีแบ่งแยก',
  '["รวมทุกระดับ"]',
  4
),

(
  'table-tennis',
  'เทเบิลเทนนิส',
  'individual',
  'table-tennis',
  'ประเภทเดี่ยว',
  '["ม.1","ม.2-3","ม.4-5"]',
  5
),

(
  'badminton',
  'แบดมินตัน',
  'individual',
  'activity',
  'ประเภทเดี่ยว / คู่',
  '["ม.1","ม.2-3","ม.4-5"]',
  6
),

(
  'run-50',
  'กรีฑา 50 เมตร',
  'athletics',
  'timer',
  'วิ่งระยะ 50 เมตร',
  '["ม.1","ม.2-3","ม.4-5"]',
  7
),

(
  'run-100',
  'กรีฑา 100 เมตร',
  'athletics',
  'timer',
  'วิ่งระยะ 100 เมตร',
  '["ม.1","ม.2-3","ม.4-5"]',
  8
),

(
  'run-200',
  'กรีฑา 200 เมตร',
  'athletics',
  'timer',
  'วิ่งระยะ 200 เมตร',
  '["ม.1","ม.2-3","ม.4-5"]',
  9
),

(
  'relay-4x50',
  'กรีฑา 4×50 เมตร',
  'athletics',
  'route',
  'วิ่งผลัด 4×50 เมตร',
  '["ม.1","ม.2-3","ม.4-5"]',
  10
),

(
  'relay-8x25',
  'กรีฑา 8×25 เมตร',
  'athletics',
  'route',
  'วิ่งผลัด 8×25 เมตร',
  '["ม.1","ม.2-3","ม.4-5"]',
  11
),

(
  'swim-25',
  'ว่ายน้ำ 25 เมตร',
  'aquatics',
  'waves',
  'แบ่งรุ่น ม.1–ม.3 และ ม.4–ม.5',
  '["ม.1-ม.3","ม.4-ม.5"]',
  12
),

(
  'swim-50',
  'ว่ายน้ำ 50 เมตร',
  'aquatics',
  'waves',
  'แบ่งรุ่น ม.1–ม.3 และ ม.4–ม.5',
  '["ม.1-ม.3","ม.4-ม.5"]',
  13
),

(
  'swim-relay-4x25',
  'ว่ายน้ำ 4×25 เมตร',
  'aquatics',
  'waves',
  'แบ่งรุ่น ม.1–ม.3 และ ม.4–ม.5',
  '["ม.1-ม.3","ม.4-ม.5"]',
  14
),

(
  'swim-medley',
  'ว่ายน้ำ 4×25 เมตร ผลัดผสม',
  'aquatics',
  'waves',
  'แบ่งรุ่น ม.1–ม.3 และ ม.4–ม.5',
  '["ม.1-ม.3","ม.4-ม.5"]',
  15
),

(
  'swim-4x25-m1',
  'ว่ายน้ำ 4×25 เมตร (ม.1)',
  'aquatics',
  'waves',
  'สำหรับนักเรียนระดับ ม.1',
  '["ม.1"]',
  16
)

-- Do not overwrite sports edited by admins.
on conflict (id) do nothing;


-- ============================================================
-- 10. ENABLE SUPABASE REALTIME
-- ============================================================

do $$
begin

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'sports'
  ) then

    alter publication supabase_realtime
    add table public.sports;

  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'athletes'
  ) then

    alter publication supabase_realtime
    add table public.athletes;

  end if;

end $$;


-- ============================================================
-- 11. INDEXES
-- ============================================================

create index if not exists
  idx_athletes_sport_id
on public.athletes (sport_id);

create index if not exists
  idx_athletes_grade
on public.athletes (grade);

create index if not exists
  idx_sports_category
on public.sports (category);

create index if not exists
  idx_sports_sort_order
on public.sports (sort_order);


-- ============================================================
-- BLUE TEAM DATABASE SETUP COMPLETE
-- ============================================================
