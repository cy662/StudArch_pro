-- 修复培养方案分配函数
-- 不依赖 teacher_student_assignments 表，允许教师给任何学生分配培养方案

-- 1. 修复单个分配函数
CREATE OR REPLACE FUNCTION assign_training_program_to_student(
    p_student_id UUID, 
    p_program_id UUID,
    p_teacher_id UUID DEFAULT '00000000-0000-0000-0000-000000000001',
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    assignment_uuid UUID;
    student_exists BOOLEAN;
    program_exists BOOLEAN;
BEGIN
    -- 检查学生是否存在
    SELECT EXISTS(
        SELECT 1 FROM student_profiles WHERE id = p_student_id
    ) INTO student_exists;
    
    IF NOT student_exists THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', '学生不存在'
        );
    END IF;
    
    -- 检查培养方案是否存在
    SELECT EXISTS(
        SELECT 1 FROM training_programs WHERE id = p_program_id AND status = 'active'
    ) INTO program_exists;
    
    IF NOT program_exists THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', '培养方案不存在或已停用'
        );
    END IF;
    
    -- 插入或更新学生培养方案关联
    INSERT INTO student_training_programs (
        student_id,
        program_id,
        teacher_id,
        enrollment_date,
        status,
        notes,
        created_at,
        updated_at
    ) VALUES (
        p_student_id,
        p_program_id,
        p_teacher_id,
        CURRENT_DATE,
        'active',
        p_notes,
        NOW(),
        NOW()
    )
    ON CONFLICT (student_id, program_id) 
    DO UPDATE SET
        teacher_id = p_teacher_id,
        enrollment_date = CURRENT_DATE,
        status = 'active',
        notes = p_notes,
        updated_at = NOW()
    RETURNING id INTO assignment_uuid;
    
    -- 创建或更新学生课程进度记录
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
    ON CONFLICT (student_id, course_id) DO UPDATE SET
        status = 'not_started',
        updated_at = NOW();
    
    -- 返回成功结果
    RETURN jsonb_build_object(
        'success', true,
        'message', '培养方案分配成功',
        'assignment_id', assignment_uuid
    );
END;
$$ LANGUAGE plpgsql;

-- 2. 修复批量分配函数
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
    total_count INTEGER;
    student_uuid UUID;
    result JSONB;
    details JSONB[] := '{}';
    assignment_result JSONB;
BEGIN
    total_count := array_length(p_student_ids, 1);
    
    IF total_count IS NULL OR total_count = 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', '学生ID列表不能为空'
        );
    END IF;
    
    -- 遍历学生ID列表进行批量分配
    FOREACH student_uuid IN ARRAY p_student_ids
    LOOP
        BEGIN
            -- 调用单个分配函数
            SELECT assign_training_program_to_student(
                student_uuid, 
                p_program_id, 
                p_teacher_id, 
                p_notes
            ) INTO assignment_result;
            
            IF (assignment_result ->> 'success')::boolean THEN
                success_count := success_count + 1;
            ELSE
                failure_count := failure_count + 1;
                details := details || jsonb_build_object(
                    'student_id', student_uuid,
                    'error', assignment_result ->> 'message'
                );
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            failure_count := failure_count + 1;
            details := details || jsonb_build_object(
                'student_id', student_uuid,
                'error', SQLERRM
            );
        END;
    END LOOP;
    
    -- 构建返回结果
    result := jsonb_build_object(
        'success', success_count > 0,
        'message', format('批量分配完成：成功 %s 个，失败 %s 个', success_count, failure_count),
        'success_count', success_count,
        'failure_count', failure_count,
        'total_count', total_count,
        'details', details
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 3. 确保相关表的RLS被禁用
ALTER TABLE IF EXISTS student_training_programs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS student_course_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS training_programs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS training_program_courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS student_profiles DISABLE ROW LEVEL SECURITY;

COMMIT;