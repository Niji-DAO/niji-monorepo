import type { Address } from './utils/types';

import React, { useEffect } from 'react';

import {
  nijiAuctionHouseAddress,
  useReadNijiAuctionHouseAuction,
  useWatchNijiAuctionHouseAuctionBidEvent,
  useWatchNijiAuctionHouseAuctionCreatedEvent,
  useWatchNijiAuctionHouseAuctionExtendedEvent,
  useWatchNijiAuctionHouseAuctionSettledEvent,
} from '@niji/sdk/react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useSetAtom } from 'jotai/react';
import { createRoot } from 'react-dom/client';
import { Provider as ReduxProvider } from 'react-redux';
import { parseAbiItem } from 'viem';
import { hardhat } from 'viem/chains';
import { usePublicClient, WagmiProvider } from 'wagmi';

import { CustomConnectkitProvider } from '@/components/CustomConnectkitProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { store } from '@/store';
import { execute } from '@/subgraphs/execute';

import App from './App';
import config, { CHAIN_ID } from './config';
import { useAppDispatch, useAppSelector } from './hooks';
import { useChainPastAuctions } from './hooks/useChainPastAuctions';
import { LanguageProvider } from './i18n/LanguageProvider';
import reportWebVitals from './reportWebVitals';
import {
  auctionAtom,
  applyActiveAuction,
  applyAppendBid,
  applyAuctionExtended,
  applyAuctionSettled,
  applyFullAuction,
  reduxSafeAuction,
  reduxSafeBid,
} from './state/atoms/auctionAtom';
import { pastAuctionsAtom, subgraphAuctionsToReduxSafe } from './state/atoms/pastAuctionsAtom';
import { setLastAuctionNounId, setOnDisplayAuctionNounId } from './state/slices/onDisplayAuction';
import { nounPath } from './utils/history';
import { defaultChain, config as wagmiConfig } from './wagmi';
import { latestAuctionsQuery } from './wrappers/subgraph';

// ConnectKit 内部 / 旧コードが `ensName` `ensAvatar` 系 wagmi query を呼んでも、
// anvil 31337 / Base Sepolia には ENS が無いため必ず失敗する。 viem は失敗時に
// `eth.merkle.io` 等の mainnet public RPC へ fallback retry し、 CORS error を
// console に大量に吐き続けるので、 queryClient 層で ens query を強制 disable する。
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});
queryClient.getQueryCache().subscribe(event => {
  if (event.type === 'added') {
    const key = event.query.queryKey;
    if (
      Array.isArray(key) &&
      typeof key[0] === 'string' &&
      (key[0] === 'ensName' || key[0] === 'ensAvatar' || key[0] === 'ensAddress')
    ) {
      // 強制 disable + 即時 cancel (ENS は本 webapp の対象 chain でサポート外)
      event.query.cancel();
    }
  }
});

