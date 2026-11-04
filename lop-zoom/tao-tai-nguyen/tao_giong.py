"""Tạo giọng cô Hươu cho Lớp Zoom (Gemini TTS, giọng Sulafat – cùng bộ giọng web học).
Dùng:  python3 tao_giong.py <tệp_chứa_khoá> [tên_file ...]
Khoá Gemini chỉ đọc từ tệp truyền vào, không ghi vào repo. Kết quả: ../../xem-truoc/tai-nguyen/little-seed/audio/<file>.mp3
"""
import base64, json, sys, time, urllib.request, urllib.error
sys.path.insert(0, str(__import__("pathlib").Path(__file__).parent))
from pathlib import Path

HERE = Path(__file__).parent
OUT = HERE.parent.parent / "xem-truoc" / "tai-nguyen" / "little-seed" / "audio"
KEY = Path(sys.argv[1]).read_text().strip()
ONLY = set(sys.argv[2:])
from tao_giong_lib import MODEL, VOICE, STYLE, to_mp3

def tts(text, lang):
    body = {"contents": [{"parts": [{"text": STYLE[lang] + text}]}],
            "generationConfig": {"responseModalities": ["AUDIO"],
                                 "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": VOICE}}}}}
    req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent",
                                 data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "x-goog-api-key": KEY})
    for attempt in range(5):
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                d = json.load(r)
            return base64.b64decode(d["candidates"][0]["content"]["parts"][0]["inlineData"]["data"])
        except urllib.error.HTTPError as e:
            print("  lỗi", e.code, e.read()[:200]); time.sleep(5 * (attempt + 1))
        except Exception as e:
            print("  lỗi", e); time.sleep(5 * (attempt + 1))
    return None

jobs = json.loads((HERE / "giong.json").read_text(encoding="utf-8"))
ok = []
for j in jobs:
    if ONLY and j["file"] not in ONLY: continue
    dst = OUT / j["file"]
    print(j["file"], "|", j["text"])
    pcm = tts(j["text"], j["lang"])
    if not pcm: print("  BỎ QUA"); continue
    to_mp3(pcm, dst); ok.append(j)
    time.sleep(1.2)
(HERE / "giong_xong.json").write_text(json.dumps(ok, ensure_ascii=False, indent=1), encoding="utf-8")
print("xong", len(ok), "/", len(jobs))
