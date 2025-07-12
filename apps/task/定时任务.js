import { plugin } from '../../model/api/api.js'
import dataManager from '../../components/data_manager.js'
import command from '../../components/command.js'

// 检查Redis是否可用
function isRedisAvailable() {
    return typeof redis !== 'undefined' && redis
}

export class PunishmentChecker extends plugin {
    constructor() {
        super({
            name: '处罚检查器',
            dsc: '自动检查并解除过期的处罚',
            event: 'message',
            priority: 1,
            task: {
                name: '自动处罚检查',
                cron: '*/30 * * * *', // 每30分钟执行一次
                fnc: 'checkPunishments'
            }
        })
    }

    async checkPunishments() {
        if (!isRedisAvailable()) {
            console.log('Redis不可用，跳过处罚检查')
            return { processed: 0 }
        }

        try {
            let processedCount = 0
            
            // 获取所有监狱相关的Redis键
            const prisonKeys = await redis.keys('akasha:wife-prison:*')
            const jinbiKeys = await redis.keys('akasha:wife-jinbi-cd:*')
            
            console.log(`开始检查处罚状态: 监狱 ${prisonKeys.length} 个, 禁闭 ${jinbiKeys.length} 个`)
            
            // 检查监狱状态
            for (const key of prisonKeys) {
                const ttl = await redis.ttl(key)
                if (ttl <= 0) {
                    // 处罚已过期，解除监狱状态
                    const keyParts = key.split(':')
                    if (keyParts.length >= 4) {
                        const groupId = keyParts[2]
                        const userId = keyParts[3]
                        
                        await this.releasePrisoner(userId, groupId)
                        processedCount++
                        console.log(`已自动释放用户 ${userId} (群 ${groupId}) 的监狱处罚`)
                    }
                }
            }
            
            // 检查禁闭状态  禁闭状态会自动过期，这里只是记录日志
            for (const key of jinbiKeys) {
                const ttl = await redis.ttl(key)
                if (ttl <= 0) {
                    const keyParts = key.split(':')
                    if (keyParts.length >= 4) {
                        const groupId = keyParts[2]
                        const userId = keyParts[3]
                        console.log(`用户 ${userId} (群 ${groupId}) 的禁闭处罚已自动过期`)
                    }
                }
            }
            
            if (processedCount > 0) {
                console.log(`处罚检查完成，共处理了 ${processedCount} 个过期处罚`)
            }
            
            return { processed: processedCount }
            
        } catch (error) {
            console.error('检查处罚状态时发生错误:', error)
            throw error
        }
    }

    async releasePrisoner(userId, groupId) {
        try {
            const placejson = await dataManager.getUserPlace(userId)
          
            if (placejson[userId] && placejson[userId].place === 'prison') {
             
                placejson[userId].place = 'home'
                placejson[userId].placetime = 0
                await dataManager.saveUserPlace(userId, placejson[userId])
                await redis.del(`akasha:wife-prison:${groupId}:${userId}`)
                try {
                    const message = ' 你的监狱处罚时间已到，现在可以自由活动了！\n📍 你已被释放回家'
                    await Bot.pickGroup(groupId).sendMsg([global.segment.at(userId), "\n", message])
                } catch (notifyError) {
                    console.log(`无法通知用户 ${userId} 释放消息:`, notifyError.message)
                }
                
                console.log(`成功释放用户 ${userId} 的监狱处罚`)
            } else {
                // 用户不在监狱，只删除Redis记录
                await redis.del(`akasha:wife-prison:${groupId}:${userId}`)
                console.log(`清理了用户 ${userId} 的过期监狱记录`)
            }
            
        } catch (error) {
            console.error(`释放用户 ${userId} 时发生错误:`, error)
            throw error
        }
    }
}

export default PunishmentChecker