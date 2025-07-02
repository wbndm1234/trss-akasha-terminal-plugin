import { plugin } from '../../model/api/api.js'
import fs from 'fs'
import moment from "moment"
import command from '../../components/command.js'
import dataManager from '../../components/data_manager.js'
import puppeteer from '../../../../lib/puppeteer/puppeteer.js'
import cooldownConfig from '../../components/cooldown_config.js'
import path from 'path'
import { fileURLToPath } from 'url'
import TextHelper from '../../components/text.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 兼容
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

const currentTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
const userInventoryPath = path.join(__dirname, '..', '..', 'data', 'user_inventory.json')
const questDataPath = path.join(__dirname, '..', '..', 'data', 'quest_data.json')
const userQuestPath = path.join(__dirname, '..', '..', 'data', 'user_quest.json')


export class Quest extends plugin {
    constructor() {
        super({
            name: '任务',
            dsc: '每日任务、周常任务和特殊活动',
            event: 'message',
            priority: 66,
            rule: [
                {
                    reg: '^#?(任务列表|我的任务|查看任务)$',
                    fnc: 'showQuests'
                },
                {
                    reg: '^#?(每日任务|日常任务)$',
                    fnc: 'showDailyQuests'
                },
                {
                    reg: '^#?(周常任务|每周任务)$',
                    fnc: 'showWeeklyQuests'
                },
                {
                    reg: '^#?(特殊任务|活动任务)$',
                    fnc: 'showSpecialQuests'
                },
                {
                    reg: '^#?(领取奖励|完成任务)\\s*(.+)$',
                    fnc: 'claimReward'
                },
                {
                    reg: '^#?(任务进度|进度查询)$',
                    fnc: 'showProgress'
                },
                {
                    reg: '^#?(刷新任务|重置任务)$',
                    fnc: 'refreshQuests'
                },
                {
                    reg: '^#?(任务商店|任务兑换)$',
                    fnc: 'questShop'
                },
                {
                    reg: '^#?兑换\\s*(.+)$',
                    fnc: 'exchangeReward'
                }
            ]
        })
        this.initQuestData()
    }

