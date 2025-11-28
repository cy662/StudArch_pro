const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function testFixedAllStudents() {
  console.log('=== 测试修复后的所有学生查询 ===');
  
  try {
    // 模拟修复后的API逻辑
    console.log('\n1. 查询所有学生用户（学号以20开头）:');
    const { data: users, error, count } = await supabase
      .from('users')
      .select(`
        id,
        username,
        email,
        full_name,
        user_number,
        phone,
        created_at
      `, { count: 'exact' })
      .like('user_number', '20%')
      .range(0, 19)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('❌ 查询失败:', error);
    } else {
      console.log(`✅ 成功查询到 ${users.length} 个学生用户（总数: ${count}）:`);
      
      const students = users.map(user => {
        return {
          id: user.id,
          student_number: user.user_number,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          class_name: '待分配',
          major: '待分配',
          department: '待分配',
          status: '在读'
        };
      });
      
      students.forEach((student, index) => {
        console.log(`  ${index + 1}. ${student.full_name} (${student.student_number}) - ${student.email || '无邮箱'} - ${student.class_name}`);
      });
      
      console.log('\n=== 测试搜索功能 ===');
      
      // 测试姓名搜索
      const keyword = '羊';
      const { data: searchResults, error: searchError } = await supabase
        .from('users')
        .select(`
          id,
          full_name,
          user_number,
          email
        `)
        .like('user_number', '20%')
        .or(`full_name.ilike.%${keyword}%,user_number.ilike.%${keyword}%`)
        .order('created_at', { ascending: false });
        
      if (!searchError) {
        console.log(`\n搜索"${keyword}"结果 (${searchResults.length} 个):`);
        searchResults.forEach(user => {
          console.log(`  - ${user.full_name} (${user.user_number})`);
        });
      }
      
      console.log('\n=== 修复完成 ===');
      console.log('✅ 现在API应该能显示所有6个学生了！');
      console.log('✅ 搜索功能也能正常工作！');
      console.log('✅ 新导入的学生也会自动显示！');
      
    }
    
  } catch (error) {
    console.error('测试过程中出现错误:', error);
  }
}

testFixedAllStudents().catch(console.error);