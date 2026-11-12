import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';

export type MotionProps = {durationFrames:number; text?:string; accentColor?:string; intensity?:number; speed?:number; easing?:'cubic'; audioCue?:number};
const ease=(x:number)=>1-Math.pow(1-Math.max(0,Math.min(1,x)),3);

export const M003:React.FC<MotionProps & {children?:React.ReactNode}> = ({durationFrames,text,children})=>{
  const frame=useCurrentFrame();
  return <div style={{overflow:'hidden',paddingBottom:12}} data-motion="M-003"><div style={{transform:`translateY(${(1-ease(frame/Math.min(22,durationFrames)))*115}%)`}}>{children??text}</div></div>;
};
export const M012:React.FC<MotionProps & {children:React.ReactNode}>=({durationFrames,intensity=.025,children})=>{
  const f=useCurrentFrame();return <div data-motion="M-012" style={{width:'100%',height:'100%',transform:`scale(${1+intensity*ease(f/durationFrames)})`}}>{children}</div>;
};
export const M041:React.FC<MotionProps & {children:React.ReactNode}>=({children,durationFrames})=>{
  const f=useCurrentFrame();return <div data-motion="M-041" style={{width:'100%',height:'100%',clipPath:`circle(${ease(f/Math.min(14,durationFrames))*80}% at 50% 50%)`}}>{children}</div>;
};
export const M054:React.FC<MotionProps>=({durationFrames,accentColor='#6fe7e7',intensity=.3})=>{
  const f=useCurrentFrame();return <div data-motion="M-054" style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none'}}>{[0,1,2].map(i=>{
    const p=(f-i*10)/durationFrames;const r=Math.max(0,p)*1200;
    return <div key={i} style={{position:'absolute',left:'50%',top:'50%',width:r,height:r,border:`2px solid ${accentColor}`,borderRadius:'50%',transform:'translate(-50%,-50%)',opacity:p<0?0:Math.max(0,1-p)*intensity,boxShadow:`0 0 30px ${accentColor}33`}}/>;
  })}</div>;
};
export const M016:React.FC<MotionProps>=({durationFrames,accentColor='#e9bc6e',intensity=.6})=>{
  const f=useCurrentFrame();const p=f/durationFrames;
  return <div data-motion="M-016" style={{position:'absolute',inset:0,pointerEvents:'none'}}>{Array.from({length:34},(_,i)=>{
    const a=i*2.39996,r=80+Math.sqrt(p)*(200+(i*71%540));
    return <div key={i} style={{position:'absolute',left:960+Math.cos(a)*r,top:440+Math.sin(a)*r*.65+p*p*180,width:4+(i%3)*2,height:10+(i%4)*2,background:i%3?accentColor:'#86e9e9',opacity:interpolate(p,[0,.12,.8,1],[0,intensity,intensity*.5,0]),transform:`rotate(${i*47+f*2}deg)`}}/>;
  })}<M054 durationFrames={durationFrames} accentColor={accentColor} intensity={.12}/></div>;
};

export const registry = {'M-003':M003,'M-012':M012,'M-016':M016,'M-041':M041,'M-054':M054};
