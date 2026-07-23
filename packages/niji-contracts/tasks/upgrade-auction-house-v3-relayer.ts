import { task } from 'hardhat/config';

/**
 * base-sepolia 上の deploy 済 NijiAuctionHouseV3 proxy に対して以下を発火する 1-shot task:
 *
 * (1) 新 V3 impl (createBidFor + grantRelayer + BidPlacedFor 追加版) を deploy
 * (2) proxy の実 admin (TransparentUpgradeableProxy の ERC-1967 admin slot から取得)
 *     の `upgrade(proxy, newImpl)` を発火して proxy を新 impl に差替え
 * (3) upgrade 済 proxy 上で `grantRelayer(deployer)` を発火 (deployer = backend の
 *     bidWalletClient signer = fiat 代理入札 relayer)
 *
 * 使い方 =
 *   pnpm --dir packages/niji-contracts hardhat upgrade-auction-house-v3-relayer \
 *     --proxy 0x449E337180402643Ea90148230fD57E534344225 \
 *     --relayer <deployer address, --relayer 省略時は signer address> \
 *     --network base-sepolia
 *
 * 前提 = .env に DEPLOYER_PK (= proxy owner + relayer 予定 address) が入っている。
 */
task('upgrade-auction-house-v3-relayer', 'Deploy new V3 impl, upgrade proxy, grant relayer')
  .addParam('proxy', 'NijiAuctionHouseProxy address')
  .addOptionalParam('relayer', 'address to grantRelayer (default = signer)')
  .setAction(async (args, { ethers, network }) => {
    const [signer] = await ethers.getSigners();
    const proxyAddr = args.proxy as string;
    const relayerAddr = (args.relayer as string) ?? signer.address;

    console.log(`[upgrade-v3] network=${network.name} signer=${signer.address}`);
    console.log(`[upgrade-v3] proxy=${proxyAddr} relayer=${relayerAddr}`);

    // 既存 proxy から nouns / weth / duration を取得して constructor 引数に再利用
    const auctionV3Iface = new ethers.Interface([
      'function nouns() view returns (address)',
      'function weth() view returns (address)',
      'function duration() view returns (uint256)',
      'function owner() view returns (address)',
    ]);
    const auctionV3 = new ethers.Contract(proxyAddr, auctionV3Iface, ethers.provider);
    const [nounsAddr, wethAddr, duration, ownerAddr] = await Promise.all([
      auctionV3.nouns() as Promise<string>,
      auctionV3.weth() as Promise<string>,
      auctionV3.duration() as Promise<bigint>,
      auctionV3.owner() as Promise<string>,
    ]);
    console.log(
      `[upgrade-v3] existing nouns=${nounsAddr} weth=${wethAddr} duration=${duration} owner=${ownerAddr}`,
    );
    if (ownerAddr.toLowerCase() !== signer.address.toLowerCase()) {
      throw new Error(
        `signer (${signer.address}) is not owner (${ownerAddr}). Cannot upgrade or grant relayer.`,
      );
    }

    // (1) 新 impl deploy
    const V3Factory = await ethers.getContractFactory('NijiAuctionHouseV3', signer);
    const newImpl = await V3Factory.deploy(nounsAddr, wethAddr, duration);
    await newImpl.waitForDeployment();
    const newImplAddr = await newImpl.getAddress();
    console.log(`[upgrade-v3] new impl deployed: ${newImplAddr}`);

    // (2) ProxyAdmin address を ERC-1967 admin slot から取得
    // (https://eips.ethereum.org/EIPS/eip-1967 の bytes32(uint256(keccak256("eip1967.proxy.admin")) - 1))
    const ADMIN_SLOT = '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103';
    const adminSlotHex = await ethers.provider.getStorage(proxyAddr, ADMIN_SLOT);
    const proxyAdminAddr = ethers.getAddress('0x' + adminSlotHex.slice(-40));
    console.log(`[upgrade-v3] proxy admin (from ERC-1967 slot)=${proxyAdminAddr}`);

    const proxyAdminIface = new ethers.Interface([
      'function owner() view returns (address)',
      'function upgrade(address proxy, address impl) external',
    ]);
    const proxyAdmin = new ethers.Contract(proxyAdminAddr, proxyAdminIface, signer);
    const proxyAdminOwner = (await proxyAdmin.owner()) as string;
    if (proxyAdminOwner.toLowerCase() !== signer.address.toLowerCase()) {
      throw new Error(
        `signer (${signer.address}) is not ProxyAdmin owner (${proxyAdminOwner}). Cannot upgrade proxy.`,
      );
    }
    const upgradeTx = await proxyAdmin.upgrade(proxyAddr, newImplAddr);
    console.log(`[upgrade-v3] upgrade tx=${upgradeTx.hash} (waiting confirm...)`);
    await upgradeTx.wait();
    console.log(`[upgrade-v3] upgrade confirmed`);

    // (3) grantRelayer 発火
    const V3WithGrantIface = new ethers.Interface([
      'function grantRelayer(address relayer) external',
      'function isRelayer(address) view returns (bool)',
    ]);
    const upgradedProxy = new ethers.Contract(proxyAddr, V3WithGrantIface, signer);
    const grantTx = await upgradedProxy.grantRelayer(relayerAddr);
    console.log(`[upgrade-v3] grantRelayer tx=${grantTx.hash} (waiting confirm...)`);
    await grantTx.wait();
    const isRel = (await upgradedProxy.isRelayer(relayerAddr)) as boolean;
    console.log(`[upgrade-v3] grantRelayer confirmed, isRelayer(${relayerAddr})=${isRel}`);

    console.log('\n=== SUMMARY ===');
    console.log(`network:  ${network.name}`);
    console.log(`proxy:    ${proxyAddr}`);
    console.log(`new impl: ${newImplAddr}`);
    console.log(`admin:    ${proxyAdminAddr}`);
    console.log(`relayer:  ${relayerAddr}`);
    console.log(`upgrade block: ${(await ethers.provider.getBlock('latest'))?.number}`);
  });
