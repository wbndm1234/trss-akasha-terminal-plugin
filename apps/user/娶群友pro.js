import { plugin } from '../../model/api/api.js'
import fs from 'fs'
import moment from "moment"
import command from '../../components/command.js'
import akasha_data from '../../components/akasha_data.js'
import puppeteer from '../../../../lib/puppeteer/puppeteer.js'
import cooldownConfig from '../../components/cooldown_config.js'
import { QuestSystem } from '../../components/quest_system.js'
import mysqlManager from '../../components/mysql_manager.js'
import TextHelper from '../../components/text.js'
import dataManager from '../../components/data_manager.js'

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
const userInventoryPath = 'plugins/trss-akasha-terminal-plugin/data/user_inventory.json'
const shopDataPath = 'plugins/trss-akasha-terminal-plugin/data/shop_data.json'
const relationshipPath = 'plugins/trss-akasha-terminal-plugin/data/relationship_data.json'

export class Wifepro extends plugin {
    constructor() {
        super({
            name: 'pro版娶群友',
            dsc: 'pro版娶群友',
            event: 'message',
            priority: 64,
            rule: [
                {
                    reg: '^#?(约会|去约会)$',
                    fnc: 'goOnDate'
                },
                {
                    reg: '^#?(情侣任务|夫妻任务)$',
                    fnc: 'coupleTask'
                },
                {
                    reg: '^#?(表白|告白)$',
                    fnc: 'confession'
                },
                {
                    reg: '^#?(求婚|结婚)$',
                    fnc: 'propose'
                },
                {
                    reg: '^#?(情侣排行|cp排行)$',
                    fnc: 'coupleRanking'
                },
                {
                    reg: '^#?(送礼物|赠送礼物)$',
                    fnc: 'giveGift'
                },
                {
                    reg: '^#?(情侣决斗|cp决斗)$',
                    fnc: 'coupleDuel'
                },
                {
                    reg: '^#?(开设店铺|开店)$',
                    fnc: 'openShop'
                },
                {
                    reg: '^#?(我的店铺|店铺信息)$',
                    fnc: 'shopInfo'
                },
                {
                    reg: '^#?(升级店铺|店铺升级)$',
                    fnc: 'upgradeShop'
                },
                {
                    reg: '^#?(情侣冒险|夫妻冒险)$',
                    fnc: 'coupleAdventure'
                },
                {
                    reg: '^#?(cp银行|存爱心)$',
                    fnc: 'loveBank'
                },
                {
                    reg: '^#?(取爱心|提取爱心)$',
                    fnc: 'withdrawLove'
                }
            ]
        })
        this.initRelationshipData()
    }

