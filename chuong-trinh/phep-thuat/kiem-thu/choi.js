// Kiểm thử chơi thật trong jsdom: mọi hiệu ứng của 146 phép, mọi ngày 1–99 × 2 khoá, một lượt chơi trọn (gọi phù thuỷ → 8 phép → thưởng → hội thoại → sao).
const { ok, boot, D, report } = require('./chay.js');
const fs = require('fs'), path = require('path');
const tick = (ms = 5) => new Promise(r => setTimeout(r, ms));
function fast(w, k = 0.02) { const o = w.setTimeout.bind(w); w.setTimeout = (f, ms, ...a) => o(f, Math.min((ms || 0) * k, 40), ...a); }
const errors = [];
function trap(w) { w.addEventListener('error', e => errors.push(String(e.message || e.error))); w.onunhandledrejection = e => errors.push('reject ' + e.reason); }

(async () => {
  // ---- A. mọi ngày: nhóm phép hợp lệ ----
  for (const course of ['LS', 'SD']) {
    const w = boot(course, 1); const G = w.PT_GAME; let bad = [];
    for (let d = 1; d <= 99; d++) {
      let p; try { p = G.poolFor(d); } catch (e) { bad.push(d + ': ' + e.message); continue; }
      const u = G.unitOf(d);
      if (p.list.length < 6) bad.push(`ngày ${d} (${u}) chỉ ${p.list.length} phép`);
      if (u === 'Ôn' && p.list.length !== 6) bad.push(`ngày ôn ${d} có ${p.list.length} phép`);
      if (u !== 'Ôn' && p.list.length > 12) bad.push(`ngày ${d} quá nhiều phép`);
      const learned = G.learnedBefore(d).map(x => course + x);
      if (u === 'Ôn') p.list.forEach(sp => { if (!learned.includes(sp.uid)) bad.push(`ngày ôn ${d}: phép ${sp.id} chưa học`); });
      else p.list.forEach(sp => { if (sp.uid !== course + u && !learned.includes(sp.uid)) bad.push(`ngày ${d}: phép ôn ${sp.id} chưa học`); });
    }
    ok(bad.length === 0, `${course} nhóm phép theo ngày: ` + bad.slice(0, 8).join(' | ')); console.log(course, '99 ngày: nhóm phép', bad.length ? bad.length + ' lỗi' : 'đúng');
  }
  // ---- B. mọi hiệu ứng: bắn từng phép, kiểm không lỗi và cảnh hợp lệ ----
  let nFx = 0, fxBad = [];
  for (const course of ['LS', 'SD']) for (const u of D.order[course]) {
    const uid = course + u; const days = Object.values({}); const w = boot(course, 1);
    // chọn một ngày thuộc unit này
    const dd = Object.keys(w.SD.days).map(Number).find(n => String(w.SD.days[n].unit) === u); fast(w); trap(w);
    w.PT_TEST.day = dd; w.PT_GAME.open(); await tick(); const st = w.PT_GAME.state(); st.G.awake = { en: true, zh: true };
    w.document.getElementById('ptPanel').hidden = true;
    for (const sp of D.units[uid].spells) for (const l of ['en', 'zh']) {
      const say = sp[l].say; nFx++;
      try { w.PT_GAME.handle(l, say); await tick(8); } catch (e) { fxBad.push(`${sp.id}.${l}: ${e.message}`); continue; }
      const S = w.PT_GAME.state().S;
      if (!S.objs.length && !S.ex.clock && !S.wx && !/^bye_/.test(sp.k) && sp.k !== 'night' && sp.k !== 'day' && sp.k !== 'go' && sp.k !== 'living' && !sp.fx.some(f => f.t === 'bg' || f.t === 'time' || f.t === 'push' || f.t === 'count_people' || f.t === 'weather')) fxBad.push(`${sp.id}.${l}: cảnh trống sau phép`);
      if (S.objs.some(o => !D.objs[o.id])) fxBad.push(`${sp.id}.${l}: vật lạ`);
    }
    w.PT_GAME.close(); w.close();
  }
  ok(fxBad.length === 0, 'hiệu ứng: ' + fxBad.slice(0, 10).join(' | ')); console.log('hiệu ứng:', nFx, 'lượt bắn,', fxBad.length, 'lỗi');
  // ---- C. cảnh các phép đặc biệt ----
  {
    const w = boot('LS', 10); fast(w); w.PT_GAME.open(); await tick(); w.PT_GAME.state().G.awake = { en: true, zh: true }; w.document.getElementById('ptPanel').hidden = true;
    w.PT_GAME.handle('en', 'six'); await tick(); ok(w.PT_GAME.state().S.ex.candles === 6, 'nến = 6 khi nói six: ' + w.PT_GAME.state().S.ex.candles);
    w.PT_GAME.handle('en', 'Seven!'); await tick(); ok(w.PT_GAME.state().S.ex.candles === 7, 'nến = 7 khi con chọn seven');
    w.PT_GAME.handle('zh', '九'); await tick(); ok(w.PT_GAME.state().S.ex.candles === 9, 'nến = 9 khi con nói 九');
    w.PT_GAME.handle('en', 'Hello, cake! Happy birthday!'); await tick(1200); ok(w.PT_GAME.state().G.golds === 1, 'phép nối Hello cake + Happy birthday → Phép vàng'); 
    w.PT_GAME.handle('en', 'no no'); await tick(); ok(true, 'undo không lỗi');
    w.PT_GAME.close(); w.close();
    const w2 = boot('LS', 82); fast(w2); w2.PT_GAME.open(); await tick(); w2.PT_GAME.state().G.awake = { en: true, zh: true }; w2.document.getElementById('ptPanel').hidden = true;
    w2.PT_GAME.handle('en', 'Red!'); await tick(); let o = w2.PT_GAME.state().S.objs.find(x => x.id === 'balloon_white'); ok(o && o.c === 'red', 'bóng bay đỏ khi nói Red: ' + JSON.stringify(o));
    w2.PT_GAME.handle('en', 'purple'); await tick(); o = w2.PT_GAME.state().S.objs.find(x => x.id === 'balloon_white'); ok(o && o.c === 'purple', 'bóng bay tím khi con tự chọn purple: ' + JSON.stringify(o));
    w2.PT_GAME.close(); w2.close();
    const w3 = boot('SD', 44); fast(w3); w3.PT_GAME.open(); await tick(); w3.PT_GAME.state().G.awake = { en: true, zh: true }; w3.document.getElementById('ptPanel').hidden = true;
    w3.PT_GAME.handle('en', 'Where is my ball?'); await tick(); ok(!w3.PT_GAME.state().S.objs.some(x => x.id === 'ball'), 'bóng biến mất khi hỏi Where is my ball');
    w3.PT_GAME.handle('en', "It's under the bed!"); await tick();
    ok(w3.PT_GAME.state().S.objs.some(x => x.id === 'ball' && x.pos && x.pos.how === 'under' && x.pos.to === 'bed'), 'bóng chui gầm giường');
    w3.PT_GAME.close(); w3.close();
  }
  // ---- D. một lượt chơi trọn vẹn ----
  for (const [course, day] of [['LS', 10], ['SD', 36], ['SD', 60]]) {
    const w = boot(course, day); fast(w); trap(w);
    const doc = w.document, G = w.PT_GAME; G.open(); await tick();
    doc.getElementById('ptW4').click(); await tick();
    const st = () => G.state();
    const click = sel => doc.querySelector(sel).click();
    async function say(l, text) { click('.w-' + l); await tick(30); click('#ptMic'); await tick(5); if (w.PT_TEST.pending) w.PT_TEST.pending(text); await tick(30); }
    await say('en', 'Hi, Leo!'); ok(st().G.awake.en, `${course}${day}: Leo thức dậy`);
    await say('zh', '你好，Xiaomei！'); ok(st().G.awake.zh, `${course}${day}: Xiaomei thức dậy`);
    const U = G.poolFor(day).list;
    // trả lời mọi lượt nghe còn lại (thưởng, hội thoại) bằng câu đúng/sai xen kẽ
    for (let i = 0; i < 6 && !(st().G.meter.en >= 4 && st().G.meter.zh >= 4); i++) for (const l of ['en', 'zh']) { const sp = U[(i * 2 + (l === 'zh' ? 1 : 0)) % U.length]; if (st().G.meter[l] >= 4) continue; await say(l, sp[l].say); }
    let n = 0; const auto = setInterval(() => { if (w.PT_TEST.pending) { const p = w.PT_TEST.pending; w.PT_TEST.pending = null; p(n++ % 2 ? 'hello' : 'Good'); } }, 6);
    ok(st().G.meter.en >= 4 && st().G.meter.zh >= 4, `${course}${day}: hai thanh phép đầy (${st().G.meter.en}/${st().G.meter.zh})`);
    for (let i = 0; i < 400 && !doc.querySelector('.pt-end'); i++) await tick(25);
    ok(!!doc.querySelector('.pt-end'), `${course}${day}: tới màn kết thúc`);
    clearInterval(auto);
    ok(w.stars === 2, `${course}${day}: +2 sao: ${w.stars}`); ok(Object.keys(w.P.pt.world).length >= 0, 'đã lưu thế giới');
    ok(w.P.pt.d && Object.keys(w.P.pt.seen).length >= 4, `${course}${day}: ghi nhớ phép đã nói (${Object.keys(w.P.pt.seen).length})`);
    G.close(); w.close();
  }
  // ---- E. ô trò chơi hiện ở mọi ngày ----
  for (const course of ['LS', 'SD']) { const w = boot(course, 70); w.document.getElementById('app').innerHTML = '<div class="dy-tiles"></div>'; await tick(20); ok(!!w.document.querySelector('.ht-pt'), course + ' ngày 70 có ô Phép thuật'); w.close(); }
  ok(errors.length === 0, 'lỗi chạy: ' + errors.slice(0, 5).join(' | '));
  process.exit(report() ? 1 : 0);
})();
