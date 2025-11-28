// 测试学生端课程API的不同ID
const testStudentAPI = async () => {
  console.log('🧪 测试学生端课程API的不同ID...\n');

  const userId = 'e898ba53-cb96-48ab-ae82-42c48db7d0be';
  const profileId = '4f310fb0-87a6-4b64-9e69-49c48390be5f';

  try {
    // 测试1：使用用户ID
    console.log('📋 测试1: 使用用户ID');
    const response1 = await fetch(`http://localhost:3001/api/student/${userId}/training-program-courses`);
    const result1 = await response1.json();
    console.log(`状态: ${response1.status}`);
    console.log(`结果: ${result1.success ? '✅ 成功' : '❌ 失败'}`);
    console.log(`课程数量: ${result1.data?.length || 0}`);
    console.log(`消息: ${result1.message || 'N/A'}`);

    // 测试2：使用档案ID
    console.log('\n📋 测试2: 使用档案ID');
    const response2 = await fetch(`http://localhost:3001/api/student/${profileId}/training-program-courses`);
    const result2 = await response2.json();
    console.log(`状态: ${response2.status}`);
    console.log(`结果: ${result2.success ? '✅ 成功' : '❌ 失败'}`);
    console.log(`课程数量: ${result2.data?.length || 0}`);
    console.log(`消息: ${result2.message || 'N/A'}`);

    // 直接测试数据库函数
    console.log('\n📋 测试3: 直接查询数据库验证');
    const { createClient } = require('@supabase/supabase-js');
    require('dotenv').config();
    
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
    );

    // 使用用户ID测试
    const { data: data1, error: error1 } = await supabase.rpc('get_student_training_program_courses', {
      p_student_id: userId
    });
    console.log(`直接调用数据库函数(用户ID): ${error1 ? '❌ 失败' : '✅ 成功'}`);
    console.log(`错误: ${error1?.message || 'N/A'}`);
    console.log(`数据: ${data1?.length || 0} 条记录`);

    // 使用档案ID测试
    const { data: data2, error: error2 } = await supabase.rpc('get_student_training_program_courses', {
      p_student_id: profileId
    });
    console.log(`直接调用数据库函数(档案ID): ${error2 ? '❌ 失败' : '✅ 成功'}`);
    console.log(`错误: ${error2?.message || 'N/A'}`);
    console.log(`数据: ${data2?.length || 0} 条记录`);

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
};

testStudentAPI();