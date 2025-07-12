import fs from 'fs'
import moment from 'moment'
import dataManager from './data_manager.js'
import path from 'path'
import cfg from '../../../lib/config/config.js'
import cooldownConfig from './cooldown_config.js'

const redis = cfg.redis
const memoryCache = new Map()

// 检查Redis
function isRedisAvailable() {
    return redis && typeof redis.get === 'function'
}


export class TextHelper {
    
    // ============ 1 ============
    
    /**
     * 获取关系状态
     */
    static getRelationshipStatus(love) {
        if (love >= 5000) return '生死相依'
        if (love >= 3000) return '海誓山盟'
        if (love >= 2000) return '情深意重'
        if (love >= 1000) return '情投意合'
        if (love >= 500) return '两情相悦'
        if (love >= 200) return '初见倾心'
        if (love >= 100) return '好感初生'
        if (love >= 50) return '略有好感'
        return '初识阶段'
    }
    
    /**
     * 显示约会结果文本
     */
    static showDateResultText(e, data) {
        let msg = ['💕 约会结果 💕\n']
        msg.push('━━━━━━━━━━━━━━━━')
        msg.push(`👤 ${data.username} | 等级: ${data.level} | 💰 ${data.money} 金币`)
        msg.push(`💑 与 ${data.wifeName} 的约会`)
        msg.push(`💖 恋爱天数: ${data.loveDays} 天 | 亲密度: ${data.intimacy}`)
        msg.push('━━━━━━━━━━━━━━━━')
        msg.push(`🎯 约会活动: ${data.dateEvent.name}`)
        msg.push(`📝 ${data.dateEvent.description}`)
        msg.push(`🎉 ${data.dateEvent.resultMessage}`)
        if (data.dateEvent.success) {
            msg.push(`💖 获得好感度: +${data.dateEvent.loveGain}`)
        }
        msg.push(`💰 花费: ${data.dateEvent.moneyCost} 金币`)
        msg.push('━━━━━━━━━━━━━━━━')
        msg.push('💡 #约会 - 再次约会（1小时冷却）')
        
        e.reply(msg.join('\n'))
    }

    /**
     * 显示情侣任务文本
     */
    static showCoupleTaskText(e, data) {
        let msg = ['💑 情侣任务 💑\n']
        msg.push('━━━━━━━━━━━━━')
        msg.push(`👤 ${data.username} | 等级: ${data.level}`)
        msg.push(`💑 与 ${data.wifeName} 的情侣任务`)
        msg.push(`💖 恋爱天数: ${data.loveDays} 天 | 亲密度: ${data.intimacy}`)
        msg.push('━━━━━━━━━━━━━')
        msg.push(`🎯 任务: ${data.coupleTask.name}`)
        msg.push(`📝 ${data.coupleTask.description}`)
        msg.push(`🎉 ${data.coupleTask.resultMessage}`)
        if (data.coupleTask.success) {
            msg.push(`💖 获得好感度: +${data.coupleTask.loveGain}`)
            msg.push(`💰 获得金币: +${data.coupleTask.moneyGain}`)
        }
        msg.push('━━━━━━━━━━━━━')
        msg.push('💡 #情侣任务 - 执行新的情侣任务')
        
        e.reply(msg.join('\n'))
    }

    /**
     * 显示表白结果文本
     */
    static showConfessionResultText(e, data) {
        let msg = ['💌 表白结果 💌\n']
        msg.push('━━━━━━━━━━━━━━━━')
        msg.push(`👤 ${data.username} | 等级: ${data.level}`)
        msg.push(`💕 向 ${data.targetName} 表白`)
        msg.push('━━━━━━━━━━━━━━━━')
        msg.push(`💝 表白方式: ${data.confessionEvent.name}`)
        msg.push(`📝 ${data.confessionEvent.description}`)
        msg.push(`🎉 ${data.confessionEvent.resultMessage}`)
        if (data.confessionEvent.success) {
            msg.push('🎊 恭喜！表白成功！')
        } else {
            msg.push('💔 表白失败，但不要放弃！')
        }
        msg.push('━━━━━━━━━━━━━━━━')
        msg.push('💡 #表白 @对象 - 向某人表白（30分钟冷却）')
        
        e.reply(msg.join('\n'))
    }
    
