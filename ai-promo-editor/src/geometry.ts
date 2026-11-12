import type {Layer,Scene} from './core';
export function cellBounds(scene:Scene,cell:number){
 if(scene.layout.type==='single'||scene.layout.type==='free')return {x:0,y:0,w:1,h:1};
 if(scene.layout.type==='grid4')return {x:(cell%2)*.5,y:Math.floor(cell/2)*.5,w:.5,h:.5};
 const r=scene.layout.splitRatio;return scene.layout.direction==='horizontal'?{x:cell===0?0:r,y:0,w:cell===0?r:1-r,h:1}:{x:0,y:cell===0?0:r,w:1,h:cell===0?r:1-r};
}
export function layerBounds(s:Scene,l:Layer){const b=cellBounds(s,l.style?.cellIndex??0),t=l.transform;return {...t,x:b.x+t.x*b.w,y:b.y+t.y*b.h,width:t.width*b.w,height:t.height*b.h};}
export const maskClip=(mask:unknown)=>mask==='circle'?'circle(50% at 50% 50%)':mask==='ellipse'?'ellipse(50% 50% at 50% 50%)':mask==='diamond'?'polygon(50% 0,100% 50%,50% 100%,0 50%)':mask==='diagonal-left'?'polygon(0 0,100% 0,69.23% 100%,0 100%)':mask==='diagonal-right'?'polygon(36.36% 0,100% 0,100% 100%,0 100%)':undefined;
