-- 修复函数返回格式，匹配前端期望的格式

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
    relationship_exists BOOLEAN;
    program_exists BOOLEAN;
    details JSONB[] := ARRAY[]::JSONB[];
    error_message TEXT;
BEGIN
    -- 遍历学生ID列表进行批量分配
    FOREACH student_uuid IN ARRAY p_student_ids
    LOOP
        BEGIN
            -- 检查学生是否在该教师管理列表中
            SELECT EXISTS(
                SELECT 1 FROM teacher_student_relationships 
                WHERE teacher_id = p_teacher_id AND student_id = student_uuid
            ) INTO relationship_exists;
            
            IF NOT relationship_exists THEN
                error_message := format('学生不在教师管理列表中 (学生ID: %s)', student_uuid);
                details := array_append(details, jsonb_build_object(
                    'student_id', student_uuid,
                    'error', error_message
                ));
                failure_count := failure_count + 1;
                CONTINUE;
            END IF;
            
            -- 检查培养方案是否存在
            SELECT EXISTS(
                SELECT 1 FROM training_programs 
                WHERE id = p_program_id AND status = 'active'
            ) INTO program_exists;
            
            IF NOT program_exists THEN
                error_message := format('培养方案不存在或已停用 (方案ID: %s)', p_program_id);
                details := array_append(details, jsonb_build_object(
                    'student_id', student_uuid,
                    'error', error_message
                ));
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
            
            success_count := success_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            error_message := format('分配失败: %s', SQLERRM);
            details := array_append(details, jsonb_build_object(
                'student_id', student_uuid,
                'error', error_message
            ));
            failure_count := failure_count + 1;
        END;
    END LOOP;
    
    -- 构建返回结果，匹配前端期望的格式
    result := jsonb_build_object(
        'success', success_count > 0,
        'data', jsonb_build_object(
            'success_count', success_count,
            'failure_count', failure_count,
            'total_count', success_count + failure_count,
            'details', details
        )
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 授权
GRANT EXECUTE ON FUNCTION batch_assign_training_program_to_teacher_students(UUID, UUID, UUID[], TEXT) TO authenticated;