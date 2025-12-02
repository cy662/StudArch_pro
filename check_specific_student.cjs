const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function checkSpecificStudent() {
  const studentId = 'd365a6d0-11a7-423a-9ede-13c10b039f08';
  
  console.log('🔍 检查学生档案ID:', studentId);
  
  try {
    // 1. 直接查询这个ID的档案
    console.log('\n📋 直接查询学生档案:');
    const { data: profile, error: profileError } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('id', studentId);
    
    if (profileError) {
      console.log('❌ 查询失败:', profileError.message);
    } else {
      console.log('✅ 找到', profile.length, '条档案记录');
      profile.forEach((p, index) => {
        console.log(`\n记录 ${index + 1}:`);
        console.log('  • 档案ID:', p.id);
        console.log('  • 用户ID:', p.user_id);
        console.log('  • 姓名:', p.full_name);
        console.log('  • 学号:', p.student_number);
        console.log('  • 状态:', p.academic_status);
      });
    }
    
    // 2. 检查是否与教师关联
    if (profile && profile.length > 0) {
      console.log('\n👨‍🏫 检查教师关联:');
      const teacherId = '00000000-0000-0000-0000-000000000001';
      
      const { data: teacherStudent, error: teacherError } = await supabase
        .from('teacher_students')
        .select('*')
        .eq('teacher_id', teacherId)
        .eq('student_id', studentId);
      
      if (teacherError) {
        console.log('❌ 查询教师关联失败:', teacherError.message);
      } else {
        console.log('✅ 教师关联记录:', teacherStudent.length, '条');
        teacherStudent.forEach(ts => {
          console.log('  • 关联ID:', ts.id);
          console.log('  • 创建时间:', ts.created_at);
        });
      }
    }
    
    // 3. 模拟分配过程（查看具体失败原因）
    if (profile && profile.length > 0) {
      console.log('\n🧪 模拟分配过程:');
      const programId = '62b2cc69-5b10-4238-8232-59831cdb7964';
      
      console.log('参数:');
      console.log('  • 学生ID:', studentId);
      console.log('  • 培养方案ID:', programId);
      
      // 验证培养方案存在
      const { data: program, error: programError } = await supabase
        .from('training_programs')
        .select('*')
        .eq('id', programId)
        .single();
      
      if (programError) {
        console.log('❌ 培养方案验证失败:', programError.message);
      } else {
        console.log('✅ 培养方案存在:', program.program_name);
        
        // 尝试创建关联
        const { data: insertData, error: insertError } = await supabase
          .from('student_training_programs')
          .upsert({
            student_id: studentId,
            program_id: programId,
            enrollment_date: new Date().toISOString().split('T')[0],
            status: 'active',
            notes: '调试测试',
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'student_id,program_id',
            ignoreDuplicates: true
          })
          .select();
        
        if (insertError) {
          console.log('❌ 创建关联失败:');
          console.log('  • 错误消息:', insertError.message);
          console.log('  • 错误代码:', insertError.code);
          console.log('  • 错误详情:', insertError.details);
        } else {
          console.log('✅ 创建关联成功:', insertData);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error.message);
  }
}

checkSpecificStudent();