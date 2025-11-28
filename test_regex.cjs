// 测试UUID正则表达式
const standardUuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const placeholderUuidRegex = /^00000000-0000-0000-0000-00000000\d{3}$/i;

const testIds = [
  '00000000-0000-0000-0000-000000000001', // 教师ID
  '00000000-0000-0000-0000-000000000102', // 学生ID
  'e898ba53-cb96-48ab-ae82-42c48db7d0be', // 标准UUID
  '62b2cc69-5b10-4238-8232-59831cdb7964'  // 培养方案ID
];

console.log('测试UUID正则表达式:');
testIds.forEach(id => {
  const isStandard = standardUuidRegex.test(id);
  const isPlaceholder = placeholderUuidRegex.test(id);
  const isValid = isStandard || isPlaceholder;
  
  console.log(`ID: ${id}`);
  console.log(`  标准UUID: ${isStandard ? '✅' : '❌'}`);
  console.log(`  占位符UUID: ${isPlaceholder ? '✅' : '❌'}`);
  console.log(`  有效: ${isValid ? '✅' : '❌'}`);
  console.log('');
});

// 详细分析占位符格式
console.log('占位符ID分析:');
const placeholderId = '00000000-0000-0000-0000-000000000102';
console.log('ID:', placeholderId);
console.log('长度:', placeholderId.length);
console.log('后3位:', placeholderId.substring(32));
console.log('后3位是数字:', /^\d{3}$/.test(placeholderId.substring(32)));
console.log('完整匹配:', placeholderUuidRegex.test(placeholderId));