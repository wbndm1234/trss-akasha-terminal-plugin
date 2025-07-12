import { plugin } from '../../model/api/api.js'
import dataManager from '../../components/data_manager.js'


function isRedisAvailable() {
    return typeof redis !== 'undefined' && redis
}

export class ReleasePrison extends plugin {
    constructor() {
        super({
            name: '释放监狱',
            dsc: '立即释放指定用户的监狱状态',
            event: 'message',
            priority: 1,
            rule: [{
                reg: '^#?释放监狱\\s*(\\d+)?$',
                fnc: 'releasePrison'
            }]
        })
    }

    async releasePrison(e) {
        if (!e.isMaster) {
            return e.reply('只有主人才可以释放监狱状态啦~')
        }
        
        const targetId = e.msg.match(/\d+/)?.[0] || e.user_id
        const groupId = e.group_id
        
        if (!groupId) {
            return e.reply('该功能仅支持群聊使用')
        }
        
        try {
            await this.releaseUserFromPrison(targetId, groupId)
            return e.reply(`已成功释放用户 ${targetId} 的监狱状态`)
        } catch (error) {
            console.error('释放监狱状态失败:', error)
            return e.reply('释放失败，请查看控制台日志')
        }
    }

    async releaseUserFromPrison(userId, groupId) {
        // 删除Redis中的监狱和禁闭记录
        if (isRedisAvailable()) {
            const prisonKey = `akasha:wife-prison:${groupId}:${userId}`
            const jinbiKey = `akasha:wife-jinbi-cd:${groupId}:${userId}`
            
            await redis.del(prisonKey)
            await redis.del(jinbiKey)
            console.log(`已删除用户 ${userId} 的Redis监狱记录`)
        }
        
        // 重置位置数据
        try {
            const placejson = await dataManager.getUserPlace(userId)
            
            if (placejson[userId] && placejson[userId].place === 'prison') {
                placejson[userId].place = 'home'
                placejson[userId].placetime = 0
                
                await dataManager.saveUserPlace(userId, placejson[userId])
                console.log(`已重置用户 ${userId} 的位置为家`)
            }
        } catch (error) {
            console.error(`重置用户 ${userId} 位置失败:`, error)
        }
        
        console.log(`成功释放用户 ${userId} 的监狱状态`)
    }
}

export default ReleasePrison