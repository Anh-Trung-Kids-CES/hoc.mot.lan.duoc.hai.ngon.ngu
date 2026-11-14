import sys; sys.path.insert(0,'.')
from spec import U,S
# ---- U1 / U4: các phép đã có (Little Seed U1, Seedling U1 và U4 hiện chung một bản) – đưa vào cùng khuôn ----
U[('LS','1')]=dict(name='Greeting',kind='Gọi bạn ra / cho về, đổi trời',bg='ls_park',spells=[
 S('hi_kitten','Hello, kitten!','小猫，你好！','mèo con hiện ra',['n:pets_meo_dung_a']),
 S('hi_teacher','Hello, teacher!','老师，你好！','cô giáo hiện ra',['n:huou_huou1_a']),
 S('hi_mommy','Hello, mommy!','妈妈，你好！','mẹ hiện ra',['n:fam_bong_me_a']),
 S('hi_all','Hello, everyone!','大家好！','cả nhóm bạn hiện ra',['n:kids_bong_a','n:kids_anna_a']),
 S('day','Good morning!','早上好！','trời sáng',['code:weather']),
 S('night','Good night!','晚安！','trời tối, các bạn về',['code:night']),
 S('go',"Let's go!",'走吧！','đổi cảnh',['code:scene']),
 S('bye_puppy','Goodbye, puppy!','小狗，再见！','chó con đi về',['n:pets_cun_dung_a']),
])
U[('SD','1')]=dict(name='Greeting',kind='Gọi bạn ra / cho về, đổi trời',bg='ls_school',spells=[
 S('hi_teacher','Good morning, Mrs Lan!','Lan老师，早上好！','cô Lan hiện ra',['n:nv_lan_a']),
 S('hi_grandpa','Hello, Grandpa!','爷爷，您好！','ông hiện ra',['n:fam_bong_ong_a']),
 S('hi_kids','Hello, kids!','小朋友们，你们好！','Bông, Anna, Vũ hiện ra',['n:kids_bong_a','n:kids_anna_a','n:nv_vu_a']),
 S('night','See you tomorrow!','明天见！','trời tối, các bạn về',['code:night']),
 S('go',"Let's go!",'我们去公园！','đổi cảnh',['code:scene']),
 S('tall','The man is very tall.','表演的人个子很高。','người diễn cao vút',['n:nv_nguoi_dien_a']),
])
U[('SD','4')]=dict(name='Body',kind='Ra lệnh cho bạn + cơ thể',bg='ls_class',spells=[
 S('clap','Clap your hands!','拍拍手！','các bạn vỗ tay',['t:clap_your_hands']),
 S('stamp','Stamp your feet!','跺跺脚！','các bạn dậm chân',['t:stamp_your_feet']),
 S('mouth','Open your mouth!','张大口！','các bạn há miệng',['t:open_your_mouth']),
 S('hands','Two hands!','两只手！','hai bàn tay hiện ra, vẫy',['t:hand']),
 S('arms','Long arms, long legs!','胳膊很长，腿也很长！','tay chân dài ra',['t:arm','t:leg']),
 S('body','This is my body.','这是我的身体。','hình cơ thể hiện ra',['t:body']),
])
# ---- Bậc 1: từ khoá (EN, ZH) theo thứ tự phép ----
W={
('LS','1'):[('kitten','小猫'),('teacher','老师'),('mommy','妈妈'),('everyone','大家'),('morning','早上'),('night','晚'),('go','走'),('puppy','小狗')],
('LS','2'):[('cake','蛋糕'),('six','六'),('birthday','生日'),('Leo','Leo'),('name','名字'),('old','几岁')],
('LS','3'):[('grandpa','爷爷'),('grandma','奶奶'),('brother','哥哥'),('sister','妹妹'),('baby','宝宝'),('family','家人')],
('LS','4'):[('Robo','Robo'),('head','头'),('eyes','眼睛'),('ears','耳朵'),('nose','鼻子'),('mouth','嘴巴')],
('LS','5'):[('happy','开心'),('sad','难过'),('hungry','饿'),('sleepy','困'),('scared','害怕'),('angry','生气')],
('LS','6'):[('book','书'),('pen','笔'),('pencil','铅笔'),('ruler','尺子'),('eraser','橡皮'),('schoolbag','书包')],
('LS','7'):[('where','哪儿'),('table','桌子'),('bed','床'),('sofa','沙发'),('chair','椅子'),('here','这儿')],
('LS','8'):[('dog','小狗'),('bird','小鸟'),('fish','小鱼'),('rabbit','兔子'),('duck','小鸭子'),('go','预备')],
('LS','9'):[('apple','苹果'),('banana','香蕉'),('rice','米饭'),('juice','果汁'),('milk','牛奶'),('pizza','比萨')],
('LS','10'):[('sunny','晴天'),('cloudy','多云'),('windy','刮风'),('rainy','下雨'),('snowy','下雪'),('cold','冷')],
('LS','11'):[('red','红色'),('yellow','黄色'),('blue','蓝色'),('green','绿色'),('pink','粉色'),('rainbow','彩虹')],
('LS','12'):[('dogs','狗'),('cakes','蛋糕'),('monkeys','猴子'),('eggs','鸡蛋'),('how many','几个'),('birthday','生日')],
('SD','1'):[('Mrs Lan','Lan老师'),('Grandpa','爷爷'),('kids','小朋友'),('tomorrow','明天'),('go','去'),('tall','高')],
('SD','2'):[('Vũ','Vũ'),('name','名字'),('name','叫'),('six','六岁'),('old','几岁'),('meet','认识')],
('SD','3'):[('mother','妈妈'),('father','爸爸'),('brother','哥哥'),('sister','妹妹'),('photo','照片'),('baby','宝宝')],
('SD','4'):[('clap','拍'),('stamp','跺'),('mouth','口'),('hands','手'),('arms','胳膊'),('body','身体')],
('SD','5'):[('sleepy','困'),('excited','兴奋'),('hungry','饿'),('thirsty','渴'),('birthday','生日'),('night','晚安')],
('SD','6'):[('crayon','蜡笔'),('scissors','剪刀'),('glue','胶水'),('schoolbag','书包'),('line','排队'),('letters','字母')],
('SD','7'):[('ball','球'),('bed','床'),('sofa','沙发'),('dining room','餐厅'),('living room','客厅'),('here','这里')],
('SD','8'):[('bird','鸟'),('fish','鱼'),('dog','狗'),('rabbit','兔子'),('frog','青蛙'),('polar bear','北极熊')],
('SD','9'):[('apples','苹果'),('ice cream','冰淇淋'),('fruit','水果'),('noodles','面条'),('thank you','谢谢'),('burgers','汉堡')],
('SD','10'):[('sunny','晴天'),('windy','刮风'),('rainy','下雨'),('snowman','雪人'),('coat','外套'),('hat','帽子')],
('SD','11'):[('dress','裙子'),('shorts','短裤'),('socks','袜子'),('gold','金色'),('colour','涂'),('colour','颜色')],
('SD','12'):[('people','人'),('ten','十个'),('time','几点'),('photo','照片'),('hooray','耶'),('cake','蛋糕')],
}
# ---- Bậc 3: hai câu dài mẫu mỗi unit (có thu giọng): (EN, ZH) ----
LONG={
('LS','1'):[('Hello, kitten! Hello, puppy!','小猫，你好！小狗，你好！'),('Good morning, Mommy! Goodbye, Daddy!','妈妈，早上好！爸爸，再见！')],
('LS','2'):[("My name is Leo. I'm six!",'我叫Leo。我六岁！'),('Hello, cake! One, two, three!','蛋糕，你好！一、二、三！')],
('LS','3'):[('Hello, Grandpa! Hello, Grandma!','爷爷好！奶奶好！'),('He is my daddy! She is my mommy!','这是我爸爸！这是我妈妈！')],
('LS','4'):[('I have eyes! I have a nose!','我有眼睛！我有鼻子！'),('I have a head! I have two hands!','我有一个头！我有两只手！')],
('LS','5'):[("I am happy! Let's go!",'我很开心！走吧！'),('I am hungry. I am sleepy.','我饿了。我好困。')],
('LS','6'):[('This is a book! This is a pen!','这是书！这是笔！'),('This is a new schoolbag! I am happy!','这是新书包！我很开心！')],
('LS','7'):[('Where is my book? On the table!','我的书在哪儿？在桌子上！'),('Under the chair! Here it is!','在椅子下面！在这儿！')],
('LS','8'):[('The dog can run! The bird can fly!','小狗能跑！小鸟能飞！'),('The fish can swim! The rabbit can jump!','小鱼能游泳！兔子能跳！')],
('LS','9'):[('I eat an apple! I drink milk!','我吃苹果！我喝牛奶！'),('I like pizza! I like bananas!','我喜欢比萨！我喜欢香蕉！')],
('LS','10'):[('It is sunny! I am happy!','今天晴天！我很开心！'),('It is rainy. It is cold.','今天下雨。今天很冷。')],
('LS','11'):[('Red! Yellow! Blue!','红色！黄色！蓝色！'),('Look! A rainbow! Pink! Green!','看！彩虹！粉色！绿色！')],
('LS','12'):[('Two dogs! Three cakes!','两只狗！三个蛋糕！'),('Hello, everyone! Happy birthday, Leo!','大家好！Leo，生日快乐！')],
('SD','1'):[('Good morning, Mrs Lan! Hello, Grandpa!','Lan老师，早上好！爷爷，您好！'),("Goodbye, Mrs Lan! See you tomorrow!",'Lan老师再见！明天见！')],
('SD','2'):[("My name is Xiaomei. I'm six years old.",'我叫Xiaomei。我六岁。'),('Happy birthday, Vũ! Nice to meet you!','Vũ，生日快乐！很高兴认识你！')],
('SD','3'):[('She is my mother. He is my father.','她是我妈妈。他是我爸爸。'),('Look at my family photo! He is my older brother.','看我的家庭照片！他是我哥哥。')],
('SD','4'):[('Clap your hands! Stamp your feet!','拍拍手！跺跺脚！'),('Look, Grandpa! Long arms, long legs!','爷爷，看！胳膊很长，腿也很长！')],
('SD','5'):[("I feel sleepy. I'm hungry.",'我很困。我饿了。'),('Happy birthday, Leo! I feel excited!','Leo，生日快乐！我很兴奋！')],
('SD','6'):[('Look! Scissors! This is glue.','看！剪刀！这是胶水。'),('I want a red crayon, please! Thank you!','我要一支红色的蜡笔！谢谢！')],
('SD','7'):[("Where is my ball? It's under the bed!",'我的球在哪儿？就在床下面！'),("It's on the sofa! Right here! Well done!",'在沙发上！就在这里！真棒！')],
('SD','8'):[('The bird can fly. The fish can swim.','鸟能飞。鱼能游泳。'),("The dog can run. The frog can't fly.",'狗能跑。青蛙不能飞。')],
('SD','9'):[("I like ice cream! I don't like noodles.",'我喜欢冰淇淋！我不喜欢面条。'),('Do you like burgers? Yes, I do! I like chips!','你喜欢汉堡吗？喜欢！我喜欢薯条！')],
('SD','10'):[("It's rainy! Wear a coat!",'下雨了！穿外套！'),("It's cold. Wear a hat and a scarf!",'很冷。戴帽子和围巾！')],
('SD','11'):[('A pink dress! Blue shorts!','粉色的裙子！蓝色的短裤！'),('What colour do you like? I like gold!','你喜欢什么颜色？我喜欢金色！')],
('SD','12'):[('Ten people. Take a photo!','十个人。拍张照片！'),("It's eight o'clock. Hooray!",'现在八点。耶！')],
}
# ---- Phép nối: 2 cặp phép mỗi unit (con nói liền một hơi) ----
COMBO={
('LS','1'):[('hi_kitten','go'),('hi_all','day')],('LS','2'):[('hello_cake','hbd'),('name','ask_age')],
('LS','3'):[('hi_grandpa','hi_grandma'),('hi_bigbro','hi_lilsis')],('LS','4'):[('head','eyes'),('nose','mouth')],
('LS','5'):[('happy','hungry'),('sleepy','scared')],('LS','6'):[('book','pen'),('ruler','eraser')],
('LS','7'):[('where','on_table'),('under_bed','here')],('LS','8'):[('dog_run','bird_fly'),('fish_swim','rabbit_jump')],
('LS','9'):[('eat_apple','drink_milk'),('eat_rice','drink_juice')],('LS','10'):[('sunny','windy'),('rainy','cold')],
('LS','11'):[('red','yellow'),('blue','rainbow')],('LS','12'):[('two_dogs','three_cakes'),('five_monkeys','ten_eggs')],
('SD','1'):[('hi_teacher','hi_grandpa'),('night','go')],('SD','2'):[('hbd_vu','meet'),('name','age')],
('SD','3'):[('mother','father'),('older_bro','younger_sis')],('SD','4'):[('clap','stamp'),('mouth','hands')],
('SD','5'):[('sleepy','hungry'),('excited','hbd_leo')],('SD','6'):[('scissors','glue'),('crayon','bag')],
('SD','7'):[('where','under_bed'),('on_sofa','found')],('SD','8'):[('bird_fly','fish_swim'),('dog_run','frog_cant')],
('SD','9'):[('like_apple','like_ice'),('or','no_thanks')],('SD','10'):[('sunny','windy'),('rainy','coat')],
('SD','11'):[('pink_dress','blue_shorts'),('red_socks','gold')],('SD','12'):[('count','ten'),('photo','hooray')],
}
# ---- Mini hội thoại: 2 cặp hỏi–đáp mỗi thứ tiếng; lượt 3 = con hỏi lại bằng chính câu hỏi lượt 1 ----
DIA={
('LS','1'):dict(en=[('Hello!','Hello, Leo!'),('Goodbye!','Goodbye, Leo!')],zh=[('你好！','你好，Xiaomei！'),('再见！','再见，Xiaomei！')]),
('LS','2'):dict(en=[("What's your name?",'My name is Leo.'),('How old are you?',"I'm six.")],zh=[('你叫什么名字？','我叫Leo。'),('你几岁？','我六岁。')]),
('LS','3'):dict(en=[('Who is he?','He is my grandpa!'),('Who is she?','She is my grandma!')],zh=[('这是谁？','这是我爷爷！'),('这是谁？','这是我奶奶！')]),
('LS','4'):dict(en=[('Touch your nose!','I have a nose!'),('Touch your ears!','I have ears!')],zh=[('摸摸鼻子！','我有鼻子！'),('摸摸耳朵！','我有耳朵！')]),
('LS','5'):dict(en=[('How do you feel?','I am happy!'),('How do you feel?','I am sleepy.')],zh=[('你心情怎么样？','我很开心！'),('你心情怎么样？','我好困。')]),
('LS','6'):dict(en=[('What is this?','This is a book!'),('What is this?','This is a pencil!')],zh=[('这是什么？','这是书！'),('这是什么？','这是铅笔！')]),
('LS','7'):dict(en=[('Where is the book?','On the table!'),('Where is the book?','Under the bed!')],zh=[('书在哪儿？','在桌子上！'),('书在哪儿？','在床下面！')]),
('LS','8'):dict(en=[('Hello, dog! Ready, go!','The dog can run!'),('Hello, bird! Ready, go!','The bird can fly!')],zh=[('小狗，你好！预备，跑！','小狗能跑！'),('小鸟，你好！预备，飞！','小鸟能飞！')]),
('LS','9'):dict(en=[('What do you like?','I like apples!'),('What do you like?','I like pizza!')],zh=[('你喜欢什么？','我喜欢苹果！'),('你喜欢什么？','我喜欢比萨！')]),
('LS','10'):dict(en=[('What is the weather today?','It is sunny!'),('What is the weather today?','It is rainy.')],zh=[('今天天气怎么样？','今天晴天！'),('今天天气怎么样？','今天下雨。')]),
('LS','11'):dict(en=[('What colour is it?',"It's red!"),('What colour is it?',"It's blue!")],zh=[('这是什么颜色？','是红色！'),('这是什么颜色？','是蓝色！')]),
('LS','12'):dict(en=[('How many cakes?','Four cakes!'),('How many dogs?','Two dogs!')],zh=[('几个蛋糕？','四个蛋糕！'),('几只狗？','两只狗！')]),
('SD','1'):dict(en=[('Good morning, class!','Good morning, Mrs Lan!'),('Goodbye, class!','Goodbye, Mrs Lan!')],zh=[('小朋友们，早上好！','Lan老师，早上好！'),('小朋友们，再见！','Lan老师再见！')]),
('SD','2'):dict(en=[("What's your name?",'My name is Leo.'),('How old are you?',"I'm six years old.")],zh=[('你叫什么名字？','我叫Leo。'),('你几岁？','我六岁。')]),
('SD','3'):dict(en=[('Who is she?','She is my mother.'),('Who is he? Is he your father?',"No! He is my older brother.")],zh=[('她是谁？','她是我妈妈。'),('他是谁？是你爸爸吗？','不是！他是我哥哥。')]),
('SD','4'):dict(en=[('Clap your hands!',"Clap your hands! It's fun!"),('Stamp your feet!',"Stamp your feet! It's fun!")],zh=[('拍拍手！','拍拍手！真好玩！'),('跺跺脚！','跺跺脚！真好玩！')]),
('SD','5'):dict(en=[('How do you feel?','I feel excited!'),('Are you hungry?',"Yes, I'm hungry!")],zh=[('你感觉怎么样？','我很兴奋！'),('你饿了吗？','我饿了。')]),
('SD','6'):dict(en=[('What is this?','This is glue.'),('Is that a new schoolbag?',"Yes, it's my new schoolbag!")],zh=[('这是什么？','这是胶水。'),('那是新书包吗？','对，这是我的新书包！')]),
('SD','7'):dict(en=[('Where is the ball?',"It's under the bed!"),('Is it in the dining room?',"No, it's not. It's on the sofa!")],zh=[('球在哪儿？','就在床下面！'),('在餐厅吗？','不在。在沙发上！')]),
('SD','8'):dict(en=[('Can the duck fly?','Yes, it can!'),('Can the frog fly?',"No, it can't!")],zh=[('鸭子能飞吗？','能！'),('青蛙能飞吗？','不能！')]),
('SD','9'):dict(en=[('Do you like noodles?','Yes, I do! Noodles are nice!'),('Do you want candy?','No, thank you!')],zh=[('你喜欢面条吗？','喜欢！面条好吃！'),('你想吃糖果吗？','不要，谢谢！')]),
('SD','10'):dict(en=[("What's the weather today?","It's rainy!"),('Where can we play?','In the park! It is sunny today.')],zh=[('今天天气怎么样？','下雨了！'),('我们能在哪儿玩？','在公园！今天晴天。')]),
('SD','11'):dict(en=[('What colour do you like?','I like gold!'),('What colour is the dress?',"It's pink!")],zh=[('你喜欢什么颜色？','我喜欢金色！'),('裙子是什么颜色？','是粉色！')]),
('SD','12'):dict(en=[('How many people?','Ten people.'),('What time is it now?',"It's eight o'clock.")],zh=[('几个人？','十个人。'),('现在几点？','现在八点。')]),
}
# kiểm tính nhất quán
for key,d in U.items():
    ks=[s['k'] for s in d['spells']]
    assert len(W[key])==len(ks),(key,len(W[key]),len(ks))
    for a,b in COMBO[key]: assert a in ks and b in ks,(key,a,b)
    assert key in LONG and key in DIA,key
if __name__=='__main__': print('OK',len(U),'unit')
