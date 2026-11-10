"""Thu giọng mẫu cho trang Luyện host (Gemini TTS, một giọng người lớn cho cả tiếng Anh và tiếng Trung).
Dùng:
  python3 tao-giong-host.py <tệp_chứa_khoá>              thu tất cả câu chưa có tệp
  python3 tao-giong-host.py <tệp_chứa_khoá> MM1|en K3|zh  chỉ thu lại các câu này (câu nghe lỗi)
  python3 tao-giong-host.py --liet-ke                     chỉ cập nhật host-audio.js theo các tệp đang có
Khoá Gemini chỉ đọc từ tệp truyền vào, không ghi vào repo. Câu lấy từ host-data.js (cùng thư mục).
Mỗi câu gửi đúng chữ cần đọc, không kèm lời dặn (mô hình sẽ đọc to cả lời dặn).
"""
import base64, json, re, subprocess, sys, time, urllib.request, urllib.error
from pathlib import Path

HERE = Path(__file__).parent
OUT = HERE / "audio"
sys.path.insert(0, str(HERE.parent.parent / "lop-zoom" / "tao-tai-nguyen"))
MODEL = "gemini-3.8-flash-tts"   # cùng mô hình đã thu giọng web học
VOICE = "Puck"                   # giọng người lớn, vui, nhiều năng lượng – hợp người dẫn chương trình


def lines():
    js = (HERE / "host-data.js").read_text(encoding="utf-8")
    raw = js[js.index("const HOST_RAW"):js.index("const HOST_LINES")]
    raw = raw[raw.index("["):raw.rindex("]") + 1]
    raw = re.sub(r"//.*", "", raw)
    data = json.loads(subprocess.run(["node", "-e", f"console.log(JSON.stringify({raw}))"], capture_output=True, text=True, check=True).stdout)
    out = []
    for r in data:
        out.append((r[0] + "|en", r[3]))
        out.append((r[0] + "|zh", r[4]))
    return out


def fname(key):
    c, lang = key.split("|")
    return c.lower() + "_" + lang + ".mp3"


def liet_ke():
    m = {k: fname(k) for k, _ in lines() if (OUT / fname(k)).exists()}
    body = ("/* Danh sách giọng mẫu đã thu (tệp sinh tự động bởi tao-giong-host.py, không sửa tay).\n"
            "   Khóa: \"<mã câu>|en\" hoặc \"<mã câu>|zh\" → tên tệp trong chung-ket/host/audio/.\n"
            "   Câu chưa có tệp thì trang tạm đọc bằng giọng của trình duyệt (ghi rõ \"giọng tạm\"). */\n"
            "const HOST_AUDIO = " + json.dumps(m, ensure_ascii=False, indent=1) + ";\n")
    (HERE / "host-audio.js").write_text(body, encoding="utf-8")
    print("host-audio.js:", len(m), "tệp")


def tts(key, text):
    body = {"contents": [{"parts": [{"text": text}]}],
            "generationConfig": {"responseModalities": ["AUDIO"],
                                 "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": VOICE}}}}}
    req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent",
                                 data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "x-goog-api-key": key})
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


if __name__ == "__main__":
    if sys.argv[1:2] == ["--liet-ke"]:
        liet_ke(); sys.exit()
    from tao_giong_lib import to_mp3
    KEY = Path(sys.argv[1]).read_text().strip()
    ONLY = set(sys.argv[2:])
    OUT.mkdir(exist_ok=True)
    jobs = [(k, t) for k, t in lines() if (k in ONLY) or (not ONLY and not (OUT / fname(k)).exists())]
    print("cần thu", len(jobs), "câu")
    for k, t in jobs:
        print(k, "|", t)
        pcm = tts(KEY, t)
        if not pcm:
            print("  BỎ QUA"); continue
        to_mp3(pcm, OUT / fname(k))
        time.sleep(1.2)
    liet_ke()
