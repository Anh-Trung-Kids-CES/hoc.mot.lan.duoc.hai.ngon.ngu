/* =====================================================================
   ĐĂNG NHẬP CỦA CON · MỞ UNIT ĐẦU (dùng chung Little Seed + Seedling) · chị quyết 16/11/2026
   1) Vào web là hiện cửa sổ đăng nhập (sau màn "Chạm để bắt đầu"):
      - Con có thẻ CES: nhập mã của con → máy hỏi PIN 4 số (tai-khoan-con.js).
      - Con chưa có PIN: nhập HỌ VÀ TÊN. Web tìm tên trong lớp; tên đã có thì hỏi lại "Có phải con là … không?",
        chưa có thì tạo tên mới cho con. Kết quả luyện tập lưu theo tên đó: đổi máy, nhập lại đúng họ tên là lấy lại bài.
        Tên đã có PIN → web hỏi PIN. Hai bạn trùng họ tên → web nhờ thêm tên ở nhà để phân biệt.
      - Máy đã đăng nhập: cửa sổ chào "Chào …!" kèm nút đổi bạn khác.
      - "Học thử" (không đăng nhập): vẫn học Unit 1, kết quả chưa lưu theo tên con.
   2) Unit đầu tiên (chặng đầu của bản đồ: tuần 1–3, ngày web 1–9) luôn mở cho mọi bạn; thứ tự mở ngày vẫn như cũ.
      Từ unit thứ hai (và reader của các unit đó) phải đăng nhập bằng mã + PIN do CES cấp. Đăng nhập bằng tên chỉ mở Unit 1.
      Chưa đủ → thông báo nhập mã, hoặc liên hệ CES qua hotline để lấy mã và PIN.
   - Cô giáo (?gv=1) và bản xem thử không có máy chủ: mở hết, không hỏi đăng nhập.
   - Chạy SAU các file *-bai-moi.js, *-reader.js (thay viewDay, viewReader). Cần máy chủ bản 6 (lệnh ten).
   ===================================================================== */
