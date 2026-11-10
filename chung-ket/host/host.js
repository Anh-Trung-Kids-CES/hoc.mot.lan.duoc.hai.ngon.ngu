/* Luyện host – Chung kết Rung chuông vàng
   Ba việc: Nghe mẫu · Luyện từng câu với AI (Gemini nghe bản ghi, chấm nội dung, phát âm, thanh điệu) · Kiểm tra tình huống.
   Lộ trình 4 lần (HOST_LAN trong host-data.js). Mỗi lần làm bài kiểm tra ra đề mới: đổi tình huống, đổi cách hỏi,
   đổi tiếng so với lần trước, xáo thứ tự.
   Lưu: máy của host (localStorage) + Firebase anh-trung-kids-zoom, phòng rooms/HOSTCK (luật bảo mật bản 1, không cần sửa):
     Host đăng nhập bằng tài khoản chị cấp (tab "Tài khoản host" trong Sheet của máy chấm); tiến độ lưu theo tài khoản,
     nên host luyện ở máy nào cũng nối tiếp được.
     players/<máy>              {tk, ten, lan, ready, at}   (danh sách tài khoản cho trang kết quả)
     answers/acc_<tk>/<máy>     toàn bộ tiến độ của tài khoản (JSON); khi mở trang lấy bản mới nhất trong mọi máy
     answers/ghi_<bài>/<máy>    bài kiểm tra kèm bản ghi âm từng câu, để chị nghe lại
   Trang của chị: ?ket-qua · Thử không cần máy chủ: ?mock=1 · Thử tự động không cần micro: ?gia-lap=1 */

/* URL /exec của dự án Apps Script "Máy chấm host" (tệp may-cham-host.gs). Để trống thì chấm tạm bằng máy nhận giọng của Chrome. */
const HOST_API = 'https://script.google.com/macros/s/AKfycbxyMxnfsOExvMMEsgWJrGTNAqztQQl3LDwMMjKLF-5s-rcJixsWfaA52ryCmWXm-wIB7A/exec';
const ROOM = 'HOSTCK';
const FB = {
  apiKey: "AIzaSyAYoYO7PFPBCdt9JkRVixXef5cF5Djh5ng",
  authDomain: "anh-trung-kids-zoom.firebaseapp.com",
  databaseURL: "https://anh-trung-kids-zoom-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "anh-trung-kids-zoom",
  storageBucket: "anh-trung-kids-zoom.firebasestorage.app",
  messagingSenderId: "1029047261945",
  appId: "1:1029047261945:web:1ff02524454503361fa028"
};
const QS = new URLSearchParams(location.search);
const SIM = QS.has('gia-lap');
const MOCK = SIM || QS.has('mock');
const KQ = QS.has('ket-qua');
const LS_KEY = 'hostck_v2';

/* ngưỡng đạt */
const PASS = { nd: 85, pa: 75, td: 75 };      // luyện từng câu
const TPASS = { pa: 65, td: 60 };             // kiểm tra tình huống (đúng câu là chính)
const SLOW = 5;                               // giây: phản xạ chậm

/* ======================= tiện ích ======================= */
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sleep = ms => new Promise(r => setTimeout(r, ms));
function lsGet(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
function normName(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }
function fmtTime(t) { const d = new Date(t); return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }); }
const LANG = { en: { n: 'tiếng Anh', b: 'English', cls: 'en', sr: 'en-US' }, zh: { n: 'tiếng Trung', b: '中文', cls: 'zh', sr: 'zh-CN' } };
const SEC_N = Object.fromEntries(HOST_SEC.map(s => [s.id, s.n]));

/* mỗi "mục luyện" là một câu ở một tiếng: "MM1|en", "MM1|zh" */
const KEYS = [];
Object.values(HOST_LINES).forEach(l => { KEYS.push(l.code + '|en'); KEYS.push(l.code + '|zh'); });
function itemOf(k) {
  const [c, lang] = k.split('|'), l = HOST_LINES[c];
  return { k, c, lang, l, text: lang === 'zh' ? l.zh : l.en, py: lang === 'zh' ? l.py : '' };
}
/* chữ tiếng Trung luôn đi kèm pinyin */
function lineHtml(c, lang, big) {
  const l = HOST_LINES[c]; if (!l) return '';
  return lang === 'zh'
    ? `<span class="ln zh${big ? ' big' : ''}"><span class="hz">${esc(l.zh)}</span><span class="py">${esc(l.py)}</span></span>`
    : `<span class="ln en${big ? ' big' : ''}">${esc(l.en)}</span>`;
}

/* ======================= trạng thái của host ======================= */
let ST = lsGet(LS_KEY, null);   // { tk, mk, ten, S }
let S = ST && ST.S;
function blank(ten) { return { v: 1, ten, lan: 1, it: {}, need: {}, tests: [], seen: {}, cur: null, ready: false, at: Date.now() }; }
function save() {
  if (!S) return;
  S.at = Date.now();
  lsSet(LS_KEY, ST);
  clearTimeout(save.t); save.t = setTimeout(pushRemote, 1200);
}

