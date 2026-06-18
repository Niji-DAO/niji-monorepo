import { useEffect, useRef } from 'react';

import { useAccount, useSwitchChain } from 'wagmi';

import { CHAIN_ID } from '@/config';

/**
 * NetworkAlert
 *
 * wallet が wrong chain にあるとき、 モーダルを出さずに自動で wallet に
 * switchChain リクエスト (EIP-3326 wallet_switchEthereumChain) を送る。
 *
 * - 接続済 wallet が wrong chain → useEffect で switchChain({ chainId }) を自動呼出、
 *   wallet UI が直接立ち上がる (ユーザーは approve するだけ)
 * - 未接続 wallet → 何も描画しない (wallet 接続 UI 自体は connectkit が担当)
 * - 切替リクエスト中の重複発火を防ぐため lastRequestedChainId を ref で記録
 */
const NetworkAlert = () => {
  const targetChainId = Number(CHAIN_ID);
  const { isConnected, chainId: currentChainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const lastRequestedChainId = useRef<number | null>(null);

  useEffect(() => {
    if (!isConnected) return;
    if (currentChainId == null) return;
    if (currentChainId === targetChainId) {
      lastRequestedChainId.current = null;
      return;
    }
    // 同じ chain 切替を連続発火させない (wallet が reject 後にループするのを防ぐ)。
    if (lastRequestedChainId.current === targetChainId) return;
    lastRequestedChainId.current = targetChainId;
    switchChain({ chainId: targetChainId });
  }, [isConnected, currentChainId, targetChainId, switchChain]);

  return null;
};

export default NetworkAlert;
