/* Chung kết Rung chuông vàng – sinh ck-data.js từ dữ liệu web học 21 ngày (xem-truoc/ls-data.js).
   Chạy: node chung-ket/tao-du-lieu.js
   Mọi tranh và giọng lấy đúng từ web học (Little Seed, 3 vòng), không tạo thêm. Thiếu tệp nào là dừng và báo.
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
  ['mna', 'My name is Anna.', '我叫Anna。', ''], ['wyn', "What's your name?", '你叫什么？', ''],
  ['hoy', 'How old are you?', '你几岁？', ''], ['i5', "I'm five.", '我五岁。', ''], ['i6', "I'm six!", '我六岁！', ''],
  ['whe', 'Who is he?', '他是谁？', ''], ['wshe', 'Who is she?', '她是谁？', ''], ['hi', 'Hello!', '你好！', '']
].forEach(([k, en, zh, img]) => {
  B[k] = { en, zh, ea: au(en === 'Hello!' ? 'hello' : en), za: au(zh === '你好！' ? '你好' : zh), img: img ? file('tai-nguyen/little-seed/img/' + img) : '', cat: 'cau' };
});
/* nhân vật */
const NV = k => file('tai-nguyen/nhan-vat/' + k + '.webp');
B.anna = { en: 'Anna', zh: 'Anna', ea: file('tai-nguyen/little-seed/audio/ls_co_huou_en_anna.mp3'), za: '', img: NV('kids_anna_a'), cat: 'nv' };
B.bong = { en: 'Bông', zh: 'Bông', ea: '', za: '', img: NV('kids_bong_a'), cat: 'nv' };
B.tho = { en: 'Thỏ con', zh: '', ea: '', za: '', img: NV('huou_tho_a'), cat: 'nv' };

/* ---------- Phần 1 · Ôn tập: cả lớp làm chung, không tính xếp hạng ----------
   k: 'chao' (cả lớp chào), 'pick' (nghe, chạm 1 trong 3 tranh), 'lang' (Anh hay Trung?), 'noi' (nói theo). */
const P1 = [
  { k: 'chao', t: 'Cả lớp vẫy tay chào nào!', say: ['hello', 'hi'], img: NV('huou_huou1_a') },
  { k: 'pick', w: 'puppy', l: 'en', o: ['puppy', 'kitten', 'mommy'] },
  { k: 'pick', w: 'teacher', l: 'zh', o: ['teacher', 'daddy', 'friend'] },
  { k: 'lang', w: 's1_4', l: 'zh' },
  { k: 'pick', w: 'five', l: 'en', o: ['five', 'three', 'six'] },
  { k: 'pick', w: 'two', l: 'zh', o: ['two', 'four', 'six'] },
  { k: 'lang', w: 'wyn', l: 'en' },
  { k: 'pick', w: 'grandma', l: 'zh', o: ['grandma', 'grandpa', 'lsis'] },
  { k: 'pick', w: 'lbro', l: 'en', o: ['lbro', 'bro', 'bsis'] },
  { k: 'noi', t: 'Cả lớp nói theo nhé!', w: 's3_4' }
];

/* ---------- Phần 2 · Rung chuông vàng: 15 câu × 3 bậc, cả 3 bậc chung một tranh trên màn chiếu ----------
   Mỗi bậc: p (đề) = { a: [mã, tiếng] (nghe), chu (nhìn chữ), img (tranh đề) }, o: các lựa chọn, đáp án luôn là lựa chọn đầu (web tự xáo).
   Kiểu lựa chọn: 'img' (tranh của mã), 'say' (lời nói ở tiếng l, không chữ), 'txt' (chữ tiếng Anh, không tiếng đọc), 'pair' (hai tranh kèm chữ 他/她). */
