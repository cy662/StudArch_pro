// 检查培养方案表数据
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const checkTrainingPrograms = async () => {
  console.log('🔍 检查培养方案表数据...\n');

  try {
    // 1. 查看所有培养方案
    console.log('📋 1. 查看所有培养方案:');
    const { data: programs, error: programsError } = await supabase
      .from('training_programs')
      .select('*');
    
    if (programsError) {
      console.error('❌ 获取培养方案失败:', programsError.message);
      return;
    }
    
    console.log(`找到 ${programs?.length || 0} 个培养方案:`);
    programs?.forEach((program, index) => {
      console.log(`${index + 1}. ID: ${program.id}`);
      console.log(`   名称: ${program.name || 'N/A'}`);
      console.log(`   代码: ${program.program_code || 'N/A'}`);
      console.log(`   描述: ${program.description || 'N/A'}`);
      console.log(`   创建时间: ${program.created_at}`);
    });

    // 2. 检查特定的培养方案ID
    const targetProgramId = '00000000-0000-0000-0000-000000000001';
    console.log(`\n📋 2. 检查特定的培养方案ID: ${targetProgramId}`);
    
    const { data: targetProgram, error: targetError } = await supabase
      .from('training_programs')
      .select('*')
      .eq('id', targetProgramId);
    
    if (targetError) {
      console.error('❌ 检查特定培养方案失败:', targetError.message);
    } else if (targetProgram && targetProgram.length > 0) {
      console.log('✅ 找到目标培养方案:');
      console.log(`- ID: ${targetProgram[0].id}`);
      console.log(`- 名称: ${targetProgram[0].name || 'N/A'}`);
      console.log(`- 代码: ${targetProgram[0].program_code || 'N/A'}`);
    } else {
      console.log('❌ 目标培养方案不存在，需要创建');
      
      // 创建默认培养方案
      const { data: newProgram, error: createError } = await supabase
        .from('training_programs')
        .insert({
          id: targetProgramId,
          name: '计算机科学与技术培养方案',
          program_code: 'CS_2024',
          description: '计算机科学与技术专业2024版培养方案',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ 创建培养方案失败:', createError.message);
      } else {
        console.log('✅ 成功创建默认培养方案:');
        console.log(`- ID: ${newProgram.id}`);
        console.log(`- 名称: ${newProgram.name}`);
      }
    }

    // 3. 检查培养方案课程表
    console.log('\n📋 3. 检查培养方案课程表:');
    const { data: programCourses, error: coursesError } = await supabase
      .from('training_program_courses')
      .select('*')
      .eq('program_id', targetProgramId);
    
    if (coursesError) {
      console.error('❌ 获取培养方案课程失败:', coursesError.message);
    } else {
      console.log(`找到 ${programCourses?.length || 0} 门课程:`);
      programCourses?.forEach((course, index) => {
        console.log(`${index + 1}. ${course.course_number} - ${course.course_name} (${course.credits}学分)`);
      });
      
      if (!programCourses || programCourses.length === 0) {
        console.log('❌ 培养方案中没有课程，正在添加...');
        
        // 添加默认课程
        const defaultCourses = [
          {
            program_id: targetProgramId,
            course_number: 'CS101',
            course_name: '计算机基础',
            credits: 3,
            recommended_grade: '大一',
            semester: '第一学期',
            exam_method: '笔试',
            course_type: '必修课',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            program_id: targetProgramId,
            course_number: 'CS102',
            course_name: '程序设计基础',
            credits: 4,
            recommended_grade: '大一',
            semester: '第一学期',
            exam_method: '上机考试',
            course_type: '必修课',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            program_id: targetProgramId,
            course_number: 'MATH101',
            course_name: '高等数学',
            credits: 4,
            recommended_grade: '大一',
            semester: '第一学期',
            exam_method: '笔试',
            course_type: '必修课',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        
        const { data: insertedCourses, error: insertError } = await supabase
          .from('training_program_courses')
          .insert(defaultCourses)
          .select();
        
        if (insertError) {
          console.error('❌ 添加课程失败:', insertError.message);
        } else {
          console.log(`✅ 成功添加 ${insertedCourses?.length || 0} 门课程`);
        }
      }
    }

  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error);
  }
};

checkTrainingPrograms();