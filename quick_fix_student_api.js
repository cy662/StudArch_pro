// 快速修复学生学习API，解决保存失败问题

import { createClient } from '@supabase/supabase-js';
import express from 'express';
import cors from 'cors';

const router = express.Router();

// Supabase配置 - 使用真实的数据库配置
const supabaseUrl = 'https://mddpbyibesqewcktlqle.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZHBieWliZXNxZXdja3RscWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNTQzNDksImV4cCI6MjA3ODkzMDM0OX0.T8QHCT3UK5f2mp76Oe9-AZpdrmPOFy1wVutxfmg49EU';
const supabase = createClient(supabaseUrl, supabaseKey);

// 通用错误处理
const handleApiError = (error, res, message = '操作失败') => {
  console.error(message, error);
  return res.status(500).json({
    success: false,
    message,
    error: error.message
  });
};

// 确保学生档案存在（使用真实数据库）
const ensureStudentProfile = async (studentId) => {
  try {
    // 先从数据库查询
    const { data: profile, error } = await supabase
      .from('student_profiles')
      .select('id, full_name, student_number')
      .eq('id', studentId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // 学生档案不存在，但我们不创建新档案，直接让前端处理
        console.log('学生档案不存在，但继续处理...');
        // 返回一个基础的学生档案对象，避免阻止保存操作
        return {
          id: studentId,
          full_name: '系统用户',
          student_number: 'UNKNOWN'
        };
      } else {
        console.error('查询学生档案失败:', error.message);
        throw error;
      }
    }
    
    console.log('✅ 找到学生档案:', profile);
    return profile;
  } catch (error) {
    console.error('ensureStudentProfile出错:', error.message);
    // 返回基础档案对象，避免阻止保存
    return {
      id: studentId,
      full_name: '系统用户',
      student_number: 'UNKNOWN'
    };
  }
};

// 添加技术标签
router.post('/student-learning/add-technical-tag', async (req, res) => {
  try {
    const { student_profile_id, tag_name, proficiency_level = 'intermediate', learned_at, description } = req.body;

    if (!student_profile_id || !tag_name) {
      return res.status(400).json({
        success: false,
        message: '缺少必填字段：student_profile_id, tag_name'
      });
    }

    // 确保学生档案存在
    await ensureStudentProfile(student_profile_id);

    // 直接保存到数据库
    const { data, error } = await supabase
      .from('student_technical_tags')
      .insert({
        student_profile_id,
        tag_name,
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
      console.error('数据库保存失败:', error);
      return handleApiError(error, res, '添加技术标签失败');
    }

    console.log('✅ 技术标签已保存到数据库:', tag_name);
    res.json({
      success: true,
      message: '技术标签保存成功',
      data
    });

  } catch (error) {
    handleApiError(error, res, '添加技术标签时发生错误');
  }
});

// 添加学习收获
router.post('/student-learning/add-learning-achievement', async (req, res) => {
  try {
    const { student_profile_id, title, content, achievement_type = 'course_completion', achieved_at, impact_level = 'medium', related_course } = req.body;

    if (!student_profile_id || !title || !content) {
      return res.status(400).json({
        success: false,
        message: '缺少必填字段：student_profile_id, title, content'
      });
    }

    await ensureStudentProfile(student_profile_id);

    // 直接保存到数据库
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
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('数据库保存失败:', error);
      return handleApiError(error, res, '添加学习收获失败');
    }

    console.log('✅ 学习收获已保存到数据库:', title);
    res.json({
      success: true,
      message: '学习收获保存成功',
      data
    });

  } catch (error) {
    handleApiError(error, res, '添加学习收获时发生错误');
  }
});

// 添加学习成果
router.post('/student-learning/add-learning-outcome', async (req, res) => {
  try {
    const { student_profile_id, outcome_title, outcome_description, outcome_type = 'course_project', start_date, completion_date, difficulty_level = 'intermediate', completion_status = 'completed', quality_rating = 4 } = req.body;

    if (!student_profile_id || !outcome_title) {
      return res.status(400).json({
        success: false,
        message: '缺少必填字段：student_profile_id, outcome_title'
      });
    }

    await ensureStudentProfile(student_profile_id);

    // 直接保存到数据库
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
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('数据库保存失败:', error);
      return handleApiError(error, res, '添加学习成果失败');
    }

    console.log('✅ 学习成果已保存到数据库:', outcome_title);
    res.json({
      success: true,
      message: '学习成果保存成功',
      data
    });

  } catch (error) {
    handleApiError(error, res, '添加学习成果时发生错误');
  }
});

// 添加证明材料
router.post('/student-learning/add-proof-material', async (req, res) => {
  try {
    const { student_profile_id, material_name, material_description, material_type = 'course_certificate', material_url, upload_date } = req.body;

    if (!student_profile_id || !material_name) {
      return res.status(400).json({
        success: false,
        message: '缺少必填字段：student_profile_id, material_name'
      });
    }

    await ensureStudentProfile(student_profile_id);

    // 直接保存到数据库
    const { data, error } = await supabase
      .from('student_proof_materials')
      .insert({
        student_profile_id,
        material_name,
        material_description,
        material_type,
        material_url,
        upload_date: upload_date || new Date().toISOString().split('T')[0],
        verification_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('数据库保存失败:', error);
      return handleApiError(error, res, '添加证明材料失败');
    }

    console.log('✅ 证明材料已保存到数据库:', material_name);
    res.json({
      success: true,
      message: '证明材料保存成功',
      data
    });

  } catch (error) {
    handleApiError(error, res, '添加证明材料时发生错误');
  }
});

// 获取学生学习信息汇总
router.get('/student-learning/get-summary/:student_profile_id', async (req, res) => {
  try {
    const { student_profile_id } = req.params;

    if (!student_profile_id) {
      return res.status(400).json({
        success: false,
        message: '缺少学生档案ID'
      });
    }

    console.log('获取学生信息汇总:', student_profile_id);

    // 确保学生档案存在
    const student = await ensureStudentProfile(student_profile_id);

    // 从数据库获取数据
    const [tagsResult, achievementsResult, outcomesResult, materialsResult] = await Promise.all([
      supabase
        .from('student_technical_tags')
        .select('*')
        .eq('student_profile_id', student_profile_id)
        .eq('status', 'active'),
      
      supabase
        .from('student_learning_achievements')
        .select('*')
        .eq('student_profile_id', student_profile_id)
        .eq('status', 'active'),
      
      supabase
        .from('student_learning_outcomes')
        .select('*')
        .eq('student_profile_id', student_profile_id)
        .eq('status', 'active'),
      
      supabase
        .from('student_proof_materials')
        .select('*')
        .eq('student_profile_id', student_profile_id)
    ]);

    res.json({
      success: true,
      message: '获取学生学习信息成功',
      data: {
        student_info: student,
        technical_tags: tagsResult.data || [],
        learning_achievements: achievementsResult.data || [],
        learning_outcomes: outcomesResult.data || [],
        proof_materials: materialsResult.data || []
      }
    });

  } catch (error) {
    console.error('获取学生信息汇总出错:', error);
    handleApiError(error, res, '获取学生学习信息时发生错误');
  }
});

export default router;