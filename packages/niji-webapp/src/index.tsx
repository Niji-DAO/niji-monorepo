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
import { useAtom, useAtomValue, useSetAtom } from 'jotai/react';
import { createRoot } from 'react-dom/client';
import { decodeEventLog, parseAbiItem, toEventSelector } from 'viem';

/**
 * fiat 代理入札 (createBidFor) で emit される BidPlacedFor event の parse 用 signature。
 * @niji/sdk gen (wagmi cli 経由) は base-sepolia proxy upgrade (2026-07-23) 後まだ再生成しておらず、
 * webapp 側では minimal local 定義で decode する。 gen 更新後は sdk の abi に置換予定。
 *
 * webapp の AuctionBid watcher は sender = msg.sender (fiat では relayer = 運営 EOA) を
 * そのまま atom に入れるため、 同 tx 内に BidPlacedFor があれば recipient で bidder を上書きする
 * 追加経路が要る (index.tsx の useWatchNijiAuctionHouseAuctionBidEvent 内 receipt fetch 経路)。
 */
const bidPlacedForEvent = parseAbiItem(
  'event BidPlacedFor(uint256 indexed nounId, address indexed payer, address indexed recipient, uint256 value, bool extended)',
);
const bidPlacedForTopic = toEventSelector(bidPlacedForEvent);

/**
 * AuctionBid の tx receipt を取得し、 同 tx 内に BidPlacedFor が emit されていれば
 * その recipient (fiat 支払 user wallet) を bidder として返す。 crypto 入札 (BidPlacedFor 無し) は
 * AuctionBid.sender をそのまま返す。 failure 時は fallback (元 sender) で degrade する。
 */
const resolveBidderFromReceipt = async (
  publicClient: ReturnType<typeof usePublicClient>,
  transactionHash: `0x${string}` | null,
  fallbackSender: Address,
): Promise<{ effectiveSender: Address; isFiat: boolean }> => {
  if (transactionHash === null || publicClient === undefined) {
    return { effectiveSender: fallbackSender, isFiat: false };
  }
  try {
    const receipt = await publicClient.getTransactionReceipt({ hash: transactionHash });
    const bidPlacedForLog = receipt.logs.find(
      (log: { topics: readonly `0x${string}`[] }) => log.topics[0] === bidPlacedForTopic,
    );
    if (bidPlacedForLog === undefined) {
      return { effectiveSender: fallbackSender, isFiat: false };
    }
    const decoded = decodeEventLog({
      abi: [bidPlacedForEvent],
      data: bidPlacedForLog.data,
      topics: bidPlacedForLog.topics,
    });
    return { effectiveSender: decoded.args.recipient as Address, isFiat: true };
  } catch {
    return { effectiveSender: fallbackSender, isFiat: false };
  }
};
import { baseSepolia, hardhat } from 'viem/chains';
import { usePublicClient, WagmiProvider } from 'wagmi';

import { CustomConnectkitProvider } from '@/components/CustomConnectkitProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { execute } from '@/subgraphs/execute';

