/* Chung kết Rung chuông vàng – phần dùng chung cho màn bé, màn chiếu, bảng xếp hạng (index.html) và màn cô (co.html).
   Dùng lại của Lớp Zoom (lop-zoom/lz-core.js): kết nối Firebase (DB), âm thanh (SND), avatar, chỗ ngồi (buildSeats, answerOf),
   trận Rồng Lửa (bossInfo, lz-boss.js). Luật bảo mật Firebase bản 1 giữ nguyên: dữ liệu nằm trong rooms/<mã>/.
   Phòng chung kết ghi state.lop = 'chung-ket'.

   Luật chấm (doc "Chung kết Rung chuông vàng – Khung nội dung câu hỏi", 10/11/2026):
   - Thi chung Little Seed và Canopy; xếp hạng RIÊNG theo level đăng ký, không xếp lẫn.
   - Bé làm đề theo level của mình (Phần 2–4: đề Little Seed hoặc đề Canopy, từ nội dung 3 vòng của level đó); mỗi câu có 3 bậc A/B/C, web tự đưa bậc vừa sức: đúng 2 câu liên tiếp lên một bậc, sai 2 câu liên tiếp xuống một bậc.
     Little Seed bắt đầu bậc A, Canopy bắt đầu bậc B. Bậc chỉ để câu hỏi vừa sức, KHÔNG cộng hay trừ điểm.
   - Mỗi câu đúng = 1 điểm. Phần 1 không tính xếp hạng (chỉ tích sao). Phần 2: 30%, Phần 3: 30%, Phần 4: 40%.
   - Phần 2 chia cho 15 câu, Phần 3 (theo giờ) chia cho số câu đúng cao nhất của buổi thi, Phần 4 chia cho 7 điểm.
   - Bằng điểm: xét điểm Phần 4, rồi thời gian nộp Phần 4. */

const CK_LOP = 'chung-ket';
const CK_LV = { seed: 'Little Seed', canopy: 'Canopy' };
const CK_BANDS = ['A', 'B', 'C'];
const CK_BOSS_DUR = 180000;   // Rồng Lửa: 3 phút, không giới hạn số câu
const CK_PH = [
  { id: 'cho', n: 'Chờ vào phòng thi', ic: '🚪', m: '' },
  { id: 'p1', n: 'Phần 1 · Ôn tập', ic: '🌱', m: '10 phút' },
  { id: 'p2', n: 'Phần 2 · Rung chuông vàng', ic: '🔔', m: '15 phút' },
  { id: 'p3', n: 'Phần 3 · Rồng Lửa', ic: '🐉', m: '5 phút' },
  { id: 'p4', n: 'Phần 4 · Ghép tranh chuyển ngữ', ic: '🧩', m: '10 phút' },
  { id: 'trao', n: 'Trao giải', ic: '🏆', m: '6 phút' }
];
const CK_P2_SEC = 10;   // thời gian suy nghĩ mỗi câu Rung chuông vàng
const CK_P2N = 15;      // Phần 2: 15 câu cho mỗi level (đề Little Seed và đề Canopy chạy song song, cùng số câu)
const CK_T = { tu: 'Từ', cum: 'Cụm từ', cau: 'Câu' };

/* lời cô Hươu: câu có file giọng thì phát file, câu mới tạm đọc bằng giọng máy để duyệt nội dung (ttsTam),
   duyệt xong sẽ thu bằng Gemini (danh sách trong chung-ket/README.md). */
const CK_LOI = {
  chao: 'Chào mừng các con đến với Chung kết Rung chuông vàng!',
  p1: 'Phần một: cả lớp cùng khởi động nhé!',
  p2: 'Phần hai: Rung chuông vàng! Con nghe và chọn thật kỹ nhé!',
  chuong: 'Câu cuối cùng: câu chuông vàng!',
  p3: 'Cả lớp cùng tiếp sức cho anh hùng Bông nhé!',
  p4: 'Phần bốn: nghe truyện, xếp tranh! Con nghe thật kỹ nhé!',
  xep: 'Con chạm lần lượt các tranh theo thứ tự truyện nhé!',
  trao: 'Chúc mừng tất cả các nhà thám hiểm ngôn ngữ!'
};
function ckLoi(k) { return ttsTam(CK_LOI[k]); }

