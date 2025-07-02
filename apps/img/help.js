import { BotApi, AlemonApi, plugin } from '../../model/api/api.js'
import fs from 'fs'
import lodash from 'lodash'
import puppeteer from '../../../../lib/puppeteer/puppeteer.js'
import cfg from '../../../../lib/config/config.js'
import { Cfg, Common, Data, Version, Plugin_Name, Plugin_Path } from '../../components/index.js'
// import Theme from './help/theme.js'

export class akasha_help extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: '虚空插件_帮助',
      /** 功能描述 */
      dsc: '',
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 2000,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#?(trss虚空)(帮助|版本)$',
          /** 执行方法 */
          fnc: 'message'
        },
        {
          /** 命令正则匹配 */
          reg: '^#?(游戏)(规则|帮助|版本)$',
          /** 执行方法 */
          fnc: 'message2'
        },
        {
          /** 命令正则匹配 */
          reg: '^#?虚空(赞助|发电)$',
          /** 执行方法 */
          fnc: 'sponsor'
        }
      ]
    });
  }
  async sponsor(e) {
    e.reply('虚空插件赞助链接：https://afdian.net/a/akasha667')
  }

  async message(e) {
    return await help(this.e, 'help');
  }
  async message2(e) {
    return await help(this.e, 'help2');
  }
}

async function help(e, key) {
  let custom = {}
  let help = {}

  let { diyCfg, sysCfg } = await Data.importCfg(key)

  custom = help

  let helpConfig = lodash.defaults(diyCfg.helpCfg || {}, custom.helpCfg, sysCfg.helpCfg)
  let helpList = diyCfg.helpList || custom.helpList || sysCfg.helpList
  let helpGroup = []

  lodash.forEach(helpList, (group) => {
    if (group.auth && group.auth === 'master' && !e.isMaster) {
      return true
    }

    lodash.forEach(group.list, (help) => {
      let icon = help.icon * 1
      if (!icon) {
        help.css = 'display:none'
      } else {
        let x = (icon - 1) % 10
        let y = (icon - x - 1) / 10
        help.css = `background-position:-${x * 50}px -${y * 50}px`
      }
    })

    helpGroup.push(group)
  })
  let bg = await rodom()
  let colCount = 3;
  return await Common.render('help/index', {
    helpCfg: helpConfig,
    helpGroup,
    bg,
    colCount,
    // element: 'default'
  }, {
    e,
    scale: 2.0
  })
}

const rodom = async function () {
  var image = fs.readdirSync(`./plugins/trss-akasha-terminal-plugin/resources/help/imgs/`);
  var list_img = [];
  for (let val of image) {
    list_img.push(val)
  }
  var imgs = list_img.length == 1 ? list_img[0] : list_img[lodash.random(0, list_img.length - 1)];
  return imgs;
}

export default akasha_help