/**
 * FiatBidForm behavior test (Issue #3053、 決済 UI 磨き込み 3 fix)
 *
 * Phase B — spot rate 取得中の spinner + 「取得中」 表示検証。
 * spot rate 未取得 (rate === undefined) 状態で、
 * (1) 現在 spot rate 欄に spinner + 「取得中」 表示
 * (2) JPY 換算欄の spinner は Issue #3059 で条件変更 —「ETH 入力あり + spot rate 未取得」 に限定、
 *     ETH 未入力時は「—」 表示 (spinner 出ない)
 * (3) rateSummary root に aria-busy="true" が付与される
 *
 * Phase A の 2 column card layout は CSS module 経路の変更 (visual)、
 * 挙動 test で覆う対象は「取得済 branch で spot rate 値 + JPY 換算値が
 * それぞれ rateSummaryValue class 系 element に表示される」 の 1 点。
 *
 * Issue #3059 追加 test —
 * (4) ETH 未入力 + spot rate 未取得 → JPY 換算欄「—」 表示、 spinner 非表示
 * (5) ETH 入力あり + spot rate 未取得 → JPY 換算欄 spinner + 「取得中」 表示
 */

import type { AuthorizeRequest, AuthorizeResponse } from '@/hooks/useFiatBid';
import type { SpotRate } from '@/hooks/useSpotRate';

import * as React from 'react';

import { readFileSync } from 'node:fs';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TooltipProvider } from '@/components/ui/tooltip';

import { FiatBidForm } from './FiatBidForm';

/**
 * fincode SDK mock —
 * submit 経路は tokenize (外部 SDK) を必ず通るため、 mock しないと jsdom では
 * 「fincode SDK 未初期化」 で authorize 前に止まり、 実行後 state (処理中 / 失敗) を検証できない。
 * window.Fincode を set 済にして preloadFincodeScript を即 resolve させ、
 * tokens() は成功 callback に固定 token を返す。
 */
vi.mock('@fincode/js', () => ({
  initFincode: () =>
    Promise.resolve({
      tokens: (_params: unknown, onSuccess: (status: number, response: unknown) => void): void => {
        onSuccess(200, { list: [{ token: 'tok_unit_test' }] });
      },
    }),
}));

beforeEach(() => {
  (window as unknown as { Fincode?: unknown }).Fincode = {};
  vi.stubEnv('VITE_FINCODE_PUBLIC_KEY', 'pk_test_unit');
});

const buildWrapper = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>
      <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
    </QueryClientProvider>
  );
  Wrapper.displayName = 'FiatBidFormTestWrapper';
  return Wrapper;
};

const successRate: SpotRate = {
  rate: 500_000,
  source: 'gmo',
  cachedAt: '2026-07-01T00:00:00.000Z',
  expiresAt: '2026-07-01T00:00:05.000Z',
};

