import React from 'react';
import {AbsoluteFill} from 'remotion';
export type TransitionKind='fly-through'|'whip-spin'|'cube'|'diagonal'|'iris'|'card-flip'|'split-gate'|'whip-pan'|'quad-burst';
export type TransitionSpec={id:string;name:string;kind:TransitionKind;atFrame:number;durationFrames:number;fromScene:number;toScene:number};
const clamp=(p:number)=>Math.max(0,Math.min(1,p));
const ease=(p:number)=>{p=clamp(p);return p*p*(3-2*p);};

/** Outgoing and incoming full scenes are both visible through the same window. */
export function transitionStyle(kind:TransitionKind,progress:number,side:'out'|'in'):React.CSSProperties{
 const p=ease(progress),r=1-p,isOut=side==='out';
 const base:React.CSSProperties={position:'absolute',inset:0,transformOrigin:'50% 50%',backfaceVisibility:'hidden',willChange:'transform,opacity',opacity:1};
 switch(kind){
  case 'fly-through':return {...base,transform:isOut?`perspective(1100px) translateZ(${p*800}px) translateX(${p*p*260}px) scale(${1+p*p*1.1})`:`scale(${.48+.52*p})`,opacity:isOut?1-ease(clamp(progress/.85)):1,filter:`blur(${isOut?p*7:r*5}px)`};
  case 'whip-spin':return {...base,transform:isOut?`translateX(${-p*2200}px) rotate(${-p*135}deg) scale(${1+p*.2})`:`translateX(${r*2200}px) rotate(${r*135}deg) scale(${1+r*.2})`,filter:`blur(${Math.sin(p*Math.PI)*3}px)`};
  case 'cube':return {...base,transformOrigin:isOut?'100% 50%':'0% 50%',transform:isOut?`perspective(1700px) translateX(${-p*960}px) rotateY(${-p*90}deg)`:`perspective(1700px) translateX(${r*960}px) rotateY(${r*90}deg)`,filter:`brightness(${.75+(isOut?r:p)*.25})`};
  case 'diagonal':return {...base,transform:isOut?`translate(${p*2450}px,${-p*1400}px) rotate(${p*14}deg)`:`scale(${1+r*.15})`,filter:isOut?'none':`blur(${r*2}px)`};
  case 'iris':return {...base,transform:isOut?`scale(${1+p*.45})`:`scale(${1+r*.4})`,clipPath:isOut?`circle(${r*76}% at 50% 50%)`:'none',filter:isOut?'none':`blur(${r*2}px)`};
  case 'card-flip':return {...base,transform:isOut?`perspective(1300px) translateY(${-p*650}px) rotateX(${-p*92}deg) rotateZ(${p*12}deg)`:`perspective(1300px) translateY(${r*650}px) rotateX(${r*88}deg) rotateZ(${-r*12}deg)`,opacity:isOut?1:clamp(progress*2)};
  case 'split-gate':return {...base,transform:isOut?'scale(1.01)':`scale(${.72+.28*p})`,filter:isOut?'none':`blur(${r*2}px)`};
  case 'whip-pan':return {...base,transform:isOut?`translateX(${-p*2080}px) skewX(${-Math.sin(p*Math.PI)*16}deg)`:`translateX(${r*2080}px) skewX(${Math.sin(p*Math.PI)*16}deg)`,filter:`blur(${Math.sin(p*Math.PI)*8}px)`};
  case 'quad-burst':return {...base,transform:isOut?'scale(1.01)':`scale(${.5+.5*p}) rotate(${-r*12}deg)`,filter:isOut?'none':`blur(${r*3}px)`};
 }
}

export const OutgoingSlices:React.FC<{kind:TransitionKind;progress:number;children:React.ReactNode}>=({kind,progress,children})=>{
 const p=ease(progress);
 if(kind==='split-gate')return <AbsoluteFill>{[0,1].map(i=><AbsoluteFill key={i} style={{clipPath:i?'inset(0 0 0 50%)':'inset(0 50% 0 0)',transform:`translateX(${(i?1:-1)*p*1150}px)`}}>{children}</AbsoluteFill>)}</AbsoluteFill>;
 if(kind==='quad-burst')return <AbsoluteFill>{[0,1,2,3].map(i=>{const x=i%2?1:-1,y=i<2?-1:1;return <AbsoluteFill key={i} style={{clipPath:`inset(${i<2?0:50}% ${i%2?0:50}% ${i<2?50:0}% ${i%2?50:0}%)`,transform:`translate(${x*p*1400}px,${y*p*850}px) rotate(${x*y*p*65}deg)`,transformOrigin:`${i%2?75:25}% ${i<2?25:75}%`,opacity:1-p*.35}}>{children}</AbsoluteFill>;})}</AbsoluteFill>;
 return <>{children}</>;
};
