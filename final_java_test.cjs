// 最终Java搜索测试
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mddpbyibesqewcktlqle.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZHBieWliZXNxZXdja3RscWxlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM1NDM0OSwiZXhwIjoyMDc4OTMwMzQ5fQ.P2Y3IaRqJn6Tf7NjaHztGSd__3bTb_aBVioKoIK9Rq8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function finalJavaTest() {
  try {
    console.log('🧪 最终Java搜索测试\n');

    // 1. 获取教师ID
    const { data: teacherData, error: teacherError } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('role_id', '2')
      .limit(1)
      .single();

    if (teacherError) {
      console.error('❌ 获取教师失败:', teacherError.message);
      return;
    }

    console.log('✅ 使用教师:', teacherData.full_name, '(', teacherData.id, ')');

    // 2. 获取教师管理的学生
    const { data: teacherStudents, error: studentsError } = await supabase
      .from('teacher_students')
      .select('student_id')
      .eq('teacher_id', teacherData.id);

    if (studentsError) {
      console.error('❌ 获取教师学生失败:', studentsError.message);
      return;
    }

    console.log('✅ 教师管理学生数量:', teacherStudents?.length || 0);

    const studentUserIds = teacherStudents?.map(ts => ts.student_id) || [];

    // 3. 测试Java搜索 - 使用正确字段
    console.log('\n🔍 测试Java搜索...');
    const { data: javaResults, error: javaError } = await supabase
      .from('student_technical_tags')
      .select(`
        student_profile_id,
        tag_name,
        tag_category,
        proficiency_level,
        student_profiles!inner(
          user_id,
          student_number,
          full_name,
          class_name,
          profile_status
        )
      `)
      .ilike('tag_name', '%java%')
      .eq('status', 'active')
      .in('student_profiles.user_id', studentUserIds);

    if (javaError) {
      console.error('❌ Java搜索失败:', javaError.message);
      console.error('详细错误:', javaError);
      return;
    }

    console.log('✅ Java搜索成功，找到', javaResults?.length || 0, '个学生');

    if (javaResults && javaResults.length > 0) {
      javaResults.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.student_profiles.full_name}`);
        console.log(`      学号: ${result.student_profiles.student_number}`);
        console.log(`      班级: ${result.student_profiles.class_name || '未分班'}`);
        console.log(`      标签: ${result.tag_name} (${result.tag_category}, ${result.proficiency_level})`);
        
        if (result.student_profiles.student_number === '2023015701') {
          console.log('      🎯 找到目标学生!');
        }
      });
    }

    // 4. 检查2023015701是否有Java标签
    console.log('\n🎯 专门检查学生2023015701...');
    const { data: targetUser, error: targetError } = await supabase
      .from('users')
      .select('id')
      .eq('user_number', '2023015701')
      .single();

    if (targetError) {
      console.error('❌ 查找目标学生失败:', targetError.message);
      return;
    }

    const { data: targetJavaTag, error: targetTagError } = await supabase
      .from('student_technical_tags')
      .select(`
        tag_name,
        student_profiles!inner(
          user_id,
          student_number,
          full_name
        )
      `)
      .ilike('tag_name', '%java%')
      .eq('status', 'active')
      .eq('student_profiles.user_id', targetUser.id);

    if (targetTagError) {
      console.error('❌ 查找目标学生Java标签失败:', targetTagError.message);
    } else {
      console.log('✅ 学生2023015701的Java标签:', targetJavaTag);
    }

    // 5. 如果没有找到，检查是否被教师管理
    if (!teacherStudents?.find(ts => ts.student_id === targetUser.id)) {
      console.log('⚠️ 学生2023015701没有被该教师管理');
      
      // 检查是否被其他教师管理
      const { data: allTeachers, error: allTeacherError } = await supabase
        .from('teacher_students')
        .select(`
          teacher_id,
          users!inner(
            full_name
          )
        `)
        .eq('student_id', targetUser.id);

      if (allTeacherError) {
        console.error('❌ 查找其他教师失败:', allTeacherError.message);
      } else {
        console.log('📋 学生2023015701被以下教师管理:');
        allTeachers?.forEach((relation, index) => {
          console.log(`   ${index + 1}. ${relation.users.full_name} (ID: ${relation.teacher_id})`);
        });
      }
    }

    console.log('\n🎯 测试总结:');
    console.log('- Java搜索结果:', javaResults?.length || 0, '个学生');
    console.log('- 目标学生Java标签:', targetJavaTag?.length || 0, '个');
    console.log('- 教师管理学生:', teacherStudents?.length || 0, '个');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

// 运行最终测试
finalJavaTest();