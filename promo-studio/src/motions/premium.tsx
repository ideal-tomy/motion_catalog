import React from 'react';
import {useCurrentFrame} from 'remotion';
const ease=(v:number)=>{const p=Math.max(0,Math.min(1,v));return 1-(1-p)**3;};
/** M-005: three restrained cards, 0.15s stagger, travel <=80px. */
export const M005:React.FC<{items:string[];durationFrames:number;accentColor?:string}>=({items,durationFrames,accentColor='#b5a17e'})=>{
 const frame=useCurrentFrame();
 return <div data-motion="M-005" style={{display:'flex',gap:20}}>{items.map((text,i)=>{
  const p=ease((frame-i*4.5)/24);
  return <div key={text} style={{width:390,padding:'24px 28px',boxSizing:'border-box',border:`1px solid ${accentColor}66`,borderRadius:8,background:'#ffffffbb',opacity:p,transform:`perspective(1500px) translateY(${(1-p)*38}px) translateZ(${(1-p)*-20}px)`,fontSize:29,color:'#24333d',letterSpacing:2}}><span style={{fontSize:18,color:accentColor,marginRight:22}}>0{i+1}</span>{text}</div>;
 })}</div>;
};
