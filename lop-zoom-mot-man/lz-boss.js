/* Lớp Zoom – Cả lớp đấu Rồng Lửa (màn bé + màn chiếu).
   Nhạc nền và tiếng đấu tự tạo bằng Web Audio (không dùng nhạc có bản quyền), chỉ phát trên màn chiếu của cô.
   Máy bé chỉ phát câu hỏi và tiếng "tăng sức mạnh" khi con đúng. */

/* Ảnh biểu cảm (tuỳ chọn): khi vẽ xong thì điền đường dẫn (tính từ xem-truoc/tai-nguyen/), để trống thì dùng ảnh gốc
   và thêm biểu cảm bằng chuyển động + biểu tượng cảm xúc. Danh sách ảnh cần vẽ: lop-zoom/HINH-CAN-VE.md */
const BOSS_V = {
  heroWin: 'qua/zoom_bong_thang.webp',    // Bông siêu nhân reo vui, giơ nắm tay
  heroHurt: 'qua/zoom_bong_lui.webp',   // Bông siêu nhân nhăn mặt, lùi lại
  heroAtk: '',    // Bông siêu nhân tung tia sáng từ hai tay
  monAngry: 'qua/zoom_rong_gian.webp',   // Rồng Lửa nổi giận, phun lửa
  monDizzy: 'qua/zoom_rong_choang.webp',   // Rồng Lửa choáng, mắt xoay vòng
  monFriend: ''   // Rồng Lửa cười hiền, ôm bánh sinh nhật
};
function bImg(key, base) { return BOSS_V[key] ? TN + BOSS_V[key] : base; }

/* ---------- âm thanh trận đấu ---------- */
/* Nhạc trận đấu (bản một màn): sôi động hơn – trống bốn phách, clap, hi-hat, bass nảy, hợp âm nhấn và giai điệu vui.
   Nhạc nhỏ lại (duck) mỗi khi đọc đề, để các con vẫn nghe rõ câu hỏi. Tất cả tự tạo bằng Web Audio, không dùng nhạc có bản quyền. */
