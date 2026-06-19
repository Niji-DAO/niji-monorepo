import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';
import { lingui } from '@lingui/vite-plugin';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import svgr from 'vite-plugin-svgr';
import Inspect from 'vite-plugin-inspect';
import checker from 'vite-plugin-checker';

// /lp は /lp/ に 301 redirect (ブラウザの相対 path 解決を /lp/assets/ に統一)、
// /lp/ は /lp/index.html に rewrite して SPA fallback が React top を返さないようにする。
// HTML 内の asset 参照は `/lp/assets/...` 絶対 path で書かれているので、 base URL に
// 依らず正しく解決される。
const lpRewritePlugin = (): Plugin => ({
  name: 'lp-rewrite',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/lp') {
        res.statusCode = 301;
        res.setHeader('Location', '/lp/');
        res.end();
        return;
      }
      if (req.url === '/lp/') {
        req.url = '/lp/index.html';
      }
      next();
    });
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['@lingui/babel-plugin-lingui-macro'],
      },
    }),
    lingui(),
    nodePolyfills(),
    svgr({
      svgrOptions: {
        plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
        svgoConfig: {
          floatPrecision: 2,
        },
        exportType: 'default',
        ref: true,
      },
      include: '**/*.svg?react',
    }),
    lpRewritePlugin(),
    Inspect(),
    checker({
      typescript: true,
      // eslint: {
      //   lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
      //   useFlatConfig: true
      // },
      overlay: true,
    }),
  ],
  server: {
    port: 2424,
    strictPort: true,
    hmr: {
      overlay: true,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    dedupe: ['@tanstack/react-query', '@wagmi/core', 'viem', 'wagmi'],
  },
  build: {
    rollupOptions: {
      external: ['fs'],
      output: {
        format: 'esm',
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console logs in production builds
        drop_console: true,
      },
    },
  },
});
