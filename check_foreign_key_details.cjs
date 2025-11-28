const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkForeignKeyDetails() {
  try {
    console.log('检查外键约束详情...');
    
    const testStudentId = '00000000-0000-0000-0000-000000000102'; // 李小红
    
    console.log(`检查学生 ${testStudentId} 在各个表中的存在情况:`);
    
    // 检查users表
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('id', testStudentId)
      .single();
      
    console.log(`users表: ${user ? '✅ 存在' : '❌ 不存在'} ${user ? `(${user.full_name})` : ''}`);
    
    // 检查student_profiles表（通过id）
    const { data: profileById, error: profileIdError } = await supabase
      .from('student_profiles')
      .select('id, academic_status')
      .eq('id', testStudentId)
      .single();
      
    console.log(`student_profiles表(id): ${profileById ? '✅ 存在' : '❌ 不存在'}`);
    
    // 检查student_profiles表（通过user_id）
    const { data: profileByUserId, error: profileUserIdError } = await supabase
      .from('student_profiles')
      .select('user_id, academic_status')
      .eq('user_id', testStudentId)
      .single();
      
    console.log(`student_profiles表(user_id): ${profileByUserId ? '✅ 存在' : '❌ 不存在'}`);
    
    // 如果student_profiles中有这个记录，尝试查找对应的id
    if (profileByUserId) {
      console.log(`找到的student_profiles id: ${profileByUserId.user_id}`);
      
      // 检查现有分配记录
      const { data: existingAssignments, error: assignError } = await supabase
        .from('student_training_programs')
        .select('*')
        .eq('student_id', testStudentId);
        
      if (assignError) {
        console.error('查询现有分配失败:', assignError.message);
      } else {
        console.log(`现有student_training_programs记录: ${existingAssignments.length} 条`);
      }
      
      // 尝试使用profileByUserId的id进行分配
      if (profileByUserId.user_id) {
        const testProgramId = '62b2cc69-5b10-4238-8232-59831cdb7964';
        
        const { data: insertData, error: insertError } = await supabase
          .from('student_training_programs')
          .insert({
            student_id: profileByUserId.user_id, // 使用student_profiles中找到的id
            program_id: testProgramId,
            enrollment_date: new Date().toISOString().split('T')[0],
            status: 'active',
            notes: '测试插入',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select();
          
        if (insertError) {
          console.error('使用student_profiles id插入失败:', insertError.message);
        } else {
          console.log('✅ 使用student_profiles id插入成功!');
        }
      }
    }
    
  } catch (error) {
    console.error('执行失败:', error);
  }
}

checkForeignKeyDetails();