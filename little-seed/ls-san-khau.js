/* =====================================================================
   SÂN KHẤU CỦA CON · thuyết trình Anh – Trung cuối unit (bản thử Unit 1 + Unit 5), dùng chung Little Seed và Seedling
   Thiết kế: claude/SanKhau_ThuyetTrinh.md (chị yêu cầu 11/11/2026)
   - Bài nói "về con", lớn dần như quả cầu tuyết: câu mở (mang từ unit trước) + khúc của unit mới + 2 câu "ôn bất ngờ"
     do vòng quay rút từ các unit cũ + câu hỏi bất ngờ của khán giả + câu kết. Nói hết tiếng Anh (Leo dẫn) rồi tiếng Trung (Xiaomei dẫn).
   - 3 bậc bớt dần chỗ dựa: 🥉 Nói theo (nghe mẫu) → 🥈 Nhìn tranh nói → 🥇 Tự nói (slide mờ, nói xong mới hiện). Xong bậc 🥇 mở 🎬 Quay show.
   - Mỗi câu là một lượt nói riêng (máy nghe đoạn dài của trẻ rất kém), micro tự mở sau tín hiệu "ting"; nói chưa được thì gợi ý
     thêm một nấc rồi vẫn đi tiếp (không chặn). Câu có chỗ trống của con (tên) thì nói gì cũng tính.
   - 🎬 Quay show: camera + slide, con hoặc ba mẹ chạm "Tiếp" sau mỗi câu; tải video về gửi cô qua Zalo, tên tệp theo luật Góc vinh danh.
   - Tranh cảm xúc, đồ chơi đang là emoji tạm; audio đang là giọng máy → làm thật theo đợt khi chốt học liệu (claude/GameLoiNoi_DeXuat.md).
   ===================================================================== */
