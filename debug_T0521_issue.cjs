const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mddpbyibesqewcktlqle.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZHBieWliZXNxZXdja3RscWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNTQzNDksImV4cCI6MjA3ODkzMDM0OX0.T8QHCT3UK5f2mp76Oe9-AZpdrmPOFy1wVutxfmg49EU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugT0521() {
  try {
    console.log('🔍 调试T0521账号批量导入学生列表问题\n');

    // 1. 查找T0521用户
    console.log('1️⃣ 查找T0521用户...');
    const { data: teacherData, error: teacherError } = await supabase
      .from('users')
      .select('id, full_name, email, user_number, role_id')
      .eq('user_number', 'T0521')
      .single();
    
    if (teacherError) {
      console.error('❌ 未找到T0521用户:', teacherError);
      return;
    }
    
    console.log('✅ 找到T0521用户:', teacherData);

    // 2. 检查函数是否执行
    console.log('\n2️⃣ 测试get_available_students_for_import函数...');
    try {
      const { data: availableData, error: funcError } = await supabase
        .rpc('get_available_students_for_import', {
          p_teacher_id: teacherData.id,
          p_keyword: '',
          p_grade: '',
          p_department: '',
          p_page: 1,
          p_limit: 10
        });
      
      if (funcError) {
        console.error('❌ 函数执行错误:', funcError);
      } else {
        console.log('✅ 函数执行成功:', availableData);
        
        if (availableData && availableData.length > 0) {
          const result = availableData[0];
          console.log(`可导入学生数量: ${result.total_count}`);
          
          if (result.students) {
            const students = JSON.parse(result.students);
            console.log('学生列表:', students);
          }
        } else {
          console.log('函数返回空结果');
        }
      }
    } catch (rpcError) {
      console.error('❌ RPC调用失败:', rpcError);
    }

    // 3. 检查所有学生
    console.log('\n3️⃣ 检查所有活跃学生...');
    const { data: allStudents, error: studentsError } = await supabase
      .from('users')
      .select('id, full_name, user_number, role_id, status')
      .eq('role_id', '3')
      .eq('status', 'active')
      .limit(10);
    
    if (studentsError) {
      console.error('❌ 获取学生失败:', studentsError);
    } else {
      console.log(`系统总学生数: ${allStudents.length}`);
      allStudents.forEach((s, i) => {
        console.log(`   ${i+1}. ${s.full_name} (${s.user_number})`);
      });
    }

    // 4. 检查师生关联
    console.log('\n4️⃣ 检查师生关联...');
    const { data: relations, error: relationsError } = await supabase
      .from('teacher_students')
      .select('*');
    
    if (relationsError) {
      console.error('❌ 获取关联失败:', relationsError);
    } else {
      console.log(`当前师生关联数: ${relations.length}`);
      if (relations.length > 0) {
        relations.forEach((r, i) => {
          console.log(`   ${i+1}. 教师: ${r.teacher_id} -> 学生: ${r.student_id}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ 调试过程出错:', error);
  }
}

debugT0521();