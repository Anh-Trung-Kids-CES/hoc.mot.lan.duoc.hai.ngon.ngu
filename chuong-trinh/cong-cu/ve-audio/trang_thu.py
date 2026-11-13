"""Trang nghe thử audio vè: mỗi bài file mẫu Anh, Trung, nhạc vỗ tay, và từng dòng (kèm cờ máy kiểm).
python3 trang_thu.py id1 id2 ... → out/trang/index.html + các mp3 (đường dẫn tương đối)"""
import json, sys, os, shutil, html
R = json.load(open('out/ghep.json')); B = {b['id']: b for b in json.load(open('ve_list.json'))}
C = json.load(open('kiem.json')) if os.path.exists('kiem.json') else {}
ids = sys.argv[1:]; D = 'out/trang'; os.makedirs(D, exist_ok=True)
files = {}
def f(src, name):
    shutil.copy(src, f'{D}/{name}'); files[name] = name; return name
sec = []
for i in ids:
    r, b = R[i], B[i]; lv = b['lv']; d = f'out/{lv}/{i}'
    nm = f"{'Little Seed' if lv == 'LS' else 'Seedling'} · Unit {b['unit']} · Vè {b['bai']}"
    rows = []
    for k, dg in enumerate(r['dong'], 1):
        fl = []
        for l in ('en', 'zh'):
            for x in dg['info'][l]:
                fl += [f"{l.upper()} {x['giong']}: {c}" for c in ([x['co']] if x['co'] else []) + x['kiem']]
        rows.append(f"""<tr><td class="n">{k}</td><td class="w">{html.escape(dg['vai'])}</td>
<td><div>{html.escape(dg['en'])}</div><audio controls preload="none" src="{f(f'{d}/en_{k:02d}.mp3', f'{i}_en_{k:02d}.mp3')}"></audio></td>
<td><div class="zh">{html.escape(dg['zh'])}</div><audio controls preload="none" src="{f(f'{d}/zh_{k:02d}.mp3', f'{i}_zh_{k:02d}.mp3')}"></audio></td>
<td class="fl">{'<br>'.join(html.escape(x) for x in fl) or '✓'}</td></tr>""")
    sec.append(f"""<section><h2>{nm} · {html.escape(b['ten'][0])} <span class="zh">{html.escape(b['ten'][1])}</span></h2>
<p class="meta">{r['bpm']} nhịp/phút · tiếng Anh {r['en']['dur']} giây · tiếng Trung {r['zh']['dur']} giây</p>
<div class="big"><label>Tiếng Anh – mẫu<audio controls preload="none" src="{f(f'{d}/en_mau.mp3', f'{i}_en_mau.mp3')}"></audio></label>
<label>Tiếng Trung – mẫu<audio controls preload="none" src="{f(f'{d}/zh_mau.mp3', f'{i}_zh_mau.mp3')}"></audio></label>
<label>Nhạc vỗ tay (không lời)<audio controls preload="none" src="{f(f'{d}/nhac.mp3', f'{i}_nhac.mp3')}"></audio></label></div>
<details><summary>Nghe từng dòng</summary><div class="tw"><table><thead><tr><th>#</th><th>Ai</th><th>Tiếng Anh</th><th>Tiếng Trung</th><th>Máy kiểm</th></tr></thead><tbody>{''.join(rows)}</tbody></table></div></details></section>""")
tpl = open('trang_tpl.html').read()
open(f'{D}/index.html', 'w').write(tpl.replace('%%BODY%%', '\n'.join(sec)))
json.dump(files, open(f'{D}/files.json', 'w'))
print(len(files), 'file')
