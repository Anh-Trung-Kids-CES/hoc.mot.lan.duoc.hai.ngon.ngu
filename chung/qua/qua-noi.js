/* =====================================================================
   PHÒNG ĐỔI QUÀ · LỚP NỐI cho web lớp offline 48 buổi (Little Seed, Seedling) – 26/11/2026
   Nạp TRƯỚC qua.js và qua-choi.js (chép từ kho cuộc thi). Đặt các tên mà game cần, trỏ sang hàm sẵn có của web:
   - lsGet/lsSet → sget/sset; myPoints → sao học + sao cô thưởng; doneCount → số ngày web đã học xong
   - hubTile → tile; updateStars → updStars; voicePlay → playFile
   - KID, GROUPS, TEACHER (?gv=1 hoặc chế độ giáo viên của web), DEMO, STARTED, SCORE_API (không dùng)
   - "Chặng" của game = Unit của web: CHANG là Unit đang có Rồng trùm chờ con (Unit học xong, chưa hạ rồng),
     không có thì là Unit con đang học. CHANG_SO = số Unit.
   Không sửa lõi game ở đây; phần thay hàm của game nằm ở qua-sau.js (nạp sau cùng).
   ===================================================================== */
function lsGet(k, d) { return sget(k, d); }
function lsSet(k, v) { sset(k, v); }
var SCORE_API = '';   // web lớp offline không có ?action=zoomsao; đơn quà đi qua lệnh redeem của máy chủ lớp (qua-sau.js)
var ZALO_LINK = '';
var DEMO = false;
var GROUPS = { ls: 'Little Seed', sd: 'Seedling' };
Object.defineProperty(window, 'STARTED', { configurable: true, get: () => true });
Object.defineProperty(window, 'TEACHER', { configurable: true,
  get: () => /[?&]gv=1/.test(location.search) || (typeof GV !== 'undefined' && !!GV) });
Object.defineProperty(window, 'KID', { configurable: true,
  get: () => ({ id: (typeof P === 'object' && P && P.kidId) || '', group: LOP, temp: false, name: (typeof P === 'object' && P && P.name) || '' }) });

function myPoints() { return (P.stars || 0) + coSum(); }
function doneCount() { return daysDone(); }
function hubTile(o) { return tile(o); }
function updateStars() { updStars(); }
function voicePlay(src, o) {
  o = o || {};
  if (!src) { if (o.onerr) o.onerr(); return; }
  playFile(src).then(v => { const f = v === false ? (o.onerr || o.onend) : o.onend; if (f) f(); });
}
function askProfile() {}
function demoGate() {}
function changMoLuc() { return 0; }

/* ---------- mỗi Unit là một chặng của Rồng trùm ---------- */
function qcChangList() { return UNITS.map((u, i) => i + 1); }
function qcChangTen(n) { const U = UNITS[n - 1]; return U ? 'Unit ' + U.u : 'Unit'; }
function qcChangNhan(n) { const U = UNITS[n - 1]; return U ? 'U' + U.u : '?'; }
function qcChangNow() {
  const b = (shop().boss) || {};
  for (let i = 0; i < UNITS.length; i++) if (!b[i + 1] && (TEACHER || unitDone(UNITS[i]))) return i + 1;
  const i = UNITS.findIndex(u => !unitDone(u)); return i < 0 ? UNITS.length : i + 1;
}
Object.defineProperty(window, 'CHANG_SO', { configurable: true, get: () => UNITS.length });
Object.defineProperty(window, 'CHANG', { configurable: true, get: () => window.__qcChangGiu || qcChangNow() });   // trong trận Rồng trùm: giữ đúng Unit đang đánh (qua-sau.js)
Object.defineProperty(window, 'CHANG_A', { configurable: true, get: () => { const U = UNITS[qcChangNow() - 1]; return U ? Math.min.apply(null, U.days) - 1 : 0; } });
Object.defineProperty(window, 'CHANG_B', { configurable: true, get: () => { const U = UNITS[qcChangNow() - 1]; return U ? Math.max.apply(null, U.days) : 99; } });
