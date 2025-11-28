const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function simpleStudentQuery() {
  console.log('=== 简单学生查询 ===');
  
  try {
    // 只使用确认存在的字段
    console.log('\n1. 查询学生档案（只使用存在的字段）:');
    const { data: profiles, error: profileError, count } = await supabase
      .from('student_profiles')
      .select(`
        id,
        user_id,
        created_at
      `, { count: 'exact' })
      .range(0, 9)
      .order('created_at', { ascending: false });
      
    if (profileError) {
      console.error('❌ 学生档案查询失败:', profileError);
    } else {
      console.log(`✅ 成功查询到 ${profiles.length} 个学生档案（总数: ${count}）`);
      
      if (profiles.length > 0) {
        // 获取用户信息
        console.log('\n2. 获取用户信息:');
        const userIds = profiles.map(p => p.user_id).filter(Boolean);
        
        if (userIds.length > 0) {
          const { data: users, error: userError } = await supabase
            .from('users')
            .select(`
              id,
              username,
              email,
              full_name,
              user_number,
              phone
            `)
            .in('id', userIds);
            
          if (userError) {
            console.error('❌ 用户信息查询失败:', userError);
          } else {
            console.log(`✅ 成功查询到 ${users.length} 个用户:`);
            
            // 创建用户映射
            const userMap = {};
            users.forEach(user => {
              userMap[user.id] = user;
            });
            
            // 组合学生信息
            console.log('\n3. 组合学生信息:');
            const students = profiles.map(profile => {
              const user = userMap[profile.user_id];
              return {
                id: profile.id,
                user_id: profile.user_id,
                student_number: user?.user_number || '',
                full_name: user?.full_name || '',
                email: user?.email || '',
                phone: user?.phone || '',
                username: user?.username || '',
                class_name: '待分配',
                major: '待分配', 
                department: '待分配',
                academic_status: '在读',
                created_at: profile.created_at
              };
            }).filter(s => s.full_name);
            
            console.log(`✅ 最终学生数据 (${students.length} 个):`);
            students.forEach((student, index) => {
              console.log(`  ${index + 1}. ${student.full_name} (${student.student_number}) - ${student.email || '无邮箱'}`);
            });
            
            console.log('\n=== 修复建议 ===');
            console.log('现在需要更新API代码，使用这些字段：');
            console.log('- student_profiles: id, user_id, created_at');
            console.log('- users: id, username, email, full_name, user_number, phone');
            console.log('- 不依赖student_profiles中的其他字段，因为这些字段可能不存在或为null');
            
            return students;
          }
        }
      }
    }
    
  } catch (error) {
    console.error('查询过程中出现错误:', error);
  }
}

simpleStudentQuery().catch(console.error);