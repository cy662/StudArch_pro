/**
 * 端到端学生画像生成测试
 */

async function testFullFlow() {
  console.log('=== 端到端学生画像生成测试 ===\n');
  
  // 测试1: 使用有效的测试ID
  console.log('测试1: 使用测试ID');
  try {
    const response = await fetch('http://localhost:3001/api/student-profile/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        student_profile_id: 'test-flow-123'
      })
    });

    const result = await response.json();
    console.log('响应状态:', response.status);
    console.log('响应结果:', result);
    
    if (result.success && result.data?.image_url) {
      console.log('✅ 测试1通过 - 成功生成图片URL');
      console.log('📸 图片URL:', result.data.image_url);
    } else {
      console.log('❌ 测试1失败 - 生成失败');
    }
  } catch (error) {
    console.error('❌ 测试1异常:', error.message);
  }
  
  console.log('\n---\n');
  
  // 测试2: 使用null ID
  console.log('测试2: 使用null ID（应该失败）');
  try {
    const response = await fetch('http://localhost:3001/api/student-profile/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        student_profile_id: null
      })
    });

    const result = await response.json();
    console.log('响应状态:', response.status);
    console.log('响应结果:', result);
    
    if (!result.success && response.status === 400) {
      console.log('✅ 测试2通过 - 正确拒绝无效ID');
    } else {
      console.log('❌ 测试2失败 - 应该拒绝无效ID');
    }
  } catch (error) {
    console.error('❌ 测试2异常:', error.message);
  }
  
  console.log('\n=== 测试完成 ===');
  
  console.log('\n📋 接下来你可以：');
  console.log('1. 在前端页面 http://localhost:5173/p-student_profile_analysis 测试');
  console.log('2. 检查浏览器开发者工具的网络和控制台日志');
  console.log('3. 确认n8n工作流是否正常处理请求');
}

// 运行测试
testFullFlow().catch(console.error);