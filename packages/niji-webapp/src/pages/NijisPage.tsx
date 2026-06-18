import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Trans } from '@lingui/react/macro';
import { useVirtualizer } from '@tanstack/react-virtual';
import { motion } from 'motion/react';
import { range } from 'remeda';

import { Niji } from '@/components/Niji';
import { Trait } from '@/components/Trait';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppSelector } from '@/hooks';
import { useBreakpointValues } from '@/hooks/useBreakpointValues';
import { humanizeTraitKey, nijiTraitKeys } from '@/lib/nijiAssets';
import { traitName } from '@/lib/traitName';
import { Auction as IAuction } from '@/wrappers/nijiAuction';
import { useNounSeed } from '@/wrappers/nijiToken';

type NijisPageProps = object;

const sortOptions = [
  {
    label: 'Latest',
    value: 'date-descending',
  },
  {
    label: 'Oldest',
    value: 'date-ascending',
  },
] as const;

const NijisPage: React.FC<NijisPageProps> = () => {
  const currentAuction: IAuction | undefined = useAppSelector(state => state.auction.activeAuction);
  const currentAuctionNijiId = currentAuction ? BigInt(currentAuction.nounId) : undefined;
  const nijiCount = currentAuctionNijiId !== undefined ? Number(currentAuctionNijiId) + 1 : -1;
  const [sortOrder, setSortOrder] =
    useState<(typeof sortOptions)[number]['value']>('date-descending');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nijisList = useMemo(() => range(0, nijiCount).map(BigInt), [nijiCount]);
  const [selectedNijiId, setSelectedNijiId] = useState<bigint | undefined>(currentAuctionNijiId);
  const selectedNijiSeed = useNounSeed(selectedNijiId ?? currentAuctionNijiId ?? 0n);

  useEffect(() => {
    if (selectedNijiId == undefined && currentAuctionNijiId != undefined) {
      setSelectedNijiId(currentAuctionNijiId);
    }
  }, [currentAuctionNijiId, selectedNijiId]);

  // Fixed grid settings
  const ITEM_SIZE = 96; // Fixed 96px size for miniatures
  const GAP_SIZE = 6;

  // Calculate items per row based on fixed container width
  const itemsPerRow =
    useBreakpointValues({
      xl: 8,
      lg: 7,
      md: 4,
      sm: 3,
    }) ?? 8;
  const totalRows = Math.ceil(nijiCount / itemsPerRow);

  const rowVirtualizer = useVirtualizer({
    count: totalRows,
    getScrollElement: () => containerRef.current,
    estimateSize: () => ITEM_SIZE + GAP_SIZE,
    overscan: 2,
  });

  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: itemsPerRow,
    getScrollElement: () => containerRef.current,
    estimateSize: () => ITEM_SIZE + GAP_SIZE,
    overscan: 2,
  });

  // Get the sorted nouns list
  const sortedNijisList = useMemo(() => {
    return sortOrder === 'date-ascending' ? nijisList : [...nijisList].reverse();
  }, [nijisList, sortOrder]);
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (selectedNijiId !== undefined && e.key === 'Escape') {
        setSelectedNijiId(undefined);
      }
      if (
        selectedNijiId !== undefined &&
        e.key === 'ArrowRight' &&
        selectedNijiId < BigInt(nijiCount) - 1n
      ) {
        setSelectedNijiId(selectedNijiId + 1n);
      }
      if (selectedNijiId !== undefined && e.key === 'ArrowLeft' && selectedNijiId > 0n) {
        setSelectedNijiId(selectedNijiId - 1n);
      }
    },
    [selectedNijiId, nijiCount],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <motion.div
      layout
      className="border-border mx-auto mt-1 flex h-[665px] w-fit overflow-clip rounded-2xl border"
    >
      {/* Explore Container */}
      <div className="hidden h-full flex-grow flex-col justify-between sm:flex">
        {/* Explore NavBar */}
        <div className="border-border flex items-center justify-between border-b px-6 py-4">
          <h3>
            <span>
              <Trans>Explore</Trans>
            </span>{' '}
            {nijiCount >= 0 && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <strong>{nijiCount}</strong> Nijis
              </motion.span>
            )}
          </h3>
          <Select
            defaultValue={sortOrder}
            onValueChange={value => setSortOrder(value as (typeof sortOptions)[number]['value'])}
          >
            <motion.div layout>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
            </motion.div>

            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option.label} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Explore Grid */}
        <motion.div
          layout
          ref={containerRef}
          className="w-fit flex-grow overflow-y-auto overscroll-contain !p-2 !pr-0 shadow-inner"
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: `${columnVirtualizer.getTotalSize()}px`,
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map(virtualRow => (
              <React.Fragment key={virtualRow.key}>
                {columnVirtualizer.getVirtualItems().map(virtualColumn => {
                  const itemIndex = virtualRow.index * itemsPerRow + virtualColumn.index;
                  if (itemIndex >= nijiCount) return null;

                  const nijiId = sortedNijisList[itemIndex];
                  return (
                    <div
                      key={nijiId}
                      onClick={() => {
                        setSelectedNijiId(nijiId);
                      }}
                      data-selected={selectedNijiId === nijiId}
                      className="motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in group absolute cursor-pointer overflow-clip rounded-2xl shadow-sm transition-all ease-in-out hover:shadow-lg motion-safe:hover:scale-105 motion-safe:data-[selected=true]:scale-105"
                      style={{
                        left: `${virtualColumn.start}px`,
                        top: `${virtualRow.start}px`,
                        width: `${ITEM_SIZE}px`,
                        height: `${ITEM_SIZE}px`,
                        animationDuration: `${virtualColumn.index * 50}ms`,
                      }}
                    >
                      <Niji
                        nounId={nijiId != null ? BigInt(nijiId) : undefined}
                        loadingNounFallback
                        minFallbackDuration={1000}
                        style={{
                          width: `${ITEM_SIZE}px`,
                          height: `${ITEM_SIZE}px`,
                        }}
                        className="bg-cool-background"
                      />
                      {selectedNijiId === nijiId && (
                        <div className="border-3 absolute inset-0 rounded-2xl border-black" />
                      )}
                      <span className="absolute bottom-1 left-1/2 hidden -translate-x-1/2 rounded-sm bg-white px-1 text-xs font-semibold shadow-sm group-hover:block group-data-[selected=true]:block">
                        {nijiId.toString()}
                      </span>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Selected Noun Details */}
      <motion.div layout className="border-border flex h-full flex-col border-l">
        <div className="bg-muted/40 flex h-full flex-col">
          {/* Noun Image */}
          <Niji
            nounId={selectedNijiId != undefined ? BigInt(selectedNijiId) : undefined}
            loadingNounFallback
            className="mx-auto size-[288px] object-cover"
          />

          {/* Noun Info Header */}
          <div className="bg-muted mx-2 flex items-center justify-between rounded-t-2xl px-3 py-2 shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (selectedNijiId !== undefined && selectedNijiId > 0n) {
                  setSelectedNijiId(selectedNijiId - 1n);
                }
              }}
              disabled={selectedNijiId === undefined || selectedNijiId <= 0n}
              className="size-6 rounded-full"
            >
              ←
            </Button>
            <h2 className="mx-2 text-2xl font-bold">
              <Trans>Niji</Trans> {selectedNijiId?.toString() ?? '...'}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (selectedNijiId !== undefined && selectedNijiId < BigInt(nijiCount - 1)) {
                  setSelectedNijiId(selectedNijiId + 1n);
                }
              }}
              disabled={selectedNijiId === undefined || selectedNijiId >= BigInt(nijiCount - 1)}
              className="size-6 rounded-full"
            >
              →
            </Button>
          </div>

          {/* Traits List */}
          <div className="flex-grow border-t bg-white p-2">
            <ul className="space-y-1">
              {nijiTraitKeys.map(traitType => {
                const traitIndex = selectedNijiSeed?.[traitType];
                if (traitIndex === undefined) {
                  return null;
                }

                return (
                  <li
                    key={traitType}
                    className="flex w-full items-center gap-2 border-b border-gray-200 pb-1 last:pb-0"
                  >
                    <Trait type={traitType} seed={traitIndex} className="size-12 rounded-md" />
                    <div className="flex w-full flex-col">
                      <span className="text-muted-foreground text-xs font-bold uppercase tracking-wide">
                        {humanizeTraitKey(traitType)}
                      </span>
                      <div>
                        <motion.span
                          className="max-w-20 whitespace-nowrap text-sm font-semibold"
                          // animate={{ x: ['0%', '-100%'] }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'linear',
                            repeatType: 'loop',
                          }}
                        >
                          {traitName(traitType, traitIndex)}
                        </motion.span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Go to auction link */}
            <div className="mt-1 text-center">
              <a
                href={`/niji/${selectedNijiId}`}
                className="text-sm font-bold text-red-600 hover:text-red-800 hover:no-underline"
              >
                <Trans>Go to auction</Trans>
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
export default NijisPage;
