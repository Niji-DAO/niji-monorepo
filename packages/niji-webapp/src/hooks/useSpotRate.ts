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
  /** 取得元 (primary = GMO コイン API、 fallback = CoinGecko) */
  source: 'gmo' | 'coingecko';
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
 * default fetcher = env の VITE_NIJI_API_BASE_URL 経由で /api/v1/spot-rate/eth-jpy を GET
 * env 未設定時は同一 origin (Vite proxy 前提)
 */
export const defaultSpotRateFetcher = async (): Promise<SpotRate> => {
  const envValue =
    typeof import.meta !== 'undefined'
      ? (import.meta as { env?: Record<string, string> }).env?.['VITE_NIJI_API_BASE_URL']
      : undefined;
  const apiBase = typeof envValue === 'string' ? envValue : '';
  const url = `${apiBase.replace(/\/$/, '')}/api/v1/spot-rate/eth-jpy`;
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
