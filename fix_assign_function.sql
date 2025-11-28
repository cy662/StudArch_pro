-- 修复培养方案分配函数以正确处理ID映射
-- 解决student_training_programs表的外键约束问题

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
    profile_id UUID;
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
    
    -- 获取student_profiles中的ID（用于外键约束）
    SELECT id INTO profile_id
        FROM student_profiles
        WHERE user_id = p_student_id
        LIMIT 1;
        
    IF profile_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', '学生档案不存在，无法分配培养方案'
        );
    END IF;
    
    -- 插入或更新学生培养方案关联（使用profile_id）
    INSERT INTO student_training_programs (
        student_id,
        program_id,
        enrollment_date,
        status,
        notes,
        created_at,
        updated_at
    ) VALUES (
        profile_id,
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
        profile_id,  -- 使用profile_id而不是p_student_id
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

-- 修复批量分配函数
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
            -- 调用修复后的单个分配函数
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

COMMIT;