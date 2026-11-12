// Generated from unmodified Atlas. Do not edit. Source SHA256: bc8a92123f5e3b352c384ad8e3e5618dad4d9c96c81398ae3d9f9e12232cebd4
import data from '../../reference/catalog/MOTION_ATLAS_60/motions.json';
export function createAtlasRenderer(ctx){
const W=1280,H=720,TAU=Math.PI*2;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),ease=x=>1-Math.pow(1-clamp(x),3),smooth=x=>{x=clamp(x);return x*x*(3-2*x)},lerp=(a,b,u)=>a+(b-a)*u;
const rnd=n=>{let x=Math.sin(n*127.1+79.31)*43758.5453;return x-Math.floor(x)};
function rect(x,y,w,h,color,rad=0){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,rad);ctx.fill()}
function line(x1,y1,x2,y2,color='#53b8cf',width=1){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
function ring(x,y,r,color='#7be9ef',width=2){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.arc(x,y,Math.max(.01,r),0,TAU);ctx.stroke()}
function txt(s,x,y,size=32,color='#e7f6ff',weight='800',align='left',letter=0){ctx.font=`${weight} ${size}px Inter, Arial, sans-serif`;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillStyle=color;if(!letter){ctx.fillText(s,x,y);return}let char=[...s],ws=char.map(c=>ctx.measureText(c).width),w=ws.reduce((a,b)=>a+b,0)+letter*(char.length-1),cur=align==='center'?x-w/2:align==='right'?x-w:x;char.forEach((c,i)=>{ctx.fillText(c,cur,y);cur+=ws[i]+letter})}
function poly(points,stroke,fill=null,width=1){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke()}
function glow(x,y,r,color='rgba(51,188,244,.3)'){let g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'rgba(0,0,0,0)');rect(x-r,y-r,2*r,2*r,g)}
function bg(t,variant=0){let g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,'#090f1f');g.addColorStop(.42,'#050a14');g.addColorStop(1,'#090719');rect(0,0,W,H,g);glow(970,250,480,variant%2?'rgba(90,65,165,.21)':'rgba(18,132,184,.2)');glow(270,570,400,'rgba(35,71,154,.14)');ctx.save();ctx.globalAlpha=.27;for(let i=0;i<30;i++){let x=(rnd(i+85)*W+t*(i%3+1)*3)%W,y=rnd(i+18)*H;rect(x,y,1.5,1.5,i%4?'#4da5bc':'#c0ecf9')}ctx.restore();ctx.save();ctx.globalAlpha=.2;for(let i=0;i<16;i++){let y=410+i*i*1.6;line(0,y,W,y,'#327b9a',1)}for(let i=-16;i<=16;i++)line(W/2,407,W/2+i*91,H,'#327b9a',1);ctx.restore();ctx.save();ctx.globalAlpha=.14;for(let y=0;y<H;y+=4)line(0,y,W,y,'#67b4dd',.38);ctx.restore()}
function frame(index,id,label,t){line(40,68,140,68,'#73e9f2',3);rect(40,67,7,7,'#71eaf2');txt('MOTION ATLAS',157,70,14,'#c5eff9','800', 'left',3);txt(`SCENE  ${String(index+1).padStart(2,'0')}  /  ${id}`,40,105,13,'#78a7bd','700','left',2);txt(label.toUpperCase(),W-47,71,13,'#a5d2e3','700','right',2);txt('CREATIVE LAB  /  EXPERIMENT 02',45,H-48,12,'#7c9cba','650','left',2);line(W-160,H-48,W-46,H-48,'#7fe8f2',3);txt(`${Math.floor(t*100).toString().padStart(3,'0')} / 200`,W-45,H-76,13,'#96b0ca','700','right');}
function centerLabel(small,big,sub=null){txt(small,640,220,15,'#77dce8','750','center',4);txt(big,640,335,86,'#e9fbff','900','center',-2);if(sub)txt(sub,640,430,21,'#9ab9d0','550','center',1)}
function scene(m,u,t,index){const q=ease(u),l=u*2;switch(m.id){
case'M-001':{let a=ease((u-.07)/.35),b=ease((u-.19)/.35);ctx.save();ctx.translate((1-a)*-350,0);txt('MAKE',190,286,139,'#effbff','900');ctx.restore();ctx.save();ctx.translate((1-b)*410,0);txt('IT MOVE.',185,429,143,'#7cedf4','900');ctx.restore();rect(190,507,lerp(0,670,ease((u-.45)/.32)),5,'#ec77b2');txt('IDEAS ARE MEANT TO MOVE',190,556,16,'#9ebed0','700','left',3);break}
case'M-002':{const goal='CREATE IMPACT',glyph='@#%&023478ABCDXYZ';let done=Math.floor(clamp((u-.1)/.67)*goal.length);let out='';for(let i=0;i<goal.length;i++)out+=i<done?goal[i]:glyph[Math.floor(rnd(Math.floor(u*85)+i*23)*glyph.length)];txt(out,640,338,91,'#b2f8ff','900','center',2);txt('DECODING YOUR NEXT STORY',640,441,19,'#719bb4','650','center',4);for(let i=0;i<18;i++)rect(290+i*40,495,25,7,i/18<u?'#80f2fc':'#21394c');break}
case'M-003':{let phrases=['IDEAS','IN','MOTION'];phrases.forEach((s,i)=>{let x=345,y=235+i*106;ctx.save();ctx.beginPath();ctx.rect(x-20,y-44,620,100);ctx.clip();txt(s,x,y+lerp(130,0,ease((u-i*.13)/.45)),90,i===2?'#73eef5':'#edfaff','900');ctx.restore()});line(950,218,950,530,'#75dce9',3);break}
case'M-004':{let num=(98.6*ease((u-.08)/.75)).toFixed(1);txt('PERFORMANCE / SYSTEM OPTIMIZATION',640,214,17,'#8cb7c9','700','center',3);txt(num+'%',640,365,161,'#f1fcff','900','center');rect(292,485,700,12,'#1b344c',5);rect(292,485,700*ease((u-.1)/.75),12,'#78eef4',5);txt('PROCESS ACCURACY',294,539,16,'#94aabd','700','left',2);break}
case'M-005':{let card=[['01','PLAN','IDEAS'],['02','BUILD','SYSTEM'],['03','GROW','IMPACT']];card.forEach((c,i)=>{let p=ease((u-i*.15-.06)/.42),cx=220+i*278,cy=202+(1-p)*230;ctx.save();ctx.globalAlpha=p;rect(cx,cy,252,294,'#14283b',16);ctx.strokeStyle=i===1?'#8ceefa':'#39667b';ctx.lineWidth=i===1?2:1;ctx.strokeRect(cx+1,cy+1,250,292);ring(cx+126,cy+90,39,i===1?'#9af7ff':'#63a7c5');txt(c[0],cx+126,cy+90,25,'#edfaff','850','center');txt(c[1],cx+126,cy+176,36,'#edfaff','850','center',2);txt(c[2],cx+126,cy+218,13,'#7ac9dd','700','center',3);ctx.restore()});break}
case'M-006':{let a=ease(u/.3),b=ease((u-.2)/.3),c=ease((u-.44)/.4);ctx.save();ctx.globalAlpha=a;rect(235,161,820,420,'#112335',15);ctx.strokeStyle='#497b8e';ctx.strokeRect(236,162,818,418);rect(235,161,820,47,'#172d40');txt('WORKSPACE / OVERVIEW',264,186,16,'#d7edf9','800');ctx.restore();for(let i=0;i<3;i++){ctx.save();ctx.globalAlpha=b;let x=261+i*258;rect(x,231,237,103,'#1d3549',9);txt(['ACTIVE','PROGRESS','COMPLETE'][i],x+15,255,12,'#88bdcc','700');txt(['12,480','+24.6%','98.6%'][i],x+15,302,31,'#e5f9ff','900');ctx.restore()}ctx.save();ctx.globalAlpha=c;rect(261,359,770,186,'#142c40',8);ctx.strokeStyle='#69dce7';ctx.lineWidth=5;ctx.beginPath();for(let i=0;i<90;i++){let x=290+i*7.6,y=497-((i/89)*100+Math.sin(i*.25)*18+Math.sin(i*.66)*7);if(i===0)ctx.moveTo(x,y);else if(i/89<c)ctx.lineTo(x,y)}ctx.stroke();ctx.restore();break}
case'M-007':{txt('MEASURABLE PROGRESS',266,204,24,'#acd7e5','750','left',3);for(let i=0;i<6;i++)line(267,267+i*55,1035,267+i*55,'#24435a',1);for(let i=0;i<12;i++)line(267+i*68,266,267+i*68,541,'#193549',1);ctx.strokeStyle='#7ff3f7';ctx.lineWidth=9;ctx.shadowColor='#5bf5f3';ctx.shadowBlur=24;ctx.beginPath();let steps=Math.floor(150*ease(u/.83));for(let i=0;i<=steps;i++){let f=i/150,x=272+f*758,y=488-f*180-Math.sin(f*13)*40-Math.sin(f*25)*13;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke();ctx.shadowBlur=0;txt('+240%',950,232,62,'#fff','900','right');txt('OPERATIONAL GAIN',950,270,15,'#7facc3','700','right',2);break}
case'M-008':{rect(386,173,507,384,'#10283a',12);ctx.strokeStyle='#3c6177';ctx.strokeRect(387,174,505,382);for(let i=0;i<5;i++)for(let j=0;j<4;j++){let x=448+j*101,y=245+i*51;rect(x,y,74,30,'#254b61',4);line(x+10,y+9,x+63,y+9,'#6a9cb2',2)}let sy=220+315*ease(u/.77);ctx.save();ctx.shadowColor='#6cf7f5';ctx.shadowBlur=38;line(395,sy,884,sy,'#b2ffff',5);ctx.restore();rect(397,220,487,Math.max(0,sy-220),'#54deeb16');if(u>.7){let a=ease((u-.7)/.3);ctx.save();ctx.globalAlpha=a;rect(484,336,318,76,'#155861',8);txt('✓  VERIFIED',645,373,37,'#b6fff9','850','center');ctx.restore()}txt('SCAN / TARGET 004',430,195,14,'#90d7e8','700');break}
case'M-009':{for(let i=0;i<14;i++){let z=((i/14+u*1.2)%1);let s=.08+Math.pow(z,2)*3.2,w=670*s,h=395*s,a=1-z*.7;ctx.strokeStyle=`rgba(99,232,252,${a*.62})`;ctx.lineWidth=1+z*3;ctx.strokeRect(640-w/2,355-h/2,w,h)}txt('BEYOND',640,295,91,'#effaff','900','center',4);txt('THE FRAME',640,389,88,'#77ebf3','900','center',4);break}
case'M-010':{glow(640,365,250,'rgba(67,192,223,.33)');let a=u*TAU*.44;for(let i=0;i<5;i++){let angle=i*TAU/5+a,x=640+Math.cos(angle)*260,y=360+Math.sin(angle)*110,sz=17+((Math.sin(angle)+1)/2)*25;ring(x,y,sz,'#7de4f1',3);line(x,y,640,360,'#437b9c',1)}ctx.save();ctx.translate(640,360);ctx.rotate(a*.8);for(let r=0;r<3;r++){let pts=[];for(let i=0;i<6;i++){let q=i*TAU/6+r*.25;pts.push([Math.cos(q)*(65+r*23),Math.sin(q)*(65+r*23)])}poly(pts,r%2?'#fc6fa8':'#a7f4ff',null,3)}ctx.restore();txt('NEW PERSPECTIVE',640,545,27,'#deefff','750','center',3);break}
case'M-011':{let shift=ease(u)*150;for(let layer=0;layer<3;layer++){let fac=[.2,.55,1][layer],c=['#13273c','#183c54','#28627a'][layer];for(let i=0;i<16;i++){let x=i*112-230-shift*fac+(layer*45),w=62+Math.floor(rnd(i+layer*19)*55),h=120+Math.floor(rnd(i*7+layer*24)*250);rect(x,530-h,w,h,c);line(x,530-h,x+w,530-h,layer===2?'#72bfce':'#365e74',2);}}txt('DEPTH',640,274,111,'#ebfaff','900','center',9);txt('THROUGH MOTION',640,377,26,'#82e0ec','700','center',7);break}
case'M-012':{let p=ease(u),z=lerp(.6,2.3,p);ctx.save();ctx.translate(640,344);ctx.scale(z,z);for(let r=185;r>35;r-=32)ring(0,0,r,'#6ecce78c',2);poly([[0,-45],[40,35],[-40,35]],'#bafaff','#72b3c833',3);ctx.restore();glow(640,344,100+p*75,'rgba(100,231,234,.12)');txt('FOCUS ON WHAT MATTERS',640,610,22,'#cdeef9','730','center',3);break}
case'M-013':{let str='BREAK THE FRAME';for(let i=0;i<7;i++){let y=272+i*37,off=(u>.2&&u<.65)?(rnd(i+Math.floor(u*35))-.5)*90:0;ctx.save();ctx.beginPath();ctx.rect(0,y,1280,36);ctx.clip();txt(str,640+off,370,76,i%2?'#7fe9ef':'#ff7dab','900','center',2);ctx.restore()}for(let i=0;i<20;i++){let yy=rnd(i+Math.floor(u*25))*H;line(0,yy,W,yy,i%2?'#e74c9a':'#50dbe9',rnd(i+14)*3)}break}
case'M-014':{let p=ease(u/.65);for(let i=0;i<140;i++){let a=i*2.39996,r=(20+p*(70+rnd(i+5)*440)),x=640+Math.cos(a)*r,y=342+Math.sin(a)*r*.67;ctx.save();ctx.globalAlpha=(1-u*.7)*(0.3+rnd(i+3)*.7);ring(x,y,1+rnd(i+9)*5,i%5===0?'#fc8db9':'#96f9fb',1.5);ctx.restore()}ring(640,342,80+200*p,'#6aeff062',3);txt('ENERGY',640,315,102,'#f0fbff','900','center',3);txt('UNLEASHED',640,416,45,'#82eff5','900','center',9);break}
case'M-015':{for(let i=0;i<32;i++){let f=(u*(1.2+rnd(i+4)) + rnd(i+1))%1,x=f*1600-170,y=110+i*16.5+(i%3)*25;ctx.save();ctx.globalAlpha=(.2+rnd(i)*.6)*(1-Math.abs(.5-f));ctx.strokeStyle=i%4?'#64ddf3':'#fc88bb';ctx.lineWidth=1+rnd(i+2)*4;ctx.beginPath();ctx.moveTo(x-240,y+130);ctx.lineTo(x+65,y-15);ctx.stroke();ctx.restore()}let a=ease((u-.2)/.45);ctx.save();ctx.globalAlpha=a;txt('VELOCITY',640,343,104,'#eefaff','900','center',6);ctx.restore();break}
case'M-016':{let p=ease(u/.34);for(let j=0;j<24;j++){let a=j*TAU/24;let r=250*p;line(640+Math.cos(a)*110,330+Math.sin(a)*80,640+Math.cos(a)*r,330+Math.sin(a)*r*.9,j%3?'#b1e9ee99':'#f6ae72aa',3)}for(let i=0;i<140;i++){let n=rnd(i+2),a=i*2.3999,r=(50+Math.sqrt(clamp(u))*n*540),x=640+Math.cos(a)*r+u*20,y=330+Math.sin(a)*r*.6+u*u*85;ctx.save();ctx.translate(x,y);ctx.rotate(a+u*4);rect(-3,-7,6,14,i%4===0?'#fc89ac':i%4===1?'#fbc67c':i%4===2?'#71e9f1':'#e6f8ff',1);ctx.restore()}ctx.save();ctx.globalAlpha=p;txt('WINNER',640,336,128,'#fff8eb','900','center',8);txt('THE MOMENT IS YOURS',640,448,23,'#a9edf6','700','center',5);ctx.restore();break}
default: drawExtended(m,u,t,index);break;
}}
// MOTION ATLAS 60 — 44 supplemental deterministic Canvas 2D motion sketches.
// All state is a function of progress u in [0,1] (not an accumulated particle simulation).
function drawExtended(m,u,t,index){
 const p=clamp(u),e=ease(p),cx=640,cy=345,white='#edfaff',cyan='#81edf5',pink='#ff7eaf',dim='#8eafc5';
 const fade=(a,b)=>smooth((p-a)/(b-a));
 const hold=(s,x=640,y=345,size=90)=>txt(s,x,y,size,white,'900','center',size>60?3:1);
 const tag=(s)=>txt(s,640,574,17,dim,'700','center',3);
 const pane=(x,y,w,h,alpha=1,col='#142f42')=>{ctx.save();ctx.globalAlpha=alpha;rect(x,y,w,h,col,15);ctx.strokeStyle='#42718a';ctx.lineWidth=1.5;ctx.strokeRect(x,y,w,h);ctx.restore()};
 const dot=(x,y,r=4,c=cyan)=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,Math.max(.1,r),0,TAU);ctx.fill()};
 const edge=(y,al=1)=>{ctx.save();ctx.globalAlpha=al;line(150,y,1130,y,'#225571',2);ctx.restore()};
 switch(m.id){
 case 'M-017': {
   const s='BUILD THE FUTURE';let n=Math.floor(ease(p/.8)*s.length);const text=s.slice(0,n);txt('> MOTION ATLAS / CONSOLE',182,217,21,cyan,'700','left',2);
   pane(166,264,948,188,.96,'#091825');txt(text,215,357,63,white,'800');if((Math.floor(p*11)%2)===0||p>.94)rect(218+text.length*34,315,8,72,cyan);
   tag('TYPE EACH CHARACTER  /  CURSOR BLINK');break;
 }
 case 'M-018': {
   const s='CONVERGENCE';const chars=[...s];const spread=fade(0,.65);const step=69;
   for(let i=0;i<chars.length;i++){let x=640+(i-(chars.length-1)/2)*step;let offset=(1-spread)*(i%2?430:-430);let y=340+(1-spread)*(i%3-1)*200;txt(chars[i],x+offset,y,78,i%2?white:cyan,'900','center')}
   rect(258,428,764*fade(.5,.94),4,pink);tag('LETTERS ARRIVE FROM OPPOSITE SIDES');break;
 }
 case 'M-019': {
   const s=[...'THE WAVE'];let amp=(1-fade(.22,1))*72;
   for(let i=0;i<s.length;i++)txt(s[i],278+i*87,350+Math.sin(i*.85-p*TAU*2.7)*amp,81,i%3?white:cyan,'900','center');
   edge(448,.65);tag('STAGGERED SPRING / SINE WAVE');break;
 }
 case 'M-020': {
   ctx.save();ctx.filter=`blur(${Math.round((1-e)*25)}px)`;ctx.globalAlpha=.3+.7*e;ctx.translate(640,350);let sc=1.23-.23*e;ctx.scale(sc,sc);hold('CRYSTAL CLEAR',0,0,79);ctx.restore();
   ring(640,351,263+70*(1-e),'#3e809575',2);tag('BLUR → FOCUS / PREMIUM TITLE');break;
 }
 case 'M-021': {
   const s='CIRCULAR MOTION';const a=-1.75+p*1.2,r=270;
   ctx.save();ctx.translate(cx,cy+35);for(let i=0;i<s.length;i++){let theta=a+(i-(s.length-1)/2)*.115;ctx.save();ctx.translate(Math.sin(theta)*r,-Math.cos(theta)*r);ctx.rotate(theta);txt(s[i],0,0,41,i%2?white:cyan,'800','center');ctx.restore()}ctx.restore();
   ring(cx,cy+35,185,'#3c7b9977',2);dot(cx,cy+35,10,pink);tag('TEXT FOLLOWING A CURVED PATH');break;
 }
 case 'M-022': {
   const q=ease((p-.04)/.24),s=q?1.29-.29*q:1.7;ctx.save();ctx.translate(cx,cy);ctx.scale(s,s);ctx.rotate((1-q)*-.055);rect(-295,-100,590,200,'#12364d',14);ctx.lineWidth=6;ctx.strokeStyle=cyan;ctx.strokeRect(-295,-100,590,200);txt('APPROVED',0,0,86,white,'900','center',4);ctx.restore();
   ring(cx,cy,180+230*q,`rgba(127,238,243,${.65*(1-q)})`,5);tag('STAMPPED ON A SINGLE HIT');break;
 }
 case 'M-023': {
   const flip=clamp(p*1.7),front=flip<.5;const sx=Math.max(.04,Math.abs(Math.cos(flip*Math.PI)));
   pane(290,212,700,254,.8);ctx.save();ctx.translate(cx,337);ctx.scale(sx,1);txt(front?'TODAY':'TOMORROW',0,0,93,front?white:cyan,'900','center',4);ctx.restore();
   tag('FLIP / CHANGE THE MESSAGE');break;
 }
 case 'M-024': {
   let s='MADE VISIBLE';ctx.font='900 93px Inter, Arial, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.strokeStyle=cyan;ctx.lineWidth=2;ctx.strokeText(s,cx,cy);
   ctx.save();ctx.beginPath();ctx.rect(0,220,1280*e,258);ctx.clip();hold(s,cx,cy,93);ctx.restore();rect(160,482,960*e,3,pink);tag('OUTLINE REVEALS SOLID FILL');break;
 }
 case 'M-025': {
   txt('FEATURES AT A GLANCE',222,195,28,white,'800','left',2);
   ['受注をまとめる','進捗を共有する','記録を残す','判断を早くする'].forEach((s,i)=>{let q=fade(i*.13,.45+i*.13);ctx.save();ctx.globalAlpha=q;pane(223+(1-q)*120,240+i*76,836,63,1,i%2?'#14263a':'#112e40');rect(249+(1-q)*120,260+i*76,21,21,cyan,5);txt(s,298+(1-q)*120,271+i*76,27,white,'650');txt(`0${i+1}`,1014+(1-q)*120,271+i*76,19,dim,'600','right');ctx.restore()});break;
 }
 case 'M-026': {
   txt('WORKFLOW',640,199,30,white,'850','center',4);const steps=['依頼','確認','承認','完了'];
   for(let i=0;i<4;i++){let x=250+i*260,a=fade(i*.17,.2+i*.17);if(i<3){line(x+52,348,x+260-52,348,'#25445a',13);line(x+52,348,x+52+(156*a),348,cyan,8)}ring(x,348,52,a?cyan:'#3a6581',5);if(a)dot(x,348,35,'#165a67');txt(a?'✓':String(i+1),x,348,35,a?white:dim,'800','center');txt(steps[i],x,447,22,a?white:dim,'700','center')}tag('EACH STEP CONFIRMS IN SEQUENCE');break;
 }
 case 'M-027': {
   pane(227,205,831,326,1,'#0b1929');let active=p<.48?0:p<.72?1:2;['受注','在庫','工程'].forEach((s,i)=>{const x=280+i*228;txt(s,x,253,25,i===active?white:dim,'780');rect(x-3,282,126,5,i===active?cyan:'#253d54',3)});
   let q=(p%(.48))/ .48;ctx.save();ctx.globalAlpha=.4+.6*fade(0,.3);txt(['新しい注文を確認','在庫数がすぐわかる','工程ごとの進捗を共有'][active],300,378,34,white,'760');for(let i=0;i<3;i++)rect(299,420+i*29,290+i*104,10,i===active?cyan:'#244b62',4);ctx.restore();tag('ACTIVE TAB CHANGES THE CONTENT');break;
 }
 case 'M-028': {
   const q=ease(p/.65);ctx.save();ctx.globalAlpha=q*.52;rect(0,0,W,H,'#000');ctx.restore();let w=180+600*q,h=110+250*q;
   pane(cx-w/2,cy-h/2,w,h);ctx.save();ctx.globalAlpha=fade(.22,.65);txt('PROJECT DETAILS',cx,cy-95*q,33,white,'800','center');for(let i=0;i<3;i++)rect(cx-270,cy-32+i*49,540-i*70,12,i===0?cyan:'#47708a',5);rect(cx+140,cy+92,130,42,'#2b8fa0',8);txt('保存',cx+204,cy+113,20,white,'760','center');ctx.restore();tag('SMALL CARD → FOCUSED DIALOG');break;
 }
 case 'M-029': {
   const q=ease((p-.15)/.5);txt('AUTOMATION',640,211,25,white,'800','center',4);rect(435,273,410,133,'#142b3f',67);rect(449,286,382*q,106,'#216b75',53);dot(503+268*q,339,43,q>.7?cyan:'#738da2');txt(q>.5?'ON':'OFF',638,464,70,q>.5?cyan:dim,'900','center');if(q>.48){ring(640,335,184*q,`rgba(124,237,247,${.6*(1-q)})`,3)}tag('ONE SWITCH / CONNECTED EFFECT');break;
 }
 case 'M-030': {
   txt('DRAG TO ORGANIZE',640,192,23,white,'750','center',3);pane(642,264,324,231,1,'#13273d');txt('DROP ZONE',804,380,22,dim,'800','center',2);
   let q=ease(p/.72);let x=245+518*q,y=345+29*Math.sin(p*Math.PI);ctx.save();ctx.translate(x,y);ctx.rotate((1-q)*-.18);rect(-119,-70,238,140,'#245c6d',15);txt('ITEM',0,0,35,white,'800','center');ctx.restore();if(q>.9)ring(804,380,140,'#6effd18a',4);tag('DRAG / SNAP TO TARGET');break;
 }
 case 'M-031': {
   let nodes=[[280,340],[610,220],[610,453],[982,340]];let edges=[[0,1],[0,2],[1,3],[2,3]];
   for(let j=0;j<edges.length;j++){let [a,b]=edges[j],n1=nodes[a],n2=nodes[b],q=fade(.14+j*.12,.37+j*.12);line(...n1,n1[0]+(n2[0]-n1[0])*q,n1[1]+(n2[1]-n1[1])*q,cyan,5)}
   nodes.forEach(([x,y],i)=>{let q=fade(i*.16,.2+i*.16);ctx.save();ctx.globalAlpha=q;rect(x-76,y-42,152,84,'#1d4358',14);txt(['受注','検査','手配','完了'][i],x,y,26,white,'760','center');ctx.restore()});tag('NODES + CONNECTORS BUILD A FLOW');break;
 }
 case 'M-032': {
   pane(145,230,300,244);pane(835,230,300,244);txt('SYSTEM A',295,327,34,white,'800','center');txt('SYSTEM B',985,327,34,white,'800','center');
   line(461,355,819,355,'#346982',4);for(let i=0;i<7;i++){let f=(p*1.6+i/7)%1;rect(454+360*f,346,20,19,i%2?cyan:pink,3)}if(p>.74){rect(876,405,218,37,'#255963',6);txt('✓ SYNCED',985,425,17,white,'800','center')}tag('INFORMATION MOVES BETWEEN SYSTEMS');break;
 }
 case 'M-033': {
   const x=200,y=223,w=880,h=298,q=ease(p);pane(x,y,w,h);ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();rect(x,y,w,h,'#2c3342');txt('BEFORE',x+200,308,32,'#b5bac4','800','center');for(let i=0;i<6;i++)rect(x+80,y+125+i*27,230,9,'#6d7480',3);rect(x+w*q,y,w*(1-q),h,'#0a1b28');ctx.save();ctx.beginPath();ctx.rect(x,y,w*q,h);ctx.clip();rect(x,y,w,h,'#143947');txt('AFTER',x+670,308,32,white,'800','center');for(let i=0;i<6;i++)rect(x+550,y+125+i*27,200,9,i<4?cyan:'#6390a2',3);ctx.restore();ctx.restore();line(x+w*q,y,x+w*q,y+h,white,7);dot(x+w*q,y+h/2,27,white);tag('MOVE THE DIVIDER / REVEAL THE IMPROVEMENT');break;
 }
 case 'M-034': {
   const l=['48h','12h','75%'];let shift=ease(p)*1.4;
   for(let i=0;i<3;i++){let angle=(i+shift)*TAU/3,x=cx+Math.sin(angle)*310,y=368+Math.cos(angle)*43,scale=.72+.28*(Math.cos(angle)+1)/2;ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);pane(-150,-108,300,216);txt(l[i],0,-18,59,i===1?cyan:white,'900','center');txt(['手作業','確認時間','作業改善'][i],0,61,19,dim,'750','center');ctx.restore()}tag('ONE KPI MOVES TO THE FRONT');break;
 }
 case 'M-035': {
   let q=ease(p);for(let i=0;i<17;i++){let x=(i-8)*150*(1+.7*q)+cx,y=415-(i%3)*78*(1+.8*q);rect(x-31,y-65,62,130+(i%3)*50,'#153b51');line(x-31,y-65,x+31,y-65,'#5bb7cd',2)}ctx.save();ctx.fillStyle='#091421';ctx.beginPath();ctx.arc(cx,cy,148,0,TAU);ctx.fill();ctx.restore();ring(cx,cy,148,cyan,6);hold('FOCUS',cx,cy,48);tag('FOREGROUND STAYS FIXED / BACKGROUND STRETCHES');break;
 }
 case 'M-036': {
   const a=.5+p*1.1;function iso(x,y,z=0){return [cx+(x-y)*Math.cos(a)*1.25,cy+110+(x+y)*.43-z*1.16]}
   function cube(x,y,z,w,h,d,c){let A=iso(x,y,z),B=iso(x+w,y,z),C=iso(x+w,y+h,z),D=iso(x,y+h,z),E=iso(x,y,z+d),F=iso(x+w,y,z+d),G=iso(x+w,y+h,z+d),H=iso(x,y+h,z+d);poly([A,B,F,E],'#8ddce4',c,2);poly([B,C,G,F],'#4e91ae','#1b5068',2);poly([E,F,G,H],'#b2f2ff','#2c728b',2)}
   cube(-100,-100,0,120,130,170);cube(55,-46,0,114,110,90);cube(-50,95,0,125,115,80);tag('ISOMETRIC FORMS / ORBIT-LIKE MOTION');break;
 }
 case 'M-037': {
   let move=ease(p)*560;for(let i=0;i<14;i++){let x=155+i*168-move,h=120+rnd(i+9)*240;rect(x,560-h,109,h,i%2?'#1f4a62':'#173247',7);line(x+8,560-h+14,x+98,560-h+14,cyan,2);for(let j=0;j<3;j++)rect(x+17,560-h+45+j*48,17,14,'#6abed04d',2)}hold('PAN  →',640,250,74);tag('VIRTUAL CAMERA MOVES ACROSS THE SCENE');break;
 }
 case 'M-038': {
   let q=ease(p),horizon=540-250*q;for(let i=0;i<16;i++){let y=horizon+i*i*2.6;line(0,y,W,y,'#3c7e99',1)}for(let i=-8;i<=8;i++)line(cx,horizon,cx+i*200,H,'#286c87',2);rect(405,100+220*(1-q),470,130,'#17394b',12);ctx.save();ctx.globalAlpha=q;hold('LOOK UP',640,228,75);ctx.restore();tag('TILT REVEALS THE HORIZON');break;
 }
 case 'M-039': {
   let q=fade(.2,.8);ctx.save();ctx.filter=`blur(${Math.round(q*16)}px)`;rect(235,234,410,290,'#2c5770',13);txt('BACKGROUND',440,370,26,white,'700','center');ctx.restore();ctx.save();ctx.filter=`blur(${Math.round((1-q)*18)}px)`;rect(570,251,440,266,'#21586c',13);txt('SUBJECT',790,382,42,white,'850','center');ctx.restore();tag('SHIFT ATTENTION FROM BACKGROUND TO SUBJECT');break;
 }
 case 'M-040': {
   let q=ease(p);for(let i=0;i<17;i++){let x=(i*178-p*720+190)%1440;if(x<0)x+=1440;rect(x-20,430-rnd(i+5)*130,95,220,'#194359',8);line(x,475,x+75,475,'#5d94ad',2)}
   let bx=430+410*q,by=350-60*Math.sin(p*TAU);ctx.save();ctx.translate(bx,by);ctx.rotate(.2*Math.sin(p*TAU));rect(-90,-47,180,94,'#347c8a',16);txt('→',0,2,58,white,'850','center');ctx.restore();tag('FOLLOW THE MOVING SUBJECT');break;
 }
 case 'M-041': {
   txt('SCENE 01',cx,cy,103,white,'900','center');ctx.save();ctx.beginPath();ctx.arc(cx,cy,860*e,0,TAU);ctx.clip();rect(0,0,W,H,'#16758a');txt('SCENE 02',cx,cy,103,'#f1ffff','900','center');ctx.restore();tag('CIRCULAR REVEAL WIPE');break;
 }
 case 'M-042': {
   hold('FIRST SCENE');ctx.save();let x=-1800+2950*ease(p);ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+440,0);ctx.lineTo(x+850,H);ctx.lineTo(x+410,H);ctx.closePath();ctx.fillStyle='#8aecf3';ctx.fill();ctx.restore();ctx.save();ctx.beginPath();ctx.rect(0,0,clamp(p*1.55)*W,H);ctx.clip();hold('NEXT SCENE',cx,cy,82);ctx.restore();tag('DIAGONAL MASK SWEEPS THROUGH');break;
 }
 case 'M-043': {
   const q=ease(p);ctx.save();ctx.fillStyle='#2b91a3';for(let i=0;i<22;i++){let a=i*2.39996,xx=cx+Math.cos(a)*rnd(i+5)*270*q,yy=cy+Math.sin(a)*rnd(i+8)*190*q;dot(xx,yy,14+90*q*(.5+rnd(i)),'#247e93')}ctx.restore();ctx.save();ctx.globalAlpha=q;rect(330,288,620,105,'#0b2330d9',14);txt('INK REVEAL',cx,cy,82,white,'900','center');ctx.restore();tag('ORGANIC BLOBS EXPAND & CONNECT');break;
 }
 case 'M-044': {
   const x=Math.cos(p*Math.PI),scale=Math.max(.02,Math.abs(x));ctx.save();ctx.translate(cx,cy);ctx.scale(scale,1);rect(-416,-250,832,500,p<.5?'#153f54':'#346e7d',20);txt(p<.5?'SIDE A':'SIDE B',0,0,101,white,'900','center');ctx.restore();tag('THE FULL SCREEN PANEL TURNS OVER');break;
 }
 case 'M-045': {
   let cols=18,rows=10,w=W/cols,h=H/rows;rect(0,0,W,H,'#215873');hold('NEW SCENE');for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){let d=(x+y*.28)/(cols+rows*.28),vis=1-smooth((p-d*.45)/.42);if(vis<=0)continue;ctx.save();ctx.globalAlpha=vis;rect(x*w,y*h,w+1,h+1,'#0b1725');ctx.restore()}
   tag('TILES DISSOLVE IN A WAVE');break;
 }
 case 'M-046': {
   let q=p<.5?ease(p*2):1-ease((p-.5)*2);let h=H*q;for(let i=0;i<8;i++){const yy=i*H/8;rect(0,yy,W,q*H/8,'#1d7180');line(0,yy+q*H/8,W,yy+q*H/8,cyan,1)}ctx.save();ctx.globalAlpha=1-q;hold(p>.5?'REVEALED':'READY');ctx.restore();tag('EIGHT SHUTTER BLADES COVER AND RELEASE');break;
 }
 case 'M-047': {
   let flash=Math.max(0,1-Math.abs(p-.39)/.17);hold(p<.48?'THE HIT':'AFTER THE HIT',cx,cy,83);ctx.save();ctx.globalAlpha=flash*.95;rect(0,0,W,H,'#fff');ctx.restore();ring(cx,cy,90+400*e,`rgba(150,244,255,${(1-e)*.8})`,6);tag('BRIEF FLASH / NO CONTINUOUS STROBING');break;
 }
 case 'M-048': {
   let pts=[];const sides=p<.35?36:p<.7?4:3;const a=p*TAU/10,r=170;for(let i=0;i<sides;i++){let th=i*TAU/sides-Math.PI/2+a;pts.push([cx+Math.cos(th)*r,cy+Math.sin(th)*r])}poly(pts,cyan,'#2f6b8188',7);ring(cx,cy,230,'#32758b77',2);tag('CIRCLE → SQUARE → TRIANGLE');break;
 }
 case 'M-049': {
   const q=ease(p);ctx.save();ctx.shadowColor=cyan;ctx.shadowBlur=26;ctx.strokeStyle=cyan;ctx.lineWidth=9;ctx.beginPath();ctx.arc(cx,cy,195,-Math.PI/2,-Math.PI/2+TAU*q);ctx.stroke();ctx.restore();if(q>.9){hold('NEON',cx,cy,88)}else txt('TRACING',cx,cy,36,dim,'750','center',4);tag('ONE-STROKE OUTLINE WITH SOFT GLOW');break;
 }
 case 'M-050': {
   const q=ease(p),height=330*q;ctx.save();ctx.globalAlpha=.2;for(let i=0;i<15;i++)line(390+i*36,170,390+i*36,525,cyan,1);for(let i=0;i<10;i++)line(375,196+i*35,906,196+i*35,cyan,1);ctx.restore();ctx.save();ctx.beginPath();ctx.rect(380,525-height,540,height);ctx.clip();rect(455,237,369,245,'#2a677a55',16);ctx.strokeStyle='#8ff5fa';ctx.lineWidth=4;ctx.strokeRect(455,237,369,245);hold('HOLO',cx,352,88);ctx.restore();line(380,525-height,915,525-height,white,4);tag('SCANNING LINES BUILD A HOLOGRAM');break;
 }
 case 'M-051': {
   for(let i=0;i<5;i++){let a=p*TAU*(.24+i*.035)+i*TAU/5,x=cx+Math.sin(a)*300,y=cy+Math.cos(a*1.2)*160;glow(x,y,220,i%2?'rgba(234,93,170,.24)':'rgba(76,213,229,.27)')}
   txt('FLUID',640,326,116,white,'900','center',6);txt('FLOW STATE',640,439,22,dim,'680','center',5);break;
 }
 case 'M-052': {
   let q=ease(p);for(let i=0;i<160;i++){let a=i*2.39996,r=45+220*rnd(i+9),sx=cx+Math.cos(a)*(320+r),sy=cy+Math.sin(a)*(140+r),tx=cx+Math.cos(a)*90,ty=cy+Math.sin(a)*90;dot(lerp(sx,tx,q),lerp(sy,ty,q),1.5+3*rnd(i+3),i%6?cyan:pink)}
   ctx.save();ctx.globalAlpha=fade(.64,.9);hold('IDEA',cx,cy,91);ctx.restore();tag('SCATTERED DOTS CONVERGE ON TARGET');break;
 }
 case 'M-053': {
   for(let i=0;i<60;i++){let a=i*2.39996+e*.7,r=(5+850*e)*rnd(i+13),x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;let len=20+220*e;line(x,y,x+Math.cos(a)*len,y+Math.sin(a)*len,i%5?cyan:pink,1+rnd(i)*3)}
   hold('WARP',cx,cy,103);tag('STREAKS STRETCH FROM VANISHING POINT');break;
 }
 case 'M-054': {
   for(let i=0;i<5;i++){let q=(p+i*.19)%1,r=30+400*q;ring(cx,cy,r,`rgba(120,237,245,${(1-q)*.75})`,Math.max(1,8*(1-q)))}glow(cx,cy,160,'rgba(101,241,249,.17)');hold('ENERGY',cx,cy,80);tag('MULTIPLE RINGS EXPAND & FADE');break;
 }
 case 'M-055': {
   let open=Math.sin(p*Math.PI);for(let i=0;i<40;i++){let a=i*2.39996,rad=35+Math.sqrt(i)*15,x=cx+Math.cos(a)*rad*open*3,y=cy+Math.sin(a)*rad*open*2.5;ctx.save();ctx.translate(x,y);ctx.rotate(a+p*4);rect(-10,-9,20,18,i%4?cyan:pink,2);ctx.restore()}ctx.save();ctx.globalAlpha=Math.abs(Math.cos(p*Math.PI));hold(p<.5?'FORM':'REBORN',cx,cy,84);ctx.restore();tag('SHATTER → REASSEMBLE');break;
 }
 case 'M-056': {
   for(let i=0;i<32;i++){let r=rnd(i+4),f=(p*(1+r)*1.8+rnd(i+15))%1,x=f*1600-200,y=(i*79)%950-100;ctx.save();ctx.globalAlpha=.2+.7*(1-f);line(x,y,x-140-r*190,y+80+r*140,i%4?pink:cyan,2+r*4);dot(x,y,2+r*3,white);ctx.restore()}hold('FULL SPEED',cx,cy,78);tag('METEOR TRAILS / MULTI-SPEED LAYERS');break;
 }
 case 'M-057': {
   let f=(p*4)%1,impact=Math.exp(-f*11);ring(cx,cy,150+55*impact,cyan,6+9*impact);dot(cx,cy,80+47*impact,pink);hold('BEAT',cx,cy,45);for(let i=0;i<4;i++)rect(460+i*96,528,68,11,i<=Math.floor(p*4)?cyan:'#2b526d',5);tag('4/4 BEATS / 120 BPM DEMO');break;
 }
 case 'M-058': {
   let bass=Math.pow(Math.max(0,Math.sin(p*TAU*4)),8);let r=130+100*bass;glow(cx,cy,180+bass*100,'rgba(252,88,153,.26)');ctx.save();ctx.translate(cx,cy);ctx.scale(1+.25*bass,1-.13*bass);poly([[-130,-87],[120,-68],[155,0],[120,68],[-130,87],[-155,0]],pink,'#582d5666',7);txt('BASS',0,0,67,white,'900','center',3);ctx.restore();ring(cx,cy,r,`rgba(255,130,178,${.2+.7*bass})`,5);tag('TIMECODED LOW-FREQUENCY PULSE');break;
 }
 case 'M-059': {
   for(let i=0;i<44;i++){let x=175+i*22;let val=Math.abs(Math.sin(i*.7+p*TAU*5))*.6+Math.abs(Math.cos(i*.29-p*TAU*3))*.4;let h=30+250*Math.pow(val,1.5);rect(x,cy-h/2,13,h,i%5?cyan:pink,4)}line(160,cy,1120,cy,'#a7edf266',2);tag('SIMULATED AUDIO SPECTRUM BARS');break;
 }
 case 'M-060': {
   let hit=Math.exp(-Math.pow((p-.39)/.09,2)),q=fade(.36,.6);ctx.save();ctx.globalAlpha=hit*.8;rect(0,0,W,H,'#efffff');ctx.restore();ring(cx,cy,80+470*q,`rgba(250,158,118,${(1-q)*.9})`,10);ctx.save();ctx.translate(cx,cy);ctx.scale(.7+q*.3,.7+q*.3);txt('VS',0,0,140,white,'900','center',5);ctx.restore();for(let i=0;i<18;i++){let a=i*TAU/18;line(cx+Math.cos(a)*150,cy+Math.sin(a)*150,cx+Math.cos(a)*(170+150*q),cy+Math.sin(a)*(170+150*q),i%3?cyan:pink,3)}tag('HIT SOUND + FLASH + RING / SAME FRAME');break;
 }
 default:{hold('MOTION '+m.id);break}
 }
}


return (id,progress)=>{const index=data.motions.findIndex(m=>m.id===id);if(index<0)throw Error('Unknown motion ID');const m=data.motions[index],u=clamp(progress),t=u*2;ctx.clearRect(0,0,W,H);bg(t,index);scene(m,u,t,index);frame(index,id,m.en,t);};
}
