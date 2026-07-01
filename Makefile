# Niji DAO monorepo — local dev orchestration
#
# 1 つの make コマンドで anvil + contract deploy + webapp を並列起動する。
# anvil --state で chain state を .context/dev/anvil-state.json に dump/load し、
# 2 回目以降の make dev は deploy/populate を skip して state load で一瞬復元 (~1 秒)。
# log は .context/dev/ 配下、 PID 管理で停止 / restart も 1 コマンド。
#
# Quickstart:
#   make dev           # anvil (fresh chain) + deploy + auto-settler + webapp を並列起動 (Recommended)
#   make dev-stop      # anvil + auto-settler + webapp を graceful shutdown + state 削除
#   make dev-sepolia   # webapp のみ sepolia mode で bg 起動 (anvil 不要)
#   make dev-fg        # anvil + webapp を foreground 並列起動 (Ctrl+C で同時停止)
#   make dev-status    # 起動状況を確認
#   make dev-logs      # log を tail -f で表示
#   make help          # コマンド一覧表示
#
# make dev-stop && make dev = 常に fresh chain (dev-stop で state 削除するため)。
# 起動中 anvil を残したまま再起動したい場合は make dev-stop を挟まず直接 make dev を実行 (state 残る)。

SHELL := /bin/bash
ROOT := $(shell git rev-parse --show-toplevel 2>/dev/null || pwd)

LOG_DIR := $(ROOT)/.context/dev
ANVIL_LOG := $(LOG_DIR)/anvil.log
WEBAPP_LOG := $(LOG_DIR)/webapp.log
DEPLOY_LOG := $(LOG_DIR)/deploy.log
SETTLER_LOG := $(LOG_DIR)/auto-settler.log
ANVIL_PID := $(LOG_DIR)/anvil.pid
WEBAPP_PID := $(LOG_DIR)/webapp.pid
SETTLER_PID := $(LOG_DIR)/auto-settler.pid
ANVIL_STATE := $(LOG_DIR)/anvil-state.json
# fresh chain snapshot ... make dev-init で 1 回 deploy 済 anvil state を保存、
# make dev-stop && make dev で snapshot を copy して load = 毎回 fresh chain を ~1s で起動する。
# source code (contract / deploy script) 変更後は make dev-refresh で snapshot 再生成が必要。
ANVIL_SNAPSHOT := $(LOG_DIR)/anvil-fresh-snapshot.json

# anvil account #0 の private key (deterministic、 全 dev 共通)
ANVIL_DEPLOYER_PK := 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

WEBAPP_ENV := $(ROOT)/packages/niji-webapp/.env
WEBAPP_ENV_EXAMPLE := $(ROOT)/packages/niji-webapp/.env.example.local

ANVIL_PORT := 8547
WEBAPP_PORT := 2424

.PHONY: help dev dev-init dev-refresh dev-sepolia dev-fg dev-stop dev-status dev-logs setup setup-env install build anvil-bg webapp-bg snapshot-if-needed auto-settler-bg

help:
	@echo "Niji DAO — local dev commands"
	@echo ""
	@echo "  make dev           anvil + snapshot load (~1s) + auto-settler + webapp 並列起動 (Recommended)"
	@echo "  make dev-init      1 回 fresh chain deploy して snapshot 保存 (初回 or 手動再生成用)"
	@echo "  make dev-refresh   snapshot 削除 + dev-init で snapshot 再生成 (contract 変更後)"
	@echo "  make dev-stop      anvil + auto-settler + webapp を graceful shutdown + live state 削除"
	@echo "  make dev-sepolia   webapp のみ sepolia mode で background 起動 (anvil 不要)"
	@echo "  make dev-fg        anvil + webapp を foreground で並列起動 (Ctrl+C で停止)"
	@echo "  make dev-status    起動状況を確認 (PID / port listen / HTTP 応答 / state / snapshot 有無)"
	@echo "  make dev-logs      anvil / deploy / auto-settler / webapp log を tail -f で表示"
	@echo "  make setup         pnpm install + sdk/contracts build + .env 作成"
	@echo "  make help          このヘルプを表示"
	@echo ""
	@echo "  make dev-stop && make dev = 常に fresh chain (snapshot copy で ~1s 起動)"
	@echo "  snapshot 不在時は make dev が自動的に dev-init を呼ぶ"
	@echo ""
	@echo "URL:"
	@echo "  webapp  http://localhost:$(WEBAPP_PORT)"
	@echo "  anvil   http://127.0.0.1:$(ANVIL_PORT) (chain id 31337)"
	@echo ""
	@echo "State:"
	@echo "  live state  $(ANVIL_STATE) (make dev-stop で削除)"
	@echo "  snapshot    $(ANVIL_SNAPSHOT) (make dev-init で生成、 make dev で copy して load)"
	@echo "  make dev-init で 1 回 deploy-niji-full 実行 (~30-60s、 550 image 全 upload)"
	@echo "  以降 make dev = snapshot copy + anvil load で ~1s 起動 (常に fresh chain)"

