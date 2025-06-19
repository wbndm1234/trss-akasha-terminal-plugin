import { BotApi, AlemonApi, plugin } from '../../model/api/api.js'
import fs from "fs";
const dirpath = "plugins/akasha-terminal-plugin/data/UserData";//文件夹路径
const dirpath2 = "plugins/akasha-terminal-plugin/resources/weapon/weapon.json";
let Template = {//创建该用户
    "money": 5,
};
let exerciseCD = {};
let Cool_time = 5;
var weapon = JSON.parse(fs.readFileSync(dirpath2, "utf8"));
let num3 = weapon[`3星数量`]
let num4 = weapon[`4星数量`]
let num5 = weapon[`5星数量`]
export class drawcard extends plugin {
    constructor() {
        super({
            /** 功能名称 */
            name: '虚空武器抽卡',
            /** 功能描述 */
            dsc: '',
            event: 'message',
            /** 优先级，数字越小等级越高 */
            priority: 1000,
            rule: [
                {
                    /** 命令正则匹配 */
                    reg: "^#(决斗|虚空|抽卡)?(签到|做委托|开挂)$", //匹配消息正则，命令正则
                    /** 执行方法 */
                    fnc: 'signin'
                },
                {
                    /** 命令正则匹配 */
                    reg: "^#(决斗|虚空|抽卡)?(抽武器|祈愿|十连抽武器)$", //匹配消息正则，命令正则
                    /** 执行方法 */
                    fnc: 'weapon'
                },
                {
                    /** 命令正则匹配 */
                    reg: "^#武器库$", //匹配消息正则，命令正则
                    /** 执行方法 */
                    fnc: 'weaponWarehouse'
                },
                {
                    /** 命令正则匹配 */
                    reg: "^#我的武器$", //匹配消息正则，命令正则
                    /** 执行方法 */
                    fnc: 'myweapon'
                }
            ]
        })
    }
    /**
     * 
     */
    async weaponWarehouse(e) {
        var weapon = JSON.parse(fs.readFileSync(dirpath2, "utf8"));
        let num3 = weapon[`3星数量`]
        let num4 = weapon[`4星数量`]
        let num5 = weapon[`5星数量`]
        let msg = `武器库总量三星${num3}四星${num4}五星${num5}`
        msg = msg + `\n五星武器:`;
        if (weapon.hasOwnProperty(5)) {
            for (let i = 1; i <= num5; i++) {
                msg = msg + `\n${weapon[5][i]}`
            }
        }
        msg = msg + `\n四星武器:`
        if (weapon.hasOwnProperty(4)) {
            for (let i = 1; i <= num4; i++) {
                msg = msg + `\n${weapon[4][i]}`
            }
        }
        msg = msg + `\n三星武器:`
        if (weapon.hasOwnProperty(3)) {
            for (let i = 1; i <= num3; i++) {
                msg = msg + `\n${weapon[3][i]}`
            }
            e.reply(msg)
        }
    }
    async signin(e) {
        let user_id = e.user_id;
        let filename = `${user_id}.json`;
        //判断冷却
        if (exerciseCD[user_id]) { //判定是否在冷却中
            e.reply(`你刚刚进行了签到，等待${Cool_time}分钟后再次签到吧！`);
            return;
        }
        if (!fs.existsSync(dirpath)) {//如果文件夹不存在
            fs.mkdirSync(dirpath);//创建文件夹
        }
        //如果文件不存在，创建文件
        if (!fs.existsSync(dirpath + "/" + filename)) {
            fs.writeFileSync(dirpath + "/" + filename, JSON.stringify({
            }));
        }
        //读取文件
        var json = JSON.parse(fs.readFileSync(dirpath + "/" + filename, "utf8"));
        if (!json.hasOwnProperty("money")) {//如果这个用户现在没有钱
            json = Template
            e.reply(`恭喜你注册成功，你现在的纠缠之缘数量是${json['money']}`)
        }
        else {
            if (e.msg.includes('开挂') && e.isMaster) {
                json['money'] += 100
                e.reply(`你获得了100颗纠缠之缘，你现在的纠缠之缘数量是${json['money']}`)
            }
            json['money']++
            e.reply(`获得了一颗纠缠之缘，你还有${json['money']}颗纠缠之缘`)
        }
        //下面是添加冷却
        exerciseCD[user_id] = true;
        exerciseCD[user_id] = setTimeout(() => {//冷却时间
            if (exerciseCD[user_id]) {
                delete exerciseCD[user_id];
            }
        }, Cool_time * 1000 * 60);
        fs.writeFileSync(dirpath + "/" + filename, JSON.stringify(json, null, "\t"));//写入文件
        return
    }
    async weapon(e) {
        let user_id = e.user_id;
        let filename = `${user_id}.json`;
        //判断冷却
        //如果文件不存在，创建文件
        if (!fs.existsSync(dirpath + "/" + filename)) {
            e.reply('你还没有注册呢，请使用 #虚空签到 注册')
            return
        }
        //读取文件
        var json = JSON.parse(fs.readFileSync(dirpath + "/" + filename, "utf8"));
        var weapon = JSON.parse(fs.readFileSync(dirpath2, "utf8"));
        let num_chou = 1
        if (e.msg.includes("十连抽武器")) num_chou = 10
        if (json['money'] < num_chou) { //判定是否有钱
            e.reply(`需要${num_chou}纠缠之缘，你没有纠缠之缘了！`);
            return;
        }
        if (user_id == '2859167710' || e.isMaster) { json['money'] += num_chou }//开发者开挂
        else { json['money'] = json['money'] - num_chou }
        //获取随机数，判断武器等级
        let msg = '你抽到的三星武器：\n'
        let msg2
        for (let i = 1; i <= num_chou; i++) {
            let Grade = Math.floor(1000 * Math.random())
            if (Grade < 16) { Grade = 5 }
            else if (Grade < 150) { Grade = 4 }
            else { Grade = 3 }
            if (Grade == 5)
                var num = Math.floor(1 + num5 * Math.random())
            else if (Grade == 4)
                var num = Math.floor(1 + num4 * Math.random())
            else if (Grade == 3)
                var num = Math.floor(1 + num3 * Math.random())
            let name = weapon[Grade][num];
            if (!json.hasOwnProperty(Grade)) {//如果json中不存在该用户
                json[Grade] = { num: 1 }//数量1
            }
            if (!json[Grade].hasOwnProperty(num)) {
                json[Grade][num] = 1
            }
            else {
                json[Grade][num]++
            }
            if (Grade == 5 || Grade == 4) {
                msg2 = [`恭喜你抽到了${Grade}星武器,你的第${json[Grade][num]}把${name}`, segment.image(`plugins/akasha-terminal-plugin/resources/weapon/${Grade}/${name}.png`)]
                e.reply(msg2)
            } else {
                if (num_chou > 1)
                    msg = msg + `你已经有${json[Grade][num]}把${name}了,你还有${json['money']}纠缠之缘\n`
                if (num_chou == 1) {
                    msg = [`你已经有${json[Grade][num]}把三星武器${name}了,你还有${json['money']}纠缠之缘`,
                    segment.image(`plugins/akasha-terminal-plugin/resources/weapon/${Grade}/${name}.png`)]
                    e.reply(msg)
                }
            }
        }
        if (num_chou > 1)
            e.reply(msg)
        fs.writeFileSync(dirpath + "/" + filename, JSON.stringify(json, null, "\t"));//写入文件
        return
    }
    async myweapon(e) {
        let user_id = e.user_id;
        let filename = `${user_id}.json`;
        //判断冷却
        //如果文件不存在，创建文件
        if (!fs.existsSync(dirpath + "/" + filename)) {
            e.reply('你还没有注册呢，请使用 #虚空签到 注册')
            return
        }
        //读取文件
        var json = JSON.parse(fs.readFileSync(dirpath + "/" + filename, "utf8"));
        var weapon = JSON.parse(fs.readFileSync(dirpath2, "utf8"));
        let msg = `五星武器：`;
        if (json.hasOwnProperty(5)) {
            console.log(json[5])
            for (let i of Object.keys(json[5])) {
                console.log(i)
                if (weapon[5][i])
                    msg = msg + `\n${weapon[5][i]} 数量：${json[5][i]}`
            }
        }
        msg = msg + `\n四星武器:`
        if (json.hasOwnProperty(4)) {
            console.log(json[4])
            for (let i of Object.keys(json[4])) {
                console.log(i)
                if (weapon[4][i])
                    msg = msg + `\n${weapon[4][i]} 数量：${json[4][i]}`
            }
        }
        msg = msg + `\n三星武器:`
        if (json.hasOwnProperty(3)) {
            console.log(json[3])
            for (let i of Object.keys(json[3])) {
                console.log(i)
                if (weapon[3][i])
                    msg = msg + `\n${weapon[3][i]} 数量：${json[3][i]}`
            }
            e.reply(msg)
        }
        return
    }
}