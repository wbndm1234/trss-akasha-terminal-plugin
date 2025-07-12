import { plugin } from '../../model/api/api.js'
import fs from 'fs'
import moment from "moment"
import path from 'path'
import { fileURLToPath } from 'url'
import command from '../../components/command.js'
import dataManager from '../../components/data_manager.js'
import puppeteer from '../../../../lib/puppeteer/puppeteer.js'
import cooldownConfig from '../../components/cooldown_config.js'
import { QuestSystem } from '../../components/quest_system.js'
import mysqlManager from '../../components/mysql_manager.js'
import TextHelper from '../../components/text.js'
import akasha_data from '../../components/akasha_data.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 兼容写法
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
const shopDataPath = path.join(__dirname, '../../data/shop_data.json')
const userInventoryPath = path.join(__dirname, '../../data/user_inventory.json')


export class VoidShopSystem extends plugin {
    constructor() {
        super({
            name: '虚空商城系统',
            dsc: '虚空商城系统',
            event: 'message',
            priority: 65,
            rule: [
                {
                    reg: '^#?(虚空商城|商城)$',
                    fnc: 'showShop'
                },
                {
                    reg: '^#?购买道具[0-9]{1,}$',
                    fnc: 'buyItem'
                },
                {
                    reg: '^#?(我的虚空背包|背包)$',
                    fnc: 'showInventory'
                },
                {
                    reg: '^#?使用道具[0-9]{1,}$',
                    fnc: 'useItem'
                },
                {
                    reg: '^#?赠送道具[0-9]{1,}$',
                    fnc: 'giftItem'
                },
                {
                    reg: '^#?道具详情[0-9]{1,}$',
                    fnc: 'itemDetail'
                },
                {
                    reg: '^#?每日签到$',
                    fnc: 'dailySignIn'
                },
                {
                    reg: '^#?商城刷新$',
                    fnc: 'refreshShop'
                }
            ]
        })
        this.initShopData()
    }

    async initShopData() {
        const defaultShopData = {
            items: {
                1: {
                    id: 1,
                    name: "爱心巧克力",
                    description: "增加与老婆的好感度 +200",
                    price: 500,
                    type: "consumable",
                    effect: { love: 200 },
                    rarity: "common",
                    stock: -1 // -1表示无限库存
                },
                2: {
                    id: 2,
                    name: "幸运符",
                    description: "提高娶老婆成功率 +20%（持续3次使用）",
                    price: 1000,
                    type: "buff",
                    effect: { luck_boost: 20, duration: 3 },
                    rarity: "rare",
                    stock: 10
                },
                3: {
                    id: 3,
                    name: "金币袋",
                    description: "直接获得1000-3000金币",
                    price: 800,
                    type: "consumable",
                    effect: { money_min: 1000, money_max: 3000 },
                    rarity: "common",
                    stock: -1
                },
                4: {
                    id: 4,
                    name: "冷却重置卡",
                    description: "重置所有技能冷却时间",
                    price: 1500,
                    type: "consumable",
                    effect: { reset_cooldown: true },
                    rarity: "epic",
                    stock: 5
                },
                5: {
                    id: 5,
                    name: "保护符",
                    description: "免疫一次抢老婆失败的惩罚",
                    price: 2000,
                    type: "consumable",
                    effect: { protection: true },
                    rarity: "epic",
                    stock: 3
                },
                6: {
                    id: 6,
                    name: "双倍经验卡",
                    description: "打工收入翻倍（持续5次）",
                    price: 1200,
                    type: "buff",
                    effect: { work_boost: 2, duration: 5 },
                    rarity: "rare",
                    stock: 8
                },
                7: {
                    id: 7,
                    name: "神秘礼盒",
                    description: "随机获得一个道具",
                    price: 2500,
                    type: "mystery",
                    effect: { mystery_box: true },
                    rarity: "legendary",
                    stock: 2
                }
            },
            daily_items: [1, 2, 3, 6], // 每日刷新的商品ID
            last_refresh: moment().format('YYYY-MM-DD')
        }

        await dataManager.loadJsonData(shopDataPath, defaultShopData)
        await dataManager.loadJsonData(userInventoryPath, {})
    }

