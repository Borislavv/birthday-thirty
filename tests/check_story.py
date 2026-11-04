"""Graph and source-fidelity checks for every route and every allowed decree."""
import hashlib
import itertools
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
S = json.loads((ROOT/'data/story.json').read_text())
N = S['nodes']
SOURCE_PATH=ROOT/'source/revised-document.json'
SOURCE = json.loads(SOURCE_PATH.read_text())
BASE_ROOT=ROOT/'source/revisions/2026-11-04-text-update/before'
BASE=json.loads((BASE_ROOT/'data/story.json').read_text())
ORIGINAL_SOURCE=json.loads((ROOT/'source/document.json').read_text())

assert S['sourceAudit']['paragraphs'] == [dict(p, uses=S['sourceAudit']['paragraphs'][p['id']]['uses']) for p in SOURCE]
assert len(SOURCE) == 354
assert all(p['id']==i for i,p in enumerate(SOURCE))
assert all(p['uses'] for p in S['sourceAudit']['paragraphs'])
assert S['revision']=='2026-11-04-wording-v2'
assert S['systemLabel']=='Сообщение'
assert S['sourceAudit']['file']=='Вставленный текст.txt'
assert S['sourceAudit']['normalizedFile']=='source/revised-document.json'
raw=(ROOT/S['sourceAudit']['rawFile']).read_bytes()
assert hashlib.sha256(raw).hexdigest()==S['sourceAudit']['rawSHA256']
assert S['sourceAudit']['rawText']==raw.decode('utf-8')
order=list(range(98))+[350,351,352,353]+[i for i in range(98,350) if i!=233]
assert S['sourceAudit']['readingOrder']==order
def nonblank_lines(text):
    return [line for line in text.replace('\u2028','\n').split('\n') if line.strip()]
assert nonblank_lines('\n'.join(SOURCE[i]['text'] for i in order))==nonblank_lines(raw.decode('utf-8'))
assert SOURCE[233]['text']=='' and SOURCE[233]['runs']==[]
for name in ['document.json','scenario.txt']:
    assert (ROOT/'source'/name).read_bytes()==(BASE_ROOT/'source'/name).read_bytes(), 'Historical source changed: '+name

# A wording revision must preserve the exact interaction graph and all visual
# assignments, including the original presentation node retained as a skip.
assert set(N)==set(BASE['nodes']) and len(N)==158
critical=['id','type','art','route','next','effect','retry','result','freeChoice','confirmLabel']
choice_critical=['next','correct','route','art']
for ident,n in N.items():
    old=BASE['nodes'][ident]
    assert {k:n.get(k) for k in critical}=={k:old.get(k) for k in critical}, ('Mechanics or art changed',ident)
    assert len(n.get('choices',[]))==len(old.get('choices',[])),ident
    for c,b in zip(n.get('choices',[]),old.get('choices',[])):
        assert {k:c.get(k) for k in choice_critical}=={k:b.get(k) for k in choice_critical},('Choice transition changed',ident)
for key in ['version','start','outfitNode']:
    assert S[key]==BASE[key]
assert all(S['routes'][key]['entry']==value['entry'] for key,value in BASE['routes'].items())
assert N['p233']['skip'] and N['p233']['text']=='' and N['p233']['direction']=='' and N['p233']['next']=='p234'
assert 'p233' in S['changedTextNodes']
assert 'inscription' not in N['p201'] and 'inscription' not in N['p315']
assert 'Кощей Бессмертный' not in N['p084']['direction']
assert N['hat-choice']['choices'][2]['detail']=='Очень мило. Но понравится ли королеве? .'
assert N['p127']['text']=='— Так. У меня сегодня день рождения, я жду ребенка, и теперь мне нужно спасать дочку в другом измерении?!'

for ident,n in N.items():
    assert n['id'] == ident
    assert n['type'] in {'title','dialogue','system','choice','visual','outfits','end'}
    if n['type'] != 'end':
        assert n.get('next') in N or n.get('choices'), ident
    for c in n.get('choices',[]):
        assert c['next'] in N, (ident,c)
        for i in c['source']:
            assert 0 <= i < len(SOURCE)
    if n.get('retry'):
        assert N[n['next']]['type'] == 'choice'
        assert n['result'] == 'incorrect'

