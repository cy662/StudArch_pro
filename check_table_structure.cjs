// 检查表结构
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const checkTableStructure = async () => {
  console.log('🔍 检查数据库表结构...\n');

  try {
    // 1. 检查users表结构
    console.log('📋 1. 检查users表:');
    const { data: usersColumns, error: usersError } = await supabase
      .rpc('get_table_columns', { table_name: 'users' });
      
    if (usersError) {
      console.log('users表查询失败，尝试直接查询数据:');
      const { data: users, error: dataError } = await supabase
        .from('users')
        .select('*')
        .limit(1);
      
      if (dataError) {
        console.error('users表查询失败:', dataError);
      } else {
        console.log('users表样例数据:', users);
        if (users && users.length > 0) {
          console.log('users表字段:', Object.keys(users[0]));
        }
      }
    } else {
      console.log('users表列:', usersColumns);
    }

    // 2. 检查student_profiles表结构
    console.log('\n📋 2. 检查student_profiles表:');
    const { data: profilesColumns, error: profilesError } = await supabase
      .rpc('get_table_columns', { table_name: 'student_profiles' });
      
    if (profilesError) {
      console.log('student_profiles表查询失败，尝试直接查询数据:');
      const { data: profiles, error: dataError } = await supabase
        .from('student_profiles')
        .select('*')
        .limit(1);
      
      if (dataError) {
        console.error('student_profiles表查询失败:', dataError);
      } else {
        console.log('student_profiles表样例数据:', profiles);
        if (profiles && profiles.length > 0) {
          console.log('student_profiles表字段:', Object.keys(profiles[0]));
        }
      }
    } else {
      console.log('student_profiles表列:', profilesColumns);
    }

    // 3. 获取所有用户数据
    console.log('\n📋 3. 获取所有用户数据:');
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('*');
    
    if (allUsersError) {
      console.error('获取用户数据失败:', allUsersError);
    } else {
      console.log(`找到 ${allUsers?.length || 0} 个用户:`);
      allUsers?.forEach(user => {
        console.log(`- ID: ${user.id}, 用户名: ${user.username || user.name || 'N/A'}, 邮箱: ${user.email || 'N/A'}`);
      });
    }

    // 4. 获取所有学生档案数据
    console.log('\n📋 4. 获取所有学生档案数据:');
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('student_profiles')
      .select('*');
    
    if (allProfilesError) {
      console.error('获取学生档案数据失败:', allProfilesError);
    } else {
      console.log(`找到 ${allProfiles?.length || 0} 个学生档案:`);
      allProfiles?.forEach(profile => {
        console.log(`- 档案ID: ${profile.id}, 用户ID: ${profile.user_id}, 姓名: ${profile.full_name || profile.name || 'N/A'}`);
      });
    }

    // 5. 检查具体错误的学生ID
    const errorStudentId = '59940965-222d-485a-9e51-14cf4e4810b2';
    console.log(`\n📋 5. 检查错误学生ID: ${errorStudentId}`);
    
    const { data: errorUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', errorStudentId)
      .single();
    
    if (userError) {
      console.log('❌ 用户不存在:', userError.message);
    } else {
      console.log('✅ 找到用户:', errorUser);
      
      const { data: errorProfile, error: profileError } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', errorStudentId)
        .single();
      
      if (profileError) {
        console.log('❌ 学生档案不存在，正在创建...');
        
        // 创建学生档案
        const { data: newProfile, error: createError } = await supabase
          .from('student_profiles')
          .insert({
            user_id: errorStudentId,
            student_number: errorUser.username || errorUser.name || `STU_${Date.now()}`,
            full_name: errorUser.name || errorUser.username || '未知学生',
            class_name: '未分配班级',
            enrollment_date: new Date().toISOString().split('T')[0]
          })
          .select()
          .single();
        
        if (createError) {
          console.error('❌ 创建档案失败:', createError);
        } else {
          console.log('✅ 成功创建学生档案:', newProfile);
        }
      } else {
        console.log('✅ 找到学生档案:', errorProfile);
      }
    }

  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error);
  }
};

checkTableStructure();