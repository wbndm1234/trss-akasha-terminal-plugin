import PublicData from '../public/data.js'
import userData from './data.js'
class UserIndex {
    /**
    * @param {UID} UID 
    * @returns 初始化数据，不成功则false
    */
    createDarkPlayer = async ({ UID }) => {
        try {
            return true
        } catch {
            return false
        }
    }
    /**
     * 给背包添加物品
     * @param {用户的背包} BAG 
     * @param {物品资料} THING 
     * @param {数量} ACCOUNT 
     * @returns 
     */
    userbagAction = async ({ BAG, THING, ACCOUNT }) => {
        const thing = BAG.thing.find(item => item.id == THING.id)
        if (thing) {
            let acount = thing.acount + ACCOUNT
            if (acount < 1) {
                BAG.thing = BAG.thing.filter(item => item.id != THING.id)
            } else {
                BAG.thing.find(item => item.id == THING.id).acount = acount
            }
            return BAG
        } else {
            THING.acount = ACCOUNT
            BAG.thing.push(THING)
            return BAG
        }
    }

    /**
     * @param {UID} UID 
     * @param {物品名} name 
     * @returns 若背包存在即返回物品信息,若不存在则undifind
     */
    returnUserBagName = async (NAME, THING_NAME) => {
        const bag = await userData.userMsgAction({
            NAME: NAME,
            CHOICE: 'user_bag'
        })
        return bag.thing.find(item => item.name == THING_NAME)
    }

    /**
     * 表名，地址，属性，大小
     * @param {UID, CHOICE, ATTRIBUTE, SIZE} parameter 
     * @returns 
     */
    updataUser = async ( { UID, CHOICE, ATTRIBUTE, SIZE }) => {
        //读取原数据
        const data = await userData.userMsgAction({ NAME: UID, CHOICE: CHOICE })
        data[ATTRIBUTE] += Math.trunc(SIZE)
        await userData.userMsgAction({ NAME: UID, CHOICE: CHOICE, DATA: data })
        return
    }
}
export default new UserIndex()