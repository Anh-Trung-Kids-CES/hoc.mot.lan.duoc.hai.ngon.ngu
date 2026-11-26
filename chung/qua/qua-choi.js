/* =====================================================================
   PHÒNG ĐỔI QUÀ · CHƠI THẬT (chị chốt 25/11/2026, kịch bản "Phòng đổi quà mới – Cuộc thi mùa 3")
   Nạp SAU qua.js: các hàm cùng tên ở đây thay hàm cũ (viewPets, viewMons, qEarned, qLessons, monStage…).
   - Sao và số buổi CỘNG QUA MỌI CHẶNG: mỗi chặng ghi vào P._earn[chặng], P._les[chặng] (qcMark, gọi trong save()).
     Sang chặng mới, sao đã kiếm ở chặng trước vẫn trong ví; quái vật không quay về trứng.
   - Thú cưng: chạm đầu / bụng / vuốt; cho ăn kéo thả (mỗi ngày thèm 1 món); Chơi cùng = 1 trong 3 trò
     (Ném bóng · Trốn tìm · Đố từ); chơi xong có ảnh vào Album (tối đa 30 ảnh, tải về được).
   - Quái vật: trứng nứt dần (3 buổi học thì nở), cảnh nở + đặt tên; Luyện chiêu bằng giọng (1 lượt/ngày,
     chỉ đo độ to, KHÔNG ghi âm, không gửi tiếng đi đâu); Rồng trùm cuối chặng (mở từ ngày Tổng kết), 7 huy hiệu.
   - Từ vựng cho Đố từ, Luyện chiêu, Rồng trùm lấy từ bài con đã học (qua-tu.js, sinh bằng cong-cu/tao_tu_qua.js),
     không thêm chữ Trung mới.
   ---------------------------------------------------------------------
   BẢN CHO WEB LỚP OFFLINE 48 BUỔI – chép từ kho cuộc thi (cuoc-thi-mua-3/qua-choi.js, 26/11/2026).
   Chỗ đổi có ghi "LỚP OFFLINE": mỗi Unit là một "chặng" (12 Rồng trùm, 12 huy hiệu, nhãn U1…), đường dẫn
   tiếng thú cưng và kho từ, nút "Đi học" về bản đồ, chữ "ngày học" thay "buổi". Sao, số ngày học, kho từ của
   Rồng trùm theo Unit: qua-sau.js thay các hàm qEarned, qLessons, qcMark, qcPool, qcStagePool, qcBossOpen.
   ===================================================================== */
const QC = { hatch: 3, chieu: 3, bossQ: 5, bossHp: 3, bossE: 5, bossDay: 3, album: 30, tkNgay: 12 };
const QC_FOOD = [['🍎', 'apple', 'an_tao'], ['🍌', 'banana', 'an_chuoi'], ['🥕', 'carrot', 'an_ca_rot'], ['🍪', 'cookie', 'an_banh_quy'], ['🍉', 'watermelon', 'an_dua_hau'], ['🥛', 'milk', 'an_sua'], ['🧀', 'cheese', 'an_pho_mai'], ['🍓', 'strawberry', 'an_dau_tay']];
/* đồ trang trí vườn: mua bằng sao, bày cố định trên vườn (x: giữa, b: đáy, h: cao, theo % khung vườn) */
const QC_DECO = [
  { id: 'hoa_huong_duong', n: 'Chậu hướng dương', p: 10, x: 64, b: 18, h: 17 },
  { id: 'nha_chim', n: 'Nhà chim', p: 15, x: 29, b: 47, h: 18 },
  { id: 'ho_nuoc', n: 'Hồ nước', p: 15, x: 17, b: 13, h: 9 },
  { id: 'cay_tao', n: 'Cây táo', p: 20, x: 10, b: 44, h: 32 },
  { id: 'den', n: 'Đèn vườn', p: 20, x: 90, b: 42, h: 30 },
  { id: 'be_cat', n: 'Hố cát', p: 25, x: 84, b: 13, h: 11 },
  { id: 'xich_du', n: 'Xích đu', p: 25, x: 21, b: 27, h: 24 },
  { id: 'cau_truot', n: 'Cầu trượt', p: 30, x: 80, b: 25, h: 23 }];
function qcDecoImg(d) { return `${Q_IMG}vuon_${d.id}.webp`; }
function qcDecoHTML() { const o = shop().deco || {};
  return QC_DECO.filter(d => o[d.id] === 1).map(d => `<img class="pc-deco" src="${qcDecoImg(d)}" alt="" draggable="false" style="left:${d.x}%;bottom:${d.b}%;height:${d.h}%">`).join(''); }
function qcFoodImg(i) { return `<img src="${Q_IMG}${QC_FOOD[i][2]}.webp" alt="${QC_FOOD[i][1]}" draggable="false">`; }
const QC_STICK = ['⭐', '🌈', '🎈', '🍭', '🌸', '🦋', '🎀', '🍀', '🌟', '🎉', '🧸', '🍦'];
const QC_SHOT = { lua: '🔥', nuoc: '💧', la: '🍃' };
const QC_TEN = { lua: ['Lửa Nhỏ', 'Bé Lửa', 'Đốm Đỏ'], nuoc: ['Giọt Nước', 'Bé Mây', 'Tí Xanh'], la: ['Mầm Lá', 'Bé Mầm', 'Lá Non'] };
const QC_HELLO_ZH = '../seedling/tai-nguyen/little-seed/audio/ls_co_huou_zh_014.mp3';   // 你好 (bài Seedling ngày 1)

/* ---------- sao và số buổi qua mọi chặng ---------- */
function qcMark() {
  if (!P || typeof P !== 'object') return;
  P._earn = P._earn || {}; P._les = P._les || {};
  P._earn[CHANG] = myPoints(); P._les[CHANG] = doneCount(qGroup());
}
function qcSum(o, cur) { let n = 0; for (let k = 1; k <= CHANG_SO; k++) n += k === CHANG ? cur : (+((o || {})[k]) || 0); return n; }
function qEarned() { return qcSum(P._earn, myPoints()) + qZoomSao(); }
function qLessons() { return typeof jAll === 'function' ? jAll(qGroup()).les : qcSum(P._les, doneCount(qGroup())); }   // đếm thẳng trong P, cả 7 chặng

/* ---------- tiện ích ---------- */
const qcPick = a => a[Math.floor(Math.random() * a.length)];
function qcShuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
/* câu tiếng Anh của thú cưng: đã thu (Gemini 3.8 Flash TTS, giọng Achernar, 26/11/2026); câu chưa thu thì dùng giọng máy */
const QC_EN_F = {"Hello!": "../seedling/tai-nguyen/thu-cung/pet_en_hello.mp3", "Let's play!": "../seedling/tai-nguyen/thu-cung/pet_en_lets_play.mp3", "apple, please!": "../seedling/tai-nguyen/thu-cung/pet_en_apple_please.mp3", "banana, please!": "../seedling/tai-nguyen/thu-cung/pet_en_banana_please.mp3", "carrot, please!": "../seedling/tai-nguyen/thu-cung/pet_en_carrot_please.mp3", "cookie, please!": "../seedling/tai-nguyen/thu-cung/pet_en_cookie_please.mp3", "watermelon, please!": "../seedling/tai-nguyen/thu-cung/pet_en_watermelon_please.mp3", "milk, please!": "../seedling/tai-nguyen/thu-cung/pet_en_milk_please.mp3", "cheese, please!": "../seedling/tai-nguyen/thu-cung/pet_en_cheese_please.mp3", "strawberry, please!": "../seedling/tai-nguyen/thu-cung/pet_en_strawberry_please.mp3", "Yummy! Thank you!": "../seedling/tai-nguyen/thu-cung/pet_en_yummy_thank_you.mp3", "Yummy!": "../seedling/tai-nguyen/thu-cung/pet_en_yummy.mp3", "Got it!": "../seedling/tai-nguyen/thu-cung/pet_en_got_it.mp3", "Yay!": "../seedling/tai-nguyen/thu-cung/pet_en_yay.mp3", "Again!": "../seedling/tai-nguyen/thu-cung/pet_en_again.mp3", "Where am I?": "../seedling/tai-nguyen/thu-cung/pet_en_where_am_i.mp3", "Boo!": "../seedling/tai-nguyen/thu-cung/pet_en_boo.mp3", "Not here!": "../seedling/tai-nguyen/thu-cung/pet_en_not_here.mp3", "I am here!": "../seedling/tai-nguyen/thu-cung/pet_en_i_am_here.mp3", "Cheese!": "../seedling/tai-nguyen/thu-cung/pet_en_cheese.mp3"};
function qcEn(t) {
  const f = QC_EN_F[t]; if (f) { voicePlay(f); return; }
  try { if (!('speechSynthesis' in window)) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'en-US'; u.rate = 0.95; u.pitch = 1.5; speechSynthesis.speak(u); } catch (e) {}
}
function qcBubble(host, txt, ms) {
  if (!host) return; let b = host.querySelector('.pc-bub');
  if (!b) { b = document.createElement('div'); b.className = 'pc-bub'; host.appendChild(b); }
  b.textContent = txt; b.classList.remove('on'); void b.offsetWidth; b.classList.add('on');
  clearTimeout(b._t); b._t = setTimeout(() => b.classList.remove('on'), ms || 2400);
}
function qcFx(el, cls, ms) { if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(() => el.classList.remove(cls), ms || 900); }
function qcTone(seq) { try { tone(seq); } catch (e) {} }
const qcSfx = { knock: () => qcTone([[420, .06, 'square'], [380, .08, 'square']]), boom: () => qcTone([[180, .12, 'sawtooth'], [120, .25, 'sawtooth']]),
  zap: () => qcTone([[880, .05, 'square'], [1320, .05, 'square'], [1760, .1, 'square']]), giggle: () => qcTone([[880, .06, 'sine'], [990, .06, 'sine'], [880, .06, 'sine'], [1100, .1, 'sine']]),
  munch: () => qcTone([[300, .05, 'square'], [260, .05, 'square'], [300, .05, 'square']]) };

