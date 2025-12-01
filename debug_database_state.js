import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkDatabaseState() {
  try {
    console.log('=== 检查教师学生关联表 ===');
    const { data: teacherStudent, error: tsError } = await supabase
      .from('teacher_student_assignments')
      .select('*')
      .eq('teacher_id', '00000000-0000-0000-0000-000000000001')
      .eq('student_id', '00000000-0000-0000-0000-000000000001')
      .single();
      
    console.log('Teacher-Student assignment:', { teacherStudent, tsError });
    
    console.log('\n=== 检查培养方案表 ===');
    const { data: programs, error: progError } = await supabase
      .from('training_programs')
      .select('*')
      .limit(1);
      
    console.log('Training programs:', { programs, progError });
    
    console.log('\n=== 检查学生档案表 ===');
    const { data: student, error: studError } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single();
      
    console.log('Student profile:', { student, studError });
    
  } catch (err) {
    console.error('Debug error:', err);
  }
}

checkDatabaseState();