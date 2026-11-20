/* =====================================================================
   CUỘC THI MÙA 3 · chạy MỘT ngày bài lớp offline bên trong web mùa 3 (khung iframe).
   Link: bai-ls/?n=<ngày>&k=<mã bé>&ten=<tên con>  (bai-sd/ tương tự).
   - Chỉ ở trong ngày n: bấm ra bản đồ, đổi quà… thì báo web mùa 3 ({t:'ra'}) thay vì mở trang của web lớp offline.
   - Ngày mở sẵn (web mùa 3 tự quản lý khoá ngày).
   - Xong một bước: báo {t:'buoc', steps}; xong cả ngày: báo {t:'xong', steps} và web mùa 3 mở màn chúc mừng, cộng sao.
   - Tên con lấy từ web mùa 3 (câu "Hello, ___!" đọc đúng tên).
   Tệp gốc: cuoc-thi-mua-3/cong-cu/nhung.js (dung_bai_offline.py chép vào bai-ls/, bai-sd/).
   ===================================================================== */
(function () {
  const Q = new URLSearchParams(location.search), N = Math.max(1, +Q.get('n') || 1), TEN = (Q.get('ten') || '').slice(0, 40);
  const IN_FRAME = window.parent && window.parent !== window;
  const post = m => { if (!IN_FRAME) return; try { window.parent.postMessage(Object.assign({ m3: 1, n: N }, m), location.origin); } catch (e) {} };
  const css = document.createElement('style');
  css.textContent = `.side{display:none!important}#app{margin-left:0!important;padding-bottom:0!important}.toast{margin-left:0!important}
    body.is-demo #app{padding-bottom:0!important}.ls-kick,.dayhead .crumb{display:none!important}
    body.m3-nhung:not(.m3-ngay) #app{visibility:hidden}`;
  document.head.appendChild(css);
  document.body.classList.add('m3-nhung');

  try { dayOpen = function () { return true; }; } catch (e) {}
  if (TEN) { try { P.name = TEN; save(); } catch (e) {} try { if (window.lsTen) lsTen(); } catch (e) {} }

  const stepsOf = () => { try { return Object.assign({}, dayState(N).steps); } catch (e) { return {}; } };
  const tong = () => { try { return (SD.days[N].steps || []).length; } catch (e) { return 0; } };   // số bước thật (web lớp có thể thêm bước khi chạy)
  try {
    const _finish = finish;
    finish = function () { const r = _finish.apply(this, arguments); post({ t: 'buoc', steps: stepsOf(), tong: tong() }); return r; };
  } catch (e) {}
  try { dayDone = function () { try { stopAll(); } catch (e) {} post({ t: 'xong', steps: stepsOf(), tong: tong() }); }; } catch (e) {}

  const here = h => new RegExp('^#/ngay/' + N + '(/b\\d+)?$').test(h || '');
  try {
    const _route = route;
    route = function () {
      if (!here(location.hash)) { post({ t: 'ra', to: location.hash }); history.replaceState(null, '', '#/ngay/' + N); }
      const r = _route.apply(this, arguments); document.body.classList.add('m3-ngay');   // trang chủ web lớp offline không hiện; chỉ hiện ngày học
      document.querySelectorAll('.dy-parent span').forEach(el => { el.innerHTML = '<b>Ba mẹ đồng hành:</b> bật bài cho con đúng giờ, khen con khi làm bài và khi xong bài. 3 KHÔNG: không ép nói, không sửa lỗi, không so sánh.'; });
      return r;
    };
  } catch (e) {}
  if (!here(location.hash)) history.replaceState(null, '', '#/ngay/' + N);
  post({ t: 'san-sang', steps: stepsOf(), tong: tong() });
})();
