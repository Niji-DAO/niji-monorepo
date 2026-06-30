# Niji DAO monorepo — local dev orchestration
#
# 1 つの make コマンドで anvil + webapp を並列起動する。
# log は .context/dev/ 配下、 PID 管理で停止 / restart も 1 コマンド。
#
# Quickstart:
#   make dev           # anvil + webapp を bg 並列起動 (chain 31337、 推奨)
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
HARDHAT_LOG := $(LOG_DIR)/hardhat.log
ANVIL_PID := $(LOG_DIR)/anvil.pid
WEBAPP_PID := $(LOG_DIR)/webapp.pid
HARDHAT_PID := $(LOG_DIR)/hardhat.pid

WEBAPP_ENV := $(ROOT)/packages/niji-webapp/.env
WEBAPP_ENV_EXAMPLE := $(ROOT)/packages/niji-webapp/.env.example.local

ANVIL_PORT := 8547
WEBAPP_PORT := 2424

.PHONY: help dev dev-full dev-sepolia dev-fg dev-stop dev-status dev-logs setup setup-env install build anvil-bg webapp-bg hardhat-bg

help:
	@echo "Niji DAO — local dev commands"
	@echo ""
	@echo "  make dev-full      hardhat node + contract deploy/populate + webapp を 1 cmd 起動 (Recommended)"
	@echo "  make dev           anvil + webapp を background で並列起動 (chain 31337、 contract 未 deploy)"
	@echo "  make dev-sepolia   webapp のみ sepolia mode で background 起動 (anvil 不要)"
	@echo "  make dev-fg        anvil + webapp を foreground で並列起動 (Ctrl+C で停止)"
	@echo "  make dev-stop      background で起動した anvil / hardhat node / webapp を停止"
	@echo "  make dev-status    起動状況を確認 (PID / port listen / HTTP 応答)"
	@echo "  make dev-logs      anvil / hardhat / webapp log を tail -f で表示"
	@echo "  make setup         pnpm install + sdk/contracts build + .env 作成"
	@echo "  make help          このヘルプを表示"
	@echo ""
	@echo "URL:"
	@echo "  webapp        http://localhost:$(WEBAPP_PORT)"
	@echo "  anvil         http://127.0.0.1:$(ANVIL_PORT) (chain id 31337、 make dev 経路)"
	@echo "  hardhat node  http://127.0.0.1:8545 (chain id 31337、 make dev-full 経路)"

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
anvil-bg: | $(LOG_DIR)
	@if [ -f "$(ANVIL_PID)" ] && kill -0 $$(cat $(ANVIL_PID)) 2>/dev/null; then \
		echo "🟢 anvil already running (PID $$(cat $(ANVIL_PID)))"; \
	else \
		echo "🚀 starting anvil on :$(ANVIL_PORT) (chain 31337)..."; \
		nohup anvil --port $(ANVIL_PORT) --chain-id 31337 --host 127.0.0.1 \
			> "$(ANVIL_LOG)" 2>&1 & \
		echo $$! > "$(ANVIL_PID)"; \
		sleep 1; \
		echo "🟢 anvil started (PID $$(cat $(ANVIL_PID)))"; \
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

dev: setup-env anvil-bg webapp-bg
	@echo ""
	@echo "✅ dev environment ready."
	@echo ""
	@echo "  webapp  http://localhost:$(WEBAPP_PORT)"
	@echo "  anvil   http://127.0.0.1:$(ANVIL_PORT) (chain 31337)"
	@echo ""
	@echo "  make dev-logs    to tail logs"
	@echo "  make dev-status  to check health"
	@echo "  make dev-stop    to stop both"

