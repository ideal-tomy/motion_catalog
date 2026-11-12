export type Theme={background:string;primary:string;accent:string;foreground:string};
export type MotionProps={frame:number;durationInFrames:number;text:string;theme:Theme;speed?:number;easing?:'linear'|'easeOut';startFrame?:number;endFrame?:number;audioCue?:number};
export const clamp=(n:number)=>Math.max(0,Math.min(1,n));
export const elapsed=(p:MotionProps)=>Math.max(0,Math.min(p.endFrame??p.durationInFrames,p.frame)-(p.startFrame??0))*(p.speed??1);
export const seed=(n:number)=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)};
