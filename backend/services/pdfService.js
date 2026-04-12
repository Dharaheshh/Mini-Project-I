/**
 * pdfService.js
 * Stateless PDF generation service.
 *
 * Platform detection (OS-based, not NODE_ENV):
 *  - Linux (Render / Docker / K8s): puppeteer-core + @sparticuz/chromium
 *  - Windows / Mac (local dev):     standard puppeteer (bundled Chrome)
 *
 * Rendering consistency:
 *  - Explicit viewport (1200x800, 1x scale)
 *  - Font-render-hinting disabled for cross-platform consistency
 *  - Waits for document.fonts.ready before PDF capture
 */
const os = require('os');

const isLinux = os.platform() === 'linux';

const generatePDF = async (html) => {
  let browser;
  const started = Date.now();
  console.time('⏱ PDF generation');

  try {
    if (isLinux) {
      const puppeteer = require('puppeteer-core');
      const chromium = require('@sparticuz/chromium');
      browser = await puppeteer.launch({
        args: [...chromium.args, '--font-render-hinting=none'],
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
        defaultViewport: null,
      });
    } else {
      const puppeteer = require('puppeteer');
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
        defaultViewport: null,
      });
    }
  } catch (err) {
    console.timeEnd('⏱ PDF generation');
    console.error('❌ Chromium launch failed:', err.message);
    throw new Error(`PDF generation failed: Could not launch browser — ${err.message}`);
  }

  try {
    const page = await browser.newPage();

    // Explicit viewport for consistent layout across environments
    await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 1 });

    // Load HTML content and wait for all network resources (Chart.js CDN)
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Wait for all fonts to fully load before rendering
    await page.evaluateHandle('document.fonts.ready');

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
