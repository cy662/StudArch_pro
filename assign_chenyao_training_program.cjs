const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function assignChenyaoTrainingProgram() {
  console.log('=== 为陈瑶分配培养方案 ===');
  
  const profileId = 'f1c1aa0d-2169-4369-af14-3cadc6aa22b4'; // 陈瑶的档案ID
  const programId = '62b2cc69-5b10-4238-8232-59831cdb7964'; // 培养方案ID
  const teacherId = '00000000-0000-0000-0000-000000000001'; // 教师ID
  
  try {
    // 检查是否已经存在分配记录
    const { data: existing, error: checkError } = await supabase
      .from('student_training_programs')
      .select('*')
      .eq('student_id', profileId)
      .eq('program_id', programId);
      
    if (checkError) {
      console.error('检查现有分配失败:', checkError);
      return;
    }
    
    if (existing.length > 0) {
      console.log('陈瑶已经有培养方案分配记录，更新状态...');
      const { error: updateError } = await supabase
        .from('student_training_programs')
        .update({
          status: 'active',
          enrollment_date: new Date().toISOString().split('T')[0],
          notes: '手动分配培养方案',
          updated_at: new Date().toISOString()
        })
        .eq('student_id', profileId)
        .eq('program_id', programId);
        
      if (updateError) {
        console.error('更新分配记录失败:', updateError);
      } else {
        console.log('✅ 成功更新陈瑶的培养方案分配');
      }
    } else {
      console.log('为陈瑶创建新的培养方案分配记录...');
      const { data: newAssignment, error: insertError } = await supabase
        .from('student_training_programs')
        .insert({
          student_id: profileId,
          program_id: programId,
          teacher_id: teacherId,
          enrollment_date: new Date().toISOString().split('T')[0],
          status: 'active',
          notes: '手动分配培养方案',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
        
      if (insertError) {
        console.error('创建分配记录失败:', insertError);
        return;
      }
      
      console.log('✅ 成功为陈瑶分配培养方案:', newAssignment);
    }
    
    // 验证分配结果
    console.log('\n=== 验证分配结果 ===');
    const { data: verification, error: verifyError } = await supabase
      .from('student_training_programs')
      .select('*')
      .eq('student_id', profileId);
      
    if (verifyError) {
      console.error('验证分配结果失败:', verifyError);
    } else {
      console.log('陈瑶的培养方案分配记录:', verification.length, '条');
      verification.forEach((record, index) => {
        console.log(`${index + 1}. ID: ${record.id}, 方案ID: ${record.program_id}, 状态: ${record.status}`);
      });
    }
    
    // 测试API调用
    console.log('\n=== 测试学生端API ===');
    const { data: courses, error: courseError } = await supabase.rpc('get_student_training_program_courses', {
      p_student_id: profileId
    });
    
    if (courseError) {
      console.error('API调用失败:', courseError);
    } else {
      console.log('📚 陈瑶的培养方案课程数量:', courses?.length || 0);
      if (courses && courses.length > 0) {
        console.log('前5门课程:');
        courses.slice(0, 5).forEach((course, index) => {
          console.log(`${index + 1}. ${course.course_name} (${course.credits}学分)`);
        });
      }
    }
    
  } catch (error) {
    console.error('分配过程中出错:', error);
  }
}

assignChenyaoTrainingProgram().catch(console.error);