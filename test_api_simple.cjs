/**
 * 简单的API测试脚本
 */

// 测试API是否可访问
async function testApi() {
  try {
    console.log('测试API健康检查...');
    const response = await fetch('http://localhost:3001/api/health');
    console.log('健康检查响应:', response.status, response.statusText);
    const data = await response.json();
    console.log('健康检查数据:', data);
    return true;
  } catch (error) {
    console.error('API健康检查失败:', error.message);
    console.log('\n🔧 请确保API服务器正在运行:');
    console.log('   npm run server');
    console.log('   或者');
    console.log('   node server.js');
    return false;
  }
}

// 测试学生画像生成API
async function testStudentProfileApi() {
  try {
    console.log('\n测试学生画像生成API...');
    
    const response = await fetch('http://localhost:3001/api/student-profile/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        student_profile_id: 'mock-12345'
      })
    });

    console.log('API响应状态:', response.status);
    
    const responseText = await response.text();
    console.log('API响应内容:', responseText);
    
    try {
      const jsonData = JSON.parse(responseText);
      console.log('解析后的响应:', jsonData);
    } catch (parseError) {
      console.log('无法解析为JSON，原始响应:', responseText);
    }
    
  } catch (error) {
    console.error('API测试失败:', error.message);
  }
}

// 主函数
async function main() {
  console.log('=== API诊断测试 ===\n');
  
  const apiRunning = await testApi();
  
  if (apiRunning) {
    await testStudentProfileApi();
  }
}

// 运行测试
main().catch(console.error);