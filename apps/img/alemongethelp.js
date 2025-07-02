import { BotApi, AlemonApi, plugin } from '../../model/api/api.js'
export class AlemonGetHelp extends plugin {
    constructor() {
        super(BotApi.SuperInex.getUser({
            rule: [
                {
                    reg: '^#虚空2(帮助|菜单|help|列表)$',
                    fnc: 'alemonHelp'
                },
                {
                    reg: '^#虚空管理$',
                    fnc: 'alemonAdmin',
                }
            ]
        }))
    }
    alemonHelp = async (e) => {
        const data = await BotApi.ImgHelp.getboxhelp({ name: 'help' })
        if (!data) {
            return
        }
        await e.reply(await BotApi.ImgCache.helpcache({ i: 1, data }))
    }
    alemonAdmin = async (e) => {
        const data = await BotApi.ImgHelp.getboxhelp({ name: 'admin' })
        if (!data) {
            return
        }
        await e.reply(await BotApi.ImgCache.helpcache({ i: 0, data }))
    }
}

export default AlemonGetHelp