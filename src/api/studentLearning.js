// 学生学习信息API路由
import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Supabase配置 - 使用真实的数据库配置
const supabaseUrl = 'https://mddpbyibesqewcktlqle.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZHBieWliZXNxZXdja3RscWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNTQzNDksImV4cCI6MjA3ODkzMDM0OX0.T8QHCT3UK5f2mp76Oe9-AZpdrmPOFy1wVutxfmg49EU';
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
    
    // 创建学生证明材料表
    const { error: materialError } = await supabase.rpc('create_student_proof_materials_table');
    if (materialError && materialError.code !== 'PGRST116') {
      console.warn('创建student_proof_materials表失败:', materialError.message);
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
      role_description
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

// 4. 添加证明材料
router.post('/student-learning/add-proof-material', async (req, res) => {
  try {
    const {
      student_profile_id,
      material_name,
      material_description,
      material_type = 'course_certificate',
      material_url,
      upload_date,
      verification_status = 'pending',
      verification_date,
      verifier_id,
      verification_notes,
      access_permissions,
      file_hash
    } = req.body;

    // 验证必填字段
    if (!student_profile_id || !material_name) {
      return res.status(400).json({
        success: false,
        message: '缺少必填字段：student_profile_id, material_name'
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
      .from('student_proof_materials')
      .insert({
        student_profile_id,
        material_name,
        material_description,
        material_type,
        material_url,
        upload_date: upload_date || new Date().toISOString().split('T')[0],
        verification_status,
        verification_date,
        verifier_id,
        verification_notes,
        access_permissions,
        file_hash,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return handleApiError(error, res, '添加证明材料失败');
    }

    console.log('✅ 证明材料已保存到数据库:', material_name);
    res.json({
      success: true,
      message: '证明材料添加成功',
      data
    });

  } catch (error) {
    handleApiError(error, res, '添加证明材料时发生错误');
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

    // 获取证明材料
    const { data: materials } = await supabase
      .from('student_proof_materials')
      .select('*')
      .eq('student_profile_id', student_profile_id);

    res.json({
      success: true,
      message: '获取学生学习信息成功',
      data: {
        student_info: validation.student,
        technical_tags: tags || [],
        learning_achievements: achievements || [],
        learning_outcomes: outcomes || [],
        proof_materials: materials || []
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

export default router;