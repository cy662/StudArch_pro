-- 修复函数名冲突问题

-- 首先删除所有同名函数
DROP FUNCTION IF EXISTS batch_assign_training_program_to_teacher_students(UUID, UUID, UUID[], TEXT);
DROP FUNCTION IF EXISTS batch_assign_training_program_to_teacher_students(UUID, UUID, TEXT[], TEXT);

-- 重新创建正确的函数
CREATE OR REPLACE FUNCTION batch_assign_training_program_to_teacher_students(
    p_teacher_id UUID,
    p_program_id UUID,
    p_student_ids TEXT[],  -- 使用TEXT数组避免JSON解析问题
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

-- 授权函数执行权限
GRANT EXECUTE ON FUNCTION batch_assign_training_program_to_teacher_students(UUID, UUID, TEXT[], TEXT) TO authenticated;

COMMIT;