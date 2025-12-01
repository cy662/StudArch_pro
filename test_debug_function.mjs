import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function testWithDebug() {
  try {
    const teacherId = '00000000-0000-0000-0000-000000000001';
    const programId = '62b2cc69-5b10-4238-8232-59831cdb7964';
    const studentId = 'db888c86-eb18-4c5d-819a-d59f0d223adc';
    
    console.log('🧪 执行带调试日志的函数测试...\n');
    
    // 使用 .rpc() 调用函数并设置 return: 'minimal' 来获取更多信息
    const { data, error } = await supabase
      .rpc('batch_assign_training_program_to_teacher_students', {
        p_teacher_id: teacherId,
        p_program_id: programId,
        p_student_ids: [studentId]
      }, {
        // 这将显示更多的调试信息
        head: false,
        count: 'exact'
      });
    
    if (error) {
      console.log('❌ 函数调用错误:');
      console.log('错误代码:', error.code);
      console.log('错误信息:', error.message);
      console.log('错误详情:', error.details);
      console.log('错误提示:', error.hint);
    } else {
      console.log('✅ 函数调用成功:');
      console.log(JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    console.error('🚨 测试过程中发生错误:', error);
  }
}

testWithDebug();