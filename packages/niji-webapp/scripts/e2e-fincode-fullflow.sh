#!/usr/bin/env bash
# TC-FB10 / TC-FB10c / TC-FB11 / TC-FB11b / TC-FB20-24 / TC-FB40 の fincode Phase 3 追随 e2e を
# 1 cmd で anvil 起動 → contract deploy → Niji 1 seed → webapp dev server 確認 → test 実行まで通す。
#
# 前提 —
# (1) niji-api の spot-rate server (port 42070) が起動済 (user 側 `pnpm --filter @niji/api dev:spot-rate` or
#     concurrently 経由)、 または global-setup が spawn skip 経路で新規起動する。
# (2) niji-webapp dev server (port 2424) が起動済 (`pnpm --filter @niji/webapp dev:local`)。
#     未起動時は本 script が最終 hint を print する。
#
# 実行 —
#   bash packages/niji-webapp/scripts/e2e-fincode-fullflow.sh
# or
#   pnpm --filter @niji/webapp e2e:fullflow
#
# SSOT — decision-log 2026-07-16-niji-e2e-{fincode-jpy-primary-reversal-full-stack,tc-fb11-and-phase-d-repair,fincode-iframe-scope-shrink}.md
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
WEBAPP_DIR="$REPO_ROOT/packages/niji-webapp"
CONTRACTS_DIR="$REPO_ROOT/packages/niji-contracts"
ANVIL_PORT=8547
WEBAPP_PORT=2424

echo "==> [1/5] anvil 8547 起動確認"
if ! lsof -i ":$ANVIL_PORT" >/dev/null 2>&1; then
  echo "    anvil 未起動、 background 起動する (log: /tmp/niji-e2e-anvil.log)"
  nohup anvil --port "$ANVIL_PORT" --chain-id 31337 --host 127.0.0.1 >/tmp/niji-e2e-anvil.log 2>&1 &
  sleep 2
fi

echo "==> [2/5] contract deploy (Niji 0 auction 開始状態)"
cd "$CONTRACTS_DIR"
NIJI_AUCTION_DURATION=86400 pnpm exec hardhat deploy-niji-full --network localhost >/tmp/niji-e2e-deploy.log 2>&1
echo "    deploy 完了 (log tail):"
tail -3 /tmp/niji-e2e-deploy.log

echo "==> [3/5] Niji 0 → Niji 1 seed (Nijider 枠回避)"
cd "$WEBAPP_DIR"
npx tsx tests/e2e/helpers/seed-niji1.ts

echo "==> [4/5] webapp dev server (port 2424) 起動確認"
if ! lsof -i ":$WEBAPP_PORT" >/dev/null 2>&1; then
  echo "    ERROR: webapp dev server (port $WEBAPP_PORT) が未起動"
  echo "    別 terminal で以下を実行してから再実行:"
  echo "      cd packages/niji-webapp && pnpm dev:local"
  exit 1
fi

echo "==> [5/5] e2e test 実行 (fiat-bid-serial + fiat-bid-parallel)"
SKIP_GLOBAL_SETUP=1 pnpm exec playwright test \
  --project=fiat-bid-serial \
  --project=fiat-bid-parallel \
  --reporter=list
