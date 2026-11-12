import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
process.chdir(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
const reference='../MOTION_ATLAS_60_AEE99382E38383%88/MOTION_ATLAS_60';
const catalog=JSON.parse(fs.readFileSync(`${reference}/motions.json`,'utf8'));
const reasons={
  'M-003':'冒頭とCTAを短いマスク表示で読みやすく提示する',
  'M-012':'実画面の内容を保った弱いプッシュで視線を誘導する',
  'M-016':'優勝シーンに控えめな紙吹雪と放射リングを添える',
  'M-041':'画面の切り替えを中央からのサークルワイプでつなぐ',
  'M-054':'タイトルとCTAに低輝度の発光リングで余韻を加える',
};
const target='src/catalog/registry.json';
const previous=fs.existsSync(target)?JSON.parse(fs.readFileSync(target,'utf8')):[];
const styles=fs.existsSync('src/catalog/style-tags.json')?JSON.parse(fs.readFileSync('src/catalog/style-tags.json','utf8')).tags:{};
if(catalog.motions.length!==60||new Set(catalog.motions.map(m=>m.id)).size!==60)throw Error('Expected 60 unique motion IDs');
const result=catalog.motions.map(m=>{
 const old=previous.find(r=>r.id===m.id);
 const defaults={tags:[m.category,m.en.toLowerCase()],suitableFor:m.usage,notSuitableFor:'文字や実画面を隠す過剰演出、事実未確認の成果表現',runtimeStatus:reasons[m.id]?'implemented':'demo-only',implementationPath:reasons[m.id]?'src/motions/index.tsx':null,exportName:reasons[m.id]?m.id.replace('-',''):null,minDurationFrames:15,recommendedDurationFrames:60,propsSchema:null,selectionReason:reasons[m.id]??null};
 const merged={...defaults,...old,...m,sourceAsset:`${reference}/index.html`,promptPath:`${reference}/prompts/${m.id}.md`};
 if(styles[m.id])merged.style=styles[m.id];
 if(old&&['name','prompt','tech','duration'].some(key=>old[key]!==m[key])){
  merged.sourceReviewRequired=true;
  if(old.runtimeStatus==='verified')merged.runtimeStatus='implemented';
 }
 return merged;
});
fs.mkdirSync('src/catalog',{recursive:true});fs.writeFileSync(target,JSON.stringify(result,null,2));
console.log(JSON.stringify({motions:result.length,status:result.reduce((a,m)=>(a[m.runtimeStatus]=(a[m.runtimeStatus]??0)+1,a),{}),sourceReviewRequired:result.filter(m=>m.sourceReviewRequired).map(m=>m.id)}));
