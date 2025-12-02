const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function debugStudent() {
  const studentId = 'd365a6d0-11a7-423a-9ede-13c10b039f08';
  
  console.log('🔍 检查学生ID:', studentId);
  
  // 检查用户表
  console.log('\n📋 检查用户表:');
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, full_name, user_number, role_id')
    .eq('id', studentId);
    
  if (userError) {
    console.log('❌ 用户表查询失败:', userError.message);
  } else {
    console.log('✅ 用户表结果:', user.length, '条记录');
    user.forEach(u => console.log(`   - ${u.full_name} (${u.user_number})`));
  }
  
  // 检查学生档案表
  console.log('\n📋 检查学生档案表:');
  const { data: profile, error: profileError } = await supabase
    .from('student_profiles')
    .select('id, full_name, student_number, user_id')
    .eq('id', studentId);
    
  if (profileError) {
    console.log('❌ 学生档案查询失败:', profileError.message);
  } else {
    console.log('✅ 学生档案结果:', profile.length, '条记录');
    profile.forEach(p => console.log(`   - ${p.full_name} (${p.student_number}), user_id: ${p.user_id}`));
  }
  
  // 检查是否有匹配的user_id
  console.log('\n📋 检查是否有匹配的user_id:');
  const { data: profileByUserId, error: userIdError } = await supabase
    .from('student_profiles')
    .select('id, full_name, student_number, user_id')
    .eq('user_id', studentId);
    
  if (userIdError) {
    console.log('❌ 按user_id查询失败:', userIdError.message);
  } else {
    console.log('✅ 按user_id查询结果:', profileByUserId.length, '条记录');
    profileByUserId.forEach(p => console.log(`   - ${p.full_name} (${p.student_number}), id: ${p.id}`));
  }
  
  // 显示现有的学生档案样本
  console.log('\n📋 现有学生档案样本:');
  const { data: allProfiles, error: allError } = await supabase
    .from('student_profiles')
    .select('id, full_name, student_number, user_id')
    .limit(5);
    
  if (allError) {
    console.log('❌ 查询所有学生失败:', allError.message);
  } else {
    console.log('✅ 现有学生档案:');
    allProfiles.forEach(p => {
      console.log(`   - ${p.full_name} (${p.student_number})`);
      console.log(`     档案ID: ${p.id}`);
      console.log(`     用户ID: ${p.user_id}`);
    });
  }
}

debugStudent();