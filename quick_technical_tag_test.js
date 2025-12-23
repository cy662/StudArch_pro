// 快速技术标签功能测试
const { createClient } = require('@supabase/supabase-js');

// 使用实际的数据库配置
const supabaseUrl = 'https://mddpbyibesqewcktlqle.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZHBieWliZXNxZXdja3RscWxlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM1NDM0OSwiZXhwIjoyMDc4OTMwMzQ5fQ.P2Y3IaRqJn6Tf7NjaHztGSd__3bTb_aBVioKoIK9Rq8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function quickTechnicalTagTest() {
  try {
    console.log('=== 快速技术标签功能测试 ===\n');

    // 1. 检查现有的技术标签数据
    console.log('1. 检查现有技术标签数据...');
    const { data: existingTags, error: tagsError } = await supabase
      .from('student_technical_tags')
      .select(`
        id,
        tag_name,
        student_profile_id,
        status,
        student_profiles!inner(
          user_id,
          full_name,
          user_number
        )
      `)
      .eq('status', 'active')
      .limit(10);

    if (tagsError) {
      console.error('❌ 查询技术标签失败:', tagsError.message);
      return;
    }

    if (!existingTags || existingTags.length === 0) {
      console.log('❌ 没有找到技术标签数据，创建测试数据...');
      await createTestData();
      return;
    }

    console.log(`✅ 找到 ${existingTags.length} 个技术标签:`);
    existingTags.forEach((tag, index) => {
      console.log(`   ${index + 1}. ${tag.tag_name} - ${tag.student_profiles.full_name} (${tag.student_profiles.user_number})`);
      console.log(`      档案ID: ${tag.student_profile_id}, 用户ID: ${tag.student_profiles.user_id}`);
    });

    // 2. 检查教师数据
    console.log('\n2. 检查教师数据...');
    const { data: teachers, error: teacherError } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('role_id', '2')
      .limit(3);

    if (teacherError) {
      console.error('❌ 查询教师失败:', teacherError.message);
      return;
    }

    if (!teachers || teachers.length === 0) {
      console.log('❌ 没有找到教师数据');
      return;
    }

    console.log(`✅ 找到 ${teachers.length} 个教师:`);
    teachers.forEach((teacher, index) => {
      console.log(`   ${index + 1}. ${teacher.full_name} (ID: ${teacher.id})`);
    });

    const testTeacher = teachers[0];
    console.log(`\n📋 使用测试教师: ${testTeacher.full_name}`);

    // 3. 检查师生关联
    console.log('\n3. 检查师生关联...');
    const { data: teacherStudents, error: relationError } = await supabase
      .from('teacher_students')
      .select('student_id')
      .eq('teacher_id', testTeacher.id);

    if (relationError) {
      console.error('❌ 查询师生关联失败:', relationError.message);
      return;
    }

    if (!teacherStudents || teacherStudents.length === 0) {
      console.log('⚠️ 该教师没有管理任何学生，尝试创建关联...');
      await createTeacherStudentRelation(testTeacher.id, existingTags[0]?.student_profiles?.user_id);
      return;
    }

    console.log(`✅ 教师管理 ${teacherStudents.length} 个学生:`);
    teacherStudents.slice(0, 5).forEach((relation, index) => {
      console.log(`   ${index + 1}. 学生ID: ${relation.student_id}`);
    });

    // 4. 测试技术标签搜索
    console.log('\n4. 测试技术标签搜索...');
    const testTag = existingTags[0].tag_name;
    console.log(`🔍 搜索标签: "${testTag}"`);

    const studentUserIds = teacherStudents.map(ts => ts.student_id);
    console.log(`教师管理的学生用户ID: ${studentUserIds.slice(0, 3)}`);

    // 执行搜索 - 使用正确的关联逻辑
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
          class_name,
          email,
          phone
        )
      `)
      .eq('tag_name', testTag)
      .eq('status', 'active')
      .in('student_profiles.user_id', studentUserIds);

    if (searchError) {
      console.error('❌ 搜索失败:', searchError.message);
      console.error('详细错误:', searchError);
      return;
    }

    console.log(`✅ 搜索成功，找到 ${searchResult.length} 个匹配的学生:`);
    searchResult.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.student_profiles.full_name} (${result.student_profiles.user_number})`);
      console.log(`      班级: ${result.student_profiles.class_name}`);
      console.log(`      邮箱: ${result.student_profiles.email}`);
      console.log(`      技术标签: ${result.tag_name} (${result.tag_category}, ${result.proficiency_level})`);
    });

    // 5. 测试前端API调用
    console.log('\n5. 测试前端API调用逻辑...');
    console.log('模拟前端调用 getStudentsByTechnicalTag...');
    
    // 这里我们模拟 UserService.getStudentsByTechnicalTag 的逻辑
    const apiResult = await simulateFrontendAPICall(testTeacher.id, testTag);
    console.log('API调用结果:', apiResult);

    console.log('\n=== 测试完成 ===');
    console.log('\n📝 前端测试建议:');
    console.log(`1. 登录教师账号: ${testTeacher.full_name}`);
    console.log('2. 进入"我的学生"页面');
    console.log(`3. 在技术标签搜索框输入: ${testTag}`);
    console.log('4. 点击搜索或等待自动搜索');
    console.log('5. 查看是否能显示上述学生');

  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 创建测试数据
