'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { chromium } = require('/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const ROOT = '/Users/admin/dev/wife_game';
const BEFORE = path.join(ROOT, 'source/revisions/2026-11-04-text-update/before');
const REVISION = '2026-11-04-wording-v2';
const URL = 'http://127.0.0.1:8765/index.html';
const sha = data => crypto.createHash('sha256').update(data).digest('hex');
const read = p => fs.readFileSync(p, 'utf8');
const json = p => JSON.parse(read(p));
const old = json(BEFORE + '/data/story.json');
const current = json(ROOT + '/data/story.json');
const report = { checkedAtUTC: new Date().toISOString(), revision: REVISION, url: URL, indexSHA256: sha(fs.readFileSync(ROOT + '/index.html')), checks: {}, browser: {}, errors: [] };
const EXPECTED = {
  p002: 'Утро именинницы',
  p027: '«Операция Расколдуй мужа»',
  p029: 'Где мой принц?',
  p045: 'Первая загадка. Лесная мудрость',
  p065: 'Вторая загадка. Бабушкина избушка',
  p084: 'Третья загадка. Испытание Кощея',
  p098: 'Поцелуй лягушки',
  p116: '«Алиса в стране чудес и очень странных решений»',
  p118: 'Белый кролик не по расписанию',
  p127: '— Так. У меня сегодня день рождения, я жду ребенка, и теперь мне нужно спасать дочку в другом измерении?!',
  p133: 'Первый шаг. Шляпка для королевы',
  p155: 'Второй шаг. Волшебный кальян Абсолема',
  p187: 'Третий шаг. Красные розы и большая дипломатия',
  p207: 'Превращение в Белую королеву',
  p222: '«Тридцать лет абсолютной власти»',
  p224: 'Королевский прием',
  p233: '',
  p234: 'Указ первый. Государственный завтрак',
  p250: 'УКАЗ ПЕРВЫЙ ПОДПИСАН.\n\nГосударственный круассан утверждён. Нация сыта, королева довольна.',
  p252: 'Указ второй. Дело государственной важности',
  p267: 'УКАЗ ВТОРОЙ ПРИНЯТ.\n\nКоролевство признало, что не каждый спор требует государственного вмешательства. Советникам назначен обязательный перерыв на круассаны.',
  p270: 'Указ третий. Международная политика',
  p294: 'УКАЗ ТРЕТИЙ ПОДПИСАН.\n\nВсе стороны приглашены к переговорам. Армия получила выходной. Королевский бюджет сэкономил на военных расходах и потратил деньги на праздник.',
  p296: 'Последний королевский указ',
  p311: '«Тридцать — это только начало»',
  p313: 'Дома',
  'forest-wrong-3': 'НЕ ВЕРНО!\n\nНо не переживай: твой муж уже прижился в болоте и на него теперь заглядываются бабы-жабы. Торопись!'
};
const staleVisible = /Пролог\.|Сюжет [123]\.|Сцена [1-4]\.|Шаг [1-3]\.|Загадка №|Указ №|Общий финал\.|Системное сообщение|Королевские дела/;

function critical(node) {
  const keys = ['id', 'type', 'art', 'route', 'next', 'effect', 'retry', 'result', 'confirmLabel'];
  return { ...Object.fromEntries(keys.map(k => [k, node[k] ?? null])), choices: (node.choices || []).map(c => Object.fromEntries(['route', 'next', 'correct', 'art'].map(k => [k, c[k] ?? null]))) };
}
function embeddedImages(html) {
  const prefix = 'window.NOVEL_IMAGES = ';
  const start = html.indexOf(prefix);
  assert(start >= 0, 'Embedded image map missing');
  const end = html.indexOf(';\nwindow.NOVEL_ART', start);
  assert(end > start, 'Embedded image map terminator missing');
  return html.slice(start + prefix.length, end);
}
function legacySave(id, route, overrides = {}) {
  return { version: 1, current: id, route, textOffset: 0, read: [], visited: [id], history: [], choices: {}, complete: false, ...overrides };
}

