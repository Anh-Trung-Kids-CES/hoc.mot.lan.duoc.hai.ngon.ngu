/* Chung kết Rung chuông vàng – sinh ck-data.js từ dữ liệu web học 21 ngày (xem-truoc/ls-data.js).
   Chạy: node chung-ket/tao-du-lieu.js
   Mọi tranh và giọng lấy đúng từ web học (Little Seed và Canopy, 3 vòng), không tạo thêm. Thiếu tệp nào là dừng và báo.
   Nội dung câu hỏi theo doc "Chung kết Rung chuông vàng – Khung nội dung câu hỏi" (10/11/2026). */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
global.window = global;
eval(fs.readFileSync(path.join(ROOT, 'xem-truoc/ls-data.js'), 'utf8'));
const PRE = '../xem-truoc/';   // đường dẫn tính từ trang chung-ket/

/* ---------- gom giọng và tranh của web học ---------- */
const AUD = {}, PIC = {};
(function walk(o) {
  if (Array.isArray(o)) return o.forEach(walk);
  if (!o || typeof o !== 'object') return;
  if (o.t && o.a && o.l && !AUD[o.t]) AUD[o.t] = o.a;
  if (o.pic && o.en && !PIC[o.en]) PIC[o.en] = o.pic;
  for (const k in o) walk(o[k]);
})([LS.stories, LS.days]);
/* giọng nhân vật trong truyện được ưu tiên cho câu của truyện */
const SCN = {};
Object.entries(LS.stories).forEach(([r, s]) => s.scenes.forEach((x, i) => {
  SCN['s' + r + '_' + (i + 1)] = x;
  AUD[x.en.t] = x.en.a; AUD[x.zh.t] = x.zh.a;
}));
const miss = [];
function file(p) { if (!p) return ''; if (!fs.existsSync(path.join(ROOT, 'xem-truoc', p))) miss.push(p); return PRE + p; }
function au(t) { if (!AUD[t]) { miss.push('giọng: ' + t); return ''; } return file(AUD[t]); }
/* tranh của từ: dùng bản _l1 (tranh dạy trong bài, thế giới của Bông, đúng như doc mô tả: nến, album ảnh nhà Bông…);
   he / she dùng bản _l3 (bạn trai, bạn gái) vì bản _l1 trùng với tranh ông, bà trong album */
const VAR = { he: '_l3', she: '_l3' };
/* số đếm: bản _l1 là cùng một bánh sinh nhật, số nến khó đếm → dùng bản _l2 (quả táo), đếm rõ */
['one', 'two', 'three', 'four', 'five', 'six'].forEach(k => VAR[k] = '_l2');
function pv(p, en) { return VAR[en] ? p.replace(/_l1\.webp$/, VAR[en] + '.webp') : p; }

