const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function checkStudentDisplay() {
  console.log('=== 检查学生列表显示问题 ===');
  
  try {
    // 1. 检查所有学生用户
    console.log('\n1. 检查所有学生用户:');
    const { data: allUsers, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'student')
      .limit(10);
      
    if (userError) {
      console.error('查询学生用户失败:', userError);
    } else {
      console.log(`找到 ${allUsers.length} 个学生用户:`);
      allUsers.forEach(user => {
        console.log(`  - ${user.full_name} (${user.user_number}) - ID: ${user.id}`);
      });
    }
    
    // 2. 检查所有学生档案
    console.log('\n2. 检查所有学生档案:');
    const { data: allProfiles, error: profileError } = await supabase
      .from('student_profiles')
      .select('*')
      .limit(10);
      
    if (profileError) {
      console.error('查询学生档案失败:', profileError);
    } else {
      console.log(`找到 ${allProfiles.length} 个学生档案:`);
      allProfiles.forEach(profile => {
        console.log(`  - ${profile.student_number} - 档案ID: ${profile.id} - 用户ID: ${profile.user_id}`);
      });
    }
    
    // 3. 检查教师能获取的学生列表（模拟API调用）
    console.log('\n3. 检查教师API获取学生列表:');
    const teacherId = '00000000-0000-0000-0000-000000000001';
    
    const { data: teacherStudents, error: teacherError } = await supabase
      .from('student_profiles')
      .select(`
        id,
        student_number,
        full_name,
        class_name,
        enrollment_date,
        status,
        user_id,
        users (
          id,
          user_number,
          full_name,
          email
        )
      `)
      .eq('status', 'active')
      .order('student_number', { ascending: true })
      .limit(10);
      
    if (teacherError) {
      console.error('教师获取学生列表失败:', teacherError);
    } else {
      console.log(`教师API返回 ${teacherStudents.length} 个学生:`);
      teacherStudents.forEach(student => {
        console.log(`  - ${student.full_name} (${student.student_number}) - 班级: ${student.class_name || '未设置'}`);
      });
    }
    
    // 4. 检查最近导入的学生
    console.log('\n4. 检查最近导入的学生（今天）:');
    const today = new Date().toISOString().split('T')[0];
    const { data: recentStudents, error: recentError } = await supabase
      .from('student_profiles')
      .select('*')
      .gte('created_at', today)
      .order('created_at', { ascending: false });
      
    if (recentError) {
      console.error('查询最近学生失败:', recentError);
    } else {
      console.log(`今天导入的学生数量: ${recentStudents.length}`);
      recentStudents.forEach(student => {
        console.log(`  - ${student.full_name} (${student.student_number}) - 创建时间: ${student.created_at}`);
      });
    }
    
    // 5. 检查是否有学生档案状态为非active
    console.log('\n5. 检查非active状态的学生:');
    const { data: inactiveStudents, error: inactiveError } = await supabase
      .from('student_profiles')
      .select('*')
      .neq('status', 'active');
      
    if (inactiveError) {
      console.error('查询非active学生失败:', inactiveError);
    } else {
      console.log(`非active状态的学生数量: ${inactiveStudents.length}`);
      inactiveStudents.forEach(student => {
        console.log(`  - ${student.full_name} (${student.student_number}) - 状态: ${student.status}`);
      });
    }
    
  } catch (error) {
    console.error('检查过程中出现错误:', error);
  }
}

checkStudentDisplay().catch(console.error);