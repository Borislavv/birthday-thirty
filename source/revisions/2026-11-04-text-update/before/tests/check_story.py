"""Graph and source-fidelity checks for every route and every allowed decree."""
import hashlib
import itertools
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
S = json.loads((ROOT/'data/story.json').read_text())
N = S['nodes']
SOURCE = json.loads((ROOT/'source/document.json').read_text())

assert S['sourceAudit']['paragraphs'] == [dict(p, uses=S['sourceAudit']['paragraphs'][p['id']]['uses']) for p in SOURCE]
assert len(SOURCE) == 350
assert all(p['uses'] for p in S['sourceAudit']['paragraphs'])

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
assert N['forest-wrong-3']['text'] == ''  # The document has no reaction here.

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

report={
    'nodes':len(N),'sourceParagraphs':len(SOURCE),'reachableNodes':len(reachable),
    'fullRoutePaths':len(paths),'versaillesCombinations':12,'wrongAnswerReturnPaths':wrong_options,
    'sharedFinaleNodes':len(finale),'finalGreetingExact':True,
    'storySHA256':hashlib.sha256((ROOT/'data/story.js').read_bytes()).hexdigest(),
    'result':'PASS',
}
(ROOT/'tests/story-check-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps(report,ensure_ascii=False,indent=2))
