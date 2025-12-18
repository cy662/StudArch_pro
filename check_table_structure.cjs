const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkTableStructure() {
  try {
    console.log('🔍 检查training_program_import_batches表结构...');
    
    // 查询表的所有列
    const { data: columns, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'training_program_import_batches')
      .like('column_name', '%success%');
    
    if (error) {
      console.error('❌ 查询失败，使用备用方法:', error.message);
      
      // 备用方法：尝试插入一条测试记录
      try {
        const testId = '00000000-0000-0000-0000-000000000888';
        const { data: testData, error: insertError } = await supabase
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
          console.log('⚠️ 插入测试:', insertError.message);
          console.log('📋 错误详情:', insertError.details);
        } else {
          console.log('✅ 测试插入成功，可用的字段:', Object.keys(testData));
          
          // 删除测试记录
          await supabase
            .from('training_program_import_batches')
            .delete()
            .eq('id', testId);
        }
      } catch (testError) {
        console.error('❌ 测试失败:', testError.message);
      }
    } else {
      console.log('📋 包含success的字段:');
      columns?.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type})`);
      });
    }
    
    // 检查是否有success_count字段
    const { data: successColumns, error: successError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'training_program_import_batches')
      .eq('column_name', 'success_count');
    
    if (successError) {
      console.log('⚠️ 检查success_count字段失败:', successError.message);
    } else {
      console.log('🔍 success_count字段存在:', successColumns && successColumns.length > 0 ? '是' : '否');
    }
    
    // 检查是否有tp_success_count字段
    const { data: tpSuccessColumns, error: tpSuccessError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'training_program_import_batches')
      .eq('column_name', 'tp_success_count');
    
    if (tpSuccessError) {
      console.log('⚠️ 检查tp_success_count字段失败:', tpSuccessError.message);
    } else {
      console.log('🔍 tp_success_count字段存在:', tpSuccessColumns && tpSuccessColumns.length > 0 ? '是' : '否');
    }
    
    // 列出所有相关字段
    const { data: allColumns, error: allError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'training_program_import_batches')
      .in('column_name', ['success_count', 'failure_count', 'tp_success_count', 'tp_failure_count']);
    
    if (allError) {
      console.log('⚠️ 检查所有计数字段失败:', allError.message);
    } else {
      console.log('📋 所有计数字段:');
      allColumns?.forEach(col => {
        console.log(`  - ${col.column_name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 检查表结构失败:', error);
  }
  
  process.exit(0);
}

checkTableStructure();