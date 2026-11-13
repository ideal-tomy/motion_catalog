import type {Project,Proposal} from './core.ts';
export type NoteKind='wish'|'review'|'export';
export type NoteStatus='open'|'waiting'|'done'|'held';
export type Purpose='implement'|'render'|'review';
export type EditNote={id:string;projectId:string;scope:'project'|'scene'|'layer';sceneId?:string;layerId?:string;targetName:string;text:string;kind:NoteKind;status:NoteStatus;createdAt:string;updatedAt:string};
export type Checkpoint={id:string;projectId:string;label:string;createdAt:string;projectVersion:number;sha256:string;storedPath:string};
export type Target={scope:'project'|'scene'|'layer';sceneId?:string;layerId?:string};
export type HandoffRecord={id:string;baselineCheckpointId?:string;targetRevision:number;purpose:Purpose;createdAt:string;selectedNoteIds:string[];allowedTargets:Target[];exportPaths:string[]};
export type HandoffState={version:1;notes:EditNote[];checkpoints:Checkpoint[];records:HandoffRecord[];baselineId?:string;activeHandoffId?:string};
export type Change={scope:'project'|'scene'|'layer';sceneId?:string;layerId?:string;field:string;label:string;before:unknown;after:unknown;origin:'manual'|'confirmed'};
export type ManifestItem={assetId:string;originalName:string;mediaType:string;storedPath:string;licenseOrSource:string;available?:boolean;sha256?:string;bytes?:number;warning?:string};
export const purposeNames={implement:'未実装の演出をCodexに依頼',render:'現在の確定状態を動画に書き出す',review:'レビュー・調整相談'};
export const kindNames={wish:'未実装の希望',review:'確認してほしい点',export:'書き出し時の注意'};
export const statusNames={open:'未対応',waiting:'確認待ち',done:'対応済み',held:'保留'};
export const stateOf=(p:Project):HandoffState=>(p.meta?.handoff as HandoffState|undefined)??{version:1,notes:[],checkpoints:[],records:[]};
export function ensureState(p:Project){p.meta??={};if(!p.meta.handoff)p.meta.handoff={version:1,notes:[],checkpoints:[],records:[]};return p.meta.handoff as HandoffState;}
export const stable=(v:unknown):string=>JSON.stringify(v,(_,x)=>x&&typeof x==='object'&&!Array.isArray(x)?Object.fromEntries(Object.keys(x).sort().map(k=>[k,x[k]])):x);
export function snapshotOf(p:Project){const copy=structuredClone(p);if(copy.meta)delete copy.meta.handoff;return copy;}
export function targetExists(p:Project,n:Target){if(n.scope==='project')return !n.sceneId&&!n.layerId;const s=p.scenes.find(s=>s.sceneId===n.sceneId);return !!s&&(n.scope==='scene'?!n.layerId:s.layers.some(l=>l.layerId===n.layerId));}
export function targetName(p:Project,t:Target){if(t.scope==='project')return `作品全体「${p.title}」 [${p.projectId}]`;const s=p.scenes.find(s=>s.sceneId===t.sceneId),i=p.scenes.indexOf(s!);if(!s)return `削除済みコマ [${t.sceneId}]`;const scene=`コマ${String(i+1).padStart(2,'0')} [${s.sceneId}]`;if(t.scope==='scene')return scene;const l=s.layers.find(l=>l.layerId===t.layerId);return `${scene}／${l?l.kind==='text'?`文字「${(l.text??'').slice(0,30)}」`:l.style?.presentation==='background'?'背景素材':l.style?.frame&&l.style.frame!=='none'||l.style?.mask&&l.style.mask!=='rect'?'フレーム素材':l.kind:'削除済みレイヤー'} [${t.layerId}]`;}
const uid=(v:unknown)=>typeof v==='string'&&/^[-a-zA-Z0-9_]{2,80}$/.test(v);
export function validateHandoff(p:Project){
 if(p.meta?.handoff===undefined)return;if(!p.meta.handoff||typeof p.meta.handoff!=='object')throw Error('引き継ぎメタデータが不正です');const h=stateOf(p);
 if(!h||h.version!==1||!Array.isArray(h.notes)||h.notes.length>300||!Array.isArray(h.checkpoints)||h.checkpoints.length>100||!Array.isArray(h.records)||h.records.length>100)throw Error('引き継ぎメタデータが不正です');
 for(const list of [h.notes,h.checkpoints,h.records])if(new Set(list.map(v=>v.id)).size!==list.length)throw Error('引き継ぎIDが重複しています');
 for(const n of h.notes)if(!uid(n.id)||n.projectId!==p.projectId||!['project','scene','layer'].includes(n.scope)||n.scope!=='project'&&!uid(n.sceneId)||n.scope==='layer'&&!uid(n.layerId)||typeof n.targetName!=='string'||n.targetName.length>500||typeof n.text!=='string'||!n.text.trim()||n.text.length>4000||!Object.hasOwn(kindNames,n.kind)||!Object.hasOwn(statusNames,n.status)||!Number.isFinite(Date.parse(n.createdAt))||!Number.isFinite(Date.parse(n.updatedAt)))throw Error('修正メモが不正です');
 for(const c of h.checkpoints)if(!uid(c.id)||c.projectId!==p.projectId||typeof c.label!=='string'||!c.label.trim()||c.label.length>120||!Number.isFinite(Date.parse(c.createdAt))||!Number.isInteger(c.projectVersion)||c.projectVersion<1||c.storedPath!==`checkpoints/${c.id}.json`||!/^([a-f0-9]{64})$/.test(c.sha256))throw Error('チェックポイントが不正です');
 if(h.baselineId&&!h.checkpoints.some(c=>c.id===h.baselineId))throw Error('基準チェックポイントがありません');
 for(const r of h.records)if(!uid(r.id)||!Object.hasOwn(purposeNames,r.purpose)||!Number.isInteger(r.targetRevision)||!Number.isFinite(Date.parse(r.createdAt))||!Array.isArray(r.selectedNoteIds)||r.selectedNoteIds.some(id=>!uid(id))||!Array.isArray(r.allowedTargets)||r.allowedTargets.some(t=>!['project','scene','layer'].includes(t.scope)||t.scope!=='project'&&!uid(t.sceneId)||t.scope==='layer'&&!uid(t.layerId))||!Array.isArray(r.exportPaths)||r.exportPaths.some(path=>!new RegExp(`^exports/${r.id}/[a-z-]+\\.(md|json|zip)$`).test(path)))throw Error('引き継ぎ記録が不正です');
 if(h.activeHandoffId&&!h.records.some(r=>r.id===h.activeHandoffId&&r.purpose==='implement'))throw Error('有効な引き継ぎ記録がありません');
}
const fieldNames:Record<string,string>={x:'横位置',y:'縦位置',width:'幅',height:'高さ',rotateDeg:'回転',durationFrames:'表示尺',inFrame:'表示開始',durationPolicy:'尺変更方針',text:'文字',color:'文字色',background:'背景色',accent:'アクセント',mask:'マスク',frame:'枠',presentation:'表示方法',mediaZoom:'素材内の拡大率',cropX:'切り抜き横位置',cropY:'切り抜き縦位置',assetId:'素材参照',animations:'個別アニメーション',parentFrameId:'親フレーム',motionStack:'モーション',layout:'画面構成',visible:'表示',opacity:'透明度',zIndex:'重ね順','$order':'並び順'};
export function diffProjects(before:Project,after:Project):Change[]{
 const changes:Change[]=[];
 const walk=(a:unknown,b:unknown,field:string,target:Target)=>{
  if(stable(a)===stable(b))return;
  const mapKey=field==='scenes'?'sceneId':(field==='layers'||field.endsWith('.layers'))?'layerId':field==='assets'?'assetId':field==='audioTracks'?'trackId':null;
  if(mapKey&&Array.isArray(a)&&Array.isArray(b)){
   const am=new Map(a.map(v=>[v[mapKey],v])),bm=new Map(b.map(v=>[v[mapKey],v]));
   for(const id of new Set([...am.keys(),...bm.keys()])){const next=mapKey==='sceneId'?{scope:'scene' as const,sceneId:id}:mapKey==='layerId'?{scope:'layer' as const,sceneId:target.sceneId,layerId:id}:target;walk(am.get(id),bm.get(id),mapKey==='sceneId'?'':mapKey==='layerId'?'':`${field}[${id}]`,next);}
   if(['sceneId','layerId'].includes(mapKey)){const x=a.map(v=>v[mapKey]),y=b.map(v=>v[mapKey]);if(stable(x)!==stable(y)&&x.length===y.length&&x.every(v=>y.includes(v)))walk(x,y,field+'.$order',target);}return;
  }
  if(a&&b&&typeof a==='object'&&typeof b==='object'&&!Array.isArray(a)&&!Array.isArray(b)){for(const key of new Set([...Object.keys(a),...Object.keys(b)])){if(['sceneId','layerId'].includes(key)&&!field)continue;walk((a as Record<string,unknown>)[key],(b as Record<string,unknown>)[key],field?field+'.'+key:key,target);}return;}
  const id=target.scope==='project'?after.projectId:target.scope==='scene'?target.sceneId:target.layerId;
  const manual=(after.meta?.userEdits??[]).some(k=>k===`${target.scope}:${id}.${field}`||`${target.scope}:${id}.${field}`.startsWith(k+'.'));
  changes.push({...target,field,label:targetName(after,target)+'／'+(fieldNames[field.split('.').at(-1)!]??field),before:a??null,after:b??null,origin:manual?'manual':'confirmed'});
 };
 const keys=['title','brief','video','theme','assets','scenes','audioTracks','locks'] as const;
 for(const key of keys)walk(before[key],after[key],key,{scope:'project'});
 return changes;
}
export function formatValue(value:unknown,field:string,fps:number){
 if(value===null||value===undefined)return 'なし';
 if(typeof value==='number'){
  if(/Frames$|inFrame$|startFrame$/.test(field))return `${value}f（${Number((value/fps).toFixed(4))}秒）`;
  if(/transform\.(x|y|width|height)$/.test(field))return `${Number((value*100).toFixed(4))}%（正規化値 ${value}）`;
  if(/rotateDeg$/.test(field))return `${value}°`;
  if(/video\.(width|height)$|fontSize$/.test(field))return `${value}px`;
  if(/crop[XY]$/.test(field))return `${value}%`;
  if(/mediaZoom$|playbackRate$/.test(field))return `${value}倍`;
  if(/splitRatio$|opacity$|\.position$/.test(field))return `${Number((value*100).toFixed(4))}%（正規化値 ${value}）`;
  if(/\.fps$/.test(field))return `${value}fps`;
 }
 return typeof value==='string'?JSON.stringify(value):stable(value);
}
export function enforceHandoffScope(p:Project,proposal:Proposal&{handoffId?:string}){
 const h=stateOf(p),active=proposal.handoffId??h.activeHandoffId;if(!active)return;
 const r=h.records.find(r=>r.id===active);
 if(proposal.handoffId!==active||!r||r.purpose!=='implement'||r.targetRevision!==p.revision)throw Error('引き継ぎID・保存版が一致しません。最新の引き継ぎから提案してください');
 for(const o of proposal.operations){const layerOp=['setLayerText','setLayerMotionStack'].includes(o.op);if(!r.allowedTargets.some(t=>t.scope==='scene'&&t.sceneId===o.sceneId||t.scope==='layer'&&layerOp&&t.sceneId===o.sceneId&&t.layerId===o.layerId))throw Error('選択された修正メモの対象外です。未指定のコマ・レイヤーは変更できません');}
}
const md=(s:unknown)=>String(s??'').replace(/\r/g,'').replace(/\n/g,' / ').replace(/`/g,'ˋ');
export function buildHandoff(p:Project,baseline:Project|null,record:HandoffRecord,manifest:ManifestItem[],warnings:string[]=[]){
 const h=stateOf(p),cp=h.checkpoints.find(c=>c.id===record.baselineCheckpointId),changes=baseline?diffProjects(baseline,p):[];
 const notes=record.selectedNoteIds.map(id=>h.notes.find(n=>n.id===id)).filter((n):n is EditNote=>!!n);
 const facts={projectId:p.projectId,revision:p.revision,title:p.title,video:p.video,totalFrames:p.scenes.reduce((n,s)=>n+s.durationFrames,0),theme:p.theme,scenes:p.scenes,audioTracks:p.audioTracks,locks:p.locks};
 const orphan=notes.filter(n=>!targetExists(p,n));
 const report={version:1,record,sourceProjectId:p.projectId,sourceRevision:p.revision,createdAt:record.createdAt,purpose:record.purpose,baseline:cp??null,compared:!!baseline,facts,changes,notes:notes.map(n=>({...n,orphan:!targetExists(p,n)})),assetManifest:manifest,renderCompatibility:{preview:'このレポートでの全コマ再生は未検査。編集ツールに試着機能あり。',mp4:'編集ツールのMP4出力接続は未対応。今回の保存状態のMP4再現は未検証。'},warnings:[...warnings,...orphan.map(n=>`${n.id}: 対象が削除されています。再割り当てせず保留してください。`)],protectedScope:{manualFields:p.meta?.userEdits??[],locked:p.locks,allowedTargets:record.allowedTargets}};
 const lines=[`# AI PROMO STUDIO｜編集引き継ぎレポート`,'',`- 作品：${md(p.title)} [${p.projectId}]`,`- 正本：project.json／保存版 v${p.revision}`,`- 基準：${cp?`${md(cp.label)} [${cp.id}]／v${cp.projectVersion}`:'未選択（差分比較は未実施）'}`,`- 作成：${record.createdAt}`,`- 目的：${purposeNames[record.purpose]}`,`- 総尺：${facts.totalFrames}f／${facts.totalFrames/p.video.fps}秒／${p.video.fps}fps／${p.video.width}×${p.video.height}px`,'','## A｜現在確定している状態',`この内容は保存済みの事実です。未実装の希望として再実装しないでください。`,`- 全体配色：${stable(p.theme.palette)}`];
 let start=0;
 for(const s of p.scenes){lines.push('',`### ${targetName(p,{scope:'scene',sceneId:s.sceneId})}`,`- 区間：${start}–${start+s.durationFrames}f（${start/p.video.fps}–${(start+s.durationFrames)/p.video.fps}秒）`,`- 構成：${stable(s.layout)}／コマ配色：${stable(s.colorOverrides)}`,`- コマの動き：${stable(s.motionStack??[])}／個別アニメーション：${stable(s.animations??[])}／緩急：${stable(s.paceKeyframes)}`);start+=s.durationFrames;for(const l of s.layers){lines.push(`- ${targetName(p,{scope:'layer',sceneId:s.sceneId,layerId:l.layerId})}`,`  - 素材：${l.assetId??'なし'}／文字：${md(l.text??'なし')}`,`  - 位置：x=${l.transform.x*100}%、y=${l.transform.y*100}%、幅=${l.transform.width*100}%、高さ=${l.transform.height*100}%、回転=${l.transform.rotateDeg}°`, `  - 表示：${l.inFrame}fから${l.durationFrames}f／重ね順=${l.zIndex}／透明度=${l.opacity}／可視=${l.visible}／固定=${l.locked}`,`  - スタイル：${stable(l.style??{})}`,`  - 動き：${stable(l.motionStack)}／個別アニメーション：${stable(l.animations??[])}`);}}
 lines.push('','### 音声',...p.audioTracks.map(a=>`- ${stable(a)}`),...(p.audioTracks.length?[]:['- 音声トラックなし']), '','## B｜基準からの確定差分');
 lines.push(...(!baseline?['- 基準未選択のため比較していません。']:!changes.length?['- 最終状態に残る差分はありません。取り消した変更は含めていません。']:changes.map(c=>`- ${md(c.label)}：${md(formatValue(c.before,c.field,baseline.video.fps))} → ${md(formatValue(c.after,c.field,p.video.fps))}（${c.origin==='manual'?'手動編集済み':'確定差分・操作由来は未記録'}）`)));
 lines.push('','## C｜まだ実現していない希望・要確認事項',record.purpose==='render'?'この目的では以下の希望を新規実装しません。現在のJSONのまま出力するための参考事項です。':'選択されたメモだけを記載します。メモは希望・質問であり、実装済みの事実ではありません。');
 for(const kind of ['wish','review','export'] as const){lines.push('',`### ${kindNames[kind]}`);const list=notes.filter(n=>n.kind===kind&&n.status!=='done');lines.push(...(list.length?list.map(n=>`- [${n.id}] ${n.targetName}／${statusNames[n.status]}${targetExists(p,n)?'':'／対象削除済み'}：${md(n.text)}`):['- 選択なし']));}
 lines.push('','### 対応済み（再実装の依頼ではありません）',...notes.filter(n=>n.status==='done').map(n=>`- [${n.id}] ${n.targetName}：${md(n.text)}`),'','## 変更禁止範囲',`- 許可対象：${record.allowedTargets.length?record.allowedTargets.map(t=>targetName(p,t)).join('、'):'なし。この資料は新規変更を許可しません。'}`,`- 未指定のコマ・レイヤー・素材・尺・配色・配置は維持。手動確定項目と固定値も維持。`,`- 手動保護：${stable(p.meta?.userEdits??[])}`,`- 固定：${stable(p.locks)}`,`- 既存patchを使う場合：handoffId=${record.id}、baseRevision=${p.revision}。差分確認・採用・取消・Undoを必須とする。`,'','## 素材と復元条件',...manifest.map(a=>`- [${a.assetId}] ${md(a.originalName)}／${a.mediaType}／${a.storedPath}／${a.available===false?'ファイル不明・復元不可':'ローカルファイル参照'}／${md(a.licenseOrSource)}`),'','## 出力・検証',`- ${record.purpose==='render'?'現在の確定JSONをそのまま書き出す。未対応メモを映像に追加しない。':record.purpose==='review'?'レビューと相談のみ。現在の映像を変更しない。':'選択された未対応メモの範囲で実装案を作り、採用前に差分を確認する。'}`,`- 音声・解像度・fps・区間は上記の正本と一致させる。`,`- プレビュー：${report.renderCompatibility.preview}`,`- MP4：${report.renderCompatibility.mp4}`,`- 実装後に全コマ再生・素材欠落・文字切れ・音声・最終出力の一致を確認する。`,'','## 警告',...(report.warnings.length?report.warnings.map(w=>`- ${md(w)}`):['- この時点で素材参照の警告なし。映像品質の検証を意味するものではありません。']));
 return {report,markdown:lines.join('\n')+'\n'};
}