/* ======================= Firebase ======================= */
let db = null, uid = '';
async function fbInit() {
  if (MOCK || db) return !!db;
  try {
    firebase.initializeApp(FB);
    const auth = firebase.auth();
    const user = await new Promise(res => { const u = auth.onAuthStateChanged(x => { u(); res(x); }); });
    uid = user ? user.uid : (await auth.signInAnonymously()).user.uid;
    db = firebase.database();
    return true;
  } catch (e) { console.warn('firebase', e); return false; }
}
const R = p => db.ref('rooms/' + ROOM + '/' + p);
async function pushRemote() {
  if (!db || !S) return;
  try {
    const slim = Object.assign({}, S, { cur: S.cur ? { id: S.cur.id } : null });
    await R('answers/acc_' + ST.tk + '/' + uid).set({ tk: ST.tk, ten: S.ten, at: S.at, s: JSON.stringify(slim) });
    await R('players/' + uid).set({ tk: ST.tk, ten: S.ten, lan: S.lan, ready: !!S.ready, at: S.at });
    setSync('Đã lưu lên máy chủ');
  } catch (e) { setSync('Chưa lưu được lên máy chủ, tiến độ vẫn giữ trên máy này'); }
}
/* tiến độ mới nhất của một tài khoản, trong mọi máy host đã dùng */
function tkKey(tk) { return String(tk || '').trim().toLowerCase().replace(/[.#$\[\]\/\s]+/g, '_'); }
async function findRemote(tk) {
  if (!db) return null;
  try {
    const all = (await R('answers/acc_' + tkKey(tk)).get()).val() || {};
    let best = null;
    Object.values(all).forEach(v => { if (!best || v.at > best.at) best = v; });
    return best ? Object.assign(JSON.parse(best.s), { at: best.at }) : null;
  } catch (e) { return null; }
}
/* host vừa luyện ở máy khác: lấy bản mới hơn về máy này */
async function syncFromRemote() {
  if (!db || !ST || REC.busy || (TV && S.cur)) return false;
  const r = await findRemote(ST.tk);
  if (r && r.at > (S.at || 0) + 1000) { r.cur = null; S = ST.S = r; lsSet(LS_KEY, ST); return true; }
  return false;
}
function setSync(t) { const el = $('#sync'); if (el) el.textContent = t; }

/* ======================= âm thanh mẫu ======================= */
let curAudio = null;
function stopSample() { try { if (curAudio) curAudio.pause(); } catch (e) { } try { speechSynthesis.cancel(); } catch (e) { } }
function playSample(c, lang, btn) {
  stopSample();
  const f = HOST_AUDIO[c + '|' + lang];
  if (btn) btn.classList.add('playing');
  const done = () => btn && btn.classList.remove('playing');
  if (f) { curAudio = new Audio('audio/' + f); curAudio.onended = done; curAudio.onerror = done; curAudio.play().catch(done); return; }
  /* chưa thu giọng mẫu: tạm đọc bằng giọng của trình duyệt */
  try {
    const l = HOST_LINES[c], u = new SpeechSynthesisUtterance(lang === 'zh' ? l.zh : l.en);
    u.lang = LANG[lang].sr; u.rate = lang === 'zh' ? 0.85 : 0.95;
    const v = speechSynthesis.getVoices().find(v => v.lang.replace('_', '-').toLowerCase().startsWith(lang === 'zh' ? 'zh-cn' : 'en'));
    if (v) u.voice = v;
    u.onend = done; u.onerror = done; speechSynthesis.speak(u);
  } catch (e) { done(); }
}
function sampleBtn(c, lang, label) {
  const tam = HOST_AUDIO[c + '|' + lang] ? '' : ' <small>(giọng tạm)</small>';
  return `<button class="btn ghost sm" data-play="${c}|${lang}">▶ ${label || 'Nghe mẫu'}${tam}</button>`;
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-play]'); if (!b) return;
  const [c, lang] = b.dataset.play.split('|'); playSample(c, lang, b);
});

/* ======================= ghi âm ======================= */
let micStream = null;
async function micInit() {
  if (SIM) return true;
  if (micStream) return true;
  try { micStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }); return true; }
  catch (e) { return false; }
}
const REC = { stop: null, busy: false };
/* ghi một lượt nói: tự dừng khi host im lặng. Trả về {wav64, webm (Blob), heard, onset (ms), dur (ms), reason} */
function recordOnce(o) {
  o = Object.assign({ lang: 'en', waitMs: 15000, silenceMs: 1400, maxMs: 12000, onLevel: null, onPartial: null }, o);
  if (SIM) return simRecord(o);
  return new Promise(async resolve => {
    REC.busy = true;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    const src = ctx.createMediaStreamSource(micStream);
    const proc = ctx.createScriptProcessor(4096, 1, 1);
    const sr = ctx.sampleRate, chunks = [];
    const t0 = performance.now();
    let onset = -1, lastVoice = 0, floor = 0, nFloor = 0, done = false;
    /* bản nén để lưu và nghe lại */
    let mr = null; const parts = [];
    try {
      const mt = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find(t => window.MediaRecorder && MediaRecorder.isTypeSupported(t));
      if (mt) { mr = new MediaRecorder(micStream, { mimeType: mt, audioBitsPerSecond: 24000 }); mr.ondataavailable = e => e.data.size && parts.push(e.data); mr.start(); }
    } catch (e) { mr = null; }
    /* chép lời tạm bằng Chrome (để hiện ngay và để chấm dự phòng khi chưa có máy chấm AI) */
    let heard = '', rec = null;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      try {
        rec = new SR(); rec.lang = LANG[o.lang].sr; rec.continuous = true; rec.interimResults = true;
        rec.onresult = ev => {
          let fin = '', tmp = '';
          for (let i = 0; i < ev.results.length; i++) (ev.results[i].isFinal ? (fin += ev.results[i][0].transcript + ' ') : (tmp += ev.results[i][0].transcript));
          heard = (fin + tmp).trim(); o.onPartial && o.onPartial(heard);
        };
        rec.onerror = () => { }; rec.start();
      } catch (e) { rec = null; }
    }
    const finish = async reason => {
      if (done) return; done = true; REC.stop = null;
      try { proc.disconnect(); src.disconnect(); } catch (e) { }
      const end = performance.now() - t0;
      const webm = await new Promise(r => { if (!mr || mr.state === 'inactive') return r(null); mr.onstop = () => r(new Blob(parts, { type: mr.mimeType })); mr.stop(); });
      if (rec) { try { rec.stop(); } catch (e) { } await sleep(700); }
      try { ctx.close(); } catch (e) { }
      /* cắt phần im lặng đầu (thời gian đọc tình huống) và cuối */
      const all = concat(chunks), per = sr / 1000;
      const a = onset < 0 ? 0 : Math.max(0, Math.floor((onset - 350) * per)), b = onset < 0 ? all.length : Math.min(all.length, Math.floor((lastVoice + 450) * per));
      const wav64 = onset < 0 ? '' : wavBase64(downsample(all.subarray(a, b), sr, 16000), 16000);
      REC.busy = false;
      resolve({ wav64, webm, heard, onset: onset < 0 ? null : Math.round(onset), dur: Math.round(end), reason });
    };
    REC.stop = () => finish('manual');
    proc.onaudioprocess = e => {
      if (done) return;
      const d = e.inputBuffer.getChannelData(0); chunks.push(new Float32Array(d));
      let s = 0; for (let i = 0; i < d.length; i++) s += d[i] * d[i];
      const rms = Math.sqrt(s / d.length), now = performance.now() - t0;
      if (now < 350) { floor = (floor * nFloor + rms) / (++nFloor); return; }
      const thr = Math.max(0.018, floor * 3.2);
      o.onLevel && o.onLevel(Math.min(1, rms / 0.2), rms > thr);
      if (rms > thr) { if (onset < 0) onset = now; lastVoice = now; }
      if (onset < 0 && now > o.waitMs) finish('timeout');
      else if (onset >= 0 && now - lastVoice > o.silenceMs) finish('silence');
      else if (onset >= 0 && now - onset > o.maxMs) finish('max');
    };
    src.connect(proc); proc.connect(ctx.destination);
  });
}
function concat(cs) { const n = cs.reduce((a, c) => a + c.length, 0), out = new Float32Array(n); let o = 0; cs.forEach(c => { out.set(c, o); o += c.length; }); return out; }
function downsample(x, from, to) {
  if (from === to) return x;
  const r = from / to, n = Math.floor(x.length / r), out = new Float32Array(n);
  for (let i = 0; i < n; i++) { const a = Math.floor(i * r), b = Math.min(x.length, Math.floor((i + 1) * r)); let s = 0; for (let j = a; j < b; j++) s += x[j]; out[i] = s / Math.max(1, b - a); }
  return out;
}
function wavBase64(x, rate) {
  const buf = new ArrayBuffer(44 + x.length * 2), v = new DataView(buf);
  const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  w(0, 'RIFF'); v.setUint32(4, 36 + x.length * 2, true); w(8, 'WAVE'); w(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, rate, true);
  v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, x.length * 2, true);
  for (let i = 0; i < x.length; i++) { const s = Math.max(-1, Math.min(1, x[i])); v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true); }
  let bin = ''; const u = new Uint8Array(buf);
  for (let i = 0; i < u.length; i += 0x8000) bin += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
  return btoa(bin);
}
function blobToB64(b) { return new Promise(r => { if (!(b instanceof Blob)) return r(''); const f = new FileReader(); f.onload = () => r(String(f.result)); f.onerror = () => r(''); f.readAsDataURL(b); }); }

/* ======================= chấm ======================= */