/* ---------- từ vựng con đã học (qua-tu.js tải khi cần) ---------- */
function qcTu(cb) {
  if (window.M3_TU) return cb();
  const s = document.createElement('script'); s.src = '../chung/qua/qua-tu.js?v=20261126a';   // LỚP OFFLINE
  s.onload = () => cb(); s.onerror = () => { sfx.no(); toast('Chưa tải được bài. Ba mẹ kiểm tra mạng rồi thử lại nhé!'); };
  document.head.appendChild(s);
}
function qcCards(a, b) {   // ngày web a..b của khoá con học
  const T = (window.M3_TU || {})[qGroup()] || {}, out = [], seen = {};
  for (let d = Math.max(1, a); d <= Math.min(99, b); d++) (T[d] || []).forEach(c => { if (seen[c[0]]) return; seen[c[0]] = 1; out.push({ en: c[0], zh: c[1], py: c[2], img: c[3], ae: c[4], az: c[5] }); });
  return out;
}
function qcPool() {   // từ con đã học: tới ngày con đang học (ít nhất cả chặng trước), ưu tiên 20 ngày gần nhất
  const upto = TEACHER ? CHANG_B : Math.max(1, CHANG_A + doneCount(qGroup()));
  let L = qcCards(Math.max(1, upto - 19), upto); if (L.length < 6) L = qcCards(1, Math.max(upto, 6));
  return L;
}
function qcStagePool() { const L = qcCards(CHANG_A + 1, CHANG_B); return L.length >= 6 ? L : qcCards(1, CHANG_B); }
function qcQuiz(pool, n) {   // n câu, mỗi câu 3 thẻ khác nhau
  const qs = [], targets = qcShuffle(pool).slice(0, n);
  targets.forEach((t, i) => { const opts = qcShuffle([t].concat(qcShuffle(pool.filter(x => x.en !== t.en && x.img !== t.img)).slice(0, 2))); qs.push({ t, opts, zh: i % 2 === 1 && !!t.az }); });
  return qs;
}
function qcSay(q, done) { voicePlay(q.zh ? q.t.az : q.t.ae, { onend: done, onerr: done }); }
function qcWord(c) { return `<b>${esc(c.en)}</b>${c.zh ? ` · <span lang="zh">${esc(c.zh)}</span> <small>${esc(c.py)}</small>` : ''}`; }

/* =====================================================================
   THÚ CƯNG
   ===================================================================== */
function qcMood(p) {
  if (qDaysSince(p.last) >= 2) return '🥺 Bạn ấy nhớ con!';
  const h = new Date().getHours();
  if (h >= 21 || h < 6) return '😴 Bạn ấy buồn ngủ';
  if (p.fd !== qToday()) return '🤤 Bạn ấy đói bụng';
  return '😊 Bạn ấy đang vui';
}
function qcMoodK(p) { if (qDaysSince(p.last) >= 2) return 'nho'; const h = new Date().getHours(); if (h >= 21 || h < 6) return 'ngu'; return p.fd !== qToday() ? 'doi' : 'vui'; }
function qcPose(p) {   // bạn ấy trưởng thành thì đổi dáng theo tâm trạng
  if (petStage(p) !== 3) return petImg(p);
  const k = qcMoodK(p); return k === 'vui' ? petImg(p) : `${Q_IMG}pet_${p.sp}_${k === 'ngu' ? 'ngu' : 'doi'}.webp`;
}
function qcJoy(p, img, ms) { if (!img || petStage(p) !== 3) return; img.src = `${Q_IMG}pet_${p.sp}_vui.webp`; if (ms) setTimeout(() => { if (document.body.contains(img)) img.src = qcPose(p); }, ms); }
function qcCrave(p) { if (!p.th || p.th.d !== qToday()) p.th = { d: qToday(), f: Math.floor(Math.random() * QC_FOOD.length) }; return p.th.f; }
function qcCareLeft(p) { return Q_RULE.careDay - (p.d === qToday() ? p.n : 0); }
function qcCanCare(p, cost) {
  if (qcCareLeft(p) <= 0) { sfx.no(); toast('Bạn ấy đã chơi đủ hôm nay rồi. Ngày mai con quay lại nhé!'); hdSay('Bạn ấy đã chơi đủ hôm nay rồi. Ngày mai con quay lại nhé!'); return false; }
  if (qWallet() < cost) { qNoStars(cost); return false; }
  return true;
}
function qcGrow(p, add) {   // ghi một lần chăm; trả true nếu bạn ấy vừa lớn lên
  if (p.d !== qToday()) { p.d = qToday(); p.n = 0; }
  const before = petStage(p); p.g += add; p.n++; p.last = qToday(); qSave();
  return petStage(p) > before;
}
let qcIdle = 0;
function viewPets() {
  clearTimeout(qcIdle);
  const s = shop(); const sel = Math.min(s.petSel || 0, Math.max(0, s.pets.length - 1)); const p = s.pets[sel];
  s.album = s.album || [];
  const list = Object.keys(PET_SP).map(sp => { const k = s.pets.findIndex(x => x.sp === sp), own = k >= 0, x = s.pets[k];
    const price = s.pets.length ? Q_RULE.petAdopt : 0;
    return `<button class="q-card ${own && k === sel ? 'on' : ''}" data-sp="${sp}" data-k="${k}" type="button">
      <img src="${own ? petImg(x) : Q_IMG + 'pet_' + sp + '_1.webp'}" alt=""><b>${PET_SP[sp].n}</b>
      <span class="q-price ${own ? 'own' : ''}">${own ? petStageName(x) : (price ? price + ' ⭐' : 'Miễn phí')}</span></button>`; }).join('');
  let stage;
  if (p) {
    const st = petStage(p), nxt = Q_RULE.petG[st - 1], prev = st === 1 ? 0 : Q_RULE.petG[st - 2], left = qcCareLeft(p);
    stage = `<div class="q-stage pc-stage" id="pcStage" style="background-image:url('${Q_IMG}bg_vuon.webp')">${qcDecoHTML()}
      <div class="q-plate"><b>${PET_SP[p.sp].n}</b><span>${petStageName(p)}</span></div>
      <div class="q-meters"><div class="q-meter"><small>Lớn lên</small><i><u style="width:${st === 3 ? 100 : Math.round((p.g - prev) / (nxt - prev) * 100)}%"></u></i></div>
        <div class="q-mood">${qcMood(p)}</div></div>
      <div class="pc-pet s${st} m-${qcMoodK(p)}" id="pcPet"><img src="${qcPose(p)}" alt="${PET_SP[p.sp].n}" draggable="false"></div>
      <div class="q-acts"><button class="q-act" id="qFeed" type="button">🍖<b>Cho ăn</b><span>${Q_RULE.feed} ⭐</span></button>
        <button class="q-act" id="qPlay" type="button">🎾<b>Chơi cùng</b><span>${Q_RULE.play} ⭐</span></button></div>
      <button class="pc-album" id="pcAlbum" type="button">📷 Album <b>${s.album.length}</b></button>
      <div class="q-care">Hôm nay còn ${Math.max(0, left)}/${Q_RULE.careDay} lượt chăm</div></div>`;
  } else {
    stage = `<div class="q-stage empty" style="background-image:url('${Q_IMG}bg_vuon.webp')">${qcDecoHTML()}<div class="q-empty">🐾 Con chọn một bạn bên phải để nhận nuôi nhé!<br><small>Bạn đầu tiên được tặng miễn phí.</small></div></div>`;
  }
  const dO = s.deco || {}, decos = QC_DECO.map(d => { const own = d.id in dO;
    return `<button class="pc-dcard ${dO[d.id] === 1 ? 'on' : ''}" data-d="${d.id}" type="button"><img src="${qcDecoImg(d)}" alt=""><b>${d.n}</b><span>${own ? (dO[d.id] === 1 ? '✓ Đang bày' : 'Đã cất') : d.p + ' ⭐'}</span></button>`; }).join('');
  qFrame('🐶 Nuôi thú cưng', `${stage}<div class="q-side"><h4>Các bạn thú cưng</h4><div class="q-cards">${list}</div>
    <h4>🌻 Trang trí vườn <small>Chạm để mua, chạm lần nữa để cất hoặc bày lại</small></h4><div class="pc-decos">${decos}</div>
    <p class="q-hint">Chạm, vuốt bạn ấy: miễn phí. Cho ăn ${Q_RULE.feed} ⭐ (+1, đúng món bạn ấy thèm +2). Chơi cùng ${Q_RULE.play} ⭐ (+2, mỗi lần một trò, có ảnh vào Album). Đủ ${Q_RULE.petG[0]} điểm bạn ấy lớn, đủ ${Q_RULE.petG[1]} điểm bạn ấy trưởng thành. Mỗi ngày chăm tối đa ${Q_RULE.careDay} lần.</p></div>`, 'qpet');
  app.querySelectorAll('.q-card').forEach(b => b.onclick = () => {
    const sp = b.dataset.sp, k = +b.dataset.k;
    if (k >= 0) { s.petSel = k; qSave(); sfx.pop(); return viewPets(); }
    const price = s.pets.length ? Q_RULE.petAdopt : 0;
    if (price && !qSpend(price)) return;
    s.pets.push({ sp, g: 0, d: '', n: 0, last: qToday() }); s.petSel = s.pets.length - 1; qSave(); sfx.win(); confetti(16);
    toast(`Con đã nhận nuôi ${PET_SP[sp].n}! 🎉`); viewPets(); hdSay('Con chạm vào bạn ấy, cho bạn ấy ăn hoặc chơi cùng bạn ấy nhé.');
  });
  app.querySelectorAll('.pc-dcard').forEach(b => b.onclick = () => {
    const d = QC_DECO.find(x => x.id === b.dataset.d), o = s.deco = s.deco || {};
    if (!(d.id in o)) { if (!qSpend(d.p)) return; o[d.id] = 1; qSave(); confetti(12); toast(`Con đã mua ${d.n} cho vườn! 🎉`); qcEn('Yay!'); }
    else { o[d.id] = o[d.id] === 1 ? 0 : 1; qSave(); sfx.pop(); }
    viewPets();
  });
  if (!p) { qSay('pet', 'Con chọn một bạn thú cưng để nhận nuôi nhé. Bạn đầu tiên được tặng miễn phí!'); return; }
  qcTouch(p);
  document.getElementById('qFeed').onclick = () => { if (qcCanCare(p, Q_RULE.feed)) qcFeed(p); };
  document.getElementById('qPlay').onclick = () => { if (qcCanCare(p, Q_RULE.play)) qcPlay(p); };
  document.getElementById('pcAlbum').onclick = () => { sfx.pop(); qcAlbum(); };
  qSay('pet', 'Con chạm vào bạn ấy, cho bạn ấy ăn hoặc chơi cùng bạn ấy nhé.');
}

