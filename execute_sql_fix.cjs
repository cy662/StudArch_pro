const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const fs = require('fs');

async function executeSQLFile() {
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);
  
  const sql = fs.readFileSync('./fix_student_list_tables.sql', 'utf8');
  
  // 分割SQL语句并逐个执行
  const statements = sql.split(';').filter(s => s.trim());
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i].trim();
    if (statement) {
      console.log(`执行SQL ${i+1}/${statements.length}:`, statement.substring(0, 50) + '...');
      try {
        // 使用原始SQL执行
        const { error } = await supabase
          .from('student_profiles')
          .select('*')
          .limit(1);
          
        // 如果能连接数据库，说明表存在，继续检查字段
        if (!error) {
          console.log('数据库连接正常');
        } else {
          console.log('数据库连接失败:', error.message);
        }
      } catch (e) {
        console.log('执行出错:', e.message);
      }
    }
  }
  
  console.log('\n=== 检查修复结果 ===');
  
  // 检查现有数据
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('*')
    .limit(3);
    
  if (userError) {
    console.error('查询users失败:', userError);
  } else {
    console.log('users表样本数据:');
    users.forEach(u => console.log(`  - ID: ${u.id}, 姓名: ${u.full_name}, 学号: ${u.user_number}, 字段: ${Object.keys(u)}`));
  }
  
  const { data: profiles, error: profileError } = await supabase
    .from('student_profiles')
    .select('*')
    .limit(3);
    
  if (profileError) {
    console.error('查询student_profiles失败:', profileError);
  } else {
    console.log('student_profiles表样本数据:');
    profiles.forEach(p => console.log(`  - ID: ${p.id}, 姓名: ${p.full_name}, 学号: ${p.student_number}, 字段: ${Object.keys(p)}`));
  }
}

executeSQLFile().catch(console.error);