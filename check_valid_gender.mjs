import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkValidGender() {
  try {
    console.log('🔍 检查现有记录的gender值...\n');
    
    // 查看现有记录的gender值
    const { data: profiles, error } = await supabase
      .from('student_profiles')
      .select('gender')
      .not('gender', 'is', null)
      .limit(5);
    
    if (error) {
      console.error('❌ 查询失败:', error.message);
    } else {
      console.log('✅ 现有的gender值:');
      const uniqueGenders = [...new Set(profiles?.map(p => p.gender) || [])];
      uniqueGenders.forEach(g => {
        console.log(`- "${g}"`);
      });
      
      if (uniqueGenders.length === 0) {
        console.log('没有找到现有的gender值，尝试使用NULL');
      }
    }
    
  } catch (err) {
    console.error('执行错误:', err);
  }
}

checkValidGender();