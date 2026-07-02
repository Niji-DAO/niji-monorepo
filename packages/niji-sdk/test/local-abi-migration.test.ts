/**
 * GH #3003 の regression 検出 test。
 *
 * niji-sdk の generated abi が etherscan 経由 (Nouns 旧 address から fetch)
 * だと Niji fork 後の interface 変更 (seeds の 5→12 outputs / descriptor 関数
 * 再構成) が反映されず、 runtime で trait 描画が壊れる事故を防ぐため、
 * 本 file は 4 contract (Token / Descriptor / AuctionHouse / Seeder) の abi
 * について Niji 固有関数 / seeds 12 outputs / descriptor 新関数の存在を
 * assert する。 abi が Nouns 旧に戻ったら本 test が fail する。
 */

import { describe, expect, it } from 'vitest';

import {
  nijiAuctionHouseAbi,
  nijiDescriptorAbi,
  nijiSeederAbi,
  nijiTokenAbi,
} from '../src/actions';

describe('local abi migration (GH #3003)', () => {
  describe('nijiTokenAbi.seeds は Niji 12 outputs', () => {
    it('seeds function を持つ', () => {
      const seedsFn = nijiTokenAbi.find(
        item => item.type === 'function' && 'name' in item && item.name === 'seeds',
      );
      expect(seedsFn).toBeDefined();
    });

    it('seeds outputs は Niji 12 trait (special / choker / headphone / leftHand / hat / clothing / ear / back / backDecoration / background / solidBackground / hair)', () => {
      const seedsFn = nijiTokenAbi.find(
        item => item.type === 'function' && 'name' in item && item.name === 'seeds',
      );
      expect(seedsFn).toBeDefined();
      const outputs = (seedsFn as { outputs: readonly { name: string; type: string }[] }).outputs;
      expect(outputs).toHaveLength(12);

      const expectedNames = [
        'special',
        'choker',
        'headphone',
        'leftHand',
        'hat',
        'clothing',
        'ear',
        'back',
        'backDecoration',
        'background',
        'solidBackground',
        'hair',
      ];
      expect(outputs.map(o => o.name)).toEqual(expectedNames);
      expect(outputs.every(o => o.type === 'uint48')).toBe(true);
    });

    it('Nouns 旧 5 outputs (background / body / accessory / head / glasses) は含まない', () => {
      const seedsFn = nijiTokenAbi.find(
        item => item.type === 'function' && 'name' in item && item.name === 'seeds',
      );
      const outputs = (seedsFn as { outputs: readonly { name: string; type: string }[] }).outputs;
      const names = outputs.map(o => o.name);
      expect(names).not.toContain('body');
      expect(names).not.toContain('accessory');
      expect(names).not.toContain('head');
      expect(names).not.toContain('glasses');
    });
  });

  describe('nijiDescriptorAbi は Niji 新関数群を持つ', () => {
    it('art / compositeOrder / generateSVG / tokenURI / SKIP_LAYER の Niji 固有関数を持つ', () => {
      const fnNames = nijiDescriptorAbi
        .filter(item => item.type === 'function')
        .map(item => ('name' in item ? item.name : ''));

      expect(fnNames).toContain('art');
      expect(fnNames).toContain('compositeOrder');
      expect(fnNames).toContain('generateSVG');
      expect(fnNames).toContain('tokenURI');
      expect(fnNames).toContain('SKIP_LAYER');
      expect(fnNames).toContain('setCompositeOrder');
    });

    it('Nouns 旧関数 (backgrounds / bodies / accessories / heads / glasses / palettes / addManyBodies) は含まない', () => {
      const fnNames = nijiDescriptorAbi
        .filter(item => item.type === 'function')
        .map(item => ('name' in item ? item.name : ''));

      expect(fnNames).not.toContain('backgrounds');
      expect(fnNames).not.toContain('bodies');
      expect(fnNames).not.toContain('accessories');
      expect(fnNames).not.toContain('heads');
      expect(fnNames).not.toContain('glasses');
      expect(fnNames).not.toContain('palettes');
      expect(fnNames).not.toContain('addManyBodies');
      expect(fnNames).not.toContain('addManyBackgrounds');
    });
  });

  describe('nijiAuctionHouseAbi は Niji V3 関数群を持つ', () => {
    it('auctionStorage / getSettlements / warmUpSettlementState 等 V3 関数を持つ', () => {
      const fnNames = nijiAuctionHouseAbi
        .filter(item => item.type === 'function')
        .map(item => ('name' in item ? item.name : ''));

      expect(fnNames).toContain('auctionStorage');
      expect(fnNames).toContain('getSettlements');
      expect(fnNames).toContain('getSettlementsFromIdtoTimestamp');
      expect(fnNames).toContain('warmUpSettlementState');
      expect(fnNames).toContain('createBid');
      expect(fnNames).toContain('settleCurrentAndCreateNewAuction');
    });
  });

  describe('nijiSeederAbi は Niji generateSeed 12 outputs を持つ', () => {
    it('generateSeed function は 12 outputs tuple を返す', () => {
      const generateSeedFn = nijiSeederAbi.find(
        item => item.type === 'function' && 'name' in item && item.name === 'generateSeed',
      );
      expect(generateSeedFn).toBeDefined();

      const outputs = (
        generateSeedFn as {
          outputs: readonly {
            type: string;
            components?: readonly { name: string; type: string }[];
          }[];
        }
      ).outputs;
      expect(outputs).toHaveLength(1);
      expect(outputs[0].type).toBe('tuple');
      expect(outputs[0].components).toHaveLength(12);

      const componentNames = outputs[0].components!.map(c => c.name);
      expect(componentNames).toEqual([
        'special',
        'choker',
        'headphone',
        'leftHand',
        'hat',
        'clothing',
        'ear',
        'back',
        'backDecoration',
        'background',
        'solidBackground',
        'hair',
      ]);
    });

    it('generateSeedFromSource / getAllTraitCounts / getTraitCount 等 helper 関数も持つ', () => {
      const fnNames = nijiSeederAbi
        .filter(item => item.type === 'function')
        .map(item => ('name' in item ? item.name : ''));

      expect(fnNames).toContain('generateSeedFromSource');
      expect(fnNames).toContain('getAllTraitCounts');
      expect(fnNames).toContain('getTraitCount');
    });
  });
});