/* ---------- ngân hàng từ, cụm, câu ---------- */
const B = {};
/* từ có tranh minh hoạ trong web học: [mã, en, zh, nhóm] */
[
  /* tranh hello và goodbye gần giống nhau (Bông ở cửa với mẹ): nhóm riêng, không đưa vào lựa chọn */
  ['hello', 'hello', '你好', 'v1g'], ['goodbye', 'goodbye', '再见', 'v1g'],
  ['mommy', 'mommy', '妈妈', 'v1'], ['daddy', 'daddy', '爸爸', 'v1'],
  ['kitten', 'kitten', '小猫', 'v1'], ['teacher', 'teacher', '老师', 'v1'], ['everyone', 'everyone', '大家', 'v1'], ['friend', 'friend', '朋友', 'v1'], ['puppy', 'puppy', '小狗', 'v1'],
  ['one', 'one', '一', 'so'], ['two', 'two', '二', 'so'], ['three', 'three', '三', 'so'], ['four', 'four', '四', 'so'], ['five', 'five', '五', 'so'], ['six', 'six', '六', 'so'],
  ['grandpa', 'grandpa', '爷爷', 'nha'], ['grandma', 'grandma', '奶奶', 'nha'], ['bro', 'big brother', '哥哥', 'nha'], ['lsis', 'little sister', '妹妹', 'nha'],
  ['bsis', 'big sister', '姐姐', 'nha'], ['lbro', 'little brother', '弟弟', 'nha'], ['he', 'he', '他', 'ta'], ['she', 'she', '她', 'ta']
].forEach(([k, en, zh, cat]) => {
  if (!PIC[en]) miss.push('tranh: ' + en);
  B[k] = { en, zh, ea: au(en), za: au(zh), img: file(pv(PIC[en] || '', en)), cat };
});
/* câu của 3 truyện (tranh cảnh truyện, giọng nhân vật) */
Object.entries(SCN).forEach(([k, x]) => { B[k] = { en: x.en.t, zh: x.zh.t, ea: file(x.en.a), za: file(x.zh.a), img: file(x.img), cat: 'tr' + k[1] }; });
/* câu, cụm khác của 3 vòng */
[
  ['hmom', 'Hello, mommy!', '妈妈，你好！', 'v1_n1_cum_hello_mommy_l1.webp'],
  ['mna', 'My name is Anna.', '我叫Anna。', 'v2_n8_cum_my_name_is_anna_l1.webp'], ['wyn', "What's your name?", '你叫什么？', 'v2_n9_cum_what_s_your_name_l1.webp'],
  ['hoy', 'How old are you?', '你几岁？', 'v2_n11_cau_how_old_are_you_l1.webp'], ['i5', "I'm five.", '我五岁。', 'v2_n11_cum_i_m_five_l1.webp'], ['i6', "I'm six!", '我六岁！', 'v2_n11_cum_i_m_six_l1.webp'],
  ['whe', 'Who is he?', '他是谁？', 'v3_n18_cum_who_is_he_l1.webp'], ['wshe', 'Who is she?', '她是谁？', 'v3_n18_cum_who_is_she_l1.webp'], ['hi', 'Hello!', '你好！', ''],
  ['n123', 'One, two, three!', '一、二、三！', 'v2_n10_cum_one_two_three_l1.webp'],
  ['m_gpa', 'my grandpa', '我爷爷', 'v3_n15_cum_my_grandpa_l1.webp'], ['m_gma', 'my grandma', '我奶奶', 'v3_n15_cum_my_grandma_l1.webp'], ['m_bro', 'my big brother', '我哥哥', 'v3_n16_cum_my_big_brother_l1.webp'],
  ['m_lsis', 'my little sister', '我妹妹', 'v3_n16_cum_my_little_sister_l1.webp'], ['m_bsis', 'my big sister', '我姐姐', 'v3_n17_cum_my_big_sister_l1.webp'], ['m_lbro', 'my little brother', '我弟弟', 'v3_n17_cum_my_little_brother_l1.webp']
].forEach(([k, en, zh, img]) => {
  const pic = img ? 'tai-nguyen/little-seed/img/' + img : PIC[en] || '';
  B[k] = { en, zh, ea: au(en === 'Hello!' ? 'hello' : en), za: au(zh === '你好！' ? '你好' : zh), img: pic ? file(pic) : '', cat: /^m_/.test(k) ? 'mnha' : 'cau' };
});

