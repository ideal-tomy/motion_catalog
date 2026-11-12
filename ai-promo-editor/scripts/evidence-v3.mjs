import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const out='docs/qa/v3',pid=JSON.parse(fs.readFileSync(out+'/fixture.json')).projectId,base='http://127.0.0.1:4319';
const current=await(await fetch(base+'/api/projects/'+pid)).json();
if(process.argv.includes('--snapshot')){fs.writeFileSync(out+'/restart-project.json',JSON.stringify(current,null,2));console.log('Saved restart baseline');}
else{
 assert.deepEqual(current,JSON.parse(fs.readFileSync(out+'/restart-project.json')));
 for(const a of current.assets)for(const p of [a.path,...(a.posterPath?[a.posterPath]:[])])assert.ok(fs.existsSync(path.join('workspace/projects',pid,p)));
 const original=JSON.parse(fs.readFileSync('docs/backups/v3-before-20261113-005523/projects/promo-sample-001/project.json')),saved=JSON.parse(fs.readFileSync('workspace/projects/promo-sample-001/project.json'));delete original.revision;delete saved.revision;assert.deepEqual(saved,original,'Existing project content changed');
 const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),sourceHash=hash('reference/catalog/MOTION_ATLAS_60/index.html');assert.ok(fs.readFileSync('src/atlas/renderer.js','utf8').includes(sourceHash));
 const health=await(await fetch(base+'/api/health')).json(),catalog=await(await fetch(base+'/api/catalog')).json();assert.equal(catalog.length,60);assert.equal(catalog.filter(m=>m.sceneApplicable).length,4);assert.equal(catalog.filter(m=>m.mp4Exportable).length,0);
 const report={serverRestartProjectExact:true,allMediaPresent:true,existingSampleContentPreserved:true,originalAtlasSHA256:sourceHash,posters:fs.readdirSync('public/atlas-posters').length,sceneApplicable:4,mp4Exportable:0,health};fs.writeFileSync(out+'/restart-and-protection.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}
