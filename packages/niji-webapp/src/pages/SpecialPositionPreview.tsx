/**
 * SpecialPositionPreview — special trait の compositeOrder 位置 12 variation × special variant を
 * tab 切替で並列比較する dev-only preview page (Issue #3110)。
 *
 * user 意思決定用 = 「special をどの z-order 位置に置くか」 悩む際に、 同一 seed で position 0-11 に
 * 移動した SVG grid を tab (special variant) 越しに横並び比較する。
 *
 * 現行 compositeOrder = packages/niji-webapp/src/lib/nijiAssets.ts SSOT の compositeOrder に一致。
 * dev only route (CHAIN_ID === '31337' でのみ App.tsx から expose)。
 */
import type { NijiSeed } from '@/lib/nijiAssets';

import { type FC, useMemo, useState } from 'react';

import { buildSVG, PNGCollectionEncoder } from '@niji/sdk';

import { NijiImageData } from '@/lib/nijiAssets';

const BASE_ORDER = [
  'solidBackground',
  'background',
  'backDecoration',
  'back',
  'leftHand',
  'clothing',
  'ear',
  'special',
  'choker',
  'hat',
  'hair',
  'headphone',
] as const satisfies readonly (keyof NijiSeed)[];

const orderWithSpecialAt = (position: number): readonly (keyof NijiSeed)[] => {
  const withoutSpecial = BASE_ORDER.filter(k => k !== 'special');
  return [...withoutSpecial.slice(0, position), 'special', ...withoutSpecial.slice(position)];
};

const encoder = new PNGCollectionEncoder(NijiImageData.palette);

const buildForSpecialVariant = (specialIndex: number) => {
  const seed: NijiSeed = {
    solidBackground: 0,
    background: 0,
    backDecoration: 0,
    back: 0,
    leftHand: 0,
    clothing: 0,
    ear: 0,
    special: specialIndex,
    choker: 0,
    hat: 0,
    hair: 0,
    headphone: 0,
  };
  return Array.from({ length: 12 }, (_, position) => {
    const order = orderWithSpecialAt(position);
    const parts = order
      .map(key => NijiImageData.images[key][seed[key]])
      .filter(
        (part): part is { filename: string; data: string } =>
          part != null && typeof part.data === 'string',
      );
    const svg = buildSVG(parts, encoder.data.palette, undefined);
    return { position, order, svg };
  });
};

const positionNote = (position: number): string => {
  if (position === 0) return '最背面';
  if (position === 11) return '最前面';
  return `後ろから ${position + 1} 番目 / 手前から ${12 - position} 番目`;
};

const SpecialPositionPreview: FC = () => {
  const specialVariants = useMemo(
    () =>
      NijiImageData.images.special.map((img, index) => ({
        index,
        filename: img.filename,
        variations: buildForSpecialVariant(index),
      })),
    [],
  );
  const [activeVariant, setActiveVariant] = useState(0);
  const active = specialVariants[activeVariant];

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-8">
      <header className="mb-6">
        <h1 className="mb-1.5 text-2xl font-bold tracking-tight">
          Niji <span className="text-[#d81a3f]">special</span> position preview
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          同一 seed で <strong>special</strong> の compositeOrder 位置を 0 (最背面) → 11 (最前面) の
          12 パターン描画。 現行 = position 7 (Issue #3066)。 special variant は tab で切替。
        </p>
      </header>
      <div className="mb-5 flex gap-2 border-b border-neutral-200 dark:border-neutral-800">
        {specialVariants.map(v => (
          <button
            key={v.index}
            type="button"
            onClick={() => setActiveVariant(v.index)}
            className={`rounded-t-md px-5 py-2.5 text-sm font-medium transition-colors ${
              v.index === activeVariant
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                : 'bg-neutral-100 text-neutral-500 hover:text-neutral-900 dark:bg-neutral-800 dark:hover:text-neutral-100'
            }`}
          >
            special #{v.index} ({v.filename})
          </button>
        ))}
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
        {active.variations.map(v => {
          const isCurrent = v.position === 7;
          return (
            <div
              key={v.position}
              className="flex flex-col gap-1.5 rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <p className="m-0 flex items-center gap-1.5 text-sm font-semibold">
                position {v.position}
                {isCurrent && (
                  <span className="rounded bg-[#d81a3f] px-1.5 py-px text-[10px] font-semibold tracking-wide text-white">
                    現行
                  </span>
                )}
              </p>
              <p className="m-0 text-[11px] tracking-wide text-neutral-500 dark:text-neutral-400">
                {positionNote(v.position)}
              </p>
              <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-md bg-[repeating-conic-gradient(rgba(0,0,0,0.03)_0_25%,transparent_0_50%)] [background-size:16px_16px] dark:bg-[repeating-conic-gradient(rgba(255,255,255,0.05)_0_25%,transparent_0_50%)]">
                <div
                  className="[&_svg]:block [&_svg]:h-full [&_svg]:w-full"
                  dangerouslySetInnerHTML={{ __html: v.svg }}
                />
              </div>
              <p className="m-0 break-all font-mono text-[10px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                {v.order.map((k, i) => (
                  <span key={i}>
                    <span className={k === 'special' ? 'font-semibold text-[#d81a3f]' : ''}>
                      {k}
                    </span>
                    {i < v.order.length - 1 && ' › '}
                  </span>
                ))}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SpecialPositionPreview;
