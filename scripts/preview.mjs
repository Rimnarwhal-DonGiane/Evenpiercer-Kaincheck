import http from 'node:http';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../dist/server/index.js',import.meta.url),'utf8');
const worker=(await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))).default;
const server=http.createServer(async(req,res)=>{try{const chunks=[];for await(const chunk of req)chunks.push(chunk);const body=Buffer.concat(chunks);const r=await worker.fetch(new Request('http://127.0.0.1:4174'+req.url,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body}: {})}),{OPENAI_API_KEY:process.env.OPENAI_API_KEY,OPENAI_MODEL:process.env.OPENAI_MODEL});res.writeHead(r.status,Object.fromEntries(r.headers));res.end(Buffer.from(await r.arrayBuffer()));}catch{res.writeHead(500);res.end('Preview request failed.');}});
server.listen(4174,'127.0.0.1',()=>console.log('KainCheck preview: http://127.0.0.1:4174'));
