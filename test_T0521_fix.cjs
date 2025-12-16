const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mddpbyibesqewcktlqle.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZHBieWliZXNxZXdja3RscWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNTQzNDksImV4cCI6MjA3ODkzMDM0OX0.T8QHCT3UK5f2mp76Oe9-AZpdrmPOFy1wVutxfmg49EU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testT0521Fix() {
  try {
    console.log('🔧 测试T0521批量导入修复效果\n');

    // 1. 获取T0521用户ID
    const { data: teacherData } = await supabase
      .from('users')
      .select('id')
      .eq('user_number', 'T0521')
      .single();

    if (!teacherData) {
      console.error('❌ 未找到T0521用户');
      return;
    }

    console.log('✅ T0521用户ID:', teacherData.id);

    // 2. 测试修复后的函数
    console.log('\n🧪 测试get_available_students_for_import函数...');
    const { data: result, error } = await supabase
      .rpc('get_available_students_for_import', {
        p_teacher_id: teacherData.id,
        p_keyword: '',
        p_grade: '',
        p_department: '',
        p_page: 1,
        p_limit: 10
      });

    if (error) {
      console.error('❌ 函数调用失败:', error);
      console.log('💡 建议：请先在Supabase控制台执行 fix_json_parsing.sql');
      return;
    }

    console.log('✅ 函数执行成功');
    console.log('返回数据结构:', JSON.stringify(result, null, 2));

    // 3. 分析数据结构
    if (result && result.length > 0) {
      const firstResult = result[0];
      console.log('\n📊 数据分析:');
      console.log('- total_count:', firstResult.total_count);
      console.log('- students类型:', typeof firstResult.students);
      console.log('- students内容:', firstResult.students);
      
      // 尝试解析
      if (typeof firstResult.students === 'string') {
        try {
          const parsed = JSON.parse(firstResult.students);
          console.log('- JSON解析成功，学生数量:', parsed.length);
          if (parsed.length > 0) {
            console.log('- 第一个学生:', parsed[0]);
          }
        } catch (e) {
          console.error('- JSON解析失败:', e);
        }
      }
    } else {
      console.log('⚠️  函数返回空数据');
    }

    // 4. 提供解决方案
    console.log('\n📋 解决方案:');
    console.log('1. 如果函数调用失败，请执行: fix_json_parsing.sql');
    console.log('2. 如果返回空数据，可能所有学生都已被导入');
    console.log('3. 前端代码已修复，支持多种数据格式解析');

  } catch (error) {
    console.error('❌ 测试过程出错:', error);
  }
}

testT0521Fix();