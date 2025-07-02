import fs from 'fs'
import YAML from 'yaml'
import path from 'path'

/**
 * 虚空配置管理功能
 * 提供配置文件的重置、获取和管理功能
 */

// 配置文件路径
const CONFIG_PATHS = {
    DEFAULT: './plugins/trss-akasha-terminal-plugin/config/akasha.config.def.yaml',
    CURRENT: './plugins/trss-akasha-terminal-plugin/config/akasha.config.yaml',
    BACKUP: './plugins/trss-akasha-terminal-plugin/config/akasha.config.back.yaml'
}

export class VoidConfigManager extends plugin {
    constructor() {
        super({
            name: '虚空配置管理',
            dsc: '管理虚空插件配置文件',
            event: 'message',
            priority: 1,
            rule: [
                {
                    reg: '^#?(强制)?(重置虚空|虚空重置)配置$',
                    fnc: 'resetConfig'
                },
                {
                    reg: '^#?(发送|获取)?虚空配置$',
                    fnc: 'getConfig'
                }
            ]
        })
    }

    /**
     * 检查是否为管理员
     * @param {Object} e 消息事件对象
     * @returns {boolean} 是否为管理员
     */
    checkPermission(e) {
        if (!e.isMaster) {
            e.reply([segment.at(e.user_id), '\n凡人，休得僭越！'])
            return false
        }
        return true
    }

    /**
     * 重置配置文件
     * @param {Object} e 消息事件对象
     */
    async resetConfig(e) {
        if (!this.checkPermission(e)) return true

        try {
            const { DEFAULT, CURRENT, BACKUP } = CONFIG_PATHS
            
            // 检查默认配置文件是否存在
            if (!fs.existsSync(DEFAULT)) {
                await e.reply('默认配置文件不存在，无法重置配置')
                return true
            }

            if (!fs.existsSync(CURRENT)) {
                // 配置文件不存在，直接复制默认配置
                fs.copyFileSync(DEFAULT, CURRENT)
                await e.reply('配置文件不存在，已自动生成默认配置。重启后生效')
            } else {
                // 配置文件存在，先备份再重置
                fs.copyFileSync(CURRENT, BACKUP)
                fs.copyFileSync(DEFAULT, CURRENT)
                await e.reply('配置已重置并备份。重启后生效')
            }
        } catch (error) {
            console.error('[配置管理] 重置配置失败:', error)
            await e.reply('重置配置失败，请检查文件权限')
        }
        return true
    }

    /**
     * 获取配置文件
     * @param {Object} e 消息事件对象
     */
    async getConfig(e) {
        if (!this.checkPermission(e)) return true

        try {
            const { CURRENT } = CONFIG_PATHS
            
            if (!fs.existsSync(CURRENT)) {
                await e.reply('配置文件不存在，请先重置配置')
                return true
            }

            // 根据消息类型发送文件
            if (e.isPrivate) {
                await e.friend.sendFile(CURRENT)
                await e.reply('配置文件已发送')
            } else if (e.isGroup) {
                await e.group.fs.upload(CURRENT)
                await e.reply('配置文件已上传到群文件')
            } else {
                await e.reply('当前环境不支持文件发送')
            }
        } catch (error) {
            console.error('[配置管理] 获取配置失败:', error)
            await e.reply('获取配置文件失败，请稍后重试')
        }
        return true
    }
}

export default VoidConfigManager