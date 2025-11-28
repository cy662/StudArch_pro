const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function checkTableIds() {
  console.log('=== 检查表的ID格式 ===');
  
  // 检查student_training_programs表的ID格式
  console.log('\n1. 检查student_training_programs表结构...');
  const { data: assignments, error: assignmentError } = await supabase
    .from('student_training_programs')
    .select('id, student_id')
    .limit(5);
    
  if (assignmentError) {
    console.error('查询失败:', assignmentError);
  } else {
    console.log('student_training_programs表记录示例:');
    assignments.forEach((record, index) => {
      console.log(`${index + 1}. ID: ${record.id}, Student_ID: ${record.student_id}`);
    });
  }
  
  // 检查student_profiles表的ID格式
  console.log('\n2. 检查student_profiles表结构...');
  const { data: profiles, error: profileError } = await supabase
    .from('student_profiles')
    .select('id, user_id')
    .eq('user_number', '2023011');
    
  if (profileError) {
    console.error('查询失败:', profileError);
  } else {
    console.log('陈瑶的档案记录:');
    profiles.forEach((record, index) => {
      console.log(`${index + 1}. Profile_ID: ${record.id}, User_ID: ${record.user_id}`);
    });
  }
  
  // 检查陈瑶是否有分配记录
  if (profiles.length > 0) {
    const profile = profiles[0];
    console.log('\n3. 检查陈瑶的培养方案分配记录...');
    const { data: chenyaoAssignments, error: chenyaoError } = await supabase
      .from('student_training_programs')
      .select('*')
      .eq('student_id', profile.id);
      
    if (chenyaoError) {
      console.error('查询陈瑶分配记录失败:', chenyaoError);
    } else {
      console.log(`陈瑶(${profile.id})的分配记录数量:`, chenyaoAssignments.length);
      chenyaoAssignments.forEach((record, index) => {
        console.log(`${index + 1}. 分配ID: ${record.id}, 方案ID: ${record.program_id}, 状态: ${record.status}`);
      });
    }
  }
  
  // 检查所有培养方案
  console.log('\n4. 检查可用的培养方案...');
  const { data: programs, error: programError } = await supabase
    .from('training_programs')
    .select('id, program_name, program_code')
    .limit(10);
    
  if (programError) {
    console.error('查询培养方案失败:', programError);
  } else {
    console.log('可用培养方案:');
    programs.forEach((program, index) => {
      console.log(`${index + 1}. ID: ${program.id}, 名称: ${program.program_name}, 代码: ${program.program_code}`);
    });
  }
}

checkTableIds().catch(console.error);