import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import mysql from 'mysql2/promise'
import akasha_data from './akasha_data.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class MySQLManager {
    constructor() {
        this.connection = null
        this.isEnabled = false
        this.autoStart = true
        this.config = {
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: '',
            database: 'akasha_terminal',
            charset: 'utf8mb4'
        }
        this.loadConfig()
        this.initAutoStart()
    }

    // 加载MySQL配置
    loadConfig() {
        try {
            const configPath = path.join(__dirname, '..', 'config', 'mysql_config.json')
            if (fs.existsSync(configPath)) {
                const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
                this.config = { ...this.config, ...config }
                this.isEnabled = config.enabled || false
                this.autoStart = config.autoStart !== false // 默认为true
            }
        } catch (error) {
            console.error('MySQL配置加载失败:', error)
        }
    }

    // 保存MySQL配置
    saveConfig() {
        try {
            const configPath = path.join(__dirname, '..', 'config', 'mysql_config.json')
            const configDir = path.dirname(configPath)
            if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir, { recursive: true })
            }
            fs.writeFileSync(configPath, JSON.stringify({
                enabled: this.isEnabled,
                autoStart: this.autoStart,
                ...this.config
            }, null, 2))
        } catch (error) {
            console.error('MySQL配置保存失败:', error)
        }
    }

    // 初始化自动启动
    async initAutoStart() {
        if (this.isEnabled && this.autoStart) {
            console.log('MySQL自动启动已启用，正在连接...')
            setTimeout(async () => {
                const success = await this.connect()
                if (success) {
                    console.log('MySQL自动启动成功')
                } else {
                    console.log('MySQL自动启动失败，请检查配置')
                }
            }, 2000) // 延迟2秒启动，确保其他组件已初始化
        }
    }

    // 重新加载配置
    reloadConfig() {
        this.loadConfig()
        console.log('MySQL配置已重新加载，启用状态:', this.isEnabled, '自动启动:', this.autoStart)
    }

    // 设置自动启动
    setAutoStart(enabled) {
        this.autoStart = enabled
        this.saveConfig()
        console.log('MySQL自动启动已', enabled ? '启用' : '禁用')
    }

    // 连接MySQL数据库
    async connect() {
        if (!this.isEnabled) {
            console.log('MySQL未启用')
            return false
        }

        try {
            this.connection = await mysql.createConnection(this.config)
            console.log('MySQL连接成功')
            if (typeof Bot !== 'undefined' && Bot.logger) {
                Bot.logger.info(`MySQL数据库连接成功 - ${this.config.host}:${this.config.port}/${this.config.database}`)
            }
            await this.initDatabase()
            return true
        } catch (error) {
            console.error('MySQL连接失败:', error)
            if (typeof Bot !== 'undefined' && Bot.logger) {
                Bot.logger.error(`MySQL连接失败: ${error.message}`)
            }
            this.connection = null
            return false
        }
    }

    // 断开MySQL连接
    async disconnect() {
        if (this.connection) {
            await this.connection.end()
            this.connection = null
            console.log('MySQL连接已断开')
        }
    }

    // 初始化数据库表结构
    async initDatabase() {
        try {
            // 创建数据库（如果不存在）
            await this.connection.execute(`CREATE DATABASE IF NOT EXISTS \`${this.config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`)
            await this.connection.query(`USE \`${this.config.database}\``)
            
            console.log('数据库初始化完成')
            if (typeof Bot !== 'undefined' && Bot.logger) {
                Bot.logger.info('MySQL数据库表结构初始化完成')
            }
            
            // 创建所有必要的表
            await this.createTables()
            
        } catch (error) {
            console.error('数据库初始化失败:', error)
            if (typeof Bot !== 'undefined' && Bot.logger) {
                Bot.logger.error(`数据库初始化失败: ${error.message}`)
            }
            throw error
        }
    }

    // 创建数据库表
    async createTables() {
        if (!this.connection) return

        const tables = [
            // 用户基础数据表
            `CREATE TABLE IF NOT EXISTS user_battle (
                user_id VARCHAR(20) PRIMARY KEY,
                experience INT DEFAULT 0,
                level INT DEFAULT 0,
                levelname VARCHAR(50) DEFAULT '无等级',
                privilege_level INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

            // 用户家园数据表
            `CREATE TABLE IF NOT EXISTS user_home (
                user_id VARCHAR(20) PRIMARY KEY,
                spouse_id VARCHAR(20) DEFAULT '0',
                wait_status INT DEFAULT 0,
                money BIGINT DEFAULT 100,
                love INT DEFAULT 0,
                money_binary TEXT,
                love_binary TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

            // 用户位置数据表
            `CREATE TABLE IF NOT EXISTS user_place (
                user_id VARCHAR(20) PRIMARY KEY,
                current_place VARCHAR(50) DEFAULT 'home',
                place_time BIGINT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

            // 用户房屋数据表
            `CREATE TABLE IF NOT EXISTS user_house (
                user_id VARCHAR(20) PRIMARY KEY,
                house_name VARCHAR(100) DEFAULT '小破屋',
                space_size INT DEFAULT 6,
                house_price INT DEFAULT 500,
                love_bonus INT DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

            // 关系数据表
            `CREATE TABLE IF NOT EXISTS relationship_data (
                id INT AUTO_INCREMENT PRIMARY KEY,
                data_type ENUM('couples', 'shops', 'adventures', 'love_bank') NOT NULL,
                data_key VARCHAR(100) NOT NULL,
                data_value JSON NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_type_key (data_type, data_key)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

            // 商店数据表
            `CREATE TABLE IF NOT EXISTS shop_data (
                user_id VARCHAR(20) PRIMARY KEY,
                shop_data JSON NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

            // 任务数据表
            `CREATE TABLE IF NOT EXISTS quest_data (
                user_id VARCHAR(20) PRIMARY KEY,
                quest_data JSON NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

            // 用户背包数据表
            `CREATE TABLE IF NOT EXISTS user_inventory (
                user_id VARCHAR(20) PRIMARY KEY,
                inventory_data JSON NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

            // 用户小妾数据表
            `CREATE TABLE IF NOT EXISTS user_xiaoqie (
                user_id VARCHAR(20) PRIMARY KEY,
                xiaoqie_data JSON NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

            // 通用用户数据表
            `CREATE TABLE IF NOT EXISTS user_general (
                user_id VARCHAR(20) PRIMARY KEY,
                general_data JSON NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

            // 目录分类用户数据表
            `CREATE TABLE IF NOT EXISTS user_directory (
                user_id VARCHAR(20) PRIMARY KEY,
                directory_data JSON NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

            // 命令使用统计表
            `CREATE TABLE IF NOT EXISTS command_stats (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(20) NOT NULL,
                group_id VARCHAR(20),
                command_name VARCHAR(100) NOT NULL,
                command_args TEXT,
                execution_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                success BOOLEAN DEFAULT TRUE,
                error_message TEXT,
                INDEX idx_user_command (user_id, command_name),
                INDEX idx_time (execution_time)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

            // 全局武器数据表
            `CREATE TABLE IF NOT EXISTS global_weapon_data (
                id INT PRIMARY KEY DEFAULT 1,
                weapon_data JSON NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

            // 全局商店数据表
            `CREATE TABLE IF NOT EXISTS global_shop_data (
                id INT PRIMARY KEY DEFAULT 1,
                shop_data JSON NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

            // 全局任务数据表
            `CREATE TABLE IF NOT EXISTS global_quest_data (
                id INT PRIMARY KEY DEFAULT 1,
                quest_data JSON NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

            // 全局合成配方数据表
            `CREATE TABLE IF NOT EXISTS global_synthesis_data (
                id INT PRIMARY KEY DEFAULT 1,
                synthesis_data JSON NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

            // 全局关系数据表
            `CREATE TABLE IF NOT EXISTS global_relationship_data (
                id INT PRIMARY KEY DEFAULT 1,
                relationship_data JSON NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
        ]

        for (const sql of tables) {
            try {
                await this.connection.execute(sql)
            } catch (error) {
                console.error('创建表失败:', error)
            }
        }

        console.log('数据库表初始化完成')
    }

    // JSON数据同步到MySQL
    async syncJsonToMySQL() {
        if (!this.connection) {
            console.log('MySQL未连接，无法同步数据')
            return false
        }

        try {
            console.log('开始同步JSON数据到MySQL...')

            // 同步战斗数据
            await this.syncBattleData()
            
            // 同步关系数据
            await this.syncRelationshipData()
            
            // 同步商店数据
            await this.syncShopData()
            
            // 同步任务数据
            await this.syncQuestData()
            
            // 同步背包数据
            await this.syncInventoryData()
            
            // 同步用户家园数据
            await this.syncUserHomeData()

            console.log('JSON数据同步到MySQL完成')
            return true
        } catch (error) {
            console.error('数据同步失败:', error)
            return false
        }
    }

    // 同步战斗数据
    async syncBattleData() {
        const battlePath = 'plugins/trss-akasha-terminal-plugin/data/battle.json'
        if (!fs.existsSync(battlePath)) return

        const battleData = JSON.parse(fs.readFileSync(battlePath, 'utf8'))
        
        for (const [userId, data] of Object.entries(battleData)) {
            await this.connection.execute(
                `INSERT INTO user_battle (user_id, experience, level, levelname, privilege_level) 
                 VALUES (?, ?, ?, ?, ?) 
                 ON DUPLICATE KEY UPDATE 
                 experience = VALUES(experience), 
                 level = VALUES(level), 
                 levelname = VALUES(levelname), 
                 privilege_level = VALUES(privilege_level)`,
                [userId, data.experience, data.level, data.levelname, data.Privilege]
            )
        }
    }

    // 同步关系数据
    async syncRelationshipData() {
        const relationshipPath = 'plugins/trss-akasha-terminal-plugin/data/relationship_data.json'
        if (!fs.existsSync(relationshipPath)) return

        const relationshipData = JSON.parse(fs.readFileSync(relationshipPath, 'utf8'))
        
        for (const [dataType, typeData] of Object.entries(relationshipData)) {
            for (const [key, value] of Object.entries(typeData)) {
                await this.connection.execute(
                    `INSERT INTO relationship_data (data_type, data_key, data_value) 
                     VALUES (?, ?, ?) 
                     ON DUPLICATE KEY UPDATE data_value = VALUES(data_value)`,
                    [dataType, key, JSON.stringify(value)]
                )
            }
        }
    }

    // 同步商店数据
    async syncShopData() {
        const shopPath = 'plugins/trss-akasha-terminal-plugin/data/shop_data.json'
        if (!fs.existsSync(shopPath)) return

        const shopData = JSON.parse(fs.readFileSync(shopPath, 'utf8'))
        
        for (const [userId, data] of Object.entries(shopData)) {
            await this.connection.execute(
                `INSERT INTO shop_data (user_id, shop_data) 
                 VALUES (?, ?) 
                 ON DUPLICATE KEY UPDATE shop_data = VALUES(shop_data)`,
                [userId, JSON.stringify(data)]
            )
        }
    }

    // 同步任务数据
    async syncQuestData() {
        const questPath = 'plugins/trss-akasha-terminal-plugin/data/user_quest.json'
        if (!fs.existsSync(questPath)) return

        const questData = JSON.parse(fs.readFileSync(questPath, 'utf8'))
        
        for (const [userId, data] of Object.entries(questData)) {
            await this.connection.execute(
                `INSERT INTO quest_data (user_id, quest_data) 
                 VALUES (?, ?) 
                 ON DUPLICATE KEY UPDATE quest_data = VALUES(quest_data)`,
                [userId, JSON.stringify(data)]
            )
        }
    }

    // 同步背包数据
    async syncInventoryData() {
        const inventoryPath = 'plugins/trss-akasha-terminal-plugin/data/user_inventory.json'
        if (!fs.existsSync(inventoryPath)) return

        const inventoryData = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'))
        
        for (const [userId, data] of Object.entries(inventoryData)) {
            await this.connection.execute(
                `INSERT INTO user_inventory (user_id, inventory_data) 
                 VALUES (?, ?) 
                 ON DUPLICATE KEY UPDATE inventory_data = VALUES(inventory_data)`,
                [userId, JSON.stringify(data)]
            )
        }
    }

    // 同步用户家园数据
    async syncUserHomeData() {
        const homeDir = 'plugins/trss-akasha-terminal-plugin/data/qylp/UserHome'
        if (!fs.existsSync(homeDir)) return

        const files = fs.readdirSync(homeDir)
        for (const file of files) {
            if (!file.endsWith('.json')) continue
            
            const userId = file.replace('.json', '')
            const homeData = JSON.parse(fs.readFileSync(path.join(homeDir, file), 'utf8'))
            
            for (const [id, data] of Object.entries(homeData)) {
                await this.connection.execute(
                    `INSERT INTO user_home (user_id, spouse_id, wait_status, money, love, money_binary, love_binary) 
                     VALUES (?, ?, ?, ?, ?, ?, ?) 
                     ON DUPLICATE KEY UPDATE 
                     spouse_id = VALUES(spouse_id), 
                     wait_status = VALUES(wait_status), 
                     money = VALUES(money), 
                     love = VALUES(love), 
                     money_binary = VALUES(money_binary), 
                     love_binary = VALUES(love_binary)`,
                    [id, data.s, data.wait, data.money, data.love, data.money2 || '', data.love2 || '']
                )
            }
        }
    }

    // MySQL数据同步到JSON
    async syncMySQLToJson() {
        if (!this.connection) {
            console.log('MySQL未连接，无法同步数据')
            return false
        }

        try {
            console.log('开始同步MySQL数据到JSON...')

            // 同步战斗数据
            await this.exportBattleData()
            
            // 同步关系数据
            await this.exportRelationshipData()
            
            // 同步商店数据
            await this.exportShopData()
            
            // 同步任务数据
            await this.exportQuestData()
            
            // 同步背包数据
            await this.exportInventoryData()
            
            // 同步用户家园数据
            await this.exportUserHomeData()

            console.log('MySQL数据同步到JSON完成')
            return true
        } catch (error) {
            console.error('数据同步失败:', error)
            return false
        }
    }

    // 导出战斗数据到JSON
    async exportBattleData() {
        const [rows] = await this.connection.execute('SELECT * FROM user_battle')
        const battleData = {}
        
        for (const row of rows) {
            battleData[row.user_id] = {
                experience: row.experience,
                level: row.level,
                levelname: row.levelname,
                Privilege: row.privilege_level
            }
        }
        
        const battlePath = 'plugins/trss-akasha-terminal-plugin/data/battle.json'
        fs.writeFileSync(battlePath, JSON.stringify(battleData, null, 2))
    }

    // 导出关系数据到JSON
    async exportRelationshipData() {
        const [rows] = await this.connection.execute('SELECT * FROM relationship_data')
        const relationshipData = {
            couples: {},
            shops: {},
            adventures: {},
            love_bank: {}
        }
        
        for (const row of rows) {
            relationshipData[row.data_type][row.data_key] = JSON.parse(row.data_value)
        }
        
        const relationshipPath = 'plugins/trss-akasha-terminal-plugin/data/relationship_data.json'
        fs.writeFileSync(relationshipPath, JSON.stringify(relationshipData, null, 2))
    }

    // 导出商店数据到JSON
    async exportShopData() {
        const [rows] = await this.connection.execute('SELECT * FROM shop_data')
        const shopData = {}
        
        for (const row of rows) {
            shopData[row.user_id] = JSON.parse(row.shop_data)
        }
        
        const shopPath = 'plugins/trss-akasha-terminal-plugin/data/shop_data.json'
        fs.writeFileSync(shopPath, JSON.stringify(shopData, null, 2))
    }

    // 导出任务数据到JSON
    async exportQuestData() {
        const [rows] = await this.connection.execute('SELECT * FROM quest_data')
        const questData = {}
        
        for (const row of rows) {
            questData[row.user_id] = JSON.parse(row.quest_data)
        }
        
        const questPath = 'plugins/trss-akasha-terminal-plugin/data/user_quest.json'
        fs.writeFileSync(questPath, JSON.stringify(questData, null, 2))
    }

    // 导出背包数据到JSON
    async exportInventoryData() {
        const [rows] = await this.connection.execute('SELECT * FROM user_inventory')
        const inventoryData = {}
        
        for (const row of rows) {
            inventoryData[row.user_id] = JSON.parse(row.inventory_data)
        }
        
        const inventoryPath = 'plugins/trss-akasha-terminal-plugin/data/user_inventory.json'
        fs.writeFileSync(inventoryPath, JSON.stringify(inventoryData, null, 2))
    }

    // 导出用户家园数据到JSON
    async exportUserHomeData() {
        const [rows] = await this.connection.execute('SELECT * FROM user_home')
        const homeDir = 'plugins/trss-akasha-terminal-plugin/data/qylp/UserHome'
        
        if (!fs.existsSync(homeDir)) {
            fs.mkdirSync(homeDir, { recursive: true })
        }
        
        const groupedData = {}
        for (const row of rows) {
            const groupKey = 'home.json' // 简化处理，实际可能需要更复杂的分组逻辑
            if (!groupedData[groupKey]) {
                groupedData[groupKey] = {}
            }
            
            groupedData[groupKey][row.user_id] = {
                s: row.spouse_id,
                wait: row.wait_status,
                money: row.money,
                love: row.love,
                money2: row.money_binary,
                love2: row.love_binary
            }
        }
        
        for (const [filename, data] of Object.entries(groupedData)) {
            fs.writeFileSync(path.join(homeDir, filename), JSON.stringify(data, null, 2))
        }
    }

    // 记录命令使用统计
    async logCommandUsage(userId, groupId, commandName, commandArgs, success = true, errorMessage = null) {
        if (!this.connection || !this.isEnabled) return
        
        try {
            await this.connection.execute(
                `INSERT INTO command_stats (user_id, group_id, command_name, command_args, success, error_message) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [userId, groupId, commandName, commandArgs, success, errorMessage]
            )
        } catch (error) {
            console.error('记录命令统计失败:', error)
        }
    }

    // 获取命令统计
    async getCommandStats(limit = 100) {
        if (!this.connection) return []
        
        try {
            const [rows] = await this.connection.execute(
                `SELECT command_name as command, user_id, 
                        COUNT(*) as total_count,
                        SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as success_count,
                        SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as fail_count,
                        MAX(execution_time) as last_used
                 FROM command_stats 
                 GROUP BY command_name, user_id 
                 ORDER BY total_count DESC 
                 LIMIT ?`,
                [limit]
            )
            return rows
        } catch (error) {
            console.error('获取命令统计失败:', error)
            return []
        }
    }

    // 获取用户数据
    async getUserData(userId, dataType) {
        if (!this.connection) return null;

        try {
            let tableName;
            let isJsonData = false;
            let dataColumn = 'data';

            switch (dataType) {
                case 'battle':
                    tableName = 'user_battle';
                    break;
                case 'home':
                    tableName = 'user_home';
                    break;
                case 'place':
                    tableName = 'user_place';
                    break;
                case 'house':
                    tableName = 'user_house';
                    break;
                case 'xiaoqie':
                    tableName = 'user_xiaoqie';
                    isJsonData = true;
                    dataColumn = 'xiaoqie_data';
                    break;
                case 'shop':
                    tableName = 'shop_data';
                    isJsonData = true;
                    dataColumn = 'shop_data';
                    break;
                case 'quest':
                    tableName = 'quest_data';
                    isJsonData = true;
                    dataColumn = 'quest_data';
                    break;
                case 'inventory':
                    tableName = 'user_inventory';
                    isJsonData = true;
                    dataColumn = 'inventory_data';
                    break;
                case 'general':
                    tableName = 'user_general';
                    isJsonData = true;
                    dataColumn = 'general_data';
                    break;
                case 'directory':
                    tableName = 'user_directory';
                    isJsonData = true;
                    dataColumn = 'directory_data';
                    break;
                default:
                    return null;
            }

            const query = isJsonData
                ? `SELECT ${dataColumn} as data FROM ${tableName} WHERE user_id = ?`
                : `SELECT * FROM ${tableName} WHERE user_id = ?`;

            const [rows] = await this.connection.execute(query, [userId]);

            if (rows.length > 0) {
                if (isJsonData) {
                    const data = rows[0].data;
                    return typeof data === 'string' ? JSON.parse(data) : data;
                }
                return rows[0];
            }
            return null;
        } catch (error) {
            console.error(`获取用户数据失败 (dataType: ${dataType}):`, error);
            return null;
        }
    }

    // 更新用户数据
    async updateUserData(userId, dataType, data) {
        if (!this.connection) return false;

        try {
            let tableName;
            let isJsonData = false;
            let dataColumn = 'data';

            switch (dataType) {
                case 'battle':
                    tableName = 'user_battle';
                    break;
                case 'home':
                    tableName = 'user_home';
                    break;
                case 'place':
                    tableName = 'user_place';
                    break;
                case 'house':
                    tableName = 'user_house';
                    break;
                case 'xiaoqie':
                    tableName = 'user_xiaoqie';
                    isJsonData = true;
                    dataColumn = 'xiaoqie_data';
                    break;
                case 'shop':
                    tableName = 'shop_data';
                    isJsonData = true;
                    dataColumn = 'shop_data';
                    break;
                case 'quest':
                    tableName = 'quest_data';
                    isJsonData = true;
                    dataColumn = 'quest_data';
                    break;
                case 'inventory':
                    tableName = 'user_inventory';
                    isJsonData = true;
                    dataColumn = 'inventory_data';
                    break;
                case 'general':
                    tableName = 'user_general';
                    isJsonData = true;
                    dataColumn = 'general_data';
                    break;
                case 'directory':
                    tableName = 'user_directory';
                    isJsonData = true;
                    dataColumn = 'directory_data';
                    break;
                default:
                    return false;
            }

            if (isJsonData) {
                const dataJson = JSON.stringify(data);
                await this.connection.execute(
                    `INSERT INTO ${tableName} (user_id, ${dataColumn}, updated_at) 
                     VALUES (?, ?, NOW()) 
                     ON DUPLICATE KEY UPDATE 
                     ${dataColumn} = VALUES(${dataColumn}), updated_at = NOW()`,
                    [userId, dataJson]
                );
            } else {
                const columns = Object.keys(data);
                const values = Object.values(data);
                
                const insertCols = ['user_id', ...columns].join(', ');
                const valuePlaceholders = ['?', ...columns.map(() => '?')].join(', ');
                
                const updateClause = columns.map(col => `${col} = VALUES(${col})`).join(', ');

                await this.connection.execute(
                    `INSERT INTO ${tableName} (${insertCols}) 
                     VALUES (${valuePlaceholders}) 
                     ON DUPLICATE KEY UPDATE 
                     ${updateClause}, updated_at = NOW()`,
                    [userId, ...values]
                );
            }

            return true;
        } catch (error) {
            console.error(`更新用户数据失败 (dataType: ${dataType}):`, error);
            return false;
        }
    }

    // 获取全局数据
    async getGlobalData(dataType) {
        try {
            if (!this.connection) {
                throw new Error('数据库连接未建立');
            }

            let tableName, dataColumn;
            
            switch (dataType) {
                case 'shop_data':
                case 'shop':
                    tableName = 'global_shop_data';
                    dataColumn = 'shop_data';
                    break;
                case 'quest_data':
                case 'quest':
                    tableName = 'global_quest_data';
                    dataColumn = 'quest_data';
                    break;
                case 'synthesis_recipes':
                case 'synthesis':
                    tableName = 'global_synthesis_data';
                    dataColumn = 'synthesis_data';
                    break;
                case 'relationship_data':
                case 'relationship':
                    tableName = 'global_relationship_data';
                    dataColumn = 'relationship_data';
                    break;
                case 'weapon':
                    tableName = 'global_weapon_data';
                    dataColumn = 'weapon_data';
                    break;
                default:
                    throw new Error(`不支持的全局数据类型: ${dataType}`);
            }

            const [rows] = await this.connection.execute(
                `SELECT ${dataColumn} FROM ${tableName} WHERE id = 1`,
                []
            );

            if (rows.length > 0 && rows[0][dataColumn]) {
                return JSON.parse(rows[0][dataColumn]);
            }
            
            return null;
        } catch (error) {
            console.error(`获取全局数据失败 (dataType: ${dataType}):`, error);
            throw error;
        }
    }

    // 保存全局数据
    async saveGlobalData(dataType, data) {
        try {
            if (!this.connection) {
                throw new Error('数据库连接未建立');
            }

            let tableName, dataColumn;
            
            switch (dataType) {
                case 'shop_data':
                case 'shop':
                    tableName = 'global_shop_data';
                    dataColumn = 'shop_data';
                    break;
                case 'quest_data':
                case 'quest':
                    tableName = 'global_quest_data';
                    dataColumn = 'quest_data';
                    break;
                case 'synthesis_recipes':
                case 'synthesis':
                    tableName = 'global_synthesis_data';
                    dataColumn = 'synthesis_data';
                    break;
                case 'relationship_data':
                case 'relationship':
                    tableName = 'global_relationship_data';
                    dataColumn = 'relationship_data';
                    break;
                case 'weapon':
                    tableName = 'global_weapon_data';
                    dataColumn = 'weapon_data';
                    break;
                default:
                    throw new Error(`不支持的全局数据类型: ${dataType}`);
            }

            const dataJson = JSON.stringify(data);
            await this.connection.execute(
                `INSERT INTO ${tableName} (id, ${dataColumn}, updated_at) 
                 VALUES (1, ?, NOW()) 
                 ON DUPLICATE KEY UPDATE 
                 ${dataColumn} = VALUES(${dataColumn}), updated_at = NOW()`,
                [dataJson]
            );

            return true;
        } catch (error) {
            console.error(`保存全局数据失败 (dataType: ${dataType}):`, error);
            throw error;
        }
    }
}

export default new MySQLManager()