// 使用正确的培养方案ID为陈瑶分配培养方案
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const assignChenyaoCorrect = async () => {
  console.log('🔧 使用正确的培养方案ID为陈瑶分配培养方案...\n');

  try {
    // 1. 获取正确的培养方案ID
    console.log('📋 1. 获取现有培养方案:');
    const { data: programs, error: programsError } = await supabase
      .from('training_programs')
      .select('*');
    
    if (programsError) {
      console.error('❌ 获取培养方案失败:', programsError.message);
      return;
    }
    
    if (!programs || programs.length === 0) {
      console.error('❌ 没有找到任何培养方案');
      return;
    }
    
    const correctProgramId = programs[0].id;
    console.log(`✅ 找到培养方案: ${correctProgramId}`);
    console.log(`- 代码: ${programs[0].program_code || 'N/A'}`);

    // 2. 检查培养方案是否有课程
    console.log('\n📋 2. 检查培养方案课程:');
    const { data: courses, error: coursesError } = await supabase
      .from('training_program_courses')
      .select('*')
      .eq('program_id', correctProgramId);
    
    if (coursesError) {
      console.error('❌ 获取课程失败:', coursesError.message);
      return;
    }
    
    if (!courses || courses.length === 0) {
      console.log('❌ 培养方案中没有课程，需要先添加课程');
      // 添加默认课程
      const defaultCourses = [
        {
          program_id: correctProgramId,
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
          program_id: correctProgramId,
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
          program_id: correctProgramId,
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
        return;
      }
      
      console.log(`✅ 成功添加 ${insertedCourses?.length || 0} 门课程`);
    } else {
      console.log(`✅ 培养方案中已有 ${courses.length} 门课程`);
      courses.forEach((course, index) => {
        console.log(`${index + 1}. ${course.course_number} - ${course.course_name}`);
      });
    }

    // 3. 获取陈瑶的用户和档案信息
    console.log('\n📋 3. 获取陈瑶的信息:');
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('username', '2023011')
      .single();
    
    if (!user) {
      console.error('❌ 未找到用户2023011');
      return;
    }
    
    const { data: profile } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (!profile) {
      console.error('❌ 未找到学生档案');
      return;
    }
    
    console.log(`✅ 用户ID: ${user.id}`);
    console.log(`✅ 档案ID: ${profile.id}`);

    // 4. 分配培养方案
    console.log('\n📋 4. 为陈瑶分配培养方案:');
    const { data: existingAssignment } = await supabase
      .from('student_training_programs')
      .select('*')
      .eq('student_id', profile.id)
      .eq('program_id', correctProgramId);
    
    if (existingAssignment && existingAssignment.length > 0) {
      console.log('✅ 陈瑶已经有培养方案分配，更新状态');
      const { data: updateResult, error: updateError } = await supabase
        .from('student_training_programs')
        .update({
          status: 'active',
          enrollment_date: new Date().toISOString().split('T')[0],
          notes: '重新激活培养方案分配',
          updated_at: new Date().toISOString()
        })
        .eq('student_id', profile.id)
        .eq('program_id', correctProgramId)
        .select();
      
      if (updateError) {
        console.error('❌ 更新分配失败:', updateError.message);
        return;
      }
      
      console.log('✅ 成功更新培养方案分配');
    } else {
      console.log('🆕 创建新的培养方案分配');
      const { data: insertResult, error: insertError } = await supabase
        .from('student_training_programs')
        .insert({
          student_id: profile.id,
          program_id: correctProgramId,
          enrollment_date: new Date().toISOString().split('T')[0],
          status: 'active',
          notes: '为陈瑶分配培养方案',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (insertError) {
        console.error('❌ 分配培养方案失败:', insertError.message);
        return;
      }
      
      console.log('✅ 成功创建培养方案分配');
    }

    // 5. 测试API
    console.log('\n📋 5. 测试学生端API:');
    const apiResponse = await fetch(`http://localhost:3001/api/student/${user.id}/training-program-courses`);
    const apiResult = await apiResponse.json();
    
    console.log(`API状态: ${apiResponse.status}`);
    console.log(`课程数量: ${apiResult.data?.length || 0}`);
    
    if (apiResult.success && apiResult.data) {
      console.log('\n📚 陈瑶的课程列表:');
      apiResult.data.forEach((course, index) => {
        console.log(`${index + 1}. ${course.course_number} - ${course.course_name} (${course.credits}学分)`);
      });
    }

    console.log('\n🎉 陈瑶(2023011)培养方案分配完成！');
    console.log('现在陈瑶登录系统应该能看到课程了。');

  } catch (error) {
    console.error('❌ 处理过程中发生错误:', error);
  }
};

assignChenyaoCorrect();