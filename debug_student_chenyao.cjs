// 调试陈瑶（2023011）的培养方案分配和课程显示问题
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const debugStudentChenyao = async () => {
  console.log('🔍 调试陈瑶（2023011）的培养方案分配和课程显示问题...\n');

  try {
    // 1. 查找用户名为2023011的用户
    console.log('📋 1. 查找用户2023011:');
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', '2023011');
    
    if (userError || !user || user.length === 0) {
      console.error('❌ 未找到用户2023011:', userError?.message);
      return;
    }
    
    const chenyaoUser = user[0];
    console.log('✅ 找到用户:');
    console.log(`- 用户ID: ${chenyaoUser.id}`);
    console.log(`- 用户名: ${chenyaoUser.username}`);
    console.log(`- 姓名: ${chenyaoUser.full_name || 'N/A'}`);
    console.log(`- 邮箱: ${chenyaoUser.email}`);
    console.log(`- 角色ID: ${chenyaoUser.role_id}`);

    // 2. 查找该学生的档案信息
    console.log('\n📋 2. 查找学生档案:');
    const { data: profile, error: profileError } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', chenyaoUser.id);
    
    if (profileError) {
      console.error('❌ 查找学生档案失败:', profileError.message);
      return;
    }
    
    if (!profile || profile.length === 0) {
      console.log('❌ 该用户没有学生档案，正在创建...');
      
      // 创建学生档案
      const { data: newProfile, error: createError } = await supabase
        .from('student_profiles')
        .insert({
          user_id: chenyaoUser.id,
          student_number: chenyaoUser.username,
          full_name: '陈瑶',
          class_name: '未分配班级',
          enrollment_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ 创建学生档案失败:', createError.message);
        return;
      }
      
      console.log('✅ 成功创建学生档案:');
      console.log(`- 档案ID: ${newProfile.id}`);
      console.log(`- 用户ID: ${newProfile.user_id}`);
      profile = [newProfile];
    } else {
      console.log('✅ 找到学生档案:');
      profile.forEach((p, index) => {
        console.log(`档案 ${index + 1}:`);
        console.log(`- 档案ID: ${p.id}`);
        console.log(`- 用户ID: ${p.user_id}`);
        console.log(`- 姓名: ${p.full_name || 'N/A'}`);
        console.log(`- 学号: ${p.student_number || 'N/A'}`);
      });
    }

    const studentProfile = profile[0];

    // 3. 检查培养方案分配状态
    console.log('\n📋 3. 检查培养方案分配状态:');
    const { data: assignments, error: assignmentError } = await supabase
      .from('student_training_programs')
      .select(`
        *,
        training_programs (*)
      `)
      .eq('student_id', studentProfile.id);
    
    if (assignmentError) {
      console.error('❌ 检查分配状态失败:', assignmentError.message);
      return;
    }
    
    if (!assignments || assignments.length === 0) {
      console.log('❌ 该学生没有分配培养方案，正在执行分配...');
      
      // 执行分配
      const teacherId = '00000000-0000-0000-0000-000000000001';
      const programId = '00000000-0000-0000-0000-000000000001';
      
      const { data: assignResult, error: assignError } = await supabase
        .from('student_training_programs')
        .insert({
          student_id: studentProfile.id,
          program_id: programId,
          enrollment_date: new Date().toISOString().split('T')[0],
          status: 'active',
          notes: '为陈瑶分配培养方案',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (assignError) {
        console.error('❌ 分配培养方案失败:', assignError.message);
        return;
      }
      
      console.log('✅ 成功分配培养方案:');
      console.log(`- 分配ID: ${assignResult[0].id}`);
      console.log(`- 培养方案ID: ${programId}`);
      
      // 重新查询分配状态
      const { data: newAssignments } = await supabase
        .from('student_training_programs')
        .select('*, training_programs (*)')
        .eq('student_id', studentProfile.id);
      assignments = newAssignments;
    } else {
      console.log('✅ 找到培养方案分配:');
      assignments.forEach((assignment, index) => {
        console.log(`分配 ${index + 1}:`);
        console.log(`- 分配ID: ${assignment.id}`);
        console.log(`- 培养方案ID: ${assignment.program_id}`);
        console.log(`- 状态: ${assignment.status}`);
        console.log(`- 注册日期: ${assignment.enrollment_date}`);
        if (assignment.training_programs) {
          console.log(`- 方案名称: ${assignment.training_programs.name || 'N/A'}`);
        }
      });
    }

    // 4. 测试学生端API调用
    console.log('\n📋 4. 测试学生端课程API:');
    const apiResponse = await fetch(`http://localhost:3001/api/student/${chenyaoUser.id}/training-program-courses`);
    const apiResult = await apiResponse.json();
    
    console.log(`API状态: ${apiResponse.status}`);
    console.log(`API结果: ${apiResult.success ? '✅ 成功' : '❌ 失败'}`);
    console.log(`课程数量: ${apiResult.data?.length || 0}`);
    
    if (apiResult.success && apiResult.data) {
      console.log('\n📚 返回的课程列表:');
      apiResult.data.forEach((course, index) => {
        console.log(`${index + 1}. ${course.course_number} - ${course.course_name} (${course.credits}学分)`);
      });
    } else {
      console.log(`错误信息: ${apiResult.message || 'N/A'}`);
    }

    // 5. 直接测试数据库函数
    console.log('\n📋 5. 直接测试数据库函数:');
    const { data: dbResult, error: dbError } = await supabase.rpc('get_student_training_program_courses', {
      p_student_id: studentProfile.id
    });
    
    console.log(`数据库函数调用: ${dbError ? '❌ 失败' : '✅ 成功'}`);
    console.log(`错误信息: ${dbError?.message || 'N/A'}`);
    console.log(`数据库返回课程数: ${dbResult?.length || 0}`);
    
    if (dbResult && dbResult.length > 0) {
      console.log('\n📚 数据库函数返回的课程:');
      dbResult.forEach((course, index) => {
        console.log(`${index + 1}. ${course.course_number} - ${course.course_name} (${course.credits}学分)`);
      });
    }

    console.log('\n🎯 陈瑶(2023011)调试总结:');
    console.log(`1. 用户ID: ${chenyaoUser.id}`);
    console.log(`2. 档案ID: ${studentProfile.id}`);
    console.log(`3. 分配状态: ${assignments && assignments.length > 0 ? '✅ 已分配' : '❌ 未分配'}`);
    console.log(`4. API测试: ${apiResult.success && apiResult.data && apiResult.data.length > 0 ? '✅ 返回课程' : '❌ 无课程'}`);
    console.log(`5. 数据库函数: ${!dbError && dbResult && dbResult.length > 0 ? '✅ 返回数据' : '❌ 无数据'}`);

  } catch (error) {
    console.error('❌ 调试过程中发生错误:', error);
  }
};

debugStudentChenyao();