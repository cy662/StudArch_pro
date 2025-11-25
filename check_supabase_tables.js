// 检查Supabase数据库中的所有表和数据
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Supabase配置
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('请确保在.env文件中设置了VITE_SUPABASE_URL和VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// 创建Supabase客户端（使用服务角色密钥以获得完整访问权限）
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 检查数据库连接的函数
async function checkDatabaseConnection() {
  try {
    const { data, error } = await supabase.rpc('version');
    if (error) {
      console.log('数据库连接成功，但无法获取版本信息:', error.message);
    } else {
      console.log('数据库连接成功');
    }
    return true;
  } catch (err) {
    console.error('数据库连接失败:', err.message);
    return false;
  }
}

// 获取所有表名的函数
async function getAllTables() {
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');

    if (error) {
      console.error('获取表列表时出错:', error.message);
      return [];
    }

    // 过滤掉系统表和视图
    const tableNames = data
      .map(row => row.table_name)
      .filter(name => !name.startsWith('sql_') && !name.startsWith('pg_') && !name.startsWith('information_schema'));
    
    return tableNames;
  } catch (err) {
    console.error('获取表列表时出现异常:', err.message);
    return [];
  }
}

// 获取表结构信息的函数
async function getTableStructure(tableName) {
  try {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .order('ordinal_position');

    if (error) {
      console.error(`获取 ${tableName} 表结构时出错:`, error.message);
      return [];
    }

    return data;
  } catch (err) {
    console.error(`获取 ${tableName} 表结构时出现异常:`, err.message);
    return [];
  }
}

// 获取表数据的函数
async function getTableData(tableName, limit = 10) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(limit);

    if (error) {
      console.error(`获取 ${tableName} 表数据时出错:`, error.message);
      return [];
    }

    return data;
  } catch (err) {
    console.error(`获取 ${tableName} 表数据时出现异常:`, err.message);
    return [];
  }
}

// 获取表记录数的函数
async function getTableRowCount(tableName) {
  try {
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error(`获取 ${tableName} 表记录数时出错:`, error.message);
      return 0;
    }

    return count;
  } catch (err) {
    console.error(`获取 ${tableName} 表记录数时出现异常:`, err.message);
    return 0;
  }
}

// 主函数
async function checkDatabase() {
  console.log('开始检查Supabase数据库...\n');

  // 检查数据库连接
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    process.exit(1);
  }

  // 获取所有表
  console.log('正在获取数据库中的所有表...');
  const tables = await getAllTables();
  
  if (tables.length === 0) {
    console.log('未找到任何表');
    return;
  }

  console.log(`\n找到 ${tables.length} 个表:`);
  console.log(tables.join(', '));
  console.log('');

  // 逐个检查每个表
  for (const tableName of tables) {
    console.log(`\n=== 检查表: ${tableName} ===`);
    
    // 获取表结构
    const structure = await getTableStructure(tableName);
    console.log(`结构 (${structure.length} 个字段):`);
    structure.forEach(col => {
      console.log(`  ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });
    
    // 获取记录数
    const rowCount = await getTableRowCount(tableName);
    console.log(`记录数: ${rowCount}`);
    
    // 如果有数据，显示前几条记录
    if (rowCount > 0) {
      const sampleData = await getTableData(tableName, 3);
      console.log('示例数据:');
      sampleData.forEach((row, index) => {
        console.log(`  ${index + 1}.`, JSON.stringify(row, null, 2));
      });
      
      if (rowCount > 3) {
        console.log(`  ... 还有 ${rowCount - 3} 条记录`);
      }
    }
    
    console.log('');
  }

  console.log('数据库检查完成!');
}

// 执行检查
checkDatabase();