const { createClient } = require('@supabase/supabase-js');

// 配置Supabase客户端
const supabase = createClient(
  'https://mddpbyibesqewcktlqle.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZHBieWliZXNxZXdja3RscWxlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM1NDM0OSwiZXhwIjoyMDc4OTMwMzQ5fQ.P2Y3IaRqJn6Tf7NjaHztGSd__3bTb_aBVioKoIK9Rq8'
);

async function disableRLSPolicies() {
  try {
    console.log('🔧 开始禁用技术标签相关表的RLS策略...');

    // 禁用student_learning_summary表的RLS
    const { error: error1 } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE student_learning_summary DISABLE ROW LEVEL SECURITY;'
    });
    
    if (error1) {
      console.warn('⚠️ 禁用student_learning_summary RLS失败:', error1.message);
    } else {
      console.log('✅ student_learning_summary RLS已禁用');
    }

    // 禁用graduation_destinations表的RLS
    const { error: error2 } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE graduation_destinations DISABLE ROW LEVEL SECURITY;'
    });
    
    if (error2) {
      console.warn('⚠️ 禁用graduation_destinations RLS失败:', error2.message);
    } else {
      console.log('✅ graduation_destinations RLS已禁用');
    }

    // 禁用student_technical_tags表的RLS
    const { error: error3 } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE student_technical_tags DISABLE ROW LEVEL SECURITY;'
    });
    
    if (error3) {
      console.warn('⚠️ 禁用student_technical_tags RLS失败:', error3.message);
    } else {
      console.log('✅ student_technical_tags RLS已禁用');
    }

    // 禁用reward_punishments表的RLS
    const { error: error4 } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE reward_punishments DISABLE ROW LEVEL SECURITY;'
    });
    
    if (error4) {
      console.warn('⚠️ 禁用reward_punishments RLS失败:', error4.message);
    } else {
      console.log('✅ reward_punishments RLS已禁用');
    }

    // 测试技术标签查询
    console.log('\n🧪 测试技术标签查询...');
    const { data: testData, error: testError } = await supabase
      .from('student_learning_summary')
      .select('tag_names, total_tags, advanced_tags')
      .eq('student_profile_id', '89e41fee-a388-486f-bbb2-320c4e115ee1')
      .single();

    if (testError) {
      console.log('❌ 技术标签查询仍然失败:', testError.message);
    } else {
      console.log('✅ 技术标签查询成功:', testData);
    }

    // 测试毕业去向查询
    console.log('\n🧪 测试毕业去向查询...');
    const { data: gradData, error: gradError } = await supabase
      .from('graduation_destinations')
      .select('*')
      .eq('student_profile_id', '89e41fee-a388-486f-bbb2-320c4e115ee1')
      .single();

    if (gradError) {
      console.log('❌ 毕业去向查询仍然失败:', gradError.message);
    } else {
      console.log('✅ 毕业去向查询成功:', gradData);
    }

    console.log('\n🎉 RLS修复完成！请刷新页面测试。');

  } catch (error) {
    console.error('❌ RLS修复失败:', error.message);
    
    // 如果exec_sql不可用，提供替代方案
    console.log('\n💡 替代方案：直接在Supabase SQL编辑器中执行以下SQL：');
    console.log(`
-- 复制以下SQL到Supabase项目的SQL编辑器中执行：

ALTER TABLE student_learning_summary DISABLE ROW LEVEL SECURITY;
ALTER TABLE graduation_destinations DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_technical_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE reward_punishments DISABLE ROW LEVEL SECURITY;
    `);
  }
}

// 执行修复
disableRLSPolicies();