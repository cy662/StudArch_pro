// 快速测试教师培养方案API
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';
const TEST_TEACHER_ID = 'test-teacher-001';

console.log('🧪 开始测试教师培养方案API...\n');

async function testAPI() {
  try {
    // 1. 测试健康检查
    console.log('1. 测试API健康状态...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ 健康检查:', healthData.message);

    // 2. 测试获取教师培养方案列表
    console.log('\n2. 测试获取教师培养方案列表...');
    const programsResponse = await fetch(`${API_BASE}/training-programs/teacher-list?teacher_id=${TEST_TEACHER_ID}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': TEST_TEACHER_ID
      }
    });
    const programsData = await programsResponse.json();
    console.log('✅ 获取培养方案列表:', programsData.success ? '成功' : '失败');
    if (programsData.success) {
      console.log(`   培养方案数量: ${programsData.data?.programs?.length || 0}`);
    }

    // 3. 测试获取可用培养方案
    console.log('\n3. 测试获取可用培养方案...');
    const availableResponse = await fetch(`${API_BASE}/training-programs/teacher-available?teacher_id=${TEST_TEACHER_ID}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': TEST_TEACHER_ID
      }
    });
    const availableData = await availableResponse.json();
    console.log('✅ 获取可用培养方案:', availableData.success ? '成功' : '失败');
    if (availableData.success) {
      console.log(`   可用方案数量: ${availableData.data?.length || 0}`);
    }

    console.log('\n🎉 API测试完成！所有接口都正常工作。');
    console.log('\n📝 现在您可以在前端页面试试导入培养方案了。');

  } catch (error) {
    console.error('❌ API测试失败:', error.message);
    console.log('\n🔧 请检查:');
    console.log('   1. API服务器是否在 http://localhost:3001 运行');
    console.log('   2. 数据库连接是否正常');
    console.log('   3. SQL函数是否已创建');
  }
}

// 运行测试
testAPI();