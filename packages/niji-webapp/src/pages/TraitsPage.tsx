import type { INounSeed } from '@/wrappers/nijiToken';

import { type FC, useEffect, useState } from 'react';

import { Trans } from '@lingui/react/macro';
import { buildSVG, PNGCollectionEncoder } from '@niji/sdk';
import JSZip from 'jszip';
import { CopyIcon, DownloadIcon, PackageIcon } from 'lucide-react';
import { toast } from 'sonner';

import CCZero from '@/assets/cczero-badge.svg?react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { humanizeTraitKey, NijiImageData, nijiTraitKeys } from '@/lib/nijiAssets';
import { traitName } from '@/lib/traitName';
import { svg2png } from '@/utils/svg2png';

interface TraitItem {
  name: string;
  filename: string;
  svg: string;
  category: string;
  type: string;
  index: number;
}

const encoder = new PNGCollectionEncoder(NijiImageData.palette);

const downloadSVG = (svg: string, filename: string) => {
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const downloadEl = document.createElement('a');
  downloadEl.href = url;
  downloadEl.download = `${filename}.svg`;
  downloadEl.click();
  URL.revokeObjectURL(url);
};

const downloadPNG = async (svg: string, filename: string) => {
  try {
    const png = await svg2png(svg, 512, 512);
    if (png) {
      const downloadEl = document.createElement('a');
      downloadEl.href = png;
      downloadEl.download = `${filename}.png`;
      downloadEl.click();
    }
  } catch (error) {
    console.error('Error converting SVG to PNG:', error);
  }
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`Copied ${text} to clipboard`, { duration: 5000 });
  } catch (error) {
    console.error('Failed to copy:', error);
    toast.error('Failed to copy to clipboard');
  }
};

/**
 * 全 trait を async iteration で構築、 category ごとに main thread を yield する。
 *
 * buildSVG は PNG rle decode + SVG assemble で per-image 数 ms、
 * nijiTraitKeys 12 category × 数十 image = 数百 iteration を 1 tick で回すと
 * 数秒 main thread blocking で「Loading traits...」 が固まる問題を回避する。
 *
 * 各 category 完了時に onChunk callback で partial 結果を返し、
 * progressive render で UX を fresh に保つ。
 */
const generateTraitItemsAsync = async (
  onChunk: (chunk: TraitItem[]) => void,
): Promise<TraitItem[]> => {
  const all: TraitItem[] = [];
  for (const traitType of nijiTraitKeys) {
    const categoryTitle = humanizeTraitKey(traitType);
    const images = NijiImageData.images[traitType];
    const chunk: TraitItem[] = [];
    images.forEach((imageData, index: number) => {
      if (imageData.data === undefined) {
        return;
      }
      const name = traitName(traitType as keyof INounSeed, index);
      const svg = buildSVG([imageData], encoder.data.palette, undefined);
      chunk.push({
        name,
        filename: imageData.filename,
        svg,
        category: categoryTitle,
        type: traitType,
        index,
      });
    });
    all.push(...chunk);
    onChunk([...all]);
    // 1 category 完了ごとに main thread を yield、 React 側 re-render + input event を通す。
    await new Promise<void>(resolve => setTimeout(resolve, 0));
  }
  return all;
};

