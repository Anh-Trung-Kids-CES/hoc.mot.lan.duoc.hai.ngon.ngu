/* Lớp Zoom – phần dùng chung cho màn con (index.html) và màn cô (co.html).
   Đợt 1: Little Seed · Vòng 2 "Giới thiệu bản thân" (Zoom ngày 14, Chủ nhật 8/11/2026).
   Đồng bộ: Firebase Realtime Database (dự án anh-trung-kids-zoom). Thêm ?mock=1 để thử trên một máy không cần Firebase. */

const LZ_FIREBASE = {
  apiKey: "AIzaSyAYoYO7PFPBCdt9JkRVixXef5cF5Djh5ng",
  authDomain: "anh-trung-kids-zoom.firebaseapp.com",
  databaseURL: "https://anh-trung-kids-zoom-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "anh-trung-kids-zoom",
  storageBucket: "anh-trung-kids-zoom.firebasestorage.app",
  messagingSenderId: "1029047261945",
  appId: "1:1029047261945:web:1ff02524454503361fa028"
};
/* Máy chủ Apps Script của web học (cùng link SCORE_API trong xem-truoc/index.html) – nhận kết quả buổi Zoom và hồ sơ chuẩn bị. */
const LZ_API = "https://script.google.com/macros/s/AKfycbwsLupVsEa0jqsJ5UDtU1KciL7AiniAhYQk_YZ5N05HESfL6pmSQjcImzZ8nyH9sQ9Lsg/exec";

const QS = new URLSearchParams(location.search);
const LZ_MOCK = QS.has('mock');

/* ======================= Khoá của buổi Zoom =======================
   Mỗi phòng ghi khoá ở state.lop. Trang tải nội dung theo ?lop= (mặc định Little Seed Vòng 2).
   Nội dung Canopy nằm trong lz-canopy.js, Little Seed Vòng 3 trong lz-seed-v3.js: các tệp đó gán lại các biến nội dung bên dưới.
   huy: tên huy hiệu cuối buổi theo chặng (Vòng 2 Bứt phá, Vòng 3 Chinh phục). */
const LZ_LOPS = {
  'seed-v2':   { ten: 'Little Seed · Vòng 2', chude: 'Giới thiệu bản thân', khoa: 'seed', vong: 2, huy: 'Bứt phá' },
  'canopy-v2': { ten: 'Canopy · Vòng 2', chude: 'Jobs – Ghé thăm nơi làm việc', khoa: 'canopy', vong: 2, huy: 'Bứt phá' },
  'seed-v3':   { ten: 'Little Seed · Vòng 3', chude: 'Gia đình – Album ảnh nhà Bông', khoa: 'seed', vong: 3, huy: 'Chinh phục' },   // nội dung trong lz-seed-v3.js (Zoom ngày 21)
};
const LZ_LOP = LZ_LOPS[QS.get('lop')] ? QS.get('lop') : 'seed-v2';
const LZ_CFG = LZ_LOPS[LZ_LOP];
/* đường dẫn của trang hiện tại với khoá khác (giữ các tham số thử như mock, thu, headsim) */
function lopUrl(lop, extra) {
  const q = new URLSearchParams(location.search); q.set('lop', lop);
  Object.entries(extra || {}).forEach(([k, v]) => v === null ? q.delete(k) : q.set(k, v));
  return location.pathname + '?' + q.toString();
}

