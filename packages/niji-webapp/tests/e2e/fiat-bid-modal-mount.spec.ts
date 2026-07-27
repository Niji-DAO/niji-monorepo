/**
 * TC-FB11 FiatSettlementModal 統合 test (Modal 直接 mount 経路)
 *
 * fiat-bid.spec.ts § Phase 1 golden path 後半 (旧 test.skip block) を独立 file 化。
 * kiwa fixture 依存なし + anvil chain state 不変のため fiat-bid-parallel project で高速並列実行、
 * fiat-bid-serial (workers=1、 serial 実行) の overhead を回避する。
 *
 * scope —
 * 「auction settle 時に fiat winner を判定して FiatSettlementModal を auto-open する」 SettlementWatcher
 * hook は production 経路に未接続 (別 Phase の scope)。 本 test は `/test/fiat-settlement-modal`
 * (isDev gate、 App.tsx 内 route) 経由で Modal を直接 mount し、 capture → transfer chain + stepper
 * 進行 + success 表示 + txHash 表示の統合を verify する。 dashboard NFT 保有 verify は
 * SettlementWatcher activate 後の scope で defer。
 *
 * page.route mock で capture / transfer endpoint を stub、 backend 起動不要で verify 完結。
 */
import { expect, test } from '@playwright/test';

test.describe('TC-FB11 FiatSettlementModal 統合 test (Modal 直接 mount 経路)', () => {
  test('TC-FB11 test route mount → capture mock 200 → transfer mock 200 → success + txHash 表示', async ({
    page,
  }) => {
    test.setTimeout(60_000);

    const authId = 'e2e-tc-fb11-auth';
    const auctionId = '1';
    const jpyAmount = 10_000;
    const mockTxHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';

    // capture endpoint mock (POST /api/v1/fiat-bid/capture → 200 { status: 'captured' })
    await page.route('**/api/v1/fiat-bid/capture', async route => {
      const body = { authId, status: 'captured', message: 'mock capture success' };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    });

    // transfer endpoint mock (POST /api/v1/fiat-bid/transfer → 200 { status: 'transferred', txHash })
    await page.route('**/api/v1/fiat-bid/transfer', async route => {
      const body = {
        authId,
        status: 'transferred',
        txHash: mockTxHash,
        message: 'mock transfer success',
      };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    });

    // test-only route (isDev gate) 経由で Modal を直接 mount
    await page.goto(
      `/test/fiat-settlement-modal?authId=${encodeURIComponent(authId)}&auctionId=${auctionId}&jpyAmount=${jpyAmount}`,
      { waitUntil: 'domcontentloaded' },
    );
    await expect(page.getByTestId('test-fiat-settlement-page')).toBeVisible({ timeout: 10_000 });

    // Modal 描画確認 (open=true default で mount 直後に表示)
    await expect(page.getByRole('heading', { name: '落札されました', exact: true })).toBeVisible({
      timeout: 5_000,
    });
    await expect(page.getByText(`Niji #${auctionId}`).first()).toBeVisible();
    await expect(page.getByText(`¥${jpyAmount.toLocaleString()}`)).toBeVisible();

    // 「クレカ決済を確定します」 button click → settleAndTransfer chain 発火
    const confirmButton = page.getByTestId('fiat-settlement-confirm');
    await expect(confirmButton).toBeEnabled({ timeout: 5_000 });
    await confirmButton.click();

    // step 遷移 = capturing → transferring → success の順、
    // step-indicator が最終的に 'success' 相当 = 「NFT を送付しました」 表示
    // (stepper 中間状態は fetch mock 即応で瞬間遷移するため終端状態のみを assert)
    await expect(page.getByTestId('fiat-settlement-step-indicator')).toContainText(
      'NFT を送付しました',
      { timeout: 15_000 },
    );

    // txHash 表示 = transfer response の txHash が UI に render される
    const txHashDisplay = page.getByTestId('fiat-settlement-txhash');
    await expect(txHashDisplay).toBeVisible();
    await expect(txHashDisplay).toContainText(mockTxHash);

    // 完了状態で 「閉じる」 button に切替
    await expect(page.getByTestId('fiat-settlement-close')).toBeVisible();
  });

  test('TC-FB11b capture 5xx error path → failure step + error message 表示 + retry button', async ({
    page,
  }) => {
    test.setTimeout(60_000);

    const authId = 'e2e-tc-fb11b-auth';

    // capture endpoint を 500 error で mock (backend fail path)
    await page.route('**/api/v1/fiat-bid/capture', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'GmoCaptureError', message: 'GMO capture upstream fail' }),
      });
    });

    await page.goto(
      `/test/fiat-settlement-modal?authId=${encodeURIComponent(authId)}&auctionId=2&jpyAmount=20000`,
      { waitUntil: 'domcontentloaded' },
    );
    await expect(page.getByTestId('test-fiat-settlement-page')).toBeVisible({ timeout: 10_000 });
    await page.getByTestId('fiat-settlement-confirm').click();

    // failure step で「決済または転送に失敗しました」 表示
    await expect(page.getByTestId('fiat-settlement-step-indicator')).toContainText(
      '決済または転送に失敗しました',
      { timeout: 15_000 },
    );

    // error message に GmoCaptureError が含まれる
    const errorBox = page.getByTestId('fiat-settlement-error');
    await expect(errorBox).toBeVisible();
    await expect(errorBox).toContainText('GmoCaptureError');

    // retry button に切替 (再試行経路が提示される)
    await expect(page.getByTestId('fiat-settlement-retry')).toBeVisible();
  });
});
