import { Button, Modal } from 'react-bootstrap';
import { useAccount, useSwitchChain } from 'wagmi';

import { CHAIN_ID } from '@/config';

const networkName = () => {
  switch (Number(CHAIN_ID)) {
    case 1:
      return 'Ethereum Mainnet';
    case 4:
      return 'the Rinkeby network';
    case 11155111:
      return 'Sepolia Testnet';
    case 31337:
      return 'Hardhat / Anvil local network';
    default:
      return `Network ${CHAIN_ID}`;
  }
};

const metamaskNetworkName = () => {
  switch (Number(CHAIN_ID)) {
    case 1:
      return 'Ethereum Mainnet';
    case 4:
      return 'Rinkeby Test Network';
    case 11155111:
      return 'Sepolia';
    case 31337:
      return 'Localhost 8545';
    default:
      return `Network ${CHAIN_ID}`;
  }
};

const NetworkAlert = () => {
  const targetChainId = Number(CHAIN_ID);
  const { isConnected } = useAccount();
  const { switchChain, isPending, error } = useSwitchChain();

  const handleSwitch = () => {
    switchChain({ chainId: targetChainId });
  };

  return (
    <Modal show={true} backdrop="static" keyboard={false}>
      <Modal.Header>
        <Modal.Title>Wrong Network Detected</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Niji DAO auctions require you to switch over {networkName()} to be able to participate.
        </p>

        {isConnected ? (
          <>
            <p>
              <b>Click the button below to request a network switch from your wallet:</b>
            </p>
            <Button variant="primary" onClick={handleSwitch} disabled={isPending}>
              {isPending ? 'Switching…' : `Switch to ${networkName()}`}
            </Button>
            {error && (
              <p className="text-danger mb-0 mt-3">
                Failed to switch: {error.message}. Please switch manually from your wallet.
              </p>
            )}
          </>
        ) : (
          <>
            <p>
              <b>Please connect your wallet first, or switch your network manually:</b>
            </p>
            <ol>
              <li>Open Metamask</li>
              <li>Click the network select dropdown</li>
              <li>Click on "{metamaskNetworkName()}"</li>
            </ol>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};
export default NetworkAlert;
