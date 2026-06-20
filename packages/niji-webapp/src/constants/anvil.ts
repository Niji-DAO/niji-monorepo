// anvil dev chain (chain id 31337) の port と RPC URL を 1 箇所に集約する。
// 将来 port 変更時はここ 1 file の修正で webapp 全域に反映される。

export const ANVIL_PORT = 8547;
export const ANVIL_RPC_URL = `http://127.0.0.1:${ANVIL_PORT}` as const;
