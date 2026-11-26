"""Thu lời cô Hươu (tiếng Việt) còn thiếu cho Phòng đổi quà – web lớp offline (26/11/2026).
Cấu hình như skill game-doi-thuong-hoc-sao: Gemini gemini-2.5-pro-preview-tts, giọng Sulafat, thêm "Đọc đúng từng chữ".
Xuất mp3 mono 24 kHz 64 kbps, cắt khoảng lặng, vào seedling/tai-nguyen/huong-dan-qua/. Soát: cho gemini-2.5-flash
nghe chép lại lời, so với câu gốc.
Dùng (ở thư mục gốc kho):  python3 chung/qua/thu_giong_qua.py <tệp_chứa_khoá_ngoài_kho>
Khoá chỉ đọc từ tệp truyền vào, không bao giờ ghi vào kho. Câu nào đã có tệp thì bỏ qua (không tốn tiền gọi lại).
Thu xong nhớ thêm câu → tệp vào bảng ở cuối chung/qua/qua-sau.js."""
import base64, json, subprocess, sys, tempfile, unicodedata, re, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "seedling" / "tai-nguyen" / "huong-dan-qua"
MODEL = "gemini-2.5-pro-preview-tts"
VOICE = "Sulafat"
CAU = {
    "qua_hd_01.mp3": "Con chạm vào quái vật, luyện chiêu mỗi ngày, học xong mỗi Unit thì đánh Rồng trùm nhé!",
    "qua_hd_02.mp3": "Mỗi ngày con học xong, trứng lại nứt thêm một chút.",
}
API = "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent?key={}"


def goi(model, key, body):
    req = urllib.request.Request(API.format(model, key), data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=180) as r:
        return json.loads(r.read())


def thu(key, text):
    body = {"contents": [{"parts": [{"text": "Đọc đúng từng chữ: " + text}]}],
            "generationConfig": {"responseModalities": ["AUDIO"],
                                 "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": VOICE}}}}}
    d = goi(MODEL, key, body)
    return base64.b64decode(d["candidates"][0]["content"]["parts"][0]["inlineData"]["data"])   # PCM 16-bit 24 kHz mono


def ra_mp3(pcm, dst):
    with tempfile.NamedTemporaryFile(suffix=".pcm") as f:
        f.write(pcm); f.flush()
        af = ("silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,"
              "areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.15,areverse")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", f.name,
                        "-af", af, "-ar", "24000", "-ac", "1", "-b:a", "64k", str(dst)], check=True)


def chep_lai(key, mp3):
    body = {"contents": [{"parts": [
        {"inlineData": {"mimeType": "audio/mp3", "data": base64.b64encode(mp3.read_bytes()).decode()}},
        {"text": "Chép lại chính xác lời tiếng Việt trong đoạn ghi âm. Chỉ trả về lời, không thêm gì."}]}]}
    d = goi("gemini-2.5-flash", key, body)
    return d["candidates"][0]["content"]["parts"][0]["text"].strip()


def chuan(s):
    s = unicodedata.normalize("NFC", s.lower())
    return re.sub(r"[^\w\s]", "", s).split()


def main():
    key = Path(sys.argv[1]).read_text().strip()
    OUT.mkdir(parents=True, exist_ok=True)
    for ten, text in CAU.items():
        dst = OUT / ten
        if dst.exists():
            print("đã có", ten); continue
        ra_mp3(thu(key, text), dst)
        nghe = chep_lai(key, dst)
        khop = chuan(nghe) == chuan(text)
        print(("KHỚP " if khop else "LỆCH ") + ten + " | gốc: " + text + " | nghe: " + nghe)


if __name__ == "__main__":
    main()
