// 检查数据库中所有assign_training_program_to_student函数版本
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少Supabase配置');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkFunctionVersions() {
  console.log('🔍 检查assign_training_program_to_student函数版本...');
  
  try {
    // 查询所有同名函数
    const { data, error } = await supabase.rpc('get_function_info', {
      function_name: 'assign_training_program_to_student'
    });
    
    if (error) {
      console.log('⚠️  无法通过RPC获取函数信息，尝试直接查询系统表...');
      
      // 直接查询系统表获取函数信息
      const { data: functions, error: queryError } = await supabase
        .from('pg_proc')
        .select('proname, pronargs, proargtypes, prosrc')
        .ilike('proname', 'assign_training_program_to_student');
        
      if (queryError) {
        console.error('❌ 查询函数信息失败:', queryError.message);
        return;
      }
      
      if (!functions || functions.length === 0) {
        console.log('ℹ️  未找到任何assign_training_program_to_student函数');
        return;
      }
      
      console.log(`✅ 找到 ${functions.length} 个函数版本:`);
      functions.forEach((func, index) => {
        console.log(`\n--- 版本 ${index + 1} ---`);
        console.log(`函数名: ${func.proname}`);
        console.log(`参数数量: ${func.pronargs}`);
        console.log(`参数类型: ${func.proargtypes}`);
        console.log(`源码预览: ${func.prosrc ? func.prosrc.substring(0, 100) + '...' : 'N/A'}`);
      });
    } else {
      console.log('✅ 通过RPC获取函数信息:');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ 检查函数版本时发生错误:', error.message);
  }
}

// 运行检查
checkFunctionVersions().then(() => {
  console.log('\n✨ 函数版本检查完成');
}).catch(console.error);