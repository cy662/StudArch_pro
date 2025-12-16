-- 修复JSON解析问题的简化函数
-- 确保返回格式一致

DROP FUNCTION IF EXISTS get_available_students_for_import CASCADE;

CREATE OR REPLACE FUNCTION get_available_students_for_import(
    p_teacher_id UUID,
    p_keyword TEXT DEFAULT '',
    p_grade TEXT DEFAULT '',
    p_department TEXT DEFAULT '',
    p_page INTEGER DEFAULT 1,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE(
    students JSONB,
    total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_offset INTEGER := (p_page - 1) * p_limit;
    v_total_count BIGINT;
BEGIN
    -- 计算总数
    SELECT COUNT(*) INTO v_total_count
    FROM users u
    WHERE u.role_id = '3'  -- 学生角色
      AND u.status = 'active'  -- 活跃状态
      AND NOT EXISTS (
          -- 关键修复：排除已被任何教师导入的学生
          SELECT 1 FROM teacher_students ts 
          WHERE ts.student_id = u.id
      )
      AND (
          p_keyword = '' OR 
          LOWER(u.full_name) LIKE LOWER('%' || p_keyword || '%') OR
          LOWER(u.user_number) LIKE LOWER('%' || p_keyword || '%') OR
          LOWER(u.email) LIKE LOWER('%' || p_keyword || '%')
      )
      AND (p_grade = '' OR u.grade = p_grade)
      AND (p_department = '' OR u.department = p_department);
    
    -- 返回结果
    RETURN QUERY
    SELECT 
        jsonb_build_object(
            'students', (
                SELECT COALESCE(jsonb_agg(
                    jsonb_build_object(
                        'id', u.id,
                        'username', u.username,
                        'email', u.email,
                        'user_number', u.user_number,
                        'full_name', u.full_name,
                        'phone', u.phone,
                        'department', u.department,
                        'grade', u.grade,
                        'class_name', u.class_name,
                        'status', u.status,
                        'created_at', u.created_at,
                        'updated_at', u.updated_at,
                        'role', jsonb_build_object(
                            'id', r.id,
                            'role_name', r.role_name,
                            'role_description', r.role_description,
                            'is_system_default', r.is_system_default,
                            'created_at', r.created_at,
                            'updated_at', r.updated_at
                        )
                    )
                ), '[]'::jsonb)
                FROM users u
                LEFT JOIN roles r ON u.role_id = r.id
                WHERE u.role_id = '3'
                  AND u.status = 'active'
                  AND NOT EXISTS (
                      SELECT 1 FROM teacher_students ts 
                      WHERE ts.student_id = u.id
                  )
                  AND (
                      p_keyword = '' OR 
                      LOWER(u.full_name) LIKE LOWER('%' || p_keyword || '%') OR
                      LOWER(u.user_number) LIKE LOWER('%' || p_keyword || '%') OR
                      LOWER(u.email) LIKE LOWER('%' || p_keyword || '%')
                  )
                  AND (p_grade = '' OR u.grade = p_grade)
                  AND (p_department = '' OR u.department = p_department)
                ORDER BY u.created_at DESC
                LIMIT p_limit OFFSET v_offset
            ),
            'total_count', v_total_count
        ) as students,
        v_total_count as total_count;
END;
$$;

-- 授权
GRANT EXECUTE ON FUNCTION get_available_students_for_import TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_students_for_import TO anon;

-- 注释
COMMENT ON FUNCTION get_available_students_for_import IS '修复JSON解析问题的版本，确保返回格式一致';