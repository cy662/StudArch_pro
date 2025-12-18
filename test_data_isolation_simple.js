// 简单的数据隔离测试脚本
const { GraduationDestinationService } = require('./src/services/graduationDestinationService');

async function testDataIsolation() {
  console.log('🔍 开始测试毕业去向数据隔离...\n');

  // 模拟两个不同的教师ID
  const teacher1Id = 'teacher-uuid-1';  // 替换为实际的教师UUID
  const teacher2Id = 'teacher-uuid-2';  // 替换为实际的教师UUID

  try {
    // 测试教师1的数据
    console.log('👨‍🏫 测试教师1的数据:');
    const teacher1Result = await GraduationDestinationService.getGraduationDestinations({
      teacher_id: teacher1Id,
      page: 1,
      limit: 10
    });
    
    console.log(`   - 找到 ${teacher1Result.destinations.length} 条记录`);
    console.log(`   - 总计 ${teacher1Result.total} 条记录`);
    
    if (teacher1Result.destinations.length > 0) {
      console.log('   - 示例记录:');
      teacher1Result.destinations.slice(0, 3).forEach((dest, index) => {
        console.log(`     ${index + 1}. 学生: ${dest.student?.full_name || '未知'}, 去向: ${dest.destination_type}`);
      });
    }

    console.log('\n👩‍🏫 测试教师2的数据:');
    const teacher2Result = await GraduationDestinationService.getGraduationDestinations({
      teacher_id: teacher2Id,
      page: 1,
      limit: 10
    });
    
    console.log(`   - 找到 ${teacher2Result.destinations.length} 条记录`);
    console.log(`   - 总计 ${teacher2Result.total} 条记录`);
    
    if (teacher2Result.destinations.length > 0) {
      console.log('   - 示例记录:');
      teacher2Result.destinations.slice(0, 3).forEach((dest, index) => {
        console.log(`     ${index + 1}. 学生: ${dest.student?.full_name || '未知'}, 去向: ${dest.destination_type}`);
      });
    }

    console.log('\n🔐 测试数据隔离边界:');
    // 检查是否有重叠的记录
    const teacher1StudentIds = new Set(teacher1Result.destinations.map(d => d.student_id));
    const teacher2StudentIds = new Set(teacher2Result.destinations.map(d => d.student_id));
    const overlap = [...teacher1StudentIds].filter(id => teacher2StudentIds.has(id));
    
    if (overlap.length > 0) {
      console.log(`⚠️  发现 ${overlap.length} 个重叠的学生ID，这可能表示数据隔离有问题:`);
      overlap.forEach(id => console.log(`   - 学生ID: ${id}`));
    } else {
      console.log('✅ 没有发现重叠数据，数据隔离工作正常');
    }

    console.log('\n🎯 测试无教师ID参数的情况:');
    const noTeacherResult = await GraduationDestinationService.getGraduationDestinations({
      page: 1,
      limit: 5
    });
    
    console.log(`   - 找到 ${noTeacherResult.destinations.length} 条记录（应该显示所有数据）`);

    console.log('\n✅ 数据隔离测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testDataIsolation();