// 学生学习信息API路由
import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Supabase配置 - 使用真实的数据库配置
const supabaseUrl = 'https://mddpbyibesqewcktlqle.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZHBieWliZXNxZXdja3RscWxlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM1NDM0OSwiZXhwIjoyMDc4OTMwMzQ5fQ.P2Y3IaRqJn6Tf7NjaHztGSd__3bTb_aBVioKoIK9Rq8';
const supabase = createClient(supabaseUrl, supabaseKey);



// 通用错误处理函数
const handleApiError = (error, res, message = '操作失败') => {
  console.error(message, error);
  return res.status(500).json({
    success: false,
    message,
    error: error.message
  });
};

// 验证student_profile_id是否存在
const validateStudentProfile = async (studentProfileId) => {
  try {
    const { data, error } = await supabase
      .from('student_profiles')
      .select('id, full_name, class_name')
      .eq('id', studentProfileId)
      .single();

    if (error || !data) {
      console.error('学生档案验证失败:', error?.message || '数据不存在');
      return { valid: false, error: '学生档案不存在: ' + (error?.message || '未知错误') };
    }

    return { valid: true, student: data };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

// 创建缺失表的函数
const createMissingTables = async () => {
  try {
    // 创建学生技术标签表
    const { error: tagError } = await supabase.rpc('create_student_technical_tags_table');
    if (tagError && tagError.code !== 'PGRST116') {
      console.warn('创建student_technical_tags表失败:', tagError.message);
    }
    
    // 创建学生学习收获表
    const { error: achievementError } = await supabase.rpc('create_student_learning_achievements_table');
    if (achievementError && achievementError.code !== 'PGRST116') {
      console.warn('创建student_learning_achievements表失败:', achievementError.message);
    }
    
    // 创建学生学习成果表
    const { error: outcomeError } = await supabase.rpc('create_student_learning_outcomes_table');
    if (outcomeError && outcomeError.code !== 'PGRST116') {
      console.warn('创建student_learning_outcomes表失败:', outcomeError.message);
    }
    

  } catch (error) {
    console.warn('创建表的过程中出错:', error.message);
  }
};

// 1. 添加技术标签
router.post('/student-learning/add-technical-tag', async (req, res) => {
  try {
    const { student_profile_id, tag_name, tag_category, proficiency_level = 'intermediate', learned_at, description } = req.body;

    // 验证必填字段
    if (!student_profile_id || !tag_name) {
      return res.status(400).json({
        success: false,
        message: '缺少必填字段：student_profile_id, tag_name'
      });
    }

    // 验证学生档案
    const validation = await validateStudentProfile(student_profile_id);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    try {
      // 尝试从数据库检查标签是否已存在
      const { data: existingTag, error: checkError } = await supabase
        .from('student_technical_tags')
        .select('id')
        .eq('student_profile_id', student_profile_id)
        .eq('tag_name', tag_name)
        .eq('status', 'active')
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingTag) {
        return res.status(400).json({
          success: false,
          message: '该技术标签已存在'
        });
      }
    } catch (dbError) {
      console.warn('数据库连接失败，使用临时存储:', dbError.message);
    }

    // 直接插入到数据库
    const { data, error } = await supabase
      .from('student_technical_tags')
      .insert({
        student_profile_id,
        tag_name,
        tag_category: tag_category || 'other',
        proficiency_level,
        learned_at: learned_at || new Date().toISOString().split('T')[0],
        description,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return handleApiError(error, res, '添加技术标签失败');
    }

    console.log('✅ 技术标签已保存到数据库:', tag_name);
    res.json({
      success: true,
      message: '技术标签添加成功',
      data
    });

  } catch (error) {
    handleApiError(error, res, '添加技术标签时发生错误');
  }
});

// 2. 添加学习收获
router.post('/student-learning/add-learning-achievement', async (req, res) => {
  try {
    const {
      student_profile_id,
      title,
      content,
      achievement_type = 'course_completion',
      achieved_at,
      impact_level = 'medium',
      related_course,
      related_project,
      related_tags,
      application_scenarios,
      future_utilization
    } = req.body;

    // 验证必填字段
    if (!student_profile_id || !title || !content) {
      return res.status(400).json({
        success: false,
        message: '缺少必填字段：student_profile_id, title, content'
      });
    }

    // 验证学生档案
    const validation = await validateStudentProfile(student_profile_id);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    // 直接插入到数据库
    const { data, error } = await supabase
      .from('student_learning_achievements')
      .insert({
        student_profile_id,
        title,
        content,
        achievement_type,
        achieved_at: achieved_at || new Date().toISOString().split('T')[0],
        impact_level,
        related_course,
        related_project,
        related_tags,
        application_scenarios,
        future_utilization,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return handleApiError(error, res, '添加学习收获失败');
    }

    console.log('✅ 学习收获已保存到数据库:', title);
    res.json({
      success: true,
      message: '学习收获添加成功',
      data
    });

  } catch (error) {
    handleApiError(error, res, '添加学习收获时发生错误');
  }
});

// 3. 添加学习成果
router.post('/student-learning/add-learning-outcome', async (req, res) => {
  try {
    const {
      student_profile_id,
      outcome_title,
      outcome_description,
      outcome_type = 'course_project',
      start_date,
      completion_date,
      difficulty_level = 'intermediate',
      completion_status = 'in_progress',
      quality_rating = 3,
      demonstration_url,
      project_team,
      role_description,
      related_course
    } = req.body;

    // 验证必填字段
    if (!student_profile_id || !outcome_title) {
      return res.status(400).json({
        success: false,
        message: '缺少必填字段：student_profile_id, outcome_title'
      });
    }

    // 验证学生档案
    const validation = await validateStudentProfile(student_profile_id);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    // 直接插入到数据库
    const { data, error } = await supabase
      .from('student_learning_outcomes')
      .insert({
        student_profile_id,
        outcome_title,
        outcome_description,
        outcome_type,
        start_date: start_date || new Date().toISOString().split('T')[0],
        completion_date,
        difficulty_level,
        completion_status,
        quality_rating,
        demonstration_url,
        project_team,
        role_description,
        related_course, // 添加课程关联字段
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return handleApiError(error, res, '添加学习成果失败');
    }

    console.log('✅ 学习成果已保存到数据库:', outcome_title);
    res.json({
      success: true,
      message: '学习成果添加成功',
      data
    });

  } catch (error) {
    handleApiError(error, res, '添加学习成果时发生错误');
  }
});



// 5. 获取学生学习信息汇总
router.get('/student-learning/get-summary/:student_profile_id', async (req, res) => {
  try {
    const { student_profile_id } = req.params;

    if (!student_profile_id) {
      return res.status(400).json({
        success: false,
        message: '缺少学生档案ID'
      });
    }

    // 验证学生档案
    const validation = await validateStudentProfile(student_profile_id);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    // 获取技术标签
    const { data: tags } = await supabase
      .from('student_technical_tags')
      .select('*')
      .eq('student_profile_id', student_profile_id)
      .eq('status', 'active');

    // 获取学习收获
    const { data: achievements } = await supabase
      .from('student_learning_achievements')
      .select('*')
      .eq('student_profile_id', student_profile_id)
      .eq('status', 'active');

    // 获取学习成果
    const { data: outcomes } = await supabase
      .from('student_learning_outcomes')
      .select('*')
      .eq('student_profile_id', student_profile_id)
      .eq('status', 'active');



    res.json({
      success: true,
      message: '获取学生学习信息成功',
      data: {
        student_info: validation.student,
        technical_tags: tags || [],
        learning_achievements: achievements || [],
        learning_outcomes: outcomes || []
      }
    });

  } catch (error) {
    handleApiError(error, res, '获取学生学习信息时发生错误');
  }
});

// 6. 删除技术标签
router.delete('/student-learning/delete-technical-tag/:tag_id', async (req, res) => {
  try {
    const { tag_id } = req.params;

    const { error } = await supabase
      .from('student_technical_tags')
      .update({ 
        status: 'deleted', 
        updated_at: new Date().toISOString() 
      })
      .eq('id', tag_id);

    if (error) {
      return handleApiError(error, res, '删除技术标签失败');
    }

    res.json({
      success: true,
      message: '技术标签删除成功'
    });

  } catch (error) {
    handleApiError(error, res, '删除技术标签时发生错误');
  }
});

// 7. 更新技术标签
router.put('/student-learning/update-technical-tag/:tag_id', async (req, res) => {
  try {
    const { tag_id } = req.params;
    const { proficiency_level, description } = req.body;

    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (proficiency_level) updateData.proficiency_level = proficiency_level;
    if (description !== undefined) updateData.description = description;

    const { data, error } = await supabase
      .from('student_technical_tags')
      .update(updateData)
      .eq('id', tag_id)
      .select()
      .single();

    if (error) {
      return handleApiError(error, res, '更新技术标签失败');
    }

    res.json({
      success: true,
      message: '技术标签更新成功',
      data
    });

  } catch (error) {
    handleApiError(error, res, '更新技术标签时发生错误');
  }
});

// 7. 同步技术标签（更新而非新增）
router.post('/sync-technical-tags', async (req, res) => {
  try {
    const { student_profile_id, course_name, tags } = req.body;
    
    // 验证必填字段
    if (!student_profile_id || !course_name || !tags || !Array.isArray(tags)) {
      return res.status(400).json({
        success: false,
        message: '缺少必填字段：student_profile_id, course_name, tags'
      });
    }

    // 验证学生档案
    const validation = await validateStudentProfile(student_profile_id);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    const results = [];

    // 先查找已存在的标签
    const { data: existingTags, error: fetchError } = await supabase
      .from('student_technical_tags')
      .select('*')
      .eq('student_profile_id', student_profile_id)
      .eq('description', `课程: ${course_name}`)
      .eq('status', 'active');

    if (fetchError) {
      return handleApiError(fetchError, res, '获取现有标签失败');
    }

    const existingTagNames = existingTags.map(tag => tag.tag_name);
    
    // 处理每个标签
    for (const tagName of tags) {
      try {
        if (existingTagNames.includes(tagName)) {
          // 标签已存在，跳过
          const existingTag = existingTags.find(tag => tag.tag_name === tagName);
          results.push({ action: 'existing', data: existingTag });
        } else {
          // 创建新标签
          const { data: newTag, error: insertError } = await supabase
            .from('student_technical_tags')
            .insert({
              student_profile_id,
              tag_name: tagName,
              tag_category: getTagCategory(tagName),
              proficiency_level: 'intermediate',
              learned_at: new Date().toISOString().split('T')[0],
              description: `课程: ${course_name}`,
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (insertError) {
            results.push({ action: 'error', tag: tagName, error: insertError.message });
          } else {
            results.push({ action: 'created', data: newTag });
          }
        }
      } catch (error) {
        results.push({ action: 'error', tag: tagName, error: error.message });
      }
    }

    res.json({
      success: true,
      message: '技术标签同步完成',
      data: results
    });

  } catch (error) {
    handleApiError(error, res, '同步技术标签时发生错误');
  }
});

// 8. 根据课程获取或更新学习收获
router.post('/sync-learning-achievement', async (req, res) => {
  try {
    const { student_profile_id, course_name, content } = req.body;
    
    console.log('📥 收到同步学习收获请求:', { student_profile_id, course_name, content });
    
    // 验证必填字段
    if (!student_profile_id || !course_name) {
      console.log('❌ 缺少必填字段');
      return res.status(400).json({
        success: false,
        message: '缺少必填字段：student_profile_id, course_name'
      });
    }

    // 验证学生档案
    const validation = await validateStudentProfile(student_profile_id);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    let result;

    console.log('🔍 查找现有学习收获:', { student_profile_id, course_name });
    // 先查找是否已存在相同的学习收获
    const { data: existingAchievements, error: fetchError } = await supabase
      .from('student_learning_achievements')
      .select('*')
      .eq('student_profile_id', student_profile_id)
      .eq('related_course', course_name)
      .eq('status', 'active');

    if (fetchError) {
      console.log('❌ 获取现有学习收获失败:', fetchError);
      return handleApiError(fetchError, res, '获取现有学习收获失败');
    }
    console.log('📊 查找结果:', { existingCount: existingAchievements?.length || 0 });

    if (content && content.trim()) {
      if (existingAchievements && existingAchievements.length > 0) {
        // 更新现有记录
        console.log('🔄 更新现有学习收获记录:', { id: existingAchievements[0].id, content });
        const { data: updatedData, error: updateError } = await supabase
          .from('student_learning_achievements')
          .update({
            content: content,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingAchievements[0].id)
          .select()
          .single();

        if (updateError) {
          console.log('❌ 更新学习收获失败:', updateError);
          return handleApiError(updateError, res, '更新学习收获失败');
        }
        
        console.log('✅ 学习收获更新成功:', updatedData);
        result = { action: 'updated', data: updatedData };
      } else {
        // 创建新记录
        const insertData = {
          student_profile_id,
          title: `${course_name} - 学习收获`,
          content: content,
          achievement_type: 'study_reflection',
          related_course: course_name,
          status: 'active',
          achieved_at: new Date().toISOString().split('T')[0],
          impact_level: 'medium',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        console.log('💾 准备创建学习收获记录:', insertData);
        
        const { data: newData, error: insertError } = await supabase
          .from('student_learning_achievements')
          .insert(insertData)
          .select()
          .single();

        if (insertError) {
          console.log('❌ 创建学习收获失败:', insertError);
          return handleApiError(insertError, res, '创建学习收获失败');
        }
        
        console.log('✅ 学习收获创建成功:', newData);
        result = { action: 'created', data: newData };
      }
    } else {
      result = { action: 'skipped', reason: '内容为空' };
    }

    console.log('📤 发送响应:', { success: true, message: '学习收获同步完成', data: result });
    res.json({
      success: true,
      message: '学习收获同步完成',
      data: result
    });

  } catch (error) {
    handleApiError(error, res, '同步学习收获时发生错误');
  }
});

// 9. 根据课程获取或更新学习成果
router.post('/sync-learning-outcome', async (req, res) => {
  try {
    const { student_profile_id, course_name, description, start_date, end_date } = req.body;
    
    // 验证必填字段
    if (!student_profile_id || !course_name) {
      return res.status(400).json({
        success: false,
        message: '缺少必填字段：student_profile_id, course_name'
      });
    }

    // 验证学生档案
    const validation = await validateStudentProfile(student_profile_id);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    let result;

    // 先查找是否已存在相同的学习成果
    const { data: existingOutcomes, error: fetchError } = await supabase
      .from('student_learning_outcomes')
      .select('*')
      .eq('student_profile_id', student_profile_id)
      .eq('related_course', course_name)
      .eq('status', 'active');

    if (fetchError) {
      return handleApiError(fetchError, res, '获取现有学习成果失败');
    }

    if (description && description.trim()) {
      if (existingOutcomes && existingOutcomes.length > 0) {
        // 更新现有记录
        const { data: updatedData, error: updateError } = await supabase
          .from('student_learning_outcomes')
          .update({
            outcome_description: description,
            start_date: start_date || existingOutcomes[0].start_date,
            completion_date: end_date || existingOutcomes[0].completion_date,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingOutcomes[0].id)
          .select()
          .single();

        if (updateError) {
          return handleApiError(updateError, res, '更新学习成果失败');
        }
        
        result = { action: 'updated', data: updatedData };
      } else {
        // 创建新记录
        const { data: newData, error: insertError } = await supabase
          .from('student_learning_outcomes')
          .insert({
            student_profile_id,
            outcome_title: `${course_name} - 学习成果`,
            outcome_description: description,
            outcome_type: 'project',
            start_date: start_date || new Date().toISOString().split('T')[0],
            completion_date: end_date || new Date().toISOString().split('T')[0],
            difficulty_level: 'medium',
            completion_status: 'completed',
            quality_rating: 3,
            related_course: course_name,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) {
          return handleApiError(insertError, res, '创建学习成果失败');
        }
        
        result = { action: 'created', data: newData };
      }
    } else {
      result = { action: 'skipped', reason: '内容为空' };
    }

    res.json({
      success: true,
      message: '学习成果同步完成',
      data: result
    });

  } catch (error) {
    handleApiError(error, res, '同步学习成果时发生错误');
  }
});

// 辅助函数：根据标签名称判断分类
const getTagCategory = (tagName) => {
  const lowerTagName = tagName.toLowerCase();
  
  // 编程语言
  const programmingLanguages = ['javascript', 'typescript', 'python', 'java', 'c++', 'go', 'html/css', 'sql'];
  if (programmingLanguages.some(lang => lowerTagName.includes(lang))) {
    return 'programming_language';
  }
  
  // 框架
  const frameworks = ['react', 'vue', 'angular', 'node.js'];
  if (frameworks.some(framework => lowerTagName.includes(framework))) {
    return 'framework';
  }
  
  // 数据库
  const databases = ['mongodb', 'redis', 'mysql', 'postgresql'];
  if (databases.some(db => lowerTagName.includes(db))) {
    return 'database';
  }
  
  // 工具
  const tools = ['git', 'linux', 'aws', 'docker'];
  if (tools.some(tool => lowerTagName.includes(tool))) {
    return 'tool';
  }
  
  // 技术领域
  const techAreas = ['机器学习', '深度学习', '数据结构', '算法', '前端开发', '后端开发', '全栈开发', '移动开发', '数据库设计', '系统设计', '云计算', '微服务'];
  if (techAreas.some(area => lowerTagName.includes(area.toLowerCase()))) {
    return 'technical_area';
  }
  
  // 默认分类
  return 'other';
};

// 添加自定义课程接口
router.post('/add-custom-course', async (req, res) => {
  try {
    const { student_profile_id, course_code, course_name, credits, course_nature, teacher, description, semester } = req.body;

    // 验证必填字段
    if (!student_profile_id || !course_name) {
      return res.status(400).json({
        success: false,
        message: '缺少必填字段：student_profile_id, course_name'
      });
    }

    // 验证学生档案
    const validation = await validateStudentProfile(student_profile_id);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    // 让数据库自动生成UUID
    // 创建自定义课程记录
    const { data: courseData, error: courseError } = await supabase
      .from('student_custom_courses')
      .insert({
        student_profile_id: student_profile_id,
        course_code: course_code || null,
        course_name: course_name.trim(),
        credits: credits || 1,
        course_nature: course_nature || '选修课',
        teacher: teacher?.trim() || '自填课程',
        description: description?.trim() || `${course_name.trim()} - 学生自定义添加的课程`,
        semester: semester || '2024-2',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (courseError) {
      console.error('创建自定义课程失败:', courseError);
      return res.status(500).json({
        success: false,
        message: '创建自定义课程失败',
        error: courseError.message
      });
    }

    console.log('✅ 自定义课程添加成功:', courseData);
    
    return res.status(201).json({
      success: true,
      message: '自定义课程添加成功',
      data: {
        course_id: courseData.id,
        course_code: courseData.course_code,
        course_name: courseData.course_name,
        credits: courseData.credits,
        course_nature: courseData.course_nature,
        teacher: courseData.teacher,
        description: courseData.description
      }
    });

  } catch (error) {
    console.error('添加自定义课程失败:', error);
    return res.status(500).json({
      success: false,
      message: '添加自定义课程失败',
      error: error.message
    });
  }
});

// 获取学生自定义课程列表
router.get('/get-custom-courses/:student_profile_id', async (req, res) => {
  try {
    const { student_profile_id } = req.params;

    // 验证学生档案
    const validation = await validateStudentProfile(student_profile_id);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    // 获取自定义课程列表
    const { data: courses, error } = await supabase
      .from('student_custom_courses')
      .select('*')
      .eq('student_profile_id', student_profile_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取自定义课程失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取自定义课程失败',
        error: error.message
      });
    }

    console.log('✅ 获取自定义课程成功:', courses);

    return res.json({
      success: true,
      message: '获取自定义课程成功',
      data: courses || []
    });

  } catch (error) {
    console.error('获取自定义课程失败:', error);
    return res.status(500).json({
      success: false,
      message: '获取自定义课程失败',
      error: error.message
    });
  }
});

export default router;