    async showShop(e) {
        const userId = e.user_id
        const groupId = e.group_id
        const commandName = '虚空商城'
        
        const shopData = await dataManager.loadJsonData(shopDataPath, {})
        const today = moment().format('YYYY-MM-DD')
        
        // 判断时间看要不要刷新
        if (shopData.last_refresh !== today) {
            await TextHelper.autoRefreshShop()
        }

        const userData = await TextHelper.getUserData(userId, e.group_id)
        const inventory = await TextHelper.getUserInventory(userId, e.group_id)
        const signinData = await TextHelper.getSigninData(userId, e.group_id)
        
        // 计算商城统计信息
        const totalItems = Object.keys(shopData.items).length
        const inStockItems = Object.values(shopData.items).filter(item => item.stock > 0 || item.stock === -1).length
        const refreshCount = shopData.refresh_count || 0
        
        const templateData = {
            username: e.sender.card || e.sender.nickname || '未知用户',
            userId: userId,
            money: userData.money || 0,
            points: userData.points || 0,
            items: Object.entries(shopData.items).map(([id, item]) => ({
                id,
                name: item.name,
                description: item.description,
                price: item.price,
                stock: item.stock,
                rarity: item.rarity.toLowerCase(),
                type: item.type,
                icon: TextHelper.getItemIcon(item.type),
                canBuy: (userData.money || 0) >= item.price && (item.stock > 0 || item.stock === -1),
                outOfStock: item.stock === 0,
                isLimited: item.stock !== -1
            })),
            totalItems: totalItems,
            inStockItems: inStockItems,
            refreshCount: refreshCount,
            timestamp: new Date().toLocaleString()
        }
        
       
         await this.renderImage(e, 'shop_main', { ...templateData })
       
       
    }

   
    async buyItem(e) {
        const itemId = parseInt(e.msg.replace(/(购买道具|#)/g, '').trim())
        const userId = e.user_id
        const groupId = e.group_id
        const commandName = '购买道具'
        
        try {
            await mysqlManager.logCommandUsage(userId, groupId, commandName, e.msg, true)
        const filename = `${groupId}.json`
        
        const homejson = await dataManager.getUserHome(userId, {}, filename, false)
        if (!homejson[userId]) {
            await e.reply('请先使用 #创建老婆 创建存档')
            return true
        }

        const shopData = await dataManager.loadJsonData(shopDataPath, {})
        const item = shopData.items[itemId]
        
        if (!item) {
            await e.reply('道具不存在，请检查道具ID')
            return true
        }
        
        if (item.stock === 0) {
            await e.reply('该道具已售罄')
            return true
        }
        
        if (homejson[userId].money < item.price) {
            await e.reply(`金币不足！需要${item.price}金币，你只有${homejson[userId].money}金币`)
            return true
        }
        
        // 扣除金币
        homejson[userId].money -= item.price
        await dataManager.saveUserHome(userId, homejson[userId], filename, true)
        
        // 减少库存
        if (item.stock > 0) {
            shopData.items[itemId].stock -= 1
            await dataManager.saveJsonData(shopDataPath, shopData)
        }
        
        // 添加到背包
        await TextHelper.addToInventory(userId, groupId, itemId)
        
        // 更新任务进度
                const questSystem = new QuestSystem()
                await questSystem.updateQuestProgress(userId, groupId, 'shop_count', 1, true)
                // 更新社交互动计数（购买行为）
                await questSystem.updateQuestProgress(userId, groupId, 'interaction_count', 1, true)
        
        const templateData = {
            username: e.sender.card || e.sender.nickname || '未知用户',
            userId: userId,
            item: {
                id: itemId,
                name: item.name,
                description: item.description,
                price: item.price,
                rarity: item.rarity.toLowerCase(),
                type: item.type,
                icon: TextHelper.getItemIcon(item.type)
            },
            purchase: {
                cost: item.price,
                remainingMoney: homejson[userId].money,
                status: 'success'
            },
            timestamp: new Date().toLocaleString()
        }
        
       
        const renderSuccess = await this.renderImage(e, 'buy_item', { ...templateData })
        if (renderSuccess) {
            return true
        }
        
       
        const rarityEmoji = TextHelper.getRarityEmoji(item.rarity)
        await e.reply([
            global.segment.at(userId), '\n',
            `🛒 购买成功: ${rarityEmoji} ${item.name}\n`,
            `💰 花费: ${item.price}金币\n`,
            `💳 余额: ${homejson[userId].money}金币`
        ])
        
        return true
        } catch (error) {
            console.error('购买道具失败:', error)
            await mysqlManager.logCommandUsage(userId, groupId, commandName, e.msg, false, error.message)
            await e.reply('购买道具失败，请稍后再试')
            return false
        }
    }

    
    async showInventory(e) {
        const userId = e.user_id
        const groupId = e.group_id
        const commandName = '我的虚空背包'
        
        try {
            await mysqlManager.logCommandUsage(userId, groupId, commandName, e.msg, true)
        const inventory = await TextHelper.getUserInventory(userId, groupId)
        
        if (Object.keys(inventory).length === 0) {
            await e.reply('你的背包是空的，快去商城购买道具吧！')
            return true
        }
        
        const shopData = await dataManager.loadJsonData(shopDataPath, {})
        const userData = await TextHelper.getUserData(userId, groupId)
        const templateData = {
            money: userData.money || 0,
            points: userData.points || 0,
            items: [],
            inventory: Object.entries(inventory).map(([id, count]) => {
                const item = shopData.items[id]
                return {
                    id,
                    name: item ? item.name : '未知道具',
                    count: count,
                    icon: item ? TextHelper.getItemIcon(item.type) : '❓',
                    rarity: item ? item.rarity.toLowerCase() : 'common'
                }
            }),
            signinDays: [],
            consecutiveDays: 0,
            nextReward: ''
        }
        
        try {
            await this.renderImage(e, 'shop_inventory', { templateData })
            
           
        } catch (error) {
            console.error('背包渲染失败:', error)
        }
        
        // 降级到文本显示
        let msg = ['🎒 我的背包 🎒\n']
        msg.push('━━━━━━━━━━━━━')
        
        for (let itemId of Object.keys(inventory)) {
            const item = shopData.items[itemId]
            const count = inventory[itemId]
            const rarityEmoji = TextHelper.getRarityEmoji(item.rarity)
            
            msg.push(`${rarityEmoji} [${itemId}] ${item.name} x${count}`)
            msg.push(`📝 ${item.description}`)
            msg.push('━━━━━━━━━━━━━')
        }
        
        msg.push('\n💡 使用 #使用道具[ID] 来使用道具')
        msg.push('💡 使用 #赠送道具[ID] @好友 来赠送道具')
        
        await e.reply(msg.join('\n'))
        return true
        } catch (error) {
            console.error('显示背包失败:', error)
            
            await e.reply('背包暂时无法访问，请稍后再试')
            return false
        }
    }

    async useItem(e) {
        const itemId = parseInt(e.msg.replace(/(使用道具|#)/g, '').trim())
        const userId = e.user_id
        const groupId = e.group_id
        const filename = `${groupId}.json`
        
        const inventory = await TextHelper.getUserInventory(userId, groupId)
        if (!inventory[itemId] || inventory[itemId] <= 0) {
            await e.reply('你没有这个道具')
            return true
        }
        
        const shopData = await dataManager.loadJsonData(shopDataPath, {})
        const item = shopData.items[itemId]
        const result = await this.executeItemEffect(e, item, userId, groupId)
        
        if (result.success) {
            await TextHelper.removeFromInventory(userId, groupId, itemId, 1)
            
            const templateData = {
                username: e.sender.card || e.sender.nickname || '未知用户',
                userId: userId,
                item: {
                    id: itemId,
                    name: item.name,
                    description: item.description,
                    rarity: item.rarity.toLowerCase(),
                    type: item.type,
                    icon: TextHelper.getItemIcon(item.type)
                },
                effect: {
                    message: result.message,
                    success: true
                },
                status: {
                    remaining: (await TextHelper.getUserInventory(userId, groupId))[itemId] || 0,
                    action: 'used'
                },
                timestamp: new Date().toLocaleString()
            }
            
            const renderSuccess = await this.renderImage(e, 'use_item', { templateData })
            if (renderSuccess) {
                return true
            }
            
            await e.reply([
                global.segment.at(userId), '\n',
                `✨ 使用道具: ${item.name}\n`,
                result.message
            ])
        } else {
            await e.reply(result.message)
        }
        
        return true
    }

    async giftItem(e) {
        if (!e.at) {
            await e.reply('请@要赠送的对象')
            return true
        }
        
        const itemId = parseInt(e.msg.replace(/(赠送道具|#)/g, '').trim())
        const userId = e.user_id
        const targetId = e.at
        const groupId = e.group_id
        
        const inventory = await TextHelper.getUserInventory(userId, groupId)
        if (!inventory[itemId] || inventory[itemId] <= 0) {
            await e.reply('你没有这个道具')
            return true
        }
        
        const shopData = await dataManager.loadJsonData(shopDataPath, {})
        const item = shopData.items[itemId]
        
        // 转移道具
        await TextHelper.removeFromInventory(userId, groupId, itemId, 1)
        await TextHelper.addToInventory(targetId, groupId, itemId)
        
        const templateData = {
            sender: {
                username: e.sender.card || e.sender.nickname || '未知用户',
                userId: userId
            },
            receiver: {
                username: e.group?.member_list?.find(m => m.user_id === targetId)?.card || 
                         e.group?.member_list?.find(m => m.user_id === targetId)?.nickname || '未知用户',
                userId: targetId
            },
            item: {
                id: itemId,
                name: item.name,
                description: item.description,
                rarity: item.rarity.toLowerCase(),
                type: item.type,
                icon: TextHelper.getItemIcon(item.type)
            },
            gift: {
                message: '💝 友谊万岁！',
                friendshipBonus: 10
            },
            details: {
                itemName: item.name,
                time: new Date().toLocaleString(),
                status: 'success'
            },
            timestamp: new Date().toLocaleString()
        }
        
       
        const renderSuccess = await this.renderImage(e, 'gift_item', { templateData })
        if (renderSuccess) {
            return true
        }
        
       
        const rarityEmoji = TextHelper.getRarityEmoji(item.rarity)
        await e.reply([
            global.segment.at(userId), ' 赠送给 ', global.segment.at(targetId), '\n',
            `🎁 赠送道具: ${rarityEmoji} ${item.name}\n`,
            `💝 友谊万岁！`
        ])
        
        return true
    }

    async dailySignIn(e) {
        const userId = e.user_id
        const groupId = e.group_id
        const filename = `${groupId}.json`
        const today = moment().format('YYYY-MM-DD')
        
        // 检查今天签没签
        const lastSignIn = await redis.get(`akasha:shop-signin:${groupId}:${userId}`)
        if (lastSignIn === today) {
            await e.reply('今天已经签到过了，明天再来吧！')
            return true
        }
        
        const homejson = await akasha_data.getQQYUserHome(userId, {}, filename, false)
        if (!homejson[userId]) {
            await e.reply('请先使用 #创建老婆 创建存档')
            return true
        }
        const baseReward = 200 + Math.floor(Math.random() * 300) // 200-500金币
        let totalReward = baseReward
        let bonusMsg = ''
        const signInCount = await TextHelper.getSignInStreak(userId, groupId)
        if (signInCount >= 7) {
            totalReward += 500
            bonusMsg += '\n🎊 连续签到7天奖励: +500金币'
        } else if (signInCount >= 3) {
            totalReward += 200
            bonusMsg += '\n🎉 连续签到3天奖励: +200金币'
        }
        
        // 随机道具奖励（10%概率）
        let itemReward = ''
        if (Math.random() < 0.1) {
            const randomItems = [1, 3] // 爱心巧克力或金币袋
            const randomItemId = randomItems[Math.floor(Math.random() * randomItems.length)]
            await TextHelper.addToInventory(userId, groupId, randomItemId)
            const shopData = await dataManager.loadJsonData(shopDataPath, {})
            itemReward = `\n🎁 幸运奖励: ${shopData.items[randomItemId].name}`
        }
        homejson[userId].money += totalReward
        
        const { QuestSystem } = await import('../../components/quest_system.js')
        const questSystem = new QuestSystem()
        await questSystem.updateQuestProgress(userId, groupId, 'max_money', homejson[userId].money)
        
        await akasha_data.getQQYUserHome(userId, homejson, filename, true)
        
        const signinCooldown = cooldownConfig.getShopCooldown('signin_cooldown', 86400)
        await redis.set(`akasha:shop-signin:${groupId}:${userId}`, today, { EX: signinCooldown })
        await TextHelper.updateSignInStreak(userId, groupId)
        
        await e.reply([
            global.segment.at(userId), '\n',
            `📅 签到成功！\n`,
            `💰 获得金币: ${totalReward}\n`,
            `💳 当前余额: ${homejson[userId].money}金币`,
            bonusMsg,
            itemReward
        ])
        
        return true
    }

    async executeItemEffect(e, item, userId, groupId) {
        const filename = `${groupId}.json`
        const homejson = await akasha_data.getQQYUserHome(userId, {}, filename, false)
        
        switch (item.type) {
            case 'consumable':
                if (item.effect.love) {
                    if (homejson[userId].s === 0) {
                        return { success: false, message: '你还没有老婆，无法使用此道具' }
                    }
                    homejson[userId].love += item.effect.love
                    
                    const { QuestSystem } = await import('../../components/quest_system.js')
                    const questSystem = new QuestSystem()
                    await questSystem.updateQuestProgress(userId, groupId, 'max_love', homejson[userId].love)
                    
                    await akasha_data.getQQYUserHome(userId, homejson, filename, true)
                    return { success: true, message: `💕 好感度增加 ${item.effect.love}，当前好感度: ${homejson[userId].love}` }
                }
                
                if (item.effect.money_min && item.effect.money_max) {
                    const money = Math.floor(Math.random() * (item.effect.money_max - item.effect.money_min + 1)) + item.effect.money_min
                    homejson[userId].money += money
                    
                    const { QuestSystem } = await import('../../components/quest_system.js')
                    const questSystem = new QuestSystem()
                    await questSystem.updateQuestProgress(userId, groupId, 'max_money', homejson[userId].money)
                    
                    await akasha_data.getQQYUserHome(userId, homejson, filename, true)
                    return { success: true, message: `💰 获得 ${money} 金币，当前余额: ${homejson[userId].money}` }
                }
                
                if (item.effect.reset_cooldown) {
                    // 清空所有冷却
                    const keys = await redis.keys(`akasha:*cd:${groupId}:${userId}`)
                    for (let key of keys) {
                        await redis.del(key)
                    }
                    return { success: true, message: '⏰ 所有技能冷却时间已重置！' }
                }
                
                if (item.effect.protection) {
                    const protectionDuration = cooldownConfig.getShopCooldown('protection_duration', 86400)
            await redis.set(`akasha:shop-protection:${groupId}:${userId}`, '1', { EX: protectionDuration })
                    return { success: true, message: '🛡️ 获得24小时保护，免疫一次失败惩罚！' }
                }
                break
                
            case 'buff':
                if (item.effect.luck_boost) {
                    await redis.set(`akasha:shop-luck:${groupId}:${userId}`, JSON.stringify({
                        boost: item.effect.luck_boost,
                        duration: item.effect.duration
                    }), { EX: cooldownConfig.getShopCooldown('luck_duration', 86400) })
                    return { success: true, message: `🍀 获得幸运加成 +${item.effect.luck_boost}%，持续${item.effect.duration}次使用` }
                }
                
                if (item.effect.work_boost) {
                    await redis.set(`akasha:shop-workboost:${groupId}:${userId}`, JSON.stringify({
                        boost: item.effect.work_boost,
                        duration: item.effect.duration
                    }), { EX: cooldownConfig.getShopCooldown('workboost_duration', 604800) })
                    return { success: true, message: `💼 获得打工收入 x${item.effect.work_boost} 倍，持续${item.effect.duration}次使用` }
                }
                break
                
            case 'mystery':
                if (item.effect.mystery_box) {
                    const shopData = await dataManager.loadJsonData(shopDataPath, {})
                    const availableItems = Object.keys(shopData.items).filter(id => id != item.id)
                    const randomItemId = availableItems[Math.floor(Math.random() * availableItems.length)]
                    const randomItem = shopData.items[randomItemId]
                    
                    await TextHelper.addToInventory(userId, groupId, randomItemId)
                    const rarityEmoji = TextHelper.getRarityEmoji(randomItem.rarity)
                    return { success: true, message: `🎁 神秘礼盒开启！获得: ${rarityEmoji} ${randomItem.name}` }
                }
                break
        }
        
        return { success: false, message: '道具效果执行失败' }
    }

   


   
    async refreshShop(e) {
        if (!e.isMaster) {
            await e.reply('只有主人可以手动刷新商城')
            return true
        }
        
        await this.autoRefreshShop()
        await e.reply('🔄 商城已刷新！')
        return true
    }

    async autoRefreshShop() {
        // 调用TextHelper中的autoRefreshShop方法
        await TextHelper.autoRefreshShop()
    }

    
    async itemDetail(e) {
        const itemId = parseInt(e.msg.replace(/(道具详情|#)/g, '').trim())
        const shopData = await dataManager.loadJsonData(shopDataPath, {})
        const item = shopData.items[itemId]
        
        if (!item) {
            await e.reply('道具不存在，请检查道具ID')
            return true
        }
        
        const rarityEmoji = TextHelper.getRarityEmoji(item.rarity)
        const rarityName = {
            common: '普通',
            rare: '稀有',
            epic: '史诗',
            legendary: '传说'
        }[item.rarity] || '未知'
        
        const stockText = item.stock === -1 ? '无限' : item.stock
        
        const msg = [
            `${rarityEmoji} ${item.name}`,
            `━━━━━━━━━━━━━`,
            `🏷️ 稀有度: ${rarityName}`,
            `💰 价格: ${item.price}金币`,
            `📦 库存: ${stockText}`,
            `📝 描述: ${item.description}`,
            `━━━━━━━━━━━━━`
        ]
        
            await e.reply(msg.join('\n'))
        return true
    }

    async renderImage(e, file, obj) {
       
            let data = {
                quality: 100,
                tplFile: `./plugins/trss-akasha-terminal-plugin/resources/shop/${file}.html`,
                ...obj,
                data: obj.templateData  
            }
            let img = await puppeteer.screenshot('trss-akasha-terminal-plugin', {
                ...data,
            })
           
            await e.reply([img])
       
    }
}

export default VoidShopSystem