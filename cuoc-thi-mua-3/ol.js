/* =====================================================================
   CUỘC THI MÙA 3 · BÀI LỚP OFFLINE trong khung 21 ngày (chị chốt 20/11/2026)
   - Little Seed: 18 ngày đầu của web Little Seed lớp offline (bai-ls/, chép từ ../little-seed/).
   - Canopy: 18 ngày đầu của web Seedling 48 buổi (bai-sd/, chép từ ../seedling/).
   - Ngày 7, 14, 21 vẫn là buổi Zoom. Buổi tự học k (1–18) = ngày web lớp offline k.
   - Bài chạy trong khung (iframe); bài báo về từng bước xong (sao) và cả ngày xong qua postMessage (nhung.js trong bai-ls/, bai-sd/).
     Web mùa 3 ghi s.ol = {bước: sao}, cộng sao, mở màn chúc mừng, nhiệm vụ clip, Góc khám phá như mùa 2.
   Dữ liệu tên bài, các bước: bai-offline.js (sinh bằng cong-cu/dung_bai_offline.py).
   ===================================================================== */
const OL_PTS = 4;                                   // sao mỗi bước xong (như mùa 2)
const OL_SRC = { seed: 'ls', canopy: 'sd' };
const OL_STAGE = {
  seed: [
    { topic: 'Chào hỏi', desc: 'Con chào buổi sáng, chào cô, chào bạn, tạm biệt và hẹn gặp ngày mai bằng tiếng Anh và tiếng Trung.' },
    { topic: 'Chào hỏi · Sinh nhật', desc: 'Con ôn lời chào, làm phiên dịch nhí, đếm nến và chúc mừng sinh nhật.' },
    { topic: 'Tên, tuổi · Gia đình', desc: 'Con nói tên, hỏi tuổi bạn, kể lại truyện sinh nhật của Bông và hỏi "Đây là ai?" trong ảnh gia đình.' }],
  canopy: [
    { topic: 'Chào hỏi · Cơ thể', desc: 'Con chào cô, chào cả lớp, xin lỗi bạn, rồi nói về cơ thể qua buổi biểu diễn ở công viên.' },
    { topic: 'Cơ thể · Làm quen', desc: 'Con ôn truyện cơ thể, làm quen bạn mới và hỏi tuổi nhau ở tiệc sinh nhật của Vũ.' },
    { topic: 'Tuổi · Gia đình', desc: 'Con đoán tuổi, đếm đến mười, rồi xem ảnh gia đình của Bông.' }]
};
const OL_ZOOM = {
  seed: [
    { t: 'Lớp học trực tuyến: Chào hỏi', about: 'Buổi học trực tuyến cùng cô giáo: con chào buổi sáng, chào cô, chào bạn, tạm biệt và hẹn gặp ngày mai bằng tiếng Anh và tiếng Trung, rồi cùng cô kể lại truyện “Bông\'s Day”.' },
    { t: 'Lớp học trực tuyến: Chào hỏi và sinh nhật', about: 'Buổi học trực tuyến cùng cô giáo: con ôn câu chào và tạm biệt, làm phiên dịch nhí, rồi cùng cô đếm nến và chúc mừng sinh nhật bằng tiếng Anh và tiếng Trung.' },
    { t: 'Lớp học trực tuyến: Tên, tuổi và gia đình', about: 'Buổi học trực tuyến cùng cô giáo: con nói tên, hỏi tuổi bạn, kể lại truyện “Bông\'s Birthday” và giới thiệu người trong ảnh gia đình.' }],
  canopy: [
    { t: 'Lớp học trực tuyến: Chào hỏi và cơ thể', about: 'Buổi học trực tuyến cùng cô giáo: con chào cô và các bạn, xin lỗi, hẹn gặp ngày mai, rồi chỉ và gọi tên các bộ phận cơ thể bằng tiếng Anh và tiếng Trung.' },
    { t: 'Lớp học trực tuyến: Cơ thể và làm quen', about: 'Buổi học trực tuyến cùng cô giáo: con ôn truyện buổi biểu diễn ở công viên, làm quen bạn mới và hỏi tuổi nhau như ở tiệc sinh nhật của Vũ.' },
    { t: 'Lớp học trực tuyến: Tuổi, số đếm và gia đình', about: 'Buổi học trực tuyến cùng cô giáo: con đoán tuổi, đếm đến mười, rồi giới thiệu ảnh gia đình mình bằng hai thứ tiếng.' }]
};
/* Tên dạng bài (theo web lớp offline) cho dòng nhỏ dưới tiêu đề */
const OL_STEP = { nen: 'Thẻ nền', the: 'Thẻ từ', truyen: 'Nghe truyện', bb: 'Big book', vek: 'Vè', ve: 'Vè', noi: 'Nói theo', cham: 'Chạm đúng tranh',
  chon: 'Chọn tranh', goi: 'Gọi lại', pdn: 'Phiên dịch nhí', hoi: 'Trả lời câu hỏi', loi: 'Lời lớp học', meo: 'Mẹo âm', de: 'Dạng đề', game: 'Vận động' };

