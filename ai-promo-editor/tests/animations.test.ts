import test from 'node:test';
import assert from 'node:assert/strict';
import example from '../examples/example-project.json' with {type:'json'};
import {clone,validateProject,type Project} from '../src/core.ts';
import {splitSceneAt} from '../src/clip-edit.ts';
import {remapSceneAnimations} from '../src/animations.ts';
import {aabb,animationCatalog,evaluateAnimations,makeAnimation,exitDelta,conflicts,type Rect} from '../src/animations.ts';
test('方向退出は論理解像度、回転、位置、余白を考慮し完全に外へ出る',()=>{
 for(const [w,h]of [[1920,1080],[1080,1920],[1080,1080]])for(const rotate of [0,17,90,145,-38])for(const x of [.05,.55,.9])for(const [i,dir]of ['left','right','up','down'].entries()){
 const rect={x:x*w,y:.25*h,w:.4*w,h:.45*h,rotation:rotate},boundary={x:0,y:0,w,h},a=makeAnimation(`A-00${i+5}`,'frame','test-layer');a.startFrame=36;a.durationFrames=24;a.params.easing='easeIn';
 const before=JSON.stringify(rect),delta=evaluateAnimations([a],60,rect,boundary),box=aabb({...rect,x:rect.x+delta.x,y:rect.y+delta.y});
 assert.ok(dir==='left'?box.x+box.w<=-23.99:dir==='right'?box.x>=w+23.99:dir==='up'?box.y+box.h<=-23.99:box.y>=h+23.99);
 assert.equal(JSON.stringify(rect),before);assert.deepEqual(evaluateAnimations([a],48,rect,boundary),evaluateAnimations([a],48,rect,boundary));assert.equal(evaluateAnimations([a],35,rect,boundary).x,0);
 }});
test('内部画像は親枠と拡大済み素材の境界を区別する',()=>{const a=makeAnimation('A-005','imageContent','image');const r={x:-300,y:-200,w:1200,h:800},parent={x:0,y:0,w:600,h:400},d=evaluateAnimations([a],24,r,{x:0,y:0,w:1920,h:1080},parent);assert.ok(r.x+r.w+d.x<0);assert.equal(d.y,0);});
test('合成・終了状態・競合・シーン基準の時刻は決定論的',()=>{const rect={x:900,y:200,w:400,h:300},canvas={x:0,y:0,w:1920,h:1080},a=makeAnimation('A-005','frame','image'),b=makeAnimation('A-010','frame','image'),c=makeAnimation('A-011','frame','image');for(const v of [a,b,c]){v.startFrame=36;v.durationFrames=24;}
 const d=evaluateAnimations([a,b,c],48,rect,canvas);assert.ok(d.x<0&&d.opacity>0&&d.opacity<1&&d.scale<1);assert.equal(conflicts([a,b,c]).length,0);assert.equal(conflicts([a,{...a,id:'other'}]).length,1);
 a.afterEnd='restoreBase';assert.equal(evaluateAnimations([a],60,rect,canvas).x,0);a.afterEnd='hide';assert.equal(evaluateAnimations([a],60,rect,canvas).opacity,0);
});
test('24件すべて実動作を持ち、旧形式・新形式の保存検証を通す',()=>{assert.equal(animationCatalog.length,24);const rect={x:250,y:50,w:400,h:300},canvas={x:0,y:0,w:1920,h:1080};
 for(const preset of animationCatalog){const scope=preset.id==='A-024'?'imageContent':preset.category==='文字'?'text':'frame',a=makeAnimation(preset.id,scope,'test-layer');assert.notDeepEqual(evaluateAnimations([a],3,rect,canvas),evaluateAnimations([a],17,rect,canvas),preset.id);assert.equal(preset.status.mp4,false);}
 const p=clone(example) as Project;validateProject(p);const l=p.scenes[0].layers[0];l.animations=[makeAnimation('A-021','text',l.layerId)];validateProject(p);validateProject(JSON.parse(JSON.stringify(p)));const before=clone(p);l.animations[0].targetLayerId='wrong';assert.throws(()=>validateProject(p));assert.notDeepEqual(p,before);
});
test('不正な対象・数値・親参照を拒否する',()=>{const p=clone(example) as Project,l=p.scenes[0].layers[0];l.animations=[makeAnimation('A-021','imageContent',l.layerId)];assert.throws(()=>validateProject(p));l.animations=[makeAnimation('A-005','text',l.layerId)];l.animations[0].params.easing='unknown';assert.throws(()=>validateProject(p));l.animations[0].params.easing='linear';l.style={...l.style,parentFrameId:l.layerId};assert.throws(()=>validateProject(p));});
test('複製のID・親参照を再発行し、未対応の途中分割では元を壊さない',()=>{const p=clone(example) as Project,s=p.scenes[0],l=s.layers[0];l.animations=[makeAnimation('A-005','frame',l.layerId)];const child=clone(l);child.layerId='bound-copy';child.animations=[];child.style={...child.style,parentFrameId:l.layerId};s.layers.push(child);const before=clone(p);assert.throws(()=>splitSceneAt(p,s.sceneId,30),/個別アニメーション/);assert.deepEqual(p,before);const copy=clone(s),map=new Map(copy.layers.map((v,i)=>[v.layerId,'copy-layer-'+i]));copy.layers.forEach(v=>v.layerId=map.get(v.layerId)!);remapSceneAnimations(copy,map);assert.equal(copy.layers.at(-1)!.style?.parentFrameId,copy.layers[0].layerId);assert.equal(copy.layers[0].animations![0].targetLayerId,copy.layers[0].layerId);assert.notEqual(copy.layers[0].animations![0].id,l.animations[0].id);});
