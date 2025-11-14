// 检查前端应用的用户认证状态
const authToken = localStorage.getItem('auth_token');
const userInfo = localStorage.getItem('user_info');

console.log('=== 前端认证状态检查 ===');
console.log('Auth Token:', authToken ? '存在' : '不存在');
console.log('User Info:', userInfo ? '存在' : '不存在');

if (authToken) {
  try {
    const tokenData = JSON.parse(atob(authToken));
    console.log('Token 数据:', tokenData);
    console.log('用户ID:', tokenData.userId);
    console.log('用户名:', tokenData.username);
    console.log('用户角色:', tokenData.role);
    console.log('Token 时间戳:', new Date(tokenData.timestamp).toLocaleString());
  } catch (error) {
    console.log('Token 解析失败:', error.message);
  }
}

if (userInfo) {
  try {
    const userData = JSON.parse(userInfo);
    console.log('用户信息:', userData);
  } catch (error) {
    console.log('用户信息解析失败:', error.message);
  }
}

// 检查数据库认证状态
console.log('\n=== 数据库认证状态 ===');
console.log('请登录 Supabase 控制台，检查以下项目：');
console.log('1. student_profiles 表的 RLS 策略');
console.log('2. 认证用户的权限设置');
console.log('3. service_role 密钥是否正确配置');