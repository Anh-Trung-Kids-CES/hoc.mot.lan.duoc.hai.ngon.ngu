/* Trình chiếu tương tác – buổi chia sẻ 18/11/2026 (kiểu Mentimeter)
   Màn cô: co.html · Màn bố mẹ: index.html · Dữ liệu: Firebase Realtime Database (dự án lớp Zoom)
   Đường dữ liệu: rooms/<phòng>/teacher · state · players/<uid> · answers/<câu>/<uid> */

const TC_FIREBASE = {
  apiKey: "AIzaSyAYoYO7PFPBCdt9JkRVixXef5cF5Djh5ng",
  authDomain: "anh-trung-kids-zoom.firebaseapp.com",
  databaseURL: "https://anh-trung-kids-zoom-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "anh-trung-kids-zoom",
  storageBucket: "anh-trung-kids-zoom.firebasestorage.app",
  messagingSenderId: "1029047261945",
  appId: "1:1029047261945:web:1ff02524454503361fa028"
};

const TC_ROOM_DEFAULT = 'chiase1811';
const TC_SLIDES = 46;

/* Câu hỏi đặt TRƯỚC slide số `truoc` (theo bộ slide 46 trang).
   dung: chỉ số đáp án đúng (null = câu khảo sát, không có đáp án). */
const TC_POLLS = [
  { id: 'q0', truoc: 3, nhan: 'Làm quen', hoi: 'Bố mẹ đang cho con học ngoại ngữ thế nào?',
    chon: ['Chỉ tiếng Anh', 'Cả tiếng Anh và tiếng Trung', 'Chưa cho con học', 'Đang tìm hiểu'], dung: null },
  { id: 'q1', truoc: 11, nhan: 'Đoán trước khi xem', hoi: 'Con học tiếng Anh và tiếng Trung ở hai lớp riêng. Con có tự “chuyển” qua lại giữa hai tiếng được không?',
    chon: ['Được, học đủ hai tiếng là tự chuyển được', 'Chưa chắc: chuyển ngữ là kỹ năng cần luyện riêng', 'Không biết'], dung: 1,
    giai: 'CEFR 2020 coi chuyển ngữ là một kỹ năng riêng. Hai lớp riêng thường bỏ trống phần này, nên con cần được luyện “nghe một tiếng, nói lại bằng tiếng kia”.' },
  { id: 'q2', truoc: 28, nhan: 'Đoán trước khi xem', hoi: 'Học hai ngoại ngữ cùng lúc, con có bị lẫn không?',
    chon: ['Có, nên học xong tiếng Anh rồi mới học tiếng Trung', 'Không: trẻ phân biệt được hai tiếng', 'Không chắc'], dung: 1,
    giai: 'Trẻ nhỏ phân biệt được các ngôn ngữ. Sau 21 ngày, nỗi lo “con bị lẫn” của phụ huynh CES giảm rõ.' },
  { id: 'q3', truoc: 30, nhan: 'Bố mẹ chia sẻ', hoi: 'Điều bố mẹ lo nhất khi con học hai ngoại ngữ?',
    chon: ['Con bị lẫn', 'Nhà bận, không có thời gian', 'Mình không giỏi ngoại ngữ', 'Con nhanh chán'], dung: null },
  { id: 'q4', truoc: 32, nhan: 'Đoán trước khi xem', hoi: 'Học 15–20 phút mỗi ngày, bao lâu con lên được một level tiếng Anh (A1)?',
    chon: ['1–3 tháng', 'Khoảng 1 năm', '3–5 năm'], dung: 1,
    giai: '15–20 phút × 6 ngày ≈ 75–100 giờ mỗi năm; mốc A1 cần khoảng 90–100 giờ học có hướng dẫn (Cambridge).' },
  { id: 'q5', truoc: 33, nhan: 'Đoán trước khi xem', hoi: 'Con học vài tuần mà vẫn im lặng, chưa chịu nói. Điều đó nghĩa là gì?',
    chon: ['Con không tiếp thu được', 'Bình thường: con đang hiểu trước khi nói', 'Cần ép con nói mỗi ngày'], dung: 1,
    giai: 'Giai đoạn im lặng vài tuần đến vài tháng là bình thường. Con chạm đúng tranh, làm đúng động tác khi nghe là con đang tiến bộ.' },
  { id: 'q6', truoc: 35, nhan: 'Đoán trước khi xem', hoi: 'Cách nào giúp con nhớ từ lâu hơn?',
    chon: ['Một buổi dài 60 phút cuối tuần', 'Mỗi ngày vài phút, gặp lại từ nhiều lần', 'Chép mỗi từ 10 lần'], dung: 1,
    giai: 'Học ngắn, rải đều và tự nhớ lại giúp nhớ lâu: học 3 lần × 2 phút mỗi ngày tiến bộ 8,3 điểm, so với 1,3 điểm khi học 1 lần 6 phút.' },
  { id: 'q7', truoc: 36, nhan: 'Tình huống', hoi: 'Con nói một câu chen cả từ tiếng Anh lẫn tiếng Trung. Bố mẹ nên làm gì?',
    chon: ['Sửa ngay, bắt con nói lại cho đúng', 'Đáp lại tự nhiên, không sửa lỗi', 'Cho con tạm nghỉ một thứ tiếng'], dung: 1,
    giai: 'Chen từ là con đang dùng hết vốn mình có, không phải bị lẫn. Nguyên tắc 3 KHÔNG: không ép nói, không sửa lỗi, không so sánh.' },
  { id: 'q8', truoc: 37, nhan: 'Tình huống', hoi: 'Bố mẹ không giỏi ngoại ngữ thì đồng hành cùng con thế nào?',
    chon: ['Không giúp được, giao hết cho cô', 'Đặt giờ học cố định, ngồi cạnh và khen con', 'Học trước để dạy lại con'], dung: 1,
    giai: 'Bố mẹ không cần dạy. Giữ giờ học đều, ngồi cạnh, khen con cụ thể là đủ; giọng chuẩn đã có trên web và cô.' },
  { id: 'q9', truoc: 40, nhan: 'Đoán trước khi xem', hoi: 'Theo bố mẹ, mỗi ngày con nên học trên web bao lâu?',
    chon: ['5 phút', '12–15 phút', '45–60 phút'], dung: 1,
    giai: 'Khoá mới thiết kế 12–15 phút mỗi ngày: đủ để nghe truyện, hát và tự nhớ lại, mà vẫn dưới mốc nhắc nghỉ mắt 25 phút.' }
];

