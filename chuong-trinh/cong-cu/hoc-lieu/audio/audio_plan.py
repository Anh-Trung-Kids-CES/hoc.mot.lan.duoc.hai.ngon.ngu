"""Lập kịch bản nghe cho từng trang sách bài tập: tracks.json (trình tự clip + khoảng lặng) và clips.json (các câu cần đọc, đã loại trùng).
python3 audio_plan.py <sessions.json> <LS|SD> <out_dir>"""
import json, sys, re, hashlib, os
src, L, out = sys.argv[1], sys.argv[2], sys.argv[3]
D = json.load(open(src)); os.makedirs(out, exist_ok=True)
VOICE = {'SD': {'en': ('gemini-3.8-flash-tts', 'Despina'), 'zh': ('gemini-3.1-flash-tts-preview', 'Leda')},
         'LS': {'en': ('gemini-3.8-flash-tts', 'Sulafat'), 'zh': ('gemini-3.1-flash-tts-preview', 'Sulafat')}}[L]
ZSP = {'Lan老师': '兰老师', 'Lan': '兰', 'Xiaomei': '小美', 'Puppy': '小狗'}
CARRY = {'于': '关于', '识': '认识', '们': '我们', '个': '一个', '板': '黑板', '标': '目标', '叉': '叉子', '条': '一条', '乓': '乒乓球', '眼': '眼睛', '笔': '铅笔'}  # chữ không đứng một mình: đọc kèm từ chứa nó
def clean(l, t):
    if l == 'zh' and t in CARRY: t = t + '，' + CARRY[t]
    t = re.sub(r'\s+', ' ', t).strip()
    if l == 'en':
        t = t.replace('___', 'blank').replace('·', ',')
    else:
        for a, b in ZSP.items(): t = t.replace(a, b)
        t = t.replace('___', '嗯')
    return t
clips = {}
def cid(l, t):
    t = clean(l, t); k = hashlib.md5(f'{l}:{VOICE[l][1]}:{t}'.encode()).hexdigest()[:12]
    clips[k] = {'lang': l, 'text': t, 'model': VOICE[l][0], 'voice': VOICE[l][1]}; return k
def S(l, t): return ['say', cid(l, t)]
def P(sec): return ['pause', sec]
def letters(w): return ', '.join(c for c in w.replace(' ', ''))
tracks = {}
for s in D['sessions']:
    w = s['wb2']
    if not w: continue
    n = s['n']
    if L == 'SD':
        e = [['chime', 'start'], S('en', "Let's do our English page."), P(1.2)]
        e += [S('en', 'Look and copy.'), P(.8)]
        for c in w['copy']: e += [S('en', c['w']), P(1.0), S('en', c['w']), P(7)]
        e += [S('en', 'Read and write. Look at the letters. Write the word.'), P(.8)]
        for i, u in enumerate(w['unscr']): e += [S('en', f'Number {i+1}.'), P(14)]
        e += [S('en', 'Choose a word. Write it.'), P(.8)]
        for i, c in enumerate(w['cloze']): e += [S('en', f'Number {i+1}. ' + c['s']), P(.5), S('en', ', '.join(c['bank']) + '.'), P(9)]
        e += [S('en', 'About me.'), P(.5), S('en', w['me']['frame']), P(1.5), S('en', w['me']['draw']), P(14)]
        e += [['chime', 'check'], S('en', 'Now, check your answers.'), P(1)]
        for i, u in enumerate(w['unscr']): e += [S('en', f'Number {i+1}. {u["w"]}.'), P(.6), S('en', letters(u['w'])), P(2.5)]
        for i, c in enumerate(w['cloze']): e += [S('en', f'Number {i+1}. ' + c['s'].replace('___', c['ans'])), P(3)]
        e += [S('en', 'Well done!'), ['chime', 'end']]
        tracks[f'sd-s{n}-en'] = e
        z = [['chime', 'start'], S('zh', '我们来读汉字。'), P(1.2)]
        for c in w['zc']: z += [S('zh', c), P(1.0), S('zh', c), P(11)]
        z += [S('zh', '读一读。对，还是不对？'), P(.8)]
        for i, r in enumerate(w['zread']): z += [S('zh', f'第{"一二三"[i]}题。'), S('zh', r['zh']), P(7)]
        z += [S('zh', '选一选，填一填。'), P(.5), S('zh', w['zfill']['zh']), P(.5), S('zh', '，'.join(b['zh'] for b in w['zfill']['bank'])), P(9)]
        z += [S('zh', '连一连。'), P(.5)]
        for i, m in enumerate(w['med']): z += [S('en', m['en']), P(.6)]
        z += [P(10)]
        z += [['chime', 'check'], S('zh', '来，对答案。'), P(1)]
        for i, r in enumerate(w['zread']): z += [S('zh', f'第{"一二三"[i]}题。' + ('对。' if r['ok'] else '不对。')), P(.5), S('zh', r['zh']), P(2.5)]
        z += [S('zh', w['zfill']['zh'].replace('___', w['zfill']['ans'])), P(3)]
        for i, m in enumerate(w['med']): z += [S('en', m['en']), P(.5), S('zh', m['zh']), P(2.5)]
        z += [S('zh', '真棒！'), ['chime', 'end']]
        tracks[f'sd-s{n}-zh'] = z
    else:
        e = [['chime', 'start'], S('en', "Let's do our page."), P(1.2), S('en', 'Look and copy.'), P(.8)]
        for c in w['copy']: e += [S('en', c['w']), P(1.0), S('en', c['w']), P(6)]
        e += [S('en', 'Look and circle.'), P(.8)]
        for c in w['circ']: e += [S('en', c['w']), P(1.0), S('en', c['w']), P(6)]
        e += [S('zh', '连一连。'), P(.8)]
        for x in w['zmatch']: e += [S('zh', x['zh']), P(1.0), S('zh', x['zh']), P(5)]
        e += [S('en', 'Match.'), P(.8)]
        for m in w['med']: e += [S('en', m['en']), P(1.0), S('zh', m['zh']), P(6)]
        e += [S('en', 'About me.'), P(.5), S('en', w['me']['frame'] + ' ' + ', or '.join(w['me']['opts']) + '?'), P(9)]
        if w.get('rec'): e += [S('en', w['rec'][0]), P(8)]
        e += [['chime', 'check'], S('en', 'Now, check your answers.'), P(1)]
        for c in w['circ']: e += [S('en', c['w']), P(.5), S('en', f'Picture number {c["ans"]+1}.'), P(2.5)]
        ordz = [(i + 1) % len(w['zmatch']) for i in range(len(w['zmatch']))]
        for x in w['zmatch']: e += [S('zh', x['zh']), P(2)]
        for m in w['med']: e += [S('en', m['en']), P(.5), S('zh', m['zh']), P(2.5)]
        e += [S('en', 'Well done!'), ['chime', 'end']]
        tracks[f'ls-s{n}'] = e
json.dump(tracks, open(f'{out}/tracks.json', 'w'), ensure_ascii=False)
json.dump(clips, open(f'{out}/clips.json', 'w'), ensure_ascii=False)
tot = sum(sum(x[1] for x in t if x[0] == 'pause') for t in tracks.values())
print(L, 'tracks', len(tracks), 'clips', len(clips), 'chars', sum(len(c['text']) for c in clips.values()), 'pause-min', round(tot / 60, 1))
