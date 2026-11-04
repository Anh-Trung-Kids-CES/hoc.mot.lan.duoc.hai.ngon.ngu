"""Tạo giọng cô Hươu cho Lớp Zoom (Gemini TTS, giọng Sulafat – cùng bộ giọng web học).
Dùng:  python3 tao_giong.py <tệp_chứa_khoá> [tên_file ...]
Khoá Gemini chỉ đọc từ tệp truyền vào, không ghi vào repo. Kết quả: ../../xem-truoc/tai-nguyen/little-seed/audio/<file>.mp3
"""
import base64, json, subprocess, sys, time, urllib.request, urllib.error
from pathlib import Path

HERE = Path(__file__).parent
OUT = HERE.parent.parent / "xem-truoc" / "tai-nguyen" / "little-seed" / "audio"
KEY = Path(sys.argv[1]).read_text().strip()
ONLY = set(sys.argv[2:])
MODEL = "gemini-3.8-flash-tts"
VOICE = "Sulafat"
STYLE = {
    "vi": ("Bạn là cô Hươu, cô giáo mầm non người Việt, giọng nữ miền Bắc ấm áp, vui tươi, trìu mến, "
           "đang nói với các bé 5–7 tuổi trong lớp học trực tuyến. Đọc chậm vừa, rõ từng chữ, ngữ điệu khích lệ. "
           "Chỉ đọc đúng câu sau, không thêm chữ nào:\n"),
    "zh": ("You are a warm kindergarten teacher reading one Mandarin Chinese character slowly and clearly in standard "
           "Putonghua for young learners, with a clear falling fourth tone. Read only this, nothing else:\n"),
}

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

def to_mp3(pcm, dst):
    raw = dst.with_suffix(".pcm"); raw.write_bytes(pcm)
    # cắt lặng đầu/cuối, làm mờ 30 ms cuối để không có tiếng "rẹt"
    af = ("silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,"
          "areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,afade=t=in:d=0.03,areverse,"
          "afade=t=in:d=0.01,apad=pad_dur=0.12")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", str(raw),
                    "-af", af, "-ar", "24000", "-ac", "1", "-b:a", "64k", str(dst)], check=True)
    raw.unlink()

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
