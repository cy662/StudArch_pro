# Supabase 数据库备份指南

## 概述

本指南介绍了如何备份 Supabase 数据库中的内容和数据。提供了多种备份方法，包括使用 SQL 脚本、Node.js 脚本和 Supabase 官方工具。

## 方法一：使用 SQL 脚本备份（推荐）

### 1. 使用简化版备份脚本

项目中已包含 [simple_supabase_backup.sql](simple_supabase_backup.sql) 脚本，可在 Supabase 控制台中直接运行：

1. 登录 Supabase 控制台
2. 进入 "SQL Editor"
3. 打开 [simple_supabase_backup.sql](simple_supabase_backup.sql) 文件
4. 复制内容到 SQL Editor
5. 点击 "RUN" 执行

该脚本将显示：
- 数据库基本信息
- 所有表的清单
- 每个表的结构和前5条记录
- 索引和外键约束信息
- 数据统计摘要

### 2. 使用完整备份脚本

项目中还包含 [complete_supabase_backup.sql](complete_supabase_backup.sql) 脚本，可生成完整的 INSERT 语句用于数据恢复。

## 方法二：使用 Node.js 脚本备份

### 1. 检查数据库结构和数据

运行以下命令检查数据库中的所有表和数据：

```bash
npm run check-db
```

该脚本将：
- 连接到 Supabase 数据库
- 列出所有表
- 显示每个表的结构
- 显示每个表的记录数和示例数据

### 2. 导出数据库数据

运行以下命令导出数据库数据：

```bash
npm run export-db
```

该脚本将：
- 连接到 Supabase 数据库
- 导出所有表的数据
- 生成 [supabase_data_export.sql](supabase_data_export.sql) 文件

## 方法三：使用 Supabase CLI 备份（推荐用于生产环境）

### 1. 安装 Supabase CLI

```bash
npm install -g supabase
```

### 2. 配置 Supabase CLI

```bash
supabase init
supabase link --project-ref YOUR_PROJECT_ID
```

### 3. 备份数据库

```bash
supabase db dump --file backup.sql
```

## 方法四：使用 Supabase 控制台备份

1. 登录 Supabase 控制台
2. 进入 "Database" > "Backups"
3. 点击 "Create backup"
4. 等待备份完成
5. 下载备份文件

## 备份文件说明

项目中包含以下备份相关文件：

- [supabase_full_backup.sql](supabase_full_backup.sql) - 完整的数据库结构备份
- [simple_supabase_backup.sql](simple_supabase_backup.sql) - 简化版数据库检查脚本
- [complete_supabase_backup.sql](complete_supabase_backup.sql) - 完整数据导出脚本
- [export_supabase_data.js](export_supabase_data.js) - Node.js 数据导出脚本
- [check_supabase_tables.js](check_supabase_tables.js) - Node.js 数据库检查脚本

## 注意事项

1. **安全提醒**：备份文件可能包含敏感数据，请妥善保管
2. **定期备份**：建议定期执行备份操作
3. **测试恢复**：备份后应测试数据恢复流程
4. **版本控制**：将备份脚本纳入版本控制，但不要将包含真实数据的备份文件提交到代码库

## 故障排除

### 连接问题

如果遇到连接问题，请检查：
1. `.env` 文件中的 Supabase 配置是否正确
2. 网络连接是否正常
3. Supabase 项目是否正常运行

### 权限问题

如果遇到权限问题，请确保：
1. 使用 Service Role Key 而不是匿名密钥
2. 在 Supabase 控制台中检查用户权限设置

## 相关文档

- [Supabase 官方备份文档](https://supabase.com/docs/guidelines-and-limitations)
- [DATABASE_SETUP_GUIDE.md](DATABASE_SETUP_GUIDE.md) - 数据库设置指南
- [Supabase配置说明.md](Supabase配置说明.md) - Supabase 配置说明