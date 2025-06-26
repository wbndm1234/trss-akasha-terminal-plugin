/**
 * 虚空CP文生成器
 * 随机生成用户与群成员的CP故事
 */

export class VoidCPGenerator extends plugin {
    constructor() {
        super({
            name: '虚空CP文生成器',
            dsc: '生成随机CP故事',
            event: 'message',
            priority: 5,
            rule: [
                {
                    reg: '^#?虚空cp文生成.*',
                    fnc: 'generateCPStory'
                }
            ]
        })
        
        // 冷却时间管理
        this.cooldowns = new Map()
        this.COOLDOWN_TIME = 30000 // 30秒冷却
        
        // CP故事模板库
        this.storyTemplates = [
            '"给你变个魔术。"{target}笑着看着两眼放光的{user}，伸出了空无一物的双手。\n"这里面什么都没有，但是……"\n{target}狡黠地挑了挑眉，捏住了{user}的脸，{user}吃痛后吸了一口凉气。\n"……现在，里面有全世界。"',
            '夜晚的凉风让{user}打了个喷嚏，\n一旁{target}替{user}披上外套，\n连着好几日的餐桌多了锅鸡汤。',
            '朋友聚会的时候，{target}一脸自豪地搂着{user}对别人说:"{user}真的超可爱！我们两个一拍即合！"旁边的{user}脸一下就红了，心里暗想着:我记得之前是我先追的你啊，现在又是怎么回事。',
            '{target}一直认为自己不是一个合格的恋人，因为直到最后，他给{user}的也只有一个掩埋在战场废墟下混杂着血腥味的吻。',
            '有一次，狗仔在{target}家门口蹲拍，想拍到{target}和他的女朋友。等到第二天下午，{target}终于从大门出来了，而他身后跟着一个走路踉踉跄跄的{user}。',
            '{target}用复杂的眼神看着{user}，叹了一声说:放过我也放过你自己吧，{user}舔了舔带血的刀刃，充满爱意的眼神看着{target}。\n"这样你就一直是我的了。"',
            '{user}："像你这样的人，我最讨厌了！"\n{target}："想吃土豆炖肉～"\n{user}："我不是正在做吗！"',
            '一大早,{target}：快点起来了,再不起来不给你早餐了。 {user}：可是你昨晚害人家的腰好酸...\n{target}：那是因为我教你的姿势都不对啊（扶额\n{user}：但我跟你说过呢！我不会瑜伽啊！',
            '"夏天又来了呢"，{user}望着远处湛蓝的天空。\n"{target}你什么时候才会回来呢？"',
            '{target}和{user}在山上看星星，耳畔是风声、虫鸣和淙淙流水。"听，山川的歌谣。"{user}闭上眼，"还有你和我的心跳。',
            '{target}拽着{user}的尾巴，{user}眼圈儿红红说："我给你麻花吃，你不要吃我好不好？"',
            '{user}一把拉过{target}的手作势要摘掉手链一边故作正经的说："作为一名受到严格要求的好学生是不允许带饰品的。"\n{target}从{user}手里抽出胳膊，讨饶似的向他比心，{user}还是不为所动，并且告诫他："像这样去撩其他学生也是不可以的。"',
            '{user}是{target}的替补门将，他一直想取代{target}，这一天{target}主动提出让{user}首发，在{user}欣喜若狂之时，{target}凑到他耳边轻声说："今晚可要好好报答我哦。"',
            '{user}没有说任何一句话。\n眼里笑意不再，仿若陌生人一般。\n{target}没有追问。\n毕竟若是真的问了的话，一定就再也忍受不住了吧。 {target}明白的。\n可他们还需要有什么底线呢？记忆缺了好几个章节，似乎很重要，但{target}早就忘了。\n忘了他们的从前。\n如今他再也想不起{user}的脸了。',
            '{user}:"干嘛脱我衣服？"\n{target}:"我买的衣服，我想脱就脱"\n{user}:"那你摸我干什么"\n{target}:"我的人，我想摸就摸"',
            '多年后，{target}回看过去，从零星而又斑驳的记忆里觅得些许年少的身影，{user}突兀闯进他这浑浑噩噩又悲剧到极点的岁月，温柔坚定地斩断他和过去的连接，极具自私地渡给他少年时期的冲动。从{target}看到{user}眼睛起的那一刻，{target}已经远离了过往，朝着未知的光砥砺前行。',
            '{target}往碗里倒满了猫粮，走到床边顺着{user}豪奢的金发摸到他的项圈，温柔地说到："{user}大人，该起来吃早饭了。"',
            '黑夜尚未散去，{target}轻轻将手臂抽离，却被拦腰抱住。 "别走"{user}说。{target}亲吻他的手背："你知道我没有选择"。',
            '{user} ，谢谢你，你是第一个肯定我的人。这是出现在{target}日记本里的一句话。',
            '{user}去吻了{target}的双唇，饱含着虔诚与温柔。\n{user}知道了，自从这一把烈火的狂放席卷自身，双目早就无法从那绚烂上移开——彼此燃烧彼此，有不可思议的热度，甚至散发着麻药燃烧的味道，愈发成瘾。',
            '{target}过生日，朋友们都写了祝福语，{target}念到{user}的时候{user}的贺卡上写着，"I want to be with you everyday.  Forever love you darling～"',
            '图书馆里，{user}和{target}在书架间偶遇，两人的目光交汇，仿佛整个世界都安静了下来。📚✨',
            '雨夜里，{user}为{target}撑起了一把伞，雨滴打在伞面上，却打不湿两人心中的温暖。🌧️☂️',
            '{user}悄悄在{target}的桌子上放了一杯热咖啡，没有留下名字，只有淡淡的香气诉说着心意。☕💕',
            '夕阳西下，{user}和{target}并肩走在校园的小径上，影子在地上交织成最美的画面。🌅👫',
            '春日樱花飞舞，{user}和{target}在花树下许下了只属于彼此的约定。🌸🤝',
            '星空下的天台，{user}和{target}分享着彼此的秘密，夜风轻抚着两颗靠近的心。⭐🌙',
            '{user}为{target}亲手制作了生日蛋糕，虽然卖相不佳，但心意比任何甜品都要珍贵。🎂💖',
            '音乐会上，{user}和{target}听着同一首歌，泪水不约而同地滑落，心灵在旋律中相通。🎵😢',
            '雪夜归途，{user}脱下外套披在{target}身上，寒风中的温暖格外珍贵。❄️🧥'
        ]
    }

   
    checkCooldown(userId) {
        const now = Date.now()
        const lastUse = this.cooldowns.get(userId)
        
        if (lastUse && now - lastUse < this.COOLDOWN_TIME) {
            return true
        }
        
        this.cooldowns.set(userId, now)
        return false
    }

   
    async generateCPStory(e) {
            console.log('用户命令：', e.msg)
            
            if (!e.isGroup) {
                await e.reply('此功能仅在群聊中可用')
                return true
            }

            // 检查冷却时间
            if (this.checkCooldown(e.user_id)) {
                const remainingTime = Math.ceil((this.COOLDOWN_TIME - (Date.now() - this.cooldowns.get(e.user_id))) / 1000)
                await e.reply(`请等待 ${remainingTime} 秒后再生成CP文哦~ `)
                return true
            }
            const memberMap = await e.group.getMemberMap()
            if (!memberMap || memberMap.size <= 1) {
                await e.reply('群成员太少了，无法生成CP文呢~ ')
                return true
            }

            const userNickname = e.sender.nickname || e.sender.card || '神秘人'
            let targetUserId = null
            let targetNickname = ''
            
            // 检查消息中是否有@用户
            let shouldAtTarget = false
            if (e.at) {
                const atUserId = parseInt(e.at)
                const targetMember = memberMap.get(atUserId)
                if (targetMember && atUserId !== e.user_id && atUserId.toString().length >= 5) {
                    targetUserId = atUserId
                    targetNickname = targetMember.nickname || targetMember.card || '神秘人'
                    shouldAtTarget = true
                } else {
                    const memberArr = Array.from(memberMap.values()).filter(member => member.user_id !== e.user_id)
                    if (memberArr.length === 0) {
                        await e.reply('群里只有你一个人，无法生成CP文呢~ ')
                        return true
                    }
                    const randomMember = memberArr[Math.floor(Math.random() * memberArr.length)]
                    targetUserId = randomMember.user_id
                    targetNickname = randomMember.nickname || randomMember.card || '神秘人'
                    shouldAtTarget = false // @用户无效时不进行@
                }
            } else {
                const memberArr = Array.from(memberMap.values()).filter(member => member.user_id !== e.user_id)
                if (memberArr.length === 0) {
                    await e.reply('群里只有你一个人，无法生成CP文~ ')
                    return true
                }
                
                const randomMember = memberArr[Math.floor(Math.random() * memberArr.length)]
                targetUserId = randomMember.user_id
                targetNickname = randomMember.nickname || randomMember.card || '神秘人'
                shouldAtTarget = false // 没有@用户时不进行@
            }

            const randomIndex = Math.floor(Math.random() * this.storyTemplates.length)
            const randomTemplate = this.storyTemplates[randomIndex]
            
            // 如果@了用户，在故事中的目标用户名前添加@符号
            const displayTargetName = shouldAtTarget ? `@${targetNickname}` : targetNickname
            
            const story = randomTemplate
                .replace(/{user}/g, userNickname)
                .replace(/{target}/g, displayTargetName)

            const replyMsg = [
                '━━━━━━━━━━',
                story,
                '━━━━━━━━━━',
            ]
            
            if (shouldAtTarget) {
                await e.reply(replyMsg.join('\n'), false, { at: targetUserId })
            } else {
                await e.reply(replyMsg.join('\n'))
            }
       
        return true
    }
}
