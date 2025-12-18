# 快速认证修复指南

## 🚀 修复"未获取到当前教师ID"错误

### 问题描述
当尝试导入培养方案时，出现以下错误：
- `未获取到当前教师ID`
- `缺少用户ID信息`

### 🔧 快速修复步骤

#### 方法1：浏览器控制台修复（推荐）
1. 打开浏览器开发者工具 (F12)
2. 在Console标签中执行以下代码：

```javascript
// 设置测试教师账号
const testTeacher = {
  id: '11111111-1111-1111-1111-111111111121',
  username: 'teacher_zhang',
  full_name: '张老师',
  role: { role_name: 'teacher' },
  role_id: '2'
};

// 保存到localStorage
localStorage.setItem('user_info', JSON.stringify(testTeacher));
localStorage.setItem('auth_token', btoa(JSON.stringify({
  userId: testTeacher.id,
  username: testTeacher.username,
  role: 'teacher',
  timestamp: Date.now()
})));

// 刷新页面
console.log('✅ 教师账号设置完成，请刷新页面');
window.location.reload();
```

#### 方法2：重新登录
1. 退出当前账号
2. 使用以下凭据重新登录：
   - 用户名：`teacher_zhang`
   - 密码：`123456`

#### 方法3：清除缓存重新登录
1. 打开开发者工具
2. 右键刷新按钮，选择"清空缓存并硬性重新加载"
3. 重新登录教师账号

### ✅ 验证修复
修复后应该看到：
1. 控制台显示：`✅ 从localStorage恢复教师信息成功`
2. 能正常获取教师学生列表
3. 培养方案导入功能正常工作
4. 不再出现"未获取到当前教师ID"错误

### 🎯 测试功能
修复完成后，请测试：
1. 查看教师学生列表
2. 下载培养方案模板
3. 导入培养方案Excel文件
4. 分配培养方案给学生

### 💡 注意事项
- 此修复为临时解决方案，用于测试功能
- 生产环境中请确保正常的认证流程
- 测试完成后建议重新登录以确保认证状态正确