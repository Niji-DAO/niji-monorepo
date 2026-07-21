import hre from 'hardhat';

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const bal = await hre.ethers.provider.getBalance(deployer.address);
  const net = await hre.ethers.provider.getNetwork();
  console.log('deployer:', deployer.address);
  console.log('balance:', hre.ethers.formatEther(bal), 'ETH');
  console.log('chainId:', net.chainId.toString());
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
