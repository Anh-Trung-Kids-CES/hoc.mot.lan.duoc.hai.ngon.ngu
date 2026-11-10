/* =====================================================================
   LITTLE SEED (bản chép từ web Seedling) · READER – truyện tranh của unit, đọc thêm ở nhà (không bắt buộc, không tính bài).
   Mỗi trang 1 cảnh: chạm câu tiếng Anh hay tiếng Trung để nghe; "Tự đọc" đọc từng trang rồi tự lật.
   Chữ Hán hiện trước, pinyin hiện sau một nhịp. Bản in A5 dùng đúng các trang này.
   ===================================================================== */
let RDR = { u: '1', i: 0, auto: '' };
function viewReader(u, i) {
  const R = (SD.reader || {})[u]; if (!R) return viewHome();
  document.body.classList.add('hub'); setActive('rd'); stopAll();
  RDR.u = u; RDR.i = Math.max(0, Math.min(R.pages.length - 1, i || 0));
  const pg = R.pages[RDR.i], W = SD.who[pg.who] || ['', ''], n = R.pages.length;
  app.innerHTML = `<div class="screen qscr rdscr"><div class="q-top"><span class="q-back">📚</span><h2>Reader · ${esc(R.t)} <span class="zh" style="color:#C9302C">${esc(R.zh)}</span></h2>
      <div class="rd-auto"><button class="rd-ab ${RDR.auto === 'en' ? 'on' : ''}" data-a="en" type="button">▶ Tự đọc English</button><button class="rd-ab zh ${RDR.auto === 'zh' ? 'on' : ''}" data-a="zh" type="button">▶ 自动读 中文</button></div></div>
    <div class="rd-book"><div class="rd-pic"><img src="${esc(pg.img)}" alt=""><span class="rd-part">Part ${pg.part} · ${RDR.i + 1}/${n}</span></div>
      <div class="rd-tx">${W[0] ? `<span class="rd-who">${W[1] ? `<img src="${esc(W[1])}" alt="">` : ''}${esc(W[0])}</span>` : ''}
        <button class="rd-line en" id="rdEn" type="button"><i>🔊</i>${esc(pg.en)}</button>
        <button class="rd-line zh" id="rdZh" type="button"><i>🔊</i><span><b class="zh">${esc(pg.zh)}</b><small class="sx-pyl" data-later>${esc(pg.py)}</small></span></button>
        <div class="rd-nav"><button class="btn y" id="rdPrev" type="button" ${RDR.i ? '' : 'disabled'}>← Trang trước</button><button class="btn g" id="rdNext" type="button">${RDR.i < n - 1 ? 'Trang sau →' : '✓ Hết truyện'}</button></div>
      </div></div>
    <div class="rd-dots">${R.pages.map((_, k) => `<button class="${k === RDR.i ? 'on' : ''}" data-k="${k}" type="button" aria-label="Trang ${k + 1}"></button>`).join('')}</div></div>`;
  revealPy(app, 900);
  const play = l => { stopAll(); const b = document.getElementById(l === 'en' ? 'rdEn' : 'rdZh'); b.classList.add('talk'); return say(l === 'en' ? en(pg.en, pg.a_en) : zh(pg.zh, pg.a_zh)).then(() => b.classList.remove('talk')); };
  document.getElementById('rdEn').onclick = () => { RDR.auto = ''; play('en'); };
  document.getElementById('rdZh').onclick = () => { RDR.auto = ''; play('zh'); };
  const go = k => { stopAll(); location.hash = `#/reader/${u}/${k + 1}`; };
  document.getElementById('rdPrev').onclick = () => { RDR.auto = ''; go(RDR.i - 1); };
  document.getElementById('rdNext').onclick = () => { RDR.auto = ''; if (RDR.i < n - 1) go(RDR.i + 1); else { sfx.win(); confetti(20); toast('Con đọc hết truyện rồi!'); } };
  app.querySelectorAll('.rd-dots button').forEach(b => b.onclick = () => { RDR.auto = ''; go(+b.dataset.k); });
  app.querySelectorAll('.rd-ab').forEach(b => b.onclick = () => { const a = b.dataset.a; RDR.auto = RDR.auto === a ? '' : a; if (RDR.auto) { if (RDR.i === n - 1 && i) go(0); else viewReader(u, RDR.i); } else { stopAll(); viewReader(u, RDR.i); } });
  if (RDR.auto) { const my = RUN; (async () => { await wait(400); await play(RDR.auto); if (my !== RUN || !RDR.auto) return; await wait(900); if (my !== RUN || !RDR.auto) return;
    if (RDR.i < n - 1) go(RDR.i + 1); else { RDR.auto = ''; sfx.win(); confetti(20); viewReader(u, RDR.i); } })(); }
}
