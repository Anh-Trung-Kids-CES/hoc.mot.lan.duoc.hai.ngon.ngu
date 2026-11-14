/* =====================================================================
   PHÉP THUẬT LỜI NÓI · game "con nói – hình đổi", dùng chung web Little Seed và Seedling (cả khoá, 24 unit).
   Nội dung nằm ở phep-thuat-du-lieu.js (sinh tự động từ chuong-trinh/phep-thuat/); file này chỉ là máy chạy.
   - Leo (tiếng Anh) và Xiaomei (tiếng Trung) là hai phù thuỷ. Mỗi ngày học: 6 phép của unit đang học + ~4 phép ôn
     (ngày Ôn: 6 phép từ các unit đã học). Con chỉ cần nói những từ, câu đã học.
   - Bậc thang: nói một từ → hình vẫn đổi · nói đủ câu → khen câu · nói hai ý một hơi (phép nối / câu dài) → Phép vàng + thẻ vàng.
   - "No, no!" / "不，不！" rút lại. Hai thanh phép; cùng một ý nói cả hai tiếng = Phép đôi (cầu vồng + thẻ).
   - Cuối lượt: Phép thưởng (câu mới chạm tranh), mini hội thoại 3 lượt mỗi tiếng, +2 ⭐ (một lần mỗi ngày).
   - Giọng mẫu: file thu (giong/phep-thuat/*.mp3) nếu có, không thì giọng máy của trình duyệt.
   - Nhận giọng: Web Speech API (Chrome, Safari). Giọng của con được gửi tới máy chủ Google / Apple để nhận chữ.
   ===================================================================== */
