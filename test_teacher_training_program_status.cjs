const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkDatabase() {
  try {
    console.log('🔍 检查数据库状态...');
    
    // 1. 检查teacher_id字段是否已添加
    console.log('\n1. 检查training_programs表的teacher_id字段:');
    const { data: tpColumns, error: tpError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'training_programs')
      .eq('column_name', 'teacher_id');
    
    if (tpError) {
      console.error('❌ 检查training_programs表失败:', tpError.message);
    } else {
      console.log('✅ training_programs表的teacher_id字段:', tpColumns);
    }
    
    // 2. 检查教师相关函数
    console.log('\n2. 检查教师相关函数:');
    const { data: functions, error: funcError } = await supabase
      .rpc('get_teacher_training_programs', { p_teacher_id: '00000000-0000-0000-0000-000000000000' })
      .then(data => ({ data }))
      .catch(error => ({ error: { message: error.message } }));
    
    if (funcError) {
      console.log('⚠️ get_teacher_training_programs函数:', funcError.message);
    } else {
      console.log('✅ get_teacher_training_programs函数存在');
    }
    
    // 3. 检查导入函数
    const importError = await supabase
      .rpc('import_training_program_courses_with_teacher', {
        p_courses: [],
        p_program_code: 'TEST',
        p_program_name: '测试',
        p_teacher_id: '00000000-0000-0000-0000-000000000000'
      })
      .then(() => null)
      .catch(error => error);
    
    if (importError) {
      console.log('⚠️ import_training_program_courses_with_teacher函数:', importError.message);
    } else {
      console.log('✅ import_training_program_courses_with_teacher函数存在');
    }
    
    // 4. 检查分配函数
    const assignError = await supabase
      .rpc('assign_teacher_training_program_to_students', {
        p_teacher_id: '00000000-0000-0000-0000-000000000000',
        p_program_id: '00000000-0000-0000-0000-000000000000',
        p_student_ids: []
      })
      .then(() => null)
      .catch(error => error);
    
    if (assignError) {
      console.log('⚠️ assign_teacher_training_program_to_students函数:', assignError.message);
    } else {
      console.log('✅ assign_teacher_training_program_to_students函数存在');
    }
    
    console.log('\n🎉 数据库状态检查完成');
    
  } catch (error) {
    console.error('❌ 检查数据库状态失败:', error);
  }
  
  process.exit(0);
}

checkDatabase();