const fs = require('fs');
const {PNG} = require('pngjs');
const path = require('path');

const samples = [
  '/Users/cardene/Downloads/niji/niji/06_服/IMG_1989.PNG',
  '/Users/cardene/Downloads/niji/niji/12_髪の毛/IMG_1698.PNG',
  '/Users/cardene/Downloads/niji/niji/05_帽子/IMG_1956.PNG'
];

samples.forEach(s => {
  if (!fs.existsSync(s)) return;
  const png = PNG.sync.read(fs.readFileSync(s));
  const colors = new Map();
  let trans = 0, alpha = new Set();
  
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const i = (png.width * y + x) << 2;
      const a = png.data[i + 3];
      alpha.add(a);
      if (a === 0) trans++;
      else colors.set((png.data[i]<<16)|(png.data[i+1]<<8)|png.data[i+2], 1);
    }
  }
  
  console.log(path.basename(s));
  console.log('  Trans:', (trans*100/(png.width*png.height)).toFixed(1) + '%');
  console.log('  Colors:', colors.size);
  console.log('  Alpha:', alpha.size, alpha.size > 2 ? '(gradient)' : '');
});
