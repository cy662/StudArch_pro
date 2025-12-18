import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function debugFrontendTeacher() {
  try {
    console.log('=== 调试前端教师登录情况 ===');
    
    // 1. 检查教师T0521的完整信息
    const { data: teacherData, error: teacherError } = await supabase
      .from('users')
      .select('*')
      .eq('user_number', 'T0521')
      .single();
    
    if (teacherError || !teacherData) {
      console.error('获取教师信息失败:', teacherError);
      return;
    }
    
    console.log('教师T0521完整信息:');
    console.log('- ID:', teacherData.id);
    console.log('- 用户名:', teacherData.username);
    console.log('- 学号/工号:', teacherData.user_number);
    console.log('- 姓名:', teacherData.full_name);
    console.log('- 角色:', teacherData.role_id);
    console.log('- 状态:', teacherData.status);
    
    // 2. 测试前端API调用 - 模拟前端传递teacher_id
    console.log('\n=== 模拟前端API调用 ===');
    
    // 模拟前端传递的参数
    const frontendParams = {
      destination_type: null,
      status: null,
      student_name: null,
      page: 1,
      limit: 50,
      teacher_id: teacherData.id  // 这是前端应该传递的教师ID
    };
    
    console.log('前端传递的参数:', frontendParams);
    
    // 3. 使用同样的逻辑查询数据
    let destinations = [];
    let total = 0;

    try {
      // 使用数据库函数
      const { data, error } = await supabase
        .rpc('get_teacher_graduation_destinations', {
          p_teacher_id: frontendParams.teacher_id,
          p_destination_type: frontendParams.destination_type,
          p_status: frontendParams.status,
          p_student_name: frontendParams.student_name,
          p_page: frontendParams.page,
          p_limit: frontendParams.limit
        });

      if (error) {
        console.error('数据库函数调用失败:', error);
      } else {
        console.log('数据库函数返回成功');
        console.log('返回数据条数:', data?.length || 0);
        
        if (data && data.length > 0) {
          destinations = data.map((item) => ({
            id: item.id,
            student_id: item.student_id,
            destination_type: item.destination_type,
            status: item.status,
            review_comment: item.review_comment,
            submit_time: item.submit_time,
            reviewed_at: item.reviewed_at,
            created_at: item.created_at,
            updated_at: item.updated_at,
            student: item.student_number ? {
              student_number: item.student_number,
              full_name: item.student_full_name,
              class_name: item.class_name
            } : null
          }));
          total = data[0]?.total_count || 0;
        }
      }
    } catch (error) {
      console.error('调用数据库函数异常:', error);
    }
    
    console.log('\n=== 处理后的数据 ===');
    console.log('总记录数:', total);
    console.log('毕业去向列表:');
    
    destinations.forEach((item, index) => {
      console.log(`${index + 1}. ${item.student?.student_number} ${item.student?.full_name} - ${item.destination_type} (${item.status})`);
    });
    
    // 4. 特别检查学生2022666的记录
    const student2022666 = destinations.find(item => item.student?.student_number === '2022666');
    if (student2022666) {
      console.log('\n✅ 找到学生2022666的记录!');
      console.log(student2022666);
    } else {
      console.log('\n❌ 没有找到学生2022666的记录');
    }
    
  } catch (error) {
    console.error('调试失败:', error);
  }
}

debugFrontendTeacher();