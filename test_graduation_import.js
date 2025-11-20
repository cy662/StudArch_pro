// 毕业去向批量导入功能测试脚本
// 运行方式：node test_graduation_import.js

import XLSX from 'xlsx';

// 模拟测试数据
const testData = [
  {
    student_number: '2021001',
    destination_type: 'employment',
    company_name: '阿里巴巴（中国）有限公司',
    position: '前端开发工程师',
    salary: '15000',
    work_location: '杭州',
    school_name: '',
    major: '',
    degree: '',
    abroad_country: '',
    startup_name: '',
    startup_role: '',
    other_description: ''
  },
  {
    student_number: '2021002',
    destination_type: 'furtherstudy',
    company_name: '',
    position: '',
    salary: '',
    work_location: '',
    school_name: '清华大学',
    major: '计算机应用技术',
    degree: '硕士研究生',
    abroad_country: '',
    startup_name: '',
    startup_role: '',
    other_description: ''
  },
  {
    student_number: '2021003',
    destination_type: 'abroad',
    company_name: '',
    position: '',
    salary: '',
    work_location: '',
    school_name: '美国斯坦福大学',
    major: '人工智能',
    degree: '博士研究生',
    abroad_country: '美国',
    startup_name: '',
    startup_role: '',
    other_description: ''
  },
  {
    student_number: '2021004',
    destination_type: 'entrepreneurship',
    company_name: '',
    position: '',
    salary: '',
    work_location: '',
    school_name: '',
    major: '',
    degree: '',
    abroad_country: '',
    startup_name: '北京创新科技有限公司',
    startup_role: '创始人兼CEO',
    other_description: ''
  },
  {
    student_number: '2021005',
    destination_type: 'other',
    company_name: '',
    position: '',
    salary: '',
    work_location: '',
    school_name: '',
    major: '',
    degree: '',
    abroad_country: '',
    startup_name: '',
    startup_role: '',
    other_description: '自由职业'
  }
];

console.log('=== 毕业去向批量导入功能测试 ===\n');

// 1. 测试数据格式验证
console.log('1. 测试数据格式验证：');
testData.forEach((row, index) => {
  console.log(`行 ${index + 1}: 学号=${row.student_number}, 类型=${row.destination_type}`);
  
  // 验证必填字段
  if (!row.student_number) {
    console.error(`❌ 行 ${index + 1}: 学号不能为空`);
  }
  
  if (!row.destination_type) {
    console.error(`❌ 行 ${index + 1}: 去向类型不能为空`);
  }
  
  // 验证去向类型
  const validTypes = ['employment', 'furtherstudy', 'abroad', 'entrepreneurship', 'unemployed', 'other'];
  if (!validTypes.includes(row.destination_type)) {
    console.error(`❌ 行 ${index + 1}: 无效的去向类型: ${row.destination_type}`);
  }
});

console.log('\n2. 生成测试Excel文件：');

// 创建Excel模板
const templateData = [
  ['学号', '去向类型', '单位名称', '职位', '薪资', '工作地点', '学校名称', '专业', '学历层次', '留学国家', '创业公司名称', '创业角色', '其他去向描述'],
  ['说明', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['去向类型可选值：', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['employment - 就业', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['furtherstudy - 国内升学', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['abroad - 出国留学', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['entrepreneurship - 创业', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['unemployed - 待业', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['other - 其他', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['示例数据（请按格式填写）：', '', '', '', '', '', '', '', '', '', '', '', ''],
  ...testData.map(row => [
    row.student_number,
    row.destination_type,
    row.company_name,
    row.position,
    row.salary,
    row.work_location,
    row.school_name,
    row.major,
    row.degree,
    row.abroad_country,
    row.startup_name,
    row.startup_role,
    row.other_description
  ])
];

try {
  const worksheet = XLSX.utils.aoa_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '毕业去向导入模板');
  
  // 设置列宽
  const colWidths = [
    {wch: 15}, // 学号
    {wch: 15}, // 去向类型
    {wch: 25}, // 单位名称
    {wch: 20}, // 职位
    {wch: 10}, // 薪资
    {wch: 15}, // 工作地点
    {wch: 20}, // 学校名称
    {wch: 15}, // 专业
    {wch: 10}, // 学历层次
    {wch: 15}, // 留学国家
    {wch: 20}, // 创业公司名称
    {wch: 15}, // 创业角色
    {wch: 20}  // 其他去向描述
  ];
  worksheet['!cols'] = colWidths;

  // 生成Excel文件
  const fileName = 'test_graduation_import_template.xlsx';
  XLSX.writeFile(workbook, fileName);
  
  console.log(`✅ 测试Excel文件已生成: ${fileName}`);
  console.log(`📊 包含 ${testData.length} 条测试数据`);
} catch (error) {
  console.error('❌ 生成Excel文件失败:', error.message);
}

console.log('\n3. 测试数据统计：');
const stats = testData.reduce((acc, row) => {
  acc[row.destination_type] = (acc[row.destination_type] || 0) + 1;
  return acc;
}, {});

console.log('去向类型分布:');
Object.entries(stats).forEach(([type, count]) => {
  const typeNames = {
    'employment': '就业',
    'furtherstudy': '国内升学', 
    'abroad': '出国留学',
    'entrepreneurship': '创业',
    'unemployed': '待业',
    'other': '其他'
  };
  console.log(`  ${typeNames[type] || type}: ${count} 人`);
});

console.log('\n4. 功能检查清单：');
console.log('□ 数据库表已创建 (graduation_destinations, graduation_import_batches, graduation_import_failures)');
console.log('□ RLS权限策略已配置');
console.log('□ 存储过程 batch_import_graduation_destinations 已创建');
console.log('□ 前端服务 GraduationDestinationService 已实现');
console.log('□ 批量导入界面已完成');
console.log('□ Excel模板下载功能正常');
console.log('□ 文件上传和解析功能正常');
console.log('□ 导入进度显示功能正常');
console.log('□ 导入历史记录功能正常');
console.log('□ 错误处理机制完善');

console.log('\n5. 使用说明：');
console.log('1. 在Supabase控制台执行 graduation_destination_management.sql');
console.log('2. 启动前端项目：npm run dev');
console.log('3. 访问毕业去向管理页面');
console.log('4. 点击"批量导入去向"按钮');
console.log('5. 下载模板并填写数据');
console.log('6. 上传文件并执行导入');
console.log('7. 查看导入结果和历史记录');

console.log('\n=== 测试完成 ===');