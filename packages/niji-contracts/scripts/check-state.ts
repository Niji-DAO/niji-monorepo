import { ethers, network } from 'hardhat';

const ADDR = '0x34C564d0E667FaB03a918530147906a9073ad1aA';

async function main() {
  console.log(`network: ${network.name}`);
  const token = await ethers.getContractAt('NijiToken', ADDR);
  const [s] = await ethers.getSigners();
  console.log(`signer:           ${s.address}`);
  console.log(`balance:          ${ethers.formatEther(await ethers.provider.getBalance(s.address))} ETH`);
  console.log(`totalSupply:      ${await token.totalSupply()}`);
  console.log(`maxSupply:        ${await token.maxSupply()}`);
  console.log(`isMintingActive:  ${await token.isMintingActive()}`);
  console.log(`minter:           ${await token.minter()}`);
  for (let i = 0n; i < (await token.totalSupply()); i++) {
    try {
      console.log(`owner #${i}:        ${await token.ownerOf(i)}`);
    } catch (e: any) {
      console.log(`owner #${i}:        (error: ${e.message?.slice(0, 60)})`);
    }
  }
}
main().catch(e => { console.error(e); process.exit(1); });
