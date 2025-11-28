// 详细分析占位符UUID格式
const placeholderId = '00000000-0000-0000-0000-000000000102';

console.log('占位符ID详细分析:');
console.log('ID:', placeholderId);
console.log('总长度:', placeholderId.length);

// 按段分解
const segments = placeholderId.split('-');
console.log('\n分段分解:');
segments.forEach((segment, index) => {
  console.log(`段${index + 1}: "${segment}" (长度: ${segment.length})`);
});

// 分析最后部分
console.log('\n最后一段详细分析:');
const lastSegment = segments[4];
console.log('最后一段:', `"${lastSegment}"`);
console.log('最后一段长度:', lastSegment.length);
console.log('最后3位:', lastSegment.substring(lastSegment.length - 3));
console.log('最后3位是数字:', /^\d{3}$/.test(lastSegment.substring(lastSegment.length - 3)));

// 测试不同的正则表达式
console.log('\n测试正则表达式:');

const regex1 = /^00000000-0000-0000-0000-000000000\d{3}$/i;
const regex2 = /^00000000-0000-0000-0000-00000000\d{4}$/i;

console.log('regex1 (^00000000-0000-0000-0000-000000000\d{3}$):', regex1.test(placeholderId) ? '✅' : '❌');
console.log('regex2 (^00000000-0000-0000-0000-00000000\d{4}$):', regex2.test(placeholderId) ? '✅' : '❌');

// 测试其他示例ID
const testIds = [
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000102',
  '00000000-0000-0000-0000-000000000101'
];

console.log('\n测试其他ID:');
testIds.forEach(id => {
  console.log(`${id}: regex1=${regex1.test(id)}, regex2=${regex2.test(id)}`);
});