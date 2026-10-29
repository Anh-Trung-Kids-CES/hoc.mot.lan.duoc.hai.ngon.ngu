/* Chép Code.gs và QuanTri.gs của GitHub vào thư mục vừa "clasp pull".
 * An toàn: chỉ ghi đè khi tệp đang có trong Apps Script đúng bằng một bản đã từng có trên GitHub
 * (200 commit gần nhất) hoặc đã bằng bản mới. Nếu ai đó sửa thẳng trong Apps Script, dừng lại để không mất phần sửa đó. */
const fs = require('fs'), path = require('path'), { execSync } = require('child_process');
const dir = process.argv[2];
const norm = s => String(s).replace(/\r\n/g, '\n').replace(/\s+$/, '');
const lichSu = p => {
  const shas = execSync(`git log -n 200 --format=%H -- ${p}`).toString().trim().split('\n').filter(Boolean);
  const out = new Set();
  for (const h of shas) { try { out.add(norm(execSync(`git show ${h}:${p}`, { maxBuffer: 64e6 }).toString())); } catch (e) {} }
  return out;
};
const tep = fs.readdirSync(dir).filter(f => /\.(js|gs)$/.test(f));
const timChinh = () => tep.find(f => f !== 'QuanTri.js' && f !== 'QuanTri.gs' && /function doPost\(/.test(fs.readFileSync(path.join(dir, f), 'utf8'))) || 'Code.js';
const cap = [['apps-script/QuanTri.gs', tep.find(f => /^QuanTri\.(js|gs)$/.test(f)) || 'QuanTri.js'], ['apps-script/Code.gs', timChinh()]];
let loi = false;
for (const [nguon, dich] of cap) {
  const moi = fs.readFileSync(nguon, 'utf8'), d = path.join(dir, dich);
  if (fs.existsSync(d)) {
    const dang = norm(fs.readFileSync(d, 'utf8'));
    if (dang === norm(moi)) { console.log(`${dich}: đã là bản mới`); continue; }
    if (!lichSu(nguon).has(dang)) { console.log(`::error::${dich} trong Apps Script khác mọi bản trên GitHub (có người sửa thẳng trong Apps Script). Đưa phần sửa đó lên GitHub trước, rồi chạy lại.`); loi = true; continue; }
  }
  fs.writeFileSync(d, moi);
  console.log(`${dich} ← ${nguon}`);
}
if (loi) process.exit(1);
