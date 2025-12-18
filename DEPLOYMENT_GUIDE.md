# 项目部署说明文档

## 1. 项目概述

本项目是一个基于React + TypeScript + Vite的学生培养方案管理系统，包含前端界面和后端API服务，使用Supabase作为数据库解决方案。

### 技术栈
- **前端**: React 19, TypeScript, Vite, Ant Design, TDesign, React Router
- **后端**: Express.js, Multer (文件上传), CORS
- **数据库**: Supabase (PostgreSQL)
- **工具**: npm, concurrently, patch-package

## 2. 环境准备

### 2.1 系统要求
- Node.js: 18.x 或更高版本
- npm: 9.x 或更高版本
- Git: 用于代码管理

### 2.2 安装依赖

```bash
# 检查Node.js版本
node -v

# 检查npm版本
npm -v
```

## 3. 项目安装

### 3.1 克隆代码库

```bash
git clone <repository-url>
cd StudArch_pro
```

### 3.2 安装依赖包

```bash
npm install
```

安装过程中会自动执行 `postinstall` 脚本，应用必要的补丁。

## 4. 配置说明

### 4.1 环境变量配置

创建 `.env.local` 文件并配置以下环境变量：

```env
# Supabase配置 - 请替换为你的实际配置
VITE_SUPABASE_URL=https://your-actual-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-supabase-anon-key

# 开发环境配置
VITE_APP_ENV=development

# API服务器配置（可选）
API_PORT=3001
```

### 4.2 Supabase数据库配置

1. 登录 [Supabase官网](https://supabase.com)
2. 进入你的项目控制台
3. 点击左侧菜单中的 "Settings" → "API"
4. 复制 Project URL 和 anon public 密钥
5. 将这些信息填入 `.env.local` 文件中

## 5. 启动方式

### 5.1 开发模式（同时启动前端和后端）

```bash
npm run start:full
```

该命令会同时启动：
- 前端开发服务器（默认端口：5173）
- 后端API服务器（默认端口：3001）

### 5.2 分别启动前后端

```bash
# 启动后端API服务器
npm run api

# 启动前端开发服务器
npm run dev
```

### 5.3 预览生产构建

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 6. 数据库管理

### 6.1 导出数据库数据

```bash
npm run export-db
```

### 6.2 检查数据库连接

```bash
npm run check-db
```

### 6.3 测试数据库连接

```bash
npm run test-db
```

## 7. 培养方案管理

### 7.1 设置培养方案

```bash
npm run setup-training
```

### 7.2 设置测试用培养方案

```bash
npm run setup-training:test
```

## 8. 项目结构

```
├── src/
│   ├── api/              # 后端API路由
│   ├── components/       # 可复用组件
│   ├── data/             # 数据文件
│   ├── hooks/            # 自定义钩子
│   ├── lib/              # 工具库
│   ├── pages/            # 页面组件
│   ├── router/           # 路由配置
│   ├── services/         # 服务层
│   ├── supabase/         # Supabase相关配置
│   ├── types/            # TypeScript类型定义
│   └── utils/            # 工具函数
├── server.js             # 后端API服务器
├── vite.config.ts        # Vite配置
├── package.json          # 项目配置和依赖
└── .env.local            # 环境变量配置
```

## 9. 构建与部署

### 9.1 生产构建

```bash
npm run build
```

构建产物将生成在 `dist/` 目录中。

### 9.2 部署到生产环境

1. **构建生产版本**
   ```bash
   npm run build
   ```

2. **配置生产环境**
   - 确保生产环境中有Node.js运行时
   - 配置好环境变量
   - 设置适当的端口和域名

3. **启动生产服务器**
   ```bash
   npm run api
   ```

   后端服务器将自动提供前端静态文件。

## 10. 故障排除

### 10.1 常见问题

#### 10.1.1 个人信息维护页面无法加载

**问题原因**: 缺少Supabase环境变量配置

**解决方案**:
1. 检查 `.env.local` 文件中的Supabase配置
2. 确保配置了正确的 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`
3. 重新启动开发服务器

#### 10.1.2 API请求失败

**问题原因**: 后端API服务器未启动或配置错误

**解决方案**:
1. 确保后端API服务器正在运行（端口3001）
2. 检查API路由配置
3. 查看服务器日志以获取详细错误信息

#### 10.1.3 图片上传失败

**问题原因**: 上传目录权限问题或文件大小限制

**解决方案**:
1. 确保 `uploads/` 目录存在且有写入权限
2. 检查服务器配置中的文件大小限制

### 10.2 日志查看

```bash
# 查看后端API服务器日志
npm run api

# 查看前端开发服务器日志
npm run dev
```

## 11. 安全注意事项

1. 不要将实际的Supabase密钥提交到代码库中
2. 生产环境中应使用安全的连接（HTTPS）
3. 定期备份数据库数据
4. 限制API访问权限，避免未授权访问

## 12. 联系方式

如有部署相关问题，请联系项目维护人员。

---

**文档版本**: v1.0  
**最后更新**: 2025-12-15