import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://mddpbyibesqewcktlqle.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZHBieWliZXNxZXdja3RscWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNTQzNDksImV4cCI6MjA3ODkzMDM0OX0.T8QHCT3UK5f2mp76Oe9-AZpdrmPOFy1wVutxfmg49EU";

console.log('=== 检查数据库当前状态 ===\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseStatus() {
  try {
    console.log('🔗 连接到数据库...');
    console.log('URL:', supabaseUrl);

    // 测试基本连接
    console.log('\n📊 检查表状态...');
    
    const tables = ['users', 'roles', 'system_settings'];
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('count', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
          if (error.message.includes('infinite recursion')) {
            console.log('💡 检测到RLS策略递归问题，需要执行修复脚本');
          }
        } else {
          console.log(`✅ ${table}: ${data} 条记录`);
        }
      } catch (err) {
        console.log(`❌ ${table}: 访问失败 - ${err.message}`);
      }
    }

    console.log('\n🔍 问题诊断:');
    console.log('如果看到 "infinite recursion" 错误，说明RLS策略配置有问题');
    console.log('解决方案：在Supabase SQL Editor中执行 fix_rls_recursion.sql');
    
    console.log('\n📝 下一步操作:');
    console.log('1. 登录 https://supabase.com/dashboard');
    console.log('2. 选择项目: mddpbyibesqewcktlqle');
    console.log('3. 进入 SQL Editor');
    console.log('4. 执行 fix_rls_recursion.sql 脚本');
    console.log('5. 重新运行 node check_login_issue.mjs 验证修复');

  } catch (err) {
    console.error('检查失败:', err.message);
  }
}

checkDatabaseStatus();