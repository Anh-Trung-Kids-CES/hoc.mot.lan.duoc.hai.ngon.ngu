/**
 * Máy chấm host – Chung kết Rung chuông vàng (bản 2: tài khoản host)
 * Hai việc:
 *   1) Đăng nhập host bằng tài khoản chị cấp trong Google Sheet, tab "Tài khoản host"
 *      (cột: Tài khoản | Mật khẩu | Tên host | Đang dùng | Ghi chú). Muốn khóa ai thì ghi "không" ở cột Đang dùng.
 *   2) Nhận bản ghi âm của host, nhờ Gemini nghe và chấm (đúng câu, phát âm, thanh điệu), trả lời ngắn bằng tiếng Việt.
 * Khóa Gemini nằm trong Thuộc tính tập lệnh, không nằm trong code hay trên GitHub.
 *
 * Thuộc tính tập lệnh (Cài đặt dự án → Thuộc tính tập lệnh):
 *   GEMINI_KEY   = khóa Gemini (bắt buộc)
 *   SHEET_ID     = (không bắt buộc) mã Sheet chứa tab "Tài khoản host" khi script không gắn vào Sheet đó
 *   GEMINI_MODEL = (không bắt buộc) tên mô hình; để trống thì dùng gemini-flash-latest
 * CẬP NHẬT CODE: dán đè → Lưu → Triển khai → Quản lý tùy chọn triển khai → bút chì → Phiên bản mới → Triển khai (link /exec giữ nguyên).
 * Kiểm tra: URL/exec?action=ping → {"ok":true,"v":2,"coKhoa":true,"soTaiKhoan":…}
 */

const V = 2;
const SHEET_MAC_DINH = '1-Bl-tWBxyhrmfo4usGP0mCkEOxbqZQ9CLFurJMyskhk';   // Sheet "Máy chấm host – Chung kết"
const TAB_TK = 'Tài khoản host';
function prop_(k) { return PropertiesService.getScriptProperties().getProperty(k) || ''; }
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function chuan_(s) { return String(s || '').trim().toLowerCase(); }

/* danh sách tài khoản từ Sheet (giữ 60 giây cho nhanh) */
function taiKhoan_() {
  const c = CacheService.getScriptCache(), k = 'tk_v2', cached = c.get(k);
  if (cached) return JSON.parse(cached);
  let ss = null;
  try { ss = SpreadsheetApp.getActiveSpreadsheet(); } catch (e) { }
  if (!ss) ss = SpreadsheetApp.openById(prop_('SHEET_ID') || SHEET_MAC_DINH);
  let sh = ss.getSheetByName(TAB_TK);
  if (!sh) { sh = ss.insertSheet(TAB_TK); sh.appendRow(['Tài khoản', 'Mật khẩu', 'Tên host', 'Đang dùng', 'Ghi chú']); sh.setFrozenRows(1); }
  const n = sh.getLastRow(), ds = {};
  if (n > 1) sh.getRange(2, 1, n - 1, 4).getDisplayValues().forEach(r => {
    const tk = chuan_(r[0]); if (!tk || chuan_(r[3]) === 'không' || chuan_(r[3]) === 'khong') return;
    ds[tk] = { mk: String(r[1]).trim(), ten: String(r[2]).trim() || r[0] };
  });
  c.put(k, JSON.stringify(ds), 60);
  return ds;
}
function kiemTra_(tk, mk) {
  const a = taiKhoan_()[chuan_(tk)];
  return a && a.mk && a.mk === String(mk || '').trim() ? { tk: chuan_(tk), ten: a.ten } : null;
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action === 'ping') {
    let so = -1, loiSheet = '';
    try { so = Object.keys(taiKhoan_()).length; } catch (err) { loiSheet = String(err).slice(0, 200); }
    return out_({ ok: true, v: V, coKhoa: !!prop_('GEMINI_KEY'), soTaiKhoan: so, loiSheet, model: prop_('GEMINI_MODEL') || 'gemini-flash-latest' });
  }
  return out_({ ok: false });
}

function doPost(e) {
  let d = {};
  try { d = JSON.parse(e.postData.contents || '{}'); } catch (err) { return out_({ ok: false, loi: 'du_lieu' }); }
  let ai;
  try { ai = kiemTra_(d.tk, d.mk); } catch (err) { return out_({ ok: false, loi: 'sheet', chiTiet: String(err).slice(0, 200) }); }
  if (!ai) return out_({ ok: false, loi: 'sai_tai_khoan' });
  if (d.action === 'dangnhap') return out_({ ok: true, tk: ai.tk, ten: ai.ten });
  if (d.action !== 'cham') return out_({ ok: false, loi: 'action' });
  if (!d.audio || d.audio.length > 1500000) return out_({ ok: false, loi: 'am_thanh' });
  try { return out_(cham_(d)); } catch (err) { return out_({ ok: false, loi: String(err).slice(0, 300) }); }
}

/* d: { audio (base64 WAV 16 kHz mono), lang 'en'|'zh', mode 'luyen'|'kiemtra', sit (tình huống tiếng Việt, khi kiểm tra),
        all (true = phải nói đủ các câu, đúng thứ tự), targets: [{code, text, py}] } */
