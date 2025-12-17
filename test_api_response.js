import fetch from 'node-fetch';

async function testApiResponse() {
  try {
    console.log('🔍 测试API响应结构...\n');
    
    // 1. 获取学生列表
    console.log('1. 获取学生列表...');
    const studentsResponse = await fetch('http://localhost:3001/api/students');
    const studentsData = await studentsResponse.json();
    
    if (!studentsData.success || !studentsData.data || studentsData.data.length === 0) {
      console.log('❌ 没有可用的学生');
      return;
    }
    
    const studentId = studentsData.data[0].id;
    console.log('✅ 选择学生ID:', studentId);
    
    // 2. 获取培养方案列表
    console.log('\n2. 获取培养方案列表...');
    const programsResponse = await fetch('http://localhost:3001/api/training-programs');
    const programsData = await programsResponse.json();
    
    if (!programsData.success || !programsData.data || programsData.data.length === 0) {
      console.log('❌ 没有可用的培养方案');
      return;
    }
    
    const programId = programsData.data[0].id;
    console.log('✅ 选择培养方案ID:', programId);
    
    // 3. 测试分配功能
    console.log('\n3. 测试培养方案分配...');
    const teacherId = '00000000-0000-0000-0000-000000000001'; // 使用测试教师ID
    
    const assignResponse = await fetch('http://localhost:3001/api/teacher/' + teacherId + '/batch-assign-training-program', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        programId: programId,
        studentIds: [studentId],
        notes: 'API响应测试分配'
      }),
    });
    
    const assignData = await assignResponse.json();
    console.log('\n📊 分配响应状态:', assignResponse.status);
    console.log('📄 完整响应数据:');
    console.log(JSON.stringify(assignData, null, 2));
    
    // 4. 检查数据结构
    console.log('\n📋 数据结构检查:');
    console.log('success字段:', assignData.success);
    console.log('message字段:', assignData.message);
    console.log('data字段:', assignData.data);
    
    if (assignData.data) {
      console.log('data.success_count:', assignData.data.success_count);
      console.log('data.failure_count:', assignData.data.failure_count);
      console.log('data.total_count:', assignData.data.total_count);
    }
    
    // 5. 模拟前端解构操作
    console.log('\n🔧 模拟前端解构操作:');
    try {
      if (assignData.success && assignData.data) {
        const { success_count, failure_count, total_count } = assignData.data;
        console.log('✅ 前端解构成功:');
        console.log('   success_count:', success_count);
        console.log('   failure_count:', failure_count);
        console.log('   total_count:', total_count);
      } else {
        console.log('❌ 前端解构失败: 数据结构不符合预期');
      }
    } catch (error) {
      console.log('❌ 前端解构异常:', error.message);
    }
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error);
  }
}

testApiResponse();