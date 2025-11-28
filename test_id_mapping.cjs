// 测试ID映射修复效果
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const testIdMapping = async () => {
  console.log('🔧 测试ID映射修复效果...\n');

  try {
    // 1. 获取一个测试用的学生档案
    const { data: profiles, error: profilesError } = await supabase
      .from('student_profiles')
      .select('*')
      .limit(3);

    if (profilesError || !profiles || profiles.length === 0) {
      console.error('获取学生档案失败:', profilesError?.message);
      return;
    }

    console.log('📋 找到的学生档案:');
    profiles.forEach(profile => {
      console.log(`- 档案ID: ${profile.id}, 用户ID: ${profile.user_id}, 姓名: ${profile.full_name}`);
    });

    // 2. 测试映射函数
    const profileIds = profiles.map(p => p.id);
    console.log('\n📋 要映射的档案ID:', profileIds);

    const { data: mapping, error: mappingError } = await supabase
      .from('student_profiles')
      .select('id, user_id')
      .in('id', profileIds);

    if (mappingError) {
      console.error('映射查询失败:', mappingError);
      return;
    }

    const idMap = {};
    mapping.forEach(profile => {
      idMap[profile.id] = profile.user_id;
    });

    const userIds = profileIds.map(profileId => idMap[profileId] || profileId);
    console.log('📋 映射后的用户ID:', userIds);

    // 3. 验证映射的正确性
    console.log('\n📋 验证映射正确性:');
    for (let i = 0; i < profiles.length; i++) {
      const profile = profiles[i];
      const mappedUserId = userIds[i];
      const isCorrect = mappedUserId === profile.user_id;
      console.log(`档案ID ${profile.id} -> 用户ID ${mappedUserId} ${isCorrect ? '✅' : '❌'}`);
    }

    // 4. 测试API调用
    if (userIds.length > 0) {
      console.log('\n📋 测试培养方案分配API:');
      const testResponse = await fetch('http://localhost:3001/api/teacher/00000000-0000-0000-0000-000000000001/batch-assign-training-program', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          programId: '00000000-0000-0000-0000-000000000001',
          studentIds: userIds.slice(0, 1), // 只测试一个学生
          notes: 'ID映射修复测试'
        })
      });

      const result = await testResponse.json();
      console.log('API测试结果:', result.success ? '✅ 成功' : '❌ 失败');
      console.log('详细信息:', result.data?.message || result.message);
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
};

testIdMapping();