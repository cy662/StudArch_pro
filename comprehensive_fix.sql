-- 全面修复培养方案分配功能
-- 解决GROUP BY错误、format错误以及其他相关问题

-- 1. 修复 get_teacher_training_programs 函数中的 GROUP BY 错误
DROP FUNCTION IF EXISTS get_teacher_training_programs(UUID, TEXT, TEXT, TEXT, INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION get_teacher_training_programs(
    p_teacher_id UUID,
    p_program_name TEXT DEFAULT NULL,
    p_program_code TEXT DEFAULT NULL,
    p_status TEXT DEFAULT 'active',
    p_page INTEGER DEFAULT 1,
    p_limit INTEGER DEFAULT 50
)
RETURNS JSONB AS $$
DECLARE
    offset_count INTEGER := (p_page - 1) * p_limit;
    result JSONB;
    total_count INTEGER;
BEGIN
    -- 获取总数
    SELECT COUNT(*) INTO total_count
    FROM training_programs tp
    WHERE 
        tp.teacher_id = p_teacher_id
        AND (p_status IS NULL OR tp.status = p_status)
        AND (p_program_name IS NULL OR tp.program_name ILIKE '%' || p_program_name || '%')
        AND (p_program_code IS NULL OR tp.program_code ILIKE '%' || p_program_code || '%');
    
    -- 获取分页数据（修复GROUP BY问题）
    SELECT jsonb_build_object(
        'programs', COALESCE(jsonb_agg(
            jsonb_build_object(
                'id', tp.id,
                'program_name', tp.program_name,
                'program_code', tp.program_code,
                'major', tp.major,
                'department', tp.department,
                'total_credits', tp.total_credits,
                'duration_years', tp.duration_years,
                'description', tp.description,
                'status', tp.status,
                'course_count', COALESCE(course_count.course_count, 0),
                'created_by', tp.created_by,
                'teacher_id', tp.teacher_id,
                'created_at', tp.created_at,
                'updated_at', tp.updated_at
            )
            ORDER BY tp.created_at DESC
        ), '[]'::jsonb),
        'pagination', jsonb_build_object(
            'page', p_page,
            'limit', p_limit,
            'total', total_count,
            'totalPages', CEIL(total_count::NUMERIC / p_limit)
        )
    ) INTO result
    FROM (
        SELECT tp.*
        FROM training_programs tp
        WHERE 
            tp.teacher_id = p_teacher_id
            AND (p_status IS NULL OR tp.status = p_status)
            AND (p_program_name IS NULL OR tp.program_name ILIKE '%' || p_program_name || '%')
            AND (p_program_code IS NULL OR tp.program_code ILIKE '%' || p_program_code || '%')
        ORDER BY tp.created_at DESC
        LIMIT p_limit OFFSET offset_count
    ) tp
    LEFT JOIN LATERAL (
        SELECT COUNT(*) as course_count
        FROM training_program_courses tpc
        WHERE tpc.program_id = tp.id AND tpc.status = 'active'
    ) course_count ON true;
    
    RETURN COALESCE(result, '{"programs": [], "pagination": {"page": 1, "limit": 50, "total": 0, "totalPages": 0}}'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- 2. 修复 assign_teacher_training_program_to_students 函数中的 format 错误
DROP FUNCTION IF EXISTS assign_teacher_training_program_to_students(UUID, UUID, UUID[], TEXT);

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
    -- 验证教师是否拥有该培养方案（关键修复：确保教师只能分配自己的培养方案）
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
    
    -- 构建返回结果（使用%s而不是%d）
    result := jsonb_build_object(
        'success', success_count > 0,
        'message', format('批量分配完成：成功 %s 个，失败 %s 个', success_count, failure_count),
        'data', jsonb_build_object(
            'success_count', success_count,
            'failure_count', failure_count,
            'total_count', success_count + failure_count,
            'details', failed_students
        )
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 3. 修复 get_teacher_available_programs 函数
DROP FUNCTION IF EXISTS get_teacher_available_programs(UUID);

CREATE OR REPLACE FUNCTION get_teacher_available_programs(p_teacher_id UUID)
RETURNS SETOF JSONB AS $$
BEGIN
    RETURN QUERY
    SELECT jsonb_build_object(
        'id', tp.id,
        'program_name', tp.program_name,
        'program_code', tp.program_code,
        'major', tp.major,
        'department', tp.department,
        'total_credits', tp.total_credits,
        'course_count', COALESCE(course_count.course_count, 0)::INTEGER,
        'created_at', tp.created_at
    )
    FROM training_programs tp
    LEFT JOIN LATERAL (
        SELECT COUNT(*) as course_count
        FROM training_program_courses tpc
        WHERE tpc.program_id = tp.id AND tpc.status = 'active'
    ) course_count ON true
    WHERE 
        tp.teacher_id = p_teacher_id 
        AND tp.status = 'active'
    ORDER BY tp.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 4. 授权执行权限
GRANT EXECUTE ON FUNCTION get_teacher_training_programs(UUID, TEXT, TEXT, TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION assign_teacher_training_program_to_students(UUID, UUID, UUID[], TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_teacher_available_programs(UUID) TO authenticated;

-- 5. 显示修复完成信息
DO $$
BEGIN
    RAISE NOTICE '✅ 培养方案分配功能已全面修复！';
    RAISE NOTICE '🔧 关键修复1：解决了GROUP BY语法错误';
    RAISE NOTICE '🔧 关键修复2：解决了format()函数中的%d错误';
    RAISE NOTICE '🔧 关键修复3：确保教师只能分配自己的培养方案';
    RAISE NOTICE '🎯 现在可以正确分配培养方案了';
END $$;