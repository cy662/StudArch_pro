import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkForeignKeyIssue() {
  try {
    const studentId = 'db888c86-eb18-4c5d-819a-d59f0d223adc';
    
    console.log('🔍 检查外键约束问题...\n');
    
    // 1. 检查这个学生在users表中是否存在
    console.log('📋 检查学生是否在users表中存在:');
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, email, raw_user_meta_data')
      .eq('id', studentId);
    
    if (userError) {
      console.error('❌ 查询users表错误:', userError.message);
    } else {
      console.log('✅ users表查询结果:', user?.length || 0, '条记录');
      if (user?.length > 0) {
        console.log('用户信息:', user[0]);
      } else {
        console.log('❌ 学生不在users表中');
      }
    }
    
    // 2. 检查student_training_programs表的结构和外键约束
    console.log('\n📋 检查student_training_programs表中的现有数据:');
    const { data: programs, error: progError } = await supabase
      .from('student_training_programs')
      .select('*')
      .limit(5);
    
    if (progError) {
      console.error('❌ 查询student_training_programs表错误:', progError.message);
    } else {
      console.log('✅ student_training_programs表记录数:', programs?.length || 0);
      programs?.forEach(p => {
        console.log(`- 学生: ${p.student_id}, 培养方案: ${p.program_id}`);
      });
    }
    
    // 3. 检查是否有这个学生ID在其他表中
    console.log('\n📋 检查学生在teacher_student_relationships表中:');
    const { data: rel, error: relError } = await supabase
      .from('teacher_student_relationships')
      .select('*')
      .eq('student_id', studentId);
    
    if (relError) {
      console.error('❌ 查询关系表错误:', relError.message);
    } else {
      console.log('✅ 关系表记录数:', rel?.length || 0);
      if (rel?.length > 0) {
        console.log('关系信息:', rel[0]);
      }
    }
    
    // 4. 获取真实存在的学生ID
    console.log('\n📋 获取所有真实存在的学生ID:');
    const { data: allStudents, error: allError } = await supabase
      .from('users')
      .select('id, username')
      .eq('raw_user_meta_data->>\'role\', \'student\'')  // 修复JSON路径查询
      .limit(5);
    
    if (allError) {
      console.log('❌ JSON路径查询失败，尝试其他方法');
      
      // 备用方法：检查raw_user_meta_data包含student的用户
      const { data: backupStudents } = await supabase
        .from('users')
        .select('id, username, raw_user_meta_data')
        .limit(10);
      
      const students = backupStudents?.filter(u => 
        JSON.stringify(u.raw_user_meta_data).includes('student')
      ) || [];
      
      console.log('✅ 找到的学生用户:');
      students.forEach(s => {
        console.log(`- ${s.username} (${s.id})`);
      });
      
    } else {
      console.log('✅ 学生用户:');
      allStudents?.forEach(s => {
        console.log(`- ${s.username} (${s.id})`);
      });
    }
    
  } catch (error) {
    console.error('🚨 检查过程中发生错误:', error);
  }
}

checkForeignKeyIssue();