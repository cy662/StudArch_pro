import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkValidStatus() {
  try {
    console.log('🔍 检查有效的profile_status值...\n');
    
    const { data: profiles, error } = await supabase
      .from('student_profiles')
      .select('profile_status')
      .not('profile_status', 'is', null)
      .limit(5);
    
    if (error) {
      console.error('❌ 查询失败:', error.message);
    } else {
      console.log('✅ 现有的profile_status值:');
      const uniqueStatus = [...new Set(profiles?.map(p => p.profile_status) || [])];
      uniqueStatus.forEach(s => {
        console.log(`- "${s}"`);
      });
    }
    
  } catch (err) {
    console.error('执行错误:', err);
  }
}

checkValidStatus();