/* ======================= tiện ích ======================= */
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function lsGet(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
function normName(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'd').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
function rid(p) { return (p || '') + Math.random().toString(36).slice(2, 9); }
function shuffleSeeded(a, seed) { a = a.slice(); let s = seed || 1; for (let i = a.length - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; const j = Math.floor(s / 233280 * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }
function today() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

/* ======================= Kết nối dữ liệu =======================
   Một giao diện nhỏ để màn con / màn cô không phụ thuộc Firebase trực tiếp:
   DB.init(), DB.uid, DB.now(), DB.get(p), DB.set(p,v), DB.update(p,obj), DB.remove(p), DB.on(p,cb)→off, DB.onDisc(p,v), DB.onConn(cb) */
function fbDB() {
  let db = null, uid = '', off = 0;
  return {
    async init(opt) {
      firebase.initializeApp(LZ_FIREBASE);
      const auth = firebase.auth();
      if (opt && opt.perTab) { try { await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION); } catch (e) { } }
      const user = await new Promise(res => { const u = auth.onAuthStateChanged(x => { u(); res(x); }); });
      uid = user ? user.uid : (await auth.signInAnonymously()).user.uid;
      db = firebase.database();
      db.ref('.info/serverTimeOffset').on('value', s => { off = s.val() || 0; });
    },
    get uid() { return uid; },
    now() { return Date.now() + off; },
    async get(p) { return (await db.ref(p).get()).val(); },
    set(p, v) { return db.ref(p).set(v); },
    update(p, v) { return db.ref(p).update(v); },
    remove(p) { return db.ref(p).remove(); },
    on(p, cb) { const r = db.ref(p), h = s => cb(s.val()); r.on('value', h); return () => r.off('value', h); },
    onDisc(p, v) { db.ref(p).onDisconnect().set(v); },
    onConn(cb) { db.ref('.info/connected').on('value', s => cb(!!s.val())); }
  };
}

/* Bản thử không cần mạng: dữ liệu nằm trong localStorage, các tab cùng máy thấy nhau.
   Kiểm tra quyền ghi giống hệt luật bảo mật bản 1 để bắt lỗi trước khi chạy thật. */
function mockDB() {
  const KEY = 'lz-mock-db';
  let uid = sessionStorage.getItem('lz-mock-uid');
  if (!uid) { uid = rid('u'); sessionStorage.setItem('lz-mock-uid', uid); }
  const subs = [], disc = [];
  const tree = () => lsGet(KEY, {}) || {};
  const at = (t, p) => p.split('/').filter(Boolean).reduce((o, k) => (o && typeof o === 'object') ? o[k] : undefined, t);
  function put(t, p, v) {
    const ks = p.split('/').filter(Boolean); let o = t;
    for (let i = 0; i < ks.length - 1; i++) { if (!o[ks[i]] || typeof o[ks[i]] !== 'object') o[ks[i]] = {}; o = o[ks[i]]; }
    const last = ks[ks.length - 1];
    if (v === null || v === undefined) delete o[last]; else o[last] = JSON.parse(JSON.stringify(v));
  }
  function allowed(t, p) {
    const s = p.split('/').filter(Boolean);
    if (s[0] !== 'rooms' || s.length < 3) return false;
    const room = s[1], teacher = at(t, `rooms/${room}/teacher`);
    if (s[2] === 'teacher') return s.length === 3 && (teacher == null || teacher === uid);
    if (s[2] === 'state' || s[2] === 'marks') return teacher === uid;
    if (s[2] === 'players') return s.length >= 4 && (s[3] === uid || teacher === uid);
    if (s[2] === 'answers') return s.length >= 5 && s[4] === uid;
    return false;
  }
  function write(changes) {
    const t = tree();
    for (const [p] of changes) if (!allowed(t, p)) { const e = new Error('PERMISSION_DENIED ' + p); console.error(e); return Promise.reject(e); }
    for (const [p, v] of changes) put(t, p, v);
    lsSet(KEY, t); fire(); return Promise.resolve();
  }
  function fire() {
    const t = tree();
    subs.forEach(s => { const v = at(t, s.p), j = JSON.stringify(v === undefined ? null : v); if (j !== s.j) { s.j = j; s.cb(v === undefined ? null : JSON.parse(j)); } });
  }
  addEventListener('storage', e => { if (e.key === KEY) fire(); });
  addEventListener('pagehide', () => { if (disc.length) { const t = tree(); disc.forEach(([p, v]) => { if (allowed(t, p)) put(t, p, v); }); lsSet(KEY, t); } });
  return {
    async init() { },
    get uid() { return uid; },
    now() { return Date.now(); },
    async get(p) { const v = at(tree(), p); return v === undefined ? null : v; },
    set(p, v) { return write([[p, v]]); },
    update(p, o) { return write(Object.entries(o).map(([k, v]) => [p.replace(/\/$/, '') + '/' + k, v])); },
    remove(p) { return write([[p, null]]); },
    on(p, cb) { const s = { p, cb, j: undefined }; subs.push(s); setTimeout(fire, 0); return () => { const i = subs.indexOf(s); if (i >= 0) subs.splice(i, 1); }; },
    onDisc(p, v) { disc.push([p, v]); },
    onConn(cb) { cb(true); }
  };
}
const DB = LZ_MOCK ? mockDB() : fbDB();
const roomPath = code => 'rooms/' + code;

/* ======================= Nội dung Vòng 2 =======================
   Tranh và giọng lấy từ web học 21 ngày (xem-truoc/tai-nguyen/little-seed). Không thêm từ ngoài định mức. */
const TN = '../xem-truoc/tai-nguyen/';
const AU = TN + 'little-seed/audio/', IM = TN + 'little-seed/img/';
let W = {   // 8 từ
  name:  { en: 'name',  zh: '名字', py: 'míngzi', ea: 'ls_co_huou_en_name',  za: 'ls_co_huou_zh_020', im: 'v2_n8_tu_name' },
  you:   { en: 'you',   zh: '你',   py: 'nǐ',     ea: 'ls_co_huou_en_you',   za: 'ls_co_huou_zh_023', im: 'v2_n9_tu_you' },
  one:   { en: 'one',   zh: '一',   py: 'yī',     ea: 'ls_co_huou_en_one',   za: 'ls_co_huou_zh_026', im: 'v2_n10_tu_one' },
  two:   { en: 'two',   zh: '二',   py: 'èr',     ea: 'ls_co_huou_en_two',   za: 'ls_co_huou_zh_027', im: 'v2_n10_tu_two' },
  three: { en: 'three', zh: '三',   py: 'sān',    ea: 'ls_co_huou_en_three', za: 'ls_co_huou_zh_028', im: 'v2_n10_tu_three' },
  four:  { en: 'four',  zh: '四',   py: 'sì',     ea: 'ls_co_huou_en_four',  za: 'ls_co_huou_zh_031', im: 'v2_n11_tu_four' },
  five:  { en: 'five',  zh: '五',   py: 'wǔ',     ea: 'ls_co_huou_en_five',  za: 'ls_co_huou_zh_032', im: 'v2_n11_tu_five' },
  six:   { en: 'six',   zh: '六',   py: 'liù',    ea: 'ls_co_huou_en_six',   za: 'ls_co_huou_zh_033', im: 'v2_n11_tu_six' },
  // 6 cụm (Nice to meet you! chỉ nghe)
  wyn: { en: "What's your name?", zh: '你叫什么？', ea: 'ls_co_huou_en_what_s_your_name', za: 'ls_co_huou_zh_024', im: 'v2_n9_cum_what_s_your_name' },
  mna: { en: 'My name is Anna.', zh: '我叫Anna。', ea: 'ls_anna_en_my_name_is_anna', za: 'ls_anna_zh_015', im: 'v2_n8_cum_my_name_is_anna' },
  ntm: { en: 'Nice to meet you!', zh: '很高兴认识你！', ea: 'ls_bong_en_nice_to_meet_you', za: 'ls_co_huou_zh_025', im: 'v2_n9_cum_nice_to_meet_you', nghe: true },
  hoy: { en: 'How old are you?', zh: '你几岁？', ea: 'ls_anna_en_how_old_are_you', za: 'ls_co_huou_zh_036', im: 'v2_n11_cau_how_old_are_you' },
  i5:  { en: "I'm five.", zh: '我五岁。', ea: 'ls_anna_en_i_m_five', za: 'ls_anna_zh_014', im: 'v2_n11_cum_i_m_five' },
  i6:  { en: "I'm six!", zh: '我六岁！', ea: 'ls_bong_en_i_m_six', za: 'ls_bong_zh_012', im: 'v2_n11_cum_i_m_six' },
  n123:{ en: 'One, two, three!', zh: '一、二、三！', ea: 'ls_bong_en_one_two_three', za: 'ls_anna_zh_016', im: 'v2_n10_cum_one_two_three' },
};
let PIC_ANNA = TN + 'nhan-vat/kids_anna_a.webp', PIC_BONG = TN + 'nhan-vat/kids_bong_a.webp';
function pic(k, v) { return IM + W[k].im + '_l' + (v || 2) + '.webp'; }
function aud(k, l) { const w = W[k]; const f = l === 'zh' ? w.za : w.ea; return f ? AU + f + '.mp3' : ''; }
function txt(k, l) { return l === 'zh' ? W[k].zh : W[k].en; }

/* Ôn nhanh: 10 câu chạm 1 trong 3 tranh (4 EN, 4 ZH, 2 nhìn chữ) */
let QUIZ = [
  { k: 'name',  l: 'en', o: ['you', 'name', 'three'] },
  { k: 'you',   l: 'zh', o: ['you', 'six', 'name'] },
  { k: 'three', l: 'en', o: ['one', 'two', 'three'] },
  { k: 'two',   l: 'zh', o: ['two', 'five', 'four'] },
  { k: 'i6',    l: 'en', o: ['i5', 'hoy', 'i6'] },
  { k: 'mna',   l: 'zh', o: ['mna', 'n123', 'i6'] },
  { k: 'five',  l: 'en', o: ['four', 'five', 'six'] },
  { k: 'six',   l: 'zh', o: ['three', 'six', 'one'] },
  { k: 'three', l: 'doc', chu: '三', a: 'zh', o: ['one', 'three', 'two'] },
  { k: 'anna',  l: 'doc', chu: 'Anna', a: 'en', o: ['bong', 'anna', 'one'], audio: AU + 'ls_co_huou_en_anna.mp3' },
];
function quizPics(q) { return q.o.map(k => k === 'anna' ? PIC_ANNA : k === 'bong' ? PIC_BONG : pic(k, 2)); }
function quizAns(q) { return q.o.indexOf(q.k); }
function quizAudio(q) { return q.audio || aud(q.k, q.l === 'doc' ? q.a : q.l); }
function quizLang(q) { return q.l === 'doc' ? 'doc' : q.l; }

/* Máy bay thanh điệu: thanh 1 ngang, 2 lên, 3 xuống rồi lên, 4 xuống */
let TONES = [
  { c: '一', py: 'yī', p0: 'yi', t: 1, k: 'one' },
  { c: '二', py: 'èr', p0: 'er', t: 4, k: 'two' },
  { c: '三', py: 'sān', p0: 'san', t: 1, k: 'three' },
  { c: '四', py: 'sì', p0: 'si', t: 4, k: 'four' },
  { c: '五', py: 'wǔ', p0: 'wu', t: 3, k: 'five' },
  { c: '六', py: 'liù', p0: 'liu', t: 4, k: 'six' },
  { c: '你', py: 'nǐ', p0: 'ni', t: 3, k: 'you' },
  { c: '叫', py: 'jiào', p0: 'jiao', t: 4, k: 'mna', a: AU + 'ls_co_huou_zh_jiao.mp3' },   // giọng cô Hươu đọc riêng chữ 叫 (tạo 04/11)
];
function toneAudio(x) { return x.a !== undefined ? x.a : aud(x.k, 'zh'); }
function tonePic(x) { return pic(x.k, 1); }
/* đường bay (SVG 100×60): mỗi thanh một đường */
const TONE_PATH = {
  1: 'M8 14 L92 14',
  2: 'M8 46 Q55 40 92 12',
  3: 'M8 26 Q35 58 55 52 Q75 46 92 22',
  4: 'M8 10 Q50 14 92 52'
};
const TONE_NAME = { 1: 'Bay ngang', 2: 'Bay lên', 3: 'Lượn xuống rồi lên', 4: 'Lao xuống' };
/* đường bay của lựa chọn thứ c (1–4): Little Seed chọn thẳng thanh 1–4; Canopy chọn 1 trong 4 cặp thanh của từ hai chữ (x.o, ví dụ 31 = thanh 3 rồi thanh 1) */
function toneOpt(x, c) { return x.o ? x.o[c - 1] : c; }
/* ghi chú thêm cho cô ở phần thanh điệu (Vòng 3: từ lặp) */
let TONE_TIP = '';
/* chữ trên màn thanh điệu: từ lặp (哥哥, 奶奶…) thì tiếng sau mờ đi vì đọc nhẹ, con chọn thanh của tiếng đầu */
function toneChar(x) { const c = String(x.c || ''); return c.length === 2 && c[0] === c[1] ? c[0] + '<span class="nhe">' + c[1] + '</span>' : c; }

/* Trò chơi đôi bạn: bé A thấy tranh và nói, bé B nghe rồi chạm 1 trong 3 tranh */
let PAIR_POOL = [
  { k: 'you', o: ['name', 'you', 'one'] }, { k: 'four', o: ['four', 'six', 'two'] },
  { k: 'i5', o: ['i6', 'i5', 'wyn'] }, { k: 'mna', o: ['mna', 'hoy', 'n123'] },
  { k: 'two', o: ['three', 'one', 'two'] }, { k: 'six', o: ['five', 'six', 'four'] },
  { k: 'wyn', o: ['wyn', 'i6', 'mna'] }, { k: 'one', o: ['one', 'you', 'five'] },
  { k: 'hoy', o: ['n123', 'hoy', 'i5'] }, { k: 'five', o: ['two', 'three', 'five'] },
  { k: 'name', o: ['you', 'four', 'name'] }, { k: 'i6', o: ['i6', 'mna', 'hoy'] },
];

/* Truyện 8 cảnh "Sinh nhật của Bông" */
let STORY = [
  { img: 'tr2_c1', en: 'One, two, three, four, five, six!', ea: 'ls_bong_en_one_two_three_four_five_six', zh: '一、二、三、四、五、六！', za: 'ls_bong_zh_010' },
  { img: 'tr2_c2', en: 'Hello! My name is Anna.', ea: 'ls_anna_en_hello_my_name_is_anna', zh: '你好！我叫Anna。', za: 'ls_anna_zh_010' },
  { img: 'tr2_c3', en: "What's your name?", ea: 'ls_anna_en_what_s_your_name', zh: '你叫什么？', za: 'ls_anna_zh_011' },
  { img: 'tr2_c4', en: 'My name is Bông.', ea: 'ls_bong_en_my_name_is_b_ng', zh: '我叫Bông。', za: 'ls_bong_zh_011' },
  { img: 'tr2_c5', en: 'Nice to meet you!', ea: 'ls_anna_en_nice_to_meet_you', zh: '很高兴认识你！', za: 'ls_anna_zh_012' },
  { img: 'tr2_c6', en: 'How old are you?', ea: 'ls_anna_en_how_old_are_you', zh: '你几岁？', za: 'ls_anna_zh_013' },
  { img: 'tr2_c7', en: "I'm six!", ea: 'ls_bong_en_i_m_six', zh: '我六岁！', za: 'ls_bong_zh_012' },
  { img: 'tr2_c8', en: "I'm five.", ea: 'ls_anna_en_i_m_five', zh: '我五岁。', za: 'ls_anna_zh_014' },
];
let STORY_TITLE = 'Sinh nhật của Bông';
function sceneImg(i) { return IM + STORY[i].img + '.webp'; }
function sceneAud(i, l) { return AU + (l === 'zh' ? STORY[i].za : STORY[i].ea) + '.mp3'; }
/* Phiên dịch nhí: 4 hộp quà, mỗi hộp một câu của truyện */
let GIFTS = [{ s: 1, from: 'en' }, { s: 2, from: 'zh' }, { s: 5, from: 'en' }, { s: 6, from: 'zh' }];

/* Nghe truyện, xếp tranh: 2 lượt chuyển ngữ, cả 2 lượt đều là nội dung Vòng 2 (truyện "Sinh nhật của Bông" chia đôi, đủ 8 câu).
   Lượt 1: cô phát tiếng Anh (đếm nến, Anna đến chào, làm quen, "I'm five."), các con xếp tranh có lời tiếng Trung.
   Lượt 2: cô phát tiếng Trung (你叫什么？ 我叫Bông。 你几岁？ 我六岁！), các con xếp tranh có lời tiếng Anh. */
function xepScene(i) { return { img: IM + STORY[i].img + '.webp', en: STORY[i].en, zh: STORY[i].zh, ea: AU + STORY[i].ea + '.mp3', za: AU + STORY[i].za + '.mp3' }; }
let XEP = [
  { title: 'Sinh nhật của Bông (phần 1)', from: 'en', to: 'zh', scenes: [0, 1, 4, 7].map(xepScene) },
  { title: 'Sinh nhật của Bông (phần 2): hỏi tên, hỏi tuổi', from: 'zh', to: 'en', scenes: [2, 3, 5, 6].map(xepScene) }
];
function xepAud(sc, l) { return l === 'zh' ? sc.za : sc.ea; }

/* Hình thức chọn đáp án theo từng phần, để buổi học có lúc tĩnh, lúc vận động:
   Ôn nhanh, Đôi bạn: chạm (tĩnh, tập trung nghe) · Cô giáo nhỏ: quay đầu (vận động nhẹ) · Đấu Rồng Lửa: quay đầu (vận động mạnh, ngắn)
   · Xếp tranh: chạm (lắng lại trước khi kết thúc). Cô bật/tắt từng phần trên màn cô (state.headIn). */
const HEAD_DEFAULT = { on: false, pair: false, lop: true, boss: true };
const HEAD_PHASES = Object.keys(HEAD_DEFAULT);
function headAllowed(st) { st = st || {}; const m = Object.assign({}, HEAD_DEFAULT, st.headIn || {}); return !!m[st.ph]; }
const HEAD_TAG = '<span class="flag hdtag">🙆 quay đầu để chọn</span>';

/* Chào bạn mới */
let INTRO = {
  ask: { en: { t: "What's your name?", a: aud('wyn', 'en') }, zh: { t: '你叫什么？', a: aud('wyn', 'zh') } },
  model: { en: { t: 'My name is …', a: AU + 'ls_bong_en_my_name_is_b_ng.mp3' }, zh: { t: '我叫…', a: AU + 'ls_bong_zh_011.mp3' } }
};

/* Nói theo cô (trước Ôn nhanh): cô đọc mẫu lần lượt từ → cụm → câu, mỗi tiếng xong có tiếng "tách" và khoảng lặng để cả lớp nói theo.
   Không chấm, không sửa lỗi riêng. "Nice to meet you!" chỉ nghe ở Little Seed nên không đưa vào phần nói theo. */
const NOI_GRP = { tu: 'Từ', cum: 'Cụm từ', cau: 'Câu' };
let NOI = ['name', 'you', 'one', 'two', 'three', 'four', 'five', 'six'].map(k => ({ k, g: 'tu' }))
  .concat(['n123', 'wyn', 'mna', 'hoy', 'i5', 'i6'].map(k => ({ k, g: 'cau' })));
/* khoảng lặng cho các con nói theo, tính theo độ dài câu mẫu vừa đọc (máy chiếu và màn cô dùng chung công thức) */
function noiGap(ms) { return Math.round(Math.max(1500, ms * 1.15 + 700)); }

/* Hát chào mở đầu (warm-up): video "Hello Song (你好歌)" của Little Fox Chinese, phát bằng trình phát YouTube nhúng
   (không chép video lên web). Chỉ màn chiếu / màn cô chia sẻ phát video; máy các con hiện lời bài hát để hát theo.
   Muốn đổi bài: thay id (đoạn sau watch?v= trên YouTube) và lời. */
const SONG = {
  id: 'm_rDIzj6DRE', ten: 'Hello Song · 你好歌', nguon: 'Little Fox Chinese',
  loi: [
    { zh: '你好！你好！', py: 'nǐ hǎo! nǐ hǎo!', vi: 'Hello!', tay: '👋 vẫy tay' },
    { zh: '早上好！早上好！', py: 'zǎoshang hǎo!', vi: 'Good morning!', tay: '🌞 giơ hai tay lên như mặt trời mọc' },
    { zh: '你好吗？', py: 'nǐ hǎo ma?', vi: 'How are you?', tay: '🤗 dang tay hỏi bạn' },
    { zh: '晚上好！晚上好！', py: 'wǎnshang hǎo!', vi: 'Good evening!', tay: '🌙 áp hai tay lên má' }
  ],
  /* lời cô Hươu giới thiệu (hiện chữ cho cô đọc; chưa có file giọng) */
  gioiThieu: [
    'Chào các con! Hôm nay mình mở đầu bằng một bài hát chào thật vui nhé!',
    'Các bạn thú trong bài hát chào nhau bằng tiếng Trung: 你好 nǐ hǎo, nghĩa là Hello!',
    'Nghe 你好 thì vẫy tay. Nghe 早上好 thì giơ hai tay lên như mặt trời mọc. Nghe 晚上好 thì áp hai tay lên má.',
    'Các con đứng dậy nào! Sẵn sàng chưa? 一、二、三！'
  ],
  sauBai: 'Giỏi quá! Cả lớp cùng chào nhau nào: Hello! 你好！'
};
function songSrc(auto, mute) { return 'https://www.youtube-nocookie.com/embed/' + SONG.id + '?rel=0&modestbranding=1&playsinline=1' + (auto ? '&autoplay=1' : '') + (mute ? '&mute=1' : ''); }
function songLyrics(big) {
  return `<div class="song-lyr${big ? ' big' : ''}">${SONG.loi.map(x => `<div class="sl"><b class="zh">${x.zh}</b><span class="slpy">${x.py}</span><small>${x.vi} · ${x.tay}</small></div>`).join('')}</div>`;
}

/* Đọc theo cô (phút 19–28): mỗi lượt cô Hươu đọc một từ/câu bằng tiếng Anh rồi tiếng Trung, cả lớp đọc theo;
   sau đó cô đọc lại bằng một tiếng (luân phiên EN / ZH), các con chạm chọn 1 trong 3 tranh trên máy mình. Dùng 6 mục đầu của PAIR_POOL. */
/* Chỉ dùng từ có tranh rõ nghĩa để chọn (08/11): Little Seed dùng số đếm (tranh đếm đồ vật); Canopy dùng nghề, nơi chốn, người trong nhà.
   Bỏ các từ/câu khó vẽ rõ (you, name, câu hỏi tên/tuổi…) vì tranh dễ gây nhầm. */
let DTC_N = 6;
let DTC_SEED = [
  { k: 'four', o: ['four', 'six', 'two'] }, { k: 'two', o: ['three', 'one', 'two'] }, { k: 'six', o: ['five', 'six', 'four'] },
  { k: 'one', o: ['one', 'three', 'five'] }, { k: 'five', o: ['two', 'three', 'five'] }, { k: 'three', o: ['six', 'three', 'one'] }
];
const DTC_CANOPY = ['chef', 'hospital', 'brother', 'dentist', 'restaurant', 'mom'];
function dtcList() {
  if (LZ_LOP !== 'canopy-v2') return DTC_SEED;
  const L = DTC_CANOPY.map(k => PAIR_POOL.find(x => x.k === k)).filter(Boolean);
  return L.length >= 3 ? L : PAIR_POOL.slice(0, DTC_N);
}
/* it.l: lượt này chọn tranh bằng tiếng nào (mặc định xen kẽ EN / ZH); it.chu: lượt tiếng Trung hiện kèm mặt chữ (他 / 她 cùng âm tā) */
function dtcItem(i) { const L = dtcList(), it = L[i % L.length]; return { k: it.k, o: it.o, l: it.l || (i % 2 ? 'zh' : 'en'), chu: it.chu || '' }; }

/* Cô nói, con nói tiếng kia (cuối buổi, 08/11/2026): mỗi con một tranh và một nội dung mẫu 2–3 câu theo mẫu câu của tuần.
   Cô (giọng cô Hươu) nói từng câu bằng tiếng Anh, con nói lại bằng tiếng Trung; lượt sau đổi chiều (cô nói tiếng Trung, con nói tiếng Anh).
   Little Seed không đưa "Nice to meet you!" vào phần con nói (từ này chỉ nghe). */
function cnLine(k) { return { en: W[k].en, zh: W[k].zh, ea: aud(k, 'en'), za: aud(k, 'zh'), py: W[k].py || '' }; }
function cnScene(i) { return { en: STORY[i].en, zh: STORY[i].zh, ea: sceneAud(i, 'en'), za: sceneAud(i, 'zh') }; }
function cnSets() {
  if (LZ_LOP === 'canopy-v2') return [
    { img: pic('s_dDoc'), lines: ['s_name', 's_dDoc', 's_hH'].map(cnLine) },
    { img: pic('s_mT'), lines: ['s_mT', 's_sS'].map(cnLine) },
    { img: pic('s_dC'), lines: ['q_dad', 's_dC'].map(cnLine) },
    { img: pic('s_emp'), lines: ['q_mom', 's_emp'].map(cnLine) },
    { img: pic('s_sisC'), lines: ['s_sisC', 's_love'].map(cnLine) },
    { img: pic('s_sat'), lines: ['s_sat', 's_love'].map(cnLine) }
  ];
  return [
    { img: sceneImg(1), lines: [cnScene(1), cnLine('i5')] },                 // Hello! My name is Anna. · I'm five.
    { img: sceneImg(3), lines: [cnLine('wyn'), cnScene(3), cnLine('i6')] },  // What's your name? · My name is Bông. · I'm six!
    { img: sceneImg(7), lines: [cnLine('hoy'), cnLine('i5')] },              // How old are you? · I'm five.
    { img: sceneImg(0), lines: [cnScene(0), cnLine('i6')] },                 // One, two, … six! · I'm six!
    { img: sceneImg(6), lines: [cnLine('hoy'), cnLine('i6')] },              // How old are you? · I'm six!
    { img: sceneImg(2), lines: [cnLine('wyn'), cnLine('mna'), cnLine('i5')] } // What's your name? · My name is Anna. · I'm five.
  ];
}
/* chiều của lượt t: lượt chẵn cô nói EN → con nói ZH, lượt lẻ ngược lại (cô đổi được) */
function cnDir(c) { return c && c.from === 'zh' ? { from: 'zh', to: 'en' } : { from: 'en', to: 'zh' }; }

/* Phân biệt hai chữ đồng âm (Vòng 3: 他 / 她 cùng đọc tā). Khoá nào có PB thì mạch buổi có thêm phần 'pb' (do tệp nội dung của khoá chèn vào PHASES).
   PB = { a: {chu, bo, ben, g:'he'}, b: {…, g:'she'}, vd: [câu ví dụ], luyen: [bài tập], loi: {lời cô Hươu} } – xem lz-seed-v3.js. */
let PB = null;
/* hình bộ chữ: 亻 vẽ người đứng (SVG), 女 dùng tranh bạn gái quỳ của web học ngày 19 */
function pbIcon(x, cls) {
  if (x.boImg) return `<img class="${cls || 'pb-ic'}" src="${x.boImg}" alt="">`;
  return `<svg class="${cls || 'pb-ic'}" viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="#2F80ED" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><circle cx="50" cy="19" r="11"/><path d="M50 31 V63 M50 41 L33 55 M50 41 L67 55 M50 63 L37 90 M50 63 L63 90"/></g></svg>`;
}
/* 亻 + 也 = 他 : bộ bên trái tô màu, phần bên phải giống nhau thì mờ */
function pbEq(x) { return `<div class="pb-eq ${x.g}"><span class="pb-bo">${x.bo}</span><b>+</b><span class="pb-ben">${x.ben}</span><b>=</b><span class="pb-chu">${x.chu}</span></div>`; }
/* câu có chữ 他 / 她 tô màu theo chữ */
function pbColor(t) { return esc(t).replace(/他/g, '<span class="pb-he">他</span>').replace(/她/g, '<span class="pb-she">她</span>'); }

/* Mạch 40 phút */
const PHASES = [
  { id: 'cho',   n: 'Chờ vào lớp',          m: '',      ic: '🚪' },
  { id: 'hat',   n: 'Hát chào',              m: '0–2',   ic: '🎵' },
  { id: 'intro', n: 'Chào bạn mới',          m: '2–5',   ic: '🎡' },
  { id: 'noi',   n: 'Nói theo cô',           m: '5–9',   ic: '🗣️' },
  { id: 'on',    n: 'Ôn nhanh',              m: '9–14',  ic: '⚡' },
  { id: 'tone',  n: 'Máy bay thanh điệu',    m: '14–19', ic: '✈️' },
  { id: 'dtc',   n: 'Đọc theo cô',           m: '19–28', ic: '📖' },   // thay Trò chơi đôi bạn + Cô giáo nhỏ (08/11/2026)
  { id: 'boss',  n: 'Cả lớp đấu Rồng Lửa',   m: '28–31', ic: '🐉' },
  { id: 'xep',   n: 'Nghe truyện, xếp tranh', m: '31–35', ic: '🧩' },
  { id: 'cn',    n: 'Cô nói, con nói tiếng kia', m: '35–38', ic: '🔁' },
  { id: 'badge', n: 'Huy hiệu ' + (LZ_CFG.huy || 'Bứt phá'), m: '38–40', ic: '🏅' },
];

/* Giọng cô Hươu (Gemini TTS, giọng Sulafat) đã có sẵn ở web học. Câu chưa có file thì chỉ hiện chữ – cô nói trên Zoom.
   Danh sách câu cần thu thêm: lop-zoom/GIONG-CAN-THU.md. Thu xong thì thêm vào đây: "câu": "đường dẫn". */
const HD = {
  'Chào con! Cô là cô Hươu.': AU + 'ls_co_huou_vi_041.mp3',
  'Con nghe và chạm vào tranh đúng nhé!': AU + 'ls_co_huou_vi_023.mp3',
  'Giỏi quá!': AU + 'ls_co_huou_vi_028.mp3',
  'Đến lượt con!': AU + 'ls_co_huou_vi_025.mp3',
  'Tiếng Trung nói thế nào nhỉ?': AU + 'ls_co_huou_vi_026.mp3',
  'Tiếng Anh nói thế nào nhỉ?': AU + 'ls_co_huou_vi_027.mp3',
  'Con nhìn lại chữ nhé.': AU + 'ls_co_huou_vi_029.mp3',
  'Mình cùng nghe truyện nhé!': AU + 'ls_co_huou_vi_038.mp3',
  'Con nghe rồi thử nói bằng tiếng kia nhé!': AU + 'ls_co_huou_vi_033.mp3',
  'Tuyệt vời! Con đã học xong hôm nay rồi!': AU + 'ls_co_huou_vi_036.mp3',
  'Con nghe lại nhé.': AU + 'ls_co_huou_vi_024.mp3',
  /* Lớp Zoom (thu 04/11/2026) */
  'Con chờ cô một chút nhé, các bạn đang vào lớp.': AU + 'ls_co_huou_vi_zoom_01.mp3',
  'Cô quay vòng chọn bạn nhé!': AU + 'ls_co_huou_vi_zoom_02.mp3',
  'Cả lớp cùng hỏi bạn nhé!': AU + 'ls_co_huou_vi_zoom_03.mp3',
  'Con nghe rồi chạm vào đường bay đúng nhé!': AU + 'ls_co_huou_vi_zoom_04.mp3',
  'Cả lớp đưa tay bay theo, nói theo nhé!': AU + 'ls_co_huou_vi_zoom_05.mp3',
  'Con nói cho bạn nghe nhé!': AU + 'ls_co_huou_vi_zoom_06.mp3',
  'Con nghe bạn nói rồi chạm tranh đúng nhé!': AU + 'ls_co_huou_vi_zoom_07.mp3',
  'Hai bạn ăn ý quá!': AU + 'ls_co_huou_vi_zoom_08.mp3',
  'Cả nhóm giỏi quá! Cả nhóm được huy hiệu Bứt phá!': AU + 'ls_co_huou_vi_zoom_11.mp3',
  'Con chạm lần lượt các tranh theo thứ tự truyện nhé!': AU + 'ls_co_huou_vi_zoom_12.mp3',
  'Cả lớp cùng tiếp sức cho anh hùng Bông nhé!': AU + 'ls_co_huou_vi_zoom_13.mp3',
  'Rồng Lửa nổi giận rồi! Cả lớp trả lời nhanh nào!': AU + 'ls_co_huou_vi_zoom_14.mp3',
  'Cả lớp thắng rồi! Rồng Lửa biến lại thành quả trứng!': AU + 'ls_co_huou_vi_zoom_15.mp3',
  'Con là cô giáo nhỏ! Con nói cho cả lớp nghe nhé!': AU + 'ls_co_huou_vi_zoom_16.mp3',
  'Con nghe tiếng Anh tinh ghê!': AU + 'ls_co_huou_vi_khen_01.mp3',
  'Tai con bắt được từ tiếng Anh rồi!': AU + 'ls_co_huou_vi_khen_02.mp3',
  'Con nghe ra tiếng Trung rồi đó!': AU + 'ls_co_huou_vi_khen_03.mp3',
  'Con nhận ra từ tiếng Trung nhanh ghê!': AU + 'ls_co_huou_vi_khen_04.mp3',
  'Con nhìn chữ là nhận ra liền!': AU + 'ls_co_huou_vi_khen_05.mp3',
  'Con nhớ mặt chữ rồi đó!': AU + 'ls_co_huou_vi_khen_06.mp3',
  'Máy bay của con bay đúng đường rồi!': AU + 'ls_co_huou_vi_khen_07.mp3',
  'Tai con bắt thanh điệu chuẩn ghê!': AU + 'ls_co_huou_vi_khen_08.mp3',
  'Con nói rõ nên bạn hiểu liền!': AU + 'ls_co_huou_vi_khen_09.mp3',
  'Bạn nghe con nói là hiểu ngay!': AU + 'ls_co_huou_vi_khen_10.mp3',
  'Con hiểu ý bạn rồi đó!': AU + 'ls_co_huou_vi_khen_11.mp3',
  'Con lắng nghe bạn giỏi ghê!': AU + 'ls_co_huou_vi_khen_12.mp3',
  'Con đoán đúng cùng các bạn rồi!': AU + 'ls_co_huou_vi_khen_13.mp3',
  'Cô giáo nhỏ nói hay ghê, các bạn hiểu rồi!': AU + 'ls_co_huou_vi_khen_14.mp3',
  'Con nói rõ, cả lớp hiểu con rồi!': AU + 'ls_co_huou_vi_khen_15.mp3',
  'Con hiểu cô giáo nhỏ rồi đó!': AU + 'ls_co_huou_vi_khen_16.mp3',
  'Con lắng nghe bạn rất chăm!': AU + 'ls_co_huou_vi_khen_17.mp3',
  'Cả lớp cùng nhau thắng Rồng Lửa rồi!': AU + 'ls_co_huou_vi_khen_18.mp3',
  'Con nhớ truyện giỏi ghê!': AU + 'ls_co_huou_vi_khen_19.mp3',
  'Con xếp tranh đúng hết rồi!': AU + 'ls_co_huou_vi_khen_20.mp3',
};

/* ======================= Âm thanh ======================= */
const SND = (() => {
  let cur = null, queue = [], ctx = null, token = 0, EL = null;
  function stop() { token++; queue = []; if (cur) { try { cur.pause(); } catch (e) { } cur = null; } }
  let vol = 1;
  function playOne(src, tk) {
    return new Promise(res => {
      if (!src || tk !== token) return res();
      /* dùng lại một thẻ âm thanh đã được "mở khoá" bằng lần chạm đầu tiên: iPhone/iPad mới cho tự phát những câu sau */
      const a = EL || (EL = new Audio()); cur = a;
      try { a.pause(); } catch (e) { }
      a.src = src; a.volume = vol;
      const done = () => { a.onended = a.onerror = null; if (cur === a) cur = null; res(); };
      a.onended = done; a.onerror = done;
      a.play().catch(done);
    });
  }
  /* play([src, 300, src2]) – số là khoảng nghỉ (ms) */
  async function play(list, v) {
    stop(); const tk = token; vol = v || 1;
    for (const x of [].concat(list)) {
      if (tk !== token) return;
      if (typeof x === 'number') await new Promise(r => setTimeout(r, x)); else await playOne(x, tk);
    }
  }
  function beep(kind) {
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      const notes = { pop: [[660, .07]], ok: [[660, .08], [880, .12]], win: [[523, .1], [659, .1], [784, .1], [1047, .22]], tap: [[440, .05]], whoosh: [[300, .25]] }[kind] || [[500, .08]];
      let t = ctx.currentTime;
      notes.forEach(([f, d]) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = kind === 'whoosh' ? 'sawtooth' : 'triangle'; o.frequency.setValueAtTime(f, t);
        if (kind === 'whoosh') o.frequency.exponentialRampToValueAtTime(900, t + d);
        g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.18, t + .015); g.gain.exponentialRampToValueAtTime(.0001, t + d);
        o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + d + .02); t += d;
      });
    } catch (e) { }
  }
  function unlock() {
    try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); ctx.resume(); } catch (e) { }
    EL = EL || new Audio();
    try { EL.muted = true; EL.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYoRBqpAAAAAAD/+xBkAA/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV'; const p = EL.play(); p && p.then(() => { EL.pause(); EL.muted = false; }).catch(() => { EL.muted = false; }); } catch (e) { }
  }
  return { play, stop, beep, unlock };
})();
function hd(line) { return HD[line] || ''; }

