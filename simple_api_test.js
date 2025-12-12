import fetch from 'node-fetch';

async function testApi() {
  console.log('🔍 测试API功能...\n');

  try {
    // 1. 测试健康检查
    console.log('1. 测试健康检查...');
    const healthResponse = await fetch('http://localhost:3001/api/health');
    const healthData = await healthResponse.json();
    console.log(`健康检查: ${healthData.success ? '✅ 成功' : '❌ 失败'} - ${healthData.message}`);
    
    // 2. 获取学生列表
    console.log('\n2. 获取学生列表...');
    const studentsResponse = await fetch('http://localhost:3001/api/students');
    const studentsData = await studentsResponse.json();
    
    if (studentsData.success && studentsData.data && studentsData.data.length > 0) {
      console.log(`学生列表: ✅ 成功 - 找到 ${studentsData.data.length} 名学生`);
      console.log(`第一个学生ID: ${studentsData.data[0].id}`);
      console.log(`专业: ${studentsData.data[0].major}`);
    } else {
      console.log(`学生列表: ❌ 失败 - ${studentsData.message || '未知错误'}`);
      return;
    }
    
    // 3. 获取培养方案列表
    console.log('\n3. 获取培养方案列表...');
    const programsResponse = await fetch('http://localhost:3001/api/training-programs');
    const programsData = await programsResponse.json();
    
    if (programsData.success && programsData.data && programsData.data.length > 0) {
      console.log(`培养方案列表: ✅ 成功 - 找到 ${programsData.data.length} 个培养方案`);
      console.log(`第一个培养方案ID: ${programsData.data[0].id}`);
      console.log(`培养方案名称: ${programsData.data[0].program_name}`);
    } else {
      console.log(`培养方案列表: ❌ 失败 - ${programsData.message || '未知错误'}`);
      return;
    }
    
    // 4. 测试培养方案分配
    console.log('\n4. 测试培养方案分配...');
    const studentId = studentsData.data[0].id;
    const programId = programsData.data[0].id;
    const teacherId = '00000000-0000-0000-0000-000000000001';
    
    const assignResponse = await fetch(`http://localhost:3001/api/teacher/${teacherId}/batch-assign-training-program`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        programId: programId,
        studentIds: [studentId],
        notes: 'API测试分配'
      }),
    });
    
    const assignData = await assignResponse.json();
    
    if (assignData.success) {
      console.log(`培养方案分配: ✅ 成功`);
      console.log(`   成功分配: ${assignData.data.success_count} 名学生`);
      console.log(`   分配失败: ${assignData.data.failure_count} 名学生`);
    } else {
      console.log(`培养方案分配: ❌ 失败 - ${assignData.message}`);
    }
    
    console.log('\n🎉 API测试完成！');
    
  } catch (error) {
    console.error('测试过程中出现错误:', error);
  }
}

testApi();