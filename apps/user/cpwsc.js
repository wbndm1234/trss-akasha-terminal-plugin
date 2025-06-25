import{ BotApi, AlemonApi, plugin } from  '../../model/api/api.js'
/**https://github.com/wbndm1234/trss-akasha-terminal-plugin**/
export class cp extends plugin {
  constructor () {
    super({
      name: '虚空cp文生成器',
      dsc: '本地生成虚空cp文',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '^#?虚空cp文生成$',
          fnc: 'cp'
        }
      ]
    })
  }

  async cp (e) {
      console.log("用户命令：", e.msg);
      let num = Math.floor(Math.random() *['0','1','2','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49','50','51','52','53','54','55','56','57','58','59','60','61','62','63','64','65','66','67','68','69','70','71','72','73','74','75','76','77','78','79','80','81','82','83','84','85','86','87','88','89','90','91','92','93','94','95','96','97','98','99','100','101','102','103','104','105','106','107','108','109','110','111','112','113','114','115','116','117','118','119','120','121','122','123','124','125','126','127','128','129','130','131','132','133','134','135','136','137','138','139','140','141','142','143','144','145'].length);
      if (num <= 1) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["“给你变个魔术。”" + targetUser.nickname + "笑着看着两眼放光的" + segment.at(e.user_id) + "，伸出了空无一物的双手。\n“这里面什么都没有，但是……”\n" + targetUser.nickname + "狡黠地挑了挑眉，捏住了" + segment.at(e.user_id) + "的脸，" + segment.at(e.user_id) + "吃痛后吸了一口凉气。\n“……现在，里面有全世界。”"]
        e.reply(msg);
      } else if (num <= 2) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["夜晚的凉风让" + segment.at(e.user_id) + "打了个喷嚏，\n一旁" + targetUser.nickname + "替" + segment.at(e.user_id) + "披上外套，\n连着好几日的餐桌多了锅鸡汤。"]
        e.reply(msg);
      } else if (num <= 3) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["朋友聚会的时候，" + targetUser.nickname + "一脸自豪地搂着" + segment.at(e.user_id) + "对别人说:“" + segment.at(e.user_id) + "真的超可爱！我们两个一拍即合！”旁边的" + segment.at(e.user_id) + "脸一下就红了，心里暗想着:我记得之前是我先追的你啊，现在又是怎么回事。"]
        e.reply(msg);
      } else if (num <= 4) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "一直认为自己不是一个合格的恋人，因为直到最后，他给" + segment.at(e.user_id) + "的也只有一个掩埋在战场废墟下混杂着血腥味的吻。"]
        e.reply(msg);
      } else if (num <= 5) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["有一次，狗仔在" + targetUser.nickname + "家门口蹲拍，想拍到" + targetUser.nickname + "和他的女朋友。等到第二天下午，" + targetUser.nickname + "终于从大门出来了，而他身后跟着一个走路踉踉跄跄的" + segment.at(e.user_id) + "。"]
        e.reply(msg);
      } else if (num <= 6) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "用复杂的眼神看着" + segment.at(e.user_id) + "，叹了一声说:放过我也放过你自己吧，" + segment.at(e.user_id) + "舔了舔带血的刀刃，充满爱意的眼神看着" + targetUser.nickname + "。\n'这样你就一直是我的了。'"]
        e.reply(msg);
      } else if (num <= 7) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + "：“像你这样的人，我最讨厌了！”\n" + targetUser.nickname + "：“想吃土豆炖肉～”\n" + segment.at(e.user_id) + "：“我不是正在做吗！”"]
        e.reply(msg);
      } else if (num <= 8) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["一大早," + targetUser.nickname + "：快点起来了,再不起来不给你早餐了。 " + segment.at(e.user_id) + "：可是你昨晚害人家的腰好酸...\n" + targetUser.nickname + "：那是因为我教你的姿势都不对啊（扶额\n" + segment.at(e.user_id) + "：但我跟你说过呢！我不会瑜伽啊！"]
        e.reply(msg);
      } else if (num <= 9) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["'夏天又来了呢'，" + segment.at(e.user_id) + "望着远处湛蓝的天空。\n'" + targetUser.nickname + "你什么时候才会回来呢？'"]
        e.reply(msg);
      } else if (num <= 10) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "和" + segment.at(e.user_id) + "在山上看星星，耳畔是风声、虫鸣和淙淙流水。\"听，山川的歌谣。\"" + segment.at(e.user_id) + "闭上眼，\"还有你和我的心跳。"]
        e.reply(msg);
      } else if (num <= 11) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "拽着" + segment.at(e.user_id) + "的尾巴，" + segment.at(e.user_id) + "眼圈儿红红说：“我给你麻花吃，你不要吃我好不好？”"]
        e.reply(msg);
      } else if (num <= 12) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + "一把拉过" + targetUser.nickname + "的手作势要摘掉手链一边故作正经的说：“作为一名受到严格要求的好学生是不允许带饰品的。”\n" + targetUser.nickname + "从" + segment.at(e.user_id) + "手里抽出胳膊，讨饶似的向他比心，" + segment.at(e.user_id) + "还是不为所动，并且告诫他：“像这样去撩其他学生也是不可以的。”"]
        e.reply(msg);
      } else if (num <= 13) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + "是" + targetUser.nickname + "的替补门将，他一直想取代" + targetUser.nickname + "，这一天" + targetUser.nickname + "主动提出让" + segment.at(e.user_id) + "首发，在" + segment.at(e.user_id) + "欣喜若狂之时，" + targetUser.nickname + "凑到他耳边轻声说：“今晚可要好好报答我哦。”"]
        e.reply(msg);
      } else if (num <= 14) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + "没有说任何一句话。\n眼里笑意不再，仿若陌生人一般。\n" + targetUser.nickname + "没有追问。\n毕竟若是真的问了的话，一定就再也忍受不住了吧。 " + targetUser.nickname + "明白的。\n可他们还需要有什么底线呢？记忆缺了好几个章节，似乎很重要，但" + targetUser.nickname + "早就忘了。\n忘了他们的从前。\n如今他再也想不起" + segment.at(e.user_id) + "的脸了。"]
        e.reply(msg);
      } else if (num <= 15) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + ":“干嘛脱我衣服？”\n" + targetUser.nickname + ":“我买的衣服，我想脱就脱”\n" + segment.at(e.user_id) + ":“那你摸我干什么”\n" + targetUser.nickname + ":“我的人，我想摸就摸”"]
        e.reply(msg);
      } else if (num <= 16) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["多年后，" + targetUser.nickname + "回看过去，从零星而又斑驳的记忆里觅得些许年少的身影，" + segment.at(e.user_id) + "突兀闯进他这浑浑噩噩又悲剧到极点的岁月，温柔坚定地斩断他和过去的连接，极具自私地渡给他少年时期的冲动。从" + targetUser.nickname + "看到" + segment.at(e.user_id) + "眼睛起的那一刻，" + targetUser.nickname + "已经远离了过往，朝着未知的光砥砺前行。"]
        e.reply(msg);
      } else if (num <= 17) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "往碗里倒满了猫粮，走到床边顺着" + segment.at(e.user_id) + "豪奢的金发摸到他的项圈，温柔地说到：“" + segment.at(e.user_id) + "大人，该起来吃早饭了。”"]
        e.reply(msg);
      } else if (num <= 18) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["黑夜尚未散去，" + targetUser.nickname + "轻轻将手臂抽离，却被拦腰抱住。 “别走”" + segment.at(e.user_id) + "说。" + targetUser.nickname + "亲吻他的手背：“你知道我没有选择”。"]
        e.reply(msg);
      } else if (num <= 19) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + " ，谢谢你，你是第一个肯定我的人。这是出现在" + targetUser.nickname + "日记本里的一句话。"]
        e.reply(msg);
      } else if (num <= 20) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + "去吻了" + targetUser.nickname + "的双唇，饱含着虔诚与温柔。\n" + segment.at(e.user_id) + "知道了，自从这一把烈火的狂放席卷自身，双目早就无法从那绚烂上移开——彼此燃烧彼此，有不可思议的热度，甚至散发着麻药燃烧的味道，愈发成瘾。"]
        e.reply(msg);
      } else if (num <= 21) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "过生日，朋友们都写了祝福语，" + targetUser.nickname + "念到" + segment.at(e.user_id) + "的时候" + segment.at(e.user_id) + "的贺卡上写着，“I want to be with you everyday.  Forever love you darling～”"]
        e.reply(msg);
      } else if (num <= 22) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + "丢了重要证件正急得团团转，忽然接到" + targetUser.nickname + "的电话。十分钟后，" + targetUser.nickname + "带着装着证件的皮包匆匆赶来。“太感谢了！”" + segment.at(e.user_id) + "连连鞠躬，“所有的证件都在这里了！”" + targetUser.nickname + "皱起眉头：“是吗？好像还少了一个呢。”" + segment.at(e.user_id) + "：“？”" + targetUser.nickname + "：“少了跟我的结婚证。”\n"]
        e.reply(msg);
      } else if (num <= 23) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + "有个很可爱的小毛病，会在半夜睡得迷迷糊糊的时候揽" + targetUser.nickname + "的脖子，其实在半夜挺吓人的，但是" + targetUser.nickname + "从来没和" + segment.at(e.user_id) + "提过，毕竟只有他自己知道，他有多喜欢" + segment.at(e.user_id) + "无意识呢喃出自己的名字。"]
        e.reply(msg);
      } else if (num <= 24) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "：我为了你还俗了，佛珠当了，给你买酒。你听得见吗？\n" + segment.at(e.user_id) + "：……事到如今，何必呢。"]
        e.reply(msg);
      } else if (num <= 25) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["时隔多年，" + targetUser.nickname + "再想起" + segment.at(e.user_id) + "，内心依旧那样痛：那个月光如水的晚上，如果能抱一抱" + segment.at(e.user_id) + "就好了。"]
        e.reply(msg);
      } else if (num <= 26) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + "的夏天在1999年的六月开始，于2012年的三月结束。至此过后，再也不会有" + targetUser.nickname + "。"]
        e.reply(msg);
      } else if (num <= 27) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + "一直觉得他在利用" + targetUser.nickname + "，他以为" + targetUser.nickname + "是个笨蛋。\n可惜他错了，" + targetUser.nickname + "不是笨蛋，他才是。"]
        e.reply(msg);
      } else if (num <= 28) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "轻抚着" + segment.at(e.user_id) + "的脸颊，眼里包含了万种风情"]
        e.reply(msg);
      } else if (num <= 29) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + "是唯一敢取笑" + targetUser.nickname + "的人，其他的人取笑" + targetUser.nickname + "的时候，都被他冷漠的眼神吓到，只有" + segment.at(e.user_id) + "，他才会露出温柔的眼神。因为，" + segment.at(e.user_id) + "是" + targetUser.nickname + "一生里，最重要的朋友。"]
        e.reply(msg);
      } else if (num <= 30) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + "和" + targetUser.nickname + "都是学校里知名的学霸。" + segment.at(e.user_id) + "在毕业的宴上喝得烂醉，小声嘟囔着什么，最后大家只能拜托在场唯一没喝酒的" + targetUser.nickname + "送他回家。\n回家的车上，" + targetUser.nickname + "听清了" + segment.at(e.user_id) + "的话，" + segment.at(e.user_id) + "说：“老子就是为了让你注意到才拼命学习的，你居然三年都没发现我对你的感情，你是傻吗！”\n" + targetUser.nickname + "安抚地亲了一下" + segment.at(e.user_id) + "的鼻尖，“是啊，我的小傻瓜，三年了，都没发现我对你的感情吗？”"]
        e.reply(msg);
      } else if (num <= 31) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["在" + targetUser.nickname + "死去的时候，看见了黄泉另一边的" + segment.at(e.user_id) + "和大家。“对不起，”被大家环绕的他忍不住哭了出来，“我来的太早了。”"]
        e.reply(msg);
      } else if (num <= 32) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "有一双能够读心的眼睛。" + segment.at(e.user_id) + "一直都很喜欢他,以为隐藏得很好,却不知" + targetUser.nickname + "什么都知道。"]
        e.reply(msg);
      } else if (num <= 33) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + "就像是过了花期却依然盛开着的玫瑰，残香环绕，但只有少数人才能闻得到，而" + targetUser.nickname + "很幸运，他是那少数人之一。\n“无论如何，我也一定将他紧紧握在手心，我要他的全部。”\n" + targetUser.nickname + "如此想着。“这可能是我一生中的最后一人了，无论结局如何，我也认了。”" + segment.at(e.user_id) + "如此想着。"]
        e.reply(msg);
      } else if (num <= 34) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "：晚饭想吃什么？\n" + segment.at(e.user_id) + "：Gala吧。\n" + targetUser.nickname + "：被风沙吹傻了？咱在内蒙，哪来的gala？"]
        e.reply(msg);
      } else if (num <= 35) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "手里拿着给" + segment.at(e.user_id) + "买的甜筒，笑盈盈地说：“你知道吗，这冰淇淋是热的哦。”说罢伸出舌头舔了一口，“不信你来试试。”" + segment.at(e.user_id) + "一脸狐疑把嘴巴凑过去，" + targetUser.nickname + "却忽然把它拿开，朝着" + segment.at(e.user_id) + "微张的嘴深深吻了下去。果真是热的，" + segment.at(e.user_id) + "心想，但一样甜滋滋的。"]
        e.reply(msg);
      } else if (num <= 36) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["令人讽刺的事实是，" + targetUser.nickname + "将要被“光芒”掩盖。" + targetUser.nickname + "好像是在不经意之间看向这边，浅浅的勾起一抹微笑朝这边点头示意。就好像是在和" + segment.at(e.user_id) + "做最后的告别。所以" + segment.at(e.user_id) + "选择去保护" + targetUser.nickname + "，保护这道世上独一无二的光芒，也是作为他的受益者的其中之一。"]
        e.reply(msg);
      } else if (num <= 37) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["实习柜员" + segment.at(e.user_id) + "把刚开好的支票递到" + targetUser.nickname + "的手上：“让您久等了，查看一下信息是否有误，没有问题的话给我的服务打个分吧！”" + targetUser.nickname + "看着" + segment.at(e.user_id) + "笑开的脸，忽然一皱眉头：“这里的收款方写错了哦。”" + segment.at(e.user_id) + "接来一脸错愕，心想不会啊明明对过好几遍的，只听见" + targetUser.nickname + "一字一顿：“收款方应该是" + segment.at(e.user_id) + "。”"]
        e.reply(msg);
      } else if (num <= 38) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["今天是" + targetUser.nickname + "和" + segment.at(e.user_id) + "认识的一周年，" + targetUser.nickname + "给了" + segment.at(e.user_id) + "一个特殊的礼物，这也是他一年里最想做的事情，就是吻了挚友的唇。"]
        e.reply(msg);
      } else if (num <= 39) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + "的工作遇到不顺，但初入职场只能忍气吞声。没过几天，" + targetUser.nickname + "主动送" + segment.at(e.user_id) + "上班。" + targetUser.nickname + "把车开到" + segment.at(e.user_id) + "的公司楼下，却与" + segment.at(e.user_id) + "一起下了车。门口的接待看到二人下车说：\"老板早上好。\""]
        e.reply(msg);
      } else if (num <= 40) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["那是" + segment.at(e.user_id) + "死去的一个月，" + targetUser.nickname + "却在后悔，如果我相信你该有多好？你就不会走了......"]
        e.reply(msg);
      } else if (num <= 41) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "与" + segment.at(e.user_id) + "约定下次出游要定于秋际之时。简单而具代表性的勾指起誓，这是仅仅属于" + targetUser.nickname + "和" + segment.at(e.user_id) + "的小约定。"]
        e.reply(msg);
      } else if (num <= 42) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["是天气正好，是你真好。 " + targetUser.nickname + "将吻印在" + segment.at(e.user_id) + "的唇上，低着声、弯着眸，轻轻悄悄的说着情话。\n「喜欢你的人是我，嗯，只能是我。」"]
        e.reply(msg);
      } else if (num <= 43) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "紧牵" + segment.at(e.user_id) + "的手。在洁白的雪地留下了俩人的脚印。\n" + segment.at(e.user_id) + "伸手，一片雪花落于手心。\n手心温度化了雪花，而" + targetUser.nickname + "也宛如雪花一现而逝。"]
        e.reply(msg);
      } else if (num <= 44) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "抱住" + segment.at(e.user_id) + "，贴着他的脖子蹭啊蹭。\n“你干什么。”" + segment.at(e.user_id) + "问。\n他答：“想染上你的味道。”"]
        e.reply(msg);
      } else if (num <= 45) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + "：“我觉得这样不行。”\n" + targetUser.nickname + "：“怎么不行？”\n" + segment.at(e.user_id) + "：“我觉得我太喜欢你了，这样不行”"]
        e.reply(msg);
      } else if (num <= 46) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "和" + segment.at(e.user_id) + "曾是这个班里最不看好会成为朋友的人，后来他们成为了全校最受羡慕的挚友。"]
        e.reply(msg);
      } else if (num <= 47) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["“" + targetUser.nickname + " 和" + segment.at(e.user_id) + "从小是一对很要好的兄弟，直到" + targetUser.nickname + "打破约定撇下受出国留学。\n当" + targetUser.nickname + "重新回到国内，想要好好对待" + segment.at(e.user_id) + "时，" + segment.at(e.user_id) + "变得一点也不信任" + targetUser.nickname + " 。\n说是不信任， 更多的还是赌气撒娇多一些。\n" + targetUser.nickname + "就这么哄到" + segment.at(e.user_id) + "高三毕业。在" + segment.at(e.user_id) + "18的成人礼时，将" + segment.at(e.user_id) + "带到他两年都没踏入过的房间。\n" + targetUser.nickname + "凑到受的耳边说:“" + segment.at(e.user_id) + "，你可让我等了你两年啊。”"]
        e.reply(msg);
      } else if (num <= 48) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + "确是在" + targetUser.nickname + "心里的贫瘠旷野燎起过一片炽盛滚烫的名为爱的烈火，只不过燃到最后只剩一片荒芜破败的焦土。"]
        e.reply(msg);
      } else if (num <= 49) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["有一天" + targetUser.nickname + "发了一条朋友圈，照片上是" + segment.at(e.user_id) + "枕在他的腿上，上面的文字是：'看看我的猫，可爱吧～'"]
        e.reply(msg);
      } else if (num <= 50) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "当了这么多年总裁，万万没想到自己会在多年后这么自我介绍：\"我，" + segment.at(e.user_id) + "粉头，追星贼6。”"]
        e.reply(msg);
      } else if (num <= 51) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + "拿着一张发黄的拍立得，上面的二人面若桃花，笑逐颜开。照片的右下角，淡淡地写着：'" + targetUser.nickname + "与" + segment.at(e.user_id) + " 2019年1月7日'。"]
        e.reply(msg);
      } else if (num <= 52) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + "：别装了，不就是觉得我毁了你的清誉吗？我走就是。没人管我倒也自在。\n" + targetUser.nickname + "：［沉默不语看着渐渐远去的背影］"]
        e.reply(msg);
      } else if (num <= 53) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "和" + segment.at(e.user_id) + "一路走来，磕磕绊绊终于成为了恋人。\n只是年少意气还是比不过柴米油盐酱醋茶，最终成为了各自成家后不揭开的伤疤。"]
        e.reply(msg);
      } else if (num <= 54) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "看见" + segment.at(e.user_id) + "在河边钓鱼，" + segment.at(e.user_id) + "似乎对钓鱼兴趣盎然，" + targetUser.nickname + "悄悄走到" + segment.at(e.user_id) + "的身边，俯身轻轻咬住" + segment.at(e.user_id) + "的耳垂，“钓鱼？不如钓我吧。”"]
        e.reply(msg);
      } else if (num <= 55) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["'嘿！你听说了吗？咱年级考了三年第一的那个，叫" + segment.at(e.user_id) + "的，这一次居然没有考第一！' '嗐，这消息早听说了，这一次的年级第一是那个三班的" + targetUser.nickname + "。要不是" + segment.at(e.user_id) + "没来考英语，他可就当不上这个第一咯。'"]
        e.reply(msg);
      } else if (num <= 56) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + "在笔记本上写满" + targetUser.nickname + "的那页不见了。\n隔天，" + targetUser.nickname + "：「这是回礼」一张写着慢慢" + segment.at(e.user_id) + "的纸被递了过来"]
        e.reply(msg);
      } else if (num <= 57) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + "不知道怎么的，看到" + targetUser.nickname + "的时候会不自觉的微笑然后跑开。" + targetUser.nickname + "为此很是困扰，因此决定找" + segment.at(e.user_id) + "谈一谈。终于有一天" + targetUser.nickname + "好不容易抓到了" + segment.at(e.user_id) + "，刚想开口，就听到" + segment.at(e.user_id) + "眼泪汪汪的说：那个，你手松一下呗，我，我胳膊痛.... " + targetUser.nickname + "愣了一下，还没反应过来，就看到" + segment.at(e.user_id) + "捂着脸跑开了...."]
        e.reply(msg);
      } else if (num <= 58) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + "在满场的欢呼声中、在炙热的聚光灯下坚定不移地看着一排一座的位置。他的爱人，" + targetUser.nickname + "就坐在那里，同样坚定不移地看着他。"]
        e.reply(msg);
      } else if (num <= 59) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "有时觉得，他对" + segment.at(e.user_id) + "，不能说没感情，但不是爱，就像虎养着伥。"]
        e.reply(msg);
      } else if (num <= 60) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["海风之中，邮轮上的灯火将他们的脸庞照亮，听到" + segment.at(e.user_id) + "在他耳畔轻声哼起“Every night in my dreams”，" + targetUser.nickname + "一边应和着一边将人搂进了怀里。"]
        e.reply(msg);
      } else if (num <= 61) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "不知道在世界的另一头有一个人依旧偷偷爱着他，每天都在念叨他的名字，饭桌上总是两副碗筷，连睡觉的时候都只枕着一半的枕头。\n" + segment.at(e.user_id) + "也不知道，世界的另一端有一个洁白无瑕的小身影，每天飘来飘去，就为了看到一张总是在梦里出现的脸。"]
        e.reply(msg);
      } else if (num <= 62) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["“" + segment.at(e.user_id) + "，我喜欢你。”" + targetUser.nickname + "轻声说着，用颤抖的手轻轻抚摸过黑白的相片，“这句话我藏了十几年，终于有勇气说出来了。但是...你已经听不到了啊。”“" + segment.at(e.user_id) + "，带我走吧。”"]
        e.reply(msg);
      } else if (num <= 63) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + "和" + targetUser.nickname + "完全就是两个世界的人啊，为什么他们能走到一起？因为，" + segment.at(e.user_id) + "曾经给" + targetUser.nickname + "带来了光芒。"]
        e.reply(msg);
      } else if (num <= 64) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + "空着手去上课，打铃前的一分钟，教室突然骚动了起来。\n“快看！是" + targetUser.nickname + "学长诶！他怎么来了！”\n" + targetUser.nickname + "拿着一本书，直直走向还沉浸在自己的世界的" + segment.at(e.user_id) + "。\n“你不带书上什么课？”" + targetUser.nickname + "对" + segment.at(e.user_id) + "说。"]
        e.reply(msg);
      } else if (num <= 65) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["“害，说起来怪尴尬的。\n别人家都是架着二郎腿一沓支票扔在桌上：“多少钱才能离开我儿子？”\n唯独" + targetUser.nickname + "朝他的丈母娘喊：“你要多少钱才不让我离开" + segment.at(e.user_id) + "！！”"]
        e.reply(msg);
      } else if (num <= 66) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["万圣节，" + segment.at(e.user_id) + "拿着用来装糖果的小篮子，作出故作要吓" + targetUser.nickname + "的样子：“不给糖就捣蛋！”\n" + targetUser.nickname + "掀起" + segment.at(e.user_id) + "的面具，吻了上去。\n“那我选择捣蛋。”"]
        e.reply(msg);
      } else if (num <= 67) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + "与" + targetUser.nickname + "在暗沉的雨中拥抱，亲吻着却更像是两个野兽互相撕咬着，铁锈味的吻和剧烈地喘息让" + segment.at(e.user_id) + "眼角发红。\n“你他妈就不能小心点吗？！”\n“当时的情况下这是最优解！”\n“滚蛋的最优解！你！”" + segment.at(e.user_id) + "睁大一双圆亮的眼，哆嗦着才发现自己害怕地早就控制不住身体的颤抖。\n" + segment.at(e.user_id) + "颤抖着仰头吻了吻" + targetUser.nickname + "的脸，“……你活着就是最优解啊。”"]
        e.reply(msg);
      } else if (num <= 68) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + "陷入了苦战，" + targetUser.nickname + "突然出现在他身边救了他，后来他们一起击退了敌人，" + targetUser.nickname + "突然害怕的说道，差一点就见不到你了，我的挚友。"]
        e.reply(msg);
      } else if (num <= 69) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + "抓着" + targetUser.nickname + "的手问：「你说，在你眼里我是什么样子？」" + targetUser.nickname + "想了想答：「苹果。」" + segment.at(e.user_id) + "不解，然" + targetUser.nickname + "只是笑笑的没有再解释。\nYou are the apple of my eye"]
        e.reply(msg);
      } else if (num <= 70) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + "是一个游戏up主\n“啊啊啊这个人好烦啊！”" + segment.at(e.user_id) + "又一次被干掉了\n" + targetUser.nickname + "很满足的关掉了游戏\n“亲爱的，都说了你打不过我的”"]
        e.reply(msg);
      } else if (num <= 71) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["一别经年，" + targetUser.nickname + "与" + segment.at(e.user_id) + "重逢在初秋的夜里，凉风习习，秋月无边，蓦地湿热了眼眶。"]
        e.reply(msg);
      } else if (num <= 72) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + "发现一直在比赛中从未输过的" + targetUser.nickname + "这次却输给了自己，后来" + segment.at(e.user_id) + "找到" + targetUser.nickname + "，问他为什么，" + targetUser.nickname + "温柔的说道，我这辈子只想输给你。"]
        e.reply(msg);
      } else if (num <= 73) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + "：欸欸，你看！那个糖葫芦看起来好好吃！！\n" + targetUser.nickname + "：好，给你买。\n" + segment.at(e.user_id) + "：哇！那件衣服也好好看！\n" + targetUser.nickname + "：喜欢的话，就买吧。\n" + segment.at(e.user_id) + "：今天一整天都好开心啊～\n" + targetUser.nickname + "：嗯，轮到我开心了～\n" + segment.at(e.user_id) + "：欸欸欸？什么！"]
        e.reply(msg);
      } else if (num <= 74) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["天寒地冻，盖着棉被也感到冷。\n" + targetUser.nickname + "将" + segment.at(e.user_id) + "的冰凉的脚夹在温暖的大腿中。\n\"睡吧\"" + targetUser.nickname + "宠溺的在" + segment.at(e.user_id) + "的额头落下一吻。"]
        e.reply(msg);
      } else if (num <= 75) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + ":“喂，爆豪~喂~”（从后面叫住）\n" + segment.at(e.user_id) + ":“哈?”（回头）\n“嘻~”（戳脸蛋）\n“///////宰了你!狗屎头!西内!!!!!西内!”"]
        e.reply(msg);
      } else if (num <= 76) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "永远记得与" + segment.at(e.user_id) + "当年泡练习室到晨光熹微，落地镜里少年眼神疲惫神情坚定，纤细的身板笔直，有着毁灭宇宙的力量。\n“怎么样，不错吧？”" + segment.at(e.user_id) + "问，少年眼神倨傲带着笑意。\n“嗯。”" + targetUser.nickname + "点头，“我们以后一定能拿很多很多奖，成为很厉害很厉害的人。”"]
        e.reply(msg);
      } else if (num <= 77) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "认定了一辈子只爱一个人的时候，" + segment.at(e.user_id) + "却忘记去爱一个人的能力，两人在永无止境又短暂的一生中紧紧束缚着对方的心灵却无法真正牵手"]
        e.reply(msg);
      } else if (num <= 78) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "的拳头攥得紧紧地，心里乱得像一团麻。他最近一看见" + segment.at(e.user_id) + "就莫名上火，怎么" + segment.at(e.user_id) + "这只小白兔还敢挑衅本狼呢？"]
        e.reply(msg);
      } else if (num <= 79) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "和" + segment.at(e.user_id) + "一直合不来，但是在这个国度生死存亡之际，他们一起站出来对抗黑暗。"]
        e.reply(msg);
      } else if (num <= 80) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "在满场的欢呼声中、在炙热的聚光灯下坚定不移地看着一排一座的位置。他的爱人，" + segment.at(e.user_id) + "就坐在那里，同样坚定不移地看着他。"]
        e.reply(msg);
      } else if (num <= 81) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["每一年的春天，" + targetUser.nickname + "和" + segment.at(e.user_id) + "都会在那颗桃花树下相聚，一人饮酒，一人品茶。落英缤纷，遮不住两人的明媚笑颜。又是一年春意早，桃花树下却只留一人，自斟自饮，落寞孤寂。"]
        e.reply(msg);
      } else if (num <= 82) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["“你管这个叫爱，" + segment.at(e.user_id) + "你到底长没长心？”\n" + targetUser.nickname + "指了指心口“这里也是会痛的，我爱你啊，爱我就这么难么? " + segment.at(e.user_id) + "，我爱你，所以我希望你也会爱我，我对你好，是想收到你的回馈，爱是自私的你怎么就不明白呢" + segment.at(e.user_id) + "。”"]
        e.reply(msg);
      } else if (num <= 83) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["擦肩而过许多年，" + targetUser.nickname + "仍然忘不掉，那个深秋的夜色里" + segment.at(e.user_id) + "那双染了红色的眼睛，" + targetUser.nickname + "觉得再也没有哪个地方的春天胜过那个人的眼睛。"]
        e.reply(msg);
      } else if (num <= 84) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["在绽放空中的烟花下，俩人相拥而吻。\n" + targetUser.nickname + "细吻着，" + segment.at(e.user_id) + "垫起脚尖努力的回应他。烟花点缀了黑夜，而他点缀了他的人生。"]
        e.reply(msg);
      } else if (num <= 85) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "小朋友与" + segment.at(e.user_id) + "小朋友被逛街的妈妈们寄放在商场游乐园区。" + targetUser.nickname + "对" + segment.at(e.user_id) + "说：\"我和我妈妈说要少花钱。\"" + segment.at(e.user_id) + "问为什么，" + targetUser.nickname + "说：\"要是把钱都花完我就没有钱和你结婚了。\""]
        e.reply(msg);
      } else if (num <= 86) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["“真是太遗憾了，" + segment.at(e.user_id) + "。”\n" + targetUser.nickname + "洒了汽油，泼溅在" + segment.at(e.user_id) + "的尸体上。“下辈子，我们在继续畅谈甚欢吧。”\n火柴接触地面的一刹那燃烧出熊熊烈火如同" + segment.at(e.user_id) + "被染红的胸口。一直在不停的烧，无情的烧，销毁这一切。火烧的是如此妖艳。"]
        e.reply(msg);
      } else if (num <= 87) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "愿意做这事儿，比方说在" + segment.at(e.user_id) + "低下头时亲吻他。他希望看到那男孩慌张的表情，从而忽略" + segment.at(e.user_id) + "那点小小的不情愿。" + targetUser.nickname + "不在意其间产生些违逆的情绪，他只是希望" + segment.at(e.user_id) + "抬头看他一眼，就是这样。一切看起来都那么顺理成章，当新月终于展露头脸时，" + targetUser.nickname + "的幻想也湮没于黑夜之中。"]
        e.reply(msg);
      } else if (num <= 88) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["\"听说人要是每天对着镜子说‘你真棒’，自己就能真的变得更好！”" + segment.at(e.user_id) + "对" + targetUser.nickname + "说。\n\"那么，你每天也对着镜子说……\"" + targetUser.nickname + "思索片刻后望向了" + segment.at(e.user_id) + "。\n\"说什么？”" + segment.at(e.user_id) + "眨了眨眼。\n\"……说‘你真棒’啊，还能有啥？”" + targetUser.nickname + "一副理所当然的样子，好使人看不出来他刚才想的其实是——\n\"说‘我最喜欢" + targetUser.nickname + "了’，这样，你就能多喜欢我一点了吧。”"]
        e.reply(msg);
      } else if (num <= 89) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["「偷袭！」\n‘" + segment.at(e.user_id) + "’从‘" + targetUser.nickname + "’的后方扑上来抱住，成功吓了‘" + targetUser.nickname + "’一跳。\n「我说，」\n‘" + targetUser.nickname + "’把‘" + segment.at(e.user_id) + "’从身后抱来怀中，\n「要偷袭就要从前面来。」"]
        e.reply(msg);
      } else if (num <= 90) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "拿着刀对着手腕比划几下，最终还是没划下去。如果" + segment.at(e.user_id) + "看见了，估计能一枪毙了他吧。这样想着，又有了活下去的动力。"]
        e.reply(msg);
      } else if (num <= 91) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + "再也忍不住了双脚站在天台上已经经过了无数次的崩溃，下一刻就想跳下去，突然感到双手被什么东西拉住了\n" + targetUser.nickname + "“我回来了”\n" + segment.at(e.user_id) + "哭了，“我以为连你也不要我了”"]
        e.reply(msg);
      } else if (num <= 92) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["当" + targetUser.nickname + "扣下扳机的时候，" + segment.at(e.user_id) + "睁开了眼睛，子弹穿破长空射中的是他们多年前的约定。他们还会一起迈向敌人，但是不会一起吃早饭了。"]
        e.reply(msg);
      } else if (num <= 93) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + "说你怎么这么慢才来，我等的花都谢了。\n" + targetUser.nickname + "开口时微微的笑意里藏着想逗人的心思，“我的花还没谢呢，正等着我来。”"]
        e.reply(msg);
      } else if (num <= 94) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "一把把" + segment.at(e.user_id) + "抵在墙上，不费吹灰之力就把" + segment.at(e.user_id) + "手里的抢给卸了，低头在" + segment.at(e.user_id) + "耳边说道:【你的一切皆是我所教…】 ，" + targetUser.nickname + "把手伸进" + segment.at(e.user_id) + "上身，满意的看到对方颤抖【所以…你的弱点我都知道】"]
        e.reply(msg);
      } else if (num <= 95) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + "撅起嘴，看看脚下：“为什么婚礼非要穿高跟鞋啊，人家都不会走路了。”" + targetUser.nickname + "看着" + segment.at(e.user_id) + "委委屈屈的表情，直接一把把" + segment.at(e.user_id) + "公主抱了起来。“不会走就不要走了，”" + targetUser.nickname + "想了想，补充道，“会说我愿意，就足够了。”"]
        e.reply(msg);
      } else if (num <= 96) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["\"我不是人类，\n并不具备任何人的情感。”\n" + segment.at(e.user_id) + "的眼睛仍然是这么冰冷\n" + targetUser.nickname + "叹了口气，释然了。\n\"我早就知道了”\"但是，为了你，我愿意放弃人的情感来爱你。”\n他眼睛却充满了温柔。"]
        e.reply(msg);
      } else if (num <= 97) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "亲吻着" + segment.at(e.user_id) + "的发旋，用指腹拭去眼角的生理泪水，悄声说，“别怕，我们会永远在一起的。”"]
        e.reply(msg);
      } else if (num <= 98) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["都说" + targetUser.nickname + "的眼里藏了长驻的冰雪。\n" + segment.at(e.user_id) + "阖眸前迷迷糊糊地笑——你看，这不是化了吗。"]
        e.reply(msg);
      } else if (num <= 99) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["上衣的第二颗纽扣能给我吗？" + targetUser.nickname + "先生。」男孩提出任性的要求，没人能拒绝他，" + targetUser.nickname + "如他所愿。\n「作为交换……」" + segment.at(e.user_id) + "紧紧攥捏着冰凉的纽扣，企图从中找寻熟悉的触感。\n将曾属于" + targetUser.nickname + "拥有物的纽扣贴在胸口，初春的凉风掠走了相拥的温度。\n「作为交换，我把青春给你。」无论何时何地。他默默补上一句。\n"]
        e.reply(msg);
      } else if (num <= 100) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["是了，" + targetUser.nickname + "想，他与" + segment.at(e.user_id) + "的一生，就是欲言又止，触而不及，氤氲热气间的隐忍对望，与喉间的几口涩酒入肠。他们这该死的默契，让热烈在沉默中阵亡。"]
        e.reply(msg);
      } else if (num <= 101) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "给" + segment.at(e.user_id) + "的承诺最终化为泡影。擦肩、错过、死别辜负了年少的心动。后来" + segment.at(e.user_id) + "回家了，在首饰盒里翻翻找找，所有饰品中只有蓝色小鱼项链一直戴着，其余都是三分钟热度。"]
        e.reply(msg);
      } else if (num <= 102) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["“起床啦，再不起床我就…” " + targetUser.nickname + "温柔的看着" + segment.at(e.user_id) + "。\n“我不起…你能把我怎么样……” " + segment.at(e.user_id) + "一脸不情愿的看着" + targetUser.nickname + "。\n“不起……你说呢？”\n“起…我起还不行吗…”"]
        e.reply(msg);
      } else if (num <= 103) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + "对自己连跪的排位非常不爽。\n" + targetUser.nickname + "朝他晃晃手机，露出国服前三的id：“亲我一口，我带你上分。”"]
        e.reply(msg);
      } else if (num <= 104) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["“……鲸鱼在日落时沉入深海，从此便没有人再见过它了”\n“在那片海域的岸边，很多大陆的居民在那儿的森林附近建成了村落，希望得到大海和鲸的祝福。”\n" + segment.at(e.user_id) + "直起身，看着" + targetUser.nickname + "墓碑后的大海。\n“你想和我一起去看看吗？”"]
        e.reply(msg);
      } else if (num <= 105) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + "：「" + targetUser.nickname + "，你手机里到底存了我多少照片？」\n" + targetUser.nickname + "：「不多，对了，今天再陪我去买记忆卡啊」"]
        e.reply(msg);
      } else if (num <= 106) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["主持人拉长语调念出了获奖者的名字——" + targetUser.nickname + "和" + segment.at(e.user_id) + "。台下人都成了星光点点，他们只望向彼此，十指相扣，把对方说进了获奖感言，也说进了自己的余生。"]
        e.reply(msg);
      } else if (num <= 107) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["这是" + segment.at(e.user_id) + "每天上下学的必经之路，陪伴受长大的还有一位弹吉他的人，" + targetUser.nickname + "的音乐一直在回荡，有一天在也没有了…"]
        e.reply(msg);
      } else if (num <= 108) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "从噩梦中惊醒。\n“我在呢，你做噩梦了？”" + segment.at(e.user_id) + "问" + targetUser.nickname + "。\n“梦见我失去你了……”\n" + targetUser.nickname + "真正醒来了。\n看着空荡荡的床，" + targetUser.nickname + "才明白做的其实是个美梦。"]
        e.reply(msg);
      } else if (num <= 109) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "十分犹豫要不要去敲" + segment.at(e.user_id) + "房间的门，突然，门打开了。 \n\"那么犹豫干嘛？等你好久了\"" + segment.at(e.user_id) + "微微一笑。\n" + targetUser.nickname + "心想:笑起来这么可爱，便吻了上去。"]
        e.reply(msg);
      } else if (num <= 110) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "没敢去参加" + segment.at(e.user_id) + "的葬礼。\n他抽着根烟，听见楼下响起唢呐声。\n是有人在唱——\n“再想见你的面。”\n“除非在梦间。”"]
        e.reply(msg);
      } else if (num <= 111) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + "刚踏出家门就发现脚边有一个大纸箱，纸箱里还时不常地发出\"rrrrr\"像是弹舌的声音。\n纸箱上面写着一段话：未来的主人你好！我叫" + targetUser.nickname + "，我是一只水獭。我会唱歌、会做饭，我还会叫你小乖乖，你愿意收留我吗？"]
        e.reply(msg);
      } else if (num <= 112) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "是学霸，" + segment.at(e.user_id) + "是学渣。每天上课" + segment.at(e.user_id) + "总要偷偷盯着" + targetUser.nickname + "的后脑勺看。直到有一天，" + segment.at(e.user_id) + "被逮了个正着，下课后的厕所隔间，" + targetUser.nickname + "居高临下，对" + segment.at(e.user_id) + "粲然一笑，道：“你是不是喜欢我？”"]
        e.reply(msg);
      } else if (num <= 113) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["放烟花的时候" + targetUser.nickname + "和" + segment.at(e.user_id) + "被挤在河坝的角落里，两个人都穿着宽宽松松的大外套，学高中的小情侣一样用袖子遮着拉手。烟花在天上炸开时很吵，" + targetUser.nickname + "快快地说了句什么，但" + segment.at(e.user_id) + "没听见。因为空气里都是呛人的火药味，而他被呛了一下，连打几个喷嚏。\n" + segment.at(e.user_id) + "抬头装作恶狠狠的样子去追问，" + targetUser.nickname + "斜斜眼睛不理他，他又凑过去，" + targetUser.nickname + "一脸被迫无奈，准备开口时发现周围的人已经开始喷纸花了，" + segment.at(e.user_id) + "眉毛上不幸降落一个小纸片。" + targetUser.nickname + "伸手过去摘掉纸片，笑眯眯地说：“我说的是这个烟花像不像结婚现场放的？现在听见了没？”"]
        e.reply(msg);
      } else if (num <= 114) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["阳光明媚的清晨" + targetUser.nickname + "被怀里的" + segment.at(e.user_id) + "蹭醒，" + targetUser.nickname + "看着" + segment.at(e.user_id) + "一脸委屈巴巴的样子，便一把把他揉进怀里，一边抚摸着" + segment.at(e.user_id) + "的脑袋一边在他耳边温柔的吹气:“乖，我去做早餐。”"]
        e.reply(msg);
      } else if (num <= 115) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "忽然把HR唤到跟前，上手扯了扯胸前的领带，清了清嗓：“不必再帮我寻秘书了，明天就让公关部的" + segment.at(e.user_id) + "来我这报到好了。”"]
        e.reply(msg);
      } else if (num <= 116) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + "怕冷又怕热，一变天就发烧，吃着药还要吃垃圾食品。" + targetUser.nickname + "不让，就撒娇，\"啧！我嘴里苦！\"" + targetUser.nickname + "剥开一颗薄荷糖扔进自己嘴里，\"吃糖就不苦了\"，又顺势拉过" + segment.at(e.user_id) + "亲了上去。"]
        e.reply(msg);
      } else if (num <= 117) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "：小时候是你一直跟在我身后，现在，该我来守护你了，" + segment.at(e.user_id) + "。"]
        e.reply(msg);
      } else if (num <= 118) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["有一天" + targetUser.nickname + "做了一个噩梦，梦到了和" + segment.at(e.user_id) + "一起演音乐剧，可是台下没有观众。" + segment.at(e.user_id) + "非常生气，于是" + targetUser.nickname + "就慌了，开始安慰" + segment.at(e.user_id) + "，可是" + segment.at(e.user_id) + "听不进去就开始哭。"]
        e.reply(msg);
      } else if (num <= 119) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "没有听见" + segment.at(e.user_id) + "的回答，他转过头，却撞进了晴空下的海，澄澈而多情。"]
        e.reply(msg);
      } else if (num <= 120) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "和" + segment.at(e.user_id) + "是宿敌，也是恋人。一次任务中" + targetUser.nickname + "不得不杀了" + segment.at(e.user_id) + "，从此他再也走不出处决爱人的阴影。直到有一天，一个与" + segment.at(e.user_id) + "性格极其相似外貌完全不同的人出现了，" + targetUser.nickname + "便与他共度余生。临终前，" + targetUser.nickname + "摸着爱人的脸，温柔地喊出了" + segment.at(e.user_id) + "的名字。“原来，你一直都知道啊……”"]
        e.reply(msg);
      } else if (num <= 121) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "和" + segment.at(e.user_id) + "是一对冤家。互殴中" + segment.at(e.user_id) + "越来越爱和" + targetUser.nickname + "皮，" + targetUser.nickname + "忍不了开始动手动脚。最后口嗨变成了真爱，二人过上了没羞没臊的日子。"]
        e.reply(msg);
      } else if (num <= 122) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "和" + segment.at(e.user_id) + "经历千辛万险，终于在几年后重归于好。"]
        e.reply(msg);
      } else if (num <= 123) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["对于" + targetUser.nickname + "来说" + segment.at(e.user_id) + "已经成为他心脏上的一块肉，一块很想要脱离他的肉。但他绝对不允许" + segment.at(e.user_id) + "这么做。"]
        e.reply(msg);
      } else if (num <= 124) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "的葬礼，" + segment.at(e.user_id) + "准时到场，事实上这一场特殊的葬礼只有几个人参加。\n只有几个" + targetUser.nickname + "曾经的同事和同学。\n“你是谁？”有人问" + segment.at(e.user_id) + "。\n“我是他的朋友，老朋友，亲近的朋友。”" + segment.at(e.user_id) + "这样说。"]
        e.reply(msg);
      } else if (num <= 125) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "总觉得" + segment.at(e.user_id) + "最近有些奇怪。但偶尔刷到了一个“奇怪的猫”的视频，终于知道" + segment.at(e.user_id) + "奇怪在哪了。原来，快发情了呀。"]
        e.reply(msg);
      } else if (num <= 126) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "和" + segment.at(e.user_id) + "是青梅竹马，小时候" + segment.at(e.user_id) + "因为身材的原因时常被其他小朋友欺负，" + targetUser.nickname + "每次看到就很生气地赶坏孩子走。"]
        e.reply(msg);
      } else if (num <= 127) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "坐在三米的距离，看着台上灯光下、千人目光的焦点中心，" + segment.at(e.user_id) + "雪白的肌肤、丰硕的胸和若隐若现纤细的腰肢，眼眶里将坠未坠的泪，不禁直起了身子。那个六芒星画上去的时候，" + targetUser.nickname + "攥紧了拳头狠狠地想..."]
        e.reply(msg);
      } else if (num <= 128) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "永远记得那个热烈的夏天，冒泡的柠檬汽水和吃完雪糕后凉的甜的嘴唇，" + segment.at(e.user_id) + "吻过来的时候，脑袋空空蝉鸣声声。"]
        e.reply(msg);
      } else if (num <= 129) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["\"你该把我钉在墙上，”" + segment.at(e.user_id) + "说，\"因为你再找不到比我更有趣的蝴蝶。”\n\"那就让我用手代替银针，”" + targetUser.nickname + "说，\"而我的吻是那要你命的乙醚。”"]
        e.reply(msg);
      } else if (num <= 130) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + "背着书包从盐中学大门里走出来，" + targetUser.nickname + "正在校门外等他，见到他的" + targetUser.nickname + "急匆匆掐断烟头猛咳几声，" + segment.at(e.user_id) + "上前夺过吻在" + targetUser.nickname + "的唇上：“师匠，这个味道我不喜欢。”"]
        e.reply(msg);
      } else if (num <= 131) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "沉默站在太空舱透明玻璃前，一双压抑着绝望的眼睛倒映着无边无际的黑暗和漫延的星光。\n“" + segment.at(e.user_id) + "”他叹息般地轻声呼唤，又像是担心惊扰了什么似的，又沉默下去。"]
        e.reply(msg);
      } else if (num <= 132) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + "有着牡丹的酡红、樱花的绯，斑斓的红、描绘了" + targetUser.nickname + "的整个春天。"]
        e.reply(msg);
      } else if (num <= 133) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["拍摄间隙，" + segment.at(e.user_id) + "委屈巴巴地看着'呼噜呼噜'吃面吃得很香的" + targetUser.nickname + "，他突然觉得自己手里的盒饭索然无味。\n一筷子面突然伸到了" + segment.at(e.user_id) + "的面前，\"笨蛋，想吃你就说啊。\""]
        e.reply(msg);
      } else if (num <= 134) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["那是春天，" + targetUser.nickname + "穿着白衬衫站在樱花树下，对" + segment.at(e.user_id) + "温柔的笑着，说：“你是我的唯一。”" + segment.at(e.user_id) + "愣了一下，红了耳尖，把头埋进了" + targetUser.nickname + "宽阔的肩膀。"]
        e.reply(msg);
      } else if (num <= 135) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + ": 黎明要来了，我们黄昏见\n" + segment.at(e.user_id) + ": 黄昏要来了我们明日黎明见\n最终确是一辈子不得见"]
        e.reply(msg);
      } else if (num <= 136) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + "瑟瑟发抖地看着" + targetUser.nickname + "，而后者却还是在不断地靠近……\n" + segment.at(e.user_id) + "大喊一声：“我把我家养的最好的兔子送给你！如果不够，这些全部都给你！”\n" + targetUser.nickname + "微微一笑道：“我要一只就够了，因为——你只有一个啊。”"]
        e.reply(msg);
      } else if (num <= 137) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["漫天飞舞的礼花几乎要遮住镜头，在舞台的那一端，" + targetUser.nickname + "红着眼眶想把这一刻印在脑海里。" + segment.at(e.user_id) + "站在" + targetUser.nickname + "身边注视着他，趁他低头擦眼泪的时候伸手摘下了" + targetUser.nickname + "头顶的那片礼花。"]
        e.reply(msg);
      } else if (num <= 138) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "：你知道我为什么要奋不顾身地来找你吗？你知道为什么漫天火光下看到你我就松了一口气吗？\n" + segment.at(e.user_id) + "：我知道，因为是我啊，独一无二的我。"]
        e.reply(msg);
      } else if (num <= 139) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["财神降临，但要拿身边珍贵之物来换。\n" + targetUser.nickname + "大喊：把" + segment.at(e.user_id) + "的会心都拿去！\n" + targetUser.nickname + "一夜暴富，" + segment.at(e.user_id) + "看起来毫无变化。"]
        e.reply(msg);
      } else if (num <= 140) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "说中也我一想到和蛞蝓死在一块真是不甘心啊。" + segment.at(e.user_id) + "骂了声青花鱼你混账东西，随后被" + targetUser.nickname + "堵住了唇。血腥味充斥鼻腔，他们交换了一个血腥玛丽式的吻。"]
        e.reply(msg);
      } else if (num <= 141) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["“你是不把我放在眼里。”" + segment.at(e.user_id) + "挡住" + targetUser.nickname + "的去路，气呼呼。\n“没把你放在眼里，只把你放进心里。”" + targetUser.nickname + "摸了摸" + segment.at(e.user_id) + "的头。"]
        e.reply(msg);
      } else if (num <= 142) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "和" + segment.at(e.user_id) + "确认关系的那天，" + targetUser.nickname + "说:“" + segment.at(e.user_id) + "的眼睛里有碧蓝的天池是我触而不及的”而在" + targetUser.nickname + "寿终正寝的那天，" + segment.at(e.user_id) + "带着年老沙哑的声音说:“" + targetUser.nickname + "眼中的星辰大海，能包得住碧蓝天池。”"]
        e.reply(msg);
      } else if (num <= 143) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "穿着一身干净的黑色燕尾服站在床边，手里拿着怀表歪着头看着还在床上酣睡的小少爷，又喊了几声，见人还是没有动静，叹了口气认命的俯下身，直接掀开了被子把" + segment.at(e.user_id) + "从床上拖起来：乖，要迟到了。"]
        e.reply(msg);
      } else if (num <= 144) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + segment.at(e.user_id) + "今天的嗓子喊哑了，" + targetUser.nickname + "只好整天哄着。" + segment.at(e.user_id) + "说，“都怪你！” “好好，都怪我，”" + targetUser.nickname + "说，“以后不带你去坐过山车了。”"]
        e.reply(msg);
      } else if (num <= 145) {
        let map = await e.group.getMemberMap();
        let arrMember = Array.from(map.values());
        let mem = arrMember[Math.round(Math.random() * (arrMember.length-1))];
        let msg = ["" + targetUser.nickname + "在沙发上看报纸，" + segment.at(e.user_id) + "从房间里走出来，看到身上撒满阳光的" + targetUser.nickname + "，他满眼笑意地走过去，撒娇说，不要报纸，抱我。" + targetUser.nickname + "抬眼，酒窝乍现。"]
        e.reply(msg);
          }
  }

}
