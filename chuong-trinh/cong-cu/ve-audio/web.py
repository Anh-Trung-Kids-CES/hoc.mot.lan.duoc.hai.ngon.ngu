"""Đưa vè lên web (mục D, claude/QuyTac_BigBook_Ve_Web.md): chép audio từng câu vào repo, sinh dữ liệu ve48-ls.js / ve48-sd.js.
Ngày 1–4 của mỗi unit: A Anh → B Anh → A Trung → B Trung. Seedling U1 + U4 học chung tuần 1–3: vè chào ở 4 ngày đầu.
Vè lời đề Seedling: ngày 96 (Anh), 97 (Trung). python3 web.py"""
import json, os, re, shutil, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tranh import TRANH
sys.path.insert(0, '/home/claude/hoc.mot.lan.duoc.hai.ngon.ngu/chuong-trinh/cong-cu'); from pinyin_chuan import py as PY
REPO = '/home/claude/hoc.mot.lan.duoc.hai.ngon.ngu/'
OUTD = REPO + 'chuong-trinh/ve48/'
B = {b['id']: b for b in json.load(open('ve_list.json'))}
G = json.load(open('out/ghep.json'))

def days_of(web):
    s = open(REPO + web).read(); d = json.loads(s[s.index('{'):s.rindex('}') + 1])['days']
    U = {}
    for n, x in d.items(): U.setdefault(str(x.get('unit')), []).append(int(n))
    return {u: sorted(v) for u, v in U.items()}, sorted(int(n) for n in d)

def tok_zh(z):
    """Chữ hiển thị karaoke tiếng Trung: mỗi chữ Hán (hoặc tên Latin) một ô, dấu câu dính vào chữ trước."""
    out = []
    for t in re.findall(r'[A-Za-zÀ-ỹ]+|[一-鿿]|[^\sA-Za-zÀ-ỹ一-鿿]', z):
        if re.match(r'[A-Za-zÀ-ỹ一-鿿]', t) or not out: out.append(t)
        else: out[-1] += t
    return out

def line(bid, i, r, g):
    lv = B[bid]['lv']; d = f'out/{lv}/{bid}'; dst = OUTD + f'audio/{bid}/'; os.makedirs(dst, exist_ok=True)
    o = {}
    for l in ('en', 'zh'):
        f = f'{l}_{i + 1:02d}.mp3'; shutil.copy(f'{d}/{f}', dst + f); o['a_' + l] = f'{bid}/{f}'
        if g['don']: shutil.copy(f'{d}/{l}_{i + 1:02d}_don.mp3', dst + f'{l}_{i + 1:02d}_don.mp3'); o['a1_' + l] = f'{bid}/{l}_{i + 1:02d}_don.mp3'
    w_en = [re.sub(r'^(chinese|english|vietnamese|ni)\b', lambda m: m.group().capitalize(), t) for t in r['tts']['en'].split()]
    w_zh = tok_zh(r['tts']['zh'])
    m_en, m_zh = g['moc']['en'], g['moc']['zh']
    if len(m_zh) != len(w_zh): m_zh = (m_zh + [m_zh[-1] if m_zh else 0] * len(w_zh))[:len(w_zh)]
    py = re.sub(r'_+[,，]?\s*', '', r.get('py') or PY(r['tts']['zh'])).strip()
    o.update(w_en=w_en, m_en=m_en, w_zh=w_zh, m_zh=m_zh, py=py, ten='___' in (r.get('en_o', '') + r.get('zh_o', '')))
    return o

def build(lv, web, prefix):
    U, ALL = days_of(web)
    rel = lambda p: p[len(prefix):] if p.startswith(prefix) else '../' + p
    bai = {}; ngay = {}
    ids = [k for k in B if B[k]['lv'] == lv]
    for bid in ids:
        b, g = B[bid], G[bid]
        bai[bid] = dict(ten=b['ten'][0], ten_zh=b['ten'][1], bpm=g['bpm'], img=rel(TRANH[bid]), dong=[line(bid, i, r, g['dong'][i]) for i, r in enumerate(b['dong'])])
    units = sorted({B[k]['unit'] for k in ids if B[k]['unit'] != 'de'}, key=int)
    for u in units:
        dd = sorted(U.get(u, []) + (U.get('4', []) if lv == 'SD' and u == '1' else []))[:4]
        a, b_ = f"{lv.lower()}{u.zfill(2)}a", f"{lv.lower()}{u.zfill(2)}b"
        for k, (n, (bid, l)) in enumerate(zip(dd, [(a, 'en'), (b_, 'en'), (a, 'zh'), (b_, 'zh')])):
            ngay[n] = dict(bai=bid, l=l, luot=k + 1)
    if lv == 'SD':
        ngay[96] = dict(bai='sddea', l='en', luot=1); ngay[97] = dict(bai='sddea', l='zh', luot=2)
    data = dict(lv=lv, base='../chuong-trinh/ve48/audio/', bai=bai, ngay=ngay, bo=ALL)
    f = OUTD + f've48-{lv.lower()}.js'
    open(f, 'w').write('/* Vè 48 buổi – dữ liệu web (sinh bằng chuong-trinh/cong-cu/ve-audio/web.py, lời từ ve48.json). Đừng sửa tay. */\nwindow.VE48=' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
    print(lv, 'bài', len(bai), 'ngày có vè', len(ngay), sorted(ngay)[:12], '…')

if __name__ == '__main__':
    build('LS', 'little-seed/little-seed-data.js', 'little-seed/')
    build('SD', 'seedling/seedling-data.js', 'seedling/')
