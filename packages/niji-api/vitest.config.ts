import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // GMO mock server test は env 変数 (GMO_ENDPOINT / USE_GMO_MOCK) を触るため、
    // 各 test file を isolate してテスト間 env 汚染を回避する。
    isolate: true,
    // ponder.config.ts などが dotenv.config() を呼ぶが、 test は独立 env で実行するため無視。
    globals: false,
  },
});
