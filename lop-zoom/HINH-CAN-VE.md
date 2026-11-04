# Hình biểu cảm cho trò "Cả lớp đấu Rồng Lửa" (tuỳ chọn)

Hiện web dùng 2 ảnh có sẵn (`qua/ava_bong_sieu_nhan.webp`, `qua/mon_lua_3.webp`) và tạo biểu cảm bằng chuyển động
(nhún theo nhịp, lao tới tấn công, rung khi trúng đòn, phát sáng khi được tiếp sức) cùng biểu tượng cảm xúc cạnh đầu nhân vật.
Muốn nhân vật đổi nét mặt thật như phim hoạt hình, vẽ thêm 4 ảnh dưới đây bằng Gemini (tự động: `tao-tai-nguyen/tao_hinh.py`) (cùng nét 2D, nền trong suốt,
giữ đúng khuôn mặt, tóc, trang phục như ảnh gốc), lưu vào `xem-truoc/tai-nguyen/qua/`, rồi điền tên file vào `BOSS_V` ở đầu `lop-zoom/lz-boss.js`.

| Khóa trong BOSS_V | Tên file gợi ý | Mô tả để vẽ |
|---|---|---|
| heroWin | zoom_bong_thang.webp | Bông siêu nhân (như ava_bong_sieu_nhan) reo vui, một tay giơ nắm đấm lên trời, miệng cười rộng |
| heroHurt | zoom_bong_lui.webp | Bông siêu nhân hơi lùi lại, nhăn mặt cố gắng, hai tay đưa ra chắn, không bị thương |
| monAngry | zoom_rong_gian.webp | Rồng Lửa (như mon_lua_3) phồng má, lông mày cau, phun một luồng lửa nhỏ dễ thương, không đáng sợ |
| monDizzy | zoom_rong_choang.webp | Rồng Lửa choáng váng, mắt xoay vòng, sao bay quanh đầu, ngồi bệt |

Lưu ý: giữ phong cách dễ thương cho bé 5–7 tuổi, không máu, không vũ khí.