/* ---------- Canopy: gom thẻ học và truyện của 3 vòng (xem-truoc/canopy-data.js), giọng theo bản đồ giọng của web ---------- */
eval(fs.readFileSync(path.join(ROOT, 'xem-truoc/canopy-data.js'), 'utf8'));
eval(fs.readFileSync(path.join(ROOT, 'xem-truoc/tai-nguyen/canopy-audio-map.js'), 'utf8'));
const cxK = t => String(t || '').replace(/’/g, "'").replace(/[\s，。！？、,.!?：:;；“”"…()（）\-–—]/g, '').toLowerCase();
function cxA(t, l, who) { const c = CN_AUDIO[l + '|' + cxK(t)]; if (!c || !c.length) return ''; const f = w => (c.find(e => e[0] === w) || [])[1]; return file((who && f(who)) || f('co_huou') || c[0][1]); }
const CKEY = {}, CIMG = {};
CANOPY.rounds.forEach(r => r.days.forEach(d => d.ex.forEach(e => {
  const items = e.type === 'cards' ? e.items : e.type === 'story' ? e.sents : [];
  items.forEach(it => {
    if (!it.en || !it.zh || !it.img || !it.img.src || CKEY[it.en]) return;
    const src = it.img.src, en = it.en.trim();
    const t = /[.?!]$/.test(en) ? 's' : /_w_/.test(src) ? 'w' : /_p_/.test(src) ? 'p' : (en.split(/\s+/).length > 1 ? 'p' : 'w');
    const ea = cxA(it.en, 'en', e.narrator), za = cxA(it.zh, 'zh', e.narrator);
    if (!ea || !za) return;   // thiếu giọng thì không dùng
    let cat = 'c' + r.r + t;
    /* cùng nhóm mà trùng tranh (câu dùng lại tranh của cụm) thì để riêng, không làm lựa chọn ngẫu nhiên của Rồng Lửa */
    if (CIMG[cat + src]) cat += 'd'; CIMG[cat + src] = 1;
    const k = 'c_' + cxK(it.en).replace(/[^a-z0-9]/g, '').slice(0, 48);
    CKEY[it.en] = k;
    B[k] = { en: it.en, zh: it.zh, ea, za, img: file(src), cat };
  });
})));
function C(en) { if (!CKEY[en]) { miss.push('Canopy: ' + en); return 'x'; } return CKEY[en]; }
const ROUNDS = { seed: LS.rounds.map(r => r.topic), canopy: CANOPY.rounds.map(r => r.name + ' – ' + r.vi) };
/* nhân vật */
const NV = k => file('tai-nguyen/nhan-vat/' + k + '.webp');
B.anna = { en: 'Anna', zh: 'Anna', ea: file('tai-nguyen/little-seed/audio/ls_co_huou_en_anna.mp3'), za: '', img: NV('kids_anna_a'), cat: 'nv' };
B.bong = { en: 'Bông', zh: 'Bông', ea: '', za: '', img: NV('kids_bong_a'), cat: 'nv' };
B.tho = { en: 'Thỏ con', zh: '', ea: '', za: '', img: NV('huou_tho_a'), cat: 'nv' };

/* ---------- Phần 1 · Ôn tập: cả lớp làm chung, không tính xếp hạng (chỉ tích sao) ----------
   Đi lần lượt Vòng 1 → 2 → 3; mỗi vòng theo thứ tự Từ → Cụm từ → Câu, xen kẽ một câu Little Seed rồi một câu Canopy.
   Câu nào cũng một kiểu: nghe (màn chiếu phát) rồi chạm 1 trong 3 tranh. Lựa chọn sai cùng vòng, cùng loại. */
const P = (lv, r, t, w, l, o) => ({ lv, r, t, w, l, o });
const P1 = [
  P('seed', 1, 'tu', 'kitten', 'en', ['kitten', 'puppy', 'teacher']),
  P('canopy', 1, 'tu', C('park'), 'zh', [C('park'), C('zoo'), C('school')]),
  P('seed', 1, 'cum', 's1_7', 'zh', ['s1_7', 's1_2', 's1_8']),
  P('canopy', 1, 'cum', C('go to the zoo'), 'en', [C('go to the zoo'), C('go home'), C('go to school')]),
  P('seed', 1, 'cau', 's1_3', 'en', ['s1_3', 's1_6', 's1_4']),
  P('canopy', 1, 'cau', C('I go to the shop to buy things.'), 'zh', [C('I go to the shop to buy things.'), C('I go to the zoo to see animals.'), C('On Monday morning, I go to school to study.')]),
  P('seed', 2, 'tu', 'five', 'zh', ['five', 'three', 'six']),
  P('canopy', 2, 'tu', C('doctor'), 'en', [C('doctor'), C('chef'), C('dentist')]),
  P('seed', 2, 'cum', 'i6', 'en', ['i6', 'i5', 'n123']),
  P('canopy', 2, 'cum', C('work at a hospital'), 'zh', [C('work at a hospital'), C('work at a restaurant'), C('work at a shop')]),
  P('seed', 2, 'cau', 's2_6', 'zh', ['s2_6', 's2_3', 's2_4']),
  P('canopy', 2, 'cau', C('My mom is a doctor.'), 'en', [C('My mom is a doctor.'), C('My dad is a chef. He works at a restaurant.'), C('He is a teacher.')]),
  P('seed', 3, 'tu', 'grandma', 'en', ['grandma', 'grandpa', 'lsis']),
  P('canopy', 3, 'tu', C('train'), 'zh', [C('train'), C('plane'), C('bus')]),
  P('seed', 3, 'cum', 'm_bro', 'zh', ['m_bro', 'm_lsis', 'm_gpa']),
  P('canopy', 3, 'cum', C('ride a bike'), 'en', [C('ride a bike'), C('take a bus'), C('drive a car')]),
  P('seed', 3, 'cau', 's3_6', 'en', ['s3_6', 's3_5', 's3_4']),
  P('canopy', 3, 'cau', C('I take a bus to school.'), 'zh', [C('I take a bus to school.'), C('I go to school by bike.'), C('I drive to work.')])
];

/* ---------- Phần 2 · Rung chuông vàng: 15 câu × 3 bậc, cả 3 bậc chung một tranh trên màn chiếu ----------
   Mỗi bậc: p (đề) = { a: [mã, tiếng] (nghe), chu (nhìn chữ), img (tranh đề) }, o: các lựa chọn, đáp án luôn là lựa chọn đầu (web tự xáo).
   Kiểu lựa chọn: 'img' (tranh của mã), 'say' (lời nói ở tiếng l, không chữ), 'txt' (chữ tiếng Anh, không tiếng đọc), 'pair' (hai tranh kèm chữ 他/她). */
/* Nguyên tắc: câu HỎI – ĐÁP thì nghe tiếng nào trả lời tiếng đó (không hỏi tiếng Anh, đáp tiếng Trung).
   Chuyển ngữ (nghe một tiếng, chọn lời cùng nghĩa ở tiếng kia) chỉ dùng cho từ, cụm từ, câu kể. */
const T = k => ({ t: 'img', k }), S = (l) => k => ({ t: 'say', k, l }), X = k => ({ t: 'txt', k });
const P2_SEED = [
  { img: 'kitten', A: { p: { a: ['kitten', 'en'] }, o: ['kitten', 'puppy', 'teacher'].map(T) },
    B: { p: { a: ['kitten', 'zh'] }, o: ['kitten', 'puppy', 'friend'].map(S('en')) },
    C: { p: { img: 'kitten' }, o: ['kitten', 'puppy', 'teacher'].map(X) } },
  { img: 'friend', A: { p: { a: ['friend', 'zh'] }, o: ['friend', 'teacher', 'daddy'].map(T) },
    B: { p: { a: ['friend', 'en'] }, o: ['friend', 'teacher', 'everyone'].map(S('zh')) },
    C: { p: { img: 'friend' }, o: ['friend', 'everyone', 'mommy'].map(X) } },
  { img: 'three', A: { p: { a: ['three', 'en'] }, o: ['three', 'two', 'five'].map(T) },
    B: { p: { a: ['three', 'zh'] }, o: ['three', 'two', 'six'].map(S('en')) },
    C: { p: { chu: '三' }, o: ['three', 'one', 'two'].map(T) } },
  { img: 'bro', A: { p: { a: ['bro', 'zh'] }, o: ['bro', 'lbro', 'grandpa'].map(T) },
    B: { p: { a: ['bro', 'en'] }, o: ['bro', 'lbro', 'bsis'].map(S('zh')) },
    C: { p: { img: 'bro' }, o: ['bro', 'lbro', 'bsis'].map(X) } },
  { img: 'grandma', A: { p: { a: ['grandma', 'en'] }, o: ['grandma', 'grandpa', 'lsis'].map(T) },
    B: { p: { a: ['grandma', 'zh'] }, o: ['grandma', 'grandpa', 'lsis'].map(S('en')) },
    C: { p: { img: 'grandma' }, o: ['grandma', 'grandpa', 'mommy'].map(X) } },
  { img: 's1_7', A: { p: { a: ['s1_7', 'zh'] }, o: ['s1_7', 's1_2', 's1_8'].map(T) },
    B: { p: { a: ['s1_7', 'zh'] }, o: ['s1_7', 's1_2', 's1_8'].map(S('en')) },
    C: { p: { img: 's1_7' }, o: ['s1_7', 's1_2', 's1_5'].map(X) } },
  { img: 's1_6', A: { p: { a: ['s1_6', 'en'] }, o: ['s1_6', 's1_1', 's1_4'].map(T) },
    B: { p: { a: ['s1_6', 'en'] }, o: ['s1_6', 's1_3', 's1_1'].map(S('zh')) },
    C: { p: { img: 's1_6' }, o: ['s1_6', 's1_3', 's1_1'].map(X) } },
  { img: 's2_4', A: { p: { a: ['s2_4', 'zh'] }, o: ['s2_4', 's2_2', 's2_1'].map(T) },
    B: { p: { a: ['s2_4', 'zh'] }, o: ['s2_4', 'i6', 's1_5'].map(S('en')) },
    C: { p: { a: ['wyn', 'en'], img: 's2_4' }, o: ['s2_4', 'i6', 's1_4'].map(X) } },
  { img: 's2_7', A: { p: { a: ['hoy', 'en'] }, o: ['s2_7', 's2_4', 's2_1'].map(T) },
    B: { p: { a: ['hoy', 'zh'], img: 's2_7' }, o: ['i6', 'i5', 's2_4'].map(S('zh')) },
    C: { p: { a: ['hoy', 'en'], img: 's2_7' }, o: ['i6', 'i5', 's2_4'].map(X) } },
  { img: 'anna', A: { p: { a: ['mna', 'en'] }, o: ['anna', 'bong', 'tho'].map(T) },
    B: { p: { a: ['wyn', 'zh'], img: 'anna' }, o: ['mna', 'i5', 'hi'].map(S('zh')) },
    C: { p: { a: ['wyn', 'en'], img: 'anna' }, o: ['mna', 'i5', 'hi'].map(X) } },
  { img: 's3_6', A: { p: { a: ['s3_6', 'zh'] }, o: ['s3_6', 's3_5', 's3_4'].map(T) },
    B: { p: { a: ['s3_6', 'zh'] }, o: ['s3_6', 's3_7', 's3_8'].map(S('en')) },
    C: { p: { img: 's3_6' }, o: ['s3_6', 's3_4', 's3_5'].map(X) } },
  { img: 's3_2', A: { p: { a: ['s3_2', 'en'] }, o: ['s3_2', 's3_4', 's3_5'].map(T) },
    B: { p: { a: ['whe', 'zh'], img: 's3_2' }, o: ['s3_2', 's3_5', 's3_8'].map(S('zh')) },
    C: { p: { a: ['whe', 'en'], img: 's3_2' }, o: ['s3_2', 's3_5', 's3_4'].map(X) } },
  { img: 's3_7', A: { p: { a: ['bsis', 'en'] }, o: ['bsis', 'lsis', 'lbro'].map(T) },
    B: { p: { a: ['s3_7', 'zh'] }, o: ['s3_7', 's3_6', 's3_8'].map(S('en')) },
    C: { p: { img: 's3_7' }, o: ['s3_7', 's3_5', 's3_6'].map(X) } },
  { img: 's1_4', A: { p: { a: ['s1_4', 'zh'] }, o: ['s1_4', 's1_5', 's1_7'].map(T) },
    B: { p: { a: ['s1_4', 'zh'] }, o: ['s1_4', 's1_3', 's1_5'].map(S('en')) },
    C: { p: { chu: '大' }, o: ['everyone', 'kitten', 'puppy'].map(T) } },
  { img: 'ongba', chuong: true,
    A: { p: { chu: '她', a: ['she', 'zh'] }, o: ['grandma', 'grandpa', 'bro'].map(T) },
    B: { p: { chu: '她' }, o: ['grandma', 'grandpa', 'bro'].map(T) },
    C: { p: { img: 'ongba', t: 'Chữ nào của ông, chữ nào của bà?' }, o: [['他', '她'], ['她', '他'], ['他', '他']].map(c => ({ t: 'pair', c })) } }
];
/* đáp án của câu (đọc cho cả lớp khi cô hiện đáp án): mã có cả hai tiếng */
['kitten', 'friend', 'three', 'bro', 'grandma', 's1_7', 's1_6', 's2_4', 'i6', 'mna', 's3_6', 's3_2', 's3_7', 's1_4', 's3_4'].forEach((k, i) => P2_SEED[i].ans = k);

/* Canopy: 5 câu mỗi vòng (Places, Jobs, Transports), Từ → Từ → Cụm từ → Câu → Câu. Bậc A nghe – chạm tranh, B nghe một tiếng – chọn lời tiếng kia, C nhìn tranh – chọn chữ tiếng Anh. */
function CQ(ans, aL, Ao, Bo, Co, cP) {
  const k = C(ans), bL = aL === 'en' ? 'zh' : 'en';
  return { img: k, ans: k,
    A: { p: { a: [k, aL] }, o: Ao.map(C).map(T) },
    B: { p: { a: [k, bL] }, o: Bo.map(C).map(S(aL)) },
    C: { p: cP ? { a: [C(cP[0]), cP[1]], img: k } : { img: k }, o: Co.map(C).map(X) } };
}
const P2_CANOPY = [
  CQ('school', 'en', ['school', 'home', 'shop'], ['school', 'park', 'zoo'], ['school', 'shop', 'restaurant']),
  CQ('eat', 'zh', ['eat', 'play', 'buy'], ['eat', 'see', 'study'], ['eat', 'see', 'buy']),
  CQ('see animals', 'en', ['see animals', 'buy things', 'eat dinner'], ['see animals', 'buy things', 'play with friends'], ['see animals', 'eat dinner', 'buy things']),
  CQ('I go to the zoo to see animals.', 'zh', ['I go to the zoo to see animals.', 'I go to the shop to buy things.', 'On Monday morning, I go to school to study.'],
    ['I go to the zoo to see animals.', 'I go to the shop to buy things.', 'On Monday morning, I go to school to study.'], ['I go to the zoo to see animals.', 'I go to the shop to buy things.', 'On Monday morning, I go to school to study.']),
  CQ('On Saturday evening, my family goes to the restaurant to eat dinner.', 'en', ['On Saturday evening, my family goes to the restaurant to eat dinner.', 'On Monday morning, I go to school to study.', 'On Sunday afternoon, I go to the park to play with my friends.'],
    ['On Saturday evening, my family goes to the restaurant to eat dinner.', 'On Monday morning, I go to school to study.', 'On Sunday afternoon, I go to the park to play with my friends.'], ['On Saturday evening, my family goes to the restaurant to eat dinner.', 'On Sunday afternoon, I go to the park to play with my friends.', 'On Monday morning, I go to school to study.']),
  CQ('chef', 'zh', ['chef', 'doctor', 'driver'], ['chef', 'dentist', 'driver'], ['chef', 'dentist', 'driver']),
  CQ('hospital', 'en', ['hospital', 'school', 'restaurant'], ['hospital', 'restaurant', 'shop'], ['hospital', 'school', 'shop']),
  CQ('work at a restaurant', 'zh', ['work at a restaurant', 'work at a hospital', 'work at a shop'], ['work at a restaurant', 'work at a hospital', 'work at a shop'], ['work at a restaurant', 'work at a hospital', 'work at a shop']),
  CQ('My mom is a doctor.', 'en', ['My mom is a doctor.', 'My dad is a chef. He works at a restaurant.', 'He is a teacher.'], ['My mom is a doctor.', 'He is a teacher.', 'He works at a hospital.'], ['My mom is a doctor.', 'He is a teacher.', 'He works at a school.']),
  CQ('He works at a school.', 'zh', ['He works at a school.', 'He works at a hospital.', 'My dad is a chef. He works at a restaurant.'], ['He works at a school.', 'He works at a hospital.', 'I am a student.'], ['He works at a school.', 'He works at a hospital.', 'I am a student.']),
  CQ('bicycle', 'en', ['bicycle', 'motorbike', 'car'], ['bicycle', 'motorbike', 'bus'], ['bicycle', 'motorbike', 'car']),
  CQ('plane', 'zh', ['plane', 'train', 'bus'], ['plane', 'train', 'car'], ['plane', 'train', 'bus']),
  CQ('take a train', 'en', ['take a train', 'take a plane', 'take a bus'], ['take a train', 'take a plane', 'take a bus'], ['take a train', 'take a plane', 'take a bus']),
  CQ('I take a bus to school.', 'zh', ['I take a bus to school.', 'I go to school by bike.', 'I drive to work.'], ['I take a bus to school.', 'I go to school by bike.', 'I drive to work.'], ['I take a bus to school.', 'I go to school by bike.', 'I drive to work.']),
  Object.assign(CQ('He takes a bus to work.', 'en', ['He takes a bus to work.', 'I go to school by bike.', 'I drive to work.'], ['He takes a bus to work.', 'I take a bus to school.', 'I drive to work.'], ['He takes a bus to work.', 'I take a bus to school.', 'I drive to work.'], ['How does he go to work?', 'en']), { chuong: true })
];
const P2 = { seed: P2_SEED, canopy: P2_CANOPY };
B.ongba = { en: 'grandpa · grandma', zh: '他 · 她', img: '', cat: 'nv', pair: ['grandpa', 'grandma'] };

/* ---------- Phần 3 · Rồng Lửa: câu ngẫu nhiên theo bậc, rút từ mọi nhóm của 3 vòng ---------- */
const BOSS_SEED = {
  A: ['v1', 'so', 'nha', 'tr1', 'tr2', 'tr3'],     // nghe (EN hoặc ZH), chạm tranh
  B: ['v1', 'so', 'nha', 'tr1', 'tr3'],            // nghe một tiếng, chọn lời ở tiếng kia
  C: { txt: ['v1', 'so', 'nha', 'tr1', 'tr3'], chu: [['一', 'one', 'so'], ['二', 'two', 'so'], ['三', 'three', 'so'], ['大', 'everyone', 'v1x'], ['他', 'he', 'ta'], ['她', 'she', 'ta']] }
};
const CN_ALL = ['c1w', 'c1p', 'c1s', 'c2w', 'c2p', 'c2s', 'c3w', 'c3p', 'c3s'];
const BOSS = { seed: BOSS_SEED, canopy: { A: CN_ALL, B: ['c1w', 'c1p', 'c2w', 'c2p', 'c3w', 'c3p'], C: { txt: CN_ALL, chu: [] } } };
/* nhóm tranh đặt riêng cho chữ 大 (cả lớp) để lựa chọn sai là 小猫, 小狗 */
const CAT_EXTRA = { v1x: ['everyone', 'kitten', 'puppy'], ta: ['he', 'she', 'kitten'] };
/* truyện 2 có câu "Nice to meet you!" (chỉ nghe) và câu đếm dài: không đưa vào Rồng Lửa */
const BOSS_SKIP = ['s2_5', 's2_1'];

/* ---------- Phần 4 · Nghe truyện, xếp tranh chuyển ngữ: "Anna đến nhà Bông" ----------
   Ghép từ câu và tranh có sẵn của 3 vòng; cảnh 4 gồm hai câu (hỏi tuổi, trả lời). Thẻ thừa: câu quen của Vòng 1. */
const P4_SEED = {
  title: 'Anna đến nhà Bông',
  scenes: [['s1_6'], ['hmom'], ['s2_2'], ['hoy', 'i5'], ['s3_5'], ['s1_7']],
  img: ['s1_6', 'hmom', 's2_2', 's2_8', 's3_5', 's1_7'],
  extra: { k: ['s1_2'], img: 's1_2' }
};
/* Canopy: truyện "Our weekend trip" (Vòng 3, ngày 6) – 6 câu, 6 tranh riêng; thẻ thừa là câu quen của truyện ngày 5 */
const WT = ['On Saturday morning, we take a train to Beijing.', 'We go to the zoo to see animals.', 'In the afternoon, we ride bikes to the park to play.',
  'In the evening, we take a bus to the restaurant to eat dinner.', 'On Sunday, Dad takes a plane to Shanghai to work.', 'We take a train home.'].map(C);
const P4 = { seed: P4_SEED, canopy: { title: 'Our weekend trip', scenes: WT.map(k => [k]), img: WT, extra: { k: [C('My older brother walks to the park.')], img: C('My older brother walks to the park.') } } };

if (miss.length) { console.error('THIẾU:\n' + [...new Set(miss)].join('\n')); process.exit(1); }
const out = `/* Chung kết Rung chuông vàng – TỆP SINH TỰ ĐỘNG từ chung-ket/tao-du-lieu.js (sửa nội dung ở tệp đó rồi chạy lại). */
const CK_BANK = ${JSON.stringify(B)};
const CK_P1 = ${JSON.stringify(P1)};
const CK_P2 = ${JSON.stringify(P2)};
const CK_ROUNDS = ${JSON.stringify(ROUNDS)};
const CK_BOSS = ${JSON.stringify(BOSS)};
const CK_CAT_EXTRA = ${JSON.stringify(CAT_EXTRA)};
const CK_BOSS_SKIP = ${JSON.stringify(BOSS_SKIP)};
const CK_P4 = ${JSON.stringify(P4)};
`;
fs.writeFileSync(path.join(__dirname, 'ck-data.js'), out);
console.log('Đã ghi ck-data.js:', Object.keys(B).length, 'mục,', P1.length, 'câu ôn tập,', P2.seed.length + '+' + P2.canopy.length, 'câu rung chuông vàng');
