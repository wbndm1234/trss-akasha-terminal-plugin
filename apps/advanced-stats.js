import plugin from '../../../lib/plugins/plugin.js'
import moment from 'moment'
import fs from 'node:fs'
import path from 'node:path'
import YAML from 'yaml'

/**
 * 高级统计功能插件
 * 提供排行榜、数据导出、定时报告等高级功能
 */
export class AdvancedStats extends plugin {
  constructor() {
    super({
      name: '高级统计功能',
      dsc: '提供排行榜、数据导出等高级统计功能',
      event: 'message',
      priority: 1000,
      rule: [
        {
          reg: '^#统计排行(.*)$',
          fnc: 'statsRanking'
        },
        {
          reg: '^#活跃排行(.*)$',
          fnc: 'activeRanking'
        },
        {
          reg: '^#导出统计(.*)$',
          fnc: 'exportStats',
          permission: 'master'
        },
        {
          reg: '^#统计报告$',
          fnc: 'generateReport',
          permission: 'master'
        },
        {
          reg: '^#统计趋势(.*)$',
          fnc: 'statsTrend'
        },
        {
          reg: '^#清理统计(.*)$',
          fnc: 'cleanStats',
          permission: 'master'
        }
      ],
      task: {
        name: '每日统计报告',
        cron: '0 9 * * *', // 每天9点
        fnc: 'dailyReport'
      }
    })
    
    this.configPath = path.join(process.cwd(), 'plugins/trss-akasha-terminal-plugin/config/command-stats.yaml')
    this.config = this.loadConfig()
  }

