import { createClient } from '@supabase/supabase-js';

// 从.env文件获取配置
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log('正在连接到Supabase...');
console.log('URL:', supabaseUrl);

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 读取修复SQL文件
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fixSql = readFileSync(join(__dirname, 'fix_batch_assign_function.sql'), 'utf8');

async function executeFix() {
  try {
    console.log('正在执行修复脚本...');
    
    // 使用Supabase的RPC功能执行SQL
    // 注意：这需要在Supabase中创建一个可以执行任意SQL的函数
    // 如果没有这样的函数，我们需要使用其他方法
    
    // 方案1：尝试直接执行SQL（如果Supabase允许）
    // 这在大多数情况下不会工作，因为权限限制
    
    // 方案2：分解SQL并使用Supabase API执行
    console.log('修复脚本内容:');
    console.log(fixSql);
    
    // 由于直接执行SQL可能受限，我们提供指导说明
    console.log('\n=== 修复说明 ===');
    console.log('1. 请登录Supabase控制台');
    console.log('2. 进入Database > SQL Editor');
    console.log('3. 将以下SQL脚本粘贴到编辑器中并执行:');
    console.log('\n--- SQL脚本开始 ---');
    console.log(fixSql);
    console.log('--- SQL脚本结束 ---');
    console.log('\n执行完成后，培养方案分配功能应该就可以正常工作了。');
    
  } catch (error) {
    console.error('执行修复时出错:', error.message);
  }
}

executeFix();