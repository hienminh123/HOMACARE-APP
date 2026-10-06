-- Run once in the Supabase SQL Editor for the HOMACARE project.
begin;
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 100),
  role text not null check (role in ('family','caregiver','coordinator')),
  created_at timestamptz not null default now()
);
create table if not exists public.relatives (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.profiles(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 100),
  relationship text not null check (char_length(relationship) between 1 and 30),
  age integer not null check (age between 18 and 120),
  area text not null check (char_length(area) between 2 and 200),
  preferences text not null default '' check (char_length(preferences) <= 2000),
  created_at timestamptz not null default now()
);
create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.profiles(id),
  relative_id uuid not null references public.relatives(id),
  caregiver_id uuid references public.profiles(id),
  care_date date not null,
  status text not null default 'pending' check (status in ('pending','assigned','in_progress','completed')),
  care_note text not null default '' check (char_length(care_note) <= 2000),
  tasks boolean[] not null default array[false,false,false,false] check (cardinality(tasks) = 4),
  mood text check (mood in ('Sinh hoạt như thường ngày','Có điều gia đình cần lưu ý','Cần điều phối viên liên hệ')),
  report_text text check (char_length(report_text) between 10 and 4000),
  next_note text not null default '' check (char_length(next_note) <= 2000),
  rating integer check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  assigned_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  constraint visit_completion check (status <> 'completed' or (report_text is not null and started_at is not null and completed_at is not null and tasks = array[true,true,true,true])),
  constraint visit_assignment check (status = 'pending' or caregiver_id is not null)
);
create index if not exists visits_family_date on public.visits(family_id, care_date);
create index if not exists visits_caregiver_date on public.visits(caregiver_id, care_date);
create unique index if not exists visits_unique_caregiver_evening on public.visits(caregiver_id, care_date) where caregiver_id is not null;
create unique index if not exists visits_unique_relative_evening on public.visits(relative_id, care_date);

create or replace function public.current_homa_role() returns text
language sql stable security definer set search_path = ''
as $$ select role from public.profiles where id = auth.uid(); $$;
revoke all on function public.current_homa_role() from public, anon;
grant execute on function public.current_homa_role() to authenticated;

create or replace function public.create_homa_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
declare chosen_role text; chosen_name text;
begin
  chosen_role := new.raw_user_meta_data->>'role';
  if chosen_role is null or chosen_role not in ('family','caregiver') then chosen_role := 'family'; end if;
  chosen_name := trim(coalesce(new.raw_user_meta_data->>'full_name', 'Thành viên HomaCare'));
  if char_length(chosen_name) < 2 then chosen_name := 'Thành viên HomaCare'; end if;
  insert into public.profiles(id, full_name, role) values (new.id, left(chosen_name,100), chosen_role);
  return new;
end; $$;
revoke all on function public.create_homa_profile() from public, anon, authenticated;
drop trigger if exists on_homa_user_created on auth.users;
create trigger on_homa_user_created after insert on auth.users for each row execute function public.create_homa_profile();

alter table public.profiles enable row level security;
alter table public.relatives enable row level security;
alter table public.visits enable row level security;
revoke all on public.profiles, public.relatives, public.visits from anon, authenticated;
grant select on public.profiles, public.relatives, public.visits to authenticated;
grant insert on public.relatives to authenticated;
drop policy if exists homa_read_profiles on public.profiles;
create policy homa_read_profiles on public.profiles for select to authenticated using (
  id = auth.uid() or public.current_homa_role() = 'coordinator' or exists (
    select 1 from public.visits v where (v.family_id = auth.uid() and v.caregiver_id = profiles.id)
    or (v.caregiver_id = auth.uid() and v.family_id = profiles.id)
  )
);
drop policy if exists homa_read_relatives on public.relatives;
create policy homa_read_relatives on public.relatives for select to authenticated using (
  family_id = auth.uid() or public.current_homa_role() = 'coordinator'
  or exists (select 1 from public.visits v where v.relative_id = relatives.id and v.caregiver_id = auth.uid())
);
drop policy if exists homa_add_relative on public.relatives;
create policy homa_add_relative on public.relatives for insert to authenticated with check (
  family_id = auth.uid() and public.current_homa_role() = 'family'
);
drop policy if exists homa_read_visits on public.visits;
create policy homa_read_visits on public.visits for select to authenticated using (
  family_id = auth.uid() or caregiver_id = auth.uid() or public.current_homa_role() = 'coordinator'
);

