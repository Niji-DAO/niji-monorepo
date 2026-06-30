/**
 * Recompute Polly recording entry `_id` values after changing `matchRequestsBy.body` matcher.
 *
 * 目的 ... test/setup.ts の `matchRequestsBy.body` 関数を変更したり Polly version up で
 *         identifier hash 算出ロジックが変わった際に、 既存 recording 内 entry の `_id` field と
 *         lookup 時の request `id` が不一致になる問題を解消する。
 *         recording を実 RPC で record し直さなくても済む。
 *
 * 算出ロジック ... Polly NormalizeRequest 互換 (request.js + normalize-request.js + parse-url.js):
 *   - method ... toUpperCase()
 *   - url ... matchRequestsBy.url 関数 → url-parse(.href) で末尾 `/` 補完
 *   - body ... matchRequestsBy.body 関数 (本 file の normalizeRpcBody を hard-code)
 *   - identifiers = {method, body, url} を fast-json-stable-stringify で sort → blueimp-md5
 *
 * Usage: pnpm -F @niji/sdk exec node ./test/recompute-recording-ids.mjs
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Polly 6.x が依存している hash / stringify / url-parse 実装を直接 import する。
// pnpm strict mode のため transitive dep を repo root の `.pnpm/<pkg>@<version>/...` から取得する。
// Polly version 更新時は `node_modules/.pnpm` 内の path を追従させること。
import md5 from '../../../node_modules/.pnpm/blueimp-md5@2.19.0/node_modules/blueimp-md5/js/md5.js';
import stringify from '../../../node_modules/.pnpm/fast-json-stable-stringify@2.1.0/node_modules/fast-json-stable-stringify/index.js';
import UrlParse from '../../../node_modules/.pnpm/url-parse@1.5.10/node_modules/url-parse/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RECORDINGS_DIR = join(__dirname, '__recordings__');

function normalizeRpcUrl(url) {
  return url
    .replace(process.env.MAINNET_RPC_URL ?? 'https://eth.merkle.io', 'https://mainnet.rpc.local')
    .replace(
      process.env.SEPOLIA_RPC_URL ?? 'https://sepolia.drpc.org',
      'https://sepolia.rpc.local',
    );
}

function stripIdField(entry) {
  const result = {};
  for (const key in entry) {
    if (key !== 'id') result[key] = entry[key];
  }
  return result;
}

function normalizeRpcBody(body) {
  if (!body) return body;
  try {
    const parsed = JSON.parse(body);
    if (Array.isArray(parsed)) {
      return JSON.stringify(parsed.map(stripIdField));
    }
    if (parsed && typeof parsed === 'object') {
      return JSON.stringify(stripIdField(parsed));
    }
    return body;
  } catch {
    return body;
  }
}

function computeId({ method, url, body }) {
  const parsed = new UrlParse(normalizeRpcUrl(url), true);
  const identifiers = {
    method: String(method).toUpperCase(),
    body: normalizeRpcBody(body),
    url: parsed.href,
  };
  return md5(stringify(identifiers));
}

async function main() {
  const dirs = await readdir(RECORDINGS_DIR);
  for (const dir of dirs) {
    const harPath = join(RECORDINGS_DIR, dir, 'recording.har');
    let har;
    try {
      har = JSON.parse(await readFile(harPath, 'utf8'));
    } catch (e) {
      console.log('skip', harPath, e.message);
      continue;
    }
    const entries = har.log?.entries ?? [];
    let changed = 0;
    for (const entry of entries) {
      const req = entry.request;
      const body = req.postData?.text ?? '';
      const newId = computeId({ method: req.method, url: req.url, body });
      if (entry._id !== newId) {
        entry._id = newId;
        changed += 1;
      }
    }
    if (changed > 0) {
      await writeFile(harPath, JSON.stringify(har, null, 2), 'utf8');
      console.log(`updated ${changed}/${entries.length} entries in ${dir}/recording.har`);
    } else {
      console.log(`no change in ${dir}/recording.har (${entries.length} entries)`);
    }
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
