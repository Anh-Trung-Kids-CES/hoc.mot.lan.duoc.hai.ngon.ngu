"""Chơi tự động TOÀN BỘ 99 ngày, mọi bước, đến màn 'làm xong bước'. Ghi: bước bị kẹt, câu phải dùng giọng máy,
file giọng lỗi, lời dặn tiếng Việt thiếu file, số câu mỗi bài, sao ở bước nói khi không có micro."""
import asyncio, json, sys, random, functools, threading, http.server, time
from playwright.async_api import async_playwright
ROOT = '/home/claude/hoc.mot.lan.duoc.hai.ngon.ngu'
NW = int(sys.argv[1]) if len(sys.argv) > 1 else 6
ONLY = [int(x) for x in sys.argv[2].split(',')] if len(sys.argv) > 2 else None
INIT = """
window.__log = {tts: [], fail: [], vi: []};
HTMLMediaElement.prototype.play = function () { const el = this; const src = el.src || '';
  if (!src.startsWith('blob:')) fetch(src, {method: 'HEAD'}).then(r => { if (!r.ok) window.__log.fail.push(src); }).catch(() => window.__log.fail.push(src));
  const s0 = el.src; setTimeout(() => { if (el.src === s0 && el.onended) el.onended(); }, 40); return Promise.resolve(); };
addEventListener('DOMContentLoaded', () => {
  const t0 = window.tts; window.tts = (text, lang) => { window.__log.tts.push(lang + ':' + text); return Promise.resolve(); };
  const s0 = window.say; window.say = async u => { if (u && u.l === 'vi' && u.t && !u.a) window.__log.vi.push(u.t); return s0(u); };
});
"""
async def run_step(pg, n, j, t):
    await pg.evaluate(f"location.hash='#/ngay/{n}/b{j+1}'"); await pg.wait_for_timeout(150)
    go = await pg.query_selector('#go')
    if go: await go.click()
    last, same, t0 = '', 0, time.time()
    clicks = 0
    while time.time() - t0 < 240:
        await pg.wait_for_timeout(350)
        st = await pg.evaluate("""() => { const b = document.getElementById('lsBody'); if (!b) return {h: '', done: false};
          const txt = b.innerText; return {h: b.innerHTML.length + ':' + txt.slice(0, 200), done: /làm xong bước|Xong các bước|hoàn thành ngày|Con học xong ngày/i.test(txt) || !!document.querySelector('.ls-dayend,.day-done,.ls-cele')}; }""")
        if st['done']: return {'ok': True, 'clicks': clicks, 'sec': round(time.time() - t0, 1)}
        same = same + 1 if st['h'] == last else 0; last = st['h']
        acted = await pg.evaluate("""() => { const b = document.getElementById('lsBody'); if (!b) return '';
          const vis = e => e && e.offsetParent !== null && !e.disabled;
          const nx = b.querySelector('#nx'); if (vis(nx) && !/Bỏ qua/.test(nx.innerText)) { nx.click(); return 'nx'; }
          for (const id of ['#go', '#did']) { const e = b.querySelector(id); if (vis(e)) { e.click(); return id; } }
          const opts = [...b.querySelectorAll('.hd-pick,.ls-opt,.sx-opt')].filter(vis).filter(e => !e.classList.contains('right'));
          if (opts.length && !b.querySelector('.hd-pick.right,.ls-opt.right,.sx-opt.right,.hint')) { opts[Math.floor(Math.random() * opts.length)].click(); return 'opt'; }
          const cards = [...b.querySelectorAll('.sx-card,.ls-card')].filter(vis).filter(e => !e.classList.contains('seen') && !e.classList.contains('done') && !e.classList.contains('got'));
          if (cards.length) { cards[0].click(); return 'card'; }
          return ''; }""")
        if acted: clicks += 1
        if same >= 40:   # ~14 giây không đổi
            snap = await pg.evaluate("(document.getElementById('lsCap')||{}).innerText + ' || mic=' + ((document.getElementById('mic')||{}).className||'') + ' || ' + ((document.getElementById('lsBody')||{}).innerText||'')")
            return {'ok': False, 'why': 'stuck', 'clicks': clicks, 'screen': snap[:300]}
    return {'ok': False, 'why': 'timeout', 'clicks': clicks}

async def worker(b, days, out, base):
    pg = await b.new_page(viewport={'width': 1280, 'height': 760}, reduced_motion='reduce')
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.add_init_script(INIT)
    await pg.goto(base + '#/'); await pg.wait_for_timeout(500)
    sp = await pg.query_selector('.splash-in'); sp and await sp.click()
    for n in days:
        await pg.evaluate("document.querySelectorAll('.ls-cele').forEach(e=>e.remove())")
        steps = await pg.evaluate(f'SD.days[{n}].steps.map(s=>s.type)')
        for j, t in enumerate(steps):
            await pg.evaluate("window.__log={tts:[],fail:[],vi:[]}")
            st0 = await pg.evaluate("(window.X&&X.stars)||0")
            r = await run_step(pg, n, j, t)
            r['stars'] = await pg.evaluate("(window.X&&X.stars)||0")
            lg = await pg.evaluate("window.__log")
            r.update({'n': n, 'k': j + 1, 't': t, 'tts': sorted(set(lg['tts'])), 'fail': sorted(set(lg['fail'])), 'vi': sorted(set(lg['vi'])), 'err': errs[:]})
            errs.clear(); out.append(r)
            if not r['ok']: print('PROBLEM', n, j + 1, t, r.get('why'), (r.get('screen') or '')[:120].replace('\n', ' | '), flush=True)
    await pg.close()

async def main():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 8770), functools.partial(Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:8770/seedling/index.html?gv=1'
    days = ONLY or list(range(1, 100))
    chunks = [days[i::NW] for i in range(NW)]
    out = []
    async with async_playwright() as p:
        import os
        args = ['--autoplay-policy=no-user-gesture-required'] + ([] if os.environ.get('NOMIC') else ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'])
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=args)
        await asyncio.gather(*[worker(b, c, out, base) for c in chunks if c])
        await b.close()
    srv.shutdown()
    json.dump(sorted(out, key=lambda r: (r['n'], r['k'])), open('/home/claude/work/test/playall.json', 'w'), ensure_ascii=False, indent=0)
    bad = [r for r in out if not r['ok']]; tts = sum(len(r['tts']) for r in out); fail = sum(len(r['fail']) for r in out); vi = sum(len(r['vi']) for r in out); er = sum(len(r['err']) for r in out)
    print('steps', len(out), 'stuck/timeout', len(bad), 'tts lines', tts, 'audio 404', fail, 'vi no audio', vi, 'js errors', er)
if __name__ == "__main__": asyncio.run(main())
