const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function compareAPIApproaches() {
  console.log('=== 对比不同的API查询方式 ===');
  
  try {
    // 方式1: 当前的修复（只查询有档案的学生）
    console.log('\n方式1: 当前修复（只查询有档案的学生）:');
    const { data: profilesOnly, error: profileOnlyError } = await supabase
      .from('student_profiles')
      .select(`
        id,
        user_id,
        users (
          full_name,
          user_number,
          email,
          phone
        )
      `);
      
    if (!profileOnlyError) {
      console.log(`找到 ${profilesOnly.length} 个有档案的学生:`);
      profilesOnly.forEach(p => {
        if (p.users) {
          console.log(`  - ${p.users.full_name} (${p.users.user_number})`);
        }
      });
    }
    
    // 方式2: 查询所有学生用户（不管是否有档案）
    console.log('\n方式2: 查询所有学生用户:');
    const { data: allStudents, error: allStudentsError } = await supabase
      .from('users')
      .select('*')
      .like('user_number', '20%')
      .order('created_at', { ascending: false });
      
    if (!allStudentsError) {
      console.log(`找到 ${allStudents.length} 个学生用户:`);
      allStudents.forEach(user => {
        console.log(`  - ${user.full_name} (${user.user_number}) - 有档案: ${profilesOnly?.some(p => p.user_id === user.id) ? '是' : '否'}`);
      });
    }
    
    // 方式3: 检查是否应该包含没有档案的学生
    console.log('\n方式3: 分析应该显示哪些学生:');
    console.log('分析:');
    console.log(`  - 总学生用户数: ${allStudents?.length || 0}`);
    console.log(`  - 有档案的学生数: ${profilesOnly?.length || 0}`);
    console.log(`  - 没有档案的学生数: ${(allStudents?.length || 0) - (profilesOnly?.length || 0)}`);
    
    // 方式4: 模拟原来的API逻辑
    console.log('\n方式4: 模拟可能的原始API逻辑（通过RPC函数）:');
    try {
      const { data: rpcResult, error: rpcError } = await supabase
        .rpc('get_teacher_students', {
          p_teacher_id: '00000000-0000-0000-0000-000000000001',
          p_keyword: '',
          p_page: 1,
          p_limit: 20
        });
        
      if (!rpcError && rpcResult && rpcResult.length > 0) {
        const students = rpcResult[0]?.students || [];
        console.log(`RPC函数返回 ${students.length} 个学生:`);
        students.forEach(student => {
          console.log(`  - ${student.full_name} (${student.user_number})`);
        });
      } else {
        console.log('RPC函数调用失败或返回空数据');
      }
    } catch (e) {
      console.log('RPC函数不存在或调用失败:', e.message);
    }
    
    // 建议
    console.log('\n=== 建议修复方案 ===');
    console.log('问题分析:');
    console.log('1. 你导入的6个学生用户都存在');
    console.log('2. 但只有2个有对应的student_profiles记录');
    console.log('3. 现在的API只查询有档案的学生，所以只显示2个');
    console.log('');
    console.log('解决方案:');
    console.log('1. 为缺少档案的学生创建档案记录');
    console.log('2. 或者修改API逻辑，显示所有学生用户（无论是否有档案）');
    console.log('');
    console.log('你希望采用哪种方案？');
    
  } catch (error) {
    console.error('对比过程中出现错误:', error);
  }
}

compareAPIApproaches().catch(console.error);