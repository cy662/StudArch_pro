import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkRealUsers() {
  try {
    console.log('👥 检查实际存在的用户...');
    
    // 检查学生用户
    const { data: students, error: studentError } = await supabase
      .from('users')
      .select('id, full_name, user_number, email')
      .eq('role_id', '3')
      .limit(10);
    
    if (studentError) {
      console.log('❌ 查询学生失败:', studentError.message);
      return;
    }
    
    console.log('📚 现有学生:');
    if (students && students.length > 0) {
      students.forEach((student, index) => {
        console.log(`${index + 1}. ID: ${student.id}`);
        console.log(`   姓名: ${student.full_name}`);
        console.log(`   学号: ${student.user_number}`);
        console.log(`   邮箱: ${student.email}`);
        console.log('');
      });
      
      // 生成正确的插入SQL
      console.log('🔧 生成的SQL:');
      console.log('INSERT INTO teacher_student_relationships (teacher_id, student_id) VALUES');
      
      const values = students.slice(0, 3).map(student => 
        `    ('00000000-0000-0000-0000-000000000001', '${student.id}')`
      ).join(',\n');
      
      console.log(values);
      console.log('ON CONFLICT (teacher_id, student_id) DO NOTHING;');
      
    } else {
      console.log('❌ 没有找到学生用户');
    }
    
  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error);
  }
}

checkRealUsers();