// 测试只显示最新记录的逻辑

// 模拟一个课程的多条学习收获和成果记录
const mockCourseData = {
  achievements: [
    {
      content: '第一次学习收获内容',
      created_at: '2025-01-01T10:00:00Z',
      updated_at: '2025-01-01T10:00:00Z'
    },
    {
      content: '第二次学习收获内容（修改过）',
      created_at: '2025-01-05T10:00:00Z',
      updated_at: '2025-01-08T10:00:00Z'
    },
    {
      content: '最新的学习收获内容',
      created_at: '2025-01-10T10:00:00Z',
      updated_at: '2025-01-10T10:00:00Z'
    }
  ],
  outcomes: [
    {
      outcome_description: '第一次学习成果',
      created_at: '2025-01-02T10:00:00Z',
      updated_at: '2025-01-02T10:00:00Z'
    },
    {
      outcome_description: '最新的学习成果内容',
      created_at: '2025-01-09T10:00:00Z',
      updated_at: '2025-01-09T10:00:00Z'
    }
  ]
};

function testLatestRecordLogic() {
  console.log('🧪 测试只显示最新记录的逻辑...\n');

  // 测试学习收获 - 取最新的
  const latestAchievement = mockCourseData.achievements.sort((a, b) => 
    new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)
  )[0];

  console.log('💡 学习收获 - 最新记录:');
  console.log(`   内容: ${latestAchievement.content}`);
  console.log(`   更新时间: ${latestAchievement.updated_at}`);
  console.log(`   创建时间: ${latestAchievement.created_at}`);

  // 测试学习成果 - 取最新的  
  const latestOutcome = mockCourseData.outcomes.sort((a, b) => 
    new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)
  )[0];

  console.log('\n🏆 学习成果 - 最新记录:');
  console.log(`   内容: ${latestOutcome.outcome_description}`);
  console.log(`   更新时间: ${latestOutcome.updated_at}`);
  console.log(`   创建时间: ${latestOutcome.created_at}`);

  console.log('\n✅ 验证逻辑:');
  console.log(`   学习收获总数: ${mockCourseData.achievements.length} 条`);
  console.log(`   学习成果总数: ${mockCourseData.outcomes.length} 条`);
  console.log(`   PDF中每门课程只显示: 1条最新收获 + 1条最新成果`);
}

testLatestRecordLogic();