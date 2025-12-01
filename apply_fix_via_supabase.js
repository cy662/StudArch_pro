import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('缺少 Supabase 配置');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyFix() {
  try {
    console.log('🚀 开始通过Supabase客户端应用批量分配修复...');
    
    // 读取SQL文件
    const sqlContent = readFileSync('direct_batch_fix.sql', 'utf8');
    
    // 分割SQL语句 - 使用更智能的分割方法
    const statements = [];
    let currentStatement = '';
    let inString = false;
    let stringChar = '';
    
    for (let i = 0; i < sqlContent.length; i++) {
      const char = sqlContent[i];
      
      // 处理字符串中的分号
      if ((char === "'" || char === '"') && !inString) {
        inString = true;
        stringChar = char;
        currentStatement += char;
        continue;
      }
      
      if (inString && char === stringChar) {
        inString = false;
        currentStatement += char;
        continue;
      }
      
      if (inString) {
        currentStatement += char;
        continue;
      }
      
      // 如果是分号且不在字符串中，结束当前语句
      if (char === ';') {
        currentStatement = currentStatement.trim();
        if (currentStatement && !currentStatement.startsWith('--')) {
          statements.push(currentStatement);
        }
        currentStatement = '';
      } else {
        currentStatement += char;
      }
    }
    
    console.log(`📝 解析到 ${statements.length} 个SQL语句`);
    
    // 逐个执行语句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`执行语句 ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
      
      try {
        // 尝试使用不同的方法执行SQL
        const { error } = await supabase
          .from('pg_tables') // 先测试连接
          .select('*')
          .limit(1);
          
        if (error) {
          console.error('数据库连接测试失败:', error.message);
          return;
        }
        
        // 对于CREATE/DROP语句，我们需要通过admin API
        if (statement.startsWith('CREATE') || statement.startsWith('DROP') || statement.startsWith('GRANT')) {
          console.log(`🔧 执行DDL语句: ${statement.split('(')[0]}`);
          // 注意：Supabase JavaScript客户端不直接支持DDL，这里需要特殊处理
          console.log('⚠️ 注意：DDL语句需要通过数据库管理界面或直接在数据库中执行');
          console.log(`SQL: ${statement};`);
        } else {
          console.log('📋 跳过注释或其他语句');
        }
        
      } catch (error) {
        console.error(`❌ 语句执行失败:`, error.message);
      }
    }
    
    console.log('\n✅ 修复SQL语句准备完成！');
    console.log('\n📋 请将以下SQL复制到Supabase数据库管理界面执行：');
    console.log('='.repeat(60));
    console.log(sqlContent);
    console.log('='.repeat(60));
    console.log('\n🔗 或访问 Supabase Dashboard > Database > SQL Editor 粘贴执行');
    
  } catch (error) {
    console.error('❌ 修复应用失败:', error);
  }
}

applyFix();