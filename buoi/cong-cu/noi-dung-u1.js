/* Nội dung web dạy buổi trên lớp · UNIT 1 (buổi 1–3) của Little Seed 48 và Seedling 48 – nguồn duy nhất để sửa.
   Làm từng unit, chị duyệt xong unit này mới làm unit sau (chị dặn 12/11/2026).
   Ngữ liệu (từ, truyện, big book, vè, thủ công, phiếu cuối unit) lấy thẳng từ dữ liệu học liệu in của từng level
   (little-seed/day/hoc-lieu-data.js, seedling/day/hoc-lieu/hoc-lieu-data.js) = cùng nội dung web học của con.
   Cách tổ chức buổi: tài liệu "GrapeSEED và Budding Bean: nguyên tắc tổ chức buổi học offline" (12/11/2026):
   giữ 7 khối của khung 48 buổi; trong khối là các màn ngắn (p = phút gợi ý), vận động chuyển tiếp 5–8′/lần,
   từ đi kèm văn bản, vai cô theo buổi: b1 làm mẫu (mau) → b2 giúp con đáp (giup) → b3 nghe con (nghe).
   Sau khi sửa: node buoi/cong-cu/build.js  (ghép giọng có sẵn, ghi danh sách câu còn thiếu giọng). */
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const hl = f => { global.window = global; delete require.cache[require.resolve(path.join(ROOT, f))]; require(path.join(ROOT, f)); return global.window.HL; };
const HLS = hl('little-seed/day/hoc-lieu-data.js'), HSD = hl('seedling/day/hoc-lieu/hoc-lieu-data.js');
const U = (H, k) => H.units.find(u => u.key === String(k));
const r = p => p ? '../' + p : '';
const L = (en, zh, py, o = {}) => ({ en, zh, py, ...o });
const NV = '../seedling/tai-nguyen/nhan-vat/', TR = '../seedling/tai-nguyen/tranh/', LSI = '../xem-truoc/tai-nguyen/little-seed/img/';
const PRINT = { ls: '../little-seed/day/', sd: '../seedling/day/hoc-lieu/' };
const pr = (lv, h, t) => ({ t, url: PRINT[lv] + h });

// từ của unit (ảnh, chữ, pinyin) – tra theo chữ tiếng Anh
const wordsOf = u => Object.fromEntries(u.words.map(w => [w.en, { en: w.en, zh: w.zh, py: w.py, img: r(w.img) }]));
const cards = (W, list) => list.map(k => { if (!W[k]) throw new Error('Thiếu từ ' + k); return W[k]; });
// cảnh truyện theo ngày web → trang sách
const scenes = (u, days) => u.parts.filter(p => days.includes(p.day)).flatMap(p => p.scenes.map(s => ({ en: s.en, zh: s.zh, py: s.py, img: r(s.img), who: s.who })));
const bbPages = (b, from, to, cover) => (cover ? [cover] : []).concat(b.pages.slice(from, to).map(p => ({ en: p.en, zh: p.zh, py: p.py, img: r(p.img) })));
const veLines = (v, idx, mv) => idx.map((i, k) => ({ ...v.lines[i], mv: mv[k] || '' }));

// lệnh vận động (lời lớp học + động tác) dùng chung
const CMD = {
  stand: L('Stand up!', '起立！', 'Qǐlì!', { ic: '🧍' }),
  sit: L('Sit down, please.', '请坐。', 'Qǐng zuò.', { ic: '🪑' }),
  look: L('Look!', '看！', 'Kàn!', { img: '../little-seed/tai-nguyen-ls/the/look.webp' }),
  listen: L('Listen!', '听！', 'Tīng!', { ic: '👂' }),
  wave: L('Wave!', '挥挥手！', 'Huīhuī shǒu!', { img: LSI + 'v1_n1_tu_goodbye_l1.webp' }),
  clap: L('Clap your hands!', '拍拍手！', 'Pāipāi shǒu!', { img: TR + 'clap_your_hands.webp' }),
  stamp: L('Stamp your feet!', '跺跺脚！', 'Duòduò jiǎo!', { img: TR + 'stamp_your_feet.webp' }),
  jump: L('Jump!', '跳一跳！', 'Tiào yi tiào!', { img: TR + 'jump.webp' }),
  touchHead: L('Touch your head!', '摸摸头！', 'Mōmō tóu!', { img: TR + 'head.webp' }),
  touchNose: L('Touch your nose!', '摸鼻子！', 'Mō bízi!', { img: TR + 'touch.webp' }),
};
const NOI = { en: L('Leo says…', '', ''), zh: L('', 'Xiaomei说……', 'Xiaomei shuō…') };
// bài hát vận động: kho "Xem thêm" của web (kênh có trên YouTube Kids) – giống Buổi 0
const NHAC = {
  hello: [{ id: 'tVlcKp3bWH8', t: 'Hello!', c: 'Super Simple Songs', l: 'en' }, { id: 'm_rDIzj6DRE', t: '你好歌 · Hello Song', c: 'Little Fox Chinese', l: 'zh' }],
  vui: [{ id: 'M6LoRZsHMSs', t: "If You're Happy And You Know It", c: 'Super Simple Songs', l: 'en' }, { id: 'wAGJVPXaHHk', t: '如果感到幸福你就拍拍手', c: 'Little Fox Chinese', l: 'zh' }],
  rung: [{ id: 'GoSq-yZcJ-4', t: 'Walking In The Jungle', c: 'Super Simple Songs', l: 'en' }, { id: 'RFizy8IKgKs', t: '我会跳 · I Can Hop', c: 'Little Fox Chinese', l: 'zh' }],
  bye: [{ id: 'PraN5ZoSjiY', t: 'Bye Bye Goodbye', c: 'Super Simple Songs', l: 'en' }, { id: 'wED_ZaR8l2U', t: '再见歌 · Good-bye Song', c: 'Little Fox Chinese', l: 'zh' }],
};
const NGHI = ['💧 Uống nước', '🚻 Đi vệ sinh', '🙆 Vươn vai, nhìn xa'];

/* =====================================================================
   LITTLE SEED 48 · Unit 1 Greeting (tuần 1–3, buổi 1–3, ngày web 1–9) · lớp offline: các con lớp 1–5 học chung, chưa học PreB
   7 khối theo khung LS 48: [1] 0–10 chào [2] 10–25 tiếng Anh [3] 25–33 vận động [4] 33–50 tiếng Trung
   [5] 50–60 nghỉ, làm tay [6] 60–80 truyện, big book [7] 80–90 tổng kết
   ===================================================================== */
