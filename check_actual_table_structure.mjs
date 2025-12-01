import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkTableStructure() {
  try {
    console.log('🔍 检查实际表结构...\n');
    
    // 检查users表结构
    console.log('📋 users表结构:');
    const { data: columns, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'users')
      .eq('table_schema', 'public');
    
    if (error) {
      console.error('❌ 无法查询表结构:', error.message);
    } else {
      console.log('✅ users表的列:');
      columns?.forEach(col => {
        console.log(`- ${col.column_name} (${col.data_type})`);
      });
    }
    
    // 检查users表中的实际数据
    console.log('\n📋 users表中的数据:');
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (userError) {
      console.error('❌ 无法查询用户数据:', userError.message);
    } else {
      console.log('✅ 用户数据:');
      users?.forEach(user => {
        console.log(`用户: ${JSON.stringify(user, null, 2)}`);
      });
    }
    
    // 检查teacher_student_relationships表中的实际学生ID
    console.log('\n📋 教师学生关系中的学生ID:');
    const { data: relationships, error: relError } = await supabase
      .from('teacher_student_relationships')
      .select('student_id')
      .distinct();
    
    if (relError) {
      console.error('❌ 无法查询关系数据:', relError.message);
    } else {
      console.log('✅ 学生ID列表:');
      relationships?.forEach(rel => {
        console.log(`- ${rel.student_id}`);
      });
    }
    
  } catch (error) {
    console.error('🚨 检查过程中发生错误:', error);
  }
}

checkTableStructure();