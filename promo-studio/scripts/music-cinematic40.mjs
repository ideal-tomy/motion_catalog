import fs from 'node:fs';
const SR=48000,SECONDS=40,BPM=156,TOTAL=SR*SECONDS,BEAT=60/BPM;
const left=new Float32Array(TOTAL),right=new Float32Array(TOTAL);
let seed=0x4d4f5449;
const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296*2-1;};
const add=(start,duration,fn,gain=1,pan=0)=>{const from=Math.max(0,Math.floor(start*SR)),count=Math.min(TOTAL-from,Math.ceil(duration*SR));if(count<=0)return;const l=Math.sqrt((1-pan)/2),r=Math.sqrt((1+pan)/2);for(let i=0;i<count;i++){const v=fn(i/SR,i)*gain;left[from+i]+=v*l;right[from+i]+=v*r;}};
const envelope=(t,attack,decay)=>Math.min(1,t/attack)*Math.exp(-t/decay);
function kick(t,gain=.72){add(t,.42,(s)=>{const hz=43+92*Math.exp(-s*25);return Math.sin(2*Math.PI*hz*s)*Math.exp(-s*10)+random()*.08*Math.exp(-s*85);},gain);}
function snare(t,gain=.43){let low=0;add(t,.3,(s)=>{const n=random();low+=.16*(n-low);return ((n-low)*.85+Math.sin(2*Math.PI*190*s)*.34)*Math.exp(-s*18);},gain,.08);}
function cymbal(t,gain=.16,duration=.55){let low=0;add(t,duration,(s)=>{const n=random();low+=.025*(n-low);return (n-low)*envelope(s,.001,.16);},gain,.35);}
function bass(t,hz,d=.32,g=.24,pan=0){add(t,d,(s)=>{const wave=Math.sin(2*Math.PI*hz*s)+.35*Math.sin(4*Math.PI*hz*s)+.14*Math.sin(6*Math.PI*hz*s);return Math.tanh(wave*1.5)*envelope(s,.006,.17);},g,pan);}
function guitar(t,hz,d=.48,g=.13,pan=0){add(t,d,(s)=>{const fade=envelope(s,.009,.23),phase=2*Math.PI*hz*s;const grit=Math.sin(phase)+.62*Math.sin(phase*1.498)+.44*Math.sin(phase*2.006)+.19*Math.sin(phase*3.01);return Math.tanh(grit*2.1)*fade;},g,pan);}
function chord(t,root,d=.72,g=.19){for(const [ratio,amp,pan] of [[1,1,-.72],[1.5,.79,.72],[2,.48,-.35]]){guitar(t,root*ratio,d,g*amp,pan);guitar(t+.008,root*ratio*1.004,d,g*amp*.55,-pan);}}
const roots=[82.4069,73.4162,65.4064,61.7354,82.4069,73.4162,98,87.3071];
// A new 156 BPM cue: muted pulse opens into a wide, original synthesized rock drive.
for(let beat=0;beat<Math.ceil(SECONDS/BEAT);beat++){
 const t=beat*BEAT;if(t>=SECONDS)break;const bar=Math.floor(beat/4),root=roots[bar%roots.length],opening=t<3,ending=t>=35;
 if(beat%4===0||beat%4===2||ending&&beat%2===0)kick(t,opening?.28:ending?.62:.72);
 if(beat%4===1||beat%4===3)snare(t,opening?.08:ending?.34:.46);
 cymbal(t,opening?.035:ending?.105:.14,ending?.8:.55);
 bass(t,root/2,.34,opening?.12:ending?.27:.3,(beat%2)*.22-.11);
 if(beat%2===0){const chordRoot=root*(beat%4===2?1.5:1);chord(t,chordRoot,opening?.33:ending?.72:.58,opening?.045:ending?.2:.17);}
 for(let sub=1;sub<4;sub+=2){const st=t+sub*BEAT/4;if(st<SECONDS)cymbal(st,opening?.018:.052,.12);}
}
// Rising tom-like fills at cut points, then a resolved power-chord tail.
const cuts=[3,7,11,15,19,23,27,31,35];
for(let k=0;k<cuts.length;k++){const t=cuts[k],base=roots[Math.floor(t/BEAT/4)%roots.length];for(let j=0;j<4;j++){const st=t-.23+j*.055;add(st,.2,(s)=>{const hz=100+j*27-30*s;return Math.sin(2*Math.PI*hz*s)*Math.exp(-s*13)+random()*.17*Math.exp(-s*45);},.13+j*.035,j%2?.3:-.2);}chord(Math.max(0,t-.045),base*2,.48,.2);}
for(let n=0;n<28;n++){const t=35+n*.18;const x=(n*7)%28;const a=2*Math.PI*random();add(t,.55,(s)=>Math.sin(2*Math.PI*(600+x*30)*s+a)*Math.exp(-s*3),.025,(n%2)*.7-.35);}
chord(36.2,82.4069,3.45,.2);chord(38.65,82.4069,1.3,.28);
let peak=0,energy=0;
for(let i=0;i<TOTAL;i++){const t=i/SR,fade=Math.min(1,t/.02,(SECONDS-t)/.42),l=Math.tanh((left[i]+(i>1830?right[i-1830]*.055:0))*1.08)*fade,r=Math.tanh((right[i]+(i>2370?left[i-2370]*.055:0))*1.08)*fade;left[i]=l;right[i]=r;peak=Math.max(peak,Math.abs(l),Math.abs(r));energy+=l*l+r*r;}
const norm=.87/peak,buffer=Buffer.alloc(44+TOTAL*4);buffer.write('RIFF');buffer.writeUInt32LE(36+TOTAL*4,4);buffer.write('WAVEfmt ',8);buffer.writeUInt32LE(16,16);buffer.writeUInt16LE(1,20);buffer.writeUInt16LE(2,22);buffer.writeUInt32LE(SR,24);buffer.writeUInt32LE(SR*4,28);buffer.writeUInt16LE(4,32);buffer.writeUInt16LE(16,34);buffer.write('data',36);buffer.writeUInt32LE(TOTAL*4,40);
for(let i=0;i<TOTAL;i++){buffer.writeInt16LE(Math.round(left[i]*norm*32767),44+i*4);buffer.writeInt16LE(Math.round(right[i]*norm*32767),46+i*4);}
fs.mkdirSync('public/audio',{recursive:true});fs.writeFileSync('public/audio/tournament-cinematic-40-original.wav',buffer);
const report={durationSeconds:SECONDS,bpm:BPM,channels:2,sampleRate:SR,peakDB:20*Math.log10(.87),rmsDB:20*Math.log10(Math.sqrt(energy/(TOTAL*2))),music:'new original synthesized cinematic-rock score',recordedSamples:'none',cutCuesSeconds:cuts,seed:'MOTION-ATLAS-CINEMATIC-40'};
fs.writeFileSync('jobs/tournament-cinematic-pv-40-20261114/music-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