    /**
     * 初始化关系数据
     */
    async initRelationshipData() {
        const defaultData = {
            couples: {},
            shops: {},
            adventures: {},
            love_bank: {}
        }

        const existingData = await dataManager.loadJsonData(relationshipPath, null)
        if (!existingData) {
            await dataManager.saveJsonData(relationshipPath, defaultData)
        }
    }

    
    async goOnDate(e) {
        const userId = e.user_id
        const groupId = e.group_id
        const commandName = '约会'
        
            await mysqlManager.logCommandUsage(userId, groupId, commandName, e.msg, true)
        const filename = `${groupId}.json`
        
        const homejson = await dataManager.getUserHome(userId, {}, filename, false)
        if (!homejson[userId] || homejson[userId].s === 0) {
            await e.reply('你还没有老婆，无法约会！')
            return true
        }

        const lastDate = await redis.ttl(`akasha:enhanced-date-cd:${groupId}:${userId}`)
        if (lastDate !== -2) {
            await e.reply(`约会冷却中，还需等待 ${Math.ceil(lastDate / 60)} 分钟`)
            return true
        }

        // 检查是否有幸运符加成
        const luckBoost = await TextHelper.getLuckBoost(userId, groupId)
        //后续会修改这样的事件数据
        const dateEvents = [
            {
                name: "浪漫晚餐",
                success_rate: 70 + luckBoost,
                love_gain: 150,
                money_cost: 300,
                description: "在高级餐厅享受烛光晚餐"
            },
            {
                name: "游乐园约会",
                success_rate: 80 + luckBoost,
                love_gain: 120,
                money_cost: 200,
                description: "在游乐园度过快乐时光"
            },
            {
                name: "电影院约会",
                success_rate: 85 + luckBoost,
                love_gain: 100,
                money_cost: 150,
                description: "一起看一场浪漫电影"
            },
            {
                name: "海边散步",
                success_rate: 90 + luckBoost,
                love_gain: 80,
                money_cost: 50,
                description: "在海边享受宁静时光"
            }
        ]

        const randomEvent = dateEvents[Math.floor(Math.random() * dateEvents.length)]
        
        if (homejson[userId].money < randomEvent.money_cost) {
            await e.reply(`约会资金不足！需要 ${randomEvent.money_cost} 金币`)
            return true
        }

        const success = Math.random() * 100 < randomEvent.success_rate
        
        if (success) {
            homejson[userId].money -= randomEvent.money_cost
            homejson[userId].love += randomEvent.love_gain
            
            // 检查是否有打工收入加成
            const workBoost = await TextHelper.getWorkBoost(userId, groupId)
            if (workBoost > 1) {
                const bonusLove = Math.floor(randomEvent.love_gain * (workBoost - 1))
                homejson[userId].love += bonusLove
                await TextHelper.consumeWorkBoost(userId, groupId)
            }
            
            await dataManager.saveUserHome(userId, homejson[userId], filename, true)
            
            // 更新约会任务进度
            const questSystem = new QuestSystem()
            await questSystem.updateQuestProgress(userId, groupId, 'date_count', 1, true)
                // 更新爱心相关特殊任务
                await questSystem.updateQuestProgress(userId, groupId, 'max_love', homejson[userId].love, false)
                // 更新社交互动计数
                await questSystem.updateQuestProgress(userId, groupId, 'interaction_count', 1, true)
            
            await e.reply([
                global.segment.at(userId), '\n',
                `💕 约会成功！\n`,
                `📍 地点: ${randomEvent.name}\n`,
                `💰 花费: ${randomEvent.money_cost} 金币\n`,
                `❤️ 好感度 +${randomEvent.love_gain}\n`,
                `💳 余额: ${homejson[userId].money} 金币\n`,
                `💖 当前好感度: ${homejson[userId].love}`
            ])
        } else {
            homejson[userId].money -= Math.floor(randomEvent.money_cost / 2)
            await dataManager.saveUserHome(userId, homejson[userId], filename, true)
            
            await e.reply([
                global.segment.at(userId), '\n',
                `😅 约会失败了...\n`,
                `💔 ${randomEvent.description}，但是出了点小意外\n`,
                `💰 损失: ${Math.floor(randomEvent.money_cost / 2)} 金币\n`,
                `💳 余额: ${homejson[userId].money} 金币`
            ])
        }

        // 消耗幸运符
        if (luckBoost > 0) {
            await TextHelper.consumeLuckBoost(userId, groupId)
        }

        const templateData = {
            hasWife: true,
            userAvatar: '👤',
            username: e.sender.card || e.sender.nickname || '未知用户',
            level: await TextHelper.getUserLevel(userId),
            money: await TextHelper.getUserMoney(userId, groupId),
            wifeAvatar: '👤',
            wifeName: homejson[userId].s_name || '未知',
            loveDays: Math.floor((Date.now() - (homejson[userId].marriageTime || Date.now())) / (1000 * 60 * 60 * 24)),
            intimacy: homejson[userId].love || 0,
            relationshipStatus: TextHelper.getRelationshipStatus(homejson[userId].love || 0),
            dateEvent: {
                name: randomEvent.name,
                description: randomEvent.description,
                success: success,
                loveGain: success ? randomEvent.love_gain : 0,
                moneyCost: randomEvent.money_cost,
                resultMessage: success ? 
                    `约会成功！获得 ${randomEvent.love_gain} 好感度` : 
                    `约会失败了，但你们度过了愉快的时光`
            },
            rankings: [],
            loveBalance: 0,
            interestRate: 2.5
        }
        

            
          await this.renderImage(e, 'date', { 
                ...templateData,
            });
            
        const dateCooldown = cooldownConfig.getEnhancedWifeCooldown('date_cooldown', 3600)
        await redis.set(`akasha:enhanced-date-cd:${groupId}:${userId}`, currentTime, { EX: dateCooldown })
       
       
    }

    
    async coupleTask(e) {
        const userId = e.user_id
        const groupId = e.group_id
        const filename = `${groupId}.json`
        
        const homejson = await dataManager.getUserHome(userId, {}, filename, false)
        if (!homejson[userId] || homejson[userId].s === 0) {
            await e.reply('你还没有老婆，无法进行情侣任务！')
            return true
        }

        const partnerId = homejson[userId].s
        const tasks = [
            {
                name: "共同打工",
                description: "两人一起努力工作",
                reward_money: 800,
                reward_love: 200,
                requirement: "双方金币 > 100"
            },
            {
                name: "爱心料理",
                description: "一起制作美味料理",
                reward_money: 500,
                reward_love: 300,
                requirement: "好感度 > 500"
            },
            {
                name: "浪漫旅行",
                description: "前往浪漫的地方旅行",
                reward_money: 1200,
                reward_love: 400,
                requirement: "双方金币 > 1000"
            }
        ]

        const randomTask = tasks[Math.floor(Math.random() * tasks.length)]
        
        // 检查任务要求
        let canComplete = true
        let failReason = ''
        
        if (randomTask.name === "共同打工" && homejson[userId].money <= 100) {
            canComplete = false
            failReason = '金币不足100'
        } else if (randomTask.name === "爱心料理" && homejson[userId].love <= 500) {
            canComplete = false
            failReason = '好感度不足500'
        } else if (randomTask.name === "浪漫旅行" && homejson[userId].money <= 1000) {
            canComplete = false
            failReason = '金币不足1000'
        }

        if (!canComplete) {
            await e.reply([
                global.segment.at(userId), '\n',
                `❌ 无法完成任务: ${randomTask.name}\n`,
                `📋 要求: ${randomTask.requirement}\n`,
                `💔 失败原因: ${failReason}`
            ])
            return true
        }

        // 完成任务
        homejson[userId].money += randomTask.reward_money
        homejson[userId].love += randomTask.reward_love
        
        // 更新特殊任务进度
        const { QuestSystem } = await import('../../components/quest_system.js')
        const questSystem = new QuestSystem()
        await questSystem.updateQuestProgress(userId, groupId, 'max_money', homejson[userId].money)
        await questSystem.updateQuestProgress(userId, groupId, 'max_love', homejson[userId].love)
        
        // 如果cp也存在，给cp也加奖励
        if (homejson[partnerId]) {
            homejson[partnerId].money += Math.floor(randomTask.reward_money * 0.8)
            homejson[partnerId].love += Math.floor(randomTask.reward_love * 0.8)
            
            // 更新cp的特殊任务进度
            await questSystem.updateQuestProgress(partnerId, groupId, 'max_money', homejson[partnerId].money)
            await questSystem.updateQuestProgress(partnerId, groupId, 'max_love', homejson[partnerId].love)
        }
        
        await dataManager.saveUserHome(userId, homejson[userId], filename, true)
        
        // 获取统计数据
        const totalUsers = Object.keys(homejson).length
        const totalCommands = await this.getTotalCommands() || 0
        const successRate = await this.getSuccessRate() || 85
        
       
        const templateData = {
            hasWife: true,
            userAvatar: '👤',
            username: e.sender.card || e.sender.nickname || '未知用户',
            level: await TextHelper.getUserLevel(userId),
            money: await TextHelper.getUserMoney(userId, groupId),
            wifeAvatar: '👤',
            wifeName: homejson[userId].s_name || '未知',
            loveDays: Math.floor((Date.now() - (homejson[userId].marriageTime || Date.now())) / (1000 * 60 * 60 * 24)),
            intimacy: homejson[userId].love || 0,
            relationshipStatus: TextHelper.getRelationshipStatus(homejson[userId].love || 0),
            coupleTask: {
                name: randomTask.name,
                description: randomTask.description,
                rewardMoney: randomTask.reward_money,
                rewardLove: randomTask.reward_love,
                requirement: randomTask.requirement,
                completed: canComplete
            },
            rankings: [],
            loveBalance: 0,
            interestRate: 2.5,
            // 仪表板统计数据
            totalUsers: totalUsers,
            totalCommands: totalCommands,
            successRate: successRate
        }
        
        try {
            const img = await puppeteer.screenshot('couple_task', {
                tplFile: './resources/couple_task/couple_task.html',
                cssPath: './resources/couple_task/couple_task.css',
                ...templateData
            })
            
            if (img) {
                await e.reply(img)
            } else {
                TextHelper.showCoupleTaskText(e, templateData)
            }
        } catch (error) {
            console.error('情侣任务渲染失败:', error)
            TextHelper.showCoupleTaskText(e, templateData)
        }
        
        return true
    }

   
    async confession(e) {
        if (!e.at) {
            await e.reply('请@你要表白的对象')
            return true
        }

        const userId = e.user_id
        const targetId = e.at
        const groupId = e.group_id
        const filename = `${groupId}.json`
        
        if (userId === targetId) {
            await e.reply('不能对自己表白哦！')
            return true
        }

        const homejson = await dataManager.getUserHome(userId, {}, filename, false)
        if (!homejson[userId]) {
            await e.reply('请先创建存档')
            return true
        }

        // 检查是否已有对象
        if (homejson[userId].s !== 0 && homejson[userId].s !== undefined && homejson[userId].s !== null && homejson[userId].s !== '') {
            await e.reply('你已经有对象了，不能表白！')
            return true
        }

        // 检查表白冷却
        const lastConfession = await redis.ttl(`akasha:confession-cd:${groupId}:${userId}`)
        if (lastConfession !== -2) {
            await e.reply(`表白冷却中，还需等待 ${Math.ceil(lastConfession / 60)} 分钟`)
            return true
        }

        // 检查是否有爱心巧克力加成
        const inventory = await TextHelper.getUserInventory(userId, groupId)
        let successBonus = 0
        if (inventory['1'] && inventory['1'] > 0) { // 爱心巧克力
            successBonus = 20
            await TextHelper.removeFromInventory(userId, groupId, 1, 1)
        }

        const baseSuccessRate = 60 + successBonus
        const luckBoost = await TextHelper.getLuckBoost(userId, groupId)
        const finalSuccessRate = Math.min(95, baseSuccessRate + luckBoost)
        
        const success = Math.random() * 100 < finalSuccessRate
        
        if (success) {
            // 设置等待状态
            const confessionWait = cooldownConfig.getEnhancedWifeCooldown('confession_wait', 300)
        await redis.set(`akasha:confession-wait:${groupId}:${targetId}`, userId, { EX: confessionWait })
            
            await e.reply([
                global.segment.at(userId), ' 向 ', global.segment.at(targetId), ' 表白了！\n',
                `💕 "愿意和我在一起吗？"\n`,
                `💖 ${global.segment.at(targetId)} 请回复 #我愿意 或 #我拒绝`
            ])
        } else {
            await e.reply([
                global.segment.at(userId), '\n',
                `💔 表白失败了...\n`,
                `😅 也许时机还不对，再努力一下吧！`
            ])
        }

        // 消耗幸运符
        if (luckBoost > 0) {
            await TextHelper.consumeLuckBoost(userId, groupId)
        }

        // 获取目标用户信息
        const targetName = homejson[targetId]?.s_name || '未知用户'
        const currentTime = Math.floor(Date.now() / 1000)
       
        const templateData = {
            hasWife: false,
            userAvatar: '👤',
            username: e.sender.card || e.sender.nickname || '未知用户',
            level: await TextHelper.getUserLevel(userId),
            money: await TextHelper.getUserMoney(userId, groupId),
            targetName: targetName,
            confessionEvent: {
                name: '浪漫表白',
                description: '用真诚的话语表达内心的爱意',
                success: success,
                successRate: finalSuccessRate,
                bonusUsed: successBonus > 0,
                resultMessage: success ? 
                    `表白成功！${targetName} 接受了你的表白！` : 
                    `表白失败了，但不要灰心，继续努力吧！`
            },
            rankings: [],
            loveBalance: 0,
            interestRate: 2.5
        }
        
        try {
             await this.renderImage(e, 'confession', { templateData })
           
        } catch (error) {
            console.error('表白渲染失败:', error)
            TextHelper.showConfessionResultText(e, templateData)
        }
        const confessionCooldown = cooldownConfig.getEnhancedWifeCooldown('confession_cooldown', 1800)
        await redis.set(`akasha:confession-cd:${groupId}:${userId}`, currentTime, { EX: confessionCooldown })
        
        return true
    }

