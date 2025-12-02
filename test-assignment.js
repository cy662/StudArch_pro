import fetch from 'node-fetch';

async function testAssignment() {
  try {
    console.log('开始测试培养方案分配功能...');
    
    // 1. 获取培养方案列表
    console.log('\n1. 获取培养方案列表...');
    const programsResponse = await fetch('http://localhost:3001/api/training-programs');
    const programsData = await programsResponse.json();
    console.log('培养方案响应状态:', programsResponse.status);
    console.log('培养方案数据:', JSON.stringify(programsData, null, 2));
    
    if (!programsData.success || !programsData.data || programsData.data.length === 0) {
      console.log('❌ 没有可用的培养方案');
      return;
    }
    
    const programId = programsData.data[0].id;
    console.log('✅ 选择培养方案ID:', programId);
    
    // 2. 获取学生列表
    console.log('\n2. 获取学生列表...');
    const studentsResponse = await fetch('http://localhost:3001/api/students');
    const studentsData = await studentsResponse.json();
    console.log('学生列表响应状态:', studentsResponse.status);
    console.log('学生列表数据:', JSON.stringify(studentsData, null, 2));
    
    if (!studentsData.success || !studentsData.data || studentsData.data.length === 0) {
      console.log('❌ 没有可用的学生');
      return;
    }
    
    const studentId = studentsData.data[0].id;
    console.log('✅ 选择学生ID:', studentId);
    
    // 3. 测试分配功能
    console.log('\n3. 测试分配功能...');
    const assignResponse = await fetch('http://localhost:3001/api/teacher/00000000-0000-0000-0000-000000000001/batch-assign-training-program', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        programId: programId,
        studentIds: [studentId],
        notes: '测试分配'
      }),
    });
    
    const assignData = await assignResponse.json();
    console.log('分配响应状态:', assignResponse.status);
    console.log('分配响应数据:', JSON.stringify(assignData, null, 2));
    
    if (assignData.success) {
      console.log('✅ 分配成功!');
    } else {
      console.log('❌ 分配失败:', assignData.message);
      if (assignData.data && assignData.data.details) {
        console.log('详细错误信息:', JSON.stringify(assignData.data.details, null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error);
  }
}

testAssignment();