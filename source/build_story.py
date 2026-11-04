"""Build the story graph from the current stable-slot source extraction.

No story prose is generated here: every displayed narrative string is sliced
from the supplied scenario. Only navigation labels without authored counterparts
may be technical UI strings.
"""
import json
import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE_PATH = ROOT / 'source/revised-document.json'
REVISED = SOURCE_PATH.exists()
if not REVISED:
    SOURCE_PATH = ROOT / 'source/document.json'
PARAS = json.loads(SOURCE_PATH.read_text())
NODES = {}
LANES = []
USED = {}
CURRENT = None
ROUTE = None
ART = None


def t(i):
    return PARAS[i]['text']


def use(ids, role, node=None):
    for i in ids:
        USED.setdefault(i, []).append({'role': role, 'node': node})


def lane(route, art):
    global CURRENT, ROUTE, ART
    CURRENT = []
    LANES.append(CURRENT)
    ROUTE, ART = route, art


def add(i, typ='dialogue', speaker=None, text=None, art=None, refs=(), direction=(), **extra):
    global ART
    ident = f'p{i:03}' if isinstance(i, int) else i
    if art:
        ART = art
    ids = ([i] if isinstance(i, int) else []) + list(refs)
    node = {'id': ident, 'type': typ, 'text': t(i) if text is None and isinstance(i, int) else (text or ''),
            'art': ART, 'route': ROUTE, 'source': sorted(set(ids + list(direction)))}
    if speaker:
        node['speaker'] = speaker
    if direction:
        node['direction'] = '\n'.join(t(x) for x in direction)
        use(direction, 'visual-direction', ident)
    node.update(extra)
    NODES[ident] = node
    CURRENT.append(ident)
    use(ids, 'display-or-functional-label', ident)
    return node


def vis(i, art, **extra):
    return add(i, 'visual', text='', art=art, direction=[i], **extra)


def opt(i, nxt, correct=True, detail=None, refs=(), **extra):
    use([i] + ([detail] if detail else []) + list(refs), 'choice-option', nxt)
    result = {'text': t(i), 'next': nxt, 'correct': correct, 'source': [i] + ([detail] if detail else []) + list(refs)}
    if detail:
        result['detail'] = t(detail)
    result.update(extra)
    return result


def wrong(ident, indices, question, label, art, refs=()):
    route = NODES[question]['route']
    NODES[ident] = {'id': ident, 'type': 'system', 'text': '\n\n'.join(t(i) for i in indices),
                    'art': art, 'route': route, 'source': list(indices) + list(refs), 'next': question,
                    'retry': True, 'retryLabel': label, 'result': 'incorrect'}
    use(list(indices) + list(refs), 'incorrect-response-or-retry-label', ident)


use([0, 1], 'title-screen')
lane('prologue', 'bedroom')
add(2, 'title', direction=[3, 4])
add(6, 'dialogue', text=t(6) + '\n' + t(7), refs=[5, 7])
add(9, speaker='Таня', refs=[8])
add(10, speaker='Таня')
add(12, 'system', refs=[11])
outfits = add('outfits', 'outfits', text=t(13), art='outfits', refs=list(range(13, 27)))
outfits['choices'] = []
for a, q, d, u, key, entry, route in [
    (14, 15, 16, 17, 'outfit-russian', 'p027', 'forest'),
    (19, 20, 21, 22, 'outfit-white', 'p116', 'wonderland'),
    (23, 24, 25, 26, 'outfit-queen', 'p222', 'versailles'),
]:
    outfits['choices'].append({'text': t(a), 'title': t(a), 'quote': t(q), 'detail': t(d),
                                'unlock': t(u), 'art': key, 'next': entry, 'route': route,
                                'source': [a, q, d, u]})