    async openShop(e) {
        const userId = e.user_id
        const groupId = e.group_id
        const filename = `${groupId}.json`
        
        const homejson = await dataManager.getUserHome(userId, {}, filename, false)
        if (!homejson[userId]) {
            await e.reply('请先创建存档')
            return true
        }

        const relationshipData = await dataManager.loadJsonData(relationshipPath, {})
        const shopKey = `${groupId}_${userId}`
        
        if (relationshipData.shops[shopKey]) {
            await e.reply('你已经有店铺了！使用 #我的店铺 查看详情')
            return true
        }

        const shopCost = 5000
        if (homejson[userId].money < shopCost) {
            await e.reply(`开设店铺需要 ${shopCost} 金币，你只有 ${homejson[userId].money} 金币`)
            return true
        }

        // 扣除金币并创建店铺
        homejson[userId].money -= shopCost
        await dataManager.saveUserHome(userId, homejson[userId], filename, true)
        
        relationshipData.shops[shopKey] = {
            owner: userId,
            name: `${userId}的小店`,
            level: 1,
            income_rate: 100, // 每小时收入
            last_collect: Date.now(),
            upgrades: {
                decoration: 0,
                equipment: 0,
                staff: 0
            }
        }
        
        await dataManager.saveJsonData(relationshipPath, relationshipData)
        
        await e.reply([
            global.segment.at(userId), '\n',
            `🏪 店铺开设成功！\n`,
            `💰 花费: ${shopCost} 金币\n`,
            `📈 每小时收入: ${relationshipData.shops[shopKey].income_rate} 金币\n`,
            `💡 使用 #我的店铺 查看详情\n`,
            `💡 使用 #升级店铺 提升收入`
        ])
        
        return true
    }

    
    async shopInfo(e) {
        const userId = e.user_id
        const groupId = e.group_id
        
        const relationshipData = JSON.parse(fs.readFileSync(relationshipPath, 'utf8'))
        const shopKey = `${groupId}_${userId}`
        const shop = relationshipData.shops[shopKey]
        
        if (!shop) {
            await e.reply('你还没有店铺，使用 #开设店铺 来开设一个吧！')
            return true
        }

       
        const now = Date.now()
        const timeDiff = (now - shop.last_collect) / (1000 * 60 * 60) // 小时
        const pendingIncome = Math.floor(timeDiff * shop.income_rate)
        
        const msg = [
            `🏪 ${shop.name}`,
            `━━━━━━━━━━━━━`,
            `📊 等级: ${shop.level}`,
            `💰 每小时收入: ${shop.income_rate} 金币`,
            `💎 待收集收入: ${pendingIncome} 金币`,
            `🎨 装修等级: ${shop.upgrades.decoration}`,
            `⚙️ 设备等级: ${shop.upgrades.equipment}`,
            `👥 员工等级: ${shop.upgrades.staff}`,
            `━━━━━━━━━━━━━`,
            `💡 发送任意消息自动收集收入`,
            `💡 使用 #升级店铺 提升店铺`
        ]
        
        await e.reply(msg.join('\n'))
        
        // 自动收集收入
        if (pendingIncome > 0) {
            const filename = `${groupId}.json`
            const homejson = await dataManager.getUserHome(userId, {}, filename, false)
            homejson[userId].money += pendingIncome
            await dataManager.saveUserHome(userId, homejson[userId], filename, true)
            
            shop.last_collect = now
            fs.writeFileSync(relationshipPath, JSON.stringify(relationshipData, null, 2))
            
            setTimeout(() => {
                e.reply(`💰 自动收集店铺收入: ${pendingIncome} 金币`)
            }, 1000)
        }
        
        return true
    }

    
    async coupleRanking(e) {
        const groupId = e.group_id
        const filename = `${groupId}.json`
        
        const homejson = await dataManager.getUserHome(0, {}, filename, false)
        
        // 找出所有情侣
        const couples = []
        const processed = new Set()
        
        for (let userId of Object.keys(homejson)) {
            if (processed.has(userId) || homejson[userId].s === 0) continue
            
            const partnerId = homejson[userId].s
            if (homejson[partnerId] && homejson[partnerId].s == userId) {
                // 双向关系，真正的情侣
                const totalLove = homejson[userId].love + homejson[partnerId].love
                couples.push({
                    user1: userId,
                    user2: partnerId,
                    totalLove: totalLove,
                    user1Love: homejson[userId].love,
                    user2Love: homejson[partnerId].love
                })
                processed.add(userId)
                processed.add(partnerId)
            } else if (homejson[partnerId]) {
                // 单向关系，也算作情侣
                const partnerLove = homejson[partnerId].love || 0
                const totalLove = homejson[userId].love + partnerLove
                couples.push({
                    user1: userId,
                    user2: partnerId,
                    totalLove: totalLove,
                    user1Love: homejson[userId].love,
                    user2Love: partnerLove
                })
                processed.add(userId)
                processed.add(partnerId)
            }
        }
        
        if (couples.length === 0) {
            await e.reply('本群还没有真正的情侣哦~')
            return true
        }
        
        // 按总好感度排序
        couples.sort((a, b) => b.totalLove - a.totalLove)
        
       
        const templateData = {
            hasWife: false,
            userAvatar: '👤',
            username: '游客',
            level: 1,
            money: 0,
            rankings: couples.slice(0, 10).map((couple, index) => ({
                rank: index + 1,
                user1: couple.user1,
                user2: couple.user2,
                intimacy: couple.totalLove
            })),
            loveBalance: 0,
            interestRate: 2.5
        }
        
        try {
            const img = await puppeteer.screenshot('couple_ranking', {
                tplFile: './resources/couple_ranking/couple_ranking.html',
                cssPath: './resources/couple_ranking/couple_ranking.css',
                ...templateData
            })
            
            if (img) {
                await e.reply(img)
            } else {
                TextHelper.showCoupleRankingText(e, templateData)
            }
        } catch (error) {
            console.error('排行榜渲染失败:', error)
            TextHelper.showCoupleRankingText(e, templateData)
        }
        
        return true
    }
    
   
    async showSingleStatus(e) {
        const userId = e.user_id
        const groupId = e.group_id
        const coupleData = await this.getCoupleData(userId, groupId)
        
        if (coupleData) {
            e.reply('💑 你已经有伴侣了哦~')
            return
        }
        
        const userLevel = await TextHelper.getUserLevel(userId)
        const userMoney = await TextHelper.getUserMoney(userId, groupId)
        const confessionCount = await this.getConfessionCount(userId, groupId)
        const rankings = await this.getCoupleRankings(groupId)
        const bankData = await this.getLoveBankData(userId, groupId)
        
       
        const templateData = {
            hasWife: false,
            userAvatar: '👤',
            username: e.sender.card || e.sender.nickname || '未知用户',
            level: userLevel,
            money: userMoney,
            confessionCount,
            maxConfessions: 3,
            rankings: rankings.slice(0, 10).map((couple, index) => ({
                rank: index + 1,
                user1: couple.user1Name,
                user2: couple.user2Name,
                intimacy: couple.intimacy
            })),
            loveBalance: bankData.balance || 0,
            interestRate: bankData.interestRate || 2.5
        }
        
        try {
            const img = await puppeteer.screenshot('single_status', {
                tplFile: './resources/single_status/single_status.html',
                cssPath: './resources/single_status/single_status.css',
                ...templateData
            })
            
            if (img) {
                e.reply(img)
            } else {
                TextHelper.showSingleStatusText(e, templateData)
            }
        } catch (error) {
            console.error('单身状态渲染失败:', error)
            TextHelper.showSingleStatusText(e, templateData)
        }
    }
    

    
    
