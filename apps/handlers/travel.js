/**
 * 旅行系统处理器
 */
export class TravelHandler {
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

  /** #旅行胜地 */
  async destinations (e) {
    const destinations = [
      { id: 1, name: '大理洱海', cost: 500, desc: '苍山洱海，风花雪月' },
      { id: 2, name: '三亚海棠湾', cost: 800, desc: '椰林海滩，热带风情' },
      { id: 3, name: '京都岚山', cost: 1000, desc: '樱花枫叶，古韵悠然' },
      { id: 4, name: '冰岛极光', cost: 2000, desc: '梦幻极光，世界尽头' },
      { id: 5, name: '巴黎塞纳河', cost: 1500, desc: '浪漫之都，铁塔夜景' },
      { id: 6, name: '重庆山城', cost: 400, desc: '火锅美女，魔幻 8D' }
    ]

    let msg = '✈️ 旅行胜地\n\n'
    for (const dest of destinations) {
      msg += `${dest.id}. ${dest.name} - ${desc}\n   ${dest.desc}\n   费用：${dest.cost} 金币\n\n`
    }

    return await e.reply(msg + '使用 #双人旅行 [目的地] 开启浪漫之旅~')
  }

  /** #双人旅行 */
  async coupleTravel (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    if (!user.s) {
      return await e.reply('💔 你目前还没有伴侣哦~')
    }

    const destName = e.msg.replace(/^#?双人旅行/, '').trim()
    if (!destName) {
      return await e.reply('✈️ 用法：#双人旅行 [目的地]\n例如：#双人旅行 大理洱海')
    }

    const destinations = [
      { name: '大理洱海', cost: 500 },
      { name: '三亚海棠湾', cost: 800 },
      { name: '京都岚山', cost: 1000 },
      { name: '冰岛极光', cost: 2000 },
      { name: '巴黎塞纳河', cost: 1500 },
      { name: '重庆山城', cost: 400 }
    ]

    const dest = destinations.find(d => d.name.includes(destName))
    if (!dest) {
      return await e.reply('❌ 未找到该目的地，请使用 #旅行胜地 查看可用目的地')
    }

    if (user.money < dest.cost) {
      return await e.reply(`💰 金币不足，前往${dest.name}需要${dest.cost}金币`)
    }

    user.money -= dest.cost
    
    // 记录旅行足迹
    let footprints = await this.db.getDim(uid, gid, 'footprints', [])
    if (!footprints.find(f => f.name === dest.name)) {
      footprints.push({ name: dest.name, time: Date.now() })
      await this.db.setDim(uid, gid, 'footprints', footprints)
    }

    await this.db.saveUser(uid, gid, user)

    const uNick = await this.getUserNick(e, uid)
    const sNick = await this.getUserNick(e, user.s)

    const events = [
      '一路上风景如画，你们拍了很多照片',
      '品尝了当地特色美食，味道棒极了',
      '遇到了热情的当地人，给你们介绍了很多好玩的地方',
      '在最美的地方留下了甜蜜的合影'
    ]

    const event = events[Math.floor(Math.random() * events.length)]

    return await e.reply(`✈️ 双人旅行\n\n【${uNick}】和【${sNick}】前往${dest.name}...\n\n花费：${dest.cost} 金币\n\n${event}\n\n旅行足迹 +1！`)
  }

  /** #旅行足迹 */
  async footprints (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    
    const footprints = await this.db.getDim(uid, gid, 'footprints', [])
    
    if (footprints.length === 0) {
      return await e.reply('🗺️ 你们还没有去过任何地方旅行呢~')
    }

    let msg = '🗺️ 旅行足迹\n\n去过的地方：\n'
    for (const fp of footprints) {
      msg += `- ${fp.name} (${new Date(fp.time).toLocaleDateString('zh-CN')})\n`
    }

    msg += `\n共到访 ${footprints.length} 个地方`
    return await e.reply(msg)
  }
}
