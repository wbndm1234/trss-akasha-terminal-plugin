import { __PATH } from '../data/index.js'
import algorithm from '../data/algorithm.js'
/** 表数据类,结合选择器进行快速获取指定路径的文件*/
class ListData {
    /**
     * @param {表名} NAME 
     * @param {地址选择} CHOICE 
     * @param {数据} DATA 
     * @returns 若无data则是读取操作，返回data
     */
    listAction = async ({ NAME, CHOICE, DATA }) => {
        if (DATA) {
            await algorithm.dataAction({
                NAME,
                PATH: __PATH[CHOICE],
                DATA
            })
            return
        }
        return await algorithm.dataAction({
            NAME,
            PATH: __PATH[CHOICE]
        })
    }
    /**
     * 
     * @param {表名} NAME 
     * @param {地址选择} CHOICE 
     * @param {数据} DATA 
     * @returns 若无data则是读取操作(若读取失败则初始化为[])
     */
    listActionArr = async ({ NAME, CHOICE, DATA }) => {
        if (DATA) {
            await algorithm.dataAction({
                NAME,
                PATH: __PATH[CHOICE],
                DATA
            })
            return
        }
        /*读取的时候需要检查*/
        const Data = await algorithm.dataActionNew({
            NAME,
            PATH: __PATH[CHOICE]
        })
        if (!Data) {
            await algorithm.dataAction({
                NAME,
                PATH: __PATH[CHOICE],
                DATA: []
            })
            return []
        }
        return Data
    }

    /**
     * @param {表名} NAME 
     * @param {地址选择} CHOICE 
     * @param {初始化} INITIAL 
     * @param {数据} DATA 
     * @returns 若无data则是读取操作(若读取失败则初始化为[])
     */

    listActionInitial = async ({ NAME, CHOICE, DATA, INITIAL }) => {
        if (DATA) {
            await algorithm.dataAction({
                NAME,
                PATH: __PATH[CHOICE],
                DATA
            })
            return
        }
        /*读取的时候需要检查*/
        const Data = await algorithm.dataActionNew({
            NAME,
            PATH: __PATH[CHOICE]
        })
        if (!Data) {
            await algorithm.dataAction({
                NAME,
                PATH: __PATH[CHOICE],
                DATA: INITIAL
            })
            return INITIAL
        }
        return Data
    }

    /**
     * @param {属性选择} CHOICE 
     * @param {表名} NAME 
     * @returns 随机返回该表的子元素
     */
    randomListThing = async ({ NAME, CHOICE }) => {
        const LIST = await algorithm.dataAction({
            NAME: NAME,
            PATH: __PATH[CHOICE]
        })
        return LIST[Math.floor(Math.random() * LIST.length)]
    }
    /**
     * 根据条件搜索
     * @param {属性选择} CHOICE 
     * @param {表名} NAME 
     * @param {item[condition]} condition 
     * @param {==name} name 
     * @returns 返回信息
     */
    searchThing = async (parameter) => {
        let { CHOICE, NAME, condition, name } = parameter
        if (!CHOICE) {
            //默认检索all表
            CHOICE = 'generate_all',
            NAME = 'all'
        }
        const all = await this.listAction({ CHOICE: CHOICE, NAME: NAME })
        const ifexist = all.find(item => item[condition] == name)
        return ifexist
    }

}
export default new ListData()