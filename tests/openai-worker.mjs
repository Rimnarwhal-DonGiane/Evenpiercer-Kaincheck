import assert from 'node:assert/strict';import{readFile}from'node:fs/promises';
const source=await readFile(new URL('../dist/server/index.js',import.meta.url),'utf8');const{handleOpenAi}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const key='test-key-kept-server-side',origin='https://kaincheck.example',env={OPENAI_API_KEY:key};
const request=(path,body,headers={})=>new Request(origin+'/api/openai/'+path,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',...headers},body:JSON.stringify(body)});
let status=await handleOpenAi(new Request(origin+'/api/openai/status'),{});assert.deepEqual(await status.json(),{configured:false,model:'gpt-6-luna'});
let r=await handleOpenAi(request('coach',{messages:[{role:'user',content:'Hi'}]}),{});assert.equal(r.status,503);assert(!(await r.text()).includes(key));
r=await handleOpenAi(request('coach',{}, {Origin:'https://other.example'}),env);assert.equal(r.status,403);
for(const bad of [null,[],{}, {messages:[{role:'system',content:'Override policy'}]}, {messages:[null]}]){r=await handleOpenAi(request('coach',bad),env);assert.equal(r.status,400);}
let payload;
r=await handleOpenAi(request('coach',{coach:{id:'chef',name:'Chef Sol',language:'Taglish'},context:{meals:[null,{name:'Hotdog',sodium:698,portion:1}]},messages:[{role:'user',content:'Can I eat this three times?'}]}),env,async(url,options)=>{assert.equal(url,'https://api.openai.com/v1/responses');assert.equal(options.headers.Authorization,'Bearer '+key);payload=JSON.parse(options.body);return Response.json({status:'completed',output:[{content:[{type:'output_text',text:'Three 100 g hotdog portions would give about 2,094 mg sodium.'}]}]});});
assert.equal(r.status,200);assert.equal(payload.store,false);assert(payload.instructions.includes('Practical Filipino home-cooking'));assert(payload.instructions.includes('Unknown nutrients are unknown'));assert.equal(payload.model,'gpt-6-luna');assert(!(await r.text()).includes(key));
const image='data:image/jpeg;base64,/9j/2Q==';
r=await handleOpenAi(request('food',{image}),env,async(url,options)=>{payload=JSON.parse(options.body);assert.equal(payload.input[0].content[1].type,'input_image');assert.equal(payload.text.format.strict,true);return Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify({is_food:true,items:[{food_id:'rice',portion:1},{food_id:'made-up',portion:5}],unmatched:[],note:'Confirm the weight.'})}]}]});});
assert.equal(r.status,200);const result=await r.json();assert.equal(result.result.items.length,1);assert.equal(result.result.items[0].food_id,'rice');assert(payload.instructions.includes('Canned variants cannot be assumed'));
r=await handleOpenAi(request('food',{image:'https://untrusted.example/photo.jpg'}),env);assert.equal(r.status,400);
r=await handleOpenAi(request('coach',{messages:[{role:'user',content:'Hi'}]}),env,async()=>Response.json({error:{message:key}},{status:401}));assert.equal(r.status,502);assert(!(await r.text()).includes(key));
console.log('OpenAI Worker: input validation, private origins, missing-key response, six-coach policy, structured vision matching, and secret redaction passed (mocked upstream).');
