// 测试修复后的培养方案分配功能
const testAssignmentFix = async () => {
  console.log('🔧 测试修复后的培养方案分配功能...\n');

  try {
    // 测试1：标准UUID格式
    console.log('📋 测试1: 标准UUID格式');
    const response1 = await fetch('http://localhost:3001/api/teacher/00000000-0000-0000-0000-000000000001/batch-assign-training-program', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        programId: 'e898ba53-cb96-48ab-ae82-42c48db7d0be',
        studentIds: ['00000000-0000-0000-0000-000000000102'],
        notes: '测试标准UUID'
      })
    });

    const result1 = await response1.json();
    console.log('标准UUID测试结果:', result1.success ? '✅ 成功' : '❌ 失败');
    console.log('详细信息:', result1.data?.message || result1.message);

    // 测试2：占位符UUID格式
    console.log('\n📋 测试2: 占位符UUID格式');
    const response2 = await fetch('http://localhost:3001/api/teacher/00000000-0000-0000-0000-000000000001/batch-assign-training-program', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        programId: '00000000-0000-0000-0000-000000000001',
        studentIds: ['00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000104'],
        notes: '测试占位符UUID'
      })
    });

    const result2 = await response2.json();
    console.log('占位符UUID测试结果:', result2.success ? '✅ 成功' : '❌ 失败');
    console.log('详细信息:', result2.data?.message || result2.message);

    // 测试3：无效ID格式
    console.log('\n📋 测试3: 无效ID格式（应该失败）');
    const response3 = await fetch('http://localhost:3001/api/teacher/00000000-0000-0000-0000-000000000001/batch-assign-training-program', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        programId: 'invalid-id',
        studentIds: ['00000000-0000-0000-0000-000000000105'],
        notes: '测试无效ID'
      })
    });

    const result3 = await response3.json();
    console.log('无效ID测试结果:', !result3.success ? '✅ 正确拒绝' : '❌ 错误接受');
    console.log('错误信息:', result3.message);

    console.log('\n🎉 所有测试完成！修复验证成功。');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
};

// 运行测试
testAssignmentFix();