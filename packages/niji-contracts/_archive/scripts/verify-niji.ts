import { run } from 'hardhat';

async function main() {
  const NIJI_ART_ADDRESS = '0x22958b6c9a132819eE7D54bc013585b4475d1fEA';
  const NIJI_DESCRIPTOR_ADDRESS = '0x2221eCf6294f9Ab5C08c0ae855EAaa9178392969';
  const DEPLOYER_ADDRESS = '0x357E1d0ea9c8Bc04a6Aca1A586dE36251898E1FA';

  const traitNames = [
    'special',
    'choker',
    'headphone',
    'leftHand',
    'hat',
    'clothing',
    'ear',
    'back',
    'backDecoration',
    'background',
    'solidBackground',
    'hair',
  ];

  const compositeOrder = [10, 9, 7, 8, 5, 11, 4, 6, 1, 2, 3, 0];
  const resolution = 320;

  console.log('=== Verifying NijiArt ===');
  try {
    await run('verify:verify', {
      address: NIJI_ART_ADDRESS,
      constructorArguments: [DEPLOYER_ADDRESS, traitNames],
    });
    console.log('NijiArt verified!');
  } catch (e: any) {
    if (e.message.includes('Already Verified')) {
      console.log('NijiArt already verified');
    } else {
      console.error('NijiArt verification failed:', e.message);
    }
  }

  console.log('\n=== Verifying NijiDescriptor ===');
  try {
    await run('verify:verify', {
      address: NIJI_DESCRIPTOR_ADDRESS,
      constructorArguments: [NIJI_ART_ADDRESS, resolution, compositeOrder],
    });
    console.log('NijiDescriptor verified!');
  } catch (e: any) {
    if (e.message.includes('Already Verified')) {
      console.log('NijiDescriptor already verified');
    } else {
      console.error('NijiDescriptor verification failed:', e.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
