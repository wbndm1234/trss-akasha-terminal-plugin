/**
 * 生活系统处理器
 */
export class LifeHandler {
  constructor (db, renderer) {
    this.db = db
    this.renderer = renderer
  }

  getUserId (e) {
    return e.user_id?.toString() || e.sender?.user_id?.toString() || ''
  }

  getGroupId (e) {
    return e.group_id?.toString() || ''
  }

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

  /**
   * #写恋爱日记
   */
  async writeDiary (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    if (!user.s) {
      return await e.reply('💔 你目前还没有伴侣，无法写恋爱日记哦~')
    }

    const content = e.msg.replace(/^#?写恋爱日记/, '').trim()
    if (!content) {
      return await e.reply('📝 请在指令后写下你想记录的内容，例如：\n#写恋爱日记 今天我们一起看了夕阳，好浪漫')
    }

    // 获取日记列表
    const diaryKey = `akasha:diary:${gid}:${uid}`
    let diaries = await this.db.getDim(uid, gid, 'diaries', [])
    
    diaries.push({
      date: Date.now(),
      content,
      weather: ['☀️', '⛅', '☁️', '🌧️', '❄️'][Math.floor(Math.random() * 5)],
      mood: ['😊', '😍', '💕', '✨', '🌟'][Math.floor(Math.random() * 5)]
    })

    // 只保留最近 100 条
    if (diaries.length > 100) {
      diaries = diaries.slice(-100)
    }

    await this.db.setDim(uid, gid, 'diaries', diaries)

    return await e.reply(`📖 恋爱日记已记录\n\n${content}\n\n愿你们的美好回忆永远珍藏！`)
  }

  /**
   * #恋爱日记
   */
  async readDiary (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    if (!user.s) {
      return await e.reply('💔 你目前还没有伴侣哦~')
    }

    const diaries = await this.db.getDim(uid, gid, 'diaries', [])
    
    if (diaries.length === 0) {
      return await e.reply('📖 你们的恋爱日记还是空白的，快用 #写恋爱日记 记录美好时光吧！')
    }

    const recent = diaries.slice(-5)
    let msg = '📖 恋爱日记（最近 5 篇）\n\n'
    
    for (const diary of recent) {
      const date = new Date(diary.date).toLocaleDateString('zh-CN')
      msg += `${date} ${diary.weather} ${diary.mood}\n${diary.content}\n\n`
    }

    msg += `共记录了 ${diaries.length} 篇日记`
    return await e.reply(msg)
  }

  /**
   * #恋爱回忆录
   */
  async memoryBook (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    if (!user.s) {
      return await e.reply('💔 你目前还没有伴侣哦~')
    }

    const daysTogether = Math.floor((Date.now() - user.marriage_time) / (1000 * 60 * 60 * 24))
    const uNick = await this.getUserNick(e, uid)
    const sNick = await this.getUserNick(e, user.s)

    const msg = `📜 恋爱回忆录 📜\n\n【${uNick}】&【${sNick}】的时光轴\n\n相识相恋：${new Date(user.marriage_time).toLocaleDateString('zh-CN')}\n相伴天数：${daysTogether} 天\n\n一起走过的每一天，都是最珍贵的回忆。`
    return await e.reply(msg)
  }

  /**
   * #拍立得
   */
  async polaroid (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    if (!user.s) {
      return await e.reply('💔 你目前还没有伴侣，无法拍摄拍立得哦~')
    }

    const message = e.msg.replace(/^#?拍立得/, '').trim() || '留住这一刻'
    
    // 获取照片列表
    let photos = await this.db.getDim(uid, gid, 'photos', [])
    
    photos.push({
      date: Date.now(),
      message,
      avatar1: this.getUserAvatar(uid),
      avatar2: this.getUserAvatar(user.s)
    })

    if (photos.length > 50) {
      photos = photos.slice(-50)
    }

    await this.db.setDim(uid, gid, 'photos', photos)

    const uNick = await this.getUserNick(e, uid)
    const sNick = await this.getUserNick(e, user.s)

    return await e.reply(`📸 拍立得\n\n"${message}"\n\n【${uNick}】和【${sNick}】的甜蜜瞬间已收录进情侣相册！\n当前相册共有 ${photos.length} 张照片`)
  }

  /**
   * #情侣相册
   */
  async photoAlbum (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    if (!user.s) {
      return await e.reply('💔 你目前还没有伴侣哦~')
    }

    const photos = await this.db.getDim(uid, gid, 'photos', [])
    
    if (photos.length === 0) {
      return await e.reply('📸 你们的情侣相册还是空的，用 #拍立得 记录美好瞬间吧！')
    }

    let msg = `📸 情侣相册（共${photos.length}张）\n\n`
    const recent = photos.slice(-5)
    
    for (const photo of recent) {
      const date = new Date(photo.date).toLocaleDateString('zh-CN')
      msg += `${date}: ${photo.message}\n`
    }

    return await e.reply(msg)
  }

  /**
   * #房间生活
   */
  async roomLife (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    if (!user.s) {
      return await e.reply('💔 你目前还没有伴侣哦~')
    }

    const roomType = e.msg.match(/装扮 (客厅 | 卧室)|阳台时光 | 厨房烟火/)
    const room = roomType ? roomType[0] : '客厅'
    
    const furnitures = await this.db.getDim(uid, gid, 'furnitures', {})
    const roomFurniture = furnitures[room] || []

    const descriptions = {
      '客厅': '温馨的小窝，承载着你们的欢声笑语',
      '卧室': '甜蜜的私密空间，每晚都有温暖的拥抱',
      '阳台': '阳光洒落的地方，一起看日出日落',
      '厨房': '烟火气息满满，为 TA 做一顿爱心晚餐'
    }

    const uNick = await this.getUserNick(e, uid)
    const sNick = await this.getUserNick(e, user.s)

    let msg = `🏠 ${room}\n\n${descriptions[room] || '温馨的角落'}\n\n`
    if (roomFurniture.length > 0) {
      msg += `已有家具：${roomFurniture.join(', ')}\n\n`
    }
    msg += `使用 #购买家具 来装点你们的爱巢吧！`

    return await e.reply(msg)
  }

  /**
   * #扔漂流瓶
   */
  async throwBottle (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const message = e.msg.replace(/^#?扔漂流瓶/, '').trim()

    if (!message) {
      return await e.reply('🌊 请在指令后写下你想说的话，例如：\n#扔漂流瓶 愿岁岁常相见')
    }

    // 存储到 Redis
    const bottleId = `bottle:${Date.now()}:${uid}`
    await redis.set(`akasha:bottle:${bottleId}`, JSON.stringify({
      uid,
      gid,
      message,
      time: Date.now()
    }), { EX: 86400 * 7 }) // 7 天有效期

    return await e.reply(`🌊 你把心愿投向了星河...\n\n"${message}"\n\n也许某天，会有人捞起你的祝福~`)
  }

  /**
   * #捞漂流瓶
   */
  async fishBottle (e) {
    // 随机获取一个漂流瓶
    const keys = await this.scanKeys('akasha:bottle:*')
    
    if (keys.length === 0) {
      return await e.reply('🌊 海面上空空如也，还没有人扔漂流瓶呢~')
    }

    const randomKey = keys[Math.floor(Math.random() * keys.length)]
    const data = await redis.get(randomKey)
    
    if (!data) {
      return await e.reply('🌊 这个漂流瓶已经消失了...')
    }

    const bottle = JSON.parse(data)
    await redis.del(randomKey)

    return await e.reply(`🌊 你捞到了一个漂流瓶！\n\n"${bottle.message}"\n\n来自：匿名用户\n时间：${new Date(bottle.time).toLocaleDateString('zh-CN')}`)
  }

  async scanKeys (pattern) {
    const keys = []
    let cursor = 0
    do {
      const result = await redis.scan(cursor, { MATCH: pattern, COUNT: 100 })
      cursor = result.cursor
      keys.push(...result.keys)
    } while (cursor !== '0')
    return keys
  }

  getUserAvatar (userId) {
    return `https://q.qlogo.cn/headimg_dl?dst_uin=${userId}&spec=640`
  }

  /**
   * #一起看电影
   */
  async watchMovie (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    if (!user.s) {
      return await e.reply('💔 你目前还没有伴侣哦~')
    }

    const movie = e.msg.replace(/^#?一起看电影/, '').trim() || '泰坦尼克号'
    const uNick = await this.getUserNick(e, uid)
    const sNick = await this.getUserNick(e, user.s)

    const snacks = ['爆米花', '可乐', '薯片', '巧克力', '冰淇淋']
    const randomSnack = snacks[Math.floor(Math.random() * snacks.length)]

    return await e.reply(`🎬 私人放映厅\n\n【${uNick}】和【${sNick}】正在观看《${movie}》\n\n配着${randomSnack}，依偎在一起，享受这美好的二人世界~`)
  }

  /**
   * #给 TA 点外卖
   */
  async orderFood (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    if (!user.s) {
      return await e.reply('💔 你目前还没有伴侣哦~')
    }

    const food = e.msg.replace(/^#?给 TA 点外卖/, '').trim() || '生椰烤奶'
    const cost = Math.floor(Math.random() * 30) + 15

    if (user.money < cost) {
      return await e.reply(`💰 金币不足，需要${cost}金币才能点这份美食`)
    }

    user.money -= cost
    await this.db.saveUser(uid, gid, user)

    const uNick = await this.getUserNick(e, uid)
    const sNick = await this.getUserNick(e, user.s)

    return await e.reply(`🍱 外卖已送达！\n\n【${uNick}】为【${sNick}】点了：${food}\n花费：${cost} 金币\n\n附言："记得按时吃饭，想你了~"`)
  }

  /**
   * #吃醋了
   */
  async jealousy (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    if (!user.s) {
      return await e.reply('💔 你目前还没有伴侣哦~')
    }

    const uNick = await this.getUserNick(e, uid)
    const sNick = await this.getUserNick(e, user.s)

    const responses = [
      `【${sNick}】立刻放下手中的事，轻轻抱住你："宝贝别生气，我心里只有你一个人"\n好感度 +5`,
      `【${sNick}】紧张地握住你的手："怎么了？是我哪里做得不好吗？"\n好感度 +3`,
      `【${sNick}】温柔地摸摸你的头："小傻瓜，我吃醋还差不多~"\n好感度 +5`
    ]

    const response = responses[Math.floor(Math.random() * responses.length)]
    user.love = (user.love || 0) + Math.floor(Math.random() * 5) + 3
    await this.db.saveUser(uid, gid, user)

    return await e.reply(`🍋 吃醋了\n\n${response}`)
  }

  /**
   * #晚安哄睡
   */
  async goodnight (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    if (!user.s) {
      return await e.reply('💤 晚安，愿你有个好梦~')
    }

    const uNick = await this.getUserNick(e, uid)
    const sNick = await this.getUserNick(e, user.s)

    const stories = [
      '从前有只小熊，每天晚上都会对月亮说晚安...',
      '在遥远的星空下，有一颗专门守护爱情的星星...',
      '传说每对恋人都是天上的两颗星星，注定要相遇...'
    ]

    return await e.reply(`🌙 晚安故事\n\n【${sNick}】轻轻为你掖好被角，在你耳边轻声说：\n"${stories[Math.floor(Math.random() * stories.length)]}"\n\n晚安，${uNick}，梦里见~ 💕`)
  }

  /**
   * #心跳检测
   */
  async heartRate (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    if (!user.s) {
      return await e.reply('💓 请发送 #娶群友 开始你的恋爱之旅~')
    }

    const bpm = Math.floor(Math.random() * 40) + 80 // 80-120 BPM
    const uNick = await this.getUserNick(e, uid)
    const sNick = await this.getUserNick(e, user.s)

    let level = '平稳'
    if (bpm > 90) level = '加速'
    if (bpm > 100) level = '小鹿乱撞'
    if (bpm > 110) level = '心动爆表'

    return await e.reply(`💓 心跳检测\n\n【${uNick}】此刻的心跳：${bpm} BPM\n状态：${level}\n\n看来见到【${sNick}】就忍不住心跳加速呢~`)
  }

  /**
   * #留便签
   */
  async leaveNote (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    if (!user.s) {
      return await e.reply('💔 你目前还没有伴侣哦~')
    }

    const content = e.msg.replace(/^#?留便签/, '').trim()
    if (!content) {
      return await e.reply('📝 请在指令后写下便利贴内容，例如：\n#留便签 记得想我')
    }

    const notes = await this.db.getDim(uid, gid, 'notes', [])
    notes.push({
      content,
      time: Date.now(),
      author: uid
    })

    if (notes.length > 20) {
      notes = notes.slice(-20)
    }

    await this.db.setDim(uid, gid, 'notes', notes)

    return await e.reply(`📒 便利贴已贴在冰箱上！\n\n"${content}"\n\nTA 一定会看到的~`)
  }

  /**
   * #查手机
   */
  async checkPhone (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    if (!user.s) {
      return await e.reply('📱 单身贵族的手机，没什么好看的~')
    }

    const secrets = [
      '备忘录里全是关于你的记录',
      '相册里偷偷存了很多你的照片',
      '聊天记录置顶永远是你',
      '浏览器历史记录：如何讨 TA 开心'
    ]

    const uNick = await this.getUserNick(e, uid)
    const sNick = await this.getUserNick(e, user.s)

    return await e.reply(`📱 突击检查【${sNick}】的手机\n\n发现了一个小秘密：\n${secrets[Math.floor(Math.random() * secrets.length)]}\n\n原来 TA 这么在乎你呀~ 💕`)
  }

  /**
   * #今天吃什么
   */
  async whatToEat (e) {
    const foods = [
      '火锅', '烤肉', '日料', '川菜', '粤菜',
      '披萨', '汉堡', '寿司', '拉面', '炒饭',
      '麻辣烫', '螺蛳粉', '炸鸡', '牛排', '沙拉'
    ]

    const randomFood = foods[Math.floor(Math.random() * foods.length)]
    return await e.reply(`🍽️ 今天吃什么？\n\n🎲 命运之轮转动中...\n\n答案是：${randomFood}！\n\n快去和 TA 一起享用吧~`)
  }

  /**
   * #谁做家务
   */
  async whoDoesChores (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    if (!user.s) {
      return await e.reply('🧹 一个人的家务，自己做吧~')
    }

    const uNick = await this.getUserNick(e, uid)
    const sNick = await this.getUserNick(e, user.s)

    const dice1 = Math.floor(Math.random() * 6) + 1
    const dice2 = Math.floor(Math.random() * 6) + 1

    let winner = dice1 > dice2 ? uNick : sNick
    let result = dice1 > dice2 ? '你赢了！' : '你输了...'

    if (dice1 === dice2) {
      winner = '一起'
      result = '平局！'
    }

    return await e.reply(`🎲 家务大比拼\n\n${uNick}: 🎲 ${dice1}\n${sNick}: 🎲 ${dice2}\n\n结果：${result}\n今天的碗由【${winner}】来洗！`)
  }

  /**
   * #亲自下厨
   */
  async cooking (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    if (!user.s) {
      return await e.reply('🍳 一个人的晚餐，也要好好吃哦~')
    }

    const dish = e.msg.replace(/^#?亲自下厨/, '').trim() || '可乐鸡翅'
    const uNick = await this.getUserNick(e, uid)
    const sNick = await this.getUserNick(e, user.s)

    const outcomes = [
      { success: true, text: '完美！色香味俱全！' },
      { success: true, text: '不错！TA 吃得很开心！' },
      { success: false, text: '哎呀，有点糊了...' },
      { success: false, text: '盐好像放多了...' }
    ]

    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)]

    if (outcome.success) {
      user.love = (user.love || 0) + 10
      await this.db.saveUser(uid, gid, user)
    }

    return await e.reply(`🍳 亲自下厨\n\n【${uNick}】为【${sNick}】做了：${dish}\n\n${outcome.text}\n${outcome.success ? '好感度 +10 ❤️' : ''}`)
  }

  /**
   * #恋爱记账
   */
  async recordExpense (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    if (!user.s) {
      return await e.reply('💔 你目前还没有伴侣哦~')
    }

    const match = e.msg.match(/^#?恋爱记账\s*(\d+)\s*(.*)/)
    if (!match) {
      return await e.reply('📒 用法：#恋爱记账 [金额] [用途]\n例如：#恋爱记账 120 约会日料')
    }

    const amount = parseInt(match[1])
    const purpose = match[2].trim() || '日常开销'

    const expenses = await this.db.getDim(uid, gid, 'expenses', [])
    expenses.push({
      amount,
      purpose,
      date: Date.now()
    })

    if (expenses.length > 100) {
      expenses = expenses.slice(-100)
    }

    await this.db.setDim(uid, gid, 'expenses', expenses)

    return await e.reply(`📒 账本已记录\n\n支出：${amount} 金币\n用途：${purpose}\n时间：${new Date().toLocaleDateString('zh-CN')}`)
  }

  /**
   * #查看账本
   */
  async viewLedger (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    if (!user.s) {
      return await e.reply('💔 你目前还没有伴侣哦~')
    }

    const expenses = await this.db.getDim(uid, gid, 'expenses', [])
    
    if (expenses.length === 0) {
      return await e.reply('📒 你们的恋爱账本还是空白的~')
    }

    const recent = expenses.slice(-10)
    const total = expenses.reduce((sum, e) => sum + e.amount, 0)

    let msg = '📒 恋爱账本（最近 10 条）\n\n'
    for (const exp of recent) {
      msg += `${new Date(exp.date).toLocaleDateString('zh-CN')}: ${exp.purpose} - ${exp.amount}金币\n`
    }

    msg += `\n总计支出：${total} 金币`
    return await e.reply(msg)
  }

  /**
   * #情侣 100 件小事
   */
  async love100Things (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    if (!user.s) {
      return await e.reply('💔 你目前还没有伴侣哦~')
    }

    const things = await this.db.getDim(uid, gid, 'love100', [])
    const completed = things.filter(t => t.done).length

    return await e.reply(`💕 情侣必做的 100 件小事\n\n已完成：${completed}/100\n\n使用 #打卡恋爱小事 [序号] 来点亮每一件浪漫小事！`)
  }

  /**
   * #打卡恋爱小事
   */
  async checkinLoveThing (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    if (!user.s) {
      return await e.reply('💔 你目前还没有伴侣哦~')
    }

    const index = parseInt(e.msg.match(/\d+/)?.[0])
    if (!index || index < 1 || index > 100) {
      return await e.reply('📍 请输入 1-100 之间的小事序号')
    }

    let things = await this.db.getDim(uid, gid, 'love100', [])
    
    // 初始化
    if (things.length === 0) {
      things = Array(100).fill(null).map((_, i) => ({
        index: i + 1,
        done: false,
        date: null
      }))
    }

    things[index - 1].done = true
    things[index - 1].date = Date.now()

    await this.db.setDim(uid, gid, 'love100', things)

    const completed = things.filter(t => t.done).length

    return await e.reply(`✅ 第${index}件小事已打卡！\n\n进度：${completed}/100\n\n继续完成更多浪漫小事吧！`)
  }

  /**
   * #设置专属爱称
   */
  async setNicknames (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    if (!user.s) {
      return await e.reply('💔 你目前还没有伴侣哦~')
    }

    const parts = e.msg.replace(/^#?设置专属爱称/, '').trim().split(/\s+/)
    if (parts.length < 2) {
      return await e.reply('💕 用法：#设置专属爱称 [我对 TA 的称呼] [TA 对我的称呼]\n例如：#设置专属爱称 臭宝 猪猪')
    }

    user.nicknames = {
      my_to_spouse: parts[0],
      spouse_to_me: parts[1]
    }

    await this.db.saveUser(uid, gid, user)

    return await e.reply(`💕 专属爱称已设置！\n\n你对 TA 的称呼：${parts[0]}\nTA 对你的称呼：${parts[1]}\n\n以后互动时会优先使用这些爱称哦~`)
  }

  /**
   * #查岗/报备行程
   */
  async reportStatus (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    if (!user.s) {
      return await e.reply('📍 一个人的行程，自由自在~')
    }

    const content = e.msg.replace(/^#?(查岗 | 报备行程)/, '').trim()
    if (!content) {
      return await e.reply('📍 用法：#报备行程 [内容]\n例如：#报备行程 正在加班，晚点回家')
    }

    const uNick = await this.getUserNick(e, uid)
    const sNick = await this.getUserNick(e, user.s)

    return await e.reply(`📍 行程报备\n\n【${uNick}】: ${content}\n\n【${sNick}】已收到你的报备："好的，注意安全，等你回来~"`)
  }

  /**
   * #设置纪念日
   */
  async setAnniversary (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    if (!user.s) {
      return await e.reply('💔 你目前还没有伴侣哦~')
    }

    const match = e.msg.match(/^#?设置纪念日\s*(\S+)\s+(\d{4}-\d{2}-\d{2})/)
    if (!match) {
      return await e.reply('📅 用法：#设置纪念日 [名称] [日期]\n例如：#设置纪念日 宝贝生日 2026-10-15')
    }

    const name = match[1]
    const date = match[2]

    let anniversaries = await this.db.getDim(uid, gid, 'anniversaries', [])
    anniversaries.push({ name, date })

    await this.db.setDim(uid, gid, 'anniversaries', anniversaries)

    return await e.reply(`📅 纪念日已添加！\n\n名称：${name}\n日期：${date}\n\n到时候会提醒你们的~`)
  }

  /**
   * #重要日子
   */
  async countdownDays (e) {
    const gid = this.getGroupId(e)
    const uid = this.getUserId(e)
    const user = await this.db.getUser(uid, gid)

    if (!user.s) {
      return await e.reply('💔 你目前还没有伴侣哦~')
    }

    const anniversaries = await this.db.getDim(uid, gid, 'anniversaries', [])
    const marriageDays = Math.floor((Date.now() - user.marriage_time) / (1000 * 60 * 60 * 24))

    let msg = '📅 重要日子\n\n'
    msg += `💕 恋爱纪念日：已相伴 ${marriageDays} 天\n\n`

    if (anniversaries.length > 0) {
      const now = new Date()
      for (const ann of anniversaries) {
        const annDate = new Date(`${ann.date}T00:00:00`)
        const nextOccur = new Date(now.getFullYear(), annDate.getMonth(), annDate.getDate())
        
        if (nextOccur < now) {
          nextOccur.setFullYear(nextOccur.getFullYear() + 1)
        }

        const daysLeft = Math.ceil((nextOccur - now) / (1000 * 60 * 60 * 24))
        msg += `${ann.name}: 还有 ${daysLeft} 天\n`
      }
    } else {
      msg += '暂无自定义纪念日，使用 #设置纪念日 添加~'
    }

    return await e.reply(msg)
  }
}
