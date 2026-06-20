/**
 * Phase A - Faucet UX e2e
 * spec ... tests/spec/e2e/test-spec-phase-a-ux.ja.md § Faucet
 */
import { expect } from '@playwright/test';
import { dappE2eTest as test } from '@kiwa-test/core';

const ANVIL = 'http://127.0.0.1:8547';

async function rpc(method: string, params: unknown[] = []) {
  const res = await fetch(ANVIL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  return (await res.json()) as { result?: unknown };
}

test.describe('Faucet (anvil 31337 dev tool)', () => {
  test('FC-001 正常系: /faucet が描画される', async ({ page }) => {
    await page.goto('/faucet', { waitUntil: 'domcontentloaded' });
    await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });
    await expect(page.getByRole('heading', { name: /Anvil Faucet/i })).toBeVisible();
    await expect(page.getByText(/1\..*ETH を送付/)).toBeVisible();
    await expect(page.getByText(/2\..*Anvil 標準アカウント/)).toBeVisible();
  });

  test('FC-002 UI feature: anvil accounts 一覧が balance 表示', async ({ page }) => {
    await page.goto('/faucet', { waitUntil: 'domcontentloaded' });
    await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });
    // balance polling 1 周期 (5s) 待ち
    await page.waitForTimeout(6_000);
    // 10 行 (account #0 〜 #9) が一覧表に並ぶ
    const rowCount = await page.locator('table tbody tr').count();
    expect(rowCount).toBeGreaterThanOrEqual(10);
    // balance 列に '—' でない数値が出ているか (少なくとも 1 行は balance fetch 成功)
    const balanceCells = await page.locator('table tbody td').last().allTextContents();
    // table の各行末尾の balance 列
    const allBalances = await page.locator('table tbody tr td:last-child').allTextContents();
    const numericBalances = allBalances.filter(t => /^[0-9]+\.[0-9]+$/.test(t.trim()));
    expect(numericBalances.length).toBeGreaterThanOrEqual(5);
    // unused variable warning suppression
    void balanceCells;
  });

  test('FC-003 正常系: ETH を送ると anvil chain 上の残高が増える', async ({ page }) => {
    // 事前残高を取る
    const target = '0x90F79bf6EB2c4f870365E785982E1f101E93b906'; // anvil #3
    const beforeRaw = (await rpc('eth_getBalance', [target, 'latest'])) as { result?: string };
    const beforeWei = BigInt(beforeRaw.result ?? '0x0');

    await page.goto('/faucet', { waitUntil: 'domcontentloaded' });
    await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });
    // 送付先 input に address を入力 (placeholder=0x...)
    const addressInput = page.locator('input[placeholder="0x..."]').first();
    await addressInput.waitFor({ timeout: 5_000 });
    await addressInput.fill(target);
    // 送付額 (default 100) を 50 に変更
    const amountInputs = page.locator('input[inputmode="decimal"]');
    await amountInputs.first().fill('50');
    // 送る button
    await page.getByRole('button', { name: /ETH を送る/ }).click();
    // tx 完了 toast 待ち + anvil_mine 後 chain state 反映待ち
    await page.waitForTimeout(3_000);

    const afterRaw = (await rpc('eth_getBalance', [target, 'latest'])) as { result?: string };
    const afterWei = BigInt(afterRaw.result ?? '0x0');
    const diff = afterWei - beforeWei;
    // 50 ETH = 50 * 10^18 wei
    expect(diff).toBe(50n * 10n ** 18n);
  });

  test('FC-004 異常系: 不正 address で error toast', async ({ page }) => {
    await page.goto('/faucet', { waitUntil: 'domcontentloaded' });
    await page.locator('img[alt="Niji DAO"]').first().waitFor({ timeout: 20_000 });
    const addressInput = page.locator('input[placeholder="0x..."]').first();
    await addressInput.fill('0xNOT_VALID');
    await page.getByRole('button', { name: /ETH を送る/ }).click();
    // sonner toast (role="status") に error message
    await expect(page.getByText(/送付先 address が不正です/)).toBeVisible({ timeout: 5_000 });
  });
});
