const http = require('http');

async function getRealStudentId() {
  try {
    console.log('获取真实学生档案ID...');
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/student-learning/get-summary/all',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('获取学生ID响应状态:', res.statusCode);
        console.log('获取学生ID响应内容:', data);
      });
    });
    
    req.on('error', (error) => {
      console.error('获取学生ID失败:', error.message);
    });
    
    req.end();
    
  } catch (error) {
    console.error('测试过程出错:', error.message);
  }
}

getRealStudentId();