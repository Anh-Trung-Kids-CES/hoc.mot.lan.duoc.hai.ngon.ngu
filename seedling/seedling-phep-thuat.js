/* =====================================================================
   PHÉP THUẬT LỜI NÓI · game "con nói – hình đổi" (bản thử Unit 1), dùng chung web Little Seed và Seedling
   Thiết kế: claude/GameLoiNoi_DeXuat.md (chị duyệt 11/11/2026)
   - Leo và Xiaomei là hai phù thuỷ (không thêm nhân vật mới). Con chạm một bạn, nói "Hi, Leo!" / "你好，Xiaomei！"
     để gọi bạn dậy; Leo nghe lệnh tiếng Anh, Xiaomei nghe lệnh tiếng Trung (mỗi thứ tiếng một người nói).
   - Lệnh là câu của Unit 1 (chỉ từ đã học). Nói đủ câu → hình đổi + khen câu; nói một từ → hình vẫn đổi, phù thuỷ nói lại câu mẫu.
   - "No, no!" / "不，不！" rút lại lệnh vừa rồi (cảnh trở lại như trước).
   - Hai thanh phép (đũa Leo, đèn lồng Xiaomei); cùng một ý nói cả hai tiếng = "Phép đôi" (cầu vồng + thẻ phép đôi).
   - Nói một thứ tiếng 3 lần liền → bạn kia vẫy gọi. Máy không nghe ra 2 lần → hiện tranh để chạm (không chặn).
   - Trước khi chơi: ôn mẫu câu ~2 phút. Xong lượt: +2 ⭐ (một lần mỗi ngày). Những bạn con đã gọi ra được giữ lại
     cho lượt sau ("thế giới" lớn dần) – lưu trong P.pt, đồng bộ lên lớp.
   - Nhận giọng: Web Speech API (Chrome, Safari). Giọng của con được gửi tới máy chủ Google / Apple để nhận chữ.
   ===================================================================== */
