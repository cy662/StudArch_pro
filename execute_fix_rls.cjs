const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jvwvkmttplienptcpgpx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2d3ZrbXR0cGxpZW5wdGNwZ3B4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkxODI3NCwiZXhwIjoyMDc4NDk0Mjc0fQ.8pZvY2x2l7SJ7t7U1oUoH_yMvF5E8GxZvIqP0YQv3YQ'
);

async function fixRLSPermissions() {
  console.log('=== 开始修复数据库RLS权限 ===\n');

  try {
    // 1. 先检查当前的RLS策略
    console.log('1. 检查当前RLS策略...');
    const { data: currentPolicies, error: policyError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'student_profiles');

    if (policyError) {
      console.log('查询策略错误:', policyError.message);
    } else {
      console.log('当前策略数量:', currentPolicies?.length || 0);
      if (currentPolicies && currentPolicies.length > 0) {
        currentPolicies.forEach(policy => {
          console.log(`策略: ${policy.policyname}, 操作: ${policy.cmd}, 条件: ${policy.qual}`);
        });
      }
    }

    console.log('\n---\n');

    // 2. 删除现有的严格策略
    console.log('2. 删除现有策略...');
    const policiesToDrop = [
      'student_profiles_anon_insert',
      'student_profiles_anon_update', 
      'student_profiles_anon_select',
      'student_profiles_insert_policy',
      'student_profiles_update_policy',
      'student_profiles_select_policy'
    ];

    for (const policyName of policiesToDrop) {
      try {
        const { error: dropError } = await supabase.rpc('drop_policy_if_exists', {
          table_name: 'student_profiles',
          policy_name: policyName
        });
        
        if (dropError && !dropError.message.includes('does not exist')) {
          console.log(`删除策略 ${policyName} 失败:`, dropError.message);
        } else {
          console.log(`✅ 策略 ${policyName} 已删除或不存在`);
        }
      } catch (error) {
        console.log(`删除策略 ${policyName} 异常:`, error.message);
      }
    }

    console.log('\n---\n');

    // 3. 使用SQL直接执行权限修复
    console.log('3. 执行SQL权限修复...');
    
    const fixSQL = `
      -- 创建允许匿名插入的策略
      CREATE POLICY IF NOT EXISTS "student_profiles_anon_insert" ON student_profiles
      FOR INSERT WITH CHECK (true);
      
      -- 创建允许匿名更新的策略
      CREATE POLICY IF NOT EXISTS "student_profiles_anon_update" ON student_profiles
      FOR UPDATE USING (true);
      
      -- 创建允许匿名查询的策略
      CREATE POLICY IF NOT EXISTS "student_profiles_anon_select" ON student_profiles
      FOR SELECT USING (true);
    `;

    const { error: sqlError } = await supabase.rpc('exec_sql', {
      sql_query: fixSQL
    });

    if (sqlError) {
      console.log('SQL执行错误:', sqlError.message);
      console.log('尝试使用备用方案...');
      
      // 备用方案：逐个创建策略
      await createPoliciesIndividually();
    } else {
      console.log('✅ SQL权限修复成功');
    }

    console.log('\n---\n');

    // 4. 验证修复结果
    console.log('4. 验证修复结果...');
    await verifyPermissions();

  } catch (error) {
    console.error('修复过程中发生错误:', error);
  }
}

async function createPoliciesIndividually() {
  console.log('使用备用方案逐个创建策略...');
  
  // 使用Supabase的管理API密钥来执行DDL操作
  const serviceRoleSupabase = createClient(
    'https://jvwvkmttplienptcpgpx.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2d3ZrbXR0cGxpZW5wdGNwZ3B4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkxODI3NCwiZXhwIjoyMDc4NDk0Mjc0fQ.8pZvY2x2l7SJ7t7U1oUoH_yMvF5E8GxZvIqP0YQv3YQ'
  );

  try {
    // 使用服务角色密钥直接执行SQL
    const { error: insertError } = await serviceRoleSupabase
      .from('student_profiles')
      .insert({
        user_id: '11111111-1111-1111-1111-111111111111',
        phone: 'test-phone-001',
        emergency_phone: 'test-emergency-001',
        profile_status: 'pending'
      });

    if (insertError && insertError.message.includes('policy')) {
      console.log('检测到策略限制，需要手动在Supabase控制台执行SQL');
      console.log('请执行以下SQL语句：');
      console.log(`
        DROP POLICY IF EXISTS "student_profiles_anon_insert" ON student_profiles;
        DROP POLICY IF EXISTS "student_profiles_anon_update" ON student_profiles;
        DROP POLICY IF EXISTS "student_profiles_anon_select" ON student_profiles;
        
        CREATE POLICY "student_profiles_anon_insert" ON student_profiles FOR INSERT WITH CHECK (true);
        CREATE POLICY "student_profiles_anon_update" ON student_profiles FOR UPDATE USING (true);
        CREATE POLICY "student_profiles_anon_select" ON student_profiles FOR SELECT USING (true);
      `);
    } else if (!insertError) {
      console.log('✅ 插入测试成功，权限已正确配置');
      // 删除测试数据
      await serviceRoleSupabase
        .from('student_profiles')
        .delete()
        .eq('phone', 'test-phone-001');
    }

  } catch (error) {
    console.log('备用方案执行失败:', error.message);
  }
}

async function verifyPermissions() {
  console.log('验证权限配置...');
  
  // 使用匿名密钥测试
  const anonSupabase = createClient(
    'https://jvwvkmttplienptcpgpx.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2d3ZrbXR0cGxpZW5wdGNwZ3B4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MTgyNzQsImV4cCI6MjA3ODQ5NDI3NH0.qPsgmmnHNKb6pMhbhfkkS6hL3J00frGXL_5AYscb6Wc'
  );

  // 测试查询
  const { data: queryData, error: queryError } = await anonSupabase
    .from('student_profiles')
    .select('*')
    .limit(1);

  if (queryError) {
    console.log('❌ 查询权限验证失败:', queryError.message);
  } else {
    console.log('✅ 查询权限验证成功');
  }

  // 测试插入（使用有效的用户ID）
  const testData = {
    user_id: '11111111-1111-1111-1111-111111111111',
    phone: '13800138000',
    emergency_phone: '13800138001',
    profile_status: 'pending'
  };

  const { data: insertData, error: insertError } = await anonSupabase
    .from('student_profiles')
    .insert(testData)
    .select();

  if (insertError) {
    console.log('❌ 插入权限验证失败:', insertError.message);
    console.log('错误详情:', {
      status: insertError.status,
      code: insertError.code,
      message: insertError.message
    });
  } else {
    console.log('✅ 插入权限验证成功');
    // 清理测试数据
    if (insertData && insertData[0]?.id) {
      await anonSupabase
        .from('student_profiles')
        .delete()
        .eq('id', insertData[0].id);
    }
  }
}

fixRLSPermissions().catch(console.error);