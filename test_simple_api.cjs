const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function testSimpleAPI() {
  try {
    console.log('🧪 测试简单的API调用...');
    
    // 测试最简单的学生分配
    const testStudentId = '00000000-0000-0000-0000-000000000102';
    const testProgramId = '62b2cc69-5b10-4238-8232-59831cdb7964';
    
    console.log('测试数据:');
    console.log('学生ID:', testStudentId);
    console.log('培养方案ID:', testProgramId);
    
    // 获取student_profiles中的ID
    const { data: profile, error: profileError } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', testStudentId)
      .single();
      
    if (profileError) {
      console.error('❌ 获取student_profile失败:', profileError.message);
      return;
    }
    
    console.log('✅ 找到student_profile id:', profile.id);
    
    // 测试API调用
    const response = await fetch(`http://localhost:3001/api/teacher/00000000-0000-0000-0000-000000000001/batch-assign-training-program`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        programId: testProgramId,
        studentIds: [testStudentId],
        notes: '简单测试'
      }),
    });
    
    console.log('API响应状态:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API错误响应:', errorText);
    } else {
      const result = await response.json();
      console.log('API响应数据:', JSON.stringify(result, null, 2));
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testSimpleAPI();