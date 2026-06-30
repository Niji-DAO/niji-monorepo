import { defineConfig } from 'vitest/config';
import 'dotenv/config';

export default defineConfig({
  test: {
    // happy-dom を default env に採用する (CAR-302 / GH #2993)。
    // 旧 default の jsdom 26 + @pollyjs/adapter-fetch v6 は Response 構築で hang する既知問題があり、
    // Polly recording を replay する treasury 系 React hook test が timeout fail していた。
    // happy-dom 経路では fetch adapter が正常 intercept + response 返却まで完走する。
    environment: 'happy-dom',
    environmentOptions: {
      // happy-dom env で Polly mock 経由 RPC URL (eth.merkle.io 等) への cross-origin request を許可するため
      // Same-Origin Policy を test 用に無効化。
      happyDOM: {
        settings: {
          fetch: {
            disableSameOriginPolicy: true,
          },
        },
      },
    },
  },
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
});
