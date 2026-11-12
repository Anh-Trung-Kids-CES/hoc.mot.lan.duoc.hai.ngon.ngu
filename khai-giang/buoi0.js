/* =====================================================================
   BUỔI 0 · KHAI GIẢNG – web trình chiếu cho cô (Little Seed 48 và Seedling 48)
   - Dữ liệu: window.B0 trong buoi0-data.js (sinh từ cong-cu/noi-dung.js bởi cong-cu/build_buoi0.js).
   - Giọng đọc mẫu, theo thứ tự ưu tiên: giọng cô tự thu trên trang (🎙, lưu IndexedDB của máy) → file giọng có sẵn
     của web Little Seed / Seedling (nguyên câu hoặc ghép mảnh) → giọng máy của trình duyệt (nút có viền chấm).
   - Bài hát khởi động: YouTube nhúng (youtube-nocookie), lấy từ kho "Xem thêm" của web.
   - 📺 Cửa sổ chiếu: mở ?chieu ở cửa sổ thứ hai, kéo sang TV. Cửa sổ chiếu theo màn cô qua BroadcastChannel,
     video phát ở cửa sổ chiếu, âm thanh câu mẫu phát ở máy cô.
   ===================================================================== */
(function () {
  'use strict';
  const D = window.B0, MAN = D.MAN, KHOI = D.KHOI, NOI = D.NOI;
  const CHIEU = new URLSearchParams(location.search).has('chieu');
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const store = {
    get(k, d) { try { const v = localStorage.getItem('b0-' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('b0-' + k, JSON.stringify(v)); } catch (e) {} },
  };
  const NV = '../seedling/tai-nguyen/nhan-vat/';
  const MAU = { do: ['Đỏ', '#E2524A', '🍎'], vang: ['Vàng', '#F2B705', '🌼'], xanh: ['Xanh lá', '#38A85F', '🍀'], lam: ['Xanh dương', '#2F7FD8', '💧'] };

  const LOP = new URLSearchParams(location.search).get('lop');
  const S = { lv: /^(ls|sd)$/.test(LOP || '') ? LOP : store.get('lv', 'ls'), i: Math.min(store.get('i', 0), MAN.length - 1), st: {}, team: store.get('team', { A: 0, B: 0 }),
    py: store.get('py', true), t0: store.get('t0', null), zalo: store.get('zalo', '') };
  const pick = v => (v && typeof v === 'object' && !Array.isArray(v) && ('ls' in v || 'sd' in v)) ? v[S.lv] : v;
  const cur = () => MAN[S.i];
  const ST = m => (S.st[m.id] = S.st[m.id] || init(m));
  function init(m) {
    switch (m.type) {
      case 'song': return { v: 0 };
      case 'mau': return { on: false, mau: null, n: 0 };
      case 've': case 'show': return { cur: -1, loud: '' };
      case 'says': return { who: 'leo', c: -1, trap: false, n: 0, lua: false, mode: 'xen', show: false };
      case 'cast': return { on: -1 };
      case 'story': return { p: 0 };
      case 'cham': return { order: [0, 1, 2, 3, 4, 5], pick: -1, lang: 'en', show: false, n: 0 };
      case 'photo': return { c: null, n: 0 };
      default: return {};
    }
  }

  /* ---------------- giọng cô thu trên trang (IndexedDB) ---------------- */
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
      has: k => keys.has(k), size: () => keys.size,
    };
  })();

  /* ---------------- phát giọng ---------------- */
  const AU = new Audio(); AU.preload = 'auto';
  let tok = 0, curBtn = null, seq = 0; // seq: chuỗi câu (hát mẫu cả bài) dừng khi cô bấm việc khác
  function stopAudio() {
    tok++; AU.onended = AU.onerror = null; AU.pause();
    try { speechSynthesis.cancel(); } catch (e) {}
    if (curBtn) { curBtn.classList.remove('play'); curBtn = null; }
  }
  const playUrl = (u, t) => new Promise(res => {
    if (t !== tok) return res();
    AU.onended = res; AU.onerror = res; AU.src = u; AU.play().catch(res);
  });
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
    if (CHIEU || !item || !item[l]) return;
    stopAudio(); const my = tok;
    if (btn) { curBtn = btn; btn.classList.add('play'); }
    try {
      const rec = await REC.get(l + ':' + item[l]);
      if (my !== tok) return;
      if (rec) { const u = URL.createObjectURL(rec); await playUrl(u, my); URL.revokeObjectURL(u); }
      else if ((item['a_' + l] || []).length) { for (const u of item['a_' + l]) { if (my !== tok) return; await playUrl(u, my); await sleep(70); } }
      else await tts(item[l], l, my);
    } finally { if (my === tok && btn) { btn.classList.remove('play'); curBtn = null; } }
    return my === tok;
  }
  async function sayBoth(item) { if (await say(item, 'en')) { await sleep(350); await say(item, 'zh'); } }

  /* ---------------- tiếng gõ nhịp, chuông (Web Audio, không cần file) ---------------- */
  let AC = null;
  const ac = () => { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); } catch (e) {} return AC; };
  function blip(f = 880, d = 0.08, type = 'sine', vol = 0.25, at = 0) {
    const a = ac(); if (!a) return; const t = a.currentTime + at, o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.value = f; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + d + 0.02);
  }
  const chime = () => { blip(660, .18, 'triangle', .3); blip(880, .18, 'triangle', .3, .12); blip(1320, .3, 'triangle', .25, .24); };
  const shutter = () => { blip(2000, .05, 'square', .15); blip(900, .08, 'square', .12, .05); };
  let beatT = null, beatN = 0;
  function beat(on) {
    clearInterval(beatT); beatT = null; beatN = 0; showBeat(-1); post({ k: 'beat', b: -1 });
    if (!on) return;
    beatT = setInterval(() => { const b = beatN++ % 4; blip(b ? 1100 : 1600, .05, 'square', b ? .12 : .2); showBeat(b); post({ k: 'beat', b }); }, 625);
  }
  const showBeat = b => $$('.beat i').forEach((x, i) => x.classList.toggle('on', i === b));
  const NHAC = new Audio(); NHAC.loop = true;

  /* ---------------- cửa sổ chiếu ---------------- */
  const BC = 'BroadcastChannel' in window ? new BroadcastChannel('buoi0-khai-giang') : null;
  let peerAt = 0;
  const peer = () => !CHIEU && Date.now() - peerAt < 4500;
  const post = m => { if (BC) try { BC.postMessage(m); } catch (e) {} };
  const sync = () => { if (!CHIEU) post({ k: 's', S: { lv: S.lv, i: S.i, st: S.st, team: S.team, py: S.py, zalo: S.zalo } }); };
  if (BC) BC.onmessage = e => {
    const d = e.data || {};
    if (CHIEU) {
      if (d.k === 's') { const key = rkey(); Object.assign(S, d.S); if (rkey() !== key) render(); else updTeams(); }
      else if (d.k === 'yt') ytCmd(d.c, d.f);
      else if (d.k === 'fz') freezeShow(d.on, d.f);
      else if (d.k === 'beat') showBeat(d.b);
      else if (d.k === 'cnt') countShow(d.c);
    } else if (d.k === 'hi') { const was = peer(); peerAt = Date.now(); if (!was) { sync(); if (cur().type === 'song') render(); } }
  };
  if (CHIEU) { setInterval(() => post({ k: 'hi' }), 1500); setTimeout(() => post({ k: 'hi' }), 100); }
  else setInterval(() => { if (!peer() && peerAt && cur().type === 'song' && !$('.vid [data-yt]')) { peerAt = 0; render(); } }, 2000);
  const rkey = () => { const m = cur(), s = Object.assign({}, S.st[m.id] || {}); return [S.lv, S.i, S.py, S.zalo, JSON.stringify(s)].join('|'); };

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
  function ytCmd(c, f) {
    const ok = YTP && YTP.playVideo;
    if (c === 'play' && ok) YTP.playVideo();
    if (c === 'pause' && ok) YTP.pauseVideo();
    if (c === 'freeze') { if (ok) YTP.pauseVideo(); freezeShow(true, f); clearTimeout(fzT); fzT = setTimeout(() => { freezeShow(false); if (YTP && YTP.playVideo) YTP.playVideo(); }, 3200); }
  }
  function freezeShow(on, f) {
    $$('.freeze').forEach(x => x.remove()); if (!on) return;
    const m = cur(), el = document.createElement('div'); el.className = 'freeze';
    el.innerHTML = m.id === 'tau' ? `🚉<small>Đỗ ga! Goodbye!</small>` : `🧊<small>Freeze! · 站住！</small>`;
    $('#slide').appendChild(el);
  }

  /* ---------------- thành phần ---------------- */
  let REG = [];
  function auBtn(item, l) {
    if (!item || !item[l]) return '';
    const k = l + ':' + item[l], c = ['au', l];
    if (REC.has(k)) c.push('rec'); else if (item['m_' + l] === 'may') c.push('may');
    return `<button type="button" class="${c.join(' ')}" data-say="${l}" aria-label="${l === 'en' ? 'Nghe tiếng Anh' : 'Nghe tiếng Trung'}">${l === 'en' ? 'EN' : '中'}</button>`;
  }
  const reg = item => REG.push(item) - 1;
  function sent(item, cls = '', pre = '') {
    return `<div class="sent ${cls}" data-r="${reg(item)}">${pre}<div class="tx" data-say="${item.en ? 'en' : 'zh'}">` +
      (item.en ? `<span class="en">${esc(item.en)}</span>` : '') + (item.zh ? `<span class="zh">${esc(item.zh)}</span>` : '') +
      (item.py ? `<span class="py">${esc(item.py)}</span>` : '') + `</div><div class="spk">${auBtn(item, 'en')}${auBtn(item, 'zh')}</div></div>`;
  }
  const head = m => `<div class="s-title">${esc(pick(m.t))}</div><div class="s-tag">${S.lv === 'ls' ? '🌱 Little Seed' : '🌿 Seedling'} · Buổi 0</div>`;
  const teams = () => `<div class="teams"><div class="team" id="tA"><img src="${NV}pets_cun_dung_a.webp" alt="Đội Cún"><span>${S.team.A}</span>⭐</div>` +
    `<div class="team" id="tB"><img src="${NV}pets_meo_ngoi_a.webp" alt="Đội Mèo"><span>${S.team.B}</span>⭐</div></div>`;
  function updTeams() { const a = $('#tA span'), b = $('#tB span'); if (a) a.textContent = S.team.A; if (b) b.textContent = S.team.B; }
  const rules = m => m.rules ? `<div class="rules"><ol>${m.rules.map(r => `<li>${esc(r)}</li>`).join('')}</ol></div>` : '';
  const coOf = m => (m.co || {})[S.lv];
  const people = m => [...m.ban, coOf(m)];

  /* ---------------- các loại màn ---------------- */
  const R = {
    chao(m) {
      const co = S.lv === 'ls' ? NV + 'huou_huou1_a.webp' : NV + 'nv_lan_a.webp';
      return head(m) + `<img class="pic big" src="${esc(pick(m.img))}" alt="">${m.id === 'chao' ? `<img class="co" src="${co}" alt="">` : ''}` +
        `<div class="lines">${pick(m.lines).map(x => sent(x)).join('')}</div>`;
    },
    song(m, st) {
      const s = m.songs[st.v] || m.songs[0], host = CHIEU || !peer();
      const vid = host ? `<div class="vid" id="vid"></div>`
        : `<div class="vid"><img class="th" src="https://i.ytimg.com/vi/${esc(s.id)}/hqdefault.jpg" alt=""><div class="msg">📺 Video đang phát ở cửa sổ chiếu</div></div>`;
      return head(m) + vid +
        `<div class="tabs">${m.songs.map((x, i) => `<button type="button" class="tab${i === st.v ? ' on' : ''}" data-v="${i}"><img src="https://i.ytimg.com/vi/${esc(x.id)}/mqdefault.jpg" alt=""><span><b class="${x.l === 'zh' ? 'zh' : ''}">${x.l === 'en' ? '🇬🇧 ' : '🇨🇳 '}${esc(x.t)}</b><small>${esc(x.c)} · YouTube</small></span></button>`).join('')}</div>` +
        `<div class="side">${m.rules ? rules(m) : ''}${(m.moves || []).map(x => `<div class="mv">${esc(x)}</div>`).join('')}${m.line ? sent(m.line, 'sm') : ''}</div>` + (m.game ? teams() : '');
    },
    theten(m) {
      const co = S.lv === 'ls' ? NV + 'huou_huou1_a.webp' : NV + 'nv_lan_a.webp';
      return head(m) + `<div class="tags">${m.mau.map(k => `<div class="tag c-${k}"><i class="hole"></i><b>${MAU[k][2]} ${MAU[k][0]}</b><span>Hello, ___!</span></div>`).join('')}</div>` +
        `<img class="co" src="${co}" alt=""><div class="lines">${pick(m.lines).map(x => sent(x, 'sm')).join('')}</div>`;
    },
    mau(m, st) {
      const c = st.mau && MAU[st.mau];
      const blob = st.on ? `<div class="blob go"><span><span class="feet">🎵👣</span>Đi nhẹ nhàng…</span></div>`
        : c ? `<div class="blob" style="background:${c[1]}"><span>${c[2]}<br>${c[0]}<small>Tìm bạn cùng màu!</small></span></div>`
          : `<div class="blob go"><span><span class="feet">🎨</span>Sẵn sàng chưa?</span></div>`;
      return head(m) + rules(m) + blob + (c && !st.on ? sent(m.line, 'sm') : '') + teams();
    },
    ve(m, st) {
      const bars = n => `<div class="vol">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= n ? 'on' : ''}" style="height:${30 + i * 26}px"></i>`).join('')}</div>`;
      const a = st.loud === 'to' ? `<div class="animal to"><div class="spk-ic">🔊</div>${bars(5)}<b>Hát to!</b></div>`
        : st.loud === 'nho' ? `<div class="animal nho"><div class="spk-ic">🔈</div>${bars(1)}<b>Hát nhỏ…</b></div>`
          : `<div class="animal pic"><img src="${esc(pick(m.img))}" alt=""><span>${esc(m.cap || '')}</span></div>`;
      return head(m) + `<div class="lines">${m.lines.map((x, i) => sent(x, i === st.cur ? 'cur' : '', `<div class="mv">${x.mv}<span class="mvt">${esc(x.mvt)}</span></div>`)).join('')}</div>` +
        `<div class="beat">${[1, 2, 3, 4, 1, 2, 3, 4].map(n => `<i>${n}</i>`).join('')}</div>` + a;
    },
    says(m, st) {
      const who = st.who === 'xiaomei' ? ['Xiaomei', NV + 'kids_xiaomei_a.webp', 'zh'] : ['Leo', NV + 'kids_leo_a.webp', 'en'];
      const c = m.cmds[st.c], l = who[2];
      const bub = !c ? `<div class="bub wait">Bấm 🎲 Lệnh mới để bắt đầu.<br>Có "${who[0]} says" thì làm theo!</div>`
        : `<div class="bub">${st.trap ? '' : `<span class="pre">${l === 'en' ? 'Leo says…' : 'Xiaomei 说……'}</span>`}<span class="cmd ${l}">${esc(c[l])}</span>${l === 'zh' ? `<span class="py">${esc(c.py)}</span>` : ''}<span class="ic">${c.ic}</span></div>`;
      const res = c && st.show ? (st.trap ? `<div class="res trap">😄 Bị lừa rồi! ${who[0]} không nói "${l === 'en' ? 'Leo says' : 'Xiaomei 说'}"</div>` : `<div class="res ok">👍 Làm đúng rồi!</div>`) : '';
      return head(m) + `<div class="who"><img src="${who[1]}" alt=""><b>${who[0]}</b></div>` + bub + res +
        `<div class="cmds">${m.cmds.map((x, i) => `<button type="button" class="cmdc${i === st.c ? ' on' : ''}" data-cmd="${i}"><img src="${esc(x.img)}" alt=""><b>${esc(x.en)}</b><span class="zh">${esc(x.zh)}</span></button>`).join('')}</div>` + rules(m) + teams();
    },
    cast(m, st) {
      return head(m) + `<div class="grid6">${people(m).map((p, i) => `<button type="button" class="fr${i === st.on ? ' on' : ''}" data-fr="${i}" data-r="${reg(p)}"><img src="${esc(p.img)}" alt=""><span><b>${esc(p.ten)}</b><span class="vi">${esc(p.vi)}</span><span class="h">${esc(p.en)}</span><span class="h zh">${esc(p.zh)}</span></span></button>`).join('')}</div>`;
    },
    story(m, st) {
      const ps = pick(m.pages), p = ps[Math.min(st.p, ps.length - 1)];
      return head(m) + `<img class="pic page" src="${esc(p[0])}" alt="">` + `<div class="lines">${sent(p[1], 'sm')}</div>` +
        `<div class="pg">${ps.map((_, i) => `<i class="${i === st.p ? 'on' : ''}"></i>`).join('')}</div>` +
        `<div class="arrows"><button type="button" data-pg="-1">‹</button><button type="button" data-pg="1">›</button></div>`;
    },
    cham(m, st) {
      const ps = people(m), p = ps[st.pick];
      const call = !p ? `<div class="call wait">Bấm 🎲 Gọi bạn · ai chạm đúng trước?</div>`
        : st.show ? `<div class="call ${st.lang}">${esc(p[st.lang])}</div>` : `<div class="call wait">🔊 Nghe kỹ… chạm vào bạn nào?</div>`;
      return head(m) + call + `<div class="grid6">${st.order.map(i => { const x = ps[i]; const cl = st.show && p ? (i === st.pick ? ' hit' : ' dim') : '';
        return `<button type="button" class="fr${cl}" data-ch="${i}"><img src="${esc(x.img)}" alt=""><b>${esc(x.ten)}</b></button>`; }).join('')}</div>` + rules(m) + teams();
    },
    photo(m, st) {
      return `<img class="bgimg" src="${esc(m.img)}" alt=""><div class="frame"></div>` + head(m) +
        (st.c ? (st.c === 'flash' ? `<div class="flash"></div><div class="cap">Hello! 👋 你好！</div>` : `<div class="num">${st.c}</div>`) : `<div class="cap">📸 One, two, three! · 一、二、三！</div>`);
    },
    show(m, st) {
      const ln = (x, i) => sent(x, i === st.cur ? 'cur' : '', `<div class="mv">${x.mv}</div>`);
      return head(m) + `<div class="col c1"><h4>👋 Vè chào đầu buổi</h4>${m.lines.slice(0, 2).map((x, i) => ln(x, i)).join('')}</div>` +
        `<div class="col c2"><h4>🎒 Vè chào cuối buổi</h4>${m.lines.slice(2).map((x, i) => ln(x, i + 2)).join('')}</div>` +
        `<div class="beat" style="position:absolute;left:190px;top:560px;width:900px;display:flex;gap:18px;justify-content:center">${[1, 2, 3, 4, 1, 2, 3, 4].map(n => `<i style="width:56px;height:56px;border-radius:50%;background:var(--soft);display:grid;place-items:center;font-style:normal;font-size:22px;font-weight:800;color:var(--muted)">${n}</i>`).join('')}</div>`;
    },
    web(m) {
      const u = pick(m.url);
      return head(m) + `<div class="qr"><div class="q"><img src="qr-${S.lv}.svg" alt="Mã QR mở web học"></div><div class="u">${esc(u)}</div></div><ol class="steps">${pick(m.steps).map(x => `<li>${esc(x)}</li>`).join('')}</ol>`;
    },
    lich(m) {
      return head(m) + `<div class="items">${m.items.map(x => `<div class="it"><div class="e">${x[0]}</div><b>${esc(x[1])}</b><span>${esc(x[2])}</span></div>`).join('')}</div>` +
        `<div class="qr"><b>💬 Nhóm Zalo lớp</b>${S.zalo ? `<div class="q" id="qr2"></div>` : `<div class="empty">Cô dán link nhóm Zalo vào ô "Nhóm Zalo" bên phải, mã QR sẽ hiện ở đây.</div>`}</div>`;
    },
  };

  /* ---------------- dựng trang ---------------- */
  const app = $('#app');
  if (CHIEU) {
    document.body.classList.add('chieu');
    app.innerHTML = `<div class="stage-box" id="stageBox"><div class="stage" id="stage"><div class="slide" id="slide"></div></div></div>`;
    document.addEventListener('click', () => { try { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {}); } catch (e) {} }, { once: true });
  } else {
    app.innerHTML = `<header class="top">
      <div class="brand">Buổi 0 · Khai giảng<small>Anh – Trung – Kids · web trình chiếu của cô</small></div>
      <div class="seg" role="group" aria-label="Chọn lớp"><button type="button" data-lv="ls">🌱 Little Seed</button><button type="button" data-lv="sd">🌿 Seedling</button></div>
      <div class="sp"></div>
      <a class="tbtn" id="bNext" href="../buoi/?b=1" style="text-decoration:none">Buổi 1 ›</a>
      <div class="clock" id="clock"></div>
      <button type="button" class="tbtn" id="bRec">🎙 Giọng đọc</button>
      <button type="button" class="tbtn" id="bWin">📺 Cửa sổ chiếu</button>
      <button type="button" class="tbtn" id="bFs">⛶ Toàn màn hình</button>
    </header>
    <nav class="blocks" id="blocks" aria-label="Sáu khối của buổi"></nav>
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
    const songKey = m.type === 'song' ? [S.lv, S.i, st.v, CHIEU || !peer()].join('|') : '';
    if (m.type === 'song' && songKey === lastSong && $('#vid')) { // giữ nguyên video, chỉ cập nhật phần khác
      $$('.song .tab').forEach((b, i) => b.classList.toggle('on', i === st.v)); updTeams();
    } else {
      if (m.type !== 'song' || songKey !== lastSong) destroyVideo();
      slide.className = 'slide ' + m.type + (S.py ? '' : ' hide-py') + (m.type === 've' && st.loud ? (st.loud === 'to' ? ' loud' : ' quiet') : '');
      slide.innerHTML = R[m.type](m, st);
      if (m.type === 'song' && $('#vid')) mountVideo($('#vid'), (m.songs[st.v] || m.songs[0]).id);
      lastSong = songKey;
      if (m.type === 'lich' && S.zalo) qr('qr2', S.zalo);
    }
    fit();
    if (!CHIEU) { renderTop(); renderCtrl(); renderNote(); store.set('i', S.i); store.set('lv', S.lv); }
  }
  function qr(id, text) {
    const el = document.getElementById(id); if (!el) return;
    if (typeof QRCode !== 'function') { el.innerHTML = `<div class="empty">${esc(text)}</div>`; return; }
    try { new QRCode(el, { text, width: 300, height: 300, colorDark: '#3A2A1A', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.M }); } catch (e) {}
  }
  function go(i) {
    i = Math.max(0, Math.min(MAN.length - 1, i)); if (i === S.i) return;
    seq++; stopAudio(); beat(false); NHAC.pause(); freezeShow(false);
    const old = cur(); if (old.type === 'mau') ST(old).on = false;
    S.i = i; render(); sync();
  }
  const change = (f, full = true) => { f(ST(cur())); if (full) render(); sync(); };

  /* ---------------- thanh trên, khối, đồng hồ ---------------- */
  function renderTop() {
    $$('.seg [data-lv]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lv === S.lv)));
    const nx = $('#bNext'); if (nx) nx.href = '../buoi/?lop=' + S.lv + '&b=1';
    const m = cur(), el = mins();
    $('#blocks').innerHTML = KHOI.map(k => {
      const ids = MAN.map((x, i) => [x, i]).filter(([x]) => x.k === k.n);
      const now = el != null && el >= k.tu && el < k.den;
      return `<button type="button" class="blk${m.k === k.n ? ' on' : ''}${now ? ' now' : ''}" data-k="${k.n}"><b>${k.tu}–${k.den}′ · Khối ${k.n}</b>${esc(k.t)}<span class="dots">${ids.map(([, i]) => `<i class="${i === S.i ? 'cur' : ''}"></i>`).join('')}</span></button>`;
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
  if (!CHIEU) setInterval(() => { renderClock(); if (S.t0) $$('.blk').forEach(b => { const k = KHOI.find(x => x.n === +b.dataset.k), e = mins(); b.classList.toggle('now', e >= k.tu && e < k.den); }); }, 15000);

  /* ---------------- thanh điều khiển dưới màn ---------------- */
  function renderCtrl() {
    const m = cur(), st = ST(m), b = (a, t, c = '') => `<button type="button" class="act ${c}" data-a="${a}">${t}</button>`;
    let x = '';
    switch (m.type) {
      case 'song':
        x = b('play', '▶ Phát') + b('pause', '⏸ Dừng', 'alt') + (m.freeze ? b('freeze', m.id === 'tau' ? '🚉 Đỗ ga' : '🧊 Đứng hình') : ''); break;
      case 'mau': x = st.on ? b('stop', '✋ Dừng – ra màu') : b('go', '▶ Nhạc đi'); break;
      case 've': x = b('beat', beatT ? '🥁 Tắt nhịp' : '🥁 Nhịp', beatT ? 'on' : 'alt') + b('sing-en', '▶ Đọc mẫu EN') + b('sing-zh', '▶ 中文') +
        b('to', '🔊 Hát to', st.loud === 'to' ? 'on' : 'alt') + b('nho', '🔈 Hát nhỏ', st.loud === 'nho' ? 'on' : 'alt'); break;
      case 'says': x = b('new', '🎲 Lệnh mới') + b('again', '🔁 Nghe lại', 'alt') + b('reveal', '👀 Lộ', 'alt') +
        b('lua', st.lua ? '😜 Có lệnh lừa' : '🙂 Chưa lừa', st.lua ? 'on' : 'alt') +
        b('mode', { xen: '🔀 Leo ↔ Xiaomei', leo: '🇬🇧 Chỉ Leo', xiaomei: '🇨🇳 Chỉ Xiaomei' }[st.mode], 'alt'); break;
      case 'story': x = b('pg-1', '‹ Trang trước', 'alt') + b('pg1', 'Trang sau ›'); break;
      case 'cham': x = b('call', '🎲 Gọi bạn') + b('ans', '👀 Đáp án', 'alt'); break;
      case 'photo': x = b('count', '📸 Đếm'); break;
      case 'show': x = b('beat', beatT ? '🥁 Tắt nhịp' : '🥁 Nhịp', beatT ? 'on' : 'alt') + b('all-en', '▶ Cả bài EN') + b('all-zh', '▶ 中文'); break;
    }
    if (m.game) x += `<span class="sp"></span>` + b('A', '🐶 +1', 'alt') + b('B', '🐱 +1', 'alt');
    $('#ctrl').innerHTML = `<button type="button" class="nav" id="prev" ${S.i ? '' : 'disabled'}>‹ Trước</button><span class="n">${S.i + 1}/${MAN.length}</span>` +
      `<button type="button" class="nav" id="next" ${S.i < MAN.length - 1 ? '' : 'disabled'}>Sau ›</button>${x}`;
  }

  /* ---------------- lời cô ---------------- */
  function renderNote() {
    const m = cur(), k = KHOI.find(x => x.n === m.k), lines = [];
    const add = x => { if (x && (x.en || x.zh) && !lines.includes(x)) lines.push(x); };
    (pick(m.lines) || []).forEach(add); add(m.line);
    if (m.type === 'story') pick(m.pages).forEach(p => add(p[1]));
    if (m.type === 'says') m.cmds.forEach(add);
    if (m.type === 'cast' || m.type === 'cham') people(m).forEach(add);
    let h = `<div class="t">Khối ${k.n} · ${k.tu}–${k.den}′ · ${esc(k.t)}</div><h3>${esc(pick(m.t))}</h3><h4>Lời cô</h4><ul>${m.note.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
    if (m.hoi) h += `<h4>Hỏi con</h4><ul>${pick(m.hoi).map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
    if (m.type === 'lich') h += `<h4>Nhóm Zalo</h4><input id="zalo" type="url" placeholder="Dán link nhóm Zalo lớp" value="${esc(S.zalo)}">`;
    if (lines.length) h += `<h4>Câu trên màn (cô đọc theo)</h4>` + lines.map(x => `<div class="say">${x.en ? `<b style="color:var(--en)">${esc(x.en)}</b>` : ''}${x.zh ? ` <span class="zh" style="color:var(--zh)">${esc(x.zh)}</span> <span class="py">${esc(x.py)}</span>` : ''}</div>`).join('');
    if (m.game) h += `<h4>Sao hai đội</h4><div class="row"><button type="button" class="tbtn" data-a="team0">↺ Về 0</button></div>`;
    h += `<h4>Phím tắt</h4><div class="tiny">← → chuyển màn · Cách: việc chính của màn · F toàn màn hình · P hiện/ẩn pinyin</div>`;
    $('#note').innerHTML = h;
  }

  /* ---------------- hành động ---------------- */
  const rnd = (n, not) => { let r; do { r = Math.floor(Math.random() * n); } while (n > 1 && r === not); return r; };
  async function doAct(a) {
    const m = cur(), st = ST(m);
    if (a === 'A' || a === 'B') { S.team[a]++; store.set('team', S.team); updTeams(); const t = $('#t' + a); if (t) { t.classList.remove('bump'); void t.offsetWidth; t.classList.add('bump'); } blip(1200, .1, 'triangle'); sync(); return; }
    if (a === 'team0') { S.team = { A: 0, B: 0 }; store.set('team', S.team); updTeams(); sync(); return; }
    switch (a) {
      case 'play': case 'pause': if (peer()) post({ k: 'yt', c: a }); else ytCmd(a); return;
      case 'freeze': if (peer()) { post({ k: 'yt', c: 'freeze' }); freezeShow(true); setTimeout(() => freezeShow(false), 3200); } else ytCmd('freeze');
        if (m.line) say(m.line, 'en'); return;
      case 'go': ac(); NHAC.src = m.nhac; NHAC.currentTime = 0; NHAC.play().catch(() => {}); change(s => { s.on = true; }); return;
      case 'stop': NHAC.pause(); chime(); change(s => { s.on = false; s.mau = Object.keys(MAU)[rnd(4, Object.keys(MAU).indexOf(s.mau))]; s.n++; });
        await sleep(700); say(m.line, st.n % 2 ? 'en' : 'zh'); return;
      case 'beat': beat(!beatT); renderCtrl(); return;
      case 'to': case 'nho': change(s => { s.loud = s.loud === a ? '' : a; }); a === 'to' ? blip(220, .3, 'sawtooth', .15) : blip(1800, .08, 'sine', .2); return;
      case 'sing-en': case 'sing-zh': case 'all-en': case 'all-zh': {
        const l = a.slice(-2), run = ++seq;
        for (let i = 0; i < m.lines.length; i++) { change(s => { s.cur = i; }); if (!(await say(m.lines[i], l)) || seq !== run) break; await sleep(250); if (seq !== run) break; }
        if (seq === run || cur() === m) change(s => { s.cur = -1; }); return;
      }
      case 'new': change(s => {
        s.n++; s.who = s.mode === 'xen' ? (s.n % 2 ? 'leo' : 'xiaomei') : s.mode; s.c = rnd(m.cmds.length, s.c);
        s.trap = s.lua && Math.random() < 0.3; s.show = false; });
        return speakCmd(m, st);
      case 'again': return speakCmd(m, st);
      case 'reveal': if (st.c >= 0) { change(s => { s.show = true; }); st.trap ? blip(300, .25, 'sawtooth', .12) : chime(); } return;
      case 'lua': change(s => { s.lua = !s.lua; }); return;
      case 'mode': change(s => { s.mode = { xen: 'leo', leo: 'xiaomei', xiaomei: 'xen' }[s.mode]; }); return;
      case 'pg1': case 'pg-1': return turn(+a.slice(2));
      case 'call': {
        const ps = people(m);
        change(s => { s.n++; s.pick = rnd(ps.length, s.pick); s.lang = s.n % 2 ? 'en' : 'zh'; s.show = false;
          const o = [...s.order]; for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; } s.order = o; });
        await sleep(300); say(ps[ST(m).pick], ST(m).lang); return;
      }
      case 'ans': if (st.pick >= 0) { change(s => { s.show = true; }); chime(); } return;
      case 'count': {
        const l = st.n % 2 ? 'zh' : 'en'; st.n++;
        say(m.line, l);
        for (const c of [3, 2, 1]) { change(s => { s.c = c; }); blip(700, .1, 'triangle'); await sleep(850); }
        shutter(); change(s => { s.c = 'flash'; }); await sleep(2500); if (ST(m).c === 'flash') change(s => { s.c = null; }); return;
      }
    }
  }
  async function speakCmd(m, st) {
    const c = m.cmds[st.c]; if (!c) return;
    const l = st.who === 'xiaomei' ? 'zh' : 'en';
    if (!st.trap) { if (!(await say(NOI[l], l))) return; await sleep(150); }
    say(c, l);
  }
  function turn(d) {
    const m = cur(), n = pick(m.pages).length, st = ST(m), p = Math.max(0, Math.min(n - 1, st.p + d));
    if (p === st.p) return; change(s => { s.p = p; }); say(pick(m.pages)[p][1], 'en');
  }
  function primary() {
    const m = cur(), st = ST(m);
    const map = { song: m.freeze ? 'freeze' : 'play', mau: st.on ? 'stop' : 'go', ve: 'sing-en', says: 'new', story: 'pg1', cham: st.pick >= 0 && !st.show ? 'ans' : 'call', photo: 'count', show: 'all-en' };
    if (map[m.type]) doAct(map[m.type]); else if (S.i < MAN.length - 1) go(S.i + 1);
  }

  /* ---------------- sự kiện ---------------- */
  if (!CHIEU) {
    document.addEventListener('click', e => {
      const t = e.target.closest('button,[data-say]'); if (!t) return;
      if (!/^(sing|all)-/.test(t.dataset.a || '')) seq++;
      if (t.dataset.lv) { if (S.lv !== t.dataset.lv) { stopAudio(); S.lv = t.dataset.lv; MAN.forEach(m => { if (m.type === 'story' || m.type === 'cham' || m.type === 'cast') delete S.st[m.id]; }); render(); sync(); } return; }
      if (t.id === 'prev') return go(S.i - 1);
      if (t.id === 'next') return go(S.i + 1);
      if (t.dataset.k) { const i = MAN.findIndex(x => x.k === +t.dataset.k); return go(i); }
      if (t.id === 'bFs') { const b = $('#stageBox'); try { document.fullscreenElement ? document.exitFullscreen() : b.requestFullscreen().catch(() => {}); } catch (er) {} return; }
      if (t.id === 'bWin') { window.open('?chieu', 'buoi0-chieu', 'width=1280,height=760'); return; }
      if (t.id === 'bRec') return openRec();
      if (t.id === 'bStart') { S.t0 = Date.now(); store.set('t0', S.t0); renderTop(); return; }
      if (t.id === 'bReset') { if (confirm('Đặt lại đồng hồ buổi học?')) { S.t0 = null; store.set('t0', null); renderTop(); } return; }
      if (t.dataset.a) return doAct(t.dataset.a);
      const m = cur();
      if (t.dataset.v != null && m.type === 'song') { change(s => { s.v = +t.dataset.v; }); return; }
      if (t.dataset.cmd != null) { const c = m.cmds[+t.dataset.cmd]; change(s => { s.c = +t.dataset.cmd; s.trap = false; s.show = false; }); sayBoth(c); return; }
      if (t.dataset.fr != null) { const p = people(m)[+t.dataset.fr]; change(s => { s.on = +t.dataset.fr; }); sayBoth(p); return; }
      if (t.dataset.pg) return turn(+t.dataset.pg);
      if (t.dataset.ch != null) { const st = ST(m); if (st.pick >= 0 && !st.show) { doAct('ans'); if (+t.dataset.ch === st.pick) blip(1400, .15, 'triangle'); } return; }
      if (t.dataset.say) { const r = t.closest('[data-r]'); if (r) say(REG[+r.dataset.r], t.dataset.say, t.classList.contains('au') ? t : null); }
    });
    document.addEventListener('input', e => { if (e.target.id === 'zalo') { S.zalo = e.target.value.trim(); store.set('zalo', S.zalo); clearTimeout(window.__zt); window.__zt = setTimeout(() => { render(); sync(); }, 500); } });
    document.addEventListener('keydown', e => {
      if (e.target.closest('input,textarea') || $('.dlg')) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); go(S.i + 1); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(S.i - 1); }
      else if (e.key === ' ') { e.preventDefault(); primary(); }
      else if (e.key === 'f' || e.key === 'F') $('#bFs').click();
      else if (e.key === 'p' || e.key === 'P') { S.py = !S.py; store.set('py', S.py); render(); sync(); }
    });
    window.addEventListener('beforeunload', () => post({ k: 's', S: { lv: S.lv, i: S.i, st: S.st, team: S.team, py: S.py, zalo: S.zalo } }));
  }

  /* ---------------- 🎙 Giọng đọc: xem, thu, chuyển máy ---------------- */
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
      <div class="head"><h2>🎙 Giọng đọc mẫu</h2><span class="sp"></span><button type="button" class="b" data-x="close">Đóng ✕</button></div>
      <p>${L.length} câu trên các màn: <b>${n.file}</b> dùng giọng có sẵn của web, <b>${n.ghep}</b> ghép từ các mảnh có sẵn, <b>${n.may}</b> đang đọc bằng giọng máy, <b>${n.rec}</b> cô đã thu.
      Câu giọng máy có nút viền chấm. Cô bấm ● Thu, đọc câu, bấm ■ Dừng: trang dùng giọng cô thay giọng máy. Giọng thu lưu trong trình duyệt của máy này;
      soạn ở nhà thì bấm "Tải về", sang máy lớp bấm "Nạp file".</p>
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
    a.download = 'giong-co-buoi0.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 3000);
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
