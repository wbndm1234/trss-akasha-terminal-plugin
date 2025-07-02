import { plugin } from '../../model/api/api.js'
import schedule from 'node-schedule'
import common from '../../../../lib/common/common.js'
import moment from 'moment'
import yzcfg from '../../../../lib/config/config.js'
import command from '../../components/command.js'
import fs from 'fs'
import path from 'path'

// 配置缓存
let configCache = null

// 获取配置
async function getConfig() {
    if (!configCache) {
        try {
            configCache = {
                groups: await command.getConfig('wife_cfg', 'group') || [],
                drawTime: Number(await command.getConfig('wife_cfg', 'RBBtime')) || 20,
                notice: await command.getConfig('wife_cfg', 'notice') || 'F'
            }
        } catch (error) {
            console.error('获取配置失败:', error)
            configCache = { groups: [], drawTime: 20, notice: 'F' }
        }
    }
    return configCache
}

export class VoidLottery extends plugin {
    constructor() {
        super({
            name: '虚空抽奖',
            dsc: '定时彩球抽奖系统',
            event: 'message',
            priority: 1,
            rule: [{
                reg: '^#?虚空彩球开奖$',
                fnc: 'manualDraw'
            }],
            task: {
                name: '虚空彩球定时开奖',
                cron: '0 0 * * *',
                fnc: 'scheduledDraw'
            }
        })
    }

    async manualDraw(e) {
        if (!e.isMaster) {
            return e.reply('只有主人可以手动开奖')
        }
        
        try {
            await this.startLottery()
            return e.reply('手动开奖成功')
        } catch (error) {
            console.error('手动开奖失败:', error)
            return e.reply('开奖失败，请查看控制台日志')
        }
    }

    async scheduledDraw() {
        try {
            const config = await getConfig()
            const currentHour = new Date().getHours()
            
            if (currentHour === config.drawTime) {
                await this.startLottery()
            }
        } catch (error) {
            console.error('定时开奖任务执行失败:', error)
        }
    }

    async startLottery() {
        const config = await getConfig()
        const lotteryData = this.generateLotteryNumbers()
        
        // 保存开奖数据
        await this.saveLotteryData(lotteryData)
        
        // 通知群聊
        await this.notifyGroups(config.groups)
        
        // 通知主人
        if (config.notice === 'T') {
            await this.notifyMasters()
        }
        
        console.log(`虚空彩球开奖完成: ${lotteryData.display}`)
    }

    generateLotteryNumbers() {
        const redBalls = new Set()
        
        // 生成6个不重复的红球号码(01-33)
        while (redBalls.size < 6) {
            const num = Math.floor(Math.random() * 33) + 1
            redBalls.add(num.toString().padStart(2, '0'))
        }
        
        // 生成1个蓝球号码(01-16)
        const blueBall = (Math.floor(Math.random() * 16) + 1).toString().padStart(2, '0')
        
        const redBallArray = Array.from(redBalls).sort()
        const currentDate = moment().format('YYYY-MM-DD')
        
        return {
            redball: redBallArray,
            blueball: blueBall,
            time: currentDate,
            display: `Red${redBallArray.join('')}Blue${blueBall}Time${currentDate}`
        }
    }

    async saveLotteryData(lotteryData) {
        const lotteryDir = path.join(process.cwd(), 'plugins/trss-akasha-terminal-plugin/resources/qylp')
        const lotteryFile = path.join(lotteryDir, 'lottery.json')
        
        try {
            // 确保目录存在
            if (!fs.existsSync(lotteryDir)) {
                fs.mkdirSync(lotteryDir, { recursive: true })
            }
            
            // 读取现有数据
            let lotteryJson = {}
            if (fs.existsSync(lotteryFile)) {
                const content = fs.readFileSync(lotteryFile, 'utf8')
                lotteryJson = content ? JSON.parse(content) : {}
            }
            
            // 保存新的开奖数据
            lotteryJson.RBB = {
                redball: lotteryData.redball,
                blueball: lotteryData.blueball,
                time: lotteryData.time
            }
            
            fs.writeFileSync(lotteryFile, JSON.stringify(lotteryJson, null, 2))
        } catch (error) {
            console.error('保存开奖数据失败:', error)
            throw error
        }
    }

    async notifyGroups(groups) {
        const message = '娱乐小游戏虚空彩球已开奖！\n今日购买的玩家可发送"虚空彩球兑换"进行兑换\n也可发送"我的彩票"查看自己的号码'
        
        for (const groupId of groups) {
            try {
                await Bot.pickGroup(groupId).sendMsg(message)
                console.log(`已通知群聊 ${groupId} 虚空彩球开奖`)
                // 添加延迟避免发送过快
                await new Promise(resolve => setTimeout(resolve, 1000))
            } catch (error) {
                console.error(`通知群聊 ${groupId} 失败:`, error.message)
            }
        }
    }

    async notifyMasters() {
        const message = '虚空彩球已开奖，快去通知玩家们吧！\n数据保存在: plugins/trss-akasha-terminal-plugin/resources/qylp/lottery.json'
        
        for (const masterId of yzcfg.masterQQ) {
            try {
                await common.relpyPrivate(masterId, message)
            } catch (error) {
                console.error(`通知主人 ${masterId} 失败:`, error.message)
            }
        }
    }
}

// 定时任务现在通过 Yunzai 的内置系统处理

export default VoidLottery