describe('FiatBidForm loading spinner (Issue #3053 Phase B、 Issue #3059 で JPY 側条件更新)', () => {
  it('spot rate 未取得 + JPY 未入力時 → spot rate 欄は spinner 表示、 ETH 換算欄は「—」 (spinner 非表示、 Issue #3059)', () => {
    // spot rate fetcher = pending Promise (never resolve) で undefined 保持
    const pendingFetcher = vi.fn(() => new Promise<SpotRate>(() => {}));

    render(
      <FiatBidForm
        onClose={() => {}}
        auctionId="42"
        bidderWallet="0xUSER"
        fetchersOverride={{
          fetchers: { authorize: vi.fn(), placeBid: vi.fn() },
          saveState: vi.fn(),
          redirect: vi.fn(),
        }}
        spotRateOverride={{ fetcher: pendingFetcher, refetchInterval: 0 }}
      />,
      { wrapper: buildWrapper() },
    );

    // spot rate 欄の spinner + 「取得中」 (modal open 直後の情報提示、 独立して表示)
    const rateLoading = screen.getByTestId('fiat-bid-rate-summary-loading');
    expect(rateLoading).toBeInTheDocument();
    expect(rateLoading.textContent).toContain('取得中');

    // 2026-07-23 = rate summary card を flat hint に置換した後は、 JPY 未入力 + spot rate 未取得の
    // 「両方無い」 state では ETH display は出ず spot rate 取得中 hint のみ表示される。
    // 旧仕様の「—」 プレースホルダは廃止。
    expect(screen.queryByTestId('fiat-bid-eth-display-loading')).toBeNull();
    expect(screen.queryByTestId('fiat-bid-eth-display')).toBeNull();

    // rateSummary root に aria-busy="true" 付与 (screen reader 対応、 spot rate 側 loading state)
    const rateSummary = screen.getByTestId('fiat-bid-rate-summary');
    expect(rateSummary.getAttribute('aria-busy')).toBe('true');
  });

  it('spot rate 取得後は spinner 非表示、 spot rate 値 + source が rateSummaryValue で表示', async () => {
    const spotFetcher = vi.fn().mockResolvedValue(successRate);

    render(
      <FiatBidForm
        onClose={() => {}}
        auctionId="42"
        bidderWallet="0xUSER"
        fetchersOverride={{
          fetchers: { authorize: vi.fn(), placeBid: vi.fn() },
          saveState: vi.fn(),
          redirect: vi.fn(),
        }}
        spotRateOverride={{ fetcher: spotFetcher, refetchInterval: 0 }}
      />,
      { wrapper: buildWrapper() },
    );

    // spot rate 取得完了まで待機
    await waitFor(() => {
      expect(screen.queryByTestId('fiat-bid-rate-summary-loading')).toBeNull();
    });

    // rateSummary root の aria-busy="false" (取得完了 state)
    const rateSummary = screen.getByTestId('fiat-bid-rate-summary');
    expect(rateSummary.getAttribute('aria-busy')).toBe('false');

    // 2026-07-23 = rate summary card を flat hint に置換した後は「1 ETH = 500,000 円」 の form 単一 hint。
    expect(rateSummary.textContent).toContain('500,000');
    expect(rateSummary.textContent).toContain('1 ETH');
    expect(rateSummary.textContent).toContain('円');
    // source ラベル (「source: XXX」) は user 判断に不要なため撤去済 (2026-07-23 directive)
    expect(rateSummary.textContent).not.toContain('source: ');

    // JPY 未入力時は ETH display 非表示 (JPY hint に単一 rate line として吸収)
    expect(screen.queryByTestId('fiat-bid-eth-display-loading')).toBeNull();
    expect(screen.getByTestId('fiat-bid-eth-display').textContent).toContain('1 ETH');
  });

  it('spot rate 未取得 + JPY 入力あり → ETH 換算欄で spinner + 「取得中」 表示 (Issue #3059)', () => {
    // spot rate fetcher = pending Promise (never resolve)、 rate === undefined 保持
    const pendingFetcher = vi.fn(() => new Promise<SpotRate>(() => {}));

    render(
      <FiatBidForm
        onClose={() => {}}
        auctionId="42"
        bidderWallet="0xUSER"
        fetchersOverride={{
          fetchers: { authorize: vi.fn(), placeBid: vi.fn() },
          saveState: vi.fn(),
          redirect: vi.fn(),
        }}
        spotRateOverride={{ fetcher: pendingFetcher, refetchInterval: 0 }}
      />,
      { wrapper: buildWrapper() },
    );

    // JPY 入力を発火 (validation NG でも jpyRaw に値が入っていれば spinner 判定 trigger)
    const jpyInput = screen.getByTestId('fiat-bid-jpy-input');
    fireEvent.change(jpyInput, { target: { value: '25000' } });

    // ETH 換算欄で spinner + 「取得中」 表示 (JPY 入力あり + spot rate 未取得 branch)
    const ethLoading = screen.getByTestId('fiat-bid-eth-display-loading');
    expect(ethLoading).toBeInTheDocument();
    expect(ethLoading.textContent).toContain('取得中');
  });
});

/**
 * Issue #3061 — source='mock' 時の「dev mock」 badge 表示検証
 *
 * (1) source='mock' → 「dev mock」 badge が表示され、 「source: XXX」 の inline 表示は出ない
 * (2) source='gmo-coin' → badge 非表示、 「source: gmo-coin」 の inline 表示が出る (regression 確認)
 * (3) source='gmo' (旧互換) → badge 非表示、 「source: gmo」 の inline 表示が出る (regression 確認)
 * (4) source='coingecko' → badge 非表示、 「source: coingecko」 の inline 表示が出る (regression 確認)
 */
