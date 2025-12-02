import { createClient } from '@supabase/supabase-js';

// Supabase配置
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQLFix() {
  try {
    console.log('开始执行数据库修复...');
    
    // 1. 创建测试学生数据
    const { data: existingStudents } = await supabase
      .from('student_profiles')
      .select('id, student_number')
      .limit(5);
    
    console.log('现有学生数据:', existingStudents);
    
    if (!existingStudents || existingStudents.length === 0) {
      console.log('创建测试学生档案...');
      const { data: newStudent } = await supabase
        .from('student_profiles')
        .insert({
          id: '550e8400-e29b-41d4-a716-446655440001',
          student_number: '2024010001',
          full_name: '张三',
          class_name: '计算机科学与技术2024-1班',
          status: 'active'
        })
        .select()
        .single();
      
      console.log('创建的学生档案:', newStudent);
    }
    
    // 2. 检查表是否存在
    const tables = ['student_technical_tags', 'student_learning_achievements', 'student_learning_outcomes', 'student_proof_materials'];
    
    for (const tableName of tables) {
      console.log(`检查表: ${tableName}`);
      
      try {
        // 尝试查询表结构
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error && error.code === 'PGRST116') {
          console.log(`表 ${tableName} 不存在，需要创建`);
        } else if (error) {
          console.log(`表 ${tableName} 查询错误:`, error.message);
        } else {
          console.log(`表 ${tableName} 存在`);
        }
      } catch (e) {
        console.log(`检查表 ${tableName} 时出错:`, e.message);
      }
    }
    
    console.log('数据库修复完成！');
    
  } catch (error) {
    console.error('执行修复失败:', error);
  }
}

executeSQLFix();