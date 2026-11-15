/* Nội dung web dạy buổi trên lớp · UNIT 2 "Name and age" (buổi 4–7) của Little Seed 48 và Seedling 48 – nguồn duy nhất để sửa.
   Làm từng unit, chị duyệt xong unit này mới làm unit sau (chị dặn 12/11/2026).
   Nguồn: kịch bản buổi (KichBan_Offline_LS48.md, KichBan_Offline_SD48.md, phần U2) + dữ liệu học liệu in của từng level
   (little-seed/day/hoc-lieu-data.js, seedling/day/hoc-lieu/hoc-lieu-data.js) = cùng nội dung web học của con (ngày web 10–17).
   Khung buổi: I-R-P-P = buổi 4 Introduce (cô làm mẫu) → 5 Repeat + Introduce → 6 Practice + Introduce → 7 Produce (con làm chủ, cô nghe).
   Số phút từng khối lấy đúng tổng phút của các màn trong kịch bản (LS 70′/65′/68′/69′; SD 76′/73′/75′/80′).
   Sau khi sửa: node buoi/cong-cu/build.js */
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const hl = f => { global.window = global; delete require.cache[require.resolve(path.join(ROOT, f))]; require(path.join(ROOT, f)); return global.window.HL; };
const HLS = hl('little-seed/day/hoc-lieu-data.js'), HSD = hl('seedling/day/hoc-lieu/hoc-lieu-data.js');
const U = (H, k) => H.units.find(u => u.key === String(k));
const r = p => p ? '../' + p : '';
const L = (en, zh, py, o = {}) => ({ en, zh, py, ...o });
const NV = '../seedling/tai-nguyen/nhan-vat/', TR = '../seedling/tai-nguyen/tranh/';
const PRINT = { ls: '../little-seed/day/', sd: '../seedling/day/hoc-lieu/' };
const pr = (lv, h, t) => ({ t, url: PRINT[lv] + h });
const m = (k, id, type, t, p, vai, o = {}) => ({ k, id, type, t, p, vai, ...o });

const ZH = { happy: ['高兴', 'gāoxìng'], "what's your name?": ['你叫什么名字', 'nǐ jiào shénme míngzi'], nice: ['好', 'hǎo'], year: ['岁', 'suì'], again: ['再', 'zài'], ten: ['十', 'shí'] };
const wordsOf = u => Object.fromEntries(u.words.map(w => { const z = ZH[w.en] || []; return [w.en, { en: w.en, zh: w.zh || z[0] || '', py: w.py || z[1] || '', img: r(w.img) }]; }));
const cards = (W, list) => list.map(k => { if (!W[k]) throw new Error('Thiếu từ ' + k); return W[k]; });
const scenes = (u, days) => u.parts.filter(p => days.includes(p.day)).flatMap(p => p.scenes.map(s => ({ en: s.en, zh: s.zh, py: s.py, img: r(s.img), who: s.who })));
const bbPages = (b, from, to, cover) => (cover ? [cover] : []).concat(b.pages.slice(from, to).map(p => ({ en: p.en, zh: p.zh, py: p.py, img: r(p.img) })));
const veLines = (v, idx, mv) => idx.map((i, k) => ({ ...v.lines[i], mv: (mv || [])[k] || '' }));
// khối: cộng đúng số phút các màn trong khối (không tính màn dự phòng)
const khoi = (names, MAN) => { let t = 0; return names.map((nm, i) => { const s = MAN.filter(x => x.k === i + 1 && !x.du).reduce((a, x) => a + x.p, 0); const o = { n: i + 1, t: nm, tu: t, den: t + s }; t += s; return o; }); };
const buoi = (o, names) => ({ ...o, KHOI: khoi(names, o.MAN) });
const kt = (u, l, n) => u.check.filter(c => c.l === l).slice(0, n).map(c => ({ say: { t: c.say, l: c.l }, opts: c.opts.map(r), ans: c.ans }));

const NHAC_GUONG = ['👯 Gương soi: bạn làm, bạn kia soi', '🗣 Nói to từ mục tiêu khi làm động tác'];
const NGHI = ['💧 Uống nước', '🚻 Đi vệ sinh (từng 2 bạn, thẻ toilet pass)', '🔢 Cuối giờ đếm ngược 五 四 三 二 一'];
const CMDN = {
  six: L('Six!', '六！', 'Liù!', { ic: '🖐️' }), ten: L('Ten!', '十！', 'Shí!', { ic: '🙌' }), count: L("Let's count! One, two, three!", '我们数一数！一、二、三！', 'Wǒmen shǔ yi shǔ! Yī, èr, sān!', { ic: '🔢' }),
  bd: L('Happy birthday!', '生日快乐！', 'Shēngrì kuàilè!', { ic: '🎂' }),
  stand: L('Stand up!', '起立！', 'Qǐlì!', { ic: '🧍' }), sit: L('Sit down, please.', '请坐。', 'Qǐng zuò.', { ic: '🪑' }), come: L('Come here, please.', '请过来。', 'Qǐng guòlái.', { ic: '👋' }),
  again: L('Again!', '再来一次！', 'Zài lái yí cì!', { ic: '🔁' }), vgood: L('Very good!', '真棒！', 'Zhēn bàng!', { ic: '👍' }), sing: L("Let's sing!", '我们唱歌吧！', 'Wǒmen chànggē ba!', { ic: '🎵' }),
  seven: L('Seven!', '七！', 'Qī!', { ic: '🖐️' }), nine: L('Nine!', '九！', 'Jiǔ!', { ic: '🙌' }), nice: L('Nice to meet you!', '很高兴认识你！', 'Hěn gāoxìng rènshi nǐ!', { ic: '🤝' }),
  wow: L('Wow! Really?', '哇！真的吗？', 'Wā! Zhēn de ma?', { ic: '😮' }),
};

/* =====================================================================
   LITTLE SEED 48 · Unit 2 Name and age (buổi 4–7, ngày web 10–17) · truyện "Bông's Birthday" · big book "My Name Is…"
   ===================================================================== */