/* ---------- ngân hàng ---------- */
const ckB = k => CK_BANK[k] || {};
function ckAud(k, l) { const b = ckB(k); return l === 'zh' ? b.za : b.ea; }
function ckTxt(k, l) { const b = ckB(k); return l === 'zh' ? b.zh : b.en; }
function ckImg(k) { return ckB(k).img || ''; }

/* ---------- level, bậc ---------- */
function seatLv(room, seat) {
  const m = ((room.marks || {})[seat.id] || {}).lv;
  if (m) return m;
  const P = room.players || {};
  for (const id of seat.ids) if (P[id] && P[id].lv) return P[id].lv;
  return 'seed';
}
function bandStart(lv) { return lv === 'canopy' ? 1 : 0; }
/* chuỗi đúng/sai → bậc kế tiếp (đúng 2 liên tiếp lên, sai 2 liên tiếp xuống; câu bỏ trống không tính) */
function bandWalk(start, oks) {
  let b = start, up = 0, dn = 0;
  oks.forEach(ok => {
    if (ok) { up++; dn = 0; if (up >= 2) { b = Math.min(2, b + 1); up = 0; } }
    else { dn++; up = 0; if (dn >= 2) { b = Math.max(0, b - 1); dn = 0; } }
  });
  return b;
}
function p2Oks(room, seat, upto) {
  const out = [];
  for (let j = 0; j < Math.min(upto, CK_P2N); j++) { const a = answerOf(room, seat, 'p2_' + j); if (a) out.push(!!a.ok); }
  return out;
}
/* bậc của câu i Phần 2 cho một bé */
function p2Band(room, seat, i) { return bandWalk(bandStart(seatLv(room, seat)), p2Oks(room, seat, i)); }
/* bậc khi hết Phần 2: là bậc khởi đầu của Rồng Lửa và chọn bản Phần 4 */
function p2Final(room, seat) { return p2Band(room, seat, CK_P2N); }

/* xáo lựa chọn cố định theo câu và máy (đáp án là lựa chọn số 0 trong dữ liệu) */
function ckOrder(n, key) {
  let s = 7; String(key).split('').forEach(ch => s = (s * 31 + ch.charCodeAt(0)) % 99991);
  let o = shuffleSeeded([...Array(n).keys()], s || 1);
  return o;
}

/* ---------- Phần 2: đề rút theo 18 ngày học ----------
   14 câu đầu chia đều 18 ngày của level: mỗi vòng [ngày 1] [2] [3] [4] [5–6]; câu 15 là câu chuông vàng soạn tay.
   Mỗi bé nhận một mục ngẫu nhiên (cố định theo chỗ ngồi) trong ngày đó, không lặp mục, nên cả lớp phủ hết từ, cụm từ, câu của 18 ngày.
   Bậc A: nghe – chạm tranh; B: nghe một tiếng – chọn lời cùng nghĩa ở tiếng kia; C: nhìn tranh – chọn chữ tiếng Anh. */
