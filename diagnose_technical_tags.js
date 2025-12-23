// 诊断技术标签搜索功能
const { createClient } = require('@supabase/supabase-js');

// 需要配置实际的数据库连接
const supabaseUrl = 'https://your-project-ref.supabase.co';
const supabaseKey = 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseTechnicalTags() {
  try {
    console.log('=== 技术标签搜索功能诊断 ===\n');

    // 1. 检查 student_technical_tags 表是否存在
    console.log('1. 检查 student_technical_tags 表...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('student_technical_tags')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ 表不存在或无法访问:', tableError.message);
      return;
    }
    console.log('✅ 表存在且可访问');

    // 2. 检查技术标签数据总数
    console.log('\n2. 检查技术标签数据总数...');
    const { count: totalTags, error: countError } = await supabase
      .from('student_technical_tags')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ 统计失败:', countError.message);
    } else {
      console.log(`✅ 总共有 ${totalTags} 条技术标签记录`);
    }

    // 3. 检查活跃状态的技术标签
    console.log('\n3. 检查活跃状态的技术标签...');
    const { data: activeTags, error: activeError } = await supabase
      .from('student_technical_tags')
      .select('tag_name, tag_category, proficiency_level')
      .eq('status', 'active')
      .limit(10);

    if (activeError) {
      console.error('❌ 查询活跃标签失败:', activeError.message);
    } else {
      console.log('✅ 活跃技术标签示例:');
      activeTags.forEach((tag, index) => {
        console.log(`   ${index + 1}. ${tag.tag_name} (${tag.tag_category}, ${tag.proficiency_level})`);
      });
    }

    // 4. 检查学生档案数据
    console.log('\n4. 检查学生档案数据...');
    const { count: studentCount, error: studentError } = await supabase
      .from('student_profiles')
      .select('*', { count: 'exact', head: true });

    if (studentError) {
      console.error('❌ 统计学生档案失败:', studentError.message);
    } else {
      console.log(`✅ 总共有 ${studentCount} 个学生档案`);
    }

    // 5. 检查教师学生关联数据
    console.log('\n5. 检查教师学生关联数据...');
    const { count: relationCount, error: relationError } = await supabase
      .from('teacher_students')
      .select('*', { count: 'exact', head: true });

    if (relationError) {
      console.error('❌ 统计师生关联失败:', relationError.message);
    } else {
      console.log(`✅ 总共有 ${relationCount} 条师生关联记录`);
    }

    // 6. 检查具体的技术标签关联
    console.log('\n6. 检查技术标签与学生档案的关联...');
    const { data: tagRelations, error: tagRelationError } = await supabase
      .from('student_technical_tags')
      .select(`
        id,
        tag_name,
        student_profile_id,
        student_profiles!inner(
          user_id,
          full_name,
          user_number
        )
      `)
      .eq('status', 'active')
      .limit(5);

    if (tagRelationError) {
      console.error('❌ 查询标签关联失败:', tagRelationError.message);
    } else {
      console.log('✅ 技术标签关联示例:');
      tagRelations.forEach((relation, index) => {
        console.log(`   ${index + 1}. 标签ID: ${relation.id}, 标签: ${relation.tag_name}`);
        console.log(`      学生档案ID: ${relation.student_profile_id}`);
        console.log(`      学生: ${relation.student_profiles.full_name} (${relation.student_profiles.user_number})`);
        console.log(`      用户ID: ${relation.student_profiles.user_id}\n`);
      });
    }

    // 7. 测试具体的搜索场景
    console.log('7. 测试具体的搜索场景...');
    
    // 先获取一个教师ID
    const { data: teachers, error: teacherError } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('role_id', '2')
      .limit(1);

    if (teacherError || !teachers || teachers.length === 0) {
      console.log('⚠️ 没有找到教师数据，使用测试教师ID');
    } else {
      const testTeacher = teachers[0];
      console.log(`使用测试教师: ${testTeacher.full_name} (ID: ${testTeacher.id})`);

      // 获取该教师管理的学生
      const { data: teacherStudents, error: studentFetchError } = await supabase
        .from('teacher_students')
        .select('student_id')
        .eq('teacher_id', testTeacher.id);

      if (studentFetchError) {
        console.error('❌ 获取教师学生失败:', studentFetchError.message);
      } else if (!teacherStudents || teacherStudents.length === 0) {
        console.log('⚠️ 该教师没有管理的学生');
      } else {
        console.log(`✅ 该教师管理 ${teacherStudents.length} 个学生`);

        // 检查这些学生是否有技术标签
        const { data: studentTags, error: studentTagsError } = await supabase
          .from('student_technical_tags')
          .select('tag_name')
          .eq('status', 'active')
          .in('student_profile_id', teacherStudents.map(ts => ts.student_id));

        if (studentTagsError) {
          console.error('❌ 查询学生技术标签失败:', studentTagsError.message);
        } else {
          console.log(`✅ 这些学生总共有 ${studentTags.length} 个技术标签`);
          if (studentTags.length > 0) {
            const uniqueTags = [...new Set(studentTags.map(st => st.tag_name))];
            console.log('   标签列表:', uniqueTags.join(', '));
            
            // 测试搜索第一个标签
            const testTag = uniqueTags[0];
            console.log(`\n📋 测试搜索标签: "${testTag}"`);
            
            const { data: searchResult, error: searchError } = await supabase
              .from('student_technical_tags')
              .select(`
                student_profile_id,
                tag_name,
                student_profiles!inner(
                  user_id,
                  full_name,
                  user_number,
                  class_name
                )
              `)
              .eq('tag_name', testTag)
              .eq('status', 'active')
              .in('student_profiles.user_id', teacherStudents.map(ts => ts.student_id));

            if (searchError) {
              console.error('❌ 搜索失败:', searchError.message);
            } else {
              console.log(`✅ 搜索成功，找到 ${searchResult.length} 个匹配的学生:`);
              searchResult.forEach((result, index) => {
                console.log(`   ${index + 1}. ${result.student_profiles.full_name} (${result.student_profiles.user_number})`);
              });
            }
          }
        }
      }
    }

    console.log('\n=== 诊断完成 ===');

  } catch (error) {
    console.error('诊断过程中发生错误:', error);
  }
}

// 运行诊断
diagnoseTechnicalTags();