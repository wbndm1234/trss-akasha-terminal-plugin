# 虚空终端 - 恋爱日常插件

基于 [astrbot_plugin_akasha_terminal](https://github.com/wbndmqaq/astrbot_plugin_akasha_terminal) 重构的 Yunzai-Bot 版本。

## 🌟 主要功能

### 💘 婚恋关系系统
- `#娶群友` / `#谈恋爱` - 随机追求群友确立恋爱关系
- `#我想和你在一起 @某人` - 向心仪对象表白
- `#我愿意` / `#我拒绝` - 回应表白/求婚
- `#我们分手吧` - 解除情侣关系
- `#我们的结婚证` - 查看结婚证书
- `#家庭信息` - 查看家庭档案

### 🏡 同居生活模拟
- `#写恋爱日记 [内容]` - 记录甜蜜点滴
- `#拍立得 [寄语]` - 生成复古照片
- `#情侣相册` - 查看珍藏照片
- `#一起看电影 [片名]` - 私人影院观影
- `#给 TA 点外卖 [美食]` - 为伴侣点餐
- `#谁做家务` - 掷骰子决定家务分配
- `#亲自下厨 [菜名]` - 为 TA 烹饪美食
- `#恋爱记账 [金额] [用途]` - 记录共同开销

### ✈️ 浪漫旅行
- `#旅行胜地` - 查看可前往的目的地
- `#双人旅行 [目的地]` - 携手环球旅行
- `#旅行足迹` - 查看去过的地方

### 💕 日常互动
- `#抱抱` / `#亲亲` / `#牵手` - 亲密互动
- `#摸摸头` / `#贴贴` - 日常撒娇
- `#情侣签到` - 每日打卡领金币
- `#送礼物 @某人 [名称]` - 赠送礼物
- `#去约会` - 浪漫约会时光

### 💰 经济系统
- `#搞钱养家` - 打工赚钱
- `#领取低保` - 领取救济金
- `#存入小金库 [金额]` - 储蓄赚利息

### 🏆 社交功能
- `#情侣决斗 @某人` - 情侣 PK
- `#最甜情侣榜` - 查看好感度排行
- `#群 CP 名录` - 查看群内所有情侣

## 📦 安装方法

```bash
# 克隆插件到 Yunzai 插件目录
git clone https://github.com/wbndm1234/trss-akasha-terminal-plugin.git ./plugins/trss-akasha-terminal-plugin/

# 或使用 Gitee（国内推荐）
git clone https://gitee.com/dmqaq/trss-akasha-terminal-plugin.git ./plugins/trss-akasha-terminal-plugin/
```

## ⚙️ 配置说明

在 Yunzai 配置文件 `config/config.yaml` 中添加：

```yaml
akasha:
  exempt_users: []  # 特权免冷却用户 QQ 列表
```

## 📋 完整指令列表

发送 `#帮助菜单` 或 `#虚空帮助` 查看详细指令手册。

## 🔧 技术架构

- **纯 JavaScript/ESM** - 无需 Python 依赖
- **Redis 存储** - 高性能数据持久化
- **模块化设计** - 清晰的代码结构
- **异步处理** - 无阻塞运行

## 📄 许可证

MIT License
