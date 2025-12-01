-- 创建带调试日志的版本来诊断问题
DROP FUNCTION IF EXISTS batch_assign_training_program_to_teacher_students(UUID, UUID, UUID[], TEXT);

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
    assignment_exists BOOLEAN;
    relationship_exists BOOLEAN;
    program_exists BOOLEAN;
BEGIN
    -- 添加调试日志
    RAISE NOTICE '🎯 开始批量分配，教师ID: %, 培养方案ID: %, 学生数量: %', 
                 p_teacher_id, p_program_id, array_length(p_student_ids, 1);
    
    -- 遍历学生ID列表进行批量分配
    FOREACH student_uuid IN ARRAY p_student_ids
    LOOP
        BEGIN
            RAISE NOTICE '🔍 处理学生: %', student_uuid;
            
            -- 检查学生是否在该教师管理列表中
            SELECT EXISTS(
                SELECT 1 FROM teacher_student_relationships 
                WHERE teacher_id = p_teacher_id AND student_id = student_uuid
            ) INTO relationship_exists;
            
            RAISE NOTICE '📋 师生关系存在: %', relationship_exists;
            
            IF NOT relationship_exists THEN
                RAISE NOTICE '❌ 学生不在教师管理列表中';
                failure_count := failure_count + 1;
                CONTINUE;
            END IF;
            
            -- 检查培养方案是否存在
            SELECT EXISTS(
                SELECT 1 FROM training_programs 
                WHERE id = p_program_id AND status = 'active'
            ) INTO program_exists;
            
            RAISE NOTICE '📚 培养方案存在: %', program_exists;
            
            IF NOT program_exists THEN
                RAISE NOTICE '❌ 培养方案不存在或已停用';
                failure_count := failure_count + 1;
                CONTINUE;
            END IF;
            
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
            
            RAISE NOTICE '✅ 学生培养方案分配成功';
            
            -- 创建学生课程进度记录
            INSERT INTO student_course_progress (
                student_id, course_id, status, created_at, updated_at
            )
            SELECT 
                student_uuid, tpc.id, 'not_started', NOW(), NOW()
            FROM training_program_courses tpc
            WHERE tpc.program_id = p_program_id 
            AND tpc.status = 'active'
            ON CONFLICT (student_id, course_id) DO NOTHING;
            
            RAISE NOTICE '✅ 课程进度记录创建完成';
            
            success_count := success_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '❌ 处理学生 % 时发生错误: %', student_uuid, SQLERRM;
            failure_count := failure_count + 1;
        END;
    END LOOP;
    
    -- 构建返回结果
    result := jsonb_build_object(
        'success', success_count > 0,
        'message', format('批量分配完成：成功 %s 个，失败 %s 个', success_count, failure_count),
        'success_count', success_count,
        'failure_count', failure_count,
        'total_count', success_count + failure_count
    );
    
    RAISE NOTICE '🎉 批量分配完成：成功 %s，失败 %s', success_count, failure_count;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 授权
GRANT EXECUTE ON FUNCTION batch_assign_training_program_to_teacher_students(UUID, UUID, UUID[], TEXT) TO authenticated;