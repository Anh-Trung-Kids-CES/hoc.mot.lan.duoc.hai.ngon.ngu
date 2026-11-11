"""Mạng văn bản lớp Seedling offline 48 buổi (11/11/2026) – truyện unit viết lại theo chỉ tiêu 4 mặt (nguyên tắc 62d, chi_tieu_48.json),
giữ cốt truyện, nhân vật và bộ từ mỗi phần của v7; thêm big book + vè mỗi unit (nguyên tắc 63–66), câu hỏi nghe hiểu cho ngày cả truyện.
U1 và U4 (bậc cầu tuần 1–3) giữ truyện v7 (đã ở mức 25–29 chữ), chỉ thêm big book + vè; tuần 1–3 hát vè chào.
U9, U12 lấy từ bản viết lại 10/11 (claude/TruyenUnit_U9/U12_BanMoi_NguyenTac61.md), nối dài cho đủ chỉ tiêu, xếp lại cho khớp bộ từ từng ngày web.
Dòng truyện: "người|câu Anh|câu Trung". Người: mã nhân vật web Seedling (SD.who). narr = lời kể.
Big book: (ảnh, câu Anh, câu Trung); ảnh = tên tranh trong seedling/tai-nguyen/tranh/ hoặc nhân vật trong tai-nguyen/nhan-vat/ (bỏ đuôi _a).
Vè: (người, câu Anh – chữ hoa là phách mạnh, câu Trung, vần). Câu hỏi: (phần, câu, hỏi Anh, [đáp Anh], đúng, hỏi Trung, [đáp Trung]).
"""

def L(block):
    return [tuple(x.strip() for x in ln.split('|')) for ln in block.strip().split('\n') if ln.strip()]

VE_CHAO = [('lan', 'Hello, hello, everyone!', '你好你好，大家好！', '-one / ao'), ('kids', 'Hello, teacher! Class is fun!', '老师老师，早上好！', '-un / ao'),
           ('lan', "What's your name? What's your name?", '你叫什么名字呀？', '-ame / ya'), ('kids', "Leo, Leo, that's my name!", '我叫Leo，Leo呀！', '-ame / ya'),
           ('lan', 'Goodbye, goodbye, everyone!', '大家再见，再见啦！', '-one / la'), ('kids', 'One, two, three… school is done!', '一二三，放学啦！', '-one / la')]

U = {}

U[1] = {'ten_en': 'Good Morning, Mrs Lan!', 'ten_zh': 'Lan老师，早上好！', 'giu_truyen': True,
        'bb': ('Hello! I\'m ___', '你好！我是___', [('kids_bong', "Hello! I'm Bông.", '你好！我是Bông。'), ('kids_leo', "Hello! I'm Leo.", '你好！我是Leo。'),
               ('kids_anna', "Good morning! I'm Anna.", '早上好！我是Anna。'), ('kids_xiaomei', "Good morning! I'm Xiaomei.", '早上好！我是Xiaomei。'),
               ('nv_lan', 'Good morning, Mrs Lan!', 'Lan老师，早上好！'), ('see_you_tomorrow', 'Goodbye! See you tomorrow!', '再见！明天见！'),
               ('nv_vu', "Hello! I'm ___.", '你好！我是___。')]),
        've': VE_CHAO}

U[4] = {'ten_en': 'The Body Show', 'ten_zh': '身体表演', 'giu_truyen': True, 'bg': 'ls_park',
        'bb': ('This Is My Body', '这是我的身体', [('head', 'This is my head.', '这是我的头。'), ('hair', "I've got long black hair.", '我有长长的黑头发。'),
               ('arm', 'Touch your arms.', '摸摸你的胳膊。'), ('knee', 'Touch your knees.', '摸摸你的膝盖。'), ('toe', 'Look at your feet. Five toes!', '看你的脚。五个脚趾！'),
               ('clap_your_hands', 'Clap your hands! Stamp your feet!', '拍拍手！跺跺脚！'), ('body', 'Touch your head, ___!', '___，摸摸你的头！')]),
        've': [('lan', 'TOUCH your HEAD and TOUCH your NOSE!', '摸摸头，摸鼻子！', '-ose / i'), ('kids', 'CLAP your HANDS and COUNT your TOES!', '拍拍手，数脚趾！', '-oes / i'),
               ('kids', '___, ___, STAMP your FEET!', '___，___，跺跺脚！', '-eet / ao'), ('kids', 'STAMP, stamp, STAMP! ONE, two, THREE!', '跺跺跺，真好笑！', '-ee / ao')]}

U[2] = {'ten_en': "Vũ's Birthday", 'ten_zh': 'Vũ的生日', 'bg': 'ls_park', 'parent': {},
        'phan': [("Nice to Meet You!", '很高兴认识你！', L("""
narr|It's Vũ's birthday. Bông and Xiaomei go to the park.|今天是Vũ的生日。Bông和Xiaomei去公园。
bong|Happy birthday, Vũ!|Vũ，生日快乐！
nhan|Thank you, Bông! What's your name?|谢谢你，Bông！你叫什么名字？
xiaomei|My name is Xiaomei.|我叫Xiaomei。
nhan|Nice to meet you, Xiaomei!|很高兴认识你，Xiaomei！
xiaomei|Me too! I'm happy!|我也是！我很高兴！""")),
                 ("What About You?", '你呢？', L("""
narr|Anna comes to the park.|Anna来公园了。
anna|Hello, Xiaomei! How old are you?|你好，Xiaomei！你几岁？
xiaomei|I'm six years old. What about you, Anna?|我六岁。你呢，Anna？
anna|Me too! I'm six years old.|我也是！我也六岁。
bong|And Vũ? How old are you?|Vũ呢？你几岁？""")),
                 ("Wow! Really?", '哇！真的吗？', L("""
narr|Vũ's mother has got a big cake.|Vũ的妈妈有一个大蛋糕。
anna|Look! A big cake!|看！一个大蛋糕！
kids|Wow!|哇！
nhan|I'm nine years old!|我九岁！
leo|Wow! Really? You are nine?|哇！真的吗？你九岁？
nhan|Ha ha! No. Try again!|哈哈！不是。再猜一次！
bong|Are you six?|你六岁吗？""")),
                 ("Number Seven", '数字七', L("""
nhan|No! Look at the number on my cake!|不是！看我蛋糕上的数字！
narr|There is a number on the cake. It's seven!|蛋糕上有一个数字。是七！
bong|Number seven! You are seven years old!|数字七！你七岁！
nhan|Yes! I'm seven years old!|对！我七岁！
kids|Happy birthday, Vũ!|Vũ，生日快乐！""")),
                 ("My Brother Is Eight", '我哥哥八岁', L("""
narr|A tall boy comes to the table.|一个高高的男孩来到桌子旁。
nhan|This is my brother. He is eight years old.|这是我哥哥。他八岁。
anh_nhan|Hello! I'm eight.|你们好！我八岁。
leo|Wow! Eight is bigger than seven!|哇！八大于七！
xiaomei|And seven is smaller than eight!|七小于八！""")),
                 ("Ten Friends", '十个朋友', L("""
nhan|Let's hold hands, friends!|朋友们，我们拉拉手！
kids|One, two, three, four, five, six, seven, eight, nine, ten!|一、二、三、四、五、六、七、八、九、十！
anna|Ten friends! Ten happy friends!|十个朋友！十个快乐的朋友！
bong|Goodbye, Vũ! See you again!|Vũ，再见！下次见！
nhan|Goodbye! How old are you, ___?|再见！___，你几岁？"""))],
        'bb': ('How Old Are You?', '你几岁？', [('birthday', "It's my birthday!", '今天是我的生日！'), ('cake', 'Look! A big cake!', '看！一个大蛋糕！'),
               ('number', "What number is it? It's seven.", '这是什么数字？是七。'), ('seven', "How old are you? I'm seven.", '你几岁？我七岁。'),
               ('eight', 'He is eight. Eight is bigger than seven.', '他八岁。八大于七。'), ('ten', 'Ten friends! Nice to meet you!', '十个朋友！很高兴认识你！'),
               ('happy', "What's your name? How old are you, ___?", '你叫什么名字？___，你几岁？')]),
        've': [('lan', 'HOW old are YOU? HOW old are YOU?', '你几岁呀？你几岁呀？', '-ou / ya'), ('kids', 'SIX or SEV-en? EIGHT or TWO?', '六岁七岁？还是八岁呀？', '-o / ya'),
               ('kids', '___, ___, HOW old are YOU?', '___，___，几岁啦？', '-ou / la'), ('kids', "I'm SEV-en! SEV-en! THAT'S me TOO!", '我七岁啦，七岁啦！', '-oo / la')],
        'hoi': [(1, 1, 'Whose birthday is it?', ["It's Vũ's birthday.", "It's Anna's birthday."], 0, '今天是谁的生日？', ['Vũ的生日。', 'Anna的生日。']),
                (2, 3, 'How old is Xiaomei?', ['She is six.', 'She is nine.'], 0, 'Xiaomei几岁？', ['六岁。', '九岁。']),
                (3, 4, 'Is Vũ nine?', ['Yes, he is.', 'No, he isn\'t.'], 1, 'Vũ九岁吗？', ['九岁。', '不是九岁。']),
                (4, 2, 'What number is on the cake?', ['Seven.', 'Eight.'], 0, '蛋糕上是什么数字？', ['七。', '八。']),
                (5, 2, 'How old is Vũ\'s brother?', ['He is eight.', 'He is seven.'], 0, 'Vũ的哥哥几岁？', ['八岁。', '七岁。']),
                (6, 2, 'How many friends are there?', ['Ten.', 'Six.'], 0, '有几个朋友？', ['十个。', '六个。'])]}

