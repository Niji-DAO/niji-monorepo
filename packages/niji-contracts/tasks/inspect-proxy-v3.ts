import { task } from 'hardhat/config';

task('inspect-proxy-v3', 'Inspect ERC-1967 impl + selectors of proxy')
  .addParam('proxy', 'proxy address')
  .setAction(async (args, { ethers }) => {
    const proxyAddr = args.proxy as string;
    const IMPL_SLOT = '0x360894a13ba1a3210667c828492db98dcbf03aab0e4ec2c9e6a01c9c5b1d9c48';
    const implHex = await ethers.provider.getStorage(proxyAddr, IMPL_SLOT);
    console.log('impl slot:', ethers.getAddress('0x' + implHex.slice(-40)));

    // ABI probe: call bidPayerOf(0) + isRelayer(deployer) と grant emit を含む event 再確認
    const [signer] = await ethers.getSigners();
    const iface = new ethers.Interface([
      'function isRelayer(address) view returns (bool)',
      'function bidPayerOf(uint256) view returns (address)',
      'function bidRecipientOf(uint256) view returns (address)',
      'function owner() view returns (address)',
    ]);
    const c = new ethers.Contract(proxyAddr, iface, ethers.provider);
    console.log('owner:', await c.owner());
    console.log('isRelayer(deployer):', await c.isRelayer(signer.address));
    console.log('bidPayerOf(0):', await c.bidPayerOf(0));
    console.log('bidRecipientOf(0):', await c.bidRecipientOf(0));
  });
