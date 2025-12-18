import { supabase } from '../src/lib/supabase';

async function testFunction() {
  try {
    console.log('测试数据库函数是否存在...');
    
    // 测试函数是否存在
    const { data: functions, error: funcError } = await supabase
      .from('pg_proc')
      .select('proname')
      .eq('proname', 'get_available_students_for_import');
    
    if (funcError) {
      console.error('查询函数失败:', funcError);
      return;
    }
    
    console.log('找到的函数:', functions);
    
    if (!functions || functions.length === 0) {
      console.log('函数不存在，需要执行SQL脚本');
      return;
    }
    
    // 测试函数调用
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
      console.error('函数调用失败:', error);
      return;
    }

    console.log('函数调用成功，返回数据:');
    console.log('数据类型:', typeof data);
    console.log('是否为数组:', Array.isArray(data));
    console.log('数据内容:', JSON.stringify(data, null, 2));

  } catch (err) {
    console.error('测试失败:', err);
  }
}

testFunction();