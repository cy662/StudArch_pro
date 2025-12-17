async function testAPI() {
  const baseURL = 'http://localhost:3001';
  
  console.log('🧪 测试自定义课程API...');
  
  try {
    // 测试健康检查
    console.log('\n1. 测试健康检查...');
    const healthResponse = await fetch(`${baseURL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('健康检查结果:', healthData);
    
    // 测试添加自定义课程接口（应该返回错误，但不应该是404）
    console.log('\n2. 测试添加自定义课程接口...');
    const addCourseResponse = await fetch(`${baseURL}/api/student-learning/add-custom-course`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        student_profile_id: 'test-id',
        course_name: '测试课程'
      })
    });
    
    console.log('响应状态:', addCourseResponse.status);
    console.log('响应状态码:', addCourseResponse.status);
    
    const addCourseData = await addCourseResponse.json().catch(() => null);
    console.log('响应数据:', addCourseData);
    
    if (addCourseResponse.status === 404) {
      console.log('❌ API接口不存在 - 需要重启服务器');
    } else {
      console.log('✅ API接口存在');
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testAPI();