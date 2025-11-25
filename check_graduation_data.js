<<<<<<< HEAD
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mddpbyibesqewcktlqle.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZHBieWliZXNxZXdja3RscWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNTQzNDksImV4cCI6MjA3ODkzMDM0OX0.T8QHCT3UK5f2mp76Oe9-AZpdrmPOFy1wVutxfmg49EU'
);

async function checkGraduationData() {
  try {
    console.log('=== 检查所有毕业去向相关表的数据 ===');
    
    const tables = [
      'graduation_destinations',
      'graduation_destination', 
      'student_graduation_destinations',
      'student_graduation_destination',
      'student_batch_operations',
      'batch_imports',
      'graduation_import_batches'
    ];
    
    for (const tableName of tables) {
      console.log(`\n--- 检查表 ${tableName} ---`);
      
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(5);
        
        if (error) {
          console.log(`❌ 查询失败: ${error.message}`);
        } else {
          console.log(`✅ 表存在，记录数: ${data?.length || 0}`);
          
          if (data && data.length > 0) {
            console.log('字段:', Object.keys(data[0]));
            console.log('数据示例:');
            data.forEach((record, index) => {
              console.log(`  记录 ${index + 1}:`, record);
            });
          }
        }
      } catch (err) {
        console.log(`❌ 检查失败: ${err.message}`);
      }
    }
    
    console.log('\n=== 检查 student_profiles 表字段（用于关联查询） ===');
    
    const { data: students, error: studentError } = await supabase
      .from('student_profiles')
      .select('*')
      .limit(1);
    
    if (studentError) {
      console.error('查询学生表失败:', studentError);
    } else {
      console.log('student_profiles 字段:', students && students.length > 0 ? Object.keys(students[0]) : '无数据');
      if (students && students.length > 0) {
        console.log('学生数据示例:', students[0]);
      }
    }
    
    console.log('\n=== 检查是否有导入批次记录 ===');
    
    const { data: batches, error: batchError } = await supabase
      .from('graduation_import_batches')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (batchError) {
      console.log('查询导入批次失败:', batchError.message);
    } else {
      console.log('导入批次记录:', batches?.length || 0, '条');
      if (batches && batches.length > 0) {
        batches.forEach((batch, index) => {
          console.log(`批次 ${index + 1}:`, {
            id: batch.id,
            batch_name: batch.batch_name,
            total_records: batch.total_records,
            success_count: batch.success_count,
            status: batch.status
          });
        });
      }
    }
    
  } catch (err) {
    console.error('检查失败:', err);
  }
}

=======
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
>>>>>>> 99189c3911effb11cb5198390faf752cce0c6415
checkGraduationData();