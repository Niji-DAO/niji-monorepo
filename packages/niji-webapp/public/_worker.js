/**
 * Cloudflare Pages Advanced Mode worker = 全 request に Basic 認証をかける。
 *
 * public/_worker.js は Vite build で dist/_worker.js にコピーされ、 wrangler pages deploy が
 * advanced mode として検出する。 全 request を本 worker が intercept し、 Basic 認証 header を
 * 検証 → 通過なら env.ASSETS.fetch(request) で static asset (SPA) を serve、 _redirects の
 * `/* /index.html 200` (SPA fallback) も ASSETS binding が尊重する。
 *
 * credential = Cloudflare Pages 環境変数 (BASIC_AUTH_USER / BASIC_AUTH_PASS)、 未設定時は
 * 認証を skip (誤設定で締め出さないための fail-open、 dev の限定公開用途)。
 *
 * API (niji-api Workers) は別 origin (workers.dev) で本 worker の対象外 = webapp fetch に
 * Basic header を付けなくても API 呼出は通る。
 */
export default {
  async fetch(request, env) {
    const user = env.BASIC_AUTH_USER;
    const pass = env.BASIC_AUTH_PASS;

    // credential 未設定なら認証 skip (fail-open、 誤設定での締め出し防止)
    if (!user || !pass) {
      return env.ASSETS.fetch(request);
    }

    const auth = request.headers.get('Authorization') || '';
    const expected = 'Basic ' + btoa(`${user}:${pass}`);

    // 定数時間比較でない簡易比較 (Basic 認証自体が弱いので dev 用途では十分)
    if (auth !== expected) {
      return new Response('Authentication required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="niji-dev", charset="UTF-8"',
          'Content-Type': 'text/plain; charset=utf-8',
        },
      });
    }

    // 認証通過 → static asset を serve (SPA fallback は ASSETS binding が _redirects で処理)
    return env.ASSETS.fetch(request);
  },
};
