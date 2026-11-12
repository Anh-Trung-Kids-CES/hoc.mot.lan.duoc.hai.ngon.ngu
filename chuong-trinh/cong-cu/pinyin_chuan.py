"""Pinyin chuẩn theo từ điển (12/11/2026) – dùng chung cho web Little Seed, Seedling, học liệu in, buổi 0.

Vì sao: pypinyin đọc sai chữ đa âm khi đứng một mình (两只 → zhǐ, 长尾巴 → zhǎng, 数一数 → shù, 下得很大 → dé),
bỏ thanh nhẹ (妈妈 → mā mā, 喜欢 → xǐ huān) và tách sai âm cuốn lưỡi (哪儿 → nǎ ér).
Cách làm: tách từ bằng jieba → tra từng từ trong CC-CEDICT (từ điển mở, nguồn của MDBG, Pleco) → luật ngữ cảnh cho chữ
đa âm đứng riêng → biến điệu 一, 不 (yí gè, bú shì, như giáo trình HSK) → 儿 cuốn lưỡi (nǎr).
Cần: pip install jieba pycccedict (pip --break-system-packages trong máy làm việc).

    from pinyin_chuan import py
    py('我有两只眼睛。')            → 'wǒ yǒu liǎng zhī yǎn jing.'
    py('我有两只眼睛。', noi=True)  → 'wǒ yǒu liǎng zhī yǎnjing.'   (nối âm tiết trong một từ, theo chính tả pinyin)
"""
import re, unicodedata, functools
import jieba
from pycccedict.cccedict import CcCedict
jieba.setLogLevel(60)

HAN = re.compile(r'[一-鿿]')
for w in ('一只', '两只', '几只', '一个', '几个', '长长', '数一数', '下得', '玩得', '长尾巴', '长围巾', '长耳朵', '好长'):
    jieba.del_word(w)
for w in ('早上好', '晚上好', '大家好', '你们好', '老师好', '个人', '这个人', '那个人'):
    jieba.del_word(w)   # tách 早上 + 好 để viết zǎoshang hǎo   # để luật lượng từ / tính từ xử lý từng chữ

@functools.lru_cache(maxsize=1)
def _dict():
    D = {}
    for e in CcCedict().get_entries():
        p = e['pinyin'].lower().replace('u:', 'v')
        if re.search(r'[a-z]', p) and not re.search(r'[A-Z]', e['pinyin'][:1] if e['simplified'].isascii() else ''):
            D.setdefault(e['simplified'], []).append(p.split())
    return D

# Đọc đúng theo Từ điển Hán ngữ hiện đại khi CC-CEDICT có nhiều cách hoặc ghi biến thể
SUA = {'谁': ['shei2'], '照片': ['zhao4', 'pian4'], '夹克': ['jia1', 'ke4'], '狗狗': ['gou3', 'gou5'], '哎呀': ['ai1', 'ya1'],
       '小朋友': ['xiao3', 'peng2', 'you5'], '早上好': ['zao3', 'shang5', 'hao3'], '对不起': ['dui4', 'bu5', 'qi3'],
       '头发': ['tou2', 'fa5'], '眼睛': ['yan3', 'jing5'], '东西': ['dong1', 'xi5'], '时候': ['shi2', 'hou5'], '认识': ['ren4', 'shi5'],
       '数一数': ['shu3', 'yi5', 'shu3'], '数数': ['shu3', 'shu5'], '看一看': ['kan4', 'yi5', 'kan4'], '听一听': ['ting1', 'yi5', 'ting1'],
       '点一点': ['dian3', 'yi5', 'dian3'], '笑一笑': ['xiao4', 'yi5', 'xiao4'], '想一想': ['xiang3', 'yi5', 'xiang3'],
       '长长': ['chang2', 'chang2'], '不是': ['bu4', 'shi4'], '不在': ['bu4', 'zai4'], '六一': ['liu4', 'yi1'], '儿童节': ['er2', 'tong2', 'jie2'], '好长': ['hao3', 'chang2'], '真好玩': ['zhen1', 'hao3', 'wan2']}
