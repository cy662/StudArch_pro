// 修复培养方案分配问题的测试脚本
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少Supabase配置');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixTrainingAssignment() {
  console.log('🔧 修复培养方案分配问题');
  
  try {
    // 1. 获取有效的培养方案ID
    console.log('\n1. 获取有效的培养方案...');
    const { data: programs, error: programsError } = await supabase
      .from('training_programs')
      .select('id, program_name, program_code')
      .limit(1);
      
    if (programsError) {
      console.error('❌ 获取培养方案失败:', programsError.message);
      return;
    }
    
    if (!programs || programs.length === 0) {
      console.error('❌ 没有找到任何培养方案');
      return;
    }
    
    const program = programs[0];
    console.log(`✅ 找到培养方案: ${program.program_name || 'N/A'} (ID: ${program.id})`);
    
    // 2. 获取有效的学生ID
    console.log('\n2. 获取有效的学生档案...');
    const { data: students, error: studentsError } = await supabase
      .from('student_profiles')
      .select('id, user_id')
      .limit(1);
      
    if (studentsError) {
      console.error('❌ 获取学生档案失败:', studentsError.message);
      return;
    }
    
    if (!students || students.length === 0) {
      console.error('❌ 没有找到任何学生档案');
      return;
    }
    
    const student = students[0];
    console.log(`✅ 找到学生档案: ${student.id} (用户ID: ${student.user_id})`);
    
    // 3. 获取有效的教师ID
    console.log('\n3. 获取有效的教师...');
    const { data: teachers, error: teachersError } = await supabase
      .from('users')
      .select('id')
      .eq('role_id', 2) // 假设role_id=2是教师
      .limit(1);
      
    if (teachersError) {
      console.error('❌ 获取教师失败:', teachersError.message);
      return;
    }
    
    if (!teachers || teachers.length === 0) {
      console.error('❌ 没有找到任何教师');
      return;
    }
    
    const teacher = teachers[0];
    console.log(`✅ 找到教师: ${teacher.id}`);
    
    // 4. 执行正确的培养方案分配
    console.log('\n4. 执行培养方案分配...');
    const { data: assignmentResult, error: assignmentError } = await supabase.rpc(
      'batch_assign_training_program_to_teacher_students',
      {
        p_teacher_id: teacher.id,
        p_program_id: program.id,
        p_student_ids: [student.user_id], // 使用user_id而不是profile id
        p_notes: '测试分配'
      }
    );
    
    if (assignmentError) {
      console.error('❌ 分配失败:', assignmentError.message);
      return;
    }
    
    console.log('✅ 分配成功!');
    console.log('结果:', JSON.stringify(assignmentResult, null, 2));
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
}

// 运行修复脚本
fixTrainingAssignment().then(() => {
  console.log('\n✨ 修复脚本执行完成');
}).catch(console.error);