U[3] = {'ten_en': 'Our Family Photos', 'ten_zh': '我们的家庭照片', 'bg': 'ls_class',
        'phan': [("A Family Photo", '一张家庭照片', L("""
narr|It's lesson time. Mrs Lan has got a photo.|上课了。Lan老师有一张照片。
lan|Look, kids! A family photo! Who has got a photo?|小朋友们，看！一张家庭照片！谁有照片？
bong|Me! This is my family. This is my father.|我有！这是我的家。这是我爸爸。
leo|Who is she?|她是谁？
bong|She is my mother.|她是我妈妈。""")),
                 ("A Little Baby", '一个小宝宝', L("""
leo|Who is he? Is he your father?|他是谁？是你爸爸吗？
bong|No! He is my older brother.|不是！他是我哥哥。
anna|Who is she?|她是谁？
bong|She is my younger sister. She is a little girl.|她是我妹妹。她是一个小女孩。
leo|Look! A baby!|看！一个宝宝！
bong|Yes! He is my baby brother.|对！他是我的小弟弟。""")),
                 ("Xiaomei's Mother", 'Xiaomei的妈妈', L("""
narr|A woman is at the door.|一个阿姨在门口。
anna|Who is she, Xiaomei?|Xiaomei，她是谁？
xiaomei|She is my mother! Hello, Mummy!|她是我妈妈！妈妈，你好！
lan|Sit down, kids. Xiaomei's mother is Chinese.|小朋友们，坐下。Xiaomei的妈妈是中国人。
bong|I'm Vietnamese!|我是越南人！
me_xm|Let's learn numbers in Chinese! One, two, three!|我们用中文学数字吧！一、二、三！""")),
                 ("My Uncle and My Aunt", '我的叔叔和阿姨', L("""
xiaomei|Look at my family photo!|看我的家庭照片！
leo|Who is he?|他是谁？
xiaomei|He is my uncle. And she is my aunt.|他是我叔叔。她是我阿姨。
anna|Who is the boy?|那个男孩是谁？
xiaomei|He is my cousin. He is three.|他是我表弟。他三岁。
leo|I've got an aunt, too!|我也有阿姨！""")),
                 ("I Love My Family", '我爱我的家人', L("""
anna|Look at my photo!|看我的照片！
anna|This is my grandfather and my grandmother.|这是我爷爷和奶奶。
bong|Who is he?|他是谁？
anna|He is my father. And she is my mother.|他是我爸爸。她是我妈妈。
anna|I love my family!|我爱我的家人！
bong|I love my family, too!|我也爱我的家人！""")),
                 ("A Class Photo", '一张班级照片', L("""
lan|Look at me! A class photo!|看我！一张班级照片！
narr|The kids are happy. Click!|小朋友们很高兴。咔嚓！
bong|I love my family. I love them!|我爱我的家人。我爱他们！
leo|I love them, too!|我也爱他们！
xiaomei|My mother and my aunt!|我的妈妈和我的阿姨！
lan|Good kids! Who is in your family, ___?|好孩子！___，你家有谁？"""))],
        'bb': ('Who Is She?', '她是谁？', [('fam_bong_me', 'Who is she? She is my mother.', '她是谁？她是我妈妈。'), ('fam_bong_bo', 'Who is he? He is my father.', '他是谁？他是我爸爸。'),
               ('fam_bong_anh_trai', 'Who is he? He is my older brother.', '他是谁？他是我哥哥。'), ('fam_bong_em_gai', 'Who is she? She is my younger sister.', '她是谁？她是我妹妹。'),
               ('uncle', 'Who is he? He is my uncle.', '他是谁？他是我叔叔。'), ('aunt', 'Who is she? She is my aunt.', '她是谁？她是我阿姨。'),
               ('love', 'I love my family. Who is in your family, ___?', '我爱我的家人。___，你家有谁？')]),
        've': [('lan', 'LOOK at the PHO-to! WHO is SHE?', '看看照片，看看她！', '-ee / a'), ('kids', 'SHE is my MUM-my! She LOVES ME!', '她是妈妈，我爱她！', '-ee / a'),
               ('kids', '___, ___, WHO is HE?', '___，___，说一说！', '-ee / uo'), ('kids', 'HE is my BRO-ther! ONE, two, THREE!', '他是哥哥，我的哥！', '-ee / e')],
        'hoi': [(1, 1, 'Who has got a photo?', ['Mrs Lan.', 'Leo.'], 0, '谁有照片？', ['Lan老师。', 'Leo。']),
                (2, 4, 'Who is the little girl?', ["Bông's younger sister.", "Bông's mother."], 0, '小女孩是谁？', ['Bông的妹妹。', 'Bông的妈妈。']),
                (3, 4, "Is Xiaomei's mother Chinese?", ['Yes, she is.', "No, she isn't."], 0, 'Xiaomei的妈妈是中国人吗？', ['是。', '不是。']),
                (4, 3, 'Who is he in Xiaomei\'s photo?', ['Her uncle.', 'Her father.'], 0, 'Xiaomei照片里的他是谁？', ['她叔叔。', '她爸爸。']),
                (5, 5, 'Does Anna love her family?', ['Yes, she does.', "No, she doesn't."], 0, 'Anna爱她的家人吗？', ['爱。', '不爱。']),
                (6, 3, 'Who does Bông love?', ['Her family.', 'Her teacher.'], 0, 'Bông爱谁？', ['她的家人。', '她的老师。'])]}

