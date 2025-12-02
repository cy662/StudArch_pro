// 简单的更新功能测试
const TEST_STUDENT_ID = 'f1c1aa0d-2169-4369-af14-3cadc6aa22b4';
const TEST_COURSE = '数据结构与算法';

console.log('🧪 测试同步API更新功能');
console.log('================================');

// 使用浏览器环境的fetch
async function testUpdateInBrowser() {
  console.log('📝 测试1: 同步技术标签');
  
  try {
    const response = await fetch('/api/student-learning/sync-technical-tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_profile_id: TEST_STUDENT_ID,
        course_name: TEST_COURSE,
        tags: ['JavaScript', 'React', 'Node.js', 'TypeScript']
      })
    });
    
    const result = await response.json();
    console.log('技术标签同步结果:', result);
    
    console.log('📝 测试2: 同步学习收获');
    
    const achievementResponse = await fetch('/api/student-learning/sync-learning-achievement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_profile_id: TEST_STUDENT_ID,
        course_name: TEST_COURSE,
        content: '测试更新功能：掌握了数据结构和算法'
      })
    });
    
    const achievementResult = await achievementResponse.json();
    console.log('学习收获同步结果:', achievementResult);
    
    console.log('📝 测试3: 同步学习成果');
    
    const outcomeResponse = await fetch('/api/student-learning/sync-learning-outcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_profile_id: TEST_STUDENT_ID,
        course_name: TEST_COURSE,
        description: '测试更新功能：完成了所有实验项目'
      })
    });
    
    const outcomeResult = await outcomeResponse.json();
    console.log('学习成果同步结果:', outcomeResult);
    
    console.log('✅ 更新功能测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 如果在浏览器控制台运行，可以调用这个函数
console.log('请在浏览器控制台中运行: testUpdateInBrowser()');
console.log('或者在前端页面上点击保存按钮来测试更新功能。');