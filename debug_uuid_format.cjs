const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function debugUuidFormat() {
  console.log('=== 调试UUID格式问题 ===');
  
  try {
    // 检查student_training_programs表中实际的ID格式
    console.log('\n1. 检查student_training_programs表的ID格式...');
    const { data: assignments, error: assignmentError } = await supabase
      .from('student_training_programs')
      .select('id, student_id, program_id')
      .limit(5);
      
    if (assignmentError) {
      console.error('查询失败:', assignmentError);
    } else {
      console.log('实际存储的ID格式:');
      assignments.forEach((record, index) => {
        console.log(`${index + 1}. 分配ID: ${record.id}`);
        console.log(`   学生ID: ${record.student_id}`);
        console.log(`   方案ID: ${record.program_id}`);
        console.log('');
      });
    }
    
    // 检查student_profiles表的实际ID格式
    console.log('\n2. 检查student_profiles表的ID格式...');
    const { data: profiles, error: profileError } = await supabase
      .from('student_profiles')
      .select('id, user_id')
      .limit(3);
      
    if (profileError) {
      console.error('查询档案失败:', profileError);
    } else {
      console.log('档案表ID格式:');
      profiles.forEach((record, index) => {
        console.log(`${index + 1}. 档案ID: ${record.id}`);
        console.log(`   用户ID: ${record.user_id}`);
        console.log('');
      });
    }
    
    // 测试不同的ID格式调用API
    console.log('\n3. 测试不同ID格式的API调用...');
    
    // 使用陈瑶的正确档案ID
    const chenyaoProfileId = 'f1c1aa0d-2169-4369-af14-3cadc6aa22b4';
    console.log(`测试陈瑶的档案ID: ${chenyaoProfileId}`);
    
    const { data: chenyaoCourses, error: chenyaoError } = await supabase.rpc('get_student_training_program_courses', {
      p_student_id: chenyaoProfileId
    });
    
    if (chenyaoError) {
      console.error('❌ 陈瑶API调用失败:', chenyaoError);
    } else {
      console.log('✅ 陈瑶API调用成功，课程数量:', chenyaoCourses?.length || 0);
    }
    
    // 使用刘羿辰的档案ID，检查是否有问题
    const liuyichenProfileId = 'ad7482c8-4bfb-4369-b940-388ca5e53d377';
    console.log(`测试刘羿辰的档案ID: ${liuyichenProfileId}`);
    
    const { data: liuyichenCourses, error: liuyichenError } = await supabase.rpc('get_student_training_program_courses', {
      p_student_id: liuyichenProfileId
    });
    
    if (liuyichenError) {
      console.error('❌ 刘羿辰API调用失败:', liuyichenError);
    } else {
      console.log('✅ 刘羿辰API调用成功，课程数量:', liuyichenCourses?.length || 0);
    }
    
  } catch (error) {
    console.error('调试过程中出错:', error);
  }
}

debugUuidFormat().catch(console.error);