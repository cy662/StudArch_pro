// 调试学生学习数据，检查实际的字段结构

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mddpbyibesqewcktlqle.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZHBieWliZXNxZXdja3RscWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNTQzNDksImV4cCI6MjA3ODkzMDM0OX0.T8QHCT3UK5f2mp76Oe9-AZpdrmPOFy1wVutxfmg49EU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugStudentData() {
  try {
    console.log('🔍 调试学生学习数据结构...\n');

    // 1. 检查学生档案
    const { data: profiles } = await supabase
      .from('student_profiles')
      .select('id, full_name, class_name')
      .limit(5);
    
    console.log('📋 学生档案示例:');
    console.log(JSON.stringify(profiles, null, 2));
    
    if (profiles && profiles.length > 0) {
      const studentId = profiles[0].id;
      
      // 2. 检查该学生的学习收获
      const { data: achievements } = await supabase
        .from('student_learning_achievements')
        .select('*')
        .eq('student_profile_id', studentId)
        .eq('status', 'active');
      
      console.log('\n💡 学习收获数据结构:');
      if (achievements && achievements.length > 0) {
        console.log('示例记录:', JSON.stringify(achievements[0], null, 2));
        console.log('所有收获的related_course字段:');
        achievements.forEach((a, i) => {
          console.log(`  ${i + 1}. "${a.related_course}" -> "${a.title}"`);
        });
      } else {
        console.log('  暂无学习收获数据');
      }
      
      // 3. 检查该学生的学习成果
      const { data: outcomes } = await supabase
        .from('student_learning_outcomes')
        .select('*')
        .eq('student_profile_id', studentId)
        .eq('status', 'active');
      
      console.log('\n🏆 学习成果数据结构:');
      if (outcomes && outcomes.length > 0) {
        console.log('示例记录:', JSON.stringify(outcomes[0], null, 2));
        console.log('所有成果的related_course字段:');
        outcomes.forEach((o, i) => {
          console.log(`  ${i + 1}. "${o.related_course}" -> "${o.outcome_title}"`);
        });
      } else {
        console.log('  暂无学习成果数据');
      }
      
      // 4. 检查该学生的技术标签
      const { data: tags } = await supabase
        .from('student_technical_tags')
        .select('*')
        .eq('student_profile_id', studentId)
        .eq('status', 'active');
      
      console.log('\n🏷️ 技术标签数据结构:');
      if (tags && tags.length > 0) {
        console.log('示例记录:', JSON.stringify(tags[0], null, 2));
        console.log('所有标签信息:');
        tags.forEach((t, i) => {
          console.log(`  ${i + 1}. "${t.tag_name}" (描述: "${t.description}")`);
        });
      } else {
        console.log('  暂无技术标签数据');
      }
      
      // 5. 检查培养方案课程数据
      const { data: courses } = await supabase
        .from('student_training_programs')
        .select(`
          *,
          training_program:training_program_id (
            courses:training_program_courses (
              *
            )
          )
        `)
        .eq('student_profile_id', studentId)
        .eq('status', 'active');
      
      console.log('\n📚 培养方案课程数据结构:');
      if (courses && courses.length > 0) {
        console.log('示例记录:', JSON.stringify(courses[0], null, 2));
        if (courses[0].training_program?.courses) {
          console.log('课程列表:');
          courses[0].training_program.courses.forEach((c, i) => {
            console.log(`  ${i + 1}. "${c.course_name}" (ID: ${c.id})`);
          });
        }
      } else {
        console.log('  暂无培养方案数据');
      }
      
    }
    
  } catch (error) {
    console.error('❌ 调试失败:', error.message);
  }
}

debugStudentData();