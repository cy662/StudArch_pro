import fetch from 'node-fetch';

async function testAssignment() {
  try {
    // 首先创建一个测试学生
    const studentResponse = await fetch('http://localhost:3001/api/student-profiles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        student_id: '00000000-0000-0000-0000-000000000001',
        name: '测试学生',
        student_number: '20210001',
        gender: '男',
        enrollment_year: '2021',
        major: '计算机科学与技术',
        class: '计科2101',
        phone: '13800000001',
        email: 'test@example.com'
      }),
    });

    console.log('创建学生状态:', studentResponse.status);
    
    // 创建一个测试培养方案
    const programResponse = await fetch('http://localhost:3001/api/training-programs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        program_code: 'CS_2021',
        program_name: '计算机科学与技术2021版',
        department: '计算机学院',
        degree_level: '本科',
        duration_years: 4,
        total_credits: 160,
        status: 'active'
      }),
    });

    console.log('创建培养方案状态:', programResponse.status);
    
    // 测试分配
    const assignResponse = await fetch('http://localhost:3001/api/teacher/00000000-0000-0000-0000-000000000001/batch-assign-training-program', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        programId: 'CS_2021',
        studentIds: ['00000000-0000-0000-0000-000000000001'],
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

testAssignment();