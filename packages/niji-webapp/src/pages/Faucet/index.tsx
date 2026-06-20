import { useEffect, useState } from 'react';

import { toast } from 'sonner';
import {
  formatEther,
  isAddress,
  parseEther,
  toHex,
  type Address,
  type Hex,
  type PublicClient,
} from 'viem';
import { hardhat } from 'viem/chains';
import { useAccount, useBalance, usePublicClient } from 'wagmi';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CHAIN_ID } from '@/config';

const ANVIL_RPC_URL =
  (import.meta.env.VITE_HARDHAT_JSONRPC as string | undefined) ?? 'http://127.0.0.1:8547';

// anvil --mnemonic 'test test test test test test test test test test test junk' で生成される
// 10 個の標準アカウント (HD path m/44'/60'/0'/0/{0..9})。 各アカウントは起動時に 10000 ETH を保有。
const ANVIL_ACCOUNTS: ReadonlyArray<{ index: number; address: Address; privateKey: Hex }> = [
  {
    index: 0,
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  },
  {
    index: 1,
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    privateKey: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
  },
  {
    index: 2,
    address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    privateKey: '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
  },
  {
    index: 3,
    address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    privateKey: '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6',
  },
  {
    index: 4,
    address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    privateKey: '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a',
  },
  {
    index: 5,
    address: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
    privateKey: '0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba',
  },
  {
    index: 6,
    address: '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
    privateKey: '0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e',
  },
  {
    index: 7,
    address: '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
    privateKey: '0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356',
  },
  {
    index: 8,
    address: '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f',
    privateKey: '0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97',
  },
  {
    index: 9,
    address: '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720',
    privateKey: '0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dfa6240db4',
  },
];

const isAnvil = Number(CHAIN_ID) === hardhat.id;

const truncate = (value: string, head = 6, tail = 4) =>
  value.length <= head + tail + 1 ? value : `${value.slice(0, head)}…${value.slice(-tail)}`;

async function anvilRpc(method: string, params: unknown[]): Promise<unknown> {
  const res = await fetch(ANVIL_RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }),
  });
  if (!res.ok) {
    throw new Error(`RPC ${method} HTTP ${res.status}`);
  }
  const body = (await res.json()) as { result?: unknown; error?: { message: string } };
  if (body.error) {
    throw new Error(`RPC ${method}: ${body.error.message}`);
  }
  return body.result;
}

interface AccountRowProps {
  account: (typeof ANVIL_ACCOUNTS)[number];
  publicClient: PublicClient | undefined;
}

