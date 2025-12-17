const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase配置
const supabaseUrl = 'https://mddpbyibesqewcktlqle.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZHBieWliZXNxZXdja3RscWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNTQzNDksImV4cCI6MjA3ODkzMDM0OX0.T8QHCT3UK5f2mp76Oe9-AZpdrmPOFy1wVutxfmg49EU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQL() {
  try {
    console.log('开始创建学生自定义课程表...');
    
    // 读取SQL文件
    const sqlFilePath = path.join(__dirname, 'create_student_custom_courses_table.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('SQL内容:');
    console.log(sqlContent);
    
    // 尝试创建表（简化版本）
    const { data, error } = await supabase.rpc('create_student_custom_courses_table');
    
    if (error && error.code !== 'PGRST116') {
      console.error('创建表失败:', error);
    } else {
      console.log('✅ 学生自定义课程表创建成功或已存在');
    }
    
    console.log('⚠️  请在Supabase控制台中手动执行SQL脚本以确保完整性');
    console.log(`SQL文件路径: ${sqlFilePath}`);
    
  } catch (error) {
    console.error('❌ 执行失败:', error);
  }
}

executeSQL();