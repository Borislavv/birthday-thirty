/* Browser checks for the final standalone build, without changing story data. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const bundledRequire = createRequire('/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/package.json');
const { chromium } = bundledRequire('playwright');
const root = path.resolve(__dirname, '..');
const url = process.env.NOVEL_TEST_URL || 'http://127.0.0.1:8765/';
const indexBytes = fs.readFileSync(path.join(root, 'index.html'));
const hash = crypto.createHash('sha256').update(indexBytes).digest('hex');
let browser;

(async () => {
  const served = await fetch(url);
  assert.equal(served.status, 200);
  const responseHash = crypto.createHash('sha256').update(Buffer.from(await served.arrayBuffer())).digest('hex');
  assert.equal(responseHash, hash, 'The HTTP preview must serve the exact final index.html bytes');
  browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  const failures = [], checks = [], consoleErrors = [];
  async function scene(id, route, test) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    page.on('pageerror', error => consoleErrors.push(String(error)));
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    await page.addInitScript(({ id, route }) => {
      localStorage.setItem('tanya30.settings.v1', JSON.stringify({ typing: false, motion: true, muted: true, volume: .2 }));
      localStorage.setItem('tanya30.story.v1', JSON.stringify({ version: 1, current: id, textOffset: 0, route, read: [], visited: [], history: [], choices: {}, complete: false }));
      const nativeRaf = requestAnimationFrame.bind(window), nativeCancel = cancelAnimationFrame.bind(window);
      window.__qaFrames = new Set();
      window.requestAnimationFrame = callback => {
        let frame;
        frame = nativeRaf(time => { window.__qaFrames.delete(frame); callback(time); });
        window.__qaFrames.add(frame);
        return frame;
      };
      window.cancelAnimationFrame = frame => { window.__qaFrames.delete(frame); nativeCancel(frame); };
    }, { id, route });
    const response = await page.goto(url);
    assert.equal(response.status(), 200);
    await page.locator('#resumeBtn').click();
    try { await test(page); checks.push(id); } catch (error) { failures.push({ id, error: String(error) }); }
    await context.close();
  }
  await scene('p054', 'forest', async page => {
    await page.locator('#itemFx svg.apple').waitFor();
    assert.notEqual(await page.locator('#itemFx svg').evaluate(element => getComputedStyle(element).animationName), 'none');
  });
  await scene('p078', 'forest', async page => { await page.locator('#itemFx svg.key').waitFor(); });
  await scene('p250', 'versailles', async page => { await page.locator('#itemFx svg.seal').waitFor(); });
  await scene('p132', 'wonderland', async page => {
    assert.equal(await page.locator('#flash.magic').count(), 1);
    assert.ok(await page.locator('.art-layer').evaluateAll(elements => elements.some(element => element.getAnimations().length > 0)));
  });
  await scene('hat-choice', 'wonderland', async page => {
    await page.waitForTimeout(200);
    assert.equal(await page.locator('.choice-art .art-surface').count(), 3);
    const images = await page.locator('.choice-art').evaluateAll(elements => elements.map(element => ({ key: element.dataset.artKey, clipped: getComputedStyle(element).overflow, width: element.clientWidth })));
    assert.deepEqual(images.map(image => image.key), ['hat-cards', 'hat-veil', 'hat-rabbit']);
    assert.ok(images.every(image => image.width > 0));
    const progress = await page.locator('.chapter-header').evaluate(element => ({ display: getComputedStyle(element).display, width: element.clientWidth }));
    assert.notEqual(progress.display, 'none'); assert.ok(progress.width > 0);
  });
  await scene('candles', 'forest', async page => {
    await page.waitForFunction(() => [...document.querySelectorAll('.art-layer.active')].some(element => element.dataset.artKey === 'candles-out'));
    assert.equal(await page.evaluate(() => NovelGame.getState().current), 'candles');
  });
  await scene('p009', null, async page => {
    await page.waitForTimeout(700);
    const before = await page.evaluate(() => window.__qaFrames.size);
    await page.evaluate(() => {
      const volume = document.getElementById('volumeInput');
      for (let i = 0; i < 20; i++) { volume.value = i; volume.dispatchEvent(new Event('input', { bubbles: true })); }
      for (let i = 0; i < 10; i++) document.getElementById('soundBtn').click();
    });
    await page.waitForTimeout(200);
    const after = await page.evaluate(() => window.__qaFrames.size);
    assert.equal(before, 1); assert.equal(after, 1, 'Music controls must not multiply requestAnimationFrame loops');
    await page.evaluate(() => { const motion = document.getElementById('motionInput'); motion.checked = false; motion.dispatchEvent(new Event('change', { bubbles: true })); });
    assert.equal(await page.evaluate(() => window.__qaFrames.size), 0);
    await page.evaluate(() => { const motion = document.getElementById('motionInput'); motion.checked = true; motion.dispatchEvent(new Event('change', { bubbles: true })); });
    await page.waitForTimeout(50);
    assert.equal(await page.evaluate(() => window.__qaFrames.size), 1);
  });
  await browser.close();
  const finalHash = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, 'index.html'))).digest('hex');
  assert.equal(finalHash, hash, 'index.html changed while testing');
  const report = { result: failures.length || consoleErrors.length ? 'FAIL' : 'PASS', indexSHA256: hash, bytes: indexBytes.length, browser: 'Google Chrome headless', viewport: '390x844', source: url, normalMotion: true, checks, consoleErrors, failures };
  fs.writeFileSync(path.join(root, 'docs/QA_ANIMATION.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
  if (report.result !== 'PASS') process.exitCode = 1;
})().catch(async error => { console.error(error); if (browser) await browser.close(); process.exitCode = 1; });
