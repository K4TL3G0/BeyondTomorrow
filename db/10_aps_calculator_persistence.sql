-- =====================================================================
-- Beyond Tomorrow | 10_aps_calculator_persistence.sql
-- Run AFTER 08_subjects_and_marks.sql.
--
-- Adds the calculator's counted flag, fills gaps in its subject catalog,
-- and provides an atomic owner-only save operation for calculator rows.
-- =====================================================================

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'student_marks'
      and column_name = 'counted'
  ) then
    alter table public.student_marks
      add column counted boolean not null default true;

    update public.student_marks sm
    set counted = false
    from public.subjects s
    where sm.subject_id = s.id
      and s.code = 'LO';
  end if;
end;
$$;

insert into public.subjects (code, name) values
  ('SASLFAL', 'South African Sign Language First Additional Language'),
  ('AFRSAL', 'Afrikaans Second Additional Language'),
  ('ZULUSAL', 'isiZulu Second Additional Language'),
  ('XHOSASAL', 'isiXhosa Second Additional Language'),
  ('SEPEDISAL', 'Sepedi Second Additional Language'),
  ('SESOTHOSAL', 'Sesotho Second Additional Language'),
  ('TSWANASAL', 'Setswana Second Additional Language'),
  ('TSONGASAL', 'Xitsonga Second Additional Language'),
  ('VENDASAL', 'Tshivenda Second Additional Language'),
  ('SWATISAL', 'siSwati Second Additional Language'),
  ('NDEBELESAL', 'isiNdebele Second Additional Language'),
  ('SASLSAL', 'South African Sign Language Second Additional Language'),
  ('ARABSAL', 'Arabic Second Additional Language'),
  ('FRENCHSAL', 'French Second Additional Language'),
  ('GERMANSAL', 'German Second Additional Language'),
  ('GUJRSAL', 'Gujarati Second Additional Language'),
  ('HEBRSAL', 'Hebrew Second Additional Language'),
  ('HINDISAL', 'Hindi Second Additional Language'),
  ('ITALSAL', 'Italian Second Additional Language'),
  ('LATINSAL', 'Latin Second Additional Language'),
  ('MANDSAL', 'Mandarin Second Additional Language'),
  ('GREEKSAL', 'Modern Greek Second Additional Language'),
  ('PORTSAL', 'Portuguese Second Additional Language'),
  ('SERBSAL', 'Serbian Second Additional Language'),
  ('SPANSAL', 'Spanish Second Additional Language'),
  ('TAMILSAL', 'Tamil Second Additional Language'),
  ('TELUGUSAL', 'Telugu Second Additional Language'),
  ('URDUSAL', 'Urdu Second Additional Language'),
  ('DANCE', 'Dance Studies'),
  ('DESIGN', 'Design'),
  ('DRAM', 'Dramatic Arts'),
  ('MUSIC', 'Music'),
  ('RELST', 'Religious Studies'),
  ('MECHTECH', 'Mechanical Technology'),
  ('MARSCI', 'Marine Sciences'),
  ('AGRMGT', 'Agricultural Management Practices'),
  ('AGRTECH', 'Agricultural Technology')
on conflict (code) do nothing;

update public.subjects
set name = 'Xitsonga Second Additional Language'
where code = 'TSONGASAL';

update public.subjects
set name = 'Religious Studies'
where code = 'RELST';

update public.subjects
set name = 'Xitsonga Home Language'
where code = 'TSONGAHL';

update public.subjects
set name = 'Xitsonga First Additional Language'
where code = 'TSONGAFAL';

create or replace function public.save_student_marks(p_marks jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_student_id uuid := (select auth.uid());
begin
  if v_student_id is null then
    raise exception 'Sign in to save your subjects and marks.';
  end if;

  if jsonb_typeof(p_marks) is distinct from 'array' then
    raise exception 'Saved subjects must be provided as a list.';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_marks) as item(entry)
    where jsonb_typeof(entry) is distinct from 'object'
       or jsonb_typeof(entry -> 'code') is distinct from 'string'
       or coalesce(entry ->> 'code', '') = ''
       or jsonb_typeof(entry -> 'mark') is distinct from 'null'
          and (
            jsonb_typeof(entry -> 'mark') is distinct from 'number'
            or coalesce(entry ->> 'mark', '') !~ '^(100|[0-9]{1,2})$'
          )
       or jsonb_typeof(entry -> 'counted') is distinct from 'boolean'
  ) then
    raise exception 'Each subject needs a code, a whole-number mark from 0 to 100 or no mark, and a counted setting.';
  end if;

  if exists (
    select entry ->> 'code'
    from jsonb_array_elements(p_marks) as item(entry)
    group by entry ->> 'code'
    having count(*) > 1
  ) then
    raise exception 'A subject can only be saved once.';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_marks) as item(entry)
    left join public.subjects s on s.code = entry ->> 'code'
    where s.id is null
  ) then
    raise exception 'One or more subjects are not in the subject catalog.';
  end if;

  insert into public.student_profiles (id)
  values (v_student_id)
  on conflict (id) do nothing;

  delete from public.student_marks sm
  where sm.student_id = v_student_id
    and not exists (
      select 1
      from jsonb_array_elements(p_marks) as item(entry)
      join public.subjects s on s.code = entry ->> 'code'
      where s.id = sm.subject_id
    );

  insert into public.student_marks (student_id, subject_id, mark, counted)
  select
    v_student_id,
    s.id,
    case when jsonb_typeof(item.entry -> 'mark') = 'null'
      then null else (item.entry ->> 'mark')::integer end,
    (item.entry ->> 'counted')::boolean
  from jsonb_array_elements(p_marks) as item(entry)
  join public.subjects s on s.code = item.entry ->> 'code'
  on conflict (student_id, subject_id) do update
    set mark = excluded.mark,
        counted = excluded.counted;
end;
$$;

revoke all on function public.save_student_marks(jsonb) from public, anon;
grant execute on function public.save_student_marks(jsonb) to authenticated;
