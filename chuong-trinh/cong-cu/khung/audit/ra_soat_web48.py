"""Rà hai web lớp offline 48 buổi (Little Seed, Seedling – 99 ngày mỗi web) theo bộ nguyên tắc claude/NguyenTac_LapLai_DangBai.md
và các luật chị đặt thêm (tranh nét 21 ngày, không emoji, không nhân vật mới, không chữ Việt trên màn bài, giọng thu…). 11/11/2026.
Chạy ở thư mục gốc repo: python3 -I chuong-trinh/cong-cu/khung/audit/ra_soat_web48.py [thư mục ra]
Ra: ra_soat_web48.json (chi tiết) và in tóm tắt. Các mục đo bằng máy là gần đúng – phần cốt truyện, độ tự nhiên đọc bằng mắt.
"""
import json, os, re, subprocess, sys, collections, importlib.util
import pronouncing
from pypinyin import lazy_pinyin, Style
ROOT = os.getcwd(); OUT = sys.argv[1] if len(sys.argv) > 1 else '.'
def load_js(p):
    return json.loads(subprocess.run(['node', '-e', 'global.window=global;require(process.argv[1]);process.stdout.write(JSON.stringify(SD))', os.path.abspath(p)],
                                     capture_output=True, text=True, check=True).stdout)
def mod(name, p):
    sp = importlib.util.spec_from_file_location(name, p); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m
WEB = {'LS': ('little-seed', load_js('little-seed/little-seed-data.js')), 'SD': ('seedling', load_js('seedling/seedling-data.js'))}
SRC = {'LS': mod('ls48', 'chuong-trinh/cong-cu/khung/grid/mang/ls48_mang.py').U, 'SD': mod('sd48', 'chuong-trinh/cong-cu/khung/grid/mang/sd48_mang.py').U}
CT = collections.defaultdict(dict)
for x in json.load(open('chuong-trinh/cong-cu/khung/grid/mang/chi_tieu_48.json')):
    k = 'LS' if x['lop'].startswith('Little') else 'SD'
    for u in str(x['unit']).split('+'): CT[k][u] = x
LSJ = {str(u['unit']): u for u in json.load(open('chuong-trinh/cong-cu/khung/grid/mang/little-seed.json'))}

R = collections.defaultdict(lambda: collections.defaultdict(list))   # R[web][mã nguyên tắc] = [ghi chú]
def flag(w, code, msg): R[w][code].append(msg)
WORD = re.compile(r"[^\W\d_][\w']*")
def words(s): return WORD.findall(s or '')
def sents(s): return [x for x in re.split(r'(?<=[.!?…])\s+|(?<=[.!?])(?=[A-Z])', s or '') if WORD.search(x)]
HAN = re.compile(r'[一-鿿]')
VI = re.compile(r'[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹàáèéìíòóùúýõãĩũ]', re.I)
NAMES = {'Bông', 'Vũ', 'Leo', 'Anna', 'Xiaomei', 'Lan', 'Puppy'}
def vi(s):
    for k in NAMES: s = (s or '').replace(k, '')
    return bool(VI.search(s))
EMO = re.compile('[\U0001F300-\U0001FAFF☀-➿]')