function olDays(g) {
  const src = OL_SRC[g], L = (window.M3_OL || {})[src] || [], Z = OL_ZOOM[g], out = [];
  let k = 0;
  for (let i = 0; i < 21; i++) {
    if (i % 7 === 6) {
      const r = (i - 6) / 7, ds = L.slice(r * 6, r * 6 + 6);
      out.push({ zoom: true, t: Z[r].t, about: Z[r].about,
        prep: ['Các bài con đã học trong chặng này:'].concat(ds.filter(d => / – /.test(d.t)).map(d => d.t)) });
      continue;
    }
    const D = L[k++]; if (!D) continue;
    out.push({ t: D.t, ol: Object.assign({ src }, D), r: Math.floor(i / 7) + 1 });
  }
  return out;
}
function olState(g, i) { const s = st(g, i); s.ol = s.ol || {}; return s; }
function olDayPoints(s, d) { if (!s) return 0; return Object.keys(s.ol || {}).length * OL_PTS + (s.done ? PTS.done : 0); }   // mỗi bước xong 4 sao + 10 sao xong buổi

/* Góc khám phá: Canopy mùa 3 học cùng chủ đề với Little Seed (chào hỏi · tên tuổi · gia đình) nên dùng chung kho của Little Seed,
   đổi "mở từ ngày" (ngày chung 1–20) sang ngày trong chặng. */
(function () {
  const X = window.XEM_THEM; if (!X || !X.seed) return;
  X.canopy = X.seed.map((R, r) => { const o = {};
    Object.keys(R).forEach(k => { o[k] = Array.isArray(R[k]) ? R[k].map(it => { if (!Array.isArray(it)) return it; const a = it.slice(); a[2] = Math.max(1, (+a[2] || 1) - r * 7); return a; }) : R[k]; });
    return o; });
})();

/* Nhiệm vụ quay clip: lời thoại mẫu của mùa 2 thuộc bài cũ nên bỏ; câu cho ba mẹ quay lấy từ tên bài song ngữ "Anh – Trung" */
window.CLIP_GUIDE = { seed: [], canopy: [] };
function olSay(g, i) {
  const d = GROUPS[g] && GROUPS[g].days[i]; if (!d || !d.ol) return null;
  const m = /^(.+?)\s+–\s+(.*[\u3400-\u9fff].*)$/.exec(d.t || ''); return m ? [m[1].trim(), m[2].trim()] : null;
}

