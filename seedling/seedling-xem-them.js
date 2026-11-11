/* =====================================================================
   XEM THÊM · dải ngang cuối web (extensive reading / listening), dùng chung web Little Seed và Seedling
   - Mỗi ngày web có 5–8 gợi ý ngoài chương trình nhưng cùng nội dung (XT_DATA trong xem-them-data.js, sinh bởi
     seedling/cong-cu/xem_them/build_xem_them.py): video phonics / pinyin đúng mẹo âm của ngày (Seedling),
     bài hát từ vựng tiếng Anh và tiếng Trung của unit, một sách có tiếng đọc (Unite for Literacy).
   - Hiện ở Trang chủ (ngày con đang học) và trang của một ngày web (#/ngay/n). Ẩn trong lúc làm bước bài.
   - Con chỉ xem được đúng video gợi ý, ngay trong web: trình phát YouTube (youtube-nocookie) có lớp chắn bấm,
     không có nút mở YouTube, không có video đề xuất; hết video thì hiện màn của web (Xem lại / Video tiếp).
   - Sao (chị chốt 11/11): mỗi video / sách con tương tác được +1 ⭐, tối đa 3 ⭐ mỗi ngày. Tương tác = video phát được
     30 giây (hoặc xem hết nếu ngắn hơn), sách mở 40 giây. Mỗi bài chỉ tính 1 lần trong ngày. Lưu trong P.xt (đồng bộ lên lớp).
   ===================================================================== */