# ---------- khung câu từng unit (theo chi_tieu_48 'cau_truc' và khung_cau 9 khóa) ----------
FEEL = r'happy|sad|sleepy|tired|hungry|thirsty|scared|angry|excited|fine|ok'
COL = r'red|blue|green|yellow|pink|purple|orange|black|white|brown|grey|gray|gold|silver'
NUM = r'one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|twenty'
AGE = rf"\b(i'm|you are|are you|he is|she is|is he|is she|it's) ({NUM})\b|how old|years old"
FAM = r"mother|father|mummy|mommy|daddy|grandma|grandpa|brother|sister|baby|uncle|aunt|family|cousin"
FR = {'LS': {1: r"\b(hello|hi|goodbye|bye|good morning)\b|what's your name", 2: rf"my name is|what's your name|" + AGE,
             3: rf"who is (he|she|this|that)|\b(he|she|this) is my\b|who's|\bmy ({FAM})\b", 4: r"\bi have\b|i've got|\btouch\b|\b(big|small)\b", 5: rf"how do you feel|\b(i am|i'm|are you|you are|is|he's|she's|feel|so) ({FEEL})\b",
             6: r"what is this|what's this|this is (a|my)|\blook\b", 7: r"where is|where's|\b(on|under|in) the\b|thank you", 8: r"\bcan('t)?\b",
             9: r"what do you like|\bi like\b|\bi (eat|drink)\b|\blikes?\b", 10: r"\btoday\b|let's|\b(it's|it is) (sunny|rainy|cloudy|windy|hot|cold|snowy)|weather",
             11: rf"what colou?r|\bit's ({COL})|\b({COL})\b", 12: rf"how many|\b({NUM})\b"},
      'SD': {1: r"good morning|\bhello\b|goodbye|what's your name|see you|\bsorry\b", 4: r"touch your|clap your|stamp your|open your|i've got|has got|look at your|\bthis is my\b",
             2: rf"what's your name|nice to meet|my name is|" + AGE, 3: rf"who is (he|she|the \w+)|\b(he|she|this) is my\b|has got|have got|i've got|'s ({FAM}|photo)|\bmy ({FAM})\b",
             5: rf"how do you feel|\bfeel\b|\b(i'm|are you|you are|is|he's|she's|so) ({FEEL})\b|\bwant\b", 6: r"\b(this|that) is\b|\b(these|those) are\b|there (is|are)|look at the|what (is|are) (this|that|these|those)",
             7: r"where is|where's|\b(in|on|under|next to|behind|between) (the|my|your|his|our)\b|\bor\b", 8: r"\bcan('t)?\b",
             9: r"do you (like|want)|\b(i|you|we) (don't )?(like|want)\b|\blikes?\b|no, thank you", 10: r"\btoday\b|\b(it's|is) (\w+ )?(sunny|cold|windy|cloudy|raining|snowing|hot|white)|let's|weather|stay at home|go out",
             11: rf"what colou?r|\b({COL})\b|where are", 12: rf"how many|there are|\bpeople\b|\bperson\b|o'clock|\b({NUM})\b"}}
ORDER = {'LS': list(range(1, 13)), 'SD': [1, 4, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12]}
STARTERS = {'there is/are': r"\bthere (is|are)\b", 'has/have got': r"\b(has|have|'ve|hasn't|haven't) got\b", 'V-ing': r"\b(is|are|am|'s|'re|'m) \w+ing\b",
            'can': r"\bcan('t)?\b", 'giới từ vị trí': r"\b(in|on|under|next to|behind|between) (the|my|your|his|her|our)\b", 'câu hỏi wh-': r"\b(what|where|who|how|whose|which)\b[^.!?]*\?"}
YCT1 = {'是/吗': '是|吗', '有': '有', '在': '在', '喜欢': '喜欢', '的': '的', '很': '很', '和': '和', '谁/哪儿/什么/几': '谁|哪儿|什么|几'}
FUNC = set("""a an the and or but so to of in on at for with from up down out into over off by is are am was were be 's 're 'm i you he she it we they me him her us them my your his its our their
this that these those here there what where who how when why which whose yes no not don't doesn't isn't aren't can't can do does did have has got 've hasn't haven't let's let
oh ha wow ok okay please thank thanks hello hi bye goodbye too very a lot of now then again some one two three four five six seven eight nine ten
look see like want go come say says said s y es""".split())

def all_texts(d):
    """(loại, nhãn, câu Anh, câu Trung) của mọi văn bản nghe trong ngày"""
    for s in d['steps']:
        if s['type'] == 'truyen':
            sc = s.get('scenes') or (s.get('scenes_en', []))
            for x in sc: yield ('bb' if s.get('lab') else 'tr', s.get('title', ''), x.get('en', ''), x.get('zh', ''), x)