    async showLoveBank(e) {
        const userId = e.user_id
        const groupId = e.group_id
        const bankData = await this.getLoveBankData(userId, groupId)
        const coupleData = await this.getCoupleData(userId, groupId)
        const rankings = await this.getCoupleRankings(groupId)
        
       
        const templateData = {
            hasWife: !!coupleData,
            userAvatar: '👤',
            username: e.sender.card || e.sender.nickname || '未知用户',
            level: await TextHelper.getUserLevel(userId),
            money: await TextHelper.getUserMoney(userId, groupId),
            ...(coupleData && {
                wifeAvatar: '👤',
                wifeName: coupleData.user1Id === userId ? coupleData.user2Name : coupleData.user1Name,
                loveDays: Math.floor((Date.now() - coupleData.marriageTime) / (1000 * 60 * 60 * 24)),
                intimacy: await this.getIntimacy(userId, groupId),
                relationshipStatus: TextHelper.getRelationshipStatus(await this.getIntimacy(userId, groupId))
            }),
            rankings: rankings.slice(0, 10).map((couple, index) => ({
                rank: index + 1,
                user1: couple.user1Name,
                user2: couple.user2Name,
                intimacy: couple.intimacy
            })),
            loveBalance: bankData.balance || 0,
            interestRate: bankData.interestRate || 2.5,
            lastInterest: new Date(bankData.lastInterest || Date.now()).toLocaleDateString()
        }
        
        try {
            const img = await puppeteer.screenshot('love_bank', {
                tplFile: './resources/love_bank/love_bank.html',
                cssPath: './resources/love_bank/love_bank.css',
                ...templateData
            })
            
            if (img) {
                e.reply(img)
            } else {
                TextHelper.showLoveBankText(e, templateData)
            }
        } catch (error) {
            console.error('CP银行渲染失败:', error)
            TextHelper.showLoveBankText(e, templateData)
        }
    }
    

    


    
    async coupleDuel(e) {
        if (!e.at) {
            await e.reply('请@你要挑战的情侣对象')
            return true
        }

        const userId = e.user_id
        const targetId = e.at
        const groupId = e.group_id
        const filename = `${groupId}.json`
        
        if (userId === targetId) {
            await e.reply('不能挑战自己！')
            return true
        }

        const homejson = await akasha_data.getQQYUserHome(userId, {}, filename, false)
        if (!homejson[userId] || homejson[userId].s === 0) {
            await e.reply('你还没有老婆，无法进行情侣决斗！')
            return true
        }

        if (!homejson[targetId] || homejson[targetId].s === 0) {
            await e.reply('对方还没有老婆，无法进行情侣决斗！')
            return true
        }

        // 检查决斗冷却
        const lastDuel = await redis.ttl(`akasha:duel-cd:${groupId}:${userId}`)
        if (lastDuel !== -2) {
            await e.reply(`决斗冷却中，还需等待 ${Math.ceil(lastDuel / 60)} 分钟`)
            return true
        }

        const duelCost = 1000
        if (homejson[userId].money < duelCost || homejson[targetId].money < duelCost) {
            await e.reply(`决斗需要双方都有 ${duelCost} 金币作为赌注`)
            return true
        }

        // 计算决斗力量值
        const userPower = TextHelper.calculateDuelPower(homejson[userId])
        const targetPower = TextHelper.calculateDuelPower(homejson[targetId])
        
        // 添加随机因素
        const userFinalPower = userPower + Math.random() * 500
        const targetFinalPower = targetPower + Math.random() * 500
        
        const userWins = userFinalPower > targetFinalPower
        const winner = userWins ? userId : targetId
        const loser = userWins ? targetId : userId
        
        // 奖励和惩罚
        const winReward = 1500
        const loseReward = 500
        
        homejson[winner].money += winReward
        homejson[winner].love += 100
        homejson[loser].money -= loseReward
        
        // 更新获胜者的特殊任务进度
        const { QuestSystem } = await import('../../components/quest_system.js')
        const questSystem = new QuestSystem()
        await questSystem.updateQuestProgress(winner, groupId, 'max_money', homejson[winner].money)
        await questSystem.updateQuestProgress(winner, groupId, 'max_love', homejson[winner].love)
        
        // 更新失败者的金币任务进度（如果金币减少后仍然需要更新）
        if (homejson[loser].money > 0) {
            await questSystem.updateQuestProgress(loser, groupId, 'max_money', homejson[loser].money)
        }
        
        await akasha_data.getQQYUserHome(userId, homejson, filename, true)
        const templateData = {
            hasWife: true,
            userAvatar: '👤',
            username: e.sender.card || e.sender.nickname || '未知用户',
            level: await TextHelper.getUserLevel(userId),
            money: await TextHelper.getUserMoney(userId, groupId),
            wifeAvatar: '👤',
            wifeName: homejson[userId].s_name || '未知',
            loveDays: Math.floor((Date.now() - (homejson[userId].marriageTime || Date.now())) / (1000 * 60 * 60 * 24)),
            intimacy: homejson[userId].love || 0,
            relationshipStatus: TextHelper.getRelationshipStatus(homejson[userId].love || 0),
            duel: {
                challenger: e.sender.card || e.sender.nickname || '未知用户',
                target: '对手',
                userPower: Math.floor(userFinalPower),
                targetPower: Math.floor(targetFinalPower),
                winner: userWins ? '你' : '对手',
                winReward: winReward,
                loseReward: loseReward,
                resultMessage: userWins ? 
                    `恭喜获胜！获得 ${winReward} 金币和 100 好感度` : 
                    `很遗憾败北，损失 ${loseReward} 金币`
            },
            rankings: [],
            loveBalance: 0,
            interestRate: 2.5
        }
        
        try {
            const img = await puppeteer.screenshot('couple_duel', {
                tplFile: './resources/couple_duel/couple_duel.html',
                cssPath: './resources/couple_duel/couple_duel.css',
                ...templateData
            })
            
            if (img) {
                await e.reply(img)
            } else {
                TextHelper.showDuelResultText(e, templateData)
            }
        } catch (error) {
            console.error('决斗渲染失败:', error)
            TextHelper.showDuelResultText(e, templateData)
        }
        const duelCooldown = cooldownConfig.getEnhancedWifeCooldown('duel_cooldown', 7200)
        await redis.set(`akasha:duel-cd:${groupId}:${userId}`, currentTime, { EX: duelCooldown })
        
        return true
    }
    
