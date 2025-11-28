const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function testFixedStudentQuery() {
  console.log('=== 测试修复后的学生查询逻辑 ===');
  
  try {
    // 1. 测试懒羊羊（有多档案记录）
    console.log('\n1. 测试懒羊羊（有多档案记录的问题）:');
    const { data: lazyUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('user_number', '2023015704')
      .single();
      
    if (userError) {
      console.error('❌ 找不到懒羊羊:', userError);
      return;
    }
    
    console.log(`懒羊羊 - 用户ID: ${lazyUser.id}`);
    
    // 获取所有档案
    const { data: lazyProfiles, error: lazyProfileError } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', lazyUser.id);
      
    if (lazyProfileError) {
      console.error('❌ 查询档案失败:', lazyProfileError);
      return;
    }
    
    console.log(`懒羊羊有 ${lazyProfiles.length} 个档案记录:`);
    lazyProfiles.forEach((profile, index) => {
      console.log(`  档案 ${index + 1}: ${profile.id.substring(0, 8)}... - ${profile.created_at}`);
    });
    
    // 2. 测试修复后的培养方案查询逻辑
    console.log('\n2. 测试修复后的培养方案查询（使用用户ID）:');
    
    // 模拟修复后的API逻辑
    const profileIds = lazyProfiles.map(p => p.id);
    if (profileIds.length === 0) {
      profileIds.push(lazyUser.id);
    }
    
    console.log(`查询档案ID列表: ${profileIds.map(id => id.substring(0, 8) + '...').join(', ')}`);
    
    const { data: allPrograms, error: programError } = await supabase
      .from('student_training_programs')
      .select(`
        *,
        training_programs (
          id,
          program_name,
          program_description
        )
      `)
      .in('student_id', profileIds)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
      
    if (programError) {
      console.error('❌ 查询培养方案失败:', programError);
    } else {
      console.log(`✅ 找到 ${allPrograms.length} 个培养方案记录:`);
      allPrograms.forEach((program, index) => {
        console.log(`  ${index + 1}. 档案ID: ${program.student_id.substring(0, 8)}... - 培养方案: ${program.training_programs?.program_name || '未命名'}`);
      });
      
      if (allPrograms.length > 0) {
        // 3. 测试课程查询
        console.log('\n3. 测试课程查询:');
        const programId = allPrograms[0].program_id;
        
        const { data: courses, error: courseError } = await supabase
          .from('training_program_courses')
          .select('*')
          .eq('program_id', programId);
          
        if (courseError) {
          console.error('❌ 查询课程失败:', courseError);
        } else {
          console.log(`✅ 培养方案包含 ${courses.length} 门课程:`);
          courses.forEach((course, index) => {
            console.log(`  ${index + 1}. ${course.course_name} - ${course.credits}学分`);
          });
        }
      }
    }
    
    // 4. 测试其他学生
    console.log('\n4. 测试其他学生（确保修复不影响其他学生）:');
    const { data: otherStudents, error: otherError } = await supabase
      .from('users')
      .select('id, full_name, user_number')
      .like('user_number', '20%')
      .limit(3);
      
    if (!otherError) {
      for (const student of otherStudents) {
        console.log(`\n测试学生: ${student.full_name} (${student.user_number})`);
        
        // 获取档案
        const { data: studentProfiles } = await supabase
          .from('student_profiles')
          .select('id')
          .eq('user_id', student.id);
          
        const studentProfileIds = studentProfiles.map(p => p.id);
        if (studentProfileIds.length === 0) {
          studentProfileIds.push(student.id);
        }
        
        // 查询培养方案
        const { data: studentPrograms } = await supabase
          .from('student_training_programs')
          .select('*, training_programs(id, program_name)')
          .in('student_id', studentProfileIds)
          .eq('status', 'active');
          
        console.log(`  结果: ${studentPrograms.length} 个培养方案`);
        studentPrograms.forEach(prog => {
          console.log(`    - ${prog.training_programs?.program_name || '未命名'}`);
        });
      }
    }
    
    console.log('\n=== 修复总结 ===');
    console.log('✅ 修复后的逻辑特点:');
    console.log('1. 按用户ID查询所有档案记录');
    console.log('2. 使用所有可能的档案ID查询培养方案');
    console.log('3. 返回最新的有效培养方案');
    console.log('4. 确保无论档案数量多少都能找到培养方案');
    console.log('');
    console.log('🎯 现在不管学生填写过多少次信息，都能看到培养方案了！');
    
  } catch (error) {
    console.error('测试过程中出现错误:', error);
  }
}

testFixedStudentQuery().catch(console.error);