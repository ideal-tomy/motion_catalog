import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp,elapsed,seed,type MotionProps} from './atlas-types';
export const AtlasMotion:React.FC<MotionProps & {id:string}>=p=>{
 const f=elapsed(p),{id,theme}=p,enter=clamp(f/18),ease=p.easing==='linear'?enter:1-(1-enter)**3;
 const rings=(count:number)=>Array.from({length:count},(_,i)=>{const t=clamp((f-i*9-(id==='M-060'?(p.audioCue??12):0))/42);return <circle key={i} cx="960" cy="540" r={40+t*720} fill="none" stroke={theme.primary} strokeWidth={3+5*(1-t)} opacity={(1-t)*.7}/>});
 const title=id==='M-017'?p.text.slice(0,Math.ceil(p.text.length*(1-(1-clamp(f/45))**1.6))):p.text;
 const match=p.text.split(/\s*\/\s*/);
 return <AbsoluteFill style={{background:theme.background,color:theme.foreground,fontFamily:'Arial, sans-serif',overflow:'hidden'}}>
 <AbsoluteFill style={{background:`radial-gradient(ellipse at 50% 45%, ${theme.primary}18, transparent 65%)`}}/>
 <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{position:'absolute'}}>
 {id==='M-009'?Array.from({length:12},(_,i)=>{const z=((i/12+f/140+(f/300)**2*.2)%1),s=.08+z*z*2.1;return <rect key={i} x={960-750*s} y={540-430*s} width={1500*s} height={860*s} rx={18*s} fill="none" stroke={i%3===0?theme.accent:theme.primary} strokeWidth={1+z*3} opacity={z*.65}/> }):null}
 {['M-054','M-060','M-016'].includes(id)?rings(id==='M-054'?5:3):null}
 {id==='M-014'?Array.from({length:100},(_,i)=>{const t=clamp(f/42),a=seed(i)*Math.PI*2,r=130+(1-(1-t)**3)*(230+seed(i+100)*700);return <circle key={i} cx={960+Math.cos(a)*r} cy={540+Math.sin(a)*r} r={2+seed(i+200)*5} fill={i%3?theme.primary:theme.accent} opacity={1-t}/> }):null}
 {id==='M-016'?Array.from({length:70},(_,i)=>{const t=clamp(f/54),x=seed(i)*1920,y=-80+seed(i+100)*350+t*(600+seed(i+200)*500);return <rect key={i} x={x} y={y} width={6+seed(i+300)*8} height={15} fill={i%2?theme.accent:theme.primary} opacity={(1-t)*.8} transform={`rotate(${i*19+f*2} ${x} ${y})`}/> }):null}
 </svg>
 {id==='M-060'?<AbsoluteFill style={{background:theme.accent,opacity:Math.max(0,1-Math.abs(f-(p.audioCue??12))/3)*.16}}/>:null}
 <AbsoluteFill style={{alignItems:'center',justifyContent:'center',padding:130,textAlign:'center',transform:`scale(${id==='M-060'?1+Math.max(0,1-Math.abs(f-(p.audioCue??12))/10)*.09:.94+ease*.06})`,opacity:.35+ease*.65}}>
 <div style={{fontSize:23,letterSpacing:9,color:theme.primary,marginBottom:40}}>MOTION ATLAS / {id}</div>
 <div style={{fontSize:p.text.length>26?82:112,fontWeight:900,letterSpacing:-3,lineHeight:1.1,maxWidth:1500,textShadow:'0 8px 40px #000'}}>{id==='M-060'?<div style={{display:'flex',alignItems:'center',gap:60}}><span style={{transform:`translateX(${-600*(1-clamp(f/(p.audioCue??12)))**3}px)`}}>{match[0]}</span><span style={{color:theme.accent,opacity:f>=(p.audioCue??12)?1:0}}>{match[1]??'VS'}</span><span style={{transform:`translateX(${600*(1-clamp(f/(p.audioCue??12)))**3}px)`}}>{match[2]??''}</span></div>:title}{id==='M-017'?<span style={{color:theme.accent,opacity:Math.floor(f/15)%2===0?1:.2}}>|</span>:null}</div>
 <div style={{marginTop:46,width:100,height:5,background:theme.accent,transform:`scaleX(${ease})`}}/>
 </AbsoluteFill>
 <div style={{position:'absolute',left:90,bottom:65,fontSize:20,letterSpacing:4,color:'#9bacba'}}>DARTS / TOURNAMENT OPENING</div><div style={{position:'absolute',right:90,bottom:65,fontSize:18,color:'#9bacba'}}>FICTIONAL MATCH · MOTION DEMO</div>
 </AbsoluteFill>;
};
