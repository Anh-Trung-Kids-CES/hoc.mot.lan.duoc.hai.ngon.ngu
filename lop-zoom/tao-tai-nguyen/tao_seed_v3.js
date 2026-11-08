/* Sinh lop-zoom/lz-seed-v3.js – nội dung Lớp Zoom Little Seed · Vòng 3 "Gia đình" (Zoom ngày 21).
   Chỉ dùng tranh và giọng đã có trong web học 21 ngày (xem-truoc/tai-nguyen/little-seed/), không tạo thêm bằng Gemini.
   Nội dung lấy đúng các ngày 15–20 của web học: 8 từ, 6 cụm "my …", 8 câu truyện "Album ảnh nhà Bông", chữ 他 她.
   Lưu ý tiếng Trung: 他 và 她 cùng đọc tā, nên KHÔNG có câu nghe tiếng Trung bắt con phân biệt he / she
   (chỉ phân biệt bằng tiếng Anh hoặc bằng nhìn chữ, đúng mục tiêu ngày 18–19).
   Chạy: node lop-zoom/tao-tai-nguyen/tao_seed_v3.js  (báo lỗi nếu câu nào chưa có file giọng hoặc tranh) */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..'), XT = path.join(ROOT, 'xem-truoc');
const AUD = 'tai-nguyen/little-seed/audio/', IMG = 'tai-nguyen/little-seed/img/';
const miss = [];
const has = p => fs.existsSync(path.join(XT, p));
function a(f) { const p = AUD + f + '.mp3'; if (!has(p)) miss.push('giọng: ' + p); return p; }
/* tranh có 3 kiểu vẽ (_l1, _l2, _l3) như Vòng 2, hoặc một tranh cảnh truyện cố định */
function imV(base) { [1, 2, 3].forEach(v => { const p = IMG + base + '_l' + v + '.webp'; if (!has(p)) miss.push('tranh: ' + p); }); return { im: IMG + base, v: 1 }; }
function imF(name) { const p = IMG + name + '.webp'; if (!has(p)) miss.push('tranh: ' + p); return { im: p, v: 0 }; }

