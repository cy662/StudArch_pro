// 检查数据库字段名
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mddpbyibesqewcktlqle.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZHBieWliZXNxZXdja3RscWxlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM1NDM0OSwiZXhwIjoyMDc4OTMwMzQ5fQ.P2Y3IaRqJn6Tf7NjaHztGSd__3bTb_aBVioKoIK9Rq8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFieldNames() {
  try {
    console.log('=== 检查数据库字段名 ===\n');

    // 1. 检查student_profiles表结构
    console.log('1. 检查student_profiles表字段...');
    const { data: profileColumns, error: profileError } = await supabase
      .rpc('get_table_columns', { table_name: 'student_profiles' });

    if (profileError) {
      console.log('使用替代方法检查字段...');
      // 替代方法：查询一条记录看字段
      const { data: profileSample, error: sampleError } = await supabase
        .from('student_profiles')
        .select('*')
        .limit(1);

      if (sampleError) {
        console.error('❌ 获取student_profiles样本失败:', sampleError.message);
      } else if (profileSample && profileSample.length > 0) {
        console.log('student_profiles字段:', Object.keys(profileSample[0]));
      }
    } else {
      console.log('student_profiles字段:', profileColumns);
    }

    // 2. 检查users表结构
    console.log('\n2. 检查users表字段...');
    const { data: userSample, error: userError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (userError) {
      console.error('❌ 获取users样本失败:', userError.message);
    } else if (userSample && userSample.length > 0) {
      console.log('users字段:', Object.keys(userSample[0]));
    }

    // 3. 检查student_technical_tags表结构
    console.log('\n3. 检查student_technical_tags表字段...');
    const { data: tagSample, error: tagError } = await supabase
      .from('student_technical_tags')
      .select('*')
      .limit(1);

    if (tagError) {
      console.error('❌ 获取student_technical_tags样本失败:', tagError.message);
    } else if (tagSample && tagSample.length > 0) {
      console.log('student_technical_tags字段:', Object.keys(tagSample[0]));
    }

    // 4. 测试正确的关联查询
    console.log('\n4. 测试正确的关联查询...');
    const { data: testJoin, error: joinError } = await supabase
      .from('student_technical_tags')
      .select(`
        student_profile_id,
        tag_name,
        student_profiles (
          user_id,
          full_name
        )
      `)
      .eq('status', 'active')
      .limit(1);

    if (joinError) {
      console.error('❌ 测试关联查询失败:', joinError.message);
    } else {
      console.log('✅ 关联查询成功');
      if (testJoin && testJoin.length > 0) {
        console.log('关联查询结果:', testJoin[0]);
      }
    }

    // 5. 测试Java搜索（简化版）
    console.log('\n5. 测试Java搜索（简化版）...');
    
    // 先获取学生2023015701的ID
    const { data: targetUser, error: userFindError } = await supabase
      .from('users')
      .select('id')
      .eq('user_number', '2023015701')
      .single();

    if (userFindError) {
      console.error('❌ 查找目标用户失败:', userFindError.message);
      return;
    }

    // 查找该学生的Java标签
    const { data: javaTags, error: javaFindError } = await supabase
      .from('student_technical_tags')
      .select(`
        tag_name,
        student_profiles (
          user_id
        )
      `)
      .ilike('tag_name', '%java%')
      .eq('status', 'active')
      .eq('student_profiles.user_id', targetUser.id);

    if (javaFindError) {
      console.error('❌ Java搜索失败:', javaFindError.message);
    } else {
      console.log('✅ Java搜索成功，找到标签:', javaTags);
    }

    // 6. 检查师生关联查询
    console.log('\n6. 测试师生关联查询...');
    const { data: teacherJoin, error: teacherJoinError } = await supabase
      .from('teacher_students')
      .select(`
        teacher_id,
        student_id,
        users!teacher_students_student_id_fkey (
          user_number,
          full_name
        )
      `)
      .limit(1);

    if (teacherJoinError) {
      console.error('❌ 师生关联查询失败:', teacherJoinError.message);
    } else {
      console.log('✅ 师生关联查询成功');
      if (teacherJoin && teacherJoin.length > 0) {
        console.log('关联学生:', teacherJoin[0].users);
      }
    }

    console.log('\n=== 字段检查完成 ===');

  } catch (error) {
    console.error('检查过程中发生错误:', error);
  }
}

// 运行检查
checkFieldNames();