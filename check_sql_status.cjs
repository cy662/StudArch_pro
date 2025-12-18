const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mddpbyibesqewcktlqle.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZHBieWliZXNxZXdja3RscWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNTQzNDksImV4cCI6MjA3ODkzMDM0OX0.T8QHCT3UK5f2mp76Oe9-AZpdrmPOFy1wVutxfmg49EU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSQLFunction() {
  try {
    console.log('🔍 检查SQL函数状态...');
    
    const { data, error } = await supabase
      .rpc('get_available_students_for_import', {
        p_teacher_id: '00000000-0000-0000-0000-000000000000',
        p_keyword: '',
        p_grade: '',
        p_department: '',
        p_page: 1,
        p_limit: 5
      });
    
    if (error) {
      console.error('❌ 函数不存在或有问题:', error);
      console.log('💡 需要手动执行SQL文件');
      return false;
    } else {
      console.log('✅ 函数正常工作');
      console.log('📋 返回数据:', data);
      return true;
    }
  } catch (err) {
    console.error('❌ 检查失败:', err);
    return false;
  }
}

checkSQLFunction();