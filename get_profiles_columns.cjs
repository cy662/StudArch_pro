const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function getProfilesColumns() {
  try {
    console.log('获取student_profiles表的完整结构...');
    
    // 获取一条现有记录来查看所有字段
    const { data: existingData, error: existingError } = await supabase
      .from('student_profiles')
      .select('*')
      .limit(1);
      
    if (existingError) {
      console.error('查询失败:', existingError);
      return;
    }
    
    if (existingData.length > 0) {
      const row = existingData[0];
      console.log('student_profiles表字段:');
      Object.keys(row).forEach(key => {
        console.log(`  ${key}: ${row[key]} (类型: ${typeof row[key]})`);
      });
    }
    
    // 尝试只插入必要字段
    console.log('\n尝试只插入必要的字段...');
    
    const testStudentId = '00000000-0000-0000-0000-000000000102'; // 李小红
    
    const { data: insertData, error: insertError } = await supabase
      .from('student_profiles')
      .insert({
        user_id: testStudentId,
        academic_status: '在读',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
      
    if (insertError) {
      console.error('插入失败:', insertError.message);
    } else {
      console.log('✅ 基础插入成功!');
    }
    
  } catch (error) {
    console.error('执行失败:', error);
  }
}

getProfilesColumns();