/* chạm đầu · chạm bụng · vuốt; 20 giây không chạm thì bạn ấy gọi con */
function qcTouch(p) {
  const box = document.getElementById('pcPet'), stage = document.getElementById('pcStage'); if (!box) return;
  const img = box.querySelector('img');
  let down = null, dist = 0, hiN = 0;
  let called = false;   // gọi con một lần mỗi lần vào trang, không gọi mãi
  const idle = () => { clearTimeout(qcIdle); if (called) return; qcIdle = setTimeout(() => { if (!document.body.contains(box) || document.getElementById('pcStage').classList.contains('playing')) return;
    called = true; qcFx(img, 'r-wave', 1200); qcBubble(stage, 'Chơi với tớ đi! 🎾'); qcEn("Let's play!"); }, 20000); };
  box.onpointerdown = e => { down = { x: e.clientX, y: e.clientY, lx: e.clientX }; dist = 0; try { box.setPointerCapture(e.pointerId); } catch (er) {} };
  box.onpointermove = e => { if (!down) return; dist += Math.abs(e.clientX - down.lx); down.lx = e.clientX;
    if (dist > 90 && !box.classList.contains('stroking')) { box.classList.add('stroking'); qcFx(img, 'r-stroke', 1600); qcBubble(stage, 'Thích quá… 💤'); qFloat(box, '💤'); } };
  box.onpointerup = e => {
    if (!down) return; const r = box.getBoundingClientRect(), y = (down.y - r.top) / r.height; down = null; idle();
    if (box.classList.contains('stroking')) { setTimeout(() => box.classList.remove('stroking'), 1600); return; }
    if (y < 0.45) {   // đầu
      qcFx(img, 'r-head', 900); qcJoy(p, img, 1600); qFloat(box, '💖'); sfx.ok();
      if (hiN++ % 2) { qcBubble(stage, '你好! 👋'); voicePlay(QC_HELLO_ZH); } else { qcBubble(stage, 'Hello! 👋'); qcEn('Hello!'); }
    } else {          // bụng
      qcFx(img, 'r-belly', 1000); qFloat(box, '😆'); qcSfx.giggle(); qcBubble(stage, 'Hi hi, nhột quá!');
    }
  };
  box.onpointercancel = () => { down = null; };
  idle();
}

/* cho ăn: kéo món vào miệng bạn ấy (hoặc chạm món) */
function qcFeed(p) {
  const stage = document.getElementById('pcStage'), box = document.getElementById('pcPet'); if (!stage) return;
  const want = qcCrave(p), opts = qcShuffle([want].concat(qcShuffle(QC_FOOD.map((_, i) => i).filter(i => i !== want)).slice(0, 2)));
  stage.classList.add('feeding');
  const tray = document.createElement('div'); tray.className = 'pc-tray';
  tray.innerHTML = `<span class="pc-tray-t"><span class="pc-want">${qcFoodImg(want)}</span>Bạn ấy thèm món này. Kéo món vào bạn ấy nhé!</span>${opts.map(i => `<button class="pc-food" type="button" data-i="${i}" aria-label="${QC_FOOD[i][1]}">${qcFoodImg(i)}</button>`).join('')}<button class="pc-x" type="button" aria-label="Thôi">✕</button>`;
  stage.appendChild(tray);
  qcBubble(stage, `Tớ thèm ${QC_FOOD[want][0]} quá!`, 4000); qcEn(QC_FOOD[want][1] + ', please!');
  const close = () => { tray.remove(); stage.classList.remove('feeding'); };
  tray.querySelector('.pc-x').onclick = () => { sfx.pop(); close(); };
  const eat = i => {
    if (!qSpend(Q_RULE.feed)) { close(); return; }
    close(); p.fd = qToday();
    const good = i === want, img = box.querySelector('img');
    qcSfx.munch(); qcFx(img, 'r-munch', 1200); qcJoy(p, img); qFloat(box, good ? '😋 +2' : '😋 +1');
    qcBubble(stage, good ? 'Đúng món tớ thèm! Ngon quá! 💖' : 'Ngon quá!'); qcEn(good ? 'Yummy! Thank you!' : 'Yummy!');
    const up = qcGrow(p, good ? 2 : 1);
    setTimeout(() => { if (up) qcGrewUp(); else viewPets(); }, 1500);
  };
  tray.querySelectorAll('.pc-food').forEach(f => {
    let sx = 0, sy = 0, moved = false, ghost = null;
    f.onpointerdown = e => { e.preventDefault(); sx = e.clientX; sy = e.clientY; moved = false; try { f.setPointerCapture(e.pointerId); } catch (er) {} };
    f.onpointermove = e => { if (!sx && !sy) return; const dx = e.clientX - sx, dy = e.clientY - sy;
      if (!moved && Math.hypot(dx, dy) > 8) { moved = true; ghost = document.createElement('span'); ghost.className = 'pc-ghost'; ghost.innerHTML = f.innerHTML; document.body.appendChild(ghost); f.style.opacity = .3; }
      if (ghost) { ghost.style.left = e.clientX + 'px'; ghost.style.top = e.clientY + 'px'; } };
    f.onpointerup = e => { const i = +f.dataset.i; sx = sy = 0;
      if (ghost) { ghost.remove(); ghost = null; f.style.opacity = '';
        const r = box.getBoundingClientRect(); if (e.clientX > r.left - 20 && e.clientX < r.right + 20 && e.clientY > r.top - 20 && e.clientY < r.bottom + 20) eat(i); else { sfx.pop(); qcBubble(stage, 'Đưa gần tớ hơn nữa nhé!'); }
      } else eat(i); };
  });
}
function qcGrewUp() { sfx.win(); confetti(30); hdSay('Hoan hô! Bạn ấy lớn lên rồi!'); viewPets(); }