async function aiCham(p) {
  if (SIM) return simCham(p);
  if (!HOST_API || MOCK) return null;
  try {
    const r = await fetch(HOST_API, { method: 'POST', body: JSON.stringify(Object.assign({ action: 'cham', tk: ST.tk, mk: ST.mk }, p)) });
    const j = await r.json();
    return j && j.ok ? j : { err: (j && j.loi) || 'loi' };
  } catch (e) { return { err: 'mang' }; }
}
/* chấm dự phòng bằng chữ Chrome nghe được (không chấm được thanh điệu) */
function normTxt(s, lang) {
  s = String(s || '').toLowerCase();
  return lang === 'zh' ? s.replace(/[^一-鿿a-z]/g, '') : s.replace(/[’']/g, "'").replace(/[^a-z' ]+/g, ' ').replace(/\s+/g, ' ').trim();
}
function simRatio(a, b, lang) {
  const A = lang === 'zh' ? [...normTxt(a, lang)] : normTxt(a, lang).split(' ').filter(Boolean);
  const B = lang === 'zh' ? [...normTxt(b, lang)] : normTxt(b, lang).split(' ').filter(Boolean);
  if (!A.length || !B.length) return 0;
  const dp = Array(B.length + 1).fill(0);
  for (let i = 1; i <= A.length; i++) { let prev = 0; for (let j = 1; j <= B.length; j++) { const t = dp[j]; dp[j] = A[i - 1] === B[j - 1] ? prev + 1 : Math.max(dp[j], dp[j - 1]); prev = t; } }
  return 2 * dp[B.length] / (A.length + B.length);
}
function chromeCham(heard, lang, codes, all) {
  const target = all ? codes.map(c => lang === 'zh' ? HOST_LINES[c].zh : HOST_LINES[c].en).join(' ') : null;
  let best = 0, khop = '';
  if (all) { best = simRatio(heard, target, lang); khop = codes.join(','); }
  else codes.forEach(c => { const r = simRatio(heard, lang === 'zh' ? HOST_LINES[c].zh : HOST_LINES[c].en, lang); if (r > best) { best = r; khop = c; } });
  const sc = Math.round(best * 100);
  return { chrome: true, nghe_duoc: heard, dung_tieng: !!heard, khop: sc >= 60 ? khop : '', noi_dung: sc, phat_am: sc, thanh_dieu: lang === 'zh' ? -1 : -1, nhip: -1, loi: [],
    nhan_xet: heard ? 'Chấm tạm bằng máy nhận giọng của Chrome: chỉ so chữ nghe được, chưa chấm thanh điệu và độ chuẩn âm.' : 'Máy chưa nghe được gì, bạn nói lại gần micro hơn nhé.' };
}
function composite(r, lang) {
  if (!r) return 0;
  if (r.chrome) return r.noi_dung;
  return lang === 'zh' ? Math.round(.35 * r.noi_dung + .3 * r.phat_am + .35 * Math.max(0, r.thanh_dieu)) : Math.round(.5 * r.noi_dung + .5 * r.phat_am);
}
function practicePass(r, lang) {
  if (!r) return false;
  if (r.chrome) return r.noi_dung >= 85;
  return r.dung_cau !== false && r.noi_dung >= PASS.nd && r.phat_am >= PASS.pa && (lang !== 'zh' || r.thanh_dieu >= PASS.td);
}
function testPass(r, lang, sit) {
  if (!r) return false;
  if (r.chrome) return r.noi_dung >= 70;
  const codes = String(r.khop || '').split(',').map(s => s.trim()).filter(Boolean);
  const okCode = sit.all ? sit.ok.every(c => codes.includes(c)) : codes.some(c => sit.ok.includes(c));
  return !!r.dung_tieng && !!r.dung_cau && okCode && r.phat_am >= TPASS.pa && (lang !== 'zh' || r.thanh_dieu >= TPASS.td);
}
/* chấm một bản ghi: ưu tiên AI, không có thì dùng Chrome */
async function chamBanGhi(rec, p) {
  if (!rec.wav64 && !SIM) return Object.assign(chromeCham('', p.lang, p.codes, p.all), { im: true });
  const ai = await aiCham({ audio: rec.wav64, lang: p.lang, mode: p.mode, sit: p.sit || '', all: !!p.all,
    targets: p.codes.map(c => ({ code: c, text: p.lang === 'zh' ? HOST_LINES[c].zh : HOST_LINES[c].en, py: p.lang === 'zh' ? HOST_LINES[c].py : '' })) });
  if (ai && !ai.err) return ai;
  const r = chromeCham(rec.heard, p.lang, p.codes, p.all);
  if (ai && ai.err) r.nhan_xet = (ai.err === 'sai_tai_khoan' ? 'Tài khoản đã bị khóa hoặc đổi mật khẩu, bạn đăng nhập lại nhé. ' : 'Máy chấm AI đang lỗi (' + ai.err + '). ') + r.nhan_xet;
  return r;
}

/* ======================= giả lập (kiểm thử không cần micro) ======================= */
async function simRecord(o) {
  await sleep(300);
  const heard = o.simText || '';
  o.onPartial && o.onPartial(heard);
  return { wav64: 'U0lN', webm: null, heard, onset: 900 + Math.round(Math.random() * 3000), dur: 3000, reason: 'silence' };
}
async function simCham(p) {
  await sleep(250);
  const good = Math.random() < 0.8, c = (p.targets || []).map(t => t.code);
  return { ok: true, sim: true, nghe_duoc: good ? c.map(x => p.lang === 'zh' ? HOST_LINES[x].zh : HOST_LINES[x].en).join(' ') : '…', dung_tieng: true,
    khop: good ? (p.all ? c.join(',') : c[0]) : '', dung_cau: good, noi_dung: good ? 92 : 50, phat_am: good ? 86 : 60,
    thanh_dieu: p.lang === 'zh' ? (good ? 82 : 55) : -1, nhip: 80,
    loi: good ? [] : [{ tu: p.lang === 'zh' ? '准备 zhǔnbèi' : 'ready', van_de: 'Giả lập: âm đầu chưa rõ' }], nhan_xet: good ? 'Giả lập: nói rõ, tự tin.' : 'Giả lập: cần nói rõ hơn.' };
}

/* ======================= lộ trình ======================= */
function lanCfg(L) { return HOST_LAN[L - 1] || HOST_LAN[HOST_LAN.length - 1]; }
function lastTest() { return S.tests.length ? S.tests[S.tests.length - 1] : null; }
function ensureNeed() {
  const L = S.lan; if (S.need[L]) return;
  let ks;
  if (L === 1) ks = KEYS.filter(k => HOST_LINES[k.split('|')[0]].star);
  else if (L === 2) ks = KEYS.filter(k => { const r = S.it[k]; return !r || !r.pass || r.best < 85; });
  else {
    const fail = new Set(), t = lastTest();
    if (t) t.items.filter(x => x.ok === false).forEach(x => HOST_SIT[x.si].ok.forEach(c => fail.add(c + '|' + x.lang)));
    ks = KEYS.filter(k => { const r = S.it[k]; return !r || !r.pass || r.best < 85 || fail.has(k); });
  }
  S.need[L] = ks; save();
}
function needLeft() { const L = S.lan; return (S.need[L] || []).filter(k => !(S.it[k] && S.it[k].lp >= L)); }
function practiced(s) { return KEYS.filter(k => s.it[k] && s.it[k].n).sort((a, b) => ((s.it[b].fb || {}).at || 0) - ((s.it[a].fb || {}).at || 0)); }
function masteredCount() { return KEYS.filter(k => S.it[k] && S.it[k].pass).length; }

/* ra đề kiểm tra: ưu tiên tình huống chưa gặp, tình huống làm sai lần trước; đổi cách hỏi và đổi tiếng so với lần trước */
function makeTest() {
  const L = S.lan, cfg = lanCfg(L);
  const cand = HOST_SIT.map((s, si) => ({ s, si })).filter(({ s }) => {
    if (L <= 2 && s.all) return false;
    if (L === 1) return s.ok.some(c => HOST_LINES[c].star) && (!s.all || s.ok.every(c => HOST_LINES[c].star));
    return true;
  });
  cand.forEach(x => {
    const sn = S.seen[x.si];
    x.p = Math.random() * 1.2 + (sn ? 0 : 3) + (sn && sn.ok === false ? 4 : 0) + (x.s.ok.some(c => HOST_LINES[c].star) ? 1 : 0) + (x.s.all && L >= 3 ? 1.5 : 0) - (sn ? Math.min(2, sn.n * 0.4) : 0);
  });
  cand.sort((a, b) => b.p - a.p);
  const pick = [], used = new Set();
  for (const x of cand) { const key = x.s.ok.slice().sort().join('+'); if (used.has(key)) continue; used.add(key); pick.push(x); if (pick.length >= cfg.n) break; }
  let nEn = 0, nZh = 0;
  const items = pick.map(({ s, si }) => {
    const sn = S.seen[si] || {};
    const vs = s.v.map((v, i) => ({ t: Array.isArray(v) ? v[0] : v, lang: Array.isArray(v) ? v[1] : '', i }));
    let lang = sn.lang ? (sn.lang === 'en' ? 'zh' : 'en') : (nEn <= nZh ? 'en' : 'zh');
    let opts = vs.filter(v => !v.lang || v.lang === lang);
    if (!opts.length) { opts = vs; lang = vs[0].lang || lang; }
    let v = opts.filter(o => o.i !== sn.v); if (!v.length) v = opts;
    const pickV = v[Math.floor(Math.random() * v.length)];
    if (pickV.lang) lang = pickV.lang;
    lang === 'en' ? nEn++ : nZh++;
    return { si, vi: pickV.i, txt: pickV.t, lang, ok: null };
  });
  return { id: Date.now().toString(36), lan: L, at: Date.now(), n: items.length, i: 0, items: shuffle(items), done: false };
}
function finishTest(t) {
  t.done = true;
  const nOk = t.items.filter(x => x.ok).length;
  t.pct = Math.round(100 * nOk / t.n); t.nOk = nOk;
  t.slow = t.items.filter(x => x.rt != null && x.rt > SLOW).length;
  t.pass = t.pct >= lanCfg(t.lan).pass;
  t.items.forEach(x => {
    const sn = S.seen[x.si] || { n: 0 };
    S.seen[x.si] = { lang: x.lang, v: x.vi, ok: !!x.ok, n: sn.n + 1, lan: t.lan };
    /* câu nói sai trong bài kiểm tra: hạ điểm "vững" để lần sau phải luyện lại */
    if (!x.ok) HOST_SIT[x.si].ok.forEach(c => { const r = S.it[c + '|' + x.lang]; if (r) r.best = Math.min(r.best, 80); });
  });
  S.tests.push(Object.assign({}, t, { items: t.items.map(x => { const y = Object.assign({}, x); delete y.webm; return y; }) }));
  S.cur = null;
  if (t.pass) {
    if (t.lan >= HOST_LAN.length) S.ready = true;
    else { S.lan = t.lan + 1; ensureNeed(); }
  }
  save();
}

/* ======================= khung trang ======================= */
const app = () => $('#app');
function nav(active) {
  const tabs = [['lo-trinh', 'Lộ trình 4 lần'], ['luyen', 'Luyện từng câu'], ['kiem-tra', 'Kiểm tra tình huống'], ['thu-vien', 'Thư viện câu']];
  $('#nav').innerHTML = S ? tabs.map(([id, n]) => `<button class="tab${active === id ? ' on' : ''}" data-go="${id}">${n}</button>`).join('') : '';
  $('#who').innerHTML = S ? `<span>${esc(S.ten)} (${esc(ST.tk)})</span> · <span id="sync"></span> <button class="lnk" id="doi">Đăng xuất</button>` : '';
  const d = $('#doi'); if (d) d.onclick = () => { if (confirm('Đăng xuất khỏi máy này? Tiến độ đã lưu theo tài khoản, đăng nhập lại sẽ lấy về.')) { localStorage.removeItem(LS_KEY); location.reload(); } };
}
document.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) go(b.dataset.go); });
function go(v, arg) {
  stopSample(); if (REC.stop) REC.stop();
  location.hash = v;
  ({ 'lo-trinh': viewHome, luyen: viewLuyen, 'kiem-tra': viewTest, 'thu-vien': viewLib }[v] || viewHome)(arg);
  window.scrollTo(0, 0);
}

