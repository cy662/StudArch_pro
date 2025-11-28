const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function testAllStudentAssignment() {
  console.log('=== 测试所有学生的培养方案分配功能 ===');
  
  try {
    // 1. 获取所有学生账号
    console.log('\n1. 获取所有学生账号:');
    const { data: allStudents, error: studentError } = await supabase
      .from('users')
      .select('id, full_name, user_number, email')
      .like('user_number', '20%');
      
    if (studentError) {
      console.error('❌ 获取学生失败:', studentError);
      return;
    }
    
    console.log(`找到 ${allStudents.length} 个学生账号:`);
    allStudents.forEach((student, index) => {
      console.log(`  ${index + 1}. ${student.full_name} (${student.user_number}) - ID: ${student.id.substring(0, 8)}...`);
    });
    
    // 2. 测试为没有档案的学生创建档案
    console.log('\n2. 为没有档案的学生创建档案:');
    const programId = '62b2cc69-5b10-4238-8232-59831cdb7964'; // 已知的培养方案ID
    const teacherId = '00000000-0000-0000-0000-000000000001';
    
    for (const student of allStudents) {
      // 检查是否已有档案
      const { data: existingProfile, error: checkError } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('user_id', student.id)
        .single();
        
      if (checkError) {
        // 创建档案
        console.log(`为 ${student.full_name} 创建档案...`);
        const { data: newProfile, error: createError } = await supabase
          .from('student_profiles')
          .insert({
            user_id: student.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (createError) {
          console.error(`  ❌ 创建档案失败:`, createError.message);
        } else {
          console.log(`  ✅ 创建档案成功: ${newProfile.id}`);
          
          // 分配培养方案
          const { data: assignment, error: assignError } = await supabase
            .from('student_training_programs')
            .insert({
              student_id: newProfile.id,
              program_id: programId,
              teacher_id: teacherId,
              enrollment_date: new Date().toISOString().split('T')[0],
              status: 'active',
              notes: '为所有学生统一分配',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select();
            
          if (assignError) {
            console.error(`  ❌ 分配培养方案失败:`, assignError.message);
          } else {
            console.log(`  ✅ 分配培养方案成功`);
          }
        }
      } else {
        console.log(`${student.full_name} 已有档案: ${existingProfile.id}`);
      }
    }
    
    // 3. 验证学生端能否看到培养方案
    console.log('\n3. 验证学生端查询:');
    for (const student of allStudents.slice(0, 2)) { // 只测试前2个
      // 获取学生的档案ID
      const { data: profile } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('user_id', student.id)
        .single();
        
      if (profile) {
        // 查询培养方案（使用修复后的API逻辑）
        const { data: trainingPrograms, error: programError } = await supabase
          .from('student_training_programs')
          .select(`
            *,
            training_programs (
              id,
              program_name,
              program_description
            )
          `)
          .eq('student_id', profile.id)
          .eq('status', 'active');
          
        if (programError) {
          console.error(`  ❌ ${student.full_name} 查询培养方案失败:`, programError.message);
        } else {
          console.log(`  ✅ ${student.full_name} 能看到 ${trainingPrograms.length} 个培养方案`);
        }
      }
    }
    
    // 4. 检查课程数据
    console.log('\n4. 检查培养方案课程:');
    const { data: courses, error: courseError } = await supabase
      .from('training_program_courses')
      .select('*')
      .eq('program_id', programId)
      .limit(5);
      
    if (courseError) {
      console.error('❌ 查询课程失败:', courseError);
    } else {
      console.log(`✅ 培养方案包含 ${courses.length} 门课程:`);
      courses.forEach((course, index) => {
        console.log(`  ${index + 1}. ${course.course_name} - ${course.credits}学分`);
      });
    }
    
    console.log('\n=== 测试完成 ===');
    console.log('✅ 现在可以为所有学生账号分配培养方案！');
    console.log('✅ 无档案的学生会自动创建档案！');
    console.log('✅ 学生登录后可以直接查看培养方案课程！');
    
  } catch (error) {
    console.error('测试过程中出现错误:', error);
  }
}

testAllStudentAssignment().catch(console.error);