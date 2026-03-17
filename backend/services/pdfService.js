/**
 * pdfService.js
 * Stateless PDF generation service.
 *
 * Detects OS platform (not NODE_ENV) to choose the right Chrome strategy:
 *  - Linux (Render / Docker / K8s): puppeteer-core + @sparticuz/chromium
 *  - Windows / Mac (local dev):     standard puppeteer (bundled Chrome)
 */
const os = require('os');

const isLinux = os.platform() === 'linux';

/**
 * generatePDF(html) → Buffer
 */
const generatePDF = async (html) => {
  let browser;
  const started = Date.now();
  console.time('⏱ PDF generation');

  try {
    if (isLinux) {
      // ── Linux container: puppeteer-core + @sparticuz/chromium ──
      const puppeteer = require('puppeteer-core');
      const chromium = require('@sparticuz/chromium');
      browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
        defaultViewport: chromium.defaultViewport,
      });
    } else {
      // ── Windows / Mac: standard puppeteer with bundled Chrome ──
      const puppeteer = require('puppeteer');
      browser = await puppeteer.launch({ headless: true });
    }
  } catch (err) {
    console.timeEnd('⏱ PDF generation');
    console.error('❌ Chromium launch failed:', err.message);
    throw new Error(`PDF generation failed: Could not launch browser — ${err.message}`);
  }

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
    });

    await browser.close();
    console.timeEnd('⏱ PDF generation');

    const elapsed = Date.now() - started;
    if (elapsed > 5000) {
      console.warn(`⚠️ PDF generation took ${elapsed}ms`);
    }

    return Buffer.from(pdfBuffer);
  } catch (err) {
    console.timeEnd('⏱ PDF generation');
    console.error('❌ PDF rendering failed:', err.message);
    if (browser) await browser.close();
    throw new Error(`PDF rendering failed: ${err.message}`);
  }
};

module.exports = { generatePDF };
