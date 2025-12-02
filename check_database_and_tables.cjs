const http = require('http');

async function checkDatabaseTables() {
  try {
    console.log('检查数据库表...');
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/health',
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
        console.log('健康检查响应状态:', res.statusCode);
        console.log('健康检查响应内容:', data);
      });
    });
    
    req.on('error', (error) => {
      console.error('健康检查失败:', error.message);
    });
    
    req.end();
    
  } catch (error) {
    console.error('检查过程出错:', error.message);
  }
}

// 检查是否有更详细的表结构API
async function checkStudentsAPI() {
  try {
    console.log('\n检查学生API...');
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/students',
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
        console.log('学生API响应状态:', res.statusCode);
        console.log('学生API响应内容:', data);
      });
    });
    
    req.on('error', (error) => {
      console.error('学生API失败:', error.message);
    });
    
    req.end();
    
  } catch (error) {
    console.error('检查学生API出错:', error.message);
  }
}

checkDatabaseTables();
checkStudentsAPI();