// 测试班级显示功能的脚本
// 用于验证教师学生列表中的班级信息是否正确显示

const { createClient } = require('@supabase/supabase-js');

// Supabase配置
const supabaseUrl = 'https://your-project.supabase.co'; // 替换为实际的URL
const supabaseKey = 'your-anon-key'; // 替换为实际的密钥

const supabase = createClient(supabaseUrl, supabaseKey);

async function testClassDisplay() {
  console.log('=== 测试班级显示功能 ===\n');

  try {
    // 1. 检查学生用户的班级信息
    console.log('1. 检查学生用户的班级信息:');
    const { data: students, error: studentsError } = await supabase
      .from('users')
      .select('id, username, full_name, user_number, class_name, department, grade')
      .eq('role_id', '3')
      .limit(5);

    if (studentsError) {
      console.error('查询学生失败:', studentsError);
    } else {
      students.forEach(student => {
        console.log(`- ${student.full_name} (${student.user_number}): ${student.class_name || '无班级'}`);
      });
    }

    console.log('\n');

    // 2. 检查student_profiles表中的班级信息
    console.log('2. 检查student_profiles表中的班级信息:');
    const { data: profiles, error: profilesError } = await supabase
      .from('student_profiles')
      .select('id, user_id, class_name, class_id')
      .limit(5);

    if (profilesError) {
      console.error('查询学生档案失败:', profilesError);
    } else {
      for (const profile of profiles) {
        const student = students?.find(s => s.id === profile.user_id);
        console.log(`- ${student?.full_name || profile.user_id}: ${profile.class_name || '无班级'} (class_id: ${profile.class_id})`);
      }
    }

    console.log('\n');

    // 3. 检查classes表中的班级信息
    console.log('3. 检查classes表中的班级信息:');
    const { data: classes, error: classesError } = await supabase
      .from('classes')
      .select('id, class_name, grade, department')
      .limit(10);

    if (classesError) {
      console.error('查询班级表失败:', classesError);
    } else {
      classes.forEach(cls => {
        console.log(`- ${cls.class_name} (${cls.grade}, ${cls.department || '无院系'})`);
      });
    }

    console.log('\n');

    // 4. 检查teacher_students关联关系
    console.log('4. 检查teacher_students关联关系:');
    const { data: relations, error: relationsError } = await supabase
      .from('teacher_students')
      .select(`
        teacher_id,
        student_id,
        created_at,
        users!teacher_students_student_id_fkey(
          full_name,
          user_number,
          class_name
        )
      `)
      .limit(5);

    if (relationsError) {
      console.error('查询师生关联失败:', relationsError);
    } else {
      for (const rel of relations) {
        const student = rel.users;
        console.log(`- 学生: ${student?.full_name || rel.student_id}, 班级: ${student?.class_name || '无班级'}`);
      }
    }

    console.log('\n');

    // 5. 测试新的数据库函数
    console.log('5. 测试get_teacher_students_v2函数:');
    
    // 先获取一个教师ID
    const { data: teachers } = await supabase
      .from('users')
      .select('id')
      .eq('role_id', '2')
      .limit(1);

    if (teachers && teachers.length > 0) {
      const teacherId = teachers[0].id;
      console.log(`使用教师ID: ${teacherId}`);

      const { data: functionResult, error: functionError } = await supabase
        .rpc('get_teacher_students_v2', {
          p_teacher_id: teacherId,
          p_keyword: '',
          p_page: 1,
          p_limit: 10
        });

      if (functionError) {
        console.error('函数调用失败:', functionError);
        
        // 尝试简化版本
        console.log('\n尝试简化版本函数:');
        const { data: simpleResult, error: simpleError } = await supabase
          .rpc('get_teacher_students_simple', {
            p_teacher_id: teacherId,
            p_keyword: '',
            p_page: 1,
            p_limit: 10
          });
          
        if (simpleError) {
          console.error('简化版函数也失败:', simpleError);
        } else if (simpleResult && simpleResult.length > 0) {
          const result = simpleResult[0];
          const students = result.students || [];
          console.log(`找到 ${students.length} 个学生:`);
          students.forEach(student => {
            console.log(`- ${student.full_name}: ${student.class_name}`);
          });
        } else {
          console.log('简化版函数没有返回数据');
        }
      } else if (functionResult && functionResult.length > 0) {
        const result = functionResult[0];
        const students = result.students || [];
        console.log(`找到 ${students.length} 个学生:`);
        students.forEach(student => {
          console.log(`- ${student.full_name}: ${student.class_name}`);
        });
      } else {
        console.log('函数没有返回数据');
      }
    } else {
      console.log('没有找到教师用户');
    }

  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }

  console.log('\n=== 测试完成 ===');
}

// 运行测试
testClassDisplay();