setup: install build setup-env
	@echo "✅ setup complete. run 'make dev' to start."

install:
	@echo "📦 pnpm install..."
	@cd $(ROOT) && pnpm install

build:
	@echo "🔨 building @niji/contracts + @niji/sdk..."
	@cd $(ROOT) && pnpm --filter @niji/contracts build
	@cd $(ROOT) && pnpm --filter @niji/sdk build

setup-env:
	@if [ ! -f "$(WEBAPP_ENV)" ]; then \
		echo "📝 creating .env from .env.example.local..."; \
		cp "$(WEBAPP_ENV_EXAMPLE)" "$(WEBAPP_ENV)"; \
	else \
		echo "📝 .env already exists, skipping."; \
	fi

$(LOG_DIR):
	@mkdir -p $(LOG_DIR)

# anvil を background 起動。 既存プロセスがあれば再利用。
# --state で chain state を $(ANVIL_STATE) に dump/load (load + 終了時 dump + 5 秒間隔の定期 dump)。
# --block-time 1 で 1 秒間隔の自動 block mining を有効化 (auto-settler が endTime 経過検知 →
# settle tx 送信 → 次 auction 開始 chain が回るために必須、 default の on-demand mining では
# block timestamp が進まず auction endTime に永遠到達しないため)。
# state file が存在すれば deploy 済 contract をそのまま load、 不存在なら fresh chain で起動。
anvil-bg: | $(LOG_DIR)
	@if [ -f "$(ANVIL_PID)" ] && kill -0 $$(cat $(ANVIL_PID)) 2>/dev/null; then \
		echo "🟢 anvil already running (PID $$(cat $(ANVIL_PID)))"; \
	else \
		if [ -f "$(ANVIL_STATE)" ]; then \
			echo "🚀 starting anvil on :$(ANVIL_PORT) (chain 31337, state load from $(ANVIL_STATE), block-time 1s)..."; \
		else \
			echo "🚀 starting anvil on :$(ANVIL_PORT) (chain 31337, fresh state, block-time 1s)..."; \
		fi; \
		nohup anvil --port $(ANVIL_PORT) --chain-id 31337 --host 127.0.0.1 \
			--state "$(ANVIL_STATE)" --state-interval 5 --block-time 1 \
			> "$(ANVIL_LOG)" 2>&1 & \
		echo $$! > "$(ANVIL_PID)"; \
		sleep 1; \
		echo "🟢 anvil started (PID $$(cat $(ANVIL_PID)))"; \
	fi

# snapshot が無ければ dev-init を chain して生成、 有れば live state に copy して load 起動を有効化。
# make dev から呼ばれ、 snapshot copy は 1 file cp なので ~100ms、 以降の anvil --state load は ~1s。
snapshot-if-needed:
	@if [ ! -f "$(ANVIL_SNAPSHOT)" ] || [ ! -s "$(ANVIL_SNAPSHOT)" ]; then \
		echo "📦 snapshot 未生成、 make dev-init を実行して初回 deploy + snapshot 保存 (~30-60s)..."; \
		$(MAKE) --no-print-directory dev-init; \
	fi
	@if [ ! -f "$(ANVIL_STATE)" ] || [ ! -s "$(ANVIL_STATE)" ]; then \
		cp "$(ANVIL_SNAPSHOT)" "$(ANVIL_STATE)"; \
		SNAP_SIZE=$$(du -h "$(ANVIL_SNAPSHOT)" | cut -f1); \
		echo "📦 snapshot copied to live state ($$SNAP_SIZE) → anvil load 準備完了"; \
	else \
		echo "✅ live state already exists, skipping snapshot copy"; \
	fi

