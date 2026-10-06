const fs=require('node:fs'),vm=require('node:vm');
const context={window:{}};vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../preview/config.js'),'utf8'),context);
const config=context.window.HOMACARE_CONFIG;
(async()=>{
  const headers={apikey:config.supabasePublishableKey};
  const settings=await fetch(config.supabaseUrl+'/auth/v1/settings',{headers});
  console.log('Auth connection:',settings.status);
  if(settings.ok){const data=await settings.json();console.log('Email enabled:',data.external?.email);console.log('Email confirmation required:',!data.mailer_autoconfirm);}
  const table=await fetch(config.supabaseUrl+'/rest/v1/profiles?select=id&limit=0',{headers});
  const result=await table.json();console.log('Profile table:',table.status,Array.isArray(result)?'readable':result.code);
})().catch(error=>{console.error('Connection check failed:',error.message);process.exitCode=1});
