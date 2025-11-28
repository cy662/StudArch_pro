-- 培养方案API相关的数据库函数
-- 用于支持培养方案导入和管理的后端API

-- 1. 培养方案导入主函数
CREATE OR REPLACE FUNCTION import_training_program_courses(
    p_courses JSONB,
    p_program_code TEXT DEFAULT 'CS_2021',
    p_batch_name TEXT DEFAULT NULL,
    p_imported_by TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    batch_uuid UUID;
    program_uuid UUID;
    success_count INTEGER := 0;
    failure_count INTEGER := 0;
    course_record JSONB;
    course_uuid UUID;
    error_message TEXT;
    row_number INTEGER := 1;
    result JSONB;
BEGIN
    -- 获取或创建培养方案
    SELECT id INTO program_uuid 
    FROM training_programs 
    WHERE program_code = p_program_code;
    
    IF program_uuid IS NULL THEN
        -- 如果培养方案不存在，创建默认方案
        INSERT INTO training_programs (
            program_name, 
            program_code, 
            major, 
            department, 
            total_credits,
            created_at,
            updated_at
        ) VALUES (
            '默认培养方案',
            p_program_code,
            '默认专业',
            '默认院系',
            0,
            NOW(),
            NOW()
        ) RETURNING id INTO program_uuid;
    END IF;
    
    -- 创建导入批次
    INSERT INTO training_program_import_batches (
        batch_name,
        program_id,
        imported_by,
        total_records,
        status,
        created_at,
        updated_at
    ) VALUES (
        p_batch_name,
        program_uuid,
        p_imported_by::UUID,
        jsonb_array_length(p_courses),
        'processing',
        NOW(),
        NOW()
    ) RETURNING id INTO batch_uuid;
    
    -- 处理每门课程
    FOR course_record IN SELECT * FROM jsonb_array_elements(p_courses)
    LOOP
        BEGIN
            -- 插入课程记录
            INSERT INTO training_program_courses (
                program_id,
                course_number,
                course_name,
                credits,
                recommended_grade,
                semester,
                exam_method,
                course_nature,
                course_type,
                sequence_order,
                status,
                created_at,
                updated_at
            ) VALUES (
                program_uuid,
                course_record->>'course_number',
                course_record->>'course_name',
                (course_record->>'credits')::NUMERIC,
                course_record->>'recommended_grade',
                course_record->>'semester',
                course_record->>'exam_method',
                course_record->>'course_nature',
                COALESCE(course_record->>'course_nature', '必修课') = '必修课' ? 'required' : 'elective',
                row_number,
                'active',
                NOW(),
                NOW()
            ) RETURNING id INTO course_uuid;
            
            success_count := success_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            error_message := SQLERRM;
            
            -- 记录失败信息
            INSERT INTO training_program_import_failures (
                batch_id,
                row_number,
                course_number,
                course_name,
                error_message,
                raw_data,
                created_at
            ) VALUES (
                batch_uuid,
                row_number,
                course_record->>'course_number',
                course_record->>'course_name',
                error_message,
                course_record,
                NOW()
            );
            
            failure_count := failure_count + 1;
        END;
        
        row_number := row_number + 1;
    END LOOP;
    
    -- 更新批次状态
    UPDATE training_program_import_batches 
    SET 
        success_count = success_count,
        failure_count = failure_count,
        status = CASE WHEN failure_count = 0 THEN 'completed' ELSE 'completed' END,
        updated_at = NOW()
    WHERE id = batch_uuid;
    
    -- 更新培养方案总学分
    UPDATE training_programs 
    SET 
        total_credits = (
            SELECT COALESCE(SUM(credits), 0) 
            FROM training_program_courses 
            WHERE program_id = program_uuid AND status = 'active'
        ),
        updated_at = NOW()
    WHERE id = program_uuid;
    
    -- 构建返回结果
    result := jsonb_build_object(
        'success', success_count,
        'failed', failure_count,
        'total', success_count + failure_count,
        'batch_id', batch_uuid,
        'program_id', program_uuid
    );
    
    RETURN result;
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

-- 3. 获取培养方案课程列表
CREATE OR REPLACE FUNCTION get_training_program_courses(p_program_id UUID)
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
        'status', tpc.status,
        'created_at', tpc.created_at,
        'updated_at', tpc.updated_at
    )
    FROM training_program_courses tpc
    WHERE tpc.program_id = p_program_id AND tpc.status = 'active'
    ORDER BY tpc.sequence_order, tpc.course_number;