const T = k => ({ t: 'img', k }), S = (l) => k => ({ t: 'say', k, l }), X = k => ({ t: 'txt', k });
const P2 = [
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
    B: { p: { a: ['hoy', 'en'], img: 's2_7' }, o: ['i6', 'i5', 's2_4'].map(S('zh')) },
    C: { p: { a: ['hoy', 'zh'], img: 's2_7' }, o: ['i6', 'i5', 's2_4'].map(X) } },
  { img: 'anna', A: { p: { a: ['mna', 'en'] }, o: ['anna', 'bong', 'tho'].map(T) },
    B: { p: { a: ['wyn', 'en'], img: 'anna' }, o: ['mna', 'i5', 'hi'].map(S('zh')) },
    C: { p: { a: ['wyn', 'zh'], img: 'anna' }, o: ['mna', 'i5', 'hi'].map(X) } },
  { img: 's3_6', A: { p: { a: ['s3_6', 'zh'] }, o: ['s3_6', 's3_5', 's3_4'].map(T) },
    B: { p: { a: ['s3_6', 'zh'] }, o: ['s3_6', 's3_7', 's3_8'].map(S('en')) },
    C: { p: { img: 's3_6' }, o: ['s3_6', 's3_4', 's3_5'].map(X) } },
  { img: 's3_2', A: { p: { a: ['s3_2', 'en'] }, o: ['s3_2', 's3_4', 's3_5'].map(T) },
    B: { p: { a: ['whe', 'en'], img: 's3_2' }, o: ['s3_2', 's3_5', 's3_8'].map(S('zh')) },
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
const P2_ANS = ['kitten', 'friend', 'three', 'bro', 'grandma', 's1_7', 's1_6', 's2_4', 'i6', 'mna', 's3_6', 's3_2', 's3_7', 's1_4', 's3_4'];
B.ongba = { en: 'grandpa · grandma', zh: '他 · 她', img: '', cat: 'nv', pair: ['grandpa', 'grandma'] };

/* ---------- Phần 3 · Rồng Lửa: câu ngẫu nhiên theo bậc, rút từ mọi nhóm của 3 vòng ---------- */
const BOSS = {
  A: ['v1', 'so', 'nha', 'tr1', 'tr2', 'tr3'],     // nghe (EN hoặc ZH), chạm tranh
  B: ['v1', 'so', 'nha', 'tr1', 'tr3'],            // nghe một tiếng, chọn lời ở tiếng kia
  C: { txt: ['v1', 'so', 'nha', 'tr1', 'tr3'], chu: [['一', 'one', 'so'], ['二', 'two', 'so'], ['三', 'three', 'so'], ['大', 'everyone', 'v1x'], ['他', 'he', 'ta'], ['她', 'she', 'ta']] }
};
/* nhóm tranh đặt riêng cho chữ 大 (cả lớp) để lựa chọn sai là 小猫, 小狗 */
const CAT_EXTRA = { v1x: ['everyone', 'kitten', 'puppy'], ta: ['he', 'she', 'kitten'] };
/* truyện 2 có câu "Nice to meet you!" (chỉ nghe) và câu đếm dài: không đưa vào Rồng Lửa */
const BOSS_SKIP = ['s2_5', 's2_1'];

/* ---------- Phần 4 · Nghe truyện, xếp tranh chuyển ngữ: "Anna đến nhà Bông" ----------
   Ghép từ câu và tranh có sẵn của 3 vòng; cảnh 4 gồm hai câu (hỏi tuổi, trả lời). Thẻ thừa: câu quen của Vòng 1. */
const P4 = {
  title: 'Anna đến nhà Bông',
  scenes: [['s1_6'], ['hmom'], ['s2_2'], ['hoy', 'i5'], ['s3_5'], ['s1_7']],
  img: ['s1_6', 'hmom', 's2_2', 's2_8', 's3_5', 's1_7'],
  extra: { k: ['s1_2'], img: 's1_2' }
};

if (miss.length) { console.error('THIẾU:\n' + [...new Set(miss)].join('\n')); process.exit(1); }
const out = `/* Chung kết Rung chuông vàng – TỆP SINH TỰ ĐỘNG từ chung-ket/tao-du-lieu.js (sửa nội dung ở tệp đó rồi chạy lại). */
const CK_BANK = ${JSON.stringify(B)};
const CK_P1 = ${JSON.stringify(P1)};
const CK_P2 = ${JSON.stringify(P2)};
const CK_P2_ANS = ${JSON.stringify(P2_ANS)};
const CK_BOSS = ${JSON.stringify(BOSS)};
const CK_CAT_EXTRA = ${JSON.stringify(CAT_EXTRA)};
const CK_BOSS_SKIP = ${JSON.stringify(BOSS_SKIP)};
const CK_P4 = ${JSON.stringify(P4)};
`;
fs.writeFileSync(path.join(__dirname, 'ck-data.js'), out);
console.log('Đã ghi ck-data.js:', Object.keys(B).length, 'mục,', P1.length, 'câu ôn tập,', P2.length, 'câu rung chuông vàng');
