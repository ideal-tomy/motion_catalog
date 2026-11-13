import React from 'react';
import type {Layer} from './core';
import {presentations,presentationOf,type Presentation} from './presentation';
export function PresentationControls({layer,onChange}:{layer:Layer;onChange:(mode:Presentation)=>void}){
 if(!['image','video'].includes(layer.kind))return null;
 return <section className="presentation-tools"><h3>素材の見せ方</h3><label>表示スタイル<select aria-label="素材の表示スタイル" value={presentationOf(layer)} onChange={e=>onChange(e.target.value as Presentation)}>{presentations.map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label><div className="presentation-grid">{presentations.map(([id,label])=><button key={id} type="button" aria-pressed={presentationOf(layer)===id} onClick={()=>onChange(id)}><span className={`frame-icon ${id}`}/>{label}</button>)}</div><p className="hint">全画面は枠・角丸・影を外し、文字の後ろへ配置します。素材内の色や焼き込み文字は元のままです。</p></section>;
}
