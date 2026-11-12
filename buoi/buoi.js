/* =====================================================================
   WEB DẠY BUỔI TRÊN LỚP · lớp offline 48 buổi (Little Seed 48, Seedling 48) – nối tiếp Buổi 0 (khai-giang/)
   - Dữ liệu: window.BU trong data-u*.js (sinh từ cong-cu/noi-dung-u*.js bởi cong-cu/build.js). Làm từng unit, chị duyệt từng unit.
   - Mở: ?lop=ls&b=1 (lop = ls | sd, b = số buổi). Giữ được trạng thái từng buổi trên máy (localStorage).
   - Nguyên tắc tổ chức buổi (12/11/2026, rút từ GrapeSEED và Budding Bean): mỗi khối gồm 2–4 màn ngắn ≤ 5–6′,
     chuyển tiếp vận động mỗi 5–8′, từ đi kèm văn bản, vai cô lùi dần theo buổi (làm mẫu → giúp con đáp → nghe con),
     truyện và big book đọc cả lượt tiếng Anh rồi cả lượt tiếng Trung, mở – đóng bằng vè chào, có màn dự phòng.
   - Giọng đọc mẫu: giọng cô tự thu (🎙) → file giọng có sẵn của web học → giọng máy (nút viền chấm).
   - 📺 Cửa sổ chiếu (?chieu): đi theo màn của cô qua BroadcastChannel; âm thanh phát ở máy cô, video phát ở cửa sổ chiếu.
   ===================================================================== */