U[5] = {'ten_en': "Leo's Birthday", 'ten_zh': 'Leo的生日', 'bg': 'ls_home', 'parent': {'Mummy': 'me_leo', 'Daddy': 'bo_leo', 'Grandma': 'ba', 'Grandpa': 'ong'},
        'phan': [("How Do You Feel?", '你感觉怎么样？', L("""
narr|It's morning and Leo is sleepy in his bed.|早上了，Leo在床上，他很困。
me_leo|It's your birthday, Leo! How do you feel?|Leo，今天是你的生日！你感觉怎么样？
leo|I feel sleepy, Mummy.|妈妈，我很困。
me_leo|Look, Bông and Anna are at the door!|看，Bông和Anna在门口！
leo|Wow, I feel excited!|哇，我很兴奋！
me_leo|You are excited? Me too!|你很兴奋？我也是！""")),
                 ("My Favourite Toy", '我最喜欢的玩具', L("""
narr|Grandma has got a big bag for Leo.|奶奶给Leo带来一个大包。
ba|Happy birthday, Leo! Look in the bag!|Leo，生日快乐！看看包里！
leo|What is it? It's a toy dog!|这是什么？是一只玩具狗！
leo|Thank you, Grandma! It's my favourite toy!|谢谢奶奶！这是我最喜欢的玩具！
bong|A toy dog? It's my favourite toy, too!|玩具狗？也是我最喜欢的玩具！""")),
                 ("Close Your Eyes!", '闭上眼睛！', L("""
ong|Leo, close your eyes, please.|Leo，请闭上眼睛。
narr|Leo closes his eyes, and Grandpa has got a cake.|Leo闭上眼睛，爷爷拿来一个蛋糕。
ong|Touch it with your right hand. What is it?|用你的右手摸一摸。这是什么？
leo|Is it a big cake?|是一个大蛋糕吗？
ong|That's right! It's your birthday cake!|对了！这是你的生日蛋糕！
kids|Happy birthday, Leo!|Leo，生日快乐！""")),
                 ("I'm Hungry!", '我饿了！', L("""
narr|Leo's toy dog has got a pair of long ears.|Leo的玩具狗有一双长耳朵。
bong|Look, the toy dog jumps and jumps!|看，玩具狗跳啊跳！
anna|Ha ha, it's fun! Happy birthday, Leo!|哈哈，真好玩！Leo，生日快乐！
leo|Thank you! Oh, I'm hungry, Mummy.|谢谢！哎呀，妈妈，我饿了。
me_leo|Are you hungry? Let's eat the cake!|你饿了吗？我们吃蛋糕吧！
bong|I'm hungry, too!|我也饿了！""")),
                 ("I'm Thirsty!", '我渴了！', L("""
narr|Leo eats a big cake, and then he is thirsty.|Leo吃了一大块蛋糕，然后他渴了。
leo|Mummy, I'm thirsty. I want some water, please!|妈妈，我渴了。我要喝水！
me_leo|Here you are, Leo.|Leo，给你。
bong|I'm thirsty, too!|我也渴了！
narr|Then the cat jumps on the table.|这时，猫跳到桌子上。
leo|Ha ha, my cat wants water, too!|哈哈，我的猫也要喝水！""")),
                 ("Tell Me a Story", '给我讲个故事', L("""
narr|It's night, and Leo is tired and sleepy.|晚上了，Leo又累又困。
me_leo|Go to bed, Leo. Good night!|Leo，去睡觉吧。晚安！
leo|Mummy, tell me a story, please!|妈妈，给我讲故事吧！
me_leo|OK, I can tell a story.|好，我来讲故事。
narr|Leo closes his eyes. He is happy.|Leo闭上眼睛。他很开心。
me_leo|Good night! How do you feel, ___?|晚安！___，你感觉怎么样？"""))],
        'bb': ('How Do You Feel?', '你感觉怎么样？', [('sleepy', 'How do you feel? I feel sleepy.', '你感觉怎么样？我很困。'), ('excited', 'How do you feel? I feel excited!', '你感觉怎么样？我很兴奋！'),
               ('hungry', "How do you feel? I'm hungry. I want cake.", '你感觉怎么样？我饿了。我要蛋糕。'), ('thirsty', "How do you feel? I'm thirsty. I want water.", '你感觉怎么样？我渴了。我要水。'),
               ('tired', "How do you feel? I'm tired.", '你感觉怎么样？我累了。'), ('tell_a_story', 'Go to bed. Tell me a story, please!', '去睡觉吧。给我讲个故事吧！'),
               ('happy', 'How do you feel, ___?', '___，你感觉怎么样？')]),
        've': [('lan', 'HOW do you FEEL? HOW do you FEEL?', '你感觉怎么样？怎么样？', '-eel / ang'), ('kids', 'HUN-gry, THIRST-y, TIME for a MEAL!', '饿了渴了，吃饭香！', '-eel / ang'),
               ('kids', '___, ___, ARE you OK?', '___，___，你好吗？', '-ay / a'), ('kids', "I'm EX-ci-ted! HIP, hip, hoo-RAY!", '我很兴奋，哈哈哈！', '-ay / a')],
        'hoi': [(1, 3, 'How does Leo feel in bed?', ['Sleepy.', 'Hungry.'], 0, 'Leo在床上感觉怎么样？', ['很困。', '很饿。']),
                (2, 3, "What is Leo's favourite toy?", ['A toy dog.', 'A ball.'], 0, 'Leo最喜欢的玩具是什么？', ['玩具狗。', '球。']),
                (3, 3, 'Leo touches it with his right hand. What is it?', ['A cake.', 'A dog.'], 0, 'Leo用右手摸。这是什么？', ['蛋糕。', '狗。']),
                (4, 4, 'Is Leo hungry?', ['Yes, he is.', "No, he isn't."], 0, 'Leo饿了吗？', ['饿了。', '不饿。']),
                (5, 2, 'What does Leo want?', ['Water.', 'Cake.'], 0, 'Leo要什么？', ['水。', '蛋糕。']),
                (6, 3, 'What does Leo want at night?', ['A story.', 'A cake.'], 0, '晚上Leo要什么？', ['听故事。', '吃蛋糕。'])]}

U[6] = {'ten_en': "Bông's New Schoolbag", 'ten_zh': 'Bông的新书包', 'bg': ['ls_park', 'ls_home', 'ls_school', 'ls_class', 'ls_class', 'ls_class'],
        'parent': {'Mummy': 'me_bong'},
        'phan': [("At the Shop", '在商店', L("""
narr|Bông and Mummy are at a shop in town.|Bông和妈妈在城里的一家商店。
bong|Mummy, what is this?|妈妈，这是什么？
me_bong|This is a pencil, and that is a crayon.|这是铅笔，那是蜡笔。
bong|I want a red crayon, please!|我要一支红色的蜡笔！
me_bong|OK, here you are.|好，给你。
bong|My new pencil and my new crayon! I'm excited!|我的新铅笔和新蜡笔！我好兴奋！""")),
                 ("Scissors and Glue", '剪刀和胶水', L("""
bong|Look, Mummy! Scissors!|看，妈妈！剪刀！
me_bong|Scissors for school, and this is glue.|上学用的剪刀，这是胶水。
bong|I want the glue and the scissors, too!|我也要胶水和剪刀！
narr|Bông puts the scissors and the glue in her new schoolbag.|Bông把剪刀和胶水放进她的新书包。
bong|Thank you, Mummy! My schoolbag is great!|谢谢妈妈！我的书包真棒！
me_bong|You are welcome! It's a nice bag.|不客气！真是个好书包。""")),
                 ("Make a Line!", '排队！', L("""
narr|Next morning, Bông goes to school with her new bag.|第二天早上，Bông背着新书包去学校。
lan|Good morning, kids! Make a line, please.|小朋友们，早上好！请排队。
narr|The kids make a line: one, two, three.|小朋友们排队：一、二、三。
leo|Hello, Bông! Is that a new schoolbag?|Bông，你好！那是新书包吗？
bong|Yes, it's my new schoolbag!|对，这是我的新书包！
lan|Leo, Bông, make a line, please!|Leo，Bông，请排队！""")),
                 ("Look at the Board", '看黑板', L("""
lan|Open your books, please. Look at the board.|请打开书。看黑板。
narr|Mrs Lan writes A, B, C on the board.|Lan老师在黑板上写A、B、C。
lan|Bông, come and write your name, please.|Bông，请来写你的名字。
narr|Bông opens her schoolbag.|Bông打开她的书包。
narr|She writes her name on the board: B-O-N-G.|她在黑板上写名字：B-O-N-G。
lan|Great job, Bông!|写得真棒，Bông！""")),
                 ("These Are Letters", '这些是字母', L("""
lan|Let's read, kids! These are letters: A, B, C.|小朋友们，我们来读吧！这些是字母：A、B、C。
leo|What are those, Mrs Lan?|Lan老师，那些是什么？
lan|Those are letters, too: D, E, F.|那些也是字母：D、E、F。
anna|These and those are letters!|这些和那些都是字母！
narr|The kids read: A, B, C, D, E, F!|小朋友们读字母：A、B、C、D、E、F！
bong|B is the letter in my name!|B是我名字里的字母！""")),
                 ("The Keyboard", '键盘', L("""
narr|Then the kids look at a computer.|然后，小朋友们看电脑。
leo|Look! There are letters on the keyboard!|看！键盘上有字母！
anna|And this is a mouse. Click, click!|这是鼠标。咔嗒，咔嗒！
bong|B, O, N, G! My name is on the keyboard!|B、O、N、G！我的名字在键盘上！
leo|A mouse? It's a computer mouse!|鼠标？是电脑鼠标！
lan|Write your name on the keyboard, ___!|___，在键盘上写你的名字吧！"""))],
        'bb': ('What Is This?', '这是什么？', [('pen', "What is this? It's a pencil.", '这是什么？这是铅笔。'), ('crayon', "What is that? It's a crayon.", '那是什么？那是蜡笔。'),
               ('scissors', 'These are scissors.', '这是剪刀。'), ('glue', 'This is glue.', '这是胶水。'), ('board', 'Look at the board. Write your name.', '看黑板。写你的名字。'),
               ('letter', 'These are letters. Those are letters, too.', '这些是字母。那些也是字母。'), ('keyboard', "What is this, ___? It's a keyboard!", '___，这是什么？是键盘！')]),
        've': [('lan', 'MAKE a LINE, one, TWO, THREE!', '排排队，一二三！', '-ee / an'), ('kids', 'A, B, C, READ with ME!', '读字母，一起念！', '-ee / an'),
               ('kids', '___, ___, WRITE your NAME!', '___，___，写名字！', '-ame / i'), ('kids', 'LOOK, I WRITE my NAME!', '写写名字，写写字！', '-ame / i')],
        'hoi': [(1, 3, 'What is that?', ["It's a crayon.", "It's glue."], 0, '那是什么？', ['蜡笔。', '胶水。']),
                (2, 4, 'What does Bông put in her schoolbag?', ['Scissors and glue.', 'A ball.'], 0, 'Bông把什么放进书包？', ['剪刀和胶水。', '一个球。']),
                (3, 3, 'What do the kids do at school?', ['They make a line.', 'They go to bed.'], 0, '小朋友们在学校做什么？', ['排队。', '睡觉。']),
                (4, 5, 'What does Bông write on the board?', ['Her name.', 'A number.'], 0, 'Bông在黑板上写什么？', ['她的名字。', '一个数字。']),
                (5, 1, 'What are these?', ['Letters.', 'Pencils.'], 0, '这些是什么？', ['字母。', '铅笔。']),
                (6, 2, 'Where are the letters?', ['On the keyboard.', 'On the cake.'], 0, '字母在哪儿？', ['在键盘上。', '在蛋糕上。'])]}

