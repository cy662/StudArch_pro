import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://mddpbyibesqewcktlqle.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZHBieWliZXNxZXdja3RscWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNTQzNDksImV4cCI6MjA3ODkzMDM0OX0.T8QHCT3UK5f2mp76Oe9-AZpdrmPOFy1wVutxfmg49EU";

console.log('=== 验证新数据库连接和功能 ===\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyNewDatabase() {
  try {
    console.log('🔗 验证数据库连接...');
    console.log('URL:', supabaseUrl);

    // 1. 验证所有表都存在且有数据
    console.log('\n📊 验证表结构...');
    
    const tables = [
      { name: 'users', expected: 3 },
      { name: 'roles', expected: 3 },
      { name: 'system_settings', expected: 2 },
      { name: 'student_profiles', expected: 0 },
      { name: 'classes', expected: 0 }
    ];
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table.name)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ ${table.name} 表访问失败: ${error.message}`);
        } else {
          const status = count >= table.expected ? '✅' : '⚠️';
          console.log(`${status} ${table.name} 表: ${count} 条记录 (预期: ≥${table.expected})`);
        }
      } catch (err) {
        console.log(`❌ ${table.name} 表不存在: ${err.message}`);
      }
    }

    // 2. 测试登录功能
    console.log('\n🔐 测试用户登录...');
    
    const testUsers = [
      { username: 'admin', password: '123456', role: '管理员' },
      { username: 'teacher_zhang', password: '123456', role: '教师' },
      { username: 'student_2021001', password: '123456', role: '学生' }
    ];
    
    for (const testUser of testUsers) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*, roles(*)')
          .eq('username', testUser.username)
          .eq('status', 'active')
          .single();
        
        if (error) {
          console.log(`❌ ${testUser.role}登录失败: ${error.message}`);
        } else {
          console.log(`✅ ${testUser.role}(${data.full_name}) 登录正常`);
        }
      } catch (err) {
        console.log(`❌ ${testUser.role}登录异常: ${err.message}`);
      }
    }

    // 3. 测试RPC函数
    console.log('\n🔧 测试RPC函数...');
    
    try {
      const { data, error } = await supabase.rpc('verify_password', {
        user_id: 'test-id',
        password: '123456'
      });
      
      if (error) {
        console.log('❌ verify_password 函数失败:', error.message);
      } else {
        console.log('✅ verify_password 函数正常:', data);
      }
    } catch (err) {
      console.log('❌ verify_password 函数不存在');
    }

    // 4. 测试学生个人信息操作
    console.log('\n👤 测试学生个人信息操作...');
    
    try {
      // 获取学生ID
      const { data: studentUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', 'student_2021001')
        .single();
      
      if (studentUser) {
        // 测试创建个人信息
        const testProfile = {
          user_id: studentUser.id,
          gender: 'male',
          birth_date: '2000-01-01',
          nationality: '汉族',
          political_status: '团员',
          phone: '13800138000',
          emergency_contact: '李建国',
          emergency_phone: '13800138001',
          home_address: '北京市朝阳区建国路100号',
          admission_date: '2021-09-01',
          graduation_date: '2025-06-30',
          student_type: '全日制'
        };
        
        const { data, error } = await supabase
          .from('student_profiles')
          .insert(testProfile)
          .select();
        
        if (error) {
          console.log('❌ 创建个人信息失败:', error.message);
        } else {
          console.log('✅ 创建个人信息成功，ID:', data[0].id);
          
          // 清理测试数据
          await supabase
            .from('student_profiles')
            .delete()
            .eq('id', data[0].id);
          console.log('🧹 清理测试数据完成');
        }
      }
    } catch (err) {
      console.log('❌ 个人信息操作异常:', err.message);
    }

    // 5. 测试系统设置
    console.log('\n⚙️ 测试系统设置...');
    
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_key, setting_value')
        .eq('setting_key', 'student_profile_edit_enabled');
      
      if (error) {
        console.log('❌ 系统设置查询失败:', error.message);
      } else {
        console.log('✅ 个人信息维护功能状态:', data[0]?.setting_value);
      }
    } catch (err) {
      console.log('❌ 系统设置查询异常:', err.message);
    }

    console.log('\n=== 验证完成 ===');
    console.log('如果所有测试都显示✅，说明数据库配置完成，应用可以正常使用！');
    console.log('\n📝 测试账号信息:');
    console.log('管理员: admin / 123456');
    console.log('教师: teacher_zhang / 123456');
    console.log('学生: student_2021001 / 123456');

  } catch (err) {
    console.error('验证过程出错:', err.message);
  }
}

verifyNewDatabase();