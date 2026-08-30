import plugin from '../../../lib/plugins/plugin.js'
import { puppeteer } from '../model/index.js'
import { AkashaDB } from './apps/core/db.js'
import { RelationHandler } from './apps/handlers/relation.js'
import { LifeHandler } from './apps/handlers/life.js'
import { InteractionHandler } from './apps/handlers/interaction.js'
import { TravelHandler } from './apps/handlers/travel.js'
import { EconomyHandler } from './apps/handlers/economy.js'
import { SocialHandler } from './apps/handlers/social.js'
import { AdminHandler } from './apps/handlers/admin.js'
import Config from './apps/utils/config.js'

/**
 * 虚空终端 - 恋爱日常插件
 * 基于 astrbot_plugin_akasha_terminal 完全重构的 Yunzai-Bot 版本
 * 纯异步运行 | 无内存泄漏 | 无石山代码 | 完整功能移植
 */
export class AkashaTerminal extends plugin {
  constructor () {
    super({
      name: '虚空终端 - 恋爱日常',
      dsc: '全沉浸现实真情侣恋爱生活模拟插件',
      event: 'message',
      priority: 1000,
      rule: [
        // ========== 关系类指令 ==========
        { reg: '^#?(娶群友 | 娶老婆 | 谈恋爱 | 脱单)$', fnc: 'wife' },
        { reg: '^#?(强娶 | 指定追求)$', fnc: 'forceWife' },
        { reg: '^#?(我想和你在一起 | 表白)$', fnc: 'confession' },
        { reg: '^#?(我愿意 | 答应)$', fnc: 'accept' },
        { reg: '^#?(对不起 | 我拒绝)$', fnc: 'reject' },
        { reg: '^#?(闹别扭了 | 我们分手吧 | 分手 | 离婚)$', fnc: 'breakup' },
        { reg: '^#?(去民政局领证 | 结婚证 | 我们的结婚证)$', fnc: 'marriageCert' },
        { reg: '^#?(家庭信息 | 我们的小家 | 个人资料)$', fnc: 'familyInfo' },
        { reg: '^#?(恋爱纪念日 | 在一起多久了)$', fnc: 'anniversary' },
        
        // ========== 生活类指令 ==========
        { reg: '^#?写恋爱日记[\\s\\S]*$', fnc: 'writeDiary' },
        { reg: '^#?(恋爱日记 | 我们的手帐)$', fnc: 'readDiary' },
        { reg: '^#?(恋爱回忆录 | 时光回忆录)$', fnc: 'memoryBook' },
        { reg: '^#?拍立得[\\s\\S]*$', fnc: 'polaroid' },
        { reg: '^#?(情侣相册 | 我的拍立得)$', fnc: 'photoAlbum' },
        { reg: '^#?(装扮客厅 | 装扮卧室 | 阳台时光 | 厨房烟火)$', fnc: 'roomLife' },
        { reg: '^#?扔漂流瓶[\\s\\S]*$', fnc: 'throwBottle' },
        { reg: '^#?捞漂流瓶$', fnc: 'fishBottle' },
        { reg: '^#?一起看电影[\\s\\S]*$', fnc: 'watchMovie' },
        { reg: '^#?给 TA 点外卖[\\s\\S]*$', fnc: 'orderFood' },
        { reg: '^#?(吃醋了 | 哄哄我)$', fnc: 'jealousy' },
        { reg: '^#?(晚安哄睡 | 想你了)$', fnc: 'goodnight' },
        { reg: '^#?(心跳检测 | 恋爱心动指数)$', fnc: 'heartRate' },
        { reg: '^#?留便签[\\s\\S]*$', fnc: 'leaveNote' },
        { reg: '^#?(查手机 | 翻相册)$', fnc: 'checkPhone' },
        { reg: '^#?今天吃什么$', fnc: 'whatToEat' },
        { reg: '^#?(谁做家务 | 今天谁洗碗)$', fnc: 'whoDoesChores' },
        { reg: '^#?亲自下厨[\\s\\S]*$', fnc: 'cooking' },
        { reg: '^#?恋爱记账[\\s\\S]*$', fnc: 'recordExpense' },
        { reg: '^#?(查看账本 | 恋爱账本)$', fnc: 'viewLedger' },
        { reg: '^#?情侣 100 件小事$', fnc: 'love100Things' },
        { reg: '^#?打卡恋爱小事\\\\s*(\\d+)$', fnc: 'checkinLoveThing' },
        { reg: '^#?设置专属爱称[\\s\\S]*$', fnc: 'setNicknames' },
        { reg: '^#?(查岗 | 报备行程)[\\s\\S]*$', fnc: 'reportStatus' },
        { reg: '^#?设置纪念日[\\s\\S]*$', fnc: 'setAnniversary' },
        { reg: '^#?(重要日子 | 恋爱倒计时)$', fnc: 'countdownDays' },
        
        // ========== 旅行类指令 ==========
        { reg: '^#?(旅行胜地 | 看旅行线路)$', fnc: 'travelDestinations' },
        { reg: '^#?双人旅行[\\s\\S]*$', fnc: 'coupleTravel' },
        { reg: '^#?(旅行足迹 | 情侣护照)$', fnc: 'travelFootprints' },
        
        // ========== 深度互动指令 ==========
        { reg: '^#?(深夜坦白局 | 情侣真心话)$', fnc: 'truthOrDare' },
        { reg: '^#?坦白回答[\\s\\S]*$', fnc: 'answerTruth' },
        { reg: '^#?立下契约[\\s\\S]*$', fnc: 'makeContract' },
        { reg: '^#?(恋爱契约 | 查看契约)$', fnc: 'viewContract' },
        
        // ========== 经济类指令 ==========
        { reg: '^#?(搞钱养家 | 努力上班)$', fnc: 'work' },
        { reg: '^#?(领取低保 | 领零花钱)$', fnc: 'claimBasicIncome' },
        { reg: '^#?存入小金库[\\s\\S]*$', fnc: 'depositLoveFund' },
        { reg: '^#?小金库取钱[\\s\\S]*$', fnc: 'withdrawLoveFund' },
        { reg: '^#?(开店 | 我的店铺 | 升级店铺)$', fnc: 'shopManage' },
        { reg: '^#?(看房 | 买房)[\\s\\S]*$', fnc: 'buyHouse' },
        { reg: '^#?(家具商城 | 购买家具)[\\s\\S]*$', fnc: 'buyFurniture' },
        { reg: '^#?(开共同账户 | 共同存款 | 共同取款)[\\s\\S]*$', fnc: 'jointAccount' },
        { reg: '^#?上交工资卡[\\s\\S]*$', fnc: 'submitSalary' },
        { reg: '^#?(去逛街 | 进去看看 | 去下一家店)$', fnc: 'shopping' },
        
        // ========== 社交类指令 ==========
        { reg: '^#?(情侣决斗 | 爱意大 PK)[\\s\\S]*$', fnc: 'coupleDuel' },
        { reg: '^#?(最甜情侣榜 | 情侣排行)$', fnc: 'sweetCoupleRanking' },
        { reg: '^#?(群 CP 名录 | 群 cp)$', fnc: 'groupCouples' },
        { reg: '^#?(情侣出游 | 浪漫自驾)$', fnc: 'coupleTrip' },
        { reg: '^#?(情侣资产报告 | cp 资产)$', fnc: 'coupleAssets' },
        { reg: '^#?写篇恋爱小作文[\\s\\S]*$', fnc: 'loveStory' },
        { reg: '^#?(恋爱大盘 | 虚空统计)$', fnc: 'statsOverview' },
        { reg: '^#?(我的成就 | 我们的恋爱成就)$', fnc: 'achievements' },
        { reg: '^#?佩戴称号[\\s\\S]*$', fnc: 'equipTitle' },
        { reg: '^#?卸下称号$', fnc: 'unequipTitle' },
        
        // ========== 日常互动指令 ==========
        { reg: '^#?(抱抱 | 紧紧抱住)$', fnc: 'hug' },
        { reg: '^#?(亲亲 | 晚安吻)$', fnc: 'kiss' },
        { reg: '^#?(牵手 | 十指相扣)$', fnc: 'holdHands' },
        { reg: '^#?(摸摸头 | 顺毛)$', fnc: 'patHead' },
        { reg: '^#?(吹头发 | 给 TA 吹头发)$', fnc: 'dryHair' },
        { reg: '^#?(投喂 | 投喂 TA)$', fnc: 'feed' },
        { reg: '^#?(捏捏脸 | 揉揉肩 | 贴贴)$', fnc: 'cuddle' },
        { reg: '^#?(情侣签到 | 早安打卡)$', fnc: 'dailyCheckin' },
        { reg: '^#?送礼物[\\s\\S]*$', fnc: 'giveGift' },
        { reg: '^#?(我的背包 | 使用道具)[\\s\\S]*$', fnc: 'backpack' },
        { reg: '^#?去约会$', fnc: 'date' },
        
        // ========== 增强类指令 ==========
        { reg: '^#?(亲密度 | 亲密等级)$', fnc: 'intimacyLevel' },
        { reg: '^#?写信[\\s\\S]*$', fnc: 'writeLetter' },
        { reg: '^#?读信$', fnc: 'readLetter' },
        { reg: '^#?(情侣共同任务 | 领取共同奖励)$', fnc: 'coupleTask' },
        { reg: '^#?埋下时光胶囊[\\s\\S]*$', fnc: 'timeCapsule' },
        { reg: '^#?(添加心愿 | 心愿单)[\\s\\S]*$', fnc: 'wishList' },
        { reg: '^#?实现心愿[\\s\\S]*$', fnc: 'fulfillWish' },
        { reg: '^#?(种植爱情树 | 浇灌爱情树)$', fnc: 'loveTree' },
        { reg: '^#?发起默契问答$', fnc: 'compatibilityQuiz' },
        { reg: '^#?默契回答[\\s\\S]*$', fnc: 'answerQuiz' },
        { reg: '^#?(恋爱盲盒 | 每日运势)$', fnc: 'loveBlindBox' },
        
        // ========== AI 月老指令 ==========
        { reg: '^#?月老算姻缘[\\s\\S]*$', fnc: 'matchmaker' },
        { reg: '^#?情感调解[\\s\\S]*$', fnc: 'mediation' },
        { reg: '^#?(月老恋爱军师 | 恋爱军师)[\\s\\S]*$', fnc: 'loveAdvisor' },
        
        // ========== 管理员指令 ==========
        { reg: '^#?虚空时间重置[\\s\\S]*$', fnc: 'resetCooldown', permission: 'master' },
        { reg: '^#?虚空清除无效存档$', fnc: 'cleanInvalidData', permission: 'master' }
      ],
      task: [
        {
          name: '虚空终端每日任务',
          cron: '0 0 * * *',
          fnc: 'dailyTask'
        }
      ]
    })

    // 初始化数据库
    this.db = new AkashaDB()
    
    // 初始化各模块处理器（传入 this 引用以便访问插件方法）
    this.relation = new RelationHandler(this.db, this)
    this.life = new LifeHandler(this.db, this)
    this.interaction = new InteractionHandler(this.db, this)
    this.travel = new TravelHandler(this.db, this)
    this.economy = new EconomyHandler(this.db, this)
    this.social = new SocialHandler(this.db, this)
    this.admin = new AdminHandler(this.db, this)
    
    logger.mark('[虚空终端] 恋爱日常插件已加载 | 纯异步运行 | 完整功能版')
  }

