import React from 'react';
import {interpolate,useCurrentFrame} from 'remotion';
import type {MotionProps} from './index';
const out=(x:number)=>1-Math.pow(1-Math.max(0,Math.min(1,x)),3);

/** M-001: staggered directional typography, time driven. */
export const M001:React.FC<MotionProps & {children:React.ReactNode;delay?:number;direction?:number}>=({children,delay=0,direction=1})=>{
  const f=useCurrentFrame()-delay,p=out(f/9);
  return <div data-motion="M-001" style={{overflow:'hidden',padding:'8px 12px',margin:'-8px -12px'}}><div style={{transform:`translate(${(1-p)*direction*230}px,${(1-p)*100}px) skewX(${(1-p)*-10}deg)`,opacity:f<0?0:1}}>{children}</div></div>;
};
/** M-013: 6-frame slice displacement. No continuous flashing. */
export const M013:React.FC<MotionProps & {children:React.ReactNode}>=({children})=>{
  const f=useCurrentFrame(),shift=f<6?Math.sin(f*2.4)*(1-f/6)*45:0;
  return <div data-motion="M-013" style={{position:'absolute',inset:0}}>{children}{f<6&&[0,1,2].map(i=><div key={i} style={{position:'absolute',inset:0,clipPath:`inset(${18+i*25}% 0 ${70-i*25}% 0)`,transform:`translateX(${shift*(i%2?-1:1)}px)`,filter:i%2?'hue-rotate(25deg)':'saturate(1.6)'}}>{children}</div>)}</div>;
};
/** M-015: diagonal streak sweep, one pass per cut. */
export const M015:React.FC<MotionProps>=({accentColor='#d6ff35',intensity=.55})=>{
  const f=useCurrentFrame();return <div data-motion="M-015" style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none'}}>{Array.from({length:7},(_,i)=>{
    const p=(f-i*1.2)/23;return <div key={i} style={{position:'absolute',left:-650+p*3300,top:160+i*115,width:550+i*40,height:i%2?2:5,background:accentColor,opacity:p<0||p>1?0:intensity*(1-p),transform:'rotate(-24deg)',boxShadow:`0 0 16px ${accentColor}77`}}/>;
  })}</div>;
};
/** M-022: short impact overshoot plus a single outline ring. */
export const M022:React.FC<MotionProps & {children:React.ReactNode}>=({children,accentColor='#d6ff35'})=>{
  const f=useCurrentFrame(),scale=interpolate(f,[0,4,8,13],[1.45,.96,1.035,1],{extrapolateRight:'clamp'});
  return <div data-motion="M-022" style={{position:'relative',transform:`scale(${scale})`,opacity:Math.min(1,(f+1)/3)}}>{children}{f<18&&<div style={{position:'absolute',inset:-20,border:`3px solid ${accentColor}`,opacity:Math.max(0,.55-f/30),transform:`scale(${1+f*.035})`,pointerEvents:'none'}}/>}</div>;
};
/** M-060: hit cue on the cut, ring burst and short camera impulse. */
export const M060:React.FC<MotionProps>=({accentColor='#d6ff35',intensity=.4,audioCue=0})=>{
  const f=useCurrentFrame()-audioCue,p=Math.max(0,f/22);
  return <div data-motion="M-060" style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none'}}>{f>=0&&f<22&&<>
    <div style={{position:'absolute',left:'50%',top:'50%',width:80+p*1900,height:80+p*1900,transform:'translate(-50%,-50%)',border:`${8*(1-p)+1}px solid ${accentColor}`,borderRadius:'50%',opacity:(1-p)*intensity}}/>
    {[0,1,2,3,4,5].map(i=><div key={i} style={{position:'absolute',left:960+Math.cos(i*Math.PI/3)*p*1300,top:540+Math.sin(i*Math.PI/3)*p*850,width:150,height:3,background:accentColor,opacity:(1-p)*intensity,transform:`rotate(${i*60}deg)`}}/>)}</>}</div>;
};
