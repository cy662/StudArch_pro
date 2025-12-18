/**
 * 最终完整流程测试
 */

console.log('=== 最终学生画像生成测试 ===\n');

async function testCompleteFlow() {
  try {
    console.log('📡 测试通过前端代理调用API...');
    
    // 通过前端代理测试（模拟浏览器请求）
    const response = await fetch('http://localhost:5173/api/student-profile/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        student_profile_id: 'test-final-123'
      })
    });

    console.log('📊 响应状态:', response.status);
    console.log('📄 响应头:', Object.fromEntries(response.headers.entries()));

    const result = await response.json();
    console.log('📦 响应数据:', JSON.stringify(result, null, 2));

    if (result.success && result.data?.image_url) {
      console.log('✅ 成功！学生画像生成工作正常');
      console.log('🖼️ 图片URL:', result.data.image_url);
      console.log('🎯 学生ID:', result.data.student_id);
      
      if (result.data.fallback_mode) {
        console.log('⚠️ 使用了备用方案（n8n返回空响应）');
      } else {
        console.log('🚀 完全成功（包含n8n响应）');
      }
      
      return true;
    } else {
      console.log('❌ 失败:', result.message);
      return false;
    }
  } catch (error) {
    console.error('❌ 测试异常:', error.message);
    return false;
  }
}

// 运行测试
testCompleteFlow().then(success => {
  console.log('\n=== 测试总结 ===');
  if (success) {
    console.log('🎊 所有测试通过！你可以在前端页面正常使用学生画像生成功能了！');
    console.log('🌐 访问地址: http://localhost:5173/p-student_profile_analysis');
  } else {
    console.log('⚠️ 仍有问题需要解决');
  }
}).catch(console.error);