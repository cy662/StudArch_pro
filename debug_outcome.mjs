import fetch from 'node-fetch';

async function checkOutcome() {
  try {
    const response = await fetch('http://localhost:3001/api/student-learning/get-summary/f1c1aa0d-2169-4369-af14-3cadc6aa22b4');
    const result = await response.json();
    
    console.log('完整响应:', JSON.stringify(result, null, 2));
    
    if (result.success && result.data && result.data.learning_outcomes) {
      console.log('\n=== 学习成果详情 ===');
      result.data.learning_outcomes.forEach((outcome, index) => {
        console.log(`成果 ${index + 1}:`);
        console.log(`  ID: ${outcome.id}`);
        console.log(`  标题: ${outcome.outcome_title}`);
        console.log(`  描述: ${outcome.outcome_description}`);
        console.log(`  相关课程: ${outcome.related_course}`);
        console.log('---');
      });
    }
  } catch (error) {
    console.error('检查失败:', error);
  }
}

checkOutcome();