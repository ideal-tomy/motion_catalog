import React,{createContext,useContext} from 'react';
// The editor serves project assets from /media. A render bundles identical
// bytes into its public directory and supplies only that public URL prefix.
export const MediaBaseContext=createContext('');
export const useMediaBase=()=>useContext(MediaBaseContext);
export function projectMedia(projectId:string,path:string,base=''){return `${base.replace(/\/$/,'')}/media/${encodeURIComponent(projectId)}/${encodeURIComponent(path.slice(7))}`;}
