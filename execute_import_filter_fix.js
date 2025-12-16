import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://mddpbyibesqewcktlqle.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZHBieWliZXNxZXdja3RscWxlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM1NDM0OSwiZXhwIjoyMDc4OTMwMzQ5fQ.P2Y3IaRqJn6Tf7NjaHztGSd__3bTb_aBVioKoIK9Rq8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeFix() {
  try {
    const sql = fs.readFileSync('./fix_import_filter_logic.sql', 'utf8');
    
    console.log('开始执行批量导入筛选逻辑修复...');
    
    // 分批执行SQL语句
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql_query: statement.trim() + ';' 
        });
        
        if (error) {
          console.error('执行语句失败:', statement.substring(0, 50) + '...', error);
        } else {
          console.log('✅ 执行成功:', statement.substring(0, 50) + '...');
        }
      }
    }
    
    console.log('🎉 修复完成！');
    console.log('📝 修复内容：');
    console.log('   - 排除已被任何教师导入的学生');
    console.log('   - 避免重复导入和不同教师导入同一学生的风险');
    console.log('   - 提供辅助函数检查学生导入状态');
  } catch (err) {
    console.error('执行错误:', err);
  }
}

executeFix();