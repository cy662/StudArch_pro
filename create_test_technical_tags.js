// 创建测试技术标签数据
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://your-project-ref.supabase.co';
const supabaseKey = 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestTechnicalTags() {
  try {
    // 获取一些学生档案
    const { data: profiles, error: profileError } = await supabase
      .from('student_profiles')
      .select('id, user_id')
      .limit(5);

    if (profileError) {
      console.error('获取学生档案失败:', profileError);
      return;
    }

    if (!profiles || profiles.length === 0) {
      console.log('没有找到学生档案，请先创建一些学生数据');
      return;
    }

    const testTags = [
      { tag_name: 'JavaScript', tag_category: 'programming_language', proficiency_level: 'intermediate' },
      { tag_name: 'React', tag_category: 'framework', proficiency_level: 'intermediate' },
      { tag_name: 'Vue.js', tag_category: 'framework', proficiency_level: 'beginner' },
      { tag_name: 'Python', tag_category: 'programming_language', proficiency_level: 'advanced' },
      { tag_name: 'Node.js', tag_category: 'framework', proficiency_level: 'intermediate' },
      { tag_name: 'TypeScript', tag_category: 'programming_language', proficiency_level: 'beginner' },
      { tag_name: 'Docker', tag_category: 'tool', proficiency_level: 'beginner' },
      { tag_name: 'Git', tag_category: 'tool', proficiency_level: 'advanced' },
      { tag_name: 'MySQL', tag_category: 'database', proficiency_level: 'intermediate' },
      { tag_name: 'MongoDB', tag_category: 'database', proficiency_level: 'beginner' }
    ];

    // 为每个学生创建一些技术标签
    for (const profile of profiles) {
      const numTags = Math.floor(Math.random() * 3) + 1; // 每个学生1-3个标签
      const shuffledTags = testTags.sort(() => 0.5 - Math.random()).slice(0, numTags);

      for (const tag of shuffledTags) {
        const { data, error } = await supabase
          .from('student_technical_tags')
          .upsert({
            student_profile_id: profile.id,
            tag_name: tag.tag_name,
            tag_category: tag.tag_category,
            proficiency_level: tag.proficiency_level,
            description: `学习${tag.tag_name}相关的技术和应用`,
            learned_at: new Date().toISOString().split('T')[0],
            learning_hours: Math.floor(Math.random() * 100) + 20,
            practice_projects: Math.floor(Math.random() * 5) + 1,
            confidence_score: Math.floor(Math.random() * 5) + 5,
            status: 'active'
          }, {
            onConflict: 'student_profile_id,tag_name'
          });

        if (error) {
          console.error(`插入标签失败 ${tag.tag_name} for student ${profile.id}:`, error);
        } else {
          console.log(`✅ 成功创建标签: ${tag.tag_name} for student profile ${profile.id}`);
        }
      }
    }

    console.log('测试技术标签数据创建完成！');

  } catch (error) {
    console.error('创建测试数据失败:', error);
  }
}

createTestTechnicalTags();