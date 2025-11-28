// 检查前端环境变量是否正确配置
const testEnvVars = () => {
  console.log('🔍 检查环境变量配置...');
  
  // 检查 Vite 环境变量
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('Supabase URL:', supabaseUrl ? '✅ 已配置' : '❌ 未配置');
  console.log('Supabase Service Key:', supabaseServiceKey ? '✅ 已配置' : '❌ 未配置');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ 环境变量配置缺失，请检查 .env 文件');
    return false;
  }
  
  console.log('✅ 环境变量配置正确');
  return true;
};

testEnvVars();