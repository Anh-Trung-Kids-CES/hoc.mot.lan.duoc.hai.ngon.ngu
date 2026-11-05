/* =====================================================================
   SEEDLING · web tự học (bản demo Unit 1) – theo khung Seedling 48 buổi v4, lớp offline.
   Giao diện, hình, giọng và cách chơi mượn từ web "Thử thách 21 ngày" (Little Seed, Canopy).
   Dạng bài: Thẻ nền Little Seed · Thẻ từ mới · Nghe truyện · Chạm đúng tranh · Nói theo ·
   Phiên dịch nhí · Trả lời câu hỏi · Lời lớp học · Mẹo âm · Gọi lại (Hộp ôn).
   Làm sai vẫn đi tiếp, câu sai gặp lại ở cuối bài. Chữ Hán hiện trước, pinyin hiện sau một nhịp.
   ===================================================================== */
const SD = window.SD, app = document.getElementById('app');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
function sget(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
function sset(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
let tt; function toast(m) { const t = document.getElementById('toast'); t.textContent = m; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2800); }
function confetti(n) {
  if (REDUCED) return; const c = document.createElement('div'); c.className = 'confetti'; const em = ['⭐','🎉','🌟','🌱','🎈','✨'];
  for (let i = 0; i < (n || 30); i++) { const s = document.createElement('span'); s.textContent = em[i % em.length]; s.style.left = Math.random() * 100 + '%'; s.style.animationDelay = (Math.random() * .7) + 's'; s.style.fontSize = (20 + Math.random() * 18) + 'px'; c.appendChild(s); }
  document.body.appendChild(c); setTimeout(() => c.remove(), 2800);
}
/* ---------- tiếng hiệu ứng ---------- */
let actx = null, MUTE = sget('sdl-sfx-off', false);
function tone(seq) { if (MUTE) return; try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); let t = actx.currentTime;
  seq.forEach(([f, d, type]) => { const o = actx.createOscillator(), g = actx.createGain(); o.type = type || 'triangle'; o.frequency.value = f; o.connect(g); g.connect(actx.destination);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.25, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.start(t); o.stop(t + d + .02); t += d * .8; }); } catch (e) {} }
const sfx = { ok: () => tone([[784, .12], [1175, .22]]), no: () => tone([[330, .18, 'sine'], [262, .25, 'sine']]), pop: () => tone([[660, .07, 'sine']]),
  win: () => tone([[523, .12], [659, .12], [784, .12], [1047, .35]]), coin: () => tone([[988, .08, 'square'], [1319, .18, 'square']]) };

/* ---------- giọng đọc: file thu sẵn, thiếu thì giọng máy (EN, ZH). Tiếng Việt chỉ phát file của cô Hươu, không có thì hiện chữ. ---------- */
const VOICE = new Audio(); VOICE.preload = 'auto'; try { VOICE.setAttribute('playsinline', ''); } catch (e) {}
let voices = []; function loadVoices() { try { voices = speechSynthesis.getVoices(); } catch (e) {} } loadVoices(); try { speechSynthesis.onvoiceschanged = loadVoices; } catch (e) {}
let RUN = 0;   // mỗi lần dừng / chuyển màn tăng RUN để huỷ chuỗi đang đọc
function stopAll() { RUN++; try { speechSynthesis.cancel(); } catch (e) {} try { VOICE.onended = null; VOICE.onerror = null; VOICE.pause(); } catch (e) {} recAbort(); }
function hush() { try { speechSynthesis.cancel(); } catch (e) {} try { VOICE.onended = null; VOICE.onerror = null; VOICE.pause(); } catch (e) {} }
function tts(text, lang) {
  return new Promise(res => { let done = false; const fin = () => { if (!done) { done = true; res(); } };
    try { if (!('speechSynthesis' in window)) return setTimeout(fin, 700);
      const t = String(text || '').replace(/[·…_]+/g, ' ').replace(/\s+/g, ' ').trim(); if (!t) return fin();
      const L = { en: 'en-US', zh: 'zh-CN' }[lang] || 'en-US'; const u = new SpeechSynthesisUtterance(t); u.lang = L; u.rate = .82;
      const v = voices.find(v => v.lang.replace('_', '-').toLowerCase() === L.toLowerCase()) || voices.find(v => v.lang.toLowerCase().startsWith(L.slice(0, 2))); if (v) u.voice = v;
      u.onend = fin; u.onerror = fin; speechSynthesis.cancel(); speechSynthesis.speak(u); setTimeout(fin, 1800 + t.length * 180); } catch (e) { setTimeout(fin, 600); } });
}
let PEND = null;   // lời đang phát dở: lời mới bắt đầu thì lời cũ coi như xong, không để chuỗi nào bị treo
function playFile(src) { if (PEND) { const r = PEND; PEND = null; r('cut'); }
  return new Promise(res => { let done = false; const fin = v => { if (done) return; done = true; if (PEND === fin) PEND = null; res(v); }; PEND = fin;
    try { VOICE.onended = () => fin(true); VOICE.onerror = () => fin(false); VOICE.src = src; const p = VOICE.play(); if (p && p.catch) p.catch(() => fin(false)); } catch (e) { fin(false); } }); }
/* u = {t, l, a}: phát một lời */
async function say(u) {
  if (!u || !u.t) return; const my = RUN;
  if (!u.a) { const a = u.l === 'vi' ? ((window.SD && SD.vi_tx) || {})[String(u.t).trim()] : auOf(u.l, u.t); if (a) u = Object.assign({}, u, { a }); }
  if (u.l === 'vi') { cap(u.t); if (u.a) await playFile(u.a); else await wait(Math.min(2200, 400 + u.t.length * 25)); return; }
  if (u.a) { const ok = await playFile(u.a); if (ok || ok === 'cut' || my !== RUN) return; }
  if (my === RUN) await tts(u.t, u.l);
}
async function seq(list, gap) { const my = RUN; for (const u of list) { if (my !== RUN) return; await say(u); await wait(gap || 350); } }
function vi(key) { return { t: SD.vi[key] || key, l: 'vi', a: (SD.vi_a || {})[key] || '' }; }
function hd(key) { return say(vi(key)); }
function wait(ms) { return new Promise(r => setTimeout(r, REDUCED ? Math.min(ms, 300) : ms)); }
function auOf(l, t) { const m = (window.SD && SD.aumap) || {}; const k = String(t || '').trim(); return m[l + ':' + k] || m[l + ':' + k.replace(/[!.?！。？]+$/, '')] || ''; }
function en(t, a) { return { t, l: 'en', a: a || auOf('en', t) }; }
function zh(t, a) { return { t, l: 'zh', a: a || auOf('zh', t) }; }

/* ---------- thu giọng con (như web 21 ngày): tự bật, tự dừng khi con nói xong, phát lại ---------- */
let recStream = null, recCur = null;
async function recMic() { if (recStream && recStream.getTracks().some(t => t.readyState === 'live')) return recStream;
  try { recStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); } catch (e) { recStream = null; } return recStream; }
