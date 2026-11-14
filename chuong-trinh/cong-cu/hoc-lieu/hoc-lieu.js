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
const U = k => H.units.find(u => u.key === k) || { key: k, name: 'Review · 复习', words: [] };
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
  document.querySelectorAll('.pg .fit').forEach(f => { const pgEl = f.closest('.pg'), mm = pgEl.getBoundingClientRect().height / 297, lim = 283 * mm; let k = 1;
    for (let i = 0; i < 8; i++) { const h = f.getBoundingClientRect().bottom - pgEl.getBoundingClientRect().top; if (h <= lim) break; k *= lim / h * .995; f.style.zoom = k; } });
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
  sbt: [LS ? 'Phiếu cả unit' : 'Sách bài tập cả unit', LS ? '1 phiếu mỗi buổi: chép · khoanh · nối chữ Trung · nối câu · về mình' : '2 trang mỗi buổi: trang Anh, trang Trung'],
  key: ['Đáp án sách bài tập', 'Cho cô chấm'],
};

/* ---------------- trang chủ ---------------- */
function home() {
  app.innerHTML = `<div class="top"><b>🖨 ${esc(H.title)} · Web dạy · Học liệu in</b><span class="sp"></span><a class="btn" href="#/book">📘 Cả cuốn sách bài tập</a><a class="btn" href="#/bookkey">✅ Đáp án cả cuốn</a><a class="btn" href="${H.root}khai-giang/?lop=${LS ? 'ls' : 'sd'}">🎉 Buổi 0 · Khai giảng</a><a class="btn" href="${H.root}${H.web}/?gv=1">Web học của con</a>${LS ? '' : '<a class="btn" href="../">Web dạy 48 buổi</a>'}</div>
  <div class="wrap">
    <div class="note"><b>Mẫu Unit 1–3 (buổi 1–11) chờ chị duyệt.</b> Mở từng mục rồi bấm <b>In / Lưu PDF</b> (chọn khổ A4, lề "Không", bật "Đồ họa nền"). Tranh, từ, câu, big book, vè lấy đúng từ web học con đã gặp. Đồ của con không in chữ tiếng Việt.
    ${LS ? 'Little Seed lớp offline có hiện chữ (NL-4).' : 'Sách bài tập Seedling: trang tiếng Anh khó hơn trang tiếng Trung (lớp đã có tiếng Anh Pre A1).'}</div>
    ${H.units.map(u => `<div class="ucard"><h2>${esc(u.name)} · <span class="zh">${esc(u.name_zh)}</span></h2>
      <div class="muted">Ngày web ${u.days[0]}–${u.days[u.days.length - 1]} · ${u.words.length} từ · truyện ${u.parts.length} phần · big book ${u.bb.map(b => esc(b.title)).join(', ')} · thủ công: ${esc(u.craft.name)}</div>
      <div class="links">${Object.entries(KIND).filter(([k]) => k !== 'names' || u.key === '1').map(([k, [t, d]]) => `<a href="#/u/${u.key}/${k}" title="${esc(d)}">🖨 ${esc(t)}</a>`).join('')}</div>
      <table class="ss"><tr><th>Buổi</th><th>Nội dung buổi</th><th>Ngày web</th><th>${LS ? 'Phiếu tô – dán' : 'Sách bài tập'}</th></tr>
      ${H.sessions.filter(s => s.unit === u.key).map(s => `<tr><td><b>${s.n}</b></td><td>${esc(s.t.replace(/^Buổi \d+ trên lớp · /, ''))}<div class="muted">${esc(s.about)}</div></td><td>${s.days.join(', ')}</td>
        <td><a href="#/b/${s.n}">🖨 Buổi ${s.n}</a><div class="muted">${s.wb2 ? 'bản 2 · ' + esc(s.wb2.add.join(', ') || 'ôn – tự dùng') + ' · <span class="zh">' + esc(s.wb2.zc.join(' ')) + '</span>' : LS ? 'tô tranh truyện · nối tranh · dán ảnh' : esc(s.wb.en.words.map(w => w.w).join(', ')) + ' · <span class="zh">' + esc(s.wb.zh.chars.join(' ')) + '</span>'}</div></td></tr>`).join('')}</table></div>`).join('')}
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
  if (kind === 'sbt') { H.sessions.filter(s => s.unit === u.key).forEach(s => wb(s)); chantPage(u); myPage(u); if (!LS) checkup(u); }
  if (kind === 'key') { key(u); key2(u); }
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
  if (s.wb2) return wb2(s);
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
  const ss = H.sessions.filter(s => s.unit === u.key && !s.wb2);
  if (!ss.length) return;
  pg(`<div class="hd"><div class="t">Đáp án ${LS ? 'phiếu tô – dán' : 'sách bài tập'} · ${esc(u.name)}</div></div>
    <table class="ss" style="font-size:12pt"><tr><th>Buổi</th><th>Nối (trái → phải)</th>${LS ? '' : '<th>Đọc – đánh dấu</th><th>Nối tiếng Trung</th>'}</tr>
    ${ss.map(s => { const w = s.wb; if (LS) return `<tr><td>${s.n}</td><td>${w.match.map((x, i) => `${i + 1} → ${w.order.indexOf(i) + 1} (${esc(x.en)})`).join(' · ')}</td></tr>`;
      return `<tr><td>${s.n}</td><td>—</td><td>${w.en.tick.map((t, i) => `${i + 1}. ${t.ok ? '✓' : '✗ (đúng: ' + esc(t.goc) + ')'}`).join('<br>')}</td>
        <td class="zh">${w.zh.match.map((x, i) => `${i + 1} → ${w.zh.order.indexOf(i) + 1} (${esc(x.zh)})`).join(' · ')}</td></tr>`; }).join('')}</table>
    <p style="font-size:11pt;color:#666">${LS ? 'Phiếu tô – dán khoảng 10 phút, ba mẹ ngồi cùng con. Cô xem trang dán ảnh ở buổi sau và cho con kể "This is me! / This is my ___."' : 'Trang tiếng Anh: tô 2 lần rồi tự viết 1 lần trên dòng trống; đọc câu, nhìn tranh, đánh dấu. Trang tiếng Trung: tô theo thứ tự nét (nét đỏ là nét mới), viết ở ô trống.'}</p>`);
}


/* ---------------- sách bài tập bản 2 (13/11/2026): Unit 1, 3 ---------------- */
const SMILE = (k) => `<svg viewBox="0 0 40 40" style="width:9mm;height:9mm"><circle cx="20" cy="20" r="17" fill="#fff" stroke="#333" stroke-width="2"/><circle cx="14" cy="16" r="2" fill="#333"/><circle cx="26" cy="16" r="2" fill="#333"/>${k === 0 ? '<path d="M11 24 Q20 34 29 24" fill="none" stroke="#333" stroke-width="2.4"/>' : k === 1 ? '<path d="M12 27 H28" stroke="#333" stroke-width="2.4"/>' : '<path d="M12 30 Q20 21 28 30" fill="none" stroke="#333" stroke-width="2.4"/>'}</svg>`;
const foot2 = lang => `<div style="position:absolute;left:12mm;right:12mm;bottom:8mm;display:flex;align-items:center;gap:4mm;border-top:.5mm solid var(--line);padding-top:2mm">
  <span class="en" style="font-size:12pt">${lang === 'zh' ? 'I can read it!' : 'I can say it!'}</span><span class="zh" style="font-size:12pt">${lang === 'zh' ? '我会读！' : '我会说！'}</span>
  <span class="sp" style="flex:1"></span>${[0, 1, 2].map(k => `<span style="display:inline-flex;align-items:center;gap:1mm">${SMILE(k)}<span class="box"></span></span>`).join('')}</div>`;
const qrBox = id => H.qr && H.qr[id] ? `<div style="display:flex;align-items:center;gap:1.5mm;padding:1mm 2.5mm;border-left:.4mm dashed #ccc;font-size:7.5pt;line-height:1.15;text-align:center"><div style="width:12.5mm;height:12.5mm">${H.qr[id]}</div><div><b>▶ Listen</b><br><span class="zh">听一听</span></div></div>` : '';
const hd2 = (s, lang) => {
  const w = s.wb2, u = U(s.unit);
  return `<div style="display:flex;align-items:stretch;border-radius:4mm;overflow:hidden;margin-bottom:3mm;border:.5mm solid ${lang === 'zh' ? '#C8372D' : '#2E8B80'}">
  <div style="background:${lang === 'zh' ? '#C8372D' : '#2E8B80'};color:#fff;padding:2mm 4mm;font-weight:800;font-size:13pt;display:flex;align-items:center;min-width:46mm">${lang === 'both' ? 'English · 中文' : lang === 'zh' ? '中文 · Chinese' : 'English'} · ${s.n}</div>
  <div style="flex:1;padding:1.5mm 4mm;display:flex;flex-direction:column;justify-content:center"><div style="font-weight:800;font-size:12pt;color:var(--red)">${/^\d+$/.test(u.key) ? 'Unit ' + esc(u.key) : 'Review'} · ${esc(w.band)}</div><div style="font-size:9pt;color:#777">${tag('Session ' + s.n)}</div></div>
  ${qrBox(lang === 'both' ? 'ls-s' + s.n : 'sd-s' + s.n + '-' + (lang === 'zh' ? 'zh' : 'en'))}
  <div style="padding:2mm 3mm;display:flex;align-items:center;font-size:10.5pt">Name · <span class="zh">名字</span>: ________</div></div>`;
};
const COL = { 1: '#F2C14E', 2: '#2E8B80', 3: '#C8372D', 4: '#7A5BA6', 5: '#D9548C' };
const blk = (n, title, zh, inner, extra) => `<div style="border:.5mm solid ${COL[n]};border-radius:4mm;padding:2mm 3mm 2mm;margin-bottom:2.5mm;position:relative;${extra || ''}">
  <div style="display:flex;align-items:center;gap:2mm;font-weight:800;font-size:11.5pt;margin-bottom:1.5mm"><span style="width:6.5mm;height:6.5mm;border-radius:50%;background:${COL[n]};color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:10pt">${n}</span>${title}${zh ? ` <span class="zh" style="font-weight:700">${zh}</span>` : ''}</div>${inner}</div>`;
const pic2 = (p, h, col) => p ? img(col ? p.img : p.line || p.img, `max-height:${h}mm;max-width:${h + 6}mm`) : '';
function gl(t, fill, h, lab) {   // dòng kẻ 4 đường với chữ mẫu; fill = màu chữ
  return `<svg viewBox="0 0 150 16" style="width:150mm;height:${h || 16}mm;display:block"><line x1="0" x2="150" y1="3" y2="3" stroke="#9ec7e0" stroke-width=".3"/><line x1="0" x2="150" y1="7.6" y2="7.6" stroke="#e7b7b7" stroke-width=".25" stroke-dasharray="1.2 .8"/>
    <line x1="0" x2="150" y1="11.4" y2="11.4" stroke="#e7b7b7" stroke-width=".3"/><line x1="0" x2="150" y1="15" y2="15" stroke="#9ec7e0" stroke-width=".3"/>
    ${t ? `<text x="2" y="11.4" font-size="${t.length > 12 ? 9.5 : 11.5}" fill="${fill || '#BDBDBD'}" style="font-family:'Be Vietnam Pro',Arial,sans-serif;letter-spacing:1px">${esc(t)}</text>` : ''}${lab ? `<text x="149" y="2.4" font-size="3" text-anchor="end" fill="#C8372D" font-weight="700">example ✔</text>` : ''}</svg>`;
}
const cellz = (ch, mode, sz) => `<span class="tzg" style="width:${sz}mm;height:${sz}mm">${mode ? hz(ch, null, mode === 'dark' ? '#333' : '#D4D4D4') : ''}</span>`;
function charBlock(ch, py, o) {   // một chữ: thông tin + nét + ô điền
  const n = ((H.hz || {})[ch] || []).length, sz = o.sz, ss = Math.min(10, Math.floor(o.sw / n));
  const strokes = Array.from({ length: n }, (_, k) => `<span class="so" style="width:${ss}mm;height:${ss}mm">${hz(ch, k + 1)}</span>`).join('');
  const cells = ['dark', 'grey', 'grey'].slice(0, o.nd).concat(Array(o.nb).fill(null)).map(m => cellz(ch, m, sz)).join('');
  return `<div style="display:flex;align-items:center;gap:3mm;margin-bottom:${o.gap || 1.5}mm"><div style="width:${o.iw}mm;flex:none"><span class="zh" style="font-size:24pt;font-weight:700">${esc(ch)}</span> <span class="py" style="font-size:12pt">${esc(py)}</span><div style="font-size:9pt;color:#888">${n} 笔</div></div>
    <div>${o.inline ? `<div style="display:flex;align-items:center;gap:2mm"><span style="white-space:nowrap">${cells}</span><span style="white-space:nowrap">${strokes}</span></div>` : `<div style="margin-bottom:1mm">${strokes}</div><div style="white-space:nowrap">${cells}</div>`}</div></div>`;
}
function medBlock(w, rh) {   // nối Anh ↔ Trung, đảo vị trí theo medperm
  const m = w.med, n = m.length, right = Array(n); m.forEach((x, i) => right[w.medperm[i]] = x);
  return `<div style="display:grid;grid-template-columns:1fr 30mm 1fr;align-items:center">${m.map((x, i) => `<div style="height:${rh || 11}mm;display:flex;align-items:center;justify-content:flex-end;gap:2mm" class="en"><span style="font-size:12pt;text-align:right">${esc(x.en)}</span><span class="dot"></span></div><div></div>
    <div style="display:flex;align-items:center;gap:2mm"><span class="dot"></span><div><div class="py" style="font-size:9pt;line-height:1.1">${esc(right[i].py)}</div><div class="zh" style="font-size:14pt;font-weight:700;line-height:1.1">${esc(right[i].zh)}</div></div></div>`).join('')}</div>`;
}
const answerBoxes = n => Array.from({ length: n }, () => `<span style="display:inline-block;width:9mm;height:9mm;border:.5mm solid #555;margin-right:1mm;border-radius:1.2mm"></span>`).join('');
const letterBoxes = l => l.map(c => `<span style="display:inline-block;width:9mm;height:9mm;border:.4mm solid #aaa;margin-right:1mm;border-radius:1.2mm;text-align:center;line-height:9mm;font-size:14pt;font-weight:700;background:#FFFBEA">${esc(c)}</span>`).join('');
const blank = '<span style="display:inline-block;border-bottom:.6mm solid #333;width:32mm;margin:0 1mm"></span>';
const bankBox = (list) => list.map(x => `<span style="display:inline-block;border:.4mm solid #888;border-radius:2mm;padding:.6mm 3mm;margin-right:2mm;font-size:12pt">${esc(x)}</span>`).join('');

function wb2(s) {
  const w = s.wb2;
  if (LS) return wb2LS(s);
  const zp = w.zpy;
  /* trang Anh */
  pg(`${hd2(s, 'en')}
  ${blk(1, 'Look and copy.', '', w.copy.map((c, i) => `<div style="display:grid;grid-template-columns:22mm 1fr;gap:2mm;align-items:center;margin-bottom:.5mm"><div class="cell" style="height:19mm;padding:0">${c.p ? img(c.p.img, 'max-height:18mm') : ''}</div>
     <div>${gl(c.w, i === 0 ? '#444' : '#BDBDBD', 16, i === 0)}</div></div>`).join(''))}
  ${blk(2, 'Read and write.', '', `<div class="en" style="font-size:10pt;margin-bottom:1mm">${ICON.pencil.replace('class="ico"', 'class="ico" style="width:5mm;height:5mm"')} Look at the letters. Write the word.</div>
    ${w.unscr.map((u, i) => `<div style="display:grid;grid-template-columns:20mm 1fr;gap:3mm;align-items:center;margin-bottom:1mm"><div class="cell" style="height:16mm;padding:0">${u.p ? img(u.p.img, 'max-height:15mm') : ''}</div><div>${letterBoxes(u.l)}<span style="display:inline-block;width:5mm"></span>→ ${answerBoxes(u.w.replace(/ /g, '').length)}</div></div>`).join('')}
    <div class="en" style="font-size:10pt;margin:2mm 0 1mm">${ICON.pencil.replace('class="ico"', 'class="ico" style="width:5mm;height:5mm"')} Choose a word. Write it.</div>
    ${w.cloze.map(c => `<div style="display:grid;grid-template-columns:20mm 1fr;gap:3mm;align-items:center;margin-bottom:1.2mm"><div class="cell" style="height:${c.p ? 15 : 8}mm;padding:0">${c.p ? img(c.p.img, 'max-height:14mm') : '<span style="font-size:14pt;color:#C8372D">♻</span>'}</div>
      <div><div class="en" style="font-size:14pt;font-weight:600">${esc(c.s).replace('___', '<span style="display:inline-block;border-bottom:.6mm solid #333;width:30mm"></span>')}</div><div style="margin-top:.8mm">${bankBox(c.bank)}</div></div></div>`).join('')}`)}
  ${blk(3, 'About me.', '', `<div style="display:grid;grid-template-columns:1fr 62mm;gap:4mm;align-items:end"><div><div class="en" style="font-size:14pt;font-weight:600;margin-bottom:1mm">${esc(w.me.frame).replace('___', '<span style="display:inline-block;border-bottom:.6mm solid #333;width:38mm"></span>')}</div><div style="width:108mm;overflow:hidden">${gl('', '', 14)}</div><div class="en" style="font-size:9pt;color:#777">${esc(w.me.draw)}</div></div>
    <div style="border:.5mm dashed #bbb;border-radius:4mm;height:30mm"></div></div>`)}
  ${foot2('en')}`);
  /* trang Trung */
  const cb = (ch) => charBlock(ch, zp[ch], { sz: 19, nd: 1, nb: 5, iw: 38, sw: 120, gap: 2 });
  pg(`${hd2(s, 'zh')}
  ${blk(1, 'Trace and write.', '描一描，写一写', w.zc.map(cb).join(''))}
  ${blk(2, 'Read and tick.', '读一读', w.zread.map((r, i) => `<div style="display:grid;grid-template-columns:24mm 1fr 22mm;gap:3mm;align-items:center;border-bottom:.3mm solid #eee;padding:.8mm 0"><div class="cell" style="height:19mm;padding:0">${r.p ? img(r.p.img, 'max-height:18mm') : ''}</div>
      <div><div class="py" style="font-size:10pt">${esc(r.py)}</div><div class="zh" style="font-size:17pt;font-weight:700">${esc(r.zh)}</div></div><div><span class="box">✓</span> <span class="box">✗</span></div></div>`).join('') + `
    <div class="zh" style="font-size:10pt;margin:1.5mm 0 .5mm;font-weight:700">选一选，填一填</div><div style="display:flex;align-items:center;gap:6mm"><div><div class="py" style="font-size:10pt">${esc(w.zfill.py)}</div><div class="zh" style="font-size:17pt;font-weight:700">${esc(w.zfill.zh).replace('___', '<span style="display:inline-block;border-bottom:.6mm solid #333;width:16mm"></span>')}</div></div>
      <div style="display:flex;gap:3mm">${w.zfill.bank.map(b => `<span style="border:.4mm solid #888;border-radius:2mm;padding:.5mm 3mm;text-align:center"><div class="py" style="font-size:9pt">${esc(b.py)}</div><div class="zh" style="font-size:15pt;font-weight:700">${esc(b.zh)}</div></span>`).join('')}</div></div>`)}
  ${blk(3, 'Match.', '连一连', medBlock(w))}
  ${foot2('zh')}`);
}
function wb2LS(s) {   // chị chốt 13/11: Little Seed 1 phiếu mỗi buổi, chữ Trung chỉ nhận mặt chữ (không tô)
  const w = s.wb2, zp = w.zpy, ord = w.zmatch.map((_, i) => (i + 1) % w.zmatch.length);
  pg(`${hd2(s, 'both')}
  ${blk(1, 'Look and copy.', '', w.copy.map((c, i) => `<div style="display:grid;grid-template-columns:20mm 1fr;gap:2mm;align-items:center;margin-bottom:.5mm"><div class="cell" style="height:14mm;padding:0">${c.p ? img(c.p.img, 'max-height:13mm') : ''}</div>
     <div>${gl(c.w, i === 0 ? '#444' : '#BDBDBD', 12.5, i === 0)}</div></div>`).join(''))}
  ${blk(2, 'Look and circle.', '', w.circ.slice(0, 2).map(c => `<div style="display:grid;grid-template-columns:34mm repeat(3,1fr);align-items:center;gap:3mm;margin-bottom:.8mm"><div class="en" style="font-size:14pt">${esc(c.w)}</div>
      ${c.ps.map(p => `<div class="cell" style="height:19mm;border:.3mm solid #ddd;border-radius:3mm;padding:.6mm">${img(p.img, 'max-height:17.5mm')}</div>`).join('')}</div>`).join(''))}
  ${blk(3, 'Look and match.', '连一连', `<div style="display:flex;gap:4mm;align-items:center;margin-bottom:1mm;font-size:9pt;color:#888"><span>Today · 今天</span>${w.zc.map(c => `<span class="zh" style="font-size:17pt;font-weight:700;color:#C8372D">${esc(c)}</span><span class="py" style="font-size:10pt">${esc(zp[c])}</span>`).join('')}</div>
    <div style="display:grid;grid-template-columns:1fr 26mm 1fr;align-items:center">${w.zmatch.map((x, i) => `<div style="height:15mm;display:flex;align-items:center;justify-content:flex-end;gap:3mm"><div><div class="py" style="font-size:9pt;text-align:right;line-height:1.1">${esc(x.py)}</div><div class="zh" style="font-size:18pt;font-weight:700;text-align:right;line-height:1.1">${esc(x.zh)}</div></div><span class="dot"></span></div><div></div>
      <div style="display:flex;align-items:center;gap:3mm"><span class="dot"></span>${img(w.zmatch[ord[i]].p.img, 'max-height:14mm;max-width:26mm')}</div>`).join('')}</div>`)}
  ${blk(4, 'Match.', '连一连', medBlock(w, 8.5))}
  ${blk(5, 'About me.', '', `<div style="display:flex;align-items:center;gap:3mm"><span class="en" style="font-size:14pt;white-space:nowrap">${esc(w.me.frame)}</span>${w.me.opts.map(o => `<span style="border:.5mm solid #555;border-radius:999px;padding:.8mm 3mm;font-size:12pt;white-space:nowrap" class="en">${esc(o)}</span>`).join('<span class="en"> / </span>')}<span class="en">.</span><span style="flex:1"></span><div style="border:.5mm dashed #bbb;border-radius:4mm;height:18mm;width:38mm;flex:none"></div></div>
    ${w.rec ? `<div style="margin-top:1mm;display:flex;align-items:center;gap:2mm;border-top:.3mm dashed #ccc;padding-top:1mm"><span style="color:#C8372D;font-size:12pt">♻</span><span class="en" style="font-size:11pt;white-space:nowrap">${esc(w.rec[0])}</span>${w.rec[1] === 'num' ? Array.from({ length: 10 }, (_, i) => `<span style="width:6.5mm;height:6.5mm;border:.4mm solid #888;border-radius:50%;text-align:center;line-height:6mm;font-size:10pt;flex:none" class="en">${i + 1}</span>`).join('') : '<span style="display:inline-block;border-bottom:.6mm solid #333;width:40mm;height:6mm"></span>'}</div>` : ''}`)}
  ${foot2('en')}`);
}
/* Trang vè (chant) của unit: lời EN + pinyin + 中文, QR nghe bài vè, ô đánh dấu "hát cùng bạn" */
function chantPage(u) {
  const V = (H.ve || {})[u.key]; if (!V || !V.length) return;
  const one = v => `<div class="sec" style="margin-bottom:3mm"><div style="display:flex;align-items:center;justify-content:space-between;gap:3mm;border-bottom:.5mm solid #333;padding-bottom:1mm"><div><span class="en" style="font-size:16pt;font-weight:800">${esc(v.ab)}. ${esc(v.ten)}</span> <span class="zh" style="font-size:14pt;font-weight:700">${esc(v.ten_zh)}</span></div>${qrBox(v.id)}</div>
    ${v.en.map((e, i) => `<div style="display:flex;gap:4mm;align-items:baseline;border-bottom:.3mm solid #f0f0f0;padding:.8mm 0"><span class="en" style="flex:1;font-size:12.5pt">${esc(e)}</span><span style="flex:1.1;text-align:right"><span class="py" style="font-size:8.5pt;display:block">${esc(v.py[i])}</span><span class="zh" style="font-size:12.5pt;font-weight:700">${esc(v.zh[i])}</span></span></div>`).join('')}
    <div style="display:flex;gap:5mm;margin-top:1.5mm;font-size:9pt;align-items:center"><span class="en">♪ Sing with a friend</span><span class="zh">和朋友一起唱</span><span class="box"></span><span class="en">👏 Clap the beat</span><span class="box"></span></div></div>`;
  pg(`<div class="fit"><div class="hd"><div><div class="t">Chant · ${esc(u.name)}</div><div class="zh" style="font-size:11pt;color:#888">童谣 · 边拍手边唱</div></div><div class="nm">Name · <span class="zh">名字</span>: ____________</div></div>${V.map(one).join('')}</div>`);
}
function myPage(u) {
  const P = (H.wb2 || { pages: {} }).pages[u.key]; if (!P) return;
  pg(`<div class="hd"><div><div class="t">My page · ${esc(u.name)}</div><div class="zh" style="font-size:11pt;color:#888">我的页面</div></div><div class="nm">Name · <span class="zh">名字</span>: ____________</div></div>
  <div class="sec"><div class="lab">${ICON.tick} Colour the star when you know the word.</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:2mm">${P.words.map(x => `<div class="cell" style="height:34mm;border:.3mm solid #eee;border-radius:3mm">${img(x.img, 'max-height:22mm')}<div class="en" style="font-size:10pt">${esc(x.en.replace(/ · .*/, ''))}</div><svg viewBox="0 0 24 24" style="width:7mm"><path d="M12 2 L15 9 L22 9.5 L16.5 14 L18.5 21 L12 17 L5.5 21 L7.5 14 L2 9.5 L9 9 Z" fill="#fff" stroke="#333" stroke-width="1.2"/></svg></div>`).join('')}</div></div>
  <div class="sec"><div class="lab">${ICON.ear} I can…</div>${P.can.map(c => `<div style="display:flex;align-items:center;gap:4mm;border-bottom:.3mm solid #eee;padding:2mm 0"><div style="flex:1"><div class="en" style="font-size:13pt">${esc(c.en)}</div><div class="py" style="font-size:9pt">${esc(c.py)}</div><div class="zh" style="font-size:13pt;font-weight:700">${esc(c.zh)}</div></div>${[0, 1, 2].map(k => `<span style="display:inline-flex;align-items:center;gap:1mm">${SMILE(k)}<span class="box"></span></span>`).join('')}</div>`).join('')}</div>
  <div class="sec" style="height:70mm"><div class="lab">${ICON.glue} <span class="en">${esc(P.photo[0])}</span> · <span class="zh">${esc(P.photo[1])}</span></div><div style="border:.5mm dashed #bbb;border-radius:4mm;height:52mm;width:90mm;margin:0 auto"></div></div>`);
}
/* Trang đôi bạn (Seedling): chính tả đôi bạn – bạn đọc, bạn viết, đổi vai, bạn chấm ✓ (theo màn "Chữ và âm · đôi bạn ôn và viết") */
function partnerWords(u) {
  const ss = H.sessions.filter(s => s.unit === u.key && s.wb2);
  const en = [...new Set(ss.flatMap(s => [...s.wb2.copy.map(c => c.w), ...s.wb2.unscr.map(x => x.w)]).filter(w => /^[A-Za-z]{3,9}$/.test(w) && !['wow', 'hooray', 'sorry', 'yes', 'the', 'and'].includes(w.toLowerCase())).map(w => w.toLowerCase()))].slice(0, 5);
  const zp = Object.assign({}, ...ss.map(s => s.wb2.zpy || {}));
  const zh = [...new Set(ss.flatMap(s => s.wb2.zc || []))].filter(c => !'们个于识板标叉条乓户厅阿'.includes(c)).slice(0, 5);
  return { en, zh, zp };
}
function partnerPage(u) {
  if (LS) return;
  const { en, zh, zp } = partnerWords(u); if (en.length < 3 || zh.length < 3) return;
  const tick = '<span style="display:inline-flex;align-items:center;gap:1.5mm;font-size:8.5pt;color:#888">friend ✓ <span class="box"></span></span>';
  pg(`<div class="hd"><div><div class="t">Friends' page · ${esc(u.name)}</div><div class="zh" style="font-size:11pt;color:#888">我们一起练</div></div><div class="nm">Name · <span class="zh">名字</span>: ________ &nbsp; Friend: ________</div></div>
  <div class="sec" style="padding:2.5mm 4mm"><div class="en" style="font-size:11pt;line-height:1.5"><b>1.</b> Sit with your friend. <b>2.</b> Round 1: I <b>read</b> my words, my friend <b>writes</b>. <b>3.</b> I check and tick ✓ in my friend's book. <b>4.</b> Round 2: swap!</div></div>
  ${blk(1, 'Round 1 · English', '', `<div style="display:flex;gap:6mm"><div style="width:62mm;flex:none;border:.4mm dashed #aaa;border-radius:3mm;padding:2mm 4mm;background:#FAFAFA"><div style="font-size:8.5pt;color:#888">I read to my friend · 👀 only me!</div>${en.map((w, i) => `<div class="en" style="font-size:15pt;line-height:1.55">${i + 1}. ${esc(w)}</div>`).join('')}</div>
    <div style="flex:1"><div style="font-size:8.5pt;color:#888;margin-bottom:1mm">I write what my friend reads.</div>${en.map((w, i) => `<div style="display:flex;align-items:flex-end;gap:2mm;margin-bottom:2.2mm"><span class="en" style="font-size:12pt">${i + 1}.</span><span style="flex:1;border-bottom:.5mm solid #444;height:8mm"></span>${tick}</div>`).join('')}</div></div>`)}
  ${blk(2, 'Round 2 · 中文', '换一换', `<div style="border:.4mm dashed #aaa;border-radius:3mm;padding:2mm 4mm;background:#FAFAFA;margin-bottom:3mm"><div style="font-size:8.5pt;color:#888">I read to my friend · 👀 only me!</div><div style="display:flex;gap:6mm;flex-wrap:wrap">${zh.map((c, i) => `<div style="text-align:center"><div class="py" style="font-size:9pt">${i + 1}. ${esc(zp[c] || '')}</div><div class="zh" style="font-size:24pt;font-weight:700;line-height:1.1">${esc(c)}</div></div>`).join('')}</div></div>
    <div style="font-size:8.5pt;color:#888;margin-bottom:1mm">I write what my friend reads.</div><div style="display:flex;gap:3mm;flex-wrap:wrap">${zh.map((c, i) => `<div style="text-align:center"><div style="font-size:9pt">${i + 1}.</div><span class="tzg" style="margin:0"></span><div style="margin-top:1mm">${tick}</div></div>`).join('')}</div>`)}
  <div class="sec" style="padding:2.5mm 4mm;display:flex;align-items:center;gap:6mm;font-size:11pt"><span class="en"><b>Score</b> · English <b>___ / ${en.length}</b> &nbsp; 中文 <b>___ / ${zh.length}</b></span><span style="flex:1"></span><span class="en">Teacher: ${[0, 1, 2].map(k => `<span style="display:inline-flex;align-items:center;gap:1mm;margin-left:3mm"><span class="box" style="border-radius:50%"></span>${k}</span>`).join('')}</span></div>
  ${foot2('en')}`);
}

function checkup(u) {
  const C = (H.wb2 || { check: {} }).check[u.key]; if (!C) return;
  const LET = 'ABC';
  pg(`<div class="fit"><div class="hd"><div><div class="t">Check-up · ${esc(u.name)}</div><div style="font-size:9pt;color:#888">Cambridge Starters · YCT 1 style · ${LS ? '' : 'about 10 minutes'}</div></div><div class="nm">Name · <span class="zh">名字</span>: ____________</div></div>
  ${blk(1, 'Look and read. Yes or no?', '', C.yes.map((y, i) => `<div style="display:grid;grid-template-columns:24mm 1fr 30mm;gap:3mm;align-items:center"><div class="cell" style="height:14mm;padding:0">${y.p ? img(y.p.img, 'max-height:13mm') : ''}</div><div class="en" style="font-size:14pt">${i + 1}. ${esc(y.en)}</div><div class="en" style="font-size:12pt">yes <span class="box"></span> no <span class="box"></span></div></div>`).join(''))}
  ${blk(2, 'Look at the letters. Write the word.', '', C.unscr.map(u => `<div style="display:grid;grid-template-columns:24mm 1fr;gap:3mm;align-items:center;margin-bottom:1mm"><div class="cell" style="height:12mm;padding:0">${u.p ? img(u.p.img, 'max-height:11mm') : ''}</div><div>${letterBoxes(u.l)}<span style="display:inline-block;width:5mm"></span>→ ${answerBoxes(u.w.length)}</div></div>`).join(''))}
  ${blk(3, 'Read and circle.', '读一读，圈一圈', C.zread.map((r, i) => `<div style="display:grid;grid-template-columns:24mm 1fr;gap:3mm;align-items:center;margin-bottom:1mm"><div class="cell" style="height:15mm;padding:0">${r.p ? img(r.p.img, 'max-height:14mm') : ''}</div><div style="display:flex;gap:4mm">${r.opts.map((o, k) => `<div style="border:.4mm solid #888;border-radius:2mm;padding:.5mm 2.5mm;flex:1"><span class="en" style="font-size:10pt">${LET[k]}</span><div class="py" style="font-size:8.5pt">${esc(o.py)}</div><div class="zh" style="font-size:13pt;font-weight:700">${esc(o.zh)}</div></div>`).join('')}</div></div>`).join(''))}
  ${blk(4, 'Choose a word. Write it.', '选一选，填一填', C.zfill.map(f => `<div style="display:flex;align-items:center;gap:5mm;margin-bottom:.5mm"><div style="width:62mm"><div class="py" style="font-size:9pt">${esc(f.py)}</div><div class="zh" style="font-size:15pt;font-weight:700">${esc(f.zh).replace('___', '<span style="display:inline-block;border-bottom:.6mm solid #333;width:14mm"></span>')}</div></div>${f.bank.map(b => `<span style="border:.4mm solid #888;border-radius:2mm;padding:.4mm 3mm;text-align:center"><div class="py" style="font-size:8.5pt">${esc(b.py)}</div><div class="zh" style="font-size:14pt;font-weight:700">${esc(b.zh)}</div></span>`).join('')}</div>`).join(''))}
  <div class="sec" style="padding:2mm 4mm;margin:2mm 0 0;border-color:#C8372D"><div class="en" style="font-size:9.5pt;line-height:1.5"><b>Swap books with your friend.</b> Your friend checks with the answers on the screen: ✓ ✗ next to each number.</div>
  <div style="display:flex;align-items:center;gap:5mm;font-size:10.5pt;margin-top:1mm" class="en"><span>1: ___/${C.yes.length}</span><span>2: ___/${C.unscr.length}</span><span>3: ___/${C.zread.length}</span><span>4: ___/${C.zfill.length}</span><span><b>Total ___ / ${C.yes.length + C.unscr.length + C.zread.length + C.zfill.length}</b></span><span style="flex:1"></span><span>Teacher: ${[0, 1, 2].map(k => `<span style="display:inline-flex;align-items:center;gap:1mm;margin-left:2mm"><span class="box" style="border-radius:50%"></span>${k}</span>`).join('')}</span></div>
  <div style="font-size:8pt;color:#888;margin-top:.5mm">${Math.ceil((C.yes.length + C.unscr.length + C.zread.length + C.zfill.length) * .8)}–${(C.yes.length + C.unscr.length + C.zread.length + C.zfill.length)} = 2 · ${Math.ceil((C.yes.length + C.unscr.length + C.zread.length + C.zfill.length) * .5)}–${Math.ceil((C.yes.length + C.unscr.length + C.zread.length + C.zfill.length) * .8) - 1} = 1 · less = 0</div></div>
  </div>${foot2('en')}`);
}
function key2(u) {
  const ss = H.sessions.filter(s => s.unit === u.key && s.wb2), LET = 'ABC';
  if (!ss.length) return;
  pg(`<div class="hd"><div class="t">Đáp án sách bài tập bản 2 · ${esc(u.name)}</div></div>
  <table class="ss" style="font-size:10.5pt"><tr><th>Buổi</th>${LS ? '<th>Khoanh (đáp án = ô thứ)</th>' : '<th>Xếp chữ · điền từ</th><th>Đọc ✓✗ · điền</th>'}<th>Nối câu Anh → vị trí bên phải</th></tr>
  ${ss.map(s => { const w = s.wb2, med = w.med.map((x, i) => `${i + 1}→${w.medperm[i] + 1}`).join(' · ');
    if (LS) return `<tr><td>${s.n}</td><td>${w.circ.map(c => `${esc(c.w)}: ${c.ans + 1}`).join(' · ')}<br><span class="zh">${w.zmatch.map((x, i) => `${esc(x.zh)} → ${(i + 1) % w.zmatch.length + 1}`).join(' · ')}</span> (nối chữ Trung: hàng → tranh thứ)</td><td>${med}</td></tr>`;
    return `<tr><td>${s.n}</td><td>${w.unscr.map(x => esc(x.w)).join(', ')}<br>${w.cloze.map(c => esc(c.ans)).join(', ')}</td><td class="zh">${w.zread.map((r, i) => `${i + 1}${r.ok ? '✓' : '✗'}`).join(' ')} · ${esc(w.zfill.ans)}</td><td>${med}</td></tr>`; }).join('')}</table>
  ${LS ? '' : (() => { const C = (H.wb2.check || {})[u.key]; return C ? `<p style="font-size:10.5pt"><b>Check-up:</b> yes/no: ${C.yes.map(y => y.ok ? 'yes' : 'no').join(', ')} · chữ: ${C.unscr.map(x => esc(x.w)).join(', ')} · đọc – khoanh: ${C.zread.map(r => 'ABC'[r.ans]).join(', ')} · điền: <span class="zh">${C.zfill.map(f => esc(f.ans)).join(', ')}</span></p>` : ''; })()}
  ${LS ? '' : (() => { const p = partnerWords(u); return `<p style="font-size:10.5pt"><b>Trang đôi bạn (chính tả):</b> vòng 1 (Anh): ${p.en.join(', ')} · vòng 2 (Trung): <span class="zh">${p.zh.join(' ')}</span>. Cô chỉ xem số ✓ và điểm 0–2 ở cuối trang.</p>`; })()}
  <p style="font-size:10.5pt;color:#555">Câu có ♻ ôn lại từ unit trước. Câu đúng/sai trang Trung xếp lẫn lộn (không phải lúc nào cũng ✓). Cô chấm nhanh bằng bảng này; con tự khoanh mặt cười ở cuối trang.</p>`);
}

/* ---------------- cả cuốn sách bài tập ---------------- */
const CH = n => 'seedling/tai-nguyen/nhan-vat/' + n + '_a.webp';
function cover() {
  const bg = LS ? 'seedling/tai-nguyen/trang/ls_park.webp' : 'seedling/tai-nguyen/trang/ls_school.webp';
  const sky = LS ? '#BFE6F7' : '#A9DDF5';
  const col = LS ? '#2E8B80' : '#C8372D', col2 = LS ? '#1F6E65' : '#9E2A22';
  const kids = LS ? [['huou_huou1', 112], ['kids_bong', 118], ['kids_xiaomei', 108]] : [['kids_leo', 112], ['kids_bong', 120], ['huou_huou2', 112], ['kids_anna', 112], ['kids_xiaomei', 106]];
  const star = (x, y, r, c = '#F2C14E') => `<svg viewBox="0 0 24 24" style="position:absolute;left:${x}mm;top:${y}mm;width:${r}mm;height:${r}mm;transform:rotate(${(x * 7) % 30 - 15}deg)"><path d="M12 1.5l3 7 7.5.6-5.7 4.9 1.8 7.4L12 17.4 5.4 21.4l1.8-7.4L1.5 9.1 9 8.5z" fill="${c}" stroke="#fff" stroke-width="1.2"/></svg>`;
  pg(`<div style="position:absolute;inset:0;background:${sky}"></div>
  <img src="${esc(src(bg))}" style="position:absolute;left:0;right:0;bottom:0;width:210mm;height:210mm;object-fit:cover;object-position:50% 100%">
  <div style="position:absolute;left:0;right:0;bottom:178mm;height:34mm;background:linear-gradient(${sky} 20%, rgba(255,255,255,0))"></div>
  ${star(14, 14, 9)}${star(186, 10, 11)}${star(176, 52, 7, '#fff')}${star(24, 60, 6, '#fff')}${star(196, 98, 8)}${star(8, 104, 7)}
  <div style="position:absolute;left:14mm;right:14mm;top:15mm;text-align:center">
    <div style="display:inline-block;background:${col};color:#fff;border-radius:999px;padding:1.6mm 7mm;font-size:12.5pt;font-weight:800;letter-spacing:1.4mm;border:.8mm solid #fff;box-shadow:0 1mm 0 ${col2}">ANH · TRUNG · KIDS</div>
    <div style="margin-top:6mm;background:#fff;border:1.6mm solid #F2C14E;border-radius:10mm;padding:6mm 6mm 5mm;box-shadow:0 2mm 0 rgba(0,0,0,.12)">
      <div style="font-size:50pt;font-weight:800;line-height:1;color:${col}">${LS ? 'Little Seed' : 'Seedling'}</div>
      <div style="display:inline-block;margin-top:3mm;background:#F2C14E;color:#2F463C;border-radius:4mm;padding:1mm 9mm;font-size:30pt;font-weight:800;line-height:1.15">Workbook</div>
      <div class="zh" style="font-size:21pt;font-weight:800;margin-top:3mm;color:#2F463C">${LS ? '小种子' : '小树苗'} · 练习册</div></div></div>
  <div style="position:absolute;left:0;right:0;bottom:30mm;display:flex;justify-content:center;align-items:flex-end;gap:${LS ? 12 : 0}mm">${kids.map(([k, h]) => img(CH(k), `height:${h * (LS ? 1.1 : .86)}mm;filter:drop-shadow(0 1.2mm 1.2mm rgba(0,0,0,.25));margin:0 ${LS ? 0 : -3}mm`)).join('')}</div>
  <div style="position:absolute;left:22mm;right:22mm;bottom:12mm;background:#fff;border:1.2mm solid ${col};border-radius:6mm;padding:3mm 6mm;display:flex;align-items:center;gap:4mm;box-shadow:0 1.4mm 0 ${col2}">
    <div style="font-size:15pt;font-weight:800;color:${col};white-space:nowrap">My name · <span class="zh">我的名字</span></div>
    <div style="flex:1;border-bottom:.7mm solid #444;height:9mm"></div></div>
  <div style="position:absolute;left:0;right:0;bottom:3.4mm;text-align:center;font-size:8.5pt;color:#2F463C;font-weight:600">CES Việt Nam · 12 units · 48 sessions · ▶ scan the QR code to listen · 扫码听一听</div>`);
  pg(`<div class="hd"><div class="t">${LS ? 'Little Seed' : 'Seedling'} Workbook</div><div class="nm">Name · <span class="zh">名字</span>: ______________</div></div>
  <div class="sec"><div class="lab">How to use this book · <span class="zh">怎么用这本书</span></div>
  <div style="font-size:12.5pt;line-height:1.7"><p>1. After each class, do <b>${LS ? '1 page' : '2 pages (English + 中文)'}</b> of the same session number.</p><p>2. Find the <b>QR code</b> at the top right of the page. Scan it, press ▶ and listen. The voice tells you what to do.</p><p>3. Do the exercises. Pause when you need more time.</p><p>4. At the end, the voice says <b>“Now, check your answers.”</b> Check with a pencil in another colour.</p><p>5. Colour the faces: <span style="display:inline-flex;vertical-align:middle">${SMILE(0)}</span> I can! &nbsp; <span style="display:inline-flex;vertical-align:middle">${SMILE(1)}</span> Almost. &nbsp; <span style="display:inline-flex;vertical-align:middle">${SMILE(2)}</span> Help me, please.</p></div></div>
  <div class="sec"><div class="lab">Tips for parents · <span class="zh">给家长</span></div><div style="font-size:11.5pt;line-height:1.6"><p>Sit next to your child for the first session. Let them listen and do it alone from the next one.</p><p>Do not correct handwriting too much. Praise effort: “Wow, you finished!”.</p><p>Chinese strokes: follow the numbered strokes, from the top to the bottom, from left to right.</p></div></div>
  <div style="text-align:center;margin-top:6mm">${img(CH('kids_bong'), 'height:70mm')}${img(CH('kids_xiaomei'), 'height:70mm')}</div>`);
}
function divider(u) {
  const ws = (u.words || []).filter(w => w.img).slice(0, 6);
  const kid = ['kids_bong', 'kids_leo', 'kids_anna', 'kids_xiaomei'][(+u.key - 1) % 4];
  const col = LS ? '#2E8B80' : '#C8372D';
  pg(`<div style="position:absolute;inset:0;background:${col}"></div>
  <div style="position:absolute;left:10mm;right:10mm;top:14mm;bottom:14mm;background:#FFF8E6;border-radius:8mm;border:2mm solid #F2C14E;padding:14mm;text-align:center">
    <div style="font-size:70pt;font-weight:800;color:${col};line-height:1">Unit ${esc(u.key)}</div>
    <div style="font-size:24pt;font-weight:800;margin-top:4mm">${esc(u.name.replace(/^[+\s]*(Unit\s*\d+\s*[·:.-]?\s*)?/, '').replace(/^[^·]*·\s*/, ''))}</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4mm;margin-top:12mm">${ws.map(w => `<div class="cell" style="height:46mm;background:#fff;border-radius:5mm;border:.4mm solid #E3D3A8">${img(w.img, 'max-height:40mm')}</div>`).join('')}</div>
    <div style="position:absolute;left:0;right:0;bottom:6mm">${img(CH(kid), 'height:78mm')}</div></div>`);
}
function book() {
  cover();
  const done = new Set();
  const order = H.sessions.filter(s => s.wb2);
  order.forEach((s, i) => {
    const u = /^\d+$/.test(s.unit) ? U(s.unit) : null;
    if (u && !done.has(u.key)) { done.add(u.key); divider(u); }
    wb(s);
    const nxt = order[i + 1];
    if (u && (!nxt || nxt.unit !== s.unit)) { chantPage(u); myPage(u); partnerPage(u); checkup(u); }
  });
}
function bookKey() { H.units.forEach(key2); }

function route() {
  const h = location.hash.replace(/^#\/?/, '').split('/');
  if (h[0] === 'u' && U(h[1])) { const u = U(h[1]); kit(u, h[2] || 'flash'); return show(`${u.name} · ${(KIND[h[2]] || KIND.flash)[0]}`, '#/', esc((KIND[h[2]] || KIND.flash)[1])); }
  if (h[0] === 'book') { book(); return show(`Sách bài tập đầy đủ · ${LS ? 'Little Seed' : 'Seedling'}`, '#/', 'Cả cuốn: bìa – hướng dẫn – 12 unit – My page – Check-up'); }
  if (h[0] === 'bookkey') { bookKey(); return show('Đáp án cả cuốn', '#/', ''); }
  if (h[0] === 'b') { const s = H.sessions.find(x => x.n === +h[1]); if (s) { wb(s); return show(`Buổi ${s.n} · ${LS ? 'phiếu tô – dán' : 'sách bài tập'}`, '#/', esc(s.t)); } }
  home();
}
window.addEventListener('hashchange', route); route();
})();
