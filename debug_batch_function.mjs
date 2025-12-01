import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function debugBatchFunction() {
  try {
    console.log('🔍 调试批量分配函数...');
    
    // 1. 检查教师学生关系
    console.log('\n👥 检查教师学生关系...');
    const { data: relationships, error: relError } = await supabase
      .from('teacher_student_relationships')
      .select('*')
      .eq('teacher_id', '00000000-0000-0000-0000-000000000001');
    
    if (relError) {
      console.log('❌ 查询关系失败:', relError);
    } else {
      console.log('✅ 找到关系:', relationships?.length || 0, '个');
      relationships?.forEach((rel, i) => {
        console.log(`  ${i+1}. ${rel.student_id}`);
      });
    }
    
    // 2. 检查培养方案
    console.log('\n📚 检查培养方案...');
    const { data: programs, error: progError } = await supabase
      .from('training_programs')
      .select('*')
      .eq('status', 'active');
    
    if (progError) {
      console.log('❌ 查询培养方案失败:', progError);
    } else {
      console.log('✅ 找到培养方案:', programs?.length || 0, '个');
      programs?.forEach((prog, i) => {
        console.log(`  ${i+1}. ${prog.id} - ${prog.program_name}`);
      });
    }
    
    // 3. 直接调用函数测试
    console.log('\n🧪 直接调用函数测试...');
    const testStudentIds = ['db888c86-eb18-4c5d-819a-d59f0d223adc']; // 使用第一个真实学生ID
    const testProgramId = programs?.[0]?.id; // 使用第一个真实的培养方案ID
    
    if (!testProgramId) {
      console.log('❌ 没有可用的培养方案');
      return;
    }
    
    console.log('测试参数:');
    console.log('  教师ID:', '00000000-0000-0000-0000-000000000001');
    console.log('  培养方案ID:', testProgramId);
    console.log('  学生ID:', testStudentIds);
    
    const { data, error } = await supabase.rpc('batch_assign_training_program_to_teacher_students', {
      p_teacher_id: '00000000-0000-0000-0000-000000000001',
      p_program_id: testProgramId,
      p_student_ids: testStudentIds
    });
    
    if (error) {
      console.log('❌ 函数调用失败:', error);
      console.log('错误详情:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ 函数调用成功:', data);
    }
    
    // 4. 检查函数是否存在
    console.log('\n🔍 检查函数是否存在...');
    const { data: funcInfo } = await supabase
      .from('pg_proc')
      .select('proname, prosrc')
      .eq('proname', 'batch_assign_training_program_to_teacher_students')
      .single();
    
    if (funcInfo) {
      console.log('✅ 函数存在');
      if (funcInfo.prosrc && funcInfo.prosrc.includes('%d')) {
        console.log('⚠️ 函数源码中仍包含%d，需要修复');
      } else {
        console.log('✅ 函数源码格式正确');
      }
    } else {
      console.log('❌ 函数不存在');
    }
    
  } catch (error) {
    console.error('❌ 调试过程中发生错误:', error);
  }
}

debugBatchFunction();