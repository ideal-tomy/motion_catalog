import test from 'node:test';
import assert from 'node:assert/strict';
import example from '../examples/example-project.json' with {type:'json'};
import {clone,validateProject,type Project} from '../src/core.ts';
import {applyPaletteToken,presentations,presentationOf,setPresentation} from '../src/presentation.ts';

test('全体配色はコマ上書きと同色の文字へ届き、固定・個別指定色を保持',()=>{
 const p=clone(example) as Project;p.locks=[];
 const s=p.scenes[0];s.colorOverrides.background='#123456';s.colorOverrides.text=p.theme.palette.text;
 const l=s.layers.find(l=>l.kind==='text')!;l.locked=false;l.style={color:p.theme.palette.text};
 const locked=p.scenes[1];locked.colorOverrides={background:'#234567'};p.locks.push({scope:'scene',targetId:locked.sceneId,field:'colorOverrides'});
 applyPaletteToken(p,'background','#345678');assert.equal(p.theme.palette.background,'#345678');assert.equal(s.colorOverrides.background,undefined);assert.equal(locked.colorOverrides.background,'#234567');
 applyPaletteToken(p,'text','#eeddaa');assert.equal(l.style.color,undefined);assert.equal(l.style.colorToken,'text');assert.notEqual(locked.colorOverrides.text,'#eeddaa');
 l.style.color='#abcdef';applyPaletteToken(p,'text','#ffffff');assert.equal(l.style.color,'#abcdef');validateProject(p);
});
test('枠なし全画面は既存素材の重複・削除なしで表示区間とマスクを更新',()=>{
 const p=clone(example) as Project;p.locks=[];const s=p.scenes[0],l=s.layers[0];s.layers.forEach(l=>l.locked=false);const ids=s.layers.map(l=>l.layerId);
 l.style={mask:'round-rect',frame:'browser'};l.inFrame=40;
 setPresentation(s,l.layerId,'fullbleed');assert.deepEqual(l.transform,{x:0,y:0,width:1,height:1,rotateDeg:0});assert.equal(l.inFrame,0);assert.equal(l.durationFrames,s.durationFrames);assert.equal(l.style.mask,'rect');assert.equal(l.style.frame,'none');assert.equal(presentationOf(l),'fullbleed');assert.deepEqual(s.layers.map(l=>l.layerId),ids);
 for(const [mode] of presentations){setPresentation(s,l.layerId,mode);assert.equal(presentationOf(l),mode);validateProject(p);}
 l.locked=true;assert.throws(()=>setPresentation(s,l.layerId,'fullbleed'));
});
test('素材内の拡大率を保存し、範囲外・不正値を拒否',()=>{const p=clone(example) as Project,l=p.scenes[0].layers[0];l.style={...l.style,mediaZoom:1.75};validateProject(p);for(const value of [0,5,NaN]){l.style.mediaZoom=value;assert.throws(()=>validateProject(p));}});
