"""Gửi việc tạo giọng / vẽ ảnh qua Gemini Batch API (rẻ hơn 50% so với gọi thường), chờ xong rồi lưu kết quả.
Dùng:
  python3 batch.py <khoá> giong   [tên_file ...]   # 35 câu giọng cô Hươu (giong.json)
  python3 batch.py <khoá> hinh    [khoá_BOSS_V ...] # 4 ảnh biểu cảm trận Rồng Lửa
Khoá chỉ đọc từ tệp, không ghi vào repo.
"""
import base64, json, sys, time, urllib.request, urllib.error
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

HERE = Path(__file__).parent
KEY = Path(sys.argv[1]).read_text().strip()
KIND = sys.argv[2]
ONLY = set(sys.argv[3:])
API = "https://generativelanguage.googleapis.com/v1beta/"

def call(path, body=None, method=None):
    req = urllib.request.Request(API + path, data=json.dumps(body).encode() if body is not None else None,
                                 headers={"Content-Type": "application/json", "x-goog-api-key": KEY}, method=method)
    try:
        return json.load(urllib.request.urlopen(req, timeout=300))
    except urllib.error.HTTPError as e:
        raise SystemExit(f"Lỗi {e.code}: {e.read()[:400]}")

if KIND == "giong":
    from tao_giong_lib import STYLE, VOICE, MODEL, to_mp3, OUT
    jobs = [j for j in json.loads((HERE / "giong.json").read_text(encoding="utf-8")) if not ONLY or j["file"] in ONLY]
    reqs = [{"request": {"contents": [{"parts": [{"text": STYLE[j["lang"]] + j["text"]}]}],
                         "generationConfig": {"responseModalities": ["AUDIO"],
                                              "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": VOICE}}}}},
             "metadata": {"key": j["file"]}} for j in jobs]
else:
    from tao_hinh_lib import JOBS, STYLE, MODEL, QUA, cut_white
    jobs = [j for j in JOBS if not ONLY or j[0] in ONLY]
    reqs = [{"request": {"contents": [{"parts": [{"inlineData": {"mimeType": "image/webp", "data": base64.b64encode((QUA / ref).read_bytes()).decode()}},
                                                 {"text": STYLE + " " + prompt}]}],
                         "generationConfig": {"responseModalities": ["IMAGE"]}},
             "metadata": {"key": key}} for key, ref, out, prompt in jobs]

op = call(f"models/{MODEL}:batchGenerateContent", {"batch": {"display_name": f"lop-zoom-{KIND}", "input_config": {"requests": {"requests": reqs}}}})
name = op.get("name") or op.get("metadata", {}).get("name")
print("đã gửi", len(reqs), "việc:", name, flush=True)
while True:
    time.sleep(20)
    b = call(name)
    st = (b.get("metadata") or b).get("state", "")
    print(time.strftime("%H:%M:%S"), st, flush=True)
    if st.endswith("SUCCEEDED") or b.get("done"): break
    if st.endswith(("FAILED", "CANCELLED", "EXPIRED")): raise SystemExit("Batch không thành: " + st)

resp = (b.get("response") or (b.get("metadata") or {}).get("output") or {})
items = resp.get("inlinedResponses", {}).get("inlinedResponses", []) if isinstance(resp.get("inlinedResponses"), dict) else resp.get("inlinedResponses", [])
done, fail = [], []
for it in items:
    key = (it.get("metadata") or {}).get("key")
    try:
        parts = it["response"]["candidates"][0]["content"]["parts"]
        data = next(base64.b64decode(p["inlineData"]["data"]) for p in parts if "inlineData" in p)
    except Exception:
        fail.append(key); continue
    if KIND == "giong":
        to_mp3(data, OUT / key); done.append(key)
    else:
        out = next(o for k, r, o, p in jobs if k == key)
        cut_white(data).save(QUA / out, "WEBP", quality=88); done.append(key)
(HERE / f"{KIND}_xong.json").write_text(json.dumps({"xong": done, "loi": fail}, ensure_ascii=False, indent=1), encoding="utf-8")
print("xong", len(done), "lỗi", fail)
