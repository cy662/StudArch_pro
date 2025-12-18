// 教师培养方案隔离API路由
// 支持教师级别的培养方案导入和分配

import express from 'express';
import { supabase } from '../lib/supabase';
import { authenticateToken, requireTeacher } from '../middleware/auth.js';

const router = express.Router();

// 教师导入培养方案（支持隔离）
router.post('/training-program/import-with-teacher', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const { courses, programName, programCode, teacherId, major, department, batchName, importedBy } = req.body;

    // 验证权限：只能为自己导入
    if (req.user.id !== teacherId) {
      return res.status(403).json({
        success: false,
        message: '无权操作：只能为自己导入培养方案'
      });
    }

    // 验证必填字段
    if (!courses || !Array.isArray(courses) || courses.length === 0) {
      return res.status(400).json({
        success: false,
        message: '课程数据不能为空'
      });
    }

    if (!programName || !programCode || !teacherId) {
      return res.status(400).json({
        success: false,
        message: '培养方案名称、代码和教师ID为必填项'
      });
    }

    // 调用数据库函数进行导入
    const { data, error } = await supabase.rpc('import_training_program_courses_with_teacher', {
      p_courses: courses,
      p_program_code: programCode,
      p_program_name: programName,
      p_teacher_id: teacherId,
      p_major: major || '未指定专业',
      p_department: department || '未指定院系',
      p_batch_name: batchName,
      p_imported_by: importedBy || teacherId
    });

    if (error) {
      console.error('导入培养方案失败:', error);
      return res.status(500).json({
        success: false,
        message: '导入失败: ' + error.message
      });
    }

    res.json({
      success: true,
      message: '培养方案导入成功',
      data: data
    });

  } catch (error) {
    console.error('导入培养方案异常:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取教师的培养方案列表
router.get('/training-programs/teacher-list', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const { teacher_id, program_name, program_code, status = 'active', page = 1, limit = 50 } = req.query;

    // 验证权限：只能查看自己的培养方案
    if (req.user.id !== teacher_id) {
      return res.status(403).json({
        success: false,
        message: '无权查看其他教师的培养方案'
      });
    }

    const { data, error } = await supabase.rpc('get_teacher_training_programs', {
      p_teacher_id: teacher_id,
      p_program_name: program_name || null,
      p_program_code: program_code || null,
      p_status: status,
      p_page: parseInt(page as string),
      p_limit: parseInt(limit as string)
    });

    if (error) {
      console.error('获取教师培养方案失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取培养方案失败: ' + error.message
      });
    }

    res.json({
      success: true,
      message: '获取成功',
      data: data
    });

  } catch (error) {
    console.error('获取教师培养方案异常:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取教师可用的培养方案（用于分配）
router.get('/training-programs/teacher-available', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const { teacher_id } = req.query;

    // 验证权限：只能查看自己的培养方案
    if (req.user.id !== teacher_id) {
      return res.status(403).json({
        success: false,
        message: '无权查看其他教师的培养方案'
      });
    }

    const { data, error } = await supabase.rpc('get_teacher_available_programs', {
      p_teacher_id: teacher_id
    });

    if (error) {
      console.error('获取可用培养方案失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取可用培养方案失败: ' + error.message
      });
    }

    res.json({
      success: true,
      message: '获取成功',
      data: data || []
    });

  } catch (error) {
    console.error('获取可用培养方案异常:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 教师分配培养方案给学生
router.post('/training-programs/teacher-assign', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const { teacher_id, program_id, student_ids, notes } = req.body;

    // 验证权限：只能分配自己的培养方案
    if (req.user.id !== teacher_id) {
      return res.status(403).json({
        success: false,
        message: '无权操作：只能分配自己的培养方案'
      });
    }

    // 验证必填字段
    if (!teacher_id || !program_id || !student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: '教师ID、培养方案ID和学生ID列表为必填项'
      });
    }

    const { data, error } = await supabase.rpc('assign_teacher_training_program_to_students', {
      p_teacher_id: teacher_id,
      p_program_id: program_id,
      p_student_ids: student_ids,
      p_notes: notes || '批量分配培养方案'
    });

    if (error) {
      console.error('分配培养方案失败:', error);
      return res.status(500).json({
        success: false,
        message: '分配失败: ' + error.message
      });
    }

    res.json({
      success: true,
      message: '分配成功',
      data: data
    });

  } catch (error) {
    console.error('分配培养方案异常:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取教师的导入历史
router.get('/training-programs/teacher-history', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const { teacher_id } = req.query;

    // 验证权限：只能查看自己的历史
    if (req.user.id !== teacher_id) {
      return res.status(403).json({
        success: false,
        message: '无权查看其他教师的导入历史'
      });
    }

    const { data, error } = await supabase.rpc('get_teacher_import_history', {
      p_teacher_id: teacher_id
    });

    if (error) {
      console.error('获取导入历史失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取导入历史失败: ' + error.message
      });
    }

    res.json({
      success: true,
      message: '获取成功',
      data: data || []
    });

  } catch (error) {
    console.error('获取导入历史异常:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

export default router;