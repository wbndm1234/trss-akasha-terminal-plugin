import lodash from 'lodash'
import path from 'path'
import { _paths, cfg } from '#guoba.platform'

// 支持锅巴
export function supportGuoba () {
  return {
      pluginInfo: {
      name: 'trss-akasha-terminal-plugin',
      title: '虚空插件trss版',
      author: ['@我不能倒霉','@nahida'],
      authorLink: ['https://gitee.com/dmqaq','https://gitee.com/nahida22'],
      link: 'https://gitee.com/dmqaq/trss-akasha-terminal-plugin',
      isV3: true,
      isV2: false,
      showInMenu: 'auto',
      description: '提供企鹅群游戏，目前实现了群内决斗，娶群友等有趣的小游戏（重做+更多功能插件来适配trss崽）',
      icon: 'mdi:stove',
      iconColor: '#d19f56',
      iconPath: path.join(_paths.pluginRoot, 'resources/虚空终端.png')
    },
    // 配置项信息
    configInfo: {
      schemas: [
        {
          label: '基础配置',
          component: 'SOFT_GROUP_BEGIN'
        },

        {
          label: '冷却时间配置',
          component: 'SOFT_GROUP_BEGIN'
        },
        {
          field: 'enhanced_wife_system.date_cooldown',
          label: '约会冷却时间(秒)',
          bottomHelpMessage: '增强老婆系统约会功能的冷却时间',
          component: 'InputNumber',
          componentProps: {
            min: 0,
            max: 86400,
            placeholder: '请输入冷却时间'
          }
        },
        {
          field: 'enhanced_wife_system.confession_cooldown',
          label: '表白冷却时间(秒)',
          bottomHelpMessage: '增强老婆系统表白功能的冷却时间',
          component: 'InputNumber',
          componentProps: {
            min: 0,
            max: 86400,
            placeholder: '请输入冷却时间'
          }
        },
        {
          field: 'enhanced_wife_system.propose_cooldown',
          label: '求婚冷却时间(秒)',
          bottomHelpMessage: '增强老婆系统求婚功能的冷却时间',
          component: 'InputNumber',
          componentProps: {
            min: 0,
            max: 86400,
            placeholder: '请输入冷却时间'
          }
        },
        {
          field: 'enhanced_wife_system.confession_wait',
          label: '表白等待时间(秒)',
          bottomHelpMessage: '表白等待时间',
          component: 'InputNumber',
          componentProps: {
            min: 0,
            max: 3600,
            placeholder: '请输入等待时间'
          }
        },
        {
          field: 'quest_system.daily_refresh',
          label: '每日任务刷新时间(秒)',
          bottomHelpMessage: '每日任务刷新的时间间隔',
          component: 'InputNumber',
          componentProps: {
            min: 0,
            max: 604800,
            placeholder: '请输入刷新时间'
          }
        },
        {
          field: 'quest_system.weekly_refresh',
          label: '周常任务刷新时间(秒)',
          bottomHelpMessage: '周常任务刷新的时间间隔',
          component: 'InputNumber',
          componentProps: {
            min: 0,
            max: 604800,
            placeholder: '请输入刷新时间'
          }
        },
        {
          field: 'quest_system.special_refresh',
          label: '特殊任务刷新时间(秒)',
          bottomHelpMessage: '特殊任务刷新的时间间隔',
          component: 'InputNumber',
          componentProps: {
            min: 0,
            max: 604800,
            placeholder: '请输入刷新时间'
          }
        },
        {
          field: 'quest_system.quest_complete_delay',
          label: '任务完成延迟(秒)',
          bottomHelpMessage: '任务完成的延迟时间',
          component: 'InputNumber',
          componentProps: {
            min: 0,
            max: 60,
            placeholder: '请输入延迟时间'
          }
        },
        {
          field: 'shop_system.signin_cooldown',
          label: '签到冷却时间(秒)',
          bottomHelpMessage: '商城系统签到功能的冷却时间',
          component: 'InputNumber',
          componentProps: {
            min: 0,
            max: 86400,
            placeholder: '请输入冷却时间'
          }
        },
        {
          field: 'shop_system.streak_expire',
          label: '连续签到过期时间(秒)',
          bottomHelpMessage: '连续签到过期时间',
          component: 'InputNumber',
          componentProps: {
            min: 0,
            max: 604800,
            placeholder: '请输入过期时间'
          }
        },
        {
          field: 'shop_system.protection_duration',
          label: '保护效果持续时间(秒)',
          bottomHelpMessage: '保护效果持续时间',
          component: 'InputNumber',
          componentProps: {
            min: 0,
            max: 604800,
            placeholder: '请输入持续时间'
          }
        },
        {
          field: 'shop_system.luck_duration',
          label: '幸运效果持续时间(秒)',
          bottomHelpMessage: '幸运效果持续时间',
          component: 'InputNumber',
          componentProps: {
            min: 0,
            max: 604800,
            placeholder: '请输入持续时间'
          }
        },
        {
          field: 'shop_system.workboost_duration',
          label: '打工加成持续时间(秒)',
          bottomHelpMessage: '打工加成持续时间',
          component: 'InputNumber',
          componentProps: {
            min: 0,
            max: 604800,
            placeholder: '请输入持续时间'
          }
        },
        {
          field: 'synthesis_system.synthesis_cooldown',
          label: '合成冷却时间(秒)',
          bottomHelpMessage: '合成系统的冷却时间',
          component: 'InputNumber',
          componentProps: {
            min: 0,
            max: 3600,
            placeholder: '请输入冷却时间'
          }
        },
        {
          field: 'synthesis_system.decompose_cooldown',
          label: '分解冷却时间(秒)',
          bottomHelpMessage: '分解系统的冷却时间',
          component: 'InputNumber',
          componentProps: {
            min: 0,
            max: 3600,
            placeholder: '请输入冷却时间'
          }
        },
        {
          field: 'synthesis_system.batch_synthesis_delay',
          label: '批量合成延迟(秒)',
          bottomHelpMessage: '批量合成的延迟时间',
          component: 'InputNumber',
          componentProps: {
            min: 0,
            max: 60,
            placeholder: '请输入延迟时间'
          }
        },
        {
          field: 'other_systems.gacha_cooldown',
          label: '抽卡冷却时间(秒)',
          bottomHelpMessage: '抽卡系统的冷却时间',
          component: 'InputNumber',
          componentProps: {
            min: 0,
            max: 3600,
            placeholder: '请输入冷却时间'
          }
        },
        {
          field: 'other_systems.duel_cooldown',
          label: '决斗冷却时间(秒)',
          bottomHelpMessage: '决斗系统的冷却时间',
          component: 'InputNumber',
          componentProps: {
            min: 0,
            max: 3600,
            placeholder: '请输入冷却时间'
          }
        },
        {
          field: 'other_systems.exercise_cooldown',
          label: '修炼冷却时间(秒)',
          bottomHelpMessage: '修炼系统的冷却时间',
          component: 'InputNumber',
          componentProps: {
            min: 0,
            max: 7200,
            placeholder: '请输入冷却时间'
          }
        },
        {
          field: 'other_systems.breakthrough_cooldown',
          label: '突破冷却时间(秒)',
          bottomHelpMessage: '突破系统的冷却时间',
          component: 'InputNumber',
          componentProps: {
            min: 0,
            max: 7200,
            placeholder: '请输入冷却时间'
          }
        },
        {
          field: 'other_systems.idcard_cooldown',
          label: '身份证查询冷却时间(秒)',
          bottomHelpMessage: '身份证查询的冷却时间',
          component: 'InputNumber',
          componentProps: {
            min: 0,
            max: 300,
            placeholder: '请输入冷却时间'
          }
        },
        {
          field: 'other_systems.cpwsc_cooldown',
          label: '猜拳冷却时间(秒)',
          bottomHelpMessage: '猜拳系统的冷却时间',
          component: 'InputNumber',
          componentProps: {
            min: 0,
            max: 300,
            placeholder: '请输入冷却时间'
          }
        },
        {
          field: 'wife_system.random_marry_cooldown',
          label: '随机娶群友冷却(秒)',
          bottomHelpMessage: '随机娶群友功能的冷却时间',
          component: 'InputNumber',
          componentProps: {
            min: 0,
            max: 3600,
            placeholder: '请输入冷却时间'
          }
        },
        {
          field: 'wife_system.force_marry_cooldown',
          label: '强娶冷却时间(秒)',
          bottomHelpMessage: '强娶功能的冷却时间',
          component: 'InputNumber',
          componentProps: {
            min: 0,
            max: 3600,
            placeholder: '请输入冷却时间'
          }
        },
        {
          field: 'wife_system.work_cooldown',
          label: '打工冷却时间(秒)',
          bottomHelpMessage: '老婆系统打工功能的冷却时间',
          component: 'InputNumber',
          componentProps: {
            min: 0,
            max: 7200,
            placeholder: '请输入冷却时间'
          }
        },
        {
          field: 'wife_system.hug_cooldown',
          label: '抱抱冷却时间(秒)',
          bottomHelpMessage: '抱抱功能的冷却时间',
          component: 'InputNumber',
          componentProps: {
            min: 0,
            max: 3600,
            placeholder: '请输入冷却时间'
          }
        },
        {
          field: 'wife_system.shopping_cooldown',
          label: '逛街冷却时间(秒)',
          bottomHelpMessage: '逛街功能的冷却时间',
          component: 'InputNumber',
          componentProps: {
            min: 0,
            max: 3600,
            placeholder: '请输入冷却时间'
          }
        },
        {
          field: 'wife_system.steal_wife_cooldown',
          label: '抢老婆冷却时间(秒)',
          bottomHelpMessage: '抢老婆功能的冷却时间',
          component: 'InputNumber',
          componentProps: {
            min: 0,
            max: 7200,
            placeholder: '请输入冷却时间'
          }
        },
        {
          field: 'wife_system.welfare_cooldown',
          label: '低保冷却时间(秒)',
          bottomHelpMessage: '低保功能的冷却时间',
          component: 'InputNumber',
          componentProps: {
            min: 0,
            max: 14400,
            placeholder: '请输入冷却时间'
          }
        },
        {
          field: 'wife_system.lottery_cooldown',
          label: '获取虚空彩球冷却时间(秒)',
          bottomHelpMessage: '获取虚空彩球功能的冷却时间',
          component: 'InputNumber',
          componentProps: {
            min: 0,
            max: 7200,
            placeholder: '请输入冷却时间'
          }
        }
      ],
      // 获取配置数据方法（用于前端填充显示数据）
      getConfigData () {
        let config = lodash.omit(cfg.merged, 'jwt')
        let host = lodash.get(config, 'server.host')
        if (Array.isArray(host)) {
          lodash.set(config, 'server.host', host[0])
        }
        return config
      },
      // 设置配置的方法（前端点确定后调用的方法）
      setConfigData (data, { Result }) {
        let config = {}
        for (let [keyPath, value] of Object.entries(data)) {
          // 特殊处理 server.host
          if (keyPath === 'server.host') {
            let host = cfg.get('server.host')
            if (Array.isArray(host)) {
              host[0] = value
              value = host
            }
          }
          lodash.set(config, keyPath, value)
        }
        config = lodash.merge({}, cfg.merged, config)
        cfg.config.reader.setData(config)
        return Result.ok({}, '唔，您的配置已更新，ok啦~')
      }
    }
  }
}