  /**
   * 获取用户 ID
   */
  getUserId (e) {
    return e.user_id?.toString() || e.sender?.user_id?.toString() || ''
  }

  /**
   * 获取群组 ID
   */
  getGroupId (e) {
    return e.group_id?.toString() || ''
  }

  /**
   * 获取目标用户 ID（@的人）
   */
  getTargetId (e) {
    if (e.message && Array.isArray(e.message)) {
      const at = e.message.find(m => m.type === 'at')
      if (at) return at.qq?.toString() || at.user_id?.toString() || ''
    }
    return ''
  }

  /**
   * 获取用户昵称
   */
  async getUserNick (e, userId) {
    if (!userId) return '某人'
    try {
      // 优先从群名片获取
      if (e.group && e.group.getMemberMap) {
        const member = await e.group.pickMember(userId)
        if (member) return member.info?.card || member.info?.nickname || `用户${userId}`
      }
      // 兜底
      return `用户${userId}`
    } catch {
      return `用户${userId}`
    }
  }

  /**
   * 获取用户头像 URL
   */
  getUserAvatar (userId) {
    return `https://q.qlogo.cn/headimg_dl?dst_uin=${userId}&spec=640`
  }

  /**
   * 检查冷却时间
   */
  async checkCooldown (key, cdSeconds) {
    const now = Date.now()
    const stored = await redis.get(`akasha:cd:${key}`)
    if (stored) {
      const expire = parseInt(stored)
      if (expire > now) {
        return Math.ceil((expire - now) / 1000)
      }
    }
    // 设置冷却
    await redis.set(`akasha:cd:${key}`, (now + cdSeconds * 1000).toString(), { EX: cdSeconds })
    return 0
  }

