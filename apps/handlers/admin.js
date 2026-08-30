/**
 * 管理员系统处理器
 */
export class AdminHandler {
  constructor (db, renderer) {
    this.db = db
    this.renderer = renderer
  }

  getUserId (e) { return e.user_id?.toString() || e.sender?.user_id?.toString() || '' }
  getGroupId (e) { return e.group_id?.toString() || '' }

  /** #虚空时间重置 */
  async resetCooldown (e) {
    const target = this.getTargetId(e)
    const gid = this.getGroupId(e)

    if (target) {
      // 重置指定用户的冷却
      const keys = await this.scanKeys(`akasha:cd:*:${gid}:${target}`)
      for (const key of keys) {
        await redis.del(key)
      }
      return await e.reply(`✅ 已重置用户 ${target} 的所有冷却时间`)
    } else if (gid) {
      // 重置本群所有冷却
      const keys = await this.scanKeys(`akasha:cd:${gid}:*`)
      for (const key of keys) {
        await redis.del(key)
      }
      return await e.reply(`✅ 已重置本群所有用户的冷却时间`)
    }

    return await e.reply('❌ 请 @ 用户或在本群中使用此命令')
  }

  /** #虚空清除无效存档 */
  async cleanInvalidData (e) {
    const gid = this.getGroupId(e)
    if (!gid) {
      return await e.reply('❌ 请在群聊中使用此命令')
    }

    let cleaned = 0
    
    // 获取群成员列表
    const memberList = []
    try {
      const members = await e.group.getMemberMap()
      for (const [uid] of members) {
        memberList.push(uid.toString())
      }
    } catch {
      return await e.reply('❌ 获取群成员列表失败')
    }

    // 扫描所有用户数据
    const userKeys = await this.scanKeys(`akasha:user:${gid}:*`)
    
    for (const key of userKeys) {
      const match = key.match(/akasha:user:[^:]+:(\d+)/)
      if (match) {
        const uid = match[1]
        if (!memberList.includes(uid)) {
          // 用户已不在群中，删除数据
          await redis.del(key)
          cleaned++
        }
      }
    }

    return await e.reply(`✅ 清理完成！\n\n共清理 ${cleaned} 个退群用户的存档`)
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
}
