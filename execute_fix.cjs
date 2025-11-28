const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

const fs = require('fs');
const path = require('path');

async function executeFix() {
  try {
    console.log('🔧 执行培养方案分配函数修复...');
    
    // 读取SQL文件
    const sqlContent = fs.readFileSync('fix_assign_function.sql', 'utf8');
    
    // 分割SQL语句（按分号分割）
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`找到 ${statements.length} 个SQL语句`);
    
    // 逐个执行
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql_statement: statement });
        
        if (error) {
          console.error(`语句 ${i + 1} 执行失败:`, error.message);
          console.error('语句内容:', statement.substring(0, 100) + '...');
        } else {
          console.log(`✅ 语句 ${i + 1} 执行成功`);
        }
      } catch (err) {
        console.error(`语句 ${i + 1} 执行异常:`, err.message);
      }
    }
    
    console.log('🎉 修复执行完成!');
    
  } catch (error) {
    console.error('❌ 执行修复失败:', error);
  }
}

executeFix();