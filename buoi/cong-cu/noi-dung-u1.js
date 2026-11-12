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
   LITTLE SEED 48 · Unit 1 Greeting (tuần 1–3, buổi 1–3, ngày web 1–9) · lớp 4–5 tuổi, chưa học PreB
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
  const tong = (b, lines, days, extra = []) => ({ k: 7, id: 'tong', type: 'tong', t: 'Hôm nay con nói được', p: 4, lines,
    home: [`Ngày web ${days.join(', ')} (mỗi ngày 10–15 phút, ba mẹ ngồi cạnh).`, `Phiếu tô – dán buổi ${b} (khoảng 10 phút).`, ...extra],
    con: 'Mỗi con nói 1 câu của buổi bằng hai tiếng (cô gợi tranh trước, con nói sau).',
    note: ['Gọi lần lượt từng con: cô giơ tranh, con nói 1 câu tiếng Anh rồi 1 câu tiếng Trung. Con chưa nói được thì cô nói, con nhắc theo.', 'Trao sao cho cả hai đội; cộng sao cá nhân trên Bảng của cô.', 'Dặn ba mẹ qua Zalo: ngày web tiếp theo và phiếu ở nhà.'],
    print: [pr('ls', '#/b/' + b, 'Phiếu tô – dán buổi ' + b)] });
  const veCuoi = { k: 7, id: 've-cuoi', type: 've', t: 'Vè chào cuối buổi', p: 2, lines: VE_CUOI, img: BB + 'p9.webp',
    con: 'Hát cùng cô, vẫy tay, làm động tác đeo cặp.', note: ['Hát tiếng Anh rồi bấm đổi sang tiếng Trung. Đứng dậy, vẫy tay, đeo cặp, xếp hàng ra cửa.'] };

  const b1 = { t: 'Buổi 1 · Unit 1 Greeting · Introduce', vai: 'mau', days: [1, 2, 3], next: [4, 5, 6],
    about: 'Chào và tạm biệt mẹ, mèo, cô, bạn (truyện phần 1–3, big book trang 1–7). Lần đầu học từ: cô làm mẫu, con nghe – chỉ – làm động tác.',
    KHOI, MAN: [
      { k: 1, id: 'chao', type: 'chao', t: 'Chào cả lớp', p: 2, img: CLS, co: CO, lines: [L('Good morning, everyone!', '大家早上好！', 'Dàjiā zǎoshang hǎo!'), L('Hello, everyone!', '大家好！', 'Dàjiā hǎo!')],
        con: 'Vẫy tay đáp; con nào muốn thì nhại "Hello!".', note: ['Đeo lại thẻ tên của buổi 0 cho con.', 'Cô đứng giữa lớp, vẫy thật to, bấm 🔊 câu chào. Không bắt con nói.'] },
      { k: 1, id: 've-dau', type: 've', t: 'Vè chào đầu buổi', p: 4, lines: VE_DAU, img: BB + 'p7.webp',
        con: 'Hát theo dòng 1–2 (đã hát ở buổi 0), nghe và làm động tác dòng 3–4.',
        note: ['Sau 3 ngày web, lớp hát trọn 4 dòng. Bấm 🥁 Nhịp, hát mẫu tiếng Anh 2 lần, con nhại từng dòng.', 'Dòng 4: thay "Leo" bằng tên một con ("An, An, that\'s my name!"), chỉ vào bạn đó.', 'Bấm đổi sang tiếng Trung, hát mẫu, con làm động tác theo. Chơi hát to – hát nhỏ 2 lần.'] },
      { k: 1, id: 'hoi-ten', type: 'hoi', t: 'Vòng hỏi tên', p: 4, img: CLS, game: true,
        pairs: [{ q: L("What's your name?", '你叫什么名字呀？', 'Nǐ jiào shénme míngzi ya?'), a: L("An, An, that's my name!", '我叫An，An呀！', 'Wǒ jiào An, An ya!') }],
        con: 'Nói tên mình khi cô hỏi (một từ là đủ).',
        note: ['Cô hỏi từng con (cầm thẻ tên của con): "What\'s your name?". Con nói tên, cô nói lại cả câu vè: "An, An, that\'s my name!", cả lớp vỗ tay nhắc lại.', 'Con chưa nói: cô chỉ thẻ tên, nói giúp, con gật đầu là được.', 'Đáp mẫu dùng tên An làm ví dụ.'] },

      { k: 2, id: 'the-en', type: 'flash', t: 'Thẻ tranh · Bông\'s Day', p: 3, lang: 'en', mode: 'ts', cards: cards(W, ['good morning', 'hello', 'goodbye', 'mommy', 'kitten', 'teacher', 'everyone', 'friend']),
        con: 'Nhìn tranh, nghe cô đọc 2 lần, nhắc theo cả lớp.', note: ['Chỉ đưa thẻ của truyện vừa học (phần 1–3). Bấm ▶ Cả lượt: mỗi thẻ phóng to, máy đọc 2 lần, con nhắc sau mỗi lần.', 'Cô làm động tác cho mỗi từ: good morning – vươn vai; goodbye – vẫy; kitten – meo.'] },
      { k: 2, id: 'truyen-en', type: 'book', t: 'Truyện · Bông\'s Day (phần 1–3)', p: 4, lang: 'en', title: 'Bông\'s Day', title_zh: 'Bông的一天', pages: scenes(u, [1, 2, 3]),
        con: 'Nghe, nhìn tranh, chỉ vào người được chào.', hoi: ['Hỏi cả lớp, con chỉ tranh: "Who is it? Mommy? Kitten?" Con chỉ là đủ, cô nói lại tên.'],
        note: ['Cô kể cả lượt tiếng Anh, giọng diễn cảm, chỉ vào tranh. Bấm ▶ Đọc cả lượt nếu muốn giọng mẫu.', 'Không dừng giảng từ; con chỉ cần hiểu ai chào ai.'] },
      { k: 2, id: 'chuyen-1', type: 'move', t: 'Đứng dậy nào', p: 1, cmds: [CMD.stand, CMD.wave, CMD.clap, CMD.sit],
        con: 'Làm theo lệnh.', note: ['Chuyển tiếp 1 phút: cô làm mẫu từng lệnh, nói to. Cả lớp làm theo.'] },
      { k: 2, id: 'cua-en', type: 'cua', t: 'Trò chơi · Cửa lớp thần kỳ', p: 3, lang: 'en', items: DOOR, game: true,
        rules: ['Bước vào cửa (➡️🚪): chào "Hello, ___!"', 'Bước ra cửa (🚪⬅️): "Goodbye, ___!"', 'Cả đội nói đúng thì được sao.'],
        con: 'Nói cùng cô câu chào hoặc tạm biệt khi đi qua "cửa".', note: ['Lấy hai ghế làm cửa lớp. Bấm 🎲: màn ra tranh và chiều đi. Một đội đi qua cửa, cả lớp nói cùng cô.', 'Buổi 1 cô nói trước, con nói theo; bấm 👀 Câu đúng để có giọng mẫu.'] },
      { k: 2, id: 'chon-en', type: 'chon', t: 'Trò chơi · Chỉ tranh', p: 3, lang: 'en', game: true, items: cards(W, ['good morning', 'goodbye', 'mommy', 'kitten', 'teacher', 'friend']),
        con: 'Nghe từ, chỉ đúng tranh.', note: ['Bấm 🎲 Gọi: máy đọc một từ, tranh đổi chỗ. Cả lớp chỉ tay lên màn; hai bạn hai đội lên chạm.', 'Lớp đông: dán flashcard in lên bảng cho con chạy lên chạm.'] },

      { k: 3, id: 'nhac', type: 'song', t: 'Vận động · Bài hát chào', p: 3, songs: NHAC.hello, moves: ['👋 Vẫy tay mỗi lần nghe "Hello" / 你好', '👏 Vỗ tay theo nhạc', '🙂 Quay sang chào bạn'],
        con: 'Hát, nhún, vẫy theo video.', note: ['Cả lớp đứng dậy theo video. Hết bài tiếng Anh, bấm sang bài tiếng Trung.'] },
      { k: 3, id: 'says', type: 'says', t: 'Trò chơi · Leo says / Xiaomei says', p: 4, cmds: [CMD.stand, CMD.sit, CMD.look, CMD.listen, CMD.wave, CMD.clap],
        rules: ['Leo ra lệnh bằng tiếng Anh, Xiaomei bằng tiếng Trung.', 'Có "Leo says…" / "Xiaomei说…" thì làm theo.', 'Không có thì đứng yên như tượng.'],
        con: 'Nghe lệnh lời lớp học, làm động tác.', note: ['Lời lớp học mới của buổi: Look! Listen! Sit down, please. (看！听！请坐。) – bấm thẻ bên phải để nghe riêng từng lệnh và làm mẫu.', 'Buổi 1 chưa bật lệnh lừa.'] },

      { k: 4, id: 'the-zh', type: 'flash', t: '图卡 · Bông的一天', p: 3, lang: 'zh', mode: 'ts', cards: cards(W, ['good morning', 'hello', 'goodbye', 'mommy', 'kitten', 'teacher', 'everyone', 'friend']),
        con: 'Nhìn tranh, nghe cô đọc 2 lần, nhắc theo cả lớp.', note: ['Cùng 8 tranh như khối tiếng Anh, giờ đọc tiếng Trung. Cô chú ý thanh: 早上好 (zǎo – thanh 3), 再见 (zài – thanh 4): tay vẽ đường thanh trên không.'] },
      { k: 4, id: 'truyen-zh', type: 'book', t: '故事 · Bông的一天 (phần 1–3)', p: 4, lang: 'zh', title: 'Bông\'s Day', title_zh: 'Bông的一天', pages: scenes(u, [1, 2, 3]),
        con: 'Nghe, chỉ người được chào.', note: ['Kể cả lượt tiếng Trung, cùng tranh. Không chen tiếng Anh vào lượt này.'] },
      { k: 4, id: 'cau', type: 'cau', t: 'Cầu nối · Leo và Xiaomei', p: 3,
        pairs: [{ ...L('Hello, mommy!', '妈妈，你好！', 'Māma, nǐ hǎo!'), img: W.mommy.img, gk: 'Giống: cùng chào mẹ, cùng vẫy tay. Khác: tiếng Trung gọi 妈妈 trước rồi mới chào.' },
          { ...L('Hello, everyone!', '大家好！', 'Dàjiā hǎo!'), img: W.everyone.img, gk: 'Khác: 大家 + 好, không có 你.' }],
        con: 'Nghe hai bạn nói, tìm chỗ giống và khác (chỉ tay, làm động tác).', note: ['Cô cầm rối Leo nói câu tiếng Anh, rối Xiaomei nói câu tiếng Trung. Hỏi bằng tiếng Việt: "Bạn nào gọi mẹ trước?" – con chỉ rối Xiaomei.'] },
      { k: 4, id: 'chuyen-2', type: 'move', t: '站起来！', p: 1, cmds: [CMD.stand, CMD.jump, CMD.wave, CMD.sit], con: 'Làm theo lệnh tiếng Trung.', note: ['Chuyển tiếp 1 phút, lần này cô nói tiếng Trung trước.'] },
      { k: 4, id: 'cua-zh', type: 'cua', t: '游戏 · Cửa lớp thần kỳ', p: 3, lang: 'zh', items: DOOR, game: true,
        rules: ['Bước vào: "___，你好！"', 'Bước ra: "___，再见！"'], con: 'Nói cùng cô bằng tiếng Trung.', note: ['Cùng trò như khối tiếng Anh. Với 大家 câu đúng là 大家好！ (không có 你).'] },
      { k: 4, id: 'chon-zh', type: 'chon', t: '游戏 · Chỉ tranh', p: 3, lang: 'zh', game: true, items: cards(W, ['good morning', 'goodbye', 'mommy', 'kitten', 'teacher', 'friend']),
        con: 'Nghe từ tiếng Trung, chỉ đúng tranh.', note: ['Như khối tiếng Anh. Bấm nút ngôn ngữ để chuyển 🔀 xen kẽ hai tiếng nếu lớp làm tốt.'] },

      { k: 5, id: 'nghi', type: 'nghi', t: 'Nghỉ giải lao', p: 5, img: CLS, list: NGHI, con: 'Uống nước, đi vệ sinh.', note: ['Bấm ▶ Bắt đầu: đồng hồ 5 phút. Bật nhạc nhẹ nếu muốn.'] },
      { k: 5, id: 'lam', type: 'lam', t: 'Làm tay · ' + u.craft.name, p: 5, off: true, img: r(u.craft.kids[0].img), ten: u.craft.name, mat: u.craft.mat, steps: u.craft.steps,
        line: L("Hello! My name is ___.", '你好！我叫___。', 'Nǐ hǎo! Wǒ jiào ___.'),
        con: 'Tô thẻ, vừa làm vừa nói tên mình.', note: ['Tắt chiếu. In sẵn trang thủ công. Buổi 1 con tô, cô viết tên; buổi 2 cắt, xâu dây.', 'Vừa làm vừa hỏi: "What\'s your name?" – con nói tên.'],
        print: [pr('ls', '#/u/1/craft', 'Thủ công Unit 1'), pr('ls', '#/u/1/names', 'Thẻ tên')] },

      { k: 6, id: 'bb-en', type: 'book', t: 'Big book · Goodbye, Puppy!', p: 4, lang: 'en', title: bb.title, title_zh: bb.title_zh, pages: withQ(bbPages(bb, 0, 7, cover)),
        con: 'Nghe cô đọc, tìm Puppy trốn trong tranh và chỉ vào.', hoi: ['Mỗi trang bấm ❓: "Where is Puppy?" – con chạy lên chỉ chỗ Puppy trốn. Puppy lén theo Bông cả ngày!'],
        note: ['Đọc cả lượt tiếng Anh trang bìa đến trang 7 (con đã nghe trên web ngày 1–3).', 'Trang bìa là khung ảnh: cô giơ ảnh một con vào khung, đọc "Good morning, ___!" (tên con).'] },
      { k: 6, id: 'bb-zh', type: 'book', t: 'Big book · 小狗，再见！', p: 3, lang: 'zh', title: bb.title, title_zh: bb.title_zh, pages: withQ(bbPages(bb, 0, 7, cover)),
        con: 'Nghe lượt tiếng Trung, chỉ Puppy.', note: ['Đọc lại cả quyển bằng tiếng Trung (không trộn hai tiếng trên một trang).'] },
      { k: 6, id: 'chuyen-3', type: 'move', t: 'Nhón chân như Puppy', p: 1, cmds: [CMD.stand, CMD.jump, CMD.clap, CMD.sit], con: 'Làm theo lệnh.', note: ['Cô nói: "Puppy is coming!" rồi cả lớp nhón chân đi vòng quanh ghế, nghe lệnh thì làm.'] },
      { k: 6, id: 'pdn', type: 'cau', t: 'Phiên dịch nhí · nói cho Xiaomei', p: 4, pdn: true,
        pairs: [{ ...L('Hello, teacher!', '老师，你好！', 'Lǎoshī, nǐ hǎo!'), img: W.teacher.img, gk: 'Tiếng Trung gọi 老师 trước.' },
          { ...L('Goodbye, mommy!', '妈妈，再见！', 'Māma, zàijiàn!'), img: W.mommy.img, gk: '妈妈 trước, 再见 sau.' },
          { ...L('Hello, friend!', '朋友，你好！', 'Péngyou, nǐ hǎo!'), img: W.friend.img, gk: '朋友 trước, 你好 sau.' }],
        con: 'Buổi 1: nghe Leo nói, cô làm mẫu nói lại cho Xiaomei, con nhắc theo.', note: ['Bấm 🔊 Leo nói. Cô quay sang rối Xiaomei, nói câu tiếng Trung, bấm 👀 để màn hiện câu và giọng mẫu. Con nhắc theo cả lớp.'] },
      { k: 6, id: 've-ls', type: 've', t: 'Vè · hát lại cả bài', p: 3, lines: VE_DAU.concat(VE_CUOI), img: BB + 'p6.webp', lang: 'en',
        con: 'Hát cùng cô, vỗ tay theo phách.', note: ['Hát trọn 6 dòng vè (4 dòng chào đầu, 2 dòng chào cuối). Đây là bài vè của unit trên web học.'] },

      tong(1, [W['good morning'], L('Hello, teacher!', '老师，你好！', 'Lǎoshī, nǐ hǎo!'), L('Goodbye, mommy!', '妈妈，再见！', 'Māma, zàijiàn!'), L('Hello, friend!', '朋友，你好！', 'Péngyou, nǐ hǎo!')], [4, 5, 6]),
      veCuoi,
      { k: 7, id: 'du', type: 'chon', t: 'Còn thời gian · Ai đây?', p: 3, du: true, lang: 'xen', game: true, items: ['bong', 'me', 'co', 'anna', 'leo', 'xiaomei'].map(k => ({ ...ch[k], en: 'Hello, ' + (k === 'me' ? 'mommy' : k === 'co' ? 'teacher' : ch[k].ten) + '!', zh: ({ me: '妈妈', co: '老师' }[k] || ch[k].ten) + '，你好！' })),
        con: 'Nghe câu chào, chỉ đúng người.', note: ['Màn dự phòng nếu còn giờ, hoặc dùng mở đầu buổi sau.'] },
    ] };

  const b2 = { t: 'Buổi 2 · Unit 1 Greeting · Repeat + Introduce', vai: 'giup', days: [4, 5, 6], next: [7, 8, 9],
    about: 'Hẹn ngày mai, chào bố, cún, chúc ngủ ngon (phần 4–5, cả truyện, big book trang 8–11). Cô hỏi, chờ 3 giây, giúp con đáp.',
    KHOI, MAN: [
      { k: 1, id: 'chao', type: 'chao', t: 'Chào cả lớp', p: 1, img: CLS, co: CO, lines: [L('Good morning, everyone!', '大家早上好！', 'Dàjiā zǎoshang hǎo!'), L('Hello, teacher!', '老师，你好！', 'Lǎoshī, nǐ hǎo!')],
        con: 'Chào lại cô: "Hello, teacher!"', note: ['Cô chào trước, chờ 3 giây cho con chào lại. Con nói được thì khen cụ thể: "Hello, teacher! Great!"'] },
      { k: 1, id: 've-dau', type: 've', t: 'Vè chào đầu buổi', p: 3, lines: VE_DAU, img: BB + 'p7.webp', con: 'Hát cả 4 dòng cùng cô.', note: ['Hát tiếng Anh rồi tiếng Trung. Dòng 4 gọi tên 2–3 con mới.'] },
      { k: 1, id: 'hoi-ten', type: 'hoi', t: 'Hỏi tên · cả lớp hỏi một bạn', p: 3, img: CLS, game: true,
        pairs: [{ q: L("What's your name?", '你叫什么名字呀？', 'Nǐ jiào shénme míngzi ya?'), a: L("An, An, that's my name!", '我叫An，An呀！', 'Wǒ jiào An, An ya!') }],
        con: 'Cả lớp hỏi; con được hỏi tự nói tên.', note: ['Vai con nâng lên: cả lớp cùng hỏi "What\'s your name?", một con đứng dậy nói tên. Cô chỉ nhắc khi con dừng quá 3 giây.'] },
      { k: 1, id: 'hoi-web', type: 'chon', t: 'Trên web con nhớ không?', p: 3, lang: 'en', game: true, items: cards(W, ['see you', 'daddy', 'puppy', 'good night']),
        con: 'Nghe từ đã gặp trên web ngày 4–6, chỉ tranh.', note: ['Hỏi lại web: 4 từ mới của ngày 4–6. Con nào nhớ thì chạm, cô khen cụ thể.'] },

      { k: 2, id: 'the-en', type: 'flash', t: 'Thẻ tranh · từ mới', p: 3, lang: 'en', mode: 'ts', cards: cards(W, ['see you', 'tomorrow', 'all', 'daddy', 'puppy', 'good night']),
        con: 'Nghe 2 lần, nhắc theo; thẻ cũ thì con nói trước.', note: ['Thẻ mới: cô đọc trước (T-S). Sau đó bấm 🧑‍🏫/👦 sang "Con trước" và lật nhanh 4 thẻ cũ ở màn sau.'] },
      { k: 2, id: 'truyen-en', type: 'book', t: 'Truyện · Bông\'s Day (phần 4–5)', p: 4, lang: 'en', title: 'Bông\'s Day', title_zh: 'Bông的一天', pages: scenes(u, [4, 5]),
        con: 'Nghe, trả lời bằng một từ hoặc chỉ tranh.', hoi: ['"Who is it?" – Daddy! / Puppy!', '"Good morning or good night?" – con chọn.'], note: ['Kể lượt tiếng Anh. Dừng ở mỗi trang hỏi một câu, chờ 3 giây, con đáp một từ, cô nói lại cả câu.'] },
      { k: 2, id: 'chuyen-1', type: 'move', t: 'Đứng dậy nào', p: 1, cmds: [CMD.stand, CMD.wave, CMD.stamp, CMD.sit], con: 'Làm theo lệnh.', note: ['Chuyển tiếp 1 phút.'] },
      { k: 2, id: 'xep-en', type: 'chon', t: 'Xếp tranh · ngày của Bông', p: 4, lang: 'en', xep: true, items: DAY8,
        con: 'Nghe câu, chạm tranh đúng; cả lớp xếp theo sáng – trưa – tối.', note: ['Bấm 🔊 Câu tiếp: máy đọc câu theo thứ tự trong ngày. Một con lên chạm tranh đúng, bấm 👀 Đặt tranh để xếp vào hàng.', 'Có flashcard in thì cho cả lớp đặt tranh thật lên bảng. Cảnh 1, 3, 5, 8: con nói câu cùng cô.'] },
      { k: 2, id: 'cua-en', type: 'cua', t: 'Chào đúng người', p: 3, lang: 'en', items: DOOR2, game: true, nodoor: false,
        rules: ['Màn ra người và chiều cửa.', 'Đội nói đúng câu trước được sao.'], con: 'Tự nói câu chào; cô chỉ giúp khi con dừng.', note: ['Như buổi 1 nhưng con nói trước, cô bấm 👀 sau để kiểm tra. Có thêm daddy, puppy (tối: Good night, puppy!).'] },

      { k: 3, id: 'nhac', type: 'song', t: 'Vận động · Vỗ tay thật vui', p: 3, songs: NHAC.vui, moves: ['👏 Clap your hands · 拍拍手', '🦶 Stamp your feet · 跺跺脚'], con: 'Làm theo video.', note: ['Cả lớp đứng dậy theo video.'] },
      { k: 3, id: 'says', type: 'says', t: 'Trò chơi · Leo says / Xiaomei says', p: 4, lua: true, cmds: [CMD.stand, CMD.sit, CMD.look, CMD.listen, CMD.wave, CMD.clap, CMD.stamp, CMD.jump],
        rules: ['Có "Leo says / Xiaomei说" thì làm.', 'Không có thì đứng yên.'], con: 'Nghe lệnh, làm đúng, không bị lừa.', note: ['Buổi 2 bật lệnh lừa (ít thôi), lệnh ngẫu nhiên, nhanh dần.'] },

      { k: 4, id: 'the-zh', type: 'flash', t: '图卡 · từ mới', p: 3, lang: 'zh', mode: 'ts', cards: cards(W, ['see you', 'tomorrow', 'all', 'daddy', 'puppy', 'good night']),
        con: 'Nghe 2 lần, nhắc theo.', note: ['明天见 (míngtiān jiàn), 晚安 (wǎn\'ān): tay vẽ thanh trên không.'] },
      { k: 4, id: 'truyen-zh', type: 'book', t: '故事 · Bông的一天 (phần 4–5)', p: 4, lang: 'zh', title: 'Bông\'s Day', title_zh: 'Bông的一天', pages: scenes(u, [4, 5]),
        con: 'Nghe, trả lời bằng một từ.', hoi: ['"这是谁？" (Đây là ai?) – 爸爸！/ 小狗！'], note: ['Lượt tiếng Trung, cùng tranh.'] },
      { k: 4, id: 'cau', type: 'cau', t: 'Cầu nối · Leo và Xiaomei', p: 3,
        pairs: [{ ...L('Goodbye, all! See you tomorrow!', '大家再见！明天见！', 'Dàjiā zàijiàn! Míngtiān jiàn!'), img: W.tomorrow.img, gk: 'Khác: tomorrow ở cuối câu, 明天 ở đầu câu.' },
          { ...L('Good night, puppy!', '小狗，晚安！', 'Xiǎogǒu, wǎn\'ān!'), img: W['good night'].img, gk: 'Khác: tiếng Trung gọi 小狗 trước rồi mới 晚安.' }],
        con: 'Tìm chỗ khác nhau, chỉ vào rối nói từ đó trước.', note: ['Rối Leo nói tiếng Anh, rối Xiaomei nói tiếng Trung. Hỏi: "明天 ở đâu? Đầu hay cuối?" – con giơ tay trái (đầu) hoặc phải (cuối).'] },
      { k: 4, id: 'chuyen-2', type: 'move', t: '站起来！', p: 1, cmds: [CMD.stand, CMD.clap, CMD.jump, CMD.sit], con: 'Làm theo lệnh tiếng Trung.', note: ['Chuyển tiếp 1 phút.'] },
      { k: 4, id: 'xep-zh', type: 'chon', t: '排一排 · Bông的一天', p: 3, lang: 'zh', xep: true, items: DAY8, con: 'Nghe câu tiếng Trung, chạm tranh.', note: ['Cùng trò xếp tranh, câu tiếng Trung.'] },
      { k: 4, id: 'cua-zh', type: 'cua', t: 'Chào đúng người · 中文', p: 3, lang: 'zh', items: DOOR2, game: true, con: 'Tự nói câu chào bằng tiếng Trung.', note: ['Như khối tiếng Anh.'] },

      { k: 5, id: 'nghi', type: 'nghi', t: 'Nghỉ giải lao', p: 5, img: CLS, list: NGHI, con: 'Uống nước, đi vệ sinh.', note: ['Đồng hồ 5 phút.'] },
      { k: 5, id: 'lam', type: 'lam', t: 'Làm tay · Rối que nhân vật', p: 5, off: true, img: ch.bong.img, ten: 'Rối que Bông\'s Day',
        mat: 'Trang rối que in sẵn, bút sáp, kéo, que kem, keo', steps: ['Mỗi con tô 1 rối (Bông, mẹ, bố, cô, Anna, Puppy).', 'Cô cắt giúp, con dán que.', 'Cầm rối chào bạn: "Hello, ___!" – bạn cầm rối khác đáp lại.', 'Giữ rối ở lớp cho buổi 3 diễn truyện.'],
        line: L('Hello, puppy!', '小狗，你好！', 'Xiǎogǒu, nǐ hǎo!'), con: 'Tô rối, cầm rối chào bạn.', note: ['Tắt chiếu. Hoàn thành thẻ tên đeo cổ của buổi 1 nếu còn.'],
        print: [pr('ls', '#/u/1/puppets', 'Rối que Unit 1'), pr('ls', '#/u/1/craft', 'Thủ công Unit 1')] },

      { k: 6, id: 'bb-en', type: 'book', t: 'Big book · Goodbye, Puppy!', p: 4, lang: 'en', title: bb.title, title_zh: bb.title_zh, pages: withQ(bbPages(bb, 0, 11, cover)),
        con: 'Nói cùng cô câu của mỗi trang; tìm Puppy.', hoi: ['❓ Where is Puppy? – con chỉ.', 'Trang 9 (Goodbye, all!): cả lớp vẫy, nói cùng cô.'], note: ['Đọc cả quyển (bìa + 11 trang). Từ trang 1–7 cô dừng trước từ cuối câu cho con nói nốt ("Hello, ___" – "teacher!").'] },
      { k: 6, id: 'bb-zh', type: 'book', t: 'Big book · 小狗，再见！', p: 4, lang: 'zh', title: bb.title, title_zh: bb.title_zh, pages: withQ(bbPages(bb, 0, 11, cover)),
        con: 'Nghe lượt tiếng Trung, nói nốt từ cuối với các trang quen.', note: ['Lượt tiếng Trung cả quyển.'] },
      { k: 6, id: 'pdn', type: 'cau', t: 'Phiên dịch nhí · nói cho Xiaomei', p: 4, pdn: true, game: true,
        pairs: [{ ...L('Hello, daddy!', '爸爸，你好！', 'Bàba, nǐ hǎo!'), img: W.daddy.img }, { ...L('Goodbye, kitten!', '小猫，再见！', 'Xiǎomāo, zàijiàn!'), img: W.kitten.img },
          { ...L('Hello, everyone!', '大家好！', 'Dàjiā hǎo!'), img: W.everyone.img }, { ...L('Good night, puppy!', '小狗，晚安！', 'Xiǎogǒu, wǎn\'ān!'), img: W['good night'].img }],
        con: 'Nghe Leo, đội nói lại cho Xiaomei bằng tiếng Trung.', note: ['Đội Cún, đội Mèo thay nhau: Leo nói, đội bàn 5 giây rồi nói cho Xiaomei. Bấm 👀 kiểm tra, đúng được sao.'] },
      { k: 6, id: 've-ls', type: 've', t: 'Vè · hát lại cả bài', p: 2, lines: VE_DAU.concat(VE_CUOI), img: BB + 'p6.webp', con: 'Hát cả bài, vỗ phách.', note: ['Chia lớp hai nửa: nửa hát dòng lẻ, nửa hát dòng chẵn.'] },

      tong(2, [L('See you tomorrow!', '明天见！', 'Míngtiān jiàn!'), L('Hello, daddy!', '爸爸，你好！', 'Bàba, nǐ hǎo!'), L('Hello, puppy!', '小狗，你好！', 'Xiǎogǒu, nǐ hǎo!'), L('Good night, puppy!', '小狗，晚安！', 'Xiǎogǒu, wǎn\'ān!')], [7, 8, 9]),
      veCuoi,
      { k: 7, id: 'du', type: 'chon', t: 'Còn thời gian · Ai đây?', p: 3, du: true, lang: 'xen', game: true, items: DOOR2.map(x => ({ img: x.img, ...x.hi })), con: 'Nghe câu chào, chỉ đúng người.', note: ['Màn dự phòng.'] },
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
    about: 'Diễn truyện, hát vè, chào cả lớp bằng hai tiếng; phiếu cuối unit. Cô nghe con nói, chỉ giúp khi con dừng.',
    KHOI, MAN: [
      { k: 1, id: 'chao', type: 'chao', t: 'Con chào cô trước', p: 1, img: CLS, co: CO, lines: [L('Good morning, teacher!', '老师，早上好！', 'Lǎoshī, zǎoshang hǎo!'), L('Hello, everyone!', '大家好！', 'Dàjiā hǎo!')],
        con: 'Con chào cô trước khi cô chào.', note: ['Cô đứng ở cửa, chờ con chào trước. Khen cụ thể con nào chào bằng tiếng Trung.'] },
      { k: 1, id: 've-dau', type: 've', t: 'Vè chào đầu buổi', p: 3, lines: VE_DAU, img: BB + 'p7.webp', con: 'Cả lớp hát không cần giọng mẫu; hát to – hát nhỏ.', note: ['Không bấm đọc mẫu, chỉ bấm 🥁 Nhịp. Cô nghe, chỉ hát cùng khi lớp ngập ngừng.'] },
      { k: 1, id: 'hoi-ten', type: 'hoi', t: 'Hỏi tên theo cặp', p: 3, img: CLS,
        pairs: [{ q: L("What's your name?", '你叫什么名字呀？', 'Nǐ jiào shénme míngzi ya?'), a: L("An, An, that's my name!", '我叫An，An呀！', 'Wǒ jiào An, An ya!') }],
        con: 'Hai bạn hỏi – đáp tên nhau.', note: ['Ghép đôi (cùng màu thẻ tên). Bạn A hỏi, bạn B đáp, đổi vai. Cô đi vòng nghe từng đôi.'] },

      { k: 2, id: 'the-en', type: 'flash', t: 'Thẻ tranh · ôn cả unit', p: 2, lang: 'en', mode: 'sts', cards: cards(W, ['good morning', 'hello', 'goodbye', 'mommy', 'kitten', 'teacher', 'friend', 'daddy', 'puppy', 'good night']),
        con: 'Con nói trước, cô nói, con nói lại.', note: ['Chế độ "Con trước": thẻ hiện, chờ 3 giây cho con nói, máy đọc sau. Lật nhanh.'] },
      { k: 2, id: 'dien-en', type: 'dien', t: 'Diễn · Bông\'s Day 5 vai', p: 5, lang: 'en', roles: ROLES5, hide: true, img: CLS,
        lines: st.filter(s => ['bong', 'me', 'co', 'anna', 'bo'].includes(s.who)),
        con: 'Mỗi nhóm cầm rối một vai, nói câu của vai mình khi tranh hiện.', note: ['Chia 5 nhóm, mỗi nhóm cầm rối que của buổi 2 (Bông, mẹ, cô, Anna, bố). Lời đang che: con nhìn tranh và tự nói, cô bấm 🙉 Hiện lời khi cả nhóm dừng quá 3 giây.'] },
      { k: 2, id: 'chuyen-1', type: 'move', t: 'Đứng dậy nào', p: 1, cmds: [CMD.stand, CMD.wave, CMD.jump, CMD.sit], con: 'Làm theo lệnh.', note: ['Một con lên làm "cô giáo" ra lệnh.'] },
      { k: 2, id: 'kich-en', type: 'dien', t: 'Kịch ngắn · First Day', p: 4, lang: 'en', img: CLS, roles: [ch.bong, ch.co, ch.leo, ch.lop], lines: FIRST, hide: true,
        con: 'Đóng vai Bông, cô, Leo, cả lớp.', note: ['Cô đóng vai cô giáo, chọn 1 con làm Bông, rối Leo do một con cầm, cả lớp làm "cả lớp".', 'Đùa: cô chỉ rối Leo hỏi "Teacher?" – con: "No! Friend!"'] },
      { k: 2, id: 'san-khau', type: 'chao', t: 'Sân khấu nhí', p: 3, img: '../seedling/tai-nguyen/trang/sk_nha_hat.webp', lines: [L('Hello, everyone!', '大家好！', 'Dàjiā hǎo!'), L('See you tomorrow!', '明天见！', 'Míngtiān jiàn!')],
        con: 'Từng con lên chào cả lớp rồi hẹn ngày mai (tiếng Anh).', note: ['Mỗi con lên "sân khấu" (trước màn), nói 2 câu. Khán giả vẫy tay đáp "Hello, ___!". Ghi lại con nào cần nhắc để báo ba mẹ.'] },

      { k: 3, id: 'nhac', type: 'song', t: 'Vận động · Đi trong rừng', p: 3, songs: NHAC.rung, freeze: true, moves: ['🚶 walk', '🦶 stomp', '🐸 jump', '🧊 Đứng hình khi nhạc dừng'], con: 'Làm theo video, đứng hình khi nhạc dừng.', note: ['Bấm 🧊 bất kỳ lúc nào.'] },
      { k: 3, id: 'says', type: 'says', t: 'Con làm Leo / Xiaomei', p: 4, lua: true, cmds: [CMD.stand, CMD.sit, CMD.look, CMD.listen, CMD.wave, CMD.clap, CMD.stamp, CMD.jump],
        rules: ['Một con làm Leo (ra lệnh tiếng Anh) hoặc Xiaomei (tiếng Trung).', 'Cả lớp làm theo.'], con: 'Một con ra lệnh, cả lớp làm.', note: ['Con ra lệnh nhìn thẻ bên phải để chọn lệnh; cô bấm thẻ cho cả lớp nghe giọng mẫu nếu con nói nhỏ.'] },

      { k: 4, id: 'the-zh', type: 'flash', t: '图卡 · ôn cả unit', p: 2, lang: 'zh', mode: 'sts', cards: cards(W, ['good morning', 'hello', 'goodbye', 'mommy', 'kitten', 'teacher', 'friend', 'daddy', 'puppy', 'good night']),
        con: 'Con nói trước bằng tiếng Trung.', note: ['Như khối tiếng Anh.'] },
      { k: 4, id: 'cau', type: 'cau', t: 'Cầu nối · Leo và Xiaomei', p: 2,
        pairs: [{ ...L('See you tomorrow!', '明天见！', 'Míngtiān jiàn!'), img: W.tomorrow.img, gk: 'tomorrow ở cuối, 明天 ở đầu.' }],
        con: 'Con tự nói chỗ khác nhau (chỉ đầu – cuối).', note: ['Con tự tìm, cô chỉ xác nhận.'] },
      { k: 4, id: 'kich-zh', type: 'dien', t: '小剧 · First Day', p: 4, lang: 'zh', img: CLS, roles: [ch.bong, ch.co, ch.xiaomei, ch.lop], hide: true,
        lines: FIRST.map(x => x.who === 'leo' ? { ...x, who: 'xiaomei' } : x),
        con: 'Đóng vai bằng tiếng Trung (rối Xiaomei).', note: ['Rối Leo chào thì đáp tiếng Anh, rối Xiaomei chào thì đáp tiếng Trung. Đùa: "老师？" – con: "不，朋友！"'] },
      { k: 4, id: 'chu', type: 'chu', t: 'Nhìn chữ khổ lớn · 大 小', p: 3, cols: [
          { h: 'Dang tay', big: '大', zh: true, small: 'dà · 大家', img: W.everyone.img },
          { h: 'Chụm ngón tay', big: '小', zh: true, small: 'xiǎo · 小狗 小猫', img: W.puppy.img }],
        con: 'Thấy 大 thì dang tay, thấy 小 thì chụm ngón tay; chạm tranh 大家 hay 小狗.', note: ['Cô giơ thẻ chữ (hoặc chỉ màn), con làm động tác. Chỉ nhận mặt chữ, chưa viết.'] },
      { k: 4, id: 'san-zh', type: 'chao', t: '小舞台 · Sân khấu nhí', p: 3, img: '../seedling/tai-nguyen/trang/sk_nha_hat.webp', lines: [L('Hello, everyone!', '大家好！', 'Dàjiā hǎo!'), L('See you tomorrow!', '明天见！', 'Míngtiān jiàn!')],
        con: 'Từng con lên chào bằng tiếng Trung.', note: ['Như phần tiếng Anh; con nào đã nói tiếng Anh tốt thì thử nói cả hai.'] },

      { k: 5, id: 'nghi', type: 'nghi', t: 'Nghỉ giải lao', p: 5, img: CLS, list: NGHI, con: 'Uống nước, đi vệ sinh.', note: ['Đồng hồ 5 phút.'] },
      { k: 5, id: 'lam', type: 'lam', t: 'Làm tay · tập diễn rối theo nhóm', p: 5, off: true, img: ch.me.img, ten: 'Tập diễn với rối que',
        steps: ['Nhóm 3 con, mỗi con một rối.', 'Tập lại 3 câu của nhóm: chào, tạm biệt, hẹn mai.', 'Cô đi vòng nghe, sửa phát âm từng con.'], line: L('Goodbye, all! See you tomorrow!', '大家再见！明天见！', 'Dàjiā zàijiàn! Míngtiān jiàn!'),
        con: 'Tập diễn cùng bạn.', note: ['Tắt chiếu. Chuẩn bị cho phần diễn và phiếu ở khối 6.'] },

      { k: 6, id: 'bb-en', type: 'book', t: 'Big book · con đọc cùng', p: 4, lang: 'en', hide: true, title: bb.title, title_zh: bb.title_zh, pages: bbPages(bb, 0, 11, cover),
        con: 'Nhìn tranh, nói câu của trang trước khi cô đọc.', note: ['Chữ đang che: con nói trước, cô bấm 🔊 hoặc 🙉 sau để kiểm tra.'] },
      { k: 6, id: 'bb-zh', type: 'book', t: 'Big book · 中文', p: 3, lang: 'zh', hide: true, title: bb.title, title_zh: bb.title_zh, pages: bbPages(bb, 0, 11, cover),
        con: 'Nói câu tiếng Trung của các trang quen.', note: ['Như lượt tiếng Anh.'] },
      { k: 6, id: 'kt', type: 'kt', t: 'Phiếu cuối unit · nghe và khoanh', p: 6, items: u.check.map(c => ({ say: c, opts: c.opts.map(r), ans: c.ans })),
        con: 'Nghe, khoanh tranh đúng trên phiếu.', note: ['Phát phiếu cuối unit (in). Bấm 🔊 Đọc câu 2 lần, con khoanh A, B hoặc C. Thu phiếu, chấm sau.', 'Màn chỉ hiện đáp án khi cô bấm 👀 (sau khi thu phiếu).'],
        print: [pr('ls', '#/u/1/check', 'Phiếu cuối Unit 1')] },
      { k: 6, id: 'pdn', type: 'cau', t: 'Phiên dịch nhí · không mẫu', p: 4, pdn: true, game: true,
        pairs: [{ ...L('Good morning, mommy!', '妈妈，早上好！', 'Māma, zǎoshang hǎo!'), img: W.mommy.img }, { ...L('See you tomorrow, teacher!', '老师，明天见！', 'Lǎoshī, míngtiān jiàn!'), img: W.tomorrow.img },
          { ...L('Hello, puppy!', '小狗，你好！', 'Xiǎogǒu, nǐ hǎo!'), img: W.puppy.img }],
        con: 'Từng con nói lại cho Xiaomei.', note: ['Mỗi câu gọi 1–2 con nói một mình. Bấm 👀 sau khi con nói xong.'] },

      tong(3, [L('Good morning, teacher!', '老师，早上好！', 'Lǎoshī, zǎoshang hǎo!'), L('Hello, everyone!', '大家好！', 'Dàjiā hǎo!'), L('Goodbye, all! See you tomorrow!', '大家再见！明天见！', 'Dàjiā zàijiàn! Míngtiān jiàn!')], [10, 11],
        ['Cô gửi ba mẹ nhận xét Unit 1 (4 đầu ra: giao tiếp, đọc, thuyết trình, viết) qua Zalo.']),
      veCuoi,
      { k: 7, id: 'du', type: 'chon', t: 'Còn thời gian · Ai đây?', p: 3, du: true, lang: 'xen', game: true, items: DOOR2.map(x => ({ img: x.img, ...x.hi })), con: 'Nghe câu chào, chỉ đúng người.', note: ['Màn dự phòng.'] },
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
  const veCuoi = { k: 7, id: 've-cuoi', type: 've', t: 'Vè chào cuối buổi', p: 2, lines: VE_CUOI, img: '../seedling/tai-nguyen/canh/u1/p3_6.webp', con: 'Hát, vẫy tay chào cô.', note: ['Hát tiếng Anh rồi tiếng Trung, xếp hàng ra cửa.'] };
  const tong = (b, lines, days, chars) => ({ k: 7, id: 'tong', type: 'tong', t: 'Vinh danh · việc ở nhà', p: 3, lines,
    home: [`Ngày web ${days.join(', ')}.`, `Sách bài tập buổi ${b}: 2 trang (Anh, Trung), khoảng 10 phút.`, `Tập viết: ${chars}.`],
    con: 'Bạn được vinh danh nói lại 1 câu hay nhất của buổi bằng hai tiếng.', note: ['Vinh danh 2–3 con (cụ thể việc con làm tốt). Cộng sao trên Bảng của cô. Video tốt thả vào thư mục Góc vinh danh.'],
    print: [pr('sd', '#/b/' + b, 'Sách bài tập buổi ' + b)] });
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

  const b1 = { t: 'Buổi 1 · Unit 1 Greeting · Introduce', vai: 'mau', days: [1, 2, 3], next: [4, 5, 6],
    about: 'Good Morning, Mrs Lan! phần 1–3, big book "Hello! I\'m ___". Cô làm mẫu; con nghe, chỉ, nói cùng cô.',
    KHOI: K(12, 32, 40, 60, 67, 'Truyện, thủ công'), MAN: [
      { k: 1, id: 'chao', type: 'chao', t: 'Chào cửa lớp', p: 2, img: '../seedling/tai-nguyen/canh/u1/p2_1.webp', co: CO, lines: [L('Good morning, class!', '小朋友们，早上好！', 'Xiǎopéngyǒumen, zǎoshang hǎo!'), L('Good morning, Mrs Lan!', 'Lan老师，早上好！', 'Lan lǎoshī, zǎoshang hǎo!')],
        con: 'Đáp lại cô: "Good morning, ___!" (tên cô thật).', note: ['Cô chào ở cửa, con đáp bằng tên cô thật của lớp. Ngồi vòng tròn.'] },
      { k: 1, id: 've-dau', type: 've', t: 'Vè chào đầu buổi', p: 4, lines: VE_DAU, img: '../seedling/tai-nguyen/canh/u1/p2_2.webp', con: 'Hát cả 4 dòng (đã nghe trên web ngày 1–3).', note: ['Hát mẫu tiếng Anh với 🥁, con hát theo; đổi sang tiếng Trung. Dòng 4 thay "Leo" bằng tên con.'] },
      { k: 1, id: 'hoi-web', type: 'chon', t: 'Hỏi lại web · ngày 1–3', p: 3, lang: 'en', game: true, items: cards(W, ['good morning', 'Mrs Lan', 'Hello, Grandpa!', 'class · kids', 'Hello, kids!', 'sorry']),
        con: 'Nghe câu, chạm tranh (giơ thẻ số nếu có).', note: ['Gọi 4–5 lượt. Ghi lại con nào chưa làm web.'] },
      { k: 1, id: 'nep', type: 'move', t: 'Nếp lớp · đếm 3–2–1', p: 2, cmds: [L('Three, two, one!', '三、二、一！', 'Sān, èr, yī!', { ic: '✋' }), CMD.look, CMD.listen, CMD.sit], con: 'Nghe "Three, two, one!" thì ngồi yên, nhìn cô.', note: ['Nếp lớp 1: cô đếm 3–2–1, con im lặng, tay lên đùi. Tập 3 lần.'] },

      { k: 2, id: 'the-en', type: 'flash', t: 'Thẻ tranh · phần 1–3', p: 3, lang: 'en', mode: 'ts', cards: cards(W, ['good morning', 'Mrs Lan', 'Hello, Grandpa!', 'class · kids', 'Hello, kids!', 'one man · two men', 'write', 'sorry', 'See you tomorrow!']),
        con: 'Nghe 2 lần, nhắc theo.', note: ['Thẻ đi kèm truyện vừa kể: chỉ dùng từ của phần 1–3.'] },
      book({ k: 2, id: 'truyen-en', t: 'Truyện · Good Morning, Mrs Lan! (phần 1–3)', p: 6, lang: 'en', title: 'Good Morning, Mrs Lan!', title_zh: 'Lan老师，早上好！', pages: S1,
        con: 'Nghe, nhìn tranh, trả lời bằng tranh hoặc một từ.', hoi: ['Trang 1: "Who is it?" – Grandpa!', 'Phần 2: "How many men?" – Two!', 'Phần 3: "Oh no! What does Bông say?" – Sorry!'], note: ['Kể cả lượt tiếng Anh. Rối que Bông, cô Lan, ông để diễn tả.'] }),
      { k: 2, id: 'chuyen-1', type: 'move', t: 'Đứng dậy nào', p: 1, cmds: [CMD.stand, CMD.wave, CMD.clap, CMD.sit], con: 'Làm theo lệnh.', note: ['Chuyển tiếp 1 phút.'] },
      { k: 2, id: 'cua-en', type: 'cua', t: 'Chào đúng người', p: 4, lang: 'en', items: GREET, game: true,
        rules: ['Màn ra người: con chào đúng câu.', 'Có cửa ⬅️: tạm biệt.'], con: 'Nói cùng cô, rồi tự nói.', note: ['Lượt đầu cô nói mẫu, các lượt sau cô chờ 3 giây cho con nói trước.'] },
      { k: 2, id: 'dung-sai', type: 'chon', t: 'Đúng hay sai? · thẻ ✓ ✗', p: 3, lang: 'en', game: true, items: [1, 4, 5, 9, 14, 16].map(i => S1[i]).map(s => ({ img: s.img, en: s.en, zh: s.zh, py: s.py })),
        con: 'Nghe câu, chạm đúng tranh.', note: ['Cô có thể đọc sai câu (đổi tên người) để con giơ thẻ ✗.'] },

      { k: 3, id: 'nhac', type: 'song', t: 'Vận động · Bài hát chào', p: 4, songs: NHAC.hello, moves: ['👋 Hello · 你好', '👏 Clap'], con: 'Làm theo video.', note: ['Đứng dậy theo video.'] },
      { k: 3, id: 'says', type: 'says', t: 'Leo says / Xiaomei says', p: 4, cmds: [CMD.stand, CMD.sit, CMD.look, CMD.listen, CMD.wave, CMD.clap],
        rules: ['Có "Leo says / Xiaomei说" thì làm.', 'Không có thì đứng yên.'], con: 'Nghe lời lớp học, làm động tác.', note: ['Buổi 1 chưa lừa.'] },

      { k: 4, id: 'the-zh', type: 'flash', t: '图卡 · phần 1–3', p: 3, lang: 'zh', mode: 'ts', cards: cards(W, ['good morning', 'Mrs Lan', 'Hello, Grandpa!', 'class · kids', 'Hello, kids!', 'one man · two men', 'write', 'sorry', 'See you tomorrow!']),
        con: 'Nghe 2 lần, nhắc theo.', note: ['您好 (nín): chào người lớn – cô cúi đầu khi nói.'] },
      book({ k: 4, id: 'truyen-zh', t: '故事 · Lan老师，早上好！(phần 1–3)', p: 6, lang: 'zh', title: 'Good Morning, Mrs Lan!', title_zh: 'Lan老师，早上好！', pages: S1,
        con: 'Nghe lượt tiếng Trung, chỉ người nói.', hoi: ['谁在说话？(Ai đang nói?) – con chỉ rối.'], note: ['Rối Xiaomei kể lượt tiếng Trung.'] }),
      { k: 4, id: 'cau', type: 'cau', t: 'Cầu nối · Leo và Xiaomei', p: 4,
        pairs: [{ ...L('Hello, Grandpa!', '爷爷，您好！', 'Yéye, nín hǎo!'), img: ch.ong.img, gk: 'Khác: chào ông dùng 您 (lễ phép), không dùng 你.' },
          { ...L('Good morning, Mrs Lan!', 'Lan老师，早上好！', 'Lan lǎoshī, zǎoshang hǎo!'), img: W['Mrs Lan'].img, gk: 'Khác: Mrs đứng trước tên, 老师 đứng sau tên.' },
          { ...L('Hello, kids!', '小朋友们，你们好！', 'Xiǎopéngyǒumen, nǐmen hǎo!'), img: W['Hello, kids!'].img, gk: 'Khác: chào nhiều người dùng 你们.' }],
        con: 'Tìm chỗ khác nhau; Phiên dịch nhí: cô làm mẫu.', note: ['Rối Leo nói, rối Xiaomei nói. Hỏi tiếng Việt: "Chữ 老师 đứng ở đâu?"'] },
      { k: 4, id: 'zuo', type: 'says', t: '做一做 · Xiaomei说', p: 3, who: 'xiaomei', cmds: [CMD.stand, CMD.sit, CMD.look, CMD.listen, CMD.wave], con: 'Nghe lệnh tiếng Trung, làm động tác.', note: ['Chỉ Xiaomei ra lệnh.'] },

      { k: 5, id: 'chu', type: 'chu', t: 'Chữ và âm · buổi 1', p: 7, cols: [
          { h: 'Thanh 1 (đường bằng) ˉ', big: 'ˉ', small: 'Tay vẽ đường bằng: 他 tā · 妈 mā' },
          { h: 'Âm /s/ 🐍', big: 's', small: 'sss… như con rắn · sorry, see' },
          { h: 'Bảng con · tiếng Anh', words: ['Mrs', 'kid', 'good'] },
          { h: 'Bảng con · tiếng Trung', zh: true, words: ['上', '小'] }],
        con: 'Vẽ thanh trên không, nói âm s, viết lên bảng con.', note: ['3′ thanh và âm, 4′ bảng con: Anh viết 3 từ, Trung tô 2 chữ theo thứ tự nét.'] },

      book({ k: 6, id: 'bb-en', t: 'Big book · Hello! I\'m ___', p: 4, lang: 'en', title: bbU1.title, title_zh: '你好！我是___', pages: bbPages(bbU1, 0, 7),
        con: 'Nghe, nói cùng cô; trang cuối nói tên mình.', note: ['Đọc lượt tiếng Anh. Trang cuối: từng con nói "Hello! I\'m ___."'] }),
      book({ k: 6, id: 'bb-zh', t: 'Big book · 你好！我是___', p: 3, lang: 'zh', title: bbU1.title, title_zh: '你好！我是___', pages: bbPages(bbU1, 0, 7), con: 'Nghe lượt tiếng Trung.', note: ['Lượt tiếng Trung.'] }),
      { k: 6, id: 'lam', type: 'lam', t: 'Thủ công · thẻ tên', p: 6, off: true, img: W.write.img, ten: 'Thẻ tên của con', steps: ['Cô nói: "Kids, write your name!"', 'Con viết tên mình lên thẻ.', 'Buổi 2 tô màu, xâu dây.'],
        line: L('Kids, write your name.', '小朋友们，写名字吧。', 'Xiǎopéngyǒumen, xiě míngzi ba.'), con: 'Viết tên mình lên thẻ.', note: ['Tắt chiếu.'], print: [pr('sd', '#/u/1/names', 'Thẻ tên'), pr('sd', '#/u/1/craft', 'Thủ công Unit 1')] },

      tong(1, [L('Good morning, Mrs Lan!', 'Lan老师，早上好！', 'Lan lǎoshī, zǎoshang hǎo!'), L('Hello, Grandpa!', '爷爷，您好！', 'Yéye, nín hǎo!'), L('Sorry, Leo!', '对不起，Leo！', 'Duìbuqǐ, Leo!')], [4, 5, 6], 'Mrs, kid, good · 上, 小'),
      veCuoi,
      { k: 7, id: 'du', type: 'cua', t: 'Còn thời gian · Chào đúng người', p: 3, du: true, lang: 'zh', items: GREET, game: true, con: 'Chào bằng tiếng Trung.', note: ['Màn dự phòng.'] },
    ] };

  const b2 = { t: 'Buổi 2 · Unit 4 Body · Introduce · Unit 1 Repeat', vai: 'giup', days: [4, 5, 6], next: [7, 8, 9],
    about: 'Giới thiệu The Body Show phần 1–3; nhắc lại Greeting bằng hình thức mới. Cô hỏi, chờ, giúp con đáp.',
    KHOI: K(8, 28, 38, 58, 65, 'Truyện, thủ công'), MAN: [
      { k: 1, id: 've-dau', type: 've', t: 'Vè chào đầu buổi', p: 3, lines: VE_DAU, img: '../seedling/tai-nguyen/canh/u1/p2_2.webp', con: 'Hát cùng cô, không cần đọc mẫu.', note: ['Chỉ bấm 🥁 Nhịp.'] },
      { k: 1, id: 'hoi-web', type: 'chon', t: 'Hỏi lại web · ngày 4–6', p: 3, lang: 'en', game: true, items: cards(W, ['body', 'hair', 'long', 'arm', 'leg', 'toe']), con: 'Nghe, chạm tranh.', note: ['3–4 lượt.'] },
      { k: 1, id: 'nep', type: 'move', t: 'Nếp lớp 2 · Đôi bạn', p: 2, cmds: [L('Find a friend!', '找朋友！', 'Zhǎo péngyou!', { ic: '🤝' }), L('Hello, friend!', '朋友，你好！', 'Péngyou, nǐ hǎo!', { ic: '👋' }), CMD.sit], con: 'Tìm bạn ngồi cạnh làm đôi.', note: ['Nếp lớp 2: nghe "Find a friend!" thì quay sang bạn bên cạnh, chào nhau.'] },

      { k: 2, id: 'nhac-u1', type: 'cua', t: 'Nhắc Greeting · đôi bạn chào', p: 5, lang: 'en', items: GREET, game: true, rules: ['Đôi bạn: một bạn đóng vai trong tranh, bạn kia chào.', 'Đổi vai.'], con: 'Đôi bạn tự chào, cô giúp khi dừng.', note: ['Nhắc lại Greeting bằng hình thức mới: đôi bạn. Cô đi vòng nghe, gợi ý bằng tranh trước khi nói hộ.'] },
      { k: 2, id: 'the-en', type: 'flash', t: 'Thẻ tranh · The Body Show', p: 3, lang: 'en', mode: 'ts', cards: cards(W, ['body', 'hair', 'long', 'town', 'The man is very tall.', 'arm', 'leg', 'finger', 'toe', 'shoulder']),
        con: 'Nghe, nhắc theo, chạm bộ phận trên người mình.', note: ['Mỗi thẻ: cô đọc, con nhắc, con chạm vào bộ phận đó trên người.'] },
      book({ k: 2, id: 'truyen-en', t: 'Truyện · The Body Show (phần 1–3)', p: 6, lang: 'en', title: 'The Body Show', title_zh: '身体表演', pages: S4,
        con: 'Nghe, làm theo lệnh của người diễn trong truyện.', hoi: ['"Long or short?" – Long!', '"How many fingers?" – Five!'], note: ['Kể lượt tiếng Anh; ở lệnh Touch… cả lớp làm theo.'] }),
      { k: 2, id: 'chuyen-1', type: 'move', t: 'Đứng dậy nào', p: 1, cmds: [CMD.stand, CMD.touchHead, CMD.clap, CMD.sit], con: 'Làm theo lệnh.', note: ['Chuyển tiếp.'] },
      { k: 2, id: 'cham-than', type: 'chon', t: 'Chạm cơ thể', p: 4, lang: 'en', game: true, items: cards(W, BODY), con: 'Nghe từ, chạm tranh và chạm bộ phận trên người.', note: ['Hai đội thi chạm.'] },

      { k: 3, id: 'simon', type: 'says', t: 'Leo says · bộ phận cơ thể', p: 5, lua: true, cmds: TOUCH, rules: ['Có "Leo says / Xiaomei说" thì làm.', 'Không có thì đứng yên.'], con: 'Làm theo lệnh chạm cơ thể.', note: ['Bật lệnh lừa từ lượt 5.'] },
      { k: 3, id: 've-body', type: 've', t: 'Vè Body Show', p: 5, lines: VE_BODY, img: W.body.img, lang: 'en', con: 'Nghe, làm động tác theo từng dòng.', note: ['Chữ hoa là phách mạnh. Dòng 3 gọi tên 2 con.'] },

      { k: 4, id: 'ai-noi', type: 'cau', t: 'Ai đang nói? · Greeting', p: 3, pdn: true,
        pairs: [{ ...L('Good morning, class!', '小朋友们，早上好！', 'Xiǎopéngyǒumen, zǎoshang hǎo!'), img: ch.lan.img }, { ...L('Hello, kids!', '小朋友们，你们好！', 'Xiǎopéngyǒumen, nǐmen hǎo!'), img: ch.bo_leo.img }],
        con: 'Nghe câu tiếng Anh, nói câu tiếng Trung của nhân vật.', note: ['Nhắc lại Greeting bằng tiếng Trung.'] },
      { k: 4, id: 'the-zh', type: 'flash', t: '图卡 · 身体', p: 3, lang: 'zh', mode: 'ts', cards: cards(W, ['body', 'hair', 'long', 'town', 'The man is very tall.', 'arm', 'leg', 'finger', 'toe', 'shoulder']), con: 'Nghe, nhắc, chạm bộ phận.', note: ['Như khối tiếng Anh.'] },
      book({ k: 4, id: 'truyen-zh', t: '故事 · 身体表演 (phần 1–3)', p: 6, lang: 'zh', title: 'The Body Show', title_zh: '身体表演', pages: S4, con: 'Nghe lượt tiếng Trung, làm theo lệnh.', note: ['Xiaomei kể.'] }),
      { k: 4, id: 'zuo', type: 'says', t: '做一做 · 摸一摸', p: 4, who: 'xiaomei', lua: true, cmds: TOUCH, con: 'Làm theo lệnh tiếng Trung.', note: ['Chỉ Xiaomei.'] },
      { k: 4, id: 'cau', type: 'cau', t: 'Cầu nối', p: 3,
        pairs: [{ ...L('Touch your knees!', '摸摸膝盖！', 'Mōmō xīgài!'), img: W.knee.img, gk: 'Tiếng Trung không cần "your": 摸摸 + bộ phận.' }, { ...L('Five fingers!', '五个手指！', 'Wǔ ge shǒuzhǐ!'), img: W.finger.img, gk: 'Tiếng Trung có 个 giữa số và vật.' }],
        con: 'Tìm chỗ khác nhau.', note: ['Cô hỏi, con tìm.'] },

      { k: 5, id: 'chu', type: 'chu', t: 'Chữ và âm · buổi 2', p: 7, cols: [
          { h: 'Thanh 4 (đi xuống) ˋ', big: 'ˋ', small: 'Tay chặt xuống: 再 zài · 见 jiàn' }, { h: 'Âm /a/ 🐜', big: 'a', small: 'a – ant · ôn s' },
          { h: 'Bảng con · tiếng Anh', words: ['arm', 'leg', 'toe'] }, { h: 'Bảng con · tiếng Trung', zh: true, words: ['个', '子'] }],
        con: 'Vẽ thanh, nói âm, viết bảng con.', note: ['Ôn thanh 1 và âm s trước.'] },

      { k: 6, id: 'ghep-u1', type: 'chon', t: 'Nghe truyện Greeting · ghép tranh', p: 6, lang: 'en', xep: true, items: S1.filter((_, i) => [1, 2, 7, 9, 11, 13].includes(i)), con: 'Nghe câu, xếp tranh theo truyện.', note: ['Nhắc lại U1 bằng xếp tranh.'] },
      { k: 6, id: 'lam', type: 'lam', t: 'Thủ công · ' + u.craft.name + ' (bước 1)', p: 7, off: true, img: W.body.img, ten: u.craft.name, mat: u.craft.mat, steps: u.craft.steps,
        line: L('This is my body.', '这是我的身体。', 'Zhè shì wǒ de shēntǐ.'), con: 'Tô, cắt các bộ phận, nói tên khi làm.', note: ['Tắt chiếu. Buổi 2 làm bước 1–2; buổi 3 ghép ghim và chơi.'], print: [pr('sd', '#/u/1/craft', 'Người giấy cử động')] },

      tong(2, [L('This is my body.', '这是我的身体。', 'Zhè shì wǒ de shēntǐ.'), L('Touch your knees!', '摸摸膝盖！', 'Mōmō xīgài!'), L('Five fingers!', '五个手指！', 'Wǔ ge shǒuzhǐ!')], [7, 8, 9], 'arm, leg, toe · 个, 子'),
      veCuoi,
      { k: 7, id: 'du', type: 'says', t: 'Còn thời gian · Leo says', p: 3, du: true, lua: true, cmds: TOUCH, con: 'Làm theo lệnh.', note: ['Màn dự phòng.'] },
    ] };

  const DIEN_U1 = S1.filter(s => ['bong', 'lan', 'ong', 'kids', 'leo'].includes(s.who));
  const b3 = { t: 'Buổi 3 · Unit 1 Produce · Unit 4 Practice', vai: 'nghe', days: [7, 8, 9], next: [10, 11],
    about: 'Body phần 4; luyện Body (gọi lại, phiên dịch nhí); Greeting: con diễn rối theo nhóm, chấm 4 đầu ra. Cô nghe con.',
    KHOI: K(8, 28, 38, 58, 65, 'Đầu ra (Produce)'), MAN: [
      { k: 1, id: 've-dau', type: 've', t: 'Vè chào đầu buổi', p: 3, lines: VE_DAU, img: '../seedling/tai-nguyen/canh/u1/p2_2.webp', con: 'Cả lớp tự hát.', note: ['Không đọc mẫu.'] },
      { k: 1, id: 'hoi-web', type: 'chon', t: 'Hỏi lại web · ngày 7–9', p: 3, lang: 'xen', game: true, items: cards(W, ['clap your hands', 'stamp your feet', 'fun', 'toe', 'knee', 'shoulder']), con: 'Nghe (hai tiếng xen kẽ), chạm tranh.', note: ['3–4 lượt.'] },
      { k: 1, id: 'nep', type: 'move', t: 'Nếp lớp 3 · thuyết trình', p: 2, cmds: [L('Stand up, please.', '请站起来。', 'Qǐng zhàn qǐlái.', { ic: '🧍' }), L('Look at me!', '看我！', 'Kàn wǒ!', { ic: '👀' }), L('Well done!', '真棒！', 'Zhēn bàng!', { ic: '👏' })],
        con: 'Đứng thẳng, nhìn bạn, nói to; khán giả vỗ tay.', note: ['Nếp lớp 3: cách đứng nói trước lớp.'] },

      book({ k: 2, id: 'truyen-en', t: 'Truyện · The Body Show (phần 4)', p: 5, lang: 'en', title: 'The Body Show', title_zh: '身体表演', pages: S4b, con: 'Nghe, làm động tác, nói câu nhân vật.', hoi: ['"What does Bông say?" – Sorry, Grandpa!'], note: ['Giới thiệu nhanh phần 4.'] }),
      { k: 2, id: 'the-up', type: 'flash', t: 'Thẻ úp đoán', p: 4, lang: 'en', mode: 'sts', cards: cards(W, ['clap your hands', 'stamp your feet', 'it\'s fun', 'arm', 'leg', 'knee', 'shoulder', 'toe']), con: 'Đoán thẻ, nói trước khi cô nói.', note: ['Chế độ "Con trước": thẻ hiện "?" 3 giây, con đoán theo tranh.'] },
      { k: 2, id: 'ra-lenh', type: 'says', t: 'Con ra lệnh · Touch your …!', p: 4, who: 'leo', cmds: TOUCH, con: 'Một con ra lệnh, cả lớp làm.', note: ['Con làm Leo, chọn thẻ bên phải và nói lệnh.'] },
      { k: 2, id: 'doi-ban', type: 'cua', t: 'Đôi bạn Greeting · tự nói', p: 6, lang: 'en', items: GREET, game: true, con: 'Đôi bạn tự nói, không có mẫu.', note: ['Cô chỉ bấm 👀 sau khi đôi nói xong.'] },

      { k: 3, id: 've-body', type: 've', t: 'Vè Body Show', p: 4, lines: VE_BODY, img: W.body.img, lang: 'en', con: 'Cả lớp tự hát, làm động tác.', note: ['Hát cả hai tiếng.'] },
      { k: 3, id: 'rong', type: 'move', t: 'Rồng lửa theo đội', p: 6, cmds: [CMD.stamp, CMD.clap, CMD.jump, CMD.touchHead], con: 'Đội xếp hàng làm rồng, làm theo lệnh.', note: ['Đội Cún, đội Mèo xếp hàng tay đặt vai bạn; đầu rồng nghe lệnh rồi cả rồng làm.'] },

      book({ k: 4, id: 'truyen-zh', t: '故事 · 身体表演 (phần 4)', p: 5, lang: 'zh', title: 'The Body Show', title_zh: '身体表演', pages: S4b, con: 'Nghe, nói câu nhân vật.', note: ['Xiaomei kể phần 4.'] }),
      { k: 4, id: 'memory', type: 'flash', t: 'Memory · tranh – chữ Hán', p: 5, lang: 'zh', mode: 'sts', cards: cards(W, ['clap your hands', 'stamp your feet', 'fun', 'mouth', 'arm', 'leg']), con: 'Nhìn tranh, nói tiếng Trung; ghép thẻ mini tranh – chữ.', note: ['Dùng thẻ mini in (tranh / chữ Trung) chơi Memory theo đội; màn để kiểm tra.'], print: [pr('sd', '#/u/1/mini', 'Thẻ mini')] },
      { k: 4, id: 'pdn', type: 'cau', t: 'Phiên dịch nhí · không mẫu', p: 6, pdn: true, game: true,
        pairs: [{ ...L('Good morning, Mrs Lan!', 'Lan老师，早上好！', 'Lan lǎoshī, zǎoshang hǎo!'), img: W['Mrs Lan'].img }, { ...L('Sorry, Leo!', '对不起，Leo！', 'Duìbuqǐ, Leo!'), img: ch.leo.img },
          { ...L('See you tomorrow!', '明天见！', 'Míngtiān jiàn!'), img: W['See you tomorrow!'].img }, { ...L('Clap your hands!', '拍拍手！', 'Pāipāi shǒu!'), img: W['clap your hands'].img },
          { ...L('It\'s fun!', '真好玩！', 'Zhēn hǎowán!'), img: W.fun.img }],
        con: 'Từng con nói lại cho Xiaomei.', note: ['Greeting 3 câu, Body 2 câu. Gọi từng con.'] },

      { k: 5, id: 'chu', type: 'chu', t: 'Chữ và âm · buổi 3', p: 7, cols: [
          { h: 'Ôn âm', big: 's · a', small: 'sorry · ant' }, { h: 'Ôn thanh', big: 'ˉ ˋ', small: '妈 mā · 再 zài' },
          { h: 'Bảng con · tiếng Anh', words: ['fun', 'clap', 'stamp'] }, { h: 'Bảng con · tiếng Trung', zh: true, words: ['手', '好'] }],
        con: 'Ôn, viết bảng con.', note: ['Bảng con 4′.'] },

      { k: 6, id: 'dien-u1', type: 'dien', t: 'Diễn rối · Good Morning, Mrs Lan!', p: 8, lang: 'en', hide: true, img: CLS, roles: ['bong', 'lan', 'ong', 'kids', 'leo'].map(k => ch[k]), lines: DIEN_U1,
        con: 'Nhóm 3 diễn rối, tự nói lời nhân vật (chấm phiếu đánh giá).', note: ['Lời che sẵn. Mỗi nhóm diễn 1 lượt tiếng Anh, 1 lượt tiếng Trung (bấm đổi tiếng).', 'Chấm 4 đầu ra Unit 1 (giao tiếp, đọc, thuyết trình, viết), 0–2 điểm mỗi đầu ra, ghi vào Bảng của cô.'] },
      { k: 6, id: 'body-show', type: 'chao', t: 'Body Show nhỏ với người giấy', p: 5, img: W.body.img, lines: [L('This is my body.', '这是我的身体。', 'Zhè shì wǒ de shēntǐ.'), L('Touch your knees!', '摸摸膝盖！', 'Mōmō xīgài!')],
        con: 'Cầm người giấy, giới thiệu "This is my body", ra một lệnh cho lớp.', note: ['Từng con lên 30 giây, khán giả làm theo lệnh của bạn.'] },
      { k: 6, id: 'kt', type: 'kt', t: 'Phiếu cuối unit · nghe và khoanh', p: 4, items: u.check.map(c => ({ say: c, opts: c.opts.map(r), ans: c.ans })),
        con: 'Nghe, khoanh tranh đúng.', note: ['Phát phiếu in, đọc mỗi câu 2 lần. Thu phiếu.'], print: [pr('sd', '#/u/1/check', 'Phiếu cuối Unit 1')] },

      tong(3, [L('Sorry, Grandpa!', '对不起，爷爷！', 'Duìbuqǐ, yéye!'), L('It\'s fun!', '真好玩！', 'Zhēn hǎowán!'), L('See you tomorrow!', '明天见！', 'Míngtiān jiàn!')], [10, 11], 'fun, clap, stamp · 手, 好'),
      veCuoi,
      { k: 7, id: 'du', type: 'cau', t: 'Còn thời gian · Phiên dịch nhí', p: 3, du: true, pdn: true, pairs: [{ ...L('Touch your shoulders!', '摸摸肩膀！', 'Mōmō jiānbǎng!'), img: W.shoulder.img }], con: 'Nói cho Xiaomei.', note: ['Màn dự phòng.'] },
    ] };
  return { ten: 'Seedling', sau: 'Unit 2 (buổi 4–7): làm sau khi chị duyệt Unit 1', buoi: { 1: b1, 2: b2, 3: b3 } };
}

module.exports = { NOI, lv: { ls: littleSeed(), sd: seedling() } };
