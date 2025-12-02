// 使用真实学生数据测试API
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Supabase配置
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

const API_BASE_URL = 'http://localhost:3001';

console.log('🧪 使用真实学生数据测试API...\n');

async function getRealStudentProfile() {
  try {
    const { data, error } = await supabase
      .from('student_profiles')
      .select('id, full_name, class_name, user_id')
      .limit(1);

    if (error) {
      console.error('❌ 获取学生档案失败:', error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log('❌ 没有找到学生档案，创建测试数据...');
      
      // 先获取一个用户
      const { data: users } = await supabase
        .from('users')
        .select('id, username, full_name')
        .limit(1);

      if (users && users.length > 0) {
        const user = users[0];
        const { data: newStudent } = await supabase
          .from('student_profiles')
          .insert({
            user_id: user.id,
            student_number: 'TEST001',
            full_name: user.full_name || user.username,
            class_name: '测试班级'
          })
          .select()
          .single();

        return newStudent;
      }
      return null;
    }

    console.log('✅ 找到学生档案:', data[0]);
    return data[0];
  } catch (error) {
    console.error('❌ 获取学生档案错误:', error);
    return null;
  }
}

async function testTechnicalTag(studentProfileId) {
  console.log('\n🏷️ 测试技术标签API...');
  
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
        description: '来自真实数据的测试'
      })
    });

    const result = await response.json();
    console.log('📊 技术标签响应:', result);
    return response.ok;
  } catch (error) {
    console.error('❌ 技术标签测试失败:', error.message);
    return false;
  }
}

async function testLearningAchievement(studentProfileId) {
  console.log('\n💡 测试学习收获API...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/student-learning/add-learning-achievement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        student_profile_id: studentProfileId,
        title: 'JavaScript学习收获',
        content: '掌握了JavaScript的核心概念，能够独立开发前端应用',
        achievement_type: 'course_completion',
        achieved_at: new Date().toISOString().split('T')[0],
        impact_level: 'medium',
        related_course: '程序设计基础'
      })
    });

    const result = await response.json();
    console.log('📊 学习收获响应:', result);
    return response.ok;
  } catch (error) {
    console.error('❌ 学习收获测试失败:', error.message);
    return false;
  }
}

async function testLearningOutcome(studentProfileId) {
  console.log('\n🏆 测试学习成果API...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/student-learning/add-learning-outcome`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        student_profile_id: studentProfileId,
        outcome_title: 'JavaScript项目成果',
        outcome_description: '完成了一个待办事项管理应用，支持增删改查功能',
        outcome_type: 'course_project',
        start_date: new Date().toISOString().split('T')[0],
        completion_date: new Date().toISOString().split('T')[0],
        difficulty_level: 'intermediate',
        completion_status: 'completed',
        quality_rating: 4
      })
    });

    const result = await response.json();
    console.log('📊 学习成果响应:', result);
    return response.ok;
  } catch (error) {
    console.error('❌ 学习成果测试失败:', error.message);
    return false;
  }
}

async function testProofMaterial(studentProfileId) {
  console.log('\n📄 测试证明材料API...');
  
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

    const result = await response.json();
    console.log('📊 证明材料响应:', result);
    return response.ok;
  } catch (error) {
    console.error('❌ 证明材料测试失败:', error.message);
    return false;
  }
}

async function testGetSummary(studentProfileId) {
  console.log('\n📋 测试获取学习汇总API...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/student-learning/get-summary/${studentProfileId}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('📊 学习汇总响应:', result);
      
      const { technical_tags, learning_achievements, learning_outcomes, proof_materials } = result.data;
      console.log(`\n📈 数据统计:`);
      console.log(`   技术标签: ${technical_tags.length} 条`);
      console.log(`   学习收获: ${learning_achievements.length} 条`);
      console.log(`   学习成果: ${learning_outcomes.length} 条`);
      console.log(`   证明材料: ${proof_materials.length} 条`);
      
      return true;
    } else {
      const result = await response.json();
      console.log('❌ 获取汇总失败:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ 获取汇总测试失败:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 开始真实数据API测试...\n');
  
  // 获取真实学生档案
  const studentProfile = await getRealStudentProfile();
  if (!studentProfile) {
    console.log('❌ 无法获取学生档案，测试终止');
    return;
  }

  // 测试所有API
  const results = [];
  results.push(await testTechnicalTag(studentProfile.id));
  results.push(await testLearningAchievement(studentProfile.id));
  results.push(await testLearningOutcome(studentProfile.id));
  results.push(await testProofMaterial(studentProfile.id));
  await testGetSummary(studentProfile.id);

  // 总结
  console.log('\n📋 测试结果汇总:');
  console.log(`   技术标签API: ${results[0] ? '✅ 成功' : '❌ 失败'}`);
  console.log(`   学习收获API: ${results[1] ? '✅ 成功' : '❌ 失败'}`);
  console.log(`   学习成果API: ${results[2] ? '✅ 成功' : '❌ 失败'}`);
  console.log(`   证明材料API: ${results[3] ? '✅ 成功' : '❌ 失败'}`);

  const allPassed = results.every(r => r);
  
  if (allPassed) {
    console.log('\n🎉 所有API测试通过！');
    console.log('\n🚀 接下来的步骤:');
    console.log('1. 重启前端开发服务器 (npm run dev)');
    console.log('2. 在浏览器中测试前端保存功能');
    console.log('3. 确认数据能正确保存到数据库');
  } else {
    console.log('\n⚠️ 部分API测试失败，请检查错误信息');
  }
}

// 运行测试
main().catch(console.error);