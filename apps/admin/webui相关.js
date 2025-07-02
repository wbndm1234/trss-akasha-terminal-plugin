import plugin from '../../../../lib/plugins/plugin.js'
import webUIServer from '../../webui/server.js'
import mysqlManager from '../../components/mysql_manager.js'
import fs from 'fs'
import path from 'path'

export class WebUIManager extends plugin {
    constructor() {
        super({
            name: 'WebUI管理',
            dsc: 'WebUI管理界面控制',
            event: 'message',
            priority: 1000,
            rule: [
                {
                    reg: '^#启动webui$',
                    fnc: 'startWebUI'
                },
                {
                    reg: '^#停止webui$',
                    fnc: 'stopWebUI'
                },
                {
                    reg: '^#webui状态$',
                    fnc: 'getWebUIStatus'
                },
                {
                    reg: '^#启动mysql$',
                    fnc: 'startMySQL'
                },
                {
                    reg: '^#停止mysql$',
                    fnc: 'stopMySQL'
                },
                {
                    reg: '^#mysql状态$',
                    fnc: 'getMySQLStatus'
                },
                {
                    reg: '^#同步json到mysql$',
                    fnc: 'syncJsonToMySQL'
                },
                {
                    reg: '^#同步mysql到json$',
                    fnc: 'syncMySQLToJson'
                },
                {
                    reg: '^#设置webui自动启动$',
                    fnc: 'setWebUIAutoStart'
                },
                {
                    reg: '^#设置mysql自动启动$',
                    fnc: 'setMySQLAutoStart'
                }
            ]
        })
        this.initAutoStart()
    }

    // 初始化自动启动
    async initAutoStart() {
        const config = this.loadWebUIConfig()
        if (config.autoStart) {
            console.log('WebUI自动启动已启用，正在启动...')
            setTimeout(async () => {
                try {
                    await webUIServer.start(3000)
                    console.log('WebUI自动启动成功')
                } catch (error) {
                    console.log('WebUI自动启动失败:', error.message)
                }
            }, 3000) // 延迟3秒启动
        }
    }

    // 加载WebUI配置
    loadWebUIConfig() {
        try {
            const configPath = './plugins/trss-akasha-terminal-plugin/config/webui_config.json'
            if (fs.existsSync(configPath)) {
                return JSON.parse(fs.readFileSync(configPath, 'utf8'))
            }
        } catch (error) {
            console.error('WebUI配置加载失败:', error)
        }
        return { autoStart: true, sleepMode: true, sleepTimeout: 24 * 60 * 60 * 1000 } // 默认配置
    }

