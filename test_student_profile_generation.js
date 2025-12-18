/**
 * 测试学生画像生成功能的修复效果
 * 运行方式: node test_student_profile_generation.js
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001';

// 测试用例
const testCases = [
  {
    name: '测试有效的UUID',
    student_profile_id: '11111111-1111-1111-1111-111111111111',
    expected: 'success_or_mock_success'
  },
  {
    name: '测试null值',
    student_profile_id: null,
    expected: 'error'
  },
  {
    name: '测试字符串null',
    student_profile_id: 'null',
    expected: 'error'
  },
  {
    name: '测试undefined值',
    student_profile_id: undefined,
    expected: 'error'
  },
  {
    name: '测试mock ID',
    student_profile_id: 'mock-12345',
    expected: 'success'
  },
  {
    name: '测试空字符串',
    student_profile_id: '',
    expected: 'error'
  }
];

async function runTests() {
  console.log('=== 开始测试学生画像生成API ===\n');
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`测试 ${i + 1}: ${testCase.name}`);
    console.log(`输入: student_profile_id = ${testCase.student_profile_id}`);
    
    try {
      const response = await fetch(`${API_BASE}/api/student-profile/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_profile_id: testCase.student_profile_id
        })
      });

      const result = await response.json();
      
      console.log(`响应状态: ${response.status}`);
      console.log(`响应内容:`, JSON.stringify(result, null, 2));
      
      // 验证结果
      let passed = false;
      if (testCase.expected === 'error') {
        passed = !result.success && response.status === 400;
      } else if (testCase.expected === 'success_or_mock_success') {
        passed = result.success && result.data?.image_url;
      } else if (testCase.expected === 'success') {
        passed = result.success;
      }
      
      console.log(`测试结果: ${passed ? '✅ 通过' : '❌ 失败'}`);
      
    } catch (error) {
      console.error(`请求失败:`, error.message);
      console.log(`测试结果: ❌ 失败 (网络错误)`);
    }
    
    console.log('---\n');
  }
  
  console.log('=== 测试完成 ===');
}

// 检查API服务器是否运行
async function checkServerHealth() {
  try {
    const response = await fetch(`${API_BASE}/api/health`);
    const result = await response.json();
    console.log('✅ API服务器运行正常:', result.message);
    return true;
  } catch (error) {
    console.error('❌ 无法连接到API服务器，请确保服务器正在运行在', API_BASE);
    console.error('   启动命令: npm run server 或 node server.js');
    return false;
  }
}

// 主函数
async function main() {
  console.log('学生画像生成API测试工具');
  console.log('============================\n');
  
  const serverRunning = await checkServerHealth();
  if (!serverRunning) {
    process.exit(1);
  }
  
  await runTests();
}

// 运行测试
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runTests, checkServerHealth };