import '@testing-library/jest-dom';

// nijiAssets.ts の top-level `await fetch('/niji-data-rle.json')` は
// Vitest (Node fetch) では relative URL parse できず `ERR_INVALID_URL` になる。
// jsdom 環境で fetch を mock stub し、 test では最小限の shape だけ返す。
// nijiTraitKeys (12 trait id) を空 image array で埋めて loadNijiData を成立させる。
const NIJI_TRAIT_KEYS = [
  'special',
  'choker',
  'headphone',
  'leftHand',
  'hat',
  'clothing',
  'ear',
  'back',
  'backDecoration',
  'background',
  'solidBackground',
  'hair',
];

const originalFetch = globalThis.fetch;
globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input.toString();
  if (url === '/niji-data-rle.json') {
    return Promise.resolve(
      new Response(
        JSON.stringify({
          palette: [],
          images: Object.fromEntries(NIJI_TRAIT_KEYS.map(key => [key, []])),
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );
  }
  return originalFetch(input, init);
}) as typeof fetch;
