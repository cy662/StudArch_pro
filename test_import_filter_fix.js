import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mddpbyibesqewcktlqle.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZHBieWliZXNxZXdja3RscWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNTQzNDksImV4cCI6MjA3ODkzMDM0OX0.T8QHCT3UK5f2mp76Oe9-AZpdrmPOFy1wVutxfmg49EU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testImportFilterFix() {
  try {
    console.log('🧪 测试批量导入筛选逻辑修复效果\n');

    // 1. 检查当前系统中已存在的师生关联
    console.log('1️⃣ 检查当前师生关联情况...');
    const { data: teacherStudents, error: tsError } = await supabase
      .from('teacher_students')
      .select(`
        teacher_id,
        student_id,
        teacher:users!teacher_students_teacher_id_fkey(full_name, email, role_id),
        student:users!teacher_students_student_id_fkey(full_name, email, user_number, role_id)
      `)
      .limit(20);

    if (tsError) {
      console.error('获取师生关联失败:', tsError);
    } else {
      console.log(`当前师生关联数量: ${teacherStudents.length}`);
      teacherStudents.forEach((ts, index) => {
        console.log(`${index + 1}. 教师: ${ts.teacher?.full_name} -> 学生: ${ts.student?.full_name} (${ts.student?.user_number})`);
      });
    }

    // 2. 获取所有学生信息
    console.log('\n2️⃣ 获取所有学生信息...');
    const { data: allStudents, error: studentsError } = await supabase
      .from('users')
      .select('id, full_name, user_number, email, role_id, status')
      .eq('role_id', '3')
      .eq('status', 'active')
      .limit(10);

    if (studentsError) {
      console.error('获取学生信息失败:', studentsError);
      return;
    }

    console.log(`学生总数: ${allStudents.length}`);
    allStudents.forEach((student, index) => {
      console.log(`${index + 1}. ${student.full_name} (${student.user_number}) - ID: ${student.id}`);
    });

    // 3. 测试修复后的函数（先模拟一个教师ID）
    console.log('\n3️⃣ 测试修复后的筛选函数...');
    if (allStudents.length > 0) {
      // 使用第一个学生ID作为测试教师ID（仅用于测试）
      const testTeacherId = '00000000-0000-0000-0000-000000000000'; // 默认UUID用于测试
      
      try {
        const { data: availableStudents, error: functionError } = await supabase
          .rpc('get_available_students_for_import', {
            p_teacher_id: testTeacherId,
            p_keyword: '',
            p_grade: '',
            p_department: '',
            p_page: 1,
            p_limit: 10
          });

        if (functionError) {
          console.error('函数执行失败:', functionError);
          console.log('这可能是因为修复脚本还未执行，请先手动执行 manual_import_filter_fix.sql');
        } else {
          console.log('✅ 函数执行成功');
          console.log('返回的数据:', availableStudents);
          
          if (availableStudents && availableStudents.length > 0) {
            const result = availableStudents[0];
            console.log(`可导入学生数量: ${result.total_count}`);
            if (result.students) {
              console.log('可导入学生列表:');
              JSON.parse(result.students).forEach((student, index) => {
                console.log(`${index + 1}. ${student.full_name} (${student.user_number})`);
              });
            }
          } else {
            console.log('没有可导入的学生');
          }
        }
      } catch (rpcError) {
        console.error('RPC调用失败:', rpcError);
        console.log('这可能是因为修复脚本还未执行，请先手动执行 manual_import_filter_fix.sql');
      }
    }

    // 4. 提供手动执行指导
    console.log('\n📋 手动执行指导:');
    console.log('1. 登录 Supabase 控制台: https://supabase.com/dashboard');
    console.log('2. 选择你的项目');
    console.log('3. 进入 SQL Editor');
    console.log('4. 复制 manual_import_filter_fix.sql 文件的内容');
    console.log('5. 粘贴到 SQL Editor 中并点击 RUN');
    console.log('6. 执行完成后重新测试功能');

  } catch (error) {
    console.error('测试过程出错:', error);
  }
}

testImportFilterFix();