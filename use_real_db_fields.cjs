const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function useRealDBFields() {
  console.log('=== 使用实际数据库字段查询 ===');
  
  try {
    // 从之前的输出我们知道实际存在的字段
    console.log('\n1. 使用实际存在的字段查询学生档案:');
    const { data: profiles, error: profileError, count } = await supabase
      .from('student_profiles')
      .select(`
        id,
        user_id,
        class_name,
        major,
        department,
        academic_status,
        created_at,
        admission_year,
        study_duration,
        academic_system,
        enrollment_year
      `, { count: 'exact' })
      .range(0, 9)
      .order('created_at', { ascending: false });
      
    if (profileError) {
      console.error('❌ 学生档案查询失败:', profileError);
    } else {
      console.log(`✅ 成功查询到 ${profiles.length} 个学生档案（总数: ${count}）:`);
      profiles.forEach((profile, index) => {
        console.log(`  ${index + 1}. 档案ID: ${profile.id.substring(0, 8)}... - ${profile.class_name || '未分班'} - ${profile.major || '未设置专业'} - ${profile.academic_status}`);
      });
      
      if (profiles.length > 0) {
        // 获取用户信息来获取姓名和学号
        console.log('\n2. 获取关联的用户信息:');
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
            
            // 组合完整的学生信息
            console.log('\n3. 组合完整的学生信息:');
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
                class_name: profile.class_name || '',
                major: profile.major || '',
                department: profile.department || '',
                academic_status: profile.academic_status || '在读',
                admission_year: profile.admission_year || '',
                study_duration: profile.study_duration || 4,
                enrollment_year: profile.enrollment_year || '',
                created_at: profile.created_at
              };
            }).filter(s => s.full_name); // 过滤掉没有姓名的记录
            
            console.log(`✅ 组合后的学生数据 (${students.length} 个):`);
            students.forEach((student, index) => {
              console.log(`  ${index + 1}. ${student.full_name} (${student.student_number}) - ${student.class_name} - ${student.major}`);
            });
            
            return students;
          }
        }
      }
    }
    
  } catch (error) {
    console.error('查询过程中出现错误:', error);
  }
}

useRealDBFields().catch(console.error);