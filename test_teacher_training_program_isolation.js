// 测试教师培养方案隔离功能
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// 配置Supabase客户端
const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🎓 开始测试教师培养方案隔离功能...\n');

// 测试数据
const testTeacher1Id = 'teacher-001-uuid';
const testTeacher2Id = 'teacher-002-uuid';
const testStudent1Id = 'student-001-uuid';
const testStudent2Id = 'student-002-uuid';

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

async function testDatabaseSchema() {
  console.log('📋 步骤1: 验证数据库表结构...');
  
  try {
    // 检查training_programs表是否有teacher_id字段
    const { data: columns, error: error1 } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'training_programs')
      .eq('column_name', 'teacher_id');
    
    if (error1) {
      console.log('❌ 检查teacher_id字段失败:', error1.message);
      return false;
    }
    
    if (!columns || columns.length === 0) {
      console.log('❌ training_programs表缺少teacher_id字段');
      return false;
    }
    
    console.log('✅ training_programs表包含teacher_id字段');
    
    // 检查training_program_import_batches表是否有teacher_id字段
    const { data: columns2, error: error2 } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'training_program_import_batches')
      .eq('column_name', 'teacher_id');
    
    if (error2) {
      console.log('❌ 检查import_batches表teacher_id字段失败:', error2.message);
      return false;
    }
    
    if (!columns2 || columns2.length === 0) {
      console.log('❌ training_program_import_batches表缺少teacher_id字段');
      return false;
    }
    
    console.log('✅ training_program_import_batches表包含teacher_id字段');
    console.log('✅ 数据库表结构验证通过\n');
    return true;
    
  } catch (error) {
    console.log('❌ 数据库结构验证异常:', error.message);
    return false;
  }
}

async function testTeacherProgramImport() {
  console.log('📥 步骤2: 测试教师隔离的培养方案导入...');
  
  try {
    // 教师1导入培养方案
    console.log('教师1导入培养方案...');
    const { data: result1, error: error1 } = await supabase.rpc('import_training_program_courses_with_teacher', {
      p_courses: testCourses,
      p_program_code: 'TEACHER1_CS',
      p_program_name: '教师1的计算机培养方案',
      p_teacher_id: testTeacher1Id,
      p_major: '计算机科学与技术',
      p_department: '计算机学院',
      p_batch_name: '教师1导入测试'
    });
    
    if (error1) {
      console.log('❌ 教师1导入失败:', error1.message);
      return false;
    }
    
    console.log('✅ 教师1导入成功:', result1);
    const teacher1ProgramId = result1.program_id;
    
    // 教师2导入培养方案
    console.log('教师2导入培养方案...');
    const { data: result2, error: error2 } = await supabase.rpc('import_training_program_courses_with_teacher', {
      p_courses: testCourses,
      p_program_code: 'TEACHER2_CS',
      p_program_name: '教师2的计算机培养方案',
      p_teacher_id: testTeacher2Id,
      p_major: '软件工程',
      p_department: '软件学院',
      p_batch_name: '教师2导入测试'
    });
    
    if (error2) {
      console.log('❌ 教师2导入失败:', error2.message);
      return false;
    }
    
    console.log('✅ 教师2导入成功:', result2);
    const teacher2ProgramId = result2.program_id;
    
    return { teacher1ProgramId, teacher2ProgramId };
    
  } catch (error) {
    console.log('❌ 导入测试异常:', error.message);
    return false;
  }
}

async function testTeacherProgramIsolation() {
  console.log('\n🔒 步骤3: 测试教师数据隔离...');
  
  try {
    // 获取教师1的培养方案
    const { data: programs1, error: error1 } = await supabase.rpc('get_teacher_training_programs', {
      p_teacher_id: testTeacher1Id
    });
    
    if (error1) {
      console.log('❌ 获取教师1培养方案失败:', error1.message);
      return false;
    }
    
    console.log('✅ 教师1的培养方案数量:', programs1?.programs?.length || 0);
    
    // 获取教师2的培养方案
    const { data: programs2, error: error2 } = await supabase.rpc('get_teacher_training_programs', {
      p_teacher_id: testTeacher2Id
    });
    
    if (error2) {
      console.log('❌ 获取教师2培养方案失败:', error2.message);
      return false;
    }
    
    console.log('✅ 教师2的培养方案数量:', programs2?.programs?.length || 0);
    
    // 验证隔离：教师1看不到教师2的培养方案
    const teacher1ProgramNames = programs1?.programs?.map(p => p.program_name) || [];
    const teacher2ProgramNames = programs2?.programs?.map(p => p.program_name) || [];
    
    if (teacher1ProgramNames.includes('教师2的计算机培养方案')) {
      console.log('❌ 数据隔离失败：教师1看到了教师2的培养方案');
      return false;
    }
    
    if (teacher2ProgramNames.includes('教师1的计算机培养方案')) {
      console.log('❌ 数据隔离失败：教师2看到了教师1的培养方案');
      return false;
    }
    
    console.log('✅ 数据隔离验证通过');
    return true;
    
  } catch (error) {
    console.log('❌ 数据隔离测试异常:', error.message);
    return false;
  }
}

