// 测试单个学生分配
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function testSimpleAssignment() {
  try {
    console.log('🧪 测试简单分配操作...');
    
    const testStudentId = '00000000-0000-0000-0000-000000000102';
    const testProgramId = '62b2cc69-5b10-4238-8232-59831cdb7964';
    
    // 步骤1: 获取student_profile
    const { data: profile, error: profileError } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', testStudentId)
      .single();
      
    if (profileError || !profile) {
      console.error('❌ 获取student_profile失败:', profileError?.message);
      return;
    }
    
    console.log('✅ student_profile id:', profile.id);
    
    // 步骤2: 检查是否已存在分配
    const { data: existing, error: existingError } = await supabase
      .from('student_training_programs')
      .select('*')
      .eq('student_id', profile.id)
      .eq('program_id', testProgramId);
      
    if (existingError) {
      console.error('❌ 检查现有分配失败:', existingError.message);
      return;
    }
    
    if (existing && existing.length > 0) {
      console.log('✅ 分配已存在');
      return;
    }
    
    // 步骤3: 创建新分配
    const { data: newData, error: insertError } = await supabase
      .from('student_training_programs')
      .insert({
        student_id: profile.id,
        program_id: testProgramId,
        enrollment_date: new Date().toISOString().split('T')[0],
        status: 'active',
        notes: '简单测试',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
      
    if (insertError) {
      console.error('❌ 插入失败:', insertError.message);
    } else {
      console.log('✅ 分配成功:', newData);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testSimpleAssignment();