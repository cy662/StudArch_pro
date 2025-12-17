const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testAuthStatus() {
  try {
    console.log('🔍 测试认证状态...');
    
    // 检查localStorage中的用户信息
    console.log('\n📱 检查localStorage:');
    const token = localStorage.getItem('auth_token');
    const userInfo = localStorage.getItem('user_info');
    
    console.log('Token存在:', !!token);
    console.log('UserInfo存在:', !!userInfo);
    
    if (token) {
      try {
        const tokenData = JSON.parse(atob(token));
        console.log('Token数据:', tokenData);
      } catch (error) {
        console.error('Token解析失败:', error);
      }
    }
    
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        console.log('用户信息:', user);
      } catch (error) {
        console.error('UserInfo解析失败:', error);
      }
    }
    
    // 检查数据库中的用户
    console.log('\n🗄️ 检查数据库中的教师用户:');
    const { data: teachers, error: teacherError } = await supabase
      .from('users')
      .select('*')
      .eq('role_id', '2')
      .eq('status', 'active')
      .limit(3);
    
    if (teacherError) {
      console.error('查询教师失败:', teacherError.message);
    } else {
      console.log('找到教师用户:', teachers?.length || 0);
      teachers?.forEach((teacher, index) => {
        console.log(`  ${index + 1}. ${teacher.full_name} (${teacher.username}) - ${teacher.id}`);
      });
    }
    
    console.log('\n💡 建议:');
    console.log('1. 确保已正确登录教师账号');
    console.log('2. 检查token是否正确存储在localStorage中');
    console.log('3. 验证useAuth钩子是否正确获取用户信息');
    
  } catch (error) {
    console.error('❌ 测试认证状态失败:', error);
  }
}

// 在浏览器环境中运行
if (typeof window !== 'undefined') {
  testAuthStatus();
} else {
  console.log('此测试需要在浏览器环境中运行');
}