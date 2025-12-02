import fetch from 'node-fetch';

async function testSimpleAssignment() {
  try {
    // 首先检查是否有可用的培养方案
    const programsResponse = await fetch('http://localhost:3001/api/training-programs');
    const programsResult = await programsResponse.json();
    console.log('培养方案列表:', JSON.stringify(programsResult, null, 2));
    
    if (!programsResult.data || programsResult.data.length === 0) {
      console.log('没有可用的培养方案');
      return;
    }
    
    const programId = programsResult.data[0].id;
    console.log('使用的培养方案ID:', programId);
    
    // 检查是否有学生档案
    const studentsResponse = await fetch('http://localhost:3001/api/students');
    const studentsResult = await studentsResponse.json();
    console.log('学生列表:', JSON.stringify(studentsResult, null, 2));
    
    if (!studentsResult.data || studentsResult.data.length === 0) {
      console.log('没有可用的学生');
      return;
    }
    
    const studentId = studentsResult.data[0].id;
    console.log('使用的学生ID:', studentId);
    
    // 测试分配
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

    const assignResult = await assignResponse.json();
    console.log('分配结果状态:', assignResponse.status);
    console.log('分配结果数据:', JSON.stringify(assignResult, null, 2));
  } catch (error) {
    console.error('测试过程中出现错误:', error);
  }
}

testSimpleAssignment();