-- 删除所有版本的assign_training_program_to_student函数，然后重新创建

-- 首先尝试删除所有可能的函数版本
DROP FUNCTION IF EXISTS assign_training_program_to_student(UUID, UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS assign_training_program_to_student(UUID, UUID, UUID);
DROP FUNCTION IF EXISTS assign_training_program_to_student(UUID, UUID);
DROP FUNCTION IF EXISTS assign_training_program_to_student(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS assign_training_program_to_student(TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS assign_training_program_to_student(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS assign_training_program_to_student(TEXT, TEXT);

-- 现在创建正确的函数版本
CREATE OR REPLACE FUNCTION assign_training_program_to_student(
    p_student_id UUID,
    p_program_id UUID,
    p_teacher_id UUID DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    result UUID;  -- 关键修复：将类型从JSONB改为UUID
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

-- 授权函数执行权限
GRANT EXECUTE ON FUNCTION assign_training_program_to_student TO authenticated;