const BA = (() => {
  let ctx = null, master = null, music = null, timer = null, step = 0, nextT = 0, mode = 'calm', on = false, ducked = false;
  const VOL = 0.55, DUCK = 0.16;
  function C() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (!master) {
      master = ctx.createGain(); master.gain.value = 1;
      const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
      master.connect(comp).connect(ctx.destination);
      music = ctx.createGain(); music.gain.value = VOL; music.connect(master);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  const N = n => 440 * Math.pow(2, (n - 69) / 12);
  function tone(f, t, d, type, vol, slideTo, out, cut) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + d);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    let node = o;
    if (cut) { const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.setValueAtTime(cut, t); fl.Q.value = 6; o.connect(fl); node = fl; }
    node.connect(g).connect(out || master); o.start(t); o.stop(t + d + .05);
  }
  function noise(t, d, vol, f1, f2, type, out) {
    const len = Math.max(1, Math.floor(ctx.sampleRate * d)), buf = ctx.createBuffer(1, len, ctx.sampleRate), x = buf.getChannelData(0);
    for (let i = 0; i < len; i++) x[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const fl = ctx.createBiquadFilter(); fl.type = type || 'bandpass'; fl.frequency.setValueAtTime(f1, t);
    if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + d);
    const g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    src.connect(fl).connect(g).connect(out || master); src.start(t); src.stop(t + d);
  }
  const kick = t => { tone(150, t, .16, 'sine', .55, 42, music); };
  const clap = t => { noise(t, .12, .22, 1500, 900, 'bandpass', music); noise(t + .012, .1, .14, 1800, null, 'bandpass', music); };
  const hat = (t, v) => noise(t, .035, v || .07, 8000, null, 'highpass', music);
  /* 2 nhịp (32 móc đơn): giọng trưởng vui (calm), giọng thứ dồn dập khi rồng nổi giận (tense), thắng thì rộn ràng (win) */
  const P = {
    calm: { bpm: 152, root: [48, 48, 45, 45, 41, 41, 43, 43],
      lead: [72, 0, 76, 79, 0, 79, 76, 0, 74, 0, 76, 74, 72, 0, 67, 0, 69, 0, 72, 76, 0, 77, 76, 0, 74, 0, 72, 74, 76, 0, 79, 0] },
    tense: { bpm: 168, root: [45, 45, 45, 45, 41, 41, 43, 44],
      lead: [69, 72, 76, 72, 69, 72, 77, 72, 68, 71, 76, 71, 69, 72, 74, 76, 69, 72, 76, 81, 80, 76, 72, 69, 71, 74, 77, 74, 76, 80, 83, 80] },
    win: { bpm: 160, root: [48, 48, 53, 53, 55, 55, 48, 48],
      lead: [72, 76, 79, 84, 79, 84, 88, 84, 77, 81, 84, 89, 79, 83, 86, 91, 84, 88, 91, 96, 91, 88, 84, 79, 86, 83, 79, 74, 84, 0, 84, 0] }
  };
  function schedule() {
    const p = P[mode] || P.calm, spb = 60 / p.bpm / 2;
    while (nextT < ctx.currentTime + .25) {
      const i = step % 32, r = p.root[Math.floor(i / 4)];
      if (i % 4 === 0) kick(nextT);                                            // trống bốn phách
      if (mode === 'tense' && i % 4 === 3) kick(nextT);
      if (i % 8 === 4) clap(nextT);                                            // clap phách 2 và 4
      hat(nextT, i % 2 ? .085 : .04);                                          // hi-hat liên tục
      tone(N(r + (i % 2 ? 12 : 0)), nextT, spb * .85, 'sawtooth', .07, null, music, mode === 'tense' ? 900 : 700);   // bass nảy quãng tám
      if (i % 4 === 2) [0, 4, 7].forEach(s => tone(N(r + 24 + s + (mode === 'tense' && s === 4 ? -1 : 0)), nextT, spb * .6, 'square', .018, null, music, 2600));  // hợp âm nhấn
      if (p.lead[i]) tone(N(p.lead[i]), nextT, spb * (p.lead[(i + 1) % 32] ? .9 : 1.7), 'triangle', .075, null, music);
      if (i === 31) noise(nextT, spb, .05, 1200, 7000, 'bandpass', music);     // tiếng vút cuối câu nhạc
      nextT += spb; step++;
    }
  }
  return {
    start() { C(); if (on) return; on = true; step = 0; nextT = ctx.currentTime + .05; music.gain.setValueAtTime(ducked ? DUCK : VOL, ctx.currentTime); timer = setInterval(schedule, 60); },
    stop() { on = false; clearInterval(timer); timer = null; },
    mood(m) { mode = m; },
    /* nhạc nhỏ lại khi đọc đề, to lại khi đọc xong */
    duck(v) { ducked = !!v; if (!ctx || !music) return; const t = ctx.currentTime; music.gain.cancelScheduledValues(t); music.gain.setTargetAtTime(v ? DUCK : VOL, t, v ? .05 : .35); },
    power() { C(); const t = ctx.currentTime; [0, 4, 7, 12].forEach((s, j) => tone(N(79 + s), t + j * .045, .14, 'triangle', .09)); noise(t, .2, .05, 3000, 9000); },
    zap() { C(); const t = ctx.currentTime; tone(1600, t, .28, 'sawtooth', .05, 200); tone(2400, t, .18, 'square', .02, 900); noise(t, .22, .07, 4000, 900); },
    roar() { C(); const t = ctx.currentTime; tone(120, t, .55, 'sawtooth', .07, 65); tone(180, t, .45, 'square', .03, 90); noise(t, .55, .16, 700, 180, 'lowpass'); },
    boom() { C(); const t = ctx.currentTime; tone(170, t, .38, 'sine', .28, 38); noise(t, .32, .18, 1400, 90, 'lowpass'); },
    poof() { C(); const t = ctx.currentTime; noise(t, .45, .12, 2500, 400); [96, 91, 88, 84].forEach((n, j) => tone(N(n), t + j * .06, .12, 'triangle', .05)); },
    fanfare() { C(); const t = ctx.currentTime; [[72, 0], [76, .14], [79, .28], [84, .42], [79, .62], [84, .76], [88, .9]].forEach(([n, d]) => tone(N(n), t + d, .26, 'square', .05)); }
  };
})();