/* ======================= Avatar ======================= */
const AVATARS = [
  { id: 'bong', n: 'Bông', img: TN + 'nhan-vat/kids_bong_a.webp' },
  { id: 'anna', n: 'Anna', img: TN + 'nhan-vat/kids_anna_a.webp' },
  { id: 'leo', n: 'Leo', img: TN + 'nhan-vat/kids_leo_a.webp' },
  { id: 'xiaomei', n: 'Xiaomei', img: TN + 'nhan-vat/kids_xiaomei_a.webp' },
  { id: 'tho', n: 'Thỏ con', img: TN + 'nhan-vat/huou_tho_a.webp' },
  { id: 'gau', n: 'Gấu con', img: TN + 'nhan-vat/huou_gau_a.webp' },
  { id: 'cun', n: 'Cún', img: TN + 'nhan-vat/pets_cun_ngoi_a.webp' },
  { id: 'meo', n: 'Mèo', img: TN + 'nhan-vat/pets_meo_ngoi_a.webp' },
];
function avaImg(id) { if (id && id.indexOf('/') >= 0) return TN + id; const a = AVATARS.find(x => x.id === id); return (a || AVATARS[0]).img; }
/* ảnh hiện cho cả lớp: ảnh con (khi ba mẹ đồng ý) hoặc avatar */
function faceOf(p) { return (p && p.photo) ? p.photo : avaImg(p && p.ava); }