function littleSeed() {
  const u = U(HLS, 1), W = wordsOf(u), bb = u.bb[0], ve = u.ve[0];
  const CO = NV + 'huou_huou1_a.webp', CLS = '../seedling/tai-nguyen/trang/ls_class.webp', BB = '../little-seed/tai-nguyen-ls/bigbook/u1/';
  const ch = Object.fromEntries(u.chars.map(c => [c.key, { k: c.key, ten: c.name, img: r(c.img) }]));
  const KHOI = [
    { n: 1, t: 'Chào và khởi động', tu: 0, den: 10 }, { n: 2, t: 'Khối tiếng Anh', tu: 10, den: 25 },
    { n: 3, t: 'Vận động – nghỉ mắt', tu: 25, den: 33 }, { n: 4, t: 'Khối tiếng Trung', tu: 33, den: 50 },
    { n: 5, t: 'Nghỉ và làm tay', tu: 50, den: 60 }, { n: 6, t: 'Truyện unit và big book', tu: 60, den: 80 },
    { n: 7, t: 'Tổng kết, việc ở nhà', tu: 80, den: 90 },
  ];
  // vè chào: dòng 1–4 mở buổi (dòng 4 thay "Leo" bằng tên con), dòng 5–6 đóng buổi – đúng lời vè trên web học
  const VE_DAU = veLines(ve, [0, 1, 2, 3], ['👋', '👏', '🤲', '🙋']), VE_CUOI = veLines(ve, [4, 5], ['👋', '🎒']);
  const cover = { en: bb.title, zh: bb.title_zh, py: 'Xiǎogǒu, zàijiàn!', img: BB + 'bia_khung.webp', cover: true };
  const puppyQ = L('Where is Puppy?', '小狗在哪儿？', 'Xiǎogǒu zài nǎr?', { vi: 'Puppy trốn ở đâu? Con chỉ vào tranh.' });
  const withQ = ps => ps.map(p => p.cover ? p : { ...p, q: puppyQ });
  const hi = (k, en, zh, py, bye) => ({ img: (W[k] || ch[k] || {}).img, ten: (W[k] || ch[k] || {}).en || '', hi: L(en, zh, py), bye: bye ? L(...bye) : null });
  const DOOR = [
    hi('mommy', 'Hello, mommy!', '妈妈，你好！', 'Māma, nǐ hǎo!', ['Goodbye, mommy!', '妈妈，再见！', 'Māma, zàijiàn!']),
    hi('kitten', 'Hello, kitten!', '小猫，你好！', 'Xiǎomāo, nǐ hǎo!', ['Goodbye, kitten!', '小猫，再见！', 'Xiǎomāo, zàijiàn!']),
    hi('teacher', 'Hello, teacher!', '老师，你好！', 'Lǎoshī, nǐ hǎo!', ['Goodbye, teacher!', '老师，再见！', 'Lǎoshī, zàijiàn!']),
    hi('friend', 'Hello, friend!', '朋友，你好！', 'Péngyou, nǐ hǎo!', ['Goodbye, friend!', '朋友，再见！', 'Péngyou, zàijiàn!']),
    hi('everyone', 'Hello, everyone!', '大家好！', 'Dàjiā hǎo!', ['Goodbye, everyone!', '大家再见！', 'Dàjiā zàijiàn!']),
  ];
  const DOOR2 = DOOR.concat([
    hi('daddy', 'Hello, daddy!', '爸爸，你好！', 'Bàba, nǐ hǎo!', ['Goodbye, daddy!', '爸爸，再见！', 'Bàba, zàijiàn!']),
    hi('puppy', 'Hello, puppy!', '小狗，你好！', 'Xiǎogǒu, nǐ hǎo!', ['Good night, puppy!', '小狗，晚安！', 'Xiǎogǒu, wǎn\'ān!']),
  ]);
  const st = scenes(u, [1, 2, 3, 4, 5]);
  // 8 cảnh chính của Bông's Day theo thứ tự trong ngày (trò xếp tranh sáng – trưa – chiều)
  const pickScene = en => { const s = st.find(x => x.en === en); if (!s) throw new Error('Thiếu cảnh ' + en); return s; };
  const DAY8 = ['Good morning, mommy!', 'Goodbye, mommy!', 'Hello, teacher!', 'Hello, friend!', 'Goodbye, teacher!', 'Hello, daddy!', 'Hello, puppy!', 'Good night, puppy!'].map(pickScene);
  const ROLE = ['bong', 'me', 'co', 'anna', 'bo', 'cun', 'leo', 'xiaomei', 'lop'].filter(k => ch[k]).map(k => ch[k]);
  // ---- Nguyên tắc chị duyệt 12/11 tối: lớp offline là các con lớp 1–5 học chung ----
  // vai cô ghi theo từng màn (mau = cô làm mẫu, giup = cô giúp con đáp, nghe = cô nghe, con dẫn); nội dung mới luôn bắt đầu bằng "mau".
  // lead = màn con làm chủ (con dẫn, đôi bạn, nhóm, con nói một mình); off = tắt chiếu (thẻ in, rối, đồ thật; chỉ máy cô thấy màn).
  // Mục tiêu mỗi unit: con làm chủ buổi 1 ≈ 15′ → buổi 2 ≈ 30–40′ → buổi 3 ≥ 50′; tắt chiếu ≥ 30′ mỗi buổi, buổi 3 nhiều nhất.
  // Ghép đôi "bạn lớn – bạn nhỏ" (lớp 4–5 kèm lớp 1–2) cho mọi hoạt động đôi bạn, nhóm.
  const tong = (b, lines, days, vai, extra = []) => ({ k: 7, id: 'tong', type: 'tong', t: 'Hôm nay con nói được', p: 4, lines, vai, lead: true,
    home: [`Ngày web ${days.join(', ')} (mỗi ngày 10–15 phút).`, `Phiếu tô – dán buổi ${b} (khoảng 10 phút).`, ...extra],
    con: 'Mỗi con tự chọn 1 câu của buổi, nói bằng hai tiếng; bạn lớn nói câu dài hơn.',
    note: ['Gọi lần lượt từng con, cô giơ tranh làm gợi ý. Con dừng quá 3 giây thì bạn cùng đôi nhắc nhỏ, rồi con nói lại.', 'Trao sao cho hai đội; cộng sao cá nhân trên Bảng của cô.', 'Dặn ba mẹ qua Zalo: ngày web tiếp theo và phiếu ở nhà.'],
    print: [pr('ls', '#/b/' + b, 'Phiếu tô – dán buổi ' + b)] });
  const veCuoi = (vai, lead) => ({ k: 7, id: 've-cuoi', type: 've', t: 'Vè chào cuối buổi', p: 2, lines: VE_CUOI, img: BB + 'p9.webp', vai, lead,
    con: lead ? 'Một bạn bắt nhịp, cả lớp hát, vẫy tay, đeo cặp.' : 'Hát cùng cô, vẫy tay, làm động tác đeo cặp.',
    note: ['Hát tiếng Anh rồi bấm đổi sang tiếng Trung. Đứng dậy, vẫy tay, đeo cặp, xếp hàng ra cửa.'] });
  // Nghe – chỉ sách (học từ giờ nghe và chỉ sách của Budding Bean): tắt chiếu, mỗi đôi một bản big book in, máy cô phát giọng
  const ngheChi = (id, k, p, pages, vai, con, note) => ({ k, id, type: 'book', t: 'Nghe – chỉ sách · Goodbye, Puppy!', p, off: true, vai, lang: 'en',
    title: bb.title, title_zh: bb.title_zh, pages, con, cue: 'Mở big book của đôi mình, ngón tay sẵn sàng!',
    note: ['Mỗi đôi bạn lớn – bạn nhỏ một bản big book in. Bấm ▶ Đọc cả lượt: máy đọc từng trang, các con lật trang và chỉ ngón tay theo.', 'Hết lượt tiếng Anh, bấm đổi 中文 rồi ▶ Đọc cả lượt tiếng Trung (không trộn hai tiếng).', ...note],
    print: [pr('ls', '#/u/1/bigbook', 'Big book in (mỗi đôi 1 bản)')] });
  const HOI_BAN = [
    { q: L('Who do you say good morning to?', '你跟谁说早上好？', 'Nǐ gēn shéi shuō zǎoshang hǎo?'), a: L('Good morning, mommy!', '妈妈，早上好！', 'Māma, zǎoshang hǎo!'), img: W.mommy.img },
    { q: L('Who do you say good night to?', '你跟谁说晚安？', 'Nǐ gēn shéi shuō wǎn\'ān?'), a: L('Good night, puppy!', '小狗，晚安！', 'Xiǎogǒu, wǎn\'ān!'), img: W['good night'].img },
  ];

  const b1 = { t: 'Buổi 1 · Unit 1 Greeting · Introduce', vai: 'mau', days: [1, 2, 3], next: [4, 5, 6],
    about: 'Chào và tạm biệt mẹ, mèo, cô, bạn (truyện phần 1–3, big book trang 1–7). Nội dung mới: cô làm mẫu trước; từ lượt thứ hai các đôi bạn tự làm.',
    KHOI, MAN: [
      { k: 1, id: 'chao', type: 'chao', t: 'Chào cả lớp', p: 1, vai: 'mau', img: CLS, co: CO, lines: [L('Good morning, everyone!', '大家早上好！', 'Dàjiā zǎoshang hǎo!'), L('Hello, everyone!', '大家好！', 'Dàjiā hǎo!')],
        con: 'Vẫy tay, chào lại cô.', note: ['Đeo lại thẻ tên của buổi 0. Xếp chỗ theo đôi bạn lớn – bạn nhỏ (lớp 4–5 ngồi cạnh lớp 1–2), giữ cố định cả unit.'] },
      { k: 1, id: 've-dau', type: 've', t: 'Vè chào đầu buổi', p: 4, vai: 'mau', lines: VE_DAU, img: BB + 'p7.webp',
        con: 'Hát cả 4 dòng (đã nghe trên web ngày 1–3), làm động tác.',
        note: ['Bấm 🥁 Nhịp, hát mẫu tiếng Anh 1 lần, cả lớp hát theo 2 lần. Dòng 4: thay "Leo" bằng tên một con.', 'Đổi sang tiếng Trung, hát mẫu, cả lớp hát theo. Chơi hát to – hát nhỏ 1 lần.'] },
      { k: 1, id: 'hoi-ten', type: 'hoi', t: 'Đôi bạn hỏi tên', p: 4, vai: 'giup', lead: true, off: true, img: CLS, cue: 'Quay sang bạn bên cạnh: What\'s your name?',
        pairs: [{ q: L("What's your name?", '你叫什么名字呀？', 'Nǐ jiào shénme míngzi ya?'), a: L("An, An, that's my name!", '我叫An，An呀！', 'Wǒ jiào An, An ya!') }],
        con: 'Đôi bạn hỏi – đáp tên nhau bằng câu vè, đổi vai; rồi đổi sang tiếng Trung.',
        note: ['1′ đầu cô làm mẫu với một bạn lớn trước lớp (bấm 🔊 Hỏi, 👀 Đáp mẫu trên máy cô). Sau đó tắt chiếu, các đôi tự hỏi – đáp.', 'Cô đi vòng nghe; bạn nhỏ chưa nói được thì bạn lớn nói trước, bạn nhỏ nhắc theo.'] },

      { k: 2, id: 'the-en', type: 'flash', t: 'Thẻ tranh · Bông\'s Day', p: 3, vai: 'mau', lang: 'en', mode: 'ts', cards: cards(W, ['good morning', 'hello', 'goodbye', 'mommy', 'kitten', 'teacher', 'everyone', 'friend']),
        con: 'Nhìn tranh, nghe cô đọc 2 lần, nhắc theo cả lớp.', note: ['Chỉ đưa thẻ của truyện vừa học (phần 1–3). Bấm ▶ Cả lượt: mỗi thẻ phóng to, máy đọc 2 lần, con nhắc sau mỗi lần.', 'Cô làm động tác cho mỗi từ: good morning – vươn vai; goodbye – vẫy; kitten – meo.'] },
      { k: 2, id: 'truyen-en', type: 'book', t: 'Truyện · Bông\'s Day (phần 1–3)', p: 4, vai: 'mau', lang: 'en', title: 'Bông\'s Day', title_zh: 'Bông的一天', pages: scenes(u, [1, 2, 3]),
        con: 'Nghe, nhìn tranh, chỉ vào người được chào; bạn lớn đọc thầm theo chữ.', hoi: ['Hỏi cả lớp: "Who is it? Mommy? Kitten?" Con chỉ hoặc nói một từ, cô nói lại cả câu.'],
        note: ['Cô kể cả lượt tiếng Anh, chỉ vào tranh. Không dừng giảng từ; con chỉ cần hiểu ai chào ai.'] },
      { k: 2, id: 'chuyen-1', type: 'move', t: 'Đứng dậy nào', p: 1, vai: 'mau', cmds: [CMD.stand, CMD.wave, CMD.clap, CMD.sit],
        con: 'Làm theo lệnh.', note: ['Chuyển tiếp 1 phút: cô nói và làm mẫu từng lệnh.'] },
      { k: 2, id: 'cua-en', type: 'cua', t: 'Trò chơi · Cửa lớp thần kỳ', p: 4, vai: 'giup', lead: true, off: true, lang: 'en', items: DOOR, game: true, cue: 'Cửa lớp thần kỳ! Bước vào: Hello! Bước ra: Goodbye!',
        rules: ['Hai ghế làm cửa lớp. Cô giơ flashcard: bước vào nói "Hello, ___!", bước ra nói "Goodbye, ___!"', 'Lượt 1 cô làm mẫu; từ lượt 2 từng đôi đi qua cửa, tự nói; cả lớp chấm: đúng thì vỗ tay 2 cái.'],
        con: 'Từng đôi đi qua cửa, tự nói câu chào hoặc tạm biệt.', note: ['Tắt chiếu: cô cầm flashcard in; máy cô bấm 🎲 để chọn người và chiều cửa, 👀 nghe câu mẫu khi đôi cần.'],
        print: [pr('ls', '#/u/1/flash', 'Flashcard Unit 1')] },
      { k: 2, id: 'chon-en', type: 'chon', t: 'Giơ thẻ mini', p: 3, vai: 'giup', off: true, lang: 'en', game: true, items: cards(W, ['good morning', 'goodbye', 'mommy', 'kitten', 'teacher', 'friend']), cue: 'Thẻ mini sẵn sàng! Nghe và giơ thẻ!',
        con: 'Mỗi đôi một bộ thẻ mini; nghe từ, giơ thẻ đúng thật nhanh.', note: ['Tắt chiếu. Máy cô bấm 🎲 Gọi để đọc từ; cô nhìn thẻ các đôi giơ, khen đôi nhanh nhất.'],
        print: [pr('ls', '#/u/1/mini', 'Thẻ mini')] },

      { k: 3, id: 'nhac', type: 'song', t: 'Vận động · Bài hát chào', p: 3, vai: 'mau', songs: NHAC.hello, moves: ['👋 Vẫy tay mỗi lần nghe "Hello" / 你好', '👏 Vỗ tay theo nhạc', '🙂 Quay sang chào bạn'],
        con: 'Hát, nhún, vẫy theo video.', note: ['Cả lớp đứng dậy theo video. Hết bài tiếng Anh, bấm sang bài tiếng Trung.'] },
      { k: 3, id: 'says', type: 'says', t: 'Trò chơi · Leo says / Xiaomei says', p: 5, vai: 'mau', cmds: [CMD.stand, CMD.sit, CMD.look, CMD.listen, CMD.wave, CMD.clap],
        rules: ['Leo ra lệnh bằng tiếng Anh, Xiaomei bằng tiếng Trung.', 'Có "Leo says…" / "Xiaomei说…" thì làm theo.', 'Không có thì đứng yên như tượng.'],
        con: 'Nghe lệnh lời lớp học, làm động tác.', note: ['Lời lớp học mới: Look! Listen! Sit down, please. (看！听！请坐。) – bấm thẻ bên phải để nghe riêng từng lệnh và làm mẫu.', 'Buổi 1 chưa bật lệnh lừa.'] },

      { k: 4, id: 'the-zh', type: 'flash', t: '图卡 · Bông的一天', p: 3, vai: 'mau', lang: 'zh', mode: 'ts', cards: cards(W, ['good morning', 'hello', 'goodbye', 'mommy', 'kitten', 'teacher', 'everyone', 'friend']),
        con: 'Nghe 2 lần, nhắc theo cả lớp; tay vẽ thanh trên không.', note: ['Cùng 8 tranh như khối tiếng Anh. Chú ý thanh: 早上好 (zǎo – thanh 3), 再见 (zài – thanh 4).'] },
      { k: 4, id: 'truyen-zh', type: 'book', t: '故事 · Bông的一天 (phần 1–3)', p: 4, vai: 'mau', lang: 'zh', title: 'Bông\'s Day', title_zh: 'Bông的一天', pages: scenes(u, [1, 2, 3]),
        con: 'Nghe, chỉ người được chào.', note: ['Kể cả lượt tiếng Trung, cùng tranh. Không chen tiếng Anh vào lượt này.'] },
      { k: 4, id: 'cau', type: 'cau', t: 'Cầu nối · Leo và Xiaomei', p: 3, vai: 'mau',
        pairs: [{ ...L('Hello, mommy!', '妈妈，你好！', 'Māma, nǐ hǎo!'), img: W.mommy.img, gk: 'Giống: cùng chào mẹ, cùng vẫy tay. Khác: tiếng Trung gọi 妈妈 trước rồi mới chào.' },
          { ...L('Hello, everyone!', '大家好！', 'Dàjiā hǎo!'), img: W.everyone.img, gk: 'Khác: 大家 + 好, không có 你.' }],
        con: 'Nghe hai bạn nói, tìm chỗ giống và khác (chỉ tay vào rối).', note: ['Rối Leo nói câu tiếng Anh, rối Xiaomei nói câu tiếng Trung. Hỏi bằng tiếng Việt: "Bạn nào gọi mẹ trước?"'] },
      { k: 4, id: 'chuyen-2', type: 'move', t: '站起来！', p: 1, vai: 'mau', cmds: [CMD.stand, CMD.jump, CMD.wave, CMD.sit], con: 'Làm theo lệnh tiếng Trung.', note: ['Chuyển tiếp 1 phút, cô nói tiếng Trung trước.'] },
      { k: 4, id: 'cua-zh', type: 'cua', t: '游戏 · Cửa lớp thần kỳ', p: 3, vai: 'giup', lead: true, off: true, lang: 'zh', items: DOOR, game: true, cue: '进来：你好！出去：再见！',
        rules: ['Bước vào: "___，你好！"', 'Bước ra: "___，再见！"'], con: 'Từng đôi đi qua cửa, tự nói bằng tiếng Trung.', note: ['Như khối tiếng Anh. Với 大家 câu đúng là 大家好！ (không có 你).'] },
      { k: 4, id: 'chon-zh', type: 'chon', t: '游戏 · Giơ thẻ mini', p: 3, vai: 'giup', off: true, lang: 'zh', game: true, items: cards(W, ['good morning', 'goodbye', 'mommy', 'kitten', 'teacher', 'friend']), cue: '听一听，举卡片！',
        con: 'Nghe từ tiếng Trung, giơ thẻ mini đúng.', note: ['Tắt chiếu. Bấm nút ngôn ngữ sang 🔀 xen kẽ hai tiếng nếu lớp làm tốt.'] },

      { k: 5, id: 'nghi', type: 'nghi', t: 'Nghỉ giải lao', p: 4, vai: 'mau', img: CLS, list: NGHI, con: 'Uống nước, đi vệ sinh.', note: ['Bấm ▶ Bắt đầu: đồng hồ 4 phút.'] },
      { k: 5, id: 'lam', type: 'lam', t: 'Làm tay · ' + u.craft.name, p: 6, vai: 'mau', off: true, img: r(u.craft.kids[0].img), ten: u.craft.name, mat: u.craft.mat, steps: u.craft.steps,
        line: L("Hello! My name is ___.", '你好！我叫___。', 'Nǐ hǎo! Wǒ jiào ___.'),
        con: 'Làm thẻ tên; vừa làm vừa hỏi tên bạn bên cạnh.', note: ['Tắt chiếu. Bạn lớn tự viết tên, giúp bạn nhỏ viết.'],
        print: [pr('ls', '#/u/1/craft', 'Thủ công Unit 1'), pr('ls', '#/u/1/names', 'Thẻ tên')] },

      ngheChi('nghe-chi', 6, 8, bbPages(bb, 0, 7, cover), 'mau', 'Mỗi đôi lật big book in, chỉ ngón tay vào tranh (bạn nhỏ) và chữ (bạn lớn) theo giọng đọc.',
        ['Buổi 1 đọc bìa đến trang 7 (con đã nghe trên web ngày 1–3).']),
      { k: 6, id: 'bb-tim', type: 'book', t: 'Big book · Puppy trốn ở đâu?', p: 3, vai: 'giup', lang: 'en', title: bb.title, title_zh: bb.title_zh, pages: withQ(bbPages(bb, 1, 7)),
        con: 'Lên chỉ chỗ Puppy trốn trên màn, nói câu của trang.', hoi: ['❓ Where is Puppy? – con chỉ. Puppy lén theo Bông cả ngày!'], note: ['Mỗi trang gọi một bạn lên chỉ Puppy, rồi cả lớp nói câu của trang.'] },
      { k: 6, id: 'chuyen-3', type: 'move', t: 'Nhón chân như Puppy', p: 1, vai: 'mau', cmds: [CMD.stand, CMD.jump, CMD.clap, CMD.sit], con: 'Làm theo lệnh.', note: ['Cô nói: "Puppy is coming!", cả lớp nhón chân đi quanh ghế.'] },
      { k: 6, id: 'pdn', type: 'cau', t: 'Phiên dịch nhí · nói cho Xiaomei', p: 4, vai: 'mau', pdn: true,
        pairs: [{ ...L('Hello, teacher!', '老师，你好！', 'Lǎoshī, nǐ hǎo!'), img: W.teacher.img, gk: 'Tiếng Trung gọi 老师 trước.' },
          { ...L('Goodbye, mommy!', '妈妈，再见！', 'Māma, zàijiàn!'), img: W.mommy.img, gk: '妈妈 trước, 再见 sau.' },
          { ...L('Hello, friend!', '朋友，你好！', 'Péngyou, nǐ hǎo!'), img: W.friend.img, gk: '朋友 trước, 你好 sau.' }],
        con: 'Câu 1 cô làm mẫu; câu 2–3 các đôi bàn 5 giây rồi nói cho Xiaomei.', note: ['Bấm 🔊 Leo nói. Câu 1 cô quay sang rối Xiaomei nói câu tiếng Trung; câu 2–3 để các đôi thử trước rồi mới bấm 👀.'] },
      { k: 6, id: 've-ls', type: 've', t: 'Vè · hát lại cả bài', p: 3, vai: 'mau', lines: VE_DAU.concat(VE_CUOI), img: BB + 'p6.webp', lang: 'en',
        con: 'Hát cùng cô, vỗ tay theo phách.', note: ['Hát trọn 6 dòng vè (4 dòng chào đầu, 2 dòng chào cuối).'] },

      tong(1, [W['good morning'], L('Hello, teacher!', '老师，你好！', 'Lǎoshī, nǐ hǎo!'), L('Goodbye, mommy!', '妈妈，再见！', 'Māma, zàijiàn!'), L('Hello, friend!', '朋友，你好！', 'Péngyou, nǐ hǎo!')], [4, 5, 6], 'giup'),
      veCuoi('mau', false),
      { k: 7, id: 'du', type: 'chon', t: 'Còn thời gian · Ai đây?', p: 3, du: true, vai: 'giup', lang: 'xen', game: true, items: ['bong', 'me', 'co', 'anna', 'leo', 'xiaomei'].map(k => ({ ...ch[k], en: 'Hello, ' + (k === 'me' ? 'mommy' : k === 'co' ? 'teacher' : ch[k].ten) + '!', zh: ({ me: '妈妈', co: '老师' }[k] || ch[k].ten) + '，你好！' })),
        con: 'Nghe câu chào, chỉ đúng người.', note: ['Màn dự phòng nếu còn giờ.'] },
    ] };

  const b2 = { t: 'Buổi 2 · Unit 1 Greeting · Repeat + Introduce', vai: 'giup', days: [4, 5, 6], next: [7, 8, 9],
    about: 'Phần mới (hẹn ngày mai, bố, cún, ngủ ngon) cô làm mẫu; phần đã học các con dẫn: đôi bạn, nhóm, mỗi trò có một bạn làm "cô".',
    KHOI, MAN: [
      { k: 1, id: 'chao', type: 'chao', t: 'Con chào cô trước', p: 1, vai: 'nghe', lead: true, img: CLS, co: CO, lines: [L('Good morning, teacher!', '老师，早上好！', 'Lǎoshī, zǎoshang hǎo!'), L('Hello, everyone!', '大家好！', 'Dàjiā hǎo!')],
        con: 'Con chào cô trước khi cô chào.', note: ['Cô đứng ở cửa, chờ con chào trước. Khen cụ thể con chào bằng tiếng Trung.'] },
      { k: 1, id: 've-dau', type: 've', t: 'Vè chào đầu buổi · bạn bắt nhịp', p: 3, vai: 'nghe', lead: true, lines: VE_DAU, img: BB + 'p7.webp',
        con: 'Một bạn lớn bắt nhịp, cả lớp hát; dòng 4 bạn bắt nhịp gọi tên bạn khác.', note: ['Cô chỉ bấm 🥁 Nhịp, không hát mẫu.'] },
      { k: 1, id: 'hoi-web', type: 'chon', t: 'Trên web con nhớ không? · bạn làm cô', p: 3, vai: 'nghe', lead: true, off: true, lang: 'en', game: true, items: cards(W, ['see you', 'daddy', 'puppy', 'good night']), cue: 'Bạn làm cô giơ thẻ, cả lớp nói!',
        con: 'Một bạn lớn làm "cô": giơ flashcard ngày web 4–6, cả lớp nói từ; bạn "cô" chọn người trả lời.', note: ['Tắt chiếu, dùng flashcard in. Cô đứng sau, chỉ giúp khi cần.'] },
      { k: 1, id: 'hoi-ban', type: 'hoi', t: 'Hỏi về con · ở nhà con chào ai?', p: 3, vai: 'mau', lead: true, img: CLS, pairs: HOI_BAN.slice(0, 1),
        con: 'Đôi bạn hỏi nhau: con chào ai buổi sáng? Trả lời bằng câu của truyện.', note: ['Cô hỏi mẫu 1 bạn (🔊 Hỏi, 👀 Đáp mẫu), rồi các đôi hỏi nhau. Bạn nhỏ trả lời một từ cũng được ("Mommy!").'] },

      { k: 2, id: 'the-en', type: 'flash', t: 'Thẻ tranh · từ mới', p: 3, vai: 'mau', lang: 'en', mode: 'ts', cards: cards(W, ['see you', 'tomorrow', 'all', 'daddy', 'puppy', 'good night']),
        con: 'Nghe 2 lần, nhắc theo.', note: ['Từ mới: cô đọc trước (T-S).'] },
      { k: 2, id: 'truyen-en', type: 'book', t: 'Truyện · Bông\'s Day (phần 4–5)', p: 4, vai: 'mau', lang: 'en', title: 'Bông\'s Day', title_zh: 'Bông的一天', pages: scenes(u, [4, 5]),
        con: 'Nghe, trả lời bằng một từ hoặc chỉ tranh.', hoi: ['"Who is it?" – Daddy! / Puppy!', '"Good morning or good night?" – con chọn.'], note: ['Kể lượt tiếng Anh. Mỗi trang hỏi một câu, chờ 3 giây, cô nói lại cả câu.'] },
      { k: 2, id: 'chuyen-1', type: 'move', t: 'Bạn làm cô ra lệnh', p: 1, vai: 'nghe', lead: true, cmds: [CMD.stand, CMD.wave, CMD.stamp, CMD.sit], con: 'Một bạn ra lệnh, cả lớp làm.', note: ['Bạn ra lệnh nhìn danh sách lệnh trên màn.'] },
      { k: 2, id: 'xep-en', type: 'chon', t: 'Nhóm xếp tranh · ngày của Bông', p: 4, vai: 'giup', lead: true, off: true, lang: 'en', xep: true, items: DAY8, cue: 'Nhóm xếp tranh: sáng – trưa – tối!',
        con: 'Nhóm 4 bạn xếp 8 thẻ tranh theo sáng – trưa – tối, rồi lần lượt nói câu của từng tranh.', note: ['Tắt chiếu, mỗi nhóm một bộ thẻ mini. Xong thì cô bấm 🔊 Câu tiếp trên máy để cả lớp kiểm tra thứ tự.'],
        print: [pr('ls', '#/u/1/mini', 'Thẻ mini')] },
      { k: 2, id: 'doi-en', type: 'cua', t: 'Đôi bạn · chào đúng người', p: 3, vai: 'nghe', lead: true, off: true, lang: 'en', items: DOOR2, nodoor: true, cue: 'Bạn giơ thẻ, bạn chào!',
        con: 'Một bạn giơ thẻ mini, bạn kia chào đúng người; đổi vai.', note: ['Tắt chiếu. Cô đi vòng nghe; máy cô có câu mẫu nếu đôi nào cần.'] },

      { k: 3, id: 'nhac', type: 'song', t: 'Vận động · Vỗ tay thật vui', p: 3, vai: 'mau', songs: NHAC.vui, moves: ['👏 Clap your hands · 拍拍手', '🦶 Stamp your feet · 跺跺脚'], con: 'Làm theo video.', note: ['Cả lớp đứng dậy theo video.'] },
      { k: 3, id: 'says', type: 'says', t: 'Leo says · bạn làm Leo', p: 5, vai: 'nghe', lead: true, off: true, lua: true, cmds: [CMD.stand, CMD.sit, CMD.look, CMD.listen, CMD.wave, CMD.clap, CMD.stamp, CMD.jump], cue: 'Leo says… Xiaomei说…',
        rules: ['Lượt 1–3 cô làm Leo / Xiaomei.', 'Từ lượt 4 các bạn lớn thay nhau làm Leo, Xiaomei.'], con: 'Bạn làm Leo / Xiaomei ra lệnh, có lệnh lừa.', note: ['Tắt chiếu; bạn ra lệnh nhìn thẻ lệnh in hoặc máy cô.'] },

      { k: 4, id: 'the-zh', type: 'flash', t: '图卡 · từ mới', p: 3, vai: 'mau', lang: 'zh', mode: 'ts', cards: cards(W, ['see you', 'tomorrow', 'all', 'daddy', 'puppy', 'good night']),
        con: 'Nghe 2 lần, nhắc theo.', note: ['明天见 (míngtiān jiàn), 晚安 (wǎn\'ān): tay vẽ thanh trên không.'] },
      { k: 4, id: 'truyen-zh', type: 'book', t: '故事 · Bông的一天 (phần 4–5)', p: 4, vai: 'mau', lang: 'zh', title: 'Bông\'s Day', title_zh: 'Bông的一天', pages: scenes(u, [4, 5]),
        con: 'Nghe, trả lời bằng một từ.', hoi: ['"这是谁？" – 爸爸！/ 小狗！'], note: ['Lượt tiếng Trung, cùng tranh.'] },
      { k: 4, id: 'cau', type: 'cau', t: 'Cầu nối · Leo và Xiaomei', p: 3, vai: 'giup',
        pairs: [{ ...L('Goodbye, all! See you tomorrow!', '大家再见！明天见！', 'Dàjiā zàijiàn! Míngtiān jiàn!'), img: W.tomorrow.img, gk: 'Khác: tomorrow ở cuối câu, 明天 ở đầu câu.' },
          { ...L('Good night, puppy!', '小狗，晚安！', 'Xiǎogǒu, wǎn\'ān!'), img: W['good night'].img, gk: 'Khác: tiếng Trung gọi 小狗 trước rồi mới 晚安.' }],
        con: 'Các bạn lớn tìm chỗ khác nhau và giải thích cho bạn nhỏ.', note: ['Hỏi: "明天 ở đầu hay cuối?" – con giơ tay trái (đầu) hoặc phải (cuối). Mời một bạn lớn giải thích.'] },
      { k: 4, id: 'chuyen-2', type: 'move', t: '站起来！', p: 1, vai: 'nghe', lead: true, cmds: [CMD.stand, CMD.clap, CMD.jump, CMD.sit], con: 'Một bạn ra lệnh tiếng Trung.', note: ['Chuyển tiếp 1 phút.'] },
      { k: 4, id: 'xep-zh', type: 'chon', t: '排一排 · nhóm xếp tranh', p: 3, vai: 'nghe', lead: true, off: true, lang: 'zh', xep: true, items: DAY8, cue: '排一排！',
        con: 'Nhóm xếp lại tranh, nói câu tiếng Trung từng tranh.', note: ['Tắt chiếu; như khối tiếng Anh.'] },
      { k: 4, id: 'doi-zh', type: 'cua', t: 'Đôi bạn · 中文', p: 3, vai: 'nghe', lead: true, off: true, lang: 'zh', items: DOOR2, nodoor: true, cue: '一个举卡，一个问好！',
        con: 'Đôi bạn chào đúng người bằng tiếng Trung.', note: ['Như khối tiếng Anh.'] },

      { k: 5, id: 'nghi', type: 'nghi', t: 'Nghỉ giải lao', p: 4, vai: 'mau', img: CLS, list: NGHI, con: 'Uống nước, đi vệ sinh.', note: ['Đồng hồ 4 phút.'] },
      { k: 5, id: 'lam', type: 'lam', t: 'Làm tay · Rối que nhân vật', p: 6, vai: 'giup', off: true, img: ch.bong.img, ten: 'Rối que Bông\'s Day',
        mat: 'Trang rối que in sẵn, bút sáp, kéo, que kem, keo', steps: ['Mỗi đôi tô 2 rối (Bông, mẹ, bố, cô, Anna, Puppy).', 'Bạn lớn cắt, bạn nhỏ dán que.', 'Cầm rối chào bạn: "Hello, ___!" – bạn cầm rối khác đáp lại.', 'Giữ rối ở lớp cho buổi 3 diễn truyện.'],
        line: L('Hello, puppy!', '小狗，你好！', 'Xiǎogǒu, nǐ hǎo!'), con: 'Làm rối, cầm rối chào bạn.', note: ['Tắt chiếu.'],
        print: [pr('ls', '#/u/1/puppets', 'Rối que Unit 1')] },

      ngheChi('nghe-chi', 6, 8, bbPages(bb, 0, 11, cover), 'giup', 'Chỉ theo cả quyển; trang 1–7 các con đọc to cùng giọng máy, trang 8–11 (mới) nghe và chỉ.',
        ['Bạn lớn chỉ chữ cho bạn nhỏ nhìn.']),
      { k: 6, id: 'pdn', type: 'cau', t: 'Phiên dịch nhí · đội thi', p: 5, vai: 'nghe', lead: true, off: true, pdn: true, game: true, cue: 'Leo nói gì? Nói cho Xiaomei!',
        pairs: [{ ...L('Hello, daddy!', '爸爸，你好！', 'Bàba, nǐ hǎo!'), img: W.daddy.img }, { ...L('Goodbye, kitten!', '小猫，再见！', 'Xiǎomāo, zàijiàn!'), img: W.kitten.img },
          { ...L('Hello, everyone!', '大家好！', 'Dàjiā hǎo!'), img: W.everyone.img }, { ...L('Good night, puppy!', '小狗，晚安！', 'Xiǎogǒu, wǎn\'ān!'), img: W['good night'].img }],
        con: 'Một bạn cầm rối Leo nói câu tiếng Anh; đội kia bàn 5 giây rồi nói cho rối Xiaomei.', note: ['Tắt chiếu. Bạn cầm rối Leo đọc câu trên máy cô; cô bấm 👀 để kiểm tra, đúng được sao.'] },
      { k: 6, id: 've-ls', type: 've', t: 'Vè · hát đối đáp', p: 3, vai: 'nghe', lead: true, lines: VE_DAU.concat(VE_CUOI), img: BB + 'p6.webp', con: 'Nửa lớp hát dòng lẻ, nửa lớp hát dòng chẵn; bạn lớn bắt nhịp.', note: ['Cô chỉ bấm 🥁 Nhịp.'] },
      { k: 6, id: 'bb-tim', type: 'book', t: 'Big book · Puppy trốn ở đâu?', p: 3, vai: 'giup', lang: 'en', title: bb.title, title_zh: bb.title_zh, pages: withQ(bbPages(bb, 7, 11)),
        con: 'Lên chỉ Puppy ở trang mới, nói câu của trang.', hoi: ['❓ Where is Puppy?'], note: ['Trang 8–11.'] },

      tong(2, [L('See you tomorrow!', '明天见！', 'Míngtiān jiàn!'), L('Hello, daddy!', '爸爸，你好！', 'Bàba, nǐ hǎo!'), L('Hello, puppy!', '小狗，你好！', 'Xiǎogǒu, nǐ hǎo!'), L('Good night, puppy!', '小狗，晚安！', 'Xiǎogǒu, wǎn\'ān!')], [7, 8, 9], 'nghe'),
      veCuoi('nghe', false),
      { k: 7, id: 'du', type: 'hoi', t: 'Còn thời gian · Hỏi về con', p: 3, du: true, vai: 'giup', img: CLS, pairs: HOI_BAN.slice(1), con: 'Đôi bạn hỏi: con nói good night với ai?', note: ['Màn dự phòng.'] },
    ] };

  const ROLES5 = ['bong', 'me', 'co', 'anna', 'bo'].map(k => ch[k]);
  const FIRST = [
    { who: 'bong', ...L('Hello, teacher!', '老师，你好！', 'Lǎoshī, nǐ hǎo!'), img: W.teacher.img },
    { who: 'co', ...L('Hello, Bông!', 'Bông，你好！', 'Bông, nǐ hǎo!'), img: W.teacher.img },
    { who: 'bong', ...L('Hello, friends!', '朋友们，你们好！', 'Péngyoumen, nǐmen hǎo!'), img: W.friend.img },
    { who: 'leo', ...L('Hello, Bông!', 'Bông，你好！', 'Bông, nǐ hǎo!'), img: W.friend.img },
    { who: 'bong', ...L('Goodbye, teacher!', '老师，再见！', 'Lǎoshī, zàijiàn!'), img: W.goodbye.img },
    { who: 'lop', ...L('See you tomorrow!', '明天见！', 'Míngtiān jiàn!'), img: W.tomorrow.img },
  ];
  const b3 = { t: 'Buổi 3 · Unit 1 Greeting · Practice + Produce', vai: 'nghe', days: [7, 8, 9], next: [10, 11],
    about: 'Các con dẫn gần cả buổi: nhóm tập và diễn với rối, phỏng vấn nhau, sân khấu nhí; cô nghe và chấm. Chỉ chữ 大 小 là mới, cô làm mẫu.',
    KHOI, MAN: [
      { k: 1, id: 'chao', type: 'chao', t: 'Con chào cô trước', p: 1, vai: 'nghe', lead: true, img: CLS, co: CO, lines: [L('Good morning, teacher!', '老师，早上好！', 'Lǎoshī, zǎoshang hǎo!'), L('Hello, everyone!', '大家好！', 'Dàjiā hǎo!')],
        con: 'Con chào cô và chào cả lớp.', note: ['Cô đứng ở cửa, chờ con chào trước.'] },
      { k: 1, id: 've-dau', type: 've', t: 'Vè chào đầu buổi · bạn bắt nhịp', p: 3, vai: 'nghe', lead: true, lines: VE_DAU, img: BB + 'p7.webp', con: 'Bạn bắt nhịp, cả lớp hát cả hai tiếng.', note: ['Không đọc mẫu, chỉ bấm 🥁 Nhịp.'] },
      { k: 1, id: 'phong-van', type: 'hoi', t: 'Phỏng vấn bạn', p: 4, vai: 'nghe', lead: true, off: true, img: CLS, pairs: [{ q: L("What's your name?", '你叫什么名字呀？', 'Nǐ jiào shénme míngzi ya?'), a: L("An, An, that's my name!", '我叫An，An呀！', 'Wǒ jiào An, An ya!') }, ...HOI_BAN],
        cue: 'Đi tìm 3 bạn, hỏi tên và hỏi: Who do you say good night to?', con: 'Con đi quanh lớp phỏng vấn 3 bạn (tên, con chào ai buổi sáng, con nói good night với ai).',
        note: ['Tắt chiếu. Bạn nhỏ đi cùng bạn lớn. Cô nghe, ghi lại con nào tự hỏi được.'] },
      { k: 1, id: 'chuyen-0', type: 'move', t: 'Về chỗ', p: 1, vai: 'nghe', lead: true, cmds: [CMD.sit, CMD.look, CMD.listen], con: 'Một bạn gọi cả lớp về chỗ.', note: ['Bạn lớn nói "Sit down, please. Look! Listen!".'] },

      { k: 2, id: 'the-en', type: 'flash', t: 'Thẻ tranh · con nói trước', p: 2, vai: 'nghe', lead: true, lang: 'en', mode: 'sts', cards: cards(W, ['good morning', 'hello', 'goodbye', 'mommy', 'kitten', 'teacher', 'friend', 'daddy', 'puppy', 'good night']),
        con: 'Thẻ hiện, con nói trước, máy nói sau.', note: ['Chế độ "Con trước": chờ 3 giây cho con nói. Lật nhanh.'] },
      { k: 2, id: 'tap-nhom', type: 'dien', t: 'Nhóm tập diễn · Bông\'s Day', p: 5, vai: 'nghe', lead: true, off: true, lang: 'en', roles: ROLES5, hide: true, img: CLS,
        lines: st.filter(s => ['bong', 'me', 'co', 'anna', 'bo'].includes(s.who)), cue: 'Nhóm tập diễn với rối!',
        con: 'Nhóm 5 bạn chia vai, cầm rối que, tự tập lời của vai mình; bạn lớn làm "đạo diễn".', note: ['Tắt chiếu. Cô đi vòng nghe từng nhóm, chỉ giúp khi cả nhóm dừng; máy cô có lời từng vai.'] },
      { k: 2, id: 'dien-en', type: 'dien', t: 'Diễn trước lớp · Bông\'s Day', p: 4, vai: 'nghe', lead: true, lang: 'en', roles: ROLES5, hide: true, img: CLS,
        lines: st.filter(s => ['bong', 'me', 'co', 'anna', 'bo'].includes(s.who)),
        con: '1–2 nhóm diễn trước lớp, màn hiện tranh làm phông; khán giả vẫy tay đáp.', note: ['Lời đang che: nhóm tự nói, cô bấm 🙉 chỉ khi nhóm dừng quá 3 giây.'] },
      { k: 2, id: 'san-khau', type: 'chao', t: 'Sân khấu nhí', p: 3, vai: 'nghe', lead: true, img: '../seedling/tai-nguyen/trang/sk_nha_hat.webp', lines: [L('Hello, everyone!', '大家好！', 'Dàjiā hǎo!'), L('See you tomorrow!', '明天见！', 'Míngtiān jiàn!')],
        con: 'Từng con lên chào cả lớp, nói tên, hẹn ngày mai; bạn lớn nói thêm "Good night, ___!".', note: ['Khán giả vẫy tay đáp "Hello, ___!". Ghi lại con nào cần nhắc để báo ba mẹ.'] },

      { k: 3, id: 'nhac', type: 'song', t: 'Vận động · Đi trong rừng', p: 3, vai: 'mau', songs: NHAC.rung, freeze: true, moves: ['🚶 walk', '🦶 stomp', '🐸 jump', '🧊 Đứng hình khi nhạc dừng'], con: 'Làm theo video, đứng hình khi nhạc dừng.', note: ['Bấm 🧊 bất kỳ lúc nào.'] },
      { k: 3, id: 'says', type: 'says', t: 'Con làm Leo / Xiaomei', p: 5, vai: 'nghe', lead: true, off: true, lua: true, cmds: [CMD.stand, CMD.sit, CMD.look, CMD.listen, CMD.wave, CMD.clap, CMD.stamp, CMD.jump], cue: 'Leo says… Xiaomei说…',
        rules: ['Các bạn thay nhau làm Leo (tiếng Anh) hoặc Xiaomei (tiếng Trung).', 'Bạn bị lừa thì lên làm người ra lệnh tiếp.'], con: 'Con ra lệnh, cả lớp làm.', note: ['Tắt chiếu.'] },

      { k: 4, id: 'the-zh', type: 'flash', t: '图卡 · con nói trước', p: 2, vai: 'nghe', lead: true, lang: 'zh', mode: 'sts', cards: cards(W, ['good morning', 'hello', 'goodbye', 'mommy', 'kitten', 'teacher', 'friend', 'daddy', 'puppy', 'good night']),
        con: 'Con nói trước bằng tiếng Trung.', note: ['Như khối tiếng Anh.'] },
      { k: 4, id: 'chu', type: 'chu', t: 'Chữ mới · 大 小', p: 3, vai: 'mau', cols: [
          { h: 'Dang tay', big: '大', zh: true, small: 'dà · 大家', img: W.everyone.img },
          { h: 'Chụm ngón tay', big: '小', zh: true, small: 'xiǎo · 小狗 小猫', img: W.puppy.img }],
        con: 'Thấy 大 thì dang tay, thấy 小 thì chụm ngón tay; bạn lớn tìm chữ 大 小 trong big book.', note: ['Nội dung mới: cô làm mẫu. Chỉ nhận mặt chữ.'] },
      { k: 4, id: 'kich-zh', type: 'dien', t: '小剧 · First Day (nhóm)', p: 5, vai: 'nghe', lead: true, off: true, lang: 'zh', img: CLS, roles: [ch.bong, ch.co, ch.xiaomei, ch.lop], hide: true,
        lines: FIRST.map(x => x.who === 'leo' ? { ...x, who: 'xiaomei' } : x), cue: '小剧：第一天！',
        con: 'Nhóm 4 diễn kịch ngắn First Day bằng tiếng Trung; một bạn làm "cô giáo".', note: ['Tắt chiếu. Đùa: "老师？" – con: "不，朋友！"'] },
      { k: 4, id: 'cau', type: 'cau', t: 'Cầu nối · con giải thích', p: 2, vai: 'nghe', lead: true,
        pairs: [{ ...L('See you tomorrow!', '明天见！', 'Míngtiān jiàn!'), img: W.tomorrow.img, gk: 'tomorrow ở cuối, 明天 ở đầu.' }],
        con: 'Một bạn lớn giải thích chỗ khác nhau cho cả lớp.', note: ['Cô chỉ xác nhận.'] },
      { k: 4, id: 'san-zh', type: 'chao', t: '小舞台 · Sân khấu nhí', p: 3, vai: 'nghe', lead: true, img: '../seedling/tai-nguyen/trang/sk_nha_hat.webp', lines: [L('Hello, everyone!', '大家好！', 'Dàjiā hǎo!'), L('See you tomorrow!', '明天见！', 'Míngtiān jiàn!')],
        con: 'Từng con lên chào bằng tiếng Trung.', note: ['Con đã nói tiếng Anh tốt thì nói cả hai.'] },

      { k: 5, id: 'nghi', type: 'nghi', t: 'Nghỉ giải lao', p: 4, vai: 'nghe', img: CLS, list: NGHI, con: 'Uống nước, đi vệ sinh.', note: ['Đồng hồ 4 phút.'] },
      { k: 5, id: 'lam', type: 'lam', t: 'Đôi bạn đọc big book cho nhau', p: 6, vai: 'nghe', lead: true, off: true, img: BB + 'p6.webp', ten: 'Đọc cho bạn nghe',
        steps: ['Bạn lớn đọc một trang, bạn nhỏ chỉ tranh và nhắc theo.', 'Đổi: bạn nhỏ "đọc" theo tranh, bạn lớn chỉ chữ.', 'Đọc xong cả quyển thì giơ tay báo cô.'], line: L('Goodbye, all! See you tomorrow!', '大家再见！明天见！', 'Dàjiā zàijiàn! Míngtiān jiàn!'),
        con: 'Đôi bạn đọc big book in cho nhau.', note: ['Tắt chiếu. Cô nghe từng đôi, sửa phát âm.'] },

      ngheChi('nghe-chi', 6, 5, bbPages(bb, 0, 11, cover), 'nghe', 'Cả lớp đọc to theo giọng máy, chỉ ngón tay theo chữ.', ['Lượt tiếng Trung: bạn lớn chỉ chữ 大 小 khi gặp.']),
      { k: 6, id: 'kt', type: 'kt', t: 'Phiếu cuối unit · nghe và khoanh', p: 6, vai: 'nghe', off: true, items: u.check.map(c => ({ say: c, opts: c.opts.map(r), ans: c.ans })), cue: 'Nghe và khoanh vào phiếu!',
        con: 'Nghe, khoanh tranh đúng trên phiếu.', note: ['Tắt chiếu. Bấm 🔊 Đọc câu 2 lần, con khoanh A, B hoặc C. Thu phiếu, chấm sau.'],
        print: [pr('ls', '#/u/1/check', 'Phiếu cuối Unit 1')] },
      { k: 6, id: 'pdn', type: 'cau', t: 'Phiên dịch nhí · từng con', p: 5, vai: 'nghe', lead: true, off: true, pdn: true, game: true, cue: 'Leo nói gì? Nói cho Xiaomei!',
        pairs: [{ ...L('Good morning, mommy!', '妈妈，早上好！', 'Māma, zǎoshang hǎo!'), img: W.mommy.img }, { ...L('See you tomorrow, teacher!', '老师，明天见！', 'Lǎoshī, míngtiān jiàn!'), img: W.tomorrow.img },
          { ...L('Hello, puppy!', '小狗，你好！', 'Xiǎogǒu, nǐ hǎo!'), img: W.puppy.img }],
        con: 'Bạn cầm rối Leo nói câu; từng con nói lại cho rối Xiaomei.', note: ['Tắt chiếu. Mỗi câu gọi 2–3 con nói một mình. Bấm 👀 sau khi con nói xong.'] },
      { k: 6, id: 'bb-noi', type: 'book', t: 'Big book · con kể', p: 4, vai: 'nghe', lead: true, lang: 'en', hide: true, title: bb.title, title_zh: bb.title_zh, pages: bbPages(bb, 0, 11, cover),
        con: 'Mỗi trang một bạn nhìn tranh, nói câu của trang trước khi máy đọc.', note: ['Chữ đang che. Bạn nhỏ nói trang dễ, bạn lớn nói trang dài.'] },

      tong(3, [L('Good morning, teacher!', '老师，早上好！', 'Lǎoshī, zǎoshang hǎo!'), L('Hello, everyone!', '大家好！', 'Dàjiā hǎo!'), L('Goodbye, all! See you tomorrow!', '大家再见！明天见！', 'Dàjiā zàijiàn! Míngtiān jiàn!')], [10, 11], 'nghe',
        ['Cô gửi ba mẹ nhận xét Unit 1 (4 đầu ra: giao tiếp, đọc, thuyết trình, viết) qua Zalo.']),
      veCuoi('nghe', true),
      { k: 7, id: 'du', type: 'chon', t: 'Còn thời gian · Ai đây?', p: 3, du: true, vai: 'nghe', lead: true, lang: 'xen', game: true, items: DOOR2.map(x => ({ img: x.img, ...x.hi })), con: 'Một bạn bấm gọi, cả lớp chỉ đúng người.', note: ['Màn dự phòng.'] },
    ] };
  return { ten: 'Little Seed', sau: 'Unit 2 (buổi 4–7): làm sau khi chị duyệt Unit 1', buoi: { 1: b1, 2: b2, 3: b3 } };
}

