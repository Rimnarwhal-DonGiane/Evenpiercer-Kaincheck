from pathlib import Path
import base64,json,mimetypes
root=Path(__file__).resolve().parents[1]
dist=root/'dist'
assets={}
for file in sorted(dist.rglob('*')):
 if not file.is_file() or file.relative_to(dist).parts[0] in ['server','.openai']:continue
 name=file.relative_to(dist).as_posix()
 mime={'.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.html':'text/html; charset=utf-8','.webmanifest':'application/manifest+json'}.get(file.suffix,mimetypes.guess_type(str(file))[0] or 'application/octet-stream')
 assets['/'+name]={'type':mime,'body':base64.b64encode(file.read_bytes()).decode()}
source=(root/'worker/index.js').read_text(encoding='utf-8').replace('/* STATIC_ASSETS */ {}',json.dumps(assets,separators=(',',':')))
(dist/'server').mkdir(exist_ok=True)
(dist/'server/index.js').write_text(source,encoding='utf-8')
(dist/'.openai').mkdir(exist_ok=True)
(dist/'.openai/hosting.json').write_text((root/'.openai/hosting.json').read_text(encoding='utf-8'),encoding='utf-8')
print(f'Worker built with {len(assets)} static assets; runtime key is not in the build.')