U[7] = {'ten_en': "Leo's New Flat", 'ten_zh': 'Leo的新公寓', 'bg': 'ls_home', 'parent': {'Mummy': 'me_leo', 'Daddy': 'bo_leo'},
        'phan': [("Our New Flat", '我们的新公寓', L("""
narr|Leo's family has got a new flat. It's big and nice.|Leo家有一个新公寓。又大又漂亮。
bo_leo|Here is our new flat, Leo! How do you feel?|Leo，这是我们的新公寓！你感觉怎么样？
leo|I feel excited, Daddy!|爸爸，我很兴奋！
leo|A new flat! Our new flat! I love it!|新公寓！我们的新公寓！我爱它！
narr|Leo is very happy, and Mummy is happy, too.|Leo很开心，妈妈也很开心。
me_leo|Let's go in!|我们进去吧！""")),
                 ("The Living Room", '客厅', L("""
narr|Daddy opens the door, and Leo goes in.|爸爸打开门，Leo走进去。
leo|Good morning, door! Hello, new flat!|门，早上好！新公寓，你好！
me_leo|Ha ha! This is the living room.|哈哈！这是客厅。
leo|A big living room! There is a sofa!|好大的客厅！有一个沙发！
me_leo|Sit down on the sofa, please.|请坐在沙发上。
leo|Thank you, Mummy. I love our living room!|谢谢妈妈。我爱我们的客厅！""")),
                 ("Bang!", '砰！', L("""
narr|Leo opens the window and says, "Hello, window!"|Leo打开窗户说："窗户，你好！"
narr|There is a new lamp on the table.|桌子上有一个新灯。
me_leo|Leo, don't play with your ball here, please.|Leo，请不要在这里玩球。
narr|But Leo plays with his ball. Bang!|可是Leo玩球。砰！
me_leo|Oh no! The lamp is not on the table!|哎呀！灯不在桌子上了！
leo|Sorry, Mummy!|对不起，妈妈！""")),
                 ("Where Is My Ball?", '我的球在哪儿？', L("""
narr|The lamp is OK, but where is the ball?|灯没事，可是球在哪儿？
leo|Is my ball in the dining room?|我的球在餐厅吗？
narr|Leo looks in the dining room. It's not under the table.|Leo在餐厅里找。球不在桌子下面。
narr|Then Leo looks in the kitchen.|然后Leo在厨房里找。
leo|It's not here! It's not under the chair!|不在这里！不在椅子下面！
leo|Mummy, where is my ball?|妈妈，我的球在哪儿？""")),
                 ("Bedroom or Bathroom?", '卧室还是浴室？', L("""
me_leo|Is it in your bedroom or in the bathroom?|在你的卧室还是在浴室？
leo|Bedroom or bathroom? Hmm… my bedroom!|卧室还是浴室？嗯……我的卧室！
narr|Leo goes to his bedroom and looks on the desk.|Leo去他的卧室，在书桌上找。
leo|It's not on the desk. Is it on the chair or on the bed?|不在书桌上。在椅子上还是在床上？
leo|Where is my ball?|我的球在哪儿？""")),
                 ("Right Under the Bed!", '就在床下面！', L("""
me_leo|Is it on the bed or under the bed?|在床上还是在床下面？
narr|Leo looks under the bed.|Leo往床下面看。
leo|Look, Mummy! It's right under the bed!|看，妈妈！就在床下面！
me_leo|Right here! Well done, Leo!|就在这里！真棒，Leo！
leo|Thank you, Mummy! I love our new flat!|谢谢妈妈！我爱我们的新公寓！
me_leo|Where is your ball, ___? Is it under your bed?|___，你的球在哪儿？在你的床下面吗？"""))],
        'bb': ('Where Is It?', '在哪儿？', [('living_room', 'This is the living room.', '这是客厅。'), ('dining_room', 'This is the dining room.', '这是餐厅。'),
               ('bedroom', 'This is the bedroom.', '这是卧室。'), ('lamp', "Where is the lamp? It's on the table.", '灯在哪儿？在桌子上。'),
               ('ball', "Where is the ball? It's under the bed.", '球在哪儿？在床下面。'), ('window', 'Is it in the bedroom or in the living room?', '在卧室还是在客厅？'),
               ('under', "Where is your ball, ___? It's right under the bed!", '___，你的球在哪儿？就在床下面！')]),
        've': [('lan', 'WHERE is the BALL? WHERE is the BALL?', '球在哪儿？球在哪儿？', '-all / ar'), ('kids', 'UN-der the CHAIR? No, NOT at ALL!', '椅子下面？不在那儿！', '-all / ar'),
               ('kids', '___, ___, LOOK in your ROOM!', '___，___，找一找！', '-oom / ao'), ('kids', 'UN-der the BED! ZOOM, zoom, ZOOM!', '就在床下，找到了！', '-oom / ao')],
        'hoi': [(1, 1, "What has Leo's family got?", ['A new flat.', 'A new boat.'], 0, 'Leo家有什么？', ['一个新公寓。', '一只新船。']),
                (2, 4, 'What is in the living room?', ['A sofa.', 'A bed.'], 0, '客厅里有什么？', ['一个沙发。', '一张床。']),
                (3, 2, 'Where is the lamp?', ['On the table.', 'Under the bed.'], 0, '灯在哪儿？', ['在桌子上。', '在床下面。']),
                (4, 3, 'Is the ball under the table in the dining room?', ['No, it isn\'t.', 'Yes, it is.'], 0, '球在餐厅的桌子下面吗？', ['不在。', '在。']),
                (5, 3, 'Where does Leo look?', ['In his bedroom.', 'In the park.'], 0, 'Leo去哪儿找？', ['他的卧室。', '公园。']),
                (6, 3, 'Where is the ball?', ['Under the bed.', 'On the sofa.'], 0, '球在哪儿？', ['在床下面。', '在沙发上。'])]}

