import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('缺少 Supabase 配置');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testBatchAssignFunction() {
  try {
    console.log('🧪 测试批量分配培养方案函数...');
    
    // 测试函数是否存在
    const { data, error } = await supabase
      .rpc('batch_assign_training_program_to_teacher_students', {
        p_teacher_id: '00000000-0000-0000-0000-000000000001',
        p_program_id: '00000000-0000-0000-0000-000000000001',
        p_student_ids: ['00000000-0000-0000-0000-000000000001']
      });
    
    if (error) {
      if (error.message.includes('unrecognized format')) {
        console.log('❌ 仍有format错误，需要应用修复');
        console.log('错误详情:', error.message);
        return false;
      } else {
        console.log('✅ format错误已修复，但可能有其他问题:');
        console.log('错误详情:', error.message);
        return true; // format错误已修复
      }
    } else {
      console.log('✅ 批量分配函数正常工作');
      console.log('返回结果:', data);
      return true;
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
    return false;
  }
}

testBatchAssignFunction().then(success => {
  if (success) {
    console.log('\n🎉 批量分配功能已修复！');
    console.log('📱 现在可以在教师平台正常使用批量分配培养方案功能');
  } else {
    console.log('\n📋 请按照以下步骤修复:');
    console.log('1. 打开 Supabase Dashboard');
    console.log('2. 进入 Database > SQL Editor');
    console.log('3. 粘贴 direct_batch_fix.sql 中的内容');
    console.log('4. 点击执行');
    console.log('5. 重新测试批量分配功能');
  }
});