# Chữ đa âm đứng riêng sau khi tách từ: đọc mặc định
MOT = {'长': 'chang2', '只': None, '数': 'shu3', '得': 'de5', '着': 'zhe5', '了': 'le5', '还': 'hai2', '地': None, '的': 'de5',
       '好': 'hao3', '为': 'wei4', '和': 'he2', '都': 'dou1', '发': 'fa1', '觉': 'jue2', '行': 'xing2', '乐': 'le4', '重': 'zhong4',
       '种': 'zhong3', '差': 'cha4', '便': 'bian4', '少': 'shao3', '教': 'jiao1', '空': 'kong1', '背': 'bei4', '个': None, '一': None,
       '不': None, '哪': 'na3', '那': 'na4', '呢': 'ne5', '吗': 'ma5', '吧': 'ba5', '啊': 'a5', '呀': 'ya5', '啦': 'la5', '哦': 'o4', '嗯': 'ng4', '哇': 'wa1', '耶': 'ye1', '哈': 'ha1', '么': 'me5', '们': 'men5',
       '子': 'zi5', '上': 'shang4', '下': 'xia4', '里': 'li3', '朝': 'chao2', '降': 'jiang4', '传': 'chuan2', '调': 'diao4', '相': 'xiang1',
       '没': 'mei2', '要': 'yao4', '将': 'jiang1', '量': 'liang4', '处': 'chu4', '尽': 'jin3', '中': 'zhong1', '应': 'ying1', '藏': 'cang2'}
TACH = {'你好', '早上好', '你们好', '大家好', '您好', '晚上好', '数一数', '看一看', '听一听', '点一点', '笑一笑', '想一想', '还有', '不是', '不在', '真好玩'}
SO = set('一二两三四五六七八九十百几这那每哪半')
TONE_MARK = {'a': 'āáǎà', 'e': 'ēéěè', 'i': 'īíǐì', 'o': 'ōóǒò', 'u': 'ūúǔù', 'v': 'ǖǘǚǜ'}

def _mark(s):
    """'zhang3' → 'zhǎng'; 'ma5' → 'ma'; 'nv3' → 'nǚ'"""
    t = int(s[-1]) if s[-1].isdigit() else 5; b = s.rstrip('012345')
    if t in (0, 5): return b.replace('v', 'ü')
    if not re.search('[aeiouv]', b):   # 嗯 ǹg, 呣 ḿ: dấu thanh đặt trên phụ âm
        return unicodedata.normalize('NFC', b[0] + '\u0304\u0301\u030c\u0300'[t - 1] + b[1:])
    for v in ('a', 'e'):
        if v in b: i = b.index(v); break
    else:
        i = b.index('o') if 'ou' in b else max(b.rfind(c) for c in 'iouv')
    return (b[:i] + TONE_MARK[b[i]][t - 1] + b[i + 1:]).replace('v', 'ü')

from pypinyin import pinyin as _pp, Style as _St
def _pp1(ch):   # cách đọc phổ biến nhất của một chữ (pypinyin, dạng số)
    x = _pp(ch, style=_St.TONE3, neutral_tone_with_five=True)[0][0]
    return x if x[-1].isdigit() else x + '5'

def _readings(w):
    if w in SUA: return [SUA[w]]
    return _dict().get(w, [])

def _word(w, prev, nxt):
    """danh sách âm tiết số cho một từ jieba (prev/nxt: từ trước, sau)"""
    if len(w) == 1:
        if w == '只':   # lượng từ zhī sau số đếm / 几 / 这 / 那; còn lại zhǐ (chỉ)
            return ['zhi1' if prev and prev[-1] in SO else 'zhi3']
        if w == '个': return ['ge5' if prev else 'ge4']
        if w == '地': return ['di4' if not prev or not HAN.match(prev[-1]) or nxt in ('上', '下') else 'de5']
        if w in MOT and MOT[w]: return [MOT[w]]
        if w not in SUA: return [_pp1(w)]
    rs = _readings(w)
    if rs:   # nhiều mục: ưu tiên cách có thanh nhẹ ở cuối (故事 gùshi, 东西 dōngxi), không lấy mục toàn thanh nhẹ
        return list(min(rs, key=lambda r: (len(r) != len(w), sum(x.endswith('5') for x in r) == len(r), not r[-1].endswith('5'))))
    out, i = [], 0   # từ không có trong từ điển: tách thành từ con dài nhất có trong từ điển, rồi mới tới từng chữ
    while i < len(w):
        for L in range(len(w) - i, 0, -1):
            sub = w[i:i + L]
            if L == 1 or sub in SUA or sub in _dict():
                out += _word(sub, w[i - 1] if i else prev, w[i + L] if i + L < len(w) else nxt); i += L; break
    return out

