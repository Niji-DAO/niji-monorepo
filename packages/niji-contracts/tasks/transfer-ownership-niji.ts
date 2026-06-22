import * as fs from 'fs';
import * as path from 'path';

import { task } from 'hardhat/config';
import { isAddress } from 'viem';

interface DeploymentsSnapshot {
  profile: 'full' | 'smoke';
  network: string;
  chainId: number;
  timestamp: string;
  deployer: string;
  contracts: Record<string, string | null | undefined>;
}

// Contracts that follow the Ownable2Step pattern and should be transferred together when
// rotating ownership to a multisig. The auction-house proxy intentionally uses a separate
// owner / proxy-admin split; rotate it via the existing governance-side workflow if needed.
const OWNED_CONTRACTS = [
  { name: 'NijiArt', factory: 'NijiArt' },
  { name: 'NijiDescriptor', factory: 'NijiDescriptor' },
  { name: 'NijiSeeder', factory: 'NijiSeeder' },
  { name: 'NijiToken', factory: 'NijiToken' },
] as const;

task(
  'transfer-ownership-niji',
  'Transfer Ownable2Step ownership of NijiArt / Descriptor / Seeder / Token to a multisig address',
)
  .addParam('to', 'Multisig (or new owner) address to receive ownership')
  .addOptionalParam(
    'snapshot',
    'Path to a deployments snapshot JSON (defaults to deployments/<network>.json)',
  )
  .addFlag('dryRun', 'Print intended actions without sending transactions')
  .setAction(
    async (
      { to, snapshot, dryRun }: { to: string; snapshot?: string; dryRun: boolean },
      hre,
    ) => {
      if (!isAddress(to)) {
        throw new Error(`Invalid --to address: ${to}`);
      }

      const network = hre.network.name;
      const defaultPath = path.join(__dirname, '..', 'deployments', `${network}.json`);
      const snapshotPath = snapshot ?? defaultPath;

      if (!fs.existsSync(snapshotPath)) {
        throw new Error(
          `Snapshot not found at ${snapshotPath}. Run deploy-niji-full / deploy-niji-smoke first ` +
            `or pass --snapshot <path>.`,
        );
      }

      const data = JSON.parse(fs.readFileSync(snapshotPath, 'utf8')) as DeploymentsSnapshot;
      console.log(`📂 Snapshot: ${snapshotPath}`);
      console.log(
        `   profile=${data.profile} network=${data.network} chainId=${data.chainId} → newOwner=${to}`,
      );

      const [signer] = await hre.ethers.getSigners();
      console.log(`   signer (current owner expected): ${signer.address}`);

      type Target = { name: string; address: string };
      const targets: Target[] = [];
      for (const { name } of OWNED_CONTRACTS) {
        const addr = data.contracts[name];
        if (!addr) {
          console.log(`⚠️  Skip ${name} (not in snapshot)`);
          continue;
        }
        targets.push({ name, address: addr });
      }

      if (targets.length === 0) {
        console.log('No matching contracts to transfer. Exiting.');
        return;
      }

      console.log(`\n🔄 Transferring ${targets.length} ownership(s)...\n`);

      const ZERO = '0x' + '00'.repeat(20);

      for (const { name, address } of targets) {
        const factory = OWNED_CONTRACTS.find(c => c.name === name)!.factory;
        const contract = await hre.ethers.getContractAt(factory, address, signer);

        const currentOwner: string = await contract.owner();
        const pendingOwner: string = await contract.pendingOwner();
        console.log(`→ ${name.padEnd(16)} ${address}`);
        console.log(`  current owner : ${currentOwner}`);
        console.log(`  pending owner : ${pendingOwner === ZERO ? '(none)' : pendingOwner}`);

        if (currentOwner.toLowerCase() === to.toLowerCase()) {
          console.log(`  ↷ already owned by --to, skip`);
          continue;
        }
        if (pendingOwner.toLowerCase() === to.toLowerCase()) {
          console.log(
            `  ↷ pending owner already set to --to, awaiting acceptOwnership by multisig`,
          );
          continue;
        }

        if (dryRun) {
          console.log(`  [dry-run] would call transferOwnership(${to})`);
          continue;
        }

        const tx = await contract.transferOwnership(to);
        const receipt = await tx.wait();
        console.log(`  ✓ transferOwnership tx=${receipt!.hash} gas=${receipt!.gasUsed}`);
      }

      console.log(
        `\n=== transfer-ownership-niji: ${dryRun ? 'dry-run' : 'submitted'} ===\n` +
          `Next step: the multisig (${to}) must call acceptOwnership() on each contract to ` +
          `finalize the Ownable2Step transfer.`,
      );
    },
  );
