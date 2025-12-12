import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Supabase配置
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少Supabase配置');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testIdMappingFix() {
  console.log('🔍 测试ID映射修复...\n');

  try {
    // 1. 获取一个学生档案ID（profile ID）
    console.log('1. 获取学生档案ID...');
    const { data: profiles, error: profileError } = await supabase
      .from('student_profiles')
      .select('id, user_id')
      .limit(1);

    if (profileError) {
      console.error('❌ 获取学生档案失败:', profileError.message);
      return;
    }

    if (!profiles || profiles.length === 0) {
      console.error('❌ 没有找到学生档案');
      return;
    }

    const profile = profiles[0];
    console.log(`✅ 档案ID: ${profile.id}`);
    console.log(`✅ 用户ID: ${profile.user_id}`);

    // 2. 模拟前端的ID映射函数
    console.log('\n2. 测试ID映射函数...');
    const profileIds = [profile.id];
    
    // 这是我们添加到前端的函数
    const mapProfileIdsToUserIds = async (profileIds) => {
      try {
        const { data, error } = await supabase
          .from('student_profiles')
          .select('id, user_id')
          .in('id', profileIds);

        if (error) {
          console.error('查询档案映射失败:', error);
          return profileIds;
        }

        const idMap = {};
        data.forEach(profile => {
          idMap[profile.id] = profile.user_id;
        });

        return profileIds.map(profileId => idMap[profileId] || profileId);
      } catch (error) {
        console.error('映射档案ID到用户ID失败:', error);
        return profileIds;
      }
    };

    const userIds = await mapProfileIdsToUserIds(profileIds);
    console.log(`✅ 映射结果: ${profileIds[0]} -> ${userIds[0]}`);
    
    // 3. 验证映射是否正确
    if (userIds[0] === profile.user_id) {
      console.log('✅ ID映射正确！');
    } else {
      console.error('❌ ID映射错误！');
      return;
    }

    // 4. 测试分配功能
    console.log('\n3. 测试培养方案分配...');
    
    // 获取一个培养方案
    const { data: programs, error: programError } = await supabase
      .from('training_programs')
      .select('id')
      .eq('status', 'active')
      .limit(1);

    if (programError) {
      console.error('❌ 获取培养方案失败:', programError.message);
      return;
    }

    if (!programs || programs.length === 0) {
      console.error('❌ 没有找到培养方案');
      return;
    }

    const programId = programs[0].id;
    console.log(`✅ 培养方案ID: ${programId}`);

    // 使用修复后的分配函数进行测试
    const teacherId = '00000000-0000-0000-0000-000000000001';
    
    const response = await fetch(`http://localhost:3001/api/teacher/${teacherId}/batch-assign-training-program`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        programId: programId,
        studentIds: userIds, // 使用映射后的用户ID
        notes: 'ID映射修复测试'
      }),
    });

    const result = await response.json();
    console.log(`分配响应状态: ${response.status}`);
    
    if (result.success) {
      console.log('✅ 培养方案分配成功！');
      console.log(`   成功分配: ${result.data.success_count} 名学生`);
      console.log(`   分配失败: ${result.data.failure_count} 名学生`);
    } else {
      console.error('❌ 培养方案分配失败:', result.message);
    }

    console.log('\n🎉 ID映射修复测试完成！');
    
  } catch (error) {
    console.error('测试过程中出现错误:', error);
  }
}

testIdMappingFix();