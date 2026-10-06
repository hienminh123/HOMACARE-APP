-- Create each coordinator in Supabase Authentication first.
-- Change target_email below to that account's email, then run this query.
-- Only the project owner runs this SQL; it is never accessible in the website folder.
do $$
declare
  target_email text := 'minh30d@gmail.com';
  target_id uuid;
begin
  select id into target_id from auth.users where lower(email) = lower(trim(target_email));
  if target_id is null then raise exception 'Create the coordinator account in Authentication > Users first.'; end if;
  insert into public.profiles(id,full_name,role) values (target_id,'Điều phối viên HomaCare','coordinator')
  on conflict(id) do update set role='coordinator';
end; $$;