function cham_(d) {
  const key = prop_('GEMINI_KEY'); if (!key) return { ok: false, loi: 'chua_co_khoa' };
  const model = prop_('GEMINI_MODEL') || 'gemini-flash-latest';
  const tieng = d.lang === 'zh' ? 'tiếng Trung phổ thông (Mandarin)' : 'tiếng Anh';
  const ds = (d.targets || []).map(t => `- [${t.code}] ${t.text}${t.py ? '  (pinyin: ' + t.py + ')' : ''}`).join('\n');
  const yeuCau = d.mode === 'kiemtra'
    ? `Đây là bài KIỂM TRA TÌNH HUỐNG. Tình huống host được hỏi (tiếng Việt): "${d.sit}".
Host phải nói bằng ${tieng}. ${d.all ? 'Host phải nói ĐỦ TẤT CẢ các câu dưới đây, theo đúng thứ tự.' : 'Host chỉ cần nói MỘT trong các câu dưới đây.'}
Các câu được chấp nhận:\n${ds}
Chấp nhận khác biệt rất nhỏ không đổi nghĩa (thêm "now", "okay", gọi tên bé khác, đổi số phút). Nói sai tiếng, nói câu khác ý, hoặc thiếu câu (khi phải nói đủ) thì dung_cau = false.`
    : `Đây là bài LUYỆN TỪNG CÂU. Host phải nói đúng câu sau bằng ${tieng}:\n${ds}`;
  const prompt = `Bạn là giáo viên luyện phát âm cho người dẫn chương trình (host) người Việt, chuẩn bị dẫn một cuộc thi tiếng Anh – tiếng Trung cho trẻ 5–10 tuổi.
Nghe bản ghi âm đính kèm và chấm.
${yeuCau}

Cách chấm:
- nghe_duoc: chép lại đúng những gì host nói (chữ Hán nếu là tiếng Trung; tiếng Anh viết thường).
- dung_tieng: host có nói bằng ${tieng} không.
- khop: mã câu khớp nhất (ví dụ "K1"); nếu phải nói đủ nhiều câu thì ghi các mã nối bằng dấu phẩy; không khớp thì "".
- dung_cau: true nếu nội dung đạt yêu cầu ở trên.
- noi_dung (0–100): mức đủ và đúng từ ngữ so với câu đích.
- phat_am (0–100): độ rõ và chuẩn của âm (phụ âm đầu, âm cuối, nguyên âm; tiếng Anh chú ý âm cuối, /θ/, /r/, trọng âm).
- thanh_dieu (0–100): CHỈ cho tiếng Trung, mức đúng thanh điệu kể cả biến điệu (一, 不, hai thanh 3 liền nhau). Tiếng Anh ghi -1.
- nhip (0–100): ngữ điệu, độ tự nhiên, năng lượng của người dẫn chương trình cho trẻ em.
- loi: tối đa 4 lỗi cụ thể nhất, mỗi lỗi {tu: chữ hoặc từ bị lỗi (kèm pinyin nếu là tiếng Trung), van_de: mô tả ngắn bằng tiếng Việt, ví dụ "zhǔn đọc thành zǔn, thiếu uốn lưỡi" hoặc "thanh 3 đọc thành thanh 1"}.
- nhan_xet: 1–2 câu tiếng Việt, cụ thể, nêu một điểm làm tốt và một việc cần sửa ngay.
Bản ghi im lặng hoặc không nghe rõ: nghe_duoc "", dung_cau false, các điểm 0, nhan_xet "Chưa nghe rõ, bạn nói lại gần micro hơn nhé."
Chấm nghiêm như giáo viên phát âm, nhưng không trừ điểm vì giọng Việt nếu âm vẫn rõ và đúng.`;

  const schema = {
    type: 'OBJECT',
    properties: {
      nghe_duoc: { type: 'STRING' }, dung_tieng: { type: 'BOOLEAN' }, khop: { type: 'STRING' }, dung_cau: { type: 'BOOLEAN' },
      noi_dung: { type: 'INTEGER' }, phat_am: { type: 'INTEGER' }, thanh_dieu: { type: 'INTEGER' }, nhip: { type: 'INTEGER' },
      loi: { type: 'ARRAY', items: { type: 'OBJECT', properties: { tu: { type: 'STRING' }, van_de: { type: 'STRING' } }, required: ['tu', 'van_de'] } },
      nhan_xet: { type: 'STRING' }
    },
    required: ['nghe_duoc', 'dung_tieng', 'khop', 'dung_cau', 'noi_dung', 'phat_am', 'thanh_dieu', 'nhip', 'loi', 'nhan_xet']
  };
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }, { inline_data: { mime_type: 'audio/wav', data: d.audio } }] }],
    generationConfig: { temperature: 0.2, responseMimeType: 'application/json', responseSchema: schema }
  };
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent';
  let res = null;
  for (let i = 0; i < 3; i++) {
    res = UrlFetchApp.fetch(url, { method: 'post', contentType: 'application/json', headers: { 'x-goog-api-key': key }, payload: JSON.stringify(body), muteHttpExceptions: true });
    if (res.getResponseCode() === 200) break;
    if (res.getResponseCode() < 500 && res.getResponseCode() !== 429) break;
    Utilities.sleep(1500 * (i + 1));
  }
  if (res.getResponseCode() !== 200) return { ok: false, loi: 'gemini_' + res.getResponseCode(), chiTiet: res.getContentText().slice(0, 300) };
  const j = JSON.parse(res.getContentText());
  const txt = (((j.candidates || [])[0] || {}).content || { parts: [] }).parts.map(p => p.text || '').join('');
  let r; try { r = JSON.parse(txt); } catch (err) { return { ok: false, loi: 'doc_ket_qua' }; }
  r.ok = true; r.model = model;
  r.dung = j.usageMetadata ? { vao: j.usageMetadata.promptTokenCount, ra: j.usageMetadata.candidatesTokenCount } : null;
  return r;
}
