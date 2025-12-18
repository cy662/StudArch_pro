// 测试学习收获保存修复
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3001';

async function testLearningAchievementSave() {
  console.log('🔍 测试学习收获保存修复...\n');
  
  // 使用一个测试学生ID（需要替换为实际的学生ID）
  const testStudentId = '00000000-0000-0000-0000-000000000000'; // 替换为实际的学生档案ID
  
  try {
    // 1. 测试直接添加学习收获
    console.log('1. 测试直接添加学习收获...');
    const achievementResponse = await fetch(`${API_BASE_URL}/api/student-learning/add-learning-achievement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        student_profile_id: testStudentId,
        title: 'JavaScript学习收获测试',
        content: '通过修复API配置，成功将学习收获保存到数据库中，实现了数据的持久化存储。',
        achievement_type: 'course_completion',
        achieved_at: '2024-12-02',
        impact_level: 'high',
        related_course: '数据库测试课程'
      })
    });
    
    const achievementResult = await achievementResponse.json();
    console.log('   学习收获保存结果:', achievementResult);
    
    if (achievementResult.success) {
      console.log('   ✅ 学习收获保存成功！');
    } else {
      console.log('   ❌ 学习收获保存失败:', achievementResult.message);
    }
    
    // 2. 测试同步学习收获（模拟课程表单提交）
    console.log('\n2. 测试同步学习收获...');
    const syncResponse = await fetch(`${API_BASE_URL}/api/student-learning/sync-learning-achievement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        student_profile_id: testStudentId,
        course_name: '前端开发基础',
        content: '通过这门课程的学习，我掌握了HTML、CSS和JavaScript的基础知识，并能够独立完成简单的网页开发任务。'
      })
    });
    
    const syncResult = await syncResponse.json();
    console.log('   同步学习收获结果:', syncResult);
    
    if (syncResult.success) {
      console.log('   ✅ 同步学习收获成功！');
    } else {
      console.log('   ❌ 同步学习收获失败:', syncResult.message);
    }
    
    console.log('\n✅ 测试完成！');
  } catch (error) {
    console.error('测试过程中出现错误:', error.message);
  }
}

// 运行测试
testLearningAchievementSave();