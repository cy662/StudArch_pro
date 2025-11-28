-- 完整修复脚本：解决批量分配培养方案失败的问题

-- 1. 修复批量分配培养方案函数
CREATE OR REPLACE FUNCTION batch_assign_training_program_to_teacher_students(
    p_teacher_id UUID,
    p_program_id UUID,
    p_student_ids TEXT[],  -- 修改为TEXT数组以避免JSON解析问题
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

-- 2. 确保表结构正确
ALTER TABLE student_training_programs 
ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- 3. 创建必要的索引
CREATE INDEX IF NOT EXISTS idx_student_training_programs_teacher_id ON student_training_programs(teacher_id);
CREATE INDEX IF NOT EXISTS idx_student_training_programs_student_teacher ON student_training_programs(student_id, teacher_id);

-- 4. 授权函数执行权限
GRANT EXECUTE ON FUNCTION batch_assign_training_program_to_teacher_students TO authenticated;
GRANT EXECUTE ON FUNCTION assign_training_program_to_student TO authenticated;

COMMIT;