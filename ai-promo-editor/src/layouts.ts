import data from '../reference/layouts-v3.json' with {type:'json'};
import {newLayer,type Scene} from './core';
import {layerBounds} from './geometry';
export type LayoutPreset=typeof data.layouts[number];
export const layoutPresets=data.layouts;
export function applyLayoutPreset(scene:Scene,preset:LayoutPreset){
 if(scene.layers.some(l=>l.locked))throw Error('固定レイヤーがあります。先に固定を解除してください');
 const existing=scene.layers.filter(l=>!l.style?.templatePlaceholder);
 for(const l of existing)l.transform=layerBounds(scene,l);
 const media=existing.filter(l=>['image','video','shape'].includes(l.kind)),pool=media.length?media:existing.filter(l=>l.kind==='text');
 const assigned=new Set<string>();scene.unplacedLayerIds=[];
 preset.regions.forEach((region,index)=>{let l=pool[index];if(!l){l=newLayer(scene,'shape');l.style={...l.style,templatePlaceholder:true,background:'#203c50'};existing.push(l);}assigned.add(l.layerId);l.transform={x:region.x,y:region.y,width:region.w,height:region.h,rotateDeg:0};l.style={...l.style,cellIndex:index,mask:region.mask,fit:'cover',layoutRegion:index};if(l.kind==='text'){l.transform={...l.transform,x:region.x+region.w*.08,y:region.y+region.h*.3,width:region.w*.84,height:region.h*.5};}l.zIndex=index+1;});
 for(const l of pool.slice(preset.regions.length))scene.unplacedLayerIds.push(l.layerId);
 // Text overlays keep their content and their original absolute placement.
 for(const l of existing)if(!assigned.has(l.layerId)&&!scene.unplacedLayerIds.includes(l.layerId))l.zIndex=Math.max(l.zIndex,preset.regions.length+1);
 scene.layers=existing;scene.layout={type:'free',direction:'horizontal',splitRatio:.5,cells:1,presetId:preset.id};
}
