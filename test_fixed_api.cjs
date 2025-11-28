const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

// 测试API
async function testFixedAPI() {
  try {
    console.log('🧪 测试修复后的培养方案分配API...\n');
    
    // 获取一些测试用的ID
    const { data: students } = await supabase
      .from('users')
      .select('id, user_number, full_name')
      .eq('role_id', '3')
      .limit(3);
    
    const { data: programs } = await supabase
      .from('training_programs')
      .select('id, program_name')
      .limit(1);
    
    if (students.length === 0 || programs.length === 0) {
      console.log('❌ 没有找到测试数据');
      return;
    }
    
    const teacherId = '00000000-0000-0000-0000-000000000001';
    const programId = programs[0].id;
    const studentIds = students.map(s => s.id);
    
    console.log('📋 测试数据:');
    console.log('教师ID:', teacherId);
    console.log('培养方案ID:', programId);
    console.log('学生IDs:', studentIds);
    console.log('培养方案名称:', programs[0].program_name);
    
    // 测试批量分配API
    console.log('\n🔄 测试批量分配培养方案...');
    
    const response = await fetch(`http://localhost:3001/api/teacher/${teacherId}/batch-assign-training-program`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        programId: programId,
        studentIds: studentIds,
        notes: 'API测试分配'
      }),
    });
    
    const result = await response.json();
    
    console.log('📊 API响应状态:', response.status);
    console.log('📦 响应数据:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ 批量分配成功!');
      const { success_count, failure_count, total_count } = result.data;
      console.log(`成功分配: ${success_count}, 失败: ${failure_count}, 总计: ${total_count}`);
      
      // 测试学生端获取课程API
      if (success_count > 0) {
        console.log('\n📚 测试学生端获取培养方案课程...');
        
        for (const student of students) {
          const courseResponse = await fetch(`http://localhost:3001/api/student/${student.id}/training-program-courses`);
          const courseResult = await courseResponse.json();
          
          console.log(`\n学生 ${student.full_name} (${student.user_number}) 的课程:`);
          console.log('API状态:', courseResponse.status);
          
          if (courseResult.success) {
            console.log('✅ 获取成功!');
            if (Array.isArray(courseResult.data)) {
              console.log(`课程数量: ${courseResult.data.length}`);
              courseResult.data.slice(0, 2).forEach((course, index) => {
                console.log(`  ${index + 1}. ${course.course_name || course.course_number}`);
              });
            } else {
              console.log('返回数据格式:', typeof courseResult.data);
            }
          } else {
            console.log('❌ 获取失败:', courseResult.message);
          }
        }
      }
    } else {
      console.log('❌ 批量分配失败:', result.message);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testFixedAPI();