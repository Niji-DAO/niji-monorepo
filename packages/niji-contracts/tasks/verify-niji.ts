import * as fs from 'fs';
import * as path from 'path';

import { task } from 'hardhat/config';

interface DeploymentsSnapshot {
  profile: 'full' | 'smoke';
  network: string;
  chainId: number;
  timestamp: string;
  deployer: string;
  contracts: Record<string, string | null | undefined>;
  constructorArgs?: Record<string, unknown[] | null>;
}

// Some contracts share bytecode with their dependencies, so hardhat-verify needs the
// fully-qualified contract path to disambiguate.
const FULLY_QUALIFIED_NAMES: Record<string, string> = {
  NijiArt: 'contracts/NijiArt.sol:NijiArt',
  NijiDescriptor: 'contracts/NijiDescriptor.sol:NijiDescriptor',
  NijiSeeder: 'contracts/NijiSeeder.sol:NijiSeeder',
  NijiToken: 'contracts/NijiToken.sol:NijiToken',
  WETH: 'contracts/test/WETH.sol:WETH',
};

task('verify-niji', 'Verify Niji contracts on Etherscan from a deployments/<network>.json snapshot')
  .addOptionalParam(
    'snapshot',
    'Path to a deployments snapshot JSON (defaults to deployments/<network>.json)',
  )
  .setAction(async ({ snapshot }: { snapshot?: string }, hre) => {
    const network = hre.network.name;
    const defaultPath = path.join(__dirname, '..', 'deployments', `${network}.json`);
    const snapshotPath = snapshot ?? defaultPath;

    if (!fs.existsSync(snapshotPath)) {
      throw new Error(
        `Snapshot not found at ${snapshotPath}. Run deploy-niji-full / deploy-niji-smoke first ` +
          `or pass --snapshot <path>.`,
      );
    }

    const raw = fs.readFileSync(snapshotPath, 'utf8');
    const data = JSON.parse(raw) as DeploymentsSnapshot;
    console.log(`📂 Snapshot: ${snapshotPath}`);
    console.log(`   profile=${data.profile} network=${data.network} chainId=${data.chainId}`);

    const targets: { name: string; address: string; args: unknown[] }[] = [];
    for (const [name, address] of Object.entries(data.contracts)) {
      if (!address) continue;
      // Skip the auction proxy — it uses initialize calldata, not a constructor; verify it
      // separately via the legacy verify-etherscan-dao-v3 task if needed.
      if (name === 'NijiAuctionHouseProxy') continue;
      const args = data.constructorArgs?.[name];
      if (!args) {
        console.log(`⚠️  Skip ${name} (no constructorArgs in snapshot)`);
        continue;
      }
      targets.push({ name, address, args });
    }

    console.log(`\n🔍 Verifying ${targets.length} contract(s)...\n`);

    let okCount = 0;
    let skipCount = 0;
    let failCount = 0;
    for (const { name, address, args } of targets) {
      try {
        console.log(`→ ${name.padEnd(16)} ${address}`);
        await hre.run('verify:verify', {
          address,
          constructorArguments: args,
          contract: FULLY_QUALIFIED_NAMES[name],
        });
        okCount += 1;
        console.log(`  ✓ verified`);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        if (message.includes('Already Verified') || message.includes('already verified')) {
          skipCount += 1;
          console.log(`  ↷ already verified (skip)`);
          continue;
        }
        failCount += 1;
        console.error(`  ✗ ${message}`);
      }
    }

    console.log(`\n=== verify-niji: ok=${okCount} skipped=${skipCount} failed=${failCount} ===`);
    if (failCount > 0) {
      throw new Error(`${failCount} verification(s) failed`);
    }
  });