const ChainSubscriber: React.FC = () => {
  const dispatch = useAppDispatch();
  const setAuction = useSetAtom(auctionAtom);
  const publicClient = usePublicClient();
  const chainId = defaultChain.id;

  // Fetch the current auction
  // wallet 未接続でも default chain で read できるよう chainId を明示する。
  const { data: currentAuction } = useReadNijiAuctionHouseAuction({ chainId });
  const onDisplayAuctionNounId = useAppSelector(
    state => state.onDisplayAuction.onDisplayAuctionNounId,
  );
  useEffect(() => {
    if (currentAuction) {
      const payload = reduxSafeAuction(currentAuction);
      setAuction(prev => applyFullAuction(prev, payload));
      dispatch(setLastAuctionNounId(Number(currentAuction.nounId)));
      // 初回 mount 時に AuctionCreated event を取り逃がしている場合、
      // onDisplayAuctionNounId が undefined のままで AuctionActivity が初期表示
      // されないので、 ここで現在 auction の nounId を補填する。
      if (onDisplayAuctionNounId === undefined) {
        dispatch(setOnDisplayAuctionNounId(Number(currentAuction.nounId)));
      }
    }
  }, [currentAuction, dispatch, onDisplayAuctionNounId, setAuction]);

  // Fetch the previous 24 hours of bids
  useEffect(() => {
    if (CHAIN_ID === hardhat.id) {
      return;
    }
    (async () => {
      const latestBlock = await publicClient.getBlock();
      const fromBlock = latestBlock.number > 7200n ? latestBlock.number - 7200n : 0n;

      const logs = await publicClient.getLogs({
        address: nijiAuctionHouseAddress[chainId],
        event: parseAbiItem(
          'event AuctionBid(uint256 indexed nounId, address sender, uint256 value, bool extended)',
        ),
        fromBlock,
        toBlock: latestBlock.number,
      });

      for (const {
        args: { extended, nounId, sender, value },
        blockNumber,
        transactionHash,
        transactionIndex,
      } of logs) {
        const block = await publicClient.getBlock({
          blockNumber: blockNumber ?? undefined,
        });
        const timestamp = block.timestamp;

        const bidPayload = reduxSafeBid({
          nounId: Number(nounId),
          sender: sender as Address,
          value: Number(value),
          extended: extended !== undefined,
          transactionHash: transactionHash ?? '',
          transactionIndex: transactionIndex ?? 0,
          timestamp,
        });
        setAuction(prev => applyAppendBid(prev, bidPayload));
      }
    })();
  }, [chainId, publicClient, setAuction]);

  // Watch for new bids
  useWatchNijiAuctionHouseAuctionBidEvent({
    onLogs: async logs => {
      for (const {
        args: { extended, nounId, sender, value },
        blockNumber,
        transactionHash,
        transactionIndex,
      } of logs) {
        const block = await publicClient.getBlock({
          blockNumber: blockNumber ?? undefined,
        });
        const timestamp = block.timestamp;

        const bidPayload = reduxSafeBid({
          nounId: Number(nounId),
          sender: sender as Address,
          value: Number(value),
          extended: extended !== undefined,
          transactionHash: transactionHash ?? '',
          transactionIndex: transactionIndex ?? 0,
          timestamp,
        });
        setAuction(prev => applyAppendBid(prev, bidPayload));
      }
    },
  });

  // Watch for new auction creation events
  useWatchNijiAuctionHouseAuctionCreatedEvent({
    onLogs: logs => {
      for (const log of logs) {
        const { startTime, endTime, nounId } = log.args;
        const createPayload = {
          nounId: Number(nounId),
          startTime: Number(startTime),
          endTime: Number(endTime),
          settled: false,
        };
        setAuction(prev => applyActiveAuction(prev, createPayload));
        const nounIdNumber = Number(nounId);
        window.location.href = nounPath(nounIdNumber);
        dispatch(setOnDisplayAuctionNounId(nounIdNumber));
        dispatch(setLastAuctionNounId(nounIdNumber));
      }
    },
  });

  // Watch for new auction extended events
  useWatchNijiAuctionHouseAuctionExtendedEvent({
    onLogs: logs => {
      for (const log of logs) {
        const { endTime, nounId } = log.args;
        const extendedPayload = {
          nounId: Number(nounId),
          endTime: Number(endTime),
        };
        setAuction(prev => applyAuctionExtended(prev, extendedPayload));
      }
    },
  });

  // Watch for auction settlement events
  useWatchNijiAuctionHouseAuctionSettledEvent({
    onLogs: logs => {
      for (const log of logs) {
        const { amount, winner, nounId } = log.args;
        const settledPayload = {
          nounId: Number(nounId),
          amount: Number(amount),
          winner: winner as Address,
        };
        setAuction(prev => applyAuctionSettled(prev, settledPayload));
      }
    },
  });

  return <></>;
};

const PastAuctions: React.FC = () => {
  const latestAuctionId = useAppSelector(state => state.onDisplayAuction.lastAuctionNounId);
  const setPastAuctions = useSetAtom(pastAuctionsAtom);

  // subgraph URL が空 (anvil dev で local subgraph 未起動 等) なら chain fallback を primary
  // として常用、 prod (Base Sepolia 等) は subgraph 経路を primary とし、 useQuery が error
  // を返した時のみ chain fallback を opt-in 有効化して degrade 動作させる。
  const useChainPrimary = !config.app.subgraphApiUri;

  const { data: auctions, error: subgraphError } = useQuery({
    queryKey: ['latestAuctions'],
    enabled: !useChainPrimary,
    retry: 2,
    queryFn: async () =>
      await Promise.all([
        execute(latestAuctionsQuery, { first: 1000 }),
        execute(latestAuctionsQuery, { first: 1000, skip: 1000 }),
      ]).then(([page1, page2]) => [...page1.auctions, ...page2.auctions]),
  });

  // chain fallback の起動条件 ... ① subgraph URL 未設定 (dev primary) OR ② subgraph error 検出
  const chainFallbackEnabled = useChainPrimary || subgraphError !== null;
  const { data: chainAuctions } = useChainPastAuctions(chainFallbackEnabled);

  useEffect(() => {
    if (chainFallbackEnabled) {
      if (chainAuctions) {
        setPastAuctions(subgraphAuctionsToReduxSafe(chainAuctions));
      }
    } else if (auctions) {
      setPastAuctions(subgraphAuctionsToReduxSafe({ auctions }));
    }
  }, [auctions, chainAuctions, chainFallbackEnabled, latestAuctionId, setPastAuctions]);

  return <></>;
};

createRoot(document.getElementById('root')!).render(
  <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light">
    <TooltipProvider delayDuration={0}>
      <ReduxProvider store={store}>
        <React.StrictMode>
          <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
              {import.meta.env.VITE_ENABLE_TANSTACK_QUERY_DEVTOOLS === 'true' && (
                <ReactQueryDevtools initialIsOpen={false} />
              )}
              <ChainSubscriber />
              <PastAuctions />
              <LanguageProvider>
                <CustomConnectkitProvider>
                  <App />
                </CustomConnectkitProvider>
              </LanguageProvider>
            </QueryClientProvider>
          </WagmiProvider>
        </React.StrictMode>
      </ReduxProvider>
    </TooltipProvider>
  </ThemeProvider>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example, reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
