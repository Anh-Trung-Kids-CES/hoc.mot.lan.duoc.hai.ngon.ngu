"""Truyện Seedling: câu có chỗ trống "___" → điền tên bạn trong truyện (chị chốt 18/11/2026).

Trước đây chữ trên màn hình là "___" nhưng giọng mẫu tự điền tên ngẫu nhiên (Carl, Shane, 西瓜, 骏骏…).
Nay điền tên đã có giọng trên web (Leo, Bông, Anna, Xiaomei), chọn theo người nói: nhân vật không gọi tên chính mình,
bố mẹ Leo gọi Leo, bà gọi Bông.

Chạy từ gốc repo, sau mọi lần dựng lại dữ liệu:  python3 -I seedling/cong-cu/va_truyen_ten_1811.py
Câu cần thu: seedling/cong-cu/truyen_ten_can_thu.json (thu cùng giọng despina / zh-cn-techagent-1), thu xong chạy lại để gắn giọng.
"""
import json, os, hashlib

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
P = os.path.join(ROOT, 'seedling/seedling-data.js')
G = os.path.join(ROOT, 'seedling/tai-nguyen/giong')
OUT = os.path.join(ROOT, 'seedling/cong-cu/truyen_ten_can_thu.json')
TEN = {  # câu tiếng Anh gốc → tên (người nói ghi bên cạnh)
    'Touch your head, ___!': 'Anna',                                   # người dẫn
    'Goodbye! How old are you, ___?': 'Xiaomei',                        # Vũ
    'Good kids! Who is in your family, ___?': 'Bông',                   # Mrs Lan
    'How do you feel, ___?': 'Leo',                                     # người dẫn
    'Good night! How do you feel, ___?': 'Leo',                         # mẹ Leo
    "What is this, ___? It's a keyboard!": 'Xiaomei',                   # người dẫn
    'Write your name on the keyboard, ___!': 'Anna',                    # Mrs Lan
    "Where is your ball, ___? It's right under the bed!": 'Bông',       # người dẫn
    'Where is your ball, ___? Is it under your bed?': 'Leo',            # mẹ Leo
    'Can you hop, ___? Hop, hop, hop!': 'Xiaomei',                      # người dẫn
    'Can you hop like a frog, ___?': 'Leo',                             # bố Leo
    "I don't like candy. Put a cross! What about you, ___?": 'Anna',    # người dẫn
    'What about you, ___? Do you like chips?': 'Bông',                  # Mrs Lan
    "What's the weather like today, ___?": 'Xiaomei',                   # người dẫn
    "What's the weather like today, ___? Is it sunny or snowy?": 'Bông',  # Anna
    'What colour do you like, ___? I like gold!': 'Anna',               # người dẫn
    'Ha ha! What clothes do you like, ___?': 'Bông',                    # bà
    'How many people are there in your family, ___?': 'Leo',            # người dẫn
}
def fname(l, t): return f"{l}_{hashlib.md5((l + ':' + t).encode()).hexdigest()[:10]}.mp3"

raw = open(P, encoding='utf-8').read(); head, body = raw.split('window.SD=', 1); d = json.loads(body.rstrip().rstrip(';')); am = d['aumap']
can = {}; n = 0
def w(o):
    global n
    if isinstance(o, dict):
        src = o.get('_ten_en') or o.get('en')
        if isinstance(src, str) and src in TEN and isinstance(o.get('zh'), str):
            nm = TEN[src]; o.setdefault('_ten_en', src)
            for k in ('en', 'zh', 'py'):
                if isinstance(o.get(k), str): o[k] = o[k].replace('___', nm)
            if isinstance(o.get('w'), list): o['w'] = [[t[0].replace('___', nm)] + list(t[1:]) if isinstance(t, list) else t for t in o['w']]
            for l in ('en', 'zh'):
                f = fname(l, o[l]); can[l + ':' + o[l]] = f
                if os.path.exists(os.path.join(G, f)):
                    am[l + ':' + o[l]] = 'tai-nguyen/giong/' + f
                    if 'a_' + l in o: o['a_' + l] = 'tai-nguyen/giong/' + f
            n += 1
        for v in o.values(): w(v)
    elif isinstance(o, list):
        for v in o: w(v)
w(d['days']); w(d.get('reader'))
open(P, 'w', encoding='utf-8').write(head + 'window.SD=' + json.dumps(d, ensure_ascii=False) + ';\n')
json.dump(can, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('chỗ đã điền tên:', n, '· câu cần thu:', len(can), '· chưa có file:', sum(1 for f in can.values() if not os.path.exists(os.path.join(G, f))))
