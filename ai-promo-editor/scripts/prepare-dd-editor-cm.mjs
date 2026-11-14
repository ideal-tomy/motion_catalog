import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {validateProject,totalFrames} from '../src/core.ts';
const p=JSON.parse(fs.readFileSync('examples/example-project.json','utf8')),projectId='dd-cm-editor-20261113-v01',folder=path.resolve('workspace/projects',projectId),job=path.resolve('../promo-studio/jobs/dd-editor-premium-20261113');
if(fs.existsSync(folder))throw Error('Project already exists; preserve it and use another version');
fs.mkdirSync(path.join(folder,'assets'),{recursive:true});fs.mkdirSync(job,{recursive:true});
p.projectId=projectId;p.revision=1;p.title='DD｜根拠が、判断を変える。30秒・10コマCM';p.brief='高級感と信頼。DDデモの実画面を切り抜き、説明文を詰めずに判断と根拠を印象づける。10コマ、30秒、編集可能な文字・画像・図形・BGM。';p.video={fps:30,width:1920,height:1080,targetDurationFrames:900,durationPolicy:'ripple'};
p.theme={requestedColors:{primary:'#12232d',secondary:'#bcaa85'},palette:{background:'#12232d',surface:'#1b3540',text:'#f3f0e9',primary:'#12232d',accent:'#bcaa85',mutedText:'#9eafb7'}};
p.assets=[];p.scenes=[];p.locks=[];p.meta={importMode:'editable-source-sample',productionKind:'editable-commercial',sourceJob:'promo-studio/jobs/dd-editor-premium-20261113',sampleData:true,renderComponent:'ProjectComposition'};
for(const name of ['overview','result','evidence-card','evidence','input']){const assetId='dd-'+name;fs.copyFileSync(path.resolve('../promo-studio/public/captures/dd',name+'.jpg'),path.join(folder,'assets',assetId+'.jpg'));const thumb=spawnSync(path.resolve('../promo-studio/node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe'),['-v','error','-y','-i',path.join(folder,'assets',assetId+'.jpg'),'-vf','scale=320:-1','-frames:v','1',path.join(folder,'assets',assetId+'.thumb.jpg')],{windowsHide:true,encoding:'utf8'});if(thumb.status!==0)throw Error(thumb.stderr);p.assets.push({assetId,kind:'image',path:'assets/'+assetId+'.jpg',posterPath:'assets/'+assetId+'.thumb.jpg',originalName:'DDデモ実画面・'+name+'.jpg',license:'DDローカルデモの既存撮影素材。氏名・数値は架空サンプル。',verifiedForUse:true});}
fs.copyFileSync(path.resolve('../promo-studio/public/audio/dd-signature-original.wav'),path.join(folder,'assets/dd-original-bgm.wav'));p.assets.push({assetId:'dd-bgm',kind:'audio',path:'assets/dd-original-bgm.wav',originalName:'DD オリジナル30秒BGM.wav',license:'既存制作環境で生成したオリジナルBGM',verifiedForUse:true,durationSeconds:30});p.audioTracks=[{trackId:'dd-bgm-track',assetId:'dd-bgm',startFrame:0,durationFrames:900,volume:.72,fadeInFrames:18,fadeOutFrames:45}];
const specs=[
 ['EVIDENCE FOR DECISIONS','根拠が、\n判断を変える。','overview',3,'A-019',false],
 ['01 / RECONCILE','差異を、捉える。','result',3,'A-020',false],
 ['02 / DISCOVER','小さな違いに、\n目を向ける。','result',3,'A-017',true],
 ['03 / TRACE','数字から、\n根拠へ。','evidence-card',3,'A-024',false],
 ['04 / PERSPECTIVE','全体像を、\n見失わない。','overview',3,'A-018',true],
 ['05 / EVIDENCE','判断のそばに、\n確かな情報を。','evidence-card',3,'A-013',false],
 ['06 / CONNECT','発見と根拠が、\nつながる。','result',3,'A-011',true],
 ['A CLEARER PERSPECTIVE','見抜く。\nその先へ。','overview',3,'A-002',false],
 ['THE NEXT MOVE','次の一手を、\n確かなものに。','evidence-card',2,'A-007',true],
 ['AXEON / DD INTELLIGENCE','確信をもって、次の一手へ。',null,4,'A-009',false]
];
const shotPlan=[];let start=0;
for(const [i,[label,copy,asset,seconds,presetId,light]]of specs.entries()){
 const durationFrames=seconds*30,s={sceneId:'dd-cm-scene-'+String(i+1).padStart(2,'0'),role:i===0?'intro':i===9?'cta':'feature',durationFrames,layout:{type:'free',direction:'horizontal',splitRatio:.5,cells:1},paceKeyframes:[{position:0,intensity:20},{position:1,intensity:40}],colorOverrides:light?{background:'#f3f0e9',surface:'#e6e2d9',text:'#12232d',primary:'#12232d',accent:'#8c7957',mutedText:'#66737b'}:{},unplacedLayerIds:[],layers:[],motionStack:[]};
 const add=(name,kind,x,y,width,height,options={})=>{const l={layerId:`dd-${i+1}-${name}`,kind,zIndex:s.layers.length+1,inFrame:0,durationFrames,opacity:1,visible:true,locked:false,transform:{x,y,width,height,rotateDeg:0},style:{mask:'rect',cellIndex:0,...options.style},motionStack:[],...options};s.layers.push(l);return l;};
 const text=(name,value,x,y,w,h,size,token='text',align='left',family='Yu Gothic')=>add(name,'text',x,y,w,h,{text:value,style:{fontSize:size,colorToken:token,align,fontFamily:family,mask:'rect'}});
 text('brand','AXEON',.065,.047,.45,.035,20,'accent','left','Arial');text('suite','DD INTELLIGENCE',.65,.047,.285,.035,18,'mutedText','right','Arial');
 text('disclosure','画面・氏名・数値はデモ用サンプル。最終判断は人が行います。',.065,.94,.87,.03,18,'mutedText');
 let media;
 if(i===9){const brand=text('hero-brand','AXEON',.11,.24,.78,.23,155,'text','center','Georgia');text('brand-caption','DD INTELLIGENCE',.11,.48,.78,.06,31,'accent','center','Arial');text('headline',copy,.08,.60,.84,.09,52,'text','center');text('cta','DDデモを体験する　↗',.15,.77,.70,.06,29,'accent','center');media=brand;}
 else {const wide=[1,2,4,6].includes(i);text('chapter',label,.065,wide?.13:.17,.86,.05,20,'accent','left','Arial');text('headline',copy,.065,wide?.215:.29,wide?.87:.54,wide?.24:.36,i===7?110:wide?84:96);
  let rect=wide?{x:i===4?0:.065,y:.48,w:i===4?1:.87,h:.36}:{x:.59,y:.235,w:.36,h:.60};
  if(i===0)rect={x:.63,y:.235,w:.37,h:.59};if(i===6)rect={x:.065,y:.49,w:.55,h:.32};if(i===7)rect={x:.60,y:.23,w:.40,h:.64};if(i===8)rect={x:.59,y:.22,w:.36,h:.62};
  media=add('media','image',rect.x,rect.y,rect.w,rect.h,{assetId:'dd-'+asset,zIndex:0,style:{fit:asset==='evidence-card'?'contain':'cover',mask:i===0||i===7?'diagonal-left':'rect',frame:'none',presentation:'layer',mediaZoom:i===4?1.08:1,cropX:asset==='overview'?70:50,cropY:asset==='result'?0:50}});
  if(i===6)add('proof','image',.67,.40,.28,.43,{assetId:'dd-evidence-card',zIndex:0,style:{fit:'contain',mask:'rect',frame:'none'}});
 }
 const scope=presetId==='A-024'?'imageContent':media.kind==='text'?'text':'frame',params={direction:presetId==='A-007'?'up':presetId==='A-002'?'right':'left',exitBoundary:scope==='imageContent'?'parentFrame':'canvas',easing:presetId==='A-024'?'linear':'easeOut',overshootPx:32,scale:.94,rotationDeg:-3,distancePx:presetId==='A-024'?24:0,fromCurrentPosition:true};
 media.animations=[{id:'dd-animation-'+(i+1),presetId,targetLayerId:media.layerId,targetScope:scope,startFrame:i===8?39:0,durationFrames:i===8?21:i===1?75:i===3?90:i===9?32:26,params,afterEnd:'holdEnd'}];
 p.scenes.push(s);shotPlan.push({sceneId:s.sceneId,from:start/30,to:(start+durationFrames)/30,presetId,label,copy,sourceAsset:asset,editableLayers:s.layers.length});start+=durationFrames;
}
validateProject(p);if(totalFrames(p)!==900)throw Error('Must be 30 seconds');if(new Set(shotPlan.map(s=>s.presetId)).size!==10)throw Error('Repeated primary preset');
const json=JSON.stringify(p,null,2);fs.writeFileSync(path.join(folder,'project.json'),json);fs.writeFileSync(path.join(job,'project.json'),json);fs.writeFileSync(path.join(job,'composition.json'),JSON.stringify({compositionId:'SavedEditorProject',projectId,scenes:shotPlan},null,2));fs.writeFileSync(path.join(job,'request.json'),JSON.stringify({durationSeconds:30,fps:30,width:1920,height:1080,subject:'DD',style:'高級感・信頼感',editable:true},null,2));fs.writeFileSync(path.join(job,'delivery.json'),JSON.stringify({subject:'DD',tone:'高級感・信頼感',language:'日本語',variant:'編集可能10コマCM',description:'保存済みの編集プロジェクトから共通描画で出力した30秒CM。10コマ・10種の異なる主モーション・文字と素材を個別編集。',date:'20261113',version:1},null,2));
console.log(JSON.stringify({projectId,job,frames:900,scenes:10,layers:p.scenes.reduce((n,s)=>n+s.layers.length,0)}));