(function () {
  const HOTLINE = '0974.840.845', TEL = 'tel:0974840845';
  const first = (SD.map && SD.map[0]) || { items: [] };
  const FREE_DAYS = new Set(first.items.filter(x => x[0] === 'day').map(x => +x[1]));
  const FREE_UNITS = new Set([...FREE_DAYS].map(n => SD.days[n] && String(SD.days[n].unit)).filter(Boolean));
  const DN = KEY + '-dang-nhap';   // { id, cach: 'ma' (mã/PIN của CES) | 'ten' (họ tên tự nhập), ten }
  const getDn = () => { try { const v = sget(DN, null); return typeof v === 'string' ? (v ? { id: v, cach: 'ma' } : {}) : (v || {}); } catch (e) { return {}; } };
  const setDn = o => { try { sset(DN, o || {}); } catch (e) {} };
  const isGV = () => { try { return !!GV; } catch (e) { return false; } };
  const on = () => API_ON && !isGV();

  /* đã đăng nhập trên máy này (bất kỳ cách nào) */
  function signedIn() { const d = getDn(); return !!d.id && d.id === (P.kidId || ''); }
  /* đủ quyền học từ Unit 2: mã + PIN của CES */
  function loggedIn() { if (!on()) return true; const d = getDn(); return signedIn() && d.cach === 'ma'; }

  /* hỏi máy chủ bằng mã (nếu con có PIN, tai-khoan-con.js tự hiện ô nhập PIN) */
  async function verify(id) {
    if (!id) return { ok: false };
    const r = await api({ action: 'kid', id });
    if (r && r.ok && r.kid) return { ok: true, kid: r.kid };
    if (r && r.ok && !r.kid) return { ok: false, err: 'Chưa tìm thấy mã này. Ba mẹ kiểm tra lại thẻ của con nhé.' };
    if (r && r.net) return { ok: false, net: true, err: 'Chưa nối được máy chủ. Kiểm tra mạng rồi thử lại nhé.' };
    if (r && (r.need === 'pin' || r.need === 'duyet')) return { ok: false, err: r.need === 'duyet' ? 'Máy này đang chờ cô duyệt.' : 'Con cần nhập PIN 4 số để học ở máy này.' };
    return { ok: false, err: (r && r.err) || 'Chưa đăng nhập được, thử lại nhé.' };
  }
  /* nhận một bạn vào máy này. Bài con vừa học thử / học bằng tên đi theo con sang mã mới, không mất. */
  function useKid(id, ten, cach) {
    const d = getDn(), carry = (!P.kidId || (d.cach === 'ten' && d.id === P.kidId && cach === 'ma')) ? clPack(P) : null;
    if (P.kidId !== id) clSwitch(id);
    if (carry && P.kidId === id) { const m = clMerge(clPack(P), carry); m.kidId = id; m._sv = P._sv; P = m; }
    if (ten) P.name = ten;
    P.kidId = id; clStore(); setDn({ id, cach, ten: ten || P.name || '' });
    try { const nm = document.getElementById('sdName'); if (nm && P.name) nm.textContent = P.name; if (window.lsTen) lsTen(); } catch (e) {}
    try { clPull().then(() => coSync(true)); } catch (e) {}
  }

  /* ---------- giao diện ---------- */
  function css() {
    if (document.getElementById('mu-css')) return; const s = document.createElement('style'); s.id = 'mu-css';
    s.textContent = `.mu-ov{position:fixed;inset:0;z-index:99990;background:rgba(40,30,10,.55);display:flex;align-items:center;justify-content:center;padding:16px}
.mu-box{background:#fff;border:4px solid #1FA5A0;border-radius:22px;max-width:380px;width:100%;padding:20px 18px;text-align:center;box-shadow:0 14px 40px rgba(0,0,0,.3);font-family:inherit;max-height:92vh;overflow:auto}
.mu-box h3{margin:0 0 6px;font-size:20px;line-height:1.3}.mu-box p{margin:6px 0;font-size:14px;line-height:1.5}
.mu-hi{width:84px;height:84px;object-fit:contain;display:block;margin:-6px auto 2px}
.mu-in{font-size:20px;text-align:center;width:100%;box-sizing:border-box;border:3px solid #ccc;border-radius:14px;padding:10px;margin:8px 0 2px}.mu-in.ma{letter-spacing:3px;text-transform:uppercase}
.mu-btn{display:block;width:100%;margin-top:8px;border:0;border-radius:14px;padding:12px;font-size:16px;font-weight:800;background:#1FA5A0;color:#fff;cursor:pointer;text-decoration:none;box-sizing:border-box;line-height:1.3}
.mu-btn small{display:block;font-weight:500;font-size:12.5px;opacity:.92}
.mu-btn.pin{background:#F28C00}.mu-btn.call{background:#E3262E}.mu-btn.o{background:#fff;color:#555;border:2px solid #ddd;font-weight:600}.mu-btn.who{background:#EAF7F6;color:#155E5B;border:2px solid #1FA5A0}
.mu-link{background:none;border:0;color:#666;text-decoration:underline;font-size:13.5px;margin-top:10px;cursor:pointer}
.mu-err{color:#C0392B;font-weight:700;min-height:1.3em;font-size:14px}
.mu-hot{background:#FFF8E6;border:2px dashed #F5D58A;border-radius:14px;padding:8px 10px;margin-top:12px;font-size:13.5px}.mu-hot a{color:#E3262E;font-weight:800;text-decoration:none}`;
    document.head.appendChild(s);
  }
  let ov = null;
  const close = () => { if (ov) { ov.remove(); ov = null; } };
  const hot = `<div class="mu-hot">Chưa có thẻ hoặc quên PIN? Ba mẹ liên hệ <b>CES</b>:<br><a href="${TEL}">📞 Hotline ${HOTLINE}</a></div>`;
  const AVA = '../seedling/tai-nguyen/nhan-vat/huou_huou1_a.webp';
  function box(html, kind) {
    css(); close(); ov = document.createElement('div'); ov.className = 'mu-ov'; ov.dataset.h = location.hash; ov.dataset.kind = kind || '';
    ov.innerHTML = `<div class="mu-box" role="dialog" aria-modal="true">${html}</div>`; document.body.appendChild(ov); return ov;
  }
  const $ = s => ov && ov.querySelector(s);
  const err = t => { const e = $('#muErr'); if (e) e.textContent = t || ''; };
  const busy = (b, on) => { if (b) b.disabled = !!on; };

  /* cửa sổ khi vào web */
  function welcome(done) {
    done = done || (() => {});
    const d = getDn();
    if (signedIn()) {
      const o = box(`<img class="mu-hi" src="${AVA}" alt=""><h3>👋 Chào ${esc(P.name || d.ten || 'con')}!</h3>
        <p>Cô Hươu ghi nhận bài luyện tập của con hôm nay nhé.</p>${d.cach === 'ten' ? '<p style="color:#8a6d1a">Con đang học bằng tên. Từ Unit 2, con cần thẻ có mã và PIN của CES.</p>' : ''}
        <button class="mu-btn" id="muGo" type="button">▶ Vào học</button>
        <button class="mu-link" id="muOther" type="button">Không phải ${esc(P.name || d.ten || 'con')}? Đăng nhập bạn khác</button>`, 'chao');
      o.querySelector('#muGo').onclick = () => { close(); done(); };
      o.querySelector('#muOther').onclick = () => choose(done);
      return;
    }
    choose(done);
  }
  function choose(done, why) {
    const o = box(`<img class="mu-hi" src="${AVA}" alt=""><h3>Con đăng nhập để cô ghi nhận bài luyện tập nhé!</h3>
      ${why ? `<p><b>${esc(why)}</b></p>` : '<p>Bài con học, sao con nhận sẽ lưu theo con, đổi máy cũng không mất.</p>'}
      <button class="mu-btn pin" id="muPin" type="button">🔐 Con có mã PIN<small>Thẻ do CES cấp</small></button>
      <button class="mu-btn" id="muTen" type="button">✏️ Con chưa có PIN<small>Nhập họ và tên của con</small></button>
      ${hot}<button class="mu-link" id="muSkip" type="button">Học thử, chưa đăng nhập</button>`, 'chon');
    o.querySelector('#muPin').onclick = () => byCode(done);
    o.querySelector('#muTen').onclick = () => byName(done);
    o.querySelector('#muSkip').onclick = () => { close(); try { toast('Con đang học thử: bài chưa lưu theo tên con.'); } catch (e) {} done(false); };
  }

  /* đăng nhập bằng mã (+ PIN nếu con có) */
  function byCode(done, why, back) {
    const id0 = (getDn().cach === 'ma' && P.kidId) || '';
    const o = box(`<h3>🔐 Nhập mã của con</h3>${why ? `<p>${why}</p>` : '<p>Mã in trên thẻ CES (ví dụ <b>ZTK2A7</b>). Sau đó web hỏi PIN 4 số.</p>'}
      <input class="mu-in ma" id="muId" type="text" autocomplete="off" maxlength="12" placeholder="Mã của con" aria-label="Mã của con" value="${esc(id0)}">
      <div class="mu-err" id="muErr"></div><button class="mu-btn pin" id="muOk" type="button">Đăng nhập</button>
      ${hot}<button class="mu-btn o" id="muBack" type="button">${back ? esc(back[0]) : '← Quay lại'}</button>`, 'ma');
    const inp = o.querySelector('#muId'), okB = o.querySelector('#muOk'); setTimeout(() => inp.focus(), 60);
    const go = async () => {
      const v = inp.value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (v.length < 4) return err('Ba mẹ nhập mã in trên thẻ của con nhé.');
      busy(okB, 1); err('Đang kiểm tra…'); close();   // để ô nhập PIN (nếu có) hiện rõ
      const r = await verify(v);   // kiểm mã trước khi đổi tiến độ trên máy: gõ nhầm mã không làm mất bài
      if (r.ok) { useKid(v, r.kid && r.kid.ten, 'ma'); try { toast(`Chào ${(r.kid && r.kid.ten) || 'con'}! Web đang lấy bài và sao của con…`); } catch (e) {} return done(true); }
      byCode(done, why, back); err(r.err);
    };
    okB.onclick = go; inp.onkeydown = e => { if (e.key === 'Enter') go(); };
    o.querySelector('#muBack').onclick = () => back ? back[1]() : choose(done);
  }

  /* đăng nhập bằng họ tên */
  const ten = q => api(Object.assign({ action: 'ten' }, q)).then(r => (r && r.err === 'Lệnh không rõ')
    ? { ok: false, err: 'Web đang được cô nâng cấp phần đăng nhập bằng tên. Con bấm "Học thử" trước, lát nữa thử lại nhé.' } : r);
  function byName(done, msg, val) {
    const o = box(`<h3>✏️ Họ và tên của con</h3><p>Nhập <b>cả họ và tên</b>, ví dụ <b>Nguyễn Minh An</b>. Lần sau ở máy khác, con nhập đúng tên này là lấy lại bài.</p>
      <input class="mu-in" id="muName" type="text" autocomplete="off" maxlength="40" placeholder="Họ và tên" aria-label="Họ và tên của con" value="${esc(val || '')}">
      <div class="mu-err" id="muErr">${esc(msg || '')}</div><button class="mu-btn" id="muOk" type="button">Tiếp tục</button>
      <button class="mu-btn o" id="muBack" type="button">← Quay lại</button>`, 'ten');
    const inp = o.querySelector('#muName'), okB = o.querySelector('#muOk'); setTimeout(() => inp.focus(), 60);
    const go = async () => {
      const v = inp.value.replace(/\s+/g, ' ').trim();
      if (v.split(' ').length < 2 || v.length < 3) return err('Con nhập cả họ và tên nhé, ví dụ: Nguyễn Minh An.');
      busy(okB, 1); err('Đang tìm tên của con…');
      const r = await ten({ ten: v }); busy(okB, 0);
      if (!r || !r.ok) return err((r && r.err) || 'Chưa nối được máy chủ. Kiểm tra mạng rồi thử lại nhé.');
      if (!r.tim.length) return confirmNew(done, v);
      pick(done, v, r.tim, r.dung);
    };
    okB.onclick = go; inp.onkeydown = e => { if (e.key === 'Enter') go(); };
    o.querySelector('#muBack').onclick = () => choose(done);
  }
  function pick(done, v, list, exact) {
    const o = box(`<h3>Có phải con là…?</h3><p>Web đã có ${list.length > 1 ? 'các tên' : 'tên'} này trong lớp:</p>
      ${list.map((k, i) => `<button class="mu-btn who" type="button" data-muk="${i}">👦👧 ${esc(k.ten)}${k.pin ? '<small>🔐 Bạn này có PIN</small>' : ''}</button>`).join('')}
      <div class="mu-err" id="muErr"></div>
      <button class="mu-btn o" id="muNo" type="button">Không phải con</button>`, 'chon-ten');
    o.querySelectorAll('[data-muk]').forEach(b => b.onclick = async () => {
      const k = list[+b.dataset.muk];
      if (k.pin) {   // tên đã có PIN: phải nhập PIN mới vào được
        close(); const r = await verify(k.id);
        if (r.ok) { useKid(k.id, k.ten, 'ma'); try { toast(`Chào ${k.ten}! Web đang lấy bài của con…`); } catch (e) {} return done(true); }
        pick(done, v, list, exact); return err(r.err);
      }
      useKid(k.id, k.ten, 'ten'); close(); try { toast(`Chào ${k.ten}! Web đang lấy bài của con…`); } catch (e) {} done(true);
    });
    o.querySelector('#muNo').onclick = () => exact
      ? byName(done, 'Lớp đã có bạn trùng họ tên này. Con thêm tên ở nhà vào sau, ví dụ: Nguyễn Minh An Bin.', v + ' ')
      : confirmNew(done, v, true);
  }
  function confirmNew(done, v, ep) {
    const o = box(`<h3>Chào bạn mới! 🌱</h3><p>Web chưa có tên <b>${esc(v)}</b>. Con là bạn mới phải không?</p>
      <div class="mu-err" id="muErr"></div><button class="mu-btn" id="muYes" type="button">Đúng rồi, lưu tên cho con</button>
      <button class="mu-btn o" id="muRe" type="button">Gõ lại tên</button>`, 'moi');
    const yes = o.querySelector('#muYes');
    yes.onclick = async () => {
      busy(yes, 1); err('Đang lưu tên…');
      const r = await ten({ ten: v, tao: '1', ep: ep ? '1' : '' }); busy(yes, 0);
      if (!r || !r.ok) return err((r && r.err) || 'Chưa nối được máy chủ. Kiểm tra mạng rồi thử lại nhé.');
      if (!r.id) return pick(done, v, r.tim || [], r.dung);   // vừa có bạn khác lưu cùng tên
      useKid(r.id, r.ten, 'ten'); close(); try { toast(`Đã lưu tên ${r.ten}. Học vui nhé!`); } catch (e) {} done(true);
    };
    o.querySelector('#muRe').onclick = () => byName(done, '', v);
  }

  /* thông báo khi mở ngày/reader từ unit thứ hai mà chưa có mã + PIN */
  function gate(then, why) {
    try { sfx.no(); } catch (e) {}
    const byTen = signedIn() && getDn().cach === 'ten';
    byCode(() => then(), `<b>Unit 1</b> mở cho mọi bạn. Từ <b>${esc(why || 'unit này')}</b> trở đi, con cần <b>mã của con</b> và <b>PIN</b> do CES cấp${byTen ? ' (đăng nhập bằng tên chỉ học được Unit 1)' : ''}.`,
      ['Về Unit 1', () => { close(); location.hash = '#/ban-do/' + (first.key || ''); }]);
    const h = $('h3'); if (h) h.textContent = '🔐 Ba mẹ đăng nhập để con học tiếp nhé';
  }
  /* đã có mã CES trên máy nhưng chưa xác nhận (vd. ba mẹ nhập mã ở nút ❓) → hỏi máy chủ trước */
  async function need(then, why) {
    if (loggedIn()) return then();
    const id = P.kidId || '', d = getDn();
    if (id && !(d.id === id && d.cach === 'ten')) {
      const r = await verify(id); if (r.ok) { setDn({ id, cach: 'ma', ten: (r.kid && r.kid.ten) || P.name || '' }); return then(); }
      if (r.net) { try { toast('Chưa nối được máy chủ 📶 Kiểm tra mạng rồi mở lại ngày này nhé.'); } catch (e) {} location.hash = '#/ban-do'; return; }
    }
    gate(then, why);
  }

  /* ---------- chặn ngày web và reader ngoài unit đầu ---------- */
  const unitName = d => (d && d.unit !== 'Ôn') ? 'Unit ' + d.unit : 'phần ôn tập';
  const _viewDay = viewDay;
  viewDay = function (n, sub) {
    if (FREE_DAYS.has(+n) || loggedIn() || !SD.days[n] || (typeof dayOpen === 'function' && !dayOpen(+n))) return _viewDay(n, sub);
    try { stopAll(); } catch (e) {}
    const here = location.hash;
    need(() => { if (location.hash === here) _viewDay(n, sub); else location.hash = here; }, unitName(SD.days[n]));
  };
  if (typeof viewReader === 'function') {
    const _viewReader = viewReader;
    viewReader = function (u, i) {
      if (FREE_UNITS.has(String(u)) || loggedIn()) return _viewReader(u, i);
      const here = location.hash;
      need(() => { if (location.hash === here) _viewReader(u, i); else location.hash = here; }, 'Unit ' + u);
    };
  }
  window.addEventListener('hashchange', () => { if (ov && ov.dataset.h !== location.hash && ov.dataset.kind === 'ma') close(); });

  /* ---------- vào web: chờ con chạm "bắt đầu" rồi hiện cửa sổ đăng nhập ---------- */
  function start() {
    if (!on()) return;
    if (ov) return;   // đang có thông báo khác (vd. mở thẳng một ngày bị khoá)
    welcome();
  }
  (function waitSplash(t) {
    if (!document.querySelector('.splash')) return setTimeout(start, 250);
    if (t > 3600) return;   // ~30 phút không chạm thì thôi
    setTimeout(() => waitSplash(t + 1), 500);
  })(0);
  /* máy đã đăng nhập bằng mã: thầm kiểm lại (cô đổi PIN, gỡ máy…) */
  if (on() && getDn().cach === 'ma' && getDn().id === P.kidId) setTimeout(() => { api({ action: 'kid', id: P.kidId }).then(r => { if (r && r.need) setDn({}); }); }, 4000);

  window.MoUnitDau = { loggedIn, signedIn, FREE_DAYS, FREE_UNITS, HOTLINE, welcome };
  if (/^#\/(ngay|reader)\//.test(location.hash) && !document.querySelector('.splash')) route();
})();
