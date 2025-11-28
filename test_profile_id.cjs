const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function testProfileId() {
  try {
    console.log('测试使用profile.id进行外键插入...');
    
    // 查找student_profiles记录
    const { data: profile, error } = await supabase
      .from('student_profiles')
      .select('id, user_id')
      .eq('user_id', '00000000-0000-0000-0000-000000000102')
      .single();
      
    if (profile) {
      console.log('找到的student_profiles记录:');
      console.log('id:', profile.id);
      console.log('user_id:', profile.user_id);
      
      // 检查这个id是否能用于外键
      const { data: test, error: testError } = await supabase
        .from('student_training_programs')
        .insert({
          student_id: profile.id, // 使用profile的id
          program_id: '62b2cc69-5b10-4238-8232-59831cdb7964',
          enrollment_date: new Date().toISOString().split('T')[0],
          status: 'active',
          notes: '测试插入',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
        
      if (testError) {
        console.error('使用profile.id插入失败:', testError.message);
      } else {
        console.log('✅ 使用profile.id插入成功!');
      }
    } else {
      console.log('没有找到对应的student_profiles记录');
    }
    
  } catch (error) {
    console.error('执行失败:', error);
  }
}

testProfileId();