const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function verify2023015701Courses() {
  console.log('=== 验证2023015701的课程显示 ===');
  
  const profileId = 'ad7482c8-4bfb-4369-b940-388ca5e53d377'; // 刘羿辰的档案ID
  
  try {
    // 测试API调用
    console.log('\n测试学生端API获取课程...');
    const { data: courses, error: courseError } = await supabase.rpc('get_student_training_program_courses', {
      p_student_id: profileId
    });
    
    if (courseError) {
      console.error('❌ API调用失败:', courseError);
    } else {
      console.log('✅ API调用成功，课程数量:', courses?.length || 0);
      if (courses && courses.length > 0) {
        console.log('课程列表:');
        courses.forEach((course, index) => {
          console.log(`${index + 1}. ${course.course_name} (${course.credits}学分)`);
        });
      }
    }
    
    // 检查所有学生，看看哪些没有分配培养方案
    console.log('\n=== 检查所有未分配培养方案的学生 ===');
    const { data: allStudents, error: studentsError } = await supabase
      .from('users')
      .select('id, username, full_name, user_number')
      .eq('role_id', 3)
      .limit(10);
      
    if (studentsError) {
      console.error('查询所有学生失败:', studentsError);
      return;
    }
    
    console.log('学生总数:', allStudents.length);
    
    for (const student of allStudents) {
      // 查找档案
      const { data: profile, error: profileError } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('user_id', student.id)
        .single();
        
      if (profileError || !profile) {
        console.log(`❌ ${student.user_number} ${student.full_name} - 无档案`);
        continue;
      }
      
      // 检查培养方案分配
      const { data: assignment, error: assignmentError } = await supabase
        .from('student_training_programs')
        .select('*')
        .eq('student_id', profile.id);
        
      if (assignmentError) {
        console.log(`❌ ${student.user_number} ${student.full_name} - 检查分配失败`);
      } else if (assignment.length === 0) {
        console.log(`⚠️  ${student.user_number} ${student.full_name} - 未分配培养方案`);
      } else {
        console.log(`✅ ${student.user_number} ${student.full_name} - 已分配 (${assignment[0].status})`);
      }
    }
    
  } catch (error) {
    console.error('验证过程中出错:', error);
  }
}

verify2023015701Courses().catch(console.error);