const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function checkAllStudentsData() {
  console.log('=== 检查所有学生数据 ===');
  
  try {
    // 1. 检查所有users表中role为student的用户
    console.log('\n1. 查询所有学生用户:');
    const { data: allUsers, error: userError } = await supabase
      .from('users')
      .select('*')
      .limit(20);
      
    if (userError) {
      console.error('查询所有用户失败:', userError);
    } else {
      console.log(`找到 ${allUsers.length} 个用户:`);
      const studentUsers = allUsers.filter(user => 
        user.full_name && (user.user_number?.startsWith('20') || user.username?.startsWith('20'))
      );
      console.log(`其中疑似学生用户: ${studentUsers.length} 个`);
      studentUsers.forEach(user => {
        console.log(`  - ${user.full_name} (${user.user_number}) - ${user.email}`);
      });
    }
    
    // 2. 检查所有student_profiles记录
    console.log('\n2. 查询所有学生档案:');
    const { data: allProfiles, error: profileError } = await supabase
      .from('student_profiles')
      .select('*')
      .limit(20);
      
    if (profileError) {
      console.error('查询所有档案失败:', profileError);
    } else {
      console.log(`找到 ${allProfiles.length} 个学生档案:`);
      allProfiles.forEach((profile, index) => {
        console.log(`  ${index + 1}. 档案ID: ${profile.id.substring(0, 8)}... - 用户ID: ${profile.user_id?.substring(0, 8)}... - 创建: ${profile.created_at}`);
      });
    }
    
    // 3. 检查用户表中是否有student role字段或其他标识
    console.log('\n3. 检查用户表结构，寻找学生标识:');
    const { data: userSample, error: sampleError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
      
    if (!sampleError && userSample.length > 0) {
      console.log('用户表的字段:', Object.keys(userSample[0]));
      
      // 检查可能的字段
      const possibleFields = ['role', 'role_id', 'user_type', 'type', 'status'];
      possibleFields.forEach(field => {
        if (field in userSample[0]) {
          console.log(`  - 字段 ${field}: ${userSample[0][field]}`);
        }
      });
    }
    
    // 4. 尝试不同的查询方式找学生
    console.log('\n4. 尝试不同方式查询学生:');
    
    // 方式1: 通过user_number格式（假设学号以20开头）
    const { data: studentsByNumber, error: numberError } = await supabase
      .from('users')
      .select('*')
      .like('user_number', '20%')
      .limit(10);
      
    if (!numberError) {
      console.log(`通过学号格式找到 ${studentsByNumber.length} 个学生:`);
      studentsByNumber.forEach(user => {
        console.log(`  - ${user.full_name} (${user.user_number})`);
      });
    }
    
    // 方式2: 通过profiles关联查询
    const { data: studentsWithProfiles, error: withProfileError } = await supabase
      .from('student_profiles')
      .select(`
        user_id,
        users (
          id,
          full_name,
          user_number,
          email,
          phone
        )
      `)
      .limit(10);
      
    if (!withProfileError) {
      console.log(`通过档案关联找到 ${studentsWithProfiles.length} 个学生:`);
      studentsWithProfiles.forEach(item => {
        if (item.users) {
          console.log(`  - ${item.users.full_name} (${item.users.user_number})`);
        }
      });
    }
    
    // 5. 检查最近导入的数据
    console.log('\n5. 检查最近24小时导入的数据:');
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: recentUsers, error: recentError } = await supabase
      .from('users')
      .select('*')
      .gte('created_at', yesterday)
      .order('created_at', { ascending: false });
      
    if (!recentError) {
      console.log(`最近24小时注册的用户: ${recentUsers.length} 个:`);
      recentUsers.forEach(user => {
        console.log(`  - ${user.full_name} (${user.user_number}) - ${user.created_at}`);
      });
    }
    
  } catch (error) {
    console.error('检查过程中出现错误:', error);
  }
}

checkAllStudentsData().catch(console.error);