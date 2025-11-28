const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function check2023015701Status() {
  console.log('=== 检查2023015701账号数据状态 ===');
  
  try {
    // 1. 查找2023015701的用户记录
    console.log('\n1. 查找2023015701的用户记录...');
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('user_number', '2023015701');
      
    if (userError) {
      console.error('查询用户失败:', userError);
      return;
    }
    
    console.log('用户记录数量:', users.length);
    if (users.length === 0) {
      console.log('❌ 未找到学号2023015701的用户记录');
      return;
    }
    
    const user = users[0];
    console.log('✅ 找到用户:', {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      user_number: user.user_number,
      role_id: user.role_id
    });
    
    // 2. 查找学生档案
    console.log('\n2. 查找学生档案...');
    const { data: profiles, error: profileError } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', user.id);
      
    if (profileError) {
      console.error('查询档案失败:', profileError);
      return;
    }
    
    console.log('档案记录数量:', profiles.length);
    if (profiles.length === 0) {
      console.log('❌ 未找到学生档案');
      
      // 尝试创建档案
      console.log('\n3. 尝试创建学生档案...');
      const { data: newProfile, error: createError } = await supabase
        .from('student_profiles')
        .insert({
          user_id: user.id,
          full_name: user.full_name || user.username,
          student_number: user.user_number,
          academic_status: '在读',
          department: '计算机学院',
          enrollment_year: '2023',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
        
      if (createError) {
        console.error('创建档案失败:', createError);
      } else {
        console.log('✅ 成功创建档案:', newProfile[0].id);
        profiles.push(newProfile[0]);
      }
    } else {
      console.log('✅ 找到档案:', profiles[0].id);
    }
    
    if (profiles.length > 0) {
      const profile = profiles[0];
      
      // 3. 检查是否已在教师管理列表中
      console.log('\n4. 检查教师-学生关联...');
      const teacherId = '00000000-0000-0000-0000-000000000001';
      const { data: teacherStudent, error: relationError } = await supabase
        .from('teacher_students')
        .select('*')
        .eq('teacher_id', teacherId)
        .eq('student_id', user.id);
        
      if (relationError) {
        console.error('查询教师-学生关联失败:', relationError);
      } else {
        console.log('教师-学生关联记录数量:', teacherStudent.length);
        if (teacherStudent.length === 0) {
          console.log('❌ 学生不在教师管理列表中');
          
          // 尝试添加到教师管理列表
          console.log('\n5. 尝试添加到教师管理列表...');
          const { data: newRelation, error: addError } = await supabase
            .from('teacher_students')
            .insert({
              teacher_id: teacherId,
              student_id: user.id,
              created_at: new Date().toISOString()
            })
            .select();
            
          if (addError) {
            console.error('添加到教师管理列表失败:', addError);
          } else {
            console.log('✅ 成功添加到教师管理列表');
          }
        } else {
          console.log('✅ 学生已在教师管理列表中');
        }
      }
      
      // 4. 尝试分配培养方案
      console.log('\n6. 尝试分配培养方案...');
      const programId = '62b2cc69-5b10-4238-8232-59831cdb7964';
      
      const { data: existingAssignment, error: checkError } = await supabase
        .from('student_training_programs')
        .select('*')
        .eq('student_id', profile.id)
        .eq('program_id', programId);
        
      if (checkError) {
        console.error('检查现有分配失败:', checkError);
      } else {
        if (existingAssignment.length === 0) {
          console.log('创建新的培养方案分配...');
          const { data: newAssignment, error: assignError } = await supabase
            .from('student_training_programs')
            .insert({
              student_id: profile.id,
              program_id: programId,
              teacher_id: teacherId,
              enrollment_date: new Date().toISOString().split('T')[0],
              status: 'active',
              notes: '手动分配培养方案',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select();
            
          if (assignError) {
            console.error('❌ 分配培养方案失败:', assignError);
          } else {
            console.log('✅ 成功分配培养方案:', newAssignment[0].id);
          }
        } else {
          console.log('✅ 已有培养方案分配记录');
        }
      }
    }
    
  } catch (error) {
    console.error('检查过程中出错:', error);
  }
}

check2023015701Status().catch(console.error);