import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkTables() {
  try {
    console.log('=== 检查 teacher_student_assignments 表 ===');
    const { data: assignments, error: assignError } = await supabase
      .from('teacher_student_assignments')
      .select('*')
      .limit(1);
      
    if (assignError && assignError.code === 'PGRST205') {
      console.log('❌ teacher_student_assignments 表不存在');
    } else {
      console.log('✅ teacher_student_assignments 表存在');
      console.log('数据示例:', assignments);
    }
    
    console.log('\n=== 检查 student_training_programs 表 ===');
    const { data: studentTraining, error: studentTrainingError } = await supabase
      .from('student_training_programs')
      .select('*')
      .limit(1);
      
    if (studentTrainingError && studentTrainingError.code === 'PGRST205') {
      console.log('❌ student_training_programs 表不存在');
    } else {
      console.log('✅ student_training_programs 表存在');
      console.log('数据示例:', studentTraining);
    }
    
    console.log('\n=== 检查学生档案数据 ===');
    const { data: students, error: studentsError } = await supabase
      .from('student_profiles')
      .select('id, user_id, name, student_id')
      .limit(3);
      
    console.log('学生数据:', { students, studentsError });
    
    console.log('\n=== 检查教师档案数据 ===');
    const { data: teachers, error: teachersError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('role', 'teacher')
      .limit(3);
      
    console.log('教师数据:', { teachers, teachersError });
    
  } catch (err) {
    console.error('Error:', err);
  }
}

checkTables();