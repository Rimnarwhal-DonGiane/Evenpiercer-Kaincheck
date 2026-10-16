'use strict';
const GUEST_STATE='kaincheck-demo-v1',GUEST_SESSION='kaincheck-guest-session-v2',CLOUD_TABLE='kaincheck_user_state';
let accountSession=null,accountMode='welcome',accountBusy=false,accountBooting=true,accountOperation=0;
let cloudClient=null,cloudLoading=false,cloudRevision=0,cloudEpoch=0,cloudPending=null,cloudTimer=null,cloudFlight=null,cloudStatus='',cloudError='';
function accountStateKey(){return accountSession?.accountId?'kaincheck-cloud-state-'+accountSession.accountId:GUEST_STATE;}
function readAccountCache(){try{return JSON.parse(localStorage.getItem(accountStateKey()));}catch{return null;}}
function loadKaincheckState(){const cached=readAccountCache();return accountSession?.accountId?cached?.data:cached;}
function currentDemoAccount(){return accountSession?.accountId?{id:accountSession.accountId,email:accountSession.email,username:state.name}:null;}
function freshKaincheckState(){const value=initial();if(accountSession?.accountId){value.name=state.name;value.meals=[];value.activities=[];value.plan=[];value.water=0;value.activity=0;}return value;}
function cloudSnapshot(value){return JSON.parse(JSON.stringify(value,(key,item)=>/^(apiKey|password|authorization|access_token|refresh_token)$/i.test(key)?undefined:item));}
function persistKaincheckState(value){
 if(!accountSession||cloudLoading)return;
 const snapshot=cloudSnapshot(value);
 if(accountSession.guest){localStorage.setItem(GUEST_STATE,JSON.stringify(snapshot));return;}
 cloudPending=snapshot;
 try{localStorage.setItem(accountStateKey(),JSON.stringify({data:snapshot,revision:cloudRevision,dirty:true}));}catch{toast('Device storage is full. Keep the app open until cloud save completes.');}
 if(cloudStatus!=='conflict'){setCloudStatus('pending');clearTimeout(cloudTimer);cloudTimer=setTimeout(()=>flushCloudState(),800);}
}
function setCloudStatus(status,error=''){cloudStatus=status;cloudError=error;const el=document.querySelector('#cloud-sync-status');if(el)el.innerHTML=cloudStatusMarkup();}
function cloudStatusMarkup(){const labels={synced:'Saved to your Supabase account',pending:'Changes waiting to sync…',saving:'Saving to your account…',offline:'Changes saved on this device; cloud sync needs a connection.',error:'Cloud save needs attention.',conflict:'Another device has newer changes. Your unsynced copy is kept on this device.'};return `<p role="status">${esc(labels[cloudStatus]||'Connected to Supabase')}</p>${cloudError?`<small>${esc(cloudError)}</small>`:''}${['offline','error'].includes(cloudStatus)?'<button class="text-btn" data-account-action="retry-sync">Retry cloud sync</button>':''}${cloudStatus==='conflict'?'<button class="text-btn" data-account-action="load-cloud">Use cloud version</button>':''}`;}
async function flushCloudState(){
 clearTimeout(cloudTimer);if(cloudFlight)return cloudFlight;
 if(!cloudPending||!accountSession?.accountId||cloudLoading||cloudStatus==='conflict')return true;
 const epoch=cloudEpoch,id=accountSession.accountId,snapshot=cloudPending,revision=cloudRevision,key=accountStateKey();cloudPending=null;setCloudStatus('saving');
 cloudFlight=(async()=>{try{
  const row={username:String(snapshot.name||'Member').slice(0,24),data:snapshot,revision:revision+1,updated_at:new Date().toISOString()};
  const result=revision===0?await cloudClient.from(CLOUD_TABLE).insert({user_id:id,...row}).select('revision').single():await cloudClient.from(CLOUD_TABLE).update(row).eq('user_id',id).eq('revision',revision).select('revision').maybeSingle();
  if(epoch!==cloudEpoch)return false;
  if(result.error?.code==='23505'||(!result.error&&!result.data)){cloudPending=cloudPending||snapshot;setCloudStatus('conflict');return false;}
  if(result.error)throw result.error;
  cloudRevision=Number(result.data.revision);
  try{localStorage.setItem(key,JSON.stringify({data:cloudPending||snapshot,revision:cloudRevision,dirty:!!cloudPending}));}catch{}
  setCloudStatus(cloudPending?'pending':'synced');return true;
 }catch(error){if(epoch===cloudEpoch){cloudPending=cloudPending||snapshot;setCloudStatus(navigator.onLine?'error':'offline',error.message||'Try again when connected.');}return false;}
 finally{cloudFlight=null;if(epoch===cloudEpoch&&cloudPending&&cloudStatus==='pending')cloudTimer=setTimeout(()=>flushCloudState(),300);}})();return cloudFlight;
}
const googleMark=()=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.59 4.59 0 0 1-2 3.01v2.5h3.23c1.89-1.74 2.99-4.31 2.99-7.34Z"/><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.61-2.43l-3.23-2.5c-.9.6-2.05.97-3.38.97-2.6 0-4.8-1.76-5.59-4.12H3.07v2.58A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.41 13.92a6 6 0 0 1 0-3.84V7.5H3.07a10 10 0 0 0 0 9l3.34-2.58Z"/><path fill="#EA4335" d="M12 5.96c1.47 0 2.79.5 3.83 1.5l2.88-2.87A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.93 5.5l3.34 2.58C7.2 7.72 9.4 5.96 12 5.96Z"/></svg>`;
function accountSectionMarkup(){const account=currentDemoAccount();return `<section class="account-section"><h2>Account</h2><p>${account?`Signed in as <strong>${esc(state.name)}</strong><br>${esc(account.email)}`:'You’re exploring as a guest.'}</p>${account?`<div id="cloud-sync-status">${cloudStatusMarkup()}</div>`:'<small>Guest demo · saved on this device</small><div class="account-inline-actions"><button class="google-signin" data-account-action="google">'+googleMark()+'Continue with Google</button></div>'}<button class="account-logout" data-account-action="logout">${ic('logout')}Log out</button></section>`;}
function renderAccountGate(){
 const nav=document.querySelector('#nav');nav.hidden=true;nav.innerHTML='';
 if(accountBooting||cloudLoading){document.querySelector('#app').innerHTML='<section class="account-screen"><div class="account-brand"><span>✦</span>KainCheck</div><h1>Getting your space ready.</h1><p class="account-subtitle" role="status">Connecting to your account…</p></section>';return;}
 document.querySelector('#app').innerHTML=`<section class="account-screen"><div class="account-brand"><span>✦</span>KainCheck</div><div class="account-art" aria-hidden="true"><span>🌿</span><i>✦</i><b>small steps, your way</b></div><p class="account-eyebrow">YOUR FOOD. YOUR PACE. YOUR VIBE.</p><h1>Feel good about<br>your everyday.</h1><p class="account-subtitle">Familiar food, flexible movement, and a coach that gets your vibe.</p><div class="account-welcome-actions"><button class="google-signin" data-account-action="google">${googleMark()}Continue with Google</button></div><p class="account-google-hint">New here? Your first Google sign-in creates your KainCheck account.</p><p id="account-error" class="account-error" role="alert"></p><button class="text-btn account-guest" data-account-action="guest">Continue demo as guest</button><p class="account-demo-note">Your profile, food logs, plans, pictures and coach chats sync to your account. Guest data stays on this device.</p></section>`;document.querySelector('#app').scrollTop=0;
}
function showAccountError(message){const el=document.querySelector('#account-error');if(el)el.textContent=message;else toast(message);}
async function signInWithGoogle(){
 if(accountBusy||cloudLoading)return;
 if(!cloudClient){showAccountError('Open the hosted app while connected to sign in with Google.');return;}
 accountBusy=true;const operation=++accountOperation;const buttons=[...document.querySelectorAll('[data-account-action="google"]')];for(const b of buttons){b.disabled=true;b.setAttribute('aria-busy','true');}
 try{
  const response=await fetch(KAINCHECK_SUPABASE.url+'/auth/v1/settings',{headers:{apikey:KAINCHECK_SUPABASE.publishableKey},cache:'no-store'});if(!response.ok)throw Error('Could not reach sign-in. Please try again.');const settings=await response.json();if(operation!==accountOperation)return;
  if(!settings.external?.google)throw Error('Google sign-in is not available yet. Please try again later.');
  const {data,error}=await cloudClient.auth.signInWithOAuth({provider:'google',options:{redirectTo:KAINCHECK_SUPABASE.redirectUrl,skipBrowserRedirect:true,queryParams:{prompt:'select_account'}}});if(error)throw error;if(operation!==accountOperation)return;
  const url=new URL(data.url);if(url.origin!==new URL(KAINCHECK_SUPABASE.url).origin||url.pathname!=='/auth/v1/authorize')throw Error('Could not start Google sign-in.');
  location.assign(url.href);
 }catch(e){if(operation===accountOperation)showAccountError(e.message||'Google sign-in did not complete. Try again.');}
 finally{if(operation===accountOperation){accountBusy=false;for(const b of buttons){b.disabled=false;b.removeAttribute('aria-busy');}}}
}
function cancelAccountWork(){resetEpoch++;activeChatController?.abort();activeChatController=null;chatBusy=false;disposeFoodScan();connectionKeys.clear();coachSettingsDrafts.clear();configuredPawanKeyPromise=null;draftApiKey='';settingsDraft=null;closeModal();}
function showAccountMode(mode){accountOperation++;accountBusy=false;accountMode=mode;cancelAccountWork();renderAccountGate();}
function restoreAccountState(saved,username){state=saved?.version===1?{...initial(),...saved,coach:{...initial().coach,...saved.coach}}:initial();if(!Array.isArray(state.meals)||!Array.isArray(state.messages)||!Array.isArray(state.plan))state=initial();if(username)state.name=username;initializeCoachProfiles();}
function enterGuestSession(){if(cloudLoading||accountBooting)return;accountSession={guest:true};localStorage.setItem(GUEST_SESSION,'true');accountOperation++;cancelAccountWork();restoreAccountState(loadKaincheckState());save();screen='today';render();toast('Explore at your own pace.');}
async function enterCloudSession(session){
 if(!session?.user||accountSession?.accountId===session.user.id)return;
 const epoch=++cloudEpoch;accountOperation++;cancelAccountWork();accountSession={accountId:session.user.id,email:session.user.email};localStorage.removeItem(GUEST_SESSION);cloudLoading=true;cloudPending=null;cloudRevision=0;renderAccountGate();
 const cached=readAccountCache();
 try{
  const {data,error}=await cloudClient.from(CLOUD_TABLE).select('data,username,revision').eq('user_id',session.user.id).maybeSingle();if(epoch!==cloudEpoch)return;if(error)throw error;
  cloudRevision=Number(data?.revision||0);
  const username=data?.username||String(session.user.user_metadata?.username||session.user.user_metadata?.full_name||session.user.user_metadata?.name||'Member').slice(0,24);
  if(cached?.dirty){restoreAccountState(cached.data);cloudPending=cloudSnapshot(state);setCloudStatus(Number(cached.revision)===cloudRevision?'pending':'conflict');}
  else if(data){restoreAccountState(data.data,data.username);setCloudStatus('synced');try{localStorage.setItem(accountStateKey(),JSON.stringify({data:cloudSnapshot(state),revision:cloudRevision,dirty:false}));}catch{}}
  else{restoreAccountState(null,username);state.meals=[];state.activities=[];state.plan=[];state.water=0;state.activity=0;setCloudStatus('pending');}
  cloudLoading=false;accountBooting=false;screen='today';render();if(!data&&!cloudPending)save();else if(cloudStatus==='pending')flushCloudState();
 }catch(error){if(epoch!==cloudEpoch)return;cloudLoading=false;accountBooting=false;
  if(cached?.data){cloudRevision=Number(cached.revision||0);restoreAccountState(cached.data);cloudPending=cached.dirty?cloudSnapshot(state):null;setCloudStatus('offline',error.message);screen='today';render();}
  else{accountSession=null;accountMode='signin';renderAccountGate();const el=document.querySelector('#account-error');if(el)el.textContent='Could not load your account. '+(error.message||'Check your connection and sign in again.');}
 }
}
async function logoutCloudAccount(){if(accountBusy)return;accountBusy=true;if(accountSession?.accountId){await flushCloudState();if(cloudPending&&cloudStatus!=='conflict')await flushCloudState();const {error}=await cloudClient.auth.signOut({scope:'local'});if(error){accountBusy=false;toast('Could not sign out. '+error.message);return;}}finishAccountLogout();}
function finishAccountLogout(){cloudEpoch++;accountOperation++;accountBusy=false;clearTimeout(cloudTimer);cloudPending=null;cloudLoading=false;cancelAccountWork();accountSession=null;localStorage.removeItem(GUEST_SESSION);state=initial();initializeCoachProfiles();screen='today';accountMode='welcome';render();}
async function loadCloudVersion(){if(!accountSession?.accountId)return;const id=accountSession.accountId,key=accountStateKey();try{const {data,error}=await cloudClient.from(CLOUD_TABLE).select('data,username,revision').eq('user_id',id).single();if(error)throw error;if(accountSession?.accountId!==id)return;localStorage.setItem(key+'-unsynced-backup',JSON.stringify(readAccountCache()));cloudPending=null;cloudRevision=Number(data.revision);cancelAccountWork();restoreAccountState(data.data,data.username);localStorage.setItem(key,JSON.stringify({data:cloudSnapshot(state),revision:cloudRevision,dirty:false}));setCloudStatus('synced');render();toast('Cloud version loaded. Previous device copy kept as a backup.');}catch(e){toast('Could not load cloud version. '+e.message);}}
async function bootCloudAccounts(){
 const redirectError=new URLSearchParams(location.hash.slice(1)).get('error')||new URLSearchParams(location.search).get('error');
 try{if(!['http:','https:'].includes(location.protocol))throw Error('Open the hosted app to use online accounts.');if(!globalThis.KaincheckSupabase?.createClient)throw Error('Online account library could not load.');
 cloudClient=KaincheckSupabase.createClient(KAINCHECK_SUPABASE.url,KAINCHECK_SUPABASE.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'kaincheck-cloud-auth-v1',flowType:'pkce'}});
 cloudClient.auth.onAuthStateChange((event,session)=>{setTimeout(()=>{if(event==='SIGNED_OUT'&&accountSession?.accountId)finishAccountLogout();else if(session?.user&&['SIGNED_IN','INITIAL_SESSION'].includes(event))enterCloudSession(session);},0);});
 const {data,error}=await cloudClient.auth.getSession();if(error)throw error;accountBooting=false;if(data.session)await enterCloudSession(data.session);else if(localStorage.getItem(GUEST_SESSION)==='true')enterGuestSession();else render();if(redirectError)showAccountError(redirectError==='access_denied'?'Google sign-in was cancelled. Try again when ready.':'Google sign-in could not finish. Please try again.');
 }catch(e){accountBooting=false;accountMode='signin';render();const error=document.querySelector('#account-error');if(error)error.textContent=e.message;}
}
function installCloudAccounts(){iconPaths.logout='<path d="M10 4H4v16h6M14 8l4 4-4 4M8 12h10"/>';document.addEventListener('click',e=>{const button=e.target.closest('[data-account-action]');if(!button)return;e.preventDefault();const action=button.dataset.accountAction;if(action==='google')return signInWithGoogle();if(action==='guest')return enterGuestSession();if(action==='logout')return logoutCloudAccount();if(action==='retry-sync'){if(cloudStatus!=='conflict')setCloudStatus('pending');return flushCloudState();}if(action==='load-cloud')return loadCloudVersion();});window.addEventListener('online',()=>{if(cloudPending&&cloudStatus!=='conflict'){setCloudStatus('pending');flushCloudState();}});document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flushCloudState();});}
