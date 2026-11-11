/* Web dạy offline 48 buổi · Seedling. Dữ liệu: day-data.js (sinh bằng cong-cu/build_day.py). */
(function () {
'use strict';
const D = window.DAY;
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const A = p => p ? (/^https?:/.test(p) ? p : '../' + p) : '';
const app = $('#app');
const AU = $('#au'), NH = $('#nhac');
const PROJ = /[?&]chieu=1/.test(location.search);
const KIND = { intro: 'Introduce', repeat: 'Repeat + Introduce', practice: 'Practice + Introduce', produce: 'Produce', on: 'Ôn chặng', thi: 'Kiểm tra, thi thử', w13: 'Tuần 1–3' };
const BLOCK = { '1': '[1] Khởi động', '2': '[2] Tiếng Anh', '3': '[3] Vận động', '4': '[4] Tiếng Trung', '5': '[5] Chữ và âm', '6': '[6] Truyện, thủ công', '7': '[7] Vinh danh' };
const ls = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};
function play(p) { if (!p) return; try { AU.pause(); AU.src = A(p); AU.currentTime = 0; AU.play().catch(() => {}); } catch (e) {} }
function playSeq(list) { let i = 0; const nx = () => { if (i >= list.length) { AU.onended = null; return; } const p = list[i++]; if (!p) return nx(); AU.src = A(p); AU.onended = nx; AU.play().catch(nx); }; AU.pause(); nx(); }
function stopAll() { try { AU.pause(); AU.onended = null; NH.pause(); } catch (e) {} }
function who(k) { return D.who[k] || { n: '', img: '' }; }
const ov = (img, k) => k !== 'narr' && who(k).img && !/\/canh\//.test(img || ''); // cảnh vẽ sẵn đã có nhân vật thì không chồng thêm
const sessUnits = s => (s.units || []).filter(u => D.units[u]);
const JG = [['s', 'a', 't', 'i', 'p', 'n'], ['c', 'k', 'c/k', '-ck', 'e', 'h', 'r', 'm', 'd'], ['g', 'o', 'u', 'l', 'f', 'b'], ['ai', 'j', 'oa', 'ie', 'ee', 'or'], ['z', 'w', 'ng', 'v', 'oo'], ['y', 'x', 'ch', 'sh', 'th'], ['qu', 'ou', 'oi', 'ue', 'er', 'ar']];
const JL = { audio: 'https://jollylearning.com/resources/audio-and-video-resources/42-letter-sounds-video', all: 'https://jollylearning.com/resources/audio-and-video-resources' };
function jollyGroups(sym) { const toks = String(sym).toLowerCase().split(/[\s·+]+/).filter(t => /^[-a-z\/]+$/.test(t)); const g = new Set(); toks.forEach(t => JG.forEach((G, i) => { if (G.includes(t)) g.add(i + 1); })); return [...g]; }
function jollyBox(s) {
  const syms = s.slides.filter(x => x.ty === 'sound' && x.l === 'en').map(x => x.sym); if (!syms.length) return '';
  const g = [...new Set(syms.flatMap(jollyGroups))];
  return `<div class="box"><h3>Âm chuẩn tiếng Anh · Jolly Learning (trang chính thức)</h3><p>Âm của buổi: <b>${syms.map(esc).join(' · ')}</b>${g.length ? ` — thuộc nhóm âm Jolly Phonics ${g.join(', ')}` : ''}. Cô mở trang chính thức để nghe âm chuẩn (giọng Anh – Anh) trước buổi, hoặc phát cho các con nghe.</p>
    <a class="btn p" href="${JL.audio}" target="_blank" rel="noopener">🔊 42 âm Jolly Phonics</a> <a class="btn" href="${JL.all}" target="_blank" rel="noopener">Âm theo nhóm, video dạy âm</a></div>`;
}

/* ---------------- lớp & ghi nhận ---------------- */
const Roster = { get: () => ls.get('sdd-lop', []), set: v => ls.set('sdd-lop', v) };
function rec(n) { return ls.get('sdd-rec-' + n, { ev: [], att: {}, h4: {}, note: {} }); }
function saveRec(n, r) { ls.set('sdd-rec-' + n, r); }

/* ---------------- định tuyến ---------------- */
function route() {
  stopAll(); clearInterval(window.__tm);
  const h = location.hash.replace(/^#\/?/, '').split('/');
  if (PROJ) return renderProjector();
  if (h[0] === 'b' && h[1]) {
    const n = +h[1];
    if (h[2] === 'chieu') return renderPresent(n, +(h[3] || 0));
    return renderSession(n, h[2] || 'giao-an');
  }
  if (h[0] === 'in' && h[1]) return renderPrint(+h[1], h[2] || 'flash');
  if (h[0] === 'lop') return renderRoster();
  renderHome();
}
window.addEventListener('hashchange', route);

/* ---------------- trang chủ ---------------- */
function renderHome() {
  const chang = {};
  D.map.forEach(m => (chang[m.chang] = chang[m.chang] || []).push(m));
  app.innerHTML = `<div class="top"><a href="#/">🌱 Seedling · Web dạy 48 buổi</a><span class="sp"></span>
    <a class="btn s" href="hoc-lieu/">🖨 Học liệu in mới · U1–U3</a><a class="btn s" href="#/lop">👥 Danh sách lớp (${Roster.get().length})</a><a class="btn s" href="../index.html?gv=1">Web học của con</a></div>
  <div class="wrap">
    <p class="muted">Mỗi buổi có: giáo án 7 khối · trình chiếu có tranh và tiếng · Big Book · reader in · chant và động tác · thủ công · đồ dùng in · ghi nhận từng bé và báo cáo. Màn chiếu chỉ dẫn khoảng 30 trên 90 phút; phần còn lại các con luyện bằng thẻ, rối, thủ công và cả người.</p>
    ${Object.keys(chang).map(c => `<div class="chang"><h2>Chặng ${c}</h2><div class="units">${chang[c].map(m => `
      <div class="unit"><h3>${esc(m.name)}</h3><div class="muted">${esc(m.topic)} · ${esc(m.story)}</div>
      <div class="sess">${m.lops.map(n => { const s = D.sess[n]; return `<a class="k-${s.kind}" href="#/b/${n}">${n}<small>${esc(KIND[s.kind].split(' ')[0])}</small></a>`; }).join('')}</div></div>`).join('')}</div></div>`).join('')}
  </div>`;
}

/* ---------------- trang buổi ---------------- */
const TABS = [['giao-an', 'Giáo án'], ['chieu', '▶ Trình chiếu'], ['big-book', 'Big Book'], ['reader', 'Reader'], ['chant', 'Chant & nhảy'], ['thu-cong', 'Thủ công'], ['tai-ve', 'Đồ dùng in'], ['bao-cao', 'Lớp & báo cáo']];
function head(s, tab) {
  return `<div class="top"><a href="#/">🌱 48 buổi</a><span>›</span><b>Buổi ${s.n}</b><span class="sp"></span>
    ${s.n > 1 ? `<a class="btn s" href="#/b/${s.n - 1}/${tab}">◀ ${s.n - 1}</a>` : ''}${s.n < 48 ? `<a class="btn s" href="#/b/${s.n + 1}/${tab}">${s.n + 1} ▶</a>` : ''}</div>
  <div class="wrap"><h1>${esc(s.t)}</h1><div class="muted">${esc(s.about)} · Ngày web trước buổi: ${s.days.join(', ')} · <span class="chip">${esc(KIND[s.kind])}</span></div>
  <div class="tabs">${TABS.map(([k, v]) => `<a class="${k === tab ? 'on' : ''}" href="#/b/${s.n}${k === 'chieu' ? '/chieu' : '/' + k}">${v}</a>`).join('')}</div>`;
}
function renderSession(n, tab) {
  const s = D.sess[n]; if (!s) return renderHome();
  const body = { 'giao-an': tabPlan, 'big-book': tabBook, reader: tabReader, chant: tabChant, 'thu-cong': tabCraft, 'tai-ve': tabDownload, 'bao-cao': tabReport }[tab] || tabPlan;
  app.innerHTML = head(s, tab) + `<div id="tb"></div></div>`;
  body(s, $('#tb'));
}

function tabPlan(s, el) {
  const cnt = {}; s.slides.forEach(x => cnt[x.b] = (cnt[x.b] || 0) + 1);
  const scr = s.slides.filter(x => x.m === 'Chiếu').length;
  el.innerHTML = `<p>Màn chiếu dẫn ${scr} trên ${s.slides.length} trang; các trang <span class="chip Thẻ">Thẻ</span> và <span class="chip Vận">Vận động</span> các con làm bằng đồ dùng và cả người, màn chỉ để nhắc. Câu chuẩn bị: ${s.prep.map(esc).join(' · ')}</p>
  <table class="t"><tr><th>Khối</th><th>Phút</th><th>Hoạt động</th><th>Trang chiếu</th></tr>
  ${s.blocks.map(b => `<tr><td><b>${b.k}</b> ${esc(b.name)}</td><td>${b.min}</td><td><ul class="clean">${b.acts.map(a => `<li>${esc(a)}</li>`).join('')}</ul></td>
    <td>${(() => { const i = s.slides.findIndex(x => '[' + x.b + ']' === b.k); return i >= 0 ? `<a class="btn s" href="#/b/${s.n}/chieu/${i}">▶ trang ${i + 1}</a> <span class="muted">(${cnt[b.k.slice(1, 2)] || 0})</span>` : ''; })()}</td></tr>`).join('')}
  </table>
  <h2>Nhịp mỗi hoạt động</h2><ol class="clean"><li>Cả lớp làm cùng lúc: đồng thanh, giơ thẻ, động tác.</li><li>Vài bạn làm một mình: ưu tiên bạn còn ít lượt (thẻ tên chuyển cam trên màn cô).</li><li>Hiện đáp án, khen đúng việc; bạn chưa đúng thì cả lớp làm lại, không sửa riêng trước lớp.</li></ol>
  <h2>Danh sách trang chiếu</h2><table class="t"><tr><th>#</th><th>Khối</th><th>Loại</th><th>Cô làm gì</th></tr>
  ${s.slides.map((x, i) => `<tr><td><a href="#/b/${s.n}/chieu/${i}">${i + 1}</a></td><td>${x.b}</td><td><span class="chip ${x.m.split(' ')[0]}">${x.m}</span></td><td>${esc(x.note)}</td></tr>`).join('')}</table>`;
}

/* ---------------- Big Book ---------------- */
function bookFor(s) { const u = sessUnits(s)[0]; return u && D.books[u] ? { u, b: D.books[u] } : null; }
function bookView(b, lang, i, upto) {
  const pages = b.pages.filter(p => !upto || upto === 'Cả truyện' || (p.part || 0) <= +String(upto).replace(/\D/g, '') || !p.part);
  const p = pages[Math.max(0, Math.min(i, pages.length - 1))];
  if (!p) return '<p>Chưa có truyện.</p>';
  const w = who(p.who);
  return { n: pages.length, html: `<div class="scene"><img class="bg" src="${A(p.img)}">${ov(p.img, p.who) ? `<img class="who" src="${A(w.img)}">` : ''}
    <div class="cap ${lang}" data-a="${esc(lang === 'en' ? p.a_en : p.a_zh)}">${esc(lang === 'en' ? p.en : p.zh)}${lang === 'zh' ? `<small>${esc(p.py)}</small>` : ''}${w.n && p.who !== 'narr' ? `<small>— ${esc(w.n)}</small>` : ''}</div></div>`, p };
}
function tabBook(s, el, opt) {
  const bk = bookFor(s); if (!bk) { el.innerHTML = '<p>Buổi ôn, thi: mở Big Book của từng unit ở các buổi trong chặng.</p>'; return; }
  let i = 0, lang = 'en';
  const draw = () => {
    const v = bookView(bk.b, lang, i);
    el.innerHTML = `<div class="bb"><div><b class="en">${esc(bk.b.t)}</b> · <b class="zh">${esc(bk.b.zh)}</b> <span class="muted">trang ${i + 1}/${v.n}</span></div>${v.html}
      <div><button class="btn" id="pv">◀</button> <button class="btn ${lang === 'en' ? 'on' : ''}" id="le">English</button> <button class="btn ${lang === 'zh' ? 'on' : ''}" id="lz">中文</button> <button class="btn" id="pl">🔊</button> <button class="btn" id="nx">▶</button> <a class="btn" href="#/in/${s.n}/reader">🖨 In reader</a></div>
      <p class="muted">Chiếu Big Book lên TV hoặc in khổ lớn. Kể chuyện 3 bước: trước truyện (tranh bìa, đoán nhân vật) → kể (rối, động tác, đổi giọng) → sau truyện (hỏi đáp, con thay tên mình vào nhân vật).</p></div>`;
    $('#pv').onclick = () => { i = Math.max(0, i - 1); draw(); };
    $('#nx').onclick = () => { i = Math.min(v.n - 1, i + 1); draw(); };
    $('#le').onclick = () => { lang = 'en'; draw(); }; $('#lz').onclick = () => { lang = 'zh'; draw(); };
    $('#pl').onclick = () => play(lang === 'en' ? v.p.a_en : v.p.a_zh);
    $('.cap', el).onclick = e => play(e.currentTarget.dataset.a);
  };
  draw();
}
function tabReader(s, el) {
  const bk = bookFor(s);
  el.innerHTML = bk ? `<div class="box"><h3>Reader ${esc(bk.b.t)} · ${esc(bk.b.zh)}</h3><p>Sách nhỏ A5 (in A4 ngang, gấp đôi): mỗi trang một cảnh, câu tiếng Anh, câu tiếng Trung và pinyin. Dùng ở buổi Practice (đọc theo vai) và Produce (đọc to một trang).</p>
    <a class="btn p" href="#/in/${s.n}/reader">🖨 Mở bản in reader</a> <a class="btn" href="../index.html?gv=1#/reader">Reader trên web học (chạm câu để nghe)</a></div>` : '<p>Buổi ôn, thi dùng reader các unit trong chặng.</p>';
}

/* ---------------- chant ---------------- */
function chantBox(key) {
  const c = D.chants[key]; if (!c) return '';
  return `<div class="box"><h3>${esc(c.name)}</h3><div class="muted">Giai điệu: ${esc(D.tunes[c.tune])} · chant đọc theo nhịp, câu lấy từ truyện của unit</div>
    <div style="margin:8px 0"><button class="btn p" data-nh="${c.tune}">▶ Nhạc nền</button> <button class="btn" data-seq="en" data-k="${key}">▶ Cả bài English</button> <button class="btn" data-seq="zh" data-k="${key}">▶ Cả bài 中文</button> <button class="btn" data-stop>■</button></div>
    ${c.lines.map(l => `<div class="line"><button class="btn s" data-a="${esc(l.a_en)}">🔊</button><span class="en">${esc(l.en)}</span>
      <button class="btn s" data-a="${esc(l.a_zh)}">🔊</button><span class="zh">${esc(l.zh)}</span><span class="mv">💃 ${esc(l.mv)}</span></div>`).join('')}</div>`;
}
function wireAudio(el) {
  el.querySelectorAll('[data-a]').forEach(b => b.onclick = e => { e.stopPropagation(); play(b.dataset.a); });
  el.querySelectorAll('[data-nh]').forEach(b => b.onclick = () => { NH.src = 'nhac/' + b.dataset.nh + '.mp3'; NH.play().catch(() => {}); });
  el.querySelectorAll('[data-seq]').forEach(b => b.onclick = () => playSeq(D.chants[b.dataset.k].lines.map(l => b.dataset.seq === 'en' ? l.a_en : l.a_zh)));
  el.querySelectorAll('[data-stop]').forEach(b => b.onclick = stopAll);
}
function tabChant(s, el) {
  const keys = ['hello', ...sessUnits(s), 'bye'];
  el.innerHTML = `<p>Cách dùng: lần 1 nghe nhạc nền và xem cô làm động tác; lần 2 nói theo từng câu (🔊); lần 3 cả lớp đọc theo nhịp trên nhạc nền, làm động tác. Câu tiếng Trung dùng đúng nội dung câu tiếng Anh.</p>
    <div class="grid2">${keys.map(chantBox).join('')}${jollyBox(s)}</div>
    <h2>Video bài hát (kênh ngoài, mở trên lớp)</h2>
    ${s.videos.length ? `<ul class="clean">${s.videos.map(v => `<li><a href="${esc(v.url)}" target="_blank" rel="noopener">${esc(v.label)}</a> <span class="chip">${v.l === 'zh' ? '中文' : 'English'}</span></li>`).join('')}</ul>` : '<p class="muted">Buổi này chưa có video gắn trong web học.</p>'}
    <p class="muted">Bài hát của GrapeSEED, Jolly Phonics không đưa lên web vì bản quyền; nếu trung tâm có bản quyền, cô mở từ tài khoản chính thức.</p>`;
  wireAudio(el);
}

/* ---------------- thủ công ---------------- */
function tabCraft(s, el) {
  const us = sessUnits(s).filter(u => D.crafts[u]);
  el.innerHTML = us.length ? us.map(u => { const c = D.crafts[u]; return `<div class="box" style="margin-bottom:12px"><h3>${esc(D.units[u].name)} · ${esc(c.name)}</h3>
    <p><b>Đồ dùng:</b> ${esc(c.mat)}</p><ol class="clean">${c.steps.map(x => `<li>${esc(x)}</li>`).join('')}</ol>
    <p><b>Con nói khi thuyết trình:</b> <span class="en">${esc(c.say[0])}</span> · <span class="zh">${esc(c.say[1])}</span></p>
    <a class="btn p" href="#/in/${s.n}/craft-${u}">🖨 Mẫu in</a></div>`; }).join('') : '<p>Buổi ôn, thi: các con dùng lại sản phẩm thủ công của các unit trong chặng để thuyết trình.</p>';
}

/* ---------------- tải về ---------------- */
function tabDownload(s, el) {
  const L = [['flash', 'Flashcard lớn gấp đôi (A4 ngang): mặt tranh cho con, mặt chữ cho cô'], ['mini', 'Thẻ mini tranh, chữ Anh, chữ Trung (Memory, Go fish, Đập thẻ)'], ['bingo', 'Bingo 3 × 3 (4 bảng khác nhau)'],
    ['strips', 'Dải câu đôi bạn Anh – Trung'], ['answer', 'Thẻ trả lời mỗi bé (1–4, ✓ ✗, English, 中文)'], ['puppets', 'Rối que nhân vật của truyện'], ['reader', 'Reader A5'], ['record', 'Phiếu ghi giấy (khi mất điện)']];
  if (s.kind === 'thi') L.push(['sheet', 'Phiếu trả lời bài thi (tô ô A B C)']);
  const moi = s.n <= 11 ? `<div class="box" style="border:2px solid #F2C14E;background:#FFF8E6;margin-bottom:12px"><b>🖨 Học liệu in mới (11/11/2026, theo truyện, big book, vè đang có trên web học):</b> <a href="hoc-lieu/#/b/${s.n}">sách bài tập buổi ${s.n}</a> · <a href="hoc-lieu/">bộ đồ dùng in, thủ công, reader của unit</a>. Các bản in cũ bên dưới theo truyện v7.</div>` : '';
  el.innerHTML = moi + `<p>Mở bản in rồi bấm In (hoặc Lưu PDF) trên trình duyệt. Tranh lấy từ web học nên con gặp đúng hình đã thấy ở ngày web. Đồ dùng của con không in chữ tiếng Việt.</p>
    <div class="grid2">${L.map(([k, v]) => `<a class="box" style="text-decoration:none" href="#/in/${s.n}/${k}"><h3>🖨 ${esc(v.split(':')[0].split('(')[0])}</h3><div class="muted">${esc(v)}</div></a>`).join('')}</div>`;
}

/* ---------------- lớp & báo cáo ---------------- */
function renderRoster() {
  const r = Roster.get();
  app.innerHTML = `<div class="top"><a href="#/">🌱 48 buổi</a><span>›</span><b>Danh sách lớp</b></div><div class="wrap">
    <p>Danh sách lưu trên máy cô dạy. Gõ mỗi dòng một tên con (đúng tên như trên web học).</p>
    <textarea id="ta" rows="12" style="width:100%;font:inherit;padding:10px;border-radius:12px">${esc(r.map(x => x.name).join('\n'))}</textarea>
    <p><button class="btn p" id="sv">Lưu danh sách</button></p></div>`;
  $('#sv').onclick = () => { const names = $('#ta').value.split('\n').map(x => x.trim()).filter(Boolean); Roster.set(names.map((name, i) => ({ id: 'k' + i + '_' + name.replace(/\s+/g, ''), name }))); location.hash = '#/'; };
}
function stats(s, kid) {
  const r = rec(s.n); const ev = r.ev.filter(e => e.kid === kid);
  const c = t => ev.filter(e => e.k === t).length;
  let ok = 0, tot = 0;
  const lastAns = {};
  ev.filter(e => e.k === 'ans').forEach(e => lastAns[e.i] = e.v);
  Object.entries(lastAns).forEach(([i, v]) => { const sl = s.slides[i]; if (!sl) return; tot++; const ans = sl.ty === 'tf' ? (sl.ans ? 'Đ' : 'S') : sl.ty === 'who' ? String(sl.opts.indexOf(sl.ans) + 1) : String((sl.ans || 0) + 1); if (String(v) === ans) ok++; });
  return { tay: c('tay'), en: c('en'), zh: c('zh'), bang: c('bang'), ok, tot, star: c('tay') + c('en') + c('zh') + c('bang') + ok };
}
function tabReport(s, el) {
  const kids = Roster.get(); const r = rec(s.n);
  if (!kids.length) { el.innerHTML = `<p>Chưa có danh sách lớp. <a class="btn p" href="#/lop">Nhập danh sách lớp</a></p>`; return; }
  const H = { td: 'Thái độ', cx: 'Cảm xúc', tt: 'Tương tác' };
  const draw = () => {
    el.innerHTML = `<p>Số liệu tự hình thành khi cô bấm trên màn cô lúc trình chiếu. Câu chưa bấm không tính là sai. 4H chấm 0–2 cuối buổi.</p>
    <table class="t"><tr><th>Bé</th><th>Có mặt</th><th>Giơ tay</th><th>Nói EN</th><th>Nói ZH</th><th>Thẻ đúng</th><th>Bảng con</th>${Object.values(H).map(x => `<th>${x}</th>`).join('')}<th>Ghi chú</th></tr>
    ${kids.map(k => { const st = stats(s, k.id); const h = r.h4[k.id] || {}; return `<tr><td><b>${esc(k.name)}</b></td><td><input type="checkbox" data-att="${k.id}" ${r.att[k.id] !== false ? 'checked' : ''}></td>
      <td>${st.tay}</td><td>${st.en}</td><td>${st.zh}</td><td>${st.ok}/${st.tot}</td><td>${st.bang}</td>
      ${Object.keys(H).map(x => `<td><select data-h="${k.id}|${x}"><option></option>${[2, 1, 0].map(v => `<option ${h[x] === v ? 'selected' : ''}>${v}</option>`).join('')}</select></td>`).join('')}
      <td><input data-note="${k.id}" value="${esc(r.note[k.id] || '')}" style="width:100%"></td></tr>`; }).join('')}</table>
    <p><button class="btn p" id="csv">⬇ Tải CSV</button> <button class="btn" id="vd">📋 Chép lời vinh danh (Zalo)</button></p>
    <details><summary>Mốc 4H</summary><ul class="clean"><li><b>Thái độ</b> 2: tự giơ tay, làm ngay · 1: khi cô gọi tên hoặc nhắc riêng · 0: rời chỗ, không làm dù đã nhắc</li><li><b>Cảm xúc</b> 2: vui, hăng hái · 1: lúc đầu ngại, vui dần · 0: rụt rè, muốn dừng sớm</li><li><b>Tương tác với bạn</b> 2: tự hỏi đáp, làm Đôi bạn trọn vai · 1: khi cô ghép cặp · 0: chưa nói với bạn</li></ul></details>`;
    el.querySelectorAll('[data-att]').forEach(x => x.onchange = () => { r.att[x.dataset.att] = x.checked; saveRec(s.n, r); });
    el.querySelectorAll('[data-h]').forEach(x => x.onchange = () => { const [k, f] = x.dataset.h.split('|'); (r.h4[k] = r.h4[k] || {})[f] = x.value === '' ? undefined : +x.value; saveRec(s.n, r); });
    el.querySelectorAll('[data-note]').forEach(x => x.onchange = () => { r.note[x.dataset.note] = x.value; saveRec(s.n, r); });
    $('#csv').onclick = () => {
      const rows = [['Buổi', 'Bé', 'Có mặt', 'Giơ tay', 'Nói EN', 'Nói ZH', 'Thẻ đúng', 'Số câu', 'Bảng con', 'Thái độ', 'Cảm xúc', 'Tương tác', 'Ghi chú']];
      kids.forEach(k => { const st = stats(s, k.id), h = r.h4[k.id] || {}; rows.push([s.n, k.name, r.att[k.id] !== false ? 1 : 0, st.tay, st.en, st.zh, st.ok, st.tot, st.bang, h.td ?? '', h.cx ?? '', h.tt ?? '', r.note[k.id] || '']); });
      const blob = new Blob(['﻿' + rows.map(x => x.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\n')], { type: 'text/csv' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `seedling-buoi-${s.n}.csv`; a.click();
    };
    $('#vd').onclick = () => {
      const t = `🌱 Seedling · Buổi ${s.n}\n` + kids.filter(k => r.att[k.id] !== false).map(k => { const st = stats(s, k.id); const best = [['tay', 'Bạn hăng hái giơ tay'], ['en', 'Bạn nói tiếng Anh giỏi'], ['zh', 'Bạn nói tiếng Trung giỏi'], ['ok', 'Bạn nghe hiểu nhanh'], ['bang', 'Bạn viết chăm']].sort((a, b) => st[b[0]] - st[a[0]])[0][1]; return `⭐ ${k.name}: ${best}`; }).join('\n');
      navigator.clipboard && navigator.clipboard.writeText(t); alert('Đã chép lời vinh danh.');
    };
  };
  draw();
}

/* ---------------- trình chiếu ---------------- */
let P = null; // trạng thái trình chiếu
const bc = ('BroadcastChannel' in window) ? new BroadcastChannel('sdd-chieu') : null;
function send() { if (bc && P) bc.postMessage({ n: P.s.n, i: P.i, sub: P.sub, rev: P.rev, off: P.off }); }

function renderPresent(n, i) {
  const s = D.sess[n]; if (!s) return renderHome();
  P = { s, i: Math.max(0, Math.min(i, s.slides.length - 1)), sub: 0, rev: false, off: false, kids: Roster.get().length > 0 && ls.get('sdd-kids', true) };
  drawPresent(true);
}
function drawPresent(first) {
  const s = P.s, x = s.slides[P.i];
  app.innerHTML = `<div class="pres ${P.kids ? 'withkids' : ''}">
    <div class="pbar"><a class="btn s" href="#/b/${s.n}">✕</a><b>Buổi ${s.n}</b><span class="badge">${BLOCK[x.b]}</span><span class="badge">${x.m}</span><span>${P.i + 1}/${s.slides.length}</span><span class="sp"></span>
      <button class="btn s" id="pv">◀</button><button class="btn s" id="rv">${P.rev ? 'Ẩn' : 'Hiện'} đáp án</button><button class="btn s" id="pl">🔊</button><button class="btn s" id="nx">▶</button>
      <button class="btn s ${P.off ? 'on' : ''}" id="of">⬛ Tắt chiếu</button><button class="btn s" id="win">📺 Cửa sổ chiếu</button><button class="btn s ${P.kids ? 'on' : ''}" id="kd">👥</button><button class="btn s" id="fs">⛶</button></div>
    <div class="stage" id="stg"></div>
    <div class="note">💡 ${esc(x.note)}</div>
    ${P.kids ? `<div class="kids" id="kids"></div>` : ''}
  </div>`;
  drawStage($('#stg'), x, true);
  if (P.kids) drawKids();
  $('#pv').onclick = () => go(-1); $('#nx').onclick = () => go(1);
  $('#rv').onclick = () => { P.rev = !P.rev; drawPresent(); };
  $('#pl').onclick = () => autoPlay(x);
  $('#of').onclick = () => { P.off = !P.off; drawPresent(); };
  $('#kd').onclick = () => { P.kids = !P.kids; ls.set('sdd-kids', P.kids); drawPresent(); };
  $('#fs').onclick = () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()).catch(() => {});
  $('#win').onclick = () => window.open(location.pathname + '?chieu=1#/b/' + s.n + '/chieu', 'sdd-chieu', 'width=1280,height=760');
  send();
  if (first !== false && !P.off) autoPlay(x);
}
function subCount(x) { return x.ty === 'story' ? x.scenes.length : x.ty === 'cards' ? x.cards.length : x.ty === 'mystery' || x.ty === 'stations' ? 4 : 1; }
function go(d) {
  const x = P.s.slides[P.i], sc = subCount(x);
  if (d > 0 && P.sub < sc - 1) { P.sub++; P.rev = false; drawPresent(); return; }
  if (d < 0 && P.sub > 0) { P.sub--; P.rev = false; drawPresent(); return; }
  const ni = P.i + d; if (ni < 0 || ni >= P.s.slides.length) return;
  P.i = ni; P.sub = d < 0 ? subCount(P.s.slides[ni]) - 1 : 0; P.rev = false; stopAll(); clearInterval(window.__tm);
  history.replaceState(null, '', '#/b/' + P.s.n + '/chieu/' + P.i); drawPresent();
}
function autoPlay(x) {
  const sub = P ? P.sub : 0;
  if (x.ty === 'story') { const c = x.scenes[sub]; play(x.l === 'en' ? c.a_en : c.a_zh); }
  else if (x.ty === 'cards') { const c = x.cards[sub]; play(x.l === 'en' ? c.a_en : c.a_zh); }
  else if (['quiz', 'tf', 'who', 'exam'].includes(x.ty)) play(x.a);
  else if (x.ty === 'bridge') play(x.a_en);
  else if (x.ty === 'oral') play(x.a_q);
}
document.addEventListener('keydown', e => {
  if (!P || !/chieu/.test(location.hash) || PROJ) return;
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (e.key === 'ArrowRight' || e.key === 'PageDown') { go(1); e.preventDefault(); }
  else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { go(-1); e.preventDefault(); }
  else if (e.key === ' ') { P.rev = !P.rev; drawPresent(false); e.preventDefault(); }
  else if (e.key === 'r' || e.key === 'R') autoPlay(P.s.slides[P.i]);
  else if (e.key === 'b' || e.key === 'B') { P.off = !P.off; drawPresent(false); }
});

function opt3(opts, ans, rev, imgOf, label) {
  return `<div class="opts">${opts.map((o, k) => `<div class="opt ${rev ? (k === ans ? 'right' : 'dim') : ''}"><span class="num">${k + 1}</span>${imgOf(o) ? `<img src="${A(imgOf(o))}">` : `<div class="big">${esc(label(o))}</div>`}${label(o) && imgOf(o) ? `<div class="mid">${esc(label(o))}</div>` : ''}</div>`).join('')}</div>`;
}
function timer(el, sec) {
  let t = sec; const f = () => { const m = Math.floor(t / 60), s2 = t % 60; el.textContent = `${m}:${String(s2).padStart(2, '0')}`; if (t-- <= 0) clearInterval(window.__tm); };
  clearInterval(window.__tm); f(); window.__tm = setInterval(f, 1000);
}
function drawStage(st, x, teacher) {
  const sub = P.sub, rev = P.rev;
  let h = '';
  switch (x.ty) {
    case 'title': h = `<div class="sl"><div class="badge" style="font-size:20px">🌱 Seedling</div><h1>${esc(x.t.replace(/^Buổi \d+ trên lớp · /, ''))}</h1><div class="mid muted">${esc(x.about)}</div>
      <div style="display:flex;gap:16px">${['bong', 'leo', 'anna', 'xiaomei'].map(k => `<img src="${A(who(k).img)}" style="height:24vh">`).join('')}</div></div>`; break;
    case 'song': { const c = D.chants[x.chant]; h = c ? `<div class="sl" style="justify-content:flex-start;overflow:auto"><h1>🎵 ${esc(c.name)}</h1><div><button class="btn p" data-nh="${c.tune}">▶ Nhạc nền</button> <button class="btn" data-seq="en" data-k="${x.chant}">▶ English</button> <button class="btn" data-seq="zh" data-k="${x.chant}">▶ 中文</button> <button class="btn" data-stop>■</button></div>
      <div class="frames">${c.lines.map(l => `<div><span class="en" data-a="${esc(l.a_en)}">${esc(l.en)}</span><br><span class="zh" data-a="${esc(l.a_zh)}">${esc(l.zh)}</span> <span class="mv" style="font-size:16px">💃 ${esc(l.mv)}</span></div>`).join('')}</div></div>` : ''; break; }
    case 'quiz': h = `<div class="sl"><div class="mid">${x.l === 'zh' ? '听一听 · 选一选' : 'Listen and choose'} <button class="btn" data-a="${esc(x.a)}">🔊</button></div>${rev ? `<div class="big ${x.l}">${esc(x.say)}</div>` : ''}${opt3(x.opts, x.ans, rev, o => o.img, o => '')}</div>`; break;
    case 'who': h = `<div class="sl"><div class="mid">${x.l === 'zh' ? '谁在说？' : 'Who is talking?'} <button class="btn" data-a="${esc(x.a)}">🔊</button></div>${rev ? `<div class="big ${x.l}">${esc(x.t)}</div>` : ''}${opt3(x.opts.map(who), x.opts.indexOf(x.ans), rev, o => o.img, o => o.n.split(' · ')[0])}</div>`; break;
    case 'story': { const c = x.scenes[sub], w = who(c.who); h = `<div class="sl"><div class="mid"><span class="${x.l}">${esc(x.title)}</span></div><div class="scene"><img class="bg" src="${A(c.img)}">${ov(c.img, c.who) ? `<img class="who" src="${A(w.img)}">` : ''}
      <div class="cap ${x.l}" data-a="${esc(x.l === 'en' ? c.a_en : c.a_zh)}">${esc(x.l === 'en' ? c.en : c.zh)}${x.l === 'zh' ? `<small>${esc(c.py)}</small>` : ''}</div></div><div class="dots">${x.scenes.map((_, k) => `<i class="${k === sub ? 'on' : ''}"></i>`).join('')}</div></div>`; break; }
    case 'cards': { const c = x.cards[sub]; h = `<div class="sl">${c.img ? `<img class="pic" src="${A(c.img)}">` : `<div style="font-size:160px">${c.e}</div>`}<div class="big ${x.l}" data-a="${esc(x.l === 'en' ? c.a_en : c.a_zh)}">${esc(x.l === 'en' ? c.en : c.zh)}</div>${x.l === 'zh' ? `<div class="py">${esc(c.py)}</div>` : ''}<div class="dots">${x.cards.map((_, k) => `<i class="${k === sub ? 'on' : ''}"></i>`).join('')}</div></div>`; break; }
    case 'mystery': h = `<div class="sl"><div class="mid">Who? Where? · 谁？在哪儿？</div><img class="pic" src="${A(x.img)}" style="filter:blur(${[28, 16, 7, 0][sub]}px);transition:filter .6s"></div>`; break;
    case 'tf': h = `<div class="sl"><div class="tf"><img class="pic" src="${A(x.img)}" style="max-width:45%">${who(x.who).img ? `<img src="${A(who(x.who).img)}" style="height:40vh">` : ''}</div><div class="mid en">${esc(x.say)} <button class="btn" data-a="${esc(x.a)}">🔊</button></div>${rev ? `<div class="mark" style="font-size:110px;color:${x.ans ? 'var(--green)' : 'var(--red)'}">${x.ans ? '✓' : '✗'}</div>` : '<div class="mid muted">✓ or ✗ ?</div>'}</div>`; break;
    case 'grid': h = `<div class="sl"><div class="mid">${esc(x.t || 'Đập thẻ · Slap!')}</div><div class="grid3">${x.cards.map(c => `<div class="c">${c.img ? `<img src="${A(c.img)}">` : `<div style="font-size:70px">${c.e}</div>`}${x.l === 'zh' ? `<div class="zh" style="font-weight:800" data-a="${esc(c.a_zh)}">${esc(c.zh)}</div>` : `<div class="en" style="font-weight:800" data-a="${esc(c.a_en)}">${esc(c.en)}</div>`}</div>`).join('')}</div></div>`; break;
    case 'pair': h = `<div class="sl"><div class="mid">👫 Đôi bạn · Talk with your friend</div><div class="frames">${x.items.map(it => `<div><span class="en" data-a="${esc(it.a_en)}">${esc(it.en)}</span><br><span class="zh" data-a="${esc(it.a_zh)}" style="font-size:.8em">${esc(it.zh)}</span></div>`).join('')}</div></div>`; break;
    case 'bridge': h = `<div class="sl"><div class="mid">🌉 Phiên dịch nhí · 小翻译</div><div class="big en" data-a="${esc(x.a_en)}">${esc(x.en)}</div>${rev ? `<div class="big zh" data-a="${esc(x.a_zh)}">${esc(x.zh)}</div><div class="py">${esc(x.py)}</div>` : '<div class="mid muted">→ 中文 ?</div>'}</div>`; break;
    case 'move': h = `<div class="sl"><h1>🤸 ${esc(x.game)}</h1><div class="timer" id="tmr"></div><div class="grid3" style="grid-template-columns:repeat(4,1fr)">${x.cards.map(c => `<div class="c">${c.img ? `<img src="${A(c.img)}" style="height:11vh">` : ''}<div class="en" style="font-weight:800">${esc(c.en)}</div><div class="zh">${esc(c.zh)}</div></div>`).join('')}</div><button class="btn" id="tgo">▶ Bắt đầu đếm giờ</button></div>`; break;
    case 'sound': h = `<div class="sl"><div class="sym ${x.l}">${esc(x.sym)}</div><div class="mid">${esc(x.name || '')}</div>${x.l === 'en' && teacher ? `<a class="btn s" href="${JL.audio}" target="_blank" rel="noopener">🔊 Âm chuẩn · Jolly Learning</a>` : ''}<div class="opts">${x.ex.map(e => `<div class="opt"><div class="big ${x.l}">${esc(e[1] || e[0])}</div><div class="py">${esc(e[1] ? e[0] : '')}</div></div>`).join('')}</div></div>`; break;
    case 'board': h = `<div class="sl"><h1>✏️ Bảng con · 写一写</h1>${(x.wb || []).map(w => `<div class="big ${/[一-鿿]/.test(w) ? 'zh' : 'en'}">${esc(w)}</div>`).join('')}</div>`; break;
    case 'bigbook': { const bk = x.unit && D.books[x.unit] ? { u: x.unit, b: D.books[x.unit] } : bookFor(P.s); if (!bk) { h = ''; break; } const v = bookView(bk.b, ls.get('sdd-bbl', 'en'), sub, x.upto); h = `<div class="sl"><div class="mid">📖 Big Book · ${esc(bk.b.t)}</div>${v.html}<div><button class="btn" id="bbp">◀</button> <button class="btn" id="bbl">English / 中文</button> <button class="btn" id="bbn">▶</button></div></div>`; P.bb = v; break; }
    case 'craft': { const c = D.crafts[x.unit]; h = `<div class="sl"><h1>✂️ ${esc(c.name)}</h1><div class="big">${esc(c.steps[x.step])}</div><div class="mid muted">${esc(c.mat)}</div></div>`; break; }
    case 'present': h = `<div class="sl"><h1>🎤 Show and tell</h1><div class="frames">${(x.frames || []).map(f => `<div><span class="en">${esc(f[0])}</span><br><span class="zh">${esc(f[1])}</span></div>`).join('')}</div><div class="timer" id="tmr"></div><button class="btn" id="tgo">▶ 60 giây</button></div>`; break;
    case 'stations': h = `<div class="sl"><h1>🔄 Trạm xoay vòng</h1><div class="stations">${x.stations.map((st2, k) => `<div class="${k === sub ? 'cur' : ''}"><b>${k + 1}. ${esc(st2[0])}</b><br>${esc(st2[1])}</div>`).join('')}</div><div class="timer" id="tmr"></div><button class="btn" id="tgo">▶ 10 phút</button></div>`; break;
    case 'note': h = `<div class="sl"><h1>${esc(x.t)}</h1><div class="mid">${esc(x.body)}</div><div class="timer" id="tmr"></div><button class="btn" id="tgo">▶ 15 phút</button></div>`; break;
    case 'exam': h = `<div class="sl"><div class="mid">${x.n}. <button class="btn" data-a="${esc(x.a)}">🔊</button></div><div class="opts">${x.imgs.map((im, k) => `<div class="opt ${rev ? (k === x.ans ? 'right' : 'dim') : ''}"><span class="num">${'ABC'[k]}</span><img src="${A(im)}"></div>`).join('')}</div>${rev ? `<div class="mid ${x.l}">${esc(x.t)} <span class="py">${esc(x.py)}</span></div>` : ''}</div>`; break;
    case 'oral': h = `<div class="sl"><div class="mid">🗣 YCT口试</div><div class="big zh" data-a="${esc(x.a_q)}">${esc(x.q)}</div><div class="py">${esc(x.py)}</div>${rev ? `<div class="big zh" data-a="${esc(x.a_a)}">${esc(x.a)}</div><div class="py">${esc(x.apy)}</div>` : ''}</div>`; break;
    case 'ask': h = `<div class="sl">${x.img ? `<img class="pic" src="${A(x.img)}" style="max-height:34vh">` : ''}<div class="big ${x.l}" data-a="${esc(x.a)}">${esc(x.q)}</div>${x.py ? `<div class="py">${esc(x.py)}</div>` : ''}<div class="frames">${x.opts.map((o, k) => `<div style="${rev && k === x.ans ? 'border-color:var(--green);background:#EAF8EF' : ''}">${k + 1}. ${esc(o)}</div>`).join('')}</div></div>`; break;
    case 'praise': { const kids = Roster.get(); h = `<div class="sl"><h1>🏅 Well done! · 真棒！</h1><div class="frames" style="flex-direction:row;flex-wrap:wrap;justify-content:center">${kids.length ? kids.filter(k => rec(P.s.n).att[k.id] !== false).map(k => `<div>⭐ ${esc(k.name)}</div>`).join('') : '<div>⭐ ⭐ ⭐</div>'}</div></div>`; break; }
    case 'home': h = `<div class="sl"><h1>🏠 Ở nhà · Home</h1><div class="mid">📒 ${esc((x.wb || []).join(' · '))}</div><div class="mid">💻 Web: ${x.nxt.length ? 'ngày ' + x.nxt.join(', ') : '—'}</div><div class="mid">See you next time! · 下次见！</div></div>`; break;
    default: h = `<div class="sl"><h1>${esc(x.ty)}</h1></div>`;
  }
  st.innerHTML = h + (P.off ? `<div class="off">🌱 Seedling · các con nhìn cô nhé!</div>` : '');
  wireAudio(st);
  st.querySelectorAll('[data-a]').forEach(b => { if (!b.dataset.a) b.removeAttribute('data-a'); });
  const tg = $('#tgo', st); if (tg) tg.onclick = () => timer($('#tmr', st), x.ty === 'present' ? 60 : x.ty === 'move' ? (x.sec || 600) : x.ty === 'note' ? 900 : 600);
  if (x.ty === 'bigbook' && P.bb) {
    $('#bbp', st).onclick = () => { P.sub = Math.max(0, P.sub - 1); drawPresent(); };
    $('#bbn', st).onclick = () => { P.sub = Math.min(P.bb.n - 1, P.sub + 1); drawPresent(); };
    $('#bbl', st).onclick = () => { ls.set('sdd-bbl', ls.get('sdd-bbl', 'en') === 'en' ? 'zh' : 'en'); drawPresent(); };
    const c = $('.cap', st); if (c) c.onclick = () => play(c.dataset.a);
  }
}
function drawKids() {
  const el = $('#kids'); const s = P.s, x = s.slides[P.i]; const kids = Roster.get(); const r = rec(s.n);
  const answering = ['quiz', 'who', 'exam', 'tf'].includes(x.ty);
  const counts = {}; kids.forEach(k => { const st = stats(s, k.id); counts[k.id] = st.en + st.zh; });
  const late = ['4', '5', '6', '7'].includes(x.b);
  el.innerHTML = `<div class="muted" style="font-size:13px">${answering ? 'Bấm đáp án con giơ' : 'Bấm khi con làm'} · ↩ <button class="btn s" id="undo">Hoàn tác</button></div>` +
    kids.map(k => {
      const vang = r.att[k.id] === false; const mine = r.ev.filter(e => e.kid === k.id);
      const cur = mine.filter(e => e.k === 'ans' && e.i === P.i).pop();
      const n2 = t => mine.filter(e => e.k === t).length;
      const opts = x.ty === 'tf' ? ['Đ', 'S'] : x.ty === 'who' ? x.opts.map((_, i) => String(i + 1)) : ['1', '2', '3'];
      const ans = x.ty === 'tf' ? (x.ans ? 'Đ' : 'S') : x.ty === 'who' ? String(x.opts.indexOf(x.ans) + 1) : String((x.ans || 0) + 1);
      return `<div class="kid ${vang ? 'vang' : ''} ${late && !vang && counts[k.id] === 0 ? 'low' : ''}"><div class="nm"><span>${esc(k.name)}</span><span>⭐ ${stats(s, k.id).star}</span></div><div class="bt">
        ${answering ? opts.map(o => `<button data-k="${k.id}" data-ans="${o}" class="${cur && cur.v === o ? (P.rev ? (o === ans ? 'ok' : 'no') : 'sel') : ''}">${o}</button>`).join('') : ''}
        <button data-k="${k.id}" data-t="tay">✋ ${n2('tay')}</button><button data-k="${k.id}" data-t="en">🎤EN ${n2('en')}</button><button data-k="${k.id}" data-t="zh">🎤中 ${n2('zh')}</button>${x.ty === 'board' ? `<button data-k="${k.id}" data-t="bang">✏️ ${n2('bang')}</button>` : ''}
        <button data-k="${k.id}" data-vang="1" title="Vắng">${vang ? 'vắng' : '·'}</button></div></div>`;
    }).join('');
  el.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { const r2 = rec(s.n); r2.ev.push({ kid: b.dataset.k, k: b.dataset.t, i: P.i }); saveRec(s.n, r2); drawKids(); });
  el.querySelectorAll('[data-ans]').forEach(b => b.onclick = () => { const r2 = rec(s.n); r2.ev.push({ kid: b.dataset.k, k: 'ans', i: P.i, v: b.dataset.ans }); saveRec(s.n, r2); drawKids(); });
  el.querySelectorAll('[data-vang]').forEach(b => b.onclick = () => { const r2 = rec(s.n); r2.att[b.dataset.k] = r2.att[b.dataset.k] === false; saveRec(s.n, r2); drawKids(); });
  $('#undo', el).onclick = () => { const r2 = rec(s.n); r2.ev.pop(); saveRec(s.n, r2); drawKids(); };
}

/* cửa sổ chiếu: chỉ hiện trang, theo màn cô */
function renderProjector() {
  document.body.style.background = '#FFFDF7';
  const draw = m => {
    const s = D.sess[m.n]; if (!s) return; P = { s, i: m.i, sub: m.sub, rev: m.rev, off: m.off, kids: false };
    app.innerHTML = `<div class="pres" style="grid-template-rows:1fr"><div class="stage" id="stg" style="height:100vh"></div></div>`;
    drawStage($('#stg'), s.slides[m.i], false);
    app.querySelectorAll('button').forEach(b => { if (!b.dataset.a && !b.id.startsWith('t')) b.style.visibility = 'hidden'; });
  };
  const h = location.hash.split('/'); draw({ n: +(h[2] || 1), i: 0, sub: 0, rev: false, off: false });
  if (bc) bc.onmessage = e => draw(e.data);
  app.onclick = () => document.documentElement.requestFullscreen && document.documentElement.requestFullscreen().catch(() => {});
}

/* ---------------- bản in ---------------- */
function words4(s, min) {
  // từ của buổi; nếu ít, lấy thêm từ các buổi trước cùng unit, rồi các buổi trước đó
  const seen = new Set(), out = [];
  const add = ws => ws.forEach(w => { if (w.img && !seen.has(w.en) && !seen.has(w.img)) { seen.add(w.en); seen.add(w.img); out.push(w); } });
  add(s.words);
  const u = sessUnits(s)[0];
  const prev = Object.values(D.sess).filter(x => x.n < s.n).sort((a, b) => b.n - a.n);
  if (out.length < (min || 1)) add(prev.filter(x => u && (x.units || []).includes(u)).flatMap(x => x.words));
  for (const x of prev) { if (out.length >= (min || 1)) break; add(x.words); }
  return out;
}
function renderPrint(n, kind) {
  const s = D.sess[n]; if (!s) return renderHome();
  const ws = words4(s, kind === 'bingo' ? 12 : 1);
  const pages = [];
  const pg = (inner, land) => pages.push(`<div class="pg ${land ? 'a4l land' : 'a4'}">${inner}</div>`);
  const chunk = (a, k) => a.reduce((r, x, i) => (i % k ? r[r.length - 1].push(x) : r.push([x]), r), []);
  const cell = (inner, st = '') => `<div style="${st}">${inner}</div>`;
  if (kind === 'flash') ws.forEach(w => pg(`<div style="display:grid;grid-template-columns:1fr 1fr;height:100%"><div style="display:flex;align-items:center;justify-content:center;border-right:.5mm dashed #999"><img src="${A(w.img)}" style="max-width:120mm;max-height:160mm;object-fit:contain"></div>
      <div style="display:flex;flex-direction:column;justify-content:center;padding:0 12mm"><div class="en" style="font-size:40pt;font-weight:800">${esc(w.en)}</div><div class="zh" style="font-size:44pt;font-weight:700">${esc(w.zh)}</div><div class="py" style="font-size:18pt">${esc(w.py)}</div><div style="margin-top:10mm;color:#888;font-size:10pt">Buổi ${s.n} · gấp đôi theo nét đứt · mặt tranh quay về phía các con</div></div></div>`, true));
  if (kind === 'mini') ['img', 'en', 'zh'].forEach(f => chunk(ws, 12).forEach(ch => pg(`<div class="ph">Thẻ mini · ${f === 'img' ? 'tranh' : f === 'en' ? 'chữ tiếng Anh' : 'chữ tiếng Trung'} · buổi ${s.n}</div><div class="cutg" style="grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(4,66mm)">${ch.map(w => cell(f === 'img' ? `<img src="${A(w.img)}">` : f === 'en' ? `<div class="en" style="font-size:${w.en.length > 14 ? 15 : 20}pt;font-weight:800">${esc(w.en)}</div>` : `<div class="zh" style="font-size:${w.zh.length > 5 ? 18 : 28}pt;font-weight:700">${esc(w.zh)}</div><div class="py" style="font-size:11pt">${esc(w.py)}</div>`)).join('')}</div>`)));
  if (kind === 'bingo') { const pool = ws; const boards = [0, 1, 2, 3].map(b => { const a = pool.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (i * 7 + b * 13 + 5) % (i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, 9); });
    chunk(boards, 2).forEach((pair, pi) => pg(`<div class="ph">Bingo · 宾果 · cô đọc tiếng Anh, lượt sau tiếng Trung · con đặt hạt lên tranh</div>${pair.map((b, k) => `<div style="margin:4mm auto;width:150mm"><b>Bingo ${pi * 2 + k + 1}</b><div class="cutg" style="grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,40mm);border:.6mm solid #333">${b.map(w => cell(`<img src="${A(w.img)}" style="max-height:28mm"><div class="en" style="font-size:9pt;font-weight:700">${esc(w.en)}</div>`)).join('')}</div></div>`).join('')}`)); }
  if (kind === 'strips') { const it = s.slides.filter(x => x.ty === 'bridge' || x.ty === 'pair').flatMap(x => x.items || [x]).filter((v, i, a) => a.findIndex(y => y.en === v.en) === i);
    chunk(it.length ? it : ws.map(w => ({ en: w.en, zh: w.zh, py: w.py })), 6).forEach(ch => pg(`<div class="ph">Dải câu đôi bạn · một bạn nói tiếng Anh, bạn kia nói tiếng Trung · buổi ${s.n}</div>${ch.map(x => `<div style="border:.5mm solid #ccc;border-radius:4mm;padding:4mm 6mm;margin-bottom:4mm"><div class="en" style="font-size:20pt;font-weight:800">${esc(x.en)}</div><div class="zh" style="font-size:20pt;font-weight:700">${esc(x.zh)}</div><div class="py" style="font-size:11pt">${esc(x.py)}</div></div>`).join('')}`)); }
  if (kind === 'answer') pg(`<div class="ph">Thẻ trả lời · mỗi bé 1 tờ · cắt, viết tên con ở mặt sau</div><div class="cutg" style="grid-template-columns:1fr 1fr;grid-template-rows:repeat(4,68mm)">${[['1', '#d64545'], ['2', '#2f6fc0'], ['3', '#2e9b5b'], ['4', '#e08a1e'], ['✓', '#2e9b5b'], ['✗', '#d64545']].map(([t, c]) => cell(`<div style="font-size:70pt;font-weight:900;color:${c}">${t}</div>`, `border-left:3mm solid ${c}`)).join('')}
    ${cell(`<img src="${A(who('leo').img)}" style="max-height:40mm"><div class="en" style="font-size:24pt;font-weight:800">English</div>`)}${cell(`<img src="${A(who('xiaomei').img)}" style="max-height:40mm"><div class="zh" style="font-size:24pt;font-weight:800">中文</div>`)}</div>`);
  if (kind === 'puppets') { const bk = bookFor(s); const ks = bk ? [...new Set(bk.b.pages.map(p => p.who).filter(k => k !== 'narr' && who(k).img))] : ['bong', 'leo', 'anna', 'xiaomei', 'lan']; chunk(ks, 8).forEach(ch => pg(`<div class="ph">Rối que · cắt theo vòng tròn, dán bìa cứng, dán que kem</div><div class="cutg" style="grid-template-columns:1fr 1fr;grid-template-rows:repeat(4,68mm)">${ch.map(k => cell(`<div style="width:56mm;height:56mm;border-radius:50%;border:.6mm dashed #999;display:flex;align-items:center;justify-content:center;overflow:hidden"><img src="${A(who(k).img)}" style="max-height:52mm"></div><b>${esc(who(k).n)}</b>`)).join('')}</div>`)); }
  if (kind === 'reader') { const bk = bookFor(s); if (bk) chunk(bk.b.pages, 2).forEach(pr => pg(`<div style="display:grid;grid-template-columns:1fr 1fr;height:100%">${pr.map(p => `<div style="padding:6mm;border-right:.3mm dashed #bbb;display:flex;flex-direction:column;gap:3mm"><div style="position:relative;height:110mm;border-radius:4mm;overflow:hidden"><img src="${A(p.img)}" style="width:100%;height:100%;object-fit:cover">${ov(p.img, p.who) ? `<img src="${A(who(p.who).img)}" style="position:absolute;right:2mm;bottom:0;height:80%">` : ''}</div><div class="en" style="font-size:16pt;font-weight:800">${esc(p.en)}</div><div class="zh" style="font-size:16pt;font-weight:700">${esc(p.zh)}</div><div class="py" style="font-size:10pt">${esc(p.py)}</div></div>`).join('')}</div>`, true)); }
  if (kind === 'record') { const kids = Roster.get(); pg(`<div class="ph">Phiếu ghi giấy · buổi ${s.n} · gạch một vạch mỗi lượt · 4H chấm 0–2 · nhập lại vào web sau buổi</div><table class="t" style="font-size:10pt"><tr><th style="width:40mm">Bé</th>${['Có mặt', 'Giơ tay', 'Nói EN', 'Nói ZH', 'Thẻ đúng', 'Bảng con', 'Thái độ', 'Cảm xúc', 'Tương tác', 'Ghi chú'].map(c => `<th>${c}</th>`).join('')}</tr>${(kids.length ? kids : Array(12).fill({ name: '' })).map(k => `<tr style="height:13mm"><td>${esc(k.name)}</td>${'<td></td>'.repeat(10)}</tr>`).join('')}</table>`, true); }
  if (kind === 'sheet') { const ex = s.slides.filter(x => x.ty === 'exam'); pg(`<div class="ph">Phiếu trả lời · buổi ${s.n}</div><h2>Name · 名字: ______________________</h2>${ex.map(x => `<div style="font-size:22pt;margin:5mm 0">${x.n}. ${['A', 'B', 'C'].map(c => `<span style="display:inline-block;width:16mm;height:16mm;border:.6mm solid #333;border-radius:50%;text-align:center;line-height:16mm;margin-left:6mm">${c}</span>`).join('')}</div>`).join('')}`); }
  if (kind.startsWith('craft-')) { const u = kind.slice(6), c = D.crafts[u]; const us = D.units[u].days; const cw = Object.values(D.sess).filter(x => (x.units || []).includes(u)).flatMap(x => x.words).filter((w, i, a) => w.img && a.findIndex(y => y.en === w.en) === i);
    pg(`<div class="ph">${esc(c.name)} · ${esc(c.mat)}</div><h2>${esc(c.name)}</h2><ol>${c.steps.map(x => `<li style="font-size:13pt">${esc(x)}</li>`).join('')}</ol><div style="border:.5mm solid #ccc;border-radius:4mm;padding:4mm 6mm"><div class="en" style="font-size:18pt;font-weight:800">${esc(c.say[0])}</div><div class="zh" style="font-size:18pt;font-weight:700">${esc(c.say[1])}</div></div>
      <div class="ph" style="margin-top:6mm">Tranh để cắt dán</div><div class="cutg" style="grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(3,44mm)">${cw.slice(0, 12).map(w => cell(`<img src="${A(w.img)}"><div class="en" style="font-size:9pt;font-weight:700">${esc(w.en)}</div>`)).join('')}</div>`); }
  app.innerHTML = `<style>@page{size:A4;margin:0}@page land{size:A4 landscape;margin:0}.land{page:land}@media print{.pw{padding:0!important}.pg{margin:0!important}}</style>
    <div class="top noprint"><a href="#/b/${n}/tai-ve">◀ Buổi ${n}</a><span class="sp"></span><button class="btn" onclick="window.print()">🖨 In / Lưu PDF</button></div>
    <div class="pw" style="padding:12px 0">${pages.join('') || '<div class="wrap">Buổi này chưa có nội dung cho bản in này.</div>'}</div>`;
}

route();
})();