describe('FiatBidForm mock badge (Issue #3061)', () => {
  const buildMockRate = (source: SpotRate['source']): SpotRate => ({
    rate: 500_000,
    source,
    cachedAt: '2026-07-03T00:00:00.000Z',
    expiresAt: '2026-07-03T00:00:05.000Z',
  });

  const renderWithSource = (source: SpotRate['source']) => {
    const fetcher = vi.fn().mockResolvedValue(buildMockRate(source));
    render(
      <FiatBidForm
        onClose={() => {}}
        auctionId="42"
        bidderWallet="0xUSER"
        fetchersOverride={{
          fetchers: { authorize: vi.fn(), placeBid: vi.fn() },
          saveState: vi.fn(),
          redirect: vi.fn(),
        }}
        spotRateOverride={{ fetcher, refetchInterval: 0 }}
      />,
      { wrapper: buildWrapper() },
    );
  };

  it('source=mock 時に「dev mock」 badge が表示される', async () => {
    renderWithSource('mock');

    // spot rate 取得完了まで待機
    await waitFor(() => {
      expect(screen.queryByTestId('fiat-bid-rate-summary-loading')).toBeNull();
    });

    const badge = screen.getByTestId('fiat-bid-rate-summary-mock-badge');
    expect(badge).toBeInTheDocument();
    expect(badge.textContent).toBe('dev mock');

    // 「source: mock」 の inline 表示は出ない (badge と重複しない)
    const rateSummary = screen.getByTestId('fiat-bid-rate-summary');
    expect(rateSummary.textContent).not.toContain('source: mock');
  });

  it('source=gmo-coin 時は badge 非表示 + rate 単一 hint 表示 (2026-07-23 でラベル撤去)', async () => {
    renderWithSource('gmo-coin');

    await waitFor(() => {
      expect(screen.queryByTestId('fiat-bid-rate-summary-loading')).toBeNull();
    });

    expect(screen.queryByTestId('fiat-bid-rate-summary-mock-badge')).toBeNull();
    const rateSummary = screen.getByTestId('fiat-bid-rate-summary');
    // 2026-07-23 = 「source: XXX」 表示は user 判断に不要のため撤去済
    expect(rateSummary.textContent).not.toContain('source: gmo-coin');
    expect(rateSummary.textContent).toContain('1 ETH = 500,000 円');
  });

  it('source=gmo (旧互換) 時は badge 非表示 + rate 単一 hint 表示 (regression)', async () => {
    renderWithSource('gmo');

    await waitFor(() => {
      expect(screen.queryByTestId('fiat-bid-rate-summary-loading')).toBeNull();
    });

    expect(screen.queryByTestId('fiat-bid-rate-summary-mock-badge')).toBeNull();
    const rateSummary = screen.getByTestId('fiat-bid-rate-summary');
    expect(rateSummary.textContent).not.toContain('source: gmo');
    expect(rateSummary.textContent).toContain('1 ETH = 500,000 円');
  });

  it('source=coingecko 時は badge 非表示 + rate 単一 hint 表示 (regression)', async () => {
    renderWithSource('coingecko');

    await waitFor(() => {
      expect(screen.queryByTestId('fiat-bid-rate-summary-loading')).toBeNull();
    });

    expect(screen.queryByTestId('fiat-bid-rate-summary-mock-badge')).toBeNull();
    const rateSummary = screen.getByTestId('fiat-bid-rate-summary');
    expect(rateSummary.textContent).not.toContain('source: coingecko');
    expect(rateSummary.textContent).toContain('1 ETH = 500,000 円');
  });
});

/**
 * FiatBidForm の classes.X 参照と実 CSS 定義の整合 — silent breakage 回帰
 *
 * success view の説明文で ETH 側 BidModal の class 名 .minBidCopy を誤参照し、 fiat module に
 * 実在しない (正は .formHint) ため production の vite build で undefined = 無 class = unstyled +
 * palette 連動漏れになる silent breakage が起きた。 型 (CSS module key が緩い) / build /
 * data-testid ベースの既存 test を通り抜け、 更に vitest の CSS module は lenient proxy (未定義
 * key でも _key_hash を返す) ため classes.xxx の undefined 判定でも検出できない。 そこで JSX が
 * 参照する classes.X を全抽出し、 実 CSS ファイルの class 定義と照合して「存在しない class 参照」
 * を網羅検出する (vitest proxy を迂回した静的照合、 success view に限らず component 全体を cover)。
 */
