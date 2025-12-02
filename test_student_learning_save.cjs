const http = require('http');

async function testStudentLearningSave() {
  const testStudentId = '550e8400-e29b-41d4-a716-446655440001';
  
  try {
    console.log('=== 测试学生技术标签保存 ===');
    
    // 测试1: 添加技术标签
    const tagData = {
      student_profile_id: testStudentId,
      tag_name: 'Python',
      proficiency_level: 'intermediate',
      learned_at: '2024-12-02',
      description: '测试保存Python标签'
    };
    
    const tagResponse = await makeRequest('/api/student-learning/add-technical-tag', 'POST', tagData);
    console.log('技术标签保存响应:', tagResponse);
    
    console.log('\n=== 测试学习收获保存 ===');
    
    // 测试2: 添加学习收获
    const achievementData = {
      student_profile_id: testStudentId,
      title: '数据结构与算法 - 学习收获',
      content: '通过学习数据结构，我掌握了常用算法的时间复杂度分析，能够选择合适的数据结构解决问题。',
      achievement_type: 'course_completion',
      achieved_at: '2024-12-02',
      impact_level: 'high',
      related_course: '数据结构与算法'
    };
    
    const achievementResponse = await makeRequest('/api/student-learning/add-learning-achievement', 'POST', achievementData);
    console.log('学习收获保存响应:', achievementResponse);
    
    console.log('\n=== 测试学习成果保存 ===');
    
    // 测试3: 添加学习成果
    const outcomeData = {
      student_profile_id: testStudentId,
      outcome_title: '数据结构与算法 - 项目成果',
      outcome_description: '完成了一个图书管理系统的项目，使用链表实现图书库存管理',
      outcome_type: 'course_project',
      start_date: '2024-11-01',
      completion_date: '2024-12-02',
      difficulty_level: 'intermediate',
      completion_status: 'completed',
      quality_rating: 4
    };
    
    const outcomeResponse = await makeRequest('/api/student-learning/add-learning-outcome', 'POST', outcomeData);
    console.log('学习成果保存响应:', outcomeResponse);
    
    console.log('\n=== 测试证明材料保存 ===');
    
    // 测试4: 添加证明材料
    const materialData = {
      student_profile_id: testStudentId,
      material_name: '数据结构课程证书.pdf',
      material_description: '数据结构与算法课程完成证书',
      material_type: 'course_certificate',
      material_url: '/uploads/data_structure_certificate.pdf',
      upload_date: '2024-12-02',
      verification_status: 'pending'
    };
    
    const materialResponse = await makeRequest('/api/student-learning/add-proof-material', 'POST', materialData);
    console.log('证明材料保存响应:', materialResponse);
    
    console.log('\n=== 获取学生信息汇总 ===');
    
    // 测试5: 获取学生信息汇总
    const summaryResponse = await makeRequest(`/api/student-learning/get-summary/${testStudentId}`, 'GET');
    console.log('学生信息汇总响应:', summaryResponse);
    
  } catch (error) {
    console.error('测试失败:', error.message);
  }
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
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: { success: false, raw: responseData } });
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

testStudentLearningSave();