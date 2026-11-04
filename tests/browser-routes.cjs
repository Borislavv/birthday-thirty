/* Real-browser route integration tests against the scoped loopback preview. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { chromium } = require('/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const root = path.resolve(__dirname, '..');
const file = process.env.NOVEL_HTML || path.join(root, 'index.html');
const previewURL = process.env.NOVEL_URL || 'http://127.0.0.1:8765/index.html';
const story = JSON.parse(fs.readFileSync(path.join(root, 'data/story.json'), 'utf8'));
const saveKey = 'tanya30.story.v1';
const settingsKey = 'tanya30.settings.v1';
const report = {
  target: file, previewURL, protocol: 'http:', startedAt: new Date().toISOString(),
  browser: 'Chromium', errors: [], results: [], wrongOptions: [],
  royalPaths: [], checks: {}, result: 'RUNNING',
};
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
report.deliverableSHA256 = digest(fs.readFileSync(file));
const html = fs.readFileSync(file, 'utf8');
assert(!/<script\b[^>]*\bsrc\s*=/i.test(html), 'External script dependency');
assert(!/<link\b[^>]*\brel=["']stylesheet/i.test(html), 'External stylesheet dependency');
assert(!/<img\b[^>]*\bsrc=["'](?!data:)/i.test(html), 'External image dependency');
report.checks.selfContainedHTMLStructure = true;

let browser;
let page;
let context;
const errors = [];

async function state() { return page.evaluate(() => window.NovelGame.getState()); }
async function current() { return (await state()).current; }
async function waitNode(id) {
  await page.waitForFunction(id => window.NovelGame.getState().current === id, id);
}
async function readToStop() {
  // Advance is the same controller called by the real Next button. Choices are
  // always made through visible DOM buttons below; no direct visit is exposed.
  return page.evaluate(() => {
    for (let i = 0; i < 200; i++) {
      const id = window.NovelGame.getState().current;
      const n = window.STORY.nodes[id];
      if (['choice', 'outfits', 'end'].includes(n.type)) return { id, type: n.type, route: n.route };
      const beforeOffset=window.NovelGame.getState().textOffset;
      window.NovelGame.advance();
      const after=window.NovelGame.getState();
      if (after.current === id && after.textOffset===beforeOffset) throw new Error('Unexpected blocked advance: ' + id);
    }
    throw new Error('Traversal exceeded bound');
  });
}
async function assertChoiceCannotSkip(id) {
  assert.equal(await current(), id);
  assert.equal(await page.locator('#nextBtn').isVisible(), false, 'Unanswered choice has Next');
  await page.evaluate(() => window.NovelGame.advance());
  assert.equal(await current(), id, 'Controller bypassed unanswered choice');
  await page.evaluate(() => document.activeElement?.blur());
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Space');
  assert.equal(await current(), id, 'Keyboard bypassed unanswered choice');
  await page.locator('#menuBtn').click();
  await page.locator('#skipReadBtn').click();
  assert.equal(await current(), id, 'Skip-read bypassed unanswered choice');
  assert.equal(await page.locator('#menuDialog').isVisible(), false);
}
async function choose(index, expected) {
  const id = await current();
  const n = story.nodes[id];
  await page.locator(`#choices [data-choice="${index}"]`).click();
  if (n.confirmLabel) {
    assert.equal(await current(), id, 'Unsigned decree advanced before confirmation');
    assert.equal(await page.locator(`#choices [data-choice="${index}"]`).getAttribute('class').then(x => x.includes('selected')), true);
    assert.equal(await page.locator('#nextBtn').isVisible(), true);
    assert.equal((await page.locator('#nextBtn').innerText()).trim(), n.confirmLabel);
    await page.locator('#nextBtn').click();
  }
  await waitNode(expected || n.choices[index].next);
}
async function begin(route) {
  assert.equal(await page.evaluate(() => window.NovelGame.getScreen()), 'title');
  await page.locator('#startBtn').click();
  assert.equal(await current(), story.start);
  // Use real UI Next throughout the prologue and real outfit card selection.
  for (let i = 0; i < 20; i++) {
    if (await page.evaluate(() => window.NovelGame.getScreen()) === 'outfits') break;
    await page.locator('#nextBtn').click();
  }
  assert.equal(await current(), 'outfits');
  await page.locator(`#outfitCards [data-route="${route}"]`).click();
  await waitNode(story.routes[route].entry);
  assert.equal((await state()).route, route);
}
async function verifyEnd(route) {
  const s = await state();
  assert.equal(s.current, 'p341');
  assert.equal(s.complete, true);
  assert.equal(await page.locator('#endScreen').isVisible(), true);
  const expected = story.nodes.p341.text.split(/\n\n|\n/).filter(Boolean);
  assert.equal(await page.locator('#endHeading').textContent(), expected[0]);
  assert.deepEqual(await page.locator('#endText p').allTextContents(), expected.slice(1));
  assert.equal(await page.locator('#endFootnote').textContent(), story.nodes.p341.footnote);
  const allowed = new Set(['prologue', route, 'finale']);
  for (const id of s.visited) assert(allowed.has(story.nodes[id].route), 'Leaked other route ' + id);
  assert.equal(await page.locator('#restartBtn').isVisible(), true);
  assert.equal(await page.locator('#progressFill').evaluate(e => e.style.width), '100%');
  return s;
}
async function restartAndCheck() {
  await page.locator('#restartBtn').click();
  assert.equal(await page.evaluate(() => window.NovelGame.getScreen()), 'title');
  const s = await state();
  assert.equal(s.current, story.start);
  assert.equal(s.route, null);
  assert.equal(s.complete, false);
  for (const key of ['read', 'visited', 'history']) assert.deepEqual(s[key], []);
  assert.deepEqual(s.choices, {});
  assert.equal(await page.evaluate(key => localStorage.getItem(key), saveKey), null);
  assert.equal(await page.locator('#resumeBtn').isVisible(), false);
}
async function reloadResume(expected) {
  const before = await state();
  await page.reload();
  await page.waitForFunction(() => Boolean(window.NovelGame));
  assert.equal(await page.evaluate(() => window.NovelGame.getScreen()), 'title');
  assert.equal(await page.locator('#resumeBtn').isVisible(), true);
  await page.locator('#resumeBtn').click();
  await waitNode(expected);
  const after = await state();
  for (const key of ['current', 'textOffset', 'route', 'choices', 'visited', 'history', 'complete']) assert.deepEqual(after[key], before[key]);
}

(async () => {
  try {
    browser = await chromium.launch({ headless: true, executablePath: process.env.NOVEL_CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
    report.browserVersion = browser.version();
    context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    await context.addInitScript(({ settingsKey }) => {
      localStorage.setItem(settingsKey, JSON.stringify({ volume: 0, muted: true, typing: false, motion: false }));
    }, { settingsKey });
    page = await context.newPage();
    page.on('pageerror', e => errors.push({ type: 'pageerror', message: e.message }));
    page.on('console', m => { if (m.type() === 'error') errors.push({ type: 'console', message: m.text(), location: m.location() }); });
    const response = await context.request.get(previewURL);
    report.previewSHA256 = digest(await response.body());
    assert.equal(report.previewSHA256, report.deliverableSHA256, 'Preview differs from deliverable');
    await page.goto(previewURL);
    await page.waitForFunction(() => Boolean(window.NovelGame));
    await page.evaluate(key => localStorage.removeItem(key), saveKey);
    report.checks.scopedLoopbackLaunch = true;

    // Forest and Wonderland: every wrong button is clicked, its exact authored
    // feedback is shown, skip remains blocked, retry restores the same question.
    for (const route of ['forest', 'wonderland']) {
      await begin(route);
      let resumedWrong = false;
      let resumedRight = false;
      for (let guard = 0; guard < 20; guard++) {
        const stop = await readToStop();
        if (stop.type === 'end') break;
        assert.equal(stop.type, 'choice');
        const n = story.nodes[stop.id];
        await assertChoiceCannotSkip(stop.id);
        for (let i = 0; i < n.choices.length; i++) {
          const c = n.choices[i];
          if (c.correct !== false) continue;
          await choose(i);
          const response = story.nodes[c.next];
          assert.equal(await page.locator('#dialogueText').textContent(), response.text);
          assert.equal(await page.locator('#gameScreen').evaluate(e => e.classList.contains('wrong')), true);
          if (!resumedWrong && route === 'forest') { await reloadResume(c.next); resumedWrong = true; }
          await page.locator('#menuBtn').click();
          await page.locator('#skipReadBtn').click();
          assert.equal(await current(), c.next, 'Skip-read bypassed retry');
          const retryText = (await page.locator('#nextBtn').innerText()).trim();
          assert.equal(retryText, response.retryLabel);
          await page.locator('#nextBtn').click();
          await waitNode(stop.id);
          await assertChoiceCannotSkip(stop.id);
          report.wrongOptions.push({ route, question: stop.id, option: i, feedback: c.next, result: 'PASS' });
        }
        const correct = n.choices.findIndex(c => c.correct === true);
        await choose(correct);
        if (!resumedRight && route === 'forest') { await reloadResume(n.choices[correct].next); resumedRight = true; }
      }
      const final = await verifyEnd(route);
      if (route === 'forest') {
        assert(final.visited.includes('p104'), 'Missing frog transformation');
        report.checks.resumeFromWrongAndCorrect = true;
      } else {
        assert(final.visited.includes('p201') && final.visited.includes('p215') && final.visited.includes('p217'), 'Missing Queen gift or Alice return');
      }
      report.results.push({ route, visitedNodes: final.visited.length, result: 'PASS' });
      await restartAndCheck();
    }
    assert.equal(report.wrongOptions.length, 10);

    // Every Cartesian combination of two breakfasts, three dossiers and two
    // diplomatic missions is traversed using actual answer/confirm controls.
    for (let a = 0; a < 2; a++) for (let b = 0; b < 3; b++) for (let c = 0; c < 2; c++) {
      const picks = { 'decree-1': a, 'decree-2': b, 'decree-3': c };
      await begin('versailles');
      for (let guard = 0; guard < 20; guard++) {
        const stop = await readToStop();
        if (stop.type === 'end') break;
        assert.equal(stop.type, 'choice');
        const n = story.nodes[stop.id];
        assert.equal(n.freeChoice, true);
        assert(n.choices.every(x => x.correct));
        await assertChoiceCannotSkip(stop.id);
        await choose(picks[stop.id]);
        assert.equal(await page.locator('#gameScreen').evaluate(e => e.classList.contains('wrong')), false, 'Royal choice wrongly marked as error');
      }
      const final = await verifyEnd('versailles');
      assert(final.visited.includes('p301') && final.visited.includes('p305'), 'Missing last royal decree');
      report.royalPaths.push({ picks: [a, b, c], visitedNodes: final.visited.length, result: 'PASS' });
      await restartAndCheck();
    }
    report.checks.allTwelveRoyalCombinations = true;
    report.checks.noChoiceBypass = true;
    report.checks.allTenWrongOptionsRetried = true;
    report.checks.identicalExactFullFinale = true;
    report.checks.restartResetsReadHistoryChoicesAndSave = true;

    // At 320px the long authored warning must be split without dropping even a
    // space, and reloading must preserve the exact second-page text offset.
    const mobileContext=await browser.newContext({viewport:{width:320,height:640},reducedMotion:'reduce'});
    await mobileContext.addInitScript(({settingsKey})=>localStorage.setItem(settingsKey,JSON.stringify({volume:0,muted:true,typing:false,motion:false})),{settingsKey});
    page=await mobileContext.newPage();
    page.on('pageerror',e=>errors.push({type:'pageerror',message:e.message}));
    page.on('console',m=>{if(m.type()==='error')errors.push({type:'console',message:m.text(),location:m.location()});});
    await page.goto(previewURL);
    await page.waitForFunction(()=>Boolean(window.NovelGame));
    await begin('forest');
    await page.evaluate(()=>{
      for(let i=0;i<50&&window.NovelGame.getState().current!=='p040';i++)window.NovelGame.advance();
    });
    await waitNode('p040');
    const firstPage=await page.locator('#dialogueText').textContent();
    assert(firstPage.length<story.nodes.p040.text.length,'320px warning did not paginate');
    assert(!(await state()).read.includes('p040'),'Warning marked read before final page');
    await page.locator('#nextBtn').click();
    assert.equal(await current(),'p040');
    const secondPage=await page.locator('#dialogueText').textContent();
    const secondOffset=(await state()).textOffset;
    assert(secondOffset>0);
    await reloadResume('p040');
    assert.equal((await state()).textOffset,secondOffset);
    assert.equal(await page.locator('#dialogueText').textContent(),secondPage);
    await page.screenshot({path:path.join(root,'docs/QA_MOBILE_PAGINATION.png'),fullPage:true});
    const pages=[firstPage,secondPage];
    for(let i=0;i<10;i++){
      await page.locator('#nextBtn').click();
      if(await current()!=='p040')break;
      pages.push(await page.locator('#dialogueText').textContent());
    }
    assert.equal(pages.join(''),story.nodes.p040.text,'Paginated text changed');
    assert((await state()).read.includes('p040'));
    report.checks.mobile320PaginationExact={pages:pages.length,sourceCharacters:story.nodes.p040.text.length,reloadOffset:secondOffset};

    // Regression: skipping an already-read multi-page Queen response must reset
    // its page offset before rendering the next unread multi-page achievement.
    // A compact viewport makes both authored adjacent nodes paginate naturally.
    await page.setViewportSize({width:320,height:400});
    await page.evaluate(()=>window.NovelGame.restart());
    await page.evaluate(({saveKey})=>{
      localStorage.setItem(saveKey,JSON.stringify({version:1,current:'p203',textOffset:0,route:'wonderland',read:[],visited:[],history:[],choices:{},complete:false}));
    },{saveKey});
    await page.reload();
    await page.waitForFunction(()=>Boolean(window.NovelGame));
    await page.locator('#resumeBtn').click();
    await waitNode('p203');
    const queenFirstPage=await page.locator('#dialogueText').textContent();
    assert(queenFirstPage.length<story.nodes.p203.text.length,'Regression current node must have multiple pages');
    for(let i=0;i<8&&!(await state()).read.includes('p203');i++){
      await page.locator('#nextBtn').click();
      assert.equal(await current(),'p203','Regression must remain on current node until its last page');
    }
    const queenOffset=(await state()).textOffset;
    assert(queenOffset>0,'Regression must start with nonzero offset');
    assert((await state()).read.includes('p203'));
    await page.locator('#menuBtn').click();
    await page.locator('#skipReadBtn').click();
    await waitNode('p205');
    const achievementState=await state();
    const achievementFirstPage=await page.locator('#dialogueText').textContent();
    assert.equal(achievementState.textOffset,0,'Skip-read retained preceding dialogue page offset');
    assert(achievementFirstPage.length<story.nodes.p205.text.length,'Regression next node must have multiple pages');
    assert(story.nodes.p205.text.startsWith(achievementFirstPage),'Skip-read omitted beginning of unread achievement');
    assert(achievementFirstPage.startsWith('ДОСТИЖЕНИЕ ОТКРЫТО: «Мягкая сила».'));
    assert(!achievementState.read.includes('p205'),'Skipped unread achievement was marked read prematurely');
    report.checks.skipReadResetsOffsetForUnreadPage={from:'p203',to:'p205',oldOffset:queenOffset,newOffset:achievementState.textOffset,firstPageCharacters:achievementFirstPage.length};
    await mobileContext.close();
    assert.equal(digest(fs.readFileSync(file)), report.deliverableSHA256, 'Deliverable changed during QA; rerun exact current build');
    report.errors = errors;
    assert.equal(errors.length, 0, 'Browser errors: ' + JSON.stringify(errors));
    report.result = 'PASS';
  } catch (e) {
    report.result = 'FAIL';
    report.failure = { message: e.message, stack: e.stack };
    report.errors = errors;
    if (page) {
      try { report.failure.state = await state(); } catch (_) {}
      try { await page.screenshot({ path: path.join(root, 'docs/QA_ROUTES_FAILURE.png'), fullPage: true }); } catch (_) {}
    }
    process.exitCode = 1;
  } finally {
    report.finishedAt = new Date().toISOString();
    fs.writeFileSync(path.join(root, 'docs/QA_ROUTES.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ result: report.result, routes: report.results.length, wrongOptions: report.wrongOptions.length, royalPaths: report.royalPaths.length, failure: report.failure?.message, errors: report.errors }, null, 2));
    await browser?.close();
  }
})();
