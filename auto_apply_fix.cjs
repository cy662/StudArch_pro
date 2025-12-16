const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://mddpbyibesqewcktlqle.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZHBieWliZXNxZXdja3RscWxlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM1NDM0OSwiZXhwIjoyMDc4OTMwMzQ5fQ.P2Y3IaRqJn6Tf7NjaHztGSd__3bTb_aBVioKoIK9Rq8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyFix() {
  try {
    console.log('🔧 开始应用批量导入筛选逻辑修复...');
    
    // 读取SQL文件
    const sqlContent = fs.readFileSync('./simple_import_filter_fix.sql', 'utf8');
    
    // 拆分为多个语句
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`发现 ${statements.length} 个SQL语句需要执行`);
    
    // 逐个执行语句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement.trim()) continue;
      
      console.log(`执行第 ${i + 1}/${statements.length} 个语句...`);
      
      try {
        // 使用 REST API 直接执行 SQL
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'apikey': supabaseKey
          },
          body: JSON.stringify({
            query: statement + ';'
          })
        });
        
        if (!response.ok) {
          console.warn(`⚠️  语句 ${i + 1} 执行警告: ${response.status}`);
          const errorText = await response.text();
          console.warn('详情:', errorText);
        } else {
          console.log(`✅ 语句 ${i + 1} 执行成功`);
        }
      } catch (err) {
        console.error(`❌ 语句 ${i + 1} 执行失败:`, err.message);
      }
    }
    
    console.log('🎉 修复脚本执行完成！');
    
    // 测试修复效果
    console.log('\n🧪 测试修复效果...');
    const { data, error } = await supabase
      .rpc('get_available_students_for_import', {
        p_teacher_id: '00000000-0000-0000-0000-000000000000',
        p_keyword: '',
        p_grade: '',
        p_department: '',
        p_page: 1,
        p_limit: 5
      });
    
    if (error) {
      console.error('❌ 测试失败:', error);
    } else {
      console.log('✅ 测试成功！');
      console.log('返回数据:', data);
    }
    
  } catch (error) {
    console.error('❌ 修复过程出错:', error);
  }
}

applyFix();