import { BotApi, AlemonApi, plugin } from '../../model/api/api.js'
import fs from 'fs'
import path from 'path'
import cfg from '../../../../lib/config/config.js'
import moment from 'moment'
import dataManager from '../../components/data_manager.js'

// 兼容segment
if (!global.segment) {
    try {
        global.segment = (await import("icqq")).segment
    } catch {
        global.segment = {
            at: (qq) => `[CQ:at,qq=${qq}]`,
            image: (url) => `[CQ:image,file=${url}]`
        }
    }
}

// 获取redis实例
const redis = cfg.redis

// 内存缓存作为redis备选方案
const memoryCache = new Map()

// Redis可用性检查
const isRedisAvailable = () => {
    return redis && typeof redis.get === 'function' && typeof redis.set === 'function'
}

// 配置常量
const CONFIG = {
    DATA_PATH: 'plugins/trss-akasha-terminal-plugin/data/',
    DATA_FILE: 'battle.json',
    cooldowns: {
        exercise: 30 * 60, // 30分钟
        breakthrough: 30 * 60     // 30分钟
    },
    REDIS_KEYS: {
        EXERCISE_CD: 'duel:exercise-cd:',
        BREAK_CD: 'duel:break-cd:'
    }
}

// 等级配置
const LEVEL_CONFIG = {
    NAMES: [
        '无内力',
        '小乘境初期', '小乘境中期', '小乘境后期', '小乘境巅峰',
        '大乘境初期', '大乘境中期', '大乘境后期', '大乘境巅峰',
        '宗师境初期', '宗师境中期', '宗师境后期', '宗师境巅峰',
        '至臻境初期', '至臻境中期', '至臻境后期', '至臻境巅峰'
    ],
    EXPERIENCE_REQUIREMENTS: [0, 5, 10, 20, 30, 40, 55, 70, 85, 100, 125, 150, 175, 200, 230, 260, 290, 320],
    getExperienceForLevel(level) {
        if (level < this.EXPERIENCE_REQUIREMENTS.length) {
            return this.EXPERIENCE_REQUIREMENTS[level]
        }
        // 320 + (level - 17) * 80
        return 320 + (level - 17) * 80
    },
    getRequiredExperience(level) {
        return this.getExperienceForLevel(level)
    },
    getLevelName(level) {
        if (level < this.NAMES.length) {
            return this.NAMES[level]
        }
        const transcendentLevel = level - 16
        return `返璞归真第${transcendentLevel}重`
    },
    getMaxLevel() {
        return 50 // 设置最大等级
    }
}

// 用户模板
const USER_TEMPLATE = {
    experience: 0,
    level: 0,
    levelname: '无等级',
    Privilege: 0
}

/**
 * 数据管理器
 */
class DataManager {
    /**
     * 获取文件路径
     */
    static getFilePath() {
        return path.join(CONFIG.DATA_PATH, CONFIG.DATA_FILE)
    }

    /**
     * 确保数据目录存在
     */
    static ensureDataDir() {
        if (!fs.existsSync(CONFIG.DATA_PATH)) {
            fs.mkdirSync(CONFIG.DATA_PATH, { recursive: true })
        }
    }

    /**
     * 加载数据文件
     * @returns {Object} 数据对象
     */
    static async loadData() {
        try {
            this.ensureDataDir()
            const filePath = this.getFilePath()
            
            if (!fs.existsSync(filePath)) {
                await dataManager.saveJsonData(filePath, {})
                return {}
            }
            
            return await dataManager.loadJsonData(filePath)
        } catch (error) {
            console.error('加载数据失败:', error)
            return {}
        }
    }

    /**
     * 保存数据到文件
     * @param {Object} data 要保存的数据
     * @returns {boolean} 保存是否成功
     */
    static async saveData(data) {
        try {
            this.ensureDataDir()
            const filePath = this.getFilePath()
            await dataManager.saveJsonData(filePath, data)
            return true
        } catch (error) {
            console.error('保存数据失败:', error)
            return false
        }
    }

    /**
     * 获取用户数据
     * @param {string} userId 用户ID
     * @returns {Object} 用户数据对象
     */
    static async getUserData(userId) {
        const data = await this.loadData()
        if (!data[userId]) {
            data[userId] = { ...USER_TEMPLATE }
            await this.saveData(data)
        }
        return data[userId]
    }

    /**
     * 更新用户数据
     * @param {string} userId 用户ID
     * @param {Object} updates 要更新的数据
     * @returns {Object} 更新后的用户数据
     */
    static async updateUserData(userId, updates) {
        const data = await this.loadData()
        if (!data[userId]) {
            data[userId] = { ...USER_TEMPLATE }
        }
        Object.assign(data[userId], updates)
        await this.saveData(data)
        return data[userId]
    }

