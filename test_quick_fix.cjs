const http = require('http');

async function testQuickFix() {
  const testStudentId = '550e8400-e29b-41d4-a716-446655440001';
  
  console.log('=== 测试修复后的API ===');
  
  // 测试技术标签保存
  const tagData = {
    student_profile_id: testStudentId,
    tag_name: 'React',
    proficiency_level: 'intermediate',
    learned_at: '2024-12-02',
    description: '学习React框架开发'
  };
  
  const response = await makeRequest('/api/student-learning/add-technical-tag', 'POST', tagData);
  console.log('技术标签测试:', response);
  
  if (response.status === 200 && response.data.success) {
    console.log('✅ 技术标签保存成功！');
    
    // 测试获取汇总
    const summaryResponse = await makeRequest(`/api/student-learning/get-summary/${testStudentId}`, 'GET');
    console.log('学生信息汇总:', summaryResponse);
  } else {
    console.log('❌ 技术标签保存失败');
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

testQuickFix();