# anvil-auto-settler を background 起動 (5 秒 polling で auction を自動 settle)。
# Nouns contract は自動 progress 機構を持たず、 dev では誰も settle tx を打たないため
# auction の endTime が来ても次 auction が始まらない。 本 script で off-chain ループ補完。
auto-settler-bg: | $(LOG_DIR)
	@if [ -f "$(SETTLER_PID)" ] && kill -0 $$(cat $(SETTLER_PID)) 2>/dev/null; then \
		echo "🟢 auto-settler already running (PID $$(cat $(SETTLER_PID)))"; \
	else \
		echo "🚀 starting auto-settler (5s poll, auto-settle auction on endTime)..."; \
		cd $(ROOT) && DEPLOYER_PK=$(ANVIL_DEPLOYER_PK) ANVIL_RPC=http://127.0.0.1:$(ANVIL_PORT) \
			nohup pnpm -w exec tsx packages/niji-contracts/scripts/anvil-auto-settler.ts \
			> "$(SETTLER_LOG)" 2>&1 & \
		echo $$! > "$(SETTLER_PID)"; \
		sleep 1; \
		echo "🟢 auto-settler started (PID $$(cat $(SETTLER_PID)))"; \
	fi

# webapp を background 起動。 既存プロセスがあれば再利用。
webapp-bg: | $(LOG_DIR)
	@if [ -f "$(WEBAPP_PID)" ] && kill -0 $$(cat $(WEBAPP_PID)) 2>/dev/null; then \
		echo "🟢 webapp already running (PID $$(cat $(WEBAPP_PID)))"; \
	else \
		echo "🚀 starting webapp on :$(WEBAPP_PORT)..."; \
		cd $(ROOT) && nohup pnpm --filter @niji/webapp dev \
			> "$(WEBAPP_LOG)" 2>&1 & \
		echo $$! > "$(WEBAPP_PID)"; \
		sleep 3; \
		echo "🟢 webapp started (PID $$(cat $(WEBAPP_PID)))"; \
	fi

# make dev = snapshot copy (~100ms) + anvil load (~1s) + auto-settler + webapp。
# snapshot は事前に make dev-init で 1 回作成、 以降 make dev-stop && make dev で常に fresh chain を ~1s で復元。
dev: setup-env snapshot-if-needed anvil-bg auto-settler-bg webapp-bg
	@echo ""
	@echo "✅ dev environment ready (snapshot load、 常に fresh chain)."
	@echo ""
	@echo "  webapp        http://localhost:$(WEBAPP_PORT)"
	@echo "  anvil         http://127.0.0.1:$(ANVIL_PORT) (chain 31337)"
	@echo "  auto-settler  🤖 5s polling, next auction starts automatically on endTime"
	@if [ -f "$(ANVIL_STATE)" ]; then \
		echo "  live state    $(ANVIL_STATE) ($$(du -h $(ANVIL_STATE) | cut -f1))"; \
	fi
	@if [ -f "$(ANVIL_SNAPSHOT)" ]; then \
		echo "  snapshot      $(ANVIL_SNAPSHOT) ($$(du -h $(ANVIL_SNAPSHOT) | cut -f1))"; \
	fi
	@echo ""
	@echo "  make dev-logs    to tail logs"
	@echo "  make dev-status  to check health"
	@echo "  make dev-stop    to stop all"

# 1 回だけ fresh chain で deploy-niji-full を実行して anvil state を snapshot として保存。
# make dev で自動的に snapshot が呼ばれるので通常 user は明示実行不要、 contract 変更後の
# 再生成 (= dev-refresh) と 初回 setup 用のエントリポイント。
# 手順 ... (1) live state 削除 (2) anvil 起動 (fresh chain) (3) deploy-niji-full 実行
#        (4) anvil に snapshot dump signal (SIGTERM graceful) (5) live state を snapshot に move
dev-init: setup-env
	@echo "🎬 make dev-init — initial deploy + snapshot 保存 (~30-60s、 1 回だけ)"
	@if [ -f "$(ANVIL_PID)" ] && kill -0 $$(cat $(ANVIL_PID)) 2>/dev/null; then \
		echo "⛔ stopping existing anvil first..."; \
		$(MAKE) --no-print-directory dev-stop; \
	fi
	@rm -f "$(ANVIL_STATE)"
	@mkdir -p $(LOG_DIR)
	@echo "🚀 starting anvil (fresh chain) for snapshot generation..."
	@nohup anvil --port $(ANVIL_PORT) --chain-id 31337 --host 127.0.0.1 \
		--state "$(ANVIL_STATE)" --state-interval 5 --block-time 1 \
		> "$(ANVIL_LOG)" 2>&1 & \
		echo $$! > "$(ANVIL_PID)"
	@sleep 1
	@echo "🔨 running deploy-niji-full on fresh chain..."
	@cd $(ROOT)/packages/niji-contracts && pnpm hardhat deploy-niji-full --network localhost \
		> "$(DEPLOY_LOG)" 2>&1 && echo "✅ contracts deployed (log: $(DEPLOY_LOG))" \
		|| (echo "❌ deploy failed, see $(DEPLOY_LOG)"; kill $$(cat $(ANVIL_PID)); rm -f $(ANVIL_PID); exit 1)
	@echo "⏳ waiting 8s for anvil state dump (state-interval=5)..."
	@sleep 8
	@echo "⛔ stopping anvil gracefully to flush state..."
	@PID=$$(cat "$(ANVIL_PID)"); kill -TERM $$PID 2>/dev/null || true; \
		for i in 1 2 3 4 5 6 7 8 9 10; do \
			sleep 1; \
			if ! kill -0 $$PID 2>/dev/null; then break; fi; \
			if [ $$i -eq 10 ]; then kill -KILL $$PID 2>/dev/null || true; fi; \
		done
	@rm -f "$(ANVIL_PID)"
	@if [ ! -f "$(ANVIL_STATE)" ] || [ ! -s "$(ANVIL_STATE)" ]; then \
		echo "❌ anvil state dump failed (empty or missing)"; exit 1; \
	fi
	@mv "$(ANVIL_STATE)" "$(ANVIL_SNAPSHOT)"
	@echo "✅ snapshot 保存完了 → $(ANVIL_SNAPSHOT) ($$(du -h $(ANVIL_SNAPSHOT) | cut -f1))"
	@echo "   以降 make dev = snapshot copy + anvil load で ~1s 起動"

