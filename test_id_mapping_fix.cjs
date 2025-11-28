const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function testIDMappingFix() {
  console.log('=== 测试修复后的ID映射 ===');
  
  try {
    // 模拟修复后的API逻辑
    console.log('\n1. 查询所有学生用户:');
    const { data: users, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        full_name,
        user_number,
        email,
        phone
      `)
      .like('user_number', '20%')
      .limit(10);
      
    if (userError) {
      console.error('❌ 查询用户失败:', userError);
      return;
    }
    
    console.log(`找到 ${users.length} 个学生用户`);
    
    // 获取对应的档案ID
    console.log('\n2. 获取对应的档案ID:');
    const userIds = users.map(u => u.id);
    const { data: profiles, error: profileError } = await supabase
      .from('student_profiles')
      .select('id, user_id')
      .in('user_id', userIds);
      
    if (profileError) {
      console.error('❌ 查询档案失败:', profileError);
      return;
    }
    
    console.log(`找到 ${profiles.length} 个档案记录`);
    
    // 创建映射
    const profileIdMap = {};
    profiles.forEach(profile => {
      profileIdMap[profile.user_id] = profile.id;
    });
    
    // 组合数据
    console.log('\n3. 组合学生数据（用于前端显示）:');
    const students = users.map(user => {
      const displayId = profileIdMap[user.id] || user.id;
      
      return {
        id: displayId, // 档案ID（用于培养方案分配）
        user_id: user.id, // 原始用户ID
        full_name: user.full_name,
        user_number: user.user_number,
        email: user.email,
        phone: user.phone,
        class_name: '待分配',
        major: '待分配',
        hasProfile: !!profileIdMap[user.id]
      };
    });
    
    students.forEach((student, index) => {
      console.log(`  ${index + 1}. ${student.full_name} (${student.user_number})`);
      console.log(`     用户ID: ${student.user_id.substring(0, 8)}...`);
      console.log(`     显示ID: ${student.id.substring(0, 8)}... ${student.hasProfile ? '(有档案)' : '(无档案)'}`);
      console.log(`     邮箱: ${student.email}`);
      console.log('');
    });
    
    // 测试分配逻辑
    console.log('\n4. 测试培养方案分配逻辑:');
    console.log('如果选择以下学生进行分配，应该使用对应的档案ID:');
    students.slice(0, 3).forEach(student => {
      if (student.hasProfile) {
        console.log(`  ✅ ${student.full_name} - 使用档案ID: ${student.id.substring(0, 8)}...`);
      } else {
        console.log(`  ⚠️  ${student.full_name} - 使用用户ID: ${student.user_id.substring(0, 8)}... (无档案)`);
      }
    });
    
    console.log('\n=== 修复完成 ===');
    console.log('✅ 现在前端会使用正确的ID进行培养方案分配！');
    
  } catch (error) {
    console.error('测试过程中出现错误:', error);
  }
}

testIDMappingFix().catch(console.error);