import { BotApi, AlemonApi, plugin } from '../../model/api/api.js'
import fs from 'fs'
import path from 'path'
import moment from 'moment'
import dataManager from '../../components/data_manager.js'
import mysqlManager from '../../components/mysql_manager.js'
import { QuestSystem } from '../../components/quest_system.js'
import akasha_data from '../../components/akasha_data.js'
import command from '../../components/command.js'

const DATA_DIR = path.join(process.cwd(), 'plugins/trss-akasha-terminal-plugin/data/UserData')
const WEAPON_DATA_PATH = path.join(process.cwd(), 'plugins/trss-akasha-terminal-plugin/resources/weapon/weapon.json')
const WEAPON_IMAGE_DIR = path.join(process.cwd(), 'plugins/trss-akasha-terminal-plugin/resources/weapon')
const currentTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')

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

// 检查Redis可用性
function isRedisAvailable() {
    return global.redis && typeof global.redis.get === 'function'
}

// 获取redis实例
function getRedis() {
    return global.redis
}

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
        if (!e.group_id) {
            e.reply('该功能仅支持群聊使用')
            return
        }
        
        const userId = e.user_id
        
        try {
            // 记录命令使用统计
            await mysqlManager.logCommandUsage(userId, e.group_id, '武器图鉴', e.msg, true)
            
            // 获取用户数据
            const userData = await gachaSystem.getUserData(userId)
            const filename = `${e.group_id}.json`
            const homejson = await dataManager.getUserHome(userId, {}, filename, false)
            const placejson = await dataManager.getUserPlace(userId, {}, filename, false)
            const housejson = await dataManager.getUserHouse(userId, {}, filename, false)
            
            if (!userData.weapons) {
                return e.reply([
                    global.segment.at(userId), "\n",
                    `你还没有任何武器，快去抽卡吧！\n`,
                    `💡 使用[抽武器]开始你的冒险之旅！`
                ])
            }

            // 统计武器数量
            let totalWeapons = 0
            let weaponsByRarity = { 3: 0, 4: 0, 5: 0 }
            let mostValuableWeapon = null
            let maxRarity = 0
            
            for (let rarity in userData.weapons) {
                for (let weaponId in userData.weapons[rarity]) {
                    const count = userData.weapons[rarity][weaponId]
                    totalWeapons += count
                    weaponsByRarity[rarity] += count
                    
                    // 记录最高星级武器
                    if (parseInt(rarity) > maxRarity) {
                        maxRarity = parseInt(rarity)
                        const weaponName = gachaSystem.weaponData[rarity]?.[weaponId]
                        if (weaponName) {
                            mostValuableWeapon = { name: weaponName, rarity: parseInt(rarity) }
                        }
                    }
                }
            }

            // 获取用户信息
            let userTitle = userData.nickname || '旅行者'
            let wifeName = ''
            let loveLevel = 0
            
            if (homejson[userId] && homejson[userId].s && homejson[userId].s !== 0 && homejson[userId].s !== undefined && homejson[userId].s !== null && homejson[userId].s !== '') {
                wifeName = await this.people(e, 'nickname', homejson[userId].s) || '老婆'
                loveLevel = homejson[userId].love || 0
            }
            
            // 位置信息
            let currentPlace = placejson[userId] || { place: 'home' }
            let locationName = this.getLocationName(currentPlace.place)
            
            // 房屋等级
            let houseLevel = housejson[userId]?.loveup || 1
            
            // 构建消息
            let message = `🗡️ ${userTitle}的武器图鉴\n`
            message += `📍 当前位置：${locationName}\n`
            
            if (wifeName) {
                message += `💕 伴侣：${wifeName} (好感度${loveLevel})\n`
            }
            
            message += `🏠 房屋等级：${houseLevel}\n\n`
            
            message += `📊 武器统计\n`
            message += `━━━━━━━━━━━━━━━━\n`
            message += `🎯 总计：${totalWeapons}把武器\n`
            message += `⭐⭐⭐ 三星：${weaponsByRarity[3]}把\n`
            message += `⭐⭐⭐⭐ 四星：${weaponsByRarity[4]}把\n`
            message += `⭐⭐⭐⭐⭐ 五星：${weaponsByRarity[5]}把\n\n`
            
            // 显示最珍贵的武器
            if (mostValuableWeapon) {
                message += `👑 最珍贵的武器\n`
                message += `━━━━━━━━━━━━━━━━\n`
                message += `${'⭐'.repeat(maxRarity)} ${mostValuableWeapon.name}\n\n`
            }

            // 显示各星级武器详情
            for (let rarity = 5; rarity >= 3; rarity--) {
                if (userData.weapons[rarity] && Object.keys(userData.weapons[rarity]).length > 0) {
                    message += `${'⭐'.repeat(rarity)} ${rarity}星武器收藏\n`
                    message += `━━━━━━━━━━━━━━━━\n`
                    
                    let weaponList = []
                    for (let weaponId in userData.weapons[rarity]) {
                        const count = userData.weapons[rarity][weaponId]
                        const weaponName = gachaSystem.weaponData[rarity]?.[weaponId]
                        if (weaponName) {
                            weaponList.push(`⚔️ ${weaponName} x${count}`)
                        }
                    }
                    
                    // 限制显示数量，避免消息过长
                    if (weaponList.length > 10) {
                        message += weaponList.slice(0, 10).join('\n')
                        message += `\n... 还有${weaponList.length - 10}把武器\n\n`
                    } else {
                        message += weaponList.join('\n') + '\n\n'
                    }
                }
            }
            
            // 收藏价值评估
            let collectionValue = weaponsByRarity[5] * 1000 + weaponsByRarity[4] * 100 + weaponsByRarity[3] * 10
            let collectionRank = ''
            
            if (collectionValue >= 5000) {
                collectionRank = '🏆 传奇收藏家'
            } else if (collectionValue >= 2000) {
                collectionRank = '💎 资深收藏家'
            } else if (collectionValue >= 500) {
                collectionRank = '⚔️ 武器爱好者'
            } else {
                collectionRank = '🌟 新手冒险者'
            }
            
            message += `🎖️ 收藏等级：${collectionRank}\n`
            message += `💰 收藏价值：${collectionValue}点\n`
            message += `💎 当前纠缠之缘：${userData.money || 0}\n\n`
            
            // 互动提示
            if (wifeName && Math.random() < 0.5) {
                const wifeComments = [
                    `${wifeName}对你的武器收藏很感兴趣`,
                    `${wifeName}觉得你的武器很帅气`,
                    `${wifeName}想要你教她使用武器`,
                    `${wifeName}为你的收藏感到骄傲`
                ]
                const randomComment = wifeComments[Math.floor(Math.random() * wifeComments.length)]
                message += `💭 ${randomComment}\n`
            }
            
            message += `🎯 使用[抽武器]或[十连抽武器]继续收集！`
            
            // 如果有老婆，增加好感度
            if (homejson[userId] && homejson[userId].s && homejson[userId].s !== 0 && homejson[userId].s !== undefined && homejson[userId].s !== null && homejson[userId].s !== '' && Math.random() < 0.3) {
                homejson[userId].love += 5
                await dataManager.saveUserHome(userId, homejson[userId], filename, true)
                message += `\n💕 ${wifeName}对你的武器收藏很感兴趣！好感度+5`
            }

            await e.reply([
                global.segment.at(userId), "\n",
                message
            ])
            
        } catch (error) {
            console.error('显示武器图鉴失败:', error)
            // 记录命令失败统计
            await mysqlManager.logCommandUsage(userId, e.group_id, '武器图鉴', e.msg, false, error.message)
            return e.reply('武器图鉴系统出现错误，请稍后再试')
        }
    }
    async dailySignIn(e) {
        if (!e.group_id) {
            e.reply('该功能仅支持群聊使用')
            return
        }
        
        const userId = e.user_id
        const commandName = '签到'
        
        try {
            // 记录命令使用统计
            await mysqlManager.logCommandUsage(userId, e.group_id, commandName, e.msg, true)
            
            // 检查冷却时间
            const remainingTime = gachaSystem.isOnCooldown(userId)
            if (remainingTime) {
                return e.reply([
                    global.segment.at(userId), "\n",
                    `你刚刚进行了签到，请等待${remainingTime}分钟后再次签到！\n`,
                    `💡 可以通过[抱抱]、[逛街]等方式与老婆互动哦~`
                ])
            }

            // 获取用户数据
            const userData = await gachaSystem.getUserData(userId)
            const filename = `${e.group_id}.json`
            const homejson = await dataManager.getUserHome(userId, {}, filename, false)
            const placejson = await dataManager.getUserPlace(userId, {}, filename, false)
            const housejson = await dataManager.getUserHouse(userId, {}, filename, false)
            const isNewUser = !userData.money || userData.money === 5

            // 处理开挂命令（仅主人可用）
            if (e.msg.includes('开挂') && e.isMaster) {
                userData.money = (userData.money || 0) + 100
                await gachaSystem.saveUserData(userId, userData)
                
                const questSystem = new QuestSystem()
                await questSystem.updateQuestProgress(userId, e.group_id, 'max_money', userData.money)
                
                return e.reply([
                    global.segment.at(userId), "\n",
                    `🎮 开挂成功！获得了100颗纠缠之缘\n`,
                    `💎 当前拥有${userData.money}颗纠缠之缘`
                ])
            }

            // 位置加成计算
            let currentPlace = placejson[userId] || { place: 'home' }
            let locationBonus = 0
            let locationDesc = ''
            
            switch (currentPlace.place) {
                case 'city':
                    locationBonus = 2
                    locationDesc = '城市的繁华带来额外收益'
                    break
                case 'business':
                    locationBonus = 3
                    locationDesc = '商业区的商机'
                    break
                case 'bank':
                    locationBonus = 1
                    locationDesc = '银行的稳定收益'
                    break
                case 'prison':
                    locationBonus = -1
                    locationDesc = '监狱环境恶劣'
                    break
                default:
                    locationBonus = 0
                    locationDesc = '家的温馨'
                    break
            }
            
            // 房屋等级加成
            let houseBonus = Math.floor((housejson[userId]?.loveup || 1) / 2)
            
            // 好感度加成（有老婆的话）
            let loveBonus = 0
            let wifeName = ''
            if (homejson[userId] && homejson[userId].s && homejson[userId].s !== 0 && homejson[userId].s !== undefined && homejson[userId].s !== null && homejson[userId].s !== '') {
                const loveLevel = homejson[userId].love || 0
                loveBonus = Math.floor(loveLevel / 50) // 每50好感度+1纠缠之缘
                wifeName = await this.people(e, 'nickname', homejson[userId].s) || '老婆'
            }
            
            // 连续签到加成
            let streakBonus = 0
            let streakCount = 0
            if (isRedisAvailable()) {
                const redis = getRedis()
                const streakKey = `akasha:signin-streak:${e.group_id}:${userId}`
                const lastSignin = await redis.get(streakKey)
                const today = moment().format('YYYY-MM-DD')
                const yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD')
                
                if (lastSignin === yesterday) {
                    streakCount = await redis.get(`${streakKey}:count`) || 0
                    streakCount = parseInt(streakCount) + 1
                } else if (lastSignin !== today) {
                    streakCount = 1
                }
                
                if (lastSignin !== today) {
                    await redis.set(streakKey, today, { EX: 86400 * 7 })
                    await redis.set(`${streakKey}:count`, streakCount, { EX: 86400 * 7 })
                    streakBonus = Math.min(Math.floor(streakCount / 3), 5) // 每3天连续签到+1，最多+5
                } else {
                    return e.reply([
                        global.segment.at(userId), "\n",
                        `今天已经签到过了！\n`,
                        `💡 明天再来签到吧~`
                    ])
                }
            }

            // 正常签到
            if (isNewUser) {
                userData.money = 5
                await gachaSystem.saveUserData(userId, userData)
                
                // 初始化用户数据
                if (!homejson[userId]) {
                    await this.creat_(e, userId)
                }
                
                return e.reply([
                    global.segment.at(userId), "\n",
                    `🎉 欢迎来到虚空武器抽卡系统！\n`,
                    `💎 注册成功，获得初始纠缠之缘${userData.money}颗\n`,
                    `💡 可以使用[抽武器]开始你的冒险之旅！`
                ])
            } else {
                // 计算总收益
                let baseReward = 1
                let totalReward = baseReward + locationBonus + houseBonus + loveBonus + streakBonus
                totalReward = Math.max(1, totalReward) // 最少获得1个
                
                userData.money = (userData.money || 0) + totalReward
                await gachaSystem.saveUserData(userId, userData)
                gachaSystem.setCooldown(userId)
                
                // 更新任务进度
                const questSystem = new QuestSystem()
                await questSystem.updateQuestProgress(userId, e.group_id, 'max_money', userData.money)
                await questSystem.updateQuestProgress(userId, e.group_id, 'signin_count', 1, true)
                
                // 特殊奖励事件
                let specialReward = ''
                let bonusReward = 0
                if (Math.random() < 0.1) { // 10%概率特殊奖励
                    bonusReward = 5 + Math.floor(Math.random() * 10)
                    userData.money += bonusReward
                    await gachaSystem.saveUserData(userId, userData)
                    specialReward = `\n🎁 幸运奖励：+${bonusReward}颗纠缠之缘！`
                }
                
                return e.reply([
                    global.segment.at(userId), "\n",
                    `✅ 签到成功！获得${totalReward}颗纠缠之缘\n`,
                    `💎 当前拥有：${userData.money}颗纠缠之缘\n`,
                    locationBonus !== 0 ? `📍 位置加成：${locationBonus > 0 ? '+' : ''}${locationBonus} (${locationDesc})\n` : '',
                    houseBonus > 0 ? `🏠 房屋加成：+${houseBonus}\n` : '',
                    loveBonus > 0 ? `💕 ${wifeName}的爱意加成：+${loveBonus}\n` : '',
                    streakBonus > 0 ? `🔥 连续签到${streakCount}天加成：+${streakBonus}\n` : '',
                    specialReward,
                    `\n💡 可以使用[抽武器]来获得强力装备！`
                ])
            }
        } catch (error) {
            console.error('签到失败:', error)
            // 记录命令失败统计
            await mysqlManager.logCommandUsage(userId, e.group_id, commandName, e.msg, false, error.message)
            return e.reply('签到失败，请稍后再试')
        }
    }
    async drawWeapon(e) {
        if (!e.group_id) {
            e.reply('该功能仅支持群聊使用')
            return
        }
        
        const userId = e.user_id
        const commandName = e.msg.includes('十连') ? '十连抽武器' : '抽武器'
        
        try {
            // 记录命令使用统计
            await mysqlManager.logCommandUsage(userId, e.group_id, commandName, e.msg, true)
            
            // 获取用户数据
            const userData = await gachaSystem.getUserData(userId)
            const filename = `${e.group_id}.json`
            const homejson = await dataManager.getUserHome(userId, {}, filename, false)
            const placejson = await dataManager.getUserPlace(userId, {}, filename, false)
            const housejson = await dataManager.getUserHouse(userId, {}, filename, false)
            
            if (!userData.money && userData.money !== 0) {
                return e.reply([
                    global.segment.at(userId), "\n",
                    `你还没有注册呢，请使用 #虚空签到 注册\n`,
                    `💡 注册后即可开始抽武器冒险！`
                ])
            }

            // 确定抽卡次数
            const drawCount = e.msg.includes('十连') ? 10 : 1
            
            // 检查纠缠之缘是否足够
            if (userData.money < drawCount) {
                return e.reply([
                    global.segment.at(userId), "\n",
                    `需要${drawCount}颗纠缠之缘，你当前只有${userData.money}颗！\n`,
                    `💡 可以通过[签到]获得更多纠缠之缘`
                ])
            }

            // 位置影响抽卡概率
            let currentPlace = placejson[userId] || { place: 'home' }
            let luckBonus = 0
            let locationDesc = ''
            
            switch (currentPlace.place) {
                case 'city':
                    luckBonus = 5
                    locationDesc = '城市的繁华带来好运'
                    break
                case 'business':
                    luckBonus = 3
                    locationDesc = '商业区的商机'
                    break
                case 'bank':
                    luckBonus = 2
                    locationDesc = '银行的稳定'
                    break
                case 'prison':
                    luckBonus = -10
                    locationDesc = '监狱的霉运'
                    break
                default:
                    luckBonus = 0
                    locationDesc = '家的平静'
                    break
            }
            
            // 好感度影响抽卡（老婆的祝福）
            let loveBonus = 0
            let wifeName = ''
            if (homejson[userId] && homejson[userId].s && homejson[userId].s !== 0 && homejson[userId].s !== undefined && homejson[userId].s !== null && homejson[userId].s !== '') {
                const loveLevel = homejson[userId].love || 0
                loveBonus = Math.floor(loveLevel / 100) * 2 // 每100好感度+2%概率
                wifeName = await this.people(e, 'nickname', homejson[userId].s) || '老婆'
            }
            
            // 房屋等级影响
            let houseBonus = Math.floor((housejson[userId]?.loveup || 1) - 1)
            
            // 时间影响（夜晚抽卡更容易出好东西）
            let hour = new Date().getHours()
            let timeBonus = 0
            let timeDesc = ''
            if (hour >= 22 || hour <= 6) {
                timeBonus = 3
                timeDesc = '深夜的神秘力量'
            } else if (hour >= 18 && hour <= 21) {
                timeBonus = 1
                timeDesc = '黄昏的魔法时刻'
            }

            // 扣除纠缠之缘（主人和特定用户免费）
            if (!(e.isMaster || userId === '2859167710')) {
                userData.money -= drawCount
            }

            const results = []
            const threeStarResults = []
            let totalLuckBonus = luckBonus + loveBonus + houseBonus + timeBonus

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
                    let specialMsg = ''
                    if (weapon.rarity === 5) {
                        specialMsg = '\n🎉 恭喜获得传说武器！'
                        // 五星武器增加好感度
                        if (homejson[userId] && homejson[userId].s && homejson[userId].s !== 0 && homejson[userId].s !== undefined && homejson[userId].s !== null && homejson[userId].s !== '') {
                            homejson[userId].love += 20
                            await dataManager.saveUserHome(userId, homejson[userId], filename, true)
                            specialMsg += `\n💕 ${wifeName}为你的好运感到高兴！好感度+20`
                        }
                    }
                    
                    const message = [
                        global.segment.at(userId), "\n",
                        `${'★'.repeat(weapon.rarity)} 恭喜获得${weapon.rarity}星武器！\n`,
                        `⚔️ ${weapon.name}\n`,
                        `📦 这是你的第${weaponCount}把${specialMsg}`,
                        imagePath ? global.segment.image(imagePath) : ''
                    ].filter(Boolean)
                    
                    await e.reply(message)
                    await new Promise(resolve => setTimeout(resolve, 800)) // 延迟避免刷屏
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
                        global.segment.at(userId), "\n",
                        `★★★ 获得三星武器：${weapon.name}\n`,
                        `📦 这是你的第${weapon.count}把\n`,
                        `💎 剩余纠缠之缘：${userData.money}`,
                        weapon.imagePath ? global.segment.image(weapon.imagePath) : ''
                    ].filter(Boolean)
                    await e.reply(message)
                } else {
                    let threeStarMsg = `${global.segment.at(userId)}\n★★★ 三星武器：\n`
                    threeStarResults.forEach(weapon => {
                        threeStarMsg += `⚔️ ${weapon.name} (第${weapon.count}把)\n`
                    })
                    threeStarMsg += `\n💎 剩余纠缠之缘：${userData.money}`
                    
                    if (totalLuckBonus > 0) {
                        threeStarMsg += `\n🍀 幸运加成：+${totalLuckBonus}%`
                        if (locationDesc) threeStarMsg += ` (${locationDesc})`
                        if (loveBonus > 0) threeStarMsg += ` (${wifeName}的祝福)`
                        if (timeDesc) threeStarMsg += ` (${timeDesc})`
                    }
                    
                    await e.reply(threeStarMsg)
                }
            }

            // 保存用户数据
            await gachaSystem.saveUserData(userId, userData)
            
            // 更新任务进度
            const questSystem = new QuestSystem()
            await questSystem.updateQuestProgress(userId, e.group_id, 'gacha_count', drawCount, true)
            if (drawCount === 10) {
                await questSystem.updateQuestProgress(userId, e.group_id, 'ten_gacha_count', 1, true)
            }
            
            // 抽卡后的互动事件
            if (homejson[userId] && homejson[userId].s && homejson[userId].s !== 0 && homejson[userId].s !== undefined && homejson[userId].s !== null && homejson[userId].s !== '' && Math.random() < 0.3) {
                const interactionEvents = [
                    `${wifeName}好奇地看着你的新武器`,
                    `${wifeName}为你的收获感到开心`,
                    `${wifeName}想要摸摸你的武器`,
                    `${wifeName}说这把武器很适合你`
                ]
                const randomEvent = interactionEvents[Math.floor(Math.random() * interactionEvents.length)]
                
                setTimeout(async () => {
                    await e.reply([
                        global.segment.at(userId), "\n",
                        `💭 ${randomEvent}\n`,
                        `💡 可以使用[抱抱]与${wifeName}互动哦~`
                    ])
                }, 2000)
            }
            
        } catch (error) {
            console.error('抽卡失败:', error)
            // 记录命令失败统计
            await mysqlManager.logCommandUsage(userId, e.group_id, commandName, e.msg, false, error.message)
            return e.reply('抽卡系统出现错误，请稍后再试')
        }
    }
    async showMyWeapons(e) {
        if (!e.group_id) {
            e.reply('该功能仅支持群聊使用')
            return
        }
        
        const userId = e.user_id
        
        try {
            // 记录命令使用统计
            await mysqlManager.logCommandUsage(userId, e.group_id, '我的武器', e.msg, true)
            
            // 获取用户数据
            const userData = await gachaSystem.getUserData(userId)
            const filename = `${e.group_id}.json`
            const homejson = await dataManager.getUserHome(userId, {}, filename, false)
            const placejson = await dataManager.getUserPlace(userId, {}, filename, false)
            const housejson = await dataManager.getUserHouse(userId, {}, filename, false)
            
            if (!userData.weapons) {
                return e.reply([
                    global.segment.at(userId), "\n",
                    `你还没有任何武器，快去抽卡吧！\n`,
                    `💡 使用[抽武器]开始收集属于你的武器！`
                ])
            }

            // 统计武器数量
            let totalWeapons = 0
            let weaponsByRarity = { 3: 0, 4: 0, 5: 0 }
            let favoriteWeapon = null
            let maxCount = 0
            
            for (let rarity in userData.weapons) {
                for (let weaponId in userData.weapons[rarity]) {
                    const count = userData.weapons[rarity][weaponId]
                    totalWeapons += count
                    weaponsByRarity[rarity] += count
                    
                    // 找到数量最多的武器作为最爱武器
                    if (count > maxCount) {
                        maxCount = count
                        const weaponName = gachaSystem.weaponData[rarity]?.[weaponId]
                        if (weaponName) {
                            favoriteWeapon = { name: weaponName, count, rarity: parseInt(rarity) }
                        }
                    }
                }
            }

            // 获取用户信息
            let userTitle = userData.nickname || '旅行者'
            let wifeName = ''
            let loveLevel = 0
            
            if (homejson[userId] && homejson[userId].s && homejson[userId].s !== 0 && homejson[userId].s !== undefined && homejson[userId].s !== null && homejson[userId].s !== '') {
                wifeName = await this.people(e, 'nickname', homejson[userId].s) || '老婆'
                loveLevel = homejson[userId].love || 0
            }
            
            // 位置信息
            let currentPlace = placejson[userId] || { place: 'home' }
            let locationName = this.getLocationName(currentPlace.place)
            
            // 房屋等级
            let houseLevel = housejson[userId]?.loveup || 1
            
            // 战斗力评估
            let combatPower = weaponsByRarity[5] * 500 + weaponsByRarity[4] * 100 + weaponsByRarity[3] * 20
            let combatRank = ''
            
            if (combatPower >= 3000) {
                combatRank = '🔥 传奇战士'
            } else if (combatPower >= 1500) {
                combatRank = '⚔️ 精英战士'
            } else if (combatPower >= 500) {
                combatRank = '🛡️ 熟练战士'
            } else {
                combatRank = '🗡️ 新手战士'
            }
            
            // 构建消息
            let message = `⚔️ ${userTitle}的武器库\n`
            message += `📍 当前位置：${locationName}\n`
            
            if (wifeName) {
                message += `💕 伴侣：${wifeName} (好感度${loveLevel})\n`
            }
            
            message += `🏠 房屋等级：${houseLevel}\n`
            message += `⚡ 战斗力：${combatPower} (${combatRank})\n\n`
            
            message += `📊 武器统计\n`
            message += `━━━━━━━━━━━━━━━━\n`
            message += `🎯 总计：${totalWeapons}把武器\n`
            message += `⭐⭐⭐ 三星：${weaponsByRarity[3]}把\n`
            message += `⭐⭐⭐⭐ 四星：${weaponsByRarity[4]}把\n`
            message += `⭐⭐⭐⭐⭐ 五星：${weaponsByRarity[5]}把\n\n`
            
            // 显示最爱武器
            if (favoriteWeapon) {
                message += `❤️ 最爱武器\n`
                message += `━━━━━━━━━━━━━━━━\n`
                message += `${'⭐'.repeat(favoriteWeapon.rarity)} ${favoriteWeapon.name} x${favoriteWeapon.count}\n\n`
            }

            // 显示各星级武器详情（限制显示避免过长）
            for (let rarity = 5; rarity >= 3; rarity--) {
                if (userData.weapons[rarity] && Object.keys(userData.weapons[rarity]).length > 0) {
                    message += `${'⭐'.repeat(rarity)} ${rarity}星武器\n`
                    message += `━━━━━━━━━━━━━━━━\n`
                    
                    let weaponList = []
                    for (let weaponId in userData.weapons[rarity]) {
                        const count = userData.weapons[rarity][weaponId]
                        const weaponName = gachaSystem.weaponData[rarity]?.[weaponId]
                        if (weaponName) {
                            weaponList.push(`⚔️ ${weaponName} x${count}`)
                        }
                    }
                    
                    // 限制显示数量
                    if (weaponList.length > 8) {
                        message += weaponList.slice(0, 8).join('\n')
                        message += `\n... 还有${weaponList.length - 8}把武器\n\n`
                    } else {
                        message += weaponList.join('\n') + '\n\n'
                    }
                }
            }
            
            // 成就系统
            let achievements = []
            if (weaponsByRarity[5] >= 10) achievements.push('🏆 五星收藏家')
            if (weaponsByRarity[4] >= 50) achievements.push('💎 四星大师')
            if (totalWeapons >= 100) achievements.push('📦 武器囤积者')
            if (favoriteWeapon && favoriteWeapon.count >= 10) achievements.push('❤️ 专一收藏家')
            
            if (achievements.length > 0) {
                message += `🎖️ 成就徽章\n`
                message += `━━━━━━━━━━━━━━━━\n`
                message += achievements.join(' ') + '\n\n'
            }
            
            message += `💎 当前纠缠之缘：${userData.money || 0}\n`
            
            // 互动提示
            if (wifeName && Math.random() < 0.4) {
                const wifeComments = [
                    `${wifeName}想要试试你的武器`,
                    `${wifeName}觉得你很有安全感`,
                    `${wifeName}对你的实力很有信心`,
                    `${wifeName}想要和你一起战斗`
                ]
                const randomComment = wifeComments[Math.floor(Math.random() * wifeComments.length)]
                message += `💭 ${randomComment}\n`
            }
            
            message += `🎯 使用[抽武器]或[十连抽武器]继续收集！`
            
            // 如果有老婆且武器较多，增加好感度
            if (homejson[userId] && homejson[userId].s && homejson[userId].s !== 0 && homejson[userId].s !== undefined && homejson[userId].s !== null && homejson[userId].s !== '' && totalWeapons >= 20 && Math.random() < 0.25) {
                homejson[userId].love += 3
                await dataManager.saveUserHome(userId, homejson[userId], filename, true)
                message += `\n💕 ${wifeName}对你的实力感到安心！好感度+3`
            }

            await e.reply([
                global.segment.at(userId), "\n",
                message
            ])
            
        } catch (error) {
            console.error('显示我的武器失败:', error)
            // 记录命令失败统计
            await mysqlManager.logCommandUsage(userId, e.group_id, '我的武器', e.msg, false, error.message)
            return e.reply('我的武器系统出现错误，请稍后再试')
        }
    }
    // 获取位置名称
    getLocationName(place) {
        const locationMap = {
            'home': '家',
            'city': '城市',
            'business': '商业区',
            'bank': '银行',
            'prison': '监狱',
            'hospital': '医院',
            'school': '学校',
            'park': '公园',
            'beach': '海滩',
            'mountain': '山区'
        }
        return locationMap[place] || '未知地点'
    }

    // 获取用户信息
    async people(e, type, userId) {
        try {
            if (type === 'nickname') {
                // 尝试获取群昵称
                if (e.group_id) {
                    const memberInfo = await Bot.getGroupMemberInfo(e.group_id, userId)
                    return memberInfo?.card || memberInfo?.nickname || `用户${userId}`
                }
                // 获取好友昵称
                const friendInfo = await Bot.getFriendInfo(userId)
                return friendInfo?.nickname || `用户${userId}`
            }
            return null
        } catch (error) {
            console.error('获取用户信息失败:', error)
            return `用户${userId}`
        }
    }
}

export default VoidWeaponGacha