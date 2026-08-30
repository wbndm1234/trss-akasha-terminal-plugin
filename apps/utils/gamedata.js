/**
 * 游戏数据加载工具
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const gamedata = {
  /**
   * 加载 JSON 数据文件
   * @param {string} name - 数据文件名（不含扩展名）
   * @param {*} defaultValue - 默认值
   * @returns {*} 加载的数据或默认值
   */
  load (name, defaultValue = null) {
    try {
      const dataPath = path.join(
        process.cwd(),
        'plugins',
        'trss-akasha-terminal-plugin',
        'config',
        'resources',
        `${name}.json`
      )

      if (fs.existsSync(dataPath)) {
        const content = fs.readFileSync(dataPath, 'utf8')
        return JSON.parse(content)
      }

      return defaultValue
    } catch (err) {
      logger.error('[虚空终端] 加载游戏数据失败:', name, err)
      return defaultValue
    }
  },

  /**
   * 保存 JSON 数据文件
   * @param {string} name - 数据文件名
   * @param {*} data - 要保存的数据
   */
  save (name, data) {
    try {
      const dataPath = path.join(
        process.cwd(),
        'plugins',
        'trss-akasha-terminal-plugin',
        'config',
        'resources',
        `${name}.json`
      )

      const dir = path.dirname(dataPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8')
    } catch (err) {
      logger.error('[虚空终端] 保存游戏数据失败:', name, err)
    }
  }
}
