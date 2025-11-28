-- 最终修复脚本 - 解决所有问题

-- 第一步：删除所有可能存在的旧版本函数
DROP FUNCTION IF EXISTS batch_assign_training_program_to_teacher_students(UUID, UUID, UUID[]);
DROP FUNCTION IF EXISTS batch_assign_training_program_to_teacher_students(UUID, UUID, TEXT[], TEXT);
DROP FUNCTION IF EXISTS batch_assign_training_program_to_teacher_students(UUID, UUID, TEXT[]);
DROP FUNCTION IF EXISTS batch_assign_training_program_to_teacher_students(UUID, UUID, UUID[], TEXT);

-- 第二步：创建唯一的正确版本函数
CREATE OR REPLACE FUNCTION batch_assign_training_program_to_teacher_students(
    p_teacher_id UUID,
    p_program_id UUID,
    p_student_ids TEXT[],  -- 使用TEXT[]类型以避免JSON序列化问题
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
    student_id_str TEXT;
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
    FOREACH student_id_str IN ARRAY p_student_ids
    LOOP
        BEGIN
            -- 将字符串转换为UUID
            student_uuid := student_id_str::UUID;
            
            -- 调用单个分配函数
            SELECT assign_training_program_to_student(student_uuid, p_program_id, p_teacher_id, p_notes)
            INTO assignment_result;
            
            -- 检查分配结果
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
    
    -- 构建返回结果
    result := jsonb_build_object(
        'success', success_count > 0,
        'message', format('批量分配完成：成功 %s 个，失败 %s 个', success_count, failure_count),
        'success_count', success_count,
        'failure_count', failure_count,
        'total_count', success_count + failure_count,
        'details', failed_students
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 第三步：授权函数执行权限
GRANT EXECUTE ON FUNCTION batch_assign_training_program_to_teacher_students(UUID, UUID, TEXT[], TEXT) TO authenticated;

-- 第四步：验证函数创建成功
SELECT 
    proname AS function_name,
    pg_get_function_identity_arguments(oid) AS argument_types,
    pg_get_function_result(oid) AS return_type
FROM pg_proc 
WHERE proname = 'batch_assign_training_program_to_teacher_students'
ORDER BY proname;