/* ---------- MÀN HỌC MỘT BUỔI ---------- */
let OLCUR = null;
function olSrc(g, i) {
  const D = GROUPS[g].days[i].ol, k = (KID && (KID.id || KID.name)) || 'may';
  const kk = String(k).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w-]/g, '').slice(0, 40) || 'may';
  return `bai-${D.src}/index.html?n=${D.n}&k=${encodeURIComponent((TEACHER ? 'gv-' : DEMO ? 'thu-' : '') + kk)}&ten=${encodeURIComponent((KID && !TEACHER && KID.name) || '')}`;
}
function viewOlDay(g, i) {
  const G = GROUPS[g], day = G.days[i], s = olState(g, i);
  document.body.classList.remove('hub'); document.body.classList.add('in-step');
  OLCUR = { g, i };
  app.innerHTML = `<div class="ol-wrap">
    <div class="ol-bar"><a class="btn y ol-back" href="#/g/${g}">← Bản đồ</a>
      <div class="ol-tt"><small>${G.icon} ${esc(G.name)} · Chặng ${stageNo(i)} · Buổi ${lessonNo(i)}/6</small><b>${titleHTML(day.t)}</b></div>
      <span class="ol-pts" id="olPts">⭐ ${dayPoints(g, i)}</span>
      <button class="btn ol-x" id="olX" type="button" ${s.done ? '' : 'hidden'}>🎯 Nhiệm vụ</button></div>
    <iframe class="ol-frame" id="olFrame" src="${esc(olSrc(g, i))}" allow="autoplay; microphone; camera; fullscreen" title="Bài học ${esc(day.t)}"></iframe></div>`;
  document.getElementById('olX').onclick = () => { sfx.pop(); extrasPanel(g, i); };
  window.scrollTo({ top: 0 });
}
function olUpd(g, i) {
  const el = document.getElementById('olPts'); if (el) el.textContent = '⭐ ' + dayPoints(g, i);
  const x = document.getElementById('olX'); if (x) x.hidden = !st(g, i).done;
}
window.addEventListener('message', e => {
  const m = e.data; if (!m || !m.m3 || e.origin !== location.origin || !OLCUR) return;
  const { g, i } = OLCUR, day = GROUPS[g] && GROUPS[g].days[i];
  if (!day || !day.ol || +m.n !== day.ol.n || !/^#\/g\//.test(location.hash)) return;
  if (m.t === 'ra') {
    const mm = /^#\/ngay\/(\d+)/.exec(m.to || ''), j = mm ? GROUPS[g].days.findIndex(d => d.ol && d.ol.n === +mm[1]) : -1;
    location.hash = j >= 0 && j !== i && isUnlocked(g, j) ? `#/g/${g}/${j + 1}` : `#/g/${g}`;
    return;
  }
  if (!['buoc', 'xong', 'san-sang'].includes(m.t)) return;
  const s = olState(g, i), before = dayPoints(g, i), tong = +m.tong || 0; let ch = false;
  if (tong && s.olN !== tong) { s.olN = tong; ch = true; }   // số bước thật của buổi (web lớp có thể thêm bước khi chạy)
  Object.keys(m.steps || {}).forEach(k => { if (!/^\d+$/.test(k) || +k >= (tong || 20)) return;
    const v = Math.max(+s.ol[k] || 0, +m.steps[k] || 1); if (v !== s.ol[k]) { s.ol[k] = v; ch = true; } });
  if (ch) addPoints(g, i, before, document.getElementById('olPts'));
  const all = !!s.olN && Object.keys(s.ol).length >= s.olN;
  if (m.t === 'xong' || (all && !s.done)) olCompleteDay(g, i);
  olUpd(g, i);
});
/* Xong buổi: cộng sao ngày, màn chúc mừng như mùa 2 (nhiệm vụ clip, Góc khám phá) */
function olCompleteDay(g, i) {
  const s = olState(g, i);
  let fresh = false; if (!s.done) { const before = dayPoints(g, i); s.done = true; fresh = true; addPoints(g, i, before, null); }
  const RW = fresh ? rewardExtras(g, i) : { html: '', lines: [] };
  lsStop();
  document.querySelectorAll('.ls-cele').forEach(e => e.remove());
  const ov = document.createElement('div'); ov.className = 'ls-cele';
  ov.innerHTML = `<div class="ls-cele-box" role="dialog" aria-label="Hoàn thành buổi ${lessonNo(i)}">
    <img class="ls-cele-img" src="../xem-truoc/tai-nguyen/trang/ls_man_khen.webp" alt="">
    <div class="ls-cele-stars">${LS_SVG.star}${LS_SVG.star}${LS_SVG.star}</div>
    <h3>Con học xong buổi ${lessonNo(i)} rồi!</h3>
    <p>Con được <b>${dayPoints(g, i)} sao</b>.</p>${RW.html}${khenParent(g, i)}
    <a class="ls-cele-go" href="#/g/${g}"><span aria-hidden="true">🗺️</span><b>Về bản đồ</b></a>
    <div class="ls-cele-more">${missionHTML(g, i)}${xtTeaser(g, Math.floor(i / PER), '🧭 Con muốn xem thêm? Góc khám phá')}</div></div>`;
  document.body.appendChild(ov); missionWire(ov, g, i);
  ov.querySelectorAll('.xt-tc, .xt-th a, .ls-cele-go').forEach(a => a.addEventListener('click', () => ov.remove()));
  confetti(44); sfx.win(); olUpd(g, i);
  (async () => { await lsHD('Tuyệt vời! Con đã học xong hôm nay rồi!'); if (!document.body.contains(ov)) return;
    for (const t of RW.lines) { await lsWait(250); if (!document.body.contains(ov)) return; await khenLS(t); }
    await lsWait(300); if (document.body.contains(ov)) lsHD('Hẹn gặp con ngày mai nhé!'); })();
}
