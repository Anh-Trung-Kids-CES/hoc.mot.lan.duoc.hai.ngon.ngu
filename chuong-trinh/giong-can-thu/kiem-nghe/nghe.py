"""Nghe lại file giọng tiếng Trung bằng Whisper medium, so với câu đúng. Chạy ở gốc repo:
python3 -W ignore nghe.py <list.json> <out.json> [số_file]"""
import json, sys, subprocess, time, numpy as np, re
from faster_whisper import WhisperModel
import os
SP = os.environ.get('WHISPER_DIR', '/tmp/whisper')   # nơi lưu mô hình (tải lần đầu từ huggingface.co, *.hf.co)
L = [x for x in json.load(open(sys.argv[1])) if x['exists']]
if len(sys.argv) > 3: L = L[:int(sys.argv[3])]
m = WhisperModel(os.environ.get('WHISPER_MODEL', 'medium'), device='cpu', compute_type='int8', download_root=SP + '/wm', cpu_threads=2)
def load(f):
    raw = subprocess.run(['ffmpeg', '-v', 'quiet', '-i', f, '-f', 's16le', '-ac', '1', '-ar', '16000', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768.0
out = []
for k, x in enumerate(L):
    t = time.time()
    seg, _ = m.transcribe(load(x['file']), language='zh', initial_prompt='以下是普通话的句子。', beam_size=5, condition_on_previous_text=False)
    x['nghe'] = ''.join(s.text for s in seg).strip(); x['giay'] = round(time.time() - t, 1)
    out.append(x)
    if k % 25 == 0: print(k, x['giay'], x['zh'], '→', x['nghe'], flush=True); json.dump(out, open(sys.argv[2], 'w'), ensure_ascii=False)
json.dump(out, open(sys.argv[2], 'w'), ensure_ascii=False)
print('xong', len(out))