# snapshot 再生成 = contract source 変更後に呼ぶ。 snapshot 削除 + dev-init 再実行。
dev-refresh:
	@echo "🔄 removing snapshot for regeneration..."
	@rm -f "$(ANVIL_SNAPSHOT)"
	@$(MAKE) --no-print-directory dev-init

dev-sepolia: setup-env webapp-bg
	@echo ""
	@echo "✅ webapp running in sepolia mode."
	@echo "  webapp  http://localhost:$(WEBAPP_PORT)"
	@echo "  (VITE_CHAIN_ID in .env で chain 切替、 anvil は使わない)"

# foreground 並列起動。 Ctrl+C で同時停止。
dev-fg: setup-env
	@trap 'echo "⛔ stopping..."; kill 0' INT TERM EXIT; \
	echo "🚀 anvil + webapp on foreground (Ctrl+C to stop)..."; \
	( anvil --port $(ANVIL_PORT) --chain-id 31337 --host 127.0.0.1 2>&1 | sed "s/^/[anvil] /" ) & \
	( cd $(ROOT) && pnpm --filter @niji/webapp dev 2>&1 | sed "s/^/[webapp] /" ) & \
	wait

dev-stop:
	@echo "⛔ stopping dev processes (graceful shutdown)..."
	@if [ -f "$(WEBAPP_PID)" ]; then \
		PID=$$(cat "$(WEBAPP_PID)"); \
		if kill -0 $$PID 2>/dev/null; then \
			pkill -P $$PID 2>/dev/null || true; \
			kill $$PID 2>/dev/null || true; \
			echo "  ⛔ webapp stopped (PID $$PID)"; \
		fi; \
		rm -f "$(WEBAPP_PID)"; \
	fi
	@if [ -f "$(SETTLER_PID)" ]; then \
		PID=$$(cat "$(SETTLER_PID)"); \
		if kill -0 $$PID 2>/dev/null; then \
			pkill -P $$PID 2>/dev/null || true; \
			kill $$PID 2>/dev/null || true; \
			echo "  ⛔ auto-settler stopped (PID $$PID)"; \
		fi; \
		rm -f "$(SETTLER_PID)"; \
	fi
	@# anvil は SIGTERM で --state dump 完了を待つ (最大 10 秒)。 dump 中に SIGKILL すると
	@# JSON が途中で切れ、 次の make dev で "failed to parse json file: EOF" で起動失敗する。
	@# graceful shutdown 経路 = SIGTERM 送信 → 1 秒間隔で process 死亡 poll (最大 10 秒) → 未死亡なら SIGKILL fallback。
	@if [ -f "$(ANVIL_PID)" ]; then \
		PID=$$(cat "$(ANVIL_PID)"); \
		if kill -0 $$PID 2>/dev/null; then \
			echo "  ⏳ sending SIGTERM to anvil (PID $$PID), waiting up to 10s for state dump..."; \
			kill -TERM $$PID 2>/dev/null || true; \
			for i in 1 2 3 4 5 6 7 8 9 10; do \
				sleep 1; \
				if ! kill -0 $$PID 2>/dev/null; then \
					echo "  ⛔ anvil stopped gracefully after $${i}s (PID $$PID, state dumped safely)"; \
					break; \
				fi; \
				if [ $$i -eq 10 ]; then \
					echo "  ⚠️  anvil did not exit within 10s, sending SIGKILL (state may be corrupted)"; \
					kill -KILL $$PID 2>/dev/null || true; \
				fi; \
			done; \
		fi; \
		rm -f "$(ANVIL_PID)"; \
	fi
	@# fallback ... PID file が壊れていても port を listen しているプロセスを殺す
	@WEBAPP_PIDS=$$(lsof -nP -iTCP:$(WEBAPP_PORT) -sTCP:LISTEN -t 2>/dev/null); \
	if [ -n "$$WEBAPP_PIDS" ]; then \
		echo "$$WEBAPP_PIDS" | xargs kill 2>/dev/null || true; \
		echo "  ⛔ killed lingering webapp listeners on :$(WEBAPP_PORT)"; \
	fi
	@ANVIL_PIDS=$$(lsof -nP -iTCP:$(ANVIL_PORT) -sTCP:LISTEN -t 2>/dev/null); \
	if [ -n "$$ANVIL_PIDS" ]; then \
		echo "$$ANVIL_PIDS" | xargs kill 2>/dev/null || true; \
		echo "  ⛔ killed lingering anvil listeners on :$(ANVIL_PORT)"; \
	fi
	@# state file 削除 = user 直感 (make dev-stop で「一旦全部止める」 = 次 make dev は fresh chain) を SSOT 化。
	@# 高速再起動が欲しい場面は無く、 途中状態が残ることによる混乱を優先排除。
	@if [ -f "$(ANVIL_STATE)" ]; then \
		rm -f "$(ANVIL_STATE)"; \
		echo "  🗑️  removed anvil state (next make dev = fresh chain deploy)"; \
	fi
	@echo "✅ stopped."

