const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function testBatchAssignment() {
  console.log('=== 测试批量分配培养方案功能 ===');
  
  try {
    // 1. 获取两个学生的档案ID
    console.log('\n1. 获取学生档案ID...');
    const { data: profiles, error: profileError } = await supabase
      .from('student_profiles')
      .select('id, user_id')
      .limit(2);
      
    if (profileError) {
      console.error('查询档案失败:', profileError);
      return;
    }
    
    console.log('找到档案:', profiles.length, '个');
    const studentIds = profiles.map(p => p.id);
    console.log('档案ID列表:', studentIds);
    
    // 2. 获取培养方案ID
    console.log('\n2. 获取培养方案ID...');
    const { data: programs, error: programError } = await supabase
      .from('training_programs')
      .select('id, program_name')
      .limit(1);
      
    if (programError) {
      console.error('查询培养方案失败:', programError);
      return;
    }
    
    if (programs.length === 0) {
      console.log('❌ 没有找到培养方案');
      return;
    }
    
    const programId = programs[0].id;
    console.log('培养方案ID:', programId, '名称:', programs[0].program_name);
    
    // 3. 测试批量分配（模拟API调用）
    console.log('\n3. 模拟批量分配...');
    const teacherId = '00000000-0000-0000-0000-000000000001';
    
    let success_count = 0;
    let failure_count = 0;
    const failed_students = [];
    
    for (const studentId of studentIds) {
      try {
        console.log(`\n处理学生 ${studentId}...`);
        
        // 检查档案是否存在
        const { data: profile, error: profileCheckError } = await supabase
          .from('student_profiles')
          .select('id')
          .eq('id', studentId)
          .single();
          
        if (profileCheckError || !profile) {
          console.log('❌ 档案不存在');
          failed_students.push({
            student_id: studentId,
            error: '学生档案不存在'
          });
          failure_count++;
          continue;
        }
        
        // 检查是否已存在分配
        const { data: existing, error: checkError } = await supabase
          .from('student_training_programs')
          .select('*')
          .eq('student_id', studentId)
          .eq('program_id', programId)
          .single();
          
        if (!existing && !checkError) {
          console.log('创建新的分配记录...');
          // 插入新记录
          const { data: insertData, error: insertError } = await supabase
            .from('student_training_programs')
            .insert({
              student_id: studentId,
              program_id: programId,
              teacher_id: teacherId,
              enrollment_date: new Date().toISOString().split('T')[0],
              status: 'active',
              notes: '批量分配测试',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select();
            
          if (insertError) {
            console.log('❌ 创建失败:', insertError.message);
            failed_students.push({
              student_id: studentId,
              error: insertError.message
            });
            failure_count++;
          } else {
            console.log('✅ 创建成功:', insertData[0].id);
            success_count++;
          }
        } else if (existing) {
          console.log('更新现有分配记录...');
          // 更新现有记录
          const { data: updateData, error: updateError } = await supabase
            .from('student_training_programs')
            .update({
              enrollment_date: new Date().toISOString().split('T')[0],
              status: 'active',
              notes: '批量分配测试 - 更新',
              teacher_id: teacherId,
              updated_at: new Date().toISOString()
            })
            .eq('student_id', studentId)
            .eq('program_id', programId)
            .select();
            
          if (updateError) {
            console.log('❌ 更新失败:', updateError.message);
            failed_students.push({
              student_id: studentId,
              error: updateError.message
            });
            failure_count++;
          } else {
            console.log('✅ 更新成功:', updateData[0].id);
            success_count++;
          }
        }
        
      } catch (error) {
        console.log('❌ 处理异常:', error.message);
        failed_students.push({
          student_id: studentId,
          error: error.message
        });
        failure_count++;
      }
    }
    
    // 4. 输出结果
    console.log('\n=== 批量分配结果 ===');
    console.log(`成功: ${success_count}, 失败: ${failure_count}`);
    
    if (failed_students.length > 0) {
      console.log('\n失败详情:');
      failed_students.forEach((fail, index) => {
        console.log(`${index + 1}. 学生ID ${fail.student_id}: ${fail.error}`);
      });
    }
    
    // 5. 测试学生端API
    console.log('\n=== 测试学生端API ===');
    for (const studentId of studentIds) {
      console.log(`\n测试学生 ${studentId} 的课程...`);
      const { data: courses, error: courseError } = await supabase.rpc('get_student_training_program_courses', {
        p_student_id: studentId
      });
      
      if (courseError) {
        console.log('❌ API调用失败:', courseError.message);
      } else {
        console.log(`✅ API调用成功，课程数量: ${courses?.length || 0}`);
        if (courses && courses.length > 0) {
          courses.slice(0, 3).forEach((course, index) => {
            console.log(`  ${index + 1}. ${course.course_name} (${course.credits}学分)`);
          });
        }
      }
    }
    
  } catch (error) {
    console.error('测试过程中出错:', error);
  }
}

testBatchAssignment().catch(console.error);