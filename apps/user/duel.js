import { BotApi, AlemonApi, plugin } from '../../model/api/api.js'
import fs from "fs";
import command from '../../components/command.js'
import mysqlManager from '../../components/mysql_manager.js'
import dataManager from '../../components/data_manager.js'

//项目路径
let duelCD = {};
//如果报错请删除plugins/trss-akasha-terminal-plugin/data目录中文件battle.json
const dirpath = "plugins/trss-akasha-terminal-plugin/data";//文件夹路径
const dirpath2 = "plugins/trss-akasha-terminal-plugin/data/UserData";//文件夹路径
const filename = `battle.json`;//文件名
var Template = {//创建该用户
	"experience": 0,
	"level": 0,
	"levelname": '无等级',
	"Privilege": 0,
};
let Magnification = await command.getConfig("duel_cfg", "Magnification");
let Cooling_time = await command.getConfig("duel_cfg", "Cooling_time");

export class duel extends plugin {//决斗
	constructor() {
		super({
			/** 功能名称 */
			name: '决斗',
			/** 功能描述 */
			dsc: '',
			event: 'message',
			/** 优先级，数字越小等级越高 */
			priority: 1,
			rule: [
				{
					/** 命令正则匹配 */
					reg: "^#*(发起|开始|和我|与我|御前)决斗(.*)$", //匹配消息正则，命令正则
					/** 执行方法 */
					fnc: 'duel'
				},
				{
					/** 命令正则匹配 */
					reg: "^#*(设置)战斗力意义系数(.*)$", //匹配消息正则，命令正则
					/** 执行方法 */
					fnc: 'Magnification_'
				}
			]
		})
	}

