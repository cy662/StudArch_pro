const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function fixForeignKeyIssue() {
  console.log('=== 修复外键约束问题 ===');
  
  try {
    // 1. 检查培养方案是否存在
    console.log('\n1. 检查培养方案...');
    const { data: programs, error: programError } = await supabase
      .from('training_programs')
      .select('*');
      
    if (programError) {
      console.error('查询培养方案失败:', programError);
      return;
    }
    
    console.log('找到培养方案:', programs.length, '个');
    programs.forEach((program, index) => {
      console.log(`${index + 1}. ID: ${program.id}, 名称: ${program.program_name}`);
    });
    
    if (programs.length === 0) {
      console.log('❌ 没有培养方案，无法添加课程');
      return;
    }
    
    // 2. 检查培养方案课程是否存在
    console.log('\n2. 检查培养方案课程...');
    const { data: courses, error: courseError } = await supabase
      .from('training_program_courses')
      .select('*')
      .limit(5);
      
    if (courseError) {
      console.error('查询课程失败:', courseError);
    } else {
      console.log('现有课程数量:', courses.length);
    }
    
    // 3. 添加基础课程（如果不存在）
    console.log('\n3. 添加基础课程...');
    const basicCourses = [
      {
        course_number: 'CS101',
        course_name: '计算机基础',
        credits: 3,
        recommended_grade: '大一',
        semester: '第一学期',
        exam_method: '笔试',
        course_nature: '必修课',
        program_id: programs[0].id
      },
      {
        course_number: 'CS102',
        course_name: '程序设计基础',
        credits: 4,
        recommended_grade: '大一',
        semester: '第一学期',
        exam_method: '上机考试',
        course_nature: '必修课',
        program_id: programs[0].id
      },
      {
        course_number: 'MATH101',
        course_name: '高等数学',
        credits: 4,
        recommended_grade: '大一',
        semester: '第一学期',
        exam_method: '笔试',
        course_nature: '必修课',
        program_id: programs[0].id
      }
    ];
    
    for (const course of basicCourses) {
      // 检查课程是否已存在
      const { data: existing, error: checkError } = await supabase
        .from('training_program_courses')
        .select('*')
        .eq('course_number', course.course_number)
        .eq('program_id', course.program_id);
        
      if (checkError) {
        console.error('检查课程失败:', checkError);
        continue;
      }
      
      if (!existing || existing.length === 0) {
        console.log(`添加课程: ${course.course_name}`);
        const { data: insertData, error: insertError } = await supabase
          .from('training_program_courses')
          .insert({
            ...course,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select();
          
        if (insertError) {
          console.error(`❌ 添加课程失败: ${course.course_name}`, insertError);
        } else {
          console.log(`✅ 成功添加: ${course.course_name}`, insertData[0].id);
        }
      } else {
        console.log(`⚠️ 课程已存在: ${course.course_name}`);
      }
    }
    
    // 4. 验证结果
    console.log('\n4. 验证添加结果...');
    const { data: finalCourses, error: finalError } = await supabase
      .from('training_program_courses')
      .select('*');
      
    if (finalError) {
      console.error('验证失败:', finalError);
    } else {
      console.log('✅ 总课程数量:', finalCourses.length);
    }
    
  } catch (error) {
    console.error('修复过程中出错:', error);
  }
}

fixForeignKeyIssue().catch(console.error);