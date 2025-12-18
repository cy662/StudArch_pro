const { createClient } = require('@supabase/supabase-js');

// Supabase 配置
const supabaseUrl = 'https://zdxwoyaehxygqjdbluof.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkeHdveWFlaHh5Z3FqZGJsdW9mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTk0Mjc2NiwiZXhwIjoyMDUxNTE4NzY2fQ.W21s-TKGEjyrcpJtZrJKmP1NMlFBVFNDGn2bvqxJ8es';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseFunction() {
  try {
    console.log('测试数据库函数 get_available_students_for_import...');
    
    // 使用 T0521 教师的 ID
    const teacherId = 'c1180a7f-db85-47c6-b08f-08973d348b76';
    
    const { data, error } = await supabase
      .rpc('get_available_students_for_import', {
        p_teacher_id: teacherId,
        p_keyword: '',
        p_grade: '',
        p_department: '',
        p_page: 1,
        p_limit: 20
      });

    if (error) {
      console.error('数据库函数调用失败:', error);
      return;
    }

    console.log('数据库函数返回的原始数据:');
    console.log('数据类型:', typeof data);
    console.log('数据内容:', JSON.stringify(data, null, 2));
    
    if (Array.isArray(data)) {
      console.log('数据是数组，长度:', data.length);
      if (data.length > 0) {
        console.log('第一个元素:', JSON.stringify(data[0], null, 2));
      }
    }

  } catch (err) {
    console.error('测试失败:', err);
  }
}

testDatabaseFunction();