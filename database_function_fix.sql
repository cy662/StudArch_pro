-- 修复数据库函数中的JSON语法错误问题

-- 1. 修复单个学生培养方案分配函数
CREATE OR REPLACE FUNCTION assign_training_program_to_student(
    p_student_id UUID,
    p_program_id UUID,
    p_teacher_id UUID DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    result UUID;  -- 改为UUID类型，因为RETURNING返回的是UUID
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
        teacher_id = COALESCE(EXCLUDED.teacher_id, student_training_programs.teacher_id),
        enrollment_date = CURRENT_DATE,
        status = 'active',
        notes = COALESCE(EXCLUDED.notes, student_training_programs.notes),
        updated_at = NOW()
    RETURNING id INTO result;  -- 现在类型匹配了
    
    -- 返回成功结果
    RETURN jsonb_build_object(
        'success', true,
        'message', '培养方案分配成功',
        'assignment_id', result  -- 直接使用UUID
    );
END;
$$ LANGUAGE plpgsql;

-- 2. 修复批量分配函数
CREATE OR REPLACE FUNCTION batch_assign_training_program_to_teacher_students(
    p_teacher_id UUID,
    p_program_id UUID,
    p_student_ids TEXT[],  -- 保持TEXT[]以避免JSON问题
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    success_count INTEGER := 0;
    failure_count INTEGER := 0;
    student_uuid UUID;
    result JSONB;
    results JSONB := '[]'::jsonb;
BEGIN
    -- 验证培养方案存在
    IF NOT EXISTS (SELECT 1 FROM training_programs WHERE id = p_program_id AND status = 'active') THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', '培养方案不存在或已停用'
        );
    END IF;
    
    -- 逐个处理学生
    FOR student_uuid IN SELECT * FROM unnest(p_student_ids::UUID[])  -- 转换为UUID数组
    LOOP
        -- 调用单个分配函数
        BEGIN
            result := assign_training_program_to_student(student_uuid, p_program_id, p_teacher_id, p_notes);
            
            -- 添加到结果数组
            results := results || jsonb_build_object(
                'student_id', student_uuid,
                'result', result
            );
            
            -- 统计成功/失败
            IF (result->>'success')::BOOLEAN = TRUE THEN
                success_count := success_count + 1;
            ELSE
                failure_count := failure_count + 1;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            failure_count := failure_count + 1;
            results := results || jsonb_build_object(
                'student_id', student_uuid,
                'error', SQLERRM
            );
        END;
    END LOOP;
    
    -- 返回总体结果
    RETURN jsonb_build_object(
        'success', success_count > 0,
        'message', format('成功分配 %d 个学生，失败 %d 个学生', success_count, failure_count),
        'success_count', success_count,
        'failure_count', failure_count,
        'total_count', success_count + failure_count,
        'details', results
    );
END;
$$ LANGUAGE plpgsql;

-- 3. 授权函数执行权限
GRANT EXECUTE ON FUNCTION assign_training_program_to_student TO authenticated;
GRANT EXECUTE ON FUNCTION batch_assign_training_program_to_teacher_students TO authenticated;