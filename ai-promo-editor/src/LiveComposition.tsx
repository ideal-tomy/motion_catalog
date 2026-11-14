import React from 'react';
import {MediaBaseContext,useMediaBase,projectMedia} from './MediaEnvironment';
import {evaluateAnimations,logicalRect,inverseBoundary,aabb,identity,type Rect} from './animations';
import {AnimationSurface,AnimationText} from './AnimationView';
import {AbsoluteFill,Audio,Img,Sequence,Video,useCurrentFrame} from 'remotion';
import type {Project,Scene,Layer,Motion} from './core';
import {sceneStarts} from './core';
import {cellBounds,maskClip} from './geometry';
import {AnimatedText,MotionFrame,MotionOverlay} from './MotionFrame';
import {isContentMotion,characterMotionIds} from './motion-engine';
const CellGuides:React.FC<{scene:Scene;palette:Record<string,string>;editing:boolean}>=({scene,palette,editing})=>{
 if(!editing||['single','free'].includes(scene.layout.type))return null;
 return <AbsoluteFill style={{display:'grid',gridTemplateColumns:scene.layout.type==='grid4'?'1fr 1fr':scene.layout.direction==='horizontal'?`${scene.layout.splitRatio}fr ${1-scene.layout.splitRatio}fr`:'1fr',gridTemplateRows:scene.layout.type==='grid4'?'1fr 1fr':scene.layout.direction==='vertical'?`${scene.layout.splitRatio}fr ${1-scene.layout.splitRatio}fr`:'1fr',gap:10,padding:10}}>{Array.from({length:scene.layout.cells},(_,i)=><div key={i} style={{background:palette.surface,border:`1px solid ${palette.mutedText}33`,display:'grid',placeItems:'center',color:palette.mutedText,fontSize:26}}>{scene.layers.some(l=>l.visible&&(l.style?.cellIndex??0)===i)?null:`セル ${i+1} / 未割当`}</div>)}</AbsoluteFill>;
};
function paced(m:Motion,scene:Scene,frame:number){if(m.motionId!=='M-012')return m;const p=frame/scene.durationFrames,keys=scene.paceKeyframes;let a=keys[0],b=keys.at(-1)!;for(let i=1;i<keys.length;i++)if(p<=keys[i].position){a=keys[i-1];b=keys[i];break;}const q=Math.max(0,Math.min(1,(p-a.position)/(b.position-a.position||1)));return {...m,params:{...m.params,strength:.4+(a.intensity+(b.intensity-a.intensity)*q)/100}};}
function groupRect(s:Scene,l:Layer,p:Project):Rect{
 const root=logicalRect(s,l,p),members=[l,...s.layers.filter(v=>v.style?.parentFrameId===l.layerId)];
 if(members.length===1&&!['card','browser'].includes(String(l.style?.frame)))return root;
 const boxes=members.map(v=>{const r=aabb(logicalRect(s,v,p)),pad=['card','browser'].includes(String(v.style?.frame))?100:0;return {x:r.x-pad,y:r.y-pad,w:r.w+2*pad,h:r.h+2*pad};}),cx=root.x+root.w/2,cy=root.y+root.h/2;
 const rx=Math.max(...boxes.flatMap(r=>[Math.abs(r.x-cx),Math.abs(r.x+r.w-cx)])),ry=Math.max(...boxes.flatMap(r=>[Math.abs(r.y-cy),Math.abs(r.y+r.h-cy)]));
 return {x:cx-rx,y:cy-ry,w:rx*2,h:ry*2};
}
type LayerProps={layer:Layer;scene:Scene;project:Project;editing?:boolean;sceneFrame:number;index:number;count:number};
const LayerView:React.FC<LayerProps>=({layer:l,scene,project,editing=false,sceneFrame,index,count})=>{
 const mediaBase=useMediaBase();
 const frame=useCurrentFrame(),palette={...project.theme.palette,...scene.colorOverrides},{width:W,height:H}=project.video;
 const cell=l.style?.cellIndex??0;
 if(!l.visible||scene.layout.type!=='free'&&cell>=scene.layout.cells||scene.unplacedLayerIds.includes(l.layerId))return null;
 const b=cellBounds(scene,cell),t=l.transform,w=t.width*b.w*W,h=t.height*b.h*H;
 const canvas={x:0,y:0,w:W,h:H},rect=logicalRect(scene,l,project),items=editing?[]:l.animations??[];
 const sceneDelta=evaluateAnimations(editing?[]:scene.animations??[],sceneFrame,canvas,canvas);
 const sceneCanvas=inverseBoundary(canvas,{x:W/2,y:H/2},sceneDelta);
 const parent=scene.layers.find(v=>v.layerId===l.style?.parentFrameId);
 const inherited=parent&&!editing?evaluateAnimations((parent.animations??[]).filter(a=>['frame','group'].includes(a.targetScope)),sceneFrame,groupRect(scene,parent,project),sceneCanvas):identity();
 let inheritedX=inherited.x,inheritedY=inherited.y;
 if(parent){const root=logicalRect(scene,parent,project),cx=rect.x+w/2-root.x-root.w/2,cy=rect.y+h/2-root.y-root.h/2,q=inherited.rotation*Math.PI/180;
 inheritedX+=(cx*Math.cos(q)-cy*Math.sin(q))*inherited.scale-cx;inheritedY+=(cx*Math.sin(q)+cy*Math.cos(q))*inherited.scale-cy;}
 const base=groupRect(scene,l,project),geometry={x:base.x+base.w*(1-inherited.scale)/2+inheritedX,y:base.y+base.h*(1-inherited.scale)/2+inheritedY,w:base.w*inherited.scale,h:base.h*inherited.scale,rotation:(base.rotation??0)+inherited.rotation};
 const outer=evaluateAnimations(items.filter(a=>a.targetScope!=='imageContent'),sceneFrame,geometry,sceneCanvas);
 const combined={...outer,x:outer.x+inheritedX,y:outer.y+inheritedY,rotation:outer.rotation+inherited.rotation,scale:outer.scale*inherited.scale,opacity:outer.opacity*inherited.opacity,clip:outer.clip??inherited.clip,scan:outer.scan??inherited.scan};
 const contentHeight=Math.max(1,h-(l.style?.frame==='browser'?42:0)),zoom=Number(l.style?.mediaZoom??1),cropX=Number(l.style?.cropX??50)/100,cropY=Number(l.style?.cropY??50)/100;
 const contentRect={x:cropX*w*(1-zoom),y:cropY*contentHeight*(1-zoom),w:w*zoom,h:contentHeight*zoom};
 const local=inverseBoundary(sceneCanvas,{x:rect.x+w/2,y:rect.y+h/2},{...combined,rotation:t.rotateDeg+combined.rotation});
 const localCanvas={...local,x:local.x-rect.x,y:local.y-rect.y};
 const inner=evaluateAnimations(items.filter(a=>a.targetScope==='imageContent'),sceneFrame,contentRect,localCanvas,{x:0,y:0,w,h:contentHeight});
 const asset=project.assets.find(a=>a.assetId===l.assetId),src=asset?projectMedia(project.projectId,asset.path,mediaBase):'';
 const color=l.style?.color??palette[l.style?.colorToken??'text']??palette.text;
 const sceneMotions=editing?[]:(scene.motionStack??[]).filter(m=>isContentMotion(m.motionId));
 const contexts=[...sceneMotions.map(m=>({m,f:sceneFrame,overlay:false})),...(editing?[]:l.motionStack).map(m=>({m,f:frame,overlay:true}))];
 const textMotion=contexts.findLast(({m})=>characterMotionIds.includes(m.motionId));
 const mediaStyle:React.CSSProperties={width:'100%',height:'100%',objectFit:l.style?.fit==='cover'?'cover':'contain',objectPosition:`${Number(l.style?.cropX??50)}% ${Number(l.style?.cropY??50)}%`,transform:`scale(${Number(l.style?.mediaZoom??1)})`,transformOrigin:`${Number(l.style?.cropX??50)}% ${Number(l.style?.cropY??50)}%`};
 let content:React.ReactNode=<div data-layer={l.layerId} style={{position:'relative',width:'100%',height:'100%',overflow:'hidden',clipPath:maskClip(l.style?.mask),borderRadius:l.style?.mask==='round-rect'?24:0}}>
 <AnimationSurface delta={inner} scope="imageContent">{l.kind==='text'?<div data-layer-text={l.layerId} style={{fontFamily:String(l.style?.fontFamily??'"Yu Gothic",Meiryo,sans-serif'),fontSize:l.style?.fontSize??80,color,lineHeight:1.35,whiteSpace:'pre-wrap',overflowWrap:'anywhere',textAlign:l.style?.align??'left',background:l.style?.background,padding:l.style?.background?12:0,boxSizing:'border-box'}}>{outer.textProgress!==undefined?<AnimationText text={l.text??''} delta={outer}/>:textMotion?<AnimatedText text={l.text??''} motions={[textMotion.m]} frame={textMotion.f} fps={project.video.fps} ink={color}/>:l.text}</div>:l.kind==='image'?<Img src={src} style={mediaStyle}/>:l.kind==='video'?<Video src={src} startFrom={Number(l.style?.trimStartFrames??0)} playbackRate={Number(l.style?.playbackRate??1)} muted={editing||l.style?.videoMuted!==false} volume={Number(l.style?.videoVolume??1)} style={mediaStyle}/>:<div style={{width:'100%',height:'100%',background:l.style?.background??palette.primary,borderRadius:l.style?.mask==='round-rect'?24:0}}/>}
 </AnimationSurface></div>;
 for(const {m,f,overlay}of [...contexts].reverse())content=<MotionFrame key={`${m.motionId}-${overlay}`} motion={paced(m,scene,sceneFrame)} frame={f} index={overlay&&m.motionId==="M-033"?1:index} count={count} depth={index} overlay={overlay} color={palette.accent} background={palette.background}>{content}</MotionFrame>;
 const framed=['card','browser'].includes(String(l.style?.frame));
 return <div data-layer-container={l.layerId} data-presentation={String(l.style?.presentation??'layer')} data-media-frame={String(l.style?.frame??'none')} style={{position:'absolute',left:(b.x+t.x*b.w)*W,top:(b.y+t.y*b.h)*H,width:w,height:h,zIndex:index+1,opacity:l.opacity*combined.opacity,transform:`translate(${combined.x}px, ${combined.y}px) rotate(${t.rotateDeg+combined.rotation}deg) scale(${combined.scale})`,clipPath:combined.clip,...(framed?{borderRadius:l.style?.frame==='browser'?16:24,overflow:'hidden',boxShadow:'0 24px 65px #00000035',outline:`1px solid ${palette.mutedText}44`}:{})}}>{l.style?.frame==='browser'?<><div data-media-chrome style={{position:'absolute',top:0,left:0,right:0,height:42,background:palette.surface??'#e9edf0',display:'flex',alignItems:'center',paddingLeft:20,gap:9}}>{['#c58b88','#c8b68c','#8faa9a'].map(c=><span key={c} style={{width:10,height:10,borderRadius:'50%',background:c}}/>)}</div><div style={{position:'absolute',inset:'42px 0 0'}}>{content}</div></>:content}{combined.scan!==undefined?<div data-animation-scan style={{position:'absolute',left:`${combined.scan*100}%`,top:0,bottom:0,width:4,background:palette.accent,boxShadow:`0 0 30px 8px ${palette.accent}`,pointerEvents:'none'}}/>:null}</div>;
};
const SceneView:React.FC<{scene:Scene;project:Project;editing?:boolean}>=({scene,project,editing=false})=>{
 const mediaBase=useMediaBase();
 const frame=useCurrentFrame(),palette={...project.theme.palette,...scene.colorOverrides},layers=[...scene.layers].sort((a,b)=>a.zIndex-b.zIndex);
 const motions:Motion[]=editing?[]:scene.motionStack??[];
 let content:React.ReactNode=<AbsoluteFill><CellGuides scene={scene} palette={palette} editing={editing}/>{layers.map((layer,index)=>editing?<LayerView key={layer.layerId} layer={layer} scene={scene} project={project} editing sceneFrame={frame} index={index} count={layers.length}/>:<Sequence key={layer.layerId} from={layer.inFrame} durationInFrames={layer.durationFrames} layout="none"><LayerView layer={layer} scene={scene} project={project} sceneFrame={frame} index={index} count={layers.length}/></Sequence>)}</AbsoluteFill>;
 for(const m of [...motions.filter(m=>!isContentMotion(m.motionId))].reverse())content=<MotionFrame key={m.motionId} motion={paced(m,scene,frame)} frame={frame} color={palette.accent} background={palette.background}>{content}</MotionFrame>;
 const sceneDelta=evaluateAnimations(editing?[]:scene.animations??[],frame,{x:0,y:0,w:project.video.width,h:project.video.height},{x:0,y:0,w:project.video.width,h:project.video.height});
 content=<AnimationSurface delta={sceneDelta} scope="scene">{content}</AnimationSurface>;
 return <AbsoluteFill data-scene={scene.sceneId} style={{background:palette.background,overflow:'hidden'}}>{content}{motions.filter(m=>isContentMotion(m.motionId)).map(m=><MotionOverlay key={m.motionId} motion={m} frame={frame} color={palette.accent} background={palette.background}/>)}</AbsoluteFill>;
};
export const ProjectComposition:React.FC<{project:Project;editingScene?:string;mediaBaseUrl?:string}>=({project,editingScene,mediaBaseUrl=""})=>{
 if(editingScene){const scene=project.scenes.find(s=>s.sceneId===editingScene)!;return <MediaBaseContext.Provider value={mediaBaseUrl}><SceneView scene={scene} project={project} editing/></MediaBaseContext.Provider>;}
 const starts=sceneStarts(project);
 return <MediaBaseContext.Provider value={mediaBaseUrl}><AbsoluteFill>{project.scenes.map((scene,i)=><Sequence key={scene.sceneId} from={starts[i]} durationInFrames={scene.durationFrames}><SceneView scene={scene} project={project}/></Sequence>)}{project.audioTracks.map(t=>{const asset=project.assets.find(a=>a.assetId===t.assetId)!;return <Sequence key={t.trackId} from={t.startFrame} durationInFrames={t.durationFrames}><Audio src={projectMedia(project.projectId,asset.path,mediaBaseUrl)} volume={f=>(t.volume??.5)*Math.max(0,Math.min(1,f/(t.fadeInFrames||1),(t.durationFrames-f)/(t.fadeOutFrames||1)))}/></Sequence>;})}</AbsoluteFill></MediaBaseContext.Provider>;
};




