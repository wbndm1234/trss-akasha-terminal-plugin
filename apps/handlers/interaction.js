/**
 * 互动系统处理器
 */
export class InteractionHandler {
  constructor (db, renderer) {
    this.db = db
    this.renderer = renderer
  }

  getUserId (e) { return e.user_id?.toString() || e.sender?.user_id?.toString() || '' }
  getGroupId (e) { return e.group_id?.toString() || '' }
  
  getTargetId (e) {
    if (e.message && Array.isArray(e.message)) {
      const at = e.message.find(m => m.type === 'at')
      if (at) return at.qq?.toString() || at.user_id?.toString() || ''
    }
    return ''
  }

  async getUserNick (e, userId) {
    if (!userId) return '某人'
    try {
      if (e.group) {
        const member = await e.group.pickMember(userId)
        if (member) return member.info?.card || member.info?.nickname || `用户${userId}`
      }
      return `用户${userId}`
    } catch {
      return `用户${userId}`
    }
  }

  // 日常互动指令
  async hug (e) { return await this.sendInteraction(e, 'hug') }
  async kiss (e) { return await this.sendInteraction(e, 'kiss') }
  async holdHands (e) { return await this.sendInteraction(e, 'holdHands') }
  async patHead (e) { return await this.sendInteraction(e, 'patHead') }
  async dryHair (e) { return await this.sendInteraction(e, 'dryHair') }
  async feed (e) { return await this.sendInteraction(e, 'feed') }
  async cuddle (e) { return await this.sendInteraction(e, 'cuddle') }

  async sendInteraction (e, type) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    const interactions = {
      hug: { text: '紧紧抱住', love: 5, single: '自己抱自己，有点孤单呢~' },
      kiss: { text: '亲了一下', love: 8, single: '对着空气亲了一下...' },
      holdHands: { text: '十指相扣', love: 6, single: '左手牵右手，也很温暖~' },
      patHead: { text: '温柔地摸摸头', love: 4, single: '自己摸自己的头，有点奇怪...' },
      dryHair: { text: '细心地吹干头发', love: 7, single: '自己吹头发，要注意安全哦~' },
      feed: { text: '投喂美食', love: 5, single: '自己喂自己，好像没什么区别？' },
      cuddle: { text: '贴贴', love: 6, single: '和空气贴贴，有点寂寞呢~' }
    }

    const interaction = interactions[type]

    if (!user.s) {
      return await e.reply(`💔 ${interaction.single}`)
    }

    const uNick = await this.getUserNick(e, uid)
    const sNick = await this.getUserNick(e, user.s)

    user.love = (user.love || 0) + interaction.love
    await this.db.saveUser(uid, gid, user)

