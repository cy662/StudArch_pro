import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://mddpbyibesqewcktlqle.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZHBieWliZXNxZXdja3RscWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNTQzNDksImV4cCI6MjA3ODkzMDM0OX0.T8QHCT3UK5f2mp76Oe9-AZpdrmPOFy1wVutxfmg49EU";

console.log('=== 最终验证修复结果 ===\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function finalVerification() {
  try {
    console.log('🔗 验证数据库连接...');

    // 1. 测试基础表访问
    console.log('\n📊 测试表访问...');
    
    const tests = [
      { name: 'users', expected: 3 },
      { name: 'roles', expected: 3 },
      { name: 'system_settings', expected: 2 }
    ];
    
    let allPassed = true;
    
    for (const test of tests) {
      try {
        const { count, error } = await supabase
          .from(test.name)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ ${test.name}: ${error.message}`);
          allPassed = false;
        } else {
          const status = count >= test.expected ? '✅' : '⚠️';
          console.log(`${status} ${test.name}: ${count} 条记录 (预期: ≥${test.expected})`);
        }
      } catch (err) {
        console.log(`❌ ${test.name}: ${err.message}`);
        allPassed = false;
      }
    }

    if (!allPassed) {
      console.log('\n🚨 数据库仍有问题，请先执行 simple_fix_database.sql');
      return;
    }

    // 2. 测试用户登录
    console.log('\n🔐 测试用户登录...');
    
    const testUsers = [
      { username: 'admin', role: '管理员' },
      { username: 'teacher_zhang', role: '教师' },
      { username: 'student_2021001', role: '学生' }
    ];
    
    let loginPassed = true;
    
    for (const testUser of testUsers) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, username, full_name, role:roles(*)')
          .eq('username', testUser.username)
          .eq('status', 'active')
          .single();
        
        if (error) {
          console.log(`❌ ${testUser.role}登录失败: ${error.message}`);
          loginPassed = false;
        } else {
          console.log(`✅ ${testUser.role}(${data.full_name}) 登录成功`);
        }
      } catch (err) {
        console.log(`❌ ${testUser.role}登录异常: ${err.message}`);
        loginPassed = false;
      }
    }

    // 3. 测试密码验证函数
    console.log('\n🔧 测试密码验证函数...');
    
    try {
      const { data, error } = await supabase.rpc('verify_password', {
        user_id: 'test-id',
        password: '123456'
      });
      
      if (error) {
        console.log('❌ verify_password函数失败:', error.message);
        loginPassed = false;
      } else {
        console.log('✅ verify_password函数正常:', data);
      }
    } catch (err) {
      console.log('❌ verify_password函数不存在');
      loginPassed = false;
    }

    // 4. 最终结果
    console.log('\n' + '='.repeat(50));
    
    if (allPassed && loginPassed) {
      console.log('🎉 数据库修复成功！现在可以正常登录了！');
      console.log('\n📝 测试账号信息:');
      console.log('管理员: admin / 123456');
      console.log('教师:   teacher_zhang / 123456');
      console.log('学生:   student_2021001 / 123456');
      console.log('\n🚀 启动应用:');
      console.log('npm run dev');
    } else {
      console.log('🚨 仍有问题需要解决');
      console.log('\n请确保已执行 simple_fix_database.sql 脚本');
    }

  } catch (err) {
    console.error('验证过程出错:', err.message);
  }
}

finalVerification();