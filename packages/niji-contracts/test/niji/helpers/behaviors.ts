/**
 * Shared behavior tests (Mocha shared-example pattern).
 */
import { expect } from 'chai';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

/**
 * Shared Ownable2Step behavior tests.
 *
 * Uses getter functions to defer value resolution until after `beforeEach` runs.
 *
 * @param getContract       - returns the contract under test (must be connected as owner)
 * @param getOwner          - returns the current owner signer
 * @param getNewOwner       - returns the signer who will become pendingOwner
 * @param getNonPendingOwner - returns a signer who is NOT the pendingOwner (for rejection test)
 */
export function shouldBehaveLikeOwnable2Step(
  getContract: () => any,
  getOwner: () => SignerWithAddress,
  getNewOwner: () => SignerWithAddress,
  getNonPendingOwner: () => SignerWithAddress,
): void {
  describe('Ownable2Step', () => {
    it('transferOwnership should not change owner immediately', async () => {
      const contract = getContract();
      const owner = getOwner();
      const newOwner = getNewOwner();

      await contract.transferOwnership(newOwner.address);
      expect(await contract.owner()).to.equal(owner.address);
    });

    it('transferOwnership should set pendingOwner', async () => {
      const contract = getContract();
      const newOwner = getNewOwner();

      await contract.transferOwnership(newOwner.address);
      expect(await contract.pendingOwner()).to.equal(newOwner.address);
    });

    it('transferOwnership should emit OwnershipTransferStarted', async () => {
      const contract = getContract();
      const owner = getOwner();
      const newOwner = getNewOwner();

      await expect(contract.transferOwnership(newOwner.address))
        .to.emit(contract, 'OwnershipTransferStarted')
        .withArgs(owner.address, newOwner.address);
    });

    it('acceptOwnership should transfer ownership to pendingOwner', async () => {
      const contract = getContract();
      const newOwner = getNewOwner();

      await contract.transferOwnership(newOwner.address);
      await contract.connect(newOwner).acceptOwnership();
      expect(await contract.owner()).to.equal(newOwner.address);
    });

    it('acceptOwnership should revert if caller is not pendingOwner', async () => {
      const contract = getContract();
      const newOwner = getNewOwner();
      const nonPendingOwner = getNonPendingOwner();

      await contract.transferOwnership(newOwner.address);
      await expect(
        contract.connect(nonPendingOwner).acceptOwnership(),
      ).to.be.revertedWithCustomError(contract, 'OwnableUnauthorizedAccount');
    });

    it('renounceOwnership should revert with RenounceOwnershipDisabled when called by owner', async () => {
      const contract = getContract();

      await expect(contract.renounceOwnership()).to.be.revertedWithCustomError(
        contract,
        'RenounceOwnershipDisabled',
      );
    });
  });
}
