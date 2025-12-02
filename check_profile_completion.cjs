// 检查个人信息完成度逻辑

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mddpbyibesqewcktlqle.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZHBieWliZXNxZXdja3RscWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNTQzNDksImV4cCI6MjA3ODkzMDM0OX0.T8QHCT3UK5f2mp76Oe9-AZpdrmPOFy1wVutxfmg49EU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfile() {
  try {
    // 获取学生的档案数据
    const { data: profiles } = await supabase
      .from('student_profiles')
      .select('*')
      .limit(3);
    
    console.log('📋 学生档案数据检查:');
    profiles.forEach((profile, index) => {
      console.log(`\n${index + 1}. 学生: ${profile.full_name || profile.name || '未知'}`);
      
      // 检查的10个字段
      const checkFields = [
        'full_name', 'gender', 'birth_date', 'id_card', 'nationality',
        'political_status', 'phone', 'emergency_contact', 'emergency_phone', 'home_address'
      ];
      
      let completedFields = 0;
      console.log('  字段检查:');
      checkFields.forEach(field => {
        const value = profile[field];
        const isComplete = value && value !== '未知';
        if (isComplete) completedFields++;
        console.log(`    ${field}: ${isComplete ? '✅' : '❌'} (${value || '空'})`);
      });
      
      const completionRate = Math.round((completedFields / 10) * 100);
      console.log(`  完成度: ${completedFields}/10 = ${completionRate}%`);
      console.log(`  审核状态: ${profile.profile_status}`);
      
      // 检查isProfileComplete的逻辑
      const mandatoryFields = ['phone', 'emergency_contact', 'emergency_phone', 'home_address'];
      let mandatoryComplete = true;
      mandatoryFields.forEach(field => {
        if (!profile[field] || profile[field] === '未知') {
          mandatoryComplete = false;
          console.log(`    必填字段缺失: ${field}`);
        }
      });
      
      console.log(`  是否完整: ${mandatoryComplete && profile.profile_status === 'approved' ? '✅' : '❌'}`);
    });
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

checkProfile();