(function () {
  if (typeof XT_DATA !== 'object') return;
  const K = (typeof KEY === 'string' ? KEY : 'sdl') + '-xt';
  const ls = { get(k, d) { try { const v = localStorage.getItem(K + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(K + k, JSON.stringify(v)); } catch (e) {} } };
  const h = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const BADGE = { phonics: ['🔤', 'Âm'], pinyin: ['🔤', '拼音'], song: ['🎵', ''], book: ['📖', 'Sách'] };
  const watched = () => ls.get('-xem', []);
  const mark = id => { const w = watched(); if (!w.includes(id)) { w.push(id); ls.set('-xem', w.slice(-800)); } };
  const thumb = it => it.k === 'book' ? '' : 'https://i.ytimg.com/vi/' + encodeURIComponent(it.id) + '/mqdefault.jpg';

  /* ---------- sao Xem thêm: +1 mỗi bài, tối đa 3 mỗi ngày ---------- */
  const STAR_MAX = 3, VIDEO_GIAY = 30, SACH_GIAY = 40;
  const dToday = () => (typeof today === 'function' ? today() : new Date().toISOString().slice(0, 10));
  function xtDay() {
    if (typeof P !== 'object' || !P) return { d: dToday(), n: 0, ids: [] };
    if (!P.xt || P.xt.d !== dToday()) P.xt = { d: dToday(), n: 0, ids: [] };
    P.xt.ids = P.xt.ids || []; return P.xt;
  }
  const starred = id => xtDay().ids.includes(id);
  let fullSaid = '';
  function giveStar(it) {
    if (typeof addStars !== 'function') return;
    const x = xtDay(); if (x.ids.includes(it.id)) return;
    if (x.n >= STAR_MAX) { if (fullSaid !== x.d) { fullSaid = x.d; toast(`Hôm nay con đã nhận đủ ${STAR_MAX} ⭐ ở Xem thêm. Con vẫn xem, đọc tiếp được nhé!`); } return; }
    x.n++; x.ids.push(it.id); addStars(1);   // addStars lưu P (gồm P.xt) và gửi lên lớp
    try { if (typeof sfx === 'object' && sfx.coin) sfx.coin(); } catch (e) {}
    try { if (typeof qFloat === 'function') qFloat(document.querySelector('.xt-top') || document.getElementById('starCount'), '+1 ⭐'); } catch (e) {}
    toast(`+1 ⭐ Con ${it.k === 'book' ? 'đọc' : 'xem'} thêm giỏi quá! (hôm nay ${x.n}/${STAR_MAX})`);
    const s = document.getElementById('xtStar'); if (s) s.textContent = '⭐ Đã nhận sao';
  }

  /* ---------- ngày đang xem ---------- */
  function dayNow() {
    const m = (location.hash || '').match(/^#\/ngay\/(\d+)(\/(b\d+))?/);
    if (m) return m[3] ? 0 : +m[1];   // đang trong bước bài → ẩn
    if (/^#?\/?$/.test(location.hash || '')) {
      const P_ = (typeof P === 'object' && P) ? P : { days: {} };
      for (let n = 1; n <= 99; n++) if (XT_DATA[n] && !((P_.days || {})[n] || {}).done) return n;
      return 99;
    }
    return 0;
  }

  /* ---------- dải ngang ---------- */
  const bar = document.createElement('section'); bar.className = 'xt'; bar.id = 'xt'; bar.setAttribute('aria-label', 'Xem thêm');
  document.body.appendChild(bar);
  let curDay = 0;
  function isOpen() { const v = ls.get('-mo', null); return v == null ? innerHeight >= 700 : v; }
  function draw() {
    curDay = dayNow(); const list = XT_DATA[curDay] || [];
    document.body.classList.toggle('xt-on', !!list.length);
    if (!list.length) { bar.innerHTML = ''; return; }
    const open = isOpen(); document.body.classList.toggle('xt-mo', open);
    const w = watched(), x = xtDay();
    bar.innerHTML = `<button type="button" class="xt-hd" aria-expanded="${open}"><b>📺 Xem thêm</b><em class="xt-sao" title="Mỗi bài xem, đọc được 1 sao, tối đa ${STAR_MAX} sao mỗi ngày">⭐ ${x.n}/${STAR_MAX} hôm nay</em><span>Ngày ${curDay} · Xem hoặc đọc mỗi bài được +1 ⭐, tối đa ${STAR_MAX} ⭐ mỗi ngày</span><i>${open ? '▾' : '▴'}</i></button>
      ${open ? `<div class="xt-row">${list.map((it, i) => { const [ic, lb] = BADGE[it.k] || ['▶', ''];
        const lang = it.l === 'zh' ? '中文' : 'English', tag = it.k === 'song' ? lang : lb + (it.k === 'book' ? '' : '');
        return `<button type="button" class="xt-card k-${it.k} l-${it.l}${w.includes(it.id) ? ' seen' : ''}" data-i="${i}">
          <span class="xt-th">${it.k === 'book' ? '<span class="xt-book">📖</span>' : `<img src="${thumb(it)}" alt="" loading="lazy" onerror="this.remove()"><span class="xt-tri"></span>`}
            <span class="xt-tag">${ic} ${h(tag)}</span>${starred(it.id) ? '<span class="xt-ok star">⭐</span>' : w.includes(it.id) ? '<span class="xt-ok">✓</span>' : ''}</span>
          <span class="xt-cap"><b>${h(it.t)}</b><small>${h(it.c)}</small></span></button>`; }).join('')}</div>` : ''}`;
    bar.querySelector('.xt-hd').onclick = () => { ls.set('-mo', !isOpen()); draw(); };
    bar.querySelectorAll('[data-i]').forEach(b => b.onclick = () => openItem(list, +b.dataset.i));
  }
  addEventListener('hashchange', () => setTimeout(draw, 0));
  addEventListener('resize', () => { if (ls.get('-mo', null) == null) draw(); });

  /* ---------- trình phát YouTube khoá ---------- */
  let ytReady = null;
  function loadYT() {
    if (ytReady) return ytReady;
    ytReady = new Promise(res => {
      if (window.YT && window.YT.Player) return res();
      const prev = window.onYouTubeIframeAPIReady; window.onYouTubeIframeAPIReady = () => { try { prev && prev(); } catch (e) {} res(); };
      const s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api'; document.head.appendChild(s);
    });
    return ytReady;
  }
  let pop = null, player = null, tick = 0, bookT = 0;
  function close() {
    clearInterval(tick); clearTimeout(bookT); try { player && player.destroy(); } catch (e) {} player = null;
    if (document.fullscreenElement) try { document.exitFullscreen(); } catch (e) {}
    if (pop) { pop.remove(); pop = null; } document.removeEventListener('keydown', onKey); draw();
  }
  function onKey(e) { if (e.key === 'Escape') close(); }
  const fmt = s => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); };
  function openItem(list, i) {
    const it = list[i]; if (!it) return;
    try { if (typeof stopAll === 'function') stopAll(); } catch (e) {}
    close(); mark(it.id);
    pop = document.createElement('div'); pop.className = 'xt-pop';
    const [ic, lb] = BADGE[it.k] || ['▶', ''];
    pop.innerHTML = `<div class="xt-box ${it.k === 'book' ? 'is-book' : ''}" role="dialog" aria-label="${h(it.t)}">
      <div class="xt-top"><div><b>${ic} ${h(it.t)}</b><small>${h(it.c)}${it.k === 'book' ? ' · sách có tiếng đọc' : ''}</small></div>
        <span class="xt-star" id="xtStar">${starred(it.id) ? '⭐ Đã nhận sao' : xtDay().n >= STAR_MAX ? '⭐ Hôm nay đủ sao' : (it.k === 'book' ? 'Đọc một lúc được +1 ⭐' : 'Xem một lúc được +1 ⭐')}</span>
        <button type="button" class="xt-x" aria-label="Đóng">✕</button></div>
      ${it.k === 'book' ? bookHTML(it) : videoHTML()}
      <div class="xt-next">${list.map((x, j) => `<button type="button" class="xt-mini ${j === i ? 'on' : ''}" data-j="${j}" title="${h(x.t)}">${(BADGE[x.k] || ['▶'])[0]}</button>`).join('')}</div></div>`;
    document.body.appendChild(pop);
    pop.onclick = e => { if (e.target === pop) close(); };
    pop.querySelector('.xt-x').onclick = close;
    pop.querySelectorAll('[data-j]').forEach(b => b.onclick = () => openItem(list, +b.dataset.j));
    document.addEventListener('keydown', onKey);
    if (it.k !== 'book') startVideo(list, i);
    else bookT = setTimeout(() => { if (pop) giveStar(it); }, SACH_GIAY * 1000);
  }
  function videoHTML() {
    return `<div class="xt-vid" id="xtVid"><div id="xtYT"></div>
        <button type="button" class="xt-shield" id="xtShield" aria-label="Phát / dừng"><span class="xt-big">▶</span></button>
        <div class="xt-end" id="xtEnd" hidden><b>🎉 Xong rồi!</b><div><button type="button" class="ls-b" id="xtAgain">↺ Xem lại</button>
          <button type="button" class="ls-b" id="xtNextV">Bài tiếp ›</button></div></div></div>
      <div class="xt-ctl"><button type="button" class="ls-b" id="xtPlay" aria-label="Phát / dừng">⏸</button>
        <input type="range" id="xtSeek" min="0" max="100" value="0" step="0.5" aria-label="Tua">
        <span id="xtTime">0:00</span><button type="button" class="ls-b" id="xtFull" aria-label="Toàn màn hình">⛶</button></div>`;
  }
  async function startVideo(list, i) {
    const it = list[i], box = pop; await loadYT(); if (pop !== box) return;
    const wrap = document.getElementById('xtVid'), shield = document.getElementById('xtShield'), end = document.getElementById('xtEnd');
    const playBtn = document.getElementById('xtPlay'), seek = document.getElementById('xtSeek'), time = document.getElementById('xtTime');
    let seeking = false, watchedSec = 0;
    player = new YT.Player('xtYT', {
      host: 'https://www.youtube-nocookie.com', videoId: it.id, width: '100%', height: '100%',
      playerVars: { autoplay: 1, rel: 0, controls: 0, disablekb: 1, fs: 0, iv_load_policy: 3, playsinline: 1, modestbranding: 1, origin: location.origin },
      events: {
        onReady: e => { try { e.target.playVideo(); } catch (x) {} },
        onStateChange: e => {
          const st = e.data; wrap.classList.toggle('paused', st !== 1 && st !== 3); playBtn.textContent = st === 1 ? '⏸' : '▶';
          end.hidden = st !== 0; if (st === 0) { wrap.classList.add('ended'); giveStar(it); } else wrap.classList.remove('ended');
        },
        onError: () => { end.hidden = false; end.querySelector('b').textContent = 'Video này tạm không xem được. Con chọn bài khác nhé!'; }
      }
    });
    const toggle = () => { if (!player || !player.getPlayerState) return; const s = player.getPlayerState(); s === 1 ? player.pauseVideo() : player.playVideo(); };
    shield.onclick = toggle; playBtn.onclick = toggle;
    seek.oninput = () => { seeking = true; time.textContent = fmt(seek.value / 100 * (player.getDuration() || 0)); };
    seek.onchange = () => { try { player.seekTo(seek.value / 100 * (player.getDuration() || 0), true); } catch (e) {} seeking = false; };
    document.getElementById('xtAgain').onclick = () => { player.seekTo(0, true); player.playVideo(); };
    const nextV = list.findIndex((x, j) => j > i && x.k !== 'book');
    const nb = document.getElementById('xtNextV'); if (nextV < 0) nb.remove(); else nb.onclick = () => openItem(list, nextV);
    document.getElementById('xtFull').onclick = () => { try { document.fullscreenElement ? document.exitFullscreen() : wrap.requestFullscreen(); } catch (e) {} };
    tick = setInterval(() => { try { const d = player.getDuration(), c = player.getCurrentTime(); if (d && !seeking) { seek.value = c / d * 100; time.textContent = fmt(c) + ' / ' + fmt(d); }
      if (player.getPlayerState() === 1 && !document.hidden) { watchedSec += 0.5; if (watchedSec >= VIDEO_GIAY) giveStar(it); } } catch (e) {} }, 500);
  }
  /* ---------- sách Unite for Literacy (có lớp chắn logo, nút Quay lại, thanh dưới) ---------- */
  function bookHTML(it) {
    return `<p class="xt-hint">Chạm mũi tên để lật trang, chạm loa để nghe đọc. Muốn nghe tiếng Trung: chạm nút 🌐 góc trên trái → chọn <b>國語/普通话 (Mandarin)</b>.</p>
      <div class="xt-bk"><iframe src="https://www.uniteforliteracy.com/unite/new/book?BookId=${encodeURIComponent(it.id)}" title="${h(it.t)}" referrerpolicy="no-referrer"></iframe>
        <span class="xt-blk b1"></span><span class="xt-blk b2"></span><span class="xt-blk b3"></span></div>`;
  }

  draw();
  window.XT_GOC = { draw, giveStar };   // để kiểm thử
})();
