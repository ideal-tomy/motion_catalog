import base from '../../tournament-latest-review-20261024/vite.animation-preview.config.ts';
export default {...base, publicDir:'C:/Users/ryoji/00myapp/ai_demo_workspace/tournament-latest-review-20261024/public', cacheDir: new URL('./.cache/vite', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), server: {...base.server, port: 5175, strictPort: true}};
