import fs from 'node:fs';
import path from 'node:path';
const job='jobs/dd-premium-20261112';fs.mkdirSync(job,{recursive:true});
const write=(name,data)=>fs.writeFileSync(path.join(job,name),JSON.stringify(data,null,2));
write('request.json',{project:'dd-premium-20261112',source:'C:/Users/ryoji/00myapp/ai_demo_workspace/dd_demo',instruction:'理想.md：高級感・信頼感。余白と抑制された動きでサービスの品質を伝える20秒CM。実画面・機能を優先。',durationSeconds:20,fps:30,width:1920,height:1080,captureMode:'actual-ui',visualTone:'premium / trustworthy / restrained',audience:'DD・M&A・経営企画の担当者',goal:'給与×勤怠の照合と根拠確認の機能理解',locale:'ja',noGo:['unverified accuracy claims','unverified financial outcomes','production writes','new AI calls','invented contact details','strobe','camera shake']});
write('delivery.json',{subject:'DD',tone:'高級感・信頼感',language:'日本語',variant:'照合と根拠確認',description:'余白・低彩度・抑制された動きで、給与×勤怠の照合と根拠確認の実画面を紹介する20秒CM。',date:'20261112',version:1});
write('composition.json',{project:'dd-premium-20261112',compositionId:'DdPremium',durationSeconds:20,fps:30,width:1920,height:1080,brand:'AXEON / DD INTELLIGENCE',music:'audio/dd-premium-original.wav',cta:'DDデモで体験する',disclaimer:'同梱の架空CSVを使用 / 最終判断は人が行います',scenes:[
 {from:0,to:3,kind:'intro',eyebrow:'CLARITY. BEFORE THE DECISION.',lines:['判断を支える、','確かな根拠を。'],motionIds:['M-003']},
 {from:3,to:7,kind:'product',eyebrow:'AXEON / DD INTELLIGENCE',lines:['資料をつなぎ、','判断に備える。'],detail:'給与と勤怠を照らし合わせる。\nその一歩を、実際の画面で。',image:'captures/dd/input.jpg',motionIds:['M-003','M-012']},
 {from:7,to:10.5,kind:'result',eyebrow:'01 / RECONCILIATION',lines:['給与 × 勤怠。','差異を、見える形に。'],detail:'照合した結果を確認。\n気になる差異から、根拠へ。',image:'captures/dd/result.jpg',motionIds:['M-003','M-012','M-005']},
 {from:10.5,to:14,kind:'proof',eyebrow:'02 / TRACEABLE EVIDENCE',lines:['数字の先にある、','参照行まで。'],detail:'給与台帳と勤怠データの\n参照行を、実画面で確認。',image:'captures/dd/evidence-card.jpg',motionIds:['M-003','M-012','M-005']},
 {from:14,to:20,kind:'end',eyebrow:'EVIDENCE FOR YOUR NEXT DECISION',lines:['根拠から、次の判断へ。'],motionIds:['M-003']}
]});
const assets=JSON.parse(fs.readFileSync('jobs/dd-rock-20261112/assets.json','utf8'));assets.job='dd-premium-20261112';assets.assets.forEach(a=>{a.evidence='../dd-rock-20261112/captures/evidence.json';});assets.notes.push('既存撮影素材を再利用。機能とサンプルデータは変更しない。実画面は静止キャプチャを使用。');write('assets.json',assets);
console.log('Prepared premium 20s DD job.');
