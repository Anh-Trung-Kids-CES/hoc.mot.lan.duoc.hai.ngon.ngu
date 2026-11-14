# Bảng thiết kế Phép thuật lời nói – 21 unit còn lại. Mỗi phép: (k, EN, ZH, hiệu ứng, vật, [lời đáp EN, ZH] nếu có, param)
# vật: t:=tranh kho (cắt nền trắng) · n:=nhân vật cắt nền có sẵn · new:=phải vẽ mới · code:=hiệu ứng viết bằng mã (miễn phí)
S=lambda k,en,zh,fx,objs,reply=None,param=False:dict(k=k,en=en,zh=zh,fx=fx,objs=objs,reply=reply,param=param)
U={}
U[('LS','2')]=dict(name='Name and age',kind='Đếm là hiện',bg='ls_park',spells=[
 S('hello_cake','Hello, cake!','蛋糕，你好！','bánh hiện ra',['new:cake_plain']),
 S('num','Six!','六！','bánh có đúng số nến (con tự chọn 1–10)',['code:candles'],param=True),
 S('hbd','Happy birthday!','生日快乐！','nến sáng, pháo giấy',['code:confetti']),
 S('name','My name is Leo!','我叫Leo！','Leo hiện, thẻ tên bay lên',['n:kids_leo_a','code:name_tag']),
 S('ask_name',"What's your name?",'你叫什么名字？','bạn trên cảnh đáp bằng tên',['n:kids_bong_a'],reply=('My name is Bông.','我叫Bông。')),
 S('ask_age','How old are you?','你几岁？','bạn đáp, nến đổi theo',['code:candles'],reply=("I'm six!",'我六岁！')),
])
U[('LS','3')]=dict(name='Family',kind='Gọi người nhà',bg='ls_home',spells=[
 S('hi_grandpa','Hello, Grandpa!','爷爷好！','ông hiện ra',['n:fam_bong_ong_a']),
 S('hi_grandma','Hello, Grandma!','奶奶好！','bà hiện ra',['n:fam_bong_ba_a']),
 S('hi_bigbro','Hello, big brother!','哥哥好！','anh hiện ra',['n:fam_bong_anh_trai_a']),
 S('hi_lilsis','Hello, little sister!','妹妹好！','em gái hiện ra',['n:fam_bong_em_gai_a']),
 S('baby','Wow! A baby!','哇！宝宝！','em bé hiện ra, cả nhà vây lại',['new:baby']),
 S('family','My family!','我的家人！','cả nhà hiện đủ',['n:fam_bong_bo_a','n:fam_bong_me_a']),
])
U[('LS','4')]=dict(name='Body',kind='Robo ghép cơ thể',bg='ls_class',spells=[
 S('hi_robo','Hello, Robo!','Robo，你好！','Robo hiện ra',['new:robo']),
 S('head','I have a head!','我有一个头！','đầu Robo sáng, chớp',['new:robo']),
 S('eyes','I have eyes!','我有眼睛！','mắt Robo chớp',['new:robo']),
 S('ears','I have ears!','我有耳朵！','tai Robo vẫy',['new:robo']),
 S('nose','Touch your nose!','摸摸鼻子！','Robo đưa tay chạm mũi',['new:robo']),
 S('mouth','I have a small mouth!','我有小小的嘴巴！','miệng Robo cười',['new:robo']),
])
U[('LS','5')]=dict(name='Feelings',kind='Gương mặt đổi theo cảm xúc',bg='ls_home',spells=[
 S('happy','I am happy!','我很开心！','mặt vui hiện ra, nhảy',['t:happy']),
 S('sad','I am sad.','我很难过。','mặt buồn',['t:sad']),
 S('hungry','I am hungry!','我饿了！','mặt đói, bụng kêu',['t:hungry']),
 S('sleepy','I am sleepy.','我好困。','mặt buồn ngủ, trời dịu tối',['t:sleepy']),
 S('scared','I am scared!','我很害怕！','mặt sợ, run',['t:scared']),
 S('angry','I am angry!','我很生气！','mặt giận, bốc khói',['t:angry']),
])
U[('LS','6')]=dict(name='School',kind='Đồ vật lên bàn',bg='ls_school',spells=[
 S('book','This is a book!','这是书！','sách hiện lên bàn',['t:book']),
 S('pen','This is a pen!','这是笔！','bút hiện',['t:pen']),
 S('pencil','This is a pencil!','这是铅笔！','bút chì hiện',['new:pencil']),
 S('ruler','This is a ruler!','这是尺子！','thước hiện',['t:ruler']),
 S('eraser','This is an eraser!','这是橡皮！','tẩy hiện',['t:eraser']),
 S('bag','A new schoolbag!','新书包！','cặp mới hiện, lấp lánh',['t:schoolbag']),
])
U[('LS','7')]=dict(name='House',kind='Ở đâu nhỉ',bg='ls_home',spells=[
 S('where','Where is my book?','我的书在哪儿？','sách biến mất, bạn đi tìm',['t:book']),
 S('on_table','On the table!','在桌子上！','sách bay lên bàn',['t:book','t:table']),
 S('under_bed','Under the bed!','在床下面！','sách chui xuống gầm giường',['t:book','t:bed']),
 S('on_sofa','On the sofa!','在沙发上！','sách bay lên sofa',['t:book','t:sofa']),
 S('under_chair','Under the chair!','在椅子下面！','sách chui gầm ghế',['t:book','t:chair']),
 S('here','Here it is! Thank you!','在这儿！谢谢！','bạn cầm lại sách, cảm ơn',['t:book']),
])
U[('LS','8')]=dict(name='Animals',kind='Ra lệnh cho bạn',bg='ls_park',spells=[
 S('dog_run','The dog can run!','小狗能跑！','chó con chạy',['n:pets_cun_dung_a']),
 S('bird_fly','The bird can fly!','小鸟能飞！','chim bay',['t:bird']),
 S('fish_swim','The fish can swim!','小鱼能游泳！','cá bơi',['t:fish']),
 S('rabbit_jump','The rabbit can jump!','兔子能跳！','thỏ nhảy',['t:rabbit']),
 S('hi_duck','Hello, duck!','小鸭子，你好！','vịt hiện ra, vẫy cánh',['t:duck']),
 S('ready_go','Ready, go!','预备，跑！','các bạn đua chạy',['n:pets_cun_dung_a','n:pets_meo_dung_a','t:duck']),
])
U[('LS','9')]=dict(name='Food',kind='Cho bạn ăn',bg='ls_park',spells=[
 S('eat_apple','I eat an apple!','我吃苹果！','táo bay vào miệng Bông',['t:apple','n:kids_bong_a']),
 S('eat_banana','I eat bananas!','我吃香蕉！','chuối bay vào miệng',['t:banana']),
 S('eat_rice','I eat rice!','我吃米饭！','bát cơm, Bông ăn',['t:rice']),
 S('drink_juice','I drink juice!','我喝果汁！','ly nước ép, Bông uống',['t:juice']),
 S('drink_milk','I drink milk!','我喝牛奶！','sữa, Bông uống',['t:milk']),
 S('like_pizza','I like pizza!','我喜欢比萨！','bánh pizza, trái tim bay lên',['t:pizza']),
])
U[('LS','10')]=dict(name='Weather',kind='Bầu trời biết nghe',bg='ls_park',spells=[
 S('sunny','It is sunny!','今天晴天！','mặt trời mọc, trời sáng',['code:weather']),
 S('cloudy','It is cloudy.','今天多云。','mây kéo đến',['code:weather']),
 S('windy','It is windy!','今天刮风！','gió thổi, cây lá nghiêng',['code:weather']),
 S('rainy','It is rainy!','今天下雨！','mưa rơi',['code:weather']),
 S('snowy','It is snowy!','今天下雪！','tuyết rơi',['code:weather']),
 S('cold','It is cold!','今天很冷！','trời xanh lạnh, các bạn co lại',['code:weather']),
])
U[('LS','11')]=dict(name='Colours',kind='Phép màu tô màu',bg='ls_park',spells=[
 S('red','Red!','红色！','bóng bay đổi màu đỏ (con chọn 1 trong 10 màu)',['new:balloon_white'],param=True),
 S('yellow','Yellow!','黄色！','bóng bay vàng',['new:balloon_white'],param=True),
 S('blue','Blue!','蓝色！','bóng bay xanh dương',['new:balloon_white'],param=True),
 S('green','Green!','绿色！','bóng bay xanh lá',['new:balloon_white'],param=True),
 S('pink','Pink!','粉色！','bóng bay hồng',['new:balloon_white'],param=True),
 S('rainbow','A rainbow!','彩虹！','cầu vồng hiện, 7 sắc lần lượt sáng',['t:rainbow']),
])
U[('LS','12')]=dict(name='Numbers',kind='Đếm là hiện',bg='ls_park',spells=[
 S('two_dogs','Two dogs!','两只狗！','hiện đúng 2 chó con',['n:pets_cun_dung_a'],param=True),
 S('three_cakes','Three cakes!','三个蛋糕！','hiện đúng 3 bánh',['new:cake_plain'],param=True),
 S('five_monkeys','Five monkeys!','五只猴子！','hiện đúng 5 khỉ',['t:monkey'],param=True),
 S('ten_eggs','Ten eggs!','十个鸡蛋！','hiện đúng 10 trứng',['t:egg'],param=True),
 S('how_many','How many cakes? Four!','几个蛋糕？四个！','bạn hỏi, con đếm: hiện 4 bánh',['new:cake_plain'],reply=('Four!','四个！')),
 S('hbd_leo','Happy birthday, Leo!','Leo，生日快乐！','Leo + bánh + pháo giấy',['n:kids_leo_a','new:cake_plain','code:confetti']),
])
# ---------------- Seedling ----------------
U[('SD','2')]=dict(name='Name and age',kind='Đếm là hiện',bg='ls_park',spells=[
 S('hbd_vu','Happy birthday, Vũ!','Vũ，生日快乐！','Vũ + bánh + pháo giấy',['n:nv_vu_a','new:cake_plain','code:confetti']),
 S('name','My name is Xiaomei.','我叫Xiaomei。','thẻ tên Xiaomei bay lên',['n:kids_xiaomei_a','code:name_tag']),
 S('ask_name',"What's your name?",'你叫什么名字？','bạn đáp bằng tên',['n:kids_bong_a'],reply=('My name is Bông.','我叫Bông。')),
 S('age',"I'm six years old.",'我六岁。','nến đúng số tuổi (con chọn 1–10)',['code:candles'],param=True),
 S('ask_age','How old are you?','你几岁？','bạn đáp, nến đổi theo',['code:candles'],reply=("I'm seven years old.",'我七岁。')),
 S('meet','Nice to meet you!','很高兴认识你！','hai bạn bắt tay, vẫy chào',['n:kids_anna_a','n:kids_xiaomei_a']),
])
U[('SD','3')]=dict(name='Family',kind='Gọi người nhà + ảnh gia đình',bg='ls_home',spells=[
 S('mother','She is my mother.','她是我妈妈。','mẹ hiện ra',['n:fam_bong_me_a']),
 S('father','He is my father.','他是我爸爸。','bố hiện ra',['n:fam_bong_bo_a']),
 S('older_bro','He is my older brother.','他是我哥哥。','anh hiện ra',['n:fam_bong_anh_trai_a']),
 S('younger_sis','She is my younger sister.','她是我妹妹。','em gái hiện ra',['n:fam_bong_em_gai_a']),
 S('photo','Look at my family photo!','看我的家庭照片！','khung ảnh gia đình hiện, cả nhà trong ảnh',['t:people','code:photo_frame']),
 S('baby','Look! A baby!','看！一个宝宝！','em bé hiện ra',['new:baby']),
])
U[('SD','5')]=dict(name='Feelings',kind='Gương mặt + ăn uống',bg='ls_home',spells=[
 S('sleepy','I feel sleepy.','我很困。','mặt buồn ngủ, trời tối dần',['t:sleepy']),
 S('excited','I feel excited!','我很兴奋！','mặt hào hứng, nhảy',['t:excited']),
 S('hungry',"I'm hungry!",'我饿了！','bánh sinh nhật hiện, bạn nhìn thèm',['t:hungry','new:cake_plain']),
 S('thirsty',"I'm thirsty!",'我渴了！','ly nước hiện ra',['t:thirsty','t:water']),
 S('hbd_leo','Happy birthday, Leo!','Leo，生日快乐！','Leo + bánh + pháo giấy',['n:kids_leo_a','new:cake_plain','code:confetti']),
 S('night','Go to bed. Good night!','去睡觉吧。晚安！','trời tối, giường hiện, bạn đi ngủ',['t:bed','code:night']),
])
U[('SD','6')]=dict(name='School things',kind='Đồ vật + xếp hàng',bg='ls_school',spells=[
 S('crayon','I want a red crayon, please!','我要一支红色的蜡笔！','bút sáp đỏ hiện ra',['new:crayon']),
 S('scissors','Look! Scissors!','看！剪刀！','kéo hiện ra',['t:scissors']),
 S('glue','This is glue.','这是胶水。','keo hiện ra',['t:glue']),
 S('bag','My new schoolbag!','我的新书包！','cặp mới hiện, lấp lánh',['t:schoolbag']),
 S('line','Make a line, please.','请排队。','các bạn xếp thành hàng',['n:kids_bong_a','n:kids_anna_a','n:nv_vu_a']),
 S('letters','These and those are letters!','这些和那些都是字母！','chữ cái bay quanh',['t:letter']),
])
U[('SD','7')]=dict(name='Home',kind='Ở đâu nhỉ',bg='ls_home',spells=[
 S('where','Where is my ball?','我的球在哪儿？','bóng biến mất, bạn đi tìm',['t:ball']),
 S('under_bed',"It's under the bed!",'就在床下面！','bóng lăn xuống gầm giường',['t:ball','t:bed']),
 S('on_sofa',"It's on the sofa!",'在沙发上！','bóng nảy lên sofa',['t:ball','t:sofa']),
 S('dining','Is it in the dining room?','在餐厅吗？','cảnh đổi sang phòng ăn, bạn đáp',['t:dining_room'],reply=('No, it is not.','不在。')),
 S('living','This is the living room.','这是客厅。','cảnh đổi sang phòng khách',['t:living_room']),
 S('found','Right here! Well done!','就在这里！真棒！','bóng hiện, pháo giấy',['t:ball','code:confetti']),
])
U[('SD','8')]=dict(name='Animals',kind='Ra lệnh cho bạn (có / không thể)',bg='ls_park',spells=[
 S('bird_fly','The bird can fly.','鸟能飞。','chim bay',['t:bird']),
 S('fish_swim','The fish can swim.','鱼能游泳。','cá bơi',['t:fish']),
 S('dog_run','The dog can run.','狗能跑。','chó chạy',['n:pets_cun_dung_a']),
 S('rabbit_jump','The rabbit can jump.','兔子能跳。','thỏ nhảy',['t:rabbit']),
 S('frog_cant',"The frog can't fly.",'青蛙不能飞。','ếch nhảy lên rồi rơi (vui)',['t:frog']),
 S('bear_swim','The polar bear can swim.','北极熊能游泳。','gấu bắc cực bơi',['t:polar_bear']),
])
U[('SD','9')]=dict(name='Food',kind='Thích / không thích',bg='ls_park',spells=[
 S('like_apple','I like apples!','我喜欢苹果！','táo hiện, tim bay lên',['t:apple']),
 S('like_ice','I like ice cream!','我喜欢冰淇淋！','kem hiện, tim bay lên',['t:ice_cream']),
 S('dont_fruit',"I don't like fruit.",'我不喜欢水果。','trái cây hiện rồi bị gạch ×',['t:fruit','t:cross']),
 S('or','Noodles or ice cream?','面条还是冰淇淋？','hai món hiện, bạn chọn',['t:noodles','t:ice_cream']),
 S('no_thanks','No, thank you!','不要，谢谢！','món ăn lùi đi, bạn xua tay',['code:push_away']),
 S('burger','Do you like burgers?','你喜欢汉堡吗？','bánh mì kẹp hiện, bạn đáp',['t:burger'],reply=('Yes, I do!','喜欢！')),
])
U[('SD','10')]=dict(name='Weather',kind='Bầu trời + mặc đồ',bg='ls_park',spells=[
 S('sunny',"It's sunny today.",'今天晴天。','mặt trời mọc',['code:weather']),
 S('windy',"It's windy!",'今天刮风！','gió thổi',['code:weather']),
 S('rainy',"Oh no! It's raining!",'哎呀！下雨了！','mưa rơi, ô hiện ra',['code:weather','t:umbrella']),
 S('snowy',"It's snowy! A snowman!",'下雪了！雪人！','tuyết rơi, người tuyết hiện',['code:weather','t:snowman']),
 S('coat','Wear a coat!','穿外套！','áo khoác hiện, bạn mặc vào',['t:coat']),
 S('hat','Wear a hat!','戴帽子！','mũ hiện, bạn đội',['t:hat']),
])
U[('SD','11')]=dict(name='Clothes and colours',kind='Phép màu tô màu',bg='ls_home',spells=[
 S('pink_dress','A pink dress!','粉色的裙子！','váy đổi màu hồng (con chọn màu)',['t:dress'],param=True),
 S('blue_shorts','Blue shorts!','蓝色的短裤！','quần short đổi xanh',['t:shorts'],param=True),
 S('red_socks','Red socks!','红色的袜子！','đôi tất đổi đỏ',['t:sock'],param=True),
 S('gold','Gold!','金色！','đồ vật lấp lánh vàng',['t:glasses'],param=True),
 S('colour_dress','Colour the dress pink!','把裙子涂成粉色！','váy được tô hồng',['t:dress']),
 S('fav','What colour do you like?','你喜欢什么颜色？','bạn đáp một màu, đồ đổi màu',['t:dress'],reply=('I like gold!','我喜欢金色！')),
])
U[('SD','12')]=dict(name='Party and time',kind='Đếm người + giờ + chụp ảnh',bg='ls_park',spells=[
 S('count','Let\'s count the people!','我们数一数人吧！','người hiện lần lượt 1→10',['n:kids_bong_a','n:kids_anna_a','n:nv_vu_a','n:kids_leo_a','n:kids_xiaomei_a']),
 S('ten','Ten people.','十个人。','đủ 10 người',['t:ten_people']),
 S('time','What time is it? It\'s eight o\'clock.','现在几点？现在八点。','đồng hồ chỉ 8 giờ',['code:clock']),
 S('photo','Take a photo!','拍张照片！','đèn flash, ảnh hiện ra',['code:flash','t:take_a_photo']),
 S('hooray','Hooray!','耶！','pháo giấy, mọi người nhảy',['code:confetti']),
 S('cake','Mrs Lan, this cake is for you!','Lan老师，这个蛋糕是给您的！','cô Lan + bánh',['n:nv_lan_a','new:cake_plain']),
])
