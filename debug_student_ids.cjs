const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkStudentIds() {
  try {
    console.log('检查学生ID格式...');
    
    // 检查users表中的学生
    const { data: students, error } = await supabase
      .from('users')
      .select('id, user_number, full_name, role_id')
      .eq('role_id', '3')
      .limit(5);
    
    if (error) {
      console.error('查询学生失败:', error);
      return;
    }
    
    console.log('找到的学生:');
    students.forEach(student => {
      console.log(`学号: ${student.user_number}, 姓名: ${student.full_name}, ID: ${student.id}`);
      console.log(`ID格式: ${/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(student.id) ? '✅ UUID' : '❌ 非UUID'}`);
    });
    
    // 检查teacher_students表
    const { data: relations, error: relError } = await supabase
      .from('teacher_students')
      .select('*')
      .limit(5);
      
    if (relError) {
      console.error('查询师生关系失败:', relError);
    } else if (relations.length > 0) {
      console.log('\n师生关系:');
      relations.forEach(rel => {
        console.log(`教师ID: ${rel.teacher_id}, 学生ID: ${rel.student_id}`);
        console.log(`教师ID格式: ${/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(rel.teacher_id) ? '✅ UUID' : '❌ 非UUID'}`);
        console.log(`学生ID格式: ${/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(rel.student_id) ? '✅ UUID' : '❌ 非UUID'}`);
      });
    } else {
      console.log('\n没有找到师生关系数据');
    }
    
    // 检查当前教师管理的学生
    const teacherId = '00000000-0000-0000-0000-000000000001';
    const { data: teacherStudents, error: teacherError } = await supabase
      .from('teacher_students')
      .select('student_id')
      .eq('teacher_id', teacherId);
      
    if (teacherError) {
      console.error('查询教师管理的学生失败:', teacherError);
    } else {
      console.log(`\n教师 ${teacherId} 管理的学生数量:`, teacherStudents.length);
    }
    
  } catch (error) {
    console.error('执行失败:', error);
  }
}

checkStudentIds();