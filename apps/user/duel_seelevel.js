import { BotApi, AlemonApi, plugin } from '../../model/api/api.js'
import fs from 'fs'
import path from 'path'
import dataManager from '../../components/data_manager.js'

/**
 * 用户等级查询功能
 * 提供用户等级、经验、境界信息查询
 */

// 配置常量
const CONFIG = {
    DATA_PATH: 'plugins/trss-akasha-terminal-plugin/data/',
    DATA_FILE: 'battle.json'
}

// 用户数据模板
const USER_TEMPLATE = {
    experience: 0,
    level: 0,
    levelname: '无等级',
    Privilege: 0
}

export class UserLevelQuery extends plugin {
    constructor() {
        super({
            name: '用户等级查询',
            dsc: '查询用户等级、经验和境界信息',
            event: 'message',
            priority: 1,
            rule: [
                {
                    reg: '^#我的(等级|经验)$',
                    fnc: 'queryLevel'
                },
                {
                    reg: '^#我的境界$',
                    fnc: 'queryRealm'
                }
            ]
        })
    }

    /**
     * 确保数据目录和文件存在
     */
    async ensureDataFile() {
        const dirPath = CONFIG.DATA_PATH
        const filePath = path.join(dirPath, CONFIG.DATA_FILE)
        
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true })
        }
        
        if (!fs.existsSync(filePath)) {
            await dataManager.saveJsonData(filePath, {})
        }
        
        return filePath
    }

    /**
     * 获取用户数据
     * @param {string} userId 用户ID
     * @returns {Object} 用户数据
     */
    async getUserData(userId) {
        try {
            const filePath = await this.ensureDataFile()
            const data = await dataManager.loadJsonData(filePath)
            
            if (!data[userId]) {
                data[userId] = { ...USER_TEMPLATE }
                await dataManager.saveJsonData(filePath, data)
            }
            
            // 确保经验值不为负数
            if (data[userId].experience < 0) {
                data[userId].experience = 0
                await dataManager.saveJsonData(filePath, data)
            }
            
            return data[userId]
        } catch (error) {
            console.error('[等级查询] 获取用户数据失败:', error)
            return { ...USER_TEMPLATE }
        }
    }

    /**
     * 查询用户等级和经验
     * @param {Object} e 消息事件对象
     */
    async queryLevel(e) {
        try {
            const userData = await this.getUserData(e.user_id)
            const privilegeText = userData.Privilege === 1 ? '是' : '否'
            
            const msg = [
                '📊 等级信息',
                '─────────────',
                `🎯 等级: ${userData.level}`,
                `⭐ 经验: ${userData.experience}`,
                `🔧 特权: ${privilegeText}`
            ].join('\n')
            
            await e.reply(msg)
        } catch (error) {
            console.error('[等级查询] 查询失败:', error)
            await e.reply('查询等级信息失败，请稍后重试')
        }
        return true
    }

    /**
     * 查询用户境界
     * @param {Object} e 消息事件对象
     */
    async queryRealm(e) {
        try {
            const userData = this.getUserData(e.user_id)
            const privilegeText = userData.Privilege === 1 ? '是' : '否'
            
            const msg = [
                '🏮 境界信息',
                '─────────────',
                `⚡ 境界: ${userData.levelname}`,
                `🔥 内力: ${userData.experience}`,
                `🔧 特权: ${privilegeText}`
            ].join('\n')
            
            await e.reply(msg)
        } catch (error) {
            console.error('[境界查询] 查询失败:', error)
            await e.reply('查询境界信息失败，请稍后重试')
        }
        return true
    }
}

export default UserLevelQuery