/* Thu nhỏ ảnh con thành JPEG vuông */
function shrinkPhoto(file, size) {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => {
      const im = new Image();
      im.onload = () => {
        const s = Math.min(im.width, im.height), c = document.createElement('canvas');
        c.width = c.height = size;
        c.getContext('2d').drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, size, size);
        res(c.toDataURL('image/jpeg', .72));
      };
      im.onerror = rej; im.src = fr.result;
    };
    fr.onerror = rej; fr.readAsDataURL(file);
  });
}

/* ======================= Chỗ ngồi =======================
   players/<id>: mỗi máy bé (id = uid) hoặc chỗ ngồi tạm cô tạo (id = t_…).
   Máy nào có trường seat thì gộp vào chỗ ngồi đó (vào lại bằng máy khác, hoặc nhận chỗ cô đã tạo). */
function seatOf(players, id) {
  let s = id, guard = 0;
  while (players[s] && players[s].seat && players[players[s].seat] && guard++ < 5) s = players[s].seat;
  return s;
}
function buildSeats(players) {
  players = players || {};
  const seats = {};
  Object.entries(players).forEach(([id, p]) => {
    if (!p || (!p.kid && !p.seat)) return;
    const s = seatOf(players, id);
    const base = players[s]; if (!base || !base.kid) return;
    const x = seats[s] = seats[s] || { id: s, kid: base.kid, parent: base.parent || '', ava: base.ava, photo: base.photo || '', src: base.src || '', web: base.web || '', ord: base.ord || base.t || 0, ok: base.ok !== false, ids: [], on: false, t: base.t || 0 };
    x.ids.push(id);
    if (p.on) x.on = true;
    if (id !== s) {   // máy bé đang dùng chỗ này: lấy avatar / ảnh / tên ba mẹ mới nhất
      if (p.ava) x.ava = p.ava; if (p.photo) x.photo = p.photo; if (p.parent && !x.parent) x.parent = p.parent; if (p.web && !x.web) x.web = p.web;
      if (p.ok === false && base.ok === undefined) x.ok = false;
    }
  });
  return Object.values(seats).sort((a, b) => (a.ord - b.ord) || a.kid.localeCompare(b.kid));
}

