import { BotApi, AlemonApi, plugin } from '../../model/api/api.js'
import fs from "fs";
//项目路径
//如果报错请删除Yunzai/data/目录中akasha文件夹
const dirpath = "plugins/akasha-terminal-plugin/data/";//文件夹路径
var filename = `battle`;//文件名
if (filename.indexOf(".json") == -1) {//如果文件名不包含.json
    filename = filename + ".json";//添加.json
}
let Template = {//创建该用户
    "experience": 0,
    "level": 0,
    "levelname": '无等级',
    "Privilege": 0,
};
//配置一些有意思的参数

export class duel_seelevel extends plugin {
    constructor() {
        super({
            /** 功能名称 */
            name: '我的等级',
            /** 功能描述 */
            dsc: '',
            event: 'message',
            /** 优先级，数字越小等级越高 */
            priority: 1000,
            rule: [
                {
                    /** 命令正则匹配 */
                    reg: "^#我的(等级|经验)$", //匹配消息正则，命令正则
                    /** 执行方法 */
                    fnc: 'seelevel',
                    /** 命令正则匹配 */
                    reg: "^#我的(境界)$", //匹配消息正则，命令正则
                    /** 执行方法 */
                    fnc: 'seelevel2'
                }
            ]
        })
    }
    /**
     * 
     */
    async seelevel(e) {
        let user_id = e.user_id;
        if (!fs.existsSync(dirpath)) {//如果文件夹不存在
            fs.mkdirSync(dirpath);//创建文件夹
        }
        if (!fs.existsSync(dirpath + "/" + filename)) {//如果文件不存在
            fs.writeFileSync(dirpath + "/" + filename, JSON.stringify({//创建文件
            }));
        }
        var json = JSON.parse(fs.readFileSync(dirpath + "/" + filename, "utf8"));//读取文件
        if (!json.hasOwnProperty(user_id)) {//如果json中不存在该用户
            json[e.user_id] = Template
        }
        if (json[e.user_id].experience < 1) {
            json[e.user_id].experience = 0
        }//当经验小于1时，自动归零
        e.reply(`你的等级是${json[e.user_id].level},你的经验是${json[e.user_id].experience},是否是开挂${json[e.user_id].Privilege}`)
        fs.writeFileSync(dirpath + "/" + filename, JSON.stringify(json, null, "\t"));//写入文件
        return
    }
    async seelevel(e) {
        let user_id = e.user_id;
        if (!fs.existsSync(dirpath)) {//如果文件夹不存在
            fs.mkdirSync(dirpath);//创建文件夹
        }
        if (!fs.existsSync(dirpath + "/" + filename)) {//如果文件不存在
            fs.writeFileSync(dirpath + "/" + filename, JSON.stringify({//创建文件
            }));
        }
        var json = JSON.parse(fs.readFileSync(dirpath + "/" + filename, "utf8"));//读取文件
        if (!json.hasOwnProperty(user_id)) {//如果json中不存在该用户
            json[e.user_id] = Template
        }
        if (json[e.user_id].experience < 1) {
            json[e.user_id].experience = 0
        }//当内力小于1时，自动归零
        e.reply(`你的境界是${json[e.user_id].levelname},你的内力是${json[e.user_id].experience},是否是开挂${json[e.user_id].Privilege}`)
        fs.writeFileSync(dirpath + "/" + filename, JSON.stringify(json, null, "\t"));//写入文件
        return
    }
}