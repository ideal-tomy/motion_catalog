import fs from 'node:fs';
import path from 'node:path';
import {studio,read} from './library.mjs';
// Seed only. Human-reviewed tags, preset changes and delivery versions must survive reruns.
const write=(p,v)=>{if(fs.existsSync(path.join(studio,p)))return;fs.mkdirSync(path.dirname(path.join(studio,p)),{recursive:true});fs.writeFileSync(path.join(studio,p),JSON.stringify(v,null,2));};
const registry=read(path.join(studio,'src/catalog/registry.json'));
const profiles={
 soft:{mood:['calm','healing'],energy:1,pace:'slow',light:'low',shake:false,hold:45},
 clear:{mood:['calm','professional'],energy:2,pace:'medium',light:'low',shake:false,hold:36},
 dimensional:{mood:['cinematic','calm'],energy:3,pace:'medium',light:'medium',shake:false,hold:30},
 lively:{mood:['energetic','cinematic'],energy:4,pace:'fast',light:'medium',shake:false,hold:24},
 impact:{mood:['energetic'],energy:5,pace:'fast',light:'high',shake:true,hold:24},
};
const groups={soft:[3,19,20,21,39,43,51],clear:[4,5,6,7,8,12,17,25,26,27,28,29,30,31,32,33,34,41],dimensional:[10,11,24,36,37,38,40,48,49,52],impact:[13,22,35,44,45,46,47,53,55,58,60]};
const kind={TEXT:'typography',UI:'ui-focus',CAMERA:'camera',TRANSITION:'transition',FX:'effect',AUDIO:'audio-cue'};
const tags=Object.fromEntries(registry.map(m=>{
 const n=Number(m.id.slice(2));const profile=Object.entries(groups).find(([,ids])=>ids.includes(n))?.[0]??'lively';const p=profiles[profile];
 return [m.id,{...p,role:m.category==='TEXT'?['hook','cta']:m.category==='UI'?['operation','result']:m.category==='CAMERA'?['focus','operation']:m.category==='TRANSITION'?['transition']:['hook','result'],motionType:kind[m.category],minReadableFrames:p.hold,aspectRatios:['16:9'],verticalStatus:'unreviewed',tagStatus:'provisional',tagBasis:'参照カタログの名称・説明・依頼文に基づく初期分類。映像の印象は要レビュー。'}];
}));
write('src/catalog/style-tags.json',{version:1,profiles,tags});
write('src/catalog/tag-taxonomy.json',{version:1,mood:['energetic','calm','healing','cinematic','professional'],energy:{min:1,max:5},pace:['slow','medium','fast'],role:['hook','focus','operation','result','transition','cta'],light:['low','medium','high'],tagStatus:['provisional','reviewed'],runtimeStatus:['demo-only','implemented','verified'],rules:['タグのレビュー状態と実装・動画検証状態は分離','緩急はシーンごとの強弱と保持時間で構成','癒しは低い光量・揺れなし・低いenergyで絞り込む','未実装は推薦候補から除外し、除外理由を表示','縦型の適性は未確認。横型検証から流用しない']});
const presets=[
 {id:'energetic',label:'迫力',durationSeconds:22,mood:'energetic',energyCurve:[5,3,4,5,3],durations:[2,4,6,6,4],music:'ロック調、操作中は音量を控える',palette:'高コントラスト、黄緑・黒',allowShake:true,maxLight:'high'},
 {id:'calm',label:'落ち着き',durationSeconds:20,mood:'calm',energyCurve:[2,1,2,2,1],durations:[3,4,6,4,3],music:'静かなインスト、控えめなアタック',palette:'紺・白、低い発光',allowShake:false,maxLight:'low'},
 {id:'contrast',label:'緩急',durationSeconds:20,mood:'energetic',energyCurve:[5,1,2,5,1],durations:[2,4,6,5,3],music:'冒頭と結果でヒット、操作は落ち着かせる',palette:'暗い基調、結果でアクセント',allowShake:true,maxLight:'medium'},
 {id:'healing',label:'癒し',durationSeconds:20,mood:'healing',energyCurve:[1,1,1,1,1],durations:[3,4,6,4,3],music:'穏やかなアンビエント。音源は別途用意・検証',palette:'柔らかい低コントラスト、光量を抑える',allowShake:false,maxLight:'low'},
];
write('presets/styles.json',{version:1,presets,showcase:{id:'transition-showcase',referenceJob:'tournament-rock-en-transitions-20261112',purpose:'全9境界の演出比較。通常の機能紹介とは区別'}});
const deliveries={
 'tournament-20261112':{subject:'トーナメント',tone:'機能紹介',language:'日本語',variant:'初版',description:'抽選・対戦・勝利・優勝のAnimation Previewを紹介する20秒版。'},
 'tournament-rock-20261112':{subject:'トーナメント',tone:'迫力',language:'日本語',variant:'ロック',description:'2秒×9カット＋最後4秒、180BPMのロック調CM。'},
 'tournament-rock-en-transitions-20261112':{subject:'トーナメント',tone:'迫力',language:'英語',variant:'9種転換',description:'画面内も英語化し、全9か所で異なる切り替えを見せるロック調CM。'},
 'dd-rock-20261112':{subject:'DD',tone:'迫力',language:'日本語',variant:'給与勤怠照合',description:'架空CSVによる給与×勤怠の突合と根拠確認を見せるロック調CM。'},
};
for(const [job,meta]of Object.entries(deliveries)){
 const request=read(path.join(studio,'jobs',job,'request.json')),plan=read(path.join(studio,'jobs',job,'composition.json'));
 const deliveryPath=path.join(studio,'jobs',job,'delivery.json');
 if(!fs.existsSync(deliveryPath))write(`jobs/${job}/delivery.json`,{...meta,date:'20261112',version:1});
 const dd=job.startsWith('dd-'),en=job.includes('-en-');
 const defs=dd?[['input','input.jpg','給与・勤怠資料の入力','before'],['scan','scan','給与×勤怠の突合','operation'],['result','result.jpg','突合結果','result'],['evidence','evidence.jpg','結果の根拠確認','result']]:[['draw','draw','ペア発表','operation'],['vs','vs','対戦演出','operation'],['result','result','勝利演出','result'],['champion','champion','優勝演出','result']];
 const root=dd?'captures/dd':en?'captures/tournament-en':'captures';
 const assets=defs.map(([id,name,feature,phase])=>{
  const p=`${root}/${name}`,abs=path.join(studio,'public',p),seq=fs.statSync(abs).isDirectory();
  const frames=seq?fs.readdirSync(abs).filter(n=>n.endsWith('.jpg')).length:1;
  return {id,path:p,kind:seq?'image-sequence':'still',frames,fps:30,availableSeconds:seq?frames/30:null,feature,phase,sample:true,verification:'captured',source:request.source,provenance:dd?'実画面を架空CSVで操作':'既存Animation Preview。実際の本番大会ではない',localization:en?'撮影時に表示テキストを英語化':'元画面の表示',evidence:dd?'captures/evidence.json':en?'captures/evidence.json':'../tournament-20261112/captures/evidence.json',focusRegion:{x:0,y:0,width:1,height:1,status:'full-frame; crop review required'},textDensity:'high',verticalCrop:'unreviewed',rights:'元画面の素材利用条件は要確認',moodTags:{value:dd?['professional','forensic']:['energetic','event'],status:'provisional'}};
 });
 write(`jobs/${job}/assets.json`,{version:1,job,captureMode:request.captureMode,assets,notes:['静止画の表示時間は構成側で指定','撮影尺より長いシーンは末尾保持か素材追加が必要。撮影尺を偽らない','この一覧は素材の所在と根拠を記録するもの。全機能の検証ではない']});
 if(plan.transitions)write('src/catalog/transition-tags.json',plan.transitions.map((t,i)=>({...t,mood:['energetic','cinematic'],energy:i===4?3:5,pace:'fast',role:['transition'],runtimeStatus:'verified',tagStatus:'provisional',verificationPath:`jobs/${job}/qa/result.json`,implementationPath:'src/transitions/variety.tsx',aspectRatios:['16:9']})));
}
console.log('Seeded 60 provisional motion tags, 9 transition tags, 4 presets and 4 asset/delivery manifests.');