/* ---------- từ, cụm, câu của Vòng 3 (khớp thẻ học ngày 15–20) ---------- */
const SRC = {
  // 8 từ (giọng cô Hươu)
  grandpa: ['grandpa', '爷爷', 'yéye', imV('v3_n15_tu_grandpa'), 'ls_co_huou_en_grandpa', 'ls_co_huou_zh_037'],
  grandma: ['grandma', '奶奶', 'nǎinai', imV('v3_n15_tu_grandma'), 'ls_co_huou_en_grandma', 'ls_co_huou_zh_038'],
  bro:     ['big brother', '哥哥', 'gēge', imV('v3_n16_tu_big_brother'), 'ls_co_huou_en_big_brother', 'ls_co_huou_zh_042'],
  lsis:    ['little sister', '妹妹', 'mèimei', imV('v3_n16_tu_little_sister'), 'ls_co_huou_en_little_sister', 'ls_co_huou_zh_043'],
  bsis:    ['big sister', '姐姐', 'jiějie', imV('v3_n17_tu_big_sister'), 'ls_co_huou_en_big_sister', 'ls_co_huou_zh_048'],
  lbro:    ['little brother', '弟弟', 'dìdi', imV('v3_n17_tu_little_brother'), 'ls_co_huou_en_little_brother', 'ls_co_huou_zh_049'],
  he:      ['he', '他', 'tā', imV('v3_n18_tu_he'), 'ls_co_huou_en_he', 'ls_co_huou_zh_054'],
  she:     ['she', '她', 'tā', imV('v3_n18_tu_she'), 'ls_co_huou_en_she', 'ls_co_huou_zh_055'],
  // tranh gây nhiễu cho câu nhìn chữ 他 / 她 (từ Vòng 2, web học ngày 15 cũng dùng)
  six:     ['six', '六', 'liù', imV('v2_n11_tu_six'), 'ls_co_huou_en_six', 'ls_co_huou_zh_033'],
  // 6 cụm "my …"
  m_gpa:  ['my grandpa', '我爷爷', 'wǒ yéye', imV('v3_n15_cum_my_grandpa'), 'ls_bong_en_my_grandpa', 'ls_bong_zh_019'],
  m_gma:  ['my grandma', '我奶奶', 'wǒ nǎinai', imV('v3_n15_cum_my_grandma'), 'ls_bong_en_my_grandma', 'ls_anna_zh_021'],
  m_bro:  ['my big brother', '我哥哥', 'wǒ gēge', imV('v3_n16_cum_my_big_brother'), 'ls_bong_en_my_big_brother', 'ls_bong_zh_021'],
  m_lsis: ['my little sister', '我妹妹', 'wǒ mèimei', imV('v3_n16_cum_my_little_sister'), 'ls_bong_en_my_little_sister', 'ls_bong_zh_022'],
  m_bsis: ['my big sister', '我姐姐', 'wǒ jiějie', imV('v3_n17_cum_my_big_sister'), 'ls_anna_en_my_big_sister', 'ls_anna_zh_023'],
  m_lbro: ['my little brother', '我弟弟', 'wǒ dìdi', imV('v3_n17_cum_my_little_brother'), 'ls_anna_en_my_little_brother', 'ls_anna_zh_024'],
  // câu hỏi (tranh câu riêng của ngày 18)
  q_he:  ['Who is he?', '他是谁？', 'Tā shì shéi?', imV('v3_n18_cum_who_is_he'), 'ls_anna_en_who_is_he', 'ls_anna_zh_017'],
  q_she: ['Who is she?', '她是谁？', 'Tā shì shéi?', imV('v3_n18_cum_who_is_she'), 'ls_anna_en_who_is_she', 'ls_anna_zh_018'],
  // câu trả lời (tranh cảnh truyện "Album ảnh nhà Bông")
  s_gpa:  ['He is my grandpa.', '他是我爷爷。', 'Tā shì wǒ yéye.', imF('tr3_c2'), 'ls_bong_en_he_is_my_grandpa', 'ls_bong_zh_015'],
  s_gma:  ['She is my grandma.', '她是我奶奶。', 'Tā shì wǒ nǎinai.', imF('tr3_c4'), 'ls_bong_en_she_is_my_grandma', 'ls_bong_zh_016'],
  s_bro:  ['He is my big brother.', '他是我哥哥。', 'Tā shì wǒ gēge.', imF('tr3_c5'), 'ls_bong_en_he_is_my_big_brother', 'ls_bong_zh_017'],
  s_lsis: ['She is my little sister.', '她是我妹妹。', 'Tā shì wǒ mèimei.', imF('tr3_c6'), 'ls_bong_en_she_is_my_little_sister', 'ls_bong_zh_018'],
  s_bsis: ['She is my big sister.', '她是我姐姐。', 'Tā shì wǒ jiějie.', imF('tr3_c7'), 'ls_anna_en_she_is_my_big_sister', 'ls_anna_zh_019'],
  s_lbro: ['He is my little brother.', '他是我弟弟。', 'Tā shì wǒ dìdi.', imF('tr3_c8'), 'ls_anna_en_he_is_my_little_brother', 'ls_anna_zh_020'],
};
const W = {};
Object.entries(SRC).forEach(([k, [en, zh, py, img, ea, za]]) => { W[k] = { en, zh, py, im: img.im, v: img.v, ea: a(ea), za: a(za) }; });

/* ---------- Truyện "Album ảnh nhà Bông" (8 cảnh, đúng giọng nhân vật của web học) ---------- */
const STORY = [
  ['tr3_c1', 'q_he', 'ls_anna_en_who_is_he', 'ls_anna_zh_017'],
  ['tr3_c2', 's_gpa'], ['tr3_c3', 'q_she', 'ls_anna_en_who_is_she', 'ls_anna_zh_018'], ['tr3_c4', 's_gma'],
  ['tr3_c5', 's_bro'], ['tr3_c6', 's_lsis'], ['tr3_c7', 's_bsis'], ['tr3_c8', 's_lbro'],
].map(([img, k]) => ({ img: imF(img).im, en: W[k].en, zh: W[k].zh, ea: W[k].ea, za: W[k].za }));

