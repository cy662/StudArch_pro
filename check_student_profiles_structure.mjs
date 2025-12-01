import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkStudentProfilesStructure() {
  try {
    console.log('🔍 检查student_profiles表结构...\n');
    
    // 1. 获取student_profiles表中的现有数据来了解列结构
    console.log('📋 student_profiles表中的现有数据:');
    const { data: profiles, error: profileError } = await supabase
      .from('student_profiles')
      .select('*')
      .limit(3);
    
    if (profileError) {
      console.error('❌ 查询student_profiles表失败:', profileError.message);
    } else {
      console.log('✅ student_profiles表记录数:', profiles?.length || 0);
      if (profiles?.length > 0) {
        console.log('列结构（基于第一条记录）:');
        const columns = Object.keys(profiles[0]);
        columns.forEach(col => {
          console.log(`- ${col}: ${profiles[0][col]}`);
        });
      }
    }
    
    // 2. 检查users表的结构
    console.log('\n📋 users表中的相关数据:');
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, username, email')
      .in('id', ['db888c86-eb18-4c5d-819a-d59f0d223adc', '89e41fee-a388-486f-bbb2-320c4e115ee1'])
      .limit(3);
    
    if (userError) {
      console.error('❌ 查询users表失败:', userError.message);
    } else {
      console.log('✅ users表记录:');
      users?.forEach(u => {
        console.log(`- ${u.username} (${u.id})`);
      });
    }
    
  } catch (error) {
    console.error('🚨 检查过程中发生错误:', error);
  }
}

checkStudentProfilesStructure();