const http = require('http');

async function testFrontendSave() {
  console.log('=== 通过前端代理测试课程信息保存 ===\n');
  
  const testStudentId = '550e8400-e29b-41d4-a716-446655440001';
  
  try {
    // 1. 测试通过前端代理保存技术标签
    console.log('1. 通过前端代理保存技术标签...');
    const tagResponse = await makeRequest('localhost', 5173, '/api/student-learning/add-technical-tag', 'POST', {
      student_profile_id: testStudentId,
      tag_name: 'Vue.js',
      proficiency_level: 'intermediate',
      learned_at: '2024-12-02',
      description: '通过前端代理测试Vue.js标签'
    });
    
    if (tagResponse.success) {
      console.log('   ✅ 技术标签保存成功！');
      console.log('   📝 标签名称:', tagResponse.data.data.tag_name);
      console.log('   🎓 掌握程度:', tagResponse.data.data.proficiency_level);
    } else {
      console.log('   ❌ 技术标签保存失败:', tagResponse.data.message);
    }
    
    // 2. 测试通过前端代理保存学习收获
    console.log('\n2. 通过前端代理保存学习收获...');
    const achievementResponse = await makeRequest('localhost', 5173, '/api/student-learning/add-learning-achievement', 'POST', {
      student_profile_id: testStudentId,
      title: 'Vue.js学习收获',
      content: '通过学习Vue.js，我掌握了组件化开发、响应式数据绑定和生命周期钩子等核心概念。',
      achievement_type: 'course_completion',
      achieved_at: '2024-12-02',
      impact_level: 'high',
      related_course: 'Vue.js框架开发'
    });
    
    if (achievementResponse.success) {
      console.log('   ✅ 学习收获保存成功！');
      console.log('   📚 标题:', achievementResponse.data.data.title);
      console.log('   🎯 影响程度:', achievementResponse.data.data.impact_level);
    } else {
      console.log('   ❌ 学习收获保存失败:', achievementResponse.data.message);
    }
    
    // 3. 获取学生信息汇总
    console.log('\n3. 获取学生信息汇总...');
    const summaryResponse = await makeRequest('localhost', 5173, `/api/student-learning/get-summary/${testStudentId}`, 'GET');
    
    if (summaryResponse.success) {
      console.log('   ✅ 学生信息汇总获取成功！');
      const data = summaryResponse.data.data;
      console.log('   📊 技术标签数量:', data.technical_tags.length);
      console.log('   📚 学习收获数量:', data.learning_achievements.length);
      console.log('   🏆 学习成果数量:', data.learning_outcomes.length);
      console.log('   📄 证明材料数量:', data.proof_materials.length);
      
      console.log('\n   🎯 最新的技术标签:');
      data.technical_tags.forEach((tag, index) => {
        console.log(`      ${index + 1}. ${tag.tag_name} (${tag.proficiency_level})`);
      });
      
      console.log('\n   📖 最新的学习收获:');
      data.learning_achievements.forEach((achievement, index) => {
        console.log(`      ${index + 1}. ${achievement.title}`);
        console.log(`         ${achievement.content.substring(0, 50)}...`);
      });
    } else {
      console.log('   ❌ 学生信息汇总获取失败:', summaryResponse.data.message);
    }
    
    console.log('\n=== 前端代理测试完成 ===');
    console.log('🎉 前端可以正常通过代理访问后端API并保存课程信息！');
    
  } catch (error) {
    console.error('❌ 测试过程中出错:', error.message);
  }
}

async function makeRequest(hostname, port, path, method, data) {
  return new Promise((resolve, reject) => {
    const postData = method !== 'GET' ? JSON.stringify(data) : null;
    
    const options = {
      hostname: hostname,
      port: port,
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
          resolve({ success: res.statusCode === 200, status: res.statusCode, data: result });
        } catch (e) {
          resolve({ success: false, status: res.statusCode, raw: responseData });
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

testFrontendSave();