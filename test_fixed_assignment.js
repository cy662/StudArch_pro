import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function testFixedAssignment() {
  try {
    console.log('=== 测试修复后的培养方案分配 ===');
    
    // 1. 获取可用的培养方案
    const { data: programs, error: progError } = await supabase
      .from('training_programs')
      .select('*')
      .eq('status', 'active')
      .limit(1);
      
    if (progError || !programs || programs.length === 0) {
      console.log('❌ 没有找到可用的培养方案');
      return;
    }
    
    const program = programs[0];
    console.log('✅ 找到培养方案:', program.program_name, 'ID:', program.id);
    
    // 2. 获取可用的学生
    const { data: students, error: studError } = await supabase
      .from('student_profiles')
      .select('id')
      .limit(3);
      
    if (studError || !students || students.length === 0) {
      console.log('❌ 没有找到学生数据');
      return;
    }
    
    console.log('✅ 找到学生数量:', students.length);
    console.log('学生IDs:', students.map(s => s.id));
    
    // 3. 测试单个分配
    const studentId = students[0].id;
    console.log('\n=== 测试单个分配 ===');
    
    const testResponse = await fetch(`http://localhost:3001/api/student/${studentId}/assign-training-program`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        programId: program.id,
        teacherId: '00000000-0000-0000-0000-000000000001',
        notes: '测试分配'
      }),
    });
    
    const testResult = await testResponse.json();
    console.log('单个分配结果:', testResult);
    
    // 4. 测试批量分配
    console.log('\n=== 测试批量分配 ===');
    const batchResponse = await fetch(`http://localhost:3001/api/teacher/00000000-0000-0000-0000-000000000001/batch-assign-training-program`, {
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
    
    // 5. 测试学生端课程获取
    console.log('\n=== 测试学生端课程获取 ===');
    const courseResponse = await fetch(`http://localhost:3001/api/student/${studentId}/training-program-courses`);
    const courseResult = await courseResponse.json();
    console.log('学生课程获取结果:', courseResult.success ? `成功获取 ${courseResult.data.length} 门课程` : '失败');
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testFixedAssignment();