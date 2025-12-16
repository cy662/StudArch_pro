-- 最终修复脚本：确保全局学生导入控制正常工作

-- 1. 删除可能存在的旧函数
DROP FUNCTION IF EXISTS get_available_students_for_import(UUID,TEXT,TEXT,TEXT,INTEGER,INTEGER) CASCADE;

-- 2. 创建新的获取可导入学生列表的函数（确保排除已被任何教师导入的学生）
CREATE OR REPLACE FUNCTION get_available_students_for_import(
    p_teacher_id UUID,
    p_keyword TEXT DEFAULT '',
    p_grade TEXT DEFAULT '',
    p_department TEXT DEFAULT '',
    p_page INTEGER DEFAULT 1,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    students JSONB,
    total_count BIGINT
)
AS $$
DECLARE
    v_offset INTEGER := (p_page - 1) * p_limit;
BEGIN
    RETURN QUERY
    WITH available_students AS (
        SELECT 
            u.id,
            u.username,
            u.email,
            u.user_number,
            u.full_name,
            u.phone,
            u.department,
            u.grade,
            u.class_name,
            u.status,
            r.id as role_id,
            r.role_name,
            r.role_description
        FROM users u
        JOIN roles r ON u.role_id = r.id
        -- 关键：排除已被任何教师关联的学生
        WHERE u.role_id = 3  -- 学生角色
        AND u.status = 'active'
        AND u.id NOT IN (
            SELECT DISTINCT student_id 
            FROM teacher_students 
            WHERE student_id IS NOT NULL
        )
        AND (p_keyword = '' OR 
             u.full_name ILIKE '%' || p_keyword || '%' OR 
             u.user_number ILIKE '%' || p_keyword || '%' OR
             u.email ILIKE '%' || p_keyword || '%')
        AND (p_grade = '' OR u.grade ILIKE '%' || p_grade || '%')
        AND (p_department = '' OR u.department ILIKE '%' || p_department || '%')
        ORDER BY u.created_at DESC
        LIMIT p_limit
        OFFSET v_offset
    )
    SELECT 
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id', s.id,
                    'username', s.username,
                    'email', s.email,
                    'user_number', s.user_number,
                    'full_name', s.full_name,
                    'phone', s.phone,
                    'department', s.department,
                    'grade', s.grade,
                    'class_name', s.class_name,
                    'status', s.status,
                    'role', jsonb_build_object(
                        'id', s.role_id,
                        'role_name', s.role_name,
                        'role_description', s.role_description
                    )
                )
            ) FILTER (WHERE s.id IS NOT NULL),
            '[]'::jsonb
        ) as students,
        (SELECT COUNT(*) 
         FROM users u2
         JOIN roles r2 ON u2.role_id = r2.id
         WHERE u2.role_id = 3  -- 学生角色
         AND u2.status = 'active'
         AND u2.id NOT IN (
             SELECT DISTINCT student_id 
             FROM teacher_students 
             WHERE student_id IS NOT NULL
         )
         AND (p_keyword = '' OR 
              u2.full_name ILIKE '%' || p_keyword || '%' OR 
              u2.user_number ILIKE '%' || p_keyword || '%' OR
              u2.email ILIKE '%' || p_keyword || '%')
         AND (p_grade = '' OR u2.grade ILIKE '%' || p_grade || '%')
         AND (p_department = '' OR u2.department ILIKE '%' || p_department || '%')
        ) as total_count
    FROM available_students s;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 授权执行权限
GRANT EXECUTE ON FUNCTION get_available_students_for_import(UUID,TEXT,TEXT,TEXT,INTEGER,INTEGER) TO authenticated;

-- 4. 验证函数创建成功
SELECT '✅ 函数创建完成' as status;

-- 5. 测试函数（请将教师ID替换为实际的教师ID）
-- SELECT * FROM get_available_students_for_import('实际教师ID'::UUID, '', '', '', 1, 10);