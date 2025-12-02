const http = require('http');

async function testPageAccess() {
  console.log('测试前端页面访问...');
  
  try {
    // 测试前端主页
    const homeResponse = await makeRequest('localhost', 5173, '/', 'GET');
    console.log('前端主页访问:', homeResponse.success ? '✅ 成功' : '❌ 失败');
    
    // 测试API健康检查
    const apiResponse = await makeRequest('localhost', 5173, '/api/health', 'GET');
    console.log('API代理访问:', apiResponse.success ? '✅ 成功' : '❌ 失败');
    
    if (homeResponse.success && apiResponse.success) {
      console.log('\n🎉 前端页面和API都可以正常访问！');
      console.log('📱 浏览器访问地址: http://localhost:5173');
      console.log('🔧 API地址: http://localhost:5173/api/health');
    } else {
      console.log('\n❌ 还有连接问题需要解决');
    }
    
  } catch (error) {
    console.error('❌ 测试访问时出错:', error.message);
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
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    };
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        resolve({ 
          success: res.statusCode === 200, 
          status: res.statusCode, 
          data: responseData.substring(0, 200) + '...' 
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

testPageAccess();