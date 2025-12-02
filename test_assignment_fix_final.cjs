// 测试培养方案分配功能修复
const fetch = (await import('node-fetch')).default;

const API_BASE = 'http://localhost:3001/api';

async function testBatchAssign() {
  try {
    console.log('🧪 测试培养方案批量分配功能修复...\n');

    // 测试1：标准UUID格式
    console.log('📋 测试1：标准UUID格式');
    const standardResponse = await fetch(`${API_BASE}/teacher/00000000-0000-0000-0000-000000000001/batch-assign-training-program`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        programId: 'e898ba53-cb96-48ab-ae82-42c48db7d0be', // 标准UUID
        studentIds: [
          'e898ba53-cb96-48ab-ae82-42c48db7d0be', // 标准UUID
          'a1b2c3d4-e5f6-7890-abcd-ef1234567890'  // 标准UUID
        ],
        notes: '测试标准UUID分配'
      })
    });
    
    const standardResult = await standardResponse.json();
    console.log('状态:', standardResponse.status);
    console.log('结果:', standardResult.success ? '✅ 成功' : '❌ 失败');
    if (!standardResult.success) {
      console.log('错误:', standardResult.message);
    }
    console.log('');

    // 测试2：占位符UUID格式
    console.log('📋 测试2：占位符UUID格式');
    const placeholderResponse = await fetch(`${API_BASE}/teacher/00000000-0000-0000-0000-000000000001/batch-assign-training-program`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        programId: '00000000-0000-0000-0000-000000000102', // 占位符UUID
        studentIds: [
          '00000000-0000-0000-0000-000000000101', // 占位符UUID
          '00000000-0000-0000-0000-000000000102'  // 占位符UUID
        ],
        notes: '测试占位符UUID分配'
      })
    });
    
    const placeholderResult = await placeholderResponse.json();
    console.log('状态:', placeholderResponse.status);
    console.log('结果:', placeholderResult.success ? '✅ 成功' : '❌ 失败');
    if (!placeholderResult.success) {
      console.log('错误:', placeholderResult.message);
    }
    console.log('');

    // 测试3：无效ID格式
    console.log('📋 测试3：无效ID格式');
    const invalidResponse = await fetch(`${API_BASE}/teacher/00000000-0000-0000-0000-000000000001/batch-assign-training-program`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        programId: 'invalid-uuid-format',
        studentIds: ['also-invalid-format'],
        notes: '测试无效ID格式'
      })
    });
    
    const invalidResult = await invalidResponse.json();
    console.log('状态:', invalidResponse.status);
    console.log('结果:', !invalidResult.success && invalidResult.status === 400 ? '✅ 正确拒绝' : '❌ 错误接受');
    console.log('错误信息:', invalidResult.message);
    console.log('');

    // 总结
    console.log('📊 测试总结:');
    console.log('• 标准UUID格式验证:', standardResult.success || standardResult.message.includes('培养方案不存在') ? '✅ 通过' : '❌ 失败');
    console.log('• 占位符UUID格式验证:', placeholderResult.success || placeholderResult.message.includes('培养方案不存在') ? '✅ 通过' : '❌ 失败');
    console.log('• 无效ID格式拒绝:', !invalidResult.success && invalidResult.status === 400 ? '✅ 通过' : '❌ 失败');

    // 如果ID验证通过但数据不存在，这是正常的
    if ((standardResult.message && standardResult.message.includes('不存在')) || 
        (placeholderResult.message && placeholderResult.message.includes('不存在'))) {
      console.log('\n💡 说明：ID格式验证已修复，测试中的"失败"是因为测试数据不存在，这是正常现象。');
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
testBatchAssign();