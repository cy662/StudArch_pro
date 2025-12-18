const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mddpbyibesqewcktlqle.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZHBieWliZXNxZXdja3RscWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNTQzNDksImV4cCI6MjA3ODkzMDM0OX0.T8QHCT3UK5f2mp76Oe9-AZpdrmPOFy1wVutxfmg49EU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkCurrentFunctions() {
  try {
    console.log('🔍 检查当前数据库函数状态...\n');

    // 1. 检查teacher_students表结构
    console.log('1️⃣ 检查teacher_students表...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('teacher_students')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ teacher_students表错误:', tableError);
    } else {
      console.log('✅ teacher_students表存在');
    }

    // 2. 检查现有函数
    console.log('\n2️⃣ 测试现有函数...');
    try {
      const { data: funcData, error: funcError } = await supabase
        .rpc('get_available_students_for_import', {
          p_teacher_id: '00000000-0000-0000-0000-000000000000',
          p_keyword: '',
          p_grade: '',
          p_department: '',
          p_page: 1,
          p_limit: 10
        });
      
      if (funcError) {
        console.error('❌ 函数执行错误:', funcError);
        console.log('错误详情:', funcError.message);
        
        if (funcError.message.includes('GROUP BY clause')) {
          console.log('🔧 发现SQL语法错误，需要修复函数');
        }
      } else {
        console.log('✅ 函数执行成功');
        console.log('返回数据:', funcData);
      }
    } catch (rpcError) {
      console.error('❌ RPC调用失败:', rpcError);
    }

    // 3. 检查学生数据
    console.log('\n3️⃣ 检查学生数据...');
    const { data: students, error: studentsError } = await supabase
      .from('users')
      .select('id, full_name, user_number, role_id, status, created_at')
      .eq('role_id', '3')
      .eq('status', 'active')
      .limit(5);
    
    if (studentsError) {
      console.error('❌ 获取学生数据失败:', studentsError);
    } else {
      console.log(`✅ 找到 ${students.length} 个活跃学生`);
      students.forEach((s, i) => {
        console.log(`   ${i+1}. ${s.full_name} (${s.user_number}) - ${s.id}`);
      });
    }

    // 4. 检查师生关联
    console.log('\n4️⃣ 检查师生关联...');
    const { data: relations, error: relationsError } = await supabase
      .from('teacher_students')
      .select('*')
      .limit(5);
    
    if (relationsError) {
      console.error('❌ 获取师生关联失败:', relationsError);
    } else {
      console.log(`✅ 找到 ${relations.length} 个师生关联`);
      relations.forEach((r, i) => {
        console.log(`   ${i+1}. 教师: ${r.teacher_id} -> 学生: ${r.student_id}`);
      });
    }

    console.log('\n📋 建议修复步骤:');
    console.log('1. 手动执行 simple_import_filter_fix.sql');
    console.log('2. 在Supabase控制台的SQL编辑器中执行');
    console.log('3. 验证修复效果');

  } catch (error) {
    console.error('❌ 检查过程出错:', error);
  }
}

checkCurrentFunctions();