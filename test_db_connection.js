// 测试 Supabase 数据库连接
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Supabase配置
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Service Key exists:', !!supabaseServiceKey);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('请确保在.env文件中设置了VITE_SUPABASE_URL和VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// 创建Supabase客户端（使用服务角色密钥以获得完整访问权限）
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    console.log('正在测试数据库连接...');
    
    // 尝试获取一个简单的表列表
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.log('连接测试结果 - 错误:', error.message);
      console.log('错误详情:', error);
    } else {
      console.log('连接测试成功!');
      console.log('可以正常访问数据库');
    }
  } catch (err) {
    console.error('连接测试异常:', err.message);
  }
}

testConnection();