function littleSeed() {
  const u = U(HLS, 2), u1 = U(HLS, 1), W = wordsOf(u), bb = u.bb[0], ve = u.ve[0], ve1 = u1.ve[0];
  const CO = NV + 'huou_huou1_a.webp', CLS = '../seedling/tai-nguyen/trang/ls_class.webp', BB1 = '../little-seed/tai-nguyen-ls/bigbook/u1/', BB2 = '../little-seed/tai-nguyen-ls/bigbook/u2/';
  const CANH = r(u.parts[0].scenes[0].img), CANH2 = r(u.parts[3].scenes[0].img);
  const ch = Object.fromEntries(u.chars.map(c => [c.key, { k: c.key, ten: c.name, img: r(c.img) }]));
  const NAMES = ['Khởi động', 'Khối tiếng Anh', 'Vận động', 'Khối tiếng Trung', 'Nghỉ và làm tay', 'Truyện, big book', 'Tổng kết, việc ở nhà'];
  const VE_DAU = veLines(ve1, [0, 1, 2, 3], ['👋', '👏', '🤲', '🙋']), VE_CUOI = veLines(ve1, [4, 5], ['👋', '🎒']);
  const VE_U = (idx, mv) => veLines(ve, idx, mv);
  const cover = { en: bb.title, zh: bb.title_zh, py: 'Wǒ jiào…', img: BB2 + 'bia_khung.webp', cover: true };
  const HAIR = { cake: W.cake, one: W.one };
  const Q_AGE = { q: L('How old are you?', '你几岁？', 'Nǐ jǐ suì?'), a: L("I'm six!", '我六岁！', 'Wǒ liù suì!'), img: W['how old'].img };
  const Q_NAME = { q: L("What's your name?", '你叫什么名字？', 'Nǐ jiào shénme míngzi?'), a: L('My name is Bông.', '我叫Bông。', 'Wǒ jiào Bông.'), img: W.name.img };
  const ROLES = ['bong', 'me', 'bo', 'leo', 'anna', 'lop'].filter(k => ch[k]).map(k => ch[k]);
  const NUM5 = ['cake', 'one', 'two', 'three', 'four', 'five'];

  const chao = (vai, lead) => m(1, 'chao', 'chao', lead ? 'Con chào cô trước' : 'Chào ở cửa', 1, 'nghe', { lead, img: CLS, co: CO, lines: [L("Hello, teacher! I'm ___.", '老师好！我叫___。', 'Lǎoshī hǎo! Wǒ jiào ___.')],
    con: 'Con chào cô trước, nói tên mình.', note: ['Cô đứng ở cửa, chờ con chào trước. Con 5 tuổi chào cùng bạn lớn cạnh bên.'] });
  const veDau = () => m(1, 've-dau', 've', 'Vè chào đầu buổi · bạn nhỏ bắt nhịp', 2, 'nghe', { lead: true, lines: VE_DAU, img: BB1 + 'p7.webp', con: 'Cả lớp hát vè chào; dòng tên gọi 2–3 bạn. Bạn nhỏ bắt nhịp lượt đầu.', note: ['Cô chỉ bấm 🥁 Nhịp. Dòng 4 gọi tên 2–3 bạn.'] });
  const veCuoi = () => m(7, 've-cuoi', 've', 'Vè chào cuối buổi', 2, 'nghe', { lead: true, lines: VE_CUOI, img: BB1 + 'p9.webp', con: 'Bạn nhỏ bắt nhịp, cả lớp hát, vẫy tay.', note: ['Goodbye, teacher! See you! 老师再见！'] });
  const tong = (b, lines, days, extra) => m(7, 'tong', 'tong', 'Hôm nay con nói được', 4, b === 4 ? 'giup' : 'nghe', { lead: true, lines,
    home: [`Ngày web ${days.join(', ')} (mỗi ngày 10–15 phút).`, `Phiếu tô – dán buổi ${b} (khoảng 10 phút).`, 'Nghe ngấm audio truyện unit lúc con chơi (không bật cả ngày).', ...(extra || [])],
    con: 'Cả lớp đứng vòng tròn, chuyền bóng; bóng đến tay thì con nói 1 câu của buổi bằng hai tiếng (chọn 1 trong 3 thẻ câu).',
    note: ['Bạn đôi khen: "Very good, ___!" · "___，真棒！". Cô khen 1 việc cụ thể cho con chưa được khen.', 'Trao sao hai đội, ghi Bảng của cô. Dặn ba mẹ qua Zalo: "Hôm nay con học Name and age…" và việc ở nhà.'],
    print: [pr('ls', '#/b/' + b, 'Phiếu tô – dán buổi ' + b)] });
  const nghiS = (p) => m(5, 'nghi', 'nghi', 'Nghỉ giải lao', p, 'nghe', { off: true, img: CLS, list: NGHI, con: 'Đi vệ sinh từng 2 bạn; ở lại uống nước.', note: [`Đồng hồ ${p} phút. Cuối giờ đếm ngược 五四三二一.`] });
  const ngheChi = (p, vai, con, note) => m(6, 'nghe-chi', 'book', 'Nghe – chỉ sách · ' + bb.title, p, vai, { off: true, lang: 'en', title: bb.title, title_zh: bb.title_zh, pages: bbPages(bb, 0, 6, cover), con, cue: 'Mở big book của đôi mình, ngón tay sẵn sàng!',
    note: ['Mỗi đôi một big book in (A5), cô một quyển A3. Bấm ▶ Đọc cả lượt: máy đọc cả quyển tiếng Anh rồi cả quyển tiếng Trung (đổi 中文).', '★ Bạn nhỏ: chỉ tranh · ★★ Bạn lớn: chỉ chữ. Trang cuối: cả lớp đứng làm động tác.', ...note], print: [pr('ls', '#/u/2/bigbook', 'Big book in (mỗi đôi 1 bản)')] });
  const duMatNa = () => m(7, 'du', 'hoi', 'Còn thời gian · Mặt nạ · What\'s your name?', 3, 'giup', { du: true, lead: true, off: true, img: CLS, pairs: [{ q: L("What's your name?", '你叫什么名字？', 'Nǐ jiào shénme míngzi?'), a: L('My name is Puppy!', '我叫小狗！', 'Wǒ jiào xiǎogǒu!'), img: ch.bong.img }],
    con: 'Bạn đeo mặt nạ Puppy đáp đùa "My name is Puppy!", cả lớp: "No! What\'s your name?", bạn bỏ mặt nạ nói tên thật.', note: ['Màn dự phòng. 不对！= "No!"'] });

  // ---------------- BUỔI 4 · Introduce ----------------
  const b4 = buoi({ t: 'Buổi 4 · Unit 2 Name and age · Introduce', vai: 'mau', days: [10, 11], next: [12, 13],
    about: 'Truyện phần 1–2 (Hello, Cake! · Six!): nghe, đếm 1–5, nói "I\'m six!". Nội dung mới: cô làm mẫu trước; đôi bạn tự đếm nến.',
    MAN: [
      chao('nghe', false), veDau(),
      m(1, 'on-web', 'chon', 'Ôn web · giơ thẻ mini', 3, 'giup', { off: true, lang: 'en', game: true, items: cards(W, NUM5), cue: 'Thẻ mini sẵn sàng! Nghe và giơ thẻ!',
        con: 'Máy đọc từ, câu của ngày web vừa học; đôi bạn giơ thẻ mini đúng.', note: ['Tắt chiếu. Con chưa làm web ngồi cạnh bạn lớn; cô ghi tên để nhắn ba mẹ.'], print: [pr('ls', '#/u/2/mini', 'Thẻ mini Unit 2')] }),

      m(2, 'the-en', 'flash', 'Thẻ tranh · từ mới phần 1–2', 3, 'mau', { lang: 'en', mode: 'ts', cards: cards(W, NUM5), con: 'Nghe cô đọc 2 lần, nhắc theo, đứng làm động tác.', note: ['cake, one, two, three, four, five: mỗi từ một động tác (cake: hai tay làm hình bánh; số: giơ ngón).'] }),
      m(2, 'truyen-en', 'book', "Truyện · Bông's Birthday (phần 1–2)", 4, 'mau', { lang: 'en', title: "Bông's Birthday", title_zh: 'Bông的生日', pages: scenes(u, [10, 11]),
        con: 'Nghe cả lượt, chỉ tranh; dừng 2 chỗ hỏi; hết phần 2 cả lớp đứng làm 1 lệnh.', hoi: ['Dừng 2 chỗ: "What is it?" – con đáp 1 từ, cô nói lại câu đủ, con nhắc.', 'Rối Leo đoán sai 1 lần ("Seven!"), con sửa: "Six!"'], note: ['Kể lượt tiếng Anh, chỉ vào tranh.'] }),
      m(2, 'dem-nen', 'lam', "Đếm nến · Let's count!", 5, 'giup', { lead: true, off: true, img: W.cake.img, ten: "Đếm nến · Let's count!", mat: 'Thẻ mini, bánh và nến mini của đôi',
        steps: ['Một bạn giơ ngón tay (số nến), bạn kia đếm to rồi nói số; đổi vai.', 'Lượt 1 cô cùng 1 đôi làm mẫu, rồi các đôi chơi cùng lúc.', '★ Bạn nhỏ: nói từ hoặc cụm cuối · ★★ Bạn lớn: nói cả câu, hỏi lại bạn.'],
        line: L("Let's count! One, two, three! Six!", '我们数一数！一、二、三！六！', 'Wǒmen shǔ yi shǔ! Yī, èr, sān! Liù!'), con: 'Đôi bạn đếm nến cho nhau.', note: ['Tắt chiếu. Cô đi vòng nghe, chỉ giúp khi đôi dừng quá 3 giây.'] }),

      m(3, 'guong', 'move', 'Vận động · Gương soi theo đôi', 5, 'mau', { off: true, cmds: [CMDN.six, CMDN.count, CMDN.ten, CMDN.bd], con: 'Hai bạn đối diện: một bạn làm động tác theo lệnh, bạn kia soi gương; đổi vai sau mỗi 3 lệnh.',
        note: ['Cô làm mẫu 1 lượt, cả lớp làm theo. Bạn làm gương nói to từ mục tiêu: cake, one, two.', 'Tắt chiếu, bấm 🔊 Lệnh tiếp để phát lệnh.'] }),
      m(3, 've-unit', 've', 'Vè unit · đứng hát (2 dòng đầu)', 2, 'mau', { off: true, lines: VE_U([0, 1], ['🎂', '🔢']), img: CANH, lang: 'en', con: 'Hát 2 dòng đầu (đã nghe trên web), làm động tác; bạn lớn làm "phiên bản ngầu" (vỗ, búng tay).', note: ['Bấm 🥁 Nhịp, hát mẫu, cả lớp hát theo.'] }),

      m(4, 'the-zh', 'flash', '图卡 · từ mới + giơ thẻ', 4, 'mau', { lang: 'zh', mode: 'ts', cards: cards(W, NUM5), con: 'Nghe 2 lần, tay vẽ thanh trên không; lượt 2 cô nói từ, đôi giơ thẻ mini.', note: ['蛋糕, 一, 二, 三, 四, 五.'] }),
      m(4, 'truyen-zh', 'book', '故事 · Bông的生日 (phần 1–2)', 4, 'mau', { lang: 'zh', title: "Bông's Birthday", title_zh: 'Bông的生日', pages: scenes(u, [10, 11]), con: 'Nghe cả lượt tiếng Trung, chỉ tranh; hết truyện cả lớp đứng làm 1 lệnh tiếng Trung.', note: ['Cùng tranh với lượt tiếng Anh, không chen tiếng Anh.'] }),
      m(4, 'cau', 'cau', 'Cầu nối · Leo và Xiaomei', 2, 'mau', { pairs: [{ ...L("I'm six!", '我六岁！', 'Wǒ liù suì!'), img: W.six.img, gk: 'Tiếng Trung thêm 岁 sau số, không dùng 是.' }],
        con: 'Con chỉ chỗ khác trên thẻ chữ màu (đặt thẻ 岁 sau thẻ 六).', note: ['30″ cô cầm 2 rối nói 2 câu; 45″ con chỉ chỗ khác; cô chốt ≤ 10″: "Tiếng Trung thêm 岁 sau số, không dùng 是."'] }),
      m(4, 'dem-nen-zh', 'lam', "数一数 · Đếm nến · 中文", 3, 'giup', { lead: true, off: true, img: W.cake.img, ten: '数一数 · Đếm nến bằng tiếng Trung', mat: 'Đồ để nguyên trên bàn',
        steps: ['Chơi lại bằng tiếng Trung, đổi luật: thi đội có sao (không loại ai).', 'Bạn nhỏ hỏi – bạn lớn đáp.'], line: L("Let's count! One, two, three! Six!", '我们数一数！一、二、三！六！', 'Wǒmen shǔ yi shǔ! Yī, èr, sān! Liù!'), con: 'Đôi bạn đếm bằng tiếng Trung.', note: ['☆1 bỏ khi thiếu giờ.'] }),

      nghiS(5),
      m(5, 'lam', 'lam', 'Làm tay · ' + u.craft.name, 8, 'giup', { off: true, img: '../little-seed/day/' + u.craft.cake, ten: u.craft.name, mat: u.craft.mat, steps: u.craft.steps,
        line: L("How old are you? – I'm seven!", '你几岁？– 我七岁！', 'Nǐ jǐ suì? – Wǒ qī suì!'), con: 'Con tô bánh, dán số nến bằng tuổi mình, vừa làm vừa nói câu.', note: ['Bánh và dải nến 1–10 cô cắt sẵn trong rổ nhóm; keo khô, kéo đầu tròn. Bạn lớn chỉ cách 1 lần, không làm hộ.', 'Phần trang trí thêm làm ở nhà. 1′ cuối: đứng cất đồ vào rổ.'], print: [pr('ls', '#/u/2/craft', 'Thủ công Unit 2')] }),

      ngheChi(6, 'mau', 'Đôi bạn lật big book in, chỉ theo giọng máy; trang cuối đứng làm động tác.', ['Buổi 4 là lần đầu nghe cả quyển.']),
      m(6, 'hoi-con', 'hoi', 'Hỏi về con · How old are you?', 4, 'giup', { lead: true, img: W['how old'].img, pairs: [Q_AGE], con: 'Gợi trước 30″ (cô hỏi rối, rối đáp; cô hỏi mẫu 2 bạn), rồi đôi bạn hỏi nhau.',
        note: ['★ Bạn nhỏ: đáp 1 từ, bạn lớn nói lại câu đủ · ★★ Bạn lớn: đáp câu đủ.', 'Bấm 🔊 Hỏi, 👀 Đáp mẫu khi đôi cần.'] }),
      m(6, 'pdn', 'cau', 'Phiên dịch nhí · cô làm mẫu', 3, 'mau', { off: true, pdn: true, pairs: [{ ...L('Hello, cake!', '蛋糕，你好！', 'Dàngāo, nǐ hǎo!'), img: W.cake.img }, { ...L("Let's count! One, two, three!", '我们数一数！一、二、三！', 'Wǒmen shǔ yi shǔ! Yī, èr, sān!'), img: W.three.img }, { ...L('One, two, three! Yay!', '一、二、三！耶！', 'Yī, èr, sān! Yē!'), img: W.two.img }],
        con: 'Rối Leo nói; câu 1 cô làm mẫu, câu 2–3 đôi bàn 15″ rồi nói cho rối Xiaomei.', note: ['Xiaomei được gợi 2 âm đầu. ★ câu 1 và 3, ★★ câu 2.'] }),

      tong(4, [L('Hello, cake!', '蛋糕，你好！', 'Dàngāo, nǐ hǎo!'), L("I'm six!", '我六岁！', 'Wǒ liù suì!'), L("Let's count! One, two, three! Six!", '我们数一数！一、二、三！六！', 'Wǒmen shǔ yi shǔ! Yī, èr, sān! Liù!')], [12, 13]),
      veCuoi(), duMatNa(),
    ] }, NAMES);

  // ---------------- BUỔI 5 · Repeat + Introduce ----------------
  const NEW5 = ['name', 'ten', 'birthday'];
  const b5 = buoi({ t: 'Buổi 5 · Unit 2 Name and age · Repeat + Introduce', vai: 'giup', days: [12, 13], next: [14, 15],
    about: 'Truyện phần 3–4 (Happy Birthday! · My Name Is Leo!): từ mới name, ten, birthday. Phần 1–2 các con kể lại; cô làm mẫu phần mới.',
    MAN: [
      chao('nghe', true), veDau(),
      m(1, 'dung-sai', 'chon', 'Ôn web · Đúng hay sai ✓✗', 3, 'giup', { off: true, lang: 'en', game: true, items: cards(W, ['birthday', 'name', 'cake']), cue: 'Thẻ ✓ ✗ sẵn sàng!',
        con: 'Cô nói câu về tranh ngày web vừa học; đôi bạn giơ ✓ hoặc ✗; câu sai thì bạn lớn nói lại câu đúng.', note: ['Tắt chiếu, mỗi đôi một cặp thẻ ✓ ✗. Câu mẫu: "Happy birthday!" ✓ · "No! What\'s your name?" ✓.', '☆3 bỏ khi thiếu giờ.'] }),

      m(2, 'the-en', 'flash', 'Thẻ tranh · từ mới phần 3–4', 3, 'mau', { lang: 'en', mode: 'ts', cards: cards(W, NEW5), con: 'Nghe 2 lần, nhắc theo, đứng làm động tác.', note: ['name (名字), ten (十), birthday (生日).'] }),
      m(2, 'truyen-en', 'book', "Truyện · Bông's Birthday (phần 3–4)", 4, 'mau', { lang: 'en', title: "Bông's Birthday", title_zh: 'Bông的生日', pages: scenes(u, [12, 13]), con: 'Nghe; trước khi lật trang con đoán; hết phần cả lớp đứng làm 1 lệnh.', hoi: ['Con đáp 1 từ → cô nói lại câu đủ.', '"Ten!" – giơ 10 ngón.'], note: ['Kể lượt tiếng Anh.'] }),
      m(2, 'xep-en', 'chon', 'Nhóm xếp tranh · phần 1–4', 4, 'giup', { lead: true, off: true, lang: 'en', xep: true, items: scenes(u, [10, 11, 12, 13]).filter((_, i) => [0, 2, 4, 6, 8, 10, 12, 14].includes(i)).map(s => ({ en: s.en, zh: s.zh, py: s.py, img: s.img })), cue: 'Nhóm xếp tranh theo truyện!',
        con: 'Nhóm 4 bạn (2 đôi) xếp thẻ tranh theo truyện, nói câu từng tranh.', note: ['★ Bạn nhỏ: chỉ tranh, nói 1 từ · ★★ Bạn lớn: nói câu. Xong, cô bấm 🔊 Câu tiếp để cả lớp kiểm tra.'], print: [pr('ls', '#/u/2/strips', 'Thẻ tranh truyện Unit 2')] }),

      m(3, 'rong', 'move', 'Vận động · Rồng lửa (đứng tại chỗ)', 5, 'giup', { lead: true, off: true, cmds: [CMDN.six, CMDN.ten, CMDN.count, CMDN.bd], cue: 'Rồng lửa! Đầu rồng ra lệnh!',
        con: 'Hai rồng ≤ 6 con, đứng hàng tại chỗ; đầu rồng ra lệnh, cả rồng làm; làm sai thì về cuối hàng.', note: ['Cô làm mẫu 1 lượt, bạn lớn dẫn tiếp, bạn nhỏ làm theo. Không chạy, không nắm áo. Đầu rồng ra lệnh bằng từ mục tiêu: name, ten, birthday.'] }),
      m(3, 've-unit', 've', 'Vè unit · cả lớp hát', 2, 'giup', { off: true, lines: VE_U([0, 1, 2, 3], ['🎂', '🔢', '❓', '🙋']), img: CANH, lang: 'en', con: 'Đứng hát cả bài, làm động tác.', note: ['Hát cả 4 dòng; dòng 3–4 là câu hỏi – đáp.'] }),

      m(4, 'the-zh', 'flash', '图卡 · từ mới + giơ thẻ', 4, 'mau', { lang: 'zh', mode: 'ts', cards: cards(W, NEW5), con: 'Nghe 2 lần, tay vẽ thanh 2 lượt (cả lớp rồi đôi); lượt cuối đôi giơ thẻ.', note: ['名字, 十, 生日.'] }),
      m(4, 'truyen-zh', 'book', '故事 · Bông的生日 (phần 3–4)', 4, 'mau', { lang: 'zh', title: "Bông's Birthday", title_zh: 'Bông的生日', pages: scenes(u, [12, 13]), con: 'Nghe lượt tiếng Trung, chỉ tranh; hết truyện đứng làm 1 lệnh tiếng Trung.', note: ['Cùng tranh với lượt tiếng Anh.'] }),
      m(4, 'cau', 'cau', 'Cầu nối · Leo và Xiaomei', 2, 'mau', { pairs: [{ ...L("What's your name? – My name is Leo.", '你叫什么名字？– 我叫Leo。', 'Nǐ jiào shénme míngzi? – Wǒ jiào Leo.'), img: W.name.img, gk: 'Tiếng Anh đưa What lên đầu; tiếng Trung để 什么 đúng chỗ tên.' }],
        con: 'Con chỉ chỗ khác trên thẻ chữ (thẻ 什么 và thẻ Leo nằm cùng một chỗ).', note: ['30″ hai rối nói 2 câu; 45″ con chỉ; cô chốt: "Tiếng Anh đưa What lên đầu; tiếng Trung để 什么 đúng chỗ tên."'] }),
      m(4, 'xep-zh', 'chon', '排一排 · nhóm xếp tranh · 中文', 3, 'giup', { lead: true, off: true, lang: 'zh', xep: true, items: scenes(u, [10, 11, 12, 13]).filter((_, i) => [0, 2, 4, 6, 8, 10, 12, 14].includes(i)).map(s => ({ en: s.en, zh: s.zh, py: s.py, img: s.img })), cue: '排一排！',
        con: 'Tranh để nguyên trên bàn; nhóm thi bấm giờ xếp lại, nói câu tiếng Trung từng tranh.', note: ['☆2 bỏ khi thiếu giờ.'] }),

      nghiS(5),
      m(5, 'khoe', 'hoi', 'Khoe sản phẩm · hỏi về con', 4, 'giup', { lead: true, img: '../little-seed/day/' + u.craft.cake, pairs: [Q_AGE, Q_NAME], con: 'Cầm bánh sinh nhật đếm nến đi chậm hỏi 2 bạn, nói câu về mình.',
        note: ['★ Bạn nhỏ: đáp 1 từ · ★★ Bạn lớn: hỏi và đáp câu đủ.', 'Bấm 🔊 Hỏi, 👀 Đáp mẫu khi đôi cần.'] }),

      ngheChi(6, 'giup', 'Trang đã quen đọc to cùng máy, trang mới nghe và chỉ.', ['Trang cuối đứng lên làm động tác.']),
      m(6, 'pdn', 'cau', 'Phiên dịch nhí · đội thi', 4, 'giup', { lead: true, off: true, pdn: true, game: true, cue: 'Leo nói gì? Nói cho Xiaomei!',
        pairs: [{ ...L('Happy birthday!', '生日快乐！', 'Shēngrì kuàilè!'), img: W.birthday.img }, { ...L('My name is Puppy! Woof!', '我叫小狗！汪汪！', 'Wǒ jiào xiǎogǒu! Wāngwāng!'), img: ch.bong.img }, { ...L("Hello! What's your name?", '你好！你叫什么名字？', 'Nǐ hǎo! Nǐ jiào shénme míngzi?'), img: W.name.img }],
        con: 'Bạn cầm rối Leo nói câu; đội bàn 15″ rồi nói cho rối Xiaomei; đội được sao, không loại ai.', note: ['★ câu 1 cho bạn nhỏ, ★★ câu 2–3 cho bạn lớn.'] }),
      m(6, 'bb-cuoi', 'hoi', 'Big book trang cuối · đôi bạn', 3, 'giup', { lead: true, img: BB2 + 'p12.webp', pairs: [{ q: L('Who are you?', '你是谁？', 'Nǐ shì shéi?'), a: L('My name is Puppy. I\'m three. Woof!', '我叫小狗。我三岁。汪汪！', 'Wǒ jiào xiǎogǒu. Wǒ sān suì. Wāngwāng!'), img: BB2 + 'p12.webp' }, { q: L('Your turn!', '轮到你了！', 'Lúndào nǐ le!'), a: L('My name is ___. I\'m ___.', '我叫___。我___岁。', 'Wǒ jiào ___. Wǒ ___ suì.'), img: W.name.img }],
        con: 'Đôi bạn nói câu trang cuối, thay bằng tên và thông tin của bạn mình.', note: ['☆1 bỏ khi thiếu giờ.'] }),

      tong(5, [L('Happy birthday!', '生日快乐！', 'Shēngrì kuàilè!'), L("I'm six!", '我六岁！', 'Wǒ liù suì!'), L("What's your name?", '你叫什么名字？', 'Nǐ jiào shénme míngzi?')], [14, 15]),
      veCuoi(), duMatNa(),
    ] }, NAMES);

  // ---------------- BUỔI 6 · Practice + Introduce ----------------
  const b6 = buoi({ t: 'Buổi 6 · Unit 2 Name and age · Practice + Introduce', vai: 'nghe', days: [14, 15], next: [16, 17],
    about: 'Truyện phần 5 (How Old Are You?) và cả truyện: nhóm diễn rối, phiên dịch nhí, kịch New Friends. Con làm chủ gần cả buổi.',
    MAN: [
      chao('nghe', true), veDau(),
      m(1, 'phong-van', 'hoi', 'Phỏng vấn nhanh', 4, 'nghe', { lead: true, off: true, img: CLS, pairs: [Q_AGE, Q_NAME], cue: 'Đi tìm 3 bạn: hỏi tuổi!',
        con: 'Vòng trong – vòng ngoài đứng tại chỗ (không chạy); phiếu tranh 3 ô, hỏi 3 bạn, tick.', note: ['Hết nhạc: bạn nhỏ hô "Sit down, please! 请坐好！". Cô ghi Bảng của cô (chấm Giao tiếp).'] }),

      m(2, 'the-en', 'flash', 'Thẻ tranh · con nói trước', 2, 'nghe', { lead: true, lang: 'en', mode: 'sts', cards: cards(W, NUM5), con: 'Thẻ hiện, con nói trước, máy nói sau (từ phần 1–4).', note: ['Chế độ "Con trước": chờ 3 giây cho con nói.'] }),
      m(2, 'truyen-en', 'book', "Truyện · Bông's Birthday (phần 5)", 3, 'mau', { lang: 'en', title: "Bông's Birthday", title_zh: 'Bông的生日', pages: scenes(u, [14]), con: 'Nghe phần mới, đoán kết truyện; con đáp câu trọn.', note: ['five (五), six (六), birthday (生日). Hỏi "How old are you, Bông?"'] }),
      m(2, 'tap-nhom', 'dien', 'Nhóm tập diễn · mỗi nhóm 1 phần', 6, 'giup', { lead: true, off: true, lang: 'en', hide: true, img: CANH, roles: ROLES, lines: scenes(u, [10, 11, 12, 13, 14]), cue: 'Nhóm tập diễn với rối!',
        con: 'Thẻ vai đeo cổ chia sẵn; nhóm cố định 4 bạn, mỗi nhóm tập 1 phần truyện với rối của lớp.', note: ['★ Bạn nhỏ: 1 lời ngắn · ★★ Bạn lớn: 2 lời. Tắt chiếu; máy cô có lời từng vai.'] }),
      m(2, 'dien-noi', 'dien', 'Diễn nối cả truyện', 4, 'nghe', { lead: true, lang: 'en', hide: true, img: CANH, roles: ROLES, lines: scenes(u, [10, 11, 12, 13, 14]), con: 'Các nhóm diễn nối nhau thành cả truyện, đứng lệch luồng sáng máy chiếu; khán giả giơ ★ khi nghe đúng câu.', note: ['Lời che sẵn: nhóm tự nói, cô bấm 🙉 chỉ khi nhóm dừng quá 3 giây.'] }),

      m(3, 'dung-sai-vd', 'move', 'Vận động · Đúng hay sai vận động', 5, 'nghe', { lead: true, off: true, cmds: [CMDN.six, CMDN.ten, CMDN.count, CMDN.bd], cue: 'Đúng thì giơ hai tay!', con: 'Bạn nhỏ dẫn theo bảng xoay vòng; câu đúng thì giơ hai tay lên, sai thì ngồi xuống rồi đứng lại.', note: ['Cô đứng nghe. Câu đúng/sai nói về từ mục tiêu của unit.'] }),

      m(4, 'truyen-zh', 'book', '故事 · Bông的生日 (phần 5)', 4, 'mau', { lang: 'zh', title: "Bông's Birthday", title_zh: 'Bông的生日', pages: scenes(u, [14]), con: 'Con nói trước từ đã học bằng tiếng Trung (30″), rồi nghe phần 5; hết truyện đứng làm 1 lệnh.', note: ['Bông，你几岁？ · 我们数一数！一、二、三！'] }),
      m(4, 'cau', 'cau', 'Cầu nối · Leo và Xiaomei', 2, 'mau', { pairs: [{ ...L('Happy birthday, Bông!', 'Bông，生日快乐！', 'Bông, shēngrì kuàilè!'), img: W.birthday.img, gk: 'Tên Bông: cuối câu tiếng Anh, đầu câu tiếng Trung.' }],
        con: 'Con chỉ chỗ khác (thẻ tên Bông).', note: ['Điểm mới nên cô làm mẫu: 30″ hai rối nói 2 câu; 45″ con chỉ; chốt: "Tiếng Trung thường gọi tên trước rồi mới chúc."'] }),
      m(4, 'tap-zh', 'dien', '小组演 · lời nhân vật tiếng Trung', 4, 'giup', { lead: true, off: true, lang: 'zh', hide: true, img: CANH, roles: ROLES, lines: scenes(u, [10, 11, 12, 13, 14]), cue: '小组演！',
        con: 'Nhóm cầm rối; máy phát lời từng vai 1 lần, nhóm nói lại bằng tiếng Trung.', note: ['★ Bạn nhỏ: 1 lời ngắn · ★★ Bạn lớn: 2 lời. Chỉ tiếng Trung.'] }),
      m(4, 'chu', 'chu', 'Chữ Hán nhận mặt · 一 二 三', 2, 'mau', { off: true, cols: [{ h: '一', big: '一', zh: true, small: 'yī · 1 nét ngang' }, { h: '二', big: '二', zh: true, small: 'èr · 2 nét ngang' }, { h: '三', big: '三', zh: true, small: 'sān · 3 nét ngang' }],
        con: 'Cô làm mẫu chữ bằng hình và động tác; con tìm chữ trong big book.', note: ['★ Bạn nhỏ: giơ thẻ chữ đúng · ★★ Bạn lớn: đọc từ có chữ đó. ☆2 bỏ khi thiếu giờ.'] }),

      nghiS(5),
      ngheChi(6, 'nghe', 'Đôi bạn chỉ theo máy, rồi "đọc" cho nhau.', ['Rồi đôi "đọc" cho nhau: ★ Bạn nhỏ chỉ tranh, nhắc từ cuối câu · ★★ Bạn lớn đọc cả câu. Cô chấm đầu ra Đọc.']),

      m(6, 'kich', 'hoi', 'Kịch New Friends', 5, 'giup', { lead: true, off: true, img: CLS, pairs: [{ q: L("Hello! What's your name? How old are you?", '你好！你叫什么名字？你几岁？', 'Nǐ hǎo! Nǐ jiào shénme míngzi? Nǐ jǐ suì?'), a: L("My name is ___. I'm ___.", '我叫___。我___岁。', 'Wǒ jiào ___. Wǒ ___ suì.'), img: ch.leo.img }], cue: 'Kịch New Friends!',
        con: 'Đôi bạn hỏi tên, tuổi; rối Leo hỏi thì đáp tiếng Anh, rối Xiaomei hỏi thì đáp tiếng Trung.', note: ['Cô bốc thăm rối: Leo thì chơi bằng tiếng Anh, Xiaomei thì chơi bằng tiếng Trung. Cô nghe, ghi Bảng của cô (M3).'] }),
      m(6, 'pdn', 'cau', 'Phiên dịch nhí · đôi luyện rồi từng con', 4, 'nghe', { lead: true, off: true, pdn: true, game: true, cue: 'Leo nói gì? Nói cho Xiaomei!',
        pairs: [{ ...L('Happy birthday!', '生日快乐！', 'Shēngrì kuàilè!'), img: W.birthday.img }, { ...L("I'm five!", '我五岁！', 'Wǒ wǔ suì!'), img: W.five.img }, { ...L('My name is Puppy! Woof!', '我叫小狗！汪汪！', 'Wǒ jiào xiǎogǒu! Wāngwāng!'), img: ch.bong.img }, { ...L('Hello, cake!', '蛋糕，你好！', 'Dàngāo, nǐ hǎo!'), img: W.cake.img }],
        con: 'Các đôi luyện 1′ với thẻ câu 2 mức; rồi 4–5 con nói trước lớp cho rối Xiaomei.', note: ['Con lỡ nói tiếng Anh: Xiaomei làm mặt "không hiểu", con nói lại. ★ câu ngắn cho bạn nhỏ, ★★ cho bạn lớn.'] }),
      m(6, 'tap-khuc', 'hoi', 'Tập khúc "về con"', 3, 'giup', { lead: true, img: CLS, pairs: [{ q: L('Your turn!', '轮到你了！', 'Lúndào nǐ le!'), a: L("My name is ___. I'm ___.", '我叫___。我___岁。', 'Wǒ jiào ___. Wǒ ___ suì.'), img: W.name.img }, { q: L('Say more!', '再多说一点！', 'Zài duō shuō yìdiǎn!'), a: L("Hello, everyone! My name is ___. I'm ___. Let's count! One, two, three!", '大家好！我叫___。我___岁。我们数一数！一、二、三！', 'Dàjiā hǎo! Wǒ jiào ___. Wǒ ___ suì. Wǒmen shǔ yi shǔ! Yī, èr, sān!'), img: W.one.img }],
        con: 'Đôi bạn tập khúc của mình cho buổi sau, nói nhỏ cho nhau nghe.', note: ['★ Bạn nhỏ: 2 câu · ★★ Bạn lớn: 3–4 câu. ☆1 bỏ khi thiếu giờ.'] }),

      tong(6, [L('How old are you, Bông?', 'Bông，你几岁？', 'Bông, nǐ jǐ suì?'), L("Hello! What's your name? How old are you?", '你好！你叫什么名字？你几岁？', 'Nǐ hǎo! Nǐ jiào shénme míngzi? Nǐ jǐ suì?'), L("My name is ___. I'm ___.", '我叫___。我___岁。', 'Wǒ jiào ___. Wǒ ___ suì.')], [16, 17], ['Nhớ khúc "về con" của mình để lên sân khấu buổi sau.']),
      veCuoi(),
      m(7, 'du', 'book', 'Còn thời gian · big book unit trước', 3, 'nghe', { du: true, lead: true, lang: 'en', title: u1.bb[0].title, title_zh: u1.bb[0].title_zh, pages: bbPages(u1.bb[0], 0, 7), con: 'Đọc lại big book unit trước, mỗi trang một bạn.', note: ['Màn dự phòng.'] }),
    ] }, NAMES);

  // ---------------- BUỔI 7 · Produce ----------------
  const b7 = buoi({ t: 'Buổi 7 · Unit 2 Name and age · Produce', vai: 'nghe', days: [16, 17], next: [18, 19],
    about: 'Phiếu cuối unit hai tiếng, kể truyện theo tranh, Leo says, sân khấu "về con" theo đôi (quay video). Cô chỉ nghe và chấm 4 đầu ra.',
    MAN: [
      chao('nghe', true), veDau(),
      m(1, 'phong-van', 'hoi', 'Phỏng vấn nhanh · 2 câu', 3, 'nghe', { lead: true, off: true, img: CLS, pairs: [Q_NAME, Q_AGE], cue: 'Hỏi 2 bạn: tên và tuổi!',
        con: 'Vòng trong – vòng ngoài; hỏi 2 bạn câu của unit này và unit trước.', note: ['Cô đứng cuối lớp nghe 3 đôi, đánh dấu Bảng của cô (chấm Giao tiếp).'] }),

      m(2, 'kt-en', 'kt', 'Phiếu cuối unit · mặt EN', 4, 'nghe', { off: true, items: kt(u, 'en', 3), cue: 'Nghe và khoanh vào phiếu!', con: 'Nghe, khoanh tranh đúng (tai nghe + bút khoanh).',
        note: ['Phiếu hai mặt trong bìa hồ sơ của con. Tắt chiếu. Bấm 🔊 Đọc câu 2 lần. ★★ thêm 2 câu nối tranh với chữ. Bạn lớn phát và thu phiếu.'], print: [pr('ls', '#/u/2/check', 'Phiếu cuối Unit 2')] }),
      m(2, 'ke-tranh', 'book', 'Nghe lại nhanh · nhóm kể theo tranh', 6, 'nghe', { lead: true, off: true, lang: 'en', hide: true, title: "Bông's Birthday", title_zh: 'Bông的生日', pages: scenes(u, [10, 11, 12, 13, 14]).filter((_, i) => i % 2 === 0),
        con: 'Máy đọc nhanh 1 lượt (1′, xem tranh); rồi nhóm đứng quanh tranh in A3, chữ che, nhóm kể; kể xong cả nhóm chào.', note: ['★ Bạn nhỏ: kể 1 tranh, câu ngắn · ★★ Bạn lớn: kể 2 tranh.'] }),

      m(3, 'says', 'says', 'Leo says / Xiaomei says', 5, 'nghe', { lead: true, off: true, lua: true, cmds: [CMDN.six, CMDN.ten, CMDN.count, CMDN.bd, CMDN.stand, CMDN.sit], cue: 'Leo says… Xiaomei说…',
        rules: ['Chỉ làm khi nghe "Leo says" / "Xiaomei说".', 'Lệnh không có "Leo says" là lệnh lừa, ai bị lừa làm trọng tài.'], con: 'Bạn nhỏ dẫn theo bảng xoay vòng.', note: ['Cô đứng nghe. Lệnh thật dùng từ mục tiêu của unit.'] }),
      m(3, 've-unit', 've', 'Vè unit · tự hát', 2, 'nghe', { lead: true, lines: VE_U([0, 1, 2, 3], ['🎂', '🔢', '❓', '🙋']), img: CANH, lang: 'en', con: 'Bạn nhỏ bắt nhịp, cả lớp đứng hát cả bài.', note: ['Cô không hát mẫu.'] }),

      m(4, 'kt-zh', 'kt', 'Phiếu cuối unit · mặt ZH', 4, 'nghe', { off: true, items: kt(u, 'zh', 3), cue: '听一听，圈一圈！', con: 'Lật mặt tiếng Trung, nghe và khoanh.', note: ['Mặt tiếng Trung: 4 câu lõi + 1 câu vòng ngoài.'], print: [pr('ls', '#/u/2/check', 'Phiếu cuối Unit 2')] }),
      m(4, 'ke-tranh-zh', 'book', '小组讲故事 · kể theo tranh tiếng Trung', 5, 'nghe', { lead: true, off: true, lang: 'zh', hide: true, title: "Bông's Birthday", title_zh: 'Bông的生日', pages: scenes(u, [10, 11, 12, 13, 14]).filter((_, i) => i % 2 === 0),
        con: 'Nhóm đứng quanh tranh in, chữ che; kể bằng tiếng Trung.', note: ['★ Bạn nhỏ: 1 tranh, câu ngắn · ★★ Bạn lớn: 2 tranh.'] }),
      m(4, 'pdn', 'cau', 'Phiên dịch nhí · Xiaomei nói nhầm', 4, 'nghe', { lead: true, off: true, pdn: true, game: true, cue: 'Leo nói gì? Nói cho Xiaomei!',
        pairs: [{ ...L('Happy birthday!', '生日快乐！', 'Shēngrì kuàilè!'), img: W.birthday.img }, { ...L("I'm five!", '我五岁！', 'Wǒ wǔ suì!'), img: W.five.img }, { ...L('My name is Puppy! Woof!', '我叫小狗！汪汪！', 'Wǒ jiào xiǎogǒu! Wāngwāng!'), img: ch.bong.img }],
        con: 'Rối Leo nói, từng con nói lại cho Xiaomei, không mẫu.', note: ['Lượt cuối rối Xiaomei nói sai trật tự (ví dụ đảo chữ), con giơ thẻ ✗, bạn lớn nói lại đúng. ★ câu ngắn · ★★ câu dài.'] }),

      nghiS(5),
      m(5, 'chu', 'chu', 'Chữ Hán · đôi bạn 一 二 三', 3, 'nghe', { lead: true, off: true, cols: [{ h: '一', big: '一', zh: true, small: 'yī' }, { h: '二', big: '二', zh: true, small: 'èr' }, { h: '三', big: '三', zh: true, small: 'sān' }],
        con: 'Một bạn giơ thẻ chữ, bạn kia đọc và làm động tác.', note: ['★ Bạn nhỏ: tô chữ trên phiếu · ★★ Bạn lớn: chép thêm 1 từ lõi tiếng Anh. Phiếu này dùng chấm đầu ra Viết. ☆2 bỏ khi thiếu giờ.'] }),

      m(6, 'tap-khuc', 'hoi', 'Tập khúc · đôi bạn', 2, 'giup', { lead: true, img: CLS, pairs: [{ q: L('Your turn!', '轮到你了！', 'Lúndào nǐ le!'), a: L("My name is ___. I'm ___.", '我叫___。我___岁。', 'Wǒ jiào ___. Wǒ ___ suì.'), img: W.name.img }], con: 'Đôi bạn nói nhỏ khúc của mình cho nhau 1 lượt trước khi lên.', note: ['★ Bạn nhỏ: câu ngắn · ★★ Bạn lớn: "Hello, everyone! My name is ___. I\'m ___. Let\'s count! One, two, three!"'] }),
      m(6, 'san-khau', 'chao', 'Sân khấu của con · theo đôi', 10, 'nghe', { lead: true, img: '../seedling/tai-nguyen/trang/sk_nha_hat.webp', lines: [L("Hello, everyone! My name is ___. I'm ___. Let's count! One, two, three!", '大家好！我叫___。我___岁。我们数一数！一、二、三！', 'Dàjiā hǎo! Wǒ jiào ___. Wǒ ___ suì. Wǒmen shǔ yi shǔ! Yī, èr, sān!')],
        con: 'Đôi lên cùng: bạn nhỏ nói khúc ★, bạn lớn nói khúc ★★ rồi hỏi bạn nhỏ 1 câu.', note: ['Khán giả giơ ★; sau mỗi 2 đôi cả lớp đứng đáp "Yay! 耶！".', 'Điện thoại trên chân máy quay liền mạch để chấm Thuyết trình sau buổi. Con nhút nhát nói cùng bạn đôi.'] }),
      m(6, 'bb-noi', 'book', 'Big book · con kể (đứng vòng)', 3, 'nghe', { lead: true, off: true, lang: 'en', hide: true, title: bb.title, title_zh: bb.title_zh, pages: bbPages(bb, 0, 6, cover), con: 'Chữ che, mỗi trang một bạn nói trước khi máy đọc; cả lớp đứng thành vòng.', note: ['☆1 bỏ khi thiếu giờ.'] }),
      ngheChi(4, 'nghe', 'Đôi bạn đọc to cùng máy lượt tiếng Anh; lượt tiếng Trung nghe và chỉ.', ['Một bạn lớn cầm bút trình chiếu lật trang.']),

      tong(7, [L("My name is ___. I'm ___.", '我叫___。我___岁。', 'Wǒ jiào ___. Wǒ ___ suì.'), L("Let's count! One, two, three!", '我们数一数！一、二、三！', 'Wǒmen shǔ yi shǔ! Yī, èr, sān!')], [18, 19], ['Cô gửi ba mẹ nhận xét Unit 2 (4 đầu ra: giao tiếp, đọc, thuyết trình, viết) qua Zalo.']),
      veCuoi(),
      m(7, 'du', 'cau', 'Còn thời gian · Phiên dịch nhí unit trước', 3, 'nghe', { du: true, lead: true, pdn: true, pairs: [{ ...L('Hello, mommy!', '妈妈，你好！', 'Māma, nǐ hǎo!'), img: ch.me.img }, { ...L('See you tomorrow!', '明天见！', 'Míngtiān jiàn!'), img: ch.bong.img }], con: 'Câu của unit trước.', note: ['Màn dự phòng.'] }),
    ] }, NAMES);

  return { ten: 'Little Seed', sau: 'Unit 3 (buổi 8–11): làm sau khi chị duyệt Unit 2', buoi: { 4: b4, 5: b5, 6: b6, 7: b7 } };
}

