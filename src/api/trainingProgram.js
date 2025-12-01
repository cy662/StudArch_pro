// 培养方案API路由
// 处理培养方案导入、查询等API请求

import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

// Supabase配置
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase配置缺失');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 导入培养方案课程
router.post('/training-program/import', async (req, res) => {
  try {
    const { courses, programCode = 'CS_2021', batchName, importedBy } = req.body;

    // 验证输入
    if (!courses || !Array.isArray(courses)) {
      return res.status(400).json({
        success: false,
        message: '请提供有效的课程数据'
      });
    }

    if (courses.length === 0) {
      return res.status(400).json({
        success: false,
        message: '课程数据不能为空'
      });
    }

    // 生成批次名称
    const finalBatchName = batchName || `导入批次_${new Date().toLocaleString('zh-CN').replace(/[/:]/g, '-')}`;
    
    // 调用数据库函数进行导入
    const { data, error } = await supabase.rpc('import_training_program_courses', {
      p_courses: courses,
      p_program_code: programCode,
      p_batch_name: finalBatchName,
      p_imported_by: importedBy || null
    });

    if (error) {
      console.error('导入失败:', error);
      return res.status(500).json({
        success: false,
        message: '导入失败: ' + error.message
      });
    }

    res.json({
      success: true,
      data: data,
      message: `成功导入 ${data.success} 门课程，失败 ${data.failed} 门`
    });

  } catch (error) {
    console.error('API错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取培养方案列表
router.get('/training-programs', async (req, res) => {
  try {
    // 首先获取所有培养方案
    const { data: programs, error: programsError } = await supabase
      .from('training_programs')
      .select('*');

    if (programsError) {
      console.error('获取培养方案失败:', programsError);
      return res.status(500).json({
        success: false,
        message: '获取培养方案失败: ' + programsError.message
      });
    }

    // 为每个培养方案获取课程数量
    const programsWithCourseCount = await Promise.all(
      (programs || []).map(async (program) => {
        const { data: courses, error: coursesError } = await supabase
          .from('training_program_courses')
          .select('id')
          .eq('program_id', program.id);

        return {
          ...program,
          course_count: coursesError ? 0 : (courses?.length || 0)
        };
      })
    );

    res.json({
      success: true,
      data: programsWithCourseCount
    });

  } catch (error) {
    console.error('API错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取培养方案课程列表
router.get('/training-program/:programId/courses', async (req, res) => {
  try {
    const { programId } = req.params;

    // 验证UUID格式
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(programId)) {
      return res.status(400).json({
        success: false,
        message: '无效的培养方案ID'
      });
    }

    const { data, error } = await supabase.rpc('get_training_program_courses', {
      p_program_id: programId
    });

    if (error) {
      console.error('获取课程列表失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取课程列表失败: ' + error.message
      });
    }

    res.json({
      success: true,
      data: data || []
    });

  } catch (error) {
    console.error('API错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取学生培养方案（用于学生端）
router.get('/student/:studentId/training-program', async (req, res) => {
  try {
    const { studentId } = req.params;

    // 验证UUID格式
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(studentId)) {
      return res.status(400).json({
        success: false,
        message: '无效的学生ID'
      });
    }

    const { data, error } = await supabase.rpc('get_student_training_program', {
      p_student_id: studentId
    });

    if (error) {
      console.error('获取学生培养方案失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取学生培养方案失败: ' + error.message
      });
    }

    res.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('API错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 分配培养方案给学生（仅限教师给自己的学生分配）
router.post('/student/:studentId/assign-training-program', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { programId, teacherId, notes } = req.body;

    // 验证ID格式 - 支持标准UUID和占位符格式
    const standardUuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const placeholderUuidRegex = /^00000000-0000-0000-0000-000000000\d{3}$/i;
    
    if (!(standardUuidRegex.test(studentId) || placeholderUuidRegex.test(studentId)) || 
        !(standardUuidRegex.test(programId) || placeholderUuidRegex.test(programId))) {
      return res.status(400).json({
        success: false,
        message: '无效的ID格式'
      });
    }

    // 如果没有提供教师ID，使用默认教师ID（在实际应用中应该从认证中获取）
    const currentTeacherId = teacherId || '00000000-0000-0000-0000-000000000001';

    const { data, error } = await supabase.rpc('assign_training_program_to_student', {
      p_student_id: studentId,
      p_program_id: programId,
      p_teacher_id: currentTeacherId,
      p_notes: notes
    });

    if (error) {
      console.error('分配培养方案失败:', error);
      return res.status(500).json({
        success: false,
        message: '分配培养方案失败: ' + error.message
      });
    }

    // 检查是否成功（可能因为学生不在教师管理列表中而失败）
    if (!data.success) {
      return res.status(403).json({
        success: false,
        message: data.message || '分配培养方案失败'
      });
    }

    res.json(data);

  } catch (error) {
    console.error('API错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 批量分配培养方案给教师的学生
router.post('/teacher/:teacherId/batch-assign-training-program', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { programId, studentIds, notes } = req.body;

    // 验证ID格式 - 支持标准UUID和占位符格式
    const standardUuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const placeholderUuidRegex = /^00000000-0000-0000-0000-000000000\d{3}$/i;
    
    if (!(standardUuidRegex.test(teacherId) || placeholderUuidRegex.test(teacherId)) || 
        !(standardUuidRegex.test(programId) || placeholderUuidRegex.test(programId))) {
      return res.status(400).json({
        success: false,
        message: '无效的ID格式'
      });
    }

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供有效的学生ID列表'
      });
    }

    // 验证所有学生ID格式
    const invalidStudentIds = studentIds.filter(id => 
      !(standardUuidRegex.test(id) || placeholderUuidRegex.test(id))
    );
    
    if (invalidStudentIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: '发现无效的学生ID格式'
      });
    }

    // 确保所有ID都是字符串格式，避免JSON序列化问题
    const validStudentIds = studentIds.map(id => String(id));
    
    const { data, error } = await supabase.rpc('batch_assign_training_program_to_teacher_students', {
      p_teacher_id: teacherId,
      p_program_id: programId,
      p_student_ids: validStudentIds,  // 确保传递正确的数组格式
      p_notes: notes || null
    });

    if (error) {
      console.error('批量分配培养方案失败:', error);
      return res.status(500).json({
        success: false,
        message: '批量分配培养方案失败: ' + error.message
      });
    }

    res.json(data);

  } catch (error) {
    console.error('API错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取教师所有学生的培养方案汇总
router.get('/teacher/:teacherId/students-training-programs', async (req, res) => {
  try {
    const { teacherId } = req.params;

    // 验证UUID格式
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(teacherId)) {
      return res.status(400).json({
        success: false,
        message: '无效的教师ID格式'
      });
    }

    const { data, error } = await supabase.rpc('get_teacher_students_training_programs_summary', {
      p_teacher_id: teacherId
    });

    if (error) {
      console.error('获取学生培养方案汇总失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取学生培养方案汇总失败: ' + error.message
      });
    }

    res.json({
      success: true,
      data: data || []
    });

  } catch (error) {
    console.error('API错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取学生培养方案课程（用于学生端教学任务与安排页面）
router.get('/student/:studentId/training-program-courses', async (req, res) => {
  try {
    const { studentId } = req.params;

    // 验证ID格式 - 支持标准UUID和占位符格式
    const standardUuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const placeholderUuidRegex = /^00000000-0000-0000-0000-000000000\d{3}$/i;
    
    if (!(standardUuidRegex.test(studentId) || placeholderUuidRegex.test(studentId))) {
      return res.status(400).json({
        success: false,
        message: '无效的学生ID'
      });
    }

    // 获取学生培养方案课程信息
    const { data, error } = await supabase.rpc('get_student_training_program_courses', {
      p_student_id: studentId
    });

    if (error) {
      console.error('获取学生培养方案课程失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取学生培养方案课程失败: ' + error.message
      });
    }

    res.json({
      success: true,
      data: data || []
    });

  } catch (error) {
    console.error('API错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取教师特定学生的培养方案
router.get('/teacher/:teacherId/student/:studentId/training-program', async (req, res) => {
  try {
    const { teacherId, studentId } = req.params;

    // 验证UUID格式
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(teacherId) || !uuidRegex.test(studentId)) {
      return res.status(400).json({
        success: false,
        message: '无效的ID格式'
      });
    }

    const { data, error } = await supabase.rpc('get_teacher_student_training_program', {
      p_teacher_id: teacherId,
      p_student_id: studentId
    });

    if (error) {
      console.error('获取学生培养方案失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取学生培养方案失败: ' + error.message
      });
    }

    res.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('API错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取导入历史
router.get('/training-program/import-history', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('training_program_import_batches')
      .select('*');

    if (error) {
      console.error('获取导入历史失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取导入历史失败: ' + error.message
      });
    }

    res.json({
      success: true,
      data: data || []
    });

  } catch (error) {
    console.error('API错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 下载培养方案模板
router.get('/training-program/template', async (req, res) => {
  try {
    const XLSX = await import('xlsx');
    
    // 生成模板数据
    const templateData = [
      ['课程号', '课程名称', '学分', '建议修读年级', '学期', '考试方式', '课程性质'],
      ['CS101', '计算机基础', 3, '大一', '第一学期', '笔试', '必修课'],
      ['CS102', '程序设计基础', 4, '大一', '第一学期', '上机考试', '必修课'],
      ['MATH101', '高等数学', 4, '大一', '第一学期', '笔试', '必修课'],
      ['CS201', '数据结构', 4, '大二', '第一学期', '笔试', '必修课'],
      ['CS202', '算法设计与分析', 3, '大二', '第二学期', '笔试', '必修课']
    ];

    // 创建工作簿
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(templateData);

    // 设置列宽
    const colWidths = [
      { wch: 15 }, // 课程号
      { wch: 25 }, // 课程名称
      { wch: 10 }, // 学分
      { wch: 15 }, // 建议修读年级
      { wch: 15 }, // 学期
      { wch: 15 }, // 考试方式
      { wch: 15 }  // 课程性质
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, '培养方案模板');

    // 生成Excel文件
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // 设置响应头
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="培养方案导入模板.xlsx"');

    res.send(excelBuffer);

  } catch (error) {
    console.error('生成模板失败:', error);
    res.status(500).json({
      success: false,
      message: '生成模板失败'
    });
  }
});

export default router;