/* ---------- cảnh trận đấu ---------- */
let BQ = null, bossMissed = [], bossLastHits = 0, bossSurgeSeen = false, bossFightT = 0, bossHitsAtFight = 0, bossTurn = 0;
function bossScene(info, big) {
  return `<div class="boss${big ? ' big' : ''}${info.surge ? ' surge' : ''}${info.done ? ' won' : ''}" id="bScene">
    <div class="b-row">
      <div class="b-hero" id="bHero"><div class="b-emo" id="bHeroEmo">😄</div><img id="bHeroImg" src="${BOSS.hero}" alt="Anh hùng Bông"><div class="b-bub" id="bBub"></div></div>
      <div class="b-mid">${big ? '<div class="b-feed" id="bFeed"></div>' : ''}<div class="b-power">⚡ <b id="bH">${info.H || 0}</b></div>
        <div class="b-bar"><i id="bPos" style="left:${info.pos || 50}%"></i></div>
        <div class="b-time" id="bT">${info.pre ? '' : Math.ceil(info.left / 1000) + 's'}</div></div>
      <div class="b-mon" id="bMon"><div class="b-emo" id="bMonEmo">😏</div><img id="bMonImg" src="${BOSS.stages[info.done ? 0 : (info.prog || 0) >= 0.8 ? 1 : (info.prog || 0) >= 0.5 ? 2 : 3]}" alt="${BOSS.name}"></div>
      <div class="b-beam" id="bBeam"></div><div class="b-fire" id="bFire"></div><div class="b-boom" id="bBoom">💥</div><div class="b-poof">✨</div>
    </div>
    <div class="b-msg" id="bMsg">${bossMsg(info)}</div></div>`;
}
function bossMsg(info) {
  if (info.pre) return BOSS.story;
  if (info.done) return '🎉 Cả lớp thắng rồi! Rồng Lửa biến lại thành quả trứng!';
  if (info.surge) return '⚠️ Rồng Lửa nổi giận! Cả lớp trả lời nhanh nào!';
  if (info.pos >= 70) return '💪 Anh hùng mạnh lên, Rồng Lửa nhỏ dần rồi! Tiếp sức nữa nào!';
  if (info.pos < 45) return '🔥 Rồng đang lấn tới, anh hùng nhỏ lại rồi! Các bạn ơi, tiếp sức!';
  return '⚡ Mỗi câu đúng là một tia sức mạnh cho anh hùng!';
}
/* biểu cảm và kích thước theo thế trận:
   - các con càng kiếm nhiều ⚡, rồng càng nhỏ và lùi dần về bé (rồng lớn → rồng con → rồng vừa nở → quả trứng khi cả lớp thắng);
   - lúc rồng áp đảo (thanh nghiêng về phía rồng) thì siêu nhân nhỏ dần đi, các bạn tiếp sức thì siêu nhân to lại. */
let bossStage = 3;
function bossFaces(info) {
  const he = $('#bHeroEmo'), me = $('#bMonEmo'), hi = $('#bHeroImg'), mi = $('#bMonImg'), H = $('#bHero'), M = $('#bMon'); if (!he) return;
  const p = info.prog || 0, pos = info.pos || 50;
  const stage = info.done ? 0 : p >= 0.8 ? 1 : p >= 0.5 ? 2 : 3;
  let h, m, hImg = BOSS.hero, mImg = BOSS.stages[stage];
  if (info.done) { h = '🥳'; m = '🥚'; hImg = bImg('heroWin', BOSS.hero); }
  else if (info.surge) { h = '😣'; m = '😠'; hImg = bImg('heroHurt', BOSS.hero); if (stage === 3) mImg = bImg('monAngry', mImg); }
  else if (pos >= 66) { h = '💪'; m = '😵'; hImg = bImg('heroWin', BOSS.hero); if (stage === 3) mImg = bImg('monDizzy', mImg); }
  else if (pos < 45) { h = '😰'; m = '😤'; hImg = bImg('heroHurt', BOSS.hero); }
  else { h = '😤'; m = '😏'; }
  if (he.textContent !== h) { he.textContent = h; flash(he, 'pop', 450); }
  if (me.textContent !== m) { me.textContent = m; flash(me, 'pop', 450); }
  if (hi.getAttribute('src') !== hImg) hi.src = hImg;
  if (stage !== bossStage) {   // rồng biến nhỏ một bậc: làn khói lấp lánh rồi đổi hình
    bossStage = stage; flash(M, 'poof', 900);
    setTimeout(() => { mi.src = mImg; }, 300);
    if (CHIEU && !muted) BA.poof();
  } else if (mi.getAttribute('src') !== mImg && !M.classList.contains('poof')) mi.src = mImg;
  const heroS = info.done ? 1.12 : pos < 50 ? Math.max(0.55, 1 - (50 - pos) / 42 * 0.45) : 1;
  const monS = info.done ? 0.55 : Math.max(0.6, 1 - 0.4 * Math.min(1, p)) * (info.surge ? 1.12 : 1);
  H.style.setProperty('--s', heroS.toFixed(3)); M.style.setProperty('--s', monS.toFixed(3));
}
function flash(el, cls, ms) { if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(() => el.classList.remove(cls), ms || 600); }
/* một nhịp đấu: anh hùng tung tia sáng khi các bạn vừa tiếp sức, rồng phun lửa khi lặng sức hoặc lúc nổi giận */
function bossFight(info, sound) {
  const heroTurn = (info.H > bossHitsAtFight) && !(info.surge && bossTurn % 2 === 1);
  bossHitsAtFight = info.H; bossTurn++;
  if (heroTurn) {
    flash($('#bHero'), 'atk', 650); flash($('#bBeam'), 'go', 650);
    setTimeout(() => { flash($('#bMon'), 'hit', 600); flash($('#bBoom'), 'go', 500); if (sound) BA.boom(); }, 280);
    if (sound) BA.zap();
  } else {
    flash($('#bMon'), 'atk', 650); flash($('#bFire'), 'go', 700);
    setTimeout(() => flash($('#bHero'), 'hit', 600), 300);
    if (sound) BA.roar();
  }
}