lane('forest', 'forest')
add(27, 'title', direction=[28])
add(29, 'title', art='frog', direction=[30], effect='gold')
add(32, speaker='Таня', refs=[31])
add(34, speaker='Лягушка', refs=[33])
add(36, speaker='Таня', refs=[35])
add(38, speaker='Лягушка', refs=[37])
add(40, 'system', text='\n\n'.join(t(i) for i in [40,41,42]), refs=[39,41,42])
add(44, speaker='Таня', refs=[43])
add(45, 'title', art='oak', direction=[46], effect='scroll')
add(48, speaker='Дуб', refs=[47])
add(49, 'choice', choices=[opt(50,'p054',False),opt(51,'p054'),opt(52,'p054',False)])
NODES['p049']['choices'][0]['next']='forest-wrong-1'
NODES['p049']['choices'][2]['next']='forest-wrong-1'
add(54, 'system', result='correct', direction=[55], effect='apple')
add(57, speaker='Дуб', refs=[56])
add(59, speaker='Таня', refs=[58])
add(65, 'title', art='yaga', direction=[66])
add(68, speaker='Баба-яга', refs=[67])
add(69, 'choice', choices=[opt(70,'forest-wrong-2',False),opt(71,'p074'),opt(72,'forest-wrong-2',False)])
add(74, 'system', result='correct')
add(76, speaker='Баба-яга', refs=[75])
add(78, speaker='Таня', refs=[77], direction=[79], effect='key')
add(84, 'title', art='tower', direction=[85])
add(87, speaker='Кощей', refs=[86])
add(88, 'choice', choices=[opt(89,'p092'),opt(90,'forest-wrong-3',False),opt(91,'forest-wrong-3',False)])
add(92, 'system', result='correct')
add(94, speaker='Кощей', refs=[93])
add(96, speaker='Таня', refs=[95], direction=[97], effect='scroll')
add(98, 'title', art='frog-pillow', direction=[99])
add(101, speaker='Таня', refs=[100])
add(103, speaker='Лягушка', refs=[102])
vis(104,'transform',effect='transform')
add(106, speaker='Меди', art='medi', refs=[105])
add(108, speaker='Таня', refs=[107])
add(110, speaker='Меди', refs=[109])
add(112, 'system', text=t(112)+'\n\n'+t(113), refs=[111,113], effect='gold')
vis(114,'forest-party',effect='confetti')
add(115, 'title', text='«Ну наконец-то праздник!»', next='p311')
wrong('forest-wrong-1',[62,63],'p049','Попробовать снова','oak',refs=[60,61,64])
wrong('forest-wrong-2',[81,82],'p069','Пересмотреть ответ','yaga',refs=[80,83])
if REVISED:
    wrong('forest-wrong-3',[351,352],'p088',re.search('«([^»]+)»',t(353)).group(1),'tower',refs=[350,353])
else:
    # The historical DOCX had no bespoke reaction for this question.
    wrong('forest-wrong-3',[],'p088','Попробовать снова','tower')

lane('wonderland','rabbit')
add(116,'title',direction=[117])
add(118,'title',direction=[119])
add(121,speaker='Белый кролик',refs=[120])
add(123,speaker='Таня',refs=[122])
add(125,speaker='Белый кролик',refs=[124])
add(127,speaker='Таня',refs=[126])
add(129,speaker='Белый кролик',refs=[128])
add(131,speaker='Таня',refs=[130])
vis(132,'rabbit-hole',effect='portal')
add('wonderland-reveal','visual',text='',art='wonderland',refs=[132],direction=[132],effect='leaves')
add(133,'title',art='hatter',direction=[134])
add(136,speaker='Шляпник',refs=[135])
add(138,speaker='Таня',refs=[137])
add('hat-choice','choice',text='',art='hats',refs=[139,140,141,142,143,144,145,146,147],
    choices=[opt(139,'wonderland-wrong-1',False,140,refs=[141],art='hat-cards'),
             opt(142,'p144',True,143,refs=[144],art='hat-veil'),
             opt(145,'wonderland-wrong-1',False,146,refs=[147],art='hat-rabbit')])
add(144,'system',art='hatter',result='correct',refs=[148])
add(150,speaker='Шляпник',refs=[149])
add(155,'title',art='absolem',direction=[156],effect='bubbles')
add(158,speaker='Абсолем',refs=[157])
add(160,speaker='Таня',refs=[159])
add(162,speaker='Абсолем',refs=[161])
add(164,speaker='Таня',refs=[163])
add(166,speaker='Абсолем',refs=[165])
add(167,'system',text=''.join(r['text'] for r in PARAS[167]['runs'] if not r['italic']),direction=[167])
add('bubble-choice','choice',text='',refs=[168,169,170,171,172,173,174,175,176],
    choices=[opt(168,'p170',True,169,refs=[170]),opt(171,'wonderland-wrong-2',False,172,refs=[173]),
             opt(174,'wonderland-wrong-2',False,175,refs=[176])])
