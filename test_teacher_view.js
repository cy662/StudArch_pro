import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testTeacherView() {
  try {
    console.log('=== 测试教师T0521查看学生毕业去向 ===');
    
    // 1. 获取教师T0521的信息
    const { data: teacherData, error: teacherError } = await supabase
      .from('users')
      .select('*')
      .eq('user_number', 'T0521')
      .single();
    
    if (teacherError || !teacherData) {
      console.error('获取教师信息失败:', teacherError);
      return;
    }
    
    console.log('教师信息:', teacherData.user_number, '-', teacherData.full_name);
    
    // 2. 使用数据库函数查询教师管理的毕业去向
    const { data: destinations, error: functionError } = await supabase
      .rpc('get_teacher_graduation_destinations', {
        p_teacher_id: teacherData.id,
        p_destination_type: null,
        p_status: null,
        p_student_name: null,
        p_page: 1,
        p_limit: 50
      });
    
    if (functionError) {
      console.error('使用数据库函数查询失败:', functionError);
      
      // 降级查询：直接查询毕业去向并手动过滤
      console.log('尝试降级查询...');
      
      // 获取教师管理的学生ID列表
      const { data: teacherStudents, error: studentsError } = await supabase
        .from('teacher_students')
        .select('student_id')
        .eq('teacher_id', teacherData.id);
      
      if (studentsError) {
        console.error('获取教师学生列表失败:', studentsError);
        return;
      }
      
      const studentIds = teacherStudents.map(ts => ts.student_id);
      console.log('教师管理的学生ID列表:', studentIds);
      
      // 查询这些学生的毕业去向
      const { data: graduationData, error: graduationError } = await supabase
        .from('graduation_destinations')
        .select('*')
        .in('student_id', studentIds);
      
      if (graduationError) {
        console.error('查询毕业去向失败:', graduationError);
        return;
      }
      
      console.log('教师管理的毕业去向记录数量:', graduationData.length);
      
      // 获取学生详细信息
      for (const record of graduationData) {
        const { data: studentInfo, error: studentError } = await supabase
          .from('users')
          .select('user_number, full_name, class_name')
          .eq('id', record.student_id)
          .single();
        
        if (!studentError) {
          record.student = studentInfo;
          console.log(`- ${record.student.user_number} ${record.student.full_name} (${record.destination_type})`);
        }
        
        // 特别检查学生2022666
        if (record.student && record.student.user_number === '2022666') {
          console.log('*** 找到学生2022666的毕业去向记录 ***');
          console.log(record);
        }
      }
      
    } else {
      console.log('数据库函数查询结果:', destinations);
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testTeacherView();