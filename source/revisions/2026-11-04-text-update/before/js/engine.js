(() => {
  'use strict';
  const story = window.STORY;
  const $ = id => document.getElementById(id);
  const app = $('app');
  const SAVE_KEY = 'tanya30.story.v1';
  const SETTINGS_KEY = 'tanya30.settings.v1';
  const defaultSettings = { volume: .35, muted: false, typing: true, motion: !matchMedia('(prefers-reduced-motion: reduce)').matches };
  let settings = { ...defaultSettings };
  let state = freshState();
  let screen = 'title';
  let typedTimer = 0;
  let typing = false;
  let fullText = '';
  let textPages = [''];
  let pageIndex = 0;
  let selected = null;
  let locked = false;
  let generation = 0;
  let activeArt = null;
  let activeLayer = 0;
  let toastTimer = 0;
  let particles = [];
  let effectMode = 'gold';
  let effectUntil = 0;
  let frameId = 0;
  let lastTime = 0;
  const artCache = new Map();
  const canvas = $('particles');
  const ctx = canvas.getContext('2d');

  function freshState() { return { version: 1, current: story.start, textOffset: 0, route: null, read: [], visited: [], history: [], choices: {}, complete: false }; }
  function safeParse(key) { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (_) { return null; } }
  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (_) {} }
  function saveSettings() { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (_) {} }
  function validSave(value) {
    if (!value || value.version !== 1 || !story.nodes[value.current] || !Array.isArray(value.read) || !Array.isArray(value.visited) || !Array.isArray(value.history)) return false;
    const n = story.nodes[value.current];
    return (!value.route || Object.hasOwn(story.routes, value.route)) && (n.route === 'prologue' || n.route === 'finale' || n.route === value.route);
  }
  function notify(text) { $('toast').textContent = text; $('toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 2800); }
  function audio() { return window.NovelAudio; }
  function startAudio() { audio()?.init(); audio()?.setMuted(settings.muted); audio()?.setVolume(settings.volume); }
  function applySettings() {
    app.classList.toggle('no-motion', !settings.motion);
    $('volumeInput').value = Math.round(settings.volume * 100);
    $('typingInput').checked = settings.typing;
    $('motionInput').checked = settings.motion;
    $('soundBtn').setAttribute('aria-pressed', String(settings.muted));
    $('soundBtn').setAttribute('aria-label', settings.muted ? 'Включить музыку' : 'Выключить музыку');
    $('soundBtn').querySelector('use').setAttribute('href', settings.muted ? '#i-mute' : '#i-sound');
    audio()?.setMuted(settings.muted); audio()?.setVolume(settings.volume);
    if (settings.motion) { if (!frameId) animateParticles(); } else { cancelAnimationFrame(frameId); frameId = 0; ctx?.clearRect(0, 0, canvas.width, canvas.height); }
  }

  function setScreen(nextScreen) {
    screen = nextScreen; app.dataset.screen = nextScreen;
    if (nextScreen !== 'game') $('sceneProp').hidden = true;
    $('titleScreen').hidden = nextScreen !== 'title';
    $('gameScreen').hidden = nextScreen !== 'game';
    $('outfitScreen').hidden = nextScreen !== 'outfits';
    $('endScreen').hidden = nextScreen !== 'end';
    $('chapterName').textContent = nextScreen === 'title' ? 'Сказка начинается здесь' : chapterTitle();
    $('resumeBtn').hidden = !validSave(safeParse(SAVE_KEY));
  }
  function chapterTitle() {
    const n = story.nodes[state.current];
    if (n.route === 'finale') return 'Тридцать — это только начало';
    return state.route ? story.routes[state.route].title.replace(/^Сюжет \d\. /, '') : 'Пролог. Утро именинницы';
  }
  function sceneTitle(node) {
    if(node.route==='finale')return 'Сцена 4. Дома';
    if(node.route==='prologue')return story.nodes.p002.text;
    const ids={forest:'p029',frog:'p029',oak:'p045',yaga:'p065',tower:'p084','frog-pillow':'p098',transform:'p098',medi:'p098','forest-party':'p098',rabbit:'p118','rabbit-hole':'p118',wonderland:'p118',hatter:'p133',hats:'p133',absolem:'p155',bubbles:'p155','rose-garden':'p187','red-queen':'p187',mug:'p187','white-crown':'p207','white-queen':'p207','alice-home':'p207',palace:'p224',throne:'p224',herald:'p224',advisor:'p224',breakfast:'p234',dossier:'p252',council:'p252',minister:'p270','rainbow-knights':'p270','peace-delegation':'p270','throne-shoes':'p296','last-decree':'p296','palace-party':'p296'};
    return story.nodes[ids[node.art]]?.text || chapterTitle();
  }
  function progress() {
    const n = story.nodes[state.current];
    const relevant = Object.values(story.nodes).filter(x => (x.route === 'prologue' || x.route === state.route || x.route === 'finale') && !x.retry);
    const visited = relevant.filter(x => state.visited.includes(x.id)).length;
    $('progressFill').style.width = (n.type === 'end' ? 100 : Math.min(98, visited / relevant.length * 100)) + '%';
    $('progressFill').parentElement.setAttribute('aria-valuenow', Math.round(visited / relevant.length * 100));
  }
  function artConfig(key) { return window.NOVEL_ART[key] || null; }
  function imageFor(src) {
    if (!artCache.has(src)) {
      const im = new Image(); im.src = src;
      artCache.set(src, new Promise(resolve => { im.onload = () => resolve(im); im.onerror = () => resolve(null); if (im.complete && im.naturalWidth) resolve(im); }));
    }
    return artCache.get(src);
  }
  async function placeArt(element, key, cover = false) {
    const cfg = artConfig(key);
    if (!cfg) { console.error('Missing art:', key); return; }
    element.dataset.artKey = key;
    const im = await imageFor(cfg.src);
    if (!im || element.dataset.artKey !== key) return;
    const columns = cfg.cols || 1, rows = cfg.rows || 1, index = cfg.index || 0;
    const tileW = im.naturalWidth / columns, tileH = im.naturalHeight / rows;
    const width = element.clientWidth, height = element.clientHeight;
    const mobileScene = innerWidth < 651 && !cover && element.classList.contains('art-layer') && screen === 'game';
    const contain = cfg.fit === 'contain' || mobileScene;
    const scale = contain ? Math.min(width / tileW, height / tileH) : Math.max(width / tileW, height / tileH);
    const cx = index % columns, cy = Math.floor(index / columns);
    const fx = innerWidth < 651 && cover ? .69 : (cfg.focusX ?? .5);
    const fy = cfg.focusY ?? .42;
    let surface = element.querySelector('.art-foreground');
    if (!surface) { surface = document.createElement('div'); surface.className = 'art-surface art-foreground'; element.prepend(surface); }
    let backdrop=element.querySelector('.art-backdrop');
    if(contain){
      if(!backdrop){backdrop=document.createElement('div');backdrop.className='art-surface art-backdrop';element.prepend(backdrop);}
      const backScale=Math.max(width/tileW,height/tileH)*1.05;
      backdrop.style.width=tileW*backScale+'px';backdrop.style.height=tileH*backScale+'px';
      backdrop.style.left=(width-tileW*backScale)*.5+'px';backdrop.style.top=(height-tileH*backScale)*.5+'px';
      backdrop.style.backgroundImage=`url("${cfg.src}")`;backdrop.style.backgroundSize=`${im.naturalWidth*backScale}px ${im.naturalHeight*backScale}px`;backdrop.style.backgroundPosition=`${-cx*tileW*backScale}px ${-cy*tileH*backScale}px`;
    }else backdrop?.remove();
    element.classList.toggle('mobile-scene-art',mobileScene);
    const displayW=tileW*scale,displayH=tileH*scale;
    surface.style.width=displayW+'px';surface.style.height=displayH+'px';
    surface.style.left=((width-displayW)*fx)+'px';
    const dialogueHeight=$('dialogueWrap').getBoundingClientRect().height || 200;
    surface.style.top=(mobileScene ? Math.max(90,77+(height-77-dialogueHeight-25-displayH)/2) : (height-displayH)*fy)+'px';
    surface.style.backgroundImage = `url("${cfg.src}")`;
    surface.style.backgroundSize = `${im.naturalWidth * scale}px ${im.naturalHeight * scale}px`;
    surface.style.backgroundPosition = `${-cx*tileW*scale}px ${-cy*tileH*scale}px`;
  }
  async function setArt(key) {
    if (activeArt === key) return;
    activeArt = key;
    const idx = activeLayer = 1 - activeLayer;
    const target = idx ? $('artB') : $('artA');
    await placeArt(target, key, key === 'title');
    if (activeArt !== key) return;
    target.classList.add('active');
    (idx ? $('artA') : $('artB')).classList.remove('active');
  }
  function resize() {
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = app.clientWidth * ratio; canvas.height = app.clientHeight * ratio;
    ctx?.setTransform(ratio, 0, 0, ratio, 0, 0);
    for (const element of document.querySelectorAll('[data-art-key]')) placeArt(element, element.dataset.artKey, element.dataset.artKey === 'title');
  }
  function markRead(node) {
    if (!state.read.includes(node.id)) state.read.push(node.id);
    if (node.text && !state.history.some(h => h.node === node.id)) state.history.push({ node: node.id, speaker: node.speaker || (node.type === 'system' ? 'Системное сообщение' : ''), text: node.text });
    save();
  }
  function finishTyping() {
    clearInterval(typedTimer); typing = false;
    $('dialogueText').textContent = fullText;
    const n = story.nodes[state.current];
    if (pageIndex === textPages.length - 1) {
      markRead(n);
      if (n.type === 'choice') {
        $('choices').hidden = false;
        requestAnimationFrame(()=>{for(const el of $('choices').querySelectorAll('[data-art-key]'))placeArt(el,el.dataset.artKey);});
      }
    }
  }
  function paginateText(text) {
    if (!text) return [''];
    const element=$('dialogueText'), limit=parseFloat(getComputedStyle(element).maxHeight);
    if (!Number.isFinite(limit)) return [text];
    const characters=Array.from(text), pages=[];
    let offset=0;
    while(offset<characters.length){
      let lo=1,hi=characters.length-offset,fit=1;
      while(lo<=hi){const mid=(lo+hi)>>1;element.textContent=characters.slice(offset,offset+mid).join('');if(element.scrollHeight<=limit+1){fit=mid;lo=mid+1;}else hi=mid-1;}
      if(offset+fit<characters.length){const candidate=characters.slice(offset,offset+fit).join('');const boundary=Math.max(candidate.lastIndexOf('\n'),candidate.lastIndexOf(' '));if(boundary>candidate.length*.55)fit=Array.from(candidate.slice(0,boundary+1)).length;}
      pages.push(characters.slice(offset,offset+fit).join(''));offset+=fit;
    }
    element.textContent='';return pages;
  }
  function showText(node) {
    textPages=paginateText(node.text || '');
    let consumed=0;pageIndex=0;
    for(let i=0;i<textPages.length;i++){if(consumed<=(state.textOffset||0))pageIndex=i;consumed+=textPages[i].length;}
    showPage(node);
  }
  function showPage(node) {
    clearInterval(typedTimer); fullText = textPages[pageIndex]; $('dialogueText').textContent = ''; $('dialogueText').scrollTop=0;
    $('readHint').textContent=textPages.length>1 ? `Страница ${pageIndex+1} из ${textPages.length}` : (node.retry?'Выбери другой ответ':'Нажми, чтобы читать дальше');
    $('nextBtn').hidden=node.type==='choice'&&pageIndex===textPages.length-1;
    $('choices').hidden=true;
    const chars = Array.from(fullText);
    if (!settings.typing || state.read.includes(node.id) || node.type === 'title' || chars.length === 0) { finishTyping(); return; }
    let i = 0; typing = true;
    typedTimer = setInterval(() => {
      i += 2; $('dialogueText').textContent = chars.slice(0, i).join('');
      if (i >= chars.length) finishTyping();
    }, 19);
  }
  function visit(id) {
    const node = story.nodes[id];
    if (!node) { console.error('Unknown node', id); return; }
    if (node.route !== 'prologue' && node.route !== 'finale' && node.route !== state.route) { console.error('Route boundary', id); return; }
    if(state.current!==id)state.textOffset=0;
    state.current = id;
    if (!state.visited.includes(id)) state.visited.push(id);
    state.complete = node.type === 'end';
    save(); render();
  }
  function render() {
    const node = story.nodes[state.current];
    generation++; selected = null; locked = false; clearInterval(typedTimer); typing = false;
    $('itemFx').replaceChildren();
    setArt(node.art);
    audio()?.setMood(({ prologue:'prologue', forest:'forest', wonderland:'wonderland', versailles:'palace', finale:'finale' })[node.route]);
    effectMode = node.route === 'wonderland' ? 'bubbles' : node.route === 'forest' ? 'leaves' : 'gold';
    if (node.type === 'outfits') { renderOutfits(node); progress(); return; }
    if (node.type === 'end') { renderEnd(node); progress(); return; }
    setScreen('game');
    resize();
    const propText=node.inscription || (node.art==='tower' ? 'Кощей Бессмертный. Приём по записи' : '');
    $('sceneProp').textContent=propText;$('sceneProp').hidden=!propText;
    const wrap = $('dialogueWrap');
    wrap.className = 'dialogue-wrap';
    for (const name of ['system','choice','visual','wrong','success','chapter-card']) $('gameScreen').classList.remove(name);
    $('gameScreen').classList.add(node.type === 'title' ? 'chapter-card' : node.type);
    if (node.result === 'incorrect' || node.retry) $('gameScreen').classList.add('wrong');
    if (node.result === 'correct') $('gameScreen').classList.add('success');
    $('speaker').textContent = node.speaker || (node.type === 'system' && node.text ? 'Системное сообщение' : '');
    $('sceneCaption').textContent = node.type==='title' ? node.text : sceneTitle(node);
    $('choices').replaceChildren(); $('choices').hidden = true;
    $('nextBtn').hidden = node.type === 'choice';
    $('nextBtn').firstChild.textContent = node.retry ? node.retryLabel + ' ' : node.type === 'visual' ? 'Продолжить ' : 'Далее ';
    $('artContinue').hidden = node.type !== 'visual';
    $('readHint').textContent = node.retry ? 'Выбери другой ответ' : node.type === 'choice' ? 'Твой выбор' : 'Нажми, чтобы читать дальше';
    $('dialogueText').scrollTop = 0;
    if (node.type === 'choice') renderChoices(node);
    showText(node); progress();
    if (node.effect) triggerEffect(node.effect);
    requestAnimationFrame(() => { wrap.style.animation = 'none'; void wrap.offsetWidth; wrap.style.animation = ''; });
  }
  function renderChoices(node) {
    node.choices.forEach((choice, index) => {
      const button = document.createElement('button'); button.className = 'choice-button'; button.dataset.choice = index;
      const title = document.createElement('strong'); title.textContent = choice.text; button.append(title);
      if(choice.art){const thumb=document.createElement('div');thumb.className='choice-art';thumb.dataset.artKey=choice.art;button.classList.add('choice-with-art');button.prepend(thumb);}
      if (choice.detail) { const detail = document.createElement('small'); detail.textContent = choice.detail; button.append(detail); }
      button.addEventListener('click', () => {
        if (locked) return;
        if (node.confirmLabel) {
          selected = index;
          for (const b of $('choices').children) b.classList.toggle('selected', Number(b.dataset.choice) === index);
          $('nextBtn').hidden = false; $('nextBtn').firstChild.textContent = node.confirmLabel + ' ';
          return;
        }
        choose(index);
      });
      $('choices').append(button);
    });
  }
  function choose(index) {
    const node = story.nodes[state.current];
    if (locked || node.type !== 'choice' || !node.choices[index]) return;
    locked = true; finishTyping(); const choice = node.choices[index];
    const gen = generation; const button = $('choices').children[index];
    button.classList.add(choice.correct === false ? 'incorrect' : 'selected');
    [...$('choices').children].forEach(b => b.disabled = true);
    state.choices[node.id] = index;
    state.history.push({ node: node.id + '-choice-' + state.history.length, speaker:'Твой выбор', text: choice.text, choice:true });
    audio()?.playEffect(choice.correct === false ? 'wrong' : 'correct');
    save();
    setTimeout(() => { if (generation === gen) visit(choice.next); }, settings.motion ? 420 : 0);
  }
  function renderOutfits(node) {
    setScreen('outfits'); $('sceneProp').hidden=true; $('outfitPrompt').textContent = story.nodes.p012.text;
    $('outfitCards').replaceChildren(); $('outfitScreen').scrollTop = 0;
    node.choices.forEach((choice, i) => {
      const card = document.createElement('button'); card.className = 'outfit-card'; card.dataset.route = choice.route;
      const art = document.createElement('div'); art.className = 'outfit-art';
      const number = document.createElement('span'); number.className = 'outfit-index'; number.textContent = ['I','II','III'][i]; art.append(number);
      const copy = document.createElement('div'); copy.className = 'outfit-copy';
      const title = document.createElement('h3'); title.textContent = choice.title || choice.text;
      const quote = document.createElement('p'); quote.className = 'outfit-quote'; quote.textContent = choice.quote;
      const detail = document.createElement('p'); detail.className = 'outfit-detail'; detail.textContent = choice.detail;
      const unlock = document.createElement('div'); unlock.className = 'outfit-unlock'; unlock.textContent = choice.unlock;
      const select = document.createElement('div'); select.className = 'outfit-select'; select.textContent = 'Выбрать образ'; select.append(Object.assign(document.createElement('span'), {textContent:'→'}));
      copy.append(title,quote,detail,unlock,select); card.append(art,copy); $('outfitCards').append(card); placeArt(art, choice.art);
      card.addEventListener('click', () => { if (locked) return; locked = true; startAudio(); state.route = choice.route; state.choices.outfits = i; audio()?.playEffect('magic'); visit(choice.next); });
    });
    markRead(node);
  }
  function renderEnd(node) {
    setScreen('end'); $('sceneProp').hidden=true; $('endScreen').scrollTop = 0;
    const paragraphs = node.text.split(/\n\n|\n/).filter(Boolean);
    $('endHeading').textContent = paragraphs.shift(); $('endText').replaceChildren();
    for (const text of paragraphs) { const p = document.createElement('p'); p.textContent = text; $('endText').append(p); }
    $('endFootnote').textContent = node.footnote; $('restartBtn').firstChild.textContent = node.restartLabel + ' ';
    markRead(node); triggerEffect('confetti');
  }
  function advance() {
    if (screen !== 'game' || locked) return;
    if (typing) { finishTyping(); return; }
    const n = story.nodes[state.current];
    if(pageIndex<textPages.length-1){pageIndex++;state.textOffset=textPages.slice(0,pageIndex).join('').length;save();showPage(n);return;}
    if (n.type === 'choice') { if (n.confirmLabel && selected !== null) choose(selected); return; }
    if (n.next) visit(n.next);
  }
  function restart() {
    generation++; clearInterval(typedTimer); state = freshState();
    try { localStorage.removeItem(SAVE_KEY); } catch (_) {}
    closeDialogs(); $('sceneCaption').textContent = ''; $('progressFill').style.width = '0%';
    startAudio(); setScreen('title'); setArt('title'); $('sceneProp').hidden=true; audio()?.setMood('prologue'); effectMode = 'gold';
  }
  function resume() {
    const saved = safeParse(SAVE_KEY);
    if (validSave(saved)) { state = { ...freshState(), ...saved }; startAudio(); visit(state.current); }
  }
  function closeDialogs() { for (const d of document.querySelectorAll('dialog[open]')) d.close(); }
  function showDialog(id) { finishTypingIfNeeded(); closeDialogs(); $(id).showModal(); }
  function finishTypingIfNeeded() { if (typing) finishTyping(); }
  function showHistory() {
    finishTypingIfNeeded(); $('historyContent').replaceChildren();
    for (const entry of state.history) {
      const article = document.createElement('article'); if (entry.choice) article.className = 'history-choice';
      const name = document.createElement('b'); name.textContent = entry.speaker || 'История';
      const p = document.createElement('p'); p.textContent = entry.text; article.append(name,p); $('historyContent').append(article);
    }
    showDialog('historyDialog'); $('historyContent').scrollTop = $('historyContent').scrollHeight;
  }
  function skipRead() {
    closeDialogs(); if (screen !== 'game') return;
    let n = story.nodes[state.current], count = 0;
    while (state.read.includes(n.id) && n.next && !['choice','outfits','end'].includes(n.type) && !n.retry && count++ < 200) {
      n = story.nodes[n.next]; state.current = n.id; state.textOffset=0; if (!state.visited.includes(n.id)) state.visited.push(n.id);
    }
    save(); render(); if (count === 0) notify('Дальше — новая страница истории');
  }
  function triggerEffect(name) {
    if(name==='candles'){
      const gen=generation;
      setTimeout(()=>{if(generation===gen&&story.nodes[state.current].art==='candles'&&artConfig('candles-out')){setArt('candles-out');if(settings.motion)for(let i=0;i<55;i++)particles.push(makeParticle(true));}},settings.motion?1800:0);
    }
    if (!settings.motion) return;
    effectUntil = performance.now() + (name === 'confetti' ? 6500 : 2700);
    effectMode = name === 'bubbles' ? 'bubbles' : name === 'confetti' ? 'confetti' : 'gold';
    if (['transform','white-flash','white','gold-flash','magic','vortex','portal'].includes(name)) {
      $('flash').classList.remove('magic'); void $('flash').offsetWidth; $('flash').classList.add('magic'); audio()?.playEffect('magic');
    }
    if (name === 'bubbles') audio()?.playEffect('bubbles');
    if (name === 'confetti') audio()?.playEffect('celebrate');
    if (name === 'portal') {
      const layer=activeLayer?$('artB'):$('artA');
      layer.animate([{transform:'scale(1.3) rotate(-8deg)',filter:'saturate(1.7)'},{transform:'scale(1) rotate(0)',filter:'saturate(1)'}],{duration:1500,easing:'ease-out'});
    }
    if(name==='apple'||name==='key'||name==='seal'){
      const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 120 140');svg.classList.add('magic-item',name);
      const shapes={apple:'<path d="M60 39C36 16 10 40 13 73c3 36 29 56 47 45 19 11 46-11 48-45 2-31-24-57-48-34Z" fill="url(#itemGold)" stroke="#a36c22" stroke-width="2"/><path d="M61 40c-4-20 0-29 8-35" fill="none" stroke="#7f662e" stroke-width="7"/><path d="M64 22c18-21 34-18 37-14-3 15-20 24-37 14Z" fill="#aac77a"/><path d="M33 46c-10 9-13 22-9 32" stroke="#fff5d0" stroke-width="5" fill="none" opacity=".8"/>',key:'<path d="M57 54 40 112l11 4 5-12 12 3 5-15-12-4 8-26Z" fill="url(#itemGold)" stroke="#a87b2e" stroke-width="3"/><circle cx="67" cy="34" r="25" fill="url(#itemGold)" stroke="#a87b2e" stroke-width="3"/><circle cx="67" cy="34" r="12" fill="#455637"/><path d="M48 24c7-13 22-13 30-8" stroke="#fff1bb" stroke-width="4" fill="none"/>',seal:'<path d="m36 88-7 42 28-15 17 18 9-48" fill="#b65d4e" stroke="#7e4639" stroke-width="2"/><circle cx="60" cy="62" r="39" fill="url(#itemGold)" stroke="#a47b35" stroke-width="4"/><circle cx="60" cy="62" r="29" fill="none" stroke="#fff1c1" stroke-width="1"/><path d="m40 56 10 10 10-23 12 23 9-12-5 25H45Z" fill="#8b6b2b"/>'};
      svg.innerHTML='<defs><radialGradient id="itemGold" cx="30%" cy="20%"><stop stop-color="#fff1ad"/><stop offset=".45" stop-color="#e8c16b"/><stop offset="1" stop-color="#c28c37"/></radialGradient></defs>'+shapes[name];
      $('itemFx').replaceChildren(svg);
    }
    if (name === 'scroll') { $('dialogueWrap').animate([{transform:'perspective(900px) rotateX(-12deg)',opacity:.1},{transform:'perspective(900px) rotateX(0)',opacity:1}],{duration:650,easing:'ease-out'}); }
    for (let i=0;i<(name==='confetti'?85:35);i++) particles.push(makeParticle(true));
  }
  function makeParticle(burst=false) {
    const width=app.clientWidth,height=app.clientHeight;
    return {x:Math.random()*width,y:burst?Math.random()*height:height+20,vx:(Math.random()-.5)*.3,vy:-(.08+Math.random()*.24),size:1+Math.random()*2.5,life:Math.random()*6,kind:effectMode,hue:Math.random()*40+25,rot:Math.random()*6.3};
  }
  function animateParticles(time = performance.now()) {
    if (!settings.motion || !ctx || document.hidden) { frameId = 0; return; }
    const dt=Math.min(40,time-lastTime||16); lastTime=time;
    ctx.clearRect(0,0,app.clientWidth,app.clientHeight);
    const limit=performance.now()<effectUntil?100:32;
    if(particles.length<limit&&Math.random()>.4)particles.push(makeParticle());
    particles=particles.filter(p=>p.y>-30&&p.x>-40&&p.x<app.clientWidth+40&&p.life<24);
    for(const p of particles){p.life+=dt/1000;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=dt*.0005;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.globalAlpha=Math.min(.55,Math.sin(p.life*.8)**2*.55);if(p.kind==='bubbles'){ctx.strokeStyle='#ead3ff';ctx.lineWidth=.8;ctx.beginPath();ctx.arc(0,0,p.size*4,0,Math.PI*2);ctx.stroke();}else if(p.kind==='leaves'){ctx.fillStyle='#c6d48e';ctx.beginPath();ctx.ellipse(0,0,p.size*2,p.size*.6,0,0,Math.PI*2);ctx.fill();}else{ctx.fillStyle=p.kind==='confetti'?`hsl(${p.hue} 68% 74%)`:'#ffe4a4';ctx.fillRect(-p.size/2,-p.size/2,p.size,p.kind==='confetti'?p.size*2.5:p.size);}ctx.restore();}
    frameId=requestAnimationFrame(animateParticles);
  }

  $('startBtn').addEventListener('click',()=>{startAudio();state=freshState();visit(story.start);});
  $('resumeBtn').addEventListener('click',resume);
  $('nextBtn').addEventListener('click',e=>{e.stopPropagation();advance();});
  $('dialogueCard').addEventListener('click',e=>{if(!e.target.closest('button')&&typing)finishTyping();});
  $('artContinue').addEventListener('click',advance);
  $('menuBtn').addEventListener('click',()=>showDialog('menuDialog'));
  $('homeBtn').addEventListener('click',()=>showDialog('menuDialog'));
  $('historyBtn').addEventListener('click',showHistory);
  $('restartBtn').addEventListener('click',restart);
  $('confirmRestartBtn').addEventListener('click',restart);
  $('newGameBtn').addEventListener('click',()=>showDialog('restartDialog'));
  $('returnTitleBtn').addEventListener('click',()=>{generation++;finishTypingIfNeeded();closeDialogs();setScreen('title');setArt('title');audio()?.setMood('prologue');});
  $('skipReadBtn').addEventListener('click',skipRead);
  for(const b of document.querySelectorAll('[data-close]'))b.addEventListener('click',()=>b.closest('dialog').close());
  for(const d of document.querySelectorAll('dialog'))d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});
  $('soundBtn').addEventListener('click',()=>{settings.muted=!settings.muted;startAudio();applySettings();saveSettings();});
  $('volumeInput').addEventListener('input',e=>{settings.volume=Number(e.target.value)/100;startAudio();applySettings();saveSettings();});
  $('typingInput').addEventListener('change',e=>{settings.typing=e.target.checked;if(!settings.typing&&typing)finishTyping();saveSettings();});
  $('motionInput').addEventListener('change',e=>{settings.motion=e.target.checked;applySettings();saveSettings();});
  $('fullBtn').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else notify('Разверни окно браузера для большого экрана');}catch(_){notify('Полноэкранный режим недоступен в этом браузере');}});
  document.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]')||e.target.closest('button,input'))return;if((e.code==='Space'||e.code==='Enter'||e.code==='ArrowRight')&&screen==='game'){e.preventDefault();advance();}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frameId);frameId=0;}else if(settings.motion&&!frameId)animateParticles();});
  let reflowTimer=0;
  window.addEventListener('resize',()=>{resize();clearTimeout(reflowTimer);reflowTimer=setTimeout(()=>{if(screen==='game')render();},150);}); new ResizeObserver(resize).observe(app);
  window.addEventListener('pagehide',()=>{if(state.visited.length)save();saveSettings();});
  const savedSettings=safeParse(SETTINGS_KEY);
  if(savedSettings){settings={...defaultSettings,...savedSettings};settings.volume=Math.max(0,Math.min(1,Number(settings.volume)||0));}
  setScreen('title');setArt('title');resize();applySettings();
  window.NovelGame={getState:()=>JSON.parse(JSON.stringify(state)),getScreen:()=>screen,advance,choose,restart,resume};
})();
