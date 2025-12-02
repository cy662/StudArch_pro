const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function comprehensiveSearch() {
  const targetId = 'd365a6d0-11a7-423a-9ede-13c10b039f08';
  
  console.log('🔍 全面搜索ID:', targetId);
  
  try {
    // 1. 在student_profiles表中搜索ID出现在任何字段
    console.log('\n📋 在student_profiles表中全面搜索:');
    const { data: allProfiles, error: allError } = await supabase
      .from('student_profiles')
      .select('id, user_id, full_name, student_number');
    
    if (allError) {
      console.log('❌ 查询失败:', allError.message);
      return;
    }
    
    console.log('✅ 总共有', allProfiles.length, '个学生档案');
    
    let foundAsId = false;
    let foundAsUserId = false;
    
    allProfiles.forEach(profile => {
      if (profile.id === targetId) {
        console.log('🎯 找到匹配的档案ID:');
        console.log('  • 档案ID:', profile.id);
        console.log('  • 用户ID:', profile.user_id);
        console.log('  • 姓名:', profile.full_name);
        console.log('  • 学号:', profile.student_number);
        foundAsId = true;
      }
      
      if (profile.user_id === targetId) {
        console.log('🎯 找到匹配的用户ID:');
        console.log('  • 档案ID:', profile.id);
        console.log('  • 用户ID:', profile.user_id);
        console.log('  • 姓名:', profile.full_name);
        console.log('  • 学号:', profile.student_number);
        foundAsUserId = true;
      }
    });
    
    if (!foundAsId && !foundAsUserId) {
      console.log('❌ 在student_profiles表中未找到该ID');
    }
    
    // 2. 在users表中查询
    console.log('\n👤 在users表中查询:');
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, full_name, user_number, email')
      .eq('id', targetId);
    
    if (userError) {
      console.log('❌ 用户查询失败:', userError.message);
    } else {
      console.log('✅ 找到', users.length, '个用户记录');
      users.forEach(user => {
        console.log('  • 用户ID:', user.id);
        console.log('  • 姓名:', user.full_name);
        console.log('  • 学号:', user.user_number);
        console.log('  • 邮箱:', user.email);
      });
    }
    
    // 3. 模糊搜索（查看是否有类似的ID）
    console.log('\n🔍 模糊搜索相似ID:');
    const searchTerm = targetId.substring(0, 8); // 取前8位
    
    const { data: similarProfiles, error: similarError } = await supabase
      .from('student_profiles')
      .select('id, user_id, full_name, student_number')
      .like('id', `${searchTerm}%`);
    
    if (similarError) {
      console.log('❌ 模糊搜索失败:', similarError.message);
    } else {
      console.log('✅ 找到', similarProfiles.length, '个相似档案:');
      similarProfiles.forEach(profile => {
        console.log(`  • ${profile.id} (${profile.full_name || '未知姓名'})`);
      });
    }
    
    // 4. 查看所有档案的ID格式
    console.log('\n📊 分析档案ID格式:');
    const idFormats = {};
    allProfiles.forEach(profile => {
      const format = profile.id.startsWith('00000000-0000-0000-0000-000000000') ? '占位符UUID' : '标准UUID';
      idFormats[format] = (idFormats[format] || 0) + 1;
    });
    
    console.log('ID格式分布:');
    Object.entries(idFormats).forEach(([format, count]) => {
      console.log(`  • ${format}: ${count}个`);
    });
    
  } catch (error) {
    console.error('❌ 搜索过程中发生错误:', error.message);
  }
}

comprehensiveSearch();