const CK_SLOTS = [[1], [2], [3], [4], [5, 6], [7], [8], [9], [10], [11, 12], [13], [14], [15], [16, 17, 18]];
function ckRnd(seed) { let x = 0; String(seed).split('').forEach(c => x = (x * 31 + c.charCodeAt(0)) >>> 0); return () => { x = (x * 1103515245 + 12345) >>> 0; return x / 4294967296; }; }
const ckDayCache = {};
function ckLvKeys(lv) { return ckDayCache[lv] || (ckDayCache[lv] = CK_DAYS[lv].flat().map(x => x[0]).filter((x, i, A) => A.indexOf(x) === i)); }
/* 2 lựa chọn sai: ưu tiên cùng vòng, cùng loại (từ / cụm từ / câu), tranh và chữ khác đáp án */
function ckDistract(lv, k, n, R) {
  const a = ckB(k), all = ckLvKeys(lv).filter(x => x !== k && ckB(x).img && ckB(x).img !== a.img && ckB(x).en !== a.en);
  const tiers = [all.filter(x => ckB(x).r === a.r && ckB(x).t === a.t), all.filter(x => ckB(x).r === a.r), all];
  const out = [];
  tiers.forEach(T => T.slice().sort(() => R() - .5).forEach(x => { if (out.length < n && out.indexOf(x) < 0 && !out.some(y => ckB(y).img === ckB(x).img)) out.push(x); }));
  return out;
}
const ckItemCache = {};
function p2Items(lv, seatId) {
  const key = lv + '|' + seatId; if (ckItemCache[key]) return ckItemCache[key];
  const R = ckRnd('p2' + key), used = [];
  CK_SLOTS.forEach(days => {
    const pool = days.map(d => CK_DAYS[lv][d - 1]).flat().map(x => x[0]).filter(k => used.indexOf(k) < 0);
    const all = pool.length ? pool : days.map(d => CK_DAYS[lv][d - 1]).flat().map(x => x[0]);
    used.push(all[Math.floor(R() * all.length)]);
  });
  return (ckItemCache[key] = used);
}
/* đề câu i (0–14) ở bậc b (0–2) cho một bé: { img, ans, p, o } – đáp án luôn là lựa chọn số 0 */
function p2Q(lv, seatId, i, b) {
  if (i >= CK_P2N - 1) { const Q = CK_CHUONG[lv]; return Object.assign({ img: Q.img, ans: Q.ans, chuong: true }, Q[CK_BANDS[b]]); }
  const k = p2Items(lv, seatId)[i], R = ckRnd('p2q' + lv + seatId + i), L = i % 2 ? 'zh' : 'en', L2 = L === 'en' ? 'zh' : 'en';
  const keys = [k].concat(ckDistract(lv, k, 2, R));
  if (b === 0) return { img: k, ans: k, p: { a: [k, L] }, o: keys.map(x => ({ t: 'img', k: x })) };
  if (b === 1) return { img: k, ans: k, p: { a: [k, L] }, o: keys.map(x => ({ t: 'say', k: x, l: L2 })) };
  return { img: k, ans: k, p: { img: k }, o: keys.map(x => ({ t: 'txt', k: x })) };
}
/* số ngày như trên web học 21 ngày (ngày 7, 14, 21 là buổi Zoom): ngày học thứ 1–6 → ngày 1–6, 7–12 → 8–13, 13–18 → 15–20 */
function ckWebDay(d) { return d + Math.floor((d - 1) / 6); }
function p2Days(i) { return i >= CK_P2N - 1 ? 'Câu chuông vàng' : 'Ngày ' + CK_SLOTS[i].map(ckWebDay).join(', '); }

/* ---------- câu Rồng Lửa theo bậc (máy bé tự sinh), rút từ toàn bộ 18 ngày của level ---------- */
function ckCatKeys(cat) {
  if (CK_CAT_EXTRA[cat]) return CK_CAT_EXTRA[cat];
  return Object.keys(CK_BANK).filter(k => CK_BANK[k].cat === cat && CK_BOSS_SKIP.indexOf(k) < 0);
}
function ckRand(a) { return a[Math.floor(Math.random() * a.length)]; }
function ckOthers(cat, k, n) { return ckCatKeys(cat).filter(x => x !== k).sort(() => Math.random() - .5).slice(0, n); }
function bossQ(band, last, lv) {
  const BS = CK_BOSS[lv] || CK_BOSS.seed, keys = ckLvKeys(lv).filter(k => ckB(k).img), R = Math.random;
  for (let guard = 0; guard < 20; guard++) {
    let q;
    if (band === 2 && BS.C.chu.length && Math.random() < .3) {   // Little Seed: nhìn chữ đã làm quen (一 二 三 大 他 她) → chạm tranh
      const [chu, k, cat] = ckRand(BS.C.chu);
      q = { b: 2, k, l: 'doc', p: { chu }, o: [k].concat(ckOthers(cat, k, 2)).map(x => ({ t: 'img', k: x })) };
    } else {
      const pool = band === 1 ? keys.filter(k => ckB(k).t !== 's') : keys;   // bậc B nghe 4 lời liên tiếp: dùng từ và cụm từ cho gọn
      const k = ckRand(pool), l = Math.random() < .5 ? 'en' : 'zh', to = l === 'en' ? 'zh' : 'en', ks = [k].concat(ckDistract(lv, k, 2, R));
      if (band === 0) q = { b: 0, k, l, p: { a: [k, l] }, o: ks.map(x => ({ t: 'img', k: x })) };
      else if (band === 1) q = { b: 1, k, l, p: { a: [k, l] }, o: ks.map(x => ({ t: 'say', k: x, l: to })) };
      else q = { b: 2, k, l: 'doc', p: { txt: k }, o: ks.map(x => ({ t: 'img', k: x })) };
    }
    if (q.o.length === 3 && (!last || last.k !== q.k)) return q;
  }
  return null;
}