/* chơi cùng: 3 trò, không lặp lại trò vừa chơi */
function qcPlay(p) {
  if (!qSpend(Q_RULE.play)) return;
  const s = shop(), games = ['bong', 'tron', 'do'].filter(g => g !== s.lastGame), g = qcPick(games);
  s.lastGame = g; const up = qcGrow(p, 2);
  const stage = document.getElementById('pcStage'); clearTimeout(qcIdle); stage.classList.add('playing');
  const layer = document.createElement('div'); layer.className = 'pc-game'; stage.appendChild(layer);
  const end = (extra, title) => { qcPhoto(p, extra, title, () => { if (up) qcGrewUp(); else viewPets(); }); };
  if (g === 'bong') qcGameBall(p, layer, end); else if (g === 'tron') qcGameHide(p, layer, end); else qcTu(() => qcGameQuiz(p, layer, end));
}
function qcGameHead(layer, t, sub) { layer.insertAdjacentHTML('afterbegin', `<div class="pc-ghead"><b>${t}</b><small>${sub}</small></div>`); }

/* Trò 1 · Ném bóng: chạm chỗ muốn ném, bạn ấy chạy theo bắt (3 lần) */
function qcGameBall(p, layer, end) {
  qcGameHead(layer, '🎾 Ném bóng', 'Chạm vào chỗ con muốn ném bóng');
  layer.insertAdjacentHTML('beforeend', `<div class="pc-runner" id="pcRun"><img src="${petImg(p)}" alt=""></div><span class="pc-ball" id="pcBall"></span><div class="pc-count" id="pcCnt">0/3</div>`);
  const run = layer.querySelector('#pcRun'), ball = layer.querySelector('#pcBall'), cnt = layer.querySelector('#pcCnt');
  let n = 0, busy = false; hdSay('Con chạm vào chỗ muốn ném bóng nhé!');
  layer.onclick = e => {
    if (busy || e.target.closest('.pc-ghead')) return; busy = true;
    const R = layer.getBoundingClientRect(), x = Math.min(.9, Math.max(.1, (e.clientX - R.left) / R.width)), y = Math.min(.75, Math.max(.25, (e.clientY - R.top) / R.height));
    const bx = .08 * R.width, by = .86 * R.height, tx = x * R.width, ty = y * R.height;
    qcTone([[520, .05, 'sine'], [700, .08, 'sine']]);
    ball.animate([{ transform: `translate(${bx}px,${by}px) rotate(0)` }, { transform: `translate(${(bx + tx) / 2}px,${Math.min(by, ty) - R.height * .25}px) rotate(360deg)`, offset: .5 }, { transform: `translate(${tx}px,${ty}px) rotate(720deg)` }], { duration: 750, easing: 'ease-out', fill: 'forwards' });
    run.style.left = (x * 100) + '%'; run.classList.add('go'); if (y < .5) setTimeout(() => qcFx(run.querySelector('img'), 'r-jump', 700), 450);
    setTimeout(() => { n++; cnt.textContent = n + '/3'; run.classList.remove('go'); qFloat(run, '💖'); sfx.ok(); qcEn(qcPick(['Got it!', 'Yay!', 'Again!']));
      ball.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250, fill: 'forwards' });
      setTimeout(() => { ball.animate([{ transform: `translate(${bx}px,${by}px)`, opacity: 1 }], { duration: 1, fill: 'forwards' }); busy = false;
        if (n >= 3) { layer.onclick = null; confetti(14); setTimeout(() => end(0, 'Ném bóng'), 600); } }, 450); }, 800);
  };
  ball.animate([{ transform: `translate(${.08 * layer.clientWidth}px,${.86 * layer.clientHeight}px)` }], { duration: 1, fill: 'forwards' });
}

/* Trò 2 · Trốn tìm: bạn ấy trốn sau 1 trong 3 bụi cây (2 lượt) */
function qcGameHide(p, layer, end) {
  qcGameHead(layer, '🌳 Trốn tìm', 'Bạn ấy trốn sau bụi cây nào? Bụi cây nào rung là có bạn ấy đấy!');
  layer.insertAdjacentHTML('beforeend', [0, 1, 2].map(i => `<button class="pc-bush" type="button" data-i="${i}" style="left:${18 + i * 32}%"><img class="pc-hid" src="${petImg(p)}" alt=""><img class="pc-leaf" src="${Q_IMG}bui_cay.webp" alt="" draggable="false"></button>`).join('') + '<div class="pc-count" id="pcCnt">Lượt 1/2</div>');
  const bushes = [...layer.querySelectorAll('.pc-bush')], cnt = layer.querySelector('#pcCnt');
  let round = 0, at = 0, tries = 0, tick = 0;
  const start = () => { at = Math.floor(Math.random() * 3); tries = 0; bushes.forEach(b => b.classList.remove('found', 'no'));
    cnt.textContent = 'Lượt ' + (round + 1) + '/2'; qcEn('Where am I?');
    clearInterval(tick); tick = setInterval(() => { if (!document.body.contains(layer)) return clearInterval(tick);
      const k = Math.random() < .7 ? at : Math.floor(Math.random() * 3); qcFx(bushes[k].querySelector('.pc-leaf'), 'rustle', 700); }, 1400); };
  bushes.forEach(b => b.onclick = () => {
    const i = +b.dataset.i; if (b.classList.contains('found')) return;
    if (i === at) { clearInterval(tick); b.classList.add('found'); sfx.win(); qcEn('Boo!'); qFloat(b, '🎉');
      setTimeout(() => { round++; if (round >= 2) end(0, 'Trốn tìm'); else start(); }, 1400); }
    else { tries++; qcFx(b, 'no', 500); sfx.no(); qcEn(tries >= 2 ? 'I am here!' : 'Not here!'); if (tries >= 2) qcFx(bushes[at].querySelector('.pc-leaf'), 'rustle', 900); }
  });
  start();
}

/* Trò 3 · Đố từ: nghe từ đã học, chạm đúng tranh (3 câu) */
function qcGameQuiz(p, layer, end) {
  const pool = qcPool(); if (pool.length < 3) return qcGameBall(p, layer, end);
  const qs = qcQuiz(pool, 3); let k = 0, perfect = true, miss = false;
  qcGameHead(layer, '🃏 Đố từ', 'Nghe bạn ấy đố rồi chạm đúng tranh');
  layer.insertAdjacentHTML('beforeend', `<div class="pc-quiz"><div class="pc-qtop"><img class="pc-qpet" src="${petImg(p)}" alt=""><button class="pc-say" type="button">🔊 Nghe lại</button><span class="pc-count">1/3</span></div><div class="pc-opts"></div><div class="pc-ans"></div></div>`);
  const opts = layer.querySelector('.pc-opts'), ans = layer.querySelector('.pc-ans'), pet = layer.querySelector('.pc-qpet'), cnt = layer.querySelector('.pc-count');
  const show = () => { const q = qs[k]; miss = false; ans.innerHTML = ''; cnt.textContent = (k + 1) + '/3';
    opts.innerHTML = q.opts.map((c, i) => `<button class="pc-opt" type="button" data-i="${i}"><img src="${esc(c.img)}" alt=""></button>`).join('');
    qcSay(q);
    opts.querySelectorAll('.pc-opt').forEach(b => b.onclick = () => { const c = q.opts[+b.dataset.i];
      if (c.en === q.t.en) { sfx.ok(); b.classList.add('ok'); qcFx(pet, 'r-jump', 700); ans.innerHTML = qcWord(c); opts.querySelectorAll('.pc-opt').forEach(x => x.onclick = null);
        setTimeout(() => { k++; if (k < qs.length) show(); else { const bonus = perfect ? 1 : 0; if (bonus) { confetti(20); toast('Đúng cả 3 câu! Con được thêm 1 sticker 🌟'); } setTimeout(() => end(bonus, 'Đố từ'), 700); } }, 1300); }
      else { sfx.no(); perfect = false; miss = true; qcFx(b, 'no', 500); b.disabled = true; setTimeout(() => qcSay(q), 500); } }); };
  layer.querySelector('.pc-say').onclick = () => qcSay(qs[k]);
  show();
}

