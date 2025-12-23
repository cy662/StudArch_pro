// 诊断Java标签搜索问题
const { createClient } = require('@supabase/supabase-js');

// 使用实际的数据库配置
const supabaseUrl = 'https://mddpbyibesqewcktlqle.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZHBieWliZXNxZXdja3RscWxlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM1NDM0OSwiZXhwIjoyMDc4OTMwMzQ5fQ.P2Y3IaRqJn6Tf7NjaHztGSd__3bTb_aBVioKoIK9Rq8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugJavaSearch() {
  try {
    console.log('=== Java标签搜索调试 ===\n');

    // 1. 查找学号为2023015701的学生
    console.log('1. 查找学号为2023015701的学生...');
    const { data: targetStudent, error: studentError } = await supabase
      .from('users')
      .select('id, full_name, user_number, role_id')
      .eq('user_number', '2023015701')
      .single();

    if (studentError) {
      console.error('❌ 查找学生失败:', studentError.message);
      return;
    }

    if (!targetStudent) {
      console.log('❌ 没有找到学号为2023015701的学生');
      return;
    }

    console.log('✅ 找到目标学生:');
    console.log(`   用户ID: ${targetStudent.id}`);
    console.log(`   姓名: ${targetStudent.full_name}`);
    console.log(`   学号: ${targetStudent.user_number}`);
    console.log(`   角色: ${targetStudent.role_id}`);

    // 2. 查找该学生的档案
    console.log('\n2. 查找该学生的档案...');
    const { data: profile, error: profileError } = await supabase
      .from('student_profiles')
      .select('id, user_id, full_name, class_name')
      .eq('user_id', targetStudent.id)
      .single();

    if (profileError) {
      console.error('❌ 查找学生档案失败:', profileError.message);
      return;
    }

    if (!profile) {
      console.log('❌ 该学生没有档案记录');
      return;
    }

    console.log('✅ 找到学生档案:');
    console.log(`   档案ID: ${profile.id}`);
    console.log(`   用户ID: ${profile.user_id}`);
    console.log(`   姓名: ${profile.full_name}`);

    // 3. 查找该学生的技术标签
    console.log('\n3. 查找该学生的技术标签...');
    const { data: studentTags, error: tagsError } = await supabase
      .from('student_technical_tags')
      .select('*')
      .eq('student_profile_id', profile.id)
      .eq('status', 'active');

    if (tagsError) {
      console.error('❌ 查找技术标签失败:', tagsError.message);
      return;
    }

    if (!studentTags || studentTags.length === 0) {
      console.log('❌ 该学生没有技术标签数据');
      
      // 创建Java标签
      console.log('\n📝 为该学生创建Java技术标签...');
      const { data: newTag, error: createError } = await supabase
        .from('student_technical_tags')
        .insert({
          student_profile_id: profile.id,
          tag_name: 'Java',
          tag_category: 'programming_language',
          proficiency_level: 'intermediate',
          description: 'Java编程语言学习和实践',
          learned_at: new Date().toISOString().split('T')[0],
          learning_hours: 80,
          practice_projects: 3,
          confidence_score: 7,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ 创建Java标签失败:', createError.message);
        return;
      }

      console.log('✅ 成功创建Java技术标签:');
      console.log(`   标签ID: ${newTag.id}`);
      console.log(`   标签名称: ${newTag.tag_name}`);
      console.log(`   掌握程度: ${newTag.proficiency_level}`);
      
    } else {
      console.log(`✅ 找到 ${studentTags.length} 个技术标签:`);
      studentTags.forEach((tag, index) => {
        console.log(`   ${index + 1}. ${tag.tag_name} (${tag.tag_category}, ${tag.proficiency_level})`);
      });

      // 检查是否有Java标签
      const javaTag = studentTags.find(tag => tag.tag_name.toLowerCase().includes('java'));
      if (javaTag) {
        console.log('✅ 找到Java相关标签:', javaTag.tag_name);
      } else {
        console.log('❌ 没有找到Java相关标签');
        
        // 创建Java标签
        console.log('\n📝 为该学生创建Java技术标签...');
        const { data: newTag, error: createError } = await supabase
          .from('student_technical_tags')
          .insert({
            student_profile_id: profile.id,
            tag_name: 'Java',
            tag_category: 'programming_language',
            proficiency_level: 'intermediate',
            description: 'Java编程语言学习和实践',
            learned_at: new Date().toISOString().split('T')[0],
            learning_hours: 80,
            practice_projects: 3,
            confidence_score: 7,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ 创建Java标签失败:', createError.message);
          return;
        }

        console.log('✅ 成功创建Java技术标签');
      }
    }

    // 4. 查找教师信息
    console.log('\n4. 查找教师信息...');
    const { data: teachers, error: teacherError } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('role_id', '2')
      .limit(5);

    if (teacherError) {
      console.error('❌ 查找教师失败:', teacherError.message);
      return;
    }

    if (!teachers || teachers.length === 0) {
      console.log('❌ 没有找到教师信息');
      return;
    }

    console.log(`✅ 找到 ${teachers.length} 个教师:`);
    teachers.forEach((teacher, index) => {
      console.log(`   ${index + 1}. ${teacher.full_name} (ID: ${teacher.id})`);
    });

    const testTeacher = teachers[0]; // 使用第一个教师进行测试

    // 5. 检查师生关联
    console.log('\n5. 检查师生关联...');
    const { data: relation, error: relationError } = await supabase
      .from('teacher_students')
      .select('*')
      .eq('teacher_id', testTeacher.id)
      .eq('student_id', targetStudent.id);

    if (relationError) {
      console.error('❌ 查找师生关联失败:', relationError.message);
      return;
    }

    if (!relation || relation.length === 0) {
      console.log('❌ 该学生没有被这个教师管理，创建关联...');
      
      const { data: newRelation, error: createRelationError } = await supabase
        .from('teacher_students')
        .insert({
          teacher_id: testTeacher.id,
          student_id: targetStudent.id
        })
        .select()
        .single();

      if (createRelationError) {
        console.error('❌ 创建师生关联失败:', createRelationError.message);
        return;
      }

      console.log('✅ 成功创建师生关联');
    } else {
      console.log('✅ 师生关联已存在');
    }

    // 6. 模拟Java标签搜索
    console.log('\n6. 模拟Java标签搜索...');
    console.log(`使用教师: ${testTeacher.full_name} (ID: ${testTeacher.id})`);
    console.log('搜索标签: "Java"');

    // 获取教师管理的学生
    const { data: teacherStudents, error: teacherStudentsError } = await supabase
      .from('teacher_students')
      .select('student_id')
      .eq('teacher_id', testTeacher.id);

    if (teacherStudentsError) {
      console.error('❌ 获取教师学生失败:', teacherStudentsError.message);
      return;
    }

    console.log(`✅ 教师管理 ${teacherStudents?.length || 0} 个学生`);

    // 执行Java标签搜索
    const studentUserIds = teacherStudents?.map(ts => ts.student_id) || [];
    
    const { data: searchResult, error: searchError } = await supabase
      .from('student_technical_tags')
      .select(`
        student_profile_id,
        tag_name,
        tag_category,
        proficiency_level,
        student_profiles!inner(
          user_id,
          user_number,
          full_name,
          class_name,
          email,
          phone
        )
      `)
      .eq('tag_name', 'Java')
      .eq('status', 'active')
      .in('student_profiles.user_id', studentUserIds);

    if (searchError) {
      console.error('❌ Java标签搜索失败:', searchError.message);
      console.error('详细错误:', searchError);
      return;
    }

    console.log(`✅ Java标签搜索结果: 找到 ${searchResult?.length || 0} 个学生`);

    if (searchResult && searchResult.length > 0) {
      searchResult.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.student_profiles.full_name} (${result.student_profiles.user_number})`);
        console.log(`      班级: ${result.student_profiles.class_name}`);
        console.log(`      技术标签: ${result.tag_name} (${result.tag_category}, ${result.proficiency_level})`);
      });
    }

    // 7. 测试模糊搜索
    console.log('\n7. 测试Java模糊搜索...');
    const { data: fuzzyResult, error: fuzzyError } = await supabase
      .from('student_technical_tags')
      .select(`
        student_profile_id,
        tag_name,
        student_profiles!inner(
          user_id,
          user_number,
          full_name
        )
      `)
      .ilike('tag_name', '%java%')
      .eq('status', 'active')
      .in('student_profiles.user_id', studentUserIds);

    if (fuzzyError) {
      console.error('❌ 模糊搜索失败:', fuzzyError.message);
    } else {
      console.log(`✅ 模糊搜索结果: 找到 ${fuzzyResult?.length || 0} 个Java相关标签`);
      if (fuzzyResult && fuzzyResult.length > 0) {
        fuzzyResult.forEach((result, index) => {
          console.log(`   ${index + 1}. ${result.student_profiles.full_name} - ${result.tag_name}`);
        });
      }
    }

    console.log('\n=== 调试完成 ===');
    console.log('\n📝 总结:');
    console.log(`- 目标学生: ${targetStudent.full_name} (${targetStudent.user_number})`);
    console.log(`- Java标签: ${studentTags?.some(tag => tag.tag_name.toLowerCase().includes('java')) ? '已存在' : '已创建'}`);
    console.log(`- 师生关联: ${relation?.length > 0 ? '已存在' : '已创建'}`);
    console.log('- 搜索测试: 已完成');

  } catch (error) {
    console.error('调试过程中发生错误:', error);
  }
}

// 运行调试
debugJavaSearch();