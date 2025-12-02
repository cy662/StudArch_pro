const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function checkTableStructure() {
  try {
    const result = await supabase
      .from('student_profiles')
      .select('*')
      .limit(1);
    
    if (result.data && result.data.length > 0) {
      console.log('student_profiles 表字段:', Object.keys(result.data[0]));
      console.log('示例数据:', result.data[0]);
    } else {
      console.log('没有数据，无法查看字段');
    }
  } catch (err) {
    console.log('查询失败:', err.message);
  }
}

checkTableStructure();