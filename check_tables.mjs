import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://mddpbyibesqewcktlqle.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZHBieWliZXNxZXdja3RscWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNTQzNDksImV4cCI6MjA3ODkzMDM0OX0.T8QHCT3UK5f2mp76Oe9-AZpdrmPOFy1wVutxfmg49EU');

async function checkTables() {
  console.log('🔍 检查学生学习信息相关表...');
  
  try {
    // 检查技术标签表
    const { data: tags, error: tagError } = await supabase
      .from('student_technical_tags')
      .select('id')
      .limit(1);
    
    if (tagError) {
      console.log('❌ 技术标签表不存在:', tagError.message);
    } else {
      console.log('✅ 技术标签表已存在');
    }
    
    // 检查学习收获表
    const { data: achievements, error: achievementError } = await supabase
      .from('student_learning_achievements')
      .select('id')
      .limit(1);
      
    if (achievementError) {
      console.log('❌ 学习收获表不存在:', achievementError.message);
    } else {
      console.log('✅ 学习收获表已存在');
    }
    
    // 检查学习成果表
    const { data: outcomes, error: outcomeError } = await supabase
      .from('student_learning_outcomes')
      .select('id')
      .limit(1);
      
    if (outcomeError) {
      console.log('❌ 学习成果表不存在:', outcomeError.message);
    } else {
      console.log('✅ 学习成果表已存在');
    }
    
  } catch (e) {
    console.log('❌ 检查失败:', e.message);
  }
}

checkTables();