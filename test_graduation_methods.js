// 测试毕业去向服务方法
const { GraduationDestinationService } = require('./src/services/graduationDestinationService');

async function testGraduationMethods() {
  console.log('🧪 测试毕业去向服务方法...\n');

  try {
    // 测试1: 检查方法是否存在
    console.log('📋 测试1: 检查服务方法');
    console.log('   - getGraduationDestinations:', typeof GraduationDestinationService.getGraduationDestinations);
    console.log('   - getGraduationDestinationByStudentId:', typeof GraduationDestinationService.getGraduationDestinationByStudentId);
    console.log('   - saveGraduationDestination:', typeof GraduationDestinationService.saveGraduationDestination);
    console.log('   - reviewGraduationDestination:', typeof GraduationDestinationService.reviewGraduationDestination);
    
    // 测试2: 测试保存方法（模拟数据）
    console.log('\n💾 测试2: 测试保存毕业去向');
    const saveResult = await GraduationDestinationService.saveGraduationDestination({
      student_id: 'test-student-id',
      destination_type: 'employment',
      company_name: '测试公司',
      position: '测试职位',
      salary: '8000',
      work_location: '北京',
      proof_files: ['test.pdf']
    });
    
    console.log('   保存结果:', saveResult);
    
    // 测试3: 测试获取方法
    if (saveResult.success && saveResult.data) {
      console.log('\n🔍 测试3: 测试获取毕业去向');
      const getResult = await GraduationDestinationService.getGraduationDestinationByStudentId('test-student-id');
      console.log('   获取结果:', getResult);
    }
    
    console.log('\n✅ 所有方法测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testGraduationMethods();