/* ---------- đăng nhập (tài khoản chị cấp) ---------- */
function viewLogin(msg) {
  nav();
  app().innerHTML = `<section class="card narrow">
    <h1>Luyện host · Chung kết Rung chuông vàng</h1>
    <p class="muted">Trang luyện câu dẫn tiếng Anh và tiếng Trung cho chương trình Little Language Explorers. Mở bằng <b>Chrome</b> trên máy tính có micro, đeo tai nghe để luyện chính xác nhất.</p>
    <label>Tài khoản<input id="tk" autocomplete="username" autocapitalize="off" placeholder="chị Duyên cấp, ví dụ host01"></label>
    <label>Mật khẩu<input id="mk" type="password" autocomplete="current-password"></label>
    ${msg ? `<p class="msg err">${esc(msg)}</p>` : ''}
    <button class="btn" id="vao">Đăng nhập</button>
    <p class="muted sm">Tiến độ lưu theo tài khoản: đăng nhập ở máy khác vẫn luyện tiếp được.</p>
  </section>`;
  $('#mk').onkeydown = e => { if (e.key === 'Enter') $('#vao').click(); };
  $('#vao').onclick = async () => {
    const tk = $('#tk').value.trim(), mk = $('#mk').value.trim();
    if (!tk || !mk) return viewLogin('Bạn nhập tài khoản và mật khẩu nhé.');
    $('#vao').disabled = true; $('#vao').textContent = 'Đang đăng nhập…';
    let ten = tk;
    if (HOST_API && !MOCK) {
      try {
        const j = await (await fetch(HOST_API, { method: 'POST', body: JSON.stringify({ action: 'dangnhap', tk, mk }) })).json();
        if (!j.ok) return viewLogin(j.loi === 'sai_tai_khoan' ? 'Tài khoản hoặc mật khẩu chưa đúng.' : 'Máy chủ đang lỗi, bạn báo chị Duyên nhé.');
        ten = j.ten || tk;
      } catch (e) { return viewLogin('Chưa kết nối được máy chủ, bạn thử lại nhé.'); }
    }
    $('#vao').textContent = 'Đang lấy tiến độ…';
    ST = { tk: tkKey(tk), mk, ten, S: null };
    await fbInit();
    const old = await findRemote(ST.tk);
    S = old || blank(ten); S.ten = ten; S.cur = null;
    ST.S = S; ensureNeed(); save();
    go('lo-trinh');
  };
}

/* ---------- lộ trình ---------- */
function viewHome() {
  nav('lo-trinh'); ensureNeed();
  const L = S.lan, left = needLeft(), need = S.need[L] || [];
  const cards = HOST_LAN.map(c => {
    const ts = S.tests.filter(t => t.lan === c.lan);
    const passT = ts.find(t => t.pass);
    const st = passT ? 'xong' : c.lan === L && !S.ready ? 'dang' : c.lan < L || S.ready ? 'xong' : 'khoa';
    const hist = ts.map(t => `<span class="chip ${t.pass ? 'ok' : 'no'}">${t.pct}%</span>`).join(' ');
    let body = `<p>${esc(c.mo)}</p>`;
    if (st === 'dang') {
      const pct = need.length ? Math.round(100 * (need.length - left.length) / need.length) : 100;
      body += `<div class="bar"><i style="width:${pct}%"></i></div>
        <p class="muted">Câu cần luyện đạt: <b>${need.length - left.length}/${need.length}</b>${left.length ? '' : ' · đã đủ, làm bài kiểm tra được rồi'}</p>
        <div class="row">${left.length ? `<button class="btn" data-go="luyen">Luyện tiếp (${left.length} câu)</button>` : ''}
        <button class="btn ${left.length ? 'ghost' : ''}" id="lamBai" ${left.length ? 'disabled title="Luyện đạt các câu cần luyện trước"' : ''}>${S.cur ? 'Làm tiếp bài kiểm tra' : ts.length ? 'Làm lại bài kiểm tra (đề mới)' : 'Làm bài kiểm tra'}</button></div>`;
    }
    return `<article class="lan ${st}"><header><h3>${esc(c.ten)}</h3><span class="tag">${st === 'xong' ? 'Đã qua' : st === 'dang' ? 'Đang luyện' : 'Chưa mở'}</span></header>
      ${body}${hist ? `<p class="muted">Các lần làm bài (cần ${c.pass}%): ${hist}</p>` : ''}</article>`;
  }).join('');
  const weak = KEYS.filter(k => S.it[k] && S.it[k].n).sort((a, b) => S.it[a].best - S.it[b].best).slice(0, 8);
  app().innerHTML = `
    ${S.ready ? `<section class="card ready"><h2>Sẵn sàng lên sóng</h2><p>Bạn đã qua cả 4 lần luyện. Trước giờ diễn, nghe lại các câu ★ một lượt và ôn các câu bên dưới.</p></section>` : ''}
    <section class="card"><h2>Chào ${esc(S.ten)}</h2>
      <p class="muted">Đã luyện đạt <b>${masteredCount()}/${KEYS.length}</b> câu (mỗi câu tính riêng tiếng Anh và tiếng Trung). Mỗi lần làm bài kiểm tra là một đề mới: tình huống, cách hỏi và tiếng được đổi so với lần trước.</p>
      ${!HOST_API && !MOCK ? `<p class="msg note">Máy chấm AI chưa bật: điểm hiện tại là chấm tạm bằng máy nhận giọng của Chrome.</p>` : ''}</section>
    <div class="lans">${cards}</div>
    ${weak.length ? `<section class="card"><h3>Câu điểm thấp nhất của bạn</h3><ul class="weak">${weak.map(k => { const it = itemOf(k); return `<li><span class="code">${it.c}</span> ${lineHtml(it.c, it.lang)} <span class="chip">${S.it[k].best}</span> <button class="btn ghost sm" data-luyen="${k}">Luyện</button></li>`; }).join('')}</ul></section>` : ''}`;
  const lb = $('#lamBai'); if (lb) lb.onclick = () => go('kiem-tra');
  $$('[data-luyen]').forEach(b => b.onclick = () => go('luyen', { only: [b.dataset.luyen] }));
}

