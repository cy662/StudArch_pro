// 最终修复测试脚本 - 解决培养方案分配问题
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

async function finalFixTest() {
  console.log('🔧 最终修复测试 - 解决培养方案分配问题');
  
  try {
    // 1. 获取有效的培养方案ID
    console.log('\n1. 获取有效的培养方案...');
    const { data: programs, error: programsError } = await supabase
      .from('training_programs')
      .select('id, program_name, program_code')
      .eq('status', 'active')
      .limit(1);
      
    if (programsError) {
      console.error('❌ 获取培养方案失败:', programsError.message);
      return;
    }
    
    if (!programs || programs.length === 0) {
      console.error('❌ 没有找到任何有效的培养方案');
      return;
    }
    
    const program = programs[0];
    console.log(`✅ 找到培养方案: ${program.program_name || 'N/A'} (ID: ${program.id})`);
    
    // 2. 获取有效的学生档案ID
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
    console.log(`✅ 找到学生档案: ID=${student.id}, User_ID=${student.user_id}`);
    
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
    
    // 4. 验证所有ID格式
    console.log('\n4. 验证ID格式...');
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(program.id)) {
      console.error('❌ 培养方案ID格式无效:', program.id);
      return;
    }
    
    if (!uuidRegex.test(student.id)) {
      console.error('❌ 学生档案ID格式无效:', student.id);
      return;
    }
    
    if (!uuidRegex.test(teacher.id)) {
      console.error('❌ 教师ID格式无效:', teacher.id);
      return;
    }
    
    console.log('✅ 所有ID格式验证通过');
    
    // 5. 执行培养方案分配测试
    console.log('\n5. 执行培养方案分配测试...');
    console.log('参数:');
    console.log('- 学生ID (profile id):', student.id);
    console.log('- 培养方案ID:', program.id);
    console.log('- 教师ID:', teacher.id);
    
    // 使用正确的参数调用函数
    const { data: assignmentResult, error: assignmentError } = await supabase.rpc(
      'assign_training_program_to_student',
      {
        p_student_id: student.id,  // 使用profile id
        p_program_id: program.id,
        p_teacher_id: teacher.id,
        p_notes: '最终测试分配'
      }
    );
    
    if (assignmentError) {
      console.error('❌ 分配失败:', assignmentError.message);
      console.error('错误详情:', JSON.stringify(assignmentError, null, 2));
      return;
    }
    
    console.log('✅ 分配成功!');
    console.log('结果:', JSON.stringify(assignmentResult, null, 2));
    
    // 6. 验证分配结果
    console.log('\n6. 验证分配结果...');
    const { data: verification, error: verificationError } = await supabase
      .from('student_training_programs')
      .select('*')
      .eq('student_id', student.id)
      .eq('program_id', program.id)
      .limit(1);
      
    if (verificationError) {
      console.error('❌ 验证分配结果失败:', verificationError.message);
      return;
    }
    
    if (!verification || verification.length === 0) {
      console.error('❌ 未能验证分配结果，数据库中没有找到对应记录');
      return;
    }
    
    console.log('✅ 分配结果验证通过');
    console.log('分配记录:', JSON.stringify(verification[0], null, 2));
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
    console.error('错误堆栈:', error.stack);
  }
}

// 运行修复脚本
finalFixTest().then(() => {
  console.log('\n✨ 最终修复测试执行完成');
}).catch(console.error);