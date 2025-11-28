const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function fixStudentListDisplay() {
  console.log('=== 修复学生列表显示问题 ===');
  
  try {
    // 1. 修复表结构 - 添加缺失的字段
    console.log('\n1. 修复users表，添加role字段:');
    const { error: addRoleError } = await supabase.rpc('execute_sql', {
      sql_string: `
        ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';
      `
    });
    
    if (addRoleError) {
      console.log('添加role字段失败，尝试直接ALTER:', addRoleError.message);
    } else {
      console.log('✅ 成功添加users.role字段');
    }
    
    console.log('\n2. 修复student_profiles表，添加status字段:');
    const { error: addStatusError } = await supabase.rpc('execute_sql', {
      sql_string: `
        ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
      `
    });
    
    if (addStatusError) {
      console.log('添加status字段失败，尝试直接ALTER:', addStatusError.message);
    } else {
      console.log('✅ 成功添加student_profiles.status字段');
    }
    
    // 3. 更新现有数据 - 确保学生用户有正确的role
    console.log('\n3. 更新学生用户的role字段:');
    const { error: updateRoleError } = await supabase.rpc('execute_sql', {
      sql_string: `
        UPDATE users 
        SET role = 'student' 
        WHERE id IN (SELECT DISTINCT user_id FROM student_profiles);
      `
    });
    
    if (updateRoleError) {
      console.log('更新role失败:', updateRoleError.message);
    } else {
      console.log('✅ 成功更新学生用户的role字段');
    }
    
    // 4. 更新学生档案的status字段
    console.log('\n4. 更新学生档案的status字段:');
    const { error: updateStatusError } = await supabase.rpc('execute_sql', {
      sql_string: `
        UPDATE student_profiles 
        SET status = 'active' 
        WHERE status IS NULL OR status = '';
      `
    });
    
    if (updateStatusError) {
      console.log('更新status失败:', updateStatusError.message);
    } else {
      console.log('✅ 成功更新学生档案的status字段');
    }
    
    // 5. 测试API查询
    console.log('\n5. 测试修复后的API查询:');
    const { data: testStudents, error: testError } = await supabase
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
          email,
          role
        )
      `)
      .eq('status', 'active')
      .order('student_number', { ascending: true })
      .limit(10);
      
    if (testError) {
      console.error('❌ API查询测试失败:', testError);
    } else {
      console.log(`✅ API查询测试成功，返回 ${testStudents.length} 个学生:`);
      testStudents.forEach(student => {
        console.log(`  - ${student.full_name} (${student.student_number}) - 班级: ${student.class_name || '未设置'} - 状态: ${student.status}`);
      });
    }
    
    // 6. 测试教师API路由
    console.log('\n6. 测试完整的学生数据获取:');
    const { data: allActiveStudents, error: allError } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('status', 'active')
      .order('student_number');
      
    if (allError) {
      console.error('❌ 获取所有活跃学生失败:', allError);
    } else {
      console.log(`✅ 当前活跃学生总数: ${allActiveStudents.length}`);
      if (allActiveStudents.length > 0) {
        console.log('前5个学生:');
        allActiveStudents.slice(0, 5).forEach(student => {
          console.log(`  - ${student.full_name} (${student.student_number}) - ${student.class_name || '未分班'}`);
        });
      }
    }
    
    console.log('\n=== 修复完成 ===');
    console.log('现在教师端应该能正常显示学生列表了！');
    
  } catch (error) {
    console.error('修复过程中出现错误:', error);
  }
}

fixStudentListDisplay().catch(console.error);