add(170,'system',art='bubbles',result='correct',refs=[177],effect='bubbles')
add(179,speaker='Абсолем',refs=[178])
add(181,speaker='Таня',refs=[180])
add(183,speaker='Абсолем',refs=[182])
add(187,'title',art='rose-garden',direction=[188])
add(190,speaker='Красная королева',art='red-queen',refs=[189])
add(192,speaker='Таня',refs=[191])
add(194,speaker='Красная королева',refs=[193])
add(196,speaker='Таня',refs=[195])
add(198,speaker='Красная королева',refs=[197])
add(200,speaker='Таня',refs=[199])
add(201,'visual',text='',art='mug',direction=[201])
if not REVISED:
    NODES['p201']['inscription']='твой единственный шанс на беременность'
add(203,speaker='Красная королева',refs=[202])
add(205,'system',text=t(205)+'\n\n'+t(206),refs=[204,206],effect='gold')
add(207,'title',art='white-crown',direction=[208])
add(210,speaker='Белый кролик',refs=[209])
add(212,speaker='Таня',refs=[211])
add(214,speaker='Белый кролик',refs=[213])
vis(215,'white-queen',effect='white-flash')
add(217,speaker='Алиса',art='alice-home',refs=[216])
add(219,speaker='Таня',refs=[218])
vis(220,'alice-home')
add(221,'title',text='«Ну наконец-то праздник!»',next='p311')
wrong('wonderland-wrong-1',[152,153],'hat-choice','Выбрать другую шляпу','hats',refs=[151,154])
wrong('wonderland-wrong-2',[185],'bubble-choice','Попробовать снова','absolem',refs=[184,186])
NODES['wonderland-wrong-2']['text']=t(185)+'\n\n'+t(186).split('\n\nКнопка:')[0]

lane('versailles','palace')
add(222,'title',direction=[223])
add(224,'title',art='herald',direction=[225])
add(227,speaker='Дворецкий',refs=[226])
add(229,speaker='Таня',art='throne',text=t(229).split('\n\nКоролевский советник:')[0],refs=[228])
add(230,speaker='Королевский советник',art='advisor',refs=[229])
add(232,speaker='Таня',refs=[231])
add(233,'system',text='' if REVISED else '«Королевские дела»',direction=[233])
if REVISED:
    NODES['p233']['skip']=True
add(234,'title',art='breakfast')
add(236,speaker='Советник',refs=[235])
add('decree-1','choice',text='',refs=list(range(237,243)),freeChoice=True,
    choices=[opt(237,'p239',detail=238),opt(240,'p242',detail=241)])
# The two authored confirmations are distinct source paragraphs; both rejoin.
add(239,'system',result='accepted',next='p244')
add(244,speaker='Таня',refs=[243])
add(246,speaker='Советник',refs=[245])
add(248,speaker='Таня',refs=[247])
add(250,'system',text=t(250)+'\n\n'+t(251),refs=[249,251],effect='seal')
add(252,'title',art='dossier')
add(253,'system',text='«Секретное досье. Вопрос, который обсуждают слишком много».',direction=[253],effect='scroll')
add(255,speaker='Советник',art='council',refs=[254])
add(257,speaker='Таня',refs=[256])
add(259,speaker='Советник',refs=[258])
add('decree-2','choice',text='',refs=[260,261,262,263],freeChoice=True,confirmLabel=t(263),
    choices=[opt(260,'p265'),opt(261,'p265'),opt(262,'p265')])
add(265,speaker='Советник',refs=[264])
add(267,'system',text=t(267)+'\n\n'+t(268),refs=[266,268],effect='seal')
add(269,'system',text='«Королева дипломатии»',direction=[269],effect='gold')
add(270,'title',art='minister',direction=[271])
add(273,speaker='Военный министр',refs=[272])
add(275,speaker='Таня',refs=[274])
add(277,speaker='Министр',refs=[276])
add(279,speaker='Таня',refs=[278])
add('decree-3','choice',text='',refs=list(range(280,286)),freeChoice=True,
    choices=[opt(280,'p282',detail=281),opt(283,'p285',detail=284)])
