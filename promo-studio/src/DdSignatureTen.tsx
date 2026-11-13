import React from 'react';
import {AbsoluteFill,Audio,Freeze,Img,staticFile,useCurrentFrame} from 'remotion';
import {M008,M028} from './motions/dd';

const navy='#12232d',paper='#f3f0e9',gold='#bcaa85';
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const out=(v:number)=>1-(1-clamp(v))**3;
type Scene={from:number;to:number;motion:string;label:string;copy:string};
type Plan={music:string;scenes:Scene[];transitions:{kind:string;frames:number}[]};
const shot=(name:string,style:React.CSSProperties={})=><Img src={staticFile(`captures/dd/${name}`)} style={{width:'100%',display:'block',...style}}/>;
const Card:React.FC<{children:React.ReactNode;style:React.CSSProperties}>=({children,style})=><div style={{position:'absolute',background:'#fff',borderRadius:16,overflow:'hidden',boxShadow:'0 28px 75px #0003',border:'1px solid #ffffff55',...style}}>{children}</div>;

function sceneView(s:Scene,i:number,f:number){
 const q=out(f/32),light=[2,4,6,8].includes(i);
 const caption=<div style={{position:'absolute',left:135,top:i===0?290:175,zIndex:3}}><div style={{color:light?'#887958':gold,fontSize:19,letterSpacing:5}}>{s.label}</div><div style={{fontSize:i===0?96:70,letterSpacing:i===0?10-6*q:3,lineHeight:1.45,whiteSpace:'pre-line',marginTop:30,fontWeight:400}}>{s.copy}</div></div>;
 let media:React.ReactNode;
 switch(i){
 case 0: media=<Card style={{left:1120,top:260,width:650,height:530,clipPath:`inset(${45*(1-q)}% 0 ${45*(1-q)}% 0)`}}>{shot('overview.jpg',{width:1000,transform:'translate(-280px,-55px)'})}</Card>;break;
 case 1:{const scan=Math.min(119,Math.round(clamp(f/75)*119));media=<Card style={{left:135,top:400,width:1650,height:470}}>{shot(`scan/${String(scan).padStart(4,'0')}.jpg`,{width:1650})}<Freeze frame={Math.max(0,f-12)}><M008 durationFrames={90} accentColor={gold} marker="DEMO / SCAN"/></Freeze></Card>;break;}
 case 2: media=<><Card style={{left:135,top:410,width:1650,height:300}}>{shot('result.jpg',{width:1650,transform:'translateY(-175px)'})}</Card><svg style={{position:'absolute',left:145,top:415,width:1630,height:102,pointerEvents:'none'}}><rect x="2" y="2" width="1620" height="94" rx="8" fill="none" stroke={gold} strokeWidth="3" strokeDasharray="3430" strokeDashoffset={3430*(1-out((f-14)/35))}/></svg></>;break;
 case 3: media=<div style={{position:'absolute',left:880,top:300,width:875,height:534}}><Freeze frame={Math.max(0,f-8)}><M028 durationFrames={90}><div style={{borderRadius:16,overflow:'hidden',boxShadow:'0 25px 90px #0004'}}>{shot('evidence-card.jpg')}</div></M028></Freeze></div>;break;
 case 4: media=<><Card style={{left:135,top:415,width:950,height:405,transform:`perspective(1500px) rotateX(${15*(1-q)}deg)`,transformOrigin:'top'}}>{shot('overview.jpg',{width:1450,transform:'translate(-400px,-220px)'})}</Card><div style={{position:'absolute',left:1190,top:475,fontSize:86,fontFamily:'Georgia,serif',color:'#887958'}}>PERSPECTIVE</div></>;break;
 case 5: media=<Card style={{left:135,top:410,width:1650,height:400}}>{shot('overview.jpg',{width:2350,transform:`translate(-${650+35*clamp(f/90)}px,-750px)`})}</Card>;break;
 case 6: media=<><Card style={{left:140,top:420,width:950,height:400,clipPath:`polygon(0 0,${100*q}% 0,${100*q}% 100%,0 100%)`}}>{shot('result.jpg',{width:1250,transform:'translate(-30px,-120px)'})}</Card><Card style={{left:1190,top:420,width:590,height:359,transform:`translateY(${-28*q}px)`}}>{shot('evidence-card.jpg')}</Card></>;break;
 case 7: media=<Card style={{left:850,top:245,width:920,height:560,transform:`perspective(1600px) rotateY(${-6+6*q}deg) rotateZ(${-1.5+1.5*q}deg)`}}>{shot('evidence-card.jpg')}<div style={{position:'absolute',left:330,top:156,width:555,height:74,border:'2px solid '+gold,transform:`scaleX(${out((f-10)/30)})`,transformOrigin:'left',background:'#bcaa8512'}}/></Card>;break;
 case 8: media=<>{[0,1,2].map(k=><Card key={k} style={{left:140+k*557,top:420,width:518,height:385,transform:`translateY(${(1-out((f-k*7)/30))*65}px)`}}>{shot(k===2?'evidence-card.jpg':k===0?'overview.jpg':'result.jpg',{width:k===0?1100:k===1?1350:518,transform:k===0?'translate(-305px,-125px)':k===1?'translate(-15px,-110px)':'translate(0px,20px)'})}</Card>)}</>;break;
 default: media=<div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}><div style={{fontSize:20,letterSpacing:5,color:gold}}>EVIDENCE FOR DECISIONS</div><div style={{fontFamily:'Georgia,serif',fontSize:155,letterSpacing:17,marginTop:25}}>AXEON</div><div style={{fontSize:28,letterSpacing:10}}>DD INTELLIGENCE</div><div style={{fontSize:43,letterSpacing:4,marginTop:58}}>確信をもって、次の一手へ。</div><div style={{width:235*q,height:1,background:gold,marginTop:38}}/><div style={{fontSize:21,letterSpacing:3,color:gold,marginTop:25}}>EXPERIENCE THE DEMO　↗</div></div>;
 }
 return <AbsoluteFill style={{background:light?paper:navy,color:light?navy:paper,fontFamily:'"Yu Gothic",Meiryo,sans-serif',overflow:'hidden'}}><AbsoluteFill style={{background:light?'radial-gradient(ellipse at 70% 25%,#fff9,transparent 70%)':'radial-gradient(ellipse at 75% 35%,#29414a99,transparent 65%)'}}/>{i!==9&&caption}{media}</AbsoluteFill>;
}

