// 测试API调用

function testApiCall() {
  console.log('测试API调用...');
  
  try {
    // 模拟API调用参数
    const teacherId = '6a9f3cf3-9fa8-4145-b29a-5c59e0a5c7d5';
    const programId = '6a9f3cf3-9fa8-4145-b29a-5c59e0a5c7d5';
    const studentIds = ['6a9f3cf3-9fa8-4145-b29a-5c59e0a5c7d5'];
    const notes = '测试分配';
    
    console.log('请求参数:');
    console.log('- 教师ID:', teacherId);
    console.log('- 培养方案ID:', programId);
    console.log('- 学生ID数组:', studentIds);
    console.log('- 备注:', notes);
    
    // 注意：这里只是模拟测试，实际需要根据您的服务器地址调整
    const apiUrl = 'http://localhost:3000/api/training-programs/teacher/' + teacherId + '/batch-assign-training-program';
    
    console.log('API URL:', apiUrl);
    
    // 显示请求体
    const requestBody = {
      programId: programId,
      studentIds: studentIds,
      notes: notes
    };
    
    console.log('请求体:', JSON.stringify(requestBody, null, 2));
    
    // 测试JSON序列化
    console.log('\n测试JSON序列化:');
    try {
      const serialized = JSON.stringify(requestBody);
      console.log('序列化成功:', serialized);
      
      // 测试反序列化
      const parsed = JSON.parse(serialized);
      console.log('反序列化成功:', parsed);
    } catch (serializeError) {
      console.error('JSON序列化失败:', serializeError);
    }
    
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 运行测试
try {
  testApiCall();
  console.log('\n=== 测试完成 ===');
} catch (error) {
  console.error('测试执行失败:', error);
}