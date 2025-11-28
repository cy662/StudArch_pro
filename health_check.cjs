// 简单的健康检查
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`);
  console.log(`响应头:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`响应体:`, data);
    console.log('✅ 服务器运行正常');
  });
});

req.on('error', (error) => {
  console.error('❌ 请求失败:', error.message);
});

req.end();