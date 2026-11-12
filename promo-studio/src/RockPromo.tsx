import React from 'react';
import {AbsoluteFill,Audio,Img,Sequence,staticFile,useCurrentFrame} from 'remotion';
import {M001,M013,M015,M022,M060} from './motions/rock';
import {M012} from './motions';

export type Scene={from:number;to:number;kind:string;source?:string;sourceStart?:number;sourceEnd?:number;word:string;copy:string[];accent:string;scale?:number;cta?:string;motionIds:string[];locale?:string;captureRoot?:string};
export type RockPlan={durationSeconds:number;fps:number;bpm:number;music:string;scenes:Scene[]};
const font='"Arial Black","Yu Gothic",Meiryo,sans-serif';
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const ease=(n:number)=>1-Math.pow(1-clamp(n),3);
const Text:React.FC<{children:React.ReactNode;size:number;color?:string;outline?:boolean;style?:React.CSSProperties}>=({children,size,color='#f4f3ea',outline=false,style})=><div style={{fontSize:size,fontWeight:950,lineHeight:.92,letterSpacing:-size*.055,color:outline?'transparent':color,WebkitTextStroke:outline?`2px ${color}`:undefined,...style}}>{children}</div>;
const Image:React.FC<{scene:Scene;duration:number;style?:React.CSSProperties}>=({scene,duration,style})=>{
  const f=useCurrentFrame(),start=scene.sourceStart??0,end=scene.sourceEnd??119;
  const index=Math.round(start+(end-start)*clamp(f/Math.max(1,duration-1)));
  return <Img src={staticFile(`${scene.captureRoot??'captures'}/${scene.source}/${String(index).padStart(4,'0')}.jpg`)} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',...style}}/>;
};
const Grain:React.FC=()=> <AbsoluteFill style={{pointerEvents:'none',opacity:.09,backgroundImage:'repeating-linear-gradient(0deg,transparent 0px,transparent 3px,#fff 4px,transparent 5px)',mixBlendMode:'soft-light'}}/>;
const Meta:React.FC<{index:number;accent:string;english?:boolean}>=({index,accent,english=false})=><><div style={{position:'absolute',top:39,left:78,right:78,display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:22,fontWeight:800,letterSpacing:4,color:accent==='#171a12'?'#171a12':'#f4f3ea'}}><span>DARTS / TOURNAMENT</span><span style={{color:accent,background:accent==='#171a12'?'#d6ff35ee':'#0b0d0bdd',padding:'8px 12px'}}>{english?'EN / TRANSITIONS':'VOL.02'} — {String(index+1).padStart(2,'0')}/10</span></div><div style={{position:'absolute',bottom:18,left:60,right:60,padding:'14px 18px',background:'#0b0d0bde',display:'flex',justifyContent:'space-between',fontSize:19,color:'#e0e3df',letterSpacing:1}}><span>{english?'APP PREVIEW / ENGLISH LOCALIZATION':'ACTUAL APP / SAMPLE PREVIEW'}</span><span>{english?'SAMPLE VISUALS — NOT ACTUAL TOURNAMENT RESULTS':'サンプル演出・実際の大会結果ではありません'}</span></div></>;
const TypeCut:React.FC<{scene:Scene;index:number;duration:number}>=({scene,index,duration})=>{
  const f=useCurrentFrame(),isNext=index===4;
  return <AbsoluteFill style={{background:index===0?'#0b0c0b':'#d6ff35',color:isNext?'#11130d':'#f4f3ea'}}>
    <div style={{position:'absolute',width:1300,height:1300,left:800-f*4,top:-110,border:`2px solid ${isNext?'#1e240c33':scene.accent+'55'}`,borderRadius:'50%'}}/><div style={{position:'absolute',left:1050,top:40,width:3,height:1000,background:scene.accent,transform:'rotate(24deg)',opacity:.5}}/>
    <div style={{position:'absolute',left:76-f*4,top:isNext?220:160,transform:`rotate(-5deg) translateX(${(1-ease(f/8))*850}px)`}}>{scene.word.split(' / ').map((word,i)=><Text key={word} size={isNext?330:330} color={isNext?'#11130d':scene.accent} outline={!isNext} style={{whiteSpace:'nowrap',marginBottom:20,transform:`translateX(${i*70}px)`}}>{word}</Text>)}</div>
    <div style={{position:'absolute',left:isNext?1250:110,top:isNext?880:620,transform:`rotate(${isNext?-5:0}deg)`}}>{scene.copy.map((line,i)=><M001 key={line} durationFrames={duration} delay={i*4+3}><Text size={index===0?108:52} color={isNext?'#11130d':'#f4f3ea'} style={{lineHeight:1.25}}>{line}</Text></M001>)}</div>
    <div style={{position:'absolute',left:90,top:130,width:6,height:70,background:isNext?'#11130d':scene.accent}}/>{!isNext&&<div style={{position:'absolute',right:95,bottom:140,color:scene.accent,fontSize:25,fontWeight:900,letterSpacing:7}}>PLAY. FEEL. REPEAT.</div>}<M015 durationFrames={duration} accentColor={isNext?'#11130d':scene.accent}/><M060 durationFrames={duration} accentColor={isNext?'#11130d':scene.accent} intensity={.22}/><Grain/>
  </AbsoluteFill>;
};
const ScreenCut:React.FC<{scene:Scene;duration:number;index:number}>=({scene,duration,index})=>{
  const f=useCurrentFrame(),p=f/duration;
  const slam=1+(1-ease(f/8))*.35,zoom=(scene.scale??1.1)+p*.1;
  const shake=f<10?Math.sin(f*2.3)*(1-f/10)*14:0;
  return <AbsoluteFill style={{background:'#090b0b',overflow:'hidden'}}>
    <div style={{position:'absolute',inset:0,transform:`translate(${shake}px,${shake*.4}px) scale(${zoom*slam}) rotate(${(index%2?1:-1)*(1-ease(f/10))*3}deg)`,transformOrigin:index===5?'50% 44%':'50% 50%'}}><M012 durationFrames={duration} intensity={.025}><Image scene={scene} duration={duration}/></M012></div>
    <AbsoluteFill style={{background:'linear-gradient(0deg,#050706ee 0%,transparent 48%,#05070699 100%)'}}/>
    <div style={{position:'absolute',top:135,left:90,color:scene.accent,fontSize:24,letterSpacing:7,fontWeight:900}}>0{index+1} / LIVE THE MOMENT</div>
    <div style={{position:'absolute',left:85,bottom:140,display:'flex',alignItems:'end',gap:50,transform:'rotate(-3deg)'}}><M022 durationFrames={duration} accentColor={scene.accent}><Text size={155} color={scene.accent} style={{fontStyle:'italic'}}>{scene.word}</Text></M022><M001 durationFrames={duration} delay={6}><Text size={68} style={{paddingBottom:12}}>{scene.copy[0]}</Text></M001></div>
    <div style={{position:'absolute',right:70,top:190,width:11,height:440,background:scene.accent,transform:`scaleY(${ease(f/10)})`,transformOrigin:'top'}}/><M015 durationFrames={duration} accentColor={scene.accent} intensity={.3}/><M060 durationFrames={duration} accentColor={scene.accent} intensity={.38}/><Grain/>
  </AbsoluteFill>;
};
const SplitCut:React.FC<{scene:Scene;duration:number;index:number}>=({scene,duration,index})=>{
  const f=useCurrentFrame(),p=f/duration;
  return <AbsoluteFill style={{background:'#101110',overflow:'hidden'}}>
    <div style={{position:'absolute',inset:0,clipPath:'polygon(0 0,64% 0,42% 100%,0 100%)',transform:`translateX(${-(1-ease(f/9))*500}px)`}}><Image scene={scene} duration={duration} style={{transform:`scale(${1.55+p*.12})`,filter:'grayscale(1) contrast(1.2) brightness(.72)'}}/></div>
    <div style={{position:'absolute',inset:0,clipPath:'polygon(65% 0,100% 0,100% 100%,43% 100%)',transform:`translateX(${(1-ease(f/9))*500}px)`}}><Image scene={scene} duration={duration} style={{transform:`scale(${1.55+p*.12})`,filter:'grayscale(1) contrast(1.3) brightness(.52)'}}/></div>
    <div style={{position:'absolute',left:1000,top:-100,width:14,height:1400,background:scene.accent,transform:'rotate(22deg)'}}/>
    <div style={{position:'absolute',top:155,left:70,transform:'rotate(-5deg)'}}><Text size={index===6?220:260} color={scene.accent} outline>{scene.word}</Text></div>
    <div style={{position:'absolute',left:130,top:index===6?450:550,transform:'rotate(-4deg)'}}>{scene.copy.map((line,i)=><M001 key={line} durationFrames={duration} delay={4+i*5} direction={i%2?-1:1}><Text size={index===6?125:180} style={{lineHeight:1.15}}>{line}</Text></M001>)}</div><M015 durationFrames={duration} accentColor={scene.accent}/><Grain/>
  </AbsoluteFill>;
};
const RallyCut:React.FC<{scene:Scene;duration:number}>=({scene,duration})=>{
  const f=useCurrentFrame();return <AbsoluteFill style={{background:scene.accent,color:'#111'}}>
    <div style={{position:'absolute',left:930,top:0,bottom:0,width:1000,overflow:'hidden',transform:'skewX(-10deg)'}}><Image scene={scene} duration={duration} style={{filter:'grayscale(1) contrast(1.3)',transform:`scale(${1.3+f/600}) skewX(10deg)`}}/><AbsoluteFill style={{background:'linear-gradient(90deg,#d6ff35,transparent 65%)'}}/></div>
    <div style={{position:'absolute',left:80,top:145,transform:'rotate(-5deg)'}}>{scene.word.split(' / ').map((word,i)=><M001 key={word} durationFrames={duration} delay={i*3}><Text size={235} color="#11140a">{word}</Text></M001>)}</div><div style={{position:'absolute',right:100,bottom:scene.locale==='en'?145:180,transform:'rotate(-5deg)'}}><M022 durationFrames={duration} accentColor="#111"><Text size={scene.locale==='en'?64:140} color="#111" style={scene.locale==='en'?{background:scene.accent,padding:'12px 20px'}:undefined}>{scene.copy[0]}</Text></M022></div><M060 durationFrames={duration} accentColor="#15190c" intensity={.2}/><Grain/>
  </AbsoluteFill>;
};
const EndCut:React.FC<{scene:Scene;duration:number}>=({scene,duration})=>{
  const f=useCurrentFrame();return <AbsoluteFill style={{background:'#0b0d0b'}}>
    <Image scene={scene} duration={duration} style={{opacity:.12,filter:'grayscale(1)',transform:`scale(${1.15+f*.0005})`}}/>
    <div style={{position:'absolute',left:95,top:210,transform:`rotate(-3deg) scale(${1+(1-ease(f/12))*.12})`}}>{scene.word.split(' / ').map((line,i)=><M001 key={line} durationFrames={duration} delay={i*3}><Text size={i?170:260} color={i?'#f4f3ea':scene.accent} style={{lineHeight:1.05}}>{line}</Text></M001>)}<M001 durationFrames={duration} delay={8}><div style={{fontSize:58,fontWeight:900,marginTop:42,letterSpacing:-2}}>{scene.copy[0]}</div></M001><div style={{marginTop:42,fontSize:31,color:scene.accent,fontWeight:800,letterSpacing:4,opacity:ease((f-15)/8)}}>{scene.cta} <span style={{marginLeft:35}}>↗</span></div></div>
    <div style={{position:'absolute',right:98,top:180,height:650,width:14,background:scene.accent}}/><M015 durationFrames={duration} accentColor={scene.accent}/><M060 durationFrames={duration} accentColor={scene.accent} intensity={.3}/><Grain/>
  </AbsoluteFill>;
};
export const RockCut:React.FC<{scene:Scene;index:number;duration:number;plain?:boolean}>=({scene,index,duration,plain=false})=>{
  const content=scene.kind==='type'?<TypeCut scene={scene} duration={duration} index={index}/>:scene.kind==='screen'?<ScreenCut scene={scene} duration={duration} index={index}/>:scene.kind==='split'?<SplitCut scene={scene} duration={duration} index={index}/>:scene.kind==='rally'?<RallyCut scene={scene} duration={duration}/>:<EndCut scene={scene} duration={duration}/>;
  return <AbsoluteFill>{plain?content:<M013 durationFrames={duration}>{content}</M013>}<Meta index={index} english={scene.locale==='en'} accent={scene.kind==='rally'||index===4?'#171a12':scene.accent}/></AbsoluteFill>;
};
export const RockPromo:React.FC<{plan:RockPlan}>=({plan})=><AbsoluteFill style={{fontFamily:font,background:'#0b0d0b',color:'#f4f3ea'}}>{plan.scenes.map((scene,index)=><Sequence key={`${index}-${scene.from}`} from={scene.from*plan.fps} durationInFrames={(scene.to-scene.from)*plan.fps}><RockCut scene={scene} index={index} duration={(scene.to-scene.from)*plan.fps}/></Sequence>)}<Audio src={staticFile(plan.music)} volume={1}/></AbsoluteFill>;