	async Magnification_(e) {
		const userId = e.user_id
		const commandName = '设置战斗力意义系数'
		
		try {
			// 记录命令使用统计
			await mysqlManager.logCommandUsage(userId, e.group_id, commandName, e.msg, true)
		
		if (!e.isMaster) {
			e.reply('凡人，休得僭越!')
			return true; // 增加返回
		}
		let msg = e.msg.replace(/#(设置|战斗力意义系数)/g, "").trim();
		let number = Number(msg); // 转换为数字
		if (!isNaN(number)) { // 检查是否为有效数字
			if (number >= 1 && number <= 3) {
				Magnification = number;
				// 这里应该将配置写入文件，否则重启后会失效
				// 比如使用 command.setConfig(...) 
				e.reply(`战斗力意义系数设置成功为：${Magnification}`);
			} else {
				e.reply(`战斗力意义系数应该是1~3之间的数字`);
			}
		} else {
			e.reply('请输入有效的数字系数');
		}
		return true; // 增加返回
		} catch (error) {
			console.error('设置战斗力系数失败:', error)
			// 记录命令失败统计
			await mysqlManager.logCommandUsage(userId, e.group_id, commandName, e.msg, false, error.message)
			e.reply('设置失败，请稍后再试')
			return true
		}
	}

	async duel(e) {
		console.log("用户命令：", e.msg);
		const userId = e.user_id
		const commandName = '决斗'
		
		try {
			// 记录命令使用统计
			await mysqlManager.logCommandUsage(userId, e.group_id, commandName, e.msg, true)
		
		// 1. 检查基本条件
		if (!e.group.is_admin) {
			e.reply('我不是管理员，不能主持御前决斗啦~');
			return true;
		}
		if (!e.at) { // 简化判断
			e.reply('不知道你要与谁决斗哦，请@你想决斗的人~');
			return true;
		}

		// 2. 获取参与者信息
		const user_id = e.user_id;
		const user_id2 = e.at;

		if (user_id === user_id2) {
			e.reply([segment.at(e.user_id), `\n...好吧，成全你，和自己决斗是吧？`]);
			try { await e.group.muteMember(e.user_id, 60); } catch (err) { console.error('自我决斗禁言失败', err); }
			return true;
		}

		if (e.atme) {
			e.reply([segment.at(e.user_id), `\n你什么意思？想挑战神明？举办了！`]);
			if (!e.isMaster) { // 主人不禁言
				try { await e.group.muteMember(e.user_id, 60); } catch (err) { console.error('挑战Bot禁言失败', err); }
			}
			return true;
		}

		// 3. 检查CD
		if (duelCD[user_id]) {
			e.reply(`你刚刚发起了一场决斗，请耐心一点，等待${Cooling_time}秒后再次决斗吧！`);
			return true;
		}

		// 4. 获取详细成员信息 (核心修复)
		const member1 = e.sender; // 发起者信息 
		const member2 = await Bot.getGroupMemberInfo(e.group_id, user_id2).catch(() => null); // 被@者信息
		
		if (!member2) {
			e.reply("似乎找不到你@的这个人哦，可能ta已经离开了。");
			return true;
		}
		const user_id2_nickname = member2.card || member2.nickname;

		// 5. 初始化用户数据
		if (!fs.existsSync(dirpath)) fs.mkdirSync(dirpath);
		if (!fs.existsSync(dirpath + "/" + filename)) await dataManager.saveJsonData(dirpath + "/" + filename, {});
		
		let json = await dataManager.loadJsonData(dirpath + "/" + filename);
		if (!json[user_id]) json[user_id] = { ...Template }; // 使用扩展运算符防止引用污染
		if (!json[user_id2]) json[user_id2] = { ...Template };

		// 6. 判定双方权限 (核心修复)
		const is_admin1 = member1.role === 'owner' || member1.role === 'admin' || json[user_id].Privilege === 1;
		const is_admin2 = member2.role === 'owner' || member2.role === 'admin' || json[user_id2].Privilege === 1;
		
		if (is_admin1 && is_admin2) {
			e.reply("你们两人都是管理员或拥有特权，神仙打架，凡人遭殃，御前决斗无法进行哦！");
			return true;
		}

		// 7. 设置CD
		duelCD[user_id] = true;
		setTimeout(() => {
			delete duelCD[user_id];
		}, Cooling_time * 1000);

		// 8. 计算战斗力
		let level = json[user_id].level || 0;
		let level2 = json[user_id2].level || 0;
		
		let num13 = 0, num14 = 0, num15 = 0;
		let num23 = 0, num24 = 0, num25 = 0;
		
		const filename1 = `${user_id}.json`;
		const filename2 = `${user_id2}.json`;

		if (fs.existsSync(dirpath2 + "/" + filename1)) {
			try {
				let json1 = await dataManager.loadJsonData(dirpath2 + "/" + filename1);
				if (json1[3]) num13 = Object.keys(json1[3]).length;
				if (json1[4]) num14 = Object.keys(json1[4]).length;
				if (json1[5]) num15 = Object.keys(json1[5]).length;
			} catch (err) { console.error(`解析文件 ${filename1} 失败:`, err); }
		}
		if (fs.existsSync(dirpath2 + "/" + filename2)) {
			try {
				let json2 = await dataManager.loadJsonData(dirpath2 + "/" + filename2);
				if (json2[3]) num23 = Object.keys(json2[3]).length;
				if (json2[4]) num24 = Object.keys(json2[4]).length;
				if (json2[5]) num25 = Object.keys(json2[5]).length;
			} catch(err) { console.error(`解析文件 ${filename2} 失败:`, err); }
		}

		const win_level = level - level2;
		const win_prob = 50 + Magnification * win_level + num13 + num14 * 2 + num15 * 3 - (num23 + num24 * 2 + num25 * 3);
		
		// 9. 发送决斗信息
		e.reply([
			segment.at(user_id), `\n`,
			`你的境界为【${json[user_id].levelname}】\n`,
			`三星武器: ${num13}, 四星武器: ${num14}, 五星武器: ${num15}\n\n`,
			`${user_id2_nickname}的境界为【${json[user_id2].levelname}】\n`,
			`三星武器: ${num23}, 四星武器: ${num24}, 五星武器: ${num25}\n\n`,
			`决斗开始! 战斗力系数: ${Magnification}, 境界差: ${win_level}, 你的获胜概率是: ${win_prob.toFixed(2)}%\n`,
			`提示：挑战失败者将被禁言1~5分钟, 被挑战者失败将被禁言1~3分钟`
		]);

		// 10. 判断结果
		const random = Math.random() * 100;
		const random_time_loser = (Math.round(Math.random() * 2) + 1) * 60; // 被挑战者失败禁言时间(秒)
		const random_time_challenger = (Math.round(Math.random() * 4) + 1) * 60; // 挑战者失败禁言时间(秒)

		setTimeout(async () => { // 统一延时处理
			try {
				if (is_admin1) {
					await e.group.muteMember(user_id2, random_time_loser);
					e.reply([segment.at(user_id), ` 不讲武德，使用了管理员之力获得了胜利。\n恭喜你与${user_id2_nickname}决斗成功。\n${user_id2_nickname}接受惩罚，已被禁言${random_time_loser / 60}分钟！`]);
				} else if (is_admin2) {
					await e.group.muteMember(user_id, random_time_challenger);
					e.reply([segment.at(user_id), ` 对方不讲武德，使用了管理员之力获得了胜利。\n你接受惩罚，已被禁言${random_time_challenger / 60}分钟!`]);
				} else if (win_prob > random) {
					await e.group.muteMember(user_id2, random_time_loser);
					e.reply([segment.at(user_id), ` 恭喜你与${user_id2_nickname}决斗成功。\n${user_id2_nickname}接受惩罚，已被禁言${random_time_loser / 60}分钟！`]);
				} else {
					await e.group.muteMember(user_id, random_time_challenger);
					e.reply([segment.at(user_id), ` 你与${user_id2_nickname}决斗失败。\n你接受惩罚，已被禁言${random_time_challenger / 60}分钟！`]);
				}
			} catch (err) {
				console.error("决斗禁言失败:", err);
				e.reply("哎呀，禁言失败了，可能是权限不够或者出了点小问题。");
			}

			console.log(`发起者：${user_id} 被动者：${user_id2}`);
			await dataManager.saveJsonData(dirpath + "/" + filename, json);
		}, 3000);

		return true;
		} catch (error) {
			console.error('决斗命令执行失败:', error)
			// 记录命令失败统计
			await mysqlManager.logCommandUsage(userId, e.group_id, commandName, e.msg, false, error.message)
			e.reply('决斗系统出现错误，请稍后再试')
			return true
		}
	}
}

export default duel