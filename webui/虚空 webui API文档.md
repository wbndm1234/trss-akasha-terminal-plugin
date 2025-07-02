# 虚空 API 文档

## 概述

本文档描述了虚空插件提供的所有 API 接口。WebUI 服务器默认运行在端口 3000 上。

## 基础信息

- **基础URL**: `http://localhost:3000`
- **内容类型**: `application/json`
- **响应格式**: 所有API响应都遵循统一格式：
  ```json
  {
    "success": true/false,//返回正确或者错误
    "data": {}, 
    "error": "错误信息", // 失败时返回的错误信息
    "message": "操作信息" // 可选的操作信息
  }
  ```

## API 端点

### 1. 主页面

#### GET `/`
返回 WebUI 主页面

**响应**: HTML 页面

---

### 2. MySQL 配置管理

#### GET `/api/mysql/config`
获取当前 MySQL 配置信息

**响应示例**:
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "database": "akasha_terminal"
  }
}
```

#### POST `/api/mysql/config`
更新 MySQL 配置

**请求体**:
```json
{
  "enabled": true,
  "host": "localhost",
  "port": 3306,
  "user": "root",
  "password": "password",
  "database": "akasha_terminal"
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "MySQL配置已更新"
}
```

#### POST `/api/mysql/connect`
连接到 MySQL 数据库

**响应示例**:
```json
{
  "success": true,
  "message": "MySQL连接成功"
}
```

#### POST `/api/mysql/disconnect`
断开 MySQL 数据库连接

**响应示例**:
```json
{
  "success": true,
  "message": "MySQL连接已断开"
}
```

#### GET `/api/mysql/status`
获取 MySQL 连接状态

**响应示例**:
```json
{
  "success": true,
  "data": {
    "connected": true
  }
}
```

---

### 3. 数据同步

#### POST `/api/sync/json-to-mysql`
将 JSON 数据同步到 MySQL 数据库

**响应示例**:
```json
{
  "success": true,
  "message": "数据同步完成"
}
```

#### POST `/api/sync/mysql-to-json`
将 MySQL 数据同步到 JSON 文件

**响应示例**:
```json
{
  "success": true,
  "message": "数据同步完成"
}
```

---

### 4. 用户数据管理

#### GET `/api/users`
获取所有用户列表

**响应示例**:
```json
{
  "success": true,
  "data": [
    {"user_id": "114514"},
    {"user_id": "114514"}
  ]
}
```

#### GET `/api/users/:userId/:dataType`
获取指定用户的特定类型数据

**路径参数**:
- `userId`: 用户ID
- `dataType`: 数据类型 

**响应示例**:
```json
{
  "success": true,
  "data": {
    "user_id": "114514",
    "money": 1000,
    "level": 5
  }
}
```

#### PUT `/api/users/:userId/:dataType`
更新指定用户的特定类型数据

**路径参数**:
- `userId`: 用户ID
- `dataType`: 数据类型

**请求体**: 要更新的数据对象

**响应示例**:
```json
{
  "success": true,
  "message": "用户数据已更新"
}
```

#### DELETE `/api/users/:userId`
删除指定用户的所有数据

**路径参数**:
- `userId`: 用户ID

**响应示例**:
```json
{
  "success": true,
  "message": "用户数据已删除"
}
```

---

### 5. 命令统计

#### GET `/api/stats/commands`
获取命令使用统计

**查询参数**:
- `limit`: 限制返回结果数量 (可选，默认100)

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "command": "娶老婆",
      "user_id": "123456789",
      "total_count": 50,
      "success_count": 45,
      "fail_count": 5,
      "last_used": "2025-07-01T12:00:00.000Z"
    }
  ]
}
```

#### GET `/api/stats/users`
获取用户统计信息

**响应示例**:
```json
{
  "success": true,
  "data": {
    "total_users": 15,
    "total_commands": 2847,
    "successful_commands": 2698,
    "failed_commands": 149
  }
}
```

#### GET `/api/stats/ranking`
获取统计排行榜

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "user_id": "123456789",
      "total_commands": 100,
      "success_rate": 95.5
    }
  ]
}
```

---

### 6. 数据库管理

#### GET `/api/database/tables`
获取数据库表信息

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "table_name": "user_battle",
      "row_count": 150
    },
    {
      "table_name": "command_stats",
      "row_count": 2847
    }
  ]
}
```

#### POST `/api/database/query`
执行自定义 SQL 查询

**请求体**:
```json
{
  "query": "SELECT * FROM user_battle LIMIT 10"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "results": [...],
    "rowCount": 10
  }
}
```

#### POST `/api/database/backup`
备份数据库

**响应示例**:
```json
{
  "success": true,
  "message": "数据库备份完成",
  "data": {
    "backup_file": "backup_20250701_120000.sql"
  }
}
```

#### POST `/api/database/restore`
恢复数据库

**请求体**:
```json
{
  "backup_file": "backup_20250701_120000.sql"
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "数据库恢复完成"
}
```

---

### 7. 插件配置

#### GET `/api/plugin/config`
获取插件配置

**响应示例**:
```json
{
  "success": true,
  "data": {
    "plugin_name": "trss-akasha-terminal-plugin",
    "version": "1.0.0",
    "settings": {...}
  }
}
```

#### POST `/api/plugin/config`
更新插件配置

**请求体**: 配置对象

**响应示例**:
```json
{
  "success": true,
  "message": "插件配置已更新"
}
```

---

### 8. 服务器状态

#### GET `/api/server/status`
获取服务器运行状态

**响应示例**:
```json
{
  "success": true,
  "data": {
    "uptime": 3600,
    "memory_usage": "256MB",
    "cpu_usage": "15%",
    "mysql_connected": true
  }
}
```

---

### 9. 日志管理

#### GET `/api/logs/recent`
获取最近的日志记录

**查询参数**:
- `limit`: 限制返回日志数量 (可选，默认100)
- `level`: 日志级别过滤 

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2025-07-01T12:00:00.000Z",
      "level": "INFO",
      "source": "Yunzai",
      "message": "系统启动完成"
    }
  ]
}
```

---

### 10. 插件信息

#### GET `/api/plugins/info`
获取插件信息

**响应示例**:
```json
{
  "success": true,
  "data": {
    "name": "trss-akasha-terminal-plugin",
    "version": "1.0.0",
    "description": "",
    "author": ""
  }
}
```

#### POST `/api/plugins/description`
更新插件描述

**请求体**:
```json
{
  "description": "新的插件描述"
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "插件描述已更新"
}
```

---

## 错误处理

所有API在发生错误时都会返回相应的HTTP状态码和错误信息：

- `400 Bad Request`: 请求参数错误
- `404 Not Found`: 资源不存在
- `500 Internal Server Error`: 服务器内部错误

错误响应格式：
```json
{
  "success": false,
  "error": "具体的错误信息"
}
```

## 使用示例

### JavaScript (Fetch API)
```javascript
// 获取用户统计信息
fetch('/api/stats/users')
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('总用户数:', data.data.total_users);
    } else {
      console.error('错误:', data.error);
    }
  });

// 更新MySQL配置
fetch('/api/mysql/config', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    enabled: true,
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'password',
    database: 'akasha_terminal'
  })
})
.then(response => response.json())
.then(data => {
  console.log(data.message);
});
```

## 注意事项

1. 所有涉及数据库操作的API都需要MySQL连接处于开启状态

## 更新日志

- **v1.0.0**: 初始版本，包含所有基础API功能

---

*本文档最后更新时间: 2025年7月1