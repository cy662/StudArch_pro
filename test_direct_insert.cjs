const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function testDirectInsert() {
  try {
    console.log('测试直接插入到student_training_programs...');
    
    // 1. 获取student_profile id
    const { data: profile, error: profileError } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', '00000000-0000-0000-0000-000000000102')
      .single();
      
    if (profileError) {
      console.error('查询student_profile失败:', profileError.message);
      return;
    }
    
    console.log('找到的student_profile id:', profile.id);
    
    // 2. 测试直接插入
    const { data: insertData, error: insertError } = await supabase
      .from('student_training_programs')
      .insert({
        student_id: profile.id,
        program_id: '62b2cc69-5b10-4238-8232-59831cdb7964',
        enrollment_date: new Date().toISOString().split('T')[0],
        status: 'active',
        notes: '直接插入测试',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
      
    if (insertError) {
      console.error('直接插入失败:', insertError.message);
    } else {
      console.log('✅ 直接插入成功!');
    }
    
    // 3. 现在测试API
    console.log('\n测试修复后的API...');
    
    const response = await fetch(`http://localhost:3001/api/teacher/00000000-0000-0000-0000-000000000001/batch-assign-training-program`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        programId: '62b2cc69-5b10-4238-8232-59831cdb7964',
        studentIds: ['00000000-0000-0000-0000-000000000102'],
        notes: 'API测试分配'
      }),
    });
    
    const result = await response.json();
    
    console.log('API响应状态:', response.status);
    console.log('API响应数据:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('执行失败:', error);
  }
}

testDirectInsert();