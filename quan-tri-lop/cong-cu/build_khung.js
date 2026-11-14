// Sinh quan-tri-lop/khung.js (danh sách buổi 0–48 của hai lớp) từ khung 48 buổi. Chạy ở gốc repo: node quan-tri-lop/cong-cu/build_khung.js
const fs = require('fs');
const ls = JSON.parse(fs.readFileSync('chuong-trinh/cong-cu/khung/grid/mang/little-seed48.json', 'utf8')).buoi;
global.window = {}; require('../../seedling/day/day-data.js');
const S = window.DAY.sess;
const short = s => String(s || '').replace(/^Buổi dạy \d+\.\s*/, '').replace(/\s+/g, ' ').trim();
const out = { ls: ls.map(b => ({ n: b.buoi, tuan: b.tuan, u: String(b.unit), vai: b.vai, t: short(b.label).slice(0, 110), days: b.ngay_web || [] })),
  sd: [{ n: 0, tuan: 0, u: '1', vai: 'Khai giảng', t: 'Khai giảng · làm quen cô, bạn, lớp', days: [] }]
    .concat(Object.keys(S).map(Number).sort((a, b) => a - b).map(n => ({ n, u: (S[n].units || []).join('+'), vai: String(S[n].t).replace(/^.*?:\s*/, ''), t: short(S[n].about).slice(0, 110), days: S[n].days || [] }))) };
fs.writeFileSync('quan-tri-lop/khung.js', '/* sinh bởi cong-cu/build_khung.js, đừng sửa tay */\nwindow.KHUNG = ' + JSON.stringify(out) + ';\n');
console.log('ls', out.ls.length, 'sd', out.sd.length);
