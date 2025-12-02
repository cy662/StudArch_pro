// 验证更新功能是否正常工作
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001';
const STUDENT_ID = 'f1c1aa0d-2169-4369-af14-3cadc6aa22b4';
const COURSE_NAME = '数据结构与算法测试';

console.log('🔍 验证更新功能...\n');

async function verifyUpdateFunction() {
  try {
    // 1. 清理可能存在的测试数据
    console.log('📝 步骤1: 查看现有数据...');
    const existingResponse = await fetch(`${API_BASE}/api/student-learning/get-summary/${STUDENT_ID}`);
    const existingData = await existingResponse.json();
    
    if (existingData.success) {
      const existingOutcomes = existingData.data.learning_outcomes.filter(
        outcome => outcome.related_course === COURSE_NAME
      );
      
      console.log(`现有 ${COURSE_NAME} 学习成果数量: ${existingOutcomes.length}`);
      if (existingOutcomes.length > 0) {
        console.log('发现现有数据，将进行更新测试');
        existingOutcomes.forEach((outcome, index) => {
          console.log(`  ${index + 1}. ID: ${outcome.id}, 描述: ${outcome.outcome_description}`);
        });
      }
    }

    // 2. 第一次同步 - 应该创建新记录
    console.log('\n📝 步骤2: 第一次同步学习成果（应该创建）...');
    const firstSyncResponse = await fetch(`${API_BASE}/api/student-learning/sync-learning-outcome`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_profile_id: STUDENT_ID,
        course_name: COURSE_NAME,
        description: '第一次同步：完成了基本算法练习',
        start_date: '2024-02-26',
        end_date: '2024-07-15'
      })
    });

    const firstResult = await firstSyncResponse.json();
    console.log('第一次同步结果:', firstResult.success ? firstResult.data.action : '失败');

    // 3. 第二次同步 - 应该更新现有记录
    console.log('\n📝 步骤3: 第二次同步学习成果（应该更新）...');
    const secondSyncResponse = await fetch(`${API_BASE}/api/student-learning/sync-learning-outcome`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_profile_id: STUDENT_ID,
        course_name: COURSE_NAME,
        description: '第二次同步：完成了基本算法练习，并掌握了高级数据结构',
        start_date: '2024-02-26',
        end_date: '2024-07-15'
      })
    });

    const secondResult = await secondSyncResponse.json();
    console.log('第二次同步结果:', secondResult.success ? secondResult.data.action : '失败');

    // 4. 验证最终结果
    console.log('\n📝 步骤4: 验证最终结果...');
    const finalResponse = await fetch(`${API_BASE}/api/student-learning/get-summary/${STUDENT_ID}`);
    const finalData = await finalResponse.json();
    
    if (finalData.success) {
      const finalOutcomes = finalData.data.learning_outcomes.filter(
        outcome => outcome.related_course === COURSE_NAME
      );
      
      console.log(`最终 ${COURSE_NAME} 学习成果数量: ${finalOutcomes.length}`);
      
      if (finalOutcomes.length === 1) {
        console.log('✅ 成功！只有一条记录，没有重复数据');
        finalOutcomes.forEach(outcome => {
          console.log(`  - 描述: ${outcome.outcome_description}`);
          console.log(`  - 创建时间: ${outcome.created_at}`);
          console.log(`  - 更新时间: ${outcome.updated_at}`);
        });
      } else if (finalOutcomes.length > 1) {
        console.log('❌ 警告：发现重复数据！');
        finalOutcomes.forEach((outcome, index) => {
          console.log(`  ${index + 1}. ID: ${outcome.id}, 描述: ${outcome.outcome_description}`);
        });
      } else {
        console.log('⚠️ 没有找到相关数据');
      }
    }

  } catch (error) {
    console.error('❌ 验证过程中发生错误:', error.message);
  }
}

// 运行验证
verifyUpdateFunction();