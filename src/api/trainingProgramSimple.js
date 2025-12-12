// 培养方案API路由 - 简化版本
// 只处理核心分配功能，避免外键约束问题

import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

// Supabase配置 - 使用真实的数据库配置
const supabaseUrl = 'https://mddpbyibesqewcktlqle.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZHBieWliZXNxZXdja3RscWxlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM1NDM0OSwiZXhwIjoyMDc4OTMwMzQ5fQ.P2Y3IaRqJn6Tf7NjaHztGSd__3bTb_aBVioKoIK9Rq8';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase配置缺失');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 添加导入培养方案课程的路由处理器
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
    
    // 首先确保培养方案存在
    let { data: program, error: programError } = await supabase
      .from('training_programs')
      .select('id')
      .eq('program_code', programCode)
      .single();

    // 如果培养方案不存在，则创建一个新的
    if (programError || !program) {
      const { data: newProgram, error: createError } = await supabase
        .from('training_programs')
        .insert({
          program_code: programCode,
          program_name: `${programCode}培养方案`,
          department: '计算机系',
          degree_level: '本科',
          duration_years: 4,
          total_credits: 160,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('创建培养方案失败:', createError);
        return res.status(500).json({
          success: false,
          message: '创建培养方案失败: ' + createError.message
        });
      }
      
      program = newProgram;
    }

    // 准备导入的数据
    const programCourses = courses.map(course => ({
      program_id: program.id, // 使用培养方案的ID
      course_number: course.course_number,
      course_name: course.course_name,
      credits: course.credits,
      recommended_grade: course.recommended_grade,
      semester: course.semester,
      exam_method: course.exam_method,
      course_nature: course.course_nature,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // 插入课程数据
    const { data, error } = await supabase
      .from('training_program_courses')
      .insert(programCourses);

    if (error) {
      console.error('导入失败:', error);
      return res.status(500).json({
        success: false,
        message: '导入失败: ' + error.message
      });
    }

    // 创建导入批次记录
    const batchRecord = {
      batch_name: finalBatchName,
      program_id: program.id,
      total_records: courses.length,
      success_count: courses.length,
      failed_count: 0,
      imported_by: importedBy || null,
      import_time: new Date().toISOString()
    };

    const { error: batchError } = await supabase
      .from('training_program_import_batches')
      .insert(batchRecord);

    if (batchError) {
      console.error('创建导入批次记录失败:', batchError);
      // 不中断主流程，只是记录警告
    }

    res.json({
      success: true,
      data: {
        success: courses.length,
        failed: 0,
        total: courses.length
      },
      message: `成功导入 ${courses.length} 门课程`
    });

  } catch (error) {
    console.error('API错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取学生列表 - 添加新的API端点
router.get('/students', async (req, res) => {
  try {
    // 从数据库获取学生列表
    const { data, error } = await supabase
      .from('student_profiles')
      .select('id, full_name, student_number, major, enrollment_year')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取学生列表失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取学生列表失败: ' + error.message
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

// 获取培养方案列表
router.get('/training-programs', async (req, res) => {
  try {
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

// 简化的单个分配 - 使用数据库函数
router.post('/student/:studentId/assign-training-program', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { programId, teacherId, notes } = req.body;

    const basicUuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!basicUuidRegex.test(studentId) || !basicUuidRegex.test(programId)) {
      return res.status(400).json({
        success: false,
        message: '无效的ID格式'
      });
    }

    // 使用原始的数据库函数（如果存在）
    const { data, error } = await supabase.rpc('simple_assign_training_program', {
      p_student_id: studentId,
      p_program_id: programId
    });

    if (error) {
      // 如果函数不存在，尝试直接插入
      console.log('函数不存在，尝试直接插入...');
      
      // 验证学生和培养方案存在
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

      // 直接创建记录（跳过 teacher_id）
      const { data: insertData, error: insertError } = await supabase
        .from('student_training_programs')
        .insert({
          student_id: studentId,
          program_id: programId,
          enrollment_date: new Date().toISOString().split('T')[0],
          status: 'active',
          notes: notes || '直接分配',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('直接插入失败:', insertError);
        return res.status(500).json({
          success: false,
          message: '分配失败: ' + insertError.message
        });
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

      res.json({
        success: true,
        message: '培养方案分配成功',
        assignment_id: insertData.id
      });

    } else {
      // 函数执行成功
      res.json(data);
    }

  } catch (error) {
    console.error('API错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 简化的批量分配
router.post('/teacher/:teacherId/batch-assign-training-program', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { programId, studentIds, notes } = req.body;

    console.log('开始批量分配培养方案:', { teacherId, programId, studentIds, notes });

    const basicUuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!basicUuidRegex.test(teacherId) || !basicUuidRegex.test(programId)) {
      console.log('无效的ID格式:', { teacherId, programId });
      return res.status(400).json({
        success: false,
        message: '无效的ID格式'
      });
    }

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      console.log('无效的学生ID列表:', studentIds);
      return res.status(400).json({
        success: false,
        message: '请提供有效的学生ID列表'
      });
    }

    const invalidStudentIds = studentIds.filter(id => !basicUuidRegex.test(id));
    
    if (invalidStudentIds.length > 0) {
      console.log('发现无效的学生ID格式:', invalidStudentIds);
      return res.status(400).json({
        success: false,
        message: '发现无效的学生ID格式'
      });
    }

    // 验证培养方案存在
    console.log('验证培养方案是否存在:', programId);
    const { data: program, error: programError } = await supabase
      .from('training_programs')
      .select('*')
      .eq('id', programId)
      .eq('status', 'active')
      .single();

    if (programError || !program) {
      console.log('培养方案不存在或已停用:', { programError, program });
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
        console.log('处理学生分配:', studentId);
        // 验证学生存在 - 修复：同时检查档案ID和用户ID
        let studentProfile = null;
        let studentError = null;
        
        // 首先尝试按档案ID查找
        const profileResult = await supabase
          .from('student_profiles')
          .select('id')
          .eq('id', studentId)
          .single();
          
        if (profileResult.data) {
          studentProfile = profileResult.data;
        } else {
          // 如果按档案ID找不到，尝试按用户ID查找
          const userResult = await supabase
            .from('student_profiles')
            .select('id')
            .eq('user_id', studentId)
            .single();
            
          if (userResult.data) {
            studentProfile = userResult.data;
          } else {
            studentError = profileResult.error || userResult.error;
          }
        }

        if (studentError || !studentProfile) {
          console.log('学生不存在:', { studentId, studentError });
          failureCount++;
          details.push({
            student_id: studentId,
            error: '学生不存在'
          });
          continue;
        }
        
        // 使用找到的档案ID进行后续操作
        const profileId = studentProfile.id;

        // 创建学生培养方案关联（使用简单的直接插入）
        const { error: assignmentError } = await supabase
          .from('student_training_programs')
          .upsert({
            student_id: profileId, // 使用档案ID而不是传入的ID
            program_id: programId,
            enrollment_date: new Date().toISOString().split('T')[0],
            status: 'active',
            notes: notes || '批量分配',
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'student_id,program_id',
            ignoreDuplicates: true  // 忽略重复，不更新
          });

        if (assignmentError) {
          console.log('分配失败（可能是重复）:', assignmentError.message);
          console.log('学生ID:', profileId);
          console.log('培养方案ID:', programId);
          // 检查是否是因为已经存在而失败
          if (assignmentError.message.includes('duplicate')) {
            successCount++; // 已存在的也算成功
          } else {
            failureCount++;
            details.push({
              student_id: studentId,
              error: assignmentError.message
            });
          }
          continue;
        }

        // 创建课程进度记录
        const { data: courses, error: coursesError } = await supabase
          .from('training_program_courses')
          .select('id')
          .eq('program_id', programId)
          .eq('status', 'active');

        if (coursesError) {
          console.log('获取课程列表失败:', coursesError.message);
        }

        if (!coursesError && courses && courses.length > 0) {
          const courseProgressData = courses.map(course => ({
            student_id: profileId, // 使用档案ID
            course_id: course.id,
            status: 'not_started',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }));

          const { error: progressError } = await supabase
            .from('student_course_progress')
            .upsert(courseProgressData, {
              onConflict: 'student_id,course_id',
              ignoreDuplicates: true
            });

          if (progressError) {
            console.log('创建课程进度记录失败:', progressError.message);
          }
        }

        successCount++;

      } catch (error) {
        failureCount++;
        details.push({
          student_id: studentId,
          error: error.message
        });
        console.error('处理学生分配时发生异常:', error);
      }
    }

    const resultData = {
      success_count: successCount,
      failure_count: failureCount,
      total_count: successCount + failureCount,
      details: details
    };

    console.log('批量分配完成:', resultData);

    res.json({
      success: successCount > 0,
      message: `批量分配完成：成功 ${successCount} 个，失败 ${failureCount} 个`,
      data: resultData
    });

  } catch (error) {
    console.error('API错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误: ' + error.message
    });
  }
});

// 获取学生培养方案课程
router.get('/student/:studentId/training-program-courses', async (req, res) => {
  try {
    const { studentId } = req.params;

    const basicUuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!basicUuidRegex.test(studentId)) {
      return res.status(400).json({
        success: false,
        message: '无效的学生ID'
      });
    }

    // 使用简化的查询
    const { data: assignments, error: assignError } = await supabase
      .from('student_training_programs')
      .select(`
        program_id,
        enrollment_date,
        training_programs!inner (
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
        )
      `)
      .eq('student_id', studentId)
      .eq('status', 'active')
      .eq('training_programs.status', 'active');

    if (assignError) {
      console.error('获取学生培养方案课程失败:', assignError);
      return res.status(500).json({
        success: false,
        message: '获取学生培养方案课程失败: ' + assignError.message
      });
    }

    // 格式化返回数据
    const formattedCourses = [];
    if (assignments && assignments.length > 0) {
      for (const assignment of assignments) {
        const programInfo = assignment.training_programs;
        const courses = programInfo.training_program_courses;

        if (courses && courses.length > 0) {
          for (const course of courses) {
            // 获取课程进度
            const { data: progress, error: progressError } = await supabase
              .from('student_course_progress')
              .select('*')
              .eq('student_id', studentId)
              .eq('course_id', course.id)
              .single();

            const courseProgress = progressError ? null : progress;
            
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
              enrollment_date: assignment.enrollment_date
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

export default router;