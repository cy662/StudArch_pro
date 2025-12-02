const http = require('http');

async function testAPI() {
  try {
    console.log('测试学生技术标签API...');
    
    const testData = {
      student_profile_id: 'test-student-id',
      tag_name: 'JavaScript',
      proficiency_level: 'intermediate',
      learned_at: '2024-12-02',
      description: '测试API连接'
    };
    
    const postData = JSON.stringify(testData);
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/student-learning/add-technical-tag',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('API响应状态:', res.statusCode);
        console.log('API响应内容:', data);
        
        try {
          const result = JSON.parse(data);
          console.log('解析后的响应:', JSON.stringify(result, null, 2));
        } catch (e) {
          console.log('无法解析JSON响应');
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('API请求失败:', error.message);
    });
    
    req.write(postData);
    req.end();
    
  } catch (error) {
    console.error('测试过程出错:', error.message);
  }
}

testAPI();