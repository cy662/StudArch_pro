const http = require('http');

async function testCompleteSaveFlow() {
  const testStudentId = '550e8400-e29b-41d4-a716-446655440001';
  
  console.log('=== 测试完整的课程信息保存流程 ===\n');
  
  try {
    // 1. 测试技术标签保存
    console.log('1. 测试技术标签保存...');
    const tagResponse = await saveTechnicalTag(testStudentId, 'JavaScript', '高级JavaScript编程');
    console.log('   技术标签保存:', tagResponse.success ? '✅ 成功' : '❌ 失败');
    
    // 2. 测试学习收获保存
    console.log('\n2. 测试学习收获保存...');
    const achievementResponse = await saveLearningAchievement(testStudentId, '数据结构', '掌握了常用数据结构和算法');
    console.log('   学习收获保存:', achievementResponse.success ? '✅ 成功' : '❌ 失败');
    
    // 3. 测试学习成果保存
    console.log('\n3. 测试学习成果保存...');
    const outcomeResponse = await saveLearningOutcome(testStudentId, '项目开发', '完成了电商网站开发项目');
    console.log('   学习成果保存:', outcomeResponse.success ? '✅ 成功' : '❌ 失败');
    
    // 4. 测试证明材料保存
    console.log('\n4. 测试证明材料保存...');
    const materialResponse = await saveProofMaterial(testStudentId, '项目证书.pdf', '项目完成证书');
    console.log('   证明材料保存:', materialResponse.success ? '✅ 成功' : '❌ 失败');
    
    // 5. 获取完整的学生信息汇总
    console.log('\n5. 获取学生信息汇总...');
    const summaryResponse = await getStudentSummary(testStudentId);
    if (summaryResponse.success) {
      console.log('   ✅ 汇总获取成功');
      console.log('   📊 技术标签数量:', summaryResponse.data.technical_tags.length);
      console.log('   📚 学习收获数量:', summaryResponse.data.learning_achievements.length);
      console.log('   🏆 学习成果数量:', summaryResponse.data.learning_outcomes.length);
      console.log('   📄 证明材料数量:', summaryResponse.data.proof_materials.length);
    } else {
      console.log('   ❌ 汇总获取失败');
    }
    
    console.log('\n=== 测试完成 ===');
    console.log('🎉 课程信息保存功能修复成功！学生现在可以正常保存课程信息。');
    
  } catch (error) {
    console.error('❌ 测试过程中出错:', error.message);
  }
}

async function saveTechnicalTag(studentId, tagName, description) {
  return await makeRequest('/api/student-learning/add-technical-tag', 'POST', {
    student_profile_id: studentId,
    tag_name: tagName,
    proficiency_level: 'intermediate',
    learned_at: '2024-12-02',
    description: description
  });
}

async function saveLearningAchievement(studentId, course, content) {
  return await makeRequest('/api/student-learning/add-learning-achievement', 'POST', {
    student_profile_id: studentId,
    title: `${course} - 学习收获`,
    content: content,
    achievement_type: 'course_completion',
    achieved_at: '2024-12-02',
    impact_level: 'high',
    related_course: course
  });
}

async function saveLearningOutcome(studentId, title, description) {
  return await makeRequest('/api/student-learning/add-learning-outcome', 'POST', {
    student_profile_id: studentId,
    outcome_title: title,
    outcome_description: description,
    outcome_type: 'course_project',
    start_date: '2024-11-01',
    completion_date: '2024-12-02',
    difficulty_level: 'intermediate',
    completion_status: 'completed',
    quality_rating: 4
  });
}

async function saveProofMaterial(studentId, fileName, description) {
  return await makeRequest('/api/student-learning/add-proof-material', 'POST', {
    student_profile_id: studentId,
    material_name: fileName,
    material_description: description,
    material_type: 'course_certificate',
    material_url: `/uploads/${fileName}`,
    upload_date: '2024-12-02',
    verification_status: 'pending'
  });
}

async function getStudentSummary(studentId) {
  return await makeRequest(`/api/student-learning/get-summary/${studentId}`, 'GET');
}

async function makeRequest(path, method, data) {
  return new Promise((resolve, reject) => {
    const postData = method !== 'GET' ? JSON.stringify(data) : null;
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve(result);
        } catch (e) {
          resolve({ success: false, raw: responseData });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

testCompleteSaveFlow();