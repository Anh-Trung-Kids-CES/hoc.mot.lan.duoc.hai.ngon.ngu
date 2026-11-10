"""Gom mọi file giọng có sẵn (web Seedling + web 21 ngày) thành bảng câu → file, đường dẫn tính từ thư mục little-seed/."""
import json, re, subprocess, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
def norm(t):
    t = t.strip().replace('，', ',').replace('！', '!').replace('？', '?').replace('。', '.')
    t = re.sub(r'\s+', ' ', t)
    return re.sub(r'[!.?]+$', '', t).lower()
idx = {}
# 1) Seedling aumap
js = subprocess.run(['node', '-e', "global.window={};require('./seedling/seedling-data.js');process.stdout.write(JSON.stringify(window.SD.aumap))"], cwd=ROOT, capture_output=True, text=True).stdout
for k, f in json.loads(js).items():
    l, t = k.split(':', 1)
    idx.setdefault((l, norm(t)), []).append(('seedling', '../seedling/' + f))
# 2) web 21 ngày
m = json.load(open(os.path.join(ROOT, 'xem-truoc/tai-nguyen/am_thanh_manifest.json')))
for key, v in m.items():
    if not isinstance(v, dict) or 'loi' not in v: continue
    l = v.get('tieng'); 
    if l not in ('en', 'zh', 'vi'): continue
    idx.setdefault((l, norm(v['loi'])), []).append((v.get('nhan_vat', ''), '../xem-truoc/tai-nguyen/' + v['file']))
json.dump({f'{l}:{t}': v for (l, t), v in idx.items()}, open(os.path.join(os.path.dirname(__file__), 'audio_index.json'), 'w'), ensure_ascii=False)
print(len(idx))