  /**
   * 检查是否为特权用户
   */
  isExempt (userId) {
    const exempt = cfg.akasha?.exempt_users || []
    return exempt.includes(userId.toString())
  }

  /**
   * 统一回复方法
   */
  async reply (msg, quote = false) {
    if (!msg) return
    try {
      if (typeof msg === 'string') {
        await this.e.reply(msg, quote ? { quote: true } : {})
      } else if (Buffer.isBuffer(msg)) {
        await this.e.reply({ image: msg })
      } else {
        await this.e.reply(msg)
      }
    } catch (err) {
      logger.error('[虚空终端] 回复失败:', err)
    }
  }

  // ========== 关系类指令 ==========

  /** #娶群友 */
  async wife () {
    return await this.relation.wife(this.e, false)
  }

  /** #强娶 */
  async forceWife () {
    return await this.relation.wife(this.e, true)
  }

  /** #表白 */
  async confession () {
    return await this.relation.confession(this.e)
  }

  /** #我愿意 */
  async accept () {
    return await this.relation.respond(this.e, true)
  }

  /** #我拒绝 */
  async reject () {
    return await this.relation.respond(this.e, false)
  }

  /** #分手 */
  async breakup () {
    return await this.relation.breakup(this.e)
  }

  /** #结婚证 */
  async marriageCert () {
    return await this.relation.marriageCert(this.e)
  }