(function () {
  const COURSE = (typeof KEY === 'string' && KEY === 'lsd') ? 'ls' : 'sd';
  const A = (location.pathname.includes('/little-seed/') ? '../seedling/' : '') + 'tai-nguyen/';
  const NV = n => A + 'nhan-vat/' + n + '.webp';
  const h = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- tên gọi: nhận tên khi máy nghe tiếng Anh hoặc tiếng Trung ---------- */
  const NAME = { bong: '(b[oô]ng|bomb?|boom|bum|bon|bun|bang|邦|棒|崩|蹦|绷|嘣|朋)', anna: '(ann?a|hannah|安娜|阿娜)', leo: '(leo|lio|leah|rio|lee ?o|利奥|里奥|雷欧)',
    xiaomei: '(小美|晓梅|小梅|小妹|肖梅|笑梅|xiao ?mei|show may|she may)', vu: '(v[uũ]|voo|woo|view|vo|武|乌)' };
  /* ---------- nội dung Unit 1 ----------
     actor: các bạn có thể gọi ra; cmd: lệnh. k = ý chung (cùng k ở hai tiếng → phép đôi). full = câu đủ, key = chỉ từ khoá. */
  const ACT = {
    kitten: { img: 'pets_meo_dung_a', h: 26 }, puppy: { img: 'pets_cun_dung_a', h: 26 },
    teacher: { img: COURSE === 'ls' ? 'huou_huou1_a' : 'nv_lan_a', h: 62 }, mommy: { img: 'fam_bong_me_a', h: 62 }, daddy: { img: 'fam_bong_bo_a', h: 64 },
    bong: { img: 'kids_bong_a', h: 50 }, anna: { img: 'kids_anna_a', h: 50 }, vu: { img: 'nv_vu_a', h: 50 }, grandpa: { img: 'fam_bong_ong_a', h: 62 },
    man: { img: 'nv_nguoi_dien_a', h: 60 },
  };
  const hi = (who, k, en, zh, enKey, zhKey, say, sayZh) => [
    { k, l: 'en', full: new RegExp('\\b(hello|hi|good morning)\\b.*' + en + '|' + en + '.*\\b(hello|hi)\\b', 'i'), key: new RegExp(enKey || en, 'i'), say, act: { show: who } },
    { k, l: 'zh', full: new RegExp(zh + '.*(你好|您好|早上好)|(你好|您好|早上好).*' + zh), key: new RegExp(zhKey || zh), say: sayZh, act: { show: who } }];
  const bye = (who, k, en, zh, say, sayZh) => [
    { k, l: 'en', full: new RegExp('\\b(goodbye|good bye|bye)\\b.*' + en + '|' + en + '.*\\b(goodbye|bye)\\b', 'i'), key: null, say, act: { hide: who } },
    { k, l: 'zh', full: new RegExp(zh + '.*再见|再见.*' + zh), key: null, say: sayZh, act: { hide: who } }];
  const C = {
    ls: {
      title: 'Little Seed · Unit 1', bg: ['trang/ls_park', 'trang/ls_school', 'trang/ls_class'], start: [],
      cmds: [
        ...hi('kitten', 'hi_kitten', '\\bkitten\\b', '小猫', '\\bkitten\\b', '小猫', 'Hello, kitten!', '小猫，你好！'),
        ...hi('puppy', 'hi_puppy', '\\bpuppy\\b', '小狗', '\\bpuppy\\b', '小狗', 'Hello, puppy!', '小狗，你好！'),
        ...hi('teacher', 'hi_teacher', '\\bteacher\\b', '老师', '\\bteacher\\b', '老师', 'Hello, teacher!', '老师，你好！'),
        ...hi('mommy', 'hi_mommy', '\\b(mommy|mummy|mom|mum)\\b', '妈妈', null, null, 'Hello, mommy!', '妈妈，你好！'),
        ...hi('daddy', 'hi_daddy', '\\b(daddy|dad)\\b', '爸爸', null, null, 'Hello, daddy!', '爸爸，你好！'),
        ...hi('bong', 'hi_bong', NAME.bong, NAME.bong, null, null, 'Hello, Bông!', 'Bông，你好！'),
        ...hi('anna', 'hi_anna', NAME.anna, NAME.anna, null, null, 'Hello, Anna!', 'Anna，你好！'),
        { k: 'hi_all', l: 'en', full: /\b(hello|hi)\b.*\b(everyone|everybody|friends?)\b/i, key: /\b(everyone|everybody)\b/i, say: 'Hello, everyone!', act: { showAll: ['bong', 'anna', 'kitten', 'puppy'] } },
        { k: 'hi_all', l: 'zh', full: /大家好|朋友.*你好|你好.*朋友/, key: /大家|朋友/, say: '大家好！', act: { showAll: ['bong', 'anna', 'kitten', 'puppy'] } },
        { k: 'day', l: 'en', full: /\bgood morning\b/i, key: /\bmorning\b/i, say: 'Good morning!', act: { time: 'day' } },   // U1 dạy Good morning · 早上好 (bỏ 'Hello, day!' 11/11)
        { k: 'day', l: 'zh', full: /早上好/, key: /早上/, say: '早上好！', act: { time: 'day' } },
        { k: 'night', l: 'en', full: /\bgood night\b|\bsee you\b.*\btomorrow\b/i, key: /\bnight\b|\btomorrow\b/i, say: 'Good night!', act: { time: 'night', hideAll: true } },
        { k: 'night', l: 'zh', full: /晚安|明天见/, key: /晚|明天/, say: '晚安！', act: { time: 'night', hideAll: true } },
        { k: 'go', l: 'en', full: /\blet'?s go\b/i, key: /\bgo\b/i, say: "Let's go!", act: { scene: 1 } },
        { k: 'go', l: 'zh', full: /走吧/, key: /走/, say: '走吧！', act: { scene: 1 } },
        ...bye('kitten', 'bye_kitten', '\\bkitten\\b', '小猫', 'Goodbye, kitten!', '小猫，再见！'),
        ...bye('puppy', 'bye_puppy', '\\bpuppy\\b', '小狗', 'Goodbye, puppy!', '小狗，再见！'),
        ...bye('teacher', 'bye_teacher', '\\bteacher\\b', '老师', 'Goodbye, teacher!', '老师，再见！'),
        ...bye('mommy', 'bye_mommy', '\\b(mommy|mummy|mom|mum)\\b', '妈妈', 'Goodbye, mommy!', '妈妈，再见！'),
        ...bye('daddy', 'bye_daddy', '\\b(daddy|dad)\\b', '爸爸', 'Goodbye, daddy!', '爸爸，再见！'),
        ...bye('bong', 'bye_bong', NAME.bong, NAME.bong, 'Goodbye, Bông!', 'Bông，再见！'),
        ...bye('anna', 'bye_anna', NAME.anna, NAME.anna, 'Goodbye, Anna!', 'Anna，再见！'),
        { k: 'hi_any', l: 'en', full: /\b(hello|hi)\b/i, key: null, say: 'Hello!', act: { showNext: ['kitten', 'puppy', 'bong', 'anna', 'teacher', 'mommy', 'daddy'] } },
        { k: 'hi_any', l: 'zh', full: /你好/, key: null, say: '你好！', act: { showNext: ['kitten', 'puppy', 'bong', 'anna', 'teacher', 'mommy', 'daddy'] } },
        { k: 'bye_any', l: 'en', full: /\b(goodbye|good bye|bye)\b/i, key: null, say: 'Goodbye!', act: { hideLast: true } },
        { k: 'bye_any', l: 'zh', full: /再见/, key: null, say: '再见！', act: { hideLast: true } },
      ],
      hints: { en: ['Hello, kitten!', 'Hello, teacher!', 'Hello, everyone!', 'Goodbye, puppy!', "Let's go!", 'Good night!'],
               zh: ['小猫，你好！', '老师，你好！', '大家好！', '小狗，再见！', '走吧！', '晚安！'] },
      warm: [['en', 'Hello, kitten!', 'kitten'], ['zh', '小狗，你好！', 'puppy'], ['en', 'Goodbye, kitten!', 'kitten'], ['zh', '大家好！', 'bong']],
    },
    sd: {
      title: 'Seedling · Unit 1 + Unit 4', bg: ['trang/ls_school', 'trang/ls_class', 'trang/ls_park'], start: [],
      cmds: [
        ...hi('teacher', 'hi_teacher', '\\b(mrs\\.? ?lan|miss lan|teacher|lan)\\b', '(lan|兰|蓝|岚)?老师', '\\b(lan|teacher)\\b', '老师', 'Good morning, Mrs Lan!', 'Lan老师，早上好！'),
        ...hi('grandpa', 'hi_grandpa', '\\b(grandpa|grandad|granddad)\\b', '爷爷', null, null, 'Hello, Grandpa!', '爷爷，您好！'),
        { k: 'hi_kids', l: 'en', full: /\b(hello|hi|good morning)\b.*\b(kids|class|everyone)\b/i, key: /\b(kids|class)\b/i, say: 'Hello, kids!', act: { showAll: ['bong', 'anna', 'vu'] } },
        { k: 'hi_kids', l: 'zh', full: /小朋友.*(你们好|你好)|(你们好|你好).*小朋友/, key: /小朋友|你们好/, say: '小朋友，你们好！', act: { showAll: ['bong', 'anna', 'vu'] } },
        { k: 'day', l: 'en', full: /\bgood morning\b/i, key: /\bmorning\b/i, say: 'Good morning!', act: { time: 'day' } },
        { k: 'day', l: 'zh', full: /早上好/, key: /早上/, say: '早上好！', act: { time: 'day' } },
        { k: 'night', l: 'en', full: /\bsee you\b.*\btomorrow\b/i, key: /\btomorrow\b/i, say: 'See you tomorrow!', act: { time: 'night', hideAll: true } },
        { k: 'night', l: 'zh', full: /明天见/, key: /明天/, say: '明天见！', act: { time: 'night', hideAll: true } },
        { k: 'go', l: 'en', full: /\blet'?s go\b/i, key: /\bgo\b/i, say: "Let's go!", act: { scene: 1 } },
        { k: 'go', l: 'zh', full: /(我们)?去.+|走吧/, key: /去|走/, say: '我们去公园！', act: { scene: 1 } },
        { k: 'clap', l: 'en', full: /\bclap\b.*\bhands?\b/i, key: /\bclap\b/i, say: 'Clap your hands!', act: { anim: 'clap' } },
        { k: 'clap', l: 'zh', full: /拍拍手|拍手/, key: /拍/, say: '拍拍手！', act: { anim: 'clap' } },
        { k: 'stamp', l: 'en', full: /\bstamp\b.*\bfeet\b/i, key: /\bstamp\b/i, say: 'Stamp your feet!', act: { anim: 'stamp' } },
        { k: 'stamp', l: 'zh', full: /跺跺脚|跺脚/, key: /跺|脚/, say: '跺跺脚！', act: { anim: 'stamp' } },
        { k: 'mouth', l: 'en', full: /\bopen\b.*\bmouth\b/i, key: /\bmouth\b/i, say: 'Open your mouth!', act: { anim: 'mouth' } },
        { k: 'mouth', l: 'zh', full: /张大口|张开嘴|张大嘴/, key: /张|口|嘴/, say: '张大口！', act: { anim: 'mouth' } },
        { k: 'tall', l: 'en', full: /\b(man|he)\b.*\b(very )?tall\b/i, key: /\btall\b/i, say: 'The man is very tall.', act: { show: 'man', tall: true } },
        { k: 'tall', l: 'zh', full: /个子很高|很高/, key: /高/, say: '表演的人个子很高。', act: { show: 'man', tall: true } },
        ...bye('teacher', 'bye_teacher', '\\b(mrs\\.? ?lan|miss lan|teacher|lan)\\b', '老师', 'Goodbye, Mrs Lan!', '老师再见！'),
        ...bye('grandpa', 'bye_grandpa', '\\b(grandpa|grandad)\\b', '爷爷', 'Goodbye, Grandpa!', '爷爷，再见！'),
        { k: 'hi_any', l: 'en', full: /\b(hello|hi)\b/i, key: null, say: 'Hello!', act: { showNext: ['bong', 'anna', 'vu', 'teacher', 'grandpa'] } },
        { k: 'hi_any', l: 'zh', full: /你好|您好/, key: null, say: '你好！', act: { showNext: ['bong', 'anna', 'vu', 'teacher', 'grandpa'] } },
        { k: 'bye_any', l: 'en', full: /\b(goodbye|good bye|bye)\b/i, key: null, say: 'Goodbye!', act: { hideLast: true } },
        { k: 'bye_any', l: 'zh', full: /再见/, key: null, say: '再见！', act: { hideLast: true } },
      ],
      hints: { en: ['Good morning, Mrs Lan!', 'Hello, kids!', 'Clap your hands!', 'Stamp your feet!', 'The man is very tall.', 'See you tomorrow!'],
               zh: ['Lan老师，早上好！', '小朋友，你们好！', '拍拍手！', '跺跺脚！', '表演的人个子很高。', '明天见！'] },
      warm: [['en', 'Good morning, Mrs Lan!', 'teacher'], ['zh', '拍拍手！', 'bong'], ['en', 'Clap your hands!', 'anna'], ['zh', '明天见！', 'vu']],
    },
  }[COURSE];
  /* ---------- sách phép: hàng bong bóng tranh cho con biết mình nói được gì ----------
     pic: a = bạn (ảnh nhân vật), e = biểu tượng, bg = cảnh kế tiếp, bye = thêm tay vẫy. when(S) = lúc nào phép này dùng được.
     Câu mẫu lấy từ C.cmds (cùng k, đúng tiếng của phù thuỷ đang chọn). */
  const LS_KIDS = ['kitten', 'puppy', 'bong', 'anna', 'teacher', 'mommy', 'daddy'];
  const SP_COMMON = [
    { k: 'day', pic: { e: '☀️' }, when: s => s.time === 'night' },
    { k: 'night', pic: { e: '🌙' }, when: s => s.time === 'day' },
    { k: 'go', pic: { bg: 1 }, when: () => true },
  ];
  const SP = {
    ls: [
      ...LS_KIDS.map(a => ({ k: 'hi_' + a, pic: { a }, when: s => !s.shown.includes(a) })),
      { k: 'hi_all', pic: { a: ['bong', 'anna'] }, when: s => ['bong', 'anna', 'kitten', 'puppy'].some(x => !s.shown.includes(x)) },
      ...SP_COMMON,
      ...LS_KIDS.map(a => ({ k: 'bye_' + a, pic: { a, bye: 1 }, when: s => s.shown.includes(a) })),
    ],
    sd: [
      { k: 'hi_teacher', pic: { a: 'teacher' }, when: s => !s.shown.includes('teacher') },
      { k: 'hi_kids', pic: { a: ['bong', 'anna'] }, when: s => ['bong', 'anna', 'vu'].some(x => !s.shown.includes(x)) },
      { k: 'hi_grandpa', pic: { a: 'grandpa' }, when: s => !s.shown.includes('grandpa') },
      { k: 'clap', pic: { e: '👏' }, when: s => s.shown.length > 0 },
      { k: 'stamp', pic: { e: '🦶' }, when: s => s.shown.length > 0 },
      { k: 'mouth', pic: { e: '👄' }, when: s => s.shown.length > 0 },
      { k: 'tall', pic: { a: 'man' }, when: s => !s.tall || !s.shown.includes('man') },
      ...SP_COMMON,
      { k: 'bye_teacher', pic: { a: 'teacher', bye: 1 }, when: s => s.shown.includes('teacher') },
      { k: 'bye_grandpa', pic: { a: 'grandpa', bye: 1 }, when: s => s.shown.includes('grandpa') },
    ],
  }[COURSE];
  const SP_UNDO = { k: 'undo', pic: { e: '↩️' } };
  const UNDO = { en: /\bno\b[ ,!.]*\bno\b|\bno\b/i, zh: /不[，, ]*不|不对|不要|不/ };
  const WAKE = { en: new RegExp('\\b(hi|hello|hey|good morning)\\b.*' + NAME.leo + '|' + NAME.leo + '.*\\b(hi|hello)\\b', 'i'), zh: new RegExp('(你好|您好|早上好).*' + NAME.xiaomei + '|' + NAME.xiaomei + '.*(你好|您好)') };
  const WAKE_KEY = { en: /\b(hi|hello|hey)\b/i, zh: /你好|您好/ };
  const W = { en: { name: 'Leo', img: 'kids_leo_a', wake: 'Hi, Leo!', ok: ['Great!', 'Super!', 'Wow!', 'Good job!'], undo: 'OK!', other: 'I can do magic too!', lang: 'en-US' },
              zh: { name: 'Xiaomei', img: 'kids_xiaomei_a', wake: '你好，Xiaomei！', ok: ['真棒！', '太好了！', '很好！'], undo: '好的！', other: '我也会魔法！', lang: 'zh-CN' } };
  const GOAL = 4;            // mỗi thanh phép 4 lần → xong lượt (≈ 8 câu, ≤ 3 phút)
  const STAR_ROUND = 2;

  /* ---------- lưu trên tiến độ của con ---------- */
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  function store() { if (typeof P !== 'object' || !P) return { cards: {}, world: [] }; P.pt = P.pt || {}; P.pt.cards = P.pt.cards || {}; P.pt.world = P.pt.world || []; return P.pt; }
  function persist() { try { if (typeof save === 'function') save(); } catch (e) {} }

  /* ---------- giọng mẫu (giọng máy của trình duyệt) ---------- */
  function speak(text, lang) {
    return new Promise(res => {
      try {
        if (!window.speechSynthesis) return res(); speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text.replace(/Bông/g, 'Bong')); u.lang = lang === 'zh' ? 'zh-CN' : 'en-US'; u.rate = .85;
        const v = speechSynthesis.getVoices().find(x => x.lang.replace('_', '-').startsWith(u.lang)); if (v) u.voice = v;
        u.onend = u.onerror = () => res(); speechSynthesis.speak(u); setTimeout(res, 6000);
      } catch (e) { res(); }
    });
  }
  /* ---------- nghe ---------- */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const canListen = () => !!(SR || window.PT_TEST);
  let rec = null;
  function listen(lang, onInterim) {
    if (window.PT_TEST) return new Promise(res => { window.PT_TEST.pending = t => res({ alts: [String(t)] }); });
    return new Promise(res => {
      let alts = [], err = '';
      try {
        rec = new SR(); rec.lang = W[lang].lang; rec.interimResults = true; rec.maxAlternatives = 5; rec.continuous = false;
        rec.onresult = e => { const r = e.results[e.results.length - 1]; alts = [...r].map(a => a.transcript); onInterim && onInterim(alts[0]); };
        rec.onerror = e => { err = e.error || 'loi'; };
        rec.onend = () => { rec = null; res({ alts, err }); };
        rec.start(); setTimeout(() => { try { rec && rec.stop(); } catch (e) {} }, 7000);
      } catch (e) { res({ alts: [], err: 'khong-ho-tro' }); }
    });
  }
  const norm = (s, lang) => lang === 'en' ? ' ' + String(s).toLowerCase().replace(/[^a-zà-ỹ' ]+/g, ' ').replace(/\s+/g, ' ') + ' ' : String(s).replace(/[\s，。！？,.!?、]/g, '');

  /* ---------- trạng thái cảnh ---------- */
  let S = null, hist = [], G = null;
  const fresh = () => ({ shown: [...new Set(store().world.filter(x => ACT[x]))].slice(0, 4), time: 'day', scene: 0, tall: false });
  const clone = o => JSON.parse(JSON.stringify(o));

  /* ---------- khung trang ---------- */
  let root = null;
  function open() {
    if (root) return;
    S = fresh(); hist = []; G = { active: '', awake: { en: false, zh: false }, meter: { en: 0, zh: 0 }, done: {}, miss: 0, streak: [], doubles: 0, said: 0, end: false, log: {}, n: 0, bonus: null, bonusDone: false, abort: false };
    root = document.createElement('div'); root.className = 'pt'; root.innerHTML = `
      <div class="pt-scene" id="ptScene"><img class="pt-bg" id="ptBg" alt=""><div class="pt-sky" id="ptSky"><span class="pt-sun"></span><span class="pt-moon"></span></div>
        <div class="pt-stage" id="ptStage"></div><div class="pt-fx" id="ptFx"></div><div class="pt-spells" id="ptSpells" hidden></div>
        <div class="pt-kid" id="ptKid"><span class="pt-kbub" id="ptKb" hidden></span><b>⭐ Con</b></div>
        ${['en', 'zh'].map(l => `<button type="button" class="pt-wiz w-${l} pt-ngu" data-w="${l}" aria-label="${W[l].name}">
          <span class="pt-meter">${Array.from({ length: GOAL }, () => `<i>${l === 'en' ? '⭐' : '🏮'}</i>`).join('')}</span>
          <img src="${NV(W[l].img)}" alt=""><span class="pt-wand"></span><span class="pt-zz">z z</span><span class="pt-ear">👂</span><span class="pt-name">${W[l].name}</span><span class="pt-bub" hidden></span></button>`).join('')}
      </div>
      <div class="pt-bar"><button type="button" class="pt-x" aria-label="Đóng">✕</button>
        <div class="pt-said" id="ptSaid">Chạm Leo hoặc Xiaomei để bắt đầu.</div>
        <button type="button" class="pt-mic" id="ptMic" disabled><span>🎤</span><b id="ptMicT">Nói</b></button>
        <button type="button" class="pt-hint" id="ptHint" aria-label="Gợi ý">💡</button></div>
      <div class="pt-cards" id="ptCards" hidden></div>
      <div class="pt-panel" id="ptPanel" hidden></div>`;
    document.body.appendChild(root); document.body.classList.add('pt-on');
    try { if (typeof stopAll === 'function') stopAll(); } catch (e) {}
    root.querySelector('.pt-x').onclick = close;
    root.querySelectorAll('[data-w]').forEach(b => b.onclick = () => pick(b.dataset.w));
    $('ptMic').onclick = () => turn(false); $('ptHint').onclick = () => showCards(G.active || 'en', true);
    render(true);
    if (!canListen()) say('', 'Máy này chưa nghe được giọng nói (cần Chrome hoặc Safari). Con chạm 💡 để chọn tranh làm phép nhé.');
    warmup();
  }
  function close() { clearTimeout(idleT); try { rec && rec.abort(); } catch (e) {} try { speechSynthesis.cancel(); } catch (e) {} if (root) root.remove(); root = null; document.body.classList.remove('pt-on'); }
  const $ = id => document.getElementById(id);

  function render(first) {
    const stage = $('ptStage'); if (!stage) return;
    $('ptBg').src = A + C.bg[S.scene % C.bg.length] + '.webp';
    $('ptSky').className = 'pt-sky t-' + S.time;
    const want = S.shown;
    stage.querySelectorAll('[data-a]').forEach(el => { if (!want.includes(el.dataset.a)) { el.classList.add('pt-out'); setTimeout(() => el.remove(), 700); } });
    want.forEach((id, i) => {
      let el = stage.querySelector(`[data-a="${id}"]:not(.pt-out)`);
      if (!el) { el = document.createElement('img'); el.dataset.a = id; el.src = NV(ACT[id].img); el.alt = ''; el.className = 'pt-act' + (first ? '' : ' pt-in'); stage.appendChild(el); }
      el.style.maxHeight = ACT[id].h + '%'; el.style.left = (want.length === 1 ? 50 : 22 + i * (56 / Math.max(1, want.length - 1))) + '%';
      el.classList.toggle('pt-cao', id === 'man' && S.tall);
    });
    ['en', 'zh'].forEach(l => root.querySelectorAll(`.w-${l} .pt-meter i`).forEach((x, i) => x.classList.toggle('on', i < G.meter[l])));
  }
  function anim(kind) {
    const els = [...$('ptStage').querySelectorAll('.pt-act:not(.pt-out)')]; if (!els.length) return;
    els.forEach((el, i) => { el.classList.remove('a-clap', 'a-stamp', 'a-mouth', 'a-wave'); void el.offsetWidth; el.style.animationDelay = (i * .08) + 's'; el.classList.add('a-' + kind); });
    if (kind === 'clap') fx('👏'); if (kind === 'stamp') fx('💥'); if (kind === 'mouth') fx('Aaa!');
  }
  function fx(t, cls) { const f = $('ptFx'); if (!f) return; const s = document.createElement('span'); s.className = 'pt-pop ' + (cls || ''); s.textContent = t; f.appendChild(s); setTimeout(() => s.remove(), 1600); }
  function sparkle(l) { const w = root.querySelector('.w-' + l); if (!w) return; w.classList.remove('pt-phep'); void w.offsetWidth; w.classList.add('pt-phep'); }
  function bubble(l, t, ms) { const b = root && root.querySelector(`.w-${l} .pt-bub`); if (!b) return; b.textContent = t; b.hidden = false; clearTimeout(b._t); b._t = setTimeout(() => b.hidden = true, ms || 2600); }
  function say(lang, t) { const el = $('ptSaid'); if (el) el.innerHTML = t; }
  function waveWiz(l) { const wo = root && root.querySelector('.w-' + l); if (!wo) return; wo.classList.remove('pt-goi'); void wo.offsetWidth; wo.classList.add('pt-goi'); clearTimeout(wo._g); wo._g = setTimeout(() => wo.classList.remove('pt-goi'), 3300); }

  /* ---------- gợi ý bằng tranh: con không cần biết chữ ---------- */
  const spText = (sp, l) => sp.k === 'undo' ? (l === 'en' ? 'No, no!' : '不，不！') : ((C.cmds.find(c => c.k === sp.k && c.l === l) || {}).say || '');
  function picHtml(p) {
    if (p.e) return `<span class="pt-pe">${p.e}</span>`;
    if (p.bg) return `<img class="pt-pbg" src="${A + C.bg[(S.scene + 1) % C.bg.length]}.webp" alt="">`;
    return [].concat(p.a).map(a => `<img src="${NV(ACT[a].img)}" alt="">`).join('') + (p.bye ? '<span class="pt-pbye">👋</span>' : '');
  }
  const maxSp = () => matchMedia('(orientation:portrait) and (max-width:820px)').matches ? 4 : 6;
  function spellsFor(l) {
    const o = l === 'en' ? 'zh' : 'en';
    // thứ tự: phép bạn kia đã làm mà mình chưa (🌈 phép đôi) → phép chưa thử → phép đã làm rồi
    const score = sp => { const d = G.done[sp.k] || {}; return d[l] ? 2 : (d[o] ? 0 : 1); };
    const out = SP.filter(sp => sp.when(S) && spText(sp, l)).map((sp, i) => ({ sp, i, s: score(sp) }))
      .sort((a, b) => a.s - b.s || a.i - b.i).map(x => x.sp).slice(0, maxSp());
    if (hist.length) out.push(SP_UNDO);
    return out;
  }
  function drawSpells() {
    const box = $('ptSpells'); if (!box) return;
    const l = G.active;
    if (G.bonus && !G.end) {   // Phép thưởng cuối: hàng quà, mỗi quà là tranh phép cần nói lại
      const B = G.bonus; box.className = 'pt-spells pt-qua'; box.hidden = false;
      box.innerHTML = `<span class="pt-sbook" aria-hidden="true">🎁</span>` + B.list.map((it, i) => { const sp = SP.find(x => x.k === it.k);
        return `<span class="pt-sp ${it.l}${i < B.i ? ' xong' : ''}${i === B.i ? ' nghe' : ''}"><span class="pt-pin">${i <= B.i ? picHtml(sp.pic) : '<span class="pt-pe">🎁</span>'}</span>${i < B.i ? '<i class="pt-sok">✓</i>' : ''}</span>`; }).join('');
      return;
    }
    if (!l || !G.awake[l] || G.end) { box.hidden = true; return; }
    const o = l === 'en' ? 'zh' : 'en', list = spellsFor(l); G.list = list;
    box.className = 'pt-spells ' + l; box.hidden = false;
    box.innerHTML = `<span class="pt-sbook" aria-hidden="true">🪄</span>` + list.map((sp, i) => {
      const d = G.done[sp.k] || {}, dbl = d[o] && !d[l];
      return `<button type="button" class="pt-sp${d[l] ? ' xong' : ''}${dbl ? ' doi' : ''}${sp.k === 'undo' ? ' rut' : ''}" data-sp="${i}" aria-label="${h(spText(sp, l))}">
        <span class="pt-pin">${picHtml(sp.pic)}</span>${dbl ? '<i class="pt-srb">🌈</i>' : ''}${d[l] ? '<i class="pt-sok">✓</i>' : ''}</button>`;
    }).join('');
    box.querySelectorAll('[data-sp]').forEach(b => b.onclick = () => model(list[+b.dataset.sp], l, b));
  }
  /* Phân vai: lời riêng của phù thuỷ hiện trên đầu phù thuỷ; câu con cần nói hiện ở bóng nói của con (giữa, phía dưới) */
  function kidHint(t, sp, ms) {
    const b = $('ptKb'); if (!b) return;
    b.innerHTML = `${sp ? `<span class="pt-bpic">${picHtml(sp.pic)}</span>` : ''}<small>🗣️ Con nói:</small>${h(t)}`; b.hidden = false;
    clearTimeout(b._t); b._t = setTimeout(() => b.hidden = true, ms || 4500);
  }
  function bubbleSp(l, sp, t, ms) {
    const b = root && root.querySelector(`.w-${l} .pt-bub`); if (!b) return;
    b.innerHTML = `<span class="pt-bpic">${picHtml(sp.pic)}</span><span>${h(t)}</span>`; b.hidden = false;
    clearTimeout(b._t); b._t = setTimeout(() => b.hidden = true, ms || 4500);
  }
  /* chạm bong bóng (hoặc phù thuỷ tự rủ): phù thuỷ nói câu mẫu, rồi nút micro nháy "đến lượt con" – chạm tranh không tự làm phép */
  function model(sp, l, el, auto, listenNow) {
    if (!root) return; poke(!auto); stopRec();
    if (listenNow === undefined) listenNow = !auto;   // con tự chạm tranh → micro tự mở; phù thuỷ rủ khi con ngồi im → chỉ nháy nút
    const t = spText(sp, l); if (!t) return;
    root.querySelectorAll('.pt-sp.nghe').forEach(x => x.classList.remove('nghe')); if (el) el.classList.add('nghe');
    kidHint(t, sp); sparkle(l); if (auto) waveWiz(l);
    say(l, `👂 Nghe: <b>${h(t)}</b> &nbsp;→&nbsp; 🗣️ Đến lượt con nói với ${W[l].name}!${listenNow && canAuto() ? '' : ' Chạm 🎤 rồi nói.'}`);
    speak(t, l).then(() => afterModel(l, listenNow));
  }
  /* micro tự mở sau câu mẫu (nhịp "phù thuỷ nói – con nói"): chờ giọng mẫu dứt ~0,5 giây để máy không nghe nhầm giọng mẫu.
     Máy không cho tự mở (iPad/iPhone…) → nút micro nháy chờ con bấm. Con vẫn bấm micro được bất cứ lúc nào. */
  const canAuto = () => !!SR && !(window.PT_TEST && !window.PT_TEST.auto) || !!(window.PT_TEST && window.PT_TEST.auto);
  function afterModel(l, listenNow) {
    if (!listenNow || !canAuto()) return luot();
    setTimeout(() => {
      if (!root || busy || G.end || G.active !== l || !$('ptPanel').hidden || !$('ptCards').hidden) return luot();
      ting(); setTimeout(() => turn(true), 250);
    }, 500);
  }
  function stopRec() { if (rec) { G.abort = true; try { rec.abort(); } catch (e) {} } }
  let AC = null;
  function ting() {
    try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(1320, t); o.frequency.exponentialRampToValueAtTime(1760, t + .12);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.18, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + .35);
      o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + .4); } catch (e) {}
  }
  function luot() { const m = $('ptMic'); if (!m || G.end || m.disabled) return; m.classList.remove('pt-luot'); void m.offsetWidth; m.classList.add('pt-luot'); clearTimeout(m._t); m._t = setTimeout(() => m.classList.remove('pt-luot'), 7000); }
  /* con ngồi im ~9 giây: phù thuỷ tự rủ một phép (tối đa 3 lần liền, con chạm / nói là đếm lại) */
  let idleT = 0, nudges = 0;
  function poke(reset) { clearTimeout(idleT); if (reset !== false) nudges = 0; idleT = setTimeout(nudge, 9000); }
  function nudge() {
    if (!root || G.end || G.bonus) return;
    if (busy || !$('ptPanel').hidden || !$('ptCards').hidden) { idleT = setTimeout(nudge, 4000); return; }
    if (nudges >= 3) return;
    nudges++;
    const l = G.active;
    if (!l) {
      ['en', 'zh'].forEach((x, i) => setTimeout(() => { if (root) waveWiz(x); }, i * 900));
      kidHint(W.en.wake + '  /  ' + W.zh.wake, null, 4200);
      say('', '👆 Chạm <b>Leo</b> (tiếng Anh) hoặc <b>Xiaomei</b> (tiếng Trung) rồi gọi bạn dậy nhé!'); poke(false); return;
    }
    if (!G.awake[l]) { wakeHint(l, false); poke(false); return; }
    suggest(l, false);
  }
  function suggest(l, listenNow) {
    drawSpells(); const list = G.list || [], i = list.findIndex(x => x.k !== 'undo');
    if (i >= 0) model(list[i], l, $('ptSpells').querySelector(`[data-sp="${i}"]`), true, listenNow);
  }
  function wakeHint(l, listenNow) {
    kidHint(W[l].wake, null, 4200); waveWiz(l);
    say(l, `👂 Nghe rồi 🗣️ con gọi: <b>${h(W[l].wake)}</b>${listenNow && canAuto() ? '' : ' · Chạm 🎤 rồi nói.'}`);
    speak(W[l].wake, l).then(() => afterModel(l, listenNow));
  }

  /* ---------- chọn phù thuỷ ---------- */
  function pick(l, quiet) {
    if (G.end || (G.bonus && !quiet)) return;
    G.active = l; root.querySelectorAll('.pt-wiz').forEach(b => b.classList.toggle('pt-chon', b.dataset.w === l));
    const mic = $('ptMic'); mic.disabled = false; mic.classList.toggle('zh', l === 'zh');
    $('ptMicT').textContent = G.awake[l] ? (l === 'en' ? 'Nói với Leo' : '说给 Xiaomei 听') : (l === 'en' ? 'Gọi: Hi, Leo!' : '叫：你好，Xiaomei！');
    say(l, G.awake[l] ? `Con ra lệnh bằng <b>${l === 'en' ? 'tiếng Anh' : 'tiếng Trung'}</b>. Chạm một tranh 🪄 để nghe câu, rồi chạm 🎤 và nói.` : `Chạm 🎤 rồi gọi: <b>${W[l].wake}</b>`);
    $('ptCards').hidden = true; drawSpells(); poke();
    if (!G.awake[l] && !quiet) wakeHint(l, true);
  }

  /* ---------- một lượt nói ---------- */
  let busy = false;
  async function turn(auto) {
    auto = auto === true;
    if (busy || !G.active || G.end) return; const l = G.active; busy = true; poke(); G.abort = false;
    $('ptMic').classList.remove('pt-luot');
    const mic = $('ptMic'), wz = root.querySelector('.w-' + l); mic.classList.add('on'); wz.classList.add('pt-tai'); say(l, '🎧 Đang nghe…');
    if (!canListen()) { busy = false; mic.classList.remove('on'); wz.classList.remove('pt-tai'); if (!G.bonus) showCards(l, true); return; }
    const r = await listen(l, t => say(l, '🎧 ' + h(t)));
    mic.classList.remove('on'); busy = false; if (!root) return; wz.classList.remove('pt-tai'); poke();
    if (G.abort || r.err === 'aborted') { G.abort = false; return; }   // con chạm tranh khác giữa chừng
    const alts = (r.alts || []).filter(Boolean);
    if (r.err === 'not-allowed' || r.err === 'service-not-allowed') { say(l, 'Con cần cho phép dùng micro (ba mẹ bấm "Cho phép"). Tạm thời con chạm tranh nhé.'); if (G.bonus) bonusResult(l, []); else showCards(l, true); return; }
    if (auto && !alts.length && r.err && r.err !== 'no-speech') { luot(); say(l, '🎤 Con chạm micro rồi nói nhé!'); return; }   // máy không cho tự mở micro
    if (G.bonus) return bonusResult(l, alts);
    if (!alts.length) { if (auto) { luot(); say(l, '🎤 Con sẵn sàng thì chạm micro rồi nói nhé!'); return; } return miss(l, ''); }
    say(l, 'Con nói: <b>' + h(alts[0]) + '</b>');
    handle(l, alts);
  }
  function handle(l, alts) {
    const N = alts.map(a => norm(a, l));
    if (!G.awake[l]) {   // gọi phù thuỷ dậy
      if (N.some(n => WAKE[l].test(n)) || (G.miss >= 1 && N.some(n => WAKE_KEY[l].test(n)))) return wake(l, N.some(n => WAKE[l].test(n)));
      return miss(l, W[l].wake);
    }
    if (N.some(n => UNDO[l].test(n)) && !N.some(n => C.cmds.some(c => c.l === l && c.full.test(n)))) return undo(l);
    let hit = null, full = false;
    for (const c of C.cmds) { if (c.l !== l) continue; if (N.some(n => c.full.test(n))) { hit = c; full = true; break; } }
    if (!hit) for (const c of C.cmds) { if (c.l !== l || !c.key) continue; if (N.some(n => c.key.test(n))) { hit = c; break; } }
    if (!hit) return miss(l, '');
    cast(l, hit, full);
  }
  function wake(l, full) {
    G.awake[l] = true; G.miss = 0; root.querySelector('.w-' + l).classList.remove('pt-ngu'); sparkle(l);
    bubble(l, l === 'en' ? 'Hi! I can do magic!' : '你好！我会魔法！'); speak(l === 'en' ? 'Hi! I can do magic!' : '你好！我会魔法！', l);
    pick(l, true); if (typeof sfx === 'object' && sfx.ok) try { sfx.ok(); } catch (e) {}
    setTimeout(() => { if (root && G.active === l && !busy && !G.end) { nudges = 0; suggest(l, true); } }, 2600);   // phù thuỷ rủ ngay phép đầu tiên
  }
  function cast(l, c, full, tap) {
    G.miss = 0; hist.push(clone(S)); if (hist.length > 20) hist.shift();
    if (!G.bonus) {   // nhớ câu nào con mới chạm tranh / mới nói một từ → Phép thưởng cuối
      const id = c.k + '|' + l, st = tap ? 0 : full ? 2 : 1, old = G.log[id];
      if (!old) G.log[id] = { k: c.k, l, st, o: G.n++ }; else if (st > old.st) old.st = st;
    }
    const a = c.act;
    if (a.show) { if (!S.shown.includes(a.show)) S.shown = [...S.shown, a.show].slice(-5); }
    if (a.showAll) S.shown = [...new Set([...S.shown, ...a.showAll])].slice(-5);
    if (a.hide) S.shown = S.shown.filter(x => x !== a.hide);
    if (a.hideAll) S.shown = [];
    if (a.showNext) { const nx = a.showNext.find(x => !S.shown.includes(x)); if (nx) S.shown = [...S.shown, nx].slice(-5); }
    if (a.hideLast) S.shown = S.shown.slice(0, -1);
    if (a.time) S.time = a.time;
    if (a.scene) S.scene = (S.scene + 1) % C.bg.length;
    if (a.tall) S.tall = true;
    sparkle(l); render(); if (a.show || a.showAll) setTimeout(() => anim('wave'), 650); if (a.anim) setTimeout(() => anim(a.anim), 300);
    const w = store(); (a.show ? [a.show] : a.showAll || []).forEach(x => { if (!w.world.includes(x)) w.world.push(x); });
    if (!tap) { G.meter[l] = Math.min(GOAL, G.meter[l] + 1); G.said++; }
    const praise = W[l].ok[G.said % W[l].ok.length];
    if (full) bubble(l, praise + (l === 'en' ? ' Nice sentence!' : ' 说得真好！')); else kidHint(c.say, SP.find(x => x.k === c.k), 4200);
    if (full) speak(praise, l); else speak(c.say, l);
    if (!full) say(l, `Hình đổi rồi! Con thử nói cả câu: <b>${h(c.say)}</b>`);
    else say(l, `✨ <b>${h(c.say)}</b>`);
    // phép đôi
    if (!tap) { G.done[c.k] = G.done[c.k] || {}; G.done[c.k][l] = true; }
    if (G.done[c.k] && G.done[c.k].en && G.done[c.k].zh && !G.done[c.k].double) {
      G.done[c.k].double = true; G.doubles++; const s = store(); s.cards[c.k] = (s.cards[c.k] || 0) + 1;
      setTimeout(() => { fx('🌈', 'rainbow'); sparkle('en'); sparkle('zh'); bubble('en', 'Double magic!'); bubble('zh', '双重魔法！');
        say(l, '🌈 <b>Phép đôi!</b> Con nói một ý bằng cả hai thứ tiếng. Con được 1 thẻ phép đôi!'); }, 900);
    }
    // nói một thứ tiếng 3 lần liền → bạn kia vẫy gọi
    if (!tap) { G.streak.push(l); G.streak = G.streak.slice(-3); }
    const o = l === 'en' ? 'zh' : 'en';
    if (G.streak.length === 3 && G.streak.every(x => x === l) && G.meter[o] < GOAL) setTimeout(() => { bubble(o, W[o].other, 3200); waveWiz(o); }, 1600);
    persist(); render(); drawSpells();
    if (G.meter.en >= GOAL && G.meter.zh >= GOAL) endRound();
  }
  function undo(l, tap) {
    if (!hist.length) { bubble(l, l === 'en' ? 'Nothing to undo!' : '还没有魔法！'); return; }
    S = hist.pop(); render(); sparkle(l); bubble(l, W[l].undo); speak(W[l].undo, l);
    if (!tap) { G.said++; G.meter[l] = Math.min(GOAL, G.meter[l] + 1); } render(); drawSpells();
    say(l, `↩️ Đã rút lại lệnh. Con nói lệnh mới nhé!`);
    if (G.meter.en >= GOAL && G.meter.zh >= GOAL) endRound();
  }
  function miss(l, want) {
    G.miss++;
    if (G.miss >= 2) { say(l, 'Máy chưa nghe rõ. Con chạm một tranh để làm phép, rồi nói theo nhé!'); showCards(l, false); G.miss = 0; return; }
    say(l, want ? `Con thử nói lại: <b>${h(want)}</b>` : 'Con nói to, rõ hơn một chút nhé! Chạm 💡 nếu cần gợi ý.');
    if (want) speak(want, l);
  }
  /* ---------- tranh gợi ý / chạm thay ---------- */
  function showCards(l, hintOnly) {
    const box = $('ptCards'); if (!box || G.bonus || G.end) return; poke();
    const items = !G.awake[l] ? [{ wake: 1 }] : spellsFor(l);
    box.innerHTML = `<div class="pt-ct">${W[l].name} · ${!G.awake[l] ? 'chạm để gọi bạn dậy' : 'chạm một tranh để làm phép, rồi con nói theo nhé'}</div>` +
      items.map((it, i) => `<button type="button" class="pt-card ${l}" data-t="${i}"><span class="pt-cpic">${it.wake ? `<img src="${NV(W[l].img)}" alt="">` : picHtml(it.pic)}</span>
        <em>${h(it.wake ? W[l].wake : spText(it, l))}</em></button>`).join('') + `<button type="button" class="pt-card x" data-close="1">✕</button>`;
    box.hidden = false;
    box.querySelectorAll('[data-t]').forEach(b => b.onclick = () => {
      const it = items[+b.dataset.t]; box.hidden = true;
      if (it.wake) { G.active = l; wake(l, false); return; }
      if (it.k === 'undo') { undo(l, true); return; }
      const c = C.cmds.find(x => x.k === it.k && x.l === l); if (!c) return;
      cast(l, c, false, true); say(l, `Con chạm tranh: <b>${h(c.say)}</b> · Con nói theo để thanh phép đầy nhé!`); setTimeout(luot, 1500);
    });
    box.querySelector('[data-close]').onclick = () => box.hidden = true;
  }
  /* ---------- ôn mẫu câu trước khi chơi ---------- */
  async function warmup() {
    const p = $('ptPanel'); const W8 = [...C.warm, ['en', 'No, no!', 'undo'], ['zh', '不，不！', 'undo']];
    let i = 0;
    const step = () => {
      if (!root) return;
      if (i >= W8.length) { p.hidden = true; say('', 'Chạm <b>Leo</b> (tiếng Anh) hoặc <b>Xiaomei</b> (tiếng Trung) để bắt đầu làm phép!'); nudges = 0; setTimeout(nudge, 700); return; }
      const [l, t, pic] = W8[i];
      const undoStep = pic === 'undo';
      p.innerHTML = `<div class="pt-wbox"><div class="pt-wt">🪄 Ôn mẫu câu trước khi chơi · ${i + 1}/${W8.length}</div>
        <div class="pt-wrow"><img src="${NV(W[l].img)}" alt="" class="pt-wwiz"><div class="pt-wsay ${l}">${undoStep ? `<small>${l === 'en' ? 'Leo' : 'Xiaomei'} làm sai phép? Con rút lại bằng câu:</small>` : `<small>${l === 'en' ? 'Leo nghe tiếng Anh' : 'Xiaomei nghe tiếng Trung'}</small>`}<b>${h(t)}</b></div>
          ${undoStep ? '<span class="pt-wpic">↩️</span>' : `<img src="${NV(ACT[pic].img)}" alt="" class="pt-wpic">`}</div>
        <div class="pt-wbtn"><button type="button" class="ls-b" id="ptW1">🔊 Nghe</button><button type="button" class="ls-b pt-wmic" id="ptW2">🎤 Con nói theo</button>
          <button type="button" class="ls-b" id="ptW3">Tiếp ›</button></div><div class="pt-wfb" id="ptWfb"></div>
        <button type="button" class="pt-wskip" id="ptW4">Bỏ qua phần ôn, vào chơi</button></div>`;
      p.hidden = false; speak(t, l);
      $('ptW1').onclick = () => speak(t, l);
      $('ptW3').onclick = () => { i++; step(); };
      $('ptW4').onclick = () => { i = W8.length; step(); };
      let tries = 0;
      $('ptW2').onclick = async () => {
        if (!canListen()) { i++; return step(); }
        $('ptWfb').textContent = '🎧 Đang nghe…'; const r = await listen(l, x => { const f = $('ptWfb'); if (f) f.textContent = '🎧 ' + x; });
        if (!root) return; tries++;
        const n = (r.alts || []).map(a => norm(a, l)); const tgt = norm(t, l);
        const words = l === 'en' ? tgt.trim().split(' ').filter(w => w.length > 1) : [...tgt];
        const ok = n.some(x => { const hitN = words.filter(w => l === 'en' ? x.includes(' ' + w.replace(/[^a-z']/g, '') + ' ') || x.includes(w.replace(/[^a-z']/g, '')) : x.includes(w)).length; return hitN >= Math.max(1, Math.ceil(words.length * .6)); });
        $('ptWfb').innerHTML = ok ? '⭐ Giỏi quá! Con nói đúng rồi.' : (tries >= 2 ? 'Tốt lắm! Mình chơi rồi luyện tiếp nhé.' : 'Con nghe lại rồi nói theo lần nữa nhé!');
        if (ok || tries >= 2) setTimeout(() => { i++; step(); }, 1200); else speak(t, l);
      };
    };
    step();
  }
  /* ---------- xong lượt ---------- */
  /* ---------- Phép thưởng cuối: tối đa 3 câu con mới chạm tranh / mới nói một từ, xen hai thứ tiếng ----------
     Không gọi là "câu sai" (máy nghe giọng trẻ còn kém). Mỗi câu thử một lần; nói chưa được phép vẫn chạy + "Good try!" → luôn kết thúc vui. */
  function bonusList() {
    const spK = new Set(SP.map(x => x.k));
    const L = Object.values(G.log).filter(x => x.st < 2 && spK.has(x.k) && C.cmds.some(c => c.k === x.k && c.l === x.l)).sort((a, b) => a.st - b.st || a.o - b.o);
    const q = { en: L.filter(x => x.l === 'en'), zh: L.filter(x => x.l === 'zh') }, out = [];
    let want = L.length ? L[0].l : 'en';
    while (out.length < 3 && (q.en.length || q.zh.length)) { const from = q[want].length ? want : (want === 'en' ? 'zh' : 'en'); out.push(q[from].shift()); want = from === 'en' ? 'zh' : 'en'; }
    return out;
  }
  function endRound() {
    if (G.end || G.bonus || G.bonusDone) return; G.bonusDone = true;
    const list = canListen() ? bonusList() : [];
    if (!list.length) return setTimeout(finish, 2200);
    G.bonus = { list, i: 0, ok: 0 }; clearTimeout(idleT);
    setTimeout(() => { if (!root) return; say('', '🎁 <b>Phép thưởng cuối!</b> Leo và Xiaomei rủ con làm thêm vài phép nữa.'); fx('🎁'); bubble('en', 'Bonus magic!', 2400); bubble('zh', '奖励魔法！', 2400); drawSpells(); }, 2200);
    setTimeout(bonusStep, 4600);
  }
  /* dựng cảnh để phép nhìn thấy được (bạn đang có mặt thì cho về trước rồi mới gọi ra…) */
  function prep(c) {
    const a = c.act;
    if (a.show) S.shown = S.shown.filter(x => x !== a.show);
    if (a.showAll) S.shown = S.shown.filter(x => !a.showAll.includes(x));
    if (a.hide && !S.shown.includes(a.hide)) S.shown = [...S.shown, a.hide].slice(-5);
    if (a.time) S.time = a.time === 'day' ? 'night' : 'day';
    if (a.tall) S.tall = false;
    if (a.anim && !S.shown.length) S.shown = ['bong', 'anna'];
    render();
  }
  function bonusStep() {
    if (!root || G.end || !G.bonus) return;
    const B = G.bonus;
    if (B.i >= B.list.length) { G.bonusList = B; G.bonus = null; drawSpells(); return setTimeout(finish, 1500); }
    const it = B.list[B.i], l = it.l, c = C.cmds.find(x => x.k === it.k && x.l === l), sp = SP.find(x => x.k === it.k);
    const cur = B.cur = { c, sp, l };
    prep(c); pick(l, true); drawSpells();
    model(sp, l, null, true, true);
    clearTimeout(B.t); B.t = setTimeout(() => { if (G.bonus && G.bonus.cur === cur && !busy) bonusResult(l, []); }, 16000);   // con không bấm micro → vẫn đi tiếp
  }
  function bonusResult(l, alts) {
    const B = G.bonus, cur = B && B.cur; if (!cur || l !== cur.l) return;
    B.cur = null; clearTimeout(B.t);
    const N = alts.map(a => norm(a, l)), full = N.some(n => cur.c.full.test(n)), key = !full && !!cur.c.key && N.some(n => cur.c.key.test(n));
    cast(l, cur.c, full, true);
    if (full) { B.ok++; say(l, `🎁 ✨ Giỏi quá! <b>${h(cur.c.say)}</b>`); }
    else { bubble(l, l === 'en' ? 'Good try!' : '很好！', 3200); kidHint(cur.c.say, SP.find(x => x.k === cur.c.k), 3200); speak(l === 'en' ? 'Good try!' : '很好！', l);
      say(l, key ? '🎁 Tốt lắm! Lần sau con nói cả câu nhé.' : '🎁 Con cố gắng lắm! Mình làm phép tiếp nhé.'); }
    B.i++; drawSpells(); setTimeout(bonusStep, 2800);
  }
  function finish() {
    if (!root || G.end) return; G.end = true; clearTimeout(idleT); drawSpells(); $('ptMic').disabled = true;
    const s = store(); let star = '';
    if (s.d !== today() && typeof addStars === 'function') { s.d = today(); addStars(STAR_ROUND); star = `<p class="pt-star">+${STAR_ROUND} ⭐ vào ví của con</p>`; }
    persist();
    const cards = Object.keys(s.cards).length;
    const p = $('ptPanel'); p.innerHTML = `<div class="pt-wbox pt-end"><div class="pt-big">🎉🪄🌈</div><h3>Con là phù thuỷ lời nói!</h3>
      <p>Con đã nói <b>${G.said}</b> câu phép thuật · Phép đôi hôm nay: <b>${G.doubles}</b></p><p>Album thẻ phép đôi của con: <b>${cards}</b> thẻ</p>${G.bonusList ? `<p>🎁 Phép thưởng cuối: <b>${G.bonusList.ok}/${G.bonusList.list.length}</b></p>` : ''}${star}
      <div class="pt-wbtn"><button type="button" class="ls-b" id="ptAgain">↺ Chơi lại</button><button type="button" class="ls-b" id="ptDone">Xong</button></div></div>`;
    p.hidden = false; fx('🌈', 'rainbow'); try { if (typeof confetti === 'function') confetti(60); } catch (e) {}
    $('ptAgain').onclick = () => { close(); open(); }; $('ptDone').onclick = close;
  }

  /* ---------- nút mở game: trang chủ và trang ngày của Unit 1 ---------- */
  const DAYS = { ls: [1, 9], sd: [1, 9] }[COURSE];
  const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'pt-open'; btn.innerHTML = '🪄<b>Phép thuật lời nói</b>';
  btn.onclick = open; document.body.appendChild(btn);
  function curDay() {
    const m = (location.hash || '').match(/^#\/ngay\/(\d+)(\/b\d+)?/); if (m) return m[2] ? 0 : +m[1];
    if (/^#?\/?$/.test(location.hash || '')) { const PD = (typeof P === 'object' && P && P.days) || {}; for (let n = 1; n <= 99; n++) if (!(PD[n] || {}).done) return n; }
    return 0;
  }
  function showBtn() { const d = curDay(); btn.hidden = !(d >= DAYS[0] && d <= DAYS[1]); }
  addEventListener('hashchange', () => setTimeout(showBtn, 0)); showBtn();
  if (/[?&]phep=1/.test(location.search)) setTimeout(open, 600);
  window.PT_GAME = { open, close, handle: (l, t) => handle(l, [].concat(t)), state: () => ({ S, G }) };
})();
