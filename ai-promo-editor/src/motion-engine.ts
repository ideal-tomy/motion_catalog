import type {CSSProperties} from 'react';
import type {Motion} from './core';
export const allMotionIds=Array.from({length:60},(_,i)=>`M-${String(i+1).padStart(3,'0')}`);
export const textMotionIds=['M-001','M-002','M-003','M-004','M-017','M-018','M-019','M-020','M-021','M-022','M-023','M-024'];
export const characterMotionIds=['M-001','M-002','M-004','M-017','M-018','M-019','M-021','M-023','M-024'];
const contentIds=new Set([...textMotionIds,'M-005','M-006','M-007','M-025','M-026','M-029','M-030','M-031','M-032','M-033','M-034','M-035','M-036','M-039','M-040']);
export const isContentMotion=(id:string)=>contentIds.has(id);
export const clamp=(x:number)=>Math.max(0,Math.min(1,x));
export const ease=(x:number)=>1-(1-clamp(x))**3;
export const seeded=(n:number)=>{const v=Math.sin(n*127.1+79.31)*43758.5453;return v-Math.floor(v)};
export function motionClock(m:Motion,frame:number){const speed=Number(m.params.speed??1),local=(frame-m.startOffsetFrames)*speed+Number(m.params.elapsedOffsetFrames??0);return {local,p:clamp(local/m.durationFrames),active:local>=0&&local<m.durationFrames};}
export function motionStyle(m:Motion,frame:number,index=0,count=1,depth=0):CSSProperties{
 const {p,local}=motionClock(m,frame),q=ease(p),late=clamp((p-.12)/.8),entry=ease(p-index*.065),fade=1-q,style:CSSProperties={width:'100%',height:'100%',position:'relative',transformOrigin:'50% 50%'};
 const transform=(t:string)=>{style.transform=t;};
 switch(m.motionId){
 case 'M-001':transform(`translateY(${(1-entry)*55}px)`);style.opacity=entry;break;
 case 'M-002':style.filter=`contrast(${1+(1-q)*.8})`;style.clipPath=`inset(0 ${(1-q)*100}% 0 0)`;break;
 case 'M-003':style.clipPath=`inset(${(1-q)*100}% 0 0 0)`;transform(`translateY(${fade*25}px)`);break;
 case 'M-004':style.opacity=.35+.65*q;transform(`scale(${.9+.1*q})`);break;
 case 'M-005':transform(`perspective(1200px) translateY(${(1-entry)*70}px) rotateX(${(1-entry)*-12}deg)`);style.opacity=entry;break;
 case 'M-006':style.clipPath=`inset(${(1-entry)*45}% ${(1-entry)*45}% 0 0)`;style.opacity=entry;break;
 case 'M-007':style.clipPath=`inset(0 ${(1-ease(p*.85))*100}% 0 0)`;break;
 case 'M-008':style.filter=`brightness(${1+.12*Math.sin(p*Math.PI)})`;break;
 case 'M-009':transform(`perspective(1200px) scale(${.72+.28*q}) translateZ(${fade*-160}px)`);style.opacity=.2+.8*q;break;
 case 'M-010':transform(`perspective(1200px) rotateY(${Math.sin(p*Math.PI*2)*12*fade}deg) rotateX(${Math.cos(p*Math.PI*2)*5*fade}deg) scale(${.94+.06*q})`);break;
 case 'M-011':transform(`translateX(${(depth?1:-1)*fade*(30+Math.abs(depth)*20)}px) scale(${1+.035*fade})`);break;
 case 'M-012':transform(`scale(${1+.12*q*Number(m.params.strength??1)})`);break;
 case 'M-013':{const g=p<.32?Math.sin(Math.floor(local)*2.3)*12*(1-p/.32):0;transform(`translateX(${g}px) skewX(${g*.3}deg)`);style.filter=`drop-shadow(${g*.6}px 0 #54e9e9) drop-shadow(${-g*.5}px 0 #ff7ca8)`;break;}
 case 'M-014':transform(`scale(${.94+.06*q})`);break;
 case 'M-015':style.filter=`brightness(${1+.15*Math.sin(p*Math.PI)})`;break;
 case 'M-016':transform(`scale(${.9+.1*q+Math.sin(p*Math.PI)*.035})`);break;
 case 'M-017':style.clipPath=`inset(0 ${(1-q)*100}% 0 0)`;break;
 case 'M-018':transform(`translateX(${(index%2?1:-1)*fade*160}px)`);style.opacity=q;break;
 case 'M-019':transform(`translateY(${Math.sin(p*Math.PI*2+index*.6)*25*fade}px)`);break;
 case 'M-020':style.filter=`blur(${fade*15}px)`;style.opacity=q;transform(`scale(${1.12-.12*q})`);break;
 case 'M-021':transform(`translateY(${-Math.sin(p*Math.PI)*35}px) rotate(${fade*-15}deg)`);break;
 case 'M-022':transform(`scale(${p<.35?1.6-.6*ease(p/.35):1+Math.sin((p-.35)*Math.PI*4)*.04*fade}) rotate(${fade*-5}deg)`);style.opacity=ease(p*5);break;
 case 'M-023':transform(`perspective(900px) rotateY(${180*(1-entry)}deg)`);style.opacity=entry;break;
 case 'M-024':style.filter=`drop-shadow(0 0 ${fade*6}px currentColor)`;style.opacity=.3+.7*q;break;
 case 'M-025':transform(`translateX(${(1-entry)*-45}px)`);style.opacity=entry;break;
 case 'M-026':style.opacity=.25+.75*ease(p-index*.13);style.clipPath=`inset(0 ${(1-entry)*100}% 0 0)`;break;
 case 'M-027':transform(`translateX(${fade*80}px)`);style.opacity=q;break;
 case 'M-028':transform(`scale(${.35+.65*q})`);style.opacity=q;style.boxShadow=`0 0 0 ${fade*140}px #0005`;break;
 case 'M-029':style.filter=`saturate(${q})`;style.opacity=.35+.65*q;transform(`translateX(${fade*(index%2?20:-20)}px)`);break;
 case 'M-030':{const k=p<.72?ease(p/.72)*.94:.94+.06*ease((p-.72)/.28);transform(`translate(${(1-k)*-180}px,${(1-k)*70}px)`);break;}
 case 'M-031':style.opacity=ease(p-index*.11);transform(`scale(${.85+.15*entry})`);break;
 case 'M-032':style.opacity=.4+.6*ease(p-index*.1);transform(`translateY(${Math.sin(p*Math.PI)*8*(index%2?1:-1)}px)`);break;
 case 'M-033':if(index%2===1)style.clipPath=`inset(0 ${(1-q)*100}% 0 0)`;break;
 case 'M-034':transform(`translateX(${Math.sin(p*Math.PI)*(index%3-1)*90}px) scale(${1+Math.sin(p*Math.PI)*(index%3===1?.12:-.04)})`);style.opacity=index%3===1?1:.65+.35*q;break;
 case 'M-035':transform(`scale(${1+(depth<=0?.3:0)*q})`);break;
 case 'M-036':transform(`perspective(1000px) rotateX(${25*fade}deg) rotateY(${-25*fade}deg) rotateZ(${-8*fade}deg)`);break;
 case 'M-037':transform(`translateX(${90*(1-q)}px) scale(1.06)`);break;
 case 'M-038':transform(`perspective(1400px) rotateX(${fade*30}deg) translateY(${fade*110}px)`);break;
 case 'M-039':style.filter=`blur(${(index%2===0?Math.sin(p*Math.PI):1-q)*12}px)`;break;
 case 'M-040':transform(`translateX(${depth>0?Math.sin(p*Math.PI)*8:-Math.sin(p*Math.PI)*70}px)`);break;
 case 'M-041':style.clipPath=`circle(${q*145}% at 50% 50%)`;break;
 case 'M-042':style.clipPath=`polygon(0 0,${q*140}% 0,${q*140-40}% 100%,0 100%)`;break;
 case 'M-043':style.clipPath=`polygon(${Array.from({length:24},(_,i)=>{const a=i/24*Math.PI*2,r=q*115*(.8+seeded(i)*.2);return `${50+Math.cos(a)*r}% ${50+Math.sin(a)*r}%`;}).join(',')})`;break;
 case 'M-044':transform(`perspective(1400px) rotateY(${(1-q)*-180}deg)`);style.opacity=clamp(p*3);break;
 case 'M-045':style.filter=`contrast(${1+.4*fade})`;break;
 case 'M-046':style.clipPath=`inset(${(1-q)*50}% 0)`;break;
 case 'M-047':style.filter=`brightness(${1+.8*Math.exp(-Math.pow((p-.18)/.09,2))})`;style.opacity=.55+.45*q;break;
 case 'M-048':{const r=q*150;style.clipPath=p<.45?`circle(${r}% at 50% 50%)`:`polygon(50% ${-100*q}%,${50+q*180}% ${50+q*130}%,${50-q*180}% ${50+q*130}%)`;break;}
 case 'M-049':style.opacity=.3+.7*q;style.filter=`drop-shadow(0 0 ${fade*16}px #70e5e0)`;break;
 case 'M-050':style.clipPath=`inset(${(1-q)*100}% 0 0 0)`;style.filter=`opacity(${.4+.6*q}) saturate(.65)`;break;
 case 'M-051':style.filter=`hue-rotate(${Math.sin(p*Math.PI*2)*12}deg)`;break;
 case 'M-052':transform(`scale(${1.1-.1*q})`);style.opacity=.5+.5*q;break;
 case 'M-053':transform(`perspective(1000px) scale(${.55+.45*q}) rotateZ(${fade*5}deg)`);style.filter=`blur(${fade*4}px)`;break;
 case 'M-054':transform(`scale(${.98+.02*q})`);break;
 case 'M-055':transform(`translate(${Math.sin(p*Math.PI*2)*20*fade}px,${Math.sin(p*Math.PI)*15*fade}px) rotate(${Math.sin(p*Math.PI)*3*fade}deg)`);break;
 case 'M-056':transform(`translateY(${fade*12}px)`);break;
 case 'M-057':{const beat=Math.exp(-Math.pow((local%15)/4,2))*(p<1?1:0);transform(`scale(${1+beat*.07})`);break;}
 case 'M-058':{const beat=Math.exp(-Math.pow((local%30)/5,2))*(p<1?1:0);transform(`scale(${1+.08*beat},${1-.045*beat})`);break;}
 case 'M-059':style.filter=`brightness(${1+.06*Math.sin(local*.7)*(p<1?1:0)})`;break;
 case 'M-060':{const hit=Number(m.params.hitFrame??12),impact=Math.exp(-Math.pow((local-hit)/5,2));transform(`scale(${.92+.08*ease(p*3)+impact*.065})`);break;}
 default:throw Error(`未対応のモーション: ${m.motionId}`);
 }
 return style;
}

