/**
 * ETH/JPY spot rate polling hook (Issue #3009 Phase A、 T1)
 *
 * 役割 —
 * backend の GET /api/v1/spot-rate/eth-jpy (Issue #3005) を polling して
 * 現在の ETH/JPY spot rate を FiatBidModal に供給する。
 *
 * default では 15 秒 interval で refetch、 TanStack Query cache を通じて
 * 同一 rate の重複 fetch を抑制する (spec Phase1-01-master-spec.md § P4)。
 *
 * SSOT — tests/spec/gmo-fiat-bid/Phase1-01-master-spec.md § P4 + P7、
 *        Phase1-02-issue-breakdown.md § Issue 6。
 */

import { useQuery } from '@tanstack/react-query';

/** backend /api/v1/spot-rate/eth-jpy 応答 shape (公開 API 契約と一致) */
export type SpotRate = {
  /** ETH 1 単位 = jpy 何円か (整数 or 小数の JPY 額) */
  rate: number;
  /**
   * 取得元 —
   * primary = GMO コイン API (backend では `gmo-coin`、 webapp 側は既存互換で `gmo` も accept)、
   * fallback = CoinGecko、
   * mock = Issue #3061、 USE_SPOT_RATE_MOCK=true 時の dev 固定 rate 応答 (badge 表示 trigger)
   */
  source: 'gmo' | 'gmo-coin' | 'coingecko' | 'mock';
  /** cache 生成時刻 (ISO string) */
  cachedAt: string;
  /** cache 失効時刻 (ISO string) */
  expiresAt: string;
};

/** hook option */
export type UseSpotRateOptions = {
  /** polling 間隔 (ms)、 default 15000 = 15 秒 */
  refetchInterval?: number;
  /** query を発火させるか、 default true */
  enabled?: boolean;
  /** test 用 injectable fetcher */
  fetcher?: () => Promise<SpotRate>;
};

/**
 * spot-rate endpoint URL を env source から解決する pure helper (Issue #3065)。
 *
 * env 優先順 —
 * (1) VITE_GMO_API_ENDPOINT_SPOT_RATE = spot-rate independent server (port 42070、 Ponder 非依存)
 * (2) VITE_GMO_API_ENDPOINT = 旧 niji-api (port 42069、 Ponder + Hono) の fallback、 互換性維持
 * (3) 未設定 = 同一 origin (空 prefix、 Vite proxy 前提)
 *
 * 空白のみの env 値 (`'   '`) は未設定扱い、 trailing slash は正規化する。
 * 引数 envSource は test で差替可能に、 default は `import.meta.env`。
 */
export const resolveSpotRateEndpoint = (
  envSource: Record<string, string | undefined> = ((): Record<string, string | undefined> => {
    if (typeof import.meta === 'undefined') return {};
    const env = (import.meta as { env?: Record<string, string | undefined> }).env;
    return env ?? {};
  })(),
): string => {
  const spotRateEndpoint = envSource['VITE_GMO_API_ENDPOINT_SPOT_RATE'];
  const legacyEndpoint = envSource['VITE_GMO_API_ENDPOINT'];
  const preferred =
    typeof spotRateEndpoint === 'string' && spotRateEndpoint.trim() !== ''
      ? spotRateEndpoint
      : typeof legacyEndpoint === 'string' && legacyEndpoint.trim() !== ''
        ? legacyEndpoint
        : '';
  return preferred.replace(/\/$/, '');
};

/**
 * default fetcher = env 経由で /api/v1/spot-rate/eth-jpy を GET (Issue #3065)。
 *
 * dev では VITE_GMO_API_ENDPOINT_SPOT_RATE の 42070 を叩くことで Ponder indexer の
 * historical sync 完了待ち (10-30 秒〜数分) を回避、 user 実機の「レート取得クルクル継続」
 * 症状を即応答で解消する (Issue #3065 root cause)。
 */
export const defaultSpotRateFetcher = async (): Promise<SpotRate> => {
  const base = resolveSpotRateEndpoint();
  const url = `${base}/api/v1/spot-rate/eth-jpy`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    const err = (await response.json().catch(() => ({ error: 'InternalError' }))) as {
      error?: string;
      message?: string;
    };
    throw new Error(`spot rate fetch failed: ${err.error ?? 'unknown'} — ${err.message ?? ''}`);
  }
  return (await response.json()) as SpotRate;
};

/**
 * ETH/JPY spot rate polling hook。 15 秒 polling が default、 test は refetchInterval=0 で
 * polling 抑止 + fetcher option で mock 差替可能。
 */
