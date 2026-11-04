"""Phần dùng chung cho việc tạo giọng (gọi thường hoặc Batch)."""
import subprocess
from pathlib import Path
HERE = Path(__file__).parent
OUT = HERE.parent.parent / "xem-truoc" / "tai-nguyen" / "little-seed" / "audio"
MODEL = "gemini-3.8-flash-tts"
VOICE = "Sulafat"
STYLE = {   # mô hình 3.8 đọc to cả lời chỉ dẫn, nên chỉ gửi đúng câu cần đọc (giọng Sulafat đã cố định)
    "vi": "",
    "zh": "",
}


def to_mp3(pcm, dst):
    raw = dst.with_suffix(".pcm"); raw.write_bytes(pcm)
    # cắt lặng đầu/cuối, làm mờ 30 ms cuối để không có tiếng "rẹt"
    af = ("silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,"
          "areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,afade=t=in:d=0.03,areverse,"
          "afade=t=in:d=0.01,apad=pad_dur=0.12")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", str(raw),
                    "-af", af, "-ar", "24000", "-ac", "1", "-b:a", "64k", str(dst)], check=True)
    raw.unlink()