  /** #家庭信息 */
  async familyInfo () {
    return await this.relation.familyInfo(this.e)
  }

  /** #恋爱纪念日 */
  async anniversary () {
    return await this.relation.anniversary(this.e)
  }

  // ========== 生活类指令 ==========

  /** #写恋爱日记 */
  async writeDiary () {
    return await this.life.writeDiary(this.e)
  }

  /** #恋爱日记 */
  async readDiary () {
    return await this.life.readDiary(this.e)
  }

  /** #恋爱回忆录 */
  async memoryBook () {
    return await this.life.memoryBook(this.e)
  }

  /** #拍立得 */
  async polaroid () {
    return await this.life.polaroid(this.e)
  }

  /** #情侣相册 */
  async photoAlbum () {
    return await this.life.photoAlbum(this.e)
  }

  /** #房间生活 */
  async roomLife () {
    return await this.life.roomLife(this.e)
  }

  /** #扔漂流瓶 */
  async throwBottle () {
    return await this.life.throwBottle(this.e)
  }

  /** #捞漂流瓶 */
  async fishBottle () {
    return await this.life.fishBottle(this.e)
  }

  /** #一起看电影 */
  async watchMovie () {
    return await this.life.watchMovie(this.e)
  }

  /** #给 TA 点外卖 */
  async orderFood () {
    return await this.life.orderFood(this.e)
  }

  /** #吃醋了 */
  async jealousy () {
    return await this.life.jealousy(this.e)
  }