export const useSpotRate = (options: UseSpotRateOptions = {}) => {
  const { refetchInterval = 15000, enabled = true, fetcher = defaultSpotRateFetcher } = options;

  const query = useQuery<SpotRate, Error>({
    queryKey: ['fiat-bid', 'spot-rate', 'eth-jpy'],
    queryFn: fetcher,
    refetchInterval: refetchInterval > 0 ? refetchInterval : false,
    enabled,
    staleTime: refetchInterval > 0 ? refetchInterval : 0,
  });

  return {
    rate: query.data?.rate,
    source: query.data?.source,
    cachedAt: query.data?.cachedAt,
    expiresAt: query.data?.expiresAt,
    isLoading: query.isLoading,
    error: query.error ?? undefined,
    refetch: query.refetch,
  };
};

/**
 * JPY 額 → ETH wei 換算 helper (client-side 表示用のみ、 契約上の rate は backend 側で bind)
 * rate = 1 ETH あたりの JPY 額、 jpy = user 入力 JPY 額、 return = wei (bigint)
 *
 * 後方互換のため残置 (Issue #3051 で ETH 入力軸に反転後も、 topup 経路の旧 JPY 額 → ETH wei 換算等で参照)。
 */
export const jpyToEthWei = (jpy: number, rate: number): bigint => {
  if (!Number.isFinite(jpy) || jpy <= 0 || !Number.isFinite(rate) || rate <= 0) {
    return 0n;
  }
  // wei = jpy / rate * 10^18
  // 小数を避けるため、 (jpy * 10^18) / rate で計算 (誤差は表示用 helper なので許容範囲内)
  const scale = 1_000_000_000_000_000_000n;
  return (BigInt(Math.floor(jpy)) * scale) / BigInt(Math.floor(rate));
};

/**
 * ETH 額 → JPY 換算 helper (client-side 表示用のみ、 GMO 与信枠請求時の JPY 額は backend 側で再換算)
 * ethAmount = user 入力 ETH 額 (float、 例 0.05)、 jpyPerEth = 1 ETH あたりの JPY 額 (spot rate)、
 * return = 小数以下四捨五入した JPY 額 (integer)。
 *
 * Issue #3051 で入力軸 ETH 反転に伴い新規追加。
 * FiatBidForm では ETH 入力 → 本 helper で JPY 換算 → 「JPY 換算 = 約 X 円」 inline 表示、
 * validation でも本 helper 経由で 100 万円上限 check を行う。
 */
export const ethToJpy = (ethAmount: number, jpyPerEth: number): number => {
  if (
    !Number.isFinite(ethAmount) ||
    ethAmount <= 0 ||
    !Number.isFinite(jpyPerEth) ||
    jpyPerEth <= 0
  ) {
    return 0;
  }
  return Math.round(ethAmount * jpyPerEth);
};

/**
 * ETH 額 (string) → wei (bigint) 換算 helper (viem parseEther 相当の精度)。
 * user 入力 raw string を parse する経路、 float 変換を経由しないため 0.1 → 1e17 wei が誤差なく成立する。
 *
 * Issue #3051 で入力軸 ETH 反転に伴い新規追加。
 * backend request の ethAmount field (wei string) 生成、 表示用 formatEthFromWei との pair で使う。
 *
 * 入力形式 = 「数字 (+ optional の '.' + 数字)」、 それ以外 (負数 / e 表記 / 空文字 / NaN 相当 / 型不正) は 0n を返す。
 */
export const ethToWei = (ethAmount: string | number): bigint => {
  const raw = typeof ethAmount === 'number' ? ethAmount.toString() : ethAmount;
  if (typeof raw !== 'string' || raw.trim() === '') {
    return 0n;
  }
  const trimmed = raw.trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    return 0n;
  }
  const [whole = '0', frac = ''] = trimmed.split('.');
  const wholeBig = BigInt(whole);
  const fracPadded = frac.padEnd(18, '0').slice(0, 18);
  const fracBig = fracPadded === '' ? 0n : BigInt(fracPadded);
  const result = wholeBig * 1_000_000_000_000_000_000n + fracBig;
  return result;
};

/**
 * wei → ETH 文字列 (小数 4 桁) helper (表示用)
 */
export const formatEthFromWei = (wei: bigint): string => {
  if (wei === 0n) return '0.0000';
  const scale = 1_000_000_000_000_000_000n;
  const whole = wei / scale;
  const frac = wei % scale;
  // 小数 4 桁分抽出 = frac * 10^4 / 10^18 = frac / 10^14
  const fracDivisor = 100_000_000_000_000n;
  const frac4 = Number(frac / fracDivisor);
  return `${whole.toString()}.${frac4.toString().padStart(4, '0')}`;
};
