const fs = require('fs');
const path = require('path');

// 读取SQL文件内容
const sqlFilePath = path.join(__dirname, 'simple_import_filter_fix.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

console.log('读取到SQL文件内容:');
console.log(sqlContent.substring(0, 500) + '...');

// 使用fetch向Supabase REST API发送SQL请求
async function executeSQL() {
  try {
    const response = await fetch('https://zdxwoyaehxygqjdbluof.supabase.co/rest/v1/rpc/execute_sql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkeHdveWFlaHh5Z3FqZGJsdW9mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTk0Mjc2NiwiZXhwIjoyMDUxNTE4NzY2fQ.W21s-TKGEjyrcpJtZrJKmP1NMlFBVFNDGn2bvqxJ8es',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkeHdveWFlaHh5Z3FqZGJsdW9mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTk0Mjc2NiwiZXhwIjoyMDUxNTE4NzY2fQ.W21s-TKGEjyrcpJtZrJKmP1NMlFBVFNDGn2bvqxJ8es'
      },
      body: JSON.stringify({
        sql: sqlContent
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('SQL执行结果:', result);
  } catch (error) {
    console.error('执行SQL失败:', error);
  }
}

executeSQL();