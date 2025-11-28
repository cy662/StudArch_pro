const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function testFixedStudentAPI() {
  console.log('=== 测试修复后的学生API ===');
  
  try {
    // 模拟修复后的查询逻辑
    console.log('\n1. 测试学生档案查询（使用实际存在的字段）:');
    const { data: profiles, error: profileError, count } = await supabase
      .from('student_profiles')
      .select(`
        id,
        full_name,
        admission_year,
        study_duration,
        academic_status,
        user_id,
        major,
        department,
        class_name,
        enrollment_year,
        created_at
      `, { count: 'exact' })
      .eq('academic_status', '在读')
      .range(0, 9)
      .order('created_at', { ascending: false });
      
    if (profileError) {
      console.error('❌ 学生档案查询失败:', profileError);
    } else {
      console.log(`✅ 成功查询到 ${profiles.length} 个学生档案（总数: ${count}）:`);
      profiles.forEach((profile, index) => {
        console.log(`  ${index + 1}. ${profile.full_name || '未设置姓名'} (${profile.user_id}) - ${profile.class_name || '未分班'} - ${profile.academic_status}`);
      });
      
      if (profiles.length > 0) {
        // 测试用户信息查询
        console.log('\n2. 测试用户信息关联查询:');
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
            users.forEach(user => {
              console.log(`  - ${user.full_name} (${user.user_number}) - ${user.email || '无邮箱'}`);
            });
          }
        }
        
        // 测试完整的学生数据组合
        console.log('\n3. 测试完整数据组合:');
        const userMap = {};
        if (userIds.length > 0) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .in('id', userIds);
            
          userData?.forEach(user => {
            userMap[user.id] = user;
          });
        }
        
        const students = profiles.map(profile => {
          const user = userMap[profile.user_id];
          return {
            id: profile.id,
            student_number: user?.user_number || '',
            full_name: profile.full_name || user?.full_name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            class_name: profile.class_name || '',
            major: profile.major || '',
            department: profile.department || '',
            academic_status: profile.academic_status || '在读'
          };
        }).filter(s => s.full_name);
        
        console.log(`✅ 组合后的学生数据 (${students.length} 个):`);
        students.forEach((student, index) => {
          console.log(`  ${index + 1}. ${student.full_name} (${student.student_number}) - ${student.class_name} - ${student.major}`);
        });
      }
    }
    
    console.log('\n=== 测试完成 ===');
    console.log('现在学生列表应该能正常显示了！');
    
  } catch (error) {
    console.error('测试过程中出现错误:', error);
  }
}

testFixedStudentAPI().catch(console.error);