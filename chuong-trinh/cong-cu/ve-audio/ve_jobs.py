"""Lập danh sách bài vè + việc gọi máy đọc (theo claude/KeHoach_AudioVe48.md).
Ra: ve_list.json (bài, dòng, vai, chữ gửi máy, khoá bản thô) và jobs.json (việc gọi máy, đã bỏ trùng).
python3 ve_jobs.py [thu]   (thu = chỉ 2 bài chạy thử LS U2A, SD U2A)"""
import json, re, hashlib, sys
SRC = '/home/claude/hoc.mot.lan.duoc.hai.ngon.ngu/chuong-trinh/cong-cu/khung/grid/mang/ve48.json'
D = json.load(open(SRC))
MODEL = 'gemini-3.1-flash-tts-preview'
BPM = {'A': 96, 'B': 88}   # mỗi dòng 2 ô nhịp (8 phách nhạc, 4 phách mạnh của lời rơi vào phách lẻ)
# vai -> danh sách (giọng, nâng tông); K = cả lớp đồng thanh (Bông + Leo + Anna)
K = [('leda', 1.0), ('fenrir', 1.0), ('laomedeia', 1.15)]
VOICE = {'LS': {'co': [('sulafat', 1.0)], 'lop': K, 'con': [('leda', 1.0)], 'leo': [('fenrir', 1.0)]},
         'SD': {'lan': [('callirrhoe', 1.0)], 'kids': K, 'leo': [('fenrir', 1.0)]}}
TEN_VAI = {'co': 'cô Hươu', 'lan': 'Mrs Lan', 'lop': 'cả lớp', 'kids': 'cả lớp', 'con': 'Bông', 'leo': 'Leo'}

# vè chào U1 (giữ lời; LS có thêm 2 dòng ô tuổi). Chữ hoa = phách mạnh.
CHAO_A = [('co', 'HEL-lo, HEL-lo, EV-ery-one!', '你好你好，大家好！'), ('lop', 'HEL-lo, TEACH-er! CLASS is FUN!', '老师老师，早上好！'),
          ('co', "WHAT'S your NAME? WHAT'S your NAME?", '你叫什么名字呀？'), ('leo', "LEO, LEO, THAT'S my NAME!", '我叫Leo，Leo呀！')]
CHAO_B = [('co', 'GOOD-bye, GOOD-bye, EV-ery-one!', '大家再见，再见啦！'), ('lop', 'ONE, two, THREE… SCHOOL is DONE!', '一二三，放学啦！'),
          ('co', 'SEE you to-MOR-row, LEO and AN-na!', 'Leo，Anna，明天见！'), ('lop', "GOOD-bye, TEACH-er! LET'S GO!", '老师老师，再见！')]
TEN_CHAO = {'A': ('Hello, Hello!', '你好你好！'), 'B': ('Goodbye, Goodbye!', '再见，再见！')}

NAMES = {'leo', 'anna', 'bông', 'vũ', 'xiaomei', 'puppy', 'lan', 'mrs'}
def en_plain(raw):
    """Giống vkTok trên web: bỏ gạch nối âm tiết, chữ hoa phách mạnh viết thường, viết hoa đầu câu, I và tên riêng; bỏ ô tên con."""
    s = re.sub(r'[{}#]', '', raw)
    s = re.sub(r'(?<=\w)-(?=\w)', '', s)
    s = re.sub(r',? ?___,? ?', ' ', s).strip()
    out, first = [], True
    for tok in s.split():
        core = re.sub(r"[^\w']", '', tok)
        strong = sum(1 for c in core if c.isupper()) >= 2
        t = tok.lower() if strong else tok
        lc = core.lower()
        if first or lc == 'i' or lc.replace("'s", '') in NAMES or lc.startswith("i'"):
            t = re.sub(r'[^\W\d_]', lambda m: m.group().upper(), t, count=1)
        out.append(t); first = bool(re.search(r'[.!?]["”’)]?$', tok))
    return ' '.join(out)

def zh_plain(z):
    z = re.sub(r'[{}#]', '', z)
    z = re.sub(r'___[，,]?\s*', '', z).strip('，, ')
    return z.replace('Xiaomei', '小美')