  /**
   * 加载配置文件
   */
  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readFileSync(this.configPath, 'utf8')
        return YAML.parse(configData)
      }
    } catch (error) {
      logger.error('加载统计配置失败:', error)
    }
    
    // 返回默认配置
    return {
      basic: { enabled: true, retention_days: 365 },
      permission: { global_stats: 'master', user_stats: 'admin', group_stats: 'admin' },
      display: { page_size: 10, default_range: 'today', ranking_limit: 10 },
      advanced: { realtime_stats: true, cache_duration: 300 }
    }
  }

  /**
   * 统计排行榜
   */
  async statsRanking() {
    const params = this.e.msg.replace(/^#统计排行/, '').trim()
    const args = this.parseRankingArgs(params)
    
    let msg = '🏆 统计排行榜\n'
    msg += '━━━━━━━━━━━━━━━━\n'
    
    if (args.type === 'user' || !args.type) {
      msg += await this.getUserRanking(args.range, args.limit)
    }
    
    if (args.type === 'group' || !args.type) {
      if (args.type !== 'user') msg += '\n'
      msg += await this.getGroupRanking(args.range, args.limit)
    }
    
    return this.reply(msg)
  }

  /**
   * 活跃排行榜
   */
  async activeRanking() {
    const params = this.e.msg.replace(/^#活跃排行/, '').trim()
    const range = params || 'today'
    
    const dateKey = this.getDateKey(range)
    const userRanking = await this.getActiveUserRanking(dateKey, 10)
    const groupRanking = await this.getActiveGroupRanking(dateKey, 10)
    
    let msg = `🔥 ${this.getRangeLabel(range)}活跃排行\n`
    msg += '━━━━━━━━━━━━━━━━\n'
    msg += '👤 用户活跃榜:\n'
    
    userRanking.forEach((item, index) => {
      msg += `${this.getRankEmoji(index + 1)} ${item.id}: ${item.count}条\n`
    })
    
    msg += '\n👥 群聊活跃榜:\n'
    groupRanking.forEach((item, index) => {
      msg += `${this.getRankEmoji(index + 1)} ${item.id}: ${item.count}条\n`
    })
    
    return this.reply(msg)
  }

  /**
   * 导出统计数据
   */
  async exportStats() {
    const params = this.e.msg.replace(/^#导出统计/, '').trim()
    const args = this.parseExportArgs(params)
    
    try {
      const data = await this.collectExportData(args)
      const filename = await this.saveExportData(data, args.format || 'json')
      
      return this.reply(`📊 统计数据导出完成\n文件: ${filename}\n记录数: ${data.length}`)
    } catch (error) {
      logger.error('导出统计数据失败:', error)
      return this.reply('❌ 导出失败: ' + error.message)
    }
  }

  /**
   * 生成统计报告
   */
  async generateReport() {
    const report = await this.createDetailedReport()
    return this.reply(report)
  }

  /**
   * 统计趋势分析
   */
  async statsTrend() {
    const params = this.e.msg.replace(/^#统计趋势/, '').trim()
    const days = parseInt(params) || 7
    
    const trendData = await this.getTrendData(days)
    const msg = this.formatTrendMessage(trendData, days)
    
    return this.reply(msg)
  }

  /**
   * 清理统计数据
   */
  async cleanStats() {
    const params = this.e.msg.replace(/^#清理统计/, '').trim()
    
    if (!params || params === '帮助') {
      return this.reply(this.getCleanHelpMessage())
    }
    
    const days = parseInt(params)
    if (isNaN(days) || days < 1) {
      return this.reply('❌ 请输入有效的天数')
    }
    
    const cleanedCount = await this.cleanOldStats(days)
    return this.reply(`🧹 清理完成，删除了 ${cleanedCount} 条过期统计数据`)
  }

  /**
   * 每日统计报告任务
   */
  async dailyReport() {
    if (!this.config.notification?.daily_report) return
    
    const report = await this.createDailyReport()
    const target = this.config.notification.report_target
    
    // 发送报告到指定目标
    if (target === 'master') {
      // 发送给主人
      for (const masterId of cfg.masterQQ) {
        await Bot.pickUser(masterId).sendMsg(report)
      }
    } else if (!isNaN(target)) {
      // 发送到指定群
      await Bot.pickGroup(target).sendMsg(report)
    }
  }

  /**
   * 获取用户排行榜
   */
  async getUserRanking(range = 'today', limit = 10) {
    const dateKey = this.getDateKey(range)
    const pattern = `Yz:count:receive:msg:user:*:${dateKey}`
    
    const userStats = await this.scanAndCollectStats(pattern)
    const sorted = userStats.sort((a, b) => b.count - a.count).slice(0, limit)
    
    let msg = `👤 用户消息榜 (${this.getRangeLabel(range)}):\n`
    sorted.forEach((item, index) => {
      msg += `${this.getRankEmoji(index + 1)} ${item.id}: ${item.count}条\n`
    })
    
    return msg
  }

  /**
   * 获取群排行榜
   */
  async getGroupRanking(range = 'today', limit = 10) {
    const dateKey = this.getDateKey(range)
    const pattern = `Yz:count:receive:msg:group:*:${dateKey}`
    
    const groupStats = await this.scanAndCollectStats(pattern)
    const sorted = groupStats.sort((a, b) => b.count - a.count).slice(0, limit)
    
    let msg = `👥 群聊消息榜 (${this.getRangeLabel(range)}):\n`
    sorted.forEach((item, index) => {
      msg += `${this.getRankEmoji(index + 1)} ${item.id}: ${item.count}条\n`
    })
    
    return msg
  }

  /**
   * 获取活跃用户排行
   */
  async getActiveUserRanking(dateKey, limit) {
    const pattern = `Yz:count:receive:msg:user:*:${dateKey}`
    return await this.scanAndCollectStats(pattern, limit)
  }

  /**
   * 获取活跃群排行
   */
  async getActiveGroupRanking(dateKey, limit) {
    const pattern = `Yz:count:receive:msg:group:*:${dateKey}`
    return await this.scanAndCollectStats(pattern, limit)
  }

  /**
   * 扫描并收集统计数据
   */
  async scanAndCollectStats(pattern, limit = 100) {
    let cursor = 0
    const stats = []
    
    do {
      const reply = await redis.scan(cursor, { MATCH: pattern, COUNT: 1000 })
      cursor = reply.cursor
      
      for (const key of reply.keys) {
        const count = await redis.get(key)
        if (count > 0) {
          const parts = key.split(':')
          const id = parts[4] // user:id 或 group:id 中的 id
          stats.push({ id, count: parseInt(count) })
        }
      }
    } while (cursor != 0 && stats.length < limit * 10)
    
    return stats.sort((a, b) => b.count - a.count).slice(0, limit)
  }

  /**
   * 收集导出数据
   */
  async collectExportData(args) {
    const data = []
    const dateKey = this.getDateKey(args.range || 'total')
    
    // 收集用户数据
    if (args.type === 'user' || !args.type) {
      const userPattern = `Yz:count:*:msg:user:*:${dateKey}`
      const userData = await this.scanAndCollectDetailedStats(userPattern, 'user')
      data.push(...userData)
    }
    
    // 收集群数据
    if (args.type === 'group' || !args.type) {
      const groupPattern = `Yz:count:*:msg:group:*:${dateKey}`
      const groupData = await this.scanAndCollectDetailedStats(groupPattern, 'group')
      data.push(...groupData)
    }
    
    return data
  }

  /**
   * 扫描并收集详细统计数据
   */
  async scanAndCollectDetailedStats(pattern, type) {
    let cursor = 0
    const stats = []
    
    do {
      const reply = await redis.scan(cursor, { MATCH: pattern, COUNT: 1000 })
      cursor = reply.cursor
      
      for (const key of reply.keys) {
        const count = await redis.get(key)
        const parts = key.split(':')
        const action = parts[2] // receive 或 send
        const id = parts[5] // user:id 或 group:id 中的 id
        const date = parts[6] // 日期
        
        stats.push({
          type,
          id,
          action,
          date,
          count: parseInt(count),
          timestamp: moment().format()
        })
      }
    } while (cursor != 0)
    
    return stats
  }

  /**
   * 保存导出数据
   */
  async saveExportData(data, format) {
    const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss')
    const filename = `stats_export_${timestamp}.${format}`
    const filepath = path.join(process.cwd(), 'data', 'exports', filename)
    
    // 确保目录存在
    const dir = path.dirname(filepath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    
    if (format === 'json') {
      fs.writeFileSync(filepath, JSON.stringify(data, null, 2))
    } else if (format === 'csv') {
      const csv = this.convertToCSV(data)
      fs.writeFileSync(filepath, csv)
    }
    
    return filename
  }

  /**
   * 转换为CSV格式
   */
  convertToCSV(data) {
    if (data.length === 0) return ''
    
    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header]).join(','))
    ].join('\n')
    
    return csvContent
  }

  /**
   * 创建详细报告
   */
  async createDetailedReport() {
    const today = moment().format('YYYY:MM:DD')
    const yesterday = moment().subtract(1, 'day').format('YYYY:MM:DD')
    const month = moment().format('YYYY:MM')
    
    const todayStats = await this.getDayStats(today)
    const yesterdayStats = await this.getDayStats(yesterday)
    const monthStats = await this.getDayStats(month)
    
    let msg = '📊 详细统计报告\n'
    msg += '━━━━━━━━━━━━━━━━\n'
    msg += `📅 今日统计 (${moment().format('MM-DD')})\n`
    msg += `  收到: ${todayStats.receive} | 发送: ${todayStats.send}\n`
    msg += `  活跃用户: ${todayStats.activeUsers}\n`
    msg += `  活跃群聊: ${todayStats.activeGroups}\n\n`
    
    msg += `📅 昨日对比 (${moment().subtract(1, 'day').format('MM-DD')})\n`
    msg += `  收到: ${yesterdayStats.receive} (${this.getChangeText(todayStats.receive, yesterdayStats.receive)})\n`
    msg += `  发送: ${yesterdayStats.send} (${this.getChangeText(todayStats.send, yesterdayStats.send)})\n\n`
    
    msg += `📆 本月累计 (${moment().format('MM月')})\n`
    msg += `  收到: ${monthStats.receive} | 发送: ${monthStats.send}\n`
    
    return msg
  }

  /**
   * 创建每日报告
   */
  async createDailyReport() {
    const yesterday = moment().subtract(1, 'day').format('YYYY:MM:DD')
    const stats = await this.getDayStats(yesterday)
    
    let msg = `🌅 每日统计报告 ${moment().subtract(1, 'day').format('YYYY-MM-DD')}\n`
    msg += '━━━━━━━━━━━━━━━━\n'
    msg += `📨 收到消息: ${stats.receive}\n`
    msg += `📤 发送消息: ${stats.send}\n`
    msg += `👤 活跃用户: ${stats.activeUsers}\n`
    msg += `👥 活跃群聊: ${stats.activeGroups}\n`
    
    return msg
  }

  /**
   * 获取某天的统计数据
   */
  async getDayStats(dateKey) {
    const receive = await redis.get(`Yz:count:receive:msg:total:${dateKey}`) || 0
    const send = await redis.get(`Yz:count:send:msg:total:${dateKey}`) || 0
    
    const activeUsers = await this.getActiveCount('user', dateKey)
    const activeGroups = await this.getActiveCount('group', dateKey)
    
    return {
      receive: parseInt(receive),
      send: parseInt(send),
      activeUsers,
      activeGroups
    }
  }

  /**
   * 获取活跃数量
   */
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

  /**
   * 获取趋势数据
   */
  async getTrendData(days) {
    const trendData = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = moment().subtract(i, 'days')
      const dateKey = date.format('YYYY:MM:DD')
      const stats = await this.getDayStats(dateKey)
      
      trendData.push({
        date: date.format('MM-DD'),
        ...stats
      })
    }
    
    return trendData
  }

  /**
   * 格式化趋势消息
   */
  formatTrendMessage(trendData, days) {
    let msg = `📈 ${days}天统计趋势\n`
    msg += '━━━━━━━━━━━━━━━━\n'
    
    trendData.forEach(day => {
      msg += `${day.date}: 收${day.receive} 发${day.send}\n`
    })
    
    // 计算平均值
    const avgReceive = Math.round(trendData.reduce((sum, day) => sum + day.receive, 0) / days)
    const avgSend = Math.round(trendData.reduce((sum, day) => sum + day.send, 0) / days)
    
    msg += `\n📊 日均: 收${avgReceive} 发${avgSend}`
    
    return msg
  }

  /**
   * 清理过期统计数据
   */
  async cleanOldStats(days) {
    const cutoffDate = moment().subtract(days, 'days')
    let cleanedCount = 0
    let cursor = 0
    
    do {
      const reply = await redis.scan(cursor, { MATCH: 'Yz:count:*', COUNT: 1000 })
      cursor = reply.cursor
      
      for (const key of reply.keys) {
        const parts = key.split(':')
        if (parts.length >= 6) {
          const dateStr = parts[parts.length - 1]
          if (dateStr.includes(':') && dateStr !== 'total') {
            const keyDate = moment(dateStr.replace(/:/g, '-'))
            if (keyDate.isValid() && keyDate.isBefore(cutoffDate)) {
              await redis.del(key)
              cleanedCount++
            }
          }
        }
      }
    } while (cursor != 0)
    
    return cleanedCount
  }

  // 工具方法
  parseRankingArgs(params) {
    const args = { limit: 10, range: 'today' }
    const parts = params.split(' ').filter(p => p.trim())
    
    for (const part of parts) {
      if (['用户', 'user'].includes(part)) args.type = 'user'
      else if (['群', 'group'].includes(part)) args.type = 'group'
      else if (['今日', 'today'].includes(part)) args.range = 'today'
      else if (['本月', 'month'].includes(part)) args.range = 'month'
      else if (['总计', 'total'].includes(part)) args.range = 'total'
      else if (!isNaN(part)) args.limit = parseInt(part)
    }
    
    return args
  }

  parseExportArgs(params) {
    const args = {}
    const parts = params.split(' ').filter(p => p.trim())
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      if (['json', 'csv'].includes(part)) args.format = part
      else if (['用户', 'user'].includes(part)) args.type = 'user'
      else if (['群', 'group'].includes(part)) args.type = 'group'
      else if (['今日', 'today', '本月', 'month', '总计', 'total'].includes(part)) args.range = part
    }
    
    return args
  }

  getDateKey(range) {
    switch (range) {
      case 'today': return moment().format('YYYY:MM:DD')
      case 'month': return moment().format('YYYY:MM')
      case 'year': return moment().format('YYYY')
      case 'total': return 'total'
      default: return moment().format('YYYY:MM:DD')
    }
  }

  getRangeLabel(range) {
    const labels = {
      today: '今日',
      month: '本月',
      year: '本年',
      total: '总计'
    }
    return labels[range] || '今日'
  }

  getRankEmoji(rank) {
    const emojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']
    return emojis[rank - 1] || `${rank}.`
  }

  getChangeText(current, previous) {
    const diff = current - previous
    if (diff > 0) return `+${diff}`
    else if (diff < 0) return `${diff}`
    else return '±0'
  }

  getCleanHelpMessage() {
    return '🧹 清理统计数据\n━━━━━━━━━━━━━━━━\n用法: #清理统计 [天数]\n例如: #清理统计 30\n将删除30天前的统计数据'
  }
}

export default AdvancedStats