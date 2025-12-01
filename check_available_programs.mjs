import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkAvailablePrograms() {
  try {
    console.log('🔍 检查可用的培养方案...');
    
    // 1. 检查培养方案表
    const { data: programs, error: progError } = await supabase
      .from('training_programs')
      .select('*')
      .eq('status', 'active');
    
    if (progError) {
      console.log('❌ 查询培养方案失败:', progError.message);
      return;
    }
    
    console.log('📚 可用的培养方案:');
    if (programs && programs.length > 0) {
      programs.forEach((program, index) => {
        console.log(`${index + 1}. ID: ${program.id}`);
        console.log(`   名称: ${program.program_name}`);
        console.log(`   代码: ${program.program_code}`);
        console.log(`   状态: ${program.status}`);
        console.log('');
      });
    } else {
      console.log('❌ 没有找到任何激活的培养方案');
    }
    
    // 2. 检查教师学生关系
    console.log('👥 检查教师学生关系...');
    const { data: relationships, error: relError } = await supabase
      .from('teacher_student_relationships')
      .select('*')
      .eq('teacher_id', '00000000-0000-0000-0000-000000000001')
      .limit(5);
    
    if (relError) {
      console.log('❌ 查询教师学生关系失败:', relError.message);
    } else {
      console.log('📋 教师管理的学生:');
      if (relationships && relationships.length > 0) {
        relationships.forEach((rel, index) => {
          console.log(`${index + 1}. 学生ID: ${rel.student_id}`);
        });
      } else {
        console.log('❌ 该教师没有管理任何学生');
      }
    }
    
    // 3. 建议下一步操作
    if (!programs || programs.length === 0) {
      console.log('\n🔧 建议解决方案:');
      console.log('1. 创建至少一个培养方案');
      console.log('2. 或者修改前端使用现有的培养方案ID');
    }
    
  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error);
  }
}

checkAvailablePrograms();