/* câu trả lời của một chỗ ngồi cho một câu hỏi: máy bé trả lời, hoặc cô bấm hộ */
function answerOf(room, seat, qid) {
  const ans = (room.answers || {})[qid] || {};
  let best = null;
  seat.ids.forEach(id => { const a = ans[id]; if (a && (!best || a.at < best.at)) best = a; });
  const px = (((room.marks || {})[seat.id] || {}).px || {})[qid];
  if (!best && px) best = Object.assign({ ho: true }, px);
  return best;
}

/* Thanh năng lượng chung: mỗi câu đúng (ôn nhanh, thanh điệu, đôi bạn) góp một phần */
function energy(room) {
  const seats = buildSeats(room.players).filter(s => s.ok);
  const n = Math.max(1, seats.length);
  let good = 0;
  const qids = Object.keys(room.answers || {});
  const pxs = [];
  Object.values(room.marks || {}).forEach(m => Object.keys((m && m.px) || {}).forEach(q => pxs.push(q)));
  const all = new Set(qids.concat(pxs));
  all.forEach(q => { if (!/^(on|tone|pair|lop|xep)_/.test(q)) return; /* trận Rồng Lửa có thanh sức mạnh riêng */ seats.forEach(s => { const a = answerOf(room, s, q); if (a && a.ok) good++; }); });
  const goal = n * 16;
  const st = room.state || {};
  const pct = st.ph === 'badge' ? 100 : Math.min(100, Math.round(good / goal * 100));
  return { good, pct };
}

