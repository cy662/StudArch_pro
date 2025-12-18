const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkImportBatchTable() {
  try {
    console.log('🔍 检查training_program_import_batches表结构...');
    
    // 检查表结构
    const { data: columns, error } = await supabase
      .from('training_program_import_batches')
      .select('*')
      .limit(0);
    
    if (error) {
      console.error('❌ 检查表失败:', error.message);
    } else {
      console.log('✅ 表存在，可以查询');
    }
    
    // 检查表中的所有列
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_columns', { table_name: 'training_program_import_batches' })
      .catch(() => ({ data: null, error: { message: 'Function not available' } }));
    
    if (tableError) {
      console.log('⚠️ 无法获取详细表结构信息');
    } else {
      console.log('📋 表列信息:', tableInfo);
    }
    
    // 尝试插入一条测试记录看看有哪些字段
    const testId = '00000000-0000-0000-0000-000000000999';
    const { data: insertTest, error: insertError } = await supabase
      .from('training_program_import_batches')
      .insert({
        id: testId,
        batch_name: '测试批次',
        program_id: testId,
        teacher_id: testId,
        imported_by: testId,
        total_records: 1
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ 插入测试失败:', insertError.message);
      console.log('📋 可用字段:', insertError.details);
    } else {
      console.log('✅ 成功插入测试记录:', Object.keys(insertTest));
      
      // 删除测试记录
      await supabase
        .from('training_program_import_batches')
        .delete()
        .eq('id', testId);
    }
    
  } catch (error) {
    console.error('❌ 检查过程出错:', error);
  }
  
  process.exit(0);
}

checkImportBatchTable();