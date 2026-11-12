import React from 'react';
import {AbsoluteFill,Audio,Freeze,Sequence,staticFile,useCurrentFrame} from 'remotion';
import {RockCut,type RockPlan,type Scene} from './RockPromo';
import {OutgoingSlices,transitionStyle,type TransitionSpec} from './transitions/variety';
export type EnglishPlan=RockPlan&{transitions:TransitionSpec[];transitionWindowFrames:number;locale:string};
const clamp=(p:number)=>Math.max(0,Math.min(1,p));
const Layer:React.FC<{scene:Scene;index:number;plan:EnglishPlan;activeStart:number}>=({scene,index,plan,activeStart})=>{
 const frame=useCurrentFrame()+activeStart,start=scene.from*plan.fps,end=scene.to*plan.fps,duration=end-start;
 const relative=frame-start,half=plan.transitionWindowFrames/2;
 const enter=index>0&&frame<start+half?plan.transitions[index-1]:null;
 const exit=index<plan.scenes.length-1&&frame>=end-half?plan.transitions[index]:null;
 const transition=exit??enter,side=exit?'out':'in';
 const p=transition?clamp((frame-(transition.atFrame-transition.durationFrames/2))/transition.durationFrames):0;
 const initial=index===0&&relative<18;
 const drift=1.018+clamp(relative/duration)*(index===9?.008:.035);
 const style=transition?transitionStyle(transition.kind,p,side):{transform:initial?`scale(${.88+clamp(relative/18)*.138})`:`scale(${drift}) translateX(${-clamp(relative/duration)*9}px)`};
 // Advance the interior motions slightly so both full scenes are present in
 // transition windows, rather than waiting on a blank title entrance.
 const body=<Freeze frame={Math.max(12,relative+12)}><RockCut scene={scene} index={index} duration={duration} plain/></Freeze>;
 return <AbsoluteFill data-scene={index} data-transition={transition?.id??'steady'} style={{...style,zIndex:exit?200:enter?100:0,overflow:'hidden'}}>{exit?<OutgoingSlices kind={exit.kind} progress={p}>{body}</OutgoingSlices>:body}</AbsoluteFill>;
};
export const RockEnglishPromo:React.FC<{plan:EnglishPlan}>=({plan})=><AbsoluteFill style={{fontFamily:'"Arial Black",Arial,sans-serif',background:'#0b0d0b',color:'#f4f3ea',overflow:'hidden'}}>{plan.scenes.map((scene,index)=>{
 const start=scene.from*plan.fps,end=scene.to*plan.fps,half=plan.transitionWindowFrames/2,activeStart=Math.max(0,start-half),activeEnd=Math.min(plan.durationSeconds*plan.fps,end+(index===plan.scenes.length-1?0:half));
 return <Sequence key={index} from={activeStart} durationInFrames={activeEnd-activeStart}><Layer scene={scene} index={index} plan={plan} activeStart={activeStart}/></Sequence>;
})}<Audio src={staticFile(plan.music)}/></AbsoluteFill>;
