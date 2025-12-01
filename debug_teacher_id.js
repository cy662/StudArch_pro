import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function debugTeacherId() {
  try {
    console.log('=== 检查教师ID问题 ===');
    
    // 使用第一个学生的ID作为"教师ID"进行测试（因为teacher_student_assignments表不存在）
    const { data: students, error: studError } = await supabase
      .from('student_profiles')
      .select('id')
      .limit(1);
      
    if (studError || !students || students.length === 0) {
      console.log('❌ 没有找到学生数据');
      return;
    }
    
    const testTeacherId = students[0].id; // 使用学生ID作为测试教师ID
    console.log('使用测试教师ID:', testTeacherId);
    
    // 获取培养方案
    const { data: programs, error: progError } = await supabase
      .from('training_programs')
      .select('*')
      .eq('status', 'active')
      .limit(1);
      
    if (progError || !programs || programs.length === 0) {
      console.log('❌ 没有找到培养方案');
      return;
    }
    
    const program = programs[0];
    console.log('使用培养方案:', program.id);
    
    // 测试批量分配
    const batchResponse = await fetch(`http://localhost:3001/api/teacher/${testTeacherId}/batch-assign-training-program`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        programId: program.id,
        studentIds: students.map(s => s.id),
        notes: '批量测试分配'
      }),
    });
    
    const batchResult = await batchResponse.json();
    console.log('批量分配结果:', batchResult);
    
  } catch (error) {
    console.error('调试失败:', error);
  }
}

debugTeacherId();