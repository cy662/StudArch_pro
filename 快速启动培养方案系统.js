// 快速启动和测试学生学习信息保存功能

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// 配置
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('🚀 开始测试学生学习信息保存功能...\n');

// 1. 测试数据库连接和表结构
async function testDatabaseConnection() {
  console.log('📊 测试数据库连接...');
  
  try {
    // 检查表是否存在
    const tables = ['student_profiles', 'student_technical_tags', 'student_learning_achievements', 'student_learning_outcomes'];
    
    for (const tableName of tables) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ 表 ${tableName} 访问失败:`, error.message);
      } else {
        console.log(`✅ 表 ${tableName} 访问正常`);
      }
    }
    
    // 获取第一个学生档案用于测试
    const { data: students } = await supabase
      .from('student_profiles')
      .select('id, full_name, class_name')
      .limit(1);
    
    if (students && students.length > 0) {
      console.log(`✅ 找到测试学生: ${students[0].full_name} (ID: ${students[0].id})`);
      return students[0].id;
    } else {
      console.log('❌ 未找到学生档案，请先创建学生数据');
      return null;
    }
    
  } catch (error) {
    console.error('❌ 数据库连接测试失败:', error);
    return null;
  }
}

// 2. 测试API服务器连接
async function testApiConnection() {
  console.log('\n🌐 测试API服务器连接...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API服务器连接正常:', data.message);
      return true;
    } else {
      console.log('❌ API服务器连接失败:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ API服务器连接错误:', error.message);
    return false;
  }
}

// 3. 测试技术标签保存
async function testTechnicalTagSave(studentProfileId) {
  console.log('\n🏷️ 测试技术标签保存...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/student-learning/add-technical-tag`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        student_profile_id: studentProfileId,
        tag_name: 'JavaScript',
        proficiency_level: 'intermediate',
        learned_at: new Date().toISOString().split('T')[0],
        description: '测试技术标签保存功能'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ 技术标签保存成功:', data.message);
      return true;
    } else {
      const errorData = await response.json();
      console.log('❌ 技术标签保存失败:', errorData.message);
      return false;
    }
  } catch (error) {
    console.error('❌ 技术标签保存错误:', error.message);
    return false;
  }
}

// 4. 测试学习收获保存
async function testLearningAchievementSave(studentProfileId) {
  console.log('\n💡 测试学习收获保存...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/student-learning/add-learning-achievement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        student_profile_id: studentProfileId,
        title: 'JavaScript学习收获',
        content: '通过这门课程，我掌握了JavaScript的基础语法和异步编程概念，能够独立完成前端开发任务。',
        achievement_type: 'course_completion',
        achieved_at: new Date().toISOString().split('T')[0],
        impact_level: 'medium',
        related_course: '前端开发基础'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ 学习收获保存成功:', data.message);
      return true;
    } else {
      const errorData = await response.json();
      console.log('❌ 学习收获保存失败:', errorData.message);
      return false;
    }
  } catch (error) {
    console.error('❌ 学习收获保存错误:', error.message);
    return false;
  }
}

// 5. 测试学习成果保存
async function testLearningOutcomeSave(studentProfileId) {
  console.log('\n🏆 测试学习成果保存...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/student-learning/add-learning-outcome`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        student_profile_id: studentProfileId,
        outcome_title: 'JavaScript项目成果',
        outcome_description: '完成了JavaScript课程项目，包括一个响应式的待办事项管理应用。',
        outcome_type: 'course_project',
        start_date: new Date().toISOString().split('T')[0],
        completion_date: new Date().toISOString().split('T')[0],
        difficulty_level: 'intermediate',
        completion_status: 'completed',
        quality_rating: 4,
        demonstration_url: 'https://example.com/project-demo'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ 学习成果保存成功:', data.message);
      return true;
    } else {
      const errorData = await response.json();
      console.log('❌ 学习成果保存失败:', errorData.message);
      return false;
    }
  } catch (error) {
    console.error('❌ 学习成果保存错误:', error.message);
    return false;
  }
}

