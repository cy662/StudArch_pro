import fetch from 'node-fetch';

async function comprehensiveTest() {
  try {
    console.log('开始综合测试培养方案分配功能...');
    
    // 1. 获取培养方案列表
    console.log('\n1. 获取培养方案列表...');
    const programsResponse = await fetch('http://localhost:3001/api/training-programs');
    const programsData = await programsResponse.json();
    console.log('培养方案响应状态:', programsResponse.status);
    
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
    
    if (!studentsData.success || !studentsData.data || studentsData.data.length === 0) {
      console.log('❌ 没有可用的学生');
      return;
    }
    
    const studentId = studentsData.data[0].id;
    console.log('✅ 选择学生ID:', studentId);
    
    // 3. 测试分配前检查学生是否已有培养方案
    console.log('\n3. 检查分配前学生培养方案课程...');
    try {
      const preCoursesResponse = await fetch(`http://localhost:3001/api/student/${studentId}/training-program-courses`);
      const preCoursesData = await preCoursesResponse.json();
      console.log('分配前课程查询响应状态:', preCoursesResponse.status);
      if (preCoursesData.success && preCoursesData.data && preCoursesData.data.length > 0) {
        console.log(`⚠️ 学生已分配培养方案，包含 ${preCoursesData.data.length} 门课程`);
      } else {
        console.log('✅ 学生未分配培养方案');
      }
    } catch (error) {
      console.log('❌ 查询学生课程时出错:', error.message);
    }
    
    // 4. 测试分配功能 - 使用和前端相同的参数
    console.log('\n4. 测试分配功能...');
    const assignResponse = await fetch('http://localhost:3001/api/teacher/00000000-0000-0000-0000-000000000001/batch-assign-training-program', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        programId: programId,
        studentIds: [studentId], // 注意这里是一个数组
        notes: '批量分配培养方案'
      }),
    });
    
    const assignData = await assignResponse.json();
    console.log('分配响应状态:', assignResponse.status);
    console.log('分配响应完整数据:', JSON.stringify(assignData, null, 2));
    
    // 5. 验证分配结果
    console.log('\n5. 验证分配结果...');
    if (assignData.success) {
      console.log('✅ 分配成功!');
      console.log(`   成功分配: ${assignData.data.success_count} 名学生`);
      console.log(`   分配失败: ${assignData.data.failure_count} 名学生`);
      
      if (assignData.data.details && assignData.data.details.length > 0) {
        console.log('   详细错误信息:');
        assignData.data.details.forEach((detail, index) => {
          console.log(`     ${index + 1}. 学生ID ${detail.student_id}: ${detail.error}`);
        });
      }
    } else {
      console.log('❌ 分配失败:', assignData.message);
    }
    
    // 6. 检查学生是否真的被分配了培养方案
    console.log('\n6. 检查分配后学生培养方案课程...');
    try {
      const postCoursesResponse = await fetch(`http://localhost:3001/api/student/${studentId}/training-program-courses`);
      const postCoursesData = await postCoursesResponse.json();
      console.log('分配后课程查询响应状态:', postCoursesResponse.status);
      console.log('分配后课程数据:', JSON.stringify(postCoursesData, null, 2));
      
      if (postCoursesData.success && postCoursesData.data && postCoursesData.data.length > 0) {
        console.log(`✅ 学生已成功分配培养方案，包含 ${postCoursesData.data.length} 门课程`);
      } else {
        console.log('⚠️ 学生未分配培养方案或无课程');
      }
    } catch (error) {
      console.log('❌ 查询学生课程时出错:', error.message);
    }
    
    // 7. 再次尝试分配相同的培养方案（测试重复分配）
    console.log('\n7. 测试重复分配...');
    const assignResponse2 = await fetch('http://localhost:3001/api/teacher/00000000-0000-0000-0000-000000000001/batch-assign-training-program', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        programId: programId,
        studentIds: [studentId],
        notes: '重复分配测试'
      }),
    });
    
    const assignData2 = await assignResponse2.json();
    console.log('重复分配响应状态:', assignResponse2.status);
    console.log('重复分配响应数据:', JSON.stringify(assignData2, null, 2));
    
    if (assignData2.success) {
      console.log('✅ 重复分配处理正确');
    } else {
      console.log('⚠️ 重复分配处理:', assignData2.message);
    }
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error);
  }
}

comprehensiveTest();