END;
$$ LANGUAGE plpgsql;

-- 4. 获取学生培养方案（用于学生端展示）
CREATE OR REPLACE FUNCTION get_student_training_program(p_student_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    program_uuid UUID;
BEGIN
    -- 获取学生的培养方案
    SELECT tp.id, tp.program_name, tp.program_code, tp.major, tp.department, tp.total_credits, tp.duration_years, tp.description
    INTO program_uuid, result
    FROM student_training_programs stp
    JOIN training_programs tp ON stp.program_id = tp.id
    WHERE stp.student_id = p_student_id AND stp.status = 'active' AND tp.status = 'active'
    LIMIT 1;
    
    -- 如果学生没有分配培养方案，返回默认方案
    IF program_uuid IS NULL THEN
        SELECT tp.id, tp.program_name, tp.program_code, tp.major, tp.department, tp.total_credits, tp.duration_years, tp.description
        INTO program_uuid, result
        FROM training_programs tp
        WHERE tp.status = 'active'
        ORDER BY tp.created_at DESC
        LIMIT 1;
    END IF;
    
    IF program_uuid IS NOT NULL THEN
        -- 添加课程列表
        result := result || jsonb_build_object(
            'courses', (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', tpc.id,
                        'course_number', tpc.course_number,
                        'course_name', tpc.course_name,
                        'credits', tpc.credits,
                        'recommended_grade', tpc.recommended_grade,
                        'semester', tpc.semester,
                        'exam_method', tpc.exam_method,
                        'course_nature', tpc.course_nature,
                        'course_type', tpc.course_type,
                        'sequence_order', tpc.sequence_order
                    )
                )
                FROM training_program_courses tpc
                WHERE tpc.program_id = program_uuid AND tpc.status = 'active'
                ORDER BY tpc.sequence_order, tpc.course_number
            )
        );
        
        -- 添加学生修读进度
        result := result || jsonb_build_object(
            'progress', (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'course_id', scp.course_id,
                        'course_number', tpc.course_number,
                        'course_name', tpc.course_name,
                        'status', scp.status,
                        'grade', scp.grade,
                        'grade_point', scp.grade_point,
                        'semester_completed', scp.semester_completed,
                        'academic_year', scp.academic_year,
                        'completed_at', scp.completed_at
                    )
                )
                FROM student_course_progress scp
                JOIN training_program_courses tpc ON scp.course_id = tpc.id
                WHERE scp.student_id = p_student_id
            )
        );
    END IF;
    
    RETURN COALESCE(result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- 5. 分配培养方案给学生
CREATE OR REPLACE FUNCTION assign_training_program_to_student(
    p_student_id UUID,
    p_program_id UUID,
    p_teacher_id UUID DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    assignment_uuid UUID;
    is_teacher_student BOOLEAN := FALSE;
BEGIN
    -- 检查教师是否管理该学生（如果提供了教师ID）
    IF p_teacher_id IS NOT NULL THEN
        SELECT COUNT(*) > 0 INTO is_teacher_student
        FROM teacher_student_assignments
        WHERE teacher_id = p_teacher_id AND student_id = p_student_id AND status = 'active';
        
        IF NOT is_teacher_student THEN
            RETURN jsonb_build_object(
                'success', false,
                'message', '该学生不在您的管理列表中，无法分配培养方案'
            );
        END IF;
    END IF;
    
    -- 插入或更新学生培养方案关联
    INSERT INTO student_training_programs (
        student_id,
        program_id,
        enrollment_date,
        status,
        notes,
        created_at,
        updated_at
    ) VALUES (
        p_student_id,
        p_program_id,
        CURRENT_DATE,
        'active',
        p_notes,
        NOW(),
        NOW()
    )
    ON CONFLICT (student_id, program_id) 
    DO UPDATE SET
        enrollment_date = CURRENT_DATE,
        status = 'active',
        notes = COALESCE(EXCLUDED.notes, student_training_programs.notes),
        updated_at = NOW()
    RETURNING id INTO assignment_uuid;
    
    -- 创建学生课程进度记录（初始化所有课程为未开始状态）
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
        'assignment_id', assignment_uuid,
        'courses_initialized', (
            SELECT COUNT(*) 
            FROM training_program_courses tpc 
            WHERE tpc.program_id = p_program_id AND tpc.status = 'active'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- 6. 批量分配培养方案给教师的学生
CREATE OR REPLACE FUNCTION batch_assign_training_program_to_teacher_students(
    p_teacher_id UUID,
    p_program_id UUID,
    p_student_ids UUID[],
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    success_count INTEGER := 0;
    failure_count INTEGER := 0;
    student_uuid UUID;
    result JSONB;
    failed_students JSONB := '[]'::jsonb;
    assignment_result JSONB;
BEGIN
    -- 验证教师ID和培养方案ID的有效性
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_teacher_id) THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', '教师ID无效'
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM training_programs WHERE id = p_program_id AND status = 'active') THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', '培养方案ID无效或不存在'
        );
    END IF;
    
    -- 遍历学生ID列表进行批量分配
    FOREACH student_uuid IN ARRAY p_student_ids
    LOOP
        BEGIN
            -- 调用单个分配函数
            SELECT assign_training_program_to_student(student_uuid, p_program_id, p_teacher_id, p_notes)
            INTO assignment_result;
            
            -- 检查分配结果
            IF (assignment_result->>'success')::boolean THEN
                success_count := success_count + 1;
            ELSE
                failure_count := failure_count + 1;
                failed_students := failed_students || jsonb_build_object(
                    'student_id', student_uuid,
                    'error', assignment_result->>'message'
                );
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            failure_count := failure_count + 1;
            failed_students := failed_students || jsonb_build_object(
                'student_id', student_uuid,
                'error', SQLERRM
            );
        END;
    END LOOP;
    
    -- 构建返回结果
    result := jsonb_build_object(
        'success', success_count > 0,
        'message', format('批量分配完成：成功 %d 个，失败 %d 个', success_count, failure_count),
        'success_count', success_count,
        'failure_count', failure_count,
        'total_count', success_count + failure_count,
        'details', failed_students
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 7. 获取学生培养方案课程（用于学生端展示）
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

-- 8. 获取导入历史
CREATE OR REPLACE FUNCTION get_training_program_import_history()
RETURNS SETOF JSONB AS $$
BEGIN
    RETURN QUERY
    SELECT jsonb_build_object(
        'id', tpib.id,
        'batch_name', tpib.batch_name,
        'program_name', tp.program_name,
        'program_code', tp.program_code,
        'imported_by', tpib.imported_by,
        'total_records', tpib.total_records,
        'success_count', tpib.success_count,
        'failure_count', tpib.failure_count,
        'status', tpib.status,
        'error_summary', tpib.error_summary,
        'created_at', tpib.created_at,
        'updated_at', tpib.updated_at
    )
    FROM training_program_import_batches tpib
    LEFT JOIN training_programs tp ON tpib.program_id = tp.id
    ORDER BY tpib.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 创建API视图用于简化查询
CREATE OR REPLACE VIEW api_training_programs AS
SELECT * FROM get_training_programs();

CREATE OR REPLACE VIEW api_training_program_import_history AS
SELECT * FROM get_training_program_import_history();

-- 授权（如果需要的话）
-- GRANT USAGE ON SCHEMA public TO authenticated;
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

COMMIT;