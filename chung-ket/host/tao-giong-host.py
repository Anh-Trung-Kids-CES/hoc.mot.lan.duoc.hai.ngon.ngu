"""Thu giọng mẫu cho trang Luyện host (Gemini TTS, một giọng người lớn cho cả tiếng Anh và tiếng Trung).
Dùng:
  python3 tao-giong-host.py <tệp_chứa_khoá>              thu tất cả câu chưa có tệp
  python3 tao-giong-host.py <tệp_chứa_khoá> MM1|en K3|zh  chỉ thu lại các câu này (câu nghe lỗi)
  python3 tao-giong-host.py --liet-ke                     chỉ cập nhật host-audio.js theo các tệp đang có
Khoá Gemini chỉ đọc từ tệp truyền vào, không ghi vào repo. Câu lấy từ host-data.js (cùng thư mục).
Mỗi câu gửi đúng chữ cần đọc, không kèm lời dặn (mô hình sẽ đọc to cả lời dặn).
Nhịp cho trẻ nhỏ: không dặn mô hình (nó đọc to lời dặn) mà chỉnh sau khi thu. Đo tốc độ từng câu,
câu nào nhanh hơn mức đích thì kéo chậm lại (giữ nguyên cao độ, thanh điệu), thêm khoảng nghỉ ở dấu câu đã có sẵn.
Bản thu gốc giữ ở audio-goc/ (không đưa lên repo) để chỉnh nhịp lại không tốn tiền gọi Gemini:
  python3 tao-giong-host.py --chinh-nhip                  làm lại toàn bộ mp3 từ bản gốc
"""
import base64, json, re, subprocess, sys, time, urllib.request, urllib.error
from pathlib import Path

HERE = Path(__file__).parent
OUT = HERE / "audio"
RAW = HERE / "audio-goc"        # bản thu gốc từ Gemini (PCM 24 kHz), có trong .gitignore
# Tốc độ đích, đo trên phần có tiếng (đã cắt lặng đầu/cuối): tiếng Anh theo từ/giây, tiếng Trung theo chữ Hán/giây.
# Người lớn nói với trẻ nhỏ: khoảng 2,2 từ/giây (≈130 từ/phút) và 3 chữ/giây; câu đã chậm hơn thì để nguyên.
DICH = {"en": 2.2, "zh": 3.0}
CHAM_NHAT = 0.78                # không kéo chậm quá mức này để giọng không bị méo
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


def do_dai(pcm):
    """Số giây có tiếng (bỏ lặng đầu/cuối)."""
    import numpy as np
    x = np.frombuffer(pcm, dtype=np.int16).astype(np.float32) / 32768
    f = 24000 // 50
    e = np.array([np.sqrt(np.mean(x[i:i + f] ** 2) + 1e-12) for i in range(0, len(x) - f, f)])
    on = np.where(20 * np.log10(e) > -40)[0]
    return (on[-1] - on[0] + 1) / 50 if len(on) else len(x) / 24000


def so_don_vi(text, lang):
    return len(re.findall(r"[\u4e00-\u9fff]", text)) if lang == "zh" else len(re.findall(r"[A-Za-z']+", text))


def lam_mp3(k, text):
    lang = k.split("|")[1]
    pcm = (RAW / (fname(k)[:-4] + ".pcm")).read_bytes()
    toc = so_don_vi(text, lang) / max(do_dai(pcm), 0.3)
    he = min(1.0, max(CHAM_NHAT, DICH[lang] / toc)) if toc > 0 else 1.0
    if he < 0.995:
        pcm = subprocess.run(["ffmpeg", "-loglevel", "error", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", "-",
                              "-af", f"atempo={he:.3f}", "-f", "s16le", "-ar", "24000", "-ac", "1", "-"],
                             input=pcm, capture_output=True, check=True).stdout
    from tao_giong_lib import to_mp3
    to_mp3(pcm, OUT / fname(k))
    return toc, he


if __name__ == "__main__":
    if sys.argv[1:2] == ["--liet-ke"]:
        liet_ke(); sys.exit()
    if sys.argv[1:2] == ["--chinh-nhip"]:
        OUT.mkdir(exist_ok=True)
        for k, t in lines():
            if (RAW / (fname(k)[:-4] + ".pcm")).exists():
                toc, he = lam_mp3(k, t); print(f"{k:8} tốc độ gốc {toc:.2f} → hệ số {he:.2f}")
        liet_ke(); sys.exit()
    KEY = Path(sys.argv[1]).read_text().strip()
    ONLY = set(sys.argv[2:])
    OUT.mkdir(exist_ok=True); RAW.mkdir(exist_ok=True)
    jobs = [(k, t) for k, t in lines() if (k in ONLY) or (not ONLY and not (OUT / fname(k)).exists())]
    print("cần thu", len(jobs), "câu")
    for k, t in jobs:
        print(k, "|", t)
        pcm = tts(KEY, t)
        if not pcm:
            print("  BỎ QUA"); continue
        (RAW / (fname(k)[:-4] + ".pcm")).write_bytes(pcm)
        toc, he = lam_mp3(k, t)
        print(f"  tốc độ gốc {toc:.2f} → hệ số {he:.2f}")
        time.sleep(1.2)
    liet_ke()
