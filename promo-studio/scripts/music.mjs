import fs from 'node:fs';
// Original 120 BPM arrangement. Oscillators and seeded noise only; no samples.
const sr=48000,seconds=20,n=sr*seconds,data=new Float32Array(n);
let seed=20261112;const noise=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/2147483648-1;};
function add(start,duration,fn,gain=1){for(let i=0;i<duration*sr&&start*sr+i<n;i++){const t=i/sr;data[Math.round(start*sr)+i]+=fn(t)*gain;}}
const notes=[110,130.8128,164.8138,146.8324];
for(let beat=0;beat<40;beat++){
  const at=beat*.5,root=notes[Math.floor(beat/8)%4];
  add(at,.32,t=>Math.sin(2*Math.PI*(48*t+5*(1-Math.exp(-t*30))))*Math.exp(-t*17),.33);
  if(beat%2)add(at,.16,t=>noise()*Math.exp(-t*34),.13);
  for(let h=0;h<2;h++)add(at+h*.25,.045,t=>(noise()*.6+Math.sin(2*Math.PI*9000*t)*.4)*Math.exp(-t*100),.025);
  add(at,.4,t=>(Math.sin(2*Math.PI*root*t)+.2*Math.sin(2*Math.PI*root*2*t))*Math.exp(-t*7)*Math.min(1,t*90),.13);
  const arp=[1,1.5,2,2.5][beat%4];
  add(at+.25,.4,t=>(Math.sin(2*Math.PI*root*arp*2*t)+.2*Math.sin(2*Math.PI*root*arp*4*t))*Math.exp(-t*9)*Math.min(1,t*120),.055);
}
for(const at of [3,7,10,13,17])add(at,.7,t=>(Math.sin(2*Math.PI*(90*t+1.8*(1-Math.exp(-t*15))))+noise()*.25)*Math.exp(-t*8),.14);
let peak=0;for(let i=0;i<n;i++){const t=i/sr;data[i]*=Math.min(1,t/.25,(20-t)/.8);peak=Math.max(peak,Math.abs(data[i]));}
const output=Buffer.alloc(44+n*4);output.write('RIFF');output.writeUInt32LE(36+n*4,4);output.write('WAVEfmt ',8);output.writeUInt32LE(16,16);output.writeUInt16LE(1,20);output.writeUInt16LE(2,22);output.writeUInt32LE(sr,24);output.writeUInt32LE(sr*4,28);output.writeUInt16LE(4,32);output.writeUInt16LE(16,34);output.write('data',36);output.writeUInt32LE(n*4,40);
for(let i=0;i<n;i++){const v=Math.round(data[i]/Math.max(1,peak/0.85)*32767);output.writeInt16LE(v,44+i*4);output.writeInt16LE(v,46+i*4);}
fs.mkdirSync('public/audio',{recursive:true});fs.writeFileSync('public/audio/promo-original.wav',output);console.log(JSON.stringify({seconds,sampleRate:sr,channels:2,peak,original:true}));
