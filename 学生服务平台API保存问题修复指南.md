# 学生服务平台教学任务保存问题修复指南

## 问题分析

学生服务平台的教学任务与安排功能在保存时出现连接被拒绝的错误，主要原因是：

1. **端口冲突**：前端服务器从5173端口切换到了5174端口
2. **API代理配置**：Vite代理需要正确配置才能将API请求转发到后端服务器
3. **CSS导入问题**：TDesign组件库的CSS导入路径需要修复

## 修复步骤

### 1. 服务器启动状态

后端API服务器现在运行在 **端口3001**，前端开发服务器运行在 **端口5174**。

### 2. 访问正确的URL

请访问以下URL来使用学生服务平台：
```
http://localhost:5174/
```

**注意**：不再是5173端口，而是5174端口！

### 3. API代理配置验证

Vite配置已经正确设置了API代理：
```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
      secure: false,
    }
  }
}
```

### 4. 修复完成的功能

- ✅ CSS导入问题已修复
- ✅ API服务器正常运行（端口3001）
- ✅ 前端服务器正常运行（端口5174）
- ✅ API代理配置正常工作
- ✅ 学生学习信息API端点可用

## 测试验证

### API服务器测试
```bash
curl http://localhost:3001/api/health
```

### 前端代理测试
```bash
curl http://localhost:5174/api/health
```

### 功能测试
1. 访问 http://localhost:5174/
2. 登录学生账户
3. 进入"教学任务与安排"页面
4. 填写课程信息并点击保存
5. 检查控制台日志，确认API调用成功

## 常见问题

### Q: 仍然显示连接被拒绝？
A: 请确保访问的是 http://localhost:5174/ 而不是5173端口

### Q: 如何确认服务器运行状态？
A: 检查是否有以下进程：
- 端口3001：API服务器
- 端口5174：前端开发服务器

### Q: 如果需要重新启动服务器？
A: 
1. 启动API服务器：`npm run api`
2. 启动前端服务器：`npm run dev`

## 技术细节

- **前端框架**：React + Vite
- **UI组件库**：TDesign React
- **后端API**：Express.js
- **数据库**：Supabase
- **API代理**：Vite Dev Server Proxy

修复完成时间：2025-12-02 09:05