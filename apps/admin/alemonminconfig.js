import { BotApi, AlemonApi, plugin } from '../../model/api/api.js'
/*数据激活：当间接编译到data/indexjs的时候此方法可删除*/
AlemonApi.DataIndex.start()
export class AlemonAdminConfig extends plugin {
    constructor() {
        super(BotApi.SuperInex.getUser({
            rule: [
                {
                    reg: '^#虚空配置更改.*',
                    fnc: 'alemonConfigUpdata',
                },
                {
                    reg: '^#虚空配置',
                    fnc: 'alemonConfigShow',
                },
                {
                    reg: '^#虚空重置配置',
                    fnc: 'alemonConfigre',
                },
                {
                    reg: '^#虚空重置图片',
                    fnc: 'alemonReImg',
                }
            ]
        }))
    }
    alemonConfigUpdata = async (e) => {
        if (!e.isMaster) {
            return
        }
        const [name, size] = e.msg.replace('#虚空配置更改', '').split('\*')
        /*配置文件方法,右键方法转定义后自行编写*/
        e.reply(AlemonApi.DefsetData.updataConfig({ name, size }))
        return
    }
    alemonConfigShow = async (e) => {
        if (!e.isMaster) {
            return
        }
        const isreply = await e.reply(await BotApi.ImgIndex.showPuppeteer({
            path: 'config', name: 'config', data:
                await AlemonApi.DefsetData.getConfig({
                    app: 'parameter',
                    name: 'cooling'
                })
        }))
        await BotApi.User.surveySet({ e, isreply })
        return
    }
    alemonConfigre = async (e) => {
        if (!e.isMaster) {
            return
        }
        AlemonApi.CreateData.moveConfig({ choice: 'updata' })
        e.reply('重置完成')
        return
    }
    alemonReImg = async (e) => {
        if (!e.isMaster) {
            return
        }
        return
    }
}