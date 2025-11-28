// 测试修复后的学生端课程API
const testStudentAPIFix = async () => {
  console.log('🧪 测试修复后的学生端课程API...\n');

  const userId = 'e898ba53-cb96-48ab-ae82-42c48db7d0be';

  try {
    console.log('📋 测试: 使用用户ID调用修复后的API');
    const response = await fetch(`http://localhost:3001/api/student/${userId}/training-program-courses`);
    const result = await response.json();
    
    console.log(`状态: ${response.status}`);
    console.log(`结果: ${result.success ? '✅ 成功' : '❌ 失败'}`);
    console.log(`课程数量: ${result.data?.length || 0}`);
    
    if (result.success && result.data && result.data.length > 0) {
      console.log('\n📚 课程详情:');
      result.data.forEach((course, index) => {
        console.log(`${index + 1}. ${course.course_number} - ${course.course_name} (${course.credits}学分)`);
      });
    } else {
      console.log(`消息: ${result.message || 'N/A'}`);
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
};

testStudentAPIFix();