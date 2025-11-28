const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function testChenyaoAPI() {
  console.log('=== 测试陈瑶(2023011)的培养方案API ===');
  
  const userId = '6d179b0f-6a47-4e82-b0a8-9021b9986b778'; // 陈瑶的用户ID
  
  try {
    // 测试学生端API：获取学生培养方案课程
    console.log('\n1. 测试学生培养方案课程API...');
    const { data: courses, error: courseError } = await supabase.rpc('get_student_training_program_courses', {
      p_student_id: userId
    });
    
    if (courseError) {
      console.error('API调用失败:', courseError);
      
      // 尝试使用档案ID
      console.log('\n2. 查找档案ID并重新测试...');
      const { data: profiles, error: profileError } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();
        
      if (!profileError && profiles) {
        const profileId = profiles.id;
        console.log('找到档案ID:', profileId);
        
        const { data: profileCourses, error: profileCourseError } = await supabase.rpc('get_student_training_program_courses', {
          p_student_id: profileId
        });
        
        if (profileCourseError) {
          console.error('使用档案ID调用API也失败:', profileCourseError);
        } else {
          console.log('使用档案ID调用API成功，课程数量:', profileCourses?.length || 0);
          if (profileCourses && profileCourses.length > 0) {
            console.log('前3门课程:', profileCourses.slice(0, 3));
          }
        }
      }
    } else {
      console.log('使用用户ID调用API成功，课程数量:', courses?.length || 0);
      if (courses && courses.length > 0) {
        console.log('前3门课程:', courses.slice(0, 3));
      }
    }
    
    // 测试直接查询student_training_programs表
    console.log('\n3. 直接查询分配表...');
    const { data: assignments, error: assignmentError } = await supabase
      .from('student_training_programs')
      .select('*')
      .eq('student_id', userId);
      
    if (assignmentError) {
      console.error('查询分配表失败:', assignmentError);
    } else {
      console.log('分配记录数量:', assignments?.length || 0);
    }
    
  } catch (error) {
    console.error('测试过程中出错:', error);
  }
}

testChenyaoAPI().catch(console.error);