/* Lịch lượt chơi đôi bạn: cặp (1-2), (3-4), (5-6); mỗi cặp nói 2 lượt (đổi vai, đổi tiếng). Lẻ một bạn thì bạn đó chơi với cô. */
function pairTurns(seats) {
  const ids = seats.map(s => s.id), pairs = [];
  for (let i = 0; i < ids.length; i += 2) pairs.push([ids[i], ids[i + 1] || 'co']);
  const turns = []; let k = 0;
  [['en', 'zh'], ['zh', 'en']].forEach(([l1, l2]) => pairs.forEach(([a, b]) => {
    turns.push({ a, b, k: k++ % PAIR_POOL.length, l: l1 });
    turns.push({ a: b, b: a, k: k++ % PAIR_POOL.length, l: l2 });
  }));
  return turns.filter(t => t.a !== 'co' || t.b !== 'co');
}

/* Cô giáo nhỏ: mỗi bạn một lượt nói cho cả lớp nghe (đổi tiếng mỗi lượt), cả lớp chạm tranh, rồi cùng nói bằng tiếng kia.
   Dùng tranh khác với lượt đôi bạn (bắt đầu từ giữa PAIR_POOL). */
function lopTurns(seats) {
  return seats.map((s, j) => ({ a: s.id, k: (6 + j * 5) % PAIR_POOL.length, l: j % 2 ? 'zh' : 'en' }));
}

