import React,{useId} from 'react';
import type {Motion} from './core';
import {clamp,ease,motionClock,motionStyle,seeded,textMotionIds} from './motion-engine';
export function AnimatedText({text,motions,frame,fps,ink='#f5f7fa'}:{text:string;motions:Motion[];frame:number;fps:number;ink?:string}){
 const m=motions.findLast(m=>textMotionIds.includes(m.motionId));if(!m)return <>{text}</>;
 const {p,local}=motionClock(m,frame),q=ease(p);
 if(m.motionId==='M-004')return <>{text.replace(/-?\d[\d,]*(?:\.\d+)?/g,value=>{const n=Number(value.replaceAll(',','')),digits=value.split('.')[1]?.length??0;return (n*q).toLocaleString('en-US',{minimumFractionDigits:digits,maximumFractionDigits:digits});})}</>;
 if(m.motionId==='M-002')return <>{[...text].map((c,i)=>/\s/.test(c)||i<q*text.length?c:'@#012345XYZ'[Math.floor(seeded(i+Math.floor(local)*17)*10)]).join('')}</>;
 if(m.motionId==='M-017'){const explicit=m.params.charactersPerSecond!==undefined,amount=explicit?clamp(local/fps*Number(m.params.charactersPerSecond)/text.length):q;return <>{text.slice(0,Math.max(0,Math.ceil(amount*text.length)))}<span style={{opacity:p<1&&(Math.floor(local/15)%2===0)?1:0,color:'currentColor'}}>|</span></>;}
 return <>{[...text].map((c,i)=>{const v=ease(p-i/Math.max(1,text.length)*.32),r=1-v;let transform='',opacity=1,color: string|undefined,stroke: string|undefined;
 if(m.motionId==='M-001'){transform=`translateY(${r*(i%2?65:-65)}px)`;opacity=v;}
 if(m.motionId==='M-018'){transform=`translate(${r*(i%2?130:-130)}px,${r*(i%3-1)*40}px)`;opacity=v;}
 if(m.motionId==='M-019')transform=`translateY(${Math.sin(p*Math.PI*2-i*.35)*22*(1-p)}px)`;
 if(m.motionId==='M-021')transform=`translateY(${Math.sin(i/Math.max(1,text.length-1)*Math.PI)*35*(1-q)}px) rotate(${(i/text.length-.5)*45*(1-q)}deg)`;
 if(m.motionId==='M-023'){transform=`perspective(500px) rotateY(${r*180}deg)`;opacity=v;}
 if(m.motionId==='M-024'){color=i/text.length>q?'transparent':undefined;stroke=`1px ${ink}`;}
 return c==='\n'?<br key={i}/>:<span key={i} style={{display:'inline-block',whiteSpace:'pre',transform,opacity,color,WebkitTextStroke:stroke}}>{c}</span>;
 })}</>;
}
export function MotionOverlay({motion:m,frame,color='#7ae8df',background='#0c1522'}:{motion:Motion;frame:number;color?:string;background?:string}){
 const {p,local,active}=motionClock(m,frame),q=ease(p),id=m.motionId,fade=1-q;if(local<0||(!active&&id!=='M-049'))return null;
 const rings=['M-014','M-016','M-054','M-057','M-058','M-060'].includes(id),particle=['M-014','M-016','M-052'].includes(id),streak=['M-015','M-053','M-056'].includes(id);
 return <svg data-effect={id==="M-008"?"scan":undefined} data-motion-overlay={id} viewBox="0 0 1280 720" preserveAspectRatio="none" style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',overflow:'hidden',opacity:Number(m.params.opacity??1)}}>
 {id==='M-009'?Array.from({length:12},(_,i)=>{const z=(i/12+p*1.2)%1,s=.08+z*z*2;return <rect key={i} x={640-500*s} y={360-300*s} width={1000*s} height={600*s} fill="none" stroke={color} strokeWidth={1+z*2} opacity={z*.5}/>;}):null}
 {rings?Array.from({length:id==='M-054'?5:3},(_,i)=>{const start=id==='M-060'?Number(m.params.hitFrame??12):0,t=clamp((local-start-i*6)/36);return <circle key={i} cx={640} cy={360} r={20+t*620} fill="none" stroke={color} strokeWidth={3} opacity={local>=start+i*6?(1-t)*.7:0}/>;}):null}
 {particle?Array.from({length:id==='M-016'?70:100},(_,i)=>{const a=seeded(i)*Math.PI*2,t=clamp(local/42),r=id==='M-052'?(1-q)*(200+seeded(i+100)*500):q*(180+seeded(i+100)*600),x=id==='M-016'?seeded(i)*1280:640+Math.cos(a)*r,y=id==='M-016'?-30+seeded(i+100)*150+t*(500+seeded(i+200)*300):360+Math.sin(a)*r;return <rect key={i} x={x} y={y} width={id==='M-016'?8:4} height={id==='M-016'?13:4} fill={color} opacity={id==='M-052'?.4+.4*fade:(1-t)*.8} transform={`rotate(${i*13+local*2} ${x} ${y})`}/>;}):null}
 {streak?Array.from({length:id==='M-053'?32:12},(_,i)=>{if(id==='M-053'){const a=i/32*Math.PI*2,r=80+q*600;return <line key={i} x1={640+Math.cos(a)*r*.35} y1={360+Math.sin(a)*r*.35} x2={640+Math.cos(a)*r} y2={360+Math.sin(a)*r} stroke={color} strokeWidth={2} opacity={Math.sin(p*Math.PI)*.7}/>;}const x=((p*1.8+seeded(i))*1500)%1500-150,y=seeded(i+40)*720;return <line key={i} x1={x} y1={y} x2={x+(id==='M-056'?90:300)} y2={y+(id==='M-056'?55:0)} stroke={color} strokeWidth={1+seeded(i+70)*3} opacity={Math.sin(p*Math.PI)*.7}/>;}):null}
 {id==='M-008'||id==='M-050'?<><rect x={0} y={q*720} width={1280} height={id==='M-050'?5:3} fill={color} opacity={.7}/>{id==='M-050'?Array.from({length:12},(_,i)=><line key={i} x1={0} x2={1280} y1={i*60} y2={i*60} stroke={color} opacity={.09}/>):null}</>:null}
 {['M-007','M-026','M-031','M-032'].includes(id)?<><path d={id==='M-007'?'M90 580 L310 500 L520 530 L730 360 L970 390 L1190 180':'M110 580 H1170'} fill="none" stroke={color} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1-q} opacity={.75}/>{Array.from({length:4},(_,i)=>id==='M-032'?<rect key={i} x={110+((p*2+i/4)%1)*1060} y={572} width={14} height={14} fill={color}/>:<circle key={i} cx={110+i*353} cy={id==='M-007'?580-i*100:580} r={8} fill={color} opacity={clamp((p-i*.15)*4)}/>)}</>:null}
 {id==='M-027'?<rect x={q*900} y={680} width={300} height={5} fill={color}/>:null}
 {id==='M-029'?<><rect x={1060} y={35} width={130} height={58} rx={29} fill={color} opacity={.3+.4*q}/><circle cx={1090+q*70} cy={64} r={23} fill={color}/></>:null}
 {id==='M-030'?<path d={`M${240+q*600} ${260+q*170} l0 35 12 -10 10 20 9 -5 -10 -20 16 -2 Z`} fill={color} opacity={fade}/>:null}
 {id==='M-033'?<line x1={q*1280} x2={q*1280} y1={0} y2={720} stroke={color} strokeWidth={5}/>:null}
 {id==='M-038'||id==='M-035'?Array.from({length:12},(_,i)=>{const y=360+i*i*2*(1+q*.5);return <line key={i} x1={0} x2={1280} y1={y} y2={y} stroke={color} opacity={.15}/>;}):null}
 {id==='M-039'?<rect x={80+q*800} y={120} width={320} height={460} fill="none" stroke={color} strokeDasharray="18 10" strokeWidth={2} opacity={Math.sin(p*Math.PI)*.7}/>:null}
 {id==='M-046'?Array.from({length:8},(_,i)=><rect key={i} x={i*160} y={i%2?720-(1-q)*720:0} width={161} height={(1-q)*720} fill={background}/>):null}
 {id==='M-047'||id==='M-060'?<rect width={1280} height={720} fill={color} opacity={Math.exp(-Math.pow((local-(id==='M-060'?Number(m.params.hitFrame??12):8))/3,2))*.14}/>:null}
 {id==='M-049'?<rect x={14} y={14} width={1252} height={692} rx={20} fill="none" stroke={color} strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={1-q} opacity={.65}/>:null}
 {id==='M-051'?<><ellipse cx={300+Math.sin(p*Math.PI*2)*200} cy={240+Math.cos(p*Math.PI*2)*100} rx={390} ry={230} fill={color} opacity={.12}/><ellipse cx={900-Math.sin(p*Math.PI*2)*180} cy={480} rx={400} ry={240} fill={color} opacity={.08}/></>:null}
 {id==='M-059'?Array.from({length:40},(_,i)=>{const h=30+Math.abs(Math.sin(i*.6+local*.18))*130;return <rect key={i} x={40+i*30} y={690-h} width={15} height={h} fill={color} opacity={.65}/>;}):null}
 </svg>;
}
export function MotionFrame({motion,frame,index=0,count=1,depth=0,color,background,overlay=true,children}:{motion:Motion;frame:number;index?:number;count?:number;depth?:number;color?:string;background?:string;overlay?:boolean;children:React.ReactNode}){
 const unique=useId().replaceAll(':',''),{p}=motionClock(motion,frame),tiled=motion.motionId==='M-045'||motion.motionId==='M-055',style=motionStyle(motion,frame,index,count,depth);
 return <div data-applied-motion={motion.motionId} data-motion-progress={p.toFixed(4)} style={{...style,...(tiled?{clipPath:`url(#tiles-${unique})`}:{})}}>{tiled?<svg width={0} height={0} style={{position:'absolute'}}><defs><clipPath id={`tiles-${unique}`} clipPathUnits="objectBoundingBox">{Array.from({length:48},(_,i)=>{const amount=ease((p-seeded(i)*.45)/.55);return <rect key={i} x={(i%8)/8+(1-amount)/16} y={Math.floor(i/8)/6+(1-amount)/12} width={amount/8+.0001} height={amount/6+.0001}/>;})}</clipPath></defs></svg>:null}{children}{overlay?<MotionOverlay motion={motion} frame={frame} color={color} background={background}/>:null}</div>;
}



