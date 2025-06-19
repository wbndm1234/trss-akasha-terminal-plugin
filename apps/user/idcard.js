import { BotApi, AlemonApi, plugin } from '../../model/api/api.js'
import cfg from '../../../../lib/config/config.js'
import moment from "moment"
import akasha_data from '../../components/akasha_data.js'

const cdTime = 60 // 冷却时间，单位：秒

export class idcard extends plugin {
    constructor() {
        super({
            name: '查水表',
            dsc: '查水表',
            event: 'message',
            priority: 66,
            rule: [{
                /** 命令正则匹配 */
                reg: "^#?(查水表|查户口|查身份证)(.*)$",
                /** 执行方法 */
                fnc: 'idcard'
            }]
        })
    }
    
    async idcard(e) {
        // 1. 检查 at
        if (!e.at) { // 简化判断
            e.reply(`请@你想要查看的群成员`);
            return true;
        }
        if (e.atme || e.atall) {
            e.reply(`不可以这样！`);
            return true;
        }
        
        // 2. 检查CD
        const lastTime = await redis.ttl(`lql:idcard-cd:${e.user_id}`);
        const masterList = cfg.masterQQ || []; // 确保 masterQQ 存在
        
        // 确保 akasha_data 和 battlejson 正确加载
        let UserPAF = false;
        try {
            const battlejson = await akasha_data.getQQYUserBattle(e.user_id, undefined, false);
            if (battlejson && battlejson[e.user_id]) {
                UserPAF = battlejson[e.user_id].Privilege === 1;
            }
        } catch (err) {
            console.error('[查水表] 获取用户特权信息失败:', err);
        }

        if (lastTime > 0 && !UserPAF && !masterList.includes(e.user_id)) {
            e.reply([
                segment.at(e.user_id), "\n",
                `等会儿哦！(*/ω＼*)`, "\n",
                `冷却中：还有 ${Math.ceil(lastTime / 60)} 分钟`
            ]);
            return true;
        }
        
        // 3. 获取成员信息
        const memberInfo = await Bot.getGroupMemberInfo(e.group_id, e.at).catch(() => null);
        
        if (!memberInfo) {
            e.reply("哎呀，查不到这个人的信息，他/她可能已经不在这个群里了。");
            return true;
        }
        
        // 4. 格式化并发送信息
        const joinTime = moment.unix(memberInfo.join_time).format('YYYY-MM-DD HH:mm:ss');
        const lastSentTime = moment.unix(memberInfo.last_sent_time).format('YYYY-MM-DD HH:mm:ss');
        const titleExpireTime = memberInfo.title_expire_time == -1 ? "永久" : moment.unix(memberInfo.title_expire_time).format('YYYY-MM-DD HH:mm:ss');
        const shutupTime = memberInfo.shutup_time > 0 ? `禁言中，还剩 ${moment.duration(memberInfo.shutup_time - moment().unix(), 'seconds').humanize()}` : "未被禁言";
        
        let msg = [
            `我帮你查到了哦！(*/ω＼*)`,
            `--------------------`,
            `群号: ${memberInfo.group_id}`,
            `QQ号: ${memberInfo.user_id}`,
            `昵称: ${memberInfo.nickname}`,
            `群名片: ${memberInfo.card || '无'}`,
            `性别: ${memberInfo.sex}`,
            `年龄: ${memberInfo.age}`,
            `地区: ${memberInfo.area || '未知'}`,
            `入群时间: ${joinTime}`,
            `最后发言: ${lastSentTime}`,
            `等级: ${memberInfo.level}`,
            `头衔: ${memberInfo.title || '无'}`,
            `头衔有效期: ${titleExpireTime}`,
            `群身份: ${memberInfo.role}`, // owner, admin, member
            `禁言状态: ${shutupTime}`
        ].join('\n');
        
        // 5. 设置CD
        await redis.set(`lql:idcard-cd:${e.user_id}`, '1', { // value设为1即可，不用存时间
            EX: cdTime
        });
        
        e.reply(msg);
        return true;
    }
}