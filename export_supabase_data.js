// 导出Supabase数据库数据的脚本
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

// 要导出的表列表
const tablesToExport = [
  'roles',
  'users',
  'system_settings',
  'classes',
  'student_profiles',
  'profile_edit_logs',
  'batch_imports',
  'import_failures',
  'login_logs',
  'password_resets',
  'student_batch_operations'
];

// 生成INSERT语句的函数
function generateInsertStatement(tableName, records) {
  if (records.length === 0) {
    return `-- ${tableName} 表中没有数据\n`;
  }

  // 获取所有字段名
  const fields = Object.keys(records[0]);
  
  // 生成INSERT语句
  let insertStatements = `-- ${tableName} 表数据\n`;
  
  records.forEach(record => {
    const values = fields.map(field => {
      const value = record[field];
      if (value === null) {
        return 'NULL';
      } else if (typeof value === 'string') {
        // 转义单引号并包装在单引号中
        return `'${value.replace(/'/g, "''")}'`;
      } else if (typeof value === 'object') {
        // 处理日期和JSON对象
        if (value instanceof Date) {
          return `'${value.toISOString()}'`;
        } else {
          return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
        }
      } else {
        return value.toString();
      }
    });
    
    insertStatements += `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${values.join(', ')});\n`;
  });
  
  return insertStatements + '\n';
}

// 从Supabase获取表数据的函数
async function fetchTableData(tableName) {
  try {
    console.log(`正在获取 ${tableName} 表的数据...`);
    
    // 获取表中的所有记录
    const { data, error } = await supabase
      .from(tableName)
      .select('*');
    
    if (error) {
      console.error(`获取 ${tableName} 表数据时出错:`, error.message);
      return [];
    }
    
    console.log(`成功获取 ${tableName} 表的 ${data.length} 条记录`);
    return data;
  } catch (err) {
    console.error(`获取 ${tableName} 表数据时出现异常:`, err.message);
    return [];
  }
}

// 主函数
async function exportDatabase() {
  console.log('开始导出Supabase数据库...');
  
  try {
    // 生成SQL文件头部
    let sqlContent = `-- ==========================================\n`;
    sqlContent += `-- Supabase 数据库数据导出\n`;
    sqlContent += `-- 导出日期: ${new Date().toISOString()}\n`;
    sqlContent += `-- ==========================================\n\n`;
    
    // 禁用触发器以避免在导入时出现问题
    sqlContent += `-- 禁用触发器\n`;
    sqlContent += `SET session_replication_role = replica;\n\n`;
    
    // 清空现有数据（按正确顺序）
    sqlContent += `-- 清空现有数据\n`;
    for (let i = tablesToExport.length - 1; i >= 0; i--) {
      sqlContent += `TRUNCATE TABLE ${tablesToExport[i]} CASCADE;\n`;
    }
    sqlContent += `\n`;
    
    // 按顺序获取每个表的数据
    for (const tableName of tablesToExport) {
      const records = await fetchTableData(tableName);
      const insertStatements = generateInsertStatement(tableName, records);
      sqlContent += insertStatements;
    }
    
    // 重新启用触发器
    sqlContent += `-- 重新启用触发器\n`;
    sqlContent += `SET session_replication_role = DEFAULT;\n`;
    
    // 将SQL内容写入文件
    const fs = require('fs');
    const path = require('path');
    const outputPath = path.join(__dirname, 'supabase_data_export.sql');
    
    fs.writeFileSync(outputPath, sqlContent);
    console.log(`数据已成功导出到: ${outputPath}`);
    
    // 显示导出摘要
    console.log('\n导出摘要:');
    console.log(`- 导出的表数量: ${tablesToExport.length}`);
    console.log(`- 输出文件: ${outputPath}`);
    console.log('- 导出完成!');
    
  } catch (error) {
    console.error('导出过程中出现错误:', error.message);
  }
}

// 执行导出
exportDatabase();