const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkForeignKeys() {
  try {
    console.log('检查外键关系...');
    
    // 检查student_profiles表
    const { data: profiles, error: profileError } = await supabase
      .from('student_profiles')
      .select('id, student_number, full_name')
      .limit(5);
      
    if (profileError) {
      console.error('查询student_profiles失败:', profileError);
    } else {
      console.log('student_profiles表中的学生:');
      profiles.forEach(profile => {
        console.log('ID:', profile.id, '学号:', profile.student_number, '姓名:', profile.full_name);
      });
    }
    
    // 测试直接插入student_training_programs
    console.log('\n测试直接插入...');
    const testStudentId = '00000000-0000-0000-0000-000000000102';
    const testProgramId = '62b2cc69-5b10-4238-8232-59831cdb7964';
    
    // 先检查学生是否存在
    console.log('检查学生在users表中是否存在...');
    const { data: userCheck } = await supabase
      .from('users')
      .select('id')
      .eq('id', testStudentId);
    console.log('users表中存在:', userCheck.length > 0 ? '是' : '否');
    
    console.log('检查学生在student_profiles表中是否存在...');
    const { data: profileCheck } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('id', testStudentId);
    console.log('student_profiles表中存在:', profileCheck.length > 0 ? '是' : '否');
    
    // 尝试插入
    console.log('\n尝试插入student_training_programs...');
    const { data: insertData, error: insertError } = await supabase
      .from('student_training_programs')
      .insert({
        student_id: testStudentId,
        program_id: testProgramId,
        enrollment_date: new Date().toISOString().split('T')[0],
        status: 'active',
        notes: '测试插入',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
      
    if (insertError) {
      console.error('插入失败:', insertError.message);
    } else {
      console.log('插入成功:', insertData);
    }
    
  } catch (error) {
    console.error('执行失败:', error);
  }
}

checkForeignKeys();