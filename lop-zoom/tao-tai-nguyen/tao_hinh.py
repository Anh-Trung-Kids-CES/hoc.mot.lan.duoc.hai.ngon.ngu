"""Vẽ ảnh biểu cảm cho trận "Cả lớp đấu Rồng Lửa" bằng Gemini (ảnh gốc làm mẫu để giữ đúng nhân vật).
Dùng:  python3 tao_hinh.py <tệp_chứa_khoá> [khoá_BOSS_V ...]
Kết quả: ../../xem-truoc/tai-nguyen/qua/zoom_*.webp (nền trong suốt). Khoá Gemini chỉ đọc từ tệp, không ghi vào repo.
"""
import base64, io, json, sys, time, urllib.request, urllib.error
from pathlib import Path
from PIL import Image

HERE = Path(__file__).parent
QUA = HERE.parent.parent / "xem-truoc" / "tai-nguyen" / "qua"
KEY = Path(sys.argv[1]).read_text().strip()
ONLY = set(sys.argv[2:])
STYLE = ("Children's picture-book 2D cartoon, same line art, colours and proportions as the reference image. "
         "Keep exactly the same character: same face, hair, outfit and colours. Full body, centred, "
         "plain pure white background (#FFFFFF), no ground shadow, no text, no frame. Cute and gentle for 5-7 year olds, nothing scary.")
JOBS = [
    ("heroWin", "ava_bong_sieu_nhan.webp", "zoom_bong_thang.webp", "The superhero girl cheers happily, one fist raised to the sky, big open smile, eyes sparkling."),
    ("heroHurt", "ava_bong_sieu_nhan.webp", "zoom_bong_lui.webp", "The superhero girl leans back a little, both hands raised to block, determined straining face, not injured."),
    ("monAngry", "mon_lua_3.webp", "zoom_rong_gian.webp", "The little fire dragon puffs its cheeks, frowns with cute angry eyebrows and blows a small playful flame."),
    ("monDizzy", "mon_lua_3.webp", "zoom_rong_choang.webp", "The little fire dragon is dizzy: swirly spiral eyes, little stars circling its head, sitting down, wobbly."),
]

def pick_model():
    req = urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models?pageSize=200", headers={"x-goog-api-key": KEY})
    ms = [m["name"].split("/")[-1] for m in json.load(urllib.request.urlopen(req, timeout=60)).get("models", [])]
    cand = [m for m in ms if "image" in m and "imagen" not in m]
    cand.sort(key=lambda m: ("preview" in m, m), reverse=False)
    print("mô hình vẽ có:", cand)
    return cand[-1]

def draw(model, ref, prompt):
    body = {"contents": [{"parts": [{"inlineData": {"mimeType": "image/webp", "data": base64.b64encode(ref.read_bytes()).decode()}},
                                    {"text": STYLE + " " + prompt}]}],
            "generationConfig": {"responseModalities": ["IMAGE"]}}
    req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                                 data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "x-goog-api-key": KEY})
    for attempt in range(4):
        try:
            d = json.load(urllib.request.urlopen(req, timeout=300))
            for p in d["candidates"][0]["content"]["parts"]:
                if "inlineData" in p: return base64.b64decode(p["inlineData"]["data"])
            print("  không có ảnh trong kết quả")
        except urllib.error.HTTPError as e:
            print("  lỗi", e.code, e.read()[:200])
        except Exception as e:
            print("  lỗi", e)
        time.sleep(6 * (attempt + 1))
    return None

def cut_white(png):
    """Bỏ nền trắng nối liền với mép ảnh (giữ phần trắng bên trong nhân vật như mắt)."""
    im = Image.open(io.BytesIO(png)).convert("RGBA"); w, h = im.size; px = im.load()
    seen = bytearray(w * h); stack = [(x, y) for x in range(w) for y in (0, h - 1)] + [(x, y) for y in range(h) for x in (0, w - 1)]
    white = lambda c: c[0] > 235 and c[1] > 235 and c[2] > 235
    while stack:
        x, y = stack.pop()
        if x < 0 or y < 0 or x >= w or y >= h or seen[y * w + x]: continue
        seen[y * w + x] = 1
        if not white(px[x, y]): continue
        px[x, y] = (255, 255, 255, 0)
        stack += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    bb = im.getbbox(); im = im.crop(bb) if bb else im
    im.thumbnail((640, 640)); return im

model = pick_model(); done = {}
for key, ref, out, prompt in JOBS:
    if ONLY and key not in ONLY: continue
    print(key, "→", out)
    png = draw(model, QUA / ref, prompt)
    if not png: print("  BỎ QUA"); continue
    cut_white(png).save(QUA / out, "WEBP", quality=88); done[key] = "qua/" + out
(HERE / "hinh_xong.json").write_text(json.dumps(done, ensure_ascii=False, indent=1), encoding="utf-8")
print("xong", done)
