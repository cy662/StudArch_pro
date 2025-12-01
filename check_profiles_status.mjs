import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkProfiles() {
  try {
    const targetId = 'db888c86-eb18-4c5d-819a-d59f0d223adc';
    
    console.log('🔍 检查student_profiles表中的记录...\n');
    
    // 1. 检查所有记录
    const { data: allProfiles, error: allError } = await supabase
      .from('student_profiles')
      .select('user_id')
      .eq('user_id', targetId);
    
    if (allError) {
      console.error('❌ 查询失败:', allError.message);
    } else {
      console.log('✅ 找到的记录数:', allProfiles?.length || 0);
      if (allProfiles?.length > 0) {
        console.log('记录存在，user_id:', allProfiles[0].user_id);
      } else {
        console.log('❌ 记录不存在');
      }
    }
    
    // 2. 检查teacher_student_relationships中的对应记录
    const { data: relData, error: relError } = await supabase
      .from('teacher_student_relationships')
      .select('student_id, teacher_id')
      .eq('student_id', targetId)
      .eq('teacher_id', '00000000-0000-0000-0000-000000000001');
    
    if (relError) {
      console.error('❌ 查询关系表失败:', relError.message);
    } else {
      console.log('✅ 关系表记录数:', relData?.length || 0);
      if (relData?.length > 0) {
        console.log('关系存在:', relData[0]);
      }
    }
    
  } catch (err) {
    console.error('执行错误:', err);
  }
}

checkProfiles();