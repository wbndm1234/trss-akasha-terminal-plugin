import { BotApi, AlemonApi, plugin } from '../../model/api/api.js'
export class AlemonUser extends plugin {
    constructor() {
        super(BotApi.SuperInex.getUser({
            rule: [
                {
                    reg: '^#虚空信息$',
                    fnc: 'alemonMsg'
                },
            ]
        }))
    }
    alemonMsg = async (e) => {
        const isreply = await e.reply('待更新')
        await BotApi.User.surveySet({ e, isreply })
        return
    }
}