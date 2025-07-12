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
     * 获取任务数据，确保数据完整性
     */
    async getQuestData() {
        try {
            let questData = await dataManager.loadJsonData(questDataPath, {})
            
            // 检查本地数据完整性
            const isLocalDataComplete = questData && 
                                      questData.daily_quests && 
                                      questData.weekly_quests && 
                                      questData.special_quests && 
                                      questData.quest_shop &&
                                      questData.system_initialized
            
            // 如果启用了MySQL，还需要检查MySQL中的数据
            let isMySQLDataComplete = true
            if (dataManager.isMySQL()) {
                try {
                    const mysqlData = await dataManager.mysqlManager.getGlobalData('quest_data')
                    isMySQLDataComplete = mysqlData && 
                                        mysqlData.daily_quests && 
                                        mysqlData.weekly_quests && 
                                        mysqlData.special_quests && 
                                        mysqlData.quest_shop &&
                                        mysqlData.system_initialized
                } catch (error) {
                    console.log('[任务系统] MySQL数据检查失败，将重新初始化:', error.message)
                    isMySQLDataComplete = false
                }
            }
            
            // 如果本地数据不完整，或者MySQL启用但数据不完整，则重新初始化
            if (!isLocalDataComplete || (dataManager.isMySQL() && !isMySQLDataComplete)) {
                console.log('任务数据不完整或未初始化，正在重新初始化...')
                if (!isLocalDataComplete) {
                    console.log('- 本地数据不完整')
                }
                if (dataManager.isMySQL() && !isMySQLDataComplete) {
                    console.log('- MySQL数据不完整或为空')
                }
                questData = await this.initQuestData()
            }
            
            return questData
        } catch (error) {
            console.error('获取任务数据失败:', error)
            console.log('尝试重新初始化任务数据...')
            return await this.initQuestData()
        }
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
                        items: { "6": 1, "7": 1 }, // 稀有道具
                        quest_points: 50
                    },
                    track_key: "level_up_count"
                },
                "weekly_money": {
                    id: "weekly_money",
                    name: "财富积累",
                    description: "累计赚取10000金币",
                    type: "weekly",
                    target: 10000,
                    rewards: {
                        money: 5000,
                        items: { "8": 1 }, // 传说道具
                        quest_points: 80
                    },
                    track_key: "money_earned"
                },
                "weekly_relationship": {
                    id: "weekly_relationship",
                    name: "社交达人",
                    description: "与5个不同的人互动",
                    type: "weekly",
                    target: 5,
                    rewards: {
                        money: 1500,
                        items: { "9": 2 }, // 魅力药水
                        quest_points: 30
                    },
                    track_key: "interaction_count"
                }
            },
            special_quests: {
                "first_login": {
                    id: "first_login",
                    name: "初次登录",
                    description: "首次使用任务系统",
                    type: "special",
                    target: 1,
                    rewards: {
                        money: 1000,
                        items: { "1": 5, "2": 3 },
                        quest_points: 20
                    },
                    permanent: true,
                    track_key: "login_count"
                },
                "achievement_hunter": {
                    id: "achievement_hunter",
                    name: "成就猎人",
                    description: "完成10个任务",
                    type: "special",
                    target: 10,
                    rewards: {
                        money: 3000,
                        items: { "10": 1 }, // 成就徽章
                        quest_points: 100
                    },
                    permanent: true,
                    track_key: "quest_completed_count"
                }
            },
            quest_shop: {
                "1": { name: "体力药水", price: 100, description: "恢复体力", quest_point_price: 5 },
                "2": { name: "幸运符", price: 200, description: "增加幸运值", quest_point_price: 8 },
                "3": { name: "经验药水", price: 300, description: "增加经验", quest_point_price: 12 },
                "4": { name: "能量饮料", price: 150, description: "恢复精力", quest_point_price: 6 },
                "5": { name: "合成催化剂", price: 500, description: "提高合成成功率", quest_point_price: 20 },
                "6": { name: "稀有宝石", price: 800, description: "珍贵的宝石", quest_point_price: 30 },
                "7": { name: "魔法卷轴", price: 1000, description: "神秘的卷轴", quest_point_price: 40 },
                "8": { name: "传说武器", price: 2000, description: "传说级别的武器", quest_point_price: 80 },
                "9": { name: "魅力药水", price: 600, description: "增加魅力值", quest_point_price: 25 },
                "10": { name: "成就徽章", price: 5000, description: "荣誉的象征", quest_point_price: 200 }
            },
            last_daily_refresh: new Date().toDateString(),
            last_weekly_refresh: this.getWeekStart(),
            system_initialized: true,
            version: "1.0.0"
        }

        try {
            // 确保数据目录存在
            const dataDir = path.dirname(questDataPath)
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true })
                console.log('创建数据目录:', dataDir)
            }

            // 保存到本地文件
            await dataManager.saveJsonData(questDataPath, defaultQuestData)
            console.log('任务数据已初始化并保存到本地文件:', questDataPath)

            // 如果启用了MySQL，也保存到数据库
            if (dataManager.isMySQL()) {
                try {
                    // 确保MySQL连接正常
                    if (dataManager.mysqlManager && dataManager.mysqlManager.connection) {
                        // 直接保存全局任务数据到MySQL
                        await dataManager.mysqlManager.saveGlobalData('quest_data', defaultQuestData)
                        console.log('任务数据已保存到MySQL数据库')
                    } else {
                        console.log('MySQL未连接，跳过数据库同步')
                    }
                } catch (error) {
                    console.error('MySQL任务数据保存失败:', error.message)
                    // MySQL失败不影响本地文件的使用
                }
            }

            console.log('任务数据初始化完成')
            return defaultQuestData
            
        } catch (error) {
            console.error('任务数据初始化失败:', error)
            throw error
        }
    }

   
    async showQuests(e) {
        const userId = e.user_id
        const groupId = e.group_id
        const commandName = '任务列表'
 
            
        const userQuests = await this.getUserQuests(userId, groupId)
        const questData = await this.getQuestData()
        const achievements = await this.getUserAchievements(userId, groupId)
        
        // 确保questData有正确的结构
        if (!questData.daily_quests) questData.daily_quests = {}
        if (!questData.weekly_quests) questData.weekly_quests = {}
        if (!questData.special_quests) questData.special_quests = {}
        if (!questData.quest_shop) questData.quest_shop = {}
       
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
        
        
        templateData.currentTime = currentTime;
        templateData.currentDate = currentDate;
        templateData.dailyCompleted = dailyCompleted;
        templateData.weeklyCompleted = weeklyCompleted;
        templateData.specialCompleted = specialCompleted;
        templateData.totalQuests = totalQuests;
        templateData.totalCompleted = totalCompleted;
        templateData.completionRate = completionRate;
        templateData.dailyRefreshHours = dailyRefreshHours;
        templateData.dailyRefreshMinutes = dailyRefreshMinutes;
        templateData.dailyRefreshTime = `${dailyRefreshHours}h ${dailyRefreshMinutes}m`;
        
        // 计算周常任务刷新时间
        const weeklyRefreshMs = nextMonday.getTime() - now.getTime();
        const weeklyRefreshDays = Math.floor(weeklyRefreshMs / (1000 * 60 * 60 * 24));
        const weeklyRefreshHours = Math.floor((weeklyRefreshMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        templateData.weeklyRefreshTime = `${weeklyRefreshDays}d ${weeklyRefreshHours}h`;
        
        await this.renderImage(e, 'quest_cyberpunk', { 
            cssPath: './plugins/trss-akasha-terminal-plugin/resources/quest/quest_cyberpunk.css',
            templateData: templateData
        });
      
       
      
    }

    
    async showDailyQuests(e) {
        const userId = e.user_id
        const groupId = e.group_id
        const commandName = '每日任务'
        
        try {
            const userQuests = await this.getUserQuests(userId, groupId)
            const questData = await this.getQuestData()
            
            const shopData = await TextHelper.getShopData()
            
            if (!questData.daily_quests) questData.daily_quests = {}
            
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
                const rewardsText = this.formatRewards(quest.rewards)
                msg.push(`   🎁 奖励: ${rewardsText}`)
                
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
      
          
                const animeTemplateData = {
                    userId: userId,
                    username: e.sender.card || e.sender.nickname || '未知用户',
                    questPoints: userQuests.quest_points || 0,
                    dailyCompleted: Object.values(userQuests.daily || {}).filter(q => q.claimed).length,
                    dailyTotal: Object.keys(questData.daily_quests).length,
                    streakDays: userQuests.streak_days || 0,
                    refreshTime: this.getRefreshTime(),
                    quests: Object.entries(questData.daily_quests).map(([questId, quest]) => {
                        const userQuest = userQuests.daily?.[questId] || { progress: 0, completed: false, claimed: false }
                        const progress = Math.min(userQuest.progress, quest.target)
                        const progressPercent = Math.round((progress / quest.target) * 100)
                        
                        let statusIcon = '⏳'
                        let status = 'pending'
                        if (userQuest.claimed) {
                            statusIcon = '✅'
                            status = 'claimed'
                        } else if (userQuest.completed) {
                            statusIcon = '🎁'
                            status = 'completed'
                        }
                        
                        return {
                            ...quest,
                            icon: this.getQuestIcon(quest.id),
                            status: status,
                            statusIcon: statusIcon,
                            progressText: `${progress}/${quest.target}`,
                            progressPercent: progressPercent,
                            canClaim: userQuest.completed && !userQuest.claimed,
                            rewards: quest.rewards // 传递原始rewards对象而不是格式化的字符串
                        }
                    })
                }
                
                await this.renderImage(e, 'daily_quests_anime', {
                   ...animeTemplateData
                })
           
        } catch (error) {
            console.error('每日任务获取失败:', error)
            await e.reply('每日任务暂时无法访问，请稍后再试')
            return false
        }
    }

    async showWeeklyQuests(e) {
        const userId = e.user_id
        const groupId = e.group_id
        const commandName = '周常任务'
        
        try {
            const userQuests = await this.getUserQuests(userId, groupId)
            const questData = await this.getQuestData()
            
            const shopData = await TextHelper.getShopData()
            
            if (!questData.weekly_quests) questData.weekly_quests = {}
            
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
                const rewardsText = this.formatRewards(quest.rewards)
                msg.push(`   🎁 奖励: ${rewardsText}`)
                
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
            
            const weeklyCompleted = Object.values(userQuests.weekly || {}).filter(q => q.claimed).length
            const weeklyTotal = Object.keys(questData.weekly_quests).length
            const completionRate = weeklyTotal > 0 ? Math.round((weeklyCompleted / weeklyTotal) * 100) : 0
            
            const templateData = {
                questType: 'weekly',
                title: '📆 周常任务',
                userId: userId,
                username: e.sender.card || e.sender.nickname || '未知用户',
                userLevel: await TextHelper.getUserLevel(userId) || 1,
                questPoints: await this.getUserQuestPoints(userId, groupId),
                weeklyCompleted: weeklyCompleted,
                weeklyTotal: weeklyTotal,
                completionRate: completionRate,
                weeklyPoints: userQuests.weekly_points || 0,
                streakWeeks: userQuests.streak_weeks || 0,
                weeklyBonus: weeklyCompleted === weeklyTotal && weeklyTotal > 0 ? 100 : null,
                refreshTime: this.getWeeklyRefreshTime(),
                quests: Object.entries(questData.weekly_quests).map(([questId, quest]) => {
                    const userQuest = userQuests.weekly?.[questId] || { progress: 0, completed: false, claimed: false }
                    const progress = Math.min(userQuest.progress, quest.target)
                    const progressPercent = Math.round((progress / quest.target) * 100)
                    
                    let status = 'pending'
                    let statusIcon = '⏳'
                    if (userQuest.claimed) {
                        status = 'claimed'
                        statusIcon = '✅'
                    } else if (userQuest.completed) {
                        status = 'completed'
                        statusIcon = '🎁'
                    }
                    
                    // 格式化奖励为数组
                    const rewards = []
                    if (quest.rewards.money) {
                        rewards.push({ icon: '💰', text: `${quest.rewards.money} 金币` })
                    }
                    if (quest.rewards.quest_points) {
                        rewards.push({ icon: '🎯', text: `${quest.rewards.quest_points} 任务点` })
                    }
                    if (quest.rewards.love) {
                        rewards.push({ icon: '💕', text: `${quest.rewards.love} 爱心` })
                    }
                    if (quest.rewards.items) {
                        for (let [itemId, count] of Object.entries(quest.rewards.items)) {
                            rewards.push({ icon: '🎁', text: `道具${itemId} ×${count}` })
                        }
                    }
                    
                    return {
                        id: questId,
                        name: quest.name,
                        description: quest.description,
                        requirement: quest.requirement || '',
                        status: status,
                        statusIcon: statusIcon,
                        progress: progress,
                        target: quest.target,
                        progressPercent: progressPercent,
                        difficulty: 'normal',
                        difficultyText: '普通',
                        rewards: rewards,
                        canClaim: userQuest.completed && !userQuest.claimed
                    }
                })
            }
             
            try {
                await this.renderImage(e, 'weekly_quests', {
                    ...templateData
                })
            } catch (error) {
                console.error('周常任务渲染失败:', error)
                await e.reply(msg.join('\n'))
            }
        
            return true
        } catch (error) {
            console.error('周常任务获取失败:', error)
            await e.reply('周常任务暂时无法访问，请稍后再试')
            return false
        }
    }

   
    async showSpecialQuests(e) {
        const userId = e.user_id
        const groupId = e.group_id
        const commandName = '特殊任务'
      
            const userQuests = await this.getUserQuests(userId, groupId)
        const questData = await this.getQuestData()
        
        const shopData = await TextHelper.getShopData()
        
        // 确保questData有正确的结构
        if (!questData.special_quests) questData.special_quests = {}
        
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
        
       
            await this.renderImage(e, 'special_quests', {
                ...templateData
            })
       
    }

    
    async claimReward(e) {
        const userId = e.user_id
        const groupId = e.group_id
        const commandName = '领取奖励'
        const questName = e.msg.match(/^#?(领取奖励|完成任务)\\s*(.+)$/)?.[2]?.trim()
        
        if (!questName) {
            await e.reply('请指定要领取奖励的任务名称！')
            return true
        }
        
        try {
            

        const userQuests = await this.getUserQuests(userId, groupId)
        const questData = await this.getQuestData()
        
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
        
   
            
            
            const userQuests = await this.getUserQuests(userId, groupId)
        const questData = await this.getQuestData()
        
        const achievements = await this.getUserAchievements(userId, groupId)
        
       
        if (!questData.quest_shop) questData.quest_shop = {}
       
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
        
      
            await this.renderImage(e, 'quest_shop_standalone', {
                ...templateData
            })
       
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
        const questData = await this.getQuestData()
        
        if (!questData.quest_shop) questData.quest_shop = {}
        
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

    getRefreshTime() {
        const now = new Date()
        const tomorrow = new Date(now)
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(0, 0, 0, 0)
        const timeToReset = Math.ceil((tomorrow - now) / (1000 * 60 * 60))
        return `${timeToReset}小时`
    }

    getQuestIcon(questId) {
        const iconMap = {
            'daily_work': '💼',
            'daily_date': '💕',
            'daily_shop': '🛍️',
            'daily_synthesis': '⚗️',
            'daily_gift': '🎁'
        }
        return iconMap[questId] || '📋'
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
        const questData = await this.getQuestData()
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
            const questData = await this.getQuestData()
            
            // 确保questData有正确的结构
            if (!questData.daily_quests) questData.daily_quests = {}
            if (!questData.weekly_quests) questData.weekly_quests = {}
            if (!questData.special_quests) questData.special_quests = {}
            
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
    
    
    formatRewards(rewards) {
        const rewardTexts = []
        
        if (rewards.money) {
            rewardTexts.push(`💰${rewards.money}`)
        }
        
        if (rewards.love) {
            rewardTexts.push(`❤️${rewards.love}`)
        }
        
        if (rewards.quest_points) {
            rewardTexts.push(`🏆${rewards.quest_points}`)
        }
        
        if (rewards.items) {
            for (const [itemId, count] of Object.entries(rewards.items)) {
                const itemName = this.getItemName(itemId)
                rewardTexts.push(`${itemName}×${count}`)
            }
        }
        
        return rewardTexts.join(', ') || '无奖励'
    }
    
    /**
     * 获取物品名称
     * @param {string} itemId - 物品ID
     * @returns {string} 物品名称
     */
    getItemName(itemId) {
        const itemNames = {
            '1': '体力药水',
            '2': '幸运符',
            '3': '经验书',
            '4': '金币袋',
            '5': '神秘宝箱'
        }
        return itemNames[itemId] || `道具${itemId}`
    }
  
    /**
     * 获取任务图标
     */
    getQuestIcon(questId) {
        const iconMap = {
            'daily_work': '💼',
            'daily_date': '💕',
            'daily_shop': '🛍️',
            'daily_synthesis': '⚗️',
            'daily_gift': '🎁'
        }
        return iconMap[questId] || '📋'
    }
    
    /**
     * 获取刷新时间
     */
    getRefreshTime() {
        const now = new Date()
        const tomorrow = new Date(now)
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(0, 0, 0, 0)
        
        const diff = tomorrow.getTime() - now.getTime()
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        
        return `${hours}h ${minutes}m`
    }
    
    /**
     * 获取周常任务刷新时间
     */
    getWeeklyRefreshTime() {
        const now = new Date()
        const currentDay = now.getDay() // 0 = Sunday, 1 = Monday, ...
        const daysUntilMonday = currentDay === 0 ? 1 : 8 - currentDay
        
        const nextMonday = new Date(now)
        nextMonday.setDate(now.getDate() + daysUntilMonday)
        nextMonday.setHours(0, 0, 0, 0)
        
        const diff = nextMonday.getTime() - now.getTime()
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        
        if (days > 0) {
            return `${days}d ${hours}h`
        } else {
            return `${hours}h`
        }
    }

    async renderImage(e, file, obj) {
         
             let data = {
                 quality: 100,
                 tplFile: `./plugins/trss-akasha-terminal-plugin/resources/quest/${file}.html`,
                 ...obj,
             }
             let img = await puppeteer.screenshot('trss-akasha-terminal-plugin', {
                 ...data,
             })
            
             await e.reply([img])
        
     }
}