async function testTeacherProgramAssignment() {
  console.log('\n📚 步骤4: 测试教师培养方案分配...');
  
  try {
    // 首先获取教师1的培养方案
    const { data: programs1, error: error1 } = await supabase.rpc('get_teacher_available_programs', {
      p_teacher_id: testTeacher1Id
    });
    
    if (error1 || !programs1 || programs1.length === 0) {
      console.log('❌ 获取教师1可用培养方案失败:', error1?.message || '无可用方案');
      return false;
    }
    
    const teacher1ProgramId = programs1[0].id;
    console.log('✅ 获取到教师1的培养方案:', teacher1ProgramId);
    
    // 教师1给学生分配培养方案
    const { data: assignResult, error: assignError } = await supabase.rpc('assign_teacher_training_program_to_students', {
      p_teacher_id: testTeacher1Id,
      p_program_id: teacher1ProgramId,
      p_student_ids: [testStudent1Id, testStudent2Id],
      p_notes: '测试分配'
    });
    
    if (assignError) {
      console.log('❌ 教师1分配培养方案失败:', assignError.message);
      return false;
    }
    
    console.log('✅ 教师1分配成功:', assignResult);
    
    // 测试权限：教师2不能分配教师1的培养方案
    const { data: assignResult2, error: assignError2 } = await supabase.rpc('assign_teacher_training_program_to_students', {
      p_teacher_id: testTeacher2Id,
      p_program_id: teacher1ProgramId,
      p_student_ids: [testStudent1Id],
      p_notes: '测试权限'
    });
    
    if (assignError2) {
      console.log('✅ 权限控制正常：教师2无法分配教师1的培养方案');
    } else {
      console.log('❌ 权限控制失败：教师2成功分配了教师1的培养方案');
      return false;
    }
    
    console.log('✅ 培养方案分配测试通过');
    return true;
    
  } catch (error) {
    console.log('❌ 分配测试异常:', error.message);
    return false;
  }
}

async function testImportHistory() {
  console.log('\n📖 步骤5: 测试导入历史隔离...');
  
  try {
    // 获取教师1的导入历史
    const { data: history1, error: error1 } = await supabase.rpc('get_teacher_import_history', {
      p_teacher_id: testTeacher1Id
    });
    
    if (error1) {
      console.log('❌ 获取教师1导入历史失败:', error1.message);
      return false;
    }
    
    console.log('✅ 教师1导入历史数量:', history1?.length || 0);
    
    // 获取教师2的导入历史
    const { data: history2, error: error2 } = await supabase.rpc('get_teacher_import_history', {
      p_teacher_id: testTeacher2Id
    });
    
    if (error2) {
      console.log('❌ 获取教师2导入历史失败:', error2.message);
      return false;
    }
    
    console.log('✅ 教师2导入历史数量:', history2?.length || 0);
    
    // 验证历史记录隔离
    const teacher1BatchNames = history1?.map(h => h.batch_name) || [];
    const teacher2BatchNames = history2?.map(h => h.batch_name) || [];
    
    if (teacher1BatchNames.includes('教师2导入测试')) {
      console.log('❌ 导入历史隔离失败：教师1看到了教师2的导入记录');
      return false;
    }
    
    if (teacher2BatchNames.includes('教师1导入测试')) {
      console.log('❌ 导入历史隔离失败：教师2看到了教师1的导入记录');
      return false;
    }
    
    console.log('✅ 导入历史隔离验证通过');
    return true;
    
  } catch (error) {
    console.log('❌ 导入历史测试异常:', error.message);
    return false;
  }
}

async function cleanupTestData() {
  console.log('\n🧹 清理测试数据...');
  
  try {
    // 清理教师1的培养方案
    const { error: error1 } = await supabase
      .from('training_programs')
      .delete()
      .eq('teacher_id', testTeacher1Id);
    
    if (error1) {
      console.log('⚠️ 清理教师1数据失败:', error1.message);
    } else {
      console.log('✅ 清理教师1数据成功');
    }
    
    // 清理教师2的培养方案
    const { error: error2 } = await supabase
      .from('training_programs')
      .delete()
      .eq('teacher_id', testTeacher2Id);
    
    if (error2) {
      console.log('⚠️ 清理教师2数据失败:', error2.message);
    } else {
      console.log('✅ 清理教师2数据成功');
    }
    
  } catch (error) {
    console.log('⚠️ 清理数据异常:', error.message);
  }
}

async function runTests() {
  const results = [];
  
  // 运行所有测试
  results.push(await testDatabaseSchema());
  
  const importResult = await testTeacherProgramImport();
  results.push(!!importResult);
  
  if (importResult) {
    results.push(await testTeacherProgramIsolation());
    results.push(await testTeacherProgramAssignment());
    results.push(await testImportHistory());
  } else {
    results.push(false);
    results.push(false);
    results.push(false);
  }
  
  // 清理测试数据
  await cleanupTestData();
  
  // 总结测试结果
  console.log('\n📊 测试结果总结:');
  console.log('='.repeat(50));
  
  const testNames = [
    '数据库表结构',
    '培养方案导入',
    '数据隔离',
    '培养方案分配',
    '导入历史隔离'
  ];
  
  const successCount = results.filter(r => r === true).length;
  const totalCount = results.length;
  
  results.forEach((result, index) => {
    const status = result ? '✅ 通过' : '❌ 失败';
    const testName = testNames[index];
    console.log(`${status} ${testName}`);
  });
  
  console.log('='.repeat(50));
  console.log(`总计: ${successCount}/${totalCount} 项测试通过`);
  
  if (successCount === totalCount) {
    console.log('🎉 所有测试通过！教师培养方案隔离功能工作正常。');
    process.exit(0);
  } else {
    console.log('⚠️ 部分测试失败，请检查相关功能实现。');
    process.exit(1);
  }
}

// 运行测试
runTests().catch(error => {
  console.error('❌ 测试运行失败:', error);
  process.exit(1);
});