"""Nhạc nền cho chant: 4 giai điệu dân gian hết bản quyền, tổng hợp bằng numpy (không dùng bản thu của ai).
Xuất seedling/day/nhac/<giai-dieu>.mp3: 4 tiếng gõ đếm nhịp + giai điệu chơi 2 lần."""
import numpy as np, subprocess, wave
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / 'day' / 'nhac'
OUT.mkdir(parents=True, exist_ok=True)
SR = 44100
N = {'C3': 48, 'G3': 55, 'C': 60, 'D': 62, 'E': 64, 'F': 65, 'G': 67, 'A': 69, 'B': 71, 'C5': 72}

# (nốt, số phách); 'R' = nghỉ
TUNES = {
    'twinkle': (104, 'C C G G A A G:2 F F E E D D C:2 G G F F E E D:2 G G F F E E D:2 C C G G A A G:2 F F E E D D C:2'),
    'frere': (112, 'C D E C C D E C E F G:2 E F G:2 G:.5 A:.5 G:.5 F:.5 E C G:.5 A:.5 G:.5 F:.5 E C C G3 C:2 C G3 C:2'),
    'london': (108, 'G:.75 A:.25 G F E F G:2 D E F:2 E F G:2 G:.75 A:.25 G F E F G:2 D:2 G:2 E C:2'),
    'row': (96, 'C:1.5 C:1.5 C D:.5 E:1.5 E D:.5 E F:.5 G:3 C5:.5 C5:.5 C5:.5 G:.5 G:.5 G:.5 E:.5 E:.5 E:.5 C:.5 C:.5 C:.5 G F:.5 E D:.5 C:3'),
}


def tone(midi, dur):
    f = 440 * 2 ** ((midi - 69) / 12)
    t = np.arange(int(SR * dur)) / SR
    env = np.exp(-3.2 * t) * np.minimum(1, t / 0.01)
    w = sum(a * np.sin(2 * np.pi * f * k * t) for k, a in ((1, 1), (2, .45), (3, .2), (4, .1)))
    bass = 0.25 * np.sin(2 * np.pi * f / 2 * t) * np.exp(-2 * t)
    return (w + bass) * env


def click(dur):
    t = np.arange(int(SR * dur)) / SR
    return 0.4 * np.sin(2 * np.pi * 1600 * t) * np.exp(-60 * t)


for name, (bpm, seq) in TUNES.items():
    beat = 60 / bpm
    parts = [click(beat) for _ in range(4)]
    for _ in range(2):
        for tok in seq.split():
            n, _, d = tok.partition(':')
            d = float(d or 1)
            parts.append(tone(N[n], d * beat))
    y = np.concatenate(parts)
    y = (y / np.abs(y).max() * 0.8 * 32767).astype(np.int16)
    wav = OUT / f'{name}.wav'
    with wave.open(str(wav), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(y.tobytes())
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(wav), '-b:a', '96k', str(OUT / f'{name}.mp3')], check=True)
    wav.unlink()
    print(name, round(len(y) / SR, 1), 's')