/* ---------- Ôn nhanh: 10 câu, khó dần: từ → he/she → cụm → câu → nhìn chữ (4 EN, 4 ZH, 2 nhìn chữ) ---------- */
const QUIZ = [
  { k: 'grandpa', l: 'en', o: ['grandma', 'grandpa', 'bro'] },
  { k: 'bsis', l: 'zh', o: ['bsis', 'lsis', 'grandma'] },
  { k: 'lbro', l: 'en', o: ['bro', 'lsis', 'lbro'] },
  { k: 'grandma', l: 'zh', o: ['grandma', 'bsis', 'grandpa'] },
  { k: 'she', l: 'en', o: ['he', 'she', 'six'] },
  { k: 'm_bro', l: 'zh', o: ['m_lsis', 'm_bro', 'm_gpa'] },
  { k: 's_lsis', l: 'en', o: ['s_lsis', 's_bsis', 's_gma'] },
  { k: 's_gpa', l: 'zh', o: ['s_bro', 's_lbro', 's_gpa'] },
  { k: 'she', l: 'doc', chu: '她', a: 'zh', o: ['he', 'six', 'she'] },
  { k: 'he', l: 'doc', chu: '他', a: 'zh', o: ['he', 'she', 'six'] },
];

/* ---------- Máy bay thanh điệu: từ lặp đọc tiếng đầu theo thanh, tiếng sau đọc nhẹ.
   Con nghe cả từ, chọn đường bay của TIẾNG ĐẦU (chữ đầu sáng hơn trên màn). 他 / 她 thanh 1. ---------- */
const TONES = [
  { k: 'bro', c: '哥哥', py: 'gēge', p0: 'gege', t: 1 },
  { k: 'grandpa', c: '爷爷', py: 'yéye', p0: 'yeye', t: 2 },
  { k: 'grandma', c: '奶奶', py: 'nǎinai', p0: 'nainai', t: 3 },
  { k: 'lsis', c: '妹妹', py: 'mèimei', p0: 'meimei', t: 4 },
  { k: 'bsis', c: '姐姐', py: 'jiějie', p0: 'jiejie', t: 3 },
  { k: 'lbro', c: '弟弟', py: 'dìdi', p0: 'didi', t: 4 },
  { k: 'he', c: '他', py: 'tā', p0: 'ta', t: 1 },
  { k: 'she', c: '她', py: 'tā', p0: 'ta', t: 1 },
];

/* ---------- Đọc theo cô (6 lượt, chỉ từ có tranh rõ nghĩa; không dùng he/she vì 他/她 cùng âm) ---------- */
const DTC = [
  { k: 'grandpa', o: ['grandma', 'grandpa', 'lbro'] },
  { k: 'bsis', o: ['lsis', 'bsis', 'bro'] },
  { k: 'lbro', o: ['lbro', 'bro', 'grandpa'] },
  { k: 'grandma', o: ['bsis', 'grandma', 'lsis'] },
  { k: 'bro', o: ['bro', 'lbro', 'grandpa'] },
  { k: 'lsis', o: ['grandma', 'bsis', 'lsis'] },
];
/* Đôi bạn / Cô giáo nhỏ (giữ cho phòng cũ): từ và cụm */
const PAIR_POOL = DTC.concat([
  { k: 'm_gma', o: ['m_gma', 'm_bsis', 'm_lsis'] },
  { k: 'm_lbro', o: ['m_bro', 'm_lbro', 'm_gpa'] },
  { k: 's_bsis', o: ['s_lsis', 's_gma', 's_bsis'] },
  { k: 's_bro', o: ['s_bro', 's_lbro', 's_gpa'] },
]);

/* ---------- Nói theo cô: từ → cụm → câu ---------- */
const NOI = [].concat(
  ['grandpa', 'grandma', 'bro', 'lsis', 'bsis', 'lbro', 'he', 'she'].map(k => ({ k, g: 'tu' })),
  ['m_gpa', 'm_gma', 'm_bro', 'm_lsis', 'm_bsis', 'm_lbro'].map(k => ({ k, g: 'cum' })),
  ['q_he', 's_gpa', 'q_she', 's_gma'].map(k => ({ k, g: 'cau' })));

/* ---------- Nghe truyện, xếp tranh ---------- */
const XEP = [
  { title: 'Album ảnh nhà Bông (phần 1): ông, bà', from: 'en', to: 'zh', s: [0, 1, 2, 3] },
  { title: 'Album ảnh nhà Bông (phần 2): anh chị em', from: 'zh', to: 'en', s: [4, 5, 6, 7] },
];