    /**
     * 初始化任务数据，后续优化
     */
    async initQuestData() {
        const defaultQuestData = {
            daily_quests: {
                "daily_work": {
                    id: "daily_work",
                    name: "勤劳工作者",
                    description: "完成3次打工赚钱",
                    type: "daily",
                    target: 3,
                    rewards: {
                        money: 500,
                        items: { "2": 1 }, // 幸运符
                        quest_points: 10
                    },
                    track_key: "work_count"
                },
                "daily_date": {
                    id: "daily_date",
                    name: "浪漫约会",
                    description: "进行1次约会",
                    type: "daily",
                    target: 1,
                    rewards: {
                        love: 100,
                        items: { "1": 2 }, // 爱心巧克力
                        quest_points: 15
                    },
                    track_key: "date_count",
                    requirement: "需要有对象"
                },
                "daily_shop": {
                    id: "daily_shop",
                    name: "购物达人",
                    description: "在商店购买3件道具",
                    type: "daily",
                    target: 3,
                    rewards: {
                        money: 300,
                        items: { "4": 1 }, // 能量饮料
                        quest_points: 8
                    },
                    track_key: "shop_count"
                },
                "daily_synthesis": {
                    id: "daily_synthesis",
                    name: "合成大师",
                    description: "成功合成2个道具",
                    type: "daily",
                    target: 2,
                    rewards: {
                        money: 800,
                        items: { "5": 1 }, // 神秘水晶
                        quest_points: 20
                    },
                    track_key: "synthesis_count"
                },
                "daily_gift": {
                    id: "daily_gift",
                    name: "慷慨之心",
                    description: "赠送1件礼物给其他玩家",
                    type: "daily",
                    target: 1,
                    rewards: {
                        love: 50,
                        items: { "1": 1 },
                        quest_points: 12
                    },
                    track_key: "gift_count"
                }
            },
            weekly_quests: {
                "weekly_wealth": {
                    id: "weekly_wealth",
                    name: "财富积累者",
                    description: "累计获得10000金币",
                    type: "weekly",
                    target: 10000,
                    rewards: {
                        money: 2000,
                        items: { "3": 3, "5": 2 },
                        quest_points: 50
                    },
                    track_key: "money_earned"
                },
                "weekly_love": {
                    id: "weekly_love",
                    name: "爱情专家",
                    description: "累计获得1000好感度",
                    type: "weekly",
                    target: 1000,
                    rewards: {
                        love: 500,
                        items: { "102": 1 }, // 爱情药水
                        quest_points: 60
                    },
                    track_key: "love_earned",
                    requirement: "需要有对象"
                },
                "weekly_synthesis": {
                    id: "weekly_synthesis",
                    name: "合成专家",
                    description: "成功合成10个道具",
                    type: "weekly",
                    target: 10,
                    rewards: {
                        money: 3000,
                        items: { "101": 1, "5": 3 },
                        quest_points: 80
                    },
                    track_key: "synthesis_success"
                },
                "weekly_social": {
                    id: "weekly_social",
                    name: "社交达人",
                    description: "与10个不同的玩家互动",
                    type: "weekly",
                    target: 10,
                    rewards: {
                        money: 1500,
                        items: { "2": 5 },
                        quest_points: 40
                    },
                    track_key: "social_count"
                }
            },
            special_quests: {
                "special_newbie": {
                    id: "special_newbie",
                    name: "新手指南",
                    description: "完成首次娶群友",
                    type: "special",
                    target: 1,
                    rewards: {
                        money: 2000,
                        items: { "1": 5, "2": 3 },
                        quest_points: 100
                    },
                    track_key: "first_marriage",
                    one_time: true
                },
                "special_rich": {
                    id: "special_rich",
                    name: "百万富翁",
                    description: "拥有100000金币",
                    type: "special",
                    target: 100000,
                    rewards: {
                        money: 50000,
                        items: { "103": 1 }, // 黄金锤子
                        quest_points: 200
                    },
                    track_key: "max_money",
                    one_time: true
                },
                "special_lover": {
                    id: "special_lover",
                    name: "真爱无敌",
                    description: "好感度达到10000",
                    type: "special",
                    target: 10000,
                    rewards: {
                        love: 2000,
                        items: { "105": 1 }, // 钻石戒指
                        quest_points: 300
                    },
                    track_key: "max_love",
                    one_time: true,
                    requirement: "需要有对象"
                },
                "special_master": {
                    id: "special_master",
                    name: "合成宗师",
                    description: "工坊等级达到10级",
                    type: "special",
                    target: 10,
                    rewards: {
                        money: 10000,
                        items: { "110": 1 }, // 神级合成石
                        quest_points: 500
                    },
                    track_key: "workshop_level",
                    one_time: true
                }
            },
            quest_shop: {
                "lucky_box": {
                    name: "幸运宝箱",
                    description: "随机获得1-3个稀有道具",
                    cost: 50,
                    rewards: {
                        random_items: [
                            { id: "2", count: 3, weight: 30 },
                            { id: "5", count: 2, weight: 20 },
                            { id: "101", count: 1, weight: 15 },
                            { id: "102", count: 1, weight: 15 },
                            { id: "103", count: 1, weight: 10 },
                            { id: "104", count: 1, weight: 8 },
                            { id: "105", count: 1, weight: 2 }
                        ]
                    }
                },
                "money_bag": {
                    name: "金币袋",
                    description: "获得5000金币",
                    cost: 30,
                    rewards: {
                        money: 5000
                    }
                },
                "love_potion": {
                    name: "爱情药水",
                    description: "获得爱情药水×1",
                    cost: 40,
                    rewards: {
                        items: { "102": 1 }
                    }
                },
                "workshop_boost": {
                    name: "工坊加速器",
                    description: "工坊经验翻倍1天",
                    cost: 60,
                    rewards: {
                        buff: "workshop_exp_boost",
                        duration: 86400
                    }
                },
                "synthesis_materials": {
                    name: "合成材料包",
                    description: "获得各种合成材料",
                    cost: 35,
                    rewards: {
                        items: { "1": 3, "2": 2, "3": 2, "4": 2, "5": 1 }
                    }
                }
            }
        }

        // 使用dataManager初始化数据
        await dataManager.loadJsonData(questDataPath, defaultQuestData)
        await dataManager.loadJsonData(userQuestPath, {})
    }

   
    async showQuests(e) {
        const userId = e.user_id
        const groupId = e.group_id
        const commandName = '任务列表'
        
        try {
            
        const userQuests = await this.getUserQuests(userId, groupId)
        const questData = await dataManager.loadJsonData(questDataPath, {})
        const achievements = await this.getUserAchievements(userId, groupId)
        
       
        const templateData = {
            userId: userId,
            username: e.sender.card || e.sender.nickname || '未知用户',
            questPoints: userQuests.quest_points || 0,
            dailyQuests: Object.entries(questData.daily_quests).map(([questId, quest]) => {
                const userQuest = userQuests.daily?.[questId] || { progress: 0, completed: false, claimed: false }
                const progress = Math.min(userQuest.progress, quest.target)
                return {
                    ...quest,
                    status: userQuest.claimed ? '✅' : userQuest.completed ? '🎁' : '⏳',
                    progressText: `${progress}/${quest.target}`,
                    progressPercent: Math.round((progress / quest.target) * 100),
                    rewardsText: this.formatRewards(quest.rewards)
                }
            }),
            weeklyQuests: Object.entries(questData.weekly_quests).map(([questId, quest]) => {
                const userQuest = userQuests.weekly?.[questId] || { progress: 0, completed: false, claimed: false }
                const progress = Math.min(userQuest.progress, quest.target)
                return {
                    ...quest,
                    status: userQuest.claimed ? '✅' : userQuest.completed ? '🎁' : '⏳',
                    progressText: `${progress}/${quest.target}`,
                    progressPercent: Math.round((progress / quest.target) * 100),
                    rewardsText: this.formatRewards(quest.rewards)
                }
            }),
            specialQuests: Object.entries(questData.special_quests).map(([questId, quest]) => {
                const userQuest = userQuests.special?.[questId] || { progress: 0, completed: false, claimed: false }
                if (quest.one_time && userQuest.claimed) return null
                const progress = Math.min(userQuest.progress, quest.target)
                return {
                    ...quest,
                    status: userQuest.claimed ? '✅' : userQuest.completed ? '🎁' : '⏳',
                    progressText: `${progress}/${quest.target}`,
                    progressPercent: Math.round((progress / quest.target) * 100),
                    rewardsText: this.formatRewards(quest.rewards)
                }
            }).filter(Boolean),
            completedQuests: await this.getCompletedQuests(userId, groupId),
            questShop: Object.entries(questData.quest_shop).map(([itemId, item]) => ({
                ...item,
                affordable: (userQuests.quest_points || 0) >= item.cost
            })),
            achievements: achievements.map(achievement => ({
                ...achievement,
                status: achievement.unlocked ? '🏆' : '🔒',
                progressText: achievement.type === 'count' ? `${achievement.progress}/${achievement.target}` : '',
                progressPercent: achievement.type === 'count' ? Math.round((achievement.progress / achievement.target) * 100) : 0
            }))
        }
        // 计算统计数据
        const dailyCompleted = templateData.dailyQuests.filter(q => q.status === '✅').length;
        const weeklyCompleted = templateData.weeklyQuests.filter(q => q.status === '✅').length;
        const specialCompleted = templateData.specialQuests.filter(q => q.status === '✅').length;
        
        const totalQuests = templateData.dailyQuests.length + templateData.weeklyQuests.length + templateData.specialQuests.length;
        const totalCompleted = dailyCompleted + weeklyCompleted + specialCompleted;
        const completionRate = totalQuests > 0 ? Math.round((totalCompleted / totalQuests) * 100) : 0;
        
        // 获取当前时间
        const now = new Date();
        const currentTime = now.toLocaleTimeString('zh-CN', { hour12: false });
        const currentDate = now.toLocaleDateString('zh-CN');
        
        // 计算刷新时间
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const dailyRefreshMs = tomorrow.getTime() - now.getTime();
        const dailyRefreshHours = Math.floor(dailyRefreshMs / (1000 * 60 * 60));
        const dailyRefreshMinutes = Math.floor((dailyRefreshMs % (1000 * 60 * 60)) / (1000 * 60));
        
        const nextMonday = new Date(now);
        const daysUntilMonday = (7 - now.getDay() + 1) % 7 || 7;
        nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
        nextMonday.setHours(0, 0, 0, 0);
        const weeklyRefreshMs = nextMonday.getTime() - now.getTime();
        const weeklyRefreshDays = Math.floor(weeklyRefreshMs / (1000 * 60 * 60 * 24));
        const weeklyRefreshHours = Math.floor((weeklyRefreshMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
       
        templateData.dailyCompleted = dailyCompleted;
        templateData.weeklyCompleted = weeklyCompleted;
        templateData.specialCompleted = specialCompleted;
        templateData.totalQuests = totalQuests;
        templateData.totalCompleted = totalCompleted;
        templateData.completionRate = completionRate;
        templateData.currentTime = currentTime;
        templateData.currentDate = currentDate;
        templateData.dailyRefreshTime = `${dailyRefreshHours}h ${dailyRefreshMinutes}m`;
        templateData.weeklyRefreshTime = `${weeklyRefreshDays}d ${weeklyRefreshHours}h`;
        
        await renderImage(e, 'quest_cyberpunk', { 
            cssPath: './plugins/trss-akasha-terminal-plugin/resources/quest/quest_cyberpunk.css',
            templateData
        });
      
       
        } catch (error) {
            console.error('显示任务列表失败:', error)
        }
    }

    
    async showDailyQuests(e) {
        const userId = e.user_id
        const groupId = e.group_id
        const commandName = '每日任务'
        
        try {
            
        const userQuests = await this.getUserQuests(userId, groupId)
        const questData = await dataManager.loadJsonData(questDataPath, {})
        const shopData = await TextHelper.getShopData()
        
        let msg = ['📅 每日任务 📅\n']
        msg.push('━━━━━━━━━━━━━━━━')
        
        for (let [questId, quest] of Object.entries(questData.daily_quests)) {
            const userQuest = userQuests.daily?.[questId] || { progress: 0, completed: false, claimed: false }
            const progress = Math.min(userQuest.progress, quest.target)
            const progressPercent = ((progress / quest.target) * 100).toFixed(1)
            
            let status = '⏳'
            if (userQuest.claimed) {
                status = '✅'
            } else if (userQuest.completed) {
                status = '🎁'
            }
            
            msg.push(`${status} ${quest.name}`)
            msg.push(`   📝 ${quest.description}`)
            if (quest.requirement) {
                msg.push(`   ⚠️ ${quest.requirement}`)
            }
            msg.push(`   📊 进度: ${progress}/${quest.target} (${progressPercent}%)`)
            
            // 显示奖励
            const rewards = []
            if (quest.rewards.money) rewards.push(`💰${quest.rewards.money}`)
            if (quest.rewards.love) rewards.push(`❤️${quest.rewards.love}`)
            if (quest.rewards.quest_points) rewards.push(`🏆${quest.rewards.quest_points}`)
            if (quest.rewards.items) {
                for (let [itemId, count] of Object.entries(quest.rewards.items)) {
                    const itemName = shopData.items?.[itemId]?.name || `道具${itemId}`
                    rewards.push(`${itemName}×${count}`)
                }
            }
            msg.push(`   🎁 奖励: ${rewards.join(', ')}`)
            
            if (userQuest.completed && !userQuest.claimed) {
                msg.push(`   💡 使用 #领取奖励 ${quest.name} 领取奖励`)
            }
            
            msg.push('  ────────────────')
        }
        
        // 显示刷新时间
        const now = new Date()
        const tomorrow = new Date(now)
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(0, 0, 0, 0)
        const timeToReset = Math.ceil((tomorrow - now) / (1000 * 60 * 60))
        
        msg.push(`\n🔄 任务将在 ${timeToReset} 小时后刷新`)
        
       
        const templateData = {
            questType: 'daily',
            title: '📅 每日任务',
            userId: userId,
            username: e.sender.card || e.sender.nickname || '未知用户',
            userLevel: await TextHelper.getUserLevel(userId),
            questPoints: await this.getUserQuestPoints(userId, groupId),
            quests: Object.entries(questData.daily_quests).map(([questId, quest]) => {
                const userQuest = userQuests.daily?.[questId] || { progress: 0, completed: false, claimed: false }
                const progress = Math.min(userQuest.progress, quest.target)
                const progressPercent = ((progress / quest.target) * 100).toFixed(1)
                
                let status = '⏳'
                if (userQuest.claimed) {
                    status = '✅'
                } else if (userQuest.completed) {
                    status = '🎁'
                }
                
                const rewards = []
                if (quest.rewards.money) rewards.push(`💰${quest.rewards.money}`)
                if (quest.rewards.love) rewards.push(`❤️${quest.rewards.love}`)
                if (quest.rewards.quest_points) rewards.push(`🏆${quest.rewards.quest_points}`)
                if (quest.rewards.items) {
                    for (let [itemId, count] of Object.entries(quest.rewards.items)) {
                        const itemName = shopData.items?.[itemId]?.name || `道具${itemId}`
                        rewards.push(`${itemName}×${count}`)
                    }
                }
                
                return {
                    id: questId,
                    name: quest.name,
                    description: quest.description,
                    requirement: quest.requirement || '',
                    status,
                    progress,
                    target: quest.target,
                    progressPercent,
                    rewards: rewards.join(', '),
                    canClaim: userQuest.completed && !userQuest.claimed
                }
            })
        }
        
        try {
            await this.renderImage(e, 'daily_quests', {
                templateData: templateData
            })
        } catch (error) {
            console.error('每日任务渲染失败:', error)
            TextHelper.showDailyQuestsText(e, templateData)
        }
        
        return true
        } catch (error) {
            console.error('显示周常任务失败:', error)
            
            await e.reply('周常任务暂时无法访问，请稍后再试')
            return false
        }
    }

    async showWeeklyQuests(e) {
        const userId = e.user_id
        const groupId = e.group_id
        const commandName = '周常任务'
        try {
        const userQuests = await this.getUserQuests(userId, groupId)
        const questData = await dataManager.loadJsonData(questDataPath, {})
        const shopData = await TextHelper.getShopData()
        
        let msg = ['📆 周常任务 📆\n']
        msg.push('━━━━━━━━━━━━━━━━')
        
        for (let [questId, quest] of Object.entries(questData.weekly_quests)) {
            const userQuest = userQuests.weekly?.[questId] || { progress: 0, completed: false, claimed: false }
            const progress = Math.min(userQuest.progress, quest.target)
            const progressPercent = ((progress / quest.target) * 100).toFixed(1)
            
            let status = '⏳'
            if (userQuest.claimed) {
                status = '✅'
            } else if (userQuest.completed) {
                status = '🎁'
            }
            
            msg.push(`${status} ${quest.name}`)
            msg.push(`   📝 ${quest.description}`)
            if (quest.requirement) {
                msg.push(`   ⚠️ ${quest.requirement}`)
            }
            msg.push(`   📊 进度: ${progress}/${quest.target} (${progressPercent}%)`)
            
            // 显示奖励
            const rewards = []
            if (quest.rewards.money) rewards.push(`💰${quest.rewards.money}`)
            if (quest.rewards.love) rewards.push(`❤️${quest.rewards.love}`)
            if (quest.rewards.quest_points) rewards.push(`🏆${quest.rewards.quest_points}`)
            if (quest.rewards.items) {
                for (let [itemId, count] of Object.entries(quest.rewards.items)) {
                    const itemName = shopData.items?.[itemId]?.name || `道具${itemId}`
                    rewards.push(`${itemName}×${count}`)
                }
            }
            msg.push(`   🎁 奖励: ${rewards.join(', ')}`)
            
            if (userQuest.completed && !userQuest.claimed) {
                msg.push(`   💡 使用 #领取奖励 ${quest.name} 领取奖励`)
            }
            
            msg.push('   ────────────────')
        }
        
        // 显示刷新时间
        const now = new Date()
        const nextMonday = new Date(now)
        const daysUntilMonday = (7 - now.getDay() + 1) % 7 || 7
        nextMonday.setDate(nextMonday.getDate() + daysUntilMonday)
        nextMonday.setHours(0, 0, 0, 0)
        const daysToReset = Math.ceil((nextMonday - now) / (1000 * 60 * 60 * 24))
        
        msg.push(`\n🔄 任务将在 ${daysToReset} 天后刷新`)
        
       
        const templateData = {
            questType: 'weekly',
            title: '📆 周常任务',
            userId: userId,
            username: e.sender.card || e.sender.nickname || '未知用户',
            userLevel: await TextHelper.getUserLevel(userId),
            questPoints: await this.getUserQuestPoints(userId, groupId),
            quests: Object.entries(questData.weekly_quests).map(([questId, quest]) => {
                const userQuest = userQuests.weekly?.[questId] || { progress: 0, completed: false, claimed: false }
                const progress = Math.min(userQuest.progress, quest.target)
                const progressPercent = ((progress / quest.target) * 100).toFixed(1)
                
                let status = '⏳'
                if (userQuest.claimed) {
                    status = '✅'
                } else if (userQuest.completed) {
                    status = '🎁'
                }
                
                const rewards = []
                if (quest.rewards.money) rewards.push(`💰${quest.rewards.money}`)
                if (quest.rewards.love) rewards.push(`❤️${quest.rewards.love}`)
                if (quest.rewards.quest_points) rewards.push(`🏆${quest.rewards.quest_points}`)
                if (quest.rewards.items) {
                    for (let [itemId, count] of Object.entries(quest.rewards.items)) {
                        const itemName = shopData.items?.[itemId]?.name || `道具${itemId}`
                        rewards.push(`${itemName}×${count}`)
                    }
                }
                
                return {
                    id: questId,
                    name: quest.name,
                    description: quest.description,
                    requirement: quest.requirement || '',
                    status,
                    progress,
                    target: quest.target,
                    progressPercent,
                    rewards: rewards.join(', '),
                    canClaim: userQuest.completed && !userQuest.claimed
                }
            })
        }
        
        try {
            await this.renderImage(e, 'weekly_quests', {
                templateData: templateData
            })
        } catch (error) {
            console.error('周常任务渲染失败:', error)
            this.showWeeklyQuestsText(e, templateData)
        }
        
        return true
        } catch (error) {
            console.error('兑换奖励失败:', error)
            
            await e.reply('兑换奖励失败，请稍后再试')
            return false
        }
    }

   
    async showSpecialQuests(e) {
        const userId = e.user_id
        const groupId = e.group_id
        const commandName = '特殊任务'
        
        try {
            
            
            const userQuests = await this.getUserQuests(userId, groupId)
        const questData = await dataManager.loadJsonData(questDataPath, {})
        const shopData = await TextHelper.getShopData()
        
        let msg = ['⭐ 特殊任务 ⭐\n']
        msg.push('━━━━━━━━━━━━━━━━')
        
        for (let [questId, quest] of Object.entries(questData.special_quests)) {
            const userQuest = userQuests.special?.[questId] || { progress: 0, completed: false, claimed: false }
            
            // 跳过已完成的一次性任务
            if (quest.one_time && userQuest.claimed) continue
            
            const progress = Math.min(userQuest.progress, quest.target)
            const progressPercent = ((progress / quest.target) * 100).toFixed(1)
            
            let status = '⏳'
            if (userQuest.claimed) {
                status = '✅'
            } else if (userQuest.completed) {
                status = '🎁'
            }
            
            msg.push(`${status} ${quest.name} ${quest.one_time ? '(限时)' : ''}`)
            msg.push(`   📝 ${quest.description}`)
            if (quest.requirement) {
                msg.push(`   ⚠️ ${quest.requirement}`)
            }
            msg.push(`   📊 进度: ${progress}/${quest.target} (${progressPercent}%)`)
            
            // 显示奖励
            const rewards = []
            if (quest.rewards.money) rewards.push(`💰${quest.rewards.money}`)
            if (quest.rewards.love) rewards.push(`❤️${quest.rewards.love}`)
            if (quest.rewards.quest_points) rewards.push(`🏆${quest.rewards.quest_points}`)
            if (quest.rewards.items) {
                for (let [itemId, count] of Object.entries(quest.rewards.items)) {
                    const itemName = shopData.items?.[itemId]?.name || `道具${itemId}`
                    rewards.push(`${itemName}×${count}`)
                }
            }
            msg.push(`   🎁 奖励: ${rewards.join(', ')}`)
            
            if (userQuest.completed && !userQuest.claimed) {
                msg.push(`   💡 使用 #领取奖励 ${quest.name} 领取奖励`)
            }
            
            msg.push('   ────────────────')
        }
        
       
        const templateData = {
            questType: 'special',
            title: '⭐ 特殊任务',
            userId: userId,
            username: e.sender.card || e.sender.nickname || '未知用户',
            userLevel: await TextHelper.getUserLevel(userId),
            questPoints: await this.getUserQuestPoints(userId, groupId),
            quests: Object.entries(questData.special_quests).filter(([questId, quest]) => {
                const userQuest = userQuests.special?.[questId] || { progress: 0, completed: false, claimed: false }
                return !(quest.one_time && userQuest.claimed)
            }).map(([questId, quest]) => {
                const userQuest = userQuests.special?.[questId] || { progress: 0, completed: false, claimed: false }
                const progress = Math.min(userQuest.progress, quest.target)
                const progressPercent = ((progress / quest.target) * 100).toFixed(1)
                
                let status = '⏳'
                if (userQuest.claimed) {
                    status = '✅'
                } else if (userQuest.completed) {
                    status = '🎁'
                }
                
                const rewards = []
                if (quest.rewards.money) rewards.push(`💰${quest.rewards.money}`)
                if (quest.rewards.love) rewards.push(`❤️${quest.rewards.love}`)
                if (quest.rewards.quest_points) rewards.push(`🏆${quest.rewards.quest_points}`)
                if (quest.rewards.items) {
                    for (let [itemId, count] of Object.entries(quest.rewards.items)) {
                        const itemName = shopData.items?.[itemId]?.name || `道具${itemId}`
                        rewards.push(`${itemName}×${count}`)
                    }
                }
                
                return {
                    id: questId,
                    name: quest.name,
                    description: quest.description,
                    requirement: quest.requirement || '',
                    status,
                    progress,
                    target: quest.target,
                    progressPercent,
                    rewards: rewards.join(', '),
                    canClaim: userQuest.completed && !userQuest.claimed,
                    oneTime: quest.one_time || false
                }
            })
        }
        
        if (templateData.quests.length === 0) {
            templateData.quests = [{
                name: '暂无可用的特殊任务',
                description: '请稍后再来查看',
                status: '⏳',
                progress: 0,
                target: 1,
                progressPercent: '0.0',
                rewards: '',
                canClaim: false,
                oneTime: false
            }]
        }
        
        try {
            await this.renderImage(e, 'special_quests', {
                templateData: templateData
            })
        } catch (error) {
            console.error('特殊任务渲染失败:', error)
            this.showSpecialQuestsText(e, templateData)
        }
        
        return true
        } catch (error) {
            console.error('显示特殊任务失败:', error)
            
            await e.reply('特殊任务暂时无法访问，请稍后再试')
            return false
        }
    }

    
    async claimReward(e) {
        const userId = e.user_id
        const groupId = e.group_id
        const commandName = '领取奖励'
        const questName = e.msg.match(/^#?(领取奖励|完成任务)\s*(.+)$/)?.[2]?.trim()
        
        if (!questName) {
            await e.reply('请指定要领取奖励的任务名称！')
            return true
        }
        
        try {
            

        const userQuests = await this.getUserQuests(userId, groupId)
        const questData = await dataManager.loadJsonData(questDataPath, {})
        
        // 查找任务 
        let quest = null
        let userQuest = null
        let questType = null
        let foundQuests = []
        
        for (let [type, quests] of Object.entries(questData)) {
            if (type === 'quest_shop') continue
            
            for (let [questId, q] of Object.entries(quests)) {
                // 精确匹配
                if (q.name === questName) {
                    quest = q
                    questType = type.replace('_quests', '')
                    userQuest = userQuests[questType]?.[questId] || { progress: 0, completed: false, claimed: false }
                    foundQuests = []
                    break
                }
                // 模糊匹配（包含关系）
                if (q.name.includes(questName) || questName.includes(q.name)) {
                    foundQuests.push({ quest: q, type: type.replace('_quests', ''), questId })
                }
            }
            if (quest) break
        }
        
        // 如果没有精确匹配但有模糊匹配结果
        if (!quest && foundQuests.length === 1) {
            const found = foundQuests[0]
            quest = found.quest
            questType = found.type
            userQuest = userQuests[questType]?.[found.questId] || { progress: 0, completed: false, claimed: false }
        } else if (!quest && foundQuests.length > 1) {
            const questNames = foundQuests.map(f => f.quest.name).join('、')
            await e.reply(`找到多个匹配的任务: ${questNames}\n请输入完整的任务名称！`)
            return true
        }
        
        if (!quest) {
            await e.reply(`找不到任务: ${questName}`)
            return true
        }
        
        if (userQuest.claimed) {
            await e.reply(`任务 ${questName} 的奖励已经领取过了！`)
            return true
        }
        
        if (!userQuest.completed) {
            await e.reply(`任务 ${questName} 尚未完成，无法领取奖励！`)
            return true
        }
        
        // 发放奖励
        const filename = `${groupId}.json`
        const homejson = await akasha_data.getQQYUserHome(userId, {}, filename, false)
        
        if (!homejson[userId]) {
            await e.reply('请先创建存档')
            return true
        }
        
        const rewards = []
        
        // 金币奖励
        if (quest.rewards.money) {
            homejson[userId].money += quest.rewards.money
            rewards.push(`💰 ${quest.rewards.money} 金币`)
        }
        
        // 好感度奖励
        if (quest.rewards.love) {
            homejson[userId].love += quest.rewards.love
            rewards.push(`❤️ ${quest.rewards.love} 好感度`)
        }
        
        // 道具奖励
        if (quest.rewards.items) {
            const shopData = TextHelper.getShopData()
        for (let [itemId, count] of Object.entries(quest.rewards.items)) {
            await TextHelper.addToInventory(userId, groupId, itemId, count)
                const itemName = shopData.items?.[itemId]?.name || `道具${itemId}`
                rewards.push(`${itemName} ×${count}`)
            }
        }
        
        // 任务点数奖励
        if (quest.rewards.quest_points) {
            userQuests.quest_points = (userQuests.quest_points || 0) + quest.rewards.quest_points
            rewards.push(`🏆 ${quest.rewards.quest_points} 任务点数`)
        }
        
        // 标记为已领取
        if (!userQuests[questType]) userQuests[questType] = {}
        userQuests[questType][quest.id] = { ...userQuest, claimed: true }
        
        await akasha_data.getQQYUserHome(userId, homejson, filename, true)
        await this.saveUserQuests(userId, groupId, userQuests)
        
        await e.reply([
            global.segment.at(userId), '\n',
            `🎉 任务完成！\n`,
            `📋 ${questName}\n`,
            `🎁 获得奖励:\n`,
            ...rewards.map(r => `   ${r}`),
            `\n💰 当前金币: ${homejson[userId].money}`,
            `🏆 任务点数: ${userQuests.quest_points || 0}`
        ])
        
        return true
        } catch (error) {
            console.error('领取奖励失败:', error)
            
            await e.reply('领取奖励失败，请稍后再试')
            return false
        }
    }

    
    async questShop(e) {
        const userId = e.user_id
        const groupId = e.group_id
        const commandName = '任务商店'
        
        try {
            
            
            const userQuests = await this.getUserQuests(userId, groupId)
        const questData = await dataManager.loadJsonData(questDataPath, {})
        const achievements = await this.getUserAchievements(userId, groupId)
        
       
        const templateData = {
            userId: userId,
            username: e.sender.card || e.sender.nickname || '未知用户',
            userLevel: await TextHelper.getUserLevel(userId),
            questPoints: userQuests.quest_points || 0,
            items: Object.entries(questData.quest_shop).map(([itemId, item], index) => ({
                id: itemId,
                name: item.name,
                description: item.description,
                effect: item.effect || '',
                price: item.cost,
                stock: item.stock || '∞',
                stockStatus: item.stock && item.stock < 10 ? 'low' : (item.stock === 0 ? 'out' : 'normal'),
                category: item.category || 'special',
                categoryText: this.getCategoryText(item.category || 'special'),
                icon: item.icon || '🎁',
                canBuy: (userQuests.quest_points || 0) >= item.cost && (item.stock === undefined || item.stock > 0),
                outOfStock: item.stock === 0,
                isLimited: item.limited || false
            })),
            totalItems: Object.keys(questData.quest_shop).length,
            totalPurchases: userQuests.total_purchases || 0,
            totalSpent: userQuests.total_spent || 0
        }
        
        try {
            await this.renderImage(e, 'quest_shop_standalone', {
                templateData: templateData
            })
        } catch (error) {
            console.error('任务商店渲染失败:', error)
            this.questShopText(e, templateData)
        }
        
        return true
        } catch (error) {
            console.error('任务商店显示失败:', error)
            
            await e.reply('任务商店暂时无法访问，请稍后再试')
            return false
        }
    }
    
    questShopText(e, data) {
        let msg = ['🏪 任务商店 🏪\n']
        msg.push('━━━━━━━━━━━━━━━━')
        msg.push(`🏆 你的任务点数: ${data.questPoints}\n`)
        
        data.questShop.forEach(item => {
            const affordable = item.affordable ? '✅' : '❌'
            msg.push(`${item.index}. ${item.name} ${affordable}`)
            msg.push(`   📝 ${item.description}`)
            msg.push(`   💎 价格: ${item.cost} 任务点数`)
            msg.push('   ────────────────')
        })
        
        msg.push('\n💡 使用 #兑换 [商品名] 进行兑换')
        
        e.reply(msg.join('\n'))
    }

    
    getCategoryText(category) {
        const categoryMap = {
            'consumable': '消耗品',
            'equipment': '装备',
            'material': '材料',
            'special': '特殊',
            'buff': '增益',
            'other': '其他'
        }
        return categoryMap[category] || '其他'
    }

    async exchangeReward(e) {
        const userId = e.user_id
        const groupId = e.group_id
        const commandName = '兑换奖励'
        const itemName = e.msg.match(/^#?兑换\s*(.+)$/)?.[1]?.trim()
        
        if (!itemName) {
            await e.reply('请指定要兑换的商品名称！')
            return true
        }
        
        const userQuests = await this.getUserQuests(userId, groupId)
        const questData = await dataManager.loadJsonData(questDataPath, {})
        
        // 查找商品
        let shopItem = null
        for (let [itemId, item] of Object.entries(questData.quest_shop)) {
            if (item.name === itemName) {
                shopItem = item
                break
            }
        }
        
        if (!shopItem) {
            await e.reply(`找不到商品: ${itemName}`)
            return true
        }
        
        const userPoints = userQuests.quest_points || 0
        if (userPoints < shopItem.cost) {
            await e.reply(`任务点数不足！需要 ${shopItem.cost} 点，你只有 ${userPoints} 点`)
            return true
        }
        
        // 扣除点数
        userQuests.quest_points = userPoints - shopItem.cost
        
        // 发放奖励
        const filename = `${groupId}.json`
        const homejson = await akasha_data.getQQYUserHome(userId, {}, filename, false)
        
        if (!homejson[userId]) {
            await e.reply('请先创建存档')
            return true
        }
        
        const rewards = []
        
        if (shopItem.rewards.money) {
            homejson[userId].money += shopItem.rewards.money
            rewards.push(`💰 ${shopItem.rewards.money} 金币`)
        }
        
        if (shopItem.rewards.items) {
            const shopData = TextHelper.getShopData()
            for (let [itemId, count] of Object.entries(shopItem.rewards.items)) {
                await TextHelper.addToInventory(userId, groupId, itemId, count)
                const itemName = shopData.items?.[itemId]?.name || `道具${itemId}`
                rewards.push(`${itemName} ×${count}`)
            }
        }
        
        if (shopItem.rewards.random_items) {
            const randomRewards = this.getRandomRewards(shopItem.rewards.random_items)
            const shopData = TextHelper.getShopData()
            for (let reward of randomRewards) {
                await TextHelper.addToInventory(userId, groupId, reward.id, reward.count)
                const itemName = shopData.items?.[reward.id]?.name || `道具${reward.id}`
                rewards.push(`${itemName} ×${reward.count}`)
            }
        }
        
        if (shopItem.rewards.buff) {
            // 处理buff效果
            const buffKey = `akasha:quest-buff:${shopItem.rewards.buff}:${groupId}:${userId}`
            const buffDuration = shopItem.rewards.duration || cooldownConfig.getQuestCooldown('quest_complete_delay', 86400)
            await redis.set(buffKey, JSON.stringify({ active: true }), { EX: buffDuration })
            rewards.push(`✨ ${shopItem.rewards.buff} 效果`)
        }
        
        await akasha_data.getQQYUserHome(userId, homejson, filename, true)
        await this.saveUserQuests(userId, groupId, userQuests)
        
        await e.reply([
            global.segment.at(userId), '\n',
            `🛍️ 兑换成功！\n`,
            `📦 ${itemName}\n`,
            `💎 消耗: ${shopItem.cost} 任务点数\n`,
            `🎁 获得奖励:\n`,
            ...rewards.map(r => `   ${r}`),
            `\n🏆 剩余任务点数: ${userQuests.quest_points}`
        ])
        
        return true
    
}
    async getUserQuests(userId, groupId) {
        const userQuestData = await dataManager.loadJsonData(userQuestPath, {})
        const key = `${groupId}_${userId}`
        
        if (!userQuestData[key]) {
            userQuestData[key] = {
                daily: {},
                weekly: {},
                special: {},
                quest_points: 0,
                last_daily_reset: new Date().toDateString(),
                last_weekly_reset: this.getWeekStart().toDateString()
            }
            await dataManager.saveJsonData(userQuestPath, userQuestData)
        }
        
        // 检查是否需要重置
        await this.checkQuestReset(userId, groupId, userQuestData[key])
        
        return userQuestData[key]
    }

    async saveUserQuests(userId, groupId, questData) {
        const userQuestData = await dataManager.loadJsonData(userQuestPath, {})
        const key = `${groupId}_${userId}`
        userQuestData[key] = questData
        await dataManager.saveJsonData(userQuestPath, userQuestData)
    }

    async checkQuestReset(userId, groupId, userQuests) {
        const today = new Date().toDateString()
        const thisWeek = this.getWeekStart().toDateString()
        
        // 重置每日任务
        if (userQuests.last_daily_reset !== today) {
            userQuests.daily = {}
            userQuests.last_daily_reset = today
            await this.saveUserQuests(userId, groupId, userQuests)
        }
        
        if (userQuests.last_weekly_reset !== thisWeek) {
            userQuests.weekly = {}
            userQuests.last_weekly_reset = thisWeek
            await this.saveUserQuests(userId, groupId, userQuests)
        }
    }

    getWeekStart() {
        const now = new Date()
        const day = now.getDay()
        const diff = now.getDate() - day + (day === 0 ? -6 : 1)
        return new Date(now.setDate(diff))
    }

    getRandomRewards(randomItems) {
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



    
    async getQuestShopItems() {
        const questDataPath = path.join(this.dataPath, 'quest_data.json')
        const questData = await dataManager.loadJsonData(questDataPath, {})
        return Object.entries(questData.quest_shop || {}).map(([id, item]) => ({ id, ...item }))
    }
    
    /**
     * 获取已完成任务
     */
    async getCompletedQuests(userId, groupId) {
        const userQuests = await this.getUserQuests(userId, groupId)
        const completed = []
        
        // 统计各类型已完成任务数量
        const dailyCompleted = Object.values(userQuests.daily || {}).filter(q => q.claimed).length
        const weeklyCompleted = Object.values(userQuests.weekly || {}).filter(q => q.claimed).length
        const specialCompleted = Object.values(userQuests.special || {}).filter(q => q.claimed).length
        
        return {
            daily: dailyCompleted,
            weekly: weeklyCompleted,
            special: specialCompleted,
            total: dailyCompleted + weeklyCompleted + specialCompleted
        }
    }
    
    /**
     * 获取用户成就
     */
    async getUserAchievements(userId, groupId) {
        // 这里根据玩家的任务完成情况生成成就
        const userQuests = await this.getUserQuests(userId, groupId)
        const completedQuests = await this.getCompletedQuests(userId, groupId)
        
        const achievements = [
            {
                name: '任务新手',
                description: '完成第一个任务',
                target: 1,
                progress: Math.min(1, completedQuests.total),
                unlocked: completedQuests.total >= 1,
                type: 'count'
            },
            {
                name: '勤劳工作者',
                description: '完成10个任务',
                target: 10,
                progress: Math.min(10, completedQuests.total),
                unlocked: completedQuests.total >= 10,
                type: 'count'
            },
            {
                name: '任务大师',
                description: '完成50个任务',
                target: 50,
                progress: Math.min(50, completedQuests.total),
                unlocked: completedQuests.total >= 50,
                type: 'count'
            },
            {
                name: '点数收集者',
                description: '累计获得1000任务点数',
                target: 1000,
                progress: Math.min(1000, userQuests.total_points || 0),
                unlocked: (userQuests.total_points || 0) >= 1000,
                type: 'count'
            }
        ]
        
        return achievements
    }
    
    /**
     * 获取任务点数
     */
    async getQuestPoints(userId, groupId) {
        const userQuests = await this.getUserQuests(userId, groupId)
        return userQuests.quest_points || 0
    }

    /**
     * 获取用户任务点数
     */
    async getUserQuestPoints(userId, groupId) {
        const userQuests = await this.getUserQuests(userId, groupId)
        return userQuests.quest_points || 0
    }



    // 任务进度更新方法（供其他系统调用）
    async updateQuestProgress(userId, groupId, trackKey, value = 1, isIncrement = true) {
        try {
            const userQuests = await this.getUserQuests(userId, groupId)
            const questData = await dataManager.loadJsonData(questDataPath, {})
            
            let updated = false
        
        // 更新每日任务
        for (let [questId, quest] of Object.entries(questData.daily_quests)) {
            if (quest.track_key === trackKey) {
                if (!userQuests.daily[questId]) {
                    userQuests.daily[questId] = { progress: 0, completed: false, claimed: false }
                }
                
                if (!userQuests.daily[questId].completed) {
                    if (isIncrement) {
                        userQuests.daily[questId].progress += value
                    } else {
                        userQuests.daily[questId].progress = Math.max(userQuests.daily[questId].progress, value)
                    }
                    
                    if (userQuests.daily[questId].progress >= quest.target) {
                        userQuests.daily[questId].completed = true
                        updated = true
                    }
                }
            }
        }
        
        // 更新周常任务
        for (let [questId, quest] of Object.entries(questData.weekly_quests)) {
            if (quest.track_key === trackKey) {
                if (!userQuests.weekly[questId]) {
                    userQuests.weekly[questId] = { progress: 0, completed: false, claimed: false }
                }
                
                if (!userQuests.weekly[questId].completed) {
                    if (isIncrement) {
                        userQuests.weekly[questId].progress += value
                    } else {
                        userQuests.weekly[questId].progress = Math.max(userQuests.weekly[questId].progress, value)
                    }
                    
                    if (userQuests.weekly[questId].progress >= quest.target) {
                        userQuests.weekly[questId].completed = true
                        updated = true
                    }
                }
            }
        }
        
        // 更新特殊任务
        for (let [questId, quest] of Object.entries(questData.special_quests)) {
            if (quest.track_key === trackKey) {
                if (!userQuests.special[questId]) {
                    userQuests.special[questId] = { progress: 0, completed: false, claimed: false }
                }
                
                if (!userQuests.special[questId].completed) {
                    if (isIncrement) {
                        userQuests.special[questId].progress += value
                    } else {
                        userQuests.special[questId].progress = Math.max(userQuests.special[questId].progress, value)
                    }
                    
                    if (userQuests.special[questId].progress >= quest.target) {
                        userQuests.special[questId].completed = true
                        updated = true
                    }
                }
            }
        }
        
            await this.saveUserQuests(userId, groupId, userQuests)
            return updated
        } catch (error) {
            console.error('更新任务进度失败:', error)
            return false
        }
    }

    async refreshQuests(e) {
        try {
            
            const userId = e.user_id
            const groupId = e.group_id
            
            // 检查刷新冷却
            const lastRefresh = await redis.ttl(`akasha:quest-refresh-cd:${groupId}:${userId}`)
            if (lastRefresh !== -2) {
                await e.reply(`任务刷新冷却中，还需等待 ${Math.ceil(lastRefresh / 60)} 分钟`)
                return true
            }
            
            const refreshCost = 1000
            const filename = `${groupId}.json`
            const homejson = await akasha_data.getQQYUserHome(userId, {}, filename, false)
            
            if (!homejson[userId] || homejson[userId].money < refreshCost) {
                await e.reply(`刷新任务需要 ${refreshCost} 金币，你的金币不足`)
                return true
            }
            
            // 扣除金币
            homejson[userId].money -= refreshCost
            await akasha_data.getQQYUserHome(userId, homejson, filename, true)
            
            // 重置每日任务进度
            const userQuests = await this.getUserQuests(userId, groupId)
            const today = moment().format('YYYY-MM-DD')
            
            if (userQuests.daily_reset_date === today) {
                userQuests.daily = {}
                userQuests.daily_reset_date = today
                await this.saveUserQuests(userId, groupId, userQuests)
            }
            
            await e.reply([
                global.segment.at(userId), '\n',
                `✅ 任务刷新成功！\n`,
                `💰 花费: ${refreshCost} 金币\n`,
                `🔄 每日任务进度已重置\n`,
                `💡 使用 #任务列表 查看新任务`
            ])
            
            const refreshTime = moment().format('YYYY-MM-DD HH:mm:ss')
            await redis.set(`akasha:quest-refresh-cd:${groupId}:${userId}`, refreshTime, { EX: 86400 })
            
            return true
        } catch (error) {
            console.error('刷新任务失败:', error)
            await e.reply('刷新任务失败，请稍后再试')
            return false
        }
    }
    async showProgress(e) {
        try {
            
            const userId = e.user_id
            const groupId = e.group_id
            
            const userQuests = await this.getUserQuests(userId, groupId)
            const questData = await dataManager.loadJsonData(questDataPath, {})
            
            let msg = ['📊 任务进度查询 📊\n']
            msg.push('━━━━━━━━━━━━━━━━')
            msg.push(`👤 ${e.sender.card || e.sender.nickname || '未知用户'}`)
            msg.push(`🏆 任务点数: ${userQuests.quest_points || 0}`)
            msg.push('━━━━━━━━━━━━━━━━')
        
        msg.push('📅 每日任务:')
        const dailyQuests = questData.daily_quests || {}
        let dailyCompleted = 0
        let dailyTotal = Object.keys(dailyQuests).length
        
        for (let [questId, quest] of Object.entries(dailyQuests)) {
            const userQuest = userQuests.daily?.[questId] || { progress: 0, completed: false, claimed: false }
            const progress = Math.min(userQuest.progress, quest.target)
            const progressPercent = ((progress / quest.target) * 100).toFixed(1)
            
            let status = '⏳'
            if (userQuest.claimed) {
                status = '✅'
                dailyCompleted++
            } else if (userQuest.completed) {
                status = '🎁'
            }
            
            msg.push(`  ${status} ${quest.name} (${progress}/${quest.target} - ${progressPercent}%)`)
        }
        
        msg.push('\n📆 周常任务:')
        const weeklyQuests = questData.weekly_quests || {}
        let weeklyCompleted = 0
        let weeklyTotal = Object.keys(weeklyQuests).length
        
        for (let [questId, quest] of Object.entries(weeklyQuests)) {
            const userQuest = userQuests.weekly?.[questId] || { progress: 0, completed: false, claimed: false }
            const progress = Math.min(userQuest.progress, quest.target)
            const progressPercent = ((progress / quest.target) * 100).toFixed(1)
            
            let status = '⏳'
            if (userQuest.claimed) {
                status = '✅'
                weeklyCompleted++
            } else if (userQuest.completed) {
                status = '🎁'
            }
            
            msg.push(`  ${status} ${quest.name} (${progress}/${quest.target} - ${progressPercent}%)`)
        }
        
        msg.push('\n⭐ 特殊任务:')
        const specialQuests = questData.special_quests || {}
        let specialCompleted = 0
        let specialTotal = Object.keys(specialQuests).length
        
        for (let [questId, quest] of Object.entries(specialQuests)) {
            const userQuest = userQuests.special?.[questId] || { progress: 0, completed: false, claimed: false }
            const progress = Math.min(userQuest.progress, quest.target)
            const progressPercent = ((progress / quest.target) * 100).toFixed(1)
            
            let status = '⏳'
            if (userQuest.claimed) {
                status = '✅'
                specialCompleted++
            } else if (userQuest.completed) {
                status = '🎁'
            }
            
            msg.push(`  ${status} ${quest.name} (${progress}/${quest.target} - ${progressPercent}%)`)
        }
        
        msg.push('\n━━━━━━━━━━━')
        msg.push(`📈 总体进度: ${dailyCompleted + weeklyCompleted + specialCompleted}/${dailyTotal + weeklyTotal + specialTotal} 完成`)
        msg.push('━━━━━━━━━━━━━')
        msg.push('💡 状态说明:')
        msg.push('  ⏳ 进行中  🎁 可领取  ✅ 已完成')
        msg.push('💡 #完成任务 [任务名] - 领取奖励')
        
            await e.reply(msg.join('\n'))
            return true
        } catch (error) {
            console.error('显示任务进度失败:', error)
            await e.reply('获取任务进度失败，请稍后再试')
            return false
        }
     }
    async renderImage(e, file, obj) {
         
             let data = {
                 quality: 100,
                 tplFile: `./plugins/trss-akasha-terminal-plugin/resources/quest/${file}.html`,
                 ...obj,
                // data: obj.templateData  
             }
             let img = await puppeteer.screenshot('trss-akasha-terminal-plugin', {
                 ...data,
             })
            
             await e.reply([img])
        
     }
}

export default Quest