/* ---------- luyện từng câu ---------- */
let LQ = { list: [], i: 0, filter: 'need' };
function practiceList(filter) {
  if (filter === 'need') { const l = needLeft(); return l.length ? l : KEYS.slice(); }
  if (filter === 'yeu') return KEYS.filter(k => !S.it[k] || !S.it[k].pass || S.it[k].best < 85);
  if (filter === 'all') return KEYS.slice();
  return KEYS.filter(k => HOST_LINES[k.split('|')[0]].sec === filter);
}
function viewLuyen(arg) {
  nav('luyen'); ensureNeed();
  if (arg && arg.only) { LQ = { list: arg.only.concat(practiceList('need').filter(k => !arg.only.includes(k))), i: 0, filter: 'need' }; }
  else if (!LQ.list.length || arg === 'reset') LQ = { list: practiceList(LQ.filter), i: 0, filter: LQ.filter };
  const left = needLeft();
  const opts = [['need', `Câu cần luyện lần ${S.lan} (${left.length})`], ['yeu', 'Câu chưa vững'], ['all', 'Tất cả câu']].concat(HOST_SEC.map(s => [s.id, s.n]));
  app().innerHTML = `<section class="card">
      <div class="row between"><h2>Luyện từng câu</h2>
      <select id="loc">${opts.map(([v, n]) => `<option value="${v}"${LQ.filter === v ? ' selected' : ''}>${esc(n)}</option>`).join('')}</select></div>
      <p class="muted">Bấm <b>Nghe mẫu</b>, rồi bấm <b>Nói</b> (hoặc phím cách) và nói câu. Máy tự dừng khi bạn ngừng nói. Đạt khi: đúng câu, phát âm từ ${PASS.pa}${''} và thanh điệu tiếng Trung từ ${PASS.td} điểm.</p>
    </section>
    <section class="card practice" id="pc"></section>
    <section class="card"><h3>Danh sách (${LQ.list.length} câu)</h3><div class="qlist" id="ql"></div></section>`;
  $('#loc').onchange = e => { LQ.filter = e.target.value; LQ.list = practiceList(LQ.filter); LQ.i = 0; viewLuyen(); };
  drawQList(); drawPractice();
}
function statusChip(k) {
  const r = S.it[k];
  if (!r || !r.n) return '<span class="chip">chưa luyện</span>';
  return `<span class="chip ${r.pass ? 'ok' : 'no'}">${r.pass ? 'Đạt' : 'Chưa đạt'} · ${r.best}</span>`;
}
function drawQList() {
  $('#ql').innerHTML = LQ.list.map((k, i) => { const it = itemOf(k); return `<button class="qi${i === LQ.i ? ' on' : ''}" data-qi="${i}"><span class="code">${it.c}</span><span class="lg ${it.lang}">${LANG[it.lang].b}</span><span class="t">${esc(it.text)}</span>${statusChip(k)}</button>`; }).join('');
  $$('[data-qi]').forEach(b => b.onclick = () => { LQ.i = +b.dataset.qi; drawQList(); drawPractice(); $('#pc').scrollIntoView({ behavior: 'smooth' }); });
}
function scoreBars(r, lang) {
  if (r.chrome) return `<div class="bars"><div><span>Khớp chữ</span><b>${r.noi_dung}</b><div class="bar"><i style="width:${r.noi_dung}%"></i></div></div></div>`;
  const rows = [['Nội dung', r.noi_dung], ['Phát âm', r.phat_am]];
  if (lang === 'zh') rows.push(['Thanh điệu', r.thanh_dieu]);
  if (r.nhip >= 0) rows.push(['Ngữ điệu, năng lượng', r.nhip]);
  return `<div class="bars">${rows.map(([n, v]) => `<div><span>${n}</span><b>${v}</b><div class="bar ${v >= 75 ? '' : 'low'}"><i style="width:${Math.max(0, v)}%"></i></div></div>`).join('')}</div>`;
}
function feedbackHtml(r, lang) {
  return `${scoreBars(r, lang)}
    ${r.nghe_duoc ? `<p class="heard"><span class="muted">Máy nghe được:</span> ${esc(r.nghe_duoc)}</p>` : ''}
    ${r.loi && r.loi.length ? `<ul class="errs">${r.loi.map(e => `<li><b>${esc(e.tu)}</b> – ${esc(e.van_de)}</li>`).join('')}</ul>` : ''}
    ${r.nhan_xet ? `<p class="fb">${esc(r.nhan_xet)}</p>` : ''}`;
}
let lastMine = null;
function drawPractice() {
  const k = LQ.list[LQ.i]; if (!k) { $('#pc').innerHTML = '<p>Không còn câu nào trong danh sách này.</p>'; return; }
  const it = itemOf(k), l = it.l;
  $('#pc').innerHTML = `
    <div class="row between"><div><span class="code">${it.c}</span> <span class="star">${l.star ? '★ cốt lõi' : '☆ nâng cao'}</span> · <span class="muted">${esc(SEC_N[l.sec])}</span></div>
      <span class="lg big ${it.lang}">${LANG[it.lang].b}</span></div>
    <div class="say">${lineHtml(it.c, it.lang, true)}</div>
    <p class="muted">Khi dùng: ${esc(l.note)}${l.rep ? ` · Bé đáp: <i>${esc(l.rep)}</i>` : ''}</p>
    <div class="row">${sampleBtn(it.c, it.lang)}
      <button class="btn rec" id="noi">🎙 Nói</button>
      <button class="btn ghost" id="mine" ${lastMine && lastMine.k === k ? '' : 'disabled'}>⟲ Nghe lại giọng mình</button>
      <span class="sp"></span>
      <button class="btn ghost" id="prev" ${LQ.i ? '' : 'disabled'}>← Câu trước</button>
      <button class="btn ghost" id="next">Câu tiếp →</button></div>
    <div class="meter"><i id="lvl"></i></div><p class="live" id="live"></p>
    <div id="res">${S.it[k] && S.it[k].fb ? `<p class="muted">Lần gần nhất:</p>${feedbackHtml(S.it[k].fb, it.lang)}` : ''}</div>`;
  $('#prev').onclick = () => { LQ.i--; drawQList(); drawPractice(); };
  $('#next').onclick = () => { LQ.i = Math.min(LQ.list.length - 1, LQ.i + 1); drawQList(); drawPractice(); };
  $('#mine').onclick = () => { if (lastMine && lastMine.url) { stopSample(); curAudio = new Audio(lastMine.url); curAudio.play(); } };
  $('#noi').onclick = () => practiceSay(k);
}
async function practiceSay(k) {
  if (REC.busy) { REC.stop && REC.stop(); return; }
  const it = itemOf(k), b = $('#noi');
  if (!(await micInit())) { $('#res').innerHTML = '<p class="msg err">Chưa dùng được micro. Bạn cho phép trình duyệt dùng micro rồi thử lại.</p>'; return; }
  stopSample();
  b.classList.add('on'); b.textContent = '■ Đang nghe… bấm để dừng'; $('#live').textContent = ''; $('#res').innerHTML = '';
  const rec = await recordOnce({ lang: it.lang, waitMs: 8000, silenceMs: 1500, maxMs: 15000, simText: it.text,
    onLevel: (v, on) => { const el = $('#lvl'); if (el) { el.style.width = (v * 100) + '%'; el.classList.toggle('on', on); } },
    onPartial: t => { const el = $('#live'); if (el) el.textContent = t; } });
  if (!$('#noi')) return;
  b.classList.remove('on'); b.textContent = '🎙 Nói lại';
  if (rec.webm) lastMine = { k, url: URL.createObjectURL(rec.webm) }; $('#mine').disabled = !rec.webm;
  if (rec.onset == null) { $('#res').innerHTML = '<p class="msg err">Máy chưa nghe thấy bạn nói. Kiểm tra micro rồi bấm Nói lại.</p>'; return; }
  $('#res').innerHTML = '<p class="muted">Đang chấm…</p>';
  const r = await chamBanGhi(rec, { lang: it.lang, codes: [it.c], mode: 'luyen' });
  const sc = composite(r, it.lang), ok = practicePass(r, it.lang);
  const o = S.it[k] || { best: 0, last: 0, n: 0, lp: 0, pass: false };
  o.n++; o.last = sc; o.best = Math.max(o.best, sc); o.fb = Object.assign({}, r, { at: Date.now() });
  o.h = (o.h || []).concat([{ sc, ok, at: Date.now() }]).slice(-5);
  if (ok) { o.pass = true; o.lp = Math.max(o.lp || 0, S.lan); }
  S.it[k] = o; save();
  if (!$('#res')) return;
  $('#res').innerHTML = `<p class="verdict ${ok ? 'ok' : 'no'}">${ok ? '✓ Đạt' : '✗ Chưa đạt – nghe mẫu và nói lại'} · <b>${sc}</b> điểm</p>${feedbackHtml(r, it.lang)}`;
  drawQList();
  if (ok) $('#next').classList.add('pulse');
}

