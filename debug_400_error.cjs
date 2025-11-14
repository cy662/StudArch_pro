const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jvwvkmttplienptcpgpx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2d3ZrbXR0cGxpZW5wdGNwZ3B4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MTgyNzQsImV4cCI6MjA3ODQ5NDI3NH0.qPsgmmnHNKb6pMhbhfkkS6hL3J00frGXL_5AYscb6Wc'
);

async function testDatabaseOperations() {
  console.log('=== 开始测试数据库操作 ===\n');

  // 1. 测试查询操作
  console.log('1. 测试查询操作...');
  const { data: queryData, error: queryError } = await supabase
    .from('student_profiles')
    .select('*')
    .limit(1);
  
  console.log('查询结果:', queryError ? '错误' : '成功');
  if (queryError) {
    console.log('查询错误详情:');
    console.log('状态码:', queryError.status);
    console.log('错误代码:', queryError.code);
    console.log('错误消息:', queryError.message);
    console.log('详细信息:', queryError.details);
  } else {
    console.log('查询到的数据条数:', queryData?.length || 0);
  }

  console.log('\n---\n');

  // 2. 测试插入操作（使用有效的UUID）
  console.log('2. 测试插入操作...');
  const testInsertData = {
    user_id: '11111111-1111-1111-1111-111111111111', // 使用数据库中存在的用户ID
    gender: 'male',
    phone: '13800138000',
    emergency_phone: '13800138001',
    home_address: '测试地址',
    profile_status: 'pending',
    edit_count: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data: insertData, error: insertError } = await supabase
    .from('student_profiles')
    .insert(testInsertData)
    .select();

  console.log('插入结果:', insertError ? '错误' : '成功');
  if (insertError) {
    console.log('插入错误详情:');
    console.log('状态码:', insertError.status);
    console.log('错误代码:', insertError.code);
    console.log('错误消息:', insertError.message);
    console.log('详细信息:', insertError.details);
    
    // 如果是权限问题，尝试检查RLS策略
    if (insertError.code === '42501' || insertError.message.includes('policy')) {
      console.log('\n⚠️ 检测到RLS权限问题，需要检查数据库权限设置');
    }
    
    // 如果是类型错误，检查字段类型
    if (insertError.code === '22P02' || insertError.message.includes('invalid input')) {
      console.log('\n⚠️ 检测到数据类型错误，检查字段格式');
    }
  } else {
    console.log('插入成功，返回数据:', insertData);
  }

  console.log('\n---\n');

  // 3. 测试更新操作
  console.log('3. 测试更新操作...');
  
  // 先尝试获取一个存在的记录ID
  const { data: existingData, error: existingError } = await supabase
    .from('student_profiles')
    .select('id')
    .limit(1);
  
  if (existingError) {
    console.log('获取现有记录失败:', existingError.message);
  } else if (existingData && existingData.length > 0) {
    const profileId = existingData[0].id;
    console.log('找到记录ID:', profileId);
    
    const { data: updateData, error: updateError } = await supabase
      .from('student_profiles')
      .update({ 
        phone: '13800138002',
        updated_at: new Date().toISOString()
      })
      .eq('id', profileId)
      .select();
    
    console.log('更新结果:', updateError ? '错误' : '成功');
    if (updateError) {
      console.log('更新错误详情:');
      console.log('状态码:', updateError.status);
      console.log('错误代码:', updateError.code);
      console.log('错误消息:', updateError.message);
      console.log('详细信息:', updateError.details);
    } else {
      console.log('更新成功，返回数据:', updateData);
    }
  } else {
    console.log('没有找到现有记录，跳过更新测试');
  }

  console.log('\n=== 测试完成 ===');
}

testDatabaseOperations().catch(console.error);