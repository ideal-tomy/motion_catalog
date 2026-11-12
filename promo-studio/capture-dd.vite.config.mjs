import react from '../../dd_demo/node_modules/@vitejs/plugin-react/dist/index.js';
import {fileURLToPath} from 'node:url';
const target=fileURLToPath(new URL('../../dd_demo/',import.meta.url));
export default {
  root:target,envDir:false,
  cacheDir:fileURLToPath(new URL('./.cache/dd-vite/',import.meta.url)),
  plugins:[react(),{name:'local-ai-route',configureServer(server){server.middlewares.use((req,_res,next)=>{if(req.url?.split('?')[0]==='/ai')req.url=req.url.replace('/ai','/ai.html');next();});}}],
  server:{host:'127.0.0.1',port:4212,strictPort:true,fs:{allow:[target],deny:['.env','.env.*','**/.git/**']}},
};
