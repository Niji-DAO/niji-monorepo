import type { INounSeed } from '@/wrappers/nijiToken';

import { useMemo } from 'react';

import { Trans } from '@lingui/react/macro';
import {
  nijiSeederAbi,
  useReadNijiAuctionHouseAuctionStorage,
  useReadNijiTokenDescriptor,
  useReadNijiTokenSeeder,
} from '@niji/sdk/react';
import { useReadContracts } from 'wagmi';

import { NijiWithSeed } from '@/components/Niji';

// seeder address は runtime で NijiToken.seeder() から解決するため、 abi のみ
// @niji/sdk 経由で参照する。 GH #3003 で local abi 経路に統一済。
const PREVIEW_COUNT = 5;

interface SeedTuple {
  special: number;
  choker: number;
  headphone: number;
  leftHand: number;
  hat: number;
  clothing: number;
  ear: number;
  back: number;
  backDecoration: number;
  background: number;
  solidBackground: number;
  hair: number;
}

const toINounSeed = (raw: SeedTuple): INounSeed => ({
  special: Number(raw.special),
  choker: Number(raw.choker),
  headphone: Number(raw.headphone),
  leftHand: Number(raw.leftHand),
  hat: Number(raw.hat),
  clothing: Number(raw.clothing),
  ear: Number(raw.ear),
  back: Number(raw.back),
  backDecoration: Number(raw.backDecoration),
  background: Number(raw.background),
  solidBackground: Number(raw.solidBackground),
  hair: Number(raw.hair),
});

function CrystalBallPage() {
  // 現在 active な auction の nounId を取得 (次の Niji は nounId + 1)
  const { data: auctionData } = useReadNijiAuctionHouseAuctionStorage();
  const { data: seederAddr } = useReadNijiTokenSeeder();
  const { data: descriptorAddr } = useReadNijiTokenDescriptor();

  const currentNounId = useMemo(() => {
    if (!auctionData) return undefined;
    // auctionStorage は tuple、 [nounId, ...] の先頭
    return Array.isArray(auctionData) ? BigInt(auctionData[0]) : undefined;
  }, [auctionData]);

  const nextNounIds = useMemo<bigint[]>(() => {
    if (currentNounId === undefined) return [];
    return Array.from({ length: PREVIEW_COUNT }, (_, i) => currentNounId + BigInt(i + 1));
  }, [currentNounId]);

  const ready = seederAddr !== undefined && descriptorAddr !== undefined && nextNounIds.length > 0;

  const { data: seedResults } = useReadContracts({
    contracts: ready
      ? nextNounIds.map(nounId => ({
          address: seederAddr,
          abi: nijiSeederAbi,
          functionName: 'generateSeed' as const,
          args: [nounId, descriptorAddr] as const,
        }))
      : [],
    query: { enabled: ready },
  });

  return (
    <main className="mx-auto my-10 flex max-w-5xl flex-col gap-8 px-4">
      <header>
        <h1 className="text-3xl font-bold">
          🔮 <Trans>Niji Crystal Ball</Trans>
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          <Trans>
            次に登場する Niji をブロックチェーン上の seed 生成ロジックで先取り。
            現在オークション中の Niji の次から 5 体先までを予測表示します。
          </Trans>
        </p>
        {currentNounId !== undefined && (
          <p className="mt-1 text-xs text-slate-500">
            <Trans>現在オークション中</Trans>: Niji #{currentNounId.toString()}
          </p>
        )}
      </header>

      <section className="grid grid-cols-2 gap-6 md:grid-cols-5">
        {nextNounIds.map((nounId, idx) => {
          const result = seedResults?.[idx];
          const tuple = result?.result as SeedTuple | undefined;
          const seed = tuple ? toINounSeed(tuple) : undefined;
          return (
            <div
              key={nounId.toString()}
              className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
            >
              <div className="text-xs font-semibold text-slate-500">+{idx + 1}</div>
              <div className="aspect-square w-full overflow-hidden rounded-md bg-slate-100">
                {seed !== undefined ? (
                  <NijiWithSeed nounId={nounId} seed={seed} shouldLinkToProfile={false} />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-slate-400">
                    <Trans>計算中…</Trans>
                  </div>
                )}
              </div>
              <div className="text-sm font-semibold">Niji #{nounId.toString()}</div>
            </div>
          );
        })}
      </section>

      <footer className="text-xs text-slate-500">
        <p>
          <Trans>
            ※ Niji Seeder の seed 生成は keccak256(blockhash + tokenId + timestamp + prevrandao)
            をシードに使うため、 実際に mint される block の hash で seed が確定します。
            ここでの予測は現時点 (latest block) で chain に問い合わせた view 結果なので、 実際の
            auction 開始 block と異なれば絵柄も変わります。
          </Trans>
        </p>
      </footer>
    </main>
  );
}

export default CrystalBallPage;