function recAbort() { if (recCur) { const c = recCur; recCur = null; c.abort(); } }
function recTake(o) { o = o || {};
  return new Promise(async res => { const stream = await recMic(); if (!stream || !window.MediaRecorder) return res(null);
    let rec; try { rec = new MediaRecorder(stream); } catch (e) { return res(null); }
    const chunks = []; let done = false, spoke = false, quiet = 0, raf = 0, an = null, src = null;
    try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); an = actx.createAnalyser(); an.fftSize = 512; src = actx.createMediaStreamSource(stream); src.connect(an); } catch (e) { an = null; }
    const buf = an ? new Uint8Array(an.fftSize) : null, t0 = Date.now();
    const stop = abort => { if (done) return; done = true; cancelAnimationFrame(raf); clearTimeout(hard); try { src && src.disconnect(); } catch (e) {}
      if (abort) rec.onstop = () => res(null); try { rec.state !== 'inactive' ? rec.stop() : rec.onstop && rec.onstop(); } catch (e) { res(null); } if (recCur === ctl) recCur = null; };
    const ctl = { abort: () => stop(true) }; recCur = ctl;
    rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
    rec.onstop = () => { const blob = chunks.length ? new Blob(chunks, { type: rec.mimeType || 'audio/webm' }) : null; res(blob ? { url: URL.createObjectURL(blob), spoke } : null); };
    const hard = setTimeout(() => stop(false), o.maxMs || 5000);
    const tick = () => { if (done) return; if (an) { an.getByteTimeDomainData(buf); let m = 0; for (const v of buf) m = Math.max(m, Math.abs(v - 128)); const lv = Math.min(1, m / 60); o.onLevel && o.onLevel(lv);
        const now = Date.now(); if (lv > .18) { spoke = true; quiet = 0; } else if (spoke) { quiet = quiet || now; if (now - quiet > 1100 && now - t0 > 1200) return stop(false); } } raf = requestAnimationFrame(tick); };
    try { rec.start(); } catch (e) { return res(null); } tick(); });
}
const SVG = {
  spk: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6"/><path d="M18.5 6.5a8 8 0 0 1 0 11"/></svg>',
  redo: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>',
  mic: '<svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>',
  star: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z" fill="#FFC93C" stroke="#E0A400" stroke-width="1.2" stroke-linejoin="round"/></svg>',
  stop: '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><rect x="6" y="4.5" width="4" height="15" rx="1.4"/><rect x="14" y="4.5" width="4" height="15" rx="1.4"/></svg>'
};
/* lượt nói của con: micro tự bật; không có micro thì đếm 3-2-1 */
async function micTurn(mic, my) {
  const lbl = mic.querySelector('b'), lv = mic.querySelector('.ls-lv');
  for (let tryN = 0; tryN < 2; tryN++) {
    mic.className = 'ls-mic rec'; cap('🔴 Đang thu… con nói đi!'); if (lbl) lbl.textContent = '';
    const r = await recTake({ maxMs: 5000, onLevel: v => { if (lv) lv.style.setProperty('--lv', (.25 + v * .9).toFixed(2)); } });
    if (my !== RUN) return 'gone';
    if (!r) { mic.className = 'ls-mic on'; cap('Con nói theo nhé!'); for (let s = 3; s >= 1; s--) { if (my !== RUN) return 'gone'; if (lbl) lbl.textContent = s; await wait(1000); } return 'count'; }
    if (!r.spoke) { mic.className = 'ls-mic on'; if (lbl) lbl.textContent = ''; cap('Cô chưa nghe thấy con nói'); if (tryN === 0) { await hd('quiet'); if (my !== RUN) return 'gone'; continue; } return 'quiet'; }
    mic.className = 'ls-mic ok'; if (lbl) lbl.textContent = '✓'; sfx.ok(); cap('🎧 Con nghe lại giọng của con nhé'); await wait(250);
    if (my !== RUN) return 'gone'; jRec(); await playFile(r.url); return 'rec';
  }
  return 'quiet';
}
/* lời sau lượt nói: chỉ khen khi thật sự nghe thấy con nói */
function afterSpeak(how) { return hd(how === 'rec' ? 'speak' : how === 'quiet' ? 'quiet2' : 'next'); }

/* ---------- tiến độ (lưu trên máy này) ---------- */
let P = sget('sdl-progress', { days: {}, stars: 0, hop: {} });
function save() { sset('sdl-progress', P); updStars(); }
function dayState(n) { return P.days[n] = P.days[n] || { steps: {}, done: false }; }
function updStars() { const el = document.getElementById('starCount'); if (el) el.textContent = '⭐ ' + (typeof qEarned === 'function' ? qEarned() : (P.stars || 0)); }
function hopAdd(u) { if (!u || !u.t) return; const k = u.l + ':' + u.t; const h = P.hop[k] = P.hop[k] || { t: u.t, l: u.l, a: u.a || '', py: u.py || '', n: 0 }; h.n++; save(); }

