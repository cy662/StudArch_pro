import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function debugRelationship() {
  try {
    const teacherId = '00000000-0000-0000-0000-000000000001';
    const studentId = 'db888c86-eb18-4c5d-819a-d59f0d223adc';
    
    console.log('🔍 调试关系检查逻辑...\n');
    console.log(`教师ID: ${teacherId}`);
    console.log(`学生ID: ${studentId}\n`);
    
    // 1. 检查teacher_student_relationships表中的具体记录
    console.log('📋 检查教师学生关系记录:');
    const { data: relationship, error: relError } = await supabase
      .from('teacher_student_relationships')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('student_id', studentId);
    
    if (relError) {
      console.error('❌ 查询错误:', relError.message);
    } else {
      console.log('✅ 关系记录:', relationship);
      console.log('记录数量:', relationship?.length || 0);
    }
    
    // 2. 模拟函数中的EXISTS查询
    console.log('\n🔍 模拟函数中的EXISTS查询:');
    const { data: existsResult, error: existsError } = await supabase
      .from('teacher_student_relationships')
      .select('1')
      .eq('teacher_id', teacherId)
      .eq('student_id', studentId);
    
    if (existsError) {
      console.error('❌ EXISTS查询错误:', existsError.message);
    } else {
      console.log('✅ EXISTS查询结果:', existsResult?.length > 0 ? '存在' : '不存在');
      console.log('查询到的记录数:', existsResult?.length || 0);
    }
    
    // 3. 检查表名是否正确
    console.log('\n📋 检查所有表名:');
    const { data: tables, error: tableError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .ilike('tablename', '%teacher%');
    
    if (tableError) {
      console.error('❌ 无法查询表名:', tableError.message);
    } else {
      console.log('✅ 包含teacher的表:');
      tables?.forEach(table => {
        console.log(`- ${table.tablename}`);
      });
    }
    
    // 4. 检查函数是否真的存在
    console.log('\n📋 检查函数是否存在:');
    const { data: functions, error: funcError } = await supabase
      .from('pg_proc')
      .select('proname, pronargs')
      .eq('proname', 'batch_assign_training_program_to_teacher_students');
    
    if (funcError) {
      console.error('❌ 无法查询函数:', funcError.message);
    } else {
      console.log('✅ 找到的函数:');
      functions?.forEach(func => {
        console.log(`- ${func.proname} (参数数量: ${func.pronargs})`);
      });
    }
    
  } catch (error) {
    console.error('🚨 调试过程中发生错误:', error);
  }
}

debugRelationship();