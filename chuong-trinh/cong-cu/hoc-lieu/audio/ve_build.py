"""Gộp vè vào workbook (không tốn thêm TTS): ghép audio từng dòng vè có sẵn thành 1 track/bài (EN rồi ZH), ghi HL.ve vào data js.
python3 ve_build.py <LS|SD> <data.js> <nghe/audio dir>   (chạy ở gốc repo)"""
import sys, json, os, re, subprocess
L, datajs, outdir = sys.argv[1], sys.argv[2], sys.argv[3]
lv = L.lower(); base = 'chuong-trinh/ve48/'
s = open(f'{base}ve48-{lv}.js', encoding='utf8').read()
j = json.loads(s[s.find('{'):s.rfind('}') + 1])
SR = 24000
def pcm(p):
    return subprocess.run(['ffmpeg', '-v', 'quiet', '-i', p, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
def sil(sec): return b'\0\0' * int(SR * sec)
ve = {}
os.makedirs(outdir, exist_ok=True)
for k, b in j['bai'].items():
    m = re.match(r'(ls|sd)(\d\d)([ab])$', k)
    if not m: continue            # bộ "de" (sddea) không thuộc unit nào
    u = str(int(m.group(2)))
    en = [' '.join(d['w_en']) for d in b['dong']]; zh = [''.join(d['w_zh']) for d in b['dong']]; py = [d['py'] for d in b['dong']]
    ve.setdefault(u, []).append(dict(id=f've-{lv}-{m.group(2)}{m.group(3)}', ab=m.group(3).upper(), ten=b['ten'], ten_zh=b['ten_zh'], en=en, zh=zh, py=py))
    buf = b''
    for lang in ('en', 'zh'):
        for d in b['dong']:
            buf += pcm(f"{base}audio/{d['a_'+lang]}") + sil(.5)
        buf += sil(1.0)
    out = f"{outdir}/ve-{lv}-{m.group(2)}{m.group(3)}.mp3"
    subprocess.run(['ffmpeg', '-y', '-v', 'quiet', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', '-', '-b:a', '48k', out], input=buf, check=True)
t = open(datajs, encoding='utf8').read()
t = re.sub(r'\n/\*VE\*/.*?(?=\n/\*QR\*/|$)', '', t, flags=re.S)
if '/*QR*/' in t: t = t.replace('\n/*QR*/', '\n/*VE*/HL.ve=' + json.dumps(ve, ensure_ascii=False) + ';\n/*QR*/', 1)
else: t += '\n/*VE*/HL.ve=' + json.dumps(ve, ensure_ascii=False) + ';\n'
open(datajs, 'w', encoding='utf8').write(t)
print(L, sum(len(v) for v in ve.values()), 'bài vè')
