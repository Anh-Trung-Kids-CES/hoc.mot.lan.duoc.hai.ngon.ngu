import subprocess
def to_wav(raw, mime, dst):
    rate = mime.split('rate=')[1].split(';')[0] if 'rate=' in (mime or '') else '24000'
    inp = ['-i', 'pipe:0'] if raw[:4] == b'RIFF' else ['-f', 's16le', '-ar', rate, '-ac', '1', '-i', 'pipe:0']
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *inp, '-ac', '1', '-ar', '24000', dst], input=raw, check=True)
