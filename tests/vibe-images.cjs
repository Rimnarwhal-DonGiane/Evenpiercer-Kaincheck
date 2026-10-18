const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/GINOKI/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block',reducedMotion:'reduce'}),p=await context.newPage(),errors=[],calls=[];
 p.on('pageerror',e=>errors.push(e.message));
 let fail=false;
 await p.route('**/api/openai/status',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({configured:true,model:'mock-only'})}));
 await p.route('**/api/openai/coach',async r=>{calls.push(r.request().postDataJSON());await r.fulfill({status:fail?503:200,contentType:'application/json',body:JSON.stringify(fail?{error:'Mock connection failure'}:{text:'One small step today is a win. You have got this!',model:'mock-only'})});});
 const click=name=>p.getByRole('button',{name,exact:true}).click(),images=()=>p.locator('img[data-vibe-image]');
 const send=async text=>{await p.locator('#chat-input').fill(text);await click('Send message');await p.waitForFunction(()=>!chatBusy);};
 const on=async()=>{await p.evaluate(()=>{state.coach.vibe=true;save();render();});};
 await p.goto('http://127.0.0.1:4174/');await click('Continue demo as guest');await p.locator('.greeting').waitFor();
 await p.evaluate(()=>{state.coach.vibe=false;save();render();});
 for(const name of ['Today','Food','Coach','Progress','You']){await click(name);assert.equal(await images().count(),0);}
 await p.evaluate(()=>openVibeGallery());assert.equal(await images().count(),0);
 await on();await click('Today');assert.equal(await p.locator('.daily-vibe').count(),1);
 const daily=p.locator('.daily-vibe img');await daily.scrollIntoViewIfNeeded();await p.waitForFunction(()=>document.querySelector('.daily-vibe img')?.naturalWidth>0);
 const first=await daily.getAttribute('data-vibe-image');await click('Another vibe');assert.notEqual(await daily.getAttribute('data-vibe-image'),first);
 await daily.scrollIntoViewIfNeeded();await p.waitForFunction(()=>document.querySelector('.daily-vibe img')?.naturalWidth>0);await p.locator('#toast').evaluate(e=>e.classList.remove('show'));await p.screenshot({path:'../qa-vibe-today-phone.png',fullPage:true});
 await click('Browse photos');assert.equal(await p.locator('.vibe-gallery-tile').count(),19);
 await p.locator('[data-vibe-filter="movement"]').click();assert.equal(await p.locator('.vibe-gallery-tile').count(),3);
 await p.locator('.vibe-gallery-tile').first().click();assert.equal(await p.locator('.animal-vibe-card').count(),1);const reaction=await p.locator('.animal-vibe-card img').getAttribute('data-vibe-image');await click('Another reaction');assert.notEqual(await p.locator('.animal-vibe-card img').getAttribute('data-vibe-image'),reaction);await click('Done');
 await click('Coach');await click('Goofy encouragement');await p.waitForFunction(()=>!chatBusy);assert.equal(await p.locator('.chat-vibe-reaction').count(),1);
 assert.equal(typeof await p.evaluate(()=>state.messages.at(-1).vibePhoto),'string');assert(!JSON.stringify(calls.at(-1)).includes('vibePhoto'));assert(!JSON.stringify(calls.at(-1)).includes('vibe-photos/'));
 await p.screenshot({path:'../qa-vibe-chat-phone.png',fullPage:true});
 fail=true;await click('Refresh reply');await p.waitForFunction(()=>!chatBusy);assert.equal(await p.locator('.chat-vibe-reaction').count(),0);fail=false;
 await send('Give me motivation about too much sodium.');assert.equal(await p.evaluate(()=>state.messages.at(-1).vibePhoto),undefined);
 fail=true;await send('Goofy encouragement please');assert.equal(await p.evaluate(()=>state.messages.at(-1).vibePhoto),undefined);fail=false;
 await send('Give me goofy encouragement');assert(await p.evaluate(()=>!!state.messages.at(-1).vibePhoto));
 await click('You');await p.getByRole('switch',{name:'Vibe Mode',exact:true}).click();await click('Coach');assert.equal(await images().count(),0);
 await p.reload();await p.locator('.greeting').waitFor();assert.equal(await images().count(),0);await on();
 await p.evaluate(()=>{openVibeGallery();state.coach.vibe=false;save();render();});assert.equal(await p.locator('.vibe-photo-gallery').count(),0);assert.equal(await images().count(),0);await on();
 await click('Today');await p.locator('[data-action="water"]').click();assert.equal(await p.evaluate(()=>vibeMoment().reason),'water');
 await p.locator('.quick-actions [data-action="activity"]').click();await p.locator('#activity-minutes').fill('12');await click('Save activity');assert.equal(await p.evaluate(()=>vibeMoment().reason),'movement');
 await click('Food');await p.locator('#food-search').fill('hotdog');await p.locator('[data-food="ph-hotdog-reference"]').click();assert.equal(await p.locator('.sheet img[data-vibe-image]').count(),0);assert((await p.locator('.nutrition-cautions').innerText()).includes('2,094'));
 await click('Add to my food log');assert.equal(await p.evaluate(()=>vibeMoment().reason),'meal');assert.equal(await p.locator('.sheet img[data-vibe-image]').count(),0);await click('Back to food log');
 await p.evaluate(()=>openFoodChecker());assert.equal(await p.locator('.sheet img[data-vibe-image]').count(),0);await click('Close dialog');
 await click('Today');
 for(const preset of ['kaincheck','terraria','earthmover']){
  await p.evaluate(preset=>{state.appearance=normalizeAppearance({preset});save();render();},preset);
  for(const width of [360,390,900,1024,1440]){await p.setViewportSize({width,height:1000});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.equal(await p.locator('.daily-vibe').evaluate(e=>e.scrollWidth>e.clientWidth+1),false);}
  await p.locator('.daily-vibe').scrollIntoViewIfNeeded();await p.screenshot({path:'../qa-vibe-'+preset+'-desktop.png',fullPage:true});await click('Browse photos');assert.equal(await p.locator('.sheet').evaluate(e=>e.scrollWidth>e.clientWidth+1),false);await p.setViewportSize({width:360,height:844});assert.equal(await p.locator('.sheet').evaluate(e=>e.scrollWidth>e.clientWidth+1),false);await p.locator('.vibe-gallery-tile img').first().scrollIntoViewIfNeeded();await p.waitForFunction(()=>document.querySelector('.vibe-gallery-tile img')?.naturalWidth>0);await p.screenshot({path:'../qa-vibe-gallery-'+preset+'.png',fullPage:true});await click('Close dialog');
 }
 await p.reload();await p.locator('.greeting').waitFor();assert.equal(await p.locator('.daily-vibe').count(),1);
 await p.evaluate(()=>{state.platinum=false;render();});assert.equal(await images().count(),0);
 assert.deepEqual(errors,[]);await context.close();
 const offline=await browser.newContext({viewport:{width:390,height:844}}),q=await offline.newPage();await q.goto('http://127.0.0.1:4174/');await q.evaluate(()=>navigator.serviceWorker.ready);await q.reload();await q.getByRole('button',{name:'Continue demo as guest',exact:true}).click();await q.locator('.greeting').waitFor();await q.evaluate(()=>{state.coach.vibe=true;save();render();});await offline.setOffline(true);await q.reload();await q.locator('.greeting').waitFor();await q.getByRole('button',{name:'Browse photos',exact:true}).click();assert.equal(await q.locator('.vibe-gallery-tile').count(),19);const cached=await q.evaluate(async()=>{const cache=await caches.open((await caches.keys()).find(x=>x.startsWith('kaincheck')));return (await cache.keys()).filter(x=>x.url.includes('/vibe-photos/')&&x.url.endsWith('.webp')).length;});assert.equal(cached,19);
 await browser.close();fs.writeFileSync('../qa-vibe-result.json',JSON.stringify({passed:true,photos:19,checks:['ON-only rendering and persistence','19-photo filtered gallery and next reaction','lighthearted coach replies with image IDs only','no image in sodium cautions, scanner or errors','hide existing reactions when switched off','water, activity and meal context','three themes at360–1440px','19 images cached offline'],mockedAi:true},null,2));console.log('Vibe image, safety, layout and offline checks passed.');
})().catch(e=>{console.error(e);process.exit(1);});
