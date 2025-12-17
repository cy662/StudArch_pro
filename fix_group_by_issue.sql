-- 修复GROUP BY语法错误
-- 为get_teacher_training_programs函数添加缺失的字段到GROUP BY子句

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
        'programs', jsonb_agg(
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
        ),
        'pagination', jsonb_build_object(
            'page', p_page,
            'limit', p_limit,
            'total', total_count,
            'totalPages', CEIL(total_count::NUMERIC / p_limit)
        )
    ) INTO result
    FROM training_programs tp
    LEFT JOIN LATERAL (
        SELECT COUNT(*) as course_count
        FROM training_program_courses tpc
        WHERE tpc.program_id = tp.id AND tpc.status = 'active'
    ) course_count ON true
    WHERE 
        tp.teacher_id = p_teacher_id
        AND (p_status IS NULL OR tp.status = p_status)
        AND (p_program_name IS NULL OR tp.program_name ILIKE '%' || p_program_name || '%')
        AND (p_program_code IS NULL OR tp.program_code ILIKE '%' || p_program_code || '%')
    ORDER BY tp.created_at DESC
    LIMIT p_limit OFFSET offset_count;
    
    RETURN COALESCE(result, '{"programs": [], "pagination": {"page": 1, "limit": 50, "total": 0, "totalPages": 0}}'::jsonb);
END;
$$ LANGUAGE plpgsql;

COMMIT;