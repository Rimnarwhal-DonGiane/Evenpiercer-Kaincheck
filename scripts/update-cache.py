from pathlib import Path
import json,hashlib,re
root=Path(__file__).resolve().parents[1];dist=root/'dist';p=dist/'sw.js';s=p.read_text(encoding='utf-8')
extras=['food-catalog.js','nutrition.js','openai-coach.js','desktop.js','desktop.css','wellness.js','wellness.css','appearance.js','appearance.css']+['theme-assets/'+f.relative_to(dist/'theme-assets').as_posix() for f in sorted((dist/'theme-assets').rglob('*')) if f.is_file() and f.suffix in ['.webp','.woff2']]+['food-photos/'+f.name for f in sorted((dist/'food-photos').glob('*.webp'))]
match=re.search(r'const SHELL_FILES=(\[.*?\]);',s)
paths=json.loads(match.group(1).replace("'",'"'))
for item in extras:
 if item not in paths:paths.append(item)
s=s[:match.start()]+'const SHELL_FILES='+json.dumps(paths,separators=(',',':'))+';'+s[match.end():]
if "path.endsWith('.webp')" not in s:s=s.replace("if(path.endsWith('.png'))", "if(path.endsWith('.webp'))return /image\\/webp/.test(type);if(path.endsWith('.png'))")
if "path.endsWith('.woff2')" not in s:s=s.replace("if(path.endsWith('.webp'))", "if(path.endsWith('.woff2'))return /font\\/woff2/.test(type);if(path.endsWith('.webp'))")
h=hashlib.sha256()
for f in sorted(dist.rglob('*')):
 if f.is_file() and f.name!='sw.js' and not any(x in f.relative_to(dist).parts for x in ['server','.openai']):h.update(f.read_bytes())
s=re.sub(r'kaincheck-shell-[a-f0-9]+','kaincheck-shell-'+h.hexdigest()[:12],s);p.write_text(s,encoding='utf-8');print('Updated app cache with '+str(len(paths))+' shell assets.')
