const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { chromium } = require('/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const ROOT = '/Users/admin/dev/wife_game';
const hashFile = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const report = { checkedAt: new Date().toISOString(), url: 'http://127.0.0.1:8765/index.html', indexSha256: hashFile(ROOT + '/index.html'), results: [], errors: [], pagination: [] };
const sizes = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'narrow', width: 320, height: 667 }
];

(async () => {
  fs.mkdirSync(path.join(ROOT, 'qa'), { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    for (const size of sizes) {
      const context = await browser.newContext({ viewport: { width: size.width, height: size.height }, deviceScaleFactor: 1 });
      const page = await context.newPage();
      page.on('pageerror', e => report.errors.push({ size: size.name, message: e.message }));
      await page.addInitScript(() => {
        localStorage.removeItem('tanya30.story.v1');
        localStorage.setItem('tanya30.settings.v1', JSON.stringify({ volume: 0, muted: true, typing: false, motion: false }));
      });
      await page.goto(report.url, { waitUntil: 'load' });
      await page.waitForFunction(() => !!window.NovelGame && !!document.querySelector('.art-layer.active .art-surface'));
      const targets = await page.evaluate(() => {
        const nodes = Object.values(STORY.nodes);
        const longest = type => nodes.filter(n => n.type === type).sort((a, b) => (
          (b.text || '').length + (b.choices || []).reduce((v, c) => v + c.text.length + (c.detail || '').length, 0)
        ) - (
          (a.text || '').length + (a.choices || []).reduce((v, c) => v + c.text.length + (c.detail || '').length, 0)
        ))[0].id;
        return [['title', null], ['outfits', STORY.outfitNode], ['dialogue', longest('dialogue')], ['system', longest('system')], ['choice', longest('choice')], ['end', longest('end')]];
      });
      for (const [label, id] of targets) {
        if (id) await page.evaluate(id => {
          const node = STORY.nodes[id];
          const saved = { version: 1, current: id, route: ['prologue', 'finale'].includes(node.route) ? 'forest' : node.route, read: [id], visited: [id], history: [], choices: {}, complete: node.type === 'end' };
          localStorage.setItem('tanya30.story.v1', JSON.stringify(saved));
          NovelGame.resume();
        }, id);
        await page.waitForTimeout(180);
        await page.evaluate(() => Promise.all([...document.images].map(im => im.decode().catch(() => {}))));
        const metrics = await page.evaluate(() => {
          function rect(el) { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, bottom: r.bottom, right: r.right }; }
          function scrollParents(el) { const a = []; for (let p = el.parentElement; p; p = p.parentElement) { const s = getComputedStyle(p); if (/(auto|scroll)/.test(s.overflowX + s.overflowY)) a.push({ tag: p.id || p.className, rect: rect(p), x: p.scrollWidth > p.clientWidth, y: p.scrollHeight > p.clientHeight }); } return a; }
          const buttons = [...document.querySelectorAll('button')].filter(el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden').map(el => ({ id: el.id || el.dataset.route || el.dataset.choice || el.textContent.trim().slice(0, 40), disabled: el.disabled, rect: rect(el), scrollParents: scrollParents(el) }));
          const surfaces = [...document.querySelectorAll('.art-layer.active .art-surface')].map(el => ({ rect: rect(el), parent: rect(el.parentElement), backgroundSize: el.style.backgroundSize, backgroundPosition: el.style.backgroundPosition, key: el.parentElement.dataset.artKey }));
          const t = document.getElementById('dialogueText');
          return { screen: NovelGame.getScreen(), current: NovelGame.getState().current, body: { scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight, width: innerWidth, height: innerHeight }, buttons, surfaces, text: { length: t.textContent.length, clientHeight: t.clientHeight, scrollHeight: t.scrollHeight }, dialogue: rect(document.getElementById('dialogueWrap')), end: { clientHeight: document.getElementById('endScreen').clientHeight, scrollHeight: document.getElementById('endScreen').scrollHeight } };
        });
        const inaccessible = metrics.buttons.filter(b => !b.disabled && (
          b.rect.x < -1 || b.rect.right > size.width + 1 || b.rect.y < -1 || b.rect.bottom > size.height + 1
        ) && !b.scrollParents.some(p => p.x || p.y));
        const shot = 'qa/' + label + '-' + size.name + '.png';
        await page.screenshot({ path: path.join(ROOT, shot), fullPage: false });
        const entry = { viewport: size.name, label, screenshot: shot, ...metrics, inaccessible, horizontalPageOverflow: metrics.body.scrollWidth > size.width + 1 };
        report.results.push(entry);
        assert.equal(entry.horizontalPageOverflow, false, size.name + '/' + label + ': horizontal page overflow');
        assert.equal(inaccessible.length, 0, size.name + '/' + label + ': inaccessible button');
        if (label === 'outfits') {
          for (let i = 0; i < 3; i++) {
            await page.locator('.outfit-card').nth(i).scrollIntoViewIfNeeded();
            assert(await page.locator('.outfit-card').nth(i).isVisible());
          }
        }
        if (label === 'end') {
          await page.locator('#restartBtn').scrollIntoViewIfNeeded();
          await page.locator('#restartBtn').click();
          assert.equal(await page.evaluate(() => NovelGame.getScreen()), 'title');
        }
      }
      const pagination = await page.evaluate(() => {
        const result = { viewport: { width: innerWidth, height: innerHeight }, checkedNodes: 0, totalPages: 0, paginatedNodes: [], failures: [] };
        for (const node of Object.values(STORY.nodes).filter(n => !n.skip && ['title', 'dialogue', 'system', 'choice'].includes(n.type))) {
          const saved = { version: 1, revision: STORY.revision, current: node.id, textOffset: 0, route: ['prologue', 'finale'].includes(node.route) ? 'forest' : node.route, read: [], visited: [node.id], history: [], choices: {}, complete: false };
          localStorage.setItem('tanya30.story.v1', JSON.stringify(saved));
          NovelGame.resume();
          const chunks = [];
          for (let index = 0; index < 40; index++) {
            const t = document.getElementById('dialogueText');
            const text = t.textContent;
            const hint = document.getElementById('readHint').textContent;
            const match = hint.match(/Страница (\d+) из (\d+)/);
            const expectedFinal = !match || Number(match[1]) === Number(match[2]);
            const markedRead = NovelGame.getState().read.includes(node.id);
            if (expectedFinal !== markedRead) result.failures.push({ node: node.id, reason: 'read-mark-before-final-page', hint, markedRead });
            if (t.scrollHeight > t.clientHeight + 1) result.failures.push({ node: node.id, reason: 'page-text-overflow', hint, scrollHeight: t.scrollHeight, clientHeight: t.clientHeight });
            if (node.type === 'choice' && !expectedFinal && !document.getElementById('choices').hidden) result.failures.push({ node: node.id, reason: 'choice-visible-before-final-page', hint });
            chunks.push(text);
            if (expectedFinal) break;
            NovelGame.advance();
            if (NovelGame.getState().current !== node.id) { result.failures.push({ node: node.id, reason: 'node-advanced-before-final-page' }); break; }
          }
          if (chunks.join('') !== (node.text || '')) result.failures.push({ node: node.id, reason: 'page-concatenation-mismatch' });
          result.checkedNodes++;
          result.totalPages += chunks.length;
          if (chunks.length > 1) result.paginatedNodes.push({ node: node.id, pages: chunks.length, textPreservedExactly: chunks.join('') === node.text });
        }
        return result;
      });
      report.pagination.push(pagination);
      assert.equal(pagination.failures.length, 0, size.name + ': text pagination failed ' + JSON.stringify(pagination.failures));
      if (size.name === 'narrow') {
        await page.evaluate(() => {
          localStorage.setItem('tanya30.story.v1', JSON.stringify({ version: 1, current: 'p040', textOffset: 0, route: 'forest', read: [], visited: ['p040'], history: [], choices: {}, complete: false }));
          NovelGame.resume();
        });
        await page.waitForTimeout(100);
        await page.screenshot({ path: ROOT + '/qa/system-page1-narrow.png' });
        await page.evaluate(() => NovelGame.advance());
        await page.waitForTimeout(100);
        await page.screenshot({ path: ROOT + '/qa/system-page2-narrow.png' });
      }
      await context.close();
    }
    assert.equal(report.errors.length, 0, 'JavaScript page errors');
    report.status = 'PASS';
    report.indexSha256After = hashFile(ROOT + '/index.html');
    report.previewSha256 = hashFile(ROOT + '/qa/public/index.html');
    assert.equal(report.indexSha256, report.indexSha256After, 'Index changed while QA was running');
    assert.equal(report.indexSha256, report.previewSha256, 'Preview differs from delivered index');
    report.textScrollRequired = report.results.filter(r => r.label !== 'title' && r.text.scrollHeight > r.text.clientHeight + 1).map(r => ({ viewport: r.viewport, node: r.current, clientHeight: r.text.clientHeight, scrollHeight: r.text.scrollHeight }));
    report.verificationScope = 'Geometry, button accessibility, page JavaScript errors, outfit scrolling and restart. Text pagination and visual fidelity are reviewed separately.';
  } catch (e) {
    report.status = 'FAIL'; report.failure = e.stack;
    process.exitCode = 1;
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(ROOT, 'docs/QA_RESPONSIVE.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ status: report.status, screenshots: report.results.length, errors: report.errors, failure: report.failure || null }));
  }
})();
