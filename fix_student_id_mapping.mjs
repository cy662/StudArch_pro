import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function fixStudentIdMapping() {
  try {
    console.log('🔧 修复学生ID映射问题...\n');
    
    // 1. 获取teacher_student_relationships中的学生ID
    const { data: relStudents, error: relError } = await supabase
      .from('teacher_student_relationships')
      .select('student_id')
      .eq('teacher_id', '00000000-0000-0000-0000-000000000001');
    
    if (relError) {
      console.error('❌ 查询关系表错误:', relError.message);
      return;
    }
    
    const relationshipStudentIds = relStudents?.map(r => r.student_id) || [];
    console.log('✅ 关系表中的学生ID:', relationshipStudentIds);
    
    // 2. 获取student_training_programs中已存在的学生ID
    const { data: progStudents, error: progError } = await supabase
      .from('student_training_programs')
      .select('student_id');
    
    if (progError) {
      console.error('❌ 查询培养方案表错误:', progError.message);
      return;
    }
    
    const programStudentIds = progStudents?.map(p => p.student_id) || [];
    console.log('✅ 已分配培养方案的学生ID:', programStudentIds);
    
    // 3. 找出需要在users表中创建的学生
    const missingStudents = relationshipStudentIds.filter(
      id => !programStudentIds.includes(id)
    );
    
    console.log('📋 需要在users表中创建的学生ID:', missingStudents);
    
    // 4. 为缺失的学生创建users记录（使用最小必要信息）
    for (const studentId of missingStudents) {
      console.log(`🔨 为学生 ${studentId} 创建users记录...`);
      
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: studentId,
          username: `student_${studentId.substring(0, 8)}`,
          email: `student_${studentId.substring(0, 8)}@example.com`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error(`❌ 创建学生 ${studentId} 失败:`, insertError.message);
      } else {
        console.log(`✅ 学生 ${studentId} 创建成功`);
      }
    }
    
    // 5. 验证修复结果
    console.log('\n🎯 验证修复结果...');
    const { data: verifyUsers, error: verifyError } = await supabase
      .from('users')
      .select('id, username')
      .in('id', relationshipStudentIds);
    
    if (verifyError) {
      console.error('❌ 验证失败:', verifyError.message);
    } else {
      console.log('✅ 验证成功，找到的学生:');
      verifyUsers?.forEach(u => {
        console.log(`- ${u.username} (${u.id})`);
      });
    }
    
  } catch (error) {
    console.error('🚨 修复过程中发生错误:', error);
  }
}

fixStudentIdMapping();