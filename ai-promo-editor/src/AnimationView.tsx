import React from 'react';
import {deltaTransform,type Delta} from './animations';
export function AnimationSurface({delta:d,children,scope}:{delta:Delta;children:React.ReactNode;scope:string}){return <div data-animation-surface={scope} style={{position:'absolute',inset:0,transform:deltaTransform(d),opacity:d.opacity,clipPath:d.clip}}>{children}{d.scan!==undefined?<div data-animation-scan style={{position:'absolute',left:`${d.scan*100}%`,top:0,bottom:0,width:4,background:'#a4ffef',boxShadow:'0 0 24px 9px #65f5ce99',pointerEvents:'none'}}/>:null}</div>;}
export function AnimationText({text,delta:d}:{text:string;delta:Delta}){
 if(d.textProgress===undefined)return <>{text}</>;
 const chars=Array.from(text),t=d.textProgress;
 if(d.textMode===21)return <>{chars.slice(0,Math.floor(chars.length*t)).join('')}</>;
 if(d.textMode===22)return <>{chars.map((c,i)=><span key={i} style={{display:'inline',opacity:Math.max(0,Math.min(1,(t-i/Math.max(1,chars.length)*.8)*5))}}>{c}</span>)}</>;
 return <>{chars.map((c,i)=>t===1||/\s/.test(c)?c:'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[(i*17+Math.floor(t*71))%36]).join('')}</>;
}
