/* Sinh lop-zoom/lz-canopy.js – nội dung Lớp Zoom Canopy · Vòng 2 "Jobs – Ghé thăm nơi làm việc".
   Chỉ dùng tranh và giọng đã có trong web học 21 ngày (xem-truoc/tai-nguyen/canopy/), không tạo thêm bằng Gemini.
   Chạy: node lop-zoom/tao-tai-nguyen/tao_canopy_v2.js  (báo lỗi nếu câu nào chưa có file giọng hoặc tranh) */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..'), XT = path.join(ROOT, 'xem-truoc');
global.window = {}; require(path.join(XT, 'tai-nguyen/canopy-audio-map.js'));
const MAP = window.CN_AUDIO;
const key = t => String(t).replace(/’/g, "'").replace(/[\s，。！？、,.!?：:;；“”"…()（）\-–—]/g, '').toLowerCase();
const miss = [];
function voice(l, t, who) {
  const c = MAP[l + '|' + key(t)];
  if (!c || !c.length) { miss.push(l + ': ' + t); return ''; }
  const f = w => (c.find(e => e[0] === w) || [])[1];
  return (who && f(who)) || f('co_huou') || c[0][1];
}
function img(name) {
  const p = 'tai-nguyen/canopy/img/' + name + '.webp';
  if (!fs.existsSync(path.join(XT, p))) miss.push('tranh: ' + p);
  return p;
}

/* ---------- từ, cụm, câu của Vòng 2 (khớp thẻ học các ngày 1–6) ---------- */
const SRC = {
  // nghề
  teacher:  ['teacher', '老师', 'lǎoshī', 'v2_d1_w_teacher'],
  student:  ['student', '学生', 'xuéshēng', 'v2_d1_w_student'],
  doctor:   ['doctor', '医生', 'yīshēng', 'v2_d1_w_doctor'],
  chef:     ['chef', '厨师', 'chúshī', 'v2_d1_w_chef'],
  dentist:  ['dentist', '牙医', 'yáyī', 'v2_d1_w_dentist'],
  driver:   ['driver', '司机', 'sījī', 'v2_d1_w_driver'],
  employee: ['employee', '员工', 'yuángōng', 'v2_d2_w_employee'],
  // nơi làm việc
  hospital:   ['hospital', '医院', 'yīyuàn', 'v2_d2_w_hospital'],
  school:     ['school', '学校', 'xuéxiào', 'v1_d1_w_school'],
  restaurant: ['restaurant', '饭店', 'fàndiàn', 'v1_d1_w_restaurant'],
  shop:       ['shop', '商店', 'shāngdiàn', 'v1_d1_w_shop'],
  work:       ['work', '工作', 'gōngzuò', 'v2_d2_w_work'],
  // người thân
  dad:     ['dad', '爸爸', 'bàba', 'v2_d3_w_dad'],
  mom:     ['mom', '妈妈', 'māma', 'v2_d3_w_mom'],
  brother: ['older brother', '哥哥', 'gēge', 'v2_d3_w_older_brother'],
  sister:  ['older sister', '姐姐', 'jiějie', 'v2_d3_w_older_sister'],
  // cụm "làm ở…"
  wah: ['work at a hospital', '在医院工作', 'zài yīyuàn gōngzuò', 'v2_d2_p_work_at_a_hospital'],
  was: ['work at a school', '在学校工作', 'zài xuéxiào gōngzuò', 'v2_d1_s2'],
  war: ['work at a restaurant', '在饭店工作', 'zài fàndiàn gōngzuò', 'v2_d2_p_work_at_a_restaurant'],
  wsh: ['work at a shop', '在商店工作', 'zài shāngdiàn gōngzuò', 'v2_d2_p_work_at_a_shop'],
  // câu
  q_mom:  ['What does your mom do?', '你妈妈做什么工作？', 'Nǐ māma zuò shénme gōngzuò?', 'v2_d3_s1'],
  s_hT:   ['He is a teacher.', '他是老师。', 'Tā shì lǎoshī.', 'v2_d1_s2'],
  s_mD:   ['My mom is a doctor.', '我妈妈是医生。', 'Wǒ māma shì yīshēng.', 'v2_d3_s2'],
  s_dC:   ['My dad is a chef. He works at a restaurant.', '我爸爸是厨师，他在饭店工作。', 'Wǒ bàba shì chúshī, tā zài fàndiàn gōngzuò.', 'v2_d3_s3'],
  s_emp:  ['She is an employee. She works at a shop.', '她是员工，她在商店工作。', 'Tā shì yuángōng, tā zài shāngdiàn gōngzuò.', 'v2_d2_p_work_at_a_shop'],
  // câu trong truyện của Anna (giọng Anna)
  s_name: ['My name is Anna.', '我叫Anna。', 'Wǒ jiào Anna.', 'v2_d5_story_r1', 'anna'],
  s_dDoc: ['My dad is a doctor.', '我爸爸是医生。', 'Wǒ bàba shì yīshēng.', 'v2_d5_story_r2', 'anna'],
  s_mT:   ['My mom is a teacher.', '我妈妈是老师。', 'Wǒ māma shì lǎoshī.', 'v2_d5_story_r4', 'anna'],
  s_sisC: ['My older sister is a chef.', '我姐姐是厨师。', 'Wǒ jiějie shì chúshī.', 'v2_d2_p_work_at_a_restaurant', 'anna'],
  s_hH:   ['He works at a hospital.', '他在医院工作。', 'Tā zài yīyuàn gōngzuò.', 'v2_d2_p_work_at_a_hospital', 'anna'],
  s_sS:   ['She works at a school.', '她在学校工作。', 'Tā zài xuéxiào gōngzuò.', 'v2_d5_story_r5', 'anna'],
  s_sat:  ['On Saturday evening, we go to the restaurant to eat dinner.', '星期六晚上，我们去饭店吃晚饭。', 'Xīngqīliù wǎnshang, wǒmen qù fàndiàn chī wǎnfàn.', 'v2_d6_story_r6', 'anna'],
  s_love: ['I love my family!', '我爱我家！', 'Wǒ ài wǒ jiā!', 'v2_d6_story_r7', 'anna'],
};
const W = {};
Object.entries(SRC).forEach(([k, [en, zh, py, im, who]]) => {
  W[k] = { en, zh, py, im: img(im), ea: voice('en', en, who), za: voice('zh', zh, who) };
});

/* ---------- Ôn nhanh: 10 câu, khó dần: từ → cụm → câu → đọc chữ (4 EN, 4 ZH, 2 nhìn chữ) ---------- */
const QUIZ = [
  { k: 'doctor', l: 'en', o: ['teacher', 'doctor', 'chef'] },
  { k: 'driver', l: 'zh', o: ['driver', 'dentist', 'student'] },
  { k: 'hospital', l: 'en', o: ['school', 'shop', 'hospital'] },
  { k: 'sister', l: 'zh', o: ['sister', 'brother', 'mom'] },
  { k: 'war', l: 'en', o: ['wsh', 'war', 'wah'] },
  { k: 's_hH', l: 'zh', o: ['s_hH', 's_sS', 's_emp'] },
  { k: 's_mD', l: 'en', o: ['s_mT', 's_dC', 's_mD'] },
  { k: 's_dC', l: 'zh', o: ['s_dC', 's_dDoc', 's_hT'] },
  { k: 'dentist', l: 'doc', chu: '牙医', a: 'zh', o: ['doctor', 'dentist', 'driver'] },
  { k: 'school', l: 'doc', chu: '学校', a: 'zh', o: ['restaurant', 'school', 'hospital'] },
];

/* ---------- Máy bay thanh điệu: từ hai chữ, chọn 1 trong 4 cặp đường bay (31 = thanh 3 rồi thanh 1).
   Tránh thanh nhẹ (爸爸, 妈妈…) và biến điệu thanh 3 + thanh 3. Lựa chọn sai chỉ khác đáp án ở một chữ để con so sánh. ---------- */
const TONES = [
  { k: 'doctor', c: '医生', py: 'yīshēng', p0: 'yisheng', ans: 11, o: [21, 11, 31, 41] },
  { k: 'hospital', c: '医院', py: 'yīyuàn', p0: 'yiyuan', ans: 14, o: [14, 11, 13, 12] },
  { k: 'chef', c: '厨师', py: 'chúshī', p0: 'chushi', ans: 21, o: [11, 31, 21, 41] },
  { k: 'school', c: '学校', py: 'xuéxiào', p0: 'xuexiao', ans: 24, o: [21, 24, 14, 44] },
  { k: 'restaurant', c: '饭店', py: 'fàndiàn', p0: 'fandian', ans: 44, o: [14, 41, 11, 44] },
  { k: 'teacher', c: '老师', py: 'lǎoshī', p0: 'laoshi', ans: 31, o: [31, 21, 11, 34] },
  { k: 'work', c: '工作', py: 'gōngzuò', p0: 'gongzuo', ans: 14, o: [11, 41, 14, 12] },
  { k: 'dentist', c: '牙医', py: 'yáyī', p0: 'yayi', ans: 21, o: [31, 11, 41, 21] },
].map(x => { const t = x.o.indexOf(x.ans) + 1; if (!t) throw new Error('Thiếu đáp án ' + x.c); const r = Object.assign({}, x, { t }); delete r.ans; return r; });

/* ---------- Đôi bạn / Cô giáo nhỏ: bạn nói từ, cụm hoặc câu theo tranh; bạn nghe chạm 1 trong 3 tranh ---------- */
const PAIR_POOL = [
  { k: 'chef', o: ['chef', 'driver', 'teacher'] },
  { k: 'hospital', o: ['shop', 'hospital', 'school'] },
  { k: 's_mT', o: ['s_mT', 's_mD', 's_hH'] },
  { k: 'brother', o: ['sister', 'dad', 'brother'] },
  { k: 'wsh', o: ['wah', 'was', 'wsh'] },
  { k: 's_dDoc', o: ['s_dC', 's_dDoc', 's_mT'] },
  { k: 'dentist', o: ['dentist', 'doctor', 'student'] },
  { k: 'restaurant', o: ['restaurant', 'school', 'shop'] },
  { k: 's_sisC', o: ['s_emp', 's_sS', 's_sisC'] },
  { k: 'mom', o: ['dad', 'mom', 'sister'] },
  { k: 's_hH', o: ['s_hH', 's_sisC', 's_emp'] },
  { k: 'driver', o: ['employee', 'driver', 'chef'] },
];

/* ---------- Truyện của Anna (ngày 5–6) cho phần Nghe truyện, xếp tranh ---------- */
const STORY_KEYS = ['s_name', 's_dDoc', 's_mT', 's_sisC', 's_hH', 's_sS', 's_sat', 's_love'];
const XEP = [
  { title: 'Gia đình Anna (phần 1): ai làm nghề gì?', from: 'en', to: 'zh', keys: STORY_KEYS.slice(0, 4) },
  { title: 'Gia đình Anna (phần 2): làm ở đâu, cuối tuần đi đâu?', from: 'zh', to: 'en', keys: STORY_KEYS.slice(4) },
];

/* ---------- Rồng Lửa: câu ngẫu nhiên từ các nhóm từ, cụm và chữ ---------- */
const CATS = {
  jobs: ['teacher', 'student', 'doctor', 'chef', 'dentist', 'driver', 'employee'],
  places: ['hospital', 'school', 'restaurant', 'shop'],
  fam: ['dad', 'mom', 'brother', 'sister'],
  work: ['wah', 'was', 'war', 'wsh'],
};
const DOC = [['doctor', 'jobs'], ['teacher', 'jobs'], ['chef', 'jobs'], ['driver', 'jobs'], ['hospital', 'places'], ['school', 'places'], ['restaurant', 'places'], ['shop', 'places']];

/* ---------- kiểm tra ---------- */
const used = new Set();
QUIZ.forEach(q => q.o.forEach(k => used.add(k))); PAIR_POOL.forEach(p => p.o.forEach(k => used.add(k)));
used.add('q_mom'); used.add('s_mD'); TONES.forEach(x => used.add(x.k)); STORY_KEYS.forEach(k => used.add(k)); Object.values(CATS).flat().forEach(k => used.add(k));
used.forEach(k => { if (!W[k]) miss.push('thiếu khoá ' + k); });
[QUIZ, PAIR_POOL].forEach(list => list.forEach(q => { if (q.o.indexOf(q.k) < 0) miss.push('đáp án không nằm trong lựa chọn: ' + q.k); const ims = q.o.map(k => W[k].im); if (new Set(ims).size < ims.length) miss.push('trùng tranh trong một câu: ' + q.o.join(',')); }));
if (miss.length) { console.error('Chưa đủ tài nguyên:\n' + miss.join('\n')); process.exit(1); }

/* ---------- ghi tệp ---------- */
const rel = p => p ? '../xem-truoc/' + p : '';
const WOUT = {};
used.forEach(k => { const w = W[k]; WOUT[k] = { en: w.en, zh: w.zh, py: w.py, im: rel(w.im), ea: rel(w.ea), za: rel(w.za) }; });
const J = v => JSON.stringify(v);
const out = `/* Lớp Zoom – nội dung Canopy · Vòng 2 "Jobs – Ghé thăm nơi làm việc" (Zoom ngày 14).
   TỆP SINH TỰ ĐỘNG từ tao-tai-nguyen/tao_canopy_v2.js – sửa nội dung ở tệp đó rồi chạy lại.
   Tranh và giọng lấy từ web học 21 ngày (xem-truoc/tai-nguyen/canopy/), không thêm từ ngoài Vòng 2.
   Chỉ chạy khi trang mở với ?lop=canopy-v2: gán lại các biến nội dung của lz-core.js (Little Seed giữ nguyên).
   Luật giữ như Little Seed: chạm và nói, 3 tranh, giọng cô Hươu dẫn, 3 KHÔNG, không bảng xếp hạng (chỉ thanh năng lượng chung).
   Riêng Canopy: có câu và cụm dài hơn, đọc chữ Hán, thanh điệu từ hai chữ; màn bé không hiện pinyin (chỉ màn cô và màn chiếu lúc hiện đáp án). */
if (LZ_LOP === 'canopy-v2') (function () {
  W = ${J(WOUT)};
  pic = function (k) { return W[k].im; };
  aud = function (k, l) { const w = W[k]; return (w && (l === 'zh' ? w.za : w.ea)) || ''; };
  txt = function (k, l) { return l === 'zh' ? W[k].zh : W[k].en; };

  QUIZ = ${J(QUIZ)};
  quizPics = function (q) { return q.o.map(k => pic(k)); };
  quizAudio = function (q) { return q.audio || aud(q.k, q.l === 'doc' ? q.a : q.l); };

  TONES = ${J(TONES)};
  toneAudio = function (x) { return aud(x.k, 'zh'); };
  tonePic = function (x) { return pic(x.k); };
  /* đường bay hai chặng: mỗi chữ một nửa khung */
  const half = (d, dx) => d.replace(/(-?\\d+(?:\\.\\d+)?) (-?\\d+(?:\\.\\d+)?)/g, (m, x, y) => (x * 0.44 + dx).toFixed(1) + ' ' + y);
  const NAME = { 1: 'ngang', 2: 'lên', 3: 'lượn', 4: 'xuống' };
  TONES.forEach(x => x.o.forEach(c => {
    if (TONE_PATH[c]) return;
    const a = Math.floor(c / 10), b = c % 10;
    TONE_PATH[c] = half(TONE_PATH[a], 2) + ' ' + half(TONE_PATH[b], 54);
    TONE_NAME[c] = NAME[a][0].toUpperCase() + NAME[a].slice(1) + ' + ' + NAME[b];
  }));

  PAIR_POOL = ${J(PAIR_POOL)};

  const SK = ${J(STORY_KEYS)};
  STORY = SK.map(k => ({ img: W[k].im, en: W[k].en, zh: W[k].zh, ea: W[k].ea, za: W[k].za }));
  STORY_TITLE = 'Gia đình Anna';
  sceneImg = function (i) { return STORY[i].img; };
  sceneAud = function (i, l) { return l === 'zh' ? STORY[i].za : STORY[i].ea; };
  GIFTS = [{ s: 1, from: 'en' }, { s: 4, from: 'zh' }, { s: 3, from: 'en' }, { s: 5, from: 'zh' }];
  XEP = ${J(XEP)}.map(r => ({ title: r.title, from: r.from, to: r.to, scenes: r.keys.map(k => STORY[SK.indexOf(k)]) }));

  INTRO = {
    ask: { en: { t: W.q_mom.en, a: W.q_mom.ea }, zh: { t: W.q_mom.zh, a: W.q_mom.za } },
    model: { en: { t: 'My mom is a …', a: W.s_mD.ea }, zh: { t: '我妈妈是…', a: W.s_mD.za } },
    tip: 'Bạn được chọn nói nghề thật của mẹ (hoặc ba). Nghề chưa học thì cô gợi ý từ gần nhất hoặc nói cùng con, không sửa lỗi riêng. Bạn nói tốt thì cô hỏi thêm: <b>Where does she work?</b> / <b class="zh">她在哪儿工作？</b>'
  };

  BOSS = Object.assign({}, BOSS, { story: '⚔️ Rồng Lửa nghịch ngợm làm rối tung bệnh viện, trường học và nhà hàng! Cả lớp tiếp sức cho anh hùng Bông nhé!' });
  const CATS = ${J(CATS)};
  const DOC = ${J(DOC)};
  BOSS_ITEMS = [];
  ['jobs', 'places', 'fam', 'work'].forEach(c => CATS[c].forEach(k => ['en', 'zh'].forEach(l => BOSS_ITEMS.push({ k, l, cat: CATS[c] }))));
  DOC.forEach(([k, c]) => BOSS_ITEMS.push({ k, l: 'doc', chu: W[k].zh, cat: CATS[c] }));
})();
`;
fs.writeFileSync(path.join(ROOT, 'lop-zoom', 'lz-canopy.js'), out);
console.log('Đã ghi lz-canopy.js:', Object.keys(WOUT).length, 'từ/câu,', QUIZ.length, 'câu ôn,', TONES.length, 'thanh điệu,', PAIR_POOL.length, 'tranh đôi bạn, Rồng Lửa', 'có', Object.values(CATS).flat().length * 2 + DOC.length, 'câu');
