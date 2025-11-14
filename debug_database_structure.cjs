const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jvwvkmttplienptcpgpx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2d3ZrbXR0cGxpZW5wdGNwZ3B4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MTgyNzQsImV4cCI6MjA3ODQ5NDI3NH0.qPsgmmnHNKb6pMhbhfkkS6hL3J00frGXL_5AYscb6Wc'
);

// 检查表结构
async function debugDatabase() {
  console.log('=== 检查数据库表结构 ===');
  
  // 查看student_profiles表结构
  const { data: tableInfo, error: tableError } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable')
    .eq('table_name', 'student_profiles')
    .eq('table_schema', 'public');
  
  if (tableError) {
    console.error('获取表结构失败:', tableError);
  } else {
    console.log('student_profiles表结构:');
    tableInfo.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
  }
  
  // 检查users表是否有数据
  console.log('\n=== 检查users表数据 ===');
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, user_number, full_name')
    .limit(5);
  
  if (usersError) {
    console.error('查询users表失败:', usersError);
  } else {
    console.log('users表前5条记录:');
    users.forEach(user => {
      console.log(`  ID: ${user.id}, 学号: ${user.user_number}, 姓名: ${user.full_name}`);
    });
  }
  
  // 检查当前student_profiles表数据
  console.log('\n=== 检查student_profiles表数据 ===');
  const { data: profiles, error: profilesError } = await supabase
    .from('student_profiles')
    .select('*')
    .limit(5);
  
  if (profilesError) {
    console.error('查询student_profiles表失败:', profilesError);
  } else {
    console.log('student_profiles表前5条记录:');
    profiles.forEach(profile => {
      console.log(`  ID: ${profile.id}, 用户ID: ${profile.user_id}, 性别: ${profile.gender}`);
    });
  }
}

debugDatabase().catch(console.error);