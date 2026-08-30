import { gamedata } from '../utils/gamedata.js'

/**
 * 婚恋关系处理器
 */
export class RelationHandler {
  constructor (db, renderer) {
    this.db = db
    this.renderer = renderer
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
   * 获取目标用户 ID
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
      if (e.group) {
        const member = await e.group.pickMember(userId)
        if (member) return member.info?.card || member.info?.nickname || `用户${userId}`
      }
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
   * 获取性格数据
   */
  getPersonality (uid, spouseId) {
    const personalities = gamedata.load('personality', [])
    if (!personalities || personalities.length === 0) {
      return { name: '温柔', tone: '温柔体贴', dialogues: {} }
    }
    const seed = (hashString(String(uid)) + hashString(String(spouseId))) % personalities.length
    return personalities[seed] || { name: '温柔', tone: '温柔体贴', dialogues: {} }
  }

  /**
   * 字符串哈希
   */
  hashString (str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash)
  }

  /**
   * #娶群友 / #强娶
   */
  async wife (e, isForce = false) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)

    if (!gid) {
      return await e.reply('❌ 该功能仅支持在群聊中使用')
    }

    const user = await this.db.getUser(uid, gid)

    // 检查是否已有伴侣
    if (user.s) {
      const spouseNick = await this.getUserNick(e, user.s)
      return await e.reply(`💍 你已经和【${spouseNick}】在一起了，请一心一意相伴一生哦~`)
    }

    // 获取目标
    let target = this.getTargetId(e)
    if (isForce && !target) {
      return await e.reply('❌ 请 @ 你想追求的对象')
    }

    // 冷却检查
    const cdKey = `wife:${gid}:${uid}`
    const cdSeconds = isForce ? 3600 : 1800
    const remaining = await this.db.checkCooldown(cdKey)
    if (remaining > 0) {
      return await e.reply(`⏳ 心动冷却中，请在 ${remaining} 秒后再试~`)
    }

    // 金币检查
    const cost = isForce ? 200 : 100
    if (user.money < cost) {
      return await e.reply(`💰 彩礼储备不足，至少需要 ${cost} 金币才能开启追求~`)
    }

    // 如果是强娶，检查目标状态
    if (isForce) {
      const targetUser = await this.db.getUser(target, gid)
      if (targetUser.s) {
        const targetSpouseNick = await this.getUserNick(e, targetUser.s)
        return await e.reply(`💔 对方已经和【${targetSpouseNick}】结缘了哦~`)
      }

      // 成功结缘
      const now = Date.now()
      user.money -= cost
      user.s = target
      user.marriage_time = now
      await this.db.saveUser(uid, gid, user)

      targetUser.s = uid
      targetUser.marriage_time = now
      await this.db.saveUser(target, gid, targetUser)

      await this.db.setCooldown(cdKey, cdSeconds)

      const uNick = await this.getUserNick(e, uid)
      const tNick = await this.getUserNick(e, target)
      const pers = this.getPersonality(target, uid)

      const msg = `💕 执子之手，与子偕老！\n\n【${uNick}】与【${tNick}】正式喜结良缘！\n\n彩礼：${cost} 金币\n性格：${pers.name}\n\n愿你们相守一生，白头偕老！`
      return await e.reply(msg)
    }

    // 随机追求
    const allUsers = await this.db.getAllUsers(gid)
    const availableUsers = allUsers.filter(u => !u.s && u.uid !== uid)

    if (availableUsers.length === 0) {
      return await e.reply('😢 群里没有其他单身群友可以追求了~')
    }

    const randomIndex = Math.floor(Math.random() * availableUsers.length)
    target = availableUsers[randomIndex].uid

    // 结缘
    const now = Date.now()
    user.money -= cost
    user.s = target
    user.marriage_time = now
    await this.db.saveUser(uid, gid, user)

    const targetUser = await this.db.getUser(target, gid)
    targetUser.s = uid
    targetUser.marriage_time = now
    await this.db.saveUser(target, gid, targetUser)

    await this.db.setCooldown(cdKey, cdSeconds)

    const uNick = await this.getUserNick(e, uid)
    const tNick = await this.getUserNick(e, target)

    const msg = `💕 千万人之中遇见你！\n\n【${uNick}】与【${tNick}】正式开启浪漫同居生活！\n\n这是命中注定的缘分，愿你们珍惜彼此，相伴一生！`
    return await e.reply(msg)
  }

  /**
   * #表白
   */
  async confession (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const target = this.getTargetId(e)

    if (!target) {
      return await e.reply('💌 请 @ 你想深情表白的对象')
    }

    const user = await this.db.getUser(uid, gid)
    if (user.s) {
      return await e.reply('💍 你已经有相濡以沫的伴侣了，请一心一意哦~')
    }

    const targetUser = await this.db.getUser(target, gid)
    if (targetUser.s) {
      return await e.reply('💔 对方已经名花有主了哦~')
    }

    // 设置等待状态
    user.wait = target
    await this.db.saveUser(uid, gid, user)

    const uNick = await this.getUserNick(e, uid)
    const tNick = await this.getUserNick(e, target)

    const msg = `💌 【${uNick}】脸颊微红，轻轻拉住【${tNick}】的衣角：\n\n"我想和你在一起，往后余生，柴米油盐都是你。"\n\n👉 请对方发送【#我愿意】或【#对不起】做出回应~`
    return await e.reply(msg)
  }

  /**
   * #我愿意 / #对不起
   */
  async respond (e, accept = true) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)

    // 查找是谁在向我告白
    const target = this.getTargetId(e)
    if (!target) {
      return await e.reply('❌ 请 @ 表白/求婚的发起者做出回应')
    }

    const senderUser = await this.db.getUser(target, gid)
    if (senderUser.wait !== uid) {
      return await e.reply('❌ 当前对方并没有在等待你的回应哦')
    }

    const user = await this.db.getUser(uid, gid)
    const uNick = await this.getUserNick(e, uid)
    const sNick = await this.getUserNick(e, target)

    if (!accept) {
      // 拒绝
      senderUser.wait = ''
      await this.db.saveUser(target, gid, senderUser)
      return await e.reply(`💔 【${uNick}】温柔地婉拒了【${sNick}】的深情告白。`)
    }

    // 接受
    const now = Date.now()
    senderUser.wait = ''
    senderUser.s = uid
    senderUser.marriage_time = now
    await this.db.saveUser(target, gid, senderUser)

    user.s = target
    user.marriage_time = now
    await this.db.saveUser(uid, gid, user)

    const msg = `💕 "我愿意！"\n\n【${uNick}】满眼欢喜地答应了【${sNick}】！两人正式确立恋爱关系！\n\n愿你们的爱情甜蜜长久！`
    return await e.reply(msg)
  }

  /**
   * #分手
   */
  async breakup (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    const spouseId = user.s
    if (!spouseId) {
      return await e.reply('💔 你当前还是单身，无需办理分手手续哦~')
    }

    const now = Date.now()
    user.s = ''
    user.breakup_time = now
    await this.db.saveUser(uid, gid, user)

    const spouseUser = await this.db.getUser(spouseId, gid)
    spouseUser.s = ''
    spouseUser.breakup_time = now
    await this.db.saveUser(spouseId, gid, spouseUser)

    const uNick = await this.getUserNick(e, uid)
    const sNick = await this.getUserNick(e, spouseId)

    const msg = `🍂 一别两宽，各生欢喜。\n\n【${uNick}】与【${sNick}】结束了情侣关系，进入冷静期。\n\n24 小时内可以发送【#复合】挽回这段感情。`
    return await e.reply(msg)
  }

  /**
   * #结婚证
   */
  async marriageCert (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    if (!user.s) {
      return await e.reply('💔 你目前还没有伴侣，无法查看结婚证哦~')
    }

    const spouseUser = await this.db.getUser(user.s, gid)
    const daysTogether = Math.floor((Date.now() - user.marriage_time) / (1000 * 60 * 60 * 24))

    const uNick = await this.getUserNick(e, uid)
    const sNick = await this.getUserNick(e, user.s)

    const msg = `💒 结婚证 💒\n\n新郎：${sNick}\n新娘：${uNick}\n\n领证时间：${new Date(user.marriage_time).toLocaleDateString('zh-CN')}\n结婚天数：${daysTogether} 天\n\n"执子之手，与子偕老"`
    return await e.reply(msg)
  }

  /**
   * #家庭信息
   */
  async familyInfo (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    if (!user.s) {
      return await e.reply('💔 你目前还没有伴侣哦~')
    }

    const daysTogether = Math.floor((Date.now() - user.marriage_time) / (1000 * 60 * 60 * 24))
    const uNick = await this.getUserNick(e, uid)
    const sNick = await this.getUserNick(e, user.s)

    const msg = `🏡 我们的小家 🏡\n\n伴侣：${sNick}\n恋爱天数：${daysTogether} 天\n好感度：${user.love}\n共同金币：${user.money}\n\n专属爱称：${user.nicknames?.my_to_spouse || '未设置'} / ${user.nicknames?.spouse_to_me || '未设置'}\n\n让我们一起经营这个温馨的小家吧！`
    return await e.reply(msg)
  }

  /**
   * #恋爱纪念日
   */
  async anniversary (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    if (!user.s) {
      return await e.reply('💔 你目前还没有伴侣哦~')
    }

    const now = Date.now()
    const daysTogether = Math.floor((now - user.marriage_time) / (1000 * 60 * 60 * 24))
    const hoursTogether = Math.floor((now - user.marriage_time) / (1000 * 60 * 60))
    const minutesTogether = Math.floor((now - user.marriage_time) / (1000 * 60))

    const milestones = [
      { days: 1, label: '相识第一天' },
      { days: 7, label: '一周纪念' },
      { days: 30, label: '满月纪念' },
      { days: 100, label: '百日纪念' },
      { days: 365, label: '一周年' },
      { days: 520, label: '520 天纪念' },
      { days: 730, label: '两周年' },
      { days: 1000, label: '千日纪念' }
    ]

    const nextMilestone = milestones.find(m => m.days > daysTogether)
    const lastMilestone = milestones.slice().reverse().find(m => m.days <= daysTogether)

    const uNick = await this.getUserNick(e, uid)
    const sNick = await this.getUserNick(e, user.s)

    let msg = `💕 恋爱纪念日 💕\n\n我们已经在一起：\n${daysTogether} 天 ${hoursTogether % 24} 小时 ${minutesTogether % 60} 分钟\n\n`

    if (lastMilestone) {
      msg += `✨ 已达成：${lastMilestone.label}\n`
    }

    if (nextMilestone) {
      msg += `🎯 下一个里程碑：${nextMilestone.label}（还有 ${nextMilestone.days - daysTogether} 天）\n`
    }

    msg += `\n感谢有你的每一天，${uNick} 爱 ${sNick}！`
    return await e.reply(msg)
  }
}
