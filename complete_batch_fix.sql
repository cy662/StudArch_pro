-- 完整修复脚本：解决批量分配培养方案中的format错误
-- 删除所有可能存在的函数版本

DROP FUNCTION IF EXISTS batch_assign_training_program_to_teacher_students(UUID, UUID, UUID[]);
DROP FUNCTION IF EXISTS batch_assign_training_program_to_teacher_students(UUID, UUID, TEXT[]);
DROP FUNCTION IF EXISTS batch_assign_training_program_to_teacher_students(UUID, UUID, UUID[], TEXT);
DROP FUNCTION IF EXISTS batch_assign_training_program_to_teacher_students(UUID, UUID, TEXT[], TEXT);

-- 创建最终修复版本的函数
CREATE OR REPLACE FUNCTION batch_assign_training_program_to_teacher_students(
    p_teacher_id UUID,
    p_program_id UUID,
    p_student_ids TEXT[],  -- 使用TEXT[]以避免JSON解析问题
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
    
    -- 逐个处理学生
    FOR student_id_str IN SELECT * FROM unnest(p_student_ids)
    LOOP
        BEGIN
            -- 转换为UUID
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
                    'student_id', student_uuid,
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
    
    -- 构建返回结果（关键修复：使用%s而不是%d）
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

-- 授权
GRANT EXECUTE ON FUNCTION batch_assign_training_program_to_teacher_students(UUID, UUID, TEXT[], TEXT) TO authenticated;

-- 显示修复完成信息
SELECT '✅ 批量分配函数已彻底修复！' as message
UNION ALL
SELECT '🔧 关键修复：format()函数中的%d已改为%s' as message
UNION ALL
SELECT '🎯 现在可以正常使用批量分配功能' as message;