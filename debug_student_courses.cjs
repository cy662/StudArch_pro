// 调试学生课程显示问题
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const debugStudentCourses = async () => {
  console.log('🔍 调试学生课程显示问题...\n');

  try {
    // 1. 获取一个测试学生的用户ID
    const testUserId = 'e898ba53-cb96-48ab-ae82-42c48db7d0be';
    console.log(`📋 1. 测试学生用户ID: ${testUserId}`);
    
    // 2. 获取学生的档案信息
    const { data: profile, error: profileError } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', testUserId)
      .single();
    
    if (profileError) {
      console.error('❌ 获取学生档案失败:', profileError.message);
      return;
    }
    
    console.log('✅ 学生档案信息:');
    console.log(`- 档案ID: ${profile.id}`);
    console.log(`- 用户ID: ${profile.user_id}`);
    console.log(`- 姓名: ${profile.full_name || 'N/A'}`);

    // 3. 检查分配的培养方案
    console.log('\n📋 2. 检查分配的培养方案:');
    const { data: assignments, error: assignmentError } = await supabase
      .from('student_training_programs')
      .select(`
        *,
        training_programs (*)
      `)
      .eq('student_id', profile.id);
    
    if (assignmentError) {
      console.error('❌ 获取培养方案分配失败:', assignmentError.message);
      return;
    }
    
    console.log(`找到 ${assignments?.length || 0} 个培养方案分配:`);
    assignments?.forEach((assignment, index) => {
      console.log(`\n方案 ${index + 1}:`);
      console.log(`- 分配ID: ${assignment.id}`);
      console.log(`- 培养方案ID: ${assignment.program_id}`);
      console.log(`- 状态: ${assignment.status}`);
      console.log(`- 注册日期: ${assignment.enrollment_date}`);
      if (assignment.training_programs) {
        console.log(`- 方案名称: ${assignment.training_programs.name || 'N/A'}`);
        console.log(`- 方案代码: ${assignment.training_programs.program_code || 'N/A'}`);
      }
    });

    // 4. 检查培养方案中的课程
    if (assignments && assignments.length > 0) {
      const programId = assignments[0].program_id;
      console.log(`\n📋 3. 检查培养方案 ${programId} 的课程:`);
      
      const { data: courses, error: coursesError } = await supabase
        .from('training_program_courses')
        .select('*')
        .eq('program_id', programId);
      
      if (coursesError) {
        console.error('❌ 获取课程失败:', coursesError.message);
        return;
      }
      
      console.log(`找到 ${courses?.length || 0} 门课程:`);
      courses?.forEach((course, index) => {
        console.log(`\n课程 ${index + 1}:`);
        console.log(`- 课程ID: ${course.id}`);
        console.log(`- 课程号: ${course.course_number}`);
        console.log(`- 课程名称: ${course.course_name}`);
        console.log(`- 学分: ${course.credits}`);
        console.log(`- 建议修读年级: ${course.recommended_grade}`);
        console.log(`- 学期: ${course.semester}`);
        console.log(`- 课程性质: ${course.course_type}`);
      });
    }

    // 5. 测试学生端API调用
    console.log('\n📋 4. 测试学生端课程API:');
    const response = await fetch(`http://localhost:3001/api/student/${testUserId}/training-program-courses`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ API调用成功');
      console.log(`返回数据:`, result.success ? result.data?.length || 0 : 0, '门课程');
      
      if (result.success && result.data) {
        result.data.forEach((course, index) => {
          console.log(`\nAPI课程 ${index + 1}:`);
          console.log(`- 课程号: ${course.course_number}`);
          console.log(`- 课程名称: ${course.course_name}`);
          console.log(`- 学分: ${course.credits}`);
        });
      }
    } else {
      console.error('❌ API调用失败:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('错误详情:', errorText);
    }

    // 6. 检查前端的用户ID使用
    console.log('\n📋 5. 前端可能使用的ID格式:');
    console.log('- 学生登录时可能使用的ID类型:');
    console.log(`  * 用户ID: ${testUserId}`);
    console.log(`  * 档案ID: ${profile.id}`);
    console.log('  * 需要确认前端调用API时使用的是哪个ID');

  } catch (error) {
    console.error('❌ 调试过程中发生错误:', error);
  }
};

debugStudentCourses();