async function createTestData() {
  console.log('创建测试数据...');
  
  // 获取学生档案
  const { data: profiles, error: profileError } = await supabase
    .from('student_profiles')
    .select('id, user_id, full_name, user_number')
    .limit(5);

  if (profileError || !profiles || profiles.length === 0) {
    console.log('❌ 没有找到学生档案，请先创建学生数据');
    return;
  }

  // 创建测试技术标签
  const testTags = [
    { tag_name: 'JavaScript', tag_category: 'programming_language', proficiency_level: 'intermediate' },
    { tag_name: 'React', tag_category: 'framework', proficiency_level: 'intermediate' },
    { tag_name: 'Python', tag_category: 'programming_language', proficiency_level: 'advanced' }
  ];

  for (const profile of profiles.slice(0, 3)) {
    const tag = testTags[Math.floor(Math.random() * testTags.length)];
    
    const { data, error } = await supabase
      .from('student_technical_tags')
      .insert({
        student_profile_id: profile.id,
        tag_name: tag.tag_name,
        tag_category: tag.tag_category,
        proficiency_level: tag.proficiency_level,
        description: `学习${tag.tag_name}相关的技术`,
        learned_at: new Date().toISOString().split('T')[0],
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error(`❌ 创建标签失败:`, error);
    } else {
      console.log(`✅ 创建标签: ${tag.tag_name} for ${profile.full_name}`);
    }
  }
}

// 创建师生关联
async function createTeacherStudentRelation(teacherId, studentUserId) {
  if (!teacherId || !studentUserId) {
    console.log('❌ 缺少教师ID或学生ID');
    return;
  }

  const { data, error } = await supabase
    .from('teacher_students')
    .insert({
      teacher_id: teacherId,
      student_id: studentUserId
    })
    .select()
    .single();

  if (error) {
    console.error('❌ 创建师生关联失败:', error);
  } else {
    console.log('✅ 创建师生关联成功');
  }
}

// 模拟前端API调用
async function simulateFrontendAPICall(teacherId, tagName) {
  try {
    // 模拟 UserService.getStudentsByTechnicalTag 的逻辑
    const { data: teacherStudents, error: teacherError } = await supabase
      .from('teacher_students')
      .select('student_id')
      .eq('teacher_id', teacherId);

    if (teacherError) {
      throw new Error(`获取教师学生列表失败: ${teacherError.message}`);
    }

    if (!teacherStudents || teacherStudents.length === 0) {
      return { students: [], total: 0 };
    }

    const studentUserIds = teacherStudents.map(ts => ts.student_id);

    const { data: tagData, error: tagError, count } = await supabase
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
          email,
          phone,
          class_name,
          status,
          users!inner(
            username,
            created_at,
            role:roles(*)
          )
        )
      `, { count: 'exact' })
      .eq('tag_name', tagName)
      .eq('status', 'active')
      .in('student_profiles.user_id', studentUserIds);

    if (tagError) {
      throw new Error(`搜索技术标签失败: ${tagError.message}`);
    }

    const students = (tagData || []).map(item => {
      const profile = item.student_profiles;
      const user = profile.users;
      return {
        id: profile.user_id,
        profile_id: item.student_profile_id,
        username: user.username || '',
        email: profile.email || '',
        full_name: profile.full_name || '',
        user_number: profile.user_number || '',
        phone: profile.phone || '',
        class_name: profile.class_name || '待分配',
        status: profile.status === 'active' ? '在读' : '其他',
        role: user.role,
        technical_tag: {
          tag_name: item.tag_name,
          tag_category: item.tag_category,
          proficiency_level: item.proficiency_level
        }
      };
    });

    return {
      students,
      total: count || 0
    };
  } catch (error) {
    console.error('模拟前端API调用失败:', error);
    return { students: [], total: 0 };
  }
}

// 运行快速测试
quickTechnicalTagTest();