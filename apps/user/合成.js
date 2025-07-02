import { plugin } from '../../model/api/api.js'
import fs from 'fs'
import moment from "moment"
import path from 'path'
import { fileURLToPath } from 'url'
import cfg from '../../../../lib/config/config.js'
import command from '../../components/command.js'
import dataManager from '../../components/data_manager.js'
import puppeteer from '../../../../lib/puppeteer/puppeteer.js'
import cooldownConfig from '../../components/cooldown_config.js'
import { QuestSystem } from '../../components/quest_system.js'
import mysqlManager from '../../components/mysql_manager.js'
import { TextHelper } from '../../components/text.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const redis = cfg.redis

// 内存缓存作为redis备选方案
const memoryCache = new Map()

const isRedisAvailable = () => {
    return redis && typeof redis.get === 'function' && typeof redis.set === 'function'
}

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
const userInventoryPath = path.join(__dirname, '../../data/user_inventory.json')
const synthesisRecipesPath = path.join(__dirname, '../../data/synthesis_recipes.json')

export class SynthesisSystem extends plugin {
    constructor() {
        super({
            name: '合成系统',
            dsc: '道具合成系统，创造更强大的物品',
            event: 'message',
            priority: 65,
            rule: [
                {
                    reg: '^#?(合成列表|查看合成|合成配方)$',
                    fnc: 'showRecipes'
                },
                {
                    reg: '^#?合成\\s*(.+)$',
                    fnc: 'synthesizeItem'
                },
                {
                    reg: '^#?(我的工坊|合成工坊)$',
                    fnc: 'showWorkshop'
                },
                {
                    reg: '^#?(升级工坊|工坊升级)$',
                    fnc: 'upgradeWorkshop'
                },
                {
                    reg: '^#?(批量合成|快速合成)\\s*(.+)$',
                    fnc: 'batchSynthesize'
                },
                {
                    reg: '^#?(分解道具|道具分解)\\s*(.+)$',
                    fnc: 'decomposeItem'
                },
                {
                    reg: '^#?(合成历史|制作记录)$',
                    fnc: 'synthesisHistory'
                }
            ]
        })
        this.initSynthesisData()
    }

