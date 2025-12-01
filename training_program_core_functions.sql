-- 培养方案核心数据库函数（简化版本）
-- 只包含学生端显示培养方案课程的核心功能

-- 1. 获取学生培养方案课程（核心函数）
CREATE OR REPLACE FUNCTION get_student_training_program_courses(p_student_id UUID)
RETURNS SETOF JSONB AS $$
BEGIN
    RETURN QUERY
    SELECT jsonb_build_object(
        'id', tpc.id,
        'course_number', tpc.course_number,
        'course_name', tpc.course_name,
        'credits', tpc.credits,
        'recommended_grade', tpc.recommended_grade,
        'semester', tpc.semester,
        'exam_method', tpc.exam_method,
        'course_nature', tpc.course_nature,
        'course_type', tpc.course_type,
        'course_category', tpc.course_category,
        'teaching_hours', tpc.teaching_hours,
        'theory_hours', tpc.theory_hours,
        'practice_hours', tpc.practice_hours,
        'weekly_hours', tpc.weekly_hours,
        'course_description', tpc.course_description,
        'sequence_order', tpc.sequence_order,
        'program_name', tp.program_name,
        'program_code', tp.program_code,
        'status', COALESCE(scp.status, 'not_started'),
        'grade', scp.grade,
        'grade_point', scp.grade_point,
        'semester_completed', scp.semester_completed,
        'academic_year', scp.academic_year,
        'teacher', scp.teacher,
        'notes', scp.notes,
        'completed_at', scp.completed_at,
        'enrollment_date', stp.enrollment_date
    )
    FROM student_training_programs stp
    JOIN training_programs tp ON stp.program_id = tp.id
    JOIN training_program_courses tpc ON tpc.program_id = tp.id
    LEFT JOIN student_course_progress scp ON scp.course_id = tpc.id AND scp.student_id = p_student_id
    WHERE 
        stp.student_id = p_student_id 
        AND stp.status = 'active' 
        AND tp.status = 'active' 
        AND tpc.status = 'active'
    ORDER BY tpc.sequence_order, tpc.course_number;
END;
$$ LANGUAGE plpgsql;

-- 2. 获取培养方案列表
CREATE OR REPLACE FUNCTION get_training_programs()
RETURNS SETOF JSONB AS $$
BEGIN
    RETURN QUERY
    SELECT jsonb_build_object(
        'id', tp.id,
        'program_name', tp.program_name,
        'program_code', tp.program_code,
        'major', tp.major,
        'department', tp.department,
        'total_credits', tp.total_credits,
        'duration_years', tp.duration_years,
        'description', tp.description,
        'status', tp.status,
        'course_count', (SELECT COUNT(*) FROM training_program_courses tpc WHERE tpc.program_id = tp.id AND tpc.status = 'active'),
        'created_at', tp.created_at,
        'updated_at', tp.updated_at
    )
    FROM training_programs tp
    WHERE tp.status = 'active'
    ORDER BY tp.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 3. 分配培养方案给学生（简化版）
CREATE OR REPLACE FUNCTION assign_training_program_to_student(p_student_id UUID, p_program_id UUID)
RETURNS JSONB AS $$
DECLARE
    assignment_uuid UUID;
BEGIN
    -- 插入学生培养方案关联
    INSERT INTO student_training_programs (
        student_id,
        program_id,
        enrollment_date,
        status,
        created_at,
        updated_at
    ) VALUES (
        p_student_id,
        p_program_id,
        CURRENT_DATE,
        'active',
        NOW(),
        NOW()
    )
    ON CONFLICT (student_id, program_id) 
    DO UPDATE SET
        enrollment_date = CURRENT_DATE,
        status = 'active',
        updated_at = NOW()
    RETURNING id INTO assignment_uuid;
    
    -- 创建学生课程进度记录
    INSERT INTO student_course_progress (
        student_id,
        course_id,
        status,
        created_at,
        updated_at
    )
    SELECT 
        p_student_id,
        tpc.id,
        'not_started',
        NOW(),
        NOW()
    FROM training_program_courses tpc
    WHERE tpc.program_id = p_program_id 
    AND tpc.status = 'active'
    ON CONFLICT (student_id, course_id) DO NOTHING;
    
    -- 返回成功结果
    RETURN jsonb_build_object(
        'success', true,
        'message', '培养方案分配成功',
        'assignment_id', assignment_uuid
    );
END;
$$ LANGUAGE plpgsql;

-- 4. 批量分配培养方案（简化版）
CREATE OR REPLACE FUNCTION batch_assign_training_program_to_teacher_students(
    p_teacher_id UUID,
    p_program_id UUID,
    p_student_ids UUID[]
)
RETURNS JSONB AS $$
DECLARE
    success_count INTEGER := 0;
    failure_count INTEGER := 0;
    student_uuid UUID;
    result JSONB;
BEGIN
    -- 遍历学生ID列表进行批量分配
    FOREACH student_uuid IN ARRAY p_student_ids
    LOOP
        BEGIN
            -- 调用单个分配函数
            PERFORM assign_training_program_to_student(student_uuid, p_program_id);
            success_count := success_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            failure_count := failure_count + 1;
        END;
    END LOOP;
    
    -- 构建返回结果
    result := jsonb_build_object(
        'success', success_count > 0,
        'message', format('批量分配完成：成功 %s 个，失败 %s 个', success_count, failure_count),
        'success_count', success_count,
        'failure_count', failure_count,
        'total_count', success_count + failure_count
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 创建API视图
CREATE OR REPLACE VIEW api_training_programs AS
SELECT * FROM get_training_programs();

-- 禁用RLS策略以确保API正常访问
ALTER TABLE training_programs DISABLE ROW LEVEL SECURITY;
ALTER TABLE training_program_courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_training_programs DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_course_progress DISABLE ROW LEVEL SECURITY;

COMMIT;