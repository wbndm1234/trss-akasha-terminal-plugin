/*
* 请注意，系统不会读取help_default.js ！！！！
* 【请勿直接修改此文件，且可能导致后续冲突】
*
* 如需自定义可将文件【复制】一份，并重命名为 help.js
*
* */

// 帮助配置
export const helpCfg = {
  // 帮助标题
  title: '虚空trss版帮助',

  // 帮助副标题
  subTitle: 'TRSS-Yunzai & trss-akasha-terminal-plugin',

  // 帮助表格列数，可选：2-5，默认3
  // 注意：设置列数过多可能导致阅读困难，请参考实际效果进行设置
  colCount: 4,

  // 单列宽度，默认265
  // 注意：过窄可能导致文字有较多换行，请根据实际帮助项设定
  colWidth: 265,

  // 皮肤选择，可多选，或设置为all
  // 皮肤包放置于 resources/help/theme
  // 皮肤名为对应文件夹名
  // theme: 'all', // 设置为全部皮肤
  // theme: ['default','theme2'], // 设置为指定皮肤
  theme: 'all',

  // 排除皮肤：在存在其他皮肤时会忽略该项内设置的皮肤
  // 默认忽略default：即存在其他皮肤时会忽略自带的default皮肤
  // 如希望default皮肤也加入随机池可删除default项
  themeExclude: ['default'],

  // 是否启用背景毛玻璃效果，若渲染遇到问题可设置为false关闭
  bgBlur: true
}

// 帮助菜单内容
export const helpList = [{
  group: '决斗!属性系统',
  list: [{
    icon: 21,
    title: '#锻炼',
    desc: '生命在于运动。锻炼提升你的经验吧'
}, {
    icon: 22,
    title: '#闭关突破',
    desc: '当经验满足时，即可提升等级'
  }]
}, {
  group: '决斗!抽卡系统',
  list: [{
    icon: 19,
    title: '#虚空做委托',
    desc: '每日委托，获得纠缠之缘'
}, {
    icon: 20,
    title: '#虚空(十连)抽武器',
    desc: '花费纠缠之缘抽取武器。提升战力'
  }, {
    icon: 20,
    title: '#我的武器',
    desc: '查看自己抽到的武器'
  }, {
    icon: 20,
    title: '#武器库',
    desc: '查看可以被抽到的武器'
  }]
}, {
  group: '一起决斗吧！！！',
  list: [{
    icon: 20,
    title: '#御前决斗@群友',
    desc: '和群友决斗吧，败者可是有惩罚的哦'
  }]
}, {
  group: '群友?老婆?!',
  list: [{
    icon: 20,
    title: '创建老婆',
    desc: '创建老婆存档'
  }, {
    icon: 20,
    title: '领取低保',
    desc: '钱太少可以使用'
  }, {
    icon: 20,
    title: '住所改名xxx',
    desc: '给家改名'
  }, {
    icon: 20,
    title: '看房',
    desc: '看看当前可买房产'
  }, {
    icon: 20,
    title: '买房+id(@群友)',
    desc: '给自己或群友购买房产,增加各类数值'
  }, {
    icon: 20,
    title: '上交存款+数量',
    desc: '将一部分钱上交给老婆'
  }, {
    icon: 20,
    title: '娶群友',
    desc: '随机娶一位群友做老婆'
  }, {
    icon: 20,
    title: '娶@群友',
    desc: '指定求婚'
  }, {
    icon: 20,
    title: '我愿意/拒绝@群友',
    desc: '回应群友的求婚'
  }, {
    icon: 20,
    title: '强娶@群友',
    desc: '强行娶走一位群友'
  }, {
    icon: 20,
    title: '抢老婆@群友',
    desc: '抢走对方的老婆!'
  }, {
    icon: 20,
    title: '闹离婚',
    desc: '将对方从你的老婆里删掉'
  }, {
    icon: 20,
    title: '甩掉@群友',
    desc: '让对方失去你这个老婆'
  }, {
    icon: 20,
    title: '退出/踢出银啪@群友',
    desc: '退出别人的银啪队伍或把别人踢出自己的队伍'
  }, {
    icon: 20,
    title: '打工赚钱',
    desc: '有些事,是需要代价的'
  }, {
    icon: 20,
    title: '逛街',
    desc: '出门解锁更多玩法和随机事件'
  }, {
    icon: 20,
    title: '我的彩票',
    desc: '查看当前购买的彩票'
  }, {
    icon: 20,
    title: '虚空彩球兑换',
    desc: '兑换当期奖励'
  }, {
    icon: 20,
    title: '抱抱@老婆',
    desc: '抱抱增加好感度'
  }, {
    icon: 20,
    title: '开始银啪',
    desc: '?'
  }, {
    icon: 20,
    title: '群cp',
    desc: '看看本群的cp们'
  }, {
    icon: 20,
    title: '家庭信息',
    desc: '看看家,看看资产'
  }, {
    icon: 20,
    title: '虚空清除无效存档',
    desc: '部分指令无响应时使用'
  }]
}, {
  group: '管理命令，仅bot管理员可用',
  auth: 'master',
  list: [{
    icon: 40,
    title: '#虚空设置/回收权能',
    desc: '赋予/撤销一名群员特殊权能'
  }, {
    icon: 40,
    title: '虚空重置时间',
    desc: '清除本群的时间记录,at则清除对方的'
  }, {
    icon: 40,
    title: '#虚空彩球开奖',
    desc: '顾名思义'
  }]
}, {
  group: '测试功能',
  auth: 'master',
  list: [{
    icon: 40,
    title: '#虚空cp文生成',
    desc: '本地生成cp文的（不太确定能不能用）'
    }, {
}]

}]
export const isSys = true