/* ---------- chữ có "ngữ cảnh nền": từ chưa dạy, chạm để nghe, có pinyin và nghĩa ---------- */
function rich(text, lang, bgKeys) {
  let h = esc(text); const keys = (bgKeys || []).filter(k => SD.bg[k] && SD.bg[k].l === lang).sort((a, b) => b.length - a.length);
  keys.forEach(k => { const re = lang === 'zh' ? new RegExp(esc(k).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g') : new RegExp('\\b(' + esc(k).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')\\b', 'gi');
    h = h.replace(re, m => `<span class="sx-bg" data-k="${esc(k)}" role="button" tabindex="0">${m}</span>`); });
  return h;
}
function wireBg(root) {
  root.querySelectorAll('.sx-bg').forEach(b => b.onclick = e => { e.stopPropagation(); const k = b.dataset.k, B = SD.bg[k]; if (!B) return;
    document.querySelectorAll('.sx-pop').forEach(x => x.remove());
    const pop = document.createElement('div'); pop.className = 'sx-pop';
    pop.innerHTML = B.l === 'zh' ? `<b class="zh">${esc(k)}</b><span class="sx-py">${esc(B.py)}</span><span class="sx-en">= ${esc(B.en)}</span><small>Ngữ cảnh nền · con chỉ cần nghe</small>`
      : `${B.img ? `<img src="${esc(B.img)}" alt="">` : `<span class="sx-e">${B.e || '•'}</span>`}<b>${esc(k)}</b><small>Ngữ cảnh nền · con chỉ cần nghe</small>`;
    document.body.appendChild(pop); const r = b.getBoundingClientRect(); pop.style.left = Math.max(8, Math.min(innerWidth - 230, r.left + r.width / 2 - 110)) + 'px'; pop.style.top = (r.bottom + window.scrollY + 8) + 'px';
    pop.onclick = () => pop.remove(); setTimeout(() => pop.remove(), 4500);
    stopAll(); (async () => { if (B.l === 'zh') { await say(zh(k, B.a)); await wait(250); await say(en(B.en, B.a_en)); } else await say(en(k, B.a)); })(); });
}
/* chữ Hán hiện trước, pinyin hiện sau một nhịp */
function zhHTML(t, py, bg) { return `<span class="zh">${rich(t, 'zh', bg)}</span>${py ? `<span class="sx-pyl" data-later>${esc(py)}</span>` : ''}`; }
function revealPy(root, ms) { setTimeout(() => root.querySelectorAll('[data-later]').forEach(x => x.classList.add('on')), ms || 900); }
function face(w) { const W = SD.who[w]; return W ? `<img class="ls-face" src="${esc(W[1])}" alt="${esc(W[0])}">` : ''; }
function bub(t, l, w, py, bg) { const W = SD.who[w] && SD.who[w][0] ? ` · ${SD.who[w][0]}` : '';
  return `<span class="ls-bub ${l}"><i>${l === 'zh' ? '中文' : 'EN'}${esc(W)}</i><b class="${l === 'zh' ? 'zh' : ''}">${l === 'zh' ? rich(t, 'zh', bg) : rich(t, 'en', bg)}</b>${l === 'zh' && py ? `<span class="sx-pyl" data-later>${esc(py)}</span>` : ''}</span>`; }
function pic(src, e, cls) { return src ? `<img class="ls-pic ${cls || ''}" src="${esc(src)}" alt="" loading="lazy" draggable="false">` : `<span class="ls-pic ${cls || ''} sx-emo">${e || '🖼️'}</span>`; }

/* ---------- các dạng bài ---------- */
const T = {
  nen: { n: 'Thẻ nền Little Seed', ic: 'ls_o_nhin_chu', sub: 'Từ Little Seed dạy lại', rules: ['Con chạm vào từng thẻ: nghe tiếng Anh rồi tiếng Trung.', 'Chữ Hán hiện trước, pinyin hiện sau một chút.', 'Con nói theo, chạm hết các thẻ là xong.'] },
  the: { n: 'Thẻ từ mới', ic: 'cx_o_cards', sub: 'Xem trước từ mới', rules: ['Con nhìn tranh và nghe tiếng Anh.', 'Chạm vào thẻ để lật, nghe tiếng Trung.', 'Bấm "Thẻ tiếp" để xem thẻ sau.'] },
  truyen: { n: 'Nghe truyện', ic: 'cx_o_story', sub: 'Truyện kể dần', rules: ['Con nghe truyện 2 lần: một lần bằng tiếng Anh, một lần bằng tiếng Trung.', 'Truyện tự sang trang. Chữ gạch chân là từ con chưa học: con chạm để nghe.'] },
  cham: { n: 'Chạm đúng tranh', ic: 'ls_o_cham_hinh', sub: 'Ai nói câu này?', rules: ['Con nghe một câu.', 'Con chạm vào bạn đã nói câu đó.', 'Chưa đúng cũng không sao: mình làm câu khác, lát nữa gặp lại.'] },
  noi: { n: 'Nói theo', ic: 'ls_o_noi_theo', sub: 'Nói câu của nhân vật', rules: ['Con nghe bạn trong tranh nói trước.', 'Khi micro đỏ nhấp nháy là máy đang thu giọng con. Con nói to nhé!', 'Máy phát lại giọng con rồi tự sang câu tiếp.'] },
  pdn: { n: 'Phiên dịch nhí', ic: 'ls_o_do_con', sub: 'Leo nói tiếng Anh · Xiaomei nghe tiếng Trung', rules: ['Bạn Leo nói tiếng Anh. Bạn Xiaomei chỉ hiểu tiếng Trung.', 'Con nghe Leo nói, rồi con nói lại bằng tiếng Trung cho Xiaomei.', 'Xiaomei hiểu rồi là con được một ngôi sao.'] },
  hoi: { n: 'Trả lời câu hỏi', ic: 'cx_o_quiz', sub: 'Câu hỏi về cả truyện · YCT 听后回答', rules: ['Con nghe câu hỏi về truyện.', 'Con chạm vào câu trả lời đúng, rồi nói câu trả lời.'] },
  loi: { n: 'Lời lớp học', ic: 'ls_o_xem', sub: 'Câu cô nói mỗi buổi', rules: ['Đây là những câu cô Lan nói trên lớp.', 'Con chạm vào từng thẻ để nghe tiếng Anh và tiếng Trung.'] },
  meo: { n: 'Mẹo âm', ic: 'ls_o_anh_trung', sub: 'Thanh điệu và âm', rules: ['Con nghe và bắt chước âm 3 lần.', 'Rồi con nghe và chạm đúng kí hiệu.'] },
  goi: { n: 'Gọi lại', ic: 'cx_o_speak', sub: 'Hộp ôn', rules: ['Con nhìn tranh và tự nói từ đó.', 'Rồi con nghe đáp án và nói lại.'] }
};
const ICON = k => `tai-nguyen/trang/${k}.webp`;
let X = null;   // bước đang chơi
function cap(t) { const el = document.getElementById('lsCap'); if (el) el.textContent = t || ''; }
function dots(i, n) { const el = document.getElementById('lsDots'); if (el) el.innerHTML = Array.from({ length: n }, (_, k) => `<span class="${k < i ? 'ok' : k === i ? 'now' : ''}"></span>`).join(''); }
function star(n) { X.stars += n || 1; const el = document.getElementById('lsStars'); if (el) el.textContent = X.stars; }
function shake(el) { if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
function pop(el) { if (!el) return; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
function alive(my) { return my === RUN && document.getElementById('lsBox'); }

function frame(box, step) {
  const M = T[step.type];
  box.innerHTML = `<div class="ls-stage">
    <div class="ls-top"><div><b>${esc(M.n)}</b><small>${esc(M.sub)}</small></div><div class="ls-dots" id="lsDots"></div><div class="ls-stars">${SVG.star}<span id="lsStars">0</span></div></div>
    <div class="ls-body" id="lsBody"></div>
    <div class="ls-bot"><div class="ls-ctl"><button class="ls-b dark" id="lsReplay">${SVG.spk}<span>Nghe lại</span></button><button class="ls-b" id="lsStop">${SVG.stop}<span>Dừng</span></button></div>
      <div class="ls-cap" id="lsCap"></div><button class="ls-b" id="lsRedo">${SVG.redo}<span>Làm lại</span></button></div></div>`;
  box.querySelector('#lsReplay').onclick = () => { sfx.pop(); X.replay && X.replay(); };
  box.querySelector('#lsStop').onclick = () => { sfx.pop(); stopAll(); cap('Đã dừng. Con chạm Nghe lại hoặc Làm lại nhé.'); };
  box.querySelector('#lsRedo').onclick = () => { sfx.pop(); startStep(true); };
  return box.querySelector('#lsBody');
}
function rulesCard(body, step, run) {
  const M = T[step.type]; let started = false; const my = RUN;
  body.innerHTML = `<div class="ls-rule"><img src="${ICON(M.ic)}" alt=""><div class="ls-rtx"><span class="ls-lab">Luật chơi</span><h3>${esc(M.n)}</h3>
    <ol>${M.rules.map(l => `<li>${esc(l)}</li>`).join('')}</ol><div class="row ls-rrow"><button class="btn g" id="go">▶ Bắt đầu</button></div></div></div>`;
  const start = () => { if (started) return; started = true; stopAll(); run(); };
  body.querySelector('#go').onclick = () => { sfx.pop(); start(); };
  X.replay = () => seq(M.rules.map(t => ({ t, l: 'vi' })), 250);
  (async () => { await seq(M.rules.map(t => ({ t, l: 'vi', a: '' })), 200); if (my === RUN && !started) { await wait(500); } })();
}
function startStep(skipRules) {
  stopAll(); X.stars = 0; X.replay = null;
  const body = frame(document.getElementById('lsBox'), X.step);
  const run = () => R[X.step.type](X.step, body, X.day);
  if (skipRules) return run(); rulesCard(body, X.step, run);
}
function finish() {
  const { n, k, day } = X, s = dayState(n), stars = Math.max(1, X.stars);
  const fresh = !(k in s.steps); s.steps[k] = Math.max(s.steps[k] || 0, stars); if (fresh) P.stars = (P.stars || 0) + stars; save();
  const body = document.getElementById('lsBody'), nx = k + 1 < day.steps.length;
  if (day.steps.every((_, j) => j in s.steps) && !s.done) { s.done = true; save(); return dayDone(n); }
  body.innerHTML = `<div class="ls-done"><div class="ls-bigstar">${SVG.star}</div><b>Con đã làm xong bước này!</b><span>Con được ${stars} sao.</span>
    ${nx ? `<div class="ls-next"><img src="${ICON(T[day.steps[k + 1].type].ic)}" alt=""><div><small>Bước tiếp theo</small><b>Bước ${k + 2}: ${esc(T[day.steps[k + 1].type].n)}</b><span>${esc(T[day.steps[k + 1].type].rules[0])}</span></div></div>` : ''}
    <div class="row">${nx ? `<a class="btn g" href="#/ngay/${n}/b${k + 2}">Bước ${k + 2}: ${esc(T[day.steps[k + 1].type].n)} →</a>` : `<a class="btn g" href="#/ngay/${n}">⭐ Xong các bước!</a>`}<button class="btn y" id="again">Chơi lại</button></div></div>`;
  body.querySelector('#again').onclick = () => startStep(true); X.replay = null; cap(''); sfx.win(); confetti(16); hd('stepdone');
}
function dayDone(n) {
  stopAll(); const ov = document.createElement('div'), day = SD.days[n]; ov.className = 'ls-cele';
  const total = Object.values(dayState(n).steps).reduce((a, b) => a + b, 0), ex = rewardDay(n);
  ov.innerHTML = `<div class="ls-cele-box sx-cele" role="dialog"><img class="ls-cele-img" src="tai-nguyen/trang/ls_man_khen.webp" alt=""><div class="ls-cele-stars">${SVG.star}${SVG.star}${SVG.star}</div>
    <h3>Con học xong ngày ${n} rồi!</h3><p>Con được <b>${total} sao</b> trong bài và <b>+${PTS.dayDone} sao</b> học xong ngày.</p>${ex.html}
    <div class="row"><a class="ls-cele-go" href="#/ban-do"><span aria-hidden="true">🗺️</span><b>Về bản đồ</b></a><a class="btn y" href="#/qua">🎁 Phòng đổi quà</a></div></div>`;
  document.body.appendChild(ov); ov.querySelectorAll('a').forEach(a => a.addEventListener('click', () => ov.remove())); confetti(44); sfx.win();
  (async () => { await hd('daydone'); for (const l of ex.lines) { await wait(300); hdSay(l); await wait(2200); } await wait(300); await hd('bye'); })();
}

const R = {};
/* 1. THẺ NỀN LITTLE SEED – thẻ tranh: chạm để nghe EN rồi ZH, nói theo */
R.nen = (step, body, day) => {
  const C = step.cards, seen = new Set(); const my = RUN;
  const draw = () => { dots(seen.size, C.length);
    body.innerHTML = `<div class="sx-nen"><span class="ls-lab">Nền Little Seed · chạm vào từng thẻ để nghe rồi nói theo</span><div class="sx-grid">${C.map((c, i) => `
      <button class="sx-card ${seen.has(i) ? 'got' : ''}" data-i="${i}">${pic(c.img, c.e, '')}<span class="sx-en">${esc(c.en)}</span>${c.zh ? `<span class="sx-zh ${seen.has(i) ? 'on' : ''}"><b class="zh">${esc(c.zh)}</b><small>${esc(c.py)}</small></span>` : ''}</button>`).join('')}</div>
      <div class="sx-microw"><div class="ls-mic idle" id="mic"><span class="ls-lv"></span>${SVG.mic}<b></b></div><span class="ls-lab" id="mt">Chạm một thẻ nhé</span></div></div>`;
    body.querySelectorAll('.sx-card').forEach(b => b.onclick = () => open(+b.dataset.i)); };
  async function open(i) {
    stopAll(); const me = RUN, c = C[i]; sfx.pop(); seen.add(i); draw(); const b = body.querySelector(`.sx-card[data-i="${i}"]`); pop(b);
    const z = b.querySelector('.sx-zh'); if (z) z.classList.remove('on');
    cap('EN: ' + c.en); await say(en(c.en, c.a_en)); if (me !== RUN) return;
    if (c.zh) { if (z) z.classList.add('on'); await wait(300); cap('中文: ' + c.zh); await say(zh(c.zh, c.a_zh)); if (me !== RUN) return; z && z.querySelector('small').classList.add('on'); }
    body.querySelector('#mt').textContent = 'Con nói theo nhé!'; await hd('repeat'); if (me !== RUN) return;
    const how = await micTurn(body.querySelector('#mic'), me); if (how === 'gone') return; if (how === 'rec') star(); else await afterSpeak(how);
    if (seen.size >= C.length) { await wait(500); if (me === RUN) finish(); }
  }
  X.replay = () => hd('nen'); draw(); hd('nen');
};
/* 2. THẺ TỪ MỚI – lật thẻ: mặt trước tranh + EN, mặt sau chữ Hán (pinyin hiện sau) */
R.the = (step, body) => {
  const C = step.cards; let i = 0;
  (function show() { dots(i, C.length); const c = C[i]; let side = 0;
    body.innerHTML = `<div class="sx-the"><button class="sx-fcard" id="fl" type="button">
        <span class="sx-fpic">${c.img ? `<img src="${esc(c.img)}" alt="">` : `<span class="sx-e">${c.e || '🖼️'}</span>`}</span>
        <span class="sx-fen">${esc(c.en)}</span><span class="sx-fzh" hidden><b class="zh">${esc(c.zh)}</b><span class="sx-pyl" data-later>${esc(c.py)}</span></span>
        ${c.note ? `<span class="sx-mini" hidden><span class="en">${esc(c.note[0])}</span> ↔ <span class="zh">${esc(c.note[1])}</span></span>` : ''}
        <span class="sx-turn">${c.zh ? 'Chạm để lật thẻ ↻' : 'Chạm để nghe lại 🔊'}</span></button>
      <div class="row sx-trow"><button class="ls-b" id="pv" ${i ? '' : 'disabled'}>← Trước</button><span class="ls-lab">Thẻ ${i + 1}/${C.length}</span><button class="btn g" id="nx">${i < C.length - 1 ? 'Thẻ tiếp →' : 'Xong ✓'}</button></div></div>`;
    const fl = body.querySelector('#fl'), pe = () => say(en(c.en, c.a_en)), pz = () => { revealPy(body, 900); return say(zh(c.zh, c.a_zh)); };
    const flip = () => { if (!c.zh) { stopAll(); pe(); return; } stopAll(); side = 1 - side; sfx.pop(); fl.classList.toggle('back', !!side);
      fl.querySelector('.sx-fzh').hidden = !side; const m = fl.querySelector('.sx-mini'); if (m) m.hidden = !side; side ? pz() : pe(); };
    fl.onclick = flip;
    body.querySelector('#pv').onclick = () => { if (i) { stopAll(); i--; show(); } };
    body.querySelector('#nx').onclick = () => { stopAll(); star(); if (i < C.length - 1) { i++; show(); } else finish(); };
    X.replay = () => { stopAll(); side ? pz() : pe(); };
    (async () => { const my = RUN; await wait(300); await pe(); if (my !== RUN || side) return; await wait(700); if (my === RUN && !side && c.zh) flip(); })(); })();
};
/* 3. NGHE TRUYỆN – lần 1 tiếng Anh, lần 2 tiếng Trung; từ chưa học là ngữ cảnh nền (chạm để nghe) */
R.truyen = (step, body, day) => {
  let Sc = step.scenes || step.scenes_en; let pass = 0, c = 0, playing = true;
  const setPass = p => { pass = p; Sc = step.scenes || (p ? step.scenes_zh : step.scenes_en); };
  const draw = () => { const s = Sc[c], l = pass ? 'zh' : 'en'; dots(c, Sc.length);
    body.innerHTML = `<div class="ls-xem ${l}"><div class="ls-xh"><span class="ls-tag ${l}">Nghe bằng ${l === 'zh' ? 'tiếng Trung' : 'tiếng Anh'}</span><span>Lần ${pass + 1} · “${esc(l === 'zh' ? step.title_zh : step.title)}” · ${c + 1}/${Sc.length}</span></div>
      <div class="ls-story sx-st">${pic(s.img, '', 'ls-scene')}<div class="ls-sline">${s.who !== 'narr' ? face(s.who) : ''}${bub(l === 'zh' ? s.zh : s.en, l, s.who, s.py, day.bg)}</div></div>
      <div class="row ls-snav"><button class="ls-b" id="sPrev" ${c === 0 ? 'disabled' : ''}>◀</button><button class="ls-b dark" id="sPlay">${playing ? '⏸ Dừng' : '▶ Nghe tiếp'}</button><button class="ls-b" id="sNext">${c === Sc.length - 1 ? 'Xong ✓' : '▶▶'}</button></div></div>`;
    wireBg(body); revealPy(body, 1000);
    body.querySelector('#sPrev').onclick = () => { if (c > 0) { stopAll(); c--; playing = false; draw(); line(); } };
    body.querySelector('#sNext').onclick = () => { stopAll(); if (c < Sc.length - 1) { c++; playing = false; draw(); line(); } else end(); };
    body.querySelector('#sPlay').onclick = () => { playing = !playing; if (playing) auto(); else stopAll(); draw(); }; };
  const line = () => { const s = Sc[c]; return say(pass ? zh(s.zh, s.a_zh) : en(s.en, s.a_en)); };
  const end = () => { stopAll(); body.innerHTML = `<div class="ls-done"><b>Hết truyện!</b><span>${pass === 0 ? 'Mình nghe lại bằng tiếng Trung nhé.' : 'Con nghe đủ 2 lần rồi!'}</span><div class="row"><button class="btn g" id="nx">${pass === 0 ? 'Nghe bằng tiếng Trung →' : 'Xong ⭐'}</button></div></div>`;
    body.querySelector('#nx').onclick = () => { sfx.ok(); star(); if (pass === 0) { setPass(1); c = 0; playing = true; draw(); auto(); } else finish(); }; };
  async function auto() { const me = ++RUN; if (c === 0 && pass === 0) { await hd('listen'); if (me !== RUN) return; }
    while (me === RUN && c < Sc.length) { draw(); cap((pass ? '中文: ' + Sc[c].zh : 'EN: ' + Sc[c].en)); await line(); if (me !== RUN) return; await wait(900); if (me !== RUN) return; if (c === Sc.length - 1) return end(); c++; } }
  X.replay = () => { stopAll(); line(); }; draw(); auto();
};
/* 4. CHẠM ĐÚNG TRANH – ai nói câu này? Sai vẫn đi tiếp, câu sai gặp lại ở cuối bài */
R.cham = (step, body) => {
  let Q = step.qs.map(q => Object.assign({}, q)); const back = new Set(); let qi = 0, busy = false; const my = RUN;
  const ask = () => { dots(qi, Q.length); if (qi >= Q.length) return finish();
    const q = Q[qi], opts = step.opts;
    body.innerHTML = `<div class="ls-ask"><span class="ls-lab">Câu ${qi + 1}/${Q.length} · nghe ${q.say.l === 'zh' ? 'tiếng Trung' : 'tiếng Anh'}${q.again ? ' · gặp lại' : ''}${q.nlq ? ' · nghe làm quen' : ''}</span>
      <div class="ls-opts sx-faces" style="--n:${opts.length}">${opts.map(w => `<button class="ls-opt" data-w="${w}">${pic(SD.who[w][1], '', '')}<span class="sx-nm">${esc(SD.who[w][0])}</span></button>`).join('')}</div></div>`;
    const play = () => { stopAll(); cap('Con nghe nhé…'); return say(q.say); }; X.replay = play; play();
    body.querySelectorAll('.ls-opt').forEach(b => b.onclick = async () => { if (busy) return; busy = true; stopAll(); const me = RUN;
      if (b.dataset.w === q.ans) { sfx.ok(); b.classList.add('right'); pop(b); if (!q.again) star(); cap((q.say.l === 'zh' ? '中文: ' : 'EN: ') + q.say.t); await hd(q.again ? 'retry' : 'ok'); }
      else { sfx.no(); shake(b); const r = body.querySelector(`.ls-opt[data-w="${q.ans}"]`); r && r.classList.add('hint'); hopAdd(q.say);
        if (!back.has(qi) && !q.again) { back.add(qi); Q.push(Object.assign({}, q, { again: true })); } await hd('later'); }
      await wait(500); busy = false; if (alive(my) || my !== RUN) { qi++; ask(); } }); };
  (async () => { await hd('touch'); ask(); })();
};
/* 5. NÓI THEO */
R.noi = (step, body, day) => {
  const Tn = step.turns; let ti = 0;
  async function turn() { const my = RUN; dots(ti, Tn.length); if (ti >= Tn.length) return finish(); const t = Tn[ti], u = t.say[0];
    body.innerHTML = `<div class="ls-noi"><div class="ls-npic">${pic(t.img, t.e, '')}</div><div class="ls-nside">${step.mode === 'nhac' ? '<span class="ls-lab">听后重复 · con nghe rồi nói lại đúng như vậy</span>' : day.week === 1 ? '<span class="ls-lab">Tuần 1: con nghe rồi nói theo</span>' : ''}${t.move ? `<span class="ls-lab">${esc(t.move)}</span>` : ''}
      <div class="ls-says">${face(u.w)}${bub(u.t, u.l, u.w, '', day.bg)}</div><div class="ls-mic idle" id="mic"><span class="ls-lv"></span>${SVG.mic}<b></b></div>
      <div class="row ls-nrow"><button class="ls-b" id="nx">Bỏ qua ▶</button></div></div></div>`;
    wireBg(body); body.querySelector('#nx').onclick = () => { stopAll(); ti++; turn(); };
    X.replay = () => { stopAll(); say(u); }; cap(u.t); await say(u); if (my !== RUN) return; await hd('turn'); if (my !== RUN) return;
    const how = await micTurn(body.querySelector('#mic'), my); if (how === 'gone' || my !== RUN) return; if (how === 'rec') star();
    await afterSpeak(how); if (my !== RUN) return; await wait(600); if (my === RUN) { ti++; turn(); } }
  (async () => { await hd('noi'); turn(); })();
};
/* 6. PHIÊN DỊCH NHÍ – Leo (EN) → con nói tiếng Trung cho Xiaomei; tuần 1: nghe mẫu tiếng Trung trước rồi nói theo */
R.pdn = (step, body) => {
  const I = step.items; let i = -1;
  const COL = { a: '#2F6FD6', b: '#E3262E', c: '#2FA37A', d: '#9B6BD6' };
  const chunks = arr => arr.map(([t, g]) => g ? `<span class="sx-ch" style="--c:${COL[g]}">${esc(t)}</span>` : esc(t)).join('');
  async function bridge() { const B = step.bridge, my = RUN;
    body.innerHTML = `<div class="sx-bridge"><span class="ls-lab">Cầu nối Anh – Trung · cùng màu là cùng ý</span>
      <div class="sx-brow en">${face('leo')}<span class="sx-bt">${chunks(B.en)}</span></div><div class="sx-brow zh">${face('xiaomei')}<span class="sx-bt zh">${chunks(B.zh)}</span></div>
      <div class="row"><button class="btn g" id="go">Bắt đầu phiên dịch →</button></div></div>`;
    body.querySelector('#go').onclick = () => { stopAll(); next(); };
    const it = I[0]; X.replay = async () => { stopAll(); const me = RUN; await say(en(it.en, it.a_en)); if (me !== RUN) return; await wait(300); if (me !== RUN) return; await say(zh(it.zh, it.a_zh)); }; await X.replay(); }
  async function next() { i++; const my = RUN; dots(i, I.length); if (i >= I.length) return finish(); const it = I[i];
    body.innerHTML = `<div class="sx-pdn2">
      <ol class="sx-steps"><li id="s1">① Nghe Leo nói</li><li id="s2">② Con nói tiếng Trung</li><li id="s3">③ Xiaomei hiểu rồi!</li></ol>
      <div class="sx-pdn"><div class="sx-pp" id="pl"><div class="sx-who">${face('leo')}<b>Leo</b><small>nói tiếng Anh</small></div>${bub(it.en, 'en', 'leo')}</div>
      <div class="sx-arrow">➜</div><div class="sx-pp zhs" id="px"><div class="sx-who">${face('xiaomei')}<b>Xiaomei</b><small>chỉ hiểu tiếng Trung</small></div><div id="ans" class="sx-ans"><div class="sx-q">?</div></div></div>
      <div class="sx-microw"><div class="ls-mic idle" id="mic"><span class="ls-lv"></span>${SVG.mic}<b></b></div><span class="ls-lab" id="hint">Con nghe Leo nói nhé…</span></div>
      <div class="row"><button class="ls-b" id="nx">Bỏ qua ▶</button></div></div></div>`;
    body.querySelector('#nx').onclick = () => { stopAll(); next(); };
    const hint = body.querySelector('#hint'), stepOn = k => body.querySelectorAll('.sx-steps li').forEach((li, j) => { li.classList.toggle('on', j === k - 1); li.classList.toggle('done', j < k - 1); });
    const showAns = cls => { body.querySelector('#ans').innerHTML = `<div class="${cls || ''}">${bub(it.zh, 'zh', 'xiaomei', it.py)}</div>`; revealPy(body, 900); };
    X.replay = () => { stopAll(); say(en(it.en, it.a_en)); };
    stepOn(1); body.querySelector('#pl').classList.add('talk'); await say(en(it.en, it.a_en)); if (my !== RUN) return; body.querySelector('#pl').classList.remove('talk');
    stepOn(2); let how;
    if (step.model_first) {   // tuần đầu: cô nói mẫu, con nói theo cho Xiaomei
      hint.textContent = 'Cô nói mẫu, con nghe nhé'; showAns('sx-hintans'); await say(zh(it.zh, it.a_zh)); if (my !== RUN) return;
      hint.textContent = 'Đến lượt con! Con nói tiếng Trung cho Xiaomei nhé'; await hd('pdn_go'); if (my !== RUN) return;
      how = await micTurn(body.querySelector('#mic'), my); if (how === 'gone' || my !== RUN) return;
    } else {                  // các tuần sau: con thử nói trước, rồi nghe đáp án
      hint.textContent = SD.vi.howzh; await hd('howzh'); if (my !== RUN) return;
      how = await micTurn(body.querySelector('#mic'), my); if (how === 'gone' || my !== RUN) return;
      hint.textContent = SD.vi.ans; await hd('ans'); if (my !== RUN) return; showAns(); await say(zh(it.zh, it.a_zh)); if (my !== RUN) return;
    }
    stepOn(3); body.querySelector('#px').classList.add('happy'); body.querySelector('#ans').querySelector('div').className = '';
    if (how === 'rec') { star(); hint.textContent = 'Xiaomei hiểu rồi! Cảm ơn con!'; await hd('pdn_ok'); } else await afterSpeak(how);
    await wait(500); if (my === RUN) next(); }
  (async () => { await hd('pdn'); step.bridge ? bridge() : next(); })();
};
/* 7. TRẢ LỜI CÂU HỎI – chọn câu trả lời, rồi nói câu trả lời (YCT 听后回答); sai gặp lại cuối bài */
R.hoi = (step, body) => {
  const Q = []; step.rounds.forEach(r => r.qs.forEach(q => Q.push(Object.assign({ l: r.l, yct: r.yct }, q))));
  const back = new Set(); let qi = 0, busy = false;
  const optTx = (o, l) => l === 'zh' ? `<span class="zh">${esc(o[0])}</span><span class="sx-pyl" data-later>${esc(o[1])}</span>` : esc(o);
  async function ask() { const my = RUN; dots(qi, Q.length); if (qi >= Q.length) return finish(); const q = Q[qi];
    const qu = q.l === 'zh' ? zh(q.q, q.a) : en(q.q, q.a);
    body.innerHTML = `<div class="sx-hoi"><span class="ls-lab">${q.yct ? 'YCT口试 听后回答 · ' : ''}Câu ${qi + 1}/${Q.length}${q.again ? ' · gặp lại' : ''}</span>
      <div class="sx-q">${q.img ? pic(q.img, '', 'sx-qimg') : ''}<div>${q.l === 'zh' ? `<b class="zh">${esc(q.q)}</b><span class="sx-pyl" data-later>${esc(q.py || '')}</span>` : `<b>${esc(q.q)}</b>`}</div><button class="ls-b sm" id="pq">${SVG.spk}</button></div>
      <div class="sx-opts">${q.opts.map((o, n) => `<button class="sx-opt" data-n="${n}">${optTx(o, q.l)}</button>`).join('')}</div>
      <div class="sx-microw" hidden id="mr"><div class="ls-mic idle" id="mic"><span class="ls-lv"></span>${SVG.mic}<b></b></div><span class="ls-lab">Con nói câu trả lời nhé!</span></div></div>`;
    revealPy(body, 900); const play = () => { hush(); return say(qu); }; X.replay = play; body.querySelector('#pq').onclick = play; play();
    body.querySelectorAll('.sx-opt').forEach(b => b.onclick = async () => { if (busy) return; busy = true; const n = +b.dataset.n, o = q.opts[n], ou = q.l === 'zh' ? zh(o[0]) : en(o);
      if (n === q.ans) { hush(); sfx.ok(); b.classList.add('right'); pop(b); if (!q.again) star(); await say(ou); if (my !== RUN) return;
        body.querySelector('#mr').hidden = false; const how = await micTurn(body.querySelector('#mic'), my); if (how === 'gone' || my !== RUN) return; await afterSpeak(how); }
      else { sfx.no(); shake(b); body.querySelectorAll('.sx-opt')[q.ans].classList.add('hint'); const a = q.opts[q.ans]; hopAdd(q.l === 'zh' ? zh(a[0]) : en(a));
        if (!back.has(qi) && !q.again) { back.add(qi); Q.push(Object.assign({}, q, { again: true })); } await hd('later'); }
      await wait(400); busy = false; if (my === RUN) { qi++; ask(); } }); }
  (async () => { await hd('hoi'); ask(); })();
};
/* 8. LỜI LỚP HỌC – thẻ nề nếp; từ 我们, 一起, 好朋友 là ngữ cảnh nền */
R.loi = (step, body, day) => {
  const C = step.cards, seen = new Set();
  const draw = () => { dots(seen.size, C.length);
    body.innerHTML = `<div class="sx-nen"><span class="ls-lab">Lời lớp học · chạm thẻ để nghe</span><div class="sx-grid g3">${C.map((c, i) => `
      <button class="sx-card ${seen.has(i) ? 'got' : ''}" data-i="${i}"><span class="sx-e big">${c.e}</span><span class="sx-en">${esc(c.en)}</span><span class="sx-zh on"><b class="zh">${rich(c.zh, 'zh', day.bg)}</b><small class="${seen.has(i) ? 'on' : ''}">${esc(c.py)}</small></span></button>`).join('')}</div></div>`;
    wireBg(body); body.querySelectorAll('.sx-card').forEach(b => b.onclick = e => { if (e.target.closest('.sx-bg')) return; open(+b.dataset.i); }); };
  async function open(i) { stopAll(); const me = RUN, c = C[i]; seen.add(i); sfx.pop(); draw(); star();
    await say(en(c.en, c.a_en)); if (me !== RUN) return; await wait(250); await say(zh(c.zh, c.a_zh)); if (me !== RUN) return;
    if (seen.size >= C.length) { await wait(500); if (me === RUN) finish(); } }
  X.replay = () => hd('loi'); draw(); hd('loi');
};
/* 9. MẸO ÂM – nghe, bắt chước 3 lượt; rồi nghe và chạm đúng kí hiệu */
R.meo = (step, body) => {
  let ci = 0;
  async function cardStep() { const my = RUN; if (ci >= step.cards.length) return quiz(); const c = step.cards[ci]; dots(ci, step.cards.length + 1);
    const exU = c.ex.map(([py, hz]) => c.l === 'zh' ? zh(hz || py) : en(py));
    body.innerHTML = `<div class="sx-meo"><div class="sx-sym ${c.l}"><b>${esc(c.sym)}</b>${c.name ? `<small>${esc(c.name)}</small>` : ''}</div>
      <div class="sx-exs">${c.ex.map(([py, hz]) => `<button class="sx-ex">${c.l === 'zh' ? `<span>${esc(py)}</span><b class="zh">${esc(hz)}</b>` : `<b>${esc(py)}</b>`}</button>`).join('')}</div>
      <span class="ls-lab" id="lap">Lượt 1/3 · con nghe rồi nói theo</span><div class="row"><button class="btn g" id="nx" hidden>Tiếp →</button></div></div>`;
    body.querySelectorAll('.sx-ex').forEach((b, k) => b.onclick = () => { stopAll(); say(exU[k]); });
    body.querySelector('#nx').onclick = () => { stopAll(); ci++; cardStep(); };
    X.replay = () => { stopAll(); seq(exU, 500); };
    await hd('meo'); for (let l = 1; l <= 3; l++) { if (my !== RUN) return; body.querySelector('#lap').textContent = `Lượt ${l}/3 · con nghe rồi nói theo`;
      for (let k = 0; k < exU.length; k++) { const b = body.querySelectorAll('.sx-ex')[k]; b && b.classList.add('talk'); await say(exU[k]); if (my !== RUN) return; await wait(1100); b && b.classList.remove('talk'); } }
    star(); body.querySelector('#nx').hidden = false; }
  async function quiz() { dots(step.cards.length, step.cards.length + 1);
    const Q = [...(step.quiz.zh || []).map(([py, hz, t]) => ({ l: 'zh', u: zh(hz), py, hz, ans: t })), ...(step.quiz.en || []).map(([w, has]) => ({ l: 'en', u: en(w), w, ans: has ? 'yes' : 'no' }))];
    if (!Q.length) return finish();
    let qi = 0; const back = new Set();
    const ask = async () => { const my = RUN; if (qi >= Q.length) return finish(); const q = Q[qi];
      const btns = q.l === 'zh' ? (step.quiz.zh_btn || [['→', '→ đường bằng'], ['↘', '↘ cầu trượt']]) : (step.quiz.en_btn || [['yes', 'a 🐜 có'], ['no', '✖ không']]);
      body.innerHTML = `<div class="sx-meo"><span class="ls-lab">Nghe và chạm · ${qi + 1}/${Q.length}</span><div class="sx-big">${q.l === 'zh' ? `<b class="zh">${esc(q.hz)}</b><span>${esc(q.py.replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/g, m => 'aaaaeeeeiiiioooouuuuüüüü'['āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ'.indexOf(m)]))}</span>` : `<b>${esc(q.w)}</b>`}</div>
        <div class="sx-opts two">${btns.map(([k, t]) => `<button class="sx-opt" data-k="${k}">${esc(t)}</button>`).join('')}</div></div>`;
      const play = () => { stopAll(); return say(q.u); }; X.replay = play; play();
      body.querySelectorAll('.sx-opt').forEach(b => b.onclick = async () => { stopAll(); const me = RUN;
        if (b.dataset.k === q.ans) { sfx.ok(); b.classList.add('right'); star(); await hd('ok'); } else { sfx.no(); shake(b); body.querySelector(`.sx-opt[data-k="${q.ans}"]`).classList.add('hint'); if (!back.has(qi)) { back.add(qi); Q.push(q); } await hd('later'); }
        await wait(300); if (me === RUN) { qi++; ask(); } }); };
    ask(); }
  cardStep();
};
/* 10. GỌI LẠI – nhìn tranh, con tự nói, rồi nghe đáp án */
R.goi = (step, body) => {
  const C = step.cards; let i = 0;
  async function show() { const my = RUN; dots(i, C.length); if (i >= C.length) return finish(); const c = C[i];
    body.innerHTML = `<div class="sx-goi"><span class="ls-lab">Gọi lại từ ${esc(step.from)} · Hộp ôn</span><div class="sx-big">${pic(c.img, c.e, 'sx-gpic')}</div>
      <div class="sx-microw"><div class="ls-mic idle" id="mic"><span class="ls-lv"></span>${SVG.mic}<b></b></div><span class="ls-lab">Con tự nói nhé!</span></div><div id="ans" class="sx-ans2"></div>
      <div class="row"><button class="ls-b" id="nx">Bỏ qua ▶</button></div></div>`;
    body.querySelector('#nx').onclick = () => { stopAll(); i++; show(); };
    X.replay = () => { stopAll(); seq([en(c.en, c.a_en), zh(c.zh, c.a_zh)], 300); };
    await hd('goi'); if (my !== RUN) return; const how = await micTurn(body.querySelector('#mic'), my); if (how === 'gone' || my !== RUN) return;
    body.querySelector('#ans').innerHTML = bub(c.en, 'en') + bub(c.zh, 'zh', '', c.py); revealPy(body, 900);
    await seq([en(c.en, c.a_en), zh(c.zh, c.a_zh)], 300); if (my !== RUN) return; if (how === 'rec') star(); await wait(700); if (my === RUN) { i++; show(); } }
  show();
};

/* ---------- màn hình ---------- */
function setActive(k) { document.querySelectorAll('.sd-btn').forEach(b => b.classList.toggle('on', b.dataset.k === k)); }
function viewHome() { document.body.classList.add('hub'); setActive('home');
  const done = Object.values(P.days).filter(d => d.done).length;
  app.innerHTML = `<div class="screen home2"><div class="h2-top"><span class="h2-kick">Anh – Trung – Kids · lớp offline</span><h1>Seedling · Hạt mầm vươn cao</h1></div>
    <div class="h2-grid">
      ${tile({ cls: 'big', href: '#/ban-do', img: 'tai-nguyen/trang/the_gioi_seed.webp', c: '#1FA5A0', t: '🌱 Seedling · Bản đồ học', sub: `Unit 1 Greeting · đã học ${done}/4 ngày web` })}
      ${tile({ cls: 'big', href: '#/ngay/1', img: 'tai-nguyen/trang/ls_class.webp', c: '#E3262E', t: '▶ Học ngày 1', sub: 'Good morning, Mrs Lan! – Lan老师，早上好！' })}
      ${tile({ href: '#/hop-on', img: 'tai-nguyen/trang/ls_album.webp', c: '#7B5CD6', t: 'Hộp ôn', sub: (() => { const b = onBank(); const d = onDue(b).length; return d ? `${d} thẻ đến hẹn ôn hôm nay` : `${b.length} thẻ trong hộp`; })() })}
      ${tile({ href: '#/reader/1/1', img: 'tai-nguyen/canopy/img/v1_d1_p_go_to_school.webp', size: 'cover', bg: '#DDEBFF', c: '#2F6FD6', t: 'Reader · đọc truyện', sub: 'Good Morning, Mrs Lan!' })}
      ${tile({ href: '#/qua', img: 'tai-nguyen/qua/gift_rubik.webp', size: 'auto 62%', pos: '50% 55%', bg: '#FFE4EC', c: '#E3487A', t: 'Phòng đổi quà', sub: `⭐ ${qWallet()} sao trong ví` })}
      ${tile({ href: '#/hanh-trinh', img: 'tai-nguyen/trang/ls_stickers.webp', size: 'auto 92%', bg: '#FFF8E1', c: '#C9A227', t: 'Hành trình của con', sub: 'Huy hiệu · ngày học · lần nói' })}
    </div><p class="sx-demo">Bản demo để duyệt: Unit 1 (ngày web 1, 2, 3, 8). Giọng từ web 21 ngày; câu chưa thu tạm đọc bằng giọng máy. Tiến độ lưu trên máy này.</p></div>`;
  
}
function tile(o) { return `<${o.href ? 'a' : 'button'} class="ht ${o.cls || ''}" ${o.href ? `href="${o.href}"` : 'type="button"'} ${o.id ? `id="${o.id}"` : ''} style="--tc:${o.c}">
  <span class="ht-img" style="background-image:url('${o.img}')${o.pos ? `;background-position:${o.pos}` : ''}${o.size ? `;background-size:${o.size}` : ''}${o.bg ? `;background-color:${o.bg}` : ''}"></span>
  <span class="ht-lb"><b>${esc(o.t)}</b>${o.sub ? `<small>${esc(o.sub)}</small>` : ''}</span></${o.href ? 'a' : 'button'}>`; }
function parentPanel() { const ov = document.createElement('div'); ov.className = 'overlay pp';
  ov.innerHTML = `<div class="modal pp-box" role="dialog" aria-label="Ba mẹ đồng hành"><button class="pp-x" aria-label="Đóng">✕</button><h3>Ba mẹ đồng hành</h3>
    <ol class="intro-steps"><li><b>48 buổi · 99 ngày web · 26 tuần</b><span>Tuần 1–3: 3 ngày web rồi buổi Chủ nhật. Từ tuần 4: 2 ngày web → buổi thứ Tư → 2 ngày web → buổi Chủ nhật. Web luôn đi trước buổi lớp.</span></li>
      <li><b>Mỗi ngày web khoảng 12 phút</b><span>Thẻ nền Little Seed → thẻ từ mới → nghe truyện (tiếng Anh rồi tiếng Trung) → chạm, nói, phiên dịch nhí.</span></li>
      <li><b>Mỗi unit là một truyện kể dần</b><span>Unit 1 “Good Morning, Mrs Lan!” có 3 phần; ngày 8 nghe lại cả truyện.</span></li>
      <li><b>Chữ gạch chân là từ con chưa học</b><span>Con chạm để nghe, có pinyin và nghĩa tiếng Anh. Con không cần nói những từ này.</span></li>
      <li><b>Làm sai vẫn đi tiếp</b><span>Câu con chưa đúng sẽ gặp lại ở cuối bài và được lưu vào Hộp ôn.</span></li></ol>
    <p><b>3 KHÔNG:</b> không ép nói, không sửa lỗi, không so sánh. Khen con khi con đang làm bài và khi con xong bài.</p>
    <div class="sx-kidcode"><b>Nối web với lớp</b><span>${kidId() ? `Mã của con: <code>${esc(kidId())}</code>${API_ON ? '' : ' (bản xem thử)'}` : 'Ba mẹ mở đường link cô gửi qua Zalo, hoặc nhập mã cô đưa:'}</span>
      <div class="row"><input id="kidCodeIn" class="q-gate-in" placeholder="Mã của con" autocomplete="off"><button class="btn g sm" id="kidCodeOk" type="button">Lưu mã</button></div>
      <a class="sx-colink" href="#/co">Dành cho cô giáo: Bảng của cô →</a></div></div>`;
  document.body.appendChild(ov); const close = () => ov.remove(); ov.querySelector('.pp-x').onclick = close; ov.addEventListener('click', e => { if (e.target === ov || e.target.closest('a')) close(); });
  ov.querySelector('#kidCodeOk').onclick = () => { const v = ov.querySelector('#kidCodeIn').value.trim().toUpperCase().replace(/[^A-Z0-9]/g, ''); if (!v) return;
    P.kidId = v; P.co = { awards: [], seen: {} }; save(); close(); toast('Đã lưu mã của con. Web đang lấy sao cô thưởng…'); coSync(true); }; }
const WORLD = { stops: [[20.28, 96.29], [26.93, 94.11], [33.62, 92.39], [52.45, 68.41], [47.38, 60.7], [41.17, 55.95], [42.34, 25.86], [48.8, 22.33], [55.54, 21.54]],
  lop: [[44.5, 85.5], [36.5, 45.5], [64.5, 22.5]], boards: [[15.6, 90.8], [43.8, 63], [46, 10]],
  poly: [[13.81, 98.83], [20.28, 96.29], [26.93, 94.11], [33.62, 92.39], [40.21, 89.7], [46.67, 86.19], [52.18, 79.52], [52.45, 68.41], [47.38, 60.7], [41.17, 55.95], [35.16, 50.54], [32.5, 40.18], [36.28, 30.51], [42.34, 25.86], [48.8, 22.33], [55.54, 21.54], [62.28, 22.23], [68.88, 24.83]] };
const ZONE_C = ['#E3262E', '#F28C00', '#2F8F5B'], SHAPE = ['circle', 'diamond', 'square'];
function viewMap() { document.body.classList.add('hub'); setActive('map');
  const U = ([x, y]) => [x * 1.6, y * .9], road = WORLD.poly.map((p, k) => (k ? 'L' : 'M') + U(p).map(v => v.toFixed(2)).join(' ')).join(' ');
  let nowSet = false, html = '', k = 0;
  SD.map.forEach((W, r) => { W.items.forEach(([kind, n], j) => {
    if (kind === 'day') { const built = !!SD.days[n], done = P.days[n] && P.days[n].done, now = built && !done && !nowSet; if (now) nowSet = true;
      const pos = WORLD.stops[k++];
      html += `<button class="sign ${done ? 'done' : built ? 'open' : 'lock'} ${SHAPE[j % 3]} ${now ? 'now' : ''}" data-n="${n}" style="left:${pos[0]}%;top:${pos[1]}%;--zc:${ZONE_C[r]}" title="Ngày ${n}${built ? '' : ' · sắp có'}">
        <span class="sg-pole"></span><span class="sg-face"><b>${done ? '★' : n}</b></span>${built ? '' : '<span class="sg-lock">🔒</span>'}</button>`; }
    else { const pos = WORLD.lop[r]; html += `<a class="wzoom ${n === 1 ? '' : 'lock'}" href="#/lop/${n}" style="left:${pos[0]}%;top:${pos[1]}%"><span>🏫</span><small>Lớp ${n}</small></a>`; } });
    const b = WORLD.boards[r]; html += `<button class="wboard" style="left:${b[0]}%;top:${b[1]}%;--zc:${ZONE_C[r]}" type="button"><b>${esc(W.name)}</b><span>${esc(W.topic)}</span></button>`; });
  const done = Object.values(P.days).filter(d => d.done).length;
  app.innerHTML = `<div class="screen worldscr"><div class="world" style="--wbg:url('tai-nguyen/trang/the_gioi_seed.webp')"><div class="wcanvas">
    <svg class="wroad" viewBox="0 0 160 90" preserveAspectRatio="none" aria-hidden="true"><path d="${road}" class="edge"/><path d="${road}" class="sand"/><path d="${road}" class="dash"/></svg>${html}</div>
    <div class="whud"><span class="wh-name" style="--c:#1FA5A0">🌱 Seedling · Unit 1</span><span class="wh-prog"><i style="width:${done / 4 * 100}%"></i><b>${done}/4 ngày</b></span><span class="wh-gv">Bản demo</span></div>
    <div class="wbtns"><a class="wmbtn" href="#/hop-on">🗃️<span>Hộp ôn</span></a><button class="wmbtn" id="mapHelp" type="button">🔊<span>Nghe hướng dẫn</span></button></div></div></div>`;
  app.querySelectorAll('.sign').forEach(b => b.onclick = () => { if (b.classList.contains('lock')) { sfx.no(); toast(`Ngày ${b.dataset.n}: ${SD.soon[b.dataset.n] || ''} – sắp có trong bản demo sau 🔒`); return; } sfx.pop(); location.hash = '#/ngay/' + b.dataset.n; });
  app.querySelectorAll('.wboard').forEach(b => b.onclick = () => { sfx.pop(); toast(b.textContent.trim()); });
  app.querySelectorAll('.wzoom.lock').forEach(a => a.onclick = e => { e.preventDefault(); sfx.no(); toast('Buổi trên lớp này thuộc Body – sắp có 🔒'); });
  document.getElementById('mapHelp').onclick = () => hd('map');
}
function viewDay(n, sub) { const day = SD.days[n]; if (!day) { toast('Ngày này sắp có 🔒'); location.hash = '#/ban-do'; return; }
  const k = sub && /^b\d+$/.test(sub) ? +sub.slice(1) - 1 : -1;
  if (k >= 0 && day.steps[k]) return playStep(n, k);
  document.body.classList.add('hub'); setActive('map'); stopAll();
  const s = dayState(n), doneN = day.steps.filter((_, j) => j in s.steps).length, nextJ = day.steps.findIndex((_, j) => !(j in s.steps));
  const vids = (day.video || []).map(v => `<a href="${esc(v.url)}" target="_blank" rel="noopener">▶ ${esc(v.label)}</a>`).join('');
  app.innerHTML = `<div class="screen dayscr"><section class="dy-card"><div class="dy-img" style="background-image:url('${esc(day.hero)}')"></div><div class="dy-in">
      <span class="ls-kick">Tuần ${day.week} · Unit ${day.unit} Greeting · ${esc(day.part)} · Ngày web ${n}</span><h2>${esc(day.t)}</h2>
      <button class="ls-goal" id="goal">${SVG.spk}<span><small>Sau hôm nay con có thể</small>${esc(day.goal)}</span></button>
      <div class="ls-prog"><i style="width:${doneN / day.steps.length * 100}%"></i></div>
      ${doneN < day.steps.length ? `<button class="btn g ls-gonext" id="go">▶ ${doneN ? 'Học tiếp' : 'Bắt đầu'}: Bước ${nextJ + 1}</button>` : `<div class="dy-done">🎉 Con đã học xong ngày này!</div><div class="dy-row"><a class="btn y" href="#/ban-do">🗺️ Bản đồ</a></div>`}
      <div class="dy-parent"><span><b>Trước buổi lớp ${day.before}:</b> ngày web này cô Lan dạy kỹ ở buổi ${day.before}. Ba mẹ khen con khi làm bài và khi xong bài. 3 KHÔNG: không ép nói, không sửa lỗi, không so sánh.</span></div>
      ${vids ? `<div class="sx-vids"><b>Xem thêm (không bắt buộc):</b>${vids}</div>` : ''}</div></section>
    <section class="dy-tiles">${day.steps.map((st, j) => { const done = j in s.steps, now = j === nextJ;
      return `<button class="ht step ${done ? 'done' : 'open'} ${now ? 'now' : ''}" data-j="${j}" type="button" style="--tc:#3BB273"><span class="ht-img" style="background-image:url('${ICON(T[st.type].ic)}')"></span>
        ${done ? `<span class="ht-badge ok">✓ ${s.steps[j]}★</span>` : ''}${now ? '<span class="ht-now">▶ Bắt đầu</span>' : ''}<span class="ht-lb"><small>Bước ${j + 1} · ${esc(T[st.type].sub)}</small><b>${esc(T[st.type].n)}</b></span></button>`; }).join('')}</section></div>`;
  document.getElementById('goal').onclick = () => { stopAll(); say({ t: 'Hôm nay con học: ' + day.goal, l: 'vi' }); };
  const go = document.getElementById('go'); if (go) go.onclick = () => { sfx.pop(); location.hash = `#/ngay/${n}/b${nextJ + 1}`; };
  app.querySelectorAll('.ht.step').forEach(b => b.onclick = () => { sfx.pop(); location.hash = `#/ngay/${n}/b${+b.dataset.j + 1}`; });
  window.scrollTo({ top: 0 });
}
function playStep(n, k) { const day = SD.days[n]; document.body.classList.remove('hub'); setActive('map');
  app.innerHTML = `<div class="wrap ls-wrap"><div class="dayhead"><div class="crumb">🌱 Seedling · Unit 1 · Ngày web ${n} · Bước ${k + 1}/${day.steps.length}</div><h2>${esc(day.t)}</h2></div><div id="lsBox"></div>
    <div class="row"><a class="btn y" href="#/ngay/${n}">← Các bước của ngày ${n}</a></div></div>`;
  X = { n, k, day, step: day.steps[k], stars: 0 }; startStep(); window.scrollTo({ top: 0 }); }
function viewLop(b) { const L = SD.lop[b]; if (!L) return viewMap(); document.body.classList.add('hub'); setActive('map'); stopAll();
  app.innerHTML = `<div class="screen dayscr"><section class="dy-card"><div class="dy-img" style="background-image:url('${esc(L.img)}')"></div><div class="dy-in">
    <span class="ls-kick">Buổi học với cô Lan · 90 phút</span><h2>${esc(L.t)}</h2><p>${esc(L.about)}</p>
    ${L.prep.length ? `<div class="dy-parent"><span><b>Ba mẹ ôn cùng con trước buổi học:</b><br>${L.prep.map(esc).join('<br>')}</span></div>` : ''}
    <div class="dy-row"><a class="btn y" href="#/ban-do">🗺️ Bản đồ</a></div></div></section></div>`; }
function route() { if (!/^#\/reader/.test(location.hash)) RDR.auto = ''; stopAll(); if (!/^#\/(ngay|co)/.test(location.hash)) coSync(); document.querySelectorAll('.sx-pop').forEach(x => x.remove());
  const h = location.hash.replace(/^#\/?/, '').split('/');
  if (h[0] === 'ban-do') return viewMap(); if (h[0] === 'ngay') return viewDay(+h[1], h[2]); if (h[0] === 'lop') return viewLop(+h[1]); if (h[0] === 'hop-on') return h[1] === 'choi' ? viewOnPlay() : viewHop(); if (h[0] === 'qua') return viewQua(h[1]); if (h[0] === 'hanh-trinh') return viewJourney(); if (h[0] === 'co') return viewCo(); if (h[0] === 'reader') return viewReader(h[1] || '1', (+h[2] || 1) - 1);
  viewHome(); }
window.addEventListener('hashchange', () => route());
document.getElementById('muteBtn').onclick = () => { MUTE = !MUTE; sset('sdl-sfx-off', MUTE); document.getElementById('muteIc').textContent = MUTE ? '🔇' : '🔊'; toast(MUTE ? 'Đã tắt tiếng hiệu ứng (giọng đọc vẫn phát)' : 'Đã bật tiếng hiệu ứng'); };
document.getElementById('sdBack').onclick = () => history.back();
document.getElementById('sdHelp').onclick = () => parentPanel();
document.getElementById('muteIc').textContent = MUTE ? '🔇' : '🔊';
updStars(); qSide();
function sdBoot() { (function splash() { const sp = document.createElement('div'); sp.className = 'splash';
  sp.innerHTML = `<button class="splash-in" type="button"><img src="tai-nguyen/nhan-vat/huou_huou1_a.webp" alt=""><b>Chạm để bắt đầu</b><small>Bật loa để nghe cô Hươu và các bạn nhé 🔊</small></button>`;
  document.body.appendChild(sp); sp.onclick = () => { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); actx.resume(); } catch (e) {} sp.remove(); route(); }; })();
route(); }
