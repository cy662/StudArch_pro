import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://mddpbyibesqewcktlqle.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZHBieWliZXNxZXdja3RscWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNTQzNDksImV4cCI6MjA3ODkzMDM0OX0.T8QHCT3UK5f2mp76Oe9-AZpdrmPOFy1wVutxfmg49EU');

async function debugLearningData() {
  console.log('🔍 调试学生学习数据...');
  
  try {
    const studentId = 'f1c1aa0d-2169-4369-af14-3cadc6aa22b4';
    
    // 检查学习成果数据
    const { data: outcomes, error: outcomeError } = await supabase
      .from('student_learning_outcomes')
      .select('*')
      .eq('student_profile_id', studentId)
      .eq('status', 'active');
      
    if (outcomeError) {
      console.log('❌ 学习成果查询失败:', outcomeError.message);
    } else {
      console.log('✅ 学习成果数据:');
      outcomes.forEach(outcome => {
        console.log(`  - 标题: ${outcome.outcome_title}`);
        console.log(`    描述: ${outcome.outcome_description}`);
        console.log(`    相关课程: ${outcome.related_course}`);
        console.log('---');
      });
    }
    
  } catch (e) {
    console.log('❌ 调试失败:', e.message);
  }
}

debugLearningData();