-- 最简单修复：只修复format错误
-- 在 Supabase SQL Editor 中执行

-- 删除旧函数
DROP FUNCTION IF EXISTS batch_assign_training_program_to_teacher_students(UUID, UUID, UUID[]);

-- 重新创建正确的函数
CREATE OR REPLACE FUNCTION batch_assign_training_program_to_teacher_students(
    p_teacher_id UUID,
    p_program_id UUID,
    p_student_ids UUID[]
)
RETURNS JSONB AS $$
DECLARE
    success_count INTEGER := 0;
    failure_count INTEGER := 0;
    student_uuid UUID;
    result JSONB;
BEGIN
    -- 遍历学生ID列表进行批量分配
    FOREACH student_uuid IN ARRAY p_student_ids
    LOOP
        BEGIN
            -- 插入或更新培养方案分配
            INSERT INTO student_training_programs (
                student_id, program_id, enrollment_date, status, created_at, updated_at
            ) VALUES (
                student_uuid, p_program_id, CURRENT_DATE, 'active', NOW(), NOW()
            )
            ON CONFLICT (student_id) 
            DO UPDATE SET 
                program_id = p_program_id, 
                updated_at = NOW();
            
            success_count := success_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            failure_count := failure_count + 1;
        END;
    END LOOP;
    
    -- 关键修复：使用%s而不是%d
    result := jsonb_build_object(
        'success', success_count > 0,
        'message', format('批量分配完成：成功 %s 个，失败 %s 个', success_count, failure_count),
        'success_count', success_count,
        'failure_count', failure_count,
        'total_count', success_count + failure_count
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 授权
GRANT EXECUTE ON FUNCTION batch_assign_training_program_to_teacher_students(UUID, UUID, UUID[]) TO authenticated;