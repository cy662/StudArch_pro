const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function createMissingProfiles() {
  try {
    console.log('为缺失的学生创建student_profiles记录...');
    
    // 获取需要在student_profiles中的学生（从teacher_students表）
    const { data: teacherStudents, error: teacherError } = await supabase
      .from('teacher_students')
      .select('student_id')
      .neq('student_id', null);
      
    if (teacherError) {
      console.error('查询teacher_students失败:', teacherError);
      return;
    }
    
    console.log(`需要检查的student_ids:`, teacherStudents.map(ts => ts.student_id));
    
    let addedCount = 0;
    
    for (const ts of teacherStudents) {
      const studentId = ts.student_id;
      
      // 检查是否在student_profiles中（通过user_id）
      const { data: existingByUser, error: checkUserError } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('user_id', studentId)
        .single();
        
      // 检查是否在student_profiles中（通过id）
      const { data: existingById, error: checkIdError } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('id', studentId)
        .single();
        
      if (existingByUser) {
        console.log(`✓ 学生 ${studentId} 已在student_profiles中 (user_id匹配)`);
      } else if (existingById) {
        console.log(`✓ 学生 ${studentId} 已在student_profiles中 (id匹配)`);
      } else {
        // 获取用户信息
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('user_number, full_name, email, phone, department, grade')
          .eq('id', studentId)
          .single();
          
        if (userError) {
          console.error(`获取用户信息失败 ${studentId}:`, userError.message);
          continue;
        }
        
        // 插入到student_profiles，使用相同的ID作为id和user_id
        const { data: inserted, error: insertError } = await supabase
          .from('student_profiles')
          .insert({
            id: studentId, // 使用相同的ID
            user_id: studentId, // 也设置为user_id
            academic_status: '在读',
            enrollment_year: user.grade ? user.grade.substring(0, 4) : '2023',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select();
          
        if (insertError) {
          console.error(`插入学生 ${studentId} 失败:`, insertError.message);
        } else {
          console.log(`+ 添加学生 ${user.full_name || studentId} 到student_profiles`);
          addedCount++;
        }
      }
    }
    
    console.log(`\n完成! 添加了 ${addedCount} 个学生记录到student_profiles`);
    
    // 再次测试插入
    console.log('\n测试再次插入student_training_programs...');
    const testStudentId = '00000000-0000-0000-0000-000000000102';
    const testProgramId = '62b2cc69-5b10-4238-8232-59831cdb7964';
    
    const { data: insertData, error: testError } = await supabase
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
      
    if (testError) {
      console.error('测试插入失败:', testError.message);
    } else {
      console.log('✅ 测试插入成功!');
    }
    
  } catch (error) {
    console.error('执行失败:', error);
  }
}

createMissingProfiles();