    /**
     * 显示单身状态文本
     */
    static showSingleStatusText(e, data) {
        let msg = ['💔 单身状态 💔\n']
        msg.push('━━━━━━━━━━━━━━━━')
        msg.push(`👤 ${data.username} | 等级: ${data.level} | 💰 ${data.money} 金币`)
        msg.push('💔 目前单身中')
        msg.push('━━━━━━━━━━━━━━━━')
        msg.push('💡 #表白 @对象 - 向某人表白')
        msg.push('💡 #求婚 @对象 - 向某人求婚')
        
        e.reply(msg.join('\n'))
    }
    
    /**
     * 显示CP银行文本
     */
    static showLoveBankText(e, data) {
        let msg = ['💖 CP银行 💖\n']
        msg.push('━━━━━━━━━━━━━━━━')
        msg.push(`👤 ${data.username}`)
        msg.push(`💰 当前余额: ${data.balance} 爱心`)
        msg.push(`📈 今日利息: ${data.interest} 爱心`)
        msg.push('━━━━━━━━━━━━━━━━')
        msg.push('💡 #存爱心 [数量] - 存入爱心获得利息')
        msg.push('💡 #取爱心 [数量] - 提取爱心')
        
        e.reply(msg.join('\n'))
    }
    
    /**
     * 显示情侣排行文本
     */
    static showCoupleRankingText(e, data) {
        let msg = ['💑 情侣排行榜 💑\n']
        msg.push('━━━━━━━━━━━━━━━━')
        
        data.couples.forEach((couple, index) => {
            const rank = index + 1
            const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`
            msg.push(`${medal} ${couple.user1} ❤️ ${couple.user2}`)
            msg.push(`   💖 亲密度: ${couple.intimacy} | 恋爱天数: ${couple.days}天`)
        })
        
        msg.push('━━━━━━━━━━━━━━━━')
        msg.push('💡 #约会 - 增加亲密度')
        
        e.reply(msg.join('\n'))
    }
    
    /**
     * 计算决斗力量
     */
    static calculateDuelPower(userData) {
        const basePower = userData.level * 10
        const lovePower = userData.love ? userData.love * 0.1 : 0
        const moneyPower = userData.money * 0.01
        return Math.floor(basePower + lovePower + moneyPower)
    }
    
    /**
     * 显示决斗结果文本
     */
    static showDuelResultText(e, data) {
        let msg = ['⚔️ 情侣决斗 ⚔️\n']
        msg.push('━━━━━━━━━━━━━━━━')
        msg.push(`👤 ${data.challenger} VS ${data.target}`)
        msg.push(`⚡ 战力: ${data.challengerPower} VS ${data.targetPower}`)
        msg.push('━━━━━━━━━━━━━━━━')
        msg.push(`🎉 ${data.resultMessage}`)
        if (data.winner) {
            msg.push(`🏆 胜利者: ${data.winner}`)
            msg.push(`💰 获得奖励: ${data.reward} 金币`)
        }
        msg.push('━━━━━━━━━━━━━━━━')
        msg.push('💡 #情侣决斗 @对象 - 挑战其他情侣')
        
        e.reply(msg.join('\n'))
    }
    
    /**
     * 显示求婚结果文本
     */
    static showProposeResultText(e, templateData, targetId, ex) {
        let msg = ['💍 求婚结果 💍\n']
        msg.push('━━━━━━━━━━━━━━━━')
        msg.push(`👤 ${templateData.username}`)
        msg.push(`💕 向 ${templateData.targetName} 求婚`)
        msg.push('━━━━━━━━━━━━━━━━')
        msg.push(`💝 求婚方式: ${templateData.proposeEvent.name}`)
        msg.push(`📝 ${templateData.proposeEvent.description}`)
        msg.push(`🎉 ${templateData.proposeEvent.resultMessage}`)
        if (templateData.proposeEvent.success) {
            msg.push('🎊 恭喜！求婚成功！')
        } else {
            msg.push('💔 求婚失败，但不要放弃！')
        }
        msg.push('━━━━━━━━━━━━━━━━')
        msg.push('💡 #求婚 @对象 - 向某人求婚（1小时冷却）')
        
        e.reply(msg.join('\n'))
    }
    
    // ============ 2 ============
    
    /**
     * 获取周开始时间
     */
    static getWeekStart() {
        const now = new Date()
        const day = now.getDay()
        const diff = now.getDate() - day + (day === 0 ? -6 : 1)
        return new Date(now.setDate(diff))
    }
    
    /**
     * 获取随机奖励
     */
    static getRandomRewards(randomItems) {
        const rewards = []
        const totalWeight = randomItems.reduce((sum, item) => sum + item.weight, 0)
        const numRewards = Math.floor(Math.random() * 3) + 1 // 1-3个奖励
        
        for (let i = 0; i < numRewards; i++) {
            const random = Math.random() * totalWeight
            let currentWeight = 0
            
            for (let item of randomItems) {
                currentWeight += item.weight
                if (random <= currentWeight) {
                    rewards.push({ id: item.id, count: item.count })
                    break
                }
            }
        }
        
        return rewards
    }
    
    /**
     * 显示每日任务文本
     */
    static showDailyQuestsText(e, data) {
        let msg = [`${data.title}\n`]
        msg.push('━━━━━━━━━━━━━━━━')
        msg.push(`👤 ${data.username} | 等级: ${data.userLevel} | 🏆 任务点数: ${data.questPoints}`)
        msg.push('━━━━━━━━━━━━━━━━')
        
        data.quests.forEach(quest => {
            msg.push(`${quest.status} ${quest.name}`)
            msg.push(`   📊 进度: ${quest.progress}/${quest.target} (${quest.progressPercent}%)`)
            msg.push(`   🎁 奖励: ${quest.rewards}`)
            msg.push('')
        })
        
        msg.push('━━━━━━━━━━━━━━━━')
        msg.push('💡 #领取任务 [任务ID] - 领取已完成的任务奖励')
        msg.push('💡 #任务商店 - 使用任务点数兑换奖励')
        
        e.reply(msg.join('\n'))
    }
    
    /**
     * 显示周常任务文本
     */
    static showWeeklyQuestsText(e, data) {
        let msg = [`${data.title}\n`]
        msg.push('━━━━━━━━━━━━━━━━')
        msg.push(`👤 ${data.username} | 等级: ${data.userLevel} | 🏆 任务点数: ${data.questPoints}`)
        msg.push('━━━━━━━━━━━━━━━━')
        
        data.quests.forEach(quest => {
            msg.push(`${quest.status} ${quest.name}`)
            msg.push(`   📊 进度: ${quest.progress}/${quest.target} (${quest.progressPercent}%)`)
            msg.push(`   🎁 奖励: ${quest.rewards}`)
            msg.push('')
        })
        
        msg.push('━━━━━━━━━━━━━━━━')
        msg.push('💡 #领取任务 [任务ID] - 领取已完成的任务奖励')
        msg.push('💡 #任务商店 - 使用任务点数兑换奖励')
        
        e.reply(msg.join('\n'))
    }
    
    /**
     * 显示特殊任务文本
     */
    static showSpecialQuestsText(e, data) {
        let msg = [`${data.title}\n`]
        msg.push('━━━━━━━━━━━━━━━━')
        msg.push(`👤 ${data.username} | 等级: ${data.userLevel} | 🏆 任务点数: ${data.questPoints}`)
        msg.push('━━━━━━━━━━━━━━━━')
        
        data.quests.forEach(quest => {
            msg.push(`${quest.status} ${quest.name}`)
            msg.push(`   📊 进度: ${quest.progress}/${quest.target} (${quest.progressPercent}%)`)
            msg.push(`   🎁 奖励: ${quest.rewards}`)
            msg.push('')
        })
        
        msg.push('━━━━━━━━━━━━━━━━')
        msg.push('💡 #领取任务 [任务ID] - 领取已完成的任务奖励')
        msg.push('💡 #任务商店 - 使用任务点数兑换奖励')
        
        e.reply(msg.join('\n'))
    }
    
    // ============ 3 ============
    
    /**
     * 获取稀有度表情符号
     */
    static getRarityEmoji(rarity) {
        const rarityMap = {
            common: '⚪',
            rare: '🔵', 
            epic: '🟣',
            legendary: '🟡',
            "普通": "⚪",
            "稀有": "🔵",
            "史诗": "🟣",
            "传说": "🟡",
            "神话": "🔴"
        }
        return rarityMap[rarity] || '⚪'
    }
    
    /**
     * 获取道具图标
     */
    static getItemIcon(type) {
        const iconMap = {
            consumable: '🍎',
            buff: '⚡',
            mystery: '🎁',
            weapon: '⚔️',
            armor: '🛡️'
        }
        return iconMap[type] || '📦'
    }
    
    /**
     * 生成签到日历
     */
    static generateSigninCalendar(signinData) {
        const days = []
        const today = moment()
        for (let i = 0; i < 7; i++) {
            const day = today.clone().subtract(6 - i, 'days')
            days.push({
                day: day.format('DD'),
                signed: i < (signinData.consecutiveDays || 0)
            })
        }
        return days
    }
    
    /**
     * 获取下次签到奖励
     */
    static getNextSigninReward(consecutiveDays) {
        const rewards = {
            0: '200-500金币',
            3: '200-500金币 + 200奖励金币',
            7: '200-500金币 + 500奖励金币'
        }
        
        if (consecutiveDays >= 7) {
            return rewards[7]
        } else if (consecutiveDays >= 3) {
            return rewards[7]
        } else {
            return rewards[3]
        }
    }
    
    // ============ 4 ============
    
    /**
     * 添加道具到背包
     */
    static async addToInventory(userId, groupId, itemId, count = 1) {
        const userInventoryPath = 'plugins/trss-akasha-terminal-plugin/data/user_inventory.json'
        const inventoryData = await dataManager.loadJsonData(userInventoryPath, {})
        const key = `${groupId}_${userId}`
        
        if (!inventoryData[key]) {
            inventoryData[key] = {}
        }
        
        inventoryData[key][itemId] = (inventoryData[key][itemId] || 0) + count
        await dataManager.saveJsonData(userInventoryPath, inventoryData)
    }
    
    /**
     * 从背包移除道具
     */
    static async removeFromInventory(userId, groupId, itemId, count = 1) {
        const userInventoryPath = 'plugins/trss-akasha-terminal-plugin/data/user_inventory.json'
        const inventoryData = await dataManager.loadJsonData(userInventoryPath, {})
        const key = `${groupId}_${userId}`
        
        if (inventoryData[key] && inventoryData[key][itemId]) {
            inventoryData[key][itemId] -= count
            if (inventoryData[key][itemId] <= 0) {
                delete inventoryData[key][itemId]
            }
            await dataManager.saveJsonData(userInventoryPath, inventoryData)
        }
    }
    
    /**
     * 获取用户背包
     */
    static async getUserInventory(userId, groupId) {
        const userInventoryPath = 'plugins/trss-akasha-terminal-plugin/data/user_inventory.json'
        const inventoryData = await dataManager.loadJsonData(userInventoryPath, {})
        const key = `${groupId}_${userId}`
        return inventoryData[key] || {}
    }
    
    /**
     * 获取用户工坊数据
     */
    static async getUserWorkshop(userId, groupId) {
        const workshopKey = `akasha:workshop:${groupId}:${userId}`
        
        // 根据redis可用性选择存储方式
        if (isRedisAvailable()) {
            const workshopData = await redis.get(workshopKey)
            
            if (workshopData) {
                return JSON.parse(workshopData)
            }
        } else {
            console.log(`[虚空终端] Redis不可用，使用内存缓存获取工坊数据: ${workshopKey}`)
            const cachedData = memoryCache.get(workshopKey)
            if (cachedData) {
                return cachedData
            }
        }
        
        const defaultWorkshop = {
            level: 1,
            exp: 0,
            synthesis_count: 0,
            success_count: 0
        }
        
        // 根据redis可用性选择存储方式
        if (isRedisAvailable()) {
            await redis.set(workshopKey, JSON.stringify(defaultWorkshop))
        } else {
            console.log(`[虚空终端] Redis不可用，使用内存缓存设置工坊数据: ${workshopKey}`)
            memoryCache.set(workshopKey, defaultWorkshop)
        }
        
        return defaultWorkshop
    }
    
    /**
     * 格式化奖励文本
     */
    static async formatRewards(rewards) {
        const parts = []
        if (rewards.money) parts.push(`💰${rewards.money}`)
        if (rewards.love) parts.push(`❤️${rewards.love}`)
        if (rewards.quest_points) parts.push(`🏆${rewards.quest_points}`)
        if (rewards.items) {
            try {
                const shopDataPath = 'plugins/trss-akasha-terminal-plugin/data/shop_data.json'
                const shopData = await dataManager.loadJsonData(shopDataPath, {})
                for (let [itemId, count] of Object.entries(rewards.items)) {
                    const itemName = shopData.items?.[itemId]?.name || `道具${itemId}`
                    parts.push(`${itemName}×${count}`)
                }
            } catch (error) {
                console.error('获取商店数据失败:', error)
                parts.push('道具奖励')
            }
        }
        return parts.join(', ')
    }

    // ============ Synthesis System Methods ============
    
    /**
     * 获取稀有度表情符号（合成系统版本）
     */
    static getSynthesisRarityEmoji(rarity) {
        const rarityMap = {
            "普通": "⚪",
            "稀有": "🔵",
            "史诗": "🟣",
            "传说": "🟡",
            "神话": "🔴"
        }
        return rarityMap[rarity] || "⚪"
    }

    /**
     * 获取用户工坊信息
     */
    static async getUserWorkshop(userId, groupId) {
        const workshopKey = `akasha:workshop:${groupId}:${userId}`
        
        // 根据redis可用性选择存储方式
        if (isRedisAvailable()) {
            const workshopData = await redis.get(workshopKey)
            
            if (workshopData) {
                return JSON.parse(workshopData)
            }
        } else {
            console.log(`[虚空终端] Redis不可用，使用内存缓存获取工坊数据: ${workshopKey}`)
            const cachedData = memoryCache.get(workshopKey)
            if (cachedData) {
                return cachedData
            }
        }
        
        const defaultWorkshop = {
            level: 1,
            exp: 0,
            synthesis_count: 0,
            success_count: 0
        }
        
        // 根据redis可用性选择存储方式
        if (isRedisAvailable()) {
            await redis.set(workshopKey, JSON.stringify(defaultWorkshop))
        } else {
            console.log(`[虚空终端] Redis不可用，使用内存缓存设置工坊数据: ${workshopKey}`)
            memoryCache.set(workshopKey, defaultWorkshop)
        }
        
        return defaultWorkshop
    }

    /**
     * 增加工坊经验
     */
    static async addWorkshopExp(userId, groupId, exp) {
        const workshop = await TextHelper.getUserWorkshop(userId, groupId)
        const oldLevel = workshop.level
        workshop.exp += exp
        
        // 检查升级
        const requiredExp = workshop.level * 100
        if (workshop.exp >= requiredExp) {
            workshop.level++
            workshop.exp -= requiredExp
            
            // 更新工坊等级任务进度
            try {
                const { QuestSystem } = await import('./quest_system.js')
                const questSystem = new QuestSystem()
                await questSystem.updateQuestProgress(userId, groupId, 'workshop_level', workshop.level, false)
            } catch (error) {
                console.error('更新工坊等级任务进度失败:', error)
            }
        }
        
        const workshopKey = `akasha:workshop:${groupId}:${userId}`
        
        // 根据redis可用性选择存储方式
        if (isRedisAvailable()) {
            await redis.set(workshopKey, JSON.stringify(workshop))
        } else {
            console.log(`[虚空终端] Redis不可用，使用内存缓存更新工坊数据: ${workshopKey}`)
            memoryCache.set(workshopKey, workshop)
        }
    }

    /**
     * 记录合成数据
     */
    static async recordSynthesis(userId, groupId, itemName, success) {
        const workshop = await TextHelper.getUserWorkshop(userId, groupId)
        workshop.synthesis_count++
        if (success) workshop.success_count++
        
        const workshopKey = `akasha:workshop:${groupId}:${userId}`
        
        // 根据redis可用性选择存储方式
        if (isRedisAvailable()) {
            await redis.set(workshopKey, JSON.stringify(workshop))
        } else {
            console.log(`[虚空终端] Redis不可用，使用内存缓存记录合成数据: ${workshopKey}`)
            memoryCache.set(workshopKey, workshop)
        }
    }

    /**
     * 记录合成历史
     */
    static async recordSynthesisHistory(userId, groupId, recipeName, resultName, success) {
        const historyKey = `akasha:synthesis-history:${groupId}:${userId}`
        
        const record = {
            recipe_name: recipeName,
            result_name: resultName,
            success: success,
            timestamp: new Date().toISOString()
        }
        
        try {
            let history = []
            
            if (isRedisAvailable()) {
                const historyData = await redis.get(historyKey)
                if (historyData) {
                    history = JSON.parse(historyData)
                }
                
                history.push(record)
                
                // 只保留最近50条记录
                if (history.length > 50) {
                    history = history.slice(-50)
                }
                
                await redis.set(historyKey, JSON.stringify(history), { EX: 2592000 }) // 30天过期
            } else {
                history = memoryCache.get(historyKey) || []
                history.push(record)
                
                if (history.length > 50) {
                    history = history.slice(-50)
                }
                
                memoryCache.set(historyKey, history)
            }
        } catch (error) {
            console.error('记录合成历史失败:', error)
        }
    }
/**
     * 获取幸运加成
     */
    static async getLuckBoost(userId, groupId) {
        if (isRedisAvailable()) {
            const luckData = await redis.get(`akasha:shop-luck:${groupId}:${userId}`)
            if (luckData) {
                const data = JSON.parse(luckData)
                return data.boost || 0
            }
        } else {
            console.log(`[虚空终端] Redis不可用，使用内存缓存获取幸运加成: ${groupId}:${userId}`)
            const luckData = memoryCache.get(`akasha:shop-luck:${groupId}:${userId}`)
            if (luckData) {
                return luckData.boost || 0
            }
        }
        return 0
    }

    /**
     * 消耗幸运加成
     */
    static async consumeLuckBoost(userId, groupId) {
        const cooldownConfig = (await import('../components/cooldown_config.js')).default
        const luckKey = `akasha:shop-luck:${groupId}:${userId}`
        
        if (isRedisAvailable()) {
            const luckData = await redis.get(luckKey)
            if (luckData) {
                const data = JSON.parse(luckData)
                data.duration -= 1
                if (data.duration <= 0) {
                    await redis.del(luckKey)
                } else {
                    const luckDuration = cooldownConfig.getShopCooldown('luck_duration', 86400)
                    await redis.set(luckKey, JSON.stringify(data), { EX: luckDuration })
                }
            }
        } else {
            console.log(`[虚空终端] Redis不可用，使用内存缓存消耗幸运加成: ${groupId}:${userId}`)
            const luckData = memoryCache.get(luckKey)
            if (luckData) {
                luckData.duration -= 1
                if (luckData.duration <= 0) {
                    memoryCache.delete(luckKey)
                } else {
                    memoryCache.set(luckKey, luckData)
                }
            }
        }
    }

    /**
     * 获取工作加成
     */
    static async getWorkBoost(userId, groupId) {
        if (isRedisAvailable()) {
            const workData = await redis.get(`akasha:shop-workboost:${groupId}:${userId}`)
            if (workData) {
                const data = JSON.parse(workData)
                return data.boost || 1
            }
        } else {
            console.log(`[虚空终端] Redis不可用，使用内存缓存获取工作加成: ${groupId}:${userId}`)
            const workData = memoryCache.get(`akasha:shop-workboost:${groupId}:${userId}`)
            if (workData) {
                return workData.boost || 1
            }
        }
        return 1
    }

    /**
     * 消耗工作加成
     */
    static async consumeWorkBoost(userId, groupId) {
        const cooldownConfig = (await import('../components/cooldown_config.js')).default
        const workKey = `akasha:shop-workboost:${groupId}:${userId}`
        
        if (isRedisAvailable()) {
            const workData = await redis.get(workKey)
            if (workData) {
                const data = JSON.parse(workData)
                data.duration -= 1
                if (data.duration <= 0) {
                    await redis.del(workKey)
                } else {
                    const workboostDuration = cooldownConfig.getShopCooldown('workboost_duration', 604800)
                    await redis.set(workKey, JSON.stringify(data), { EX: workboostDuration })
                }
            }
        } else {
            console.log(`[虚空终端] Redis不可用，使用内存缓存消耗工作加成: ${groupId}:${userId}`)
            const workData = memoryCache.get(workKey)
            if (workData) {
                workData.duration -= 1
                if (workData.duration <= 0) {
                    memoryCache.delete(workKey)
                } else {
                    memoryCache.set(workKey, workData)
                }
            }
        }
    }

    /**
     * 获取用户等级
     */
    static async getUserLevel(userId) {
        try {
            const battleDataPath = 'plugins/trss-akasha-terminal-plugin/data/battle.json'
            if (fs.existsSync(battleDataPath)) {
                const battleData = JSON.parse(fs.readFileSync(battleDataPath, 'utf8'))
                return battleData[userId]?.level || 1
            }
        } catch (error) {
            console.error('获取用户等级失败:', error)
        }
        return 1
    }

    /**
     * 获取用户金币
     */
    static async getUserMoney(userId, groupId = null) {
        try {
            // 如果没有提供groupId，尝试从当前上下文获取
            if (!groupId) {
                console.warn('getUserMoney: groupId未提供，返回默认值0')
                return 0
            }
            
            const akasha_data = (await import('../components/akasha_data.js')).default
            const filename = `${groupId}.json`
            const homejson = await akasha_data.getQQYUserHome(userId, {}, filename, false)
            return homejson[userId]?.money || 0
        } catch (error) {
            console.error('获取用户金币失败:', error)
        }
        return 0
    }

    /**
     * 获取用户数据
     */
    static async getUserData(userId, groupId = null) {
        try {
            const battleDataPath = 'plugins/trss-akasha-terminal-plugin/data/battle.json'
            let userData = {
                money: 0,
                points: 0,
                level: 1,
                experience: 0
            }
            
            // 从战斗数据获取等级和经验
            if (fs.existsSync(battleDataPath)) {
                const battleData = JSON.parse(fs.readFileSync(battleDataPath, 'utf8'))
                if (battleData[userId]) {
                    userData.level = battleData[userId].level || 1
                    userData.experience = battleData[userId].experience || 0
                }
            }
            
            // 如果提供了groupId，尝试获取金币数据
            if (groupId) {
                try {
                    const akasha_data = (await import('../components/akasha_data.js')).default
                    const filename = `${groupId}.json`
                    const homejson = await akasha_data.getQQYUserHome(userId, {}, filename, false)
                    if (homejson[userId]) {
                        userData.money = homejson[userId].money || 0
                    }
                } catch (error) {
                    console.error('获取用户金币数据失败:', error)
                }
            }
            
            return userData
        } catch (error) {
            console.error('获取用户数据失败:', error)
            return {
                money: 0,
                points: 0,
                level: 1,
                experience: 0
            }
        }
    }

    /**
     * 获取签到数据
     */
    static async getSigninData(userId, groupId) {
        const signinKey = `akasha:signin-data:${groupId}:${userId}`
        
        try {
            let signinData = {
                streak: 0,
                lastSignin: null,
                totalDays: 0
            }
            
            if (isRedisAvailable()) {
                const data = await redis.get(signinKey)
                if (data) {
                    signinData = JSON.parse(data)
                }
            } else {
                console.log(`[虚空终端] Redis不可用，使用内存缓存获取签到数据: ${signinKey}`)
                const cachedData = memoryCache.get(signinKey)
                if (cachedData) {
                    signinData = cachedData
                }
            }
            
            return signinData
        } catch (error) {
            console.error('获取签到数据失败:', error)
            return {
                streak: 0,
                lastSignin: null,
                totalDays: 0
            }
        }
    }

    /**
     * 获取连续签到天数
     */
    static async getSignInStreak(userId, groupId) {
        try {
            const signinData = await TextHelper.getSigninData(userId, groupId)
            return signinData.streak || 0
        } catch (error) {
            console.error('获取连续签到天数失败:', error)
            return 0
        }
    }

    /**
     * 更新签到连击
     */
    static async updateSignInStreak(userId, groupId) {
        const signinKey = `akasha:signin-data:${groupId}:${userId}`
        
        try {
            const signinData = await TextHelper.getSigninData(userId, groupId)
            const today = moment().format('YYYY-MM-DD')
            const yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD')
            
            // 如果是连续签到，增加连击数
            if (signinData.lastSignin === yesterday) {
                signinData.streak += 1
            } else {
                // 重新开始连击
                signinData.streak = 1
            }
            
            signinData.lastSignin = today
            signinData.totalDays += 1
            
            // 保存数据
            if (isRedisAvailable()) {
                await redis.set(signinKey, JSON.stringify(signinData), { EX: 2592000 }) // 30天过期
            } else {
                console.log(`[虚空终端] Redis不可用，使用内存缓存更新签到数据: ${signinKey}`)
                memoryCache.set(signinKey, signinData)
            }
            
            return signinData.streak
        } catch (error) {
            console.error('更新签到连击失败:', error)
            return 1
        }
    }

    /**
     * 获取商店数据
     */
    static async getShopData() {
        try {
            const shopDataPath = 'plugins/trss-akasha-terminal-plugin/data/shop_data.json'
            return await dataManager.loadJsonData(shopDataPath, {})
        } catch (error) {
            console.error('获取商店数据失败:', error)
            return {}
        }
    }

    /**
     * 自动刷新商店
     */
    static async autoRefreshShop() {
        // 这个方法通常在商店类中实现，这里提供一个基础版本
        console.log('自动刷新商店功能需要在商店类中实现')
        return true
    }

    /**
     * 获取道具图标
     */
    static getItemIcon(itemType) {
        const iconMap = {
            'consumable': '🍭',
            'buff': '✨',
            'mystery': '🎁',
            'material': '🔧',
            'weapon': '⚔️',
            'armor': '🛡️',
            'accessory': '💍',
            'food': '🍎',
            'potion': '🧪'
        }
        return iconMap[itemType] || '📦'
    }

    /**
     * 获取稀有度表情符号
     */
    static getRarityEmoji(rarity) {
        const rarityMap = {
            'common': '⚪',
            'rare': '🔵', 
            'epic': '🟣',
            'legendary': '🟡',
            'mythic': '🔴'
        }
        return rarityMap[rarity] || '⚪'
    }
}

    


export default TextHelper