function vBoss(st, seats) {
  const info = bossInfo(room), run = info.run;
  const state = info.pre ? 'pre' : info.done ? 'done' : 'run';
  const key = 'boss|' + run + '|' + state;
  let html;
  if (!CHIEU && state === 'run') html = `<div class="boss-split"><div class="bs-scene">${bossScene(info, false)}</div><div class="bs-q">${headAllowed(st) ? `<div class="bs-hd">${HEAD_TAG}</div>` : ''}<div id="bq" class="bq"></div></div></div>`;
  else html = bossScene(info, CHIEU) + (!CHIEU && state === 'pre' ? `<p class="sub">Cô bấm bắt đầu là con tự trả lời liên tục nhé. Câu nào đúng cũng giúp anh hùng mạnh hơn!</p>` : '');
  return {
    key, akey: key, audio: null, html,
    bind() {
      bossStage = info.done ? 0 : (info.prog || 0) >= 0.8 ? 1 : (info.prog || 0) >= 0.5 ? 2 : 3;
      bossDone = state; bossLastHits = info.H || 0; bossHitsAtFight = info.H || 0; bossSurgeSeen = false; bossFightT = Date.now();
      document.body.classList.toggle('boss-play', !CHIEU && state === 'run');
      bossFaces(info);
      if (CHIEU && !muted) { if (state === 'run') { BA.mood('calm'); BA.start(); play([hd('Cả lớp cùng tiếp sức cho anh hùng Bông nhé!')]); } else if (state === 'done') { BA.mood('win'); BA.start(); setTimeout(() => BA.stop(), 6000); } else BA.stop(); }
      if (!CHIEU && state === 'run') { if (!BQ || BQ.run !== run) BQ = { run, n: +lsGet('lz-boss-' + CODE + '-' + run + '-' + DB.uid, 0) || 0, it: null }; bossAsk(); }
      if (state === 'done') { if (CHIEU && !muted) { BA.fanfare(); setTimeout(() => play([hd('Cả lớp thắng rồi! Rồng Lửa biến lại thành quả trứng!')]), 1200); } else SND.beep('win'); confetti(); if (!CHIEU) giveStar('boss_win_' + run, 'boss'); }
    }
  };
}
function bossAsk() {
  const box = $('#bq'); if (!box) return;
  const it = BQ.it = bossPick(BQ.it, bossMissed), lang = it.l;
  box.innerHTML = `${it.l === 'doc' ? `<div class="chu zh b-chu">${it.chu}</div>`
      : `<button class="say ${lang} b-say" id="bPlay"><span class="ic">🔊</span><span>${lang === 'zh' ? '中文' : 'English'}</span></button>`}
    <div class="pics" id="pics">${it.o.map((k, c) => `<button class="pick" data-c="${c}"><img src="${pic(k, 2)}" alt=""></button>`).join('')}</div>`;
  const a = it.l === 'doc' ? '' : aud(it.k, lang);
  if (a) { play([a]); $('#bPlay').onclick = () => play([a]); }
  const t0 = performance.now();
  $$('.pick', box).forEach(b => b.onclick = () => {
    if (box.dataset.lock) return; box.dataset.lock = '1';
    const c = +b.dataset.c, ok = c === it.ans, qid = 'boss_' + BQ.run + '_' + BQ.n;
    BQ.n++; lsSet('lz-boss-' + CODE + '-' + BQ.run + '-' + DB.uid, BQ.n);
    DB.set(roomPath(CODE) + '/answers/' + qid + '/' + DB.uid, { c, ok, ms: Math.round(performance.now() - t0), at: DB.now(), k: it.k, l: it.l }).catch(er => console.error(er));
    b.classList.add('chosen');
    if (ok) {
      BA.power();
      const f = document.createElement('div'); f.className = 'b-plus'; f.innerHTML = '⚡<b>+1</b>'; box.appendChild(f);
      const sp = document.createElement('div'); sp.className = 'b-spark'; sp.textContent = '⚡'; const hero = $('#bHero'); hero && hero.appendChild(sp); setTimeout(() => sp.remove(), 900);
      flash($('#bHero'), 'charge', 700);
    } else bossMissed.push({ k: it.k, l: it.l });
    setTimeout(() => { delete box.dataset.lock; if ($('#bq') === box) bossAsk(); }, ok ? 750 : 500);
  });
}
function bossUpdate() {
  if ((room.state || {}).ph !== 'boss') { BA.stop(); document.body.classList.remove('boss-play'); return; }
  const info = bossInfo(room), state = info.pre ? 'pre' : info.done ? 'done' : 'run';
  if (state !== bossDone) { lastStageKey = ''; render(); return; }
  const pos = $('#bPos'); if (!pos) return;
  pos.style.left = info.pos + '%';
  $('#bH').textContent = info.H || 0;
  $('#bT').textContent = info.pre ? '' : Math.ceil(info.left / 1000) + 's';
  $('#bMsg').textContent = bossMsg(info);
  const sc = $('#bScene'); sc && sc.classList.toggle('surge', info.surge);
  bossFaces(info);
  if (state !== 'run') return;
  const sound = CHIEU && !muted;
  if (info.surge && !bossSurgeSeen) { bossSurgeSeen = true; if (sound) { BA.mood('tense'); BA.roar(); setTimeout(() => play([hd('Rồng Lửa nổi giận rồi! Cả lớp trả lời nhanh nào!')]), 600); } }
  if (!info.surge && bossSurgeSeen && sound) BA.mood('calm');
  const gap = info.surge ? 900 : 1500;
  if (Date.now() - bossFightT > gap) { bossFightT = Date.now(); bossFight(info, sound); }
  if (CHIEU && info.H > bossLastHits) {   // màn chiếu: bạn vừa tiếp sức bay vào anh hùng và hiện ở cột "Tiếp sức"
    const seats = buildSeats(room.players), bub = $('#bBub'), feed = $('#bFeed');
    info.hits.slice(bossLastHits).slice(-3).forEach(([, u], j) => {
      const seat = seats.find(x => x.ids.indexOf(u) >= 0); if (!seat) return;
      setTimeout(() => {
        if (bub) { const e = document.createElement('div'); e.className = 'b-fly'; e.innerHTML = `<img src="${faceOf(seat)}" alt=""><b>${esc(seat.kid)} ⚡</b>`; e.style.left = (5 + Math.random() * 50) + '%'; bub.appendChild(e); setTimeout(() => e.remove(), 1400); }
        if (feed) { const r = document.createElement('div'); r.className = 'b-f'; r.innerHTML = `<img src="${faceOf(seat)}" alt=""><b>${esc(seat.kid)}</b><span>+1 ⚡</span>`; feed.prepend(r); while (feed.children.length > 4) feed.lastChild.remove(); }
        if (sound) BA.power();
      }, j * 180);
    });
    flash($('#bHero'), 'charge', 700);
  }
  bossLastHits = info.H || 0;
}
