/* =====================================================================
   PHÒNG ĐỔI QUÀ · LỚP SAU cho web lớp offline 48 buổi (Little Seed, Seedling) – 26/11/2026
   Nạp SAU CÙNG (sau mọi tệp của web). Thay một số hàm của game cho hợp web lớp offline:
   - Sao: một khoá 99 ngày, không chia chặng, không có sao Zoom → Đã kiếm = sao học + sao cô thưởng ở lớp.
   - Số "buổi" của game = số ngày web con đã học xong.
   - Rồng trùm theo Unit: mở khi con học xong mọi ngày của Unit; câu đố lấy từ các ngày của Unit đó.
   - Đố từ, Luyện chiêu: từ của những ngày con đã học xong, ưu tiên 20 ngày gần nhất.
   - Quà thật (tối đa 2 món cả khoá, cần học xong 6 ngày) và học bổng gửi cô qua lệnh redeem của máy chủ lớp;
     trạng thái phiếu, sao cô thưởng lấy về bằng coSync (tệp *-thuong.js của web).
   - Quái vật của bản cũ (nở sau 1 ngày học) được giữ nguyên trạng thái, không quay về trứng.
   Giá sao giữ như web cuộc thi (chị Duyên chốt 26/11/2026).
   ===================================================================== */
window.qEarned = function () { return myPoints(); };
window.qLessons = function () { return daysDone(); };
window.qcMark = function () {};
window.qZoomSao = function () { return 0; };
window.qZoomPull = function () {};
window.qZooms = function () { return 0; };
window.qSyncOrders = function (force) { if (typeof coSync === 'function') coSync(force); };

/* ---------- từ cho trò đố ---------- */
function qcCardsDays(days) {
  const T = (window.M3_TU || {})[qGroup()] || {}, out = [], seen = {};
  days.forEach(d => (T[d] || []).forEach(c => { if (seen[c[0]]) return; seen[c[0]] = 1; out.push({ en: c[0], zh: c[1], py: c[2], img: c[3], ae: c[4], az: c[5] }); }));
  return out;
}
function qcDoneDays() { return Object.keys(P.days).map(Number).filter(n => P.days[n] && P.days[n].done).sort((a, b) => a - b); }
window.qcPool = function () {
  if (TEACHER) return qcCardsDays(UNITS.reduce((a, u) => a.concat(u.days), []));
  const D = qcDoneDays();
  let L = qcCardsDays(D.slice(-20));
  if (L.length < 6) L = qcCardsDays(D);
  if (L.length < 6) L = qcCardsDays(D.concat(UNITS[0] ? UNITS[0].days : []));   // con mới học: thêm từ Unit 1 (Unit luôn mở)
  return L;
};
window.qcStagePool = function () {
  const U = UNITS[CHANG - 1]; const L = U ? qcCardsDays(U.days) : [];
  return L.length >= 6 ? L : qcCardsDays(UNITS.slice(0, CHANG).reduce((a, u) => a.concat(u.days), []));
};
window.qcBossOpen = function () { const U = UNITS[CHANG - 1]; return TEACHER || (!!U && unitDone(U)); };

/* ---------- quà thật, học bổng: gửi cô qua máy chủ lớp ---------- */
window.giftUsed = function () { return shop().orders.filter(o => (o.kind || 'gift') === 'gift' && o.st !== 'tu_choi').length; };   // phiếu bản cũ không có kind = quà
window.qCanReal = function () {
  if (TEACHER) { toast('Chế độ giáo viên chỉ xem thử, không đổi quà thật và học bổng.'); return false; }
  if (!kidId()) { toast('Ba mẹ đăng nhập để nối web với lớp của con, rồi đổi quà nhé.'); return false; }
  return true;
};
window.qOrder = function (kind, item) {
  const s = shop(); if (!qSpend(item.p)) return;
  const o = { code: qCode(kind === 'hb' ? 'HB' : 'QUA'), kind, id: item.id, n: item.n, p: item.p, at: Date.now(), st: 'cho' };
  s.orders.unshift(o); qSave();
  api({ action: 'redeem', id: kidId(), code: o.code, qua: kind === 'hb' ? 'hocbong' : item.id, ten_qua: item.n + (item.vnd ? ' (' + item.vnd + ')' : ''), sao: item.p });
  route(); sfx.win(); confetti(24); hdSay('Cảm ơn ba mẹ. Cô đã nhận phiếu, cô sẽ kiểm tra rồi báo ba mẹ nhé.');
  const ov = document.createElement('div'); ov.className = 'overlay pp';
  ov.innerHTML = `<div class="modal pp-box q-done" role="dialog"><button class="pp-x" aria-label="Đóng">✕</button>
    <img src="${kind === 'hb' ? Q_IMG + 'hocbong.webp' : Q_IMG + 'gift_' + item.id + '.webp'}" alt="">
    <h3>Đã gửi cô · phiếu ${o.code}</h3><p><b>${esc(item.n)}</b> · ${item.p} ⭐</p>
    <p>${kind === 'hb' ? 'Cô kiểm tra tiến độ học của con rồi gửi giấy chứng nhận học bổng cho ba mẹ.' : 'Cô xem trên bảng của cô rồi trao quà cho con ở buổi học trên lớp.'} Nếu cô chưa duyệt, sao được hoàn đủ vào ví.</p>
    <div class="row"><a class="btn y" href="#/qua/phieu">🧾 Phiếu của con</a></div></div>`;
  document.body.appendChild(ov);
  const close = () => ov.remove(); ov.querySelector('.pp-x').onclick = close; ov.addEventListener('click', e => { if (e.target === ov || e.target.closest('a')) close(); });
};