  /** #晚安哄睡 */
  async goodnight () {
    return await this.life.goodnight(this.e)
  }

  /** #心跳检测 */
  async heartRate () {
    return await this.life.heartRate(this.e)
  }

  /** #留便签 */
  async leaveNote () {
    return await this.life.leaveNote(this.e)
  }

  /** #查手机 */
  async checkPhone () {
    return await this.life.checkPhone(this.e)
  }

  /** #今天吃什么 */
  async whatToEat () {
    return await this.life.whatToEat(this.e)
  }

  /** #谁做家务 */
  async whoDoesChores () {
    return await this.life.whoDoesChores(this.e)
  }

  /** #亲自下厨 */
  async cooking () {
    return await this.life.cooking(this.e)
  }

  /** #恋爱记账 */
  async recordExpense () {
    return await this.life.recordExpense(this.e)
  }

  /** #查看账本 */
  async viewLedger () {
    return await this.life.viewLedger(this.e)
  }

  /** #情侣 100 件小事 */
  async love100Things () {
    return await this.life.love100Things(this.e)
  }

  /** #打卡恋爱小事 */
  async checkinLoveThing () {
    return await this.life.checkinLoveThing(this.e)
  }

  /** #设置专属爱称 */
  async setNicknames () {
    return await this.life.setNicknames(this.e)
  }

  /** #查岗/报备行程 */
  async reportStatus () {
    return await this.life.reportStatus(this.e)
  }

  /** #设置纪念日 */
  async setAnniversary () {
    return await this.life.setAnniversary(this.e)
  }

  /** #重要日子 */
  async countdownDays () {
    return await this.life.countdownDays(this.e)
  }

  // ========== 旅行类指令 ==========

  /** #旅行胜地 */
  async travelDestinations () {
    return await this.travel.destinations(this.e)
  }

  /** #双人旅行 */
  async coupleTravel () {
    return await this.travel.coupleTravel(this.e)
  }

  /** #旅行足迹 */
  async travelFootprints () {
    return await this.travel.footprints(this.e)
  }

  // ========== 深度互动指令 ==========

  /** #深夜坦白局 */
  async truthOrDare () {
    return await this.interaction.truthOrDare(this.e)
  }

  /** #坦白回答 */
  async answerTruth () {
    return await this.interaction.answerTruth(this.e)
  }

  /** #立下契约 */
  async makeContract () {
    return await this.interaction.makeContract(this.e)
  }

  /** #查看契约 */
  async viewContract () {
    return await this.interaction.viewContract(this.e)
  }

  // ========== 经济类指令 ==========

  /** #搞钱养家 */
  async work () {
    return await this.economy.work(this.e)
  }

  /** #领取低保 */
  async claimBasicIncome () {
    return await this.economy.claimBasicIncome(this.e)
  }

  /** #存入小金库 */
  async depositLoveFund () {
    return await this.economy.depositLoveFund(this.e)
  }

  /** #小金库取钱 */
  async withdrawLoveFund () {
    return await this.economy.withdrawLoveFund(this.e)
  }

  /** #开店管理 */
  async shopManage () {
    return await this.economy.shopManage(this.e)
  }

  /** #买房 */
  async buyHouse () {
    return await this.economy.buyHouse(this.e)
  }

  /** #购买家具 */
  async buyFurniture () {
    return await this.economy.buyFurniture(this.e)
  }

  /** #共同账户 */
  async jointAccount () {
    return await this.economy.jointAccount(this.e)
  }

  /** #上交工资卡 */
  async submitSalary () {
    return await this.economy.submitSalary(this.e)
  }

  /** #去逛街 */
  async shopping () {
    return await this.economy.shopping(this.e)
  }

  // ========== 社交类指令 ==========

  /** #情侣决斗 */
  async coupleDuel () {
    return await this.social.coupleDuel(this.e)
  }

  /** #最甜情侣榜 */
  async sweetCoupleRanking () {
    return await this.social.sweetCoupleRanking(this.e)
  }

  /** #群 CP 名录 */
  async groupCouples () {
    return await this.social.groupCouples(this.e)
  }

