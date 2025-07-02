import plugin from '../../../lib/plugins/plugin.js'
import moment from 'moment'

export class CommandStats extends plugin {
  constructor() {
    super({
      name: '全局命令统计',
      dsc: '统计所有命令的使用情况',
      event: 'message',
      priority: 1000,
      rule: [
        {
          reg: '^#命令统计(.*)$',
          fnc: 'commandStats'
        },
        {
          reg: '^#用户统计(.*)$', 
          fnc: 'userStats'
        },
        {
          reg: '^#群统计(.*)$',
          fnc: 'groupStats'
        },
        {
          reg: '^#今日统计$',
          fnc: 'todayStats'
        },
        {
          reg: '^#本月统计$',
          fnc: 'monthStats'
        },
        {
          reg: '^#总统计$',
          fnc: 'totalStats'
        }
      ]
    })
  }

  
  async commandStats() {
    const params = this.e.msg.replace(/^#命令统计/, '').trim()
    if (typeof Bot !== 'undefined' && Bot.logger) {
      Bot.logger.info(`用户 ${this.e.user_id} 查询命令统计: ${params || '全部'}`)
    }
    
    if (!params) {
      return this.reply(await this.getOverallStats())
    }
    
    
    const args = this.parseArgs(params)
    return this.reply(await this.getDetailedStats(args))
  }

  
  async userStats() {
    const params = this.e.msg.replace(/^#用户统计/, '').trim()
    
     if (typeof Bot !== 'undefined' && Bot.logger) {
       Bot.logger.info(`用户 ${this.e.user_id} 查询用户统计: ${params || '自己'}`)
     }
     
     const userId = params || this.e.user_id
     const stats = await this.getUserStats(userId)
    return this.reply(stats)
  }

  
  async groupStats() {
    const groupId = this.e.msg.replace(/^#群统计/, '').trim() || this.e.group_id
    if (!groupId) {
      return this.reply('请在群聊中使用或指定群号')
    }
    const stats = await this.getGroupStats(groupId)
    return this.reply(stats)
  }

  
  async todayStats() {
    const today = moment().format('YYYY:MM:DD')
    const stats = await this.getDateStats(today, '今日')
    return this.reply(stats)
  }

  
  async monthStats() {
    const month = moment().format('YYYY:MM')
    const stats = await this.getDateStats(month, '本月')
    return this.reply(stats)
  }

  async totalStats() {
    const stats = await this.getDateStats('total', '总计')
    return this.reply(stats)
  }


  async getOverallStats() {
    const today = moment().format('YYYY:MM:DD')
    const month = moment().format('YYYY:MM')
    const year = moment().format('YYYY')
    
    const todayReceive = await redis.get(`Yz:count:receive:msg:total:${today}`) || 0
    const todaySend = await redis.get(`Yz:count:send:msg:total:${today}`) || 0
    const monthReceive = await redis.get(`Yz:count:receive:msg:total:${month}`) || 0
    const monthSend = await redis.get(`Yz:count:send:msg:total:${month}`) || 0
    const totalReceive = await redis.get(`Yz:count:receive:msg:total:total`) || 0
    const totalSend = await redis.get(`Yz:count:send:msg:total:total`) || 0
    
    const activeUsers = await this.getActiveCount('user', today)
    const activeGroups = await this.getActiveCount('group', today)
    
    let msg = '📊 全局命令统计\n'
    msg += '━━━━━━━━━━━━━━━━\n'
    msg += `📅 今日统计\n`
    msg += `  收到消息: ${todayReceive}\n`
    msg += `  发送消息: ${todaySend}\n`
    msg += `  活跃用户: ${activeUsers}\n`
    msg += `  活跃群聊: ${activeGroups}\n\n`
    msg += `📆 本月统计\n`
    msg += `  收到消息: ${monthReceive}\n`
    msg += `  发送消息: ${monthSend}\n\n`
    msg += `📈 总计\n`
    msg += `  收到消息: ${totalReceive}\n`
    msg += `  发送消息: ${totalSend}\n`
    msg += '━━━━━━━━━━━━━━━━\n'
    msg += '💡 使用 #命令统计 帮助 查看更多功能'
    
    return msg
  }

  
  async getDetailedStats(args) {
    if (args.help) {
      return this.getHelpMessage()
    }
    
    const timeRange = args.date || 'today'
    const target = args.user || args.group || args.bot
    
    let msg = '📊 详细统计信息\n'
    msg += '━━━━━━━━━━━━━━━━\n'
    
    if (target) {
      if (args.user) {
        msg += await this.getUserDetailStats(args.user, timeRange)
      } else if (args.group) {
        msg += await this.getGroupDetailStats(args.group, timeRange)
      } else if (args.bot) {
        msg += await this.getBotDetailStats(args.bot, timeRange)
      }
    } else {
      msg += await this.getGlobalDetailStats(timeRange)
    }
    
    return msg
  }

  
  async getUserStats(userId) {
    const today = moment().format('YYYY:MM:DD')
    const month = moment().format('YYYY:MM')
    
    const todayReceive = await redis.get(`Yz:count:receive:msg:user:${userId}:${today}`) || 0
    const todaySend = await redis.get(`Yz:count:send:msg:user:${userId}:${today}`) || 0
    const monthReceive = await redis.get(`Yz:count:receive:msg:user:${userId}:${month}`) || 0
    const monthSend = await redis.get(`Yz:count:send:msg:user:${userId}:${month}`) || 0
    const totalReceive = await redis.get(`Yz:count:receive:msg:user:${userId}:total`) || 0
    const totalSend = await redis.get(`Yz:count:send:msg:user:${userId}:total`) || 0
    
    let msg = `👤 用户统计 (${userId})\n`
    msg += '━━━━━━━━━━━━━━━━\n'
    msg += `📅 今日: 收${todayReceive} 发${todaySend}\n`
    msg += `📆 本月: 收${monthReceive} 发${monthSend}\n`
    msg += `📈 总计: 收${totalReceive} 发${totalSend}\n`
    
    return msg
  }

  
  async getGroupStats(groupId) {
    const today = moment().format('YYYY:MM:DD')
    const month = moment().format('YYYY:MM')
    
    const todayReceive = await redis.get(`Yz:count:receive:msg:group:${groupId}:${today}`) || 0
    const todaySend = await redis.get(`Yz:count:send:msg:group:${groupId}:${today}`) || 0
    const monthReceive = await redis.get(`Yz:count:receive:msg:group:${groupId}:${month}`) || 0
    const monthSend = await redis.get(`Yz:count:send:msg:group:${groupId}:${month}`) || 0
    const totalReceive = await redis.get(`Yz:count:receive:msg:group:${groupId}:total`) || 0
    const totalSend = await redis.get(`Yz:count:send:msg:group:${groupId}:total`) || 0
    
    let msg = `👥 群统计 (${groupId})\n`
    msg += '━━━━━━━━━━━━━━━━\n'
    msg += `📅 今日: 收${todayReceive} 发${todaySend}\n`
    msg += `📆 本月: 收${monthReceive} 发${monthSend}\n`
    msg += `📈 总计: 收${totalReceive} 发${totalSend}\n`
    
    return msg
  }

  
  async getDateStats(dateKey, label) {
    const receiveKey = `Yz:count:receive:msg:total:${dateKey}`
    const sendKey = `Yz:count:send:msg:total:${dateKey}`
    
    const receive = await redis.get(receiveKey) || 0
    const send = await redis.get(sendKey) || 0
    
    let msg = `📊 ${label}统计\n`
    msg += '━━━━━━━━━━━━━━━━\n'
    msg += `📨 收到消息: ${receive}\n`
    msg += `📤 发送消息: ${send}\n`
    
    if (dateKey !== 'total') {
      const activeUsers = await this.getActiveCount('user', dateKey)
      const activeGroups = await this.getActiveCount('group', dateKey)
      msg += `👤 活跃用户: ${activeUsers}\n`
      msg += `👥 活跃群聊: ${activeGroups}\n`
    }
    
    return msg
  }

  
  async getActiveCount(type, dateKey) {
    const pattern = `Yz:count:receive:msg:${type}:*:${dateKey}`
    let cursor = 0
    let count = 0
    
    do {
      const reply = await redis.scan(cursor, { MATCH: pattern, COUNT: 1000 })
      cursor = reply.cursor
      count += reply.keys.length
    } while (cursor != 0)
    
    return count
  }

  
  parseArgs(params) {
    const args = {}
    const parts = params.split(' ').filter(p => p.trim())
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      if (part === '帮助' || part === 'help') {
        args.help = true
      } else if (part === '用户' && parts[i + 1]) {
        args.user = parts[i + 1]
        i++
      } else if (part === '群' && parts[i + 1]) {
        args.group = parts[i + 1]
        i++
      } else if (part === '机器人' && parts[i + 1]) {
        args.bot = parts[i + 1]
        i++
      } else if (part === '日期' && parts[i + 1]) {
        args.date = parts[i + 1]
        i++
      }
    }
    
    return args
  }

  /**
   * 获取帮助信息
   */
  getHelpMessage() {
    let msg = '📖 命令统计帮助\n'
    msg += '━━━━━━━━━━━━━\n'
    msg += '🔸 #命令统计 - 查看总体统计\n'
    msg += '🔸 #用户统计 [用户ID] - 查看用户统计\n'
    msg += '🔸 #群统计 [群ID] - 查看群统计\n'
    msg += '🔸 #今日统计 - 查看今日统计\n'
    msg += '🔸 #本月统计 - 查看本月统计\n'
    msg += '🔸 #总统计 - 查看总计统计\n\n'
    msg += '📝 高级用法:\n'
    msg += '🔸 #命令统计 用户 114514 - 指定用户\n'
    msg += '🔸 #命令统计 群 114514 - 指定群\n'
    msg += '🔸 #命令统计 日期 2025:07:01 - 指定日期\n'
    msg += '━━━━━━━━━━━━━\n'
    
    return msg
  }

  
  async getUserDetailStats(userId, timeRange) {
    const dateKey = this.getDateKey(timeRange)
    const receive = await redis.get(`Yz:count:receive:msg:user:${userId}:${dateKey}`) || 0
    const send = await redis.get(`Yz:count:send:msg:user:${userId}:${dateKey}`) || 0
    
    return `👤 用户 ${userId} (${timeRange})\n收到: ${receive} | 发送: ${send}\n`
  }

  
  async getGroupDetailStats(groupId, timeRange) {
    const dateKey = this.getDateKey(timeRange)
    const receive = await redis.get(`Yz:count:receive:msg:group:${groupId}:${dateKey}`) || 0
    const send = await redis.get(`Yz:count:send:msg:group:${groupId}:${dateKey}`) || 0
    
    return `👥 群 ${groupId} (${timeRange})\n收到: ${receive} | 发送: ${send}\n`
  }

  
  async getBotDetailStats(botId, timeRange) {
    const dateKey = this.getDateKey(timeRange)
    const receive = await redis.get(`Yz:count:receive:msg:bot:${botId}:${dateKey}`) || 0
    const send = await redis.get(`Yz:count:send:msg:bot:${botId}:${dateKey}`) || 0
    
    return `🤖 机器人 ${botId} (${timeRange})\n收到: ${receive} | 发送: ${send}\n`
  }

  
  async getGlobalDetailStats(timeRange) {
    const dateKey = this.getDateKey(timeRange)
    const receive = await redis.get(`Yz:count:receive:msg:total:${dateKey}`) || 0
    const send = await redis.get(`Yz:count:send:msg:total:${dateKey}`) || 0
    
    return `🌐 全局统计 (${timeRange})\n收到: ${receive} | 发送: ${send}\n`
  }

  
  getDateKey(timeRange) {
    switch (timeRange) {
      case 'today':
        return moment().format('YYYY:MM:DD')
      case 'month':
        return moment().format('YYYY:MM')
      case 'year':
        return moment().format('YYYY')
      case 'total':
        return 'total'
      default:
        if (timeRange.includes(':')) {
          return timeRange
        }
        return moment().format('YYYY:MM:DD')
    }
  }
}

export default CommandStats