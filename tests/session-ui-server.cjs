// Local session fixtures for exercising the real UI. Never deploy this folder.
const http = require('node:http'), fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '../preview');
const sdk = `(() => {
  const profiles = {
    family: { id:'fixture-family', full_name:'Gia đình kiểm tra', role:'family' },
    caregiver: { id:'fixture-caregiver', full_name:'Chuyên viên kiểm tra', role:'caregiver' },
    coordinator: { id:'fixture-coordinator', full_name:'Điều phối kiểm tra', role:'coordinator' }
  };
  const storage = 'homa-session-fixture', listeners = [];
  const read = () => profiles[localStorage.getItem(storage)] || null;
  const token = new URLSearchParams(location.hash.slice(1)).get('access_token');
  if (document.querySelector('#account-form') && token?.startsWith('fixture-') && profiles[token.slice(8)]) { localStorage.setItem(storage, token.slice(8)); history.replaceState(null,'',location.pathname+location.search); }
  const session = () => read() ? { user: {id:read().id} } : null;
  window.supabase = { createClient: () => ({
    auth: {
      getUser: async () => ({data:{user:read()?{id:read().id}:null},error:read()?null:{name:'AuthSessionMissingError'}}),
      getSession: async () => ({data:{session:session()},error:null}),
      onAuthStateChange: callback => {listeners.push(callback);return {data:{subscription:{unsubscribe(){}}}}},
      signInWithPassword: async ({email}) => { const role=email.startsWith('caregiver')?'caregiver':email.startsWith('coordinator')?'coordinator':'family'; localStorage.setItem(storage,role);listeners.forEach(fn=>fn('SIGNED_IN',session()));return {data:{session:session(),user:{id:read().id}},error:null}; },
      signOut: async () => {localStorage.removeItem(storage);listeners.forEach(fn=>fn('SIGNED_OUT',null));return {error:null}},
      resetPasswordForEmail: async () => ({error:null})
    },
    from: table => {
      let match;
      const query={select(){return query},eq(key,value){match=value;return query},order(){return query},single:async()=>({data:read()?.id===match?read():null,error:read()?.id===match?null:{message:'profile missing'}}),then(resolve,reject){return Promise.resolve({data:[],error:null}).then(resolve,reject)}};
      return query;
    }
  })};
})();`;
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.ttf':'font/ttf','.webmanifest':'application/manifest+json'};
http.createServer((req,res) => {
  const url = new URL(req.url,'http://127.0.0.1:4175');
  if(url.pathname === '/fixture-sdk.js') {res.writeHead(200,{'Content-Type':types['.js'],'Cache-Control':'no-store'});return res.end(sdk);}
  const name=decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname).slice(1), file=path.resolve(root,name);
  if(!file.startsWith(root+path.sep)) {res.writeHead(403);return res.end();}
  if(!fs.existsSync(file)||!fs.statSync(file).isFile()) {res.writeHead(404);return res.end();}
  let body=fs.readFileSync(file);
  if(path.extname(file)==='.html') body=body.toString().replace('src="vendor/supabase.js"','src="fixture-sdk.js"');
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);
}).listen(4175,'127.0.0.1',()=>console.log('Session UI fixtures: http://127.0.0.1:4175 — synthetic accounts only'));