    saveWebUIConfig(config) {
        try {
            const configPath = './plugins/trss-akasha-terminal-plugin/config/webui_config.json'
            const configDir = path.dirname(configPath)
            if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir, { recursive: true })
            }
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
        } catch (error) {
            console.error('WebUI配置保存失败:', error)
        }
    }

    async startWebUI(e) {
        try {
            const status = webUIServer.getStatus()
            
            if (status.running) {
                await this.reply(`WebUI管理界面已在运行\n访问地址: ${status.url}`, true)
                return
            }

            await this.reply('正在启动WebUI管理界面...', true)
            await webUIServer.start(3000)
            const newStatus = webUIServer.getStatus()
            
            let message = `WebUI管理界面启动成功！\n访问地址: ${newStatus.url}`
            
            if (newStatus.port !== 3000) {
                message += `\n\n注意: 默认端口3000被占用，已自动切换到端口${newStatus.port}`
            }
            
            message += `\n\n功能说明：\n- MySQL数据库管理\n- 用户数据编辑\n- 数据同步控制\n- 命令使用统计\n- 插件配置管理`
            
            await this.reply(message, true)
        } catch (error) {
            console.error('启动WebUI失败:', error)
            let errorMsg = `启动WebUI失败: ${error.message}`
            
            if (error.message.includes('无法找到可用端口')) {
                errorMsg += '\n\n建议解决方案：\n1. 关闭占用端口3000-3010的其他程序\n2. 重启系统释放端口\n3. 检查防火墙设置'
            }
            
            await this.reply(errorMsg, true)
        }
    }

    async stopWebUI(e) {
        try {
            const status = webUIServer.getStatus()
            
            if (!status.running) {
                await this.reply('WebUI管理界面未运行', true)
                return
            }

            await webUIServer.stop()
            await this.reply('WebUI管理界面已停止', true)
        } catch (error) {
            console.error('停止WebUI失败:', error)
            await this.reply(`停止WebUI失败: ${error.message}`, true)
        }
    }

    async setWebUIAutoStart(e) {
        try {
            const config = this.loadWebUIConfig()
            config.autoStart = !config.autoStart
            this.saveWebUIConfig(config)
            
            await this.reply(`WebUI自动启动已${config.autoStart ? '启用' : '禁用'}\n重启机器人后生效`, true)
        } catch (error) {
            console.error('设置WebUI自动启动失败:', error)
            await this.reply(`设置WebUI自动启动失败: ${error.message}`, true)
        }
    }

    async setMySQLAutoStart(e) {
        try {
            mysqlManager.setAutoStart(!mysqlManager.autoStart)
            await this.reply(`MySQL自动启动已${mysqlManager.autoStart ? '启用' : '禁用'}\n重启机器人后生效`, true)
        } catch (error) {
            console.error('设置MySQL自动启动失败:', error)
            await this.reply(`设置MySQL自动启动失败: ${error.message}`, true)
        }
    }

    async getWebUIStatus(e) {
        try {
            const status = webUIServer.getStatus()
            const mysqlStatus = {
                enabled: mysqlManager.isEnabled,
                connected: mysqlManager.connection !== null
            }
            
            let message = `WebUI状态: ${status.running ? '运行中' : '已停止'}\n`
            
            if (status.running) {
                message += `访问地址: ${status.url}\n`
            }
            
            message += `\nMySQL状态:\n`
            message += `- 启用状态: ${mysqlStatus.enabled ? '已启用' : '未启用'}\n`
            message += `- 连接状态: ${mysqlStatus.connected ? '已连接' : '未连接'}\n`
            
            if (mysqlStatus.enabled && mysqlStatus.connected) {
                message += `- 数据库: ${mysqlManager.config.database}\n`
                message += `- 主机: ${mysqlManager.config.host}:${mysqlManager.config.port}`
            }
            
            await this.reply(message, true)
        } catch (error) {
            console.error('获取WebUI状态失败:', error)
            await this.reply(`获取状态失败: ${error.message}`, true)
        }
    }

    async startMySQL(e) {
        try {
            // 重新加载配置以确保获取最新状态
            mysqlManager.reloadConfig()
            
            if (!mysqlManager.isEnabled) {
                await this.reply('MySQL功能未启用，请先在WebUI中配置MySQL设置', true)
                return
            }

            if (mysqlManager.connection) {
                await this.reply('MySQL已连接', true)
                return
            }

            const result = await mysqlManager.connect()
            
            if (result) {
                await this.reply('MySQL连接成功！\n数据库已初始化，可以开始使用MySQL存储功能', true)
            } else {
                await this.reply('MySQL连接失败，请检查配置信息', true)
            }
        } catch (error) {
            console.error('启动MySQL失败:', error)
            await this.reply(`启动MySQL失败: ${error.message}`, true)
        }
    }

    async stopMySQL(e) {
        try {
            if (!mysqlManager.connection) {
                await this.reply('MySQL未连接', true)
                return
            }

            await mysqlManager.disconnect()
            await this.reply('MySQL连接已断开', true)
        } catch (error) {
            console.error('停止MySQL失败:', error)
            await this.reply(`停止MySQL失败: ${error.message}`, true)
        }
    }

    async getMySQLStatus(e) {
        try {
            const status = {
                enabled: mysqlManager.isEnabled,
                connected: mysqlManager.connection !== null
            }
            
            let message = `MySQL状态:\n`
            message += `- 启用状态: ${status.enabled ? '已启用' : '未启用'}\n`
            message += `- 连接状态: ${status.connected ? '已连接' : '未连接'}\n`
            
            if (status.enabled) {
                message += `\n配置信息:\n`
                message += `- 主机: ${mysqlManager.config.host}\n`
                message += `- 端口: ${mysqlManager.config.port}\n`
                message += `- 用户: ${mysqlManager.config.user}\n`
                message += `- 数据库: ${mysqlManager.config.database}`
            }
            
            await this.reply(message, true)
        } catch (error) {
            console.error('获取MySQL状态失败:', error)
            await this.reply(`获取状态失败: ${error.message}`, true)
        }
    }

    async syncJsonToMySQL(e) {
        try {
            if (!mysqlManager.connection) {
                await this.reply('MySQL未连接，请先启动MySQL', true)
                return
            }

            await this.reply('开始同步JSON数据到MySQL...', true)
            
            const result = await mysqlManager.syncJsonToMySQL()
            
            if (result) {
                await this.reply('JSON数据同步到MySQL成功！\n所有用户数据已导入到数据库', true)
            } else {
                await this.reply('数据同步失败，请检查日志获取详细信息', true)
            }
        } catch (error) {
            console.error('同步JSON到MySQL失败:', error)
            await this.reply(`同步失败: ${error.message}`, true)
        }
    }

    async syncMySQLToJson(e) {
        try {
            if (!mysqlManager.connection) {
                await this.reply('MySQL未连接，请先启动MySQL', true)
                return
            }

            await this.reply('开始同步MySQL数据到JSON...', true)
            
            const result = await mysqlManager.syncMySQLToJson()
            
            if (result) {
                await this.reply('MySQL数据同步到JSON成功！\n数据库数据已导出到JSON文件', true)
            } else {
                await this.reply('数据同步失败，请检查日志获取详细信息', true)
            }
        } catch (error) {
            console.error('同步MySQL到JSON失败:', error)
            await this.reply(`同步失败: ${error.message}`, true)
        }
    }
}

export default WebUIManager