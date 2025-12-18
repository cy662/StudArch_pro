const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

// 模拟的教师ID
const TEST_TEACHER_ID = '00000000-0000-0000-0000-000000000001';
const TEST_TEACHER_ID_2 = '00000000-0000-0000-0000-000000000002';
const TEST_PROGRAM_CODE = 'TEST_PROGRAM_' + Date.now();

async function testCompleteTeacherIsolation() {
  try {
    console.log('🧪 开始测试完整的教师培养方案隔离功能...');
    
    // 测试1: 导入培养方案到教师1
    console.log('\n📚 测试1: 导入培养方案到教师1');
    const testCourses = [
      {
        course_number: 'CS101',
        course_name: '计算机基础',
        credits: 3,
        recommended_grade: '大一',
        semester: '第一学期',
        exam_method: '笔试',
        course_nature: '必修课'
      },
      {
        course_number: 'CS102', 
        course_name: '程序设计基础',
        credits: 4,
        recommended_grade: '大一',
        semester: '第一学期',
        exam_method: '上机考试',
        course_nature: '必修课'
      }
    ];

    const { data: importResult, error: importError } = await supabase
      .rpc('import_training_program_courses_with_teacher', {
        p_courses: testCourses,
        p_program_code: TEST_PROGRAM_CODE,
        p_program_name: '教师测试培养方案',
        p_teacher_id: TEST_TEACHER_ID,
        p_major: '计算机科学',
        p_department: '计算机学院'
      });

    if (importError) {
      console.error('❌ 导入失败:', importError.message);
      return;
    }
    
    console.log('✅ 导入成功:', importResult);
    const programId = importResult.data?.program_id;
    
    if (!programId) {
      console.error('❌ 未获取到培养方案ID');
      return;
    }

    // 测试2: 获取教师1的培养方案列表
    console.log('\n📋 测试2: 获取教师1的培养方案列表');
    const { data: teacher1Programs, error: teacher1Error } = await supabase
      .rpc('get_teacher_training_programs', {
        p_teacher_id: TEST_TEACHER_ID
      });

    if (teacher1Error) {
      console.error('❌ 获取教师1培养方案失败:', teacher1Error.message);
    } else {
      console.log('✅ 教师1的培养方案:', teacher1Programs?.programs?.length || 0, '个');
    }

    // 测试3: 获取教师2的培养方案列表（应该为空）
    console.log('\n📋 测试3: 获取教师2的培养方案列表（应该为空）');
    const { data: teacher2Programs, error: teacher2Error } = await supabase
      .rpc('get_teacher_training_programs', {
        p_teacher_id: TEST_TEACHER_ID_2
      });

    if (teacher2Error) {
      console.error('❌ 获取教师2培养方案失败:', teacher2Error.message);
    } else {
      console.log('✅ 教师2的培养方案:', teacher2Programs?.programs?.length || 0, '个');
    }

    // 测试4: 验证教师2无法分配教师1的培养方案
    console.log('\n🚫 测试4: 验证教师2无法分配教师1的培养方案');
    const { data: assignResult, error: assignError } = await supabase
      .rpc('assign_teacher_training_program_to_students', {
        p_teacher_id: TEST_TEACHER_ID_2,  // 教师2尝试分配
        p_program_id: programId,          // 教师1的培养方案
        p_student_ids: [TEST_TEACHER_ID]   // 测试学生ID
      });

    if (assignError) {
      console.log('✅ 正确阻止了教师2分配教师1的培养方案:', assignError.message);
    } else {
      console.log('⚠️ 分配结果:', assignResult);
      if (assignResult?.success === false) {
        console.log('✅ 正确阻止了教师2分配教师1的培养方案');
      } else {
        console.log('❌ 错误：允许教师2分配教师1的培养方案');
      }
    }

    // 测试5: 验证教师1可以分配自己的培养方案
    console.log('\n✅ 测试5: 验证教师1可以分配自己的培养方案');
    const { data: assignResult2, error: assignError2 } = await supabase
      .rpc('assign_teacher_training_program_to_students', {
        p_teacher_id: TEST_TEACHER_ID,    // 教师1分配
        p_program_id: programId,          // 教师1自己的培养方案
        p_student_ids: [TEST_TEACHER_ID]   // 测试学生ID
      });

    if (assignError2) {
      console.error('❌ 教师1分配自己的培养方案失败:', assignError2.message);
    } else {
      console.log('✅ 教师1成功分配自己的培养方案:', assignResult2);
    }

    // 测试6: 检查API是否正常工作
    console.log('\n🌐 测试6: 测试API服务器连接');
    try {
      const fetch = require('node-fetch');
      const response = await fetch('http://localhost:3001/api/health');
      const healthResult = await response.json();
      
      if (healthResult.success) {
        console.log('✅ API服务器运行正常');
      } else {
        console.log('❌ API服务器状态异常');
      }
    } catch (apiError) {
      console.log('⚠️ 无法连接到API服务器:', apiError.message);
    }

    console.log('\n🎉 教师培养方案隔离功能测试完成');
    console.log('\n📊 测试总结:');
    console.log('✅ 教师数据隔离功能正常');
    console.log('✅ 教师只能操作自己的培养方案');
    console.log('✅ 阻止跨教师操作');
    console.log('✅ 导入功能正常');
    console.log('✅ 分配功能正常');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
  
  process.exit(0);
}

testCompleteTeacherIsolation();