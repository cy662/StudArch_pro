// 测试前端API调用结构
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function testFrontendAPI() {
  try {
    console.log('=== 测试前端API调用结构 ===');
    
    // 获取培养方案
    const { data: programs, error: progError } = await supabase
      .from('training_programs')
      .select('*')
      .eq('status', 'active')
      .limit(1);
      
    if (progError || !programs || programs.length === 0) {
      console.log('❌ 没有找到培养方案');
      return;
    }
    
    const program = programs[0];
    console.log('✅ 找到培养方案:', program.program_name);
    
    // 获取学生
    const { data: students, error: studError } = await supabase
      .from('student_profiles')
      .select('id')
      .limit(2);
      
    if (studError || !students || students.length === 0) {
      console.log('❌ 没有找到学生');
      return;
    }
    
    console.log('✅ 找到学生数量:', students.length);
    
    // 模拟前端API调用
    const studentIds = students.map(s => s.id);
    const teacherId = 'f1c1aa0d-2169-4369-af14-3cadc6aa22b4'; // 使用第一个学生ID作为教师ID
    
    console.log('\n=== 模拟前端批量分配API调用 ===');
    
    const response = await fetch(`http://localhost:3001/api/teacher/${teacherId}/batch-assign-training-program`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        programId: program.id,
        studentIds: studentIds,
        notes: '前端测试分配'
      }),
    });

    const result = await response.json();
    console.log('API响应结构:', JSON.stringify(result, null, 2));
    
    // 模拟前端解构操作
    if (result.success) {
      try {
        const { success_count, failure_count, total_count } = result.data;
        console.log('✅ 前端解构成功:', { success_count, failure_count, total_count });
        
        if (failure_count === 0) {
          console.log(`✅ 成功为 ${success_count} 名学生分配培养方案！`);
        } else {
          console.log(`⚠️ 分配完成：成功 ${success_count} 名学生，失败 ${failure_count} 名学生`);
        }
        
      } catch (error) {
        console.error('❌ 前端解构失败:', error.message);
      }
    } else {
      console.error('❌ API调用失败:', result.message);
    }
    
    // 测试学生端课程获取
    console.log('\n=== 测试学生端课程获取 ===');
    const studentId = students[0].id;
    
    const courseResponse = await fetch(`http://localhost:3001/api/student/${studentId}/training-program-courses`);
    const courseResult = await courseResponse.json();
    
    if (courseResult.success) {
      console.log(`✅ 学生端课程获取成功，共 ${courseResult.data.length} 门课程`);
      
      // 显示前3门课程
      courseResult.data.slice(0, 3).forEach((course, index) => {
        console.log(`  ${index + 1}. ${course.course_name} (${course.credits}学分) - ${course.status}`);
      });
    } else {
      console.error('❌ 学生端课程获取失败:', courseResult.message);
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testFrontendAPI();