import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkForeignKeyDetails() {
  try {
    const studentId = 'db888c86-eb18-4c5d-819a-d59f0d223adc';
    
    console.log('🔍 详细检查外键约束...\n');
    
    // 1. 直接查询这个学生是否真的在users表中
    console.log(`📋 直接查询学生 ${studentId} 在users表中:`);
    const { data: directUser, error: directError } = await supabase
      .from('users')
      .select('*')
      .eq('id', studentId);
    
    if (directError) {
      console.error('❌ 直接查询失败:', directError.message);
    } else {
      console.log('✅ 直接查询结果:', directUser?.length || 0, '条记录');
      if (directUser?.length > 0) {
        console.log('用户详情:', directUser[0]);
      }
    }
    
    // 2. 检查student_training_programs表的外键约束信息
    console.log('\n📋 检查student_training_programs表中的现有记录:');
    const { data: existingPrograms, error: existingError } = await supabase
      .from('student_training_programs')
      .select('*')
      .limit(3);
    
    if (existingError) {
      console.error('❌ 查询现有记录失败:', existingError.message);
    } else {
      console.log('✅ 现有记录:');
      existingPrograms?.forEach(p => {
        console.log(`- 学生ID: ${p.student_id}, 培养方案ID: ${p.program_id}`);
      });
      
      // 检查这些学生ID在users表中是否存在
      if (existingPrograms?.length > 0) {
        console.log('\n🔍 验证现有记录的学生ID是否在users表中:');
        for (const prog of existingPrograms) {
          const { data: checkUser, error: checkError } = await supabase
            .from('users')
            .select('id, username')
            .eq('id', prog.student_id);
          
          if (checkError) {
            console.error(`❌ 验证学生 ${prog.student_id} 失败:`, checkError.message);
          } else {
            console.log(`✅ 学生 ${prog.student_id} 存在:`, checkUser?.length || 0, '条记录');
          }
        }
      }
    }
    
    // 3. 尝试手动插入一条记录来测试
    console.log('\n🧪 尝试手动插入一条测试记录...');
    const testStudentId = existingPrograms?.[0]?.student_id; // 使用已知存在的ID
    const programId = '62b2cc69-5b10-4238-8232-59831cdb7964';
    
    if (testStudentId) {
      const { data: insertResult, error: insertError } = await supabase
        .from('student_training_programs')
        .insert({
          student_id: testStudentId,
          program_id: programId,
          enrollment_date: new Date().toISOString().split('T')[0],
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (insertError) {
        console.error('❌ 手动插入失败:', insertError.message);
        console.error('错误详情:', insertError.details);
      } else {
        console.log('✅ 手动插入成功:', insertResult);
      }
    }
    
  } catch (error) {
    console.error('🚨 检查过程中发生错误:', error);
  }
}

checkForeignKeyDetails();