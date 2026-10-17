from pathlib import Path
import json,shutil
root=Path(__file__).resolve().parents[1]
source=root/'data/filipino-foods-verified.json'
if not source.exists():source=root.parent/'research/foods/filipino-foods-verified.json'
photos_dir=root/'dist/food-photos'
if not (photos_dir/'manifest.json').exists():photos_dir=root.parent/'assets-food'
target=root/'dist/food-photos';target.mkdir(exist_ok=True)
photos=json.loads((photos_dir/'manifest.json').read_text(encoding='utf-8'))
for f in photos_dir.glob('*.webp'):
 if f.resolve()!=(target/f.name).resolve():shutil.copyfile(f,target/f.name)
for name in ['manifest.json','CREDITS.md']:
 if (photos_dir/name).resolve()!=(target/name).resolve():shutil.copyfile(photos_dir/name,target/name)
raw=json.loads(source.read_text(encoding='utf-8'))
refs=[]
aliases={'ph-rice-white-boiled':'rice','ph-banana-lakatan':'banana','ph-adobo-homemade':'adobo','ph-sinigang-homemade':'sinigang','ph-tinola-homemade':'tinola','ph-pancit-canton-homemade':'pancit-canton','ph-sisig-homemade':'sisig','ph-lumpia-shanghai-homemade':'lumpia'}
photo_matches={'ph-rice-white-boiled':'steamed-rice','ph-banana-lakatan':'banana','ph-bangus-broiled':'grilled-bangus','ph-longganisa-pork-reference':'longganisa','ph-adobo-homemade':'chicken-adobo','ph-sinigang-homemade':'sinigang-na-baboy','ph-tinola-homemade':'tinolang-manok','ph-sisig-homemade':'pork-sisig','ph-lumpia-shanghai-homemade':'lumpiang-shanghai'}
def add_photo(food,pid):
 if pid in photos:
  p=photos[pid];food.update(photo='food-photos/'+p['file'],photoCredit={'author':p['author'],'source':p['sourceUrl'],'license':p['license'],'licenseUrl':p['licenseUrl'],'modifications':p['modifications']})
for item in raw['foods']:
 f={'id':aliases.get(item['id'],item['id']),'name':item['name'],'variant':item['variant'],'servingGrams':item['servingGrams'],'serving':item.get('servingLabel','100 g reference portion'),'cat':'Ulam','emoji':'🍲','price':None,'nutritionVerified':item['dataStatus'].startswith('verified-reference'),'sourceUrl':item.get('reportURL'),'sourceFoodId':item.get('sourceFoodId'),'sourceRelease':'2019-12-01','prepNote':item['prepNote'],'aliases':item.get('aliases',[]),**item['per100g']}
 if item['id'] in ['ph-rice-white-boiled','ph-pechay-leaves-boiled','ph-kalabasa-boiled','ph-sotanghon-plain-boiled']:f['cat']='Sides'
 if item['id'] in ['ph-banana-lakatan','ph-leche-flan-reference','ph-pandesal-recipe']:f['cat']='Snacks'
 add_photo(f,photo_matches.get(item['id']));refs.append(f)
common=[('monggo','Ginisang monggo','ginisang-monggo','Ulam'),('pinakbet','Pinakbet','pinakbet','Ulam'),('pancit','Pancit bihon','pancit-bihon','Ulam'),('lechon-kawali','Lechon kawali','lechon-kawali','Ulam'),('beef-tapa','Beef tapa','beef-tapa','Ulam'),('tocino','Pork tocino','pork-tocino','Ulam'),('tilapia','Fried tilapia','fried-tilapia','Ulam'),('tortang-talong','Tortang talong','tortang-talong','Ulam'),('arroz-caldo','Arroz caldo','arroz-caldo','Ulam'),('champorado','Champorado','champorado','Snacks'),('taho','Taho','taho','Snacks'),('chicken-inasal','Chicken inasal','chicken-inasal','Ulam'),('kare-kare','Kare-kare','kare-kare','Ulam'),('laing','Laing','laing','Ulam'),('bicol-express','Bicol Express','bicol-express','Ulam')]
for ident,name,pid,cat in common:
 f={'id':ident,'name':name,'variant':'Homemade or restaurant recipe; exact ingredients needed','servingGrams':100,'serving':'100 g edible food · adjust to actual weight','cat':cat,'emoji':'🍲','price':None,'nutritionVerified':False,'sourceUrl':None,'prepNote':'No exact nutrient record has been verified for this recipe. Use a measured recipe or a current package label. The example photograph does not establish sodium, sugar or portion weight.','aliases':[],'kcal':None,'protein':None,'sodium':None,'sugar':None}
 add_photo(f,pid);refs.append(f)
# Put the familiar photo dishes first; exact source variants remain distinct and searchable.
refs.sort(key=lambda x:(not bool(x.get('photo')),x['name']))
(root/'dist/food-catalog.js').write_text("'use strict';\nconst FOOD_CATALOG="+json.dumps(refs,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
(root/'data').mkdir(exist_ok=True)
if source.resolve()!=(root/'data/filipino-foods-verified.json').resolve():shutil.copyfile(source,root/'data/filipino-foods-verified.json')
findings=source.parent/'FINDINGS.md'
if findings.exists():shutil.copyfile(findings,root/'data/NUTRITION_SOURCES.md')
(root/'data/food-catalog.json').write_text(json.dumps(refs,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'{len(refs)} foods; {sum(f["nutritionVerified"] for f in refs)} exact FNRI references; {sum(bool(f.get("photo")) for f in refs)} credited photos.')