U[8] = {'ten_en': 'The Little Boat', 'ten_zh': '小船', 'bg': 'ls_park', 'parent': {'Daddy': 'bo_leo'},
        'phan': [("Can We Go on the Boat?", '我们能坐船吗？', L("""
narr|Daddy, Leo and Anna are in the park.|爸爸、Leo和Anna在公园里。
narr|There is a little boat on the water.|水上有一只小船。
anna|Look, a boat! Can we go on the boat, please?|看，一只船！我们能坐船吗？
bo_leo|Yes, you can! Sit down, please.|能！请坐下。
leo|Thank you, Daddy! I'm excited!|谢谢爸爸！我好兴奋！
anna|Me too! The boat is little and nice.|我也是！小船又小又漂亮。""")),
                 ("Two White Wings", '两只白翅膀', L("""
narr|A white duck swims to the little boat.|一只白鸭子游到小船旁边。
leo|Hello, duck! Look, Anna, it's a white duck!|鸭子，你好！看，Anna，是一只白鸭子！
narr|The duck has got two white wings.|鸭子有两只白色的翅膀。
anna|Two wings! Can the duck fly, Daddy?|两只翅膀！爸爸，鸭子能飞吗？
bo_leo|Yes, it can! Look at its wings!|能！看它的翅膀！
narr|The duck flies up, and the kids clap.|鸭子飞起来了，小朋友们拍手。""")),
                 ("The Frog Can't Fly", '青蛙不能飞', L("""
narr|Jump! A little green frog jumps on the boat.|跳！一只绿色的小青蛙跳到船上。
leo|Hello, frog! Can the frog fly, Daddy?|青蛙，你好！爸爸，青蛙能飞吗？
bo_leo|No, it can't. It hasn't got wings.|不能。它没有翅膀。
anna|The frog can't fly, but it can jump!|青蛙不能飞，可是它能跳！
leo|Can the frog swim, too?|青蛙也能游泳吗？
bo_leo|Yes, it can. Frogs can swim and jump.|能。青蛙能游泳，也能跳。""")),
                 ("In the Forest", '在森林里', L("""
narr|The little boat goes into the forest.|小船来到森林里。
narr|There is a mouse in the forest. It has got a long tail.|森林里有一只老鼠。它有一条长尾巴。
leo|Look at its long tail! Can the mouse fly?|看它的长尾巴！老鼠能飞吗？
anna|No, it can't. It hasn't got wings.|不能。它没有翅膀。
bo_leo|But it can run. Look, it runs and runs!|可是它能跑。看，它跑啊跑！""")),
                 ("A Tall Polar Bear", '高高的北极熊', L("""
narr|Anna opens her book on the boat.|Anna在船上打开她的书。
anna|Look! A polar bear! It's white and tall.|看！一只北极熊！它又白又高。
leo|Can the polar bear swim?|北极熊能游泳吗？
bo_leo|Yes, it can! It can swim in the water.|能！它能在水里游泳。
anna|Can it fly, too?|它也能飞吗？
leo|No, it can't! It hasn't got wings, but it's very tall!|不能！它没有翅膀，可是它很高！""")),
                 ("Hop, Hop, Hop!", '跳，跳，跳！', L("""
narr|The boat is back in the park, and the frog hops: hop, hop, hop!|小船回到公园，青蛙跳：跳、跳、跳！
leo|Look, Daddy, I can hop, too!|爸爸，看，我也能跳！
anna|Ha ha! It's really fun, Daddy!|哈哈！爸爸，真好玩！
narr|The white duck flies over the little boat.|白鸭子飞过小船。
leo|Goodbye, duck! Goodbye, frog!|鸭子，再见！青蛙，再见！
bo_leo|Can you hop like a frog, ___?|___，你能像青蛙一样跳吗？"""))],
        'bb': ('Can It Fly?', '它能飞吗？', [('duck', 'Can the duck fly? Yes, it can.', '鸭子能飞吗？能。'), ('frog', "Can the frog fly? No, it can't.", '青蛙能飞吗？不能。'),
               ('bird', 'Can the bird fly? Yes, it can.', '小鸟能飞吗？能。'), ('mouse', "Can the mouse fly? No, it can't. It can run.", '老鼠能飞吗？不能。它能跑。'),
               ('polar_bear', 'Can the polar bear swim? Yes, it can.', '北极熊能游泳吗？能。'), ('fish', 'Can the fish swim? Yes, it can.', '鱼能游泳吗？能。'),
               ('hop', 'Can you hop, ___? Hop, hop, hop!', '___，你能跳吗？跳，跳，跳！')]),
        've': [('lan', 'CAN you FLY? CAN you FLY?', '你能飞吗？飞不飞？', '-y / ei'), ('kids', 'The DUCK can FLY up IN the SKY!', '小鸭小鸭，飞呀飞！', '-y / ei'),
               ('kids', '___, ___, CAN you HOP?', '___，___，跳一跳！', '-op / ao'), ('kids', "HOP, hop, HOP! I CAN'T STOP!", '跳跳跳跳，真好笑！', '-op / ao')],
        'hoi': [(1, 2, 'Where is the boat?', ['On the water.', 'In the house.'], 0, '船在哪儿？', ['在水上。', '在家里。']),
                (2, 3, 'What has the duck got?', ['Two white wings.', 'A long tail.'], 0, '鸭子有什么？', ['两只白翅膀。', '一条长尾巴。']),
                (3, 3, 'Can the frog fly?', ["No, it can't.", 'Yes, it can.'], 0, '青蛙能飞吗？', ['不能。', '能。']),
                (4, 2, 'What has the mouse got?', ['A long tail.', 'Two wings.'], 0, '老鼠有什么？', ['一条长尾巴。', '两只翅膀。']),
                (5, 4, 'Can the polar bear swim?', ['Yes, it can.', "No, it can't."], 0, '北极熊能游泳吗？', ['能。', '不能。']),
                (6, 2, 'What can Leo do?', ['He can hop.', 'He can fly.'], 0, 'Leo能做什么？', ['他能跳。', '他能飞。'])]}

