# Source animation audit

- Source: `tournament-latest-review-20261024`, local Vite Animation Preview at `127.0.0.1:5175`.
- Captured scenes: Draw (standard and long-name fixture), Bracket, VS, Result, Champion.
- Preview is isolated and fixture-only; the capture script reads the allowed images from the app's public directory and intercepts only `/tournament-effects/*` requests. It makes no API, database, or external network requests.
- Source screen states display `ANIMATION PREVIEW · SAMPLE ONLY`; entrant names and outcomes are fixture content. Rendered scenes preserve a `SAMPLE` label.
- Browser's built-in video recorder produced blank white video despite the page rendering. Capture was changed to full-resolution, 30 fps page screenshots and encoded locally with the existing Remotion FFmpeg binary. The actual motion is retained in the verified captures.
- Draw's card backs/fronts and dart overlays are served from the source app's public assets by a Playwright route; no source app files are changed.
- Capture report: `animation-video-captures.json`. Representative UI stills and source videos: `captures/verified/`.
