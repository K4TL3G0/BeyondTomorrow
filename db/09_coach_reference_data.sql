-- =====================================================================
-- Beyond Tomorrow | 09_coach_reference_data.sql
-- Run AFTER 08_subjects_and_marks.sql.
--
-- Adds the verified, admin-curated reference data used by the NSFAS
-- paperwork readiness coach. This migration intentionally seeds no rules:
-- add them only after their sources and verification status are checked.
-- =====================================================================

begin;

create table if not exists public.document_types (
  code             text primary key check (char_length(code) between 1 and 60),
  name             text not null,
  summary          text not null default '',
  who_signs        text,
  special_category boolean not null default false,
  est_days         int not null default 1 check (est_days >= 0),
  depends_on       text[] not null default '{}',
  official_url     text,
  sort_order       int not null default 0,
  source_url       text,
  last_verified    date,
  verification     text not null check (verification in ('official','reported','secondary','conflict')),
  updated_at       timestamptz not null default now(),
  updated_by       uuid references auth.users (id) on delete set null
);

create table if not exists public.document_rules (
  id             uuid primary key default gen_random_uuid(),
  document_code  text not null references public.document_types (code) on delete cascade,
  route_codes    text[] not null,
  when_cond      jsonb not null,
  on_unknown     text not null default 'include' check (on_unknown in ('include','exclude')),
  reason_text    text not null,
  priority       int not null default 0,
  source_url     text,
  last_verified  date,
  verification   text not null check (verification in ('official','reported','secondary','conflict')),
  updated_at     timestamptz not null default now(),
  updated_by     uuid references auth.users (id) on delete set null
);

create table if not exists public.document_checks (
  id             uuid primary key default gen_random_uuid(),
  document_code  text not null references public.document_types (code) on delete cascade,
  check_code     text not null check (char_length(check_code) between 1 and 60),
  label          text not null,
  why_it_fails   text not null default '',
  sort_order     int not null default 0,
  show_when      jsonb,
  source_url     text,
  last_verified  date,
  verification   text not null check (verification in ('official','reported','secondary','conflict')),
  updated_at     timestamptz not null default now(),
  updated_by     uuid references auth.users (id) on delete set null,
  unique (document_code, check_code)
);

create table if not exists public.fix_clocks (
  id             uuid primary key default gen_random_uuid(),
  student_id     uuid not null references public.student_profiles (id) on delete cascade,
  funding_name   text not null check (char_length(funding_name) between 1 and 120),
  kind           text not null check (kind in ('documents','appeal')),
  notified_on    date not null,
  window_days    int not null default 30 check (window_days between 1 and 90),
  outstanding_docs text[] not null default '{}',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  updated_by     uuid references auth.users (id) on delete set null,
  unique (student_id, funding_name, kind)
);

alter table public.funding_sources
  add column if not exists verification text
  check (verification in ('official','reported','secondary','conflict'));

update public.funding_sources
   set verification = 'conflict'
 where name = 'NSFAS Bursary'
   and verification is null
   and deadline is not null;

create index if not exists idx_document_rules_document on public.document_rules (document_code);
create index if not exists idx_document_checks_document on public.document_checks (document_code);
create index if not exists idx_fix_clocks_student on public.fix_clocks (student_id);

do $$
declare t text;
begin
  foreach t in array array['document_types','document_rules','document_checks']
  loop
    execute format('drop trigger if exists touch_audit on public.%I', t);
    execute format('create trigger touch_audit before insert or update on public.%I
                    for each row execute function public.touch_audit()', t);
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('create policy "public read" on public.%I
                    for select to anon, authenticated using (true)', t);

    execute format('drop policy if exists "admin insert" on public.%I', t);
    execute format('create policy "admin insert" on public.%I
                    for insert to authenticated with check ((select public.is_admin()))', t);

    execute format('drop policy if exists "admin update" on public.%I', t);
    execute format('create policy "admin update" on public.%I
                    for update to authenticated
                    using ((select public.is_admin()))
                    with check ((select public.is_admin()))', t);

    execute format('drop policy if exists "admin delete" on public.%I', t);
    execute format('create policy "admin delete" on public.%I
                    for delete to authenticated using ((select public.is_admin()))', t);
  end loop;

  execute 'alter table public.fix_clocks enable row level security';
  execute 'drop policy if exists "own rows" on public.fix_clocks';
  execute 'create policy "own rows" on public.fix_clocks
           for all to authenticated
           using (student_id = (select auth.uid()))
           with check (student_id = (select auth.uid()))';
end $$;

grant select on public.document_types, public.document_rules, public.document_checks to anon, authenticated;
grant insert, update, delete on public.document_types, public.document_rules,
  public.document_checks to authenticated;
revoke insert, update, delete on public.document_types, public.document_rules,
  public.document_checks from public, anon;
grant select, insert, update, delete on public.fix_clocks to authenticated;
revoke all on public.fix_clocks from public, anon;

create or replace function public.reject_special_readiness_progress()
returns trigger
language plpgsql
set search_path = ''
as $$
declare is_special boolean;
begin
  select special_category into is_special
    from public.document_types
   where code = new.document_code;

  if coalesce(is_special, false) then
    raise exception 'Special-category document progress cannot be stored';
  end if;
  return new;
end;
$$;

drop trigger if exists reject_special_readiness_progress on public.readiness_progress;
create trigger reject_special_readiness_progress
  before insert or update on public.readiness_progress
  for each row execute function public.reject_special_readiness_progress();

create or replace function public.reject_special_fix_clock_docs()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  doc_code text;
  is_special boolean;
begin
  foreach doc_code in array new.outstanding_docs
  loop
    select special_category into is_special
      from public.document_types
     where code = doc_code;
    if not found then
      raise exception 'Unknown document code in fix clock: %', doc_code;
    end if;
    if is_special then
      raise exception 'Special-category document codes cannot be stored in a fix clock';
    end if;
  end loop;
  return new;
end;
$$;

drop trigger if exists reject_special_fix_clock_docs on public.fix_clocks;
create trigger reject_special_fix_clock_docs
  before insert or update on public.fix_clocks
  for each row execute function public.reject_special_fix_clock_docs();

drop trigger if exists touch_audit on public.fix_clocks;
create trigger touch_audit before insert or update on public.fix_clocks
  for each row execute function public.touch_audit();

commit;
