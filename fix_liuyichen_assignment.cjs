const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function fixLiuyichenAssignment() {
  console.log('=== 修复刘羿辰的培养方案分配 ===');
  
  try {
    // 1. 重新查找刘羿辰的档案ID
    console.log('\n1. 重新查找刘羿辰的档案ID...');
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('user_number', '2023015701')
      .single();
      
    if (userError) {
      console.error('查询用户失败:', userError);
      return;
    }
    
    console.log('用户ID:', users.id);
    
    const { data: profiles, error: profileError } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', users.id)
      .single();
      
    if (profileError) {
      console.error('查询档案失败:', profileError);
      return;
    }
    
    const correctProfileId = profiles.id;
    console.log('正确的档案ID:', correctProfileId);
    
    // 2. 检查现有的分配记录
    console.log('\n2. 检查现有的分配记录...');
    const { data: existingAssignments, error: checkError } = await supabase
      .from('student_training_programs')
      .select('*')
      .eq('student_id', correctProfileId);
      
    if (checkError) {
      console.error('查询分配记录失败:', checkError);
      return;
    }
    
    console.log('现有分配记录数量:', existingAssignments.length);
    
    if (existingAssignments.length === 0) {
      console.log('❌ 没有找到分配记录，需要创建');
      return;
    }
    
    // 3. 删除现有的错误分配记录并重新创建
    console.log('\n3. 重新创建分配记录...');
    const assignment = existingAssignments[0];
    const programId = assignment.program_id;
    
    // 删除现有记录
    const { error: deleteError } = await supabase
      .from('student_training_programs')
      .delete()
      .eq('student_id', correctProfileId)
      .eq('program_id', programId);
      
    if (deleteError) {
      console.error('删除现有记录失败:', deleteError);
      return;
    }
    
    console.log('✅ 删除现有记录成功');
    
    // 重新创建记录
    const { data: newAssignment, error: createError } = await supabase
      .from('student_training_programs')
      .insert({
        student_id: correctProfileId,
        program_id: programId,
        teacher_id: '00000000-0000-0000-0000-000000000001',
        enrollment_date: new Date().toISOString().split('T')[0],
        status: 'active',
        notes: '重新分配培养方案',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
      
    if (createError) {
      console.error('❌ 创建新记录失败:', createError);
      return;
    }
    
    console.log('✅ 重新创建分配记录成功:', newAssignment[0].id);
    
    // 4. 测试API调用
    console.log('\n4. 测试API调用...');
    const { data: courses, error: apiError } = await supabase.rpc('get_student_training_program_courses', {
      p_student_id: correctProfileId
    });
    
    if (apiError) {
      console.error('❌ API调用失败:', apiError);
    } else {
      console.log('✅ API调用成功，课程数量:', courses?.length || 0);
      if (courses && courses.length > 0) {
        console.log('课程列表:');
        courses.forEach((course, index) => {
          console.log(`  ${index + 1}. ${course.course_name} (${course.credits}学分)`);
        });
      }
    }
    
  } catch (error) {
    console.error('修复过程中出错:', error);
  }
}

fixLiuyichenAssignment().catch(console.error);