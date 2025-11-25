// 检查毕业去向数据的脚本
const { createClient } = require('@supabase/supabase-js');

// 替换为你的Supabase配置
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_KEY || 'YOUR_SUPABASE_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkGraduationData() {
  try {
    console.log('=== 检查毕业去向数据 ===');
    
    // 1. 检查毕业去向表数据
    const { data: destinations, error: destError } = await supabase
      .from('graduation_destinations')
      .select('*')
      .limit(5);

    if (destError) {
      console.error('查询毕业去向数据失败:', destError);
      return;
    }

    console.log(`找到 ${destinations.length} 条毕业去向记录:`);
    destinations.forEach((dest, index) => {
      console.log(`${index + 1}. ID: ${dest.id}, 学生ID: ${dest.student_id}, 类型: ${dest.destination_type}, 状态: ${dest.status}`);
    });

    // 2. 检查相关学生信息
    if (destinations.length > 0) {
      const studentIds = [...new Set(destinations.map(dest => dest.student_id))];
      console.log('\n=== 检查相关学生信息 ===');
      console.log('学生ID列表:', studentIds);

      const { data: students, error: studentError } = await supabase
        .from('users')
        .select('id, student_number, full_name, class_name')
        .in('id', studentIds);

      if (studentError) {
        console.error('查询学生信息失败:', studentError);
        return;
      }

      console.log(`找到 ${students.length} 条学生记录:`);
      students.forEach((student, index) => {
        console.log(`${index + 1}. ID: ${student.id}, 学号: ${student.student_number}, 姓名: ${student.full_name}, 班级: ${student.class_name}`);
      });
    }

    // 3. 检查表结构
    console.log('\n=== 检查表结构 ===');
    
    // 检查graduation_destinations表结构
    const { data: destColumns, error: destColError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'graduation_destinations')
      .order('ordinal_position');

    if (!destColError) {
      console.log('graduation_destinations 表结构:');
      destColumns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });
    }

    // 检查users表结构
    const { data: userColumns, error: userColError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'users')
      .order('ordinal_position');

    if (!userColError) {
      console.log('\nusers 表结构:');
      userColumns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });
    }

  } catch (error) {
    console.error('检查过程出错:', error);
  }
}

// 运行检查
checkGraduationData();