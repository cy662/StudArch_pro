const http = require('http');

async function testProxy() {
  console.log('测试前端代理到后端API的连接...');
  
  try {
    // 测试直接访问后端API
    const directResponse = await makeRequest('localhost', 3001, '/api/health', 'GET');
    console.log('✅ 直接访问后端API (3001):', directResponse.success ? '成功' : '失败');
    
    // 测试通过前端代理访问
    const proxyResponse = await makeRequest('localhost', 5173, '/api/health', 'GET');
    console.log('✅ 通过前端代理访问 (5173):', proxyResponse.success ? '成功' : '失败');
    
    if (directResponse.success && !proxyResponse.success) {
      console.log('❌ 代理配置有问题，前端无法通过5173端口访问API');
    } else if (directResponse.success && proxyResponse.success) {
      console.log('✅ 代理配置正常');
    }
    
  } catch (error) {
    console.error('测试代理时出错:', error.message);
  }
}

async function makeRequest(hostname, port, path, method) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: hostname,
      port: port,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
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
          resolve({ success: res.statusCode === 200, status: res.statusCode, data: result });
        } catch (e) {
          resolve({ success: false, status: res.statusCode, raw: responseData });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

testProxy();