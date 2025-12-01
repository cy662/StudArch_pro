import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function debugAssignment() {
  try {
    console.log('🔍 检查分配失败的原因...\n');
    
    // 1. 检查教师学生关系表
    console.log('📋 检查教师学生关系表:');
    const { data: relationships, error: relError } = await supabase
      .from('teacher_student_relationships')
      .select('*');
    
    if (relError) {
      console.error('❌ 教师学生关系表错误:', relError.message);
    } else {
      console.log('✅ 教师学生关系:', relationships?.length || 0, '条记录');
      console.table(relationships);
    }
    
    // 2. 检查培养方案
    console.log('\n📋 检查培养方案:');
    const { data: programs, error: progError } = await supabase
      .from('training_programs')
      .select('id, program_name, status');
    
    if (progError) {
      console.error('❌ 培养方案表错误:', progError.message);
    } else {
      console.log('✅ 培养方案数量:', programs?.length || 0);
      programs?.forEach(p => {
        console.log(`- ${p.program_name} (${p.id}) - 状态: ${p.status}`);
      });
    }
    
    // 3. 检查users表中的学生用户
    console.log('\n📋 检查学生用户:');
    const { data: students, error: stuError } = await supabase
      .from('users')
      .select('id, username, role')
      .eq('role', 'student');
    
    if (stuError) {
      console.error('❌ 学生用户查询错误:', stuError.message);
    } else {
      console.log('✅ 学生用户数量:', students?.length || 0);
      students?.forEach(s => {
        console.log(`- ${s.username} (${s.id})`);
      });
    }
    
    // 4. 检查API实际传递的参数
    console.log('\n🔧 模拟API调用参数:');
    
    // 获取第一个教师ID
    const { data: teacher } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'teacher')
      .limit(1);
    
    // 获取第一个培养方案ID
    const { data: program } = await supabase
      .from('training_programs')
      .select('id')
      .eq('status', 'active')
      .limit(1);
    
    // 获取第一个学生ID
    const { data: student } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'student')
      .limit(1);
    
    if (teacher?.[0] && program?.[0] && student?.[0]) {
      console.log('教师ID:', teacher[0].id);
      console.log('培养方案ID:', program[0].id);
      console.log('学生ID:', student[0].id);
      
      // 5. 测试直接调用函数
      console.log('\n🧪 直接测试函数调用:');
      const { data: result, error: funcError } = await supabase
        .rpc('batch_assign_training_program_to_teacher_students', {
          p_teacher_id: teacher[0].id,
          p_program_id: program[0].id,
          p_student_ids: [student[0].id]
        });
      
      if (funcError) {
        console.error('❌ 函数调用错误:', funcError.message);
        console.error('错误详情:', funcError.details);
      } else {
        console.log('✅ 函数调用成功:');
        console.log(JSON.stringify(result, null, 2));
      }
    } else {
      console.log('❌ 缺少必要的测试数据');
    }
    
  } catch (error) {
    console.error('🚨 调试过程中发生错误:', error);
  }
}

debugAssignment();