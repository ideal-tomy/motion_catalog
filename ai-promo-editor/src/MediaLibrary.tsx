import React,{useRef,useState} from 'react';
import type {Asset,Project} from './core';
export const mediaURL=(projectId:string,path:string)=>`/media/${encodeURIComponent(projectId)}/${encodeURIComponent(path.slice(7))}`;
export async function mediaThumbnail(file:Blob,kind:string){
 const url=URL.createObjectURL(file);try{
 const canvas=document.createElement('canvas');let width=0,height=0,durationSeconds:number|undefined;
 let source:CanvasImageSource;
 if(kind==='video'){const v=document.createElement('video');v.muted=true;v.preload='metadata';v.src=url;try{await new Promise<void>((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error('動画を読み込めません')),15000);v.onloadeddata=()=>{clearTimeout(timeout);resolve();};v.onerror=()=>{clearTimeout(timeout);reject(Error('対応する動画を読み込めません'));};});width=v.videoWidth;height=v.videoHeight;durationSeconds=v.duration;source=v;canvas.width=320;canvas.height=Math.round(320*height/width);canvas.getContext('2d')!.drawImage(source,0,0,canvas.width,canvas.height);}finally{v.removeAttribute('src');v.load();}}
 else{const image=await createImageBitmap(file);width=image.width;height=image.height;canvas.width=320;canvas.height=Math.max(1,Math.round(320*height/width));canvas.getContext('2d')!.drawImage(image,0,0,canvas.width,canvas.height);image.close();}
 if(!width||!height||width*height>100000000||!Number.isFinite(durationSeconds??0))throw Error('素材の寸法・時間を確認してください');
 const thumbnail=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('サムネイル生成失敗')),'image/jpeg',.8));return {thumbnail,width,height,...(durationSeconds!==undefined?{durationSeconds}:{})};
 }finally{URL.revokeObjectURL(url);}
}
function AssetThumb({projectId,asset:a}:{projectId:string;asset:Asset}){
 const [src,setSrc]=useState(mediaURL(projectId,a.posterPath??`assets/${a.assetId}.thumb.jpg`)),[failed,setFailed]=useState(false),attempted=useRef(false);
 async function recover(){if(attempted.current){setFailed(true);return;}attempted.current=true;try{const r=await fetch(mediaURL(projectId,a.path));if(!r.ok)throw Error('素材を読み込めません');const t=await mediaThumbnail(await r.blob(),a.kind==='video'?'video':'image'),res=await fetch(`/api/projects/${projectId}/assets/${a.assetId}/thumbnail`,{method:'POST',headers:{'X-Promo-Local':'1','Content-Type':'image/jpeg'},body:t.thumbnail});if(!res.ok)throw Error('ポスターを保存できません');const data=await res.json();setSrc(mediaURL(projectId,data.posterPath)+'?cached=1');}catch{setFailed(true);}}
 return failed?<span>プレビューを生成できません。クリックで元の素材を確認</span>:<img loading="lazy" src={src} alt={a.originalName??a.assetId} onError={recover}/>;
}
export function MediaLibrary({project,onPlace,onRemove}:{project:Project;onPlace:(a:Asset,mode:'layer'|'cell'|'background'|'frame')=>void;onRemove:(a:Asset)=>void}){
 const [expanded,setExpanded]=useState<Asset|null>(null);
 return <><div className="asset-grid">{project.assets.map(a=><section className="asset" key={a.assetId} data-asset-id={a.assetId}><button className="asset-thumb" onClick={()=>setExpanded(a)} aria-label={`${a.originalName??a.assetId}を拡大`}>{a.kind==='audio'?<span>♫ AUDIO</span>:<AssetThumb key={`${project.projectId}-${a.assetId}`} projectId={project.projectId} asset={a}/>}</button><b>{a.originalName??a.path.slice(7)}</b><small>{a.kind} {a.width?`${a.width}×${a.height}`:''} {a.durationSeconds!==undefined?`${a.durationSeconds.toFixed(1)}秒`:''}</small><button onClick={()=>onPlace(a,'layer')}>{a.kind==='audio'?'BGMに使う':'レイヤーとして追加'}</button>{a.kind!=='audio'?<><button onClick={()=>onPlace(a,'cell')}>選択セルに配置</button><button onClick={()=>onPlace(a,'frame')}>選択フレームに入れる</button><button onClick={()=>onPlace(a,'background')}>背景に設定</button></>:null}<button onClick={()=>onRemove(a)}>素材一覧から外す</button></section>)}</div>{expanded?<div className="modal-backdrop"><section className="modal" role="dialog" aria-label="素材を拡大"><h2>{expanded.originalName??expanded.assetId}</h2>{expanded.kind==='video'?<video src={mediaURL(project.projectId,expanded.path)} controls autoPlay playsInline/>:expanded.kind==='audio'?<audio src={mediaURL(project.projectId,expanded.path)} controls/>:<img className="media-expanded" src={mediaURL(project.projectId,expanded.path)} alt={expanded.originalName??expanded.assetId}/>}<button onClick={()=>setExpanded(null)}>拡大を閉じる</button></section></div>:null}</>;
}