/* ---------- Cô nói, con nói tiếng kia: mỗi bạn một tranh cảnh truyện, hỏi rồi trả lời ---------- */
const CN = [
  { img: 1, k: ['q_he', 's_gpa'] }, { img: 3, k: ['q_she', 's_gma'] }, { img: 4, k: ['q_he', 's_bro'] },
  { img: 5, k: ['q_she', 's_lsis'] }, { img: 6, k: ['q_she', 's_bsis'] }, { img: 7, k: ['q_he', 's_lbro'] },
];

/* ---------- Rồng Lửa ---------- */
const CATS = {
  fam: ['grandpa', 'grandma', 'bro', 'lsis', 'bsis', 'lbro'],
  my: ['m_gpa', 'm_gma', 'm_bro', 'm_lsis', 'm_bsis', 'm_lbro'],
  cau: ['s_gpa', 's_gma', 's_bro', 's_lsis', 's_bsis', 's_lbro'],
  pro: ['he', 'she', 'six'],
};

/* ---------- kiểm tra ---------- */
const used = new Set(Object.keys(W));
[QUIZ, DTC, PAIR_POOL].forEach(list => list.forEach(q => {
  q.o.forEach(k => { if (!W[k]) miss.push('thiếu khoá ' + k); });
  if (q.o.indexOf(q.k) < 0) miss.push('đáp án không nằm trong lựa chọn: ' + q.k);
  const ims = q.o.map(k => W[k].im); if (new Set(ims).size < ims.length) miss.push('trùng tranh trong một câu: ' + q.o.join(','));
}));
/* 他 / 她 cùng âm tā: câu nghe tiếng Trung không được đặt he và she cạnh nhau */
const HS = ['he', 'she', 'q_he', 'q_she'];
QUIZ.filter(q => q.l === 'zh').forEach(q => { if (q.o.filter(k => HS.includes(k)).length > 1) miss.push('câu nghe tiếng Trung có cả he/she: ' + q.k); });
if (miss.length) { console.error('Chưa đủ tài nguyên / nội dung chưa hợp lệ:\n' + miss.join('\n')); process.exit(1); }

