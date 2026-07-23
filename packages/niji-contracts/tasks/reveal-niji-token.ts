import { task } from 'hardhat/config';

/**
 * NijiToken の tokenURI を placeholder (`ipfs://niji-placeholder/metadata.json`) から
 * on-chain SVG (`descriptor.tokenURI` 経路) に切替える 1-shot task。
 *
 * 動作 =
 *   (1) owner (deployer) 一致 check、 owner 以外は revert 前に fail
 *   (2) `isRevealed()` を pre-check、 既に true なら「reveal 済」 と早期終了 (idempotent 化)
 *   (3) `reveal()` 発火、 tx confirm 待ち
 *   (4) `isRevealed()` post-check + `tokenURI(1)` を試し呼び (SVG data URI が返るか目視 log)
 *
 * 使い方 =
 *   pnpm --dir packages/niji-contracts hardhat reveal-niji-token \
 *     --token 0xE8470ff7F6028d37f60C8c8CA79C7426031b3D35 \
 *     --network base-sepolia
 *
 * 前提 = .env に DEPLOYER_PK (= NijiToken owner) が入っている。
 * 不可逆 = 一度 reveal した token は placeholder モードに戻せない (`RevealAlreadyDone` revert)。
 */
task('reveal-niji-token', 'Reveal NijiToken tokenURI (placeholder → on-chain SVG)')
  .addParam('token', 'NijiToken address')
  .setAction(async (args, { ethers, network }) => {
    const [signer] = await ethers.getSigners();
    const tokenAddr = args.token as string;

    console.log(`[reveal-token] network=${network.name} signer=${signer.address}`);
    console.log(`[reveal-token] token=${tokenAddr}`);

    const iface = new ethers.Interface([
      'function owner() view returns (address)',
      'function isRevealed() view returns (bool)',
      'function reveal() external',
      'function tokenURI(uint256 tokenId) view returns (string)',
    ]);
    const token = new ethers.Contract(tokenAddr, iface, signer);

    const ownerAddr = (await token.owner()) as string;
    if (ownerAddr.toLowerCase() !== signer.address.toLowerCase()) {
      throw new Error(
        `signer (${signer.address}) is not owner (${ownerAddr}). Cannot reveal.`,
      );
    }

    const already = (await token.isRevealed()) as boolean;
    if (already) {
      console.log('[reveal-token] already revealed, nothing to do');
      const preview = (await token.tokenURI(1)) as string;
      console.log(`[reveal-token] tokenURI(1) first 100 chars: ${preview.slice(0, 100)}`);
      return;
    }

    console.log('[reveal-token] pre-check OK, sending reveal() tx...');
    const tx = await token.reveal();
    console.log(`[reveal-token] tx=${tx.hash} (waiting confirm...)`);
    await tx.wait();
    console.log('[reveal-token] reveal confirmed');

    const now = (await token.isRevealed()) as boolean;
    console.log(`[reveal-token] isRevealed post-check = ${now}`);

    try {
      const preview = (await token.tokenURI(1)) as string;
      console.log(`[reveal-token] tokenURI(1) length: ${preview.length}`);
      console.log(`[reveal-token] tokenURI(1) first 100 chars: ${preview.slice(0, 100)}`);
      if (preview.startsWith('data:application/json;base64,')) {
        console.log('[reveal-token] → on-chain data URI 経路が active (期待どおり)');
      } else if (preview.startsWith('ipfs://')) {
        console.log('[reveal-token] → base URI (IPFS) 経路が active');
      } else {
        console.log('[reveal-token] → unexpected form、 手動確認要');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[reveal-token] tokenURI(1) call FAILED: ${message}`);
      console.error('[reveal-token] descriptor 側の revert 可能性あり、 log を確認して個別対処');
    }

    console.log('\n=== SUMMARY ===');
    console.log(`network:  ${network.name}`);
    console.log(`token:    ${tokenAddr}`);
    console.log(`tx:       ${tx.hash}`);
  });