for W, (dirn, SDX) in WEB.items():
    D = SDX['days']; ND = sorted(D, key=int)
    # ---- 17: 5–10 câu mỗi bài; 8: thứ tự bước; GN; ảnh; giọng ----
    nogiong = collections.Counter(); total_lines = collections.Counter()
    for n in ND:
        x = D[n]; st = x['steps']; ty = [s['type'] for s in st]
        for s in st:
            t = s['type']
            c = {'nen': 'cards', 'the': 'cards', 'goi': 'cards', 'loi': 'cards', 'cham': 'qs', 'game': 'qs', 'de': 'qs', 'chon': 'qs', 'noi': 'turns',
                 'pdn': 'items', 'tl': 'items', 'lam': 'cmds'}.get(t)
            k = len(s[c]) if c else sum(len(r['qs']) for r in s['rounds']) if t == 'hoi' else \
                len(s['quiz'].get('zh', [])) + len(s['quiz'].get('en', [])) if t == 'meo' else None
            if k is not None and not 5 <= k <= 10: flag(W, '17', f'ngày {n} {t}: {k} câu')
            blob = json.dumps({kk: vv for kk, vv in s.items() if kk not in ('lab', 'sub', 'title', 'title_zh')}, ensure_ascii=False)
            for f in re.findall(r'"(?:en|t|q|zh|name)":\s*"([^"]*)"', blob):
                if vi(f): flag(W, 'GN', f'ngày {n} {t}: {f[:50]}')
            for f in re.findall(r'"(?:img|hero)":\s*"([^"]*)"', blob):
                if f and not os.path.exists(os.path.normpath(os.path.join(dirn, f))): flag(W, 'ANH-mat', f'ngày {n} {t}: {f}')
                if '/the/' in f: flag(W, 'the-chu', f'ngày {n} {t}: {os.path.basename(f)}')   # LS 48 được hiện chữ (NL-4, 11/11): thẻ chữ chỉ là chỗ chưa có tranh
            for m in re.finditer(r'\{[^{}]*"e":\s*"([^"]+)"[^{}]*\}', blob):
                if EMO.search(m.group(1)) and not re.search(r'"img":\s*"[^"]+"', m.group(0)):
                    flag(W, 'emoji', f'ngày {n} {t}: {m.group(1)} thay tranh cho "{(re.search(r'"en":\s*"([^"]*)"', m.group(0)) or re.search(r'"t":\s*"([^"]*)"', m.group(0)) or [None, "?"])[1]}"')
            # giọng: mỗi câu nghe (truyện, nói theo, phiên dịch, câu hỏi)
            for key_t, key_a in (('en', 'a_en'), ('zh', 'a_zh')):
                for m in re.finditer(r'\{[^{}]*"' + key_t + r'":\s*"([^"]+)"[^{}]*\}', blob):
                    obj = m.group(0)
                    if '"' + key_a + '"' in obj:
                        total_lines[t] += 1
                        if re.search('"' + key_a + r'":\s*""', obj): nogiong[t] += 1
            if t in ('noi', 'game', 'cham', 'chon', 'de', 'hoi', 'tl'):
                for m in re.finditer(r'\{"(?:t|q)":\s*"[^"]+"[^{}]*"a(?:_q)?":\s*"([^"]*)"', blob):
                    total_lines[t] += 1
                    if not m.group(1): nogiong[t] += 1
        if x.get('kind') in ('Phần', 'phan') and 'truyen' in ty:
            i_tr = ty.index('truyen')
            if not any(t in ('the', 'nen') for t in ty[:i_tr]): flag(W, '8', f'ngày {n}: không có thẻ xem trước trước truyện')
            if not any(t in ('noi', 'game', 'goi', 'pdn', 'cham', 'chon') for t in ty[i_tr + 1:]): flag(W, '8', f'ngày {n}: thiếu bước gọi lại sau truyện')
    R[W]['GI'] = [f'{t}: {nogiong[t]}/{total_lines[t]} câu không có giọng thu' for t in total_lines if nogiong[t]]

    # ---- truyện unit: 4 mặt, khung, lặp, mẫu cũ, Starters, YCT, từ lạ, mật độ ----
    STORY = collections.defaultdict(list)    # unit -> [(ngày, scenes)]
    for n in ND:
        x = D[n]
        if x.get('kind') not in ('Phần', 'phan'): continue
        tr = next((s for s in x['steps'] if s['type'] == 'truyen' and not s.get('lab')), None)
        if tr: STORY[str(x['unit'])].append((int(n), tr.get('scenes') or [dict(a, zh=b.get('zh', '')) for a, b in zip(tr.get('scenes_en', []), tr.get('scenes_zh', []))]))
    vocab_all = set(FUNC)
    for d in D.values():
        for s in d['steps']:
            for c in s.get('cards', []): vocab_all |= {w.lower() for w in words(c.get('en', ''))}
    if W == 'SD':
        for d in WEB['LS'][1]['days'].values():
            for s in d['steps']:
                for c in s.get('cards', []): vocab_all |= {w.lower() for w in words(c.get('en', ''))}
    known = set(FUNC) | {w.lower() for w in NAMES}
    seen_days = set()
    def base(w):
        w = w.lower().replace("'s", '')
        for suf in ('ies', 'es', 's', 'ing', 'ed'):
            if w.endswith(suf) and len(w) > len(suf) + 2:
                b = w[:-len(suf)]
                for c in (b, b + 'e', b + 'y'):
                    if c in vocab_all or c in known: return c
        return w
    UNITS = {}
    for u in [str(v) for v in ORDER[W]]:
        parts = STORY.get(u, [])
        if not parts: continue
        c = CT[W].get(u, {})
        lo, hi = (int(v) for v in re.findall(r'\d+', c.get('en_chu_phan', '0–999'))[:2]) if c else (0, 999)
        zlo, zhi = (int(v) for v in re.findall(r'\d+', c.get('zh_chu_phan', '0–999'))[:2]) if c else (0, 999)
        _cc = [float(v) for v in re.findall(r'\d+(?:[.,]\d+)?', str(c.get('en_chu_cau', '0')).replace(',', '.'))] if c else [0]
        cau = sum(_cc) / len(_cc) if _cc else 0
        fr = re.compile(FR[W][int(u)], re.I); prev = ORDER[W][:ORDER[W].index(int(u))]
        rows = []; story_txt = ''
        for k, (n, sc) in enumerate(parts):
            # thẻ của ngày vào vốn biết trước khi nghe (nguyên tắc 8)
            for s in D[str(n)]['steps']:
                if s['type'] in ('the', 'nen'):
                    for cd in s['cards']: known |= {base(w) for w in words(cd.get('en', ''))}
            en = ' '.join(s['en'] for s in sc); zh = ''.join(s.get('zh', '') for s in sc); story_txt += ' ' + en
            nw = len(words(en)); ss = sents(en); nz = len(HAN.findall(zh))
            longest = max((len(words(s)) for s in ss), default=0)
            dl = [s for s in sc if s['who'] != 'narr'] if W == 'SD' else sc
            frame = sum(bool(fr.search(s['en'])) for s in dl) / max(1, len(dl))
            rep = [s for s, m in collections.Counter(s['en'].strip() for s in sc).items() if m > 2]
            old = sorted({p for p in prev if re.search(FR[W][p], en, re.I)})
            toks = [base(w) for w in words(en)]
            new = [t for t in toks if t not in known]; known |= set(toks)
            lạ = sorted({t for t in toks if len(t) > 1 and t not in vocab_all and t not in FUNC and t.lower() not in {x.lower() for x in NAMES}})
            row = dict(ngay=n, phan=k + 1, en_chu=nw, chu_cau=round(nw / max(1, len(ss)), 1), cau_dai=longest, zh_chu=nz, khung=round(frame, 2),
                       lap=rep, mau_cu=old, moi=len(new), mat_do=round(len(new) / max(1, nw), 2), tu_moi=sorted(set(new)), tu_la=lạ)
            rows.append(row)
            if c and not lo <= nw <= hi: flag(W, '62-chữ', f'U{u} P{k+1} (ngày {n}): {nw} chữ, chỉ tiêu {lo}–{hi}')
            if c and not zlo <= nz <= zhi: flag(W, '62-Hán', f'U{u} P{k+1} (ngày {n}): {nz} chữ Hán, chỉ tiêu {zlo}–{zhi}')
            if c and cau and abs(row['chu_cau'] - cau) > 1.2: flag(W, '62-câu', f'U{u} P{k+1}: {row["chu_cau"]} chữ/câu, chỉ tiêu ~{cau}')
            if frame < 0.6: flag(W, '61b-khung', f'U{u} P{k+1}: {int(frame*100)}% dòng thoại có khung unit')
            if rep: flag(W, '61b-lặp', f'U{u} P{k+1}: lặp >2 lần: {rep}')
            if int(u) != ORDER[W][0] and len(old) < 2: flag(W, '63-mẫu cũ', f'U{u} P{k+1}: dùng mẫu của unit {old or "–"}')
            if row['mat_do'] > 0.15: flag(W, '5-mật độ', f'U{u} P{k+1}: {len(new)} từ chưa gặp / {nw} chữ ({row["mat_do"]}): {", ".join(row["tu_moi"][:8])}')
            if len(lạ) > 2: flag(W, '22-từ lạ', f'U{u} P{k+1}: {", ".join(lạ)}')
            for s in sc:
                for m in re.findall(r'\b(?:Mr|Mrs|Miss|Ms)\.? ([A-Z]\w+)', s['en']):
                    if m not in NAMES: flag(W, 'NV', f'U{u} P{k+1}: "{s["en"]}"')
        # 64 Starters / YCT (Seedling)
        if W == 'SD':
            have = [k for k, p in STARTERS.items() if re.search(p, story_txt, re.I)]
            narr = any(s['who'] == 'narr' for _, sc in parts for s in sc)
            if narr: have.append('lời kể ngôi 3')
            if len(have) < 3: flag(W, '64', f'U{u}: chỉ {have}')
            zt = ''.join(s.get('zh', '') for _, sc in parts for s in sc)
            yct = [k for k, p in YCT1.items() if re.search(p, zt)]
            UNITS[u] = dict(starters=have, yct=yct)
        # 6 từ hay sai: từ thẻ của unit trước có trong truyện
        if prev:
            pu = str(prev[-1]); pw = set()
            for n2 in ND:
                if str(D[n2].get('unit')) == pu:
                    for s in D[n2]['steps']:
                        if s['type'] == 'the': pw |= {cd['en'].lower() for cd in s['cards'] if not cd.get('on')}
            hit = sorted(w for w in pw if re.search(r'\b' + re.escape(w) + r's?\b', story_txt, re.I))
            if not hit: flag(W, '6-hay sai', f'U{u}: không có từ nào của U{pu} trong truyện')
            UNITS.setdefault(u, {})['hay_sai'] = hit[:6]
        UNITS.setdefault(u, {})['phan'] = rows
        # 3/23: từ lõi (thẻ Mới) có trong ≥3 văn bản (truyện, big book, vè; web chưa có bài hát)
        M = SRC[W].get(int(u))
        if M:
            bbt = ' '.join(e for _, e, _ in M['bb'][2]); vet = ' '.join(e for _, e, _, _ in M['ve'])
            cards = set()
            for n2 in ND:
                if str(D[n2].get('unit')) == u:
                    for s in D[n2]['steps']:
                        if s['type'] == 'the': cards |= {cd['en'] for cd in s['cards'] if not cd.get('on')}
            def has(t, w): return bool(re.search(r'\b' + re.escape(w.split(' · ')[0].split(' / ')[0].rstrip('?!.')) + r'(s|es)?\b', t, re.I))
            cnt = {w: sum(has(t, w) for t in (story_txt, bbt, vet)) for w in cards}
            UNITS[u]['tu_van_ban'] = {k: sorted(w for w, v in cnt.items() if v == k) for k in (0, 1, 2, 3)}
            if any(cnt.values()) and sum(v >= 3 for v in cnt.values()) < len(cnt):
                flag(W, '3/23', f'U{u}: {sum(v>=3 for v in cnt.values())}/{len(cnt)} từ ở đủ 3 văn bản; ở 1 văn bản: {", ".join(UNITS[u]["tu_van_ban"][1][:6])}; không có: {", ".join(UNITS[u]["tu_van_ban"][0][:6])}')
            # 65 vè: 4 dòng, ~7 âm tiết, 4 phách, vần AABB (Anh theo từ điển CMU, Trung theo vận mẫu), ô tên, không dòng đệm
            lines = [e for _, e, _, _ in M['ve']]; zl = [z for _, _, z, _ in M['ve']]
            def syl(s):
                n_ = 0
                for w in words(s.lower()):
                    ph = pronouncing.phones_for_word(w.strip("'"))
                    n_ += pronouncing.syllable_count(ph[0]) if ph else max(1, len(re.findall(r'[aeiouy]+', w)))
                return n_ + 2 * s.count('___')
            def rhyme(a, b):
                a, b = words(a.lower())[-1], words(b.lower())[-1]
                if a == b: return True
                pa, pb = pronouncing.phones_for_word(a), pronouncing.phones_for_word(b)
                def tail(p):
                    ph = p.split(); i = max(j for j, x in enumerate(ph) if x[-1].isdigit()); return ' '.join(re.sub(r'\d', '', x) for x in ph[i:])
                return bool(pa and pb and tail(pa[0]) == tail(pb[0]))
            def zfin(z):
                h = HAN.findall(z); return lazy_pinyin(h[-1], style=Style.FINALS)[0] if h else ''
            ZHE = {}
            for g, fs in {'发花': 'a ia ua', '梭波': 'o uo e', '乜斜': 'ie ve ue', '一七': 'i v er', '姑苏': 'u', '怀来': 'ai uai', '灰堆': 'ei ui uei',
                          '遥条': 'ao iao', '由求': 'ou iu iou', '言前': 'an ian uan van', '人辰': 'en in un uen vn', '江阳': 'ang iang uang', '中东': 'eng ing ong iong ueng'}.items():
                for x in fs.split(): ZHE[x] = g
            def zr(a, b):
                fa, fb = zfin(a), zfin(b); return fa == fb or (ZHE.get(fa) and ZHE.get(fa) == ZHE.get(fb))
            vv = dict(dong=len(lines), am_tiet=[syl(l) for l in lines], van_en=[rhyme(lines[0], lines[1]), rhyme(lines[2], lines[3])] if len(lines) >= 4 else [],
                      van_zh=[zr(zl[0], zl[1]), zr(zl[2], zl[3])] if len(zl) >= 4 else [], o_ten=any('___' in l for l in lines))
            UNITS[u]['ve'] = vv
            if not all(vv['van_en']): flag(W, '65-vần Anh', f'U{u}: {lines}')
            if not all(vv['van_zh']): flag(W, '65-vần Trung', f'U{u}: {zl} (vận mẫu {[zfin(z) for z in zl]})')
            if not vv['o_ten']: flag(W, '65-ô tên', f'U{u}: vè không có ô tên con')
            if any(not 5 <= a <= 10 for a in vv['am_tiet']): flag(W, '65-độ dài dòng', f'U{u}: âm tiết {vv["am_tiet"]}')
            for l in lines:
                if re.fullmatch(rf"[\s,!.…]*(({NUM})[\s,!.…]*)+", l, re.I): flag(W, '65-dòng đệm', f'U{u}: "{l}"')
            # 61a, 25 big book: ≥60% trang cùng khung (2 chữ đầu), trang cuối có ô tên
            pg = [e for _, e, _ in M['bb'][2]]
            heads = collections.Counter(' '.join(words(p.lower())[:2]) for p in pg)
            share = heads.most_common(1)[0][1] / len(pg)
            UNITS[u]['bb'] = dict(trang=len(pg), khung=round(share, 2), o_ten='___' in pg[-1])
            if share < 0.6: flag(W, '24/61a-big book', f'U{u}: chỉ {int(share*100)}% trang cùng khung ({M["bb"][0]})')
            if '___' not in pg[-1]: flag(W, '25-ô tên', f'U{u}: trang cuối big book không có ô tên')
    # 51 câu cửa miệng (Little Seed theo khung 9 khóa)
    if W == 'LS':
        for u, J in LSJ.items():
            txt = ' '.join(s['en'] for _, sc in STORY.get(u, []) for s in sc).lower()
            ccm = [c['en'] for c in J.get('cau_cua_mieng', [])]
            miss = [c for c in ccm if c.lower().rstrip('!.') not in txt]
            if ccm and len(miss) > len(ccm) - 2: flag(W, '51', f'U{u}: câu cửa miệng có trong truyện {len(ccm)-len(miss)}/{len(ccm)} (thiếu {miss})')
    # nhân vật: mã người nói ngoài bộ nhân vật web
    for n in ND:
        for s in D[n]['steps']:
            for sc in (s.get('scenes') or []):
                if sc.get('who') and sc['who'] not in SDX['who'] and sc['who'] != 'narr': flag(W, 'NV-mã', f'ngày {n}: {sc["who"]}')
        for s in D[n]['steps']:
            for sc in (s.get('scenes') or []):
                for m in re.findall(r"(?<=[a-z,] )([A-Z][a-z]+)\b", sc.get('en', '')):
                    if m.lower() not in vocab_all and m not in NAMES | {'Mrs', 'Grandma', 'Grandpa', 'Mummy', 'Daddy', 'Mum', 'Dad', 'Mommy', 'Sun', 'Children'}:
                        flag(W, 'NV-tên?', f'ngày {n}: {m} – "{sc["en"][:60]}"')
    # 19: độ dài ngày ước tính (giây) và bước nhảy
    def dur(d):
        t = 0
        for s in d['steps']:
            ty = s['type']
            t += 7 * len(s.get('scenes') or s.get('scenes_en') or []) + 6 * len(s.get('cards', [])) + 12 * len(s.get('qs', [])) + 12 * len(s.get('turns', [])) \
                 + 15 * len(s.get('items', [])) + 12 * sum(len(r['qs']) for r in s.get('rounds', [])) + (60 if ty == 'meo' else 0) + (45 if ty == 'lam' else 0)
        return t
    L = [(int(n), dur(D[n])) for n in ND]
    R[W]['19-dài ngày'] = [f'ngày {a}: {round(b/60,1)} phút (ngày trước {round(p/60,1)})' for (pa, p), (a, b) in zip(L, L[1:]) if b > 1.6 * p and b - p > 120]
    R[W]['27/47-ngày dài'] = [f'ngày {a}: ~{round(b/60,1)} phút' for a, b in L if b > 25 * 60]
    R[W]['_thong_ke'] = [f'phút mỗi ngày ước tính: min {round(min(b for _, b in L)/60,1)}, trung bình {round(sum(b for _, b in L)/len(L)/60,1)}, max {round(max(b for _, b in L)/60,1)}']
    R[W]['_units'] = [UNITS]

json.dump(R, open(os.path.join(OUT, 'ra_soat_web48.json'), 'w'), ensure_ascii=False, indent=1)
for W in R:
    print('=====', W)
    for k, v in sorted(R[W].items()):
        if k == '_units' or not v: continue
        print(f'[{k}] {len(v)}'); [print('   ', y) for y in v[:6]]