/* =====================================================================
   SEEDLING 48 · tuần 1–3: Unit 1 Greeting (Good Morning, Mrs Lan!) + Unit 4 Body (The Body Show) · buổi 1–3, ngày web 1–9
   Lớp 6–8 tuổi, đã có tiếng Anh Pre A1, chưa học Little Seed. 7 khối theo web dạy Seedling 48 (v6):
   [1] khởi động [2] tiếng Anh 20′ [3] vận động 10′ [4] tiếng Trung 21′ [5] chữ và âm 7′ [6] truyện, thủ công / đầu ra [7] vinh danh, việc ở nhà
   ===================================================================== */
function seedling() {
  const u = U(HSD, 1), W = wordsOf(u), ve1 = u.ve[0], ve4 = u.ve[1], bbU1 = u.bb[0], bbU4 = u.bb[1];
  const CO = NV + 'nv_lan_a.webp', CLS = '../seedling/tai-nguyen/canh/u1/w_kids_c.webp';
  const ch = Object.fromEntries(u.chars.map(c => [c.key, { k: c.key, ten: c.name, img: r(c.img) }]));
  const K = (a, b, c, d, e, f) => [
    { n: 1, t: 'Khởi động', tu: 0, den: a }, { n: 2, t: 'Khối tiếng Anh', tu: a, den: b }, { n: 3, t: 'Vận động', tu: b, den: c },
    { n: 4, t: 'Khối tiếng Trung', tu: c, den: d }, { n: 5, t: 'Chữ và âm', tu: d, den: e }, { n: 6, t: f, tu: e, den: 85 }, { n: 7, t: 'Vinh danh, việc ở nhà', tu: 85, den: 90 }];
  const VE_DAU = veLines(ve1, [0, 1, 2, 3], ['👋', '👏', '🤲', '🙋']), VE_CUOI = veLines(ve1, [4, 5], ['👋', '🎒']);
  const VE_BODY = veLines(ve4, [0, 1, 2, 3], ['🙆', '👏', '🦶', '🦶']);
  // Nguyên tắc 12/11 (lớp 1–5 học chung): vai cô ghi theo màn; nội dung mới (U1 buổi 1, U4 buổi 2, Body phần 4 buổi 3) cô làm mẫu;
  // phần đã học các con dẫn; đôi bạn lớn – bạn nhỏ cố định cả unit; tắt chiếu khi chơi bằng thẻ in, rối, người giấy.
  const veCuoi = (vai, lead) => ({ k: 7, id: 've-cuoi', type: 've', t: 'Vè chào cuối buổi', p: 2, lines: VE_CUOI, img: '../seedling/tai-nguyen/canh/u1/p3_6.webp', vai, lead,
    con: lead ? 'Một bạn bắt nhịp, cả lớp hát, vẫy tay chào cô.' : 'Hát, vẫy tay chào cô.', note: ['Hát tiếng Anh rồi tiếng Trung, xếp hàng ra cửa.'] });
  const tong = (b, lines, days, chars, vai) => ({ k: 7, id: 'tong', type: 'tong', t: 'Vinh danh · việc ở nhà', p: 3, lines, vai, lead: true,
    home: [`Ngày web ${days.join(', ')}.`, `Sách bài tập buổi ${b}: 2 trang (Anh, Trung), khoảng 10 phút.`, `Tập viết: ${chars}.`],
    con: 'Mỗi đôi bạn chọn một bạn để vinh danh và nói vì sao (bằng tiếng Việt); bạn được vinh danh nói lại 1 câu hay nhất bằng hai tiếng.',
    note: ['Cô chốt 2–3 con được vinh danh, nói cụ thể việc con làm tốt. Cộng sao trên Bảng của cô. Video tốt thả vào thư mục Góc vinh danh.'],
    print: [pr('sd', '#/b/' + b, 'Sách bài tập buổi ' + b)] });
  const ngheChi = (id, k, p, b, pages, vai, con, note) => ({ k, id, type: 'book', t: 'Nghe – chỉ sách · ' + b.title, p, off: true, vai, lang: 'en',
    title: b.title, title_zh: b.title_zh || b.title, pages, con, cue: 'Mở big book của đôi mình, ngón tay sẵn sàng!',
    note: ['Mỗi đôi bạn lớn – bạn nhỏ một bản big book in. Bấm ▶ Đọc cả lượt: máy đọc từng trang, các con lật trang, chỉ ngón tay theo chữ.', 'Hết lượt tiếng Anh, bấm đổi 中文 và ▶ Đọc cả lượt tiếng Trung (không trộn hai tiếng).', ...note],
    print: [pr('sd', '#/u/1/bigbook', 'Big book in (mỗi đôi 1 bản)')] });
  const TEN = { q: L("What's your name?", '你叫什么名字呀？', 'Nǐ jiào shénme míngzi ya?'), a: L("Hello! I'm An.", '你好！我是An。', 'Nǐ hǎo! Wǒ shì An.') };
  const HOI_U1 = { q: L('Who do you say good morning to at school?', '在学校你跟谁说早上好？', 'Zài xuéxiào nǐ gēn shéi shuō zǎoshang hǎo?'), a: L('Good morning, Mrs Lan!', 'Lan老师，早上好！', 'Lan lǎoshī, zǎoshang hǎo!'), img: W['Mrs Lan'].img };
  const HOI_U4 = [
    { q: L('Is your hair long?', '你的头发长吗？', 'Nǐ de tóufa cháng ma?'), a: L("I've got long black hair.", '我的头发很长，是黑色的。', 'Wǒ de tóufa hěn cháng, shì hēisè de.'), img: W.hair.img },
    { q: L('How many fingers?', '几个手指？', 'Jǐ ge shǒuzhǐ?'), a: L('Five fingers!', '五个手指！', 'Wǔ ge shǒuzhǐ!'), img: W.finger.img },
  ];
  const hi = (img, en, zh, py, bye) => ({ img, hi: L(en, zh, py), bye: bye ? L(...bye) : null });
  const GREET = [
    hi(W['Mrs Lan'].img, 'Good morning, Mrs Lan!', 'Lan老师，早上好！', 'Lan lǎoshī, zǎoshang hǎo!', ['Goodbye, Mrs Lan!', 'Lan老师再见！', 'Lan lǎoshī zàijiàn!']),
    hi(ch.ong.img, 'Hello, Grandpa!', '爷爷，您好！', 'Yéye, nín hǎo!', ['Goodbye, Grandpa!', '爷爷再见！', 'Yéye zàijiàn!']),
    hi(W['class · kids'].img, 'Good morning, class!', '小朋友们，早上好！', 'Xiǎopéngyǒumen, zǎoshang hǎo!', ['Goodbye, class! See you tomorrow!', '小朋友们，再见！明天见！', 'Xiǎopéngyǒumen, zàijiàn! Míngtiān jiàn!']),
    hi(ch.bo_leo.img, 'Hello, kids!', '小朋友们，你们好！', 'Xiǎopéngyǒumen, nǐmen hǎo!'),
    hi(ch.leo.img, 'Sorry, Leo!', '对不起，Leo！', 'Duìbuqǐ, Leo!'),
  ];
  const BODY = ['body', 'hair', 'arm', 'leg', 'finger', 'toe', 'shoulder', 'knee'];
  const touch = (k, en, zh, py) => ({ ...L(en, zh, py), img: W[k].img });
  const TOUCH = [CMD.touchHead, touch('shoulder', 'Touch your shoulders!', '摸摸肩膀！', 'Mōmō jiānbǎng!'), touch('knee', 'Touch your knees!', '摸摸膝盖！', 'Mōmō xīgài!'),
    touch('arm', 'Touch your arms!', '摸摸胳膊！', 'Mōmō gēbo!'), touch('open your mouth', 'Open your mouth!', '张大口！', 'Zhāng dà kǒu!'), CMD.clap, CMD.stamp];
  const S1 = scenes(u, [1, 2, 3]), S4 = scenes(u, [4, 5, 6]), S4b = scenes(u, [7]);
  const book = (o) => ({ type: 'book', ...o });
  const W1 = ['good morning', 'Mrs Lan', 'Hello, Grandpa!', 'class · kids', 'Hello, kids!', 'one man · two men', 'write', 'sorry', 'See you tomorrow!'];
  const W4 = ['body', 'hair', 'long', 'town', 'The man is very tall.', 'arm', 'leg', 'finger', 'toe', 'shoulder'];

  const b1 = { t: 'Buổi 1 · Unit 1 Greeting · Introduce', vai: 'mau', days: [1, 2, 3], next: [4, 5, 6],
    about: 'Good Morning, Mrs Lan! phần 1–3, big book "Hello! I\'m ___". Nội dung mới: cô làm mẫu; từ lượt thứ hai các đôi bạn lớn – bạn nhỏ tự làm.',
    KHOI: K(12, 32, 40, 60, 67, 'Truyện, thủ công'), MAN: [
      { k: 1, id: 'chao', type: 'chao', t: 'Chào cửa lớp', p: 1, vai: 'mau', img: '../seedling/tai-nguyen/canh/u1/p2_1.webp', co: CO, lines: [L('Good morning, class!', '小朋友们，早上好！', 'Xiǎopéngyǒumen, zǎoshang hǎo!'), L('Good morning, Mrs Lan!', 'Lan老师，早上好！', 'Lan lǎoshī, zǎoshang hǎo!')],
        con: 'Đáp lại cô: "Good morning, ___!" (tên cô thật).', note: ['Cô chào ở cửa, con đáp bằng tên cô thật. Xếp chỗ theo đôi bạn lớn – bạn nhỏ (lớp 4–5 cạnh lớp 1–2), giữ cả unit.'] },
      { k: 1, id: 've-dau', type: 've', t: 'Vè chào đầu buổi', p: 4, vai: 'mau', lines: VE_DAU, img: '../seedling/tai-nguyen/canh/u1/p2_2.webp', con: 'Hát cả 4 dòng (đã nghe trên web ngày 1–3).', note: ['Hát mẫu tiếng Anh với 🥁, con hát theo; đổi sang tiếng Trung. Dòng 4 thay "Leo" bằng tên con.'] },
      { k: 1, id: 'nep', type: 'move', t: 'Nếp lớp · đếm 3–2–1', p: 2, vai: 'mau', cmds: [L('Three, two, one!', '三、二、一！', 'Sān, èr, yī!', { ic: '✋' }), CMD.look, CMD.listen, CMD.sit], con: 'Nghe "Three, two, one!" thì ngồi yên, nhìn cô.', note: ['Nếp lớp 1: cô đếm 3–2–1, con im lặng, tay lên đùi. Tập 3 lần.'] },
      { k: 1, id: 'hoi-ten', type: 'hoi', t: 'Đôi bạn làm quen', p: 3, vai: 'giup', lead: true, off: true, img: CLS, pairs: [TEN], cue: 'Quay sang bạn: What\'s your name?',
        con: 'Đôi bạn hỏi – đáp tên, đổi vai; rồi nói bằng tiếng Trung.', note: ['1′ đầu cô làm mẫu với một bạn lớn (🔊 Hỏi, 👀 Đáp mẫu). Sau đó tắt chiếu, các đôi tự hỏi – đáp; bạn lớn nhắc bạn nhỏ.'] },
      { k: 1, id: 'hoi-web', type: 'chon', t: 'Hỏi lại web · ngày 1–3', p: 2, vai: 'giup', off: true, lang: 'en', game: true, items: cards(W, ['good morning', 'Mrs Lan', 'Hello, Grandpa!', 'class · kids', 'Hello, kids!', 'sorry']), cue: 'Thẻ mini sẵn sàng!',
        con: 'Nghe câu, giơ thẻ mini đúng.', note: ['Tắt chiếu, mỗi đôi một bộ thẻ mini. Máy cô bấm 🎲 Gọi. Ghi lại con nào chưa làm web.'], print: [pr('sd', '#/u/1/mini', 'Thẻ mini')] },

      { k: 2, id: 'the-en', type: 'flash', t: 'Thẻ tranh · phần 1–3', p: 3, vai: 'mau', lang: 'en', mode: 'ts', cards: cards(W, W1),
        con: 'Nghe 2 lần, nhắc theo.', note: ['Thẻ đi kèm truyện vừa kể: chỉ dùng từ của phần 1–3.'] },
      book({ k: 2, id: 'truyen-en', t: 'Truyện · Good Morning, Mrs Lan! (phần 1–3)', p: 6, vai: 'mau', lang: 'en', title: 'Good Morning, Mrs Lan!', title_zh: 'Lan老师，早上好！', pages: S1,
        con: 'Nghe, nhìn tranh, trả lời bằng một từ; bạn lớn đọc thầm theo chữ.', hoi: ['Trang 1: "Who is it?" – Grandpa!', 'Phần 2: "How many men?" – Two!', 'Phần 3: "Oh no! What does Bông say?" – Sorry!'], note: ['Kể cả lượt tiếng Anh. Rối que Bông, cô Lan, ông để diễn tả.'] }),
      { k: 2, id: 'chuyen-1', type: 'move', t: 'Đứng dậy nào', p: 1, vai: 'mau', cmds: [CMD.stand, CMD.wave, CMD.clap, CMD.sit], con: 'Làm theo lệnh.', note: ['Chuyển tiếp 1 phút.'] },
      { k: 2, id: 'cua-en', type: 'cua', t: 'Đôi bạn · chào đúng người', p: 5, vai: 'giup', lead: true, off: true, lang: 'en', items: GREET, game: true, cue: 'Bạn giơ thẻ, bạn chào!',
        rules: ['Lượt 1 cô làm mẫu với flashcard.', 'Từ lượt 2: một bạn giơ thẻ, bạn kia chào đúng người; có dấu ⬅️ thì tạm biệt. Đổi vai.'], con: 'Đôi bạn tự chào đúng người.',
        note: ['Tắt chiếu. Cô đi vòng nghe, gợi bằng tranh trước khi nói hộ; máy cô có câu mẫu (👀).'], print: [pr('sd', '#/u/1/flash', 'Flashcard Unit 1')] },
      { k: 2, id: 'dung-sai', type: 'chon', t: 'Đúng hay sai? · thẻ ✓ ✗', p: 5, vai: 'giup', off: true, lang: 'en', game: true, items: [1, 4, 5, 9, 14, 16].map(i => S1[i]).map(s => ({ img: s.img, en: s.en, zh: s.zh, py: s.py })), cue: 'Đúng giơ ✓, sai giơ ✗!',
        con: 'Cô giơ tranh, đọc câu; con giơ thẻ ✓ hoặc ✗.', note: ['Tắt chiếu, cô cầm tranh in. Thỉnh thoảng đọc sai câu (đổi tên người) để con giơ ✗; mời bạn lớn sửa lại câu đúng.'] },

      { k: 3, id: 'nhac', type: 'song', t: 'Vận động · Bài hát chào', p: 4, vai: 'mau', songs: NHAC.hello, moves: ['👋 Hello · 你好', '👏 Clap'], con: 'Làm theo video.', note: ['Đứng dậy theo video.'] },
      { k: 3, id: 'says', type: 'says', t: 'Leo says / Xiaomei says', p: 4, vai: 'mau', cmds: [CMD.stand, CMD.sit, CMD.look, CMD.listen, CMD.wave, CMD.clap],
        rules: ['Có "Leo says / Xiaomei说" thì làm.', 'Không có thì đứng yên.'], con: 'Nghe lời lớp học, làm động tác.', note: ['Buổi 1 chưa lừa.'] },

      { k: 4, id: 'the-zh', type: 'flash', t: '图卡 · phần 1–3', p: 3, vai: 'mau', lang: 'zh', mode: 'ts', cards: cards(W, W1),
        con: 'Nghe 2 lần, nhắc theo.', note: ['您好 (nín): chào người lớn – cô cúi đầu khi nói.'] },
      book({ k: 4, id: 'truyen-zh', t: '故事 · Lan老师，早上好！(phần 1–3)', p: 5, vai: 'mau', lang: 'zh', title: 'Good Morning, Mrs Lan!', title_zh: 'Lan老师，早上好！', pages: S1,
        con: 'Nghe lượt tiếng Trung, chỉ người nói.', hoi: ['谁在说话？(Ai đang nói?) – con chỉ rối.'], note: ['Rối Xiaomei kể lượt tiếng Trung.'] }),
      { k: 4, id: 'cau', type: 'cau', t: 'Cầu nối · Leo và Xiaomei', p: 3, vai: 'mau',
        pairs: [{ ...L('Hello, Grandpa!', '爷爷，您好！', 'Yéye, nín hǎo!'), img: ch.ong.img, gk: 'Khác: chào ông dùng 您 (lễ phép), không dùng 你.' },
          { ...L('Good morning, Mrs Lan!', 'Lan老师，早上好！', 'Lan lǎoshī, zǎoshang hǎo!'), img: W['Mrs Lan'].img, gk: 'Khác: Mrs đứng trước tên, 老师 đứng sau tên.' },
          { ...L('Hello, kids!', '小朋友们，你们好！', 'Xiǎopéngyǒumen, nǐmen hǎo!'), img: W['Hello, kids!'].img, gk: 'Khác: chào nhiều người dùng 你们.' }],
        con: 'Tìm chỗ khác nhau; bạn lớn giải thích lại cho bạn nhỏ.', note: ['Rối Leo nói, rối Xiaomei nói. Hỏi tiếng Việt: "Chữ 老师 đứng ở đâu?"'] },
      { k: 4, id: 'hoi-ban', type: 'hoi', t: 'Hỏi về con · ở trường con chào ai?', p: 3, vai: 'giup', lead: true, img: CLS, pairs: [HOI_U1],
        con: 'Đôi bạn hỏi nhau bằng tiếng Trung, trả lời bằng tên cô, thầy thật ở trường.', note: ['Cô hỏi mẫu một bạn (🔊 Hỏi, 👀 Đáp mẫu), rồi các đôi hỏi nhau. Bạn nhỏ trả lời bằng tên là đủ.'] },
      { k: 4, id: 'zuo', type: 'says', t: '做一做 · Xiaomei说', p: 3, vai: 'giup', off: true, who: 'xiaomei', cmds: [CMD.stand, CMD.sit, CMD.look, CMD.listen, CMD.wave], cue: 'Xiaomei说…',
        con: 'Nghe lệnh tiếng Trung, làm động tác.', note: ['Tắt chiếu, cô cầm rối Xiaomei ra lệnh; 2 lượt cuối mời một bạn lớn ra lệnh.'] },
      { k: 4, id: 'cua-zh', type: 'cua', t: 'Đôi bạn · 中文', p: 3, vai: 'giup', lead: true, off: true, lang: 'zh', items: GREET, game: true, cue: '一个举卡，一个问好！',
        con: 'Đôi bạn chào đúng người bằng tiếng Trung.', note: ['Như khối tiếng Anh. Chào ông: 您好.'] },

      { k: 5, id: 'chu', type: 'chu', t: 'Chữ và âm · buổi 1', p: 7, vai: 'mau', cols: [
          { h: 'Thanh 1 (đường bằng) ˉ', big: 'ˉ', small: 'Tay vẽ đường bằng: 他 tā · 妈 mā' },
          { h: 'Âm /s/ 🐍', big: 's', small: 'sss… như con rắn · sorry, see' },
          { h: 'Bảng con · tiếng Anh', words: ['Mrs', 'kid', 'good'] },
          { h: 'Bảng con · tiếng Trung', zh: true, words: ['上', '小'] }],
        con: 'Vẽ thanh trên không, nói âm s, viết lên bảng con.', note: ['3′ thanh và âm, 4′ bảng con: Anh viết 3 từ, Trung tô 2 chữ theo thứ tự nét. Bạn lớn viết thêm 1 từ tự chọn.'] },

      ngheChi('nghe-chi', 6, 7, bbU1, bbPages(bbU1, 0, 7), 'mau', 'Mỗi đôi lật big book in, chỉ ngón tay vào tranh (bạn nhỏ) và chữ (bạn lớn) theo giọng đọc.', []),
      { k: 6, id: 'gioi-thieu', type: 'hoi', t: 'Hello! I\'m ___ · từng con', p: 4, vai: 'giup', lead: true, img: CLS, pairs: [TEN],
        con: 'Từng con đứng dậy nói "Hello! I\'m ___." bằng hai tiếng; bạn lớn nói thêm "Good morning, class!".', note: ['Trang cuối big book. Khán giả vẫy tay đáp "Hello, ___!".'] },
      { k: 6, id: 'lam', type: 'lam', t: 'Thủ công · thẻ tên', p: 7, vai: 'mau', off: true, img: W.write.img, ten: 'Thẻ tên của con', steps: ['Cô nói: "Kids, write your name!"', 'Con viết tên mình lên thẻ; bạn lớn giúp bạn nhỏ.', 'Buổi 2 tô màu, xâu dây.'],
        line: L('Kids, write your name.', '小朋友们，写名字吧。', 'Xiǎopéngyǒumen, xiě míngzi ba.'), con: 'Viết tên mình lên thẻ, vừa làm vừa hỏi tên bạn.', note: ['Tắt chiếu.'], print: [pr('sd', '#/u/1/names', 'Thẻ tên'), pr('sd', '#/u/1/craft', 'Thủ công Unit 1')] },

      tong(1, [L('Good morning, Mrs Lan!', 'Lan老师，早上好！', 'Lan lǎoshī, zǎoshang hǎo!'), L('Hello, Grandpa!', '爷爷，您好！', 'Yéye, nín hǎo!'), L('Sorry, Leo!', '对不起，Leo！', 'Duìbuqǐ, Leo!')], [4, 5, 6], 'Mrs, kid, good · 上, 小', 'giup'),
      veCuoi('mau', false),
      { k: 7, id: 'du', type: 'cua', t: 'Còn thời gian · Chào đúng người', p: 3, du: true, vai: 'giup', lang: 'zh', items: GREET, game: true, con: 'Chào bằng tiếng Trung.', note: ['Màn dự phòng.'] },
    ] };

  const b2 = { t: 'Buổi 2 · Unit 4 Body · Introduce · Unit 1 Repeat', vai: 'giup', days: [4, 5, 6], next: [7, 8, 9],
    about: 'The Body Show phần 1–3 là nội dung mới: cô làm mẫu. Greeting đã học: các con dẫn (bạn làm cô, đôi bạn, nhóm xếp tranh).',
    KHOI: K(8, 28, 38, 58, 65, 'Truyện, thủ công'), MAN: [
      { k: 1, id: 've-dau', type: 've', t: 'Vè chào đầu buổi · bạn bắt nhịp', p: 3, vai: 'nghe', lead: true, lines: VE_DAU, img: '../seedling/tai-nguyen/canh/u1/p2_2.webp', con: 'Một bạn lớn bắt nhịp, cả lớp hát.', note: ['Cô chỉ bấm 🥁 Nhịp.'] },
      { k: 1, id: 'hoi-web', type: 'chon', t: 'Hỏi lại web · bạn làm cô', p: 3, vai: 'nghe', lead: true, off: true, lang: 'en', game: true, items: cards(W, ['body', 'hair', 'long', 'arm', 'leg', 'toe']), cue: 'Bạn làm cô giơ thẻ, cả lớp nói!',
        con: 'Một bạn lớn giơ flashcard ngày web 4–6, cả lớp nói từ và chạm bộ phận trên người.', note: ['Tắt chiếu, dùng flashcard in. Cô đứng sau, ghi lại con nào chưa làm web.'] },
      { k: 1, id: 'nep', type: 'move', t: 'Nếp lớp 2 · Đôi bạn', p: 2, vai: 'giup', lead: true, cmds: [L('Find a friend!', '找朋友！', 'Zhǎo péngyou!', { ic: '🤝' }), L('Hello, friend!', '朋友，你好！', 'Péngyou, nǐ hǎo!', { ic: '👋' }), CMD.sit], con: 'Nghe "Find a friend!" thì tìm bạn cùng đôi, chào nhau.', note: ['Nếp lớp 2. Cô nói lần đầu, lần sau một bạn hô.'] },

      { k: 2, id: 'nhac-u1', type: 'cua', t: 'Nhắc Greeting · đôi bạn chào', p: 4, vai: 'nghe', lead: true, off: true, lang: 'en', items: GREET, game: true, cue: 'Đôi bạn: một bạn đóng vai, một bạn chào!',
        rules: ['Một bạn cầm flashcard đóng vai người trong tranh, bạn kia chào.', 'Đổi vai.'], con: 'Đôi bạn tự chào.', note: ['Tắt chiếu. Cô đi vòng nghe.'] },
      { k: 2, id: 'the-en', type: 'flash', t: 'Thẻ tranh · The Body Show', p: 3, vai: 'mau', lang: 'en', mode: 'ts', cards: cards(W, W4),
        con: 'Nghe, nhắc theo, chạm bộ phận trên người mình.', note: ['Nội dung mới: cô đọc, con nhắc, con chạm vào bộ phận đó.'] },
      book({ k: 2, id: 'truyen-en', t: 'Truyện · The Body Show (phần 1–3)', p: 6, vai: 'mau', lang: 'en', title: 'The Body Show', title_zh: '身体表演', pages: S4,
        con: 'Nghe, làm theo lệnh của người diễn trong truyện.', hoi: ['"Long or short?" – Long!', '"How many fingers?" – Five!'], note: ['Kể lượt tiếng Anh; ở lệnh Touch… cả lớp làm theo.'] }),
      { k: 2, id: 'chuyen-1', type: 'move', t: 'Đứng dậy nào', p: 1, vai: 'mau', cmds: [CMD.stand, CMD.touchHead, CMD.clap, CMD.sit], con: 'Làm theo lệnh.', note: ['Chuyển tiếp.'] },
      { k: 2, id: 'cham-than', type: 'chon', t: 'Chạm cơ thể · thẻ mini', p: 4, vai: 'giup', off: true, lang: 'en', game: true, items: cards(W, BODY), cue: 'Nghe, giơ thẻ, chạm người!',
        con: 'Nghe từ, giơ thẻ mini đúng và chạm bộ phận đó trên người.', note: ['Tắt chiếu, mỗi đôi một bộ thẻ mini. Máy cô bấm 🎲 Gọi.'], print: [pr('sd', '#/u/1/mini', 'Thẻ mini')] },
      { k: 2, id: 'hoi-ban', type: 'hoi', t: 'Hỏi về con · tóc con dài không?', p: 2, vai: 'giup', lead: true, img: W.hair.img, pairs: HOI_U4.slice(0, 1),
        con: 'Đôi bạn hỏi nhau; trả lời long hay short theo tóc thật của mình.', note: ['Cô hỏi mẫu 1 bạn tóc dài và 1 bạn tóc ngắn ("I\'ve got short hair."). Bạn nhỏ trả lời "Long!" / "Short!" là đủ.'] },

      { k: 3, id: 'simon', type: 'says', t: 'Leo says · bộ phận cơ thể', p: 5, vai: 'mau', lua: true, cmds: TOUCH, rules: ['Có "Leo says / Xiaomei说" thì làm.', 'Không có thì đứng yên.'], con: 'Làm theo lệnh chạm cơ thể.', note: ['Lệnh mới: cô ra lệnh. Bật lệnh lừa từ lượt 5.'] },
      { k: 3, id: 've-body', type: 've', t: 'Vè Body Show', p: 5, vai: 'mau', lines: VE_BODY, img: W.body.img, lang: 'en', con: 'Nghe, làm động tác theo từng dòng.', note: ['Vè mới: cô hát mẫu. Chữ hoa là phách mạnh. Dòng 3 gọi tên 2 con.'] },

      { k: 4, id: 'ai-noi', type: 'cau', t: 'Phiên dịch nhí · Greeting (đội thi)', p: 3, vai: 'nghe', lead: true, off: true, pdn: true, game: true, cue: 'Leo nói gì? Nói cho Xiaomei!',
        pairs: [{ ...L('Good morning, class!', '小朋友们，早上好！', 'Xiǎopéngyǒumen, zǎoshang hǎo!'), img: ch.lan.img }, { ...L('Hello, kids!', '小朋友们，你们好！', 'Xiǎopéngyǒumen, nǐmen hǎo!'), img: ch.bo_leo.img }],
        con: 'Bạn cầm rối Leo nói câu tiếng Anh; đội kia bàn 5 giây rồi nói cho rối Xiaomei.', note: ['Tắt chiếu. Bạn cầm rối đọc câu trên máy cô; cô bấm 👀 kiểm tra, đúng được sao.'] },
      { k: 4, id: 'the-zh', type: 'flash', t: '图卡 · 身体', p: 3, vai: 'mau', lang: 'zh', mode: 'ts', cards: cards(W, W4), con: 'Nghe, nhắc, chạm bộ phận.', note: ['Như khối tiếng Anh.'] },
      book({ k: 4, id: 'truyen-zh', t: '故事 · 身体表演 (phần 1–3)', p: 5, vai: 'mau', lang: 'zh', title: 'The Body Show', title_zh: '身体表演', pages: S4, con: 'Nghe lượt tiếng Trung, làm theo lệnh.', note: ['Xiaomei kể.'] }),
      { k: 4, id: 'cau', type: 'cau', t: 'Cầu nối', p: 3, vai: 'mau',
        pairs: [{ ...L('Touch your knees!', '摸摸膝盖！', 'Mōmō xīgài!'), img: W.knee.img, gk: 'Tiếng Trung không cần "your": 摸摸 + bộ phận.' }, { ...L('Five fingers!', '五个手指！', 'Wǔ ge shǒuzhǐ!'), img: W.finger.img, gk: 'Tiếng Trung có 个 giữa số và vật.' }],
        con: 'Tìm chỗ khác nhau.', note: ['Cô hỏi, con tìm; mời bạn lớn nói lại quy tắc.'] },
      { k: 4, id: 'zuo', type: 'says', t: '做一做 · 摸一摸', p: 3, vai: 'giup', off: true, who: 'xiaomei', lua: true, cmds: TOUCH, cue: 'Xiaomei说：摸摸…', con: 'Làm theo lệnh tiếng Trung.', note: ['Tắt chiếu, cô cầm rối Xiaomei.'] },
      { k: 4, id: 'doi-zh', type: 'says', t: 'Đôi bạn · 摸摸___！', p: 3, vai: 'giup', lead: true, off: true, who: 'xiaomei', cmds: TOUCH, cue: '一个说，一个做！',
        con: 'Một bạn ra lệnh "摸摸___！", bạn kia làm; đổi vai.', note: ['Tắt chiếu. Bạn lớn ra lệnh trước, bạn nhỏ làm; rồi đổi.'] },

      { k: 5, id: 'chu', type: 'chu', t: 'Chữ và âm · buổi 2', p: 7, vai: 'mau', cols: [
          { h: 'Thanh 4 (đi xuống) ˋ', big: 'ˋ', small: 'Tay chặt xuống: 再 zài · 见 jiàn' }, { h: 'Âm /a/ 🐜', big: 'a', small: 'a – ant · ôn s' },
          { h: 'Bảng con · tiếng Anh', words: ['arm', 'leg', 'toe'] }, { h: 'Bảng con · tiếng Trung', zh: true, words: ['个', '子'] }],
        con: 'Vẽ thanh, nói âm, viết bảng con.', note: ['Ôn thanh 1 và âm s trước (một bạn lớn dẫn ôn).'] },

      ngheChi('nghe-chi', 6, 7, bbU4, bbPages(bbU4, 0, 7), 'mau', 'Đôi bạn lật big book mới, chỉ theo giọng đọc; gặp bộ phận nào thì chạm vào người mình.', ['Big book mới của Unit 4: lượt đầu chỉ nghe – chỉ.']),
      { k: 6, id: 'ghep-u1', type: 'chon', t: 'Nhóm xếp tranh · Greeting', p: 5, vai: 'nghe', lead: true, off: true, lang: 'en', xep: true, items: S1.filter((_, i) => [1, 2, 7, 9, 11, 13].includes(i)), cue: 'Nhóm xếp tranh theo truyện!',
        con: 'Nhóm 4 bạn xếp thẻ tranh theo truyện, lần lượt nói câu của từng tranh.', note: ['Tắt chiếu, mỗi nhóm một bộ thẻ. Xong thì cô bấm 🔊 Câu tiếp để cả lớp kiểm tra.'] },
      { k: 6, id: 'lam', type: 'lam', t: 'Thủ công · ' + u.craft.name + ' (bước 1)', p: 8, vai: 'giup', off: true, img: W.body.img, ten: u.craft.name, mat: u.craft.mat, steps: u.craft.steps,
        line: L('This is my body.', '这是我的身体。', 'Zhè shì wǒ de shēntǐ.'), con: 'Tô, cắt các bộ phận, nói tên khi làm; bạn lớn cắt chi tiết khó cho bạn nhỏ.', note: ['Tắt chiếu. Buổi 2 làm bước 1–2; buổi 3 ghép ghim và chơi.'], print: [pr('sd', '#/u/1/craft', 'Người giấy cử động')] },

      tong(2, [L('This is my body.', '这是我的身体。', 'Zhè shì wǒ de shēntǐ.'), L('Touch your knees!', '摸摸膝盖！', 'Mōmō xīgài!'), L('Five fingers!', '五个手指！', 'Wǔ ge shǒuzhǐ!')], [7, 8, 9], 'arm, leg, toe · 个, 子', 'nghe'),
      veCuoi('nghe', true),
      { k: 7, id: 'du', type: 'hoi', t: 'Còn thời gian · Hỏi về con', p: 3, du: true, vai: 'giup', img: W.finger.img, pairs: HOI_U4.slice(1), con: 'Đôi bạn hỏi: How many fingers?', note: ['Màn dự phòng.'] },
    ] };

  const DIEN_U1 = S1.filter(s => ['bong', 'lan', 'ong', 'kids', 'leo'].includes(s.who));
  const b3 = { t: 'Buổi 3 · Unit 1 Produce · Unit 4 Practice', vai: 'nghe', days: [7, 8, 9], next: [10, 11],
    about: 'Các con dẫn gần cả buổi: phỏng vấn, ra lệnh, diễn rối, Body Show, chấm 4 đầu ra. Chỉ Body phần 4 là mới: cô làm mẫu.',
    KHOI: K(8, 28, 38, 58, 65, 'Đầu ra (Produce)'), MAN: [
      { k: 1, id: 've-dau', type: 've', t: 'Vè chào đầu buổi · bạn bắt nhịp', p: 3, vai: 'nghe', lead: true, lines: VE_DAU, img: '../seedling/tai-nguyen/canh/u1/p2_2.webp', con: 'Bạn bắt nhịp, cả lớp tự hát cả hai tiếng.', note: ['Không đọc mẫu.'] },
      { k: 1, id: 'phong-van', type: 'hoi', t: 'Phỏng vấn bạn', p: 4, vai: 'nghe', lead: true, off: true, img: CLS, pairs: [TEN, HOI_U1, ...HOI_U4], cue: 'Đi tìm 3 bạn: tên, tóc, ngón tay!',
        con: 'Con đi quanh lớp phỏng vấn 3 bạn (tên, con chào ai ở trường, tóc dài không, mấy ngón tay); bạn lớn hỏi bằng tiếng Trung.', note: ['Tắt chiếu. Bạn nhỏ đi cùng bạn lớn. Cô nghe, ghi lại con nào tự hỏi được.'] },
      { k: 1, id: 'nep', type: 'move', t: 'Nếp lớp 3 · thuyết trình', p: 1, vai: 'nghe', lead: true, cmds: [L('Stand up, please.', '请站起来。', 'Qǐng zhàn qǐlái.', { ic: '🧍' }), L('Look at me!', '看我！', 'Kàn wǒ!', { ic: '👀' }), L('Well done!', '真棒！', 'Zhēn bàng!', { ic: '👏' })],
        con: 'Một bạn lớn hô, cả lớp về chỗ; nhắc cách đứng nói trước lớp.', note: ['Nếp lớp 3: đứng thẳng, nhìn bạn, nói to; khán giả vỗ tay.'] },

      book({ k: 2, id: 'truyen-en', t: 'Truyện · The Body Show (phần 4)', p: 4, vai: 'mau', lang: 'en', title: 'The Body Show', title_zh: '身体表演', pages: S4b, con: 'Nghe, làm động tác, nói câu nhân vật.', hoi: ['"What does Bông say?" – Sorry, Grandpa!'], note: ['Nội dung mới: cô kể mẫu phần 4.'] }),
      { k: 2, id: 'the-up', type: 'flash', t: 'Thẻ úp đoán', p: 3, vai: 'nghe', lead: true, lang: 'en', mode: 'sts', cards: cards(W, ['clap your hands', 'stamp your feet', 'it\'s fun', 'arm', 'leg', 'knee', 'shoulder', 'toe']), con: 'Đoán thẻ, nói trước khi máy nói.', note: ['Chế độ "Con trước": thẻ hiện "?" 3 giây, con đoán theo tranh.'] },
      { k: 2, id: 'ra-lenh', type: 'says', t: 'Con ra lệnh · Touch your …!', p: 4, vai: 'nghe', lead: true, off: true, who: 'leo', cmds: TOUCH, cue: 'Leo says… Touch your …!', con: 'Các bạn thay nhau làm Leo ra lệnh, cả lớp làm.', note: ['Tắt chiếu. Bạn bị lừa thì lên ra lệnh tiếp.'] },
      { k: 2, id: 'doi-ban', type: 'cua', t: 'Đôi bạn Greeting · tự nói', p: 4, vai: 'nghe', lead: true, off: true, lang: 'en', items: GREET, game: true, cue: 'Đôi bạn tự nói, không có mẫu!', con: 'Đôi bạn tự chào – tạm biệt, không có mẫu.', note: ['Tắt chiếu. Cô chỉ nghe.'] },
      { k: 2, id: 'tap-nhom', type: 'dien', t: 'Nhóm tập diễn rối · Mrs Lan', p: 5, vai: 'nghe', lead: true, off: true, lang: 'en', hide: true, img: CLS, roles: ['bong', 'lan', 'ong', 'kids', 'leo'].map(k => ch[k]), lines: DIEN_U1, cue: 'Nhóm tập diễn rối!',
        con: 'Nhóm 3–5 bạn chia vai, cầm rối que, tự tập lời của vai mình; bạn lớn làm "đạo diễn".', note: ['Tắt chiếu. Cô đi vòng nghe; máy cô có lời từng vai.'] },

      { k: 3, id: 've-body', type: 've', t: 'Vè Body Show · bạn bắt nhịp', p: 4, vai: 'nghe', lead: true, lines: VE_BODY, img: W.body.img, lang: 'en', con: 'Bạn bắt nhịp, cả lớp tự hát, làm động tác.', note: ['Hát cả hai tiếng.'] },
      { k: 3, id: 'rong', type: 'move', t: 'Rồng lửa theo đội', p: 6, vai: 'nghe', lead: true, off: true, cmds: [CMD.stamp, CMD.clap, CMD.jump, CMD.touchHead], cue: 'Rồng lửa! Đầu rồng ra lệnh!', con: 'Đội xếp hàng làm rồng; bạn đầu rồng ra lệnh, cả rồng làm.', note: ['Tắt chiếu. Đội Cún, đội Mèo xếp hàng tay đặt vai bạn; đổi đầu rồng mỗi lượt.'] },

      book({ k: 4, id: 'truyen-zh', t: '故事 · 身体表演 (phần 4)', p: 4, vai: 'mau', lang: 'zh', title: 'The Body Show', title_zh: '身体表演', pages: S4b, con: 'Nghe, nói câu nhân vật.', note: ['Xiaomei kể phần 4.'] }),
      { k: 4, id: 'memory', type: 'flash', t: 'Memory · tranh – chữ Hán', p: 5, vai: 'nghe', lead: true, off: true, lang: 'zh', mode: 'sts', cards: cards(W, ['clap your hands', 'stamp your feet', 'fun', 'mouth', 'arm', 'leg']), cue: 'Memory! Lật thẻ, nói tiếng Trung!',
        con: 'Nhóm chơi Memory bằng thẻ mini tranh – chữ; lật được cặp thì nói tiếng Trung.', note: ['Tắt chiếu. Bạn lớn đọc chữ Hán cho bạn nhỏ.'], print: [pr('sd', '#/u/1/mini', 'Thẻ mini')] },
      { k: 4, id: 'pdn', type: 'cau', t: 'Phiên dịch nhí · từng con', p: 6, vai: 'nghe', lead: true, off: true, pdn: true, game: true, cue: 'Leo nói gì? Nói cho Xiaomei!',
        pairs: [{ ...L('Good morning, Mrs Lan!', 'Lan老师，早上好！', 'Lan lǎoshī, zǎoshang hǎo!'), img: W['Mrs Lan'].img }, { ...L('Sorry, Leo!', '对不起，Leo！', 'Duìbuqǐ, Leo!'), img: ch.leo.img },
          { ...L('See you tomorrow!', '明天见！', 'Míngtiān jiàn!'), img: W['See you tomorrow!'].img }, { ...L('Clap your hands!', '拍拍手！', 'Pāipāi shǒu!'), img: W['clap your hands'].img },
          { ...L('It\'s fun!', '真好玩！', 'Zhēn hǎowán!'), img: W.fun.img }],
        con: 'Bạn cầm rối Leo nói câu; từng con nói lại cho rối Xiaomei.', note: ['Tắt chiếu. Greeting 3 câu, Body 2 câu. Gọi từng con.'] },
      { k: 4, id: 'xm-lenh', type: 'says', t: 'Con làm Xiaomei', p: 3, vai: 'nghe', lead: true, off: true, who: 'xiaomei', lua: true, cmds: TOUCH, cue: 'Xiaomei说…', con: 'Các bạn thay nhau làm Xiaomei ra lệnh tiếng Trung.', note: ['Tắt chiếu.'] },
      { k: 4, id: 'hoi-ban', type: 'hoi', t: 'Hỏi về con · bằng tiếng Trung', p: 2, vai: 'nghe', lead: true, img: W.hair.img, pairs: HOI_U4, con: 'Đôi bạn hỏi – đáp bằng tiếng Trung về tóc và ngón tay.', note: ['Cô nghe; máy có câu mẫu nếu đôi cần.'] },

      { k: 5, id: 'chu', type: 'chu', t: 'Chữ và âm · đôi bạn ôn', p: 7, vai: 'giup', lead: true, cols: [
          { h: 'Ôn âm', big: 's · a', small: 'sorry · ant' }, { h: 'Ôn thanh', big: 'ˉ ˋ', small: '妈 mā · 再 zài' },
          { h: 'Bảng con · tiếng Anh', words: ['fun', 'clap', 'stamp'] }, { h: 'Bảng con · tiếng Trung', zh: true, words: ['手', '好'] }],
        con: 'Bạn lớn đọc từ, bạn nhỏ viết bảng con; đổi vai với chữ Hán.', note: ['Cô đi vòng sửa thứ tự nét.'] },

      { k: 6, id: 'dien-u1', type: 'dien', t: 'Diễn rối · Good Morning, Mrs Lan!', p: 8, vai: 'nghe', lead: true, lang: 'en', hide: true, img: CLS, roles: ['bong', 'lan', 'ong', 'kids', 'leo'].map(k => ch[k]), lines: DIEN_U1,
        con: 'Nhóm diễn rối trước lớp, tự nói lời nhân vật; màn hiện tranh làm phông.', note: ['Lời che sẵn. Mỗi nhóm diễn 1 lượt tiếng Anh, 1 lượt tiếng Trung (bấm đổi tiếng).', 'Chấm 4 đầu ra Unit 1 (giao tiếp, đọc, thuyết trình, viết), 0–2 điểm mỗi đầu ra, ghi vào Bảng của cô.'] },
      { k: 6, id: 'body-show', type: 'chao', t: 'Body Show nhỏ với người giấy', p: 5, vai: 'nghe', lead: true, img: W.body.img, lines: [L('This is my body.', '这是我的身体。', 'Zhè shì wǒ de shēntǐ.'), L('Touch your knees!', '摸摸膝盖！', 'Mōmō xīgài!')],
        con: 'Từng con cầm người giấy giới thiệu "This is my body", ra một lệnh cho lớp; bạn lớn nói thêm 1 câu về tóc.', note: ['Mỗi con 30 giây, khán giả làm theo lệnh của bạn.'] },
      ngheChi('nghe-chi', 6, 3, bbU4, bbPages(bbU4, 0, 7), 'nghe', 'Cả lớp đọc to theo giọng máy, chỉ ngón tay theo chữ.', []),
      { k: 6, id: 'kt', type: 'kt', t: 'Phiếu cuối unit · nghe và khoanh', p: 4, vai: 'nghe', off: true, items: u.check.map(c => ({ say: c, opts: c.opts.map(r), ans: c.ans })), cue: 'Nghe và khoanh vào phiếu!',
        con: 'Nghe, khoanh tranh đúng.', note: ['Tắt chiếu. Phát phiếu in, đọc mỗi câu 2 lần. Thu phiếu.'], print: [pr('sd', '#/u/1/check', 'Phiếu cuối Unit 1')] },

      tong(3, [L('Sorry, Grandpa!', '对不起，爷爷！', 'Duìbuqǐ, yéye!'), L('It\'s fun!', '真好玩！', 'Zhēn hǎowán!'), L('See you tomorrow!', '明天见！', 'Míngtiān jiàn!')], [10, 11], 'fun, clap, stamp · 手, 好', 'nghe'),
      veCuoi('nghe', true),
      { k: 7, id: 'du', type: 'cau', t: 'Còn thời gian · Phiên dịch nhí', p: 3, du: true, vai: 'nghe', pdn: true, pairs: [{ ...L('Touch your shoulders!', '摸摸肩膀！', 'Mōmō jiānbǎng!'), img: W.shoulder.img }], con: 'Nói cho Xiaomei.', note: ['Màn dự phòng.'] },
    ] };
  return { ten: 'Seedling', sau: 'Unit 2 (buổi 4–7): làm sau khi chị duyệt Unit 1', buoi: { 1: b1, 2: b2, 3: b3 } };
}

module.exports = { NOI, lv: { ls: littleSeed(), sd: seedling() } };
