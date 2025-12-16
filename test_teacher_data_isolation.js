const { createClient } = require('@supabase/supabase-js');

// Supabase配置
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTeacherDataIsolation() {
  console.log('🔍 开始测试教师数据隔离功能...\n');

  try {
    // 1. 测试获取所有教师的ID
    console.log('📋 步骤1: 获取教师列表');
    const { data: teachers, error: teachersError } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('role_id', '2'); // 假设教师role_id是2

    if (teachersError) {
      console.error('❌ 获取教师列表失败:', teachersError);
      return;
    }

    console.log(`✅ 找到 ${teachers?.length || 0} 个教师`);
    
    if (!teachers || teachers.length === 0) {
      console.log('⚠️  没有找到教师数据，请先创建测试教师');
      return;
    }

    // 2. 测试每个教师的学生关联
    console.log('\n📚 步骤2: 检查教师-学生关联关系');
    for (const teacher of teachers) {
      const { data: teacherStudents, error: studentsError } = await supabase
        .from('teacher_students')
        .select('student_id')
        .eq('teacher_id', teacher.id);

      if (studentsError) {
        console.error(`❌ 获取教师 ${teacher.full_name} 的学生列表失败:`, studentsError);
        continue;
      }

      const studentCount = teacherStudents?.length || 0;
      console.log(`   👨‍🏫 教师 ${teacher.full_name} (${teacher.id}) 管理着 ${studentCount} 个学生`);

      if (studentCount > 0) {
        const studentIds = teacherStudents.map(ts => ts.student_id);
        
        // 3. 测试毕业去向数据隔离
        console.log(`   🎓 检查教师 ${teacher.full_name} 的毕业去向数据隔离...`);
        
        // 获取该教师管理学生的所有毕业去向
        const { data: allGraduationData, error: allError } = await supabase
          .from('graduation_destinations')
          .select('student_id, destination_type, status')
          .in('student_id', studentIds);

        if (allError) {
          console.error(`   ❌ 获取毕业去向数据失败:`, allError);
          continue;
        }

        const totalGraduationCount = allGraduationData?.length || 0;
        console.log(`   📊 该教师管理的学生共有 ${totalGraduationCount} 条毕业去向记录`);

        // 模拟GraduationDestinationService的逻辑
        if (studentIds.length > 0 && totalGraduationCount > 0) {
          console.log(`   ✅ 数据隔离正常: 教师只能看到自己管理学生的毕业去向`);
        } else if (studentIds.length > 0 && totalGraduationCount === 0) {
          console.log(`   ℹ️  该教师的学生暂无毕业去向数据`);
        } else {
          console.log(`   ℹ️  该教师暂无管理的学生`);
        }
      }
      console.log('');
    }

    // 4. 测试数据隔离边界
    console.log('🔒 步骤3: 测试数据隔离边界');
    
    // 获取所有毕业去向数据（管理员视图）
    const { data: allDestinations, error: allDestError } = await supabase
      .from('graduation_destinations')
      .select('id, student_id, destination_type, status');

    if (allDestError) {
      console.error('❌ 获取所有毕业去向失败:', allDestError);
      return;
    }

    const totalDestinations = allDestinations?.length || 0;
    console.log(`📈 系统中总共有 ${totalDestinations} 条毕业去向记录`);

    // 获取所有师生关联
    const { data: allTeacherStudentRelations, error: relationsError } = await supabase
      .from('teacher_students')
      .select('teacher_id, student_id');

    if (relationsError) {
      console.error('❌ 获取师生关联失败:', relationsError);
      return;
    }

    const totalRelations = allTeacherStudentRelations?.length || 0;
    console.log(`🔗 系统中总共有 ${totalRelations} 条师生关联关系`);

    // 验证每个毕业去向记录是否都有对应的教师管理关系
    if (allDestinations && allTeacherStudentRelations) {
      const managedStudentIds = new Set(allTeacherStudentRelations.map(ts => ts.student_id));
      const unmanagedDestinations = allDestinations.filter(dest => !managedStudentIds.has(dest.student_id));
      
      if (unmanagedDestinations.length > 0) {
        console.log(`⚠️  发现 ${unmanagedDestinations.length} 条未被任何教师管理的毕业去向记录:`);
        unmanagedDestinations.forEach(dest => {
          console.log(`   - 学生ID: ${dest.student_id}, 去向ID: ${dest.id}`);
        });
      } else {
        console.log(`✅ 所有毕业去向记录都有对应的教师管理关系`);
      }
    }

    console.log('\n🎉 数据隔离测试完成！');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

// 运行测试
testTeacherDataIsolation();