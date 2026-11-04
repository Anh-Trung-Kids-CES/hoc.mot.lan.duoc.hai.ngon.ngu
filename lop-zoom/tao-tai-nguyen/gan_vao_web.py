"""Gắn các file giọng / ảnh đã tạo xong vào web Lớp Zoom (HD trong lz-core.js, BOSS_V trong lz-boss.js)."""
import json, re
from pathlib import Path
HERE = Path(__file__).parent; LZ = HERE.parent
AUD = LZ.parent / "xem-truoc" / "tai-nguyen" / "little-seed" / "audio"
QUA = LZ.parent / "xem-truoc" / "tai-nguyen" / "qua"

core = (LZ / "lz-core.js").read_text(encoding="utf-8")
jobs = json.loads((HERE / "giong.json").read_text(encoding="utf-8"))
add = []
for j in jobs:
    if j["lang"] != "vi" or not (AUD / j["file"]).exists(): continue
    if f"'{j['text']}':" in core: continue
    add.append(f"  '{j['text']}': AU + '{j['file']}',")
if add:
    core = core.replace("  'Con nghe lại nhé.': AU + 'ls_co_huou_vi_024.mp3',\n",
                        "  'Con nghe lại nhé.': AU + 'ls_co_huou_vi_024.mp3',\n  /* Lớp Zoom (thu 04/11/2026) */\n" + "\n".join(add) + "\n", 1)
if (AUD / "ls_co_huou_zh_jiao.mp3").exists():
    core = core.replace("k: 'mna', a: '' },", "k: 'mna', a: AU + 'ls_co_huou_zh_jiao.mp3' },")
    core = core.replace("function toneAudio(x) { return x.a === '' ? '' : aud(x.k, 'zh'); }", "function toneAudio(x) { return x.a !== undefined ? x.a : aud(x.k, 'zh'); }")
(LZ / "lz-core.js").write_text(core, encoding="utf-8")

boss = (LZ / "lz-boss.js").read_text(encoding="utf-8")
for key, f in [("heroWin", "zoom_bong_thang.webp"), ("heroHurt", "zoom_bong_lui.webp"), ("monAngry", "zoom_rong_gian.webp"), ("monDizzy", "zoom_rong_choang.webp")]:
    if (QUA / f).exists():
        boss = re.sub(rf"(\s{key}: )''", rf"\1'qua/{f}'", boss, count=1)
(LZ / "lz-boss.js").write_text(boss, encoding="utf-8")
print("đã gắn", len(add), "câu giọng")
