import fs from 'node:fs';
// Original instrumental: seeded Karplus-Strong strings, synthesized drums,
// oscillators, and amp/cabinet shaping. No recordings or external samples.
const SR=48000,DURATION=22,N=SR*DURATION,BPM=180,beat=60/BPM;
const isDd=process.argv[2]==='dd',rootFrequency=isDd?73.4162:82.4069;
const left=new Float32Array(N),right=new Float32Array(N);
let seed=isDd?12112027:12112026;
const rand=()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/2147483648-1;};
const add=(start,duration,fn,gain=1,pan=0)=>{const at=Math.round(start*SR),count=Math.min(Math.round(duration*SR),N-at),lg=Math.sqrt((1-pan)/2),rg=Math.sqrt((1+pan)/2);for(let i=0;i<count;i++){const v=fn(i/SR,i)*gain;left[at+i]+=v*lg;right[at+i]+=v*rg;}};
function string(frequency,start,duration,gain,pan,muted){
  const len=Math.round(SR/frequency),buffer=new Float32Array(len);for(let i=0;i<len;i++)buffer[i]=rand();let cursor=0,low=0,previous=0;
  add(start,duration,(t)=>{
    const v=buffer[cursor];const next=buffer[(cursor+1)%len];buffer[cursor]=(v+next)*.5*(muted?.982:.9968);cursor=(cursor+1)%len;
    const amp=Math.tanh((v+previous*.25)*10);previous=v;
    low+=.28*(amp-low);
    const env=Math.min(1,t*650)*Math.exp(-t*(muted?17:2.8));
    return low*env;
  },gain,pan);
}
function chord(start,root,duration=.28,gain=.23,muted=true){for(const [ratio,g] of [[1,1],[1.5,.7],[2,.55]]){string(root*ratio*.997,start,duration,gain*g,-.78,muted);string(root*ratio*1.003,start+.005,duration,gain*g,.78,muted);}}
const riff=isDd?[0,0,7,0,3,0,10,7,0,5,3,0]:[0,0,0,3,0,0,5,3,0,0,7,5];
for(let half=0;half<132;half++){
  const t=half*beat/2;if(t>=21.3)break;
  const semitone=riff[half%riff.length],root=rootFrequency*Math.pow(2,semitone/12);
  const accent=half%12===0||half%12===6;
  chord(t,root,accent?.42:.23,accent?.29:.2,!accent);
  if(half%2===0)add(t,.29,(s)=>{const freq=root/2;return (Math.sin(2*Math.PI*freq*s)+.2*Math.tanh(Math.sin(2*Math.PI*freq*s)*4))*Math.exp(-s*9)*Math.min(1,s*500);},.24);
}
for(let b=0;b<66;b++){
  const t=b*beat;
  // Four-on-the-beat drive with snare backbeats; cuts every six beats.
  if(b%4===0||b%4===2||b%12===11)add(t,.3,s=>Math.sin(2*Math.PI*(45*s+2.7*(1-Math.exp(-s*35))))*Math.exp(-s*18)+rand()*Math.exp(-s*220)*.12,.56);
  if(b%2===1){let low=0;add(t,.2,s=>{const r=rand();low+=.22*(r-low);return ((r-low)*.8+Math.sin(2*Math.PI*185*s)*.35)*Math.exp(-s*23);},.43);}
  for(let sub=0;sub<2;sub++){let low=0;add(t+sub*beat/2,.07,s=>{const r=rand();low+=.16*(r-low);return (r-low)*Math.exp(-s*70);},sub?.065:.09,sub?.35:-.25);}
  if(b>=59&&b<64){let low=0;add(t+beat*.75,.12,s=>{const r=rand();low+=.35*(r-low);return (r-low+Math.sin(2*Math.PI*135*s)*.3)*Math.exp(-s*24);},.23);}
}
for(let cut=0;cut<10;cut++){
  const t=cut*2;let low=0;
  add(t,1.1,s=>{const r=rand();low+=.09*(r-low);return ((r-low)*.6+Math.sin(2*Math.PI*7800*s)*.08)*Math.exp(-s*5);},.22,-.2);
  add(t,.35,s=>Math.sin(2*Math.PI*(52*s+1.5*(1-Math.exp(-s*20))))*Math.exp(-s*15),.25);
}
// A held final power chord under the readable four-second closing shot.
chord(18,rootFrequency,3.7,.23,false);
chord(21,rootFrequency,1,.32,false);
let peak=0,energy=0;
for(let i=0;i<N;i++){
  const t=i/SR,fade=Math.min(1,t/.006,(DURATION-t)/.3),duck=1-.1*Math.exp(-((t%beat)*35));
  // Soft bus saturation and a short cross-channel room reflection.
  const l=left[i]+(i>1511?right[i-1511]*.065:0),r=right[i]+(i>2017?left[i-2017]*.065:0);
  left[i]=Math.tanh(l*1.25)*fade*duck;right[i]=Math.tanh(r*1.25)*fade*duck;
  peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));
}
const norm=.86/peak,out=Buffer.alloc(44+N*4);
out.write('RIFF');out.writeUInt32LE(36+N*4,4);out.write('WAVEfmt ',8);out.writeUInt32LE(16,16);out.writeUInt16LE(1,20);out.writeUInt16LE(2,22);out.writeUInt32LE(SR,24);out.writeUInt32LE(SR*4,28);out.writeUInt16LE(4,32);out.writeUInt16LE(16,34);out.write('data',36);out.writeUInt32LE(N*4,40);
for(let i=0;i<N;i++){const l=left[i]*norm,r=right[i]*norm;out.writeInt16LE(Math.round(l*32767),44+i*4);out.writeInt16LE(Math.round(r*32767),46+i*4);energy+=l*l+r*r;}
fs.mkdirSync('public/audio',{recursive:true});fs.writeFileSync(`public/audio/${isDd?'dd':'tournament'}-rock-original.wav`,out);
const report={durationSeconds:DURATION,bpm:BPM,channels:2,sampleRate:SR,peakDB:20*Math.log10(.86),rmsDB:20*Math.log10(Math.sqrt(energy/(N*2))),music:'original procedurally composed instrumental rock',samples:'none',cutCuesSeconds:Array.from({length:10},(_,i)=>i*2)};
fs.writeFileSync(`jobs/${isDd?'dd':'tournament'}-rock-20261112/music-report.json`,JSON.stringify({...report,rootFrequency,arrangement:isDd?'DD / drop-D forensic riff':'Tournament / E rock'},null,2));console.log(JSON.stringify(report));
