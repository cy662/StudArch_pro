const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function addMissingFields() {
  console.log('=== 添加缺失的字段 ===');
  
  try {
    // 方法1: 尝试使用supabase.sql（如果可用）
    console.log('\n1. 尝试添加users表的role字段...');
    try {
      const { error: roleError } = await supabase
        .from('users')
        .select('role')
        .limit(1);
      
      if (roleError && roleError.code === '42703') {
        // 字段不存在，需要添加
        console.log('role字段不存在，需要添加');
        
        // 使用原始SQL
        const { data, error } = await supabase
          .rpc('exec', { sql: 'ALTER TABLE users ADD COLUMN role TEXT DEFAULT \'student\';' });
          
        if (error) {
          console.log('无法添加role字段，尝试其他方法:', error.message);
        } else {
          console.log('✅ 成功添加users表的role字段');
        }
      } else {
        console.log('✅ users表的role字段已存在');
      }
    } catch (e) {
      console.log('检查role字段时出错:', e.message);
    }
    
    console.log('\n2. 尝试添加student_profiles表的status字段...');
    try {
      const { error: statusError } = await supabase
        .from('student_profiles')
        .select('status')
        .limit(1);
      
      if (statusError && statusError.code === '42703') {
        // 字段不存在，需要添加
        console.log('status字段不存在，需要添加');
        
        const { data, error } = await supabase
          .rpc('exec', { sql: 'ALTER TABLE student_profiles ADD COLUMN status TEXT DEFAULT \'active\';' });
          
        if (error) {
          console.log('无法添加status字段，尝试其他方法:', error.message);
        } else {
          console.log('✅ 成功添加student_profiles表的status字段');
        }
      } else {
        console.log('✅ student_profiles表的status字段已存在');
      }
    } catch (e) {
      console.log('检查status字段时出错:', e.message);
    }
    
    // 方法2: 如果字段添加失败，我们修改API查询来适应现有字段
    console.log('\n3. 测试现有数据查询...');
    
    // 不依赖status字段的查询
    const { data: allProfiles, error: allError } = await supabase
      .from('student_profiles')
      .select(`
        id,
        student_number,
        full_name,
        class_name,
        enrollment_date,
        profile_status,
        user_id
      `)
      .eq('profile_status', 'completed')
      .order('student_number', { ascending: true })
      .limit(10);
      
    if (allError) {
      console.error('查询所有学生失败:', allError);
    } else {
      console.log(`✅ 找到 ${allProfiles.length} 个已完成档案的学生:`);
      allProfiles.forEach(student => {
        console.log(`  - ${student.full_name} (${student.student_number}) - 班级: ${student.class_name || '未设置'} - 档案状态: ${student.profile_status}`);
      });
    }
    
    // 测试不依赖role字段的用户查询
    console.log('\n4. 测试学生用户查询...');
    const { data: studentUsers, error: studentUserError } = await supabase
      .from('users')
      .select('*')
      .in('id', allProfiles.map(p => p.user_id))
      .limit(5);
      
    if (studentUserError) {
      console.error('查询学生用户失败:', studentUserError);
    } else {
      console.log(`✅ 找到 ${studentUsers.length} 个学生用户:`);
      studentUsers.forEach(user => {
        console.log(`  - ${user.full_name} (${user.user_number}) - 字段: ${Object.keys(user).join(', ')}`);
      });
    }
    
  } catch (error) {
    console.error('添加字段过程中出现错误:', error);
  }
}

addMissingFields().catch(console.error);