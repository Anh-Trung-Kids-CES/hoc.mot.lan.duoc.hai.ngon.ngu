"""Gửi việc theo Batch (≤250 việc/lô). python3 gui.py"""
import json, bat
J = json.load(open('jobs.json'))
def req(j):
    return {'contents': [{'parts': [{'text': j['prompt']}]}], 'generationConfig': {'responseModalities': ['AUDIO'],
            'speechConfig': {'voiceConfig': {'prebuiltVoiceConfig': {'voiceName': j['voice'].capitalize()}}}}}
done = set()
try: done = {k for b in json.load(open('batches.json')) for k in b['keys']}
except FileNotFoundError: pass
B = json.load(open('batches.json')) if done else []
todo = [j for j in J if j['key'] not in done]
for i in range(0, len(todo), 250):
    part = todo[i:i + 250]
    d = bat.submit(part[0]['model'], [(j['key'], req(j)) for j in part], f've48_{len(B)}')
    B.append(dict(name=d['name'], n=len(part), keys=[j['key'] for j in part])); print(d['name'], len(part), flush=True)
    json.dump(B, open('batches.json', 'w'), indent=1)
