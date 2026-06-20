import puppeteer from 'puppeteer';
import { resolve } from 'path';

const htmlPath = resolve(process.argv[2]);
const pdfPath = htmlPath.replace(/\.html$/, '.pdf');

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0', timeout: 60000 });
await page.waitForFunction(() => document.styleSheets.length > 1, { timeout: 30000 }).catch(() => {});
await new Promise(r => setTimeout(r, 3000));
await page.pdf({ path: pdfPath, format: 'A4', printBackground: true, margin: { top: '0', right: '0', bottom: '0', left: '0' }, preferCSSPageSize: true });
console.log('PDF generated:', pdfPath);
await browser.close();
