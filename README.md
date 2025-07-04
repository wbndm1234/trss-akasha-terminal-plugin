# TRSS Akasha Terminal Plugin

![:动态访问量](https://count.kjchmc.cn/get/@:xtower-plugin)


一个功能丰富的Yunzai-Bot插件（trss版本单独开发版），提供完整的游戏系统、MySQL数据库支持和Web管理界面。

## 🌟 主要功能

### 游戏系统
- **战斗系统**: 经验获取、等级提升、特权系统
- **情侣系统**: 表白、结婚、情侣任务、约会、决斗
- **商店系统**: 物品购买、背包管理
- **任务系统**: 每日任务、冒险任务
- **合成系统**: 物品合成、分解、工坊升级
- **家园系统**: 房屋建设、装饰

### 数据存储
- **JSON存储**: 传统文件存储方式
- **MySQL存储**: 高性能数据库存储
- **数据同步**: JSON与MySQL双向同步

### Web管理界面
- **用户管理**: 查看、编辑、删除用户数据
- **MySQL管理**: 数据库连接、配置管理
- **数据同步**: 一键同步JSON和MySQL数据
- **统计分析**: 命令使用统计、用户活跃度
- **配置管理**: 在线编辑插件配置
- **数据库查询**: 直接执行SQL查询

## 🚀 快速开始

### 安装插件

使用 git 进行安装

<details>
<summary><b>① (推荐) 使用 Github</b></summary>

```bash
git clone --depth=1 https://github.com/wbndm1234/trss-akasha-terminal-plugin.git ./plugins/trss-akasha-terminal-plugin/
```

</details>

<details>
<summary><b>② (国内) 使用 Gitee</b></summary>

```bash
git clone --depth=1 https://gitee.com/dmqaq/trss-akasha-terminal-plugin.git ./plugins/trss-akasha-terminal-plugin/
```

</details>

<details>
<summary><b>③ (备用) 使用 Gitcode</b></summary>

```bash
git clone --depth=1 https://gitcode.com/dmqaq/trss-akasha-terminal-plugin.git ./plugins/trss-akasha-terminal-plugin/
```

</details>

或者直接下载并解压到 plugins 目录

### 初始化依赖

```bash
cd ./plugins/trss-akasha-terminal-plugin/
pnpm i
```

### 启动服务

```bash
# 启动Web管理界面
#启动webui
```

```bash
# 启动MySQL数据库连接
#启动mysql
```

```bash
# 查看服务状态
#webui状态
#mysql状态
```

## 📋 命令列表

### 管理命令
| 命令 | 说明 |
|------|------|
| `#启动webui` | 启动Web管理界面 |
| `#停止webui` | 停止Web管理界面 |
| `#webui状态` | 查看WebUI运行状态 |
| `#启动mysql` | 连接MySQL数据库 |
| `#停止mysql` | 断开MySQL连接 |
| `#mysql状态` | 查看MySQL连接状态 |
| `#同步json到mysql` | 将JSON数据同步到MySQL |
| `#同步mysql到json` | 将MySQL数据同步到JSON |

### 游戏命令
| 命令 | 说明 |
|------|------|
| `#战斗` | 进行战斗获取经验 |
| `#我的信息` | 查看个人信息 |
| `#表白 @用户` | 向其他用户表白 |
| `#结婚 @用户` | 与其他用户结婚 |
| `#离婚` | 解除婚姻关系 |
| `#商店` | 查看商店物品 |
| `#购买 物品名` | 购买物品 |
| `#背包` | 查看背包物品 |
| `#任务` | 查看可用任务 |
| `#冒险` | 进行冒险任务 |
| `#合成 物品名` | 合成物品 |
| `#分解 物品名` | 分解物品 |

## 🗄️ MySQL配置

### 1. 安装MySQL
确保系统已安装MySQL 5.7+或MariaDB 10.3+

### 2. 创建数据库
```sql
CREATE DATABASE akasha_terminal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'akasha'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON akasha_terminal.* TO 'akasha'@'localhost';
FLUSH PRIVILEGES;
```

### 3. 配置连接
访问WebUI管理界面 (http://localhost:3000)，在MySQL管理页面配置数据库连接信息：
- 主机地址: localhost
- 端口: 3306
- 用户名: akasha
- 密码: your_password
- 数据库名: akasha_terminal

## 🌐 Web管理界面

访问地址: http://localhost:3000

### 功能模块

#### 1. 仪表板
- 总用户数统计
- 命令使用统计
- 成功率分析
- MySQL连接状态

#### 2. MySQL管理
- 数据库连接配置
- 连接状态监控
- 连接测试功能

#### 3. 用户管理
- 用户列表查看
- 用户数据编辑
- 用户数据删除
- 支持多种数据类型：战斗数据、家园数据、商店数据等

#### 4. 数据同步
- JSON → MySQL: 将JSON文件数据导入MySQL
- MySQL → JSON: 将MySQL数据导出到JSON文件

#### 5. 统计信息
- 命令使用频率
- 用户活跃度
- 成功/失败统计

#### 6. 数据库查询
- 在线SQL查询工具
- 表结构查看
- 数据预览

#### 7. 插件配置
- 在线编辑配置文件
- 实时配置更新

## 🔧 配置说明

### 主配置 (config/cfg.js)
```javascript
export const cfg = {
  // WebUI配置
  webui: {
    enabled: true,
    port: 3000,
    host: 'localhost'
  },
  
  // MySQL配置
  mysql: {
    enabled: false,
    autoConnect: false
  },
  
  // 游戏配置
  game: {
    maxLevel: 100,
    expMultiplier: 1.0,
    cooldownEnabled: true
  }
}
```

## 🚨 注意事项

1. **安全性**
   - WebUI默认只监听localhost，生产环境请配置防火墙
   - MySQL密码请使用强密码
   - 定期备份数据库数据

2. **性能优化**
   - 大量用户时建议使用MySQL存储
   - 定期清理过期的统计数据

3. **数据备份**
   - 定期备份JSON文件和MySQL数据
   - 重要操作前建议先备份

## 📞 支持与反馈

如果遇到问题或有功能建议，请：
1. 检查日志文件获取详细错误信息
2. 确认MySQL连接配置正确
3. 验证依赖包是否正确安装
4. 查看WebUI控制台错误信息

### 游戏说明🌈
  使用#trss虚空帮助 查看具体说明

  <h1 align="center"><i>游戏管理⚙</i></h1>
  <details><summary align="center">展开说明</summary>

  |功能   |描述   |
  |---|---|
  |时间管理   |重置群内或指定人被计入的时间     |
  |权限管理   |设置或移除指定人的特殊权限   |
  |功能管理   |手动开启一些预先设定好的功能计划   |
  |存档管理   |一键删除错误的存档   |

  </details>
  <h1 align="center" class="群友老婆"><i>分群游戏◧--娶群友❤?!</i></h1>
  <details><summary align="center">展开说明</summary>

  |功能   |描述   |
  |---|---|
  |随机娶群友   |随机娶一位群友,谁都可以   |
  |指定求婚   |娶指定的群友,不可以重婚   |
  |配合求婚   |愿意还是拒绝?   |
  |强娶指定群友   |强行掳走群友   |
  |抢老婆   |联动御前决斗进行抢婚决斗!!! 抢走群友的老婆!   |
  |主动分手,被动甩掉   |不要老婆或被老婆甩掉   |
  |获取金币   |凡是都是需要付出的   |
  |花金币   |钱不能白赚   |
  |随机事件   |处处有惊喜   |
  |查看家庭   |看看和群友构建的家   |
  |开银啪   |牛牛冲!   |
  |更多功能   |敬请期待。或提交Issues   |

  </details>

  <h1 align="center"><i>全局游戏⚪--御前决斗🗡!</i></h1>
  <details><summary align="center">展开说明</summary>

  |功能   |描述   |
  |---|---|
  |决斗系统   |与一名群友开始决斗     |
  |经验系统   |通过各种方式提升经验,突破境界   |
  |战力系统   |战斗时根据战力决定胜率   |
  |签到&委托系统   |做做日常,签个到领取奖励   |
  |抽武器   |抽取武器 后续将加入战力   |
  |更多功能   |敬请期待。或提交Issues   |

  </details>

  <h1 align="center"><i>测试插件😜!</i></h1>
  <details><summary align="center">展开说明</summary>

  |将实现   |描述   |
  |---|---|
  |随机生成cp文   |奇妙的cp文？()     |

  </details>

  <h1 align="center"><i>面向未来🕰!</i></h1>
  <details><summary align="center">展开说明</summary>

  |将实现   |描述   |
  |---|---|
  |银啪   |奇妙的银啪剧情     |
  |商城&合成系统   |合成物品   |
  |房屋容量   |家具?图形化房屋   |

  </details>

#### 常见问题

  <details><summary>展开</summary>

  - 存档路径在哪??
  - 本插件目录内data/qylp(娶群友)/Userxxx/群号.json; UserData(决斗); battle.json(全局)

  - xxx is not defined
  - #重置虚空配置后重启

  - cd怎么改啊,怎么改配置啊
  - config文件夹里
  
  - 娶群友相关功能出现cannot read ... (reading"sex"或者'nickname')
  - 有人老婆或本人退群导致,使用#虚空清除无效存档,即可

  - 上述方法未能解决或我有其他问题!
  
  - 联系我们 Q群 1017886209或PR插件啦，球球了（修不动啊QAQ）
  </details>
   
   ## ❤️ 贡献
  - 这个是原[虚空插件](https://gitee.com/go-farther-and-farther/akasha-terminal-plugin) 仓库，我与原插件作者二创以适配trss崽（喵崽的ICQQ还是太牢了），[越追越远](https://gitee.com/go-farther-and-farther)+[上一刻](https://gitee.com/tyg211375)+[nahida](https://gitee.com/nahida22)+[我](https://gitee.com/dmqaq)来改的代码
  
  **提交 Bug 或建议**：
  - 通过 [GitHub Issues](https://github.com/wbndm1234/trss-akasha-terminal-plugin/issues) 提交问题啦
  - 通过 [GitHub pull requests](https://github.com/wbndm1234/trss-akasha-terminal-plugin/pulls) 提交PR啦
  - 可以来[QQ群](https://qm.qq.com/q/n0ewaCWIGk)玩玩来提点建议捏
 