/* =====================================================================
   SEEDLING 48 · Unit 2 Name and age (buổi 4–7, ngày web 10–17) · truyện "Vũ's Birthday" · big book "How Old Are You?"
   Lớp 6–8 tuổi (đã có Pre A1): thêm chữ và âm, dạng đề Starters L1/L2 và YCT 1, My Book.
   ===================================================================== */
function seedling() {
  const u = U(HSD, 2), u1 = U(HSD, 1), W = wordsOf(u), bb = u.bb[0], ve = u.ve[0], ve1 = u1.ve[0];
  const CO = NV + 'nv_lan_a.webp', CLS = '../seedling/tai-nguyen/canh/u1/w_kids_c.webp', CANH = r(u.parts[0].scenes[1].img), SK = '../seedling/tai-nguyen/trang/sk_nha_hat.webp';
  const ch = Object.fromEntries(u.chars.map(c => [c.key, { k: c.key, ten: c.name, img: r(c.img) }]));
  ch.narr = { k: 'narr', ten: 'Lời kể', img: ch.kids.img };
  const NAMES = ['Khởi động', 'Khối tiếng Anh', 'Vận động', 'Khối tiếng Trung', 'Chữ và âm', 'Truyện, thủ công, đầu ra', 'Vinh danh, việc ở nhà'];
  const VE_DAU = veLines(ve1, [0, 1, 2, 3], ['👋', '👏', '🤲', '🙋']), VE_CUOI = veLines(ve1, [4, 5], ['👋', '🎒']);
  const VE_U = (idx, mv) => veLines(ve, idx, mv);
  const ROLES = ['bong', 'nhan', 'xiaomei', 'anna', 'leo', 'kids', 'anh_nhan', 'narr'].map(k => ch[k]);
  const S = d => scenes(u, d);
  const Q_AGE = { q: L('How old are you?', '你几岁了？', 'Nǐ jǐ suì le?'), a: L("I'm seven years old.", '我七岁。', 'Wǒ qī suì.'), img: W.year.img };
  const Q_NAME = { q: L("What's your name?", '你叫什么名字？', 'Nǐ jiào shénme míngzi?'), a: L('My name is ___.', '我叫___。', 'Wǒ jiào ___.'), img: W["what's your name?"].img };
  const ROUND = ['bong', 'nhan', 'xiaomei', 'anna', 'leo', 'anh_nhan'];

  const chao = (lead) => m(1, 'chao', 'chao', lead ? 'Con chào cô ở cửa' : 'Chào ở cửa', 1, 'nghe', { lead: true, img: CLS, co: CO, lines: [L("Good morning, Mrs Lan! I'm ___.", 'Lan老师，早上好！我是___。', 'Lan lǎoshī, zǎoshang hǎo! Wǒ shì ___.')], con: 'Con chào cô ở cửa, nói tên.', note: ['Cô đứng ở cửa, chờ con chào trước.'] });
  const veDau = () => m(1, 've-dau', 've', 'Vè chào đầu buổi · bạn nhỏ bắt nhịp', 2, 'nghe', { lead: true, lines: VE_DAU, img: '../seedling/tai-nguyen/canh/u1/p2_2.webp', con: 'Bạn nhỏ bắt nhịp vè chào.', note: ['Cô chỉ bấm 🥁 Nhịp.'] });
  const veCuoi = () => m(7, 've-cuoi', 've', 'Vè chào cuối buổi', 2, 'nghe', { lead: true, lines: VE_CUOI, img: '../seedling/tai-nguyen/canh/u1/p3_6.webp', con: 'Bạn nhỏ bắt nhịp, cả lớp hát (đổi kiểu: nhanh, chậm, thì thầm, rô-bốt).', note: ['Hát tiếng Anh rồi tiếng Trung, xếp hàng ra cửa.'] });
  const tong = (b, lines, days, vai, extra) => m(7, 'tong', 'tong', 'Tổng kết · Ném bóng câu', 4, vai, { lead: true, lines,
    home: [`Ngày web ${days.join(', ')}.`, `Sách bài tập buổi ${b}: 2 trang (Anh, Trung), khoảng 10 phút.`, ...(extra || [])],
    con: 'Bóng đến tay thì con nói 1 câu của buổi bằng tiếng Anh rồi tiếng Trung; con vừa nói chọn 1 bạn để khen: "Good job, ___!" · "___，真棒！"',
    note: ['Bạn lớp 3 được cầm thẻ tranh gợi ý khi cần.', 'Cô vinh danh 2 bạn theo tiêu chí cụ thể có ghi sổ (xoay vòng). Cộng sao trên Bảng của cô.', 'Việc ở nhà để trên slide cuối và gửi nhóm Zalo.'] });
  const nghiS = () => m(3, 'nghi', 'nghi', 'Nghỉ giải lao · mốc đổi tiếng', 5, 'nghe', { off: true, img: CLS, list: ['💧 Uống nước', '🚻 Đi vệ sinh (từng 2 bạn, thẻ toilet pass)', '🔁 Hết giờ: thẻ trên bảng lật sang "Xiaomei · 中文"'], con: 'Đi vệ sinh từng 2 bạn; uống nước.', note: ['Đồng hồ 5 phút. Hết giờ chuyển sang khối tiếng Trung.'] });
  const ngheChi = (p, vai, con, note) => m(6, 'nghe-chi', 'book', 'Nghe – chỉ sách · ' + bb.title, p, vai, { off: true, lang: 'en', title: bb.title, title_zh: bb.title_zh, pages: bbPages(bb, 0, 7), con, cue: 'Mở big book của đôi mình, ngón tay sẵn sàng!',
    note: ['Mỗi đôi một quyển in. Bấm ▶ Đọc cả lượt: máy đọc cả lượt tiếng Anh rồi cả lượt tiếng Trung (đổi 中文).', '★ Bạn nhỏ: chỉ tranh · ★★ Bạn lớn: chỉ chữ.', ...note], print: [pr('sd', '#/u/2/bigbook', 'Big book in (mỗi đôi 1 bản)')] });
  const doiTo = (p) => m(2, 'x', 'hoi', '', p, 'giup'); // chỗ giữ, không dùng
  void doiTo;
  const luot = (id, k, t, p, vai, o) => m(k, id, 'hoi', t, p, vai, o);
  const chu = (id, t, p, vai, cols, con, note, o = {}) => m(5, id, 'chu', t, p, vai, { cols, con, note, ...o });

  // ---------------- BUỔI 4 · Introduce ----------------
  const b4 = buoi({ t: 'Buổi 4 · Unit 2 Name and age · Introduce', vai: 'mau', days: [10, 11], next: [12, 13],
    about: 'Truyện phần 1–2 (Nice to Meet You! · What About You?): happy, what\'s your name?, nice, year. Nội dung mới: cô làm mẫu; đôi bạn hỏi – đáp tuổi.',
    MAN: [
      chao(false), veDau(),
      m(2, 'the-en', 'flash', 'Thẻ tranh · ôn web + từ mới', 4, 'mau', { lang: 'en', mode: 'ts', cards: cards(W, ['happy', "what's your name?", 'nice', 'year']), con: 'Máy phát từ ngày web trước, con giơ thẻ mini sau; rồi nghe 2 lần, nhắc theo, đứng làm động tác.', note: ['Con chưa làm web ngồi cạnh bạn lớn; cô ghi tên để nhắn ba mẹ.'], print: [pr('sd', '#/u/2/mini', 'Thẻ mini Unit 2')] }),
      m(2, 'truyen-en', 'book', "Truyện · Vũ's Birthday (phần 1–2)", 5, 'mau', { lang: 'en', title: "Vũ's Birthday", title_zh: 'Vũ的生日', pages: S([10, 11]), con: 'Nghe cả lượt; dừng 2 chỗ hỏi; hết truyện đứng làm 1 lệnh.', hoi: ['Con đáp 1 từ → cô nói lại câu đủ.', 'Rối Leo đoán sai 1 lần, con sửa.'], note: ['Kể lượt tiếng Anh, chỉ tranh.'] }),
      luot('vong-tron', 2, 'Vòng tròn · What about you?', 5, 'giup', { lead: true, off: true, img: W['what about you?'].img, pairs: [{ q: L('How old are you?', '你几岁了？', 'Nǐ jǐ suì le?'), a: L("I'm seven. What about you?", '我七岁。你呢？', 'Wǒ qī suì. Nǐ ne?'), img: W['what about you?'].img }],
        con: 'Đứng hàng ngang đầu lớp; A nói tuổi thật rồi hỏi B, B nói và hỏi tiếp.', note: ['Lượt 1 cô cùng 1 đôi làm mẫu; rồi các đôi chơi cùng lúc, đồng hồ đếm ngược trên màn.', '★ Bạn nhỏ: nói tuổi · ★★ Bạn lớn: nói cả câu và hỏi lại.'] }),

      m(3, 'says', 'says', 'Vận động · Leo says / Xiaomei says', 3, 'mau', { off: true, cmds: [CMDN.seven, CMDN.nine, CMDN.nice, CMDN.wow], rules: ['Cô làm Leo (tiếng Anh) / Xiaomei (tiếng Trung).', 'Lệnh ngắn của unit, chưa có lệnh lừa.'], con: 'Làm theo lệnh, nói to từ mục tiêu: happy, what\'s your name, nice.', note: ['Tắt chiếu.'] }),
      m(3, 've-unit', 've', 'Vè unit · hát 2 dòng', 2, 'mau', { lines: VE_U([0, 1], ['🎂', '🔢']), img: CANH, lang: 'en', con: 'Kết bằng hát 2 dòng vè unit.', note: ['Cô hát mẫu.'] }),
      nghiS(),

      m(4, 'the-zh', 'flash', '图卡 · từ mới', 3, 'mau', { lang: 'zh', mode: 'ts', cards: cards(W, ['happy', "what's your name?", 'nice', 'year']), con: 'Nghe 2 lần, tay vẽ thanh trên không, chạm hoặc chỉ tranh.', note: ['高兴, 你叫什么名字, 好, 岁.'] }),
      m(4, 'truyen-zh', 'book', '故事 · Vũ的生日 (phần 1–2)', 5, 'mau', { lang: 'zh', title: "Vũ's Birthday", title_zh: 'Vũ的生日', pages: S([10, 11]), con: 'Nghe cả lượt tiếng Trung, chỉ tranh; hết truyện đứng làm 1 lệnh tiếng Trung.', note: ['Cùng tranh với lượt tiếng Anh.'] }),
      m(4, 'cau', 'cau', 'Cầu nối · Leo và Xiaomei', 2, 'mau', { pairs: [{ ...L('What about you?', '你呢？', 'Nǐ ne?'), img: W['what about you?'].img, gk: 'Hỏi lại bạn: 你呢？ (你 + 呢 thay cả câu hỏi).' }], con: 'Con chỉ chỗ khác (thẻ 你 + 呢 thay cả câu hỏi).', note: ['30″ hai rối nói 2 câu, tô cùng màu từ tương ứng; 45″ con chỉ; chốt ≤ 10″: "Hỏi lại bạn: 你呢？"'] }),
      luot('vong-tron-zh', 4, 'Vòng tròn · What about you? · 中文 theo đôi', 4, 'giup', { lead: true, off: true, img: W['what about you?'].img, pairs: [{ q: L('How old are you?', '你几岁了？', 'Nǐ jǐ suì le?'), a: L("I'm seven. What about you?", '我七岁。你呢？', 'Wǒ qī suì. Nǐ ne?'), img: W['what about you?'].img }], con: 'Các đôi chơi bằng bộ thẻ mini, chỉ tiếng Trung.', note: ['☆2 bỏ khi thiếu giờ.'] }),
      m(4, 'pdn', 'cau', 'Phiên dịch nhí · cô làm mẫu', 3, 'mau', { off: true, pdn: true, pairs: [{ ...L('Happy birthday, Vũ!', 'Vũ，生日快乐！', 'Vũ, shēngrì kuàilè!'), img: ch.bong.img }, { ...L("Thank you, Bông! What's your name?", '谢谢你，Bông！你叫什么名字？', 'Xièxie nǐ, Bông! Nǐ jiào shénme míngzi?'), img: ch.nhan.img }, { ...L("Me too! I'm six years old.", '我也是！我六岁。', 'Wǒ yě shì! Wǒ liù suì.'), img: W['me too'].img }],
        con: 'Câu 1 cô làm mẫu; câu 2–3 mọi đôi nói cùng lúc với thẻ Xiaomei mini, rồi 2 đôi nói trước lớp.', note: ['★ Câu 1 cho bạn nhỏ, ★★ câu 2–3 cho bạn lớn. Các đôi đứng nói.'] }),

      chu('chu-am', 'Chữ và âm · âm và thanh', 4, 'mau', [{ h: 'Ôn âm /s/ · /a/', big: 's · a', small: 'six · ant · apple' }, { h: 'Thanh 1 đối thanh 4', big: 'ˉ ˋ', small: 'mā 妈 – bà 爸' }], 'Cả lớp đứng: tay vẽ thanh, nói âm, viết chữ trên không.', ['Không có tiêu điểm mới: chỉ ôn.']),
      chu('chu-bang', 'Chữ và âm · bảng con 2 tầng', 6, 'mau', [{ h: 'Bảng con · tiếng Anh', words: ['nice', 'year', 'about'] }, { h: 'Bảng con · tiếng Trung', zh: true, words: ['么', '也'] }, { h: 'Vòng ngoài 1′', big: 'A B C D E F', small: 'Hát tên chữ cái, đánh vần tên mình' }], 'Cô viết mẫu thứ tự nét; con viết bảng con.', ['★ Bạn nhỏ: viết nice, year, chữ 么 (3 nét) · ★★ Bạn lớn: viết nice, year, about; 么, 也 (3 nét).', 'Vòng ngoài: "How do you spell your name?"']),

      luot('hoi-con', 6, 'Hỏi về con · How old are you?', 3, 'giup', { lead: true, img: W.year.img, pairs: [Q_AGE, { q: L('How old are you?', '你多大了？', 'Nǐ duō dà le?'), a: L("I'm ten.", '我十岁。', 'Wǒ shí suì.'), img: W.ten.img }], con: 'Gợi trước 30″: cô hỏi rối, rối đáp; cô hỏi mẫu 2 bạn; rồi đôi bạn đứng hỏi nhau.', note: ['★ Bạn nhỏ: đáp 1 từ, bạn lớn nói lại câu đủ · ★★ Bạn lớn: đáp câu đủ, hỏi lại bạn.'] }),
      ngheChi(6, 'mau', 'Máy đọc cả lượt tiếng Anh rồi cả lượt tiếng Trung; trang cuối đứng làm động tác.', []),
      m(6, 'lam', 'lam', 'Thủ công · ' + u.craft.name, 7, 'giup', { off: true, img: ch.nhan.img, ten: u.craft.name, mat: u.craft.mat, steps: u.craft.steps, line: L("I'm seven years old!", '我七岁！', 'Wǒ qī suì!'), con: 'Con tô, dán số tuổi; trên lớp chỉ lắp và dùng sản phẩm để nói.', note: ['Vương miện bế sẵn. Bạn lớn chỉ cách 1 lần, bạn nhỏ tự làm. 1′ cuối: đứng cất đồ. ☆1 bỏ khi thiếu giờ.'], print: [pr('sd', '#/u/2/craft', 'Thủ công Unit 2')] }),

      tong(4, [L("Happy birthday, Vũ!", 'Vũ，生日快乐！', 'Vũ, shēngrì kuàilè!'), L("I'm seven years old.", '我七岁。', 'Wǒ qī suì.'), L("I'm seven. What about you?", '我七岁。你呢？', 'Wǒ qī suì. Nǐ ne?')], [12, 13], 'giup', ['Tập viết: nice, year, 么.']),
      veCuoi(),
      m(7, 'du', 'cua', 'Còn thời gian · Xếp hàng theo số', 3, 'giup', { du: true, lead: true, off: true, nodoor: true, lang: 'en', items: ['seven', 'eight', 'nine', 'ten'].map(k => ({ img: W[k].img, ten: W[k].en, hi: L('Eight is bigger than seven!', '八比七大！', 'Bā bǐ qī dà!'), bye: null })), cue: 'Xếp hàng từ nhỏ đến lớn!', con: 'Mỗi con cầm thẻ số, xếp hàng từ nhỏ đến lớn, nói câu so sánh.', note: ['Màn dự phòng: "Eight is bigger than seven!"'] }),
    ] }, NAMES);

  // ---------------- BUỔI 5 · Repeat + Introduce ----------------
  const b5 = buoi({ t: 'Buổi 5 · Unit 2 Name and age · Repeat + Introduce', vai: 'giup', days: [12, 13], next: [14, 15],
    about: 'Truyện phần 3–4 (Wow! Really? · Number Seven): nine, again, number, seven. Phần 1–2 các con kể lại; cô làm mẫu phần mới.',
    MAN: [
      chao(true), veDau(),
      m(1, 'dung-sai', 'chon', 'Ôn web · Đúng hay sai ✓✗', 4, 'giup', { off: true, lang: 'en', game: true, items: cards(W, ['happy', 'wow', 'number', 'seven']), cue: 'Thẻ ✓ ✗ sẵn sàng!', con: 'Đôi bạn giơ ✓ hoặc ✗; bạn lớn sửa câu sai, bạn nhỏ chỉ tranh đúng.', note: ['Cô nói câu của phần 1–4: "Look! A big cake!" ✓ · "Number seven! You are seven years old!" ✓.', '☆2 bỏ khi thiếu giờ.'] }),

      m(2, 'the-en', 'flash', 'Thẻ tranh · từ mới', 3, 'mau', { lang: 'en', mode: 'ts', cards: cards(W, ['happy', 'year', 'nine', 'again', 'number', 'seven']), con: 'Nghe 2 lần, nhắc theo, đứng làm động tác.', note: ['happy, year, nine, again, number, seven.'] }),
      m(2, 'truyen-en', 'book', "Truyện · Vũ's Birthday (phần 3–4)", 5, 'mau', { lang: 'en', title: "Vũ's Birthday", title_zh: 'Vũ的生日', pages: S([12, 13]), con: 'Nghe; đoán trước khi lật trang; hết truyện đứng làm 1 lệnh.', hoi: ['Con đáp → cô nói lại câu đủ.', '"Nine! (giơ 9 ngón)"'], note: ['Kể lượt tiếng Anh.'] }),
      luot('doan-tuoi', 2, 'Đoán tuổi · Try again!', 5, 'giup', { lead: true, off: true, game: true, img: W.number.img, pairs: [{ q: L('Are you six?', '你六岁吗？', 'Nǐ liù suì ma?'), a: L('No. Try again!', '不对！再猜猜！', 'Bú duì! Zài cāicai!'), img: W.again.img }, { q: L('Are you seven?', '你七岁吗？', 'Nǐ qī suì ma?'), a: L('Yes! I\'m seven.', '对！我七岁。', 'Duì! Wǒ qī suì.'), img: W.seven.img }],
        con: 'Bạn lớn giữ thẻ số bí mật, cả lớp hỏi, bạn đáp đến khi đúng.', note: ['Lượt 1 cô làm mẫu. ★ Bạn nhỏ: nói cụm cuối · ★★ Bạn lớn: nói cả câu.'] }),

      m(3, 'dung-sai-vd', 'move', 'Vận động · Đúng hay sai vận động + vè unit', 5, 'giup', { lead: true, off: true, cmds: [CMDN.seven, CMDN.nine, CMDN.nice, CMDN.wow], cue: 'Đúng thì giơ hai tay!', con: 'Cô làm mẫu 1 lượt, bạn lớn dẫn tiếp, bạn nhỏ làm theo; đúng thì giơ hai tay, sai thì ngồi xuống rồi đứng lại. Kết bằng hát cả bài vè.', note: ['Các câu đúng/sai nói về từ mục tiêu: happy, year, nine.'] }),
      nghiS(),

      m(4, 'the-zh', 'flash', '图卡 · từ mới', 3, 'mau', { lang: 'zh', mode: 'ts', cards: cards(W, ['happy', 'year', 'nine', 'again', 'number', 'seven']), con: 'Nghe 2 lần, tay vẽ thanh 2 lượt (cả lớp rồi đôi).', note: ['高兴, 岁, 九, 再, 数字, 七.'] }),
      m(4, 'truyen-zh', 'book', '故事 · Vũ的生日 (phần 3–4)', 5, 'mau', { lang: 'zh', title: "Vũ's Birthday", title_zh: 'Vũ的生日', pages: S([12, 13]), con: 'Nghe lượt tiếng Trung, chỉ tranh; hết truyện đứng làm 1 lệnh tiếng Trung.', note: ['Cùng tranh với lượt tiếng Anh.'] }),
      m(4, 'cau', 'cau', 'Cầu nối · Leo và Xiaomei', 2, 'mau', { pairs: [{ ...L('Are you six?', '你六岁吗？', 'Nǐ liù suì ma?'), img: W.again.img, gk: 'Câu hỏi có – không: thêm 吗 cuối câu. Tiếng Anh đảo Are lên đầu.' }], con: 'Con chỉ chỗ khác (EN đảo Are lên đầu; ZH giữ nguyên và thêm 吗).', note: ['30″ hai rối nói 2 câu; 45″ con chỉ; chốt: "Câu hỏi có – không: thêm 吗 cuối câu."'] }),
      luot('doan-zh', 4, 'Đoán tuổi · Try again! · 中文 theo đôi', 4, 'giup', { lead: true, off: true, game: true, img: W.again.img, pairs: [{ q: L('Are you six?', '你六岁吗？', 'Nǐ liù suì ma?'), a: L('No. Try again!', '不对！再猜猜！', 'Bú duì! Zài cāicai!'), img: W.again.img }], con: 'Các đôi chơi bằng bộ thẻ mini, chỉ tiếng Trung.', note: ['☆1 bỏ khi thiếu giờ.'] }),
      m(4, 'pdn', 'cau', 'Phiên dịch nhí · đội thi', 3, 'giup', { lead: true, off: true, pdn: true, game: true, cue: 'Leo nói gì? Nói cho Xiaomei!',
        pairs: [{ ...L("I'm nine years old!", '我九岁！', 'Wǒ jiǔ suì!'), img: ch.nhan.img }, { ...L('Wow! Really? You are nine?', '哇！真的吗？你九岁？', 'Wā! Zhēn de ma? Nǐ jiǔ suì?'), img: W['really?'].img }, { ...L('Look! A big cake!', '看！一个大蛋糕！', 'Kàn! Yí ge dà dàngāo!'), img: ch.anna.img }],
        con: 'Đội đứng hàng; bạn cầm rối Leo nói; đội bàn 10″ rồi nói cho rối Xiaomei; đội được sao, không loại ai.', note: ['★ Câu 1 cho bạn nhỏ, ★★ câu 2–3 cho bạn lớn.'] }),

      chu('chu-am', 'Chữ và âm · âm và thanh', 4, 'mau', [{ h: 'Âm /t/', big: 't', small: 'teacher · tomorrow' }, { h: 'Thanh 2 (đi lên) ˊ', big: 'ˊ', small: 'péng 朋 · míng 明' }], 'Cả lớp đứng: tay vẽ thanh, nói âm, viết chữ trên không.', ['Âm mới t và thanh 2: cô làm mẫu.']),
      chu('chu-bang', 'Chữ và âm · bảng con 2 tầng', 6, 'mau', [{ h: 'Bảng con · tiếng Anh', words: ['wow', 'nine', 'again'] }, { h: 'Bảng con · tiếng Trung', zh: true, words: ['九', '七'] }, { h: 'Vòng ngoài 1′', big: '11 – 20', small: 'eleven · 十一 đến twenty · 二十, đếm theo máy' }], 'Cô viết mẫu thứ tự nét; con viết bảng con.', ['★ Bạn nhỏ: viết wow, nine, chữ 九 (2 nét) · ★★ Bạn lớn: viết wow, nine, again; 九, 七 (2 nét).', 'Vòng ngoài: bạn 10–11 tuổi nói đúng tuổi mình.']),

      luot('dung-sp', 6, 'Dùng sản phẩm · hỏi về con', 5, 'giup', { lead: true, img: ch.nhan.img, pairs: [Q_NAME, Q_AGE], con: 'Cầm vương miện sinh nhật đi chậm hỏi 2 bạn.', note: ['★ Bạn nhỏ: đáp 1 từ · ★★ Bạn lớn: hỏi và đáp câu đủ.'] }),
      ngheChi(5, 'giup', 'Trang quen đọc to cùng máy, trang mới nghe và chỉ.', ['Trang cuối đứng làm động tác.']),

      tong(5, [L('Look! A big cake!', '看！一个大蛋糕！', 'Kàn! Yí ge dà dàngāo!'), L('My name is ___.', '我叫___。', 'Wǒ jiào ___.'), L('Are you six? – No. Try again!', '你六岁吗？– 不对！再猜猜！', 'Nǐ liù suì ma? – Bú duì! Zài cāicai!')], [14, 15], 'nghe', ['Tập viết: wow, nine, 九.']),
      veCuoi(),
      luot('du', 7, 'Còn thời gian · Hỏi về con', 3, 'giup', { du: true, lead: true, img: W.year.img, pairs: [Q_AGE], con: 'Đôi bạn hỏi câu còn lại.', note: ['Màn dự phòng.'] }),
    ] }, NAMES);

  // ---------------- BUỔI 6 · Practice + Introduce ----------------
  const b6 = buoi({ t: 'Buổi 6 · Unit 2 Name and age · Practice + Introduce', vai: 'nghe', days: [14, 15], next: [16, 17],
    about: 'Truyện phần 5–6 (My Brother Is Eight · Ten Friends): eight, is bigger than. Nhóm diễn rối, dạng đề Starters L1 và YCT 1. Con làm chủ gần cả buổi.',
    MAN: [
      chao(true), veDau(),
      luot('phong-van', 1, 'Hỏi về con · Phỏng vấn 3 bạn', 3, 'nghe', { lead: true, off: true, img: CLS, pairs: [Q_AGE, Q_NAME], cue: 'Đi tìm 3 bạn: hỏi tuổi!', con: 'Đứng tại chỗ, đi chậm; nhạc dừng thì hỏi người gần nhất (phiếu tranh 3 ô); hỏi thêm 1 câu của phần 5–6.', note: ['Cô nghe, ghi Bảng của cô (chấm Giao tiếp).'] }),

      m(2, 'the-en', 'flash', 'Thẻ tranh · con nói trước + từ mới', 3, 'giup', { lead: true, lang: 'en', mode: 'sts', cards: cards(W, ['happy', 'year', 'nine', 'again', 'seven', 'eight']), con: 'Thẻ phần 1–4 hiện, con nói trước; từ mới phần 5–6 nghe 2 lần.', note: ['Chế độ "Con trước".'] }),
      m(2, 'truyen-en', 'book', "Truyện · Vũ's Birthday (phần 5–6)", 5, 'mau', { lang: 'en', title: "Vũ's Birthday", title_zh: 'Vũ的生日', pages: S([14, 15]), con: 'Nghe phần cuối; con đáp câu trọn.', note: ['Hello! I\'m eight. · Let\'s hold hands, friends!'] }),
      m(2, 'tap-nhom', 'dien', 'Nhóm tập diễn · mỗi nhóm 1 cảnh (rối que)', 6, 'giup', { lead: true, off: true, lang: 'en', hide: true, img: CANH, roles: ROLES, lines: S([10, 11, 12, 13, 14, 15]), cue: 'Nhóm tập diễn với rối!', con: 'Vai bốc thăm, ghi vào bảng xoay vòng; mỗi nhóm 1 cảnh; nhóm A tập tiếng Anh, nhóm B tập tiếng Trung ở khối 4.', note: ['★ Bạn nhỏ: 1 lời ngắn · ★★ Bạn lớn: 2 lời.'] }),
      m(2, 'starters-l1', 'lam', 'Dạng đề Starters · L1 nghe – nối tên với người', 3, 'giup', { off: true, img: W.number.img, ten: 'Starters L1 · nghe – nối', mat: 'Phiếu A (tranh, khoanh, nối) · phiếu B (thêm viết 1 từ, đọc câu)',
        steps: ['Cô làm mẫu cách làm với 1 câu.', 'Con làm 2 câu.', 'Phiếu A cho bạn nhỏ, phiếu B cho bạn lớn.'], con: 'Nghe và nối tên với người.', note: ['Phần luyện tiếp ở sách bài tập. Chấm Nghe / Đọc.'], print: [pr('sd', '#/u/2/check', 'Phiếu Unit 2')] }),

      m(3, 'rong', 'move', 'Vận động · Rồng lửa (đứng tại chỗ)', 4, 'nghe', { lead: true, off: true, cmds: [CMDN.seven, CMDN.nine, CMDN.nice, CMDN.wow], cue: 'Rồng lửa! Đầu rồng ra lệnh!', con: 'Hai rồng ≤ 6 con đứng hàng tại chỗ; đầu rồng ra lệnh, cả rồng làm; làm sai về cuối hàng.', note: ['Bạn nhỏ dẫn theo bảng xoay vòng, cô đứng nghe. Không chạy, không nắm áo. Từ mục tiêu: happy, year, nine.'] }),
      m(3, 'tau', 'move', 'Vận động đi chậm · Tàu đi theo vạch', 4, 'nghe', { lead: true, off: true, cmds: [CMDN.seven, CMDN.nine, CMDN.nice, CMDN.wow], cue: 'Tàu đi theo vạch!', con: 'Dán một vạch băng dính dài; cả đội đi bộ nối đuôi trên vạch, nghe lệnh thì dừng làm động tác.', note: ['Không nắm áo. Dừng một nhịp để nói từ mục tiêu: happy, year, nine.'] }),
      nghiS(),

      m(4, 'truyen-zh', 'book', '故事 · Vũ的生日 (phần 5–6) · con nói trước', 5, 'mau', { lang: 'zh', title: "Vũ's Birthday", title_zh: 'Vũ的生日', pages: S([14, 15]), con: '30″ đầu thẻ hiện, con nói trước từ đã học; rồi nghe phần 5–6; hết truyện đứng làm 1 lệnh.', note: ['你们好！我八岁。 · 朋友们，我们拉拉手！'] }),
      m(4, 'cau', 'cau', 'Cầu nối · Leo và Xiaomei', 2, 'mau', { pairs: [{ ...L('Eight is bigger than seven!', '八比七大！', 'Bā bǐ qī dà!'), img: W['is bigger than'].img, gk: 'Số + 比 + số + 大.' }], con: 'Con chỉ chỗ khác (thẻ 比 giữa hai số, 大 ở cuối).', note: ['Điểm mới nên cô làm mẫu: 30″ hai rối nói 2 câu; 45″ con chỉ; chốt: "Số + 比 + số + 大."'] }),
      m(4, 'tap-zh', 'dien', 'Tập 中文 · nhóm B nói lời nhân vật', 4, 'giup', { lead: true, off: true, lang: 'zh', hide: true, img: CANH, roles: ROLES, lines: S([10, 11, 12, 13, 14, 15]), cue: '小组演！', con: 'Máy phát lời từng vai 1 lần, nhóm B nói lại bằng tiếng Trung; nhóm A nghe, giơ ✓ khi đúng.', note: ['★ Bạn nhỏ: 1 lời ngắn · ★★ Bạn lớn: 2 lời.'] }),
      m(4, 'yct-1', 'lam', 'Dạng đề YCT 1 · Nghe – tranh ✓✗ (số)', 3, 'giup', { off: true, img: W.number.img, ten: 'YCT 1 · nghe – tranh ✓✗', mat: 'Phiếu A / B theo tầng', steps: ['Cô làm mẫu 1 câu.', 'Con làm 2 câu.', 'Nghe câu về số, đánh ✓ hoặc ✗ cạnh tranh.'], con: 'Nghe, đánh ✓ ✗.', note: ['Chấm Nghe / Đọc.'], print: [pr('sd', '#/u/2/check', 'Phiếu Unit 2')] }),
      m(4, 'pdn', 'cau', 'Phiên dịch nhí · đôi luyện rồi 4 con', 3, 'nghe', { lead: true, off: true, pdn: true, game: true, cue: 'Leo nói gì? Nói cho Xiaomei!',
        pairs: [{ ...L('Wow! Eight is bigger than seven!', '哇！八比七大！', 'Wā! Bā bǐ qī dà!'), img: W['is bigger than'].img }, { ...L("Hello! I'm eight.", '你们好！我八岁。', 'Nǐmen hǎo! Wǒ bā suì.'), img: ch.anh_nhan.img }, { ...L("Let's hold hands, friends!", '朋友们，我们拉拉手！', 'Péngyoumen, wǒmen lālā shǒu!'), img: ch.nhan.img }],
        con: 'Các đôi đứng luyện 1′ với thẻ câu 2 mức; rồi 4 con nói trước lớp.', note: ['★ Câu 1 cho bạn nhỏ, ★★ câu 2–3 cho bạn lớn.'] }),

      chu('chu-ghep', 'Chữ và âm · đọc ghép', 6, 'giup', [{ h: 'Âm /s/ · /t/', big: 's · t', small: 'sat · ten' }, { h: 'Thanh 3 → 4/2 ˇ', big: 'ˇ', small: 'nǐ 你 · hǎo 好' }, { h: 'Bảng con · tiếng Anh', words: ['ten', 'eight', 'sat'] }, { h: 'Bảng con · tiếng Trung', zh: true, words: ['八', '大'] }], '1′ đầu đứng: tay vẽ thanh, nói âm; rồi bảng con.', ['★ Bạn nhỏ: viết ten, eight, chữ 八 (2 nét) · ★★ Bạn lớn: viết ten, eight; 八 (2 nét), 大 (3 nét).', 'Đọc ghép âm CVC bằng các âm đã học (sat, ten).']),

      m(6, 'dien-noi', 'dien', 'Diễn nối các cảnh', 6, 'nghe', { lead: true, lang: 'en', hide: true, img: CANH, roles: ROLES, lines: S([10, 11, 12, 13, 14, 15]), con: 'Nhóm A diễn tiếng Anh, nhóm B diễn tiếng Trung, nối thành cả truyện; con đứng lệch luồng sáng máy chiếu.', note: ['Tranh in A3 làm phông. Khán giả giơ ✓ khi nghe đúng câu; sau mỗi nhóm cả lớp đứng vỗ nhịp.'] }),
      ngheChi(4, 'giup', 'Lượt tiếng Anh đọc to cùng máy, lượt tiếng Trung nghe và chỉ.', ['★ Bạn nhỏ: nhắc từ cuối câu · ★★ Bạn lớn: đọc cùng máy. Chấm Đọc.']),

      tong(6, [L("Hello! I'm eight.", '你们好！我八岁。', 'Nǐmen hǎo! Wǒ bā suì.'), L("Hello, everyone! My name is ___. I'm ___.", '大家好！我叫___。我___岁。', 'Dàjiā hǎo! Wǒ jiào ___. Wǒ ___ suì.'), L("I'm seven. What about you?", '我七岁。你呢？', 'Wǒ qī suì. Nǐ ne?')], [16, 17], 'nghe', ['Tập viết: ten, eight, 八.']),
      veCuoi(),
      m(7, 'du', 'cau', 'Còn thời gian · Phiên dịch nhí unit trước', 3, 'nghe', { du: true, lead: true, pdn: true, pairs: [{ ...L('Good morning, Mrs Lan!', 'Lan老师，早上好！', 'Lan lǎoshī, zǎoshang hǎo!'), img: W.year.img }, { ...L('Touch your knees!', '摸摸膝盖！', 'Mōmō xīgài!'), img: W.year.img }], con: 'Câu của unit trước.', note: ['Màn dự phòng.'] }),
    ] }, NAMES);

  // ---------------- BUỔI 7 · Produce ----------------
  const b7 = buoi({ t: 'Buổi 7 · Unit 2 Name and age · Produce', vai: 'nghe', days: [16, 17], next: [18, 19],
    about: 'Kể lại theo tranh, diễn hai tiếng, phiếu cuối unit (Starters L2 + YCT 1), sân khấu "về con" theo đôi, My Book. Cô chỉ nghe và chấm 4 đầu ra.',
    MAN: [
      chao(true), veDau(),
      luot('hoi-con', 1, 'Hỏi về con · 2 câu', 3, 'nghe', { lead: true, off: true, img: CLS, pairs: [Q_NAME, Q_AGE], cue: 'Hỏi 2 bạn: tên và tuổi!', con: 'Đứng tại chỗ; hỏi 2 bạn câu của unit này và unit trước.', note: ['Cô nghe, ghi Bảng của cô (chấm Giao tiếp).'] }),

      m(2, 'ke-tranh', 'book', 'Nghe lại nhanh · Kể theo tranh', 6, 'nghe', { lead: true, lang: 'en', hide: true, title: "Vũ's Birthday", title_zh: 'Vũ的生日', pages: S([10, 11, 12, 13, 14, 15]).filter((_, i) => i % 3 === 0), con: 'Máy đọc nhanh cả truyện 1′ (xem tranh); rồi chữ che, nhóm kể.', note: ['★ Bạn nhỏ: kể 1 tranh · ★★ Bạn lớn: kể 2 tranh, nối bằng Then…. Hết giờ cả lớp đứng.'] }),
      m(2, 'starters-l2', 'kt', 'Dạng đề Starters · L2 nghe – viết số tuổi', 5, 'nghe', { off: true, items: kt(u, 'en', 3), cue: 'Nghe và viết vào phiếu!', con: 'Như phòng thi; phiếu A / B theo tầng.', note: ['Câu có 1 từ vòng ngoài trong tranh, không làm đáp án. Đây là phiếu cuối unit phần tiếng Anh. Chấm Nghe / Đọc / Viết.'], print: [pr('sd', '#/u/2/check', 'Phiếu cuối Unit 2')] }),
      m(2, 'nhom-dien', 'dien', 'Nhóm diễn · 1 cảnh tiếng Anh', 5, 'nghe', { lead: true, lang: 'en', hide: true, img: CANH, roles: ROLES, lines: S([10, 11, 12, 13, 14, 15]), con: 'Mỗi nhóm bốc thăm 1 cảnh, diễn với rối que; khán giả giơ ✓.', note: ['Lời che sẵn, nhóm tự nói.'] }),

      m(3, 'dung-sai-vd', 'move', 'Vận động · Đúng hay sai vận động', 4, 'nghe', { lead: true, off: true, cmds: [CMDN.seven, CMDN.nine, CMDN.nice, CMDN.wow], cue: 'Đúng thì giơ hai tay!', con: 'Bạn nhỏ dẫn theo bảng xoay vòng; đúng thì giơ hai tay, sai thì ngồi xuống rồi đứng lại.', note: ['Từ mục tiêu: Seven, Nine, Nice to meet you.'] }),
      m(3, 'tram', 'move', 'Vận động đi chậm · Ba trạm ngắn', 4, 'nghe', { lead: true, off: true, cmds: [CMDN.seven, CMDN.nine, CMDN.nice], cue: 'Ba trạm: Seven · Nine · Nice to meet you!', con: 'Ba trạm cách nhau ≥ 2m, mỗi trạm một thẻ lệnh; mỗi nhóm đi bộ đến trạm, làm lệnh 40 giây rồi đổi trạm.', note: ['Mỗi trạm một từ mục tiêu: Seven, Nine, Nice to meet you.'] }),
      nghiS(),

      m(4, 'tap-zh', 'dien', 'Tập 中文 2′ + diễn 中文 1 cảnh', 6, 'nghe', { lead: true, lang: 'zh', hide: true, img: CANH, roles: ROLES, lines: S([10, 11, 12, 13, 14, 15]), con: 'Máy phát lời từng vai, nhóm nhắc theo 2′; rồi mỗi nhóm diễn 1 cảnh bằng tiếng Trung.', note: ['Cô nghe, ghi Bảng của cô.'] }),
      m(4, 'yct-1', 'kt', 'Dạng đề YCT 1 · Nghe – chọn tranh', 5, 'nghe', { off: true, items: kt(u, 'zh', 3), cue: '听一听，圈一圈！', con: 'Như phòng thi; phiếu A / B theo tầng.', note: ['Đây là phiếu cuối unit phần tiếng Trung. Chấm Nghe / Đọc.'], print: [pr('sd', '#/u/2/check', 'Phiếu cuối Unit 2')] }),
      m(4, 'pdn', 'cau', 'Phiên dịch nhí · từng con (đôi luyện trước)', 4, 'nghe', { lead: true, off: true, pdn: true, game: true, cue: 'Leo nói gì? Nói cho Xiaomei!',
        pairs: [{ ...L('Wow! Eight is bigger than seven!', '哇！八比七大！', 'Wā! Bā bǐ qī dà!'), img: W['is bigger than'].img }, { ...L('Happy birthday, Vũ!', 'Vũ，生日快乐！', 'Vũ, shēngrì kuàilè!'), img: ch.bong.img }, { ...L('Wow! Really? You are nine?', '哇！真的吗？你九岁？', 'Wā! Zhēn de ma? Nǐ jiǔ suì?'), img: W['really?'].img }],
        con: 'Không mẫu. Từng con nói lại cho rối Xiaomei.', note: ['★ Bạn nhỏ: câu ≤ 4 chữ · ★★ Bạn lớn: câu đủ. Chấm Giao tiếp.'] }),
      m(4, 'cau', 'cau', 'Cầu nối · con giải thích', 2, 'nghe', { lead: true, pairs: [{ ...L('What about you?', '你呢？', 'Nǐ ne?'), img: W['what about you?'].img, gk: 'Rối Xiaomei nói 1 câu sai trật tự; con giơ ✗, bạn lớn nói lại đúng.' }], con: 'Bạn lớn nói lại câu đúng và chỉ chỗ khác trên thẻ chữ.', note: ['☆2 bỏ khi thiếu giờ.'] }),

      chu('chu-on', 'Chữ và âm · đôi bạn ôn và viết', 6, 'nghe', [{ h: 'Ôn âm /i/', big: 'i', small: 'six · finger' }, { h: 'Bảng con · ôn cả chặng', words: ['nice', 'year', 'nine', 'ten', 'eight'] }, { h: 'Bảng con · tiếng Trung', zh: true, words: ['么', '九', '七', '八'] }], '1′ đầu đứng: tay vẽ thanh, nói âm; rồi bạn lớn đọc, bạn nhỏ viết; đổi vai.', ['Cô chụp bảng con để chấm Viết.'], { lead: true }),

      m(6, 'tap-khuc', 'hoi', 'Tập khúc · đôi bạn', 2, 'giup', { lead: true, img: CLS, pairs: [{ q: L('Your turn!', '轮到你了！', 'Lúndào nǐ le!'), a: L("Hello, everyone! My name is ___. I'm ___.", '大家好！我叫___。我___岁。', 'Dàjiā hǎo! Wǒ jiào ___. Wǒ ___ suì.'), img: W.year.img }], con: 'Đôi bạn đứng nói nhỏ khúc của mình cho nhau 1 lượt.', note: ['★ Bạn nhỏ: "Hello, everyone! My name is ___. I\'m ___." · ★★ Bạn lớn: thêm "…years old. Nice to meet you!"'] }),
      m(6, 'san-khau', 'chao', 'Sân khấu của con · theo đôi', 8, 'nghe', { lead: true, img: SK, lines: [L("Hello, everyone! My name is ___. I'm ___ years old. Nice to meet you!", '大家好！我叫___。我___岁。很高兴认识你们！', 'Dàjiā hǎo! Wǒ jiào ___. Wǒ ___ suì. Hěn gāoxìng rènshi nǐmen!')], con: 'Đôi lên cùng, mỗi con khoảng 30″: bạn nhỏ khúc ★, bạn lớn khúc ★★.', note: ['Khán giả giơ ★; sau mỗi 2 đôi cả lớp đứng đáp "Hooray! 耶！".', 'Điện thoại trên chân máy, một bạn lớn bấm quay. Con nhút nhát nói cùng bạn đôi. Chấm Thuyết trình (xem lại video).'] }),
      m(6, 'my-book', 'lam', 'My Book · dán trang unit', 3, 'giup', { off: true, img: W.year.img, ten: 'My Book · Unit 2', mat: 'Trang My Book, câu in sẵn, keo khô', steps: ['Con dán 1 trang My Book: tranh + 2 câu hai tiếng của khúc vừa nói.', 'Bạn lớn tự viết, bạn nhỏ dán câu in sẵn.'], line: L("My name is ___. I'm ___ years old.", '我叫___。我___岁。', 'Wǒ jiào ___. Wǒ ___ suì.'), con: 'Dán trang My Book.', note: ['☆1 bỏ khi thiếu giờ.'] }),
      ngheChi(3, 'nghe', 'Máy đọc cả lượt tiếng Anh rồi cả lượt tiếng Trung.', []),

      tong(7, [L("Hello, everyone! My name is ___. I'm ___.", '大家好！我叫___。我___岁。', 'Dàjiā hǎo! Wǒ jiào ___. Wǒ ___ suì.')], [18, 19], 'nghe', ['Cô chấm 4 đầu ra (0–2) từ Bảng của cô, phiếu và video; gửi nhận xét ba mẹ sau giờ học.']),
      veCuoi(),
      m(7, 'du', 'cau', 'Còn thời gian · Phiên dịch nhí unit trước', 3, 'nghe', { du: true, lead: true, pdn: true, pairs: [{ ...L('Good morning, Mrs Lan!', 'Lan老师，早上好！', 'Lan lǎoshī, zǎoshang hǎo!'), img: W.year.img }, { ...L('See you tomorrow!', '明天见！', 'Míngtiān jiàn!'), img: W.year.img }], con: 'Câu của unit trước.', note: ['Màn dự phòng.'] }),
    ] }, NAMES);

  return { ten: 'Seedling', sau: 'Unit 3 (buổi 8–11): làm sau khi chị duyệt Unit 2', buoi: { 4: b4, 5: b5, 6: b6, 7: b7 } };
}

module.exports = { NOI: require('./noi-dung-u1.js').NOI, lv: { ls: littleSeed(), sd: seedling() } };