dev-status:
	@echo "🔍 dev status:"
	@echo ""
	@if [ -f "$(ANVIL_PID)" ] && kill -0 $$(cat $(ANVIL_PID)) 2>/dev/null; then \
		echo "  anvil   🟢 running (PID $$(cat $(ANVIL_PID)), port $(ANVIL_PORT))"; \
		curl -s -o /dev/null -w "          eth_chainId   %{http_code}\n" \
			-X POST -H "Content-Type: application/json" \
			--data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
			http://127.0.0.1:$(ANVIL_PORT) || echo "          eth_chainId   no response"; \
	else \
		echo "  anvil   ⚪ stopped"; \
	fi
	@if [ -f "$(WEBAPP_PID)" ] && kill -0 $$(cat $(WEBAPP_PID)) 2>/dev/null; then \
		echo "  webapp        🟢 running (PID $$(cat $(WEBAPP_PID)), port $(WEBAPP_PORT))"; \
		curl -s -o /dev/null -w "                HTTP          %{http_code}\n" \
			http://localhost:$(WEBAPP_PORT) || echo "                HTTP          no response"; \
	else \
		echo "  webapp        ⚪ stopped"; \
	fi
	@if [ -f "$(SETTLER_PID)" ] && kill -0 $$(cat $(SETTLER_PID)) 2>/dev/null; then \
		echo "  auto-settler  🤖 running (PID $$(cat $(SETTLER_PID)), 5s poll)"; \
	else \
		echo "  auto-settler  ⚪ stopped (auction は手動 settle が必要)"; \
	fi
	@if [ -f "$(ANVIL_STATE)" ]; then \
		echo "  live state    📦 exists ($$(du -h $(ANVIL_STATE) | cut -f1), anvil load 中)"; \
	else \
		echo "  live state    ⚪ none (make dev で snapshot copy 予定)"; \
	fi
	@if [ -f "$(ANVIL_SNAPSHOT)" ]; then \
		echo "  snapshot      📦 exists ($$(du -h $(ANVIL_SNAPSHOT) | cut -f1), fresh chain 準備完了)"; \
	else \
		echo "  snapshot      ⚪ none (make dev-init が必要、 make dev は自動 fallback)"; \
	fi
	@echo ""
	@echo "  log dir  $(LOG_DIR)"

dev-logs:
	@echo "📜 tailing anvil + deploy + auto-settler + webapp logs (Ctrl+C to exit)..."
	@touch "$(ANVIL_LOG)" "$(DEPLOY_LOG)" "$(SETTLER_LOG)" "$(WEBAPP_LOG)"
	@tail -f "$(ANVIL_LOG)" "$(DEPLOY_LOG)" "$(SETTLER_LOG)" "$(WEBAPP_LOG)"
