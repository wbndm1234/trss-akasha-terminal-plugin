import fs from 'fs'
import YAML from 'yaml'
import path from 'path'

/**
 * 冷却时间配置管理器
 * 用于读取和管理各系统的冷却时间配置
 */
class CooldownConfig {
    constructor() {
        this.configPath = path.join(process.cwd(), 'plugins/trss-akasha-terminal-plugin/config/cooldown_config.yaml')
        this.config = null
        this.lastModified = null
        this.loadConfig()
    }

    /**
     * 加载配置文件
     */
    loadConfig() {
        try {
            if (!fs.existsSync(this.configPath)) {
                console.log('[虚空终端] 冷却时间配置文件不存在，使用默认配置')
                this.config = this.getDefaultConfig()
                return
            }

            const stats = fs.statSync(this.configPath)
            
            // 检查文件是否被修改，如果修改则重新加载
            if (this.lastModified && stats.mtime.getTime() === this.lastModified) {
                return
            }

            const configContent = fs.readFileSync(this.configPath, 'utf8')
            this.config = YAML.parse(configContent)
            this.lastModified = stats.mtime.getTime()
            
            console.log('[虚空终端] 冷却时间配置已加载')
        } catch (error) {
            console.error('[虚空终端] 加载冷却时间配置失败:', error)
            this.config = this.getDefaultConfig()
        }
    }

    /**
     * 获取默认配置
     */
    getDefaultConfig() {
        return {
            enhanced_wife_system: {
                date_cooldown: 3600,
                confession_cooldown: 1800,
                propose_cooldown: 3600,
                confession_wait: 300
            },
            quest_system: {
                daily_refresh: 86400,
                weekly_refresh: 604800,
                special_refresh: 86400,
                quest_complete_delay: 1
            },
            shop_system: {
                signin_cooldown: 86400,
                streak_expire: 172800,
                protection_duration: 86400,
                luck_duration: 86400,
                workboost_duration: 604800
            },
            synthesis_system: {
                synthesis_cooldown: 300,
                decompose_cooldown: 180,
                batch_synthesis_delay: 2
            },
            other_systems: {
                gacha_cooldown: 300,
                duel_cooldown: 60,
                exercise_cooldown: 1800,
                breakthrough_cooldown: 3600,
                idcard_cooldown: 10,
                cpwsc_cooldown: 30
            },
            wife_system: {
                random_marry_cooldown: 300,
                force_marry_cooldown: 600,
                work_cooldown: 1800,
                hug_cooldown: 900,
                shopping_cooldown: 1200,
                steal_wife_cooldown: 3600,
                welfare_cooldown: 7200,
                lottery_cooldown: 1800
            }
        }
    }

    /**
     * 获取指定系统的冷却时间配置
     * @param {string} system 系统名称
     * @param {string} key 配置键名
     * @param {number} defaultValue 默认值
     * @returns {number} 冷却时间（秒）
     */
    getCooldown(system, key, defaultValue = 0) {
        this.loadConfig() // 每次获取时检查配置是否更新
        
        try {
            if (this.config && this.config[system] && this.config[system][key] !== undefined) {
                const value = this.config[system][key]
                return typeof value === 'number' ? value : defaultValue
            }
            return defaultValue
        } catch (error) {
            console.error(`[虚空终端] 获取冷却时间配置失败 ${system}.${key}:`, error)
            return defaultValue
        }
    }

    /**
     * 获取增强老婆系统冷却时间
     */
    getEnhancedWifeCooldown(key, defaultValue = 0) {
        return this.getCooldown('enhanced_wife_system', key, defaultValue)
    }

    /**
     * 获取任务系统冷却时间
     */
    getQuestCooldown(key, defaultValue = 0) {
        return this.getCooldown('quest_system', key, defaultValue)
    }

    /**
     * 获取商城系统冷却时间
     */
    getShopCooldown(key, defaultValue = 0) {
        return this.getCooldown('shop_system', key, defaultValue)
    }

    /**
     * 获取合成系统冷却时间
     */
    getSynthesisCooldown(key, defaultValue = 0) {
        return this.getCooldown('synthesis_system', key, defaultValue)
    }

    /**
     * 获取其他系统冷却时间
     */
    getOtherCooldown(key, defaultValue = 0) {
        return this.getCooldown('other_systems', key, defaultValue)
    }

    /**
     * 获取老婆系统冷却时间
     */
    getWifeCooldown(key, defaultValue = 0) {
        return this.getCooldown('wife_system', key, defaultValue)
    }

    /**
     * 重新加载配置
     */
    reload() {
        this.lastModified = null
        this.loadConfig()
        console.log('[虚空终端] 冷却时间配置已重新加载')
    }

    /**
     * 获取所有配置
     */
    getAllConfig() {
        this.loadConfig()
        return this.config
    }
}

// 创建单例实例
const cooldownConfig = new CooldownConfig()

export default cooldownConfig