/* ảnh kỷ niệm sau mỗi lượt chơi → Album */
function qcPhoto(p, extra, title, after) {
  const s = shop(); s.album = s.album || [];
  const k = qcShuffle(QC_STICK).slice(0, 2 + (extra || 0));
  const ph = { t: Date.now(), sp: p.sp, st: petStage(p), a: Object.assign({}, s.ava), k, g: title, e: { 'Ném bóng': '🎾', 'Trốn tìm': '🌳', 'Đố từ': '🃏' }[title] || '📷' };
  s.album.unshift(ph); s.album = s.album.slice(0, QC.album); qSave();
  const ov = document.createElement('div'); ov.className = 'overlay pp pc-ph-ov';
  ov.innerHTML = `<div class="modal pc-ph-box" role="dialog" aria-label="Ảnh kỷ niệm"><h3>📷 Ảnh kỷ niệm: ${esc(title)}</h3>${qcPhotoHTML(ph)}
    <p>Ảnh đã vào Album của con.</p><div class="row"><button class="btn y" type="button" id="pcDl">👨‍👩‍👧 Ba mẹ tải ảnh</button><button class="btn g" type="button" id="pcOk">Xong 👍</button></div></div>`;
  document.body.appendChild(ov); sfx.win(); qcEn('Cheese!');
  const close = () => { ov.remove(); after && after(); };
  ov.querySelector('#pcOk').onclick = close; ov.querySelector('#pcDl').onclick = () => qcDownload(ph);
}
function qcPhotoHTML(ph) {
  return `<div class="pc-photo" style="background-image:url('${Q_IMG}bg_vuon.webp')">
    <img class="pc-ph-pet s${ph.st}" src="${Q_IMG}pet_${ph.sp}_${ph.st}.webp" alt=""><img class="pc-ph-ava" src="${avaSrc(ph.a)}" alt="">
    ${ph.k.map((x, i) => `<span class="pc-ph-st st${i}">${x}</span>`).join('')}${ph.e ? `<span class="pc-ph-prop">${ph.e}</span>` : ''}<span class="pc-ph-date">${new Date(ph.t).toLocaleDateString('vi-VN')}</span></div>`;
}
function qcAlbum() {
  const s = shop(), A = s.album || [];
  const ov = document.createElement('div'); ov.className = 'overlay pp pc-ph-ov';
  ov.innerHTML = `<div class="modal pc-al-box" role="dialog" aria-label="Album ảnh"><button class="pp-x" aria-label="Đóng">✕</button><h3>📷 Album của con (${A.length}/${QC.album})</h3>
    ${A.length ? `<div class="pc-al">${A.map((ph, i) => `<button class="pc-al-it" type="button" data-i="${i}">${qcPhotoHTML(ph)}<small>${esc(ph.g || '')}</small></button>`).join('')}</div><p class="q-hint">Chạm vào ảnh để xem to. Ba mẹ tải ảnh về để gửi cô nhé.</p>`
      : '<p>Con chơi cùng bạn thú cưng để có ảnh kỷ niệm nhé!</p>'}</div>`;
  document.body.appendChild(ov);
  ov.querySelector('.pp-x').onclick = () => ov.remove(); ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
  ov.querySelectorAll('.pc-al-it').forEach(b => b.onclick = () => { sfx.pop(); const ph = A[+b.dataset.i];
    const v = document.createElement('div'); v.className = 'overlay pp pc-ph-ov';
    v.innerHTML = `<div class="modal pc-ph-box"><button class="pp-x" aria-label="Đóng">✕</button>${qcPhotoHTML(ph)}<p>${esc(ph.g || '')} · ${new Date(ph.t).toLocaleDateString('vi-VN')}</p>
      <div class="row"><button class="btn y sm" type="button">👨‍👩‍👧 Ba mẹ tải ảnh</button></div></div>`;
    document.body.appendChild(v); v.querySelector('.pp-x').onclick = () => v.remove(); v.addEventListener('click', e => { if (e.target === v) v.remove(); });
    v.querySelector('.btn').onclick = () => qcDownload(ph); });
}
function qcDownload(ph) {
  const W = 1280, H = 720, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  const load = src => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.onerror = () => r(null); im.src = src; });
  Promise.all([load(Q_IMG + 'bg_vuon.webp'), load(`${Q_IMG}pet_${ph.sp}_${ph.st}.webp`), load(avaSrc(ph.a))]).then(([bg, pet, ava]) => {
    if (bg) x.drawImage(bg, 0, 0, W, H);
    const put = (im, cx, h) => { if (!im) return; const w = im.width * h / im.height; x.drawImage(im, cx - w / 2, H * .95 - h, w, h); };
    put(ava, W * .34, H * .78); put(pet, W * .64, H * (.38 + ph.st * .1));
    x.font = '96px serif'; x.textAlign = 'center'; ph.k.forEach((e, i) => x.fillText(e, [W * .12, W * .88, W * .5][i % 3], [H * .2, H * .25, H * .14][i % 3]));
    x.font = 'bold 34px sans-serif'; x.fillStyle = '#fff'; x.strokeStyle = 'rgba(0,0,0,.45)'; x.lineWidth = 6;
    const t = 'Anh – Trung – Kids · ' + ((typeof LOP !== 'undefined' && LOP === 'sd') ? 'Seedling' : 'Little Seed') + ' · ' + new Date(ph.t).toLocaleDateString('vi-VN'); x.strokeText(t, W / 2, H - 22); x.fillText(t, W / 2, H - 22);
    const a = document.createElement('a'); a.href = c.toDataURL('image/png'); a.download = 'anh-ky-niem-' + ph.t + '.png'; document.body.appendChild(a); a.click(); a.remove();
    toast('Đã tải ảnh về máy 📷');
  });
}

/* =====================================================================
   QUÁI VẬT: trứng nứt 3 buổi thì nở · luyện chiêu · rồng trùm cuối chặng
   ===================================================================== */