U[9] = {'ten_en': 'The Picnic', 'ten_zh': '野餐', 'bg': 'ls_park',
        'phan': [("Look! Food!", '看！食物！', L("""
narr|Mrs Lan and the kids are in the park. There is a big bag on the table.|Lan老师和小朋友们在公园里。桌子上有一个大包。
lan|Good morning, class! Look! Food! Do you like fruit?|小朋友们，早上好！看！食物！你们喜欢水果吗？
bong|Yes, I do! I'm hungry!|喜欢！我饿了！
leo|Me too! I like apples!|我也是！我喜欢苹果！
nhan|No, I don't. I don't like fruit.|不喜欢。我不喜欢水果。
lan|Vũ, do you like bananas?|Vũ，你喜欢香蕉吗？
nhan|No, I don't!|不喜欢！""")),
                 ("Bread and Juice", '面包和果汁', L("""
narr|Mrs Lan has got bread and juice. Vũ is looking at the bread.|Lan老师有面包和果汁。Vũ在看面包。
lan|Do you like bread, Vũ?|Vũ，你喜欢面包吗？
nhan|Yes, I do! I like bread!|喜欢！我喜欢面包！
lan|Do you like juice?|你喜欢果汁吗？
nhan|No, I don't. I'm not thirsty.|不喜欢。我不渴。
bong|I'm thirsty! I like juice!|我渴了！我喜欢果汁！
lan|Here it is, Bông!|Bông，果汁在这儿！
bong|Thank you, Mrs Lan!|谢谢Lan老师！""")),
                 ("Noodles or Ice Cream?", '面条还是冰淇淋？', L("""
narr|Xiaomei is opening a big box. There are noodles and ice cream in it.|Xiaomei在打开一个大盒子。盒子里有面条和冰淇淋。
xiaomei|Noodles or ice cream, Bông?|Bông，面条还是冰淇淋？
bong|Do you like noodles?|你喜欢面条吗？
xiaomei|Yes, I do! Noodles are nice!|喜欢！面条好吃！
bong|I don't like noodles. I like ice cream! Ice cream is nice!|我不喜欢面条。我喜欢冰淇淋！冰淇淋好吃！
leo|Do you like ice cream, Mrs Lan?|Lan老师，你喜欢冰淇淋吗？""")),
                 ("It Looks Nice!", '看起来很好吃！', L("""
narr|Leo has got a burger and chips.|Leo有汉堡和薯条。
lan|Yes, I do! It looks nice! Do you like burgers, Leo?|喜欢！看起来很好吃！Leo，你喜欢汉堡吗？
leo|Yes, I do! I like chips!|喜欢！我也喜欢薯条！
narr|A frog is hopping next to the chips.|一只青蛙在薯条旁边跳。
bong|Look! Do you like chips, frog?|看！青蛙，你喜欢薯条吗？
leo|Oh no! It's on my burger!|哎呀！它在我的汉堡上！
anna|Ha ha! The frog likes burgers!|哈哈！青蛙喜欢汉堡！""")),
                 ("No, Thank You!", '不要，谢谢！', L("""
narr|The frog is hopping under the table. Now Mrs Lan has got candy.|青蛙跳到桌子下面。现在Lan老师有糖果。
lan|Do you want candy, Bông?|Bông，你想吃糖果吗？
bong|No, thank you!|不要，谢谢！
lan|Do you want candy, Vũ?|Vũ，你想吃糖果吗？
nhan|No, thank you. I want an apple!|不要，谢谢。我想吃苹果！
leo|An apple? Wow! Really?|苹果？哇！真的吗？
nhan|Yes! I'm hungry!|真的！我饿了！
lan|An apple? Here you are, Vũ!|苹果？给你，Vũ！""")),
                 ("A Cross!", '打叉！', L("""
narr|There are six foods in Mrs Lan's picture.|Lan老师的图上有六种食物。
lan|Look at the picture! Do you like noodles? No? Put a cross!|看图！你喜欢面条吗？不喜欢？打个叉！
bong|I don't like noodles. Put a cross!|我不喜欢面条。打叉！
nhan|I don't like candy. A cross!|我不喜欢糖果。打叉！
leo|I like burgers! No cross for burgers!|我喜欢汉堡！汉堡不打叉！
lan|What about you, ___? Do you like chips?|___，你呢？你喜欢薯条吗？"""))],
        'bb': ('Do You Like…?', '你喜欢…吗？', [('bread', 'Do you like bread? Yes, I do.', '你喜欢面包吗？喜欢。'), ('juice', 'Do you like juice? Yes, I do.', '你喜欢果汁吗？喜欢。'),
               ('noodles', "Do you like noodles? No, I don't.", '你喜欢面条吗？不喜欢。'), ('ice_cream', 'Do you like ice cream? Yes, I do. It looks nice!', '你喜欢冰淇淋吗？喜欢。看起来很好吃！'),
               ('burger', 'Do you like burgers and chips? Yes, I do!', '你喜欢汉堡和薯条吗？喜欢！'), ('candy', 'Do you want candy? No, thank you!', '你想吃糖果吗？不要，谢谢！'),
               ('cross', "I don't like candy. Put a cross! What about you, ___?", '我不喜欢糖果。打个叉！___，你呢？')]),
        've': [('lan', 'NOO-dles, BREAD and CHIPS and RICE!', '面条面包和米饭！', '-ice / an'), ('kids', 'YUM-my, YUM-my! It LOOKS NICE!', '真好吃呀，我喜欢！', '-ice / an'),
               ('kids', '___, ___, do you LIKE it TOO?', '___，___，你也喜欢吗？', '-oo / a'), ('kids', 'YES, I DO! Yes, YES, I DO!', '喜欢喜欢，喜欢呀！', '-oo / a')],
        'hoi': [(1, 5, 'Does Vũ like fruit?', ["No, he doesn't.", 'Yes, he does.'], 0, 'Vũ喜欢水果吗？', ['不喜欢。', '喜欢。']),
                (2, 3, 'Does Vũ like bread?', ['Yes, he does.', "No, he doesn't."], 0, 'Vũ喜欢面包吗？', ['喜欢。', '不喜欢。']),
                (3, 5, 'What does Bông like?', ['Ice cream.', 'Noodles.'], 0, 'Bông喜欢什么？', ['冰淇淋。', '面条。']),
                (4, 6, 'Where is the frog?', ["On Leo's burger.", 'In the box.'], 0, '青蛙在哪儿？', ['在Leo的汉堡上。', '在盒子里。']),
                (5, 5, 'What does Vũ want?', ['An apple.', 'Candy.'], 0, 'Vũ想吃什么？', ['苹果。', '糖果。']),
                (6, 3, "Bông doesn't like noodles. What does she do?", ['She puts a cross.', 'She eats noodles.'], 0, 'Bông不喜欢面条。她做什么？', ['打叉。', '吃面条。'])]}

U[10] = {'ten_en': 'Leo and the Weather', 'ten_zh': 'Leo和天气', 'bg': ['ls_home', 'ls_home', 'ls_park', 'ls_home', 'ls_park', 'ls_park'],
         'parent': {'Mummy': 'me_leo', 'Mum': 'me_leo', 'Daddy': 'bo_leo', 'Dad': 'bo_leo'},
         'phan': [("Come and Play!", '来玩吧！', L("""
narr|It's sunny and hot today. Anna comes to Leo's flat.|今天天气晴朗，很热。Anna来到Leo的家。
anna|Good morning, Leo! It's sunny today, so come and play with me!|Leo，早上好！今天是晴天，来和我一起玩吧！
leo|Where can we play, Anna?|Anna，我们能在哪儿玩？
anna|Let's go to the park and look at the little boat.|我们去公园看小船吧。
leo|Daddy, can I go to the park with Anna?|爸爸，我能和Anna去公园吗？
bo_leo|Yes, you can. Have fun, kids!|能。孩子们，玩得开心！""")),
                  ("Wear Your Coat!", '穿上外套！', L("""
narr|Today it's cold and windy, and Anna comes again.|今天又冷又有风，Anna又来了。
narr|Leo is wearing a T-shirt.|Leo穿着T恤。
bo_leo|No, Leo! It's cold today. Wear your coat, please!|不行，Leo！今天很冷。请穿上你的外套！
leo|OK, Daddy. My coat, my hat and my long scarf!|好的，爸爸。我的外套、我的帽子和我的长围巾！
anna|Ha ha! Your scarf is very, very long, Leo!|哈哈！Leo，你的围巾好长好长！
leo|Yes, and I'm not cold! Let's go!|是啊，我不冷了！我们走吧！""")),
                  ("A Big Umbrella", '一把大雨伞', L("""
narr|Today it's cloudy. Anna and Leo have got a lot of food for a picnic: bread, fruit and juice.|今天多云。Anna和Leo带了很多吃的去野餐：面包、水果和果汁。
leo|I'm hungry! I want bread, please.|我饿了！我要面包。
narr|Oh no! It's raining!|哎呀！下雨了！
narr|Leo drops his bread.|Leo的面包掉了。
leo|My bread! Oh no!|我的面包！哎呀！
anna|Look, I've got an umbrella! Come under my big umbrella, Leo!|看，我有雨伞！Leo，到我的大雨伞下面来！
leo|Thank you, Anna!|谢谢你，Anna！""")),
                  ("Stay at Home", '待在家里', L("""
narr|Anna and Leo go home. It's raining a lot.|Anna和Leo回家了。雨下得很大。
leo|Mummy, can I go out?|妈妈，我能出去吗？
me_leo|No, Leo. It's raining a lot. Stay at home, please.|不行，Leo。雨下得很大。请待在家里。
narr|Leo looks out of the window. He is sad.|Leo看着窗外。他很难过。
leo|I don't want to stay at home! I want to go out!|我不想待在家里！我想出去！
me_leo|You can go out tomorrow, Leo.|Leo，你明天可以出去。""")),
                  ("Smile, Snowman!", '雪人，笑一笑！', L("""
narr|The next morning, it's snowing, and the park is white!|第二天早上，下雪了，公园白白的！
me_leo|You can go out today, Leo! Wear your coat.|Leo，你今天可以出去了！穿上外套。
narr|Anna comes, and they go out and make a big snowman.|Anna来了，他们出去堆了一个大雪人。
leo|Look! The snowman has got a hat and my long scarf!|看！雪人有一顶帽子和我的长围巾！
anna|Smile, snowman!|雪人，笑一笑！
narr|Look! The snowman smiles!|看！雪人笑了！
leo|It's really fun today!|今天真好玩！""")),
                  ("Go Away, Sun!", '太阳，走开！', L("""
narr|Leo and Anna make another snowman, so there are two snowmen.|Leo和Anna又堆了一个雪人，现在有两个雪人。
narr|Then the sun comes out, and it's hot.|然后太阳出来了，天气很热。
leo|Oh no! Look, the snowmen are not happy!|哎呀！看，雪人不开心了！
anna|Go away, Sun! Please go away!|太阳，走开！请走开！
leo|Stay, snowmen, stay! Don't go away!|雪人，留下来！不要走！
anna|What's the weather like today, ___? Is it sunny or snowy?|___，今天天气怎么样？是晴天还是下雪？"""))],
         'bb': ("What's the Weather Like?", '天气怎么样？', [('sunny', "It's sunny today. It's hot.", '今天晴天。很热。'), ('windy', "It's windy today. Wear your coat.", '今天有风。穿上外套。'),
                ('cloudy', "It's cloudy today.", '今天多云。'), ('rainy', "It's raining a lot. Stay at home.", '雨下得很大。待在家里。'),
                ('umbrella', 'Here is your umbrella.', '给你雨伞。'), ('snowman', "It's snowing. Let's go out and make a snowman!", '下雪了。我们出去堆雪人吧！'),
                ('weather', "What's the weather like today, ___?", '___，今天天气怎么样？')]),
         've': [('lan', 'SUN-ny, CLOUD-y, RAIN-y DAY!', '晴天多云下雨天！', '-ay / an'), ('kids', 'WEAR your COAT and GO and PLAY!', '穿上外套出去玩！', '-ay / an'),
                ('kids', "___, ___, WHAT'S the WEATH-er?", '___，___，什么天？', '-er / an'), ('kids', "SNOW-y! LET'S make a SNOW-man to-GETH-er!", '下雪天，堆雪人呀一起玩！', '-er / an')],
         'hoi': [(1, 1, "What's the weather like?", ["It's sunny and hot.", "It's snowing."], 0, '天气怎么样？', ['晴天，很热。', '下雪了。']),
                 (2, 4, 'What does Leo wear?', ['A coat, a hat and a scarf.', 'A T-shirt and shorts.'], 0, 'Leo穿什么？', ['外套、帽子和围巾。', 'T恤和短裤。']),
                 (3, 4, 'What does Leo drop?', ['His bread.', 'His umbrella.'], 0, 'Leo的什么掉了？', ['面包。', '雨伞。']),
                 (4, 3, 'Can Leo go out?', ["No, he can't.", 'Yes, he can.'], 0, 'Leo能出去吗？', ['不能。', '能。']),
                 (5, 4, 'What has the snowman got?', ['A hat and a scarf.', 'An umbrella.'], 0, '雪人有什么？', ['帽子和围巾。', '雨伞。']),
                 (6, 4, 'What does Anna say to the sun?', ['Go away, Sun!', 'Hello, Sun!'], 0, 'Anna对太阳说什么？', ['太阳，走开！', '太阳，你好！'])]}

