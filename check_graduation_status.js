import { createClient } from '@supabase/supabase-js';

// 从环境变量或配置中获取Supabase连接信息
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBibDJ0Y3FmZXd6b3F1cHFheXdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTUxNzEzNjUsImV4cCI6MjAzMDc0NzM2NX0.zP9SdI-6WkF1V69J0XyNtA1fQ9W2iD-3kU9xW6W0f7Q';

// 创建Supabase客户端
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 查询毕业去向表中的记录和状态值
async function checkGraduationStatus() {
  console.log('开始查询student_graduation_info表...');
  
  try {
    // 获取前5条记录查看详情
    const { data: sampleRecords, error: sampleError } = await supabase
      .from('student_graduation_info')
      .select('*')
      .limit(5);
    
    if (sampleError) {
      console.error('查询样例记录失败:', sampleError);
    } else {
      console.log('\n样例记录:');
      sampleRecords.forEach((record, index) => {
        console.log(`记录${index + 1}:`, JSON.stringify(record, null, 2));
      });
    }
    
    // 尝试查询所有可能的状态值的记录数
    const statusesToCheck = ['approved', '已审批', 'pending', '待审核', 'rejected', '已拒绝'];
    
    console.log('\n各种状态值的记录数:');
    for (const status of statusesToCheck) {
      const { count, error } = await supabase
        .from('student_graduation_info')
        .select('*', { count: 'exact', head: true })
        .eq('status', status);
      
      if (error) {
        console.error(`查询状态${status}失败:`, error);
      } else {
        console.log(`  status='${status}':`, count || 0);
      }
    }
    
  } catch (error) {
    console.error('查询过程中发生错误:', error);
  }
}

// 执行查询
checkGraduationStatus().then(() => {
  console.log('\n查询完成');
});