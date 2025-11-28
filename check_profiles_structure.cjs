const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkProfilesStructure() {
  try {
    console.log('检查student_profiles表结构...');
    
    // 先检查现有数据
    const { data: existingData, error: existingError } = await supabase
      .from('student_profiles')
      .select('*')
      .limit(3);
      
    if (existingError) {
      console.error('查询现有数据失败:', existingError);
    } else {
      console.log('现有数据示例:');
      if (existingData.length > 0) {
        const columns = Object.keys(existingData[0]);
        console.log('表字段:', columns);
        if (existingData.length > 0) {
          const firstRow = existingData[0];
          console.log('ID:', firstRow.id, '字段:', JSON.stringify(firstRow, null, 2));
        }
      } else {
        console.log('没有现有数据');
      }
    }
    
    // 检查表是否允许插入
    console.log('\n尝试简单插入...');
    const { data: insertData, error: insertError } = await supabase
      .from('student_profiles')
      .insert({
        id: '00000000-0000-0000-0000-000000000102', // 测试占位符ID
        student_number: 'ST2021002',
        full_name: '李小红',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
      
    if (insertError) {
      console.error('插入失败:', insertError.message);
    } else {
      console.log('插入成功!');
    }
    
  } catch (error) {
    console.error('执行失败:', error);
  }
}

checkProfilesStructure();