function AccountRow({ account, publicClient }: AccountRowProps) {
  const [balance, setBalance] = useState<bigint | null>(null);

  useEffect(() => {
    if (!publicClient) return;
    let cancelled = false;
    const refresh = async () => {
      try {
        const value = await publicClient.getBalance({ address: account.address });
        if (!cancelled) setBalance(value);
      } catch {
        if (!cancelled) setBalance(null);
      }
    };
    refresh();
    const interval = window.setInterval(refresh, 5_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [publicClient, account.address]);

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} をコピーしました`);
    } catch {
      toast.error('クリップボード書込に失敗しました');
    }
  };

  return (
    <tr className="border-b border-slate-700/40 align-top">
      <td className="px-3 py-2 text-slate-400">#{account.index}</td>
      <td className="px-3 py-2 font-mono text-xs">
        <button
          type="button"
          className="text-left hover:underline"
          onClick={() => copy(account.address, 'address')}
          title={account.address}
        >
          {truncate(account.address, 10, 8)}
        </button>
      </td>
      <td className="px-3 py-2 font-mono text-xs">
        <button
          type="button"
          className="text-left hover:underline"
          onClick={() => copy(account.privateKey, 'private key')}
          title="private key をクリップボードへコピー"
        >
          {truncate(account.privateKey, 8, 6)}
        </button>
      </td>
      <td className="px-3 py-2 text-right font-mono tabular-nums">
        {balance === null ? '—' : Number(formatEther(balance)).toFixed(4)}
      </td>
    </tr>
  );
}

function FaucetPage() {
  const { address: connectedAddress } = useAccount();
  const publicClient = usePublicClient({ chainId: hardhat.id });

  const [recipient, setRecipient] = useState<string>('');
  const [amountEth, setAmountEth] = useState<string>('100');
  const [isFunding, setIsFunding] = useState(false);

  useEffect(() => {
    if (!recipient && connectedAddress) setRecipient(connectedAddress);
  }, [connectedAddress, recipient]);

  const { data: recipientBalance, refetch: refetchRecipientBalance } = useBalance({
    address: isAddress(recipient) ? (recipient as Address) : undefined,
    chainId: hardhat.id,
    query: { enabled: isAnvil && isAddress(recipient) },
  });

  if (!isAnvil) {
    return (
      <main className="mx-auto my-12 max-w-2xl rounded-md border border-amber-300 bg-amber-50 p-6 text-amber-900">
        <h1 className="mb-2 text-xl font-bold">Faucet は anvil (chain 31337) 専用</h1>
        <p className="text-sm">
          現在の VITE_CHAIN_ID は <code>{String(CHAIN_ID)}</code> です。 anvil
          でローカル開発する場合のみ
          <code> VITE_CHAIN_ID=31337</code> でこのページが有効になります。
        </p>
      </main>
    );
  }

  const handleFund = async () => {
    if (!isAddress(recipient)) {
      toast.error('送付先 address が不正です');
      return;
    }
    const amount = Number(amountEth);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('送付額 (ETH) は正の数を指定してください');
      return;
    }
    setIsFunding(true);
    try {
      const wei = parseEther(amountEth);
      const currentRaw = (await anvilRpc('eth_getBalance', [recipient, 'latest'])) as Hex;
      const current = BigInt(currentRaw);
      const next = current + wei;
      await anvilRpc('anvil_setBalance', [recipient, toHex(next)]);
      // anvil_setBalance は block を作らない state mutation なので MetaMask 側の
      // balance polling が cache hit のまま refresh されない。 空 block を 1 つ
      // mine することで block change を MetaMask に通知し残高を refetch させる。
      await anvilRpc('anvil_mine', ['0x1']);
      toast.success(`${amountEth} ETH を ${truncate(recipient, 8, 6)} に送金しました`);
      await refetchRecipientBalance();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsFunding(false);
    }
  };

  return (
    <main className="mx-auto my-8 flex max-w-4xl flex-col gap-8 px-4 text-slate-900">
      <header>
        <h1 className="text-2xl font-bold">Anvil Faucet</h1>
        <p className="mt-1 text-sm text-slate-600">
          chain 31337 (anvil) 専用のネイティブ ETH 配布ツール。 既定 anvil アカウントの参照と 任意
          address への残高増額を行う。
        </p>
      </header>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">1. ETH を送付</h2>
        <p className="mb-4 text-xs text-slate-600">
          anvil の <code>anvil_setBalance</code> RPC で指定 address の残高を増額します (現在残高 +
          指定 ETH)。 anvil の標準アカウントから ETH が抜き取られるわけではありません。
        </p>
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <label className="flex-1 text-sm">
            <span className="mb-1 block text-slate-700">送付先 address</span>
            <Input
              value={recipient}
              onChange={event => setRecipient(event.target.value)}
              placeholder="0x..."
              className="font-mono"
            />
          </label>
          <label className="w-full text-sm md:w-32">
            <span className="mb-1 block text-slate-700">送付額 (ETH)</span>
            <Input
              value={amountEth}
              onChange={event => setAmountEth(event.target.value)}
              inputMode="decimal"
            />
          </label>
          <Button onClick={handleFund} disabled={isFunding}>
            {isFunding ? '送金中…' : 'ETH を送る'}
          </Button>
        </div>
        {isAddress(recipient) && recipientBalance && (
          <p className="mt-3 text-xs text-slate-600">
            現在残高 —{' '}
            <span className="font-mono">
              {Number(formatEther(recipientBalance.value)).toFixed(4)}
            </span>{' '}
            ETH
          </p>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">2. Anvil 標準アカウント</h2>
        <p className="mb-3 text-xs text-slate-600">
          <code>anvil --mnemonic &quot;test test test ... junk&quot;</code> で生成される既定 10
          アカウント。 MetaMask にインポートして使えます (private key をクリックでコピー)。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-300 text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">address</th>
                <th className="px-3 py-2">private key</th>
                <th className="px-3 py-2 text-right">balance (ETH)</th>
              </tr>
            </thead>
            <tbody className="text-slate-800">
              {ANVIL_ACCOUNTS.map(account => (
                <AccountRow key={account.address} account={account} publicClient={publicClient} />
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default FaucetPage;
