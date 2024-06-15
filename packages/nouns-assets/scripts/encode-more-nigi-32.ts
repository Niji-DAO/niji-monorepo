import { PNGCollectionEncoder } from '@nouns/sdk';
import { promises as fs } from 'fs';
import path from 'path';
import { palette } from '../src/palette-32.json';
import { readPngImage } from './utils';

const encode = async (sourceFolder: string, destinationFilepath: string) => {
  const encoder = new PNGCollectionEncoder(palette);

  const partfolders = [
    '1-backgroundDecorations',
    '2-backs',
    '3-specials',
    '4-clothes',
    '5-backDecorations',
    '6-chokers',
    '7-ears',
    '8-hairs',
    '9-headphones',
    '10-hats',
    '11-leftHands',
  ];
  for (const folder of partfolders) {
    const folderpath = path.join(sourceFolder, folder);
    console.log(`folderpath: ${folderpath}`);
    const files = await fs.readdir(folderpath);
    console.log(`files: ${files}`);
    for (const file of files) {
      if (file === '.gitkeep') {
        continue;
      }
      const image = await readPngImage(path.join(folderpath, file));
      encoder.encodeImage(file.replace(/\.png$/, ''), image, folder.replace(/^\d+-/, ''));
    }
  }

  if (JSON.stringify(encoder.data.palette) !== JSON.stringify(palette)) {
    console.log('Palette changed! Aborting');

    await fs.writeFile('original_palette.json', JSON.stringify(palette, null, 2));
    await fs.writeFile('new_palette.json', JSON.stringify(encoder.data.palette, null, 2));

    throw new Error(`Palette changed, expected to stay the same`);
  }

  await fs.writeFile(
    destinationFilepath,
    JSON.stringify(
      {
        images: encoder.data.images,
      },
      null,
      2,
    ),
  );
};

encode(path.join(__dirname, '../images/v32v3'), path.join(__dirname, '../src/image-data-32.json'));
