import { BotApi, AlemonApi, plugin } from '../../model/api/api.js'
import fs from 'fs'
import path from 'path'
import dataManager from '../../components/data_manager.js'
import mysqlManager from '../../components/mysql_manager.js'

const DATA_DIR = path.join(process.cwd(), 'plugins/trss-akasha-terminal-plugin/data/UserData')
const WEAPON_DATA_PATH = path.join(process.cwd(), 'plugins/trss-akasha-terminal-plugin/resources/weapon/weapon.json')
const WEAPON_IMAGE_DIR = path.join(process.cwd(), 'plugins/trss-akasha-terminal-plugin/resources/weapon')

const USER_TEMPLATE = {
    money: 5,
    weapons: { 3: {}, 4: {}, 5: {} }
}

const COOLDOWN_TIME = 5 * 60 * 1000 // 5分钟
const GACHA_RATES = {
    5: 16,   // 1.6%
    4: 150,  // 15%
    3: 1000  // 其余为3星
}

class WeaponGachaSystem {
    constructor() {
        this.cooldowns = new Map()
        this.weaponData = null
        this.loadWeaponData()
    }

    async loadWeaponData() {
        try {
            if (fs.existsSync(WEAPON_DATA_PATH)) {
                this.weaponData = await dataManager.loadJsonData(WEAPON_DATA_PATH)
            } else {
                console.error('武器数据文件不存在:', WEAPON_DATA_PATH)
                this.weaponData = { 3: {}, 4: {}, 5: {}, '3星数量': 0, '4星数量': 0, '5星数量': 0 }
            }
        } catch (error) {
            console.error('加载武器数据失败:', error)
            this.weaponData = { 3: {}, 4: {}, 5: {}, '3星数量': 0, '4星数量': 0, '5星数量': 0 }
        }
    }

    isOnCooldown(userId) {
        const cooldownEnd = this.cooldowns.get(userId)
        if (cooldownEnd && Date.now() < cooldownEnd) {
            return Math.ceil((cooldownEnd - Date.now()) / 60000) // 返回剩余分钟数
        }
        return false
    }

    setCooldown(userId) {
        this.cooldowns.set(userId, Date.now() + COOLDOWN_TIME)
    }

    async getUserData(userId) {
        const userFile = path.join(DATA_DIR, `${userId}.json`)
        
        // 确保目录存在
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true })
        }

        // 如果用户文件不存在，创建新用户
        if (!fs.existsSync(userFile)) {
            const newUser = { ...USER_TEMPLATE }
            await dataManager.saveJsonData(userFile, newUser)
            return newUser
        }

        try {
            const userData = await dataManager.loadJsonData(userFile)
            // 确保用户数据结构完整
            if (!userData.weapons) {
                userData.weapons = { 3: {}, 4: {}, 5: {} }
            }
            return userData
        } catch (error) {
            console.error(`读取用户数据失败 ${userId}:`, error)
            return { ...USER_TEMPLATE }
        }
    }

    async saveUserData(userId, userData) {
        const userFile = path.join(DATA_DIR, `${userId}.json`)
        try {
            await dataManager.saveJsonData(userFile, userData)
        } catch (error) {
            console.error(`保存用户数据失败 ${userId}:`, error)
        }
    }

    drawWeapon() {
        const random = Math.floor(Math.random() * 1000)
        let rarity
        
        if (random < GACHA_RATES[5]) {
            rarity = 5
        } else if (random < GACHA_RATES[4]) {
            rarity = 4
        } else {
            rarity = 3
        }

        const weaponCount = this.weaponData[`${rarity}星数量`] || 0
        if (weaponCount === 0) {
            console.error(`${rarity}星武器数据为空`)
            return null
        }

        const weaponIndex = Math.floor(Math.random() * weaponCount) + 1
        const weaponName = this.weaponData[rarity]?.[weaponIndex]
        
        if (!weaponName) {
            console.error(`获取${rarity}星武器失败，索引:${weaponIndex}`)
            return null
        }

        return { rarity, index: weaponIndex, name: weaponName }
    }

    getWeaponImagePath(rarity, weaponName) {
        const imagePath = path.join(WEAPON_IMAGE_DIR, `${rarity}`, `${weaponName}.png`)
        return fs.existsSync(imagePath) ? imagePath : null
    }
}

