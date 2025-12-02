const fs = require('fs');
const path = require('path');

console.log('检查TDesign CSS文件路径...');

const tdesignPath = path.join(__dirname, 'node_modules', 'tdesign-react', 'dist', 'tdesign.css');
const indexPath = path.join(__dirname, 'src', 'index.css');

console.log('TDesign CSS文件路径:', tdesignPath);
console.log('文件是否存在:', fs.existsSync(tdesignPath));

if (fs.existsSync(tdesignPath)) {
  const stats = fs.statSync(tdesignPath);
  console.log('文件大小:', stats.size, '字节');
  console.log('✅ TDesign CSS文件找到');
} else {
  console.log('❌ TDesign CSS文件未找到');
}

console.log('\n检查index.css文件...');
console.log('index.css路径:', indexPath);
if (fs.existsSync(indexPath)) {
  const content = fs.readFileSync(indexPath, 'utf8');
  console.log('文件内容:');
  console.log(content);
  console.log('✅ index.css文件读取成功');
} else {
  console.log('❌ index.css文件未找到');
}