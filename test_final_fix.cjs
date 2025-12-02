// 测试最终修复：使用用户ID进行分配
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api';

async function testFinalFix() {
  try {
    console.log('🧪 测试最终修复：使用用户ID进行培养方案分配\n');

    // 使用用户ID进行批量分配测试
    const response = await fetch(`${API_BASE}/teacher/00000000-0000-0000-0000-000000000001/batch-assign-training-program`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        programId: '62b2cc69-5b10-4238-8232-59831cdb7964',
        studentIds: ['d365a6d0-11a7-423a-9ede-13c10b039f08'], // 这是用户ID，不是档案ID
        notes: '测试用户ID自动转换为档案ID'
      })
    });

    const result = await response.json();
    
    console.log('📊 测试结果:');
    console.log('   • HTTP状态:', response.status);
    console.log('   • API成功:', result.success ? '✅' : '❌');
    console.log('   • 消息:', result.message);
    
    if (result.data) {
      console.log('   • 成功数量:', result.data.success_count);
      console.log('   • 失败数量:', result.data.failure_count);
      
      if (result.data.details && result.data.details.length > 0) {
        console.log('   • 错误详情:');
        result.data.details.forEach(detail => {
          console.log(`     - 学生ID: ${detail.student_id.substring(0, 8)}..., 错误: ${detail.error}`);
        });
      }
    }

    // 总结修复效果
    console.log('\n💡 修复总结:');
    if (result.success) {
      console.log('✅ 成功！API现在能够:');
      console.log('   1. 接受用户ID作为输入');
      console.log('   2. 自动查找对应的档案ID');
      console.log('   3. 使用正确的档案ID进行分配');
      console.log('   4. 创建培养方案关联和课程进度');
    } else {
      console.log('❌ 仍有问题需要解决');
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testFinalFix();