# No narrative line can have been rewritten or invented. A node can concatenate
# whole source paragraphs, or split authored run/paragraph text into UI fields.
source_join = '\n\n'.join(p['text'] for p in SOURCE)
for ident,n in N.items():
    text=n['text']
    if not text:
        continue
    if text in source_join:
        continue
    pieces=text.split('\n')
    assert all(not piece or piece in source_join for piece in pieces), (ident,repr(text))

assert [c['correct'] for c in N['p049']['choices']] == [False,True,False]
assert [c['correct'] for c in N['p069']['choices']] == [False,True,False]
assert [c['correct'] for c in N['p088']['choices']] == [True,False,False]
assert [c['correct'] for c in N['hat-choice']['choices']] == [False,True,False]
assert [c['correct'] for c in N['bubble-choice']['choices']] == [True,False,False]
assert N['forest-wrong-3']['text'] == SOURCE[351]['text']+'\n\n'+SOURCE[352]['text']
assert N['forest-wrong-3']['retryLabel']=='Пересмотреть ответ'

def walk(entry, selections=None):
    current=entry
    seen=[]
    selections=selections or {}
    while True:
        assert current not in seen, ('unexpected cycle',current,seen)
        seen.append(current)
        n=N[current]
        if n['type']=='end':
            return seen
        if n['type'] in {'choice','outfits'}:
            chosen=selections.get(current)
            if chosen is None:
                chosen=next(i for i,c in enumerate(n['choices']) if c.get('correct'))
            c=n['choices'][chosen]
            assert c.get('correct',True), (current,c)
            current=c['next']
        else:
            current=n['next']

paths=[]
for route in ['forest','wonderland']:
    seq=walk(S['routes'][route]['entry'])
    assert seq[-1]=='p341'
    assert set(N[k]['route'] for k in seq) <= {route,'finale'}
    paths.append((route,seq))

for picks in itertools.product(range(2),range(3),range(2)):
    selections=dict(zip(['decree-1','decree-2','decree-3'],picks))
    seq=walk('p222',selections)
    assert seq[-1]=='p341'
    assert all(not N[k].get('retry') for k in seq)
    assert all(c['correct'] for key in selections for c in N[key]['choices'])
    paths.append(('versailles '+str(picks),seq))

# Every invalid option must return to the same question before any route event.
wrong_options=0
for ident,n in N.items():
    for c in n.get('choices',[]):
        if c.get('correct') is False:
            response=N[c['next']]
            assert response.get('retry') and response['next']==ident
            wrong_options+=1
assert wrong_options==10

# Every authored graph node is reachable by valid routes plus authored retries.
reachable=set()
stack=[S['start']]
while stack:
    ident=stack.pop()
    if ident in reachable:
        continue
    reachable.add(ident)
    n=N[ident]
    if n.get('next'):stack.append(n['next'])
    stack.extend(c['next'] for c in n.get('choices',[]))
assert reachable==set(N), set(N)-reachable
finale=[k for k in paths[0][1] if N[k]['route']=='finale']
assert all([k for k in seq if N[k]['route']=='finale']==finale for _,seq in paths)
assert N['p341']['text']=='\n\n'.join(SOURCE[i]['text'] for i in range(341,345))
assert N['p341']['text']==BASE['nodes']['p341']['text']
assert N['p341']['footnote']==BASE['nodes']['p341']['footnote']
assert all(N['decree-2']['choices'][i]['text']==BASE['nodes']['decree-2']['choices'][i]['text'] for i in range(3))

report={
    'nodes':len(N),'sourceParagraphs':len(SOURCE),'reachableNodes':len(reachable),
    'fullRoutePaths':len(paths),'versaillesCombinations':12,'wrongAnswerReturnPaths':wrong_options,
    'sharedFinaleNodes':len(finale),'finalGreetingExact':True,
    'revision':S['revision'],'rawSourceSHA256':S['sourceAudit']['rawSHA256'],
    'normalizedNonblankLines':len(nonblank_lines(raw.decode('utf-8'))),
    'mechanicsAndArtUnchanged':True,'historicalSourceUnchanged':True,
    'changedTextNodes':S['changedTextNodes'],
    'storySHA256':hashlib.sha256((ROOT/'data/story.js').read_bytes()).hexdigest(),
    'result':'PASS',
}
(ROOT/'tests/story-check-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps(report,ensure_ascii=False,indent=2))
