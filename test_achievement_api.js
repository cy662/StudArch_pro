// 测试学习收获API
const fetch = require('node-fetch');

async function testAchievementAPI() {
  console.log('🔍 测试学习收获API...\n');
  
  // 使用一个测试学生ID（需要替换为实际的学生ID）
  const testStudentId = 'YOUR_STUDENT_ID_HERE'; // 替换为实际的学生档案ID
  
  try {
    // 1. 测试同步学习收获
    console.log('1. 测试同步学习收获...');
    const syncResponse = await fetch('http://localhost:3001/api/student-learning/sync-learning-achievement', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        student_profile_id: testStudentId,
        course_name: '前端开发基础',
        content: '通过这门课程的学习，我掌握了HTML、CSS和JavaScript的基础知识，并能够独立完成简单的网页开发任务。这是我最重要的学习收获之一。'
      })
    });
    
    const syncResult = await syncResponse.json();
    console.log('   同步学习收获结果:', JSON.stringify(syncResult, null, 2));
    
    if (syncResult.success) {
      console.log('   ✅ 同步学习收获成功！');
    } else {
      console.log('   ❌ 同步学习收获失败:', syncResult.message);
    }
    
    // 2. 测试获取学生学习信息汇总
    console.log('\n2. 测试获取学生学习信息汇总...');
    const summaryResponse = await fetch(`http://localhost:3001/api/student-learning/get-summary/${testStudentId}`);
    
    const summaryResult = await summaryResponse.json();
    console.log('   获取学习信息汇总结果:', JSON.stringify(summaryResult, null, 2));
    
    if (summaryResult.success) {
      console.log('   ✅ 获取学习信息汇总成功！');
      if (summaryResult.data && summaryResult.data.learning_achievements) {
        console.log('   学习收获数量:', summaryResult.data.learning_achievements.length);
        summaryResult.data.learning_achievements.forEach((achievement, index) => {
          console.log(`   学习收获 ${index + 1}:`, achievement.title);
        });
      }
    } else {
      console.log('   ❌ 获取学习信息汇总失败:', summaryResult.message);
    }
    
    console.log('\n✅ 测试完成！');
  } catch (error) {
    console.error('测试过程中出现错误:', error.message);
  }
}

// 运行测试
testAchievementAPI();