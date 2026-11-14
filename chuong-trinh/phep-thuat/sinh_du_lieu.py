#!/usr/bin/env python3
"""Sinh seedling/phep-thuat-du-lieu.js (dữ liệu Phép thuật lời nói cho 24 unit) và giong_can_thu.json (danh sách câu cần thu giọng).
Nguồn: spec.py (bảng phép) + kichban.py (bậc 1, câu dài, phép nối, hội thoại) + fx.py (hiệu ứng). Chạy: python3 sinh_du_lieu.py"""
import json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
import kichban
from kichban import U, W, LONG, COMBO, DIA
from fx import fx_for, ids
import jieba

# ---------- tên riêng: máy hay nghe nhầm ----------
NAME = {'bông': '(b[oô]ng|bomb?|boom|bum|bon|bun|bang|邦|棒|崩|蹦|绷|嘣|朋)', 'anna': '(ann?a|hannah|安娜|阿娜)', 'leo': '(leo|lio|leah|rio|lee ?o|利奥|里奥|雷欧)',
        'xiaomei': '(小美|晓梅|小梅|小妹|肖梅|笑梅|xiao ?mei|show may|she may)', 'vũ': '(v[uũ]|voo|woo|view|vo|武|乌|吴)', 'lan': '(lan|land|lang|兰|蓝|岚)', 'robo': '(robo|robot|rowbow|罗伯|萝卜|罗波|机器人)'}
EN_SYN = {'hello': 'hello|hi|hey', 'mommy': 'mommy|mummy|mom|mum|mama', 'daddy': 'daddy|dad', 'grandpa': 'grandpa|grandad|granddad|grandfather',
          'grandma': 'grandma|grandmother|nana', 'brother': 'brother|bro', 'sister': 'sister|sis', 'one': 'one|1', 'two': 'two|to|too|2', 'three': 'three|3', 'four': 'four|for|4',
          'five': 'five|5', 'six': 'six|6', 'seven': 'seven|7', 'eight': 'eight|8', 'nine': 'nine|9', 'ten': 'ten|10', 'goodbye': 'goodbye|good bye|bye', 'ok': 'ok|okay',
          'cannot': "can't|cant|cannot|can not", "don't": "don't|dont|do not", 'yes': 'yes|yeah', 'schoolbag': 'schoolbag|school bag|bag', 'ice': 'ice', 'old': 'old', 'pencil': 'pencil|pensil'}
EN_STOP = set('a an the is are am i it my this these those that of and you your me we please its do does to'.split())
ZH_STOP = set('的 了 吗 吧 呢 啊 呀 是 这 那 我 你 也 都 个 ，。！？、'.replace(' ', ''))
ZH_STOP |= {'这是', '那是'}
NUM_EN = 'one|two|three|four|five|six|seven|eight|nine|ten|1|2|3|4|5|6|7|8|9|10|to|too|for'
NUM_ZH = '一|二|三|四|五|六|七|八|九|十|两|俩|1|2|3|4|5|6|7|8|9|10'
COL_EN = 'red|yellow|blue|green|pink|orange|purple|black|white|brown|gold|golden|gray|grey'
COL_ZH = '红|黄|蓝|绿|粉|橙|紫|黑|白|棕|褐|金|灰'

def en_tokens(say):
    s = say.lower().replace('’', "'")
    s = re.sub(r"(\w)'(s|m|re|ll|ve|d)\b", r'\1', s)   # what's → what
    s = s.replace("let's", 'lets')
    ws = re.findall(r"[a-zà-ỹ']+", s)
    out = []
    for w in ws:
        if w in EN_STOP: continue
        if w == "can't": out.append('cannot'); continue
        out.append(w)
    return out

def en_pat(w):
    if w in EN_SYN: return EN_SYN[w]
    if w == 'lets': return "let'?s|lets|let us"
    for nm, pat in NAME.items():
        if w == nm or w == nm.replace('ô', 'o').replace('ũ', 'u'): return pat
    b = w[:-1] if w.endswith('s') and len(w) > 3 and not w.endswith('ss') else w
    if b.endswith('y') and False: pass
    return re.escape(b) + '(?:s|es)?'