create or replace function public.book_homa_visit(p_relative_id uuid, p_care_date date, p_note text default '') returns uuid
language plpgsql security definer set search_path = '' as $$
declare result_id uuid;
begin
  if public.current_homa_role() is distinct from 'family' then raise exception 'not_allowed'; end if;
  if not exists (select 1 from public.relatives where id=p_relative_id and family_id=auth.uid()) then raise exception 'not_allowed'; end if;
  if p_care_date is null or p_care_date < (now() at time zone 'Asia/Ho_Chi_Minh')::date then raise exception 'invalid_date'; end if;
  insert into public.visits(family_id, relative_id, care_date, care_note) values (auth.uid(), p_relative_id, p_care_date, coalesce(p_note,'')) returning id into result_id;
  return result_id;
end; $$;

create or replace function public.assign_homa_visit(p_visit_id uuid, p_caregiver_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare current_visit public.visits;
begin
  if public.current_homa_role() is distinct from 'coordinator' then raise exception 'not_allowed'; end if;
  select * into current_visit from public.visits where id=p_visit_id for update;
  if current_visit.id is null or current_visit.status <> 'pending' then raise exception 'invalid_state'; end if;
  if not exists (select 1 from public.profiles where id=p_caregiver_id and role='caregiver') then raise exception 'invalid_caregiver'; end if;
  update public.visits set caregiver_id=p_caregiver_id, status='assigned', assigned_at=now() where id=p_visit_id;
end; $$;

create or replace function public.start_homa_visit(p_visit_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare current_visit public.visits;
begin
  if public.current_homa_role() is distinct from 'caregiver' then raise exception 'not_allowed'; end if;
  select * into current_visit from public.visits where id=p_visit_id for update;
  if current_visit.id is null or current_visit.caregiver_id is distinct from auth.uid() then raise exception 'not_allowed'; end if;
  if current_visit.status <> 'assigned' then raise exception 'invalid_state'; end if;
  update public.visits set status='in_progress', started_at=now() where id=p_visit_id;
end; $$;

create or replace function public.complete_homa_visit(p_visit_id uuid, p_tasks boolean[], p_mood text, p_report text, p_next_note text default '') returns void
language plpgsql security definer set search_path = '' as $$
declare current_visit public.visits;
begin
  if public.current_homa_role() is distinct from 'caregiver' then raise exception 'not_allowed'; end if;
  select * into current_visit from public.visits where id=p_visit_id for update;
  if current_visit.id is null or current_visit.caregiver_id is distinct from auth.uid() then raise exception 'not_allowed'; end if;
  if current_visit.status <> 'in_progress' then raise exception 'invalid_state'; end if;
  if p_tasks is distinct from array[true,true,true,true] then raise exception 'incomplete_tasks'; end if;
  if p_report is null or char_length(trim(p_report)) < 10 then raise exception 'invalid_report'; end if;
  update public.visits set tasks=p_tasks, mood=p_mood, report_text=trim(p_report), next_note=coalesce(p_next_note,''), status='completed', completed_at=now() where id=p_visit_id;
end; $$;

create or replace function public.rate_homa_visit(p_visit_id uuid, p_rating integer) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if public.current_homa_role() is distinct from 'family' then raise exception 'not_allowed'; end if;
  if p_rating is null or p_rating not between 1 and 5 then raise exception 'invalid_rating'; end if;
  update public.visits set rating=p_rating where id=p_visit_id and family_id=auth.uid() and status='completed';
  if not found then raise exception 'not_allowed'; end if;
end; $$;

revoke all on function public.book_homa_visit(uuid,date,text), public.assign_homa_visit(uuid,uuid), public.start_homa_visit(uuid), public.complete_homa_visit(uuid,boolean[],text,text,text), public.rate_homa_visit(uuid,integer) from public, anon;
grant execute on function public.book_homa_visit(uuid,date,text), public.assign_homa_visit(uuid,uuid), public.start_homa_visit(uuid), public.complete_homa_visit(uuid,boolean[],text,text,text), public.rate_homa_visit(uuid,integer) to authenticated;
commit;
