import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const db = new PGlite();
const ids = Object.fromEntries(['family1','family2','caregiver1','caregiver2','coordinator','intruder'].map((name,i)=>[name,`00000000-0000-4000-8000-${String(i+1).padStart(12,'0')}`]));
let checks=0;
function equal(actual, expected, description) { assert.deepEqual(actual,expected,description); checks++; }
async function reject(operation, pattern, description) { await assert.rejects(operation,pattern,description); checks++; }
async function as(user, operation, role='authenticated') {
  await db.exec(`set role ${role}`);
  await db.query("select set_config('request.jwt.claim.sub',$1,false)",[ids[user] || '']);
  try { return await operation(); } finally { await db.exec('reset role'); }
}
try {
  await db.exec(`create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to anon,authenticated; grant execute on function auth.uid() to anon,authenticated; grant usage on schema public to anon,authenticated;`);
  await db.exec(await readFile(new URL('../backend/schema.sql',import.meta.url),'utf8'));
  for(const [name,id] of Object.entries(ids)) await db.query('insert into auth.users values ($1,$2,$3)',[id,`${name}@example.invalid`,JSON.stringify({full_name:name,role:name.startsWith('caregiver')?'caregiver':name==='intruder'?'coordinator':'family'})]);
  await db.query("update public.profiles set role='coordinator' where id=$1",[ids.coordinator]);
  equal((await db.query('select role from public.profiles where id=$1',[ids.intruder])).rows[0].role,'family','Signup metadata cannot grant coordinator');
  await as('family1',async()=>{
    equal((await db.query('select count(*)::int as n from public.profiles')).rows[0].n,1,'User only sees own profile before care assignment');
    await reject(()=>db.query("update public.profiles set role='coordinator' where id=$1",[ids.family1]),/permission denied/,'Role cannot be changed from browser');
    await reject(()=>db.query('insert into public.relatives(family_id,full_name,relationship,age,area) values ($1,$2,$3,$4,$5)',[ids.family2,'Wrong owner','Mẹ',70,'Hà Nội']),/row-level security/,'Cannot add a relative to another family');
  });
  const relative1=(await as('family1',()=>db.query('insert into public.relatives(family_id,full_name,relationship,age,area) values ($1,$2,$3,$4,$5) returning id',[ids.family1,'Người thân một','Mẹ',70,'Hà Nội']))).rows[0].id;
  const relative2=(await as('family2',()=>db.query('insert into public.relatives(family_id,full_name,relationship,age,area) values ($1,$2,$3,$4,$5) returning id',[ids.family2,'Người thân hai','Bố',72,'Hà Nội']))).rows[0].id;
  await as('family2',()=>reject(()=>db.query("select public.book_homa_visit($1,current_date+1,'')",[relative1]),/not_allowed/,'Cannot book another family relative'));
  await as('family1',()=>reject(()=>db.query("select public.book_homa_visit($1,current_date-10,'')",[relative1]),/invalid_date/,'Cannot book in the past'));
  const visit1=(await as('family1',()=>db.query("select public.book_homa_visit($1,current_date+1,'Xin lưu ý') as id",[relative1]))).rows[0].id;
  const visit2=(await as('family2',()=>db.query("select public.book_homa_visit($1,current_date+1,'') as id",[relative2]))).rows[0].id;
  await as('family1',async()=>{
    equal((await db.query('select id from public.visits')).rows.map(x=>x.id),[visit1],'Families cannot read each other visits');
    await reject(()=>db.query("update public.visits set status='completed' where id=$1",[visit1]),/permission denied/,'Direct visit updates are blocked');
    await reject(()=>db.query('select public.assign_homa_visit($1,$2)',[visit1,ids.caregiver1]),/not_allowed/,'Families cannot assign caregivers');
  });
  await as('caregiver1',async()=>{equal((await db.query('select count(*)::int as n from public.visits')).rows[0].n,0,'Unassigned caregiver sees no visits');equal((await db.query('select count(*)::int as n from public.relatives')).rows[0].n,0,'Unassigned caregiver sees no relatives');});
  await as('coordinator',async()=>{
    equal((await db.query('select count(*)::int as n from public.visits')).rows[0].n,2,'Coordinator sees requests from both families');
    await reject(()=>db.query('select public.assign_homa_visit($1,$2)',[visit1,ids.family1]),/invalid_caregiver/,'Family account cannot be assigned as caregiver');
    await db.query('select public.assign_homa_visit($1,$2)',[visit1,ids.caregiver1]);
    await reject(()=>db.query('select public.assign_homa_visit($1,$2)',[visit2,ids.caregiver1]),/duplicate key/,'Cannot double-book a caregiver evening');
    await db.query('select public.assign_homa_visit($1,$2)',[visit2,ids.caregiver2]);
  });
  await as('caregiver1',async()=>{
    equal((await db.query('select count(*)::int as n from public.visits')).rows[0].n,1,'Caregiver sees only assigned visit');
    equal((await db.query('select count(*)::int as n from public.relatives')).rows[0].n,1,'Caregiver sees only the assigned relative');
    equal((await db.query('select count(*)::int as n from public.profiles')).rows[0].n,2,'Caregiver can read related family name and own profile');
    await reject(()=>db.query('select public.start_homa_visit($1)',[visit2]),/not_allowed/,'Cannot start another caregiver visit');
    await reject(()=>db.query("select public.complete_homa_visit($1,array[true,true,true,true],'Sinh hoạt như thường ngày','Đã ghi nhận đầy đủ.','')",[visit1]),/invalid_state/,'Must start before completion');
    await db.query('select public.start_homa_visit($1)',[visit1]);
    await reject(()=>db.query("select public.complete_homa_visit($1,array[true,false,true,true],'Sinh hoạt như thường ngày','Đã ghi nhận đầy đủ.','')",[visit1]),/incomplete_tasks/,'Cannot complete missing activities');
    await db.query("select public.complete_homa_visit($1,array[true,true,true,true],'Sinh hoạt như thường ngày','Đã hỗ trợ và ghi nhận hoạt động đầy đủ.','Chuẩn bị sách.')",[visit1]);
    await reject(()=>db.query('select public.rate_homa_visit($1,5)',[visit1]),/not_allowed/,'Caregiver cannot rate own work');
  });
  await as('family2',()=>reject(()=>db.query('select public.rate_homa_visit($1,5)',[visit1]),/not_allowed/,'Another family cannot rate visit'));
  await as('family1',async()=>{
    await db.query('select public.rate_homa_visit($1,5)',[visit1]);
    const row=(await db.query('select * from public.visits where id=$1',[visit1])).rows[0];
    equal(row.rating,5,'Rating saved'); equal(row.status,'completed','Report completion saved'); equal(row.next_note,'Chuẩn bị sách.','Next-visit note saved');
    equal((await db.query('select full_name from public.profiles where id=$1',[ids.caregiver1])).rows[0].full_name,'caregiver1','Family can read assigned caregiver name');
  });
  await as('',()=>reject(()=>db.query('select * from public.visits'),/permission denied/,'Signed-out visitor cannot read visits'),'anon');
  await as('',()=>reject(()=>db.query('select public.start_homa_visit($1)',[visit2]),/permission denied/,'Anonymous visitor cannot call care mutations'),'anon');
  console.log(`PASS: ${checks} PostgreSQL checks for signup roles, RLS, ownership, scheduling and care lifecycle.`);
} finally { await db.close(); }