def zh_tokens(say):
    s = re.sub(r'[，。！？、,.!?\s]', '', say)
    # tên riêng giữ nguyên làm một token
    keep = []
    def rep(m): keep.append(m.group(0)); return '\x00%d\x00' % (len(keep) - 1)
    s2 = re.sub(r'(Leo|Xiaomei|Vũ|Lan|Robo|Anna|Bông)', rep, s)
    toks = []
    for part in re.split(r'(\x00\d+\x00)', s2):
        m = re.fullmatch(r'\x00(\d+)\x00', part)
        if m: toks.append(keep[int(m.group(1))]); continue
        for t in jieba.cut(part):
            if t and t not in ZH_STOP and not all(c in ZH_STOP for c in t): toks.append(t)
    return toks

ZH_SYN = {'爷爷': '爷爷|爷', '奶奶': '奶奶|奶', '哥哥': '哥哥|哥', '妹妹': '妹妹|妹', '妈妈': '妈妈|妈|妈咪', '爸爸': '爸爸|爸', '你好': '你好|您好|你们好', '您好': '你好|您好|你们好',
          '老师': '老师|老是', '小狗': '小狗|狗', '小猫': '小猫|猫', '小鸟': '小鸟|鸟', '小鱼': '小鱼|鱼', '小鸭子': '小鸭子|鸭子|鸭', '家人': '家人|家', '早上': '早上|早安|早', '好': '好'}

def zh_pat(t):
    for nm, pat in NAME.items():
        if t.lower() == nm.replace('ô', 'o').replace('ũ', 'u') or t.lower() == nm: return pat
    if t in ZH_SYN: return ZH_SYN[t]
    if len(t)==1 and t in '一二三四五六七八九十': return {'一': '一|1', '二': '二|两|2', '三': '三|3', '四': '四|4', '五': '五|5', '六': '六|6', '七': '七|7', '八': '八|8', '九': '九|9', '十': '十|10'}[t]
    return re.escape(t)

def thresh(n):
    return n if n <= 2 else max(2, round(n * 0.67))

def cmd(say, lang, key, param, spell_k):
    toks = en_tokens(say) if lang == 'en' else zh_tokens(say)
    pats = []
    for t in toks:
        if param == 'num' and (t in ('one two three four five six seven eight nine ten'.split() or []) or (len(t)==1 and t in '一二三四五六七八九十')):
            pats.append(NUM_EN if lang == 'en' else NUM_ZH)
        elif param == 'color' and (t in COL_EN.split('|') or t in COL_ZH.split('|') or t in ('粉色', '红色', '蓝色', '金色', '粉', '红', '蓝', '金')):
            pats.append(COL_EN if lang == 'en' else COL_ZH)
        else:
            pats.append(en_pat(t) if lang == 'en' else zh_pat(t))
    # từ trùng lặp (ví dụ "Six! … Six!") gộp
    seen = []; [seen.append(p) for p in pats if p not in seen]
    d = dict(say=say, tok=seen, need=thresh(len(seen)))
    if key:
        kp = (en_pat(key.lower()) if lang == 'en' else (NAME.get(key.lower()) or ZH_SYN.get(key) or re.escape(key)))
        if param == 'num' and (key.lower() in 'one two three four five six seven eight nine ten'.split() or (len(key)==1 and key in '一二三四五六七八九十')): kp = NUM_EN if lang == 'en' else NUM_ZH
        d['key'] = kp
    return d

NEW = {'cake_plain': '🎂', 'robo': '🤖', 'baby': '👶', 'crayon': '🖍️', 'pencil': '✏️', 'balloon_white': '🎈', 'angry': '😠', 'excited': '🤩', 'fruit': '🍎', 'polar_bear': '🐻‍❄️'}
ACTOR_PREFIX = ('fam_', 'kids_', 'pets_', 'nv_', 'huou_')
SIZE = {'table': 34, 'bed': 36, 'sofa': 38, 'chair': 30, 'dining_room': 78, 'people': 44, 'ten_people': 56, 'robo': 62, 'cake_plain': 30, 'balloon_white': 40, 'rainbow': 46,
        'pen': 18, 'pencil': 18, 'ruler': 18, 'eraser': 16, 'crayon': 18, 'glue': 20, 'scissors': 22, 'egg': 18, 'hand': 22, 'ball': 22, 'letter': 24, 'take_a_photo': 40, 'water': 22,
        'sock': 20, 'hat': 24, 'coat': 34, 'dress': 40, 'shorts': 26, 'glasses': 26, 'apple': 22, 'banana': 22, 'burger': 26, 'ice_cream': 28, 'noodles': 28, 'pizza': 28, 'rice': 26, 'juice': 26, 'milk': 26, 'book': 24, 'body': 56, 'arm': 40, 'leg': 40, 'baby': 34, 'umbrella': 40, 'snowman': 44, 'monkey': 24, 'schoolbag': 34, 'bird': 24, 'fish': 22, 'frog': 24, 'rabbit': 28, 'duck': 26, 'polar_bear': 40, 'fruit': 34}
