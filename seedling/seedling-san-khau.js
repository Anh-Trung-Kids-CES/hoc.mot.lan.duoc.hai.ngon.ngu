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
  const WHO = { teacher: COURSE === 'ls' ? 'Cô Hươu' : 'Cô Lan', mommy: 'Mẹ', daddy: 'Bố', anna: 'Anna', bong: 'Bông', vu: 'Vũ', kitten: 'Mèo con', puppy: 'Cún con', grandpa: 'Ông', grandma: 'Bà', leo: 'Leo', xiaomei: 'Xiaomei' };
  const IMG = { teacher: COURSE === 'ls' ? 'huou_huou1_a' : 'nv_lan_a', mommy: 'fam_bong_me_a', daddy: 'fam_bong_bo_a', bong: 'kids_bong_a', anna: 'kids_anna_a',
    vu: 'nv_vu_a', leo: 'kids_leo_a', xiaomei: 'kids_xiaomei_a', puppy: 'pets_cun_dung_a', kitten: 'pets_meo_dung_a', grandpa: 'fam_bong_ong_a', grandma: 'fam_bong_ba_a',
    bro: 'fam_bong_anh_trai_a', sis: 'fam_bong_em_gai_a' };

  /* ---------- lựa chọn của con (chạm tranh) ----------
     Tuổi: 4–10 cho cả hai khoá (lớp có bé từ 4 đến 10 tuổi). Little Seed mới học số 1–6, số 7–10 là nền PreB: đây là tuổi của chính con
     nên vẫn cho chọn, con nghe mẫu rồi nói. */
  const AVA = ['bong', 'anna', 'vu'].map(a => ({ k: a, a }));
  const TUOI = [4, 5, 6, 7, 8, 9, 10].map(n => ({ k: n, e: String(n), en: ['', '', '', '', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'][n], zh: ['', '', '', '', '四', '五', '六', '七', '八', '九', '十'][n] }));
  const PICK = {
    ls: {
      ava: AVA,
      tuoi: TUOI,
      cx: [['happy', '开心', '😄'], ['sad', '难过', '😢'], ['sleepy', '困', '😴'], ['scared', '害怕', '😨'], ['angry', '生气', '😠'], ['tired', '累', '😩']].map(([en, zh, e]) => ({ k: en, en, zh, e })),
      nguoi: [['grandpa', 'He is my grandpa.', '他是我爷爷。'], ['grandma', 'She is my grandma.', '她是我奶奶。'], ['bro', 'He is my big brother.', '他是我哥哥。'], ['sis', 'She is my little sister.', '她是我妹妹。']]
        .map(([k, en, zh]) => ({ k, a: k, en, zh })),
    },
    sd: {
      ava: AVA,
      tuoi: TUOI,
      cx: [['excited', '兴奋', '🤩'], ['happy', '高兴', '😄'], ['sleepy', '困', '😴']].map(([en, zh, e]) => ({ k: en, en, zh, e })),
      nguoi: [['mommy', 'She is my mother.', '她是我妈妈。'], ['daddy', 'He is my father.', '他是我爸爸。'], ['bro', 'He is my older brother.', '他是我哥哥。'], ['sis', 'She is my younger sister.', '她是我妹妹。']]
        .map(([k, en, zh]) => ({ k, a: k, en, zh })),
      toy: [['🐶', 'chó bông'], ['🧸', 'gấu bông'], ['⚽', 'quả bóng'], ['🚗', 'ô tô']].map(([e, vi]) => ({ k: e, e, vi })),
    },
  }[COURSE];
  const TITLE = { ava: 'Trên sân khấu, con là bạn nào?', tuoi: 'Con mấy tuổi? (ba mẹ giúp con chạm đúng số)', cx: 'Hôm nay con thấy thế nào?', nguoi: 'Con giới thiệu ai trong nhà?', toy: 'Đồ chơi con thích nhất?' };

  /* ---------- nội dung: câu (L) ----------
     pic: a = nhân vật (một hoặc nhiều), e = biểu tượng; aud = khán giả làm gì khi con nói xong;
     need = cần lựa chọn nào; free = chỗ trống của con (nói gì cũng tính); ask = khán giả hỏi trước, con đáp. */
  const L = (u, pic, en, zh, more) => Object.assign({ u, pic, en, zh }, more || {});
  /* to = con nói với ai trong khán giả (người đó vẫy tay và đáp lại bằng rep); ask.a = khán giả hỏi (giơ tay, bước lên, có bóng nói riêng). */
  const HI = { en: 'Hello!', zh: '你好！' }, BYE = { en: 'Goodbye!', zh: '再见！' };
  const C = {
    ls: {
      units: {
        1: { ten: 'Unit 1 · Chào hỏi', aud: ['teacher', 'mommy', 'daddy', 'anna', 'kitten'], mo: [],
          y: 'Con lên sân khấu chào từng người trong khán giả. Cuối bài cô chào con, con chào lại cô.',
          khuc: [L(1, { a: ['anna', 'mommy', 'teacher'] }, 'Hello, everyone!', '大家好！', { to: 'all', rep: HI }),
                 L(1, { a: ['mommy', 'daddy'] }, 'Hello, mommy! Hello, daddy!', '妈妈，你好！爸爸，你好！', { to: ['mommy', 'daddy'], rep: HI }),
                 L(1, { a: ['anna'] }, 'Hello, friend!', '朋友，你好！', { to: ['anna'], rep: HI }),
                 L(1, { a: ['kitten'] }, 'Hello, kitten!', '小猫，你好！', { to: ['kitten'], rep: { en: 'Meow!', zh: '喵！' } })],
          hoi: L(1, { a: ['teacher'] }, 'Hello, teacher!', '老师，你好！', { ask: { a: 'teacher', en: 'Hello, {ten}!', zh: '{ten}，你好！' } }),
          ket: L(1, { e: '👋' }, 'Goodbye, all! See you tomorrow!', '大家再见！明天见！', { to: 'all', rep: BYE, aud: 'clap' }) },
        5: { ten: 'Unit 5 · Cảm xúc', aud: ['teacher', 'bong', 'anna', 'vu', 'puppy'],
          y: 'Con chào, nói tên, nói hôm nay con thấy thế nào, hỏi cảm xúc của khán giả, nói 2 câu ôn bất ngờ, rồi trả lời câu cô hỏi.',
          mo: [L(1, { a: ['anna', 'bong', 'vu'] }, 'Hello, everyone!', '大家好！', { to: 'all', rep: HI }),
               L(2, { me: 1 }, 'My name is ___.', '我叫___。', { free: 1, aud: 'clap' })],
          khuc: [L(5, { cx: 1 }, 'I am {cx}!', '我很{cx}！', { need: 'cx', aud: 'clap' }),
                 L(5, { e: '❓' }, 'How do you feel?', '你心情怎么样？', { aud: 'faces' })],
          hoi: L(2, { tuoi: 1 }, "I'm {tuoi}.", '我{tuoi}岁。', { need: 'tuoi', ask: { a: 'teacher', en: 'How old are you?', zh: '你几岁？' } }),
          ket: L(1, { e: '👋' }, 'Goodbye, all! See you tomorrow!', '大家再见！明天见！', { to: 'all', rep: BYE, aud: 'clap' }) },
      },
      /* kho ôn bất ngờ: mỗi unit cũ 2 câu, vòng quay rút 2 câu ở 2 unit khác nhau */
      kho: { 1: [L(1, { a: ['teacher'] }, 'Hello, teacher!', '老师，你好！', { to: ['teacher'], rep: HI }), L(1, { a: ['puppy'] }, 'Hello, puppy!', '小狗，你好！', { to: ['puppy'], rep: { en: 'Woof!', zh: '汪汪！' } })],
             2: [L(2, { e: '🎂' }, 'Happy birthday!', '生日快乐！', { aud: 'clap' }), L(2, { e: '1️⃣2️⃣3️⃣' }, 'One, two, three! Hello, friends!', '一、二、三！大家好！', { to: 'all', rep: HI })],
             3: [L(3, { a: ['grandpa', 'grandma', 'mommy', 'daddy'] }, 'This is my family!', '这是我的家人！', { aud: 'clap' }), L(3, { nguoi: 1 }, '{nguoi}', '{nguoi}', { need: 'nguoi', aud: 'clap' })],
             4: [L(4, { e: '👀' }, 'I have big eyes.', '我有大大的眼睛。', { aud: 'clap' }), L(4, { e: '👃' }, 'Touch your nose!', '摸摸鼻子！', { aud: 'nose' })] },
    },
    sd: {
      units: {
        1: { ten: 'Unit 1 · Good morning!', aud: ['teacher', 'grandpa', 'bong', 'anna', 'vu'], mo: [],
          y: 'Con lên sân khấu chào các bạn và ông. Cuối bài cô Lan chào cả lớp, con chào lại cô.',
          khuc: [L(1, { a: ['bong', 'anna', 'vu'] }, 'Hello, kids!', '小朋友们，你们好！', { to: ['bong', 'anna', 'vu'], rep: HI }),
                 L(1, { a: ['grandpa'] }, 'Hello, Grandpa!', '爷爷，您好！', { to: ['grandpa'], rep: HI })],
          hoi: L(1, { a: ['teacher'] }, 'Good morning, Mrs Lan!', 'Lan老师，早上好！', { ask: { a: 'teacher', en: 'Good morning, class!', zh: '小朋友们，早上好！' } }),
          ket: L(1, { e: '👋' }, 'Goodbye, Mrs Lan! See you tomorrow!', '老师再见！明天见！', { to: ['teacher'], rep: { en: 'See you tomorrow!', zh: '明天见！' }, aud: 'clap' }) },
        5: { ten: "Unit 5 · Leo's Birthday", aud: ['teacher', 'bong', 'anna', 'vu', 'grandpa'],
          y: 'Con chào, nói tên, nói cảm xúc, khoe đồ chơi, hỏi cảm xúc khán giả, nói 2 câu ôn bất ngờ, rồi trả lời câu cô Lan hỏi.',
          mo: [L(1, { a: ['anna', 'bong', 'vu'] }, 'Hello, everyone!', '大家好！', { to: 'all', rep: HI }),
               L(2, { me: 1 }, 'My name is ___.', '我叫___。', { free: 1, aud: 'clap' })],
          khuc: [L(5, { cx: 1 }, 'I feel {cx}!', '我很{cx}！', { need: 'cx', aud: 'clap' }),
                 L(5, { toy: 1 }, 'This is my favourite toy.', '这是我最喜欢的玩具。', { need: 'toy', aud: 'clap' }),
                 L(5, { e: '❓' }, 'How do you feel?', '你感觉怎么样？', { aud: 'faces' })],
          hoi: L(2, { tuoi: 1 }, "I'm {tuoi} years old.", '我{tuoi}岁。', { need: 'tuoi', ask: { a: 'teacher', en: 'How old are you?', zh: '你几岁？' } }),
          ket: L(2, { e: '👋' }, 'Thank you! See you tomorrow!', '谢谢！明天见！', { to: 'all', rep: BYE, aud: 'clap' }) },
      },
      kho: { 1: [L(1, { a: ['teacher'] }, 'Good morning, Mrs Lan!', 'Lan老师，早上好！', { to: ['teacher'], rep: { en: 'Good morning!', zh: '早上好！' } }), L(1, { a: ['grandpa'] }, 'Hello, Grandpa!', '爷爷，您好！', { to: ['grandpa'], rep: HI })],
             4: [L(4, { e: '👏🦶' }, 'Clap your hands! Stamp your feet!', '拍拍手！跺跺脚！', { aud: 'stamp' }), L(4, { e: '🖐️' }, 'Look! Five fingers!', '看！五个手指！', { aud: 'clap' })],
             2: [L(2, { a: ['vu'] }, 'Nice to meet you!', '很高兴认识你！', { to: ['vu'], rep: { en: 'Nice to meet you, too!', zh: '我也很高兴！' } }), L(2, { e: '🎂' }, 'Happy birthday!', '生日快乐！', { aud: 'clap' })],
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
  /* Nhà hát vẽ bằng Canva theo nét tranh của khoá (nhìn từ cuối khán phòng): nền + lớp khán giả phía trước (tách lớp).
     Toạ độ tính theo % khung tranh 16:9. Khán giả nhìn từ sau lưng → người hỏi / người được chào hiện trong ô "camera cận cảnh". */
  const BG = A + 'trang/sk_nha_hat.webp', FRONT = A + 'trang/sk_khan_gia.webp';
  const HEADS = [[3, 58], [12, 64], [23, 67], [34, 68], [5, 74], [21, 75], [66, 68], [79, 67], [92, 64], [98, 58], [96, 75], [77, 80]];
  const HAND = { l: [30, 63], r: [73, 63] };
  function drawAud() { drawCon(); }
  /* Màn ngang: cả bức tranh, bóng nói nằm trong tranh.
     Điện thoại dọc: phóng tranh vừa phải, cắt bớt hàng ghế phía dưới (chỉ còn đầu các bạn khán giả) và dành phần dưới
     cho khu bóng nói lớn (.sk-talk): lời người dẫn / người hỏi ở trên, câu gợi ý cho con to nhất ở dưới. */
  const ZOOM = 1.55, KEEP = .76;
  function fit() {
    const st = $('skStage'), sc = $('skScene'), vw = $('skView'); if (!st || !sc || !vw) return;
    const doc = st.clientWidth / st.clientHeight < 1.15; root.classList.toggle('doc', doc);
    const W = st.clientWidth, H = st.clientHeight;
    let w = Math.min(W, H * 16 / 9), vh = w * 9 / 16, left = 0;
    if (doc) { w = W * ZOOM; vh = w * 9 / 16 * KEEP; left = -(w - W) / 2; }
    sc.style.width = w + 'px'; sc.style.height = (w * 9 / 16) + 'px'; sc.style.left = left + 'px';
    vw.style.width = (doc ? W : w) + 'px'; vw.style.height = vh + 'px';
  }
  /* khu bóng nói cho điện thoại dọc */
  function talk(which, img, who, t, ms, cls) {
    const el = $(which === 'k' ? 'skTk' : 'skTo'); if (!el) return;
    el.className = 'sk-tl ' + (which === 'k' ? 'k' : 'o') + (cls ? ' ' + cls : '');
    el.innerHTML = which === 'k' ? `<span class="sk-tb">${who ? `<small>${h(who)}</small>` : ''}${h(t)}</span><img src="${img}" alt="">`
      : `<img src="${img}" alt=""><span class="sk-tb"><small>${h(who)}</small>${h(t)}</span>`;
    el.hidden = false; clearTimeout(el._t); el._t = setTimeout(() => el.hidden = true, ms || 2600);
  }
  function drawCon() {
    const ch = store().ch[COURSE] || {}, ava = (PICK.ava.find(x => x.k === ch.ava) || PICK.ava[0]).a;
    const c = $('skCon'); if (!c) return; c.querySelector('img').src = NV(IMG[ava]); $('skConTen').textContent = '⭐ ' + (ch.ten || 'Con');
  }
  /* ô camera cận cảnh: mặt người hỏi / người được chào + bóng nói; ✋ và vòng sáng ở chỗ bạn giơ tay trong hàng ghế */
  function audSay(ids, t, ms, ask) {
    const cam = $('skCam'); if (!cam) return; ids = [].concat(ids).filter(a => IMG[a]); if (!ids.length) return;
    const side = ask ? 'l' : (ids.length > 1 ? 'r' : 'l');
    cam.className = 'sk-cam ' + side + (ask ? ' hoi' : '');
    cam.innerHTML = `<span class="sk-camlb">${ask ? '✋ ' : '📷 '}${h(ids.map(a => WHO[a]).join(', '))}</span><span class="sk-camf">${ids.map(a => `<img src="${NV(IMG[a])}" alt="">`).join('')}</span><span class="sk-camb">${h(t)}</span>`;
    const ring = $('skRing'), p = HAND[side]; ring.style.left = p[0] + '%'; ring.style.top = p[1] + '%'; ring.className = 'sk-ring on' + (ask ? ' hoi' : '');
    talk('o', NV(IMG[ids[0]]), (ask ? '✋ ' : '') + ids.map(a => WHO[a]).join(', ') + (ask ? ' hỏi:' : ''), t, ms || 2600, ask ? 'hoi' : '');
    cam.hidden = false; clearTimeout(cam._t); cam._t = setTimeout(() => { cam.hidden = true; ring.className = 'sk-ring'; }, ms || 2600);
  }
  function camOff() { const c = $('skCam'), r = $('skRing'); if (c) c.hidden = true; if (r) r.className = 'sk-ring'; }
  function open(unit) {
    if (root) return;
    unit = UNITS.includes(+unit) ? +unit : curUnit() || UNITS[0];
    S = { unit, lv: 0, show: [], wheel: [], i: 0, lang: 'en', ok: 0, said: {}, busy: false, tries: 0, end: false, abort: false };
    root = document.createElement('div'); root.className = 'sk'; root.innerHTML = `
      <div class="sk-stage" id="skStage">
        <div class="sk-view" id="skView"><div class="sk-scene" id="skScene">
          <img class="sk-bg" src="${BG}" alt="">
          <div class="sk-screen" id="skScreen"></div>
          <div class="sk-con" id="skCon"><img alt=""><b id="skConTen">⭐ Con</b><span class="sk-bub sk-kb" id="skKb" hidden></span></div>
          <div class="sk-host" id="skHost"><img alt=""><span class="sk-bub" id="skBub" hidden></span><span class="sk-ear">👂</span></div>
          <img class="sk-front" id="skFront" src="${FRONT}" alt="">
          <span class="sk-ring" id="skRing"></span>
          <div class="sk-cam" id="skCam" hidden></div>
          <div class="sk-pops" id="skPops"></div>
        </div></div>
        <div class="sk-talk" id="skTalk"><div class="sk-tl o" id="skTo" hidden></div><div class="sk-tl k" id="skTk" hidden></div></div>
        <div class="sk-top"><div class="sk-strip" id="skStrip"></div><div class="sk-clap" id="skClap"><i></i></div></div>
      </div>
      <div class="sk-bar"><button type="button" class="sk-x" aria-label="Đóng">✕</button><div class="sk-said" id="skSaid"></div>
        <button type="button" class="sk-skip" id="skSkip" hidden>Bỏ qua câu ⏭</button>
        <button type="button" class="sk-mic" id="skMic" disabled>🎤<b>Nói</b></button></div>
      <div class="sk-panel" id="skPanel"></div>`;
    document.body.appendChild(root); document.body.classList.add('sk-on');
    try { if (typeof stopAll === 'function') stopAll(); } catch (e) {}
    root.querySelector('.sk-x').onclick = close;
    fit(); addEventListener('resize', fit);
    $('skMic').onclick = () => turn(false);
    $('skSkip').onclick = () => { stopRec(); S.abort = true; next(false); };
    menu();
  }
  function close() { removeEventListener('resize', fit); stopRec(); stopCam(); try { speechSynthesis.cancel(); } catch (e) {} if (root) root.remove(); root = null; document.body.classList.remove('sk-on'); }
  function say(t) { const e = $('skSaid'); if (e) e.innerHTML = t; }

  /* ---------- màn chọn bậc ---------- */
  const LV = [{ k: 1, m: '🥉', ten: 'Nói theo', mo: 'Nghe Leo, Xiaomei nói mẫu rồi con nói theo' },
              { k: 2, m: '🥈', ten: 'Nhìn tranh nói', mo: 'Chỉ có tranh, con tự nói; cần thì mới nghe mẫu' },
              { k: 3, m: '🥇', ten: 'Tự nói', mo: 'Slide mờ, con nói xong slide mới hiện' },
              { k: 4, m: '🎬', ten: 'Quay show', mo: 'Quay video bài nói, tải về gửi cô' }];
  function menu() {
    S.end = false; host('en', false); clearScreen(); drawAud();
    const s = store(), done = s.lv[COURSE + S.unit] || 0, p = $('skPanel');
    const U = C.units[S.unit], hasWheel = Object.keys(C.kho).some(u => +u < S.unit);
    p.innerHTML = `<div class="sk-box"><div class="sk-t">🎤 Sân khấu của con · ${h(U.ten)}</div>
      ${TEACHER || UNITS.length > 1 ? `<div class="sk-tabs">${UNITS.map(u => `<button type="button" class="sk-tab${u === S.unit ? ' on' : ''}" data-u="${u}">${h(C.units[u].ten)}</button>`).join('')}</div>` : ''}
      <p class="sk-mo">${h(U.y)}<br>Con nói cả bài bằng <b>tiếng Anh</b> (Leo dẫn) rồi <b>tiếng Trung</b> (Xiaomei dẫn).${hasWheel ? '' : ''}</p>
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
    const need = ['ava', ...new Set(S.show.map(l => l.need).filter(Boolean))], s = store(), ch = s.ch[COURSE] = s.ch[COURSE] || {};
    const p = $('skPanel');
    const step = i => {
      if (!root) return;
      if (i >= need.length) return brief();
      const k = need[i], opts = PICK[k];
      p.innerHTML = `<div class="sk-box"><div class="sk-t">${h(TITLE[k])}</div>
        <div class="sk-opts">${opts.map((o, j) => `<button type="button" class="sk-opt${ch[k] === o.k ? ' on' : ''}" data-o="${j}">${o.a ? `<img src="${NV(IMG[o.a])}" alt="">` : `<span>${o.e}</span>`}</button>`).join('')}</div>
        ${i === 0 ? `<label class="sk-name">Tên con (ba mẹ gõ giúp, để hiện trên slide): <input id="skTen" maxlength="20" value="${h(ch.ten || '')}"></label>` : ''}</div>`;
      p.hidden = false;
      p.querySelectorAll('[data-o]').forEach(b => b.onclick = () => { const t = $('skTen'); if (t) ch.ten = t.value.trim(); ch[k] = opts[+b.dataset.o].k; persist(); drawCon(); step(i + 1); });
      say('Con chạm một tranh nhé!');
    };
    if (!need.length) { const t = S.show.some(l => l.free); if (!t) return brief(); }
    if (!need.length) {   // chỉ cần tên
      p.innerHTML = `<div class="sk-box"><div class="sk-t">Sẵn sàng lên sân khấu!</div><label class="sk-name">Tên con (ba mẹ gõ giúp, để hiện trên slide): <input id="skTen" maxlength="20" value="${h(ch.ten || '')}"></label>
        <button type="button" class="ls-b sk-go" id="skGo">Bắt đầu ›</button></div>`;
      $('skGo').onclick = () => { ch.ten = $('skTen').value.trim(); persist(); brief(); }; return;
    }
    step(0);
  }

  /* ---------- kịch bản của con: xem trước cả bài (ai nói, con nói gì), nghe thử ---------- */
  function brief() {
    if (S.lv === 4) return start();
    const p = $('skPanel'), rows = S.show.map(l => {
      const ask = l.ask ? `<div class="sk-row hoi"><img class="sk-who" src="${NV(IMG[l.ask.a])}" alt=""><span><small>${h(WHO[l.ask.a])} hỏi</small>${h(askText(l, 'en'))}<em>${h(askText(l, 'zh'))}</em></span></div>` : '';
      const toWho = l.to ? (l.to === 'all' ? ' → cả khán giả' : ' → ' + l.to.map(a => WHO[a]).join(', ')) : '';
      return ask + `<div class="sk-row${l.quay ? ' quay' : ''}"><span class="sk-rpic">${pic(l)}</span><span><small>${l.ask ? 'Con trả lời' : 'Con nói'}${h(toWho)}${l.quay ? ' · 🎡 ôn Unit ' + l.u : ''}</small>${h(text(l, 'en'))}<em>${h(text(l, 'zh'))}</em></span></div>`;
    }).join('');
    p.innerHTML = `<div class="sk-box"><div class="sk-t">📜 Kịch bản của con</div>
      <p class="sk-mo">Con nói hết bài bằng tiếng Anh (Leo dẫn), rồi nói lại bằng tiếng Trung (Xiaomei dẫn). Dòng có ❓ là lúc khán giả hỏi, con trả lời.</p>
      <div class="sk-rows">${rows}</div>
      <div class="sk-btns"><button type="button" class="ls-b" id="skNghe">🔊 Nghe cả bài</button><button type="button" class="ls-b sk-go" id="skLen">Lên sân khấu ›</button></div></div>`;
    p.hidden = false; say('📜 Ba mẹ cùng con xem kịch bản, chạm 🔊 để nghe cả bài tiếng Anh.');
    let playing = false;
    $('skNghe').onclick = async () => { if (playing) return; playing = true;
      for (const l of S.show) { if (!root || p.hidden) break; if (l.ask) await speak(askText(l, 'en'), 'en'); await speak(text(l, 'en'), 'en'); }
      playing = false; };
    $('skLen').onclick = () => { try { speechSynthesis.cancel(); } catch (e) {} start(); };
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
  const askText = (l, lang) => { const ten = (store().ch[COURSE] || {}).ten; return String(l.ask[lang]).replace('{ten}', ten || (lang === 'en' ? 'friend' : '朋友')); };
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
  /* Phân vai: lời của người dẫn hiện trên đầu Leo / Xiaomei; câu gợi ý cho con và lời con nói hiện trên đầu nhân vật đại diện cho con;
     lời khán giả hiện ở ô cận cảnh / trên đầu khán giả. */
  function kid(t, ms, goiY) {
    const b = $('skKb'); if (!b) return;
    b.className = 'sk-bub sk-kb' + (goiY ? ' goiy' : '');
    b.innerHTML = (goiY ? '<small>🗣️ Con nói:</small>' : '') + h(t); b.hidden = false; clearTimeout(b._t); b._t = setTimeout(() => b.hidden = true, ms || 2600);
    talk('k', kidImg(), goiY ? '🗣️ Con nói:' : '⭐ ' + ((store().ch[COURSE] || {}).ten || 'Con'), t, ms, goiY ? 'goiy' : '');
  }  const kidImg = () => { const ch = store().ch[COURSE] || {}; return NV(IMG[(PICK.ava.find(x => x.k === ch.ava) || PICK.ava[0]).a]); };

  function bubble(lang, t, ms) { talk('o', NV(lang === 'en' ? 'kids_leo_a' : 'kids_xiaomei_a'), lang === 'en' ? 'Leo' : 'Xiaomei', t, ms || 3000); const b = $('skBub'); if (!b) return; b.textContent = t; b.hidden = false; clearTimeout(b._t); b._t = setTimeout(() => b.hidden = true, ms || 3000); }
  function clearScreen() { const s = $('skScreen'); if (s) { s.innerHTML = ''; s.className = 'sk-screen'; } const st = $('skStrip'); if (st) st.innerHTML = ''; }
  function screen(l, lang, mode) {
    const s = $('skScreen');
    s.className = 'sk-screen ' + mode + (l.quay ? ' quay' : '') + (l.hoi ? ' hoi' : '');
    s.innerHTML = `${l.quay ? `<span class="sk-tag">🎡 Ôn bất ngờ · Unit ${l.u}</span>` : ''}${l.hoi ? '<span class="sk-tag">❓ Khán giả hỏi</span>' : ''}
      ${l.ask ? `<div class="sk-q"><img src="${NV(IMG[l.ask.a])}" alt=""><span><small>${h(WHO[l.ask.a])} hỏi:</small><b>${h(askText(l, lang))}</b></span></div><div class="sk-a">🗣️ Con trả lời:</div>` : ''}
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
    if (l.ask) {   // khán giả hỏi trước: người hỏi giơ tay, bước lên, bóng nói riêng; người dẫn giới thiệu
      const q = askText(l, lang);
      bubble(lang, lang === 'en' ? 'Question time!' : '提问时间！', 1800);
      await speak(lang === 'en' ? 'Question time!' : '提问时间！', lang); if (!root) return;
      audSay(l.ask.a, q, 9000, true);
      say(`❓ <b>${h(WHO[l.ask.a])}</b> hỏi con: <b>${h(q)}</b> → ${S.lv === 1 ? `con trả lời: <b>${h(t)}</b>` : 'con trả lời nhé!'}`);
      await speak(q, lang); if (!root) return;
    }
    if (S.lv === 1) { await model(t, lang); if (l.ask) say(`❓ ${h(WHO[l.ask.a])}: <b>${h(askText(l, lang))}</b> → 🗣️ Con trả lời: <b>${h(t)}</b>`); }
    else if (!l.ask) say('🗣️ Đến lượt con!' + (S.lv === 3 ? ' Con nói xong slide mới hiện.' : ' Nhìn tranh rồi nói.'));
    listenNow();
  }
  async function model(t, lang) { kid(t, 4200, true); say(`👂 Nghe: <b>${h(t)}</b> → 🗣️ Con nói theo!`); await speak(t, lang); }
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
    const m = $('skMic'), hEl = $('skHost'); m.classList.remove('luot'); m.classList.add('on'); hEl.classList.add('tai'); $('skCon').classList.add('noi'); say('🎧 Đang nghe…');
    if (!canListen()) { S.busy = false; m.classList.remove('on'); hEl.classList.remove('tai'); return next(true); }   // máy không nghe được: con nói rồi chạm 🎤 để đi tiếp
    const r = await listen(lang, x => say('🎧 ' + h(x)));
    S.busy = false; if (!root) return; m.classList.remove('on'); hEl.classList.remove('tai'); $('skCon').classList.remove('noi');
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
    camOff();
    if (cur.l.to) {   // người được chào đáp lại (cả khi con chưa nói tròn câu): cả khán giả vẫy tay, hoặc ô cận cảnh người được chào
      if (cur.l.to === 'all') setTimeout(() => root && heads('👋', 1800), 250);
      else setTimeout(() => root && audSay(cur.l.to, cur.l.rep[cur.lang], 2400), 250);
      setTimeout(() => speak(cur.l.rep[cur.lang], cur.lang), 300);
    }
    if (ok) { kid(text(cur.l, cur.lang), 1800); react(cur.l.to ? 'clap' : (cur.l.aud || 'clap'), cur.lang); meter(); bubble(cur.lang, cur.lang === 'en' ? ['Great!', 'Super!', 'Wow!'][S.ok % 3] : ['真棒！', '太好了！', '很好！'][S.ok % 3], 1800); }
    else { kid(text(cur.l, cur.lang), 2200, true); bubble(cur.lang, cur.lang === 'en' ? 'Good try!' : '很好！', 1800); say(`Mình nói tiếp nhé! Câu này là: <b>${h(text(cur.l, cur.lang))}</b>`); }
    S.i++; strip();
    setTimeout(line, ok ? 1900 : 2300);
  }
  function meter() { const n = S.q.length, f = $('skClap').querySelector('i'); f.style.width = Math.round(100 * S.ok / n) + '%'; }
  function heads(t, ms) {
    const box = $('skPops'); if (!box) return;
    HEADS.forEach(([x, y], i) => { const e = document.createElement('span'); e.className = 'sk-hfx'; e.style.left = x + '%'; e.style.top = y + '%'; e.style.animationDelay = (i * .05) + 's';
      e.textContent = typeof t === 'function' ? t() : t; box.appendChild(e); setTimeout(() => e.remove(), ms || 1800); });
  }
  function react(kind, lang) {
    tone('clap');
    const fr = $('skFront'); if (fr) { fr.classList.remove('nhun'); void fr.offsetWidth; fr.classList.add('nhun'); }
    if (kind === 'faces') heads(() => PICK.cx[Math.floor(Math.random() * PICK.cx.length)].e, 2400);
    else if (kind === 'nose') heads('👃', 1800);
    else if (kind === 'stamp') heads('🦶', 1800);
    else if (kind === 'wave') heads('👋', 1800);
    else heads('👏', 1500);
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
    const v = document.createElement('video'); v.className = 'sk-video'; v.muted = true; v.playsInline = true; v.autoplay = true; v.srcObject = cam; $('skCon').appendChild(v); $('skCon').classList.add('cam');
    chunks = []; try { mrec = new MediaRecorder(cam); } catch (e) { mrec = null; }
    if (mrec) { mrec.ondataavailable = e => e.data && e.data.size && chunks.push(e.data); mrec.start(); }
    $('skMic').innerHTML = '▶<b>Tiếp</b>'; $('skMic').disabled = false; $('skMic').classList.add('film');
    $('skMic').onclick = () => { S.i++; if (S.i >= S.q.length) endFilm(v); else filmLine(); };
    filmLine();
  }
  function filmLine() {
    const cur = S.q[S.i]; host(cur.lang, true); strip(); screen(cur.l, cur.lang, 'tranh');
    camOff(); if (cur.l.ask) audSay(cur.l.ask.a, askText(cur.l, cur.lang), 6000, true);
    kid(text(cur.l, cur.lang), 60000, true);
    say(`🎬 ${S.i + 1}/${S.q.length} · Con nói: <b>${h(text(cur.l, cur.lang))}</b> rồi chạm <b>Tiếp</b>`);
  }
  function endFilm(v) {
    $('skMic').disabled = true;
    const done = () => {
      stopCam(); v.remove(); $('skCon').classList.remove('cam');
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
  /* ô bài tập trong lưới các bước của ngày (các ngày của Unit 1, Unit 5); huy hiệu = các bậc con đã xong */
  function regrid(box) { const n = box.querySelectorAll('.ht').length; box.classList.toggle('n8', n > 6 && n <= 8); box.classList.toggle('n10', n > 8); }
  function tile() {
    const box = document.querySelector('.dy-tiles'); if (!box || box.querySelector('.ht-sk')) return;
    if (!/^#\/ngay\/\d+$/.test(location.hash || '')) return; const u = curUnit(); if (!u) return;
    const lv = store().lv[COURSE + u] || 0, med = ['', '🥉', '🥉🥈', '🥉🥈🥇', '🥉🥈🥇🎬'][lv];
    box.insertAdjacentHTML('beforeend', `<button type="button" class="ht ht-game ht-sk${lv >= 3 ? ' done' : ''}" style="--tc:#E5484D">
      <span class="ht-img" style="background-image:url('${BG}')"><img class="htg-c" src="${NV(IMG[(PICK.ava.find(x => x.k === (store().ch[COURSE] || {}).ava) || PICK.ava[0]).a])}" alt=""><i class="htg-ic">🎤</i></span>
      ${lv ? `<span class="ht-badge${lv >= 3 ? ' ok' : ''}">${med}</span>` : ''}<span class="ht-lb"><small>Thuyết trình · thêm</small><b>Sân khấu của con</b></span></button>`);
    box.querySelector('.ht-sk').onclick = () => { try { sfx.pop(); } catch (e) {} open(u); };
    regrid(box);
  }
  const appEl = document.getElementById('app'); if (appEl) new MutationObserver(tile).observe(appEl, { childList: true });
  addEventListener('hashchange', () => setTimeout(tile, 0)); tile();
  const q = location.search.match(/[?&]sankhau=(\d+)/); if (q) setTimeout(() => open(+q[1] || 0), 600);
  window.SK_GAME = { open, close, state: () => S, turn };
})();
