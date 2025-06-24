import { BotApi, AlemonApi, plugin } from '../../model/api/api.js'
/**https://github.com/wbndm1234/trss-akasha-terminal-plugin**/
export class cp extends plugin {
  constructor() {
    super({
      name: '虚空cp文生成器',
      dsc: '本地生成虚空cp文',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '^#?虚空cp文生成(?:\\s+\\@[\\w\\d\\-]+)?$',
          fnc: 'cp'
        }
      ]
    })
  }

  async cp(e) {
    console.log("用户命令：", e.msg);
    
    // 获取消息中@的用户
    let atTarget = e.message.find(m => m.type === 'at');
    let targetUser = null;
    
    if (atTarget) {
      // 如果有@用户，使用真@形式
      targetUser = {
        nickname: segment.at(atTarget.qq),
        user_id: atTarget.qq
      };
    } else {
      // 如果没有@用户，随机选择一个群成员并使用真@形式
      let map = await e.group.getMemberMap();
      let arrMember = Array.from(map.values())
        .filter(m => m.user_id !== e.user_id); // 排除自己
      
      if (arrMember.length === 0) {
        return e.reply("群内没有其他成员可以生成CP文");
      }
      
      let randomMember = arrMember[Math.round(Math.random() * (arrMember.length - 1))];
      targetUser = {
        nickname: segment.at(randomMember.user_id), // 使用真@
        user_id: randomMember.user_id
      };
    }
    //  生成随机数选择CP文模板
    let num = Math.floor(Math.random() * 145); // 1-145
    
    // 根据随机数选择不同的CP文模板
    let msg = "";
    if (num <= 1) {
      msg = "「给你变个魔术。」" + targetUser.nickname + "笑着看着两眼放光的" + segment.at(e.user_id) + "，伸出了空无一物的双手。\n「这里面什么都没有，但是……」\n" + targetUser.nickname + "狡黠地挑了挑眉，捏住了" + segment.at(e.user_id) + "的脸，" + segment.at(e.user_id) + "吃痛后吸了一口凉气。\n「……现在，里面有全世界。」";
    } else if (num <= 2) {
      msg = "夜晚的凉风让" + segment.at(e.user_id) + "打了个喷嚏，\n一旁" + targetUser.nickname + "替" + segment.at(e.user_id) + "披上外套，\n连着好几日的餐桌多了锅鸡汤。";
    } else if (num <= 3) {
      msg = "朋友聚会的时候，" + targetUser.nickname + "一脸自豪地搂着" + segment.at(e.user_id) + "对别人说:「" + segment.at(e.user_id) + "真的超可爱！我们两个一拍即合！」旁边的" + segment.at(e.user_id) + "脸一下就红了，心里暗想着:我记得之前是我先追的你啊，现在又是怎么回事。";
    } else if (num <= 4) {
      msg = targetUser.nickname + "一直认为自己不是一个合格的恋人，因为直到最后，他给" + segment.at(e.user_id) + "的也只有一个掩埋在战场废墟下混杂着血腥味的吻。";
    } else if (num <= 5) {
      msg = "有一次，狗仔在" + targetUser.nickname + "家门口蹲拍，想拍到" + targetUser.nickname + "和他的女朋友。等到第二天下午，" + targetUser.nickname + "终于从大门出来了，而他身后跟着一个走路踉踉跄跄的" + segment.at(e.user_id) + "。";
    } else if (num <= 6) {
      msg = targetUser.nickname + "用复杂的眼神看着" + segment.at(e.user_id) + "，叹了一声说:放过我也放过你自己吧，" + segment.at(e.user_id) + "舔了舔带血的刀刃，充满爱意的眼神看着" + targetUser.nickname + "。\n'这样你就一直是我的了。'";
    } else if (num <= 7) {
      msg = segment.at(e.user_id) + "：「像你这样的人，我最讨厌了！」\n" + targetUser.nickname + "：「想吃土豆炖肉～」\n" + segment.at(e.user_id) + "：「我不是正在做吗！」";
    } else if (num <= 8) {
      msg = "一大早," + targetUser.nickname + "：快点起来了,再不起来不给你早餐了。 " + segment.at(e.user_id) + "：可是你昨晚害人家的腰好酸...\n" + targetUser.nickname + "：那是因为我教你的姿势都不对啊（扶额\n" + segment.at(e.user_id) + "：但我跟你说过呢！我不会瑜伽啊！";
    } else if (num <= 9) {
      msg = "'夏天又来了呢'，" + segment.at(e.user_id) + "望着远处湛蓝的天空。\n'" + targetUser.nickname + "你什么时候才会回来呢？'";
    } else if (num <= 10) {
      msg = targetUser.nickname + "和" + segment.at(e.user_id) + "在山上看星星，耳畔是风声、虫鸣和淙淙淙淙流水。\"听，山川的歌谣。\"" + segment.at(e.user_id) + "闭上眼，\"还有你和我的心跳。";
    } else if (num <= 11) {
      msg = targetUser.nickname + "拽着" + segment.at(e.user_id) + "的尾巴，" + segment.at(e.user_id) + "眼圈儿红红说：「我给你麻花吃，你不要吃我好不好？」";
    } else if (num <= 12) {
      msg = segment.at(e.user_id) + "一把拉过" + targetUser.nickname + "的手作势要摘掉手链一边故作正经的说：「作为一名受到严格要求的好学生是不允许带饰品的。」\n" + targetUser.nickname + "从" + segment.at(e.user_id) + "手里抽出胳膊，讨饶似的向他比心，" + segment.at(e.user_id) + "还是不为所动，并且告诫他：「像这样去撩其他学生也是不可以的。」";
    } else if (num <= 13) {
      msg = segment.at(e.user_id) + "是" + targetUser.nickname + "的替补门将，他一直想取代" + targetUser.nickname + "，这一天" + targetUser.nickname + "主动提出让" + segment.at(e.user_id) + "首发，在" + segment.at(e.user_id) + "欣喜若狂之时，" + targetUser.nickname + "凑到他耳边轻声说：「今晚可要好好报答我哦。」";
    } else if (num <= 14) {
      msg = segment.at(e.user_id) + "没有说任何一句话。\n眼里笑意不再，仿若陌生人一般。\n" + targetUser.nickname + "没有追问。\n毕竟若是真的问了的话，一定就再也忍受不住了吧。 " + targetUser.nickname + "明白的。\n可他们还需要有什么底线呢？记忆缺了好几个章节，似乎很重要，但" + targetUser.nickname + "早就忘了。\n忘了他们的从前。\n如今他再也想不起" + segment.at(e.user_id) + "的脸了。";
    } else if (num <= 15) {
      msg = segment.at(e.user_id) + "：「干嘛脱我衣服？」\n" + targetUser.nickname + "：「我买的衣服，我想脱就脱」\n" + segment.at(e.user_id) + "：「那你摸我干什么」\n" + targetUser.nickname + "：「我的人，我想摸就摸」";
    } else if (num <= 16) {
      msg = "多年后，" + targetUser.nickname + "回看过去，从零星而又斑驳的记忆里觅得些许年少的身影，" + segment.at(e.user_id) + "突兀闯进他这浑浑噩噩又悲剧到极点的岁月，温柔坚定地斩断他和过去的连接，极具自私地渡给他少年时期的冲动。从" + targetUser.nickname + "看到" + segment.at(e.user_id) + "眼睛起的那一刻，" + targetUser.nickname + "已经远离了过往，朝着未知的光砥砺前行。";
    } else if (num <= 17) {
      msg = targetUser.nickname + "往碗里倒满了猫粮，走到床边顺着" + segment.at(e.user_id) + "豪奢的金发摸到他的项圈，温柔地说到：「" + segment.at(e.user_id) + "大人，该起来吃早饭了。」";
    } else if (num <= 18) {
      msg = "黑夜尚未散去，" + targetUser.nickname + "轻轻将手臂抽离，却被拦腰抱住。 「别走」" + segment.at(e.user_id) + "说。" + targetUser.nickname + "亲吻他的手背：「你知道我没有选择」。";
    } else if (num <= 19) {
      msg = segment.at(e.user_id) + " ，谢谢你，你是第一个肯定我的人。这是出现在" + targetUser.nickname + "日记本里的一句话。";
    } else if (num <= 20) {
      msg = segment.at(e.user_id) + "去吻了" + targetUser.nickname + "的双唇，饱含着虔诚与温柔。\n" + segment.at(e.user_id) + "知道了，自从这一把烈火的狂放席卷自身，双目早就无法从那绚烂上移开——彼此燃烧彼此，有不可思议的热度，甚至散发着麻药燃烧的味道，愈发成瘾。";
    } else if (num <= 21) {
      msg = segment.at(e.user_id) + "过生日，朋友们都写了祝福语，" + targetUser.nickname + "念到" + segment.at(e.user_id) + "的时候" + segment.at(e.user_id) + "的贺卡上写着，“I want to be with you everyday.  Forever love you darling～”";
    } else if (num <= 22) {
      msg = segment.at(e.user_id) + "丢了重要证件正急得团团转，忽然接到" + targetUser.nickname + "的电话。十分钟后，" + targetUser.nickname + "带着装着证件的皮包匆匆赶来。“太感谢了！”" + segment.at(e.user_id) + "连连鞠躬，“所有的证件都在这里了！”" + targetUser.nickname + "皱起眉头：“是吗？好像还少了一个呢。”" + segment.at(e.user_id) + "：“？”" + targetUser.nickname + "：“少了跟我的结婚证。”\n";
    } else if (num <= 23) {
      msg = segment.at(e.user_id) + "有个很可爱的小毛病，会在半夜睡得迷迷糊糊的时候揽" + targetUser.nickname + "的脖子，其实在半夜挺吓人的，但是" + targetUser.nickname + "从来没和" + segment.at(e.user_id) + "提过，毕竟只有他自己知道，他有多喜欢" + segment.at(e.user_id) + "无意识呢喃出自己的名字。";
    } else if (num <= 24) {
      msg = targetUser.nickname + "：我为了你还俗了，佛珠当了，给你买酒。你听得见吗？\n" + segment.at(e.user_id) + "：……事到如今，何必呢。";
    } else if (num <= 25) {
      msg = "时隔多年，" + targetUser.nickname + "再想起" + segment.at(e.user_id) + "，内心依旧那样痛：那个月光如水的晚上，如果能抱一抱" + segment.at(e.user_id) + "就好了。";
    } else if (num <= 26) {
      msg = segment.at(e.user_id) + "的夏天在1999年的六月开始，于2012年的三月结束。至此过后，再也不会有" + targetUser.nickname + "。" 
    } else if (num <= 27) {
      msg = segment.at(e.user_id) + "一直觉得他在利用" + targetUser.nickname + "，他以为" + targetUser.nickname + "是个笨蛋。\n可惜他错了，" + targetUser.nickname + "不是笨蛋，他才是。";
    } else if (num <= 28) {
      msg = targetUser.nickname + "轻抚着" + segment.at(e.user_id) + "的脸颊，眼里包含了万种风情";
    } else if (num <= 29) {
      msg = segment.at(e.user_id) + "是唯一敢取笑" + targetUser.nickname + "的人，其他的人取笑" + targetUser.nickname + "的时候，都被他冷漠的眼神吓到，只有" + segment.at(e.user_id) + "，他才会露出温柔的眼神。因为，" + segment.at(e.user_id) + "是" + targetUser.nickname + "一生里，最重要的朋友。";
    } else if (num <= 30) {
      msg = segment.at(e.user_id) + "和" + targetUser.nickname + "都是学校里知名的学霸。" + segment.at(e.user_id) + "在毕业的宴上喝得烂醉，小声嘟囔着什么，最后大家只能拜托在场唯一没喝酒的" + targetUser.nickname + "送他回家。\n回家的车上，" + targetUser.nickname + "听清了" + segment.at(e.user_id) + "的话，" + segment.at(e.user_id) + "说：“老子就是为了让你注意到才拼命学习的，你居然三年都没发现我对你的感情，你是傻吗！”\n" + targetUser.nickname + "安抚地亲了一下" + segment.at(e.user_id) + "的鼻尖，“是啊，我的小傻瓜，三年了，都没发现我对你的感情吗？”";
    } else if (num <= 31) {
      msg = "在" + targetUser.nickname + "死去的时候，看见了黄泉另一边的" + segment.at(e.user_id) + "和大家。“对不起，”被大家环绕的他忍不住哭了出来，“我来的太早了。”";
    } else if (num <= 32) {
      msg = targetUser.nickname + "有一双能够读心的眼睛。" + segment.at(e.user_id) + "一直都很喜欢他,以为隐藏得很好,却不知" + targetUser.nickname + "什么都知道。";
    } else if (num <= 33) {
      msg = segment.at(e.user_id) + "就像是过了花期却依然盛开着的玫瑰，残香环绕，但只有少数人才能闻得到，而" + targetUser.nickname + "很幸运，他是那少数人之一。\n“无论如何，我也一定将他紧紧握在手心，我要他的全部。”\n" + targetUser.nickname + "如此想着。“这可能是我一生中的最后一人了，无论结局如何，我也认了。”" + segment.at(e.user_id) + "如此想着。";
    } else if (num <= 34) {
      msg = targetUser.nickname + "：晚饭想吃什么？\n" + segment.at(e.user_id) + "：Gala吧。\n" + targetUser.nickname + "：被风沙吹傻了？咱在内蒙，哪来的gala？";
    } else if (num <= 35) {
      msg = targetUser.nickname + "手里拿着给" + segment.at(e.user_id) + "买的甜筒，笑盈盈地说：“你知道吗，这冰淇淋是热的哦。”说罢伸出舌头舔了一口，“不信你来试试。”" + segment.at(e.user_id) + "一脸狐疑把嘴巴凑过去，" + targetUser.nickname + "却忽然把它拿开，朝着" + segment.at(e.user_id) + "微张的嘴深深吻了下去。果真是热的，" + segment.at(e.user_id) + "心想，但一样甜滋滋的。";
    } else if (num <= 36) {
      msg = "令人讽刺的事实是，" + targetUser.nickname + "将要被“光芒”掩盖。" + targetUser.nickname + "好像是在不经意之间看向这边，浅浅的勾起一抹微笑朝这边点头示意。就好像是在和" + segment.at(e.user_id) + "做最后的告别。所以" + segment.at(e.user_id) + "选择去保护" + targetUser.nickname + "，保护这道世上独一无二的光芒，也是作为他的受益者的其中之一。";
    } else if (num <= 37) {
      msg = "实习柜员" + segment.at(e.user_id) + "把刚开好的支票递到" + targetUser.nickname + "的手上：“让您久等了，查看一下信息是否有误，没有问题的话给我的服务打个分吧！”" + targetUser.nickname + "看着" + segment.at(e.user_id) + "笑开的脸，忽然一皱眉头：“这里的收款方写错了哦。”" + segment.at(e.user_id) + "接来一脸错愕，心想不会啊明明对过好几遍的，只听见" + targetUser.nickname + "一字一顿：“收款方应该是" + segment.at(e.user_id) + "。”";
    } else if (num <= 38) {
      msg = "今天是" + targetUser.nickname + "和" + segment.at(e.user_id) + "认识的一周年，" + targetUser.nickname + "给了" + segment.at(e.user_id) + "一个特殊的礼物，这也是他一年里最想做的事情，就是吻了挚友的唇。";
    } else if (num <= 39) {
      msg = segment.at(e.user_id) + "的工作遇到不顺，但初入职场只能忍气吞声。没过几天，" + targetUser.nickname + "主动送" + segment.at(e.user_id) + "上班。" + targetUser.nickname + "把车开到" + segment.at(e.user_id) + "的公司楼下，却与" + segment.at(e.user_id) + "一起下了车。门口的接待看到二人下车说：\"老板早上好。\"";
    } else if (num <= 40) {
      msg = "那是" + segment.at(e.user_id) + "死去的一个月，" + targetUser.nickname + "却在后悔，如果我相信你该有多好？你就不会走了......";
    } else if (num <= 41) {
      msg = targetUser.nickname + "与" + segment.at(e.user_id) + "约定下次出游要定于秋际之时。简单而具代表性的勾指起誓，这是仅仅属于" + targetUser.nickname + "和" + segment.at(e.user_id) + "的小约定。";
    } else if (num <= 42) {
      msg = "是天气正好，是你真好。 " + targetUser.nickname + "将吻印在" + segment.at(e.user_id) + "的唇上，低着声、弯着眸，轻轻悄悄的说着情话。\n「喜欢你的人是我，嗯，只能是我。」";
    } else if (num <= 43) {
      msg = targetUser.nickname + "紧牵" + segment.at(e.user_id) + "的手。在洁白的雪地留下了俩人的脚印。\n" + segment.at(e.user_id) + "伸手，一片雪花落于手心。\n手心温度化了雪花，而" + targetUser.nickname + "也宛如雪花一现而逝。";
    } else if (num <= 44) {
      msg = targetUser.nickname + "抱住" + segment.at(e.user_id) + "，贴着他的脖子蹭啊蹭。\n“你干什么。”" + segment.at(e.user_id) + "问。\n他答：“想染上你的味道。”";
    } else if (num <= 45) {
      msg = segment.at(e.user_id) + "：“我觉得这样不行。”\n" + targetUser.nickname + "：“怎么不行？”\n" + segment.at(e.user_id) + "：“我觉得我太喜欢你了，这样不行”" + targetUser.nickname + "：“那你喜欢我什么？”\n" + segment.at(e.user_id) + "：“喜欢你所有的样子。”\n" + targetUser.nickname + "：“那就行了。”";
    } else if (num <= 46) {
      msg = targetUser.nickname + "和" + segment.at(e.user_id) + "曾是这个班里最不看好会成为朋友的人，后来他们成为了全校最受羡慕的挚友。";
    } else if (num <= 47) {
      msg = targetUser.nickname + " 和" + segment.at(e.user_id) + "从小是一对很要好的兄弟，直到" + targetUser.nickname + "打破约定撇下受出国留学。\n当" + targetUser.nickname + "重新回到国内，想要好好对待" + segment.at(e.user_id) + "时，" + segment.at(e.user_id) + "变得一点也不信任" + targetUser.nickname + " 。\n说是不信任， 更多的还是赌气撒娇多一些。\n" + targetUser.nickname + "就这么哄到" + segment.at(e.user_id) + "高三毕业。在" + segment.at(e.user_id) + "18的成人礼时，将" + segment.at(e.user_id) + "带到他两年都没踏入过的房间。\n" + targetUser.nickname + "凑到受的耳边说:“" + segment.at(e.user_id) + "，你可让我等了你两年啊。”";
    } else if (num <= 48) {
      msg = segment.at(e.user_id) + "确是在" + targetUser.nickname + "心里的贫瘠旷野燎起过一片炽盛滚烫的名为爱的烈火，只不过燃到最后只剩一片荒芜破败的焦土。";
    } else if (num <= 49) {
      msg = "有一天" + targetUser.nickname + "发了一条朋友圈，照片上是" + segment.at(e.user_id) + "枕在他的腿上，上面的文字是：'看看我的猫，可爱吧～'";
    } else if (num <= 50) {
      msg = targetUser.nickname + "当了这么多年总裁，万万没想到自己会在多年后这么自我介绍：\"我，" + segment.at(e.user_id) + "粉头，追星贼6。”";
    } else if (num <= 51) {
      msg = segment.at(e.user_id) + "拿着一张发黄的拍立得，上面的二人面若桃花，笑逐颜开。照片的右下角，淡淡地写着：'" + targetUser.nickname + "与" + segment.at(e.user_id) + " 2019年1月7日'。";
    } else if (num <= 52) {
      msg = segment.at(e.user_id) + "：别装了，不就是觉得我毁了你的清誉吗？我走就是。没人管我倒也自在。\n" + targetUser.nickname + "：［沉默不语看着渐渐远去的背影］";
    } else if (num <= 53) {
      msg = targetUser.nickname + "和" + segment.at(e.user_id) + "一路走来，磕磕绊绊终于成为了恋人。\n只是年少意气还是比不过柴米油盐酱醋茶，最终成为了各自成家后不揭开的伤疤。";
    } else if (num <= 54) {
      msg = targetUser.nickname + "看见" + segment.at(e.user_id) + "在河边钓鱼，" + segment.at(e.user_id) + "似乎对钓鱼兴趣盎然，" + targetUser.nickname + "悄悄走到" + segment.at(e.user_id) + "的身边，俯身轻轻咬住" + segment.at(e.user_id) + "的耳垂，“钓鱼？不如钓我吧。”";
    } else if (num <= 55) {
      msg = "'嘿！你听说了吗？咱年级考了三年第一的那个，叫" + segment.at(e.user_id) + "的，这一次居然没有考第一！' '嗐，这消息早听说了，这一次的年级第一是那个三班的" + targetUser.nickname + "。要不是" + segment.at(e.user_id) + "没来考英语，他可就当不上这个第一咯。'";
    } else if (num <= 56) {
      msg = segment.at(e.user_id) + "在笔记本上写满" + targetUser.nickname + "的那页不见了。\n隔天，" + targetUser.nickname + "：「这是回礼」一张写着慢慢" + segment.at(e.user_id) + "的纸被递了过来";
    } else if (num <= 57) {
      msg = segment.at(e.user_id) + "不知道怎么的，看到" + targetUser.nickname + "的时候会不自觉的微笑然后跑开。" + targetUser.nickname + "为此很是困扰，因此决定找" + segment.at(e.user_id) + "谈一谈。终于有一天" + targetUser.nickname + "好不容易抓到了" + segment.at(e.user_id) + "，刚想开口，就听到" + segment.at(e.user_id) + "眼泪汪汪的说：那个，你手松一下呗，我，我胳膊痛.... " + targetUser.nickname + "愣了一下，还没反应过来，就看到" + segment.at(e.user_id) + "捂着脸跑开了....";
    } else if (num <= 58) {
      msg = segment.at(e.user_id) + "在满场的欢呼声中、在炙热的聚光灯下坚定不移地看着一排一座的位置。他的爱人，" + targetUser.nickname + "就坐在那里，同样坚定不移地看着他。";
    } else if (num <= 59) {
      msg = targetUser.nickname + "有时觉得，他对" + segment.at(e.user_id) + "，不能说没感情，但不是爱，就像虎养着伥。";
    } else if (num <= 60) {
      msg = "海风之中，邮轮上的灯火将他们的脸庞照亮，听到" + segment.at(e.user_id) + "在他耳畔轻声哼起“Every night in my dreams”，" + targetUser.nickname + "一边应和着一边将人搂进了怀里。"
    } else if (num <= 61) {
      msg = targetUser.nickname + "不知道在世界的另一头有一个人依旧偷偷爱着他，每天都在念叨他的名字，饭桌上总是两副碗筷，连睡觉的时候都只枕着一半的枕头。\n" + segment.at(e.user_id) + "也不知道，世界的另一端有一个洁白无瑕的小身影，每天飘来飘去，就为了看到一张总是在梦里出现的脸。";
    } else if (num <= 62) {
      msg = segment.at(e.user_id) + "，我喜欢你。”" + targetUser.nickname + "轻声说着，用颤抖的手轻轻抚摸过黑白的相片，“这句话我藏了十几年，终于有勇气说出来了。但是...你已经听不到了啊。”“" + segment.at(e.user_id) + "，带我走吧。”";
    } else if (num <= 63) {
      msg = segment.at(e.user_id) + "和" + targetUser.nickname + "完全就是两个世界的人啊，为什么他们能走到一起？因为，" + segment.at(e.user_id) + "曾经给" + targetUser.nickname + "带来了光芒。";
    } 
      e.reply(msg);
  }
}