/* ---------- kiểm tra tình huống ---------- */
let TV = null;   // bài đang làm (có cả bản ghi chưa lưu)
function viewTest() {
  nav('kiem-tra'); ensureNeed();
  const left = needLeft(), cfg = lanCfg(S.lan);
  if (S.ready && !S.cur) {
    app().innerHTML = `<section class="card ready"><h2>Bạn đã qua cả 4 lần</h2><p>Bạn vẫn có thể làm thêm một đề mới để giữ phản xạ.</p><button class="btn" id="them">Làm thêm một đề</button></section>`;
    $('#them').onclick = () => { S.cur = makeTest(); S.cur.lan = HOST_LAN.length; S.cur.them = true; save(); TV = S.cur; testIntro(); };
    return;
  }
  if (left.length && !S.cur) {
    app().innerHTML = `<section class="card"><h2>${esc(cfg.ten)}</h2><p>Bạn cần luyện đạt thêm <b>${left.length}</b> câu trước khi làm bài kiểm tra của lần này.</p><button class="btn" data-go="luyen">Đi luyện</button></section>`;
    return;
  }
  if (!S.cur) { S.cur = makeTest(); save(); }
  TV = S.cur; testIntro();
}
function testIntro() {
  const cfg = lanCfg(TV.lan);
  if (TV.i > 0) return testQ();
  app().innerHTML = `<section class="card narrow">
    <h2>${esc(cfg.ten)} · Bài kiểm tra ${TV.n} tình huống</h2>
    <ol class="how"><li>Mỗi câu hiện một tình huống bằng tiếng Việt và ghi rõ phải nói <b>tiếng Anh</b> hay <b>tiếng Trung</b>.</li>
      <li>Đọc thầm, rồi nói ngay câu host cần nói. Micro tự nghe và tự dừng khi bạn ngừng nói.</li>
      <li>Thời gian từ lúc hiện tình huống đến lúc bạn bắt đầu nói là <b>phản xạ</b>; quá ${SLOW} giây tính là chậm.</li>
      <li>Có tình huống phải nói liền 2–3 câu theo đúng thứ tự.</li>
      <li>Cần đúng từ <b>${cfg.pass}%</b> để qua lần này. Làm lại sẽ là một đề mới.</li></ol>
    <button class="btn" id="bd">Bắt đầu</button></section>`;
  $('#bd').onclick = async () => { if (!(await micInit())) { alert('Bạn cho phép trình duyệt dùng micro rồi thử lại.'); return; } testQ(); };
}
async function testQ() {
  const x = TV.items[TV.i]; if (!x) return testEnd();
  const s = HOST_SIT[x.si];
  app().innerHTML = `<section class="card test">
    <div class="row between"><span class="muted">Câu ${TV.i + 1}/${TV.n}</span><span class="muted" id="clock">0.0 giây</span></div>
    <div class="bar thin"><i style="width:${Math.round(100 * TV.i / TV.n)}%"></i></div>
    <div class="ask"><span class="lg big ${x.lang}">Nói bằng ${LANG[x.lang].n.toUpperCase()} · ${LANG[x.lang].b}</span>${s.all ? `<span class="tag warn">Nói liền ${s.ok.length} câu</span>` : ''}</div>
    <p class="sit">${esc(x.txt)}</p>
    <div class="meter"><i id="lvl"></i></div><p class="live" id="live"></p>
    <div class="row"><button class="btn ghost" id="stop">■ Dừng nghe</button><button class="btn ghost" id="skip">Bỏ qua câu này</button></div>
    <div id="res"></div></section>`;
  const t0 = performance.now();
  const clock = setInterval(() => { const el = $('#clock'); if (el) el.textContent = ((performance.now() - t0) / 1000).toFixed(1) + ' giây'; }, 100);
  let skipped = false;
  $('#stop').onclick = () => REC.stop && REC.stop();
  $('#skip').onclick = () => { skipped = true; REC.stop && REC.stop(); };
  const simText = s.ok.map(c => x.lang === 'zh' ? HOST_LINES[c].zh : HOST_LINES[c].en).slice(0, s.all ? 9 : 1).join(' ');
  const rec = await recordOnce({ lang: x.lang, waitMs: 15000, silenceMs: s.all ? 1800 : 1300, maxMs: s.all ? 25000 : 12000, simText,
    onLevel: (v, on) => { const el = $('#lvl'); if (el) { el.style.width = (v * 100) + '%'; el.classList.toggle('on', on); } },
    onPartial: t => { const el = $('#live'); if (el) el.textContent = t; } });
  clearInterval(clock);
  if (!$('#res')) return;
  x.rt = rec.onset == null ? null : +(rec.onset / 1000).toFixed(1);
  let r;
  if (skipped || rec.onset == null) r = { nghe_duoc: '', khop: '', loi: [], nhan_xet: skipped ? 'Bạn bỏ qua câu này.' : 'Không nghe thấy câu trả lời trong 15 giây.', skip: true };
  else { $('#res').innerHTML = '<p class="muted">Đang chấm…</p>'; $('#stop').disabled = true; r = await chamBanGhi(rec, { lang: x.lang, codes: s.ok, all: !!s.all, mode: 'kiemtra', sit: x.txt }); }
  x.ok = !r.skip && testPass(r, x.lang, s);
  x.heard = r.nghe_duoc || rec.heard || ''; x.khop = r.khop || ''; x.fb = r.nhan_xet || ''; x.loi = r.loi || [];
  x.sc = r.skip ? 0 : composite(r, x.lang); x.chrome = !!r.chrome;
  x.webm = rec.webm || null;
  x.tries = (x.tries || 0) + 1;
  S.cur = TV; save();
  showAnswer(x, s, r);
}
function showAnswer(x, s, r) {
  const ans = s.ok.map(c => `<div class="ans"><span class="code">${c}</span> ${lineHtml(c, x.lang)} ${sampleBtn(c, x.lang, 'Mẫu')}</div>`).join('');
  $('#res').innerHTML = `
    <p class="verdict ${x.ok ? 'ok' : 'no'}">${x.ok ? '✓ Đúng' : '✗ Chưa đạt'}${x.rt != null ? ` · phản xạ <b class="${x.rt > SLOW ? 'slow' : ''}">${x.rt} giây</b>` : ''}</p>
    ${r.skip ? '' : feedbackHtml(r, x.lang)}
    <p class="muted">${s.all ? 'Cần nói đủ, đúng thứ tự:' : s.ok.length > 1 ? 'Nói một trong các câu sau là đúng:' : 'Câu cần nói:'}</p>${ans}
    <div class="row">${x.tries < 2 ? '<button class="btn ghost" id="again">⟲ Nói lại (còn 1 lần)</button>' : ''}<button class="btn" id="nx">${TV.i + 1 < TV.n ? 'Câu tiếp →' : 'Xem kết quả'}</button></div>`;
  $$('#stop,#skip').forEach(b => b.remove());
  const a = $('#again'); if (a) a.onclick = () => testQ();
  $('#nx').onclick = () => { TV.i++; S.cur = TV; save(); testQ(); };
}
async function testEnd() {
  const t = TV, cfg = lanCfg(t.lan);
  const recs = t.items.map(x => x.webm);
  finishTest(t);
  const done = S.tests[S.tests.length - 1];
  const wrong = done.items.filter(x => !x.ok);
  app().innerHTML = `<section class="card ${done.pass ? 'ready' : ''}">
    <h2>${done.pass ? 'Qua ' + esc(cfg.ten) : 'Chưa qua lần này'} · ${done.pct}%</h2>
    <p>Đúng <b>${done.nOk}/${done.n}</b> tình huống (cần ${cfg.pass}%). Phản xạ chậm (quá ${SLOW} giây): <b>${done.slow}</b> câu.</p>
    <p class="muted" id="luu">Đang lưu bản ghi để chị Duyên nghe lại…</p>
    ${done.pass ? (S.ready ? '<p><b>Bạn đã sẵn sàng lên sóng.</b></p>' : `<p>Lần ${S.lan} đã mở. Các câu bạn nói chưa đạt được đưa vào danh sách cần luyện.</p>`) : '<p>Luyện lại các câu dưới đây rồi làm đề mới (đề sẽ khác lần này).</p>'}
    ${wrong.length ? `<h3>Câu chưa đạt</h3>${wrong.map(x => `<div class="wr"><p class="sit sm">${esc(x.txt)} <span class="lg ${x.lang}">${LANG[x.lang].b}</span></p>${HOST_SIT[x.si].ok.map(c => `<div class="ans">${lineHtml(c, x.lang)} ${sampleBtn(c, x.lang, 'Mẫu')}</div>`).join('')}${x.heard ? `<p class="heard"><span class="muted">Bạn nói:</span> ${esc(x.heard)}</p>` : ''}</div>`).join('')}` : ''}
    <div class="row"><button class="btn" data-go="lo-trinh">Về lộ trình</button>${wrong.length ? '<button class="btn ghost" id="luyenSai">Luyện các câu chưa đạt</button>' : ''}</div></section>`;
  const ls = $('#luyenSai');
  if (ls) ls.onclick = () => { const ks = []; wrong.forEach(x => HOST_SIT[x.si].ok.forEach(c => { const k = c + '|' + x.lang; if (!ks.includes(k)) ks.push(k); })); go('luyen', { only: ks }); };
  /* lưu bài và bản ghi lên máy chủ */
  if (db) {
    try {
      const items = [];
      for (let i = 0; i < done.items.length; i++) { const x = done.items[i]; items.push({ si: x.si, txt: x.txt, lang: x.lang, ok: !!x.ok, rt: x.rt, heard: x.heard || '', khop: x.khop || '', fb: x.fb || '', sc: x.sc || 0, loi: x.loi || [], rec: await blobToB64(recs[i]) }); }
      await R('answers/ghi_' + done.id + '/' + uid).set({ tk: ST.tk, ten: S.ten, lan: done.lan, at: done.at, pct: done.pct, pass: done.pass, items });
      await pushRemote();
      const el = $('#luu'); if (el) el.textContent = 'Đã lưu bài và bản ghi lên máy chủ.';
    } catch (e) { const el = $('#luu'); if (el) el.textContent = 'Chưa lưu được bản ghi lên máy chủ (kết quả vẫn giữ trên máy này).'; }
  } else { const el = $('#luu'); if (el) el.textContent = MOCK ? 'Đang chạy thử: không lưu lên máy chủ.' : ''; }
}

