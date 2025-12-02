import { createClient } from '@supabase/supabase-js';

// 使用与前端相同的配置
const supabaseUrl = 'https://mddpbyibesqewcktlqle.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZHBieWliZXNxZXdja3RscWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNTQzNDksImV4cCI6MjA3ODkzMDM0OX0.T8QHCT3UK5f2mp76Oe9-AZpdrmPOFy1wVutxfmg49EU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseConnection() {
  console.log('🔍 测试数据库连接...');
  
  try {
    // 1. 测试连接
    const { data, error } = await supabase
      .from('student_profiles')
      .select('id, full_name')
      .limit(1);
    
    if (error) {
      console.log('❌ 数据库连接失败:', error.message);
      return false;
    }
    
    console.log('✅ 数据库连接成功');
    console.log('📊 获取到数据:', data);
    
    // 2. 测试学生学习相关表是否存在
    const tables = [
      'student_technical_tags',
      'student_learning_achievements', 
      'student_learning_outcomes',
      'student_proof_materials'
    ];
    
    for (const tableName of tables) {
      try {
        const { data: tableData, error: tableError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (tableError) {
          console.log(`❌ 表 ${tableName} 不存在或无权限:`, tableError.message);
        } else {
          console.log(`✅ 表 ${tableName} 存在`);
        }
      } catch (e) {
        console.log(`❌ 测试表 ${tableName} 时出错:`, e.message);
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ 数据库测试失败:', error.message);
    return false;
  }
}

async function testRealStudentProfile() {
  console.log('\n👤 测试真实学生档案...');
  
  const testStudentId = '5a8c393a-a0c5-4f65-bf35-b15ffb3f550c'; // 从您日志中的真实ID
  
  try {
    const { data: profile, error } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('id', testStudentId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('❌ 学生档案不存在，但可以创建');
        
        // 尝试创建学生档案
        const { data: newProfile, error: createError } = await supabase
          .from('student_profiles')
          .insert({
            id: testStudentId,
            full_name: '测试学生',
            student_number: '2024010001',
            class_name: '计算机科学与技术2024-1班',
            status: 'active'
          })
          .select()
          .single();
        
        if (createError) {
          console.log('❌ 创建学生档案失败:', createError.message);
        } else {
          console.log('✅ 学生档案创建成功:', newProfile);
        }
      } else {
        console.log('❌ 查询学生档案失败:', error.message);
      }
    } else {
      console.log('✅ 找到学生档案:', profile);
    }
  } catch (error) {
    console.error('❌ 测试学生档案时出错:', error.message);
  }
}

// 运行测试
async function runTests() {
  console.log('🧪 === 数据库连接和表结构测试 ===\n');
  
  const dbConnected = await testDatabaseConnection();
  
  if (dbConnected) {
    await testRealStudentProfile();
  }
  
  console.log('\n📋 测试完成');
}

runTests();