// 6. 测试证明材料保存
async function testProofMaterialSave(studentProfileId) {
  console.log('\n📄 测试证明材料保存...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/student-learning/add-proof-material`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        student_profile_id: studentProfileId,
        material_name: 'JavaScript课程证书',
        material_description: 'JavaScript前端开发课程结业证书',
        material_type: 'course_certificate',
        material_url: '/uploads/js-certificate.pdf',
        upload_date: new Date().toISOString().split('T')[0],
        verification_status: 'pending'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ 证明材料保存成功:', data.message);
      return true;
    } else {
      const errorData = await response.json();
      console.log('❌ 证明材料保存失败:', errorData.message);
      return false;
    }
  } catch (error) {
    console.error('❌ 证明材料保存错误:', error.message);
    return false;
  }
}

// 7. 验证数据是否保存成功
async function verifyDataSaved(studentProfileId) {
  console.log('\n🔍 验证数据是否保存成功...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/student-learning/get-summary/${studentProfileId}`);
    
    if (response.ok) {
      const data = await response.json();
      const { technical_tags, learning_achievements, learning_outcomes, proof_materials } = data.data;
      
      console.log(`✅ 技术标签数量: ${technical_tags.length}`);
      console.log(`✅ 学习收获数量: ${learning_achievements.length}`);
      console.log(`✅ 学习成果数量: ${learning_outcomes.length}`);
      console.log(`✅ 证明材料数量: ${proof_materials.length}`);
      
      if (technical_tags.length > 0 || learning_achievements.length > 0 || 
          learning_outcomes.length > 0 || proof_materials.length > 0) {
        console.log('🎉 数据保存验证成功！');
        return true;
      } else {
        console.log('❌ 未找到保存的数据');
        return false;
      }
    } else {
      console.log('❌ 获取学习汇总数据失败');
      return false;
    }
  } catch (error) {
    console.error('❌ 数据验证错误:', error.message);
    return false;
  }
}

// 主函数
async function runTests() {
  console.log('📝 配置信息:');
  console.log(`   Supabase URL: ${SUPABASE_URL}`);
  console.log(`   API Base URL: ${API_BASE_URL}`);
  console.log(`   测试时间: ${new Date().toLocaleString('zh-CN')}\n`);

  // 1. 测试数据库连接
  const studentProfileId = await testDatabaseConnection();
  if (!studentProfileId) {
    console.log('\n❌ 数据库连接失败，无法继续测试');
    return;
  }

  // 2. 测试API连接
  const apiOk = await testApiConnection();
  if (!apiOk) {
    console.log('\n❌ API连接失败，请检查服务器是否启动');
    console.log('💡 提示: 运行 "node server.js" 启动API服务器');
    return;
  }

  // 3-6. 测试各项功能
  const results = [];
  results.push(await testTechnicalTagSave(studentProfileId));
  results.push(await testLearningAchievementSave(studentProfileId));
  results.push(await testLearningOutcomeSave(studentProfileId));
  results.push(await testProofMaterialSave(studentProfileId));

  // 7. 验证数据
  const verifyResult = await verifyDataSaved(studentProfileId);

  // 总结
  console.log('\n📋 测试结果汇总:');
  console.log(`   技术标签保存: ${results[0] ? '✅ 成功' : '❌ 失败'}`);
  console.log(`   学习收获保存: ${results[1] ? '✅ 成功' : '❌ 失败'}`);
  console.log(`   学习成果保存: ${results[2] ? '✅ 成功' : '❌ 失败'}`);
  console.log(`   证明材料保存: ${results[3] ? '✅ 成功' : '❌ 失败'}`);
  console.log(`   数据验证: ${verifyResult ? '✅ 成功' : '❌ 失败'}`);

  const allPassed = results.every(r => r) && verifyResult;
  
  if (allPassed) {
    console.log('\n🎉 所有测试通过！学生学习信息保存功能正常工作！');
    console.log('\n🚀 现在可以：');
    console.log('   1. 启动前端应用');
    console.log('   2. 学生登录并填写学习信息');
    console.log('   3. 教师登录并查看学生数据');
  } else {
    console.log('\n⚠️ 部分测试失败，请检查配置和错误信息');
    console.log('\n🔧 常见解决方案:');
    console.log('   1. 确保数据库表已创建: \\i student_learning_info_design_safe.sql');
    console.log('   2. 确保API函数已创建: \\i student_learning_api_functions_final.sql');
    console.log('   3. 确保RLS策略已禁用或正确配置');
    console.log('   4. 确保API服务器正在运行');
  }
}

// 运行测试
runTests().catch(console.error);