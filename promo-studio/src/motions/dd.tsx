import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {MotionProps} from './index';
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const ease=(n:number)=>1-Math.pow(1-clamp(n),3);
/** Symbols converge left to right, deterministic for every frame. */
export const M002:React.FC<MotionProps>=({text='',accentColor='#7eefff'})=>{
 const f=useCurrentFrame(),glyph='AXEON/01379?+#';
 const settled=Math.floor(clamp((f-2)/20)*text.length);
 return <span data-motion="M-002" style={{color:accentColor,whiteSpace:'pre'}}>{[...text].map((c,i)=>c===' '?c:i<settled?c:glyph[(i*17+Math.floor(f/2)*7)%glyph.length]).join('')}</span>;
};
/** A single scan over the subject, then a stable evidence marker. */
export const M008:React.FC<MotionProps & {marker?:string}>=({accentColor='#7eefff',marker='SOURCE MATCHED'})=>{
 const f=useCurrentFrame(),p=clamp(f/36);
 return <div data-motion="M-008" style={{position:'absolute',inset:0,pointerEvents:'none',overflow:'hidden',border:`1px solid ${accentColor}77`}}><div style={{position:'absolute',left:0,right:0,top:`${p*96}%`,height:3,background:accentColor,boxShadow:`0 0 20px ${accentColor}`,opacity:f>42?0:1}}/><div style={{position:'absolute',left:0,right:0,top:0,height:`${p*100}%`,background:`linear-gradient(transparent,${accentColor}14)`}}/>{f>=36&&<div style={{position:'absolute',right:12,top:12,padding:'9px 16px',background:'#071114',color:accentColor,fontFamily:'monospace',fontSize:18,letterSpacing:3}}>{marker}</div>}</div>;
};
/** Opposing letter fragments lock onto one baseline. */
export const M018:React.FC<MotionProps & {size?:number;delay?:number}>=({text='',size=100,accentColor='#f4f3ec',delay=0})=>{
 const f=useCurrentFrame()-delay,p=ease(f/13);
 return <div data-motion="M-018" style={{display:'flex',fontSize:size,fontWeight:900,letterSpacing:-size*.045,lineHeight:1.16,color:accentColor,whiteSpace:'nowrap'}}>{[...text].map((c,i)=><span key={i} style={{display:'inline-block',transform:`translate(${(1-p)*(i%2?190:-190)}px,${(1-p)*(i%3-1)*75}px) rotate(${(1-p)*(i%2?14:-14)}deg)`,opacity:f<0?0:p}}>{c===' '?'\u00a0':c}</span>)}</div>;
};
/** The information panel grows from a small card into a modal. */
export const M028:React.FC<MotionProps & {children:React.ReactNode}>=({children})=>{
 const f=useCurrentFrame(),p=ease(f/12);
 return <div data-motion="M-028" style={{position:'relative',width:'100%',height:'100%',transform:`scale(${.66+.34*p}) translateY(${(1-p)*80}px)`,opacity:p,transformOrigin:'50% 55%'}}>{children}</div>;
};
/** Packet flow between labeled documents; editorial explanatory graphic. */
export const M032:React.FC<MotionProps & {labels?:[string,string];compact?:boolean}>=({accentColor='#7eefff',labels=['給与台帳','勤怠データ'],compact=false})=>{
 const f=useCurrentFrame(),width=compact?1000:1480,height=compact?180:230;
 return <div data-motion="M-032" style={{position:'relative',width,height,fontFamily:'monospace'}}>
  {[0,1].map(i=><div key={i} style={{position:'absolute',left:i?width-330:0,top:0,width:330,height:height-12,border:`2px solid ${accentColor}99`,background:'#0b1c22',padding:28,boxSizing:'border-box',color:'#ecf4f4'}}><div style={{fontSize:17,letterSpacing:3,color:accentColor,marginBottom:compact?15:32}}>SOURCE / 0{i+1}</div><div style={{fontSize:compact?31:43,fontWeight:900}}>{labels[i]}</div></div>)}
  <div style={{position:'absolute',left:330,right:330,top:height/2,height:2,background:accentColor+'55'}}/>
  {Array.from({length:5},(_,i)=>{const p=((f/34+i*.2)%1);return <div key={i} style={{position:'absolute',left:330+p*(width-660),top:height/2-5,width:26,height:10,background:accentColor,boxShadow:`0 0 16px ${accentColor}77`}}/>;})}
  <div style={{position:'absolute',left:width/2-36,top:height/2-36,width:72,height:72,display:'grid',placeItems:'center',background:accentColor,color:'#0b1518',fontSize:44,fontWeight:900}}>×</div>
 </div>;
};
/** Five alternating shutters open over the next cut within 9 frames. */
export const M046:React.FC<MotionProps & {children:React.ReactNode}>=({children,accentColor='#7eefff'})=>{
 const f=useCurrentFrame();return <div data-motion="M-046" style={{position:'absolute',inset:0,overflow:'hidden'}}>{children}{Array.from({length:5},(_,i)=>{const p=ease((f-i*.55)/7);return <div key={i} style={{position:'absolute',left:`${i*20}%`,top:0,bottom:0,width:'20.1%',background:i%2?'#172d35':'#071014',transform:`translateY(${(i%2?-1:1)*p*110}%)`,borderRight:`2px solid ${accentColor}44`,pointerEvents:'none'}}/>;})}</div>;
};