/* ---------- phiếu, sao cô thưởng, cách kiếm sao ---------- */
window.viewOrders = function () {
  const s = shop(); coSync(true);
  const aw = coAwards().slice().sort((a, b) => b.at - a.at);
  const rows = s.orders.length ? s.orders.map(o => `<li class="q-ord st-${o.st}"><img src="${o.kind === 'hb' ? Q_IMG + 'hocbong.webp' : Q_IMG + 'gift_' + o.id + '.webp'}" alt="">
      <span><b>${esc(o.n)}</b><small>${o.code} · ${new Date(o.at).toLocaleDateString('vi-VN')} · ${o.p} ⭐</small>${o.note ? `<small>${esc(o.note)}</small>` : ''}</span>
      <em>${Q_ST[o.st] || o.st}</em></li>`).join('') : '<li class="q-ord none">Con chưa có phiếu nào. Quà thật và học bổng sẽ hiện ở đây.</li>';
  qFrame('🧾 Phiếu & cách kiếm sao', `<div class="q-ords"><h4>Sao cô thưởng ở lớp <small>⭐ ${coSum()}</small></h4><ul>${aw.length ? aw.map(a => `<li class="q-ord"><img src="../seedling/tai-nguyen/nhan-vat/huou_huou2_a.webp" alt=""><span><b>+${a.n} ⭐ · ${esc(a.why || 'Cô thưởng')}</b><small>${new Date(a.at).toLocaleDateString('vi-VN')}</small></span></li>`).join('') : '<li class="q-ord none">Sao cô thưởng trên lớp sẽ hiện ở đây.</li>'}</ul>
      <h4>Phiếu của con</h4><ul>${rows}</ul>${s.orders.length ? '<button class="btn y sm" id="qRefresh" type="button">🔄 Xem trạng thái mới</button>' : ''}</div>
    <div class="q-rules"><h4>Sao đến từ đâu?</h4><ol>
      <li><b>Mỗi bước học xong</b>: 1 sao cho mỗi thẻ, câu hỏi hay lượt nói con làm xong (đúng hay chưa đúng đều được).</li>
      <li><b>Học xong một ngày web</b>: +${PTS.dayDone} ⭐. <b>Ôn nhanh trong Hộp ôn</b>: +${PTS.review} ⭐ mỗi lượt, tối đa ${PTS.reviewMaxDay} lượt một ngày.</li>
      <li><b>Cô thưởng ở lớp</b>: cô thưởng trên bảng của cô, sao tự vào ví của con.</li>
      <li><b>Đổi quà không làm mất sao đã kiếm.</b> Chỉ sao trong ví bị trừ. Quà ảo (thú cưng, quái vật, vườn, avatar) đổi ngay, không hoàn lại. Thú cưng không bao giờ ốm hay mất.</li>
      <li><b>Quà thật</b> ${GIFTS[0].p}–${GIFTS[GIFTS.length - 1].p} ⭐: mở khi con học xong ${Q_RULE.giftMinLessons} ngày web, tối đa ${Q_RULE.giftMax} món cả khoá. Ba mẹ xác nhận, cô duyệt và trao ở lớp.</li>
      <li><b>Học bổng</b> ${HB[0].p}–${HB[HB.length - 1].p} ⭐: theo số ngày web đã học, tối đa 1 phiếu, trừ vào học phí khoá Anh – Trung đăng ký mới tại CES.</li>
      <li>Phiếu cô chưa duyệt được hoàn đủ sao vào ví.</li></ol></div>`, 'qord');
  const r = document.getElementById('qRefresh'); if (r) r.onclick = () => { sfx.pop(); toast('Đang xem trạng thái…'); coSync(true); setTimeout(() => { if (/^#\/qua\/phieu/.test(location.hash)) viewOrders(); }, 2500); };
};

/* ---------- giữ quái vật của bản cũ: bản cũ nở sau 1 ngày học, bản mới sau 3 ngày ---------- */
function qcGiuQuaiCu() {
  const s = shop(); if (s.mv) return;
  s.mons.forEach(m => { if (m.v) return; if (Math.max(0, daysDone() - (+m.base || 0)) >= 1) m.base = (+m.base || 0) - QC.hatch; m.v = 2; });
  s.mv = 1; qSave();
}

/* ---------- khung: sáng nút "Đổi quà" trên thanh điều hướng; đường dẫn cũ #/qua/qua-lop ---------- */
window.qFrame = (function (f) { return function () { if (typeof setActive === 'function') setActive('qua'); return f.apply(this, arguments); }; })(qFrame);
window.viewQua = (function (f) {
  return function (sub) {
    qcGiuQuaiCu(); if (typeof setActive === 'function') setActive('qua');
    if (sub === 'qua-lop') return viewGifts();
    return f.call(this, sub);
  };
})(viewQua);

/* ---------- trận Rồng trùm: giữ cố định Unit đang đánh (thắng xong, màn chúc mừng vẫn ghi đúng Unit vừa hạ) ---------- */
window.qcBoss = (function (f) { return function (m) { window.__qcChangGiu = qcChangNow(); return f.call(this, m); }; })(qcBoss);
window.viewMons = (function (f) { return function () { window.__qcChangGiu = 0; return f.apply(this, arguments); }; })(viewMons);