describe('FiatBidForm の CSS class 参照整合 (silent breakage 回帰)', () => {
  it('JSX が参照する classes.X が全て実 CSS に定義されている (未定義参照ゼロ)', () => {
    // vitest の cwd は package root (webapp) のため cwd 相対で実 file を読む。
    // import.meta.url は vite 変換で file: scheme にならず new URL が失敗するため使わない。
    const dir = 'src/components/FiatBidModal';
    const tsxSource = readFileSync(`${dir}/FiatBidForm.tsx`, 'utf-8');
    const cssSource = readFileSync(`${dir}/FiatBidForm.module.css`, 'utf-8');

    // JSX の classes.foo ドット参照を全抽出 (コメント内の言及も含むが CSS 実在なら無害)。
    const referenced = new Set([...tsxSource.matchAll(/\bclasses\.([A-Za-z]\w*)/g)].map(m => m[1]));
    // CSS の .foo selector を全抽出 (.form[data-palette] や .foo:focus も foo を拾う、
    // 0.2s / #fff / .5rem 等は . の直後が非英字なので除外される)。
    const defined = new Set([...cssSource.matchAll(/\.([A-Za-z][\w-]*)/g)].map(m => m[1]));

    // regex が classes.X を実抽出できている保証 (referenced が空だと missing 判定が false green 化)。
    expect(referenced.size).toBeGreaterThan(0);
    // 過去に success view が classes.minBidCopy (ETH 側 class 名) を誤参照して missing 入りした。
    const missing = [...referenced].filter(name => !defined.has(name));
    expect(missing).toEqual([]);
  });
});

/**
 * 入札金額 field の error 提示 (決済 UI 磨き込み、 実レンダリング評価で検出)
 *
 * 従来 —
 * (1) 下限未満を入力すると、 赤字 error「minimum bid X 円以上を入力してください」 の直下に
 *     灰字 hint「minimum bid — ¥ X 以上」 が並び、 同じ情報が 2 行重複していた。
 * (2) error 時も入力欄の見た目が変わらず (borderless white のまま)、 どの欄が原因か
 *     視線で辿れず、 支援技術にも invalid が伝わらなかった。
 *
 * 変更後 —
 * (1) 下限は label 行の右端 (data-testid=fiat-bid-min-bid-copy) に常時 1 箇所だけ出す。
 * (2) 下限未満のとき input に aria-invalid=true + aria-describedby=error id を付ける
 *     (CSS 側は [aria-invalid='true'] で赤 ring を出す)。
 */
