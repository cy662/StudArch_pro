// 测试更新功能 - 确保不会产生重复数据
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';
const TEST_STUDENT_ID = 'f1c1aa0d-2169-4369-af14-3cadc6aa22b4';
const TEST_COURSE = '数据结构与算法';

async function testSyncFunction() {
  console.log('🧪 开始测试同步功能...\n');

  try {
    // 测试1: 第一次同步技术标签（应该创建新记录）
    console.log('📝 测试1: 第一次同步技术标签');
    const firstTagResponse = await fetch(`${BASE_URL}/api/student-learning/sync-technical-tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_profile_id: TEST_STUDENT_ID,
        course_name: TEST_COURSE,
        tags: ['JavaScript', 'React', 'Node.js']
      })
    });
    
    const firstTagResult = await firstTagResponse.json();
    console.log('第一次同步结果:', JSON.stringify(firstTagResult, null, 2));
    console.log('');

    // 测试2: 第二次同步相同的技术标签（应该跳过已存在的）
    console.log('📝 测试2: 第二次同步相同的技术标签（添加新标签）');
    const secondTagResponse = await fetch(`${BASE_URL}/api/student-learning/sync-technical-tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_profile_id: TEST_STUDENT_ID,
        course_name: TEST_COURSE,
        tags: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Vue'] // 添加两个新标签
      })
    });
    
    const secondTagResult = await secondTagResponse.json();
    console.log('第二次同步结果:', JSON.stringify(secondTagResult, null, 2));
    console.log('');

    // 测试3: 同步学习收获（第一次应该创建）
    console.log('📝 测试3: 第一次同步学习收获');
    const firstAchievementResponse = await fetch(`${BASE_URL}/api/student-learning/sync-learning-achievement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_profile_id: TEST_STUDENT_ID,
        course_name: TEST_COURSE,
        content: '掌握了基本数据结构，理解了算法复杂度分析'
      })
    });
    
    const firstAchievementResult = await firstAchievementResponse.json();
    console.log('第一次学习收获同步结果:', JSON.stringify(firstAchievementResult, null, 2));
    console.log('');

    // 测试4: 同步学习收获（第二次应该更新）
    console.log('📝 测试4: 第二次同步学习收获（更新内容）');
    const secondAchievementResponse = await fetch(`${BASE_URL}/api/student-learning/sync-learning-achievement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_profile_id: TEST_STUDENT_ID,
        course_name: TEST_COURSE,
        content: '掌握了基本数据结构，理解了算法复杂度分析，能够独立实现常见算法'
      })
    });
    
    const secondAchievementResult = await secondAchievementResponse.json();
    console.log('第二次学习收获同步结果:', JSON.stringify(secondAchievementResult, null, 2));
    console.log('');

    // 测试5: 同步学习成果（第一次应该创建）
    console.log('📝 测试5: 第一次同步学习成果');
    const firstOutcomeResponse = await fetch(`${BASE_URL}/api/student-learning/sync-learning-outcome`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_profile_id: TEST_STUDENT_ID,
        course_name: TEST_COURSE,
        description: '完成了所有实验项目，期中成绩85分',
        start_date: '2024-02-26',
        end_date: '2024-07-15'
      })
    });
    
    const firstOutcomeResult = await firstOutcomeResponse.json();
    console.log('第一次学习成果同步结果:', JSON.stringify(firstOutcomeResult, null, 2));
    console.log('');

    // 测试6: 同步学习成果（第二次应该更新）
    console.log('📝 测试6: 第二次同步学习成果（更新内容）');
    const secondOutcomeResponse = await fetch(`${BASE_URL}/api/student-learning/sync-learning-outcome`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_profile_id: TEST_STUDENT_ID,
        course_name: TEST_COURSE,
        description: '完成了所有实验项目，期中成绩85分，期末成绩90分，获得优秀学生称号',
        start_date: '2024-02-26',
        end_date: '2024-07-15'
      })
    });
    
    const secondOutcomeResult = await secondOutcomeResponse.json();
    console.log('第二次学习成果同步结果:', JSON.stringify(secondOutcomeResult, null, 2));
    console.log('');

    // 验证最终结果
    console.log('🔍 验证最终数据状态...');
    const summaryResponse = await fetch(`${BASE_URL}/api/student-learning/get-summary/${TEST_STUDENT_ID}`);
    const summaryResult = await summaryResponse.json();
    
    if (summaryResult.success) {
      console.log('✅ 测试完成！最终数据状态:');
      console.log(`技术标签数量: ${summaryResult.data.technical_tags.length}`);
      console.log(`学习收获数量: ${summaryResult.data.learning_achievements.length}`);
      console.log(`学习成果数量: ${summaryResult.data.learning_outcomes.length}`);
      
      // 检查是否有重复数据
      const duplicateTags = summaryResult.data.technical_tags.filter(tag => tag.description === `课程: ${TEST_COURSE}`);
      const duplicateAchievements = summaryResult.data.learning_achievements.filter(a => a.related_course === TEST_COURSE);
      const duplicateOutcomes = summaryResult.data.learning_outcomes.filter(o => o.related_course === TEST_COURSE);
      
      console.log('\n📊 重复数据检查:');
      console.log(`${TEST_COURSE} 的技术标签记录数: ${duplicateTags.length}`);
      console.log(`${TEST_COURSE} 的学习收获记录数: ${duplicateAchievements.length}`);
      console.log(`${TEST_COURSE} 的学习成果记录数: ${duplicateOutcomes.length}`);
      
      if (duplicateTags.length <= 5 && duplicateAchievements.length <= 1 && duplicateOutcomes.length <= 1) {
        console.log('✅ 更新功能正常！没有产生重复数据。');
      } else {
        console.log('❌ 警告：可能存在重复数据！');
      }
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
}

// 运行测试
testSyncFunction();