    return await e.reply(`💕 【${uNick}】${interaction.text}【${sNick}】\n好感度 +${interaction.love} ❤️`)
  }

  /** #情侣签到 */
  async dailyCheckin (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    const today = new Date().toDateString()
    const lastCheckin = await this.db.getDim(uid, gid, 'last_checkin', '')

    if (lastCheckin === today) {
      return await e.reply('✅ 今天已经签到过了，明天再来吧~')
    }

    const reward = Math.floor(Math.random() * 50) + 50
    user.money = (user.money || 1000) + reward

    await this.db.saveUser(uid, gid, user)
    await this.db.setDim(uid, gid, 'last_checkin', today)

    const msg = user.s 
      ? `📅 情侣签到成功！\n\n获得：${reward} 金币\n\n和 TA 一起开启美好的一天！`
      : `📅 签到成功！\n\n获得：${reward} 金币\n\n早日找到另一半一起签到吧~`

    return await e.reply(msg)
  }

  /** #送礼物 */
  async giveGift (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)
    const target = this.getTargetId(e)

    if (!target) {
      return await e.reply('🎁 请 @ 你想送礼物的对象')
    }

    const giftName = e.msg.replace(/^#?送礼物/, '').trim().split(/\s+/).slice(1).join(' ') || '神秘礼物'
    
    let backpack = await this.db.getDim(uid, gid, 'backpack', [])
    const giftIndex = backpack.findIndex(g => g.name === giftName)

    if (giftIndex === -1) {
      return await e.reply(`❌ 你的背包里没有"${giftName}"，先去商城购买吧！`)
    }

    const gift = backpack[giftIndex]
    backpack.splice(giftIndex, 1)
    await this.db.setDim(uid, gid, 'backpack', backpack)

    // 给目标添加礼物
    let targetBackpack = await this.db.getDim(target, gid, 'backpack', [])
    targetBackpack.push(gift)
    await this.db.setDim(target, gid, 'backpack', targetBackpack)

    const uNick = await this.getUserNick(e, uid)
    const tNick = await this.getUserNick(e, target)

    return await e.reply(`🎁 【${uNick}】送给【${tNick}】一份礼物：${giftName}\n\n礼物已放入对方背包！`)
  }

  /** #我的背包 */
  async backpack (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    
    const backpack = await this.db.getDim(uid, gid, 'backpack', [])
    
    if (backpack.length === 0) {
      return await e.reply('🎒 你的背包是空的，去商店买点什么吧！')
    }

    let msg = '🎒 我的背包\n\n'
    for (const item of backpack) {
      msg += `- ${item.name} x${item.count || 1}\n`
    }

    return await e.reply(msg)
  }

  /** #去约会 */
  async date (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    if (!user.s) {
      return await e.reply('💔 你目前还没有伴侣哦~')
    }

    const cost = 100
    if (user.money < cost) {
      return await e.reply(`💰 约会需要${cost}金币，你的钱不够了...`)
    }

    user.money -= cost
    user.love = (user.love || 0) + 20
    await this.db.saveUser(uid, gid, user)

    const places = ['海边漫步', '电影院', '游乐园', '咖啡厅', '公园野餐']
    const place = places[Math.floor(Math.random() * places.length)]

    const uNick = await this.getUserNick(e, uid)
    const sNick = await this.getUserNick(e, user.s)

    return await e.reply(`💕 约会时光\n\n【${uNick}】和【${sNick}】正在${place}...\n\n花费：${cost} 金币\n好感度 +20 ❤️\n\n真是美好的一天！`)
  }

  /** #亲密度 */
  async intimacyLevel (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    if (!user.s) {
      return await e.reply('💔 你目前还没有伴侣哦~')
    }

    const love = user.love || 0
    const levels = [
      { min: 0, title: '初识', icon: '🌱' },
      { min: 100, title: '朋友', icon: '🤝' },
      { min: 300, title: '暧昧', icon: '💕' },
      { min: 500, title: '恋人', icon: '💑' },
      { min: 1000, title: '热恋', icon: '🔥' },
      { min: 2000, title: '挚爱', icon: '💎' },
      { min: 5000, title: '灵魂伴侣', icon: '✨' }
    ]

    const currentLevel = levels.slice().reverse().find(l => love >= l.min) || levels[0]
    const nextLevel = levels.find(l => l.min > love)

    let msg = `💕 亲密等级\n\n当前：${currentLevel.icon} ${currentLevel.title}\n亲密度：${love}\n\n`
    
    if (nextLevel) {
      msg += `下一级：${nextLevel.icon} ${nextLevel.title}（还需 ${nextLevel.min - love} 亲密度）`
    } else {
      msg += '已达到最高等级！'
    }

    return await e.reply(msg)
  }

  /** #写信 */
  async writeLetter (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)
    const target = this.getTargetId(e)

    if (!target) {
      return await e.reply('✉️ 请 @ 你想写信的对象')
    }

    const content = e.msg.replace(/^#?写信/, '').trim().split(/\s+/).slice(1).join(' ')
    if (!content) {
      return await e.reply('✉️ 用法：#写信 @某人 [内容]')
    }

    let inbox = await this.db.getDim(target, gid, 'inbox', [])
    inbox.push({
      from: uid,
      content,
      time: Date.now(),
      read: false
    })

    if (inbox.length > 50) {
      inbox = inbox.slice(-50)
    }

    await this.db.setDim(target, gid, 'inbox', inbox)

    const uNick = await this.getUserNick(e, uid)
    const tNick = await this.getUserNick(e, target)

    return await e.reply(`✉️ 信件已寄出！\n\n收件人：【${tNick}】\n\nTA 发送 #读信 就能看到了~`)
  }

  /** #读信 */
  async readLetter (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    
    const inbox = await this.db.getDim(uid, gid, 'inbox', [])
    
    if (inbox.length === 0) {
      return await e.reply('📭 你的信箱是空的，还没有人给你写信呢~')
    }

    const unread = inbox.filter(l => !l.read)
    if (unread.length === 0) {
      return await e.reply('📭 所有信件都已读完了~')
    }

    const letter = unread[0]
    letter.read = true
    await this.db.setDim(uid, gid, 'inbox', inbox)

    const fromNick = await this.getUserNick(e, letter.from)

    return await e.reply(`✉️ 收到一封信\n\n来自：${fromNick}\n时间：${new Date(letter.time).toLocaleString('zh-CN')}\n\n内容：\n${letter.content}`)
  }

  // 占位符方法 - 其他复杂功能待实现
  async coupleTask (e) { return await e.reply('📋 情侣共同任务功能开发中...') }
  async timeCapsule (e) { return await e.reply('⏳ 时光胶囊功能开发中...') }
  async wishList (e) { return await e.reply('💫 心愿单功能开发中...') }
  async fulfillWish (e) { return await e.reply('✨ 实现心愿功能开发中...') }
  async loveTree (e) { return await e.reply('🌳 爱情树功能开发中...') }
  async compatibilityQuiz (e) { return await e.reply('🧩 默契问答功能开发中...') }
  async answerQuiz (e) { return await e.reply('🧩 请先发起默契问答~') }
  async loveBlindBox (e) { return await e.reply('🎁 恋爱盲盒功能开发中...') }
  async matchmaker (e) { return await e.reply('👴 AI 月老功能开发中...') }
  async mediation (e) { return await e.reply('💬 情感调解功能开发中...') }
  async loveAdvisor (e) { return await e.reply('💡 恋爱军师功能开发中...') }
}
