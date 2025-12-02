// 修复学生档案问题
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function fixStudentProfile() {
  const userId = 'd365a6d0-11a7-423a-9ede-13c10b039f08'; // 用户ID
  
  console.log('🔧 修复学生档案问题...');
  console.log('用户ID:', userId);
  
  try {
    // 1. 获取用户信息
    console.log('\n📋 获取用户信息:');
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.log('❌ 获取用户信息失败:', userError.message);
      return;
    }
    
    console.log('✅ 用户信息:');
    console.log('   • 姓名:', user.full_name);
    console.log('   • 学号:', user.user_number);
    console.log('   • 邮箱:', user.email);
    
    // 2. 检查是否已存在学生档案
    console.log('\n📋 检查现有学生档案:');
    const { data: existingProfile, error: existingError } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', userId);
    
    if (existingError) {
      console.log('❌ 检查现有档案失败:', existingError.message);
      return;
    }
    
    if (existingProfile && existingProfile.length > 0) {
      console.log('✅ 找到现有学生档案:', existingProfile.length, '条');
      existingProfile.forEach((profile, index) => {
        console.log(`   ${index + 1}. 档案ID: ${profile.id}`);
        console.log(`      姓名: ${profile.full_name}`);
        console.log(`      学号: ${profile.student_number}`);
      });
      console.log('\n💡 应该使用档案ID而不是用户ID进行分配');
      console.log('正确的档案ID:', existingProfile[0].id);
    } else {
      // 3. 创建新的学生档案
      console.log('\n📝 创建新的学生档案:');
      
      // 生成新的档案ID
      const profileId = '00000000-0000-0000-0000-000000000999'; // 使用占位符ID
      
      const newProfile = {
        id: profileId,
        user_id: userId,
        full_name: user.full_name || '未知姓名',
        student_number: user.user_number || '未知学号',
        email: user.email,
        phone: user.phone,
        department: user.department || '计算机系',
        major: user.major || '计算机科学与技术',
        grade: user.grade || '2021级',
        class_name: user.class_name || '计科1班',
        enrollment_date: user.created_at ? user.created_at.split('T')[0] : '2021-09-01',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data: createdProfile, error: createError } = await supabase
        .from('student_profiles')
        .insert(newProfile)
        .select()
        .single();
      
      if (createError) {
        console.log('❌ 创建学生档案失败:', createError.message);
        console.log('错误详情:', createError);
      } else {
        console.log('✅ 学生档案创建成功:');
        console.log('   • 档案ID:', createdProfile.id);
        console.log('   • 姓名:', createdProfile.full_name);
        console.log('   • 学号:', createdProfile.student_number);
        console.log('\n💡 在分配培养方案时，请使用档案ID:', createdProfile.id);
      }
    }
    
  } catch (error) {
    console.error('❌ 修复过程中发生错误:', error.message);
  }
}

fixStudentProfile();