def obj_info(i):
    if i.startswith(ACTOR_PREFIX):
        h = 62 if i.startswith(('fam_bong_bo', 'fam_bong_me', 'fam_bong_ong', 'fam_bong_ba', 'huou_', 'nv_lan', 'nv_nguoi')) else 26 if i.startswith('pets_') else 52
        return dict(src='nhan-vat/' + i, h=h)
    d = dict(src='phep-thuat/' + i, h=SIZE.get(i, 30))
    if i in NEW: d['e'] = NEW[i]
    return d

PIC_E = {'day': '☀️', 'night': '🌙', 'go': None}
def pic_of(course, unit, s, steps):
    I = ids(s['objs'])
    shown = []
    for st in steps:
        if st['t'] == 'show': shown += st['o']
        if st['t'] == 'count': shown.append(st['o'])
    shown = [x for x in dict.fromkeys(shown)]
    k = s['k']
    if k == 'go': return dict(bg=1)
    for st in steps:
        if st['t'] == 'weather': return dict(e={'sunny': '☀️', 'cloudy': '☁️', 'windy': '🌬️', 'rainy': '🌧️', 'snowy': '❄️', 'cold': '🥶'}[st['v']])
    if k == 'day': return dict(e='☀️')
    if k == 'night': return dict(e='🌙')
    if k == 'time': return dict(e='🕗')
    if k == 'hooray': return dict(e='🎉')
    if k == 'photo' and (course, unit) == ('SD', '12'): return dict(e='📸')
    if k in ('clap',): return dict(e='👏')
    if k in ('stamp',): return dict(e='🦶')
    if k in ('mouth',) and course == 'SD': return dict(e='👄')
    if k == 'living': return dict(bg_img='tranh/living_room')
    if k == 'no_thanks': return dict(e='✋')
    if k == 'hbd': return dict(e='🎂')
    if k == 'line': return dict(o=['kids_bong_a', 'kids_anna_a'])
    if k == 'count': return dict(o=['kids_bong_a', 'kids_anna_a'])
    if not shown: return dict(e='🪄')
    # tối đa 2 hình: ưu tiên nhân vật/vật chính (đầu danh sách)
    return dict(o=shown[:2])

out = dict(units={}, objs={}, order={'LS': [str(i) for i in range(1, 13)], 'SD': ['1', '4', '2', '3'] + [str(i) for i in range(5, 13)]}, audio=[])
clips = []
def clip(i, lang, text):
    clips.append(dict(id=i, l=lang, text=text))

for (course, unit), d in sorted(U.items(), key=lambda x: (x[0][0], int(x[0][1]))):
    uid = course + unit
    spells = []
    for si, s in enumerate(d['spells']):
        steps, par = fx_for(course, unit, s['k'], s['objs'])
        if s.get('param') and not par: par = 'num'
        ken, kzh = W[(course, unit)][si]
        sp = dict(k=s['k'], en=cmd(s['en'], 'en', ken, par, s['k']), zh=cmd(s['zh'], 'zh', kzh, par, s['k']), fx=steps, pic=pic_of(course, unit, s, steps))
        if par: sp['par'] = par
        sp['kw'] = dict(en=ken, zh=kzh)
        if s.get('reply'): sp['reply'] = dict(en=s['reply'][0], zh=s['reply'][1])
        sp['id'] = '%s.%s' % (uid, s['k'])
        for st in steps:
            for i in (st['o'] if st['t'] in ('show', 'hide', 'anim') and isinstance(st.get('o'), list) else [st['o']] if isinstance(st.get('o'), str) and st['o'] not in ('all', 'shown') else []):
                out['objs'][i] = obj_info(i)
            if st['t'] == 'count_people':
                for i in st['o']: out['objs'][i] = obj_info(i)
            if st['t'] == 'move': out['objs'][st['to']] = obj_info(st['to'])
        spells.append(sp)
        clip('%s.%s.en' % (uid, s['k']), 'en', s['en']); clip('%s.%s.zh' % (uid, s['k']), 'zh', s['zh'])
        if s.get('reply'):
            clip('%s.%s.reply.en' % (uid, s['k']), 'en', s['reply'][0]); clip('%s.%s.reply.zh' % (uid, s['k']), 'zh', s['reply'][1])
    longs = []
    for i, (e, z) in enumerate(LONG[(course, unit)]):
        longs.append(dict(id='%s.long%d' % (uid, i + 1), en=cmd(e, 'en', None, None, ''), zh=cmd(z, 'zh', None, None, '')))
        clip('%s.long%d.en' % (uid, i + 1), 'en', e); clip('%s.long%d.zh' % (uid, i + 1), 'zh', z)
    dia = {}
    for l in ('en', 'zh'):
        dia[l] = []
        for i, (q, a) in enumerate(DIA[(course, unit)][l]):
            dia[l].append(dict(q=q, a=a, qid='%s.dia.%s%d.q' % (uid, l, i + 1), aid='%s.dia.%s%d.a' % (uid, l, i + 1), atok=cmd(a, l, None, None, '')))
            clip('%s.dia.%s%d.q' % (uid, l, i + 1), l, q); clip('%s.dia.%s%d.a' % (uid, l, i + 1), l, a)
    out['units'][uid] = dict(name=d['name'], kind=d['kind'], bg=d['bg'], spells=spells, long=longs, combo=COMBO[(course, unit)], dia=dia)

