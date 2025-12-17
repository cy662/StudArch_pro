# 修复教师认证问题

## 问题描述
在前端页面中出现 "未获取到当前教师ID" 的错误，导致培养方案导入功能无法正常工作。

## 错误原因
1. `useAuth` 钩子可能没有正确获取用户信息
2. 用户登录后token存储但认证状态检查失败
3. 可能存在异步加载时序问题

## 解决方案

### 方案1：手动登录教师账号
1. 打开浏览器开发者工具
2. 清除localStorage: `localStorage.clear()`
3. 重新登录教师账号：
   - 用户名: `teacher_zhang`
   - 密码: `123456`

### 方案2：检查认证状态
在浏览器控制台执行以下代码检查认证状态：
```javascript
console.log('Token:', localStorage.getItem('auth_token'));
console.log('User:', localStorage.getItem('user_info'));

// 如果没有用户信息，手动设置一个测试教师
const testTeacher = {
  id: '11111111-1111-1111-1111-111111111121',
  username: 'teacher_zhang',
  full_name: '张老师',
  role: { role_name: 'teacher' }
};
localStorage.setItem('user_info', JSON.stringify(testTeacher));

// 刷新页面
window.location.reload();
```

### 方案3：代码修复
如果问题持续，可以在 `useAuth.ts` 中添加localStorage备份逻辑：

```typescript
// 在 checkAuthStatus 函数开始处添加
const storedUser = localStorage.getItem('user_info');
if (storedUser) {
  try {
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role?.role_name) {
      setUser(parsedUser);
      setLoading(false);
      return;
    }
  } catch (error) {
    console.error('解析localStorage用户信息失败:', error);
  }
}
```

## 快速测试
1. 执行上述方案2中的代码
2. 刷新页面
3. 尝试导入培养方案功能
4. 查看控制台是否还有错误

## 验证步骤
1. 登录教师账号
2. 进入教师学生列表页面
3. 检查控制台调试信息
4. 确认能正常获取教师ID
5. 测试培养方案导入功能

## 注意事项
- 确保使用的是教师账号，不是学生或管理员账号
- 密码区分大小写
- 如果使用模拟模式，确保环境变量配置正确