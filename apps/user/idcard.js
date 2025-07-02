import { BotApi, AlemonApi, plugin } from '../../model/api/api.js'
import cfg from '../../../../lib/config/config.js'
import moment from 'moment'

/**
 * 用户身份信息查询功能
 * 提供群成员身份信息的查询和展示
 */

export class UserIdentityCard extends plugin {
    constructor() {
        super({
            name: '用户身份证',
            dsc: '查询群成员身份信息',
            event: 'message',
            priority: 1,
            rule: [
                {
                    reg: '^#?(身份证|查看身份证)$',
                    fnc: 'showIdentityCard'
                }
            ]
        })
        
        // 冷却时间管理
        this.cooldowns = new Map()
        this.COOLDOWN_TIME = 10000 // 10秒冷却
    }

    /**
     * 检查冷却时间
     * @param {string} userId 用户ID
     * @returns {boolean} 是否在冷却中
     */
    checkCooldown(userId) {
        const now = Date.now()
        const lastUse = this.cooldowns.get(userId)
        
        if (lastUse && now - lastUse < this.COOLDOWN_TIME) {
            return true
        }
        
        this.cooldowns.set(userId, now)
        return false
    }

    /**
     * 显示用户身份证信息
     * @param {Object} e 消息事件对象
     */
    async showIdentityCard(e) {
        try {
            // 检查是否为群聊
            if (!e.isGroup) {
                await e.reply('此功能仅在群聊中可用')
                return true
            }

            // 检查冷却时间
            if (this.checkCooldown(e.user_id)) {
                const remainingTime = Math.ceil((this.COOLDOWN_TIME - (Date.now() - this.cooldowns.get(e.user_id))) / 1000)
                await e.reply(`请等待 ${remainingTime} 秒后再使用此功能`)
                return true
            }

            const userId = e.user_id
            const groupId = e.group_id
            const member = e.group.pickMember(userId)
            
            if (!member) {
                await e.reply('无法获取用户信息，请稍后重试')
                return true
            }

            // 获取用户信息
            const nickname = e.sender.card || e.sender.nickname || '未知'
            const joinTime = member.join_time 
                ? moment(member.join_time * 1000).format('YYYY-MM-DD HH:mm:ss')
                : '未知'
            const level = member.level || 0
            const title = member.title || '无'
            const role = this.getRoleText(member.role)

            // 构建身份证信息
            const identityInfo = [
                '═══════ 身份证 ═══════',
                `👤 用户ID：${userId}`,
                `📝 昵称：${nickname}`,
                `🏠 群号：${groupId}`,
                `📅 入群时间：${joinTime}`,
                `⭐ 群等级：${level}`,
                `🏆 群头衔：${title}`,
                `👑 群身份：${role}`,
                '═══════════════════'
            ]

            await e.reply(identityInfo.join('\n'))
        } catch (error) {
            console.error('[身份证] 查询失败:', error)
            await e.reply('查询身份信息失败，请稍后重试')
        }
        return true
    }

    /**
     * 获取角色文本描述
     * @param {string} role 角色代码
     * @returns {string} 角色描述
     */
    getRoleText(role) {
        const roleMap = {
            'owner': '群主',
            'admin': '管理员',
            'member': '群员'
        }
        return roleMap[role] || '未知'
    }
}

export default UserIdentityCard