import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import akasha_data from './akasha_data.js'
import mysqlManager from './mysql_manager.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class DataManager {
    constructor() {
        this.config = null
        this.loadConfig()
    }

    // 加载MySQL配置
    loadConfig() {
        try {
            const configPath = path.join(__dirname, '..', 'config', 'mysql_config.json')
            if (fs.existsSync(configPath)) {
                this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
            } else {
                // 如果配置文件不存在，创建默认配置
                this.config = {
                    enabled: false,
                    autoStart: false,
                    host: 'localhost',
                    port: 3306,
                    user: 'root',
                    password: '',
                    database: 'akasha_terminal',
                    charset: 'utf8mb4'
                }
                this.saveConfig()
            }
        } catch (error) {
            console.error('数据管理器配置加载失败:', error)
            this.config = { enabled: false }
        }
    }

    // 保存配置
    saveConfig() {
        try {
            const configPath = path.join(__dirname, '..', 'config', 'mysql_config.json')
            const configDir = path.dirname(configPath)
            if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir, { recursive: true })
            }
            fs.writeFileSync(configPath, JSON.stringify(this.config, null, 2))
        } catch (error) {
            console.error('数据管理器配置保存失败:', error)
        }
    }

    // 检查是否开没开MySQL
    isMySQL() {
        return this.config && this.config.enabled === true
    }

    // 重载配置
    reloadConfig() {
        this.loadConfig()
        console.log('数据管理器配置已重新加载，MySQL启用状态:', this.isMySQL())
    }

    // 保存
    async saveUser(id, json, Template, filename, is_save) {
       
        if (arguments.length === 2) {
            // 保存用户数据
            if (this.isMySQL()) {
                return await this.saveUserMySQL(id, json)
            } else {
                return await akasha_data.saveUser(id, json)
            }
        } else {
            
            if (this.isMySQL()) {
                return await this.saveUserMySQL(id, json, Template, filename, is_save)
            } else {
                return await akasha_data.getUser(id, json, Template, filename, is_save)
            }
        }
    }

    async saveUserMySQL(id, json, Template, filename, is_save) {
        // 兼容
        if (arguments.length === 2) {
            await mysqlManager.updateUserData(id, 'general', json)
            return json
        }
        
        // 使用JSON存储在一个通用表中
        const dataType = filename.replace('.json', '')
        
        if (json[id]) {
            const existingData = await mysqlManager.getUserData(id, 'general') || {}
            existingData[dataType] = json[id]
            await mysqlManager.updateUserData(id, 'general', existingData)
        }
        return json
    }

    // 获取用户战斗数据
    async getUserBattle(id, json, is_save) {
     
        if (arguments.length === 1) {
            
            if (this.isMySQL()) {
                return await this.getUserBattleMySQL(id)
            } else {
               
                return await akasha_data.getQQYUserBattle(id, {}, false)
            }
        } else {
            if (this.isMySQL()) {
                return await this.getUserBattleMySQL(id, json, is_save)
            } else {
                return await akasha_data.getQQYUserBattle(id, json, is_save)
            }
        }
    }

    // MySQL用户战斗数据
    async getUserBattleMySQL(id, json, is_save) {
      
        if (arguments.length === 1) {
            const data = await mysqlManager.getUserData(id, 'battle')
            if (data) {
                return {
                    [id]: {
                        experience: data.experience || 0,
                        level: data.level || 0,
                        levelname: data.levelname || '无等级',
                        Privilege: data.privilege || 0
                    }
                }
            } else {
                return {
                    [id]: {
                        experience: 0,
                        level: 0,
                        levelname: '无等级',
                        Privilege: 0
                    }
                }
            }
        }
        
        if (!is_save) {
            // 读
            const data = await mysqlManager.getUserData(id, 'battle')
            if (data) {
                return {
                    [id]: {
                        experience: data.experience || 0,
                        level: data.level || 0,
                        levelname: data.levelname || '无等级',
                        Privilege: data.privilege_level || 0
                    }
                }
            } else {
                const defaultData = {
                    experience: 0,
                    level: 0,
                    levelname: '无等级',
                    privilege_level: 0
                }
                await mysqlManager.updateUserData(id, 'battle', defaultData)
                return {
                    [id]: {
                        experience: 0,
                        level: 0,
                        levelname: '无等级',
                        Privilege: 0
                    }
                }
            }
        } else {
            if (json[id]) {
                const data = {
                    experience: json[id].experience || 0,
                    level: json[id].level || 0,
                    levelname: json[id].levelname || '无等级',
                    privilege_level: json[id].Privilege || 0
                }
                await mysqlManager.updateUserData(id, 'battle', data)
            }
            return json
        }
    }

    async getUserHome(id, json, filename, is_save) {
       
        if (arguments.length === 1) {
            
            if (this.isMySQL()) {
                return await this.getUserHomeMySQL(id)
            } else {
                const groupId = "default";
                return await akasha_data.getQQYUserHome(id, {}, `${groupId}.json`, false)
            }
        } else {
            
            if (this.isMySQL()) {
                return await this.getUserHomeMySQL(id, json, filename, is_save)
            } else {
                return await akasha_data.getQQYUserHome(id, json, filename, is_save)
            }
        }
    }

    async getUserHomeMySQL(id, json, filename, is_save) {
        
        if (arguments.length === 1) {
            const data = await mysqlManager.getUserData(id, 'home')
            if (data) {
                return {
                    [id]: {
                        s: data.spouse_id ,
                        love: data.love || 0,
                        money: data.money || 0,
                        wait: data.wait || 0
                    }
                }
            } else {
                return {
                    [id]: {
                        s: '',
                        love: 0,
                        money: 0,
                        wait: 0
                    }
                }
            }
        }
        
        if (!is_save) {
            // 读
            const data = await mysqlManager.getUserData(id, 'home')
            if (data) {
                const result = {
                    [id]: {
                        s: data.spouse_id ,
                        wait: data.wait_status || 0,
                        money: parseInt(data.money) || 500,
                        love: data.love || 0
                    }
                }
                
                // 数据转换
                if (data.money_binary) {
                    result[id].money2 = data.money_binary
                    result[id].money10 = parseInt(data.money_binary, 2)
                    if (result[id].money > result[id].money10) {
                        result[id].money = result[id].money10
                    } else {
                        result[id].money10 = result[id].money
                    }
                }
                
                if (data.love_binary) {
                    result[id].love2 = data.love_binary
                    result[id].love10 = parseInt(data.love_binary, 2)
                    if (result[id].love > result[id].love10) {
                        result[id].love = result[id].love10
                    } else {
                        result[id].love10 = result[id].love
                    }
                }
                
                return result
            } else {
                const defaultData = {
                    spouse_id: '',
                    wait_status: 0,
                    money: 100,
                    love: 0
                }
                await mysqlManager.updateUserData(id, 'home', defaultData)
                return {
                    [id]: {
                        s: '',
                        wait: 0,
                        money: 100,
                        love: 0
                    }
                }
            }
        } else {
            if (json[id]) {
                const data = {
                    spouse_id: json[id].s,
                    wait_status: json[id].wait || 0,
                    money: json[id].money || 1000,
                    love: json[id].love || 0,
                    money_binary: json[id].money ? json[id].money.toString(2) : null,
                    love_binary: json[id].love ? json[id].love.toString(2) : null
                }
                await mysqlManager.updateUserData(id, 'home', data)
            }
            return json
        }
    }

    // 获取用户位置数据
    async getUserPlace(id, json, filename, is_save) {
       
        if (arguments.length === 1) {
            
            if (this.isMySQL()) {
                return await this.getUserPlaceMySQL(id)
            } else {
               
                const groupId = "default";
                return await akasha_data.getQQYUserPlace(id, {}, `${groupId}.json`, false)
            }
        } else {
            
            if (this.isMySQL()) {
                return await this.getUserPlaceMySQL(id, json, filename, is_save)
            } else {
                return await akasha_data.getQQYUserPlace(id, json, filename, is_save)
            }
        }
    }

    // MySQL版本的用户位置数据
    async getUserPlaceMySQL(id, json, filename, is_save) {
        if (!is_save) {
            // 读
            const data = await mysqlManager.getUserData(id, 'place')
            if (data) {
                return {
                    [id]: {
                        place: data.current_place || 'home',
                        placetime: parseInt(data.place_time) || 0
                    }
                }
            } else {
              
                const defaultData = {
                    current_place: 'home',
                    place_time: 0
                }
                await mysqlManager.updateUserData(id, 'place', defaultData)
                return {
                    [id]: {
                        place: 'home',
                        placetime: 0
                    }
                }
            }
        } else {
          
            if (json[id]) {
                const data = {
                    current_place: json[id].place || 'home',
                    place_time: json[id].placetime || 0
                }
                await mysqlManager.updateUserData(id, 'place', data)
            }
            return json
        }
    }

    // 保存用户位置数据
    async saveUserPlace(id, json, filename, is_save) {
        // 验证用户ID的有效性
        if (!id || id === '0' || id === 0 || id === 'undefined' || id === 'null' || 
            (typeof id === 'string' && id.length < 5)) {
            console.warn(`[saveUserPlace] 无效的用户ID: ${id}`);
            return json;
        }
        
        if (arguments.length === 2) {
            if (this.isMySQL()) {
                return await this.saveUserPlaceMySQL(id, json)
            } else {
                return await akasha_data.saveQQYUserPlace(id, json)
            }
        } else {
            
            if (this.isMySQL()) {
                return await this.saveUserPlaceMySQL(id, json, filename, is_save)
            } else {
                return await akasha_data.getQQYUserPlace(id, json, filename, is_save)
            }
        }
    }



    // MySQL版本的保存用户位置数据
    async saveUserPlaceMySQL(id, json, filename, is_save) {
       
        if (arguments.length === 2) {
            const data = {
                current_place: json.place || 'home',
                place_time: json.placetime || 0
            }
            await mysqlManager.updateUserData(id, 'place', data)
            return json
        }
        
      
        if (json[id]) {
            const data = {
                current_place: json[id].place || 'home',
                place_time: json[id].placetime || 0
            }
            await mysqlManager.updateUserData(id, 'place', data)
        }
        return json
    }

    // 获取用户房屋数据
    async getUserHouse(id, json, filename, is_save) {
       
        if (arguments.length === 1) {
            
            if (this.isMySQL()) {
                return await this.getUserHouseMySQL(id)
            } else {
               
                const groupId = "default";
                return await akasha_data.getQQYUserHouse(id, {}, `${groupId}.json`, false)
            }
        } else {
            
            if (this.isMySQL()) {
                return await this.getUserHouseMySQL(id, json, filename, is_save)
            } else {
                return await akasha_data.getQQYUserHouse(id, json, filename, is_save)
            }
        }
    }

    // MySQL版本的用户房屋数据
    async getUserHouseMySQL(id, json, filename, is_save) {
        if (!is_save) {
            // 读
            const data = await mysqlManager.getUserData(id, 'house')
            if (data) {
                return {
                    [id]: {
                        name: data.house_name || '小破屋',
                        space: data.space_size || 6,
                        price: data.house_price || 500,
                        loveup: data.love_bonus || 1
                    }
                }
            } else {
              
                const defaultData = {
                    house_name: '小破屋',
                    space_size: 6,
                    house_price: 500,
                    love_bonus: 1
                }
                await mysqlManager.updateUserData(id, 'house', defaultData)
                return {
                    [id]: {
                        name: '小破屋',
                        space: 6,
                        price: 500,
                        loveup: 1
                    }
                }
            }
        } else {
          
            if (json[id]) {
                const data = {
                    house_name: json[id].name || '小破屋',
                    space_size: json[id].space || 6,
                    house_price: json[id].price || 500,
                    love_bonus: json[id].loveup || 1
                }
                await mysqlManager.updateUserData(id, 'house', data)
            }
            return json
        }
    }

    // 保存用户房屋数据
    async saveUserHouse(id, json, filename, is_save) {
        
        if (arguments.length === 2) {
            if (this.isMySQL()) {
                return await this.saveUserHouseMySQL(id, json)
            } else {
                return await akasha_data.saveQQYUserHouse(id, json)
            }
        } else {
            
            if (this.isMySQL()) {
                return await this.saveUserHouseMySQL(id, json, filename, is_save)
            } else {
                return await akasha_data.getQQYUserHouse(id, json, filename, is_save)
            }
        }
    }

    // MySQL版本的保存用户房屋数据
    async saveUserHouseMySQL(id, json, filename, is_save) {
        
        
        
        if (arguments.length === 2) {
            const data = {
                house_name: json.name || '小破屋',
                space_size: json.space || 6,
                house_price: json.price || 500,
                love_bonus: json.loveup || 1
            }
            await mysqlManager.updateUserData(id, 'house', data)
            return json
        }
        
      
        if (json[id]) {
            const data = {
                house_name: json[id].name || '小破屋',
                space_size: json[id].space || 6,
                house_price: json[id].price || 500,
                love_bonus: json[id].loveup || 1
            }
            await mysqlManager.updateUserData(id, 'house', data)
        }
        return json
    }

    // 获取用户小妾数据
    async getUserxiaoqie(id, json, filename, is_save) {
       
        if (arguments.length === 1) {
            
            if (this.isMySQL()) {
                return await this.getUserxiaoqieMySQL(id)
            } else {
               
                const groupId = "default";
                return await akasha_data.getQQYUserxiaoqie(id, {}, `${groupId}.json`, false)
            }
        } else {
            
            if (this.isMySQL()) {
                return await this.getUserxiaoqieMySQL(id, json, filename, is_save)
            } else {
                return await akasha_data.getQQYUserxiaoqie(id, json, filename, is_save)
            }
        }
    }

    // MySQL版本的用户小妾数据
    async getUserxiaoqieMySQL(id, json, filename, is_save) {
        if (!is_save) {
            // 读
            const data = await mysqlManager.getUserData(id, 'xiaoqie')
            if (data) {
                return {
                    [id]: data
                }
            } else {
              
                const defaultData = {
                    fuck: [],
                    fucktime: 0,
                    kun: 0
                }
                await mysqlManager.updateUserData(id, 'xiaoqie', defaultData)
                return {
                    [id]: defaultData
                }
            }
        } else {
          
            if (json[id]) {
                await mysqlManager.updateUserData(id, 'xiaoqie', json[id])
            }
            return json
        }
    }

    // 保存用户战斗数据
    async saveUserBattle(id, json, is_save) {
       
       
        if (arguments.length === 2) {
            if (this.isMySQL()) {
                return await this.saveUserBattleMySQL(id, json)
            } else {
                return await akasha_data.saveQQYUserBattle(id, json)
            }
        } else {
            
            if (this.isMySQL()) {
                return await this.saveUserBattleMySQL(id, json, is_save)
            } else {
                return await akasha_data.getQQYUserBattle(id, json, is_save)
            }
        }
    }

    // MySQL版本的保存用户战斗数据
    async saveUserBattleMySQL(id, json, is_save) {
        // 验证用户ID的有效性
       
        
        if (arguments.length === 2) {
            const data = {
                experience: json.experience || 0,
                level: json.level || 0,
                levelname: json.levelname || '无等级',
                privilege_level: json.Privilege || 0
            }
            await mysqlManager.updateUserData(id, 'battle', data)
            return json
        }
        
      
        if (json[id]) {
            const data = {
                experience: json[id].experience || 0,
                level: json[id].level || 0,
                levelname: json[id].levelname || '无等级',
                privilege_level: json[id].Privilege || 0
            }
            await mysqlManager.updateUserData(id, 'battle', data)
        }
        return json
    }

    // 保存用户小妾数据
    async saveUserxiaoqie(id, json, filename, is_save) {
       
        
        if (arguments.length === 2) {
            if (this.isMySQL()) {
                return await this.saveUserxiaoqieMySQL(id, json)
            } else {
                return await akasha_data.saveQQYUserxiaoqie(id, json)
            }
        } else {
            
            if (this.isMySQL()) {
                return await this.saveUserxiaoqieMySQL(id, json, filename, is_save)
            } else {
                return await akasha_data.getQQYUserxiaoqie(id, json, filename, is_save)
            }
        }
    }

    // MySQL版本的获取用户小妾数据
    async getUserxiaoqieMySQL(id, json, filename, is_save) {
      
        if (arguments.length === 1) {
            const data = await mysqlManager.getUserData(id, 'xiaoqie')
            return data || {}
        }
        
        if (!is_save) {
            // 读
            const data = await mysqlManager.getUserData(id, 'xiaoqie')
            if (data) {
                json[id] = data
            }
        }
        return json
    }

    // MySQL版本的保存用户小妾数据
    async saveUserxiaoqieMySQL(id, json, filename, is_save) {
      
        
        if (arguments.length === 2) {
            await mysqlManager.updateUserData(id, 'xiaoqie', json)
            return json
        }
        
      
        if (json[id]) {
            await mysqlManager.updateUserData(id, 'xiaoqie', json[id])
        }
        return json
    }

    // 获取用户数据
    async getUser(id, json, Template, filename, is_save) {
        if (this.isMySQL()) {
            return await this.getUserMySQL(id, json, Template, filename, is_save)
        } else {
            return await akasha_data.getUser(id, json, Template, filename, is_save)
        }
    }

    // MySQL版本的用户数据
    async getUserMySQL(id, json, Template, filename, is_save) {
        const dataType = filename.replace('.json', '')
        
        if (!is_save) {
            // 读
            const data = await mysqlManager.getUserData(id, 'general')
            if (data && data[dataType]) {
                return {
                    [id]: data[dataType]
                }
            } else {
              
                const userData = data || {}
                userData[dataType] = Template
                await mysqlManager.updateUserData(id, 'general', userData)
                return {
                    [id]: Template
                }
            }
        } else {
          
            if (json[id]) {
                const existingData = await mysqlManager.getUserData(id, 'general') || {}
                existingData[dataType] = json[id]
                await mysqlManager.updateUserData(id, 'general', existingData)
            }
            return json
        }
    }

    // 获取用户数据（按目录分类）
    async getUser2(user_id, json, dirname, is_save) {
        if (this.isMySQL()) {
            return await this.getUser2MySQL(user_id, json, dirname, is_save)
        } else {
            return await akasha_data.getUser2(user_id, json, dirname, is_save)
        }
    }

    // MySQL版本的用户数据（按目录分类）
    async getUser2MySQL(user_id, json, dirname, is_save) {
        if (!is_save) {
            // 读
            const data = await mysqlManager.getUserData(user_id, 'directory')
            if (data && data[dirname]) {
                return data[dirname]
            } else {
                return {}
            }
        } else {
          
            const existingData = await mysqlManager.getUserData(user_id, 'directory') || {}
            existingData[dirname] = json
            await mysqlManager.updateUserData(user_id, 'directory', existingData)
            return json
        }
    }
    // 获取用户小妾数据
    async getUserXiaoqie(userId) {
        if (this.isMySQL()) {
            return await mysqlManager.getUserData(userId, 'xiaoqie');
        } else {
            return akasha_data.getQQYUserxiaoqie(userId);
        }
    }

    // 保存用户小妾数据
    async saveUserXiaoqie(userId, data) {
        if (this.isMySQL()) {
            return await mysqlManager.updateUserData(userId, 'xiaoqie', data);
        } else {
            return akasha_data.saveQQYUserxiaoqie(userId, data);
        }
    }

    // 获取用户通用数据
    async getUserGeneral(userId) {
        if (this.isMySQL()) {
            return await mysqlManager.getUserData(userId, 'general');
        } else {
            return akasha_data.getUser(userId);
        }
    }

    // 保存用户通用数据
    async saveUserGeneral(userId, data) {
        if (this.isMySQL()) {
            return await mysqlManager.updateUserData(userId, 'general', data);
        } else {
            return akasha_data.saveUser(userId, data);
        }
    }

    // 获取用户目录数据
    async getUserDirectory(userId, directory) {
        if (this.isMySQL()) {
            const data = await mysqlManager.getUserData(userId, 'directory');
            return data && data[directory] ? data[directory] : null;
        } else {
            // 根据目录类型调用对应的akasha_data方法
            switch (directory) {
                case 'UserBattle':
                    return akasha_data.getQQYUserBattle(userId);
                case 'UserHome':
                    return akasha_data.getQQYUserHome(userId);
                case 'UserPlace':
                    return akasha_data.getQQYUserPlace(userId);
                case 'UserHouse':
                    return akasha_data.getQQYUserHouse(userId);
                case 'Userxiaoqie':
                    return akasha_data.getQQYUserxiaoqie(userId);
                default:
                    return null;
            }
        }
    }

    // 保存用户目录数据
    async saveUserDirectory(userId, directory, data) {
        if (this.isMySQL()) {
            // 先获取现有的目录数据
            let directoryData = await mysqlManager.getUserData(userId, 'directory') || {};
            directoryData[directory] = data;
            return await mysqlManager.updateUserData(userId, 'directory', directoryData);
        } else {
            // 根据目录类型调用对应的akasha_data方法
            switch (directory) {
                case 'UserBattle':
                    return akasha_data.saveQQYUserBattle(userId, data);
                case 'UserHome':
                    return akasha_data.saveQQYUserHome(userId, data);
                case 'UserPlace':
                    return akasha_data.saveQQYUserPlace(userId, data);
                case 'UserHouse':
                    return akasha_data.saveQQYUserHouse(userId, data);
                case 'Userxiaoqie':
                    return akasha_data.saveQQYUserxiaoqie(userId, data);
                default:
                    return false;
            }
        }
    }
    // 保存用户家园数据
    async saveUserHome(id, json, filename, is_save) {
        // 验证用户ID的有效性
       
       
        if (arguments.length === 2) {
            if (this.isMySQL()) {
                return await this.saveUserHomeMySQL(id, json)
            } else {
               
                const groupId = "default";
                return await akasha_data.saveQQYUserHome(id, json)
            }
        } else {
            
            if (this.isMySQL()) {
                return await this.saveUserHomeMySQL(id, json, filename, is_save)
            } else {
                return await akasha_data.getQQYUserHome(id, json, filename, is_save)
            }
        }
    }

    // MySQL版本的保存用户家园数据
    async saveUserHomeMySQL(id, json, filename, is_save) {
      
        if (arguments.length === 2) {
            const data = {
                spouse_id: json.s,
                wait_status: json.wait || 0,
                money: json.money || 1000,
                love: json.love, 
                money_binary: json.money ? json.money.toString(2) : null,
                love_binary: json.love ? json.love.toString(2) : null
            }
            await mysqlManager.updateUserData(id, 'home', data)
            return json
        }
        
      
        if (json[id]) {
            const data = {
                spouse_id: json[id].s,
                wait_status: json[id].wait || 0,
                money: json[id].money || 100,
                love: json[id].love || 0,
                money_binary: json[id].money ? json[id].money.toString(2) : null,
                love_binary: json[id].love ? json[id].love.toString(2) : null
            }
            await mysqlManager.updateUserData(id, 'home', data)
        }
        return json
    }

    // JSON数据读取方法
    async loadJsonData(filePath, defaultData = {}) {
        if (filePath.includes('/resources/') || filePath.includes('\\resources\\')) {
            if (!fs.existsSync(filePath)) {
                const dir = path.dirname(filePath)
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true })
                }
                fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2))
                return defaultData
            }
            return JSON.parse(fs.readFileSync(filePath, 'utf8'))
        }
        
        if (this.isMySQL()) {
            // 从文件路径提取数据类型
            const fileName = path.basename(filePath, '.json')
            const dataType = fileName.replace('user_', '')
            
            // 对于全局数据文件（如shop_data.json, quest_data.json等）
            if (!fileName.includes('user_')) {
                try {
                    const globalData = await mysqlManager.getGlobalData(dataType)
                    // 如果MySQL中没有数据，尝试从本地文件读取并同步到MySQL
                    if (!globalData || Object.keys(globalData).length === 0) {
                        console.log(`MySQL中没有${dataType}数据，尝试从本地文件读取`)
                        if (fs.existsSync(filePath)) {
                            const localData = JSON.parse(fs.readFileSync(filePath, 'utf8'))
                            // 将本地数据同步到MySQL
                            try {
                                await mysqlManager.saveGlobalData(dataType, localData)
                                console.log(`已将${dataType}数据同步到MySQL`)
                            } catch (syncError) {
                                console.warn(`同步${dataType}数据到MySQL失败: ${syncError.message}`)
                            }
                            return localData
                        }
                        return defaultData
                    }
                    return globalData
                } catch (error) {
                    console.warn(`MySQL读取全局数据失败，使用本地文件: ${error.message}`)
                    // 如果MySQL读取失败，回退到本地文件
                    if (fs.existsSync(filePath)) {
                        return JSON.parse(fs.readFileSync(filePath, 'utf8'))
                    }
                    return defaultData
                }
            }
            
            // 对于用户数据，返回空对象，由具体的用户数据方法处理
            return {}
        } else {
            // 使用本地JSON文件
            if (!fs.existsSync(filePath)) {
                const dir = path.dirname(filePath)
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true })
                }
                fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2))
                return defaultData
            }
            return JSON.parse(fs.readFileSync(filePath, 'utf8'))
        }
    }

    // 通用JSON数据保存方法
    async saveJsonData(filePath, data) {
        if (this.isMySQL()) {
            const fileName = path.basename(filePath, '.json')
            const dataType = fileName.replace('user_', '')
            
            // 对于全局数据文件
            if (!fileName.includes('user_')) {
                try {
                    await mysqlManager.saveGlobalData(dataType, data)
                    return true
                } catch (error) {
                    console.warn(`MySQL保存全局数据失败，使用本地文件: ${error.message}`)
                    // 如果MySQL保存失败，回退到本地文件
                    const dir = path.dirname(filePath)
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, { recursive: true })
                    }
                    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
                    return true
                }
            }
            
            // 对于用户数据，由具体的用户数据方法处理
            return true
        } else {
            // 使用本地JSON文件
            const dir = path.dirname(filePath)
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true })
            }
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
            return true
        }
    }

    // 用户背包数据读取
    async loadUserInventory(userId) {
        if (this.isMySQL()) {
            try {
                const data = await mysqlManager.getUserData(userId, 'inventory')
                return data ? { [userId]: data } : { [userId]: {} }
            } catch (error) {
                console.warn(`MySQL读取用户背包数据失败: ${error.message}`)
                return { [userId]: {} }
            }
        } else {
            const inventoryPath = path.join(__dirname, '..', 'data', 'user_inventory.json')
            const inventoryData = await this.loadJsonData(inventoryPath, {})
            return inventoryData[userId] ? { [userId]: inventoryData[userId] } : { [userId]: {} }
        }
    }

    // 用户背包数据保存
    async saveUserInventory(userId, inventoryData) {
        if (this.isMySQL()) {
            try {
                await mysqlManager.updateUserData(userId, 'inventory', inventoryData)
                return true
            } catch (error) {
                console.warn(`MySQL保存用户背包数据失败: ${error.message}`)
                return false
            }
        } else {
            const inventoryPath = path.join(__dirname, '..', 'data', 'user_inventory.json')
            const allInventoryData = await this.loadJsonData(inventoryPath, {})
            allInventoryData[userId] = inventoryData
            return await this.saveJsonData(inventoryPath, allInventoryData)
        }
    }

    // 获取用户工作历史
    async getUserWorkHistory(userId) {
        try {
            if (this.isMySQL()) {
                // MySQL存储
                const data = await mysqlManager.getUserData(userId, 'work_history')
                return data ? data.history : []
            } else {
                // 文件存储
                const workHistoryPath = path.join(__dirname, '..', 'data', 'user_work_history.json')
                
                if (!fs.existsSync(workHistoryPath)) {
                    return []
                }
                
                const allHistories = JSON.parse(fs.readFileSync(workHistoryPath, 'utf8'))
                return allHistories[userId] || []
            }
        } catch (error) {
            console.error('获取用户工作历史失败:', error)
            return []
        }
    }

    // 保存用户工作历史
    async saveUserWorkHistory(userId, historyData) {
        try {
            if (this.isMySQL()) {
                // MySQL存储
                await mysqlManager.updateUserData(userId, 'work_history', { history: historyData })
            } else {
                // 文件存储
                const workHistoryPath = path.join(__dirname, '..', 'data', 'user_work_history.json')
                let allHistories = {}
                
                if (fs.existsSync(workHistoryPath)) {
                    allHistories = JSON.parse(fs.readFileSync(workHistoryPath, 'utf8'))
                }
                
                allHistories[userId] = historyData
                
                // 确保目录存在
                const dataDir = path.dirname(workHistoryPath)
                if (!fs.existsSync(dataDir)) {
                    fs.mkdirSync(dataDir, { recursive: true })
                }
                
                fs.writeFileSync(workHistoryPath, JSON.stringify(allHistories, null, 2))
            }
        } catch (error) {
            console.error('保存用户工作历史失败:', error)
        }
    }
}


export default new DataManager()