function monSince(m) { return Math.max(0, qLessons() - m.base); }
function monEnergy(m) { const k = monSince(m); return k >= QC.hatch ? Q_RULE.perLesson * (k - QC.hatch) + (m.c || 0) : 0; }
function monStage(m) { if (monSince(m) < QC.hatch) return 0; const e = monEnergy(m); return e >= Q_RULE.monE[1] ? 3 : (e >= Q_RULE.monE[0] ? 2 : 1); }
function qcMonName(m) { return m.ten || MON_SP[m.sp].n; }
function qcBossOpen() { return TEACHER || doneCount(qGroup()) >= 12 || Date.now() >= changMoLuc(CHANG) + QC.tkNgay * 864e5; }
function qcBossWon(n) { const b = shop().boss || {}; return !!b[n]; }
function qcBossTries() { const t = (shop().bossTry || {})[CHANG]; return t && t.d === qToday() ? t.n : 0; }
function qcBossTriedToday() { return !TEACHER && qcBossTries() >= QC.bossDay; }
function viewMons() {
  const s = shop(); const sel = Math.min(s.monSel || 0, Math.max(0, s.mons.length - 1)); const m = s.mons[sel];
  const list = Object.keys(MON_SP).map(sp => { const k = s.mons.findIndex(x => x.sp === sp), own = k >= 0, x = s.mons[k];
    return `<button class="q-card ${own && k === sel ? 'on' : ''}" data-sp="${sp}" data-k="${k}" type="button" style="--mc:${MON_SP[sp].c}">
      <img src="${own ? monImg(x) : Q_IMG + 'mon_' + sp + '_0.webp'}" alt=""><b>${own ? esc(qcMonName(x)) : MON_SP[sp].n}</b>
      <span class="q-price ${own ? 'own' : ''}">${own ? monStageName(x) : Q_RULE.egg + ' ⭐'}</span></button>`; }).join('');
  const badges = qcChangList().map(n => `<span class="pc-badge ${qcBossWon(n) ? 'won' : ''}" title="Rồng trùm ${esc(qcChangTen(n))}">${qcBossWon(n) ? `<img src="${Q_IMG}huy_hieu_rong.webp" alt="">` : '?'}<small>${esc(qcChangNhan(n))}</small></span>`).join('');   // LỚP OFFLINE: 1 huy hiệu mỗi Unit
  let stage;
  if (m) {
    const st = monStage(m), e = monEnergy(m), cd = m.d === qToday() ? m.n : 0, since = monSince(m);
    const lo = st <= 1 ? 0 : (st === 2 ? Q_RULE.monE[0] : Q_RULE.monE[1]), hi = st <= 1 ? Q_RULE.monE[0] : Q_RULE.monE[1];
    const chieuOk = st > 0 && m.lc !== qToday(), bossShow = st > 0 && qcBossOpen() && !qcBossWon(CHANG);
    const acts = st === 0
      ? `<span></span><a class="q-act learn" href="#/ban-do">📚<b>Đi học</b><span>+1 vết nứt mỗi ngày học</span></a>`
      : `<button class="q-act" id="qCandy" type="button">🍬<b>Kẹo</b><span>${Q_RULE.candy} ⭐ · +${Q_RULE.candyE}</span></button>
         <button class="q-act pc-chieu" id="qChieu" type="button" ${chieuOk ? '' : 'disabled'}>🎤<b>Luyện chiêu</b><span>${chieuOk ? 'Miễn phí · 1 lượt/ngày' : 'Mai luyện tiếp'}</span></button>
         ${bossShow ? `<button class="q-act pc-boss" id="qBoss" type="button">🐉<b>Rồng trùm</b><span>${esc(qcChangTen(CHANG))}</span></button>` : `<a class="q-act learn" href="#/ban-do">📚<b>Đi học</b><span>+${Q_RULE.perLesson} mỗi ngày học</span></a>`}`;
    stage = `<div class="q-stage pc-stage" id="pcStage" style="background-image:url('${Q_IMG}bg_quai.webp')">
      <div class="q-plate" style="--pc:${MON_SP[m.sp].c}"><b>${esc(qcMonName(m))}</b><span>${monStageName(m)}${m.ten ? ' · ' + MON_SP[m.sp].n : ''}</span></div>
      <div class="q-meters">${st === 0 ? `<div class="q-mood">🥚 Còn ${QC.hatch - since} ngày học nữa trứng nở!</div>`
        : `<div class="q-meter"><small>Năng lượng ${e}</small><i><u style="width:${st === 3 ? 100 : Math.round((e - lo) / (hi - lo) * 100)}%"></u></i></div><div class="q-mood">⚡ Học xong 1 ngày +${Q_RULE.perLesson}</div>`}</div>
      <div class="pc-pet mon s${st}" id="pcPet"><img src="${monImg(m)}" alt="${esc(qcMonName(m))}" draggable="false" class="${st === 0 ? 'egg' : ''}">${st === 0 ? `<svg class="pc-crack n${Math.min(2, since)}" viewBox="0 0 100 120" aria-hidden="true"><path class="k1" d="M46 34 L52 42 L47 49 L54 57 L50 63"/><path class="k2" d="M60 66 L55 73 L62 79 L57 87 L63 94"/></svg>` : ''}</div>
      <div class="q-acts">${acts}</div>
      <div class="q-care">${st === 0 ? '👆 Chạm vào trứng xem nào!' : `Kẹo hôm nay: ${cd}/${Q_RULE.candyDay}`}</div></div>`;
  } else {
    stage = `<div class="q-stage empty" style="background-image:url('${Q_IMG}bg_quai.webp')"><div class="q-empty">🥚 Con chọn một quả trứng bên phải nhé!<br><small>Học xong ${QC.hatch} ngày là trứng nở, càng học quái vật càng lớn.</small></div></div>`;
  }
  qFrame('👾 Nuôi quái vật', `${stage}<div class="q-side"><h4>Trứng quái vật</h4><div class="q-cards">${list}</div>
    <h4 class="pc-bh">Huy hiệu Rồng trùm</h4><div class="pc-badges">${badges}</div>
    <p class="q-hint">Mỗi ngày học xong: trứng thêm 1 vết nứt (${QC.hatch} vết thì nở), quái vật +${Q_RULE.perLesson} năng lượng. Luyện chiêu mỗi ngày +1 năng lượng mỗi từ nói to. Học xong mỗi Unit thì đánh Rồng trùm của Unit đó để lấy huy hiệu, +${QC.bossE} năng lượng.</p></div>`, 'qmon');
  app.querySelectorAll('.q-card').forEach(b => b.onclick = () => {
    const sp = b.dataset.sp, k = +b.dataset.k;
    if (k >= 0) { s.monSel = k; qSave(); sfx.pop(); return viewMons(); }
    if (!qSpend(Q_RULE.egg)) return;
    s.mons.push({ sp, g: qGroup(), base: qLessons(), c: 0, d: '', n: 0 }); s.monSel = s.mons.length - 1; qSave(); confetti(12);
    toast(`Con đã nhận trứng ${MON_SP[sp].n}! 🥚`); viewMons(); hdSay('Mỗi ngày con học xong, trứng lại nứt thêm một chút.');
  });
  if (!m) { qSay('mon', 'Con chọn một quả trứng quái vật. Con học xong ba ngày thì trứng sẽ nở!'); return; }
  const st = monStage(m), stage2 = document.getElementById('pcStage'), box = document.getElementById('pcPet');
  if (st > 0 && !m.seen) { qcHatch(m); return; }
  box.onclick = () => {
    const img = box.querySelector('img');
    if (st === 0) { qcSfx.knock(); qcFx(img, 'r-knock', 700); qcBubble(stage2, `Cốc cốc! Học thêm ${QC.hatch - monSince(m)} ngày nữa là tớ ra!`); }
    else { qcFx(img, 'r-jump', 700); qFloat(box, QC_SHOT[m.sp]); qcSfx.zap(); qcBubble(stage2, qcPick(['Tớ sẵn sàng rồi! 💪', 'Mình luyện chiêu đi!', 'Rồng trùm đâu rồi?'])); }
  };
  const cb = document.getElementById('qCandy');
  if (cb) cb.onclick = () => {
    if (m.d !== qToday()) { m.d = qToday(); m.n = 0; }
    if (m.n >= Q_RULE.candyDay) { sfx.no(); toast('Hôm nay quái vật ăn đủ kẹo rồi. Con đi học để quái vật lớn thêm nhé!'); return; }
    if (!qSpend(Q_RULE.candy)) return;
    const before = monStage(m); m.c = (m.c || 0) + Q_RULE.candyE; m.n++; qSave(); qcSfx.munch(); qcFx(box.querySelector('img'), 'r-munch', 1000); qFloat(box, '⚡ +' + Q_RULE.candyE);
    if (monStage(m) > before) setTimeout(() => { sfx.win(); confetti(30); hdSay('Hoan hô! Bạn ấy lớn lên rồi!'); viewMons(); }, 900);
    else setTimeout(viewMons, 1100);
  };
  const ch = document.getElementById('qChieu'); if (ch) ch.onclick = () => qcTu(() => qcChieu(m));
  const bo = document.getElementById('qBoss'); if (bo) bo.onclick = () => {
    if (qcBossTriedToday()) { sfx.no(); toast('Hôm nay con đã đấu rồi. Mai con đánh lại Rồng trùm nhé!'); return; }
    qcTu(() => qcBoss(m)); };
  qSay('mon', 'Con chạm vào quái vật, luyện chiêu mỗi ngày, học xong mỗi Unit thì đánh Rồng trùm nhé!');
}