(function () {
  'use strict';
  const D = window.BU, NOI = D.NOI;
  const Q = new URLSearchParams(location.search), CHIEU = Q.has('chieu');
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const store = {
    get(k, d) { try { const v = localStorage.getItem('bu-' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('bu-' + k, JSON.stringify(v)); } catch (e) {} },
  };
  const NV = '../seedling/tai-nguyen/nhan-vat/';
  const VAI = { mau: ['🧑‍🏫', 'Cô làm mẫu', 'Con nghe, chỉ, làm động tác; chưa bắt nói.'],
    giup: ['🤝', 'Cô giúp con đáp', 'Hỏi cả lớp, chờ 3 giây, giúp con đáp rồi nói lại cả câu.'],
    nghe: ['👂', 'Cô nghe con', 'Con nói, diễn; cô chỉ giúp khi con dừng, sửa sau khi con nói xong.'] };

  /* ---------------- chọn lớp, buổi ---------------- */
  let LV = /^(ls|sd)$/.test(Q.get('lop') || '') ? Q.get('lop') : store.get('lv', 'ls');
  const has = (lv, b) => D.lv[lv] && D.lv[lv].buoi[b];
  let B = +(Q.get('b') || store.get('b-' + LV, 1));
  if (!has(LV, B)) B = +Object.keys(D.lv[LV].buoi)[0];
  let BU, MAN, KHOI;
  const S = { i: 0, st: {}, team: { A: 0, B: 0 }, py: store.get('py', true), t0: null, chua: {} };
  const key = k => LV + B + '-' + k;
  function load() {
    BU = D.lv[LV].buoi[B]; MAN = BU.MAN; KHOI = BU.KHOI;
    S.i = Math.min(store.get(key('i'), 0), MAN.length - 1); S.st = {}; S.team = store.get(key('team'), { A: 0, B: 0 });
    S.t0 = store.get(key('t0'), null); S.chua = store.get(key('chua'), {});
    store.set('lv', LV); store.set('b-' + LV, B);
    if (!CHIEU) { const u = new URL(location.href); u.searchParams.set('lop', LV); u.searchParams.set('b', B); history.replaceState(null, '', u); }
  }
  load();
  const cur = () => MAN[S.i];
  const ST = m => (S.st[m.id] = S.st[m.id] || init(m));
  function init(m) {
    const L = m.lang || 'en';
    switch (m.type) {
      case 'song': return { v: 0 };
      case 've': return { cur: -1, loud: '', lang: L };
      case 'hoi': return { j: 0, show: false, lang: L };
      case 'flash': return { on: -1, lang: L, mode: m.mode || 'ts' };
      case 'book': return { p: 0, lang: L, hide: !!m.hide, q: false };
      case 'cua': return { c: -1, dir: 'in', show: false, n: 0, lang: L };
      case 'chon': return { order: m.items.map((_, i) => i), pick: -1, show: false, n: 0, lang: L, done: [] };
      case 'says': return { who: m.who && m.who !== 'xen' ? m.who : 'leo', c: -1, trap: false, n: 0, lua: !!m.lua, mode: m.who || 'xen', show: false };
      case 'cau': return { j: 0, show: !m.pdn };
      case 'dien': return { j: 0, lang: L, hide: !!m.hide };
      case 'move': return { j: -1 };
      case 'nghi': return { end: null, left: (m.p || 10) * 60 };
      case 'kt': return { j: 0, show: false };
      default: return {};
    }
  }
  const lit = (it, l) => it ? (l === 'zh' ? it.zh : it.en) : '';

  /* ---------------- giọng cô thu trên trang (IndexedDB) – dùng chung kho với Buổi 0 ---------------- */
  const REC = (() => {
    let dbp = null, keys = new Set();
    const open = () => dbp || (dbp = new Promise((res, rej) => {
      const r = indexedDB.open('buoi0-giong', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('rec');
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    }));
    const tx = (mode, f) => open().then(db => new Promise((res, rej) => {
      const t = db.transaction('rec', mode), q = f(t.objectStore('rec'));
      t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error);
    }));
    return {
      get: k => keys.has(k) ? tx('readonly', s => s.get(k)).catch(() => null) : Promise.resolve(null),
      put: (k, b) => tx('readwrite', s => s.put(b, k)).then(() => keys.add(k)),
      del: k => tx('readwrite', s => s.delete(k)).then(() => keys.delete(k)),
      all: () => tx('readonly', s => s.getAllKeys()),
      load: () => tx('readonly', s => s.getAllKeys()).then(ks => { keys = new Set(ks || []); }).catch(() => {}),
      has: k => keys.has(k),
    };
  })();

  /* ---------------- phát giọng ---------------- */
  const AU = new Audio(); AU.preload = 'auto';
  let tok = 0, curBtn = null, seq = 0;
  function stopAudio() {
    tok++; AU.onended = AU.onerror = null; AU.pause();
    try { speechSynthesis.cancel(); } catch (e) {}
    if (curBtn) { curBtn.classList.remove('play'); curBtn = null; }
  }
  const playUrl = (u, t) => new Promise(res => { if (t !== tok) return res(); AU.onended = res; AU.onerror = res; AU.src = u; AU.play().catch(res); });
  let voices = [];
  const loadVoices = () => { try { voices = speechSynthesis.getVoices() || []; } catch (e) {} };
  if ('speechSynthesis' in window) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
  function voiceFor(l) {
    const want = l === 'zh' ? /^zh[-_](CN|Hans)/i : /^en[-_](US|GB)/i;
    return voices.find(v => want.test(v.lang) && /Google|Microsoft|Natural|Siri/i.test(v.name)) || voices.find(v => want.test(v.lang)) || null;
  }
  const tts = (t, l, my) => new Promise(res => {
    if (!('speechSynthesis' in window) || my !== tok) return res();
    try {
      const u = new SpeechSynthesisUtterance(t.replace(/…+|\.\.\./g, ', ').replace(/___/g, ''));
      u.lang = l === 'zh' ? 'zh-CN' : 'en-US'; const v = voiceFor(l); if (v) u.voice = v;
      u.rate = l === 'zh' ? 0.8 : 0.85; u.pitch = 1.1; u.onend = res; u.onerror = res;
      speechSynthesis.speak(u); setTimeout(res, 9000);
    } catch (e) { res(); }
  });
  async function say(item, l, btn) {
    if (CHIEU || !item || !item[l]) return false;
    stopAudio(); const my = tok;
    if (btn) { curBtn = btn; btn.classList.add('play'); }
    try {
      const rec = await REC.get(l + ':' + item[l]);
      if (my !== tok) return false;
      if (rec) { const u = URL.createObjectURL(rec); await playUrl(u, my); URL.revokeObjectURL(u); }
      else if ((item['a_' + l] || []).length) { for (const u of item['a_' + l]) { if (my !== tok) return false; await playUrl(u, my); await sleep(70); } }
      else await tts(item[l], l, my);
    } finally { if (my === tok && btn) { btn.classList.remove('play'); curBtn = null; } }
    return my === tok;
  }

  /* ---------------- tiếng gõ nhịp, chuông ---------------- */
  let AC = null;
  const ac = () => { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); } catch (e) {} return AC; };
  function blip(f = 880, d = 0.08, type = 'sine', vol = 0.25, at = 0) {
    const a = ac(); if (!a) return; const t = a.currentTime + at, o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.value = f; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + d + 0.02);
  }
  const chime = () => { blip(660, .18, 'triangle', .3); blip(880, .18, 'triangle', .3, .12); blip(1320, .3, 'triangle', .25, .24); };
  let beatT = null, beatN = 0;
  function beat(on) {
    clearInterval(beatT); beatT = null; beatN = 0; showBeat(-1); post({ k: 'beat', b: -1 });
    if (!on) return;
    beatT = setInterval(() => { const b = beatN++ % 4; blip(b ? 1100 : 1600, .05, 'square', b ? .12 : .2); showBeat(b); post({ k: 'beat', b }); }, 625);
  }
  const showBeat = b => $$('.beat i').forEach((x, i) => x.classList.toggle('on', i === b));

  /* ---------------- cửa sổ chiếu ---------------- */
  const BC = 'BroadcastChannel' in window ? new BroadcastChannel('buoi-tren-lop') : null;
  let peerAt = 0;
  const peer = () => !CHIEU && Date.now() - peerAt < 4500;
  const post = m => { if (BC) try { BC.postMessage(m); } catch (e) {} };
  const snap = () => ({ LV, B, i: S.i, st: S.st, team: S.team, py: S.py });
  const sync = () => { if (!CHIEU) post({ k: 's', S: snap() }); };
  const rkey = () => { const m = cur(); return [LV, B, S.i, S.py, JSON.stringify(S.st[m.id] || {})].join('|'); };
  if (BC) BC.onmessage = e => {
    const d = e.data || {};
    if (CHIEU) {
      if (d.k === 's') {
        const k0 = rkey(); if (d.S.LV !== LV || d.S.B !== B) { LV = d.S.LV; B = d.S.B; BU = D.lv[LV].buoi[B]; MAN = BU.MAN; KHOI = BU.KHOI; }
        S.i = d.S.i; S.st = d.S.st; S.team = d.S.team; S.py = d.S.py; if (rkey() !== k0) render(); else updTeams();
      } else if (d.k === 'yt') ytCmd(d.c);
      else if (d.k === 'beat') showBeat(d.b);
      else if (d.k === 'zoom') zoomShow(d.z);
    } else if (d.k === 'hi') { const was = peer(); peerAt = Date.now(); if (!was) { sync(); if (cur().type === 'song') render(); } }
  };
  if (CHIEU) { setInterval(() => post({ k: 'hi' }), 1500); setTimeout(() => post({ k: 'hi' }), 100); }

  /* ---------------- YouTube ---------------- */
  let YTP = null, ytReady = null, fzT = null;
  const ytApi = () => ytReady || (ytReady = new Promise(res => {
    if (window.YT && YT.Player) return res();
    window.onYouTubeIframeAPIReady = res;
    const s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api'; s.onerror = () => res(); document.head.appendChild(s);
    setTimeout(res, 8000);
  }));
  function mountVideo(el, id) {
    destroyVideo();
    ytApi().then(() => {
      if (!document.body.contains(el)) return;
      if (!(window.YT && YT.Player)) { el.innerHTML = `<div class="msg">Chưa tải được YouTube (kiểm tra mạng). <a style="color:#fff" target="_blank" rel="noopener" href="https://www.youtube.com/watch?v=${esc(id)}">Mở trên YouTube</a></div>`; return; }
      const d = document.createElement('div'); d.dataset.yt = id; el.innerHTML = ''; el.appendChild(d);
      YTP = new YT.Player(d, { host: 'https://www.youtube-nocookie.com', videoId: id, playerVars: { rel: 0, modestbranding: 1, playsinline: 1 } });
    });
  }
  function destroyVideo() { clearTimeout(fzT); if (YTP && YTP.destroy) try { YTP.destroy(); } catch (e) {} YTP = null; }
  function ytCmd(c) {
    const ok = YTP && YTP.playVideo;
    if (c === 'play' && ok) YTP.playVideo();
    if (c === 'pause' && ok) YTP.pauseVideo();
    if (c === 'freeze') { if (ok) YTP.pauseVideo(); freezeShow(true); clearTimeout(fzT); fzT = setTimeout(() => { freezeShow(false); if (YTP && YTP.playVideo) YTP.playVideo(); }, 3200); }
  }
  function freezeShow(on) {
    $$('.freeze').forEach(x => x.remove()); if (!on) return;
    const el = document.createElement('div'); el.className = 'freeze'; el.innerHTML = `🧊<small>Freeze! · 站住！</small>`; $('#slide').appendChild(el);
  }

  /* ---------------- thành phần chung ---------------- */
  let REG = [];
  const reg = item => REG.push(item) - 1;
  function auBtn(item, l) {
    if (!item || !item[l]) return '';
    const c = ['au', l]; if (REC.has(l + ':' + item[l])) c.push('rec'); else if (item['m_' + l] === 'may') c.push('may');
    return `<button type="button" class="${c.join(' ')}" data-say="${l}" aria-label="${l === 'en' ? 'Nghe tiếng Anh' : 'Nghe tiếng Trung'}">${l === 'en' ? 'EN' : '中'}</button>`;
  }
  // sent: câu có thể chỉ hiện một thứ tiếng (only = 'en' | 'zh'); che = che chữ cho con tự nói
  function sent(item, cls = '', pre = '', only = '', che = false) {
    const en = only !== 'zh' && item.en, zh = only !== 'en' && item.zh;
    return `<div class="sent ${cls}${che ? ' che' : ''}" data-r="${reg(item)}">${pre}<div class="tx" data-say="${en ? 'en' : 'zh'}">` +
      (en ? `<span class="en">${esc(item.en)}</span>` : '') + (zh ? `<span class="zh">${esc(item.zh)}</span>` : '') +
      (zh && item.py ? `<span class="py">${esc(item.py)}</span>` : '') + `</div><div class="spk">${en ? auBtn(item, 'en') : ''}${zh ? auBtn(item, 'zh') : ''}</div></div>`;
  }
  const lvTag = () => `${LV === 'ls' ? '🌱 Little Seed' : '🌿 Seedling'} · Buổi ${B}`;
  const head = m => `<div class="s-title">${esc(m.t)}</div><div class="s-tag">${lvTag()}</div>`;
  const langTag = l => `<span class="lt ${l}">${l === 'zh' ? '中文' : 'English'}</span>`;
  const teams = () => `<div class="teams"><div class="team" id="tA"><img src="${NV}pets_cun_dung_a.webp" alt="Đội Cún"><span>${S.team.A}</span>⭐</div>` +
    `<div class="team" id="tB"><img src="${NV}pets_meo_ngoi_a.webp" alt="Đội Mèo"><span>${S.team.B}</span>⭐</div></div>`;
  function updTeams() { const a = $('#tA span'), b = $('#tB span'); if (a) a.textContent = S.team.A; if (b) b.textContent = S.team.B; }
  const rules = m => m.rules ? `<div class="rules"><ol>${m.rules.map(r => `<li>${esc(r)}</li>`).join('')}</ol></div>` : '';
  const shuffle = a => { const o = [...a]; for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; } return o; };
  const rnd = (n, not) => { let r; do { r = Math.floor(Math.random() * n); } while (n > 1 && r === not); return r; };

  /* ---------------- các loại màn ---------------- */
  const R = {
    chao(m) {
      return head(m) + `<img class="pic big" src="${esc(m.img)}" alt="">${m.co ? `<img class="co" src="${esc(m.co)}" alt="">` : ''}` +
        `<div class="lines">${m.lines.map(x => sent(x)).join('')}</div>`;
    },
    song(m, st) {
      const s = m.songs[st.v] || m.songs[0], host = CHIEU || !peer();
      const vid = host ? `<div class="vid" id="vid"></div>`
        : `<div class="vid"><img class="th" src="https://i.ytimg.com/vi/${esc(s.id)}/hqdefault.jpg" alt=""><div class="msg">📺 Video đang phát ở cửa sổ chiếu</div></div>`;
      return head(m) + vid +
        `<div class="tabs">${m.songs.map((x, i) => `<button type="button" class="tab${i === st.v ? ' on' : ''}" data-v="${i}"><img src="https://i.ytimg.com/vi/${esc(x.id)}/mqdefault.jpg" alt=""><span><b class="${x.l === 'zh' ? 'zh' : ''}">${x.l === 'en' ? '🇬🇧 ' : '🇨🇳 '}${esc(x.t)}</b><small>${esc(x.c)} · YouTube</small></span></button>`).join('')}</div>` +
        `<div class="side">${(m.moves || []).map(x => `<div class="mv">${esc(x)}</div>`).join('')}</div>`;
    },
    ve(m, st) {
      const l = st.lang, bars = n => `<div class="vol">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= n ? 'on' : ''}" style="height:${30 + i * 26}px"></i>`).join('')}</div>`;
      const a = st.loud === 'to' ? `<div class="animal to"><div class="spk-ic">🔊</div>${bars(5)}<b>Hát to!</b></div>`
        : st.loud === 'nho' ? `<div class="animal nho"><div class="spk-ic">🔈</div>${bars(1)}<b>Hát nhỏ…</b></div>`
          : `<div class="animal pic"><img src="${esc(m.img)}" alt=""></div>`;
      const n = m.lines.length, sz = n > 4 ? ' many' : '';
      return head(m) + `<div class="lines${sz}">${langTag(l)}${m.lines.map((x, i) => sent(x, i === st.cur ? 'cur' : '', x.mv ? `<div class="mv">${x.mv}</div>` : '', l)).join('')}</div>` +
        `<div class="beat">${[1, 2, 3, 4].map(n => `<i>${n}</i>`).join('')}</div>` + a;
    },
    hoi(m, st) {
      const p = m.pairs[st.j], l = st.lang;
      return head(m) + `<img class="pic big" src="${esc(p.img || m.img)}" alt="">` +
        `<div class="qa">${langTag(l)}${sent(p.q, 'q', '<div class="ic">❓</div>', l)}${st.show ? sent(p.a, 'a', '<div class="ic">💬</div>', l) : `<div class="a-wait">💬 …</div>`}</div>` +
        (m.pairs.length > 1 ? `<div class="pg">${m.pairs.map((_, i) => `<i class="${i === st.j ? 'on' : ''}"></i>`).join('')}</div>` : '') + (m.game ? teams() : '');
    },
    flash(m, st) {
      const l = st.lang, c = m.cards, n = c.length, cols = n <= 6 ? 3 : n <= 8 ? 4 : 5;
      const z = st.on >= 0 ? c[st.on] : null;
      return head(m) + `<div class="fl-mode">${langTag(l)}<span class="md">${st.mode === 'sts' ? '👦 Con nói trước → cô → con' : '🧑‍🏫 Cô đọc → con nhắc (2 lần)'}</span></div>` +
        `<div class="cards c${cols}">${c.map((x, i) => `<button type="button" class="fc${i === st.on ? ' on' : ''}" data-fc="${i}" data-r="${reg(x)}"><img src="${esc(x.img)}" alt=""><b class="${l}">${st.mode === 'sts' ? '&nbsp;' : esc(lit(x, l))}</b></button>`).join('')}</div>` +
        (z ? `<div class="zoom" data-r="${reg(z)}"><img src="${esc(z.img)}" alt=""><b class="${l}">${st.mode === 'sts' && !st.lb ? '?' : esc(lit(z, l))}</b>${l === 'zh' && z.py && !(st.mode === 'sts' && !st.lb) ? `<span class="py">${esc(z.py)}</span>` : ''}</div>` : '');
    },
    book(m, st) {
      const ps = m.pages, p = ps[Math.min(st.p, ps.length - 1)], l = st.lang;
      const tx = p.cover ? `<div class="cover-t ${l}">${esc(lit(p, l))}</div>` : sent(p, 'sm', '', l, st.hide);
      return head(m) + `<div class="bk-h">${langTag(l)}<b>${esc(l === 'zh' ? (m.title_zh || m.title) : m.title)}</b><span>${st.p + 1}/${ps.length}</span></div>` +
        `<img class="pic page${p.cover ? ' cv' : ''}" src="${esc(p.img)}" alt="">` + `<div class="lines">${tx}</div>` +
        (st.q && p.q ? `<div class="bk-q">${esc(lit(p.q, l) || p.q.vi || '')}</div>` : '') +
        `<div class="pg">${ps.map((_, i) => `<i class="${i === st.p ? 'on' : ''}"></i>`).join('')}</div>` +
        `<div class="arrows"><button type="button" data-pg="-1">‹</button><button type="button" data-pg="1">›</button></div>`;
    },
    cua(m, st) {
      const it = m.items[st.c], l = st.lang, door = !m.nodoor;
      const line = it ? (st.dir === 'out' && it.bye ? it.bye : it.hi) : null;
      const dir = door ? `<div class="dir ${st.dir}">${st.dir === 'out' ? '🚪⬅️<small>Bước ra</small>' : '➡️🚪<small>Bước vào</small>'}</div>` : '';
      return head(m) + (it ? `<img class="pic who" src="${esc(it.img)}" alt="">${dir}` : `<div class="wait">${door ? '🚪' : '👋'}<small>Bấm 🎲 Lượt mới</small></div>`) +
        (it && st.show ? `<div class="ans">${sent(line, '', '', l)}</div>` : it ? `<div class="ans"><div class="a-wait">${langTag(l)} Con nói gì?</div></div>` : '') + rules(m) + (m.game ? teams() : '');
    },
    chon(m, st) {
      const it = m.items[st.pick], l = st.lang;
      const call = m.xep ? `<div class="call wait">${langTag(l)} Nghe câu, chạm đúng tranh rồi xếp vào hàng</div>`
        : !it ? `<div class="call wait">${langTag(l)} Bấm 🎲 Gọi · ai chạm đúng trước?</div>`
          : st.show ? `<div class="call ${l}">${esc(lit(it, l))}</div>` : `<div class="call wait">🔊 Nghe kỹ… chạm vào tranh nào?</div>`;
      const n = m.items.length, cols = n <= 4 ? n : n <= 6 ? 3 : 4;
      return head(m) + call + `<div class="grid g${cols}">${st.order.map(i => {
        const x = m.items[i], d = st.done.indexOf(i);
        const cl = m.xep ? (d >= 0 ? ' hit' : '') : (st.show && it ? (i === st.pick ? ' hit' : ' dim') : '');
        return `<button type="button" class="ch${cl}" data-ch="${i}"><img src="${esc(x.img)}" alt="">${d >= 0 ? `<i class="num">${d + 1}</i>` : ''}${x.ten ? `<b>${esc(x.ten)}</b>` : ''}</button>`; }).join('')}</div>` +
        (m.xep && st.done.length ? `<div class="row-done">${st.done.map((i, k) => `<img src="${esc(m.items[i].img)}" alt="" title="${k + 1}">`).join('')}</div>` : '') + (m.game ? teams() : '');
    },
    says(m, st) {
      const who = st.who === 'xiaomei' ? ['Xiaomei', NV + 'kids_xiaomei_a.webp', 'zh'] : ['Leo', NV + 'kids_leo_a.webp', 'en'];
      const c = m.cmds[st.c], l = who[2];
      const bub = !c ? `<div class="bub wait">Bấm 🎲 Lệnh mới.<br>Có "${who[0]} says" thì làm theo!</div>`
        : `<div class="bub">${st.trap ? '' : `<span class="pre">${l === 'en' ? 'Leo says…' : 'Xiaomei 说……'}</span>`}<span class="cmd ${l}">${esc(c[l])}</span>${l === 'zh' ? `<span class="py">${esc(c.py)}</span>` : ''}${c.ic ? `<span class="ic">${c.ic}</span>` : ''}</div>`;
      const res = c && st.show ? (st.trap ? `<div class="res trap">😄 Bị lừa rồi! ${who[0]} không nói "${l === 'en' ? 'Leo says' : 'Xiaomei 说'}"</div>` : `<div class="res ok">👍 Làm đúng rồi!</div>`) : '';
      return head(m) + `<div class="who"><img src="${who[1]}" alt=""><b>${who[0]}</b></div>` + bub + res +
        `<div class="cmds">${m.cmds.map((x, i) => `<button type="button" class="cmdc${i === st.c ? ' on' : ''}" data-cmd="${i}">${x.img ? `<img src="${esc(x.img)}" alt="">` : `<span class="big">${x.ic || ''}</span>`}<b>${esc(x.en)}</b><span class="zh">${esc(x.zh)}</span></button>`).join('')}</div>` + rules(m) + teams();
    },
    cau(m, st) {
      const p = m.pairs[st.j];
      const leo = `<div class="pp leo"><img src="${NV}kids_leo_a.webp" alt=""><b>Leo</b></div>`, xm = `<div class="pp xm"><img src="${NV}kids_xiaomei_a.webp" alt=""><b>Xiaomei</b></div>`;
      return head(m) + leo + xm + `<img class="pic mid" src="${esc(p.img)}" alt="">` +
        `<div class="bb en">${sent(p, '', '', 'en')}</div>` +
        `<div class="bb zh">${st.show ? sent(p, '', '', 'zh') : `<div class="a-wait">${m.pdn ? '🗣 Con nói cho Xiaomei nghe!' : '…'}</div>`}</div>` +
        (m.pairs.length > 1 ? `<div class="pg">${m.pairs.map((_, i) => `<i class="${i === st.j ? 'on' : ''}"></i>`).join('')}</div>` : '') + (m.game ? teams() : '');
    },
    dien(m, st) {
      const ln = m.lines[st.j], r = m.roles.find(x => x.k === ln.who) || { ten: '', img: '' }, l = st.lang;
      return head(m) + `<img class="pic scene" src="${esc(ln.img || m.img)}" alt="">` +
        `<div class="spkr"><img src="${esc(r.img)}" alt=""><b>${esc(r.ten)}</b></div>` +
        `<div class="say-b">${langTag(l)}${sent(ln, '', '', l, st.hide)}</div>` +
        `<div class="roles">${m.roles.map(x => `<span class="rl${x.k === ln.who ? ' on' : ''}"><img src="${esc(x.img)}" alt="">${esc(x.ten)}</span>`).join('')}</div>` +
        `<div class="pg dn">${m.lines.map((_, i) => `<i class="${i === st.j ? 'on' : ''}"></i>`).join('')}</div>`;
    },
    move(m, st) {
      const c = m.cmds[Math.max(0, st.j)];
      return head(m) + `<div class="mv-big">${c.img ? `<img src="${esc(c.img)}" alt="">` : `<span class="e">${c.ic || '🏃'}</span>`}<div><span class="en">${esc(c.en)}</span><span class="zh">${esc(c.zh)}</span></div></div>` +
        `<div class="mv-list">${m.cmds.map((x, i) => `<span class="${i === st.j ? 'on' : ''}">${x.ic || ''} ${esc(x.en)} · <span class="zh">${esc(x.zh)}</span></span>`).join('')}</div>`;
    },
    lam(m) {
      return head(m) + `<div class="off">📴 Tắt chiếu · làm bằng tay</div>` + (m.img ? `<img class="pic lam-img" src="${esc(m.img)}" alt="">` : '') +
        `<div class="lam-box"><h3>${esc(m.ten || '')}</h3>${m.mat ? `<p class="mat">🧺 ${esc(m.mat)}</p>` : ''}<ol>${(m.steps || []).map(x => `<li>${esc(x)}</li>`).join('')}</ol>` +
        `${m.line ? sent(m.line, 'sm') : ''}</div>`;
    },
    nghi(m, st) {
      const left = st.end ? Math.max(0, Math.round((st.end - Date.now()) / 1000)) : st.left;
      return head(m) + `<img class="bgimg" src="${esc(m.img)}" alt=""><div class="timer" id="timer">${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}</div>` +
        `<div class="nghi-l">${(m.list || []).map(x => `<span>${esc(x)}</span>`).join('')}</div>`;
    },
    tong(m) {
      return head(m) + `<div class="col c1"><h4>⭐ Hôm nay con nói được</h4>${m.lines.map(x => sent(x, 'sm')).join('')}</div>` +
        `<div class="col c2"><h4>🏠 Ở nhà</h4><ol class="home">${m.home.map(x => `<li>${esc(x)}</li>`).join('')}</ol></div>` + teams();
    },
    kt(m, st) {
      const it = m.items[st.j];
      return head(m) + `<div class="kt-n">Câu ${st.j + 1}/${m.items.length}</div><div class="kt-o">${it.opts.map((o, i) => `<div class="ko${st.show && i === it.ans ? ' hit' : ''}"><i>${'ABC'[i]}</i><img src="${esc(o)}" alt=""></div>`).join('')}</div>` +
        `<div class="kt-say">${st.show ? `<span class="${it.say.l}">${esc(it.say.t)}</span>` : '🔊 Nghe và khoanh vào phiếu'}</div>`;
    },
    chu(m) {
      return head(m) + `<div class="chu">${m.cols.map(c => `<div class="cu"><h4>${esc(c.h)}</h4>${c.big ? `<div class="bg ${c.zh ? 'zh' : ''}">${esc(c.big)}</div>` : ''}${c.img ? `<img src="${esc(c.img)}" alt="">` : ''}${c.small ? `<p>${esc(c.small)}</p>` : ''}${(c.words || []).map(w => `<span class="w ${c.zh ? 'zh' : ''}">${esc(w)}</span>`).join('')}</div>`).join('')}</div>`;
    },
  };

  /* ---------------- dựng trang ---------------- */
  const app = $('#app');
  const buoiList = lv => Object.keys(D.lv[lv].buoi).map(Number).sort((a, b) => a - b);
  if (CHIEU) {
    document.body.classList.add('chieu');
    app.innerHTML = `<div class="stage-box" id="stageBox"><div class="stage" id="stage"><div class="slide" id="slide"></div></div></div>`;
    document.addEventListener('click', () => { try { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {}); } catch (e) {} }, { once: true });
  } else {
    app.innerHTML = `<header class="top">
      <div class="brand">Buổi trên lớp<small>Anh – Trung – Kids · web dạy của cô</small></div>
      <div class="seg" role="group" aria-label="Chọn lớp"><button type="button" data-lv="ls">🌱 Little Seed</button><button type="button" data-lv="sd">🌿 Seedling</button></div>
      <div class="seg bseg" id="bseg" role="group" aria-label="Chọn buổi"></div>
      <div class="sp"></div>
      <div class="clock" id="clock"></div>
      <button type="button" class="tbtn" id="bRec">🎙 Giọng</button>
      <button type="button" class="tbtn" id="bWin">📺 Cửa sổ chiếu</button>
      <button type="button" class="tbtn" id="bFs">⛶</button>
    </header>
    <div class="sess" id="sess"></div>
    <nav class="blocks" id="blocks" aria-label="Các khối của buổi"></nav>
    <div class="main">
      <div class="stage-box" id="stageBox"><div class="stage" id="stage"><div class="slide" id="slide"></div></div><div class="ctrl" id="ctrl"></div></div>
      <aside class="note" id="note" aria-live="polite"></aside>
    </div>`;
  }
  const slide = $('#slide'), stage = $('#stage');
  function fit() {
    const r = stage.getBoundingClientRect(); if (!r.width) return;
    const sc = Math.min(r.width / 1280, r.height / 720), x = (r.width - 1280 * sc) / 2, y = (r.height - 720 * sc) / 2;
    slide.style.transform = `translate(${x}px,${y}px) scale(${sc})`;
  }
  new ResizeObserver(fit).observe(stage);

  let lastSong = '';
  function render() {
    const m = cur(), st = ST(m); REG = [];
    const songKey = m.type === 'song' ? [LV, B, S.i, st.v, CHIEU || !peer()].join('|') : '';
    if (m.type === 'song' && songKey === lastSong && $('#vid')) {
      $$('.song .tab').forEach((b, i) => b.classList.toggle('on', i === st.v)); updTeams();
    } else {
      if (m.type !== 'song' || songKey !== lastSong) destroyVideo();
      slide.className = 'slide ' + m.type + (S.py ? '' : ' hide-py') + (m.type === 've' && st.loud ? (st.loud === 'to' ? ' loud' : ' quiet') : '');
      slide.innerHTML = R[m.type](m, st);
      if (m.type === 'song' && $('#vid')) mountVideo($('#vid'), (m.songs[st.v] || m.songs[0]).id);
      lastSong = songKey;
    }
    fit();
    if (!CHIEU) { renderTop(); renderCtrl(); renderNote(); store.set(key('i'), S.i); }
  }
  function go(i) {
    i = Math.max(0, Math.min(MAN.length - 1, i)); if (i === S.i) return;
    seq++; stopAudio(); beat(false); freezeShow(false); S.i = i; render(); sync();
  }
  const change = (f, full = true) => { f(ST(cur())); if (full) render(); sync(); };
  function switchTo(lv, b) {
    if (!has(lv, b)) return; seq++; stopAudio(); beat(false); LV = lv; B = b; load(); render(); sync();
  }

  /* ---------------- thanh trên, khối, đồng hồ ---------------- */
  function renderTop() {
    $$('.seg [data-lv]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lv === LV)));
    const L = D.lv[LV];
    $('#bseg').innerHTML = `<a class="b0" href="../khai-giang/?lop=${LV}">🎉 Buổi 0</a>` + buoiList(LV).map(n => `<button type="button" data-b="${n}" aria-pressed="${n === B}">Buổi ${n}</button>`).join('') +
      (L.sau ? `<span class="sau" title="${esc(L.sau)}">${esc(L.sau)}</span>` : '');
    const v = VAI[BU.vai] || VAI.mau;
    $('#sess').innerHTML = `<b>${esc(BU.t)}</b><span>${esc(BU.about)}</span><span class="vai">${v[0]} ${v[1]}</span><span class="dw">💻 Ngày web trước buổi: ${BU.days.join(', ')}</span>`;
    const m = cur(), el = mins();
    $('#blocks').innerHTML = KHOI.map(k => {
      const ids = MAN.map((x, i) => [x, i]).filter(([x]) => x.k === k.n);
      const now = el != null && el >= k.tu && el < k.den;
      return `<button type="button" class="blk${m.k === k.n ? ' on' : ''}${now ? ' now' : ''}" data-k="${k.n}"><b>${k.tu}–${k.den}′ · Khối ${k.n}</b>${esc(k.t)}<span class="dots">${ids.map(([x, i]) => `<i class="${i === S.i ? 'cur' : ''}${x.du ? ' du' : ''}${S.chua[x.id] ? ' chua' : ''}"></i>`).join('')}</span></button>`;
    }).join('');
    renderClock();
  }
  const mins = () => S.t0 ? Math.floor((Date.now() - S.t0) / 60000) : null;
  function renderClock() {
    const c = $('#clock'); if (!c) return; const el = mins(), m = cur(), k = KHOI.find(x => x.n === m.k);
    if (el == null) { c.innerHTML = `<span>90 phút</span><button type="button" class="tbtn" id="bStart">▶ Bắt đầu buổi</button>`; return; }
    const late = el > k.den ? `<span class="late">· chậm ${el - k.den}′ so với khối ${k.n}</span>` : `<span>· khối ${k.n} còn ${Math.max(0, k.den - el)}′</span>`;
    c.innerHTML = `⏱ <b>${el}′</b>${late}<button type="button" class="tbtn" id="bReset" title="Đặt lại đồng hồ">↺</button>`;
  }
  if (!CHIEU) setInterval(() => { renderClock(); const m = cur(); if (m.type === 'nghi') tickNghi(); }, 1000);
  function tickNghi() {
    const st = ST(cur()), el = $('#timer'); if (!el || !st.end) return;
    const left = Math.max(0, Math.round((st.end - Date.now()) / 1000));
    el.textContent = String(Math.floor(left / 60)).padStart(2, '0') + ':' + String(left % 60).padStart(2, '0');
    if (left === 0) { st.end = null; st.left = (cur().p || 10) * 60; chime(); render(); sync(); }
  }

  /* ---------------- thanh điều khiển dưới màn ---------------- */
  function renderCtrl() {
    const m = cur(), st = ST(m), b = (a, t, c = '') => `<button type="button" class="act ${c}" data-a="${a}">${t}</button>`;
    const lg = () => b('lang', st.lang === 'zh' ? '🇨🇳 中文 → EN' : '🇬🇧 EN → 中文', 'alt');
    let x = '';
    switch (m.type) {
      case 'song': x = b('play', '▶ Phát') + b('pause', '⏸ Dừng', 'alt') + (m.freeze ? b('freeze', '🧊 Đứng hình') : ''); break;
      case 've': x = b('beat', beatT ? '🥁 Tắt nhịp' : '🥁 Nhịp', beatT ? 'on' : 'alt') + b('sing', '▶ Đọc mẫu cả bài') + lg() +
        b('to', '🔊 Hát to', st.loud === 'to' ? 'on' : 'alt') + b('nho', '🔈 Hát nhỏ', st.loud === 'nho' ? 'on' : 'alt'); break;
      case 'hoi': x = b('ask', '🔊 Hỏi') + b('ans', '👀 Đáp mẫu', 'alt') + (m.pairs.length > 1 ? b('pj1', 'Câu sau ›', 'alt') : '') + lg(); break;
      case 'flash': x = b('round', '▶ Cả lượt') + b('fc1', 'Thẻ sau ›', 'alt') + lg() + b('mode', st.mode === 'sts' ? '👦 Con trước' : '🧑‍🏫 Cô trước', 'alt') + (st.on >= 0 ? b('unzoom', '✕ Thu nhỏ', 'alt') : ''); break;
      case 'book': x = b('pg-1', '‹', 'alt') + b('pg1', 'Trang sau ›') + b('read', '▶ Đọc cả lượt', 'alt') + lg() + b('hide', st.hide ? '🙉 Hiện chữ' : '🙈 Che chữ', st.hide ? 'on' : 'alt') +
        (m.pages.some(p => p.q) ? b('q', '❓ Câu hỏi', st.q ? 'on' : 'alt') : ''); break;
      case 'cua': x = b('new', '🎲 Lượt mới') + b('show', '👀 Câu đúng', 'alt') + lg(); break;
      case 'chon': x = (m.xep ? b('next', '🔊 Câu tiếp') + b('show', '👀 Đặt tranh', 'alt') + b('reset', '↺ Xếp lại', 'alt') : b('call', '🎲 Gọi') + b('show', '👀 Đáp án', 'alt')) + b('lang', { en: '🇬🇧 EN', zh: '🇨🇳 中文', xen: '🔀 EN ↔ 中文' }[st.lang], 'alt'); break;
      case 'says': x = b('new', '🎲 Lệnh mới') + b('again', '🔁 Nghe lại', 'alt') + b('reveal', '👀 Lộ', 'alt') +
        b('lua', st.lua ? '😜 Có lệnh lừa' : '🙂 Chưa lừa', st.lua ? 'on' : 'alt') + b('who', { xen: '🔀 Leo ↔ Xiaomei', leo: '🇬🇧 Chỉ Leo', xiaomei: '🇨🇳 Chỉ Xiaomei' }[st.mode], 'alt'); break;
      case 'cau': x = b('leo', '🔊 Leo nói') + b('xm', m.pdn ? '👀 Xiaomei nói' : '🔊 Xiaomei nói') + (m.pairs.length > 1 ? b('pj1', 'Câu sau ›', 'alt') : ''); break;
      case 'dien': x = b('dj-1', '‹', 'alt') + b('dj1', 'Lời sau ›') + lg() + b('hide', st.hide ? '🙉 Hiện lời' : '🙈 Che lời', st.hide ? 'on' : 'alt'); break;
      case 'move': x = b('mj1', '🔊 Lệnh tiếp'); break;
      case 'nghi': x = st.end ? b('pause', '⏸ Dừng giờ') : b('start', `▶ Bắt đầu ${Math.round(st.left / 60)}′`); break;
      case 'kt': x = b('kplay', '🔊 Đọc câu') + b('kshow', '👀 Đáp án', 'alt') + b('kj1', 'Câu sau ›', 'alt'); break;
    }
    if (m.game || m.type === 'tong' || m.type === 'says') x += `<span class="sp"></span>` + b('A', '🐶 +1', 'alt') + b('B', '🐱 +1', 'alt');
    $('#ctrl').innerHTML = `<button type="button" class="nav" id="prev" ${S.i ? '' : 'disabled'}>‹ Trước</button><span class="n">${S.i + 1}/${MAN.length}</span>` +
      `<button type="button" class="nav" id="next" ${S.i < MAN.length - 1 ? '' : 'disabled'}>Sau ›</button>${x}`;
  }

  /* ---------------- lời cô ---------------- */
  function itemsOf(m) {
    const out = [], add = x => { if (x && (x.en || x.zh) && !out.includes(x)) out.push(x); };
    (m.lines || []).forEach(add); add(m.line);
    (m.pairs || []).forEach(p => { if (p.q) { add(p.q); add(p.a); } else add(p); });
    (m.pages || []).forEach(add); (m.cards || []).forEach(add); (m.cmds || []).forEach(add);
    (m.items || []).forEach(x => { if (x.hi) { add(x.hi); add(x.bye); } else add(x); });
    return out;
  }
  function renderNote() {
    const m = cur(), k = KHOI.find(x => x.n === m.k), v = VAI[m.vai || BU.vai] || VAI.mau;
    let h = `<div class="t">Khối ${k.n} · ${k.tu}–${k.den}′ · ${esc(k.t)}</div><h3>${esc(m.t)}</h3>` +
      `<div class="chips">${m.p ? `<span>⏱ ${m.p}′</span>` : ''}<span>${v[0]} ${v[1]}</span>${m.off ? '<span class="off">📴 Tắt chiếu</span>' : ''}${m.du ? '<span class="du">⏳ Dự phòng</span>' : ''}</div>`;
    if (m.con) h += `<h4>Việc của con</h4><p class="con">${esc(m.con)}</p>`;
    h += `<h4>Lời cô</h4><ul>${(m.note || []).map(x => `<li>${esc(x)}</li>`).join('')}<li class="vai-li">${v[0]} ${esc(v[2])}</li></ul>`;
    if (m.hoi) h += `<h4>Hỏi con</h4><ul>${m.hoi.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
    if (m.type === 'book' && m.pages.some(p => p.q)) {
      const qs = [...new Set(m.pages.filter(p => p.q).map(p => [p.q.en, p.q.zh, p.q.vi].filter(Boolean).join(' · ')))];
      h += `<h4>Câu hỏi theo trang (bấm ❓)</h4><ul>${qs.length === 1 ? `<li>Mọi trang: ${esc(qs[0])}</li>` : m.pages.map((p, i) => p.q ? `<li>Tr.${i + 1}: ${esc([p.q.en, p.q.zh, p.q.vi].filter(Boolean).join(' · '))}</li>` : '').join('')}</ul>`;
    }
    if (m.type === 'cau') h += `<h4>Giống – khác (cô nói, con tìm)</h4><ul>${m.pairs.map(p => `<li><b>${esc(p.en)}</b> · <span class="zh">${esc(p.zh)}</span><br>${esc(p.gk || '')}</li>`).join('')}</ul>`;
    if (m.print) h += `<h4>In / mở trang in</h4><div class="row">${m.print.map(p => `<a class="tbtn" target="_blank" rel="noopener" href="${esc(p.url)}">🖨 ${esc(p.t)}</a>`).join('')}</div>`;
    const lines = itemsOf(m);
    if (lines.length) h += `<h4>Câu trên màn (cô đọc theo)</h4>` + lines.slice(0, 40).map(x => `<div class="say">${x.en ? `<b style="color:var(--en)">${esc(x.en)}</b>` : ''}${x.zh ? ` <span class="zh" style="color:var(--zh)">${esc(x.zh)}</span> <span class="py">${esc(x.py || '')}</span>` : ''}</div>`).join('');
    if (m.type === 'tong') { const chua = MAN.filter(x => S.chua[x.id]); if (chua.length) h += `<h4>Màn chưa dạy (bù buổi sau)</h4><ul>${chua.map(x => `<li>${esc(x.t)}</li>`).join('')}</ul>`; }
    h += `<label class="chk"><input type="checkbox" id="chua" ${S.chua[m.id] ? 'checked' : ''}> Chưa dạy màn này, để bù buổi sau</label>`;
    if (m.game || m.type === 'tong') h += `<h4>Sao hai đội</h4><div class="row"><button type="button" class="tbtn" data-a="team0">↺ Về 0</button></div>`;
    h += `<h4>Phím tắt</h4><div class="tiny">← → chuyển màn · Cách: việc chính của màn · L đổi tiếng · F toàn màn hình · P hiện/ẩn pinyin</div>`;
    $('#note').innerHTML = h;
  }

  /* ---------------- hành động ---------------- */
  async function doAct(a) {
    const m = cur(), st = ST(m);
    if (a === 'A' || a === 'B') { S.team[a]++; store.set(key('team'), S.team); updTeams(); const t = $('#t' + a); if (t) { t.classList.remove('bump'); void t.offsetWidth; t.classList.add('bump'); } blip(1200, .1, 'triangle'); sync(); return; }
    if (a === 'team0') { S.team = { A: 0, B: 0 }; store.set(key('team'), S.team); updTeams(); sync(); return; }
    switch (a) {
      case 'play': case 'pause': if (m.type === 'song') { if (peer()) post({ k: 'yt', c: a }); else ytCmd(a); return; } break;
      case 'freeze': if (peer()) { post({ k: 'yt', c: 'freeze' }); } else ytCmd('freeze'); return;
      case 'lang': return change(s => {
        if (m.type === 'chon') s.lang = { en: 'zh', zh: 'xen', xen: 'en' }[s.lang];
        else { s.lang = s.lang === 'zh' ? 'en' : 'zh'; if (m.type === 'book') { s.p = 0; s.q = false; } if (m.type === 'dien') s.j = 0; if (m.type === 've') s.cur = -1; }
      });
    }
    switch (m.type) {
      case 've':
        if (a === 'beat') { beat(!beatT); renderCtrl(); return; }
        if (a === 'to' || a === 'nho') { change(s => { s.loud = s.loud === a ? '' : a; }); a === 'to' ? blip(220, .3, 'sawtooth', .15) : blip(1800, .08, 'sine', .2); return; }
        if (a === 'sing') { const run = ++seq; for (let i = 0; i < m.lines.length; i++) { change(s => { s.cur = i; }); if (!(await say(m.lines[i], st.lang)) || seq !== run) break; await sleep(250); if (seq !== run) break; }
          if (cur() === m) change(s => { s.cur = -1; }); return; }
        return;
      case 'hoi':
        if (a === 'ask') return say(m.pairs[st.j].q, st.lang);
        if (a === 'ans') { change(s => { s.show = true; }); return say(m.pairs[st.j].a, st.lang); }
        if (a === 'pj1') { change(s => { s.j = (s.j + 1) % m.pairs.length; s.show = false; }); return say(m.pairs[ST(m).j].q, st.lang); }
        return;
      case 'flash':
        if (a === 'mode') return change(s => { s.mode = s.mode === 'sts' ? 'ts' : 'sts'; });
        if (a === 'unzoom') return change(s => { s.on = -1; });
        if (a === 'fc1') return showCard((st.on + 1) % m.cards.length);
        if (a === 'round') { const run = ++seq; for (let i = 0; i < m.cards.length; i++) { if (seq !== run || cur() !== m) return; await showCard(i, run); await sleep(400); } if (cur() === m) change(s => { s.on = -1; }); }
        return;
      case 'book':
        if (a === 'pg1' || a === 'pg-1') return turn(+a.slice(2));
        if (a === 'hide') return change(s => { s.hide = !s.hide; });
        if (a === 'q') { change(s => { s.q = !s.q; }); const p = m.pages[ST(m).p]; if (ST(m).q && p.q) say(p.q, st.lang); return; }
        if (a === 'read') { const run = ++seq; for (let p = st.p; p < m.pages.length; p++) { if (seq !== run || cur() !== m) return; change(s => { s.p = p; }); if (!(await say(m.pages[p], st.lang)) && seq !== run) return; await sleep(900); } }
        return;
      case 'cua':
        if (a === 'new') { change(s => { s.n++; s.c = rnd(m.items.length, s.c); const it = m.items[s.c]; s.dir = !m.nodoor && it.bye && Math.random() < .5 ? 'out' : 'in'; s.show = false; }); blip(500, .12, 'triangle'); return; }
        if (a === 'show') { const it = m.items[st.c]; if (!it) return; change(s => { s.show = true; }); chime(); await sleep(300); return say(st.dir === 'out' && it.bye ? it.bye : it.hi, st.lang); }
        return;
      case 'chon': {
        const L = s => s.lang === 'xen' ? (s.n % 2 ? 'en' : 'zh') : s.lang;
        if (a === 'call') { change(s => { s.n++; s.pick = rnd(m.items.length, s.pick); s.show = false; s.order = shuffle(s.order); s.cl = L(s); }); await sleep(300); return say(m.items[ST(m).pick], ST(m).cl); }
        if (a === 'show') {
          if (m.xep) { if (st.pick < 0 || st.done.includes(st.pick)) return; change(s => { s.done = [...s.done, s.pick]; }); chime(); return; }
          if (st.pick >= 0) { change(s => { s.show = true; }); chime(); } return;
        }
        if (a === 'next') { const nx = m.items.findIndex((_, i) => !st.done.includes(i)); if (nx < 0) return; change(s => { s.pick = nx; s.n++; s.cl = L(s); }); return say(m.items[nx], ST(m).cl); }
        if (a === 'reset') return change(s => { s.done = []; s.pick = -1; s.order = shuffle(s.order); });
        return;
      }
      case 'says':
        if (a === 'new') { change(s => { s.n++; s.who = s.mode === 'xen' ? (s.n % 2 ? 'leo' : 'xiaomei') : s.mode; s.c = rnd(m.cmds.length, s.c); s.trap = s.lua && Math.random() < 0.3; s.show = false; }); return speakCmd(m, ST(m)); }
        if (a === 'again') return speakCmd(m, st);
        if (a === 'reveal') { if (st.c >= 0) { change(s => { s.show = true; }); st.trap ? blip(300, .25, 'sawtooth', .12) : chime(); } return; }
        if (a === 'lua') return change(s => { s.lua = !s.lua; });
        if (a === 'who') return change(s => { s.mode = { xen: 'leo', leo: 'xiaomei', xiaomei: 'xen' }[s.mode]; });
        return;
      case 'cau':
        if (a === 'leo') return say(m.pairs[st.j], 'en');
        if (a === 'xm') { change(s => { s.show = true; }); if (m.pdn) chime(); await sleep(200); return say(m.pairs[st.j], 'zh'); }
        if (a === 'pj1') { change(s => { s.j = (s.j + 1) % m.pairs.length; s.show = !m.pdn; }); return say(m.pairs[ST(m).j], 'en'); }
        return;
      case 'dien':
        if (a === 'hide') return change(s => { s.hide = !s.hide; });
        if (a === 'dj1' || a === 'dj-1') { const j = Math.max(0, Math.min(m.lines.length - 1, st.j + +a.slice(2))); if (j === st.j) return; change(s => { s.j = j; }); if (!ST(m).hide) say(m.lines[j], st.lang); }
        return;
      case 'move': if (a === 'mj1') { change(s => { s.j = (s.j + 1) % m.cmds.length; }); const c = m.cmds[ST(m).j]; if (await say(c, 'en')) { await sleep(400); say(c, 'zh'); } } return;
      case 'nghi':
        if (a === 'start') return change(s => { s.end = Date.now() + s.left * 1000; });
        if (a === 'pause') return change(s => { s.left = Math.max(0, Math.round((s.end - Date.now()) / 1000)); s.end = null; });
        return;
      case 'kt': {
        const it = m.items[st.j];
        if (a === 'kplay') return say({ [it.say.l]: it.say.t, ['a_' + it.say.l]: it.a || [] }, it.say.l);
        if (a === 'kshow') { change(s => { s.show = !s.show; }); return; }
        if (a === 'kj1') { change(s => { s.j = (s.j + 1) % m.items.length; s.show = false; }); const n = m.items[ST(m).j]; return say({ [n.say.l]: n.say.t, ['a_' + n.say.l]: n.a || [] }, n.say.l); }
        return;
      }
    }
  }
  async function showCard(i, run) {
    const m = cur(), st = ST(m), c = m.cards[i];
    change(s => { s.on = i; s.lb = st.mode !== 'sts'; });
    if (st.mode === 'sts') { await sleep(3000); if (run && seq !== run) return; change(s => { s.lb = true; }); await say(c, st.lang); await sleep(1800); return; }
    if (!(await say(c, st.lang))) return; await sleep(1800); if (run && seq !== run) return; await say(c, st.lang); await sleep(1600);
  }
  async function speakCmd(m, st) {
    const c = m.cmds[st.c]; if (!c) return;
    const l = st.who === 'xiaomei' ? 'zh' : 'en';
    if (!st.trap) { if (!(await say(NOI[l], l))) return; await sleep(150); }
    say(c, l);
  }
  function turn(d) {
    const m = cur(), st = ST(m), p = Math.max(0, Math.min(m.pages.length - 1, st.p + d));
    if (p === st.p) return; change(s => { s.p = p; s.q = false; }); if (!st.hide) say(m.pages[p], st.lang);
  }
  function primary() {
    const m = cur(), st = ST(m);
    const map = { song: m.freeze ? 'freeze' : 'play', ve: 'sing', hoi: st.show ? 'pj1' : 'ans', flash: 'fc1', book: 'pg1', cua: st.c >= 0 && !st.show ? 'show' : 'new',
      chon: m.xep ? (st.pick >= 0 && !st.done.includes(st.pick) ? 'show' : 'next') : (st.pick >= 0 && !st.show ? 'show' : 'call'),
      says: 'new', cau: st.show ? 'pj1' : 'xm', dien: 'dj1', move: 'mj1', nghi: st.end ? 'pause' : 'start', kt: 'kj1' };
    if (map[m.type]) doAct(map[m.type]); else if (S.i < MAN.length - 1) go(S.i + 1);
  }

  /* ---------------- sự kiện ---------------- */
  if (!CHIEU) {
    document.addEventListener('click', e => {
      const t = e.target.closest('button,[data-say]'); if (!t) return;
      if (t.dataset.a !== 'sing' && t.dataset.a !== 'round' && t.dataset.a !== 'read') seq++;
      if (t.dataset.lv) { if (t.dataset.lv !== LV) { const bs = buoiList(t.dataset.lv); switchTo(t.dataset.lv, bs.includes(B) ? B : bs[0]); } return; }
      if (t.dataset.b) return switchTo(LV, +t.dataset.b);
      if (t.id === 'prev') return go(S.i - 1);
      if (t.id === 'next') return go(S.i + 1);
      if (t.dataset.k) { const i = MAN.findIndex(x => x.k === +t.dataset.k); return go(i); }
      if (t.id === 'bFs') { const b = $('#stageBox'); try { document.fullscreenElement ? document.exitFullscreen() : b.requestFullscreen().catch(() => {}); } catch (er) {} return; }
      if (t.id === 'bWin') { window.open('?chieu', 'buoi-chieu', 'width=1280,height=760'); setTimeout(sync, 800); return; }
      if (t.id === 'bRec') return openRec();
      if (t.id === 'bStart') { S.t0 = Date.now(); store.set(key('t0'), S.t0); renderTop(); return; }
      if (t.id === 'bReset') { if (confirm('Đặt lại đồng hồ buổi học?')) { S.t0 = null; store.set(key('t0'), null); renderTop(); } return; }
      if (t.dataset.a) return doAct(t.dataset.a);
      const m = cur();
      if (t.dataset.v != null && m.type === 'song') return change(s => { s.v = +t.dataset.v; });
      if (t.dataset.cmd != null) { const c = m.cmds[+t.dataset.cmd]; change(s => { s.c = +t.dataset.cmd; s.trap = false; s.show = false; }); (async () => { if (await say(c, 'en')) { await sleep(350); say(c, 'zh'); } })(); return; }
      if (t.dataset.fc != null) return showCard(+t.dataset.fc);
      if (t.dataset.pg) return turn(+t.dataset.pg);
      if (t.dataset.ch != null) { const st = ST(m), i = +t.dataset.ch;
        if (m.xep) { if (st.pick >= 0 && i === st.pick && !st.done.includes(i)) doAct('show'); else blip(300, .12, 'sawtooth', .1); return; }
        if (st.pick >= 0 && !st.show) { doAct('show'); if (i === st.pick) blip(1400, .15, 'triangle'); } else { change(s => { s.pick = i; s.show = true; }); say(m.items[i], st.lang === 'zh' ? 'zh' : 'en'); } return; }
      if (t.dataset.say) { const r = t.closest('[data-r]'); if (r) say(REG[+r.dataset.r], t.dataset.say, t.classList.contains('au') ? t : null); }
    });
    document.addEventListener('change', e => { if (e.target.id === 'chua') { const m = cur(); if (e.target.checked) S.chua[m.id] = 1; else delete S.chua[m.id]; store.set(key('chua'), S.chua); renderTop(); } });
    document.addEventListener('keydown', e => {
      if (e.target.closest('input,textarea') || $('.dlg')) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); go(S.i + 1); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(S.i - 1); }
      else if (e.key === ' ') { e.preventDefault(); seq++; primary(); }
      else if (e.key === 'f' || e.key === 'F') $('#bFs').click();
      else if (e.key === 'l' || e.key === 'L') { if ('lang' in ST(cur())) doAct('lang'); }
      else if (e.key === 'p' || e.key === 'P') { S.py = !S.py; store.set('py', S.py); render(); sync(); }
    });
  }
  function zoomShow() {}

  /* ---------------- 🎙 Giọng đọc: xem, thu, chuyển máy (cùng kho với Buổi 0) ---------------- */
  function allLines() {
    const out = new Map();
    const walk = o => { if (!o || typeof o !== 'object') return; if (Array.isArray(o)) return o.forEach(walk);
      for (const l of ['en', 'zh']) if (typeof o[l] === 'string' && o[l] && ('m_' + l) in o) { const k = l + ':' + o[l]; if (!out.has(k)) out.set(k, { k, l, t: o[l], m: o['m_' + l], item: o }); }
      Object.values(o).forEach(walk); };
    walk(MAN); walk(NOI);
    return [...out.values()];
  }
  let recMR = null, recKey = '', onlyMiss = true;
  function openRec() {
    stopAudio(); let d = $('.dlg'); if (!d) { d = document.createElement('div'); d.className = 'dlg'; document.body.appendChild(d); }
    const L = allLines(), n = { file: 0, ghep: 0, may: 0, rec: 0 };
    L.forEach(x => { if (REC.has(x.k)) n.rec++; else n[x.m]++; });
    const rows = L.filter(x => !onlyMiss || x.m === 'may' || REC.has(x.k)).sort((a, b) => (a.m === 'may' ? 0 : 1) - (b.m === 'may' ? 0 : 1));
    const stt = x => REC.has(x.k) ? '🎙 giọng cô' : { file: '📁 có sẵn', ghep: '🧩 ghép mảnh', may: '🤖 giọng máy' }[x.m];
    d.innerHTML = `<div class="box" role="dialog" aria-label="Giọng đọc mẫu">
      <div class="head"><h2>🎙 Giọng đọc mẫu · Buổi ${B}</h2><span class="sp"></span><button type="button" class="b" data-x="close">Đóng ✕</button></div>
      <p>${L.length} câu trong buổi: <b>${n.file}</b> dùng giọng có sẵn của web, <b>${n.ghep}</b> ghép mảnh, <b>${n.may}</b> đang đọc bằng giọng máy, <b>${n.rec}</b> cô đã thu.
      Cô bấm ● Thu, đọc câu, bấm ■ Dừng: trang dùng giọng cô thay giọng máy. Giọng thu lưu trong trình duyệt của máy này (dùng chung với Buổi 0); soạn ở nhà thì "Tải về", sang máy lớp "Nạp file".</p>
      <div class="head"><label><input type="checkbox" id="onlyMiss" ${onlyMiss ? 'checked' : ''}> Chỉ hiện câu chưa có giọng thật</label><span class="sp"></span>
      <button type="button" class="b" data-x="export">⬇ Tải về giọng đã thu</button><label class="b" style="cursor:pointer">⬆ Nạp file<input type="file" accept=".json" id="imp" hidden></label></div>
      <table><thead><tr><th></th><th>Câu</th><th>Hiện dùng</th><th></th></tr></thead><tbody>${rows.map(x => `<tr>
        <td><span class="lg ${x.l}">${x.l === 'en' ? 'EN' : '中'}</span></td><td class="${x.l === 'zh' ? 'zh' : ''}">${esc(x.t)}</td><td class="st">${stt(x)}</td>
        <td style="white-space:nowrap"><button type="button" class="b" data-x="play" data-k="${esc(x.k)}">▶</button><button type="button" class="b r${recKey === x.k ? ' on' : ''}" data-x="rec" data-k="${esc(x.k)}">${recKey === x.k ? '■ Dừng' : '● Thu'}</button>${REC.has(x.k) ? `<button type="button" class="b" data-x="del" data-k="${esc(x.k)}">🗑</button>` : ''}</td></tr>`).join('')}</tbody></table>
      ${rows.length ? '' : '<p>Mọi câu đều đã có giọng thật. Bỏ dấu ở ô trên để xem hoặc thu lại bất kỳ câu nào.</p>'}</div>`;
    d.onclick = async e => {
      if (e.target === d) return closeRec();
      const b = e.target.closest('[data-x]'); if (!b) return;
      const x = b.dataset.x, k = b.dataset.k, it = k && L.find(y => y.k === k);
      if (x === 'close') return closeRec();
      if (x === 'play' && it) return say(it.item, it.l);
      if (x === 'del') { await REC.del(k); openRec(); render(); return; }
      if (x === 'export') return exportRec();
      if (x === 'rec') {
        if (recMR) { recMR.stop(); return; }
        try {
          const sm = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
          const ch = []; recMR = new MediaRecorder(sm); recKey = k;
          recMR.ondataavailable = ev => ev.data.size && ch.push(ev.data);
          recMR.onstop = async () => { sm.getTracks().forEach(t => t.stop()); const blob = new Blob(ch, { type: recMR.mimeType || 'audio/webm' }); recMR = null; recKey = '';
            if (blob.size > 1500) await REC.put(k, blob); openRec(); render(); if (it) say(it.item, it.l); };
          recMR.start(); openRec();
        } catch (er) { alert('Không mở được micro. Cô cho phép trang dùng micro rồi thử lại.'); }
      }
    };
    $('#onlyMiss', d).onchange = e => { onlyMiss = e.target.checked; openRec(); };
    $('#imp', d).onchange = e => importRec(e.target.files[0]);
  }
  function closeRec() { if (recMR) recMR.stop(); const d = $('.dlg'); if (d) d.remove(); }
  async function exportRec() {
    const ks = await REC.all(), out = {};
    for (const k of ks || []) { const b = await REC.get(k); if (b) out[k] = { type: b.type, data: await new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(b); }) }; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(out)], { type: 'application/json' }));
    a.download = 'giong-co-tren-lop.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 3000);
  }
  async function importRec(f) {
    if (!f) return;
    try { const j = JSON.parse(await f.text()); let n = 0;
      for (const [k, v] of Object.entries(j)) { const b = await (await fetch(v.data)).blob(); await REC.put(k, b); n++; }
      alert(`Đã nạp ${n} câu giọng cô.`); openRec(); render();
    } catch (e) { alert('File không đúng định dạng giọng đã thu.'); }
  }

  REC.load().then(() => { render(); if (!CHIEU) sync(); });
  render();
})();