STYLE = {
 ('en', 'A'): "Lively children's clapping chant. Say the line in a steady rhythm with four strong beats, bright, cheerful and very clear, like a teacher leading a class chant. Not singing, not too fast.",
 ('en', 'B'): "Gentle children's clapping chant at the end of class. Say the line in a calm, steady rhythm with four strong beats, warm and very clear. Not singing, not too fast.",
 ('zh', 'A'): '活泼的儿童拍手歌谣。按稳定的节奏念，每句四个重拍，明快、清楚，像老师带全班一起念。不要唱，不要太快。声调准确。拉丁字母写的人名按原语言读音。',
 ('zh', 'B'): '下课时温和的儿童拍手歌谣。节奏平稳，每句四个重拍，温暖、清楚。不要唱，不要太快。声调准确。拉丁字母写的人名按原语言读音。'}
KID = {'en': ' Sound like one happy child chanting with friends.', 'zh': '像一个开心的小朋友和同学们一起念。'}
SEP = {'en': '\nRead aloud only the line below, exactly as written. Do not read the instructions above:\n',
       'zh': '\n请只朗读下面这一句，不要读出上面的要求：\n'}

def bai_list():
    out = []
    for lv, order in (('LS', [str(i) for i in range(1, 13)]), ('SD', ['1'] + [str(i) for i in range(2, 13) if i != 4] + ['de'])):
        for u in order:
            V = D[lv][u]
            if V.get('chao'):
                a = list(CHAO_A)
                if lv == 'LS':
                    d5, d6 = V['doi']
                    a += [('lop', 'LEO, LEO, HOW old are YOU?', d5['zh_o']), ('leo', d6['en_o'], d6['zh_o'])]
                for k, ls in (('A', a), ('B', CHAO_B)):
                    rows = [dict(w=(w if lv == 'LS' else {'co': 'lan', 'lop': 'kids'}.get(w, w)), raw=re.sub(r'[{}#]', '', e), en_o=e,
                                 zh=re.sub(r'[{}#]', '', z), zh_o=z) for w, e, z in ls]
                    out.append(dict(lv=lv, unit=u, bai=k, ten=TEN_CHAO[k], dong=rows, chao=True))
                continue
            for k in ('A', 'B'):
                if k in V: out.append(dict(lv=lv, unit=u, bai=k, ten=V[k]['ten'], dong=V[k]['dong']))
    for b in out:
        b['id'] = f"{b['lv'].lower()}{b['unit'].zfill(2) if b['unit'] != 'de' else 'de'}{b['bai'].lower()}"
        b['bpm'] = BPM[b['bai']]
    return out

JOBS = {}
def job(l, voice, bai, w, text):
    st = STYLE[(l, 'B' if bai == 'B' else 'A')] + (KID[l] if w in ('lop', 'kids', 'con', 'leo') else '')
    sig = f'{l}|{voice}|{MODEL}|{st}|{text}'
    key = f"{l}_{voice}_{hashlib.md5(sig.encode()).hexdigest()[:10]}"
    JOBS.setdefault(key, dict(key=key, l=l, voice=voice, model=MODEL, style=st, text=text, prompt=st + SEP[l] + text))
    return key

if __name__ == '__main__':
    thu = 'thu' in sys.argv[1:]
    B = bai_list()
    if thu: B = [b for b in B if b['id'] in ('ls02a', 'sd02a')]
    for b in B:
        for r in b['dong']:
            vs = VOICE[b['lv']][r['w']]
            r['vai'] = TEN_VAI[r['w']]
            r['tts'] = {'en': en_plain(r['raw']), 'zh': zh_plain(r['zh'])}
            r['giong'] = {l: [[v, p, job(l, v, b['bai'], r['w'], r['tts'][l])] for v, p in vs] for l in ('en', 'zh')}
    json.dump(B, open('ve_list.json', 'w'), ensure_ascii=False, indent=1)
    json.dump(list(JOBS.values()), open('jobs.json', 'w'), ensure_ascii=False, indent=1)
    from collections import Counter
    print('bài', len(B), '· dòng', sum(len(b['dong']) for b in B), '· việc gọi máy', len(JOBS), Counter(j['voice'] for j in JOBS.values()))