/* cảnh nở + đặt tên */
function qcHatch(m) {
  const ov = document.createElement('div'); ov.className = 'overlay pp pc-hatch';
  ov.innerHTML = `<div class="pc-hbox"><img class="pc-hegg" src="${Q_IMG}mon_${m.sp}_0.webp" alt=""><div class="pc-flash"></div>
    <img class="pc-hmon" src="${Q_IMG}mon_${m.sp}_1.webp" alt=""><form class="pc-hname" hidden><h3>Trứng nở rồi! 🎉</h3><label>Con chọn tên cho bạn ấy nhé</label>
    <div class="pc-names">${QC_TEN[m.sp].map(n => `<button class="pc-nm" type="button">${esc(n)}</button>`).join('')}</div>
    <input maxlength="14" value="${esc(QC_TEN[m.sp][0])}" aria-label="Tên quái vật (ba mẹ gõ tên khác nếu muốn)"><button class="btn g" type="submit">Xong 👍</button></form></div>`;
  document.body.appendChild(ov); qcSfx.knock(); setTimeout(qcSfx.knock, 500); setTimeout(qcSfx.knock, 900);
  setTimeout(() => { qcSfx.boom(); sfx.win(); confetti(40); hdSay('Ôi, trứng nở rồi!'); }, 1500);
  setTimeout(() => { const f = ov.querySelector('form'); f.hidden = false; const i = f.querySelector('input');
    f.querySelectorAll('.pc-nm').forEach(b => b.onclick = () => { sfx.pop(); i.value = b.textContent; f.querySelectorAll('.pc-nm').forEach(x => x.classList.toggle('on', x === b)); });
    f.querySelector('.pc-nm').classList.add('on');
    f.onsubmit = e => { e.preventDefault(); m.ten = String(i.value || '').trim().slice(0, 14) || MON_SP[m.sp].n; m.seen = true; qSave(); ov.remove(); viewMons(); }; }, 2600);
}

