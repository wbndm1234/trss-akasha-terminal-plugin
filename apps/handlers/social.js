/**
 * 社交系统处理器
 */
export class SocialHandler {
  constructor (db, renderer) {
    this.db = db
    this.renderer = renderer
  }

  getUserId (e) { return e.user_id?.toString() || e.sender?.user_id?.toString() || '' }
  getGroupId (e) { return e.group_id?.toString() || '' }

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

  /** #情侣决斗 */
  async coupleDuel (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)
    const target = this.getTargetId(e)

    if (!user.s) {
      return await e.reply('💔 你目前还没有伴侣，无法参加情侣决斗哦~')
    }

    if (!target) {
      return await e.reply('⚔️ 请 @ 你想挑战的情侣')
    }

    const targetUser = await this.db.getUser(target, gid)
    if (!targetUser.s) {
      return await e.reply('❌ 对方还没有伴侣，无法参加情侣决斗')
    }

    // 简单随机对决
    const myScore = Math.floor(Math.random() * 100) + user.love
    const theirScore = Math.floor(Math.random() * 100) + targetUser.love

    const uNick = await this.getUserNick(e, uid)
    const sNick = await this.getUserNick(e, user.s)
    const tNick = await this.getUserNick(e, target)
    const tsNick = await this.getUserNick(e, targetUser.s)

    let msg = `⚔️ 情侣决斗\n\n【${uNick}】&【${sNick}】VS【${tNick}】&【${tsNick}】\n\n`
    
    if (myScore > theirScore) {
      msg += `结果：你们赢了！\n我方战力：${myScore}\n对方战力：${theirScore}\n\n奖励：好感度 +10`
      user.love = (user.love || 0) + 10
      await this.db.saveUser(uid, gid, user)
    } else if (myScore < theirScore) {
      msg += `结果：你们输了...\n我方战力：${myScore}\n对方战力：${theirScore}\n\n下次加油！`
    } else {
      msg += `结果：平局！\n双方战力：${myScore}\n\n真是势均力敌呢~`
    }

    return await e.reply(msg)
  }

  /** #最甜情侣榜 */
  async sweetCoupleRanking (e) {
    const gid = this.getGroupId(e)
    const couples = await this.db.getAllCouples(gid)

    if (couples.length === 0) {
      return await e.reply('💔 群里还没有情侣呢~')
    }

    // 按好感度排序
    couples.sort((a, b) => (b.love || 0) - (a.love || 0))
    const top10 = couples.slice(0, 10)

    let msg = '🏆 最甜情侣榜\n\n'
    
    for (let i = 0; i < top10.length; i++) {
      const couple = top10[i]
      const rank = i + 1
      const icon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`
      
      const nick1 = await this.getUserNick(e, couple.uid1)
      const nick2 = await this.getUserNick(e, couple.uid2)
      
      msg += `${icon} 【${nick1}】&【${nick2}】 - 好感度 ${couple.love || 0}\n`
    }

    return await e.reply(msg)
  }

  /** #群 CP 名录 */
  async groupCouples (e) {
    const gid = this.getGroupId(e)
    const couples = await this.db.getAllCouples(gid)

    if (couples.length === 0) {
      return await e.reply('💔 群里还没有情侣呢~')
    }

    let msg = `💑 群 CP 名录（共${couples.length}对）\n\n`
    
    for (const couple of couples) {
      const nick1 = await this.getUserNick(e, couple.uid1)
      const nick2 = await this.getUserNick(e, couple.uid2)
      const days = Math.floor((Date.now() - couple.marriage_time) / (1000 * 60 * 60 * 24))
      
      msg += `💕 【${nick1}】&【${nick2}】 - 相恋${days}天\n`
    }

    return await e.reply(msg)
  }

  // 占位符方法
  async coupleTrip (e) { return await e.reply('🚗 情侣出游功能开发中...') }
  async coupleAssets (e) { return await e.reply('💰 情侣资产报告功能开发中...') }
  async loveStory (e) { return await e.reply('📖 恋爱小作文功能开发中...') }
  async statsOverview (e) { return await e.reply('📊 恋爱大盘功能开发中...') }
  async achievements (e) { return await e.reply('🏅 成就系统功能开发中...') }
  async equipTitle (e) { return await e.reply('🎖️ 佩戴称号功能开发中...') }
  async unequipTitle (e) { return await e.reply('🎖️ 卸下称号功能开发中...') }
}
