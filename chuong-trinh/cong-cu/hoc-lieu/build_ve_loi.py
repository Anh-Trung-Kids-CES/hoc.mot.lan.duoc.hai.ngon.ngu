"""Lời vè cho sách bài tập: đọc ve48-ls.js / ve48-sd.js (nhánh vè) → ve-loi.js (chỉ lời, pinyin, tranh).
python3 build_ve_loi.py [thư mục chuong-trinh/ve48]"""
import json, sys, os
D = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/hoc.mot.lan.duoc.hai.ngon.ngu/chuong-trinh/ve48'
out = {}
for f, pre in (('ls', 'little-seed/'), ('sd', 'seedling/')):
    s = open(f'{D}/ve48-{f}.js').read(); d = json.loads(s[s.index('{'):s.rindex('}') + 1])
    for b, v in d['bai'].items():
        out[b] = dict(ten=v['ten'], zh=v['ten_zh'], bpm=v['bpm'], img=pre + v['img'],
                      dong=[dict(en=' '.join(x['w_en']), zh=''.join(x['w_zh']), py=x['py']) for x in v['dong']])
here = os.path.dirname(os.path.abspath(__file__))
open(f'{here}/ve-loi.js', 'w').write('/* Lời vè (sinh bằng build_ve_loi.py từ ve48-ls.js, ve48-sd.js). Đừng sửa tay. */\nwindow.VELOI=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(len(out), 'bài')
