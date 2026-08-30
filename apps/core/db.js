import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * SQLite 数据库与持久化引擎
 * 基于 Yunzai-Bot 的 redis 存储，实现跨群全局唯一的伴侣系统
 */
export class AkashaDB {
  constructor () {
    this.dbPath = path.join(process.cwd(), 'data', 'trss-akasha-terminal', 'akasha.db')
    this.ensureDataDir()
  }

  /**
   * 确保数据目录存在
   */
  ensureDataDir () {
    const dir = path.dirname(this.dbPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }

  /**
   * 获取用户数据（伴侣与核心数值跨群全局唯一）
   */
  async getUser (uid, gid = '') {
    uid = String(uid).trim()
    gid = String(gid).trim()

    try {
      // 优先从指定群组获取
      if (gid) {
        const key = `akasha:user:${gid}:${uid}`
        const data = await redis.get(key)
        if (data) {
          return JSON.parse(data)
        }
      }

      // 跨群兜底查找
      const allGroupsKey = `akasha:user:*:${uid}`
      const keys = await this.scanKeys(allGroupsKey)
      if (keys.length > 0) {
        const data = await redis.get(keys[0])
        if (data) {
          return JSON.parse(data)
        }
      }

      // 返回默认数据
      return this.defaultUser(uid, gid)
    } catch (err) {
      logger.error('[虚空终端] 获取用户数据失败:', err)
      return this.defaultUser(uid, gid)
    }
  }

  /**
   * 默认用户数据结构
   */
  defaultUser (uid, gid) {
    return {
      gid,
      uid,
      s: '', // spouse 伴侣 ID
      wait: '', // 等待回应的目标 ID
      money: 1000,
      love: 0,
      marriage_time: 0,
      breakup_time: 0,
      nicknames: { my_to_spouse: '', spouse_to_me: '' },
      extra: {},
      updated_at: Date.now()
    }
  }

  /**
   * 保存用户数据并双向同步伴侣
   */
  async saveUser (uid, gid, data) {
    uid = String(uid).trim()
    gid = String(gid).trim()

    try {
      const key = `akasha:user:${gid}:${uid}`
      const serialized = JSON.stringify(data)
      await redis.set(key, serialized)

      // 如果用户有伴侣，同步伴侣数据到当前群组
      if (data.s) {
        const spouseKey = `akasha:user:${gid}:${data.s}`
        const spouseData = await redis.get(spouseKey)
        if (spouseData) {
          const spouseObj = JSON.parse(spouseData)
          if (spouseObj.s !== uid) {
            spouseObj.s = uid
            spouseObj.updated_at = Date.now()
            await redis.set(spouseKey, JSON.stringify(spouseObj))
          }
        } else {
          // 伴侣数据不存在，创建默认数据
          const newSpouseData = this.defaultUser(data.s, gid)
          newSpouseData.s = uid
          newSpouseData.marriage_time = data.marriage_time || Date.now()
          await redis.set(spouseKey, JSON.stringify(newSpouseData))
        }
      }
    } catch (err) {
      logger.error('[虚空终端] 保存用户数据失败:', err)
    }
  }

  /**
   * 扫描 Redis 键
   */
  async scanKeys (pattern) {
    const keys = []
    let cursor = 0
    do {
      const result = await redis.scan(cursor, { MATCH: pattern, COUNT: 1000 })
      cursor = result.cursor
      keys.push(...result.keys)
    } while (cursor !== '0')
    return keys
  }

  /**
   * 获取扩展维度数据
   */
  async getDim (uid, gid, dim, defaultValue = null) {
    try {
      const key = `akasha:dim:${gid}:${uid}:${dim}`
      const data = await redis.get(key)
      return data ? JSON.parse(data) : defaultValue
    } catch {
      return defaultValue
    }
  }

  /**
   * 设置扩展维度数据
   */
  async setDim (uid, gid, dim, value) {
    try {
      const key = `akasha:dim:${gid}:${uid}:${dim}`
      await redis.set(key, JSON.stringify(value))
    } catch (err) {
      logger.error('[虚空终端] 设置维度数据失败:', err)
    }
  }

  /**
   * 检查冷却时间
   */
  async checkCooldown (key) {
    try {
      const expireTs = await redis.get(`akasha:cd:${key}`)
      if (expireTs) {
        const expire = parseInt(expireTs)
        if (expire > Date.now()) {
          return Math.ceil((expire - Date.now()) / 1000)
        }
      }
      return 0
    } catch {
      return 0
    }
  }

  /**
   * 设置冷却时间
   */
  async setCooldown (key, seconds) {
    try {
      const expireTs = Date.now() + seconds * 1000
      await redis.set(`akasha:cd:${key}`, expireTs.toString(), { EX: seconds })
    } catch (err) {
      logger.error('[虚空终端] 设置冷却失败:', err)
    }
  }

  /**
   * 获取群组所有用户
   */
  async getAllUsers (gid) {
    try {
      const pattern = `akasha:user:${gid}:*`
      const keys = await this.scanKeys(pattern)
      const users = []
      for (const key of keys) {
        const data = await redis.get(key)
        if (data) {
          users.push(JSON.parse(data))
        }
      }
      return users
    } catch {
      return []
    }
  }

  /**
   * 添加群组记录
   */
  async addGroup (gid, umo) {
    try {
      const key = `akasha:group:${gid}`
      await redis.set(key, JSON.stringify({ gid, umo, updated_at: Date.now() }))
    } catch (err) {
      logger.error('[虚空终端] 添加群组失败:', err)
    }
  }

  /**
   * 获取群名片缓存
   */
  async getNameCache (gid, uid) {
    try {
      const key = `akasha:name:${gid}:${uid}`
      return await redis.get(key)
    } catch {
      return null
    }
  }

  /**
   * 设置群名片缓存
   */
  async setNameCache (gid, uid, name) {
    try {
      const key = `akasha:name:${gid}:${uid}`
      await redis.set(key, name, { EX: 3600 })
    } catch (err) {
      logger.error('[虚空终端] 设置名片缓存失败:', err)
    }
  }

  /**
   * 删除用户数据
   */
  async deleteUser (uid, gid) {
    try {
      const key = `akasha:user:${gid}:${uid}`
      await redis.del(key)
    } catch (err) {
      logger.error('[虚空终端] 删除用户失败:', err)
    }
  }

  /**
   * 获取所有情侣
   */
  async getAllCouples (gid) {
    try {
      const users = await this.getAllUsers(gid)
      const couples = []
      const seen = new Set()

      for (const user of users) {
        if (user.s && !seen.has(user.uid) && !seen.has(user.s)) {
          couples.push({
            uid1: user.uid,
            uid2: user.s,
            marriage_time: user.marriage_time,
            love: user.love
          })
          seen.add(user.uid)
          seen.add(user.s)
        }
      }

      return couples
    } catch {
      return []
    }
  }

  /**
   * 备份数据库
   */
  async backup () {
    try {
      const backupDir = path.join(process.cwd(), 'data', 'trss-akasha-terminal', 'backups')
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true })
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const backupFile = path.join(backupDir, `akasha_backup_${timestamp}.json`)

      const keys = await this.scanKeys('akasha:user:*')
      const data = {}

      for (const key of keys) {
        const value = await redis.get(key)
        if (value) {
          data[key] = value
        }
      }

      fs.writeFileSync(backupFile, JSON.stringify(data, null, 2))
      return backupFile
    } catch (err) {
      logger.error('[虚空终端] 备份失败:', err)
      return null
    }
  }
}
