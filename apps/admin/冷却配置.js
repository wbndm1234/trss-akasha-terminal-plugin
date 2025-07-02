import cooldownConfig from '../../components/cooldown_config.js'

export class CooldownAdmin extends plugin {
    constructor() {
        super({
            name: '冷却时间配置管理',
            dsc: '冷却时间配置',
            event: 'message',
            priority: 100,
            rule: [
                {
                    reg: '^#?(查看冷却配置|冷却配置)$',
                    fnc: 'showCooldownConfig'
                },
                {
                    reg: '^#?(重载冷却配置|刷新冷却配置)$',
                    fnc: 'reloadCooldownConfig'
                }
            ]
        })
    }

    
    async showCooldownConfig(e) {
        if (!e.isMaster) {
            await e.reply(' 只有主人才能查看冷却配置')
            return
        }

        try {
            const config = cooldownConfig.getAllConfig()
            
            let msg = [
                '📋 当前冷却时间配置\n',
                '━━━━━━━━━━━━━━━━━━━━\n',
                '🔸 增强老婆系统:\n',
                `  约会冷却: ${config.enhanced_wife_system.date_cooldown}秒\n`,
                `  表白冷却: ${config.enhanced_wife_system.confession_cooldown}秒\n`,
                `  求婚冷却: ${config.enhanced_wife_system.propose_cooldown}秒\n`,
                `  表白等待: ${config.enhanced_wife_system.confession_wait}秒\n\n`,
                
                '🔸 商城系统:\n',
                `  签到冷却: ${config.shop_system.signin_cooldown}秒\n`,
                `  连签过期: ${config.shop_system.streak_expire}秒\n`,
                `  保护持续: ${config.shop_system.protection_duration}秒\n`,
                `  幸运持续: ${config.shop_system.luck_duration}秒\n\n`,
                
                '🔸 合成系统:\n',
                `  合成冷却: ${config.synthesis_system.synthesis_cooldown}秒\n`,
                `  分解冷却: ${config.synthesis_system.decompose_cooldown}秒\n\n`,
                
                '🔸 其他系统:\n',
                `  抽卡冷却: ${config.other_systems.gacha_cooldown}秒\n`,
                `  决斗冷却: ${config.other_systems.duel_cooldown}秒\n`,
                `  修炼冷却: ${config.other_systems.exercise_cooldown}秒\n`,
                `  突破冷却: ${config.other_systems.breakthrough_cooldown}秒\n\n`,
                
                '💡 使用 #重载冷却配置 重新加载配置文件\n',
            ]
            
            await e.reply(msg.join(''))
        } catch (error) {
            console.error('[虚空终端] 显示冷却配置失败:', error)
            await e.reply('❌ 显示冷却配置失败，请检查配置文件')
        }
    }

   
    async reloadCooldownConfig(e) {
        if (!e.isMaster) {
            await e.reply('❌ 只有主人才能重载冷却配置')
            return
        }

        try {
            cooldownConfig.reload()
            await e.reply('✅ 冷却时间配置已重新加载')
        } catch (error) {
            console.error('[虚空终端] 重载冷却配置失败:', error)
            await e.reply('❌ 重载冷却配置失败，请检查配置文件格式')
        }
    }

    formatTime(seconds) {
        if (seconds === 0) return '无冷却'
        if (seconds < 60) return `${seconds}秒`
        if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟`
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}小时`
        return `${Math.floor(seconds / 86400)}天`
    }
}

export default CooldownAdmin