const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function createMissingProfiles() {
  try {
    console.log('为缺失的学生创建student_profiles记录...');
    
    // 直接获取users表中的学生
    const { data: students, error: studentError } = await supabase
      .from('users')
      .select('id, user_number, full_name, email, phone, department, grade')
      .eq('role_id', '3');
      
    if (studentError) {
      console.error('查询学生失败:', studentError);
      return;
    }
    
    console.log(`找到 ${students.length} 个学生，检查student_profiles表...`);
    
    let addedCount = 0;
    
    for (const student of students) {
      // 检查是否在student_profiles中（通过id）
      const { data: existing, error: checkError } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('id', student.id)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found
        console.error(`检查student_profiles失败 ${student.id}:`, checkError.message);
        continue;
      }
      
      if (existing) {
        console.log(`✓ 学生 ${student.full_name} 已在student_profiles中`);
      } else {
        // 插入到student_profiles，使用相同的ID作为id和user_id
        const { data: inserted, error: insertError } = await supabase
          .from('student_profiles')
          .insert({
            id: student.id, // 使用相同的ID
            user_id: student.id, // 也设置为user_id
            academic_status: '在读',
            enrollment_year: student.grade ? student.grade.substring(0, 4) : '2023',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select();
          
        if (insertError) {
          console.error(`插入学生 ${student.full_name} 失败:`, insertError.message);
        } else {
          console.log(`+ 添加学生 ${student.full_name} 到student_profiles`);
          addedCount++;
        }
      }
    }
    
    console.log(`\n完成! 添加了 ${addedCount} 个学生记录到student_profiles`);
    
  } catch (error) {
    console.error('执行失败:', error);
  }
}

createMissingProfiles();