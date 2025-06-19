import { BotApi, AlemonApi, plugin } from '../../model/api/api.js'
import fs from "fs";
import chalk from "chalk"
import schedule from "node-schedule";
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
export class duel_setmaster extends plugin {//设置开挂
	constructor() {
		super({
			/** 功能名称 */
			name: '虚空管理',
			/** 功能描述 */
			dsc: '',
			event: 'message',
			/** 优先级，数字越小等级越高 */
			priority: 1000,
			rule: [
				{
					/** 命令正则匹配 */
					reg: "^#?虚空(设置|回收)权能$", //匹配消息正则，命令正则
					/** 执行方法 */
					fnc: 'master',
				}
			]
		})
	}
	/**
	 * 
	 */
	//e.msg 用户的命令消息
	async master(e) {
		console.log("用户命令：", e.msg);
		if (!e.group.is_admin) { //检查是否为管理员
			e.reply('我不是群管理员，不能设置开挂啦~');
			return true;
		}
		if (!e.at) {
			e.reply('不知道你要设置谁为开挂哦~');
			return true;
		}
		if (!e.isMaster) {
			e.group.muteMember(e.user_id, 60);
			e.reply([segment.at(e.user_id), `\n凡人，休得僭越！`]);
			return true
		}
		let user_id2 = e.at; //获取当前at的那个人
		let user_id2_nickname = null
		for (let msg of e.message) { //赋值给user_id2_nickname
			if (msg.type === 'at') {
				user_id2_nickname = msg.text//获取at的那个人的昵称
				break;
			}
		}
		if (!fs.existsSync(dirpath)) {//如果文件夹不存在
			fs.mkdirSync(dirpath);//创建文件夹
		}
		if (!fs.existsSync(dirpath + "/" + filename)) {//如果文件不存在
			fs.writeFileSync(dirpath + "/" + filename, JSON.stringify({//创建文件
			}));
		}
		var json = JSON.parse(fs.readFileSync(dirpath + "/" + filename, "utf8"));//读取文件
		if (!json.hasOwnProperty(user_id2)) {//如果json中不存在该用户
			json[user_id2] = Template
		}
		if (e.msg.includes("设置")) {
			json[user_id2].Privilege = 1
			fs.writeFileSync(dirpath + "/" + filename, JSON.stringify(json, null, "\t"));//写入文件
			logger.info(chalk.green(`${user_id2}被赋予权能`)); //输出日志
			e.reply([segment.at(e.user_id),
			`设置权能成功\n🎉恭喜${user_id2_nickname}成为特权者`]);//发送消息
			return true; //返回true 阻挡消息不再往下}
		} else {
			json[user_id2].Privilege = 0
			fs.writeFileSync(dirpath + "/" + filename, JSON.stringify(json, null, "\t"));//写入文件
			logger.info(chalk.gray(`${user_id2}被移除权能`)); //输出日志
			e.reply([segment.at(e.user_id),
			`移除权能成功\n${user_id2_nickname}权能已被收回`]);//发送消息
			return true; //返回true 阻挡消息不再往下
		}
	}
}