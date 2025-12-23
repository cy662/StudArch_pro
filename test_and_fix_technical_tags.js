// 测试和修复技术标签功能
const { createClient } = require('@supabase/supabase-js');

// 配置数据库连接
const supabaseUrl = 'https://your-project-ref.supabase.co';
const supabaseKey = 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAndFixTechnicalTags() {
  try {
    console.log('=== 技术标签功能测试和修复 ===\n');

    // 1. 检查基础数据
    console.log('1. 检查基础数据...');
    
    // 检查学生档案
    const { data: profiles, error: profileError } = await supabase
      .from('student_profiles')
      .select('id, user_id, full_name, user_number')
      .limit(10);

    if (profileError) {
      console.error('❌ 获取学生档案失败:', profileError.message);
      return;
    }

    if (!profiles || profiles.length === 0) {
      console.log('❌ 没有找到学生档案，请先创建学生数据');
      return;
    }

    console.log(`✅ 找到 ${profiles.length} 个学生档案`);
    profiles.forEach((profile, index) => {
      console.log(`   ${index + 1}. ${profile.full_name} (档案ID: ${profile.id}, 用户ID: ${profile.user_id})`);
    });

    // 检查教师数据
    const { data: teachers, error: teacherError } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('role_id', '2')
      .limit(3);

    if (teacherError) {
      console.error('❌ 获取教师数据失败:', teacherError.message);
      return;
    }

    if (!teachers || teachers.length === 0) {
      console.log('❌ 没有找到教师数据');
      return;
    }

    console.log(`✅ 找到 ${teachers.length} 个教师`);
    const testTeacher = teachers[0];
    console.log(`   使用测试教师: ${testTeacher.full_name} (ID: ${testTeacher.id})`);

    // 2. 检查师生关联
    console.log('\n2. 检查师生关联...');
    const { data: relations, error: relationError } = await supabase
      .from('teacher_students')
      .select('teacher_id, student_id')
      .eq('teacher_id', testTeacher.id);

    if (relationError) {
      console.error('❌ 获取师生关联失败:', relationError.message);
    } else {
      console.log(`✅ 教师 ${testTeacher.full_name} 关联了 ${relations?.length || 0} 个学生`);
      if (relations && relations.length > 0) {
        const studentIds = relations.map(r => r.student_id);
        console.log('   关联的学生ID:', studentIds.slice(0, 5));
      }
    }

    // 3. 创建测试技术标签数据
    console.log('\n3. 创建测试技术标签数据...');
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

    let createdTags = 0;
    for (const profile of profiles.slice(0, 5)) { // 只为前5个学生创建标签
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
          console.error(`❌ 插入标签失败 ${tag.tag_name} for student ${profile.id}:`, error);
        } else {
          console.log(`✅ 创建标签: ${tag.tag_name} for student ${profile.full_name}`);
          createdTags++;
        }
      }
    }

    console.log(`✅ 总共创建了 ${createdTags} 个技术标签`);

    // 4. 验证技术标签数据
    console.log('\n4. 验证技术标签数据...');
    const { data: allTags, error: allTagsError } = await supabase
      .from('student_technical_tags')
      .select(`
        id,
        tag_name,
        tag_category,
        proficiency_level,
        student_profile_id,
        student_profiles!inner(
          user_id,
          full_name,
          user_number
        )
      `)
      .eq('status', 'active');

    if (allTagsError) {
      console.error('❌ 查询技术标签失败:', allTagsError.message);
    } else {
      console.log(`✅ 找到 ${allTags.length} 个活跃的技术标签`);
      allTags.forEach((tag, index) => {
        console.log(`   ${index + 1}. ${tag.tag_name} - ${tag.student_profiles.full_name} (${tag.student_profiles.user_number})`);
      });
    }

    // 5. 测试搜索功能
    console.log('\n5. 测试搜索功能...');
    if (allTags && allTags.length > 0) {
      const testTag = allTags[0].tag_name;
      console.log(`📋 测试搜索标签: "${testTag}"`);

      // 模拟前端搜索逻辑
      const { data: teacherStudents, error: teacherStudentsError } = await supabase
        .from('teacher_students')
        .select('student_id')
        .eq('teacher_id', testTeacher.id);

      if (teacherStudentsError) {
        console.error('❌ 获取教师学生失败:', teacherStudentsError.message);
      } else if (!teacherStudents || teacherStudents.length === 0) {
        console.log('⚠️ 该教师没有管理的学生，无法测试搜索');
      } else {
        const studentUserIds = teacherStudents.map(ts => ts.student_id);
        console.log(`教师管理的学生ID: ${studentUserIds.slice(0, 3)}`);

        // 执行搜索
        const { data: searchResult, error: searchError } = await supabase
          .from('student_technical_tags')
          .select(`
            student_profile_id,
            tag_name,
            tag_category,
            proficiency_level,
            student_profiles!inner(
              user_id,
              full_name,
              user_number,
              class_name
            )
          `)
          .eq('tag_name', testTag)
          .eq('status', 'active')
          .in('student_profiles.user_id', studentUserIds);

        if (searchError) {
          console.error('❌ 搜索失败:', searchError.message);
          console.error('详细错误:', searchError);
        } else {
          console.log(`✅ 搜索成功，找到 ${searchResult.length} 个匹配的学生:`);
          searchResult.forEach((result, index) => {
            console.log(`   ${index + 1}. ${result.student_profiles.full_name} (${result.student_profiles.user_number})`);
          });
        }
      }
    }

    // 6. 输出诊断信息
    console.log('\n6. 诊断信息总结:');
    console.log(`- 学生档案数量: ${profiles.length}`);
    console.log(`- 教师数量: ${teachers.length}`);
    console.log(`- 师生关联数量: ${relations?.length || 0}`);
    console.log(`- 技术标签数量: ${allTags?.length || 0}`);
    console.log(`- 测试教师ID: ${testTeacher.id}`);
    console.log(`- 推荐测试标签: ${allTags && allTags.length > 0 ? allTags[0].tag_name : '无'}`);

    console.log('\n=== 测试完成 ===');
    console.log('\n📝 建议的测试步骤:');
    console.log('1. 打开教师平台 "我的学生" 页面');
    console.log(`2. 在技术标签搜索框中输入: ${allTags && allTags.length > 0 ? allTags[0].tag_name : 'JavaScript'}`);
    console.log('3. 查看是否能正确显示搜索结果');
    console.log('4. 清空搜索框，确认返回正常的学生列表');

  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 运行测试
testAndFixTechnicalTags();