(async () => {
  let browser;
  try {
    assert.equal(current.revision, REVISION);
    assert.equal(current.systemLabel, 'Сообщение');
    assert.deepEqual(Object.keys(current.nodes).sort(), Object.keys(old.nodes).sort());
    assert.equal(Object.keys(current.nodes).length, 158);
    for (const id of Object.keys(old.nodes)) assert.deepEqual(critical(current.nodes[id]), critical(old.nodes[id]), id + ': graph/visual/gameplay field changed');
    for (const [id, text] of Object.entries(EXPECTED)) assert.equal(current.nodes[id].text, text, id + ': revised wording differs');
    for (const node of Object.values(current.nodes)) assert.equal(staleVisible.test(node.text), false, node.id + ': obsolete visible label');
    assert.equal(current.nodes.p233.skip, true);
    assert.equal(current.nodes.p233.next, 'p234');
    assert.equal(current.nodes['forest-wrong-3'].retryLabel, 'Пересмотреть ответ');
    assert.equal(current.nodes['forest-wrong-3'].next, 'p088');
    assert.deepEqual(current.nodes.outfits.choices.map(c => c.title), ['Русская девица-красавица', 'Белый костюм ', 'Королева Франции']);
    assert.equal(current.nodes['hat-choice'].choices[2].detail, 'Очень мило. Но понравится ли королеве? .');
    assert.equal(Object.values(current.nodes).filter(n => n.inscription).length, 0);
    assert.equal(sha(fs.readFileSync(ROOT + '/source/scenario-revised.txt')), current.sourceAudit.rawSHA256);
    assert.equal(current.sourceAudit.rawSHA256, '894ef00b0c76a066072134ddf26b509855d1739a161b63da03f4cadb31e8491c');
    const changed = Object.keys(current.nodes).filter(k => JSON.stringify(old.nodes[k]) !== JSON.stringify(current.nodes[k]));
    assert.deepEqual([...current.changedTextNodes].sort(), changed.sort());
    report.checks.exactRevisedNodeTexts = Object.keys(EXPECTED).length;
    report.checks.stableGraphAndGameplayNodes = 158;
    report.checks.changedNodeMetadataExact = current.changedTextNodes.length;

    const protectedFiles = json(ROOT + '/docs/REVISION_PROTECTED_BASELINE.json').files;
    for (const [file, baseline] of Object.entries(protectedFiles)) assert.equal(sha(fs.readFileSync(ROOT + '/' + file)), baseline.sha256, file + ': protected media changed');
    const oldImages = embeddedImages(read(BEFORE + '/index.html'));
    const images = embeddedImages(read(ROOT + '/index.html'));
    assert.equal(images, oldImages, 'Embedded artwork bytes changed');
    assert.equal(read(ROOT + '/css/style.css'), read(BEFORE + '/css/style.css'), 'CSS changed in wording-only revision');
    assert.equal(fs.readFileSync(ROOT + '/qa/public/index.html').equals(fs.readFileSync(ROOT + '/index.html')), true, 'HTTP preview differs from final file');
    report.checks.protectedAssetAndAudioHashes = Object.keys(protectedFiles).length;
    report.checks.embeddedImageMapSHA256 = sha(images);
    report.checks.embeddedImageMapUnchanged = true;
    report.checks.cssUnchanged = true;
    const jsContext = { window: {} };
    vm.runInNewContext(read(ROOT + '/data/story.js'), jsContext);
    assert.equal(JSON.stringify(jsContext.window.STORY), JSON.stringify(current), 'story.js differs from story.json');

    browser = await chromium.launch({ headless: true, channel: 'chrome' });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    page.on('pageerror', e => report.errors.push(e.message));
    await page.addInitScript(() => {
      localStorage.removeItem('tanya30.story.v1');
      localStorage.setItem('tanya30.settings.v1', JSON.stringify({ typing: false, motion: false, muted: true, volume: 0 }));
    });
    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForFunction(() => !!window.NovelGame);
    assert.equal(await page.evaluate(() => STORY.revision), REVISION, 'HTTP preview serves old story');
    const seed = async save => page.evaluate(save => { localStorage.setItem('tanya30.story.v1', JSON.stringify(save)); NovelGame.resume(); }, save);

    const historicalChoice = { node: 'hat-choice-choice-3', speaker: 'Твой выбор', text: old.nodes['hat-choice'].choices[1].text, choice: true };
    const oldProgress = legacySave('p127', 'wonderland', {
      textOffset: 50, read: ['p002', 'p006', 'p012', 'p116', 'p127'],
      visited: ['p002', 'p006', 'p009', 'outfits', 'p116', 'p118', 'p121', 'p123', 'p125', 'p127'],
      choices: { outfits: 1 },
      history: [
        { node: 'p002', speaker: '', text: old.nodes.p002.text },
        { node: 'p012', speaker: 'Системное сообщение', text: old.nodes.p012.text },
        { node: 'p116', speaker: '', text: old.nodes.p116.text },
        { node: 'p127', speaker: 'Таня', text: old.nodes.p127.text }, historicalChoice
      ]
    });
    await seed(oldProgress);
    const migrated = await page.evaluate(() => ({ state: NovelGame.getState(), text: document.getElementById('dialogueText').textContent }));
    assert.equal(migrated.state.current, 'p127');
    assert.equal(migrated.state.route, oldProgress.route);
    assert.deepEqual(migrated.state.choices, oldProgress.choices);
    assert.deepEqual(migrated.state.visited, oldProgress.visited);
    assert.equal(migrated.state.textOffset, 0);
    assert.equal(migrated.state.revision, REVISION);
    assert.equal(migrated.text, EXPECTED.p127);
    assert(migrated.state.read.includes('p006'));
    assert(!migrated.state.read.includes('p002') && !migrated.state.read.includes('p116'));
    assert.deepEqual(migrated.state.history.find(e => e.choice), historicalChoice);
    for (const entry of migrated.state.history.filter(e => !e.choice)) {
      assert.equal(entry.text, current.nodes[entry.node].text);
      assert.equal(entry.speaker, current.nodes[entry.node].speaker || (current.nodes[entry.node].type === 'system' ? 'Сообщение' : ''));
      assert.equal(staleVisible.test(entry.text + ' ' + entry.speaker), false);
    }
    await page.locator('#historyBtn').click();
    const visibleHistory = await page.locator('#historyContent').innerText();
    assert.equal(staleVisible.test(visibleHistory), false, 'Journal contains old label after migration');
    await page.locator('#historyDialog [data-close]').click();
    report.browser.legacyP127 = { currentPreserved: true, routeChoicesVisitedPreserved: true, changedTextOffsetReset: true, nonChoiceHistoryRebased: true, historicalChoicePreserved: true, revisedTextExact: true };

    const menuSave = legacySave('p233', 'versailles', { textOffset: 99, visited: ['p222', 'p224', 'p227', 'p229', 'p231', 'p232', 'p233'], choices: { outfits: 2 }, history: [{ node: 'p233', speaker: 'Системное сообщение', text: old.nodes.p233.text }] });
    await seed(menuSave);
    const skipped = await page.evaluate(() => ({ state: NovelGame.getState(), text: document.getElementById('dialogueText').textContent, body: document.body.innerText }));
    assert.equal(skipped.state.current, 'p234');
    assert.equal(skipped.state.route, 'versailles');
    assert.deepEqual(skipped.state.choices, menuSave.choices);
    assert(menuSave.visited.every(id => skipped.state.visited.includes(id)));
    assert.equal(skipped.state.history.some(e => e.node === 'p233'), false);
    assert.equal(skipped.text, EXPECTED.p234);
    assert.equal(skipped.body.includes('Королевские дела'), false);
    report.browser.legacyP233 = { skippedTo: 'p234', previousProgressPreserved: true, removedHistoryEntryExcluded: true, noBlankRemovedScreen: true };

    await seed(legacySave('p040', 'forest', { textOffset: 50 }));
    assert.equal(await page.evaluate(() => NovelGame.getState().textOffset), 50, 'Unchanged legacy text offset lost');
    report.browser.unchangedLegacyOffsetPreserved = true;

    let rendered = 0;
    for (const id of Object.keys(current.nodes)) {
      const node = current.nodes[id];
      await seed(legacySave(id, ['prologue', 'finale'].includes(node.route) ? 'forest' : node.route, { revision: REVISION }));
      const view = await page.evaluate(() => ({ current: NovelGame.getState().current, body: document.body.innerText, overlayHidden: document.getElementById('sceneProp').hidden, speaker: document.getElementById('speaker').textContent, outfitTitles: [...document.querySelectorAll('.outfit-copy h3')].map(el => el.textContent) }));
      assert.equal(view.overlayHidden, true, id + ': obsolete inscription overlay visible');
      assert.equal(staleVisible.test(view.body), false, id + ': obsolete label visible');
      assert.equal(view.current, node.skip ? node.next : id);
      if (node.type === 'system' && node.text) assert.equal(view.speaker, 'Сообщение', id + ': old system speaker label');
      if (node.type === 'outfits') assert.deepEqual(view.outfitTitles, current.nodes.outfits.choices.map(c => c.title));
      if (Object.hasOwn(EXPECTED, id) && !node.skip) {
        const seen = await page.evaluate(() => {
          const chunks = [];
          for (let i = 0; i < 20; i++) {
            chunks.push(document.getElementById('dialogueText').textContent);
            const match = document.getElementById('readHint').textContent.match(/Страница (\d+) из (\d+)/);
            if (!match || match[1] === match[2]) break;
            NovelGame.advance();
          }
          return chunks.join('');
        });
        assert.equal(seen, EXPECTED[id], id + ': rendered text differs');
      }
      rendered++;
    }
    report.browser.allNodeTextAndOverlayChecks = rendered;

    await seed(legacySave('p088', 'forest', { revision: REVISION }));
    await page.locator('.choice-button').nth(1).click();
    await page.waitForFunction(() => NovelGame.getState().current === 'forest-wrong-3');
    assert.equal(await page.locator('#dialogueText').textContent(), EXPECTED['forest-wrong-3']);
    assert.equal((await page.locator('#nextBtn').innerText()).trim(), 'Пересмотреть ответ');
    await page.locator('#nextBtn').click();
    assert.equal(await page.evaluate(() => NovelGame.getState().current), 'p088');
    await page.locator('.choice-button').first().click();
    await page.waitForFunction(() => NovelGame.getState().current === 'p092');
    report.browser.thirdRiddleAuthoredErrorAndRetry = { exactMessage: true, button: 'Пересмотреть ответ', loopsTo: 'p088', correctAnswerStillProgressesTo: 'p092' };
    await context.close();
    assert.deepEqual(report.errors, []);
    assert.equal(sha(fs.readFileSync(ROOT + '/index.html')), report.indexSHA256, 'Build changed while revision QA was running');
    report.status = 'PASS';
  } catch (e) {
    report.status = 'FAIL'; report.failure = e.stack; process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    fs.writeFileSync(ROOT + '/docs/QA_REVISION.json', JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  }
})();
