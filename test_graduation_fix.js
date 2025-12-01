// 使用项目中实际的Supabase配置
import { createClient } from '@supabase/supabase-js';

// 真实的Supabase配置
const SUPABASE_URL = 'https://mddpbyibesqewcktlqle.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZHBieWliZXNxZXdja3RscWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNTQzNDksImV4cCI6MjA3ODkzMDM0OX0.T8QHCT3UK5f2mp76Oe9-AZpdrmPOFy1wVutxfmg49EU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testGraduationCounts() {
  try {
    console.log('开始测试毕业去向数据...');
    
    // 测试已审批的数量
    const approvedResult = await supabase
      .from('graduation_destinations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');
    
    console.log('已审批数量:', approvedResult.count || 0);
    console.log('已审批查询结果:', approvedResult);
    
    // 测试未审核的数量
    const pendingResult = await supabase
      .from('graduation_destinations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    console.log('未审核数量:', pendingResult.count || 0);
    console.log('未审核查询结果:', pendingResult);
    
    // 获取样例数据检查
    const sampleResult = await supabase
      .from('graduation_destinations')
      .select('*')
      .limit(5);
    
    console.log('样例数据数量:', sampleResult.data?.length || 0);
    if (sampleResult.data && sampleResult.data.length > 0) {
      console.log('样例数据:', sampleResult.data);
      // 检查status字段的实际值
      console.log('status值示例:', sampleResult.data.map(item => item.status));
    }
    
  } catch (error) {
    console.error('测试过程中出错:', error);
  }
}

testGraduationCounts();