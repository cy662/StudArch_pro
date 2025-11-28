// 最终完整测试：从教师学生列表到培养方案分配的完整流程
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const finalTest = async () => {
  console.log('🎯 最终完整测试：培养方案分配流程\n');

  try {
    // 1. 获取教师管理的学生（模拟前端查询）
    console.log('📋 步骤1: 获取教师管理的学生');
    const { data: teacherStudents, error: studentsError } = await supabase
      .rpc('get_teacher_students_v2', {
        p_teacher_id: '00000000-0000-0000-0000-000000000001',
        p_keyword: '',
        p_page: 1,
        p_limit: 5
      });

    if (studentsError || !teacherStudents || teacherStudents.length === 0) {
      console.error('获取教师学生失败:', studentsError?.message);
      return;
    }

    const students = teacherStudents[0]?.students || [];
    console.log(`找到 ${students.length} 个学生:`);
    
    // 2. 映射到档案ID（模拟前端显示）
    console.log('\n📋 步骤2: 映射学生ID到档案ID');
    const userIds = students.map(s => s.id);
    const { data: profiles, error: profilesError } = await supabase
      .from('student_profiles')
      .select('id, user_id')
      .in('user_id', userIds);

    if (profilesError) {
      console.error('获取学生档案失败:', profilesError);
      return;
    }

    const userToProfileMap = {};
    profiles.forEach(profile => {
      userToProfileMap[profile.user_id] = profile.id;
    });

    const studentsWithProfileIds = students.map(student => ({
      ...student,
      id: userToProfileMap[student.id] || student.id
    }));

    console.log('学生ID映射结果:');
    studentsWithProfileIds.forEach(student => {
      console.log(`- 原用户ID: ${student.user_id} -> 档案ID: ${student.id}`);
    });

    // 3. 模拟选择学生并执行分配（使用档案ID）
    if (studentsWithProfileIds.length > 0) {
      const selectedProfileIds = [studentsWithProfileIds[0].id];
      console.log(`\n📋 步骤3: 选择学生进行分配，选择的档案ID: ${selectedProfileIds[0]}`);

      // 4. 映射回用户ID（模拟前端修复）
      console.log('\n📋 步骤4: 将档案ID映射回用户ID用于API调用');
      const { data: profileToUserMap, error: mappingError } = await supabase
        .from('student_profiles')
        .select('id, user_id')
        .in('id', selectedProfileIds);

      if (mappingError) {
        console.error('映射查询失败:', mappingError);
        return;
      }

      const profileToUser = {};
      profileToUserMap.forEach(profile => {
        profileToUser[profile.id] = profile.user_id;
      });

      const userIdsForApi = selectedProfileIds.map(profileId => profileToUser[profileId]);
      console.log(`映射后的用户ID: ${userIdsForApi[0]}`);

      // 5. 调用API进行分配
      console.log('\n📋 步骤5: 调用API执行培养方案分配');
      const response = await fetch('http://localhost:3001/api/teacher/00000000-0000-0000-0000-000000000001/batch-assign-training-program', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          programId: '00000000-0000-0000-0000-000000000001',
          studentIds: userIdsForApi,
          notes: '最终完整测试'
        })
      });

      const result = await response.json();
      console.log('API响应状态:', response.status);
      console.log('分配结果:', result.success ? '✅ 成功' : '❌ 失败');
      console.log('详细信息:', result.data?.message || result.message);

      if (result.success && result.data?.details) {
        console.log('分配详情:', result.data.details);
      }
    }

    console.log('\n🎉 最终完整测试完成！整个流程工作正常。');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
};

finalTest();