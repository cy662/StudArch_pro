import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function getExactColumns() {
  try {
    const { data, error } = await supabase
      .from('student_profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('错误:', error.message);
    } else if (data && data.length > 0) {
      console.log('student_profiles表的所有列:');
      Object.keys(data[0]).forEach(key => {
        console.log('- ' + key);
      });
    } else {
      console.log('没有数据');
    }
  } catch (err) {
    console.error('执行错误:', err);
  }
}

getExactColumns();