import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// 加载环境变量
config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testStudentSubmission() {
  try {
    console.log('=== 测试学生2022666提交毕业去向 ===');
    
    // 1. 获取学生2022666的用户信息
    const { data: studentData, error: studentError } = await supabase
      .from('users')
      .select('*')
      .eq('user_number', '2022666')
      .single();
    
    if (studentError || !studentData) {
      console.error('获取学生信息失败:', studentError);
      return;
    }
    
    console.log('找到学生:', studentData.user_number, '-', studentData.full_name);
    
    // 2. 检查当前是否有毕业去向记录
    const { data: existingData, error: existingError } = await supabase
      .from('graduation_destinations')
      .select('*')
      .eq('student_id', studentData.id);
    
    if (existingError) {
      console.error('检查现有记录失败:', existingError);
    } else {
      console.log('现有毕业去向记录数量:', existingData.length);
      if (existingData.length > 0) {
        console.log('现有记录:', existingData);
      }
    }
    
    // 3. 删除现有的毕业去向记录（如果有），以便重新提交
    if (existingData && existingData.length > 0) {
      const { error: deleteError } = await supabase
        .from('graduation_destinations')
        .delete()
        .eq('student_id', studentData.id);
      
      if (deleteError) {
        console.error('删除现有记录失败:', deleteError);
      } else {
        console.log('已删除现有记录，准备重新提交');
      }
    }
    
    // 4. 模拟提交新的毕业去向记录
    const testDestination = {
      student_id: studentData.id,
      destination_type: 'employment',
      company_name: '测试公司有限公司',
      position: '软件工程师',
      salary: '8000',
      work_location: '北京',
      status: 'pending',
      proof_files: ['resume.pdf', 'offer_letter.pdf'],
      submit_time: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('准备提交的毕业去向数据:', testDestination);
    
    // 5. 提交新记录
    const { data: insertData, error: insertError } = await supabase
      .from('graduation_destinations')
      .insert([testDestination])
      .select()
      .single();
    
    if (insertError) {
      console.error('提交毕业去向失败:', insertError);
    } else {
      console.log('提交成功！');
      console.log('提交的记录:', insertData);
    }
    
    // 6. 验证提交结果
    const { data: verifyData, error: verifyError } = await supabase
      .from('graduation_destinations')
      .select(`
        *,
        users!graduation_destinations_student_id_fkey (
          user_number,
          full_name,
          class_name
        )
      `)
      .eq('student_id', studentData.id);
    
    if (verifyError) {
      console.error('验证提交结果失败:', verifyError);
    } else {
      console.log('验证结果 - 学生2022666的毕业去向记录:', verifyData);
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testStudentSubmission();