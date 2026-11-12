import fs from 'node:fs';
if(fs.readFileSync('src/index.tsx','utf8').includes('const AtlasRoot:'))throw Error('Atlas is already installed. This one-time setup does not overwrite existing implementation.');
const ids=['009','017','060','054','014','016'];
for(const id of ids){const dir=`src/motions/M${id}`;fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(dir+'/index.tsx',`import React from 'react';\nimport {AtlasMotion} from '../atlas-shared';\nimport type {MotionProps} from '../atlas-types';\nexport const M${id}:React.FC<MotionProps>=props=><AtlasMotion {...props} id="M-${id}"/>;\n`);}
let entry=fs.readFileSync('src/index.tsx','utf8');
entry=entry.replace('registerRoot(StudioRoot);',`import {AtlasTournament,AtlasSingle} from './AtlasTournament';\nimport atlasPlan from '../jobs/atlas-reexport-tournament-20261113/composition.json';\nconst AtlasRoot:React.FC=()=> <><StudioRoot/><Composition id="AtlasTournament" component={AtlasTournament} durationInFrames={600} fps={30} width={1920} height={1080} defaultProps={{plan:atlasPlan}}/>{atlasPlan.scenes.map(scene=><Composition key={scene.id} id={scene.id.replace('-','')} component={AtlasSingle} durationInFrames={scene.endFrame-scene.startFrame} fps={30} width={1920} height={1080} defaultProps={{scene,theme:atlasPlan.theme}}/>)}</>;\nregisterRoot(AtlasRoot);`);
fs.writeFileSync('src/index.tsx',entry);
let music=fs.readFileSync('scripts/music.mjs','utf8').replace('[3,7,10,13,17]','[3,6.4,10,13,17]').replaceAll('promo-original.wav','atlas-reexport.wav');
fs.writeFileSync('scripts/music-atlas.mjs',music);
let render=fs.readFileSync('scripts/render.mjs','utf8');
render=render.replace('const isEnglish=',"const isAtlas=plan.compositionId==='AtlasTournament';\nconst isEnglish=");
render=render.replace('const baseFrames=isPremium?', 'const baseFrames=isAtlas?[0,45,120,192,210,330,420,540,599]:isPremium?');
render+=`\nif(isAtlas){fs.writeFileSync(path.join(out,'preview/index.html'),\`<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ATLAS 6種 / Tournament opening</title><style>\${css}</style><main><p>MOTION ATLAS / 6 MOTIONS</p><h1>ダーツ大会オープニング — 20秒</h1><video controls playsinline preload="metadata" poster="poster.png" src="promo_16x9.mp4"></video><p>M-009 → M-017 → M-060 → M-054 → M-014 → M-016</p><p>1920×1080 / 30fps / オリジナルBGM・SE</p><p><a href="promo_16x9.mp4" download>MP4を保存</a></p><small>演出用に再構築した架空の大会・対戦例です。実画面や実際の大会結果ではありません。</small></main></html>\`);}\n`;
fs.writeFileSync('scripts/render.mjs',render);
