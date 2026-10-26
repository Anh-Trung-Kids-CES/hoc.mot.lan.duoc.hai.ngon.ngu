/* Giữ chân học viên (bản xem trước, theo báo cáo "Người đồng hành giữ trẻ học web đều đặn").
   Chỉ lưu dữ liệu tối thiểu trên máy này: ngày học, bài đã làm, điểm từng bài, mục tiêu tuần, tạm nghỉ.
   Không ghi từng cú nhấp, không gửi đi đâu. */
(function(){
'use strict';
const ATK=window.ATK, store=ATK.store;
const DAY=864e5, H=36e5;
const THU=/[?&]thu=1/.test(location.search);
const K={ngay:'atk2-ngay',xong:'atk2-xong',tg:'atk2-thoi-gian',tl:'atk2-ti-le',mt:'atk2-muc-tieu',nghi:'atk2-tam-nghi',hs:'atk2-ho-so',
  thuoc:'atk2-thuoc',phien:'atk2-phien',nk:'atk2-nhat-ky-phien',dl:'atk2-dang-lam',lh:'atk2-lien-he',co:'atk2-co',gv:'atk2-gv',ghi:'atk2-ghi-am-thang'};
const gc={K,THU};
ATK.gc=gc;

/* ---------- ngày tháng (giờ địa phương) ---------- */
const pad=n=>String(n).padStart(2,'0');
const ymd=d=>{ d=d instanceof Date?d:new Date(d); return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); };
const dt=s=>{ const [y,m,d]=s.split('-').map(Number); return new Date(y,m-1,d); };
const add=(s,n)=>{ const d=dt(s); d.setDate(d.getDate()+n); return ymd(d); };
const diff=(a,b)=>Math.round((dt(a)-dt(b))/DAY); // a - b, theo ngày
const today=()=>ymd(new Date());
const monday=s=>{ const d=dt(s||today()); const w=(d.getDay()+6)%7; d.setDate(d.getDate()-w); return ymd(d); };
const vnDate=s=>{ const d=dt(s); return pad(d.getDate())+'/'+pad(d.getMonth()+1); };
const THU_VN=['T2','T3','T4','T5','T6','T7','CN'];
Object.assign(gc,{ymd,dt,add,diff,today,monday,vnDate,THU_VN});

/* ---------- hồ sơ, đồng ý ---------- */
gc.hs={
  get(){ return Object.assign({ten:'',phu_huynh:'',khoa:'little-seed',nhom:'lop',hoc_cung:null,dong_y:null,kenh:'zalo',gio_nhan:'18:00–20:00',nhac_ngay:false,gio_nhac:'19:00',bat_dau:null},store.get(K.hs,{})); },
  set(o){ const x=Object.assign(this.get(),o); if(!x.bat_dau) x.bat_dau=today(); store.set(K.hs,x); return x; },
  // Học cùng ba mẹ: mặc định bật cho PreB, Little Seed (4–6 tuổi); ba mẹ đổi được
  hocCung(courseName){ const v=this.get().hoc_cung; if(v===true||v===false) return v; return /PreB|Little Seed/i.test(courseName||''); }
};
const tenCon=()=>gc.hs.get().ten||store.get(ATK.KEY.name,'')||'con';
gc.tenCon=tenCon;

/* ---------- ngày học: một ngày con hoàn thành ít nhất một bài chính ---------- */
gc.ngay={
  all(){ return store.get(K.ngay,{}); },
  ghi(key,sec){ const a=this.all(), d=today(); const x=a[d]||{k:[],s:0}; if(!x.k.includes(key)) x.k.push(key); x.s+=Math.round(sec||0); a[d]=x; store.set(K.ngay,a);
    const xo=store.get(K.xong,{}); if(!xo[key]) xo[key]=d; store.set(K.xong,xo);
    const t=store.get(K.tg,{}); (t[key]=t[key]||[]).push(Math.round(sec||0)); t[key]=t[key].slice(-5); store.set(K.tg,t);
    if(!gc.hs.get().bat_dau) gc.hs.set({}); },
  ds(){ return Object.keys(this.all()).sort(); },
  cuoi(){ const d=this.ds(); return d[d.length-1]||null; },
  homNay(){ return !!this.all()[today()]; },
  xongNgay(key){ return store.get(K.xong,{})[key]||null; },
  thoiGian(){ return store.get(K.tg,{}); }
};
/* tỷ lệ đúng ngay lần đầu của mỗi bài, để giữ bài chính ở mức 70–90% đúng */
gc.tiLe={
  ghi(key,r){ const h=store.get(K.tl,[]); h.push({key,r:Math.round(r*100)/100,t:Date.now()}); store.set(K.tl,h.slice(-30)); },
  all(){ return store.get(K.tl,[]); },
  // Chế độ dễ: 2 bài gần nhất đều dưới 70% đúng → câu chọn tranh còn 2 phương án; một bài từ 85% trở lên thì về 3 phương án
  de(){ const h=this.all(); if(h.length<2) return false; const a=h[h.length-1], b=h[h.length-2]; if(a.r>=.85) return false; return a.r<.7&&b.r<.7; }
};

/* ---------- mục tiêu tuần do ba mẹ đặt ---------- */
gc.mt={
  all(){ return store.get(K.mt,{}); },
  macDinh(){ return gc.hs.get().nhom==='lop'?4:3; },
  dat(d,gio){ const a=this.all(); a[monday()]={d:+d,g:gio||((a[monday()]||{}).g)||'',t:Date.now()}; store.set(K.mt,a); },
  cua(mon){ const a=this.all(); const ks=Object.keys(a).filter(k=>k<=mon).sort(); return ks.length?a[ks[ks.length-1]]:null; },
  so(mon){ const x=this.cua(mon||monday()); return x?x.d:this.macDinh(); },
  gio(){ const x=this.cua(monday()); return x?x.g:''; },
  daDatTuanNay(){ return !!this.all()[monday()]; }
};

/* ---------- tạm nghỉ (Tết, ốm, đi xa, bảo lưu) ---------- */
gc.nghi={
  get(){ return store.get(K.nghi,null); },
  dat(den,ly_do){ store.set(K.nghi,{tu:today(),den,ly_do}); },
  ket_thuc(){ store.set(K.nghi,null); },
  dang(o){ o=o===undefined?this.get():o; if(!o) return false; const d=today(); return d>=o.tu && d<=o.den; },
  trongTuan(o,mon){ if(!o) return false; const sun=add(mon,6); return o.tu<=sun && o.den>=mon; }
};

/* ---------- tuần đạt mục tiêu (đếm tổng, không reset, không hình ảnh buồn) ---------- */
function soNgay(ngays,tu,den){ return ngays.filter(d=>d>=tu&&d<=den).length; }
gc.tuan=function(n){ // n tuần gần nhất của con trên máy này
  const ngays=gc.ngay.ds(), nghi=gc.nghi.get(); const out=[];
  let mon=monday();
  for(let i=0;i<n;i++){ const sun=add(mon,6), d=soNgay(ngays,mon,sun), g=gc.mt.so(mon);
    out.unshift({mon,d,g,dat:d>=g,nghi:gc.nghi.trongTuan(nghi,mon),nay:i===0}); mon=add(mon,-7); }
  return out;
};
gc.soTuanDat=function(){
  const ngays=gc.ngay.ds(); if(!ngays.length) return 0;
  let mon=monday(ngays[0]), n=0; const end=monday();
  while(mon<=end){ if(soNgay(ngays,mon,add(mon,6))>=gc.mt.so(mon)) n++; mon=add(mon,7); }
  return n;
};

/* ---------- thuộc từ: đúng ngay lần đầu ở 2 ngày khác nhau (?thu=1: 1 ngày) → vào Bộ sưu tập ---------- */
gc.thuoc={
  all(){ return store.get(K.thuoc,{}); },
  can:THU?1:2,
  ghi(id){ const a=this.all(), d=today(); const x=a[id]||[]; const truoc=x.length>=this.can; if(!x.includes(d)) x.push(d); a[id]=x.slice(-6); store.set(K.thuoc,a); return !truoc && a[id].length>=this.can; },
  da(id){ return (this.all()[id]||[]).length>=this.can; }
};
gc.album=function(courseName,u){ // từ có tranh của một unit
  const kho=ATK.data.kho; return Object.values(kho).filter(x=>x.c===courseName&&+x.u===+u&&x.k==='word'&&x.pics&&x.pics.length);
};

/* ---------- phiên học: nhắc nghỉ ở phút 20, khóa mềm ở phút 30 dùng liên tục ---------- */
const NHAC=THU?60:20*60, KHOA=THU?90:30*60, NGHI_PHIEN=10*60*1000;
gc.phien={
  NHAC,KHOA,
  get(){ const p=store.get(K.phien,null); if(!p||Date.now()-p.cuoi>NGHI_PHIEN) return {bat_dau:Date.now(),cuoi:Date.now(),giay:0,da_nhac:false,them:0,moi:true}; return p; },
  tick(){ const p=this.get(); if(p.moi){ delete p.moi; this.luuNhatKy(); } p.giay++; p.cuoi=Date.now(); store.set(K.phien,p); return p; },
  luuNhatKy(){ const nk=store.get(K.nk,[]), p=store.get(K.phien,null); if(p&&p.giay>0) nk.push({t:p.bat_dau,giay:p.giay}); store.set(K.nk,nk.slice(-60)); },
  daNhac(){ const p=this.get(); p.da_nhac=true; store.set(K.phien,p); },
  moThem(){ const p=this.get(); p.them=(p.them||0)+(THU?60:10*60); store.set(K.phien,p); },
  khoa(){ const p=this.get(); return p.giay>=KHOA+(p.them||0); },
  nhatKy(){ const nk=store.get(K.nk,[]).slice(); const p=store.get(K.phien,null); if(p&&p.giay>0) nk.push({t:p.bat_dau,giay:p.giay}); return nk; }
};

/* ---------- bài đang làm dở (nút tạm dừng, nút ✕) ---------- */
gc.dangLam={
  get(key){ const x=store.get(K.dl,null); return x&&x.key===key&&Date.now()-x.t<DAY?x:null; },
  luu(key,ai,stars,sec){ store.set(K.dl,{key,ai,stars,sec,t:Date.now()}); },
  xoa(){ store.set(K.dl,null); }
};

/* ---------- chế độ thầy cô: mở mọi bài ---------- */
gc.gv=()=>/[?&]gv=1/.test(location.search)||store.get(K.gv,false)===true;
gc.setGv=v=>store.set(K.gv,!!v);

/* ---------- mở bài: mỗi ngày lịch mở 1 ngày web mới; xong ngày 8 của unit thì mở unit sau ---------- */
gc.mo=function(c,U,n){
  if(gc.gv()) return {mo:true};
  const key=c.id+'/'+U.u+'/'+n;
  if(ATK.prog.get(key)>0) return {mo:true};
  let prev=null;
  if(n>1) prev=c.id+'/'+U.u+'/'+(n-1);
  else { const ws=c.units.filter(x=>x.web); const i=ws.findIndex(x=>x.u===U.u); if(i>0) prev=c.id+'/'+ws[i-1].u+'/8'; }
  if(!prev) return {mo:true};
  const xong=gc.ngay.xongNgay(prev);
  if(!xong && !(ATK.prog.get(prev)>0)) return {mo:false,vi:'truoc'};
  if(xong && xong>=today()) return {mo:false,vi:'mai'};
  return {mo:true};
};
gc.nhiemVu=function(c){ // ngày web tiếp theo con nên học hôm nay
  for(const U of c.units.filter(x=>x.web)) for(let n=1;n<=8;n++){
    const k=c.id+'/'+U.u+'/'+n; if(ATK.prog.get(k)>0) continue; const m=gc.mo(c,U,n); return {U,n,k,mo:m.mo,vi:m.vi}; }
  return null;
};

/* ---------- liên hệ, cờ ---------- */
gc.lienHe={
  all(){ return store.get(K.lh,{}); },
  ghi(id,o){ const a=this.all(); (a[id]=a[id]||[]).push(Object.assign({t:Date.now()},o)); store.set(K.lh,a); },
  cua(id){ return this.all()[id]||[]; }
};
gc.coTu=function(id,mau){ const a=store.get(K.co,{}); if(!a[id]||a[id].mau!==mau){ a[id]={mau,tu:Date.now()}; store.set(K.co,a); } return a[id].tu; };

/* ---------- trạng thái xanh / vàng / đỏ (ngưỡng ban đầu theo báo cáo, cần hiệu chỉnh sau thí điểm) ---------- */
gc.trangThai=function(st){
  const d0=today(), ngays=st.ngay.slice().sort();
  const d7=soNgay(ngays,add(d0,-6),d0);
  const cuoi=ngays[ngays.length-1]||null;
  const gap=cuoi?diff(d0,cuoi):diff(d0,st.bat_dau);
  const tuoi=diff(d0,st.bat_dau);
  const why=[];
  if(st.nghi && gc.nghi.dang(st.nghi)) return {mau:'nghi',d7,cuoi,gap,why:['Ba mẹ báo tạm nghỉ đến '+vnDate(st.nghi.den)+(st.nghi.ly_do?' ('+st.nghi.ly_do+')':'')]};
  if(st.ngung||(st.lien_he||[]).filter(x=>x.muc==='do'&&x.kq==='Không phản hồi').length>=2) return {mau:'ngung',d7,cuoi,gap,why:['Đã liên hệ 2 lần ở mức đỏ, chưa có phản hồi · chờ QLCT duyệt']};
  const w=k=>soNgay(ngays,add(d0,-6-7*k),add(d0,-7*k)); // 7 ngày thứ k trước đây
  const tb3=(w(1)+w(2)+w(3))/3;
  const vangNay=(d7>=1&&d7<=2)||gap>=7||(tb3>=2&&d7<=tb3*.5)||st.ha_muc_tieu>=2;
  const vangTruoc=w(1)>=1&&w(1)<=2;
  const lh=(st.lien_he||[]).filter(x=>Date.now()-x.t>=5*DAY&&Date.now()-x.t<21*DAY); // đã liên hệ từ tuần trước mà vẫn vàng
  // ĐỎ
  if(gap>=14) why.push(gap+' ngày liền không học');
  if(vangNay&&vangTruoc&&lh.length) why.push('Mức vàng 2 tuần liền dù đã liên hệ');
  if(st.nhom==='lop'&&(st.vang_buoi||0)>=2&&vangNay) why.push('Vắng '+st.vang_buoi+' buổi trong tháng và web ở mức vàng');
  if(st.phan_nan) why.push('Ba mẹ phàn nàn hoặc xin dừng');
  if(why.length) return {mau:'do',d7,cuoi,gap,why};
  // MỚI (14 ngày đầu)
  if(tuoi<14){
    if(tuoi>=3&&!ngays.length) return {mau:'moi',d7,cuoi,gap,why:['Đã '+tuoi+' ngày chưa có ngày học nào']};
    if(tuoi>=7&&d7<2) return {mau:'moi',d7,cuoi,gap,why:['Sau 7 ngày mới có '+d7+' ngày học']};
    return {mau:'moi-ok',d7,cuoi,gap,why:['Gia đình mới, đang vào nhịp']};
  }
  // VÀNG
  if(d7>=1&&d7<=2) why.push('Chỉ '+d7+' ngày học trong 7 ngày');
  if(gap>=7) why.push(gap+' ngày liền không học');
  if(tb3>=2&&d7<=tb3*.5&&!(d7>=1&&d7<=2)) why.push('Giảm từ ~'+Math.round(tb3)+' xuống '+d7+' ngày/tuần');
  if(st.ha_muc_tieu>=2) why.push('Ba mẹ hạ mục tiêu 2 tuần liền');
  if(why.length) return {mau:'vang',d7,cuoi,gap,why};
  return {mau:'xanh',d7,cuoi,gap,why:[d7+' ngày học trong 7 ngày']};
};
gc.MAU={xanh:['Xanh','#2E9E5B'],vang:['Vàng','#D99A00'],do:['Đỏ','#D93A3A'],moi:['Mới · cần chào','#2F6FD6'],'moi-ok':['Mới','#7FA6E6'],nghi:['Tạm nghỉ','#8b8178'],ngung:['Ngừng liên hệ','#5d544c']};
gc.tuanXanh=function(st){ // số tuần liền gần nhất có ≥3 ngày học
  const ngays=st.ngay, d0=today(); let n=0;
  for(let k=0;k<30;k++){ if(soNgay(ngays,add(d0,-6-7*k),add(d0,-7*k))>=3) n++; else break; }
  return n;
};

/* ---------- con trên máy này, dưới dạng một học sinh trong lớp ---------- */
gc.conMayNay=function(){
  const hs=gc.hs.get(), ngays=gc.ngay.ds();
  const mt=gc.mt.all(), ks=Object.keys(mt).sort();
  let ha=0; for(let i=ks.length-1;i>0;i--){ if(mt[ks[i]].d<mt[ks[i-1]].d) ha++; else break; }
  return {id:'may-nay',ten:tenCon(),phu_huynh:hs.phu_huynh||'ba mẹ',nhom:hs.nhom,khoa:courseName(hs.khoa),lop:hs.nhom==='lop'?'Lớp của con':'Chỉ học web',
    bat_dau:hs.bat_dau||ngays[0]||today(),ngay:ngays,muc_tieu:gc.mt.so(),ha_muc_tieu:ha,nghi:gc.nghi.get(),vang_buoi:0,phan_nan:false,
    lien_he:gc.lienHe.cua('may-nay'),uu_dai:!!(hs.dong_y&&hs.dong_y.uu_dai),may:true};
};
function courseName(id){ const c=ATK.data&&ATK.data.courses.find(x=>x.id===id); return c?c.name:id; }

/* ---------- lớp mẫu (bản xem trước): 12 học sinh giả lập, đủ các tình huống trong quy trình ---------- */
gc.lopMau=function(){
  const d0=today();
  let seed=7; const r=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
  const days=(tuan,mau)=>{ // mau: số ngày học mỗi tuần, tuần gần nhất đứng cuối; chọn thứ ngẫu nhiên nhưng cố định
    const out=[]; mau.forEach((n,i)=>{ const k=mau.length-1-i; const pool=[0,1,2,3,4,5,6].sort(()=>r()-.5).slice(0,n);
      pool.forEach(j=>{ const d=add(d0,-7*k-j); if(d<=d0) out.push(d); }); }); return out; };
  const L=(o)=>Object.assign({vang_buoi:0,phan_nan:false,lien_he:[],nghi:null,ha_muc_tieu:0,uu_dai:false,ngung:false},o);
  const h=n=>Date.now()-n*H;
  return [
    L({id:'s1',ten:'Minh Anh',phu_huynh:'chị Hoa',nhom:'lop',khoa:'Little Seed',lop:'Seed 2',bat_dau:add(d0,-70),ngay:days(0,[4,4,3,4,4,5,4,4,3,4]),muc_tieu:4}),
    L({id:'s2',ten:'Gia Bảo',phu_huynh:'anh Tuấn',nhom:'web',khoa:'Canopy',lop:'Chỉ học web',bat_dau:add(d0,-60),ngay:days(0,[3,4,3,4,3,4,4,3,4]).filter(d=>diff(d0,d)>15),muc_tieu:3,co_gio:30}),
    L({id:'s3',ten:'Khánh An',phu_huynh:'chị Lan',nhom:'lop',khoa:'Little Seed',lop:'Seed 2',bat_dau:add(d0,-49),ngay:days(0,[4,3,4,3,2,2]).filter(d=>diff(d0,d)!==0),muc_tieu:4,co_gio:40,lien_he:[{t:h(3),loai:'nhan',kq:'Ba mẹ đã trả lời',ghi_chu:'Máy tính bảng hỏng, đang dùng điện thoại của mẹ'}]}),
    L({id:'s4',ten:'Bảo Ngọc',phu_huynh:'chị Mai',nhom:'lop',khoa:'Canopy',lop:'Canopy 1',bat_dau:add(d0,-56),ngay:days(0,[4,4,4,4,4,3,3,3]),muc_tieu:2,ha_muc_tieu:2,co_gio:20,lien_he:[{t:h(6),loai:'nhan',kq:'Ba mẹ đã trả lời',ghi_chu:'Con thấy bài khó, đã gửi bài 5 phút'}]}),
    L({id:'s5',ten:'Tuệ Lâm',phu_huynh:'anh Nam',nhom:'lop',khoa:'Little Seed',lop:'Seed 2',bat_dau:add(d0,-42),ngay:days(0,[4,3,3,2,1,1]),muc_tieu:4,vang_buoi:2,co_gio:55}),
    L({id:'s6',ten:'Hà My',phu_huynh:'chị Thu',nhom:'web',khoa:'Little Seed',lop:'Chỉ học web',bat_dau:add(d0,-35),ngay:days(0,[3,3,3,2,2]),muc_tieu:3,co_gio:10,lien_he:[{t:h(150),loai:'nhan',kq:'Ba mẹ hẹn cố gắng',muc:'vang'}]}),
    L({id:'s7',ten:'Đức Huy',phu_huynh:'anh Long',nhom:'web',khoa:'Canopy',lop:'Chỉ học web',bat_dau:add(d0,-4),ngay:[],muc_tieu:3,co_gio:22}),
    L({id:'s8',ten:'Ngọc Diệp',phu_huynh:'chị Hằng',nhom:'lop',khoa:'Canopy',lop:'Canopy 1',bat_dau:add(d0,-5),ngay:[add(d0,-4),add(d0,-2),add(d0,-1)],muc_tieu:4}),
    L({id:'s9',ten:'Quang Minh',phu_huynh:'anh Đức',nhom:'web',khoa:'Little Seed',lop:'Chỉ học web',bat_dau:add(d0,-63),ngay:days(0,[4,4,3,4,3,4,3,4,4,3]),muc_tieu:3,uu_dai:true}),
    L({id:'s10',ten:'Thảo Vy',phu_huynh:'chị Ngân',nhom:'lop',khoa:'Canopy',lop:'Canopy 1',bat_dau:add(d0,-40),ngay:days(0,[3,4,3,3,1]).filter(d=>diff(d0,d)>3),muc_tieu:4,nghi:{tu:add(d0,-3),den:add(d0,9),ly_do:'đi xa'}}),
    L({id:'s11',ten:'Phúc An',phu_huynh:'anh Hải',nhom:'web',khoa:'Canopy',lop:'Chỉ học web',bat_dau:add(d0,-80),ngay:days(0,[3,3,2,1,0,0,0,0,0]),muc_tieu:3,lien_he:[{t:h(24*12),loai:'goi',muc:'do',kq:'Không phản hồi'},{t:h(24*6),loai:'goi',muc:'do',kq:'Không phản hồi'}]}),
    L({id:'s12',ten:'Mai Chi',phu_huynh:'chị Yến',nhom:'web',khoa:'Little Seed',lop:'Chỉ học web',bat_dau:add(d0,-24),ngay:days(0,[3,4,3,3]),muc_tieu:3,uu_dai:true})
  ];
};

/* ---------- mẫu tin (theo báo cáo; thay tên, chủ đề, giờ bằng dữ liệu thật) ---------- */
gc.MAU_TIN=[
  {id:'t2',khi:'Thứ Hai, sáng',loai:'Mục tiêu tuần',tu_dong:true,tx:'Chào {ph}, tuần này bé {con} sẽ học chủ đề {chu_de} (tiếng Anh và tiếng Trung). Mục tiêu {ph_ngan} chọn: {mt} ngày, mỗi ngày khoảng 10–15 phút {gio}. Bấm vào đây để vào nhiệm vụ hôm nay.'},
  {id:'t4',khi:'Thứ Tư, chiều tối',loai:'Mẹo học cùng con',tu_dong:true,tx:'Mẹo 3 phút tối nay: {ph_ngan} chỉ vào {vat} trong sách hoặc ngoài đường và hỏi bé: "{en} tiếng Trung nói thế nào nhỉ?" ({zh} {py}, bấm nghe phát âm). Bé trả lời được thì khen cụ thể: "Con nhớ cả tiếng Trung luôn!"'},
  {id:'t7a',khi:'Thứ Bảy hoặc Chủ nhật, sáng',loai:'Báo cáo tuần · đạt mục tiêu',tu_dong:true,tx:'Tuần này bé {con} học {d}/{mt} ngày, đạt mục tiêu! Bé đã gặp {tu} từ, nghe bé nói tại đây. Tuần sau mình thử thêm chủ đề {chu_de_sau} nhé. {ph_hoa} muốn giữ mục tiêu {mt} ngày hay đổi?'},
  {id:'t7b',khi:'Thứ Bảy hoặc Chủ nhật, sáng',loai:'Báo cáo tuần · chưa đạt',tu_dong:true,tx:'Tuần này bé {con} học {d} ngày, và bé đã nhớ được {thuoc} từ mới. Tuần nào cũng có lúc bận. Nếu tiện, {ph_ngan} chọn giúp em một khung giờ 10 phút cố định, ví dụ ngay sau bữa tối. {ph_hoa} muốn đặt mục tiêu 2 ngày cho tuần sau không?'},
  {id:'vang',khi:'Khi có cờ vàng (GV hoặc CVHT nhắn riêng, trong 48 giờ)',loai:'Nhắn riêng · mức vàng',tx:'{ph_hoa} ơi, em là {nguoi} {lop}. Mấy hôm nay em chưa thấy con vào web, nhà mình có vướng gì không ạ (máy, giờ giấc, hay con thấy bài khó)? Em gửi {ph_ngan} một bài 5 phút dễ nhất ở đây, con làm xong là được tính cả ngày hôm đó.'},
  {id:'do',khi:'Khi có cờ đỏ (hẹn gọi, trong 48 giờ)',loai:'Hẹn gọi · mức đỏ',tx:'Chào {ph}, em là {nguoi}, cố vấn học tập của CES. Em muốn gọi khoảng 10 phút để cùng tìm cách giúp bé {con} học nhẹ nhàng hơn ở nhà. {ph_hoa} tiện vào khung giờ nào: 12:00–13:00 hay 16:00–17:00 ạ? Nếu nhà mình đang bận, {ph_ngan} có thể bảo lưu gói mà không mất ngày học.'},
  {id:'moi',khi:'Gia đình mới (14 ngày đầu)',loai:'Chào gia đình mới',tx:'Chào {ph}, em là {nguoi}, em đồng hành cùng bé {con} trong {khoa}. Em gửi {ph_ngan} video hướng dẫn 2 phút ở đây. Nhà mình thường rảnh lúc nào để con học 10 phút: sau bữa tối hay trước khi ngủ ạ? Em giúp {ph_ngan} đặt mục tiêu tuần đầu nhé.'},
  {id:'tet',khi:'Trước Tết hoặc kỳ nghỉ',loai:'Trước kỳ nghỉ',tx:'Tết đến rồi! Nhà mình có muốn tạm nghỉ web trong những ngày Tết không? {ph_hoa} chọn ngày quay lại, các tuần đạt mục tiêu của bé vẫn được giữ nguyên. Nếu muốn học nhẹ trong Tết, có bài "Chúc Tết bằng tiếng Trung" 5 phút: 新年快乐 xīnnián kuàilè.'},
  {id:'ve',khi:'Quay lại sau khi nghỉ',loai:'Chào mừng quay lại',tu_dong:true,tx:'Chào mừng bé {con} quay lại! Hôm nay chỉ có một bài ôn 5 phút với những từ bé đã biết, để bé thấy mình vẫn nhớ. Không cần học bù gì cả.'},
  {id:'moi_noi',khi:'Mời buổi nói thử (chỉ gửi khi ba mẹ đã đồng ý nhận thông tin ưu đãi; nếu là SMS thì gắn nhãn [QC])',loai:'Mời buổi nói thử',tx:'Bé {con} đã học đều {tx} tuần trên web. CES mời {ph_ngan} đăng ký một buổi nói 15 phút miễn phí với cô giáo: cô nghe bé phát âm tiếng Anh và tiếng Trung, sau đó gửi {ph_ngan} nhận xét bằng tiếng Việt. Buổi này không bắt buộc đăng ký lớp. Chọn giờ tại đây.'},
  {id:'gia_han',khi:'14 ngày trước khi hết gói',loai:'Nhắc gia hạn',tx:'Gói web của bé {con} hết hạn ngày {het}. Trong 3 tháng qua bé học {tong} ngày và đã thuộc {thuoc} từ (xem hồ sơ tiến bộ). Nếu {ph_ngan} muốn học tiếp khóa sau, các lựa chọn và giá đầy đủ ở đây. Gói không tự động gia hạn.'}
];
gc.KHONG_DUNG=['"Con sắp mất chuỗi 12 ngày"','"Con đang tụt lại so với các bạn"','"Chỉ còn hôm nay"','"Bạn X đã học 5 ngày rồi"','Bất kỳ câu nào gợi ý con sẽ thua kém nếu không mua gói'];
gc.dien=function(tx,v){
  const ph=v.ph||'ba mẹ'; const ngan=(ph.split(' ')[0]||'ba mẹ');
  const map=Object.assign({ph,ph_ngan:/^(chị|anh|cô|chú)$/i.test(ngan)?ngan:ph,ph_hoa:(/^(chị|anh|cô|chú)$/i.test(ngan)?ngan:ph).replace(/^./,c=>c.toUpperCase())},v);
  return tx.replace(/\{(\w+)\}/g,(m,k)=>map[k]!=null&&map[k]!==''?map[k]:m);
};

/* ---------- cổng dành cho ba mẹ (và thầy cô) ---------- */
const CONG='atk2-cong';
gc.daQuaCong=()=>{ try{ const t=+sessionStorage.getItem(CONG)||0; return Date.now()-t<15*60*1000; }catch(e){ return false; } };
gc.cong=function(cb,huy){
  if(gc.daQuaCong()){ cb(); return; }
  const a=6+Math.floor(Math.random()*7), b=3+Math.floor(Math.random()*7);
  const el=document.createElement('div'); el.className='gate'; el.setAttribute('role','dialog'); el.setAttribute('aria-modal','true');
  el.innerHTML=`<form class="gate-b card"><b class="gate-t">Dành cho người lớn</b>
    <p class="note">Để vào khu vực này, ba mẹ hoặc thầy cô nhập kết quả phép tính:</p>
    <label class="gate-q"><span>${a} × ${b} =</span><input inputmode="numeric" autocomplete="off" aria-label="Kết quả"></label>
    <p class="gate-e note" aria-live="polite"></p>
    <div class="gate-r"><button type="button" class="gate-x">Quay lại</button><button class="gate-ok">Vào</button></div></form>`;
  document.body.appendChild(el);
  const inp=el.querySelector('input'); setTimeout(()=>inp.focus(),50);
  const close=()=>el.remove();
  el.querySelector('.gate-x').onclick=()=>{ close(); huy&&huy(); };
  el.querySelector('form').onsubmit=e=>{ e.preventDefault();
    if(+inp.value===a*b){ try{ sessionStorage.setItem(CONG,String(Date.now())); }catch(e){} close(); cb(); }
    else { el.querySelector('.gate-e').textContent='Chưa đúng, thử lại nhé.'; inp.value=''; inp.focus(); } };
};
})();
