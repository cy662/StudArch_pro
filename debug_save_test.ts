import { supabase } from './src/lib/supabase'

// 调试脚本：测试数据库连接和保存功能
async function debugSaveTest() {
  console.log('=== 开始调试保存功能 ===')
  
  // 测试用户ID
  const testUserId = 'test-user-id-123'
  
  console.log('1. 测试Supabase连接...')
  try {
    // 测试连接
    const { data: authData, error: authError } = await supabase.auth.getSession()
    console.log('认证状态:', authData.session ? '已认证' : '未认证')
    if (authError) {
      console.error('认证错误:', authError)
    }
  } catch (error) {
    console.error('连接测试失败:', error)
  }
  
  console.log('2. 测试查询学生个人信息...')
  try {
    const { data, error } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', testUserId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('学生个人信息不存在（正常）')
      } else {
        console.error('查询错误:', error)
      }
    } else {
      console.log('查询成功:', data)
    }
  } catch (error) {
    console.error('查询异常:', error)
  }
  
  console.log('3. 测试插入学生个人信息...')
  try {
    const testProfileData = {
      user_id: testUserId,
      gender: 'male',
      birth_date: '2000-01-01',
      id_card: '11010120000101001X',
      nationality: '汉族',
      political_status: '团员',
      phone: '13800138000',
      emergency_contact: '李建国',
      emergency_phone: '13800138001',
      home_address: '北京市朝阳区建国路100号',
      admission_date: '2021-09-01',
      graduation_date: '2025-06-30',
      student_type: '全日制',
      profile_status: 'pending',
      edit_count: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    console.log('插入数据:', testProfileData)
    
    const { data, error } = await supabase
      .from('student_profiles')
      .insert(testProfileData)
      .select()
      .single()
    
    if (error) {
      console.error('插入错误:', error)
      
      // 尝试不带select的插入
      const { error: insertError } = await supabase
        .from('student_profiles')
        .insert(testProfileData)
      
      if (insertError) {
        console.error('简版插入错误:', insertError)
      } else {
        console.log('简版插入成功')
      }
    } else {
      console.log('插入成功:', data)
    }
  } catch (error) {
    console.error('插入异常:', error)
  }
  
  console.log('4. 验证插入结果...')
  try {
    const { data, error } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', testUserId)
      .single()
    
    if (error) {
      console.error('验证查询错误:', error)
    } else {
      console.log('验证成功，数据已保存:')
      console.log('手机号:', data?.phone)
      console.log('紧急联系人:', data?.emergency_contact)
      console.log('家庭地址:', data?.home_address)
    }
  } catch (error) {
    console.error('验证异常:', error)
  }
  
  console.log('=== 调试完成 ===')
}

// 执行调试
debugSaveTest().catch(console.error)