from pathlib import Path
import subprocess,json,hashlib,re,sys,base64,shutil
root=Path(__file__).resolve().parents[1]
git=shutil.which('git')
if not git:raise SystemExit('Install Git or add it to PATH before exporting source.')
paths=subprocess.check_output([git,'ls-files','--cached','--others','--exclude-standard'],cwd=root,text=True).splitlines()
if len(sys.argv)>1:
 path=sys.argv[1]
 if path not in paths:raise SystemExit('File outside intended source list')
 content=base64.b64encode((root/path).read_bytes()).decode();offset=int(sys.argv[2]);print(json.dumps({'chunk':content[offset:offset+16000],'length':len(content)}))
else:
 previous={}
 for line in subprocess.check_output([git,'ls-tree','-r','origin/main'],cwd=root,text=True).splitlines():
  info,path=line.split('\t',1);previous[path]=info.split()[2]
 index=[]
 for path in sorted(paths):
  raw=(root/path).read_bytes()
  if Path(path).suffix not in ['.png','.webp','.woff2','.woff','.ttf','.otf','.jpg','.jpeg']:
   data=raw.decode('utf-8')
   for pattern in [r'sk-proj-[A-Za-z0-9_-]{20,}',r'pk-[A-Za-z0-9]{20,}',r'sb_secret_[A-Za-z0-9_-]{16,}',r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----']:
    if re.search(pattern,data):raise SystemExit('Credential-like data found in '+path)
  sha=hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()
  if previous.get(path)!=sha:index.append({'path':path,'size':len(raw),'sha':sha})
 print(json.dumps(index))