    /**
     * 获取所有用户数据
     * @returns {Object} 所有用户数据
     */
    static getAllUserData() {
        return this.loadData()
    }
}

/**
 * 冷却时间管理器
 */
class CooldownManager {
    /**
     * 检查冷却时间
     * @param {string} userId 用户ID
     * @param {string} type 冷却类型 (exercise, breakthrough)
     * @returns {number} 剩余冷却时间（秒），0表示无冷却
     */
    static async checkCooldown(userId, type) {
        const key = `duel:${type}-cd:${userId}`
        let lastTime
        
        // 根据redis可用性选择存储方式
        if (isRedisAvailable()) {
            lastTime = await redis.get(key)
        } else {
            lastTime = memoryCache.get(key)
            console.log(`[虚空终端] Redis不可用，使用内存缓存检查冷却时间: ${key}`)
        }
        
        if (!lastTime) return 0
        
        const cooldownTime = CONFIG.cooldowns[type]
        const elapsed = moment().diff(moment(lastTime), 'seconds')
        const remaining = cooldownTime - elapsed
        
        return remaining > 0 ? remaining : 0
    }
    
    /**
     * 设置冷却时间
     * @param {string} userId 用户ID
     * @param {string} type 冷却类型
     */
    static async setCooldown(userId, type) {
        const key = `duel:${type}-cd:${userId}`
        const cooldownTime = CONFIG.cooldowns[type]
        const currentTime = moment().format()
        
        // 根据redis可用性选择存储方式
        if (isRedisAvailable()) {
            await redis.set(key, currentTime, {
                EX: cooldownTime
            })
        } else {
            memoryCache.set(key, currentTime)
            console.log(`[虚空终端] Redis不可用，使用内存缓存设置冷却时间: ${key}`)
            
            // 内存缓存定时清理
            setTimeout(() => {
                memoryCache.delete(key)
            }, cooldownTime * 1000)
        }
    }
    
    /**
     * 清除冷却时间
     * @param {string} userId 用户ID
     * @param {string} type 冷却类型
     */
    static async clearCooldown(userId, type) {
        const key = `duel:${type}-cd:${userId}`
        await redis.del(key)
    }
}

class ExperienceCalculator {
    /**
     * 计算突破成功率
     */
    static calculateBreakthroughChance(currentLevel, experience) {
        const requiredExp = LEVEL_CONFIG.getRequiredExperience(currentLevel + 1)
        if (experience < requiredExp) return 0
        
        // 基础成功率 + 超出经验的加成
        const baseChance = 0.6
        const excessExp = experience - requiredExp
        const bonus = Math.min(excessExp / requiredExp * 0.3, 0.3)
        
        return Math.min(baseChance + bonus, 0.9)
    }
    
    /**
     * 计算突破时间
     */
    static calculateBreakthroughTime(level) {
        return Math.floor(10 + level * 2 + Math.random() * 5)
    }
    
    /**
     * 检查是否可以突破
     */
    static canBreakthrough(level, experience) {
        const requiredExp = LEVEL_CONFIG.getRequiredExperience(level + 1)
        return experience >= requiredExp
    }
    
    /**
     * 计算修炼经验奖励
     */
    static calculateExerciseReward(hour, exerciseType, isMaster) {
        let baseReward = 0
        
        switch (exerciseType) {
            case 'morning':
                if (hour >= 6 && hour <= 8) {
                    baseReward = Math.round(3 + 2 * Math.random())
                } else {
                    baseReward = Math.round(1 + 1 * Math.random())
                }
                break
                
            case 'sleep':
                if (hour >= 20 && hour <= 22) {
                    baseReward = Math.round(5 + 5 * Math.random())
                } else if (hour >= 12 && hour <= 14) {
                    baseReward = Math.round(3 + 3 * Math.random())
                } else if (hour > 23 || hour <= 5) {
                    baseReward = Math.round(3 + 3 * Math.random())
                }
                break
                
            case 'pill':
                if (isMaster) {
                    baseReward = 100
                } else {
                    baseReward = -1 // 走火入魔
                }
                break
                
            default: // normal
                if (hour >= 6 && hour <= 8) {
                    baseReward = Math.round(2 + 2 * Math.random())
                } else if (hour >= 8 && hour <= 20) {
                    baseReward = Math.round(1 + 2 * Math.random())
                } else {
                    baseReward = Math.round(1 + 1 * Math.random())
                }
        }
        
        // 主人额外奖励（丹药除外）
        if (isMaster && exerciseType !== 'pill') {
            baseReward += baseReward * 2
        }
        
        return baseReward
    }

