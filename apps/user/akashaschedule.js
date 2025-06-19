import { BotApi, AlemonApi, plugin } from '../../model/api/api.js'
import schedule from "node-schedule"
import common from '../../../../lib/common/common.js'
import moment from "moment"
import yzcfg from '../../../../lib/config/config.js'
import command from '../../components/command.js'
import fs from 'fs'
var Group = await command.getConfig("wife_cfg", "group");
var RBBtime = Number(await command.getConfig("wife_cfg", "RBBtime"))
var notice = await command.getConfig("wife_cfg", "notice");
export class akashakaijiang extends plugin {
	constructor() {
		super({
			/** 功能名称 */
			name: '虚空抽奖',
			/** 功能描述 */
			dsc: '定时生成号码',
			event: 'message',
			/** 优先级，数字越小等级越高 */
			priority: 1000,
			rule: [
				{
					/** 命令正则匹 配 */
					reg: "^#?虚空彩球开奖$", //匹配消息正则，命令正则
					/** 执行方法 */
					fnc: 'redblueball'
                }
			]
		})
	}
	/**
	 * 
	 */
    async redblueball(e){
        if(!e.isMaster) return
        e.reply(`手动开奖成功`)
        redblueball_start();
    }
}
//每小时执行任务
schedule.scheduleJob('0 0 * * * *', async() => {
    let time = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
    let hour = new Date(time).getHours()
    if(hour == RBBtime)
	redblueball_start();
}
);

async function redblueball_start() {
    for(let key of Group){
        try{
            await Bot.pickGroup(key).sendMsg(`娶群友小游戏虚空彩球已开奖,今日购买的玩家们可以发送'虚空彩球兑换'进行兑换\n也可'我的彩票'查看自己的号码`)
            console.log(`正在通知群聊${key}虚空彩球开奖`)
        }
        catch(err){
            console.log(`群聊${key}不存在`)
        }
    }
    if(notice == 'T'){
        for(let mat of yzcfg.masterQQ){
            await common.relpyPrivate(mat, `娶群友小游戏虚空彩球已开奖,快去通知玩家们吧\n数据在本插件resources/qylp/lottery.json`)
        }
     }
    const lotterypath = `plugins/akasha-terminal-plugin/resources/qylp`
    let filename = `lottery.json`
    if (!fs.existsSync(lotterypath + "/" + filename)) {//如果文件不存在
        fs.writeFileSync(lotterypath + "/" + filename, JSON.stringify({//创建文件
        }));
    }
    var redballarr = []
    for(;;){
        let redballnum = Math.round(Math.random()*32 + 1)//生成1到33随机数
        if(redballnum<10){
            redballnum = "0" + redballnum//小于10改为01,02形式
        }
        if(redballarr.includes(redballnum))
            redballarr = []//含有重复数字则重新开始
        redballarr.push(redballnum)
        if(redballarr.length == 6){
            let buytime = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`
            var ssqjson = JSON.parse(fs.readFileSync(lotterypath + "/" + filename, "utf8"));//读取文件
            let blueballnum =  Math.round(Math.random()*15 + 1)
            if(blueballnum<10)
            blueballnum = "0" + blueballnum
            let ssqdata = {
                redball: redballarr,
                blueball: blueballnum,
                time: buytime
            }
            let title = "RBB"
            ssqjson[title] = ssqdata
            let kjdata = `Red${redballarr.toString()}Blue${blueballnum}Time${buytime}`
            console.log(`开奖球设置为${kjdata}`)
            fs.writeFileSync(lotterypath + "/" + filename, JSON.stringify(ssqjson, null, "\t"));//写入文件
            break//有六个不同数字时结束
        }
    }
}
