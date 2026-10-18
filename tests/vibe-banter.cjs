const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/GINOKI/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true}),context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'}),p=await context.newPage(),errors=[],calls=[];
 p.on('pageerror',e=>errors.push(e.message));let fail=false;
 await p.route('**/api/openai/status',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({configured:true,model:'mock-only'})}));
 await p.route('**/api/openai/coach',r=>{calls.push(r.request().postDataJSON());return r.fulfill({status:fail?503:200,contentType:'application/json',body:JSON.stringify(fail?{error:{message:'Mock connection failure'}}:{text:'yes bro, pinnacle of nutrition, allat 💀 Kidding — check the packet’s serving size and sodium. Add vegetables and protein to round out the meal.',model:'mock-only'})});});
 const click=name=>p.getByRole('button',{name,exact:true}).click(),send=async text=>{await p.locator('#chat-input').fill(text);await click('Send message');await p.waitForFunction(()=>!chatBusy);};
 const example='is this pancit canton is the most healthiest food?';
 await p.goto('http://127.0.0.1:4174/');await click('Continue demo as guest');await p.locator('.greeting').waitFor();await p.evaluate(()=>{state.coach.vibe=true;save();render();});await click('Coach');await send(example);
 assert.equal(calls.at(-1).coach.vibe,true);assert.equal(await p.evaluate(()=>state.messages.at(-1).vibePhoto),'glam-pigeon');assert.equal(await p.locator('.chat-vibe-reaction img').last().getAttribute('src'),'vibe-photos/glam-pigeon.webp');assert((await p.locator('.message').last().innerText()).includes('Kidding'));await p.waitForFunction(()=>document.querySelector('.chat-vibe-reaction img')?.naturalWidth>0);
 await p.screenshot({path:'../qa-vibe-pigeon-phone.png',fullPage:true});
 assert(!JSON.stringify(calls.at(-1)).includes('vibe-photos/'));assert(!JSON.stringify(calls.at(-1)).includes('base64'));
 for(const input of ['I have kidney disease. Is pancit canton the healthiest food?','Is pancit canton the healthiest food to eat 3x a day?','How much sodium can I eat? Is pancit canton healthiest?','My child asks whether pancit canton is the healthiest food','Is spoiled pancit canton the healthiest food?','I feel pain after eating pancit canton. Is it the healthiest?']){await send(input);assert.equal(await p.evaluate(()=>state.messages.at(-1).vibePhoto),undefined,input);}
 fail=true;await send(example);assert.equal(await p.evaluate(()=>state.messages.at(-1).vibePhoto),undefined);fail=false;
 await p.evaluate(()=>{state.coach.vibe=false;save();render();});await send(example);assert.equal(calls.at(-1).coach.vibe,false);assert.equal(await p.locator('.chat-vibe-reaction').count(),0);
 await p.evaluate(()=>{state.coach.vibe=true;state.coach.engine='offline';save();render();});const before=calls.length;await send(example);assert.equal(calls.length,before);assert.equal(await p.evaluate(()=>state.messages.at(-1).source),'demo');assert.equal(await p.evaluate(()=>state.messages.at(-1).vibePhoto),'glam-pigeon');assert((await p.locator('.message').last().innerText()).includes('Kidding'));
 await p.setViewportSize({width:1440,height:1000});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await p.screenshot({path:'../qa-vibe-pigeon-desktop.png',fullPage:true});
 await p.reload();await p.locator('.greeting').waitFor();await click('Coach');assert(await p.locator('.chat-vibe-reaction img[data-vibe-image="glam-pigeon"]').count()>0);
 assert.deepEqual(errors,[]);await browser.close();console.log('Contextual pigeon reaction, ON/OFF, serious-topic exclusions, offline demo, persistence and phone/desktop checks passed; live coach mocked.');
})().catch(e=>{console.error(e);process.exit(1);});
