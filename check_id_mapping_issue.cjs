const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function checkIDMappingIssue() {
  console.log('=== 检查ID映射问题 ===');
  
  try {
    // 1. 检查失败的ID
    const failedIds = [
      '89e41fee-a388-486f-bbb2-320c4e115ee1',
      '1948fa58-e304-4e0a-a7ba-25a21b937496'
    ];
    
    console.log('\n1. 检查失败的ID在users表中是否存在:');
    for (const id of failedIds) {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, full_name, user_number')
        .eq('id', id)
        .single();
        
      if (userError) {
        console.log(`  ID ${id.substring(0, 8)}... 在users表中: ❌ 不存在`);
      } else {
        console.log(`  ID ${id.substring(0, 8)}... 在users表中: ✅ ${user.full_name} (${user.user_number})`);
      }
    }
    
    console.log('\n2. 检查失败的ID在student_profiles表中是否存在:');
    for (const id of failedIds) {
      const { data: profile, error: profileError } = await supabase
        .from('student_profiles')
        .select('id, user_id')
        .eq('id', id)
        .single();
        
      if (profileError) {
        console.log(`  ID ${id.substring(0, 8)}... 在student_profiles表中: ❌ 不存在`);
      } else {
        console.log(`  ID ${id.substring(0, 8)}... 在student_profiles表中: ✅ 存在`);
      }
    }
    
    console.log('\n3. 查找这些用户ID对应的student_profiles ID:');
    for (const userId of failedIds) {
      const { data: profile, error: profileError } = await supabase
        .from('student_profiles')
        .select('id, user_id')
        .eq('user_id', userId)
        .single();
        
      if (profileError) {
        console.log(`  用户ID ${userId.substring(0, 8)}... 对应的档案ID: ❌ 无档案记录`);
      } else {
        console.log(`  用户ID ${userId.substring(0, 8)}... 对应的档案ID: ✅ ${profile.id.substring(0, 8)}...`);
      }
    }
    
    console.log('\n4. 查看所有student_profiles记录的ID映射:');
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('student_profiles')
      .select(`
        id,
        user_id,
        users (
          id,
          full_name,
          user_number
        )
      `)
      .limit(10);
      
    if (!allProfilesError) {
      console.log(`\n所有档案记录 (${allProfiles.length} 个):`);
      allProfiles.forEach((profile, index) => {
        if (profile.users) {
          console.log(`  ${index + 1}. 档案ID: ${profile.id.substring(0, 8)}... <-> 用户ID: ${profile.user_id.substring(0, 8)}... (${profile.users.full_name})`);
        }
      });
    }
    
    console.log('\n=== 问题分析 ===');
    console.log('问题根源:');
    console.log('- 前端传递的是users表的ID');
    console.log('- 但培养方案分配API期望的是student_profiles表的ID');
    console.log('- 需要在前端进行ID映射，或者修改API逻辑');
    
  } catch (error) {
    console.error('检查过程中出现错误:', error);
  }
}

checkIDMappingIssue().catch(console.error);