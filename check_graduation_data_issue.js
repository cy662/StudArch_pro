import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// 加载环境变量
config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkData() {
  try {
    console.log('=== 检查学生2022666的毕业去向数据 ===');
    
    // 1. 检查学生用户信息
    const { data: studentData, error: studentError } = await supabase
      .from('users')
      .select('*')
      .eq('user_number', '2022666');
    
    if (studentError) {
      console.error('查询学生信息失败:', studentError);
    } else {
      console.log('学生2022666信息:', studentData);
    }
    
    // 2. 检查该学生的毕业去向记录
    if (studentData && studentData.length > 0) {
      const { data: graduationData, error: graduationError } = await supabase
        .from('graduation_destinations')
        .select('*')
        .eq('student_id', studentData[0].id);
      
      if (graduationError) {
        console.error('查询毕业去向失败:', graduationError);
      } else {
        console.log('学生2022666的毕业去向记录:', graduationData);
      }
    }
    
    // 3. 检查教师T0521信息
    const { data: teacherData, error: teacherError } = await supabase
      .from('users')
      .select('*')
      .eq('user_number', 'T0521');
    
    if (teacherError) {
      console.error('查询教师信息失败:', teacherError);
    } else {
      console.log('教师T0521信息:', teacherData);
    }
    
    // 4. 检查教师-学生关系
    if (studentData && studentData.length > 0 && teacherData && teacherData.length > 0) {
      const { data: relationData, error: relationError } = await supabase
        .from('teacher_students')
        .select('*')
        .eq('teacher_id', teacherData[0].id)
        .eq('student_id', studentData[0].id);
      
      if (relationError) {
        console.error('查询教师-学生关系失败:', relationError);
      } else {
        console.log('教师T0521与学生2022666的关系:', relationData);
      }
    }
    
    // 5. 检查教师T0521管理的学生列表
    if (teacherData && teacherData.length > 0) {
      const { data: teacherStudents, error: teacherStudentsError } = await supabase
        .from('teacher_students')
        .select('*, users!teacher_students_student_id_fkey(user_number, full_name)')
        .eq('teacher_id', teacherData[0].id);
      
      if (teacherStudentsError) {
        console.error('查询教师管理的学生列表失败:', teacherStudentsError);
      } else {
        console.log('教师T0521管理的学生列表:', teacherStudents);
      }
    }
    
  } catch (error) {
    console.error('检查数据失败:', error);
  }
}

checkData();