/* ---------- điểm ---------- */
function ckStars(room, seat) { let n = 0; CK_P1.forEach((q, i) => { const a = answerOf(room, seat, 'p1_' + i); if (a && a.ok) n++; }); return n; }
function ckP2(room, seat) { let n = 0, done = 0; for (let i = 0; i < CK_P2N; i++) { const a = answerOf(room, seat, 'p2_' + i); if (a) { done++; if (a.ok) n++; } } return { n, done }; }
function ckP3(room, seat) {
  let n = 0, all = 0;
  Object.entries(room.answers || {}).forEach(([q, o]) => { if (q.indexOf('boss_') !== 0) return; seat.ids.forEach(id => { const a = (o || {})[id]; if (a) { all++; if (a.ok) n++; } }); });
  Object.keys((((room.marks || {})[seat.id] || {}).bx) || {}).forEach(() => { n++; all++; });
  return { n, all };
}
function ckP4(room, seat) {
  const run = ((room.state || {}).p4 || {}).run || 0;
  const mk = ((room.marks || {})[seat.id] || {}).p4;
  const a = answerOf(room, seat, 'p4_' + run);
  if (a && a.pts != null) return { pts: a.pts, at: a.at || 0, ho: false };
  if (mk != null && mk !== '') return { pts: +mk, at: Infinity, ho: true };
  return { pts: null, at: Infinity };
}
/* bảng kết quả: mỗi bé một dòng, hạng tính riêng theo level */
function ckResults(room) {
  const seats = buildSeats(room.players).filter(s => s.ok);
  const rows = seats.map(s => {
    const p2 = ckP2(room, s), p3 = ckP3(room, s), p4 = ckP4(room, s);
    return { seat: s, lv: seatLv(room, s), sao: ckStars(room, s), p2: p2.n, p2done: p2.done, p3: p3.n, p3all: p3.all, p4: p4.pts, p4at: p4.at, band: CK_BANDS[p2Final(room, s)] };
  });
  const p3max = Math.max(1, ...rows.map(r => r.p3));
  rows.forEach(r => {
    r.tong = Math.round((30 * r.p2 / CK_P2N + 30 * r.p3 / p3max + 40 * (r.p4 || 0) / 7) * 10) / 10;
  });
  const out = {};
  Object.keys(CK_LV).forEach(lv => {
    const L = rows.filter(r => r.lv === lv).sort((a, b) => (b.tong - a.tong) || ((b.p4 || 0) - (a.p4 || 0)) || (a.p4at - b.p4at) || a.seat.kid.localeCompare(b.seat.kid));
    L.forEach((r, i) => { r.hang = i + 1; });
    /* giải: 3 cúp theo hạng; "Phiên dịch nhí" cho bạn có điểm Phần 4 cao nhất ngoài top 3; còn lại là Nhà thám hiểm ngôn ngữ */
    L.forEach(r => { r.giai = r.hang === 1 ? 'Quán quân' : r.hang === 2 ? 'Á quân' : r.hang === 3 ? 'Hạng 3' : ''; });
    const pd = L.filter(r => !r.giai && r.p4).sort((a, b) => (b.p4 - a.p4) || (a.p4at - b.p4at))[0];
    if (pd) pd.giai = 'Phiên dịch nhí';
    L.forEach(r => { if (!r.giai) r.giai = 'Nhà thám hiểm ngôn ngữ'; });
    out[lv] = L;
  });
  return { rows, by: out, p3max };
}
const CK_CUP = { 'Quán quân': '🏆', 'Á quân': '🥈', 'Hạng 3': '🥉', 'Phiên dịch nhí': '🗣️', 'Nhà thám hiểm ngôn ngữ': '🧭' };

/* bảng top 5 của một level (màn chiếu, cửa sổ bảng xếp hạng cho livestream) */
function ckBoardHTML(res, lv, n) {
  const L = res.by[lv].slice(0, n || 5);
  return `<div class="bd-col"><h3>${CK_LV[lv]}</h3>${L.length ? L.map(r => `<div class="bd-row r${r.hang}"><b class="bd-n">${r.hang}</b><img src="${faceOf(r.seat)}" alt=""><span class="bd-nm">${esc(r.seat.kid)}</span><b class="bd-pt">${r.tong}</b></div>`).join('') : '<p class="small">Chưa có bạn nào.</p>'}</div>`;
}
