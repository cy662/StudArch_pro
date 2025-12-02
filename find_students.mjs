import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://mddpbyibesqewcktlqle.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZHBieWliZXNxZXdja3RscWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNTQzNDksImV4cCI6MjA3ODkzMDM0OX0.T8QHCT3UK5f2mp76Oe9-AZpdrmPOFy1wVutxfmg49EU');

async function findExistingStudents() {
  console.log('🔍 查找现有学生档案...');
  
  try {
    const { data, error } = await supabase
      .from('student_profiles')
      .select('id, student_number, full_name')
      .limit(5);
      
    if (error) {
      console.log('❌ 查询失败:', error.message);
    } else {
      console.log('✅ 现有学生档案:');
      data.forEach(student => {
        console.log(`  ID: ${student.id}, 学号: ${student.student_number}, 姓名: ${student.full_name}`);
      });
    }
  } catch (e) {
    console.log('❌ 操作失败:', e.message);
  }
}

findExistingStudents();