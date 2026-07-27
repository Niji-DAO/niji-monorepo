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
    // Vite 5+ security = external host からの access を allowlist で明示許可。
    // `.trycloudflare.com` (Quick Tunnel) + localhost + LAN IP を許可、
    // Named Tunnel or production 独自 domain も追加可能 (前提 = tunnel 経由 demo 環境)。
    allowedHosts: ['.trycloudflare.com', '.cfargotunnel.com', 'localhost', '127.0.0.1'],
    hmr: {
      overlay: true,
    },
    // dev 環境で VITE_GMO_API_ENDPOINT_SPOT_RATE / VITE_GMO_API_ENDPOINT が .env に未設定の場合の
    // fallback 経路として、 相対 URL /api/v1/... を Ponder (42069) + spot-rate-server (42070) に proxy する。
    // env 明示設定時は resolveSpotRateEndpoint が絶対 URL を返し fetch は proxy を経由しない (優先度低)。
    proxy: {
      '/api/v1/spot-rate': {
        target: 'http://127.0.0.1:42070',
        changeOrigin: true,
      },
      // authorize-fincode は Ponder 非依存の independent server (port 42071、 e2e real fincode 経路 verify 用)。
      // より具体的な path を先に match するため fiat-bid より前に配置 (vite proxy match 優先度)。
      '/api/v1/fiat-bid/authorize-fincode': {
        target: 'http://127.0.0.1:42071',
        changeOrigin: true,
      },
      '/api/v1/fiat-bid/capture-fincode': {
        target: 'http://127.0.0.1:42071',
        changeOrigin: true,
      },
      // 2026-07-17 = place-bid stub も :42071 に routing (Ponder :42069 crash 中の暫定経路、
      // Stage B rebrand で :42069 復活後は元経路に戻す)。
      '/api/v1/fiat-bid/place-bid': {
        target: 'http://127.0.0.1:42071',
        changeOrigin: true,
      },
      '/api/v1/fiat-bid': {
        target: 'http://127.0.0.1:42069',
        changeOrigin: true,
      },
    },
  },
  // build 時のみ 30MB niji-data-rle.json を JSON.parse で lazy 展開 (dev では逆効果のため無効)。
  json: {
    stringify: process.env.NODE_ENV === 'production',
  },
  optimizeDeps: {
    // 30MB niji-data-rle.json を含む @niji/assets の事前 bundle を無効化、
    // dev server 起動時の一括 transform を避けメモリ消費を抑制。
    exclude: ['@niji/assets', '@niji/sdk'],
    // dev server 起動時に scan する dependency 範囲を制限。
    entries: ['src/index.tsx'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    dedupe: ['@tanstack/react-query', '@wagmi/core', 'viem', 'wagmi'],
  },
  build: {
    // 30MB niji-data-rle.json を独立 chunk 化して main bundle から切り離す。
    // 旧 33MB 単一 chunk → main ~3MB + niji-data 30MB (別 request、 lazy parse) に分割。
    chunkSizeWarningLimit: 5000,
    // 巨大 vendor chunk (wallet-vendor 2.4MB / motion-vendor 220KB 等) を initial preload
    // から除外、 実際に import される時にのみ DL する経路に切替。 index.html の initial
    // preload は critical path (main + react + wagmi) のみに絞り込む。
    modulePreload: {
      resolveDependencies: (_filename, deps) => {
        return deps.filter(dep => {
          if (dep.includes('wallet-vendor')) return false;
          if (dep.includes('markdown-vendor')) return false;
          if (dep.includes('chart-vendor')) return false;
          if (dep.includes('motion-vendor')) return false;
          if (dep.includes('bootstrap-vendor')) return false;
          if (dep.includes('ethers-vendor')) return false;
          return true;
        });
      },
    },
    rollupOptions: {
      external: ['fs'],
      output: {
        format: 'esm',
        manualChunks: id => {
          if (id.includes('niji-data-rle.json')) return 'niji-data';
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/'))
            return 'react-vendor';
          if (
            id.includes('node_modules/wagmi/') ||
            id.includes('node_modules/viem/') ||
            id.includes('node_modules/@wagmi/')
          )
            return 'wagmi-vendor';
          if (id.includes('node_modules/@tanstack/')) return 'tanstack-vendor';
          // 大物 wallet UI (walletconnect / web3modal / reown / coinbase wallet SDK) を独立 chunk 化。
          // wallet 接続 modal 表示時のみ必要、 initial page load では critical path 外。
          if (
            id.includes('node_modules/@walletconnect/') ||
            id.includes('node_modules/@web3modal/') ||
            id.includes('node_modules/@reown/') ||
            id.includes('node_modules/@coinbase/')
          )
            return 'wallet-vendor';
          // ConnectKit + wallet button 系 UI
          if (id.includes('node_modules/connectkit/')) return 'wallet-vendor';
          // ethers (legacy path、 wagmi 経路と分離)
          if (id.includes('node_modules/ethers/')) return 'ethers-vendor';
          // syntax highlighter / markdown 系は governance page でのみ使用、 lazy chunk へ
          if (
            id.includes('node_modules/react-syntax-highlighter/') ||
            id.includes('node_modules/refractor/') ||
            id.includes('node_modules/prismjs/') ||
            id.includes('node_modules/react-markdown/') ||
            id.includes('node_modules/remark-') ||
            id.includes('node_modules/rehype-')
          )
            return 'markdown-vendor';
          // chart / date picker 系 (governance / analytics 用)
          if (
            id.includes('node_modules/recharts/') ||
            id.includes('node_modules/d3-') ||
            id.includes('node_modules/react-datepicker/')
          )
            return 'chart-vendor';
          // bootstrap / react-bootstrap は legacy、 徐々に廃止予定だが現状 main bundle に残る
          if (id.includes('node_modules/react-bootstrap/') || id.includes('node_modules/bootstrap/'))
            return 'bootstrap-vendor';
          // motion / animation 系
          if (id.includes('node_modules/framer-motion/') || id.includes('node_modules/motion/'))
            return 'motion-vendor';
          // Radix UI (shadcn/ui 依存) は多数の小 package で構成、 まとめて 1 chunk
          if (id.includes('node_modules/@radix-ui/')) return 'radix-vendor';
          // lingui i18n runtime
          if (id.includes('node_modules/@lingui/')) return 'lingui-vendor';
        },
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
