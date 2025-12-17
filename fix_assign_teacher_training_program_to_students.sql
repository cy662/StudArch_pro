-- 修复 assign_teacher_training_program_to_students 函数中的format错误
-- 问题：PostgreSQL的format()函数中使用了错误的格式化符号%d，应该使用%s

-- 重新创建修复后的函数
CREATE OR REPLACE FUNCTION assign_teacher_training_program_to_students(
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
    is_teacher_program BOOLEAN := FALSE;
BEGIN
    -- 验证教师是否拥有该培养方案
    SELECT COUNT(*) > 0 INTO is_teacher_program
    FROM training_programs 
    WHERE id = p_program_id AND teacher_id = p_teacher_id AND status = 'active';
    
    IF NOT is_teacher_program THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', '您无权操作此培养方案，该方案不属于您'
        );
    END IF;
    
    -- 遍历学生ID列表进行批量分配
    FOREACH student_uuid IN ARRAY p_student_ids
    LOOP
        BEGIN
            -- 调用原有分配函数（会验证教师学生关系）
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
    
    -- 构建返回结果（关键修复：使用%s而不是%d）
    result := jsonb_build_object(
        'success', success_count > 0,
        'message', format('批量分配完成：成功 %s 个，失败 %s 个', success_count, failure_count),
        'data', jsonb_build_object(
            'success_count', success_count,
            'failure_count', failure_count,
            'total_count', success_count + failure_count,
            'details', failed_students,
            'teacher_id', p_teacher_id,
            'program_id', p_program_id
        )
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 显示修复完成信息
SELECT '✅ assign_teacher_training_program_to_students 函数已修复！' as message
UNION ALL
SELECT '🔧 关键修复：format()函数中的%d已改为%s' as message
UNION ALL
SELECT '🎯 现在可以正常使用批量分配功能' as message;