U[11] = {'ten_en': "Bông's New Clothes", 'ten_zh': 'Bông的新衣服', 'bg': 'ls_park', 'parent': {'Grandma': 'ba'},
         'phan': [("A Brown Jacket", '棕色的夹克', L("""
narr|Grandma, Bông and Leo go to a big clothes shop in town.|奶奶、Bông和Leo去城里的一家大服装店。
bong|Look, Grandma! There are a lot of clothes here!|奶奶，看！这里有很多衣服！
ba|What colour do you like, Leo?|Leo，你喜欢什么颜色？
leo|I like brown. Look at this brown jacket and these brown boots!|我喜欢棕色。看这件棕色的夹克和这双棕色的靴子！
bong|Wow, a brown jacket! It's really cool, Leo!|哇，棕色的夹克！Leo，真酷！
leo|Thank you! Do you like it, Grandma?|谢谢！奶奶，你喜欢吗？""")),
                  ("A Gold Dress", '金色的裙子', L("""
narr|Bông looks at the dresses, and she likes a gold dress.|Bông看裙子，她喜欢一条金色的裙子。
ba|What colour do you like, Bông? Pink or gold?|Bông，你喜欢什么颜色？粉色还是金色？
bong|Gold! It's my favourite colour, Grandma.|金色！奶奶，这是我最喜欢的颜色。
narr|Grandma likes a silver handbag next to the dresses.|奶奶喜欢裙子旁边的一个银色手提包。
ba|Look at this silver bag. It's nice!|看这个银色的包。真好看！
bong|A gold dress for me and a silver bag for you, Grandma!|金色的裙子给我，银色的包给奶奶！""")),
                  ("Bounce, Bounce!", '拍，拍！', L("""
narr|There are two balls in the shop: a gold ball and a silver ball.|商店里有两个球：一个金色的球和一个银色的球。
ba|Where are Leo and Bông? I can't see them.|Leo和Bông在哪儿？我看不见他们。
narr|Look! They are next to the window. They bounce the balls.|看！他们在窗户旁边。他们在拍球。
leo|Bounce, bounce! My silver ball can jump!|拍，拍！我的银色球能跳！
bong|Bounce, bounce! My gold ball is fun!|拍，拍！我的金色球真好玩！
ba|Come here, please, kids!|孩子们，请过来！""")),
                  ("I Want Shorts!", '我要短裤！', L("""
ba|Come here, Leo! Look at these trousers. They're brown.|Leo，过来！看这条裤子。是棕色的。
leo|Brown trousers? Hmm, I like the blue jeans!|棕色的裤子？嗯，我喜欢蓝色的牛仔裤！
narr|But it's very hot today, and Leo is thirsty.|可是今天很热，Leo很渴。
leo|It's hot, Grandma. I want shorts, please!|奶奶，太热了。我要短裤！
ba|OK! Do you want white shorts or brown shorts?|好！你要白色的短裤还是棕色的短裤？
leo|White shorts, please! They're cool!|白色的短裤！很酷！
ba|White shorts for you, and you can wear them today!|白色短裤给你，你今天就能穿！""")),
                  ("A Pink Skirt", '粉色的短裙', L("""
narr|Bông wants a skirt, too, so she looks at the skirts.|Bông也想要一条短裙，她看短裙。
bong|Look, Grandma! I like this pink skirt and these white socks.|奶奶，看！我喜欢这条粉色的裙子和这双白色的袜子。
leo|I want a white shirt and red socks!|我要一件白衬衫和红色的袜子！
narr|Oh no! Leo has got one red sock. Where is his sock?|哎呀！Leo只有一只红袜子。另一只袜子在哪儿？
bong|It's under the skirt! Here you are, Leo.|在短裙下面！给你，Leo。
ba|Cool clothes! Let's go home, kids.|衣服真酷！孩子们，我们回家吧。""")),
                  ("Where Are My Glasses?", '我的眼镜在哪儿？', L("""
narr|Grandma wants to see the new clothes, but where are her gold glasses?|奶奶想看看新衣服，可是她的金色眼镜在哪儿？
ba|Where are my glasses? I can't see!|我的眼镜在哪儿？我看不见！
leo|Are they in your silver handbag, Grandma?|奶奶，在你的银色手提包里吗？
bong|Are they under the clothes? No!|在衣服下面吗？不在！
narr|Bông looks at Grandma and smiles.|Bông看着奶奶笑了。
bong|Grandma! Your glasses are on your head!|奶奶！你的眼镜在你的头上！
ba|Ha ha! What clothes do you like, ___?|哈哈！___，你喜欢什么衣服？"""))],
         'bb': ('What Colour Is It?', '什么颜色？', [('clothes', 'Look at the clothes!', '看这些衣服！'), ('brown', "It's a brown jacket. It's cool!", '这是棕色的夹克。真酷！'),
                ('dress', 'She likes the gold dress.', '她喜欢金色的裙子。'), ('silver', "It's a silver bag.", '这是银色的包。'),
                ('shorts', "They're white shorts.", '这是白色的短裤。'), ('sock', "They're red socks.", '这是红色的袜子。'),
                ('glasses', 'What colour do you like, ___? I like gold!', '___，你喜欢什么颜色？我喜欢金色！')]),
         've': [('lan', 'GOLD and SIL-ver, PINK and BROWN!', '金色银色真好看！', '-own / an'), ('kids', 'COOL new CLOTHES for ME in TOWN!', '新衣服呀穿一穿！', '-own / an'),
                ('kids', '___, ___, WHAT do you WEAR?', '___，___，穿什么？', '-ear / e'), ('kids', 'SOCKS and SHORTS, a PAIR, a PAIR!', '短裤袜子，就是这个！', '-air / e')],
         'hoi': [(1, 4, 'What colour does Leo like?', ['Brown.', 'Pink.'], 0, 'Leo喜欢什么颜色？', ['棕色。', '粉色。']),
                 (2, 3, "What is Bông's favourite colour?", ['Gold.', 'Silver.'], 0, 'Bông最喜欢什么颜色？', ['金色。', '银色。']),
                 (3, 3, 'What do Leo and Bông do?', ['They bounce the balls.', 'They eat cake.'], 0, 'Leo和Bông做什么？', ['他们拍球。', '他们吃蛋糕。']),
                 (4, 6, 'What does Leo want?', ['White shorts.', 'Brown trousers.'], 0, 'Leo要什么？', ['白色的短裤。', '棕色的裤子。']),
                 (5, 2, 'What colour is the skirt?', ['Pink.', 'Brown.'], 0, '短裙是什么颜色？', ['粉色。', '棕色。']),
                 (6, 6, "Where are Grandma's glasses?", ['On her head.', 'In her handbag.'], 0, '奶奶的眼镜在哪儿？', ['在她的头上。', '在她的手提包里。'])]}

