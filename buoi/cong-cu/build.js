/* Dựng buoi/data-uN.js từ mỗi noi-dung-uN.js và ghép giọng đọc theo thứ tự tiết kiệm nhất (như Buổi 0):
   1. giọng đã có nguyên câu trong web Little Seed / Seedling / Buổi 0 (aumap, các ô a_en, a_zh, khai-giang/giong/) hoặc buoi/giong/;
   2. ghép từ các mảnh đã có (pe, pz), chỉ khi đủ mảnh;
   3. còn lại: trang đọc bằng giọng máy của trình duyệt, cô thu giọng trên trang (🎙), hoặc tạo theo lô bằng Gemini TTS:
        GEMINI_API_KEY=... python3 seedling/cong-cu/gemini/gen_audio.py buoi/cong-cu/giong-thieu.json buoi/giong buoi/cong-cu/giong-map.json
      rồi chạy lại script này.
   Chạy ở gốc repo: node buoi/cong-cu/build.js */
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = path.resolve(__dirname, '..', '..'), OUT = path.join(ROOT, 'buoi');

const norm = s => String(s).replace(/[“”"]/g, '').replace(/\s+/g, ' ').trim().toLowerCase().replace(/[!?.。！？，,…]+$/, '');
const idx = {};
function add(l, t, a, base) {
  if (!t || !a) return;
  const p = path.normalize(path.join(base, a.split('?')[0]));
  if (!fs.existsSync(path.join(ROOT, p))) return;
  const k = l + ':' + norm(t); (idx[k] = idx[k] || []).push(p);
}
for (const [dir, f] of [['little-seed', 'little-seed/little-seed-data.js'], ['seedling', 'seedling/seedling-data.js']]) {
  global.window = global; delete require.cache[require.resolve(path.join(ROOT, f))]; require(path.join(ROOT, f));
  const SD = global.window.SD;
  for (const [k, v] of Object.entries(SD.aumap || {})) { const i = k.indexOf(':'); add(k.slice(0, i), k.slice(i + 1), v, dir); }
  const walk = o => {
    if (!o || typeof o !== 'object') return; if (Array.isArray(o)) return o.forEach(walk);
    if (o.en && o.a_en) add('en', o.en, o.a_en, dir); if (o.zh && o.a_zh) add('zh', o.zh, o.a_zh, dir);
    if (o.t && o.a && o.l) add(o.l, o.t, o.a, dir);
    Object.values(o).forEach(walk);
  };
  walk(SD);
}
// giọng của Buổi 0 (đã tạo ngày 12/11) và giọng riêng của web dạy buổi
for (const [dir, mapf] of [['khai-giang', 'khai-giang/cong-cu/giong-map.json'], ['buoi', 'buoi/cong-cu/giong-map.json']]) {
  const mp = path.join(ROOT, mapf); if (!fs.existsSync(mp)) continue;
  for (const [k, f] of Object.entries(JSON.parse(fs.readFileSync(mp, 'utf8')))) { const i = k.indexOf(':'); add(k.slice(0, i), k.slice(i + 1), 'giong/' + f, dir); }
}

const rel = p => path.relative('buoi', p).split(path.sep).join('/') +
  (p.startsWith(path.join('buoi', 'giong')) ? '?h=' + crypto.createHash('md5').update(fs.readFileSync(path.join(ROOT, p))).digest('hex').slice(0, 6) : '');
const miss = new Map(), stat = { file: 0, ghep: 0, may: 0 };
function resolve(l, t, parts) {
  if (!t) return null;
  const hit = idx[l + ':' + norm(t)];
  if (hit) { stat.file++; return { a: [rel(hit[0])], m: 'file' }; }
  // không có mảnh khai báo: tự tách câu theo dấu câu (妈妈，早上好！ → 妈妈 + 早上好) rồi thử ghép
  if (!parts || !parts.length) { const seg = t.split(/[，,！!。？?…;；]+/).map(x => x.trim()).filter(Boolean); const half = x => { const h = x.length / 2; return x.length % 2 === 0 && x.slice(0, h) === x.slice(h) ? [x.slice(0, h), x.slice(h)] : [x]; };
    const seg2 = seg.flatMap(half); if (seg2.length > 1) parts = seg2.map(x => [l, x]); }
  if (parts && parts.length) {
    const ps = parts.map(([pl, pt]) => idx[pl + ':' + norm(pt)]);
    if (ps.every(Boolean)) { stat.ghep++; return { a: ps.map(x => rel(x[0])), m: 'ghep' }; }
  }
  stat.may++; miss.set(l + ':' + t, [l, t]);
  return { a: [], m: 'may' };
}
const seen = new WeakSet();
function attach(o) {
  if (!o || typeof o !== 'object' || seen.has(o)) return; seen.add(o);
  if (Array.isArray(o)) return o.forEach(attach);
  if (typeof o.en === 'string' || typeof o.zh === 'string') {
    const e = resolve('en', o.en, o.pe), z = resolve('zh', o.zh, o.pz);
    if (e) { o.a_en = e.a; o.m_en = e.m; } if (z) { o.a_zh = z.a; o.m_zh = z.m; }
    delete o.pe; delete o.pz;
  }
  if (o.say && o.say.t && o.opts) { const x = resolve(o.say.l, o.say.t); o.a = x ? x.a : []; } // câu phiếu cuối unit
  Object.values(o).forEach(attach);
}

const files = fs.readdirSync(__dirname).filter(f => /^noi-dung-u\d+\.js$/.test(f)).sort();
const allMiss = [];
for (const f of files) {
  const u = f.match(/u(\d+)/)[1];
  const N = require(path.join(__dirname, f));
  const data = JSON.parse(JSON.stringify(N));
  attach(data);
  // kiểm tra: id màn không trùng, khối tồn tại, tranh và file có thật
  const errs = [];
  for (const [lv, L] of Object.entries(data.lv)) for (const [b, B] of Object.entries(L.buoi)) {
    const ids = new Set(); let mins = 0;
    for (const m of B.MAN) {
      if (ids.has(m.id)) errs.push(`${lv} b${b}: trùng id ${m.id}`); ids.add(m.id);
      if (!B.KHOI.some(k => k.n === m.k)) errs.push(`${lv} b${b}: ${m.id} khối ${m.k} không có`);
      if (!m.du) mins += m.p || 0;
    }
    B.phut = mins;
    const live = B.MAN.filter(m => !m.du), sum = f => live.filter(f).reduce((a, m) => a + (m.p || 0), 0);
    B.lead = sum(m => m.lead); B.offm = sum(m => m.off || m.type === 'nghi');
    if (live.some(m => !m.vai)) errs.push(`${lv} b${b}: màn chưa ghi vai cô: ` + live.filter(m => !m.vai).map(m => m.id).join(', '));
    for (const k of B.KHOI) { const s = B.MAN.filter(m => m.k === k.n && !m.du).reduce((a, m) => a + (m.p || 0), 0); if (s > k.den - k.tu) errs.push(`${lv} b${b}: khối ${k.n} có ${s}′ > ${k.den - k.tu}′`); }
  }
  const thieu = new Set();
  JSON.stringify(data).replace(/"(\.\.\/[^"?#]+\.(?:webp|png|jpg|mp3|svg))(?:\?[^"]*)?"/g, (_, p) => { if (!fs.existsSync(path.join(OUT, p))) thieu.add(p); return _; });
  if (thieu.size) errs.push('THIẾU FILE: ' + [...thieu].join(', '));
  if (errs.length) { console.error(errs.join('\n')); process.exit(1); }
  data.ban = new Date().toISOString().slice(0, 10);
  const js = `/* Tự sinh bởi buoi/cong-cu/build.js từ ${f} – không sửa tay. */\n(function(){var D=${JSON.stringify(data)};var B=window.BU=window.BU||{NOI:D.NOI,lv:{}};` +
    `for(var lv in D.lv){var L=B.lv[lv]=B.lv[lv]||{ten:D.lv[lv].ten,buoi:{}};L.sau=D.lv[lv].sau;for(var b in D.lv[lv].buoi)L.buoi[b]=D.lv[lv].buoi[b];}})();\n`;
  fs.writeFileSync(path.join(OUT, `data-u${u}.js`), js);
  for (const [lv, L] of Object.entries(data.lv)) console.log(`Unit ${u} · ${lv}: ` + Object.entries(L.buoi).map(([b, B]) => `buổi ${b}: ${B.MAN.length} màn, ${B.phut}′, con làm chủ ${B.lead}′, tắt chiếu ${B.offm}′`).join(' | '));
}
const list = [...miss.values()].sort((a, b) => a[0].localeCompare(b[0]));
fs.writeFileSync(path.join(__dirname, 'giong-thieu.json'), JSON.stringify(list, null, 1) + '\n');
console.log(`Giọng: ${stat.file} lượt dùng file có sẵn, ${stat.ghep} lượt ghép mảnh, ${stat.may} lượt chưa có (${list.length} câu khác nhau)`);
list.forEach(x => console.log('  ✗', x[0], x[1]));
