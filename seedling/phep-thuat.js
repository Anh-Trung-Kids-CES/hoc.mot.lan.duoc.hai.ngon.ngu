/* =====================================================================
   PHÉP THUẬT LỜI NÓI · game "con nói – hình đổi", dùng chung web Little Seed và Seedling (cả khoá, 24 unit).
   Nội dung nằm ở phep-thuat-du-lieu.js (sinh tự động từ chuong-trinh/phep-thuat/); file này chỉ là máy chạy.
   LUẬT HỎI – ĐÁP – HIỆN TRANH (chị duyệt 23/11/2026, thay luật gọi phù thuỷ dậy / chọn thứ tiếng / rút lệnh của 11/11):
   - Mỗi lúc chỉ một phù thuỷ: Leo hỏi 4 câu tiếng Anh, chào rồi bay đi; Xiaomei hỏi đúng 4 câu đó bằng tiếng Trung về bức tranh con vừa dựng.
   - Mỗi câu có 2–3 tranh gợi ý; con nói tranh nào thì tranh đó hiện. Thang gợi ý 4 bậc, nút 💡 lên bậc ngay.
   - Chấm theo ý, sửa ngầm bằng cách nhắc lại câu chuẩn. Nói hai tranh một hơi = Phép vàng; một ý nói được cả hai tiếng = Phép đôi.
   - Cuối lượt: chụp bức tranh vào album, Phép thưởng (câu mới chạm tranh / nói một phần), +2 ⭐ (một lần mỗi ngày).
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
    S = blank(); hist = [];   // cảnh bắt đầu trống: bức tranh lớn dần theo câu trả lời của con
    G = { act: '', ti: 0, turn: null, turns: [], dots: { en: 0, zh: 0 }, chosen: [], cued: {}, done: {}, said: 0, doubles: 0, golds: 0, log: {}, n: 0, bonus: null, bonusDone: false, end: false, abort: false, demo: false };
    G.turns = plan();
    root = document.createElement('div'); root.className = 'pt pt-qa'; root.innerHTML = `
      <div class="pt-scene" id="ptScene"><img class="pt-bg" id="ptBg" alt=""><div class="pt-sky" id="ptSky"><span class="pt-sun"></span><span class="pt-moon"></span><div class="pt-wxp" id="ptWxp"></div></div>
        <div class="pt-stage" id="ptStage"></div><div class="pt-ex" id="ptEx"></div><div class="pt-fx" id="ptFx"></div><div class="pt-spells" id="ptSpells" hidden></div>
        <div class="pt-dots" id="ptDots" aria-label="Số câu đã trả lời"></div>
        <div class="pt-kid" id="ptKid"><span class="pt-kbub" id="ptKb" hidden></span><button type="button" class="pt-undo" id="ptUndo" hidden>↺ Đổi ý</button><b>🧒 Con</b></div>
        ${['en', 'zh'].map(l => `<div class="pt-wiz w-${l} pt-an" data-w="${l}" aria-label="${W[l].name}">
          <img src="${A + W[l].img}.webp" alt=""><span class="pt-wand"></span><span class="pt-ear">👂</span><span class="pt-name">${W[l].name}</span><span class="pt-bub" hidden></span></div>`).join('')}
      </div>
      <div class="pt-bar"><button type="button" class="pt-x" aria-label="Đóng">✕</button>
        <div class="pt-said" id="ptSaid">🪄 Leo sắp hỏi con. Con trả lời bằng một tranh nhé!</div>
        <button type="button" class="pt-mic" id="ptMic" disabled><span>🎤</span><b id="ptMicT">Nói</b></button>
        <button type="button" class="pt-hint" id="ptHint" aria-label="Gợi ý">💡</button></div>
      <div class="pt-cards" id="ptCards" hidden></div>
      <div class="pt-panel" id="ptPanel" hidden></div>`;
    document.body.appendChild(root); document.body.classList.add('pt-on');
    try { if (typeof stopAll === 'function') stopAll(); } catch (e) {}
    root.querySelector('.pt-x').onclick = close; $('ptKb').onclick = () => { $('ptKb').hidden = true; };
    $('ptMic').onclick = () => turn(false); $('ptHint').onclick = () => { if (G.turn && !G.turn.done && !G.bonus) hint(G.turn.lvl + 1); };
    render(true); dots();
    if (!canListen()) say('', 'Máy này chưa nghe được giọng nói (cần Chrome hoặc Safari). Con chạm tranh để chơi nhé.');
    if (!store().qaIntro) intro(); else startAct('en');
  }
  function close() { ++tok; clearTimeout(idleT); try { rec && rec.abort(); } catch (e) {} try { speechSynthesis.cancel(); } catch (e) {} try { curAudio && curAudio.pause(); } catch (e) {} curAudio = null; if (root) root.remove(); root = null; document.body.classList.remove('pt-on'); }

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
      const left = k === 1 ? 44 : (k > 7 ? 10 : 16) + j * ((k > 7 ? 64 : 56) / (k - 1));   // chừa bên phải cho phù thuỷ, góc trái dưới cho bóng nói của con
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

  /* ---------- tranh ---------- */
  function objImg(id) { return `<img src="${objSrc(id)}" alt="" onerror="if(${D.objs[id].e ? 1 : 0}){this.outerHTML='<span class=pt-pe>${EMO(id)}</span>'}">`; }
  function picHtml(p) {
    if (p.e) return `<span class="pt-pe">${p.e}</span>`;
    if (p.bg) return `<img class="pt-pbg" src="${A + bgList()[(S.scene + 1) % bgList().length]}.webp" alt="">`;
    if (p.bg_img) return `<img class="pt-pbg" src="${A + p.bg_img}.webp" alt="">`;
    return (p.o || []).map(objImg).join('');
  }
  function kidHint(t, sp, ms) {   // bóng nói của con (góc dưới bên trái): câu gợi ý, câu con vừa nói
    const b = $('ptKb'); if (!b) return;
    b.innerHTML = `${sp && sp.pic ? `<span class="pt-bpic">${picHtml(sp.pic)}</span>` : ''}<small>🗣️ Con nói:</small>${h(t)}`; b.hidden = false;
    clearTimeout(b._t); b._t = setTimeout(() => b.hidden = true, ms || 4500);
  }
  const canAuto = () => !!SR && !(window.PT_TEST && !window.PT_TEST.auto) || !!(window.PT_TEST && window.PT_TEST.auto);
  function stopRec() { if (rec) { G.abort = true; try { rec.abort(); } catch (e) {} } }
  let AC = null;
  function ting() {
    try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(1320, t); o.frequency.exponentialRampToValueAtTime(1760, t + .12);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.18, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + .35);
      o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + .4); } catch (e) {}
  }
  function luot() { const m = $('ptMic'); if (!m || G.end || m.disabled) return; m.classList.remove('pt-luot'); void m.offsetWidth; m.classList.add('pt-luot'); clearTimeout(m._t); m._t = setTimeout(() => m.classList.remove('pt-luot'), 7000); }
  /* gợi ý bậc 2: phát nửa đầu file câu mẫu (tới chỗ ngắt hơi đã đo sẵn) */
  function speakCut(id, sec) {
    return new Promise(res => {
      const b = base(id); if (!AUDIO.has(b) || typeof Audio !== 'function') return res(false);
      try {
        if (curAudio) { try { curAudio.pause(); } catch (e) {} } if (window.speechSynthesis) speechSynthesis.cancel();
        const a = new Audio(A + 'giong/phep-thuat/' + b + '.mp3'); curAudio = a; let done = false;
        const fin = ok => { if (done) return; done = true; try { a.pause(); } catch (e) {} res(ok); };
        a.onplaying = () => setTimeout(() => fin(true), sec * 1000); a.onended = () => fin(true); a.onerror = () => fin(false);
        const p = a.play(); if (p && p.catch) p.catch(() => fin(false)); setTimeout(() => fin(true), sec * 1000 + 1500);
      } catch (e) { res(false); }
    });
  }

  /* =====================================================================
     LUẬT HỎI – ĐÁP – HIỆN TRANH (chị duyệt 23/11/2026)
     Màn 1: chỉ Leo, hỏi tiếng Anh 4 câu. Leo chào rồi bay đi. Màn 2: Xiaomei hỏi tiếng Trung đúng 4 câu đó về chính bức tranh con vừa dựng.
     Mỗi câu: 2–3 tranh gợi ý; con nói tranh nào thì tranh đó hiện. Lần đầu gặp một câu hỏi trong màn, phù thuỷ đọc mẫu các tranh trước (gợi trước, hỏi sau).
     Thang gợi ý: 0 tranh · 1 tranh nảy + từ khoá · 2 nửa đầu câu · 3 cả câu mẫu · 4 máy nghe không ra 2 lần → chạm tranh (vào Phép thưởng cuối).
     Chấm theo ý: đúng ý mà khác khung câu / một từ / từ đồng nghĩa → tranh vẫn hiện, phù thuỷ nhắc lại câu chuẩn (sửa ngầm), con không phải nói lại.
     Nói tranh khác ngoài gợi ý mà là câu đã học → cũng hiện. Nói nhầm thứ tiếng (máy nhận ra) → nhận ý, phù thuỷ nói lại bằng tiếng của mình.
     ===================================================================== */
  const TURNS = 4;
  const otherL = l => l === 'en' ? 'zh' : 'en';
  function groupsOfUnit(uid) { return ((D.units[uid] || {}).qa || []).map(g => ({ uid, q: g.q, sps: g.o.map(k => SP[uid + '.' + k]).filter(Boolean) })).filter(g => g.sps.length && D.qt[g.q]); }
  function plan() {   // 4 câu hỏi của hôm nay: nhóm câu của unit đang học, câu cuối ôn unit trước (nếu có)
    const seen = store().seen || {}, d = dayNum() || 1;
    let main = POOL.on ? [] : groupsOfUnit(POOL.uid), rev = [];
    const revU = [...new Set([...POOL.review].map(id => SP[id] && SP[id].uid).filter(Boolean))];
    revU.forEach(u => groupsOfUnit(u).forEach(g => { const s = g.sps.filter(sp => POOL.review.has(sp.id)); if (s.length) rev.push(Object.assign({}, g, { sps: s.concat(g.sps.filter(sp => !s.includes(sp))) })); }));
    if (!main.length) { main = rev; rev = []; }
    if (!main.length) main = groupsOfUnit(COURSE + ORDER[0]);
    const used = {}, out = [];
    for (let t = 0; t < TURNS; t++) {
      const g = (t === TURNS - 1 && rev.length) ? rev[d % rev.length] : main[(t + d) % main.length], key = g.uid + g.q;
      used[key] = used[key] || new Set();
      const opts = g.sps.map((sp, i) => ({ sp, i, c: (seen[sp.id] || 0) + (used[key].has(sp.id) ? 9 : 0) }))
        .sort((a, b) => a.c - b.c || ((a.i + d) % g.sps.length) - ((b.i + d) % g.sps.length)).slice(0, 3).map(x => x.sp);
      opts.forEach(sp => used[key].add(sp.id));
      out.push({ q: g.q, opts });
    }
    return out;
  }
  let tok = 0;   // mỗi việc (hỏi, gợi ý, khen) một mã; việc mới bắt đầu thì việc cũ đang chờ tự dừng
  const alive = my => !!root && my === tok && !G.end;
  function showWiz(l) {
    root.querySelectorAll('.pt-wiz').forEach(b => { const on = b.dataset.w === l || l === 'both', was = !b.classList.contains('pt-an'); b.classList.toggle('pt-an', !on); if (on && !was) { b.classList.remove('pt-vao'); void b.offsetWidth; b.classList.add('pt-vao'); setTimeout(() => b.classList.remove('pt-vao'), 1000); } });
    const mic = $('ptMic'); mic.disabled = false; mic.classList.toggle('zh', l === 'zh'); $('ptMicT').textContent = l === 'zh' ? '说' : 'Nói';
  }
  function dots() {
    const el = $('ptDots'); if (!el) return;
    el.innerHTML = ['en', 'zh'].map(l => Array.from({ length: TURNS }, (_, i) => `<i class="${i < G.dots[l] ? 'on' : ''}${G.act === l && i === G.dots[l] ? ' cur' : ''}">${l === 'en' ? '⭐' : '🏮'}</i>`).join('')).join('<b></b>');
  }
  const preIdx = () => { const T = G.turn; if (!T || G.act !== 'zh' || !G.chosen[G.ti]) return -1; return T.opts.indexOf(G.chosen[G.ti]); };
  function drawOpts(hl) {
    const box = $('ptSpells'), T = G.turn, l = G.act; if (!box) return;
    if (!T || !l) { box.hidden = true; return; }
    box.className = 'pt-spells pt-opts ' + l; box.hidden = false;
    box.innerHTML = T.opts.map((sp, i) => `<button type="button" class="pt-sp${i === hl ? ' nghe' : ''}${i === preIdx() ? ' truoc' : ''}" data-o="${i}" aria-label="${h(sp[l].say)}"><span class="pt-pin">${picHtml(sp.pic)}</span></button>`).join('');
    box.querySelectorAll('[data-o]').forEach(b => b.onclick = () => tapOpt(+b.dataset.o));
  }
  async function startAct(l) {
    const my = ++tok; G.act = l; G.ti = 0; G.turn = null; showWiz(l); dots(); $('ptSpells').hidden = true;
    await sleep(800); if (!alive(my)) return;
    sparkle(l); bubble(l, l === 'en' ? CM('hello', 'en') : CM('come', 'zh'), 2800);
    await (l === 'en' ? sayC('hello', 'en') : sayC('come', 'zh')); if (!alive(my)) return;
    ask();
  }
  async function ask(again) {
    const my = ++tok, l = G.act; if (!root || G.end || !l) return;
    if (!again) G.turn = Object.assign({}, G.turns[G.ti], { lvl: 0, miss: 0, done: false });
    const T = G.turn; stopRec(); $('ptCards').hidden = true; clearTimeout(idleT);
    drawOpts(preIdx()); dots();
    const q = D.qt[T.q][l], k = l + T.q;
    if (!G.cued[k] && T.opts.length > 1) {   // gợi trước, hỏi sau: lần đầu gặp câu hỏi này trong màn, nghe mẫu từng tranh
      G.cued[k] = 1; say(l, `👂 Nghe ${W[l].name} đọc các tranh nhé…`);
      for (let i = 0; i < T.opts.length; i++) { if (!alive(my)) return; drawOpts(i); await speak(T.opts[i][l].say, l, sid(T.opts[i], l)); await sleep(300); }
      if (!alive(my)) return; drawOpts(preIdx());
    }
    bubble(l, q, 5600); waveWiz(l); say(l, `💬 ${W[l].name} hỏi: <b>${h(q)}</b> · Con chọn một tranh rồi nói nhé!`);
    await speak(q, l, 'qa.' + T.q + '.' + l); if (!alive(my)) return;
    if (G.demo) demoHand();
    listenTurn(my);
  }
  async function listenTurn(my) {
    if (!alive(my) || !G.turn || G.turn.done) return;
    if (!canListen()) return cards();
    if (!canAuto()) { luot(); say(G.act, '🎤 Con chạm micro rồi trả lời nhé! Chưa nghĩ ra thì chạm 💡.'); clearTimeout(idleT); idleT = setTimeout(() => { if (alive(my) && !busy) hint(G.turn.lvl + 1); }, 9000); return; }
    await sleep(350); if (!alive(my)) return; ting(); await sleep(250); if (!alive(my)) return;
    turn(true, my);
  }
  let busy = false, idleT = 0;
  async function turn(auto, my) {
    if (busy || !root || G.end) return;
    if (!G.bonus && (!G.turn || G.turn.done)) return;
    if (my == null) my = ++tok;   // con tự bấm micro: dừng việc đang chờ
    clearTimeout(idleT);
    const l = G.act; busy = true; G.abort = false; $('ptMic').classList.remove('pt-luot');
    const mic = $('ptMic'), wz = root.querySelector('.w-' + l); mic.classList.add('on'); wz && wz.classList.add('pt-tai'); say(l, '🎧 Đang nghe…');
    const r = await listen(l, t => say(l, '🎧 ' + h(t)));
    mic.classList.remove('on'); busy = false; if (!root) return; wz && wz.classList.remove('pt-tai');
    if (G.abort || r.err === 'aborted') { G.abort = false; return; }
    if (my !== tok) return;
    const alts = (r.alts || []).filter(Boolean);
    if (r.err === 'not-allowed' || r.err === 'service-not-allowed') { say(l, 'Con cần cho phép dùng micro (ba mẹ bấm "Cho phép"). Tạm thời con chạm tranh nhé.'); return G.bonus ? bonusResult(l, []) : cards(); }
    if (G.bonus) return bonusResult(l, alts);
    if (!alts.length) { if (auto && r.err && r.err !== 'no-speech') { luot(); say(l, '🎤 Con chạm micro rồi nói nhé!'); return; } return hint(G.turn.lvl + 1); }
    say(l, 'Con nói: <b>' + h(alts[0]) + '</b>');
    answer(l, alts);
  }
  function answer(l, alts) {
    const T = G.turn; if (!T || T.done) return;
    let f = find(l, alts, T.opts), o = {};
    if (!f.sp && l === 'zh') f = pyFind(alts, T.opts);
    if (!f.sp) { const g = find(l, alts, POOL.list); if (g.sp && !SP_ASK(g.sp)) { f = g; o.creative = true; } }   // câu đã học khác tranh gợi ý: cũng hiện
    if (!f.sp) {   // nói nhầm thứ tiếng (máy tiếng Trung hay chép lại chữ Latinh, máy tiếng Anh hiếm khi ra chữ Hán)
      const ol = otherL(l), ao = alts.filter(a => ol === 'zh' ? /[一-鿿]/.test(a) : /[a-z]{3}/i.test(a));
      if (ao.length) { const g = find(ol, ao, T.opts); if (g.sp) { f = { sp: g.sp, full: false, combo: null }; o.langx = true; } }
    }
    if (!f.sp) { T.miss++; return T.miss >= 2 ? cards() : hint(T.lvl + 1); }
    accept(l, f, alts, o);
  }
  const SP_ASK = sp => !!sp.reply;   // phép tự là câu hỏi (What's your name?…): không làm câu trả lời
  /* tiếng Trung: so theo pinyin bỏ dấu để nhận cả khi máy nghe ra chữ đồng âm (页页 → 爷爷); không chấm thanh điệu */
  const PY = {}; Object.keys(D.py || {}).forEach(k => { for (const ch of D.py[k]) if (!PY[ch]) PY[ch] = k; });
  const pyOf = s => ' ' + String(s).replace(/[\u4e00-\u9fff]/g, ch => ' ' + (PY[ch] || ch) + ' ').toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
  function pyFind(alts, opts) {
    const P2 = alts.map(pyOf);
    for (const sp of opts) { const f = pyOf(sp.zh.say).trim(); if (f && P2.some(a => a.includes(' ' + f + ' '))) return { sp, full: true, combo: null }; }
    for (const sp of opts) { const k = pyOf(sp.kw.zh || '').trim(); if (k && P2.some(a => a.includes(' ' + k + ' '))) return { sp, full: false, combo: null }; }
    return { sp: null };
  }
  async function hint(n) {
    const my = ++tok, l = G.act, T = G.turn; if (!T || T.done || !root) return; stopRec(); clearTimeout(idleT);
    T.lvl = Math.max(T.lvl, Math.min(4, n));
    const pi = preIdx(), ti = pi >= 0 ? pi : 0, tg = T.opts[ti];
    if (T.lvl === 2 && !(tg.cut && tg.cut[l] && AUDIO.has(base(sid(tg, l))))) T.lvl = 3;   // không có chỗ ngắt hơi thì lên luôn bậc 3
    if (T.lvl === 1) {   // bậc 1: tranh nảy lần lượt, phù thuỷ chỉ một tranh, nói từ khoá
      say(l, '💡 Con nhìn tranh nhé…');
      const box = $('ptSpells'); box && box.querySelectorAll('.pt-sp').forEach((b, i) => { b.classList.remove('nay'); void b.offsetWidth; b.style.animationDelay = (i * .35) + 's'; b.classList.add('nay'); });
      await sleep(T.opts.length * 350 + 400); if (!alive(my)) return;
      drawOpts(ti); waveWiz(l); kidHint(tg.kw[l] + ' …', tg, 6000);
      const kid = 'kw.' + tg.id + '.' + l; if (AUDIO.has(base(kid))) await speak(tg.kw[l], l, kid);
    } else if (T.lvl === 2) {   // bậc 2: nửa đầu câu, con nói nốt
      const kw = tg.kw[l] || '', t = tg[l].say, mask = kw && t.includes(kw) ? t.replace(kw, '…') : t + ' …';
      drawOpts(ti); kidHint(mask, tg, 6500); say(l, `👂 Nghe rồi con nói nốt nhé: <b>${h(mask)}</b>`);
      await speakCut(sid(tg, l), tg.cut[l]);
    } else if (T.lvl === 3) {   // bậc 3: cả câu mẫu, con nói theo
      drawOpts(ti); kidHint(tg[l].say, tg, 7000); say(l, `👂 Nghe: <b>${h(tg[l].say)}</b> → 🗣️ Con nói theo nhé!`);
      await speak(tg[l].say, l, sid(tg, l));
    } else return cards();
    if (!alive(my)) return;
    listenTurn(my);
  }
  function cards() {   // bậc 4: máy nghe không ra (hoặc không có micro) → chạm tranh
    const l = G.act, T = G.turn; if (!T || T.done || !root) return; ++tok; stopRec(); clearTimeout(idleT); T.lvl = 4;
    const box = $('ptCards');
    box.innerHTML = `<div class="pt-ct">${canListen() ? 'Máy chưa nghe rõ. ' : ''}Con chạm tranh con chọn nhé!</div>` +
      T.opts.map((sp, i) => `<button type="button" class="pt-card ${l}" data-t="${i}"><span class="pt-cpic">${picHtml(sp.pic)}</span><em>${h(sp[l].say)}</em></button>`).join('');
    box.hidden = false; say(l, '👆 Con chạm tranh con chọn nhé!');
    box.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { box.hidden = true; accept(l, { sp: T.opts[+b.dataset.t], full: false, combo: null }, [], { tap: true }); });
  }
  async function tapOpt(i) {   // chạm một tranh gợi ý: nghe câu mẫu của tranh đó rồi nói theo
    const l = G.act, T = G.turn; if (!T || T.done || T.lvl >= 4 || G.bonus) return;
    const my = ++tok; stopRec(); clearTimeout(idleT); const sp = T.opts[i]; T.lvl = Math.max(T.lvl, 3);
    drawOpts(i); kidHint(sp[l].say, sp, 7000); say(l, `👂 Nghe: <b>${h(sp[l].say)}</b> → 🗣️ Con nói theo nhé!`);
    await speak(sp[l].say, l, sid(sp, l)); if (!alive(my)) return;
    listenTurn(my);
  }
  function parOf(sp, l, alts) {
    if (!sp.par || !alts) return {};
    const N = alts.map(a => norm(a, l)); return sp.par === 'num' ? { n: parNum(l, N) } : { c: parCol(l, N) };
  }
  function note(sp, l, full, tap) {
    const id = sp.id + '|' + l, st = tap ? 0 : full ? 2 : 1, old = G.log[id];
    if (!old) G.log[id] = { id: sp.id, l, st, o: G.n++ }; else if (st > old.st) old.st = st;
  }
  async function accept(l, f, alts, o) {
    o = o || {}; const T = G.turn; if (!T || T.done || !root) return;
    const my = ++tok; T.done = true; stopRec(); clearTimeout(idleT); $('ptCards').hidden = true;
    const sp = f.sp, list = (f.combo && !o.tap) ? f.combo : [sp], tap = !!o.tap, full = !!f.full && !o.langx && !tap;
    const snap = { S: clone(S), ti: G.ti, ch: G.chosen[G.ti], said: G.said };
    const post = []; list.forEach(x => apply(x, l, parOf(x, l, alts), post)); render(); setTimeout(() => post.forEach(fn => fn()), 300); sparkle(l);
    list.forEach(x => { note(x, l, full, tap); if (!tap) { G.done[x.id] = G.done[x.id] || {}; G.done[x.id][l] = true; const s = store(); s.seen[x.id] = (s.seen[x.id] || 0) + 1; } });
    if (l === 'en') G.chosen[G.ti] = sp;
    if (!tap) G.said++;
    G.dots[l] = Math.min(TURNS, G.dots[l] + 1); dots(); persist();
    $('ptSpells').querySelectorAll('.pt-sp').forEach((b, i) => b.classList.toggle('chon', T.opts[i] === sp));
    const self = T.lvl === 0 && !tap, okK = W[l].ok[G.said % W[l].ok.length];
    if (list.length > 1) { G.golds++; goldCard(); burst('✨', 10); fx('🌟', 'rainbow'); }   // nói hai tranh một hơi
    else if (self && full) { burst('✨', 10); burst('⭐', 5); fx('🌟', 'rainbow'); }   // tự nói, đủ câu: pháo sáng lớn
    else fx('✨');
    showUndo(snap);
    if (o.langx) { bubble(l, CM('langx', l) + ' ' + sp[l].say, 4600); kidHint(sp[l].say, sp, 4600); await sayC('langx', l); if (!alive(my)) return; await speak(sp[l].say, l, sid(sp, l)); }
    else if (full) { bubble(l, CM(okK, l) + ' ' + CM('sent', l), 2600); await sayC(okK, l); }
    else { bubble(l, CM(okK, l) + ' ' + sp[l].say, 3800); kidHint(sp[l].say, sp, 3800); await sayC(okK, l); if (!alive(my)) return; await speak(sp[l].say, l, sid(sp, l)); }   // sửa ngầm: nhắc câu chuẩn, con không phải nói lại
    if (!alive(my)) return;
    doubleCheck(sp, l);
    await sleep(1300); if (!alive(my)) return;
    hideUndo(); next();
  }
  function doubleCheck(sp, l) {   // cùng một ý con nói được cả hai thứ tiếng = Phép đôi (thẻ vào album)
    const d = G.done[sp.id]; if (!(d && d.en && d.zh && !d.double)) return;
    d.double = true; G.doubles++; const s = store(); s.cards[sp.id] = (s.cards[sp.id] || 0) + 1;
    setTimeout(() => { if (!root) return; fx('🌈', 'rainbow'); burst('🌈', 3); say(l, '🌈 <b>Phép đôi!</b> Con nói một ý bằng cả hai thứ tiếng.'); }, 600);
  }
  /* "Đổi ý": vài giây sau khi tranh hiện, con chạm ↺ để bỏ câu vừa rồi và trả lời lại */
  function showUndo(snap) {
    const b = $('ptUndo'); if (!b) return; b.hidden = false;
    b.onclick = () => { hideUndo(); ++tok; stopRec(); try { curAudio && curAudio.pause(); speechSynthesis.cancel(); } catch (e) {}
      S = snap.S; render(); G.ti = snap.ti; G.chosen[G.ti] = snap.ch; G.said = snap.said; G.dots[G.act] = Math.max(0, G.dots[G.act] - 1);
      G.turn.done = false; G.turn.lvl = 0; G.turn.miss = 0; say(G.act, '↺ Con đổi ý. Con chọn tranh khác nhé!'); ask(true); };
    clearTimeout(b._t); b._t = setTimeout(hideUndo, 5500);
  }
  function hideUndo() { const b = $('ptUndo'); if (b) b.hidden = true; }
  function next() {
    G.ti++;
    if (G.ti < G.turns.length) return ask();
    G.turn = null; $('ptSpells').hidden = true;
    return G.act === 'en' ? switchAct() : endAll();
  }
  async function switchAct() {   // Leo chào rồi bay đi, Xiaomei bay vào
    const my = ++tok; bubble('en', CM('bye', 'en'), 3200); await sayC('bye', 'en'); if (!alive(my)) return;
    const we = root.querySelector('.w-en'); we.classList.add('pt-bay'); await sleep(1000); if (!alive(my)) return;
    we.classList.remove('pt-bay'); we.classList.add('pt-an'); G.act = ''; dots();
    say('', '🏮 Bây giờ mình nói <b>tiếng Trung</b> với Xiaomei nhé!'); await sayV('qa3'); if (!alive(my)) return;
    startAct('zh');
  }
  async function endAll() {   // hai bạn cùng hiện, chụp bức tranh con tạo bằng lời vào album
    const my = ++tok; G.act = ''; root.classList.add('pt-hai'); showWiz('both'); dots();
    await sleep(700); if (!alive(my)) return;
    const f = $('ptFx'); if (f) { const d = document.createElement('div'); d.className = 'pt-flash'; f.appendChild(d); setTimeout(() => d.remove(), 900); }
    const s = store(); s.album = s.album || []; s.album.push({ d: today(), u: POOL.uid, objs: S.objs.map(x => x.id).slice(0, 8), bg: S.bgImg || bgList()[S.scene % bgList().length], wx: S.wx, t: S.time });
    if (s.album.length > 30) s.album = s.album.slice(-30); persist();
    fx('📸', 'big'); bubble('en', CM('ok3', 'en'), 2600); bubble('zh', CM('ok1', 'zh'), 2600);
    await sayC('ok3', 'en'); if (!alive(my)) return; await sayC('ok1', 'zh'); if (!alive(my)) return;
    await sleep(800); if (!alive(my)) return;
    endRound();
  }

  /* ---------- Phép thưởng cuối: tối đa 3 câu con mới chạm tranh / mới nói một phần, xen hai thứ tiếng ---------- */
  function bonusList() {
    const L = Object.values(G.log).filter(x => x.st < 2 && SP[x.id]).sort((a, b) => a.st - b.st || a.o - b.o);
    const q = { en: L.filter(x => x.l === 'en'), zh: L.filter(x => x.l === 'zh') }, out = [];
    let want = L.length ? L[0].l : 'en';
    while (out.length < 3 && (q.en.length || q.zh.length)) { const from = q[want].length ? want : (want === 'en' ? 'zh' : 'en'); out.push(q[from].shift()); want = from === 'en' ? 'zh' : 'en'; }
    return out;
  }
  function endRound() {
    if (G.end || G.bonusDone) return; G.bonusDone = true;
    const list = canListen() ? bonusList() : [];
    if (!list.length) return finish();
    G.bonus = { list, i: 0, ok: 0 };
    say('', '🎁 <b>Phép thưởng!</b> Leo và Xiaomei rủ con nói thêm vài câu nữa.'); fx('🎁'); bubble('en', CM('bonus', 'en'), 2400); bubble('zh', CM('bonus', 'zh'), 2400);
    setTimeout(bonusStep, 2600);
  }
  async function bonusStep() {
    if (!root || G.end || !G.bonus) return;
    const B = G.bonus;
    if (B.i >= B.list.length) { G.bonusList = B; G.bonus = null; $('ptSpells').hidden = true; return finish(); }
    const it = B.list[B.i], l = it.l, sp = SP[it.id], cur = B.cur = { sp, l }, my = ++tok;
    G.act = l; const mic = $('ptMic'); mic.classList.toggle('zh', l === 'zh'); $('ptMicT').textContent = l === 'zh' ? '说' : 'Nói';
    const box = $('ptSpells'); box.className = 'pt-spells pt-opts ' + l; box.hidden = false;
    box.innerHTML = B.list.map((x, i) => `<span class="pt-sp${i < B.i ? ' xong' : ''}${i === B.i ? ' nghe' : ''}"><span class="pt-pin">${i <= B.i ? picHtml(SP[x.id].pic) : '<span class="pt-pe">🎁</span>'}</span></span>`).join('');
    kidHint(sp[l].say, sp, 7000); bubble(l, CM('again', l), 2400);
    await sayC('again', l); if (!alive(my)) return; await speak(sp[l].say, l, sid(sp, l)); if (!alive(my) || B.cur !== cur) return;
    clearTimeout(B.t); B.t = setTimeout(() => { if (G.bonus && G.bonus.cur === cur && !busy) bonusResult(l, []); }, 16000);
    if (canAuto()) { ting(); await sleep(250); if (alive(my)) turn(true, my); } else luot();
  }
  function bonusResult(l, alts) {
    const B = G.bonus, cur = B && B.cur; if (!cur || l !== cur.l) return;
    B.cur = null; clearTimeout(B.t);
    const N = alts.map(a => norm(a, l)), s = score(cur.sp[l], l, N), full = s.full, key = !full && !!cur.sp[l].key && N.some(n => mk(cur.sp[l].key, l).test(n));
    const post = []; apply(cur.sp, l, parOf(cur.sp, l, alts), post); render(); setTimeout(() => post.forEach(f => f()), 300); sparkle(l);
    if (full) { B.ok++; bubble(l, CM('ok1', l), 2600); sayC('ok1', l); say(l, `🎁 ✨ Giỏi quá! <b>${h(cur.sp[l].say)}</b>`); }
    else { bubble(l, CM('try', l), 3200); sayC('try', l); say(l, key ? '🎁 Tốt lắm! Lần sau con nói cả câu nhé.' : '🎁 Con cố gắng lắm! Mình đi tiếp nhé.'); }
    B.i++; setTimeout(bonusStep, 2800);
  }

  /* ---------- lần đầu chơi: cô Hươu hướng dẫn, bàn tay mẫu ở câu hỏi đầu ---------- */
  function intro() {
    const p = $('ptPanel'), s = store();
    p.innerHTML = `<div class="pt-wbox"><div class="pt-wt">🪄 Phép thuật lời nói</div>
      <div class="pt-howto"><span><img src="${A + W.en.img}.webp" alt=""><em>Leo hỏi</em></span><b>›</b><span><i>🗣️</i><em>Con trả lời</em></span><b>›</b><span><i>🖼️</i><em>Tranh hiện ra</em></span></div>
      <p class="pt-hv">Chưa nghĩ ra? Chạm <b>💡</b> để được gợi ý.</p>
      <div class="pt-wbtn"><button type="button" class="ls-b" id="ptI1">🔊 Nghe cô Hươu</button><button type="button" class="ls-b" id="ptGo">▶ Bắt đầu</button></div></div>`;
    p.hidden = false; let k = 0;
    const play = async () => { const my = ++k; await sayV('qa1'); if (my !== k || p.hidden) return; await sayV('qa2'); };
    play(); $('ptI1').onclick = play;
    $('ptGo').onclick = () => { k++; try { curAudio && curAudio.pause(); if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {} p.hidden = true; s.qaIntro = 1; G.demo = true; persist(); startAct('en'); };
  }
  function demoHand() { G.demo = false; const f = $('ptFx'); if (!f) return; const d = document.createElement('div'); d.className = 'pt-tay'; d.textContent = '👆'; f.appendChild(d); setTimeout(() => d.remove(), 4200); }

  /* ---------- xong lượt ---------- */
  function finish() {
    if (!root || G.end) return; G.end = true; ++tok; clearTimeout(idleT); $('ptMic').disabled = true; $('ptSpells').hidden = true; hideUndo();
    const s = store(); let star = '';
    if (s.d !== today() && typeof addStars === 'function') { s.d = today(); addStars(STAR_ROUND); star = `<p class="pt-star">+${STAR_ROUND} ⭐ vào ví của con</p>`; }
    persist();
    const cards = Object.keys(s.cards).length, pics = (s.album || []).length;
    const p = $('ptPanel'); p.innerHTML = `<div class="pt-wbox pt-end"><div class="pt-big">🎉🪄📸</div><h3>Con là phù thuỷ lời nói!</h3>
      <p>Con đã trả lời <b>${G.said}</b> câu của Leo và Xiaomei${G.doubles ? ` · Phép đôi: <b>${G.doubles}</b> 🌈` : ''}${G.golds ? ` · Phép vàng: <b>${G.golds}</b> 🌟` : ''}</p>
      <p>Album: <b>${pics}</b> bức tranh con tạo bằng lời${cards ? ` · <b>${cards}</b> thẻ phép đôi` : ''}</p>${G.bonusList ? `<p>🎁 Phép thưởng: <b>${G.bonusList.ok}/${G.bonusList.list.length}</b></p>` : ''}${star}
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
  window.PT_GAME = { pyOf, open, close, answer: (l, t) => answer(l, [].concat(t)), hint: n => hint(n), cards: () => cards(), state: () => ({ S, G, POOL }), plan, poolFor, find: (l, t, pool) => { const r = find(l, [].concat(t), pool || POOL.list); return r; }, unitOf, learnedBefore, norm, score, SP, D };
})();
