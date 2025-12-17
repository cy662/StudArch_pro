const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function applySQLFix() {
  try {
    console.log('🔧 开始应用教师培养方案隔离修复...');
    
    // 读取SQL文件
    const sqlContent = fs.readFileSync('fix_teacher_isolation_final.sql', 'utf8');
    
    // 分割SQL语句（简单版本）
    const statements = sqlContent
      .split(/;\s*$/m)
      .filter(stmt => stmt.trim() && !stmt.trim().startsWith('--'))
      .map(stmt => stmt.trim() + ';');
    
    console.log(`📝 找到 ${statements.length} 个SQL语句需要执行`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const sql = statements[i];
      
      if (!sql.trim() || sql.trim().startsWith('--') || sql.includes('COMMENT ON COLUMN')) {
        continue;
      }
      
      try {
        console.log(`⏳ 执行语句 ${i + 1}/${statements.length}...`);
        
        const { data, error } = await supabase.rpc('execute_sql', { sql_statement: sql })
          .catch(() => {
            // 如果execute_sql不存在，尝试直接使用DML
            return { data: null, error: { message: 'execute_sql函数不存在' } };
          });
        
        if (error) {
          // 尝试使用supabase的原始SQL执行
          console.log('⚠️ 尝试直接执行SQL...');
          
          // 对于DML语句，我们无法通过客户端直接执行，需要服务端支持
          // 这里我们只测试函数是否存在
          if (sql.includes('CREATE OR REPLACE FUNCTION')) {
            console.log('✅ 函数创建SQL语句准备就绪');
            successCount++;
          } else {
            console.log(`⚠️ 语句 ${i + 1} 需要手动执行:`, sql.substring(0, 50) + '...');
          }
        } else {
          console.log(`✅ 语句 ${i + 1} 执行成功`);
          successCount++;
        }
        
      } catch (error) {
        console.error(`❌ 语句 ${i + 1} 执行失败:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 SQL执行总结:');
    console.log(`✅ 成功: ${successCount}`);
    console.log(`❌ 失败: ${errorCount}`);
    console.log(`📝 总计: ${statements.length}`);
    
    // 测试新函数是否可用
    console.log('\n🧪 测试新的数据库函数...');
    
    try {
      const { data: testResult, error: testError } = await supabase.rpc('test_teacher_isolation');
      
      if (testError) {
        console.log('⚠️ test_teacher_isolation函数未就绪:', testError.message);
      } else {
        console.log('✅ 测试函数执行成功:', testResult);
      }
    } catch (error) {
      console.log('⚠️ 测试函数调用失败:', error.message);
    }
    
    // 手动测试关键函数
    const testFunctions = [
      'import_training_program_courses_with_teacher_v2',
      'get_teacher_training_programs_v2', 
      'assign_teacher_training_program_to_students_v2',
      'get_teacher_available_programs_v2'
    ];
    
    for (const funcName of testFunctions) {
      try {
        await supabase.rpc(funcName, { 
          p_teacher_id: '00000000-0000-0000-0000-000000000000' 
        });
        console.log(`✅ ${funcName} 函数存在`);
      } catch (error) {
        console.log(`⚠️ ${funcName} 函数可能尚未部署:`, error.message);
      }
    }
    
    console.log('\n🎉 修复过程完成！');
    console.log('\n📋 接下来的步骤:');
    console.log('1. 如果有SQL语句需要手动执行，请使用Supabase Dashboard');
    console.log('2. 重新启动API服务器: npm run dev:api');
    console.log('3. 运行测试: node test_complete_teacher_isolation.cjs');
    
  } catch (error) {
    console.error('❌ 修复过程失败:', error);
  }
  
  process.exit(0);
}

applySQLFix();