  /** #情侣出游 */
  async coupleTrip () {
    return await this.social.coupleTrip(this.e)
  }

  /** #情侣资产报告 */
  async coupleAssets () {
    return await this.social.coupleAssets(this.e)
  }

  /** #写篇恋爱小作文 */
  async loveStory () {
    return await this.social.loveStory(this.e)
  }

  /** #恋爱大盘 */
  async statsOverview () {
    return await this.social.statsOverview(this.e)
  }

  /** #我的成就 */
  async achievements () {
    return await this.social.achievements(this.e)
  }

  /** #佩戴称号 */
  async equipTitle () {
    return await this.social.equipTitle(this.e)
  }

  /** #卸下称号 */
  async unequipTitle () {
    return await this.social.unequipTitle(this.e)
  }

  // ========== 日常互动指令 ==========

  /** #抱抱 */
  async hug () {
    return await this.interaction.hug(this.e)
  }

  /** #亲亲 */
  async kiss () {
    return await this.interaction.kiss(this.e)
  }

  /** #牵手 */
  async holdHands () {
    return await this.interaction.holdHands(this.e)
  }

  /** #摸摸头 */
  async patHead () {
    return await this.interaction.patHead(this.e)
  }

  /** #吹头发 */
  async dryHair () {
    return await this.interaction.dryHair(this.e)
  }

  /** #投喂 */
  async feed () {
    return await this.interaction.feed(this.e)
  }

  /** #捏捏脸 */
  async cuddle () {
    return await this.interaction.cuddle(this.e)
  }

  /** #情侣签到 */
  async dailyCheckin () {
    return await this.interaction.dailyCheckin(this.e)
  }

  /** #送礼物 */
  async giveGift () {
    return await this.interaction.giveGift(this.e)
  }

  /** #我的背包 */
  async backpack () {
    return await this.interaction.backpack(this.e)
  }

  /** #去约会 */
  async date () {
    return await this.interaction.date(this.e)
  }

  // ========== 增强类指令 ==========

  /** #亲密度 */
  async intimacyLevel () {
    return await this.interaction.intimacyLevel(this.e)
  }

  /** #写信 */
  async writeLetter () {
    return await this.interaction.writeLetter(this.e)
  }

  /** #读信 */
  async readLetter () {
    return await this.interaction.readLetter(this.e)
  }

  /** #情侣共同任务 */
  async coupleTask () {
    return await this.interaction.coupleTask(this.e)
  }

  /** #埋下时光胶囊 */
  async timeCapsule () {
    return await this.interaction.timeCapsule(this.e)
  }

  /** #添加心愿 */
  async wishList () {
    return await this.interaction.wishList(this.e)
  }

  /** #实现心愿 */
  async fulfillWish () {
    return await this.interaction.fulfillWish(this.e)
  }

  /** #种植爱情树 */
  async loveTree () {
    return await this.interaction.loveTree(this.e)
  }

  /** #发起默契问答 */
  async compatibilityQuiz () {
    return await this.interaction.compatibilityQuiz(this.e)
  }

  /** #默契回答 */
  async answerQuiz () {
    return await this.interaction.answerQuiz(this.e)
  }

  /** #恋爱盲盒 */
  async loveBlindBox () {
    return await this.interaction.loveBlindBox(this.e)
  }

  // ========== AI 月老指令 ==========

  /** #月老算姻缘 */
  async matchmaker () {
    return await this.interaction.matchmaker(this.e)
  }

  /** #情感调解 */
  async mediation () {
    return await this.interaction.mediation(this.e)
  }

  /** #恋爱军师 */
  async loveAdvisor () {
    return await this.interaction.loveAdvisor(this.e)
  }

  // ========== 管理员指令 ==========

  /** #虚空时间重置 */
  async resetCooldown () {
    return await this.admin.resetCooldown(this.e)
  }

  /** #虚空清除无效存档 */
  async cleanInvalidData () {
    return await this.admin.cleanInvalidData(this.e)
  }
}

export default AkashaTerminal