/* ---------- thư viện câu (nghe mẫu nhanh) ---------- */
function viewLib() {
  nav('thu-vien');
  app().innerHTML = `<section class="card"><h2>Thư viện câu</h2><p class="muted">Toàn bộ ${Object.keys(HOST_LINES).length} câu của kịch bản, chia theo phần. ★ là câu cốt lõi. Bấm ▶ để nghe mẫu, bấm 🎙 để luyện câu đó.</p></section>` +
    HOST_SEC.map(sec => `<section class="card"><h3>${esc(sec.n)}</h3><div class="lib">${Object.values(HOST_LINES).filter(l => l.sec === sec.id).map(l => `
      <div class="li"><div class="lh"><span class="code">${l.code}</span><span class="star">${l.star ? '★' : '☆'}</span><span class="muted">${esc(l.note)}</span></div>
        <div class="lr"><span class="lg en">EN</span>${lineHtml(l.code, 'en')}<span class="sp"></span>${sampleBtn(l.code, 'en', '')}<button class="btn ghost sm" data-luyen="${l.code}|en">🎙</button>${statusChip(l.code + '|en')}</div>
        <div class="lr"><span class="lg zh">中文</span>${lineHtml(l.code, 'zh')}<span class="sp"></span>${sampleBtn(l.code, 'zh', '')}<button class="btn ghost sm" data-luyen="${l.code}|zh">🎙</button>${statusChip(l.code + '|zh')}</div>
        ${l.rep ? `<p class="muted sm">Bé đáp: ${esc(l.rep)}</p>` : ''}</div>`).join('')}</div></section>`).join('');
  $$('[data-luyen]').forEach(b => b.onclick = () => go('luyen', { only: [b.dataset.luyen] }));
}

