import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * 渲染器 - 支持本地 Playwright 渲染和纯文本降级
 */
export class Renderer {
  constructor () {
    this.screenshotDir = path.join(process.cwd(), 'data', 'trss-akasha-terminal', 'screenshots')
    this.ensureDir()
    this.enabled = true
  }

  /**
   * 确保目录存在
   */
  ensureDir () {
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true })
    }
  }

  /**
   * 渲染 HTML 模板
   * @param {string} tmplName - 模板名称（不含扩展名）
   * @param {object} data - 模板数据
   * @returns {Promise<string|null>} 图片路径或 null
   */
  async render (tmplName, data) {
    if (!this.enabled) {
      return null
    }

    try {
      const templatePath = path.join(
        process.cwd(),
        'plugins',
        'trss-akasha-terminal-plugin',
        'resources',
        'templates',
        `${tmplName}.html`
      )

      if (!fs.existsSync(templatePath)) {
        logger.warn(`[虚空终端] 模板不存在：${templatePath}`)
        return null
      }

      const htmlContent = fs.readFileSync(templatePath, 'utf8')
      const renderedHtml = this.interpolate(htmlContent, data)

      // 使用 Yunzai 的 puppeteer 渲染
      const browser = await this.getBrowser()
      if (!browser) {
        return null
      }

      const page = await browser.newPage()
      await page.setContent(renderedHtml, { waitUntil: 'networkidle0' })
      
      const timestamp = Date.now()
      const filename = `${tmplName}_${timestamp}.png`
      const filepath = path.join(this.screenshotDir, filename)

      await page.setViewport({ width: 800, height: 600 })
      await page.screenshot({ path: filepath, fullPage: true })
      
      await page.close()

      return filepath
    } catch (err) {
      logger.error('[虚空终端] 渲染失败:', err)
      return null
    }
  }

  /**
   * 简单的模板插值
   */
  interpolate (html, data) {
    return html.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = data[key]
      if (value === undefined) return match
      if (typeof value === 'object') return JSON.stringify(value)
      return String(value)
    })
  }

  /**
   * 获取浏览器实例
   */
  async getBrowser () {
    try {
      // 尝试使用 Yunzai 的 puppeteer
      if (global.puppeteer) {
        return global.puppeteer
      }

      // 动态导入
      const puppeteer = await import('puppeteer')
      return await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      })
    } catch {
      this.enabled = false
      return null
    }
  }

  /**
   * 生成文本消息（降级方案）
   */
  formatText (template, data) {
    let text = template
    for (const [key, value] of Object.entries(data)) {
      text = text.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value))
    }
    return text
  }

  /**
   * 关闭渲染器
   */
  async close () {
    // 清理资源
    this.enabled = false
  }
}
