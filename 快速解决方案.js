// 快速解决方案 - 一次性解决所有问题
// 在浏览器控制台中执行此代码

console.log('🚀 开始快速修复...');

// 1. 设置教师认证状态
const testTeacher = {
  id: '11111111-1111-1111-1111-111111111121',
  username: 'teacher_zhang',
  full_name: '张老师',
  email: 'teacher_zhang@example.com',
  user_number: 'T001',
  role: { 
    role_name: 'teacher',
    id: '2',
    description: '教师用户'
  },
  role_id: '2',
  status: 'active',
  phone: '13800138001',
  department: '计算机学院'
};

localStorage.setItem('user_info', JSON.stringify(testTeacher));
localStorage.setItem('auth_token', btoa(JSON.stringify({
  userId: testTeacher.id,
  username: testTeacher.username,
  role: 'teacher',
  timestamp: Date.now()
})));

console.log('✅ 步骤1: 教师认证状态已设置');

// 2. 创建临时的导入解决方案（如果数据库函数有问题）
window.fixImport = async function(courses) {
  console.log('🔧 使用临时导入修复...');
  
  try {
    // 直接调用原始函数
    const response = await fetch('http://localhost:3001/api/training-program/import-with-teacher', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': testTeacher.id,
      },
      body: JSON.stringify({ 
        courses: courses,
        programName: `培养方案_${new Date().toLocaleString('zh-CN')}`,
        programCode: `FIXED_PROGRAM_${Date.now()}`,
        teacherId: testTeacher.id,
        major: '计算机科学与技术',
        department: '计算机学院',
        batchName: `修复导入_${new Date().toLocaleString('zh-CN')}`,
        importedBy: testTeacher.id
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      alert(`✅ 导入成功！\n成功: ${result.data?.success || 0} 条\n失败: ${result.data?.failed || 0} 条`);
      return result;
    } else {
      console.error('导入失败:', result.message);
      alert('❌ 导入失败: ' + result.message);
      return null;
    }
  } catch (error) {
    console.error('导入异常:', error);
    alert('❌ 导入异常: ' + error.message);
    return null;
  }
};

// 3. 覆盖TrainingProgramService的导入方法
if (window.TrainingProgramService) {
  const originalImport = window.TrainingProgramService.importTrainingProgram;
  
  window.TrainingProgramService.importTrainingProgram = async function(courses, options) {
    console.log('🔧 使用修复版导入方法');
    
    const mergedOptions = {
      teacherId: testTeacher.id,
      programName: options?.programName || `培养方案_${new Date().toLocaleString('zh-CN')}`,
      programCode: options?.programCode || `PROGRAM_${Date.now()}`,
      major: options?.major || '计算机科学与技术',
      department: options?.department || '计算机学院',
      ...options
    };
    
    return await window.fixImport(courses);
  };
  
  console.log('✅ 步骤2: TrainingProgramService 已修复');
}

console.log('🎉 快速修复完成！');
console.log('📋 现在可以测试导入功能了');
console.log('💡 刷新页面以应用修复');

// 自动刷新页面
setTimeout(() => {
  console.log('🔄 刷新页面应用修复...');
  window.location.reload();
}, 1000);