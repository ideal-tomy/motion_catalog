import test from 'node:test';
import assert from 'node:assert/strict';
import example from '../examples/example-project.json' with {type:'json'};
import {clone,previewPatch,validateProject,type Project} from '../src/core.ts';
import {ensureState,snapshotOf,diffProjects,buildHandoff,targetExists,validateHandoff,type HandoffRecord} from '../src/handoff.ts';
const fresh=()=>{const p=clone(example) as Project;p.locks=[];p.meta={userEdits:[]};p.scenes.forEach(s=>s.layers.forEach(l=>l.locked=false));return p;};
const record=(p:Project):HandoffRecord=>({id:'hf-unit-001',targetRevision:p.revision,purpose:'implement',createdAt:'2026-11-13T12:00:00.000Z',selectedNoteIds:[],allowedTargets:[],exportPaths:[]});
test('ID差分：最終値だけ・Undo相当で消える・レイヤーとコマの並び替えを独立検出',()=>{
 const before=fresh(),p=clone(before),s=p.scenes[0],l=s.layers[0];l.transform.width=.42;s.colorOverrides.background='#abcdef';delete s.colorOverrides.background;
 const diff=diffProjects(before,p);assert.equal(diff.length,1);assert.equal(diff[0].layerId,l.layerId);assert.equal(diff[0].field,'transform.width');assert.equal(diff[0].after,.42);
 l.transform.width=before.scenes[0].layers[0].transform.width;assert.equal(diffProjects(before,p).length,0);
 [p.scenes[0],p.scenes[1]]=[p.scenes[1],p.scenes[0]];const order=diffProjects(before,p);assert.equal(order.length,1);assert.equal(order[0].field,'scenes.$order');
 const assets=clone(before);assets.assets.reverse();assert.equal(diffProjects(before,assets).length,0);
 const layerBaseline=clone(before);layerBaseline.scenes[0].layers.push({...clone(layerBaseline.scenes[0].layers[0]),layerId:'order-second-layer'});validateProject(layerBaseline);const layers=clone(layerBaseline);layers.scenes[0].layers.reverse();const layerOrder=diffProjects(layerBaseline,layers);assert.equal(layerOrder.length,1);assert.equal(layerOrder[0].field,'layers.$order');assert.equal(layerOrder[0].sceneId,before.scenes[0].sceneId);
});
test('素材参照変更も検出し、メモ追加や保存版だけの変更は映像差分に混ぜない',()=>{
 const before=fresh(),p=clone(before);p.revision+=4;ensureState(p);assert.equal(diffProjects(before,p).length,0);p.scenes[0].layers[0].assetId='asset-new';assert.equal(diffProjects(before,p)[0].field,'assetId');assert.equal(ensureState(p).checkpoints.length,0);assert.equal(snapshotOf(p).meta?.handoff,undefined);
});
test('20・30・40秒のレポートで保存JSONの正確な時間と、目的ごとの説明を生成',()=>{
 for(const seconds of [20,30,40]){const p=fresh();p.scenes=p.scenes.slice(0,2);p.scenes[0].durationFrames=seconds*15;p.scenes[1].durationFrames=seconds*15;p.video.targetDurationFrames=seconds*30;const r=record(p),a=buildHandoff(p,null,r,[]);assert.equal(a.report.facts.totalFrames,seconds*30);assert.ok(a.markdown.includes(`${seconds}秒／30fps`));assert.ok(a.markdown.includes(`${seconds/2}–${seconds}秒`));assert.equal(a.report.compared,false);const b=buildHandoff(p,null,{...r,purpose:'render'},[]);assert.ok(b.markdown.includes('現在のJSONのまま'));assert.deepEqual(a.report.facts,b.report.facts);assert.ok(b.markdown.includes('MP4再現は未検証'));}
});
test('対象を削除してもメモを他レイヤーへ付け替えず、対応済みを希望として再依頼しない',()=>{
 const p=fresh(),h=ensureState(p),sceneId=p.scenes[1].sceneId,layerId=p.scenes[1].layers[0].layerId;
 h.notes.push({id:'note-orphan',projectId:p.projectId,scope:'layer',sceneId,layerId,targetName:'元の文字対象',text:'タイプライターにしたい',kind:'wish',status:'done',createdAt:'2026-11-13T12:00:00Z',updatedAt:'2026-11-13T12:00:00Z'});p.scenes[1].layers=[];assert.equal(targetExists(p,h.notes[0]),false);validateProject(p);const r={...record(p),selectedNoteIds:['note-orphan']},a=buildHandoff(p,null,r,[]);assert.equal(a.report.notes[0].layerId,layerId);assert.equal(a.report.notes[0].orphan,true);assert.ok(a.report.warnings.length);assert.ok(a.markdown.includes('対応済み（再実装の依頼ではありません）'));assert.equal(a.markdown.split('### 未実装の希望')[1].split('### 確認してほしい点')[0].includes('タイプライターにしたい'),false);
});
test('引き継ぎのpatchは選択レイヤーだけ。対象外・IDなし・古い版・手動確定を拒否',()=>{
 const p=fresh(),s=p.scenes[0],l=s.layers.find(l=>l.kind==='text')!,h=ensureState(p),r=record(p);r.allowedTargets=[{scope:'layer',sceneId:s.sceneId,layerId:l.layerId}];h.records=[r];h.activeHandoffId=r.id;
 const proposal={proposalId:'patch-unit',baseRevision:p.revision,targetSceneId:s.sceneId,reason:'メモの対象のみ',handoffId:r.id,operations:[{op:'setLayerText',sceneId:s.sceneId,layerId:l.layerId,text:'承認待ちの文字'}]};
 assert.equal(previewPatch(p,proposal).next.scenes[0].layers.find(v=>v.layerId===l.layerId)?.text,'承認待ちの文字');assert.throws(()=>previewPatch(p,{...proposal,handoffId:undefined}));assert.throws(()=>previewPatch(p,{...proposal,operations:[{op:'setSceneDuration',sceneId:s.sceneId,durationFrames:80}]}));
 p.meta!.userEdits=[`layer:${l.layerId}.text`];assert.throws(()=>previewPatch(p,proposal));p.meta!.userEdits=[];p.revision++;assert.throws(()=>previewPatch(p,{...proposal,baseRevision:p.revision}));
});
test('別作品のメモ・危険なスナップショットパスを保存しない',()=>{
 const p=fresh(),h=ensureState(p);h.notes=[{id:'note-invalid',projectId:'other-project',scope:'project',targetName:'全体',text:'メモ',kind:'wish',status:'open',createdAt:'2026-11-13T12:00:00Z',updatedAt:'2026-11-13T12:00:00Z'}];assert.throws(()=>validateHandoff(p));h.notes=[];h.checkpoints=[{id:'cp-invalid',projectId:p.projectId,label:'基準',createdAt:'2026-11-13T12:00:00Z',projectVersion:1,sha256:'a'.repeat(64),storedPath:'../other.json'}];assert.throws(()=>validateHandoff(p));
});
test('配色だけの固定は対象の緩急調整を妨げず、固定配色は変更できない',()=>{const p=fresh(),s=p.scenes[0];p.locks=[{scope:'scene',targetId:s.sceneId,field:'colorOverrides'}];const proposal={proposalId:'patch-pace',baseRevision:p.revision,targetSceneId:s.sceneId,reason:'配色維持で緩急だけ',operations:[{op:'setPaceKeyframes',sceneId:s.sceneId,paceKeyframes:[{position:0,intensity:0},{position:1,intensity:10}]}]};assert.ok(previewPatch(p,proposal).next);assert.throws(()=>previewPatch(p,{...proposal,operations:[{op:'setSceneTheme',sceneId:s.sceneId,colorOverrides:{background:'#ffffff'}}]}));});
