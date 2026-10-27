# Thêm [Bản nâng cao] cho hoạt động [Chuyển ngữ] trên lớp

Chị Duyên (PM chương trình Anh – Trung – Kids) muốn có phương án cho lớp có con **tiếng Anh trội hơn hẳn tiếng Trung**. Cả lớp vẫn làm [Chuyển ngữ] bản chuẩn; con trội tiếng Anh làm thêm **bản nâng cao**: đầu vào tiếng Anh dài và khó hơn một bậc, đầu ra vẫn là tiếng Trung con đã học. Đây là luyện kỹ năng chuyển ngữ (CEFR mediation), giúp con không chán phần tiếng Anh mà lại phải dùng tiếng Trung nhiều hơn.

Đọc `grid/REVIEW_CRITERIA.md` và `grid/BRIEF3.md` (mục nguyên tắc 4) để nắm quy ước.

## Việc cần làm
Trong file `grid/out/<phần>.json` được giao, với **mỗi buổi** (mỗi phần tử `rows`), tìm hoạt động `[Chuyển ngữ]` trong `lop.en.slide` hoặc `lop.zh.slide`. Chèn **ngay sau hoạt động đó** (cùng ô, trước hoạt động kế tiếp hoặc cuối ô) đúng 1 dòng:

```
[Bản nâng cao] (cho con trội tiếng Anh, ~3 phút) <đầu vào tiếng Anh cụ thể> → con nói lại cho rối Xiaomei bằng tiếng Trung. Mẫu: <câu tiếng Trung mẫu> (<pinyin>)
```

Nếu buổi có nhiều [Chuyển ngữ], chỉ thêm 1 [Bản nâng cao] sau hoạt động chính. Không sửa gì khác trong file.

## Mức khó theo khóa (bản nâng cao = cao hơn bản chuẩn của khóa một bậc)

| Khóa | Bản chuẩn | Bản nâng cao |
|---|---|---|
| Little Seed | nghe 1 từ EN, nói 1 từ ZH | Leo nói 1 câu EN ngắn (3–5 từ) → con nói lại cả câu bằng ZH |
| Seedling | 1 câu | Leo nói 2 câu liền nhau (một ý nối) → con nói lại 2 câu ZH |
| Canopy | 1 câu | Leo kể 2–3 câu / một tin nhắn ngắn → con nói lại đủ ý bằng 2–3 câu ZH |
| Larva | 2–3 câu / tin nhắn | đoạn 4–5 câu → con tóm 2–3 ý chính bằng ZH |
| Larva Plus | 2–3 câu (ôn) | đoạn 4–5 câu hoặc bảng thông tin nhỏ → tóm 2–3 ý |
| Pupa | 2–3 câu / tin nhắn | đoạn 5–6 câu hoặc thông báo / lịch → tóm 3 ý, trả lời 1 câu hỏi thêm của Xiaomei |
| Cocoon | tóm tắt một đoạn / bảng | đoạn 6–8 câu → tóm 3 ý chính VÀ giải thích lại 1 chỗ khó cho Xiaomei (tại sao / như thế nào) |
| Butterfly | tóm tắt một đoạn / bảng | đoạn 6–8 câu hoặc hai nguồn ngắn → tóm ý, so sánh hoặc nêu ý kiến 1 câu bằng ZH, trả lời câu hỏi thêm |

## Quy tắc nội dung
1. **Cùng chủ đề, cùng tình huống** với buổi đó (và với bản chuẩn). Không đưa chủ đề mới.
2. **Đầu vào tiếng Anh được khó hơn**: dùng từ, cấu trúc ở cấp Cambridge cao hơn một bậc so với khóa (vd Seedling dùng mức Movers), nhưng vẫn quanh từ của buổi. Viết sẵn nguyên văn đoạn tiếng Anh trong ô (để cô đọc), British spelling.
3. **Đầu ra tiếng Trung chỉ dùng từ con đã học** (của buổi này, các buổi trước, các khóa trước). **Không thêm từ Trung Mới.** Câu mẫu tiếng Trung có thể ngắn, gọn hơn, chỉ cần đủ ý chính. Có thể ghi khung câu gợi ý (他说……、先……然后……).
4. Tiếng Trung chuẩn, tự nhiên; pinyin có dấu thanh đúng, có biến điệu 一/不 (yí gè, bú shì; số thứ tự 第一 dì yī không biến điệu).
5. Nghĩa đúng (tiêu chí D của REVIEW_CRITERIA): mẫu tiếng Trung phải nói đúng ý của đoạn tiếng Anh, không thêm ý.
6. Giữ quy ước người nói: rối Leo nói tiếng Anh, rối Xiaomei nghe tiếng Trung.
7. **PreB không làm** (khóa chỉ tiếng Anh). Buổi thi thử / kiểm tra / lễ hội vẫn thêm, theo nội dung của buổi.
8. Little Seed: câu tiếng Anh rất ngắn, câu Trung chỉ 1 câu; dùng 他/她 theo quy tắc của khóa.

## Ví dụ
- Canopy, buổi về nghề nghiệp, bản chuẩn: Xiaomei nói "医生在医院工作。", con nói lại cho Leo bằng tiếng Anh.
  `[Bản nâng cao] (cho con trội tiếng Anh, ~3 phút) Leo kể: "My mum is a doctor. She works at a big hospital. She helps sick people every day." → con nói lại cho rối Xiaomei bằng tiếng Trung. Mẫu: Leo的妈妈是医生。她在医院工作，每天帮助病人。(Leo de māma shì yīshēng. Tā zài yīyuàn gōngzuò, měi tiān bāngzhù bìngrén.)`
  (chỉ được dùng 帮助, 病人 nếu con đã học; nếu chưa thì đổi cách nói bằng từ đã học, vd 她每天看病人 hoặc bỏ ý đó khỏi đoạn Anh.)

## Kiểm tra trước khi báo xong
```
cd grid
python3 -c "import json;d=json.load(open('out/<phần>.json'));r=d['rows'];print(len(r),sum(1 for x in r if (x['lop']['en']['slide']+x['lop']['zh']['slide']).count('[Bản nâng cao]')==1))"
python3 check_principles.py <phần>     # phải ĐẠT tất cả, số từ Trung Mới không đổi
python3 to_sheet.py <phần>             # không ô trống, không link mới
```
Hai số ở lệnh đầu phải bằng nhau. Báo cáo ≤80 chữ, kèm 1 ví dụ dòng đã thêm.