# câu chung của hai phù thuỷ (khen, gọi, rút lại…): gom làm một nơi
COMMON = {
 'en': {'wake': 'Hi, Leo!', 'ok1': 'Great!', 'ok2': 'Super!', 'ok3': 'Wow!', 'ok4': 'Good job!', 'sent': 'Nice sentence!', 'hello': 'Hi! I can do magic!', 'undo': 'OK!', 'other': 'I can do magic too!', 'nothing': 'Nothing to undo!',
        'double': 'Double magic!', 'bonus': 'Bonus magic!', 'try': 'Good try!', 'more': 'Say more!', 'gold': 'Golden magic!', 'again': 'Your turn!', 'no': 'No, no!'},
 'zh': {'wake': '你好，Xiaomei！', 'ok1': '真棒！', 'ok2': '太好了！', 'ok3': '很好！', 'sent': '说得真好！', 'hello': '你好！我会魔法！', 'undo': '好的！', 'other': '我也会魔法！', 'nothing': '还没有魔法！',
        'double': '双重魔法！', 'bonus': '奖励魔法！', 'try': '很好！', 'more': '再说一句！', 'gold': '金色魔法！', 'again': '轮到你啦！', 'no': '不，不！'}}
COMMON['vi'] = {'try': 'Con thử nói cả câu nhé!', 'two': 'Bây giờ con nói liền hai phép nhé!', 'gold': 'Phép vàng! Con giỏi quá!',
                'i1': 'Có ba bậc thang. Bậc một: con nói một từ.', 'i2': 'Bậc hai: con nói cả câu.', 'i3': 'Bậc ba: con nói liền hai phép một hơi, con sẽ được phép vàng!'}
for l, dd in COMMON.items():
    for k, t in dd.items(): clip('common.%s.%s' % (k, l), l, t)
out['common'] = COMMON
# trùng id/text → bỏ trùng lời thu (cùng chữ cùng tiếng dùng lại một file)
byText = {}
for c in clips:
    byText.setdefault((c['l'], c['text']), []).append(c['id'])
uniq = [dict(id=v[0], l=k[0], text=k[1], same=v[1:]) for k, v in byText.items()]
out['same'] = {i: v[0] for k, v in byText.items() for i in v[1:]}   # id trùng → id gốc dùng chung file thu

js = '/* Dữ liệu Phép thuật lời nói (24 unit, 146 phép) – SINH TỰ ĐỘNG từ chuong-trinh/phep-thuat/*.py, đừng sửa tay. */\nwindow.PT_DATA=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n'
open(os.path.join(ROOT, 'seedling', 'phep-thuat-du-lieu.js'), 'w', encoding='utf8').write(js)
json.dump(uniq, open(os.path.join(HERE, 'giong_can_thu.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
nsp = sum(len(u['spells']) for u in out['units'].values())
print('unit', len(out['units']), '· phép', nsp, '· vật', len(out['objs']), '· câu cần thu (đã bỏ trùng)', len(uniq), '· tổng trước bỏ trùng', len(clips), '· cỡ file %.0f KB' % (len(js) / 1024))
