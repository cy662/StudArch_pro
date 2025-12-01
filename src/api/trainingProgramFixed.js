// 培养方案API路由 - 修复版本
// 使用应用层逻辑处理培养方案分配，不依赖复杂的数据库函数

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

// 导入培养方案课程（保持原有功能）
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

// 分配培养方案给学生（修复版本 - 使用应用层逻辑）
router.post('/student/:studentId/assign-training-program', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { programId, teacherId, notes } = req.body;

    // 简化ID验证
    const basicUuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!basicUuidRegex.test(studentId) || !basicUuidRegex.test(programId)) {
      return res.status(400).json({
        success: false,
        message: '无效的ID格式'
      });
    }

    // 使用应用层逻辑处理分配
    const currentTeacherId = teacherId || '00000000-0000-0000-0000-000000000001';

    // 1. 验证学生存在
    const { data: student, error: studentError } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('id', studentId)
      .single();

    if (studentError || !student) {
      return res.status(404).json({
        success: false,
        message: '学生不存在'
      });
    }

    // 2. 验证培养方案存在
    const { data: program, error: programError } = await supabase
      .from('training_programs')
      .select('*')
      .eq('id', programId)
      .eq('status', 'active')
      .single();

    if (programError || !program) {
      return res.status(404).json({
        success: false,
        message: '培养方案不存在或已停用'
      });
    }

    // 3. 创建或更新学生培养方案关联
    const { data: assignment, error: assignmentError } = await supabase
      .from('student_training_programs')
      .upsert({
        student_id: studentId,
        program_id: programId,
        teacher_id: null, // 暂时设为 null 避免外键约束问题
        enrollment_date: new Date().toISOString().split('T')[0],
        status: 'active',
        notes: notes || null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'student_id,program_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (assignmentError) {
      console.error('分配培养方案失败:', assignmentError);
      return res.status(500).json({
        success: false,
        message: '分配培养方案失败: ' + assignmentError.message
      });
    }

    // 4. 创建学生课程进度记录
    const { data: courses, error: coursesError } = await supabase
      .from('training_program_courses')
      .select('id')
      .eq('program_id', programId)
      .eq('status', 'active');

    if (!coursesError && courses && courses.length > 0) {
      // 批量创建课程进度记录
      const courseProgressData = courses.map(course => ({
        student_id: studentId,
        course_id: course.id,
        status: 'not_started',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      await supabase
        .from('student_course_progress')
        .upsert(courseProgressData, {
          onConflict: 'student_id,course_id',
          ignoreDuplicates: true
        });
    }

    res.json({
      success: true,
      message: '培养方案分配成功',
      assignment_id: assignment.id
    });

  } catch (error) {
    console.error('API错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 批量分配培养方案给教师的学生（修复版本）
router.post('/teacher/:teacherId/batch-assign-training-program', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { programId, studentIds, notes } = req.body;

    // 简化ID验证 - 只验证基本的UUID格式
    const basicUuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!basicUuidRegex.test(teacherId) || !basicUuidRegex.test(programId)) {
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
    const basicUuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const invalidStudentIds = studentIds.filter(id => !basicUuidRegex.test(id));
    
    if (invalidStudentIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: '发现无效的学生ID格式'
      });
    }

    // 验证培养方案存在
    const { data: program, error: programError } = await supabase
      .from('training_programs')
      .select('*')
      .eq('id', programId)
      .eq('status', 'active')
      .single();

    if (programError || !program) {
      return res.status(404).json({
        success: false,
        message: '培养方案不存在或已停用'
      });
    }

    // 逐个处理学生分配
    let successCount = 0;
    let failureCount = 0;
    const details = [];

    for (const studentId of studentIds) {
      try {
        // 验证学生存在
        const { data: student, error: studentError } = await supabase
          .from('student_profiles')
          .select('id')
          .eq('id', studentId)
          .single();

        if (studentError || !student) {
          failureCount++;
          details.push({
            student_id: studentId,
            error: '学生不存在'
          });
          continue;
        }

        // 创建学生培养方案关联
        const { error: assignmentError } = await supabase
          .from('student_training_programs')
          .upsert({
            student_id: studentId,
            program_id: programId,
            teacher_id: null, // 暂时设为 null 避免外键约束问题
            enrollment_date: new Date().toISOString().split('T')[0],
            status: 'active',
            notes: notes || null,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'student_id,program_id',
            ignoreDuplicates: false
          });

        if (assignmentError) {
          failureCount++;
          details.push({
            student_id: studentId,
            error: assignmentError.message
          });
          continue;
        }

        // 创建课程进度记录
        const { data: courses, error: coursesError } = await supabase
          .from('training_program_courses')
          .select('id')
          .eq('program_id', programId)
          .eq('status', 'active');

        if (!coursesError && courses && courses.length > 0) {
          const courseProgressData = courses.map(course => ({
            student_id: studentId,
            course_id: course.id,
            status: 'not_started',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }));

          await supabase
            .from('student_course_progress')
            .upsert(courseProgressData, {
              onConflict: 'student_id,course_id',
              ignoreDuplicates: true
            });
        }

        successCount++;

      } catch (error) {
        failureCount++;
        details.push({
          student_id: studentId,
          error: error.message
        });
      }
    }

    const result = {
      success: successCount > 0,
      message: `批量分配完成：成功 ${successCount} 个，失败 ${failureCount} 个`,
      success_count: successCount,
      failure_count: failureCount,
      total_count: successCount + failureCount,
      details: details
    };

    res.json(result);

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

    // 验证ID格式
    const basicUuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!basicUuidRegex.test(studentId)) {
      return res.status(400).json({
        success: false,
        message: '无效的学生ID'
      });
    }

    // 获取学生培养方案课程信息（使用应用层查询）
    const { data: courses, error } = await supabase
      .from('student_training_programs')
      .select(`
        training_programs!inner (
          id,
          program_name,
          program_code,
          training_program_courses!inner (
            id,
            course_number,
            course_name,
            credits,
            recommended_grade,
            semester,
            exam_method,
            course_nature,
            course_type,
            course_category,
            teaching_hours,
            theory_hours,
            practice_hours,
            weekly_hours,
            course_description,
            sequence_order
          )
        ),
        student_course_progress (
          status,
          grade,
          grade_point,
          semester_completed,
          academic_year,
          teacher,
          notes,
          completed_at
        ),
        enrollment_date
      `)
      .eq('student_id', studentId)
      .eq('status', 'active')
      .eq('training_programs.status', 'active');

    if (error) {
      console.error('获取学生培养方案课程失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取学生培养方案课程失败: ' + error.message
      });
    }

    // 格式化返回数据
    const formattedCourses = [];
    if (courses && courses.length > 0) {
      for (const program of courses) {
        const programInfo = program.training_programs;
        const courses = programInfo.training_program_courses;
        const progress = program.student_course_progress;

        if (courses && courses.length > 0) {
          for (const course of courses) {
            const courseProgress = progress.find(p => p.course_id === course.id);
            
            formattedCourses.push({
              id: course.id,
              course_number: course.course_number,
              course_name: course.course_name,
              credits: course.credits,
              recommended_grade: course.recommended_grade,
              semester: course.semester,
              exam_method: course.exam_method,
              course_nature: course.course_nature,
              course_type: course.course_type,
              course_category: course.course_category,
              teaching_hours: course.teaching_hours,
              theory_hours: course.theory_hours,
              practice_hours: course.practice_hours,
              weekly_hours: course.weekly_hours,
              course_description: course.course_description,
              sequence_order: course.sequence_order,
              program_name: programInfo.program_name,
              program_code: programInfo.program_code,
              status: courseProgress?.status || 'not_started',
              grade: courseProgress?.grade,
              grade_point: courseProgress?.grade_point,
              semester_completed: courseProgress?.semester_completed,
              academic_year: courseProgress?.academic_year,
              teacher: courseProgress?.teacher,
              notes: courseProgress?.notes,
              completed_at: courseProgress?.completed_at,
              enrollment_date: program.enrollment_date
            });
          }
        }
      }
    }

    // 按顺序排序
    formattedCourses.sort((a, b) => (a.sequence_order || 0) - (b.sequence_order || 0));

    res.json({
      success: true,
      data: formattedCourses
    });

  } catch (error) {
    console.error('API错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 其他路由保持不变...
router.get('/training-program/:programId/courses', async (req, res) => {
  try {
    const { programId } = req.params;

    const standardUuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!standardUuidRegex.test(programId)) {
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

export default router;