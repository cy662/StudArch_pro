/**
 * 直接测试个人资料字段功能
 * 用于调试数据显示问题
 */

import { supabase } from '../lib/supabase';

/**
 * 测试个人资料字段是否能正确保存和读取
 */
export async function testProfileFields(userId: string) {
  console.log('=== 开始测试个人资料字段 ===');
  
  // 1. 获取当前个人资料
  const { data: currentProfile, error: fetchError } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (fetchError) {
    console.error('获取当前个人资料失败:', fetchError);
    return false;
  }
  
  console.log('当前个人资料:', currentProfile);
  
  // 2. 测试数据更新
  const testData = {
    major: '测试专业-' + Date.now(),
    academic_system: '4',
    academic_status: '在读',
    department: '测试院系-' + Date.now(),
    class_info: '测试班级-' + Date.now(),
    enrollment_year: '2023',
    profile_photo: 'data:image/jpeg;base64,test'
  };
  
  console.log('测试数据:', testData);
  
  // 3. 更新个人资料
  const { data: updateResult, error: updateError } = await supabase
    .from('student_profiles')
    .update(testData)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (updateError) {
    console.error('更新个人资料失败:', updateError);
    return false;
  }
  
  console.log('更新结果:', updateResult);
  
  // 4. 验证数据是否保存成功
  const { data: verifyResult, error: verifyError } = await supabase
    .from('student_profiles')
    .select('major, academic_system, academic_status, department, class_info, enrollment_year, profile_photo, updated_at')
    .eq('user_id', userId)
    .single();
  
  if (verifyError) {
    console.error('验证数据失败:', verifyError);
    return false;
  }
  
  console.log('验证结果:', verifyResult);
  
  // 5. 检查每个字段是否正确保存
  const fieldsToCheck = ['major', 'academic_system', 'academic_status', 'department', 'class_info', 'enrollment_year', 'profile_photo'];
  let allFieldsCorrect = true;
  
  for (const field of fieldsToCheck) {
    const expected = testData[field];
    const actual = verifyResult[field];
    
    if (expected !== actual) {
      console.error(`字段 ${field} 不匹配: 期望 ${expected}, 实际 ${actual}`);
      allFieldsCorrect = false;
    } else {
      console.log(`字段 ${field} 正确: ${actual}`);
    }
  }
  
  if (allFieldsCorrect) {
    console.log('✅ 所有字段测试通过！');
  } else {
    console.log('❌ 部分字段测试失败！');
  }
  
  return allFieldsCorrect;
}

/**
 * 检查表结构
 */
export async function checkTableStructure() {
  console.log('=== 检查表结构 ===');
  
  const { data: columns, error } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable')
    .eq('table_name', 'student_profiles')
    .in('column_name', [
      'profile_photo', 'major', 'academic_system', 'academic_status', 
      'department', 'class_info', 'enrollment_year'
    ])
    .order('column_name');
  
  if (error) {
    console.error('检查表结构失败:', error);
    return false;
  }
  
  console.log('表结构检查结果:');
  if (columns && columns.length > 0) {
    columns.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (可为空: ${col.is_nullable === 'YES'})`);
    });
    return true;
  } else {
    console.log('  没有找到需要的字段！');
    return false;
  }
}

/**
 * 运行完整的测试套件
 */
export async function runCompleteTest(userId: string) {
  console.log('开始运行完整测试套件...');
  
  // 1. 检查表结构
  const structureOk = await checkTableStructure();
  
  if (!structureOk) {
    console.log('❌ 表结构检查失败，请先执行数据库迁移！');
    return false;
  }
  
  // 2. 测试字段功能
  const fieldsOk = await testProfileFields(userId);
  
  if (fieldsOk) {
    console.log('🎉 所有测试通过！个人资料字段应该可以正常工作了。');
    return true;
  } else {
    console.log('❌ 测试失败，需要进一步调试。');
    return false;
  }
}

// 如果在开发环境中，暴露到全局作用域以便调试
if (typeof window !== 'undefined') {
  window.testProfileFields = testProfileFields;
  window.checkTableStructure = checkTableStructure;
  window.runCompleteTest = runCompleteTest;
}