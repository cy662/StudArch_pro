const http = require('http');

async function createTestStudent() {
  try {
    console.log('创建测试学生档案...');
    
    // 先创建用户
    const userData = {
      email: 'test.student@example.com',
      full_name: '测试学生',
      role: 'student'
    };
    
    const userResponse = await makeRequest('/api/students', 'POST', userData);
    console.log('创建用户响应:', userResponse);
    
    // 如果用户创建成功，创建学生档案
    if (userResponse && userResponse.success) {
      const profileData = {
        user_id: userResponse.data?.id,
        student_number: '2024000001',
        full_name: '测试学生',
        class_name: '计算机科学与技术2024-1班',
        admission_date: '2024-09-01'
      };
      
      const profileResponse = await makeRequest('/api/student-profiles', 'POST', profileData);
      console.log('创建学生档案响应:', profileResponse);
    }
    
  } catch (error) {
    console.error('创建测试学生失败:', error.message);
  }
}

async function makeRequest(path, method, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
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
    
    req.write(postData);
    req.end();
  });
}

createTestStudent();