/* ---------- ghi tệp ---------- */
const rel = p => p ? '../xem-truoc/' + p : '';
const WOUT = {};
used.forEach(k => { const w = W[k]; WOUT[k] = { en: w.en, zh: w.zh, py: w.py, im: rel(w.im), v: w.v, ea: rel(w.ea), za: rel(w.za) }; });
const SOUT = STORY.map(s => ({ img: rel(s.img), en: s.en, zh: s.zh, ea: rel(s.ea), za: rel(s.za) }));
const J = v => JSON.stringify(v);
const out = `/* Lớp Zoom – nội dung Little Seed · Vòng 3 "Gia đình – Album ảnh nhà Bông" (Zoom ngày 21).
   TỆP SINH TỰ ĐỘNG từ tao-tai-nguyen/tao_seed_v3.js – sửa nội dung ở tệp đó rồi chạy lại.
   Tranh và giọng lấy từ web học 21 ngày (xem-truoc/tai-nguyen/little-seed/), đúng các ngày 15–20, không tạo thêm bằng Gemini.
   Chỉ chạy khi trang mở với ?lop=seed-v3: gán lại các biến nội dung của lz-core.js (Vòng 2 và Canopy giữ nguyên).
   Mạch buổi, luật và cách chấm giữ y như bản cuối của Little Seed Vòng 2. */
if (LZ_LOP === 'seed-v3') (function () {
  W = ${J(WOUT)};
  /* từ và cụm có 3 kiểu vẽ (_l1 _l2 _l3) như Vòng 2; câu dùng tranh cảnh truyện */
  pic = function (k, v) { const w = W[k]; return w.v ? w.im + '_l' + (v || 2) + '.webp' : w.im; };
  aud = function (k, l) { const w = W[k]; return (w && (l === 'zh' ? w.za : w.ea)) || ''; };
  txt = function (k, l) { return l === 'zh' ? W[k].zh : W[k].en; };

  QUIZ = ${J(QUIZ)};
  quizPics = function (q) { return q.o.map(k => pic(k, 2)); };
  quizAudio = function (q) { return q.audio || aud(q.k, q.l === 'doc' ? q.a : q.l); };

  TONES = ${J(TONES)};
  toneAudio = function (x) { return aud(x.k, 'zh'); };
  tonePic = function (x) { return pic(x.k, 1); };
  TONE_TIP = 'Từ lặp (哥哥, 爷爷, 奶奶, 妹妹, 姐姐, 弟弟): tiếng đầu đọc đúng thanh, tiếng sau đọc nhẹ. Con chọn đường bay của <b>tiếng đầu</b>. 他 và 她 cùng đọc <b>tā</b> (bay ngang).';

  PAIR_POOL = ${J(PAIR_POOL)};
  DTC_SEED = ${J(DTC)};
  NOI = ${J(NOI)};

  STORY = ${J(SOUT)};
  STORY_TITLE = 'Album ảnh nhà Bông';
  sceneImg = function (i) { return STORY[i].img; };
  sceneAud = function (i, l) { return l === 'zh' ? STORY[i].za : STORY[i].ea; };
  GIFTS = [{ s: 1, from: 'en' }, { s: 3, from: 'zh' }, { s: 5, from: 'en' }, { s: 7, from: 'zh' }];
  XEP = ${J(XEP)}.map(r => ({ title: r.title, from: r.from, to: r.to, scenes: r.s.map(i => STORY[i]) }));

  const CN = ${J(CN)};
  cnSets = function () { return CN.map(c => ({ img: STORY[c.img].img, lines: c.k.map(cnLine) })); };

  /* Chào bạn mới: con mời một người trong nhà (hoặc giơ ảnh) ra camera, cả lớp hỏi Who is he? / Who is she? */
  INTRO = {
    lb: ['Hỏi "he"', 'Hỏi "she"'], ve: ['hỏi người nam', 'hỏi người nữ'],
    ask: { en: { t: W.q_he.en, a: W.q_he.ea }, zh: { t: W.q_he.zh, a: W.q_he.za } },
    model: { en: { t: 'He is my …', a: W.s_gpa.ea }, zh: { t: '他是我…', a: W.s_gpa.za } },
    dad: {
      ask: { en: { t: W.q_she.en, a: W.q_she.ea }, zh: { t: W.q_she.zh, a: W.q_she.za } },
      model: { en: { t: 'She is my …', a: W.s_gma.ea }, zh: { t: '她是我…', a: W.s_gma.za } }
    },
    tip: 'Trước buổi nhắn ba mẹ: đến lượt con, con mời <b>một người trong nhà</b> ra camera (ông, bà, anh, chị, em, ba, mẹ) hoặc giơ <b>ảnh gia đình</b>. Cô bấm "he" nếu là người nam, "she" nếu là người nữ. Cả lớp hỏi, con giới thiệu: <b>He is my grandpa.</b> / <b class="zh">她是我妈妈。</b> Ba, mẹ (daddy 爸爸, mommy 妈妈 – Vòng 1) cũng được. Con nói tiếng nào cũng khen; con nói được thì cô hỏi thêm bằng tiếng kia. Không có ai bên cạnh thì con chỉ vào tranh trên màn chiếu.'
  };

  BOSS = Object.assign({}, BOSS, { story: '⚔️ Rồng Lửa nghịch ngợm giấu mất album ảnh nhà Bông! Cả lớp tiếp sức cho anh hùng Bông tìm lại nhé!' });
  const CATS = ${J(CATS)};
  BOSS_ITEMS = [];
  ['fam', 'my', 'cau'].forEach(c => CATS[c].forEach(k => ['en', 'zh'].forEach(l => BOSS_ITEMS.push({ k, l, cat: CATS[c] }))));
  /* he / she: chỉ tiếng Anh và nhìn chữ (tiếng Trung cùng âm tā) */
  ['he', 'she'].forEach(k => { BOSS_ITEMS.push({ k, l: 'en', cat: CATS.pro }); BOSS_ITEMS.push({ k, l: 'doc', chu: W[k].zh, cat: CATS.pro }); });
})();
`;
fs.writeFileSync(path.join(ROOT, 'lop-zoom', 'lz-seed-v3.js'), out);
console.log('Đã ghi lz-seed-v3.js:', Object.keys(WOUT).length, 'từ/câu,', QUIZ.length, 'câu ôn,', TONES.length, 'thanh điệu,', DTC.length, 'lượt Đọc theo cô, Rồng Lửa có', (CATS.fam.length + CATS.my.length + CATS.cau.length) * 2 + 4, 'câu');
