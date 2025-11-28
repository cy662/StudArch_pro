-- 立即修复 - 解决JSON序列化问题

-- 完全删除所有版本的函数
DROP FUNCTION IF EXISTS batch_assign_training_program_to_teacher_students(UUID, UUID, UUID[]);
DROP FUNCTION IF EXISTS batch_assign_training_program_to_teacher_students(UUID, UUID, TEXT[], TEXT);
DROP FUNCTION IF EXISTS batch_assign_training_program_to_teacher_students(UUID, UUID, TEXT[]);
DROP FUNCTION IF EXISTS batch_assign_training_program_to_teacher_students(UUID, UUID, UUID[], TEXT);

-- 创建一个简单且兼容的版本
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
    student_id_str TEXT;
    student_uuid UUID;
    result JSONB;
    failed_students JSONB := '[]'::jsonb;
    assignment_result JSONB;
BEGIN
    -- 验证输入参数
    IF p_teacher_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', '教师ID不能为空');
    END IF;
    
    IF p_program_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', '培养方案ID不能为空');
    END IF;
    
    IF p_student_ids IS NULL OR array_length(p_student_ids, 1) IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', '学生ID列表不能为空');
    END IF;
    
    -- 遍历学生ID列表
    FOREACH student_id_str IN ARRAY p_student_ids
    LOOP
        BEGIN
            -- 转换为UUID
            student_uuid := student_id_str::UUID;
            
            -- 调用分配函数
            SELECT assign_training_program_to_student(student_uuid, p_program_id, p_teacher_id, p_notes)
            INTO assignment_result;
            
            -- 检查结果
            IF (assignment_result->>'success')::boolean THEN
                success_count := success_count + 1;
            ELSE
                failure_count := failure_count + 1;
                failed_students := failed_students || jsonb_build_object(
                    'student_id', student_id_str,
                    'error', assignment_result->>'message'
                );
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            failure_count := failure_count + 1;
            failed_students := failed_students || jsonb_build_object(
                'student_id', student_id_str,
                'error', SQLERRM
            );
        END;
    END LOOP;
    
    -- 返回结果
    result := jsonb_build_object(
        'success', success_count > 0,
        'message', format('批量分配完成：成功 %s 个，失败 %s 个', success_count::text, failure_count::text),
        'success_count', success_count,
        'failure_count', failure_count,
        'total_count', success_count + failure_count,
        'details', failed_students
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 授权
GRANT EXECUTE ON FUNCTION batch_assign_training_program_to_teacher_students(UUID, UUID, TEXT[], TEXT) TO authenticated;