const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function debugStudentInfoConflict() {
  console.log('=== 检查学生信息填写与培养方案显示的冲突 ===');
  
  try {
    // 1. 获取一个测试学生
    console.log('\n1. 获取测试学生:');
    const { data: students, error: studentError } = await supabase
      .from('users')
      .select('*')
      .like('user_number', '20%')
      .limit(3);
      
    if (studentError) {
      console.error('❌ 获取学生失败:', studentError);
      return;
    }
    
    const testStudent = students[0]; // 选择第一个学生
    console.log(`测试学生: ${testStudent.full_name} (${testStudent.user_number})`);
    console.log(`用户ID: ${testStudent.id}`);
    
    // 2. 检查该学生的档案记录
    console.log('\n2. 检查学生档案记录:');
    const { data: profiles, error: profileError } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', testStudent.id);
      
    if (profileError) {
      console.error('❌ 查询档案失败:', profileError);
      return;
    }
    
    console.log(`找到 ${profiles.length} 个档案记录:`);
    profiles.forEach((profile, index) => {
      console.log(`  档案 ${index + 1}:`);
      console.log(`    ID: ${profile.id}`);
      console.log(`    用户ID: ${profile.user_id}`);
      console.log(`    状态: ${profile.profile_status || '未设置'}`);
      console.log(`    专业: ${profile.major || '未设置'}`);
      console.log(`    班级: ${profile.class_name || '未设置'}`);
      console.log(`    创建时间: ${profile.created_at}`);
      console.log(`    更新时间: ${profile.updated_at}`);
    });
    
    // 3. 检查培养方案分配记录
    console.log('\n3. 检查培养方案分配记录:');
    for (const profile of profiles) {
      const { data: assignments, error: assignError } = await supabase
        .from('student_training_programs')
        .select('*')
        .eq('student_id', profile.id)
        .eq('status', 'active');
        
      if (assignError) {
        console.error(`❌ 查询档案 ${profile.id} 的分配记录失败:`, assignError);
      } else {
        console.log(`  档案 ${profile.id.substring(0, 8)}... 有 ${assignments.length} 个分配记录:`);
        assignments.forEach((assign, index) => {
          console.log(`    分配 ${index + 1}: 培养方案 ${assign.program_id} - 状态 ${assign.status}`);
        });
        
        if (assignments.length > 0) {
          // 4. 模拟学生端API查询
          console.log('\n4. 模拟学生端培养方案查询:');
          console.log(`使用档案ID: ${profile.id}`);
          console.log(`对应用户ID: ${testStudent.id}`);
          
          const { data: studentPrograms, error: programError } = await supabase
            .from('student_training_programs')
            .select(`
              *,
              training_programs (
                id,
                program_name,
                program_description,
                duration_years,
                created_at
              )
            `)
            .eq('student_id', profile.id)
            .eq('status', 'active');
            
          if (programError) {
            console.error(`❌ 学生端查询失败:`, programError);
          } else {
            console.log(`✅ 学生端能看到 ${studentPrograms.length} 个培养方案:`);
            studentPrograms.forEach((prog, index) => {
              console.log(`  ${index + 1}. ${prog.training_programs?.program_name || '未命名'}`);
            });
            
            if (studentPrograms.length > 0) {
              // 5. 查询课程
              console.log('\n5. 查询培养方案课程:');
              const programId = studentPrograms[0].program_id;
              const { data: courses, error: courseError } = await supabase
                .from('training_program_courses')
                .select('*')
                .eq('program_id', programId);
                
              if (courseError) {
                console.error('❌ 查询课程失败:', courseError);
              } else {
                console.log(`✅ 找到 ${courses.length} 门课程:`);
                courses.forEach((course, index) => {
                  console.log(`  ${index + 1}. ${course.course_name} - ${course.credits}学分`);
                });
              }
            }
          }
        }
      }
    }
    
    // 6. 分析问题
    console.log('\n=== 问题分析 ===');
    console.log('可能的原因:');
    console.log('1. 学生填写信息后，可能创建了新的档案记录');
    console.log('2. 旧的分配记录关联的是旧档案ID，新的查询找不到');
    console.log('3. 培养方案分配逻辑与学生信息更新逻辑有冲突');
    console.log('4. 档案状态字段影响了查询结果');
    
  } catch (error) {
    console.error('检查过程中出现错误:', error);
  }
}

debugStudentInfoConflict().catch(console.error);