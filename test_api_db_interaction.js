// 测试API和数据库函数之间的交互
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Anon Key exists:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('缺少Supabase配置');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testBatchAssignFunction() {
  console.log('测试批量分配培养方案函数...');
  
  try {
    // 使用您之前遇到错误的具体参数进行测试
    const teacherId = '6a9f3cf3-9fa8-4145-b29a-5c59e0a5c7d5';  // 示例教师ID
    const programId = '6a9f3cf3-9fa8-4145-b29a-5c59e0a5c7d5';  // 示例培养方案ID
    const studentIds = ['6a9f3cf3-9fa8-4145-b29a-5c59e0a5c7d5'];  // 示例学生ID
    
    console.log('测试参数:');
    console.log('- 教师ID:', teacherId);
    console.log('- 培养方案ID:', programId);
    console.log('- 学生ID数组:', studentIds);
    
    // 测试直接调用数据库函数
    console.log('\n直接调用数据库函数...');
    const { data, error } = await supabase.rpc('batch_assign_training_program_to_teacher_students', {
      p_teacher_id: teacherId,
      p_program_id: programId,
      p_student_ids: studentIds,
      p_notes: '测试分配'
    });
    
    if (error) {
      console.error('数据库函数调用失败:', error);
      console.error('错误详情:', error.message);
    } else {
      console.log('数据库函数调用成功:', data);
    }
    
    // 测试参数类型
    console.log('\n测试参数类型...');
    console.log('- p_teacher_id 类型:', typeof teacherId);
    console.log('- p_program_id 类型:', typeof programId);
    console.log('- p_student_ids 类型:', typeof studentIds);
    console.log('- p_student_ids 数组元素类型:', typeof studentIds[0]);
    
    // 测试JSON序列化
    console.log('\n测试JSON序列化...');
    const params = {
      p_teacher_id: teacherId,
      p_program_id: programId,
      p_student_ids: studentIds,
      p_notes: '测试分配'
    };
    console.log('参数JSON序列化:', JSON.stringify(params));
    
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 运行测试
testBatchAssignFunction().then(() => {
  console.log('\n=== 测试完成 ===');
}).catch(console.error);