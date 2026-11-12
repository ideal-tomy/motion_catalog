import fs from 'node:fs';
const sr=48000,seconds=20,n=sr*seconds,left=new Float32Array(n),right=new Float32Array(n);
function add(at,duration,fn,gain,pan=0){for(let i=0;i<duration*sr&&Math.round(at*sr)+i<n;i++){const t=i/sr,j=Math.round(at*sr)+i,v=fn(t)*gain;left[j]+=v*(1-pan*.3);right[j]+=v*(1+pan*.3);}}
const chords=[[146.8324,184.9972,220,277.1826],[123.4708,146.8324,184.9972,220],[97.9989,123.4708,146.8324,184.9972]];
for(const [c,at]of [[0,0],[1,7],[2,14]]){
 const chord=chords[c];
 for(const [i,hz]of chord.entries()){
  add(at,Math.min(8.5,20-at),t=>{const env=Math.min(1,t/1.2)*Math.min(1,(Math.min(8.5,20-at)-t)/1.8);return env*(Math.sin(2*Math.PI*hz*t)*.8+Math.sin(2*Math.PI*hz*2*t)*.12)},.038,(i-1.5)/2);
 }
 for(let note=0;note<6;note++){
  const atNote=at+.35+note*.88;if(atNote>18.5)continue;const hz=chord[note%4]*2;
  add(atNote,3.2,t=>Math.min(1,t/.012)*(Math.sin(2*Math.PI*hz*t)*Math.exp(-t*1.7)+.24*Math.sin(2*Math.PI*hz*2.002*t)*Math.exp(-t*3.4)+.07*Math.sin(2*Math.PI*hz*3*t)*Math.exp(-t*5.8)),.075,(note%3-1)*.5);
 }
}
let peak=0;for(let i=0;i<n;i++){const gain=Math.min(1,i/sr/.3,(20-i/sr)/1.8);left[i]*=gain;right[i]*=gain;peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));}
const scale=.42/peak,buf=Buffer.alloc(44+n*4);buf.write('RIFF');buf.writeUInt32LE(36+n*4,4);buf.write('WAVEfmt ',8);buf.writeUInt32LE(16,16);buf.writeUInt16LE(1,20);buf.writeUInt16LE(2,22);buf.writeUInt32LE(sr,24);buf.writeUInt32LE(sr*4,28);buf.writeUInt16LE(4,32);buf.writeUInt16LE(16,34);buf.write('data',36);buf.writeUInt32LE(n*4,40);
for(let i=0;i<n;i++){buf.writeInt16LE(Math.round(left[i]*scale*32767),44+i*4);buf.writeInt16LE(Math.round(right[i]*scale*32767),46+i*4);}
fs.writeFileSync('public/audio/dd-premium-original.wav',buf);
const report={seconds,sampleRate:sr,channels:2,peakDB:20*Math.log10(.42),style:'Original gentle piano-like partials and sustained warm pad. No percussion.',source:'Synthesized sine partials. No third-party recordings or external API.'};fs.writeFileSync('jobs/dd-premium-20261112/music-report.json',JSON.stringify(report,null,2));console.log(report);
