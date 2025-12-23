#!/usr/bin/env node

// 技术标签功能测试启动脚本
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 启动技术标签功能测试\n');

// 检查必要文件
const requiredFiles = [
  'test_technical_tag_simple.html',
  'quick_technical_tag_test.js',
  'test_and_fix_technical_tags.js'
];

console.log('📋 检查测试文件...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - 文件不存在`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ 缺少必要的测试文件，请检查项目结构');
  process.exit(1);
}

console.log('\n📊 测试选项:');
console.log('1. 运行数据库诊断和修复');
console.log('2. 打开网页测试工具');
console.log('3. 创建测试数据');
console.log('4. 查看修复指南');
console.log('5. 运行完整测试流程');

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('\n请选择测试选项 (1-5): ', (choice) => {
  switch (choice) {
    case '1':
      console.log('\n🔍 运行数据库诊断...');
      try {
        execSync('node quick_technical_tag_test.js', { stdio: 'inherit' });
      } catch (error) {
        console.error('❌ 诊断脚本运行失败:', error.message);
      }
      break;
      
    case '2':
      console.log('\n🌐 打开网页测试工具...');
      const testPage = path.resolve(__dirname, 'test_technical_tag_simple.html');
      console.log(`请用浏览器打开: file://${testPage}`);
      console.log('\n💡 或使用Python启动简单服务器:');
      console.log('python -m http.server 8080');
      console.log('然后访问: http://localhost:8080/test_technical_tag_simple.html');
      break;
      
    case '3':
      console.log('\n🛠️ 创建测试数据...');
      try {
        execSync('node test_and_fix_technical_tags.js', { stdio: 'inherit' });
      } catch (error) {
        console.error('❌ 测试数据创建失败:', error.message);
      }
      break;
      
    case '4':
      console.log('\n📖 查看修复指南...');
      const guidePath = path.resolve(__dirname, '技术标签搜索功能修复指南.md');
      console.log(`请查看文件: ${guidePath}`);
      console.log('\n📝 主要步骤:');
      console.log('1. 检查数据库连接和数据状态');
      console.log('2. 运行诊断脚本');
      console.log('3. 根据诊断结果修复问题');
      console.log('4. 测试搜索功能');
      break;
      
    case '5':
      console.log('\n🔄 运行完整测试流程...');
      console.log('步骤 1/3: 创建测试数据...');
      try {
        execSync('node test_and_fix_technical_tags.js', { stdio: 'inherit' });
        console.log('\n步骤 2/3: 运行诊断...');
        execSync('node quick_technical_tag_test.js', { stdio: 'inherit' });
        console.log('\n步骤 3/3: 打开测试页面...');
        const testPage2 = path.resolve(__dirname, 'test_technical_tag_simple.html');
        console.log(`请用浏览器打开: file://${testPage2}`);
      } catch (error) {
        console.error('❌ 完整测试流程失败:', error.message);
      }
      break;
      
    default:
      console.log('❌ 无效选项');
  }
  
  rl.close();
  
  console.log('\n🎯 测试提示:');
  console.log('- 确保数据库连接配置正确');
  console.log('- 测试教师ID: 11111111-1111-1111-1111-111111111121');
  console.log('- 常用测试标签: JavaScript, React, Python');
  console.log('- 查看浏览器控制台获取详细错误信息');
});