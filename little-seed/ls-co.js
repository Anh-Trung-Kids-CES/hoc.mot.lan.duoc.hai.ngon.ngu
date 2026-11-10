/* =====================================================================
   LITTLE SEED (bản chép từ web Seedling) · BẢNG CỦA CÔ (#/co) – cô thưởng sao ở lớp, duyệt quà, thêm học sinh.
   Sao cô thưởng ghi vào Google Sheet (tab "Thưởng"), web của con tự lấy về và cộng vào ví.
   Bản xem thử (chưa có SDL_API): dữ liệu nằm trên máy này, mã PIN 2468, có 3 bạn ví dụ.
   ===================================================================== */
const CO_WHY = ['Phát biểu hăng hái', 'Nói được cả hai tiếng', 'Giúp đỡ bạn', 'Đi học đầy đủ, đúng giờ', 'Làm bài web đều đặn', 'Hát và vận động sôi nổi', 'Ngồi học ngoan'];
const CO_N = [1, 2, 3, 5, 10];
let CO = { pin: '', data: null, sel: new Set(), n: 3, why: CO_WHY[0], tab: 'thuong', msg: '' };
try { CO.pin = sessionStorage.getItem('lsd-co-pin') || ''; } catch (e) {}

function coFrame(body) { document.body.classList.add('hub'); setActive('');
  app.innerHTML = `<div class="screen qscr coscr"><div class="q-top"><span class="q-back">🍎</span><h2>Bảng của cô · Lớp Little Seed</h2>
    <span class="co-conn ${API_ON ? 'on' : ''}">${API_ON ? '🟢 Đã nối Google Sheet' : '🧪 Bản xem thử · dữ liệu trên máy này'}</span></div><div class="co-body">${body}</div></div>`; }
async function coLoad() { const r = await api({ action: 'cls', pin: CO.pin }); if (!r.ok) { CO.data = null; return r; } CO.data = r; return r; }

async function viewCo() {
  if (!CO.pin) return coLogin();
  coFrame('<p class="sx-demo">Đang tải lớp…</p>');
  const r = await coLoad(); if (!r.ok) { if (!r.net) { CO.pin = ''; try { sessionStorage.removeItem('lsd-co-pin'); } catch (e) {} } return coLogin(r.err); }
  coDraw();
}
function coLogin(err) {
  coFrame(`<div class="co-login"><img src="../seedling/tai-nguyen/nhan-vat/huou_huou2_a.webp" alt=""><div><h3>Cô nhập mã PIN của lớp</h3>
    <p>${API_ON ? 'Mã PIN của lớp nằm ở tab CaiDat trong Sheet quản lý.' : 'Bản xem thử: mã PIN là <b>2468</b>.'}</p>${err ? `<p class="co-err">${esc(err)}</p>` : ''}
    <div class="row"><input id="coPin" class="q-gate-in" type="password" inputmode="numeric" autocomplete="off" aria-label="Mã PIN"><button class="btn g" id="coPinOk" type="button">Vào bảng</button></div></div></div>`);
  const inp = document.getElementById('coPin'), go = () => { CO.pin = inp.value.trim(); try { sessionStorage.setItem('lsd-co-pin', CO.pin); } catch (e) {} viewCo(); };
  document.getElementById('coPinOk').onclick = go; inp.onkeydown = e => { if (e.key === 'Enter') go(); }; setTimeout(() => inp.focus(), 50);
}
function coKidStars(k) { const aw = CO.data.awards.filter(a => a.kid === k.id && !a.huy).reduce((s, a) => s + (+a.n || 0), 0); return { co: aw, all: (+k.web || 0) + aw }; }
function coAgo(d) { if (!d) return 'chưa học'; const n = daysSince(d); return n <= 0 ? 'hôm nay' : n === 1 ? 'hôm qua' : `${n} ngày trước`; }

