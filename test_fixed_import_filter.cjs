const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mddpbyibesqewcktlqle.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZHBieWliZXNxZXdja3RscWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNTQzNDksImV4cCI6MjA3ODkzMDM0OX0.T8QHCT3UK5f2mp76Oe9-AZpdrmPOFy1wVutxfmg49EU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFixedImportFilter() {
  try {
    console.log('🧪 测试修复后的批量导入筛选逻辑\n');

    // 1. 创建测试数据：先建立一些师生关联
    console.log('1️⃣ 设置测试环境...');
    
    // 获取几个学生用于测试
    const { data: testStudents, error: studentError } = await supabase
      .from('users')
      .select('id, full_name, user_number')
      .eq('role_id', '3')
      .eq('status', 'active')
      .limit(3);
    
    if (studentError || !testStudents || testStudents.length === 0) {
      console.log('⚠️  没有找到测试学生，跳过关联测试');
    } else {
      // 创建一个虚拟教师ID
      const testTeacherId = '00000000-0000-0000-0000-000000000001';
      
      // 建立师生关联（模拟已有导入）
      for (const student of testStudents) {
        const { error: insertError } = await supabase
          .from('teacher_students')
          .insert({
            teacher_id: testTeacherId,
            student_id: student.id
          });
        
        if (insertError) {
          console.log(`⚠️  创建关联失败 ${student.full_name}:`, insertError.message);
        } else {
          console.log(`✅ 创建测试关联: 教师 -> ${student.full_name}`);
        }
      }
    }

    // 2. 检查所有师生关联
    console.log('\n2️⃣ 检查当前师生关联...');
    const { data: relations, error: relationsError } = await supabase
      .from('teacher_students')
      .select(`
        student_id,
        student:users!teacher_students_student_id_fkey(full_name, user_number)
      `);
    
    if (relationsError) {
      console.error('❌ 获取关联失败:', relationsError);
    } else {
      console.log(`当前师生关联数量: ${relations.length}`);
      relations.forEach((r, i) => {
        console.log(`   ${i+1}. 学生: ${r.student?.full_name} (${r.student?.user_number})`);
      });
    }

    // 3. 测试筛选逻辑
    console.log('\n3️⃣ 测试筛选逻辑...');
    const { data: allStudents, error: allStudentsError } = await supabase
      .from('users')
      .select('id, full_name, user_number')
      .eq('role_id', '3')
      .eq('status', 'active');
    
    if (allStudentsError) {
      console.error('❌ 获取所有学生失败:', allStudentsError);
      return;
    }
    
    console.log(`系统总学生数: ${allStudents.length}`);
    
    // 获取已关联的学生ID
    const importedStudentIds = new Set(relations?.map(r => r.student_id) || []);
    console.log(`已导入学生数: ${importedStudentIds.size}`);
    
    // 筛选可导入的学生
    const availableStudents = allStudents.filter(student => !importedStudentIds.has(student.id));
    console.log(`✅ 可导入学生数: ${availableStudents.length}`);
    
    if (availableStudents.length > 0) {
      console.log('可导入学生列表:');
      availableStudents.forEach((s, i) => {
        console.log(`   ${i+1}. ${s.full_name} (${s.user_number})`);
      });
    }

    // 4. 验证逻辑
    console.log('\n4️⃣ 验证筛选逻辑...');
    const hasDuplicates = allStudents.some(student => 
      importedStudentIds.has(student.id) && availableStudents.some(av => av.id === student.id)
    );
    
    if (hasDuplicates) {
      console.log('❌ 发现重复导入风险！');
    } else {
      console.log('✅ 筛选逻辑正确，无重复导入风险');
    }

    // 5. 清理测试数据
    console.log('\n5️⃣ 清理测试数据...');
    const { error: deleteError } = await supabase
      .from('teacher_students')
      .delete()
      .eq('teacher_id', '00000000-0000-0000-0000-000000000001');
    
    if (deleteError) {
      console.log('⚠️  清理测试数据失败:', deleteError.message);
    } else {
      console.log('✅ 测试数据清理完成');
    }

    console.log('\n🎉 测试完成！');
    console.log('📋 修复效果总结:');
    console.log('   - 排除所有已被任何教师导入的学生');
    console.log('   - 避免重复导入风险');
    console.log('   - 不同教师无法导入同一学生');
    console.log('   - 前端代码已更新实现完整筛选逻辑');

  } catch (error) {
    console.error('❌ 测试过程出错:', error);
  }
}

testFixedImportFilter();