# hardhat node + contract 完全初期化 + webapp を 1 cmd で起動。
# pnpm task:run-local が hardhat node を内包して deploy + populate + ownership transfer を全自動実行する。
hardhat-bg: | $(LOG_DIR)
	@if [ -f "$(HARDHAT_PID)" ] && kill -0 $$(cat $(HARDHAT_PID)) 2>/dev/null; then \
		echo "🟢 hardhat node (run-local) already running (PID $$(cat $(HARDHAT_PID)))"; \
	else \
		echo "🚀 starting hardhat node + deploy + populate (chain 31337, port 8545)..."; \
		cd $(ROOT) && nohup pnpm --filter @niji/contracts task:run-local \
			> "$(HARDHAT_LOG)" 2>&1 & \
		echo $$! > "$(HARDHAT_PID)"; \
		echo "⏳ waiting for hardhat node + contract deploy/populate (~30-60s)..."; \
		sleep 30; \
		echo "🟢 hardhat node started (PID $$(cat $(HARDHAT_PID)))"; \
	fi

dev-full: setup-env hardhat-bg webapp-bg
	@echo ""
	@echo "✅ full dev environment ready (hardhat node + contracts deployed + webapp)."
	@echo ""
	@echo "  webapp        http://localhost:$(WEBAPP_PORT)"
	@echo "  hardhat node  http://127.0.0.1:8545 (chain 31337)"
	@echo ""
	@echo "  make dev-logs    to tail logs (hardhat + webapp)"
	@echo "  make dev-status  to check health"
	@echo "  make dev-stop    to stop all"

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
	@if [ -f "$(HARDHAT_PID)" ]; then \
		PID=$$(cat "$(HARDHAT_PID)"); \
		if kill -0 $$PID 2>/dev/null; then \
			pkill -P $$PID 2>/dev/null || true; \
			kill $$PID 2>/dev/null || true; \
			echo "  ⛔ hardhat node stopped (PID $$PID)"; \
		fi; \
		rm -f "$(HARDHAT_PID)"; \
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
	@HARDHAT_PIDS=$$(lsof -nP -iTCP:8545 -sTCP:LISTEN -t 2>/dev/null); \
	if [ -n "$$HARDHAT_PIDS" ]; then \
		echo "$$HARDHAT_PIDS" | xargs kill 2>/dev/null || true; \
		echo "  ⛔ killed lingering hardhat node listeners on :8545"; \
	fi
	@echo "✅ stopped."

dev-status:
	@echo "🔍 dev status:"
	@echo ""
	@if [ -f "$(ANVIL_PID)" ] && kill -0 $$(cat $(ANVIL_PID)) 2>/dev/null; then \
		echo "  anvil         🟢 running (PID $$(cat $(ANVIL_PID)), port $(ANVIL_PORT))"; \
		curl -s -o /dev/null -w "                eth_chainId   %{http_code}\n" \
			-X POST -H "Content-Type: application/json" \
			--data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
			http://127.0.0.1:$(ANVIL_PORT) || echo "                eth_chainId   no response"; \
	else \
		echo "  anvil         ⚪ stopped"; \
	fi
	@if [ -f "$(HARDHAT_PID)" ] && kill -0 $$(cat $(HARDHAT_PID)) 2>/dev/null; then \
		echo "  hardhat node  🟢 running (PID $$(cat $(HARDHAT_PID)), port 8545)"; \
		curl -s -o /dev/null -w "                eth_chainId   %{http_code}\n" \
			-X POST -H "Content-Type: application/json" \
			--data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
			http://127.0.0.1:8545 || echo "                eth_chainId   no response"; \
	else \
		echo "  hardhat node  ⚪ stopped"; \
	fi
	@if [ -f "$(WEBAPP_PID)" ] && kill -0 $$(cat $(WEBAPP_PID)) 2>/dev/null; then \
		echo "  webapp        🟢 running (PID $$(cat $(WEBAPP_PID)), port $(WEBAPP_PORT))"; \
		curl -s -o /dev/null -w "                HTTP          %{http_code}\n" \
			http://localhost:$(WEBAPP_PORT) || echo "                HTTP          no response"; \
	else \
		echo "  webapp        ⚪ stopped"; \
	fi
	@echo ""
	@echo "  log dir  $(LOG_DIR)"

dev-logs:
	@echo "📜 tailing anvil + hardhat + webapp logs (Ctrl+C to exit)..."
	@touch "$(ANVIL_LOG)" "$(HARDHAT_LOG)" "$(WEBAPP_LOG)"
	@tail -f "$(ANVIL_LOG)" "$(HARDHAT_LOG)" "$(WEBAPP_LOG)"