// Every boundary has a separate two-page transition; outgoing footage remains
// present until the incoming page covers it. No blank frames between scenes.
function pageStyles(kind:string,t:number):{previous:React.CSSProperties;next:React.CSSProperties}{
 const p=out(t),base:React.CSSProperties={position:'absolute',inset:0};
 let previous:React.CSSProperties={},next:React.CSSProperties={};
 switch(kind){
 case 'depth-pass': previous={transform:`scale(${1+p*.65})`,opacity:1-p};next={transform:`scale(${.86+.14*p})`,opacity:.25+.75*p};break;
 case 'horizontal-push':previous={transform:`translateX(${-p*1920}px)`};next={transform:`translateX(${(1-p)*1920}px)`};break;
 case 'page-turn':previous={transform:`perspective(1400px) rotateY(${95*p}deg)`,transformOrigin:'left',zIndex:2,backfaceVisibility:'hidden'};break;
 case 'iris-open':next={clipPath:`circle(${p*125}% at 65% 55%)`};break;
 case 'vertical-pass':previous={transform:`translateY(${-p*1080}px)`};next={transform:`translateY(${(1-p)*1080}px)`};break;
 case 'diagonal-reveal':next={clipPath:`polygon(0 0,${p*140}% 0,${p*140-40}% 100%,0 100%)`};break;
 case 'split-door':previous={clipPath:`inset(0 ${p*50}% 0 ${p*50}%)`,zIndex:2};break;
 case 'card-stack':previous={transform:`translate(${-p*220}px,${p*70}px) scale(${1-.12*p})`,opacity:1-p*.6};next={transform:`translate(${(1-p)*1400}px,${(1-p)*-90}px) rotate(${(1-p)*6}deg)`,transformOrigin:'80% 80%'};break;
 case 'optical-dissolve':previous={filter:`blur(${p*18}px)`,opacity:1-p};next={filter:`blur(${(1-p)*10}px)`,opacity:p};break;
 }
 return {previous:{...base,...previous},next:{...base,...next}};
}

export const DdSignatureTen:React.FC<{plan:Plan}>=({plan})=>{
 const f=useCurrentFrame(),i=Math.min(9,Math.floor(f/90)),t=f-i*90,transition=i>0?plan.transitions[i-1]:null;
 const styles=transition&&t<transition.frames?pageStyles(transition.kind,t/(transition.frames-1)):null;
 return <AbsoluteFill style={{background:navy,overflow:'hidden'}}><Audio src={staticFile(plan.music)} volume={.85}/>{styles?<><div style={styles.previous}>{sceneView(plan.scenes[i-1],i-1,90+t)}</div><div style={styles.next}>{sceneView(plan.scenes[i],i,t)}</div></>:sceneView(plan.scenes[i],i,t)}<div style={{position:'absolute',left:100,right:100,top:55,display:'flex',justifyContent:'space-between',fontFamily:'Arial,sans-serif',fontSize:18,letterSpacing:4,color:gold}}><span>AXEON</span><span>DD INTELLIGENCE</span></div><div style={{position:'absolute',left:100,right:100,bottom:40,borderTop:'1px solid #a9a99a55',paddingTop:19,display:'flex',justifyContent:'space-between',fontFamily:'"Yu Gothic",sans-serif',fontSize:18,color:'#89999f'}}><span>ACTUAL PRODUCT / SAMPLE DATA</span><span>画面・数値はデモ用サンプル。最終判断は人が行います。</span></div></AbsoluteFill>;
};




