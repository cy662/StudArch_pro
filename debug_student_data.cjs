// 调试学生数据和档案
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const debugStudentData = async () => {
  console.log('🔍 调试学生数据...\n');

  try {
    // 1. 获取所有用户
    console.log('📋 1. 获取所有用户表数据:');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .in('role', ['student']);
    
    if (usersError) {
      console.error('获取用户失败:', usersError);
      return;
    }
    
    console.log('用户总数:', users?.length || 0);
    users.forEach(user => {
      console.log(`- ID: ${user.id}, 用户名: ${user.username}, 角色: ${user.role}`);
    });

    // 2. 获取所有学生档案
    console.log('\n📋 2. 获取学生档案表数据:');
    const { data: profiles, error: profilesError } = await supabase
      .from('student_profiles')
      .select('*');
    
    if (profilesError) {
      console.error('获取学生档案失败:', profilesError);
      return;
    }
    
    console.log('学生档案总数:', profiles?.length || 0);
    profiles.forEach(profile => {
      console.log(`- 档案ID: ${profile.id}, 用户ID: ${profile.user_id}, 姓名: ${profile.full_name}`);
    });

    // 3. 检查缺失的学生档案
    console.log('\n📋 3. 检查缺失的学生档案:');
    const userIds = users?.map(u => u.id) || [];
    const profileUserIds = profiles?.map(p => p.user_id) || [];
    
    const missingProfiles = userIds.filter(userId => !profileUserIds.includes(userId));
    
    if (missingProfiles.length > 0) {
      console.log('❌ 发现缺失档案的用户:', missingProfiles);
      
      // 创建缺失的档案
      console.log('\n🔧 创建缺失的学生档案...');
      for (const userId of missingProfiles) {
        const user = users.find(u => u.id === userId);
        if (user) {
          const { data: newProfile, error: createError } = await supabase
            .from('student_profiles')
            .insert({
              user_id: userId,
              student_number: user.username,
              full_name: user.username,
              class_name: '未分配班级',
              enrollment_date: new Date().toISOString().split('T')[0]
            })
            .select()
            .single();
            
          if (createError) {
            console.error(`创建用户 ${userId} 的档案失败:`, createError);
          } else {
            console.log(`✅ 成功创建用户 ${userId} 的档案:`, newProfile.id);
          }
        }
      }
    } else {
      console.log('✅ 所有学生都有对应的档案');
    }

    // 4. 验证具体的错误学生ID
    const errorStudentId = '59940965-222d-485a-9e51-14cf4e4810b2';
    console.log(`\n📋 4. 验证错误学生ID: ${errorStudentId}`);
    
    const { data: specificUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', errorStudentId)
      .single();
    
    console.log('用户信息:', specificUser);
    
    const { data: specificProfile } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', errorStudentId)
      .single();
    
    console.log('学生档案信息:', specificProfile);

    console.log('\n🎉 调试完成！');

  } catch (error) {
    console.error('❌ 调试过程中发生错误:', error);
  }
};

debugStudentData();