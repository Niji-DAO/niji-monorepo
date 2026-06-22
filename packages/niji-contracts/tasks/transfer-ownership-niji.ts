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

      // Hard-fail when the snapshot's network/chainId does not match the connected network.
      // For an ownership-rotation task, mismatched inputs are dangerous: we could otherwise
      // hit unrelated contracts at the same addresses on a different chain.
      const provider = hre.ethers.provider;
      const liveChainId = Number((await provider.getNetwork()).chainId);
      if (liveChainId !== data.chainId) {
        throw new Error(
          `Network mismatch: snapshot.chainId=${data.chainId} but connected chainId=${liveChainId}. ` +
            `Re-run with --network matching the snapshot, or pass the correct --snapshot path.`,
        );
      }
      if (data.network !== hre.network.name) {
        // network.name is a hardhat config label (not on-chain identity), so this is a softer
        // sanity check than the chainId one above. Still bail out to avoid silent confusion.
        throw new Error(
          `Network name mismatch: snapshot.network=${data.network} but hre.network.name=${hre.network.name}.`,
        );
      }

      const [signer] = await hre.ethers.getSigners();
      console.log(`   signer (current owner expected): ${signer.address}`);

      type Target = {
        name: string;
        address: string;
        contract: Awaited<ReturnType<typeof hre.ethers.getContractAt>>;
        currentOwner: string;
        pendingOwner: string;
        decision: 'skip-already-owned' | 'skip-pending' | 'will-transfer';
      };

      const ZERO = '0x' + '00'.repeat(20);

      // -------- Pass 1: preflight (read-only) --------
      // Walk every target, attach the contract handle, and read owner/pendingOwner once.
      // This catches snapshot-vs-chain mismatches (ABI misdetection, wrong addresses, signer
      // is not current owner) before sending any transactions, so the batch can stay atomic
      // from the operator's point of view (either every transfer is queued or none are).
      const targets: Target[] = [];
      const preflightProblems: string[] = [];

      for (const { name, factory } of OWNED_CONTRACTS) {
        const addr = data.contracts[name];
        if (!addr) {
          console.log(`⚠️  Skip ${name} (not in snapshot)`);
          continue;
        }
        const contract = await hre.ethers.getContractAt(factory, addr, signer);
        const currentOwner: string = await contract.owner();
        const pendingOwner: string = await contract.pendingOwner();

        let decision: Target['decision'];
        if (currentOwner.toLowerCase() === to.toLowerCase()) {
          decision = 'skip-already-owned';
        } else if (pendingOwner.toLowerCase() === to.toLowerCase()) {
          decision = 'skip-pending';
        } else if (currentOwner.toLowerCase() !== signer.address.toLowerCase()) {
          preflightProblems.push(
            `${name} (${addr}): currentOwner=${currentOwner} ≠ signer=${signer.address}; ` +
              `transferOwnership would revert. Connect as the current owner first.`,
          );
          continue;
        } else {
          decision = 'will-transfer';
        }

        targets.push({ name, address: addr, contract, currentOwner, pendingOwner, decision });
      }

      if (targets.length === 0 && preflightProblems.length === 0) {
        console.log('No matching contracts to transfer. Exiting.');
        return;
      }

      console.log(`\n🔍 Preflight (${targets.length} target${targets.length === 1 ? '' : 's'}):\n`);
      for (const t of targets) {
        console.log(`→ ${t.name.padEnd(16)} ${t.address}`);
        console.log(`  current owner : ${t.currentOwner}`);
        console.log(`  pending owner : ${t.pendingOwner === ZERO ? '(none)' : t.pendingOwner}`);
        console.log(`  decision      : ${t.decision}`);
      }
      if (preflightProblems.length > 0) {
        console.error(`\n❌ Preflight failures (${preflightProblems.length}):`);
        for (const msg of preflightProblems) console.error(`   - ${msg}`);
        throw new Error(
          `Preflight failed. Refusing to send any transferOwnership tx. ` +
            `Fix the issues above (or pass --snapshot pointing at the correct chain) and retry.`,
        );
      }

      const toTransfer = targets.filter(t => t.decision === 'will-transfer');
      if (toTransfer.length === 0) {
        console.log(`\n✓ All targets already owned by or pending --to; nothing to do.`);
        return;
      }

      console.log(`\n🔄 Pass 2: transferOwnership for ${toTransfer.length} contract(s)\n`);

      // -------- Pass 2: mutation --------
      for (const t of toTransfer) {
        if (dryRun) {
          console.log(`→ ${t.name.padEnd(16)} [dry-run] would call transferOwnership(${to})`);
          continue;
        }
        const tx = await t.contract.transferOwnership(to);
        const receipt = await tx.wait();
        console.log(`→ ${t.name.padEnd(16)} ✓ tx=${receipt!.hash} gas=${receipt!.gasUsed}`);
      }

      console.log(
        `\n=== transfer-ownership-niji: ${dryRun ? 'dry-run' : 'submitted'} ===\n` +
          `Next step: the multisig (${to}) must call acceptOwnership() on each contract to ` +
          `finalize the Ownable2Step transfer.`,
      );
    },
  );
