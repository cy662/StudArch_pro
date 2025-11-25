// 检查毕业去向数据中proof_files字段的脚本
const { createClient } = require('@supabase/supabase-js');

// 替换为你的Supabase配置
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_KEY || 'YOUR_SUPABASE_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProofFiles() {
  try {
    console.log('=== 检查毕业去向数据中的proof_files字段 ===');
    
    // 查询毕业去向数据，包含proof_files字段
    const { data, error } = await supabase
      .from('graduation_destinations')
      .select('id, student_id, proof_files')
      .limit(5);

    if (error) {
      console.error('查询失败:', error);
      return;
    }

    console.log(`找到 ${data.length} 条记录:`);
    data.forEach((record, index) => {
      console.log(`${index + 1}. ID: ${record.id}`);
      console.log(`   Student ID: ${record.student_id}`);
      console.log(`   Proof Files:`, JSON.stringify(record.proof_files, null, 2));
      console.log('---');
    });

  } catch (error) {
    console.error('检查过程出错:', error);
  }
}

// 运行检查
checkProofFiles();