    /**
     * 初始化数据
     */
    async initSynthesisData() {
        const defaultRecipes = {
            recipes: {
                "超级幸运符": {
                    id: "super_luck_charm",
                    materials: {
                        "2": 3, 
                        "5": 1  
                    },
                    result_id: "101",
                    success_rate: 80,
                    workshop_level: 2,
                    description: "提供30%成功率加成，持续5次使用",
                    category: "增益道具"
                },
                "爱情药水": {
                    id: "love_potion",
                    materials: {
                        "1": 2, 
                        "4": 1  
                    },
                    result_id: "102",
                    success_rate: 90,
                    workshop_level: 1,
                    description: "约会时额外获得50%好感度",
                    category: "恋爱道具"
                },
                "黄金锤子": {
                    id: "golden_hammer",
                    materials: {
                        "3": 5, 
                        "5": 2  
                    },
                    result_id: "103",
                    success_rate: 60,
                    workshop_level: 3,
                    description: "打工收入翻倍，持续7天",
                    category: "经济道具"
                },
                "时间沙漏": {
                    id: "time_hourglass",
                    materials: {
                        "2": 2, 
                        "4": 3  
                    },
                    result_id: "104",
                    success_rate: 70,
                    workshop_level: 2,
                    description: "重置所有冷却时间",
                    category: "功能道具"
                },
                "钻石戒指": {
                    id: "diamond_ring",
                    materials: {
                        "5": 3, 
                        "1": 5  
                    },
                    result_id: "105",
                    success_rate: 50,
                    workshop_level: 4,
                    description: "求婚成功率100%，获得专属称号",
                    category: "特殊道具"
                },
                "万能钥匙": {
                    id: "master_key",
                    materials: {
                        "3": 3, 
                        "2": 3  
                    },
                    result_id: "106",
                    success_rate: 65,
                    workshop_level: 3,
                    description: "解锁所有限制，跳过冷却",
                    category: "功能道具"
                },
                "复活石": {
                    id: "revival_stone",
                    materials: {
                        "5": 5, 
                        "4": 5  
                    },
                    result_id: "107",
                    success_rate: 40,
                    workshop_level: 5,
                    description: "死亡时自动复活，保留所有财产",
                    category: "保护道具"
                },
                "财富符咒": {
                    id: "wealth_talisman",
                    materials: {
                        "3": 4, 
                        "1": 3  
                    },
                    result_id: "108",
                    success_rate: 75,
                    workshop_level: 2,
                    description: "所有金币获得翻倍，持续3天",
                    category: "经济道具"
                },
                "传送卷轴": {
                    id: "teleport_scroll",
                    materials: {
                        "2": 4, 
                        "5": 1  
                    },
                    result_id: "109",
                    success_rate: 85,
                    workshop_level: 1,
                    description: "瞬间传送到任意地点",
                    category: "功能道具"
                },
                "神级合成石": {
                    id: "divine_synthesis_stone",
                    materials: {
                        "101": 1, 
                        "103": 1, 
                        "105": 1  
                    },
                    result_id: "110",
                    success_rate: 30,
                    workshop_level: 6,
                    description: "终极道具，拥有所有效果的组合",
                    category: "传说道具"
                }
            },
            // 道具信息
            items: {
                "101": { name: "超级幸运符", rarity: "稀有", value: 2000 },
                "102": { name: "爱情药水", rarity: "普通", value: 800 },
                "103": { name: "黄金锤子", rarity: "史诗", value: 5000 },
                "104": { name: "时间沙漏", rarity: "稀有", value: 1500 },
                "105": { name: "钻石戒指", rarity: "传说", value: 8000 },
                "106": { name: "万能钥匙", rarity: "史诗", value: 3000 },
                "107": { name: "复活石", rarity: "传说", value: 10000 },
                "108": { name: "财富符咒", rarity: "稀有", value: 2500 },
                "109": { name: "传送卷轴", rarity: "普通", value: 600 },
                "110": { name: "神级合成石", rarity: "神话", value: 50000 }
            },
    //emm，自己对照上面的看
            decompose: {
                "101": { materials: { "2": 2, "5": 1 }, success_rate: 60 },
                "102": { materials: { "1": 1, "4": 1 }, success_rate: 80 },
                "103": { materials: { "3": 3, "5": 1 }, success_rate: 40 },
                "104": { materials: { "2": 1, "4": 2 }, success_rate: 70 },
                "105": { materials: { "5": 2, "1": 3 }, success_rate: 30 }
            }
        }

        await dataManager.loadJsonData(synthesisRecipesPath, defaultRecipes)
    }

    
    async showRecipes(e) {
        const userId = e.user_id
        const groupId = e.group_id
        const commandName = '合成列表'
        
        try {
            
            
        const recipes = await dataManager.loadJsonData(synthesisRecipesPath, {})
        const shopData = await TextHelper.getShopData()
        const workshop = await TextHelper.getUserWorkshop(userId, groupId)
        const inventory = await TextHelper.getUserInventory(userId, groupId)
        
        const categories = {}
        for (let [name, recipe] of Object.entries(recipes.recipes)) {
            const category = recipe.category || "其他"
            if (!categories[category]) categories[category] = []
            categories[category].push({ name, ...recipe })
        }

       
        const templateData = {
            username: e.sender.card || e.sender.nickname || '未知用户',
            workshopLevel: workshop.level,
            workshopExp: workshop.exp,
            expToNext: workshop.level * 100,
            successBonus: Math.min(20, (workshop.level - 1) * 5),
            recipes: Object.entries(categories).map(([category, items]) => ({
                category,
                categoryName: category,
                items: items.map(item => {
                    const materials = []
                    for (let [itemId, count] of Object.entries(item.materials)) {
                        const itemName = shopData.items[itemId]?.name || `道具${itemId}`
                        materials.push(`${itemName}×${count}`)
                    }
                    
                    const rarity = recipes.items[item.result_id]?.rarity || "普通"
                    const rarityEmoji = TextHelper.getSynthesisRarityEmoji(rarity)
                    const levelBonus = Math.min(20, (workshop.level - item.workshop_level) * 5)
                    const finalSuccessRate = Math.min(95, item.success_rate + levelBonus)
                    
                    return {
                        name: item.name,
                        rarityIcon: rarityEmoji,
                        materialsText: materials.join(', '),
                        successRate: item.success_rate,
                        finalSuccessRate: finalSuccessRate,
                        workshopLevel: item.workshop_level,
                        description: item.description,
                        canCraft: workshop.level >= item.workshop_level
                    }
                })
            })),
            inventory: Object.entries(inventory).map(([itemId, count]) => {
                const itemName = shopData.items[itemId]?.name || recipes.items[itemId]?.name || `道具${itemId}`
                const rarity = shopData.items[itemId]?.rarity || recipes.items[itemId]?.rarity || "普通"
                return {
                    name: itemName,
                    amount: count,
                    rarityIcon: TextHelper.getSynthesisRarityEmoji(rarity)
                }
            }),
            materialSlots: [null, null, null, null],
            stats: {
                totalCrafts: workshop.synthesis_count || 0,
                successfulCrafts: workshop.success_count || 0,
                successRate: workshop.synthesis_count > 0 ? Math.round((workshop.success_count / workshop.synthesis_count) * 100) : 0
            }
        }
        
       
            const img = await image(e, 'recipes_list', { 
                cssPath: './plugins/trss-akasha-terminal-plugin/resources/synthesis/recipes_list.css',
                templateData,
            });
          
            await e.reply(img)
      /*  let msg = ['🔨 合成配方大全 🔨\n']
        msg.push('━━━━━━━━━━━━━━━━')
        
        for (let [category, items] of Object.entries(categories)) {
            msg.push(`\n📋 ${category}:`)
            for (let item of items) {
                const materials = []
                for (let [itemId, count] of Object.entries(item.materials)) {
                    const itemName = shopData.items[itemId]?.name || `道具${itemId}`
                    materials.push(`${itemName}×${count}`)
                }
                
                const rarity = recipes.items[item.result_id]?.rarity || "普通"
                const rarityEmoji = TextHelper.getSynthesisRarityEmoji(rarity)
                
                msg.push(`${rarityEmoji} ${item.name}`)
                msg.push(`   📦 材料: ${materials.join(', ')}`)
                msg.push(`   📊 成功率: ${item.success_rate}%`)
                msg.push(`   🏭 需要工坊等级: ${item.workshop_level}`)
                msg.push(`   💡 ${item.description}`)
                msg.push('   ────────────────')
            }
        }
        
        msg.push('\n💡 使用 #合成 [道具名] 进行合成')
        msg.push('💡 使用 #我的工坊 查看工坊状态')
        
        await e.reply(msg.join('\n'))
        return true*/
        } catch (error) {
            console.error('显示合成列表失败:', error)
            return false
        }
    }

    
    async synthesizeItem(e) {
        const userId = e.user_id
        const groupId = e.group_id
        const itemName = e.msg.match(/^#?合成\s*(.+)$/)?.[1]?.trim()
        const commandName = '合成道具'
        
        try {
            
        
        if (!itemName) {
            await e.reply('请指定要合成的道具名称！')
            return true
        }

        const recipes = await dataManager.loadJsonData(synthesisRecipesPath, {})
        const recipe = recipes.recipes[itemName]
        
        if (!recipe) {
            await e.reply(`找不到 ${itemName} 的合成配方！使用 #合成列表 查看所有配方`)
            return true
        }

        // 检查工坊等级
        const workshop = await TextHelper.getUserWorkshop(userId, groupId)
        if (workshop.level < recipe.workshop_level) {
            await e.reply(`工坊等级不足！需要等级 ${recipe.workshop_level}，当前等级 ${workshop.level}`)
            return true
        }

        // 检查材料
        const inventory = await TextHelper.getUserInventory(userId, groupId)
        const missingMaterials = []
        const shopData = TextHelper.getShopData()
        
        for (let [itemId, needCount] of Object.entries(recipe.materials)) {
            const haveCount = inventory[itemId] || 0
            if (haveCount < needCount) {
                const itemName = shopData.items[itemId]?.name || `道具${itemId}`
                missingMaterials.push(`${itemName} (需要${needCount}个，拥有${haveCount}个)`)
            }
        }
        
        if (missingMaterials.length > 0) {
            await e.reply([
                '❌ 材料不足！\n',
                '缺少材料:',
                ...missingMaterials.map(m => `• ${m}`)
            ].join('\n'))
            return true
        }

        const cooldownKey = `akasha:synthesis-cd:${groupId}:${userId}`
        let lastSynthesis = -2
        if (isRedisAvailable()) {
            lastSynthesis = await redis.ttl(cooldownKey)
        } else {
            console.log(`[虚空终端] Redis不可用，使用内存缓存检查冷却时间: ${cooldownKey}`)
            const cachedTime = memoryCache.get(cooldownKey)
            if (cachedTime) {
                const now = Date.now()
                const timeDiff = Math.floor((now - cachedTime) / 1000)
                lastSynthesis = timeDiff < 300 ? 300 - timeDiff : -2
            }
        }
        
        if (lastSynthesis !== -2) {
            await e.reply(`合成冷却中，还需等待 ${Math.ceil(lastSynthesis / 60)} 分钟`)
            return true
        }

        // 计算成功率（工坊等级加成）
        const levelBonus = Math.min(20, (workshop.level - recipe.workshop_level) * 5)
        const finalSuccessRate = Math.min(95, recipe.success_rate + levelBonus)
        
        const success = Math.random() * 100 < finalSuccessRate
        
        if (success) {
            for (let [itemId, count] of Object.entries(recipe.materials)) {
                await TextHelper.removeFromInventory(userId, groupId, itemId, count)
            }
            
            await TextHelper.addToInventory(userId, groupId, recipe.result_id, 1)
            await TextHelper.addWorkshopExp(userId, groupId, 10)
            
            // 更新合成任务进度
            const questSystem = new QuestSystem()
            await questSystem.updateQuestProgress(userId, groupId, 'synthesis_count', 1, true)
            await questSystem.updateQuestProgress(userId, groupId, 'synthesis_success', 1, true)
            
            const rarity = recipes.items[recipe.result_id]?.rarity || "普通"
            const rarityEmoji = TextHelper.getSynthesisRarityEmoji(rarity)
            
            // 记录合成历史
            await TextHelper.recordSynthesis(userId, groupId, itemName, true)
            await TextHelper.recordSynthesisHistory(userId, groupId, itemName, itemName, true)
            const workshopAfterUpdate = await TextHelper.getUserWorkshop(userId, groupId)
            
           
            const templateData = {
                type: 'synthesis_success',
                title: '✨ 合成成功',
                username: e.sender.card || e.sender.nickname || '未知用户',
                item: {
                    name: itemName,
                    rarity: rarityEmoji,
                    description: recipe.description
                },
                successRate: finalSuccessRate,
                expGain: 10,
                timestamp: new Date().toLocaleString(),
                materialSlots: [
                    { item: null },
                    { item: null },
                    { item: null },
                    { item: null }
                ],
                stats: {
                    totalCrafts: workshopAfterUpdate.synthesis_count || 0,
                    successfulCrafts: workshopAfterUpdate.success_count || 0,
                    successRate: workshopAfterUpdate.synthesis_count > 0 ? Math.round((workshopAfterUpdate.success_count / workshopAfterUpdate.synthesis_count) * 100) : 0
                }
            }
            
            try {
                const img = await puppeteer.screenshot('synthesis', {
                    tplFile: './resources/synthesis/synthesis.html',
                    cssPath: './resources/synthesis/synthesis.css',
                    ...templateData
                })
                
                if (img) {
                    await e.reply([global.segment.at(userId), img])
                } else {
                    await e.reply([
                        global.segment.at(userId), '\n',
                        `✨ 合成成功！\n`,
                        `${rarityEmoji} 获得: ${itemName}\n`,
                        `🎯 成功率: ${finalSuccessRate}%\n`,
                        `⭐ 工坊经验 +10\n`,
                        `💡 ${recipe.description}`
                    ])
                }
            } catch (error) {
                console.error('合成成功渲染失败:', error)
                await e.reply([
                    global.segment.at(userId), '\n',
                    `✨ 合成成功！\n`,
                    `${rarityEmoji} 获得: ${itemName}\n`,
                    `🎯 成功率: ${finalSuccessRate}%\n`,
                    `⭐ 工坊经验 +10\n`,
                    `💡 ${recipe.description}`
                ])
            }
        } else {
            // 失败时返还部分材料
            const returnRate = 0.5
            for (let [itemId, count] of Object.entries(recipe.materials)) {
                const returnCount = Math.floor(count * returnRate)
                if (returnCount > 0) {
                    await TextHelper.removeFromInventory(userId, groupId, itemId, count - returnCount)
                } else {
                    await TextHelper.removeFromInventory(userId, groupId, itemId, count)
                }
            }
            
            // 记录合成历史
            await TextHelper.recordSynthesis(userId, groupId, itemName, false)
            await TextHelper.recordSynthesisHistory(userId, groupId, itemName, '', false)
            
            // 更新合成任务进度（失败也算合成次数）
            const questSystem = new QuestSystem()
            await questSystem.updateQuestProgress(userId, groupId, 'synthesis_count', 1, true)
            
            // 获取更新后的工坊数据用于统计
            const workshopAfterUpdate = await TextHelper.getUserWorkshop(userId, groupId)
            
           
            const templateData = {
                type: 'synthesis_failure',
                title: '💥 合成失败',
                username: e.sender.card || e.sender.nickname || '未知用户',
                item: {
                    name: itemName,
                    description: recipe.description
                },
                successRate: finalSuccessRate,
                returnRate: 50,
                message: '💡 提升工坊等级可以增加成功率',
                timestamp: new Date().toLocaleString(),
                materialSlots: [
                    { item: null },
                    { item: null },
                    { item: null },
                    { item: null }
                ],
                stats: {
                    totalCrafts: workshopAfterUpdate.synthesis_count || 0,
                    successfulCrafts: workshopAfterUpdate.success_count || 0,
                    successRate: workshopAfterUpdate.synthesis_count > 0 ? Math.round((workshopAfterUpdate.success_count / workshopAfterUpdate.synthesis_count) * 100) : 0
                }
            }
            
            try {
                const img = await puppeteer.screenshot('synthesis', {
                    tplFile: './resources/synthesis/synthesis.html',
                    cssPath: './resources/synthesis/synthesis.css',
                    ...templateData
                })
                
                if (img) {
                    await e.reply([global.segment.at(userId), img])
                } else {
                    await e.reply([
                        global.segment.at(userId), '\n',
                        `💥 合成失败！\n`,
                        `🎯 成功率: ${finalSuccessRate}%\n`,
                        `💔 返还了50%的材料\n`,
                        `💡 提升工坊等级可以增加成功率`
                    ])
                }
            } catch (error) {
                console.error('合成失败渲染失败:', error)
                await e.reply([
                    global.segment.at(userId), '\n',
                    `💥 合成失败！\n`,
                    `🎯 成功率: ${finalSuccessRate}%\n`,
                    `💔 返还了50%的材料\n`,
                    `💡 提升工坊等级可以增加成功率`
                ])
            }
            
            // 记录合成历史
            await TextHelper.recordSynthesis(userId, groupId, itemName, false)
        }

        if (isRedisAvailable()) {
            const synthesisCooldown = cooldownConfig.getSynthesisCooldown('synthesis_cooldown', 300)
            await redis.set(cooldownKey, currentTime, { EX: synthesisCooldown })
        } else {
            console.log(`[虚空终端] Redis不可用，使用内存缓存设置冷却时间: ${cooldownKey}`)
            memoryCache.set(cooldownKey, Date.now())
            // 5分钟后自动清除缓存
            setTimeout(() => {
                memoryCache.delete(cooldownKey)
            }, 300000)
        }
        return true
        } catch (error) {
            console.error('合成道具失败:', error)
            
            await e.reply('合成失败，请稍后再试')
            return false
        }
    }

    
    async showWorkshop(e) {
        const userId = e.user_id
        const groupId = e.group_id
        
        const workshop = await TextHelper.getUserWorkshop(userId, groupId)
        const inventory = await TextHelper.getUserInventory(userId, groupId)
        
        const shopData = TextHelper.getShopData()
        const recipes = await dataManager.loadJsonData(synthesisRecipesPath, {})
        const nextLevelExp = workshop.level * 100
        const expProgress = Math.min(100, (workshop.exp / nextLevelExp) * 100)
        
       
        const templateData = {
            username: e.sender.card || e.sender.nickname || '未知用户',
            workshopLevel: workshop.level,
            workshopExp: workshop.exp,
            expToNext: nextLevelExp,
            successBonus: Math.min(20, (workshop.level - 1) * 5),
            recipes: [],
            materialSlots: [
                { item: null },
                { item: null },
                { item: null },
                { item: null }
            ],
            inventory: Object.entries(inventory).map(([itemId, count]) => {
                const itemName = shopData.items[itemId]?.name || recipes.items[itemId]?.name || `道具${itemId}`
                const rarity = shopData.items[itemId]?.rarity || recipes.items[itemId]?.rarity || "普通"
                return {
                    name: itemName,
                    amount: count,
                    rarityIcon: TextHelper.getSynthesisRarityEmoji(rarity)
                }
            }),
            stats: {
                totalCrafts: workshop.synthesis_count || 0,
                successfulCrafts: workshop.success_count || 0,
                successRate: workshop.synthesis_count > 0 ? Math.round((workshop.success_count / workshop.synthesis_count) * 100) : 0
            }
        }
        
        try {
            const img = await puppeteer.screenshot('synthesis', {
                tplFile: './resources/synthesis/synthesis.html',
                cssPath: './resources/synthesis/synthesis.css',
                ...templateData
            })
            
            if (img) {
                await e.reply(img)
                return true
            }
        } catch (error) {
            console.error('工坊渲染失败:', error)
        }
        const msg = [
            `🏭 ${userId} 的合成工坊`,
            '━━━━━━━━━━━━━━━━',
            `📊 等级: ${workshop.level}`,
            `⭐ 经验: ${workshop.exp}/${nextLevelExp}`,
            `📈 进度: ${'█'.repeat(Math.floor(expProgress/5))}${'░'.repeat(20-Math.floor(expProgress/5))} ${expProgress.toFixed(1)}%`,
            `🎯 成功率加成: +${Math.min(20, (workshop.level - 1) * 5)}%`,
            `⚡ 合成次数: ${workshop.synthesis_count}`,
            `🏆 成功次数: ${workshop.success_count}`,
            `📊 成功率: ${workshop.synthesis_count > 0 ? ((workshop.success_count / workshop.synthesis_count) * 100).toFixed(1) : 0}%`,
            '━━━━━━━━━━━━━━━━',
            '💡 合成道具可获得工坊经验',
            '💡 工坊等级越高，合成成功率越高'
        ]
        
        await e.reply(msg.join('\n'))
        return true
    }

    
    async batchSynthesize(e) {
        const userId = e.user_id
        const groupId = e.group_id
        const match = e.msg.match(/^#?(批量合成|快速合成)\s*(.+)$/)
        const params = match?.[2]?.trim().split(' ') || []
        
        const recipes = await dataManager.loadJsonData(synthesisRecipesPath, {})
        const inventory = await TextHelper.getUserInventory(userId, groupId)
        const workshop = await TextHelper.getUserWorkshop(userId, groupId)
        const shopData = TextHelper.getShopData()
        
       
        const templateData = {
            user: {
                name: e.sender.card || e.sender.nickname || '未知用户',
                avatar: `https://q1.qlogo.cn/g?b=qq&s=0&nk=${userId}`,
                level: workshop.level,
                exp: workshop.exp
            },
            availableRecipes: Object.entries(recipes.recipes).map(([name, recipe]) => ({
                name: name,
                description: recipe.description || '暂无描述',
                materials: Object.entries(recipe.materials).map(([id, count]) => ({
                    name: shopData.items[id]?.name || `道具${id}`,
                    count: count,
                    have: inventory[id] || 0
                })),
                successRate: recipe.success_rate,
                workshopLevel: recipe.workshop_level,
                canCraft: Object.entries(recipe.materials).every(([id, count]) => (inventory[id] || 0) >= count)
            })),
            queue: [],
            queueStats: {
                totalItems: 0,
                estimatedTime: 0,
                totalCost: 0
            },
            resourceNeeds: [],
            settings: {
                mode: 'normal',
                failureHandling: 'continue',
                successRateBonus: Math.min(20, (workshop.level - 1) * 5),
                notifications: true
            },
            execution: {
                status: 'ready',
                progress: 0,
                currentItem: '',
                successCount: 0,
                failureCount: 0
            },
            history: []
        }
        
        try {
            await image(e, 'batch_synthesize', { templateData })
        } catch (error) {
            console.error('批量合成渲染失败:', error)
            
            if (params.length < 2) {
                await e.reply('格式: #批量合成 [道具名] [数量]')
                return true
            }
            
            const itemName = params[0]
            const count = parseInt(params[1]) || 1
            
            if (count > 10) {
                await e.reply('单次批量合成最多10个！')
                return true
            }

            const recipe = recipes.recipes[itemName]
            
            if (!recipe) {
                await e.reply(`找不到 ${itemName} 的合成配方！`)
                return true
            }

            // 检查材料是否足够批量合成
            for (let [itemId, needCount] of Object.entries(recipe.materials)) {
                const totalNeed = needCount * count
                const haveCount = inventory[itemId] || 0
                if (haveCount < totalNeed) {
                    const itemName = shopData.items[itemId]?.name || `道具${itemId}`
                    await e.reply(`材料不足！${itemName} 需要${totalNeed}个，拥有${haveCount}个`)
                    return true
                }
            }

            let successCount = 0
            let results = []
            
            const levelBonus = Math.min(20, (workshop.level - recipe.workshop_level) * 5)
            const finalSuccessRate = Math.min(95, recipe.success_rate + levelBonus)
            
            for (let i = 0; i < count; i++) {
                const success = Math.random() * 100 < finalSuccessRate
                if (success) {
                    successCount++
                    await TextHelper.addToInventory(userId, groupId, recipe.result_id, 1)
                }
                
                // 消耗材料
                for (let [itemId, needCount] of Object.entries(recipe.materials)) {
                    const consumeCount = success ? needCount : Math.ceil(needCount * 0.5)
                    await TextHelper.removeFromInventory(userId, groupId, itemId, consumeCount)
                }
            }
            
            // 增加工坊经验
            await TextHelper.addWorkshopExp(userId, groupId, count * 5)
            
            const rarity = recipes.items[recipe.result_id]?.rarity || "普通"
            const rarityEmoji = TextHelper.getSynthesisRarityEmoji(rarity)
            
            await e.reply([
                global.segment.at(userId), '\n',
                `🔨 批量合成完成！\n`,
                `📦 尝试合成: ${count} 个 ${itemName}\n`,
                `✨ 成功: ${successCount} 个\n`,
                `💥 失败: ${count - successCount} 个\n`,
                `🎯 成功率: ${((successCount / count) * 100).toFixed(1)}%\n`,
                `⭐ 工坊经验 +${count * 5}`
            ])
        }
        
        return true
    }

    
    async decomposeItem(e) {
        const userId = e.user_id
        const groupId = e.group_id
        const match = e.msg.match(/^#?(分解道具|道具分解)\s*(.+)$/)
        const params = match?.[2]?.trim().split(' ') || []
        
        const recipes = await dataManager.loadJsonData(synthesisRecipesPath, {})
        const inventory = await TextHelper.getUserInventory(userId, groupId)
        const shopData = TextHelper.getShopData()
        
       
        const templateData = {
            user: {
                name: e.sender.card || e.sender.nickname || '未知用户',
                avatar: `https://q1.qlogo.cn/g?b=qq&s=0&nk=${userId}`,
                money: 0,
                level: 1
            },
            availableItems: Object.entries(inventory).filter(([id, count]) => {
                return recipes.decompose[id] && count > 0
            }).map(([id, count]) => {
                const item = recipes.items[id]
                const decomposeData = recipes.decompose[id]
                return {
                    id: id,
                    name: item?.name || `道具${id}`,
                    count: count,
                    rarity: item?.rarity || 'common',
                    value: item?.value || 0,
                    successRate: decomposeData.success_rate,
                    materials: Object.entries(decomposeData.materials).map(([matId, matCount]) => ({
                        name: shopData.items[matId]?.name || `材料${matId}`,
                        count: matCount
                    }))
                }
            }),
            selectedItems: [],
            preview: {
                totalValue: 0,
                averageSuccessRate: 0,
                expectedMaterials: []
            },
            settings: {
                mode: 'normal',
                boostItems: [],
                autoProcess: false
            },
            execution: {
                itemCount: 0,
                expectedValue: 0,
                overallSuccessRate: 0,
                estimatedTime: 0
            },
            results: {
                successCount: 0,
                failureCount: 0,
                materials: [],
                records: []
            },
            recentRecords: []
        }
        
        try {
            await image(e, 'decompose_item', { templateData })
        } catch (error) {
            console.error('物品分解渲染失败:', error)
            
            if (params.length < 1) {
                await e.reply('格式: #分解道具 [道具名] [数量(可选)]')
                return true
            }
            
            // 检查分解冷却
            const decomposeCooldownKey = `akasha:decompose-cd:${groupId}:${userId}`
            let lastDecompose = 0
            
            if (isRedisAvailable()) {
                lastDecompose = await redis.ttl(decomposeCooldownKey)
            } else {
                console.log(`[虚空终端] Redis不可用，使用内存缓存检查冷却时间: ${decomposeCooldownKey}`)
                const cachedTime = memoryCache.get(decomposeCooldownKey)
                if (cachedTime) {
                    const elapsed = Math.floor((Date.now() - cachedTime) / 1000)
                    const decomposeCooldown = cooldownConfig.getSynthesisCooldown('decompose_cooldown', 180)
                    lastDecompose = decomposeCooldown - elapsed
                }
            }
            
            if (lastDecompose > 0) {
                await e.reply(`分解冷却中，还需等待 ${Math.ceil(lastDecompose / 60)} 分钟`)
                return true
            }
            
            const itemName = params[0]
            const count = parseInt(params[1]) || 1
            
            // 找对应道具ID
            let targetItemId = null
            for (let [id, item] of Object.entries(recipes.items)) {
                if (item.name === itemName) {
                    targetItemId = id
                    break
                }
            }
            
            if (!targetItemId || !recipes.decompose[targetItemId]) {
                await e.reply(`${itemName} 无法分解！`)
                return true
            }
            
            const haveCount = inventory[targetItemId] || 0
            
            if (haveCount < count) {
                await e.reply(`${itemName} 数量不足！拥有${haveCount}个，需要${count}个`)
                return true
            }
            
            const decomposeData = recipes.decompose[targetItemId]
            
            let successCount = 0
            let materials = {}
            
            for (let i = 0; i < count; i++) {
                const success = Math.random() * 100 < decomposeData.success_rate
                if (success) {
                    successCount++
                    for (let [materialId, materialCount] of Object.entries(decomposeData.materials)) {
                        materials[materialId] = (materials[materialId] || 0) + materialCount
                    }
                }
            }
            
            await TextHelper.removeFromInventory(userId, groupId, targetItemId, count)
            
            // 添加分解材料
            for (let [materialId, materialCount] of Object.entries(materials)) {
                await TextHelper.addToInventory(userId, groupId, materialId, materialCount)
            }
            
            const materialList = []
            for (let [materialId, materialCount] of Object.entries(materials)) {
                const materialName = shopData.items[materialId]?.name || `道具${materialId}`
                materialList.push(`${materialName}×${materialCount}`)
            }
            
            await e.reply([
                global.segment.at(userId), '\n',
                `🔧 分解完成！\n`,
                `📦 分解: ${count} 个 ${itemName}\n`,
                `✨ 成功: ${successCount} 次\n`,
                `🎯 成功率: ${((successCount / count) * 100).toFixed(1)}%\n`,
                `📋 获得材料: ${materialList.join(', ') || '无'}`
            ])
            
            const decomposeCooldown = cooldownConfig.getSynthesisCooldown('decompose_cooldown', 180)
            if (isRedisAvailable()) {
                await redis.set(decomposeCooldownKey, '1', 'EX', decomposeCooldown)
            } else {
                console.log(`[虚空终端] Redis不可用，使用内存缓存设置冷却时间: ${decomposeCooldownKey}`)
                memoryCache.set(decomposeCooldownKey, Date.now())
            }
        }
        
        return true
    }

    async synthesisHistory(e) {
        const userId = e.user_id
        const groupId = e.group_id
        
        // 获取合成历史记录
        const historyKey = `akasha:synthesis-history:${groupId}:${userId}`
        let history = []
        
        try {
            if (isRedisAvailable()) {
                const historyData = await redis.get(historyKey)
                if (historyData) {
                    history = JSON.parse(historyData)
                }
            } else {
                history = memoryCache.get(historyKey) || []
            }
        } catch (error) {
            console.error('获取合成历史失败:', error)
        }
        
        if (history.length === 0) {
            await e.reply([
                global.segment.at(userId), '\n',
                `📜 合成历史记录\n`,
                `暂无合成记录\n`,
                `💡 使用 #合成 [道具名] 开始你的合成之旅`
            ])
            return true
        }
        
        // 按时间倒序排列，显示最近10条记录
        history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        const recentHistory = history.slice(0, 10)
        
        let msg = [
            global.segment.at(userId), '\n',
            `📜 合成历史记录 (最近10条)\n`,
            `━━━━━━━━━━━━━━━━\n`
        ]
        
        recentHistory.forEach((record, index) => {
            const time = moment(record.timestamp).format('MM-DD HH:mm')
            const status = record.success ? '✅' : '❌'
            const result = record.success ? record.result_name : '合成失败'
            
            msg.push(`${index + 1}. ${status} ${record.recipe_name}\n`)
            msg.push(`   🕐 ${time} → ${result}\n`)
        })
        
        // 统计信息
        const totalAttempts = history.length
        const successCount = history.filter(h => h.success).length
        const successRate = totalAttempts > 0 ? ((successCount / totalAttempts) * 100).toFixed(1) : 0
        
        msg.push(`━━━━━━━━━━━━━\n`)
        msg.push(`📊 统计信息:\n`)
        msg.push(`🔨 总合成次数: ${totalAttempts}\n`)
        msg.push(`✅ 成功次数: ${successCount}\n`)
        msg.push(`📈 成功率: ${successRate}%\n`)
        msg.push(`━━━━━━━━━━━━━`)
        
        await e.reply(msg)
        return true
    }

    async upgradeWorkshop(e) {
        const userId = e.user_id
        const groupId = e.group_id
        
        const workshop = await TextHelper.getUserWorkshop(userId, groupId)
        const requiredExp = workshop.level * 100
        const recipes = await dataManager.loadJsonData(synthesisRecipesPath, {})
        
       
        const templateData = {
            workshop: {
                level: workshop.level,
                name: `${workshop.level}级合成工坊`,
                description: `专业的道具合成工坊，等级越高成功率越高`,
                exp: workshop.exp,
                requiredExp: requiredExp,
                successRate: Math.min(20, (workshop.level - 1) * 5),
                synthesisCount: workshop.synthesis_count || 0,
                successCount: workshop.success_count || 0
            },
            canUpgrade: workshop.exp >= requiredExp,
            upgradeCost: workshop.level * 1000,
            nextLevelBenefits: [
                `成功率提升 +5%`,
                `解锁更高级配方`,
                `减少材料消耗`,
                `增加经验获取`
            ],
            upgradeHistory: [],
            suggestions: [
                `多进行合成来获得经验值`,
                `成功的合成会获得更多经验`,
                `使用幸运符可以提高成功率`
            ]
        }
        
        try {
            await image(e, 'workshop_upgrade', { templateData })
        } catch (error) {
            console.error('工坊升级渲染失败:', error)
            
            if (workshop.exp < requiredExp) {
                await e.reply([
                    global.segment.at(userId), '\n',
                    `🏭 工坊升级失败！\n`,
                    `📊 当前等级: ${workshop.level}\n`,
                    `⭐ 当前经验: ${workshop.exp}/${requiredExp}\n`,
                    `💡 还需要 ${requiredExp - workshop.exp} 经验值才能升级`
                ])
                return true
            }
            
            // 执行升级
            const oldLevel = workshop.level
            workshop.level++
            workshop.exp -= requiredExp
            
            // 更新工坊任务进度
            const questSystem = new QuestSystem()
            await questSystem.updateQuestProgress(userId, groupId, 'workshop_level', workshop.level, false)
            
            const workshopKey = `akasha:workshop:${groupId}:${userId}`
            if (isRedisAvailable()) {
                await redis.set(workshopKey, JSON.stringify(workshop))
            } else {
                console.log(`[虚空终端] Redis不可用，使用内存缓存更新工坊数据: ${workshopKey}`)
                memoryCache.set(workshopKey, workshop)
            }
            
            await e.reply([
                global.segment.at(userId), '\n',
                `🎉 工坊升级成功！\n`,
                `📊 等级: ${oldLevel} → ${workshop.level}\n`,
                `⭐ 剩余经验: ${workshop.exp}\n`,
                `🎯 成功率加成: +${Math.min(20, (workshop.level - 1) * 5)}%\n`,
                `💡 下次升级需要 ${workshop.level * 100} 经验值`
            ])
        }
        
        return true
    }
}
async function image(e, flie, obj) {
    let data = {
      quality: 100,
      tplFile: `./plugins/trss-akasha-terminal-plugin/resources/synthesis/${flie}.html`,
      ...obj,
      data: obj.templateData  // 确保templateData作为data属性传递给puppeteer
    }
    let img = await puppeteer.screenshot('trss-akasha-terminal-plugin', {
      ...data,
    })
   
    await e.reply([img])
    return true
  }

export default SynthesisSystem