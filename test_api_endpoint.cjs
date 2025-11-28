const http = require('http');

function testAPIHealth() {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/health',
    method: 'GET',
    timeout: 3000
  };

  const req = http.request(options, (res) => {
    console.log(`API服务器状态: ${res.statusCode}`);
    if (res.statusCode === 200) {
      console.log('✅ API服务器正在运行');
    } else {
      console.log('❌ API服务器响应异常');
    }
  });

  req.on('error', (err) => {
    console.log('❌ API服务器未运行:', err.message);
  });

  req.on('timeout', () => {
    console.log('❌ API服务器响应超时');
    req.destroy();
  });

  req.end();
}

testAPIHealth();