(function () {
  const COURSE = (typeof KEY === 'string' && KEY === 'lsd') ? 'ls' : 'sd';
  const A = (location.pathname.includes('/little-seed/') ? '../seedling/' : '') + 'tai-nguyen/';
  const NV = n => A + 'nhan-vat/' + n + '.webp';
  const h = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const IMG = { teacher: COURSE === 'ls' ? 'huou_huou1_a' : 'nv_lan_a', mommy: 'fam_bong_me_a', daddy: 'fam_bong_bo_a', bong: 'kids_bong_a', anna: 'kids_anna_a',
    vu: 'nv_vu_a', leo: 'kids_leo_a', xiaomei: 'kids_xiaomei_a', puppy: 'pets_cun_dung_a', kitten: 'pets_meo_dung_a', grandpa: 'fam_bong_ong_a', grandma: 'fam_bong_ba_a',
    bro: 'fam_bong_anh_trai_a', sis: 'fam_bong_em_gai_a' };

  /* ---------- lựa chọn của con (chạm tranh) ---------- */
  const PICK = {
    ls: {
      tuoi: [4, 5, 6].map(n => ({ k: n, e: String(n), en: ['', '', '', '', 'four', 'five', 'six'][n], zh: ['', '', '', '', '四', '五', '六'][n] })),
      cx: [['happy', '开心', '😄'], ['sad', '难过', '😢'], ['sleepy', '困', '😴'], ['scared', '害怕', '😨'], ['angry', '生气', '😠'], ['tired', '累', '😩']].map(([en, zh, e]) => ({ k: en, en, zh, e })),
      nguoi: [['grandpa', 'He is my grandpa.', '他是我爷爷。'], ['grandma', 'She is my grandma.', '她是我奶奶。'], ['bro', 'He is my big brother.', '他是我哥哥。'], ['sis', 'She is my little sister.', '她是我妹妹。']]
        .map(([k, en, zh]) => ({ k, a: k, en, zh })),
    },
    sd: {
      tuoi: [5, 6, 7, 8, 9].map(n => ({ k: n, e: String(n), en: ['', '', '', '', '', 'five', 'six', 'seven', 'eight', 'nine'][n], zh: ['', '', '', '', '', '五', '六', '七', '八', '九'][n] })),
      cx: [['excited', '兴奋', '🤩'], ['happy', '高兴', '😄'], ['sleepy', '困', '😴']].map(([en, zh, e]) => ({ k: en, en, zh, e })),
      nguoi: [['mommy', 'She is my mother.', '她是我妈妈。'], ['daddy', 'He is my father.', '他是我爸爸。'], ['bro', 'He is my older brother.', '他是我哥哥。'], ['sis', 'She is my younger sister.', '她是我妹妹。']]
        .map(([k, en, zh]) => ({ k, a: k, en, zh })),
      toy: [['🐶', 'chó bông'], ['🧸', 'gấu bông'], ['⚽', 'quả bóng'], ['🚗', 'ô tô']].map(([e, vi]) => ({ k: e, e, vi })),
    },
  }[COURSE];
  const TITLE = { tuoi: 'Con mấy tuổi?', cx: 'Hôm nay con thấy thế nào?', nguoi: 'Con giới thiệu ai trong nhà?', toy: 'Đồ chơi con thích nhất?' };

  /* ---------- nội dung: câu (L) ----------
     pic: a = nhân vật (một hoặc nhiều), e = biểu tượng; aud = khán giả làm gì khi con nói xong;
     need = cần lựa chọn nào; free = chỗ trống của con (nói gì cũng tính); ask = khán giả hỏi trước, con đáp. */
  const L = (u, pic, en, zh, more) => Object.assign({ u, pic, en, zh }, more || {});
  const C = {
    ls: {
      units: {
        1: { ten: 'Unit 1 · Chào hỏi', mo: [],
          khuc: [L(1, { a: ['bong', 'anna', 'vu'] }, 'Hello, everyone!', '大家好！', { aud: 'wave' }),
                 L(1, { a: ['teacher'] }, 'Hello, teacher!', '老师，你好！', { aud: 'wave' }),
                 L(1, { a: ['mommy', 'daddy'] }, 'Hello, mommy! Hello, daddy!', '妈妈，你好！爸爸，你好！', { aud: 'wave' }),
                 L(1, { a: ['anna'] }, 'Hello, friend!', '朋友，你好！', { aud: 'wave' })],
          hoi: L(1, { a: ['puppy'] }, 'Hello, puppy!', '小狗，你好！', { ask: { a: 'puppy', en: 'Woof! Woof!', zh: '汪汪！汪汪！' } }),
          ket: L(1, { e: '👋' }, 'Goodbye, all! See you tomorrow!', '大家再见！明天见！', { aud: 'clap' }) },
        5: { ten: 'Unit 5 · Cảm xúc',
          mo: [L(1, { a: ['bong', 'anna', 'vu'] }, 'Hello, everyone!', '大家好！', { aud: 'wave' }),
               L(2, { me: 1 }, 'My name is ___.', '我叫___。', { free: 1, aud: 'clap' })],
          khuc: [L(5, { cx: 1 }, 'I am {cx}!', '我很{cx}！', { need: 'cx', aud: 'clap' }),
                 L(5, { e: '❓' }, 'How do you feel?', '你心情怎么样？', { aud: 'faces' })],
          hoi: L(2, { tuoi: 1 }, "I'm {tuoi}.", '我{tuoi}岁。', { need: 'tuoi', ask: { a: 'host', en: 'How old are you?', zh: '你几岁？' } }),
          ket: L(1, { e: '👋' }, 'Goodbye, all! See you tomorrow!', '大家再见！明天见！', { aud: 'clap' }) },
      },
      /* kho ôn bất ngờ: mỗi unit cũ 2 câu, vòng quay rút 2 câu ở 2 unit khác nhau */
      kho: { 1: [L(1, { a: ['teacher'] }, 'Hello, teacher!', '老师，你好！', { aud: 'wave' }), L(1, { a: ['puppy'] }, 'Hello, puppy!', '小狗，你好！', { aud: 'wave' })],
             2: [L(2, { e: '🎂' }, 'Happy birthday!', '生日快乐！', { aud: 'clap' }), L(2, { e: '1️⃣2️⃣3️⃣' }, 'One, two, three! Hello, friends!', '一、二、三！大家好！', { aud: 'wave' })],
             3: [L(3, { a: ['grandpa', 'grandma', 'mommy', 'daddy'] }, 'This is my family!', '这是我的家人！', { aud: 'clap' }), L(3, { nguoi: 1 }, '{nguoi}', '{nguoi}', { need: 'nguoi', aud: 'clap' })],
             4: [L(4, { e: '👀' }, 'I have big eyes.', '我有大大的眼睛。', { aud: 'clap' }), L(4, { e: '👃' }, 'Touch your nose!', '摸摸鼻子！', { aud: 'nose' })] },
    },
    sd: {
      units: {
        1: { ten: 'Unit 1 · Good morning!', mo: [],
          khuc: [L(1, { a: ['teacher'] }, 'Good morning, Mrs Lan!', 'Lan老师，早上好！', { aud: 'wave' }),
                 L(1, { a: ['grandpa'] }, 'Hello, Grandpa!', '爷爷，您好！', { aud: 'wave' }),
                 L(1, { a: ['bong', 'anna', 'vu'] }, 'Hello, kids!', '小朋友们，你们好！', { aud: 'wave' })],
          hoi: L(1, { a: ['leo'] }, 'Sorry, Leo!', 'Xiaomei，对不起！', { ask: { a: 'host', en: 'Oh no! My book!', zh: '哎呀！我的书！' } }),
          ket: L(1, { e: '👋' }, 'Goodbye, Mrs Lan! See you tomorrow!', '老师再见！明天见！', { aud: 'clap' }) },
        5: { ten: "Unit 5 · Leo's Birthday",
          mo: [L(1, { a: ['bong', 'anna', 'vu'] }, 'Hello, everyone!', '大家好！', { aud: 'wave' }),
               L(2, { me: 1 }, 'My name is ___.', '我叫___。', { free: 1, aud: 'clap' })],
          khuc: [L(5, { cx: 1 }, 'I feel {cx}!', '我很{cx}！', { need: 'cx', aud: 'clap' }),
                 L(5, { toy: 1 }, 'This is my favourite toy.', '这是我最喜欢的玩具。', { need: 'toy', aud: 'clap' }),
                 L(5, { e: '❓' }, 'How do you feel?', '你感觉怎么样？', { aud: 'faces' })],
          hoi: L(2, { tuoi: 1 }, "I'm {tuoi} years old.", '我{tuoi}岁。', { need: 'tuoi', ask: { a: 'host', en: 'How old are you?', zh: '你几岁？' } }),
          ket: L(2, { e: '👋' }, 'Thank you! See you tomorrow!', '谢谢！明天见！', { aud: 'clap' }) },
      },
      kho: { 1: [L(1, { a: ['teacher'] }, 'Good morning, Mrs Lan!', 'Lan老师，早上好！', { aud: 'wave' }), L(1, { a: ['grandpa'] }, 'Hello, Grandpa!', '爷爷，您好！', { aud: 'wave' })],
             4: [L(4, { e: '👏🦶' }, 'Clap your hands! Stamp your feet!', '拍拍手！跺跺脚！', { aud: 'stamp' }), L(4, { e: '🖐️' }, 'Look! Five fingers!', '看！五个手指！', { aud: 'clap' })],
             2: [L(2, { a: ['vu'] }, 'Nice to meet you!', '很高兴认识你！', { aud: 'wave' }), L(2, { e: '🎂' }, 'Happy birthday!', '生日快乐！', { aud: 'clap' })],
             3: [L(3, { a: ['grandpa', 'mommy', 'daddy'] }, 'This is my family. I love my family!', '这是我的家。我爱我的家人！', { aud: 'clap' }), L(3, { nguoi: 1 }, '{nguoi}', '{nguoi}', { need: 'nguoi', aud: 'clap' })] },
    },
  }[COURSE];
  const UNITS = Object.keys(C.units).map(Number);

  /* ---------- lưu ---------- */
  function store() { if (typeof P !== 'object' || !P) return { lv: {}, ch: {}, used: [], d: '' }; P.sk = P.sk || {}; P.sk.lv = P.sk.lv || {}; P.sk.ch = P.sk.ch || {}; P.sk.used = P.sk.used || []; return P.sk; }
  function persist() { try { if (typeof save === 'function') save(); } catch (e) {} }
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const TEACHER = /[?&]gv=1/.test(location.search);

  /* ---------- giọng mẫu + nghe (giống game Phép thuật lời nói) ---------- */
  function speak(text, lang) {
    if (window.SK_TEST && window.SK_TEST.mute) return new Promise(res => setTimeout(res, 120));
    return new Promise(res => {
      try {
        if (!window.speechSynthesis) return res(); speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(String(text).replace(/Bông/g, 'Bong').replace(/___/g, '')); u.lang = lang === 'zh' ? 'zh-CN' : 'en-US'; u.rate = .85;
        const v = speechSynthesis.getVoices().find(x => x.lang.replace('_', '-').startsWith(u.lang)); if (v) u.voice = v;
        u.onend = u.onerror = () => res(); speechSynthesis.speak(u); setTimeout(res, 6000);
      } catch (e) { res(); }
    });
  }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const canListen = () => !!(SR || window.SK_TEST);
  const canAuto = () => window.SK_TEST ? !!window.SK_TEST.auto : !!SR;
  let rec = null;
  function listen(lang, onInterim) {
    if (window.SK_TEST) return new Promise(res => { window.SK_TEST.pending = t => res({ alts: [String(t)] }); });
    return new Promise(res => {
      let alts = [], err = '';
      try {
        rec = new SR(); rec.lang = lang === 'zh' ? 'zh-CN' : 'en-US'; rec.interimResults = true; rec.maxAlternatives = 5; rec.continuous = false;
        rec.onresult = e => { const r = e.results[e.results.length - 1]; alts = [...r].map(a => a.transcript); onInterim && onInterim(alts[0]); };
        rec.onerror = e => { err = e.error || 'loi'; };
        rec.onend = () => { rec = null; res({ alts, err }); };
        rec.start(); setTimeout(() => { try { rec && rec.stop(); } catch (e) {} }, 8000);
      } catch (e) { res({ alts: [], err: 'khong-ho-tro' }); }
    });
  }
  function stopRec() { if (rec) { try { rec.abort(); } catch (e) {} } }
  const NUM_EN = { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten' };
  const NUM_ZH = { 1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六', 7: '七', 8: '八', 9: '九', 10: '十' };
  function norm(s, lang) {
    s = String(s || '');
    if (lang === 'en') return ' ' + s.toLowerCase().replace(/\b(10|[1-9])\b/g, d => NUM_EN[d]).replace(/[^a-zà-ỹ' ]+/g, ' ').replace(/\s+/g, ' ') + ' ';
    return s.replace(/10|[1-9]/g, d => NUM_ZH[d]).replace(/[\s，。！？,.!?、]/g, '');
  }
  /* chấm rộng tay: ≥ 60% từ (tiếng Anh) / chữ (tiếng Trung) của câu mẫu có trong lời con */
  function match(line, lang, alts) {
    if (!alts.length) return false;
    if (line.free) return alts.some(a => String(a).trim().length > 0);
    const tgt = norm(text(line, lang), lang);   // câu đã điền lựa chọn của con
    const words = lang === 'en' ? [...new Set(tgt.trim().split(' ').filter(w => w.length > 1))] : [...new Set([...tgt])];
    if (!words.length) return true;
    return alts.map(a => norm(a, lang)).some(x => words.filter(w => lang === 'en' ? x.includes(' ' + w + ' ') : x.includes(w)).length >= Math.max(1, Math.ceil(words.length * .6)));
  }
  let AC = null;
  function tone(kind) {
    try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const t = AC.currentTime;
      if (kind === 'ting') { const o = AC.createOscillator(), g = AC.createGain(); o.frequency.setValueAtTime(1320, t); o.frequency.exponentialRampToValueAtTime(1760, t + .12);
        g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.18, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + .35); o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + .4); return; }
      // vỗ tay: vài nhịp tiếng ồn ngắn
      for (let i = 0; i < 7; i++) { const len = .05, b = AC.createBuffer(1, AC.sampleRate * len, AC.sampleRate), d = b.getChannelData(0);
        for (let j = 0; j < d.length; j++) d[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / d.length, 3);
        const s = AC.createBufferSource(), g = AC.createGain(); s.buffer = b; g.gain.value = .22; s.connect(g); g.connect(AC.destination); s.start(t + i * .11 + Math.random() * .04); }
    } catch (e) {}
  }

  /* ---------- dựng bài nói ---------- */
  const fill = (t, lang, ch) => String(t)
    .replace('{cx}', (PICK.cx.find(x => x.k === ch.cx) || PICK.cx[0])[lang])
    .replace('{tuoi}', (PICK.tuoi.find(x => x.k === ch.tuoi) || PICK.tuoi[1])[lang])
    .replace('{nguoi}', (PICK.nguoi.find(x => x.k === ch.nguoi) || PICK.nguoi[0])[lang]);
  /* vòng quay: 2 câu ở 2 unit cũ khác nhau, tránh câu vừa rút lần trước để lần lượt ôn hết */
  function spin(unit) {
    const olds = Object.keys(C.kho).map(Number).filter(u => u < unit);
    if (!olds.length) return [];
    const s = store(), all = [];
    olds.forEach(u => C.kho[u].forEach((l, i) => all.push({ id: u + '.' + i, u, l })));
    const fresh = all.filter(x => !s.used.includes(x.id)), pool = fresh.length >= 2 ? fresh : all;
    const out = [];
    for (const x of pool.sort(() => Math.random() - .5)) { if (out.length < 2 && !out.some(o => o.u === x.u)) out.push(x); }
    if (out.length < 2) for (const x of pool) if (out.length < 2 && !out.includes(x)) out.push(x);
    s.used = [...s.used.filter(id => !out.some(o => o.id === id)), ...out.map(o => o.id)].slice(-(all.length - 2)); persist();
    return out.map(o => Object.assign({}, o.l, { quay: 1 }));
  }
  function build(unit, wheel) {
    const U = C.units[unit];
    return [...U.mo, ...U.khuc, ...wheel, Object.assign({}, U.hoi, { hoi: 1 }), U.ket];
  }

  /* ---------- khung trang ---------- */
  let root = null, S = null;
  const $ = id => document.getElementById(id);
  const AUD = { ls: ['bong', 'anna', 'vu', 'kitten', 'puppy'], sd: ['bong', 'anna', 'vu', 'grandpa', 'teacher'] }[COURSE];
  function open(unit) {
    if (root) return;
    unit = UNITS.includes(+unit) ? +unit : curUnit() || UNITS[0];
    S = { unit, lv: 0, show: [], wheel: [], i: 0, lang: 'en', ok: 0, said: {}, busy: false, tries: 0, end: false, abort: false };
    root = document.createElement('div'); root.className = 'sk'; root.innerHTML = `
      <div class="sk-stage" id="skStage">
        <div class="sk-curtain l"></div><div class="sk-curtain r"></div><div class="sk-spot"></div>
        <div class="sk-strip" id="skStrip"></div>
        <div class="sk-screen" id="skScreen"></div>
        <div class="sk-host" id="skHost"><img alt=""><span class="sk-bub" id="skBub" hidden></span><span class="sk-ear">👂</span></div>
        <div class="sk-clap" id="skClap"><i></i></div>
        <div class="sk-aud" id="skAud">${AUD.map(a => `<span class="sk-p" data-p="${a}"><b class="sk-fx"></b><img src="${NV(IMG[a])}" alt=""></span>`).join('')}</div>
        <div class="sk-pops" id="skPops"></div>
      </div>
      <div class="sk-bar"><button type="button" class="sk-x" aria-label="Đóng">✕</button><div class="sk-said" id="skSaid"></div>
        <button type="button" class="sk-skip" id="skSkip" hidden>Bỏ qua câu ⏭</button>
        <button type="button" class="sk-mic" id="skMic" disabled>🎤<b>Nói</b></button></div>
      <div class="sk-panel" id="skPanel"></div>`;
    document.body.appendChild(root); document.body.classList.add('sk-on');
    try { if (typeof stopAll === 'function') stopAll(); } catch (e) {}
    root.querySelector('.sk-x').onclick = close;
    $('skMic').onclick = () => turn(false);
    $('skSkip').onclick = () => { stopRec(); S.abort = true; next(false); };
    menu();
  }
  function close() { stopRec(); stopCam(); try { speechSynthesis.cancel(); } catch (e) {} if (root) root.remove(); root = null; document.body.classList.remove('sk-on'); }
  function say(t) { const e = $('skSaid'); if (e) e.innerHTML = t; }

  /* ---------- màn chọn bậc ---------- */
  const LV = [{ k: 1, m: '🥉', ten: 'Nói theo', mo: 'Nghe Leo, Xiaomei nói mẫu rồi con nói theo' },
              { k: 2, m: '🥈', ten: 'Nhìn tranh nói', mo: 'Chỉ có tranh, con tự nói; cần thì mới nghe mẫu' },
              { k: 3, m: '🥇', ten: 'Tự nói', mo: 'Slide mờ, con nói xong slide mới hiện' },
              { k: 4, m: '🎬', ten: 'Quay show', mo: 'Quay video bài nói, tải về gửi cô' }];
  function menu() {
    S.end = false; host('en', false); clearScreen();
    const s = store(), done = s.lv[COURSE + S.unit] || 0, p = $('skPanel');
    const U = C.units[S.unit], hasWheel = Object.keys(C.kho).some(u => +u < S.unit);
    p.innerHTML = `<div class="sk-box"><div class="sk-t">🎤 Sân khấu của con · ${h(U.ten)}</div>
      ${TEACHER || UNITS.length > 1 ? `<div class="sk-tabs">${UNITS.map(u => `<button type="button" class="sk-tab${u === S.unit ? ' on' : ''}" data-u="${u}">${h(C.units[u].ten)}</button>`).join('')}</div>` : ''}
      <p class="sk-mo">Con nói một bài giới thiệu bằng <b>tiếng Anh</b> (Leo dẫn) rồi <b>tiếng Trung</b> (Xiaomei dẫn).${hasWheel ? ' Có 🎡 <b>2 câu ôn bất ngờ</b> từ các unit trước và ❓ <b>câu hỏi của khán giả</b>.' : ' Cuối bài có ❓ <b>khán giả gọi, con đáp</b>.'}</p>
      <div class="sk-lvs">${LV.map(l => { const open = TEACHER || l.k <= done + 1;
        return `<button type="button" class="sk-lv${open ? '' : ' khoa'}${l.k <= done ? ' xong' : ''}" data-lv="${l.k}" ${open ? '' : 'disabled'}>
          <span class="sk-m">${open ? l.m : '🔒'}</span><b>${l.ten}</b><small>${h(l.mo)}</small>${l.k <= done ? '<i>✓</i>' : ''}</button>`; }).join('')}</div>
      <p class="sk-note">Xong bậc trước thì mở bậc sau. Mỗi bậc xong lần đầu +2 ⭐.</p></div>`;
    p.hidden = false;
    p.querySelectorAll('[data-u]').forEach(b => b.onclick = () => { S.unit = +b.dataset.u; menu(); });
    p.querySelectorAll('[data-lv]').forEach(b => b.onclick = () => { S.lv = +b.dataset.lv; prep(); });
    say('Chọn bậc để bắt đầu. 🥉 → 🥈 → 🥇 → 🎬');
  }

  /* ---------- chuẩn bị: vòng quay + lựa chọn của con ---------- */
  function prep() {
    const p = $('skPanel'), hasWheel = Object.keys(C.kho).some(u => +u < S.unit);
    S.wheel = hasWheel ? spin(S.unit) : [];
    S.show = build(S.unit, S.wheel);
    const go = () => choices();
    if (!hasWheel) return go();
    p.innerHTML = `<div class="sk-box"><div class="sk-t">🎡 Vòng quay ôn bất ngờ</div>
      <div class="sk-wheel" id="skWheel">${Object.keys(C.kho).filter(u => +u < S.unit).map(u => `<span>U${u}</span>`).join('')}</div>
      <div class="sk-won" id="skWon"></div>
      <button type="button" class="ls-b sk-go" id="skGo" hidden>Tiếp ›</button></div>`;
    say('🎡 Vòng quay chọn 2 câu của các unit trước để con nói thêm hôm nay…');
    const w = $('skWheel'); w.classList.add('quay');
    setTimeout(() => {
      if (!root) return; w.classList.remove('quay');
      $('skWon').innerHTML = S.wheel.map(l => `<div class="sk-card"><span class="sk-cpic">${pic(l, true)}</span><em>Unit ${l.u}</em></div>`).join('');
      $('skGo').hidden = false; $('skGo').onclick = go;
      say(`🎡 Hôm nay con ôn thêm câu của <b>Unit ${S.wheel.map(l => l.u).join('</b> và <b>Unit ')}</b>!`);
    }, window.SK_TEST ? 50 : 1800);
  }
  function choices() {
    const need = [...new Set(S.show.map(l => l.need).filter(Boolean))], s = store(), ch = s.ch[COURSE] = s.ch[COURSE] || {};
    const p = $('skPanel');
    const step = i => {
      if (!root) return;
      if (i >= need.length) return start();
      const k = need[i], opts = PICK[k];
      p.innerHTML = `<div class="sk-box"><div class="sk-t">${h(TITLE[k])}</div>
        <div class="sk-opts">${opts.map((o, j) => `<button type="button" class="sk-opt${ch[k] === o.k ? ' on' : ''}" data-o="${j}">${o.a ? `<img src="${NV(IMG[o.a])}" alt="">` : `<span>${o.e}</span>`}</button>`).join('')}</div>
        ${i === 0 ? `<label class="sk-name">Tên con (ba mẹ gõ giúp, để hiện trên slide): <input id="skTen" maxlength="20" value="${h(ch.ten || '')}"></label>` : ''}</div>`;
      p.hidden = false;
      p.querySelectorAll('[data-o]').forEach(b => b.onclick = () => { const t = $('skTen'); if (t) ch.ten = t.value.trim(); ch[k] = opts[+b.dataset.o].k; persist(); step(i + 1); });
      say('Con chạm một tranh nhé!');
    };
    if (!need.length) { const t = S.show.some(l => l.free); if (!t) return start(); }
    if (!need.length) {   // chỉ cần tên
      p.innerHTML = `<div class="sk-box"><div class="sk-t">Sẵn sàng lên sân khấu!</div><label class="sk-name">Tên con (ba mẹ gõ giúp, để hiện trên slide): <input id="skTen" maxlength="20" value="${h(ch.ten || '')}"></label>
        <button type="button" class="ls-b sk-go" id="skGo">Bắt đầu ›</button></div>`;
      $('skGo').onclick = () => { ch.ten = $('skTen').value.trim(); persist(); start(); }; return;
    }
    step(0);
  }

  /* ---------- tranh ---------- */
  function pic(l, big) {
    const ch = (store().ch[COURSE]) || {};
    if (l.a) return l.a.map(a => `<img src="${NV(IMG[a])}" alt="">`).join('');
    const pc = l.pic || {};
    if (pc.a) return pc.a.map(a => `<img src="${NV(IMG[a])}" alt="">`).join('');
    if (pc.e) return `<span class="sk-e">${pc.e}</span>`;
    if (pc.cx) return `<span class="sk-e">${(PICK.cx.find(x => x.k === ch.cx) || PICK.cx[0]).e}</span>`;
    if (pc.tuoi) return `<span class="sk-e sk-so">${(PICK.tuoi.find(x => x.k === ch.tuoi) || PICK.tuoi[1]).e}</span>`;
    if (pc.toy) return `<span class="sk-e">${(PICK.toy.find(x => x.k === ch.toy) || PICK.toy[0]).e}</span>`;
    if (pc.nguoi) return `<img src="${NV(IMG[(PICK.nguoi.find(x => x.k === ch.nguoi) || PICK.nguoi[0]).a])}" alt="">`;
    if (pc.me) return `<span class="sk-e sk-me">⭐<b>${h(ch.ten || 'Con')}</b></span>`;
    return '';
  }
  const text = (l, lang) => fill(l[lang], lang, store().ch[COURSE] || {}).replace('___', (store().ch[COURSE] || {}).ten || '___');

  /* ---------- chạy bài nói ---------- */
  function seq() { const out = []; ['en', 'zh'].forEach(lang => S.show.forEach((l, i) => out.push({ lang, l, i }))); return out; }
  function start() {
    $('skPanel').hidden = true; S.q = seq(); S.i = 0; S.ok = 0; S.res = []; S.end = false;
    if (S.lv === 4) return film();
    strip(); host('en', true);
    bubble(S.q[0].lang, S.q[0].lang === 'en' ? "Welcome to the show! Your turn!" : '欢迎！该你了！');
    speak('Welcome to the show!', 'en').then(() => setTimeout(line, 300));
  }
  function strip() {
    const cur = S.q[S.i];
    $('skStrip').innerHTML = S.show.map((l, i) => {
      const st = S.res.filter(r => r.i === i), done = st.length && st.every(r => r.ok !== undefined);
      return `<span class="sk-th${cur && cur.i === i ? ' on' : ''}${l.quay ? ' quay' : ''}${l.hoi ? ' hoi' : ''}">${pic(l)}${l.quay ? '<i>🎡</i>' : ''}${l.hoi ? '<i>❓</i>' : ''}${st.map(r => r.ok ? '<u class="ok">✓</u>' : '').join('')}</span>`;
    }).join('') + `<span class="sk-lang">${cur && cur.lang === 'zh' ? '🇨🇳 中文' : '🇬🇧 English'}</span>`;
  }
  function host(lang, show) {
    const hEl = $('skHost'); if (!hEl) return;
    hEl.className = 'sk-host ' + lang + (show ? ' on' : ''); hEl.querySelector('img').src = NV(lang === 'en' ? 'kids_leo_a' : 'kids_xiaomei_a');
  }
  function bubble(lang, t, ms) { const b = $('skBub'); if (!b) return; b.textContent = t; b.hidden = false; clearTimeout(b._t); b._t = setTimeout(() => b.hidden = true, ms || 3000); }
  function clearScreen() { const s = $('skScreen'); if (s) { s.innerHTML = ''; s.className = 'sk-screen'; } const st = $('skStrip'); if (st) st.innerHTML = ''; }
  function screen(l, lang, mode) {
    const s = $('skScreen');
    s.className = 'sk-screen ' + mode + (l.quay ? ' quay' : '') + (l.hoi ? ' hoi' : '');
    s.innerHTML = `${l.quay ? `<span class="sk-tag">🎡 Ôn bất ngờ · Unit ${l.u}</span>` : ''}${l.hoi ? '<span class="sk-tag">❓ Khán giả hỏi</span>' : ''}
      <div class="sk-spic">${pic(l)}</div><div class="sk-stext ${lang}">${h(text(l, lang))}</div>`;
  }
  async function line() {
    if (!root || S.end) return;
    const cur = S.q[S.i]; if (!cur) return finish();
    const { lang, l } = cur, t = text(l, lang);
    if (S.i > 0 && S.q[S.i - 1].lang !== lang) {   // đổi sang tiếng Trung: Xiaomei lên dẫn
      host(lang, true); bubble(lang, '现在说中文！', 2400); say('🇨🇳 Giờ con nói tiếng Trung với Xiaomei nhé!'); await speak('现在说中文！', 'zh'); if (!root) return;
    } else host(lang, true);
    S.tries = 0; strip();
    const mode = S.lv === 1 ? 'mau' : S.lv === 2 ? 'tranh' : 'mo';
    screen(l, lang, mode);
    if (l.ask) {   // khán giả hỏi trước
      const who = l.ask.a === 'host' ? null : root.querySelector(`.sk-p[data-p="${l.ask.a}"]`);
      if (who) { who.classList.add('hoi'); setTimeout(() => who.classList.remove('hoi'), 2600); }
      bubble(lang, l.ask[lang], 3200); say(`❓ ${l.ask.a === 'host' ? (lang === 'en' ? 'Leo' : 'Xiaomei') : 'Khán giả'} hỏi: <b>${h(l.ask[lang])}</b> · Con trả lời nhé!`);
      await speak(l.ask[lang], lang); if (!root) return;
    }
    if (S.lv === 1) { await model(t, lang); }
    else say(l.ask ? `❓ <b>${h(l.ask[lang])}</b> → 🗣️ Con trả lời!` : '🗣️ Đến lượt con!' + (S.lv === 3 ? ' Con nói xong slide mới hiện.' : ' Nhìn tranh rồi nói.'));
    listenNow();
  }
  async function model(t, lang) { bubble(lang, t, 3600); say(`👂 Nghe: <b>${h(t)}</b> → 🗣️ Con nói theo!`); await speak(t, lang); }
  function listenNow() {
    if (!root || S.end) return;
    $('skSkip').hidden = false; $('skMic').disabled = false;
    if (!canListen()) { pulse(); say('🗣️ Con nói xong thì chạm 🎤 để sang câu sau (máy này chưa nghe được giọng nói).'); return; }
    if (!canAuto()) { pulse(); return; }
    setTimeout(() => { if (root && !S.busy && !S.end) { tone('ting'); setTimeout(() => turn(true), 250); } }, 450);
  }
  function pulse() { const m = $('skMic'); if (!m) return; m.classList.remove('luot'); void m.offsetWidth; m.classList.add('luot'); }
  async function turn(auto) {
    if (!root || S.busy || S.end) return; const cur = S.q[S.i]; if (!cur) return;
    const { lang, l } = cur; S.busy = true; S.abort = false;
    const m = $('skMic'), hEl = $('skHost'); m.classList.remove('luot'); m.classList.add('on'); hEl.classList.add('tai'); say('🎧 Đang nghe…');
    if (!canListen()) { S.busy = false; m.classList.remove('on'); hEl.classList.remove('tai'); return next(true); }   // máy không nghe được: con nói rồi chạm 🎤 để đi tiếp
    const r = await listen(lang, x => say('🎧 ' + h(x)));
    S.busy = false; if (!root) return; m.classList.remove('on'); hEl.classList.remove('tai');
    if (S.abort || r.err === 'aborted') return;
    const alts = (r.alts || []).filter(Boolean);
    if (auto && !alts.length && r.err && r.err !== 'no-speech') { pulse(); say('🎤 Con chạm micro rồi nói nhé!'); return; }
    if (match(l, lang, alts)) return next(true);
    // chưa được: thêm một nấc gợi ý rồi thử lại; hết nấc thì vẫn đi tiếp
    S.tries++; const t = text(l, lang), maxTry = S.lv === 3 ? 3 : 2;
    if (S.tries >= maxTry) return next(false);
    if (S.lv === 3 && S.tries === 1) { $('skScreen').classList.remove('mo'); $('skScreen').classList.add('tranh'); say('💡 Nhìn tranh này rồi nói lại nhé!'); return listenNow(); }
    await model(t, lang); listenNow();
  }
  function next(ok) {
    const cur = S.q[S.i]; if (!cur) return;
    $('skSkip').hidden = true; $('skMic').disabled = true; $('skMic').classList.remove('luot');
    S.res.push({ i: cur.i, lang: cur.lang, ok }); if (ok) S.ok++;
    const s = $('skScreen'); s.classList.remove('mo'); s.classList.add(ok ? 'dung' : 'tranh');
    if (ok) { react(cur.l.aud || 'clap', cur.lang); meter(); bubble(cur.lang, cur.lang === 'en' ? ['Great!', 'Super!', 'Wow!'][S.ok % 3] : ['真棒！', '太好了！', '很好！'][S.ok % 3], 1800); }
    else { bubble(cur.lang, cur.lang === 'en' ? 'Good try!' : '很好！', 1800); say(`Mình nói tiếp nhé! Câu này là: <b>${h(text(cur.l, cur.lang))}</b>`); }
    S.i++; strip();
    setTimeout(line, ok ? 1900 : 2300);
  }
  function meter() { const n = S.q.length, f = $('skClap').querySelector('i'); f.style.width = Math.round(100 * S.ok / n) + '%'; }
  function react(kind, lang) {
    tone('clap');
    const ps = [...root.querySelectorAll('.sk-p')], pop = (t) => { const e = document.createElement('span'); e.className = 'sk-pop'; e.textContent = t; e.style.left = (15 + Math.random() * 70) + '%'; $('skPops').appendChild(e); setTimeout(() => e.remove(), 1500); };
    ps.forEach((p, i) => { p.classList.remove('nhun'); void p.offsetWidth; p.style.animationDelay = (i * .07) + 's'; p.classList.add('nhun'); });
    if (kind === 'faces') ps.forEach(p => { const fx = p.querySelector('.sk-fx'); fx.textContent = PICK.cx[Math.floor(Math.random() * PICK.cx.length)].e; fx.classList.add('on'); setTimeout(() => fx.classList.remove('on'), 2200); });
    if (kind === 'nose') ps.forEach(p => { const fx = p.querySelector('.sk-fx'); fx.textContent = '👃'; fx.classList.add('on'); setTimeout(() => fx.classList.remove('on'), 1800); });
    if (kind === 'stamp') ps.forEach(p => { const fx = p.querySelector('.sk-fx'); fx.textContent = '👏🦶'; fx.classList.add('on'); setTimeout(() => fx.classList.remove('on'), 1800); });
    if (kind === 'wave') ps.forEach(p => { const fx = p.querySelector('.sk-fx'); fx.textContent = '👋'; fx.classList.add('on'); setTimeout(() => fx.classList.remove('on'), 1600); });
    for (let i = 0; i < 4; i++) setTimeout(() => root && pop('👏'), i * 120);
  }

  /* ---------- xong bậc ---------- */
  function finish() {
    if (!root || S.end) return; S.end = true; $('skMic').disabled = true; $('skSkip').hidden = true;
    const s = store(), key = COURSE + S.unit, n = S.q.length, first = (s.lv[key] || 0) < S.lv;
    if (first) s.lv[key] = S.lv;
    let star = ''; if (first && typeof addStars === 'function') { addStars(2); star = '<p class="sk-star">+2 ⭐ vào ví của con</p>'; }
    persist(); react('clap'); try { if (typeof confetti === 'function') confetti(70); } catch (e) {}
    const L3 = LV[S.lv - 1], nextLv = LV[S.lv];
    $('skPanel').innerHTML = `<div class="sk-box sk-end"><div class="sk-big">${L3.m}🎤🌟</div><h3>Con là ngôi sao sân khấu!</h3>
      <p>Bậc <b>${L3.ten}</b> · con nói được <b>${S.ok}/${n}</b> câu (${S.q.filter(x => x.lang === 'en').length} tiếng Anh + ${S.q.filter(x => x.lang === 'zh').length} tiếng Trung)</p>
      ${S.wheel.length ? `<p>🎡 Ôn bất ngờ: ${S.wheel.map(l => 'Unit ' + l.u).join(', ')}</p>` : ''}${star}
      <div class="sk-btns"><button type="button" class="ls-b" id="skAgain">↺ Nói lại bậc này</button>${nextLv ? `<button type="button" class="ls-b sk-go" id="skNext">${nextLv.m} ${h(nextLv.ten)} ›</button>` : ''}<button type="button" class="ls-b" id="skDone">Xong</button></div></div>`;
    $('skPanel').hidden = false;
    $('skAgain').onclick = () => prep(); $('skDone').onclick = close;
    if ($('skNext')) $('skNext').onclick = () => { S.lv++; prep(); };
  }

  /* ---------- 🎬 Quay show: camera + slide, chạm "Tiếp" sau mỗi câu ---------- */
  let cam = null, mrec = null, chunks = [];
  function stopCam() { try { mrec && mrec.state !== 'inactive' && mrec.stop(); } catch (e) {} try { cam && cam.getTracks().forEach(t => t.stop()); } catch (e) {} cam = null; }
  async function film() {
    const p = $('skPanel'); host('en', true); strip();
    say('🎬 Con nói từng câu, xong thì chạm <b>Tiếp</b>. Video lưu trên máy này, tải về gửi cô qua Zalo.');
    try { cam = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 }, audio: true }); } catch (e) { cam = null; }
    if (!root) return stopCam();
    if (!cam || !window.MediaRecorder) { p.innerHTML = `<div class="sk-box"><div class="sk-t">🎬 Chưa mở được camera</div><p class="sk-mo">Ba mẹ cho phép dùng camera và micro, hoặc mở bằng Chrome / Safari, rồi thử lại nhé.</p><div class="sk-btns"><button type="button" class="ls-b" id="skBack">‹ Quay lại</button></div></div>`; p.hidden = false; $('skBack').onclick = menu; return; }
    const v = document.createElement('video'); v.className = 'sk-cam'; v.muted = true; v.playsInline = true; v.autoplay = true; v.srcObject = cam; $('skStage').appendChild(v);
    chunks = []; try { mrec = new MediaRecorder(cam); } catch (e) { mrec = null; }
    if (mrec) { mrec.ondataavailable = e => e.data && e.data.size && chunks.push(e.data); mrec.start(); }
    $('skMic').innerHTML = '▶<b>Tiếp</b>'; $('skMic').disabled = false; $('skMic').classList.add('film');
    $('skMic').onclick = () => { S.i++; if (S.i >= S.q.length) endFilm(v); else filmLine(); };
    filmLine();
  }
  function filmLine() {
    const cur = S.q[S.i]; host(cur.lang, true); strip(); screen(cur.l, cur.lang, 'tranh');
    if (cur.l.ask) bubble(cur.lang, cur.l.ask[cur.lang], 3000);
    say(`🎬 ${S.i + 1}/${S.q.length} · Con nói: <b>${h(text(cur.l, cur.lang))}</b> rồi chạm <b>Tiếp</b>`);
  }
  function endFilm(v) {
    $('skMic').disabled = true;
    const done = () => {
      stopCam(); v.remove();
      const blob = new Blob(chunks, { type: (mrec && mrec.mimeType) || 'video/webm' }), url = URL.createObjectURL(blob);
      const s = store(), ch = s.ch[COURSE] || {}, kid = (typeof P === 'object' && P && P.kidId) || '';
      const ext = /mp4/.test(blob.type) ? 'mp4' : 'webm';
      const fname = `${ch.ten || 'Con'}${kid ? ` [${kid}]` : ''} – Sân khấu ${C.units[S.unit].ten.split(' · ')[0]}.${ext}`;
      const key = COURSE + S.unit, first = (s.lv[key] || 0) < 4; if (first) s.lv[key] = 4; persist();
      $('skPanel').innerHTML = `<div class="sk-box sk-end"><div class="sk-t">🎬 Show của con đây!</div><video class="sk-play" src="${url}" controls playsinline></video>
        <p class="sk-mo">Ba mẹ tải video về rồi gửi cô qua Zalo. Cô chọn video hay để lên <b>🌟 Góc vinh danh</b> (tên tệp đã có mã của con nên con sẽ thấy huy hiệu "Video của con").</p>
        <div class="sk-btns"><a class="ls-b sk-go" href="${url}" download="${h(fname)}">⬇ Tải video về</a><button type="button" class="ls-b" id="skDone">Xong</button></div></div>`;
      $('skPanel').hidden = false; $('skDone').onclick = close;
      $('skMic').innerHTML = '🎤<b>Nói</b>'; $('skMic').classList.remove('film'); $('skMic').onclick = () => turn(false);
    };
    if (mrec && mrec.state !== 'inactive') { mrec.onstop = done; mrec.stop(); } else done();
  }

  /* ---------- nút mở: trang chủ và các ngày của Unit 1, Unit 5 ---------- */
  const DAYS = { ls: { 1: [1, 9], 5: [34, 41] }, sd: { 1: [1, 9], 5: [28, 35] } }[COURSE];
  function curDay() {
    const m = (location.hash || '').match(/^#\/ngay\/(\d+)(\/b\d+)?/); if (m) return m[2] ? 0 : +m[1];
    if (/^#?\/?$/.test(location.hash || '')) { const PD = (typeof P === 'object' && P && P.days) || {}; for (let n = 1; n <= 99; n++) if (!(PD[n] || {}).done) return n; }
    return 0;
  }
  function curUnit() { const d = curDay(); for (const u of Object.keys(DAYS)) if (d >= DAYS[u][0] && d <= DAYS[u][1]) return +u; return 0; }
  const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'sk-open'; btn.innerHTML = '🎤<b>Sân khấu của con</b>';
  btn.onclick = () => open(curUnit()); document.body.appendChild(btn);
  function showBtn() { btn.hidden = !(curUnit() || (TEACHER && !/^#\/(ngay\/\d+\/b|co)/.test(location.hash || ''))); }
  addEventListener('hashchange', () => setTimeout(showBtn, 0)); showBtn();
  const q = location.search.match(/[?&]sankhau=(\d+)/); if (q) setTimeout(() => open(+q[1] || 0), 600);
  window.SK_GAME = { open, close, state: () => S, turn };
})();
