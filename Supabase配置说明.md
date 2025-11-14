# Supabase配置说明

## 问题描述
个人信息维护页面无法加载，原因是缺少Supabase环境变量配置。

## 解决方案

### 步骤1：获取Supabase项目配置

1. 登录 [Supabase官网](https://supabase.com)
2. 进入你的项目控制台
3. 点击左侧菜单中的 "Settings" → "API"
4. 复制以下信息：
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **anon public**: 你的anon公钥

### 步骤2：配置环境变量

修改 `d:/lyc123/poject/download-APP_GENERATION/app_567616553474/.env.local` 文件：

```env
# Supabase配置 - 请替换为你的实际配置
VITE_SUPABASE_URL=https://your-actual-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-supabase-anon-key

# 开发环境配置
VITE_APP_ENV=development
```

### 步骤3：立即启动（临时解决方案）

如果你想立即测试页面功能，可以创建一个临时的解决方案：

1. 修改 `src/lib/supabase.ts` 文件，添加模拟数据：

```typescript
import { createClient } from '@supabase/supabase-js'

// 模拟数据（仅用于测试）
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase
```

### 步骤4：检查控制台错误

1. 打开浏览器开发者工具（F12）
2. 查看Console标签页的错误信息
3. 根据错误信息进一步调试

## 验证步骤

配置完成后，重新启动开发服务器：

```bash
npm run dev
```

然后访问：
- 我的档案：`/student-my-profile`
- 个人信息维护：`/student-profile-edit`

## 故障排除

### 如果仍有问题

1. **检查网络连接**：确保可以访问Supabase服务
2. **检查数据库权限**：确保RLS策略正确配置
3. **查看Supabase日志**：在Supabase控制台查看错误日志

### 快速测试

你也可以直接测试登录功能是否正常：
- 使用学生账号：`student_2021001` / `123456`
- 查看是否能正常跳转到学生仪表板