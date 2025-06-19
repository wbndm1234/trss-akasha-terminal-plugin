import { BotApi, AlemonApi, plugin } from '../../model/api/api.js'
/**该方法可用于关闭云崽部分功能 */
export class AlemonAdminRobot extends plugin {
    constructor() {
        super(BotApi.SuperInex.getUser({
            rule: [
                {
                    reg: '^#虚空开启.*',
                    fnc: 'openRobotConfig',
                },
                {
                    reg: '^#虚空关闭.*',
                    fnc: 'offRobotConfig',
                },
                {
                    reg: '^#虚空添加主人.*',
                    fnc: 'addRobotConfig',
                },
                {
                    reg: '^#虚空删除主人.*',
                    fnc: 'deleteRobotConfig',
                },
                {
                    reg: '^#云崽配置状态',
                    fnc: 'readRobotConfig',
                }
            ]
        }))
    }
    openRobotConfig = async (e) => {
        if (!e.isMaster) {
            return
        }
        const name = e.msg.replace('#虚空开启', '')
        if (name == '云崽') {
            e.reply(BotApi.BotModify.openReadconfig())
        }
        if (name == '私聊') {
            e.reply(BotApi.BotModify.OnGroup())
        }
        e.reply(BotApi.BotModify.openReadconfighelp({ name }))
        return
    }
    offRobotConfig = async (e) => {
        if (!e.isMaster) {
            return
        }
        const name = e.msg.replace('#虚空关闭', '')
        if (name == '云崽') {
            e.reply(BotApi.BotModify.deleteAllConfig())
            return
        }
        if (name == '私聊') {
            e.reply(BotApi.BotModify.OffGroup())
            return
        }
        e.reply(BotApi.BotModify.Readconfighelp({ name }))
        return
    }
    addRobotConfig = async (e) => {
        if (!e.isMaster) {
            return
        }
        e.reply(BotApi.BotModify.AddMaster({
            mastername: e.msg.replace('#虚空添加主人', '')
        }))
        return
    }
    deleteRobotConfig = async (e) => {
        if (!e.isMaster) {
            return
        }
        e.reply(BotApi.BotModify.DeleteMaster({
            mastername: e.msg.replace('#虚空删除主人', '')
        }))
        return
    }
    readRobotConfig = async (e) => {
        if (!e.isMaster) {
            return
        }
        BotApi.BotModify.robotConfig()
        return
    }
}