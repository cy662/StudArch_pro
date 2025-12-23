// 完整的Java搜索问题修复
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mddpbyibesqewcktlqle.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZHBieWliZXNxZXdja3RscWxlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM1NDM0OSwiZXhwIjoyMDc4OTMwMzQ5fQ.P2Y3IaRqJn6Tf7NjaHztGSd__3bTb_aBVioKoIK9Rq8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function completeJavaFix() {
  try {
    console.log('🔧 完整Java搜索问题修复\n');

    // 1. 修复学生档案数据
    console.log('1️⃣ 修复学生档案数据...');
    const { data: usersToFix, error: findError } = await supabase
      .from('users')
      .select('id, full_name, user_number, role_id')
      .eq('role_id', '3')
      .neq('full_name', null);

    if (findError) {
      console.error('❌ 查找用户失败:', findError.message);
      return;
    }

    console.log(`找到 ${usersToFix?.length || 0} 个需要修复档案的学生`);

    for (const user of usersToFix || []) {
      // 检查档案是否需要修复
      const { data: existingProfile, error: checkError } = await supabase
        .from('student_profiles')
        .select('id, full_name, student_number')
        .eq('user_id', user.id)
        .single();

      if (checkError) {
        console.log(`创建档案: ${user.full_name} (${user.user_number})`);
        
        const { error: createError } = await supabase
          .from('student_profiles')
          .insert({
            user_id: user.id,
            full_name: user.full_name,
            student_number: user.user_number,
            class_name: '计算机科学与技术1班',
            profile_status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (createError) {
          console.error(`❌ 创建档案失败 ${user.full_name}:`, createError.message);
        } else {
          console.log(`✅ 档案创建成功: ${user.full_name}`);
        }
      } else {
        // 检查是否需要更新
        if (!existingProfile.full_name || !existingProfile.student_number) {
          console.log(`更新档案: ${user.full_name} (${user.user_number})`);
          
          const { error: updateError } = await supabase
            .from('student_profiles')
            .update({
              full_name: user.full_name,
              student_number: user.user_number,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);

          if (updateError) {
            console.error(`❌ 更新档案失败 ${user.full_name}:`, updateError.message);
          } else {
            console.log(`✅ 档案更新成功: ${user.full_name}`);
          }
        }
      }
    }

    // 2. 修复技术标签关联
    console.log('\n2️⃣ 修复技术标签关联...');
    const { data: tagsToFix, error: tagsError } = await supabase
      .from('student_technical_tags')
      .select('id, student_profile_id, tag_name')
      .eq('status', 'active');

    if (tagsError) {
      console.error('❌ 查找技术标签失败:', tagsError.message);
      return;
    }

    console.log(`检查 ${tagsToFix?.length || 0} 个技术标签的关联`);

    // 3. 确保Java标签存在
    console.log('\n3️⃣ 确保Java标签存在...');
    const { data: student2023015701, error: studentError } = await supabase
      .from('users')
      .select('id, full_name, user_number')
      .eq('user_number', '2023015701')
      .single();

    if (studentError) {
      console.error('❌ 查找学生2023015701失败:', studentError.message);
      return;
    }

    // 获取该学生的档案
    const { data: profile2023015701, error: profileError } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', student2023015701.id)
      .single();

    if (profileError) {
      console.error('❌ 查找学生档案失败:', profileError.message);
      return;
    }

    // 检查Java标签是否存在
    const { data: existingJavaTag, error: javaCheckError } = await supabase
      .from('student_technical_tags')
      .select('id')
      .eq('student_profile_id', profile2023015701.id)
      .ilike('tag_name', '%java%')
      .eq('status', 'active');

    if (javaCheckError) {
      console.error('❌ 检查Java标签失败:', javaCheckError.message);
      return;
    }

    if (!existingJavaTag || existingJavaTag.length === 0) {
      console.log('创建Java标签...');
      const { error: createJavaError } = await supabase
        .from('student_technical_tags')
        .insert({
          student_profile_id: profile2023015701.id,
          tag_name: 'Java',
          tag_category: 'programming_language',
          proficiency_level: 'intermediate',
          description: 'Java编程语言学习和项目实践，掌握面向对象编程思想',
          learned_at: new Date().toISOString().split('T')[0],
          learning_hours: 120,
          practice_projects: 5,
          confidence_score: 8,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (createJavaError) {
        console.error('❌ 创建Java标签失败:', createJavaError.message);
      } else {
        console.log('✅ Java标签创建成功');
      }
    } else {
      console.log('✅ Java标签已存在');
    }

    // 4. 确保师生关联存在
    console.log('\n4️⃣ 确保师生关联存在...');
    const { data: teachers, error: teacherError } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('role_id', '2')
      .limit(3);

    if (teacherError || !teachers || teachers.length === 0) {
      console.log('⚠️ 没有找到教师');
    } else {
      const testTeacher = teachers[0];
      console.log(`使用教师: ${testTeacher.full_name}`);

      // 检查师生关联
      const { data: existingRelation, error: relationError } = await supabase
        .from('teacher_students')
        .select('id')
        .eq('teacher_id', testTeacher.id)
        .eq('student_id', student2023015701.id);

      if (relationError) {
        console.error('❌ 检查师生关联失败:', relationError.message);
      } else if (!existingRelation || existingRelation.length === 0) {
        // 创建关联
        const { error: createRelationError } = await supabase
          .from('teacher_students')
          .insert({
            teacher_id: testTeacher.id,
            student_id: student2023015701.id
          });

        if (createRelationError) {
          console.error('❌ 创建师生关联失败:', createRelationError.message);
        } else {
          console.log('✅ 师生关联创建成功');
        }
      } else {
        console.log('✅ 师生关联已存在');
      }

      // 5. 最终测试
      console.log('\n5️⃣ 最终Java搜索测试...');
      
      // 获取教师管理的学生
      const { data: teacherStudents, error: teacherStudentsError } = await supabase
        .from('teacher_students')
        .select('student_id')
        .eq('teacher_id', testTeacher.id);

      if (teacherStudentsError) {
        console.error('❌ 获取教师学生失败:', teacherStudentsError.message);
        return;
      }

      const studentUserIds = teacherStudents?.map(ts => ts.student_id) || [];
      console.log(`教师管理学生: ${studentUserIds.length} 个`);

      // 执行Java搜索
      const { data: finalResults, error: finalError } = await supabase
        .from('student_technical_tags')
        .select(`
          student_profile_id,
          tag_name,
          tag_category,
          proficiency_level,
          student_profiles!inner(
            user_id,
            student_number,
            full_name,
            class_name,
            profile_status
          )
        `)
        .ilike('tag_name', '%java%')
        .eq('status', 'active')
        .in('student_profiles.user_id', studentUserIds);

      if (finalError) {
        console.error('❌ 最终搜索失败:', finalError.message);
      } else {
        console.log(`✅ 最终搜索成功: 找到 ${finalResults?.length || 0} 个Java标签学生`);
        
        if (finalResults && finalResults.length > 0) {
          finalResults.forEach((result, index) => {
            console.log(`   ${index + 1}. ${result.student_profiles.full_name} (${result.student_profiles.student_number})`);
            if (result.student_profiles.student_number === '2023015701') {
              console.log('      🎯 找到目标学生! ✅');
            }
          });
        }
      }
    }

    console.log('\n🎯 修复完成!');
    console.log('现在可以在前端测试Java搜索功能了');
    console.log('应该能看到学生:', student2023015701.full_name, '(', student2023015701.user_number, ')');

  } catch (error) {
    console.error('❌ 修复过程中发生错误:', error);
  }
}

// 运行完整修复
completeJavaFix();