describe('FiatBidForm 金額 error の提示 (重複排除 + invalid 明示)', () => {
  const renderForm = () =>
    render(
      <FiatBidForm
        onClose={() => {}}
        auctionId="42"
        bidderWallet="0xUSER"
        minBidEth={0.001}
        fetchersOverride={{
          fetchers: { authorize: vi.fn(), placeBid: vi.fn() },
          saveState: vi.fn(),
          redirect: vi.fn(),
        }}
        spotRateOverride={{ fetcher: vi.fn().mockResolvedValue(successRate), refetchInterval: 0 }}
      />,
      { wrapper: buildWrapper() },
    );

  it('下限未満入力時は下限 hint を隠し、 error と同内容が 2 行並ばない', async () => {
    renderForm();
    await waitFor(() => {
      expect(screen.getByTestId('fiat-bid-min-bid-copy')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('fiat-bid-jpy-input'), { target: { value: '1' } });

    // error は出る
    expect(screen.getByTestId('fiat-bid-jpy-error').textContent).toContain('minimum bid');
    // error 表示中は下限 hint を隠す。 旧実装では赤 error と灰 hint が同内容で縦に 2 行並んでいた
    expect(screen.queryByTestId('fiat-bid-min-bid-copy')).toBeNull();

    // error が解消したら下限 hint は戻る (常時消えるわけではない)
    fireEvent.change(screen.getByTestId('fiat-bid-jpy-input'), { target: { value: '50000' } });
    expect(screen.getAllByTestId('fiat-bid-min-bid-copy')).toHaveLength(1);
  });

  it('下限未満で aria-invalid=true + aria-describedby が error 要素を指す', async () => {
    renderForm();
    await waitFor(() => {
      expect(screen.getByTestId('fiat-bid-min-bid-copy')).toBeInTheDocument();
    });

    const input = screen.getByTestId('fiat-bid-jpy-input');
    fireEvent.change(input, { target: { value: '1' } });

    expect(input.getAttribute('aria-invalid')).toBe('true');
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).not.toBeNull();
    expect(document.getElementById(describedBy!)).toBe(screen.getByTestId('fiat-bid-jpy-error'));
  });

  it('下限以上を入力すると aria-invalid が false に戻り error 要素が消える', async () => {
    renderForm();
    await waitFor(() => {
      expect(screen.getByTestId('fiat-bid-min-bid-copy')).toBeInTheDocument();
    });

    const input = screen.getByTestId('fiat-bid-jpy-input');
    fireEvent.change(input, { target: { value: '1' } });
    expect(input.getAttribute('aria-invalid')).toBe('true');

    fireEvent.change(input, { target: { value: '50000' } });
    expect(input.getAttribute('aria-invalid')).toBe('false');
    expect(screen.queryByTestId('fiat-bid-jpy-error')).toBeNull();
    expect(input.getAttribute('aria-describedby')).toBeNull();
  });
});

/**
 * 入札実行後 (処理中 / 失敗 / 完了) の状態提示
 *
 * 実レンダリングで検出した 4 点の回帰を固定する。
 * (1) 通信中は handleCancel が early return するのに cancel が押せる見た目のままだった
 * (2) 失敗が stepper (薄字) と error 文 (赤字) の 2 箇所に割れ、 しかも stepper の failure 表現が
 *     idle と同じ最も弱い見た目だった
 * (3) 進行中の現在地 (3 段中どこか) が分からなかった
 * (4) 完了 view に閉じる手段が無く、 自動で閉じるまで待つしかない行き止まりだった
 *
 * 通信は fetchersOverride で差替え、 authorize を never-resolve / reject に振って
 * 実際の state 機械 (idle → authorizing → ...) を通す。
 */
describe('FiatBidForm 入札実行後の状態提示', () => {
  const renderWithAuthorize = (
    authorize: (body: AuthorizeRequest) => Promise<AuthorizeResponse>,
    onClose: () => void = () => {},
  ) =>
    render(
      <FiatBidForm
        onClose={onClose}
        auctionId="42"
        bidderWallet="0xUSER"
        minBidEth={0.001}
        fetchersOverride={{
          fetchers: { authorize, placeBid: vi.fn() },
          saveState: vi.fn(),
          redirect: vi.fn(),
        }}
        spotRateOverride={{ fetcher: vi.fn().mockResolvedValue(successRate), refetchInterval: 0 }}
      />,
      { wrapper: buildWrapper() },
    );

  it('通信中は cancel が disabled になり、 stepper に現在地 (N / 3) が出る', async () => {
    const hang = vi.fn(() => new Promise<AuthorizeResponse>(() => {}));
    renderWithAuthorize(hang);
    await waitFor(() => expect(screen.getByTestId('fiat-bid-min-bid-copy')).toBeInTheDocument());

    // 通信前は cancel は押せる
    expect((screen.getByTestId('fiat-bid-cancel') as HTMLButtonElement).disabled).toBe(false);

    // form 直 submit で authorize 発火 (fincode tokenize 経路は通らない authorize 単体検証)
    const form = screen.getByTestId('fiat-bid-form');
    fireEvent.change(screen.getByTestId('fiat-bid-jpy-input'), { target: { value: '50000' } });
    fireEvent.click(screen.getByTestId('fiat-bid-terms-checkbox'));
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.queryByTestId('fiat-bid-stepper')).toBeInTheDocument();
    });
    expect(screen.getByTestId('fiat-bid-stepper-count').textContent).toContain('1 / 3');
    expect((screen.getByTestId('fiat-bid-cancel') as HTMLButtonElement).disabled).toBe(true);
    // 入力領域は aria-busy で「待ち」 を伝える
    expect(screen.getByTestId('fiat-bid-form').querySelector('[aria-busy="true"]')).not.toBeNull();
  });

  it('失敗時は stepper を出さず error カードに一本化する', async () => {
    const failing = vi
      .fn()
      .mockRejectedValue(new Error('authorize failed: card_declined — 承認されませんでした'));
    renderWithAuthorize(failing);
    await waitFor(() => expect(screen.getByTestId('fiat-bid-min-bid-copy')).toBeInTheDocument());

    fireEvent.change(screen.getByTestId('fiat-bid-jpy-input'), { target: { value: '50000' } });
    fireEvent.click(screen.getByTestId('fiat-bid-terms-checkbox'));
    fireEvent.submit(screen.getByTestId('fiat-bid-form'));

    await waitFor(() => {
      expect(screen.getByTestId('fiat-bid-error-message')).toBeInTheDocument();
    });
    // 旧実装では stepper が「決済確保に失敗しました」 を同時表示して 2 箇所に割れていた
    expect(screen.queryByTestId('fiat-bid-stepper')).toBeNull();
    const errorBox = screen.getByTestId('fiat-bid-error-message');
    expect(errorBox.getAttribute('role')).toBe('alert');
    // user 向け文だけを表示 (API 識別子と "authorize failed: " prefix は非表示、 2026-07-23 directive)
    expect(errorBox.textContent).toContain('承認されませんでした');
    expect(errorBox.textContent).not.toContain('card_declined');
    expect(errorBox.textContent).not.toContain('authorize failed');
    // 失敗後は cancel が押せる状態に戻る
    expect((screen.getByTestId('fiat-bid-cancel') as HTMLButtonElement).disabled).toBe(false);
  });
});