(function () {
  const D = window.PT_DATA; if (!D) return;
  const COURSE = (typeof KEY === 'string' && KEY === 'lsd') ? 'LS' : 'SD';
  const A = (location.pathname.includes('/little-seed/') ? '../seedling/' : '') + 'tai-nguyen/';
  const h = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = id => document.getElementById(id);
  const clone = o => JSON.parse(JSON.stringify(o));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const ORDER = D.order[COURSE];
  const SP = {};   // id → phép
  Object.keys(D.units).forEach(uid => D.units[uid].spells.forEach(sp => { sp.uid = uid; SP[sp.id] = sp; }));
  const objSrc = id => A + D.objs[id].src + '.webp';

  /* ---------- hai phù thuỷ ---------- */
  const W = { en: { name: 'Leo', img: 'nhan-vat/kids_leo_a', lang: 'en-US', ok: ['ok1', 'ok2', 'ok3', 'ok4'] }, zh: { name: 'Xiaomei', img: 'nhan-vat/kids_xiaomei_a', lang: 'zh-CN', ok: ['ok1', 'ok2', 'ok3'] } };
  const CM = (k, l) => D.common[l][k];
  const NAME = { leo: '(leo|lio|leah|rio|lee ?o|利奥|里奥|雷欧)', xiaomei: '(小美|晓梅|小梅|小妹|肖梅|笑梅|xiao ?mei|show may|she may)' };
  const UNDO = { en: /\bno\b[ ,!.]*\bno\b|\bno\b/i, zh: /不[，, ]*不|不对|不要|不/ };
  const WAKE = { en: new RegExp('\\b(hi|hello|hey|good morning)\\b.*' + NAME.leo + '|' + NAME.leo + '.*\\b(hi|hello)\\b', 'i'), zh: new RegExp('(你好|您好|早上好).*' + NAME.xiaomei + '|' + NAME.xiaomei + '.*(你好|您好)', 'i') };
  const WAKE_KEY = { en: /\b(hi|hello|hey)\b/i, zh: /你好|您好/ };
  const GOAL = 4, STAR_ROUND = 2;

  /* ---------- ngày học → unit → các phép ---------- */
  const SDATA = () => (window.SD && window.SD.days) || {};
  function dayNum() { if (window.PT_TEST && window.PT_TEST.day) return +window.PT_TEST.day; const m = (location.hash || '').match(/^#\/ngay\/(\d+)$/); return m ? +m[1] : 0; }
  function unitOf(d) { const x = SDATA()[d]; return x ? String(x.unit) : ''; }
  function learnedBefore(d) {   // các unit đã học xong trước ngày d (theo thứ tự ngày)
    const days = SDATA(), seen = [], last = {};
    Object.keys(days).map(Number).sort((a, b) => a - b).forEach(n => { const u = String(days[n].unit); if (u !== 'Ôn') last[u] = n; });
    ORDER.forEach(u => { if (last[u] != null && last[u] < d) seen.push(u); });
    return seen.sort((a, b) => last[a] - last[b]);
  }
  /* các phép dùng trong lượt chơi hôm nay: {list, uid(unit chính), review: tập id phép ôn} */
  function poolFor(d) {
    const u = unitOf(d), seen = store().seen || {};
    const pick = (uids, n, rot) => {   // lấy n phép từ các unit, xoay vòng, ưu tiên phép con ít nói
      const all = []; uids.forEach(uid => D.units[uid].spells.forEach(sp => all.push(sp)));
      const sorted = all.map((sp, i) => ({ sp, i, c: seen[sp.id] || 0 })).sort((a, b) => a.c - b.c || ((a.i + rot) % all.length) - ((b.i + rot) % all.length));
      const per = {}, out = [];
      for (const x of sorted) { const k = x.sp.uid; per[k] = (per[k] || 0); if (per[k] >= Math.ceil(n / uids.length)) continue; out.push(x.sp); per[k]++; if (out.length >= n) break; }
      return out;
    };
    if (u === 'Ôn' || !u) {
      const L = learnedBefore(d).map(x => COURSE + x), use = L.slice(-4);
      const list = use.length ? pick(use, 6, d) : (D.units[COURSE + ORDER[0]].spells.slice(0, 6));
      return { list, uid: use.length ? use[use.length - 1] : COURSE + ORDER[0], review: new Set(list.map(s => s.id)), on: true };
    }
    const uid = COURSE + u, base = D.units[uid].spells, prev = learnedBefore(d).filter(x => x !== u).map(x => COURSE + x).slice(-2);
    const rev = prev.length ? pick(prev, 4, d) : [];
    return { list: [...base, ...rev], uid, review: new Set(rev.map(s => s.id)), on: false };
  }

  /* ---------- lưu trên tiến độ của con ---------- */
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  function store() { if (typeof P !== 'object' || !P) return window.__ptStore || (window.__ptStore = { cards: {}, world: [], gold: {}, seen: {} }); P.pt = P.pt || {}; ['cards', 'gold', 'seen'].forEach(k => P.pt[k] = P.pt[k] || {}); P.pt.world = P.pt.world || []; return P.pt; }
  function persist() { try { if (typeof save === 'function') save(); } catch (e) {} }

  /* ---------- giọng mẫu: file thu → giọng máy ---------- */
  const AUDIO = new Set(D.audio || []);
  let curAudio = null;
  const base = id => (D.same && D.same[id]) || id;
  function speak(text, lang, id) {
    return new Promise(res => {
      try {
        if (curAudio) { try { curAudio.pause(); } catch (e) {} curAudio = null; }
        if (window.speechSynthesis) speechSynthesis.cancel();
        const b = id && base(id);
        const tts = () => {
          try {
            if (!window.speechSynthesis || !text) return res();
            const u = new SpeechSynthesisUtterance(String(text).replace(/Bông/g, 'Bong').replace(/Vũ/g, 'Vu')); u.lang = lang === 'zh' ? 'zh-CN' : lang === 'vi' ? 'vi-VN' : 'en-US'; u.rate = lang === 'vi' ? .95 : .85;
            const v = speechSynthesis.getVoices().find(x => x.lang.replace('_', '-').startsWith(u.lang)); if (v) u.voice = v;
            u.onend = u.onerror = () => res(); speechSynthesis.speak(u); setTimeout(res, 7000);
          } catch (e) { res(); }
        };
        if (b && AUDIO.has(b) && typeof Audio === 'function') {
          const a = new Audio(A + 'giong/phep-thuat/' + b + '.mp3'); curAudio = a; let fell = false;
          a.onended = () => res(); a.onerror = () => { if (!fell) { fell = true; tts(); } };
          const p = a.play(); if (p && p.catch) p.catch(() => { if (!fell) { fell = true; tts(); } });
          setTimeout(res, 9000);
        } else tts();
      } catch (e) { res(); }
    });
  }
  const sayV = k => speak(CM(k, 'vi'), 'vi', 'common.' + k + '.vi');   // lời cô Hươu (tiếng Việt)
  const sayC = (k, l) => speak(CM(k, l), l, 'common.' + k + '.' + l);

  /* ---------- nghe ---------- */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const canListen = () => !!(SR || window.PT_TEST);
  let rec = null;
  function listen(lang, onInterim) {
    if (window.PT_TEST) return new Promise(res => { window.PT_TEST.pending = t => res({ alts: [].concat(t).map(String) }); });
    return new Promise(res => {
      let alts = [], err = '';
      try {
        rec = new SR(); rec.lang = W[lang].lang; rec.interimResults = true; rec.maxAlternatives = 5; rec.continuous = false;
        rec.onresult = e => { const r = e.results[e.results.length - 1]; alts = [...r].map(a => a.transcript); onInterim && onInterim(alts[0]); };
        rec.onerror = e => { err = e.error || 'loi'; };
        rec.onend = () => { rec = null; res({ alts, err }); };
        rec.start(); setTimeout(() => { try { rec && rec.stop(); } catch (e) {} }, 7000);
      } catch (e) { res({ alts: [], err: 'khong-ho-tro' }); }
    });
  }
  const norm = (s, lang) => lang === 'en' ? ' ' + String(s).toLowerCase().replace(/[’‘]/g, "'").replace(/(\w)'(s|m|re|ll|ve|d)\b/g, '$1').replace(/[^a-z0-9à-ỹ' ]+/g, ' ').replace(/\s+/g, ' ') + ' ' : String(s).replace(/[\s，。！？,.!?、：:；;"“”]/g, '');

  /* ---------- nhận câu: đếm số từ khoá trong câu con nói ---------- */
  const mk = (p, l) => l === 'en' ? new RegExp('(?:^| )(?:' + p + ')(?= |$)', 'i') : new RegExp(p, 'i');   // tiếng Anh: câu đã chuẩn hoá, ngăn cách bằng khoảng trắng
  function score(c, l, N) {   // c = {tok, need}
    const rs = c._r || (c._r = c.tok.map(p => mk(p, l)));
    let best = { m: 0, pos: 1e9, len: 0 };
    N.forEach(n => { let m = 0, pos = 1e9, len = 0; rs.forEach(r => { const x = r.exec(n); if (x) { m++; pos = Math.min(pos, x.index); len += x[0].length; } }); if (m > best.m || (m === best.m && len > best.len)) best = { m, pos, len }; });
    return { m: best.m, n: rs.length, r: rs.length ? best.m / rs.length : 0, pos: best.pos, len: best.len, full: best.m > 0 && best.m >= c.need };
  }
  const sig = (c) => c.tok.slice().sort().join('|');
  function find(l, alts, pool) {
    const N = alts.map(a => norm(a, l));
    const kb = sp => !!(sp[l].key && N.some(n => mk(sp[l].key, l).test(n)));   // từ khoá riêng của phép có trong câu (phân biệt các phép cùng khuôn: màu, số)
    let key = null, kl = 0;   // từ khoá dài nhất khớp trong câu (bậc 1; 书包 > 书)
    pool.forEach(sp => { if (!sp[l].key) return; const rx = mk(sp[l].key, l); N.forEach(n => { const x = rx.exec(n); if (x && x[0].length > kl) { kl = x[0].length; key = sp; } }); });
    const hits = pool.map((sp, i) => ({ sp, i, kb: kb(sp), ...score(sp[l], l, N) })).filter(x => x.full)
      .sort((a, b) => b.r - a.r || (b.kb - a.kb) || b.len - a.len || b.n - a.n || a.i - b.i);
    if (hits.length && key && key !== hits[0].sp && !key.par && kl > hits[0].len) return { sp: key, full: false, combo: null, N };
    if (hits.length) {
      // phép nối: nhiều phép trọn vẹn trong cùng một câu. Phép có tham số (màu, số) chỉ tính khi từ khoá riêng của nó được nói; bỏ phép chỉ là phần của phép khác
      let co = hits.filter(x => x.r > .99 && (!x.sp.par || x.kb)), seen = new Set();
      co = co.filter(x => { const s = x.sp.par ? x.sp.id : sig(x.sp[l]); if (seen.has(s)) return false; seen.add(s); return true; });
      co = co.filter(x => x.sp.par || !co.some(y => y !== x && !y.sp.par && x.sp[l].tok.every(t => y.sp[l].tok.includes(t)) && y.sp[l].tok.length > x.sp[l].tok.length));
      co.sort((a, b) => a.pos - b.pos);
      return { sp: hits[0].sp, full: true, combo: co.length >= 2 ? co.map(x => x.sp) : null, N };
    }
    return key ? { sp: key, full: false, combo: null, N } : { sp: null, N };
  }
  function longHit(l, N, uid) {
    const u = D.units[uid]; if (!u) return null;
    return u.long.find(g => { const s = score(g[l], l, N); return s.full && s.r >= .7; }) || null;
  }
  /* số / màu con nói (cho phép có tham số) */
  const NUMS = { en: { one: 1, two: 2, to: 2, too: 2, three: 3, four: 4, for: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 }, zh: { 一: 1, 二: 2, 两: 2, 俩: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 } };
  const COLS = { en: { red: '#e53935', yellow: '#fdd835', blue: '#1e88e5', green: '#43a047', pink: '#ec6fa6', orange: '#fb8c00', purple: '#8e44ad', black: '#333', white: '#fff', brown: '#8d6e63', gold: '#f2b400', golden: '#f2b400', gray: '#9e9e9e', grey: '#9e9e9e' },
    zh: { 红: '#e53935', 黄: '#fdd835', 蓝: '#1e88e5', 绿: '#43a047', 粉: '#ec6fa6', 橙: '#fb8c00', 紫: '#8e44ad', 黑: '#333', 白: '#fff', 棕: '#8d6e63', 金: '#f2b400', 灰: '#9e9e9e' } };
  function parNum(l, N) {
    for (const n of N) { const d = n.match(/\b(10|[1-9])\b/); if (d) return +d[1]; if (l === 'en') { const ws = n.trim().split(' '); for (const w of ws) if (NUMS.en[w] && !['to', 'too', 'for'].includes(w)) return NUMS.en[w]; for (const w of ws) if (NUMS.en[w]) return NUMS.en[w]; } else { const m = n.match(/十|[一二两俩三四五六七八九]/); if (m) return NUMS.zh[m[0]]; const dd = n.match(/(10|[1-9])/); if (dd) return +dd[1]; } }
    return null;
  }
  function parCol(l, N) {
    for (const n of N) { if (l === 'en') { for (const w of n.trim().split(' ')) if (COLS.en[w]) return w === 'golden' ? 'gold' : w; } else { const m = n.match(/[红黄蓝绿粉橙紫黑白棕金灰]/); if (m) return ({ 红: 'red', 黄: 'yellow', 蓝: 'blue', 绿: 'green', 粉: 'pink', 橙: 'orange', 紫: 'purple', 黑: 'black', 白: 'white', 棕: 'brown', 金: 'gold', 灰: 'gray' })[m[0]]; } }
    return null;
  }

  /* ---------- cảnh ---------- */
  let S = null, hist = [], G = null, POOL = null, root = null;
  const blank = () => ({ objs: [], time: 'day', wx: '', scene: 0, bgImg: null, ex: {} });
  function fresh() {   // "thế giới": các bạn con đã gọi ra lần trước (nhân vật, tối đa 3)
    const s = blank(); s.objs = (store().world || []).filter(i => D.objs[i] && D.objs[i].src.startsWith('nhan-vat/')).slice(0, 3).map(id => ({ id })); return s;
  }
  const bgList = () => ['trang/' + D.units[POOL.uid].bg, 'trang/ls_school', 'trang/ls_class', 'trang/ls_park'];

  function open() {
    if (root) return;
    POOL = poolFor(dayNum() || 1);
    S = fresh(); hist = []; G = { active: '', awake: { en: false, zh: false }, meter: { en: 0, zh: 0 }, done: {}, miss: 0, streak: [], doubles: 0, said: 0, end: false, log: {}, n: 0, bonus: null, bonusDone: false, abort: false, golds: 0, run: 0, sinceMore: 9, dlg: false, lastGold: 0, dia: 0 };
    root = document.createElement('div'); root.className = 'pt'; root.innerHTML = `
      <div class="pt-scene" id="ptScene"><img class="pt-bg" id="ptBg" alt=""><div class="pt-sky" id="ptSky"><span class="pt-sun"></span><span class="pt-moon"></span><div class="pt-wxp" id="ptWxp"></div></div>
        <div class="pt-stage" id="ptStage"></div><div class="pt-ex" id="ptEx"></div><div class="pt-fx" id="ptFx"></div><div class="pt-spells" id="ptSpells" hidden></div>
        <div class="pt-kid" id="ptKid"><span class="pt-kbub" id="ptKb" hidden></span><b>⭐ Con</b></div>
        ${['en', 'zh'].map(l => `<button type="button" class="pt-wiz w-${l} pt-ngu" data-w="${l}" aria-label="${W[l].name}">
          <span class="pt-meter">${Array.from({ length: GOAL }, () => `<i>${l === 'en' ? '⭐' : '🏮'}</i>`).join('')}</span>
          <img src="${A + W[l].img}.webp" alt=""><span class="pt-wand"></span><span class="pt-zz">z z</span><span class="pt-ear">👂</span><span class="pt-name">${W[l].name}</span><span class="pt-bub" hidden></span></button>`).join('')}
      </div>
      <div class="pt-bar"><button type="button" class="pt-x" aria-label="Đóng">✕</button>
        <div class="pt-said" id="ptSaid">Chạm Leo hoặc Xiaomei để bắt đầu.</div>
        <button type="button" class="pt-mic" id="ptMic" disabled><span>🎤</span><b id="ptMicT">Nói</b></button>
        <button type="button" class="pt-hint" id="ptHint" aria-label="Gợi ý">💡</button></div>
      <div class="pt-cards" id="ptCards" hidden></div>
      <div class="pt-panel" id="ptPanel" hidden></div>`;
    document.body.appendChild(root); document.body.classList.add('pt-on');
    try { if (typeof stopAll === 'function') stopAll(); } catch (e) {}
    root.querySelector('.pt-x').onclick = close; $('ptKb').onclick = () => { $('ptKb').hidden = true; delete $('ptKb').dataset.more; };
    root.querySelectorAll('[data-w]').forEach(b => b.onclick = () => pick(b.dataset.w));
    $('ptMic').onclick = () => turn(false); $('ptHint').onclick = () => showCards(G.active || 'en', true);
    render(true);
    if (!canListen()) say('', 'Máy này chưa nghe được giọng nói (cần Chrome hoặc Safari). Con chạm 💡 để chọn tranh làm phép nhé.');
    warmup();
  }
  function close() { clearTimeout(idleT); try { rec && rec.abort(); } catch (e) {} try { speechSynthesis.cancel(); } catch (e) {} try { curAudio && curAudio.pause(); } catch (e) {} curAudio = null; if (root) root.remove(); root = null; document.body.classList.remove('pt-on'); }

  /* ---------- vẽ cảnh ---------- */
  const EMO = id => (D.objs[id] && D.objs[id].e) || '❓';
  function imgFor(id, cls) {   // hình dán; nếu hình mới chưa vẽ thì tạm dùng biểu tượng
    const el = document.createElement('img'); el.alt = ''; el.className = cls; el.dataset.id = id; el.src = objSrc(id);
    el.onerror = () => { if (!D.objs[id].e) return; const sp = document.createElement('span'); sp.className = cls + ' pt-emo'; sp.dataset.id = id; sp.dataset.k = el.dataset.k || ''; sp.textContent = EMO(id); sp.style.cssText = el.style.cssText; if (el.parentNode) { el.parentNode.replaceChild(sp, el); sp.style.fontSize = (parseFloat(el.style.height) || 30) * .75 + 'cqh'; } };
    return el;
  }
  const COLCSS = n => COLS.en[n] || n;
  const LIGHT = new Set(['balloon_white', 'cake_plain']);
  function tint(el, color, id) {   // đổi màu hình dán (canvas); máy không hỗ trợ thì dùng bộ lọc màu
    const css = COLCSS(color); el.dataset.c = color;
    try {
      const go = () => {
        const c = document.createElement('canvas'); c.width = el.naturalWidth; c.height = el.naturalHeight; const x = c.getContext('2d'); if (!x) throw 0;
        x.drawImage(el, 0, 0); x.globalCompositeOperation = LIGHT.has(id) || color === 'white' ? 'multiply' : 'hue'; x.fillStyle = css; x.fillRect(0, 0, c.width, c.height);
        x.globalCompositeOperation = 'destination-in'; x.drawImage(el, 0, 0); el.src = c.toDataURL(); el.dataset.t = '1';
      };
      if (el.complete && el.naturalWidth) go(); else el.addEventListener('load', function f() { el.removeEventListener('load', f); if (el.dataset.t !== '1') { try { go(); } catch (e) {} } });
    } catch (e) { const hue = { red: 0, yellow: 50, green: 110, blue: 210, pink: 330, orange: 25, purple: 270, gold: 45 }[color]; el.style.filter = 'hue-rotate(' + (hue || 0) + 'deg) saturate(1.3)'; }
  }
  /* bố cục: các vật xếp hàng ngang; vật có pos {to,how} đặt lên/dưới/đội/mặc lên vật khác */
  function layout() {
    const row = [], over = [];
    S.objs.forEach(o => { if (o.pos) over.push(o); else for (let i = 0; i < (o.n || 1); i++) row.push({ o, i, key: o.id + '#' + i }); });
    const k = row.length, out = [];
    row.forEach((r, j) => {
      const info = D.objs[r.o.id], many = (r.o.n || 1) > 5 ? .55 : (r.o.n || 1) > 2 ? .75 : 1, crowd = k > 5 ? .8 : 1;
      const left = k === 1 ? 50 : (k > 7 ? 10 : 20) + j * ((k > 7 ? 80 : 60) / (k - 1));
      out.push({ key: r.key, id: r.o.id, left, b: 5, h: info.h * many * crowd, z: 2, o: r.o });
    });
    over.forEach(o => {
      const t = out.find(x => x.id === o.pos.to), info = D.objs[o.id]; if (!t) { out.push({ key: o.id + '#0', id: o.id, left: 50, b: 5, h: info.h, z: 3, o }); return; }
      const w = o.pos.how; let s = { key: o.id + '#0', id: o.id, left: t.left, b: 5, h: info.h, z: 3, o };
      if (w === 'on') { s.b = t.b + t.h * .78; } else if (w === 'under') { s.b = t.b + .5; s.z = 3; s.h = Math.min(info.h, t.h * .36); s.left = t.left + 1; }   // chui gầm: nằm ở chân đồ vật, phía trước
      else if (w === 'mouth') { s.left = t.left + 4; s.b = t.b + t.h * .6; s.h = Math.min(info.h, t.h * .32); }
      else if (w === 'wear') { s.b = t.b + t.h * .1; s.h = t.h * .6; s.z = 4; }
      else if (w === 'hat') { s.b = t.b + t.h * .82; s.h = t.h * .3; s.z = 4; }
      out.push(s);
    });
    return out;
  }
  function render(first) {
    const stage = $('ptStage'); if (!stage) return;
    $('ptBg').src = S.bgImg ? A + S.bgImg + '.webp' : A + bgList()[S.scene % bgList().length] + '.webp';
    $('ptSky').className = 'pt-sky t-' + (S.time === 'dusk' ? 'dusk' : S.time) + (S.wx ? ' wx-' + S.wx : '');
    wxParticles();
    const slots = layout(), want = new Set(slots.map(s => s.key));
    stage.querySelectorAll('[data-k]').forEach(el => { if (!want.has(el.dataset.k) && !el.classList.contains('pt-out')) { el.classList.add('pt-out'); setTimeout(() => el.remove(), 700); } });
    slots.forEach((s, i) => {
      let el = [...stage.children].find(e => e.dataset.k === s.key && !e.classList.contains('pt-out'));
      if (!el) { el = imgFor(s.id, 'pt-act' + (first ? '' : ' pt-in')); el.dataset.k = s.key; stage.appendChild(el); }
      el.style.height = s.h + '%'; el.style.left = s.left + '%'; el.style.setProperty('--b', s.b + '%'); el.style.zIndex = s.z;
      const c = s.o.c; if (c && el.dataset.c !== c) tint(el, c, s.id);
    });
    extras(slots);
    ['en', 'zh'].forEach(l => root.querySelectorAll(`.w-${l} .pt-meter i`).forEach((x, i) => x.classList.toggle('on', i < G.meter[l])));
  }
  function wxParticles() {
    const w = $('ptWxp'); if (!w) return; const kind = S.wx, cur = w.dataset.k || '';
    if (kind === cur) return; w.dataset.k = kind; w.innerHTML = '';
    const sym = { rainy: '💧', snowy: '❄️', windy: '🍃', cloudy: '☁️', cold: '🥶' }[kind]; if (!sym) return;
    const n = kind === 'cloudy' ? 4 : kind === 'cold' ? 3 : 18;
    for (let i = 0; i < n; i++) { const s = document.createElement('span'); s.textContent = sym; s.style.left = (kind === 'cloudy' ? 8 + i * 22 : Math.random() * 96) + '%'; s.style.animationDelay = (Math.random() * 2) + 's'; s.style.animationDuration = (kind === 'windy' ? 2.2 : kind === 'cloudy' ? 9 : 3 + Math.random() * 2) + 's'; if (kind === 'cloudy') s.style.top = (6 + (i % 2) * 14) + '%'; w.appendChild(s); }
  }
  function extras(slots) {
    const ex = $('ptEx'); if (!ex) return; ex.innerHTML = '';
    const E = S.ex || {};
    if (E.candles) { const t = slots.find(x => x.id === 'cake_plain'); if (t) { const d = document.createElement('div'); d.className = 'pt-candles'; d.style.left = t.left + '%'; d.style.bottom = `calc(var(--bs,0%) + ${t.b + t.h * .78}%)`; d.innerHTML = Array.from({ length: E.candles }, () => '<i>🕯️</i>').join(''); d.dataset.n = E.candles; ex.appendChild(d); } }
    if (E.tag) { const t = slots.find(x => /kids_|nv_/.test(x.id)) || { left: 50, b: 5, h: 40 }; const d = document.createElement('div'); d.className = 'pt-tag'; d.style.left = t.left + '%'; d.style.bottom = `calc(var(--bs,0%) + ${t.b + t.h + 2}%)`; d.textContent = E.tag; ex.appendChild(d); }
    if (E.frame) { const d = document.createElement('div'); d.className = 'pt-frame'; ex.appendChild(d); }
    if (E.clock != null) { const d = document.createElement('div'); d.className = 'pt-clock'; d.innerHTML = `<i class="hh" style="transform:rotate(${E.clock * 30}deg)"></i><i class="mm"></i><b>${E.clock}:00</b>`; ex.appendChild(d); }
  }
  function anim(kind, ids) {
    const st = $('ptStage'); if (!st) return;
    const els = [...st.querySelectorAll('.pt-act:not(.pt-out)')].filter(e => !ids || ids === 'shown' || !ids.length || ids.includes(e.dataset.id)); if (!els.length) return;
    els.forEach((el, i) => { el.className = el.className.replace(/\ba-\S+/g, '').trim(); void el.offsetWidth; el.style.animationDelay = (i * .08) + 's'; el.classList.add('a-' + kind); setTimeout(() => el.classList.remove('a-' + kind), 4500); });
    if (kind === 'clap') fx('👏'); if (kind === 'stamp') fx('💥'); if (kind === 'mouth') fx('Aaa!');
  }
  function fx(t, cls) { const f = $('ptFx'); if (!f) return; const s = document.createElement('span'); s.className = 'pt-pop ' + (cls || ''); s.textContent = t; f.appendChild(s); setTimeout(() => s.remove(), 1600); }
  function goldCard() { const f = $('ptFx'); if (!f) return; const c = document.createElement('div'); c.className = 'pt-gcard'; c.innerHTML = '<b>🌟</b><i>✨</i>'; f.appendChild(c); ting(); setTimeout(ting, 220); setTimeout(() => c.remove(), 2600); }
  function burst(sym, n, cls) { const f = $('ptFx'); if (!f) return; for (let i = 0; i < n; i++) { const s = document.createElement('span'); s.className = 'pt-bit ' + (cls || ''); s.textContent = sym; s.style.left = (8 + Math.random() * 84) + '%'; s.style.animationDelay = (Math.random() * .6) + 's'; f.appendChild(s); setTimeout(() => s.remove(), 2600); } }
  function repBubble(t) {   // lời đáp của bạn trên cảnh (hiện trên đầu bạn đầu tiên)
    const st = $('ptStage'), ex = $('ptFx'); if (!st || !ex) return; const a = st.querySelector('.pt-act:not(.pt-out)'); const d = document.createElement('div'); d.className = 'pt-rep';
    d.style.left = (a ? parseFloat(a.style.left) || 50 : 50) + '%'; d.textContent = t; ex.appendChild(d); setTimeout(() => d.remove(), 3600);
  }
  function sparkle(l) { const w = root && root.querySelector('.w-' + l); if (!w) return; w.classList.remove('pt-phep'); void w.offsetWidth; w.classList.add('pt-phep'); }
  function bubble(l, t, ms) { const b = root && root.querySelector(`.w-${l} .pt-bub`); if (!b) return; b.textContent = t; b.hidden = false; clearTimeout(b._t); b._t = setTimeout(() => b.hidden = true, ms || 2600); }
  function say(lang, t) { const el = $('ptSaid'); if (el) el.innerHTML = t; }
  function waveWiz(l) { const wo = root && root.querySelector('.w-' + l); if (!wo) return; wo.classList.remove('pt-goi'); void wo.offsetWidth; wo.classList.add('pt-goi'); clearTimeout(wo._g); wo._g = setTimeout(() => wo.classList.remove('pt-goi'), 3300); }

  /* ---------- hiệu ứng của một phép ---------- */
  function apply(sp, l, par, post) {
    const num = par.n, col = par.c;
    (sp.fx || []).forEach(st => {
      const t = st.t;
      if (t === 'show') st.o.forEach(id => { if (!S.objs.some(x => x.id === id)) S.objs.push({ id }); });
      else if (t === 'hide') { if (st.o === 'all') { S.objs = []; S.ex = {}; } else S.objs = S.objs.filter(x => !st.o.includes(x.id)); }
      else if (t === 'anim') post.push(() => anim(st.a, st.o));
      else if (t === 'time') S.time = st.v;
      else if (t === 'weather') { S.wx = st.v === 'sunny' ? '' : st.v; S.time = 'day'; }
      else if (t === 'scene') { S.scene++; S.bgImg = null; }
      else if (t === 'bg') S.bgImg = st.img;
      else if (t === 'candles') { if (!S.objs.some(x => x.id === 'cake_plain')) S.objs.push({ id: 'cake_plain' }); S.ex.candles = st.n === '$' ? (num || st.d) : st.n; }
      else if (t === 'count') { S.objs = S.objs.filter(x => x.id !== st.o); S.objs.push({ id: st.o, n: Math.max(1, Math.min(10, st.n === '$' ? (num || st.d) : st.n)) }); }
      else if (t === 'count_people') st.o.forEach((id, i) => { const add = () => { if (S && !S.objs.some(x => x.id === id)) { S.objs.push({ id }); render(); bubble(l, String(i + 1), 700); } }; if (i === 0) add(); else setTimeout(add, i * 650); });
      else if (t === 'color') { const o = S.objs.find(x => x.id === st.o); if (o) o.c = st.c === '$' ? (col || st.d) : st.c; }
      else if (t === 'move') { let o = S.objs.find(x => x.id === st.o); if (!o) { o = { id: st.o }; S.objs.push(o); } o.pos = { to: st.to, how: st.how }; }
      else if (t === 'tag') S.ex.tag = st.text;
      else if (t === 'frame') S.ex.frame = true;
      else if (t === 'clock') S.ex.clock = st.h;
      else if (t === 'confetti') post.push(() => { burst('🎉', 6); burst('✨', 8); try { if (typeof confetti === 'function') confetti(40); } catch (e) {} });
      else if (t === 'flash') post.push(() => { const f = $('ptFx'); if (!f) return; const d = document.createElement('div'); d.className = 'pt-flash'; f.appendChild(d); setTimeout(() => d.remove(), 900); });
      else if (t === 'heart') post.push(() => burst('❤️', 6, 'up'));
      else if (t === 'cross') post.push(() => fx('❌', 'big'));
      else if (t === 'steam') post.push(() => burst('💨', 5, 'up'));
      else if (t === 'shine') post.push(() => { const st2 = $('ptStage'); st2 && st2.querySelectorAll('.pt-act').forEach(e => { e.classList.remove('a-shine'); void e.offsetWidth; e.classList.add('a-shine'); setTimeout(() => e.classList.remove('a-shine'), 1600); }); burst('✨', 6); });
      else if (t === 'push') { post.push(() => { const e = $('ptStage') && $('ptStage').querySelector(`[data-id="${st.o}"]`); if (e) e.classList.add('a-push'); }); setTimeout(() => { if (!S) return; S.objs = S.objs.filter(x => x.id !== st.o); render(); }, 1100); }
    });
    // ghi nhớ các bạn (nhân vật) đã gọi ra cho lượt sau
    const w = store(); S.objs.forEach(o => { if (D.objs[o.id].src.startsWith('nhan-vat/') && !w.world.includes(o.id)) w.world.push(o.id); });
    if (w.world.length > 12) w.world = w.world.slice(-12);
  }
  const spText = (sp, l) => sp.k === 'undo' ? CM('no', l) : sp[l].say;
  const sid = (sp, l) => sp.id + '.' + l;

  /* ---------- tranh trong sách phép ---------- */
  function objImg(id) { return `<img src="${objSrc(id)}" alt="" onerror="if(${D.objs[id].e ? 1 : 0}){this.outerHTML='<span class=pt-pe>${EMO(id)}</span>'}">`; }
  function picHtml(p) {
    if (p.e) return `<span class="pt-pe">${p.e}</span>`;
    if (p.bg) return `<img class="pt-pbg" src="${A + bgList()[(S.scene + 1) % bgList().length]}.webp" alt="">`;
    if (p.bg_img) return `<img class="pt-pbg" src="${A + p.bg_img}.webp" alt="">`;
    return (p.o || []).map(objImg).join('');
  }
  const maxSp = () => matchMedia('(orientation:portrait) and (max-width:820px)').matches ? 4 : 6;
  const SP_UNDO = { k: 'undo', pic: { e: '↩️' } };
  function spellsFor(l) {
    const o = l === 'en' ? 'zh' : 'en';
    // thứ tự: phép bạn kia đã làm mà mình chưa (🌈) → phép chưa thử (phép của unit hôm nay trước, phép ôn sau) → phép đã làm rồi
    const score = sp => { const d = G.done[sp.id] || {}; return d[l] ? 3 : (d[o] ? 0 : POOL.review.has(sp.id) ? 2 : 1); };
    const out = POOL.list.map((sp, i) => ({ sp, i, s: score(sp) })).sort((a, b) => a.s - b.s || a.i - b.i).map(x => x.sp).slice(0, maxSp());
    if (hist.length) out.push(SP_UNDO);
    return out;
  }
  function drawSpells() {
    const box = $('ptSpells'); if (!box) return;
    const l = G.active;
    if (G.bonus && !G.end) {
      const B = G.bonus; box.className = 'pt-spells pt-qua'; box.hidden = false;
      box.innerHTML = `<span class="pt-sbook" aria-hidden="true">🎁</span>` + B.list.map((it, i) => { const sp = SP[it.id];
        return `<span class="pt-sp ${it.l}${i < B.i ? ' xong' : ''}${i === B.i ? ' nghe' : ''}"><span class="pt-pin">${i <= B.i ? picHtml(sp.pic) : '<span class="pt-pe">🎁</span>'}</span>${i < B.i ? '<i class="pt-sok">✓</i>' : ''}</span>`; }).join('');
      return;
    }
    if (!l || !G.awake[l] || G.end || G.dlg) { box.hidden = true; return; }
    const o = l === 'en' ? 'zh' : 'en', list = spellsFor(l); G.list = list;
    box.className = 'pt-spells ' + l; box.hidden = false;
    box.innerHTML = `<span class="pt-sbook" aria-hidden="true">🪄</span>` + list.map((sp, i) => {
      const d = G.done[sp.id] || {}, dbl = d[o] && !d[l];
      return `<button type="button" class="pt-sp${d[l] ? ' xong' : ''}${dbl ? ' doi' : ''}${sp.k === 'undo' ? ' rut' : ''}${POOL.review.has(sp.id) ? ' on' : ''}" data-sp="${i}" aria-label="${h(spText(sp, l))}">
        <span class="pt-pin">${picHtml(sp.pic)}</span>${dbl ? '<i class="pt-srb">🌈</i>' : ''}${d[l] ? '<i class="pt-sok">✓</i>' : ''}</button>`;
    }).join('');
    box.querySelectorAll('[data-sp]').forEach(b => b.onclick = () => model(list[+b.dataset.sp], l, b));
  }
  function kidHint(t, sp, ms) {
    const b = $('ptKb'); if (!b) return;
    b.innerHTML = `${sp && sp.pic ? `<span class="pt-bpic">${picHtml(sp.pic)}</span>` : ''}<small>🗣️ Con nói:</small>${h(t)}`; b.hidden = false;
    clearTimeout(b._t); b._t = setTimeout(() => b.hidden = true, ms || 4500);
  }

  /* chạm bong bóng (hoặc phù thuỷ tự rủ): phù thuỷ nói câu mẫu, rồi nút micro nháy "đến lượt con" */
  function model(sp, l, el, auto, listenNow) {
    if (!root) return; poke(!auto); stopRec();
    if (listenNow === undefined) listenNow = !auto;
    const t = spText(sp, l); if (!t) return;
    root.querySelectorAll('.pt-sp.nghe').forEach(x => x.classList.remove('nghe')); if (el) el.classList.add('nghe');
    kidHint(t, sp); sparkle(l); if (auto) waveWiz(l);
    say(l, `👂 Nghe: <b>${h(t)}</b> &nbsp;→&nbsp; 🗣️ Đến lượt con nói với ${W[l].name}!${listenNow && canAuto() ? '' : ' Chạm 🎤 rồi nói.'}`);
    (sp.k === 'undo' ? sayC('no', l) : speak(t, l, sid(sp, l))).then(() => afterModel(l, listenNow));
  }
  const canAuto = () => !!SR && !(window.PT_TEST && !window.PT_TEST.auto) || !!(window.PT_TEST && window.PT_TEST.auto);
  function afterModel(l, listenNow) {
    if (!listenNow || !canAuto()) return luot();
    setTimeout(() => {
      if (!root || busy || G.end || G.active !== l || !$('ptPanel').hidden || !$('ptCards').hidden) return luot();
      ting(); setTimeout(() => turn(true), 250);
    }, 500);
  }
  function stopRec() { if (rec) { G.abort = true; try { rec.abort(); } catch (e) {} } }
  let AC = null;
  function ting() {
    try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(1320, t); o.frequency.exponentialRampToValueAtTime(1760, t + .12);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.18, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + .35);
      o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + .4); } catch (e) {}
  }
  function luot() { const m = $('ptMic'); if (!m || G.end || m.disabled) return; m.classList.remove('pt-luot'); void m.offsetWidth; m.classList.add('pt-luot'); clearTimeout(m._t); m._t = setTimeout(() => m.classList.remove('pt-luot'), 7000); }
  let idleT = 0, nudges = 0;
  function poke(reset) { clearTimeout(idleT); if (reset !== false) nudges = 0; idleT = setTimeout(nudge, 9000); }
  function nudge() {
    if (!root || G.end || G.bonus || G.dlg) return;
    if (busy || !$('ptPanel').hidden || !$('ptCards').hidden) { idleT = setTimeout(nudge, 4000); return; }
    if (nudges >= 3) return;
    nudges++;
    const l = G.active;
    if (!l) {
      ['en', 'zh'].forEach((x, i) => setTimeout(() => { if (root) waveWiz(x); }, i * 900));
      kidHint(CM('wake', 'en') + '  /  ' + CM('wake', 'zh'), null, 4200);
      say('', '👆 Chạm <b>Leo</b> (tiếng Anh) hoặc <b>Xiaomei</b> (tiếng Trung) rồi gọi bạn dậy nhé!'); poke(false); return;
    }
    if (!G.awake[l]) { wakeHint(l, false); poke(false); return; }
    suggest(l, false);
  }
  function suggest(l, listenNow) {
    drawSpells(); const list = G.list || [], i = list.findIndex(x => x.k !== 'undo');
    if (i >= 0) model(list[i], l, $('ptSpells').querySelector(`[data-sp="${i}"]`), true, listenNow);
  }
  function wakeHint(l, listenNow) {
    kidHint(CM('wake', l), null, 4200); waveWiz(l);
    say(l, `👂 Nghe rồi 🗣️ con gọi: <b>${h(CM('wake', l))}</b>${listenNow && canAuto() ? '' : ' · Chạm 🎤 rồi nói.'}`);
    sayC('wake', l).then(() => afterModel(l, listenNow));
  }

  /* ---------- chọn phù thuỷ ---------- */
  function pick(l, quiet) {
    if (G.end || G.dlg || (G.bonus && !quiet)) return;
    G.active = l; root.querySelectorAll('.pt-wiz').forEach(b => b.classList.toggle('pt-chon', b.dataset.w === l));
    const mic = $('ptMic'); mic.disabled = false; mic.classList.toggle('zh', l === 'zh');
    $('ptMicT').textContent = G.awake[l] ? (l === 'en' ? 'Nói với Leo' : '说给 Xiaomei 听') : (l === 'en' ? 'Gọi: Hi, Leo!' : '叫：你好，Xiaomei！');
    say(l, G.awake[l] ? `Con ra lệnh bằng <b>${l === 'en' ? 'tiếng Anh' : 'tiếng Trung'}</b>. Chạm một tranh 🪄 để nghe câu, rồi chạm 🎤 và nói.` : `Chạm 🎤 rồi gọi: <b>${CM('wake', l)}</b>`);
    $('ptCards').hidden = true; drawSpells(); poke();
    if (!G.awake[l] && !quiet) wakeHint(l, true);
  }

  /* ---------- một lượt nói ---------- */
  let busy = false;
  async function turn(auto) {
    auto = auto === true;
    if (busy || !G.active || G.end || G.dlg) return; const l = G.active; busy = true; poke(); G.abort = false;
    $('ptMic').classList.remove('pt-luot');
    const mic = $('ptMic'), wz = root.querySelector('.w-' + l); mic.classList.add('on'); wz.classList.add('pt-tai'); say(l, '🎧 Đang nghe…');
    if (!canListen()) { busy = false; mic.classList.remove('on'); wz.classList.remove('pt-tai'); if (!G.bonus) showCards(l, true); return; }
    const r = await listen(l, t => say(l, '🎧 ' + h(t)));
    mic.classList.remove('on'); busy = false; if (!root) return; wz.classList.remove('pt-tai'); poke();
    if (G.abort || r.err === 'aborted') { G.abort = false; return; }
    const alts = (r.alts || []).filter(Boolean);
    if (r.err === 'not-allowed' || r.err === 'service-not-allowed') { say(l, 'Con cần cho phép dùng micro (ba mẹ bấm "Cho phép"). Tạm thời con chạm tranh nhé.'); if (G.bonus) bonusResult(l, []); else showCards(l, true); return; }
    if (auto && !alts.length && r.err && r.err !== 'no-speech') { luot(); say(l, '🎤 Con chạm micro rồi nói nhé!'); return; }
    if (G.bonus) return bonusResult(l, alts);
    if (!alts.length) { if (auto) { luot(); say(l, '🎤 Con sẵn sàng thì chạm micro rồi nói nhé!'); return; } return miss(l, ''); }
    say(l, 'Con nói: <b>' + h(alts[0]) + '</b>');
    handle(l, alts);
  }
  function handle(l, alts) {
    const N = alts.map(a => norm(a, l));
    if (!G.awake[l]) {
      if (N.some(n => WAKE[l].test(n)) || (G.miss >= 1 && N.some(n => WAKE_KEY[l].test(n)))) return wake(l);
      return miss(l, CM('wake', l));
    }
    const f = find(l, alts, POOL.list);
    if (N.some(n => UNDO[l].test(n)) && !(f.sp && f.full)) return undo(l);
    const lg = longHit(l, N, POOL.uid);
    if (f.combo) return castCombo(l, f.combo, alts, false);
    if (lg && f.sp) return castCombo(l, [f.sp], alts, true);
    if (!f.sp) return miss(l, '');
    cast(l, f.sp, f.full, false, alts);
  }
  function wake(l) {
    G.awake[l] = true; G.miss = 0; root.querySelector('.w-' + l).classList.remove('pt-ngu'); sparkle(l);
    bubble(l, CM('hello', l)); sayC('hello', l);
    pick(l, true); if (typeof sfx === 'object' && sfx.ok) try { sfx.ok(); } catch (e) {}
    setTimeout(() => { if (root && G.active === l && !busy && !G.end) { nudges = 0; suggest(l, true); } }, 2600);
  }
  function parOf(sp, l, alts) {
    if (!sp.par || !alts) return {};
    const N = alts.map(a => norm(a, l)); return sp.par === 'num' ? { n: parNum(l, N) } : { c: parCol(l, N) };
  }
  function note(sp, l, full, tap) {
    if (G.bonus) return;
    const id = sp.id + '|' + l, st = tap ? 0 : full ? 2 : 1, old = G.log[id];
    if (!old) G.log[id] = { id: sp.id, l, st, o: G.n++ }; else if (st > old.st) old.st = st;
  }
  function clearMore() { const b = $('ptKb'); if (b && b.dataset.more) { b.hidden = true; delete b.dataset.more; } }
  function cast(l, sp, full, tap, alts) {
    G.miss = 0; clearMore(); hist.push(clone(S)); if (hist.length > 20) hist.shift();
    note(sp, l, full, tap);
    const post = []; apply(sp, l, parOf(sp, l, alts), post);
    sparkle(l); render(); setTimeout(() => post.forEach(f => f()), 300);
    if (sp.reply) { const rt = sp.reply[l]; setTimeout(() => { repBubble(rt); speak(rt, l, sp.id + '.reply.' + l); }, 1700); }
    if (!tap) { G.meter[l] = Math.min(GOAL, G.meter[l] + 1); G.said++; const s = store(); s.seen[sp.id] = (s.seen[sp.id] || 0) + 1; }
    const ok = W[l].ok[G.said % W[l].ok.length];
    if (full) { bubble(l, CM(ok, l) + ' ' + CM('sent', l)); if (!sp.reply) sayC(ok, l); } else { kidHint(sp[l].say, sp, 4200); if (!sp.reply) speak(sp[l].say, l, sid(sp, l)).then(() => { if (root && !G.end && !G.bonus && (G.viTry = (G.viTry || 0) + 1) <= 2) sayV('try'); }); }
    if (!full) say(l, `Hình đổi rồi! Con thử nói cả câu: <b>${h(sp[l].say)}</b>`); else say(l, `✨ <b>${h(sp[l].say)}</b>`);
    if (!tap) { G.done[sp.id] = G.done[sp.id] || {}; G.done[sp.id][l] = true; }
    doubleCheck(sp, l);
    ladder(l, full, tap);
    persist(); render(); drawSpells();
    if (G.meter.en >= GOAL && G.meter.zh >= GOAL) endRound();
  }
  function doubleCheck(sp, l) {
    const d = G.done[sp.id]; if (!(d && d.en && d.zh && !d.double)) return;
    d.double = true; G.doubles++; const s = store(); s.cards[sp.id] = (s.cards[sp.id] || 0) + 1;
    setTimeout(() => { fx('🌈', 'rainbow'); sparkle('en'); sparkle('zh'); bubble('en', CM('double', 'en')); bubble('zh', CM('double', 'zh'));
      say(l, '🌈 <b>Phép đôi!</b> Con nói một ý bằng cả hai thứ tiếng. Con được 1 thẻ phép đôi!'); }, 900);
  }
  /* phép nối / câu dài: chạy liền các hiệu ứng, Phép vàng + thẻ vàng (tối đa 1 thẻ mỗi phút) */
  function castCombo(l, sps, alts, isLong) {
    G.miss = 0; clearMore(); hist.push(clone(S)); if (hist.length > 20) hist.shift();
    const post = [];
    sps.forEach((sp, i) => { setTimeout(() => { if (!root) return; const p2 = []; apply(sp, l, parOf(sp, l, alts), p2); render(); setTimeout(() => p2.forEach(f => f()), 200); }, i * 900); });
    sps.forEach(sp => { note(sp, l, true, false); G.done[sp.id] = G.done[sp.id] || {}; G.done[sp.id][l] = true; const s = store(); s.seen[sp.id] = (s.seen[sp.id] || 0) + 1; });
    G.meter[l] = Math.min(GOAL, G.meter[l] + 1); G.said++; G.run = 0; G.sinceMore = 0;
    sparkle(l); render();
    const now = Date.now(); let gold = '';
    if (now - G.lastGold > 60000 || window.PT_TEST) { G.lastGold = now; G.golds++; const s = store(); s.gold[POOL.uid] = (s.gold[POOL.uid] || 0) + 1; gold = ' Con được 1 thẻ vàng!'; }
    setTimeout(() => { goldCard(); fx('🌟', 'rainbow'); burst('✨', 10); burst('🎉', 6); bubble(l, CM('gold', l) + ' ' + CM('sent', l), 3200); sayC('gold', l).then(() => { if (root && !G.end && G.golds <= 2) sayV('gold'); });
      say(l, `🌟 <b>Phép vàng!</b> Con nói ${isLong ? 'một câu dài' : 'hai phép liền một hơi'}.${gold}`); try { if (typeof confetti === 'function') confetti(50); } catch (e) {} }, sps.length * 900 - 200);
    sps.forEach(sp => doubleCheck(sp, l));
    persist(); drawSpells();
    if (G.meter.en >= GOAL && G.meter.zh >= GOAL) endRound();
  }
  /* bậc thang: sau 2 câu trọn vẹn liền nhau, phù thuỷ rủ "Say more!" kèm hai tranh phép nối */
  function ladder(l, full, tap) {
    if (tap) return;
    G.run = full ? G.run + 1 : 0; G.sinceMore++;
    const o = l === 'en' ? 'zh' : 'en';
    G.streak.push(l); G.streak = G.streak.slice(-3);
    if (G.streak.length === 3 && G.streak.every(x => x === l) && G.meter[o] < GOAL) setTimeout(() => { bubble(o, CM('other', o), 3200); waveWiz(o); }, 1600);
    if (G.run >= 2 && G.sinceMore >= 3 && !G.bonus) {
      const co = (D.units[POOL.uid].combo || []).map(p => p.map(k => POOL.list.find(sp => sp.k === k && sp.uid === POOL.uid) || SP[POOL.uid + '.' + k]).filter(Boolean)).filter(a => a.length === 2);
      if (!co.length) return; G.sinceMore = 0; G.run = 0;
      const pair = co[G.said % co.length], txt = pair.map(sp => sp[l].say).join(' ');
      setTimeout(async () => { if (!root || busy || G.end || G.active !== l) return; bubble(l, CM('more', l), 3000);
        const b = $('ptKb'); if (b) { b.innerHTML = `<span class="pt-bpic">${picHtml(pair[0].pic)}<b>+</b>${picHtml(pair[1].pic)}</span><small>🗣️ Con nói liền một hơi (chạm để tắt):</small>${h(txt)}`; b.hidden = false; clearTimeout(b._t); b.dataset.more = '1'; }
        say(l, `🌟 Thử <b>nói liền hai phép</b> nhé: <b>${h(txt)}</b>`);
        await sayC('more', l); if (!root || G.end) return; await sayV('two'); if (!root || G.end) return;
        await speak(pair[0][l].say, l, sid(pair[0], l)); if (!root || G.end) return; await speak(pair[1][l].say, l, sid(pair[1], l));   // đọc mẫu hai phép liền nhau
        afterModel(l, true); }, 1800);
    }
  }
  function undo(l, tap) {
    if (!hist.length) { bubble(l, CM('nothing', l)); return; }
    S = hist.pop(); render(); sparkle(l); bubble(l, CM('undo', l)); sayC('undo', l);
    if (!tap) { G.said++; G.meter[l] = Math.min(GOAL, G.meter[l] + 1); } render(); drawSpells();
    say(l, `↩️ Đã rút lại lệnh. Con nói lệnh mới nhé!`);
    if (G.meter.en >= GOAL && G.meter.zh >= GOAL) endRound();
  }
  function miss(l, want) {
    G.miss++;
    if (G.miss >= 2) { say(l, 'Máy chưa nghe rõ. Con chạm một tranh để làm phép, rồi nói theo nhé!'); showCards(l, false); G.miss = 0; return; }
    say(l, want ? `Con thử nói lại: <b>${h(want)}</b>` : 'Con nói to, rõ hơn một chút nhé! Chạm 💡 nếu cần gợi ý.');
    if (want) sayC('wake', l);
  }
  /* ---------- tranh gợi ý / chạm thay ---------- */
  function showCards(l, hintOnly) {
    const box = $('ptCards'); if (!box || G.bonus || G.end || G.dlg) return; poke();
    const items = !G.awake[l] ? [{ wake: 1 }] : spellsFor(l);
    box.innerHTML = `<div class="pt-ct">${W[l].name} · ${!G.awake[l] ? 'chạm để gọi bạn dậy' : 'chạm một tranh để làm phép, rồi con nói theo nhé'}</div>` +
      items.map((it, i) => `<button type="button" class="pt-card ${l}" data-t="${i}"><span class="pt-cpic">${it.wake ? `<img src="${A + W[l].img}.webp" alt="">` : picHtml(it.pic)}</span>
        <em>${h(it.wake ? CM('wake', l) : spText(it, l))}</em></button>`).join('') + `<button type="button" class="pt-card x" data-close="1">✕</button>`;
    box.hidden = false;
    box.querySelectorAll('[data-t]').forEach(b => b.onclick = () => {
      const it = items[+b.dataset.t]; box.hidden = true;
      if (it.wake) { G.active = l; wake(l); return; }
      if (it.k === 'undo') { undo(l, true); return; }
      cast(l, it, false, true); say(l, `Con chạm tranh: <b>${h(it[l].say)}</b> · Con nói theo để thanh phép đầy nhé!`); setTimeout(luot, 1500);
    });
    box.querySelector('[data-close]').onclick = () => box.hidden = true;
  }
  /* ---------- ôn mẫu câu trước khi chơi: 4 phép của hôm nay + cách rút lại ---------- */
  async function warmup() {
    const p = $('ptPanel'), uniq = POOL.list.slice(0, Math.max(4, POOL.list.length));
    const rot = (dayNum() || 1) % Math.max(1, POOL.list.length);
    const four = [0, 1, 2, 3].map(i => POOL.list[(rot + i * 2) % POOL.list.length]);
    const W8 = [['en', four[0]], ['zh', four[1]], ['en', four[2]], ['zh', four[3]], ['en', 'undo'], ['zh', 'undo']];
    let i = -1;
    const intro = () => {   // màn giới thiệu 3 bậc thang, có lời cô Hươu
      const L = POOL.list, a = L[0], m = L[1] || a, b = L[2] || a, c = L[3] || m;   // bậc 1 và 2 dùng hai hình khác nhau cho dễ thấy
      p.innerHTML = `<div class="pt-wbox"><div class="pt-wt">🪜 Ba bậc thang phép thuật</div>
        <div class="pt-stairs"><div class="pt-st s3"><span class="pt-sn">3</span><span class="pt-spic">${picHtml(b.pic)}<b>+</b>${picHtml(c.pic)}</span><em>Nói liền hai phép một hơi → <b>Phép vàng 🌟</b></em></div>
          <div class="pt-st s2"><span class="pt-sn">2</span><span class="pt-spic">${picHtml(m.pic)}</span><em>Nói cả câu</em></div>
          <div class="pt-st s1"><span class="pt-sn">1</span><span class="pt-spic">${picHtml(a.pic)}</span><em>Nói một từ</em></div></div>
        <div class="pt-wbtn"><button type="button" class="ls-b" id="ptI1">🔊 Nghe cô Hươu</button><button type="button" class="ls-b" id="ptI2">Tiếp ›</button></div>
        <button type="button" class="pt-wskip" id="ptW4">Bỏ qua phần ôn, vào chơi</button></div>`;
      p.hidden = false; let tok = 0;
      const play = async () => { const my = ++tok; for (const k of ['i1', 'i2', 'i3']) { if (!root || my !== tok) return; $('ptI1') && p.querySelectorAll('.pt-st').forEach(x => x.classList.toggle('on', x.classList.contains('s' + k[1]))); await sayV(k); } p.querySelectorAll('.pt-st').forEach(x => x.classList.remove('on')); };
      play(); $('ptI1').onclick = play; $('ptI2').onclick = () => { tok++; i = 0; step(); }; $('ptW4').onclick = () => { tok++; i = W8.length; step(); };
    };
    const step = () => {
      if (!root) return;
      if (i < 0) return intro();
      if (i >= W8.length) { p.hidden = true; say('', 'Chạm <b>Leo</b> (tiếng Anh) hoặc <b>Xiaomei</b> (tiếng Trung) để bắt đầu làm phép!'); nudges = 0; setTimeout(nudge, 700); return; }
      const [l, spx] = W8[i], undoStep = spx === 'undo', t = undoStep ? CM('no', l) : spx[l].say;
      p.innerHTML = `<div class="pt-wbox"><div class="pt-wt">🪄 Ôn mẫu câu trước khi chơi · ${i + 1}/${W8.length}</div>
        <div class="pt-wrow"><img src="${A + W[l].img}.webp" alt="" class="pt-wwiz"><div class="pt-wsay ${l}">${undoStep ? `<small>${l === 'en' ? 'Leo' : 'Xiaomei'} làm sai phép? Con rút lại bằng câu:</small>` : `<small>${l === 'en' ? 'Leo nghe tiếng Anh' : 'Xiaomei nghe tiếng Trung'}</small>`}<b>${h(t)}</b></div>
          <span class="pt-wpic">${undoStep ? '↩️' : picHtml(spx.pic)}</span></div>
        <div class="pt-wbtn"><button type="button" class="ls-b" id="ptW1">🔊 Nghe</button><button type="button" class="ls-b pt-wmic" id="ptW2">🎤 Con nói theo</button>
          <button type="button" class="ls-b" id="ptW3">Tiếp ›</button></div><div class="pt-wfb" id="ptWfb"></div>
        <button type="button" class="pt-wskip" id="ptW4">Bỏ qua phần ôn, vào chơi</button></div>`;
      p.hidden = false; const hear = () => undoStep ? sayC('no', l) : speak(t, l, sid(spx, l)); hear();
      $('ptW1').onclick = hear;
      $('ptW3').onclick = () => { i++; step(); };
      $('ptW4').onclick = () => { i = W8.length; step(); };
      let tries = 0;
      $('ptW2').onclick = async () => {
        if (!canListen()) { i++; return step(); }
        $('ptWfb').textContent = '🎧 Đang nghe…'; const r = await listen(l, x => { const f = $('ptWfb'); if (f) f.textContent = '🎧 ' + x; });
        if (!root) return; tries++;
        const N = (r.alts || []).map(a => norm(a, l));
        const ok = undoStep ? N.some(n => UNDO[l].test(n)) : (() => { const s = score(spx[l], l, N); return s.full || (spx[l].key && N.some(n => mk(spx[l].key, l).test(n))); })();
        $('ptWfb').innerHTML = ok ? '⭐ Giỏi quá! Con nói đúng rồi.' : (tries >= 2 ? 'Tốt lắm! Mình chơi rồi luyện tiếp nhé.' : 'Con nghe lại rồi nói theo lần nữa nhé!');
        if (ok || tries >= 2) setTimeout(() => { i++; step(); }, 1200); else hear();
      };
    };
    step();
  }

  /* ---------- Phép thưởng cuối: tối đa 3 câu con mới chạm tranh / mới nói một từ, xen hai thứ tiếng ---------- */
  function bonusList() {
    const L = Object.values(G.log).filter(x => x.st < 2 && SP[x.id]).sort((a, b) => a.st - b.st || a.o - b.o);
    const q = { en: L.filter(x => x.l === 'en'), zh: L.filter(x => x.l === 'zh') }, out = [];
    let want = L.length ? L[0].l : 'en';
    while (out.length < 3 && (q.en.length || q.zh.length)) { const from = q[want].length ? want : (want === 'en' ? 'zh' : 'en'); out.push(q[from].shift()); want = from === 'en' ? 'zh' : 'en'; }
    return out;
  }
  function endRound() {
    if (G.end || G.bonus || G.bonusDone) return; G.bonusDone = true;
    const list = canListen() ? bonusList() : [];
    if (!list.length) return setTimeout(dialogue, 2200);
    G.bonus = { list, i: 0, ok: 0 }; clearTimeout(idleT);
    setTimeout(() => { if (!root) return; say('', '🎁 <b>Phép thưởng!</b> Leo và Xiaomei rủ con làm thêm vài phép nữa.'); fx('🎁'); bubble('en', CM('bonus', 'en'), 2400); bubble('zh', CM('bonus', 'zh'), 2400); drawSpells(); }, 2200);
    setTimeout(bonusStep, 4600);
  }
  function prep(sp) { S = blank(); render(); }
  function bonusStep() {
    if (!root || G.end || !G.bonus) return;
    const B = G.bonus;
    if (B.i >= B.list.length) { G.bonusList = B; G.bonus = null; drawSpells(); return setTimeout(dialogue, 1500); }
    const it = B.list[B.i], l = it.l, sp = SP[it.id];
    const cur = B.cur = { sp, l };
    prep(sp); pick(l, true); drawSpells();
    model(sp, l, null, true, true);
    clearTimeout(B.t); B.t = setTimeout(() => { if (G.bonus && G.bonus.cur === cur && !busy) bonusResult(l, []); }, 16000);
  }
  function bonusResult(l, alts) {
    const B = G.bonus, cur = B && B.cur; if (!cur || l !== cur.l) return;
    B.cur = null; clearTimeout(B.t);
    const N = alts.map(a => norm(a, l)), s = score(cur.sp[l], l, N), full = s.full, key = !full && !!cur.sp[l].key && N.some(n => mk(cur.sp[l].key, l).test(n));
    cast(l, cur.sp, full, true, alts);
    if (full) { B.ok++; say(l, `🎁 ✨ Giỏi quá! <b>${h(cur.sp[l].say)}</b>`); }
    else { bubble(l, CM('try', l), 3200); kidHint(cur.sp[l].say, cur.sp, 3200); sayC('try', l);
      say(l, key ? '🎁 Tốt lắm! Lần sau con nói cả câu nhé.' : '🎁 Con cố gắng lắm! Mình làm phép tiếp nhé.'); }
    B.i++; drawSpells(); setTimeout(bonusStep, 2800);
  }

  /* ---------- Mini hội thoại 3 lượt (mỗi tiếng một lần): bạn hỏi → con đáp ×2, rồi đổi vai con hỏi ---------- */
  async function dialogue() {
    if (!root || G.end) return;
    if (!canListen()) return finish();
    const du = D.units[POOL.uid]; if (!du || !du.dia) return finish();
    G.dlg = true; clearTimeout(idleT); drawSpells(); $('ptCards').hidden = true; $('ptMic').disabled = true;
    say('', '💬 <b>Hội thoại nhỏ!</b> Leo và Xiaomei hỏi, con trả lời nhé.');
    await sleep(1800); if (!root) return;
    for (const l of ['en', 'zh']) {
      const turns = du.dia[l]; if (!turns || turns.length < 2) continue;
      root.querySelectorAll('.pt-wiz').forEach(b => b.classList.toggle('pt-chon', b.dataset.w === l));
      for (let t = 0; t < 3; t++) { if (!root) return; await diaTurn(l, t, t === 2 ? turns[0] : turns[t], du); await sleep(500); }
    }
    G.dlg = false; if (!root) return;
    if (G.dia >= 3) { const s = store(); s.dia = (s.dia || 0) + 1; }
    finish();
  }
  async function diaTurn(l, t, tr, du) {
    const asks = t === 2;   // lượt 3: con hỏi, phù thuỷ đáp
    const sp = ((POOL.list.find(sp => sp[l].say === tr.a)) || null);
    const qs = tr.qid, as = tr.aid;
    if (!asks) { say(l, `💬 ${W[l].name} hỏi: <b>${h(tr.q)}</b>`); bubble(l, tr.q, 4200); await speak(tr.q, l, qs); }
    else { say(l, `💬 Lượt của con! Con hỏi ${W[l].name}: <b>${h(tr.q)}</b>`); kidHint(tr.q, null, 7500); await sleep(600); }
    if (!root) return;
    if (!asks) kidHint(tr.a, sp, 7500);
    const mic = $('ptMic'); mic.classList.add('on'); ting(); await sleep(250);
    const r = await listen(l, x => say(l, '🎧 ' + h(x))); mic.classList.remove('on'); if (!root) return;
    const N = (r.alts || []).map(a => norm(a, l)), target = asks ? tr.q : tr.a;
    let ok = false;
    if (N.length) { const c = cmdOf(target, l, asks ? null : tr.atok); const s = score(c, l, N); ok = s.full || (s.m >= 1 && s.r >= .5); }
    if (ok) G.dia++;
    if (asks) { bubble(l, tr.a, 4200); say(l, `💬 ${W[l].name}: <b>${h(tr.a)}</b>`); await speak(tr.a, l, as); }
    else { bubble(l, ok ? CM('ok1', l) : CM('try', l), 2600); say(l, ok ? '✨ Giỏi quá!' : '💬 Con cố gắng lắm! Mình đi tiếp nhé.'); await (ok ? sayC('ok1', l) : sayC('try', l)); }
  }
  function cmdOf(text, l, tok) {   // lượt hỏi (không có atok): so từ khoá thô theo chữ
    if (tok) return tok;
    const parts = l === 'en' ? text.toLowerCase().replace(/[^a-z0-9' ]+/g, ' ').split(/\s+/).filter(w => w.length > 2 && !['the', 'you', 'your', 'are', 'what', 'how', 'old'].includes(w) || ['old'].includes(w)) : [...text.replace(/[，。！？、\s]/g, '')].filter(ch => !'的了吗吧呢你我这那是'.includes(ch));
    const tk = [...new Set(parts)].map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')); return { tok: tk, need: Math.max(1, Math.ceil(tk.length * .6)) };
  }

  /* ---------- xong lượt ---------- */
  function finish() {
    if (!root || G.end) return; G.end = true; clearTimeout(idleT); G.dlg = false; drawSpells(); $('ptMic').disabled = true;
    const s = store(); let star = '';
    if (s.d !== today() && typeof addStars === 'function') { s.d = today(); addStars(STAR_ROUND); star = `<p class="pt-star">+${STAR_ROUND} ⭐ vào ví của con</p>`; }
    persist();
    const cards = Object.keys(s.cards).length, golds = Object.values(s.gold || {}).reduce((a, b) => a + b, 0);
    const p = $('ptPanel'); p.innerHTML = `<div class="pt-wbox pt-end"><div class="pt-big">🎉🪄🌈</div><h3>Con là phù thuỷ lời nói!</h3>
      <p>Con đã nói <b>${G.said}</b> câu phép thuật · Phép đôi hôm nay: <b>${G.doubles}</b>${G.golds ? ` · Phép vàng: <b>${G.golds}</b> 🌟` : ''}</p><p>Album: <b>${cards}</b> thẻ phép đôi${golds ? ` · <b>${golds}</b> thẻ vàng` : ''}</p>${G.bonusList ? `<p>🎁 Phép thưởng: <b>${G.bonusList.ok}/${G.bonusList.list.length}</b></p>` : ''}${G.dia ? `<p>💬 Hội thoại: <b>${G.dia}/6</b></p>` : ''}${star}
      <div class="pt-wbtn"><button type="button" class="ls-b" id="ptAgain">↺ Chơi lại</button><button type="button" class="ls-b" id="ptDone">Xong</button></div></div>`;
    p.hidden = false; fx('🌈', 'rainbow'); try { if (typeof confetti === 'function') confetti(60); } catch (e) {}
    $('ptAgain').onclick = () => { close(); open(); }; $('ptDone').onclick = close;
  }

  /* ---------- ô trò chơi trong lưới các bước của ngày (mọi ngày, cả hai khoá) ---------- */
  function regrid(box) { const n = box.querySelectorAll('.ht').length; box.classList.toggle('n8', n > 6 && n <= 8); box.classList.toggle('n10', n > 8); }
  function tile() {
    const box = document.querySelector('.dy-tiles'); if (!box || box.querySelector('.ht-pt')) return;
    const d = dayNum(); if (!(d >= 1 && d <= 99)) return;
    const s = (typeof P === 'object' && P && P.pt) || {}, doneToday = s.d === today();
    box.insertAdjacentHTML('beforeend', `<button type="button" class="ht ht-game ht-pt${doneToday ? ' done' : ''}" style="--tc:#8E44C9">
      <span class="ht-img" style="background-image:url('${A}trang/ls_park.webp')"><img class="htg-a" src="${A + W.en.img}.webp" alt=""><img class="htg-b" src="${A + W.zh.img}.webp" alt=""><i class="htg-ic">🪄</i></span>
      ${doneToday ? `<span class="ht-badge ok">✓ +${STAR_ROUND}★</span>` : ''}<span class="ht-lb"><small>Trò chơi nói · thêm</small><b>Phép thuật lời nói</b></span></button>`);
    box.querySelector('.ht-pt').onclick = () => { try { sfx.pop(); } catch (e) {} open(); };
    regrid(box);
  }
  const appEl = document.getElementById('app'); if (appEl) new MutationObserver(tile).observe(appEl, { childList: true });
  addEventListener('hashchange', () => setTimeout(tile, 0)); tile();
  if (/[?&]phep=1/.test(location.search)) setTimeout(open, 600);
  window.PT_GAME = { open, close, handle: (l, t) => handle(l, [].concat(t)), state: () => ({ S, G, POOL }), poolFor, find: (l, t, pool) => { const r = find(l, [].concat(t), pool || POOL.list); return r; }, unitOf, learnedBefore, norm, score, SP, D };
})();
