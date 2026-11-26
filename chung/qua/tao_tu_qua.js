/* Sinh chung/qua/qua-tu.js: thẻ từ (tranh, chữ, giọng) theo ngày web 1–99 của web lớp offline Little Seed (ls) và Seedling (sd),
   lấy từ little-seed/little-seed-data.js và seedling/seedling-data.js. Dùng cho Đố từ (thú cưng), Luyện chiêu và Rồng trùm.
   Chép cách làm của kho cuộc thi (cuoc-thi-mua-3/cong-cu/tao_tu_qua.js, 26/11/2026).
   Chạy ở thư mục gốc kho: node chung/qua/tao_tu_qua.js   (chạy lại mỗi khi bài trong 2 tệp dữ liệu thay đổi) */
const fs = require('fs'), path = require('path'), root = path.join(__dirname, '..', '..');
function load(f) { global.window = {}; delete require.cache[require.resolve(f)]; require(f); return window.SD; }
/* đường dẫn trong dữ liệu tính từ trang của khoá đó; đổi về dạng ../<khoá>/… để dùng được từ cả 2 trang */
const fix = (p, web) => { p = String(p || ''); if (!p || /^(\.\.\/|https?:|data:)/.test(p)) return p; return `../${web}/` + p.replace(/^\.\//, ''); };
function build(SD, web) {
  const out = {};
  Object.keys(SD.days).forEach(k => {
    const seen = {}, list = [];
    (SD.days[k].steps || []).forEach(s => (s.cards || []).forEach(c => {
      if (!c.en || !c.img || !c.a_en || seen[c.en]) return; seen[c.en] = 1;
      list.push([c.en, c.zh || '', c.py || '', fix(c.img, web), fix(c.a_en, web), fix(c.a_zh, web)]);
    }));
    if (list.length) out[k] = list;
  });
  // Bỏ thẻ chỉ có chữ (thư mục the/) và tranh dùng chung cho nhiều từ: trò đố là nghe từ rồi chọn TRANH,
  // nên mỗi tranh phải ứng với đúng một từ.
  const dung = {};
  Object.values(out).forEach(l => l.forEach(c => { (dung[c[3]] = dung[c[3]] || new Set()).add(c[0].toLowerCase()); }));
  const chu = p => /\/the\//.test(p) && !/(pencil_case|two_dogs)\.webp$/.test(p);
  Object.keys(out).forEach(k => { out[k] = out[k].filter(c => !chu(c[3]) && dung[c[3]].size === 1); if (!out[k].length) delete out[k]; });
  // Bỏ thẻ mà tệp tranh hoặc giọng Anh không có trong kho
  const co = p => fs.existsSync(path.join(root, 'chung', p));
  let bo = 0;
  Object.keys(out).forEach(k => { const n = out[k].length; out[k] = out[k].filter(c => co(c[3]) && co(c[4])); bo += n - out[k].length; if (!out[k].length) delete out[k]; });
  if (bo) console.log(web, 'bỏ', bo, 'thẻ thiếu tệp tranh/giọng');
  return out;
}
const T = { ls: build(load(path.join(root, 'little-seed/little-seed-data.js')), 'little-seed'), sd: build(load(path.join(root, 'seedling/seedling-data.js')), 'seedling') };
const js = '/* Thẻ từ theo ngày web cho Phòng đổi quà – sinh bằng chung/qua/tao_tu_qua.js từ little-seed-data.js, seedling-data.js. Đừng sửa tay.\n   [en, zh, pinyin, tranh, giọng Anh, giọng Trung] */\nwindow.M3_TU=' + JSON.stringify(T) + ';\n';
fs.writeFileSync(path.join(__dirname, 'qua-tu.js'), js);
const dem = o => Object.values(o).reduce((a, l) => a + l.length, 0);
console.log('qua-tu.js', js.length, 'bytes · ls', Object.keys(T.ls).length, 'ngày', dem(T.ls), 'thẻ · sd', Object.keys(T.sd).length, 'ngày', dem(T.sd), 'thẻ');