    async loveBank(e) {
        const userId = e.user_id
        const groupId = e.group_id
        const filename = `${groupId}.json`
        
        const homejson = await akasha_data.getQQYUserHome(userId, {}, filename, false)
        if (!homejson[userId] || homejson[userId].s === 0 || homejson[userId].s === undefined || homejson[userId].s === null || homejson[userId].s === '') {
            await e.reply('你还没有老婆，无法使用爱情银行！')
            return true
        }

        const amount = parseInt(e.msg.replace(/(存爱心|cp银行|#)/g, '').trim()) || 100
        
        if (homejson[userId].love < amount) {
            await e.reply(`好感度不足！你只有 ${homejson[userId].love} 好感度`)
            return true
        }

        const relationshipData = JSON.parse(fs.readFileSync(relationshipPath, 'utf8'))
        const bankKey = `${groupId}_${userId}`
        
        if (!relationshipData.love_bank[bankKey]) {
            relationshipData.love_bank[bankKey] = {
                balance: 0,
                last_interest: Date.now()
            }
        }
        
        
        homejson[userId].love -= amount
        relationshipData.love_bank[bankKey].balance += amount
        
        await akasha_data.getQQYUserHome(userId, homejson, filename, true)
        fs.writeFileSync(relationshipPath, JSON.stringify(relationshipData, null, 2))
        
        await e.reply([
            global.segment.at(userId), '\n',
            `💖 爱心存入成功！\n`,
            `📥 存入: ${amount} 好感度\n`,
            `💰 银行余额: ${relationshipData.love_bank[bankKey].balance}\n`,
            `❤️ 当前好感度: ${homejson[userId].love}\n`,
            `💡 情侣银行每天有5%利息哦！`
        ])
        
        return true
    }

    
    async propose(e) {
        if (!e.at) {
            await e.reply('请@你要求婚的对象')
            return true
        }

        const userId = e.user_id
        const targetId = e.at
        const groupId = e.group_id
        const filename = `${groupId}.json`
        
        if (userId === targetId) {
            await e.reply('不能对自己求婚哦！')
            return true
        }

        const homejson = await akasha_data.getQQYUserHome(userId, {}, filename, false)
        if (!homejson[userId]) {
            await e.reply('请先创建存档')
            return true
        }

        // 检查是否已有对象
        if (homejson[userId].s !== 0 && homejson[userId].s !== undefined && homejson[userId].s !== null && homejson[userId].s !== '') {
            await e.reply('你已经有对象了，不能求婚！')
            return true
        }

        // 检查金币
        if (homejson[userId].money < 100) {
            await e.reply(`求婚需要100金币，你只有${homejson[userId].money}金币`)
            return true
        }

        const lastPropose = await redis.ttl(`akasha:propose-cd:${groupId}:${userId}`)
        if (lastPropose !== -2) {
            await e.reply(`求婚冷却中，还需等待 ${Math.ceil(lastPropose / 60)} 分钟`)
            return true
        }

        // 获取用户性别信息
        let sex = 'unknown'
        try {
            if (Bot && Bot.pickFriend) {
                sex = await Bot.pickFriend(userId).sex || 'unknown'
            } else {
                const memberInfo = await e.group?.pickMember(userId)?.getInfo?.()
                sex = memberInfo?.sex || 'unknown'
            }
        } catch (err) {
            console.log('获取用户性别失败:', err)
            sex = 'unknown'
        }

        let ex = ''
        if (sex == 'male') {
            ex = '小姐'
        } else if (sex == 'female') {
            ex = '先生'
        } else {
            ex = '亲爱的'
        }

        // 扣除金币
        homejson[userId].money -= 100
        
        // 设置等待状态
        homejson[userId].wait = targetId
        await akasha_data.getQQYUserHome(userId, homejson, filename, true)

        // 获取目标用户信息
        let targetName = '未知用户'
        try {
            const targetMember = await e.group?.pickMember(targetId)
            if (targetMember) {
                const targetInfo = await targetMember.getInfo()
                targetName = targetInfo.card || targetInfo.nickname || '未知用户'
            }
        } catch (err) {
            console.log('获取目标用户信息失败:', err)
        }

        const templateData = {
            userAvatar: `https://q1.qlogo.cn/g?b=qq&s=0&nk=${userId}`,
            userName: e.sender.card || e.sender.nickname || '未知用户',
            userLevel: await TextHelper.getUserLevel(userId),
            userMoney: homejson[userId].money + 100, // 显示扣除前的金币数量
            targetAvatar: `https://q1.qlogo.cn/g?b=qq&s=0&nk=${targetId}`,
            targetName: targetName,
            proposeMessage: `亲爱的${ex}您好！在茫茫人海中，能够与${ex}相遇相知相恋，我深感幸福，守护你是我今生的选择，我想有个自己的家，一个有你的家，嫁给我好吗？`
        }
        
        try {
            const img = await puppeteer.screenshot('propose', {
                tplFile: './resources/propose/propose.html',
                cssPath: './resources/propose/propose.css',
                ...templateData
            })
            
            if (img) {
                await e.reply(img)
            } else {
                TextHelper.showProposeResultText(e, templateData, targetId, ex)
            }
        } catch (error) {
            console.error('求婚渲染失败:', error)
            TextHelper.showProposeResultText(e, templateData, targetId, ex)
        }
        
        // 设置求婚冷却
        const proposeCooldown = cooldownConfig.getEnhancedWifeCooldown('propose_cooldown', 3600)
        await redis.set(`akasha:propose-cd:${groupId}:${userId}`, currentTime, { EX: proposeCooldown })
        
        return true
    }
    async renderImage(e, file, obj) {
       
            let data = {
                quality: 100,
                tplFile: `./plugins/trss-akasha-terminal-plugin/resources/propose/${file}.html`,
                ...obj, 
            }
            let img = await puppeteer.screenshot('trss-akasha-terminal-plugin', {
                ...data,
            })
           
            await e.reply([img])
       
    }
}

export default Wifepro