    /**
     * 获取突破成功率（旧版本兼容）
     */
    static getBreakSuccessRate(level) {
        return level < 16 ? 100 - level * 3 : 52 - level * 1
    }

    static getRequiredExperience(experience, level) {
        const requiredExp = LEVEL_CONFIG.getExperienceForLevel(level + 1)
        return requiredExp - experience
    }
}
export class duel_exercise extends plugin {
    constructor() {
        super({
            name: '修炼',
            dsc: '武侠修炼系统 - 支持修炼、突破、查看境界列表',
            event: 'message',
            priority: 1,
            rule: [
                {
                    reg: "^#(发起|开始)?(晨练|早|锻炼|早睡|睡觉|修炼|服用丹药)(.*)$",
                    fnc: 'exercise'
                },
                {
                    reg: "^#闭关突破$",
                    fnc: 'breakthrough'
                },
                {
                    reg: "^#(决斗|武侠)境界列表$",
                    fnc: 'listLevels'
                },
                {
                    reg: "^#(修炼|武侠)状态$",
                    fnc: 'status'
                }
            ]
        })
    }

    /**
     * 显示境界列表
     */
    async listLevels(e) {
        const levelList = LEVEL_CONFIG.NAMES.slice(1).join('\n') + '\n返璞归真第N重...'
        await e.reply(`🏮 武侠境界列表 🏮\n\n${levelList}`)
        return true
    }

    /**
     * 查看修炼状态
     */
    async status(e) {
        const userData = await DataManager.getUserData(e.user_id)
        const levelName = LEVEL_CONFIG.getLevelName(userData.level)
        const nextLevelExp = LEVEL_CONFIG.getExperienceForLevel(userData.level + 1)
        const requiredExp = nextLevelExp - userData.experience
        
        const statusMsg = [
            `🧘‍♂️ ${e.sender.nickname || e.user_id} 的修炼状态`,
            `\n📊 当前境界：${levelName}`,
            `\n⚡ 内力值：${userData.experience}`,
            `\n🎯 下一境界需要：${nextLevelExp}`,
            `\n📈 还需修炼：${requiredExp > 0 ? requiredExp : 0} 点内力`
        ]
        
        await e.reply(statusMsg)
        return true
    }
    /**
     * 闭关突破
     */
    async breakthrough(e) {
        console.log("用户命令：", e.msg)
        const userId = e.user_id
        
        // 检查冷却时间
        const remainingCooldown = await CooldownManager.checkCooldown(userId, 'break')
        if (remainingCooldown) {
            const tips = [
                global.segment.at(userId),
                "\n你刚刚进行了一次突破!(*/ω＼*)",
                `\n冷却中：${remainingCooldown}s`
            ]
            await e.reply(tips)
            return false
        }
        
        // 获取用户数据
        const userData = await DataManager.getUserData(userId)
        
        // 检查是否可以突破
        if (!ExperienceCalculator.canBreakthrough(userData.experience, userData.level)) {
            const requiredExp = ExperienceCalculator.getRequiredExperience(userData.experience, userData.level)
            await e.reply(`修为不足，还差${requiredExp}点内力，请再接再厉！`)
            return false
        }
        // 设置冷却时间
        await CooldownManager.setCooldown(userId, 'break')
        
        // 更新等级名称
        userData.levelname = LEVEL_CONFIG.getLevelName(userData.level)
        
        // 确保经验值不为负
        if (userData.experience < 0) {
            userData.experience = 0
        }
        
        // 计算突破成功率和时间
        const successRate = ExperienceCalculator.getBreakSuccessRate(userData.level)
        const breakthroughTime = 3 * (userData.level + 1)
        
        await e.reply(`🧘‍♂️ 当前境界：${userData.levelname}\n⏱️ 突破时间：${breakthroughTime}秒\n🎯 成功概率：${successRate}%\n\n开始闭关突破......`)
        
        // 判断突破是否成功
        const random = Math.random() * 100
        const isSuccess = random <= successRate
        
        if (!isSuccess) {
            setTimeout(async () => {
                await e.reply('💔 突破失败，请努力修行！')
            }, breakthroughTime * 1000)
        } else {
            // 突破成功
            setTimeout(async () => {
                userData.level++
                userData.levelname = LEVEL_CONFIG.getLevelName(userData.level)
                await DataManager.updateUserData(userId, userData)
                await e.reply(`🎉 突破成功！当前境界：${userData.levelname}`)
            }, breakthroughTime * 1000)
        }
        
        // 保存当前数据
        await DataManager.updateUserData(userId, userData)
        return true
    }
    /**
     * 修炼功能
     */
    async exercise(e) {
        console.log("用户命令：", e.msg)
        const userId = e.user_id
        
        // 检查冷却时间
        const remainingCooldown = await CooldownManager.checkCooldown(userId, 'exercise')
        if (remainingCooldown) {
            const tips = [
                global.segment.at(userId),
                "\n你刚刚进行了一次锻炼!(*/ω＼*)",
                `\n冷却中：${remainingCooldown}s`
            ]
            await e.reply(tips)
            return false
        }
        
        // 获取用户数据
        const userData = await DataManager.getUserData(userId)
        
        // 设置冷却时间
        await CooldownManager.setCooldown(userId, 'exercise')
        
        // 确定修炼类型
        const hour = new Date().getHours()
        let exerciseType = 'normal'
        
        if (e.msg.includes('早') || e.msg.includes('晨练')) {
            exerciseType = 'morning'
        } else if (e.msg.includes('睡觉') || e.msg.includes('早睡')) {
            exerciseType = 'sleep'
        } else if (e.msg.includes('丹药')) {
            exerciseType = 'pill'
        }
        
        // 计算经验奖励
        const experienceGain = ExperienceCalculator.calculateExerciseReward(hour, exerciseType, e.isMaster)
        
        // 更新经验值
        userData.experience += experienceGain
        userData.levelname = LEVEL_CONFIG.getLevelName(userData.level)
        
        // 生成回复消息
        const replyMessage = this.generateExerciseReply(userId, exerciseType, hour, experienceGain, userData, e.isMaster)
        
        // 处理特殊效果（禁言）
        if (exerciseType === 'sleep' && e.group) {
            this.handleSleepMute(e, userId, hour)
        }
        
        // 发送回复
        await e.reply(replyMessage)
        
        // 主人额外奖励提示
        if (e.isMaster && exerciseType !== 'pill') {
            await e.reply('🎁 给主人发放了额外奖励哦！')
        }
        
      
        await DataManager.updateUserData(userId, userData)
        return true
    }
    