/* ======================= Cả lớp đấu Rồng Lửa =======================
   Mỗi bạn tự trả lời câu hỏi ngẫu nhiên trên máy mình (không chờ cô, không chờ bạn). Mỗi câu đúng = +1 ⚡ cho anh hùng Bông.
   Thanh giằng co giữa anh hùng và rồng: giữa trận rồng "nổi giận" kéo thanh về phía rồng (nguy cơ thua),
   các bạn tiếp sức kéo lại, hết giờ thì anh hùng tung đòn cuối và cả lớp thắng. Không bảng xếp hạng: chỉ có sức mạnh chung. */
let BOSS = { hero: TN + 'qua/ava_bong_sieu_nhan.webp', mon: TN + 'qua/mon_lua_3.webp', stages: [0, 1, 2, 3].map(i => TN + 'qua/mon_lua_' + i + '.webp'), bg: TN + 'qua/bg_quai.webp', name: 'Rồng Lửa nghịch ngợm',
  story: '⚔️ Rồng Lửa nghịch ngợm muốn thổi tắt nến sinh nhật của Bông! Cả lớp tiếp sức cho anh hùng nhé!' };
let BOSS_WORDS = ['name', 'you', 'one', 'two', 'three', 'four', 'five', 'six'];
let BOSS_PHRASES = ['wyn', 'mna', 'hoy', 'i5', 'i6', 'n123', 'ntm'];
let BOSS_ITEMS = (() => {
  const out = [];
  BOSS_WORDS.forEach(k => ['en', 'zh'].forEach(l => out.push({ k, l, cat: BOSS_WORDS })));
  BOSS_PHRASES.forEach(k => ['en', 'zh'].forEach(l => out.push({ k, l, cat: BOSS_PHRASES })));
  [['one', '一'], ['two', '二'], ['three', '三']].forEach(([k, c]) => out.push({ k, l: 'doc', chu: c, cat: ['one', 'two', 'three'] }));
  return out;
})();
/* câu tiếp cho một bạn: tránh câu vừa hỏi, ưu tiên câu con vừa chọn chưa đúng (gặp lại ở thứ tiếng kia) */
function bossPick(last, missed) {
  let it = null;
  if (missed && missed.length && Math.random() < .5) { const m = missed.shift(); it = BOSS_ITEMS.find(x => x.k === m.k && x.l !== m.l && x.l !== 'doc') || null; }
  if (!it) { const pool = BOSS_ITEMS.filter(x => !last || x.k !== last.k); it = pool[Math.floor(Math.random() * pool.length)]; }
  const others = it.cat.filter(k => k !== it.k).sort(() => Math.random() - .5).slice(0, 2);
  const o = [it.k].concat(others).sort(() => Math.random() - .5);
  return Object.assign({}, it, { o, ans: o.indexOf(it.k) });
}
function bossInfo(room) {
  const st = room.state || {}, b = st.boss || {};
  if (!b.t0) return { pre: true, run: b.run || 0, dur: b.dur || 120000 };
  const T = b.dur || 120000, el = DB.now() - b.t0, t = Math.max(0, Math.min(1, el / T)), pre = 'boss_' + (b.run || 0) + '_';
  let H = 0; const players = new Set(), hits = [];
  Object.entries(room.answers || {}).forEach(([q, o]) => { if (q.indexOf(pre) !== 0) return; Object.entries(o || {}).forEach(([u, a]) => { players.add(u); if (a && a.ok) { H++; hits.push([a.at || 0, u]); } }); });
  /* bé chỉ có 1 máy: con trả lời trên Zoom, cô bấm "⚡ +1" (marks/<chỗ>/bx/<lượt>_<n> = thời điểm) */
  Object.entries(room.marks || {}).forEach(([seat, m]) => Object.entries((m && m.bx) || {}).forEach(([k, at]) => { if (k.indexOf((b.run || 0) + '_') === 0 && at) { H++; hits.push([at, seat]); } }));
  const n = Math.max(1, players.size, buildSeats(room.players).filter(s => s.ok && s.on).length);
  /* Thanh giằng co: kịch bản trận (rồng nổi giận quanh 62% thời gian, cuối trận anh hùng áp đảo)
     cộng với nhịp tiếp sức của cả lớp trong 6 giây gần nhất (trả lời đúng càng dồn dập, thanh càng về phía anh hùng). */
  const now = DB.now(), win = Math.max(2000, Math.min(6000, el));
  const recent = hits.filter(h => h[0] > now - win).length / n / (win / 1000);   // câu đúng mỗi giây của mỗi bạn
  const push = 22 * (Math.tanh(recent * 7) - 0.5);                               // nhịp chuẩn: 1 câu đúng / 7 giây / bạn
  const bump = Math.exp(-Math.pow((t - 0.62) / 0.11, 2));
  let pos = 50 + 10 * t - 35 * bump + (t > 0.85 ? (t - 0.85) / 0.15 * 30 : 0) + push;
  const prog = H / Math.max(8, n * (T / 1000) / 7 * 0.7);   // sức mạnh cả lớp so với mức dự kiến khi hết giờ (rồng nhỏ dần theo số này)
  const done = !!b.end || t >= 1;
  pos = done ? 100 : Math.max(8, Math.min(92, pos));
  return { pre: false, run: b.run || 0, t, H, prog, pos, surge: !done && bump > 0.35, done, left: Math.max(0, T - el), hits: hits.sort((x, y) => x[0] - y[0]) };
}