function coDraw() {
  const D = CO.data, kids = D.kids.slice().sort((a, b) => String(a.ten).localeCompare(String(b.ten), 'vi')), pend = D.orders.filter(o => o.st === 'cho');
  const nameOf = id => (D.kids.find(k => k.id === id) || {}).ten || id;
  const rows = kids.map(k => { const st = coKidStars(k), on = CO.sel.has(k.id), late = daysSince(k.cuoi) >= 3;
    return `<label class="co-kid ${on ? 'on' : ''}"><input type="checkbox" data-id="${esc(k.id)}" ${on ? 'checked' : ''}>
      <span class="co-nm"><b>${esc(k.ten)}</b><small>Mã ${esc(k.id)}</small></span>
      <span class="co-num"><b>⭐ ${st.all}</b><small>cô thưởng ${st.co}</small></span>
      <span class="co-num"><b>${+k.ngay || 0}</b><small>ngày web</small></span>
      <span class="co-last ${late ? 'late' : ''}">${coAgo(k.cuoi)}</span><button class="ls-b co-lk" data-lk="${esc(k.id)}" data-nm="${esc(k.ten)}" type="button" title="Chép link của con để gửi lại cho ba mẹ (khi con đổi máy)">🔗 Link</button></label>`; }).join('');
  const tabs = [['thuong', '⭐ Thưởng sao'], ['qua', `🎁 Quà chờ duyệt${pend.length ? ` (${pend.length})` : ''}`], ['them', '➕ Thêm học sinh']];
  let panel = '';
  if (CO.tab === 'thuong') {
    const recent = D.awards.filter(a => !a.huy).slice(0, 12);
    panel = `<h4>Thưởng sao cho <b>${CO.sel.size}</b> bạn đã chọn</h4>
      <div class="co-chips">${CO_N.map(n => `<button class="co-chip n ${CO.n === n ? 'on' : ''}" data-n="${n}" type="button">+${n} ⭐</button>`).join('')}</div>
      <div class="co-chips">${CO_WHY.map(w => `<button class="co-chip ${CO.why === w ? 'on' : ''}" data-w="${esc(w)}" type="button">${esc(w)}</button>`).join('')}</div>
      <label class="co-lb" for="coWhy">Lời khen con sẽ đọc thấy</label><input id="coWhy" class="co-in" value="${esc(CO.why)}" maxlength="80">
      <button class="btn g co-go" id="coGive" type="button" ${CO.sel.size ? '' : 'disabled'}>Thưởng +${CO.n} ⭐ cho ${CO.sel.size} bạn</button>
      ${CO.msg ? `<p class="co-ok">${esc(CO.msg)}</p>` : ''}
      <h4>Vừa thưởng</h4><ul class="co-list">${recent.length ? recent.map(a => `<li><span><b>${esc(nameOf(a.kid))}</b> · +${a.n} ⭐ · ${esc(a.why)}<small>${new Date(+a.at || Date.parse(a.at)).toLocaleString('vi-VN')}</small></span><button class="ls-b" data-un="${esc(a.id)}" type="button">Huỷ</button></li>`).join('') : '<li class="none">Chưa có lượt thưởng nào.</li>'}</ul>`;
  } else if (CO.tab === 'qua') {
    panel = `<h4>Quà con đã đổi bằng sao</h4><ul class="co-list">${D.orders.length ? D.orders.map(o => `<li><img src="${Q_IMG}gift_${esc(o.qua)}.webp" alt=""><span><b>${esc(o.ten || nameOf(o.kid))}</b> · ${esc(o.ten_qua)} · ${o.sao} ⭐<small>${esc(o.code)} · ${new Date(+o.at || Date.parse(o.at)).toLocaleDateString('vi-VN')}</small></span>
        ${o.st === 'cho' ? `<button class="btn g sm" data-o="${esc(o.code)}" data-st="da_trao" type="button">Đã trao</button><button class="ls-b" data-o="${esc(o.code)}" data-st="tu_choi" type="button">Không duyệt</button>` : `<em class="co-st ${o.st}">${o.st === 'da_trao' ? 'Đã trao' : 'Không duyệt · đã hoàn sao'}</em>`}</li>`).join('') : '<li class="none">Chưa bạn nào đổi quà.</li>'}</ul>
      <p class="q-hint">Bấm "Không duyệt" thì web của con tự hoàn sao vào ví ở lần mở sau.</p>`;
  } else {
    panel = `<h4>Thêm học sinh vào lớp</h4><div class="row"><input id="coNew" class="co-in" placeholder="Tên của con, ví dụ: Minh An" maxlength="40"><button class="btn g" id="coAdd" type="button">Thêm</button></div>
      ${CO.newLink ? `<div class="co-link"><b>Gửi đường link này cho ba mẹ ${esc(CO.newLink.ten)}:</b><input class="co-in" id="coLinkTx" readonly value="${esc(CO.newLink.url)}"><button class="btn y sm" id="coCopy" type="button">Chép link</button><small>Ba mẹ mở link một lần trên máy của con. Hoặc nhập mã <b>${esc(CO.newLink.id)}</b> ở mục Ba mẹ.</small></div>` : ''}
      <p class="q-hint">Mỗi con có một mã riêng. Web dùng mã này để lưu bài con đã học lên lớp, nhận sao cô thưởng và gửi yêu cầu đổi quà. Con đổi máy thì cô bấm 🔗 Link cạnh tên con để gửi lại cho ba mẹ.</p>`;
  }
  coFrame(`<section class="co-left"><div class="co-lh"><h4>Lớp có ${kids.length} bạn</h4><button class="ls-b" id="coAll" type="button">${CO.sel.size === kids.length && kids.length ? 'Bỏ chọn' : 'Chọn cả lớp'}</button><button class="ls-b" id="coRe" type="button">↻ Tải lại</button></div>
      <div class="co-kids">${rows || '<p class="sx-demo">Lớp chưa có học sinh. Cô thêm ở thẻ "Thêm học sinh".</p>'}</div>
      <p class="q-hint">Viền cam: bạn đã 3 ngày chưa học web.</p></section>
    <section class="co-right"><div class="q-tabs">${tabs.map(([k, n]) => `<button class="${CO.tab === k ? 'on' : ''}" data-t="${k}" type="button">${n}</button>`).join('')}</div><div class="co-panel">${panel}</div></section>`);
  CO.msg = '';
  app.querySelectorAll('.co-kid input').forEach(c => c.onchange = () => { c.checked ? CO.sel.add(c.dataset.id) : CO.sel.delete(c.dataset.id); coDraw(); });
  app.querySelectorAll('[data-lk]').forEach(b => b.onclick = e => { e.preventDefault(); e.stopPropagation();
    const url = location.href.split(/[?#]/)[0] + '?con=' + b.dataset.lk, done = () => toast('Đã chép link của ' + b.dataset.nm + '. Cô dán vào Zalo gửi ba mẹ.');
    try { navigator.clipboard.writeText(url).then(done, () => prompt('Cô chép link này gửi ba mẹ:', url)); } catch (x) { prompt('Cô chép link này gửi ba mẹ:', url); } });
  document.getElementById('coAll').onclick = () => { if (CO.sel.size === kids.length) CO.sel.clear(); else kids.forEach(k => CO.sel.add(k.id)); coDraw(); };
  document.getElementById('coRe').onclick = async () => { await coLoad(); coDraw(); };
  app.querySelectorAll('.q-tabs button').forEach(b => b.onclick = () => { CO.tab = b.dataset.t; coDraw(); });
  app.querySelectorAll('[data-n]').forEach(b => b.onclick = () => { CO.n = +b.dataset.n; coDraw(); });
  app.querySelectorAll('[data-w]').forEach(b => b.onclick = () => { CO.why = b.dataset.w; coDraw(); });
  const wi = document.getElementById('coWhy'); if (wi) wi.oninput = () => { CO.why = wi.value; };
  const give = document.getElementById('coGive');
  if (give) give.onclick = async () => { give.disabled = true; const ids = [...CO.sel], why = (CO.why || '').trim() || 'Cô thưởng con';
    const r = await api({ action: 'award', pin: CO.pin, ids: ids.join(','), n: CO.n, why }); if (!r.ok) { toast(r.err || 'Chưa thưởng được'); give.disabled = false; return; }
    sfx.coin(); CO.msg = `Đã thưởng +${CO.n} ⭐ cho ${ids.length} bạn: ${why}. Web của con nhận sao ở lần mở tới.`; CO.sel.clear(); await coLoad(); coDraw(); };
  app.querySelectorAll('[data-un]').forEach(b => b.onclick = async () => { await api({ action: 'unaward', pin: CO.pin, aid: b.dataset.un }); await coLoad(); coDraw(); toast('Đã huỷ lượt thưởng'); });
  app.querySelectorAll('[data-o]').forEach(b => b.onclick = async () => { await api({ action: 'order', pin: CO.pin, code: b.dataset.o, st: b.dataset.st }); await coLoad(); coDraw(); toast(b.dataset.st === 'da_trao' ? 'Đã ghi: cô đã trao quà' : 'Đã ghi: không duyệt, sao được hoàn cho con'); });
  const add = document.getElementById('coAdd');
  if (add) { const inp = document.getElementById('coNew'); const go = async () => { const ten = inp.value.trim(); if (!ten) return inp.focus();
      const r = await api({ action: 'addkid', pin: CO.pin, ten }); if (!r.ok) return toast(r.err || 'Chưa thêm được');
      CO.newLink = { id: r.id, ten, url: location.href.split(/[?#]/)[0] + '?con=' + r.id }; await coLoad(); coDraw(); };
    add.onclick = go; inp.onkeydown = e => { if (e.key === 'Enter') go(); }; }
  const cp = document.getElementById('coCopy');
  if (cp) cp.onclick = () => { const t = document.getElementById('coLinkTx'); try { navigator.clipboard.writeText(t.value).then(() => toast('Đã chép link'), () => { t.select(); toast('Cô bấm giữ để chép link'); }); } catch (e) { t.select(); } };
}
