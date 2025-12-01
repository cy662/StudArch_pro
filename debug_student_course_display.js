import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function debugStudentCourseDisplay() {
  try {
    console.log('=== 调试学生课程显示问题 ===');
    
    // 1. 检查学生分配记录
    console.log('\n--- 检查学生培养方案分配记录 ---');
    const { data: assignments, error: assignError } = await supabase
      .from('student_training_programs')
      .select('*');
      
    if (assignError) {
      console.error('获取分配记录失败:', assignError);
    } else {
      console.log('找到分配记录数量:', assignments?.length || 0);
      assignments?.forEach((assignment, index) => {
        console.log(`  ${index + 1}. 学生ID: ${assignment.student_id}, 培养方案ID: ${assignment.program_id}, 状态: ${assignment.status}`);
      });
    }
    
    // 2. 检查学生档案
    console.log('\n--- 检查学生档案数据 ---');
    const { data: students, error: studError } = await supabase
      .from('student_profiles')
      .select('id, user_id, profile_status');
      
    if (studError) {
      console.error('获取学生档案失败:', studError);
    } else {
      console.log('找到学生数量:', students?.length || 0);
      students?.forEach((student, index) => {
        console.log(`  ${index + 1}. 档案ID: ${student.id}, 用户ID: ${student.user_id}, 状态: ${student.profile_status}`);
      });
    }
    
    // 3. 检查培养方案课程
    console.log('\n--- 检查培养方案课程数据 ---');
    const { data: programCourses, error: courseError } = await supabase
      .from('training_program_courses')
      .select('*')
      .limit(5);
      
    if (courseError) {
      console.error('获取课程数据失败:', courseError);
    } else {
      console.log('找到课程数量:', programCourses?.length || 0);
      programCourses?.forEach((course, index) => {
        console.log(`  ${index + 1}. 课程ID: ${course.id}, 课程名: ${course.course_name}, 培养方案ID: ${course.program_id}`);
      });
    }
    
    // 4. 检查课程进度
    console.log('\n--- 检查学生课程进度 ---');
    const { data: progress, error: progressError } = await supabase
      .from('student_course_progress')
      .select('*')
      .limit(5);
      
    if (progressError) {
      console.error('获取课程进度失败:', progressError);
    } else {
      console.log('找到进度记录数量:', progress?.length || 0);
      progress?.forEach((prog, index) => {
        console.log(`  ${index + 1}. 学生ID: ${prog.student_id}, 课程ID: ${prog.course_id}, 状态: ${prog.status}`);
      });
    }
    
    // 5. 测试每个学生的API调用
    if (students && students.length > 0) {
      console.log('\n--- 测试每个学生的API调用 ---');
      
      for (const student of students.slice(0, 3)) { // 只测试前3个学生
        console.log(`\n测试学生 ${student.id}:`);
        
        try {
          const response = await fetch(`http://localhost:3001/api/student/${student.id}/training-program-courses`);
          const result = await response.json();
          
          if (result.success) {
            console.log(`  ✅ API调用成功，返回 ${result.data.length} 门课程`);
            if (result.data.length > 0) {
              console.log(`     第1门课程: ${result.data[0].course_name}`);
            }
          } else {
            console.log(`  ❌ API调用失败: ${result.message}`);
          }
        } catch (error) {
          console.log(`  ❌ API调用异常: ${error.message}`);
        }
      }
    }
    
    // 6. 检查前端可能使用的用户ID映射
    console.log('\n--- 检查用户ID映射问题 ---');
    if (students && students.length > 0) {
      const student = students[0];
      console.log(`学生档案ID: ${student.id}`);
      console.log(`用户ID: ${student.user_id}`);
      console.log('前端可能使用的是哪个ID？');
      
      // 测试使用user_id调用API
      if (student.user_id) {
        console.log('\n测试使用user_id调用API:');
        try {
          const userResponse = await fetch(`http://localhost:3001/api/student/${student.user_id}/training-program-courses`);
          const userResult = await userResponse.json();
          
          if (userResult.success) {
            console.log(`  ✅ 使用user_id调用成功，返回 ${userResult.data.length} 门课程`);
          } else {
            console.log(`  ❌ 使用user_id调用失败: ${userResult.message}`);
          }
        } catch (error) {
          console.log(`  ❌ 使用user_id调用异常: ${error.message}`);
        }
      }
    }
    
  } catch (error) {
    console.error('调试过程出错:', error);
  }
}

debugStudentCourseDisplay();