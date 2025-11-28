const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function checkChenyaoData() {
  console.log('=== 检查陈瑶(2023011)的数据 ===');
  
  // 1. 查找陈瑶的用户记录
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('user_number', '2023011');
    
  if (userError) {
    console.error('查询用户失败:', userError);
    return;
  }
  
  console.log('用户记录:', users);
  
  if (users.length === 0) {
    console.log('未找到学号2023011的用户');
    return;
  }
  
  const user = users[0];
  console.log('找到用户:', user.id, user.full_name);
  
  // 2. 查找学生档案
  const { data: profiles, error: profileError } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('user_id', user.id);
    
  if (profileError) {
    console.error('查询学生档案失败:', profileError);
    return;
  }
  
  console.log('学生档案记录:', profiles);
  
  if (profiles.length === 0) {
    console.log('未找到学生档案');
    return;
  }
  
  const profile = profiles[0];
  
  // 3. 查找培养方案分配记录
  const { data: assignments, error: assignmentError } = await supabase
    .from('student_training_programs')
    .select('*')
    .eq('student_id', profile.id);
    
  if (assignmentError) {
    console.error('查询培养方案分配失败:', assignmentError);
    return;
  }
  
  console.log('培养方案分配记录:', assignments);
  
  if (assignments.length === 0) {
    console.log('未找到培养方案分配记录');
  } else {
    for (const assignment of assignments) {
      // 4. 查找培养方案详情
      const { data: program, error: programError } = await supabase
        .from('training_programs')
        .select('*')
        .eq('id', assignment.program_id)
        .single();
        
      if (!programError && program) {
        console.log('培养方案详情:', program);
        
        // 5. 查找培养方案课程
        const { data: courses, error: courseError } = await supabase
          .from('training_program_courses')
          .select('*')
          .eq('program_id', assignment.program_id);
          
        if (!courseError) {
          console.log('培养方案课程数量:', courses.length);
          if (courses.length > 0) {
            console.log('前5门课程:', courses.slice(0, 5));
          }
        } else {
          console.error('查询课程失败:', courseError);
        }
      }
    }
  }
}

checkChenyaoData().catch(console.error);