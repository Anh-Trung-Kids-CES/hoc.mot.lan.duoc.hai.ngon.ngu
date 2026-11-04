"""Vẽ ảnh biểu cảm cho trận "Cả lớp đấu Rồng Lửa" bằng Gemini (ảnh gốc làm mẫu để giữ đúng nhân vật).
Dùng:  python3 tao_hinh.py <tệp_chứa_khoá> [khoá_BOSS_V ...]
Kết quả: ../../xem-truoc/tai-nguyen/qua/zoom_*.webp (nền trong suốt). Khoá Gemini chỉ đọc từ tệp, không ghi vào repo.
"""
import base64, json, sys, time, urllib.request, urllib.error
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

HERE = Path(__file__).parent
QUA = HERE.parent.parent / "xem-truoc" / "tai-nguyen" / "qua"
KEY = Path(sys.argv[1]).read_text().strip()
ONLY = set(sys.argv[2:])
from tao_hinh_lib import STYLE, JOBS, QUA, cut_white

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

model = pick_model(); done = {}
for key, ref, out, prompt in JOBS:
    if ONLY and key not in ONLY: continue
    print(key, "→", out)
    png = draw(model, QUA / ref, prompt)
    if not png: print("  BỎ QUA"); continue
    cut_white(png).save(QUA / out, "WEBP", quality=88); done[key] = "qua/" + out
(HERE / "hinh_xong.json").write_text(json.dumps(done, ensure_ascii=False, indent=1), encoding="utf-8")
print("xong", done)
