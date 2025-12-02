// 测试修复后的PDF格式生成逻辑

// 模拟学习数据
const mockLearningInfo = {
  technical_tags: [
    { tag_name: 'JavaScript', description: '课程: 数据结构与算法' },
    { tag_name: 'React', description: '课程: 前端开发' },
    { tag_name: 'Node.js', description: '课程: 后端开发' },
    { tag_name: 'JavaScript', description: '课程: 前端开发' }, // 重复标签测试
  ],
  learning_achievements: [
    {
      related_course: '数据结构与算法',
      title: '数据结构与算法 - 学习收获',
      content: '掌握了常见的数据结构和算法，能够分析时间和空间复杂度',
      related_tags: ['算法', '数据结构']
    },
    {
      related_course: '前端开发',
      title: '前端开发 - 学习收获',
      content: '学会了React框架和现代前端开发技术',
      related_tags: ['React', 'JavaScript']
    }
  ],
  learning_outcomes: [
    {
      related_course: '数据结构与算法',
      outcome_title: '数据结构与算法 - 学习成果',
      outcome_description: '完成了3个算法项目，包括排序算法可视化工具',
      related_tags: ['项目实践']
    },
    {
      related_course: '后端开发',
      outcome_title: '后端开发 - 学习成果',
      outcome_description: '构建了完整的RESTful API系统',
      related_tags: ['API设计', 'Node.js']
    }
  ]
};

function testCourseGrouping() {
  console.log('🧪 测试课程分组逻辑...\n');

  // 按课程分组数据
  const courseGroups = {};
  
  // 处理学习收获
  mockLearningInfo.learning_achievements.forEach((achievement) => {
    const courseName = achievement.related_course || 
                     achievement.title?.split(' - ')[0] || 
                     '未分类收获';
    if (!courseGroups[courseName]) {
      courseGroups[courseName] = { achievements: [], outcomes: [] };
    }
    courseGroups[courseName].achievements.push(achievement);
  });
  
  // 处理学习成果
  mockLearningInfo.learning_outcomes.forEach((outcome) => {
    const courseName = outcome.related_course || 
                     outcome.outcome_title?.split(' - ')[0] || 
                     '未分类成果';
    if (!courseGroups[courseName]) {
      courseGroups[courseName] = { achievements: [], outcomes: [] };
    }
    courseGroups[courseName].outcomes.push(outcome);
  });

  console.log('📚 课程分组结果:');
  Object.entries(courseGroups).forEach(([courseName, data], index) => {
    console.log(`\n${index + 1}. ${courseName}`);
    console.log(`   💡 收获: ${data.achievements.length} 条`);
    data.achievements.forEach(a => console.log(`      - ${a.content.substring(0, 30)}...`));
    console.log(`   🏆 成果: ${data.outcomes.length} 条`);
    data.outcomes.forEach(o => console.log(`      - ${o.outcome_description.substring(0, 30)}...`));
  });

  console.log('\n🏷️ 技术标签汇总（去重后）:');
  const uniqueTags = [...new Set(mockLearningInfo.technical_tags.map(tag => tag.tag_name))].sort();
  console.log(uniqueTags.join(', '));
  console.log(`总计: ${uniqueTags.length} 项技术技能`);

  console.log('\n📊 学习统计:');
  console.log(`   涉及课程数: ${Object.keys(courseGroups).length}`);
  console.log(`   收获记录: ${mockLearningInfo.learning_achievements.length}`);
  console.log(`   成果记录: ${mockLearningInfo.learning_outcomes.length}`);
  console.log(`   技术技能: ${uniqueTags.length}`);
}

testCourseGrouping();