/* Gửi lên máy chủ Apps Script (Sheet "Anh-Trung-Kids – Dữ liệu dự án") */
async function apiPost(body) {
  const r = await fetch(LZ_API, { method: 'POST', body: JSON.stringify(body) });
  return r.json();
}

/* Màn hình con (dùng cả cho màn chiếu) cần biết nhóm hiện tại có bao nhiêu sao năng lượng */
function energyHTML(e) {
  const stage = e.pct >= 100 ? '🌳' : e.pct >= 66 ? '🪴' : e.pct >= 33 ? '🌿' : '🌱';
  return `<div class="energy" role="img" aria-label="Năng lượng cả nhóm ${e.pct}%"><span class="en-ic">${stage}</span><div class="en-bar"><i style="width:${e.pct}%"></i></div><span class="en-lb">Năng lượng cả nhóm</span></div>`;
}

/* ======================= Sao thành tích (cộng vào ví sao web học để đổi quà) =======================
   ✋ giơ tay, 🎤 phát biểu: cô bấm ở cột Các bé (marks/<chỗ>/sc). ✅ trả lời đúng: tự đếm mọi câu con chọn đúng
   (máy con chọn hoặc cô bấm hộ, kể cả trận Rồng; câu "đoán cho vui" khi không đến lượt thì không tính).
   Phát biểu còn tự cộng khi cô chấm Chào bạn mới (EN/ZH) và Phiên dịch nhí (được / cùng cô). ± sao: cô chỉnh ở thẻ Kết quả. */
function seatStars(room, seat) {
  const m = ((room.marks || {})[seat.id]) || {}, sc = m.sc || {};
  const qs = new Set(Object.keys(room.answers || {}));
  Object.values(room.marks || {}).forEach(x => Object.keys((x && x.px) || {}).forEach(q => qs.add(q)));
  let dung = 0; qs.forEach(q => { const a = answerOf(room, seat, q); if (a && a.ok && !a.xem) dung++; });
  const intro = m.intro || {}, autoNoi = ['en', 'zh'].filter(l => intro[l]).length + Object.values(m.pd || {}).filter(v => v >= 1).length + Object.values(m.cn || {}).filter(v => v >= 1).length;
  const tay = +sc.tay || 0, noi = (+sc.noi || 0) + autoNoi, adj = +m.adj || 0;
  return { tay, dung, noi, adj, sao: Math.max(0, tay + dung + noi + adj) };
}
function starTitle(t) {
  const c = [[t.tay, 'Bạn hăng hái giơ tay', '🙋'], [t.dung, 'Bạn tinh tai, tinh mắt', '👀'], [t.noi, 'Bạn tự tin phát biểu', '🎤']];
  const mx = Math.max(...c.map(x => x[0]));
  if (!mx) return ['Bạn chăm chú lắng nghe', '💛'];
  const top = c.filter(x => x[0] === mx);
  return top.length === 3 ? ['Ngôi sao toàn năng', '🌟'] : [top[0][1], top[0][2]];
}

