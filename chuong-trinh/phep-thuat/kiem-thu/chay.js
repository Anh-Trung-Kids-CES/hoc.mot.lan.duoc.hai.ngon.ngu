// Kiểm thử Phép thuật lời nói: dữ liệu, nhận giọng 146 phép × 2 tiếng, phép nối, tham số, chơi trọn một lượt (jsdom).
// Chạy: node chay.js   (cần: npm i jsdom trong thư mục này hoặc NODE_PATH)
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
const ROOT = path.resolve(__dirname, '..', '..', '..');
let fail = 0, pass = 0; const bad = [];
const ok = (c, m) => { if (c) pass++; else { fail++; bad.push(m); } };

function boot(course, day, opts = {}) {
  const dom = new JSDOM('<!doctype html><body><div id="app"></div></body>', { url: 'http://x/' + (course === 'LS' ? 'little-seed' : 'seedling') + '/index.html#/ngay/' + day, runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window; w.KEY = course === 'LS' ? 'lsd' : 'sdl'; w.PT_TEST = { day, auto: false };
  w.matchMedia = () => ({ matches: false }); w.P = { days: {}, stars: 0, hop: {} }; w.save = () => {}; w.stars = 0; w.addStars = n => { w.stars += n; };
  w.confetti = () => {}; w.speechSynthesis = { cancel() {}, speak(u) { setTimeout(() => u.onend && u.onend(), 0); }, getVoices: () => [] }; w.SpeechSynthesisUtterance = function (t) { this.text = t; };
  const data = course === 'LS' ? 'little-seed/little-seed-data.js' : 'seedling/seedling-data.js';
  w.eval(fs.readFileSync(path.join(ROOT, data), 'utf8'));
  w.eval(fs.readFileSync(path.join(ROOT, 'seedling/phep-thuat-du-lieu.js'), 'utf8'));
  w.eval(fs.readFileSync(path.join(ROOT, 'seedling/phep-thuat.js'), 'utf8'));
  return w;
}

// ---------- 1. dữ liệu ----------
const dataJs = fs.readFileSync(path.join(ROOT, 'seedling/phep-thuat-du-lieu.js'), 'utf8');
const D = JSON.parse(dataJs.slice(dataJs.indexOf('=') + 1).replace(/;\s*$/, ''));
const T = path.join(ROOT, 'seedling/tai-nguyen/');
const nUnit = Object.keys(D.units).length, nSp = Object.values(D.units).reduce((a, u) => a + u.spells.length, 0);
ok(nUnit === 24, 'đủ 24 unit: ' + nUnit); ok(nSp === 146, 'đủ 146 phép: ' + nSp);
for (const [i, o] of Object.entries(D.objs)) if (!o.e) ok(fs.existsSync(T + o.src + '.webp'), 'thiếu hình ' + o.src);
for (const [uid, u] of Object.entries(D.units)) {
  ok(fs.existsSync(T + 'trang/' + u.bg + '.webp'), uid + ' thiếu nền ' + u.bg);
  ok(u.spells.length >= 6, uid + ' ít phép'); ok(u.combo.length === 2 && u.long.length === 2, uid + ' thiếu phép nối/câu dài');
  ok(u.dia.en.length === 2 && u.dia.zh.length === 2, uid + ' thiếu hội thoại');
  u.spells.forEach(sp => { ok(sp.fx.length > 0, sp.id + ' không có hiệu ứng'); (sp.pic.o || []).forEach(id => ok(D.objs[id], sp.id + ' pic thiếu vật ' + id)); });
}

// ---------- 2. nhận giọng ----------
const w0 = boot('SD', 10); const G = w0.PT_GAME;
let nOwn = 0, nKey = 0, conflicts = [];
for (const course of ['LS', 'SD']) {
  const order = D.order[course];
  for (const u of order) {
    const uid = course + u, U = D.units[uid];
    const prev = order.slice(0, order.indexOf(u)).slice(-2).flatMap(p => D.units[course + p].spells.slice(0, 2));   // giả lập có vài phép ôn
    const pool = [...U.spells, ...prev];
    for (const l of ['en', 'zh']) for (const sp of U.spells) {
      let say = sp[l].say; if (sp.reply) { /* phép hỏi: con nói câu hỏi */ }
      const r = G.find(l, say, pool);
      nOwn++;
      if (!(r.sp && r.full)) { conflicts.push(`${uid}.${sp.k}.${l} "${say}" → không nhận đủ câu`); continue; }
      if (r.sp.id !== sp.id && sig(r.sp[l]) !== sig(sp[l])) conflicts.push(`${uid}.${sp.k}.${l} "${say}" → nhầm sang ${r.sp.id}`);
      if (sp[l].key) {
        nKey++;
        // chỉ riêng từ khoá (lấy từ bảng bậc 1)
        const kw = D._keyword && D._keyword[sp.id + '.' + l];
      }
    }
  }
}
function sig(c) { return c.tok.slice().sort().join('|'); }
ok(conflicts.length === 0, 'nhận giọng: ' + conflicts.length + ' lỗi\n   ' + conflicts.join('\n   '));
console.log('nhận câu mẫu:', nOwn, 'lượt kiểm,', conflicts.length, 'lỗi');

// ---------- 3. phép nối + câu dài ----------
let nCo = 0, coBad = [];
for (const course of ['LS', 'SD']) for (const u of D.order[course]) {
  const uid = course + u, U = D.units[uid];
  for (const l of ['en', 'zh']) for (const [a, b] of U.combo) {
    const sa = U.spells.find(s => s.k === a), sb = U.spells.find(s => s.k === b);
    const r = G.find(l, sa[l].say + ' ' + sb[l].say, U.spells); nCo++;
    if (!(r.combo && r.combo.length >= 2)) coBad.push(`${uid} ${a}+${b} ${l}`);
  }
}
ok(coBad.length === 0, 'phép nối không nhận: ' + coBad.join(' | '));
console.log('phép nối:', nCo, 'cặp,', coBad.length, 'lỗi');
let lgBad = [], nLg = 0;
for (const course of ['LS', 'SD']) for (const u of D.order[course]) {
  const uid = course + u, U = D.units[uid];
  for (const l of ['en', 'zh']) U.long.forEach(g => { nLg++; const N = [G.norm(g[l].say, l)]; const s = G.score(g[l], l, N); if (!(s.full && s.r >= .7)) lgBad.push(uid + ' ' + g.id + ' ' + l); });
}
ok(lgBad.length === 0, 'câu dài tự nhận: ' + lgBad.join(' | ')); console.log('câu dài:', nLg, 'lượt,', lgBad.length, 'lỗi');

// ---------- 4. tham số (số, màu) ----------
const wLS = boot('LS', 10); // LS U2
const poolLS2 = D.units.LS2.spells;
const rNum = wLS.PT_GAME.find('en', 'seven', poolLS2); ok(rNum.sp && rNum.sp.k === 'num', 'LS2 "seven" → Six! (tham số số): ' + JSON.stringify(rNum.sp && rNum.sp.k));
const rNumZ = wLS.PT_GAME.find('zh', '八', poolLS2); ok(rNumZ.sp && rNumZ.sp.k === 'num', 'LS2 "八" → 六！');
const poolCol = D.units.LS11.spells; const rc = wLS.PT_GAME.find('en', 'purple', poolCol); ok(rc.sp && rc.sp.par === 'color', 'LS11 "purple" nhận màu bất kỳ');

// ---------- 5. bậc 1 (một từ khoá) ----------
let kwBad = [], nKw = 0;
for (const course of ['LS', 'SD']) for (const u of D.order[course]) {
  const uid = course + u, U = D.units[uid];
  for (const l of ['en', 'zh']) for (const sp of U.spells) {
    const r = G.find(l, sp.kw[l], U.spells); nKw++;
    if (!r.sp) { kwBad.push(`${uid}.${sp.k}.${l} "${sp.kw[l]}" → không nhận`); continue; }
    if (r.sp.id !== sp.id && sig(r.sp[l]) !== sig(sp[l]) && !(r.sp.kw && r.sp.kw[l] === sp.kw[l])) kwBad.push(`${uid}.${sp.k}.${l} "${sp.kw[l]}" → sang ${r.sp.id}`);
  }
}
ok(kwBad.length === 0, 'bậc 1: ' + kwBad.length + ' lỗi\n   ' + kwBad.join('\n   ')); console.log('bậc 1 (từ khoá):', nKw, 'lượt,', kwBad.length, 'lỗi');

module.exports = { ok, boot, D, report() { console.log(`\n${pass} đạt · ${fail} lỗi`); bad.forEach(b => console.log(' ✗', b)); return fail; } };
if (require.main === module) process.exit(module.exports.report() ? 1 : 0);
