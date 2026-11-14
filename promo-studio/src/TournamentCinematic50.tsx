import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {OutgoingSlices, transitionStyle, type TransitionSpec} from './transitions/variety';

type Scene={from:number;to:number;kind:string;motion:string;copy:string;accent:string;asset?:string;sourceFrame?:number;speed?:number;tag?:string};
export type Cinematic50Plan={compositionId:string;durationSeconds:number;fps:number;music:string;transitionWindowFrames:number;scenes:Scene[];transitions:TransitionSpec[]};
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const ease=(x:number)=>1-Math.pow(1-clamp(x),3);
const Label:React.FC<{children:React.ReactNode;size?:number;color?:string;style?:React.CSSProperties}>=({children,size=68,color='#f4f6fb',style})=><div style={{fontSize:size,fontWeight:900,letterSpacing:'-.045em',lineHeight:1.08,color,...style}}>{children}</div>;

const Footage:React.FC<{scene:Scene;index:number;preRoll:number}>=({scene,index,preRoll})=>{
  const f=useCurrentFrame(),p=ease(f/18),speed=scene.speed??1;
  const actualSystem=scene.tag?.startsWith('SYSTEM CAPTURE')??false;
  const source=Math.max(0,(scene.sourceFrame??0)-preRoll*speed);
  const media=scene.asset?<OffthreadVideo src={staticFile(scene.asset)} startFrom={source} playbackRate={speed} muted style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',transform:actualSystem?'scale(1.005)':`scale(${1.025+p*.045})`,filter:index>=10?'saturate(1.08) contrast(1.05)':'saturate(1.04) contrast(1.04)'}}/>:null;
  const accent=scene.accent;
  return <AbsoluteFill style={{overflow:'hidden',background:'radial-gradient(ellipse at 50% 52%,#132b43,#06101b 64%,#02060b)'}}>
    {index===0&&<>{Array.from({length:12},(_,i)=><div key={i} style={{position:'absolute',left:`${i*10-12}%`,top:'51%',width:'78%',height:3,transform:`rotate(${-28+i*5}deg) scaleX(${p})`,transformOrigin:'left',background:`linear-gradient(90deg,transparent,${i%2?'#38b7ff':'#ff8e52'}aa,transparent)`,filter:'blur(1px)'}}/>)}<div style={{position:'absolute',inset:'18% 12%',border:'1px solid #9bcfff30',borderRadius:'50%',transform:'perspective(850px) rotateX(68deg)',boxShadow:'0 0 100px #238cff20'}}/></>}
    {media}
    {scene.asset&&<AbsoluteFill style={{background:actualSystem?'linear-gradient(0deg,#030914dd 0%,#03091485 18%,transparent 48%)':'linear-gradient(90deg,#030914dc 0%,#07101b5e 46%,#07101bb5 100%),linear-gradient(0deg,#030914a8,transparent 42%)'}}/>}
    {index===0&&<AbsoluteFill style={{background:'linear-gradient(90deg,#02071155,#06101b20,#02071177)'}}/>}
    <div style={{position:'absolute',left:112,top:actualSystem?undefined:index===0?255:115,bottom:actualSystem?122:undefined,maxWidth:actualSystem?1640:1450,transform:actualSystem?`translateY(${(1-p)*40}px)`:`translateX(${(1-p)*90}px) scale(${.96+.04*p})`,opacity:clamp(f/8)}}>
      <div style={{fontSize:16,fontWeight:900,letterSpacing:6,color:accent,marginBottom:actualSystem?12:22}}>{index===0?'TOURNAMENT / THE MOMENT':'TOURNAMENT  ·  '+String(index).padStart(2,'0')}</div>
      <Label size={actualSystem?56:index===0?104:index>=14?76:70} style={{textShadow:'0 4px 34px #000c',maxWidth:actualSystem?1640:index===0?1450:1230}}>{scene.copy}</Label>
      <div style={{marginTop:28,width:190,height:4,transform:`scaleX(${p})`,transformOrigin:'left',background:`linear-gradient(90deg,${accent},#fff,transparent)`,boxShadow:`0 0 22px ${accent}99`}}/>
    </div>
    {scene.tag&&<div style={{position:'absolute',left:112,bottom:67,padding:'8px 13px',border:`1px solid ${accent}99`,background:'#050b13d9',fontSize:14,fontWeight:900,letterSpacing:3,color:accent}}>{scene.tag}</div>}
    <div style={{position:'absolute',right:42,bottom:65,fontSize:15,fontWeight:800,letterSpacing:3,color:'#dce7f3aa'}}>MOTION ATLAS  /  TOURNAMENT</div>
    <div style={{position:'absolute',top:0,left:0,right:0,height:5,background:`linear-gradient(90deg,transparent,${accent},#fff,${accent},transparent)`,transform:`translateX(${(p-1)*100}%)`,opacity:.8}}/>
    <div style={{position:'absolute',left:0,right:0,bottom:0,height:3,background:'#ffffff22'}}><div style={{height:'100%',width:`${Math.min(100,((scene.from*30+f)/(50*30))*100)}%`,background:accent,boxShadow:`0 0 16px ${accent}`}}/></div>
  </AbsoluteFill>;
};

const Layer:React.FC<{scene:Scene;index:number;plan:Cinematic50Plan;activeStart:number}>=({scene,index,plan,activeStart})=>{
  const frame=useCurrentFrame()+activeStart,start=scene.from*plan.fps,end=scene.to*plan.fps,half=plan.transitionWindowFrames/2;
  const entering=index>0&&frame<start+half?plan.transitions[index-1]:null;
  const leaving=index<plan.scenes.length-1&&frame>=end-half?plan.transitions[index]:null;
  const transition=leaving??entering,side=leaving?'out':'in';
  const p=transition?clamp((frame-(transition.atFrame-transition.durationFrames/2))/transition.durationFrames):0;
  const style:React.CSSProperties=transition?transitionStyle(transition.kind,p,side):{transform:`scale(${1.015+clamp((frame-start)/(end-start))*.02})`};
  const body=<Footage scene={scene} index={index} preRoll={index===0?0:half}/>;
  return <AbsoluteFill data-scene={index} data-motion={scene.motion} data-transition={transition?.id??'steady'} style={{...style,zIndex:leaving?200:entering?100:0,overflow:'hidden'}}>{leaving?<OutgoingSlices kind={leaving.kind} progress={p}>{body}</OutgoingSlices>:body}</AbsoluteFill>;
};

export const TournamentCinematic50:React.FC<{plan:Cinematic50Plan}>=({plan})=><AbsoluteFill style={{background:'#040912',color:'#f4f6fb',fontFamily:'Arial,"Yu Gothic",Meiryo,sans-serif',overflow:'hidden'}}>{plan.scenes.map((scene,index)=>{const start=scene.from*plan.fps,end=scene.to*plan.fps,half=plan.transitionWindowFrames/2,activeStart=Math.max(0,start-half),activeEnd=Math.min(plan.durationSeconds*plan.fps,end+(index===plan.scenes.length-1?0:half));return <Sequence key={index} from={activeStart} durationInFrames={activeEnd-activeStart}><Layer scene={scene} index={index} plan={plan} activeStart={activeStart}/></Sequence>;})}<Audio src={staticFile(plan.music)} volume={1}/><div style={{position:'absolute',right:34,top:24,padding:'5px 9px',background:'#07101dbb',color:'#ffe7ad',fontSize:12,fontWeight:900,letterSpacing:2,zIndex:1000}}>仮制作 / SAMPLE PREVIEW</div></AbsoluteFill>;
