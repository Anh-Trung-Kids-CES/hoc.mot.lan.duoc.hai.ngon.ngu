/* Dựng khai-giang/buoi0-data.js từ noi-dung.js và ghép giọng đọc theo thứ tự tiết kiệm nhất:
   1. giọng đã có nguyên câu trong web Little Seed / Seedling (aumap và các ô a_en, a_zh) hoặc đã tạo riêng ở khai-giang/giong/;
   2. ghép từ các mảnh đã có (pe, pz trong noi-dung.js), chỉ khi đủ mảnh;
   3. còn lại: trang đọc bằng giọng máy của trình duyệt, cô thu giọng ngay trên trang (🎙), hoặc tạo theo lô bằng Gemini TTS:
        GEMINI_API_KEY=... python3 seedling/cong-cu/gemini/gen_audio.py khai-giang/cong-cu/giong-thieu.json khai-giang/giong khai-giang/cong-cu/giong-map.json
      rồi chạy lại script này.
   Chạy ở gốc repo: node khai-giang/cong-cu/build_buoi0.js */
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..'), OUT = path.join(ROOT, 'khai-giang');
const N = require('./noi-dung.js');

const norm = s => String(s).replace(/[“”"]/g, '').replace(/\s+/g, ' ').trim().toLowerCase().replace(/[!?.。！？，,…]+$/, '');
const idx = {};
function add(l, t, a, base) {
  if (!t || !a) return;
  const p = path.normalize(path.join(base, a));
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
// giọng tạo riêng cho buổi 0 (gen_audio.py ghi map "l:câu" -> tên file)
const MAP = path.join(__dirname, 'giong-map.json');
const own = fs.existsSync(MAP) ? JSON.parse(fs.readFileSync(MAP, 'utf8')) : {};
for (const [k, f] of Object.entries(own)) { const i = k.indexOf(':'); add(k.slice(0, i), k.slice(i + 1), 'giong/' + f, 'khai-giang'); }

const rel = p => path.relative('khai-giang', p).split(path.sep).join('/');
const miss = new Map(), stat = { file: 0, ghep: 0, may: 0 };
function resolve(l, t, parts) {
  if (!t) return null;
  const hit = idx[l + ':' + norm(t)];
  if (hit) { stat.file++; return { a: [rel(hit[0])], m: 'file' }; }
  if (parts && parts.length) {
    const ps = parts.map(([pl, pt]) => idx[pl + ':' + norm(pt)]);
    if (ps.every(Boolean)) { stat.ghep++; return { a: ps.map(x => rel(x[0])), m: 'ghep' }; }
  }
  stat.may++; miss.set(l + ':' + t, [l, t]);
  return { a: [], m: 'may' };
}
// gắn giọng vào mọi câu (đối tượng có en/zh dạng chữ), giữ nguyên các trường khác
const seen = new WeakSet();
function attach(o) {
  if (!o || typeof o !== 'object' || seen.has(o)) return; seen.add(o);
  if (Array.isArray(o)) return o.forEach(attach);
  if (typeof o.en === 'string' || typeof o.zh === 'string') {
    const e = resolve('en', o.en, o.pe), z = resolve('zh', o.zh, o.pz);
    if (e) { o.a_en = e.a; o.m_en = e.m; } if (z) { o.a_zh = z.a; o.m_zh = z.m; }
    delete o.pe; delete o.pz;
  }
  Object.values(o).forEach(attach);
}
const data = JSON.parse(JSON.stringify({ KHOI: N.KHOI, MAN: N.MAN, NOI: N.NOI }));
attach(data);

// kiểm tranh và nhạc có thật trong repo
const thieuFile = [];
JSON.stringify(data).replace(/"(\.\.\/[^"]+\.(?:webp|png|jpg|mp3))"/g, (_, p) => { if (!fs.existsSync(path.join(OUT, p))) thieuFile.push(p); return _; });
if (thieuFile.length) { console.error('THIẾU FILE:', [...new Set(thieuFile)]); process.exit(1); }

data.ban = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(OUT, 'buoi0-data.js'),
  '/* Tự sinh bởi khai-giang/cong-cu/build_buoi0.js từ noi-dung.js – không sửa tay. */\nwindow.B0 = ' + JSON.stringify(data) + ';\n');
const list = [...miss.values()].sort((a, b) => a[0].localeCompare(b[0]));
fs.writeFileSync(path.join(__dirname, 'giong-thieu.json'), JSON.stringify(list, null, 1) + '\n');
console.log(`Giọng: ${stat.file} lượt dùng file có sẵn, ${stat.ghep} lượt ghép mảnh, ${stat.may} lượt chưa có (${list.length} câu khác nhau)`);
list.forEach(x => console.log('  ✗', x[0], x[1]));
