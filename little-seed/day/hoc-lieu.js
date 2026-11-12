/* =====================================================================
   HỌC LIỆU IN · web dạy lớp offline 48 buổi (Little Seed, Seedling) – mẫu Unit 1–3, buổi 1–11 (11/11/2026)
   Dữ liệu: hoc-lieu-data.js (sinh bởi chuong-trinh/cong-cu/hoc-lieu/build_hoc_lieu.py từ web học).
   #/                 danh sách theo unit và buổi
   #/u/<unit>/<loại>  bộ đồ dùng in của unit: flash, mini, bingo, strips, puppets, names, bigbook, chant, craft, check, reader, sbt, key
   #/b/<buổi>         sách bài tập của buổi
   Đồ của con (thẻ, phiếu, sách bài tập, reader) không có chữ tiếng Việt; phần hướng dẫn cho cô thì có.
   ===================================================================== */
(function () {
const H = window.HL, app = document.getElementById('app');
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const src = p => !p ? '' : (p.startsWith('to-mau/') ? p : H.root + p);
const img = (p, st) => p ? `<img src="${esc(src(p))}" style="${st || ''}" alt="">` : '';
const U = k => H.units.find(u => u.key === k);
const chunk = (a, n) => a.reduce((r, x, i) => (i % n ? r[r.length - 1].push(x) : r.push([x]), r), []);
const LS = H.level === 'LS';
const ICON = {
  crayon: '<svg class="ico" viewBox="0 0 40 40"><rect x="8" y="14" width="24" height="12" rx="3" fill="#F2C14E" stroke="#333" stroke-width="1.6" transform="rotate(-35 20 20)"/><path d="M27 6 L35 4 L33 12 Z" fill="#C8372D" stroke="#333" stroke-width="1.4"/></svg>',
  pencil: '<svg class="ico" viewBox="0 0 40 40"><path d="M8 32 L10 24 L28 6 L34 12 L16 30 Z" fill="#F2C14E" stroke="#333" stroke-width="1.6"/><path d="M8 32 L10 24 L16 30 Z" fill="#fff" stroke="#333" stroke-width="1.4"/></svg>',
  link: '<svg class="ico" viewBox="0 0 40 40"><circle cx="8" cy="12" r="4" fill="#333"/><circle cx="32" cy="28" r="4" fill="#333"/><path d="M8 12 C 20 12, 20 28, 32 28" fill="none" stroke="#C8372D" stroke-width="2.4"/></svg>',
  glue: '<svg class="ico" viewBox="0 0 40 40"><rect x="13" y="12" width="14" height="22" rx="3" fill="#7CC4E8" stroke="#333" stroke-width="1.6"/><rect x="15" y="5" width="10" height="8" rx="2" fill="#F2C14E" stroke="#333" stroke-width="1.6"/></svg>',
  tick: '<svg class="ico" viewBox="0 0 40 40"><path d="M7 21 L16 30 L33 10" fill="none" stroke="#2E8B80" stroke-width="4"/></svg>',
  scissors: '<svg class="ico" viewBox="0 0 40 40"><circle cx="10" cy="29" r="5" fill="none" stroke="#333" stroke-width="2"/><circle cx="22" cy="31" r="5" fill="none" stroke="#333" stroke-width="2"/><path d="M13 25 L33 6 M19 27 L34 12" stroke="#333" stroke-width="2"/></svg>',
  ear: '<svg class="ico" viewBox="0 0 40 40"><path d="M14 30 C 8 22, 10 8, 21 7 C 31 7, 33 17, 27 22 C 23 25, 24 30, 19 32 C 16 33, 15 32, 14 30" fill="#FCD9B6" stroke="#333" stroke-width="1.6"/></svg>',
};
function hz(ch, upto, color) {   // chữ Hán theo nét (hanzi-writer-data); upto = số nét vẽ, nét cuối màu đỏ
  const st = (H.hz || {})[ch]; if (!st) return `<svg viewBox="0 0 1024 1024"><text x="512" y="800" font-size="900" text-anchor="middle" fill="${color || '#ccc'}">${esc(ch)}</text></svg>`;
  const n = upto == null ? st.length : upto;
  return `<svg viewBox="0 0 1024 1024"><g transform="scale(1,-1) translate(0,-900)">${st.map((d, i) => `<path d="${d}" fill="${i < n ? (upto != null && i === n - 1 ? '#C8372D' : (color || '#333')) : '#EEE'}"/>`).join('')}</g></svg>`;
}
const pages = [];
const pg = (inner, land, cls) => pages.push(`<div class="pg ${land ? 'l' : ''} ${cls || ''}">${inner}</div>`);
const head = (t, sub) => `<div class="hd"><div><div class="t">${t}</div>${sub ? `<div style="font-size:10pt;color:#888">${sub}</div>` : ''}</div><div class="nm">Name · <span class="zh">名字</span>: ______________</div></div>`;
const tag = s => `${LS ? 'Little Seed' : 'Seedling'} · ${s}`;
function show(title, back, note) {
  app.innerHTML = `<div class="top noprint"><a class="btn" href="${back}">◀ Danh sách</a><b>${esc(title)}</b><span class="sp"></span><button class="btn p" onclick="window.print()">🖨 In / Lưu PDF</button></div>
  ${note ? `<div class="wrap noprint"><div class="note">${note}</div></div>` : ''}<div class="pw">${pages.join('') || '<div class="wrap">Chưa có nội dung.</div>'}</div>`;
  pages.length = 0; window.scrollTo(0, 0);
}
const KIND = {
  flash: ['Flashcard lớn (A4 ngang)', 'Mặt tranh cho con, mặt chữ cho cô · gấp đôi dán lưng'],
  mini: ['Thẻ mini tranh – chữ Anh – chữ Trung', 'Memory, Go fish, Đập thẻ, ghép tranh – chữ'],
  bingo: ['Bingo 3 × 3', '4 bảng khác nhau · cô đọc tiếng Anh rồi tiếng Trung'],
  strips: ['Dải câu đôi bạn', 'Câu của truyện unit: một bạn nói tiếng Anh, bạn kia nói tiếng Trung'],
  puppets: ['Rối que nhân vật', 'Cắt, dán que · đóng vai truyện unit'],
  names: ['Thẻ tên của con', 'Dùng khi hát vè chào, vòng hỏi tên'],
  bigbook: ['Big book in (A4 ngang)', 'Đóng gáy hoặc kẹp file · cô đọc, con chỉ tranh và điền tên mình'],
  chant: ['Lời vè (treo lớp)', 'Chữ hoa là phách mạnh · vỗ tay theo phách'],
  craft: ['Thủ công của unit', 'Hướng dẫn cho cô + mẫu cắt, tô cho con'],
  check: ['Phiếu cuối unit', 'Con nghe – khoanh tranh · kèm lời cô đọc và đáp án'],
  reader: ['Reader A5', 'Truyện in A5 (2 trang mỗi tờ A4 ngang) để con đọc ở nhà'],
  sbt: [LS ? 'Phiếu tô – dán cả unit' : 'Sách bài tập cả unit', LS ? '1 trang mỗi buổi' : '2 trang mỗi buổi: trang Anh, trang Trung'],
  key: ['Đáp án sách bài tập', 'Cho cô chấm'],
};

/* ---------------- trang chủ ---------------- */
function home() {
  app.innerHTML = `<div class="top"><b>🖨 ${esc(H.title)} · Web dạy · Học liệu in</b><span class="sp"></span><a class="btn" href="${H.root}khai-giang/?lop=${LS ? 'ls' : 'sd'}">🎉 Buổi 0 · Khai giảng</a><a class="btn" href="${H.root}${H.web}/?gv=1">Web học của con</a>${LS ? '' : '<a class="btn" href="../">Web dạy 48 buổi</a>'}</div>
  <div class="wrap">
    <div class="note"><b>Mẫu Unit 1–3 (buổi 1–11) chờ chị duyệt.</b> Mở từng mục rồi bấm <b>In / Lưu PDF</b> (chọn khổ A4, lề "Không", bật "Đồ họa nền"). Tranh, từ, câu, big book, vè lấy đúng từ web học con đã gặp. Đồ của con không in chữ tiếng Việt.
    ${LS ? 'Little Seed lớp offline có hiện chữ (NL-4).' : 'Sách bài tập Seedling: trang tiếng Anh khó hơn trang tiếng Trung (lớp đã có tiếng Anh Pre A1).'}</div>
    ${H.units.map(u => `<div class="ucard"><h2>${esc(u.name)} · <span class="zh">${esc(u.name_zh)}</span></h2>
      <div class="muted">Ngày web ${u.days[0]}–${u.days[u.days.length - 1]} · ${u.words.length} từ · truyện ${u.parts.length} phần · big book ${u.bb.map(b => esc(b.title)).join(', ')} · thủ công: ${esc(u.craft.name)}</div>
      <div class="links">${Object.entries(KIND).filter(([k]) => k !== 'names' || u.key === '1').map(([k, [t, d]]) => `<a href="#/u/${u.key}/${k}" title="${esc(d)}">🖨 ${esc(t)}</a>`).join('')}</div>
      <table class="ss"><tr><th>Buổi</th><th>Nội dung buổi</th><th>Ngày web</th><th>${LS ? 'Phiếu tô – dán' : 'Sách bài tập'}</th></tr>
      ${H.sessions.filter(s => s.unit === u.key).map(s => `<tr><td><b>${s.n}</b></td><td>${esc(s.t.replace(/^Buổi \d+ trên lớp · /, ''))}<div class="muted">${esc(s.about)}</div></td><td>${s.days.join(', ')}</td>
        <td><a href="#/b/${s.n}">🖨 Buổi ${s.n}</a><div class="muted">${LS ? 'tô tranh truyện · nối tranh · dán ảnh' : esc(s.wb.en.words.map(w => w.w).join(', ')) + ' · <span class="zh">' + esc(s.wb.zh.chars.join(' ')) + '</span>'}</div></td></tr>`).join('')}</table></div>`).join('')}
  </div>`;
}

/* ---------------- đồ dùng in theo unit ---------------- */
function kit(u, kind) {
  const W = u.words, P = W.filter(w => w.line && (u.pics || []).includes(w.img));
  if (kind === 'flash') W.forEach(w => pg(`<div style="display:grid;grid-template-columns:1fr 1fr;height:100%"><div class="cell" style="border-right:.5mm dashed #999">${img(w.img, 'max-height:150mm;max-width:125mm')}</div>
    <div class="cell"><div class="en" style="font-size:${w.en.length > 14 ? 30 : 46}pt">${esc(w.en)}</div><div class="zh" style="font-size:${w.zh.length > 4 ? 40 : 60}pt;font-weight:700;margin-top:6mm">${esc(w.zh)}</div><div class="py" style="font-size:20pt">${esc(w.py)}</div></div></div>`, true));
  if (kind === 'mini') [['img', 'tranh'], ['en', 'English'], ['zh', '中文']].forEach(([f]) => chunk(f === 'img' ? W.filter(w => (u.pics || []).includes(w.img)) : W, 12).forEach(ch => pg(`<div class="ph"><span>${tag(u.name)} · ${f === 'img' ? 'picture cards' : f === 'en' ? 'word cards' : '汉字卡'}</span>${ICON.scissors}</div>
    <div class="grid" style="grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(4,64mm)">${ch.map(w => `<div class="cell cut">${f === 'img' ? img(w.img, 'max-height:54mm') : f === 'en' ? `<div class="en" style="font-size:${w.en.length > 12 ? 16 : 24}pt">${esc(w.en)}</div>` : `<div class="zh" style="font-size:${w.zh.length > 4 ? 22 : 34}pt;font-weight:700">${esc(w.zh)}</div><div class="py" style="font-size:12pt">${esc(w.py)}</div>`}</div>`).join('')}</div>`)));
  if (kind === 'bingo') { const pool = P.length >= 9 ? P : W; const boards = [0, 1, 2, 3].map(b => { const a = pool.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (i * 7 + b * 13 + 5) % (i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, 9); });
    chunk(boards, 2).forEach((pair, pi) => pg(`<div class="ph"><span>${tag(u.name)} · Bingo · 宾果</span></div>${pair.map((b, k) => `<div style="margin:3mm auto;width:150mm"><b>Bingo ${pi * 2 + k + 1}</b><div class="grid" style="grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,42mm);border:.6mm solid #333">${b.map(w => `<div class="cell" style="border:.3mm solid #999">${img(w.img, 'max-height:30mm')}<div style="font-size:9pt" class="en">${esc(w.en)}</div></div>`).join('')}</div></div>`).join('')}`));
    pg(`<div class="ph"><span>${tag(u.name)} · Bingo · calling cards · 叫号卡</span>${ICON.scissors}</div><div class="grid" style="grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(6,42mm)">${pool.slice(0, 24).map(w => `<div class="cell cut"><div class="en" style="font-size:13pt">${esc(w.en)}</div><div class="zh" style="font-size:16pt">${esc(w.zh)}</div><div class="py" style="font-size:9pt">${esc(w.py)}</div></div>`).join('')}</div>`); }
  if (kind === 'strips') chunk(u.strips, 6).forEach(ch => pg(`<div class="ph"><span>${tag(u.name)} · pair strips · 对话条</span>${ICON.scissors}</div>${ch.map(x => `<div class="cut" style="display:grid;grid-template-columns:1fr 1fr;height:42mm;margin-bottom:2mm">
    <div class="cell" style="border-right:.4mm dashed #888;align-items:flex-start;padding-left:5mm"><div class="en" style="font-size:${x.en.length > 40 ? 15 : 19}pt;text-align:left">${esc(x.en)}</div></div>
    <div class="cell" style="align-items:flex-start;padding-left:5mm"><div class="zh" style="font-size:${x.zh.length > 14 ? 17 : 22}pt;font-weight:700;text-align:left">${esc(x.zh)}</div><div class="py" style="font-size:11pt;text-align:left">${esc(x.py)}</div></div></div>`).join('')}`));
  if (kind === 'puppets') chunk(u.chars, 6).forEach(ch => pg(`<div class="ph"><span>${tag(u.name)} · stick puppets</span>${ICON.scissors}</div><div class="grid" style="grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,130mm)">${ch.map(c => `<div class="cell"><div class="cut" style="border-radius:50% 50% 8mm 8mm;width:58mm;height:92mm;display:flex;align-items:flex-end;justify-content:center;padding:2mm">${img(c.img, 'max-height:86mm')}</div>
    <div style="width:8mm;height:28mm;border:.4mm dashed #888;border-top:0;background:repeating-linear-gradient(45deg,#f6e3b0 0 3mm,#fff 3mm 6mm)"></div><div class="en" style="font-size:12pt">${esc(c.name)}</div></div>`).join('')}</div>`));
  if (kind === 'names') { const k4 = (u.craft.kids || u.chars.filter(c => ['bong', 'leo', 'anna', 'xiaomei'].includes(c.key))).slice(0, 4); const all = Array.from({ length: 8 }, (_, i) => k4[i % k4.length]);
    pg(`<div class="ph"><span>${tag('name tags')}</span>${ICON.scissors}</div><div class="grid" style="grid-template-columns:1fr 1fr;grid-template-rows:repeat(4,66mm);gap:3mm">${all.map(c => `<div class="cut" style="border-radius:5mm;display:flex;align-items:center;gap:3mm;padding:3mm">${img(c.img, 'height:56mm')}<div><div class="en" style="font-size:16pt">My name is</div><div style="border-bottom:.5mm solid #333;height:12mm;width:50mm"></div><div class="zh" style="font-size:16pt;margin-top:3mm">我叫</div></div></div>`).join('')}</div>`); }
  if (kind === 'bigbook') u.bb.forEach(b => { pg(`<div class="cell" style="height:100%">${b.cover ? `<div style="width:100%;margin-bottom:6mm">${img(b.cover, 'max-height:118mm;border-radius:4mm')}</div>` : ''}<div class="en" style="font-size:44pt;color:#C8372D">${esc(b.title)}</div><div class="zh" style="font-size:44pt;font-weight:700;margin-top:6mm">${esc(b.title_zh)}</div><div style="margin-top:10mm;font-size:14pt">${tag(u.name)} · Big Book</div></div>`, true);
    b.pages.forEach((p, i) => pg(`<div style="display:grid;grid-template-columns:1.25fr 1fr;height:100%;gap:6mm"><div class="cell">${img(p.img, 'max-height:175mm')}</div><div class="cell" style="align-items:flex-start;text-align:left">
      <div class="en" style="font-size:${p.en.length > 40 ? 26 : 34}pt;line-height:1.25">${esc(p.en).replace(/___/g, '<span style="display:inline-block;border-bottom:.8mm solid #333;width:45mm"></span>')}</div>
      <div class="zh" style="font-size:${p.zh.length > 14 ? 26 : 34}pt;font-weight:700;margin-top:8mm;line-height:1.3">${esc(p.zh).replace(/___/g, '<span style="display:inline-block;border-bottom:.8mm solid #333;width:40mm"></span>')}</div>
      <div class="py" style="font-size:15pt;margin-top:3mm">${esc(p.py)}</div><div style="position:absolute;bottom:8mm;right:12mm;color:#aaa">${i + 1}</div></div></div>`, true)); });
  if (kind === 'chant') u.ve.forEach((v, vi) => pg(`${head(vi === 0 && u.key === '1' ? 'Hello and Goodbye · 你好，再见' : (u.bb[vi] ? esc(u.bb[vi].title) + ' · Chant' : 'Chant'), tag(u.name))}
    <div style="font-size:10pt;color:#888;margin-bottom:5mm">CAPITALS = strong beat · clap · 拍手</div>
    ${v.lines.map((l, i) => `<div style="display:grid;grid-template-columns:12mm 1fr;align-items:baseline;margin:0 0 7mm"><div style="font-size:20pt;color:#C8372D;font-weight:800">${i + 1}</div><div>
      <div class="en" style="font-size:24pt;letter-spacing:.3mm">${esc(l.en)}</div><div class="zh" style="font-size:24pt;font-weight:700">${esc(l.zh)}</div><div class="py" style="font-size:12pt">${esc(l.py)}</div></div></div>`).join('')}`));
  if (kind === 'craft') craft(u);
  if (kind === 'check') {
    pg(`${head(u.name + ' · Listen and circle', '<span class="zh">听一听，圈一圈</span>')}${u.check.map((q, i) => `<div style="display:grid;grid-template-columns:12mm repeat(3,1fr);align-items:center;height:38mm;border-bottom:.3mm solid #eee">
      <div style="font-size:20pt;font-weight:800;color:#C8372D">${i + 1}</div>${q.opts.map(o => `<div class="cell">${img(o, 'max-height:30mm')}</div>`).join('')}</div>`).join('')}`);
    pg(`<div class="hd"><div class="t">Phiếu cuối unit · lời cô đọc và đáp án</div></div><p style="font-size:12pt">Cô đọc mỗi câu 2 lần, con khoanh tranh đúng. Câu 1–3 tiếng Anh, câu 4–6 tiếng Trung. Mỗi câu đúng 1 điểm; 5–6: vững · 3–4: đang học · 0–2: cô ôn lại ở buổi sau. Ghi điểm vào Bảng của cô.</p>
      <table class="ss" style="font-size:13pt"><tr><th>Câu</th><th>Cô đọc</th><th>Đáp án (tranh thứ)</th></tr>${u.check.map((q, i) => `<tr><td>${i + 1}</td><td class="${q.l === 'zh' ? 'zh' : ''}">${esc(q.say)}</td><td>${q.ans + 1}</td></tr>`).join('')}</table>`); }
  if (kind === 'reader') u.readers.forEach(r => reader(r, u));
  if (kind === 'sbt') H.sessions.filter(s => s.unit === u.key).forEach(s => wb(s));
  if (kind === 'key') key(u);
}

function craft(u) {
  const c = u.craft;
  pg(`<div class="hd"><div class="t">${esc(c.name)}</div><div class="nm">${tag(u.name)}</div></div><p style="font-size:12pt"><b>Chuẩn bị:</b> ${esc(c.mat)}</p>
    <ol style="font-size:13pt;line-height:1.6">${c.steps.map(x => `<li>${esc(x)}</li>`).join('')}</ol>
    <div class="note" style="font-size:11pt">Trang này cho cô. Các trang sau là mẫu in cho con (không có chữ tiếng Việt).</div>`);
  if (c.kind === 'necklace') pg(`<div class="ph"><span>${tag('name necklace')}</span>${ICON.scissors}${ICON.crayon}</div><div class="grid" style="grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:5mm;height:262mm">${c.kids.map(k => `<div class="cut" style="border-radius:8mm;display:flex;flex-direction:column;align-items:center;padding:4mm;position:relative">
    <div style="position:absolute;top:4mm;left:12mm" class="dot"></div><div style="position:absolute;top:4mm;right:12mm" class="dot"></div>${img(k.line, 'height:68mm;margin-top:6mm')}
    <div class="en" style="font-size:15pt;margin-top:2mm">${esc(c.en)}</div><div style="border-bottom:.5mm solid #333;width:70mm;height:10mm"></div><div class="zh" style="font-size:15pt;margin-top:2mm">${esc(c.zh)}</div><div style="border-bottom:.5mm solid #333;width:70mm;height:10mm"></div></div>`).join('')}</div>`);
  if (c.kind === 'cake') pg(`<div class="ph"><span>${tag('birthday cake')}</span>${ICON.crayon}${ICON.scissors}${ICON.glue}</div><div class="cell" style="height:150mm">${img(c.cake, 'max-height:145mm')}</div>
    <div class="en" style="font-size:26pt;text-align:center">${esc(c.en)} <span class="zh">${esc(c.zh)}</span></div>
    <div class="grid" style="grid-template-columns:repeat(10,1fr);height:70mm;margin-top:6mm">${['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'].map((z, i) => `<div class="cut" style="margin:0 1mm;border-radius:2mm 2mm 0 0;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:3mm;background:repeating-linear-gradient(0deg,#fff 0 6mm,#fafafa 6mm 12mm)">
    <svg viewBox="0 0 20 30" style="width:7mm"><path d="M10 2 C 15 10, 15 16, 10 18 C 5 16, 5 10, 10 2 Z" fill="none" stroke="#333" stroke-width="1.4"/></svg><div class="en" style="font-size:16pt">${i + 1}</div><div class="zh" style="font-size:14pt">${z}</div></div>`).join('')}</div>`);
  if (c.kind === 'album') pg(`<div style="text-align:center"><div class="en" style="font-size:28pt;color:#C8372D">My Family</div><div class="zh" style="font-size:24pt;font-weight:700">我的家</div></div>
    <div class="grid" style="grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:6mm;height:236mm;margin-top:4mm">${c.slots.map(s => `<div style="border:1mm solid #F2C14E;border-radius:6mm;display:flex;flex-direction:column;padding:4mm">
    <div style="flex:1;border:.5mm dashed #bbb;border-radius:4mm;display:flex;align-items:center;justify-content:center">${img(s.line, 'max-height:70mm;opacity:.35')}</div>
    <div style="text-align:center;margin-top:3mm"><span class="en" style="font-size:18pt">This is my ${esc(s.en.toLowerCase())}.</span> <span class="zh" style="font-size:18pt">这是我${esc(s.zh)}。</span></div></div>`).join('')}</div>`);
  if (c.kind === 'puppet') { const part = (en, zh, w, h, r, extra) => `<div class="cut" style="width:${w}mm;height:${h}mm;border-radius:${r};display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;margin:3mm">${extra || ''}<div class="en" style="font-size:12pt">${esc(en)}</div><div class="zh" style="font-size:12pt">${esc(zh)}</div></div>`;
    const dot = (t, l) => `<span class="dot" style="position:absolute;top:${t};left:${l}"></span>`;
    pg(`<div class="ph"><span>${tag('paper puppet · My Body')}</span>${ICON.crayon}${ICON.scissors}</div><div style="display:flex;flex-wrap:wrap;align-items:flex-start;justify-content:center">
      ${part('head', '头', 70, 70, '50%', `<div style="width:56mm;height:40mm;overflow:hidden;display:flex;justify-content:center">${img(c.face, 'width:56mm;object-fit:cover;object-position:top;height:120mm')}</div>`)}
      ${part('body', '身体', 70, 95, '10mm', dot('4mm', '32mm') + dot('14mm', '3mm') + dot('14mm', '63mm') + dot('85mm', '18mm') + dot('85mm', '48mm'))}
      ${part('arm', '胳膊', 22, 80, '11mm', dot('4mm', '9mm'))}${part('arm', '胳膊', 22, 80, '11mm', dot('4mm', '9mm'))}
      ${part('leg', '腿', 26, 95, '12mm', dot('4mm', '11mm'))}${part('leg', '腿', 26, 95, '12mm', dot('4mm', '11mm'))}
      ${part('hand', '手', 30, 30, '50%')}${part('hand', '手', 30, 30, '50%')}${part('foot', '脚', 40, 24, '12mm')}${part('foot', '脚', 40, 24, '12mm')}</div>`); }
  if (c.kind === 'crown') { const half = side => `<svg viewBox="0 0 400 140" style="width:186mm;height:65mm;display:block;margin:2mm auto"><path d="M5 135 L5 45 L55 95 L105 20 L155 95 L205 30 L255 95 L305 20 L355 95 L395 45 L395 135 Z" fill="#fff" stroke="#555" stroke-width="2" stroke-dasharray="8 5"/>
      <text x="200" y="125" font-size="26" text-anchor="middle" style="font-family:'Be Vietnam Pro','Noto Sans SC',sans-serif" font-weight="800">${side ? 'Happy birthday!' : '生日快乐！'}</text></svg>`;
    pg(`<div class="ph"><span>${tag('birthday crown')}</span>${ICON.crayon}${ICON.scissors}${ICON.glue}</div>${half(1)}${half(0)}
      <div class="en" style="text-align:center;font-size:18pt;margin:4mm 0">${esc(c.en)} <span class="zh">${esc(c.zh)}</span></div>
      <div class="grid" style="grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,48mm)">${c.nums.map(n => `<div class="cell"><div class="cut" style="width:44mm;height:44mm;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center"><div class="en" style="font-size:30pt">${n.n}</div><div style="font-size:11pt">${esc(n.en)} <span class="zh">${esc(n.zh)}</span></div></div></div>`).join('')}</div>`); }
  if (c.kind === 'frame') pg(`<div style="text-align:center"><div class="en" style="font-size:26pt;color:#C8372D">Our Family Photos</div><div class="zh" style="font-size:22pt;font-weight:700">我们的家庭照片</div></div>
    <div class="grid" style="grid-template-columns:1fr 1fr;grid-template-rows:repeat(3,1fr);gap:5mm;height:240mm;margin-top:3mm">${c.slots.map(([en, zh]) => `<div style="border:1mm solid #F2C14E;border-radius:5mm;display:flex;flex-direction:column;padding:3mm">
    <div style="flex:1;border:.5mm dashed #bbb;border-radius:3mm"></div><div style="text-align:center;margin-top:2mm"><span class="en" style="font-size:14pt">He / She is my ${esc(en)}.</span><br><span class="zh" style="font-size:14pt">他 / 她是我${esc(zh)}。</span></div></div>`).join('')}</div>`);
}

function reader(r, u) {
  const half = inner => `<div class="a5">${inner}</div>`;
  const ps = [half(`<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center"><div class="en" style="font-size:30pt;color:#C8372D">${esc(r.t)}</div><div class="zh" style="font-size:28pt;font-weight:700">${esc(r.zh)}</div>
    ${img(r.pages[0] && r.pages[0].img, 'max-height:85mm;margin:6mm 0;border-radius:4mm')}<div style="font-size:10pt">${tag('Reader')}</div></div>`)];
  r.pages.forEach((p, i) => ps.push(half(`<div style="flex:1;display:flex;align-items:center;justify-content:center">${img(p.img, 'max-width:128mm;max-height:112mm;border-radius:4mm')}</div>
    <div class="en" style="font-size:${p.en.length > 50 ? 13 : 16}pt;margin-top:3mm">${esc(p.en)}</div><div class="zh" style="font-size:${p.zh.length > 20 ? 14 : 17}pt;font-weight:700">${esc(p.zh)}</div><div class="py" style="font-size:10pt">${esc(p.py)}</div>
    <div style="text-align:right;color:#aaa;font-size:9pt">${i + 1}</div>`)));
  ps.push(half(`<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center"><div class="en" style="font-size:22pt">The End · <span class="zh">完</span></div><div style="margin-top:8mm;font-size:12pt">Read it again with Mummy and Daddy!<br><span class="zh">和爸爸妈妈再读一遍！</span></div></div>`));
  chunk(ps, 2).forEach(pair => pg(`<div style="display:flex;height:100%;margin:-11mm -12mm">${pair.join('')}</div>`, true));
}

/* ---------------- sách bài tập ---------------- */
function wb(s) {
  const u = U(s.unit), w = s.wb;
  if (LS) {
    const m = w.match, ord = w.order;
    pg(`${head(tag('Session ' + s.n), esc(u.name))}
      <div class="sec"><div class="lab">${ICON.crayon} Colour · <span class="zh">涂一涂</span></div><div class="cell" style="height:76mm">${img(w.scene.line, 'max-height:74mm')}</div>
        <div style="text-align:center"><span class="en" style="font-size:14pt">${esc(w.scene.en)}</span> · <span class="zh" style="font-size:14pt">${esc(w.scene.zh)}</span></div></div>
      <div class="sec"><div class="lab">${ICON.link} Match · <span class="zh">连一连</span></div><div style="display:grid;grid-template-columns:1fr 30mm 1fr;align-items:center">
        ${m.map((x, i) => `<div class="cell" style="height:26mm;flex-direction:row;justify-content:flex-end;gap:3mm">${img(x.img, 'max-height:24mm')}<span class="dot"></span></div><div></div><div class="cell" style="height:26mm;flex-direction:row;justify-content:flex-start;gap:3mm"><span class="dot"></span>${img(m[ord[i]].line, 'max-height:24mm')}</div>`).join('')}</div></div>
      <div class="sec" style="height:54mm"><div class="lab">${ICON.glue} <span class="en">${esc(w.photo[0])}</span> · <span class="zh">${esc(w.photo[1])}</span></div><div style="border:.5mm dashed #bbb;border-radius:4mm;height:38mm;width:70mm;margin:0 auto"></div></div>`);
    return;
  }
  const e = w.en, z = w.zh;
  pg(`${head(tag('Session ' + s.n) + ' · English', esc(u.name))}
    <div class="sec"><div class="lab">${ICON.pencil} Trace and write.</div>${e.words.map(x => `<div style="display:grid;grid-template-columns:28mm 1fr;gap:3mm;align-items:center;margin-bottom:3mm"><div class="cell" style="height:26mm;border:.3mm solid #eee;border-radius:3mm">${x.img ? img(x.img, 'max-height:24mm') : ''}</div>
      <div>${guide(esc(x.w) + '\u2003\u2003' + esc(x.w))}${guide('')}</div></div>`).join('')}</div>
    <div class="sec"><div class="lab">${ICON.tick} Look and read. Tick ✓ or cross ✗.</div>${e.tick.map((t, i) => `<div style="display:grid;grid-template-columns:42mm 1fr 22mm;gap:4mm;align-items:center;border-bottom:.3mm solid #eee;padding:2mm 0">
      <div class="cell" style="height:36mm">${img(t.line, 'max-height:35mm')}</div><div class="en" style="font-size:16pt;font-weight:600">${i + 1}. ${esc(t.en)}</div><div><span class="box">✓</span> <span class="box">✗</span></div></div>`).join('')}</div>`);
  pg(`${head(tag('Session ' + s.n) + ' · 中文', esc(u.name))}
    <div class="sec"><div class="lab">${ICON.pencil} <span class="zh">描一描，写一写</span></div>${z.chars.map(ch => { const n = ((H.hz || {})[ch] || []).length; return `<div style="margin-bottom:4mm">
      <div style="display:flex;align-items:center;gap:3mm;margin-bottom:2mm"><span class="zh" style="font-size:22pt;font-weight:700">${esc(ch)}</span><span class="py" style="font-size:13pt">${esc(pyOf(ch))}</span><span style="font-size:10pt;color:#888">${n} 笔</span>
      ${Array.from({ length: n }, (_, k) => `<span class="so">${hz(ch, k + 1)}</span>`).join('')}</div>
      <div>${[0, 1, 2, 3, 4, 5, 6].map(k => `<span class="tzg">${k < 3 ? hz(ch, null, k === 0 ? '#999' : '#DDD') : ''}</span>`).join('')}</div></div>`; }).join('')}</div>
    <div class="sec"><div class="lab">${ICON.link} <span class="zh">连一连</span></div><div style="display:grid;grid-template-columns:1fr 34mm 1fr;align-items:center">
      ${z.match.map((x, i) => { const y = z.match[z.order[i]]; return `<div class="cell" style="height:30mm;flex-direction:row;justify-content:flex-end;gap:3mm">${img(x.img, 'max-height:28mm')}<span class="dot"></span></div><div></div>
      <div style="display:flex;align-items:center;gap:3mm"><span class="dot"></span><div><div class="zh" style="font-size:22pt;font-weight:700">${esc(y.zh)}</div><div class="py" style="font-size:12pt">${esc(y.py)}</div></div></div>`; }).join('')}</div></div>`);
}
function guide(t) {   // dòng kẻ 4 đường (đường chân chữ ở 11,4 mm), chữ mẫu xám để con tô
  return `<svg viewBox="0 0 150 16" style="width:150mm;height:16mm;display:block"><line x1="0" x2="150" y1="3" y2="3" stroke="#9ec7e0" stroke-width=".3"/><line x1="0" x2="150" y1="7.6" y2="7.6" stroke="#e7b7b7" stroke-width=".25" stroke-dasharray="1.2 .8"/>
    <line x1="0" x2="150" y1="11.4" y2="11.4" stroke="#e7b7b7" stroke-width=".3"/><line x1="0" x2="150" y1="15" y2="15" stroke="#9ec7e0" stroke-width=".3"/>
    ${t ? `<text x="2" y="11.4" font-size="11.5" fill="#BDBDBD" style="font-family:'Be Vietnam Pro',Arial,sans-serif;letter-spacing:1.4px">${t}</text>` : ''}</svg>`;
}
function pyOf(ch) { for (const u of H.units) for (const w of u.words) { const i = [...w.zh].indexOf(ch); if (i >= 0) { const p = (w.py || '').split(/\s+/); if (p.length === [...w.zh].filter(c => /[一-鿿]/.test(c)).length) return p[[...w.zh].slice(0, i).filter(c => /[一-鿿]/.test(c)).length]; } } return ''; }
function key(u) {
  const ss = H.sessions.filter(s => s.unit === u.key);
  pg(`<div class="hd"><div class="t">Đáp án ${LS ? 'phiếu tô – dán' : 'sách bài tập'} · ${esc(u.name)}</div></div>
    <table class="ss" style="font-size:12pt"><tr><th>Buổi</th><th>Nối (trái → phải)</th>${LS ? '' : '<th>Đọc – đánh dấu</th><th>Nối tiếng Trung</th>'}</tr>
    ${ss.map(s => { const w = s.wb; if (LS) return `<tr><td>${s.n}</td><td>${w.match.map((x, i) => `${i + 1} → ${w.order.indexOf(i) + 1} (${esc(x.en)})`).join(' · ')}</td></tr>`;
      return `<tr><td>${s.n}</td><td>—</td><td>${w.en.tick.map((t, i) => `${i + 1}. ${t.ok ? '✓' : '✗ (đúng: ' + esc(t.goc) + ')'}`).join('<br>')}</td>
        <td class="zh">${w.zh.match.map((x, i) => `${i + 1} → ${w.zh.order.indexOf(i) + 1} (${esc(x.zh)})`).join(' · ')}</td></tr>`; }).join('')}</table>
    <p style="font-size:11pt;color:#666">${LS ? 'Phiếu tô – dán khoảng 10 phút, ba mẹ ngồi cùng con. Cô xem trang dán ảnh ở buổi sau và cho con kể "This is me! / This is my ___."' : 'Trang tiếng Anh: tô 2 lần rồi tự viết 1 lần trên dòng trống; đọc câu, nhìn tranh, đánh dấu. Trang tiếng Trung: tô theo thứ tự nét (nét đỏ là nét mới), viết ở ô trống.'}</p>`);
}

function route() {
  const h = location.hash.replace(/^#\/?/, '').split('/');
  if (h[0] === 'u' && U(h[1])) { const u = U(h[1]); kit(u, h[2] || 'flash'); return show(`${u.name} · ${(KIND[h[2]] || KIND.flash)[0]}`, '#/', esc((KIND[h[2]] || KIND.flash)[1])); }
  if (h[0] === 'b') { const s = H.sessions.find(x => x.n === +h[1]); if (s) { wb(s); return show(`Buổi ${s.n} · ${LS ? 'phiếu tô – dán' : 'sách bài tập'}`, '#/', esc(s.t)); } }
  home();
}
window.addEventListener('hashchange', route); route();
})();
