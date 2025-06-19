import gameUer from '../user/index.js'
/*cd配置*/
const MYCD = {
    '0': '攻击',
}
/**redis前缀控制*/
const redisName = 'xiuxian:player'
class GameIndex {
    /**
    * @param {数组} ARR 
    * @returns 随机一个元素
    */
    Anyarray = ({ ARR }) => {
        const randindex = Math.trunc(Math.random() * ARR.length)
        return ARR[randindex]
    }

    /**
     * 强制修正至少为1
     * @param {*} value 
     * @returns 
     */
    leastOne = async ({ value }) => {
        let size = value
        if (isNaN(parseFloat(size)) && !isFinite(size)) {
            return Number(1)
        }
        size = Number(Math.trunc(size))
        if (size == null || size == undefined || size < 1 || isNaN(size)) {
            return Number(1)
        }
        return Number(size)
    }

    /**删除所有数据*/
    deleteReids = async () => {
        const allkey = await redis.keys(`${redisName}:*`, (err, data) => { })
        if (allkey) {
            allkey.forEach(async (item) => {
                await redis.del(item)
            })
            return
        }
    }


    /**
     * @param { UID }) param0 
     * @returns 
     */
    offAction = async ({ UID }) => {
        const exists = await redis.exists(`${redisName}:${UID}:action`)
        if (exists == 1) {
            await redis.del(`${redisName}:${UID}:action`)
        }
        return
    }

    /**
     * 行为检测
     * @param {*} UID 
     * @returns 若存在对象MSG则为flase
     */
    Go = async ({ UID }) => {
        let action = await redis.get(`${redisName}:${UID}:action`)
        if (action != undefined) {
            action = JSON.parse(action)
            if (action.actionName == undefined) {
                //根据判断msg存不存在来识别是否成功
                return {
                    'MSG': `旧版数据残留,请联系主人使用[#修仙删除数据]`
                }
            }
            return {
                'MSG': `${action.actionName}中...`
            }
        }
        const player = await gameUer.userMsgAction({ NAME: UID, CHOICE: 'user_battle' })
        if (player.nowblood <= 1) {
            return {
                'MSG': `血量不足`
            }
        }
        return {}
    }

    /**
     * @param { UID } param0 
     * @returns 
     */
    GoMini = async ({ UID }) => {
        let action = await redis.get(`${redisName}:${UID}:action`)
        if (action != undefined) {
            action = JSON.parse(action)
            if (action.actionName == undefined) {
                //根据判断msg存不存在来识别是否成功
                return {
                    'MSG': `旧版数据残留,请联系主人使用[#修仙删除数据]`
                }
            }
            return {
                'MSG': `${action.actionName}中...`
            }
        }
        return {}
    }


    /**
     * 检测CD
     * @param {*} uid 
     * @param {*} CDid 
     * @param {*} CDMAP 
     * @returns 
     */
    cooling = async ({ UID, CDID, CDMAP }) => {
        const remainTime = await redis.ttl(`${redisName}:${UID}:${CDID}`)
        const time = {
            h: 0,
            m: 0,
            s: 0
        }
        if (remainTime != -1) {
            time.h = Math.floor(remainTime / 60 / 60)
            time.h = time.h < 0 ? 0 : time.h
            time.m = Math.floor((remainTime - time.h * 60 * 60) / 60)
            time.m = time.m < 0 ? 0 : time.m
            time.s = Math.floor((remainTime - time.h * 60 * 60 - time.m * 60))
            time.s = time.s < 0 ? 0 : time.s
            if (time.h == 0 && time.m == 0 && time.s == 0) {
                return 0
            }
            if (CDMAP) {
                return { CDMSG: `${CDMAP[CDID]}冷却${time.h}h${time.m}m${time.s}s` }
            }
            return { CDMSG: `${MYCD[CDID]}冷却${time.h}h${time.m}m${time.s}s` }
        }
        return {}
    }

    /**
     * 进程沉睡
     * @param {*} time 
     * @returns 
     */
    sleep = async (time) => {
        return new Promise(resolve => {
            setTimeout(resolve, time)
        })
    }

    /** 对象数组排序,从大到小*/
    sortBy = (field) => {
        return (b, a) => {
            return a[field] - b[field]
        }
    }

}
export default new GameIndex()