def _sandhi(sy, chars):
    """biến điệu 一, 不 như giáo trình (yí gè, yì zhāng, bú shì); 一 khi đếm, số thứ tự, đứng cuối giữ yī"""
    for i, ch in enumerate(chars):
        if ch is None or ch not in '一不' or sy[i].rstrip('012345') not in ('yi', 'bu'): continue
        if sy[i].endswith('5'): continue           # thanh nhẹ đã có trong từ điển (对不起, 看一看)
        j = i + 1
        nx = sy[j] if j < len(chars) and chars[j] is not None else None
        if nx and chars[j] == '个': nx = 'ge4'
        if ch == '一' and 0 < i < len(chars) - 1 and chars[i - 1] and chars[i - 1] == chars[i + 1]:
            sy[i] = 'yi5'; continue          # 看一看, 数一数: 一 đọc nhẹ
        if ch == '一':
            prev = chars[i - 1] if i else ''
            counting = nx is None or chars[i + 1] is None or prev in ('第',) or (prev and prev in SO - {'几', '这', '那', '每', '哪', '半'}) or (i + 1 < len(chars) and chars[i + 1] in SO - {'几', '这', '那', '每', '哪', '半'})
            if counting: sy[i] = 'yi1'
            else: sy[i] = 'yi2' if nx and nx.endswith('4') else 'yi4'
        else:
            sy[i] = 'bu2' if nx and nx.endswith('4') else 'bu4'
    return sy

PUNCT = {'，': ', ', '！': '! ', '？': '? ', '。': '. ', '、': ', ', '：': ': ', '；': '; ', '……': '… ', '…': '… ', '“': ' "', '”': '" ', '（': ' (', '）': ') ', '—': ' — ', '——': ' — '}

def py(z, noi=False):
    """chuỗi tiếng Trung (có thể lẫn tên Latin, ___) → pinyin có dấu thanh"""
    if not z: return ''
    toks = []   # (văn bản, âm tiết số theo từng chữ hoặc None)
    for seg in re.split(r'([一-鿿]+)', z):
        if not seg: continue
        if not HAN.match(seg): toks.append((seg, None)); continue
        ws = []
        for w in jieba.cut(seg, HMM=False):   # từ jieba không có trong từ điển: tách thành từ con dài nhất có trong từ điển
            i = 0
            while i < len(w):
                for L in range(len(w) - i, 0, -1):
                    sub = w[i:i + L]
                    if L == 1 or sub in SUA or sub in _dict(): ws.append(sub); i += L; break
        for k, w in enumerate(ws):
            toks.append((w, _word(w, ws[k - 1] if k else '', ws[k + 1] if k + 1 < len(ws) else '')))
    # biến điệu trên toàn câu
    chars, sy = [], []
    for t, s in toks:
        if s is None: chars.append(None); sy.append(None)
        else: chars += list(t); sy += s
    sy = _sandhi(sy, chars)
    out, k = [], 0
    for t, s in toks:
        if s is None:
            k += 1
            for a, b in sorted(PUNCT.items(), key=lambda x: -len(x[0])): t = t.replace(a, b)
            out.append(('raw', t)); continue
        n = len(t); cur = sy[k:k + n]; k += n
        marks = []
        for x in cur:   # 儿 cuốn lưỡi: 'r5' gắn vào âm tiết trước
            if x == 'r5' and marks: marks[-1] += 'r'
            else: marks.append(_mark(x))
        join = noi and len(marks) > 1 and (t in SUA or t in _dict()) and t[0] not in '很真太一两几这那每不没' and len(t) <= 4 and t not in TACH
        if noi and t == '们' and out and out[-1][0] == 'w':   # 们 gắn vào từ trước: péngyoumen, nǐmen
            out[-1] = ('w', out[-1][1] + marks[0]); continue
        if join:
            jm = marks[0] + ''.join(("'" + m if m[:1] in 'aeoāáǎàēéěèōóǒò' else m) for m in marks[1:])
            out.append(('w', jm))
        else:
            out.append(('w', ' '.join(marks)))
    s = ''
    for kind, t in out:
        if kind == 'raw':
            s += t if (not t[:1].isalnum() and t[:1] not in '_') else (' ' + t + ' ')
        else:
            s += ' ' + t + ' '
    s = re.sub(r'\s+', ' ', s)
    s = re.sub(r'\s+([,.!?:;…)"])', r'\1', s).replace('( ', '(')
    return s.strip()

if __name__ == '__main__':
    import sys
    for line in sys.argv[1:] or ['我有两只眼睛。', '它有一条长尾巴。', '我们数一数！一、二、三！', '雨下得很大。', '我的头发很长。',
                                  '哪儿？在这儿！', '一张照片', '棕色的夹克', '这是谁？', '你好！我叫Bông。', '我不会飞！', '对不起，爷爷！']:
        print(line, '→', py(line), '|', py(line, noi=True))
