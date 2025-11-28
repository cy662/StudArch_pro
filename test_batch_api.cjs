// 测试批量分配API的简化版本

async function testBatchAPI() {
  try {
    console.log('🧪 测试批量分配API（简化版）...');
    
    const response = await fetch('http://localhost:3001/api/teacher/00000000-0000-0000-0000-000000000001/batch-assign-training-program', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        programId: '62b2cc69-5b10-4238-8232-59831cdb7964',
        studentIds: ['00000000-0000-0000-0000-000000000102'],
        notes: '简化测试'
      }),
    });
    
    console.log('API响应状态:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API错误响应:', errorText);
    } else {
      const result = await response.json();
      console.log('API响应数据:', JSON.stringify(result, null, 2));
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testBatchAPI();