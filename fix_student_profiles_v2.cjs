const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function fixStudentProfiles() {
  try {
    console.log('修复student_profiles表中的缺失数据...');
    
    // 获取users表中的所有学生
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
    let skippedCount = 0;
    
    for (const student of students) {
      // 检查是否已在student_profiles中（使用user_id字段）
      const { data: existing, error: checkError } = await supabase
        .from('student_profiles')
        .select('user_id')
        .eq('user_id', student.id)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found
        console.error('检查student_profiles失败:', checkError);
        continue;
      }
      
      if (existing) {
        console.log(`✓ 学生 ${student.full_name} 已在student_profiles中`);
        skippedCount++;
      } else {
        // 插入到student_profiles（使用正确的字段映射）
        const { data: inserted, error: insertError } = await supabase
          .from('student_profiles')
          .insert({
            user_id: student.id, // 使用user_id而不是id
            student_number: student.user_number || '',
            full_name: student.full_name || '', // 看起来这个字段存在
            phone: student.phone || '',
            department: student.department || '',
            grade: student.grade || '',
            class_name: '', // 如果需要可以添加
            academic_status: '在读', // 使用正确的状态字段
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select();
          
        if (insertError) {
          // 如果full_name不存在，尝试不使用它
          if (insertError.message.includes('full_name')) {
            const { data: inserted2, error: insertError2 } = await supabase
              .from('student_profiles')
              .insert({
                user_id: student.id,
                student_number: student.user_number || '',
                phone: student.phone || '',
                department: student.department || '',
                academic_status: '在读',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select();
              
            if (insertError2) {
              console.error(`插入学生 ${student.full_name} 失败:`, insertError2.message);
            } else {
              console.log(`+ 添加学生 ${student.full_name} 到student_profiles`);
              addedCount++;
            }
          } else {
            console.error(`插入学生 ${student.full_name} 失败:`, insertError.message);
          }
        } else {
          console.log(`+ 添加学生 ${student.full_name} 到student_profiles`);
          addedCount++;
        }
      }
    }
    
    console.log(`\n完成! 添加了 ${addedCount} 个学生，跳过 ${skippedCount} 个已存在的学生`);
    
  } catch (error) {
    console.error('执行失败:', error);
  }
}

fixStudentProfiles();