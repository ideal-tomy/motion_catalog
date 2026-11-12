import fs from 'node:fs';
import path from 'node:path';
import {naming,library,read} from './library.mjs';
const job='jobs/atlas-reexport-tournament-20261113',preview=job+'/output/preview',motions=job+'/output/motions';
if(process.argv.includes('--prepare')){
 fs.cpSync(motions,preview+'/motions',{recursive:true});
 const html=fs.readFileSync(preview+'/index.html','utf8');if(!html.includes('href="motions/index.html"'))fs.writeFileSync(preview+'/index.html',html.replace('</main>','<p><a href="motions/index.html">6種類の単体プレビューを開く</a></p></main>'));
}else{
 const {folder}=naming(read(job+'/delivery.json'),read(job+'/request.json')),dest=path.join(library,folder);
 if(!fs.existsSync(path.join(dest,'作品情報.json')))throw Error('Complete QA and library collection first');
 fs.cpSync(motions,path.join(dest,'motions'),{recursive:true});
 fs.copyFileSync(job+'/README.md',path.join(dest,'制作内容.md'));
 fs.copyFileSync(job+'/composition.json',path.join(dest,'構成.json'));
 console.log(dest);
}
