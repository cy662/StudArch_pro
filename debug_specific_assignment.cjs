// 调试具体的分配失败问题
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugAssignment() {
  try {
    const studentId = 'd365a6d0-11a7-423a-9ede-13c10b039f08';
    const programId = '62b2cc69-5b10-4238-8232-59831cdb7964';
    const teacherId = '00000000-0000-0000-0000-000000000001';

    console.log('🔍 调试培养方案分配失败问题...\n');
    console.log('📋 参数信息:');
    console.log('• 学生ID:', studentId);
    console.log('• 培养方案ID:', programId);
    console.log('• 教师ID:', teacherId);
    console.log('');

    // 1. 检查学生是否存在
    console.log('👤 检查学生档案:');
    const { data: students, error: studentsError } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('id', studentId);

    if (studentsError) {
      console.log('❌ 学生档案查询失败:', studentsError.message);
    } else if (!students || students.length === 0) {
      console.log('❌ 学生档案不存在');
    } else if (students.length > 1) {
      console.log('⚠️  发现重复的学生档案记录:', students.length, '条');
      students.forEach((student, index) => {
        console.log(`   ${index + 1}. ID: ${student.id}, 姓名: ${student.full_name}, 用户ID: ${student.user_id}`);
      });
    } else {
      const student = students[0];
      console.log('✅ 学生档案存在:');
      console.log('   • ID:', student.id);
      console.log('   • 姓名:', student.full_name);
      console.log('   • 学号:', student.student_number);
      console.log('   • 用户ID:', student.user_id);
    }

    if (studentError) {
      console.log('❌ 学生档案查询失败:', studentError.message);
    } else {
      console.log('✅ 学生档案存在:');
      console.log('   • ID:', student.id);
      console.log('   • 姓名:', student.full_name);
      console.log('   • 学号:', student.student_number);
      console.log('   • 用户ID:', student.user_id);
    }
    console.log('');

    // 检查学生ID是否存在于users表中
    console.log('🔍 检查用户表:');
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', studentId)
      .single();

    if (userError) {
      console.log('❌ 用户表查询失败:', userError.message);
    } else {
      console.log('✅ 用户存在:', user.full_name, '(', user.user_number, ')');
    }

    // 显示实际存在的一些学生档案
    console.log('\n📋 查看实际存在的一些学生档案:');
    const { data: sampleStudents, error: sampleError } = await supabase
      .from('student_profiles')
      .select('id, full_name, student_number, user_id')
      .limit(5);

    if (sampleError) {
      console.log('❌ 查询示例学生失败:', sampleError.message);
    } else {
      console.log('✅ 找到', sampleStudents.length, '个学生档案:');
      sampleStudents.forEach((student, index) => {
        console.log(`   ${index + 1}. ID: ${student.id.substring(0, 8)}..., 姓名: ${student.full_name}, 用户ID: ${student.user_id.substring(0, 8)}...`);
      });
    }
    console.log('');

    // 2. 检查培养方案是否存在
    console.log('📚 检查培养方案:');
    const { data: program, error: programError } = await supabase
      .from('training_programs')
      .select('*')
      .eq('id', programId)
      .single();

    if (programError) {
      console.log('❌ 培养方案查询失败:', programError.message);
    } else {
      console.log('✅ 培养方案存在:');
      console.log('   • ID:', program.id);
      console.log('   • 名称:', program.program_name);
      console.log('   • 代码:', program.program_code);
      console.log('   • 状态:', program.status);
    }
    console.log('');

    // 3. 检查是否已经存在关联
    const student = students && students.length > 0 ? students[0] : null;
    if (student && program) {
      console.log('🔗 检查现有关联:');
      const { data: existingAssignment, error: existingError } = await supabase
        .from('student_training_programs')
        .select('*')
        .eq('student_id', studentId)
        .eq('program_id', programId);

      if (existingError) {
        console.log('❌ 关联查询失败:', existingError.message);
      } else if (existingAssignment && existingAssignment.length > 0) {
        console.log('⚠️  已存在关联记录:', existingAssignment.length, '条');
        existingAssignment.forEach((assignment, index) => {
          console.log(`   ${index + 1}. 状态: ${assignment.status}, 创建时间: ${assignment.created_at}`);
        });
      } else {
        console.log('✅ 无现有关联，可以创建新关联');
      }
      console.log('');

      // 4. 尝试创建关联（模拟分配）
      console.log('🔧 尝试创建关联:');
      const { data: insertData, error: insertError } = await supabase
        .from('student_training_programs')
        .upsert({
          student_id: studentId,
          program_id: programId,
          enrollment_date: new Date().toISOString().split('T')[0],
          status: 'active',
          notes: '调试测试分配',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'student_id,program_id',
          ignoreDuplicates: true
        })
        .select();

      if (insertError) {
        console.log('❌ 创建关联失败:', insertError.message);
        console.log('   • 错误代码:', insertError.code);
        console.log('   • 错误详情:', insertError.details);
      } else {
        console.log('✅ 创建关联成功:', insertData);
      }
    }

  } catch (error) {
    console.error('❌ 调试过程中发生错误:', error.message);
  }
}

debugAssignment();