U[12] = {'ten_en': 'Our Party', 'ten_zh': '我们的派对', 'bg': ['ls_class', 'ls_class', 'ls_home', 'ls_class', 'ls_class', 'ls_class'],
         'parent': {'Mummy': 'me_leo', 'Grandma': 'ba'},
         'phan': [("Let's Count!", '我们数一数！', L("""
narr|It's sunny today, and the kids are in the classroom.|今天是晴天，小朋友们在教室里。
lan|Good morning, class! Let's have a class party!|小朋友们，早上好！我们开一个班级派对吧！
kids|A party? Great!|派对？太好了！
anna|How many people are there in our class, Mrs Lan?|Lan老师，我们班有几个人？
lan|I don't know. Let's count the people!|我不知道。我们数一数吧！
narr|One person, two people, three people… ten people!|一个人、两个人、三个人……十个人！
bong|There are nine kids and Mrs Lan, so there are ten people!|有九个小朋友和Lan老师，一共有十个人！""")),
                  ("The First of June", '六月一号', L("""
narr|Mrs Lan writes a word on the board: PARTY.|Lan老师在黑板上写了一个字：PARTY。
lan|Let's spell the word together: P-A-R-T-Y!|我们一起拼这个字：P-A-R-T-Y！
lan|The party is on the first of June. It's at eight o'clock.|派对在六月一号。八点开始。
xiaomei|The first of June? That's Children's Day!|六月一号？那是儿童节！
narr|Bông has got a red crayon, and she makes a poster for the party.|Bông有一支红蜡笔，她给派对做了一张海报。
leo|Cool! Your poster is really nice, Bông!|真酷！Bông，你的海报真好看！""")),
                  ("Hooray!", '耶！', L("""
narr|It's Saturday, the first of June, and Leo is at home.|今天是星期六，六月一号，Leo在家里。
leo|What time is it now, Mummy?|妈妈，现在几点？
me_leo|It's eight o'clock now.|现在八点。
leo|Saturday, at eight o'clock? It's party time! Hooray!|星期六八点？派对时间到了！耶！
me_leo|Wear your cool new clothes, and let's go to the party!|穿上你的新衣服，我们去派对吧！
leo|Hooray! Let's go now! I'm really excited!|耶！我们现在就走！我好兴奋！
narr|Leo and Mummy go to the party at school.|Leo和妈妈去学校参加派对。""")),
                  ("Table Tennis", '乒乓球', L("""
narr|At the party, Anna and Vũ are playing table tennis next to the window.|在派对上，Anna和Vũ在窗户旁边打乒乓球。
anna|Leo, come and play table tennis with us!|Leo，来和我们一起打乒乓球吧！
narr|Leo uses a big tennis racket.|Leo用一个大网球拍。
nhan|Ha ha! Leo, that's a tennis racket!|哈哈！Leo，那是网球拍！
anna|We play table tennis. Use this little racket, please.|我们打乒乓球。请用这个小球拍。
leo|Oh, sorry! A little racket for table tennis!|哦，对不起！打乒乓球用小球拍！
nhan|Great! Now you can play!|太好了！现在你能打了！""")),
                  ("Pick Up the Shoe", '把鞋拿起来', L("""
narr|Now Bông plays table tennis, and she jumps and jumps.|现在Bông打乒乓球，她跳啊跳。
bong|Oh no! Where is my shoe? I can't see it!|哎呀！我的鞋在哪儿？我看不见！
leo|Look, it's under the table!|看，在桌子下面！
narr|Bông looks under the table, but she can't pick up her shoe.|Bông往桌子下面看，可是她拿不到她的鞋。
narr|Xiaomei is little, so she picks up the shoe.|Xiaomei个子小，她把鞋拿起来了。
xiaomei|Here you are, Bông! Here is your shoe.|给你，Bông！这是你的鞋。
bong|Thank you, Xiaomei!|谢谢你，Xiaomei！""")),
                  ("Let's Take a Photo!", '我们拍照吧！', L("""
narr|Anna has got a big cake for Mrs Lan.|Anna给Lan老师带了一个大蛋糕。
anna|Mrs Lan, this cake is for you!|Lan老师，这个蛋糕是给您的！
lan|Thank you, kids! Let's take a photo together!|谢谢你们！我们一起拍照吧！
narr|Click! Ten people smile and say, "Hooray!"|咔嚓！十个人笑着说："耶！"
narr|On Sunday, Leo shows the photo to Grandma.|星期天，Leo给奶奶看照片。
leo|Look, Grandma! There are ten people in our photo!|奶奶，看！我们的照片里有十个人！
leo|How many people are there in your family, ___?|___，你家有几个人？"""))],
         'bb': ('How Many…Are There?', '有几个…？', [('people', 'How many people are there? There are two people.', '有几个人？有两个人。'),
                ('shoe', 'How many shoes are there? There are four shoes.', '有几只鞋？有四只鞋。'), ('ball', 'How many balls are there? There are six balls.', '有几个球？有六个球。'),
                ('tennis_racket', 'How many rackets are there? There are eight rackets.', '有几个球拍？有八个球拍。'), ('letter', 'How many words are there? There are ten words.', '有几个字？有十个字。'),
                ('take_a_photo', 'There are ten people in the photo. Hooray!', '照片里有十个人。耶！'), ('count', 'How many people are there in your family, ___?', '___，你家有几个人？')]),
         've': [('lan', "LET'S count PEO-ple! ONE, two, THREE!", '我们数人，一二三！', '-ee / an'), ('kids', 'HOW many PEO-ple CAN you SEE?', '数数我们一个班！', '-ee / an'),
                ('kids', '___, ___, how MAN-y? SAY!', '___，___，有几个？', '-ay / e'), ('kids', 'TEN! Ten PEO-ple! Hip, hip, hoo-RAY!', '十个十个，真快乐！', '-ay / e')],
         'hoi': [(1, 7, 'How many people are there in the class?', ['Ten.', 'Nine.'], 0, '班里有几个人？', ['十个。', '九个。']),
                 (2, 3, 'When is the party?', ['On the first of June.', 'On Sunday.'], 0, '派对是什么时候？', ['六月一号。', '星期天。']),
                 (3, 3, 'What time is it?', ["It's eight o'clock.", "It's ten o'clock."], 0, '现在几点？', ['八点。', '十点。']),
                 (4, 3, 'What does Leo use?', ['A tennis racket.', 'A crayon.'], 0, 'Leo用什么？', ['网球拍。', '蜡笔。']),
                 (5, 5, 'Who picks up the shoe?', ['Xiaomei.', 'Leo.'], 0, '谁把鞋拿起来？', ['Xiaomei。', 'Leo。']),
                 (6, 6, 'How many people are there in the photo?', ['Ten.', 'Two.'], 0, '照片里有几个人？', ['十个。', '两个。'])]}