/* luyện chiêu: nghe từ, nói to vào micro (chỉ đo độ to, không ghi âm). Không có micro: bấm nút liên tục */
let qcMic = null;
async function qcMicOpen() {
  if (qcMic) return qcMic;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const ctx = new (window.AudioContext || window.webkitAudioContext)(), src = ctx.createMediaStreamSource(stream), an = ctx.createAnalyser();
    an.fftSize = 512; src.connect(an); qcMic = { stream, ctx, an, buf: new Uint8Array(an.fftSize) }; return qcMic;
  } catch (e) { return null; }
}
function qcMicClose() { if (!qcMic) return; try { qcMic.stream.getTracks().forEach(t => t.stop()); qcMic.ctx.close(); } catch (e) {} qcMic = null; }
function qcLevel() { const m = qcMic; if (!m) return 0; m.an.getByteTimeDomainData(m.buf); let s = 0; for (const v of m.buf) { const d = (v - 128) / 128; s += d * d; } return Math.sqrt(s / m.buf.length); }
function qcChieu(m) {
  const pool = qcPool(); if (pool.length < 3) { toast('Con học thêm vài ngày để có từ luyện chiêu nhé!'); return; }
  const words = qcShuffle(pool).slice(0, QC.chieu); let k = 0, gained = 0, mic = null;
  const ov = document.createElement('div'); ov.className = 'overlay pp pc-chieu-ov';
  ov.innerHTML = `<div class="modal pc-ch-box" role="dialog" aria-label="Luyện chiêu"><button class="pp-x" aria-label="Đóng">✕</button>
    <h3>🎤 Luyện chiêu cùng ${esc(qcMonName(m))}</h3><div class="pc-ch-arena" style="background-image:url('${Q_IMG}bg_quai.webp')">
    <img class="pc-ch-mon" src="${monImg(m)}" alt=""><span class="pc-ch-shot"></span><div class="pc-ch-target">🎯</div></div>
    <div class="pc-ch-card"><img alt=""><div class="pc-ch-word"></div></div>
    <div class="pc-ch-meter"><i></i></div><p class="pc-ch-tip">Nghe cô đọc, rồi con nói thật to nhé!</p>
    <div class="row"><button class="btn sm" type="button" id="pcHear">🔊 Nghe lại</button><button class="btn g" type="button" id="pcTap" hidden>👊 Bấm liên tục khi con nói!</button></div>
    <span class="pc-count">1/${QC.chieu}</span></div>`;
  document.body.appendChild(ov);
  const card = ov.querySelector('.pc-ch-card img'), word = ov.querySelector('.pc-ch-word'), bar = ov.querySelector('.pc-ch-meter i'), tip = ov.querySelector('.pc-ch-tip'),
    tap = ov.querySelector('#pcTap'), cnt = ov.querySelector('.pc-count'), mon = ov.querySelector('.pc-ch-mon'), shot = ov.querySelector('.pc-ch-shot');
  let raf = 0, live = true, taps = 0, miss = 0;
  const close = () => { live = false; cancelAnimationFrame(raf); qcMicClose(); ov.remove(); viewMons(); };
  ov.querySelector('.pp-x').onclick = close;
  const hit = () => { cancelAnimationFrame(raf); tap.hidden = true; shot.textContent = QC_SHOT[m.sp]; qcSfx.zap();
    shot.animate([{ transform: 'translate(0,0) scale(.6)', opacity: 1 }, { transform: 'translate(260%, -20%) scale(1.6)', opacity: 1, offset: .8 }, { transform: 'translate(300%, -20%) scale(2.2)', opacity: 0 }], { duration: 800 });
    qcFx(mon, 'r-jump', 700); gained++; m.c = (m.c || 0) + 1; qSave(); tip.textContent = 'Tuyệt! Chiêu thật mạnh! ⚡ +1';
    setTimeout(() => { k++; if (k < words.length) next(); else finish(); }, 1300); };
  /* Có micro: đo tiếng ồn nền 0,3 giây, rồi con nói thành tiếng khoảng 0,5 giây là trúng (không cần hét).
     Sau 6 giây chưa nghe rõ: hiện thêm nút 👊 để con vẫn chơi được. Chỉ đo to nhỏ, không ghi âm. */
  const listen = () => {
    if (!live) return; taps = 0; bar.style.width = '0%';
    if (mic) { tip.textContent = 'Con nói theo cô nào! 🎤'; const t0 = performance.now(); let floor = 0, nf = 0, voiced = 0, last = t0;
      const loop = now => { if (!live) return; const lv = qcLevel(), dt = Math.min(100, now - last); last = now;
        if (now - t0 < 300) { floor += lv; nf++; raf = requestAnimationFrame(loop); return; }
        const th = Math.max(.02, (floor / Math.max(1, nf)) * 2.5);
        if (lv > th) voiced += dt; bar.style.width = Math.min(100, voiced / 5) + '%';
        if (voiced >= 500) return hit();
        if (now - t0 > 6300) { miss++; tap.hidden = false; tip.textContent = 'Con nói lại cùng cô nhé, rồi bấm 👊 nếu micro chưa nghe thấy.'; return; }
        raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
    } else { tap.hidden = false; tip.textContent = 'Con nói theo cô và bấm nút 👊 nhé!'; }
  };
  tap.onclick = () => { taps++; bar.style.width = Math.min(100, taps * 34) + '%'; sfx.pop(); if (taps >= 3) hit(); };
  const next = () => { const c = words[k], zh = k % 2 === 1 && c.az; cnt.textContent = (k + 1) + '/' + words.length;
    card.src = c.img; word.innerHTML = qcWord(c); tip.textContent = 'Nghe cô đọc nhé…'; bar.style.width = '0%';
    voicePlay(zh ? c.az : c.ae, { onend: listen, onerr: listen }); };
  ov.querySelector('#pcHear').onclick = () => { const c = words[k]; if (!c) return; cancelAnimationFrame(raf); voicePlay(k % 2 === 1 && c.az ? c.az : c.ae, { onend: listen, onerr: listen }); };
  const finish = () => { qcMicClose(); m.lc = qToday(); qSave(); sfx.win(); confetti(24);
    ov.querySelector('.modal').innerHTML = `<h3>💪 Luyện chiêu xong!</h3><img class="pc-ch-done" src="${monImg(m)}" alt=""><p>${esc(qcMonName(m))} được <b>+${gained} năng lượng</b>. Mai con luyện tiếp nhé!</p><div class="row"><button class="btn g" type="button">Xong 👍</button></div>`;
    ov.querySelector('.btn').onclick = () => { ov.remove(); viewMons(); }; };
  /* lần đầu: giải thích cho ba mẹ trước khi xin quyền micro */
  const go = () => qcMicOpen().then(x => { mic = x; if (!x) toast('Không mở được micro: con bấm nút 👊 thay cho micro nhé.'); next(); });
  if (lsGet('m3-mic-ok', false)) go();
  else { const pane = document.createElement('div'); pane.className = 'pc-mic-note';
    pane.innerHTML = `<b>👨‍👩‍👧 Gửi ba mẹ</b><p>Trò này dùng micro để nghe con nói to hay nhỏ. Web <b>không ghi âm, không lưu, không gửi tiếng</b> của con đi đâu. Trình duyệt sẽ hỏi quyền micro: ba mẹ bấm <b>Cho phép</b>. Không cho phép thì con bấm nút 👊 thay micro.</p><button class="btn g" type="button">Đã hiểu, bắt đầu 🎤</button>`;
    ov.querySelector('.modal').appendChild(pane);
    pane.querySelector('button').onclick = () => { lsSet('m3-mic-ok', true); pane.remove(); go(); }; }
}

/* Rồng trùm cuối chặng: 5 câu ôn chặng; đúng thì quái vật tung chiêu, sai 3 lần thì rồng thắng (mai đánh lại) */
function qcBoss(m) {
  const pool = qcStagePool(); if (pool.length < 3) { toast('Unit này chưa có đủ từ để đấu. Con học thêm nhé!'); return; }
  const qs = qcQuiz(pool, QC.bossQ); let k = 0, rong = QC.bossQ, mine = QC.bossHp;
  const ov = document.createElement('div'); ov.className = 'overlay pp pc-boss-ov';
  ov.innerHTML = `<div class="modal pc-bo-box" role="dialog" aria-label="Rồng trùm"><button class="pp-x" aria-label="Đóng">✕</button>
    <h3>🐉 Rồng trùm ${esc(qcChangTen(CHANG))}</h3><div class="pc-bo-arena" style="background-image:url('${Q_IMG}bg_quai.webp')">
      <div class="pc-bo-side me"><div class="pc-hp"><i style="width:100%"></i></div><img class="pc-bo-mon" src="${monImg(m)}" alt=""><b>${esc(qcMonName(m))}</b></div>
      <span class="pc-ch-shot"></span><span class="pc-bo-fire">🔥</span>
      <div class="pc-bo-side rong"><div class="pc-hp red"><i style="width:100%"></i></div><img class="pc-bo-rong" src="${Q_IMG}zoom_rong_gian.webp" alt="Rồng trùm"><b>Rồng trùm</b></div></div>
    <div class="pc-qtop"><button class="pc-say" type="button">🔊 Nghe lại</button><span class="pc-count">Câu 1</span></div><div class="pc-opts"></div><div class="pc-ans"></div></div>`;
  document.body.appendChild(ov);
  const box = ov.querySelector('.modal'), opts = ov.querySelector('.pc-opts'), ans = ov.querySelector('.pc-ans'), cnt = ov.querySelector('.pc-count'),
    rImg = ov.querySelector('.pc-bo-rong'), mImg = ov.querySelector('.pc-bo-mon'), shot = ov.querySelector('.pc-ch-shot'), fire = ov.querySelector('.pc-bo-fire'),
    hpR = ov.querySelector('.rong .pc-hp i'), hpM = ov.querySelector('.me .pc-hp i');
  ov.querySelector('.pp-x').onclick = () => { ov.remove(); viewMons(); };
  hdSay('Con nghe rồi chạm đúng tranh để quái vật tung chiêu nhé!');
  const s = shop(); s.bossTry = s.bossTry || {};
  const show = () => { const q = qs[k % qs.length]; ans.innerHTML = ''; cnt.textContent = 'Câu ' + (k + 1);
    opts.innerHTML = q.opts.map((c, i) => `<button class="pc-opt" type="button" data-i="${i}"><img src="${esc(c.img)}" alt=""></button>`).join('');
    setTimeout(() => qcSay(q), 400);
    opts.querySelectorAll('.pc-opt').forEach(b => b.onclick = () => { const c = q.opts[+b.dataset.i]; opts.querySelectorAll('.pc-opt').forEach(x => x.onclick = null);
      if (c.en === q.t.en) { b.classList.add('ok'); ans.innerHTML = qcWord(c); shot.textContent = QC_SHOT[m.sp]; qcSfx.zap(); qcFx(mImg, 'r-jump', 700);
        shot.animate([{ transform: 'translate(0,0) scale(.6)', opacity: 1 }, { transform: 'translate(420%,0) scale(1.8)', opacity: 1, offset: .85 }, { transform: 'translate(470%,0) scale(2.4)', opacity: 0 }], { duration: 750 });
        setTimeout(() => { rong--; hpR.style.width = (rong / QC.bossQ * 100) + '%'; rImg.src = Q_IMG + 'zoom_rong_choang.webp'; qcFx(rImg, 'r-hit', 600); qcSfx.boom();
          setTimeout(() => { rImg.src = Q_IMG + 'zoom_rong_gian.webp'; k++; rong <= 0 ? win() : show(); }, 1100); }, 650); }
      else { b.classList.add('no'); sfx.no(); qcFx(rImg, 'r-roar', 700);
        const okB = opts.querySelectorAll('.pc-opt')[q.opts.findIndex(x => x.en === q.t.en)]; if (okB) okB.classList.add('hint'); ans.innerHTML = qcWord(q.t); setTimeout(() => qcSay(q), 700);
        fire.animate([{ transform: 'translate(0,0) scale(.6)', opacity: 1 }, { transform: 'translate(-420%,0) scale(1.8)', opacity: 1, offset: .85 }, { transform: 'translate(-470%,0) scale(2.4)', opacity: 0 }], { duration: 750 });
        setTimeout(() => { mine--; hpM.style.width = (mine / QC.bossHp * 100) + '%'; qcFx(mImg, 'r-hit', 600);
          setTimeout(() => { k++; mine <= 0 ? lose() : show(); }, 1800); }, 650); } }); };
  ov.querySelector('.pc-say').onclick = () => qcSay(qs[k % qs.length]);
  const win = () => { s.boss = s.boss || {}; s.boss[CHANG] = Date.now(); m.c = (m.c || 0) + QC.bossE; qSave(); sfx.win(); confetti(50); hdSay('Hoan hô! Con đã hạ Rồng trùm!');
    box.innerHTML = `<h3>🏆 Con đã hạ Rồng trùm ${esc(qcChangTen(CHANG))}!</h3><div class="pc-bo-end"><img src="${Q_IMG}zoom_rong_choang.webp" alt=""><span class="pc-badge won big"><img src="${Q_IMG}huy_hieu_rong.webp" alt=""><small>${esc(qcChangNhan(CHANG))}</small></span><img src="${monImg(m)}" alt=""></div>
      <p>Con nhận <b>huy hiệu ${esc(qcChangTen(CHANG))}</b>, ${esc(qcMonName(m))} được <b>+${QC.bossE} năng lượng</b>.</p><div class="row"><button class="btn g" type="button">Tuyệt vời! 🎉</button></div>`;
    box.querySelector('.btn').onclick = () => { ov.remove(); viewMons(); }; };
  const lose = () => {
    if (!TEACHER) { const n = qcBossTries() + 1; s.bossTry[CHANG] = { d: qToday(), n }; qSave(); }
    const left = TEACHER ? 1 : QC.bossDay - qcBossTries();
    hdSay(left > 0 ? 'Rồng trùm khoẻ quá! Con nghe lại các từ rồi đánh lại nhé.' : 'Rồng trùm khoẻ quá! Con ôn bài rồi mai đánh lại nhé.');
    const on = qs.map(q => q.t);
    box.innerHTML = `<h3>😤 Rồng trùm khoẻ quá!</h3><p>Con nghe lại các từ này nhé:</p>
      <div class="pc-review">${on.map((c, i) => `<button class="pc-rv" type="button" data-i="${i}"><img src="${esc(c.img)}" alt=""><span>🔊 ${esc(c.en)}</span></button>`).join('')}</div>
      <p>${left > 0 ? `Con còn <b>${left} lượt</b> đánh hôm nay. Con làm được mà!` : `Hôm nay con đã đánh ${QC.bossDay} lượt. <b>Mai</b> con đánh lại nhé!`}</p>
      <div class="row">${left > 0 ? '<button class="btn g" type="button" id="pcAgain">⚔️ Đánh lại ngay</button>' : ''}<button class="btn y" type="button" id="pcLater">Để sau 👍</button></div>`;
    box.querySelectorAll('.pc-rv').forEach(b => b.onclick = () => { const c = on[+b.dataset.i]; voicePlay(c.ae); });
    box.querySelector('#pcLater').onclick = () => { ov.remove(); viewMons(); };
    const ag = box.querySelector('#pcAgain'); if (ag) ag.onclick = () => { ov.remove(); qcBoss(m); }; };
  show();
}
