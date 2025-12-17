// 测试教师培养方案隔离修复
import fetch from 'node-fetch';

async function testTeacherIsolationFix() {
  try {
    console.log('🧪 开始测试教师培养方案隔离修复...\n');
    
    // 1. 获取教师列表
    console.log('1. 获取教师列表...');
    const teachersResponse = await fetch('http://localhost:3001/api/teachers');
    const teachersData = await teachersResponse.json();
    
    if (!teachersData.success || !teachersData.data || teachersData.data.length === 0) {
      console.log('❌ 没有找到教师');
      return;
    }
    
    const teacher1 = teachersData.data[0];
    console.log(`✅ 找到教师1: ${teacher1.full_name} (${teacher1.id})`);
    
    // 2. 获取教师1的培养方案
    console.log('\n2. 获取教师1的培养方案...');
    const programsResponse = await fetch(`http://localhost:3001/api/training-programs/teacher-list?teacher_id=${teacher1.id}`);
    const programsData = await programsResponse.json();
    
    if (!programsData.success || !programsData.data || programsData.data.programs.length === 0) {
      console.log('❌ 教师1没有培养方案');
      return;
    }
    
    const program = programsData.data.programs[0];
    console.log(`✅ 教师1的培养方案: ${program.program_name} (${program.id})`);
    
    // 3. 获取学生列表
    console.log('\n3. 获取学生列表...');
    const studentsResponse = await fetch('http://localhost:3001/api/students');
    const studentsData = await studentsResponse.json();
    
    if (!studentsData.success || !studentsData.data || studentsData.data.length === 0) {
      console.log('❌ 没有找到学生');
      return;
    }
    
    const student = studentsData.data[0];
    console.log(`✅ 找到学生: ${student.full_name} (${student.id})`);
    
    // 4. 测试教师1分配自己的培养方案（应该成功）
    console.log('\n4. 测试教师1分配自己的培养方案...');
    const assignResponse1 = await fetch('http://localhost:3001/api/training-programs/teacher-assign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': teacher1.id
      },
      body: JSON.stringify({
        teacher_id: teacher1.id,
        program_id: program.id,
        student_ids: [student.id],
        notes: '测试分配 - 教师自己的培养方案'
      })
    });
    
    const assignResult1 = await assignResponse1.json();
    console.log(`分配结果: ${assignResult1.success ? '✅ 成功' : '❌ 失败'}`);
    if (assignResult1.success) {
      console.log(`   成功分配 ${assignResult1.data.success_count} 名学生`);
    } else {
      console.log(`   错误信息: ${assignResult1.message}`);
    }
    
    // 5. 验证学生是否能看到分配的培养方案
    console.log('\n5. 验证学生是否能看到分配的培养方案...');
    const studentCoursesResponse = await fetch(`http://localhost:3001/api/student/${student.id}/training-program-courses`);
    const studentCoursesData = await studentCoursesResponse.json();
    
    if (studentCoursesData.success && studentCoursesData.data && studentCoursesData.data.length > 0) {
      console.log(`✅ 学生可以看到分配的培养方案，包含 ${studentCoursesData.data.length} 门课程`);
      console.log(`   培养方案名称: ${studentCoursesData.data[0].program_name}`);
    } else {
      console.log('❌ 学生看不到分配的培养方案');
    }
    
    console.log('\n🎉 教师培养方案隔离测试完成！');
    console.log('如果以上测试都显示成功，说明修复已生效。');
    
  } catch (error) {
    console.error('测试过程中出现错误:', error);
  }
}

testTeacherIsolationFix();