const gachaSystem = new WeaponGachaSystem()

export class VoidWeaponGacha extends plugin {
    constructor() {
        super({
            name: '虚空武器抽卡',
            dsc: '武器抽卡系统',
            event: 'message',
            priority: 1,
            rule: [
                {
                    reg: '^#(决斗|虚空|抽卡)?(签到|做委托|开挂)$',
                    fnc: 'dailySignIn'
                },
                {
                    reg: '^#(决斗|虚空|抽卡)?(抽武器|祈愿|十连抽武器)$',
                    fnc: 'drawWeapon'
                },
                {
                    reg: '^#武器库$',
                    fnc: 'showWeaponLibrary'
                },
                {
                    reg: '^#我的武器$',
                    fnc: 'showMyWeapons'
                }
            ]
        })
    }

    async showWeaponLibrary(e) {
        const userId = e.user_id
        const commandName = '武器库'
        
        try {
            // 记录命令使用统计
            await mysqlManager.logCommandUsage(userId, e.group_id, commandName, e.msg, true)
            const weaponData = gachaSystem.weaponData
            const counts = {
                3: weaponData['3星数量'] || 0,
                4: weaponData['4星数量'] || 0,
                5: weaponData['5星数量'] || 0
            }

            let message = `武器库总量：三星${counts[3]} 四星${counts[4]} 五星${counts[5]}\n\n`

            // 显示五星武器
            message += '★★★★★ 五星武器:\n'
            if (weaponData[5] && counts[5] > 0) {
                for (let i = 1; i <= counts[5]; i++) {
                    if (weaponData[5][i]) {
                        message += `${weaponData[5][i]}\n`
                    }
                }
            } else {
                message += '暂无五星武器\n'
            }

            // 显示四星武器
            message += '\n★★★★ 四星武器:\n'
            if (weaponData[4] && counts[4] > 0) {
                for (let i = 1; i <= counts[4]; i++) {
                    if (weaponData[4][i]) {
                        message += `${weaponData[4][i]}\n`
                    }
                }
            } else {
                message += '暂无四星武器\n'
            }

            // 显示三星武器（限制显示数量避免消息过长）
            message += '\n★★★ 三星武器（部分）:\n'
            if (weaponData[3] && counts[3] > 0) {
                const maxShow = Math.min(10, counts[3])
                for (let i = 1; i <= maxShow; i++) {
                    if (weaponData[3][i]) {
                        message += `${weaponData[3][i]}\n`
                    }
                }
                if (counts[3] > 10) {
                    message += `...还有${counts[3] - 10}把三星武器\n`
                }
            } else {
                message += '暂无三星武器\n'
            }

            return e.reply(message.trim())
        } catch (error) {
            console.error('显示武器库失败:', error)
            // 记录命令失败统计
            await mysqlManager.logCommandUsage(userId, e.group_id, commandName, e.msg, false, error.message)
            return e.reply('武器库数据加载失败，请稍后再试')
        }
    }
    async dailySignIn(e) {
        const userId = e.user_id
        const commandName = '签到'
        
        try {
            // 记录命令使用统计
            await mysqlManager.logCommandUsage(userId, e.group_id, commandName, e.msg, true)
            // 检查冷却时间
            const remainingTime = gachaSystem.isOnCooldown(userId)
            if (remainingTime) {
                return e.reply(`你刚刚进行了签到，请等待${remainingTime}分钟后再次签到！`)
            }

            // 获取用户数据
            const userData = await gachaSystem.getUserData(userId)
            const isNewUser = !userData.money || userData.money === 5

            // 处理开挂命令（仅主人可用）
            if (e.msg.includes('开挂') && e.isMaster) {
                userData.money = (userData.money || 0) + 100
                await gachaSystem.saveUserData(userId, userData)
                
                // 更新金币相关特殊任务（纠缠之缘也算货币）
                const { QuestSystem } = await import('./quest_system.js')
                 const questSystem = new QuestSystem()
                 await questSystem.updateQuestProgress(userId, e.group_id, 'max_money', userData.money)
                
                return e.reply(`开挂成功！获得了100颗纠缠之缘，当前拥有${userData.money}颗纠缠之缘`)
            }

            // 正常签到
            if (isNewUser) {
                userData.money = 5
                await gachaSystem.saveUserData(userId, userData)
                return e.reply(`欢迎来到虚空武器抽卡系统！\n注册成功，获得初始纠缠之缘${userData.money}颗`)
            } else {
                userData.money = (userData.money || 0) + 1
                await gachaSystem.saveUserData(userId, userData)
                gachaSystem.setCooldown(userId)
                
                // 更新金币相关特殊任务（纠缠之缘也算货币）
                const { QuestSystem } = await import('./quest_system.js')
                 const questSystem = new QuestSystem()
                 await questSystem.updateQuestProgress(userId, e.group_id, 'max_money', userData.money)
                
                return e.reply(`签到成功！获得1颗纠缠之缘，当前拥有${userData.money}颗纠缠之缘`)
            }
        } catch (error) {
            console.error('签到失败:', error)
            // 记录命令失败统计
            await mysqlManager.logCommandUsage(userId, e.group_id, commandName, e.msg, false, error.message)
            return e.reply('签到失败，请稍后再试')
        }
    }
    async drawWeapon(e) {
        const userId = e.user_id
        const commandName = e.msg.includes('十连') ? '十连抽武器' : '抽武器'
        
        try {
            // 记录命令使用统计
            await mysqlManager.logCommandUsage(userId, e.group_id, commandName, e.msg, true)
            // 获取用户数据
            const userData = gachaSystem.getUserData(userId)
            
            if (!userData.money && userData.money !== 0) {
                return e.reply('你还没有注册呢，请使用 #虚空签到 注册')
            }

            // 确定抽卡次数
            const drawCount = e.msg.includes('十连') ? 10 : 1
            
            // 检查纠缠之缘是否足够
            if (userData.money < drawCount) {
                return e.reply(`需要${drawCount}颗纠缠之缘，你当前只有${userData.money}颗！`)
            }

            // 扣除纠缠之缘（主人和特定用户免费）
            if (!(e.isMaster || userId === '2859167710')) {
                userData.money -= drawCount
            }

            const results = []
            const threeStarResults = []

            // 执行抽卡
            for (let i = 0; i < drawCount; i++) {
                const weapon = gachaSystem.drawWeapon()
                if (!weapon) {
                    console.error('抽卡失败，武器数据异常')
                    continue
                }

                // 更新用户武器数据
                if (!userData.weapons) {
                    userData.weapons = { 3: {}, 4: {}, 5: {} }
                }
                if (!userData.weapons[weapon.rarity]) {
                    userData.weapons[weapon.rarity] = {}
                }
                
                const weaponKey = weapon.index.toString()
                userData.weapons[weapon.rarity][weaponKey] = (userData.weapons[weapon.rarity][weaponKey] || 0) + 1
                
                const weaponCount = userData.weapons[weapon.rarity][weaponKey]
                const imagePath = gachaSystem.getWeaponImagePath(weapon.rarity, weapon.name)

                if (weapon.rarity >= 4) {
                    // 四星及以上立即发送
                    const message = [
                        `${'★'.repeat(weapon.rarity)} 恭喜获得${weapon.rarity}星武器！\n${weapon.name}\n这是你的第${weaponCount}把`,
                        imagePath ? segment.image(imagePath) : ''
                    ].filter(Boolean)
                    
                    await e.reply(message)
                    await new Promise(resolve => setTimeout(resolve, 500)) // 延迟避免刷屏
                } else {
                    // 三星武器收集起来
                    threeStarResults.push({
                        name: weapon.name,
                        count: weaponCount,
                        imagePath
                    })
                }
            }

            // 批量发送三星武器结果
            if (threeStarResults.length > 0) {
                if (drawCount === 1) {
                    const weapon = threeStarResults[0]
                    const message = [
                        `★★★ 获得三星武器：${weapon.name}\n这是你的第${weapon.count}把\n剩余纠缠之缘：${userData.money}`,
                        weapon.imagePath ? segment.image(weapon.imagePath) : ''
                    ].filter(Boolean)
                    await e.reply(message)
                } else {
                    let threeStarMsg = '★★★ 三星武器：\n'
                    threeStarResults.forEach(weapon => {
                        threeStarMsg += `${weapon.name} (第${weapon.count}把)\n`
                    })
                    threeStarMsg += `\n剩余纠缠之缘：${userData.money}`
                    await e.reply(threeStarMsg)
                }
            }

            // 保存用户数据
            gachaSystem.saveUserData(userId, userData)
            
        } catch (error) {
            console.error('抽卡失败:', error)
            // 记录命令失败统计
            await mysqlManager.logCommandUsage(userId, e.group_id, commandName, e.msg, false, error.message)
            return e.reply('抽卡系统出现错误，请稍后再试')
        }
    }
    async showMyWeapons(e) {
        const userId = e.user_id
        const commandName = '我的武器'
        
        try {
            // 记录命令使用统计
            await mysqlManager.logCommandUsage(userId, e.group_id, commandName, e.msg, true)
            // 获取用户数据
            const userData = gachaSystem.getUserData(userId)
            
            if (!userData.money && userData.money !== 0) {
                return e.reply('你还没有注册呢，请使用 #虚空签到 注册')
            }

            const weaponData = gachaSystem.weaponData
            let message = `💰 纠缠之缘：${userData.money}颗\n\n`
            let hasWeapons = false

            // 显示五星武器
            message += '★★★★★ 五星武器：\n'
            if (userData.weapons && userData.weapons[5] && Object.keys(userData.weapons[5]).length > 0) {
                hasWeapons = true
                for (const [index, count] of Object.entries(userData.weapons[5])) {
                    const weaponName = weaponData[5]?.[index]
                    if (weaponName) {
                        message += `${weaponName} ×${count}\n`
                    }
                }
            } else {
                message += '暂无五星武器\n'
            }

            // 显示四星武器
            message += '\n★★★★ 四星武器：\n'
            if (userData.weapons && userData.weapons[4] && Object.keys(userData.weapons[4]).length > 0) {
                hasWeapons = true
                for (const [index, count] of Object.entries(userData.weapons[4])) {
                    const weaponName = weaponData[4]?.[index]
                    if (weaponName) {
                        message += `${weaponName} ×${count}\n`
                    }
                }
            } else {
                message += '暂无四星武器\n'
            }

            // 显示三星武器（限制显示数量）
            message += '\n★★★ 三星武器（部分）：\n'
            if (userData.weapons && userData.weapons[3] && Object.keys(userData.weapons[3]).length > 0) {
                hasWeapons = true
                const threeStarWeapons = Object.entries(userData.weapons[3])
                const maxShow = Math.min(10, threeStarWeapons.length)
                
                for (let i = 0; i < maxShow; i++) {
                    const [index, count] = threeStarWeapons[i]
                    const weaponName = weaponData[3]?.[index]
                    if (weaponName) {
                        message += `${weaponName} ×${count}\n`
                    }
                }
                
                if (threeStarWeapons.length > 10) {
                    message += `...还有${threeStarWeapons.length - 10}种三星武器\n`
                }
            } else {
                message += '暂无三星武器\n'
            }

            if (!hasWeapons) {
                message += '\n🎯 快去抽卡获得你的第一把武器吧！'
            }

            return e.reply(message.trim())
            
        } catch (error) {
            console.error('查看武器失败:', error)
            // 记录命令失败统计
            await mysqlManager.logCommandUsage(userId, e.group_id, commandName, e.msg, false, error.message)
            return e.reply('武器数据加载失败，请稍后再试')
        }
    }
}

export default VoidWeaponGacha