import dotenv from 'dotenv';

dotenv.config();

async function testApiFix() {
  console.log('🔍 测试API修复...\n');

  try {
    // 1. 获取一个学生档案ID（profile ID）
    console.log('1. 获取学生档案ID...');
    
    // 使用fetch直接调用API获取学生列表
    const response = await fetch('http://localhost:5173/api/students/profiles');
    if (!response.ok) {
      console.error('❌ 获取学生档案失败:', response.status, response.statusText);
      return;
    }
    
    const profiles = await response.json();
    
    if (!profiles || profiles.length === 0) {
      console.error('❌ 没有找到学生档案');
      return;
    }
    
    const profile = profiles[0];
    console.log(`✅ 档案ID: ${profile.id}`);
    console.log(`✅ 用户ID: ${profile.user_id}`);
    
    // 2. 获取一个培养方案
    console.log('\n2. 获取培养方案...');
    const programResponse = await fetch('http://localhost:5173/api/training-programs');
    if (!programResponse.ok) {
      console.error('❌ 获取培养方案失败:', programResponse.status, programResponse.statusText);
      return;
    }
    
    const programs = await programResponse.json();
    
    if (!programs || programs.length === 0) {
      console.error('❌ 没有找到培养方案');
      return;
    }
    
    const programId = programs[0].id;
    console.log(`✅ 培养方案ID: ${programId}`);
    
    // 3. 测试分配功能
    console.log('\n3. 测试培养方案分配...');
    
    // 模拟教师ID（使用一个固定的测试ID）
    const teacherId = '00000000-0000-0000-0000-000000000001';
    
    // 使用档案ID进行分配测试（这是前端实际传递的ID）
    const assignResponse = await fetch(`http://localhost:5173/api/teacher/${teacherId}/batch-assign-training-program`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        programId: programId,
        studentIds: [profile.id], // 使用档案ID（前端显示的ID）
        notes: 'API修复测试'
      }),
    });
    
    const result = await assignResponse.json();
    console.log(`分配响应状态: ${assignResponse.status}`);
    
    if (result.success) {
      console.log('✅ 培养方案分配成功！');
      console.log(`   成功分配: ${result.data.success_count} 名学生`);
      console.log(`   分配失败: ${result.data.failure_count} 名学生`);
    } else {
      console.error('❌ 培养方案分配失败:', result.message);
    }
    
    console.log('\n🎉 API修复测试完成！');
    
  } catch (error) {
    console.error('测试过程中出现错误:', error);
  }
}

testApiFix();