const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function checkStudentTrainingProgram() {
  console.log('=== 检查学生培养方案问题 ===');
  
  try {
    // 1. 检查现有培养方案分配记录
    console.log('\n1. 检查培养方案分配记录:');
    const { data: assignments, error: assignmentError } = await supabase
      .from('student_training_programs')
      .select('*');
      
    if (assignmentError) {
      console.error('❌ 查询分配记录失败:', assignmentError);
    } else {
      console.log(`找到 ${assignments.length} 条培养方案分配记录:`);
      assignments.forEach((assignment, index) => {
        console.log(`  ${index + 1}. 档案ID: ${assignment.student_id?.substring(0, 8)}... - 培养方案ID: ${assignment.program_id} - 状态: ${assignment.status}`);
      });
    }
    
    // 2. 检查学生端获取培养方案的逻辑
    console.log('\n2. 测试学生端获取培养方案:');
    
    // 获取一个有档案的学生进行测试
    const { data: students, error: studentError } = await supabase
      .from('student_profiles')
      .select('id, user_id')
      .limit(3);
      
    if (!studentError && students.length > 0) {
      const testStudent = students[0];
      console.log(`测试学生档案ID: ${testStudent.id}`);
      console.log(`对应用户ID: ${testStudent.user_id}`);
      
      // 模拟学生端API调用（使用当前API逻辑）
      const { data: programs, error: programError } = await supabase
        .from('student_training_programs')
        .select(`
          *,
          training_programs (
            id,
            program_name,
            program_description,
            duration_years,
            created_at
          )
        `)
        .eq('student_id', testStudent.id)
        .eq('status', 'active');
        
      if (programError) {
        console.error('❌ 学生端API查询失败:', programError);
      } else {
        console.log(`✅ 学生端API返回 ${programs.length} 个培养方案:`);
        programs.forEach((program, index) => {
          console.log(`  ${index + 1}. ${program.training_programs?.program_name || '未命名'} - 状态: ${program.status}`);
        });
        
        if (programs.length > 0) {
          // 进一步检查课程
          const programId = programs[0].program_id;
          console.log(`\n3. 检查培养方案 ${programId} 的课程:`);
          
          const { data: courses, error: courseError } = await supabase
            .from('training_program_courses')
            .select('*')
            .eq('program_id', programId);
            
          if (courseError) {
            console.error('❌ 查询课程失败:', courseError);
          } else {
            console.log(`✅ 找到 ${courses.length} 门课程:`);
            courses.forEach((course, index) => {
              console.log(`  ${index + 1}. ${course.course_name} - ${course.credits}学分`);
            });
          }
        }
      }
    }
    
    // 3. 检查所有学生账号（包括无档案的）
    console.log('\n4. 检查所有学生账号:');
    const { data: allStudents, error: allError } = await supabase
      .from('users')
      .select('id, full_name, user_number, email')
      .like('user_number', '20%');
      
    if (!allError) {
      console.log(`所有学生账号: ${allStudents.length} 个:`);
      allStudents.forEach((student, index) => {
        console.log(`  ${index + 1}. ${student.full_name} (${student.user_number}) - ID: ${student.id.substring(0, 8)}...`);
      });
    }
    
  } catch (error) {
    console.error('检查过程中出现错误:', error);
  }
}

checkStudentTrainingProgram().catch(console.error);