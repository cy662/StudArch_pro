import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function testStudentCourseFix() {
  try {
    console.log('=== 测试学生课程显示修复 ===');
    
    // 1. 获取一个完整的学生信息（包括用户ID和档案ID）
    const { data: students, error: studError } = await supabase
      .from('student_profiles')
      .select('*')
      .limit(1);
      
    if (studError || !students || students.length === 0) {
      console.log('❌ 没有找到学生档案');
      return;
    }
    
    const studentProfile = students[0];
    console.log('✅ 找到学生档案:', {
      profileId: studentProfile.id,
      userId: studentProfile.user_id,
      status: studentProfile.profile_status
    });
    
    // 2. 测试使用档案ID获取课程（修复后的方法）
    console.log('\n--- 测试使用档案ID获取课程 ---');
    try {
      const profileResponse = await fetch(`http://localhost:3001/api/student/${studentProfile.id}/training-program-courses`);
      const profileResult = await profileResponse.json();
      
      if (profileResult.success) {
        console.log(`✅ 使用档案ID成功获取 ${profileResult.data.length} 门课程`);
        profileResult.data.slice(0, 3).forEach((course, index) => {
          console.log(`  ${index + 1}. ${course.course_name} (${course.credits}学分) - ${course.status}`);
        });
      } else {
        console.log(`❌ 使用档案ID获取失败: ${profileResult.message}`);
      }
    } catch (error) {
      console.log(`❌ 使用档案ID调用异常: ${error.message}`);
    }
    
    // 3. 测试使用用户ID获取课程（原来的方法）
    if (studentProfile.user_id) {
      console.log('\n--- 测试使用用户ID获取课程 ---');
      try {
        const userResponse = await fetch(`http://localhost:3001/api/student/${studentProfile.user_id}/training-program-courses`);
        const userResult = await userResponse.json();
        
        if (userResult.success) {
          console.log(`✅ 使用用户ID成功获取 ${userResult.data.length} 门课程`);
        } else {
          console.log(`❌ 使用用户ID获取失败: ${userResult.message}`);
        }
      } catch (error) {
        console.log(`❌ 使用用户ID调用异常: ${error.message}`);
      }
    }
    
    // 4. 检查分配记录确认
    console.log('\n--- 检查分配记录 ---');
    const { data: assignments, error: assignError } = await supabase
      .from('student_training_programs')
      .select('*')
      .eq('student_id', studentProfile.id);
      
    if (assignError) {
      console.log('❌ 获取分配记录失败:', assignError);
    } else {
      console.log(`✅ 找到 ${assignments?.length || 0} 条分配记录`);
      assignments?.forEach((assignment, index) => {
        console.log(`  ${index + 1}. 状态: ${assignment.status}, 培养方案ID: ${assignment.program_id}`);
      });
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testStudentCourseFix();