add(282,'system',art='rainbow-knights',result='accepted',next='p287')
add(287,speaker='Таня',art='minister',refs=[286])
add(289,speaker='Военный министр',refs=[288])
add(291,speaker='Таня',refs=[290],direction=[292])
add(294,'system',text=t(294)+'\n\n'+t(295),refs=[293,295],effect='seal')
add(296,'title',art='throne-shoes',direction=[297])
add(299,speaker='Советник',refs=[298])
add(301,speaker='Таня',art='last-decree',refs=[300])
add(303,speaker='Советник',refs=[302])
add(305,speaker='Таня',refs=[304])
add(307,'system',text=t(307)+'\n\n'+t(308),refs=[306,308],effect='gold')
vis(309,'palace-party',effect='confetti')
add(310,'title',text='«Ну наконец-то праздник!»',next='p311')
NODES['p242']={'id':'p242','type':'system','text':t(242),'art':'breakfast','route':'versailles','source':[242], 'result':'accepted','next':'p244'}
NODES['p285']={'id':'p285','type':'system','text':t(285),'art':'peace-delegation','route':'versailles','source':[285], 'result':'accepted','next':'p287'}
use([242,285],'accepted-choice-response')

lane('finale','home')
add(311,'title',refs=[312])
add(313,'title')
add(314,'system',text='«Спустя некоторое время…»',direction=[314],effect='fade')
add(315,'visual',text='',art='party',direction=[315,316],effect='confetti')
if not REVISED:
    NODES['p315']['inscription']='ТАНЕ 30!'
add(318,speaker='Все гости',refs=[317])
add(320,speaker='Таня',refs=[319])
add(322,speaker='Меди',refs=[321])
add(324,speaker='Таня',refs=[323])
vis(325,'drawing')
add(327,speaker='Таня',refs=[326])
add(329,speaker='Меди',refs=[328])
add(331,speaker='Таня',refs=[330])
add(333,speaker='Меди',refs=[332])
add(335,speaker='Красная королева',art='party',refs=[334])
add(337,speaker='Таня',refs=[336])
vis(338,'hug')
add(340,speaker='Таня',text=t(340).split(' Таня задувает свечи.')[0],refs=[339])
add('candles','visual',text='',art='candles',refs=[340],direction=[340],effect='candles')
add(341,'end',text='\n\n'.join(t(i) for i in range(341,345)),art='congratulations',refs=list(range(342,349)),
    footnote=t(348),restartLabel='Пройти историю заново',effect='gold')

for ids in LANES:
    for a,b in zip(ids,ids[1:]):
        NODES[a].setdefault('next',b)

# Functional/directorial source markers are retained rather than treated as
# additional lines of fictional dialogue.
for p in PARAS:
    if p['id'] not in USED:
        use([p['id']], 'blank' if not p['text'].strip() else 'authoring-marker')

story = {
    'version': 1,
    'title': t(0), 'subtitle': t(1), 'start':'p002','outfitNode':'outfits',
    'routes': {
        'forest': {'title':t(27),'entry':'p027'},
        'wonderland': {'title':t(116),'entry':'p116'},
        'versailles': {'title':t(222),'entry':'p222'},
    },
    'nodes':NODES,
    'sourceAudit': {'file':'Вставленный текст.txt' if REVISED else 'Итоговый сценарий.docx','paragraphs':[
        {'id':p['id'],'text':p['text'],'runs':p['runs'],'uses':USED[p['id']]} for p in PARAS
    ]},
}
if REVISED:
    raw_path=ROOT/'source/scenario-revised.txt'
    raw=raw_path.read_bytes()
    reading_order=list(range(98))+[350,351,352,353]+[i for i in range(98,350) if i!=233]
    story['revision']='2026-11-04-wording-v2'
    story['systemLabel']='Сообщение'
    story['sourceAudit'].update({
        'rawFile':'source/scenario-revised.txt',
        'rawSHA256':hashlib.sha256(raw).hexdigest(),
        'rawText':raw.decode('utf-8'),
        'normalizedFile':'source/revised-document.json',
        'readingOrder':reading_order,
        'historicalFile':'source/document.json',
    })
    baseline=json.loads((ROOT/'source/revisions/2026-11-04-text-update/before/data/story.json').read_text())
    def text_fields(node):
        fields={k:node.get(k) for k in ['text','speaker','direction','inscription','retryLabel','footnote','restartLabel']}
        fields['choices']=[{k:c.get(k) for k in ['text','title','quote','detail','unlock']} for c in node.get('choices',[])]
        return fields
    story['changedTextNodes']=[ident for ident,node in NODES.items() if text_fields(node)!=text_fields(baseline['nodes'][ident])]
(ROOT/'data/story.json').write_text(json.dumps(story,ensure_ascii=False,indent=2))
(ROOT/'data/story.js').write_text('window.STORY = '+json.dumps(story,ensure_ascii=False,separators=(',',':'))+';\n')
print(f'{len(NODES)} story nodes; {len(PARAS)} source paragraphs retained.')