import App from './App';
import config, { CHAIN_ID } from './config';
import { useChainPastAuctions } from './hooks/useChainPastAuctions';
import { LanguageProvider } from './i18n/LanguageProvider';
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
import {
  lastAuctionNounIdAtom,
  onDisplayAuctionNounIdAtom,
} from './state/atoms/onDisplayAuctionAtom';
import { pastAuctionsAtom, subgraphAuctionsToReduxSafe } from './state/atoms/pastAuctionsAtom';
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
  const setAuction = useSetAtom(auctionAtom);
  const [onDisplayAuctionNounId, setOnDisplayAuctionNounId] = useAtom(onDisplayAuctionNounIdAtom);
  const setLastAuctionNounId = useSetAtom(lastAuctionNounIdAtom);
  const publicClient = usePublicClient();
  const chainId = defaultChain.id;

  // Fetch the current auction
  // wallet 未接続でも default chain で read できるよう chainId を明示する。
  const { data: currentAuction } = useReadNijiAuctionHouseAuction({ chainId });
  useEffect(() => {
    if (currentAuction) {
      const payload = reduxSafeAuction(currentAuction);
      setAuction(prev => applyFullAuction(prev, payload));
      setLastAuctionNounId(Number(currentAuction.nounId));
      // 初回 mount 時に AuctionCreated event を取り逃がしている場合、
      // onDisplayAuctionNounId が undefined のままで AuctionActivity が初期表示
      // されないので、 ここで現在 auction の nounId を補填する。
      if (onDisplayAuctionNounId === undefined) {
        setOnDisplayAuctionNounId(Number(currentAuction.nounId));
      }
    }
  }, [
    currentAuction,
    onDisplayAuctionNounId,
    setAuction,
    setLastAuctionNounId,
    setOnDisplayAuctionNounId,
  ]);

  // Fetch the previous 24 hours of bids
  //
  // deps に currentAuction を含めるのは applyAppendBid が activeAuction 未 set の bid を捨てるため。
  // activeAuction は chain read (useReadNijiAuctionHouseAuction) の非同期解決で入るので、 本 effect が
  // mount 直後の 1 回だけ走ると全 bid が捨てられて履歴が空になる (2026-07-21 に Base Sepolia で顕在化)。
  //
  // fromBlock は「直近 24 時間」 を block 数で近似する。 Ethereum の 12 秒/block を前提にした 7200 では
  // Base (2 秒/block) で 4 時間分にしかならないため、 chain の block time から算出する。
  useEffect(() => {
    if (CHAIN_ID === hardhat.id) {
      return;
    }
    if (!currentAuction) {
      return;
    }
    (async () => {
      const latestBlock = await publicClient.getBlock();
      // 24h 相当の block 数 = 86400 秒 / block time。 Base 系 (2 秒) は 43200、 Ethereum (12 秒) は 7200。
      const blocksPerDay = CHAIN_ID === baseSepolia.id ? 43_200n : 7_200n;
      const fromBlock = latestBlock.number > blocksPerDay ? latestBlock.number - blocksPerDay : 0n;

      // public RPC (sepolia.base.org 等) は eth_getLogs を 2000 block/req に制限する。
      // 1 回で 24h 分を要求すると "query exceeds max block range 2000" で失敗し、 履歴が空になる
      // (2026-07-21 に Base Sepolia で顕在化)。 chunk に割って順次取得し、 失敗 chunk は握って続行する。
      const MAX_RANGE = 2_000n;
      const bidEvent = parseAbiItem(
        'event AuctionBid(uint256 indexed nounId, address sender, uint256 value, bool extended)',
      );
      const ranges: { from: bigint; to: bigint }[] = [];
      for (let start = fromBlock; start <= latestBlock.number; start += MAX_RANGE) {
        const end =
          start + MAX_RANGE - 1n > latestBlock.number ? latestBlock.number : start + MAX_RANGE - 1n;
        ranges.push({ from: start, to: end });
      }
      const chunks = await Promise.all(
        ranges.map(range =>
          publicClient
            .getLogs({
              address: nijiAuctionHouseAddress[chainId],
              event: bidEvent,
              fromBlock: range.from,
              toBlock: range.to,
            })
            // rate limit / 一時障害の chunk は捨てて残りを活かす (履歴が部分欠けでも UI は動く)
            .catch(() => []),
        ),
      );
      const logs = chunks.flat();

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

        // fiat 代理入札 (createBidFor) の場合、 同 tx 内で BidPlacedFor event が emit される。
        // recipient = 実 user wallet を取り出して bidder 表示を運営 EOA から user wallet に置換する。
        const { effectiveSender, isFiat } = await resolveBidderFromReceipt(
          publicClient,
          transactionHash as `0x${string}` | null,
          sender as Address,
        );

        const bidPayload = reduxSafeBid({
          nounId: Number(nounId),
          sender: effectiveSender,
          value: Number(value),
          extended: extended !== undefined,
          transactionHash: transactionHash ?? '',
          transactionIndex: transactionIndex ?? 0,
          timestamp,
          isFiat,
        });
        setAuction(prev => applyAppendBid(prev, bidPayload));
      }
    })();
  }, [chainId, publicClient, setAuction, currentAuction]);

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

        const { effectiveSender, isFiat } = await resolveBidderFromReceipt(
          publicClient,
          transactionHash as `0x${string}` | null,
          sender as Address,
        );

        const bidPayload = reduxSafeBid({
          nounId: Number(nounId),
          sender: effectiveSender,
          value: Number(value),
          extended: extended !== undefined,
          transactionHash: transactionHash ?? '',
          transactionIndex: transactionIndex ?? 0,
          timestamp,
          isFiat,
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
        setOnDisplayAuctionNounId(nounIdNumber);
        setLastAuctionNounId(nounIdNumber);
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
  const latestAuctionId = useAtomValue(lastAuctionNounIdAtom);
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
    </TooltipProvider>
  </ThemeProvider>,
);
