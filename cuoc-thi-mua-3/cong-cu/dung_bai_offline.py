#!/usr/bin/env python3
"""Dựng bộ chạy bài lớp offline cho web Cuộc thi mùa 3 (chạy ở thư mục gốc repo):

    python3 cuoc-thi-mua-3/cong-cu/dung_bai_offline.py

- Chép code (không chép tranh, giọng) của web Little Seed lớp offline (little-seed/) sang cuoc-thi-mua-3/bai-ls/
  và web Seedling 48 buổi (seedling/) sang cuoc-thi-mua-3/bai-sd/, kể cả các tệp dùng chung mà trang nạp
  (chung/, chuong-trinh/ve48/, seedling/phep-thuat*, little-seed/bb-ve.js…), đổi đường dẫn cho sâu thêm một cấp.
  Tranh, giọng vẫn đọc từ thư mục gốc (../../little-seed/, ../../seedling/, ../../xem-truoc/).
- Tắt máy chủ lớp offline (SDL_API = ''), thêm tiền tố khoá lưu (mỗi bé một ngăn) và nhung.js (báo bước/ngày xong
  về web mùa 3). Web lớp offline gốc không bị sửa.
- Sinh cuoc-thi-mua-3/bai-offline.js: tên, mục tiêu, tranh, các bước của 18 ngày đầu mỗi web cho khung mùa 3.
Sửa web lớp offline rồi muốn mùa 3 theo bản mới: chạy lại script này.
"""
import json, os, re, shutil, subprocess, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'cuoc-thi-mua-3')
SO_NGAY = 18
ENGINES = [
    # (thư mục gốc, thư mục ra, tiền tố khoá lưu, tệp dữ liệu, tệp máy chủ)
    ('little-seed', 'bai-ls', 'm3ls', 'little-seed-data.js', 'ls-may-chu.js'),
    ('seedling', 'bai-sd', 'm3sd', 'seedling-data.js', 'seedling-may-chu.js'),
]
REF = re.compile(r'''(<(?:script|link)\b[^>]*?\b(?:src|href)=")([^"]+)(")''')


def out_name(rel_from_root, src_dir):
    d, b = os.path.split(rel_from_root)
    return b if d == src_dir else d.replace('/', '__') + '__' + b


def rewrite(text, src_dir):
    """Đường dẫn trong tệp chép tính theo trang gốc (src_dir/index.html); trang mới sâu hơn một cấp."""
    text = re.sub(r'(?<![\w/.\-])\.\./', '../../', text)
    if src_dir == 'little-seed':   # san-khau, phep-thuat chọn thư mục tranh theo đường dẫn trang
        text = text.replace("location.pathname.includes('/little-seed/')", "true")
    for d in sorted(os.listdir(os.path.join(ROOT, src_dir))):
        if os.path.isdir(os.path.join(ROOT, src_dir, d)) and not d.startswith('.'):
            text = re.sub(r'(?<![\w/.\-])' + re.escape(d) + '/', '../../%s/%s/' % (src_dir, d), text)
    return text


STORE = """<script>/* Cuộc thi mùa 3: khoá lưu riêng cho từng bé (?k=), không lẫn với web lớp offline trên cùng máy */
(function(){var q=new URLSearchParams(location.search),k=(q.get('k')||'may').replace(/[^\\w-]/g,'').slice(0,40),P='%s-'+k+'|',S=Storage.prototype,g=S.getItem,s=S.setItem,r=S.removeItem;
S.getItem=function(x){return g.call(this,P+x)};S.setItem=function(x,v){return s.call(this,P+x,v)};S.removeItem=function(x){return r.call(this,P+x)};})();</script>
"""


def build(src_dir, out_dir, key, data_file, server_file):
    src_page = os.path.join(ROOT, src_dir, 'index.html')
    dst = os.path.join(OUT, out_dir)
    if os.path.isdir(dst):
        shutil.rmtree(dst)
    os.makedirs(dst, exist_ok=True)
    html = open(src_page, encoding='utf-8').read()
    copied = {}

    def ref(m):
        url = m.group(2)
        if re.match(r'^(https?:)?//', url) or url.startswith('data:'):
            return m.group(0)
        path = url.split('?')[0].split('#')[0]
        full = os.path.normpath(os.path.join(ROOT, src_dir, path))
        rel = os.path.relpath(full, ROOT)
        if not os.path.isfile(full):
            print('  ! thiếu tệp', url)
            return m.group(0)
        name = out_name(rel, src_dir)
        copied[rel] = name
        return m.group(1) + name + m.group(3)

    html = REF.sub(ref, html)
    html = rewrite(html, src_dir)
    html = html.replace('<head>', '<head>' + STORE % key, 1)
    html = html.replace('</body>', '<script src="nhung.js"></script>\n</body>') if '</body>' in html else html + '\n<script src="nhung.js"></script>\n'
    html = re.sub(r'<title>[^<]*</title>', '<title>Bài học · Cuộc thi mùa 3</title>', html, count=1)
    open(os.path.join(dst, 'index.html'), 'w', encoding='utf-8').write(html)
    for rel, name in copied.items():
        t = open(os.path.join(ROOT, rel), encoding='utf-8').read()
        t = rewrite(t, src_dir)
        if name == server_file:
            t, n = re.subn(r"const SDL_API = '[^']*';", "const SDL_API = '';   // Cuộc thi mùa 3: không dùng máy chủ lớp offline", t)
            assert n == 1, 'không thấy SDL_API'
        open(os.path.join(dst, name), 'w', encoding='utf-8').write(t)
    shutil.copy(os.path.join(OUT, 'cong-cu', 'nhung.js'), os.path.join(dst, 'nhung.js'))
    print(out_dir, ':', len(copied), 'tệp')
    return copied


def meta(src_dir, data_file):
    js = r'''global.window={};eval(require("fs").readFileSync(process.argv[1],"utf8"));const S=window.SD,o=[];
for(let n=1;n<=%d;n++){const d=S.days[n];o.push({n,t:d.t,goal:d.goal,hero:d.hero,unit:d.unit,unitname:d.unitname,part:d.part,
steps:d.steps.map(s=>({type:s.type,lab:s.lab||''}))});}console.log(JSON.stringify(o));''' % SO_NGAY
    r = subprocess.run(['node', '-e', js, os.path.join(ROOT, src_dir, data_file)], capture_output=True, text=True, check=True)
    days = json.loads(r.stdout)
    for d in days:   # tranh: đường dẫn theo trang gốc (src_dir/) → theo cuoc-thi-mua-3/ (cùng độ sâu)
        h = d['hero'] or ''
        if h and not h.startswith('../') and not re.match(r'^(https?:)?//', h):
            d['hero'] = '../%s/%s' % (src_dir, h)
    return days


if __name__ == '__main__':
    data = {}
    for src_dir, out_dir, key, data_file, server_file in ENGINES:
        build(src_dir, out_dir, key, data_file, server_file)
        data[out_dir[4:]] = meta(src_dir, data_file)
    with open(os.path.join(OUT, 'bai-offline.js'), 'w', encoding='utf-8') as f:
        f.write('/* Sinh tự động bằng cong-cu/dung_bai_offline.py: 18 ngày đầu của web lớp offline (ls = Little Seed, sd = Seedling 48 buổi). Đừng sửa tay. */\n')
        f.write('window.M3_OL=' + json.dumps(data, ensure_ascii=False) + ';\n')
    print('bai-offline.js:', {k: len(v) for k, v in data.items()})
