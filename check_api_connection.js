// 检查API连接状态的诊断工具
import fetch from 'node-fetch';

console.log('🔍 检查API连接状态...\n');

// 测试不同的API端口
const ports = [3001, 5173, 3000, 8000];
const endpoints = [
  '/api/health',
  '/api/student-learning/add-technical-tag',
  '/api/student-learning/get-summary/test-id'
];

async function testPort(port) {
  console.log(`\n📍 测试端口 ${port}:`);
  
  for (const endpoint of endpoints) {
    const url = `http://localhost:${port}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: endpoint === '/api/health' ? 'GET' : 'POST',
        headers: endpoint.includes('add') ? {
          'Content-Type': 'application/json',
        } : {},
        body: endpoint.includes('add') ? JSON.stringify({
          student_profile_id: 'test-id',
          tag_name: 'test'
        }) : undefined,
        timeout: 3000
      });
      
      console.log(`  ✅ ${endpoint} - ${response.status} ${response.statusText}`);
      
      if (endpoint === '/api/health' && response.ok) {
        const data = await response.json();
        console.log(`     📊 ${data.message}`);
      }
      
    } catch (error) {
      console.log(`  ❌ ${endpoint} - ${error.message}`);
    }
  }
}

async function checkAllPorts() {
  const results = [];
  
  for (const port of ports) {
    try {
      console.log(`\n🔗 尝试连接 http://localhost:${port}`);
      const response = await fetch(`http://localhost:${port}/api/health`, {
        timeout: 2000
      });
      
      if (response.ok) {
        console.log(`✅ 端口 ${port} 上的API服务器正常运行！`);
        results.push(port);
      }
    } catch (error) {
      console.log(`❌ 端口 ${port} 不可访问: ${error.message}`);
    }
  }
  
  return results;
}

// 主检查函数
async function main() {
  console.log('🚀 开始API连接诊断...\n');
  
  // 检查哪些端口有API服务器
  const availablePorts = await checkAllPorts();
  
  if (availablePorts.length === 0) {
    console.log('\n❌ 没有找到运行的API服务器！');
    console.log('\n💡 解决方案:');
    console.log('1. 启动API服务器: node server.js');
    console.log('2. 确保端口3001未被占用');
    console.log('3. 检查防火墙设置');
    return;
  }
  
  // 测试每个可用端口的API
  for (const port of availablePorts) {
    await testPort(port);
  }
  
  console.log('\n📋 诊断结果:');
  console.log(`✅ 找到 ${availablePorts.length} 个运行的API服务器`);
  
  if (availablePorts.includes(3001)) {
    console.log('🎯 API服务器在正确端口3001运行');
    console.log('\n🔧 前端问题排查:');
    console.log('1. 重启前端开发服务器 (npm run dev)');
    console.log('2. 确认Vite代理配置正确');
    console.log('3. 清除浏览器缓存');
    console.log('4. 检查浏览器控制台网络请求');
  } else {
    console.log('⚠️ API服务器运行在非标准端口:', availablePorts);
    console.log('\n🔧 解决方案:');
    console.log('1. 在3001端口启动API服务器');
    console.log('2. 或更新Vite配置指向正确端口');
  }
}

// 运行诊断
main().catch(console.error);