/* ======================= trang kết quả của chị (?ket-qua) ======================= */
async function viewResults() {
  document.body.classList.add('kq');
  $('#nav').innerHTML = ''; $('#who').innerHTML = '';
  app().innerHTML = '<section class="card"><h2>Kết quả luyện của host</h2><p class="muted">Đang tải…</p></section>';
  if (!(await fbInit())) { app().innerHTML = '<section class="card"><p class="msg err">Chưa kết nối được máy chủ dữ liệu.</p></section>'; return; }
  const pl = (await R('players').get()).val() || {};
  const tks = [...new Set(Object.values(pl).map(p => p.tk).filter(Boolean))];
  const hosts = {};
  for (const tk of tks) {
    const all = (await R('answers/acc_' + tk).get()).val() || {};
    Object.values(all).forEach(v => { let s = null; try { s = JSON.parse(v.s); } catch (e) { } if (s && (!hosts[tk] || v.at > hosts[tk].at)) hosts[tk] = { id: tk, tk, at: v.at, s }; });
  }
  const list = Object.values(hosts).sort((a, b) => b.at - a.at);
  if (!list.length) { app().innerHTML = '<section class="card"><h2>Kết quả luyện của host</h2><p>Chưa có host nào luyện.</p></section>'; return; }
  app().innerHTML = `<section class="card"><h2>Kết quả luyện của host</h2><p class="muted">Cập nhật ${fmtTime(Date.now())}. Bấm vào một bài kiểm tra để nghe lại từng câu host nói.</p></section>` +
    list.map(h => {
      const s = h.s, star = KEYS.filter(k => HOST_LINES[k.split('|')[0]].star);
      const ok = KEYS.filter(k => s.it[k] && s.it[k].pass).length, okStar = star.filter(k => s.it[k] && s.it[k].pass).length;
      const avg = l => { const ks = KEYS.filter(k => k.endsWith('|' + l) && s.it[k] && s.it[k].n); return ks.length ? Math.round(ks.reduce((a, k) => a + s.it[k].best, 0) / ks.length) : '–'; };
      const weak = KEYS.filter(k => s.it[k] && s.it[k].n).sort((a, b) => s.it[a].best - s.it[b].best).slice(0, 10);
      const notYet = star.filter(k => !s.it[k] || !s.it[k].pass);
      return `<section class="card host">
        <div class="row between"><h3>${esc(s.ten)} <span class="muted sm">· tài khoản ${esc(h.tk)}</span></h3><span class="tag ${s.ready ? 'okt' : ''}">${s.ready ? 'Sẵn sàng lên sóng' : 'Đang ở ' + esc(lanCfg(s.lan).ten)}</span></div>
        <p class="muted">Hoạt động gần nhất ${fmtTime(h.at)}</p>
        <div class="stats"><div><b>${ok}/${KEYS.length}</b><span>câu đã luyện đạt</span></div><div><b>${okStar}/${star.length}</b><span>câu ★ đạt</span></div>
          <div><b>${avg('en')}</b><span>điểm TB tiếng Anh</span></div><div><b>${avg('zh')}</b><span>điểm TB tiếng Trung</span></div></div>
        <h4>Các bài kiểm tra</h4>
        ${s.tests.length ? `<table class="tb"><thead><tr><th>Lần</th><th>Ngày</th><th>Đúng</th><th>Phản xạ chậm</th><th>Kết quả</th><th></th></tr></thead><tbody>${s.tests.slice().reverse().map(t => `<tr><td>${t.lan}</td><td>${fmtTime(t.at)}</td><td>${t.nOk}/${t.n} (${t.pct}%)</td><td>${t.slow}</td><td>${t.pass ? '<span class="chip ok">Qua</span>' : '<span class="chip no">Chưa qua</span>'}</td><td><button class="btn ghost sm" data-ghi="${t.id}" data-uid="${h.id}">Nghe lại</button></td></tr><tr class="det" id="d_${t.id}"><td colspan="6"></td></tr>`).join('')}</tbody></table>` : '<p class="muted">Chưa làm bài kiểm tra.</p>'}
        ${weak.length ? `<h4>10 câu điểm thấp nhất</h4><ul class="weak">${weak.map(k => { const it = itemOf(k), f = s.it[k].fb; return `<li><span class="code">${it.c}</span> ${lineHtml(it.c, it.lang)} <span class="chip ${s.it[k].pass ? 'ok' : 'no'}">${s.it[k].best}</span>${f && f.loi && f.loi.length ? `<span class="muted sm"> ${f.loi.map(e => esc(e.tu) + ': ' + esc(e.van_de)).join('; ')}</span>` : ''}</li>`; }).join('')}</ul>` : ''}
        ${notYet.length ? `<p class="muted">Còn <b>${notYet.length}</b> câu ★ chưa đạt${notYet.length <= 20 ? ': ' + notYet.map(k => k.replace('|', ' ')).join(', ') : ''}.</p>` : ''}
        ${practiced(s).length ? `<div class="row"><button class="btn ghost sm" data-pfb="${h.id}">Xem phản hồi AI khi luyện (${practiced(s).length} câu)</button></div><div id="pfb_${h.id}"></div>` : ''}
      </section>`;
    }).join('');
  /* phản hồi AI của lần luyện gần nhất từng câu, câu mới luyện lên đầu */
  $$('[data-pfb]').forEach(b => b.onclick = () => {
    const box = $('#pfb_' + b.dataset.pfb); if (box.innerHTML) { box.innerHTML = ''; return; }
    const s = Object.values(hosts).find(h => h.id === b.dataset.pfb).s;
    box.innerHTML = practiced(s).map(k => {
      const it = itemOf(k), o = s.it[k], f = o.fb || {};
      const sub = f.chrome ? `Khớp chữ ${f.noi_dung}` : [['Nội dung', f.noi_dung], ['Phát âm', f.phat_am], ['Thanh điệu', it.lang === 'zh' ? f.thanh_dieu : -1], ['Ngữ điệu', f.nhip]].filter(x => x[1] >= 0).map(x => x[0] + ' ' + x[1]).join(' · ');
      const hist = (o.h || []).map(x => `<span class="chip ${x.ok ? 'ok' : 'no'}">${x.sc}</span>`).join(' ');
      return `<div class="gi ${o.pass ? 'ok' : 'no'}">
        <p><span class="code">${it.c}</span> <span class="lg ${it.lang}">${LANG[it.lang].b}</span> ${lineHtml(it.c, it.lang)}</p>
        <p class="sm">${o.pass ? '✓ Đạt' : '✗ Chưa đạt'} · ${o.n} lần nói · cao nhất <b>${o.best}</b> · lần cuối <b>${o.last}</b>${f.at ? ' · ' + fmtTime(f.at) : ''}${hist ? ' · các lần gần nhất: ' + hist : ''}</p>
        <p class="sm muted">${esc(sub)}</p>
        ${f.nghe_duoc ? `<p class="sm"><span class="muted">Máy nghe được:</span> ${esc(f.nghe_duoc)}</p>` : ''}
        ${f.loi && f.loi.length ? `<ul class="errs sm">${f.loi.map(e => `<li><b>${esc(e.tu)}</b> – ${esc(e.van_de)}</li>`).join('')}</ul>` : ''}
        ${f.nhan_xet ? `<p class="sm fb">${esc(f.nhan_xet)}</p>` : ''}</div>`;
    }).join('');
  });
  $$('[data-ghi]').forEach(b => b.onclick = async () => {
    const row = $('#d_' + b.dataset.ghi + ' td'); if (row.innerHTML) { row.innerHTML = ''; return; }
    row.innerHTML = '<p class="muted">Đang tải bản ghi…</p>';
    const g = (await R('answers/ghi_' + b.dataset.ghi).get()).val() || {};
    const v = Object.values(g).find(x => x.tk === b.dataset.uid) || Object.values(g)[0];
    if (!v) { row.innerHTML = '<p class="muted">Không có bản ghi (bài làm trên máy chưa kết nối máy chủ).</p>'; return; }
    row.innerHTML = v.items.map((x, i) => `<div class="gi ${x.ok ? 'ok' : 'no'}"><p><b>${i + 1}.</b> ${esc(x.txt)} <span class="lg ${x.lang}">${LANG[x.lang].b}</span> ${x.ok ? '✓' : '✗'}${x.rt != null ? ` · ${x.rt} giây` : ''}</p>
      <div class="row">${x.rec ? `<audio controls preload="none" src="${x.rec}"></audio>` : '<span class="muted">không có bản ghi</span>'}</div>
      <p class="sm"><span class="muted">Máy nghe được:</span> ${esc(x.heard)}</p>
      <div class="sm">${HOST_SIT[x.si].ok.map(c => lineHtml(c, x.lang)).join(' · ')}</div>
      ${x.fb ? `<p class="sm fb">${esc(x.fb)}</p>` : ''}</div>`).join('');
  });
}

/* ======================= phím tắt ======================= */
document.addEventListener('keydown', e => {
  if (e.code !== 'Space' || /input|select|textarea/i.test(e.target.tagName)) return;
  const b = $('#noi'); if (b) { e.preventDefault(); b.click(); return; }
  if ($('#stop') && REC.busy) { e.preventDefault(); REC.stop && REC.stop(); }
});

/* ======================= khởi động ======================= */
(async function start() {
  if (KQ) return viewResults();
  if (!S || !ST.tk) return viewLogin();
  ensureNeed();
  const h = location.hash.replace('#', '');
  const view = ['lo-trinh', 'luyen', 'kiem-tra', 'thu-vien'].includes(h) ? h : 'lo-trinh';
  go(view);
  /* lấy bản mới hơn nếu host vừa luyện ở máy khác; quay lại tab cũng kiểm tra lại */
  fbInit().then(async () => { if (await syncFromRemote()) { ensureNeed(); go(view); setSync('Đã lấy tiến độ mới nhất từ máy khác'); } else pushRemote(); });
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible' && await syncFromRemote()) { ensureNeed(); LQ.list = []; go('lo-trinh'); setSync('Đã lấy tiến độ mới nhất từ máy khác'); }
  });
})();
