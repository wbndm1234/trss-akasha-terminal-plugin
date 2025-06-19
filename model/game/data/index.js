import path from 'node:path'
import createdata from './createdata.js'
import { __dirname } from '../../main.js'
/**index定义全局路径选择器*/
export const __PATH = {
    /*玩家存档*/
    'user_player': path.join(__dirname, '/resources/data/birth/xiuxian/player'),
    /*行为*/
    'user_action': path.join(__dirname, '/resources/data/birth/xiuxian/action'),
    /*财富*/
    'user_wealth': path.join(__dirname, '/resources/data/birth/xiuxian/wealth'),
    /*背包*/
    'user_bag': path.join(__dirname, '/resources/data/birth/xiuxian/bag'),
    /*寿命表*/
    'user_life': path.join(__dirname, '/resources/data/birth/xiuxian/life'),
    /*基础信息----即要推送的数据地址*/
    'fixed_equipment': path.join(__dirname, '/resources/data/fixed/equipment'),
    'fixed_goods': path.join(__dirname, '/resources/data/fixed/goods'),
    'fixed_level': path.join(__dirname, '/resources/data/fixed/level'),
    'fixed_point': path.join(__dirname, '/resources/data/fixed/point'),
    'fixed_position': path.join(__dirname, '/resources/data/fixed/position'),
    /*生成信息,即生成后的数据*/
    'generate_exchange': path.join(__dirname, '/resources/data/birth/exchange'),
    'generate_forum': path.join(__dirname, '/resources/data/birth/forum'),

}
/**生成游戏数据*/
class DateIndex {
    constructor() {
        /**图片数据生成,图片还是要生成的,可以配置自己的帮助图 */
        /*** 可以自己写一个获得所有图片名的算法*/
        createdata.generateImg({
            path: ['help', 'user/bag', 'user/information'],
            name: ['help.png', 'icon.png', 'bag.png', 'information.png', 'left.png', 'right.png']
        })
        /**生成yaml配置数据*/
        createdata.moveConfig({})
    }
    /** 数据激活*/
    start = () => {
        return
    }
}
export default new DateIndex()