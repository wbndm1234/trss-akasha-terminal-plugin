import { BotApi, AlemonApi, plugin } from '../../model/api/api.js'
/**自带更新，替换为自己的插件名即可使用*/
export class AlemonAdminAction extends plugin {
    constructor() {
        super(BotApi.SuperInex.getUser({
            rule: [
                {
                    reg: '^#虚空2更新$',
                    fnc: 'AlemonUpdata'
                }
            ]
        }))
    }
    AlemonUpdata = async (e) => {
        if (!e.isMaster) {
            return
        }
        await BotApi.Exec.execStart({ cmd: 'git  pull', e })
        return
    }
}