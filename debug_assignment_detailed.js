// 详细调试培养方案分配功能
import fetch from 'node-fetch';

async function debugAssignmentDetailed() {
  try {
    console.log('🔍 开始详细调试培养方案分配功能...\n');
    
    // 1. 获取当前教师信息
    console.log('1. 获取当前教师信息...');
    // 这里我们模拟一个教师ID（在实际应用中应该从认证中获取）
    const teacherId = '00000000-0000-0000-0000-000000000001';
    console.log(`✅ 当前教师ID: ${teacherId}`);
    
    // 2. 获取教师的培养方案列表
    console.log('\n2. 获取教师的培养方案列表...');
    const programsResponse = await fetch(`http://localhost:3001/api/training-programs/teacher-list?teacher_id=${teacherId}`);
    const programsData = await programsResponse.json();
    console.log('培养方案响应状态:', programsResponse.status);
    console.log('培养方案完整响应:', JSON.stringify(programsData, null, 2));
    
    if (!programsData.success || !programsData.data || programsData.data.programs.length === 0) {
      console.log('❌ 没有可用的培养方案');
      return;
    }
    
    const program = programsData.data.programs[0];
    console.log(`✅ 选择培养方案: ${program.program_name} (ID: ${program.id})`);
    
    // 3. 获取学生列表
    console.log('\n3. 获取学生列表...');
    const studentsResponse = await fetch('http://localhost:3001/api/students');
    const studentsData = await studentsResponse.json();
    console.log('学生列表响应状态:', studentsResponse.status);
    console.log('学生列表完整响应:', JSON.stringify(studentsData, null, 2));
    
    if (!studentsData.success || !studentsData.data || studentsData.data.length === 0) {
      console.log('❌ 没有可用的学生');
      return;
    }
    
    const student = studentsData.data[0];
    console.log(`✅ 选择学生: ${student.full_name} (ID: ${student.id})`);
    
    // 4. 测试分配功能 - 使用和前端相同的参数
    console.log('\n4. 测试培养方案分配...');
    console.log('分配参数:');
    console.log('- 教师ID:', teacherId);
    console.log('- 培养方案ID:', program.id);
    console.log('- 学生ID数组:', [student.id]);
    console.log('- 备注: 批量分配培养方案');
    
    const assignResponse = await fetch('http://localhost:3001/api/training-programs/teacher-assign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': teacherId
      },
      body: JSON.stringify({
        teacher_id: teacherId,
        program_id: program.id,
        student_ids: [student.id],
        notes: '批量分配培养方案'
      }),
    });
    
    const assignData = await assignResponse.json();
    console.log('分配响应状态:', assignResponse.status);
    console.log('分配完整响应:', JSON.stringify(assignData, null, 2));
    
    // 5. 验证分配结果
    console.log('\n5. 验证分配结果...');
    if (assignData.success) {
      console.log('✅ 分配成功!');
      console.log(`   成功分配: ${assignData.data?.success_count || 0} 名学生`);
      console.log(`   分配失败: ${assignData.data?.failure_count || 0} 名学生`);
      console.log(`   总计: ${assignData.data?.total_count || 0} 名学生`);
      
      if (assignData.data?.details && assignData.data.details.length > 0) {
        console.log('   详细错误信息:');
        assignData.data.details.forEach((detail, index) => {
          console.log(`     ${index + 1}. 学生ID ${detail.student_id}: ${detail.error}`);
        });
      }
    } else {
      console.log('❌ 分配失败:', assignData.message);
    }
    
    // 6. 检查学生是否真的被分配了培养方案
    console.log('\n6. 检查学生培养方案课程...');
    try {
      const coursesResponse = await fetch(`http://localhost:3001/api/student/${student.id}/training-program-courses`);
      const coursesData = await coursesResponse.json();
      console.log('课程查询响应状态:', coursesResponse.status);
      console.log('课程数据:', JSON.stringify(coursesData, null, 2));
      
      if (coursesData.success && coursesData.data && coursesData.data.length > 0) {
        console.log(`✅ 学生已成功分配培养方案，包含 ${coursesData.data.length} 门课程`);
      } else {
        console.log('⚠️ 学生未分配培养方案或无课程');
      }
    } catch (error) {
      console.log('❌ 查询学生课程时出错:', error.message);
    }
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error);
  }
}

debugAssignmentDetailed();