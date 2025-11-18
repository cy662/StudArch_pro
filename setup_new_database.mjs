import { createClient } from '@supabase/supabase-js';

// 你新的Supabase配置
const supabaseUrl = "https://mddpbyibesqewcktlqle.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZHBieWliZXNxZXdja3RscWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNTQzNDksImV4cCI6MjA3ODkzMDM0OX0.T8QHCT3UK5f2mp76Oe9-AZpdrmPOFy1wVutxfmg49EU";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZHBieWliZXNxZXdja3RscWxlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM1NDM0OSwiZXhwIjoyMDc4OTMwMzQ5fQ.P2Y3IaRqJn6Tf7NjaHztGSd__3bTb_aBVioKoIK9Rq8";

console.log('=== 连接到你的新Supabase数据库 ===\n');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAndSetupDatabase() {
  try {
    console.log('🔗 测试数据库连接...');
    console.log('URL:', supabaseUrl);
    console.log('Anon Key:', supabaseAnonKey.substring(0, 20) + '...\n');

    // 1. 检查数据库是否为空
    console.log('📊 检查当前数据库状态...');
    
    const tables = ['users', 'roles', 'student_profiles', 'system_settings', 'classes'];
    const tableStatus = {};
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        tableStatus[table] = {
          exists: !error,
          count: count || 0,
          error: error?.message
        };
        
        if (error) {
          console.log(`❌ ${table} 表: ${error.message}`);
        } else {
          console.log(`✅ ${table} 表: ${count || 0} 条记录`);
        }
      } catch (err) {
        tableStatus[table] = {
          exists: false,
          count: 0,
          error: err.message
        };
        console.log(`❌ ${table} 表: 不存在或无法访问`);
      }
    }

    // 2. 如果数据库为空，提示需要初始化
    const isEmpty = Object.values(tableStatus).every(status => !status.exists || status.count === 0);
    
    if (isEmpty) {
      console.log('\n🚨 数据库为空，需要初始化表结构！');
      console.log('请按照以下步骤操作：\n');
      console.log('1. 登录你的Supabase控制台: https://supabase.com/dashboard');
      console.log('2. 选择项目: mddpbyibesqewcktlqle');
      console.log('3. 进入 SQL Editor');
      console.log('4. 执行以下初始化脚本:\n');
      
      console.log('```sql');
      console.log('-- 执行 complete_database_setup.sql 中的完整脚本');
      console.log('-- 然后执行 student_profile_management.sql 中的脚本');
      console.log('-- 最后执行 fix_database_permissions.sql 中的脚本');
      console.log('```');
      
      return;
    }

    // 3. 测试数据操作
    if (tableStatus.users?.exists) {
      console.log('\n🧪 测试数据操作...');
      
      // 测试查询用户
      try {
        const { data, error } = await supabase
          .from('users')
          .select('count', { count: 'exact', head: true });
        
        if (error) {
          console.log('❌ 查询用户失败:', error.message);
        } else {
          console.log('✅ 查询用户正常，记录数:', data);
        }
      } catch (err) {
        console.log('❌ 查询用户异常:', err.message);
      }
    }

    // 4. 测试插入测试用户（如果表存在）
    if (tableStatus.users?.exists && tableStatus.roles?.exists) {
      console.log('\n👤 测试插入用户数据...');
      
      try {
        // 先检查是否有测试用户
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('username', 'student_2021001')
          .single();
        
        if (existingUser) {
          console.log('✅ 测试用户已存在');
        } else {
          // 插入测试用户
          const { data: newUser, error } = await supabase
            .from('users')
            .insert({
              username: 'student_2021001',
              email: 'student_2021001@example.com',
              user_number: '2021001',
              full_name: '李小明',
              password_hash: '$2a$10$rOz8R7lTQyX3c8k8V7M8Ou', // 密码: 123456
              role_id: 3,
              status: 'active',
              phone: '13800138000',
              department: '计算机学院',
              grade: '2021级',
              class_name: '计算机科学与技术1班'
            })
            .select()
            .single();
          
          if (error) {
            console.log('❌ 插入测试用户失败:', error.message);
          } else {
            console.log('✅ 插入测试用户成功:', newUser.username);
          }
        }
      } catch (err) {
        console.log('❌ 插入测试用户异常:', err.message);
      }
    }

    console.log('\n=== 连接测试完成 ===');
    console.log('如果大部分测试都通过，说明连接正常');
    console.log('如果表不存在，请先在Supabase控制台执行数据库初始化脚本');

  } catch (err) {
    console.error('连接测试失败:', err.message);
  }
}

testAndSetupDatabase();