const TraitsPage: FC = () => {
  const [traits, setTraits] = useState<TraitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [zipLoading, setZipLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void generateTraitItemsAsync(chunk => {
      if (cancelled) return;
      setTraits(chunk);
      // 最初の category が来た時点で loading 解除、 以降は progressive append 表示
      setLoading(false);
    }).catch(err => {
      // 例外時も UI freeze しないよう loading 解除、 空 traits 状態で復帰
      console.error('[TraitsPage] generateTraitItemsAsync failed', err);
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const downloadAllTraitsAsZip = async () => {
    if (zipLoading) return;

    setZipLoading(true);
    try {
      const zip = new JSZip();

      // Group traits by category for organized folder structure
      const traitsByCategory = traits.reduce(
        (acc, trait) => {
          if (acc[trait.category] === undefined) {
            acc[trait.category] = [];
          }
          acc[trait.category].push(trait);
          return acc;
        },
        {} as Record<string, TraitItem[]>,
      );

      for (const [category, categoryTraits] of Object.entries(traitsByCategory)) {
        const categoryFolder = zip.folder(category);

        for (const trait of categoryTraits) {
          const indexedFilename = `${trait.index}-${trait.filename}`;
          categoryFolder?.file(`${indexedFilename}.svg`, trait.svg);
          try {
            const pngBlob = await svg2png(trait.svg, 512, 512);
            if (pngBlob) {
              const response = await fetch(pngBlob);
              const blob = await response.blob();
              categoryFolder?.file(`${indexedFilename}.png`, blob);
            }
          } catch (error) {
            console.warn(`Failed to convert ${trait.filename} to PNG:`, error);
          }
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const downloadEl = document.createElement('a');
      downloadEl.href = URL.createObjectURL(zipBlob);
      downloadEl.download = 'niji-traits.zip';
      downloadEl.click();
      URL.revokeObjectURL(downloadEl.href);

      toast.success('All traits downloaded as ZIP file!', { duration: 5000 });
    } catch (error) {
      console.error('Error creating ZIP file:', error);
      toast.error('Failed to create ZIP file');
    } finally {
      setZipLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Trans>Loading traits...</Trans>
        </div>
      </div>
    );
  }

  // Group traits by category
  const traitsByCategory = traits.reduce(
    (acc, trait) => {
      if (acc[trait.category] === undefined) {
        acc[trait.category] = [];
      }
      acc[trait.category].push(trait);
      return acc;
    },
    {} as Record<string, TraitItem[]>,
  );

  const orderedCategories = nijiTraitKeys
    .map(humanizeTraitKey)
    .filter(category => traitsByCategory[category] !== undefined);

  return (
    <div className="container mx-auto px-4 pt-8">
      <div className="mb-8">
        <div>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h1 className="mt-2 text-5xl font-bold text-gray-900">
              <Trans>Traits</Trans>
            </h1>
            <Button
              onClick={downloadAllTraitsAsZip}
              disabled={zipLoading}
              className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800"
            >
              <PackageIcon size={16} />
              {zipLoading ? <Trans>Creating ZIP...</Trans> : <Trans>Download All</Trans>}
            </Button>
          </div>
          <p className="mt-4 text-lg text-gray-600">
            <Trans>Browse and download all available Niji traits.</Trans>
          </p>
        </div>
      </div>

      {orderedCategories.map(category => (
        <div key={category} className="mb-12">
          <h2 className="font-londrina mb-6 text-3xl font-bold text-gray-900">{category}</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6">
            {traitsByCategory[category].map(trait => (
              <Dialog key={trait.filename}>
                <DialogTrigger asChild>
                  <div className="flex h-full cursor-pointer flex-col rounded-lg border border-gray-200 bg-white p-2 transition-shadow hover:shadow-md">
                    <div className="bg-checkerboard mb-2 flex aspect-square items-center justify-center overflow-hidden rounded-lg shadow-inner">
                      <img
                        src={`data:image/svg+xml;base64,${btoa(trait.svg)}`}
                        alt={trait.name}
                        className="h-full w-full object-contain drop-shadow"
                      />
                    </div>
                    <div className="flex flex-1 items-center justify-center">
                      <h3 className="text-center text-sm font-medium text-gray-900">
                        {trait.name}
                      </h3>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-[min(calc(100vw-2rem),28rem)] rounded-xl">
                  <DialogHeader>
                    <DialogTitle>
                      {trait.name} {humanizeTraitKey(trait.type as keyof INounSeed)}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center space-y-4">
                    <div className="bg-checkerboard flex aspect-square max-w-96 items-center justify-center overflow-hidden rounded-lg shadow-inner">
                      <img
                        src={`data:image/svg+xml;base64,${btoa(trait.svg)}`}
                        alt={trait.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => downloadSVG(trait.svg, trait.filename)}
                        className="flex items-center gap-2"
                      >
                        <DownloadIcon size={16} />
                        SVG
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => downloadPNG(trait.svg, trait.filename)}
                        className="flex items-center gap-2"
                      >
                        <DownloadIcon size={16} />
                        PNG
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => copyToClipboard(trait.filename)}
                        className="flex items-center gap-2"
                      >
                        <CopyIcon size={16} />
                        <Trans>Filename</Trans>
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </div>
      ))}

      <section className="mt-12 border-t border-gray-200 pt-12">
        <h2 className="font-londrina text-3xl font-bold text-gray-900">
          <Trans>License</Trans>
        </h2>
        <div className="mt-6 items-start gap-6">
          <p className="max-w-2xl text-lg text-gray-600">
            <Trans>
              All traits are{' '}
              <a
                href="https://creativecommons.org/public-domain/cc0/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
              >
                CC0
              </a>{' '}
              (Creative Commons Zero), meaning they are in the public domain and free to use for any
              purpose without restriction.
            </Trans>
          </p>
          <CCZero className="mt-6 h-16" />
        </div>
      </section>
    </div>
  );
};

export default TraitsPage;
