// Kiểm thử luật HỎI – ĐÁP – HIỆN TRANH (23/11/2026) trong jsdom: kế hoạch 4 câu mọi ngày × 2 khoá, một lượt chơi trọn
// (Leo 4 câu → Xiaomei 4 câu → album → Phép thưởng → sao), thang gợi ý, chấm theo ý, đổi ý, chữ đồng âm tiếng Trung, nhầm thứ tiếng.
// Chạy: NODE_PATH=<thư mục có jsdom> node choi.js
const { ok, boot, D, report } = require('./chay.js');
const tick = (ms = 5) => new Promise(r => setTimeout(r, ms));
function fast(w, k = 0.01) { const o = w.setTimeout.bind(w); w.setTimeout = (f, ms, ...a) => o(f, Math.min((ms || 0) * k, 30), ...a); }
const errors = [];
function trap(w) { w.addEventListener('error', e => errors.push(String(e.message || e.error))); w.onunhandledrejection = e => errors.push('reject ' + e.reason); }
async function waitFor(fn, ms = 4000) { const t0 = Date.now(); while (Date.now() - t0 < ms) { const v = fn(); if (v) return v; await tick(5); } return null; }

(async () => {
  // ---- A. kế hoạch câu hỏi mọi ngày ----
  for (const course of ['LS', 'SD']) {
    const w = boot(course, 1); const G = w.PT_GAME; const bad = [];
    for (let d = 1; d <= 99; d++) {
      w.PT_TEST.day = d; G.open(); const st = G.state(); const T = st.G.turns, learned = G.learnedBefore(d).map(x => course + x), u = G.unitOf(d);
      if (T.length !== 4) bad.push(`ngày ${d}: ${T.length} câu`);
      T.forEach((t, i) => {
        if (!D.qt[t.q]) bad.push(`ngày ${d} câu ${i}: thiếu câu hỏi ${t.q}`);
        if (!(t.opts.length >= 1 && t.opts.length <= 3)) bad.push(`ngày ${d} câu ${i}: ${t.opts.length} tranh`);
        t.opts.forEach(sp => { if (sp.reply) bad.push(`ngày ${d}: ${sp.id} là câu hỏi`); if (sp.uid !== course + u && !learned.includes(sp.uid)) bad.push(`ngày ${d}: ${sp.id} chưa học`); });
      });
      G.close();
    }
    ok(bad.length === 0, course + ' kế hoạch câu hỏi: ' + bad.slice(0, 8).join(' | ')); console.log(course, '99 ngày · kế hoạch 4 câu:', bad.length ? bad.length + ' lỗi' : 'đúng');
  }
  // ---- B. một lượt chơi trọn ----
  for (const course of ['SD', 'LS']) {
    const w = boot(course, course === 'SD' ? 1 : 22); fast(w); trap(w); w.PT_TEST.auto = true; w.P.pt = { qaIntro: 1 };
    const G = w.PT_GAME, $ = id => w.document.getElementById(id); G.open();
    const st = () => G.state().G;
    const say = async t => { const f = await waitFor(() => typeof w.PT_TEST.pending === 'function' && w.PT_TEST.pending); ok(!!f, course + ' chờ micro mở'); if (!f) return; w.PT_TEST.pending = null; f(t); await tick(20); };
    const curOpt = (i = 0) => st().turn.opts[i];
    // Leo · câu 1: tự nói đủ câu
    await waitFor(() => st().act === 'en' && st().turn);
    ok(!$('ptScene').querySelector('.w-en').classList.contains('pt-an') && $('ptScene').querySelector('.w-zh').classList.contains('pt-an'), course + ' màn 1 chỉ có Leo');
    ok(G.state().S.objs.length === 0, course + ' cảnh bắt đầu trống');
    let sp = curOpt(); await say(sp.en.say);
    await waitFor(() => st().dots.en === 1); ok(st().dots.en === 1 && st().log[sp.id + '|en'].st === 2, course + ' câu 1 đủ câu: +1 sao, ghi đủ câu');
    // câu 2: im lặng → gợi ý bậc 1, rồi chỉ nói từ khoá → tranh vẫn hiện (sửa ngầm)
    await waitFor(() => st().ti === 1 && st().turn && !st().turn.done);
    await say(''); await waitFor(() => st().turn.lvl === 1); ok(st().turn.lvl === 1, course + ' im lặng → gợi ý bậc 1');
    sp = st().turn.opts[0]; await say(sp.kw.en);
    await waitFor(() => st().dots.en === 2); ok(st().log[sp.id + '|en'] && st().log[sp.id + '|en'].st === 1, course + ' câu 2 nói từ khoá: nhận ý (bậc 1)');
    // đổi ý: chạm ↺ → bỏ câu vừa rồi, hỏi lại
    const undoBtn = await waitFor(() => !$('ptUndo').hidden && $('ptUndo'), 1500);
    // (câu 2 đã qua; thử đổi ý ở câu 3)
    // câu 3: nói linh tinh hai lần → chạm tranh
    await waitFor(() => st().ti === 2 && st().turn && !st().turn.done);
    await say('banana elephant computer'); await say('purple dinosaur');
    const card = await waitFor(() => !$('ptCards').hidden && $('ptCards').querySelector('[data-t]'));
    ok(!!card, course + ' máy nghe không ra 2 lần → hiện tranh để chạm'); card && card.click();
    await waitFor(() => st().dots.en === 3); ok(st().dots.en === 3, course + ' chạm tranh vẫn đi tiếp');
    // câu 4: trả lời đúng rồi đổi ý
    await waitFor(() => st().ti === 3 && st().turn && !st().turn.done);
    sp = curOpt(); { const f = await waitFor(() => typeof w.PT_TEST.pending === 'function' && w.PT_TEST.pending); w.PT_TEST.pending = null; f(sp.en.say); }
    let ub = null; for (let k = 0; k < 400 && !ub; k++) { await new Promise(r => setTimeout(r, 1)); if (!$('ptUndo').hidden) ub = $('ptUndo'); }
    if (ub) { ub.click(); await tick(30); ok(st().dots.en === 3 && st().ti === 3 && !st().turn.done, course + ' đổi ý: bỏ câu vừa rồi, hỏi lại'); sp = curOpt(st().turn.opts.length - 1); await say(sp.en.say); }
    else ok(false, course + ' không thấy nút đổi ý');
    // chuyển màn: Leo bay đi, Xiaomei vào, hỏi lại đúng 4 câu đó
    await waitFor(() => st().act === 'zh' && st().turn, 6000);
    ok(st().act === 'zh' && $('ptScene').querySelector('.w-en').classList.contains('pt-an') && !$('ptScene').querySelector('.w-zh').classList.contains('pt-an'), course + ' màn 2 chỉ có Xiaomei');
    ok(G.state().S.objs.length > 0, course + ' màn 2 giữ bức tranh con đã dựng');
    ok(st().turns.every((t, i) => !st().chosen[i] || t.opts.includes(st().chosen[i])), course + ' Xiaomei hỏi về tranh con đã chọn');
    // zh câu 1: chữ đồng âm (máy nghe nhầm chữ)
    sp = curOpt(); const homo = sp.zh.say.replace(/爷/g, '页').replace(/妈/g, '马').replace(/好/g, '号').replace(/你/g, '尼');
    await say(homo === sp.zh.say ? sp.zh.say : homo);
    await waitFor(() => st().dots.zh === 1); ok(st().dots.zh === 1, course + ' tiếng Trung: nhận cả chữ đồng âm "' + homo + '"');
    // zh câu 2: nói tiếng Anh → nhận ý, Xiaomei nói lại bằng tiếng Trung
    await waitFor(() => st().ti === 1 && st().turn && !st().turn.done);
    sp = curOpt(); await say(sp.en.say);
    await waitFor(() => st().dots.zh === 2); ok(st().dots.zh === 2 && st().log[sp.id + '|zh'] && st().log[sp.id + '|zh'].st === 1, course + ' nói nhầm tiếng Anh với Xiaomei: nhận ý, sửa ngầm');
    // zh câu 3: im lặng 3 lần → bậc 1, 3 rồi chạm
    await waitFor(() => st().ti === 2 && st().turn && !st().turn.done);
    await say(''); await say(''); await waitFor(() => st().turn.lvl >= 3); ok(st().turn.lvl === 3, course + ' im lặng tiếp → bậc 3 (cả câu mẫu)');
    await say(''); const c2 = await waitFor(() => !$('ptCards').hidden && $('ptCards').querySelector('[data-t]')); ok(!!c2, course + ' im lặng lần 3 → chạm tranh'); c2 && c2.click();
    // zh câu 4: đủ câu
    await waitFor(() => st().ti === 3 && st().turn && !st().turn.done); sp = curOpt(); await say(sp.zh.say);
    // kết: album, Phép thưởng, sao
    await waitFor(() => st().bonus || st().end, 8000); const canBonus = Object.values(st().log).some(x => x.st < 2); ok(((w.P.pt.album) || []).length === 1, course + ' chụp bức tranh vào album');
    let nb = 0; for (let i = 0; i < 400 && !st().end; i++) { const b = st().bonus; if (b && b.cur && typeof w.PT_TEST.pending === 'function') { const it = b.cur, f = w.PT_TEST.pending; w.PT_TEST.pending = null; f(it.sp[it.l].say); nb++; } await tick(10); }
    ok(canBonus ? nb >= 1 : nb === 0, course + ' Phép thưởng đúng các câu mới chạm tranh / nói một phần (' + nb + ' câu)');
    await waitFor(() => st().end, 8000);
    if (!st().end) console.log(course, 'KẸT:', JSON.stringify({ act: st().act, ti: st().ti, bonus: st().bonus && { i: st().bonus.i, n: st().bonus.list.length, cur: !!st().bonus.cur }, bonusDone: st().bonusDone, dots: st().dots, said: $('ptSaid').textContent }));
    ok(st().end && w.stars === 2, course + ' xong lượt +2 sao (sao: ' + w.stars + ')');
    ok(/phù thuỷ lời nói/.test($('ptPanel').textContent), course + ' màn kết thúc');
    console.log(course, 'lượt chơi: said', st().said, '· đôi', st().doubles, '· thưởng', st().bonusList ? st().bonusList.ok + '/' + st().bonusList.list.length : '-');
    G.close(); w.close();
  }
  // ---- C. máy không nghe được giọng: chơi bằng chạm ----
  { const w = boot('LS', 2); fast(w); trap(w); w.P.pt = { qaIntro: 1 }; w.PT_TEST.auto = false; const G = w.PT_GAME, $ = id => w.document.getElementById(id); G.open();
    await waitFor(() => G.state().G.turn); G.cards(); const c = await waitFor(() => $('ptCards').querySelector('[data-t]')); c && c.click();
    await waitFor(() => G.state().G.dots.en === 1); ok(G.state().G.dots.en === 1, 'chạm tranh khi không có micro'); G.close(); w.close(); }
  // ---- D. lần đầu: màn hướng dẫn cô Hươu ----
  { const w = boot('SD', 1); fast(w); trap(w); const G = w.PT_GAME, $ = id => w.document.getElementById(id); G.open();
    ok(!$('ptPanel').hidden && /Leo hỏi/.test($('ptPanel').textContent), 'lần đầu có màn hướng dẫn'); $('ptGo').click(); await waitFor(() => G.state().G.act === 'en');
    ok(w.P.pt.qaIntro === 1 && G.state().G.act === 'en', 'bấm Bắt đầu → Leo hỏi'); G.close(); w.close(); }
  ok(errors.length === 0, 'lỗi chạy: ' + errors.slice(0, 5).join(' | '));
  process.exit(report() ? 1 : 0);
})();
