const http = require('http');

async function finalTest() {
  console.log('🧪 === 最终功能完整测试 ===\n');
  
  const testStudentId = '550e8400-e29b-41d4-a716-446655440001';
  
  try {
    // 1. 测试前端页面访问
    console.log('1. 测试前端页面访问...');
    const pageResponse = await makeRequest('localhost', 5173, '/', 'GET');
    console.log(`   前端页面: ${pageResponse.success ? '✅ 可访问' : '❌ 无法访问'} (状态码: ${pageResponse.status})`);
    
    // 2. 测试API健康检查
    console.log('\n2. 测试API健康检查...');
    const healthResponse = await makeRequest('localhost', 5173, '/api/health', 'GET');
    console.log(`   API健康检查: ${healthResponse.success ? '✅ 正常' : '❌ 异常'}`);
    if (healthResponse.success) {
      console.log(`   服务器消息: ${healthResponse.data.message}`);
    }
    
    // 3. 测试技术标签保存
    console.log('\n3. 测试技术标签保存...');
    const tagResponse = await makeRequest('localhost', 5173, '/api/student-learning/add-technical-tag', 'POST', {
      student_profile_id: testStudentId,
      tag_name: 'TypeScript',
      proficiency_level: 'intermediate',
      learned_at: '2024-12-02',
      description: 'TypeScript类型系统学习'
    });
    console.log(`   技术标签保存: ${tagResponse.success ? '✅ 成功' : '❌ 失败'}`);
    
    // 4. 测试学习收获保存
    console.log('\n4. 测试学习收获保存...');
    const achievementResponse = await makeRequest('localhost', 5173, '/api/student-learning/add-learning-achievement', 'POST', {
      student_profile_id: testStudentId,
      title: 'TypeScript学习收获',
      content: '掌握了TypeScript的类型系统，包括接口、泛型、装饰器等高级特性，提高了代码的可维护性。',
      achievement_type: 'course_completion',
      achieved_at: '2024-12-02',
      impact_level: 'high',
      related_course: 'TypeScript进阶'
    });
    console.log(`   学习收获保存: ${achievementResponse.success ? '✅ 成功' : '❌ 失败'}`);
    
    // 5. 测试学习成果保存
    console.log('\n5. 测试学习成果保存...');
    const outcomeResponse = await makeRequest('localhost', 5173, '/api/student-learning/add-learning-outcome', 'POST', {
      student_profile_id: testStudentId,
      outcome_title: 'TypeScript项目实践',
      outcome_description: '使用TypeScript重构了一个React项目，实现了完整的类型定义和错误处理',
      outcome_type: 'course_project',
      start_date: '2024-11-15',
      completion_date: '2024-12-02',
      difficulty_level: 'intermediate',
      completion_status: 'completed',
      quality_rating: 5
    });
    console.log(`   学习成果保存: ${outcomeResponse.success ? '✅ 成功' : '❌ 失败'}`);
    
    // 6. 测试证明材料保存
    console.log('\n6. 测试证明材料保存...');
    const materialResponse = await makeRequest('localhost', 5173, '/api/student-learning/add-proof-material', 'POST', {
      student_profile_id: testStudentId,
      material_name: 'TypeScript项目代码.zip',
      material_description: '使用TypeScript重构的完整项目代码',
      material_type: 'course_certificate',
      material_url: '/uploads/typescript-project.zip',
      upload_date: '2024-12-02',
      verification_status: 'pending'
    });
    console.log(`   证明材料保存: ${materialResponse.success ? '✅ 成功' : '❌ 失败'}`);
    
    // 7. 测试获取完整汇总
    console.log('\n7. 测试获取完整学生信息汇总...');
    const summaryResponse = await makeRequest('localhost', 5173, `/api/student-learning/get-summary/${testStudentId}`, 'GET');
    if (summaryResponse.success) {
      const data = summaryResponse.data.data;
      console.log(`   ✅ 学生信息汇总获取成功`);
      console.log(`   📊 技术标签: ${data.technical_tags.length} 个`);
      console.log(`   📚 学习收获: ${data.learning_achievements.length} 个`);
      console.log(`   🏆 学习成果: ${data.learning_outcomes.length} 个`);
      console.log(`   📄 证明材料: ${data.proof_materials.length} 个`);
      
      // 显示最新的技术标签
      if (data.technical_tags.length > 0) {
        console.log('\n   🏷️  技术标签列表:');
        data.technical_tags.forEach((tag, index) => {
          console.log(`      ${index + 1}. ${tag.tag_name} (${tag.proficiency_level}) - ${tag.source}`);
        });
      }
    } else {
      console.log('   ❌ 学生信息汇总获取失败');
    }
    
    // 8. 总结
    console.log('\n🎯 === 测试总结 ===');
    const allTests = [
      pageResponse.success,
      healthResponse.success,
      tagResponse.success,
      achievementResponse.success,
      outcomeResponse.success,
      materialResponse.success,
      summaryResponse.success
    ];
    
    const passedTests = allTests.filter(test => test).length;
    const totalTests = allTests.length;
    
    console.log(`✅ 通过测试: ${passedTests}/${totalTests}`);
    
    if (passedTests === totalTests) {
      console.log('\n🎉🎉🎉 所有测试通过！课程信息保存功能完全修复！');
      console.log('📱 学生现在可以正常使用教学任务与安排的所有功能');
      console.log('🔗 访问地址: http://localhost:5173');
      console.log('💾 数据已保存到临时存储，重启服务器前有效');
    } else {
      console.log('\n⚠️  还有部分功能需要修复');
    }
    
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

finalTest();