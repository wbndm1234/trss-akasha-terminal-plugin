# 冷却时间配置系统

## 概述

虚空终端插件现在支持用户自定义冷却时间配置。所有系统的冷却时间都可以通过 YAML 配置文件进行调整，无需修改代码。

## 配置文件位置

```
config/cooldown_config.yaml
```

## 支持的系统

### 1. 增强老婆系统 (enhanced_wife_system)
- `date_cooldown`: 约会冷却时间
- `confession_cooldown`: 表白冷却时间
- `propose_cooldown`: 求婚冷却时间
- `confession_wait`: 表白等待时间

### 2. 任务系统 (quest_system)
- `daily_refresh`: 每日任务刷新时间
- `weekly_refresh`: 周常任务刷新时间
- `special_refresh`: 特殊任务刷新时间
- `quest_complete_delay`: 任务完成延迟

### 3. 商城系统 (shop_system)
- `signin_cooldown`: 签到冷却时间
- `streak_expire`: 连续签到过期时间
- `protection_duration`: 保护效果持续时间
- `luck_duration`: 幸运效果持续时间
- `workboost_duration`: 打工加成持续时间

### 4. 合成系统 (synthesis_system)
- `synthesis_cooldown`: 合成冷却时间
- `decompose_cooldown`: 分解冷却时间
- `batch_synthesis_delay`: 批量合成延迟

### 5. 其他系统 (other_systems)
- `gacha_cooldown`: 抽卡冷却时间
- `duel_cooldown`: 决斗冷却时间
- `exercise_cooldown`: 修炼冷却时间
- `breakthrough_cooldown`: 突破冷却时间
- `idcard_cooldown`: 身份证查询冷却时间
- `cpwsc_cooldown`: 猜拳冷却时间

### 6. 老婆系统 (wife_system)
- `random_marry_cooldown`: 随机娶群友冷却
- `force_marry_cooldown`: 强娶冷却
- `work_cooldown`: 打工冷却
- `hug_cooldown`: 抱抱冷却
- `shopping_cooldown`: 逛街冷却
- `steal_wife_cooldown`: 抢老婆冷却
- `welfare_cooldown`: 低保冷却
- `lottery_cooldown`: 获取虚空彩球冷却

## 配置示例

```yaml
# 增强老婆系统冷却时间
enhanced_wife_system:
  date_cooldown: 3600        # 约会冷却时间 (1小时)
  confession_cooldown: 1800  # 表白冷却时间 (30分钟)
  propose_cooldown: 3600     # 求婚冷却时间 (1小时)
  confession_wait: 300       # 表白等待时间 (5分钟)

# 商城系统冷却时间
shop_system:
  signin_cooldown: 86400     # 签到冷却时间 (24小时)
  streak_expire: 172800      # 连续签到过期时间 (2天)
  protection_duration: 86400 # 保护效果持续时间 (24小时)
```

## 管理命令

### 查看当前配置
```
#查看冷却配置
#冷却配置
```

### 重新加载配置
```
#重载冷却配置
#刷新冷却配置
```

### 查看帮助
```
#冷却配置帮助
#冷却帮助
```

## 注意事项

1. **时间单位**: 所有时间配置的单位都是秒
2. **无冷却**: 设置为 0 表示无冷却时间
3. **生效方式**: 修改配置后需要使用 `#重载冷却配置` 命令或重启机器人
4. **权限要求**: 只有机器人主人才能执行配置管理命令
5. **备份建议**: 修改配置前建议备份原配置文件

## 推荐设置

### 高活跃群
- 适当缩短冷却时间，提高互动频率
- 建议约会冷却: 1800秒 (30分钟)
- 建议签到冷却: 43200秒 (12小时)

### 低活跃群
- 保持默认或适当延长冷却时间
- 避免功能被滥用

### 测试环境
- 可以将大部分冷却时间设置为较小值
- 便于快速测试功能

## 故障排除

### 配置不生效
1. 检查 YAML 格式是否正确
2. 确认已执行重载命令
3. 查看控制台是否有错误信息

### 配置文件丢失
- 系统会自动使用默认配置
- 可以重新创建配置文件

### 格式错误
- 检查缩进是否正确 (使用空格，不要使用制表符)
- 确认冒号后有空格
- 数值不要加引号

## 技术实现

配置系统使用了以下技术:
- YAML 配置文件解析
- 单例模式的配置管理器
- 文件修改时间检测
- 自动降级到默认配置
- 热重载支持

配置管理器会自动检测配置文件的修改时间，确保获取最新的配置值，同时提供了完善的错误处理和默认值机制。