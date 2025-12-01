import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function testAssignment() {
  try {
    console.log('🧪 简化测试分配功能...\n');
    
    // 1. 获取教师ID (固定ID)
    const teacherId = '00000000-0000-0000-0000-000000000001';
    
    // 2. 获取培养方案ID (从之前的结果可知)
    const programId = '62b2cc69-5b10-4238-8232-59831cdb7964';
    
    // 3. 获取教师学生关系中的学生ID
    const { data: relationships, error: relError } = await supabase
      .from('teacher_student_relationships')
      .select('student_id')
      .eq('teacher_id', teacherId);
    
    if (relError) {
      console.error('❌ 无法查询教师学生关系:', relError.message);
      return;
    }
    
    console.log('✅ 找到的学生ID:');
    const studentIds = relationships?.map(r => r.student_id) || [];
    console.log(studentIds);
    
    if (studentIds.length === 0) {
      console.log('❌ 没有找到该教师管理的学生');
      return;
    }
    
    // 4. 测试分配给第一个学生
    const firstStudentId = studentIds[0];
    console.log(`\n🎯 测试分配培养方案给学生: ${firstStudentId}`);
    
    const { data: result, error: funcError } = await supabase
      .rpc('batch_assign_training_program_to_teacher_students', {
        p_teacher_id: teacherId,
        p_program_id: programId,
        p_student_ids: [firstStudentId]
      });
    
    if (funcError) {
      console.error('❌ 函数调用错误:', funcError.message);
      console.error('错误详情:', funcError.details);
      
      // 尝试获取更详细的错误信息
      if (funcError.hint) {
        console.error('提示:', funcError.hint);
      }
    } else {
      console.log('✅ 函数调用成功:');
      console.log(JSON.stringify(result, null, 2));
    }
    
  } catch (error) {
    console.error('🚨 测试过程中发生错误:', error);
  }
}

testAssignment();