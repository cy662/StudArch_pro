import fetch from 'node-fetch';

async function testAPIEndpoint() {
  try {
    console.log('🧪 测试API端点...');
    
    const testData = {
      programId: '00000000-0000-0000-0000-000000000001',
      studentIds: ['89e41fee-a388-486f-bbb2-320c4e115ee1'], // 使用实际的学生ID
      notes: '测试分配'
    };
    
    console.log('📤 发送请求:', testData);
    
    const response = await fetch('http://localhost:3002/api/teacher/00000000-0000-0000-0000-000000000001/batch-assign-training-program', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📊 响应状态:', response.status);
    console.log('📋 响应头:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📝 响应内容:', responseText);
    
    if (response.status === 500) {
      console.log('❌ 500错误 - 服务器内部错误');
      console.log('🔍 需要检查服务器日志');
    }
    
  } catch (error) {
    console.error('❌ API测试失败:', error);
  }
}

testAPIEndpoint();