    /**
     * 生成修炼回复消息
     */
    generateExerciseReply(userId, exerciseType, hour, experienceGain, userData, isMaster) {
        const baseMessage = [
            global.segment.at(userId),
            `\n⚡ 内力值：${userData.experience}`,
            `\n🏮 当前境界：${userData.levelname}`
        ]
        
        let prefix = ''
        
        switch (exerciseType) {
            case 'morning':
                if (hour >= 6 && hour <= 8) {
                    prefix = `🌅 恭喜你获得了${experienceGain}点内力！一日之计在于晨，清晨修炼效果更好哦！`
                } else {
                    prefix = `⏰ 现在一点也不早了，你只获得了${experienceGain}点内力。`
                }
                break
            case 'sleep':
                if (hour >= 20 && hour <= 22) {
                    prefix = `🌙 早睡早起好习惯，恭喜你获得了${experienceGain}点内力！`
                } else if (hour >= 12 && hour <= 14) {
                    prefix = `😴 恭喜你获得了${experienceGain}点内力，睡个午觉吧！`
                } else if (hour > 23 || hour <= 5) {
                    prefix = `🌃 现在睡觉一点也不早了，你只获得了${experienceGain}点内力，快去睡觉吧！`
                }
                break
            case 'pill':
                if (isMaster) {
                    prefix = `💊 服用丹药成功，你获得了${experienceGain}点内力！`
                } else {
                    prefix = `💥 没有得到祝福，你服用丹药失败，走火入魔损失了${Math.abs(experienceGain)}点内力！`
                }
                break
            default:
                if (hour >= 6 && hour <= 8) {
                    prefix = `🌅 恭喜你获得了${experienceGain}点内力！一日之计在于晨，清晨修炼效果更好哦！`
                } else if (hour >= 8 && hour <= 20) {
                    prefix = `🎉 恭喜你获得了${experienceGain}点内力！`
                } else {
                    prefix = `🌙 由于熬夜，你只获得了${experienceGain}点内力！`
                }
        }
        
        return [prefix, ...baseMessage]
    }
    
    /**
     * 处理睡觉禁言
     */
    handleSleepMute(e, userId, hour) {
        try {
            if (hour >= 20 && hour <= 22) {
                e.group.muteMember(userId, 60 * 60 * 8) // 8小时
            } else if (hour >= 12 && hour <= 14) {
                e.group.muteMember(userId, 60 * 60 * 1) // 1小时
            } else if (hour > 23 || hour <= 5) {
                e.group.muteMember(userId, 60 * 60 * 6) // 6小时
            }
        } catch (error) {
            console.error('禁言失败:', error)
        }
    }
}

export default duel_exercise
