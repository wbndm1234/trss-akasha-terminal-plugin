/**
 * 经济系统处理器 - 完整功能版
 */
export class EconomyHandler {
  constructor (db, plugin) {
    this.db = db
    this.plugin = plugin
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

  /** #搞钱养家 */
  async work (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    // 冷却检查
    const cdKey = `work:${gid}:${uid}`
    const remaining = await this.db.checkCooldown(cdKey)
    if (remaining > 0) {
      return await e.reply(`⏰ 还在打工冷却中，请 ${remaining} 秒后再来~`)
    }

    const reward = Math.floor(Math.random() * 100) + 50
    user.money = (user.money || 1000) + reward
    await this.db.saveUser(uid, gid, user)
    await this.db.setCooldown(cdKey, 3600)

    const jobs = ['努力上班', '送外卖', '发传单', '做兼职', '搬砖']
    const job = jobs[Math.floor(Math.random() * jobs.length)]

    return await e.reply(`💼 ${job}\n\n获得：${reward} 金币\n当前金币：${user.money}\n\n继续加油养家吧！`)
  }

  /** #领取低保 */
  async claimBasicIncome (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    if (user.money >= 500) {
      return await e.reply('💰 你的金币还够花，不需要领取低保哦~')
    }

    const basic = 500
    user.money = basic
    await this.db.saveUser(uid, gid, user)

    return await e.reply(`🎁 领取低保成功！\n\n获得：${basic} 金币\n当前金币：${user.money}\n\n加油生活吧！`)
  }

  /** #存入小金库 */
  async depositLoveFund (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    const match = e.msg.match(/\d+/)
    if (!match) {
      return await e.reply('💳 用法：#存入小金库 [金额]')
    }

    const amount = parseInt(match[0])
    if (amount <= 0) {
      return await e.reply('❌ 请输入有效的金额')
    }

    if (user.money < amount) {
      return await e.reply('💰 金币不足')
    }

    user.money -= amount
    let loveFund = await this.db.getDim(uid, gid, 'love_fund', 0)
    loveFund += amount

    await this.db.saveUser(uid, gid, user)
    await this.db.setDim(uid, gid, 'love_fund', loveFund)

    return await e.reply(`💳 存入成功！\n\n存入：${amount} 金币\n小金库余额：${loveFund} 金币\n\n每日可获得利息哦~`)
  }

  /** #小金库取钱 */
  async withdrawLoveFund (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    const match = e.msg.match(/\d+/)
    if (!match) {
      return await e.reply('💳 用法：#小金库取钱 [金额]')
    }

    const amount = parseInt(match[0])
    if (amount <= 0) {
      return await e.reply('❌ 请输入有效的金额')
    }

    let loveFund = await this.db.getDim(uid, gid, 'love_fund', 0)
    if (loveFund < amount) {
      return await e.reply('💰 小金库余额不足')
    }

    loveFund -= amount
    user.money = (user.money || 0) + amount

    await this.db.saveUser(uid, gid, user)
    await this.db.setDim(uid, gid, 'love_fund', loveFund)

    return await e.reply(`💳 取款成功！\n\n取出：${amount} 金币\n小金库余额：${loveFund} 金币\n当前金币：${user.money}`)
  }

  // ========== 完整经济功能实现 ==========

  /** #开店管理 */
  async shopManage (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    let shop = await this.db.getDim(uid, gid, 'shop', null)

    if (!shop) {
      // 创建店铺
      const cost = 5000
      if (user.money < cost) {
        return await e.reply(`🏪 开店需要${cost}金币，你的钱不够了...`)
      }

      user.money -= cost
      shop = {
        name: `${user.nicknames.spouse_to_me || '情侣'}的小店`,
        level: 1,
        income: 0,
        lastIncome: 0,
        upgradeCost: 10000
      }

      await this.db.saveUser(uid, gid, user)
      await this.db.setDim(uid, gid, 'shop', shop)

      return await e.reply(`🏪 店铺开业啦！\n\n店铺名称：${shop.name}\n等级：Lv.1\n每小时收益：100 金币\n\n使用 #升级店铺 可提升收益~`)
    }

    // 领取收益
    const now = Date.now()
    const hoursPassed = Math.floor((now - shop.lastIncome) / (1000 * 60 * 60))
    
    if (hoursPassed >= 1) {
      const income = hoursPassed * 100 * shop.level
      shop.income += income
      shop.lastIncome = now
      
      user.money += income
      await this.db.saveUser(uid, gid, user)
      await this.db.setDim(uid, gid, 'shop', shop)

      return await e.reply(`🏪 店铺收益\n\n过去${hoursPassed}小时收益：${income}金币\n累计收益：${shop.income}金币\n当前金币：${user.money}`)
    }

    return await e.reply(`🏪 店铺运营中...\n\n等级：Lv.${shop.level}\n累计收益：${shop.income}金币\n下次收益时间：${new Date(shop.lastIncome + 3600000).toLocaleTimeString()}`)
  }

  /** #买房 */
  async buyHouse (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    if (!user.s) {
      return await e.reply('💔 你目前还没有伴侣哦~')
    }

    let house = await this.db.getDim(uid, gid, 'house', null)
    if (house) {
      return await e.reply(`🏠 你们已经拥有爱巢了:\n\n房型：${house.name}\n价值：${house.price}金币\n好感加成：${house.bonus}%`)
    }

    const houses = [
      { id: 1, name: '温馨小屋', price: 10000, bonus: 10 },
      { id: 2, name: '精致公寓', price: 30000, bonus: 20 },
      { id: 3, name: '花园洋房', price: 80000, bonus: 35 },
      { id: 4, name: '豪华别墅', price: 200000, bonus: 50 },
      { id: 5, name: '庄园城堡', price: 500000, bonus: 80 }
    ]

    const match = e.msg.match(/\d+/)
    const houseId = match ? parseInt(match[0]) : 1
    const house = houses.find(h => h.id === houseId)

    if (!house) {
      let msg = '🏠 可选房产:\n\n'
      for (const h of houses) {
        msg += `${h.id}. ${h.name} - ${h.price}金币 (好感加成${hbonus}%)\n`
      }
      return await e.reply(msg + '\n使用 #买房 [ID] 购买心仪的婚房~')
    }

    if (user.money < house.price) {
      return await e.reply(`💰 金币不足，购买${house.name}需要${house.price}金币`)
    }

    user.money -= house.price
    await this.db.saveUser(uid, gid, user)
    await this.db.setDim(uid, gid, 'house', { ...house, buyTime: Date.now() })

    const uNick = await this.getUserNick(e, uid)
    const sNick = await this.getUserNick(e, user.s)

    return await e.reply(`🏠 购房成功！\n\n【${uNick}】和【${sNick}】拥有了${house.name}\n\n价值：${house.price}金币\n好感度加成：${house.bonus}%\n\n从此有了温馨的爱巢~`)
  }

  /** #购买家具 */
  async buyFurniture (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    let furniture = await this.db.getDim(uid, gid, 'furniture', [])

    const furnitures = [
      { id: 1, name: '双人床', price: 2000, bonus: 5 },
      { id: 2, name: '舒适沙发', price: 1500, bonus: 3 },
      { id: 3, name: '智能电视', price: 3000, bonus: 4 },
      { id: 4, name: '餐桌椅', price: 1800, bonus: 3 },
      { id: 5, name: '书桌椅', price: 1200, bonus: 2 },
      { id: 6, name: '衣柜', price: 2500, bonus: 3 },
      { id: 7, name: '地毯', price: 800, bonus: 2 },
      { id: 8, name: '装饰画', price: 500, bonus: 1 }
    ]

    const match = e.msg.match(/\d+/)
    const furnId = match ? parseInt(match[0]) : null

    if (!furnId) {
      let msg = '🛋️ 家具商城:\n\n'
      for (const f of furnitures) {
        const owned = furniture.some(item => item.id === f.id)
        msg += `${f.id}. ${f.name} - ${f.price}金币 (好感加成${f.bonus}%)${owned ? ' [已拥有]' : ''}\n`
      }
      return await e.reply(msg + '\n使用 #购买家具 [ID] 布置爱巢~')
    }

    const furn = furnitures.find(f => f.id === furnId)
    if (!furn) {
      return await e.reply('❌ 未找到该家具')
    }

    if (furniture.some(item => item.id === furnId)) {
      return await e.reply('❌ 你已经拥有这件家具了')
    }

    if (user.money < furn.price) {
      return await e.reply(`💰 金币不足，购买${furn.name}需要${furn.price}金币`)
    }

    user.money -= furn.price
    furniture.push({ ...furn, buyTime: Date.now() })
    
    await this.db.saveUser(uid, gid, user)
    await this.db.setDim(uid, gid, 'furniture', furniture)

    return await e.reply(`🛋️ 购买成功！\n\n购入：${furn.name}\n花费：${furn.price}金币\n剩余：${user.money}金币\n\n家具已布置到爱巢~`)
  }

  /** #共同账户 */
  async jointAccount (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    if (!user.s) {
      return await e.reply('💔 你目前还没有伴侣哦~')
    }

    const msg = e.msg.replace(/^#?(开共同账户 | 共同存款 | 共同取款)/, '').trim()
    const match = msg.match(/\d+/)
    const amount = match ? parseInt(match[0]) : null

    let jointFund = await this.db.getDim(uid, gid, 'joint_fund', 0)

    if (!amount && e.msg.includes('开共同账户')) {
      if (jointFund > 0) {
        return await e.reply(`💑 共同账户已开启\n\n余额：${jointFund}金币\n每日利息：${Math.floor(jointFund * 0.03)}金币`)
      }
      return await e.reply('💑 共同账户使用说明:\n\n#共同存款 [金额] - 存入资金（每日 3% 利息）\n#共同取款 [金额] - 取出资金')
    }

    if (e.msg.includes('存款')) {
      if (!amount || amount <= 0) {
        return await e.reply('💳 用法：#共同存款 [金额]')
      }
      if (user.money < amount) {
        return await e.reply('💰 金币不足')
      }

      user.money -= amount
      jointFund += amount
      
      await this.db.saveUser(uid, gid, user)
      await this.db.setDim(uid, gid, 'joint_fund', jointFund)

      return await e.reply(`💑 存款成功！\n\n存入：${amount}金币\n共同账户余额：${jointFund}金币\n每日利息：${Math.floor(jointFund * 0.03)}金币`)
    }

    if (e.msg.includes('取款')) {
      if (!amount || amount <= 0) {
        return await e.reply('💳 用法：#共同取款 [金额]')
      }
      if (jointFund < amount) {
        return await e.reply('💰 共同账户余额不足')
      }

      jointFund -= amount
      user.money += amount
      
      await this.db.saveUser(uid, gid, user)
      await this.db.setDim(uid, gid, 'joint_fund', jointFund)

      return await e.reply(`💑 取款成功！\n\n取出：${amount}金币\n共同账户余额：${jointFund}金币\n当前金币：${user.money}`)
    }

    return await e.reply(`💑 共同账户\n\n余额：${jointFund}金币\n今日利息：${Math.floor(jointFund * 0.03)}金币\n\n使用 #共同存款/#共同取款 操作资金`)
  }

  /** #上交工资卡 */
  async submitSalary (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)
    const target = this.getTargetId(e)

    if (!user.s) {
      return await e.reply('💔 你目前还没有伴侣哦~')
    }

    const match = e.msg.match(/\d+/)
    const amount = match ? parseInt(match[0]) : null

    if (!amount || amount <= 0) {
      return await e.reply('💰 用法：#上交工资卡 [金额]\n或者 @ 伴侣并上交全部工资')
    }

    if (user.money < amount) {
      return await e.reply('💰 你的金币不足')
    }

    // 转给伴侣
    const spouseGid = gid // 同群处理
    const spouseData = await this.db.getUser(user.s, spouseGid)
    
    user.money -= amount
    spouseData.money = (spouseData.money || 0) + amount

    await this.db.saveUser(uid, gid, user)
    await this.db.saveUser(user.s, spouseGid, spouseData)

    const uNick = await this.getUserNick(e, uid)
    const sNick = await this.getUserNick(e, user.s)

    return await e.reply(`💰 工资卡上交！\n\n【${uNick}】上交了${amount}金币给【${sNick}】\n\n真是顾家的好伴侣呢~`)
  }

  /** #去逛街 */
  async shopping (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    if (!user.s) {
      return await e.reply('💔 你目前还没有伴侣哦~')
    }

    // 冷却检查
    const cdKey = `shopping:${gid}:${uid}`
    const remaining = await this.db.checkCooldown(cdKey)
    if (remaining > 0) {
      return await e.reply(`⏰ 还在逛街冷却中，请${remaining}秒后再来~`)
    }

    const cost = 200
    if (user.money < cost) {
      return await e.reply(`💰 逛街需要${cost}金币，你的钱不够了...`)
    }

    user.money -= cost
    
    // 随机获得物品
    const items = [
      { name: '奶茶', type: 'drink', value: 50 },
      { name: '玫瑰', type: 'gift', value: 100 },
      { name: '巧克力', type: 'food', value: 80 },
      { name: '围巾', type: 'clothes', value: 150 },
      { name: '香水', type: 'gift', value: 200 }
    ]

    const getItem = items[Math.floor(Math.random() * items.length)]
    
    let backpack = await this.db.getDim(uid, gid, 'backpack', [])
    const existing = backpack.find(i => i.name === getItem.name)
    if (existing) {
      existing.count = (existing.count || 1) + 1
    } else {
      backpack.push({ ...getItem, count: 1 })
    }

    await this.db.saveUser(uid, gid, user)
    await this.db.setDim(uid, gid, 'backpack', backpack)
    await this.db.setCooldown(cdKey, 2700)

    const uNick = await this.getUserNick(e, uid)
    const sNick = await this.getUserNick(e, user.s)

    return await e.reply(`🛍️ 逛街时光\n\n【${uNick}】和【${sNick}】在商圈度过了愉快的时光~\n\n花费：${cost}金币\n获得：${getItem.name} x1\n\n物品已放入背包~`)
  }
}
