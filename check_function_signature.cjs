const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkFunctionSignatures() {
  try {
    console.log('🔍 检查函数签名...');
    
    // 尝试调用import函数看看实际需要的参数
    try {
      await supabase.rpc('import_training_program_courses_with_teacher_v2');
    } catch (error) {
      console.log('📋 import_training_program_courses_with_teacher_v2 参数信息:');
      console.log(error.message);
    }
    
    // 检查其他函数
    try {
      await supabase.rpc('get_teacher_training_programs_v2');
    } catch (error) {
      console.log('\n📋 get_teacher_training_programs_v2 参数信息:');
      console.log(error.message);
    }
    
    try {
      await supabase.rpc('assign_teacher_training_program_to_students_v2');
    } catch (error) {
      console.log('\n📋 assign_teacher_training_program_to_students_v2 参数信息:');
      console.log(error.message);
    }
    
  } catch (error) {
    console.error('❌ 检查函数签名失败:', error);
  }
  
  process.exit(0);
}

checkFunctionSignatures();