/* Trình tự trình chiếu: màn mời tham gia → slide + câu hỏi xen vào */
function tcSequence() {
  const seq = [{ kind: 'join' }];
  for (let s = 1; s <= TC_SLIDES; s++) {
    TC_POLLS.filter(p => p.truoc === s).forEach(p => seq.push({ kind: 'poll', poll: p.id }));
    seq.push({ kind: 'slide', slide: s });
  }
  return seq;
}
function tcPoll(id) { return TC_POLLS.find(p => p.id === id); }
function tcImg(n) { return 'anh/s' + String(n).padStart(2, '0') + '.jpg?v=4'; }
function tcRoom() {
  const q = new URLSearchParams(location.search).get('phong');
  return (q || TC_ROOM_DEFAULT).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20) || TC_ROOM_DEFAULT;
}
function tcVoteLink(room) {
  const base = location.origin + location.pathname.replace(/[^/]*$/, '');
  return base + (room === TC_ROOM_DEFAULT ? '' : '?phong=' + room);
}
const tcEsc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function tcLsGet(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
function tcLsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }

/* Đếm phiếu của một câu: answers = {uid: {o, t}} → [số phiếu mỗi lựa chọn], tổng */
function tcCount(poll, answers) {
  const c = poll.chon.map(() => 0); let n = 0;
  Object.values(answers || {}).forEach(a => { if (a && a.o >= 0 && a.o < c.length) { c[a.o]++; n++; } });
  return { c, n };
}

async function tcInit() {
  firebase.initializeApp(TC_FIREBASE);
  const auth = firebase.auth();
  const user = await new Promise(res => { const u = auth.onAuthStateChanged(x => { u(); res(x); }); });
  const uid = user ? user.uid : (await auth.signInAnonymously()).user.uid;
  const db = firebase.database();
  let off = 0; db.ref('.info/serverTimeOffset').on('value', s => { off = s.val() || 0; });
  return { uid, db, now: () => Date.now() + off };
}
