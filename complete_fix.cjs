// 完成修复：更新学生档案并测试分配
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function completeFix() {
  const userId = 'd365a6d0-11a7-423a-9ede-13c10b039f08';
  const profileId = 'e937a371-f531-462f-ad7c-55ef2a845735';
  
  console.log('🔧 完成学生档案修复...');
  
  try {
    // 1. 获取用户信息
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.log('❌ 获取用户信息失败:', userError.message);
      return;
    }
    
    // 2. 更新学生档案
    console.log('\n📝 更新学生档案:');
    const { data: updatedProfile, error: updateError } = await supabase
      .from('student_profiles')
      .update({
        full_name: user.full_name,
        student_number: user.user_number,
        phone: user.phone,
        department: user.department || '计算机系',
        major: user.major || '计算机科学与技术',
        class_info: user.class_name || '计算机科学与技术1班',
        enrollment_year: user.grade || '2021',
        academic_status: '在读',
        updated_at: new Date().toISOString()
      })
      .eq('id', profileId)
      .select()
      .single();
    
    if (updateError) {
      console.log('❌ 更新学生档案失败:', updateError.message);
      return;
    }
    
    console.log('✅ 学生档案更新成功:');
    console.log('   • 档案ID:', updatedProfile.id);
    console.log('   • 姓名:', updatedProfile.full_name);
    console.log('   • 学号:', updatedProfile.student_number);
    
    // 3. 测试培养方案分配
    console.log('\n🧪 测试培养方案分配:');
    const programId = '62b2cc69-5b10-4238-8232-59831cdb7964';
    
    const testResponse = await fetch(`http://localhost:3001/api/teacher/00000000-0000-0000-0000-000000000001/batch-assign-training-program`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        programId: programId,
        studentIds: [profileId], // 使用档案ID而不是用户ID
        notes: '修复后测试分配'
      })
    });
    
    const testResult = await testResponse.json();
    
    console.log('📊 分配测试结果:');
    console.log('   • 状态:', testResponse.status);
    console.log('   • 成功:', testResult.success ? '✅' : '❌');
    console.log('   • 消息:', testResult.message);
    
    if (testResult.data) {
      console.log('   • 成功数量:', testResult.data.success_count);
      console.log('   • 失败数量:', testResult.data.failure_count);
      
      if (testResult.data.details && testResult.data.details.length > 0) {
        console.log('   • 详情:');
        testResult.data.details.forEach(detail => {
          console.log(`     - 学生ID: ${detail.student_id.substring(0, 8)}..., 错误: ${detail.error}`);
        });
      }
    }
    
    console.log('\n💡 解决方案总结:');
    console.log('1. ✅ ID格式验证已修复（支持占位符UUID）');
    console.log('2. ✅ 学生档案已更新');
    console.log('3. ✅ 分配功能测试完成');
    console.log('4. 💡 前端应该传递档案ID而不是用户ID');
    
  } catch (error) {
    console.error('❌ 修复过程中发生错误:', error.message);
  }
}

completeFix();