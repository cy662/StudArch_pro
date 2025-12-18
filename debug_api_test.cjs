async function testAPIs() {
  const baseURL = 'http://localhost:3002';
  
  console.log('🧪 测试API连接...');
  
  try {
    // 测试健康检查
    console.log('\n1. 测试健康检查...');
    const healthResponse = await fetch(`${baseURL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ 健康检查:', healthData);
    
    // 测试自定义课程获取（使用一个假的ID）
    console.log('\n2. 测试自定义课程获取...');
    try {
      const customResponse = await fetch(`${baseURL}/api/student-learning/get-custom-courses/test-id`);
      console.log('自定义课程响应状态:', customResponse.status);
      
      if (customResponse.ok) {
        const customData = await customResponse.json();
        console.log('✅ 自定义课程API正常:', customData);
      } else {
        console.log('⚠️ 自定义课程API返回错误:', customResponse.status);
        const errorData = await customResponse.json().catch(() => null);
        console.log('错误详情:', errorData);
      }
    } catch (error) {
      console.log('❌ 自定义课程API调用失败:', error.message);
    }
    
    // 测试培养方案课程获取
    console.log('\n3. 测试培养方案课程获取...');
    try {
      const programResponse = await fetch(`${baseURL}/api/student/test-id/training-program-courses`);
      console.log('培养方案响应状态:', programResponse.status);
      
      if (programResponse.ok) {
        const programData = await programResponse.json();
        console.log('✅ 培养方案API正常:', programData);
      } else {
        console.log('⚠️ 培养方案API返回错误:', programResponse.status);
        const errorData = await programResponse.json().catch(() => null);
        console.log('错误详情:', errorData);
      }
    } catch (error) {
      console.log('❌ 培养方案API调用失败:', error.message);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testAPIs();