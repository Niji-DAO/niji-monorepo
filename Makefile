# Niji DAO monorepo — local dev orchestration
#
# 1 つの make コマンドで anvil + contract deploy + webapp を並列起動する。
# anvil --state で chain state を .context/dev/anvil-state.json に dump/load し、
# 2 回目以降の make dev は deploy/populate を skip して state load で一瞬復元 (~1 秒)。
# log は .context/dev/ 配下、 PID 管理で停止 / restart も 1 コマンド。
#
# Quickstart:
#   make dev           # anvil --state load + (初回のみ deploy) + webapp 並列起動 (Recommended)
#   make dev-reset     # state file 削除 + 再 deploy で fresh chain 再構築
#   make dev-sepolia   # webapp のみ sepolia mode で bg 起動 (anvil 不要)
#   make dev-fg        # anvil + webapp を foreground 並列起動 (Ctrl+C で同時停止)
#   make dev-stop      # bg で起動した anvil + webapp を停止
#   make dev-status    # 起動状況を確認
#   make dev-logs      # log を tail -f で表示
#   make help          # コマンド一覧表示

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

# anvil account #0 の private key (deterministic、 全 dev 共通)
ANVIL_DEPLOYER_PK := 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

WEBAPP_ENV := $(ROOT)/packages/niji-webapp/.env
WEBAPP_ENV_EXAMPLE := $(ROOT)/packages/niji-webapp/.env.example.local

ANVIL_PORT := 8547
WEBAPP_PORT := 2424

.PHONY: help dev dev-reset dev-sepolia dev-fg dev-stop dev-status dev-logs setup setup-env install build anvil-bg webapp-bg deploy-if-needed auto-settler-bg

help:
	@echo "Niji DAO — local dev commands"
	@echo ""
	@echo "  make dev           anvil + (初回のみ deploy) + auto-settler + webapp 並列起動 (Recommended)"
	@echo "  make dev-reset     anvil state を削除して fresh chain で再 deploy"
	@echo "  make dev-sepolia   webapp のみ sepolia mode で background 起動 (anvil 不要)"
	@echo "  make dev-fg        anvil + webapp を foreground で並列起動 (Ctrl+C で停止)"
	@echo "  make dev-stop      background で起動した anvil + auto-settler + webapp を停止"
	@echo "  make dev-status    起動状況を確認 (PID / port listen / HTTP 応答 / state 有無)"
	@echo "  make dev-logs      anvil / deploy / auto-settler / webapp log を tail -f で表示"
	@echo "  make setup         pnpm install + sdk/contracts build + .env 作成"
	@echo "  make help          このヘルプを表示"
	@echo ""
	@echo "URL:"
	@echo "  webapp  http://localhost:$(WEBAPP_PORT)"
	@echo "  anvil   http://127.0.0.1:$(ANVIL_PORT) (chain id 31337)"
	@echo ""
	@echo "State:"
	@echo "  state file  $(ANVIL_STATE)"
	@echo "  初回起動時に deploy-niji-full が走り、 以降は anvil --state で 1 秒復元"

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
# state file が存在すれば deploy 済 contract をそのまま load、 不存在なら fresh chain で起動。
anvil-bg: | $(LOG_DIR)
	@if [ -f "$(ANVIL_PID)" ] && kill -0 $$(cat $(ANVIL_PID)) 2>/dev/null; then \
		echo "🟢 anvil already running (PID $$(cat $(ANVIL_PID)))"; \
	else \
		if [ -f "$(ANVIL_STATE)" ]; then \
			echo "🚀 starting anvil on :$(ANVIL_PORT) (chain 31337, state load from $(ANVIL_STATE))..."; \
		else \
			echo "🚀 starting anvil on :$(ANVIL_PORT) (chain 31337, fresh state)..."; \
		fi; \
		nohup anvil --port $(ANVIL_PORT) --chain-id 31337 --host 127.0.0.1 \
			--state "$(ANVIL_STATE)" --state-interval 5 \
			> "$(ANVIL_LOG)" 2>&1 & \
		echo $$! > "$(ANVIL_PID)"; \
		sleep 1; \
		echo "🟢 anvil started (PID $$(cat $(ANVIL_PID)))"; \
	fi

# state file が無ければ deploy-niji-full を実行して contract を deploy + populate。
# state file 存在時は skip (= 既に deploy 済の chain を load しているため)。
deploy-if-needed: anvil-bg
	@if [ ! -f "$(ANVIL_STATE)" ] || [ ! -s "$(ANVIL_STATE)" ]; then \
		echo "🔨 first run — deploying contracts (deploy-niji-full + populate + ownership)..."; \
		echo "⏳ this takes ~30-60s, subsequent 'make dev' will load from state in ~1s"; \
		cd $(ROOT)/packages/niji-contracts && pnpm hardhat deploy-niji-full --network localhost \
			> "$(DEPLOY_LOG)" 2>&1 && echo "✅ contracts deployed (log: $(DEPLOY_LOG))" \
			|| (echo "❌ deploy failed, see $(DEPLOY_LOG)"; exit 1); \
		echo "⏳ waiting 6s for anvil state dump (state-interval=5)..."; \
		sleep 6; \
	else \
		echo "✅ anvil state already exists, skipping deploy (load from $(ANVIL_STATE))"; \
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

dev: setup-env anvil-bg deploy-if-needed auto-settler-bg webapp-bg
	@echo ""
	@echo "✅ dev environment ready."
	@echo ""
	@echo "  webapp        http://localhost:$(WEBAPP_PORT)"
	@echo "  anvil         http://127.0.0.1:$(ANVIL_PORT) (chain 31337)"
	@echo "  auto-settler  🤖 5s polling, next auction starts automatically on endTime"
	@if [ -f "$(ANVIL_STATE)" ]; then \
		echo "  state         $(ANVIL_STATE) ($$(du -h $(ANVIL_STATE) | cut -f1))"; \
	fi
	@echo ""
	@echo "  make dev-logs    to tail logs"
	@echo "  make dev-status  to check health"
	@echo "  make dev-stop    to stop all"

# state file を削除して fresh chain で再 deploy。
# anvil + webapp を 1 度停止 → state 削除 → make dev で initial deploy 再実行。
dev-reset: dev-stop
	@echo "🗑️  removing anvil state ($(ANVIL_STATE))..."
	@rm -f "$(ANVIL_STATE)"
	@echo "✅ state removed. run 'make dev' to re-deploy from fresh chain."

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
	@echo "⛔ stopping dev processes..."
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
	@if [ -f "$(ANVIL_PID)" ]; then \
		PID=$$(cat "$(ANVIL_PID)"); \
		if kill -0 $$PID 2>/dev/null; then \
			kill $$PID 2>/dev/null || true; \
			echo "  ⛔ anvil stopped (PID $$PID)"; \
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
		echo "  state         📦 exists ($$(du -h $(ANVIL_STATE) | cut -f1), contracts deployed)"; \
	else \
		echo "  state         ⚪ none (next 'make dev' will deploy contracts)"; \
	fi
	@echo ""
	@echo "  log dir  $(LOG_DIR)"

dev-logs:
	@echo "📜 tailing anvil + deploy + auto-settler + webapp logs (Ctrl+C to exit)..."
	@touch "$(ANVIL_LOG)" "$(DEPLOY_LOG)" "$(SETTLER_LOG)" "$(WEBAPP_LOG)"
	@tail -f "$(ANVIL_LOG)" "$(DEPLOY_LOG)" "$(SETTLER_LOG)" "$(WEBAPP_LOG)"
