const http = require('http');

async function testServerConfig() {
  console.log('🔍 检查服务器配置...');
  
  try {
    // 测试API健康检查，看响应信息
    const response = await makeRequest('localhost', 3001, '/api/health', 'GET');
    
    if (response.success) {
      console.log('✅ API服务器运行正常');
      console.log('📊 响应数据:', response.data);
      
      // 测试一个简单的数据库保存操作
      console.log('\n🧪 测试数据库保存配置...');
      const testResponse = await makeRequest('localhost', 3001, '/api/student-learning/add-technical-tag', 'POST', {
        student_profile_id: 'test-id-123',
        tag_name: 'Config-Test',
        proficiency_level: 'intermediate',
        learned_at: '2024-12-02',
        description: '测试服务器配置'
      });
      
      if (testResponse.success) {
        console.log('✅ 数据库保存配置正确');
        console.log('📝 返回信息:', testResponse.data.message);
        
        if (testResponse.data.message.includes('临时存储')) {
          console.log('❌ 服务器仍在使用临时存储，不是真实数据库');
        } else {
          console.log('✅ 服务器使用真实数据库');
        }
      } else {
        console.log('❌ 数据库保存失败:', testResponse.data.message);
      }
      
    } else {
      console.log('❌ API服务器响应异常:', response.status);
    }
    
  } catch (error) {
    console.error('❌ 测试服务器配置时出错:', error.message);
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

testServerConfig();