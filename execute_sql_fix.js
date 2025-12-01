import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import fs from 'fs';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function executeSqlFile() {
  try {
    console.log('正在读取SQL文件...');
    const sqlContent = fs.readFileSync('fix_training_assignment_functions.sql', 'utf8');
    
    console.log('SQL文件内容长度:', sqlContent.length);
    
    // 尝试使用原始SQL执行
    const { data, error } = await supabase
      .rpc('exec_sql', { 
        sql_query: sqlContent 
      });
      
    if (error) {
      console.error('执行失败:', error);
      
      // 尝试另一种方法：使用direct SQL
      console.log('尝试直接执行...');
      
      // 将SQL分解为单独的语句
      const statements = sqlContent
        .split('--')
        .filter(s => s.trim())
        .map(s => s.trim())
        .filter(s => s.startsWith('CREATE') || s.startsWith('ALTER') || s.startsWith('COMMIT'));
        
      console.log('找到', statements.length, '个SQL语句');
      
      for (let i = 0; i < statements.length; i++) {
        console.log(`执行语句 ${i + 1}/${statements.length}`);
        // 这里我们需要等待用户通过Supabase Dashboard手动执行
      }
      
    } else {
      console.log('执行成功:', data);
    }
    
  } catch (err) {
    console.error('Error:', err);
  }
}

executeSqlFix();